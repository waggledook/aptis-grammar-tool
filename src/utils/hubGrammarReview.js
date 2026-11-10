import { HUB_GRAMMAR_ACTIVITIES } from "../data/hubGrammarActivities.js";
import { buildHubGrammarMistakes, isHubMiniGrammarLiveSource } from "./hubGrammarMistakes.js";
import { getGrammarReviewTransition, grammarReviewDateToMs, isGrammarReviewDue } from "./grammarReview.js";

const questionBank = new Map(HUB_GRAMMAR_ACTIVITIES.flatMap((activity) => activity.items.map((question, index) => [
  `${activity.id}:${question.id}`,
  { key: `${activity.id}:${question.id}`, activityId: activity.id, activityTitle: activity.title,
    question, number: index + 1, level: activity.level, studentIds: [], latestMistakeAtMs: 0 },
])));

export function getHubGrammarReviewQuestion(key) {
  return questionBank.get(key) || null;
}

/** Old test errors seed the queue once; a genuinely newer error reopens it. */
export function getHubGrammarEffectiveProgress(current = {}, latestMistakeAtMs = 0, now = new Date()) {
  const lastSourceMs = Number(current.lastSourceMistakeAtMs) || 0;
  if (current.needsReview == null || latestMistakeAtMs > lastSourceMs) {
    return { ...current, ...getGrammarReviewTransition(current, {
      isCorrect: false, now: new Date(latestMistakeAtMs || now.getTime()),
    }), lastSourceMistakeAtMs: Math.max(lastSourceMs, latestMistakeAtMs) };
  }
  return current;
}

/** Only a due, independently answered review can advance a learning stage. */
export function getHubGrammarLearningUpdate(current, event) {
  const now = new Date(event.answeredAtMs);
  if (!Number.isFinite(now.getTime())) throw new Error("A review answer needs a valid time.");
  if (current?.lastEventId === event.eventId || (current?.lastOutcomeAtMs || 0) > event.answeredAtMs) return null;
  if (!current && !event.knownMistake && event.isCorrect) return null;
  const effective = { ...getHubGrammarEffectiveProgress(current || {}, event.sourceMistakeAtMs || 0, now) };
  if (!event.isCorrect) effective.lapseCount = Number(current?.lapseCount) || 0;
  const mayAdvance = (event.source === "review" || event.source === "live") && isGrammarReviewDue(effective, now);
  const transition = getGrammarReviewTransition(effective, {
    isCorrect: event.isCorrect, mode: mayAdvance ? "review" : "practice", now,
  });
  return {
    ...effective, ...transition,
    lastEventId: event.eventId, lastOutcomeAtMs: event.answeredAtMs,
    lastCorrect: event.isCorrect, lastSource: event.source,
    lastSourceMistakeAtMs: Math.max(Number(effective.lastSourceMistakeAtMs) || 0, event.sourceMistakeAtMs || 0),
    attemptCount: (Number(current?.attemptCount) || 0) + 1,
    ...(event.isCorrect ? {} : { lastIncorrectAtMs: event.answeredAtMs }),
  };
}

function progressMap(rows) {
  return new Map((rows || []).map((row) => [row.itemKey, row]));
}

export function hubGrammarReviewStatus(progress, now = new Date()) {
  if (!progress.needsReview) return "mastered";
  return isGrammarReviewDue(progress, now) ? "due" : "scheduled";
}

export function buildHubGrammarStudentReviewQueue(submissions, progress = [], studentId = "", now = new Date()) {
  const mistakes = buildHubGrammarMistakes([{ student: { id: studentId }, submissions }]);
  const known = new Set(mistakes.map((item) => item.key));
  // Live mistakes also belong in the learner's queue, even without a test submission.
  for (const row of progress) {
    const source = getHubGrammarReviewQuestion(row.itemKey);
    if (!known.has(row.itemKey) && source) {
      mistakes.push({ ...source, studentIds: studentId ? [studentId] : [] });
      known.add(row.itemKey);
    }
  }
  const byKey = progressMap(progress);
  return mistakes.map((item) => {
    const reviewProgress = getHubGrammarEffectiveProgress(byKey.get(item.key), item.latestMistakeAtMs, now);
    return { ...item, reviewProgress, reviewStatus: hubGrammarReviewStatus(reviewProgress, now),
      nextReviewAt: reviewProgress.nextReviewAt || null };
  });
}

/** Teacher pools deliberately include scheduled and mastered mistakes by default. */
export function buildHubGrammarClassReviewQueue(groups, now = new Date()) {
  const merged = new Map();
  for (const group of groups || []) {
    const studentId = group.student.id;
    for (const item of buildHubGrammarStudentReviewQueue(group.submissions, group.progress, studentId, now)) {
      if (!merged.has(item.key)) merged.set(item.key, { ...item, studentIds: [], dueStudentIds: [],
        scheduledStudentIds: [], masteredStudentIds: [] });
      const target = merged.get(item.key);
      if (target.studentIds.includes(studentId)) continue;
      target.studentIds.push(studentId);
      target[`${item.reviewStatus}StudentIds`].push(studentId);
    }
  }
  return [...merged.values()].map((item) => ({ ...item,
    reviewStatus: item.dueStudentIds.length ? "due" : item.scheduledStudentIds.length ? "scheduled" : "mastered",
  }));
}

export function summarizeHubGrammarReview(items) {
  const summary = { due: 0, scheduled: 0, mastered: 0, nextReviewAt: null };
  for (const item of items) {
    summary[item.reviewStatus] += 1;
    if (item.reviewStatus === "scheduled" && (!summary.nextReviewAt
      || grammarReviewDateToMs(item.nextReviewAt) < grammarReviewDateToMs(summary.nextReviewAt))) {
      summary.nextReviewAt = item.nextReviewAt;
    }
  }
  return summary;
}

/** Reconcile only the signed-in participant's submitted answers, including after reload. */
export function getHubGrammarLiveReviewEvents(gameId, game, uid, ownQueue) {
  if (!isHubMiniGrammarLiveSource(game?.source) || !game.players?.[uid]) return [];
  const known = new Map(ownQueue.map((item) => [item.key, item]));
  return (game.items || []).flatMap((item, index) => {
    const answer = game.answers?.[index]?.[uid];
    if (!answer || typeof answer.correct !== "boolean" || !Number.isFinite(answer.submittedAt)
      || !getHubGrammarReviewQuestion(item.id)) return [];
    const mistake = known.get(item.id);
    return [{ eventId: `live:${gameId}:${index}:${uid}`, itemKey: item.id,
      answeredAtMs: answer.submittedAt, isCorrect: answer.correct, source: "live",
      knownMistake: !!mistake, sourceMistakeAtMs: mistake?.latestMistakeAtMs || 0 }];
  });
}
