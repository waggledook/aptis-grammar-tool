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
  logAptisListeningLiveHosted,
  logAptisListeningLiveJoined,
  logAptisReadingLiveHosted,
  logAptisReadingLiveJoined,
  logAptisReadingLiveTaskCompleted,
  logOteReadingLiveHosted,
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
  serverTimestamp as realtimeServerTimestamp,
} from "firebase/database";
import { getRealtimeServerTimeOffset } from "../utils/realtimeServerTime.js";
import { getCollocationLiveActivityDetails, logCollocationLiveActivity } from "../utils/collocationLiveActivity.js";
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
  getOteAdvancedReadingPart2TeacherTask,
  OTE_ADVANCED_READING_PART2_LIVE_GAME_TYPE,
  OTE_ADVANCED_READING_PART2_PARAGRAPH_LIVE_GAME_TYPE,
} from "../products/ote/data/oteAdvancedReadingPart2TeacherTasks.js";
import {
  APTIS_LISTENING_PART2_LIVE_GAME_TYPE,
  getTeacherListeningPart2Task,
} from "../components/listening/teacherListeningPart2Data.js";
import {
  APTIS_LISTENING_PART3_LIVE_GAME_TYPE,
  getTeacherListeningPart3Task,
} from "../components/listening/teacherListeningPart3Data.js";
import {
  APTIS_LISTENING_PART4_LIVE_GAME_TYPE,
  getTeacherListeningPart4Task,
} from "../components/listening/teacherListeningPart4Data.js";
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
import {
  APTIS_READING_PART1_LIVE_GAME_TYPE,
  getReadingPart1TeacherTask,
} from "../reading/readingPart1TeacherTasks.js";
import {
  READING_PART2_LIVE_GAME_TYPE,
  getReadingPart2TeacherTask,
} from "../reading/part2Tasks.js";
import {
  getReadingPart3TeacherTask,
  READING_PART3_LIVE_GAME_TYPE,
} from "../reading/readingPart3TeacherTasks.js";
import {
  getReadingPart4TeacherTask,
  READING_PART4_LIVE_GAME_TYPE,
} from "../reading/readingPart4TaskBanks.js";
import {
  COLLOCATION_TEAM_GAME_TYPE,
  COLLOCATION_TEAM_ROUND_SECONDS,
  buildCollocationTeamReviews,
  createCollocationRoundState,
  evaluateCollocationTeamAnswer,
  getCollocationTeamCaptain,
  getCollocationLiveRound,
  getCollocationDraftAnswers,
  getCorrectWords,
} from "../components/vocabulary/collocations/collocationTeamLive.js";
import {
  getTextbookVocabLiveMode,
  isTextbookVocabLiveWrittenAnswerCorrect,
  scoreTextbookVocabLiveAnswer,
  TEXTBOOK_VOCAB_LIVE_GAME_TYPE,
} from "../components/hub/textbookVocabLive.js";

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

function getAptisReadingLiveActivityDetails(game, gameId) {
  const part = game.type === APTIS_READING_PART1_LIVE_GAME_TYPE
    ? 1
    : game.type === READING_PART2_LIVE_GAME_TYPE
      ? 2
      : game.type === READING_PART3_LIVE_GAME_TYPE
        ? 3
        : 4;
  const taskIds = game.taskIds || (game.taskId ? [game.taskId] : []);
  return {
    gameId,
    pin: game.pin || null,
    activityType: "reading-task",
    activityTitle: game.title || `Aptis Reading Part ${part}`,
    part,
    taskId: game.taskId || taskIds[0] || null,
    taskIds,
    taskCount: taskIds.length,
  };
}

