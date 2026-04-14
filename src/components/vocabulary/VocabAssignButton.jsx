import React, { useEffect, useMemo, useState } from "react";
import * as fb from "../../firebase";
import { toast } from "../../utils/toast";

function getStudentLabel(student) {
  return student?.displayName || student?.name || student?.username || student?.email || student?.id || "Student";
}

export default function VocabAssignButton({
  user,
  topicId,
  setId,
  topicTitle,
  setTitle,
}) {
  const isTeacher = user?.role === "teacher" || user?.role === "admin";
  const [open, setOpen] = useState(false);
  const [assignScope, setAssignScope] = useState(setId ? "set" : "topic");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [targetMode, setTargetMode] = useState("all");
  const [className, setClassName] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [notes, setNotes] = useState("");
  const assigningSet = assignScope === "set" && !!setId;
  const previewLabel = assigningSet
    ? `Vocabulary — ${topicTitle || topicId} — ${setTitle || setId}`
    : `Vocabulary — ${topicTitle || topicId} (whole topic)`;

  useEffect(() => {
    let alive = true;

    async function loadStudents() {
      if (!open || !isTeacher) return;
      setLoading(true);
      try {
        const rows = await fb.listTeacherStudentsWithRosterMeta(user?.uid);
        if (alive) setStudents(rows || []);
      } catch (error) {
        console.error("[VocabAssignButton] student load failed", error);
        if (alive) {
          setStudents([]);
          toast("Couldn’t load your student list.");
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadStudents();
    return () => {
      alive = false;
    };
  }, [open, isTeacher, user?.uid]);

  const classOptions = useMemo(
    () =>
      [...new Set(students.map((student) => String(student.className || "").trim()).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [students]
  );

  if (!isTeacher || !topicId) return null;

  function close() {
    if (saving) return;
    setOpen(false);
    setAssignScope(setId ? "set" : "topic");
    setTargetMode("all");
    setClassName("");
    setSelectedStudentIds([]);
    setNotes("");
  }

  function toggleStudent(studentId) {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  }

  async function handleAssign() {
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
      toast("Choose at least one student for this vocabulary set.");
      return;
    }

    setSaving(true);
    try {
      const resolvedActivityId = assigningSet ? `${topicId}:${setId}` : topicId;
      const resolvedActivityLabel = assigningSet
        ? `Vocabulary — ${topicTitle || topicId} — ${setTitle || setId}`
        : `Vocabulary — ${topicTitle || topicId} (whole topic)`;
      const resolvedRoutePath = assigningSet
        ? `/vocabulary/topics?topic=${encodeURIComponent(topicId)}&set=${encodeURIComponent(setId)}`
        : `/vocabulary/topics?topic=${encodeURIComponent(topicId)}`;

      await fb.createAssignedActivity({
        teacherUid: user.uid,
        teacherName: user.displayName || user.name || user.email || "Teacher",
        teacherEmail: user.email || null,
        activityType: "vocabulary-topic",
        activityId: resolvedActivityId,
        activityLabel: resolvedActivityLabel,
        routePath: resolvedRoutePath,
        topicId,
        setId: assigningSet ? setId : "",
        topicTitle,
        setTitle: assigningSet ? setTitle : "",
        targetMode,
        className: targetMode === "class" ? className : "",
        targetStudentIds,
        notes: String(notes || "").trim(),
      });
      toast(assigningSet ? "Vocabulary set assigned." : "Vocabulary topic assigned.");
      close();
    } catch (error) {
      console.error("[VocabAssignButton] assignment failed", error);
      toast(assigningSet ? "Could not assign that vocabulary set." : "Could not assign that vocabulary topic.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <style>{`
        .writing-assign-overlay {
          position: fixed;
          inset: 0;
          background: rgba(7, 13, 27, 0.72);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 1200;
        }

        .writing-assign-modal {
          width: min(720px, 100%);
          max-height: 90vh;
          overflow: auto;
          background: #12213b;
          color: #eaf1ff;
          border: 1px solid rgba(125, 179, 255, 0.24);
          border-radius: 18px;
          padding: 1rem;
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
        }

        .writing-assign-head {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .writing-assign-head h3,
        .writing-assign-head p {
          margin: 0;
        }

        .writing-assign-head p {
          color: #a9b7d1;
          margin-top: 0.2rem;
        }

        .writing-assign-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.9rem;
        }

        .writing-assign-field,
        .writing-assign-students {
          display: grid;
          gap: 0.45rem;
          margin-bottom: 0.9rem;
        }

        .writing-assign-field span,
        .writing-assign-label {
          font-size: 0.88rem;
          color: #a9b7d1;
        }

        .writing-assign-field select,
        .writing-assign-field textarea {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(125, 179, 255, 0.26);
          background: #0d1830;
          color: #eaf1ff;
          padding: 0.7rem 0.8rem;
          font: inherit;
        }

        .writing-assign-student-list {
          display: grid;
          gap: 0.55rem;
          max-height: 240px;
          overflow: auto;
          padding-right: 0.25rem;
        }

        .writing-assign-student-item {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(125, 179, 255, 0.14);
          border-radius: 12px;
          padding: 0.7rem 0.8rem;
        }

        .writing-assign-student-item em {
          margin-left: auto;
          color: #8fb6ff;
          font-style: normal;
          font-size: 0.84rem;
        }

        .writing-assign-actions {
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
      <button type="button" className="review-btn" onClick={() => setOpen(true)}>
        Assign
      </button>

      {open ? (
        <div className="writing-assign-overlay" onClick={close}>
          <div className="writing-assign-modal" onClick={(event) => event.stopPropagation()}>
            <div className="writing-assign-head">
              <div>
                <h3>Assign vocabulary set</h3>
                <p>{previewLabel}</p>
              </div>
              <button type="button" className="ghost-btn" onClick={close}>
                Close
              </button>
            </div>

            {loading ? (
              <p className="muted">Loading students…</p>
            ) : (
              <>
                <div className="writing-assign-grid">
                  <label className="writing-assign-field">
                    <span>Assign</span>
                    <select value={assignScope} onChange={(event) => setAssignScope(event.target.value)} disabled={!setId}>
                      <option value="topic">Whole topic</option>
                      {setId ? <option value="set">Current set</option> : null}
                    </select>
                  </label>

                  <label className="writing-assign-field">
                    <span>Assign to</span>
                    <select value={targetMode} onChange={(event) => setTargetMode(event.target.value)}>
                      <option value="all">All my students</option>
                      <option value="class">One class label</option>
                      <option value="selected">Selected students</option>
                    </select>
                  </label>

                  {targetMode === "class" ? (
                    <label className="writing-assign-field">
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
                </div>

                {targetMode === "selected" ? (
                  <div className="writing-assign-students">
                    <span className="writing-assign-label">Students</span>
                    {students.length ? (
                      <div className="writing-assign-student-list">
                        {students.map((student) => (
                          <label key={student.id} className="writing-assign-student-item">
                            <input
                              type="checkbox"
                              checked={selectedStudentIds.includes(student.id)}
                              onChange={() => toggleStudent(student.id)}
                            />
                            <span>{getStudentLabel(student)}</span>
                            {student.className ? <em>{student.className}</em> : null}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="muted">No students linked to you yet.</p>
                    )}
                  </div>
                ) : null}

                <label className="writing-assign-field">
                  <span>Teacher note</span>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Optional note shown on the student side"
                  />
                </label>

                <div className="writing-assign-actions">
                  <button type="button" className="btn primary" onClick={handleAssign} disabled={saving}>
                    {saving ? "Assigning..." : assignScope === "set" && setId ? "Assign set" : "Assign topic"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
