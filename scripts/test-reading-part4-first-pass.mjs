import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { SAVING_SMELLS_FIRST_PASS_TASK as task } from "../src/reading/savingSmellsFirstPass.js";
import * as banks from "../src/reading/readingPart4TaskBanks.js";
import * as helpers from "../src/reading/readingPart4FirstPass.js";

test("the source document's article, worked example, real heading bank and varied classroom answers are preserved", async () => {
  const source = await fs.readFile(new URL("../docs/aptis-reading-part4-saving-smells-first-pass.md", import.meta.url), "utf8");
  const article = source.split("## Student text")[1].split("## Master heading bank")[0];
  const paragraphs = [...article.matchAll(/\*\*(\d)(?: — Worked example: ([^*]+))?\*\*\s+([\s\S]*?)(?=\n\*\*\d|$)/g)];
  assert.equal(task.firstPass.example.text, paragraphs[0][3].trim());
  assert.equal(task.firstPass.example.heading, paragraphs[0][2]);
  assert.equal(task.paragraphs.length, 7);
  assert.equal(task.headings.length, 8);
  assert.deepEqual(task.paragraphs.map((paragraph) => paragraph.answer), ["F", "B", "H", "D", "A", "G", "C"]);
  assert.deepEqual(task.paragraphs.map((paragraph) => paragraph.correctOptionIndex), [1, 3, 0, 2, 1, 3, 0]);
  task.paragraphs.forEach((paragraph, index) => {
    assert.equal(paragraph.text, paragraphs[index + 1][3].trim());
    assert.ok(paragraph.text.includes(paragraph.evidenceParts[0]));
    assert.equal(paragraph.roundOptions[paragraph.correctOptionIndex], task.headings.find((heading) => heading.key === paragraph.answer).text);
    assert.equal(paragraph.roundOptions.filter((option) => task.headings.some((heading) => heading.text === option)).length, 2);
  });
  assert.equal(task.firstPass.unusedHeading, "E");
  assert.ok(!task.paragraphs.some((paragraph) => paragraph.answer === "E"));
  assert.equal(banks.getReadingPart4TeacherTask(task.id), task);
  assert.equal(banks.READING_PART4_TEACHER_TASKS.length, 2);
  assert.ok(!banks.READING_PART4_NEW_STUDENT_TASKS.some((item) => item.id === task.id));
});

test("the sequence contains a worked example, seven main-idea/choice/discussion rounds and a separate final review", () => {
  let state = { phase: "lobby", paragraphIndex: 0, mainIdeaSeconds: 75, headingSeconds: 25 };
  state = helpers.nextFirstPassState(task, state, 100);
  assert.equal(state.phase, "example");
  state = helpers.nextFirstPassState(task, state, 200);
  for (let index = 0; index < 7; index += 1) {
    assert.equal(state.phase, "main_idea"); assert.equal(state.paragraphIndex, index);
    state = helpers.nextFirstPassState(task, state, 300);
    assert.equal(state.phase, "heading_choice");
    state = helpers.nextFirstPassState(task, state, 400);
    assert.equal(state.phase, "paragraph_review");
    state = helpers.nextFirstPassState(task, state, 500);
  }
  assert.equal(state.phase, "final_match");
  state = helpers.nextFirstPassState(task, state, 600);
  assert.equal(state.phase, "review");
  state = helpers.nextFirstPassState(task, state, 700);
  assert.equal(state.phase, "finished");
  assert.throws(() => helpers.nextFirstPassState(task, state, 800), /cannot move forward/);
});

