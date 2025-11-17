// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// ⬇️ Use initializeFirestore instead of getFirestore
import {
  initializeFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  getCountFromServer,           // ← NEW
  increment                     // ← NEW
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
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);

// ⬇️ Initialize Firestore with long-polling (avoids WebChannel terminate 400s)
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  // If you still see issues, try flipping this:
  useFetchStreams: false, // set to true on some Chromium builds if needed
  // Last resort (stronger): experimentalForceLongPolling: true,
});

export const auth = getAuth(app);
export const storage = getStorage(app);

// — AUTH HELPERS (unchanged) —
export const doSignIn     = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
export const doSignUp     = (email, pw) => createUserWithEmailAndPassword(auth, email, pw);
export const onAuthChange = (cb)       => onAuthStateChanged(auth, cb);
export const doSignOut    = ()         => signOut(auth);

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

/** Count of reading completions */
export async function fetchReadingProgressCount() {
  const uid = auth.currentUser?.uid;
  if (!uid) return 0;
  const snap = await getDocs(collection(db, "users", uid, "readingProgress"));
  return snap.size || 0;
}

/** Speaking progress counts per part */
export async function fetchSpeakingCounts() {
  const uid = auth.currentUser?.uid;
  if (!uid) return { part1: 0, part2: 0, part3: 0, part4: 0 };
  const col = collection(db, "users", uid, "speakingProgress");
  const counts = { part1: 0, part2: 0, part3: 0, part4: 0 };
  const snap = await getDocs(col);
  snap.forEach(d => {
    const p = d.data()?.part;
    if (p && counts[p] !== undefined) counts[p] += 1;
  });
  return counts;
}

/** Recent mistakes (IDs only) */
export async function fetchRecentMistakes(n = 10) {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];
  const q = query(
    collection(db, "users", uid, "mistakes"),
    orderBy("answeredAt", "desc"),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data()?.itemId).filter(Boolean);
}

/** Recent favourites (IDs only) */
export async function fetchRecentFavourites(n = 10) {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];
  const q = query(collection(db, "users", uid, "favourites"), orderBy("createdAt", "desc"), limit(n));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data()?.itemId).filter(Boolean);
}

/** Fetch Writing Part 1 sessions (latest first) */
export async function fetchWritingP1Sessions(n = 20) {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];
  const q = query(
    collection(db, "users", uid, "writingP1Sessions"),
    orderBy("createdAt", "desc"),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
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

export async function fetchWritingP1GuideEdits(n = 100) {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];
  const col = collection(db, "users", uid, "writingP1GuideEdits");
  const qy = query(col, orderBy("createdAt", "desc"), limit(n));
  const snap = await getDocs(qy);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
export async function fetchWritingP4Submissions(n = 20) {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];

  const q = query(
    collection(db, "users", uid, "writingP4Submissions"),
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
      // include BOTH text and HTML so the Profile can preserve formatting
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
export async function fetchWritingP4RegisterAttempts(n = 100) {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];
  const col = collection(db, "users", uid, "writingP4RegisterAttempts");
  const qy  = query(col, orderBy("createdAt", "desc"), limit(n));
  const snap = await getDocs(qy);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
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

export async function fetchSpeakingSpeculationNotes(limitCount = 50) {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];

  const colRef = collection(db, "users", uid, "speakingSpeculationNotes");
  const qy = query(
    colRef,
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

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
export async function fetchSeenGrammarItemIds() {
  const uid = auth.currentUser?.uid;
  if (!uid) return []; // guests: no seen items

  const col = collection(db, "users", uid, "grammarProgress");
  const snap = await getDocs(col);

  // Each doc ID is the itemId we stored in saveGrammarResult(...)
  return snap.docs.map(d => d.id);
}

/**
 * Fetch dashboard counts for the profile progress bar:
 * answered = #docs in /grammarProgress,
 * correct  = #docs with everCorrect == true,
 * total    = total #grammar items in the bank (from /grammarItems).
 */
export async function fetchGrammarDashboard() {
  const uid = auth.currentUser?.uid;

  // Total items from public grammarItems (uses count aggregation)
  const totalSnap = await getCountFromServer(query(collection(db, "grammarItems")));
  const total = totalSnap.data().count || 0;

  if (!uid) {
    // Guest: no per-user docs → answered/correct from local mirror (optional)
    return { answered: 0, correct: 0, total };
  }

  const col = collection(db, "users", uid, "grammarProgress");
  const progSnap = await getDocs(col);

  let answered = 0;
  let correct = 0;
  progSnap.forEach(d => {
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


