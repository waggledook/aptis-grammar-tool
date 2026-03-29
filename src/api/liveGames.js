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

const SPANGLISH_GUEST_STORAGE_KEY = "spanglish_fixit_guest_id";
const SPANGLISH_GUEST_TOKEN_STORAGE_KEY = "spanglish_fixit_guest_token";

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

export async function findPublicGameByPin(pin) {
  const pinRef = ref(rtdb, `liveGamePins/${String(pin).trim()}`);
  const pinSnap = await get(pinRef);
  if (!pinSnap.exists()) return null;

  const pinData = pinSnap.val();
  const gameId = pinData?.gameId;
  if (!gameId) return null;

  const gameRef = ref(rtdb, `liveGames/${gameId}`);
  const gameSnap = await get(gameRef);
  if (!gameSnap.exists()) return null;

  return { gameId, ...gameSnap.val() };
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
    if (typeof partialState.roundIndex === "number") {
      updates.roundIndex = partialState.roundIndex;
    }
    if (typeof partialState.clickDuration === "number") {
      updates.clickDuration = partialState.clickDuration;
    }
    if (typeof partialState.correctionDuration === "number") {
      updates.correctionDuration = partialState.correctionDuration;
    }
    if ("scoreDeadline" in partialState) {
      updates.scoreDeadline = partialState.scoreDeadline;
    }
    if ("questionDeadline" in partialState) {
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

export function getSpanglishGuestPlayerId() {
  if (typeof window === "undefined") return null;
  let playerId = window.localStorage.getItem(SPANGLISH_GUEST_STORAGE_KEY);
  if (playerId) return playerId;

  if (window.crypto?.randomUUID) {
    playerId = `guest_${window.crypto.randomUUID()}`;
  } else {
    playerId = `guest_${Math.random().toString(36).slice(2, 10)}`;
  }

  window.localStorage.setItem(SPANGLISH_GUEST_STORAGE_KEY, playerId);
  return playerId;
}

export function getSpanglishGuestPlayerToken() {
  if (typeof window === "undefined") return null;
  let token = window.localStorage.getItem(SPANGLISH_GUEST_TOKEN_STORAGE_KEY);
  if (token) return token;

  if (window.crypto?.randomUUID) {
    token = `token_${window.crypto.randomUUID()}`;
  } else {
    token = `token_${Math.random().toString(36).slice(2, 14)}`;
  }

  window.localStorage.setItem(SPANGLISH_GUEST_TOKEN_STORAGE_KEY, token);
  return token;
}

export async function createSpanglishLiveGame({
  items,
  title = "Spanglish Fix-It",
  clickDuration = 25,
  correctionDuration = 25,
}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to host a live game.");
  }
  if (!Array.isArray(items) || !items.length) {
    throw new Error("createSpanglishLiveGame: items are required.");
  }

  const gameRef = push(ref(rtdb, "liveGames"));
  const gameId = gameRef.key;
  const pin = generatePin();
  const now = Date.now();

  const initialData = {
    ownerUid: user.uid,
    pin,
    title,
    type: "spanglish_fixit",
    publicJoinEnabled: true,
    createdAt: now,
    status: "lobby",
    items,
    state: {
      phase: "lobby",
      roundIndex: 0,
      clickDuration,
      correctionDuration,
      questionDeadline: null,
    },
  };

  await set(gameRef, initialData);
  await set(ref(rtdb, `liveGamePins/${pin}`), {
    gameId,
    type: "spanglish_fixit",
    publicJoinEnabled: true,
    status: "lobby",
  });
  return { gameId, pin };
}

export async function joinPublicSpanglishGameByPin({ pin, name, playerId, playerToken }) {
  const trimmedPin = String(pin || "").trim();
  const trimmedName = String(name || "").trim();
  const stablePlayerId = String(playerId || "").trim() || getSpanglishGuestPlayerId();
  const stablePlayerToken = String(playerToken || "").trim() || getSpanglishGuestPlayerToken();

  if (!trimmedPin) throw new Error("Please enter the game PIN.");
  if (!trimmedName) throw new Error("Please enter your name.");
  if (!stablePlayerId) throw new Error("Could not create a guest player id.");
  if (!stablePlayerToken) throw new Error("Could not create a guest player token.");

  const game = await findPublicGameByPin(trimmedPin);
  if (!game) {
    throw new Error("No game found with that PIN.");
  }
  if (game.type !== "spanglish_fixit" || !game.publicJoinEnabled) {
    throw new Error("That PIN is not for an open Spanglish game.");
  }
  if (game.status === "finished") {
    throw new Error("This game has already finished.");
  }

  const playerRef = ref(rtdb, `liveGames/${game.gameId}/players/${stablePlayerId}`);
  const existingPlayerSnap = await get(playerRef);
  const existingPlayer = existingPlayerSnap.exists() ? existingPlayerSnap.val() : null;

  await set(playerRef, {
    name: trimmedName,
    isGuest: true,
    score: existingPlayer?.score || 0,
    joinedAt: existingPlayer?.joinedAt || Date.now(),
    lastActiveAt: Date.now(),
    playerToken: existingPlayer?.playerToken || stablePlayerToken,
  });

  return { gameId: game.gameId, playerId: stablePlayerId, playerToken: existingPlayer?.playerToken || stablePlayerToken };
}

export async function submitSpanglishLiveClick({
  gameId,
  roundIndex,
  playerId,
  playerToken,
  selectedWord,
  correct,
  scoreDelta = 0,
}) {
  if (!gameId || typeof roundIndex !== "number" || !playerId) {
    throw new Error("Missing click answer details.");
  }

  const answerRef = ref(
    rtdb,
    `liveGames/${gameId}/rounds/${roundIndex}/clickAnswers/${playerId}`
  );
  const playerRef = ref(rtdb, `liveGames/${gameId}/players/${playerId}`);
  const now = Date.now();
  const safeDelta = correct ? Math.max(0, scoreDelta || 0) : 0;

  await set(answerRef, {
    selectedWord,
    correct: !!correct,
    timestamp: now,
    scoreDelta: safeDelta,
    playerToken,
  });

  await runTransaction(playerRef, (current) => {
    const base = current || {
      name: "Guest",
      score: 0,
      isGuest: true,
      joinedAt: now,
      playerToken,
    };

    return {
      ...base,
      score: (base.score || 0) + safeDelta,
      lastActiveAt: now,
      lastClickWord: selectedWord,
      lastClickCorrect: !!correct,
      playerToken: base.playerToken || playerToken,
    };
  });
}

export async function submitSpanglishLiveCorrection({
  gameId,
  roundIndex,
  playerId,
  playerToken,
  answer,
  correct,
  scoreDelta = 0,
}) {
  if (!gameId || typeof roundIndex !== "number" || !playerId) {
    throw new Error("Missing correction details.");
  }

  const answerRef = ref(
    rtdb,
    `liveGames/${gameId}/rounds/${roundIndex}/correctionAnswers/${playerId}`
  );
  const playerRef = ref(rtdb, `liveGames/${gameId}/players/${playerId}`);
  const now = Date.now();
  const safeDelta = correct ? Math.max(0, scoreDelta || 0) : 0;

  await set(answerRef, {
    answer,
    correct: !!correct,
    timestamp: now,
    scoreDelta: safeDelta,
    playerToken,
  });

  await runTransaction(playerRef, (current) => {
    const base = current || {
      name: "Guest",
      score: 0,
      isGuest: true,
      joinedAt: now,
      playerToken,
    };

    return {
      ...base,
      score: (base.score || 0) + safeDelta,
      lastActiveAt: now,
      lastCorrection: answer,
      lastCorrectionCorrect: !!correct,
      playerToken: base.playerToken || playerToken,
    };
  });
}
