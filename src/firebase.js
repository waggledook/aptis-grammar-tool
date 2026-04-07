// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { sendPasswordResetEmail } from "firebase/auth";

// ⬇️ Use initializeFirestore instead of getFirestore
import {
  initializeFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  getCountFromServer,           // ← NEW
  increment,                     // ← NEW
  updateDoc                     // ← ADD THIS
} from "firebase/firestore";

import {
  getAuth,
  updateProfile,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCvpE87D16safq68oFB4fJKPyCURsc-mrU",
  authDomain: "examplay-auth.firebaseapp.com",
  projectId: "examplay-auth",
  storageBucket: "examplay-auth.firebasestorage.app",
  messagingSenderId: "654835226958",
  appId: "1:654835226958:web:a95cd8da4adb09c8a5661f",
  measurementId: "G-DMMT8D3XBR",
  databaseURL: "https://examplay-auth-default-rtdb.europe-west1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);

// ⭐ Only enable analytics when the user has accepted cookies
let analyticsInstance = null;

export function enableAnalytics() {
  try {
    if (typeof window === "undefined") return null;
    if (!analyticsInstance) {
      analyticsInstance = getAnalytics(app);
      console.log("[analytics] enabled");
    }
    return analyticsInstance;
  } catch (err) {
    console.warn("[analytics] could not be enabled:", err);
    return null;
  }
}

// ⬇️ Initialize Firestore with long-polling (avoids WebChannel terminate 400s)
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  // If you still see issues, try flipping this:
  useFetchStreams: false, // set to true on some Chromium builds if needed
  // Last resort (stronger): experimentalForceLongPolling: true,
});

// NEW: Realtime Database for live games
export const rtdb = getDatabase(app);

export const auth = getAuth(app);
export const storage = getStorage(app);

// — AUTH HELPERS (unchanged) —
export const doSignIn     = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
// Sign up with email + password + optional name/username
export const doSignUp = async ({ email, pw, name, username }) => {
  // 1) Create auth user
  const cred = await createUserWithEmailAndPassword(auth, email, pw);
  const user = cred.user;

  // 2) Nice displayName in Auth
  if (name) {
    await updateProfile(user, { displayName: name });
  }

  // 3) Normalise username
  const uname = (username || "").toLowerCase().trim();

  // 4) Create /users/{uid} profile
  const profileRef = doc(db, "users", user.uid);
  await setDoc(
    profileRef,
    {
      email: user.email || null,
      name: name || "",
      username: uname,
      role: "student",
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  // 5) Create /usernames/{username} → { email, uid } mapping (if provided)
  if (uname) {
    const unameRef = doc(db, "usernames", uname);
    await setDoc(unameRef, {
      email: user.email || email,
      uid: user.uid,
      createdAt: serverTimestamp(),
    });
  }

  return user;
};

export const onAuthChange = (cb)       => onAuthStateChanged(auth, cb);
export const doSignOut    = ()         => signOut(auth);

export async function doPasswordReset(email, redirectUrl = "") {
  const safeRedirect = String(redirectUrl || "").trim();
  if (!safeRedirect) {
    return sendPasswordResetEmail(auth, email);
  }

  const actionCodeSettings = {
    url: safeRedirect,
    handleCodeInApp: false,
  };

  return sendPasswordResetEmail(auth, email, actionCodeSettings);
}
/**
 * Ensure there is a /users/{uid} profile doc with at least
 *   - email
 *   - role (default "student" if missing)
 *   - createdAt
 *
 * It WILL NOT overwrite an existing role (so your admin/teacher
 * accounts are safe).
 */
export async function ensureUserProfile(user) {
  if (!user) return;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // First time we see this user → create full profile
    await setDoc(
      ref,
      {
        email: user.email || null,
        name: user.displayName || "",
        username: "",           // we don't know yet – stays empty
        role: "student",
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  } else {
    // Update missing fields only (don’t downgrade roles)
    const data = snap.data() || {};
    const patch = {};

    if (!data.email && user.email) {
      patch.email = user.email;
    }
    if (!data.role) {
      patch.role = "student";
    }
    if (!data.name && user.displayName) {
      patch.name = user.displayName;
    }
    if (data.username === undefined) {
      // ensure the field exists, even if empty
      patch.username = "";
    }

    if (Object.keys(patch).length) {
      await setDoc(ref, patch, { merge: true });
    }
  }
}


// near the top of firebase.js (after auth is defined)
function _uidOrCurrent(uid) {
  return uid || auth.currentUser?.uid || null;
}

// — FIRESTORE HELPERS —
// helper to build a reference to /users/{uid}/{subcol}
function userCol(subcol) {
  if (!auth.currentUser) throw new Error("Must be signed in");
  return collection(db, "users", auth.currentUser.uid, subcol);
}

// — FAVOURITES —

// Add a favourite
export async function addFavourite(itemId) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Must be signed in");
  const favCol = collection(db, "users", uid, "favourites");
  return addDoc(favCol, { itemId, createdAt: serverTimestamp() });
}

// Remove a favourite
export async function removeFavourite(itemId) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Must be signed in");
  const favCol = collection(db, "users", uid, "favourites");
  const q = query(favCol, where("itemId", "==", itemId));
  const snap = await getDocs(q);
  await Promise.all(
    snap.docs.map(d => deleteDoc(doc(db, "users", uid, "favourites", d.id)))
  );
}

// **Fetch the array of favourite item-IDs** (plural)
export async function fetchFavourites() {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];
  const snap = await getDocs(collection(db, "users", uid, "favourites"));
  // each doc has { itemId, ... }
  return snap.docs.map(d => d.data().itemId);
}

/**
 * Record a new mistake for the current user, then trim to the 15 most recent.
 * @param {string} itemId
 */
export async function recordMistake(itemId) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Must be signed in to record a mistake");

  const col = collection(db, "users", uid, "mistakes");
  // add new
  await addDoc(col, {
    itemId,
    answeredAt: serverTimestamp()
  });

  // now keep only the latest 15 docs
  const recentQ = query(col, orderBy("answeredAt", "desc"), limit(15));
  const recentSnap = await getDocs(recentQ);
  const keepIds = new Set(recentSnap.docs.map(d => d.id));

  const allSnap = await getDocs(col);
  await Promise.all(
    allSnap.docs
      .filter(d => !keepIds.has(d.id))
      .map(d => deleteDoc(doc(col, d.id)))
  );
}

/**
 * Fetch the 15 most recent mistake‐IDs (in descending time order).
 * @returns {Promise<string[]>}
 */
export async function fetchMistakes() {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];        // not signed in or no mistakes

  const col = collection(db, "users", uid, "mistakes");
  const q   = query(col, orderBy("answeredAt", "desc"), limit(15));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data().itemId);
}

// ────────────────────────────────
// Vocab mistakes log
// /users/{uid}/vocabMistakes
// ────────────────────────────────
export async function recordVocabMistake({
  topic,
  setId,
  sentence,
  correctAnswer,
  userAnswer,
}) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const colRef = collection(db, "users", uid, "vocabMistakes");
  await addDoc(colRef, {
    topic,
    setId,
    sentence,
    correctAnswer,
    userAnswer,
    resolved: false,          // 👈 NEW
    createdAt: serverTimestamp(),
  });
}

export async function fetchUnresolvedVocabMistakes(limitCount = 50, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const colRef = collection(db, "users", realUid, "vocabMistakes");
  const q = query(
    colRef,
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const snap = await getDocs(q);

  // Treat docs with no `resolved` field as unresolved
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((doc) => doc.resolved !== true);
}

export async function resolveVocabMistake(id, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid || !id) return;

  const docRef = doc(db, "users", realUid, "vocabMistakes", id);
  await updateDoc(docRef, {
    resolved: true,
    resolvedAt: serverTimestamp(),
  });
}



export async function fetchRecentVocabMistakes(max = 8, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const colRef = collection(db, "users", realUid, "vocabMistakes");
  const q = query(
    colRef,
    orderBy("createdAt", "desc"),
    limit(max)
  );

  const snap = await getDocs(q);

  // Only show unresolved ones in the profile card, too
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((doc) => doc.resolved !== true);
}

// ────────────────────────────────
// Collocation Dash scores
// /users/{uid}/collocationDashScores
// ────────────────────────────────

export async function saveCollocationDashScore(score) {
  const uid = auth.currentUser?.uid;
  if (!uid) return; // only signed-in users

  const colRef = collection(db, "users", uid, "collocationDashScores");

  // 1) Save score
  await addDoc(colRef, {
    score: Number(score) || 0,
    createdAt: serverTimestamp(),
    app: "aptis-trainer",
    gameId: "collocation_dash",
  });

  // 2) Optional: keep only the most recent 50 (prevents infinite growth)
  const keepQ = query(colRef, orderBy("createdAt", "desc"), limit(50));
  const keepSnap = await getDocs(keepQ);
  const keepIds = new Set(keepSnap.docs.map((d) => d.id));

  const allSnap = await getDocs(colRef);
  await Promise.all(
    allSnap.docs
      .filter((d) => !keepIds.has(d.id))
      .map((d) => deleteDoc(doc(colRef, d.id)))
  );
}

export async function fetchTopCollocationDashScores(n = 3, uid) {
  const realUid = uid || auth.currentUser?.uid || null;
  if (!realUid) return [];

  const colRef = collection(db, "users", realUid, "collocationDashScores");

  // Top scores (highest first). Tie-break: newest first.
  const qy = query(colRef, orderBy("score", "desc"), orderBy("createdAt", "desc"), limit(n));
  const snap = await getDocs(qy);

  return snap.docs.map((d) => {
    const data = d.data() || {};
    return {
      id: d.id,
      score: data.score ?? 0,
      createdAt: data.createdAt || null,
    };
  });
}

// ────────────────────────────────
// Seif Hub game leaderboards
// Personal: /users/{uid}/hubGameLeaderboards/{gameId}/scores
// Global:   /leaderboards/{gameId}/scores
// ────────────────────────────────

