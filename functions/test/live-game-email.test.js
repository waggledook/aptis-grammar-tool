/* eslint-disable no-undef */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {ACTIVITY_TYPES, buildLiveGameEmail, getActivityMetadata, getParticipation} = require("../live-game-email");

const createdAt = Date.parse("2026-10-26T15:00:00Z");
const game = {type: "grammar", ownerUid: "teacher-1", pin: "123456", setId: "past-tenses", createdAt, status: "lobby"};
const host = {displayName: "Sample Teacher", email: "teacher@example.com"};
const set = {title: "Past tenses practice", level: "B1", topic: "Past simple and continuous", itemIds: ["q1", "q2"]};

test("launch identifies the teacher, content and session in both email formats", () => {
  const email = buildLiveGameEmail({kind: "launched", gameId: "session-1", game, host, set});
  assert.equal(email.subject, "Live activity launched · Past tenses practice · Sample Teacher");
  for (const value of ["Sample Teacher", "teacher@example.com", "Past simple and continuous", "B1", "123456", "session-1", "26 Oct 2026", "16:00", "Madrid", "Lobby created"]) {
    assert.ok(email.text.includes(value), value);
    assert.ok(email.html.includes(value), value);
  }
  assert.match(email.text, /https:\/\/aptis-trainer\.beeskillsenglish\.com\/live\/host\/session-1/);
  assert.equal(email.replyTo, "teacher@example.com");
  assert.doesNotMatch(email.text, /Participants:|Submitted \/ completed:|No submission/);
});

test("all known activity links use a registered host route", () => {
  const app = fs.readFileSync(path.join(__dirname, "../../src/App.jsx"), "utf8");
  for (const [type, [label, , route]] of Object.entries(ACTIVITY_TYPES)) {
    assert.ok(app.includes(`path="${route}:gameId"`), `${type} has no host route`);
    const email = buildLiveGameEmail({kind: "launched", gameId: "abc", game: {...game, type}, host});
    assert.ok(email.text.includes(label), type);
    assert.ok(email.text.includes(`${route}abc`), type);
  }
});

test("every activity creation type in the API has an email definition", () => {
  const root = path.join(__dirname, "../../src");
  const api = fs.readFileSync(path.join(root, "api/liveGames.js"), "utf8");
  const definitionFiles = [
    "components/writing/data/aptisWritingTeacherTasks.js", "components/writing/data/aptisWritingRegisterSurgery.js",
    "components/writing/data/aptisPart4ErrorBank.js", "reading/readingPart1TeacherTasks.js", "reading/part2Tasks.js",
    "reading/readingPart3TeacherTasks.js", "reading/readingPart4TaskBanks.js",
    "components/listening/teacherListeningPart2Data.js", "components/listening/teacherListeningPart3Data.js",
    "components/listening/teacherListeningPart4Data.js", "products/ote/data/oteAdvancedReadingPart4OptionJury.js",
    "products/ote/data/oteAdvancedReadingCohesionChallenge.js", "products/ote/data/oteAdvancedReadingPart3FreeThingsLesson.js",
    "products/ote/data/oteAdvancedReadingPart2TeacherTasks.js", "products/ote/data/oteListeningLive.js",
    "components/vocabulary/collocations/collocationTeamLive.js", "components/hub/textbookVocabLive.js",
  ];
  const definitions = definitionFiles.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");
  for (const [, constant, type] of definitions.matchAll(/export const ([A-Z0-9_]*GAME_TYPE) = "([^"]+)"/g)) {
    if (api.includes(`type: ${constant}`)) assert.ok(Object.hasOwn(ACTIVITY_TYPES, type), `Missing ${type}`);
  }
});

test("stored site overrides inference, and unfamiliar activity types do not invent links", () => {
  const email = buildLiveGameEmail({kind: "launched", gameId: "s", game: {...game, site: "seifhub"}, host, set});
  assert.match(email.text, /https:\/\/seifhub\.beeskillsenglish\.com\/live\/host\/s/);
  assert.doesNotMatch(email.text, /inferred/);
  const unknown = buildLiveGameEmail({kind: "launched", gameId: "s", game: {...game, type: "new-activity", site: "https://untrusted.test"}, host});
  assert.doesNotMatch(unknown.html, /href=|untrusted\.test/);
  assert.match(unknown.text, /Site not recorded/);
});

test("user-supplied text is escaped and subject headers stay on one line", () => {
  const email = buildLiveGameEmail({kind: "finished", gameId: "a&b", game: {
    ...game, title: '<img src=x onerror="alert(1)">\r\nBcc: attacker@example.com',
    players: {a: {name: "<script>alert(1)</script>"}},
  }, host: {displayName: "Teacher\r\nInjected", email: "teacher@example.com"}, finishedAt: createdAt});
  assert.doesNotMatch(email.subject, /[\r\n]/);
  assert.doesNotMatch(email.html, /<img|<script>/);
  assert.match(email.html, /&lt;img/);
  assert.match(email.html, /&lt;script&gt;/);
  assert.match(email.html, /host\/a%26b/);
});

