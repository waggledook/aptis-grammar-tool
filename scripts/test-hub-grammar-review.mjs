import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import * as review from "../src/utils/hubGrammarReview.js";
import * as mistakes from "../src/utils/hubGrammarMistakes.js";
import { HUB_GRAMMAR_ACTIVITIES } from "../src/data/hubGrammarActivities.js";

const DAY = 86400000;
const NOW = Date.UTC(2026, 10, 8, 12);
const activity = HUB_GRAMMAR_ACTIVITIES[0];
const question = activity.items[0];
const key = `${activity.id}:${question.id}`;
const submission = (time = NOW - DAY) => ({ id: "test-one", activityId: activity.id, completedAtMs: time,
  items: [{ id: question.id, type: question.type, isCorrect: false, hasAnswer: true }] });
const event = (overrides = {}) => ({ itemKey: key, eventId: "review-1", isCorrect: true,
  source: "review", answeredAtMs: NOW, sourceMistakeAtMs: NOW - DAY, knownMistake: true, ...overrides });

test("a correct due review schedules tomorrow; immediate repeats and early practice don't advance or defer it", () => {
  const seeded = review.buildHubGrammarStudentReviewQueue([submission()], [], "student", new Date(NOW));
  assert.equal(seeded[0].reviewStatus, "due");
  const first = review.getHubGrammarLearningUpdate(null, event());
  assert.equal(first.reviewStage, 1);
  assert.equal(first.nextReviewAt.getTime(), NOW + DAY);
  const original = structuredClone(first);
  const early = review.getHubGrammarLearningUpdate(first, event({ eventId: "early", answeredAtMs: NOW + 60000 }));
  assert.equal(early.reviewStage, 1);
  assert.equal(early.nextReviewAt.getTime(), NOW + DAY);
  assert.deepEqual(first, original);
  const practice = review.getHubGrammarLearningUpdate(early, event({ eventId: "practice", source: "practice", answeredAtMs: NOW + DAY }));
  assert.equal(practice.reviewStage, 1);
  assert.equal(practice.nextReviewAt.getTime(), NOW + DAY);
});

test("successive delayed reviews use 1/3/7/14-day gaps and then retire; a later error reopens mastery", () => {
  let progress = null;
  let time = NOW;
  for (const [index, gap] of [1, 3, 7, 14, null].entries()) {
    progress = review.getHubGrammarLearningUpdate(progress, event({ eventId: `review-${index}`, answeredAtMs: time }));
    assert.equal(progress.needsReview, gap !== null);
    if (gap !== null) {
      assert.equal(progress.nextReviewAt.getTime(), time + gap * DAY);
      time += gap * DAY;
    }
  }
  assert.equal(progress.maintenanceCompleted, true);
  assert.equal(review.hubGrammarReviewStatus(progress, new Date(time)), "mastered");
  const reopened = review.getHubGrammarLearningUpdate(progress, event({ eventId: "new-mistake", isCorrect: false, answeredAtMs: time + DAY }));
  assert.equal(reopened.reviewStage, 0);
  assert.equal(reopened.needsReview, true);
  assert.equal(reopened.maintenanceCompleted, false);
  assert.equal(review.hubGrammarReviewStatus(reopened, new Date(time + DAY)), "due");
});

test("historical mistakes stay retired while newer failed tests reactivate them", () => {
  const mastered = { itemKey: key, needsReview: false, reviewStage: 4, maintenanceCompleted: true,
    lastOutcomeAtMs: NOW, lastSourceMistakeAtMs: NOW - DAY };
  const before = JSON.stringify(mastered);
  const retired = review.buildHubGrammarStudentReviewQueue([submission()], [mastered], "student", new Date(NOW + DAY));
  assert.equal(retired[0].reviewStatus, "mastered");
  const reopened = review.buildHubGrammarStudentReviewQueue([submission(NOW + DAY)], [mastered], "student", new Date(NOW + DAY));
  assert.equal(reopened[0].reviewStatus, "due");
  assert.equal(reopened[0].reviewProgress.reviewStage, 0);
  assert.equal(JSON.stringify(mastered), before);
  const lateSyncedFailure = review.buildHubGrammarStudentReviewQueue([submission(NOW - 1)], [mastered], "student", new Date(NOW));
  assert.equal(lateSyncedFailure[0].reviewStatus, "due");
});

