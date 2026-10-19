import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { beforeEach, test } from "node:test";
import { build } from "esbuild";
import {
  buildCollocationTeamReviews,
  collocationTeamTotalPoints,
  createCollocationRoundState,
  evaluateCollocationSelection,
  evaluateCollocationTeamAnswer,
  getCollocationLiveRound,
  getCollocationTeamReviewItem,
  getCollocationDraftAnswers,
} from "../src/components/vocabulary/collocations/collocationTeamLive.js";
import { ACTIVITY_TYPE_LABELS, formatActivityDetails } from "../src/utils/adminActivity.js";
import bank from "../src/components/vocabulary/collocations/data/collocationPrecisionItems.js";
import {
  createCollocationLiveItems,
  filterCollocationLiveItems,
  readCollocationLiveFilters,
  selectCollocationLiveItems,
} from "../src/components/vocabulary/collocations/collocationLiveSetup.js";

const item = {
  itemId: "occupational",
  options: ["hazard", "health", "risk", "therapy", "job", "work", "professional"]
    .map((word, index) => ({ word, isCorrect: index < 4 })),
};
const rules = JSON.parse(await readFile(new URL("../database.rules.json", import.meta.url), "utf8"));
const backend = {
  auth: { currentUser: { uid: "host" } },
  data: {},
  serverOffset: 0,
  offsetError: null,
  events: [],
  snapshot(path) {
    const value = path === ".info/serverTimeOffset"
      ? this.serverOffset
      : path.split("/").filter(Boolean).reduce((entry, key) => entry?.[key], this.data);
    return {
      val: () => value ?? null,
      exists: () => value != null,
      child: (key) => this.snapshot(`${path}/${key}`),
    };
  },
  set(path, value) {
    const keys = path.split("/").filter(Boolean);
    const key = keys.pop();
    const parent = keys.reduce((entry, part) => (entry[part] ??= {}), this.data);
    parent[key] = structuredClone(value);
  },
};
globalThis.__collocationTestBackend = backend;