function getAptisListeningLiveActivityDetails(game, gameId) {
  const part = game.type === APTIS_LISTENING_PART4_LIVE_GAME_TYPE
    ? 4
    : game.type === APTIS_LISTENING_PART3_LIVE_GAME_TYPE
      ? 3
      : 2;
  return {
    gameId,
    pin: game.pin || null,
    activityType: "listening-task",
    activityTitle: game.title || `Aptis Listening Part ${part}`,
    part,
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

function cleanTextbookVocabLiveQuestion(question) {
  const interactionType = getTextbookVocabLiveMode(question.interactionType).id;
  const base = {
    id: String(question.id),
    interactionType,
    sourceThemeId: String(question.sourceThemeId || ""),
    sourceThemeTitle: String(question.sourceThemeTitle || ""),
    sourceActivityId: String(question.sourceActivityId || ""),
    sourceActivityTitle: String(question.sourceActivityTitle || ""),
    sourceActivityType: String(question.sourceActivityType || ""),
    level: String(question.level || ""),
    textbookRef: String(question.textbookRef || ""),
    sentence: String(question.sentence || question.text || ""),
    text: String(question.text || question.sentence || ""),
    image: String(question.image || ""),
    colorHex: String(question.colorHex || ""),
    imageAlt: String(question.imageAlt || "Vocabulary question image"),
  };

  if (!base.id || !base.sentence) {
    throw new Error("One of the selected vocabulary questions is incomplete.");
  }

  if (interactionType === "matching") {
    const matchOptions = (question.matchOptions || []).slice(0, 4).map((option) => String(option || "").trim());
    const pairs = (question.pairs || []).slice(0, 4).map((pair) => ({
      id: String(pair.id || ""),
      prompt: String(pair.prompt || ""),
      image: String(pair.image || ""),
      colorHex: String(pair.colorHex || ""),
      imageAlt: String(pair.imageAlt || "Vocabulary prompt"),
      answerIndex: Number(pair.answerIndex),
    }));
    if (
      matchOptions.length !== 4 ||
      matchOptions.some((option) => !option) ||
      new Set(matchOptions.map((option) => option.toLowerCase())).size !== 4 ||
      pairs.length !== 4 ||
      pairs.some((pair) => !pair.id || !pair.prompt || !Number.isInteger(pair.answerIndex) || pair.answerIndex < 0 || pair.answerIndex >= 4)
    ) {
      throw new Error("Each matching round needs four complete, distinct pairs.");
    }
    return { ...base, matchOptions, pairs };
  }

  const answer = String(question.answer || question.options?.[question.answerIndex] || "").trim();
  if (!answer) throw new Error("One of the selected vocabulary questions has no answer.");

  if (interactionType === "write") {
    const acceptedAnswers = [...new Set([
      answer,
      ...(question.acceptedAnswers || []).map((acceptedAnswer) => String(acceptedAnswer || "").trim()),
    ].filter(Boolean))].slice(0, 12);
    return { ...base, answer, acceptedAnswers };
  }

  const options = (question.options || []).slice(0, 4).map((option) => String(option || "").trim());
  const answerIndex = Number(question.answerIndex);
  if (
    options.length < 2 ||
    options.some((option) => !option) ||
    !Number.isInteger(answerIndex) ||
    answerIndex < 0 ||
    answerIndex >= options.length
  ) {
    throw new Error("One of the selected multiple-choice questions is incomplete.");
  }
  return {
    ...base,
    answer,
    options,
    answerIndex,
    explanations: options.map((_, index) => String(question.explanations?.[index] || "")),
  };
}

const TEXTBOOK_VOCAB_LIVE_DURATIONS = [15, 20, 30, 45, 60, 90];

function textbookVocabDurationForItem(game, item) {
  const interactionType = getTextbookVocabLiveMode(item?.interactionType).id;
  return Number(game?.state?.modeDurations?.[interactionType])
    || Number(game?.state?.questionDuration)
    || getTextbookVocabLiveMode(interactionType).defaultDuration;
}

export async function createTextbookVocabLiveGame({ items, title, questionDuration, modeDurations = {} } = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to host a vocabulary quiz.");
  if (!Array.isArray(items) || items.length < 1) throw new Error("Choose vocabulary for the live quiz.");
  if (items.length > 50) throw new Error("Live vocabulary quizzes can contain up to 50 questions.");

  const cleanItems = items.map(cleanTextbookVocabLiveQuestion);
  const activeModes = [...new Set(cleanItems.map((item) => item.interactionType))];
  const minimumItems = activeModes.length === 1 && activeModes[0] === "matching" ? 1 : 2;
  if (cleanItems.length < minimumItems) throw new Error("Choose enough vocabulary for at least two live rounds.");
  const sessionMode = activeModes.length === 1 ? activeModes[0] : "mixed";
  const cleanModeDurations = Object.fromEntries(activeModes.map((interactionType) => {
    const requestedDuration = Number(modeDurations[interactionType] ?? questionDuration);
    return [
      interactionType,
      TEXTBOOK_VOCAB_LIVE_DURATIONS.includes(requestedDuration)
        ? requestedDuration
        : getTextbookVocabLiveMode(interactionType).defaultDuration,
    ];
  }));

  const gameRef = push(ref(rtdb, "liveGames"));
  const gameId = gameRef.key;
  const pin = generatePin();
  const cleanTitle = String(title || "").trim().slice(0, 120) || "Textbook Vocabulary Quiz";
  const firstDuration = cleanModeDurations[cleanItems[0].interactionType];
  await set(gameRef, {
    ownerUid: user.uid,
    setId: "textbook-vocabulary-custom",
    type: TEXTBOOK_VOCAB_LIVE_GAME_TYPE,
    interactionType: sessionMode,
    title: cleanTitle,
    pin,
    items: cleanItems,
    status: "lobby",
    createdAt: Date.now(),
    state: {
      phase: "lobby",
      questionIndex: 0,
      questionDuration: firstDuration,
      modeDurations: cleanModeDurations,
      questionDeadline: null,
    },
  });
  return { gameId, pin };
}

async function getOwnedTextbookVocabLiveGame(gameId) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to control the quiz.");
  const [snapshot, offset] = await Promise.all([
    get(ref(rtdb, `liveGames/${gameId}`)),
    getRealtimeServerTimeOffset(rtdb),
  ]);
  const game = snapshot.val();
  if (!game || game.type !== TEXTBOOK_VOCAB_LIVE_GAME_TYPE || game.ownerUid !== user.uid) {
    throw new Error("Only the quiz host can control this room.");
  }
  return { game, serverNow: Date.now() + offset };
}

export async function setTextbookVocabLiveDuration(gameId, questionDuration, interactionType) {
  const { game } = await getOwnedTextbookVocabLiveGame(gameId);
  const duration = Number(questionDuration);
  if (game.status !== "lobby") throw new Error("The timer can only be changed in the lobby.");
  if (!TEXTBOOK_VOCAB_LIVE_DURATIONS.includes(duration)) throw new Error("Choose an available question time.");
  const cleanMode = getTextbookVocabLiveMode(interactionType || game.items?.[0]?.interactionType).id;
  if (!game.items?.some((item) => item.interactionType === cleanMode)) throw new Error("That format is not used in this quiz.");
  const updates = { [`state/modeDurations/${cleanMode}`]: duration };
  if (game.items?.[0]?.interactionType === cleanMode) updates["state/questionDuration"] = duration;
  await update(ref(rtdb, `liveGames/${gameId}`), updates);
}

export async function startTextbookVocabLiveGame(gameId) {
  const { game, serverNow } = await getOwnedTextbookVocabLiveGame(gameId);
  const minimumItems = game.items?.every((item) => item.interactionType === "matching") ? 1 : 2;
  if (game.status !== "lobby" || !Array.isArray(game.items) || game.items.length < minimumItems) {
    throw new Error("This quiz is not ready to start.");
  }
  const duration = textbookVocabDurationForItem(game, game.items[0]);
  await update(ref(rtdb, `liveGames/${gameId}`), {
    status: "in-progress",
    "state/phase": "question",
    "state/questionIndex": 0,
    "state/questionDuration": duration,
    "state/questionDeadline": serverNow + (duration * 1000),
    "state/startedAt": serverNow,
  });
}

export async function revealTextbookVocabLiveQuestion(gameId, expectedDeadline, expectedIndex) {
  const { game, serverNow } = await getOwnedTextbookVocabLiveGame(gameId);
  if (game.status !== "in-progress" || game.state?.phase !== "question") return;
  await runTransaction(ref(rtdb, `liveGames/${gameId}/state`), (current) => {
    if (!current || current.phase !== "question") return;
    if (expectedDeadline != null && current.questionDeadline !== expectedDeadline) return;
    if (expectedIndex != null && current.questionIndex !== expectedIndex) return;
    return {
      ...current,
      phase: "reveal",
      questionDeadline: null,
      revealedAt: serverNow,
    };
  }, { applyLocally: false });
}

export async function startNextTextbookVocabLiveQuestion(gameId) {
  const { game, serverNow } = await getOwnedTextbookVocabLiveGame(gameId);
  const currentIndex = Number(game.state?.questionIndex) || 0;
  const nextIndex = currentIndex + 1;
  if (game.status !== "in-progress" || game.state?.phase !== "reveal") {
    throw new Error("Reveal the current answer before moving on.");
  }
  if (nextIndex >= game.items.length) {
    await finishTextbookVocabLiveGame(gameId);
    return;
  }
  const duration = textbookVocabDurationForItem(game, game.items[nextIndex]);
  await update(ref(rtdb, `liveGames/${gameId}/state`), {
    phase: "question",
    questionIndex: nextIndex,
    questionDuration: duration,
    questionDeadline: serverNow + (duration * 1000),
    phaseStartedAt: serverNow,
  });
}

export async function finishTextbookVocabLiveGame(gameId) {
  const { game, serverNow } = await getOwnedTextbookVocabLiveGame(gameId);
  if (game.status === "finished") return;
  await update(ref(rtdb, `liveGames/${gameId}`), {
    status: "finished",
    "state/phase": "finished",
    "state/questionDeadline": null,
    "state/finishedAt": serverNow,
  });
}

export async function submitTextbookVocabLiveAnswer({ gameId, selectedIndex, typedAnswer, matches }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to answer.");

  const [snapshot, offset] = await Promise.all([
    get(ref(rtdb, `liveGames/${gameId}`)),
    getRealtimeServerTimeOffset(rtdb),
  ]);
  const game = snapshot.val();
  const serverNow = Date.now() + offset;
  const questionIndex = Number(game?.state?.questionIndex) || 0;
  const item = game?.items?.[questionIndex];
  if (!game || game.type !== TEXTBOOK_VOCAB_LIVE_GAME_TYPE) throw new Error("Quiz not found.");
  if (!game.players?.[user.uid]) throw new Error("Join the quiz before answering.");
  if (game.status !== "in-progress" || game.state?.phase !== "question") {
    throw new Error("This question is not accepting answers.");
  }
  if (!game.state?.questionDeadline || serverNow >= game.state.questionDeadline) {
    throw new Error("Time is up for this question.");
  }
  if (!item) throw new Error("This vocabulary question is unavailable.");

  const interactionType = getTextbookVocabLiveMode(item.interactionType || game.interactionType).id;
  let answerPayload;
  let correct;
  let correctCount;
  let totalCount;

  if (interactionType === "write") {
    const cleanTypedAnswer = String(typedAnswer || "").trim().slice(0, 200);
    if (!cleanTypedAnswer) throw new Error("Write an answer before submitting.");
    correct = isTextbookVocabLiveWrittenAnswerCorrect(cleanTypedAnswer, item.acceptedAnswers || [item.answer]);
    answerPayload = { typedAnswer: cleanTypedAnswer };
  } else if (interactionType === "matching") {
    const cleanMatches = Array.isArray(matches) ? matches.map(Number) : [];
    totalCount = item.pairs?.length || 0;
    if (
      totalCount !== 4 ||
      cleanMatches.length !== totalCount ||
      new Set(cleanMatches).size !== totalCount ||
      cleanMatches.some((optionIndex) => !Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= item.matchOptions.length)
    ) {
      throw new Error("Match all four items before submitting.");
    }
    correctCount = item.pairs.reduce((count, pair, pairIndex) => (
      count + (cleanMatches[pairIndex] === pair.answerIndex ? 1 : 0)
    ), 0);
    correct = correctCount === totalCount;
    answerPayload = { matches: cleanMatches, correctCount, totalCount };
  } else {
    const optionIndex = Number(selectedIndex);
    if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= item.options.length) {
      throw new Error("Choose an available answer.");
    }
    correct = optionIndex === item.answerIndex;
    answerPayload = { selectedIndex: optionIndex };
  }

  const fullScore = scoreTextbookVocabLiveAnswer({
    correct: interactionType === "matching" ? correctCount > 0 : correct,
    remainingMs: game.state.questionDeadline - serverNow,
    durationSeconds: game.state.questionDuration,
  });
  const scoreDelta = interactionType === "matching"
    ? Math.round(fullScore * (correctCount / totalCount))
    : fullScore;
  const answerResult = await runTransaction(
    ref(rtdb, `liveGames/${gameId}/answers/${questionIndex}/${user.uid}`),
    (current) => current ? undefined : {
      ...answerPayload,
      correct,
      scoreDelta,
      submittedAt: serverNow,
    },
    { applyLocally: false }
  );
  if (!answerResult.committed) throw new Error("Your answer is already locked.");

  await runTransaction(ref(rtdb, `liveGames/${gameId}/players/${user.uid}`), (current) => {
    if (!current) return;
    return {
      ...current,
      score: (Number(current.score) || 0) + scoreDelta,
      lastAnswerCorrect: correct,
      ...(interactionType === "multiple-choice" ? { lastAnswerIndex: answerPayload.selectedIndex } : {}),
      ...(interactionType === "matching" ? { lastAnswerCorrectCount: correctCount } : {}),
    };
  });
  return { correct, scoreDelta };
}

