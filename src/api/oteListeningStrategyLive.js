import { get, push, ref, runTransaction, set, update } from "firebase/database";
import { auth, rtdb } from "../firebase.js";
import { LISTENING_STRATEGY_GAME_TYPE, LISTENING_STRATEGY_TITLE, selectListeningStrategyExtracts } from "../products/ote/data/oteListeningPart2Strategy.js";
import { assertListeningStrategySubmission, nextListeningStrategyState, strategyResponsePayload } from "../products/ote/utils/listeningPart2Strategy.js";

async function readRoom(gameId) {
  if (!auth.currentUser) throw new Error("Sign in to use the live lesson.");
  if (!gameId) throw new Error("Lesson not found.");
  const snapshot = await get(ref(rtdb, `liveGames/${gameId}`));
  const game = snapshot.val();
  if (!game || game.type !== LISTENING_STRATEGY_GAME_TYPE) throw new Error("Lesson not found.");
  return game;
}

export async function createListeningStrategyLiveGame({ extractIds }) {
  if (!auth.currentUser) throw new Error("Sign in to host a lesson.");
  const extracts = selectListeningStrategyExtracts(extractIds);
  if (!extracts.length) throw new Error("Select at least one extract.");
  const gameRef = push(ref(rtdb, "liveGames"));
  const pin = String(Math.floor(100000 + Math.random() * 900000));
  await set(gameRef, {
    ownerUid: auth.currentUser.uid, pin, title: LISTENING_STRATEGY_TITLE,
    type: LISTENING_STRATEGY_GAME_TYPE, site: "ote", taskId: "advanced-listening-part-2-strategy-lesson", status: "lobby", createdAt: Date.now(),
    state: { phase: "lobby", extractIds: extracts.map((extract) => extract.id), extractIndex: 0, audioStage: "idle" },
  });
  return { gameId: gameRef.key, pin };
}

export async function advanceListeningStrategyLive({ gameId, expectedPhase, expectedIndex, action = "next" }) {
  const game = await readRoom(gameId);
  if (game.ownerUid !== auth.currentUser.uid) throw new Error("Only the teacher can move the lesson on.");
  if (expectedPhase === "lobby" && !Object.keys(game.players || {}).length) throw new Error("Wait for at least one student to join.");
  const transaction = await runTransaction(ref(rtdb, `liveGames/${gameId}/state`), (state) => {
    if (!state || state.phase !== expectedPhase || Number(state.extractIndex || 0) !== expectedIndex) return;
    return nextListeningStrategyState(state, action);
  });
  if (!transaction.committed) throw new Error("The lesson has moved on. Use the current controls.");
  const phase = transaction.snapshot.val().phase;
  await update(ref(rtdb, `liveGames/${gameId}`), { status: phase === "finished" ? "finished" : "in-progress" });
}

export async function setListeningStrategyAudio({ gameId, expectedPhase, expectedIndex, audioStage }) {
  const game = await readRoom(gameId);
  if (game.ownerUid !== auth.currentUser.uid) throw new Error("Only the teacher can control the recording.");
  const result = await runTransaction(ref(rtdb, `liveGames/${gameId}/state`), (state) => {
    if (!state || state.phase !== expectedPhase || Number(state.extractIndex || 0) !== expectedIndex) return;
    return { ...state, audioStage: audioStage === "playing" ? "playing" : "idle" };
  });
  if (!result.committed) throw new Error("The lesson has moved on.");
}

export async function submitListeningStrategyResponse({ gameId, extractId, stage, answers, confidence }) {
  const game = await readRoom(gameId);
  const uid = auth.currentUser.uid;
  const extract = assertListeningStrategySubmission(game, uid, extractId, stage);
  const payload = { ...strategyResponsePayload(extract, answers, confidence), submittedAt: Date.now() };
  // A stage is submitted once. Later listening and transcript work have their
  // own records and cannot overwrite the original listening evidence.
  const result = await runTransaction(ref(rtdb, `liveGames/${gameId}/players/${uid}/strategyResponses/${extractId}/${stage}`), (current) => current ? undefined : payload);
  if (!result.committed) throw new Error("You have already submitted this stage.");
}
