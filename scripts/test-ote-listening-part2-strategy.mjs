import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";
import * as bank from "../src/products/ote/data/oteListeningPart2Strategy.js";
import * as helpers from "../src/products/ote/utils/listeningPart2Strategy.js";
import { isAdvancedPart2AnswerCorrect } from "../src/products/ote/utils/listeningLive.js";

test("all ten keys and accepted answers are heard verbatim, fit the word limit and have valid evidence", async () => {
  assert.equal(bank.listeningStrategyExtracts.length, 8);
  const gaps = bank.listeningStrategyExtracts.flatMap((extract) => extract.gaps);
  assert.equal(gaps.length, 10);
  assert.equal(new Set(gaps.map((gap) => gap.id)).size, 10);
  for (const extract of bank.listeningStrategyExtracts) {
    for (const gap of extract.gaps) {
      for (const answer of [gap.answer, ...(gap.acceptedAnswers || [])]) {
        assert.ok(extract.script.toLowerCase().includes(answer.toLowerCase()) || answer.replace(/\s+/g, "") === gap.answer.replace(/\s+/g, ""), answer);
        assert.ok(answer.split(/\s+/).length <= 2);
      }
      assert.ok(!`${gap.before} ${gap.after}`.toLowerCase().includes(gap.answer.toLowerCase()));
      for (const quote of gap.evidence) assert.ok(extract.script.includes(quote), quote);
    }
    if (extract.audioReady) await fs.access(new URL(`../public${extract.audioSrc}`, import.meta.url));
  }
  assert.ok(isAdvancedPart2AnswerCorrect(gaps[4], " SOCKETS "));
  assert.ok(!isAdvancedPart2AnswerCorrect(gaps[2], "language"));
  assert.ok(!isAdvancedPart2AnswerCorrect(gaps[8], "staff"));
  assert.ok(isAdvancedPart2AnswerCorrect(gaps[3], "child care"));
  assert.ok(!isAdvancedPart2AnswerCorrect(gaps[3], "transport"));
});

test("selection is ordered and deduplicated, and a complete teaching cycle never reveals a script before the second listen", () => {
  assert.deepEqual(bank.selectListeningStrategyExtracts(["extract-08", "invalid", "extract-01", "extract-01"]).map((item) => item.id), ["extract-01", "extract-08"]);
  let state = { phase: "lobby", extractIndex: 0, extractIds: ["extract-01", "extract-08"] };
  for (const phase of ["preview", "first", "compare", "second"]) {
    state = helpers.nextListeningStrategyState(state);
    assert.equal(state.phase, phase);
    if (phase !== "second") assert.throws(() => helpers.nextListeningStrategyState(state, "script"), /not available/);
  }
  state = helpers.nextListeningStrategyState(state, "script"); assert.equal(state.phase, "script");
  state = helpers.nextListeningStrategyState(state); assert.equal(state.phase, "review");
  state = helpers.nextListeningStrategyState(state); assert.equal(state.phase, "preview"); assert.equal(state.extractIndex, 1);
  assert.deepEqual(state.completedIds, ["extract-01"]);
  state = helpers.nextListeningStrategyState(state, "skip"); assert.equal(state.phase, "finished");
  assert.deepEqual(state.skippedIds, ["extract-08"]);
  assert.throws(() => helpers.nextListeningStrategyState(state), /finished/);
  assert.throws(() => helpers.nextListeningStrategyState({ phase: "preview", extractIds: [] }), /Select/);
});

test("short routes can omit transcript support and end early without fabricating completion", () => {
  const initial = { phase: "second", extractIndex: 0, extractIds: ["extract-03", "extract-04"] };
  const review = helpers.nextListeningStrategyState(initial);
  assert.equal(review.phase, "review");
  assert.throws(() => helpers.nextListeningStrategyState(review, "script"), /not available/);
  const end = helpers.nextListeningStrategyState(initial, "finish");
  assert.equal(end.phase, "finished"); assert.equal(end.completedIds, undefined);
});