function cleanCollocationLiveItem(item) {
  return {
    itemId: String(item.itemId),
    prompt: String(item.prompt || ""),
    question: String(item.question || "Which words form natural collocations?"),
    level: String(item.level || ""),
    topic: String(item.topic || ""),
    secondaryTopics: (item.secondaryTopics || []).map(String),
    pattern: String(item.pattern || ""),
    options: (item.options || []).map((option) => ({
      word: String(option.word || ""),
      collocation: String(option.collocation || ""),
      isCorrect: !!option.isCorrect,
      definition: String(option.definition || ""),
      example: String(option.example || ""),
      note: String(option.note || ""),
    })),
  };
}

export async function createCollocationTeamLiveGame({ items, title } = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to host a collocation game.");
  if (!Array.isArray(items) || items.length < 2) {
    throw new Error("Choose at least two collocation sets for the live game.");
  }

  const gameRef = push(ref(rtdb, "liveGames"));
  const gameId = gameRef.key;
  const pin = generatePin();
  await set(gameRef, {
    ownerUid: user.uid,
    pin,
    title: title || "Collocation Team Challenge",
    type: COLLOCATION_TEAM_GAME_TYPE,
    items: items.map(cleanCollocationLiveItem),
    status: "lobby",
    createdAt: Date.now(),
    state: {
      phase: "lobby",
      teamCount: 2,
      teamsLocked: false,
      questionIndex: 0,
      reviewIndex: 0,
      questionDuration: COLLOCATION_TEAM_ROUND_SECONDS,
      questionDeadline: null,
      reviewItemIndexes: [],
    },
  });
  void logCollocationLiveActivity("hosted", getCollocationLiveActivityDetails({ pin, title, items }, gameId));
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
    game.type === APTIS_LISTENING_PART2_LIVE_GAME_TYPE ||
    game.type === APTIS_LISTENING_PART3_LIVE_GAME_TYPE ||
    game.type === APTIS_LISTENING_PART4_LIVE_GAME_TYPE ||
    game.type === COHESION_CHALLENGE_GAME_TYPE ||
    game.type === FREE_THINGS_LESSON_GAME_TYPE ||
    game.type === APTIS_WRITING_LIVE_GAME_TYPE ||
    game.type === REGISTER_SURGERY_LIVE_GAME_TYPE ||
    game.type === PART4_ERROR_DETECTIVE_LIVE_GAME_TYPE ||
    game.type === APTIS_READING_PART1_LIVE_GAME_TYPE ||
    game.type === READING_PART2_LIVE_GAME_TYPE ||
    game.type === READING_PART3_LIVE_GAME_TYPE ||
    game.type === READING_PART4_LIVE_GAME_TYPE ||
    game.type === OTE_ADVANCED_READING_PART2_LIVE_GAME_TYPE ||
    game.type === OTE_ADVANCED_READING_PART2_PARAGRAPH_LIVE_GAME_TYPE ||
    game.type === COLLOCATION_TEAM_GAME_TYPE ||
    game.type === TEXTBOOK_VOCAB_LIVE_GAME_TYPE
  ) {
    if (!existingPlayer) await set(playerRef, {
      name: displayName,
      ...(game.type === TEXTBOOK_VOCAB_LIVE_GAME_TYPE ? { score: 0 } : {}),
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
  if (!existingPlayer && [APTIS_READING_PART1_LIVE_GAME_TYPE, READING_PART2_LIVE_GAME_TYPE, READING_PART3_LIVE_GAME_TYPE, READING_PART4_LIVE_GAME_TYPE].includes(game.type)) {
    await logAptisReadingLiveJoined(getAptisReadingLiveActivityDetails(game, game.gameId));
  }
  if (!existingPlayer && [APTIS_LISTENING_PART2_LIVE_GAME_TYPE, APTIS_LISTENING_PART3_LIVE_GAME_TYPE, APTIS_LISTENING_PART4_LIVE_GAME_TYPE].includes(game.type)) {
    await logAptisListeningLiveJoined(getAptisListeningLiveActivityDetails(game, game.gameId));
  }
  if (!existingPlayer && game.type === COLLOCATION_TEAM_GAME_TYPE) {
    void logCollocationLiveActivity("joined", getCollocationLiveActivityDetails(game, game.gameId));
  }

  return { gameId: game.gameId, type: game.type || "grammar" };
}

export async function configureCollocationLiveTeams({ gameId, teams, assignments, teamCount, teamsLocked = false }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to organise teams.");

  const updates = {
    teams,
    "state/teamCount": teamCount,
    "state/teamsLocked": !!teamsLocked,
  };
  Object.entries(assignments || {}).forEach(([uid, teamId]) => {
    updates[`players/${uid}/teamId`] = teamId || null;
  });
  await update(ref(rtdb, `liveGames/${gameId}`), updates);
}

export async function updateCollocationLiveTeam({ gameId, teamId, team }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to organise teams.");
  await set(ref(rtdb, `liveGames/${gameId}/teams/${teamId}`), team);
}

export async function setCollocationLiveTeamsLocked(gameId, teamsLocked) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to organise teams.");
  await set(ref(rtdb, `liveGames/${gameId}/state/teamsLocked`), !!teamsLocked);
}

export async function startCollocationTeamLiveGame(gameId) {
  const { game, serverNow } = await getOwnedCollocationLiveGame(gameId);
  if (game.status !== "lobby" || !game.state?.teamsLocked) {
    throw new Error("Lock the teams in the lobby before starting.");
  }
  const roundState = createCollocationRoundState(game, 0, false, serverNow);
  const stateUpdates = Object.fromEntries(Object.entries(roundState).map(([key, value]) => [`state/${key}`, value]));
  await update(ref(rtdb, `liveGames/${gameId}`), {
    status: "in-progress",
    ...stateUpdates,
    "state/startedAt": serverNow,
  });
  void logCollocationLiveActivity("started", getCollocationLiveActivityDetails(game, gameId));
}

export async function startCollocationTeamReview(gameId) {
  const { game, serverNow } = await getOwnedCollocationLiveGame(gameId);
  if (game.status !== "in-progress" || game.state?.phase !== "reveal" || game.state?.questionIndex !== game.items.length - 1) {
    throw new Error("Finish the main sets before starting the review.");
  }
  const plan = buildCollocationTeamReviews(game);
  if (!plan.reviewRoundCount) throw new Error("Every team has already found all the collocations.");
  const reviewGame = { ...game, state: { ...game.state, ...plan } };
  await update(ref(rtdb, `liveGames/${gameId}/state`), {
    ...createCollocationRoundState(reviewGame, 0, true, serverNow),
    ...plan,
    reviewItemIndexes: null,
    reviewStartedAt: serverNow,
  });
  void logCollocationLiveActivity("review_started", {
    ...getCollocationLiveActivityDetails(game, gameId),
    reviewRoundCount: plan.reviewRoundCount,
    reviewTeamCount: Object.values(plan.reviewItemIndexesByTeam).filter((indexes) => indexes.length).length,
  });
}

async function getOwnedCollocationLiveGame(gameId) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to control the game.");
  const [snapshot, offset] = await Promise.all([
    get(ref(rtdb, `liveGames/${gameId}`)),
    getRealtimeServerTimeOffset(rtdb),
  ]);
  const game = snapshot.val();
  if (!game || game.type !== COLLOCATION_TEAM_GAME_TYPE || game.ownerUid !== user.uid) {
    throw new Error("Only the host can control this game.");
  }
  return { game, serverNow: Date.now() + offset };
}

