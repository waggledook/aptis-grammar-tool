import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAptisMockMistakeReviewCompletion,
  createAptisMockMistakeReviewTracking,
} from "../src/utils/aptisMockMistakeReviewActivity.js";
import { formatActivityDetails } from "../src/utils/adminActivity.js";

test("builds aggregate learner review tracking without answer or student data", () => {
  const tracking = createAptisMockMistakeReviewTracking([
    { kind: "grammar", mockId: "mock-1", correctValue: "private answer" },
    { kind: "vocabulary", mockId: "mock-1", studentIds: ["student-1"] },
    { kind: "grammar", mockId: "mock-2" },
  ]);

  assert.equal(tracking.details.reviewScope, "learner");
  assert.equal(tracking.details.totalItems, 3);
  assert.equal(tracking.details.grammarItemCount, 2);
  assert.equal(tracking.details.vocabularyItemCount, 1);
  assert.deepEqual(tracking.details.mockIds, ["mock-1", "mock-2"]);
  assert.equal("correctValue" in tracking.details, false);
  assert.equal("studentIds" in tracking.details, false);
});

test("adds bounded completion outcomes and elapsed time", () => {
  const tracking = createAptisMockMistakeReviewTracking(
    [{ kind: "grammar", mockId: "mock-1" }, { kind: "vocabulary", mockId: "mock-1" }],
    { reviewScope: "teacher_class", selectedStudentCount: 4 }
  );
  tracking.startedAtMs = 1_000;

  const completion = buildAptisMockMistakeReviewCompletion(
    tracking,
    { answeredCount: 2, correctCount: 1 },
    6_400
  );

  assert.equal(completion.reviewScope, "teacher_class");
  assert.equal(completion.selectedStudentCount, 4);
  assert.equal(completion.correctCount, 1);
  assert.equal(completion.incorrectCount, 1);
  assert.equal(completion.accuracy, 50);
  assert.equal(completion.elapsedSeconds, 5);
});

test("formats review events for the admin activity log", () => {
  const text = formatActivityDetails({
    type: "aptis_mock_mistake_review_completed",
    details: {
      reviewScope: "learner",
      totalItems: 10,
      correctCount: 8,
      accuracy: 80,
      grammarItemCount: 6,
      vocabularyItemCount: 4,
      elapsedSeconds: 75,
    },
  });

  assert.match(text, /Learner review/);
  assert.match(text, /8\/10 correct first time/);
  assert.match(text, /80% accuracy/);
  assert.match(text, /Time 1m 15s/);
});
