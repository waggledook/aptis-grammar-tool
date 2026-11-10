import assert from "node:assert/strict";
import test from "node:test";
import { HUB_GRAMMAR_ACTIVITIES } from "../src/data/hubGrammarActivities.js";
import {
  buildHubMiniGrammarQuestionBank, filterHubMiniGrammarQuestionBank, generateHubMiniGrammarQuiz,
  getHubMiniGrammarQuestionText, getHubMiniGrammarQuestionAnswer, toggleHubMiniGrammarQuizItem,
} from "../src/utils/hubMiniGrammarQuiz.js";
import { buildHubGrammarReviewSession, HUB_GRAMMAR_QUIZ_LIVE_SOURCE } from "../src/utils/hubGrammarMistakes.js";
import { getHubGrammarLiveReviewEvents } from "../src/utils/hubGrammarReview.js";

const bank = buildHubMiniGrammarQuestionBank();

test("the standalone bank contains every mini test item without requiring learners or attempts", () => {
  assert.equal(bank.length, HUB_GRAMMAR_ACTIVITIES.reduce((sum, activity) => sum + activity.items.length, 0));
  assert.equal(new Set(bank.map((item) => item.key)).size, bank.length);
  assert.ok(bank.every((item) => item.studentIds.length === 0 && getHubMiniGrammarQuestionText(item).trim()));
  const collisions = buildHubMiniGrammarQuestionBank([
    { id: "a", items: [{ id: "one" }, { id: "one" }] }, { id: "b", items: [{ id: "one" }] },
  ]);
  assert.deepEqual(collisions.map((item) => item.key), ["a:one", "b:one"]);
});

test("question pools support all tests, one or several tests, levels and format/text searches", () => {
  const ids = HUB_GRAMMAR_ACTIVITIES.slice(0, 2).map((activity) => activity.id);
  assert.equal(filterHubMiniGrammarQuestionBank(bank).length, bank.length);
  assert.equal(filterHubMiniGrammarQuestionBank(bank, { scope: "selected" }).length, 0);
  const twoTests = filterHubMiniGrammarQuestionBank(bank, { scope: "selected", testIds: ids });
  assert.equal(twoTests.length, HUB_GRAMMAR_ACTIVITIES.slice(0, 2).reduce((sum, activity) => sum + activity.items.length, 0));
  assert.ok(twoTests.every((item) => ids.includes(item.activityId)));
  const filtered = filterHubMiniGrammarQuestionBank(bank, { levels: ["a1"], type: "multiple-choice", search: "MORNING COURSE" });
  assert.ok(filtered.length > 0);
  assert.ok(filtered.every((item) => item.level === "a1" && item.question.type === "multiple-choice"));
  assert.ok(filterHubMiniGrammarQuestionBank(bank, { type: "gap-fill" }).some((item) => !item.question.type));
});

test("random generation is bounded, unique, restricted to its pool and doesn't mutate bank content", () => {
  const pool = bank.slice(0, 12);
  const before = JSON.stringify(pool);
  const generated = generateHubMiniGrammarQuiz(pool, 10, () => 0);
  assert.equal(generated.length, 10);
  assert.equal(new Set(generated.map((item) => item.key)).size, 10);
  assert.ok(generated.every((item) => pool.some((source) => source.key === item.key)));
  assert.equal(generateHubMiniGrammarQuiz([...pool, ...pool], 20).length, 12);
  assert.equal(generateHubMiniGrammarQuiz(bank, 500).length, 50);
  assert.equal(generateHubMiniGrammarQuiz([], 10).length, 0);
  assert.equal(generateHubMiniGrammarQuiz(pool, 0).length, 0);
  assert.equal(JSON.stringify(pool), before);
});

test("manual selection keeps click order, toggles without duplicates and lets questions be removed at the limit", () => {
  let keys = [];
  for (const item of bank.slice(0, 50)) keys = toggleHubMiniGrammarQuizItem(keys, item.key);
  const full = [...keys];
  assert.deepEqual(toggleHubMiniGrammarQuizItem(keys, bank[50].key), full);
  keys = toggleHubMiniGrammarQuizItem(keys, keys[0]);
  assert.equal(keys.length, 49);
  keys = toggleHubMiniGrammarQuizItem(keys, bank[50].key);
  assert.equal(keys.at(-1), bank[50].key);
  assert.equal(new Set(keys).size, 50);
  assert.deepEqual(full, bank.slice(0, 50).map((item) => item.key));
});

test("every format has a usable teacher preview and bank sessions preserve the exact chosen order", () => {
  for (const item of bank) assert.ok(getHubMiniGrammarQuestionAnswer(item).answer.trim(), item.key);
  const picked = [bank[5], bank[0], bank[20]];
  const session = buildHubGrammarReviewSession(picked, 0, { title: "My class set", questionSource: "bank" });
  assert.equal(session.activity.title, "My class set");
  assert.equal(session.questionSource, "bank");
  assert.equal(session.studentCount, 0);
  assert.deepEqual(session.activity.items.map((item) => item.id), picked.map((item) => item.key));
  assert.deepEqual(session.activity.items.map((item) => item.type), picked.map((item) => item.question.type));
});

test("individual answers in custom bank live rooms use personal learning progress, including new errors", () => {
  const game = { source: HUB_GRAMMAR_QUIZ_LIVE_SOURCE, players: { student: {} }, items: [{ id: bank[0].key }],
    answers: { 0: { student: { correct: false, submittedAt: 1000 } } } };
  const [event] = getHubGrammarLiveReviewEvents("bank-room", game, "student", []);
  assert.equal(event.itemKey, bank[0].key);
  assert.equal(event.isCorrect, false);
  assert.equal(event.knownMistake, false);
  assert.equal(event.source, "live");
});
