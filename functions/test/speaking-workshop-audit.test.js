/* eslint-disable no-undef */
const assert = require("node:assert/strict");
const test = require("node:test");
const admin = require("firebase-admin");
const {
  createSpeakingWorkshopSession,
  deleteSpeakingWorkshopSession,
  listSpeakingWorkshopSessions,
} = require("../index");
const {mockWorkshop} = require("./helpers/speaking-workshop-fixture");
const db = admin.firestore();
const context = {auth: {uid: "admin123", token: {email: "admin@example.com"}}};

test.after(async () => { await admin.app().delete(); });

test("creation saves the workshop and creator audit in one batch", async (t) => {
  const session = {};
  const sessionRef = {id: "createdWorkshop123", get: async () => ({
    id: "createdWorkshop123", data: () => session,
  })};
  const auditRef = {path: "speakingWorkshopAudit/createdWorkshop123/events/event123"};
  const writes = [];
  let committed = false;
  t.mock.method(db, "doc", () => ({get: async () => ({data: () => ({role: "teacher"})})}));
  t.mock.method(db, "collection", (name) => name === "speakingWorkshopSessions" ? {
    doc: () => sessionRef,
    where: () => ({limit: () => ({get: async () => ({empty: true})})}),
  } : {doc: () => ({collection: () => ({doc: () => auditRef})})});
  t.mock.method(db, "batch", () => ({
    set: (ref, data) => writes.push({ref, data}),
    commit: async () => {
      committed = true;
      Object.assign(session, writes.find((write) => write.ref === sessionRef).data);
    },
  }));
  const result = await createSpeakingWorkshopSession.run({
    label: "Friday workshop", topicIds: ["food-eating"], startsAt: "2026-11-20T17:00:00Z",
  }, context);
  assert.equal(committed, true);
  assert.equal(writes.length, 2);
  assert.equal(writes[1].ref, auditRef);
  assert.equal(writes[1].data.actorUid, "admin123");
  assert.equal(writes[1].data.actorEmail, "admin@example.com");
  assert.equal(writes[1].data.action, "create");
  assert.equal(result.session.lastAction.action, "create");
});

test("deletion retains a request and completion audit outside the deleted session", async (t) => {
  const {sessionId, sessionRef, auditRef, audits} = mockWorkshop(t, {phase: "review", label: "Friday workshop"});
  sessionRef.collection = () => ({get: async () => ({docs: []})});
  t.mock.method(db, "bulkWriter", () => ({close: async () => {}}));
  t.mock.method(db, "recursiveDelete", async (ref) => {
    assert.equal(ref, sessionRef);
    assert.equal(audits[0].action, "delete_requested");
    assert.ok(!auditRef.path.startsWith(`speakingWorkshopSessions/${sessionId}/`));
  });
  const result = await deleteSpeakingWorkshopSession.run({sessionId}, context);
  assert.equal(result.ok, true);
  assert.deepEqual(audits.map((event) => event.action), ["delete_requested", "delete"]);
  assert.ok(audits.every((event) => event.actorEmail === "admin@example.com"));
});

test("session listing returns staff-visible action history", async (t) => {
  const event = {
    action: "end", actorUid: "teacher123", actorEmail: "teacher@example.com", actorRole: "teacher",
    at: admin.firestore.Timestamp.now(), fromPhase: "live", toPhase: "review",
  };
  const sessionSnap = {id: "workshop123", data: () => ({phase: "review", lastAction: event}), ref: {
    collection: () => ({orderBy: () => ({limit: () => ({get: async () => ({docs: []})})})}),
  }};
  t.mock.method(db, "doc", () => ({get: async () => ({data: () => ({role: "admin"})})}));
  t.mock.method(db, "collection", (name) => name === "speakingWorkshopSessions" ? {
    orderBy: () => ({limit: () => ({get: async () => ({docs: [sessionSnap]})})}),
  } : {doc: () => ({collection: () => ({orderBy: () => ({limit: () => ({get: async () => ({
    docs: [{id: "audit123", data: () => event}],
  })})})})})});
  const result = await listSpeakingWorkshopSessions.run({}, context);
  assert.equal(result.sessions[0].actionHistory[0].actorEmail, "teacher@example.com");
  assert.equal(result.sessions[0].lastAction.actorUid, "teacher123");
});
