import assert from "node:assert/strict";
import test from "node:test";
import {
  GERUND_INFINITIVE_ITEMS as items,
  checkVerbPatternAnswer,
  createVerbPatternAttempt,
  restoreVerbPatternAttempt,
  summariseVerbPatternAttempt,
} from "../src/utils/gerundInfinitiveActivity.js";
import { formatActivityDetails } from "../src/utils/adminActivity.js";

test("accepts the supplied alternatives, Unicode and punctuation", () => {
  const attempt = createVerbPatternAttempt("aptis");
  for (const [i, item] of items.entries()) {
    for (const answer of item.answers) {
      const checked = checkVerbPatternAnswer({ ...attempt.answers[i], value: `  ${answer.toUpperCase()}! ` }, item);
      assert.equal(checked.status, "correct", `${i}: ${answer}`);
    }
  }
  assert.equal(checkVerbPatternAnswer({ ...attempt.answers[0], value: "ＴＯ　ＬＯＣＫ" }, items[0]).status, "correct");
});

test("completion requires all practice gaps and the whole mixed test to be checked", () => {
  const attempt = createVerbPatternAttempt("ote", 1000);
  attempt.answers = attempt.answers.map((entry, i) => checkVerbPatternAnswer({ ...entry, value: items[i].answers[0] }, items[i]));
  let result = summariseVerbPatternAttempt(attempt, 61000);
  assert.equal(result.answeredCount, 24);
  assert.equal(result.canFinish, false);
  attempt.mixedSubmitted = true;
  result = summariseVerbPatternAttempt(attempt, 61000);
  assert.equal(result.canFinish, true);
  assert.equal(result.correctCount, 36);
  assert.equal(result.elapsedSeconds, 60);
  assert.equal(result.app, "ote");
  attempt.answers[0] = { ...attempt.answers[0], status: "", value: "unsubmitted edit" };
  assert.equal(summariseVerbPatternAttempt(attempt).canFinish, false);
});

test("wrong attempts count as work done; corrections and reveals never inflate first-check results", () => {
  const attempt = createVerbPatternAttempt("seifhub");
  attempt.mixedSubmitted = true;
  attempt.answers = attempt.answers.map((entry, i) => checkVerbPatternAnswer({ ...entry, value: "wrong" }, items[i]));
  assert.equal(summariseVerbPatternAttempt(attempt).canFinish, true);
  assert.equal(summariseVerbPatternAttempt(attempt).correctCount, 0);
  attempt.answers[0] = checkVerbPatternAnswer({ ...attempt.answers[0], value: "to lock" }, items[0]);
  assert.equal(attempt.answers[0].firstCorrect, false);
  attempt.answers[1] = checkVerbPatternAnswer(attempt.answers[1], items[1], true);
  attempt.answers[1] = checkVerbPatternAnswer({ ...attempt.answers[1], value: "having ridden" }, items[1]);
  const result = summariseVerbPatternAttempt(attempt);
  assert.equal(result.correctCount, 1);
  assert.equal(result.revealedCount, 1);
  assert.equal(result.firstCorrectCount, 0);
  assert.equal(result.cards[0].correctCount, 1);
  assert.equal(result.cards[0].revealedCount, 1);
  assert.equal(result.app, "seifhub");
});

test("empty mixed-test gaps cannot unlock finish, even after checking the test", () => {
  const attempt = createVerbPatternAttempt("aptis");
  attempt.mixedSubmitted = true;
  attempt.answers = attempt.answers.map((entry, i) => i < 35 ? checkVerbPatternAnswer(entry, items[i], true) : checkVerbPatternAnswer(entry, items[i]));
  const result = summariseVerbPatternAttempt(attempt);
  assert.equal(result.canFinish, false);
  assert.equal(result.answeredCount, 35);
  assert.equal(result.revealedCount, 35);
  assert.equal(result.correctCount, 0);
  assert.equal(result.app, "aptis-trainer");
});

test("resumes the same session without mixing platforms, and recalculates corrupt cached scores", () => {
  const attempt = createVerbPatternAttempt("aptis", 1000);
  attempt.answers[0] = { ...attempt.answers[0], value: "wrong", status: "correct" };
  attempt.page = 50;
  const restored = restoreVerbPatternAttempt(JSON.parse(JSON.stringify(attempt)), "aptis");
  assert.equal(restored.sessionId, attempt.sessionId);
  assert.equal(restored.answers[0].status, "retry");
  assert.equal(restored.page, 0);
  assert.equal(restoreVerbPatternAttempt(attempt, "ote"), null);
  assert.equal(restoreVerbPatternAttempt({ ...attempt, answers: [] }, "aptis"), null);
  assert.equal(restoreVerbPatternAttempt(null, "aptis"), null);
});

test("formats finish details for the existing activity log", () => {
  const attempt = createVerbPatternAttempt("seifhub", 1000);
  attempt.answers = attempt.answers.map((entry, i) => checkVerbPatternAnswer({ ...entry, value: items[i].answers[0] }, items[i]));
  attempt.mixedSubmitted = true;
  attempt.completedAtMs = 76000;
  const details = summariseVerbPatternAttempt(attempt);
  const text = formatActivityDetails({ type: "gerund_infinitive_completed", details });
  assert.match(text, /36\/36 checked/);
  assert.match(text, /36 correct on first check/);
  assert.match(text, /Mixed test 12\/12/);
  assert.match(text, /remember \/ forget: 6\/6/);
  assert.match(text, /Time 1m 15s/);
  assert.equal("answers" in details, false);
});
