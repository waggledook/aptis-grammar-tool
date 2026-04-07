import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  db,
  createCourseTestSession,
  listAttemptsForMyCourseTestSession,
  listMyCourseTestSessions,
  saveCourseTestAttemptReview,
  updateCourseTestSession,
} from "../../firebase";
import { getHubCourseTestTemplate, listHubCourseTestTemplates } from "../../data/hubCourseTestTemplates.js";
import { getSitePath } from "../../siteConfig.js";
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

function toDateOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeReviewAnswer(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[-.,!?;:()[\]{}"“”]/g, " ")
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
    const normalized = normalizeReviewAnswer(answer);
    if (!normalized) return 0;
    if (Array.isArray(item.acceptedAnswers) && item.acceptedAnswers.length) {
      return item.acceptedAnswers.some((entry) => normalizeReviewAnswer(entry) === normalized) ? 1 : 0;
    }
    return normalized === normalizeReviewAnswer(item.answer) ? 1 : 0;
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
      return item.acceptedAnswers.join(" / ");
    }
    return item.answer || "—";
  }

  if (isSortBySoundItem(item)) {
    return item.answer || "—";
  }

  if (Array.isArray(item?.acceptedAnswers)) {
    return item.acceptedAnswers.join(" / ");
  }

  return "—";
}

function renderPreviewLabel(option) {
  if (!option || typeof option === "string") return option || "";

  const text = String(option.text || "");
  const highlightMeta = option.highlight;
  const highlight = typeof highlightMeta === "string" ? highlightMeta : String(highlightMeta?.text || "");
  const occurrence = typeof highlightMeta === "object" ? highlightMeta?.occurrence : "first";
  if (!highlight) return text;

  const lowerText = text.toLowerCase();
  const lowerHighlight = highlight.toLowerCase();
  const index = occurrence === "last" ? lowerText.lastIndexOf(lowerHighlight) : lowerText.indexOf(lowerHighlight);
  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <span className="teacher-course-preview-highlight">{text.slice(index, index + highlight.length)}</span>
      {text.slice(index + highlight.length)}
    </>
  );
}

