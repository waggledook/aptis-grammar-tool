import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronRight, Clock3, GraduationCap } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import AptisDemoBadge from "../components/access/AptisDemoBadge.jsx";
import Seo from "../components/common/Seo.jsx";
import { fetchReadingCompletions } from "../firebase.js";
import { getAptisReadingPart } from "./readingMenuData.js";

function AccessPill({ activity, isDemoMode }) {
  if (activity.status === "coming-soon") {
    return <span className="reading-part-pill coming-soon">Coming soon</span>;
  }
  if (!isDemoMode || !activity.demoAccess) return null;
  return (
    <span className={`reading-part-pill ${activity.demoAccess}`}>
      {activity.demoAccess === "demo" ? "Demo available" : "Full access"}
    </span>
  );
}

export default function ReadingPartMenu({ user, aptisAccess, onSignIn }) {
  const navigate = useNavigate();
  const { partNumber = "" } = useParams();
  const [lockedActivity, setLockedActivity] = useState("");
  const [completed, setCompleted] = useState(() => new Set());
  const part = getAptisReadingPart(partNumber);
  const isDemoMode = !!aptisAccess?.isDemoMode;
  const isTeacherOrAdmin = user?.role === "teacher" || user?.role === "admin";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [partNumber]);

  useEffect(() => {
    let alive = true;
    if (!user) {
      setCompleted(new Set());
      return undefined;
    }
    fetchReadingCompletions().then((done) => {
      if (alive) setCompleted(done);
    });
    return () => { alive = false; };
  }, [user, partNumber]);

  if (!part) return <Navigate to="/reading" replace />;

  const PartIcon = part.icon;
  const practiceCompletedCount = part.taskIds.filter((taskId) => completed.has(taskId)).length;
  const practiceComplete = part.taskIds.length > 0 && practiceCompletedCount === part.taskIds.length;

  function openActivity(activity) {
    if (activity.status === "coming-soon" || !activity.path) return;
    if (isDemoMode && activity.demoAccess === "locked") {
      setLockedActivity(activity.title);
      return;
    }
    navigate(activity.path);
  }

  function renderActivity(activity) {
    const isPractice = activity === part.practice;
    const isComingSoon = activity.status === "coming-soon";
    const isComplete = isPractice ? practiceComplete : Boolean(activity.progressId && completed.has(activity.progressId));
    const ActivityIcon = isPractice ? Clock3 : GraduationCap;

    return (
      <button
        className={`menu-card reading-part-activity ${isComingSoon ? "is-coming-soon" : ""} ${isComplete ? "is-complete" : ""}`}
        disabled={isComingSoon}
        key={activity.id}
        type="button"
        onClick={() => openActivity(activity)}
      >
        {isComplete ? <CheckCircle2 className="reading-complete-icon" size={23} aria-label="Completed" /> : null}
        <div className="reading-part-activity-label"><ActivityIcon size={27} aria-hidden="true" /><span>{activity.eyebrow}</span></div>
        <h3>{activity.title}</h3>
        <p>{activity.copy}</p>
        {isPractice && user ? (
          <strong className="reading-activity-progress">{practiceCompletedCount}/{part.taskIds.length} practice tasks complete</strong>
        ) : isComplete ? (
          <strong className="reading-activity-progress is-complete">Completed</strong>
        ) : null}
        <div className="reading-part-activity-footer">
          <AccessPill activity={activity} isDemoMode={isDemoMode} />
          {!isComingSoon ? <strong>Open activity <ChevronRight size={17} aria-hidden="true" /></strong> : null}
        </div>
      </button>
    );
  }

  return (
    <main className="reading-part-hub game-wrapper hub-menu-wrapper menu-style-hub">
      <Seo
        title={`Aptis Reading ${part.label}: ${part.title} | Seif Aptis Trainer`}
        description={`${part.copy} Open Aptis Reading ${part.label} strategy training and exam-style practice.`}
      />

      <button className="reading-part-back" type="button" onClick={() => navigate("/reading")}>
        <ArrowLeft size={18} aria-hidden="true" /> Back to Reading
      </button>

      <header className="reading-part-header">
        <div className="reading-part-title-line"><PartIcon size={30} aria-hidden="true" /><span>{part.label}</span></div>
        <h1>{part.title}</h1>
        <p>{part.copy}</p>
        <div className="reading-part-facts" aria-label={`${part.label} format and suggested timing`}>
          <span><strong>{part.format}</strong> task format</span>
          <span><strong>{part.timing}</strong> suggested pace</span>
        </div>
      </header>

      <AptisDemoBadge user={user} aptisAccess={aptisAccess} onSignIn={onSignIn} />

      {lockedActivity ? (
        <div className="reading-part-access-prompt" role="status">
          <div><strong>{lockedActivity} is included with full access.</strong><p>Sign in with your academy account to continue.</p></div>
          <button type="button" onClick={onSignIn}>Sign in</button>
        </div>
      ) : null}

      <section className="reading-part-section">
        <div className="reading-part-section-heading"><h2>Learn &amp; train</h2><p>Build the method before attempting a complete exam-style task.</p></div>
        <div className="reading-part-activity-grid">{part.training.map(renderActivity)}</div>
      </section>

      <section className="reading-part-section">
        <div className="reading-part-section-heading"><h2>Exam practice</h2><p>Apply the strategy to complete tasks with feedback and a suggested pace.</p></div>
        <div className="reading-part-activity-grid">{renderActivity(part.practice)}</div>
      </section>

      {part.number === "2" && isTeacherOrAdmin ? (
        <section className="reading-part-section">
          <div className="reading-part-section-heading"><h2>Teacher resources</h2><p>Open the additional Part 2 activities and classroom materials.</p></div>
          <div className="reading-part-activity-grid">
            <button
              className="menu-card reading-part-activity reading-teacher-activity"
              type="button"
              onClick={() => navigate("/reading/part2-teacher")}
            >
              <div className="reading-part-activity-label"><GraduationCap size={27} aria-hidden="true" /><span>Teacher activities</span></div>
              <h3>Additional Part 2 Activities</h3>
              <p>Access the extra sentence-order tasks prepared for teachers.</p>
              <div className="reading-part-activity-footer"><strong>Open teacher activities <ChevronRight size={17} aria-hidden="true" /></strong></div>
            </button>
          </div>
        </section>
      ) : null}

      <style>{`
        .reading-part-back { display:inline-flex; align-items:center; gap:.4rem; margin:0 0 1.2rem; padding:.55rem .75rem; border:2px solid #35508e; border-radius:10px; background:#1a2847; color:#eef4ff; font:inherit; font-weight:800; cursor:pointer; }
        .reading-part-header { margin-bottom:1.2rem; }
        .reading-part-title-line { display:flex; align-items:center; gap:.4rem; color:#eef4ff; font-size:1rem; }
        .reading-part-title-line svg { color:#eef4ff; }
        .reading-part-header h1 { margin:.18rem 0 .45rem; color:#eef4ff; font-size:clamp(1.75rem, 4vw, 2.4rem); text-align:left; }
        .reading-part-header > p { margin:0; max-width:46rem; color:rgba(238,244,255,.84); font-size:1.04rem; line-height:1.5; }
        .reading-part-facts { display:flex; flex-wrap:wrap; gap:.55rem; margin-top:.85rem; }
        .reading-part-facts span { padding:.38rem .62rem; border:1px solid #35508e; border-radius:999px; background:#1a2847; color:rgba(238,244,255,.76); font-size:.76rem; }
        .reading-part-facts strong { color:#eef4ff; }
        .reading-part-access-prompt { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin:1rem 0 0; padding:.85rem 1rem; border:1px solid rgba(240,177,79,.48); border-radius:14px; background:#1a2847; color:#eef4ff; }
        .reading-part-access-prompt p { margin:.18rem 0 0; color:rgba(238,244,255,.78); }
        .reading-part-access-prompt button { padding:.55rem .78rem; border:0; border-radius:9px; background:#ffbd38; color:#13213b; font:inherit; font-weight:900; cursor:pointer; }
        .reading-part-section { margin-top:1.45rem; }
        .reading-part-section-heading { margin-bottom:.8rem; }
        .reading-part-section-heading h2 { margin:0 0 .2rem; color:#eef4ff; font-size:1.3rem; text-align:left; }
        .reading-part-section-heading p { margin:0; color:rgba(238,244,255,.78); }
        .reading-part-activity-grid { display:grid; grid-template-columns:minmax(0, 1fr); gap:1rem; }
        .reading-part-hub .reading-part-activity { position:relative; display:flex; flex-direction:column; align-items:flex-start; width:100%; max-width:48rem; min-height:220px; text-align:left; }
        .reading-part-hub .reading-part-activity.is-coming-soon { cursor:not-allowed; opacity:.58; }
        .reading-part-activity-label { display:flex; align-items:center; gap:.4rem; margin-bottom:.45rem; color:#eef4ff; font-size:.82rem; font-weight:850; text-transform:uppercase; }
        .reading-part-activity-label svg { color:#eef4ff; }
        .reading-part-hub .reading-part-activity h3 { font-size:1.22rem; text-align:left; }
        .reading-part-hub .reading-part-activity p { text-align:left; }
        .reading-activity-progress { display:block; margin-top:auto; padding-top:.8rem; color:#ffbd38; font-size:.84rem; }
        .reading-activity-progress.is-complete { color:#7ef0c2; }
        .reading-part-activity-footer { display:flex; align-items:center; justify-content:space-between; gap:.7rem; width:100%; margin-top:.65rem; }
        .reading-part-activity-footer > strong { display:inline-flex; align-items:center; gap:.18rem; margin-left:auto; color:#ffbd38; font-size:.84rem; }
        .reading-part-pill { display:inline-flex; padding:.2rem .46rem; border:1px solid rgba(238,244,255,.28); border-radius:999px; color:rgba(238,244,255,.72); font-size:.66rem; font-weight:850; }
        .reading-part-pill.demo { border-color:rgba(255,189,56,.44); color:#ffcf70; }
        .reading-part-hub .reading-part-activity.is-complete { border-color:color-mix(in srgb, #22c55e 64%, #35508e); box-shadow:0 0 0 1px color-mix(in srgb, #22c55e 22%, transparent), 0 10px 24px rgba(0,0,0,.16); }
        .reading-part-hub .reading-complete-icon { position:absolute; top:1rem; right:1rem; color:#7ef0c2 !important; }
        :root[data-theme="light"] .reading-part-back { border-color:rgba(53,80,142,.35); background:var(--color-surface-2); color:var(--color-text); }
        :root[data-theme="light"] .reading-part-title-line, :root[data-theme="light"] .reading-part-title-line svg, :root[data-theme="light"] .reading-part-header h1, :root[data-theme="light"] .reading-part-section-heading h2 { color:var(--color-text); }
        :root[data-theme="light"] .reading-part-header > p, :root[data-theme="light"] .reading-part-section-heading p { color:var(--color-text-soft); }
        :root[data-theme="light"] .reading-part-facts span { border-color:rgba(53,80,142,.28); background:var(--color-surface-2); color:var(--color-text-soft); }
        :root[data-theme="light"] .reading-part-facts strong { color:var(--color-text); }
        :root[data-theme="light"] .reading-part-activity-label, :root[data-theme="light"] .reading-part-activity-label svg { color:var(--color-text); }
        :root[data-theme="light"] .reading-activity-progress, :root[data-theme="light"] .reading-part-activity-footer > strong { color:#a76600; }
        :root[data-theme="light"] .reading-activity-progress.is-complete { color:#08734d; }
        :root[data-theme="light"] .reading-part-hub .reading-part-activity.is-complete { border-color:#159766; box-shadow:0 0 0 1px rgba(21,151,102,.28), 0 12px 26px rgba(21,94,73,.1); }
        :root[data-theme="light"] .reading-part-hub .reading-complete-icon { color:#0d9b67 !important; }
        @media (max-width:560px) { .reading-part-access-prompt { align-items:flex-start; flex-direction:column; } .reading-part-activity-footer { align-items:flex-start; flex-direction:column; } .reading-part-activity-footer > strong { margin-left:0; } }
      `}</style>
    </main>
  );
}
