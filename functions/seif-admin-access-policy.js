/* eslint-disable no-undef */

const SEIF_ADMIN_EARLY_ACCESS_DAYS = 14;
const SEIF_ADMIN_CONTINUITY_MONTHS = 1;
const SEIF_ADMIN_CANCELLATION_GRACE_DAYS = 14;

function addIsoDays(isoDate, days) {
  const [year, month, day] = String(isoDate || "").split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function addIsoMonths(isoDate, months) {
  const [year, month, day] = String(isoDate || "").split("-").map(Number);
  const targetMonthIndex = month - 1 + months;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const normalizedMonthIndex = ((targetMonthIndex % 12) + 12) % 12;
  const lastDayOfTargetMonth = new Date(
    Date.UTC(targetYear, normalizedMonthIndex + 1, 0)
  ).getUTCDate();
  const date = new Date(
    Date.UTC(targetYear, normalizedMonthIndex, Math.min(day, lastDayOfTargetMonth))
  );
  return date.toISOString().slice(0, 10);
}

function getSeifAdminAccessStartDate(courseStartDate, todayIsoDate) {
  return courseStartDate
    ? addIsoDays(courseStartDate, -SEIF_ADMIN_EARLY_ACCESS_DAYS)
    : todayIsoDate;
}

function isProtectedManualAccess(
  rawAccess,
  {accessKey = "", existingSeifAdmin = {}} = {}
) {
  if (!rawAccess || typeof rawAccess !== "object") return false;
  if (rawAccess.managedBy === "manual") return true;
  if (rawAccess.managedBy === "seifAdmin") return false;

  // The school sync has never created indefinite entries. Preserve legacy
  // indefinite grants that predate the managedBy field as manual overrides.
  if (rawAccess.indefinite === true) return true;

  // Before managedBy existed, admin edits could be identified only by their
  // difference from the last school-managed dates. Preserve those dated legacy
  // overrides during the migration as well.
  if (!rawAccess.active && (rawAccess.startDate || rawAccess.endDate)) return true;
  if (
    existingSeifAdmin.courseStartDate &&
    (rawAccess.startDate || "") !== existingSeifAdmin.courseStartDate
  ) {
    return true;
  }
  if (
    existingSeifAdmin.accessEndDate &&
    (rawAccess.endDate || "") !== existingSeifAdmin.accessEndDate
  ) {
    return true;
  }

  const schoolStatusKeepsHubActive =
    existingSeifAdmin.status === "active" || existingSeifAdmin.status === "completed";
  return accessKey === "seifhub" && schoolStatusKeepsHubActive && !rawAccess.active;
}

function normalizeAutomaticAccess(rawAccess) {
  return {
    active: !!rawAccess?.active,
    startDate: rawAccess?.startDate || "",
    endDate: rawAccess?.endDate || "",
    indefinite: false,
    managedBy: "seifAdmin",
  };
}

function mergeManualAccessWithSchoolExtension(existingAccess, incomingAccess) {
  if (!existingAccess?.active || existingAccess.indefinite) return existingAccess;
  if (!incomingAccess?.active || !incomingAccess.endDate) return existingAccess;
  if (existingAccess.endDate && incomingAccess.endDate <= existingAccess.endDate) {
    return existingAccess;
  }

  return {
    ...existingAccess,
    endDate: incomingAccess.endDate,
  };
}

function buildCancelledAccess(existingAccess, cancellationDate, todayIsoDate) {
  if (!existingAccess || typeof existingAccess !== "object" || !existingAccess.active) {
    return {
      active: false,
      startDate: "",
      endDate: "",
      indefinite: false,
      managedBy: "seifAdmin",
    };
  }

  const cancellationEndDate = addIsoDays(
    cancellationDate,
    SEIF_ADMIN_CANCELLATION_GRACE_DAYS
  );
  if (todayIsoDate > cancellationEndDate) {
    return {
      active: false,
      startDate: "",
      endDate: "",
      indefinite: false,
      managedBy: "seifAdmin",
    };
  }
  if (existingAccess.endDate && existingAccess.endDate < cancellationDate) {
    return {
      active: false,
      startDate: "",
      endDate: "",
      indefinite: false,
      managedBy: "seifAdmin",
    };
  }

  return {
    ...existingAccess,
    active: true,
    endDate:
      existingAccess.endDate && existingAccess.endDate < cancellationEndDate
        ? existingAccess.endDate
        : cancellationEndDate,
    indefinite: false,
  };
}

function shouldKeepContinuousAccess({
  existingAccess,
  previousCourseEndDate,
  nextCourseStartDate,
  todayIsoDate,
}) {
  if (!existingAccess || typeof existingAccess !== "object") return false;
  if (!existingAccess.active || !existingAccess.startDate) return false;
  if (existingAccess.endDate && todayIsoDate > existingAccess.endDate) return false;
  if (!previousCourseEndDate || !nextCourseStartDate) return false;

  const continuityLimit = addIsoMonths(
    previousCourseEndDate,
    SEIF_ADMIN_CONTINUITY_MONTHS
  );
  return nextCourseStartDate <= continuityLimit;
}

function resolveSeifAdminSiteAccess({
  incomingSiteAccess,
  existingData = {},
  status,
  courseStartDate,
  todayIsoDate,
  cancellationDate = todayIsoDate,
}) {
  const existingSiteAccess = existingData.siteAccess || {};
  const previousCourseEndDate =
    existingData.externalSystems?.seifAdmin?.courseEndDate || "";
  const existingSeifAdmin = existingData.externalSystems?.seifAdmin || {};
  const isCancellation = status === "cancelled";

  return Object.fromEntries(
    Object.entries(incomingSiteAccess || {}).map(([accessKey, incomingAccess]) => {
      const existingAccess = existingSiteAccess[accessKey];

      if (isCancellation) {
        return [
          accessKey,
          buildCancelledAccess(existingAccess, cancellationDate, todayIsoDate),
        ];
      }

      if (
        isProtectedManualAccess(existingAccess, {accessKey, existingSeifAdmin})
      ) {
        return [
          accessKey,
          mergeManualAccessWithSchoolExtension(existingAccess, incomingAccess),
        ];
      }

      const resolvedAccess = normalizeAutomaticAccess(incomingAccess);
      if (!resolvedAccess.active) return [accessKey, resolvedAccess];

      const shouldPreserveExistingStart =
        (!courseStartDate && existingAccess?.active && existingAccess.startDate) ||
        shouldKeepContinuousAccess({
          existingAccess,
          previousCourseEndDate,
          nextCourseStartDate: courseStartDate,
          todayIsoDate,
        });

      if (shouldPreserveExistingStart) {
        resolvedAccess.startDate = existingAccess.startDate;
      }

      return [accessKey, resolvedAccess];
    })
  );
}

module.exports = {
  SEIF_ADMIN_CONTINUITY_MONTHS,
  SEIF_ADMIN_CANCELLATION_GRACE_DAYS,
  SEIF_ADMIN_EARLY_ACCESS_DAYS,
  addIsoDays,
  addIsoMonths,
  getSeifAdminAccessStartDate,
  buildCancelledAccess,
  isProtectedManualAccess,
  mergeManualAccessWithSchoolExtension,
  resolveSeifAdminSiteAccess,
  shouldKeepContinuousAccess,
};
