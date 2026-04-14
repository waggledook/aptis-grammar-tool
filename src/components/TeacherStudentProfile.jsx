// src/components/TeacherStudentProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Profile from "./profile/Profile";
import { getSeifHubAccessConfig } from "../siteConfig.js";

export default function TeacherStudentProfile({ user }) {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
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
        const snap = await getDoc(doc(db, "users", studentId));
        if (!alive) return;

        if (!snap.exists()) {
          setError("Student not found.");
        } else {
          setStudent({ id: snap.id, ...snap.data() });
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
    profileMode === "seifhub" ? "Student Profile · Seif Hub" : "Student Profile · Aptis Trainer";

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
