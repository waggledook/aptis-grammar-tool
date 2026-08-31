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
//     state: { phase: "lobby" | "task" | "script_check" | "review" | "finished", questionIndex },
//     players: { [uid]: { name, score, ... } },
//     answers: { [questionIndex]: { [uid]: { selectedIndex, correct, answeredAt } } }
//   }
// }

import {
  auth,
  logAptisWritingLiveHosted,
  logAptisWritingLiveJoined,
  rtdb,
} from "../firebase";
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
import {
  OPTION_JURY_GAME_TYPE,
  PART4_EVIDENCE_LIVE_GAME_TYPE,
} from "../products/ote/data/oteAdvancedReadingPart4OptionJury.js";
import {
  COHESION_CHALLENGE_GAME_TYPE,
  COHESION_CHALLENGE_TASK_ID,
} from "../products/ote/data/oteAdvancedReadingCohesionChallenge.js";
import { OTE_LISTENING_LIVE_GAME_TYPE } from "../products/ote/data/oteListeningLive.js";
import {
  FREE_THINGS_LESSON_GAME_TYPE,
  FREE_THINGS_LESSON_TASK_ID,
} from "../products/ote/data/oteAdvancedReadingPart3FreeThingsLesson.js";
import {
  APTIS_WRITING_LIVE_GAME_TYPE,
  APTIS_WRITING_PART1_LIVE_TASK_ID,
  getAptisWritingPart1LiveTask,
  getAptisWritingLiveSuggestedSeconds,
} from "../components/writing/data/aptisWritingTeacherTasks.js";
import {
  REGISTER_SURGERY_EMAILS,
  REGISTER_SURGERY_LIVE_GAME_TYPE,
} from "../components/writing/data/aptisWritingRegisterSurgery.js";
import { PART4_ERROR_DETECTIVE_LIVE_GAME_TYPE } from "../components/writing/data/aptisPart4ErrorBank.js";

const SPANGLISH_GUEST_STORAGE_KEY = "spanglish_fixit_guest_id";
const SPANGLISH_GUEST_TOKEN_STORAGE_KEY = "spanglish_fixit_guest_token";

// 6-digit PIN like "742190"
function generatePin() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return String(n);
}

function getAptisWritingLiveActivityDetails(game, gameId) {
  if (game.type === REGISTER_SURGERY_LIVE_GAME_TYPE) return {
    gameId,
    pin: game.pin || null,
    activityType: "register-surgery",
    activityTitle: game.title || "Register Surgery",
    part: 4,
    taskId: game.taskId || "part4-register-surgery",
  };
  if (game.type === PART4_ERROR_DETECTIVE_LIVE_GAME_TYPE) return {
    gameId,
    pin: game.pin || null,
    activityType: "error-detective",
    activityTitle: game.title || "Error Detective",
    part: 4,
    taskId: game.taskId || "part4-error-detective",
  };
  return {
    gameId,
    pin: game.pin || null,
    activityType: "writing-task",
    activityTitle: game.title || `Aptis Writing Part ${game.part || "?"}`,
    part: Number(game.part) || null,
    taskId: game.taskId || null,
  };
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

  const existingPlayer = (await get(playerRef)).val();
  if (
    game.type === OPTION_JURY_GAME_TYPE ||
    game.type === PART4_EVIDENCE_LIVE_GAME_TYPE ||
    game.type === OTE_LISTENING_LIVE_GAME_TYPE ||
    game.type === COHESION_CHALLENGE_GAME_TYPE ||
    game.type === FREE_THINGS_LESSON_GAME_TYPE ||
    game.type === APTIS_WRITING_LIVE_GAME_TYPE ||
    game.type === REGISTER_SURGERY_LIVE_GAME_TYPE ||
    game.type === PART4_ERROR_DETECTIVE_LIVE_GAME_TYPE
  ) {
    if (!existingPlayer) await set(playerRef, {
      name: displayName,
      joinedAt: Date.now(),
    });
  } else {
    await set(playerRef, {
      name: displayName,
      score: 0,
      joinedAt: Date.now(),
      answeredThisQuestion: false,
      lastAnswerIndex: null,
      lastAnswerCorrect: null,
    });
  }

  if (!existingPlayer && [APTIS_WRITING_LIVE_GAME_TYPE, REGISTER_SURGERY_LIVE_GAME_TYPE, PART4_ERROR_DETECTIVE_LIVE_GAME_TYPE].includes(game.type)) {
    await logAptisWritingLiveJoined(getAptisWritingLiveActivityDetails(game, game.gameId));
  }

  return { gameId: game.gameId, type: game.type || "grammar" };
}

