// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

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
  storageBucket: "examplay-auth.appspot.com",
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
    await addDoc(collection(db, "activityLog"), {
      userId: user.uid,
      userEmail: user.email || null,
      type,                    // e.g. "grammar_session", "vocab_set_completed"
      details: details || {},  // small object with context
      createdAt: serverTimestamp(),
      app: "aptis-trainer",    // helps if you ever share a project
    });
  } catch (err) {
    // logging should never break the app
    console.error("[activityLog] Failed to log activity:", err);
  }
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



// ─── REPORTS HELPER ───────────────────────────────────────────────────────────

// re-create the old reports collection helper
const reportsCollection = collection(db, "reports");

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
    percent,
    answers,
    startedAt: serverTimestamp(),
    submittedAt: serverTimestamp(),
  });

  return docRef.id;
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
    where("setId", "==", setId),
    orderBy("submittedAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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


