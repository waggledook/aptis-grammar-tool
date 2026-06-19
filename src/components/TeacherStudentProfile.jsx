// src/components/TeacherStudentProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Profile from "./profile/Profile";
import { getSeifHubAccessConfig } from "../siteConfig.js";

function timestampToDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value.toMillis === "function") return new Date(value.toMillis());
  if (value.seconds) return new Date(value.seconds * 1000);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value) {
  const date = timestampToDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function labelForPerson(person = {}) {
  return (
    person.displayName ||
    person.name ||
    person.username ||
    person.email ||
    person.id ||
    ""
  );
}

export default function TeacherStudentProfile({ user }) {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [assignedTeacher, setAssignedTeacher] = useState(null);
  const [rosterMeta, setRosterMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileMode, setProfileMode] = useState("aptis");

  const isTeacherOrAdmin =
    user && (user.role === "teacher" || user.role === "admin");

  useEffect(() => {
    if (!studentId || !isTeacherOrAdmin) {
      setLoading(false);
      return;
    }

    let alive = true;
    (async () => {
      try {
        setError("");
        setStudent(null);
        setAssignedTeacher(null);
        setRosterMeta(null);
        const snap = await getDoc(doc(db, "users", studentId));
        if (!alive) return;

        if (!snap.exists()) {
          setError("Student not found.");
        } else {
          const studentData = { id: snap.id, ...snap.data() };
          setStudent(studentData);

          const teacherId = studentData.teacherId || "";
          if (teacherId) {
            const [teacherResult, rosterResult] = await Promise.all([
              getDoc(doc(db, "users", teacherId)).catch((teacherError) => {
                console.warn("[TeacherStudentProfile] teacher lookup failed", teacherError);
                return null;
              }),
              getDoc(doc(db, "users", teacherId, "studentRoster", studentId)).catch((rosterError) => {
                console.warn("[TeacherStudentProfile] roster lookup failed", rosterError);
                return null;
              }),
            ]);

            if (!alive) return;

            if (teacherResult?.exists()) {
              setAssignedTeacher({ id: teacherResult.id, ...teacherResult.data() });
            }
            if (rosterResult?.exists()) {
              setRosterMeta(rosterResult.data() || {});
            }
          } else {
            setAssignedTeacher(null);
            setRosterMeta(null);
          }
        }
      } catch (e) {
        console.error("[TeacherStudentProfile] load failed", e);
        // Common case if Firestore rules block access
        setError(
          "Could not load this student's profile. Check that this learner is assigned to you and that rules are updated."
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [studentId, isTeacherOrAdmin]);

  if (!user) {
    return <p>⛔ You must be signed in to view this page.</p>;
  }
  if (!isTeacherOrAdmin) {
    return <p>⛔ Only teachers and admins can view student profiles.</p>;
  }
  if (!studentId) {
    return <p>⚠ No student selected.</p>;
  }
  if (loading) {
    return <p className="muted">Loading student profile…</p>;
  }
  if (error) {
    return (
      <div style={{ padding: "1rem" }}>
        <button className="review-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <p className="error-text" style={{ marginTop: "0.75rem" }}>
          {error}
        </p>
      </div>
    );
  }

  const emailLabel =
    student?.email || student?.username || `${studentId} (no email)`;
  const hubAccess = getSeifHubAccessConfig(student);
  const hubStatusLabel = !hubAccess.active
    ? "Seif Hub access off"
    : hubAccess.indefinite
      ? "Seif Hub active indefinitely"
      : hubAccess.endDate
        ? `Seif Hub active until ${hubAccess.endDate}`
        : hubAccess.startDate
          ? `Seif Hub starts ${hubAccess.startDate}`
          : "Seif Hub active";
  const profileTitle =
    profileMode === "seifhub"
      ? "Student Profile · Seif Hub"
      : profileMode === "ote"
        ? "Student Profile · OTE"
        : "Student Profile · Aptis Trainer";
  const teacherLabel = assignedTeacher
    ? labelForPerson(assignedTeacher)
    : student?.teacherId
      ? "Assigned teacher unavailable"
      : "No teacher assigned";
  const classLabel =
    rosterMeta?.className ||
    rosterMeta?.classCode ||
    student?.className ||
    student?.classCode ||
    student?.classId ||
    "No class label";
  const joinedLabel = formatDate(student?.createdAt) || "Unknown";
  const studentName = labelForPerson(student) || "Student";
  const details = [
    { label: "Name", value: studentName },
    { label: "Teacher", value: teacherLabel },
    { label: "Class", value: classLabel },
    { label: "Role", value: student?.role || "student" },
    { label: "Joined", value: joinedLabel },
    { label: "SeifHub", value: hubStatusLabel },
  ];

  return (
    <div className="profile-page game-wrapper">
      <section
        className="panel"
        style={{
          marginBottom: "0.9rem",
          padding: "0.85rem 1rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.9rem",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#94a3b8" }}>
            Profile view
          </div>
          <div className="muted small" style={{ marginTop: "0.2rem" }}>
            {emailLabel} · {hubStatusLabel}
          </div>
        </div>

        <div
          style={{
            display: "inline-flex",
            gap: "0.4rem",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className={profileMode === "aptis" ? "review-btn" : "ghost-btn"}
            onClick={() => setProfileMode("aptis")}
          >
            Aptis Trainer
          </button>
          <button
            type="button"
            className={profileMode === "seifhub" ? "review-btn" : "ghost-btn"}
            onClick={() => setProfileMode("seifhub")}
          >
            Seif Hub
          </button>
          <button
            type="button"
            className={profileMode === "ote" ? "review-btn" : "ghost-btn"}
            onClick={() => setProfileMode("ote")}
          >
            OTE
          </button>
        </div>
      </section>

      <section
        className="panel"
        style={{
          marginBottom: "0.9rem",
          padding: "0.9rem 1rem",
        }}
      >
        <div style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#94a3b8", marginBottom: "0.65rem" }}>
          Student details
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "0.7rem",
          }}
        >
          {details.map((item) => (
            <div
              key={item.label}
              style={{
                border: "1px solid rgba(148, 163, 184, 0.25)",
                borderRadius: "0.6rem",
                padding: "0.65rem 0.75rem",
                background: "rgba(15, 23, 42, 0.32)",
                minWidth: 0,
              }}
            >
              <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", marginBottom: "0.2rem" }}>
                {item.label}
              </div>
              <div style={{ color: "#e2e8f0", fontWeight: 700, overflowWrap: "anywhere" }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Profile
        key={`${studentId}-${profileMode}`}
        user={student}
        onBack={() => navigate(-1)}
        // teachers shouldn't jump into *their own* mistakes/favourites pages
        onGoMistakes={null}
        onGoFavourites={null}
        targetUid={studentId}
        titleOverride={profileTitle}
        viewerLabelOverride={
          <>
            Viewing progress for <strong>{emailLabel}</strong>
          </>
        }
        siteMode={profileMode}
        allowAccountSecurity={false}
      />
    </div>
  );
}
