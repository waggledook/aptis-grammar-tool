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
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from "firebase/functions";
import { TOPIC_DATA } from "./components/vocabulary/data/vocabTopics";
import { getAllHubVocabThemes } from "./data/hubVocabularyActivities";

const WRITING_FEEDBACK_DEFAULT_WEEKLY_CREDITS = {
  student: 40,
  teacher: 100,
  admin: 1000,
};
const APTIS_DEMO_FEEDBACK_LIFETIME_CREDITS = 8;
const APTIS_TRAINER_ACCESS_KEY = "aptisTrainer";

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
export const functionsRegion = getFunctions(app, "europe-west1");

if (
  import.meta.env.DEV &&
  import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === "true" &&
  typeof window !== "undefined" &&
  !window.__seifFunctionsEmulatorConnected
) {
  connectFunctionsEmulator(functionsRegion, "127.0.0.1", 5001);
  window.__seifFunctionsEmulatorConnected = true;
}

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
      photoURL: user.photoURL || null,
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

function normalizePublicUserProfile(id, data = {}) {
  return {
    id,
    uid: id,
    email: data.email || null,
    name: data.name || data.displayName || "",
    displayName: data.displayName || data.name || "",
    username: data.username || "",
    photoURL: data.photoURL || "",
    role: data.role || "student",
  };
}

export async function fetchUserPublicProfile(uid) {
  if (!uid) return null;
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return normalizePublicUserProfile(snap.id, snap.data() || {});
}

export async function fetchUserPublicProfiles(uids = []) {
  const uniqueUids = [...new Set((Array.isArray(uids) ? uids : []).filter(Boolean))];
  if (!uniqueUids.length) return {};

  const rows = await Promise.all(
    uniqueUids.map((uid) =>
      fetchUserPublicProfile(uid).catch((error) => {
        console.warn("[profiles] Could not load user profile", uid, error);
        return null;
      })
    )
  );

  return rows.reduce((acc, row) => {
    if (row?.uid) acc[row.uid] = row;
    return acc;
  }, {});
}

async function logAiFeedbackGenerated(kind, details = {}, resultData = {}) {
  const meta = resultData?.meta || {};
  await logActivity("ai_feedback_generated", {
    kind,
    product: details.product || "aptis",
    section: details.section || "",
    part: details.part || "",
    mode: details.mode || "",
    taskId: details.taskId || "",
    taskTitle: details.taskTitle || details.title || "",
    answerCount: details.answerCount ?? null,
    wordCount: details.wordCount ?? null,
    model: meta.model || details.model || "",
    feedbackTaskType: meta.feedbackTaskType || meta.taskType || "",
    creditCost: meta.quota?.creditCost ?? meta.quota?.cost ?? meta.creditCost ?? null,
  });
}

export async function requestWritingFeedback(payload) {
  const generateWritingFeedback = httpsCallable(functionsRegion, "generateWritingFeedback");
  const result = await generateWritingFeedback(payload);
  await logAiFeedbackGenerated("writing_generic", {
    product: payload?.exam || "aptis",
    section: payload?.part || payload?.taskTitle || "writing",
    part: payload?.part || "",
    taskTitle: payload?.taskTitle || "",
    wordCount: payload?.answer ? String(payload.answer).trim().split(/\s+/).filter(Boolean).length : null,
  }, result.data);
  return result.data;
}

export async function requestOteWritingFeedback(payload) {
  const generateOteWritingFeedback = httpsCallable(functionsRegion, "generateOteWritingFeedback");
  const result = await generateOteWritingFeedback({
    ...payload,
    model: "gpt-5.4-mini",
  });
  const tasks = Array.isArray(payload?.tasks) ? payload.tasks : [];
  await logAiFeedbackGenerated("ote_writing", {
    product: "ote",
    section: "writing",
    mode: payload?.mode || "",
    taskId: tasks.map((task) => task?.taskId).filter(Boolean).join(", "),
    taskTitle: tasks.map((task) => task?.title).filter(Boolean).join(" + "),
    answerCount: tasks.length,
    wordCount: tasks.reduce((sum, task) => sum + Number(task?.answer?.wordCount || 0), 0) || null,
  }, result.data);
  return result.data;
}

export async function requestOteRegisterGapFeedback(payload) {
  const generateOteRegisterGapFeedback = httpsCallable(functionsRegion, "generateOteRegisterGapFeedback");
  const result = await generateOteRegisterGapFeedback({
    ...payload,
    model: "gpt-5.4-mini",
  });
  const gaps = Array.isArray(payload?.gaps) ? payload.gaps : [];
  await logAiFeedbackGenerated("ote_register_gap", {
    product: "ote",
    section: "writing",
    mode: "register_gap",
    taskId: payload?.taskId || "",
    taskTitle: payload?.title || "",
    answerCount: gaps.length,
    wordCount: gaps.reduce(
      (sum, gap) => sum + String(gap?.studentAnswer || "").trim().split(/\s+/).filter(Boolean).length,
      0
    ),
  }, result.data);
  return result.data;
}

export async function requestOteRegisterRewriteFeedback(payload) {
  const generateOteRegisterRewriteFeedback = httpsCallable(functionsRegion, "generateOteRegisterRewriteFeedback");
  const result = await generateOteRegisterRewriteFeedback({
    ...payload,
    model: "gpt-5.4-mini",
  });
  const items = Array.isArray(payload?.items) ? payload.items : [];
  await logAiFeedbackGenerated("ote_register_rewrite", {
    product: "ote",
    section: "writing",
    mode: "register_rewrite",
    taskId: payload?.taskId || "",
    taskTitle: payload?.title || "",
    answerCount: items.length,
    wordCount: items.reduce(
      (sum, item) => sum + String(item?.studentAnswer || "").trim().split(/\s+/).filter(Boolean).length,
      0
    ),
  }, result.data);
  return result.data;
}

export async function requestAptisWritingPart1Feedback(items) {
  const generateAptisWritingPart1Feedback = httpsCallable(
    functionsRegion,
    "generateAptisWritingPart1Feedback"
  );
  const result = await generateAptisWritingPart1Feedback({
    items,
    model: "gpt-5.4-mini",
  });
  // Aptis writing feedback is logged by the callable after successful generation.
  return result.data;
}

export async function requestAptisWritingPart23Feedback(payload) {
  const generateAptisWritingPart23Feedback = httpsCallable(
    functionsRegion,
    "generateAptisWritingPart23Feedback"
  );
  const result = await generateAptisWritingPart23Feedback({
    ...payload,
    model: "gpt-5.4-mini",
  });
  // Aptis writing feedback is logged by the callable after successful generation.
  return result.data;
}

export async function requestAptisWritingPart4Feedback(payload) {
  const generateAptisWritingPart4Feedback = httpsCallable(
    functionsRegion,
    "generateAptisWritingPart4Feedback"
  );
  const result = await generateAptisWritingPart4Feedback({
    ...payload,
    model: "gpt-5.4-mini",
  });
  // Aptis writing feedback is logged by the callable after successful generation.
  return result.data;
}

export async function requestAptisSpeakingPart1Feedback(payload) {
  const generateAptisSpeakingPart1Feedback = httpsCallable(
    functionsRegion,
    "generateAptisSpeakingPart1Feedback"
  );
  const result = await generateAptisSpeakingPart1Feedback({
    ...payload,
    model: "gpt-5.4-mini",
  });
  await logAiFeedbackGenerated("aptis_speaking_part1", {
    product: "aptis",
    section: "speaking",
    part: "part1",
    answerCount: Array.isArray(payload?.recordings) ? payload.recordings.length : null,
  }, result.data);
  return result.data;
}

export async function requestAptisSpeakingPart2Feedback(payload) {
  const generateAptisSpeakingPart2Feedback = httpsCallable(
    functionsRegion,
    "generateAptisSpeakingPart2Feedback"
  );
  const result = await generateAptisSpeakingPart2Feedback({
    ...payload,
    model: "gpt-5.4-mini",
  });
  await logAiFeedbackGenerated("aptis_speaking_part2", {
    product: "aptis",
    section: "speaking",
    part: "part2",
    taskId: payload?.task?.id || "",
    taskTitle: payload?.task?.title || "",
    answerCount: Array.isArray(payload?.recordings) ? payload.recordings.length : null,
  }, result.data);
  return result.data;
}

export async function requestAptisSpeakingPart3Feedback(payload) {
  const generateAptisSpeakingPart3Feedback = httpsCallable(
    functionsRegion,
    "generateAptisSpeakingPart3Feedback"
  );
  const result = await generateAptisSpeakingPart3Feedback({
    ...payload,
    model: "gpt-5.4-mini",
  });
  await logAiFeedbackGenerated("aptis_speaking_part3", {
    product: "aptis",
    section: "speaking",
    part: "part3",
    taskId: payload?.task?.id || "",
    taskTitle: payload?.task?.title || "",
    answerCount: Array.isArray(payload?.recordings) ? payload.recordings.length : null,
  }, result.data);
  return result.data;
}

