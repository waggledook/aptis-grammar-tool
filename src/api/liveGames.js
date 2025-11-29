// src/api/liveGames.js
//
// Helpers for live multiplayer games using Realtime Database.
// - All functions assume the user is signed in (auth != null).
// - We use /liveGames/{gameId} as the root for each game.
//
// Data shape per game:
// liveGames: {
//   [gameId]: {
//     ownerUid, pin, setId, type,
//     status: "lobby" | "in-progress" | "finished",
//     state: { phase: "lobby" | "question" | "reveal" | "finished", questionIndex },
//     players: { [uid]: { name, score, ... } },
//     answers: { [questionIndex]: { [uid]: { selectedIndex, correct, answeredAt } } }
//   }
// }

import { auth, rtdb } from "../firebase";
import {
  ref,
  push,
  set,
  get,
  query,
  orderByChild,
  equalTo,
  update,
  runTransaction,
} from "firebase/database";

// 6-digit PIN like "742190"
function generatePin() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return String(n);
}

/**
 * Create a new live game for a given grammar/vocab set.
 * Returns { gameId, pin }.
 */
export async function createLiveGame({ setId, type = "grammar" }) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to host a live game.");
  }
  if (!setId) {
    throw new Error("createLiveGame: setId is required.");
  }

  const gameRef = push(ref(rtdb, "liveGames"));
  const gameId = gameRef.key;
  const pin = generatePin();
  const now = Date.now();

  const initialData = {
    ownerUid: user.uid,
    setId,
    type,               // "grammar" | "vocab"
    pin,
    status: "lobby",    // lobby until teacher presses Start
    createdAt: now,
    state: {
      phase: "lobby",
      questionIndex: 0,
      questionDuration: 20,   // 👈 default 20 seconds per question
      questionDeadline: null, // ms timestamp, set when question starts
    },
  };  

  await set(gameRef, initialData);
  return { gameId, pin };
}

/**
 * Find a live game by its PIN.
 * Returns { gameId, ...data } or null.
 */
export async function findGameByPin(pin) {
  const gamesRef = ref(rtdb, "liveGames");
  const q = query(gamesRef, orderByChild("pin"), equalTo(String(pin)));
  const snap = await get(q);
  if (!snap.exists()) return null;

  const [gameId, data] = Object.entries(snap.val())[0];
  return { gameId, ...data };
}

/**
 * Join a live game using a PIN.
 * Uses the current user's UID as the player id.
 * Returns { gameId } on success.
 */
export async function joinLiveGameByPin(pin) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to join a live game.");
  }

  const game = await findGameByPin(pin);
  if (!game) {
    throw new Error("No game found with that PIN.");
  }
  if (game.status !== "lobby") {
    throw new Error("This game has already started or finished.");
  }

  const uid = user.uid;
  const playerRef = ref(rtdb, `liveGames/${game.gameId}/players/${uid}`);

  const displayName =
    user.displayName || user.email || "Player";

  await set(playerRef, {
    name: displayName,
    score: 0,
    joinedAt: Date.now(),
    answeredThisQuestion: false,
    lastAnswerIndex: null,
    lastAnswerCorrect: null,
  });

  return { gameId: game.gameId };
}

/**
 * Host-only: update high-level game status.
 * e.g. setLiveGameStatus(gameId, "in-progress") or "finished".
 */
export async function setLiveGameStatus(gameId, status) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to control a live game.");
  }
  const statusRef = ref(rtdb, `liveGames/${gameId}/status`);
  await set(statusRef, status);
}

/**
 * Host-only: update the current game state.
 * Pass a partial object, e.g. { phase: "question", questionIndex: 3 }.
 */
export async function setLiveGameState(gameId, partialState) {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("You must be signed in to control a live game.");
    }
    const stateRef = ref(rtdb, `liveGames/${gameId}/state`);
  
    const updates = {};
    if (partialState.phase) {
      updates.phase = partialState.phase;
    }
    if (typeof partialState.questionIndex === "number") {
      updates.questionIndex = partialState.questionIndex;
    }
    if (typeof partialState.questionDuration === "number") {
      updates.questionDuration = partialState.questionDuration;
    }
    if (partialState.questionDeadline) {
      updates.questionDeadline = partialState.questionDeadline;
    }
  
    if (Object.keys(updates).length === 0) return;
    await update(stateRef, updates);
  }
  

/**
 * Player: submit an answer for the current question.
 * We also bump the player's score using a simple scheme.
 *
 * Params:
 * - gameId
 * - questionIndex (number)
 * - selectedIndex (number)
 * - correct (boolean)
 */

// ...

export async function submitLiveGameAnswer({
  gameId,
  questionIndex,
  selectedIndex,
  correct,
  scoreDelta,
}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to answer.");
  }
  const uid = user.uid;

  const answerRef = ref(
    rtdb,
    `liveGames/${gameId}/answers/${questionIndex}/${uid}`
  );
  const playerRef = ref(rtdb, `liveGames/${gameId}/players/${uid}`);

  const now = Date.now();
  const safeDelta = correct ? Math.max(0, scoreDelta || 0) : 0;

  // 1) Save the answer for this question
  await set(answerRef, {
    selectedIndex,
    correct: !!correct,
    timestamp: now,
    scoreDelta: safeDelta,
  });

  // 2) Update the player's score & last answer via transaction
  await runTransaction(playerRef, (current) => {
    if (current == null) {
      current = {
        name: user.displayName || "Player",
        score: 0,
      };
    }

    const prevScore = current.score || 0;

    return {
      ...current,
      score: prevScore + safeDelta,
      lastAnswerIndex: selectedIndex,
      lastAnswerCorrect: !!correct,
    };
  });
}