function getHubGameUserScoresCol(uid, gameId) {
  return collection(db, "users", uid, "hubGameLeaderboards", gameId, "scores");
}

function getHubGameGlobalScoresCol(gameId) {
  return collection(db, "leaderboards", gameId, "scores");
}

export async function saveHubGameScore(gameId, score, details = {}) {
  const user = auth.currentUser;
  if (!user) return;

  const numericScore = Number(score) || 0;
  if (numericScore <= 0) return;

  const displayName =
    details.displayName ||
    user.displayName ||
    details.name ||
    user.email ||
    "User";

  const payload = {
    uid: user.uid,
    score: numericScore,
    createdAt: serverTimestamp(),
    displayName,
    userEmail: user.email || null,
    app: "seifhub",
    gameId,
    ...details,
  };

  await addDoc(getHubGameUserScoresCol(user.uid, gameId), payload);
  await addDoc(getHubGameGlobalScoresCol(gameId), payload);
}

export async function fetchMyTopHubGameScores(gameId, n = 3, uid) {
  const realUid = uid || auth.currentUser?.uid || null;
  if (!realUid) return [];

  const qy = query(
    getHubGameUserScoresCol(realUid, gameId),
    orderBy("score", "desc"),
    orderBy("createdAt", "desc"),
    limit(n)
  );
  const snap = await getDocs(qy);
  return snap.docs.map((d) => {
    const data = d.data() || {};
    return {
      id: d.id,
      score: data.score ?? 0,
      createdAt: data.createdAt || null,
      displayName: data.displayName || null,
      details: data.details || null,
    };
  });
}

export async function fetchTopHubGameScores(gameId, n = 10) {
  const qy = query(
    getHubGameGlobalScoresCol(gameId),
    orderBy("score", "desc"),
    orderBy("createdAt", "desc"),
    limit(n)
  );
  const snap = await getDocs(qy);
  return snap.docs.map((d) => {
    const data = d.data() || {};
    return {
      id: d.id,
      uid: data.uid || null,
      score: data.score ?? 0,
      createdAt: data.createdAt || null,
      displayName: data.displayName || data.userEmail || "User",
    };
  });
}

export async function deleteHubGameLeaderboardScore(gameId, scoreId) {
  const user = auth.currentUser;
  if (!user) throw new Error("Must be signed in");
  if (!gameId || !scoreId) throw new Error("Missing leaderboard score reference");

  await deleteDoc(doc(db, "leaderboards", gameId, "scores", scoreId));
}

// ─── GLOBAL ACTIVITY LOG ─────────────────────────────────────────────────────
/**
 * Append a single activity event to /activityLog.
 *
 * Usage examples:
 *   await logActivity("grammar_session", {
 *     mode: "practice",
 *     totalItems: 20,
 *     correct: 17,
 *   });
 *
 *   await logActivity("vocab_set_completed", {
 *     topicId: "sports",
 *     topicName: "Sports & fitness",
 *     mode: "match",
 *   });
 *
 * Only logs when a user is signed in.
 */
export async function logActivity(type, details = {}) {
  const user = auth.currentUser;
  if (!user) return; // silently skip if not signed in

  try {
    const { app = "aptis-trainer", ...safeDetails } = details || {};
    await addDoc(collection(db, "activityLog"), {
      userId: user.uid,
      userEmail: user.email || null,
      type,                    // e.g. "grammar_session", "vocab_set_completed"
      details: safeDetails || {},  // small object with context
      createdAt: serverTimestamp(),
      app,    // helps if you ever share a project
    });
  } catch (err) {
    // logging should never break the app
    console.error("[activityLog] Failed to log activity:", err);
  }
}

export async function logHubKeywordStarted(details = {}) {
  return logActivity("hub_keyword_started", {
    app: "seifhub",
    ...details,
  });
}

export async function logHubKeywordReviewLoaded(details = {}) {
  return logActivity("hub_keyword_review_loaded", {
    app: "seifhub",
    ...details,
  });
}

export async function logHubKeywordCompleted(details = {}) {
  return logActivity("hub_keyword_completed", {
    app: "seifhub",
    ...details,
  });
}

export async function logHubWordFormationStarted(details = {}) {
  return logActivity("hub_word_formation_started", {
    app: "seifhub",
    ...details,
  });
}

export async function logHubWordFormationReviewLoaded(details = {}) {
  return logActivity("hub_word_formation_review_loaded", {
    app: "seifhub",
    ...details,
  });
}

export async function logHubWordFormationCompleted(details = {}) {
  return logActivity("hub_word_formation_completed", {
    app: "seifhub",
    ...details,
  });
}

export async function logHubOpenClozeStarted(details = {}) {
  return logActivity("hub_open_cloze_started", {
    app: "seifhub",
    ...details,
  });
}

export async function logHubOpenClozeReviewLoaded(details = {}) {
  return logActivity("hub_open_cloze_review_loaded", {
    app: "seifhub",
    ...details,
  });
}

export async function logHubOpenClozeCompleted(details = {}) {
  return logActivity("hub_open_cloze_completed", {
    app: "seifhub",
    ...details,
  });
}

export async function logCollocationDashStarted(details = {}) {
  return logActivity("collocation_dash_started", {
    app: "aptis-trainer",
    ...details,
  });
}

export async function logCollocationDashCompleted(details = {}) {
  return logActivity("collocation_dash_completed", {
    app: "aptis-trainer",
    ...details,
  });
}

export async function logHubFlashcardsStarted(details = {}) {
  return logActivity("hub_flashcards_started", {
    app: "seifhub",
    ...details,
  });
}

export async function logHubSpanglishStarted(details = {}) {
  return logActivity("hub_spanglish_started", {
    app: "seifhub",
    ...details,
  });
}

export async function logHubSpanglishCompleted(details = {}) {
  return logActivity("hub_spanglish_completed", {
    app: "seifhub",
    ...details,
  });
}

export async function logHubSpanglishReviewStarted(details = {}) {
  return logActivity("hub_spanglish_review_started", {
    app: "seifhub",
    ...details,
  });
}

export async function logHubDependentPrepsStarted(details = {}) {
  return logActivity("hub_dependent_preps_started", {
    app: "seifhub",
    ...details,
  });
}

export async function logHubDependentPrepsCompleted(details = {}) {
  return logActivity("hub_dependent_preps_completed", {
    app: "seifhub",
    ...details,
  });
}

export async function logHubDependentPrepsReviewStarted(details = {}) {
  return logActivity("hub_dependent_preps_review_started", {
    app: "seifhub",
    ...details,
  });
}

export async function logHubNegatrisStarted(details = {}) {
  return logActivity("hub_negatris_started", {
    app: "seifhub",
    ...details,
  });
}

export async function logHubNegatrisCompleted(details = {}) {
  return logActivity("hub_negatris_completed", {
    app: "seifhub",
    ...details,
  });
}

export async function logHubSpanglishLiveHosted(details = {}) {
  return logActivity("hub_spanglish_live_hosted", {
    app: "seifhub",
    ...details,
  });
}

export async function logHubSpanglishLiveStarted(details = {}) {
  return logActivity("hub_spanglish_live_started", {
    app: "seifhub",
    ...details,
  });
}

export async function logHubSpanglishLiveFinished(details = {}) {
  return logActivity("hub_spanglish_live_finished", {
    app: "seifhub",
    ...details,
  });
}

export async function logHubSpanglishLiveReportViewed(details = {}) {
  return logActivity("hub_spanglish_live_report_viewed", {
    app: "seifhub",
    ...details,
  });
}

// ─── ACTIVITY HELPERS ────────────────────────────────────────────────────

/**
 * Log that the user completed a vocab review set.
 *
 * Example:
 *   logVocabSetCompleted({
 *     topic: "appearance",
 *     setId: "set1",
 *     mode: "review",
 *     totalItems: 12,
 *     correctFirstTry: 9,
 *     mistakesCount: 3,
 *   });
 */
export async function logVocabSetCompleted({
  topic,
  setId,
  mode = "review",
  totalItems,
  correctFirstTry,
  mistakesCount,
}) {
  return logActivity("vocab_set_completed", {
    topic: topic || null,
    setId: setId || null,
    mode,
    totalItems: totalItems ?? null,
    correctFirstTry: correctFirstTry ?? null,
    mistakesCount: mistakesCount ?? null,
  });
}

// ─── FLASHCARDS ACTIVITY HELPER ────────────────────────────────────────────

export async function logFlashcardsSession({
  topic,
  totalCards,
  isAuthenticated,
}) {
  return logActivity("vocab_flashcards_session", {
    topic: topic || null,
    totalCards: totalCards ?? null,
    isAuthenticated: !!isAuthenticated,
  });
}

// ─── VOCAB MATCH ACTIVITY HELPER ──────────────────────────────────────────
export async function logVocabMatchSession({ topic, setId, totalPairs }) {
  return logActivity("vocab_match_session", {
    topic: topic || null,
    setId: setId || null,
    totalPairs: totalPairs ?? null,
  });
}

// ─── SPEAKING TASK COMPLETION ─────────────────────────────────────────────
export async function logSpeakingTaskCompleted(details) {
  // details: { part: "part1"|"part2"|"part3"|"part4", taskId?, questionCount?, questionIds? }
  return logActivity("speaking_task_completed", details);
}

// ─── SPEAKING NOTE SUBMITTED ─────────────────────────────────────────────
export async function logSpeakingNoteSubmitted(details) {
  // details: { guideId, photoKey, source?, chars?, lines? }
  return logActivity("speaking_note_submitted", details);
}

// ─── READING ACTIVITY HELPERS ───────────────────────────────────────────────

// Part 2 reorder (the main reorder activity)
export async function logReadingReorderCompleted({ taskId, source = "AptisPart2Reorder" }) {
  return logActivity("reading_reorder_completed", {
    taskId: taskId || null,
    source,
  });
}

// Reading guide page opened
export async function logReadingGuideViewed({ guideId = "reading_guide_reorder" } = {}) {
  return logActivity("reading_guide_viewed", { guideId });
}

