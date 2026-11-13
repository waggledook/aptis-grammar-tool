/* eslint-disable no-undef */
const assert = require("node:assert/strict");
const test = require("node:test");
const admin = require("firebase-admin");
const {updateSpeakingWorkshopSession, getSpeakingWorkshopAccess} = require("../index");
const {mockWorkshop} = require("./helpers/speaking-workshop-fixture");
const DAY_MS = 86400000;
const context = {auth: {uid: "admin123", token: {email: "admin@example.com"}}};
const stamp = (ms) => admin.firestore.Timestamp.fromMillis(ms);

function endedSession(startsAt) {
  return {
    label: "Friday workshop", phase: "review", startsAt,
    startedAt: stamp(Date.now() - DAY_MS),
    endedAt: stamp(Date.now() - DAY_MS + 3000),
    reviewUntil: stamp(Date.now() - 1000),
    registrationOpen: false, attendeeCount: 4, joinCode: "ABC234",
    topicIds: ["food-eating"],
  };
}

test.after(async () => { await admin.app().delete(); });

test("teachers cannot restore workshops, including through a direct callable request", async (t) => {
  const {session, sessionId, audits} = mockWorkshop(t, endedSession(stamp(Date.now() + DAY_MS)), "teacher");
  await assert.rejects(updateSpeakingWorkshopSession.run({sessionId, action: "restore"}, context), {code: "permission-denied"});
  assert.equal(session.phase, "review");
  assert.equal(audits.length, 0);
});

test("restoring a future workshop reopens preparation and preserves its link and participants", async (t) => {
  const startsAt = stamp(Date.now() + DAY_MS);
  const initial = endedSession(startsAt);
  const {session, sessionId, audits} = mockWorkshop(t, initial);
  const result = await updateSpeakingWorkshopSession.run({sessionId, action: "restore"}, context);
  assert.equal(session.phase, "preparation");
  assert.equal(session.registrationOpen, true);
  assert.equal(session.joinCode, "ABC234");
  assert.equal(session.attendeeCount, 4);
  assert.equal(session.startsAt, startsAt);
  for (const key of ["startedAt", "endedAt", "reviewUntil"]) assert.equal(key in session, false);
  assert.equal(result.session.phase, "preparation");
  assert.equal(result.session.reviewUntil, null);
  assert.equal(result.session.lastAction.actorEmail, "admin@example.com");
  assert.equal(audits.length, 1);
  assert.equal(audits[0].action, "restore");
  assert.equal(audits[0].actorRole, "admin");
  assert.equal(audits[0].previousEndedAt, initial.endedAt);
  assert.equal(audits[0].previousReviewUntil, initial.reviewUntil);
  assert.equal(result.session.actionHistory[0].action, "restore");
});

test("restoring an expired workshop whose scheduled start has passed returns it to live", async (t) => {
  const initial = endedSession(stamp(Date.now() - 30 * DAY_MS));
  const {session, sessionId} = mockWorkshop(t, initial);
  const result = await updateSpeakingWorkshopSession.run({sessionId, action: "restore"}, context);
  assert.equal(result.session.phase, "live");
  assert.equal(session.startedAt, initial.startedAt);
  assert.equal(session.registrationOpen, true);
  assert.equal("reviewUntil" in session, false);
});

test("restoring a legacy workshop without a scheduled start returns it to live", async (t) => {
  const initial = endedSession(null);
  delete initial.startedAt;
  const {session, sessionId} = mockWorkshop(t, initial);
  await updateSpeakingWorkshopSession.run({sessionId, action: "restore"}, context);
  assert.equal(session.phase, "live");
  assert.ok(session.startedAt.toMillis() <= Date.now());
});

test("active workshops cannot be restored and failed requests do not add audit events", async (t) => {
  const {sessionId, audits} = mockWorkshop(t, {phase: "preparation"});
  await assert.rejects(updateSpeakingWorkshopSession.run({sessionId, action: "restore"}, context), {code: "failed-precondition"});
  assert.equal(audits.length, 0);
});

test("start, end, restore and end again retain each actor and give a fresh four-week review", async (t) => {
  const {session, sessionId, audits} = mockWorkshop(t, {
    label: "Friday workshop", phase: "preparation", topicIds: ["food-eating"],
    startsAt: stamp(Date.now() - DAY_MS), registrationOpen: true,
  });
  const teacher = {auth: {uid: "teacher123", token: {email: "teacher@example.com"}}};
  await updateSpeakingWorkshopSession.run({sessionId, action: "start"}, teacher);
  await updateSpeakingWorkshopSession.run({sessionId, action: "end"}, teacher);
  await updateSpeakingWorkshopSession.run({sessionId, action: "restore"}, context);
  await updateSpeakingWorkshopSession.run({sessionId, action: "end"}, teacher);
  assert.deepEqual(audits.map((event) => event.action), ["start", "end", "restore", "end"]);
  assert.deepEqual(audits.map((event) => event.actorEmail), [
    "teacher@example.com", "teacher@example.com", "admin@example.com", "teacher@example.com",
  ]);
  assert.equal(session.reviewUntil.toMillis() - session.endedAt.toMillis(), 28 * DAY_MS);
});

test("student session responses do not expose staff action identities", async (t) => {
  const db = admin.firestore();
  const session = {
    phase: "preparation", topicIds: ["food-eating"],
    lastAction: {action: "restore", actorUid: "admin123", actorEmail: "admin@example.com"},
  };
  t.mock.method(db, "doc", () => ({
    get: async () => ({data: () => ({role: "student"})}),
    collection: () => ({limit: () => ({get: async () => ({empty: false, docs: [{id: "workshop123"}]})})}),
  }));
  t.mock.method(db, "collection", () => ({doc: () => ({})}));
  t.mock.method(db, "getAll", async () => [{id: "workshop123", exists: true, data: () => session}]);
  const result = await getSpeakingWorkshopAccess.run({}, {auth: {uid: "student123"}});
  assert.equal(result.sessions.length, 1);
  assert.equal("lastAction" in result.sessions[0], false);
  assert.equal("actionHistory" in result.sessions[0], false);
});
