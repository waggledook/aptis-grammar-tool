import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAptisGrammarVocabularyClassMistakes,
  buildAptisGrammarVocabularyMistakes,
  prioritizeAptisGrammarVocabularyMistakes,
} from "../src/utils/aptisGrammarVocabularyMistakes.js";

test("builds deduplicated mistakes from raw answers and excludes unanswered questions", () => {
  const attempts = [
    {
      mockId: "mock-1",
      answers: {
        "m1-g1": "gives",
        "m1-v1": { 1: "A" },
      },
    },
    {
      mockId: "mock-1",
      answers: {
        "m1-g1": "gives",
        "m1-v1": { 1: "A" },
      },
    },
  ];

  const mistakes = buildAptisGrammarVocabularyMistakes(attempts);
  assert.deepEqual(mistakes.map((item) => item.key), [
    "grammar:m1-g1",
    "vocabulary:m1-v1:1",
  ]);
  assert.equal(mistakes[1].task.options.length, 10);
});

test("supports historical review snapshots without raw answers", () => {
  const attempts = [{
    mockId: "mock-1",
    review: {
      grammarItems: [
        { id: "m1-g2", number: 2, selected: "that", correct: false },
        { id: "m1-g3", number: 3, selected: "", correct: false },
      ],
      vocabularyTasks: [{
        id: "m1-v2",
        range: "Questions 6–10",
        type: "Vocabulary in Context",
        items: [
          { number: 6, selected: "advise", correct: false },
          { number: 7, selected: "", correct: false },
        ],
      }],
    },
  }];

  const mistakes = buildAptisGrammarVocabularyMistakes(attempts);
  assert.deepEqual(mistakes.map((item) => item.key), [
    "grammar:m1-g2",
    "vocabulary:m1-v2:6",
  ]);
});

test("ignores correct answers, unknown mocks and empty input", () => {
  assert.deepEqual(buildAptisGrammarVocabularyMistakes(null), []);
  assert.deepEqual(buildAptisGrammarVocabularyMistakes([{ mockId: "missing" }]), []);
  assert.deepEqual(buildAptisGrammarVocabularyMistakes([{
    mockId: "mock-1",
    answers: {
      "m1-g1": "is giving",
      "m1-v1": { 1: "H" },
    },
  }]), []);
});

test("merges overlapping class mistakes and records every affected student once", () => {
  const groups = [
    {
      student: { id: "student-1", displayName: "Alex" },
      attempts: [{ mockId: "mock-1", answers: { "m1-g1": "gives" } }],
    },
    {
      student: { id: "student-2", displayName: "Bailey" },
      attempts: [
        { mockId: "mock-1", answers: { "m1-g1": "gives", "m1-v1": { 1: "A" } } },
        { mockId: "mock-1", answers: { "m1-g1": "gives" } },
      ],
    },
  ];

  const mistakes = buildAptisGrammarVocabularyClassMistakes(groups);
  assert.deepEqual(mistakes.map((item) => item.key), [
    "grammar:m1-g1",
    "vocabulary:m1-v1:1",
  ]);
  assert.deepEqual(mistakes[0].studentIds, ["student-1", "student-2"]);
  assert.deepEqual(mistakes[0].studentNames, ["Alex", "Bailey"]);
  assert.deepEqual(mistakes[1].studentIds, ["student-2"]);
});

test("prioritises mistakes missed by the most students without changing the input", () => {
  const mistakes = [
    { key: "one", studentIds: ["student-1"] },
    { key: "three-a", studentIds: ["student-1", "student-2", "student-3"] },
    { key: "three-b", studentIds: ["student-2", "student-3", "student-4"] },
    { key: "two", studentIds: ["student-1", "student-2"] },
  ];

  const prioritised = prioritizeAptisGrammarVocabularyMistakes(mistakes);

  assert.deepEqual(
    prioritised.map((item) => item.key),
    ["three-a", "three-b", "two", "one"]
  );
  assert.deepEqual(
    mistakes.map((item) => item.key),
    ["one", "three-a", "three-b", "two"]
  );
});
