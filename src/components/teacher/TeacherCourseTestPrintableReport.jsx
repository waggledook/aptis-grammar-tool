import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCourseTestSession,
  listAttemptsForCourseTestSession,
  listAttemptsForMyCourseTestSession,
} from "../../firebase";
import { getHubCourseTestTemplate } from "../../data/hubCourseTestTemplates.js";
import { getSitePath } from "../../siteConfig.js";
import Seo from "../common/Seo.jsx";
import { toast } from "../../utils/toast";

function formatDateTime(value) {
  if (!value) return "—";
  const date =
    typeof value?.toDate === "function"
      ? value.toDate()
      : value instanceof Date
        ? value
        : new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function normalizeReviewAnswer(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[-.,!?;:()[\]{}"“”]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getMatchingOptionCode(value = "") {
  const match = String(value || "").trim().match(/^([a-z])\b/i);
  return match ? match[1].toLowerCase() : "";
}

function resolveMatchingOptionLabel(item, value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "—";

  const code = getMatchingOptionCode(raw);
  if (!code) return raw;

  const options = Array.isArray(item?.options) ? item.options : [];
  const matched = options.find((option) => {
    const text = String(typeof option === "string" ? option : option?.text || "").trim();
    return getMatchingOptionCode(text) === code;
  });

  if (!matched) return raw;
  return String(typeof matched === "string" ? matched : matched?.text || raw);
}

function isMatchingSelectCorrect(item, answer) {
  const normalized = normalizeReviewAnswer(answer);
  if (!normalized) return 0;

  const normalizedCode = getMatchingOptionCode(normalized);
  const acceptedValues = Array.isArray(item?.acceptedAnswers) && item.acceptedAnswers.length
    ? item.acceptedAnswers
    : [item?.answer];

  return acceptedValues.some((entry) => {
    const acceptedNormalized = normalizeReviewAnswer(entry);
    if (acceptedNormalized === normalized) return true;
    const acceptedCode = getMatchingOptionCode(acceptedNormalized);
    return Boolean(acceptedCode && normalizedCode && acceptedCode === normalizedCode);
  }) ? 1 : 0;
}

function isInlineTextInputItem(item) {
  return (
    item?.type === "text-input" &&
    Array.isArray(item.inlineParts) &&
    item.inlineParts.some((part) => part && typeof part === "object" && part.gapId)
  );
}

function hasPerGapAcceptedAnswers(item) {
  return Boolean(item?.inlineAcceptedAnswers && Object.keys(item.inlineAcceptedAnswers).length > 0);
}

function isSortBySoundItem(item) {
  return (
    !item?.type &&
    typeof item?.prompt === "string" &&
    typeof item?.answer === "string" &&
    Array.isArray(item?.options)
  );
}

function buildSortBySoundDistractorItems(section) {
  const sourceItems = Array.isArray(section?.items) ? section.items : [];
  const exampleWords = Array.isArray(section?.sharedPrompt?.exampleWords)
    ? section.sharedPrompt.exampleWords.map((entry) => String(entry).toLowerCase())
    : [];

  return (Array.isArray(section?.sharedPrompt?.values) ? section.sharedPrompt.values : [])
    .filter((entry) => {
      const text = String(typeof entry === "string" ? entry : entry?.text || "").toLowerCase();
      if (!text) return false;
      if (exampleWords.includes(text)) return false;
      return !sourceItems.some((item) => String(item.prompt || "").toLowerCase() === text);
    })
    .map((entry, index) => ({
      id: `__distractor__:${index}:${typeof entry === "string" ? entry : entry?.text || ""}`,
    }));
}

function getSortBySoundPenalty(section, sectionAnswerMap = {}) {
  if (section?.taskType !== "sort-by-sound") return 0;
  return buildSortBySoundDistractorItems(section).reduce((sum, item) => {
    return sum + (sectionAnswerMap?.[item.id] ? 1 : 0);
  }, 0);
}

function getAutoItemScore(item, answer) {
  if (item?.type === "choice") {
    if (Array.isArray(item.acceptedAnswerIndexes) && item.acceptedAnswerIndexes.length) {
      return item.acceptedAnswerIndexes.map(String).includes(String(answer)) ? 1 : 0;
    }
    return String(answer) === String(item.answerIndex) ? 1 : 0;
  }

  if (item?.type === "stress-choice") {
    return String(answer) === String(item.answerIndex) ? 1 : 0;
  }

  if (item?.type === "matching-select") {
    return isMatchingSelectCorrect(item, answer);
  }

  if (isSortBySoundItem(item)) {
    if (!normalizeReviewAnswer(answer)) return 0;
    return normalizeReviewAnswer(answer) === normalizeReviewAnswer(item.answer) ? 1 : 0;
  }

  if (item?.type === "text-input") {
    if (isInlineTextInputItem(item) && hasPerGapAcceptedAnswers(item)) {
      const acceptedByGap = item.inlineAcceptedAnswers || {};
      const answerMap = answer && typeof answer === "object" ? answer : {};

      const fullCredit = Object.entries(acceptedByGap).every(([gapId, acceptedValues]) => {
        const normalized = normalizeReviewAnswer(answerMap[gapId] || "");
        return (acceptedValues || []).some((entry) => normalizeReviewAnswer(entry) === normalized);
      });
      if (fullCredit) return 1;

      const partialByGap = item.inlinePartialAcceptedAnswers || {};
      const hasPartial = Object.keys(partialByGap).length > 0 &&
        Object.entries(partialByGap).every(([gapId, acceptedValues]) => {
          const normalized = normalizeReviewAnswer(answerMap[gapId] || "");
          return (acceptedValues || []).some((entry) => normalizeReviewAnswer(entry) === normalized);
        });
      if (hasPartial) return Number(item.partialCreditValue ?? 0.5);
      return 0;
    }

    const accepted = Array.isArray(item.acceptedAnswers) ? item.acceptedAnswers : [];
    const normalized = normalizeReviewAnswer(answer);
    if (accepted.some((entry) => normalizeReviewAnswer(entry) === normalized)) return 1;

    const partialAccepted = Array.isArray(item.partialAcceptedAnswers) ? item.partialAcceptedAnswers : [];
    if (partialAccepted.some((entry) => normalizeReviewAnswer(entry) === normalized)) {
      return Number(item.partialCreditValue ?? 0.5);
    }
    return 0;
  }

  return 0;
}

function isItemCorrect(item, answer) {
  return getAutoItemScore(item, answer) >= 1;
}

function formatAttemptAnswer(item, answer) {
  if (!answer || (typeof answer === "string" && !answer.trim())) return "—";

  if (isInlineTextInputItem(item) && hasPerGapAcceptedAnswers(item)) {
    const answerMap = answer && typeof answer === "object" ? answer : {};
    const gapParts = item.inlineParts.filter((part) => part && typeof part === "object" && part.gapId);
    return gapParts
      .map((part, index) => `Gap ${index + 1}: ${answerMap[part.gapId] || "—"}`)
      .join(" · ");
  }

  if (item?.type === "choice") {
    const selected = item.options?.[Number(answer)];
    return typeof selected === "string" ? selected : selected?.text || "—";
  }

  if (item?.type === "stress-choice") {
    const syllables = Array.isArray(item.syllables) ? item.syllables : [];
    const chosen = syllables[Number(answer)];
    if (!chosen) return "—";
    return `${item.prompt}: ${chosen}`;
  }

  if (isSortBySoundItem(item)) {
    return answer ? String(answer) : "—";
  }

  if (item?.type === "matching-select") {
    return resolveMatchingOptionLabel(item, answer);
  }

  return String(answer);
}

function formatAcceptedAnswer(item) {
  if (isInlineTextInputItem(item) && hasPerGapAcceptedAnswers(item)) {
    return Object.entries(item.inlineAcceptedAnswers || {})
      .map(([, values], index) => `Gap ${index + 1}: ${(values || []).join(" / ")}`)
      .join(" · ");
  }

  if (item?.type === "choice") {
    if (Array.isArray(item.acceptedAnswerIndexes) && item.acceptedAnswerIndexes.length) {
      return item.acceptedAnswerIndexes
        .map((index) => item.options?.[Number(index)])
        .map((selected) => (typeof selected === "string" ? selected : selected?.text || "—"))
        .join(" / ");
    }
    const selected = item.options?.[Number(item.answerIndex)];
    return typeof selected === "string" ? selected : selected?.text || "—";
  }

  if (item?.type === "stress-choice") {
    const syllables = Array.isArray(item.syllables) ? item.syllables : [];
    const chosen = syllables[Number(item.answerIndex)];
    if (!chosen) return "—";
    return `${item.prompt}: ${chosen}`;
  }

  if (item?.type === "matching-select") {
    if (Array.isArray(item.acceptedAnswers) && item.acceptedAnswers.length) {
      return item.acceptedAnswers.map((entry) => resolveMatchingOptionLabel(item, entry)).join(" / ");
    }
    return resolveMatchingOptionLabel(item, item.answer);
  }

  if (isSortBySoundItem(item)) {
    return item.answer || "—";
  }

  if (Array.isArray(item?.acceptedAnswers)) {
    return item.acceptedAnswers.join(" / ");
  }

  return "—";
}

function getSkillLabel(skill = "") {
  if (skill === "grammar") return "Grammar";
  if (skill === "vocabulary") return "Vocabulary";
  if (skill === "pronunciation") return "Pronunciation";
  if (skill === "practical-english") return "Practical English";
  if (skill === "reading") return "Reading";
  if (skill === "listening") return "Listening";
  return skill || "Section";
}

function buildSkillTotals(reviewRows = [], reviewScores = {}) {
  const orderedSkills = ["grammar", "vocabulary", "pronunciation", "reading", "listening"];
  const totals = new Map(
    orderedSkills.map((skill) => [skill, { skill, label: getSkillLabel(skill), score: 0, total: 0 }])
  );

  reviewRows.forEach((section) => {
    const skill = section.skill || section.id;
    if (!totals.has(skill)) {
      totals.set(skill, { skill, label: getSkillLabel(skill), score: 0, total: 0 });
    }

    const entry = totals.get(skill);
    section.reviewItems.forEach(({ key, autoScore }) => {
      entry.score += Number(reviewScores[key] ?? Number(autoScore || 0));
      entry.total += 1;
    });
    entry.score -= Number(section.penalty || 0);
    entry.score = Math.max(0, entry.score);
  });

  return Array.from(totals.values()).filter((entry) => entry.total > 0 || orderedSkills.includes(entry.skill));
}

export default function TeacherCourseTestPrintableReport({ user }) {
  const navigate = useNavigate();
  const { sessionId, attemptId } = useParams();
  const isAdmin = user?.role === "admin";
  const canAccess = user?.role === "teacher" || isAdmin;

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [attempt, setAttempt] = useState(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!canAccess || !sessionId || !attemptId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [sessionRow, attemptRows] = await Promise.all([
          getCourseTestSession(sessionId),
          isAdmin
            ? listAttemptsForCourseTestSession(sessionId)
            : listAttemptsForMyCourseTestSession(sessionId),
        ]);

        if (!alive) return;

        setSession(sessionRow || null);
        setAttempt((attemptRows || []).find((entry) => entry.id === attemptId) || null);
      } catch (error) {
        console.error("[TeacherCourseTestPrintableReport] load failed", error);
        if (!alive) return;
        toast("Could not load the printable report.");
        setSession(null);
        setAttempt(null);
      } finally {
        if (alive) setLoading(false);
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, [attemptId, canAccess, isAdmin, sessionId]);

  const template = useMemo(
    () => (attempt?.templateId ? getHubCourseTestTemplate(attempt.templateId) : null),
    [attempt]
  );

  const reviewRows = useMemo(() => {
    if (!template || !attempt) return [];

    const answers = attempt.runnerState?.sectionAnswers || {};
    return (template.sections || []).map((section) => ({
      ...section,
      penalty: getSortBySoundPenalty(section, answers?.[section.id] || {}),
      reviewItems: (section.items || []).map((item) => {
        const answer = answers?.[section.id]?.[item.id];
        return {
          item,
          key: `${section.id}:${item.id}`,
          answer,
          autoCorrect: isItemCorrect(item, answer),
          autoScore: getAutoItemScore(item, answer),
        };
      }),
    }));
  }, [attempt, template]);

  const reviewScores = useMemo(() => {
    const savedScores = attempt?.teacherReview?.itemScores || {};
    const nextScores = {};

    reviewRows.forEach((section) => {
      section.reviewItems.forEach(({ key, autoScore }) => {
        nextScores[key] =
          savedScores[key] != null ? Number(savedScores[key]) : Number(autoScore || 0);
      });
    });

    return nextScores;
  }, [attempt, reviewRows]);

  const reviewTotals = useMemo(() => {
    const total = reviewRows.reduce((sum, section) => sum + section.reviewItems.length, 0);
    const score = reviewRows.reduce(
      (sum, section) =>
        sum +
        section.reviewItems.reduce((sectionSum, entry) => {
          return sectionSum + Number(reviewScores[entry.key] ?? Number(entry.autoScore || 0));
        }, 0) -
        Number(section.penalty || 0),
      0
    );

    return { score: Math.max(0, score), total };
  }, [reviewRows, reviewScores]);

  const skillTotals = useMemo(() => buildSkillTotals(reviewRows, reviewScores), [reviewRows, reviewScores]);

  const pageTitle = template?.title || session?.templateTitle || "Course test report";

  if (!canAccess) {
    return (
      <div className="teacher-course-print-page">
        <Seo title="Printable Course Test Report | Seif" />
        <div className="teacher-course-print-shell">
          <div className="teacher-course-print-card">
            <h1>Printable report unavailable</h1>
            <p>You need teacher or admin access to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-course-print-page">
      <Seo title={`${pageTitle} | Printable Report`} />

      <div className="teacher-course-print-shell">
        <div className="teacher-course-print-toolbar no-print">
          <button type="button" className="ghost-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => navigate(getSitePath("/teacher-tools"))}
          >
            Teacher tools
          </button>
          <button type="button" className="btn" onClick={() => window.print()}>
            Print / Save as PDF
          </button>
        </div>

        {loading ? (
          <div className="teacher-course-print-card">
            <p>Loading printable report…</p>
          </div>
        ) : !session || !attempt || !template ? (
          <div className="teacher-course-print-card">
            <h1>Printable report unavailable</h1>
            <p>This submission could not be found, or you do not have access to it.</p>
          </div>
        ) : (
          <>
            <header className="teacher-course-print-header">
              <div>
                <span className="teacher-course-print-kicker">Corrected exam report</span>
                <h1>{pageTitle}</h1>
                <p className="teacher-course-print-subtitle">
                  Full colour-coded feedback for printing or saving as PDF.
                </p>
              </div>
              <div className="teacher-course-print-status">
                <span className={`teacher-course-print-chip ${attempt.reviewStatus === "reviewed" ? "is-reviewed" : "is-pending"}`}>
                  {attempt.reviewStatus === "reviewed" ? "Reviewed" : "Auto-marked draft"}
                </span>
              </div>
            </header>

            <section className="teacher-course-print-summary">
              <div className="teacher-course-print-summary-card">
                <span>Student</span>
                <strong>{attempt.studentName || attempt.studentEmail || attempt.studentUid}</strong>
              </div>
              <div className="teacher-course-print-summary-card">
                <span>Submitted</span>
                <strong>{formatDateTime(attempt.submittedAt || attempt.updatedAt || attempt.startedAt)}</strong>
              </div>
              <div className="teacher-course-print-summary-card">
                <span>Reviewed</span>
                <strong>{formatDateTime(attempt.reviewedAt || attempt.updatedAt || attempt.submittedAt)}</strong>
              </div>
              <div className="teacher-course-print-summary-card">
                <span>Score</span>
                <strong>
                  {reviewTotals.score}/{reviewTotals.total}
                  {reviewTotals.total ? ` · ${Math.round((reviewTotals.score / reviewTotals.total) * 100)}%` : ""}
                </strong>
              </div>
            </section>

            {skillTotals.length ? (
              <section className="teacher-course-print-skills">
                {skillTotals.map((entry) => (
                  <div key={entry.skill} className="teacher-course-print-skill-card">
                    <span>{entry.label}</span>
                    <strong>{entry.score}/{entry.total}</strong>
                  </div>
                ))}
              </section>
            ) : null}

            <section className="teacher-course-print-sections">
              {reviewRows.map((section) => (
                <article key={section.id} className="teacher-course-print-section">
                  <div className="teacher-course-print-section-head">
                    <div>
                      <h2>{section.title}</h2>
                      <p>{section.reviewItems.length} items</p>
                    </div>
                    {section.penalty ? (
                      <span className="teacher-course-print-chip is-penalty">Extra word penalty: -{section.penalty}</span>
                    ) : null}
                  </div>

                  <div className="teacher-course-print-items">
                    {section.reviewItems.map(({ item, key, answer, autoCorrect, autoScore }, index) => {
                      const assignedScore = Number(reviewScores[key] ?? Number(autoScore || 0));
                      const toneClass = assignedScore >= 1 ? "is-correct" : assignedScore > 0 ? "is-partial" : "is-wrong";

                      return (
                        <div key={key} className={`teacher-course-print-item ${toneClass}`}>
                          <div className="teacher-course-print-item-head">
                            <div>
                              <span className="teacher-course-print-item-number">{index + 1}</span>
                              <strong>{item.prompt}</strong>
                            </div>
                            <span className={`teacher-course-print-chip ${toneClass}`}>
                              {assignedScore >= 1 ? "Correct" : assignedScore > 0 ? `Partial (${assignedScore})` : "Wrong"}
                            </span>
                          </div>

                          <div className="teacher-course-print-item-grid">
                            <div className="teacher-course-print-detail-row">
                              <span>Your answer</span>
                              <p>{formatAttemptAnswer(item, answer)}</p>
                            </div>
                            <div className="teacher-course-print-detail-row">
                              <span>Answer key</span>
                              <p>{formatAcceptedAnswer(item)}</p>
                            </div>
                            <div className="teacher-course-print-detail-row">
                              <span>Auto-check</span>
                              <p>{autoScore >= 1 ? "Correct" : autoScore > 0 ? `Partial credit (${autoScore})` : autoCorrect ? "Correct" : "Wrong / needs teacher review"}</p>
                            </div>
                            <div className="teacher-course-print-detail-row">
                              <span>Final mark</span>
                              <p>{assignedScore}/1</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </div>

      <style>{`
        .teacher-course-print-page {
          width: 100%;
          color: #e6eefc;
        }

        .teacher-course-print-shell {
          max-width: 1180px;
          margin: 0 auto;
          padding: 1rem 0.9rem 2rem;
        }

        .teacher-course-print-toolbar {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }

        .teacher-course-print-card,
        .teacher-course-print-header,
        .teacher-course-print-summary-card,
        .teacher-course-print-skill-card,
        .teacher-course-print-section,
        .teacher-course-print-item {
          background: linear-gradient(180deg, rgba(18, 32, 60, 0.98), rgba(12, 24, 46, 0.98));
          border: 1px solid rgba(78, 108, 178, 0.32);
          border-radius: 18px;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.16);
        }

        .teacher-course-print-header,
        .teacher-course-print-card,
        .teacher-course-print-section {
          padding: 0.95rem 1rem;
        }

        .teacher-course-print-header {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .teacher-course-print-kicker,
        .teacher-course-print-summary-card span,
        .teacher-course-print-skill-card span,
        .teacher-course-print-detail-row span,
        .teacher-course-print-item-number {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #8fb2ec;
        }

        .teacher-course-print-header h1,
        .teacher-course-print-section h2 {
          margin: 0.2rem 0 0.15rem;
        }

        .teacher-course-print-subtitle,
        .teacher-course-print-section-head p,
        .teacher-course-print-detail-row p,
        .teacher-course-print-card p {
          margin: 0;
          color: #cbd8ee;
          line-height: 1.35;
        }

        .teacher-course-print-summary,
        .teacher-course-print-skills {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.55rem;
          margin-bottom: 0.7rem;
        }

        .teacher-course-print-summary-card,
        .teacher-course-print-skill-card {
          padding: 0.7rem 0.8rem;
        }

        .teacher-course-print-summary-card strong,
        .teacher-course-print-skill-card strong {
          display: block;
          margin-top: 0.2rem;
          font-size: 0.98rem;
        }

        .teacher-course-print-sections {
          display: grid;
          gap: 0.7rem;
        }

        .teacher-course-print-section-head {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: flex-start;
          margin-bottom: 0.65rem;
        }

        .teacher-course-print-items {
          display: grid;
          gap: 0.45rem;
        }

        .teacher-course-print-item {
          padding: 0.55rem 0.65rem;
          border-radius: 12px;
        }

        .teacher-course-print-item.is-correct {
          border-color: rgba(34, 197, 94, 0.5);
          background: linear-gradient(180deg, rgba(19, 59, 37, 0.46), rgba(12, 24, 46, 0.98));
        }

        .teacher-course-print-item.is-partial {
          border-color: rgba(245, 158, 11, 0.48);
          background: linear-gradient(180deg, rgba(95, 61, 10, 0.38), rgba(12, 24, 46, 0.98));
        }

        .teacher-course-print-item.is-wrong {
          border-color: rgba(239, 68, 68, 0.42);
          background: linear-gradient(180deg, rgba(89, 20, 23, 0.34), rgba(12, 24, 46, 0.98));
        }

        .teacher-course-print-item-head {
          display: flex;
          justify-content: space-between;
          gap: 0.75rem;
          align-items: flex-start;
          margin-bottom: 0.4rem;
        }

        .teacher-course-print-item-head > div {
          display: grid;
          gap: 0.15rem;
        }

        .teacher-course-print-item-head strong {
          font-size: 0.95rem;
          line-height: 1.25;
        }

        .teacher-course-print-item-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.15rem 0.7rem;
        }

        .teacher-course-print-detail-row {
          display: grid;
          grid-template-columns: 92px minmax(0, 1fr);
          gap: 0.45rem;
          align-items: start;
          padding: 0.08rem 0;
        }

        .teacher-course-print-detail-row p {
          white-space: pre-wrap;
          word-break: break-word;
        }

        .teacher-course-print-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 0.22rem 0.55rem;
          font-size: 0.72rem;
          font-weight: 800;
          background: rgba(96, 165, 250, 0.16);
          color: #dbeafe;
          border: 1px solid rgba(96, 165, 250, 0.28);
          white-space: nowrap;
        }

        .teacher-course-print-chip.is-reviewed,
        .teacher-course-print-chip.is-correct {
          background: rgba(34, 197, 94, 0.16);
          border-color: rgba(34, 197, 94, 0.34);
          color: #bbf7d0;
        }

        .teacher-course-print-chip.is-pending,
        .teacher-course-print-chip.is-partial,
        .teacher-course-print-chip.is-penalty {
          background: rgba(245, 158, 11, 0.16);
          border-color: rgba(245, 158, 11, 0.34);
          color: #fde68a;
        }

        .teacher-course-print-chip.is-wrong {
          background: rgba(239, 68, 68, 0.16);
          border-color: rgba(239, 68, 68, 0.34);
          color: #fecaca;
        }

        @media (max-width: 720px) {
          .teacher-course-print-header,
          .teacher-course-print-section-head,
          .teacher-course-print-item-head {
            grid-template-columns: 1fr;
            display: grid;
          }

          .teacher-course-print-item-grid {
            grid-template-columns: 1fr;
          }

          .teacher-course-print-detail-row {
            grid-template-columns: 1fr;
            gap: 0.15rem;
          }

          .teacher-course-print-toolbar {
            justify-content: stretch;
          }

          .teacher-course-print-toolbar > * {
            flex: 1 1 100%;
          }
        }

        @media print {
          @page {
            margin: 12mm;
            size: A4 portrait;
          }

          body {
            background: #ffffff !important;
          }

          .no-print,
          header,
          footer,
          nav {
            display: none !important;
          }

          .teacher-course-print-page,
          .teacher-course-print-shell {
            max-width: none;
            padding: 0;
            color: #111827;
            background: #ffffff !important;
            font-size: 11px;
          }

          .teacher-course-print-card,
          .teacher-course-print-header,
          .teacher-course-print-summary-card,
          .teacher-course-print-skill-card,
          .teacher-course-print-section,
          .teacher-course-print-item {
            color: #111827;
            background: #ffffff !important;
            box-shadow: none;
            border-color: #cbd5e1;
          }

          .teacher-course-print-header,
          .teacher-course-print-summary-card,
          .teacher-course-print-skill-card,
          .teacher-course-print-item {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .teacher-course-print-header,
          .teacher-course-print-card,
          .teacher-course-print-section {
            padding: 0.55rem 0.65rem;
          }

          .teacher-course-print-summary,
          .teacher-course-print-skills,
          .teacher-course-print-sections,
          .teacher-course-print-items {
            gap: 0.35rem;
            margin-bottom: 0.45rem;
          }

          .teacher-course-print-summary-card,
          .teacher-course-print-skill-card,
          .teacher-course-print-item {
            padding: 0.38rem 0.45rem;
          }

          .teacher-course-print-header h1,
          .teacher-course-print-section h2 {
            margin: 0.08rem 0;
          }

          .teacher-course-print-subtitle {
            display: none;
          }

          .teacher-course-print-item-head {
            margin-bottom: 0.18rem;
          }

          .teacher-course-print-item-head strong {
            font-size: 11px;
            line-height: 1.2;
          }

          .teacher-course-print-item-number,
          .teacher-course-print-kicker,
          .teacher-course-print-summary-card span,
          .teacher-course-print-skill-card span,
          .teacher-course-print-detail-row span {
            font-size: 8.5px;
            letter-spacing: 0.04em;
          }

          .teacher-course-print-item-grid {
            gap: 0.05rem 0.45rem;
          }

          .teacher-course-print-detail-row {
            grid-template-columns: 70px minmax(0, 1fr);
            gap: 0.3rem;
          }

          .teacher-course-print-detail-row p,
          .teacher-course-print-section-head p,
          .teacher-course-print-card p {
            line-height: 1.2;
          }

          .teacher-course-print-chip {
            padding: 0.08rem 0.35rem;
            font-size: 8.5px;
            border-width: 1px;
          }

          .teacher-course-print-item.is-correct {
            background: #eefbf2 !important;
            border-color: #86efac;
          }

          .teacher-course-print-item.is-partial {
            background: #fff7e7 !important;
            border-color: #fcd34d;
          }

          .teacher-course-print-item.is-wrong {
            background: #fff1f2 !important;
            border-color: #fda4af;
          }

          .teacher-course-print-subtitle,
          .teacher-course-print-section-head p,
          .teacher-course-print-detail-row p,
          .teacher-course-print-card p {
            color: #334155;
          }

          .teacher-course-print-kicker,
          .teacher-course-print-summary-card span,
          .teacher-course-print-skill-card span,
          .teacher-course-print-detail-row span,
          .teacher-course-print-item-number {
            color: #475569;
          }

          .teacher-course-print-chip {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
