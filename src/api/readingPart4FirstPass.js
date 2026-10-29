import { get, ref, runTransaction, update } from "firebase/database";
import { auth, rtdb, logAptisReadingLiveStarted, logAptisReadingLiveReviewStarted, logAptisReadingLiveFinished } from "../firebase.js";
import { getReadingPart4TeacherTask, READING_PART4_LIVE_GAME_TYPE } from "../reading/readingPart4TaskBanks.js";
import { firstPassPlayers, firstPassResponses, nextFirstPassState } from "../reading/readingPart4FirstPass.js";
import { getRealtimeServerTimeOffset } from "../utils/realtimeServerTime.js";
import { saveReadingPart4LiveProgress } from "./liveGames.js";

async function getSession(gameId, hostOnly = false) {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in to use this reading lesson.");
  if (!gameId) throw new Error("Missing reading room.");
  const game = (await get(ref(rtdb, `liveGames/${gameId}`))).val();
  const task = getReadingPart4TeacherTask(game?.taskId);
  if (!game || game.type !== READING_PART4_LIVE_GAME_TYPE || task?.activityMode !== "first-pass") throw new Error("First-pass reading lesson not found.");
  if (hostOnly ? game.ownerUid !== user.uid : !game.players?.[user.uid]) throw new Error(hostOnly ? "Only the teacher can control this lesson." : "Join the room before answering.");
  return { game, task, user };
}

export async function advanceReadingPart4FirstPass({ gameId, expectedPhase, expectedParagraphIndex }) {
  const { game, task } = await getSession(gameId, true);
  const now = Date.now() + await getRealtimeServerTimeOffset(rtdb);
  const next = nextFirstPassState(task, game.state, now);
  if (next.phase === "paragraph_review") {
    const paragraphId = task.paragraphs[next.paragraphIndex].id;
    next.sharedMainIdeaUids = firstPassPlayers(game).filter((player) => firstPassResponses(player, paragraphId).mainIdea?.text).slice(0, 3).map((player) => player.uid);
  }
  const result = await runTransaction(ref(rtdb, `liveGames/${gameId}/state`), (current) => {
    if (!current || current.phase !== expectedPhase || (Number(current.paragraphIndex) || 0) !== expectedParagraphIndex) return;
    return { ...current, ...next };
  }, { applyLocally: false });
  if (!result.committed) throw new Error("The lesson has moved on. Please use the current stage.");
  if (expectedPhase === "lobby" || next.phase === "finished") await update(ref(rtdb, `liveGames/${gameId}`), { status: next.phase === "finished" ? "finished" : "in-progress" });
  const log = expectedPhase === "lobby" ? logAptisReadingLiveStarted : next.phase === "review" ? logAptisReadingLiveReviewStarted : next.phase === "finished" ? logAptisReadingLiveFinished : null;
  if (log) void log({ gameId, pin: game.pin, activityType: "reading-task", activityTitle: game.title, part: 4, taskId: task.id, taskIds: [task.id], taskCount: 1, playerCount: Object.keys(game.players || {}).length, mode: "first-pass" }).catch((error) => console.error("First-pass lesson activity log failed", error));
}

export async function setReadingPart4FirstPassTiming({ gameId, mainIdeaSeconds, headingSeconds }) {
  const { game } = await getSession(gameId, true);
  if (game.state?.phase !== "lobby") throw new Error("Choose timings before the lesson starts.");
  if (![60, 75, 90].includes(mainIdeaSeconds) || ![20, 25, 30].includes(headingSeconds)) throw new Error("Choose one of the suggested classroom timings.");
  await update(ref(rtdb, `liveGames/${gameId}/state`), { mainIdeaSeconds, headingSeconds });
}

export async function submitReadingPart4FirstPassResponse({ gameId, paragraphId, kind, text, selectedIndex }) {
  const { game, task, user } = await getSession(gameId);
  const paragraph = task.paragraphs[Number(game.state?.paragraphIndex) || 0];
  const expectedPhase = kind === "mainIdea" ? "main_idea" : kind === "heading" ? "heading_choice" : "";
  if (!expectedPhase || game.status !== "in-progress" || game.state?.phase !== expectedPhase || paragraph?.id !== paragraphId) throw new Error("This response is not open for submission now.");
  let response;
  if (kind === "mainIdea") {
    const cleanText = String(text || "").trim();
    if (!cleanText || cleanText.length > 1000) throw new Error("Write a short main idea before submitting (up to 1,000 characters).");
    response = { text: cleanText, submittedAt: Date.now() };
  } else {
    if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= paragraph.roundOptions.length) throw new Error("Choose one of this paragraph’s four headings.");
    response = { selectedIndex, submittedAt: Date.now() };
  }
  const result = await runTransaction(ref(rtdb, `liveGames/${gameId}/players/${user.uid}/readingPart4FirstPass/${paragraphId}/${kind}`), (current) => current ? undefined : response, { applyLocally: false });
  if (!result.committed) throw new Error("Your response has already been submitted.");
}

export async function shareReadingPart4FirstPassResponses({ gameId, uids }) {
  const { game, task } = await getSession(gameId, true);
  const paragraph = task.paragraphs[Number(game.state?.paragraphIndex) || 0];
  const unique = [...new Set(uids || [])];
  if (game.state?.phase !== "paragraph_review" || unique.length > 3 || unique.some((uid) => !firstPassResponses(game.players?.[uid], paragraph.id).mainIdea?.text)) throw new Error("Select up to three submitted main ideas for this paragraph.");
  await update(ref(rtdb, `liveGames/${gameId}/state`), { sharedMainIdeaUids: unique });
}

export async function saveReadingPart4FirstPassFinalAnswers({ gameId, taskId, answers }) {
  const { game, task } = await getSession(gameId);
  if (game.state?.phase !== "final_match" || game.status !== "in-progress" || task.id !== taskId) throw new Error("The final matching review is not open now.");
  return saveReadingPart4LiveProgress({ gameId, taskId, answers });
}
