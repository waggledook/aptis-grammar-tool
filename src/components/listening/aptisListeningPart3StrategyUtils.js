import { APTIS_OPINION_STRATEGY_GAME_TYPE, getAptisOpinionStrategyExtract, selectAptisOpinionStrategyExtracts } from "./aptisListeningPart3StrategyData.js";
import { hasOpinion } from "./aptisListeningPart3LiveUtils.js";

export const OPINION_STRATEGY_PHASES = { lobby: "Waiting to begin", preview: "Read the opinion", first: "First listening", compare: "Compare your evidence", second: "Second listening", script: "Check the unmarked transcript", review: "Answer and evidence", finished: "Lesson complete" };
export const OPINION_STRATEGY_RESPONSE_STAGES = ["first", "second", "script"];

// Evidence belongs to a specific turn and opinion, never to every matching string in the extract.
export function opinionStrategyEvidenceRanges(extract, statementKey, lineIndex) {
  const statement = extract.statements.find((item) => item.key === statementKey);
  const line = extract.script[lineIndex];
  if (!statement || !line) return [];
  return statement.evidence.filter((item) => item.lineIndex === lineIndex && item.speaker === line.speaker)
    .map((item) => ({ ...item, start: line.text.indexOf(item.quote), end: line.text.indexOf(item.quote) + item.quote.length }))
    .filter((item) => item.start >= 0)
    .sort((a, b) => a.start - b.start || b.end - a.end);
}

export function currentOpinionStrategyExtract(state) {
  return selectAptisOpinionStrategyExtracts(state?.extractIds)[Number(state?.extractIndex || 0)] || null;
}

export function nextOpinionStrategyState(state, action = "next") {
  const selected = selectAptisOpinionStrategyExtracts(state.extractIds);
  const index = Number(state.extractIndex || 0);
  const phase = state.phase || "lobby";
  if (!selected.length || !Number.isInteger(index) || !selected[index]) throw new Error("Select an available extract.");
  if (phase === "finished") throw new Error("This lesson has finished.");
  if (!["next", "skip", "finish", "script"].includes(action) || (action === "script" && phase !== "second") || (action === "skip" && phase === "lobby")) throw new Error("That step is not available now.");
  if (action === "finish") return { ...state, phase: "finished", audioStage: "idle" };
  if (action === "skip" || phase === "review") {
    return {
      ...state,
      completedIds: [...new Set([...(state.completedIds || []), ...(phase === "review" ? [selected[index].id] : [])])],
      skippedIds: [...new Set([...(state.skippedIds || []), ...(action === "skip" && phase !== "review" ? [selected[index].id] : [])])],
      extractIndex: index + 1 < selected.length ? index + 1 : index,
      phase: index + 1 < selected.length ? "preview" : "finished",
      audioStage: "idle",
    };
  }
  const next = { lobby: "preview", preview: "first", first: "compare", compare: "second", second: action === "script" ? "script" : "review", script: "review" }[phase];
  if (!next) throw new Error("That step is not available now.");
  return { ...state, phase: next, audioStage: "idle" };
}

export function opinionStrategyResponsePayload(extract, answers = {}, confidence = "unsure") {
  return {
    answers: Object.fromEntries(extract.statements.map((statement) => [statement.key, hasOpinion(answers?.[statement.key]) ? answers[statement.key] : ""])),
    confidence: confidence === "sure" ? "sure" : "unsure",
  };
}

export function opinionStrategyStageScore(extracts, player, stage) {
  let correct = 0;
  let total = 0;
  for (const extract of extracts) {
    const response = player?.strategyResponses?.[extract.id]?.[stage];
    if (!response) continue;
    total += extract.statements.length;
    correct += extract.statements.filter((statement) => response.answers?.[statement.key] === statement.answer).length;
  }
  return { correct, total };
}

export function opinionStrategyAnswerGroups(extract, players, stage) {
  return extract.statements.map((statement) => {
    const groups = new Map();
    let submitted = 0;
    for (const player of players) {
      const response = player.strategyResponses?.[extract.id]?.[stage];
      if (!response) continue;
      submitted += 1;
      const value = hasOpinion(response.answers?.[statement.key]) ? response.answers[statement.key] : "";
      groups.set(value, (groups.get(value) || 0) + 1);
    }
    return { statement, submitted, missing: players.length - submitted, groups: [...groups].map(([answer, count]) => ({ answer, count })).sort((a, b) => b.count - a.count) };
  });
}

export function assertOpinionStrategySubmission(game, uid, extractId, stage) {
  if (!uid || !game?.players?.[uid]) throw new Error("Join the lesson before answering.");
  const extract = getAptisOpinionStrategyExtract(extractId);
  if (game.type !== APTIS_OPINION_STRATEGY_GAME_TYPE || !extract || game.status !== "in-progress" || !OPINION_STRATEGY_RESPONSE_STAGES.includes(stage) || game.state?.phase !== stage || currentOpinionStrategyExtract(game.state)?.id !== extractId) throw new Error("The teacher has moved on. This answer stage is not open.");
  return extract;
}
