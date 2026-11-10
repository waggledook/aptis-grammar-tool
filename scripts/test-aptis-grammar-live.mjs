import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import * as grammar from "../src/components/grammar/aptisGrammarLive.js";
import * as vocabulary from "../src/components/hub/textbookVocabLive.js";
import * as miniReview from "../src/utils/hubGrammarMistakes.js";
import { HUB_GRAMMAR_ACTIVITIES } from "../src/data/hubGrammarActivities.js";
import * as mockReviewLive from "../src/utils/aptisMockMistakeReviewLive.js";
import { buildAptisGrammarVocabularyClassMistakes } from "../src/utils/aptisGrammarVocabularyMistakes.js";
import { APTIS_GRAMMAR_VOCABULARY_MOCKS } from "../src/data/aptisGrammarVocabularyMocks.js";
import { buildGrammarLiveProgress, buildGrammarLiveReport, buildGrammarLiveStandings, formatGrammarPercent } from "../src/components/grammar/aptisGrammarLiveResults.js";

const rawBank = JSON.parse(await fs.readFile(new URL("./grammar-items.json", import.meta.url)));
const bank = grammar.buildGrammarQuestionBank(rawBank);
const mockMistakes = buildAptisGrammarVocabularyClassMistakes([{
  student: { id: "private-source-student", displayName: "Private Source Student" },
  attempts: APTIS_GRAMMAR_VOCABULARY_MOCKS.map((mock) => ({
    mockId: mock.id,
    answers: Object.fromEntries([
      ...mock.grammarQuestions.map((question) => [question.id, question.options.find((_, index) => index !== question.correctAnswer.charCodeAt(0) - 65)]),
      ...mock.vocabularyTasks.map((task) => [task.id, Object.fromEntries(task.rows.map((row) => [row.number, task.options.find((option) => option.value !== row.correctAnswer).value]))]),
    ]),
  })),
}]);

test("all six mocks convert into live questions with complete option banks, correct answers and private source students", () => {
  assert.equal(mockMistakes.length, 300);
  const before = JSON.stringify(mockMistakes);
  for (const random of [() => 0, () => .5, () => .999]) {
    const items = mockReviewLive.buildAptisMockMistakeReviewLiveItems(mockMistakes, random);
    items.forEach((item, index) => {
      const original = mockMistakes[index];
      assert.equal(item.options[item.answerIndex], original.correctValue);
      assert.equal(item.explanations[item.answerIndex], original.explanation);
      assert.equal(item.options.length, original.kind === "grammar" ? 3 : 10);
      assert.deepEqual([...item.options].sort(), (original.kind === "grammar" ? [...original.question.options] : original.task.options.map((option) => option.label)).sort());
      assert.match(item.sourceActivityTitle, /Mock \d · Question \d+/);
      assert.ok(item.sentence);
      assert.doesNotMatch(item.sentence, /Use each word once|will not need/);
      if (original.task?.type === "Collocations") assert.match(item.sentence, /^Choose the word that goes with:/);
    });
    assert.equal(new Set(items.map((item) => item.id)).size, 300);
    assert.doesNotMatch(JSON.stringify(items), /private-source-student|Private Source Student|studentIds|studentNames/);
  }
  assert.equal(JSON.stringify(mockMistakes), before);
});

test("round standings hide current answers and points until reveal, then include missed questions in accuracy", () => {
  const game = {
    state: { phase: "question", questionIndex: 1 },
    items: [{ options: ["A", "B"], answerIndex: 0 }, { options: ["A", "B"], answerIndex: 1 }],
    players: { a: { name: "Ana", score: 1800 }, b: { name: "Ben", score: 1000 }, c: { name: "Cara", score: 0 } },
    answers: {
      0: { a: { selectedIndex: 0 }, b: { selectedIndex: 0 } },
      1: { a: { selectedIndex: 1, scoreDelta: 800 }, b: { selectedIndex: 0, scoreDelta: 0 } },
    },
  };
  const before = JSON.stringify(game);
  const hidden = buildGrammarLiveProgress(game);
  assert.equal(hidden.completedQuestionCount, 1);
  assert.equal(hidden.roundCorrectCount, null);
  assert.equal(hidden.roundCorrectPercent, null);
  assert.deepEqual(hidden.standings.map((p) => [p.uid, p.rank, p.score, p.correctPercent]), [
    ["a", 1, 1000, 100], ["b", 1, 1000, 100], ["c", 2, 0, 0],
  ]);
  assert.equal(JSON.stringify(game), before);
  const revealed = buildGrammarLiveProgress({ ...game, state: { ...game.state, phase: "reveal" } });
  assert.equal(revealed.completedQuestionCount, 2);
  assert.equal(revealed.roundCorrectCount, 1);
  assert.equal(formatGrammarPercent(revealed.roundCorrectPercent), "33.3%");
  assert.deepEqual(revealed.standings.map((p) => [p.uid, p.rank, p.score, p.correctCount, p.correctPercent]), [
    ["a", 1, 1800, 2, 100], ["b", 2, 1000, 1, 50], ["c", 3, 0, 0, 0],
  ]);
});