function renderPreviewPassage(text = "", highlights = []) {
  const safeText = String(text || "");
  const safeHighlights = (Array.isArray(highlights) ? highlights : [])
    .map((entry) => String(entry || "").trim())
    .filter(Boolean);

  if (!safeHighlights.length) return safeText;

  const pattern = new RegExp(
    `\\b(${safeHighlights.map((entry) => entry.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
    "gi"
  );

  return safeText.split(pattern).map((part, index) => {
    const isHighlight = safeHighlights.some((entry) => entry.toLowerCase() === part.toLowerCase());
    return isHighlight
      ? <span key={`${part}-${index}`} className="teacher-course-preview-highlight">{part}</span>
      : <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
  });
}

export default function TeacherCourseTests({ user }) {
  const navigate = useNavigate();
  const templates = useMemo(() => listHubCourseTestTemplates(), []);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [templateId, setTemplateId] = useState(templates[0]?.id || "");
  const [sessionTitle, setSessionTitle] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [notes, setNotes] = useState("");
  const [requirePin, setRequirePin] = useState(false);
  const [controlMode, setControlMode] = useState("teacher-controlled");
  const [reviewSession, setReviewSession] = useState(null);
  const [reviewAttempts, setReviewAttempts] = useState([]);
  const [reviewAttemptsLoading, setReviewAttemptsLoading] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [reviewScores, setReviewScores] = useState({});
  const [reviewSaving, setReviewSaving] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      try {
        const studentQuery = query(collection(db, "users"), where("teacherId", "==", user.uid));
        const [studentSnap, rosterSnap, sessionRows] = await Promise.all([
          getDocs(studentQuery),
          getDocs(collection(db, "users", user.uid, "studentRoster")),
          listMyCourseTestSessions(),
        ]);

        if (!alive) return;

        const rosterMeta = {};
        rosterSnap.forEach((entry) => {
          rosterMeta[entry.id] = entry.data() || {};
        });

        const studentRows = studentSnap.docs.map((entry) => {
          const data = entry.data() || {};
          const meta = rosterMeta[entry.id] || {};

          return {
            id: entry.id,
            email: data.email || "",
            displayName: data.displayName || data.name || data.username || data.email || entry.id,
            className: (meta.className || "").trim(),
          };
        });

        setStudents(studentRows);
        setSessions(sessionRows || []);
      } catch (error) {
        console.error("[TeacherCourseTests] load failed", error);
        toast("Could not load course test data.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [user.uid]);

  const classOptions = useMemo(() => {
    return [...new Set(students.map((student) => student.className).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (classFilter === "all") return students;
    if (classFilter === "__unlabelled__") return students.filter((student) => !student.className);
    return students.filter((student) => student.className === classFilter);
  }, [students, classFilter]);

  const selectedTemplate = templates.find((template) => template.id === templateId) || null;
  const selectedAttemptTemplate = selectedAttempt?.templateId
    ? getHubCourseTestTemplate(selectedAttempt.templateId)
    : null;

  const allFilteredSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((student) => selectedStudentIds.includes(student.id));

  const toggleStudent = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((entry) => entry !== studentId) : [...prev, studentId]
    );
  };

  const toggleFilteredStudents = () => {
    setSelectedStudentIds((prev) => {
      const filteredIds = filteredStudents.map((student) => student.id);
      if (allFilteredSelected) {
        return prev.filter((entry) => !filteredIds.includes(entry));
      }
      return [...new Set([...prev, ...filteredIds])];
    });
  };

  const resetForm = () => {
    setSessionTitle("");
    setClassFilter("all");
    setSelectedStudentIds([]);
    setStartsAt("");
    setEndsAt("");
    setNotes("");
    setRequirePin(false);
    setControlMode("teacher-controlled");
  };

  const handleSessionStageUpdate = async (sessionId, patch, message) => {
    try {
      await updateCourseTestSession(sessionId, patch);
      const refreshed = await listMyCourseTestSessions();
      setSessions(refreshed || []);
      toast(message);
    } catch (error) {
      console.error("[TeacherCourseTests] stage update failed", error);
      toast("Could not update that session.");
    }
  };

  const openReviewSession = async (session) => {
    setReviewSession(session);
    setSelectedAttempt(null);
    setReviewScores({});
    setReviewAttemptsLoading(true);
    try {
      const rows = await listAttemptsForMyCourseTestSession(session.id);
      setReviewAttempts(rows || []);
    } catch (error) {
      console.error("[TeacherCourseTests] review load failed", error);
      toast("Could not load test submissions.");
    } finally {
      setReviewAttemptsLoading(false);
    }
  };

  const closeReviewSession = () => {
    setReviewSession(null);
    setReviewAttempts([]);
    setSelectedAttempt(null);
    setReviewScores({});
    setReviewSaving(false);
  };

  const openPreviewTemplate = (template) => {
    if (!template) return;
    setPreviewTemplate(template);
  };

  const closePreviewTemplate = () => {
    setPreviewTemplate(null);
  };

  const handleCreateSession = async () => {
    if (!selectedTemplate) {
      toast("Choose a test template first.");
      return;
    }

    if (!selectedStudentIds.length) {
      toast("Choose at least one student.");
      return;
    }

    setSaving(true);
    try {
      const created = await createCourseTestSession({
        templateId: selectedTemplate.id,
        templateTitle: sessionTitle.trim() || selectedTemplate.title,
        level: selectedTemplate.level,
        testKind: selectedTemplate.testKind,
        className: classFilter !== "all" && classFilter !== "__unlabelled__" ? classFilter : "",
        notes,
        targetStudentIds: selectedStudentIds,
        startsAt: toDateOrNull(startsAt),
        endsAt: toDateOrNull(endsAt),
        accessMode: "assigned",
        requirePin,
        status: "scheduled",
        controlMode,
      });

      const refreshed = await listMyCourseTestSessions();
      setSessions(refreshed || []);
      resetForm();

      toast(
        created?.accessPin
          ? `Course test session created. PIN: ${created.accessPin}`
          : "Course test session created."
      );
    } catch (error) {
      console.error("[TeacherCourseTests] create session failed", error);
      toast("Could not create that test session.");
    } finally {
      setSaving(false);
    }
  };

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

  const handleSaveReview = async () => {
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
        reviewedByName: user.displayName || user.email || "Teacher",
      });

      const refreshed = await listAttemptsForMyCourseTestSession(reviewSession.id);
      setReviewAttempts(refreshed || []);
      const updatedAttempt = (refreshed || []).find((entry) => entry.id === selectedAttempt.id) || null;
      setSelectedAttempt(updatedAttempt);
      toast("Review saved.");
    } catch (error) {
      console.error("[TeacherCourseTests] save review failed", error);
      toast("Could not save that review.");
    } finally {
      setReviewSaving(false);
    }
  };

  return (
    <div className="teacher-course-tests">
      <div className="teacher-course-tests-grid">
        <div className="teacher-course-panel">
          <h3 className="sec-title" style={{ marginTop: 0 }}>Create a course test session</h3>
          <p className="muted small" style={{ marginTop: 0 }}>
            Choose one of the fixed Oxford tests, assign it to a class or selected students, and set a session
            window for class use.
          </p>

          <div className="teacher-course-form">
            <label>
              <span className="panel-label">Test template</span>
              <select className="input" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="panel-label">Session title</span>
              <input
                className="input"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder={selectedTemplate?.title || "Session title"}
              />
            </label>

            <div className="teacher-course-row">
              <label>
                <span className="panel-label">Class filter</span>
                <select className="input" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                  <option value="all">All students</option>
                  <option value="__unlabelled__">No class label</option>
                  {classOptions.map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="panel-label">Access</span>
                <div className="teacher-course-inline-check">
                  <input
                    type="checkbox"
                    checked={requirePin}
                    onChange={(e) => setRequirePin(e.target.checked)}
                  />
                  <span>Generate session PIN</span>
                </div>
              </label>
            </div>

            <label>
              <span className="panel-label">Session control</span>
              <select className="input" value={controlMode} onChange={(e) => setControlMode(e.target.value)}>
                <option value="teacher-controlled">Teacher-controlled</option>
                <option value="self-controlled">Self-controlled</option>
              </select>
              <div className="muted small" style={{ marginTop: "0.35rem" }}>
                Teacher-controlled waits for you to open the main paper and listening. Self-controlled lets students work within the session window on their own.
              </div>
            </label>

            <div className="teacher-course-row">
              <label>
                <span className="panel-label">Available from</span>
                <input
                  className="input"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                />
              </label>

              <label>
                <span className="panel-label">Available until</span>
                <input
                  className="input"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                />
              </label>
            </div>

            <label>
              <span className="panel-label">Teacher notes</span>
              <textarea
                className="input"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional instructions for this class session..."
              />
            </label>

            <div className="teacher-course-students">
              <div className="teacher-course-students-head">
                <div>
                  <span className="panel-label">Assigned students</span>
                  <div className="muted small">
                    {selectedStudentIds.length} selected
                  </div>
                </div>
                <button type="button" className="ghost-btn" onClick={toggleFilteredStudents}>
                  {allFilteredSelected ? "Clear filtered" : "Select filtered"}
                </button>
              </div>

              <div className="teacher-course-student-list">
                {filteredStudents.map((student) => (
                  <label key={student.id} className="teacher-course-student-row">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(student.id)}
                      onChange={() => toggleStudent(student.id)}
                    />
                    <span>
                      <strong>{student.displayName}</strong>
                      <span className="muted small" style={{ display: "block" }}>
                        {student.email || student.id}
                        {student.className ? ` · ${student.className}` : ""}
                      </span>
                    </span>
                  </label>
                ))}
                {!filteredStudents.length ? <p className="muted small">No students match that class filter.</p> : null}
              </div>
            </div>

            <div className="teacher-course-actions">
              <button className="btn" type="button" onClick={handleCreateSession} disabled={saving}>
                {saving ? "Creating..." : "Create session"}
              </button>
              <button className="ghost-btn" type="button" onClick={() => openPreviewTemplate(selectedTemplate)} disabled={!selectedTemplate || saving}>
                View exam
              </button>
              <button className="ghost-btn" type="button" onClick={resetForm} disabled={saving}>
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="teacher-course-panel">
          <h3 className="sec-title" style={{ marginTop: 0 }}>My course test sessions</h3>
          <p className="muted small" style={{ marginTop: 0 }}>
            Fixed Oxford-based test sessions you’ve already set up for students.
          </p>

          {loading ? (
            <p className="muted">Loading…</p>
          ) : !sessions.length ? (
            <p className="muted small">No course test sessions yet.</p>
          ) : (
            <div className="teacher-course-session-list">
              {sessions.map((session) => (
                <div key={session.id} className="teacher-course-session-card">
                  <div className="teacher-course-session-head">
                    <div>
                      <strong>{session.templateTitle || session.title || "Course test session"}</strong>
                      <div className="muted small">
                        {session.testKind === "end-of-course" ? "End-of-course test" : "Progress test"} ·{" "}
                        {(session.level || "b1").toUpperCase()}
                        {` · ${session.controlMode === "self-controlled" ? "Self-controlled" : "Teacher-controlled"}`}
                      </div>
                    </div>
                    <span className="teacher-course-chip">{session.status || "scheduled"}</span>
                  </div>

                  <div className="teacher-course-session-meta">
                    <div>
                      <span className="panel-label">Students</span>
                      <p>{Array.isArray(session.targetStudentIds) ? session.targetStudentIds.length : 0}</p>
                    </div>
                    <div>
                      <span className="panel-label">Class</span>
                      <p>{session.className || "—"}</p>
                    </div>
                    <div>
                      <span className="panel-label">PIN</span>
                      <p>{session.accessPin || "—"}</p>
                    </div>
                  </div>

                  <div className="teacher-course-session-meta">
                    <div>
                      <span className="panel-label">Starts</span>
                      <p>{formatDateTime(session.startsAt)}</p>
                    </div>
                    <div>
                      <span className="panel-label">Ends</span>
                      <p>{formatDateTime(session.endsAt)}</p>
                    </div>
                    <div>
                      <span className="panel-label">Created</span>
                      <p>{formatDateTime(session.createdAt)}</p>
                    </div>
                  </div>

                  <div className="teacher-course-session-meta">
                    <div>
                      <span className="panel-label">Main paper</span>
                      <p>{session.mainPaperState || (session.controlMode === "self-controlled" ? "open" : "locked")}</p>
                    </div>
                    <div>
                      <span className="panel-label">Listening</span>
                      <p>{session.listeningState || (session.controlMode === "self-controlled" ? "open" : "locked")}</p>
                    </div>
                    <div>
                      <span className="panel-label">Mode</span>
                      <p>{session.controlMode === "self-controlled" ? "Self-controlled" : "Teacher-controlled"}</p>
                    </div>
                  </div>

                  {session.notes ? (
                    <div className="teacher-course-session-note">
                      <span className="panel-label">Notes</span>
                      <p>{session.notes}</p>
                    </div>
                  ) : null}

                  <div className="teacher-course-actions">
                    {session.controlMode !== "self-controlled" ? (
                      <>
                        <button
                          type="button"
                          className="ghost-btn"
                          onClick={() =>
                            handleSessionStageUpdate(
                              session.id,
                              { mainPaperState: session.mainPaperState === "open" ? "locked" : "open" },
                              session.mainPaperState === "open" ? "Main paper locked." : "Main paper opened."
                            )
                          }
                        >
                          {session.mainPaperState === "open" ? "Lock main paper" : "Open main paper"}
                        </button>
                        <button
                          type="button"
                          className="ghost-btn"
                          onClick={() =>
                            handleSessionStageUpdate(
                              session.id,
                              { listeningState: session.listeningState === "open" ? "locked" : "open" },
                              session.listeningState === "open" ? "Listening locked." : "Listening opened."
                            )
                          }
                        >
                          {session.listeningState === "open" ? "Lock listening" : "Open listening"}
                        </button>
                      </>
                    ) : null}
                    <button type="button" className="ghost-btn" onClick={() => openPreviewTemplate(getHubCourseTestTemplate(session.templateId))}>
                      View exam
                    </button>
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={() =>
                        navigate(getSitePath(`/your-class/tests/${session.id}?teacherPreview=1`))
                      }
                    >
                      Do session
                    </button>
                    <button type="button" className="ghost-btn" onClick={() => openReviewSession(session)}>
                      Review submissions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {reviewSession ? (
        <div className="teacher-course-review-overlay" onClick={closeReviewSession}>
          <div className="teacher-course-review-modal" onClick={(event) => event.stopPropagation()}>
            <div className="teacher-course-review-head">
              <div>
                <h3>{reviewSession.templateTitle || "Course test review"}</h3>
                <p>
                  Review submissions, inspect full answers, and override item scores where needed.
                </p>
              </div>
              <button type="button" className="ghost-btn" onClick={closeReviewSession}>
                Close
              </button>
            </div>

            <div className="teacher-course-review-grid">
              <div className="teacher-course-review-sidebar">
                <strong>Submissions</strong>
                {reviewAttemptsLoading ? (
                  <p className="muted small">Loading submissions…</p>
                ) : !reviewAttempts.length ? (
                  <p className="muted small">No submissions yet for this session.</p>
                ) : (
                  <div className="teacher-course-review-attempt-list">
                    {reviewAttempts.map((attempt) => (
                      <button
                        key={attempt.id}
                        type="button"
                        className={`teacher-course-review-attempt-btn ${selectedAttempt?.id === attempt.id ? "is-active" : ""}`}
                        onClick={() => setSelectedAttempt(attempt)}
                      >
                        <strong>{attempt.studentName || attempt.studentEmail || attempt.studentUid}</strong>
                        <span className="muted small">
                          {attempt.reviewStatus === "reviewed"
                            ? `Reviewed · ${attempt.finalPercent ?? 0}%`
                            : `Submitted · ${attempt.percent ?? 0}% auto`}
                        </span>
                        <span className="muted small">{formatDateTime(attempt.submittedAt || attempt.updatedAt)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="teacher-course-review-body">
                {!selectedAttempt ? (
                  <p className="muted small">Choose a submission to review.</p>
                ) : (
                  <>
                    <div className="teacher-course-review-summary">
                      <div>
                        <span className="panel-label">Student</span>
                        <p>{selectedAttempt.studentName || selectedAttempt.studentEmail || selectedAttempt.studentUid}</p>
                      </div>
                      <div>
                        <span className="panel-label">Submitted</span>
                        <p>{formatDateTime(selectedAttempt.submittedAt || selectedAttempt.updatedAt)}</p>
                      </div>
                      <div>
                        <span className="panel-label">Teacher score</span>
                        <p>
                          {reviewTotals.score}/{reviewTotals.total}
                          {reviewTotals.total ? ` · ${Math.round((reviewTotals.score / reviewTotals.total) * 100)}%` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="teacher-course-review-sections">
                      {selectedAttemptReviewRows.map((section) => (
                        <div key={section.id} className="teacher-course-review-section">
                          <h4>{section.title}</h4>
                          {section.penalty ? (
                            <p className="muted small" style={{ marginTop: "-0.25rem" }}>
                              Extra word penalty: -{section.penalty}
                            </p>
                          ) : null}
                          <div className="teacher-course-review-items">
                            {section.reviewItems.map(({ item, key, answer, autoCorrect, autoScore }) => {
                              const scoreValue = Number(reviewScores[key] ?? Number(autoScore || 0));
                              const reviewTone = scoreValue >= 1 ? "is-correct" : scoreValue > 0 ? "is-partial" : "is-wrong";

                              return (
                              <div key={key} className={`teacher-course-review-item ${reviewTone}`}>
                                <div className="teacher-course-review-item-head">
                                  <strong>{item.prompt}</strong>
                                  <select
                                    className="input teacher-course-score-select"
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
                                <div className="teacher-course-review-item-grid">
                                  <div>
                                    <span className="panel-label">Student answer</span>
                                    <p>{formatAttemptAnswer(item, answer)}</p>
                                  </div>
                                  <div>
                                    <span className="panel-label">Answer key</span>
                                    <p>{formatAcceptedAnswer(item)}</p>
                                  </div>
                                  <div>
                                    <span className="panel-label">Auto-check</span>
                                    <p className={autoCorrect ? "teacher-course-review-state is-correct" : "teacher-course-review-state is-wrong"}>
                                      {autoScore >= 1 ? "Correct" : autoScore > 0 ? `Partial credit (${autoScore})` : "Wrong / needs teacher review"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )})}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="teacher-course-actions">
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

      {previewTemplate ? (
        <div className="teacher-course-review-overlay" onClick={closePreviewTemplate}>
          <div className="teacher-course-preview-modal" onClick={(event) => event.stopPropagation()}>
            <div className="teacher-course-review-head">
              <div>
                <h3>{previewTemplate.title}</h3>
                <p>Read-only teacher preview of the full paper.</p>
              </div>
              <button type="button" className="ghost-btn" onClick={closePreviewTemplate}>
                Close
              </button>
            </div>

            <div className="teacher-course-preview-sections">
              {(previewTemplate.sections || []).map((section) => (
                <section key={section.id} className="teacher-course-preview-section">
                  <div className="teacher-course-preview-section-head">
                    <h4>{section.title}</h4>
                    <span className="muted small">{section.itemCount} items</span>
                  </div>
                  {section.notes ? <p className="muted small">{section.notes}</p> : null}

                  {section.sharedPrompt?.type === "reading-passage" ? (
                    <div className="teacher-course-preview-passage">
                      {(section.sharedPrompt.passages || []).map((passage) => (
                        <article key={`${section.id}-${passage.heading}`} className="teacher-course-preview-passage-card">
                          <strong>{passage.heading}</strong>
                          <p>{renderPreviewPassage(passage.text, passage.highlightWords)}</p>
                        </article>
                      ))}
                      {Array.isArray(section.sharedPrompt.footerLines) && section.sharedPrompt.footerLines.length ? (
                        <div className="teacher-course-preview-block">
                          {section.sharedPrompt.footerLines.map((line) => <p key={line}>{line}</p>)}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {section.sharedPrompt?.type === "text-block" ? (
                    <div className="teacher-course-preview-block">
                      {section.sharedPrompt.title ? <strong>{section.sharedPrompt.title}</strong> : null}
                      {(section.sharedPrompt.exampleLines || []).map((line) => <p key={line}>{line}</p>)}
                    </div>
                  ) : null}

                  {section.sharedPrompt?.type === "word-bank" ? (
                    <div className="teacher-course-preview-block">
                      {section.sharedPrompt.title ? <strong>{section.sharedPrompt.title}</strong> : null}
                      <div className="teacher-course-preview-chip-row">
                        {(section.sharedPrompt.values || []).map((value, index) => (
                          <span key={`${section.id}-value-${index}`} className="teacher-course-preview-chip">
                            {renderPreviewLabel(value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="teacher-course-preview-items">
                    {(section.items || []).map((item, index) => (
                      <div key={item.id || `${section.id}-${index}`} className="teacher-course-preview-item">
                        <div className="teacher-course-preview-item-index">{index + 1}</div>
                        <div className="teacher-course-preview-item-body">
                          <p>
                            {item.highlight ? renderPreviewLabel({ text: item.prompt, highlight: item.highlight }) : item.prompt}
                          </p>
                          {item.type === "choice" || item.type === "matching-select" ? (
                            <div className="teacher-course-preview-chip-row">
                              {(item.options || []).map((option, optionIndex) => (
                                <span key={`${item.id}-${optionIndex}`} className="teacher-course-preview-chip">
                                  {renderPreviewLabel(option)}
                                </span>
                              ))}
                            </div>
                          ) : null}
                          {item.type === "stress-choice" ? (
                            <div className="teacher-course-preview-chip-row">
                              {(item.syllables || []).map((syllable, syllableIndex) => (
                                <span key={`${item.id}-${syllableIndex}`} className="teacher-course-preview-chip">
                                  {syllable}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <style>{`
        .teacher-course-tests {
          display: grid;
          gap: 1rem;
        }

        .teacher-course-tests-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.1rem;
        }

        .teacher-course-panel {
          border: 1px solid rgba(60, 89, 150, 0.7);
          border-radius: 14px;
          background: rgba(8, 15, 36, 0.28);
          padding: 1rem 1.05rem;
        }

        .teacher-course-form {
          display: grid;
          gap: 0.9rem;
        }

        .teacher-course-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.8rem;
        }

        .teacher-course-inline-check {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          min-height: 44px;
        }

        .teacher-course-students {
          border: 1px solid rgba(60, 89, 150, 0.45);
          border-radius: 12px;
          padding: 0.85rem;
          background: rgba(2, 6, 23, 0.22);
        }

        .teacher-course-students-head {
          display: flex;
          justify-content: space-between;
          gap: 0.75rem;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .teacher-course-student-list {
          max-height: 280px;
          overflow: auto;
          display: grid;
          gap: 0.45rem;
        }

        .teacher-course-student-row {
          display: flex;
          align-items: flex-start;
          gap: 0.7rem;
          padding: 0.6rem 0.65rem;
          border-radius: 10px;
          background: rgba(19, 33, 59, 0.72);
          border: 1px solid rgba(44, 75, 131, 0.55);
        }

        .teacher-course-actions {
          display: flex;
          gap: 0.7rem;
          flex-wrap: wrap;
        }

        .teacher-course-session-list {
          display: grid;
          gap: 0.85rem;
        }

        .teacher-course-session-card {
          border: 1px solid rgba(44, 75, 131, 0.55);
          border-radius: 12px;
          background: rgba(19, 33, 59, 0.72);
          padding: 0.9rem;
          display: grid;
          gap: 0.75rem;
        }

        .teacher-course-session-head {
          display: flex;
          justify-content: space-between;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .teacher-course-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
          border: 1px solid rgba(246, 189, 96, 0.35);
          background: rgba(246, 189, 96, 0.12);
          color: #ffe1a3;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: capitalize;
        }

        .teacher-course-session-meta {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.7rem;
        }

        .teacher-course-session-meta p,
        .teacher-course-session-note p {
          margin: 0.2rem 0 0;
        }

        .teacher-course-review-overlay {
          position: fixed;
          inset: 0;
          z-index: 120;
          background: rgba(2, 8, 24, 0.72);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .teacher-course-review-modal {
          width: min(1220px, 100%);
          max-height: 88vh;
          overflow: auto;
          border-radius: 16px;
          border: 1px solid rgba(60, 89, 150, 0.75);
          background: rgba(11, 19, 42, 0.98);
          padding: 1rem;
          display: grid;
          gap: 1rem;
        }

        .teacher-course-preview-modal {
          width: min(1100px, 100%);
          max-height: 88vh;
          overflow: auto;
          border-radius: 16px;
          border: 1px solid rgba(60, 89, 150, 0.75);
          background: rgba(11, 19, 42, 0.98);
          padding: 1rem;
          display: grid;
          gap: 1rem;
        }

        .teacher-course-review-head {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: flex-start;
        }

        .teacher-course-review-head h3,
        .teacher-course-review-section h4 {
          margin: 0 0 0.25rem;
        }

        .teacher-course-review-head p {
          margin: 0;
        }

        .teacher-course-review-grid {
          display: grid;
          grid-template-columns: minmax(260px, 0.38fr) minmax(0, 1fr);
          gap: 1rem;
        }

        .teacher-course-review-sidebar,
        .teacher-course-review-body,
        .teacher-course-review-section,
        .teacher-course-review-item {
          border: 1px solid rgba(44, 75, 131, 0.55);
          border-radius: 12px;
          background: rgba(19, 33, 59, 0.72);
          padding: 0.9rem;
        }

        .teacher-course-review-item.is-correct {
          border-color: rgba(79, 190, 120, 0.55);
          background: rgba(18, 58, 34, 0.5);
        }

        .teacher-course-review-item.is-partial {
          border-color: rgba(238, 185, 88, 0.55);
          background: rgba(73, 52, 14, 0.46);
        }

        .teacher-course-review-item.is-wrong {
          border-color: rgba(220, 92, 92, 0.52);
          background: rgba(68, 24, 24, 0.5);
        }

        .teacher-course-review-body,
        .teacher-course-review-sections,
        .teacher-course-review-items,
        .teacher-course-review-attempt-list {
          display: grid;
          gap: 0.8rem;
        }

        .teacher-course-review-attempt-btn {
          width: 100%;
          text-align: left;
          border-radius: 10px;
          border: 1px solid rgba(44, 75, 131, 0.55);
          background: rgba(10, 20, 41, 0.9);
          padding: 0.8rem;
          display: grid;
          gap: 0.2rem;
          color: inherit;
        }

        .teacher-course-review-attempt-btn.is-active {
          border-color: rgba(120, 182, 255, 0.7);
          box-shadow: inset 0 0 0 1px rgba(120, 182, 255, 0.24);
        }

        .teacher-course-review-summary,
        .teacher-course-review-item-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.8rem;
        }

        .teacher-course-review-summary p,
        .teacher-course-review-item-grid p {
          margin: 0.2rem 0 0;
          white-space: pre-wrap;
        }

        .teacher-course-review-state.is-correct {
          color: #9df0ba;
          font-weight: 700;
        }

        .teacher-course-review-state.is-wrong {
          color: #ffb1b1;
          font-weight: 700;
        }

        .teacher-course-review-item-head {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: flex-start;
          margin-bottom: 0.8rem;
        }

        .teacher-course-score-select {
          width: 88px;
          flex: 0 0 auto;
        }

        .teacher-course-preview-sections,
        .teacher-course-preview-items,
        .teacher-course-preview-passage {
          display: grid;
          gap: 0.9rem;
        }

        .teacher-course-preview-section,
        .teacher-course-preview-item,
        .teacher-course-preview-block,
        .teacher-course-preview-passage-card {
          border: 1px solid rgba(44, 75, 131, 0.55);
          border-radius: 12px;
          background: rgba(19, 33, 59, 0.72);
          padding: 0.9rem;
        }

        .teacher-course-preview-section-head {
          display: flex;
          justify-content: space-between;
          gap: 0.75rem;
          align-items: baseline;
          margin-bottom: 0.35rem;
        }

        .teacher-course-preview-section h4,
        .teacher-course-preview-block p,
        .teacher-course-preview-passage-card p,
        .teacher-course-preview-item p {
          margin: 0;
        }

        .teacher-course-preview-item {
          display: grid;
          grid-template-columns: 36px minmax(0, 1fr);
          gap: 0.75rem;
          align-items: start;
        }

        .teacher-course-preview-item-index {
          display: inline-flex;
          width: 36px;
          height: 36px;
          border-radius: 999px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(90, 126, 198, 0.8);
          background: rgba(25, 45, 82, 0.9);
          font-weight: 700;
        }

        .teacher-course-preview-item-body,
        .teacher-course-preview-chip-row {
          display: flex;
          gap: 0.55rem;
          flex-wrap: wrap;
        }

        .teacher-course-preview-chip {
          display: inline-flex;
          align-items: center;
          padding: 0.38rem 0.7rem;
          border-radius: 999px;
          border: 1px solid rgba(90, 126, 198, 0.7);
          background: rgba(25, 45, 82, 0.88);
          font-size: 0.92rem;
        }

        .teacher-course-preview-highlight {
          color: #8dd8ff;
          font-weight: 700;
        }

        @media (max-width: 860px) {
          .teacher-course-row,
          .teacher-course-session-meta,
          .teacher-course-review-grid,
          .teacher-course-review-summary,
          .teacher-course-review-item-grid,
          .teacher-course-preview-item {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