export async function revealCollocationTeamRound(gameId, review = false, expectedDeadline, expectedIndex) {
  const { game, serverNow } = await getOwnedCollocationLiveGame(gameId);
  const phase = review ? "review-question" : "question";
  if (game.status !== "in-progress" || game.state?.phase !== phase) return;
  if (expectedDeadline != null && game.state.questionDeadline !== expectedDeadline) return;
  if (expectedIndex != null && game.state[review ? "reviewIndex" : "questionIndex"] !== expectedIndex) return;
  // Save work before revealing. Captains' drafts stop accepting changes at the
  // deadline, so scoring does not depend on a late client-side submit request.
  await Promise.all(getCollocationDraftAnswers(game, serverNow).map(({ answerRoot, teamId, itemIndex, answer }) => (
    runTransaction(ref(rtdb, `liveGames/${gameId}/${answerRoot}/${teamId}/${itemIndex}`), (current) => {
      if (current) return;
      return answer;
    }, { applyLocally: false })
  )));
  await runTransaction(ref(rtdb, `liveGames/${gameId}/state`), (current) => {
    if (!current || current.phase !== (review ? "review-question" : "question")) return;
    // A delayed reveal from an earlier set must never close the next one.
    if (expectedDeadline != null && current.questionDeadline !== expectedDeadline) return;
    if (expectedIndex != null && current[review ? "reviewIndex" : "questionIndex"] !== expectedIndex) return;
    return {
      ...current,
      phase: review ? "review-reveal" : "reveal",
      questionDeadline: null,
      revealedAt: serverNow,
    };
  }, { applyLocally: false });
}

export async function startNextCollocationTeamRound({ gameId, index, review = false }) {
  const { game, serverNow } = await getOwnedCollocationLiveGame(gameId);
  const indexKey = review ? "reviewIndex" : "questionIndex";
  if (game.status !== "in-progress" || game.state?.phase !== (review ? "review-reveal" : "reveal") || index !== game.state[indexKey] + 1) {
    throw new Error("Reveal this set before starting the next one.");
  }
  await update(ref(rtdb, `liveGames/${gameId}/state`), createCollocationRoundState(game, index, review, serverNow));
}

export async function finishCollocationTeamLiveGame(gameId) {
  const { game, serverNow } = await getOwnedCollocationLiveGame(gameId);
  if (game.status === "finished") return;
  await update(ref(rtdb, `liveGames/${gameId}`), {
    status: "finished",
    "state/phase": "finished",
    "state/questionDeadline": null,
    "state/finishedAt": serverNow,
  });
  void logCollocationLiveActivity("finished", getCollocationLiveActivityDetails(game, gameId));
}

export async function saveCollocationTeamDraft({ gameId, teamId, itemIndex, selectedWords, review = false, questionDeadline }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to save your choices.");
  const root = review ? "reviewDrafts" : "teamDrafts";
  await set(ref(rtdb, `liveGames/${gameId}/${root}/${teamId}/${itemIndex}`), {
    selectedWords: [...new Set(selectedWords || [])],
    submittedBy: user.uid,
    questionDeadline,
    updatedAt: realtimeServerTimestamp(),
  });
}

export async function submitCollocationTeamAnswer({ gameId, itemIndex, selectedWords, review = false }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to submit an answer.");

  const [gameSnap, offset] = await Promise.all([
    get(ref(rtdb, `liveGames/${gameId}`)),
    getRealtimeServerTimeOffset(rtdb),
  ]);
  if (!gameSnap.exists()) throw new Error("This live game is no longer available.");
  const game = gameSnap.val();
  const teamId = game.players?.[user.uid]?.teamId;
  const team = game.teams?.[teamId];
  const expectedPhase = review ? "review-question" : "question";
  if (!teamId) throw new Error("Your teacher has not assigned you to a team yet.");
  if (game.status !== "in-progress" || game.state?.phase !== expectedPhase) {
    throw new Error("This part of the game is not accepting answers.");
  }

  const { item, hasTask, itemIndex: expectedItemIndex, captainPosition } = getCollocationLiveRound(game, teamId);
  if (!hasTask) throw new Error("Your team has no collocations to review in this round.");
  if (itemIndex !== expectedItemIndex) throw new Error("Your team has already moved to another set.");
  const serverNow = Date.now() + offset;
  if (!game.state?.questionDeadline || serverNow >= game.state.questionDeadline) {
    throw new Error("Time is up for this set.");
  }
  if (getCollocationTeamCaptain(team, captainPosition) !== user.uid) {
    throw new Error("Only the current team captain can submit this answer.");
  }

  const availableWords = new Set((item.options || []).map((option) => option.word));
  const uniqueSelectedWords = [...new Set(selectedWords || [])];
  if (
    uniqueSelectedWords.length !== getCorrectWords(item).length ||
    uniqueSelectedWords.some((word) => !availableWords.has(word))
  ) {
    throw new Error(`Choose exactly ${getCorrectWords(item).length} available options.`);
  }
  const evaluation = evaluateCollocationTeamAnswer(game, teamId, itemIndex, uniqueSelectedWords, review);
  const answerRoot = review ? "reviewAnswers" : "teamAnswers";
  if (game[answerRoot]?.[teamId]?.[itemIndex]) throw new Error("Your team answer is already locked.");
  await set(ref(rtdb, `liveGames/${gameId}/${answerRoot}/${teamId}/${itemIndex}`), {
    ...evaluation,
    submittedBy: user.uid,
    submittedAt: serverNow,
  });
}