test("teacher pools retain recently reviewed and mastered mistakes, and combine due learners without duplicates", () => {
  const scheduled = { itemKey: key, ...review.getHubGrammarLearningUpdate(null, event()) };
  const mastered = { ...scheduled, needsReview: false, maintenanceCompleted: true };
  const groups = [
    { student: { id: "due-student" }, submissions: [submission()], progress: [] },
    { student: { id: "recent-student" }, submissions: [submission()], progress: [scheduled] },
    { student: { id: "mastered-student" }, submissions: [submission()], progress: [mastered] },
  ];
  const before = JSON.stringify(groups);
  const [item] = review.buildHubGrammarClassReviewQueue(groups, new Date(NOW));
  assert.deepEqual(item.studentIds, ["due-student", "recent-student", "mastered-student"]);
  assert.deepEqual(item.dueStudentIds, ["due-student"]);
  assert.deepEqual(item.scheduledStudentIds, ["recent-student"]);
  assert.deepEqual(item.masteredStudentIds, ["mastered-student"]);
  assert.equal(JSON.stringify(groups), before);
  assert.equal(review.buildHubGrammarClassReviewQueue(groups.slice(1), new Date(NOW)).length, 1);
});

test("summaries separate due, scheduled and mastered; new live mistakes work without test submissions", () => {
  const secondKey = `${activity.id}:${activity.items[1].id}`;
  const thirdKey = `${activity.id}:${activity.items[2].id}`;
  const progress = [
    { itemKey: key, needsReview: true, nextReviewAt: new Date(NOW - DAY) },
    { itemKey: secondKey, needsReview: true, nextReviewAt: new Date(NOW + DAY) },
    { itemKey: thirdKey, needsReview: false },
    { itemKey: "deleted:question", needsReview: true },
  ];
  const queue = review.buildHubGrammarStudentReviewQueue([], progress, "student", new Date(NOW));
  assert.equal(queue.length, 3);
  assert.deepEqual(review.summarizeHubGrammarReview(queue), { due: 1, scheduled: 1, mastered: 1, nextReviewAt: new Date(NOW + DAY) });
});

test("duplicate or stale events don't overwrite later progress, and first failures count once", () => {
  const first = review.getHubGrammarLearningUpdate(null, event({ isCorrect: false, source: "practice" }));
  assert.equal(first.lapseCount, 1);
  assert.equal(review.getHubGrammarLearningUpdate(first, event()), null);
  assert.equal(review.getHubGrammarLearningUpdate(first, event({ eventId: "older", answeredAtMs: NOW - 1 })), null);
  assert.equal(review.getHubGrammarLearningUpdate(null, event({ source: "live", knownMistake: false })), null);
});

test("live reconciliation updates only this participant's submitted answers, including after reload; blanks are ignored", () => {
  const queue = review.buildHubGrammarStudentReviewQueue([submission()], [], "mine", new Date(NOW));
  const game = { source: mistakes.HUB_GRAMMAR_REVIEW_LIVE_SOURCE, players: { mine: {}, other: {} },
    items: [{ id: key }, { id: `${activity.id}:${activity.items[1].id}` }, { id: "unknown" }],
    answers: { 0: { mine: { correct: true, submittedAt: NOW }, other: { correct: false, submittedAt: NOW } },
      1: { other: { correct: false, submittedAt: NOW } }, 2: { mine: { correct: false, submittedAt: NOW } } } };
  const events = review.getHubGrammarLiveReviewEvents("room", game, "mine", queue);
  assert.equal(events.length, 1);
  assert.equal(events[0].isCorrect, true);
  assert.equal(events[0].knownMistake, true);
  assert.equal(events[0].eventId, "live:room:0:mine");
  assert.deepEqual(review.getHubGrammarLiveReviewEvents("room", structuredClone(game), "mine", queue), events);
  assert.deepEqual(review.getHubGrammarLiveReviewEvents("room", game, "not-joined", queue), []);
  assert.deepEqual(review.getHubGrammarLiveReviewEvents("room", { ...game, source: "other" }, "mine", queue), []);
});

