import { logActivity } from "../firebase.js";
import {
  collocationTeamTotalPoints,
  evaluateCollocationTeamAnswer,
  getCollocationLiveRound,
} from "../components/vocabulary/collocations/collocationTeamLive.js";

const loggedParticipation = new Set();

export function getCollocationLiveActivityDetails(game, gameId, teamId) {
  return {
    gameId,
    pin: game.pin || null,
    activityTitle: game.title || "Collocation Team Challenge",
    activityType: "collocation-team",
    setCount: (game.items || []).length,
    playerCount: Object.keys(game.players || {}).length,
    teamCount: Object.values(game.teams || {}).filter((team) => team.memberUids?.length).length,
    ...(teamId ? {
      teamId,
      teamName: game.teams?.[teamId]?.name || teamId,
      points: collocationTeamTotalPoints(game, teamId),
      possiblePoints: (game.items || []).length * 100,
    } : {}),
  };
}

export async function logCollocationLiveActivity(event, details) {
  try {
    await logActivity(`collocation_live_${event}`, details);
  } catch (error) {
    // An unavailable activity log must never interrupt the live lesson.
    console.error("[CollocationTeamLive] activity logging failed", error);
  }
}

export function trackCollocationLiveParticipation(game, gameId, uid, storage) {
  const teamId = game?.players?.[uid]?.teamId;
  if (!uid || !teamId || !game?.teams?.[teamId]) return;
  const details = getCollocationLiveActivityDetails(game, gameId, teamId);
  const round = getCollocationLiveRound(game, teamId);
  const once = (event, eventDetails, suffix = "") => {
    const key = `collocation-live:${gameId}:${uid}:${event}:${suffix}`;
    if (loggedParticipation.has(key)) return;
    try {
      const store = storage || globalThis.localStorage;
      if (store?.getItem(key)) return;
      store?.setItem(key, "1");
    } catch { /* Private browsing may disable storage; the in-memory guard still works. */ }
    loggedParticipation.add(key);
    void logCollocationLiveActivity(event, eventDetails);
  };
  if (game.status === "in-progress") once("participation_started", details);
  if (round.isReveal && round.hasTask) {
    const answer = game[round.isReview ? "reviewAnswers" : "teamAnswers"]?.[teamId]?.[round.itemIndex];
    const result = evaluateCollocationTeamAnswer(game, teamId, round.itemIndex, answer?.selectedWords || [], round.isReview);
    once("round_completed", {
      ...details,
      review: round.isReview,
      itemIndex: round.itemIndex,
      prompt: round.item.prompt || "",
      score: result.score,
      possibleScore: result.possibleScore,
      percentage: result.percentage,
      roundPoints: result.points,
      submissionMode: answer?.submissionMode || (answer ? "manual" : "unanswered"),
      wasCaptain: answer?.submittedBy === uid,
    }, `${round.isReview ? "review" : "main"}:${round.itemIndex}`);
  }
  if (game.status === "finished") once("participation_completed", details);
}