test("quiz report uses actual answer scores and counts partial matching credit", () => {
  const quiz = {...game, type: "textbook-vocabulary-live", items: [
    {sentence: "Match the colours", level: "A1", sourceThemeTitle: "Colours"},
    {sentence: "Name this object", level: "A2", sourceThemeTitle: "Things"},
  ], players: {a: {name: "Ana", score: 99999}, b: {name: "Ben", score: 0}, c: {name: "Cara"}}, answers: {
    0: {a: {correct: false, correctCount: 3, totalCount: 4, scoreDelta: 500}, b: {correct: true, correctCount: 4, totalCount: 4, scoreDelta: 700}},
    1: {a: {correct: false, scoreDelta: 0}},
  }};
  const email = buildLiveGameEmail({kind: "finished", gameId: "s", game: quiz, host, createdAt, startedAt: createdAt + 60000, finishedAt: createdAt + 186000});
  assert.match(email.text, /Participants: 3/);
  assert.match(email.text, /Submitted \/ completed: 1\/3/);
  assert.match(email.text, /Ana — 2\/2 rounds answered — 3\/5 correct \(60%\) · 500 points/);
  assert.match(email.text, /Ben — 1\/2 rounds answered — 4\/4 correct \(100%\) · 700 points/);
  assert.match(email.text, /Cara — 0\/2 rounds answered — No graded answers/);
  assert.match(email.text, /Duration: 2m 6s/);
  assert.match(email.text, /Name this object — 1\/1 incorrect/);
  assert.doesNotMatch(email.text, /99999/);
});

test("Spanglish reports both phases without double-counting rounds", () => {
  const result = getParticipation({...game, type: "spanglish_fixit", items: [{text: "An error"}], players: {a: {name: "Ana"}}, rounds: {
    0: {clickAnswers: {a: {correct: true, scoreDelta: 200}}, correctionAnswers: {a: {correct: false, scoreDelta: 0}}},
  }}, {questionCount: 1});
  assert.equal(result.rows[0].completed, true);
  assert.match(result.rows[0].result, /1\/2 correct \(50%\) · 200 points/);
  assert.match(result.missed[0].label, /correction/);
});

test("writing reports distinguish a lobby participant from a submitted response", () => {
  const email = buildLiveGameEmail({kind: "finished", gameId: "s", host, game: {
    ...game, type: "aptis-writing-teacher", part: 4, taskId: "cycling-club", players: {
      a: {name: "Ana", writingSubmission: {submittedAt: createdAt + 1000, answers: {formal: "Private student writing"}}},
      b: {name: "Ben", score: 0},
    },
  }, finishedAt: createdAt + 60000});
  assert.match(email.text, /Exam part: Part 4/);
  assert.match(email.text, /Submitted \/ completed: 1\/2/);
  assert.match(email.text, /Ana — Writing submitted — Ready for review/);
  assert.match(email.text, /Ben — No writing submission/);
  assert.doesNotMatch(email.text, /Private student writing|0 points|Duration:/);
});

test("reading task completion respects partial work and multi-task sessions", () => {
  const readingGame = {...game, type: "aptis-reading-part2-teacher", taskIds: ["one", "two"], players: {
    a: {name: "Ana", readingPart2Submissions: {one: {complete: true}, two: {complete: false}}},
    b: {name: "Ben", readingPart2Submissions: {one: {complete: true}, two: {complete: true}}},
  }};
  const participation = getParticipation(readingGame, getActivityMetadata(readingGame));
  assert.equal(participation.rows[0].completed, false);
  assert.equal(participation.rows[1].completed, true);
  assert.equal(participation.rows[1].participation, "2/2 tasks completed");
  for (const complete of [true, false]) {
    const result = getParticipation({...game, type: "aptis-reading-part3-live", players: {a: {readingPart3Submission: {complete, answers: {q1: "A"}}}}}, {});
    assert.equal(result.rows[0].completed, complete);
  }
});

test("team reports label shared results and do not fabricate individual scores", () => {
  const teamGame = {...game, type: "collocation-team", items: [{}, {}], players: {a: {name: "Ana", teamId: "red"}},
    teams: {red: {name: "Red team"}}, teamAnswers: {red: {0: {score: 3, possibleScore: 4}}}};
  const result = getParticipation(teamGame, getActivityMetadata(teamGame));
  assert.equal(result.rows[0].completed, false);
  assert.equal(result.rows[0].result, "Team first pass: 3/4 collocations correct");
  assert.match(result.rows[0].participation, /Red team/);
});

test("ungraded activities report responses without inventing completion or scores", () => {
  const email = buildLiveGameEmail({kind: "finished", gameId: "s", game: {
    ...game, type: "ote-advanced-reading-part4-option-jury", players: {a: {name: "Ana"}},
    investigations: {a: {q1: {submittedAt: createdAt}}}, finalVotes: {q1: {a: {submittedAt: createdAt}}},
  }, host, finishedAt: createdAt});
  assert.match(email.text, /Ana — 2 responses recorded — See activity for review/);
  assert.doesNotMatch(email.text, /Submitted \/ completed:|0 points|No submission/);
});

test("empty sessions report zero participants without a false duration", () => {
  const email = buildLiveGameEmail({kind: "finished", gameId: "s", game, host, finishedAt: createdAt});
  assert.match(email.text, /Participants: 0/);
  assert.match(email.text, /Started: Not recorded/);
  assert.doesNotMatch(email.text, /Duration:|Participants and responses:/);
});
