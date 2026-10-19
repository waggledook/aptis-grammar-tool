/* eslint-disable no-undef */
const assert = require("node:assert/strict");
const test = require("node:test");
const admin = require("firebase-admin");
const {reviewSeifAdminCancellation} = require("../index");
const db = admin.firestore();
const {resolveSeifAdminCancellationReview} = require("../seif-admin-access-policy");

test.after(async () => { await admin.app().delete(); });

function studentFixture() {
  const today = new Date().toISOString().slice(0, 10);
  const student = {
    siteAccess: {ote: {
      active: true, startDate: "2026-01-01", endDate: "2099-12-31",
      indefinite: false, managedBy: "manual",
    }},
    externalSystems: {seifAdmin: {status: "cancelled", cancelledAt: today}},
  };
  student.schoolCancellationReview = resolveSeifAdminCancellationReview({
    incomingSiteAccess: {ote: {}}, existingData: student, status: "cancelled",
    cancellationDate: today, todayIsoDate: today, detectedAt: `${today}T12:00:00Z`,
  });
  return student;
}

function mockTransaction(t, student, role = "admin") {
  const writes = [];
  t.mock.method(db, "runTransaction", async (callback) => callback({
    get: async (ref) => ref.path === "users/reviewer"
      ? {exists: true, data: () => ({role})}
      : {exists: true, data: () => student},
    update: (ref, value) => writes.push({path: ref.path, value}),
  }));
  return writes;
}

test("review callable requires authentication before reading or changing any access", async (t) => {
  const writes = mockTransaction(t, studentFixture());
  await assert.rejects(reviewSeifAdminCancellation.run({}, {}), {code: "unauthenticated"});
  assert.equal(writes.length, 0);
});

test("students and teachers cannot approve school cancellations", async (t) => {
  const student = studentFixture();
  for (const role of ["student", "teacher"]) {
    const writes = mockTransaction(t, student, role);
    await assert.rejects(reviewSeifAdminCancellation.run({
      uid: "student", reviewId: student.schoolCancellationReview.id, reviewVersion: student.schoolCancellationReview.version, decision: "apply",
    }, {auth: {uid: "reviewer"}}), {code: "permission-denied"});
    assert.equal(writes.length, 0);
    t.mock.restoreAll();
  }
});

test("an admin approval records the reviewer and updates access in one transaction", async (t) => {
  const student = studentFixture();
  const writes = mockTransaction(t, student);
  const result = await reviewSeifAdminCancellation.run({
    uid: "student", reviewId: student.schoolCancellationReview.id, reviewVersion: student.schoolCancellationReview.version, decision: "apply",
  }, {auth: {uid: "reviewer"}});
  assert.deepEqual(result, {reviewUpdated: false, status: "applied"});
  assert.equal(writes.length, 1);
  assert.equal(writes[0].path, "users/student");
  assert.equal(writes[0].value.schoolCancellationReview.decidedBy, "reviewer");
  assert.ok(writes[0].value.schoolCancellationReview.decidedAt);
  assert.equal(writes[0].value.siteAccess.ote.managedBy, "seifAdmin");
  assert.notEqual(writes[0].value.siteAccess.ote.endDate, "2099-12-31");
});

test("stale access changes refresh the review without approving or changing the new grant", async (t) => {
  const student = studentFixture();
  student.siteAccess.ote.endDate = "2100-12-31";
  const writes = mockTransaction(t, student);
  const result = await reviewSeifAdminCancellation.run({
    uid: "student", reviewId: student.schoolCancellationReview.id, reviewVersion: student.schoolCancellationReview.version, decision: "apply",
  }, {auth: {uid: "reviewer"}});
  assert.deepEqual(result, {reviewUpdated: true, status: "pending"});
  assert.equal(writes[0].value.siteAccess.ote.endDate, "2100-12-31");
  assert.equal(writes[0].value.schoolCancellationReview.decidedBy, undefined);
});

test("a second admin cannot overwrite a decision that has already been recorded", async (t) => {
  const student = studentFixture();
  student.schoolCancellationReview.status = "kept";
  const writes = mockTransaction(t, student);
  await assert.rejects(reviewSeifAdminCancellation.run({
    uid: "student", reviewId: student.schoolCancellationReview.id, reviewVersion: student.schoolCancellationReview.version, decision: "apply",
  }, {auth: {uid: "reviewer"}}), {code: "failed-precondition"});
  assert.equal(writes.length, 0);
});