test("first-round results stay hidden even after submission and zero-answer rounds report zero percent", () => {
  const game = {
    state: { phase: "question", questionIndex: 0 },
    items: [{ options: ["A", "B"], answerIndex: 0 }],
    players: { a: { score: 800 }, b: { score: 0 } },
    answers: { 0: { a: { selectedIndex: 0, scoreDelta: 800 } } },
  };
  const hidden = buildGrammarLiveProgress(game);
  assert.equal(hidden.completedQuestionCount, 0);
  assert.equal(hidden.roundCorrectPercent, null);
  assert.ok(hidden.standings.every((p) => p.score === 0 && p.rank === 1 && p.correctCount === 0));
  const unanswered = buildGrammarLiveProgress({ ...game, answers: {}, state: { phase: "reveal", questionIndex: 0 } });
  assert.equal(unanswered.roundCorrectPercent, 0);
  assert.ok(unanswered.standings.every((p) => p.correctPercent === 0));
  const empty = buildGrammarLiveProgress({ ...game, players: {}, state: { phase: "reveal", questionIndex: 0 } });
  assert.equal(empty.roundCorrectPercent, 0);
  assert.deepEqual(buildGrammarLiveProgress().standings, []);
});

test("finished progress uses all questions and ignores malformed choices and outsiders", () => {
  const game = {
    state: { phase: "finished", questionIndex: 0 },
    items: [{ options: ["A", "B"], answerIndex: 0 }, { options: ["A", "B"], answerIndex: 1 }],
    players: { a: { score: 900 } },
    answers: { 0: { a: { selectedIndex: "0", correct: true } }, 1: { a: { selectedIndex: 1 }, outsider: { selectedIndex: 1 } } },
  };
  const progress = buildGrammarLiveProgress(game);
  assert.equal(progress.completedQuestionCount, 2);
  assert.equal(progress.standings.length, 1);
  assert.equal(progress.standings[0].correctCount, 1);
  assert.equal(progress.standings[0].correctPercent, 50);
  assert.equal(progress.standings[0].score, 900);
});

test("the anonymous class report separates wrong choices and missing answers using all participants as the denominator", () => {
  const items = grammar.buildGrammarLiveItems(bank.slice(0, 2));
  const game = {
    items,
    players: { "private-uid-a": { name: "Private Alice", score: 1000 }, b: { name: "Private Ben", score: 900 }, c: { name: "Private Cara" }, d: { name: "Private Dani" } },
    answers: {
      0: { "private-uid-a": { selectedIndex: items[0].answerIndex, correct: false }, b: { selectedIndex: (items[0].answerIndex + 1) % 3 }, c: { selectedIndex: 99 }, outsider: { selectedIndex: items[0].answerIndex } },
      1: { "private-uid-a": { selectedIndex: items[1].answerIndex }, b: { selectedIndex: items[1].answerIndex }, c: { selectedIndex: (items[1].answerIndex + 1) % 3 } },
    },
  };
  const before = JSON.stringify(game);
  const report = buildGrammarLiveReport(game);
  assert.equal(report.participantCount, 4);
  assert.equal(report.opportunities, 8);
  assert.equal(report.correct, 3);
  assert.equal(report.incorrect, 2);
  assert.equal(report.unanswered, 3);
  assert.equal(report.accuracy, 37.5);
  assert.equal(report.responseRate, 62.5);
  assert.deepEqual(report.questions.map((question) => [question.correctPercent, question.incorrectPercent, question.unansweredPercent]), [[25, 25, 50], [50, 25, 25]]);
  report.questions.forEach((question) => {
    assert.equal(question.correct + question.incorrect + question.unanswered, 4);
    assert.equal(question.options.reduce((total, option) => total + option.count, 0), question.answered);
  });
  assert.doesNotMatch(JSON.stringify(report), /Private Alice|Private Ben|private-uid-a|outsider/);
  assert.equal(JSON.stringify(game), before);
});

