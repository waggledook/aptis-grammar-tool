import React, { useEffect, useMemo, useState } from "react";
import {
  createAssignedActivity,
  fetchHubGrammarSubmissions,
  fetchWritingP1Sessions,
  fetchWritingP2Submissions,
  fetchWritingP3Submissions,
  fetchWritingP4Submissions,
  listAssignedActivitiesForTeacher,
  listGrammarSetAttemptsForStudent,
  listMyGrammarSets,
  listTeacherStudentsWithRosterMeta,
} from "../../firebase";
import { HUB_GRAMMAR_ACTIVITIES } from "../../data/hubGrammarActivities.js";
import { getSitePath } from "../../siteConfig.js";
import { toast } from "../../utils/toast";

const WRITING_OPTIONS = [
  { id: "writing-part-1", label: "Aptis Writing Part 1", routePath: getSitePath("/writing/part1") },
  { id: "writing-part-2", label: "Aptis Writing Part 2", routePath: getSitePath("/writing/part2") },
  { id: "writing-part-3", label: "Aptis Writing Part 3", routePath: getSitePath("/writing/part3") },
  { id: "writing-part-4", label: "Aptis Writing Part 4", routePath: getSitePath("/writing/part4") },
];

function formatDateTime(value) {
  if (!value) return "—";
  const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function timestampToMs(value) {
  if (!value) return 0;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (typeof value?.toDate === "function") return value.toDate().getTime();
  if (value?.seconds) return value.seconds * 1000;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function getStudentLabel(student) {
  return student?.displayName || student?.name || student?.username || student?.email || student?.id || "Student";
}

function buildTargetLabel(activity) {
  const mode = activity?.targetMode || "selected";
  if (mode === "all") {
    const count = Array.isArray(activity?.targetStudentIds) ? activity.targetStudentIds.length : 0;
    return `All students (${count})`;
  }
  if (mode === "class") {
    const count = Array.isArray(activity?.targetStudentIds) ? activity.targetStudentIds.length : 0;
    return `${activity.className || "Class"} (${count})`;
  }
  return `${Array.isArray(activity?.targetStudentIds) ? activity.targetStudentIds.length : 0} selected student(s)`;
}

function getAssignmentTypeLabel(type) {
  switch (type) {
    case "mini-test":
      return "Mini test";
    case "grammar-set":
      return "Aptis grammar set";
    case "use-of-english":
      return "Use of English set";
    case "writing":
      return "Writing task";
    default:
      return "Assignment";
  }
}

function getWritingBucket(type) {
  if (type === "writing-part-1") return "p1";
  if (type === "writing-part-2") return "p2";
  if (type === "writing-part-3") return "p3";
  if (type === "writing-part-4") return "p4";
  return "";
}

function buildLatestTimeMap(items, keyName) {
  return (items || []).reduce((acc, item) => {
    const key = item?.[keyName];
    if (!key) return acc;
    const nextTime = timestampToMs(item.createdAt || item.updatedAt || item.submittedAt || item.startedAt);
    if (!acc[key] || nextTime > acc[key]) acc[key] = nextTime;
    return acc;
  }, {});
}

function resolveAssignmentCompletion(assignment, sources) {
  const assignedAt = timestampToMs(assignment?.createdAt);
  if (assignment?.activityType === "mini-test") {
    const completedAt = sources.miniTests?.[assignment.activityId] || 0;
    return { completed: completedAt >= assignedAt, completedAt };
  }

  if (assignment?.activityType === "grammar-set" || assignment?.activityType === "use-of-english") {
    const completedAt = sources.grammarSets?.[assignment.activityId] || 0;
    return { completed: completedAt >= assignedAt, completedAt };
  }

  if (assignment?.activityType === "writing") {
    const bucket = getWritingBucket(assignment.activityId);
    const completedAt = sources.writing?.[bucket] || 0;
    return { completed: completedAt >= assignedAt, completedAt };
  }

  return { completed: false, completedAt: 0 };
}

function getActivityRoute({ activityType, activityId, routePath }) {
  if (routePath) return routePath;
  if (activityType === "mini-test") return getSitePath(`/grammar/activity/${activityId}`);
  if (activityType === "grammar-set") return `/grammar-sets/${activityId}`;
  if (activityType === "use-of-english") return `/use-of-english/custom/${activityId}`;
  return getSitePath("/");
}

export default function TeacherAssignedActivities({ user }) {
  const [students, setStudents] = useState([]);
  const [grammarSets, setGrammarSets] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activityType, setActivityType] = useState("mini-test");
  const [activityId, setActivityId] = useState("");
  const [targetMode, setTargetMode] = useState("all");
  const [className, setClassName] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      try {
        const [studentRows, setRows, assignedRows] = await Promise.all([
          listTeacherStudentsWithRosterMeta(user?.uid),
          listMyGrammarSets(),
          listAssignedActivitiesForTeacher(user?.uid),
        ]);

        if (!alive) return;
        setStudents(studentRows || []);
        setGrammarSets(setRows || []);

        const completionByStudentId = Object.fromEntries(
          await Promise.all(
            (studentRows || []).map(async (student) => {
              const [miniTests, grammarAttempts, p1, p2, p3, p4] = await Promise.all([
                fetchHubGrammarSubmissions(200, student.id),
                listGrammarSetAttemptsForStudent(student.id),
                fetchWritingP1Sessions(100, student.id),
                fetchWritingP2Submissions(100, student.id),
                fetchWritingP3Submissions(100, student.id),
                fetchWritingP4Submissions(100, student.id),
              ]);

              return [
                student.id,
                {
                  miniTests: buildLatestTimeMap(miniTests || [], "activityId"),
                  grammarSets: (grammarAttempts || []).reduce((acc, attempt) => {
                    if (!attempt?.setId) return acc;
                    if (!attempt.completed && !attempt.submittedAt) return acc;
                    const nextTime = timestampToMs(attempt.submittedAt || attempt.updatedAt || attempt.startedAt);
                    if (!acc[attempt.setId] || nextTime > acc[attempt.setId]) acc[attempt.setId] = nextTime;
                    return acc;
                  }, {}),
                  writing: {
                    p1: Math.max(0, ...(p1 || []).map((entry) => timestampToMs(entry.createdAt))),
                    p2: Math.max(0, ...(p2 || []).map((entry) => timestampToMs(entry.createdAt))),
                    p3: Math.max(0, ...(p3 || []).map((entry) => timestampToMs(entry.createdAt))),
                    p4: Math.max(0, ...(p4 || []).map((entry) => timestampToMs(entry.createdAt))),
                  },
                },
              ];
            })
          )
        );

        const studentMap = Object.fromEntries((studentRows || []).map((student) => [student.id, student]));
        setAssignments(
          (assignedRows || []).map((assignment) => {
            const progressRows = (assignment.targetStudentIds || []).map((studentId) => {
              const student = studentMap[studentId];
              const completion = resolveAssignmentCompletion(
                assignment,
                completionByStudentId[studentId] || { miniTests: {}, grammarSets: {}, writing: {} }
              );

              return {
                studentId,
                label: getStudentLabel(student),
                className: student?.className || "",
                ...completion,
              };
            });

            return {
              ...assignment,
              progressRows,
              completedCount: progressRows.filter((row) => row.completed).length,
              pendingCount: progressRows.filter((row) => !row.completed).length,
            };
          })
        );
      } catch (error) {
        console.error("[TeacherAssignedActivities] load failed", error);
        if (alive) {
          setStudents([]);
          setGrammarSets([]);
          setAssignments([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [user]);

  const classOptions = useMemo(
    () =>
      [...new Set(students.map((student) => String(student.className || "").trim()).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [students]
  );

  const miniTestOptions = useMemo(
    () =>
      HUB_GRAMMAR_ACTIVITIES.map((activity) => ({
        id: activity.id,
        label: activity.title,
        description: activity.shortDescription || "",
        routePath: getSitePath(`/grammar/activity/${activity.id}`),
      })),
    []
  );

  const publishedGrammarSetOptions = useMemo(
    () =>
      grammarSets
        .filter((set) => set.visibility === "published" && set.setType !== "use_of_english_custom")
        .map((set) => ({
          id: set.id,
          label: set.title || "Untitled grammar set",
          description: set.description || "",
          routePath: `/grammar-sets/${set.id}`,
        })),
    [grammarSets]
  );

  const useOfEnglishOptions = useMemo(
    () =>
      grammarSets
        .filter((set) => set.visibility === "published" && set.setType === "use_of_english_custom")
        .map((set) => ({
          id: set.id,
          label: set.title || "Untitled Use of English set",
          description: set.description || "",
          routePath: `/use-of-english/custom/${set.id}`,
        })),
    [grammarSets]
  );

  const currentOptions = useMemo(() => {
    if (activityType === "grammar-set") return publishedGrammarSetOptions;
    if (activityType === "use-of-english") return useOfEnglishOptions;
    if (activityType === "writing") return WRITING_OPTIONS;
    return miniTestOptions;
  }, [activityType, miniTestOptions, publishedGrammarSetOptions, useOfEnglishOptions]);

  const assignmentsWithProgress = useMemo(() => assignments || [], [assignments]);

  useEffect(() => {
    if (!currentOptions.length) {
      setActivityId("");
      return;
    }

    const exists = currentOptions.some((option) => option.id === activityId);
    if (!exists) setActivityId(currentOptions[0].id);
  }, [activityId, currentOptions]);

  useEffect(() => {
    if (targetMode !== "class") {
      setClassName("");
    }
    if (targetMode !== "selected") {
      setSelectedStudentIds([]);
    }
  }, [targetMode]);

  function toggleStudent(studentId) {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  }

  async function handleCreateAssignment() {
    const chosenOption = currentOptions.find((option) => option.id === activityId);
    if (!chosenOption) {
      toast("Choose an activity to assign.");
      return;
    }

    let targetStudentIds = [];
    if (targetMode === "all") {
      targetStudentIds = students.map((student) => student.id);
    } else if (targetMode === "class") {
      targetStudentIds = students
        .filter((student) => String(student.className || "").trim() === className)
        .map((student) => student.id);
    } else {
      targetStudentIds = selectedStudentIds;
    }

    targetStudentIds = [...new Set(targetStudentIds)].filter(Boolean);

    if (!targetStudentIds.length) {
      toast("Choose at least one student for this assignment.");
      return;
    }

    setSaving(true);
    try {
      await createAssignedActivity({
        teacherUid: user.uid,
        teacherName: user.displayName || user.name || user.email || "Teacher",
        teacherEmail: user.email || null,
        activityType,
        activityId: chosenOption.id,
        activityLabel: chosenOption.label,
        routePath: getActivityRoute({
          activityType,
          activityId: chosenOption.id,
          routePath: chosenOption.routePath,
        }),
        targetMode,
        className: targetMode === "class" ? className : "",
        targetStudentIds,
        notes: String(notes || "").trim(),
      });

      const refreshed = await listAssignedActivitiesForTeacher(user.uid);
      setAssignments(refreshed || []);
      setNotes("");
      if (targetMode === "selected") setSelectedStudentIds([]);
      toast("Assignment created.");
    } catch (error) {
      console.error("[TeacherAssignedActivities] create failed", error);
      toast("Could not create that assignment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="teacher-assignments">
      <section className="teacher-assign-panel">
        <div className="teacher-assign-head">
          <div>
            <h3>Create an assigned activity</h3>
            <p>Send mini tests, grammar sets, Use of English sets, or writing tasks to your class.</p>
          </div>
        </div>

        {loading ? (
          <p className="muted">Loading students and activities…</p>
        ) : (
          <>
            <div className="teacher-assign-grid">
              <label className="field">
                <span>Activity type</span>
                <select value={activityType} onChange={(event) => setActivityType(event.target.value)}>
                  <option value="mini-test">Mini test</option>
                  <option value="grammar-set">Aptis grammar set</option>
                  <option value="use-of-english">Use of English set</option>
                  <option value="writing">Writing task</option>
                </select>
              </label>

              <label className="field">
                <span>Assign to</span>
                <select value={targetMode} onChange={(event) => setTargetMode(event.target.value)}>
                  <option value="all">All my students</option>
                  <option value="class">One class label</option>
                  <option value="selected">Selected students</option>
                </select>
              </label>
            </div>

            <label className="field">
              <span>Activity</span>
              <select value={activityId} onChange={(event) => setActivityId(event.target.value)}>
                {currentOptions.length ? (
                  currentOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))
                ) : (
                  <option value="">No available activities</option>
                )}
              </select>
            </label>

            {targetMode === "class" ? (
              <label className="field">
                <span>Class label</span>
                <select value={className} onChange={(event) => setClassName(event.target.value)}>
                  <option value="">Choose a class</option>
                  {classOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {targetMode === "selected" ? (
              <div className="teacher-assign-students">
                <span className="field-label">Students</span>
                {students.length ? (
                  <div className="teacher-assign-student-list">
                    {students.map((student) => {
                      const label =
                        student.displayName || student.name || student.username || student.email || student.id;
                      return (
                        <label key={student.id} className="teacher-assign-student-item">
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.includes(student.id)}
                            onChange={() => toggleStudent(student.id)}
                          />
                          <span>{label}</span>
                          {student.className ? <em>{student.className}</em> : null}
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="muted">No students linked to you yet.</p>
                )}
              </div>
            ) : null}

            <label className="field">
              <span>Teacher note</span>
              <textarea
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional note shown on the student side"
              />
            </label>

            <div className="teacher-assign-actions">
              <button
                type="button"
                className="review-btn"
                onClick={handleCreateAssignment}
                disabled={saving || !currentOptions.length}
              >
                {saving ? "Creating..." : "Assign activity"}
              </button>
            </div>
          </>
        )}
      </section>

      <section className="teacher-assign-panel">
        <div className="teacher-assign-head">
          <div>
            <h3>Assigned activities</h3>
            <p>Recently created classroom assignments.</p>
          </div>
          <span className="teacher-assign-count">{assignments.length}</span>
        </div>

        {loading ? (
          <p className="muted">Loading assignments…</p>
        ) : !assignments.length ? (
          <p className="muted">No assigned activities yet.</p>
        ) : (
          <div className="teacher-assign-list">
            {assignmentsWithProgress.map((assignment) => (
              <article key={assignment.id} className="teacher-assign-card">
                <div className="teacher-assign-card-head">
                  <div>
                    <h4>{assignment.activityLabel || "Assigned activity"}</h4>
                    <p>{getAssignmentTypeLabel(assignment.activityType)}</p>
                  </div>
                  <span className="teacher-assign-chip">{buildTargetLabel(assignment)}</span>
                </div>

                <div className="teacher-assign-meta">
                  <div>
                    <span>Created</span>
                    <p>{formatDateTime(assignment.createdAt)}</p>
                  </div>
                  <div>
                    <span>Route</span>
                    <p>{assignment.routePath || "—"}</p>
                  </div>
                </div>

                <div className="teacher-assign-progress">
                  <div className="teacher-assign-progress-head">
                    <span>Progress</span>
                    <strong>
                      {assignment.completedCount || 0}/{Array.isArray(assignment.targetStudentIds) ? assignment.targetStudentIds.length : 0}
                    </strong>
                  </div>
                  <div className="teacher-assign-progress-bar">
                    <span
                      style={{
                        width: `${
                          Array.isArray(assignment.targetStudentIds) && assignment.targetStudentIds.length
                            ? ((assignment.completedCount || 0) / assignment.targetStudentIds.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="teacher-assign-roster-grid">
                  <div className="teacher-assign-roster-block">
                    <span>Done</span>
                    <div className="teacher-assign-roster-list">
                      {(assignment.progressRows || []).filter((row) => row.completed).length ? (
                        (assignment.progressRows || [])
                          .filter((row) => row.completed)
                          .map((row) => (
                            <span key={`${assignment.id}:${row.studentId}:done`} className="teacher-assign-roster-chip is-done">
                              {row.label}
                            </span>
                          ))
                      ) : (
                        <p className="muted">Nobody yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="teacher-assign-roster-block">
                    <span>Still to do</span>
                    <div className="teacher-assign-roster-list">
                      {(assignment.progressRows || []).filter((row) => !row.completed).length ? (
                        (assignment.progressRows || [])
                          .filter((row) => !row.completed)
                          .map((row) => (
                            <span key={`${assignment.id}:${row.studentId}:todo`} className="teacher-assign-roster-chip is-pending">
                              {row.label}
                            </span>
                          ))
                      ) : (
                        <p className="muted">All done.</p>
                      )}
                    </div>
                  </div>
                </div>

                {assignment.notes ? (
                  <div className="teacher-assign-note">
                    <span>Note</span>
                    <p>{assignment.notes}</p>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>

      <style>{`
        .teacher-assignments {
          display: grid;
          gap: 1rem;
        }

        .teacher-assign-panel {
          display: grid;
          gap: 0.9rem;
          border-radius: 16px;
          border: 1px solid #2c4b83;
          background: rgba(8, 15, 33, 0.38);
          padding: 1rem;
        }

        .teacher-assign-head,
        .teacher-assign-card-head {
          display: flex;
          justify-content: space-between;
          gap: 0.8rem;
          align-items: flex-start;
        }

        .teacher-assign-head h3,
        .teacher-assign-card-head h4 {
          margin: 0;
          color: #eef4ff;
        }

        .teacher-assign-head p,
        .teacher-assign-card-head p,
        .teacher-assign-note p,
        .teacher-assign-meta p {
          margin: 0.22rem 0 0;
          color: #a9b7d1;
        }

        .teacher-assign-count,
        .teacher-assign-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 2.4rem;
          padding: 0.3rem 0.66rem;
          border-radius: 999px;
          border: 1px solid rgba(120, 182, 255, 0.28);
          background: rgba(120, 182, 255, 0.12);
          color: #9fd0ff;
          font-weight: 700;
        }

        .teacher-assign-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.85rem;
        }

        .field {
          display: grid;
          gap: 0.45rem;
        }

        .field span {
          display: block;
          color: rgba(230, 240, 255, 0.72);
          font-size: 0.86rem;
          margin-bottom: 0.1rem;
        }

        .field select,
        .field textarea {
          width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(103, 132, 197, 0.36);
          background: rgba(11, 18, 37, 0.95);
          color: #eef4ff;
          padding: 0.82rem 0.95rem;
          font: inherit;
          box-sizing: border-box;
          appearance: none;
        }

        .field select {
          padding-right: 2.7rem;
          background-image:
            linear-gradient(45deg, transparent 50%, #9fd0ff 50%),
            linear-gradient(135deg, #9fd0ff 50%, transparent 50%);
          background-position:
            calc(100% - 20px) calc(50% - 3px),
            calc(100% - 14px) calc(50% - 3px);
          background-size: 6px 6px, 6px 6px;
          background-repeat: no-repeat;
        }

        .field textarea {
          min-height: 110px;
          resize: vertical;
          line-height: 1.45;
        }

        .field select:focus,
        .field textarea:focus {
          outline: none;
          border-color: rgba(133, 183, 255, 0.72);
          box-shadow: 0 0 0 3px rgba(84, 136, 255, 0.18);
        }

        .teacher-assign-students {
          display: grid;
          gap: 0.5rem;
        }

        .teacher-assign-student-list,
        .teacher-assign-list {
          display: grid;
          gap: 0.7rem;
        }

        .teacher-assign-student-item,
        .teacher-assign-card {
          display: grid;
          gap: 0.45rem;
          border-radius: 14px;
          border: 1px solid rgba(63, 94, 155, 0.46);
          background: rgba(8, 16, 38, 0.46);
          padding: 0.85rem;
        }

        .teacher-assign-student-item {
          grid-template-columns: auto 1fr auto;
          align-items: center;
          color: #e6f0ff;
        }

        .teacher-assign-student-item em {
          color: #9fb3d5;
          font-style: normal;
          font-size: 0.88rem;
        }

        .teacher-assign-meta {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.8rem;
        }

        .teacher-assign-progress,
        .teacher-assign-roster-block {
          display: grid;
          gap: 0.45rem;
        }

        .teacher-assign-progress-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.8rem;
        }

        .teacher-assign-progress-head strong {
          color: #eef4ff;
        }

        .teacher-assign-progress-bar {
          height: 10px;
          border-radius: 999px;
          background: rgba(63, 94, 155, 0.24);
          overflow: hidden;
        }

        .teacher-assign-progress-bar span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #7fe9c3, #88b8ff);
        }

        .teacher-assign-roster-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.8rem;
        }

        .teacher-assign-roster-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
        }

        .teacher-assign-roster-chip {
          display: inline-flex;
          align-items: center;
          padding: 0.32rem 0.62rem;
          border-radius: 999px;
          border: 1px solid rgba(103, 132, 197, 0.3);
          background: rgba(11, 18, 37, 0.86);
          color: #eef4ff;
          font-size: 0.88rem;
        }

        .teacher-assign-roster-chip.is-done {
          border-color: rgba(85, 204, 149, 0.38);
          background: rgba(43, 143, 98, 0.16);
          color: #bff5d8;
        }

        .teacher-assign-roster-chip.is-pending {
          border-color: rgba(241, 176, 63, 0.32);
          background: rgba(241, 176, 63, 0.12);
          color: #ffe0a6;
        }

        .teacher-assign-meta span,
        .teacher-assign-note span,
        .field-label {
          color: #8ea5c8;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .teacher-assign-actions {
          display: flex;
          justify-content: flex-start;
        }

        .teacher-assign-actions .review-btn {
          min-width: 220px;
        }

        @media (max-width: 760px) {
          .teacher-assign-grid,
          .teacher-assign-meta,
          .teacher-assign-roster-grid {
            grid-template-columns: 1fr;
          }

          .teacher-assign-head,
          .teacher-assign-card-head {
            flex-direction: column;
            align-items: flex-start;
          }

          .teacher-assign-student-item {
            grid-template-columns: auto 1fr;
          }

          .teacher-assign-student-item em {
            grid-column: 2;
          }
        }
      `}</style>
    </div>
  );
}
