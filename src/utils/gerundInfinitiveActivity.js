import { GERUND_INFINITIVE_LESSONS, GERUND_INFINITIVE_MIXED_ITEMS } from "../components/grammar/data/gerundInfinitiveData.js";

export const GERUND_INFINITIVE_PATH = "/activities/gerund-or-infinitive";
export const GERUND_INFINITIVE_ITEMS = [
  ...GERUND_INFINITIVE_LESSONS.flatMap((lesson) => lesson.items),
  ...GERUND_INFINITIVE_MIXED_ITEMS,
];

export function normaliseVerbAnswer(value) {
  return String(value).normalize("NFKC").toLowerCase().trim().replace(/[.!?]+$/, "").replace(/\s+/g, " ");
}

const emptyAnswer = () => ({ value: "", status: "", shown: false, checks: 0, firstCorrect: null });

export function createVerbPatternAttempt(siteId, now = Date.now()) {
  return {
    version: 1,
    sessionId: crypto.randomUUID(),
    siteId,
    startedAtMs: now,
    completedAtMs: 0,
    page: 0,
    mixedSubmitted: false,
    answers: GERUND_INFINITIVE_ITEMS.map(emptyAnswer),
  };
}

export function restoreVerbPatternAttempt(raw, siteId) {
  if (!raw || raw.version !== 1 || raw.siteId !== siteId || typeof raw.sessionId !== "string"
    || !Number.isFinite(raw.startedAtMs) || raw.startedAtMs <= 0
    || !Array.isArray(raw.answers) || raw.answers.length !== GERUND_INFINITIVE_ITEMS.length) return null;
  return {
    ...raw,
    completedAtMs: Number.isFinite(raw.completedAtMs) ? raw.completedAtMs : 0,
    page: Number.isInteger(raw.page) && raw.page >= 0 && raw.page <= 6 ? raw.page : 0,
    mixedSubmitted: raw.mixedSubmitted === true,
    answers: raw.answers.map((entry, i) => {
      const value = typeof entry?.value === "string" ? entry.value.slice(0, 60) : "";
      const shown = entry?.shown === true;
      const correct = GERUND_INFINITIVE_ITEMS[i].answers.includes(normaliseVerbAnswer(value));
      const status = ["correct", "retry", "revealed"].includes(entry?.status) && value.trim()
        ? correct ? shown ? "revealed" : "correct" : "retry"
        : "";
      return { value, status, shown, checks: Math.max(0, Number(entry?.checks) || 0), firstCorrect: typeof entry?.firstCorrect === "boolean" ? entry.firstCorrect : null };
    }),
  };
}

export function checkVerbPatternAnswer(entry, item, reveal = false) {
  if (!reveal && !entry.value.trim()) return { ...entry, status: "" };
  const correct = item.answers.includes(normaliseVerbAnswer(entry.value));
  const shown = entry.shown || reveal;
  return {
    ...entry,
    value: reveal ? item.answers[0] : entry.value,
    shown,
    status: reveal || (shown && correct) ? "revealed" : correct ? "correct" : "retry",
    checks: entry.checks + 1,
    firstCorrect: entry.firstCorrect ?? (!reveal && correct),
  };
}

export function summariseVerbPatternAttempt(attempt, now = Date.now()) {
  const counts = (entries, checked = true) => ({
    total: entries.length,
    answeredCount: checked ? entries.filter((e) => e.value.trim() && e.status).length : 0,
    correctCount: checked ? entries.filter((e) => e.status === "correct" && !e.shown).length : 0,
    revealedCount: entries.filter((e) => e.shown).length,
    firstCorrectCount: entries.filter((e) => e.firstCorrect === true).length,
    checkCount: entries.reduce((sum, e) => sum + e.checks, 0),
  });
  const cards = GERUND_INFINITIVE_LESSONS.map((lesson, i) => ({ title: lesson.title, ...counts(attempt.answers.slice(i * 6, i * 6 + 6)) }));
  const mixed = counts(attempt.answers.slice(24), attempt.mixedSubmitted);
  const answeredCount = cards.reduce((sum, c) => sum + c.answeredCount, 0) + mixed.answeredCount;
  const correctCount = cards.reduce((sum, c) => sum + c.correctCount, 0) + mixed.correctCount;
  return {
    activityId: "gerund-or-infinitive",
    activityTitle: "Gerund or infinitive?",
    sessionId: attempt.sessionId,
    siteId: attempt.siteId,
    app: attempt.siteId === "aptis" ? "aptis-trainer" : attempt.siteId,
    startedAtMs: attempt.startedAtMs,
    elapsedSeconds: Math.max(0, Math.round(((attempt.completedAtMs || now) - attempt.startedAtMs) / 1000)),
    totalItems: 36,
    answeredCount,
    correctCount,
    revealedCount: attempt.answers.filter((e) => e.shown).length,
    firstCorrectCount: attempt.answers.filter((e) => e.firstCorrect === true).length,
    cards,
    mixed,
    canFinish: answeredCount === 36,
  };
}