// “Show clues” clicked (guide)
export async function logReadingGuideClueReveal({ taskId }) {
  return logActivity("reading_guide_clue_reveal", {
    taskId: taskId || null,
  });
}

// “Check” clicked in guide reorder
export async function logReadingGuideReorderCheck({ taskId, correct }) {
  return logActivity("reading_guide_reorder_check", {
    taskId: taskId || null,
    correct: !!correct,
  });
}

// “Show answers” clicked in guide reorder
export async function logReadingGuideShowAnswers({ taskId }) {
  return logActivity("reading_guide_show_answers", {
    taskId: taskId || null,
  });
}

// Guide reorder actually completed (all correct on Check)
export async function logReadingGuideReorderCompleted({ taskId }) {
  return logActivity("reading_guide_reorder_completed", {
    taskId: taskId || null,
  });
}

export async function logReadingPart4Attempted({ taskId, score, total, source = "AptisPart4" }) {
  return logActivity("reading_part4_attempted", {
    taskId: taskId || null,
    score: typeof score === "number" ? score : null,
    total: typeof total === "number" ? total : null,
    source,
  });
}

export async function logReadingPart4Completed({ taskId, source = "AptisPart4" }) {
  await saveReadingProgress(taskId, "part4");
  return logActivity("reading_part4_completed", {
    taskId: taskId || null,
    source,
  });
}

export async function logReadingPart3Attempted({
  taskId,
  score,
  total,
  source = "AptisPart3",
}) {
  return logActivity("reading_part3_attempted", {
    taskId: taskId || null,
    score: typeof score === "number" ? score : null,
    total: typeof total === "number" ? total : null,
    source,
  });
}

export async function logReadingPart3Completed({ taskId, source = "AptisPart3" }) {
  await saveReadingProgress(taskId, "part3");
  return logActivity("reading_part3_completed", {
    taskId: taskId || null,
    source,
  });
}


// ─── LISTENING PART 1 (Short extracts / generated sets) ─────────────────────

export async function getListeningPart1TaskStats() {
  const uid = auth.currentUser?.uid;
  if (!uid) return {};

  const col = collection(db, "users", uid, "listeningPart1Tasks");
  const snap = await getDocs(col);

  const out = {};
  snap.docs.forEach((d) => {
    out[d.id] = d.data() || {};
  });

  return out;
}

export async function updateListeningPart1TaskProgress({
  taskId,
  correct,
  playsUsed = null,
  tags = [],
  source = "ListeningPart1",
}) {
  const uid = auth.currentUser?.uid;
  if (!uid || !taskId) return;

  const ref = doc(db, "users", uid, "listeningPart1Tasks", taskId);

  const payload = {
    taskId,
    source,
    tags: Array.isArray(tags) ? tags : [],
    seenAt: serverTimestamp(),
    lastAttemptAt: serverTimestamp(),
    lastCorrect: !!correct,
    attempts: increment(1),
    playsUsedLast: typeof playsUsed === "number" ? playsUsed : null,
  };

  if (correct) {
    payload.completions = increment(1);
    payload.lastCorrectAt = serverTimestamp();
    payload.needsReview = false;
  } else {
    payload.wrongCount = increment(1);
    payload.lastWrongAt = serverTimestamp();
    payload.needsReview = true;
  }

  await setDoc(ref, payload, { merge: true });
}

export async function logListeningPart1Attempted({
  taskId,
  score,
  total,
  playsUsed = null,
  source = "ListeningPart1",
}) {
  return logActivity("listening_part1_attempted", {
    taskId: taskId || null,
    score: typeof score === "number" ? score : null,
    total: typeof total === "number" ? total : null,
    playsUsed: typeof playsUsed === "number" ? playsUsed : null,
    source,
  });
}

export async function logListeningPart1Completed({
  taskId,
  playsUsed = null,
  source = "ListeningPart1",
}) {
  await saveListeningProgress(taskId, "part1");
  return logActivity("listening_part1_completed", {
    taskId: taskId || null,
    playsUsed: typeof playsUsed === "number" ? playsUsed : null,
    source,
  });
}

// ─── LISTENING PART 2 (Matching speakers) ───────────────────────────────────
export async function logListeningPart2Attempted({
  taskId,
  score,
  total,
  playsUsed = null,
  source = "ListeningPart2",
}) {
  return logActivity("listening_part2_attempted", {
    taskId: taskId || null,
    score: typeof score === "number" ? score : null,
    total: typeof total === "number" ? total : null,
    playsUsed: typeof playsUsed === "number" ? playsUsed : null,
    source,
  });
}

export async function logListeningPart2Completed({
  taskId,
  playsUsed = null,
  source = "ListeningPart2",
}) {
  await saveListeningProgress(taskId, "part2");
  return logActivity("listening_part2_completed", {
    taskId: taskId || null,
    playsUsed: typeof playsUsed === "number" ? playsUsed : null,
    source,
  });
}

// ─── LISTENING PART 3 (Opinion matching) ────────────────────────────────────
export async function logListeningPart3Attempted({
  taskId,
  score,
  total,
  playsUsed = null,
  source = "ListeningPart3",
}) {
  return logActivity("listening_part3_attempted", {
    taskId: taskId || null,
    score: typeof score === "number" ? score : null,
    total: typeof total === "number" ? total : null,
    playsUsed: typeof playsUsed === "number" ? playsUsed : null,
    source,
  });
}

export async function logListeningPart3Completed({
  taskId,
  playsUsed = null,
  source = "ListeningPart3",
}) {
  await saveListeningProgress(taskId, "part3");
  return logActivity("listening_part3_completed", {
    taskId: taskId || null,
    playsUsed: typeof playsUsed === "number" ? playsUsed : null,
    source,
  });
}

// ─── LISTENING PART 4 (Longer monologues) ───────────────────────────────────
export async function logListeningPart4Attempted({
  taskId,
  score,
  total,
  playsUsed = null,
  source = "ListeningPart4",
}) {
  return logActivity("listening_part4_attempted", {
    taskId: taskId || null,
    score: typeof score === "number" ? score : null,
    total: typeof total === "number" ? total : null,
    playsUsed: typeof playsUsed === "number" ? playsUsed : null,
    source,
  });
}

export async function logListeningPart4Completed({
  taskId,
  playsUsed = null,
  source = "ListeningPart4",
}) {
  await saveListeningProgress(taskId, "part4");
  return logActivity("listening_part4_completed", {
    taskId: taskId || null,
    playsUsed: typeof playsUsed === "number" ? playsUsed : null,
    source,
  });
}

export async function saveListeningProgress(taskId, part = "part1") {
  const uid = auth.currentUser?.uid;
  if (!uid || !taskId) return;

  const ref = doc(db, "users", uid, "listeningProgress", `${part}:${taskId}`);
  await setDoc(
    ref,
    {
      part,
      taskId,
      completed: true,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// ─── WRITING SUBMISSION ────────────────────────────────────────────────────
export async function logWritingSubmitted(details) {
  // details: { part: "part1"|"part2"|"part3"|"part4", taskId?, wordCount?, counts? ... }
  return logActivity("writing_submitted", details);
}



// ─── REPORTS HELPER ───────────────────────────────────────────────────────────

// re-create the old reports collection helper
const reportsCollection = collection(db, "reports");
const hubAccessRequestsCollection = collection(db, "hubAccessRequests");

/**
 * Send a report document, now including the full question text.
 *
 * @param {{
 *   itemId: string,
 *   question: string,
 *   issue: string,
 *   comments?: string,
 *   level?: string|null,
 *   selectedOption?: string|null,
 *   correctOption?: string|null,
 * }} args
 */
export async function sendReport({
  itemId,
  question,
  issue,
  comments = "",
  level = null,
  selectedOption = null,
  correctOption = null,
}) {
  const user = auth.currentUser;
  return addDoc(reportsCollection, {
    itemId,
    question,
    issue,
    comments,
    level,
    selectedOption,
    correctOption,
    userId: user?.uid ?? null,
    userEmail: user?.email ?? null,
    createdAt: serverTimestamp(),
  });
}

export async function sendHubAccessRequest({ note = "" } = {}) {
  const user = auth.currentUser;

  return addDoc(hubAccessRequestsCollection, {
    site: "seifhub",
    note: note.trim(),
    userId: user?.uid ?? null,
    userEmail: user?.email ?? null,
    userName: user?.displayName ?? "",
    createdAt: serverTimestamp(),
    status: "new",
  });
}

export async function saveHubGrammarSubmission(payload) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const colRef = collection(db, "users", uid, "hubGrammarSubmissions");
  await addDoc(colRef, {
    ...payload,
    app: "seifhub",
    createdAt: serverTimestamp(),
  });

  await logActivity("hub_grammar_submitted", {
    activityId: payload.activityId || "",
    activityTitle: payload.activityTitle || "",
    score: payload.score ?? null,
    correct: payload.correct ?? null,
    total: payload.total ?? null,
  });
}

export async function saveHubDictationSession(payload) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const colRef = collection(db, "users", uid, "hubDictationSessions");
  await addDoc(colRef, {
    ...payload,
    app: "seifhub",
    createdAt: serverTimestamp(),
  });

  await logActivity("hub_dictation_completed", {
    mode: payload.mode || "game",
    setId: payload.setId || "",
    setLabel: payload.setLabel || "",
    score: payload.score ?? null,
    completed: payload.completed ?? null,
    totalPlayed: payload.totalPlayed ?? null,
    trainingTarget: payload.trainingTarget ?? null,
  });
}

export async function fetchHubGrammarSubmissions(n = 20, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const qy = query(
    collection(db, "users", realUid, "hubGrammarSubmissions"),
    orderBy("createdAt", "desc"),
    limit(n)
  );

  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function listTeacherStudents(uid) {
  const realUid = uid || auth.currentUser?.uid;
  if (!realUid) return [];

  const snap = await getDocs(query(collection(db, "users"), where("teacherId", "==", realUid)));
  return snap.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }))
    .sort((a, b) => {
      const aLabel = String(a.displayName || a.name || a.username || a.email || a.id || "").toLowerCase();
      const bLabel = String(b.displayName || b.name || b.username || b.email || b.id || "").toLowerCase();
      return aLabel.localeCompare(bLabel);
    });
}