async function harness() {
  const data = {};
  const auth = { currentUser: { uid: "teacher", displayName: "Teacher" } };
  let sequence = 0;
  const read = (path) => path.split("/").filter(Boolean).reduce((node, part) => node?.[part], data) ?? null;
  function write(path, value) {
    const parts = path.split("/").filter(Boolean); const leaf = parts.pop();
    const parent = parts.reduce((node, part) => node[part] ||= {}, data);
    parent[leaf] = structuredClone(value);
  }
  const snapshot = (value) => ({ val: () => structuredClone(value), exists: () => value != null });
  const database = {
    ref: (_, path) => ({ path }), push: ({ path }) => ({ path: `${path}/room-${++sequence}`, key: `room-${sequence}` }),
    get: async ({ path, filters }) => snapshot(filters ? Object.fromEntries(Object.entries(read(path) || {}).filter(([, game]) => game[filters[0]] === filters[1])) : read(path)),
    set: async ({ path }, value) => write(path, value),
    update: async ({ path }, updates) => Object.entries(updates).forEach(([key, value]) => write(`${path}/${key}`, value)),
    runTransaction: async ({ path }, updater) => { const next = updater(structuredClone(read(path))); if (next === undefined) return { committed: false }; write(path, next); return { committed: true, snapshot: snapshot(next) }; },
    query: (reference, ...filters) => ({ ...reference, filters }), orderByChild: (field) => field, equalTo: (value) => value,
    serverTimestamp: () => Date.now(),
  };
  async function load(filename) {
    const source = await fs.readFile(new URL(`../src/api/${filename}`, import.meta.url), "utf8");
    const imports = new Map([...source.matchAll(/import\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/g)].map((match) => [match[2], match[1].split(",").map((name) => name.trim()).filter(Boolean)]));
    const dependencies = Object.fromEntries([...imports].map(([specifier, names]) => {
      const values = specifier === "firebase/database" ? database : /firebase(?:\.js)?$/.test(specifier) ? { auth, rtdb: {} }
        : specifier.includes("data/oteListeningPart2Strategy") ? bank : specifier.includes("utils/listeningPart2Strategy") ? helpers : {};
      return [specifier, Object.fromEntries(names.map((name) => {
        const imported = name.split(/\s+as\s+/)[0];
        return [imported, values[imported] ?? (imported.endsWith("_GAME_TYPE") ? imported : async () => {})];
      }))];
    }));
    // Run the actual API functions with an in-memory Firebase dependency. This
    // avoids Node's experimental VM module loader and its native crashes.
    const declarations = [...imports].map(([specifier, names]) => `const { ${names.map((name) => name.replace(/\s+as\s+/, ": ")).join(", ")} } = dependencies[${JSON.stringify(specifier)}];`).join("\n");
    const body = source.replace(/import\s*\{[^}]+\}\s*from\s*["'][^"']+["'];?/g, "").replace(/^export\s+(?=(?:async\s+)?function|const)/gm, "");
    const exports = [...source.matchAll(/^export\s+(?:async\s+)?(?:function|const)\s+(\w+)/gm)].map((match) => match[1]);
    return new Function("dependencies", `${declarations}\n${body}\nreturn { ${exports.join(", ")} };`)(dependencies);
  }
  const api = await load("oteListeningStrategyLive.js");
  const live = await load("liveGames.js");
  const room = await api.createListeningStrategyLiveGame({ extractIds: ["extract-08", "extract-01"] });
  const root = `liveGames/${room.gameId}`;
  const as = (uid) => { auth.currentUser = uid ? { uid, displayName: uid } : null; };
  const advance = (action = "next") => api.advanceListeningStrategyLive({ gameId: room.gameId, expectedPhase: read(`${root}/state/phase`), expectedIndex: read(`${root}/state/extractIndex`), action });
  const submit = (stage, answers, extractId = "extract-01") => api.submitListeningStrategyResponse({ gameId: room.gameId, extractId, stage, answers, confidence: "sure" });
  return { api, live, room, root, read, write, as, advance, submit };
}