async function storageHarness() {
  const data = new Map();
  const auth = { currentUser: { uid: "student" } };
  const pathFor = (...args) => args.slice(1).join("/");
  const snapshot = (path) => ({ id: path.split("/").at(-1), exists: () => data.has(path), data: () => structuredClone(data.get(path)) });
  let sequence = Promise.resolve();
  let fail = false;
  const firestore = {
    collection: pathFor, doc: pathFor, serverTimestamp: () => "server-time",
    getDocs: async (path) => ({ docs: [...data.keys()].filter((key) => key.startsWith(`${path}/`)).map(snapshot) }),
    runTransaction: (_, callback) => {
      const operation = sequence.then(async () => {
        if (fail) { fail = false; throw new Error("Network unavailable"); }
        const pending = [];
        const result = await callback({ get: async (path) => snapshot(path), set: (path, value) => pending.push([path, value]) });
        pending.forEach(([path, value]) => data.set(path, structuredClone(value)));
        return result;
      });
      sequence = operation.catch(() => {});
      return operation;
    },
  };
  const firebase = { auth, db: {}, fetchHubGrammarSubmissions: async () => [submission()] };
  const source = await fs.readFile(new URL("../src/api/hubGrammarReview.js", import.meta.url), "utf8");
  const module = new vm.SourceTextModule(source);
  await module.link((specifier) => {
    const exports = specifier === "firebase/firestore" ? firestore : specifier.includes("firebase.js") ? firebase
      : specifier.includes("hubGrammarMistakes") ? mistakes : review;
    return new vm.SyntheticModule(Object.keys(exports), function () {
      for (const [name, value] of Object.entries(exports)) this.setExport(name, value);
    });
  });
  await module.evaluate();
  return { api: module.namespace, data, auth, failNext: () => { fail = true; } };
}

test("Firestore progress and attempt writes are atomic and retryable; concurrent duplicate submissions advance once", async () => {
  const { api, data, failNext } = await storageHarness();
  failNext();
  await assert.rejects(api.saveHubGrammarReviewAnswer(event()), /Network/);
  assert.equal(data.size, 0);
  const [saved] = await Promise.all([api.saveHubGrammarReviewAnswer(event()), api.saveHubGrammarReviewAnswer(event())]);
  assert.equal(saved.reviewStage, 1);
  assert.equal(data.size, 2);
  assert.equal((await api.fetchHubGrammarLearningProgress())[0].attemptCount, 1);
  const later = await api.saveHubGrammarReviewAnswer(event({ eventId: "later", answeredAtMs: NOW + DAY }));
  assert.equal(later.reviewStage, 2);
  await api.saveHubGrammarReviewAnswer(event());
  assert.equal((await api.fetchHubGrammarLearningProgress())[0].reviewStage, 2);
  const completeData = await api.fetchHubGrammarReviewData();
  assert.equal(completeData.submissions.length, 1);
  assert.equal(completeData.progress.length, 1);
});

test("test submissions reactivate mistakes idempotently without updating another learner's progress", async () => {
  const { api, data, auth } = await storageHarness();
  const failed = submission(NOW);
  await api.saveHubGrammarSubmissionMistakes(failed);
  await api.saveHubGrammarSubmissionMistakes(failed);
  const [saved] = await api.fetchHubGrammarLearningProgress();
  assert.equal(saved.reviewStage, 0);
  assert.equal(saved.lapseCount, 1);
  assert.equal(saved.attemptCount, 1);
  assert.ok([...data.keys()].every((path) => path.startsWith("users/student/")));
  auth.currentUser = { uid: "different" };
  await assert.rejects(api.saveHubGrammarReviewAnswer(event({ expectedUid: "student" })), /Sign in again/);
  assert.equal((await api.fetchHubGrammarLearningProgress()).length, 0);
  await api.saveHubGrammarReviewAnswer(event({ knownMistake: false, source: "live" }));
  assert.equal((await api.fetchHubGrammarLearningProgress()).length, 0);
});
