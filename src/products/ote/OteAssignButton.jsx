import React, { useEffect, useMemo, useState } from "react";
import * as fb from "../../firebase";
import { toast } from "../../utils/toast";

function getStudentLabel(student) {
  return student?.displayName || student?.name || student?.username || student?.email || student?.id || "Student";
}

export default function OteAssignButton({
  user,
  item,
  label = "Assign",
  className = "ote-assign-btn",
}) {
  const isTeacher = user?.role === "teacher" || user?.role === "admin";
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [targetMode, setTargetMode] = useState("all");
  const [classLabel, setClassLabel] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadStudents() {
      if (!open || !isTeacher) return;
      setLoading(true);
      try {
        const rows = await fb.listTeacherStudentsWithRosterMeta(user?.uid);
        if (alive) setStudents(rows || []);
      } catch (error) {
        console.error("[OteAssignButton] student load failed", error);
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

  if (!isTeacher || !item) return null;

  function close() {
    if (saving) return;
    resetForm();
  }

  function resetForm() {
    setOpen(false);
    setTargetMode("all");
    setClassLabel("");
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
        .filter((student) => String(student.className || "").trim() === classLabel)
        .map((student) => student.id);
    } else {
      targetStudentIds = selectedStudentIds;
    }

    targetStudentIds = [...new Set(targetStudentIds)].filter(Boolean);
    if (!targetStudentIds.length) {
      toast("Choose at least one student for this OTE activity.");
      return;
    }

    setSaving(true);
    try {
      await fb.createAssignedActivity({
        teacherUid: user.uid,
        teacherName: user.displayName || user.name || user.email || "Teacher",
        teacherEmail: user.email || null,
        activityType: "ote-training",
        activityId: item.id,
        activityLabel: item.label,
        routePath: item.routePath,
        taskId: item.progressId || item.id,
        taskTitle: item.label,
        progressId: item.progressId || item.id,
        oteVariant: item.variant || "general",
        oteCategory: item.category || "",
        targetMode,
        className: targetMode === "class" ? classLabel : "",
        targetStudentIds,
        notes: String(notes || "").trim(),
      });
      toast("OTE activity assigned.");
      resetForm();
    } catch (error) {
      console.error("[OteAssignButton] assignment failed", error);
      toast("Could not assign that OTE activity.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button type="button" className={className} onClick={(event) => {
        event.stopPropagation();
        setOpen(true);
      }}>
        {label}
      </button>

      {open ? (
        <div className="ote-assign-overlay" onClick={close}>
          <div className="ote-assign-modal" onClick={(event) => event.stopPropagation()}>
            <div className="ote-assign-head">
              <div>
                <h3>Assign OTE activity</h3>
                <p>{item.label}</p>
              </div>
              <button type="button" className="ghost-btn" onClick={close}>
                Close
              </button>
            </div>

            {loading ? (
              <p className="muted">Loading students...</p>
            ) : (
              <>
                <div className="ote-assign-grid">
                  <label className="ote-assign-field">
                    <span>Assign to</span>
                    <select value={targetMode} onChange={(event) => setTargetMode(event.target.value)}>
                      <option value="all">All my students</option>
                      <option value="class">One class label</option>
                      <option value="selected">Selected students</option>
                    </select>
                  </label>

                  {targetMode === "class" ? (
                    <label className="ote-assign-field">
                      <span>Class label</span>
                      <select value={classLabel} onChange={(event) => setClassLabel(event.target.value)}>
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
                  <div className="ote-assign-students">
                    <span className="ote-assign-label">Students</span>
                    {students.length ? (
                      <div className="ote-assign-student-list">
                        {students.map((student) => (
                          <label key={student.id} className="ote-assign-student-item">
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

                <label className="ote-assign-field">
                  <span>Teacher note</span>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Optional note shown on the student side"
                  />
                </label>

                <div className="ote-assign-actions">
                  <button type="button" className="btn primary" onClick={handleAssign} disabled={saving}>
                    {saving ? "Assigning..." : "Assign activity"}
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