test("reports handle empty rooms, absent answers and zero-question sessions without NaN or fabricated responses", () => {
  const items = grammar.buildGrammarLiveItems(bank.slice(0, 2));
  const empty = buildGrammarLiveReport({ items, answers: { 0: { stranger: { selectedIndex: items[0].answerIndex } } } });
  assert.equal(empty.participantCount, 0);
  assert.equal(empty.answered, 0);
  assert.equal(empty.accuracy, 0);
  assert.equal(empty.responseRate, 0);
  const noAnswers = buildGrammarLiveReport({ items, players: { a: {}, b: {} } });
  assert.equal(noAnswers.unanswered, 4);
  assert.ok(noAnswers.questions.every((question) => question.unansweredPercent === 100));
  assert.equal(buildGrammarLiveReport({ players: { a: {} } }).opportunities, 0);
  assert.equal(formatGrammarPercent(100 / 3), "33.3%");
});

test("podium standings include all tied students in shared places and keep subsequent places consistent", () => {
  const standings = buildGrammarLiveStandings({ a: { name: "Ana", score: 900 }, b: { name: "Ben", score: 900 }, c: { name: "Cara", score: 500 }, d: { name: "Dani", score: 100 } });
  assert.deepEqual(standings.map((player) => [player.name, player.rank]), [["Ana", 1], ["Ben", 1], ["Cara", 2], ["Dani", 3]]);
  assert.equal(buildGrammarLiveStandings({ only: { name: "Solo", score: 0 } })[0].rank, 1);
  assert.deepEqual(buildGrammarLiveStandings({}), []);
  assert.ok(buildGrammarLiveStandings({ a: { score: Infinity }, b: { score: -10 } }).every((player) => player.score === 0 && player.rank === 1));
});

test("the whole grammar bank is available with valid unique questions and topic metadata", () => {
  assert.equal(bank.length, rawBank.length);
  assert.equal(new Set(bank.map((item) => item.id)).size, bank.length);
  assert.deepEqual([...new Set(bank.map((item) => item.level))].sort(), ["A2", "B1", "B2", "C1"]);
  assert.ok(bank.every((item) => item.tags.length && item.options[item.answerIndex]));
});

test("filters combine levels with any selected topic and a case-insensitive text search", () => {
  const filtered = grammar.filterGrammarQuestions(bank, { levels: ["B1", "B2"], tags: ["Articles", "Conditionals"] });
  assert.ok(filtered.length > 10);
  assert.ok(filtered.every((item) => ["B1", "B2"].includes(item.level)
    && item.tags.some((tag) => ["Articles", "Conditionals"].includes(tag))));
  assert.equal(grammar.filterGrammarQuestions(bank).length, bank.length);
  const sample = filtered[0];
  assert.ok(grammar.filterGrammarQuestions(filtered, { search: sample.sentence.toUpperCase() }).some((item) => item.id === sample.id));
  assert.deepEqual(grammar.filterGrammarQuestions(bank, { search: "no-such-grammar-sentence" }), []);
});

test("random generation caps size, reports short pools through its length and never duplicates questions", () => {
  for (const size of [1, 10, 50, 300]) {
    const ids = grammar.generateGrammarQuiz([...bank, bank[0]], size);
    assert.equal(ids.length, Math.min(size, 50));
    assert.equal(new Set(ids).size, ids.length);
  }
  assert.equal(grammar.generateGrammarQuiz(bank.slice(0, 3), 10).length, 3);
  assert.deepEqual(grammar.generateGrammarQuiz([], 10), []);
});

test("top-up preserves manual selections outside the filters, their order and their uniqueness", () => {
  const chosen = [bank[0].id, bank[1].id];
  const pool = bank.slice(10, 20);
  const result = grammar.generateGrammarQuiz(pool, 8, [...chosen, chosen[0]]);
  assert.deepEqual(result.slice(0, 2), chosen);
  assert.equal(result.length, 8);
  assert.equal(new Set(result).size, 8);
  assert.ok(result.slice(2).every((id) => pool.some((item) => item.id === id)));
  assert.deepEqual(grammar.generateGrammarQuiz(pool, 1, chosen), chosen);
});