async function harness() {
  const data = {};
  const logs = [];
  const auth = { currentUser: { uid: "teacher", displayName: "Teacher" } };
  let sequence = 0;
  const read = (path) => path.split("/").filter(Boolean).reduce((node, part) => node?.[part], data) ?? null;
  function write(path, value) {
    const parts = path.split("/").filter(Boolean);
    const leaf = parts.pop();
    const parent = parts.reduce((node, part) => node[part] ||= {}, data);
    parent[leaf] = structuredClone(value);
  }
  const snapshot = (value) => ({ val: () => structuredClone(value), exists: () => value != null && (typeof value !== "object" || Object.keys(value).length > 0) });
  const database = {
    ref: (_, path) => ({ path }), push: ({ path }) => ({ path: `${path}/room-${++sequence}`, key: `room-${sequence}` }),
    get: async ({ path, filters }) => snapshot(filters ? Object.fromEntries(Object.entries(read(path) || {}).filter(([, game]) => game[filters[0]] === filters[1])) : read(path)),
    set: async ({ path }, value) => write(path, value),
    update: async ({ path }, updates) => Object.entries(updates).forEach(([key, value]) => write(`${path}/${key}`, value)),
    runTransaction: async ({ path }, updater) => {
      const next = updater(structuredClone(read(path)));
      if (next === undefined) return { committed: false };
      write(path, next); return { committed: true, snapshot: snapshot(next) };
    },
    query: (reference, ...filters) => ({ ...reference, filters }), orderByChild: (field) => field, equalTo: (value) => value,
    serverTimestamp: () => Date.now(),
  };
  const firebase = new Proxy({ auth, rtdb: {} }, { get: (object, name) => object[name] ?? (async (value) => { logs.push({ name, value }); }) });
  let live;
  async function load(filename) {
    const source = await fs.readFile(new URL(`../src/api/${filename}`, import.meta.url), "utf8");
    const imports = new Map([...source.matchAll(/import\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/g)].map((match) => [match[2], match[1].split(",").map((name) => name.trim()).filter(Boolean)]));
    const module = new vm.SourceTextModule(source);
    await module.link((specifier) => {
      const values = specifier === "firebase/database" ? database : /firebase(?:\.js)?$/.test(specifier) ? firebase
        : specifier.includes("readingPart4TaskBanks") ? banks : specifier.includes("readingPart4FirstPass") ? helpers
          : specifier.includes("realtimeServerTime") ? { getRealtimeServerTimeOffset: async () => 0 }
            : specifier === "./liveGames.js" ? live.namespace : {};
      const names = imports.get(specifier).map((name) => name.split(/\s+as\s+/)[0]);
      return new vm.SyntheticModule(names, function () { names.forEach((name) => this.setExport(name, values[name] ?? (name.endsWith("_GAME_TYPE") ? name : async () => {}))); });
    });
    await module.evaluate(); return module;
  }
  live = await load("liveGames.js");
  const firstPass = await load("readingPart4FirstPass.js");
  const { gameId, pin } = await live.namespace.createReadingPart4LiveGame({ taskId: task.id });
  const root = `liveGames/${gameId}`;
  const as = (uid) => { auth.currentUser = { uid, displayName: uid }; };
  for (const uid of ["student-a", "student-b", "student-c", "student-d"]) { as(uid); await live.namespace.joinLiveGameByPin(pin); }
  as("teacher");
  const advance = () => firstPass.namespace.advanceReadingPart4FirstPass({ gameId, expectedPhase: read(`${root}/state/phase`), expectedParagraphIndex: read(`${root}/state/paragraphIndex`) });
  return { api: firstPass.namespace, live: live.namespace, gameId, root, read, write, as, advance, logs };
}

test("actual live API creates the first-pass room, enforces host controls and preserves late flexible submissions", async () => {
  const { api, gameId, root, read, write, as, advance } = await harness();
  assert.equal(read(root).type, banks.READING_PART4_LIVE_GAME_TYPE);
  assert.equal(read(`${root}/state/mainIdeaSeconds`), 75);
  await api.setReadingPart4FirstPassTiming({ gameId, mainIdeaSeconds: 90, headingSeconds: 30 });
  as("student-a");
  await assert.rejects(advance(), /Only the teacher/);
  await assert.rejects(api.submitReadingPart4FirstPassResponse({ gameId, paragraphId: 1, kind: "mainIdea", text: "An idea" }), /not open/);
  as("teacher"); await advance(); await advance();
  await assert.rejects(api.setReadingPart4FirstPassTiming({ gameId, mainIdeaSeconds: 60, headingSeconds: 20 }), /before the lesson/);
  await assert.rejects(api.advanceReadingPart4FirstPass({ gameId, expectedPhase: "example", expectedParagraphIndex: 0 }), /moved on/);
  assert.equal(read(`${root}/state/phase`), "main_idea");
  write(`${root}/state/phaseStartedAt`, Date.now() - 600000);
  as("student-a");
  await api.submitReadingPart4FirstPassResponse({ gameId, paragraphId: 1, kind: "mainIdea", text: "Paper changes." });
  assert.equal(read(`${root}/players/student-a/readingPart4FirstPass/1/mainIdea`).text, "Paper changes.");
  assert.equal(read(`${root}/players/student-a/readingPart4FirstPass/1/mainIdea`).correct, undefined);
  await assert.rejects(api.submitReadingPart4FirstPassResponse({ gameId, paragraphId: 1, kind: "mainIdea", text: "A replacement" }), /already been submitted/);
  await assert.rejects(api.submitReadingPart4FirstPassResponse({ gameId, paragraphId: 1, kind: "heading", selectedIndex: 1 }), /not open/);
});