export async function requestAptisSpeakingPart4Feedback(payload) {
  const generateAptisSpeakingPart4Feedback = httpsCallable(
    functionsRegion,
    "generateAptisSpeakingPart4Feedback"
  );
  const result = await generateAptisSpeakingPart4Feedback({
    ...payload,
    model: "gpt-5.4-mini",
  });
  await logAiFeedbackGenerated("aptis_speaking_part4", {
    product: "aptis",
    section: "speaking",
    part: "part4",
    taskId: payload?.task?.id || "",
    taskTitle: payload?.task?.title || "",
    answerCount: Array.isArray(payload?.recordings) ? payload.recordings.length : null,
  }, result.data);
  return result.data;
}

export async function requestOteSpeakingFeedback(payload) {
  const generateOteSpeakingFeedback = httpsCallable(
    functionsRegion,
    "generateOteSpeakingFeedback",
    { timeout: 300000 }
  );
  const result = await generateOteSpeakingFeedback({
    ...payload,
    model: "gpt-5.4-mini",
  });
  await logAiFeedbackGenerated("ote_speaking", {
    product: "ote",
    section: "speaking",
    part: payload?.partId || payload?.part || "",
    taskId: payload?.task?.id || payload?.taskId || payload?.mockId || "",
    taskTitle: payload?.task?.title || payload?.mockTitle || "",
    answerCount: Array.isArray(payload?.recordings) ? payload.recordings.length : null,
    mockId: payload?.mockId || "",
  }, result.data);
  return result.data;
}

