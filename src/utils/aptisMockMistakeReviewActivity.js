export const APTIS_MOCK_MISTAKE_REVIEW_STARTED = "aptis_mock_mistake_review_started";
export const APTIS_MOCK_MISTAKE_REVIEW_COMPLETED = "aptis_mock_mistake_review_completed";

function nonNegativeInteger(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.round(number));
}

function createSessionId() {
  const randomId = globalThis.crypto?.randomUUID?.();
  if (randomId) return randomId;
  return `aptis-mock-review-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Build a privacy-conscious activity context for one mistake-review run. */
export function createAptisMockMistakeReviewTracking(items, {
  reviewScope = "learner",
  selectedStudentCount,
  selectionMode,
  prioritizeFrequent,
} = {}) {
  const safeItems = Array.isArray(items) ? items : [];
  const mockIds = Array.from(new Set(
    safeItems.map((item) => String(item?.mockId || "").trim()).filter(Boolean)
  ));
  const grammarItemCount = safeItems.filter((item) => item?.kind === "grammar").length;
  const vocabularyItemCount = safeItems.filter((item) => item?.kind === "vocabulary").length;
  const sessionId = createSessionId();

  return {
    sessionId,
    startedAtMs: Date.now(),
    completed: false,
    details: {
      schemaVersion: 1,
      sessionId,
      reviewScope: reviewScope === "teacher_class" ? "teacher_class" : "learner",
      totalItems: safeItems.length,
      grammarItemCount,
      vocabularyItemCount,
      sourceMockCount: mockIds.length,
      mockIds,
      ...(Number.isFinite(Number(selectedStudentCount))
        ? { selectedStudentCount: nonNegativeInteger(selectedStudentCount) }
        : {}),
      ...(selectionMode ? { selectionMode: String(selectionMode) } : {}),
      ...(typeof prioritizeFrequent === "boolean" ? { prioritizeFrequent } : {}),
    },
  };
}

/** Add aggregate outcomes to the matching start event without storing answers. */
export function buildAptisMockMistakeReviewCompletion(
  tracking,
  { answeredCount, correctCount } = {},
  completedAtMs = Date.now()
) {
  const totalItems = nonNegativeInteger(tracking?.details?.totalItems);
  const safeAnswered = Math.min(totalItems, nonNegativeInteger(answeredCount));
  const safeCorrect = Math.min(safeAnswered, nonNegativeInteger(correctCount));
  const elapsedSeconds = Math.max(
    0,
    Math.round((nonNegativeInteger(completedAtMs) - nonNegativeInteger(tracking?.startedAtMs)) / 1000)
  );

  return {
    ...(tracking?.details || {}),
    answeredCount: safeAnswered,
    correctCount: safeCorrect,
    incorrectCount: Math.max(0, safeAnswered - safeCorrect),
    accuracy: safeAnswered ? Math.round((safeCorrect / safeAnswered) * 100) : 0,
    elapsedSeconds,
  };
}
