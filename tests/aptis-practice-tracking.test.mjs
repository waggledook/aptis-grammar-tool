import test from "node:test";
import assert from "node:assert/strict";
import { advanceAptisPracticeRun } from "../src/utils/aptisPracticeRun.js";

const fresh = () => ({
  checkCount: 0,
  firstScore: null,
  firstTotal: null,
  latestScore: null,
  latestTotal: null,
  assisted: false,
  revealedBeforeFirstCheck: false,
});

test("corrections update the same run without changing its first score", () => {
  const first = advanceAptisPracticeRun(fresh(), { type: "check", score: 2, total: 5 });
  const corrected = advanceAptisPracticeRun(first, { type: "check", score: 5, total: 5 });
  assert.equal(corrected.checkCount, 2);
  assert.equal(corrected.firstScore, 2);
  assert.equal(corrected.latestScore, 5);
});

test("revealing answers before checking yields no independent first score", () => {
  const revealed = advanceAptisPracticeRun(fresh(), { type: "reveal" });
  const checked = advanceAptisPracticeRun(revealed, { type: "check", score: 5, total: 5 });
  assert.equal(checked.firstScore, null);
  assert.equal(checked.assisted, true);
  assert.equal(checked.revealedBeforeFirstCheck, true);
});

test("revealing answers after a check preserves that independent score", () => {
  const first = advanceAptisPracticeRun(fresh(), { type: "check", score: 3, total: 5 });
  const revealed = advanceAptisPracticeRun(first, { type: "reveal" });
  assert.equal(revealed.firstScore, 3);
  assert.equal(revealed.assisted, true);
  assert.equal(revealed.revealedBeforeFirstCheck, false);
});
