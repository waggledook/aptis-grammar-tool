import assert from "node:assert/strict";
import { APTIS_SITE_ID, getSiteVariant } from "../src/siteConfig.js";
import {
  buildGrammarReviewSummary,
  getGrammarReviewTransition,
  isGrammarMaintenancePending,
  isGrammarReviewDue,
  isGrammarReviewPending,
} from "../src/utils/grammarReview.js";

import {
  formatActivityDetails,
  getActivityTypeLabel,
} from "../src/utils/adminActivity.js";

assert.equal(
  getSiteVariant({ hostname: "localhost", pathname: "/", search: "" }).id,
  APTIS_SITE_ID
);

const now = new Date("2026-08-09T10:00:00Z");
const wrong = getGrammarReviewTransition(
  {},
  { isCorrect: false, mode: "practice", now }
);
assert.equal(wrong.needsReview, true);
assert.equal(wrong.reviewStage, 0);
assert.equal(wrong.lapseCount, 1);
assert.equal(isGrammarReviewDue(wrong, now), true);

const stage1 = getGrammarReviewTransition(wrong, {
  isCorrect: true,
  mode: "review",
  now,
});
assert.equal(stage1.reviewStage, 1);
assert.equal(stage1.nextReviewAt.toISOString(), "2026-08-10T10:00:00.000Z");
assert.equal(isGrammarReviewDue(stage1, now), false);

const stage2 = getGrammarReviewTransition(stage1, {
  isCorrect: true,
  mode: "review",
  now,
});
assert.equal(stage2.reviewStage, 2);
assert.equal(stage2.nextReviewAt.toISOString(), "2026-08-12T10:00:00.000Z");

const stage3 = getGrammarReviewTransition(stage2, {
  isCorrect: true,
  mode: "review",
  now,
});
assert.equal(stage3.reviewStage, 3);
assert.equal(stage3.nextReviewAt.toISOString(), "2026-08-16T10:00:00.000Z");
assert.equal(stage3.masteryStatus, "reviewing");

const mastered = getGrammarReviewTransition(stage3, {
  isCorrect: true,
  mode: "review",
  now,
});
assert.equal(mastered.reviewStage, 4);
assert.equal(mastered.masteryStatus, "mastered");
assert.equal(mastered.needsReview, true);
assert.equal(mastered.maintenancePending, true);
assert.equal(mastered.nextReviewAt.toISOString(), "2026-08-23T10:00:00.000Z");
assert.equal(isGrammarMaintenancePending(mastered), true);
assert.equal(isGrammarReviewPending(mastered), true);
assert.equal(isGrammarReviewDue(mastered, now), false);

const maintenanceComplete = getGrammarReviewTransition(mastered, {
  isCorrect: true,
  mode: "review",
  now: new Date("2026-08-23T10:00:00Z"),
});
assert.equal(maintenanceComplete.reviewStage, 4);
assert.equal(maintenanceComplete.masteryStatus, "mastered");
assert.equal(maintenanceComplete.needsReview, false);
assert.equal(maintenanceComplete.maintenancePending, false);
assert.equal(maintenanceComplete.maintenanceCompleted, true);
assert.equal(maintenanceComplete.nextReviewAt, null);
assert.equal(isGrammarReviewPending(maintenanceComplete), false);

const migratedMaintenance = {
  reviewStage: 4,
  masteryStatus: "mastered",
  needsReview: false,
  nextReviewAt: new Date("2026-08-23T10:00:00Z"),
};
assert.equal(isGrammarMaintenancePending(migratedMaintenance), true);
assert.equal(
  isGrammarReviewDue(migratedMaintenance, new Date("2026-08-23T10:00:00Z")),
  true
);

const maintenanceReset = getGrammarReviewTransition(mastered, {
  isCorrect: false,
  mode: "review",
  now,
});
assert.equal(maintenanceReset.reviewStage, 0);
assert.equal(maintenanceReset.masteryStatus, "learning");
assert.equal(maintenanceReset.maintenancePending, false);

const reviewSummary = buildGrammarReviewSummary(
  [
    { itemId: "due-1", due: true, maintenance: false },
    { itemId: "maintenance-1", due: true, maintenance: true },
    { itemId: "later-1", due: false, maintenance: false },
  ],
  ["due-1", "legacy-1", "legacy-1", "legacy-2"]
);
assert.deepEqual(reviewSummary, {
  due: 1,
  maintenance: 1,
  scheduled: 1,
  legacy: 2,
  ready: 4,
});

const practiceCorrect = getGrammarReviewTransition(wrong, {
  isCorrect: true,
  mode: "practice",
  now,
});
assert.equal(practiceCorrect.needsReview, true);
assert.equal(practiceCorrect.reviewStage, 0);

const reset = getGrammarReviewTransition(stage2, {
  isCorrect: false,
  mode: "review",
  now,
});
assert.equal(reset.reviewStage, 0);
assert.equal(reset.lapseCount, 2);

const reviewStarted = formatActivityDetails({
  type: "grammar_review_started",
  details: {
    sessionId: "hidden-session-id",
    totalItems: 8,
    dueItemCount: 5,
    legacyItemCount: 2,
    maintenanceItemCount: 1,
    schemaVersion: 2,
  },
});
assert.equal(
  reviewStarted,
  "8 questions · 5 due reviews · 2 legacy mistakes · 1 maintenance check"
);
assert.equal(reviewStarted.includes("hidden-session-id"), false);
assert.equal(
  getActivityTypeLabel("grammar_review_started"),
  "Grammar Mistake Review Started"
);

const reviewCompleted = formatActivityDetails({
  type: "grammar_review_completed",
  details: {
    sessionId: "hidden-session-id",
    totalItems: 8,
    correctCount: 6,
    incorrectCount: 2,
    accuracy: 75,
    schemaVersion: 2,
  },
});
assert.equal(reviewCompleted, "6/8 correct · 75% accuracy · 2 immediate retries");
assert.equal(reviewCompleted.includes("hidden-session-id"), false);

console.log("Grammar review transition tests passed.");
