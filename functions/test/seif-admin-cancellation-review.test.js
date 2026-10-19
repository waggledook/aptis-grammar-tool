/* eslint-disable no-undef */
const assert = require("node:assert/strict");
const test = require("node:test");
const {
  resolveSeifAdminSiteAccess,
  resolveSeifAdminCancellationReview,
  resolveSeifAdminCancellationDecision,
} = require("../seif-admin-access-policy");

const manual = {
  active: true, startDate: "2026-08-25", endDate: "2026-11-29",
  indefinite: false, managedBy: "manual",
};
const automatic = {...manual, managedBy: "seifAdmin"};
const disabled = {
  active: false, startDate: "", endDate: "", indefinite: false, managedBy: "seifAdmin",
};
const incoming = {seifhub: disabled, aptisTrainer: disabled, ote: disabled};

function sync(existingData, {status = "cancelled", date = "2026-10-14", cancellationDate} = {}) {
  const previous = existingData.externalSystems?.seifAdmin || {};
  const cutoffStart = cancellationDate || (status === "cancelled" ? previous.cancelledAt || date : "");
  const args = {
    incomingSiteAccess: status === "cancelled" ? incoming : {
      seifhub: {...automatic, endDate: "2026-10-15"},
      aptisTrainer: disabled,
      ote: {...automatic, endDate: "2026-10-15"},
    },
    existingData, status, cancellationDate: cutoffStart, todayIsoDate: date,
    detectedAt: `${date}T12:00:00Z`, courseStartDate: "2026-09-08",
  };
  return {
    ...existingData,
    siteAccess: resolveSeifAdminSiteAccess(args),
    schoolCancellationReview: resolveSeifAdminCancellationReview(args),
    externalSystems: {seifAdmin: {...previous, status, cancelledAt: status === "cancelled" ? cutoffStart : ""}},
  };
}

function decide(data, decision, date = "2026-10-14") {
  const result = resolveSeifAdminCancellationDecision({
    existingData: data, decision, reviewId: data.schoolCancellationReview.id,
    reviewVersion: data.schoolCancellationReview.version, todayIsoDate: date,
  });
  return {...data, siteAccess: result.siteAccess, schoolCancellationReview: result.review, reviewUpdated: result.reviewUpdated};
}

test("regression: September cancellation cannot erase October manual grants or expose them to an expired renewal", () => {
  const before = {
    siteAccess: {seifhub: manual, ote: manual, aptisTrainer: disabled},
    externalSystems: {seifAdmin: {status: "cancelled", cancelledAt: "2026-09-28"}},
  };
  const cancelled = sync(before);
  assert.deepEqual(cancelled.siteAccess.seifhub, manual);
  assert.deepEqual(cancelled.siteAccess.ote, manual);
  assert.equal(cancelled.schoolCancellationReview.status, "pending");
  assert.equal(cancelled.schoolCancellationReview.cancellationDate, "2026-09-28");
  assert.equal(cancelled.schoolCancellationReview.entries.ote.proposedAccess.active, false);
  const renewed = sync(cancelled, {status: "active", date: "2026-10-16"});
  assert.deepEqual(renewed.siteAccess.ote, manual);
  assert.equal(renewed.schoolCancellationReview.status, "superseded");
});

test("repeated cancellations update one pending review without changing the grace deadline", () => {
  const first = sync({siteAccess: {ote: manual}});
  const repeated = sync(first, {date: "2026-10-15"});
  assert.equal(repeated.schoolCancellationReview.id, first.schoolCancellationReview.id);
  assert.equal(repeated.schoolCancellationReview.detectedAt, first.schoolCancellationReview.detectedAt);
  assert.equal(repeated.schoolCancellationReview.version, first.schoolCancellationReview.version);
  assert.equal(repeated.schoolCancellationReview.entries.ote.proposedAccess.endDate, "2026-10-28");
  assert.deepEqual(repeated.siteAccess.ote, manual);
});

test("keeping the override records a decision that repeated cancellations respect", () => {
  const kept = decide(sync({siteAccess: {ote: manual}}), "keep");
  assert.equal(kept.schoolCancellationReview.status, "kept");
  assert.equal(kept.schoolCancellationReview.decision, "keep");
  const repeated = sync(kept, {date: "2026-10-30"});
  assert.equal(repeated.schoolCancellationReview.status, "kept");
  assert.deepEqual(repeated.siteAccess.ote, manual);
});

test("applying the cancellation caps only the reviewed apps and returns them to automatic management", () => {
  const pending = sync({siteAccess: {ote: manual, seifhub: automatic}});
  const applied = decide(pending, "apply");
  assert.equal(applied.schoolCancellationReview.status, "applied");
  assert.equal(applied.siteAccess.ote.endDate, "2026-10-28");
  assert.equal(applied.siteAccess.ote.managedBy, "seifAdmin");
  assert.deepEqual(applied.siteAccess.seifhub, pending.siteAccess.seifhub);
  const repeated = sync(applied, {date: "2026-10-30"});
  assert.equal(repeated.siteAccess.ote.active, false);
  assert.notEqual(repeated.schoolCancellationReview.status, "pending");
});