export async function createOptionJuryLiveGame({ taskId, title }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to host an Option Jury session.");
  if (!taskId) throw new Error("createOptionJuryLiveGame: taskId is required.");

  const gameRef = push(ref(rtdb, "liveGames"));
  const gameId = gameRef.key;
  const pin = generatePin();
  await set(gameRef, {
    ownerUid: user.uid,
    pin,
    title: title || "Option Jury",
    type: OPTION_JURY_GAME_TYPE,
    taskId,
    status: "lobby",
    createdAt: Date.now(),
    state: { phase: "lobby", questionIndex: 0 },
  });
  return { gameId, pin };
}

export async function createPart4EvidenceLiveGame({ taskId, title }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to host a Part 4 session.");
  if (!taskId) throw new Error("createPart4EvidenceLiveGame: taskId is required.");

  const gameRef = push(ref(rtdb, "liveGames"));
  const gameId = gameRef.key;
  const pin = generatePin();
  await set(gameRef, {
    ownerUid: user.uid,
    pin,
    title: title || "Part 4 Evidence Reveal",
    type: PART4_EVIDENCE_LIVE_GAME_TYPE,
    taskId,
    status: "lobby",
    createdAt: Date.now(),
    state: { phase: "lobby", questionIndex: 0 },
  });
  return { gameId, pin };
}

export async function createOteListeningLiveGame({ activityId, title }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to host a listening session.");
  if (!activityId) throw new Error("createOteListeningLiveGame: activityId is required.");

  const gameRef = push(ref(rtdb, "liveGames"));
  const gameId = gameRef.key;
  const pin = generatePin();
  await set(gameRef, {
    ownerUid: user.uid,
    pin,
    title: title || "OTE Listening",
    type: OTE_LISTENING_LIVE_GAME_TYPE,
    activityId,
    status: "lobby",
    createdAt: Date.now(),
    state: {
      phase: "lobby",
      questionIndex: 0,
      reviewIndex: 0,
      playCount: 0,
    },
  });
  return { gameId, pin };
}

export async function createCohesionChallengeLiveGame({ title } = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to host a cohesion session.");

  const gameRef = push(ref(rtdb, "liveGames"));
  const gameId = gameRef.key;
  const pin = generatePin();
  await set(gameRef, {
    ownerUid: user.uid,
    pin,
    title: title || "Classroom Cohesion Challenge",
    type: COHESION_CHALLENGE_GAME_TYPE,
    taskId: COHESION_CHALLENGE_TASK_ID,
    status: "lobby",
    createdAt: Date.now(),
    state: {
      phase: "lobby",
      questionIndex: 0,
    },
  });
  return { gameId, pin };
}

export async function createFreeThingsLessonLiveGame({ title } = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to host this lesson.");

  const gameRef = push(ref(rtdb, "liveGames"));
  const gameId = gameRef.key;
  const pin = generatePin();
  await set(gameRef, {
    ownerUid: user.uid,
    pin,
    title: title || "Why Free Things Are Complicated · Live lesson",
    type: FREE_THINGS_LESSON_GAME_TYPE,
    taskId: FREE_THINGS_LESSON_TASK_ID,
    status: "lobby",
    createdAt: Date.now(),
    state: { phase: "lobby", gapIndex: 0, sentenceIndex: 0, reviewIndex: 0 },
  });
  return { gameId, pin };
}

