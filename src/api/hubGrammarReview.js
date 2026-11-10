import { collection, doc, getDocs, runTransaction, serverTimestamp } from "firebase/firestore";
import { auth, db, fetchHubGrammarSubmissions } from "../firebase.js";
import { getHubGrammarLearningUpdate, getHubGrammarReviewQuestion } from "../utils/hubGrammarReview.js";
import { buildHubGrammarMistakes } from "../utils/hubGrammarMistakes.js";

export async function fetchHubGrammarLearningProgress(uid = auth.currentUser?.uid) {
  if (!uid) return [];
  const snapshot = await getDocs(collection(db, "users", uid, "hubGrammarLearningProgress"));
  return snapshot.docs.map((entry) => ({ ...entry.data(), itemKey: entry.data().itemKey || decodeURIComponent(entry.id) }));
}

export async function fetchHubGrammarReviewData(uid = auth.currentUser?.uid) {
  const [submissions, progress] = await Promise.all([
    fetchHubGrammarSubmissions(null, uid), fetchHubGrammarLearningProgress(uid),
  ]);
  return { submissions, progress };
}

export async function saveHubGrammarReviewAnswer(event) {
  const uid = auth.currentUser?.uid;
  if (!uid || (event.expectedUid && event.expectedUid !== uid)) throw new Error("Sign in again to save your review progress.");
  const source = getHubGrammarReviewQuestion(event.itemKey);
  if (!source || !event.eventId || typeof event.isCorrect !== "boolean"
    || !["review", "practice", "live", "test"].includes(event.source)) throw new Error("This review answer could not be saved.");
  const progressRef = doc(db, "users", uid, "hubGrammarLearningProgress", encodeURIComponent(event.itemKey));
  const attemptRef = doc(db, "users", uid, "hubGrammarReviewAttempts", encodeURIComponent(event.eventId));
  return runTransaction(db, async (transaction) => {
    const [progressSnap, attemptSnap] = await Promise.all([transaction.get(progressRef), transaction.get(attemptRef)]);
    const current = progressSnap.exists() ? progressSnap.data() : null;
    if (attemptSnap.exists()) return current;
    const update = getHubGrammarLearningUpdate(current, event);
    // Successful live answers to previously unmissed questions don't create mistakes.
    if (!update) return current;
    const progress = { ...update, itemKey: event.itemKey, activityId: source.activityId,
      questionId: source.question.id, schemaVersion: 1 };
    transaction.set(progressRef, { ...progress, updatedAt: serverTimestamp() });
    transaction.set(attemptRef, { itemKey: event.itemKey, isCorrect: event.isCorrect,
      source: event.source, answeredAtMs: event.answeredAtMs, createdAt: serverTimestamp() });
    return progress;
  });
}

export async function saveHubGrammarSubmissionMistakes(submission) {
  const uid = auth.currentUser?.uid;
  if (!uid || !submission?.id) return;
  const mistakes = buildHubGrammarMistakes([{ student: { id: uid }, submissions: [submission] }]);
  await Promise.all(mistakes.map((item) => saveHubGrammarReviewAnswer({
    expectedUid: uid, itemKey: item.key, eventId: `test:${submission.id}:${item.key}`,
    answeredAtMs: submission.completedAtMs, isCorrect: false, source: "test",
    knownMistake: true, sourceMistakeAtMs: submission.completedAtMs,
  })));
}
