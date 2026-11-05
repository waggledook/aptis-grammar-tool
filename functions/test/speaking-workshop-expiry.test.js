/* eslint-disable no-undef */
const assert = require("node:assert/strict");
const test = require("node:test");
const admin = require("firebase-admin");
const {
  getSpeakingWorkshopAccess,
  updateSpeakingWorkshopSession,
} = require("../index");
const db = admin.firestore();
const DAY_MS = 86400000;
const sessionId = "existingWorkshop123";

test.after(async () => { await admin.app().delete(); });

for (const phase of ["live", "preparation"]) {
  test(`an existing ${phase} session gets 28 days from its actual end`, async (t) => {
    const startsAt = admin.firestore.Timestamp.fromMillis(Date.now() - DAY_MS);
    const session = {phase, startsAt, topicIds: ["relationships-family"]};
    const snap = {id: sessionId, exists: true, data: () => session};
    const sessionRef = {get: async () => snap};
    t.mock.method(db, "doc", () => ({get: async () => ({data: () => ({role: "teacher"})})}));
    t.mock.method(db, "collection", () => ({doc: () => sessionRef}));
    t.mock.method(db, "runTransaction", async (callback) => callback({
      get: async () => snap,
      update: (ref, value) => {
        assert.equal(ref, sessionRef);
        Object.assign(session, value);
      },
    }));

    const before = Date.now();
    const result = await updateSpeakingWorkshopSession.run({
      sessionId, action: "end",
    }, {auth: {uid: "teacher"}});

    assert.equal(session.phase, "review");
    assert.equal(session.registrationOpen, false);
    assert.ok(session.endedAt.toMillis() >= before);
    assert.ok(session.endedAt.toMillis() <= Date.now());
    assert.equal(session.reviewUntil.toMillis() - session.endedAt.toMillis(), 28 * DAY_MS);
    assert.equal(result.session.reviewUntil, session.reviewUntil.toDate().toISOString());

    const savedExpiry = session.reviewUntil;
    await assert.rejects(updateSpeakingWorkshopSession.run({
      sessionId, action: "end",
    }, {auth: {uid: "teacher"}}), {code: "failed-precondition"});
    assert.equal(session.reviewUntil, savedExpiry);
  });
}

test("access checks respect saved expiry dates for already-ended sessions", async (t) => {
  const now = Date.now();
  const endedAt = admin.firestore.Timestamp.fromMillis(now - 15 * DAY_MS);
  const sessions = [
    {id: "legacyExpired", reviewUntil: now - DAY_MS},
    {id: "legacyActive", reviewUntil: now + DAY_MS},
    {id: "fourWeekReview", reviewUntil: now + 13 * DAY_MS},
  ].map(({id, reviewUntil}) => ({
    id,
    exists: true,
    data: () => ({
      phase: "review", endedAt,
      reviewUntil: admin.firestore.Timestamp.fromMillis(reviewUntil),
      topicIds: ["relationships-family"],
    }),
  }));
  const memberships = {empty: false, docs: sessions.map(({id}) => ({id}))};
  t.mock.method(db, "doc", () => ({
    get: async () => ({data: () => ({role: "student"})}),
    collection: () => ({limit: () => ({get: async () => memberships})}),
  }));
  t.mock.method(db, "collection", () => ({doc: (id) => ({id})}));
  t.mock.method(db, "getAll", async () => sessions);

  const result = await getSpeakingWorkshopAccess.run({}, {auth: {uid: "student"}});

  assert.deepEqual(result.sessions.map(({id}) => id), ["legacyActive", "fourWeekReview"]);
  assert.equal(result.sessions[0].reviewUntil, new Date(now + DAY_MS).toISOString());
  assert.equal(result.topicAccess["relationships-family"].reviewUntil,
    new Date(now + 13 * DAY_MS).toISOString());
});