test("approving after the original grace period ends first refreshes the proposal, then disables access", () => {
  const pending = sync({siteAccess: {ote: manual}});
  const refreshed = decide(pending, "apply", "2026-10-30");
  assert.equal(refreshed.reviewUpdated, true);
  assert.deepEqual(refreshed.siteAccess.ote, manual);
  assert.equal(refreshed.schoolCancellationReview.entries.ote.proposedAccess.active, false);
  const applied = decide(refreshed, "apply", "2026-10-30");
  assert.equal(applied.reviewUpdated, false);
  assert.equal(applied.siteAccess.ote.active, false);
});

test("a new manual edit must be reviewed before a stale proposal can be approved", () => {
  const pending = sync({siteAccess: {ote: manual}});
  pending.siteAccess.ote = {...manual, endDate: "2026-12-31"};
  const result = decide(pending, "apply");
  assert.equal(result.reviewUpdated, true);
  assert.equal(result.schoolCancellationReview.status, "pending");
  assert.equal(result.schoolCancellationReview.entries.ote.manualAccess.endDate, "2026-12-31");
  assert.equal(result.siteAccess.ote.endDate, "2026-12-31");
});

test("a newer sync proposal cannot be approved with the version an admin previously saw", () => {
  const pending = sync({siteAccess: {ote: manual}});
  const changed = sync({...pending, siteAccess: {...pending.siteAccess, ote: {...manual, endDate: "2026-12-31"}}});
  assert.equal(changed.schoolCancellationReview.id, pending.schoolCancellationReview.id);
  assert.equal(changed.schoolCancellationReview.version, pending.schoolCancellationReview.version + 1);
  const result = resolveSeifAdminCancellationDecision({
    existingData: changed, reviewId: pending.schoolCancellationReview.id,
    reviewVersion: pending.schoolCancellationReview.version, decision: "apply", todayIsoDate: "2026-10-14",
  });
  assert.equal(result.reviewUpdated, true);
  assert.equal(result.siteAccess.ote.endDate, "2026-12-31");
  assert.equal(result.review.status, "pending");
});

test("indefinite manual grants require review; manual revocations are preserved without an alert", () => {
  const unlimited = {...manual, endDate: "", indefinite: true};
  const revoked = {...disabled, managedBy: "manual"};
  const result = sync({siteAccess: {ote: unlimited, seifhub: revoked}});
  assert.deepEqual(result.siteAccess.ote, unlimited);
  assert.deepEqual(result.siteAccess.seifhub, revoked);
  assert.deepEqual(Object.keys(result.schoolCancellationReview.entries), ["ote"]);
});

test("automatic access keeps the ordinary cancellation grace period without admin review", () => {
  const first = sync({siteAccess: {ote: automatic}});
  assert.equal(first.schoolCancellationReview, null);
  assert.equal(first.siteAccess.ote.endDate, "2026-10-28");
  const later = sync(first, {date: "2026-10-30"});
  assert.equal(later.siteAccess.ote.active, false);
  assert.equal(later.schoolCancellationReview, null);
});

test("a cancellation that would not reduce manual access does not create an alert", () => {
  const shortManual = {...manual, endDate: "2026-10-20"};
  const result = sync({siteAccess: {ote: shortManual}});
  assert.deepEqual(result.siteAccess.ote, shortManual);
  assert.equal(result.schoolCancellationReview, null);
});

test("manual access expires on its own schedule while a review is pending", () => {
  const first = sync({siteAccess: {ote: {...manual, endDate: "2026-10-29"}}});
  const later = sync(first, {date: "2026-10-30"});
  assert.equal(later.siteAccess.ote.endDate, "2026-10-29");
  assert.equal(later.schoolCancellationReview.status, "superseded");
});

test("a new cancellation episode after reactivation needs its own decision", () => {
  const kept = decide(sync({siteAccess: {ote: manual}}), "keep");
  const active = sync(kept, {status: "active", date: "2026-10-14"});
  const newCancellation = sync(active, {date: "2026-10-15"});
  assert.equal(newCancellation.schoolCancellationReview.status, "pending");
  assert.notEqual(newCancellation.schoolCancellationReview.id, kept.schoolCancellationReview.id);
});

test("resolved or superseded reviews and invalid decisions cannot change access", () => {
  const pending = sync({siteAccess: {ote: manual}});
  const request = {existingData: pending, reviewId: "stale", decision: "apply", todayIsoDate: "2026-10-14"};
  assert.throws(() => resolveSeifAdminCancellationDecision(request), /no longer awaiting/);
  assert.throws(() => decide(pending, "unknown"), /Choose whether/);
  assert.throws(() => decide(decide(pending, "keep"), "apply"), /no longer awaiting/);
  assert.throws(() => decide(sync(pending, {status: "active"}), "apply"), /no longer awaiting/);
});
