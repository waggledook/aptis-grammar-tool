import { get, push, ref, runTransaction, set, update } from "firebase/database";
import { auth, rtdb } from "../firebase.js";
import { APTIS_OPINION_STRATEGY_GAME_TYPE, APTIS_OPINION_STRATEGY_TITLE, selectAptisOpinionStrategyExtracts } from "../components/listening/aptisListeningPart3StrategyData.js";
import { assertOpinionStrategySubmission, nextOpinionStrategyState, opinionStrategyResponsePayload } from "../components/listening/aptisListeningPart3StrategyUtils.js";

async function readRoom(gameId) {
  if (!auth.currentUser) throw new Error("Sign in to use the live lesson.");
  if (!gameId) throw new Error("Lesson not found.");
  const snapshot = await get(ref(rtdb, `liveGames/${gameId}`));
  const game = snapshot.val();
  if (!game || game.type !== APTIS_OPINION_STRATEGY_GAME_TYPE) throw new Error("Lesson not found.");
  return game;
}

export async function createOpinionStrategyLiveGame({ extractIds }) {
  if (!auth.currentUser) throw new Error("Sign in to host a lesson.");
  const extracts = selectAptisOpinionStrategyExtracts(extractIds);
  if (!extracts.length) throw new Error("Select at least one extract.");
  const gameRef = push(ref(rtdb, "liveGames"));
  const pin = String(Math.floor(100000 + Math.random() * 900000));
  await set(gameRef, {
    ownerUid: auth.currentUser.uid, pin, title: APTIS_OPINION_STRATEGY_TITLE,
    type: APTIS_OPINION_STRATEGY_GAME_TYPE, site: "aptis", taskId: "listening-part3-opinion-training", status: "lobby", createdAt: Date.now(),
    state: { phase: "lobby", extractIds: extracts.map((extract) => extract.id), extractIndex: 0, audioStage: "idle" },
  });
  return { gameId: gameRef.key, pin };
}

export async function advanceOpinionStrategyLive({ gameId, expectedPhase, expectedIndex, action = "next" }) {
  const game = await readRoom(gameId);
  if (game.ownerUid !== auth.currentUser.uid) throw new Error("Only the teacher can move the lesson on.");
  if (expectedPhase === "lobby" && action === "next" && !Object.keys(game.players || {}).length) throw new Error("Wait for at least one student to join.");
  const result = await runTransaction(ref(rtdb, `liveGames/${gameId}/state`), (state) => {
    if (!state || state.phase !== expectedPhase || Number(state.extractIndex || 0) !== expectedIndex) return;
    return nextOpinionStrategyState(state, action);
  });
  if (!result.committed) throw new Error("The lesson has moved on. Use the current controls.");
  await update(ref(rtdb, `liveGames/${gameId}`), { status: result.snapshot.val().phase === "finished" ? "finished" : "in-progress" });
}

export async function setOpinionStrategyAudio({ gameId, expectedPhase, expectedIndex, audioStage }) {
  const game = await readRoom(gameId);
  if (game.ownerUid !== auth.currentUser.uid) throw new Error("Only the teacher can control the recording.");
  const result = await runTransaction(ref(rtdb, `liveGames/${gameId}/state`), (state) => {
    if (!state || state.phase !== expectedPhase || Number(state.extractIndex || 0) !== expectedIndex) return;
    return { ...state, audioStage: audioStage === "playing" ? "playing" : "idle" };
  });
  if (!result.committed) throw new Error("The lesson has moved on.");
}

export async function submitOpinionStrategyResponse({ gameId, extractId, stage, answers, confidence }) {
  const game = await readRoom(gameId);
  const uid = auth.currentUser.uid;
  const extract = assertOpinionStrategySubmission(game, uid, extractId, stage);
  const payload = { ...opinionStrategyResponsePayload(extract, answers, confidence), submittedAt: Date.now() };
  // A later listen or transcript check has its own record, never replacing a first attempt.
  const result = await runTransaction(ref(rtdb, `liveGames/${gameId}/players/${uid}/strategyResponses/${extractId}/${stage}`), (current) => current ? undefined : payload);
  if (!result.committed) throw new Error("You have already submitted this stage.");
}