test("live answer shuffling preserves the correct answer and every option's explanation without mutating the bank", () => {
  const before = JSON.stringify(bank);
  for (const random of [() => 0, () => .5, () => .999]) {
    const live = grammar.buildGrammarLiveItems(bank, random);
    live.forEach((item, index) => {
      const original = bank[index];
      assert.equal(item.options[item.answerIndex], original.options[original.answerIndex]);
      item.options.forEach((option, optionIndex) => assert.equal(item.explanations[optionIndex], original.explanations?.[original.options.indexOf(option)] || ""));
    });
  }
  assert.equal(JSON.stringify(bank), before);
});

// Run the production API with an in-memory Realtime Database and authenticated identities.
// No Firebase project, network access, credentials or production data are used.
async function apiHarness() {
  const store = {};
  const auth = { currentUser: { uid: "teacher", displayName: "Teacher" } };
  let sequence = 0;
  const read = (path) => path.split("/").filter(Boolean).reduce((node, part) => node?.[part], store) ?? null;
  function write(path, value) {
    const parts = path.split("/").filter(Boolean);
    const leaf = parts.pop();
    const parent = parts.reduce((node, part) => node[part] ||= {}, store);
    parent[leaf] = structuredClone(value);
  }
  const snapshot = (value) => ({ exists: () => value != null, val: () => structuredClone(value) });
  const database = {
    ref: (_, path) => ({ path }),
    push: ({ path }) => ({ path: `${path}/room-${++sequence}`, key: `room-${sequence}` }),
    set: async ({ path }, value) => write(path, value),
    get: async ({ path, filters }) => {
      const value = read(path);
      return snapshot(filters ? Object.fromEntries(Object.entries(value || {}).filter(([, game]) => game[filters[0]] === filters[1])) : value);
    },
    query: (reference, ...filters) => ({ ...reference, filters }),
    orderByChild: (field) => field,
    equalTo: (value) => value,
    update: async ({ path }, updates) => Object.entries(updates).forEach(([key, value]) => write(`${path}/${key}`, value)),
    runTransaction: async ({ path }, updater) => {
      const next = updater(structuredClone(read(path)));
      if (next === undefined) return { committed: false, snapshot: snapshot(read(path)) };
      write(path, next);
      return { committed: true, snapshot: snapshot(next) };
    },
    serverTimestamp: () => Date.now(),
  };
  const source = await fs.readFile(new URL("../src/api/liveGames.js", import.meta.url), "utf8");
  const imports = new Map([...source.matchAll(/import\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/g)]
    .map((match) => [match[2], match[1].split(",").map((name) => name.trim()).filter(Boolean)]));
  const module = new vm.SourceTextModule(source);
  await module.link((specifier) => {
    const implementations = specifier === "firebase/database" ? database
      : specifier === "../firebase" ? { auth, rtdb: {} }
        : specifier.includes("realtimeServerTime") ? { getRealtimeServerTimeOffset: async () => 500 }
          : specifier.includes("hubGrammarMistakes") ? miniReview
          : specifier.includes("aptisMockMistakeReviewLive") ? mockReviewLive
          : specifier.includes("aptisGrammarLive") ? grammar
            : specifier.includes("textbookVocabLive") ? vocabulary : {};
    const names = imports.get(specifier).map((name) => name.split(/\s+as\s+/)[0]);
    return new vm.SyntheticModule(names, function () {
      names.forEach((name) => this.setExport(name, implementations[name] ?? (name.endsWith("_GAME_TYPE") ? name : () => {})));
    });
  });
  await module.evaluate();
  return { api: module.namespace, auth, read, write };
}