test("actual room creation and PIN joining preserve participants, and only the host can advance or play", async () => {
  const h = await harness();
  assert.equal(h.read(h.root).type, bank.LISTENING_STRATEGY_GAME_TYPE);
  await assert.rejects(h.advance(), /at least one/);
  h.as("student"); await h.live.joinLiveGameByPin(h.room.pin);
  h.write(`${h.root}/players/student/strategyResponses`, { saved: { first: { answers: {} } } });
  await h.live.joinLiveGameByPin(h.room.pin);
  assert.ok(h.read(`${h.root}/players/student/strategyResponses/saved`));
  await assert.rejects(h.advance(), /Only the teacher/);
  await assert.rejects(h.api.setListeningStrategyAudio({ gameId: h.room.gameId, expectedPhase: "lobby", expectedIndex: 0, audioStage: "playing" }), /Only the teacher/);
  h.as("teacher"); await h.advance();
  assert.equal(h.read(`${h.root}/status`), "in-progress");
  await assert.rejects(h.api.advanceListeningStrategyLive({ gameId: h.room.gameId, expectedPhase: "lobby", expectedIndex: 0 }), /moved on/);
  h.as(null); await assert.rejects(h.submit("first", {}), /Sign in/);
});

test("three response snapshots remain separate; late, duplicate, wrong-extract and outsider writes are rejected", async () => {
  const h = await harness(); h.as("student"); await h.live.joinLiveGameByPin(h.room.pin);
  h.as("teacher"); await h.advance(); await h.advance();
  h.as("outsider"); await assert.rejects(h.submit("first", {}), /Join/);
  h.as("student");
  await assert.rejects(h.submit("second", {}), /not open/);
  await assert.rejects(h.submit("first", {}, "extract-08"), /not open/);
  await h.submit("first", { "gap-1": "paper", injected: "not saved" });
  await assert.rejects(h.submit("first", { "gap-1": "cardboard" }), /already submitted/);
  assert.deepEqual(Object.keys(h.read(`${h.root}/players/student/strategyResponses/extract-01/first/answers`)), ["gap-1"]);
  h.as("teacher"); await h.advance();
  h.as("student"); await assert.rejects(h.submit("first", {}), /not open/);
  h.as("teacher"); await h.advance();
  h.as("student"); await h.submit("second", { "gap-1": "cardbord" });
  h.as("teacher"); await h.advance("script");
  h.as("student"); await h.submit("script", { "gap-1": "cardboard" });
  const player = h.read(`${h.root}/players/student`);
  assert.deepEqual(helpers.strategyStageScore(bank.listeningStrategyExtracts, player, "first"), { correct: 0, total: 1 });
  assert.deepEqual(helpers.strategyStageScore(bank.listeningStrategyExtracts, player, "second"), { correct: 0, total: 1 });
  assert.deepEqual(helpers.strategyStageScore(bank.listeningStrategyExtracts, player, "script"), { correct: 1, total: 1 });
  h.as("teacher"); await h.advance(); await h.advance();
  assert.equal(h.read(`${h.root}/state/extractIndex`), 1);
  await h.advance(); h.as("student"); await h.submit("first", {}, "extract-08");
  assert.deepEqual(helpers.strategyStageScore(bank.listeningStrategyExtracts, h.read(`${h.root}/players/student`), "first"), { correct: 0, total: 3 });
  assert.deepEqual(helpers.strategyStageScore(bank.listeningStrategyExtracts, h.read(`${h.root}/players/student`), "second"), { correct: 0, total: 1 });
  h.as("teacher"); await h.advance("finish"); assert.equal(h.read(`${h.root}/status`), "finished");
});

test("anonymous comparisons group typed variants and distinguish blank submissions from missing submissions", () => {
  const extract = bank.listeningStrategyExtracts[0];
  const players = [{ name: "Private Alice", strategyResponses: { "extract-01": { first: { answers: { "gap-1": " Cardboard " } } } } }, { name: "Private Ben", strategyResponses: { "extract-01": { first: { answers: { "gap-1": "cardboard" } } } } }, { name: "Private Cara", strategyResponses: { "extract-01": { first: { answers: { "gap-1": "" } } } } }, { name: "Private Dani" }];
  const groups = helpers.strategyAnswerGroups(extract, players, "first");
  assert.equal(groups[0].submitted, 3); assert.equal(groups[0].missing, 1);
  assert.deepEqual(groups[0].groups, [{ answer: "cardboard", count: 2 }, { answer: "", count: 1 }]);
  assert.doesNotMatch(JSON.stringify(groups), /Private Alice|Private Ben|Private Cara|Private Dani/);
  assert.deepEqual(helpers.strategyStageScore([extract], players[3], "first"), { correct: 0, total: 0 });
});
