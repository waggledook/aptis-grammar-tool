import assert from "node:assert/strict";
import test from "node:test";
import { HUB_GRAMMAR_ACTIVITIES } from "../src/data/hubGrammarActivities.js";
import {
  buildHubGrammarMistakes, buildHubGrammarReviewLiveItems, buildHubGrammarReviewSession,
  hubGrammarReviewCounts, isHubGrammarLiveAnswerCorrect, selectHubGrammarMistakes,
} from "../src/utils/hubGrammarMistakes.js";
import { buildGrammarLiveProgress, buildGrammarLiveReport } from "../src/components/grammar/aptisGrammarLiveResults.js";

const questions = HUB_GRAMMAR_ACTIVITIES.flatMap((activity) => activity.items.map((question, index) => ({
  key: `${activity.id}:${question.id}`, activityId: activity.id, activityTitle: activity.title,
  number: index + 1, level: activity.level, question, studentIds: ["private-learner"],
})));

test("repeated attempts and selected learners share one mistake per source question; blanks and deleted content are excluded", () => {
  const activities = [
    { id: "one", title: "First", items: [{ id: "same" }, { id: "blank" }, { id: "gap" }] },
    { id: "two", title: "Second", items: [{ id: "same" }] },
  ];
  const first = { activityId: "one", items: [
    { id: "same", isCorrect: false, hasAnswer: true },
    { id: "blank", isCorrect: false, hasAnswer: false },
    { id: "gap", gaps: [{ answer: "", isCorrect: false }, { answer: "right", isCorrect: true }] },
    { id: "removed", isCorrect: false },
  ] };
  const groups = [
    { student: { id: "a" }, submissions: [first, first, { activityId: "removed", items: first.items }] },
    { student: { id: "b" }, submissions: [first, { activityId: "two", items: [{ id: "same", isCorrect: false }] }] },
  ];
  const before = JSON.stringify(groups);
  const mistakes = buildHubGrammarMistakes(groups, activities);
  assert.deepEqual(mistakes.map((item) => [item.key, item.studentIds]), [["one:same", ["a", "b"]], ["two:same", ["b"]]]);
  assert.equal(JSON.stringify(groups), before);
  assert.deepEqual(buildHubGrammarMistakes(null), []);
  first.items[2].gaps[0].answer = "wrong";
  assert.ok(buildHubGrammarMistakes(groups, activities).some((item) => item.key === "one:gap"));
});

