import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import * as bank from "../src/components/listening/aptisListeningPart3StrategyData.js";
import * as helpers from "../src/components/listening/aptisListeningPart3StrategyUtils.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const ids = ["extract-01", "extract-09"];

test("the shipped bank matches the reviewed scripts, statements and keys, and only offers supplied recordings", async () => {
  const manuscript = await fs.readFile(path.join(root, "audio-scripts/aptis-listening-part-3-strategy-lesson-draft.md"), "utf8");
  const parts = manuscript.split(/^### Extract \d+ .+$/m).slice(1);
  const summary = new Map([...manuscript.matchAll(/^\| (\d+[ab]?) \| (Man|Woman|Both) \|/gm)].map((match) => [match[1], match[2].toLowerCase()]));
  assert.equal(bank.aptisOpinionStrategyExtracts.length, 10);
  assert.equal(bank.aptisOpinionStrategyExtracts.flatMap((item) => item.statements).length, 12);
  const audioFiles = (await fs.readdir(path.join(root, "public/audio/listening/part3/strategy"))).filter((name) => name.endsWith(".mp3")).map((name) => name.replace(/\.mp3$/, "")).sort();
  assert.deepEqual(bank.aptisOpinionStrategyExtracts.filter((item) => item.audioReady).map((item) => item.id).sort(), audioFiles);
  for (const extract of bank.aptisOpinionStrategyExtracts) {
    const dialogue = parts[extract.number - 1].split("**Dialogue**")[1].split("**Answer")[0];
    const turns = [...dialogue.matchAll(/^\*\*(Man|Woman):\*\* (.+)$/gm)].map((match) => ({ speaker: match[1], text: match[2] }));
    assert.deepEqual(extract.script, turns);
    for (const statement of extract.statements) {
      assert.equal(statement.answer, summary.get(statement.number));
      assert.ok(manuscript.includes(statement.text));
      assert.deepEqual(statement.speakerNotes.map((item) => item.speaker).sort(), ["Man", "Woman"]);
      assert.ok(statement.keyPoint.length > 10);
      for (const speaker of statement.speakerNotes) {
        assert.ok(speaker.notes.length >= 1 && speaker.notes.length <= 2);
        for (const note of speaker.notes) {
          assert.ok(note.length > 10 && note.length < 130);
          assert.ok(parts[extract.number - 1].includes(note), note);
        }
        const included = statement.answer === "both" || statement.answer === speaker.speaker.toLowerCase();
        assert.equal(speaker.stance === "supports", included);
        assert.ok(["supports", "opposes", "unclear"].includes(speaker.stance));
        assert.equal(statement.evidence.some((item) => item.speaker === speaker.speaker && item.kind === "support"), included);
      }
      assert.ok(parts[extract.number - 1].includes(statement.keyPoint));
      for (const evidence of statement.evidence) {
        assert.ok(Number.isInteger(evidence.lineIndex));
        const line = extract.script[evidence.lineIndex];
        assert.equal(line.speaker, evidence.speaker);
        assert.equal(line.text.split(evidence.quote).length, 2, evidence.quote);
        assert.ok(["support", "context"].includes(evidence.kind));
      }
      for (let index = 0; index < extract.script.length; index++) {
        const ranges = helpers.opinionStrategyEvidenceRanges(extract, statement.key, index);
        for (let i = 1; i < ranges.length; i++) assert.ok(ranges[i - 1].end <= ranges[i].start, `${statement.number}: overlapping evidence`);
      }
    }
    if (extract.audioReady) assert.ok((await fs.stat(path.join(root, "public", extract.audioSrc))).size > 1000);
    else assert.equal(extract.audioSrc, null);
  }
});

test("identical words in another speaker's turn are not highlighted", () => {
  const extract = {
    script: [{ speaker: "Man", text: "That sounds good." }, { speaker: "Woman", text: "That sounds good." }, { speaker: "Woman", text: "That sounds good." }],
    statements: [{ key: "a", evidence: [{ speaker: "Woman", lineIndex: 1, quote: "That sounds good.", kind: "support" }] }],
  };
  assert.deepEqual(helpers.opinionStrategyEvidenceRanges(extract, "a", 0), []);
  assert.equal(helpers.opinionStrategyEvidenceRanges(extract, "a", 1).length, 1);
  assert.deepEqual(helpers.opinionStrategyEvidenceRanges(extract, "a", 2), []);
  assert.deepEqual(helpers.opinionStrategyEvidenceRanges(extract, "missing", 1), []);
});

test("two-opinion extracts show only the selected opinion's evidence", () => {
  const extract = bank.getAptisOpinionStrategyExtract("extract-09");
  assert.equal(helpers.opinionStrategyEvidenceRanges(extract, "a", 4).length, 0);
  assert.ok(helpers.opinionStrategyEvidenceRanges(extract, "b", 4).every((item) => item.kind === "context"));
  assert.ok(helpers.opinionStrategyEvidenceRanges(extract, "a", 5).some((item) => item.kind === "support"));
  assert.equal(helpers.opinionStrategyEvidenceRanges(extract, "b", 5).length, 0);
});

test("phone-menu agreement highlights the shortcut, while the qualification stays context", () => {
  const extract = bank.getAptisOpinionStrategyExtract("extract-08");
  const ranges = helpers.opinionStrategyEvidenceRanges(extract, "a", 1);
  assert.ok(ranges.some((item) => item.kind === "support" && item.quote === "I just press three as soon as they start."));
  assert.ok(ranges.some((item) => item.kind === "context" && item.quote.includes("I wouldn't cut them")));
});

test("selection remains ordered and the teaching cycle keeps transcript support after both listens", () => {
  assert.deepEqual(bank.selectAptisOpinionStrategyExtracts([ids[1], "invalid", ids[0], ids[0]]).map((item) => item.id), ids);
  let state = { phase: "lobby", extractIndex: 0, extractIds: ids, audioStage: "playing" };
  assert.throws(() => helpers.nextOpinionStrategyState(state, "script"), /not available/);
  for (const phase of ["preview", "first", "compare", "second"]) {
    state = helpers.nextOpinionStrategyState(state);
    assert.equal(state.phase, phase);
    assert.equal(state.audioStage, "idle");
    if (phase !== "second") assert.throws(() => helpers.nextOpinionStrategyState(state, "script"), /not available/);
  }
  state = helpers.nextOpinionStrategyState(state, "script");
  assert.equal(state.phase, "script");
  state = helpers.nextOpinionStrategyState(state);
  assert.equal(state.phase, "review");
  state = helpers.nextOpinionStrategyState(state);
  assert.equal(state.phase, "preview");
  assert.equal(state.extractIndex, 1);
  assert.deepEqual(state.completedIds, [ids[0]]);
  state = helpers.nextOpinionStrategyState(state, "skip");
  assert.equal(state.phase, "finished");
  assert.deepEqual(state.skippedIds, [ids[1]]);
  assert.throws(() => helpers.nextOpinionStrategyState(state), /finished/);
});

test("scores distinguish a submitted blank, an omitted stage and a correct transcript-assisted revision", () => {
  const extracts = bank.selectAptisOpinionStrategyExtracts(ids);
  const player = { strategyResponses: {
    "extract-01": { first: { answers: { a: "" } }, second: { answers: { a: "both" } } },
    "extract-09": { first: { answers: { a: "both", b: "woman" } }, script: { answers: { a: "both", b: "man" } } },
  } };
  assert.deepEqual(helpers.opinionStrategyStageScore(extracts, player, "first"), { correct: 1, total: 3 });
  assert.deepEqual(helpers.opinionStrategyStageScore(extracts, player, "second"), { correct: 1, total: 1 });
  assert.deepEqual(helpers.opinionStrategyStageScore(extracts, player, "script"), { correct: 2, total: 2 });
  const groups = helpers.opinionStrategyAnswerGroups(extracts[0], [player, { strategyResponses: {} }], "first")[0];
  assert.equal(groups.submitted, 1);
  assert.equal(groups.missing, 1);
  assert.deepEqual(groups.groups, [{ answer: "", count: 1 }]);
});

test("submissions accept only speaker options for the current joined participant and open extract", () => {
  const game = { type: bank.APTIS_OPINION_STRATEGY_GAME_TYPE, status: "in-progress", players: { student: {} }, state: { phase: "first", extractIds: ids, extractIndex: 0 } };
  const extract = helpers.assertOpinionStrategySubmission(game, "student", ids[0], "first");
  assert.deepEqual(helpers.opinionStrategyResponsePayload(extract, { a: "neither", extra: "both" }, "anything"), { answers: { a: "" }, confidence: "unsure" });
  assert.throws(() => helpers.assertOpinionStrategySubmission(game, "stranger", ids[0], "first"), /Join/);
  assert.throws(() => helpers.assertOpinionStrategySubmission(game, "student", ids[1], "first"), /not open/);
  assert.throws(() => helpers.assertOpinionStrategySubmission(game, "student", ids[0], "script"), /not open/);
  assert.throws(() => helpers.assertOpinionStrategySubmission({ ...game, status: "finished" }, "student", ids[0], "first"), /not open/);
});

async function liveHarness() {
  const auth = { currentUser: { uid: "teacher" } };
  const room = { ownerUid: "teacher", type: bank.APTIS_OPINION_STRATEGY_GAME_TYPE, status: "in-progress", players: { student: { name: "Student" } }, state: { phase: "first", extractIds: ids, extractIndex: 0, audioStage: "idle" } };
  const data = { liveGames: { room } };
  const read = (key) => key.split("/").reduce((value, part) => value?.[part], data) ?? null;
  function write(key, value) {
    const parts = key.split("/"); let current = data;
    for (const part of parts.slice(0, -1)) current = current[part] ||= {};
    current[parts.at(-1)] = structuredClone(value);
  }
  const snapshot = (value) => ({ val: () => structuredClone(value) });
  const stubs = {
    "firebase/database": {
      ref: (_, key) => key,
      get: async (key) => snapshot(read(key)),
      push: () => ({ key: "new-room" }),
      set: async (key, value) => write(typeof key === "string" ? key : `liveGames/${key.key}`, value),
      update: async (key, values) => Object.entries(values).forEach(([field, value]) => write(`${key}/${field}`, value)),
      runTransaction: async (key, change) => {
        const value = change(structuredClone(read(key)));
        if (value === undefined) return { committed: false, snapshot: snapshot(read(key)) };
        write(key, value); return { committed: true, snapshot: snapshot(value) };
      },
    },
    [path.join(root, "src/firebase.js")]: { auth, rtdb: {} },
  };
  const context = vm.createContext({});
  const cache = new Map();
  async function load(identifier) {
    if (cache.has(identifier)) return cache.get(identifier);
    if (stubs[identifier]) {
      const values = stubs[identifier];
      const module = new vm.SyntheticModule(Object.keys(values), function () { for (const [key, value] of Object.entries(values)) this.setExport(key, value); }, { context, identifier });
      cache.set(identifier, module); return module;
    }
    const module = new vm.SourceTextModule(await fs.readFile(identifier, "utf8"), { context, identifier });
    cache.set(identifier, module);
    await module.link((specifier) => load(specifier === "firebase/database" ? specifier : path.resolve(path.dirname(identifier), specifier)));
    return module;
  }
  const module = await load(path.join(root, "src/api/aptisListeningOpinionStrategyLive.js"));
  await module.evaluate();
  return { api: module.namespace, auth, room, read };
}

test("live attempts are write-once, while second-listen revisions stay in a separate record", async () => {
  const { api, auth, room } = await liveHarness();
  auth.currentUser.uid = "student";
  const first = { gameId: "room", extractId: ids[0], stage: "first", answers: { a: "man" }, confidence: "sure" };
  await api.submitOpinionStrategyResponse(first);
  await assert.rejects(api.submitOpinionStrategyResponse({ ...first, answers: { a: "both" } }), /already submitted/);
  assert.equal(room.players.student.strategyResponses[ids[0]].first.answers.a, "man");
  auth.currentUser.uid = "teacher";
  await api.advanceOpinionStrategyLive({ gameId: "room", expectedPhase: "first", expectedIndex: 0 });
  await api.advanceOpinionStrategyLive({ gameId: "room", expectedPhase: "compare", expectedIndex: 0 });
  auth.currentUser.uid = "student";
  await api.submitOpinionStrategyResponse({ ...first, stage: "second", answers: { a: "both" } });
  assert.equal(room.players.student.strategyResponses[ids[0]].first.answers.a, "man");
  assert.equal(room.players.student.strategyResponses[ids[0]].second.answers.a, "both");
});

test("only the owner can advance or control sound, and stale controls cannot move a later stage", async () => {
  const { api, auth, room } = await liveHarness();
  auth.currentUser.uid = "student";
  await assert.rejects(api.advanceOpinionStrategyLive({ gameId: "room", expectedPhase: "first", expectedIndex: 0 }), /Only the teacher/);
  await assert.rejects(api.setOpinionStrategyAudio({ gameId: "room", expectedPhase: "first", expectedIndex: 0, audioStage: "playing" }), /Only the teacher/);
  auth.currentUser.uid = "teacher";
  await assert.rejects(api.advanceOpinionStrategyLive({ gameId: "room", expectedPhase: "compare", expectedIndex: 0 }), /moved on/);
  assert.equal(room.state.phase, "first");
  await api.setOpinionStrategyAudio({ gameId: "room", expectedPhase: "first", expectedIndex: 0, audioStage: "playing" });
  assert.equal(room.state.audioStage, "playing");
  await api.advanceOpinionStrategyLive({ gameId: "room", expectedPhase: "first", expectedIndex: 0 });
  assert.equal(room.state.audioStage, "idle");
  await assert.rejects(api.setOpinionStrategyAudio({ gameId: "room", expectedPhase: "first", expectedIndex: 0, audioStage: "playing" }), /moved on/);
});