export async function createAptisWritingLiveGame({ part, taskId, title, questionIds = [] }) {
  const user = auth.currentUser;
  const partNumber = Number(part);
  if (!user) throw new Error("You must be signed in to host a writing session.");
  if (![1, 2, 3, 4].includes(partNumber) || !taskId) {
    throw new Error("Choose a valid writing part and task.");
  }
  const partOneTask = partNumber === 1 ? getAptisWritingPart1LiveTask(questionIds) : null;
  if (partNumber === 1 && (taskId !== APTIS_WRITING_PART1_LIVE_TASK_ID || !partOneTask)) {
    throw new Error("Choose five valid Part 1 questions.");
  }

  const gameRef = push(ref(rtdb, "liveGames"));
  const gameId = gameRef.key;
  const pin = generatePin();
  const suggestedSeconds = getAptisWritingLiveSuggestedSeconds(partNumber);
  await set(gameRef, {
    ownerUid: user.uid,
    pin,
    title: title || `Aptis Writing Part ${partNumber}`,
    type: APTIS_WRITING_LIVE_GAME_TYPE,
    taskId,
    part: partNumber,
    ...(partOneTask ? { questionIds: partOneTask.questions.map((question) => question.id) } : {}),
    status: "lobby",
    createdAt: Date.now(),
    state: {
      phase: "lobby",
      writingTimerDuration: suggestedSeconds,
      writingTimerRemaining: suggestedSeconds,
      writingTimerDeadline: null,
      writingTimerStatus: "ready",
    },
  });
  await logAptisWritingLiveHosted({
    gameId,
    pin,
    activityType: "writing-task",
    activityTitle: title || `Aptis Writing Part ${partNumber}`,
    part: partNumber,
    taskId,
  });
  return { gameId, pin };
}

export async function createRegisterSurgeryLiveGame() {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to host Register Surgery.");

  const gameRef = push(ref(rtdb, "liveGames"));
  const gameId = gameRef.key;
  const pin = generatePin();
  await set(gameRef, {
    ownerUid: user.uid,
    pin,
    title: "Aptis Writing Part 4 · Register Surgery",
    type: REGISTER_SURGERY_LIVE_GAME_TYPE,
    taskId: "part4-register-surgery",
    status: "lobby",
    createdAt: Date.now(),
    state: { phase: "lobby" },
  });
  await logAptisWritingLiveHosted({
    gameId,
    pin,
    activityType: "register-surgery",
    activityTitle: "Register Surgery",
    part: 4,
    taskId: "part4-register-surgery",
  });
  return { gameId, pin };
}

export async function createPart4ErrorDetectiveLiveGame() {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to host Error Detective.");
  const gameRef = push(ref(rtdb, "liveGames"));
  const gameId = gameRef.key;
  const pin = generatePin();
  await set(gameRef, {
    ownerUid: user.uid,
    pin,
    title: "Aptis Writing Part 4 · Error Detective",
    type: PART4_ERROR_DETECTIVE_LIVE_GAME_TYPE,
    taskId: "part4-error-detective",
    status: "lobby",
    createdAt: Date.now(),
    state: { phase: "lobby", questionIndex: 0 },
  });
  await logAptisWritingLiveHosted({
    gameId,
    pin,
    activityType: "error-detective",
    activityTitle: "Error Detective",
    part: 4,
    taskId: "part4-error-detective",
  });
  return { gameId, pin };
}

export async function submitPart4ErrorDetectiveLiveAnswer({ gameId, questionId, selectedIndex }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to submit your choice.");
  if (!gameId || !questionId || !Number.isInteger(selectedIndex)) throw new Error("Missing Error Detective answer details.");
  await set(ref(rtdb, `liveGames/${gameId}/players/${user.uid}/errorDetective/${questionId}`), {
    selectedIndex,
    submittedAt: Date.now(),
  });
}

export async function submitPart4ErrorDetectiveLiveCorrection({ gameId, questionId, correction }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to submit your correction.");
  const safeCorrection = String(correction || "").trim().slice(0, 500);
  if (!gameId || !questionId || !safeCorrection) throw new Error("Missing Error Detective correction details.");
  await set(ref(rtdb, `liveGames/${gameId}/players/${user.uid}/errorDetectiveCorrections/${questionId}`), {
    correction: safeCorrection,
    submittedAt: Date.now(),
  });
}