test("grammar live lifecycle: PIN joining, host controls, deadline, answer locking, reveal and completion", async () => {
  const { api, auth, read, write } = await apiHarness();
  const items = grammar.buildGrammarLiveItems(bank.slice(0, 2));
  const { gameId, pin } = await api.createAptisGrammarLiveGame({ items, title: "B1 revision", questionDuration: 45 });
  const roomPath = `liveGames/${gameId}`;
  assert.equal(read(roomPath).type, grammar.APTIS_GRAMMAR_LIVE_GAME_TYPE);
  assert.equal(read(roomPath).state.questionDuration, 45);
  assert.match(pin, /^\d{6}$/);
  auth.currentUser = { uid: "student", displayName: "Student" };
  assert.equal((await api.joinLiveGameByPin(pin)).type, grammar.APTIS_GRAMMAR_LIVE_GAME_TYPE);
  assert.equal(read(`${roomPath}/players/student`).score, 0);
  await assert.rejects(api.startTextbookVocabLiveGame(gameId), /Only the quiz host/);
  auth.currentUser = { uid: "teacher" };
  await api.setTextbookVocabLiveDuration(gameId, 60, "multiple-choice");
  await api.startTextbookVocabLiveGame(gameId);
  assert.equal(read(roomPath).state.phase, "question");
  assert.ok(read(roomPath).state.questionDeadline > Date.now() + 60000);
  await assert.rejects(api.startNextTextbookVocabLiveQuestion(gameId), /Reveal/);
  await assert.rejects(api.setTextbookVocabLiveDuration(gameId, 15), /only be changed in the lobby/);
  auth.currentUser = { uid: "student" };
  await api.submitTextbookVocabLiveAnswer({ gameId, selectedIndex: items[0].answerIndex });
  const score = read(`${roomPath}/players/student`).score;
  assert.ok(score >= 300 && score <= 1000);
  await assert.rejects(api.submitTextbookVocabLiveAnswer({ gameId, selectedIndex: items[0].answerIndex }), /already locked/);
  assert.equal(read(`${roomPath}/players/student`).score, score);
  auth.currentUser = { uid: "teacher" };
  const deadline = read(`${roomPath}/state`).questionDeadline;
  await api.revealTextbookVocabLiveQuestion(gameId, deadline - 1, 0);
  assert.equal(read(`${roomPath}/state`).phase, "question");
  await api.revealTextbookVocabLiveQuestion(gameId, deadline, 0);
  await api.startNextTextbookVocabLiveQuestion(gameId);
  assert.equal(read(`${roomPath}/state`).questionIndex, 1);
  write(`${roomPath}/state/questionDeadline`, Date.now() - 1000);
  auth.currentUser = { uid: "student" };
  await assert.rejects(api.submitTextbookVocabLiveAnswer({ gameId, selectedIndex: 0 }), /Time is up/);
  auth.currentUser = { uid: "teacher" };
  await api.revealTextbookVocabLiveQuestion(gameId);
  await api.startNextTextbookVocabLiveQuestion(gameId);
  assert.equal(read(roomPath).status, "finished");
  assert.equal(read(`${roomPath}/players/student`).score, score);
});

test("both quiz types validate input and vocabulary retains its existing room identity and timer", async () => {
  const { api, auth, read } = await apiHarness();
  const items = grammar.buildGrammarLiveItems(bank.slice(0, 2));
  await assert.rejects(api.createAptisGrammarLiveGame({ items: [] }), /Choose questions/);
  await assert.rejects(api.createAptisGrammarLiveGame({ items: items.slice(0, 1) }), /at least two/);
  await assert.rejects(api.createAptisGrammarLiveGame({ items: Array(51).fill(items[0]) }), /up to 50/);
  await assert.rejects(api.createAptisGrammarLiveGame({ items: [{ ...items[0], interactionType: "write" }] }), /multiple-choice/);
  const { gameId } = await api.createTextbookVocabLiveGame({ items });
  assert.equal(read(`liveGames/${gameId}`).type, vocabulary.TEXTBOOK_VOCAB_LIVE_GAME_TYPE);
  assert.equal(read(`liveGames/${gameId}`).state.questionDuration, 20);
  auth.currentUser = null;
  await assert.rejects(api.createAptisGrammarLiveGame({ items }), /signed in/);
});

