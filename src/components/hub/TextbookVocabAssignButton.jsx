import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { createAssignedActivity, listTeacherStudentsWithRosterMeta } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import { toast } from "../../utils/toast.js";
import "./textbookVocabTeacherTools.css";

function studentLabel(student) {
  return student?.displayName || student?.name || student?.username || student?.email || student?.id || "Student";
}

export default function TextbookVocabAssignButton({ user, theme, activity = null, className = "" }) {
  const canAssign = (user?.role === "teacher" || user?.role === "admin") && theme?.studentVisible !== false;
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState(activity ? "activity" : "bank");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [targetMode, setTargetMode] = useState("all");
  const [selectedClassName, setSelectedClassName] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open || !canAssign) return undefined;
    let alive = true;
    setLoading(true);
    listTeacherStudentsWithRosterMeta(user?.uid)
      .then((rows) => {
        if (alive) setStudents(rows || []);
      })
      .catch((error) => {
        console.error("[TextbookVocabAssignButton] student load failed", error);
        if (alive) toast("Couldn’t load your student list.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [canAssign, open, user?.uid]);

  const classOptions = useMemo(() => (
    [...new Set(students.map((student) => String(student.className || "").trim()).filter(Boolean))]
      .sort((left, right) => left.localeCompare(right))
  ), [students]);

  if (!canAssign) return null;

  function resetForm() {
    setOpen(false);
    setScope(activity ? "activity" : "bank");
    setTargetMode("all");
    setSelectedClassName("");
    setSelectedStudentIds([]);
    setNotes("");
  }

  function close() {
    if (saving) return;
    resetForm();
  }

  function toggleStudent(studentId) {
    setSelectedStudentIds((previous) => (
      previous.includes(studentId) ? previous.filter((id) => id !== studentId) : [...previous, studentId]
    ));
  }

  async function assign() {
    const targetStudentIds = [...new Set(
      targetMode === "all"
        ? students.map((student) => student.id)
        : targetMode === "class"
          ? students.filter((student) => String(student.className || "").trim() === selectedClassName).map((student) => student.id)
          : selectedStudentIds
    )].filter(Boolean);

    if (!targetStudentIds.length) {
      toast("Choose at least one student for this assignment.");
      return;
    }

    const assigningActivity = scope === "activity" && activity;
    const firstActivityId = theme.activities?.[0]?.id || "flashcards";
    const routeActivityId = assigningActivity ? activity.id : firstActivityId;
    const activityLabel = assigningActivity
      ? `Textbook vocabulary — ${theme.title} — ${activity.title}`
      : `Textbook vocabulary — ${theme.title} (whole bank)`;

    setSaving(true);
    try {
      await createAssignedActivity({
        teacherUid: user.uid,
        teacherName: user.displayName || user.name || user.email || "Teacher",
        teacherEmail: user.email || null,
        activityType: "textbook-vocabulary",
        activityId: assigningActivity ? `${theme.id}:${activity.id}` : theme.id,
        activityLabel,
        routePath: getSitePath(`/vocabulary/textbook/${theme.id}/${routeActivityId}`),
        themeId: theme.id,
        themeTitle: theme.title,
        textbookActivityId: assigningActivity ? activity.id : "",
        textbookActivityTitle: assigningActivity ? activity.title : "",
        assignmentScope: assigningActivity ? "activity" : "bank",
        targetMode,
        className: targetMode === "class" ? selectedClassName : "",
        targetStudentIds,
        notes: String(notes || "").trim(),
      });
      toast(assigningActivity ? "Vocabulary activity assigned." : "Vocabulary bank assigned.");
      resetForm();
    } catch (error) {
      console.error("[TextbookVocabAssignButton] assignment failed", error);
      toast("Could not create that vocabulary assignment.");
    } finally {
      setSaving(false);
    }
  }

  const preview = scope === "activity" && activity
    ? `${theme.title} · ${activity.title}`
    : `${theme.title} · whole bank (${theme.activities?.length || 0} activities)`;

  return (
    <>
      <button type="button" className={`review-btn textbook-vocab-assign-trigger ${className}`.trim()} onClick={() => setOpen(true)}>
        Assign
      </button>
      {open && typeof document !== "undefined" ? createPortal((
        <div className="textbook-vocab-assign-overlay" onClick={close}>
          <section className="textbook-vocab-assign-modal" role="dialog" aria-modal="true" aria-labelledby="textbook-vocab-assign-title" onClick={(event) => event.stopPropagation()}>
            <header>
              <div><span>Textbook vocabulary</span><h2 id="textbook-vocab-assign-title">Assign practice</h2><p>{preview}</p></div>
              <button type="button" className="ghost-btn" onClick={close}>Close</button>
            </header>
            {loading ? <p>Loading students…</p> : (
              <>
                <div className="textbook-vocab-assign-grid">
                  <label><span>Assign</span><select value={scope} onChange={(event) => setScope(event.target.value)} disabled={!activity}><option value="bank">Whole bank</option>{activity ? <option value="activity">Current activity</option> : null}</select></label>
                  <label><span>Assign to</span><select value={targetMode} onChange={(event) => setTargetMode(event.target.value)}><option value="all">All my students</option><option value="class">One group / class</option><option value="selected">Selected students</option></select></label>
                  {targetMode === "class" ? <label><span>Group / class</span><select value={selectedClassName} onChange={(event) => setSelectedClassName(event.target.value)}><option value="">Choose a group</option>{classOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label> : null}
                </div>
                {targetMode === "selected" ? (
                  <div className="textbook-vocab-assign-students">
                    <span>Students</span>
                    {students.length ? students.map((student) => (
                      <label key={student.id}><input type="checkbox" checked={selectedStudentIds.includes(student.id)} onChange={() => toggleStudent(student.id)} /><strong>{studentLabel(student)}</strong>{student.className ? <em>{student.className}</em> : null}</label>
                    )) : <p>No students are linked to you yet.</p>}
                  </div>
                ) : null}
                <label className="textbook-vocab-assign-note"><span>Teacher note</span><textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional instructions for your students" /></label>
                <footer><button type="button" className="textbook-live-launch" onClick={assign} disabled={saving}>{saving ? "Assigning…" : scope === "activity" && activity ? "Assign activity" : "Assign whole bank"}</button></footer>
              </>
            )}
          </section>
        </div>
      ), document.body) : null}
    </>
  );
}
