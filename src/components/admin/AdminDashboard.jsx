// src/components/admin/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  db,
  deleteCourseTestSession,
  listAllCourseTestSessions,
  listAttemptsForCourseTestSession,
  saveCourseTestAttemptReview,
} from "../../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { getSeifHubAccessConfig, SEIF_HUB_ACCESS_KEY } from "../../siteConfig.js";
import { getHubCourseTestTemplate } from "../../data/hubCourseTestTemplates.js";

function getTodayLocalIsoDate() {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzOffset).toISOString().slice(0, 10);
}

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
  if (item?.type === "stress-choice") return String(answer) === String(item.answerIndex) ? 1 : 0;
  if (item?.type === "matching-select") return isMatchingSelectCorrect(item, answer);
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
    return gapParts.map((part, index) => `Gap ${index + 1}: ${answerMap[part.gapId] || "—"}`).join(" · ");
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
  if (isSortBySoundItem(item)) return answer ? String(answer) : "—";
  if (item?.type === "matching-select") return resolveMatchingOptionLabel(item, answer);
  return String(answer);
}

function formatAcceptedAnswer(item) {
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
      return item.acceptedAnswers.map((entry) => resolveMatchingOptionLabel(item, entry)).join(" / ");
    }
    return resolveMatchingOptionLabel(item, item.answer);
  }
  if (isSortBySoundItem(item)) return item.answer || "—";
  if (Array.isArray(item?.acceptedAnswers)) return item.acceptedAnswers.join(" / ");
  return "—";
}

