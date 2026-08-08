import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronRight, Clock3, GraduationCap } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import AptisDemoBadge from "../access/AptisDemoBadge.jsx";
import Seo from "../common/Seo.jsx";
import { getAptisListeningPart } from "./listeningMenuData.js";
import "./listeningMenu.css";

function AccessPill({ activity, isDemoMode }) {
  if (activity.status === "coming-soon") {
    return <span className="listening-part-pill coming-soon">Coming soon</span>;
  }
  if (!isDemoMode || !activity.demoAccess) return null;
  return (
    <span className={`listening-part-pill ${activity.demoAccess}`}>
      {activity.demoAccess === "demo" ? "Demo available" : "Full access"}
    </span>
  );
}

export default function ListeningPartMenu({ user, aptisAccess, onSignIn }) {
  const navigate = useNavigate();
  const { partNumber = "" } = useParams();
  const [lockedActivity, setLockedActivity] = useState("");
  const part = getAptisListeningPart(partNumber);
  const isDemoMode = !!aptisAccess?.isDemoMode;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [partNumber]);

  if (!part) return <Navigate to="/listening" replace />;

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
    const ActivityIcon = type === "practice" ? Clock3 : GraduationCap;

    return (
      <button
        className={`menu-card listening-part-activity ${isComingSoon ? "is-coming-soon" : ""}`}
        disabled={isComingSoon}
        key={activity.id}
        type="button"
        onClick={() => openActivity(activity)}
      >
        <div className="listening-part-activity-label">
          <ActivityIcon size={27} aria-hidden="true" />
          <span>{activity.eyebrow}</span>
        </div>
        <h3>{activity.title}</h3>
        <p>{activity.copy}</p>
        <div className="listening-part-activity-footer">
          <AccessPill activity={activity} isDemoMode={isDemoMode} />
          {!isComingSoon ? (
            <strong>Open activity <ChevronRight size={17} aria-hidden="true" /></strong>
          ) : null}
        </div>
      </button>
    );
  }

  return (
    <main className="listening-part-hub game-wrapper hub-menu-wrapper menu-style-hub">
      <Seo
        title={`Aptis Listening ${part.label}: ${part.title} | Seif Aptis Trainer`}
        description={`${part.copy} Open Aptis Listening ${part.label} strategy training and exam-style practice.`}
      />

      <button className="listening-part-back" type="button" onClick={() => navigate("/listening")}>
        <ArrowLeft size={18} aria-hidden="true" /> Back to Listening
      </button>

      <header className="listening-part-header">
        <div className="listening-part-title-line">
          <PartIcon size={30} aria-hidden="true" />
          <span>{part.label}</span>
        </div>
        <h1>{part.title}</h1>
        <p>{part.copy}</p>
        <div className="listening-part-header-actions">
          <button className="listening-practice-link" type="button" onClick={() => openActivity(part.practice)}>
            <Clock3 size={16} aria-hidden="true" />
            Start exam practice
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </header>

      <AptisDemoBadge user={user} aptisAccess={aptisAccess} onSignIn={onSignIn} />

      {lockedActivity ? (
        <div className="listening-part-access-prompt" role="status">
          <div>
            <strong>{lockedActivity} is included with full access.</strong>
            <p>Sign in with your academy account to continue.</p>
          </div>
          <button type="button" onClick={onSignIn}>Sign in</button>
        </div>
      ) : null}

      <section className="listening-part-section">
        <div className="listening-part-section-heading">
          <h2>Learn &amp; train</h2>
          <p>Build a reliable listening method before attempting a complete exam-style task.</p>
        </div>
        <div className={`listening-part-activity-grid ${part.training.length > 1 ? "has-multiple" : ""}`}>
          {part.training.map((activity) => renderActivity(activity, "training"))}
        </div>
      </section>

      <section className="listening-part-section">
        <div className="listening-part-section-heading">
          <h2>Exam practice</h2>
          <p>Apply the strategy to complete tasks with two listens, feedback and explanations.</p>
        </div>
        <div className="listening-part-activity-grid">
          {renderActivity(part.practice, "practice")}
        </div>
      </section>
    </main>
  );
}