test("all seven rounds retain original writing, use teacher-selected anonymous examples and then save final review matches", async () => {
  const { api, gameId, root, read, as, advance, logs } = await harness();
  await advance(); await advance();
  for (const paragraph of task.paragraphs) {
    for (const uid of ["student-a", "student-b", "student-c", "student-d"]) {
      as(uid);
      await api.submitReadingPart4FirstPassResponse({ gameId, paragraphId: paragraph.id, kind: "mainIdea", text: `${uid} idea for paragraph ${paragraph.id}` });
    }
    as("teacher"); await advance();
    as("student-a");
    await api.submitReadingPart4FirstPassResponse({ gameId, paragraphId: paragraph.id, kind: "heading", selectedIndex: paragraph.correctOptionIndex });
    await assert.rejects(api.submitReadingPart4FirstPassResponse({ gameId, paragraphId: paragraph.id, kind: "heading", selectedIndex: 0 }), /already been submitted/);
    as("teacher"); await advance();
    assert.equal(read(`${root}/state/sharedMainIdeaUids`).length, 3);
    await assert.rejects(api.shareReadingPart4FirstPassResponses({ gameId, uids: ["student-a", "student-b", "student-c", "student-d"] }), /up to three/);
    await api.shareReadingPart4FirstPassResponses({ gameId, uids: ["student-d"] });
    assert.deepEqual(read(`${root}/state/sharedMainIdeaUids`), ["student-d"]);
    await advance();
  }
  assert.equal(read(`${root}/state/phase`), "final_match");
  const answers = Object.fromEntries(task.paragraphs.map((paragraph) => [paragraph.id, paragraph.answer]));
  as("student-a");
  await api.saveReadingPart4FirstPassFinalAnswers({ gameId, taskId: task.id, answers });
  assert.equal(read(`${root}/players/student-a/readingPart4Submission`).complete, true);
  assert.equal(read(`${root}/players/student-a/readingPart4FirstPass/1/mainIdea`).text, "student-a idea for paragraph 1");
  const completion = logs.find((entry) => entry.name === "logAptisReadingLiveTaskCompleted");
  assert.equal(completion.value.score, 7);
  assert.equal(completion.value.reviewOnly, true);
  assert.equal(completion.value.scoreContext, "guided-final-review");
  as("teacher"); await advance();
  as("student-a");
  await assert.rejects(api.saveReadingPart4FirstPassFinalAnswers({ gameId, taskId: task.id, answers }), /not open/);
  as("teacher"); await advance();
  assert.equal(read(`${root}/status`), "finished");
  const summary = helpers.firstPassClassSummary(task, helpers.firstPassPlayers(read(root)));
  assert.ok(summary.every((round) => round.mainIdeaCount === 4 && round.correctCount === 1 && round.unanswered === 3));
});

test("wrong paragraphs, invalid headings and empty writing are rejected while ordinary Part 4 rooms retain their old setup", async () => {
  const { api, live, gameId, as, advance, read } = await harness();
  const ordinary = await live.createReadingPart4LiveGame({ taskId: banks.READING_PART4_TEACHER_TASKS[0].id });
  assert.equal(read(`liveGames/${ordinary.gameId}/state`).mainIdeaSeconds, undefined);
  await advance(); await advance(); as("student-a");
  await assert.rejects(api.submitReadingPart4FirstPassResponse({ gameId, paragraphId: 2, kind: "mainIdea", text: "Idea" }), /not open/);
  await assert.rejects(api.submitReadingPart4FirstPassResponse({ gameId, paragraphId: 1, kind: "mainIdea", text: "   " }), /Write a short main idea/);
  as("teacher"); await advance(); as("student-a");
  await assert.rejects(api.submitReadingPart4FirstPassResponse({ gameId, paragraphId: 1, kind: "heading", selectedIndex: 4 }), /four headings/);
  as("outsider");
  await assert.rejects(api.submitReadingPart4FirstPassResponse({ gameId, paragraphId: 1, kind: "heading", selectedIndex: 0 }), /Join the room/);
});