export default function AdminDashboard({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null); // studentId currently updating
  const [isNarrow, setIsNarrow] = useState(false); // mobile breakpoint

  // NEW: sorting + filtering
  const [sortBy, setSortBy] = useState("email"); // "email" | "role" | "teacher"
  const [sortDir, setSortDir] = useState("asc"); // "asc" | "desc"
  const [teacherFilter, setTeacherFilter] = useState("all"); // "all" | "no-teacher" | "has-teacher" | teacherId
  const [searchTerm, setSearchTerm] = useState("");
  const [hubDrafts, setHubDrafts] = useState({});
  const [savingHub, setSavingHub] = useState({});
  const [courseTestSessions, setCourseTestSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [deletingSessionId, setDeletingSessionId] = useState("");
  const [showCourseTestSessions, setShowCourseTestSessions] = useState(false);
  const [reviewSession, setReviewSession] = useState(null);
  const [reviewAttempts, setReviewAttempts] = useState([]);
  const [reviewAttemptsLoading, setReviewAttemptsLoading] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [reviewScores, setReviewScores] = useState({});
  const [reviewSaving, setReviewSaving] = useState(false);

  const navigate = useNavigate();

  // Responsive breakpoint watcher
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setIsNarrow(window.innerWidth < 720);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function loadUsers() {
      const colRef = collection(db, "users");
      const snap = await getDocs(colRef);

      const arr = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setUsers(arr);
      setLoading(false);
    }

    loadUsers();
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadCourseSessions() {
      try {
        const rows = await listAllCourseTestSessions();
        if (alive) setCourseTestSessions(rows || []);
      } catch (error) {
        console.error("[AdminDashboard] load course test sessions failed", error);
      } finally {
        if (alive) setLoadingSessions(false);
      }
    }

    loadCourseSessions();
    return () => {
      alive = false;
    };
  }, []);

  async function updateRole(uid, role) {
    await updateDoc(doc(db, "users", uid), { role });

    setUsers((prev) =>
      prev.map((u) => (u.id === uid ? { ...u, role } : u))
    );
  }

  // assign / clear a teacher for a student
  async function assignTeacher(studentId, teacherId) {
    try {
      setAssigning(studentId);

      const payload =
        teacherId === "" ? { teacherId: null } : { teacherId };

      await updateDoc(doc(db, "users", studentId), payload);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === studentId ? { ...u, teacherId: teacherId || null } : u
        )
      );
    } finally {
      setAssigning(null);
    }
  }

  async function removeCourseTestSession(session) {
    if (!session?.id) return;
    const label = session.templateTitle || "this course test session";
    const confirmed = window.confirm(
      `Delete ${label}? This removes it from teacher and student session lists.`
    );
    if (!confirmed) return;

    setDeletingSessionId(session.id);
    try {
      await deleteCourseTestSession(session.id);
      const rows = await listAllCourseTestSessions();
      setCourseTestSessions(rows || []);
    } catch (error) {
      console.error("[AdminDashboard] delete course test session failed", error);
    } finally {
      setDeletingSessionId("");
    }
  }

  async function openReviewSession(session) {
    setReviewSession(session);
    setSelectedAttempt(null);
    setReviewScores({});
    setReviewAttemptsLoading(true);
    try {
      const rows = await listAttemptsForCourseTestSession(session.id);
      setReviewAttempts(rows || []);
    } catch (error) {
      console.error("[AdminDashboard] review load failed", error);
    } finally {
      setReviewAttemptsLoading(false);
    }
  }

  function closeReviewSession() {
    setReviewSession(null);
    setReviewAttempts([]);
    setSelectedAttempt(null);
    setReviewScores({});
    setReviewSaving(false);
  }

  const selectedAttemptTemplate = selectedAttempt?.templateId
    ? getHubCourseTestTemplate(selectedAttempt.templateId)
    : null;

  const selectedAttemptReviewRows = useMemo(() => {
    if (!selectedAttemptTemplate || !selectedAttempt) return [];

    const answers = selectedAttempt.runnerState?.sectionAnswers || {};
    return (selectedAttemptTemplate.sections || []).map((section) => ({
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
  }, [selectedAttempt, selectedAttemptTemplate]);

  useEffect(() => {
    if (!selectedAttempt) return;

    const savedScores = selectedAttempt.teacherReview?.itemScores || {};
    const nextScores = {};

    selectedAttemptReviewRows.forEach((section) => {
      section.reviewItems.forEach(({ key, autoScore }) => {
        nextScores[key] =
          savedScores[key] != null ? Number(savedScores[key]) : Number(autoScore || 0);
      });
    });

    setReviewScores(nextScores);
  }, [selectedAttempt, selectedAttemptReviewRows]);

  const reviewTotals = useMemo(() => {
    const total = selectedAttemptReviewRows.reduce((sum, section) => sum + section.reviewItems.length, 0);
    const score = selectedAttemptReviewRows.reduce(
      (sum, section) =>
        sum +
        section.reviewItems.reduce((sectionSum, entry) => {
          return sectionSum + Number(reviewScores[entry.key] ?? (entry.autoCorrect ? 1 : 0));
        }, 0) -
        Number(section.penalty || 0),
      0
    );

    return { score: Math.max(0, score), total };
  }, [selectedAttemptReviewRows, reviewScores]);

  async function handleSaveReview() {
    if (!selectedAttempt) return;

    setReviewSaving(true);
    try {
      await saveCourseTestAttemptReview(selectedAttempt.id, {
        teacherReview: {
          itemScores: reviewScores,
        },
        teacherScore: reviewTotals.score,
        teacherTotal: reviewTotals.total,
        reviewedByUid: user.uid,
        reviewedByName: user.displayName || user.email || "Admin",
      });

      const refreshed = await listAttemptsForCourseTestSession(reviewSession.id);
      setReviewAttempts(refreshed || []);
      const updatedAttempt = (refreshed || []).find((entry) => entry.id === selectedAttempt.id) || null;
      setSelectedAttempt(updatedAttempt);
    } catch (error) {
      console.error("[AdminDashboard] save review failed", error);
    } finally {
      setReviewSaving(false);
    }
  }

  if (!user || user.role !== "admin") {
    return <p>⛔ You do not have permission to view this page.</p>;
  }

  // ── Course pack access ────────────────────────────────────────────────
const PACK_ID = "seif-pack-v1";

async function setPackAccess(uid, allowed) {
  await updateDoc(doc(db, "users", uid), {
    [`courseAccess.${PACK_ID}`]: allowed,
  });

  setUsers((prev) =>
    prev.map((u) => {
      if (u.id !== uid) return u;
      return {
        ...u,
        courseAccess: { ...(u.courseAccess || {}), [PACK_ID]: allowed },
      };
    })
  );
}

const hasPack = (u) => !!(u.courseAccess && u.courseAccess[PACK_ID]);

function getHubDraft(u) {
  if (hubDrafts[u.id]) return hubDrafts[u.id];

  const access = getSeifHubAccessConfig(u);
  if (!access.active && !access.startDate) {
    return {
      ...access,
      startDate: getTodayLocalIsoDate(),
    };
  }

  return access;
}

function setHubDraft(uid, patch) {
  setHubDrafts((prev) => {
    const sourceUser = users.find((u) => u.id === uid) || {};
    const base = prev[uid] || getHubDraft(sourceUser);
    return {
      ...prev,
      [uid]: { ...base, ...patch },
    };
  });
}

async function saveSeifHubAccess(uid) {
  const sourceUser = users.find((u) => u.id === uid) || {};
  const draft = hubDrafts[uid] || getSeifHubAccessConfig(sourceUser);
  const payload = {
    active: !!draft.active,
    startDate: draft.startDate || "",
    endDate: draft.indefinite ? "" : (draft.endDate || ""),
    indefinite: !!draft.indefinite,
  };

  setSavingHub((prev) => ({ ...prev, [uid]: true }));

  try {
    await updateDoc(doc(db, "users", uid), {
      [`siteAccess.${SEIF_HUB_ACCESS_KEY}`]: payload,
    });

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== uid) return u;
        return {
          ...u,
          siteAccess: { ...(u.siteAccess || {}), [SEIF_HUB_ACCESS_KEY]: payload },
        };
      })
    );
  } finally {
    setSavingHub((prev) => ({ ...prev, [uid]: false }));
  }
}

function hasSeifHub(u) {
  return getSeifHubAccessConfig(u).active;
}