function getRegisterSurgeryTargetIds(kind) {
  return (REGISTER_SURGERY_EMAILS[kind]?.rewrites || []).map((item) => item.id);
}

export async function submitRegisterSurgeryLiveSpot({ gameId, kind, selectedIds }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to submit your choices.");
  if (!gameId || !["informal", "formal"].includes(kind) || !Array.isArray(selectedIds)) {
    throw new Error("Missing Register Surgery selection details.");
  }

  const selectableIds = new Set(
    (REGISTER_SURGERY_EMAILS[kind]?.blocks || [])
      .flatMap((block) => block.chunks || [])
      .filter((chunk) => chunk.selectable)
      .map((chunk) => chunk.id)
  );
  const safeIds = [...new Set(selectedIds)].filter((id) => selectableIds.has(id));
  await set(ref(rtdb, `liveGames/${gameId}/players/${user.uid}/registerSurgery/spot/${kind}`), {
    selectedIds: safeIds,
    submittedAt: Date.now(),
  });
}

export async function submitRegisterSurgeryLiveRewrites({ gameId, kind, rewrites }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to submit your rewrites.");
  if (!gameId || !["informal", "formal"].includes(kind) || !rewrites) {
    throw new Error("Missing Register Surgery rewrite details.");
  }

  const requiredIds = getRegisterSurgeryTargetIds(kind);
  const safeRewrites = Object.fromEntries(requiredIds.map((id) => [id, String(rewrites[id] || "").trim().slice(0, 800)]));
  if (requiredIds.some((id) => !safeRewrites[id])) {
    throw new Error("Write an alternative for every highlighted expression.");
  }

  await set(ref(rtdb, `liveGames/${gameId}/players/${user.uid}/registerSurgery/rewrites/${kind}`), {
    answers: safeRewrites,
    submittedAt: Date.now(),
  });
}

export async function submitAptisWritingLiveResponse({ gameId, part, taskId, answers, counts }) {
  const user = auth.currentUser;
  const partNumber = Number(part);
  if (!user) throw new Error("You must be signed in to submit your writing.");
  if (!gameId || ![1, 2, 3, 4].includes(partNumber) || !taskId || !answers) {
    throw new Error("Missing writing response details.");
  }

  await set(ref(rtdb, `liveGames/${gameId}/players/${user.uid}/writingSubmission`), {
    part: partNumber,
    taskId,
    answers,
    counts: counts || {},
    submittedAt: Date.now(),
  });
}

export async function saveAptisWritingLiveFeedback({ gameId, playerId, taskId, feedback, meta }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to save live writing feedback.");
  if (!gameId || !playerId || !taskId || !feedback) {
    throw new Error("Missing live writing feedback details.");
  }

  await set(ref(rtdb, `liveGames/${gameId}/players/${playerId}/writingFeedback`), {
    taskId,
    feedback,
    meta: meta || {},
    generatedAt: Date.now(),
    generatedBy: user.uid,
  });
}

export async function markFreeThingsLessonPredictionReady({ gameId, gap }) {
  const user = auth.currentUser;
  const safeGap = String(gap);
  if (!user) throw new Error("You must be signed in to take part.");
  if (!gameId || !["1", "2", "3", "4", "5", "6"].includes(safeGap)) {
    throw new Error("Invalid lesson gap.");
  }
  await set(ref(rtdb, `liveGames/${gameId}/predictionReady/${safeGap}/${user.uid}`), {
    readyAt: Date.now(),
  });
}

export async function submitFreeThingsLessonPlacements({ gameId, answers }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to submit answers.");
  const gaps = ["1", "2", "3", "4", "5", "6"];
  const values = gaps.map((gap) => answers?.[gap]);
  if (!gameId || values.some((value) => !["A", "B", "C", "D", "E", "F", "G"].includes(value)) || new Set(values).size !== 6) {
    throw new Error("Place one different sentence in each of the six gaps.");
  }
  await set(ref(rtdb, `liveGames/${gameId}/part3LessonPlacements/${user.uid}`), {
    answers: Object.fromEntries(gaps.map((gap) => [gap, answers[gap]])),
    submittedAt: Date.now(),
  });
}

