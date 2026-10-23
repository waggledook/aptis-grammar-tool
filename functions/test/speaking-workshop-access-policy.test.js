/* eslint-disable no-undef */
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  canUseRelaxedPractice,
} = require("../speaking-workshop-access-policy");

test("existing sessions retain relaxed practice during preparation", () => {
  assert.equal(canUseRelaxedPractice({}, "preparation"), true);
});

test("new sessions keep relaxed practice locked during preparation", () => {
  assert.equal(canUseRelaxedPractice({relaxedPracticeRequiresLive: true}, "preparation"), false);
});

test("new sessions unlock relaxed practice when live or in review", () => {
  const session = {relaxedPracticeRequiresLive: true};
  assert.equal(canUseRelaxedPractice(session, "live"), true);
  assert.equal(canUseRelaxedPractice(session, "review"), true);
});