export async function createOptionJuryLiveGame({ taskId, title }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to host an Option Jury session.");
  if (!taskId) throw new Error("createOptionJuryLiveGame: taskId is required.");

  const gameRef = push(ref(rtdb, "liveGames"));
  const gameId = gameRef.key;
  const pin = generatePin();
  const activityTitle = title || "Option Jury";
  await set(gameRef, {
    ownerUid: user.uid,
    pin,
    title: activityTitle,
    type: OPTION_JURY_GAME_TYPE,
    taskId,
    status: "lobby",
    createdAt: Date.now(),
    state: { phase: "lobby", questionIndex: 0 },
  });
  await logOteReadingLiveHosted({ gameId, pin, activityTitle, part: 4, mode: "live_option_jury", taskId, variant: "advanced" });
  return { gameId, pin };
}

export async function createPart4EvidenceLiveGame({ taskId, title }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to host a Part 4 session.");
  if (!taskId) throw new Error("createPart4EvidenceLiveGame: taskId is required.");

  const gameRef = push(ref(rtdb, "liveGames"));
  const gameId = gameRef.key;
  const pin = generatePin();
  const activityTitle = title || "Part 4 Evidence Reveal";
  await set(gameRef, {
    ownerUid: user.uid,
    pin,
    title: activityTitle,
    type: PART4_EVIDENCE_LIVE_GAME_TYPE,
    taskId,
    status: "lobby",
    createdAt: Date.now(),
    state: { phase: "lobby", questionIndex: 0 },
  });
  await logOteReadingLiveHosted({ gameId, pin, activityTitle, part: 4, mode: "live_answer_evidence", taskId, variant: "advanced" });
  return { gameId, pin };
}

export async function createReadingPart1LiveGame({ taskId, title }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to host a reading session.");
  const task = getReadingPart1TeacherTask(taskId);
  if (!task) throw new Error("Choose a valid Reading Part 1 teacher task.");

  const gameRef = push(ref(rtdb, "liveGames"));
  const gameId = gameRef.key;
  const pin = generatePin();
  const activityTitle = title || `Aptis Reading Part 1 · ${task.title}`;
  await set(gameRef, {
    ownerUid: user.uid,
    pin,
    title: activityTitle,
    type: APTIS_READING_PART1_LIVE_GAME_TYPE,
    taskId: task.id,
    status: "lobby",
    createdAt: Date.now(),
    state: { phase: "lobby", reviewIndex: 0, whyRevealedByGap: {} },
  });
  await logAptisReadingLiveHosted({
    gameId,
    pin,
    activityType: "reading-task",
    activityTitle,
    part: 1,
    taskId: task.id,
    taskIds: [task.id],
    taskCount: 1,
  });
  return { gameId, pin };
}

export async function createReadingPart2LiveGame({ taskId, taskIds = [], title }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to host a reading session.");
  const requestedIds = [...new Set([...(taskIds || []), ...(taskId ? [taskId] : [])])];
  const tasks = requestedIds.map(getReadingPart2TeacherTask).filter(Boolean);
  if (!tasks.length || tasks.length !== requestedIds.length) {
    throw new Error("Choose one or more valid Reading Part 2 teacher tasks.");
  }

  const candidateIdsByTask = {};
  tasks.forEach((task) => {
    const answerable = task.text.sentences.filter((sentence) => !sentence.fixed);
    const correctIds = [...answerable].sort((a, b) => a.order - b.order).map((sentence) => sentence.id);
    const candidates = answerable.map((sentence) => sentence.id);
    for (let index = candidates.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]];
    }
    if (candidates.every((id, index) => id === correctIds[index])) {
      candidates.push(candidates.shift());
    }
    candidateIdsByTask[task.id] = candidates;
  });

  const gameRef = push(ref(rtdb, "liveGames"));
  const gameId = gameRef.key;
  const pin = generatePin();
  const activityTitle = title || (tasks.length === 1
    ? `Aptis Reading Part 2 · ${tasks[0].subtitle || tasks[0].title}`
    : `Aptis Reading Part 2 · ${tasks.length}-task session`);
  await set(gameRef, {
    ownerUid: user.uid,
    pin,
    title: activityTitle,
    type: READING_PART2_LIVE_GAME_TYPE,
    taskId: tasks[0].id,
    taskIds: tasks.map((task) => task.id),
    candidateIds: candidateIdsByTask[tasks[0].id],
    candidateIdsByTask,
    status: "lobby",
    createdAt: Date.now(),
    state: { phase: "lobby", taskIndex: 0, reviewIndex: 0, whyRevealedByTask: {} },
  });
  await logAptisReadingLiveHosted({
    gameId,
    pin,
    activityType: "reading-task",
    activityTitle,
    part: 2,
    taskId: tasks[0].id,
    taskIds: tasks.map((task) => task.id),
    taskCount: tasks.length,
  });
  return { gameId, pin };
}

export async function createReadingPart3LiveGame({ taskId, title }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to host a reading session.");
  const task = getReadingPart3TeacherTask(taskId);
  if (!task) throw new Error("Choose a valid Reading Part 3 teacher task.");

  const gameRef = push(ref(rtdb, "liveGames"));
  const gameId = gameRef.key;
  const pin = generatePin();
  const activityTitle = title || `Aptis Reading Part 3 · ${task.title}`;
  await set(gameRef, {
    ownerUid: user.uid,
    pin,
    title: activityTitle,
    type: READING_PART3_LIVE_GAME_TYPE,
    taskId: task.id,
    taskIds: [task.id],
    status: "lobby",
    createdAt: Date.now(),
    state: { phase: "lobby", phaseStartedAt: null, whyRevealed: false },
  });
  await logAptisReadingLiveHosted({
    gameId,
    pin,
    activityType: "reading-task",
    activityTitle,
    part: 3,
    taskId: task.id,
    taskIds: [task.id],
    taskCount: 1,
  });
  return { gameId, pin };
}

