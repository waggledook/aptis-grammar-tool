/* eslint-disable no-undef */

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  getSeifAdminAccessStartDate,
  resolveSeifAdminSiteAccess,
} = require("../seif-admin-access-policy");

function automaticAccess({
  active = true,
  startDate = "2026-09-01",
  endDate = "2027-07-14",
} = {}) {
  return {
    active,
    startDate: active ? startDate : "",
    endDate: active ? endDate : "",
    indefinite: false,
  };
}

test("starts new access fourteen days before the course", () => {
  assert.equal(getSeifAdminAccessStartDate("2026-09-06", "2026-08-28"), "2026-08-23");
});

test("uses today when an active request omits the course start", () => {
  assert.equal(getSeifAdminAccessStartDate("", "2026-08-28"), "2026-08-28");
});

test("preserves continuous automatic access when the renewal gap is one month", () => {
  const result = resolveSeifAdminSiteAccess({
    incomingSiteAccess: {
      seifhub: automaticAccess({startDate: "2026-09-16", endDate: "2027-07-14"}),
    },
    existingData: {
      siteAccess: {
        seifhub: automaticAccess({startDate: "2025-09-01", endDate: "2026-09-14"}),
      },
      externalSystems: {seifAdmin: {courseEndDate: "2026-08-31"}},
    },
    status: "active",
    courseStartDate: "2026-09-30",
    todayIsoDate: "2026-08-28",
  });

  assert.equal(result.seifhub.startDate, "2025-09-01");
  assert.equal(result.seifhub.endDate, "2027-07-14");
  assert.equal(result.seifhub.managedBy, "seifAdmin");
});

test("schedules automatic access when the contract gap is more than one month", () => {
  const result = resolveSeifAdminSiteAccess({
    incomingSiteAccess: {
      seifhub: automaticAccess({startDate: "2026-09-17", endDate: "2027-07-14"}),
    },
    existingData: {
      siteAccess: {
        seifhub: automaticAccess({startDate: "2025-09-01", endDate: "2026-09-14"}),
      },
      externalSystems: {seifAdmin: {courseEndDate: "2026-08-31"}},
    },
    status: "active",
    courseStartDate: "2026-10-01",
    todayIsoDate: "2026-08-28",
  });

  assert.equal(result.seifhub.startDate, "2026-09-17");
});

test("ordinary sync preserves a protected manual app entry", () => {
  const manualAccess = {
    active: true,
    startDate: "2026-08-01",
    endDate: "2026-12-31",
    indefinite: false,
    managedBy: "manual",
  };
  const result = resolveSeifAdminSiteAccess({
    incomingSiteAccess: {aptisTrainer: automaticAccess({endDate: "2027-07-14"})},
    existingData: {siteAccess: {aptisTrainer: manualAccess}},
    status: "active",
    courseStartDate: "2026-09-01",
    todayIsoDate: "2026-08-28",
  });

  assert.deepEqual(result.aptisTrainer, {
    ...manualAccess,
    endDate: "2027-07-14",
  });
});

test("a school sync cannot shorten a manual expiry or re-enable a manual revocation", () => {
  const manualAccess = {
    active: true,
    startDate: "2026-08-01",
    endDate: "2027-12-31",
    indefinite: false,
    managedBy: "manual",
  };
  const unchanged = resolveSeifAdminSiteAccess({
    incomingSiteAccess: {aptisTrainer: automaticAccess({endDate: "2027-07-14"})},
    existingData: {siteAccess: {aptisTrainer: manualAccess}},
    status: "active",
    courseStartDate: "2026-09-01",
    todayIsoDate: "2026-08-28",
  });
  assert.deepEqual(unchanged.aptisTrainer, manualAccess);

  const manuallyRevoked = {
    active: false,
    startDate: "",
    endDate: "",
    indefinite: false,
    managedBy: "manual",
  };
  const revokedResult = resolveSeifAdminSiteAccess({
    incomingSiteAccess: {aptisTrainer: automaticAccess()},
    existingData: {siteAccess: {aptisTrainer: manuallyRevoked}},
    status: "active",
    courseStartDate: "2026-09-01",
    todayIsoDate: "2026-08-28",
  });
  assert.deepEqual(revokedResult.aptisTrainer, manuallyRevoked);
});

test("legacy indefinite access is protected", () => {
  const legacyManualAccess = {
    active: true,
    startDate: "2026-01-01",
    endDate: "",
    indefinite: true,
  };
  const result = resolveSeifAdminSiteAccess({
    incomingSiteAccess: {ote: automaticAccess({active: false})},
    existingData: {siteAccess: {ote: legacyManualAccess}},
    status: "completed",
    courseStartDate: "2026-09-01",
    todayIsoDate: "2026-08-28",
  });

  assert.deepEqual(result.ote, legacyManualAccess);
});

test("legacy dated access that differs from the last sync is protected", () => {
  const legacyManualAccess = {
    active: true,
    startDate: "2026-08-01",
    endDate: "2026-12-31",
    indefinite: false,
  };
  const result = resolveSeifAdminSiteAccess({
    incomingSiteAccess: {aptisTrainer: automaticAccess({active: false})},
    existingData: {
      siteAccess: {aptisTrainer: legacyManualAccess},
      externalSystems: {
        seifAdmin: {
          status: "active",
          courseStartDate: "2026-09-01",
          courseEndDate: "2027-06-30",
          accessEndDate: "2027-07-14",
        },
      },
    },
    status: "active",
    courseStartDate: "2026-09-01",
    todayIsoDate: "2026-08-28",
  });

  assert.deepEqual(result.aptisTrainer, legacyManualAccess);
});

test("explicit cancellation gives active access a fourteen-day grace period", () => {
  const result = resolveSeifAdminSiteAccess({
    incomingSiteAccess: {ote: automaticAccess({active: false})},
    existingData: {
      siteAccess: {
        ote: {
          active: true,
          startDate: "2026-01-01",
          endDate: "",
          indefinite: true,
          managedBy: "manual",
        },
      },
    },
    status: "cancelled",
    courseStartDate: "",
    todayIsoDate: "2026-08-28",
    cancellationDate: "2026-08-28",
  });

  assert.deepEqual(result.ote, {
    active: true,
    startDate: "2026-01-01",
    endDate: "2026-09-11",
    indefinite: false,
    managedBy: "manual",
  });
});

test("cancellation does not extend an earlier expiry and repeated syncs do not reset the cutoff", () => {
  const existingAccess = {
    active: true,
    startDate: "2026-01-01",
    endDate: "2026-09-05",
    indefinite: false,
    managedBy: "seifAdmin",
  };
  const capped = resolveSeifAdminSiteAccess({
    incomingSiteAccess: {seifhub: automaticAccess({active: false})},
    existingData: {siteAccess: {seifhub: existingAccess}},
    status: "cancelled",
    courseStartDate: "",
    todayIsoDate: "2026-08-28",
    cancellationDate: "2026-08-28",
  });
  assert.equal(capped.seifhub.endDate, "2026-09-05");

  const expired = resolveSeifAdminSiteAccess({
    incomingSiteAccess: {seifhub: automaticAccess({active: false})},
    existingData: {siteAccess: {seifhub: existingAccess}},
    status: "cancelled",
    courseStartDate: "",
    todayIsoDate: "2026-09-12",
    cancellationDate: "2026-08-28",
  });
  assert.equal(expired.seifhub.active, false);
});