test("review lengths advance by five and smaller pools are usable without duplicating questions", () => {
  assert.deepEqual(hubGrammarReviewCounts(0), []);
  assert.deepEqual(hubGrammarReviewCounts(3), [5]);
  assert.deepEqual(hubGrammarReviewCounts(12), [5, 10, 15]);
  assert.deepEqual(hubGrammarReviewCounts(300, 50), [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);
  const frequent = { ...questions[0], studentIds: ["a", "b", "c"] };
  const pool = [questions[1], frequent, questions[2]];
  assert.equal(selectHubGrammarMistakes(pool, 1, true, () => 0)[0].key, frequent.key);
  assert.equal(selectHubGrammarMistakes(pool, 5).length, 3);
  assert.equal(new Set(selectHubGrammarMistakes(pool, 5).map((item) => item.key)).size, 3);
});

test("mixed reviews preserve original interactions and namespace IDs across mini tests", () => {
  const items = questions.slice(0, 20);
  const before = JSON.stringify(items);
  const session = buildHubGrammarReviewSession(items, 2);
  assert.equal(session.activity.items.length, 20);
  assert.equal(session.studentCount, 2);
  assert.equal(session.testCount, new Set(items.map((item) => item.activityId)).size);
  session.activity.items.forEach((question, index) => {
    assert.equal(question.id, items[index].key);
    assert.equal(question.type, items[index].question.type);
    assert.ok(question.sourceLabel);
    assert.equal(session.submission.items[index].isCorrect, false);
  });
  assert.equal(JSON.stringify(items), before);
});

test("every mini grammar question converts to a playable live round with correct scoring, feedback and media", () => {
  const before = JSON.stringify(questions);
  const live = buildHubGrammarReviewLiveItems(questions, () => 0);
  assert.equal(live.length, questions.length);
  assert.equal(new Set(live.map((item) => item.id)).size, live.length);
  const formats = new Set();
  live.forEach((item, index) => {
    const source = questions[index].question;
    formats.add(source.type || "gap-fill");
    assert.ok(item.sentence.trim(), item.id);
    assert.doesNotMatch(item.sentence, /undefined/);
    assert.equal(item.audioSrc, source.audioSrc || "");
    assert.equal(item.image, source.imageSrc || "");
    if (item.interactionType === "multiple-choice") {
      assert.equal(item.options[item.answerIndex], source.options[source.answerIndex], item.id);
      assert.equal(item.explanations[item.answerIndex], source.explanation);
    } else {
      assert.ok(isHubGrammarLiveAnswerCorrect(item.answer, item), item.id);
      assert.equal(isHubGrammarLiveAnswerCorrect("nonsense answer", item), false, item.id);
      assert.ok(item.answer.length <= 200, item.id);
    }
  });
  assert.equal(formats.size, 7);
  assert.doesNotMatch(JSON.stringify(live), /private-learner|studentIds|studentNames/);
  assert.equal(JSON.stringify(questions), before);
});

test("live gap fills accept every combination, including alternatives beyond a flat twelve-answer limit", () => {
  const source = questions.find((item) => item.question.id === "a2-1a-profile-1");
  const [item] = buildHubGrammarReviewLiveItems([source]);
  const last = item.acceptedAnswerGroups.map((group) => group.at(-1)).join(" / ");
  assert.ok(isHubGrammarLiveAnswerCorrect(last, item));
  assert.equal(isHubGrammarLiveAnswerCorrect(last + " / extra", item), false);
  assert.equal(isHubGrammarLiveAnswerCorrect("", item), false);
});

test("comma exercises preserve internal punctuation and contractions follow mini test scoring", () => {
  const source = questions.find((item) => item.question.type === "comma-placement" && item.question.commaPositions.length);
  const [item] = buildHubGrammarReviewLiveItems([source]);
  assert.ok(isHubGrammarLiveAnswerCorrect(item.answer, item));
  assert.equal(isHubGrammarLiveAnswerCorrect(item.answer.replaceAll(",", ""), item), false);
  assert.ok(isHubGrammarLiveAnswerCorrect("She’s getting used to it.", { acceptedAnswers: ["She is getting used to it"] }));
});

test("mixed live standings hide pending results and count written answers in anonymous class reports", () => {
  const game = {
    items: [{ interactionType: "write", answer: "am" }, { options: ["a", "b"], answerIndex: 1 }],
    players: { ana: { name: "Private Ana", score: 1000 }, ben: { name: "Private Ben", score: 0 }, cara: { score: 0 } },
    answers: { 0: { ana: { typedAnswer: "am", correct: true, scoreDelta: 1000 }, ben: { typedAnswer: "is", correct: false } }, 1: { ana: { selectedIndex: 1 } } },
    state: { phase: "question", questionIndex: 0 },
  };
  const hidden = buildGrammarLiveProgress(game);
  assert.equal(hidden.completedQuestionCount, 0);
  assert.ok(hidden.standings.every((player) => player.score === 0));
  game.state.phase = "finished";
  const progress = buildGrammarLiveProgress(game);
  assert.equal(progress.standings[0].correctCount, 2);
  const report = buildGrammarLiveReport(game);
  assert.equal(report.answered, 3);
  assert.equal(report.correct, 2);
  assert.equal(report.incorrect, 1);
  assert.equal(report.unanswered, 3);
  assert.deepEqual(report.questions[0].options.map((option) => option.count), [1, 1]);
  assert.doesNotMatch(JSON.stringify(report), /Private Ana|Private Ben/);
});
