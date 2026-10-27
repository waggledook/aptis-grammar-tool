/* eslint-disable no-undef */
const test = require("node:test");
const assert = require("node:assert/strict");
const {createLiveGameEmailHandler} = require("../live-game-email-handler");

const createdAt = Date.parse("2026-10-26T15:00:00Z");
function harness(game = {type: "grammar", setId: "set-1", ownerUid: "host", pin: "123456", status: "lobby", createdAt}) {
  const docs = new Map([
    ["users/host", {displayName: "Sample Teacher", email: "teacher@example.com"}],
    ["grammarSets/set-1", {title: "Past tenses", itemIds: ["one", "two"]}],
  ]);
  const messages = [];
  const reads = [];
  let transactionQueue = Promise.resolve();
  let mailError = null;
  let receiptError = false;
  let gameReads = 0;
  const firestore = {
    doc(path) {
      return {path, get: async () => {
        reads.push(path);
        return {data: () => structuredClone(docs.get(path))};
      }, set: async (data, options) => {
        if (receiptError && data.status === "sent") throw new Error("Receipt write failed");
        docs.set(path, {...(options?.merge ? docs.get(path) : {}), ...structuredClone(data)});
      }};
    },
    runTransaction(callback) {
      const pending = transactionQueue.then(() => callback({
        get: (ref) => ref.get(),
        set: (ref, data, options) => {
          docs.set(ref.path, {...(options?.merge ? docs.get(ref.path) : {}), ...structuredClone(data)});
        },
      }));
      transactionQueue = pending.catch(() => {});
      return pending;
    },
  };
  const handler = createLiveGameEmailHandler({
    firestore,
    auth: {getUser: async () => ({displayName: "Auth Teacher", email: "auth@example.com"})},
    transporter: {sendMail: async (message) => {
      if (mailError) throw mailError;
      messages.push(message);
      return {messageId: "mail-1"};
    }},
    fromAddress: "sender@example.com", teacherEmail: "admin@example.com", now: () => createdAt,
    logger: {log() {}, warn() {}, error() {}},
  });
  return {
    docs, messages, reads,
    set mailError(error) { mailError = error; },
    set receiptError(value) { receiptError = value; },
    get gameReads() { return gameReads; },
    invoke(before, after, time = createdAt, eventId = `event-${after}`) {
      return handler({before: {val: () => before}, after: {val: () => after, ref: {parent: {get: async () => {
        gameReads += 1;
        return {val: () => game};
      }}}}}, {params: {gameId: "session-1"}, timestamp: new Date(time).toISOString(), eventId});
    },
  };
}

test("new lobby sends one enriched email to the admin, with host as reply-to", async () => {
  const h = harness();
  await h.invoke(null, "lobby");
  assert.equal(h.messages.length, 1);
  assert.equal(h.messages[0].to, "admin@example.com");
  assert.equal(h.messages[0].replyTo, "teacher@example.com");
  assert.match(h.messages[0].subject, /Past tenses · Sample Teacher/);
  assert.equal(h.docs.get("liveActivityEmailDeliveries/session-1--launched").status, "sent");
});

test("concurrent duplicate events cannot send duplicate launch or completion emails", async () => {
  const h = harness();
  await Promise.all([h.invoke(null, "lobby"), h.invoke(null, "lobby"), h.invoke(null, "lobby")]);
  await Promise.all([h.invoke("in-progress", "finished"), h.invoke("in-progress", "finished")]);
  assert.equal(h.messages.length, 2);
  assert.match(h.messages[0].subject, /launched/);
  assert.match(h.messages[1].subject, /completed/);
});

test("start records the event time without a database read or another email", async () => {
  const h = harness();
  await h.invoke("lobby", "in-progress", createdAt + 60000);
  assert.equal(h.messages.length, 0);
  assert.equal(h.gameReads, 0);
  assert.equal(h.docs.get("liveActivityEmailSessions/session-1").startedAt, createdAt + 60000);
  await h.invoke("in-progress", "finished", createdAt + 180000);
  assert.match(h.messages[0].text, /Duration: 2m 0s/);
});

test("late lifecycle events preserve earlier first-start and finish timestamps", async () => {
  const h = harness();
  await h.invoke("lobby", "in-progress", createdAt + 60000);
  await h.invoke("lobby", "in-progress", createdAt + 120000, "later-start");
  await h.invoke("in-progress", "finished", createdAt + 180000);
  await h.invoke(null, "lobby", createdAt);
  assert.equal(h.docs.get("liveActivityEmailSessions/session-1").startedAt, createdAt + 60000);
  assert.equal(h.docs.get("liveActivityEmailSessions/session-1").finishedAt, createdAt + 180000);
  assert.equal(h.docs.get("liveActivityEmailSessions/session-1").createdAt, createdAt);
});

test("irrelevant status writes, deletions and imported finished records send no emails", async () => {
  const h = harness();
  for (const [before, after] of [["lobby", "lobby"], ["finished", null], ["in-progress", "lobby"], [null, "finished"], ["lobby", "paused"]]) {
    await h.invoke(before, after);
  }
  assert.equal(h.gameReads, 0);
  assert.equal(h.messages.length, 0);
});

test("missing teacher profile falls back to Firebase Auth", async () => {
  const h = harness();
  h.docs.delete("users/host");
  await h.invoke(null, "lobby");
  assert.match(h.messages[0].subject, /Auth Teacher/);
  assert.equal(h.messages[0].replyTo, "auth@example.com");
});

test("a deleted game does not cause an empty notification", async () => {
  const h = harness(null);
  await h.invoke(null, "lobby");
  assert.equal(h.messages.length, 0);
});

test("SMTP failures are recorded and a redelivered event can retry", async () => {
  const h = harness();
  h.mailError = Object.assign(new Error("SMTP unavailable"), {code: "ECONNRESET"});
  await assert.rejects(h.invoke(null, "lobby"), /SMTP unavailable/);
  assert.equal(h.docs.get("liveActivityEmailDeliveries/session-1--launched").status, "failed");
  h.mailError = null;
  await h.invoke(null, "lobby");
  assert.equal(h.messages.length, 1);
  assert.equal(h.docs.get("liveActivityEmailDeliveries/session-1--launched").attempts, 2);
});

test("a failed receipt write after SMTP success cannot duplicate an email", async () => {
  const h = harness();
  h.receiptError = true;
  await h.invoke(null, "lobby");
  await h.invoke(null, "lobby");
  assert.equal(h.messages.length, 1);
  assert.equal(h.docs.get("liveActivityEmailDeliveries/session-1--launched").status, "sending");
});
