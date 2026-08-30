import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronRight, Clock3, GraduationCap, Lightbulb, Radio } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import AptisDemoBadge from "../access/AptisDemoBadge.jsx";
import Seo from "../common/Seo.jsx";
import { getAptisWritingPart } from "./writingMenuData.js";
import "./writingMenu.css";

function AccessPill({ activity, isDemoMode }) {
  if (activity.status === "coming-soon") {
    return <span className="writing-part-pill coming-soon">Coming soon</span>;
  }
  if (!isDemoMode || !activity.demoAccess) return null;
  return (
    <span className={`writing-part-pill ${activity.demoAccess}`}>
      {activity.demoAccess === "demo" ? "Demo available" : "Full access"}
    </span>
  );
}

function getActivityIcon(activity, type) {
  if (type === "practice") return Clock3;
  if (type === "teacher-live") return Radio;
  if (type === "teacher") return GraduationCap;
  if (activity.status === "coming-soon") return GraduationCap;
  return Lightbulb;
}

export default function WritingPartMenu({ user, aptisAccess, onSignIn }) {
  const navigate = useNavigate();
  const { partNumber = "" } = useParams();
  const [lockedActivity, setLockedActivity] = useState("");
  const part = getAptisWritingPart(partNumber);
  const isDemoMode = !!aptisAccess?.isDemoMode;
  const isTeacher = user?.role === "teacher" || user?.role === "admin";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [partNumber]);

  if (!part) return <Navigate to="/writing" replace />;

  const PartIcon = part.icon;

  function openActivity(activity) {
    if (activity.status === "coming-soon" || !activity.path) return;
    if (isDemoMode && activity.demoAccess === "locked") {
      setLockedActivity(activity.title);
      return;
    }
    navigate(activity.path);
  }

  function renderActivity(activity, type) {
    const isComingSoon = activity.status === "coming-soon";
    const ActivityIcon = getActivityIcon(activity, type);

    return (
      <button
        className={`menu-card writing-part-activity ${isComingSoon ? "is-coming-soon" : ""}`}
        disabled={isComingSoon}
        key={activity.id}
        type="button"
        onClick={() => openActivity(activity)}
      >
        <div className="writing-part-activity-label">
          <ActivityIcon size={27} aria-hidden="true" />
          <span>{activity.eyebrow}</span>
        </div>
        <h3>{activity.title}</h3>
        <p>{activity.copy}</p>
        <div className="writing-part-activity-footer">
          <AccessPill activity={activity} isDemoMode={isDemoMode} />
          {!isComingSoon ? (
            <strong>Open activity <ChevronRight size={17} aria-hidden="true" /></strong>
          ) : null}
        </div>
      </button>
    );
  }

  return (
    <main className="writing-part-hub game-wrapper hub-menu-wrapper menu-style-hub">
      <Seo
        title={`Aptis Writing ${part.label}: ${part.title} | Seif Aptis Trainer`}
        description={`${part.copy} Open Aptis Writing ${part.label} guided training and exam-style practice.`}
      />

      <button className="writing-part-back" type="button" onClick={() => navigate("/writing")}>
        <ArrowLeft size={18} aria-hidden="true" /> Back to Writing
      </button>

      <header className="writing-part-header">
        <div className="writing-part-title-line">
          <PartIcon size={30} aria-hidden="true" />
          <span>{part.label}</span>
        </div>
        <h1>{part.title}</h1>
        <p>{part.copy}</p>
        <div className="writing-part-header-actions">
          <button className="writing-practice-link" type="button" onClick={() => openActivity(part.practice)}>
            <Clock3 size={16} aria-hidden="true" />
            Start exam practice
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </header>

      <AptisDemoBadge user={user} aptisAccess={aptisAccess} onSignIn={onSignIn} />

      {lockedActivity ? (
        <div className="writing-part-access-prompt" role="status">
          <div>
            <strong>{lockedActivity} is included with full access.</strong>
            <p>Sign in with your academy account to continue.</p>
          </div>
          <button type="button" onClick={onSignIn}>Sign in</button>
        </div>
      ) : null}

      <section className="writing-part-section">
        <div className="writing-part-section-heading">
          <h2>Learn &amp; train</h2>
          <p>Understand the task and build the writing skills you need before attempting complete practice.</p>
        </div>
        <div className={`writing-part-activity-grid ${part.training.length > 1 ? "has-multiple" : ""}`}>
          {part.training.map((activity) => renderActivity(activity, "training"))}
        </div>
      </section>

      <section className="writing-part-section">
        <div className="writing-part-section-heading">
          <h2>Exam practice</h2>
          <p>Apply the method to complete tasks and receive focused feedback on your writing.</p>
        </div>
        <div className="writing-part-activity-grid">
          {renderActivity(part.practice, "practice")}
        </div>
      </section>

      {isTeacher && ["2", "3", "4"].includes(part.number) ? (
        <section className="writing-part-section writing-teacher-resource-section">
          <div className="writing-part-section-heading">
            <h2>Teacher resources</h2>
            <p>Open four additional classroom topics or create a live, teacher-paced writing room.</p>
          </div>
          <div className="writing-part-activity-grid has-multiple">
            {renderActivity({
              id: `part${part.number}-teacher-topics`,
              eyebrow: "Teacher task library",
              title: `Extra ${part.label} writing topics`,
              copy: "Language Exchange Club, Gardening Club, Local History Course and Drama Course, with assignment and direct-link sharing.",
              path: `/teacher/writing?part=${part.number}`,
            }, "teacher")}
            {renderActivity({
              id: `part${part.number}-teacher-live`,
              eyebrow: "Live classroom",
              title: `Run ${part.label} live`,
              copy: "Choose one of the four extra topics, invite students with a PIN and review their submitted writing together.",
              path: `/teacher/writing?part=${part.number}&mode=live`,
            }, "teacher-live")}
            {part.number === "4" ? renderActivity({
              id: "part4-register-surgery",
              eyebrow: "Classroom skills activity",
              title: "Part 4 Register Surgery",
              copy: "Spot unsuitable register inside two complete emails, rewrite the problem phrases and compare clear informal and formal choices.",
              path: "/writing/part4-register-surgery",
            }, "teacher") : null}
            {part.number === "4" ? renderActivity({
              id: "part4-error-detective",
              eyebrow: "Classroom skills activity",
              title: "Part 4 Error Detective",
              copy: "Spot recurring errors drawn from real student submissions, then reveal the correction and a concise explanation.",
              path: "/writing/part4-error-detective",
            }, "teacher") : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}