export async function listTeacherStudentsWithRosterMeta(uid) {
  const realUid = uid || auth.currentUser?.uid;
  if (!realUid) return [];

  const [studentSnap, rosterSnap] = await Promise.all([
    getDocs(query(collection(db, "users"), where("teacherId", "==", realUid))),
    getDocs(collection(db, "users", realUid, "studentRoster")),
  ]);

  const rosterMetaById = {};
  rosterSnap.forEach((entry) => {
    rosterMetaById[entry.id] = entry.data() || {};
  });

  return studentSnap.docs
    .map((entry) => {
      const data = entry.data() || {};
      const rosterMeta = rosterMetaById[entry.id] || {};
      return {
        id: entry.id,
        ...data,
        ...rosterMeta,
        className: String(rosterMeta.className || data.className || "").trim(),
      };
    })
    .sort((a, b) => {
      const aLabel = String(a.displayName || a.name || a.username || a.email || a.id || "").toLowerCase();
      const bLabel = String(b.displayName || b.name || b.username || b.email || b.id || "").toLowerCase();
      return aLabel.localeCompare(bLabel);
    });
}

export async function fetchKeywordTransformations() {
  const ref = doc(db, "masterSentences", "all");
  const snap = await getDoc(ref);
  if (!snap.exists()) return [];

  const data = snap.data() || {};
  return Array.isArray(data.list) ? data.list : [];
}

export async function fetchOpenClozeItems() {
  const ref = doc(db, "masterOpenCloze", "all");
  const snap = await getDoc(ref);
  if (!snap.exists()) return [];

  const data = snap.data() || {};
  return Array.isArray(data.list) ? data.list : [];
}

