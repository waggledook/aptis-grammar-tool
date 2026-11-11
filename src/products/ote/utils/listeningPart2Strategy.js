import { getListeningStrategyExtract, selectListeningStrategyExtracts } from "../data/oteListeningPart2Strategy.js";
import { isAdvancedPart2AnswerCorrect, normaliseListeningAnswer } from "./listeningLive.js";

export const STRATEGY_PHASE_LABELS = { lobby: "Waiting to begin", preview: "Read and predict", first: "First listening", compare: "Compare your evidence", second: "Second listening", script: "Check the unmarked script", review: "Answer and evidence", finished: "Lesson complete" };
export const STRATEGY_RESPONSE_STAGES = ["first", "second", "script"];

export function nextListeningStrategyState(state, action = "next") {
  const selected = selectListeningStrategyExtracts(state.extractIds);
  if (!selected.length) throw new Error("Select at least one extract.");
  const index = Number(state.extractIndex || 0);
  const phase = state.phase || "lobby";
  if (!selected[index]) throw new Error("That extract is not available.");
  if (phase === "finished") throw new Error("This lesson has finished.");
  if (!["next", "skip", "finish", "script"].includes(action) || (action === "script" && phase !== "second") || (action === "skip" && phase === "lobby")) throw new Error("That step is not available now.");
  if (action === "finish") return { ...state, phase: "finished", audioStage: "idle" };
  if (action === "skip" || phase === "review") {
    const completedIds = [...new Set([...(state.completedIds || []), ...(phase === "review" ? [selected[index].id] : [])])];
    const skippedIds = [...new Set([...(state.skippedIds || []), ...(action === "skip" && phase !== "review" ? [selected[index].id] : [])])];
    return { ...state, completedIds, skippedIds, extractIndex: index + 1 < selected.length ? index + 1 : index, phase: index + 1 < selected.length ? "preview" : "finished", audioStage: "idle" };
  }
  const next = { lobby: "preview", preview: "first", first: "compare", compare: "second", second: action === "script" ? "script" : "review", script: "review" }[phase];
  if (!next || (action !== "next" && !(phase === "second" && action === "script"))) throw new Error("That step is not available now.");
  return { ...state, phase: next, audioStage: "idle" };
}

export function strategyResponsePayload(extract, answers = {}, confidence = "unsure") {
  return { answers: Object.fromEntries(extract.gaps.map((gap) => [gap.id, String(answers[gap.id] || "").trim().slice(0, 100)])), confidence: confidence === "sure" ? "sure" : "unsure" };
}

export function strategyStageScore(extracts, player, stage) {
  let correct = 0;
  let total = 0;
  for (const extract of extracts) {
    const response = player?.strategyResponses?.[extract.id]?.[stage];
    if (!response) continue;
    total += extract.gaps.length;
    correct += extract.gaps.filter((gap) => isAdvancedPart2AnswerCorrect(gap, response.answers?.[gap.id])).length;
  }
  return { correct, total };
}

export function strategyAnswerGroups(extract, players, stage) {
  return extract.gaps.map((gap) => {
    const groups = new Map();
    let submitted = 0;
    for (const player of players) {
      const response = player.strategyResponses?.[extract.id]?.[stage];
      if (!response) continue;
      submitted += 1;
      const answer = normaliseListeningAnswer(response.answers?.[gap.id]);
      groups.set(answer, (groups.get(answer) || 0) + 1);
    }
    return { gap, submitted, missing: players.length - submitted, groups: [...groups].map(([answer, count]) => ({ answer, count })).sort((a, b) => b.count - a.count) };
  });
}

export function currentListeningStrategyExtract(state) {
  const extracts = selectListeningStrategyExtracts(state?.extractIds);
  return extracts[Number(state?.extractIndex || 0)] || null;
}

export function assertListeningStrategySubmission(game, uid, extractId, stage) {
  if (!game?.players?.[uid]) throw new Error("Join the lesson before answering.");
  const extract = getListeningStrategyExtract(extractId);
  if (!extract || game.status !== "in-progress" || !STRATEGY_RESPONSE_STAGES.includes(stage) || game.state?.phase !== stage || currentListeningStrategyExtract(game.state)?.id !== extractId) throw new Error("The teacher has moved on. This answer stage is not open.");
  return extract;
}
