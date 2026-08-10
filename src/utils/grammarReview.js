export const GRAMMAR_REVIEW_INTERVAL_DAYS = [0, 1, 3, 7, 14];
export const GRAMMAR_REVIEW_MASTERY_STAGE = 4;

function asDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value.toMillis === "function") return new Date(value.toMillis());
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function clampReviewStage(value) {
  return Math.max(
    0,
    Math.min(GRAMMAR_REVIEW_MASTERY_STAGE, Number(value) || 0)
  );
}

export function isGrammarMaintenancePending(progress = {}) {
  if (progress.maintenancePending === true) return true;
  if (progress.maintenancePending === false) return false;

  return (
    clampReviewStage(progress.reviewStage) >= GRAMMAR_REVIEW_MASTERY_STAGE &&
    progress.masteryStatus === "mastered" &&
    progress.maintenanceCompleted !== true &&
    !!asDate(progress.nextReviewAt)
  );
}

export function isGrammarReviewPending(progress = {}) {
  return (
    isGrammarMaintenancePending(progress) ||
    progress.needsReview === true ||
    (progress.needsReview == null && progress.lastCorrect === false)
  );
}

export function getGrammarReviewTransition(
  current = {},
  { isCorrect, mode = "practice", now = new Date() } = {}
) {
  const correct = !!isCorrect;
  const reviewMode = mode === "review";
  const reviewStage = clampReviewStage(current.reviewStage);
  const lapseCount = Math.max(0, Number(current.lapseCount) || 0);
  const consecutiveCorrect = Math.max(0, Number(current.consecutiveCorrect) || 0);
  const inferredNeedsReview = isGrammarReviewPending(current);
  const maintenancePending = isGrammarMaintenancePending(current);
  const safeNow = asDate(now) || new Date();

  if (!correct) {
    return {
      needsReview: true,
      reviewStage: 0,
      nextReviewAt: safeNow,
      lapseCount: lapseCount + 1,
      consecutiveCorrect: 0,
      masteryStatus: "learning",
      maintenancePending: false,
      maintenanceCompleted: false,
    };
  }

  if (reviewMode) {
    if (
      reviewStage >= GRAMMAR_REVIEW_MASTERY_STAGE &&
      maintenancePending
    ) {
      return {
        needsReview: false,
        reviewStage: GRAMMAR_REVIEW_MASTERY_STAGE,
        nextReviewAt: null,
        lapseCount,
        consecutiveCorrect: consecutiveCorrect + 1,
        masteryStatus: "mastered",
        maintenancePending: false,
        maintenanceCompleted: true,
      };
    }

    const nextStage = Math.min(
      GRAMMAR_REVIEW_MASTERY_STAGE,
      reviewStage + 1
    );
    const intervalDays = GRAMMAR_REVIEW_INTERVAL_DAYS[nextStage];

    return {
      // Reaching stage 4 confirms mastery after the 7-day review, but keeps
      // one lower-priority 14-day maintenance check in the queue.
      needsReview: true,
      reviewStage: nextStage,
      nextReviewAt: new Date(
        safeNow.getTime() + intervalDays * 24 * 60 * 60 * 1000
      ),
      lapseCount,
      consecutiveCorrect: consecutiveCorrect + 1,
      masteryStatus:
        nextStage >= GRAMMAR_REVIEW_MASTERY_STAGE
          ? "mastered"
          : "reviewing",
      maintenancePending: nextStage >= GRAMMAR_REVIEW_MASTERY_STAGE,
      maintenanceCompleted: false,
    };
  }

  return {
    needsReview: inferredNeedsReview,
    reviewStage,
    nextReviewAt: asDate(current.nextReviewAt),
    lapseCount,
    consecutiveCorrect: consecutiveCorrect + 1,
    masteryStatus:
      current.masteryStatus ||
      (inferredNeedsReview ? "learning" : "practising"),
    maintenancePending,
    maintenanceCompleted: current.maintenanceCompleted === true,
  };
}

export function isGrammarReviewDue(progress = {}, now = new Date()) {
  const inferredNeedsReview = isGrammarReviewPending(progress);
  if (!inferredNeedsReview) return false;

  const dueAt = asDate(progress.nextReviewAt || progress.lastIncorrectAt || progress.lastAnsweredAt);
  if (!dueAt) return true;
  const safeNow = asDate(now) || new Date();
  return dueAt.getTime() <= safeNow.getTime();
}

export function grammarReviewDateToMs(value) {
  return asDate(value)?.getTime() || 0;
}

export function buildGrammarReviewSummary(reviewQueue = [], legacyIds = []) {
  const activeReviewIds = new Set(reviewQueue.map((entry) => entry.itemId));
  const uniqueLegacyIds = Array.from(new Set(legacyIds || []));
  const due = reviewQueue.filter(
    (entry) => entry.due && !entry.maintenance
  ).length;
  const maintenance = reviewQueue.filter(
    (entry) => entry.due && entry.maintenance
  ).length;
  const scheduled = reviewQueue.filter((entry) => !entry.due).length;
  const legacy = uniqueLegacyIds.filter(
    (itemId) => !activeReviewIds.has(itemId)
  ).length;

  return {
    due,
    maintenance,
    scheduled,
    legacy,
    ready: due + maintenance + legacy,
  };
}