export async function createOteAdvancedReadingPart2LiveGame({ taskId, title }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to host a reading session.");
  const task = getOteAdvancedReadingPart2TeacherTask(taskId);
  if (!task) throw new Error("Choose a valid OTE Advanced Reading Part 2 teacher task.");

  const gameRef = push(ref(rtdb, "liveGames"));
  const gameId = gameRef.key;
  const pin = generatePin();
  const activityTitle = title || `OTE Advanced Reading Part 2 · ${task.title}`;
  await set(gameRef, {
    ownerUid: user.uid,
    pin,
    title: activityTitle,
    type: OTE_ADVANCED_READING_PART2_LIVE_GAME_TYPE,
    taskId: task.id,
    taskIds: [task.id],
    status: "lobby",
    createdAt: Date.now(),
    state: { phase: "lobby", phaseStartedAt: null, whyRevealed: false },
  });
  await logOteReadingLiveHosted({
    gameId,
    pin,
    activityTitle,
    part: 2,
    mode: "teacher_resource_live",
    taskId: task.id,
    variant: "advanced",
  });
  return { gameId, pin };
}

export async function createOteAdvancedReadingPart2ParagraphLiveGame({ taskId, title }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to host a reading session.");
  const task = getOteAdvancedReadingPart2TeacherTask(taskId);
  if (!task) throw new Error("Choose a valid OTE Advanced Reading Part 2 teacher task.");

  const gameRef = push(ref(rtdb, "liveGames"));
  const gameId = gameRef.key;
  const pin = generatePin();
  const activityTitle = title || `OTE Advanced Reading Part 2 paragraph lesson · ${task.title}`;
  await set(gameRef, {
    ownerUid: user.uid,
    pin,
    title: activityTitle,
    type: OTE_ADVANCED_READING_PART2_PARAGRAPH_LIVE_GAME_TYPE,
    taskId: task.id,
    taskIds: [task.id],
    status: "lobby",
    createdAt: Date.now(),
    state: {
      phase: "lobby",
      phaseStartedAt: null,
      sourceIndex: 0,
      explanationsRevealed: false,
    },
  });
  await logOteReadingLiveHosted({
    gameId,
    pin,
    activityTitle,
    part: 2,
    mode: "teacher_resource_paragraph_live",
    taskId: task.id,
    variant: "advanced",
  });
  return { gameId, pin };
}