function getHubStatus(u) {
  const access = getSeifHubAccessConfig(u);
  if (!access.active) {
    return { label: "Hub off", tone: "muted" };
  }

  const today = new Date().toISOString().slice(0, 10);
  if (access.startDate && today < access.startDate) {
    return { label: `Starts ${access.startDate}`, tone: "info" };
  }

  if (!access.indefinite && access.endDate && today > access.endDate) {
    return { label: `Expired ${access.endDate}`, tone: "danger" };
  }

  if (access.indefinite) {
    return { label: "Active indefinitely", tone: "success" };
  }

  if (access.endDate) {
    return { label: `Active until ${access.endDate}`, tone: "success" };
  }

  return { label: "Active", tone: "success" };
}

function renderHubAccessControl(u, compact = false) {
  const draft = getHubDraft(u);
  const fontSize = compact ? "0.78rem" : "0.82rem";
  const inputStyle = {
    fontSize,
    padding: "0.25rem 0.45rem",
    borderRadius: "0.375rem",
    border: "1px solid #374151",
    backgroundColor: "#020617",
    color: "#e5e7eb",
  };

  const openDatePicker = (event) => {
    event.target.showPicker?.();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
        padding: compact ? "0.35rem 0" : "0.4rem 0",
        width: "100%",
      }}
    >
      <label
        style={{
          display: "inline-flex",
          gap: "0.5rem",
          alignItems: "center",
          fontSize,
          opacity: 0.9,
        }}
      >
        <input
          type="checkbox"
          checked={draft.active}
          onChange={(e) => setHubDraft(u.id, { active: e.target.checked })}
        />
        Seif Hub active
      </label>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.45rem",
          alignItems: "center",
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: "0.2rem", fontSize, opacity: 0.9 }}>
          <span>Start</span>
          <input
            type="date"
            value={draft.startDate}
            onChange={(e) => setHubDraft(u.id, { startDate: e.target.value })}
            onFocus={openDatePicker}
            onClick={openDatePicker}
            style={inputStyle}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.2rem", fontSize, opacity: draft.indefinite ? 0.5 : 0.9 }}>
          <span>End</span>
          <input
            type="date"
            value={draft.endDate}
            onChange={(e) => setHubDraft(u.id, { endDate: e.target.value })}
            onFocus={openDatePicker}
            onClick={openDatePicker}
            disabled={draft.indefinite}
            style={inputStyle}
          />
        </label>
      </div>

      <label
        style={{
          display: "inline-flex",
          gap: "0.5rem",
          alignItems: "center",
          fontSize,
          opacity: 0.9,
        }}
      >
        <input
          type="checkbox"
          checked={draft.indefinite}
          onChange={(e) =>
            setHubDraft(u.id, {
              indefinite: e.target.checked,
              endDate: e.target.checked ? "" : draft.endDate,
            })
          }
        />
        Indefinite
      </label>

      <button
        type="button"
        className="ghost-btn"
        onClick={() => saveSeifHubAccess(u.id)}
        disabled={!!savingHub[u.id]}
        style={{
          marginLeft: 0,
          alignSelf: "flex-start",
          fontSize,
          padding: "0.25rem 0.6rem",
        }}
      >
        {savingHub[u.id] ? "Saving..." : "Save hub access"}
      </button>
    </div>
  );
}


  // Teachers = users who can appear in the dropdown
  const teachers = users.filter(
    (u) => u.role === "teacher" || u.role === "admin" // admins can also be teachers
  );

  const labelForTeacher = (t) =>
    t.displayName || t.name || t.username || t.email || t.id;

  const renderTeacherControl = (u) => {
    const isStudent = u.role === "student";
    const currentTeacher =
      teachers.find((t) => t.id === u.teacherId) || null;

    if (isStudent) {
      return (
        <select
          value={u.teacherId || ""}
          onChange={(e) => assignTeacher(u.id, e.target.value)}
          disabled={assigning === u.id}
          style={{
            fontSize: "0.8rem",
            padding: "0.2rem 0.4rem",
            borderRadius: "0.375rem",
            border: "1px solid #374151",
            backgroundColor: "#020617",
            color: "#e5e7eb",
            minWidth: "8.5rem",
            maxWidth: "13rem",
          }}
        >
          <option value="">
            {teachers.length ? "— No teacher —" : "No teachers yet"}
          </option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {labelForTeacher(t)}
            </option>
          ))}
        </select>
      );
    }

    if (currentTeacher) {
      return (
        <span className="tiny muted">
          Teacher: {labelForTeacher(currentTeacher)}
        </span>
      );
    }

    return <span className="tiny muted">—</span>;
  };

  const renderRoleButtons = (u) => (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        gap: "0.35rem",
        flexWrap: "wrap",
      }}
    >
      {u.role !== "teacher" && (
        <button
          className="review-btn"
          onClick={() => updateRole(u.id, "teacher")}
          style={{
            fontSize: "0.8rem",
            padding: "0.25rem 0.6rem",
          }}
        >
          Make Teacher
        </button>
      )}

      {u.role !== "student" && (
        <button
          className="ghost-btn"
          onClick={() => updateRole(u.id, "student")}
          style={{
            marginLeft: 0,
            fontSize: "0.8rem",
            padding: "0.25rem 0.6rem",
          }}
        >
          Make Student
        </button>
      )}

      {u.role !== "admin" && (
        <button
          className="generate-btn"
          onClick={() => updateRole(u.id, "admin")}
          style={{
            marginLeft: 0,
            fontSize: "0.8rem",
            padding: "0.25rem 0.6rem",
          }}
        >
          Make Admin
        </button>
      )}
    </div>
  );

  // NEW: helper for sorting
  const primaryLabel = (u) =>
    (u.email || u.username || u.id || "").toLowerCase();

  const teacherLabelForStudent = (u) => {
    if (!u.teacherId) return "";
    const t = teachers.find((t) => t.id === u.teacherId);
    return t ? labelForTeacher(t).toLowerCase() : "";
  };

  // NEW: filter by teacher / assignment
  let filtered = users;
  if (teacherFilter === "no-teacher") {
    filtered = users.filter((u) => u.role === "student" && !u.teacherId);
  } else if (teacherFilter === "has-teacher") {
    filtered = users.filter((u) => u.role === "student" && !!u.teacherId);
  } else if (teacherFilter !== "all") {
    // specific teacher id
    filtered = users.filter(
      (u) => u.role === "student" && u.teacherId === teacherFilter
    );
  }

  const normalizedSearch = searchTerm.trim().toLowerCase();
  if (normalizedSearch) {
    filtered = filtered.filter((u) => {
      const teacherLabel = teacherLabelForStudent(u);
      const haystack = [
        u.email || "",
        u.username || "",
        u.name || "",
        u.displayName || "",
        u.id || "",
        teacherLabel || "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }

  // NEW: sort the filtered list
  const displayedUsers = [...filtered].sort((a, b) => {
    let aKey = "";
    let bKey = "";

    if (sortBy === "email") {
      aKey = primaryLabel(a);
      bKey = primaryLabel(b);
    } else if (sortBy === "role") {
      aKey = (a.role || "").toLowerCase();
      bKey = (b.role || "").toLowerCase();
    } else if (sortBy === "teacher") {
      aKey = teacherLabelForStudent(a);
      bKey = teacherLabelForStudent(b);
    }

    if (aKey < bKey) return sortDir === "asc" ? -1 : 1;
    if (aKey > bKey) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // NEW: quick profile navigation
  const goToProfile = (uid) => {
    navigate(`/teacher/student/${uid}`);
  };

  const activeHubCount = users.filter((u) => getHubStatus(u).tone === "success").length;
  const teacherCount = users.filter((u) => u.role === "teacher" || u.role === "admin").length;
  const studentCount = users.filter((u) => u.role === "student").length;
  const emailGroups = users.reduce((acc, u) => {
    const email = (u.email || "").trim().toLowerCase();
    if (!email) return acc;
    if (!acc[email]) acc[email] = [];
    acc[email].push(u);
    return acc;
  }, {});
  const duplicateEmailEntries = Object.entries(emailGroups)
    .filter(([, groupedUsers]) => groupedUsers.length > 1)
    .sort((a, b) => b[1].length - a[1].length);
  const duplicateEmailMap = duplicateEmailEntries.reduce((acc, [email, groupedUsers]) => {
    acc[email] = groupedUsers.length;
    return acc;
  }, {});

  const statusStyles = {
    muted: {
      background: "rgba(148, 163, 184, 0.12)",
      color: "#cbd5e1",
      border: "1px solid rgba(148, 163, 184, 0.25)",
    },
    success: {
      background: "rgba(52, 211, 153, 0.12)",
      color: "#a7f3d0",
      border: "1px solid rgba(52, 211, 153, 0.25)",
    },
    info: {
      background: "rgba(96, 165, 250, 0.12)",
      color: "#bfdbfe",
      border: "1px solid rgba(96, 165, 250, 0.25)",
    },
    danger: {
      background: "rgba(248, 113, 113, 0.12)",
      color: "#fecaca",
      border: "1px solid rgba(248, 113, 113, 0.25)",
    },
  };

  const baseInputStyle = {
    fontSize: "0.8rem",
    padding: "0.45rem 0.6rem",
    borderRadius: "0.65rem",
    border: "1px solid #334155",
    backgroundColor: "#020617",
    color: "#e5e7eb",
    minWidth: "12rem",
  };

  return (
    <div style={{ maxWidth: 1160, margin: "auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <button className="review-btn" onClick={() => navigate("/")}>
          ← Back
        </button>
  
        <button
          className="ghost-btn"
          style={{ fontSize: "0.85rem", padding: "0.25rem 0.6rem" }}
          onClick={() => navigate("/admin/activity")}
        >
          View activity log
        </button>
      </div>
  
      <h1 style={{ marginTop: "0.75rem" }}>Admin Dashboard</h1>
      <p className="muted small">Signed in as: {user.email}</p>

      {loading && <p>Loading users…</p>}

      {!loading && (
        <>
          <div
            style={{
              marginTop: "0.9rem",
              display: "grid",
              gridTemplateColumns: isNarrow ? "1fr" : "repeat(4, minmax(0, 1fr))",
              gap: "0.75rem",
            }}
          >
            {[
              { label: "Users", value: users.length },
              { label: "Students", value: studentCount },
              { label: "Teachers/Admins", value: teacherCount },
              { label: "Active Seif Hub", value: activeHubCount },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: "0.9rem 1rem",
                  borderRadius: "1rem",
                  background: "linear-gradient(180deg, rgba(2,6,23,0.95), rgba(15,23,42,0.9))",
                  border: "1px solid #1e293b",
                }}
              >
                <div style={{ fontSize: "0.76rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {item.label}
                </div>
                <div style={{ marginTop: "0.35rem", fontSize: "1.5rem", fontWeight: 800, color: "#f8fafc" }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {duplicateEmailEntries.length > 0 && (
            <div
              style={{
                marginTop: "0.9rem",
                padding: "0.95rem 1rem",
                borderRadius: "1rem",
                background: "rgba(120, 53, 15, 0.22)",
                border: "1px solid rgba(251, 191, 36, 0.28)",
              }}
            >
              <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#fcd34d", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Possible duplicate Firestore users
              </div>
              <p style={{ marginTop: "0.45rem", color: "#fde68a", lineHeight: 1.5 }}>
                These emails appear on more than one `/users` document. This usually means old Firestore profile docs are still present after an Auth account was deleted or recreated.
              </p>
              <div
                style={{
                  marginTop: "0.7rem",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.55rem",
                }}
              >
                {duplicateEmailEntries.map(([email, groupedUsers]) => (
                  <span
                    key={email}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.45rem",
                      padding: "0.35rem 0.7rem",
                      borderRadius: "999px",
                      background: "rgba(15, 23, 42, 0.72)",
                      border: "1px solid rgba(251, 191, 36, 0.24)",
                      color: "#f8fafc",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>{groupedUsers.length}x</strong>
                    <span>{email}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: "0.9rem",
              padding: "0.9rem 1rem",
              borderRadius: "1rem",
              background: "#020617",
              border: "1px solid #1f2937",
              display: "grid",
              gridTemplateColumns: isNarrow ? "1fr" : "1.1fr 1.1fr 1.3fr",
              gap: "0.9rem",
              alignItems: "end",
            }}
          >
            <div style={{ display: "flex", gap: "0.6rem", alignItems: "end", flexWrap: "wrap" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <span className="tiny muted">Sort by</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={baseInputStyle}
                >
                  <option value="email">Email / Username</option>
                  <option value="role">Role</option>
                  <option value="teacher">Teacher</option>
                </select>
              </label>

              <button
                type="button"
                className="ghost-btn"
                style={{ fontSize: "0.85rem", padding: "0.55rem 0.8rem", marginLeft: 0 }}
                onClick={() =>
                  setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
                }
              >
                {sortDir === "asc" ? "↑ Ascending" : "↓ Descending"}
              </button>
            </div>

            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <span className="tiny muted">Search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Email, username, name, teacher..."
                style={{ ...baseInputStyle, width: "100%" }}
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <span className="tiny muted">Filter</span>
              <select
                value={teacherFilter}
                onChange={(e) => setTeacherFilter(e.target.value)}
                style={{ ...baseInputStyle, width: "100%" }}
              >
                <option value="all">All users</option>
                <option value="no-teacher">Students with no teacher</option>
                <option value="has-teacher">Students with any teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    Students of {labelForTeacher(t)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div
            style={{
              marginTop: "0.9rem",
              padding: "0.95rem 1rem",
              borderRadius: "1rem",
              background: "linear-gradient(180deg, rgba(24, 41, 79, 0.98), rgba(20, 36, 71, 0.98))",
              border: "1px solid #27406f",
              boxShadow: "0 10px 22px rgba(0,0,0,0.12)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "0.8rem",
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: "0.85rem",
                }}
              >
                <div>
                  <div style={{ color: "#f8fafc", fontSize: "1.05rem", fontWeight: 700 }}>
                    All course test sessions
                  </div>
                <div style={{ marginTop: "0.25rem", color: "#9fb4da", fontSize: "0.88rem" }}>
                  Admin view of every assigned Oxford test session, regardless of teacher.
                  </div>
                </div>
              <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
                <div
                  style={{
                    padding: "0.34rem 0.7rem",
                    borderRadius: "999px",
                    background: "rgba(253, 191, 45, 0.14)",
                    border: "1px solid rgba(253, 191, 45, 0.28)",
                    color: "#ffd56e",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                  }}
                >
                  {courseTestSessions.length} session{courseTestSessions.length === 1 ? "" : "s"}
                </div>
                <button
                  type="button"
                  className="ghost-btn"
                  style={{ fontSize: "0.85rem", padding: "0.5rem 0.8rem", marginLeft: 0 }}
                  onClick={() => setShowCourseTestSessions((prev) => !prev)}
                >
                  {showCourseTestSessions ? "Hide sessions" : "Show sessions"}
                </button>
              </div>
            </div>

            {!showCourseTestSessions ? (
              <p style={{ margin: 0, color: "#94a3b8" }}>
                Hidden by default so the dashboard stays focused on student management.
              </p>
            ) : loadingSessions ? (
              <p style={{ margin: 0, color: "#cbd5e1" }}>Loading sessions…</p>
            ) : !courseTestSessions.length ? (
              <p style={{ margin: 0, color: "#94a3b8" }}>No course test sessions found.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {courseTestSessions.map((session) => (
                  <section
                    key={session.id}
                    style={{
                      borderRadius: "0.95rem",
                      border: "1px solid rgba(51, 65, 85, 0.7)",
                      background: "rgba(2, 6, 23, 0.22)",
                      padding: "0.95rem 1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "0.8rem",
                        flexWrap: "wrap",
                        alignItems: "center",
                        marginBottom: "0.8rem",
                      }}
                    >
                      <div>
                        <div style={{ color: "#f8fafc", fontWeight: 700 }}>
                          {session.templateTitle || "Course test session"}
                        </div>
                        <div style={{ color: "#9fb4da", fontSize: "0.85rem", marginTop: "0.2rem" }}>
                          {session.teacherName || session.teacherEmail || session.teacherUid || "Unknown teacher"}
                        </div>
                      </div>
                      <span
                        style={{
                          padding: "0.3rem 0.65rem",
                          borderRadius: "999px",
                          background: "rgba(59, 130, 246, 0.12)",
                          border: "1px solid rgba(59, 130, 246, 0.28)",
                          color: "#bfdbfe",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          textTransform: "capitalize",
                        }}
                      >
                        {session.status || "scheduled"}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: isNarrow ? "1fr" : "repeat(4, minmax(0, 1fr))",
                        gap: "0.75rem",
                        marginBottom: "0.8rem",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.73rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>Level</div>
                        <div style={{ color: "#e5e7eb" }}>{session.level ? String(session.level).toUpperCase() : "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.73rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>Type</div>
                        <div style={{ color: "#e5e7eb" }}>{session.testKind || "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.73rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>Students</div>
                        <div style={{ color: "#e5e7eb" }}>{Array.isArray(session.targetStudentIds) ? session.targetStudentIds.length : 0}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.73rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>Created</div>
                        <div style={{ color: "#e5e7eb" }}>
                          {typeof session.createdAt?.toDate === "function"
                            ? session.createdAt.toDate().toLocaleString("en-GB")
                            : "—"}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "0.7rem",
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ color: "#9fb4da", fontSize: "0.84rem" }}>
                        {session.className ? `Class: ${session.className}` : "No class label"}
                      </div>
                      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="ghost-btn"
                          style={{ marginLeft: 0 }}
                          onClick={() => openReviewSession(session)}
                        >
                          View submissions
                        </button>
                        <button
                          type="button"
                          className="btn danger"
                          onClick={() => removeCourseTestSession(session)}
                          disabled={deletingSessionId === session.id}
                        >
                          {deletingSessionId === session.id ? "Deleting..." : "Delete session"}
                        </button>
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.9rem",
            }}
          >
            {displayedUsers.map((u) => {
              const hubStatus = getHubStatus(u);
              const emailKey = (u.email || "").trim().toLowerCase();
              const duplicateCount = duplicateEmailMap[emailKey] || 0;

              return (
                <section
                  key={u.id}
                  style={{
                    borderRadius: "1rem",
                    border: "1px solid #27406f",
                    background: "linear-gradient(180deg, rgba(24, 41, 79, 0.98), rgba(20, 36, 71, 0.98))",
                    boxShadow: "0 10px 22px rgba(0,0,0,0.12)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "1rem 1.1rem",
                      borderBottom: "1px solid rgba(39, 64, 111, 0.8)",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "0.9rem",
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <button
                        type="button"
                        onClick={() => goToProfile(u.id)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          margin: 0,
                          color: "#f8fafc",
                          textAlign: "left",
                          cursor: "pointer",
                          fontSize: isNarrow ? "1rem" : "1.1rem",
                          fontWeight: 700,
                        }}
                      >
                        {u.email || `(no email) ${u.id}`}
                      </button>
                      {u.username && (
                        <div style={{ marginTop: "0.2rem", fontSize: "0.88rem", color: "#9fb4da" }}>
                          @{u.username}
                        </div>
                      )}
                      {duplicateCount > 1 && (
                        <div
                          style={{
                            marginTop: "0.55rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.45rem",
                            padding: "0.28rem 0.6rem",
                            borderRadius: "999px",
                            background: "rgba(120, 53, 15, 0.22)",
                            border: "1px solid rgba(251, 191, 36, 0.24)",
                            color: "#fde68a",
                            fontSize: "0.76rem",
                            fontWeight: 700,
                          }}
                        >
                          Duplicate email: {duplicateCount} records
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          padding: "0.34rem 0.7rem",
                          borderRadius: "999px",
                          background: "rgba(253, 191, 45, 0.14)",
                          border: "1px solid rgba(253, 191, 45, 0.28)",
                          color: "#ffd56e",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          textTransform: "capitalize",
                        }}
                      >
                        {u.role}
                      </span>
                      <span
                        style={{
                          padding: "0.34rem 0.7rem",
                          borderRadius: "999px",
                          fontSize: "0.76rem",
                          fontWeight: 700,
                          ...statusStyles[hubStatus.tone],
                        }}
                      >
                        {hubStatus.label}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "1rem 1.1rem 1.1rem",
                      display: "grid",
                      gridTemplateColumns: isNarrow
                        ? "1fr"
                        : "minmax(220px, 1.05fr) minmax(320px, 1.25fr) minmax(220px, 0.9fr)",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.7rem",
                        padding: "0.85rem",
                        borderRadius: "0.9rem",
                        background: "rgba(2, 6, 23, 0.22)",
                        border: "1px solid rgba(51, 65, 85, 0.7)",
                      }}
                    >
                      <div style={{ fontSize: "0.74rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Assignment
                      </div>
                      <div>
                        <div style={{ fontSize: "0.8rem", color: "#cbd5e1", marginBottom: "0.35rem" }}>
                          Teacher
                        </div>
                        {renderTeacherControl(u)}
                      </div>
                      <label
                        style={{
                          display: "inline-flex",
                          gap: "0.55rem",
                          alignItems: "center",
                          fontSize: "0.88rem",
                          color: "#dbe7ff",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={hasPack(u)}
                          onChange={(e) => setPackAccess(u.id, e.target.checked)}
                        />
                        Course pack access
                      </label>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.7rem",
                        padding: "0.85rem",
                        borderRadius: "0.9rem",
                        background: "rgba(2, 6, 23, 0.22)",
                        border: "1px solid rgba(51, 65, 85, 0.7)",
                      }}
                    >
                      <div style={{ fontSize: "0.74rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Seif Hub Access
                      </div>
                      {renderHubAccessControl(u)}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                        padding: "0.85rem",
                        borderRadius: "0.9rem",
                        background: "rgba(2, 6, 23, 0.22)",
                        border: "1px solid rgba(51, 65, 85, 0.7)",
                      }}
                    >
                      <div style={{ fontSize: "0.74rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Actions
                      </div>
                      <button
                        className="ghost-btn"
                        style={{
                          fontSize: "0.85rem",
                          padding: "0.45rem 0.75rem",
                          marginLeft: 0,
                          alignSelf: "flex-start",
                        }}
                        onClick={() => goToProfile(u.id)}
                      >
                        View profile
                      </button>
                      {renderRoleButtons(u)}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}

      {reviewSession ? (
        <div
          onClick={closeReviewSession}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2, 6, 23, 0.78)",
            zIndex: 70,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.2rem",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(1180px, 100%)",
              maxHeight: "88vh",
              overflow: "auto",
              borderRadius: "1.1rem",
              border: "1px solid #27406f",
              background: "linear-gradient(180deg, rgba(24, 41, 79, 0.98), rgba(20, 36, 71, 0.98))",
              boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
              padding: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "0.8rem",
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: "1rem",
              }}
            >
              <div>
                <h3 style={{ margin: 0, color: "#f8fafc" }}>{reviewSession.templateTitle || "Course test review"}</h3>
                <p style={{ margin: "0.3rem 0 0", color: "#b7c6e6" }}>
                  Review submissions, inspect full answers, and adjust scoring if needed.
                </p>
              </div>
              <button type="button" className="ghost-btn" onClick={closeReviewSession}>
                Close
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isNarrow ? "1fr" : "280px minmax(0, 1fr)",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  borderRadius: "0.95rem",
                  border: "1px solid rgba(51, 65, 85, 0.7)",
                  background: "rgba(2, 6, 23, 0.22)",
                  padding: "0.9rem",
                }}
              >
                <strong style={{ color: "#f8fafc" }}>Submissions</strong>
                {reviewAttemptsLoading ? (
                  <p style={{ color: "#94a3b8" }}>Loading submissions…</p>
                ) : !reviewAttempts.length ? (
                  <p style={{ color: "#94a3b8" }}>No submissions yet for this session.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem", marginTop: "0.8rem" }}>
                    {reviewAttempts.map((attempt) => (
                      <button
                        key={attempt.id}
                        type="button"
                        onClick={() => setSelectedAttempt(attempt)}
                        style={{
                          textAlign: "left",
                          borderRadius: "0.85rem",
                          padding: "0.8rem",
                          border: selectedAttempt?.id === attempt.id ? "1px solid #60a5fa" : "1px solid rgba(51, 65, 85, 0.7)",
                          background: selectedAttempt?.id === attempt.id ? "rgba(37, 99, 235, 0.18)" : "rgba(15, 23, 42, 0.65)",
                          color: "#e5e7eb",
                        }}
                      >
                        <strong>{attempt.studentName || attempt.studentEmail || attempt.studentUid}</strong>
                        <div style={{ marginTop: "0.25rem", fontSize: "0.82rem", color: "#9fb4da" }}>
                          {attempt.reviewStatus === "reviewed"
                            ? `Reviewed · ${attempt.finalPercent ?? 0}%`
                            : `Submitted · ${attempt.percent ?? 0}% auto`}
                        </div>
                        <div style={{ marginTop: "0.2rem", fontSize: "0.78rem", color: "#94a3b8" }}>
                          {formatDateTime(attempt.submittedAt || attempt.updatedAt)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                {!selectedAttempt ? (
                  <p style={{ color: "#94a3b8" }}>Choose a submission to review.</p>
                ) : (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: isNarrow ? "1fr" : "repeat(3, minmax(0, 1fr))",
                        gap: "0.75rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <div style={{ padding: "0.85rem", borderRadius: "0.9rem", border: "1px solid rgba(51, 65, 85, 0.7)", background: "rgba(2, 6, 23, 0.22)" }}>
                        <div style={{ fontSize: "0.74rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>Student</div>
                        <div style={{ marginTop: "0.35rem", color: "#e5e7eb" }}>{selectedAttempt.studentName || selectedAttempt.studentEmail || selectedAttempt.studentUid}</div>
                      </div>
                      <div style={{ padding: "0.85rem", borderRadius: "0.9rem", border: "1px solid rgba(51, 65, 85, 0.7)", background: "rgba(2, 6, 23, 0.22)" }}>
                        <div style={{ fontSize: "0.74rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>Submitted</div>
                        <div style={{ marginTop: "0.35rem", color: "#e5e7eb" }}>{formatDateTime(selectedAttempt.submittedAt || selectedAttempt.updatedAt)}</div>
                      </div>
                      <div style={{ padding: "0.85rem", borderRadius: "0.9rem", border: "1px solid rgba(51, 65, 85, 0.7)", background: "rgba(2, 6, 23, 0.22)" }}>
                        <div style={{ fontSize: "0.74rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>Teacher score</div>
                        <div style={{ marginTop: "0.35rem", color: "#e5e7eb" }}>
                          {reviewTotals.score}/{reviewTotals.total}
                          {reviewTotals.total ? ` · ${Math.round((reviewTotals.score / reviewTotals.total) * 100)}%` : ""}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                      {selectedAttemptReviewRows.map((section) => (
                        <div
                          key={section.id}
                          style={{
                            borderRadius: "0.95rem",
                            border: "1px solid rgba(51, 65, 85, 0.7)",
                            background: "rgba(2, 6, 23, 0.22)",
                            padding: "0.95rem",
                          }}
                        >
                          <h4 style={{ marginTop: 0, marginBottom: "0.35rem", color: "#f8fafc" }}>{section.title}</h4>
                          {section.penalty ? (
                            <p style={{ marginTop: 0, color: "#94a3b8", fontSize: "0.84rem" }}>
                              Extra word penalty: -{section.penalty}
                            </p>
                          ) : null}
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                            {section.reviewItems.map(({ item, key, answer, autoCorrect, autoScore }) => {
                              const scoreValue = Number(reviewScores[key] ?? Number(autoScore || 0));
                              const borderColor = scoreValue >= 1
                                ? "rgba(62, 175, 124, 0.7)"
                                : scoreValue > 0
                                  ? "rgba(253, 191, 45, 0.7)"
                                  : "rgba(202, 96, 109, 0.8)";

                              return (
                                <div
                                  key={key}
                                  style={{
                                    borderRadius: "0.85rem",
                                    border: `1px solid ${borderColor}`,
                                    background: "rgba(15, 23, 42, 0.6)",
                                    padding: "0.85rem",
                                  }}
                                >
                                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap", alignItems: "center" }}>
                                    <strong style={{ color: "#f8fafc" }}>{item.prompt}</strong>
                                    <select
                                      className="input"
                                      style={{ width: "90px" }}
                                      value={String(reviewScores[key] ?? (autoCorrect ? 1 : 0))}
                                      onChange={(event) =>
                                        setReviewScores((prev) => ({
                                          ...prev,
                                          [key]: Number(event.target.value),
                                        }))
                                      }
                                    >
                                      <option value="0">0</option>
                                      <option value="0.5">0.5</option>
                                      <option value="1">1</option>
                                    </select>
                                  </div>
                                  <div
                                    style={{
                                      display: "grid",
                                      gridTemplateColumns: isNarrow ? "1fr" : "repeat(3, minmax(0, 1fr))",
                                      gap: "0.8rem",
                                      marginTop: "0.8rem",
                                    }}
                                  >
                                    <div>
                                      <div style={{ fontSize: "0.74rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>Student answer</div>
                                      <p style={{ color: "#e5e7eb" }}>{formatAttemptAnswer(item, answer)}</p>
                                    </div>
                                    <div>
                                      <div style={{ fontSize: "0.74rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>Answer key</div>
                                      <p style={{ color: "#e5e7eb" }}>{formatAcceptedAnswer(item)}</p>
                                    </div>
                                    <div>
                                      <div style={{ fontSize: "0.74rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>Auto-check</div>
                                      <p style={{ color: autoScore >= 1 ? "#8be0b2" : autoScore > 0 ? "#fde68a" : "#ffb4bf" }}>
                                        {autoScore >= 1 ? "Correct" : autoScore > 0 ? `Partial credit (${autoScore})` : "Wrong / needs teacher review"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
                      <button type="button" className="btn" onClick={handleSaveReview} disabled={reviewSaving}>
                        {reviewSaving ? "Saving..." : "Save review"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