export async function fetchCoursePackAnnotations(page, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid || !Number.isFinite(page)) return [];

  const ref = doc(db, "users", realUid, "coursePackAnnotations", `page-${page}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return [];

  const data = snap.data() || {};
  return Array.isArray(data.annotations) ? data.annotations : [];
}

export async function saveCoursePackAnnotations(page, annotations, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid || !Number.isFinite(page)) return;

  const safeAnnotations = Array.isArray(annotations)
    ? annotations.map((annotation) => ({
        id: String(annotation?.id || ""),
        type: String(annotation?.type || ""),
        x: Number.isFinite(annotation?.x) ? annotation.x : 0,
        y: Number.isFinite(annotation?.y) ? annotation.y : 0,
        w: Number.isFinite(annotation?.w) ? annotation.w : undefined,
        h: Number.isFinite(annotation?.h) ? annotation.h : undefined,
        text: typeof annotation?.text === "string" ? annotation.text : undefined,
        color: typeof annotation?.color === "string" ? annotation.color : undefined,
        fontSize: Number.isFinite(annotation?.fontSize) ? annotation.fontSize : undefined,
        points: Array.isArray(annotation?.points)
          ? annotation.points
              .map((point) => ({
                x: Number.isFinite(point?.x) ? point.x : 0,
                y: Number.isFinite(point?.y) ? point.y : 0,
              }))
              .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
          : undefined,
      }))
    : [];

  const ref = doc(db, "users", realUid, "coursePackAnnotations", `page-${page}`);
  await setDoc(
    ref,
    {
      page,
      annotations: safeAnnotations,
      updatedAt: serverTimestamp(),
      app: "coursepack",
    },
    { merge: true }
  );
}

export async function saveHubKeywordResult(itemId, tags, isCorrect) {
  const uid = auth.currentUser?.uid;
  if (!uid || !itemId) return;

  const ref = doc(db, "users", uid, "hubKeywordProgress", itemId);
  await setDoc(
    ref,
    {
      itemId,
      tags: tags || "",
      attempts: increment(1),
      everCorrect: isCorrect ? true : increment(0),
      lastCorrect: !!isCorrect,
      lastAnsweredAt: serverTimestamp(),
      app: "seifhub",
    },
    { merge: true }
  );
}

export async function fetchHubKeywordDashboard(uid) {
  const realUid = _uidOrCurrent(uid);
  const items = await fetchKeywordTransformations();
  const totalsByLevel = { b1: 0, b2: 0, c1: 0, c2: 0 };

  items.forEach((item) => {
    const tags = String(item.tags || "")
      .split(",")
      .map((s) => s.trim().toLowerCase());
    ["b1", "b2", "c1", "c2"].forEach((level) => {
      if (tags.includes(level)) totalsByLevel[level] += 1;
    });
  });

  if (!realUid) {
    return {
      answered: 0,
      correct: 0,
      total: items.length,
      byLevel: Object.fromEntries(
        Object.entries(totalsByLevel).map(([level, total]) => [level, { answered: 0, correct: 0, total }])
      ),
    };
  }

  const snap = await getDocs(collection(db, "users", realUid, "hubKeywordProgress"));
  let answered = 0;
  let correct = 0;
  const byLevel = {
    b1: { answered: 0, correct: 0, total: totalsByLevel.b1 },
    b2: { answered: 0, correct: 0, total: totalsByLevel.b2 },
    c1: { answered: 0, correct: 0, total: totalsByLevel.c1 },
    c2: { answered: 0, correct: 0, total: totalsByLevel.c2 },
  };

  snap.forEach((docSnap) => {
    answered += 1;
    const data = docSnap.data() || {};
    if (data.everCorrect) correct += 1;
    const tags = String(data.tags || "")
      .split(",")
      .map((s) => s.trim().toLowerCase());
    ["b1", "b2", "c1", "c2"].forEach((level) => {
      if (tags.includes(level)) {
        byLevel[level].answered += 1;
        if (data.everCorrect) byLevel[level].correct += 1;
      }
    });
  });

  return { answered, correct, total: items.length, byLevel };
}

export async function fetchSeenHubKeywordItemIds(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const snap = await getDocs(collection(db, "users", realUid, "hubKeywordProgress"));
  return snap.docs.map((d) => d.id);
}

export async function saveHubOpenClozeResult(itemId, tags, isCorrect) {
  const uid = auth.currentUser?.uid;
  if (!uid || !itemId) return;

  const ref = doc(db, "users", uid, "hubOpenClozeProgress", itemId);
  await setDoc(
    ref,
    {
      itemId,
      tags: tags || "",
      attempts: increment(1),
      everCorrect: isCorrect ? true : increment(0),
      lastCorrect: !!isCorrect,
      lastAnsweredAt: serverTimestamp(),
      app: "seifhub",
    },
    { merge: true }
  );
}

export async function fetchSeenHubOpenClozeItemIds(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const snap = await getDocs(collection(db, "users", realUid, "hubOpenClozeProgress"));
  return snap.docs.map((d) => d.id);
}

export async function fetchHubOpenClozeDashboard(uid) {
  const realUid = _uidOrCurrent(uid);
  const items = await fetchOpenClozeItems();
  const totalsByLevel = { b1: 0, b2: 0, c1: 0, c2: 0 };

  items.forEach((item) => {
    const tags = String(item.tags || "")
      .split(",")
      .map((s) => s.trim().toLowerCase());
    ["b1", "b2", "c1", "c2"].forEach((level) => {
      if (tags.includes(level)) totalsByLevel[level] += 1;
    });
  });

  if (!realUid) {
    return {
      answered: 0,
      correct: 0,
      total: items.length,
      byLevel: Object.fromEntries(
        Object.entries(totalsByLevel).map(([level, total]) => [level, { answered: 0, correct: 0, total }])
      ),
    };
  }

  const snap = await getDocs(collection(db, "users", realUid, "hubOpenClozeProgress"));
  let answered = 0;
  let correct = 0;
  const byLevel = {
    b1: { answered: 0, correct: 0, total: totalsByLevel.b1 },
    b2: { answered: 0, correct: 0, total: totalsByLevel.b2 },
    c1: { answered: 0, correct: 0, total: totalsByLevel.c1 },
    c2: { answered: 0, correct: 0, total: totalsByLevel.c2 },
  };

  snap.forEach((docSnap) => {
    answered += 1;
    const data = docSnap.data() || {};
    if (data.everCorrect) correct += 1;
    const tags = String(data.tags || "")
      .split(",")
      .map((s) => s.trim().toLowerCase());
    ["b1", "b2", "c1", "c2"].forEach((level) => {
      if (tags.includes(level)) {
        byLevel[level].answered += 1;
        if (data.everCorrect) byLevel[level].correct += 1;
      }
    });
  });

  return { answered, correct, total: items.length, byLevel };
}

export async function fetchWordFormationItems() {
  const snap = await getDocs(collection(db, "masterWordFormations"));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function saveHubWordFormationResult(itemId, tags, isCorrect) {
  const uid = auth.currentUser?.uid;
  if (!uid || !itemId) return;

  const ref = doc(db, "users", uid, "hubWordFormationProgress", itemId);
  await setDoc(
    ref,
    {
      itemId,
      tags: tags || "",
      attempts: increment(1),
      everCorrect: isCorrect ? true : increment(0),
      lastCorrect: !!isCorrect,
      lastAnsweredAt: serverTimestamp(),
      app: "seifhub",
    },
    { merge: true }
  );
}

export async function fetchHubWordFormationDashboard(uid) {
  const realUid = _uidOrCurrent(uid);
  const items = await fetchWordFormationItems();
  const totalsByLevel = { b1: 0, b2: 0, c1: 0, c2: 0 };

  items.forEach((item) => {
    const tags = String(item.tags || "")
      .split(",")
      .map((s) => s.trim().toLowerCase());
    ["b1", "b2", "c1", "c2"].forEach((level) => {
      if (tags.includes(level)) totalsByLevel[level] += 1;
    });
  });

  if (!realUid) {
    return {
      answered: 0,
      correct: 0,
      total: items.length,
      byLevel: Object.fromEntries(
        Object.entries(totalsByLevel).map(([level, total]) => [level, { answered: 0, correct: 0, total }])
      ),
    };
  }

  const snap = await getDocs(collection(db, "users", realUid, "hubWordFormationProgress"));
  let answered = 0;
  let correct = 0;
  const byLevel = {
    b1: { answered: 0, correct: 0, total: totalsByLevel.b1 },
    b2: { answered: 0, correct: 0, total: totalsByLevel.b2 },
    c1: { answered: 0, correct: 0, total: totalsByLevel.c1 },
    c2: { answered: 0, correct: 0, total: totalsByLevel.c2 },
  };

  snap.forEach((docSnap) => {
    answered += 1;
    const data = docSnap.data() || {};
    if (data.everCorrect) correct += 1;
    const tags = String(data.tags || "")
      .split(",")
      .map((s) => s.trim().toLowerCase());
    ["b1", "b2", "c1", "c2"].forEach((level) => {
      if (tags.includes(level)) {
        byLevel[level].answered += 1;
        if (data.everCorrect) byLevel[level].correct += 1;
      }
    });
  });

  return { answered, correct, total: items.length, byLevel };
}

export async function fetchSeenHubWordFormationItemIds(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const snap = await getDocs(collection(db, "users", realUid, "hubWordFormationProgress"));
  return snap.docs.map((d) => d.id);
}

export async function fetchHubSavedFlashcards({ uid, category = "", deckId = "" } = {}) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  let qy = collection(db, "users", realUid, "hubSavedFlashcards");

  if (category && deckId) {
    qy = query(qy, where("category", "==", category), where("deckId", "==", deckId));
  } else if (category) {
    qy = query(qy, where("category", "==", category));
  } else if (deckId) {
    qy = query(qy, where("deckId", "==", deckId));
  }

  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function saveHubFlashcard(card) {
  const uid = auth.currentUser?.uid;
  if (!uid || !card?.saveId) return;

  const ref = doc(db, "users", uid, "hubSavedFlashcards", card.saveId);
  await setDoc(
    ref,
    {
      ...card,
      app: "seifhub",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function removeHubFlashcard(saveId) {
  const uid = auth.currentUser?.uid;
  if (!uid || !saveId) return;

  await deleteDoc(doc(db, "users", uid, "hubSavedFlashcards", saveId));
}

export async function fetchHubWordFormationFavourites(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const snap = await getDocs(collection(db, "users", realUid, "hubWordFormationFavourites"));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function fetchHubOpenClozeFavourites(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const snap = await getDocs(collection(db, "users", realUid, "hubOpenClozeFavourites"));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function saveHubOpenClozeFavourite(item) {
  const uid = auth.currentUser?.uid;
  if (!uid || !item?.itemId) return;

  const ref = doc(db, "users", uid, "hubOpenClozeFavourites", item.itemId);
  await setDoc(
    ref,
    {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      app: "seifhub",
    },
    { merge: true }
  );
}

export async function removeHubOpenClozeFavourite(itemId) {
  const uid = auth.currentUser?.uid;
  if (!uid || !itemId) return;

  await deleteDoc(doc(db, "users", uid, "hubOpenClozeFavourites", itemId));
}

export async function recordHubOpenClozeMistake(item) {
  const uid = auth.currentUser?.uid;
  if (!uid || !item?.itemId) return;

  await addDoc(collection(db, "users", uid, "hubOpenClozeMistakes"), {
    ...item,
    app: "seifhub",
    createdAt: serverTimestamp(),
  });
}

export async function clearHubOpenClozeMistakes(itemId, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid || !itemId) return;

  const snap = await getDocs(
    query(
      collection(db, "users", realUid, "hubOpenClozeMistakes"),
      where("itemId", "==", itemId)
    )
  );

  await Promise.all(snap.docs.map((entry) => deleteDoc(entry.ref)));
}

export async function fetchHubOpenClozeMistakes(n = 15, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const qy = query(
    collection(db, "users", realUid, "hubOpenClozeMistakes"),
    orderBy("createdAt", "desc"),
    limit(n)
  );

  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function saveHubWordFormationFavourite(item) {
  const uid = auth.currentUser?.uid;
  if (!uid || !item?.itemId) return;

  const ref = doc(db, "users", uid, "hubWordFormationFavourites", item.itemId);
  await setDoc(
    ref,
    {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      app: "seifhub",
    },
    { merge: true }
  );
}

export async function removeHubWordFormationFavourite(itemId) {
  const uid = auth.currentUser?.uid;
  if (!uid || !itemId) return;

  await deleteDoc(doc(db, "users", uid, "hubWordFormationFavourites", itemId));
}

export async function recordHubWordFormationMistake(item) {
  const uid = auth.currentUser?.uid;
  if (!uid || !item?.itemId) return;

  await addDoc(collection(db, "users", uid, "hubWordFormationMistakes"), {
    ...item,
    app: "seifhub",
    createdAt: serverTimestamp(),
  });
}

export async function clearHubWordFormationMistakes(itemId, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid || !itemId) return;

  const snap = await getDocs(
    query(
      collection(db, "users", realUid, "hubWordFormationMistakes"),
      where("itemId", "==", itemId)
    )
  );

  await Promise.all(snap.docs.map((entry) => deleteDoc(entry.ref)));
}

export async function fetchHubWordFormationMistakes(n = 15, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const qy = query(
    collection(db, "users", realUid, "hubWordFormationMistakes"),
    orderBy("createdAt", "desc"),
    limit(n)
  );

  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function fetchHubKeywordFavourites(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const snap = await getDocs(collection(db, "users", realUid, "hubKeywordFavourites"));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function saveHubKeywordFavourite(item) {
  const uid = auth.currentUser?.uid;
  if (!uid || !item?.itemId) return;

  const ref = doc(db, "users", uid, "hubKeywordFavourites", item.itemId);
  await setDoc(
    ref,
    {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      app: "seifhub",
    },
    { merge: true }
  );
}

export async function removeHubKeywordFavourite(itemId) {
  const uid = auth.currentUser?.uid;
  if (!uid || !itemId) return;

  await deleteDoc(doc(db, "users", uid, "hubKeywordFavourites", itemId));
}

export async function recordHubKeywordMistake(item) {
  const uid = auth.currentUser?.uid;
  if (!uid || !item?.itemId) return;

  await addDoc(collection(db, "users", uid, "hubKeywordMistakes"), {
    ...item,
    app: "seifhub",
    createdAt: serverTimestamp(),
  });
}

export async function clearHubKeywordMistakes(itemId, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid || !itemId) return;

  const snap = await getDocs(
    query(
      collection(db, "users", realUid, "hubKeywordMistakes"),
      where("itemId", "==", itemId)
    )
  );

  await Promise.all(snap.docs.map((entry) => deleteDoc(entry.ref)));
}

export async function fetchHubKeywordMistakes(n = 15, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const qy = query(
    collection(db, "users", realUid, "hubKeywordMistakes"),
    orderBy("createdAt", "desc"),
    limit(n)
  );

  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

// — READING PROGRESS (Part 2 reorder) ————————————————

/**
 * Save (or update) completion for a reading task for the current user.
 * @param {string} taskId - use the same ID you show in the dropdown (e.g. `${parentId}__${textId}`)
 */
export async function saveReadingCompletion(taskId) {
  const uid = auth.currentUser?.uid;
  if (!uid) return; // silently skip if not signed in
  // /users/{uid}/readingProgress/{taskId}
  const ref = doc(db, "users", uid, "readingProgress", taskId);
  await setDoc(ref, { completed: true, updatedAt: serverTimestamp() }, { merge: true });
}

export async function saveReadingProgress(taskId, part = "part2") {
  const uid = auth.currentUser?.uid;
  if (!uid || !taskId) return;

  const ref = doc(db, "users", uid, "readingProgress", `${part}:${taskId}`);
  await setDoc(
    ref,
    {
      part,
      taskId,
      completed: true,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Fetch a Set of completed reading task IDs for the current user.
 * @returns {Promise<Set<string>>}
 */
export async function fetchReadingCompletions() {
  const uid = auth.currentUser?.uid;
  if (!uid) return new Set();
  const snap = await getDocs(collection(db, "users", uid, "readingProgress"));
  const done = new Set();
  snap.forEach(d => { if (d.data()?.completed) done.add(d.id); });
  return done;
}

/** Reading progress counts per part */
export async function fetchReadingCounts(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return { part2: 0, part3: 0, part4: 0 };

  const counts = { part2: 0, part3: 0, part4: 0 };

  const snap = await getDocs(collection(db, "users", realUid, "readingProgress"));

  snap.forEach((d) => {
    const data = d.data() || {};
    const part = data.part;

    // Backward compatibility:
    // old Part 2 docs may not have a part field, so count them as part2
    if (!part || part === "part2") counts.part2 += 1;
    if (part === "part3") counts.part3 += 1;
    if (part === "part4") counts.part4 += 1;
  });

  return counts;
}

/** Listening progress counts per part */
export async function fetchListeningCounts(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return { part1: 0, part2: 0, part3: 0, part4: 0 };

  const counts = { part1: 0, part2: 0, part3: 0, part4: 0 };

  const snap = await getDocs(collection(db, "users", realUid, "listeningProgress"));

  snap.forEach((d) => {
    const data = d.data() || {};
    const part = data.part;

    if (part === "part1") counts.part1 += 1;
    if (part === "part2") counts.part2 += 1;
    if (part === "part3") counts.part3 += 1;
    if (part === "part4") counts.part4 += 1;
  });

  return counts;
}

// — SPEAKING PROGRESS (Parts 1–4) ———————————————————————————————
// These are the new helpers you can call from Parts 2/3/4 components via your
// existing speakingProgress.js utilities (loadSpeakingDone / markSpeakingDone).

/**
 * Save a speaking completion for the current user.
 * Stores at /users/{uid}/speakingProgress with docId `${part}:${taskId}`.
 * @param {string} taskId  (e.g. 'photo-set-07')
 * @param {'part1'|'part2'|'part3'|'part4'} part
 */
export async function saveSpeakingCompletion(taskId, part = "part2") {
  const uid = auth.currentUser?.uid;
  if (!uid) return; // silently skip when signed out (localStorage handles fallback)
  const colRef = collection(db, "users", uid, "speakingProgress");
  const docId  = `${part}:${taskId}`;
  const ref    = doc(colRef, docId);
  await setDoc(
    ref,
    {
      part,
      taskId,
      completed: true,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Fetch the set of speaking completions for a given part.
 * Returns an array of doc IDs (`${part}:${taskId}`).
 * Your normalizer can strip the prefix to plain taskIds for display.
 * @param {'part1'|'part2'|'part3'|'part4'} part
 * @returns {Promise<string[]>}
 */
export async function fetchSpeakingCompletions(part = "part2") {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];
  const colRef = collection(db, "users", uid, "speakingProgress");
  const qPart  = query(colRef, where("part", "==", part));
  const snap   = await getDocs(qPart);
  return snap.docs.map(d => d.id); // `${part}:${taskId}`
}


// — WRITING PART 1: save a session (questions + answers) ————————————————
/**
 * Save one Writing Part 1 session for the current user.
 * Each session stores the 5 questions with the student's answers.
 */
export async function saveWritingP1Submission(payload) {
  const uid = auth.currentUser?.uid;
  if (!uid) return; // silently skip if signed out

  const colRef = collection(db, "users", uid, "writingP1Sessions");
  await addDoc(colRef, {
    type: "part1",
    items: payload.items,
    count: payload.items?.length ?? 0,
    createdAt: serverTimestamp(),
  });
}

// — WRITING PART 2: save short-form answers ————————————————
/**
 * Save one Writing Part 2 submission (single 20–30w paragraph) for the current user.
 * payload shape from the UI:
 * { taskId, answerText, answerHTML, counts: { answer } }
 */
export async function saveWritingP2Submission(payload) {
  const uid = auth.currentUser?.uid;
  if (!uid) return; // silently skip if signed out

  const colRef = collection(db, "users", uid, "writingP2Submissions");
  await addDoc(colRef, {
    type: "part2",
    ...payload,
    createdAt: serverTimestamp(),
  });
}

/** Fetch Writing Part 2 submissions (latest first) */
export async function fetchWritingP2Submissions(n = 20, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const qy = query(
    collection(db, "users", realUid, "writingP2Submissions"),
    orderBy("createdAt", "desc"),
    limit(n)
  );

  const snap = await getDocs(qy);
  return snap.docs.map((d) => {
    const data = d.data() || {};
    return {
      id: d.id,
      createdAt: data.createdAt || null,
      taskId: data.taskId || null,
      answerText: data.answerText || "",
      answerHTML: data.answerHTML || "",
      counts: data.counts || { answer: 0 },
    };
  });
}


/** Count of reading completions */
export async function fetchReadingProgressCount(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return 0;

  const snap = await getDocs(
    collection(db, "users", realUid, "readingProgress")
  );
  return snap.size || 0;
}

/** Speaking progress counts per part */
export async function fetchSpeakingCounts(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return { part1: 0, part2: 0, part3: 0, part4: 0 };

  const col = collection(db, "users", realUid, "speakingProgress");
  const counts = { part1: 0, part2: 0, part3: 0, part4: 0 };
  const snap = await getDocs(col);
  snap.forEach((d) => {
    const p = d.data()?.part;
    if (p && counts[p] !== undefined) counts[p] += 1;
  });
  return counts;
}

/** Recent mistakes (IDs only) */
export async function fetchRecentMistakes(n = 10, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const q = query(
    collection(db, "users", realUid, "mistakes"),
    orderBy("answeredAt", "desc"),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data()?.itemId).filter(Boolean);
}


/** Recent favourites (IDs only) */
export async function fetchRecentFavourites(n = 10, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const q = query(
    collection(db, "users", realUid, "favourites"),
    orderBy("createdAt", "desc"),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data()?.itemId).filter(Boolean);
}

/** Fetch Writing Part 1 sessions (latest first) */
export async function fetchWritingP1Sessions(n = 20, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const q = query(
    collection(db, "users", realUid, "writingP1Sessions"),
    orderBy("createdAt", "desc"),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    createdAt: d.data()?.createdAt || null,
    items: d.data()?.items || [],
  }));
}


// — WRITING PART 1 GUIDE: save "Improve the answer" attempts —————————————
/**
 * Saves a single attempt from the guide's FixOpen widget when the user
 * reveals the suggestion. One doc per reveal.
 *
 * payload = { prompt, original, suggestion, attempt }
 */
export async function saveWritingP1GuideEdits(payload) {
  const uid = auth.currentUser?.uid;
  if (!uid) return; // silently skip if signed out (guide is low-stakes)

  const colRef = collection(db, "users", uid, "writingP1GuideEdits");
  await addDoc(colRef, {
    ...payload,               // prompt, original, suggestion, attempt
    createdAt: serverTimestamp(),
    kind: "p1_guide_fixopen",
    app: "aptis-trainer",
  });
}

export async function fetchWritingP1GuideEdits(n = 100, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const col = collection(db, "users", realUid, "writingP1GuideEdits");
  const qy = query(col, orderBy("createdAt", "desc"), limit(n));
  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// — WRITING PART 3: save three chat responses ————————————————
/**
 * Save one Writing Part 3 submission (three 30–40w chat replies) for the current user.
 * Suggested payload from the UI:
 * {
 *   taskId,
 *   answersText: [string, string, string],
 *   answersHTML: [string, string, string],
 *   counts: number[]   // word counts per answer
 * }
 */
export async function saveWritingP3Submission(payload) {
  const uid = auth.currentUser?.uid;
  if (!uid) return; // silently skip if signed out

  const colRef = collection(db, "users", uid, "writingP3Submissions");
  await addDoc(colRef, {
    type: "part3",
    ...payload,
    createdAt: serverTimestamp(),
  });
}

/** Fetch Writing Part 3 submissions (latest first) */
export async function fetchWritingP3Submissions(n = 20, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const qy = query(
    collection(db, "users", realUid, "writingP3Submissions"),
    orderBy("createdAt", "desc"),
    limit(n)
  );

  const snap = await getDocs(qy);
  return snap.docs.map((d) => {
    const data = d.data() || {};
    return {
      id: d.id,
      createdAt: data.createdAt || null,
      taskId: data.taskId || null,
      answersText: data.answersText || ["", "", ""],
      answersHTML: data.answersHTML || ["", "", ""],
      counts: data.counts || [0, 0, 0],
    };
  });
}


// — WRITING PART 4: save an emails task ————————————————
/**
 * Save one Writing Part 4 submission (friend + formal emails) for the current user.
 * payload shape expected by the UI:
 * { taskId, friendText, formalText, counts: { friend, formal } }
 */
export async function saveWritingP4Submission(payload) {
  const uid = auth.currentUser?.uid;
  if (!uid) return; // silently skip if signed out

  const colRef = collection(db, "users", uid, "writingP4Submissions");
  await addDoc(colRef, {
    type: "part4",
    ...payload,
    createdAt: serverTimestamp(),
  });
}

/** Fetch Writing Part 4 submissions (latest first) */
export async function fetchWritingP4Submissions(n = 20, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const q = query(
    collection(db, "users", realUid, "writingP4Submissions"),
    orderBy("createdAt", "desc"),
    limit(n)
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data() || {};
    return {
      id: d.id,
      createdAt: data.createdAt || null,
      taskId: data.taskId || null,
      friendText: data.friendText || "",
      formalText: data.formalText || "",
      friendHTML: data.friendHTML || "",
      formalHTML: data.formalHTML || "",
      counts: data.counts || { friend: 0, formal: 0 },
    };
  });
}

// — WRITING PART 4 GUIDE: save "Tone Transformation" attempts —————————————
/**
 * Saves one reformulation attempt from the register guide (formal ↔ informal).
 * payload = { prompt, original, model, attempt }
 */
export async function saveWritingP4RegisterAttempts(payload) {
  const uid = auth.currentUser?.uid;
  if (!uid) return; // low-stakes guide → skip silently if signed out

  const colRef = collection(db, "users", uid, "writingP4RegisterAttempts");
  await addDoc(colRef, {
    ...payload,                 // prompt, original, model, attempt
    createdAt: serverTimestamp(),
    kind: "p4_register_fixopen",
    app: "aptis-trainer",
  });
}

/** Fetch Writing Part 4 Register/Tone attempts (latest first) */
export async function fetchWritingP4RegisterAttempts(n = 100, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const col = collection(db, "users", realUid, "writingP4RegisterAttempts");
  const qy = query(col, orderBy("createdAt", "desc"), limit(n));
  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// 🔊 SPEAKING – speculation free notes
export async function saveSpeakingSpeculationNote({ pictureId, text }) {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    // silently fail or throw, depending on how you want to handle it
    return;
  }

  const colRef = collection(db, "users", uid, "speakingSpeculationNotes");

  await addDoc(colRef, {
    pictureId: pictureId || null,
    text: text || "",
    createdAt: serverTimestamp(),
    app: "aptis-trainer",
    kind: "speaking_speculation_note",
  });
}

export async function fetchSpeakingSpeculationNotes(limitCount = 50, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const colRef = collection(db, "users", realUid, "speakingSpeculationNotes");
  const qy = query(colRef, orderBy("createdAt", "desc"), limit(limitCount));

  const snap = await getDocs(qy);
  return snap.docs.map((doc) => {
    const data = doc.data() || {};
    return {
      id: doc.id,
      text: data.text || "",
      pictureId: data.pictureId || null,
      createdAt: data.createdAt || null,
    };
  });
}


// /users/{uid}/vocabProgress/{topic}:{setId}

export async function saveVocabReviewResult({
  topic,
  setId,
  totalItems,
  correctFirstTry,
  mistakesCount,
}) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const docId = `${topic}:${setId}`;
  const ref = doc(db, "users", uid, "vocabProgress", docId);

  await setDoc(
    ref,
    {
      topic,
      setId,
      completedReview: true,
      attempts: increment(1),
      totalItems: totalItems ?? 0,
      mistakesTotal: increment(mistakesCount ?? 0),
      lastRun: {
        totalItems: totalItems ?? 0,
        correctFirstTry: correctFirstTry ?? 0,
        mistakesCount: mistakesCount ?? 0,
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function fetchVocabProgressByTopic(topic, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return {};

  const colRef = collection(db, "users", realUid, "vocabProgress");
  const qTopic = query(colRef, where("topic", "==", topic));
  const snap = await getDocs(qTopic);

  const result = {};
  snap.forEach((d) => {
    const data = d.data() || {};
    const setId = data.setId || (d.id.split(":")[1] || d.id);
    result[setId] = {
      completedReview: !!data.completedReview,
      attempts: data.attempts ?? 0,
      mistakesTotal: data.mistakesTotal ?? 0,
    };
  });

  return result;
}

export async function fetchVocabTopicCounts(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return {};

  const colRef = collection(db, "users", realUid, "vocabProgress");
  const snap = await getDocs(colRef);

  const stats = {}; // { [topic]: { completed, total } }

  snap.forEach((d) => {
    const data = d.data() || {};
    const topic = data.topic || "other";
    if (!stats[topic]) {
      stats[topic] = { completed: 0, total: 0 };
    }
    stats[topic].total += 1;
    if (data.completedReview) {
      stats[topic].completed += 1;
    }
  });

  return stats;
}
/**
 * Create a new grammar set owned by the current user.
 * @param {Object} data - { title, description, itemIds, levels, tags, visibility }
 * @returns {Promise<string>} The new document ID.
 */
export async function createGrammarSet(data) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Must be signed in to create a grammar set.");

  const ref = await addDoc(collection(db, "grammarSets"), {
    ...data,
    ownerId: uid,
    ownerEmail: auth.currentUser.email || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

/**
 * Update an existing grammar set (only fields you pass).
 * @param {string} id
 * @param {Object} data
 */
export async function updateGrammarSet(id, data) {
  const ref = doc(db, "grammarSets", id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Fetch a single grammar set by ID.
 */
export async function getGrammarSet(id) {
  const ref = doc(db, "grammarSets", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * List all published grammar sets (for student browsing).
 */
export async function listPublishedGrammarSets() {
  const q = query(
    collection(db, "grammarSets"),
    where("visibility", "==", "published"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * List grammar sets created by the current user (for teacher dashboard).
 */
export async function listMyGrammarSets() {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];
  const q = query(
    collection(db, "grammarSets"),
    where("ownerId", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteGrammarSet(setId) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to delete a set.");
  }

  const ref = doc(db, "grammarSets", setId); // adjust collection name if needed
  await deleteDoc(ref);
}

export async function submitGrammarSetAttempt({
  setId,
  setTitle,
  ownerUid,
  studentUid,
  studentEmail,
  score,
  total,
  answers,
}) {
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;

  const user = auth.currentUser;

  const docRef = await addDoc(collection(db, "grammarSetAttempts"), {
    setId,
    setTitle,
    ownerUid,
    studentUid,
    studentEmail,
    studentName: user?.displayName || null,
    // later you can also load username from the users doc if you like
    score,
    total,
    checkedCount: total,
    percent,
    answers,
    startedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    submittedAt: serverTimestamp(),
    completed: true,
  });

  return docRef.id;
}

export async function createGrammarSetAttemptDraft({
  setId,
  setTitle,
  ownerUid,
  studentUid,
  studentEmail,
  score,
  total,
  checkedCount,
  answers,
}) {
  const user = auth.currentUser;

  const docRef = await addDoc(collection(db, "grammarSetAttempts"), {
    setId,
    setTitle,
    ownerUid,
    studentUid,
    studentEmail,
    studentName: user?.displayName || null,
    score,
    total,
    checkedCount,
    percent: checkedCount > 0 ? Math.round((score / checkedCount) * 100) : 0,
    answers,
    startedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    completed: false,
  });

  return docRef.id;
}

export async function listGrammarSetAttemptsForStudent(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const snap = await getDocs(
    query(collection(db, "grammarSetAttempts"), where("studentUid", "==", realUid))
  );

  return snap.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }))
    .sort((a, b) => {
      const aTime =
        a?.submittedAt?.toMillis?.() ||
        a?.updatedAt?.toMillis?.() ||
        a?.startedAt?.toMillis?.() ||
        0;
      const bTime =
        b?.submittedAt?.toMillis?.() ||
        b?.updatedAt?.toMillis?.() ||
        b?.startedAt?.toMillis?.() ||
        0;
      return bTime - aTime;
    });
}

export async function createAssignedActivity(data) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Must be signed in to create an assignment.");

  const ref = await addDoc(collection(db, "assignedActivities"), {
    ...data,
    teacherUid: data.teacherUid || uid,
    teacherEmail: data.teacherEmail || auth.currentUser?.email || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: data.status || "active",
  });

  return ref.id;
}

export async function listAssignedActivitiesForTeacher(uid) {
  const realUid = uid || auth.currentUser?.uid;
  if (!realUid) return [];

  const snap = await getDocs(
    query(collection(db, "assignedActivities"), where("teacherUid", "==", realUid))
  );

  return snap.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }))
    .sort((a, b) => {
      const aTime = a?.createdAt?.toMillis?.() || 0;
      const bTime = b?.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
}

export async function listAssignedActivitiesForStudent(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const snap = await getDocs(
    query(collection(db, "assignedActivities"), where("targetStudentIds", "array-contains", realUid))
  );

  return snap.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }))
    .filter((entry) => (entry.status || "active") !== "archived")
    .sort((a, b) => {
      const aTime = a?.createdAt?.toMillis?.() || 0;
      const bTime = b?.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
}

export async function updateGrammarSetAttemptDraft(attemptId, data) {
  if (!attemptId) throw new Error("Attempt ID is required.");

  const checkedCount = Number(data?.checkedCount || 0);
  const score = Number(data?.score || 0);

  await updateDoc(doc(db, "grammarSetAttempts", attemptId), {
    ...data,
    percent: checkedCount > 0 ? Math.round((score / checkedCount) * 100) : 0,
    updatedAt: serverTimestamp(),
  });
}

/**
 * List all attempts for one of *my* grammar sets, newest first.
 * (Filters by ownerUid AND setId.)
 */
export async function listAttemptsForMyGrammarSet(setId) {
  const uid = auth.currentUser?.uid;
  if (!uid || !setId) return [];

  const q = query(
    collection(db, "grammarSetAttempts"),
    where("ownerUid", "==", uid),
    where("setId", "==", setId)
  );

  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      const aTime =
        a.updatedAt?.toMillis?.() ??
        a.submittedAt?.toMillis?.() ??
        a.startedAt?.toMillis?.() ??
        0;
      const bTime =
        b.updatedAt?.toMillis?.() ??
        b.submittedAt?.toMillis?.() ??
        b.startedAt?.toMillis?.() ??
        0;
      return bTime - aTime;
    });
}

/**
 * Look up a user by username and return the email.
 * @param {string} username
 * @returns {Promise<string|null>} email or null if not found
 */
export async function lookupEmailByUsername(username) {
  if (!username) return null;

  const uname = username.toLowerCase().trim();

  const ref = doc(db, "usernames", uname);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const data = snap.data();
  return data.email || null;
}


// ─── GRAMMAR PROGRESS ────────────────────────────────────────────────────────
// Per-item progress is stored at /users/{uid}/grammarProgress/{itemId}
// Shape:
// { attempts: number, everCorrect: boolean, lastCorrect: boolean, lastAnsweredAt: TS }

/**
 * Save the result for one grammar item.
 * @param {string} itemId
 * @param {boolean} isCorrect
 */
export async function saveGrammarResult(itemId, isCorrect) {
  const uid = auth.currentUser?.uid;
  if (!uid) return; // guests handled by localStorage mirror in UI

  const ref = doc(db, "users", uid, "grammarProgress", itemId);
  await setDoc(
    ref,
    {
      attempts: increment(1),
      everCorrect: isCorrect ? true : increment(0), // stays true once correct
      lastCorrect: !!isCorrect,
      lastAnsweredAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Fetch the IDs of grammar items this user has ever answered.
 * Uses the doc IDs from /users/{uid}/grammarProgress.
 * @returns {Promise<string[]>}
 */
export async function fetchSeenGrammarItemIds(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return []; // guests/unknown: no seen items

  const col = collection(db, "users", realUid, "grammarProgress");
  const snap = await getDocs(col);

  return snap.docs.map((d) => d.id);
}


/**
 * Fetch dashboard counts for the profile progress bar:
 * answered = #docs in /grammarProgress,
 * correct  = #docs with everCorrect == true,
 * total    = total #grammar items in the bank (from /grammarItems).
 */
export async function fetchGrammarDashboard(uid) {
  const realUid = _uidOrCurrent(uid);

  // Total items from public grammarItems (same for everyone)
  const totalSnap = await getCountFromServer(
    query(collection(db, "grammarItems"))
  );
  const total = totalSnap.data().count || 0;

  if (!realUid) {
    // Guest or no uid: no per-user docs
    return { answered: 0, correct: 0, total };
  }

  const col = collection(db, "users", realUid, "grammarProgress");
  const progSnap = await getDocs(col);

  let answered = 0;
  let correct = 0;
  progSnap.forEach((d) => {
    answered += 1;
    if (d.data()?.everCorrect) correct += 1;
  });

  return { answered, correct, total };
}

/**
 * Upload a PNG/JPG avatar to Storage and mirror its URL to Auth + Firestore.
 * Path: userAvatars/{uid}/badge.png
 */
// Upload a PNG/JPG avatar to Storage, then mirror URL to Auth + Firestore.
export async function uploadAvatarAndSave(file) {
  const user = auth.currentUser;
  if (!user) throw new Error("Must be signed in");

  const avatarRef = ref(storage, `userAvatars/${user.uid}/badge.png`);
  const task = uploadBytesResumable(avatarRef, file, {
    contentType: file?.type || "image/png", // important for rules
  });

  await new Promise((resolve, reject) => {
    task.on("state_changed", null, (err) => {
      console.error("[avatar] upload error:", err.code, err.message, err?.serverResponse);
      reject(err);
    }, resolve);
  });

  const url = await getDownloadURL(avatarRef);

  await updateProfile(user, { photoURL: url });
  await setDoc(doc(db, "users", user.uid), { photoURL: url }, { merge: true });

  return url;
}

function normalizeTargetStudentIds(targetStudentIds = []) {
  return [...new Set((Array.isArray(targetStudentIds) ? targetStudentIds : []).filter(Boolean))];
}

function buildCourseTestPin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createCourseTestSession({
  templateId,
  templateTitle,
  level,
  testKind,
  className = "",
  notes = "",
  targetStudentIds = [],
  startsAt = null,
  endsAt = null,
  accessMode = "assigned",
  requirePin = false,
  status = "scheduled",
  controlMode = "teacher-controlled",
}) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in.");

  const normalizedStudents = normalizeTargetStudentIds(targetStudentIds);
  const pin = requirePin ? buildCourseTestPin() : null;
  const normalizedControlMode =
    controlMode === "self-controlled" ? "self-controlled" : "teacher-controlled";
  const mainPaperState = normalizedControlMode === "self-controlled" ? "open" : "locked";
  const listeningState = normalizedControlMode === "self-controlled" ? "open" : "locked";
  const defaultEndBase =
    startsAt instanceof Date && !Number.isNaN(startsAt.getTime()) ? startsAt : new Date();
  const resolvedEndsAt =
    endsAt instanceof Date && !Number.isNaN(endsAt.getTime())
      ? endsAt
      : new Date(defaultEndBase.getTime() + 7 * 24 * 60 * 60 * 1000);

  const ref = await addDoc(collection(db, "courseTestSessions"), {
    templateId,
    templateTitle,
    level: level || null,
    testKind: testKind || null,
    teacherUid: user.uid,
    teacherEmail: user.email || null,
    teacherName: user.displayName || null,
    className: String(className || "").trim(),
    notes: String(notes || "").trim(),
    targetStudentIds: normalizedStudents,
    accessMode,
    controlMode: normalizedControlMode,
    mainPaperState,
    listeningState,
    accessPin: pin,
    requirePin: Boolean(requirePin),
    status,
    startsAt,
    endsAt: resolvedEndsAt,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { id: ref.id, accessPin: pin };
}

export async function listMyCourseTestSessions() {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];

  const q = query(collection(db, "courseTestSessions"), where("teacherUid", "==", uid));
  const snap = await getDocs(q);
  return snap.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }))
    .sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
}

export async function listAllCourseTestSessions() {
  const snap = await getDocs(collection(db, "courseTestSessions"));
  return snap.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }))
    .sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
}

export async function listStudentCourseTestSessions(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const q = query(
    collection(db, "courseTestSessions"),
    where("targetStudentIds", "array-contains", realUid)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }))
    .sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
}

export async function listStudentCourseTestAttempts(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const q = query(collection(db, "courseTestAttempts"), where("studentUid", "==", realUid));
  const snap = await getDocs(q);
  const rows = sortCourseTestAttempts(snap.docs.map((entry) => ({ id: entry.id, ...entry.data() })));
  const bySession = new Map();

  for (const row of rows) {
    if (!row.sessionId || bySession.has(row.sessionId)) continue;
    bySession.set(row.sessionId, row);
  }

  return Array.from(bySession.values());
}

export async function getCourseTestSession(sessionId) {
  if (!sessionId) return null;
  const snap = await getDoc(doc(db, "courseTestSessions", sessionId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateCourseTestSession(sessionId, data = {}) {
  if (!sessionId) throw new Error("Session ID is required.");
  await updateDoc(doc(db, "courseTestSessions", sessionId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCourseTestSession(sessionId) {
  if (!sessionId) throw new Error("Session ID is required.");
  await deleteDoc(doc(db, "courseTestSessions", sessionId));
}

export async function startCourseTestAttempt({
  sessionId,
  templateId,
  templateTitle,
  level,
  testKind,
  teacherUid,
  studentUid,
  studentEmail,
  studentName,
}) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in.");

  const ref = await addDoc(collection(db, "courseTestAttempts"), {
    sessionId,
    templateId,
    templateTitle,
    level: level || null,
    testKind: testKind || null,
    teacherUid,
    studentUid: studentUid || user.uid,
    studentEmail: studentEmail || user.email || null,
    studentName: studentName || user.displayName || null,
    sections: [],
    autoScore: 0,
    autoTotal: 0,
    percent: 0,
    completed: false,
    reviewRequired: false,
    reviewStatus: "not-submitted",
    startedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function saveCourseTestAttemptDraft(attemptId, data = {}) {
  if (!attemptId) throw new Error("Attempt ID is required.");

  const autoScore = Number(data.autoScore || 0);
  const autoTotal = Number(data.autoTotal || 0);

  await updateDoc(doc(db, "courseTestAttempts", attemptId), {
    ...data,
    percent: autoTotal > 0 ? Math.round((autoScore / autoTotal) * 100) : 0,
    updatedAt: serverTimestamp(),
  });
}

export async function submitCourseTestAttempt(attemptId, data = {}) {
  if (!attemptId) throw new Error("Attempt ID is required.");

  const autoScore = Number(data.autoScore || 0);
  const autoTotal = Number(data.autoTotal || 0);

  await updateDoc(doc(db, "courseTestAttempts", attemptId), {
    ...data,
    percent: autoTotal > 0 ? Math.round((autoScore / autoTotal) * 100) : 0,
    completed: true,
    reviewRequired: true,
    reviewStatus: "pending",
    submittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function saveCourseTestAttemptReview(attemptId, data = {}) {
  if (!attemptId) throw new Error("Attempt ID is required.");

  const teacherScore = Number(data.teacherScore || 0);
  const teacherTotal = Number(data.teacherTotal || 0);

  await updateDoc(doc(db, "courseTestAttempts", attemptId), {
    ...data,
    finalPercent: teacherTotal > 0 ? Math.round((teacherScore / teacherTotal) * 100) : 0,
    reviewRequired: false,
    reviewStatus: "reviewed",
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

function courseTestAttemptPriority(attempt = {}) {
  if (attempt.reviewStatus === "reviewed" || attempt.reviewedAt) return 3;
  if (attempt.completed || attempt.submittedAt) return 2;
  if (attempt.startedAt || attempt.updatedAt) return 1;
  return 0;
}

function courseTestAttemptSortTime(attempt = {}) {
  return (
    attempt.reviewedAt?.toMillis?.() ??
    attempt.submittedAt?.toMillis?.() ??
    attempt.updatedAt?.toMillis?.() ??
    attempt.startedAt?.toMillis?.() ??
    0
  );
}

function sortCourseTestAttempts(rows = []) {
  return [...rows].sort((a, b) => {
    const priorityDiff = courseTestAttemptPriority(b) - courseTestAttemptPriority(a);
    if (priorityDiff !== 0) return priorityDiff;
    return courseTestAttemptSortTime(b) - courseTestAttemptSortTime(a);
  });
}

export async function listAttemptsForMyCourseTestSession(sessionId) {
  const uid = auth.currentUser?.uid;
  if (!uid || !sessionId) return [];

  const q = query(
    collection(db, "courseTestAttempts"),
    where("teacherUid", "==", uid),
    where("sessionId", "==", sessionId)
  );
  const snap = await getDocs(q);
  return sortCourseTestAttempts(snap.docs.map((entry) => ({ id: entry.id, ...entry.data() })));
}

export async function listAttemptsForCourseTestSession(sessionId) {
  if (!sessionId) return [];

  const q = query(
    collection(db, "courseTestAttempts"),
    where("sessionId", "==", sessionId)
  );
  const snap = await getDocs(q);
  return sortCourseTestAttempts(snap.docs.map((entry) => ({ id: entry.id, ...entry.data() })));
}

export async function getMyCourseTestAttemptForSession(sessionId, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid || !sessionId) return null;

  const q = query(
    collection(db, "courseTestAttempts"),
    where("studentUid", "==", realUid),
    where("sessionId", "==", sessionId)
  );
  const snap = await getDocs(q);

  const rows = sortCourseTestAttempts(snap.docs.map((entry) => ({ id: entry.id, ...entry.data() })));

  return rows[0] || null;
}

/** Optional: use a preset image that already lives in your app bundle or CDN */
export async function setPresetAvatar(url) {
  const user = auth.currentUser;
  if (!user) throw new Error("Must be signed in");
  await updateProfile(user, { photoURL: url });
  await setDoc(doc(db, "users", user.uid), { photoURL: url }, { merge: true });
  return url;
}

// --- DEV ONLY: expose helpers for quick debugging in the browser console ---
if (import.meta.env.DEV) {
  // so you can run: auth.currentUser?.uid in DevTools
  // (make sure these names don't clash with anything else)
  window.auth = auth;
  window.storage = storage;

  // tiny 1x1 PNG upload tester: window._testUpload()
  window._testUpload = async () => {
    const u = auth.currentUser;
    if (!u) { console.warn('Not signed in'); return 'NO_AUTH'; }

    // 1x1 transparent PNG
    const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAqMBm6c6q8sAAAAASUVORK5CYII=';
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const file = new File([bytes], 'ping.png', { type: 'image/png' });

    const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
    const { updateProfile } = await import('firebase/auth');
    const { doc, setDoc } = await import('firebase/firestore');

    const avatarRef = ref(storage, `userAvatars/${u.uid}/badge.png`);
    const task = uploadBytesResumable(avatarRef, file, { contentType: file.type });

    const result = await new Promise((res, rej) => {
      task.on('state_changed', null, (err) => {
        console.error('[test upload] error:', err.code, err.message);
        rej(err);
      }, async () => {
        const url = await getDownloadURL(avatarRef);
        try {
          await updateProfile(u, { photoURL: url });
          await setDoc(doc(db, 'users', u.uid), { photoURL: url }, { merge: true });
        } catch {}
        res(url);
      });
    });

    console.log('[test upload] success URL:', result);
    return result;
  };
}