export async function submitCohesionChallengeLiveAnswer({
  gameId,
  caseId,
  option,
  clueId,
}) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to answer.");
  if (!gameId || !caseId || !["A", "B", "C"].includes(option) || !["1", "2", "3"].includes(clueId)) {
    throw new Error("Choose a sentence and a decisive clue before submitting.");
  }

  await set(
    ref(rtdb, `liveGames/${gameId}/players/${user.uid}/cohesionAnswers/${caseId}`),
    {
      option,
      clueId,
      submittedAt: Date.now(),
    }
  );
}

export async function submitOteListeningLiveAnswer({
  gameId,
  itemId,
  value,
  stage = "initial",
}) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to answer.");
  if (!gameId || !itemId) throw new Error("Missing listening answer details.");

  const answerRef = ref(
    rtdb,
    `liveGames/${gameId}/players/${user.uid}/listeningAnswers/${itemId}`
  );
  await runTransaction(answerRef, (current) => {
    const now = Date.now();
    const existing = current || {};
    const hadInitialAnswer =
      stage === "script_check"
        ? existing.initialAnswered ?? existing.value !== undefined
        : true;
    const initialValue =
      stage === "script_check"
        ? existing.initialValue ?? (hadInitialAnswer ? existing.value : undefined)
        : value;
    return {
      ...existing,
      value,
      submittedAt: now,
      initialValue: hadInitialAnswer ? initialValue : null,
      initialAnswered: hadInitialAnswer,
      initialSubmittedAt:
        stage === "script_check"
          ? existing.initialSubmittedAt || existing.submittedAt || now
          : now,
      ...(stage === "script_check"
        ? {
            scriptCheckValue: value,
            scriptCheckUpdatedAt: now,
            changedAfterScript: !hadInitialAnswer || value !== initialValue,
          }
        : {
            scriptCheckValue: null,
            scriptCheckUpdatedAt: null,
            scriptCheckedAt: null,
            changedAfterScript: false,
          }),
    };
  });
}

export async function confirmOteListeningLiveScriptCheck({ gameId, itemId, value }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to confirm an answer.");
  if (!gameId || !itemId) throw new Error("Missing listening answer details.");

  const answerRef = ref(
    rtdb,
    `liveGames/${gameId}/players/${user.uid}/listeningAnswers/${itemId}`
  );
  await runTransaction(answerRef, (current) => {
    const finalValue = value ?? current?.value;
    if (finalValue === undefined || finalValue === null) return current;
    const now = Date.now();
    const existing = current || {};
    const initialAnswered =
      existing.initialAnswered ?? existing.value !== undefined;
    const initialValue =
      existing.initialValue ?? (initialAnswered ? existing.value : undefined);
    return {
      ...existing,
      value: finalValue,
      submittedAt: now,
      initialValue: initialAnswered ? initialValue : null,
      initialAnswered,
      initialSubmittedAt: existing.initialSubmittedAt || existing.submittedAt || now,
      scriptCheckValue: finalValue,
      scriptCheckUpdatedAt: now,
      scriptCheckedAt: now,
      changedAfterScript: !initialAnswered || finalValue !== initialValue,
    };
  });
}

export async function assignOptionJuryPlayer({ gameId, playerId, optionAssignment }) {
  if (!auth.currentUser) throw new Error("You must be signed in to assign options.");
  if (!gameId || !playerId || !["A", "B", "C"].includes(optionAssignment)) {
    throw new Error("Invalid Option Jury assignment.");
  }
  await set(ref(rtdb, `liveGames/${gameId}/players/${playerId}/optionAssignment`), optionAssignment);
}