test("mock review uses the grammar PIN lifecycle and scores choices beyond the fourth option", async () => {
  const { api, auth, read } = await apiHarness();
  const vocabularyMistake = mockMistakes.find((item) => item.kind === "vocabulary");
  const { gameId, pin } = await api.createAptisMockMistakeReviewLiveGame({
    items: [vocabularyMistake, mockMistakes[0]], title: "Class revision", questionDuration: 45,
  });
  const path = `liveGames/${gameId}`;
  const room = read(path);
  assert.equal(room.type, grammar.APTIS_GRAMMAR_LIVE_GAME_TYPE);
  assert.equal(room.source, mockReviewLive.APTIS_MOCK_MISTAKE_REVIEW_LIVE_SOURCE);
  assert.equal(room.title, "Class revision");
  assert.equal(room.state.questionDuration, 45);
  assert.equal(room.items[0].options.length, 10);
  assert.equal(room.items[0].options[room.items[0].answerIndex], vocabularyMistake.correctValue);
  assert.doesNotMatch(JSON.stringify(room), /private-source-student|Private Source Student|studentIds|studentNames/);
  auth.currentUser = { uid: "student", displayName: "Live Student" };
  assert.equal((await api.joinLiveGameByPin(pin)).gameId, gameId);
  auth.currentUser = { uid: "teacher" };
  await api.startTextbookVocabLiveGame(gameId);
  auth.currentUser = { uid: "student" };
  await api.submitTextbookVocabLiveAnswer({ gameId, selectedIndex: 9 });
  assert.equal(read(`${path}/answers/0/student`).selectedIndex, 9);
  assert.equal(read(`${path}/answers/0/student`).correct, room.items[0].answerIndex === 9);
  await assert.rejects(api.submitTextbookVocabLiveAnswer({ gameId, selectedIndex: 0 }), /already locked/);
  auth.currentUser = { uid: "teacher" };
  await api.revealTextbookVocabLiveQuestion(gameId);
  await api.startNextTextbookVocabLiveQuestion(gameId);
  auth.currentUser = { uid: "student" };
  await api.submitTextbookVocabLiveAnswer({ gameId, selectedIndex: room.items[1].answerIndex });
  auth.currentUser = { uid: "teacher" };
  await api.revealTextbookVocabLiveQuestion(gameId);
  await api.startNextTextbookVocabLiveQuestion(gameId);
  const report = buildGrammarLiveReport(read(path));
  assert.equal(read(`${path}/status`), "finished");
  assert.equal(report.questions[0].options.length, 10);
  assert.equal(report.questions[0].options[9].count, 1);
  assert.equal(report.questions[1].correct, 1);
});

test("all-errors live rooms accept all 300 mistakes while ordinary quizzes keep their 50-question limit", async () => {
  const { api, read } = await apiHarness();
  const { gameId } = await api.createAptisMockMistakeReviewLiveGame({ items: mockMistakes });
  const room = read(`liveGames/${gameId}`);
  assert.equal(room.items.length, 300);
  assert.equal(room.title, "Class mock mistake review");
  room.items.forEach((item, index) => assert.equal(item.options[item.answerIndex], mockMistakes[index].correctValue));
  await assert.rejects(api.createAptisMockMistakeReviewLiveGame({ items: [] }), /Choose questions/);
  await assert.rejects(api.createAptisMockMistakeReviewLiveGame({ items: mockMistakes.slice(0, 1) }), /at least two/);
  await assert.rejects(api.createAptisMockMistakeReviewLiveGame({ items: [...mockMistakes, mockMistakes[0]] }), /up to 300/);
  await assert.rejects(api.createAptisMockMistakeReviewLiveGame({ items: [{ ...mockMistakes[0], question: {} }] }), /incomplete/);
  await assert.rejects(api.createAptisGrammarLiveGame({ items: grammar.buildGrammarLiveItems(bank.slice(0, 51)) }), /up to 50/);
});


