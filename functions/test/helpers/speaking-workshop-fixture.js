/* eslint-disable no-undef */
const assert = require("node:assert/strict");
const admin = require("firebase-admin");

const sessionId = "existingWorkshop123";

function mockWorkshop(t, initial, role = "admin") {
  const db = admin.firestore();
  const session = {...initial};
  const audits = [];
  const auditRef = {path: `speakingWorkshopAudit/${sessionId}/events/action123`};
  const snap = {id: sessionId, exists: true, data: () => session};
  const sessionRef = {id: sessionId, get: async () => snap};
  const auditCollection = {
    doc: () => auditRef,
    add: async (value) => { audits.push(resolve(value)); },
    orderBy: () => ({limit: () => ({get: async () => ({
      docs: audits.map((data, index) => ({id: String(index), data: () => data})).reverse(),
    })})}),
  };
  t.mock.method(db, "doc", () => ({get: async () => ({data: () => ({role})})}));
  t.mock.method(db, "collection", (name) => {
    if (name === "speakingWorkshopSessions") return {doc: () => sessionRef};
    assert.equal(name, "speakingWorkshopAudit");
    return {doc: () => ({collection: () => auditCollection})};
  });
  function resolve(value) {
    if (value?.isEqual?.(admin.firestore.FieldValue.serverTimestamp())) {
      return admin.firestore.Timestamp.now();
    }
    if (value?.constructor === Object) {
      return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, resolve(entry)]));
    }
    return value;
  }
  t.mock.method(db, "runTransaction", async (callback) => {
    const updates = [];
    const events = [];
    const result = await callback({
      get: async () => snap,
      update: (ref, value) => {
        assert.equal(ref, sessionRef);
        updates.push(value);
      },
      set: (ref, value) => {
        assert.equal(ref, auditRef);
        events.push(value);
      },
    });
    // Apply only after a successful callback, like an atomic transaction.
    updates.forEach((update) => Object.entries(update).forEach(([key, value]) => {
      if (value?.isEqual?.(admin.firestore.FieldValue.delete())) delete session[key];
      else session[key] = resolve(value);
    }));
    audits.push(...events.map(resolve));
    return result;
  });
  return {session, audits, sessionId, snap, sessionRef, auditRef};
}

module.exports = {mockWorkshop};
