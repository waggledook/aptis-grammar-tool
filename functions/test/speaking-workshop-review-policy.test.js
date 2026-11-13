/* eslint-disable no-undef */
const assert = require("node:assert/strict");
const test = require("node:test");
const {getSpeakingWorkshopReviewCorrection} = require("../speaking-workshop-review-policy");
const DAY_MS = 86400000;
const endedAt = 1794556800000;
const stamp = (value) => ({toMillis: () => value});

test("the migration corrects exactly 14-day reviews to 28 days from the original end", () => {
  assert.equal(getSpeakingWorkshopReviewCorrection({
    phase: "review", endedAt: stamp(endedAt), reviewUntil: stamp(endedAt + 14 * DAY_MS),
  }), endedAt + 28 * DAY_MS);
});

test("custom deadlines, four-week reviews, active sessions and missing timestamps are preserved", () => {
  for (const days of [7, 27, 28, 30]) {
    assert.equal(getSpeakingWorkshopReviewCorrection({
      phase: "review", endedAt: stamp(endedAt), reviewUntil: stamp(endedAt + days * DAY_MS),
    }), null);
  }
  assert.equal(getSpeakingWorkshopReviewCorrection({phase: "review"}), null);
  assert.equal(getSpeakingWorkshopReviewCorrection({
    phase: "live", endedAt: stamp(endedAt), reviewUntil: stamp(endedAt + 14 * DAY_MS),
  }), null);
});
