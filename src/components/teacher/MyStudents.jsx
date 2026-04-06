import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { getHubCourseTestTemplate } from "../../data/hubCourseTestTemplates.js";
import {
  db,
  fetchHubGrammarSubmissions,
  fetchWritingP1Sessions,
  fetchWritingP2Submissions,
  fetchWritingP3Submissions,
  fetchWritingP4Submissions,
} from "../../firebase";
import { fetchItemsByIds } from "../../api/grammar";
import { toast } from "../../utils/toast";

const TEACHER_NOTIFICATION_LIMIT = 100;

function timestampToMs(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (value.seconds) return value.seconds * 1000;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDate(value) {
  const ms = timestampToMs(value);
  if (!ms) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(ms);
}

function formatRelative(value) {
  const ms = timestampToMs(value);
  if (!ms) return "No recent activity";
  const diffMs = Date.now() - ms;
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) === 1 ? "" : "s"} ago`;
  return formatDate(value);
}

function looksLikeHtml(text = "") {
  return /<([a-z][\w:-]*)\b[^>]*>/i.test(text);
}

function toSubmissionPlainText(html = "", text = "") {
  if (html && looksLikeHtml(html)) {
    let normalized = String(html).replace(/^\u200E+/, "");
    normalized = normalized
      .replace(/<\/p\s*>/gi, "\n\n")
      .replace(/<\/div\s*>/gi, "\n\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/h[1-6]\s*>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\r\n/g, "\n");

    return normalized.replace(/\n{3,}/g, "\n\n").trimEnd();
  }

  return String(text || "").replace(/\r\n/g, "\n");
}

function escapeHtml(text = "") {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escHtml(text = "") {
  const safe = String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return safe.replace(/\n/g, "<br/>");
}

function plainTextToClipboardHtml(text = "") {
  const safe = escapeHtml(String(text || "").replace(/\r\n/g, "\n"));
  const paragraphs = safe.split(/\n{2,}/).map((chunk) => chunk.replace(/\n/g, "<br/>"));
  return `<p>${paragraphs.join("</p><p>")}</p>`;
}

async function copyHtmlWithFallback({ html = "", text = "" }) {
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const item = new window.ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" }),
      });
      await navigator.clipboard.write([item]);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    toast("Submission copied with formatting.");
  } catch (error) {
    console.warn("[MyStudents] Copy submission failed", error);
    toast("Could not copy that submission.");
  }
}

function plainFromEmail({ html = "", text = "" }) {
  if (html && /<([a-z][\w:-]*)\b[^>]*>/i.test(html)) {
    let s = html;
    s = s
      .replace(/<\/p\s*>/gi, "\n\n")
      .replace(/<\/div\s*>/gi, "\n\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/h[1-6]\s*>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\r\n/g, "\n");

    s = s.replace(/\n{3,}/g, "\n\n").trimEnd();
    return s;
  }

  return String(text || "").replace(/\r\n/g, "\n");
}

function htmlFromPlainEmail(text = "") {
  const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
  const paragraphs = [];
  let buffer = [];

  const flush = () => {
    const joined = buffer.join(" ").trim();
    paragraphs.push(joined.length ? escHtml(joined) : "&nbsp;");
    buffer = [];
  };

  for (const line of lines) {
    if (line.trim() === "") flush();
    else buffer.push(line.trim());
  }

  flush();
  return `<p>${paragraphs.join("</p><p>")}</p>`;
}

function robustEmailForClipboard({ html = "", text = "" }) {
  const plain = plainFromEmail({ html, text });
  return htmlFromPlainEmail(plain);
}

function buildActivitySummary(studentId, attemptStats, submissionBundle) {
  const attemptMeta = attemptStats[studentId] || null;
      const latestWriting = (submissionBundle?.recentWriting || [])
    .slice()
    .sort((a, b) => timestampToMs(b.createdAt) - timestampToMs(a.createdAt))[0] || null;
  const latestGrammar = (submissionBundle?.grammarSubmissions || [])
    .slice()
    .sort((a, b) => timestampToMs(b.createdAt) - timestampToMs(a.createdAt))[0] || null;
  const latestAttemptAt = attemptMeta?.latestSubmittedAt || null;

  const candidates = [
    latestWriting
      ? {
          kind: `Writing ${latestWriting.partLabel}`,
          createdAt: latestWriting.createdAt,
          detail:
            latestWriting.partLabel === "P2"
              ? `${latestWriting.counts?.answer || 0} words`
              : latestWriting.partLabel === "P3"
                ? `${(latestWriting.counts || []).join(" / ")} words`
                : `${latestWriting.counts?.friend || 0} + ${latestWriting.counts?.formal || 0} words`,
        }
      : null,
    latestGrammar
      ? {
          kind: latestGrammar.activityTitle || "Hub grammar",
          createdAt: latestGrammar.createdAt,
          detail:
            latestGrammar.total != null && latestGrammar.correct != null
              ? `${latestGrammar.correct}/${latestGrammar.total}`
              : latestGrammar.score != null
                ? `${latestGrammar.score}%`
                : "Completed",
        }
      : null,
    latestAttemptAt
      ? {
          kind: "Teacher quiz",
          createdAt: latestAttemptAt,
          detail:
            attemptMeta?.count > 0
              ? `${attemptMeta.count} attempt${attemptMeta.count === 1 ? "" : "s"}`
              : "",
        }
      : null,
  ].filter(Boolean);

  const latestActivity = candidates.sort((a, b) => timestampToMs(b.createdAt) - timestampToMs(a.createdAt))[0] || null;

  return {
    latestWriting,
    latestGrammar,
    latestActivity,
  };
}

function getAttemptLabel(ans = {}) {
  return (
    ans?.prompt ||
    ans?.title ||
    ans?.gappedSentence ||
    ans?.gapFill ||
    ans?.sentence ||
    ans?.text ||
    `Item ${ans?.itemId || "?"}`
  );
}

function renderSavedGrammarSentence(parts, gaps = []) {
  if (!Array.isArray(parts) || !parts.length) return null;

  const gapMap = new Map(gaps.map((gap) => [gap.gapId, gap]));

  return parts.map((part, index) => {
    if (typeof part === "string") {
      return <React.Fragment key={`part-${index}`}>{part}</React.Fragment>;
    }

    const gap = gapMap.get(part.gapId);
    return (
      <span key={`gap-${part.gapId}`} style={{ fontWeight: 700, color: "#eef4ff" }}>
        {gap?.answer || "_____"}
      </span>
    );
  });
}

function normalizeReviewAnswer(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function getCourseTestAutoItemScore(item, answer) {
  if (item?.type === "choice") {
    if (Array.isArray(item.acceptedAnswerIndexes) && item.acceptedAnswerIndexes.length) {
      return item.acceptedAnswerIndexes.map(String).includes(String(answer)) ? 1 : 0;
    }
    return String(answer) === String(item.answerIndex) ? 1 : 0;
  }
  if (item?.type === "stress-choice") return String(answer) === String(item.answerIndex) ? 1 : 0;
  if (item?.type === "matching-select") {
    const normalized = normalizeReviewAnswer(answer);
    if (Array.isArray(item.acceptedAnswers) && item.acceptedAnswers.length) {
      return item.acceptedAnswers.some((entry) => normalizeReviewAnswer(entry) === normalized) ? 1 : 0;
    }
    return normalized === normalizeReviewAnswer(item.answer) ? 1 : 0;
  }

  if (isSortBySoundItem(item)) {
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

function isCourseTestItemCorrect(item, answer) {
  return getCourseTestAutoItemScore(item, answer) >= 1;
}

function formatCourseTestAnswer(item, answer) {
  if (!answer || (typeof answer === "string" && !answer.trim())) return "—";
  if (isInlineTextInputItem(item) && hasPerGapAcceptedAnswers(item)) {
    const answerMap = answer && typeof answer === "object" ? answer : {};
    return item.inlineParts
      .filter((part) => part && typeof part === "object" && part.gapId)
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
  return String(answer);
}

function formatCourseTestKey(item) {
  if (isInlineTextInputItem(item) && hasPerGapAcceptedAnswers(item)) {
    return Object.entries(item.inlineAcceptedAnswers || {})
      .map(([gapId, values], index) => `Gap ${index + 1}: ${(values || []).join(" / ")}`)
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
      return item.acceptedAnswers.join(" / ");
    }
    return item.answer || "—";
  }

  if (isSortBySoundItem(item)) {
    return item.answer || "—";
  }
  if (Array.isArray(item?.acceptedAnswers)) return item.acceptedAnswers.join(" / ");
  return "—";
}

function buildCourseTestSectionBreakdown(template, attempt) {
  if (!template || !attempt) return [];
  const answers = attempt.runnerState?.sectionAnswers || {};
  const teacherItemScores = attempt.teacherReview?.itemScores || {};
  const bySkill = new Map();

  (template.sections || []).forEach((section) => {
    const skill = section.skill || section.id;
    if (!bySkill.has(skill)) {
      bySkill.set(skill, {
        skill,
        label:
          skill === "grammar"
            ? "Grammar"
            : skill === "vocabulary"
              ? "Vocabulary"
              : skill === "pronunciation"
                ? "Pronunciation"
                : skill === "practical-english"
                  ? "Practical English"
                : skill === "reading"
                  ? "Reading"
                  : skill === "listening"
                    ? "Listening"
                    : skill,
        score: 0,
        total: 0,
        sections: [],
      });
    }

    const group = bySkill.get(skill);
    const reviewItems = (section.items || []).map((item) => {
      const answer = answers?.[section.id]?.[item.id];
      const key = `${section.id}:${item.id}`;
      const autoScore = getCourseTestAutoItemScore(item, answer);
      const autoCorrect = autoScore >= 1;
      const assignedScore =
        teacherItemScores[key] != null ? Number(teacherItemScores[key]) : autoScore;

      group.score += assignedScore;
      group.total += 1;

      return { item, answer, autoCorrect, autoScore, assignedScore };
    });

    group.score -= getSortBySoundPenalty(section, answers?.[section.id] || {});
    group.score = Math.max(0, group.score);

    group.sections.push({
      id: section.id,
      title: section.title,
      penalty: getSortBySoundPenalty(section, answers?.[section.id] || {}),
      reviewItems,
    });
  });

  return Array.from(bySkill.values());
}

export default function MyStudents({ user }) {
  const navigate = useNavigate();
  const latestReadMapRef = useRef({});
  const persistQueueRef = useRef(Promise.resolve());
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attemptStats, setAttemptStats] = useState({});
  const [grammarCompletionNotifications, setGrammarCompletionNotifications] = useState([]);
  const [courseTestNotifications, setCourseTestNotifications] = useState([]);
  const [submissionStats, setSubmissionStats] = useState({});
  const [rosterMeta, setRosterMeta] = useState({});
  const [classDrafts, setClassDrafts] = useState({});
  const [savingStudentId, setSavingStudentId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [readSubmissionKeys, setReadSubmissionKeys] = useState({});
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedAttemptItemsById, setSelectedAttemptItemsById] = useState({});

  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return <p>⛔ Only teachers and admins can view this page.</p>;
  }

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);

      const usersCol = collection(db, "users");
      const studentQuery = query(usersCol, where("teacherId", "==", user.uid));
      const [studentSnap, rosterSnap, attemptsResult, courseAttemptsResult, dashboardResult, setsResult] = await Promise.all([
        getDocs(studentQuery),
        getDocs(collection(db, "users", user.uid, "studentRoster")),
        getDocs(query(collection(db, "grammarSetAttempts"), where("ownerUid", "==", user.uid))).catch((error) => {
          console.warn("[MyStudents] Could not load grammarSetAttempts for teacher", error);
          return null;
        }),
        getDocs(query(collection(db, "courseTestAttempts"), where("teacherUid", "==", user.uid))).catch((error) => {
          console.warn("[MyStudents] Could not load courseTestAttempts for teacher", error);
          return null;
        }),
        getDoc(doc(db, "users", user.uid, "teacherDashboards", "myStudents")).catch((error) => {
          console.warn("[MyStudents] Could not load teacher dashboard state", error);
          return null;
        }),
        getDocs(query(collection(db, "grammarSets"), where("ownerId", "==", user.uid))).catch((error) => {
          console.warn("[MyStudents] Could not load grammar sets for teacher", error);
          return null;
        }),
      ]);

      if (!alive) return;

      const studentRows = studentSnap.docs.map((entry) => ({
        id: entry.id,
        ...entry.data(),
      }));

      const attemptsSnap = attemptsResult || { forEach: () => {} };
      const courseAttemptsSnap = courseAttemptsResult || { forEach: () => {} };
      const dashboardSnap = dashboardResult;
      const setsSnap = setsResult || { forEach: () => {} };

      const nextRosterMeta = {};
      rosterSnap.forEach((entry) => {
        nextRosterMeta[entry.id] = entry.data() || {};
      });

      const nextTeacherSetsById = {};
      setsSnap.forEach((entry) => {
        nextTeacherSetsById[entry.id] = { id: entry.id, ...entry.data() };
      });

      const nextAttemptStats = {};
      const studentLabelById = studentRows.reduce((acc, studentRow) => {
        acc[studentRow.id] =
          studentRow.displayName || studentRow.name || studentRow.username || studentRow.email || studentRow.id;
        return acc;
      }, {});
      const nextGrammarNotifications = [];
      const nextCourseTestNotifications = [];

      attemptsSnap.forEach((entry) => {
        const data = entry.data() || {};
        const studentUid = data.studentUid;
        if (!studentUid) return;

        if (!nextAttemptStats[studentUid]) {
          nextAttemptStats[studentUid] = {
            count: 0,
            totalPercent: 0,
            avgPercent: 0,
            latestSubmittedAt: null,
          };
        }

        nextAttemptStats[studentUid].count += 1;
        nextAttemptStats[studentUid].totalPercent += Number(data.percent || 0);

        const currentLatest = timestampToMs(nextAttemptStats[studentUid].latestSubmittedAt);
        const candidateLatest = data.updatedAt || data.submittedAt || null;
        if (timestampToMs(candidateLatest) > currentLatest) {
          nextAttemptStats[studentUid].latestSubmittedAt = candidateLatest;
        }

        nextGrammarNotifications.push({
          id: `grammar-set:${entry.id}`,
          kind: "grammar-set",
          studentId: studentUid,
          studentLabel:
            data.studentName ||
            data.studentEmail ||
            studentLabelById[studentUid] ||
            studentUid,
          createdAt: candidateLatest,
          title: data.setTitle || data.title || "Grammar set",
          setId: data.setId || null,
          setType: nextTeacherSetsById[data.setId]?.setType || "grammar_set",
          setMeta: nextTeacherSetsById[data.setId] || null,
          percent: Number(data.percent || 0),
          correct: data.correctCount ?? data.correct ?? null,
          total: data.totalQuestions ?? data.total ?? null,
          checkedCount: data.checkedCount ?? data.totalQuestions ?? data.total ?? null,
          completed: !!data.completed,
          answers: Array.isArray(data.answers) ? data.answers : [],
        });
      });

      courseAttemptsSnap.forEach((entry) => {
        const data = entry.data() || {};
        if (!data.completed && !data.submittedAt) return;

        const template = data.templateId ? getHubCourseTestTemplate(data.templateId) : null;
        nextCourseTestNotifications.push({
          id: `course-test:${entry.id}`,
          kind: "course-test",
          attemptId: entry.id,
          studentId: data.studentUid || "",
          studentLabel:
            data.studentName ||
            data.studentEmail ||
            studentLabelById[data.studentUid] ||
            data.studentUid ||
            "Student",
          createdAt: data.submittedAt || data.updatedAt || data.startedAt || null,
          title: data.templateTitle || template?.title || "Course test",
          attempt: { id: entry.id, ...data },
          template,
        });
      });

      Object.keys(nextAttemptStats).forEach((studentUid) => {
        const row = nextAttemptStats[studentUid];
        row.avgPercent = row.count > 0 ? Math.round(row.totalPercent / row.count) : 0;
      });

      setStudents(studentRows);
      setRosterMeta(nextRosterMeta);
      setClassDrafts(
        studentRows.reduce((acc, studentRow) => {
          acc[studentRow.id] = nextRosterMeta[studentRow.id]?.className || "";
          return acc;
        }, {})
      );
      setAttemptStats(nextAttemptStats);
      const loadedReadMap = dashboardSnap?.exists?.() ? dashboardSnap.data()?.readSubmissionKeys || {} : {};
      latestReadMapRef.current = loadedReadMap;
      setReadSubmissionKeys(loadedReadMap);

      const statsEntries = await Promise.all(
        studentRows.map(async (studentRow) => {
          const [part1, part2, part3, part4, grammar] = await Promise.all([
            fetchWritingP1Sessions(3, studentRow.id),
            fetchWritingP2Submissions(3, studentRow.id),
            fetchWritingP3Submissions(3, studentRow.id),
            fetchWritingP4Submissions(3, studentRow.id),
            fetchHubGrammarSubmissions(3, studentRow.id),
          ]);

          const recentWriting = [
            ...part1.map((entry) => ({ ...entry, partLabel: "P1" })),
            ...part2.map((entry) => ({ ...entry, partLabel: "P2" })),
            ...part3.map((entry) => ({ ...entry, partLabel: "P3" })),
            ...part4.map((entry) => ({ ...entry, partLabel: "P4" })),
          ].sort((a, b) => timestampToMs(b.createdAt) - timestampToMs(a.createdAt));

          return [
            studentRow.id,
            {
              recentWriting,
              grammarSubmissions: grammar || [],
            },
          ];
        })
      );

      if (!alive) return;
      setGrammarCompletionNotifications(nextGrammarNotifications);
      setCourseTestNotifications(nextCourseTestNotifications);
      setSubmissionStats(Object.fromEntries(statsEntries));
      setLoading(false);
    }

    load().catch((error) => {
      console.error("Error loading students:", error);
      if (alive) setLoading(false);
    });

    return () => {
      alive = false;
    };
  }, [user.uid]);

  useEffect(() => {
    latestReadMapRef.current = readSubmissionKeys;
  }, [readSubmissionKeys]);

  function persistReadMap(nextReadMap) {
    persistQueueRef.current = persistQueueRef.current
      .catch(() => {})
      .then(() =>
        setDoc(
          doc(db, "users", user.uid, "teacherDashboards", "myStudents"),
          {
            readSubmissionKeys: nextReadMap,
            updatedAt: serverTimestamp(),
          }
        )
      )
      .catch((error) => {
        console.error("[MyStudents] Could not persist notification state", error);
        throw error;
      });

    return persistQueueRef.current;
  }

  async function saveClassName(studentId) {
    setSavingStudentId(studentId);
    const nextClassName = (classDrafts[studentId] || "").trim();

    try {
      await setDoc(
        doc(db, "users", user.uid, "studentRoster", studentId),
        {
          className: nextClassName,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setRosterMeta((prev) => ({
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          className: nextClassName,
        },
      }));
    } catch (error) {
      console.error("[MyStudents] Could not save class name", error);
      window.alert("Could not save that class name.");
    } finally {
      setSavingStudentId("");
    }
  }

  async function markSubmissionRead(notificationKey) {
    if (!notificationKey || latestReadMapRef.current[notificationKey]) return;

    const nextReadMap = {
      ...latestReadMapRef.current,
      [notificationKey]: true,
    };
    latestReadMapRef.current = nextReadMap;
    setReadSubmissionKeys(nextReadMap);

    await persistReadMap(nextReadMap);
  }

  async function markSubmissionUnread(notificationKey) {
    if (!notificationKey || !latestReadMapRef.current[notificationKey]) return;

    const nextReadMap = { ...latestReadMapRef.current };
    delete nextReadMap[notificationKey];
    latestReadMapRef.current = nextReadMap;
    setReadSubmissionKeys(nextReadMap);

    await persistReadMap(nextReadMap);
    toast("Marked as unread.");
  }

  const classOptions = useMemo(() => {
    const values = new Set();
    Object.values(rosterMeta).forEach((meta) => {
      if (meta?.className) values.add(meta.className);
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [rosterMeta]);

  const hydratedStudents = useMemo(() => {
    return students.map((studentRow) => {
      const meta = rosterMeta[studentRow.id] || {};
      const summary = buildActivitySummary(studentRow.id, attemptStats, submissionStats[studentRow.id] || {});
      return {
        ...studentRow,
        className: meta.className || "",
        attemptMeta: attemptStats[studentRow.id] || { count: 0, avgPercent: 0, latestSubmittedAt: null },
        activitySummary: summary,
      };
    });
  }, [students, rosterMeta, attemptStats, submissionStats]);

  const filteredStudents = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();

    const result = hydratedStudents.filter((studentRow) => {
      const label = studentRow.displayName || studentRow.name || studentRow.username || studentRow.email || studentRow.id;
      const matchesSearch =
        !needle ||
        label.toLowerCase().includes(needle) ||
        (studentRow.email || "").toLowerCase().includes(needle) ||
        (studentRow.className || "").toLowerCase().includes(needle);

      const matchesClass = classFilter === "all" || (studentRow.className || "") === classFilter;
      return matchesSearch && matchesClass;
    });

    result.sort((a, b) => {
      if (sortBy === "name") {
        const aLabel = a.displayName || a.name || a.username || a.email || a.id;
        const bLabel = b.displayName || b.name || b.username || b.email || b.id;
        return aLabel.localeCompare(bLabel);
      }

      if (sortBy === "joined") {
        return timestampToMs(b.createdAt) - timestampToMs(a.createdAt);
      }

      if (sortBy === "grammar") {
        return (b.attemptMeta?.count || 0) - (a.attemptMeta?.count || 0);
      }

      return (
        timestampToMs(b.activitySummary?.latestActivity?.createdAt) -
        timestampToMs(a.activitySummary?.latestActivity?.createdAt)
      );
    });

    return result;
  }, [classFilter, hydratedStudents, searchTerm, sortBy]);

  const summary = useMemo(() => {
    const recentThreshold = Date.now() - 14 * 86400000;
    const activeCount = hydratedStudents.filter(
      (studentRow) => timestampToMs(studentRow.activitySummary?.latestActivity?.createdAt) >= recentThreshold
    ).length;
    const writingCount = hydratedStudents.filter((studentRow) => studentRow.activitySummary?.latestWriting).length;
    return {
      total: hydratedStudents.length,
      activeCount,
      writingCount,
    };
  }, [hydratedStudents]);

  const writingNotifications = useMemo(() => {
    return hydratedStudents.flatMap((studentRow) =>
      (submissionStats[studentRow.id]?.recentWriting || []).map((entry) => ({
        id: `${studentRow.id}:${entry.partLabel}:${entry.id}`,
        kind: "writing",
        studentId: studentRow.id,
        studentLabel:
          studentRow.displayName || studentRow.name || studentRow.username || studentRow.email || studentRow.id,
        createdAt: entry.createdAt,
        partLabel: entry.partLabel,
        submission: entry,
      }))
    );
  }, [hydratedStudents, submissionStats]);

  const miniTestNotifications = useMemo(() => {
    return hydratedStudents.flatMap((studentRow) =>
      (submissionStats[studentRow.id]?.grammarSubmissions || []).map((entry) => ({
        id: `mini-test:${studentRow.id}:${entry.id}`,
        kind: "mini-test",
        studentId: studentRow.id,
        studentLabel:
          studentRow.displayName || studentRow.name || studentRow.username || studentRow.email || studentRow.id,
        createdAt: entry.createdAt,
        title: entry.activityTitle || "Mini grammar test",
        submission: entry,
      }))
    );
  }, [hydratedStudents, submissionStats]);

  const teacherNotifications = useMemo(() => {
    return [...writingNotifications, ...grammarCompletionNotifications, ...miniTestNotifications, ...courseTestNotifications]
      .sort((a, b) => timestampToMs(b.createdAt) - timestampToMs(a.createdAt))
      .slice(0, TEACHER_NOTIFICATION_LIMIT);
  }, [courseTestNotifications, grammarCompletionNotifications, miniTestNotifications, writingNotifications]);

  const unreadNotificationCount = useMemo(() => {
    return teacherNotifications.filter((entry) => !readSubmissionKeys[entry.id]).length;
  }, [readSubmissionKeys, teacherNotifications]);

  function openNotification(entry) {
    setSelectedNotification(entry);
    setSelectedAttemptItemsById({});
    void markSubmissionRead(entry.id);
  }

  useEffect(() => {
    let alive = true;

    async function loadAttemptItems() {
      if (!selectedNotification || selectedNotification.kind !== "grammar-set") {
        if (alive) setSelectedAttemptItemsById({});
        return;
      }

      if (Array.isArray(selectedNotification.setMeta?.quizItems) && selectedNotification.setMeta.quizItems.length) {
        if (!alive) return;
        setSelectedAttemptItemsById(
          selectedNotification.setMeta.quizItems.reduce((acc, item) => {
            if (item?.id != null) acc[item.id] = item;
            return acc;
          }, {})
        );
        return;
      }

      const itemIds = Array.from(
        new Set(
          (selectedNotification.answers || [])
            .map((ans) => ans?.itemId)
            .filter((id) => typeof id === "string" || typeof id === "number")
        )
      );

      if (!itemIds.length) {
        if (alive) setSelectedAttemptItemsById({});
        return;
      }

      try {
        const items = await fetchItemsByIds(itemIds);
        if (!alive) return;
        setSelectedAttemptItemsById(
          (items || []).reduce((acc, item) => {
            if (item?.id != null) acc[item.id] = item;
            return acc;
          }, {})
        );
      } catch (error) {
        console.error("[MyStudents] Could not load grammar attempt items", error);
        if (alive) setSelectedAttemptItemsById({});
      }
    }

    loadAttemptItems();

    return () => {
      alive = false;
    };
  }, [selectedNotification]);

async function copySelectedSubmission() {
    if (!selectedNotification || selectedNotification.kind !== "writing") return;

    const sections = [];

    if (selectedNotification.partLabel === "P1") {
      (selectedNotification.submission.items || []).forEach((item, index) => {
        sections.push({
          heading: item.prompt || `Prompt ${index + 1}`,
          html: plainTextToClipboardHtml(item.answer || item.response || "—"),
          text: toSubmissionPlainText("", item.answer || item.response || "—"),
        });
      });
    }

    if (selectedNotification.partLabel === "P2") {
      sections.push({
        heading: "Answer",
        html: robustEmailForClipboard({
          html: selectedNotification.submission.answerHTML,
          text: selectedNotification.submission.answerText || "—",
        }),
        text: toSubmissionPlainText(
          selectedNotification.submission.answerHTML,
          selectedNotification.submission.answerText || "—"
        ),
      });
    }

    if (selectedNotification.partLabel === "P3") {
      (selectedNotification.submission.answersText || []).forEach((answer, index) => {
        sections.push({
          heading: `Reply ${index + 1}`,
          html: robustEmailForClipboard({
            html: selectedNotification.submission.answersHTML?.[index],
            text: answer || "—",
          }),
          text: toSubmissionPlainText(
            selectedNotification.submission.answersHTML?.[index],
            answer || "—"
          ),
        });
      });
    }

    if (selectedNotification.partLabel === "P4") {
      sections.push({
        heading: "Informal email",
        html: robustEmailForClipboard({
          html: selectedNotification.submission.friendHTML,
          text: selectedNotification.submission.friendText || "—",
        }),
        text: toSubmissionPlainText(
          selectedNotification.submission.friendHTML,
          selectedNotification.submission.friendText || "—"
        ),
      });
      sections.push({
        heading: "Formal email",
        html: robustEmailForClipboard({
          html: selectedNotification.submission.formalHTML,
          text: selectedNotification.submission.formalText || "—",
        }),
        text: toSubmissionPlainText(
          selectedNotification.submission.formalHTML,
          selectedNotification.submission.formalText || "—"
        ),
      });
    }

    const plain = [
      `${selectedNotification.partLabel} submission`,
      `${selectedNotification.studentLabel}`,
      `${formatDate(selectedNotification.createdAt)}`,
      "",
      ...sections.flatMap((section) => [section.heading, section.text, ""]),
    ].join("\n").trim();

    const html = `
      <div>
        <h3 style="margin:0 0 .35rem 0;">${escapeHtml(selectedNotification.partLabel)} submission</h3>
        <p style="margin:.25rem 0;"><strong>${escapeHtml(selectedNotification.studentLabel)}</strong></p>
        <p style="margin:.25rem 0 1rem 0;"><em>${escapeHtml(formatDate(selectedNotification.createdAt))}</em></p>
        ${sections
          .map(
            (section) => `
              <h4 style="margin:.9rem 0 .35rem 0;">${escapeHtml(section.heading)}</h4>
              ${section.html || plainTextToClipboardHtml(section.text)}
            `
          )
          .join("")}
      </div>
    `;

    await copyHtmlWithFallback({ html, text: plain });
  }

  return (
    <div className="my-students-page">
      <div className="my-students-topbar">
        <button className="review-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="teacher-notifications">
          <button type="button" className="teacher-notify-btn" onClick={() => setNotificationOpen((prev) => !prev)}>
            <span aria-hidden="true">🔔</span>
            <span>Notifications</span>
            {unreadNotificationCount > 0 ? <span className="teacher-notify-count">{unreadNotificationCount}</span> : null}
          </button>

          {notificationOpen ? (
            <div className="teacher-notify-panel">
              <div className="teacher-notify-head">
                <strong>Latest student activity</strong>
                <span>{teacherNotifications.length} shown</span>
              </div>

              {teacherNotifications.length ? (
                <div className="teacher-notify-list">
                  {teacherNotifications.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      className={`teacher-notify-item ${readSubmissionKeys[entry.id] ? "" : "is-unread"}`}
                      onClick={() => openNotification(entry)}
                    >
                      <div>
                        <strong>{entry.studentLabel}</strong>
                        <span>
                          {entry.kind === "writing"
                            ? `${entry.partLabel} submission`
                            : entry.kind === "course-test"
                              ? `${entry.attempt?.reviewStatus === "reviewed" ? "Course test reviewed" : "Course test submitted"} · ${entry.title}`
                            : entry.kind === "mini-test"
                              ? `Mini test completed · ${entry.title}`
                            : `${
                                entry.setType === "use_of_english_custom"
                                  ? "Use of English quiz completed"
                                  : "Grammar set completed"
                              } · ${entry.title}`}
                        </span>
                      </div>
                      <em>{formatRelative(entry.createdAt)}</em>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="muted" style={{ margin: 0 }}>No teacher notifications yet.</p>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <header className="my-students-hero">
        <h1>My students</h1>
        <p>
          Organise your learners, add simple class labels, and keep an eye on recent grammar and writing activity in
          one place.
        </p>
      </header>

      <section className="my-students-summary">
        <div className="my-students-stat">
          <span>Total students</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="my-students-stat">
          <span>Active in last 14 days</span>
          <strong>{summary.activeCount}</strong>
        </div>
        <div className="my-students-stat">
          <span>Students with writing</span>
          <strong>{summary.writingCount}</strong>
        </div>
      </section>

      <section className="my-students-controls">
        <label className="field">
          <span>Search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, email, or class"
          />
        </label>

        <label className="field">
          <span>Class</span>
          <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
            <option value="all">All classes</option>
            {classOptions.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Sort by</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="recent">Recent activity</option>
            <option value="joined">Newest students</option>
            <option value="name">Name</option>
            <option value="grammar">Grammar attempts</option>
          </select>
        </label>
      </section>

      {loading && <p className="muted">Loading students…</p>}

      {!loading && students.length === 0 && (
        <p className="muted">
          No students are linked to you yet. An admin can assign students to you from the Admin Dashboard.
        </p>
      )}

      {!loading && filteredStudents.length > 0 && (
        <div className="my-students-list">
          {filteredStudents.map((studentRow) => {
            const label =
              studentRow.displayName || studentRow.name || studentRow.username || studentRow.email || studentRow.id;
            const latestActivity = studentRow.activitySummary?.latestActivity;
            const latestWriting = studentRow.activitySummary?.latestWriting;
            const latestGrammar = studentRow.activitySummary?.latestGrammar;
            const isSaving = savingStudentId === studentRow.id;

            return (
              <article key={studentRow.id} className="student-card">
                <div className="student-card-head">
                  <div className="student-identity">
                    <h3>{label}</h3>
                    <p>{studentRow.email || "No email on file"}</p>
                    {studentRow.username ? <span className="student-handle">@{studentRow.username}</span> : null}
                  </div>

                  <div className="student-chip-row">
                    {studentRow.className ? <span className="student-chip is-class">{studentRow.className}</span> : null}
                    <span className={`student-chip ${latestActivity ? "is-active" : ""}`}>
                      {latestActivity ? formatRelative(latestActivity.createdAt) : "No recent activity"}
                    </span>
                  </div>
                </div>

                <div className="student-row-main">
                  <div className="student-meta-grid">
                    <div className="student-meta">
                      <span>Joined</span>
                      <strong>{formatDate(studentRow.createdAt)}</strong>
                    </div>
                    <div className="student-meta">
                      <span>Grammar sets</span>
                      <strong>
                        {studentRow.attemptMeta.count}
                        {studentRow.attemptMeta.count ? ` · avg ${studentRow.attemptMeta.avgPercent}%` : ""}
                      </strong>
                    </div>
                    <div className="student-meta">
                      <span>Latest activity</span>
                      <strong>{latestActivity ? latestActivity.kind : "No activity yet"}</strong>
                    </div>
                  </div>

                  <div className="student-activity-panel">
                    <div>
                      <span className="panel-label">Recent writing</span>
                      <p>
                        {latestWriting
                          ? `${latestWriting.partLabel} · ${formatRelative(latestWriting.createdAt)}`
                          : "No writing submitted yet"}
                      </p>
                    </div>
                    <div>
                      <span className="panel-label">Recent grammar</span>
                      <p>
                        {latestGrammar
                          ? `${latestGrammar.activityTitle || "Hub grammar"} · ${formatRelative(latestGrammar.createdAt)}`
                          : "No grammar activity yet"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="student-row-side">
                  <div className="student-class-editor">
                    <label className="field grow">
                      <span>Class label</span>
                      <input
                        type="text"
                        value={classDrafts[studentRow.id] || ""}
                        onChange={(event) =>
                          setClassDrafts((prev) => ({
                            ...prev,
                            [studentRow.id]: event.target.value,
                          }))
                        }
                        placeholder="e.g. Tuesday B1 evening"
                      />
                    </label>

                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={() => saveClassName(studentRow.id)}
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Save class"}
                    </button>
                  </div>

                  <div className="student-card-actions">
                    <button
                      type="button"
                      className="review-btn"
                      onClick={() => navigate(`/teacher/student/${studentRow.id}`)}
                    >
                      View profile
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && students.length > 0 && filteredStudents.length === 0 && (
        <p className="muted">No students match the current search and class filter.</p>
      )}

      {selectedNotification ? (
        <div className="teacher-review-overlay" onClick={() => setSelectedNotification(null)}>
          <div className="teacher-review-modal" onClick={(event) => event.stopPropagation()}>
            <div className="teacher-review-head">
              <div>
                <h3>{selectedNotification.studentLabel}</h3>
                <p>
                  {selectedNotification.partLabel} submission · {formatDate(selectedNotification.createdAt)}
                </p>
              </div>
              <div className="teacher-review-top-actions">
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => void markSubmissionUnread(selectedNotification.id)}
                >
                  Mark as unread
                </button>
                {selectedNotification.kind === "writing" ? (
                  <button type="button" className="ghost-btn" onClick={copySelectedSubmission}>
                    Copy submission
                  </button>
                ) : null}
                <button type="button" className="ghost-btn" onClick={() => setSelectedNotification(null)}>
                  Close
                </button>
              </div>
            </div>

            <div className="teacher-review-body">
              {selectedNotification.kind === "grammar-set" ? (
                <div className="teacher-review-block">
                  <span className="panel-label">
                    {selectedNotification.setType === "use_of_english_custom"
                      ? "Use of English quiz completion"
                      : "Grammar set completion"}
                  </span>
                  <div className="teacher-review-answer">
                    <strong>{selectedNotification.title}</strong>
                    <div className="teacher-review-plain">
                      Completed {formatRelative(selectedNotification.createdAt)}.
                      {selectedNotification.correct != null && selectedNotification.checkedCount != null
                        ? ` Score: ${selectedNotification.correct}/${selectedNotification.checkedCount}`
                        : ""}
                      {selectedNotification.percent != null ? ` (${selectedNotification.percent}%).` : ""}
                    </div>
                  </div>
                  {Array.isArray(selectedNotification.answers) && selectedNotification.answers.length ? (
                    <div className="teacher-review-answer">
                      <strong>Answer review</strong>
                      <div className="teacher-review-attempt-list">
                        {selectedNotification.answers.map((ans, index) => {
                          const item = selectedAttemptItemsById[ans.itemId];
                          const label = getAttemptLabel({
                            ...item,
                            ...ans,
                          });
                          const latestAnswer = ans.studentAnswer ?? ans.selectedOption ?? "";
                          const firstAnswer = ans.firstAttempt ?? latestAnswer ?? "(no answer)";
                          const isCorrect =
                            typeof ans.firstAttemptCorrect === "boolean"
                              ? ans.firstAttemptCorrect
                              : !!ans.isCorrect;

                          return (
                            <div
                              key={`${ans.itemId || "item"}-${index}`}
                              className={`teacher-review-attempt ${isCorrect ? "is-correct" : "is-wrong"}`}
                            >
                              <div className="teacher-review-attempt-head">
                                <span className="teacher-review-attempt-label">{label}</span>
                                <span className={`teacher-review-attempt-chip ${isCorrect ? "is-correct" : "is-wrong"}`}>
                                  {isCorrect ? "Correct" : "Needs review"}
                                </span>
                              </div>
                              <div className="teacher-review-attempt-body">
                                <div>
                                  <span className="panel-label">Scored answer</span>
                                  <p>{firstAnswer || "(blank)"}</p>
                                </div>
                                {!isCorrect ? (
                                  <div>
                                    <span className="panel-label">Correct answer</span>
                                    <p>{ans.correctAnswer ?? ans.correctOption ?? "(unknown)"}</p>
                                  </div>
                                ) : null}
                              </div>
                              {ans.source === "keyword" && (item?.keyWord || item?.fullSentence || item?.gapFill) ? (
                                <div className="teacher-review-attempt-note">
                                  {item?.fullSentence ? `Sentence: ${item.fullSentence} ` : ""}
                                  {item?.gapFill ? `Gap: ${item.gapFill} ` : ""}
                                  {item?.keyWord ? `Key word: ${String(item.keyWord).toUpperCase()}` : ""}
                                </div>
                              ) : null}
                              {ans.source === "word-formation" && (item?.base || item?.gappedSentence) ? (
                                <div className="teacher-review-attempt-note">
                                  {item?.gappedSentence ? `Sentence: ${item.gappedSentence} ` : ""}
                                  {item?.base ? `Base word: ${item.base}` : ""}
                                </div>
                              ) : null}
                              {ans.firstAttempt && ans.firstAttempt !== latestAnswer ? (
                                <div className="teacher-review-attempt-note">
                                  Latest checked answer: {latestAnswer || "(blank)"}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {selectedNotification.kind === "mini-test" ? (
                <div className="teacher-review-block">
                  <span className="panel-label">Mini grammar test completion</span>
                  <div className="teacher-review-answer">
                    <strong>{selectedNotification.title}</strong>
                    <div className="teacher-review-plain">
                      Completed {formatRelative(selectedNotification.createdAt)}.
                      {" "}
                      Score: {selectedNotification.submission?.score ?? 0}% (
                      {selectedNotification.submission?.correct ?? 0}/
                      {selectedNotification.submission?.total ?? 0}).
                    </div>
                  </div>
                  {Array.isArray(selectedNotification.submission?.items) &&
                  selectedNotification.submission.items.length ? (
                    <div className="teacher-review-answer">
                      <strong>Answer review</strong>
                      <div className="teacher-review-attempt-list">
                        {selectedNotification.submission.items.map((item, index) => (
                          <div
                            key={`${item.id || "item"}-${index}`}
                            className={`teacher-review-attempt ${item.isCorrect ? "is-correct" : "is-wrong"}`}
                          >
                            <div className="teacher-review-attempt-head">
                              <span className="teacher-review-attempt-label">
                                {item.type === "multiple-choice"
                                  ? item.question || item.prompt
                                  : item.type === "error-correction"
                                    ? item.sentence || item.prompt
                                    : item.type === "comma-placement"
                                      ? item.sentence || item.prompt
                                    : item.parts
                                      ? renderSavedGrammarSentence(item.parts, item.gaps || [])
                                      : item.prompt}
                              </span>
                              <span className={`teacher-review-attempt-chip ${item.isCorrect ? "is-correct" : "is-wrong"}`}>
                                {item.isCorrect ? "Correct" : "Needs review"}
                              </span>
                            </div>

                            {item.type === "multiple-choice" ? (
                              <div className="teacher-review-attempt-body">
                                <div>
                                  <span className="panel-label">Your answer</span>
                                  <p>{item.selectedOption || "(no answer)"}</p>
                                </div>
                                {!item.isCorrect ? (
                                  <div>
                                    <span className="panel-label">Correct answer</span>
                                    <p>{item.correctOption || "—"}</p>
                                  </div>
                                ) : null}
                              </div>
                            ) : item.type === "error-correction" ? (
                              <>
                                <div className="teacher-review-attempt-body">
                                  <div>
                                    <span className="panel-label">Your choice</span>
                                    <p>{item.selectedLabel || "(no answer)"}</p>
                                  </div>
                                  {!item.isCorrect ? (
                                    <div>
                                      <span className="panel-label">Correct answer</span>
                                      <p>
                                        {item.expectedLabel || "—"}
                                        {item.correction?.length ? ` — ${item.correction.join(" / ")}` : ""}
                                      </p>
                                    </div>
                                  ) : null}
                                </div>
                                {item.answer === "wrong" ? (
                                  <div className="teacher-review-attempt-note">
                                    Your correction: {item.correctionAnswer || "(blank)"}
                                  </div>
                                ) : null}
                              </>
                            ) : item.type === "comma-placement" ? (
                              <div className="teacher-review-attempt-body">
                                <div>
                                  <span className="panel-label">Student version</span>
                                  <p>{item.selectedSentence || item.sentence || "(no answer)"}</p>
                                </div>
                                {!item.isCorrect ? (
                                  <div>
                                    <span className="panel-label">Correct version</span>
                                    <p>{item.corrected || "—"}</p>
                                  </div>
                                ) : null}
                              </div>
                            ) : (
                              <div className="teacher-review-attempt-list" style={{ marginTop: 0 }}>
                                {(item.gaps || []).map((gap) => (
                                  <div
                                    key={`${item.id}:${gap.gapId}`}
                                    className={`teacher-review-attempt ${gap.isCorrect ? "is-correct" : "is-wrong"}`}
                                    style={{ padding: "0.7rem 0.8rem" }}
                                  >
                                    <div className="teacher-review-attempt-body">
                                      <div>
                                        <span className="panel-label">Your answer</span>
                                        <p>{gap.answer || "(no answer)"}</p>
                                      </div>
                                      {!gap.isCorrect ? (
                                        <div>
                                          <span className="panel-label">Accepted answers</span>
                                          <p>{(gap.acceptedAnswers || []).join(" / ") || "—"}</p>
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {selectedNotification.kind === "course-test" ? (
                <div className="teacher-review-block">
                  <span className="panel-label">Course test submission</span>
                  <div className="teacher-review-answer">
                    <strong>{selectedNotification.title}</strong>
                    <div className="teacher-review-plain">
                      Submitted {formatRelative(selectedNotification.createdAt)}.
                      {" "}
                      {selectedNotification.attempt?.reviewStatus === "reviewed"
                        ? `Reviewed score: ${selectedNotification.attempt?.teacherScore ?? 0}/${selectedNotification.attempt?.teacherTotal ?? 0} (${selectedNotification.attempt?.finalPercent ?? 0}%).`
                        : `Automatic score: ${selectedNotification.attempt?.autoScore ?? 0}/${selectedNotification.attempt?.autoTotal ?? 0} (${selectedNotification.attempt?.percent ?? 0}%). Awaiting teacher review.`}
                    </div>
                  </div>

                  {buildCourseTestSectionBreakdown(selectedNotification.template, selectedNotification.attempt).map((group) => (
                    <div key={group.skill} className="teacher-review-answer">
                      <strong>
                        {group.label} · {group.score}/{group.total}
                      </strong>
                      <div className="teacher-review-attempt-list">
                        {group.sections.map((section) => (
                          <div key={section.id} className="teacher-review-attempt">
                            <div className="teacher-review-attempt-head">
                              <span className="teacher-review-attempt-label">{section.title}</span>
                            </div>
                            {section.penalty ? (
                              <div className="teacher-review-plain" style={{ marginBottom: "0.5rem" }}>
                                Extra word penalty: -{section.penalty}
                              </div>
                            ) : null}
                            <div className="teacher-review-attempt-list" style={{ marginTop: 0 }}>
                              {section.reviewItems.map(({ item, answer, autoCorrect, assignedScore }, index) => (
                                <div
                                  key={`${section.id}:${item.id || index}`}
                                  className={`teacher-review-attempt ${assignedScore >= 1 ? "is-correct" : assignedScore > 0 ? "is-partial" : "is-wrong"}`}
                                  style={{ padding: "0.7rem 0.8rem" }}
                                >
                                  <div className="teacher-review-attempt-head">
                                    <span className="teacher-review-attempt-label">{item.prompt}</span>
                                    <span className={`teacher-review-attempt-chip ${assignedScore >= 1 ? "is-correct" : assignedScore > 0 ? "is-partial" : "is-wrong"}`}>
                                      {assignedScore >= 1 ? "Correct" : assignedScore > 0 ? "Partial" : "Wrong"}
                                    </span>
                                  </div>
                                  <div className="teacher-review-attempt-body">
                                    <div>
                                      <span className="panel-label">Student answer</span>
                                      <p>{formatCourseTestAnswer(item, answer)}</p>
                                    </div>
                                    <div>
                                      <span className="panel-label">Answer key</span>
                                      <p>{formatCourseTestKey(item)}</p>
                                    </div>
                                    <div>
                                      <span className="panel-label">Auto-check</span>
                                      <p>{autoCorrect ? "Correct" : "Wrong / needs review"}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {selectedNotification.kind === "writing" && selectedNotification.partLabel === "P1" ? (
                <div className="teacher-review-block">
                  <span className="panel-label">Writing Part 1</span>
                  {(selectedNotification.submission.items || []).map((item, index) => (
                    <div key={item.prompt || index} className="teacher-review-answer">
                      <strong>{item.prompt || `Prompt ${index + 1}`}</strong>
                      <div className="teacher-review-plain">
                        {toSubmissionPlainText("", item.answer || item.response || "—")}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {selectedNotification.kind === "writing" && selectedNotification.partLabel === "P2" ? (
                <div className="teacher-review-block">
                  <span className="panel-label">Writing Part 2</span>
                  <div className="teacher-review-answer">
                    <strong>Answer</strong>
                    <div className="teacher-review-plain">
                      {toSubmissionPlainText(
                        selectedNotification.submission.answerHTML,
                        selectedNotification.submission.answerText || "—"
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {selectedNotification.kind === "writing" && selectedNotification.partLabel === "P3" ? (
                <div className="teacher-review-block">
                  <span className="panel-label">Writing Part 3</span>
                  {(selectedNotification.submission.answersText || []).map((answer, index) => (
                    <div key={index} className="teacher-review-answer">
                      <strong>Reply {index + 1}</strong>
                      <div className="teacher-review-plain">
                        {toSubmissionPlainText(
                          selectedNotification.submission.answersHTML?.[index],
                          answer || "—"
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {selectedNotification.kind === "writing" && selectedNotification.partLabel === "P4" ? (
                <div className="teacher-review-block">
                  <span className="panel-label">Writing Part 4</span>
                  <div className="teacher-review-answer">
                    <strong>Informal email</strong>
                    <div className="teacher-review-plain">
                      {toSubmissionPlainText(
                        selectedNotification.submission.friendHTML,
                        selectedNotification.submission.friendText || "—"
                      )}
                    </div>
                  </div>
                  <div className="teacher-review-answer">
                    <strong>Formal email</strong>
                    <div className="teacher-review-plain">
                      {toSubmissionPlainText(
                        selectedNotification.submission.formalHTML,
                        selectedNotification.submission.formalText || "—"
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="teacher-review-actions">
              <button
                type="button"
                className="review-btn"
                onClick={() => navigate(`/teacher/student/${selectedNotification.studentId}`)}
              >
                Open student profile
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <style>{`
        .my-students-page {
          max-width: 1100px;
          margin: 0 auto;
        }

        .my-students-topbar {
          margin-bottom: 0.9rem;
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: flex-start;
          position: relative;
        }

        .teacher-notifications {
          position: relative;
        }

        .teacher-notify-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          border-radius: 999px;
          border: 1px solid rgba(103, 132, 197, 0.36);
          background: rgba(20, 33, 59, 0.92);
          color: #eef4ff;
          padding: 0.75rem 1rem;
          font-weight: 800;
          cursor: pointer;
        }

        .teacher-notify-count {
          min-width: 1.6rem;
          height: 1.6rem;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, #f6bd60, #e9a93f);
          color: #16233f;
          font-size: 0.78rem;
          font-weight: 900;
          padding: 0 0.35rem;
        }

        .teacher-notify-panel {
          position: absolute;
          top: calc(100% + 0.55rem);
          right: 0;
          width: min(420px, calc(100vw - 2rem));
          background: rgba(20, 33, 59, 0.98);
          border: 1px solid rgba(77, 110, 184, 0.42);
          border-radius: 18px;
          box-shadow: 0 16px 30px rgba(0, 0, 0, 0.22);
          padding: 0.95rem;
          z-index: 10;
        }

        .teacher-notify-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.8rem;
          color: rgba(230, 240, 255, 0.78);
          font-size: 0.86rem;
        }

        .teacher-notify-list {
          display: grid;
          gap: 0.55rem;
          max-height: 420px;
          overflow: auto;
        }

        .teacher-notify-item {
          width: 100%;
          text-align: left;
          border-radius: 14px;
          border: 1px solid rgba(108, 136, 199, 0.18);
          background: rgba(11, 18, 37, 0.68);
          color: #eef4ff;
          padding: 0.8rem 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.9rem;
        }

        .teacher-notify-item.is-unread {
          border-color: rgba(245, 193, 90, 0.38);
          background: rgba(37, 31, 16, 0.28);
        }

        .teacher-notify-item strong,
        .teacher-notify-item span,
        .teacher-notify-item em {
          display: block;
        }

        .teacher-notify-item span {
          color: rgba(230, 240, 255, 0.68);
          font-size: 0.86rem;
          margin-top: 0.2rem;
        }

        .teacher-notify-item em {
          font-style: normal;
          color: #9cc1ff;
          font-size: 0.82rem;
          white-space: nowrap;
        }

        .teacher-review-overlay {
          position: fixed;
          inset: 0;
          background: rgba(3, 8, 20, 0.72);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 30;
        }

        .teacher-review-modal {
          width: min(760px, 100%);
          max-height: min(84vh, 900px);
          overflow: auto;
          background: rgba(20, 33, 59, 0.98);
          border: 1px solid rgba(77, 110, 184, 0.42);
          border-radius: 22px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.28);
          padding: 1.1rem;
        }

        .teacher-review-head,
        .teacher-review-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .teacher-review-head {
          margin-bottom: 1rem;
        }

        .teacher-review-top-actions {
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .teacher-review-head h3 {
          margin: 0 0 0.2rem;
          color: #eef4ff;
        }

        .teacher-review-head p {
          margin: 0;
          color: rgba(230, 240, 255, 0.72);
        }

        .teacher-review-body {
          display: grid;
          gap: 0.9rem;
        }

        .teacher-review-block {
          background: rgba(11, 18, 37, 0.62);
          border: 1px solid rgba(108, 136, 199, 0.18);
          border-radius: 16px;
          padding: 1rem;
        }

        .teacher-review-answer + .teacher-review-answer {
          margin-top: 0.9rem;
          padding-top: 0.9rem;
          border-top: 1px solid rgba(108, 136, 199, 0.18);
        }

        .teacher-review-answer strong {
          display: block;
          color: #eef4ff;
          margin-bottom: 0.4rem;
        }

        .teacher-review-plain {
          color: rgba(230, 240, 255, 0.92);
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .teacher-review-attempt-list {
          display: grid;
          gap: 0.75rem;
          margin-top: 0.35rem;
        }

        .teacher-review-attempt {
          border-radius: 14px;
          border: 1px solid rgba(108, 136, 199, 0.18);
          background: rgba(255, 255, 255, 0.02);
          padding: 0.85rem 0.9rem;
        }

        .teacher-review-attempt.is-correct {
          border-color: rgba(34, 197, 94, 0.25);
          background: rgba(11, 45, 28, 0.24);
        }

        .teacher-review-attempt.is-partial {
          border-color: rgba(245, 158, 11, 0.28);
          background: rgba(73, 48, 8, 0.24);
        }

        .teacher-review-attempt.is-wrong {
          border-color: rgba(249, 115, 22, 0.25);
          background: rgba(58, 29, 8, 0.22);
        }

        .teacher-review-attempt-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.8rem;
          margin-bottom: 0.55rem;
        }

        .teacher-review-attempt-label {
          color: #eef4ff;
          font-weight: 700;
          line-height: 1.45;
        }

        .teacher-review-attempt-chip {
          flex: 0 0 auto;
          border-radius: 999px;
          padding: 0.25rem 0.6rem;
          font-size: 0.75rem;
          font-weight: 800;
        }

        .teacher-review-attempt-chip.is-correct {
          background: rgba(34, 197, 94, 0.18);
          color: #bdf7cf;
        }

        .teacher-review-attempt-chip.is-partial {
          background: rgba(245, 158, 11, 0.18);
          color: #fde68a;
        }

        .teacher-review-attempt-chip.is-wrong {
          background: rgba(249, 115, 22, 0.16);
          color: #fed7aa;
        }

        .teacher-review-attempt-body {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.8rem;
        }

        .teacher-review-attempt-body p {
          margin: 0;
          color: rgba(230, 240, 255, 0.92);
          line-height: 1.5;
        }

        .teacher-review-attempt-note {
          margin-top: 0.6rem;
          color: rgba(230, 240, 255, 0.7);
          font-size: 0.84rem;
        }

        .teacher-review-actions {
          margin-top: 1rem;
        }

        .my-students-hero {
          margin-bottom: 1rem;
        }

        .my-students-hero h1 {
          margin: 0 0 0.4rem;
          color: #eef4ff;
        }

        .my-students-hero p {
          margin: 0;
          color: rgba(230, 240, 255, 0.8);
          line-height: 1.55;
          max-width: 760px;
        }

        .my-students-summary,
        .my-students-controls {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.9rem;
          margin-bottom: 1rem;
        }

        .my-students-stat,
        .my-students-controls,
        .student-card {
          background: rgba(20, 33, 59, 0.9);
          border: 1px solid rgba(77, 110, 184, 0.38);
          border-radius: 18px;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.14);
        }

        .my-students-stat {
          padding: 1rem 1.1rem;
        }

        .my-students-stat span,
        .field span,
        .panel-label {
          display: block;
          color: rgba(230, 240, 255, 0.7);
          font-size: 0.86rem;
          margin-bottom: 0.35rem;
        }

        .my-students-stat strong {
          color: #eef4ff;
          font-size: 1.8rem;
        }

        .my-students-controls {
          padding: 1rem 1.1rem;
          align-items: end;
        }

        .field {
          display: grid;
          gap: 0.45rem;
        }

        .field input,
        .field select {
          width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(103, 132, 197, 0.36);
          background: rgba(11, 18, 37, 0.95);
          color: #eef4ff;
          padding: 0.82rem 0.95rem;
        }

        .my-students-list {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }

        .student-card {
          padding: 0;
          overflow: hidden;
        }

        .student-card-head {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: center;
          padding: 1rem 1.1rem;
          border-bottom: 1px solid rgba(39, 64, 111, 0.8);
        }

        .student-identity {
          min-width: 0;
        }

        .student-card-head h3 {
          margin: 0 0 0.22rem;
          color: #eef4ff;
        }

        .student-card-head p {
          margin: 0;
          color: rgba(230, 240, 255, 0.72);
        }

        .student-handle {
          display: inline-block;
          margin-top: 0.35rem;
          color: #93b5ff;
          font-size: 0.88rem;
        }

        .student-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          justify-content: flex-end;
          align-items: center;
        }

        .student-chip {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 0.42rem 0.72rem;
          font-size: 0.78rem;
          font-weight: 800;
          border: 1px solid rgba(110, 140, 204, 0.34);
          color: #e7f0ff;
          background: rgba(34, 51, 88, 0.95);
        }

        .student-chip.is-class {
          color: #16233f;
          background: linear-gradient(180deg, #f6bd60, #e9a93f);
          border-color: rgba(245, 193, 90, 0.95);
        }

        .student-chip.is-active {
          background: rgba(31, 83, 62, 0.9);
          border-color: rgba(111, 223, 169, 0.34);
          color: #d5ffe8;
        }

        .student-row-main,
        .student-row-side {
          padding: 1rem 1.1rem 1.1rem;
        }

        .student-row-main {
          display: grid;
          grid-template-columns: minmax(260px, 0.95fr) minmax(280px, 1.05fr);
          gap: 1rem;
          border-bottom: 1px solid rgba(39, 64, 111, 0.55);
        }

        .student-meta-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.8rem;
        }

        .student-meta {
          background: rgba(11, 18, 37, 0.65);
          border: 1px solid rgba(108, 136, 199, 0.18);
          border-radius: 16px;
          padding: 0.8rem 0.9rem;
        }

        .student-meta strong {
          color: #eef4ff;
          font-size: 0.95rem;
        }

        .student-activity-panel {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.8rem;
          background: rgba(11, 18, 37, 0.48);
          border: 1px solid rgba(108, 136, 199, 0.18);
          border-radius: 16px;
          padding: 0.9rem;
        }

        .student-activity-panel p {
          margin: 0;
          color: rgba(230, 240, 255, 0.9);
          line-height: 1.45;
        }

        .student-row-side {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 1rem;
        }

        .student-class-editor {
          display: flex;
          gap: 0.7rem;
          align-items: end;
          flex: 1;
        }

        .student-class-editor .grow {
          flex: 1;
        }

        .student-card-actions {
          display: flex;
          justify-content: flex-end;
          flex-shrink: 0;
        }

        @media (max-width: 900px) {
          .my-students-summary,
          .my-students-controls,
          .student-meta-grid,
          .student-activity-panel {
            grid-template-columns: 1fr;
          }

          .my-students-topbar {
            flex-direction: column;
            align-items: stretch;
          }

          .teacher-review-attempt-body {
            grid-template-columns: 1fr;
          }

          .student-row-main {
            grid-template-columns: 1fr;
          }

          .student-card-head,
          .student-row-side,
          .student-class-editor {
            flex-direction: column;
            align-items: stretch;
          }

          .student-chip-row {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