test("mini grammar reviews keep source learners private and score mixed formats through the existing live lifecycle", async () => {
  const { api, auth, read } = await apiHarness();
  const types = ["multiple-choice", "gap-fill", "comma-placement", "audio-response"];
  const items = types.map((type) => {
    const activity = HUB_GRAMMAR_ACTIVITIES.find((activity) => activity.items.some((question) => question.type === type));
    const question = activity.items.find((question) => question.type === type);
    return { key: `${activity.id}:${question.id}`, activityTitle: activity.title,
      number: 1, question, studentIds: ["private-student"], studentNames: ["Private Student"] };
  });
  const { gameId, pin } = await api.createHubGrammarMistakeReviewLiveGame({ items, title: "Mini grammar", questionDuration: 60 });
  const path = `liveGames/${gameId}`;
  const room = read(path);
  assert.equal(room.source, miniReview.HUB_GRAMMAR_REVIEW_LIVE_SOURCE);
  assert.equal(room.setId, miniReview.HUB_GRAMMAR_REVIEW_LIVE_SOURCE);
  assert.equal(room.interactionType, "mixed");
  assert.equal(room.items[3].audioSrc, items[3].question.audioSrc);
  assert.ok(room.items[1].acceptedAnswerGroups);
  assert.doesNotMatch(JSON.stringify(room), /private-student|Private Student|studentIds|studentNames/);
  auth.currentUser = { uid: "student" };
  await api.joinLiveGameByPin(pin);
  auth.currentUser = { uid: "teacher" };
  await api.startTextbookVocabLiveGame(gameId);
  for (let index = 0; index < room.items.length; index += 1) {
    const item = room.items[index];
    auth.currentUser = { uid: "student" };
    await api.submitTextbookVocabLiveAnswer({ gameId,
      ...(item.interactionType === "write" ? { typedAnswer: item.answer } : { selectedIndex: item.answerIndex }),
    });
    assert.equal(read(`${path}/answers/${index}/student`).correct, true);
    await assert.rejects(api.submitTextbookVocabLiveAnswer({ gameId, typedAnswer: item.answer, selectedIndex: item.answerIndex }), /locked/);
    auth.currentUser = { uid: "teacher" };
    await api.revealTextbookVocabLiveQuestion(gameId);
    if (index < room.items.length - 1) await api.startNextTextbookVocabLiveQuestion(gameId);
  }
  await api.finishTextbookVocabLiveGame(gameId);
  assert.equal(buildGrammarLiveReport(read(path)).correct, 4);
  assert.equal(buildGrammarLiveProgress(read(path)).standings[0].correctCount, 4);
  await assert.rejects(api.createHubGrammarMistakeReviewLiveGame({ items: Array(51).fill(items[0]) }), /up to 50/);
});

test("custom mini grammar bank quizzes retain punctuation-sensitive scoring, full gap alternatives and their own room identity", async () => {
  const { api, auth, read } = await apiHarness();
  const allQuestions = HUB_GRAMMAR_ACTIVITIES.flatMap((activity) => activity.items.map((question, index) => ({
    key: `${activity.id}:${question.id}`, activityId: activity.id, activityTitle: activity.title,
    number: index + 1, question, level: activity.level, studentIds: [],
  })));
  const selected = [
    allQuestions.find((item) => item.question.type === "comma-placement" && item.question.commaPositions.length),
    allQuestions.find((item) => item.question.id === "a2-1a-profile-1"),
  ];
  const { gameId, pin } = await api.createHubMiniGrammarQuizLiveGame({ items: selected, title: "Custom bank practice", questionDuration: 90 });
  const path = `liveGames/${gameId}`;
  const room = read(path);
  assert.equal(room.source, miniReview.HUB_GRAMMAR_QUIZ_LIVE_SOURCE);
  assert.equal(room.setId, miniReview.HUB_GRAMMAR_QUIZ_LIVE_SOURCE);
  assert.equal(room.state.questionDuration, 90);
  assert.deepEqual(room.items.map((item) => item.id), selected.map((item) => item.key));
  assert.doesNotMatch(JSON.stringify(room), /studentIds|studentNames/);
  auth.currentUser = { uid: "student", displayName: "Student" };
  await api.joinLiveGameByPin(pin);
  auth.currentUser = { uid: "teacher" };
  await api.startTextbookVocabLiveGame(gameId);
  auth.currentUser = { uid: "student" };
  await api.submitTextbookVocabLiveAnswer({ gameId, typedAnswer: room.items[0].answer.replaceAll(",", "") });
  assert.equal(read(`${path}/answers/0/student`).correct, false);
  auth.currentUser = { uid: "teacher" };
  await api.revealTextbookVocabLiveQuestion(gameId);
  await api.startNextTextbookVocabLiveQuestion(gameId);
  auth.currentUser = { uid: "student" };
  await api.submitTextbookVocabLiveAnswer({ gameId, typedAnswer: room.items[1].acceptedAnswerGroups.map((group) => group.at(-1)).join(" / ") });
  assert.equal(read(`${path}/answers/1/student`).correct, true);
  auth.currentUser = { uid: "teacher" };
  await api.revealTextbookVocabLiveQuestion(gameId);
  await api.finishTextbookVocabLiveGame(gameId);
  assert.equal(buildGrammarLiveReport(read(path)).correct, 1);
  assert.equal(buildGrammarLiveReport(read(path)).incorrect, 1);
  await assert.rejects(api.createHubMiniGrammarQuizLiveGame({ items: Array(51).fill(selected[0]) }), /up to 50/);
});