export async function requestOteLevelProductionFeedback(payload) {
  const generateOteLevelProductionFeedback = httpsCallable(
    functionsRegion,
    "generateOteLevelProductionFeedback",
    { timeout: 300000 }
  );
  const result = await generateOteLevelProductionFeedback({
    ...payload,
    model: "gpt-5.4-mini",
  });
  try {
    await logAiFeedbackGenerated("ote_level_production", {
      product: "ote",
      section: "level-test",
      mode: payload?.mode || "general_production_check",
      profileId: payload?.phase1?.profile?.id || "",
      score: payload?.phase1?.totalScore ?? null,
      answerCount: Array.isArray(payload?.speaking?.recordings) ? payload.speaking.recordings.length : null,
      wordCount: payload?.writing?.answer?.wordCount ?? null,
    }, result.data);
  } catch (error) {
    console.warn("[OTE level production] activity log failed", error);
  }
  return result.data;
}

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
        photoURL: user.photoURL || null,
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
    if (!data.photoURL && user.photoURL) {
      patch.photoURL = user.photoURL;
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
function _userCol(subcol) {
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
  ...extra
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
    ...extra,
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

// Hub textbook vocabulary progress
// /users/{uid}/hubVocabProgress/{themeId}:{activityId}
// ────────────────────────────────
export async function saveHubVocabActivityResult({
  themeId,
  themeTitle,
  level,
  activityId,
  activityTitle,
  activityType,
  totalItems,
  correctFirstTry,
  mistakesCount,
  mode = "practice",
}) {
  const uid = auth.currentUser?.uid;
  if (!uid || !themeId || !activityId) return;

  const docId = `${themeId}:${activityId}`;
  const ref = doc(db, "users", uid, "hubVocabProgress", docId);
  const payload = {
    themeId,
    themeTitle: themeTitle || "",
    level: level || "a1",
    activityId,
    activityTitle: activityTitle || "",
    activityType: activityType || "",
    completed: true,
    attempts: increment(1),
    totalItems: totalItems ?? 0,
    mistakesTotal: increment(mistakesCount ?? 0),
    lastRun: {
      totalItems: totalItems ?? 0,
      correctFirstTry: correctFirstTry ?? null,
      mistakesCount: mistakesCount ?? 0,
      mode,
    },
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, payload, { merge: true });

  await logActivity("hub_vocab_activity_completed", {
    app: "seifhub",
    themeId,
    themeTitle: themeTitle || "",
    level: level || "a1",
    activityId,
    activityTitle: activityTitle || "",
    activityType: activityType || "",
    totalItems: totalItems ?? null,
    correctFirstTry: correctFirstTry ?? null,
    mistakesCount: mistakesCount ?? null,
    mode,
  });
}

export async function fetchHubVocabProgress(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return {};

  const snap = await getDocs(collection(db, "users", realUid, "hubVocabProgress"));
  const out = {};

  snap.forEach((d) => {
    const data = d.data() || {};
    if (!data.completed) return;
    const themeId = data.themeId || d.id.split(":")[0] || "";
    const activityId = data.activityId || d.id.split(":")[1] || "";
    out[d.id] = {
      id: d.id,
      themeId,
      activityId,
      completed: true,
      attempts: data.attempts ?? 0,
      mistakesTotal: data.mistakesTotal ?? 0,
      updatedAt: data.updatedAt || null,
      lastRun: data.lastRun || null,
    };
  });

  return out;
}

export async function fetchHubVocabThemeCounts(uid) {
  const realUid = _uidOrCurrent(uid);
  const themes = getAllHubVocabThemes();
  const stats = Object.fromEntries(
    themes.map((theme) => [
      theme.id,
      {
        completed: 0,
        total: Array.isArray(theme.activities) ? theme.activities.length : 0,
      },
    ])
  );

  if (!realUid) return stats;

  const progress = await fetchHubVocabProgress(realUid);
  Object.values(progress).forEach((entry) => {
    if (!entry?.themeId) return;
    if (!stats[entry.themeId]) stats[entry.themeId] = { completed: 0, total: 0 };
    stats[entry.themeId].completed += 1;
  });

  return stats;
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
    photoURL: user.photoURL || details.photoURL || null,
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
      photoURL: data.photoURL || null,
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
      photoURL: data.photoURL || null,
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

function logOteActivity(type, details = {}) {
  return logActivity(type, {
    app: "ote",
    product: "ote",
    ...details,
  });
}

function getOteTrainingProgressId(details = {}) {
  if (details.progressId) return String(details.progressId);

  const section = String(details.section || "").toLowerCase();
  const part = String(details.part || "").toLowerCase();
  const mode = String(details.mode || details.activity || "").toLowerCase();
  const taskId = String(details.taskId || details.setId || "").toLowerCase();

  if (section === "speaking") {
    if (part === "part-1" || part === "part1") {
      if (mode.includes("practice") || taskId) return "speaking.part1.practice";
    }
    if (part === "part-2" || part === "part2") {
      if (taskId === "guided-message-1") return "speaking.part2.guided-message-1";
      if (taskId === "guided-message-2") return "speaking.part2.guided-message-2";
      if (mode.includes("voicemail_practice") || taskId.startsWith("set-")) return "speaking.part2.practice";
    }
    if (part === "parts-3-4" || part === "part-3" || part === "part3" || part === "part-4" || part === "part4") {
      if (mode.includes("guided")) return "speaking.parts34.guided-talk";
      if (mode.includes("practice") || taskId) return "speaking.parts34.practice";
    }
    if (part === "parts-4-5" || part === "part-5" || part === "part5") {
      if (mode.includes("practice") || taskId) return "speaking.parts45.practice";
    }
  }

  if (section === "writing") {
    const practiceSection = String(details.practiceSection || details.sectionId || "").toLowerCase();
    if (practiceSection === "advanced-essay") return "writing.advanced-essay.practice";
    if (practiceSection === "advanced-summary") return "writing.advanced-summary.practice";
    if (part === "part-1" || part === "part1") {
      if (mode.includes("register_rewrite") || taskId === "register-rewrite") return "writing.email.register-basics";
      if (mode.includes("register_gap") || taskId === "register-gaps") return "writing.email.register-gaps";
      if (mode.includes("practice") || taskId) return "writing.email.practice";
    }
    if (part === "part-2" || part === "part2") {
      if (practiceSection === "essay") return "writing.essay.practice";
      if (practiceSection === "article-review") return "writing.article-review.practice";
      if (mode.includes("intro") || taskId === "introductions-conclusions") return "writing.essay.introductions-conclusions";
      if (mode.includes("planning") || taskId === "planning") return "writing.essay.planning";
      if (mode.includes("body") || taskId === "body-paragraphs") return "writing.essay.body-paragraphs";
      if (mode.includes("article") || taskId === "article-review-guide") return "writing.article-review.guide";
    }
  }

  return "";
}

export async function markOteTrainingProgress(details = {}) {
  const user = auth.currentUser;
  const progressId = getOteTrainingProgressId(details);
  if (!user || !progressId) return null;
  const taskKey = String(details.taskId || details.setId || "").trim();
  const specificProgressId =
    taskKey && progressId.endsWith(".practice") ? `${progressId}.${taskKey}` : "";

  const baseData = {
    progressId,
    product: "ote",
    section: details.section || "",
    part: details.part || "",
    mode: details.mode || details.activity || "",
    taskId: details.taskId || details.setId || "",
    taskTitle: details.taskTitle || details.setTitle || "",
    completed: true,
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, "users", user.uid, "oteTrainingProgress", progressId), baseData, { merge: true });

  if (specificProgressId && specificProgressId !== progressId) {
    await setDoc(
      doc(db, "users", user.uid, "oteTrainingProgress", specificProgressId),
      {
        ...baseData,
        progressId: specificProgressId,
        parentProgressId: progressId,
      },
      { merge: true }
    );
  }
  return progressId;
}

export async function fetchOteTrainingProgress(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return new Set();

  const snap = await getDocs(collection(db, "users", realUid, "oteTrainingProgress"));
  return new Set(
    snap.docs
      .map((entry) => {
        const data = entry.data() || {};
        if (data.completed === false) return "";
        return data.progressId || entry.id;
      })
      .filter(Boolean)
  );
}

export async function fetchOteTrainingProgressMap(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return {};

  const snap = await getDocs(collection(db, "users", realUid, "oteTrainingProgress"));
  return snap.docs.reduce((acc, entry) => {
    const data = entry.data() || {};
    if (data.completed === false) return acc;
    const progressId = data.progressId || entry.id;
    if (!progressId) return acc;
    acc[progressId] = data.completedAt || data.updatedAt || data.createdAt || null;
    return acc;
  }, {});
}

export async function logOteTrainingStarted(details = {}) {
  return logOteActivity("ote_training_started", details);
}

export async function logOteTrainingCompleted(details = {}) {
  await markOteTrainingProgress(details);
  return logOteActivity("ote_training_completed", details);
}

export async function logOteMockStarted(details = {}) {
  return logOteActivity("ote_mock_started", details);
}

export async function logOteMockCompleted(details = {}) {
  const module = String(details.module || "").toLowerCase();
  const mockId = String(details.mockId || "").toLowerCase();
  const progressId =
    module === "speaking" && mockId
      ? `ote.mock.${mockId}`
      : module === "writing"
        ? mockId.includes("advanced")
          ? "ote.mock.writing-advanced"
          : "ote.mock.writing-general"
        : "";
  if (progressId) {
    await markOteTrainingProgress({
      ...details,
      progressId,
      section: module,
      mode: "mock_test",
      taskId: mockId,
      taskTitle: details.mockTitle || "",
    });
  }
  return logOteActivity("ote_mock_completed", details);
}

export async function logOteRegisterChecked(details = {}) {
  return logOteActivity("ote_register_checked", details);
}

export async function logOteLevelTestSelected(details = {}) {
  return logOteActivity("ote_level_test_selected", {
    section: "level-test",
    ...details,
  });
}

export async function logOteLevelTestStarted(details = {}) {
  return logOteActivity("ote_level_test_started", {
    section: "level-test",
    ...details,
  });
}

export async function logOteLevelTestCheckpoint(details = {}) {
  return logOteActivity("ote_level_test_checkpoint", {
    section: "level-test",
    ...details,
  });
}

export async function logOteLevelTestCompleted(details = {}) {
  return logOteActivity("ote_level_test_completed", {
    section: "level-test",
    ...details,
  });
}

export async function logOteLevelProductionStarted(details = {}) {
  return logOteActivity("ote_level_production_started", {
    section: "level-test",
    ...details,
  });
}

export async function logOteLevelProductionSubmitted(details = {}) {
  return logOteActivity("ote_level_production_submitted", {
    section: "level-test",
    ...details,
  });
}

export async function updateOwnOteVersion(version = "general") {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in.");
  const normalizedVersion = version === "advanced" ? "advanced" : "general";
  await setDoc(doc(db, "users", user.uid), { oteVersion: normalizedVersion }, { merge: true });
  return normalizedVersion;
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

export async function logCollocationPrecisionStarted(details = {}) {
  return logActivity("collocation_precision_started", {
    app: "aptis-trainer",
    ...details,
  });
}

export async function logCollocationPrecisionReviewLoaded(details = {}) {
  return logActivity("collocation_precision_review_loaded", {
    app: "aptis-trainer",
    ...details,
  });
}

export async function logCollocationPrecisionCompleted(details = {}) {
  return logActivity("collocation_precision_completed", {
    app: "aptis-trainer",
    ...details,
  });
}

export async function logSynonymTrainerStarted(details = {}) {
  return logActivity("synonym_trainer_started", {
    app: "aptis-trainer",
    ...details,
  });
}

export async function logSynonymTrainerReviewLoaded(details = {}) {
  return logActivity("synonym_trainer_review_loaded", {
    app: "aptis-trainer",
    ...details,
  });
}

export async function logSynonymTrainerCompleted(details = {}) {
  return logActivity("synonym_trainer_completed", {
    app: "aptis-trainer",
    ...details,
  });
}

export async function logVocabExerciseStarted(details = {}) {
  return logActivity("vocab_exercise_started", {
    app: "aptis-trainer",
    ...details,
  });
}

export async function logVocabExerciseReviewLoaded(details = {}) {
  return logActivity("vocab_exercise_review_loaded", {
    app: "aptis-trainer",
    ...details,
  });
}

export async function logVocabExerciseCompleted(details = {}) {
  return logActivity("vocab_exercise_completed", {
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

export async function logHubFlashcardsCompleted(details = {}) {
  return logActivity("hub_flashcards_completed", {
    app: "seifhub",
    ...details,
  });
}

export async function saveHubFlashcardSession(payload = {}) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const colRef = collection(db, "users", uid, "hubFlashcardSessions");
  await addDoc(colRef, {
    ...payload,
    app: "seifhub",
    createdAt: serverTimestamp(),
  });

  await logHubFlashcardsCompleted(payload);
}

export async function fetchHubFlashcardSessions(n = 50, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const qy = query(
    collection(db, "users", realUid, "hubFlashcardSessions"),
    orderBy("createdAt", "desc"),
    limit(n)
  );

  const snap = await getDocs(qy);

  return snap.docs.map((entry) => ({
    id: entry.id,
    ...entry.data(),
  }));
}

export async function fetchHubFlashcardActivityLogSessions(n = 50, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const snap = await getDocs(
    query(
      collection(db, "activityLog"),
      where("userId", "==", realUid),
      where("type", "==", "hub_flashcards_completed"),
      limit(n)
    )
  );

  return snap.docs
    .map((entry) => {
      const data = entry.data() || {};
      const details = data.details || {};
      return {
        id: entry.id,
        createdAt: data.createdAt || null,
        userId: data.userId || realUid,
        userEmail: data.userEmail || null,
        deckId: details.deckId || "",
        deckTitle: details.deckTitle || "Grammar flashcards",
        assignmentId: details.assignmentId || "",
        assignmentLabel: details.assignmentLabel || "",
        teacherUid: details.teacherUid || "",
        teacherName: details.teacherName || "",
        reviewedCards: details.reviewedCards ?? null,
        total: details.total ?? null,
      };
    })
    .sort((a, b) => {
      const aTime = a?.createdAt?.toMillis?.() || 0;
      const bTime = b?.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
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

export async function logHubSyntaxSentinelStarted(details = {}) {
  return logActivity("hub_syntax_sentinel_started", {
    app: "seifhub",
    ...details,
  });
}

export async function logHubSyntaxSentinelCompleted(details = {}) {
  return logActivity("hub_syntax_sentinel_completed", {
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

export async function logReadingPart1Attempted({ taskId, score, total, source = "AptisPart1" }) {
  return logActivity("reading_part1_attempted", {
    taskId: taskId || null,
    score: typeof score === "number" ? score : null,
    total: typeof total === "number" ? total : null,
    source,
  });
}

export async function logReadingPart1Completed({ taskId, source = "AptisPart1" }) {
  await saveReadingProgress(taskId, "part1");
  return logActivity("reading_part1_completed", {
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
const supportMessagesCollection = collection(db, "supportMessages");

function getFeedbackWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const daysSinceMonday = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - daysSinceMonday);
  return d.toISOString().slice(0, 10);
}

function todayIsoDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getSiteAccessConfig(userData = {}, accessKey) {
  const raw = userData?.siteAccess?.[accessKey];
  if (raw === true) return { active: true, startDate: "", endDate: "", indefinite: true };
  if (!raw || typeof raw !== "object") return { active: false, startDate: "", endDate: "", indefinite: false };
  return {
    active: !!raw.active,
    startDate: raw.startDate || "",
    endDate: raw.endDate || "",
    indefinite: !!raw.indefinite,
  };
}

function hasAptisTrainerAccess(userData = {}) {
  const role = userData?.role || "student";
  if (role === "admin" || role === "teacher") return true;
  const access = getSiteAccessConfig(userData, APTIS_TRAINER_ACCESS_KEY);
  if (!access.active) return false;
  const today = todayIsoDate();
  if (access.startDate && today < access.startDate) return false;
  if (!access.indefinite && access.endDate && today > access.endDate) return false;
  return true;
}

function getWritingFeedbackWeeklyLimit(userData = {}) {
  const rawValue = userData.writingFeedbackWeeklyCredits;
  const hasCustomValue = rawValue !== undefined && rawValue !== null && rawValue !== "";
  const customValue = Number(rawValue);
  if (hasCustomValue && Number.isFinite(customValue)) {
    return Math.max(0, Math.floor(customValue));
  }
  const role = userData.role || "student";
  return WRITING_FEEDBACK_DEFAULT_WEEKLY_CREDITS[role] || WRITING_FEEDBACK_DEFAULT_WEEKLY_CREDITS.student;
}

function getAptisDemoFeedbackLifetimeLimit(userData = {}) {
  const rawValue = userData.aptisDemoFeedbackLifetimeCredits;
  const hasCustomValue = rawValue !== undefined && rawValue !== null && rawValue !== "";
  const customValue = Number(rawValue);
  if (hasCustomValue && Number.isFinite(customValue)) {
    return Math.max(0, Math.floor(customValue));
  }
  return APTIS_DEMO_FEEDBACK_LIFETIME_CREDITS;
}

export async function fetchFeedbackCreditStatus(uid = auth.currentUser?.uid) {
  if (!uid) return null;
  const weekKey = getFeedbackWeekKey();
  const [userSnap, weeklyUsageSnap, demoUsageSnap] = await Promise.all([
    getDoc(doc(db, "users", uid)),
    getDoc(doc(db, "users", uid, "writingFeedbackUsage", weekKey)),
    getDoc(doc(db, "users", uid, "aptisTrainerDemoFeedbackUsage", "lifetime")),
  ]);
  const userData = userSnap.data() || {};
  const weeklyLimit = getWritingFeedbackWeeklyLimit(userData);
  const weeklyUsed = Number(weeklyUsageSnap.data()?.creditsUsed || 0);
  const aptisDemoLimit = getAptisDemoFeedbackLifetimeLimit(userData);
  const aptisDemoUsed = Number(demoUsageSnap.data()?.creditsUsed || 0);

  return {
    uid,
    role: userData.role || "student",
    weekKey,
    hasAptisTrainerAccess: hasAptisTrainerAccess(userData),
    weekly: {
      pool: "weekly",
      limit: weeklyLimit,
      used: weeklyUsed,
      remaining: Math.max(0, weeklyLimit - weeklyUsed),
    },
    aptisDemo: {
      pool: "aptis_demo_lifetime",
      limit: aptisDemoLimit,
      used: aptisDemoUsed,
      remaining: Math.max(0, aptisDemoLimit - aptisDemoUsed),
    },
  };
}

export async function sendFeedbackCreditRequest({
  pool = "weekly",
  site = "aptis",
  neededCredits = null,
  remainingCredits = null,
  note = "",
} = {}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to request more credits.");
  }

  return addDoc(hubAccessRequestsCollection, {
    requestType: "feedback_credits",
    site,
    pool,
    neededCredits,
    remainingCredits,
    note: String(note || "").trim(),
    userId: user.uid,
    userEmail: user.email ?? null,
    userName: user.displayName ?? "",
    createdAt: serverTimestamp(),
    status: "new",
  });
}

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

export async function sendHubAccessRequest({ note = "", site = "seifhub" } = {}) {
  const user = auth.currentUser;
  const normalizedSite =
    site === "ote" ? "ote" : site === "aptis-trainer" ? "aptis-trainer" : "seifhub";

  return addDoc(hubAccessRequestsCollection, {
    site: normalizedSite,
    note: note.trim(),
    userId: user?.uid ?? null,
    userEmail: user?.email ?? null,
    userName: user?.displayName ?? "",
    createdAt: serverTimestamp(),
    status: "new",
  });
}

export async function sendSupportMessage({
  language = "en",
  category = "other",
  categoryLabel = "",
  message = "",
  includePage = true,
  route = "",
  url = "",
  site = "aptis",
  userAgent = "",
} = {}) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to send a message.");
  }

  return addDoc(supportMessagesCollection, {
    language: language === "es" ? "es" : "en",
    category: String(category || "other"),
    categoryLabel: String(categoryLabel || category || "Other").trim(),
    message: String(message || "").trim(),
    includePage: !!includePage,
    route: includePage ? String(route || "") : "",
    url: includePage ? String(url || "") : "",
    site: String(site || "aptis"),
    userAgent: String(userAgent || ""),
    userId: user.uid,
    userEmail: user.email || null,
    userName: user.displayName || "",
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
    assignmentId: payload.assignmentId || "",
    score: payload.score ?? null,
    completed: payload.completed ?? null,
    totalPlayed: payload.totalPlayed ?? null,
    trainingTarget: payload.trainingTarget ?? null,
  });
}

export async function fetchHubDictationSessions(n = 20, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const qy = query(
    collection(db, "users", realUid, "hubDictationSessions"),
    orderBy("createdAt", "desc"),
    limit(n)
  );

  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function saveHubTranslationSession(payload) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const colRef = collection(db, "users", uid, "hubTranslationSessions");
  await addDoc(colRef, {
    ...payload,
    app: "seifhub",
    createdAt: serverTimestamp(),
  });

  await logActivity("hub_translation_completed", {
    mode: payload.mode || "training",
    setId: payload.setId || "",
    setLabel: payload.setLabel || "",
    level: payload.level || "",
    assignmentId: payload.assignmentId || "",
    score: payload.score ?? null,
    completed: payload.completed ?? null,
    totalPlayed: payload.totalPlayed ?? null,
    trainingTarget: payload.trainingTarget ?? null,
  });
}

export async function fetchHubTranslationSessions(n = 20, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const qy = query(
    collection(db, "users", realUid, "hubTranslationSessions"),
    orderBy("createdAt", "desc"),
    limit(n)
  );

  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
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

export async function saveSynonymTrainerResult(itemId, tags, isCorrect) {
  const uid = auth.currentUser?.uid;
  if (!uid || !itemId) return;

  const ref = doc(db, "users", uid, "synonymTrainerProgress", itemId);
  await setDoc(
    ref,
    {
      itemId,
      tags: tags || "",
      attempts: increment(1),
      everCorrect: isCorrect ? true : increment(0),
      lastCorrect: !!isCorrect,
      lastAnsweredAt: serverTimestamp(),
      app: "aptis-trainer",
    },
    { merge: true }
  );
}

export async function fetchSeenSynonymTrainerItemIds(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const snap = await getDocs(collection(db, "users", realUid, "synonymTrainerProgress"));
  return snap.docs.map((d) => d.id);
}

export async function fetchSynonymTrainerFavourites(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const snap = await getDocs(collection(db, "users", realUid, "synonymTrainerFavourites"));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function saveSynonymTrainerFavourite(item) {
  const uid = auth.currentUser?.uid;
  if (!uid || !item?.itemId) return;

  const ref = doc(db, "users", uid, "synonymTrainerFavourites", item.itemId);
  await setDoc(
    ref,
    {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      app: "aptis-trainer",
    },
    { merge: true }
  );
}

export async function removeSynonymTrainerFavourite(itemId) {
  const uid = auth.currentUser?.uid;
  if (!uid || !itemId) return;

  await deleteDoc(doc(db, "users", uid, "synonymTrainerFavourites", itemId));
}

export async function recordSynonymTrainerMistake(item) {
  const uid = auth.currentUser?.uid;
  if (!uid || !item?.itemId) return;

  await addDoc(collection(db, "users", uid, "synonymTrainerMistakes"), {
    ...item,
    app: "aptis-trainer",
    createdAt: serverTimestamp(),
  });
}

export async function clearSynonymTrainerMistakes(itemId, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid || !itemId) return;

  const snap = await getDocs(
    query(
      collection(db, "users", realUid, "synonymTrainerMistakes"),
      where("itemId", "==", itemId)
    )
  );

  await Promise.all(snap.docs.map((entry) => deleteDoc(entry.ref)));
}

export async function fetchSynonymTrainerMistakes(n = 20, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const qy = query(
    collection(db, "users", realUid, "synonymTrainerMistakes"),
    orderBy("createdAt", "desc"),
    limit(n)
  );

  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function saveVocabExerciseTaskResult({ taskId, tags, score, total, isPerfect }) {
  const uid = auth.currentUser?.uid;
  if (!uid || !taskId) return;

  const ref = doc(db, "users", uid, "vocabExerciseProgress", taskId);
  const snap = await getDoc(ref);
  const previousBest = snap.exists() ? Number(snap.data()?.bestScore || 0) : 0;
  const nextScore = Number(score ?? 0);
  await setDoc(
    ref,
    {
      taskId,
      tags: tags || "",
      attempts: increment(1),
      bestScore: Math.max(previousBest, nextScore),
      lastScore: nextScore,
      total: total ?? 0,
      everPerfect: isPerfect || !!snap.data()?.everPerfect,
      lastPerfect: !!isPerfect,
      lastAnsweredAt: serverTimestamp(),
      app: "aptis-trainer",
    },
    { merge: true }
  );
}

export async function fetchSeenVocabExerciseTaskIds(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const snap = await getDocs(collection(db, "users", realUid, "vocabExerciseProgress"));
  return snap.docs.map((d) => d.id);
}

export async function fetchVocabExerciseFavourites(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const snap = await getDocs(collection(db, "users", realUid, "vocabExerciseFavourites"));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function saveVocabExerciseFavourite(task) {
  const uid = auth.currentUser?.uid;
  if (!uid || !task?.taskId) return;

  const ref = doc(db, "users", uid, "vocabExerciseFavourites", task.taskId);
  await setDoc(
    ref,
    {
      ...task,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      app: "aptis-trainer",
    },
    { merge: true }
  );
}

export async function removeVocabExerciseFavourite(taskId) {
  const uid = auth.currentUser?.uid;
  if (!uid || !taskId) return;

  await deleteDoc(doc(db, "users", uid, "vocabExerciseFavourites", taskId));
}

export async function fetchVocabExerciseItemFavourites(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const snap = await getDocs(collection(db, "users", realUid, "vocabExerciseItemFavourites"));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function saveVocabExerciseItemFavourite(item) {
  const uid = auth.currentUser?.uid;
  if (!uid || !item?.itemId) return;

  const ref = doc(db, "users", uid, "vocabExerciseItemFavourites", item.itemId);
  await setDoc(
    ref,
    {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      app: "aptis-trainer",
    },
    { merge: true }
  );
}

export async function removeVocabExerciseItemFavourite(itemId) {
  const uid = auth.currentUser?.uid;
  if (!uid || !itemId) return;

  await deleteDoc(doc(db, "users", uid, "vocabExerciseItemFavourites", itemId));
}

export async function recordVocabExerciseMistake(task) {
  const uid = auth.currentUser?.uid;
  if (!uid || !task?.taskId) return;

  await addDoc(collection(db, "users", uid, "vocabExerciseMistakes"), {
    ...task,
    app: "aptis-trainer",
    createdAt: serverTimestamp(),
  });
}

export async function clearVocabExerciseMistakes(taskId, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid || !taskId) return;

  const snap = await getDocs(
    query(
      collection(db, "users", realUid, "vocabExerciseMistakes"),
      where("taskId", "==", taskId)
    )
  );

  await Promise.all(snap.docs.map((entry) => deleteDoc(entry.ref)));
}

export async function fetchVocabExerciseMistakes(n = 20, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const qy = query(
    collection(db, "users", realUid, "vocabExerciseMistakes"),
    orderBy("createdAt", "desc"),
    limit(n)
  );

  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function fetchVocabPracticeSummary(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) {
    return {
      exercise: { attempted: 0, perfect: 0, attempts: 0, favourites: 0, favouriteItems: 0, mistakeQuestions: 0 },
      synonyms: { attempted: 0, correct: 0, attempts: 0, favourites: 0, mistakes: 0 },
      collocations: { attempted: 0, correct: 0, attempts: 0, favourites: 0, mistakes: 0 },
    };
  }

  const [
    exerciseProgressSnap,
    exerciseFavouritesSnap,
    exerciseItemFavouritesSnap,
    exerciseMistakesSnap,
    synonymProgressSnap,
    synonymFavouritesSnap,
    synonymMistakesSnap,
    collocationProgressSnap,
    collocationFavouritesSnap,
    collocationMistakesSnap,
  ] = await Promise.all([
    getDocs(collection(db, "users", realUid, "vocabExerciseProgress")),
    getDocs(collection(db, "users", realUid, "vocabExerciseFavourites")),
    getDocs(collection(db, "users", realUid, "vocabExerciseItemFavourites")),
    getDocs(collection(db, "users", realUid, "vocabExerciseMistakes")),
    getDocs(collection(db, "users", realUid, "synonymTrainerProgress")),
    getDocs(collection(db, "users", realUid, "synonymTrainerFavourites")),
    getDocs(collection(db, "users", realUid, "synonymTrainerMistakes")),
    getDocs(collection(db, "users", realUid, "collocationPrecisionProgress")),
    getDocs(collection(db, "users", realUid, "collocationPrecisionFavourites")),
    getDocs(collection(db, "users", realUid, "collocationPrecisionMistakes")),
  ]);

  const exerciseProgress = exerciseProgressSnap.docs.map((entry) => entry.data() || {});
  const synonymProgress = synonymProgressSnap.docs.map((entry) => entry.data() || {});
  const collocationProgress = collocationProgressSnap.docs.map((entry) => entry.data() || {});
  const exerciseMistakeQuestions = exerciseMistakesSnap.docs.reduce((total, entry) => {
    const data = entry.data() || {};
    return total + (Array.isArray(data.wrongQuestions) ? data.wrongQuestions.length : 1);
  }, 0);
  const hasEverCorrect = (entry) => entry.everCorrect === true || entry.lastCorrect === true;

  return {
    exercise: {
      attempted: exerciseProgressSnap.size,
      perfect: exerciseProgress.filter((entry) => entry.everPerfect).length,
      attempts: exerciseProgress.reduce((total, entry) => total + Number(entry.attempts || 0), 0),
      favourites: exerciseFavouritesSnap.size,
      favouriteItems: exerciseItemFavouritesSnap.size,
      mistakeQuestions: exerciseMistakeQuestions,
    },
    synonyms: {
      attempted: synonymProgressSnap.size,
      correct: synonymProgress.filter(hasEverCorrect).length,
      attempts: synonymProgress.reduce((total, entry) => total + Number(entry.attempts || 0), 0),
      favourites: synonymFavouritesSnap.size,
      mistakes: synonymMistakesSnap.size,
    },
    collocations: {
      attempted: collocationProgressSnap.size,
      correct: collocationProgress.filter(hasEverCorrect).length,
      attempts: collocationProgress.reduce((total, entry) => total + Number(entry.attempts || 0), 0),
      favourites: collocationFavouritesSnap.size,
      mistakes: collocationMistakesSnap.size,
    },
  };
}

export async function saveCollocationPrecisionResult(itemId, tags, isCorrect) {
  const uid = auth.currentUser?.uid;
  if (!uid || !itemId) return;

  const ref = doc(db, "users", uid, "collocationPrecisionProgress", itemId);
  await setDoc(
    ref,
    {
      itemId,
      tags: tags || "",
      attempts: increment(1),
      everCorrect: isCorrect ? true : increment(0),
      lastCorrect: !!isCorrect,
      lastAnsweredAt: serverTimestamp(),
      app: "aptis-trainer",
    },
    { merge: true }
  );
}

export async function fetchSeenCollocationPrecisionItemIds(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const snap = await getDocs(collection(db, "users", realUid, "collocationPrecisionProgress"));
  return snap.docs.map((d) => d.id);
}

export async function recordCollocationPrecisionMistake(item) {
  const uid = auth.currentUser?.uid;
  if (!uid || !item?.itemId) return;

  await addDoc(collection(db, "users", uid, "collocationPrecisionMistakes"), {
    ...item,
    app: "aptis-trainer",
    createdAt: serverTimestamp(),
  });
}

export async function fetchCollocationPrecisionMistakes(n = 20, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const qy = query(
    collection(db, "users", realUid, "collocationPrecisionMistakes"),
    orderBy("createdAt", "desc"),
    limit(n)
  );

  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function clearCollocationPrecisionMistakes(itemId, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid || !itemId) return;

  const snap = await getDocs(
    query(
      collection(db, "users", realUid, "collocationPrecisionMistakes"),
      where("itemId", "==", itemId)
    )
  );

  await Promise.all(snap.docs.map((entry) => deleteDoc(entry.ref)));
}

export async function fetchCollocationPrecisionFavourites(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const snap = await getDocs(collection(db, "users", realUid, "collocationPrecisionFavourites"));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function saveCollocationPrecisionFavourite(item) {
  const uid = auth.currentUser?.uid;
  if (!uid || !item?.itemId) return;

  const ref = doc(db, "users", uid, "collocationPrecisionFavourites", item.itemId);
  await setDoc(
    ref,
    {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      app: "aptis-trainer",
    },
    { merge: true }
  );
}

export async function removeCollocationPrecisionFavourite(itemId) {
  const uid = auth.currentUser?.uid;
  if (!uid || !itemId) return;

  await deleteDoc(doc(db, "users", uid, "collocationPrecisionFavourites", itemId));
}

function diaryEntryId(entry) {
  return [entry?.itemId, entry?.word]
    .filter(Boolean)
    .join("__")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .slice(0, 140);
}

export async function saveCollocationPrecisionDiaryEntry(entry) {
  const uid = auth.currentUser?.uid;
  const id = diaryEntryId(entry);
  if (!uid || !id) return;

  const ref = doc(db, "users", uid, "collocationPrecisionDiary", id);
  await setDoc(
    ref,
    {
      ...entry,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      app: "aptis-trainer",
    },
    { merge: true }
  );
}

export async function fetchCollocationPrecisionDiary(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const qy = query(
    collection(db, "users", realUid, "collocationPrecisionDiary"),
    orderBy("updatedAt", "desc"),
    limit(100)
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

export async function fetchHubTranslationFavourites(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const snap = await getDocs(collection(db, "users", realUid, "hubTranslationFavourites"));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function saveHubTranslationResult(itemId, tags, isCorrect) {
  const uid = auth.currentUser?.uid;
  if (!uid || !itemId) return;

  const ref = doc(db, "users", uid, "hubTranslationProgress", itemId);
  const payload = {
    itemId,
    tags: Array.isArray(tags) ? tags.join(",") : (tags || ""),
    attempts: increment(1),
    lastCorrect: !!isCorrect,
    lastAnsweredAt: serverTimestamp(),
    app: "seifhub",
  };

  if (isCorrect) {
    payload.everCorrect = true;
  }

  await setDoc(ref, payload, { merge: true });
}

export async function fetchSeenHubTranslationItemIds(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const snap = await getDocs(collection(db, "users", realUid, "hubTranslationProgress"));
  return snap.docs.map((d) => d.id);
}

export async function saveHubTranslationFavourite(item) {
  const uid = auth.currentUser?.uid;
  if (!uid || !item?.itemId) return;

  const ref = doc(db, "users", uid, "hubTranslationFavourites", item.itemId);
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

export async function removeHubTranslationFavourite(itemId) {
  const uid = auth.currentUser?.uid;
  if (!uid || !itemId) return;

  await deleteDoc(doc(db, "users", uid, "hubTranslationFavourites", itemId));
}

export async function recordHubTranslationMistake(item) {
  const uid = auth.currentUser?.uid;
  if (!uid || !item?.itemId) return;

  await addDoc(collection(db, "users", uid, "hubTranslationMistakes"), {
    ...item,
    app: "seifhub",
    createdAt: serverTimestamp(),
  });
}

export async function clearHubTranslationMistakes(itemId, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid || !itemId) return;

  const snap = await getDocs(
    query(
      collection(db, "users", realUid, "hubTranslationMistakes"),
      where("itemId", "==", itemId)
    )
  );

  await Promise.all(snap.docs.map((entry) => deleteDoc(entry.ref)));
}

export async function fetchHubTranslationMistakes(n = 15, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const qy = query(
    collection(db, "users", realUid, "hubTranslationMistakes"),
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
  snap.forEach((d) => {
    const data = d.data() || {};
    if (!data.completed) return;

    const normalizedTaskId =
      typeof data.taskId === "string" && data.taskId
        ? data.taskId
        : typeof d.id === "string" && d.id.includes(":")
        ? d.id.split(":").slice(1).join(":")
        : d.id;

    if (normalizedTaskId) done.add(normalizedTaskId);
  });
  return done;
}

export async function fetchReadingCompletionsByPart(part = "part2") {
  const uid = auth.currentUser?.uid;
  if (!uid) return new Set();

  const snap = await getDocs(
    query(collection(db, "users", uid, "readingProgress"), where("part", "==", part))
  );

  const done = new Set();
  snap.forEach((d) => {
    const data = d.data() || {};
    if (!data.completed) return;

    const taskId =
      typeof data.taskId === "string" && data.taskId
        ? data.taskId
        : typeof d.id === "string" && d.id.includes(":")
        ? d.id.split(":").slice(1).join(":")
        : d.id;

    if (taskId) done.add(taskId);
  });

  return done;
}

export async function fetchReadingProgressMap(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return {};

  const snap = await getDocs(collection(db, "users", realUid, "readingProgress"));
  const progress = {};

  snap.forEach((entry) => {
    const data = entry.data() || {};
    if (!data.completed) return;

    const taskId =
      typeof data.taskId === "string" && data.taskId
        ? data.taskId
        : typeof entry.id === "string" && entry.id.includes(":")
          ? entry.id.split(":").slice(1).join(":")
          : entry.id;

    const part =
      typeof data.part === "string" && data.part
        ? data.part
        : typeof entry.id === "string" && entry.id.includes(":")
          ? entry.id.split(":")[0]
          : "part2";

    if (!taskId) return;

    const key = `${part}:${taskId}`;
    progress[key] = {
      id: entry.id,
      part,
      taskId,
      completed: true,
      updatedAt: data.updatedAt || null,
    };
  });

  return progress;
}

/** Reading progress counts per part */
export async function fetchReadingCounts(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return { part1: 0, part2: 0, part3: 0, part4: 0 };

  const counts = { part1: 0, part2: 0, part3: 0, part4: 0 };

  const snap = await getDocs(collection(db, "users", realUid, "readingProgress"));
  const docs = snap.docs.map((d) => ({ id: d.id, data: d.data() || {} }));
  const explicitTaskParts = new Map();
  const seen = new Set();

  docs.forEach(({ data, id }) => {
    if (!data.completed) return;
    const part = data.part;
    const taskId =
      typeof data.taskId === "string" && data.taskId
        ? data.taskId
        : typeof id === "string" && id.includes(":")
        ? id.split(":").slice(1).join(":")
        : id;

    if (!part || !taskId) return;
    if (!explicitTaskParts.has(taskId)) explicitTaskParts.set(taskId, new Set());
    explicitTaskParts.get(taskId).add(part);
  });

  const inferLegacyReadingPart = (taskId) => {
    // Legacy Part 2 completions were stored as raw doc IDs like `topic__text`.
    // Raw docs without a part marker from later parts should not be counted as Part 2.
    if (typeof taskId === "string" && taskId.includes("__")) return "part2";
    return null;
  };

  docs.forEach(({ data, id }) => {
    if (!data.completed) return;

    const explicitPart = data.part;
    const taskId =
      typeof data.taskId === "string" && data.taskId
        ? data.taskId
        : typeof id === "string" && id.includes(":")
        ? id.split(":").slice(1).join(":")
        : id;

    if (!taskId) return;

    // Old raw IDs were used for Part 2, but some historic Part 3/4 completions
    // also created a raw doc alongside a part-specific doc. Ignore the raw copy
    // when a newer explicit record already exists for the same task.
    const normalizedPart =
      explicitPart ||
      (explicitTaskParts.has(taskId) ? null : inferLegacyReadingPart(taskId));

    if (!normalizedPart) return;

    const key = `${normalizedPart}:${taskId}`;
    if (seen.has(key)) return;
    seen.add(key);

    if (normalizedPart === "part1") counts.part1 += 1;
    if (normalizedPart === "part2") counts.part2 += 1;
    if (normalizedPart === "part3") counts.part3 += 1;
    if (normalizedPart === "part4") counts.part4 += 1;
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

export async function fetchSpeakingProgressMap(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return {};

  const snap = await getDocs(collection(db, "users", realUid, "speakingProgress"));
  const out = {};

  snap.forEach((d) => {
    const data = d.data() || {};
    if (!data.completed) return;
    out[d.id] = data.updatedAt || null;
  });

  return out;
}


// — WRITING PART 1: save a session (questions + answers) ————————————————
/**
 * Save one Writing Part 1 session for the current user.
 * Each session stores the 5 questions with the student's answers.
 */
export async function saveWritingP1Submission(payload) {
  const uid = auth.currentUser?.uid;
  if (!uid) return null; // silently skip if signed out

  const colRef = collection(db, "users", uid, "writingP1Sessions");
  const ref = await addDoc(colRef, {
    type: "part1",
    items: payload.items,
    count: payload.items?.length ?? 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// — WRITING PART 2: save short-form answers ————————————————
/**
 * Save one Writing Part 2 submission (single 20–30w paragraph) for the current user.
 * payload shape from the UI:
 * { taskId, answerText, answerHTML, counts: { answer } }
 */
export async function saveWritingP2Submission(payload) {
  const uid = auth.currentUser?.uid;
  if (!uid) return null; // silently skip if signed out

  const colRef = collection(db, "users", uid, "writingP2Submissions");
  const ref = await addDoc(colRef, {
    type: "part2",
    ...payload,
    createdAt: serverTimestamp(),
  });
  return ref.id;
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
      aiFeedback: data.aiFeedback || null,
      aiFeedbackMeta: data.aiFeedbackMeta || null,
      aiFeedbackUpdatedAt: data.aiFeedbackUpdatedAt || null,
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

export async function saveSpeakingAiFeedback({
  product = "aptis",
  part,
  taskId = "",
  taskTitle = "",
  questions = [],
  transcripts = [],
  feedback,
  meta = null,
}) {
  const uid = auth.currentUser?.uid;
  if (!uid || !part || !feedback) return null;

  const ref = await addDoc(collection(db, "users", uid, "speakingFeedback"), {
    product,
    part,
    taskId,
    taskTitle,
    questions,
    transcripts,
    feedback,
    meta,
    audioStored: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function fetchSpeakingAiFeedback(n = 20, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const qy = query(
    collection(db, "users", realUid, "speakingFeedback"),
    orderBy("createdAt", "desc"),
    limit(n)
  );
  const snap = await getDocs(qy);
  return snap.docs.map((d) => {
    const data = d.data() || {};
    return {
      id: d.id,
      createdAt: data.createdAt || null,
      product: data.product || "aptis",
      part: data.part || "",
      taskId: data.taskId || "",
      taskTitle: data.taskTitle || "",
      questions: data.questions || [],
      transcripts: data.transcripts || [],
      feedback: data.feedback || null,
      meta: data.meta || null,
      audioStored: !!data.audioStored,
    };
  });
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
    aiFeedback: d.data()?.aiFeedback || null,
    aiFeedbackMeta: d.data()?.aiFeedbackMeta || null,
    aiFeedbackUpdatedAt: d.data()?.aiFeedbackUpdatedAt || null,
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
  if (!uid) return null; // silently skip if signed out

  const colRef = collection(db, "users", uid, "writingP3Submissions");
  const ref = await addDoc(colRef, {
    type: "part3",
    ...payload,
    createdAt: serverTimestamp(),
  });
  return ref.id;
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
      aiFeedback: data.aiFeedback || null,
      aiFeedbackMeta: data.aiFeedbackMeta || null,
      aiFeedbackUpdatedAt: data.aiFeedbackUpdatedAt || null,
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
  if (!uid) return null; // silently skip if signed out

  const colRef = collection(db, "users", uid, "writingP4Submissions");
  const ref = await addDoc(colRef, {
    type: "part4",
    ...payload,
    createdAt: serverTimestamp(),
  });
  return ref.id;
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
      aiFeedback: data.aiFeedback || null,
      aiFeedbackMeta: data.aiFeedbackMeta || null,
      aiFeedbackUpdatedAt: data.aiFeedbackUpdatedAt || null,
    };
  });
}

const WRITING_FEEDBACK_COLLECTIONS = {
  part1: "writingP1Sessions",
  part2: "writingP2Submissions",
  part3: "writingP3Submissions",
  part4: "writingP4Submissions",
  ote: "oteWritingSubmissions",
};

export async function saveWritingAiFeedback({ kind, submissionId, feedback, meta = null }) {
  const uid = auth.currentUser?.uid;
  if (!uid || !submissionId || !feedback) return;

  const collectionName = WRITING_FEEDBACK_COLLECTIONS[kind];
  if (!collectionName) throw new Error(`Unknown writing feedback kind: ${kind}`);

  await setDoc(
    doc(db, "users", uid, collectionName, submissionId),
    {
      aiFeedback: feedback,
      aiFeedbackMeta: meta,
      aiFeedbackUpdatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function saveOteWritingSubmission(payload) {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;

  const colRef = collection(db, "users", uid, "oteWritingSubmissions");
  const ref = await addDoc(colRef, {
    product: "ote",
    type: "ote-writing-mock",
    ...payload,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function fetchOteWritingSubmissions(n = 20, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const q = query(
    collection(db, "users", realUid, "oteWritingSubmissions"),
    orderBy("createdAt", "desc"),
    limit(n)
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() || {};
    return {
      id: d.id,
      type: data.type || "ote-writing-mock",
      createdAt: data.createdAt || null,
      mockId: data.mockId || "",
      mockTitle: data.mockTitle || "",
      moduleLabel: data.moduleLabel || "Writing",
      practiceTaskId: data.practiceTaskId || "",
      practiceSection: data.practiceSection || "",
      practiceSectionLabel: data.practiceSectionLabel || "",
      practiceTaskType: data.practiceTaskType || "",
      practiceTaskLabel: data.practiceTaskLabel || "",
      task2Choice: data.task2Choice || "essay",
      answers: data.answers || { task1: "", essay: "", article: "" },
      counts: data.counts || { task1: 0, essay: 0, article: 0 },
      tasks: data.tasks || {},
      timings: data.timings || {},
      finishedAt: data.finishedAt || null,
      reason: data.reason || "",
      aiFeedback: data.aiFeedback || null,
      aiFeedbackMeta: data.aiFeedbackMeta || null,
      aiFeedbackUpdatedAt: data.aiFeedbackUpdatedAt || null,
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

  const stats = Object.fromEntries(
    Object.entries(TOPIC_DATA).map(([topicKey, topic]) => [
      topicKey,
      {
        completed: 0,
        total: Array.isArray(topic?.sets) ? topic.sets.length : 0,
      },
    ])
  );

  snap.forEach((d) => {
    const data = d.data() || {};
    const topic = data.topic || "other";
    if (!stats[topic]) {
      stats[topic] = { completed: 0, total: 0 };
    }
    if (data.completedReview) {
      stats[topic].completed += 1;
    }
  });

  return stats;
}

export async function fetchVocabProgressMap(uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return {};

  const snap = await getDocs(collection(db, "users", realUid, "vocabProgress"));
  const out = {};

  snap.forEach((d) => {
    const data = d.data() || {};
    if (!data.completedReview) return;
    out[d.id] = data.updatedAt || null;
  });

  return out;
}

export async function fetchRecentVocabProgress(n = 10, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const qy = query(
    collection(db, "users", realUid, "vocabProgress"),
    orderBy("updatedAt", "desc"),
    limit(n)
  );

  const snap = await getDocs(qy);
  return snap.docs
    .map((d) => {
      const data = d.data() || {};
      return {
        id: d.id,
        topic: data.topic || (d.id.split(":")[0] || ""),
        setId: data.setId || (d.id.split(":")[1] || ""),
        completedReview: !!data.completedReview,
        updatedAt: data.updatedAt || null,
        attempts: data.attempts ?? 0,
        mistakesTotal: data.mistakesTotal ?? 0,
        lastRun: data.lastRun || null,
      };
    })
    .filter((entry) => entry.completedReview);
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

  const ref = doc(collection(db, "assignedActivities"));
  const routePath =
    typeof data.routePath === "string"
      ? data.routePath.replace("__ASSIGNMENT_ID__", ref.id)
      : data.routePath;

  await setDoc(ref, {
    ...data,
    routePath,
    teacherUid: data.teacherUid || uid,
    teacherEmail: data.teacherEmail || auth.currentUser?.email || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: data.status || "active",
  });

  return ref.id;
}

export async function getAssignedActivity(assignmentId) {
  if (!assignmentId) return null;
  const snap = await getDoc(doc(db, "assignedActivities", assignmentId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
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

export async function deleteAssignedActivity(assignmentId) {
  if (!assignmentId) throw new Error("Assignment ID is required.");
  await deleteDoc(doc(db, "assignedActivities", assignmentId));
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

const AVATAR_MAX_SOURCE_BYTES = 5 * 1024 * 1024;
const AVATAR_OUTPUT_SIZE = 512;
const AVATAR_ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getAvatarExtension(contentType) {
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/jpeg") return "jpg";
  return "png";
}

async function prepareAvatarImage(file) {
  if (!file) throw new Error("Choose an image first.");
  if (!AVATAR_ALLOWED_TYPES.has(file.type)) {
    throw new Error("Please upload a JPG, PNG, or WebP image.");
  }
  if (file.size > AVATAR_MAX_SOURCE_BYTES) {
    throw new Error("Please choose an image under 5 MB.");
  }
  if (typeof document === "undefined") return { blob: file, contentType: file.type };

  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Couldn’t read that image."));
    };
    img.src = objectUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_OUTPUT_SIZE;
  canvas.height = AVATAR_OUTPUT_SIZE;

  const ctx = canvas.getContext("2d");
  const side = Math.min(image.naturalWidth || image.width, image.naturalHeight || image.height);
  const sx = ((image.naturalWidth || image.width) - side) / 2;
  const sy = ((image.naturalHeight || image.height) - side) / 2;

  ctx.drawImage(image, sx, sy, side, side, 0, 0, AVATAR_OUTPUT_SIZE, AVATAR_OUTPUT_SIZE);

  const preferredType = "image/webp";
  const blob = await new Promise((resolve) => {
    canvas.toBlob((result) => resolve(result), preferredType, 0.88);
  });

  if (blob) return { blob, contentType: preferredType };

  const fallbackBlob = await new Promise((resolve) => {
    canvas.toBlob((result) => resolve(result), "image/png");
  });
  if (!fallbackBlob) throw new Error("Couldn’t prepare that image.");
  return { blob: fallbackBlob, contentType: "image/png" };
}

/**
 * Upload a JPG/PNG/WebP avatar to Storage and mirror its URL to Auth + Firestore.
 * Path: userAvatars/{uid}/avatar-{timestamp}.{ext}
 */
export async function uploadAvatarAndSave(file) {
  const user = auth.currentUser;
  if (!user) throw new Error("Must be signed in");

  const { blob, contentType } = await prepareAvatarImage(file);
  const ext = getAvatarExtension(contentType);
  const avatarRef = ref(storage, `userAvatars/${user.uid}/avatar-${Date.now()}.${ext}`);
  const task = uploadBytesResumable(avatarRef, blob, { contentType });

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

export async function clearAvatarAndSave() {
  const user = auth.currentUser;
  if (!user) throw new Error("Must be signed in");

  await updateProfile(user, { photoURL: null });
  await setDoc(doc(db, "users", user.uid), { photoURL: null }, { merge: true });

  return null;
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
  teacherUid = "",
  teacherEmail = null,
  teacherName = null,
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
    teacherUid: teacherUid || user.uid,
    teacherEmail: teacherEmail || user.email || null,
    teacherName: teacherName || user.displayName || null,
    createdByUid: user.uid,
    createdByEmail: user.email || null,
    createdByName: user.displayName || null,
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

  return listCourseTestSessionsForTeacher(uid);
}

export async function listCourseTestSessionsForTeacher(teacherUid) {
  const uid = teacherUid || auth.currentUser?.uid;
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

  const protectedData = await protectCourseTestRunnerState(attemptId, data);
  const autoScore = Number(protectedData.autoScore || 0);
  const autoTotal = Number(protectedData.autoTotal || 0);

  await updateDoc(doc(db, "courseTestAttempts", attemptId), {
    ...protectedData,
    percent: autoTotal > 0 ? Math.round((autoScore / autoTotal) * 100) : 0,
    updatedAt: serverTimestamp(),
  });
  await appendCourseTestAutosave(attemptId, protectedData, "draft");
  return {
    ...protectedData,
    percent: autoTotal > 0 ? Math.round((autoScore / autoTotal) * 100) : 0,
  };
}

export async function submitCourseTestAttempt(attemptId, data = {}) {
  if (!attemptId) throw new Error("Attempt ID is required.");

  const protectedData = await protectCourseTestRunnerState(attemptId, data);
  const autoScore = Number(protectedData.autoScore || 0);
  const autoTotal = Number(protectedData.autoTotal || 0);

  await updateDoc(doc(db, "courseTestAttempts", attemptId), {
    ...protectedData,
    percent: autoTotal > 0 ? Math.round((autoScore / autoTotal) * 100) : 0,
    completed: true,
    reviewRequired: true,
    reviewStatus: "pending",
    submittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await appendCourseTestAutosave(
    attemptId,
    { ...protectedData, completed: true, reviewStatus: "pending" },
    "submit"
  );
  return {
    ...protectedData,
    percent: autoTotal > 0 ? Math.round((autoScore / autoTotal) * 100) : 0,
    completed: true,
    reviewRequired: true,
    reviewStatus: "pending",
  };
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

function courseTestValueHasAnswer(value) {
  if (value == null) return false;
  if (Array.isArray(value)) return value.some(courseTestValueHasAnswer);
  if (typeof value === "object") return Object.values(value).some(courseTestValueHasAnswer);
  return String(value).trim().length > 0;
}

function courseTestAnswerMapHasAnswers(sectionAnswers = {}) {
  return Object.values(sectionAnswers || {}).some((sectionMap) => courseTestValueHasAnswer(sectionMap));
}

function courseTestMapHasKeys(value = {}) {
  return Boolean(value && typeof value === "object" && Object.keys(value).length > 0);
}

async function protectCourseTestRunnerState(attemptId, data = {}) {
  if (!data.runnerState) return data;

  const nextRunnerState = data.runnerState || {};
  const nextAnswers = nextRunnerState.sectionAnswers || {};
  const nextStatuses = nextRunnerState.sectionStatuses || {};
  const nextHasAnswers = courseTestAnswerMapHasAnswers(nextAnswers);
  const nextHasAnswerKeys = courseTestMapHasKeys(nextAnswers);
  const nextHasStatusKeys = courseTestMapHasKeys(nextStatuses);

  if (nextHasAnswers && nextHasAnswerKeys && nextHasStatusKeys) return data;

  const snap = await getDoc(doc(db, "courseTestAttempts", attemptId));
  const previousData = snap.exists() ? snap.data() || {} : {};
  const previousRunnerState = previousData.runnerState || {};
  const previousAnswers = previousRunnerState.sectionAnswers || {};
  const previousStatuses = previousRunnerState.sectionStatuses || {};
  const previousHasAnswers = courseTestAnswerMapHasAnswers(previousAnswers);

  if (!previousHasAnswers && !courseTestMapHasKeys(previousAnswers) && !courseTestMapHasKeys(previousStatuses)) {
    return data;
  }

  const protectedRunnerState = {
    ...nextRunnerState,
    sectionAnswers:
      !nextHasAnswers && previousHasAnswers
        ? previousAnswers
        : (!nextHasAnswerKeys && courseTestMapHasKeys(previousAnswers) ? previousAnswers : nextAnswers),
    sectionStatuses:
      !nextHasStatusKeys && courseTestMapHasKeys(previousStatuses)
        ? previousStatuses
        : nextStatuses,
    sectionNotes:
      !courseTestMapHasKeys(nextRunnerState.sectionNotes) && courseTestMapHasKeys(previousRunnerState.sectionNotes)
        ? previousRunnerState.sectionNotes
        : (nextRunnerState.sectionNotes || {}),
    currentSectionId: nextRunnerState.currentSectionId || previousRunnerState.currentSectionId || "",
  };

  const shouldPreserveScoring = !nextHasAnswers && previousHasAnswers;

  return {
    ...data,
    runnerState: protectedRunnerState,
    autoScore: shouldPreserveScoring ? Number(previousData.autoScore || 0) : data.autoScore,
    autoTotal: shouldPreserveScoring ? Number(previousData.autoTotal || 0) : data.autoTotal,
  };
}

async function appendCourseTestAutosave(attemptId, data = {}, source = "draft") {
  if (!attemptId || !data.runnerState) return;

  try {
    await addDoc(collection(db, "courseTestAttempts", attemptId, "autosaves"), {
      source,
      runnerState: data.runnerState,
      autoScore: Number(data.autoScore || 0),
      autoTotal: Number(data.autoTotal || 0),
      completed: Boolean(data.completed),
      reviewStatus: data.reviewStatus || null,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn("[course-test] autosave snapshot failed", error);
  }
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

export async function saveOteMockAttempt(payload = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in.");

  const ref = doc(collection(db, "users", user.uid, "oteMockAttempts"));
  const row = {
    product: "ote",
    mockId: payload.mockId || "",
    mockTitle: payload.mockTitle || "",
    module: payload.module || "speaking",
    status: payload.status || "submitted",
    studentUid: user.uid,
    studentEmail: user.email || null,
    studentName: user.displayName || null,
    elapsedSeconds: Number(payload.elapsedSeconds || 0),
    startedAtClient: payload.startedAtClient || null,
    recordings: Array.isArray(payload.recordings) ? payload.recordings : [],
    aiFeedback: payload.aiFeedback || null,
    aiFeedbackMeta: payload.aiFeedbackMeta || null,
    aiFeedbackTranscripts: Array.isArray(payload.aiFeedbackTranscripts) ? payload.aiFeedbackTranscripts : [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    submittedAt: serverTimestamp(),
  };

  await setDoc(ref, row);
  try {
    await setDoc(doc(db, "oteMockAttempts", ref.id), row);
  } catch (error) {
    console.warn("[OTE] Top-level attempt mirror failed", error);
  }
  return ref.id;
}

export async function fetchOteMockAttempt(attemptId, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid || !attemptId) return null;

  const userAttemptRef = doc(db, "users", realUid, "oteMockAttempts", attemptId);
  const userSnap = await getDoc(userAttemptRef);
  if (userSnap.exists()) return { id: userSnap.id, ...userSnap.data() };

  const topLevelSnap = await getDoc(doc(db, "oteMockAttempts", attemptId));
  if (!topLevelSnap.exists()) return null;
  const data = topLevelSnap.data() || {};
  if (data.studentUid !== realUid) return null;
  return { id: topLevelSnap.id, ...data };
}

export async function fetchOteMockAttempts(n = 20, uid) {
  const realUid = _uidOrCurrent(uid);
  if (!realUid) return [];

  const q = query(
    collection(db, "users", realUid, "oteMockAttempts"),
    orderBy("createdAt", "desc"),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
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
        } catch (error) {
          console.error("[test upload] profile update failed:", error);
        }
        res(url);
      });
    });

    console.log('[test upload] success URL:', result);
    return result;
  };
}
