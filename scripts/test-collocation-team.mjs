import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { beforeEach, test } from "node:test";
import { build } from "esbuild";
import {
  buildCollocationReviewIndexes,
  collocationTeamTotalPoints,
  createCollocationRoundState,
  evaluateCollocationSelection,
  getCollocationLiveRound,
} from "../src/components/vocabulary/collocations/collocationTeamLive.js";

const item = {
  itemId: "occupational",
  options: ["hazard", "health", "risk", "therapy", "job", "work", "professional"]
    .map((word, index) => ({ word, isCorrect: index < 4 })),
};
const rules = JSON.parse(await readFile(new URL("../database.rules.json", import.meta.url), "utf8"));
const backend = {
  auth: { currentUser: { uid: "host" } },
  data: {},
  snapshot(path) {
    const value = path === ".info/serverTimeOffset"
      ? 0
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
    contents: "export { startCollocationTeamLiveGame, startNextCollocationTeamRound, startCollocationTeamReview, revealCollocationTeamRound, submitCollocationTeamAnswer } from './src/api/liveGames.js';",
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
           export const get = async (path) => backend.snapshot(path);
           export const set = async (path, value) => backend.set(path, value);
           export const update = async (path, updates) => {
             for (const [key, value] of Object.entries(updates)) backend.set(path + '/' + key, value);
           };
           export const runTransaction = async (path, updater) => {
             const next = updater(structuredClone(backend.snapshot(path).val()));
             if (next === undefined) return { committed: false };
             backend.set(path, next);
             return { committed: true };
           };
           export const push = () => {};
           export const query = () => {};
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
  const review = buildCollocationReviewIndexes(game.items, {
    "team-1": { 0: { selectedWords: ["hazard", "health", "risk", "therapy"] } },
  }, 5, ["team-1"]);
  assert.deepEqual(review, [1]);
  await api.startCollocationTeamReview("game", review);
  assert.equal(currentGame().state.phase, "review-question");
  assert.equal(getCollocationLiveRound(currentGame()).itemIndex, 1);
  assert.equal(currentGame().state.questionDuration, 45);
});

test("every new round gets a new deadline even after a previous timeout", () => {
  const game = currentGame();
  const old = createCollocationRoundState(game, 0, false, 1000);
  const next = createCollocationRoundState(game, 1, false, old.questionDeadline + 5000);
  assert.equal(next.questionDeadline - old.questionDeadline, 50_000);
});

function allowedByAnswerRule(rootName, uid, key, now) {
  const expression = rules.rules.liveGames.$gameId[rootName].$teamId.$itemIndex[".write"];
  const newAnswer = { submittedBy: uid };
  const newData = { child: (name) => ({ val: () => newAnswer[name] }) };
  const rootSnapshot = { child: (key) => {
    const snap = backend.snapshot(key);
    return snap;
  } };
  return Function("root", "auth", "$gameId", "$teamId", "$itemIndex", "data", "newData", "now", `return (${expression});`)(
    rootSnapshot, { uid }, "game", "team-1", String(key), { exists: () => false }, newData, now
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
  await api.startCollocationTeamReview("game", [1, 0]);
  assert.equal(allowedByAnswerRule("reviewAnswers", "captain", 1, Date.now()), true);
  assert.equal(allowedByAnswerRule("reviewAnswers", "captain", 0, Date.now()), false);
  await api.revealCollocationTeamRound("game", true, currentGame().state.questionDeadline);
  assert.equal(allowedByAnswerRule("reviewAnswers", "captain", 1, Date.now()), false);
});