export async function autoBalanceOptionJuryPlayers({ gameId, playerIds }) {
  if (!auth.currentUser) throw new Error("You must be signed in to assign options.");
  const updates = {};
  (playerIds || []).forEach((playerId, index) => {
    updates[`liveGames/${gameId}/players/${playerId}/optionAssignment`] = ["A", "B", "C"][index % 3];
  });
  if (Object.keys(updates).length) await update(ref(rtdb), updates);
}

export async function saveOptionJuryEvaluation({ gameId, questionId, assignedOption, verdict, reason = "" }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to evaluate an option.");
  if (!gameId || !questionId || !["A", "B", "C"].includes(assignedOption)) {
    throw new Error("Invalid Option Jury evaluation.");
  }
  await set(ref(rtdb, `liveGames/${gameId}/investigations/${user.uid}/${questionId}`), {
    assignedOption,
    verdict: verdict || "",
    reason: String(reason || "").slice(0, 220),
    submitted: false,
    updatedAt: Date.now(),
  });
}

export async function submitOptionJuryInvestigation({ gameId, questionId, assignedOption, verdict, reason = "" }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to submit evaluations.");
  if (!gameId || !questionId || !["A", "B", "C"].includes(assignedOption) || !verdict) {
    throw new Error("Complete the current option evaluation before submitting.");
  }
  await set(ref(rtdb, `liveGames/${gameId}/investigations/${user.uid}/${questionId}`), {
    assignedOption,
    verdict,
    reason: String(reason || "").slice(0, 220),
    submitted: true,
    submittedAt: Date.now(),
  });
}

export async function submitOptionJuryFinalVote({ gameId, questionId, option, changedMind = null }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to vote.");
  if (!gameId || !questionId || !["A", "B", "C"].includes(option)) {
    throw new Error("Invalid Option Jury vote.");
  }
  await set(ref(rtdb, `liveGames/${gameId}/finalVotes/${questionId}/${user.uid}`), {
    option,
    changedMind: typeof changedMind === "boolean" ? changedMind : null,
    submittedAt: Date.now(),
  });
}

export async function submitPart4EvidenceLiveAnswer({ gameId, questionId, option }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to answer.");
  if (!gameId || !questionId || !["A", "B", "C"].includes(option)) {
    throw new Error("Choose A, B or C before submitting.");
  }
  await set(ref(rtdb, `liveGames/${gameId}/part4Answers/${questionId}/${user.uid}`), {
    option,
    submittedAt: Date.now(),
  });
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
    if (typeof partialState.gapIndex === "number") {
      updates.gapIndex = partialState.gapIndex;
    }
    if (typeof partialState.sentenceIndex === "number") {
      updates.sentenceIndex = partialState.sentenceIndex;
    }
    if (typeof partialState.questionDuration === "number") {
      updates.questionDuration = partialState.questionDuration;
    }
    if (typeof partialState.roundIndex === "number") {
      updates.roundIndex = partialState.roundIndex;
    }
    if (typeof partialState.reviewIndex === "number") {
      updates.reviewIndex = partialState.reviewIndex;
    }
    if (typeof partialState.playCount === "number") {
      updates.playCount = partialState.playCount;
    }
    if (Array.isArray(partialState.round)) {
      updates.round = partialState.round;
    }
    if (typeof partialState.audioStage === "string") {
      updates.audioStage = partialState.audioStage;
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
    if ("phaseStartedAt" in partialState) {
      updates.phaseStartedAt = partialState.phaseStartedAt;
    }
    if ("phaseDeadline" in partialState) {
      updates.phaseDeadline = partialState.phaseDeadline;
    }
    if ("phaseDuration" in partialState) {
      updates.phaseDuration = partialState.phaseDuration;
    }
    if (typeof partialState.writingTimerDuration === "number") {
      updates.writingTimerDuration = partialState.writingTimerDuration;
    }
    if ("writingTimerRemaining" in partialState) {
      updates.writingTimerRemaining = partialState.writingTimerRemaining;
    }
    if ("writingTimerDeadline" in partialState) {
      updates.writingTimerDeadline = partialState.writingTimerDeadline;
    }
    if (typeof partialState.writingTimerStatus === "string") {
      updates.writingTimerStatus = partialState.writingTimerStatus;
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
