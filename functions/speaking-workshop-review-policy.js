/* eslint-disable no-undef */
const DAY_MS = 86400000;
const SPEAKING_WORKSHOP_REVIEW_DAYS = 28;

function getSpeakingWorkshopReviewCorrection(session) {
  const endedAt = session.endedAt?.toMillis?.();
  const reviewUntil = session.reviewUntil?.toMillis?.();
  if (session.phase !== "review" || !Number.isFinite(endedAt) ||
      reviewUntil - endedAt !== 14 * DAY_MS) return null;
  return endedAt + SPEAKING_WORKSHOP_REVIEW_DAYS * DAY_MS;
}

module.exports = {
  SPEAKING_WORKSHOP_REVIEW_DAYS,
  getSpeakingWorkshopReviewCorrection,
};