// Exercise the production API against an isolated in-memory database, with no live Firebase calls.
const bundled = await build({
  stdin: {
    contents: "export { createCollocationTeamLiveGame, joinLiveGameByPin, startCollocationTeamLiveGame, startNextCollocationTeamRound, startCollocationTeamReview, revealCollocationTeamRound, finishCollocationTeamLiveGame, saveCollocationTeamDraft, submitCollocationTeamAnswer } from './src/api/liveGames.js'; export { trackCollocationLiveParticipation } from './src/utils/collocationLiveActivity.js';",
    resolveDir: new URL("..", import.meta.url).pathname,
  },
  bundle: true,
  write: false,
  format: "esm",
  platform: "node",
  plugins: [{
    name: "isolated-firebase",
    setup(builder) {
      builder.onResolve({ filter: /^firebase\/database$/ }, () => ({ path: "database", namespace: "test" }));
      builder.onResolve({ filter: /(?:^|\/)firebase(?:\.js)?$/ }, () => ({ path: "firebase", namespace: "test" }));
      builder.onLoad({ filter: /.*/, namespace: "test" }, ({ path }) => ({ contents: path === "firebase"
        ? `export const auth = globalThis.__collocationTestBackend.auth;
           export const rtdb = {};
           export const logActivity = async (type, details) => {
             globalThis.__collocationTestBackend.events.push({ type, details, uid: globalThis.__collocationTestBackend.auth.currentUser?.uid });
           };
           export const logAptisListeningLiveHosted = () => {};
           export const logAptisListeningLiveJoined = () => {};
           export const logAptisReadingLiveHosted = () => {};
           export const logAptisReadingLiveJoined = () => {};
           export const logAptisReadingLiveTaskCompleted = () => {};
           export const logOteReadingLiveHosted = () => {};
           export const logAptisWritingLiveHosted = () => {};
           export const logAptisWritingLiveJoined = () => {};`
        : `const backend = globalThis.__collocationTestBackend;
           export const ref = (_, path) => path;
           export const get = async (path) => {
             if (path.startsWith('.info/')) throw new Error('Invalid token in path');
             return backend.snapshot(path);
           };
           export const onValue = (path, callback, onError, options) => {
             if (path !== '.info/serverTimeOffset' || !options?.onlyOnce) {
               throw new Error('Expected a one-time local server clock listener');
             }
             if (backend.offsetError) onError(backend.offsetError);
             else callback(backend.snapshot(path));
             return () => {};
           };
           export const set = async (path, value) => backend.set(path.path || path, value);
           export const serverTimestamp = () => Date.now() + backend.serverOffset;
           export const update = async (path, updates) => {
             for (const [key, value] of Object.entries(updates)) backend.set(path + '/' + key, value);
           };
           export const runTransaction = async (path, updater) => {
             const next = updater(structuredClone(backend.snapshot(path).val()));
             if (next === undefined) return { committed: false };
             backend.set(path, next);
             return { committed: true };
           };
           export const push = () => ({ key: 'created', path: 'liveGames/created' });
           export const query = (path) => path;
           export const orderByChild = () => {};
           export const equalTo = () => {};`,
      }));
    },
  }],
});
const api = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString("base64")}`);

function fixture() {
  return {
    ownerUid: "host",
    pin: "123456",
    title: "Live collocations",
    type: "collocation-team",
    status: "lobby",
    items: [item, { ...item, itemId: "heavy" }],
    players: { captain: { teamId: "team-1" }, teammate: { teamId: "team-1" } },
    teams: { "team-1": { memberUids: ["captain", "teammate"] } },
    state: { phase: "lobby", teamsLocked: true },
  };
}

function currentGame() { return backend.data.liveGames.game; }

beforeEach(() => {
  backend.auth.currentUser = { uid: "host" };
  backend.data = { liveGames: { game: fixture() } };
  backend.serverOffset = 0;
  backend.offsetError = null;
  backend.events = [];
});

test("partial credit awards 75 for 3/4 and 50 for 2/4 without duplicate credit", () => {
  assert.equal(evaluateCollocationSelection(item, ["hazard", "health", "risk", "job"]).points, 75);
  assert.equal(evaluateCollocationSelection(item, ["hazard", "health", "job", "work"]).points, 50);
  assert.equal(evaluateCollocationSelection(item, ["hazard", "hazard"]).points, 25);
  assert.equal(evaluateCollocationSelection(item, []).points, 0);
});

test("starting a game opens the first shared 45-second set with the captain permissions", async () => {
  const start = Date.now();
  await api.startCollocationTeamLiveGame("game");
  assert.equal(currentGame().state.phase, "question");
  assert.equal(currentGame().state.questionIndex, 0);
  assert.equal(currentGame().state.captainUids["team-1"], "captain");
  assert.ok(currentGame().state.questionDeadline >= start + 45_000);
  assert.ok(currentGame().state.questionDeadline <= Date.now() + 45_000);
});

test("round timing reads local Firebase metadata and accounts for a clock ahead or behind", async () => {
  for (const offset of [120_000, -120_000]) {
    backend.data = { liveGames: { game: fixture() } };
    backend.serverOffset = offset;
    const start = Date.now();
    await api.startCollocationTeamLiveGame("game");
    assert.ok(currentGame().state.questionDeadline >= start + offset + 45_000);
    assert.ok(currentGame().state.questionDeadline <= Date.now() + offset + 45_000);
  }
});

test("submissions use the Firebase clock for timestamps and deadline checks", async () => {
  backend.serverOffset = 120_000;
  await api.startCollocationTeamLiveGame("game");
  backend.auth.currentUser = { uid: "captain" };
  const submission = { gameId: "game", itemIndex: 0, selectedWords: ["hazard", "health", "risk", "job"] };
  currentGame().state.questionDeadline = Date.now() + backend.serverOffset - 1000;
  await assert.rejects(api.submitCollocationTeamAnswer(submission), /Time is up/);
  currentGame().state.questionDeadline = Date.now() + backend.serverOffset + 45_000;
  const start = Date.now();
  await api.submitCollocationTeamAnswer(submission);
  const submittedAt = currentGame().teamAnswers["team-1"][0].submittedAt;
  assert.ok(submittedAt >= start + backend.serverOffset);
  assert.ok(submittedAt <= Date.now() + backend.serverOffset);
});

test("clock listener errors reject the action without changing the game", async () => {
  backend.offsetError = new Error("Clock unavailable");
  await assert.rejects(api.startCollocationTeamLiveGame("game"), /Clock unavailable/);
  assert.equal(currentGame().status, "lobby");
  assert.equal(currentGame().state.phase, "lobby");
});

test("submission locks the current answer and waits on the same set until the host advances", async () => {
  await api.startCollocationTeamLiveGame("game");
  backend.auth.currentUser = { uid: "captain" };
  const submission = { gameId: "game", itemIndex: 0, selectedWords: ["hazard", "health", "risk", "job"] };
  await api.submitCollocationTeamAnswer(submission);
  assert.equal(currentGame().teamAnswers["team-1"][0].points, 75);
  assert.equal(getCollocationLiveRound(currentGame()).itemIndex, 0);
  await assert.rejects(api.submitCollocationTeamAnswer(submission), /already locked/);
});

test("captain check, current-set check, and deadline reject invalid submissions", async () => {
  await api.startCollocationTeamLiveGame("game");
  const submission = { gameId: "game", itemIndex: 0, selectedWords: ["hazard", "health", "risk", "job"] };
  backend.auth.currentUser = { uid: "teammate" };
  await assert.rejects(api.submitCollocationTeamAnswer(submission), /captain/);
  backend.auth.currentUser = { uid: "captain" };
  await assert.rejects(api.submitCollocationTeamAnswer({ ...submission, itemIndex: 1 }), /another set/);
  currentGame().state.questionDeadline = Date.now() - 1;
  await assert.rejects(api.submitCollocationTeamAnswer(submission), /Time is up/);
});

test("reveal ends submissions, next set restarts the clock, and a stale reveal cannot close it", async () => {
  await api.startCollocationTeamLiveGame("game");
  const firstDeadline = currentGame().state.questionDeadline;
  await api.revealCollocationTeamRound("game", false, firstDeadline);
  assert.equal(currentGame().state.phase, "reveal");
  assert.equal(currentGame().state.questionDeadline, null);
  await api.startNextCollocationTeamRound({ gameId: "game", index: 1 });
  assert.equal(currentGame().state.phase, "question");
  assert.equal(currentGame().state.questionIndex, 1);
  await api.revealCollocationTeamRound("game", false, firstDeadline, 0);
  assert.equal(currentGame().state.phase, "question");
});

test("scores remain hidden during a question and appear on reveal", () => {
  const game = currentGame();
  game.state.phase = "question";
  game.state.questionIndex = 1;
  game.teamAnswers = { "team-1": {
    0: { selectedWords: ["hazard", "health", "job", "work"] },
    1: { selectedWords: ["hazard", "health", "risk", "job"] },
  } };
  assert.equal(collocationTeamTotalPoints(game, "team-1"), 50);
  game.state.phase = "reveal";
  assert.equal(collocationTeamTotalPoints(game, "team-1"), 125);
});

test("review includes timeouts and starts the selected original card with a new timer", async () => {
  const game = currentGame();
  game.status = "in-progress";
  game.state.phase = "reveal";
  game.state.questionIndex = 1;
  game.teamAnswers = {
    "team-1": { 0: { selectedWords: ["hazard", "health", "risk", "therapy"] } },
  };
  assert.deepEqual(buildCollocationTeamReviews(game).reviewItemIndexesByTeam["team-1"], [1]);
  await api.startCollocationTeamReview("game");
  assert.equal(currentGame().state.phase, "review-question");
  assert.equal(getCollocationLiveRound(currentGame(), "team-1").itemIndex, 1);
  assert.equal(currentGame().state.questionDuration, 45);
});

test("every new round gets a new deadline even after a previous timeout", () => {
  const game = currentGame();
  const old = createCollocationRoundState(game, 0, false, 1000);
  const next = createCollocationRoundState(game, 1, false, old.questionDeadline + 5000);
  assert.equal(next.questionDeadline - old.questionDeadline, 50_000);
});

function allowedByAnswerRule(rootName, uid, key, now, teamId = "team-1") {
  const expression = rules.rules.liveGames.$gameId[rootName].$teamId.$itemIndex[".write"];
  const newAnswer = { submittedBy: uid };
  const newData = { child: (name) => ({ val: () => newAnswer[name] }) };
  const rootSnapshot = { child: (key) => {
    const snap = backend.snapshot(key);
    return snap;
  } };
  return Function("root", "auth", "$gameId", "$teamId", "$itemIndex", "data", "newData", "now", `return (${expression});`)(
    rootSnapshot, { uid }, "game", teamId, String(key), { exists: () => false }, newData, now
  );
}

test("database policy accepts only the current captain's current main answer before timeout", async () => {
  await api.startCollocationTeamLiveGame("game");
  assert.equal(allowedByAnswerRule("teamAnswers", "captain", 0, Date.now()), true);
  assert.equal(allowedByAnswerRule("teamAnswers", "teammate", 0, Date.now()), false);
  assert.equal(allowedByAnswerRule("teamAnswers", "captain", 1, Date.now()), false);
  assert.equal(allowedByAnswerRule("teamAnswers", "captain", 0, currentGame().state.questionDeadline), false);
});

test("database policy addresses the original item index during review and stops on reveal", async () => {
  currentGame().status = "in-progress";
  currentGame().state = { phase: "reveal", questionIndex: 1 };
  currentGame().teamAnswers = { "team-1": { 0: { selectedWords: ["hazard", "health", "risk", "therapy"] } } };
  await api.startCollocationTeamReview("game");
  assert.equal(allowedByAnswerRule("reviewAnswers", "captain", 1, Date.now()), true);
  assert.equal(allowedByAnswerRule("reviewAnswers", "captain", 0, Date.now()), false);
  await api.revealCollocationTeamRound("game", true, currentGame().state.questionDeadline);
  assert.equal(allowedByAnswerRule("reviewAnswers", "captain", 1, Date.now()), false);
});

test("personalised review removes only the previously correct words and keeps the distractors", () => {
  const game = currentGame();
  game.teamAnswers = { "team-1": { 0: { selectedWords: ["hazard", "health", "risk", "job"] } } };
  const task = getCollocationTeamReviewItem(game, "team-1", 0);
  assert.deepEqual(task.options.map((option) => option.word), ["therapy", "job", "work", "professional"]);
  assert.equal(task.previouslyFound, 3);
  assert.equal(task.originalTargetCount, 4);
  assert.equal(task.options.filter((option) => option.isCorrect).length, 1);
});

test("3/5 first time becomes a two-target review worth the remaining 40 points", () => {
  const game = currentGame();
  game.items = [{ options: ["a", "b", "c", "d", "e", "x", "y", "z"]
    .map((word, index) => ({ word, isCorrect: index < 5 })) }];
  game.teamAnswers = { "team-1": { 0: { selectedWords: ["a", "b", "c", "x", "y"] } } };
  game.state = { ...buildCollocationTeamReviews(game), phase: "review-question", reviewIndex: 0 };
  const task = getCollocationLiveRound(game, "team-1");
  assert.equal(task.item.options.filter((option) => option.isCorrect).length, 2);
  assert.deepEqual(task.item.options.map((option) => option.word), ["d", "e", "x", "y", "z"]);
  const partial = evaluateCollocationTeamAnswer(game, "team-1", 0, ["d", "x"], true);
  assert.equal(partial.percentage, 50);
  assert.equal(partial.points, 20);
  const recovered = evaluateCollocationTeamAnswer(game, "team-1", 0, ["d", "e"], true);
  assert.equal(recovered.points, 40);
  game.reviewAnswers = { "team-1": { 0: recovered } };
  assert.equal(collocationTeamTotalPoints(game, "team-1"), 60);
  game.state.phase = "review-reveal";
  assert.equal(collocationTeamTotalPoints(game, "team-1"), 100);
});

test("different teams get different missed cards during the same teacher-controlled round", async () => {
  const game = currentGame();
  game.status = "in-progress";
  game.state = { phase: "reveal", questionIndex: 1 };
  game.teams["team-2"] = { memberUids: ["second"] };
  game.players.second = { teamId: "team-2" };
  const perfect = { selectedWords: ["hazard", "health", "risk", "therapy"] };
  const partial = { selectedWords: ["hazard", "health", "risk", "job"] };
  game.teamAnswers = {
    "team-1": { 0: perfect, 1: partial },
    "team-2": { 0: partial, 1: perfect },
  };
  await api.startCollocationTeamReview("game");
  assert.equal(currentGame().state.reviewRoundCount, 1);
  assert.equal(getCollocationLiveRound(currentGame(), "team-1").itemIndex, 1);
  assert.equal(getCollocationLiveRound(currentGame(), "team-2").itemIndex, 0);
  assert.deepEqual(currentGame().state.reviewItemKeysByTeam, { "team-1": "1", "team-2": "0" });
  assert.equal(allowedByAnswerRule("reviewAnswers", "second", 0, Date.now(), "team-2"), true);
  assert.equal(allowedByAnswerRule("reviewAnswers", "second", 1, Date.now(), "team-2"), false);
  backend.auth.currentUser = { uid: "captain" };
  await assert.rejects(api.submitCollocationTeamAnswer({ gameId: "game", itemIndex: 1, selectedWords: ["hazard"], review: true }), /available options/);
  await api.submitCollocationTeamAnswer({ gameId: "game", itemIndex: 1, selectedWords: ["therapy"], review: true });
  assert.equal(currentGame().reviewAnswers["team-1"][1].points, 25);
});

test("perfect teams skip review, and shorter queues stop without blocking later rounds", async () => {
  const game = currentGame();
  game.status = "in-progress";
  game.state = { phase: "reveal", questionIndex: 1 };
  game.teams["team-2"] = { memberUids: ["second"] };
  game.teams["team-3"] = { memberUids: ["perfect"] };
  game.players.second = { teamId: "team-2" };
  const perfect = { selectedWords: ["hazard", "health", "risk", "therapy"] };
  game.teamAnswers = {
    "team-1": { 0: perfect },
    "team-3": { 0: perfect, 1: perfect },
  };
  await api.startCollocationTeamReview("game");
  assert.equal(getCollocationLiveRound(currentGame(), "team-3").hasTask, false);
  assert.equal(currentGame().state.captainUids["team-3"], undefined);
  await api.revealCollocationTeamRound("game", true, currentGame().state.questionDeadline, 0);
  await api.startNextCollocationTeamRound({ gameId: "game", index: 1, review: true });
  assert.equal(getCollocationLiveRound(currentGame(), "team-1").hasTask, false);
  assert.equal(getCollocationLiveRound(currentGame(), "team-2").itemIndex, 1);
  assert.equal(currentGame().state.captainUids["team-1"], undefined);
  assert.equal(allowedByAnswerRule("reviewAnswers", "captain", 1, Date.now()), false);
});

test("every missed card is reviewed even when a team missed more than five", () => {
  const game = currentGame();
  game.items = Array.from({ length: 8 }, () => item);
  const plan = buildCollocationTeamReviews(game);
  assert.deepEqual(plan.reviewItemIndexesByTeam["team-1"], [0, 1, 2, 3, 4, 5, 6, 7]);
  assert.equal(plan.reviewRoundCount, 8);
});

test("timeout submits a captain's partial draft for credit before revealing", async () => {
  await api.startCollocationTeamLiveGame("game");
  backend.auth.currentUser = { uid: "captain" };
  await api.saveCollocationTeamDraft({ gameId: "game", teamId: "team-1", itemIndex: 0, selectedWords: ["hazard", "health"], questionDeadline: currentGame().state.questionDeadline });
  assert.equal(currentGame().teamAnswers, undefined);
  backend.auth.currentUser = { uid: "host" };
  backend.serverOffset = 60_000;
  await api.revealCollocationTeamRound("game", false, currentGame().state.questionDeadline, 0);
  const answer = currentGame().teamAnswers["team-1"][0];
  assert.deepEqual(answer.selectedWords, ["hazard", "health"]);
  assert.equal(answer.points, 50);
  assert.equal(answer.possibleScore, 4);
  assert.equal(answer.submissionMode, "timeout");
  assert.equal(answer.submittedBy, "captain");
  assert.equal(currentGame().state.phase, "reveal");
});

test("new choices replace old draft choices, including clearing the entire selection", async () => {
  await api.startCollocationTeamLiveGame("game");
  backend.auth.currentUser = { uid: "captain" };
  const draft = { gameId: "game", teamId: "team-1", itemIndex: 0, questionDeadline: currentGame().state.questionDeadline };
  await api.saveCollocationTeamDraft({ ...draft, selectedWords: ["hazard", "health"] });
  await api.saveCollocationTeamDraft({ ...draft, selectedWords: [] });
  // Realtime Database removes empty arrays from stored data.
  delete currentGame().teamDrafts["team-1"][0].selectedWords;
  backend.auth.currentUser = { uid: "host" };
  backend.serverOffset = 60_000;
  await api.revealCollocationTeamRound("game");
  assert.equal(currentGame().teamAnswers, undefined);
  assert.equal(currentGame().state.phase, "reveal");
});

test("automatic scoring never overwrites a manually locked answer", async () => {
  await api.startCollocationTeamLiveGame("game");
  backend.auth.currentUser = { uid: "captain" };
  await api.saveCollocationTeamDraft({ gameId: "game", teamId: "team-1", itemIndex: 0, selectedWords: ["hazard"], questionDeadline: currentGame().state.questionDeadline });
  await api.submitCollocationTeamAnswer({ gameId: "game", itemIndex: 0, selectedWords: ["hazard", "health", "risk", "therapy"] });
  backend.auth.currentUser = { uid: "host" };
  backend.serverOffset = 60_000;
  await api.revealCollocationTeamRound("game");
  assert.equal(currentGame().teamAnswers["team-1"][0].points, 100);
  assert.equal(currentGame().teamAnswers["team-1"][0].submissionMode, undefined);
});

test("old, invalid, non-captain, and oversized drafts cannot gain timeout points", async () => {
  await api.startCollocationTeamLiveGame("game");
  const valid = { selectedWords: ["hazard"], submittedBy: "captain", questionDeadline: currentGame().state.questionDeadline };
  for (const draft of [
    { ...valid, questionDeadline: valid.questionDeadline - 1 },
    { ...valid, submittedBy: "teammate" },
    { ...valid, selectedWords: ["not-an-option"] },
    { ...valid, selectedWords: ["hazard", "health", "risk", "therapy", "job"] },
  ]) {
    currentGame().teamDrafts = { "team-1": { 0: draft } };
    assert.deepEqual(getCollocationDraftAnswers(currentGame(), Date.now() + 60_000), []);
  }
});

test("a teacher's early reveal also preserves current choices", async () => {
  await api.startCollocationTeamLiveGame("game");
  backend.auth.currentUser = { uid: "captain" };
  await api.saveCollocationTeamDraft({ gameId: "game", teamId: "team-1", itemIndex: 0, selectedWords: ["hazard", "job"], questionDeadline: currentGame().state.questionDeadline });
  backend.auth.currentUser = { uid: "host" };
  await api.revealCollocationTeamRound("game");
  assert.equal(currentGame().teamAnswers["team-1"][0].points, 25);
  assert.equal(currentGame().teamAnswers["team-1"][0].submissionMode, "teacher_reveal");
});

test("personalised review timeout recovers points only for newly found collocations", async () => {
  const game = currentGame();
  game.status = "in-progress";
  game.state = { phase: "reveal", questionIndex: 1 };
  game.teamAnswers = { "team-1": {
    0: { selectedWords: ["hazard", "health", "risk", "therapy"] },
    1: { selectedWords: ["hazard", "health", "job", "work"] },
  } };
  await api.startCollocationTeamReview("game");
  backend.auth.currentUser = { uid: "captain" };
  await api.saveCollocationTeamDraft({ gameId: "game", teamId: "team-1", itemIndex: 1, selectedWords: ["risk"], review: true, questionDeadline: game.state.questionDeadline });
  backend.auth.currentUser = { uid: "host" };
  backend.serverOffset = 60_000;
  await api.revealCollocationTeamRound("game", true, game.state.questionDeadline, 0);
  const answer = currentGame().reviewAnswers["team-1"][1];
  assert.equal(answer.score, 1);
  assert.equal(answer.possibleScore, 2);
  assert.equal(answer.points, 25);
  assert.equal(answer.submissionMode, "timeout");
  assert.equal(collocationTeamTotalPoints(currentGame(), "team-1"), 175);
});

test("a stale automatic reveal cannot submit drafts into a different round", async () => {
  await api.startCollocationTeamLiveGame("game");
  const deadline = currentGame().state.questionDeadline;
  currentGame().teamDrafts = { "team-1": { 0: { selectedWords: ["hazard"], submittedBy: "captain", questionDeadline: deadline } } };
  await api.revealCollocationTeamRound("game", false, deadline - 1, 0);
  assert.equal(currentGame().teamAnswers, undefined);
  assert.equal(currentGame().state.phase, "question");
});

test("draft permissions allow only the current captain, team and item before timeout and lock", async () => {
  await api.startCollocationTeamLiveGame("game");
  assert.equal(allowedByAnswerRule("teamDrafts", "captain", 0, Date.now()), true);
  assert.equal(allowedByAnswerRule("teamDrafts", "teammate", 0, Date.now()), false);
  assert.equal(allowedByAnswerRule("teamDrafts", "captain", 1, Date.now()), false);
  assert.equal(allowedByAnswerRule("teamDrafts", "captain", 0, Date.now(), "team-2"), false);
  assert.equal(allowedByAnswerRule("teamDrafts", "captain", 0, currentGame().state.questionDeadline), false);
  currentGame().teamAnswers = { "team-1": { 0: { submittedBy: "captain" } } };
  assert.equal(allowedByAnswerRule("teamDrafts", "captain", 0, Date.now()), false);
});

test("review draft permissions use each team's original item and close on reveal", async () => {
  currentGame().status = "in-progress";
  currentGame().state = { phase: "reveal", questionIndex: 1 };
  currentGame().teamAnswers = { "team-1": { 0: { selectedWords: ["hazard", "health", "risk", "therapy"] } } };
  await api.startCollocationTeamReview("game");
  assert.equal(allowedByAnswerRule("reviewDrafts", "captain", 1, Date.now()), true);
  assert.equal(allowedByAnswerRule("reviewDrafts", "captain", 0, Date.now()), false);
  assert.equal(allowedByAnswerRule("reviewDrafts", "teammate", 1, Date.now()), false);
  assert.equal(allowedByAnswerRule("reviewDrafts", "captain", 1, currentGame().state.questionDeadline), false);
  await api.revealCollocationTeamRound("game", true);
  assert.equal(allowedByAnswerRule("reviewDrafts", "captain", 1, Date.now()), false);
});

test("hosting and joining log activity once without logging a lobby rejoin again", async () => {
  await api.createCollocationTeamLiveGame({ items: [item, item], title: "Class session" });
  assert.equal(backend.events[0].type, "collocation_live_hosted");
  assert.equal(backend.events[0].details.setCount, 2);
  delete backend.data.liveGames.created;
  backend.auth.currentUser = { uid: "new-student", displayName: "Student" };
  await api.joinLiveGameByPin("123456");
  await api.joinLiveGameByPin("123456");
  assert.equal(backend.events.filter((event) => event.type === "collocation_live_joined").length, 1);
});

test("host start, review and finish events include session and participation counts", async () => {
  await api.startCollocationTeamLiveGame("game");
  currentGame().state = { phase: "reveal", questionIndex: 1 };
  await api.startCollocationTeamReview("game");
  await api.finishCollocationTeamLiveGame("game");
  await api.finishCollocationTeamLiveGame("game");
  assert.deepEqual(backend.events.map((event) => event.type), ["collocation_live_started", "collocation_live_review_started", "collocation_live_finished"]);
  assert.equal(backend.events[0].details.playerCount, 2);
  assert.equal(backend.events[0].details.teamCount, 1);
  assert.equal(backend.events[1].details.reviewRoundCount, 2);
});

test("participation logs cover non-captains, round results and completion without refresh duplicates", async () => {
  await api.startCollocationTeamLiveGame("game");
  backend.events = [];
  const storageData = new Map();
  const storage = { getItem: (key) => storageData.get(key), setItem: (key, value) => storageData.set(key, value) };
  backend.auth.currentUser = { uid: "teammate" };
  const game = currentGame();
  api.trackCollocationLiveParticipation(game, "participation-test", "teammate", storage);
  api.trackCollocationLiveParticipation(game, "participation-test", "teammate", storage);
  game.teamAnswers = { "team-1": { 0: { selectedWords: ["hazard", "health"], submittedBy: "captain", submissionMode: "timeout" } } };
  game.state.phase = "reveal";
  api.trackCollocationLiveParticipation(game, "participation-test", "teammate", storage);
  api.trackCollocationLiveParticipation(game, "participation-test", "teammate", storage);
  game.status = "finished";
  game.state.phase = "finished";
  api.trackCollocationLiveParticipation(game, "participation-test", "teammate", storage);
  api.trackCollocationLiveParticipation(game, "participation-test", "teammate", storage);
  assert.deepEqual(backend.events.map((event) => event.type), ["collocation_live_participation_started", "collocation_live_round_completed", "collocation_live_participation_completed"]);
  assert.ok(backend.events.every((event) => event.uid === "teammate"));
  assert.equal(backend.events[1].details.roundPoints, 50);
  assert.equal(backend.events[1].details.wasCaptain, false);
  assert.equal(backend.events[2].details.points, 50);
  assert.equal(backend.events[2].details.possiblePoints, 200);
});

test("activity labels and summaries describe timed live participation", () => {
  assert.equal(ACTIVITY_TYPE_LABELS.collocation_live_round_completed, "Collocation Live Round Completed");
  const summary = formatActivityDetails({ type: "collocation_live_round_completed", details: { teamName: "Team 1", itemIndex: 1, score: 2, possibleScore: 4, roundPoints: 50, submissionMode: "timeout" } });
  assert.match(summary, /Team 1/);
  assert.match(summary, /2\/4 correct/);
  assert.match(summary, /Auto-submitted at timeout/);
});

test("live setup defaults to all levels and keeps the solo trainer's selected filters", () => {
  assert.deepEqual(readCollocationLiveFilters("", bank).levels, ["b1", "b2", "c1"]);
  const inherited = readCollocationLiveFilters("?levels=b2,c1&topic=work&pattern=verb%20%2B%20noun", bank);
  assert.deepEqual(inherited, { levels: ["b2", "c1"], topic: "work", pattern: "verb + noun" });
  assert.equal(readCollocationLiveFilters("?topic=not-a-topic&pattern=unknown", bank).topic, "all");
});

test("the setup bank filters approved, unique items by level, primary/secondary topic and pattern", () => {
  const source = [
    { itemId: "one", status: "approved", level: "b2", topic: "work", secondaryTopics: ["travel"], pattern: "verb + noun" },
    { itemId: "two", status: "draft", level: "b2", topic: "travel", pattern: "verb + noun" },
    { itemId: "three", status: "approved", level: "c1", topic: "travel", pattern: "verb + noun" },
    { itemId: "four", status: "approved", level: "b2", topic: "travel", pattern: "noun + noun" },
  ];
  assert.deepEqual(filterCollocationLiveItems([...source, source[0]], { levels: ["b2"], topic: "travel", pattern: "verb + noun" }).map((item) => item.itemId), ["one"]);
  assert.deepEqual(filterCollocationLiveItems(bank, { levels: [] }), []);
});

test("round counts resize the selection without losing retained, hand-picked sets", () => {
  const pool = bank.slice(0, 20);
  const selected = [pool[4].itemId, pool[2].itemId];
  const expanded = selectCollocationLiveItems(pool, selected, 12, () => 0);
  assert.equal(expanded.length, 12);
  assert.deepEqual(expanded.slice(0, 2), selected);
  assert.equal(new Set(expanded).size, 12);
  assert.deepEqual(selectCollocationLiveItems(pool, expanded, 3), expanded.slice(0, 3));
});

test("changing filters removes out-of-scope selections and fills from the new pool only", () => {
  const pool = filterCollocationLiveItems(bank, { levels: ["b1"] });
  const outOfScope = bank.find((item) => item.level === "c1").itemId;
  const selected = selectCollocationLiveItems(pool, [outOfScope, pool[0].itemId], 8);
  assert.equal(selected.length, 8);
  assert.equal(selected[0], pool[0].itemId);
  assert.ok(!selected.includes(outOfScope));
  assert.ok(selected.every((id) => pool.some((item) => item.itemId === id)));
});

test("random selection caps to available sets and handles tiny or empty pools", () => {
  assert.equal(selectCollocationLiveItems(bank.slice(0, 3), [], 20).length, 3);
  assert.equal(selectCollocationLiveItems(bank.slice(0, 1), [], 20).length, 1);
  assert.deepEqual(selectCollocationLiveItems([], [], 10), []);
});

test("the final deck preserves chosen order and shuffles options without changing the bank", () => {
  const pool = bank.slice(0, 4);
  const original = structuredClone(pool);
  const ids = [pool[2].itemId, pool[0].itemId];
  const items = createCollocationLiveItems(pool, [...ids, ids[0], "missing"], () => 0);
  assert.deepEqual(items.map((item) => item.itemId), ids);
  assert.notDeepEqual(items[0].options, pool[2].options);
  assert.deepEqual(items[0].options.map((option) => option.word).sort(), pool[2].options.map((option) => option.word).sort());
  assert.deepEqual(pool, original);
});

test("creating a customised lobby uses exactly the chosen sets and logs the round count", async () => {
  const pool = filterCollocationLiveItems(bank, { levels: ["b2"] });
  const ids = selectCollocationLiveItems(pool, [], 7);
  await api.createCollocationTeamLiveGame({ items: createCollocationLiveItems(pool, ids), title: "Tuesday B2 class" });
  const game = backend.data.liveGames.created;
  assert.equal(game.status, "lobby");
  assert.equal(game.items.length, 7);
  assert.equal(game.title, "Tuesday B2 class");
  assert.deepEqual(game.items.map((item) => item.itemId), ids);
  assert.ok(game.items.every((item) => item.level === "b2"));
  assert.equal(backend.events[0].details.setCount, 7);
});