export async function createReadingPart4LiveGame({ taskId, title }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to host a reading session.");
  const task = getReadingPart4TeacherTask(taskId);
  if (!task) throw new Error("Choose a valid Reading Part 4 teacher task.");

  const gameRef = push(ref(rtdb, "liveGames"));
  const gameId = gameRef.key;
  const pin = generatePin();
  const activityTitle = title || `Aptis Reading Part 4 · ${task.title}`;
  await set(gameRef, {
    ownerUid: user.uid,
    pin,
    title: activityTitle,
    type: READING_PART4_LIVE_GAME_TYPE,
    taskId: task.id,
    taskIds: [task.id],
    status: "lobby",
    createdAt: Date.now(),
    state: { phase: "lobby", phaseStartedAt: null, whyRevealed: false },
  });
  await logAptisReadingLiveHosted({
    gameId,
    pin,
    activityType: "reading-task",
    activityTitle,
    part: 4,
    taskId: task.id,
    taskIds: [task.id],
    taskCount: 1,
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

export async function createAptisListeningPart2LiveGame({ taskId }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to host a listening session.");
  const task = getTeacherListeningPart2Task(taskId);
  if (!task) throw new Error("Choose an available Aptis Listening Part 2 task.");

  const gameRef = push(ref(rtdb, "liveGames"));
  const gameId = gameRef.key;
  const pin = generatePin();
  await set(gameRef, {
    ownerUid: user.uid,
    pin,
    title: task.title,
    type: APTIS_LISTENING_PART2_LIVE_GAME_TYPE,
    taskId: task.id,
    status: "lobby",
    createdAt: Date.now(),
    state: { phase: "lobby", reviewIndex: 0, playCount: 0, completedCount: 0, audioStage: "idle" },
  });
  await logAptisListeningLiveHosted(getAptisListeningLiveActivityDetails({ pin, title: task.title, taskId: task.id }, gameId));
  return { gameId, pin };
}

export async function createAptisListeningPart3LiveGame({ taskId }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to host a listening session.");
  const task = getTeacherListeningPart3Task(taskId);
  if (!task) throw new Error("Choose an available Aptis Listening Part 3 task.");

  const gameRef = push(ref(rtdb, "liveGames"));
  const gameId = gameRef.key;
  const pin = generatePin();
  await set(gameRef, {
    ownerUid: user.uid,
    pin,
    title: task.title,
    type: APTIS_LISTENING_PART3_LIVE_GAME_TYPE,
    taskId: task.id,
    status: "lobby",
    createdAt: Date.now(),
    state: { phase: "lobby", reviewIndex: 0, playCount: 0, completedCount: 0, audioStage: "idle", secondMode: "" },
  });
  await logAptisListeningLiveHosted(getAptisListeningLiveActivityDetails({ type: APTIS_LISTENING_PART3_LIVE_GAME_TYPE, pin, title: task.title, taskId: task.id }, gameId));
  return { gameId, pin };
}

export async function createAptisListeningPart4LiveGame({ taskId }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to host a listening session.");
  const task = getTeacherListeningPart4Task(taskId);
  if (!task) throw new Error("Choose an available Aptis Listening Part 4 task.");
  if (!task.audioSrc) throw new Error("Add the recording before starting this live lesson.");

  const gameRef = push(ref(rtdb, "liveGames"));
  const gameId = gameRef.key;
  const pin = generatePin();
  await set(gameRef, {
    ownerUid: user.uid,
    pin,
    title: task.title,
    type: APTIS_LISTENING_PART4_LIVE_GAME_TYPE,
    taskId: task.id,
    status: "lobby",
    createdAt: Date.now(),
    state: { phase: "lobby", reviewIndex: 0, playCount: 0, completedCount: 0, audioStage: "idle", secondMode: "" },
  });
  await logAptisListeningLiveHosted(getAptisListeningLiveActivityDetails({ type: APTIS_LISTENING_PART4_LIVE_GAME_TYPE, pin, title: task.title, taskId: task.id }, gameId));
  return { gameId, pin };
}

export async function createCohesionChallengeLiveGame({ title } = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to host a cohesion session.");

  const gameRef = push(ref(rtdb, "liveGames"));
  const gameId = gameRef.key;
  const pin = generatePin();
  const activityTitle = title || "Classroom Cohesion Challenge";
  await set(gameRef, {
    ownerUid: user.uid,
    pin,
    title: activityTitle,
    type: COHESION_CHALLENGE_GAME_TYPE,
    taskId: COHESION_CHALLENGE_TASK_ID,
    status: "lobby",
    createdAt: Date.now(),
    state: {
      phase: "lobby",
      questionIndex: 0,
    },
  });
  await logOteReadingLiveHosted({ gameId, pin, activityTitle, part: 3, mode: "teacher_led_live", taskId: COHESION_CHALLENGE_TASK_ID, variant: "advanced" });
  return { gameId, pin };
}

export async function createFreeThingsLessonLiveGame({ title } = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to host this lesson.");

  const gameRef = push(ref(rtdb, "liveGames"));
  const gameId = gameRef.key;
  const pin = generatePin();
  const activityTitle = title || "Why Free Things Are Complicated · Live lesson";
  await set(gameRef, {
    ownerUid: user.uid,
    pin,
    title: activityTitle,
    type: FREE_THINGS_LESSON_GAME_TYPE,
    taskId: FREE_THINGS_LESSON_TASK_ID,
    status: "lobby",
    createdAt: Date.now(),
    state: { phase: "lobby", gapIndex: 0, sentenceIndex: 0, reviewIndex: 0 },
  });
  await logOteReadingLiveHosted({ gameId, pin, activityTitle, part: 3, mode: "live_guided_lesson", taskId: FREE_THINGS_LESSON_TASK_ID, variant: "advanced" });
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

export async function submitListeningLiveAnswer({
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
    const isRevision = stage === "script_check" || stage === "second_listen";
    const hadInitialAnswer =
      isRevision
        ? existing.initialAnswered ?? existing.value !== undefined
        : true;
    const initialValue =
      isRevision
        ? existing.initialValue ?? (hadInitialAnswer ? existing.value : undefined)
        : value;
    const preScriptValue = stage === "script_check"
      ? existing.preScriptValue !== undefined ? existing.preScriptValue : existing.value ?? null
      : existing.preScriptValue;
    return {
      ...existing,
      value,
      submittedAt: now,
      initialValue: hadInitialAnswer ? initialValue : null,
      initialAnswered: hadInitialAnswer,
      initialSubmittedAt:
        isRevision
          ? existing.initialSubmittedAt || existing.submittedAt || now
          : now,
      ...(stage === "script_check"
        ? {
            scriptCheckValue: value,
            scriptCheckUpdatedAt: now,
            preScriptValue,
            changedAfterScript: preScriptValue === null || value !== preScriptValue,
          }
        : stage === "second_listen"
          ? {
              secondListenValue: value,
              secondListenUpdatedAt: now,
              changedAfterFirstListen: !hadInitialAnswer || value !== initialValue,
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

export async function submitAptisListeningFirstRound({ gameId }) {
  const user = auth.currentUser;
  if (!user || !gameId) throw new Error("You must be signed in to submit first-round answers.");
  await set(ref(rtdb, `liveGames/${gameId}/players/${user.uid}/listeningFirstRoundSubmittedAt`), Date.now());
}

export async function confirmListeningLiveScriptCheck({ gameId, itemId, value }) {
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
    const preScriptValue = existing.preScriptValue !== undefined
      ? existing.preScriptValue
      : existing.value ?? null;
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
      preScriptValue,
      changedAfterScript: preScriptValue === null || finalValue !== preScriptValue,
    };
  });
}

export const submitOteListeningLiveAnswer = submitListeningLiveAnswer;
export const confirmOteListeningLiveScriptCheck = confirmListeningLiveScriptCheck;

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

export async function submitReadingPart1LiveAnswers({ gameId, taskId, answers }) {
  const user = auth.currentUser;
  const task = getReadingPart1TeacherTask(taskId);
  if (!user) throw new Error("You must be signed in to submit your answers.");
  if (!gameId || !task || !answers) throw new Error("Missing Reading Part 1 answer details.");

  const answerableGaps = task.gaps.filter((gap) => !gap.fixed);
  const safeAnswers = {};
  for (const gap of answerableGaps) {
    const answer = answers[gap.id];
    if (!gap.options.includes(answer)) throw new Error("Choose an answer for every gap before submitting.");
    safeAnswers[gap.id] = answer;
  }

  const submissionRef = ref(rtdb, `liveGames/${gameId}/players/${user.uid}/readingPart1Submission`);
  const existingSubmission = await get(submissionRef);
  await set(submissionRef, {
    taskId: task.id,
    answers: safeAnswers,
    submittedAt: Date.now(),
  });
  if (!existingSubmission.exists()) {
    const gameSnapshot = await get(ref(rtdb, `liveGames/${gameId}`));
    const score = answerableGaps.filter((gap) => safeAnswers[gap.id] === gap.answer).length;
    await logAptisReadingLiveTaskCompleted({
      ...getAptisReadingLiveActivityDetails(gameSnapshot.val() || {
        type: APTIS_READING_PART1_LIVE_GAME_TYPE,
        taskId: task.id,
      }, gameId),
      completedTaskId: task.id,
      completedTaskTitle: task.title,
      answeredCount: answerableGaps.length,
      score,
      total: answerableGaps.length,
    });
  }
}

export async function saveReadingPart2LiveProgress({ gameId, taskId, positions = {} }) {
  const user = auth.currentUser;
  const task = getReadingPart2TeacherTask(taskId);
  if (!user) throw new Error("You must be signed in to save your order.");
  if (!gameId || !task) throw new Error("Missing Reading Part 2 answer details.");

  const answerable = task.text.sentences.filter((sentence) => !sentence.fixed);
  const validIds = new Set(answerable.map((sentence) => sentence.id));
  const safePositions = {};
  for (const [rawOrder, selectedId] of Object.entries(positions || {})) {
    const order = Number(rawOrder);
    if (!Number.isInteger(order) || order < 1 || order > 5 || !validIds.has(selectedId)) {
      throw new Error("That sentence position could not be saved.");
    }
    safePositions[order] = selectedId;
  }
  if (new Set(Object.values(safePositions)).size !== Object.values(safePositions).length) {
    throw new Error("Use each sentence once.");
  }

  const answeredCount = Object.keys(safePositions).length;
  const complete = answeredCount === answerable.length;
  const now = Date.now();
  const progressRef = ref(rtdb, `liveGames/${gameId}/players/${user.uid}/readingPart2Submissions/${task.id}`);
  const existingProgress = (await get(progressRef)).val() || {};
  const wasCompleted = Boolean(existingProgress.firstCompletedAt || existingProgress.complete);
  const firstCompletedAt = existingProgress.firstCompletedAt || existingProgress.completedAt || (complete ? now : null);
  await set(progressRef, {
    taskId: task.id,
    positions: safePositions,
    answeredCount,
    complete,
    updatedAt: now,
    ...(firstCompletedAt ? { firstCompletedAt } : {}),
    ...(complete ? { completedAt: now } : {}),
  });
  if (complete && !wasCompleted) {
    const gameSnapshot = await get(ref(rtdb, `liveGames/${gameId}`));
    const score = answerable.filter((sentence) => safePositions[sentence.order] === sentence.id).length;
    await logAptisReadingLiveTaskCompleted({
      ...getAptisReadingLiveActivityDetails(gameSnapshot.val() || {
        type: READING_PART2_LIVE_GAME_TYPE,
        taskId: task.id,
        taskIds: [task.id],
      }, gameId),
      completedTaskId: task.id,
      completedTaskTitle: task.subtitle || task.title,
      answeredCount,
      score,
      total: answerable.length,
    });
  }
}

export async function saveReadingPart3LiveProgress({ gameId, taskId, answers = {} }) {
  const user = auth.currentUser;
  const task = getReadingPart3TeacherTask(taskId);
  if (!user) throw new Error("You must be signed in to save your answers.");
  if (!gameId || !task) throw new Error("Missing Reading Part 3 answer details.");

  const questionById = new Map(task.questions.map((question) => [String(question.id), question]));
  const validNames = new Set(task.comments.map((comment) => comment.name));
  const safeAnswers = {};
  for (const [rawQuestionId, answer] of Object.entries(answers || {})) {
    if (!questionById.has(String(rawQuestionId)) || !validNames.has(answer)) {
      throw new Error("That opinion match could not be saved.");
    }
    safeAnswers[rawQuestionId] = answer;
  }

  const answeredCount = Object.keys(safeAnswers).length;
  const complete = answeredCount === task.questions.length;
  const now = Date.now();
  const progressRef = ref(rtdb, `liveGames/${gameId}/players/${user.uid}/readingPart3Submission`);
  const existingProgress = (await get(progressRef)).val() || {};
  const wasCompleted = Boolean(existingProgress.firstCompletedAt || existingProgress.complete);
  const firstCompletedAt = existingProgress.firstCompletedAt || existingProgress.completedAt || (complete ? now : null);
  await set(progressRef, {
    taskId: task.id,
    answers: safeAnswers,
    answeredCount,
    complete,
    updatedAt: now,
    ...(firstCompletedAt ? { firstCompletedAt } : {}),
    ...(complete ? { completedAt: now } : {}),
  });

  if (complete && !wasCompleted) {
    const gameSnapshot = await get(ref(rtdb, `liveGames/${gameId}`));
    const score = task.questions.filter((question) => safeAnswers[question.id] === question.answer).length;
    await logAptisReadingLiveTaskCompleted({
      ...getAptisReadingLiveActivityDetails(gameSnapshot.val() || {
        type: READING_PART3_LIVE_GAME_TYPE,
        taskId: task.id,
        taskIds: [task.id],
      }, gameId),
      completedTaskId: task.id,
      completedTaskTitle: task.title,
      answeredCount,
      score,
      total: task.questions.length,
    });
  }
}

export async function saveOteAdvancedReadingPart2LiveProgress({ gameId, taskId, answers = {} }) {
  const user = auth.currentUser;
  const task = getOteAdvancedReadingPart2TeacherTask(taskId);
  if (!user) throw new Error("You must be signed in to save your answers.");
  if (!gameId || !task) throw new Error("Missing OTE Reading Part 2 answer details.");

  const questionById = new Map(task.questions.map((question) => [String(question.id), question]));
  const validReviewers = new Set(Object.keys(task.reviewers));
  const safeAnswers = {};
  for (const [rawQuestionId, answer] of Object.entries(answers || {})) {
    if (!questionById.has(String(rawQuestionId)) || !validReviewers.has(answer)) {
      throw new Error("That specialist match could not be saved.");
    }
    safeAnswers[rawQuestionId] = answer;
  }

  const answeredCount = Object.keys(safeAnswers).length;
  const complete = answeredCount === task.questions.length;
  const now = Date.now();
  const progressRef = ref(rtdb, `liveGames/${gameId}/players/${user.uid}/oteReadingPart2Submission`);
  const existingProgress = (await get(progressRef)).val() || {};
  const firstCompletedAt = existingProgress.firstCompletedAt
    || existingProgress.completedAt
    || (complete ? now : null);
  await set(progressRef, {
    taskId: task.id,
    answers: safeAnswers,
    answeredCount,
    complete,
    updatedAt: now,
    ...(firstCompletedAt ? { firstCompletedAt } : {}),
    ...(complete ? { completedAt: now } : {}),
  });
}

export async function submitOteAdvancedReadingPart2ParagraphIdeas({
  gameId,
  taskId,
  sourceLetter,
  selectedQuestionIds = [],
}) {
  const user = auth.currentUser;
  const task = getOteAdvancedReadingPart2TeacherTask(taskId);
  if (!user) throw new Error("You must be signed in to submit your ideas.");
  if (!gameId || !task || !["A", "B", "C"].includes(sourceLetter)) {
    throw new Error("Missing paragraph activity details.");
  }

  const validQuestionIds = new Set(task.questions.map((question) => question.id));
  const requestedIds = [...new Set(selectedQuestionIds)];
  if (requestedIds.some((questionId) => !validQuestionIds.has(questionId))) {
    throw new Error("One of those question choices is not available.");
  }

  const selected = Object.fromEntries(requestedIds.map((questionId) => [questionId, true]));
  await set(
    ref(rtdb, `liveGames/${gameId}/players/${user.uid}/oteReadingPart2ParagraphSubmissions/${sourceLetter}`),
    {
      taskId: task.id,
      sourceLetter,
      selected,
      submitted: true,
      submittedAt: Date.now(),
    }
  );
}

export async function saveReadingPart4LiveProgress({ gameId, taskId, answers = {} }) {
  const user = auth.currentUser;
  const task = getReadingPart4TeacherTask(taskId);
  if (!user) throw new Error("You must be signed in to save your answers.");
  if (!gameId || !task) throw new Error("Missing Reading Part 4 answer details.");

  const paragraphById = new Map(task.paragraphs.map((paragraph) => [String(paragraph.id), paragraph]));
  const validHeadings = new Set(task.headings.map((heading) => heading.key));
  const safeAnswers = {};
  for (const [rawParagraphId, answer] of Object.entries(answers || {})) {
    if (!paragraphById.has(String(rawParagraphId)) || !validHeadings.has(answer)) {
      throw new Error("That heading match could not be saved.");
    }
    safeAnswers[rawParagraphId] = answer;
  }

  const answeredCount = Object.keys(safeAnswers).length;
  const complete = answeredCount === task.paragraphs.length;
  const now = Date.now();
  const progressRef = ref(rtdb, `liveGames/${gameId}/players/${user.uid}/readingPart4Submission`);
  const existingProgress = (await get(progressRef)).val() || {};
  const wasCompleted = Boolean(existingProgress.firstCompletedAt || existingProgress.complete);
  const firstCompletedAt = existingProgress.firstCompletedAt || existingProgress.completedAt || (complete ? now : null);
  await set(progressRef, {
    taskId: task.id,
    answers: safeAnswers,
    answeredCount,
    complete,
    updatedAt: now,
    ...(firstCompletedAt ? { firstCompletedAt } : {}),
    ...(complete ? { completedAt: now } : {}),
  });

  if (complete && !wasCompleted) {
    const gameSnapshot = await get(ref(rtdb, `liveGames/${gameId}`));
    const score = task.paragraphs.filter((paragraph) => safeAnswers[paragraph.id] === paragraph.answer).length;
    await logAptisReadingLiveTaskCompleted({
      ...getAptisReadingLiveActivityDetails(gameSnapshot.val() || {
        type: READING_PART4_LIVE_GAME_TYPE,
        taskId: task.id,
        taskIds: [task.id],
      }, gameId),
      completedTaskId: task.id,
      completedTaskTitle: task.title,
      answeredCount,
      score,
      total: task.paragraphs.length,
    });
  }
}

export async function submitReadingPart2LiveOrder(details) {
  return saveReadingPart2LiveProgress(details);
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
    if (typeof partialState.taskIndex === "number") {
      updates.taskIndex = partialState.taskIndex;
    }
    if (typeof partialState.sourceIndex === "number") {
      updates.sourceIndex = partialState.sourceIndex;
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
    if (typeof partialState.completedCount === "number") {
      updates.completedCount = partialState.completedCount;
    }
    if (Array.isArray(partialState.round)) {
      updates.round = partialState.round;
    }
    if (typeof partialState.audioStage === "string") {
      updates.audioStage = partialState.audioStage;
    }
    if (typeof partialState.secondMode === "string") {
      updates.secondMode = partialState.secondMode;
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
    if (typeof partialState.whyRevealed === "boolean") {
      updates.whyRevealed = partialState.whyRevealed;
    }
    if (typeof partialState.explanationsRevealed === "boolean") {
      updates.explanationsRevealed = partialState.explanationsRevealed;
    }
    if ("whyRevealedByGap" in partialState) {
      updates.whyRevealedByGap = partialState.whyRevealedByGap;
    }
    if ("whyRevealedByTask" in partialState) {
      updates.whyRevealedByTask = partialState.whyRevealedByTask;
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
