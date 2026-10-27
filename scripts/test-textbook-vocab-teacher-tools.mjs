import assert from "node:assert/strict";
import test from "node:test";

import {
  getHubVocabTheme,
  getVisibleHubVocabThemes,
} from "../src/data/hubVocabularyActivities.js";
import {
  buildTextbookVocabCuratedLiveItems,
  buildTextbookVocabMatchingRounds,
  buildTextbookVocabLiveQuestions,
  buildTextbookVocabRandomLiveItems,
  getTextbookVocabLiveMode,
  isTextbookVocabLiveWrittenAnswerCorrect,
  scoreTextbookVocabLiveAnswer,
  selectRandomTextbookVocabQuestions,
} from "../src/components/hub/textbookVocabLive.js";
import { resolveTextbookVocabAssignmentCompletion } from "../src/utils/textbookVocabAssignments.js";

test("live builder produces valid multiple-choice questions from published textbook banks", () => {
  const questions = buildTextbookVocabLiveQuestions({ role: "teacher" });
  const visibleThemeIds = new Set(getVisibleHubVocabThemes({ role: "teacher" }).map((theme) => theme.id));

  assert.ok(questions.length > 500);
  assert.equal(new Set(questions.map((question) => question.id)).size, questions.length);
  questions.forEach((question) => {
    assert.ok(visibleThemeIds.has(question.sourceThemeId));
    assert.ok(question.sentence);
    assert.ok(question.options.length >= 2 && question.options.length <= 4);
    assert.ok(question.answerIndex >= 0 && question.answerIndex < question.options.length);
    assert.ok(question.answer);
    assert.ok(question.acceptedAnswers.length >= 1);
  });
});

test("random quizzes balance all selected interaction formats", () => {
  const questions = buildTextbookVocabLiveQuestions({ role: "teacher" });
  const items = buildTextbookVocabRandomLiveItems(questions, {
    interactionTypes: ["multiple-choice", "write", "matching"],
    count: 9,
    seed: "mixed-class",
  });

  assert.equal(items.length, 9);
  assert.deepEqual(
    Object.fromEntries([...new Set(items.map((item) => item.interactionType))].map((type) => [
      type,
      items.filter((item) => item.interactionType === type).length,
    ]).sort()),
    { matching: 3, "multiple-choice": 3, write: 3 }
  );
  assert.equal(new Set(items.flatMap((item) => item.interactionType === "matching"
    ? item.pairs.map((pair) => pair.id)
    : [item.id])).size, 18);
});

test("curated quizzes honour per-item formats and group matching items in fours", () => {
  const questions = buildTextbookVocabLiveQuestions({ role: "teacher" }).slice(0, 8);
  const formats = Object.fromEntries(questions.map((question, index) => [
    question.id,
    index < 4 ? "matching" : index % 2 ? "write" : "multiple-choice",
  ]));
  const items = buildTextbookVocabCuratedLiveItems(questions, formats);

  assert.equal(items.filter((item) => item.interactionType === "matching").length, 1);
  assert.equal(items.filter((item) => item.interactionType === "write").length, 2);
  assert.equal(items.filter((item) => item.interactionType === "multiple-choice").length, 2);
});

test("matching mode builds deterministic four-item rounds with distinct answers", () => {
  const questions = buildTextbookVocabLiveQuestions({ role: "teacher" });
  const rounds = buildTextbookVocabMatchingRounds(questions, { seed: "class-a", maxRounds: 3 });

  assert.equal(rounds.length, 3);
  rounds.forEach((round) => {
    assert.equal(round.interactionType, "matching");
    assert.equal(round.pairs.length, 4);
    assert.equal(round.matchOptions.length, 4);
    assert.equal(new Set(round.matchOptions.map((answer) => answer.toLowerCase())).size, 4);
    round.pairs.forEach((pair) => assert.ok(pair.answerIndex >= 0 && pair.answerIndex < 4));
  });
  assert.deepEqual(
    rounds.map((round) => round.id),
    buildTextbookVocabMatchingRounds(questions, { seed: "class-a", maxRounds: 3 }).map((round) => round.id)
  );
});

test("write mode accepts harmless punctuation, spacing and capitalisation differences", () => {
  assert.equal(isTextbookVocabLiveWrittenAnswerCorrect(" Twenty-One! ", ["twenty-one"]), true);
  assert.equal(isTextbookVocabLiveWrittenAnswerCorrect("DONT", ["don't"]), true);
  assert.equal(isTextbookVocabLiveWrittenAnswerCorrect("twenty-two", ["twenty-one"]), false);
  assert.equal(getTextbookVocabLiveMode("multiple-choice").defaultDuration, 20);
  assert.equal(getTextbookVocabLiveMode("write").defaultDuration, 30);
  assert.equal(getTextbookVocabLiveMode("matching").defaultDuration, 45);
});

test("random live selection is unique, bounded and stable for a seed", () => {
  const questions = buildTextbookVocabLiveQuestions({ role: "teacher" });
  const first = selectRandomTextbookVocabQuestions(questions, 12, "class-a");
  const second = selectRandomTextbookVocabQuestions(questions, 12, "class-a");

  assert.equal(first.length, 12);
  assert.equal(new Set(first.map((question) => question.id)).size, 12);
  assert.deepEqual(first.map((question) => question.id), second.map((question) => question.id));
});

test("live answers use bounded speed scoring", () => {
  assert.equal(scoreTextbookVocabLiveAnswer({ correct: false, remainingMs: 30000, durationSeconds: 30 }), 0);
  assert.equal(scoreTextbookVocabLiveAnswer({ correct: true, remainingMs: 30000, durationSeconds: 30 }), 1000);
  assert.equal(scoreTextbookVocabLiveAnswer({ correct: true, remainingMs: 0, durationSeconds: 30 }), 300);
  assert.equal(scoreTextbookVocabLiveAnswer({ correct: true, remainingMs: 15000, durationSeconds: 30 }), 650);
});

test("an assigned textbook activity completes only after a fresh completed run", () => {
  const assignment = {
    activityType: "textbook-vocabulary",
    themeId: "numbers",
    textbookActivityId: "quick-choice",
    createdAt: new Date("2026-10-23T10:00:00Z"),
  };

  assert.deepEqual(resolveTextbookVocabAssignmentCompletion(assignment, {
    "numbers:quick-choice": { completed: true, updatedAt: new Date("2026-10-23T09:59:00Z") },
  }), { completed: false, completedAt: 0 });

  const completed = resolveTextbookVocabAssignmentCompletion(assignment, {
    "numbers:quick-choice": { completed: true, updatedAt: new Date("2026-10-23T10:01:00Z") },
  });
  assert.equal(completed.completed, true);
  assert.ok(completed.completedAt > 0);
});

test("a whole-bank assignment requires every current activity", () => {
  const theme = getHubVocabTheme("numbers");
  const createdAt = new Date("2026-10-23T10:00:00Z");
  const assignment = { themeId: theme.id, createdAt };
  const completeProgress = Object.fromEntries(theme.activities.map((activity) => [
    `${theme.id}:${activity.id}`,
    { completed: true, updatedAt: new Date("2026-10-23T10:05:00Z") },
  ]));

  assert.equal(resolveTextbookVocabAssignmentCompletion(assignment, completeProgress).completed, true);
  delete completeProgress[`${theme.id}:${theme.activities[0].id}`];
  assert.equal(resolveTextbookVocabAssignmentCompletion(assignment, completeProgress).completed, false);
});
