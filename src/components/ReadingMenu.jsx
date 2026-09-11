import React, { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, ClipboardCheck, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchReadingCompletions } from "../firebase.js";
import { APTIS_READING_PARTS } from "../reading/readingMenuData.js";
import AptisDemoBadge from "./access/AptisDemoBadge.jsx";
import Seo from "./common/Seo.jsx";

export default function ReadingMenu({ user, aptisAccess, onSignIn }) {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(() => new Set());
  const isDemoMode = !!aptisAccess?.isDemoMode;
  const canOpenMocks = Boolean(user) && !isDemoMode;

  function openReadingMocks() {
    if (!user) {
      if (onSignIn) onSignIn();
      else navigate("/reading/mock-tests");
      return;
    }
    navigate(isDemoMode ? "/aptis-access" : "/reading/mock-tests");
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

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
  }, [user]);

  return (
    <main className="reading-menu game-wrapper hub-menu-wrapper menu-style-hub">
      <Seo
        title="Aptis Reading Practice | Seif Aptis Trainer"
        description="Choose an Aptis Reading part, learn its strategy and practise complete exam-style tasks with feedback."
      />

      <header className="reading-menu-header">
        <h1>Aptis Reading Parts</h1>
        <p>Open a part to choose between strategy training and exam-style practice.</p>
      </header>

      <AptisDemoBadge user={user} aptisAccess={aptisAccess} onSignIn={onSignIn} />

      <section className="reading-menu-section reading-mock-entry">
        <button className="menu-card reading-mock-card" type="button" onClick={openReadingMocks}>
          <div>
            <span><ClipboardCheck size={25} aria-hidden="true" /> Full exam practice</span>
            <h2>Reading mock exams</h2>
            <p>Complete the five-screen, 35-minute test flow and receive a detailed correction with every answer shown in context.</p>
            <small>{canOpenMocks ? "2 complete mocks · 25 raw points, scaled to 50 · Full contextual correction" : user ? "Active Aptis access required" : "Sign in and active Aptis access required · Results are saved to your profile"}</small>
          </div>
          <strong>{canOpenMocks ? "Open mock exams" : user ? "View access options" : "Sign in to unlock"} {canOpenMocks ? <ArrowRight size={18} aria-hidden="true" /> : <LockKeyhole size={18} aria-hidden="true" />}</strong>
        </button>
      </section>

      <section className="reading-menu-section">
        <div className="reading-parts-grid" aria-label="Aptis Reading parts">
          {APTIS_READING_PARTS.map((part) => {
            const Icon = part.icon;
            const completedCount = part.taskIds.filter((taskId) => completed.has(taskId)).length;
            const allComplete = part.taskIds.length > 0 && completedCount === part.taskIds.length;
            const onlyLockedActivities = part.training
              .concat(part.practice)
              .filter((activity) => activity.status !== "coming-soon")
              .every((activity) => activity.demoAccess === "locked");

            return (
              <button
                className={`menu-card reading-part-card ${allComplete ? "is-complete" : ""}`}
                key={part.number}
                type="button"
                onClick={() => navigate(`/reading/parts/${part.number}`)}
              >
                {allComplete ? <CheckCircle2 className="reading-complete-icon" size={24} aria-label="Part complete" /> : null}
                <div className="reading-part-card-label"><Icon size={28} aria-hidden="true" /><span>{part.label}</span></div>
                <h3>{part.title}</h3>
                <p>{part.copy}</p>
                {user ? (
                  <strong className="reading-menu-progress">
                    {completedCount}/{part.taskIds.length} practice tasks complete
                  </strong>
                ) : (
                  <strong className="reading-menu-progress">{part.menuSummary}</strong>
                )}
                {isDemoMode ? (
                  <small className={`reading-menu-access ${onlyLockedActivities ? "locked" : "demo"}`}>
                    {onlyLockedActivities ? "Full access" : "Demo available"}
                  </small>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <button className="topbar-btn reading-menu-back" type="button" onClick={() => navigate("/")}>
        ← Back to main menu
      </button>

      <style>{`
        .reading-menu-header { margin-bottom:1.2rem; }
        .reading-menu-header h1 { margin:0 0 .55rem; color:#eef4ff; font-size:clamp(1.7rem, 4vw, 2.35rem); text-align:left; }
        .reading-menu-header p { margin:0; color:rgba(238,244,255,.82); font-size:1.05rem; line-height:1.5; }
        .reading-menu-section { margin-top:1.3rem; }
        .reading-mock-entry { margin-top:1rem; }
        .reading-menu .reading-mock-card { display:flex; align-items:center; justify-content:space-between; gap:1.5rem; width:100%; padding:1.15rem 1.25rem; border-color:rgba(255,189,56,.58); text-align:left; }
        .reading-mock-card > div > span { display:flex; align-items:center; gap:.45rem; color:#ffcf70; font-size:.76rem; font-weight:900; text-transform:uppercase; }
        .reading-menu .reading-mock-card h2 { margin:.28rem 0; color:#eef4ff; font-size:1.28rem; text-align:left; }
        .reading-menu .reading-mock-card p { max-width:46rem; margin:.2rem 0 .5rem; text-align:left; }
        .reading-mock-card small { color:rgba(238,244,255,.67); font-weight:750; }
        .reading-mock-card > strong { display:flex; flex:0 0 auto; align-items:center; gap:.35rem; color:#ffbd38; }
        .reading-parts-grid { display:grid; grid-template-columns:1fr; gap:1rem; }
        .reading-menu .reading-part-card { position:relative; display:flex; flex-direction:column; align-items:flex-start; min-height:220px; }
        .reading-part-card-label { display:flex; align-items:center; gap:.35rem; margin-bottom:.25rem; color:#eef4ff; font-size:1rem; }
        .reading-part-card-label svg { color:#eef4ff; }
        .reading-menu .reading-part-card h3 { font-size:1.28rem; text-align:left; }
        .reading-menu .reading-part-card p { text-align:left; }
        .reading-menu-progress { display:block; margin-top:auto; padding-top:.9rem; color:#ffbd38; font-size:.86rem; }
        .reading-menu-access { display:inline-flex; margin-top:.45rem; padding:.2rem .45rem; border:1px solid rgba(238,244,255,.28); border-radius:999px; color:rgba(238,244,255,.72); font-size:.66rem; font-weight:850; }
        .reading-menu-access.demo { border-color:rgba(255,189,56,.44); color:#ffcf70; }
        .reading-menu .reading-part-card.is-complete { border-color:color-mix(in srgb, #22c55e 64%, #35508e); box-shadow:0 0 0 1px color-mix(in srgb, #22c55e 22%, transparent), 0 10px 24px rgba(0,0,0,.16); }
        .reading-complete-icon { position:absolute; top:1rem; right:1rem; color:#7ef0c2 !important; }
        .reading-menu-back { margin-top:1.2rem; }
        :root[data-theme="light"] .reading-menu-header h1 { color:var(--color-text); }
        :root[data-theme="light"] .reading-menu-header p { color:var(--color-text-soft); }
        :root[data-theme="light"] .reading-part-card-label, :root[data-theme="light"] .reading-part-card-label svg { color:var(--color-text); }
        :root[data-theme="light"] .reading-menu-progress { color:#a76600; }
        :root[data-theme="light"] .reading-menu .reading-mock-card { border-color:#b47a15; }
        :root[data-theme="light"] .reading-mock-card > div > span, :root[data-theme="light"] .reading-mock-card > strong { color:#8a5900; }
        :root[data-theme="light"] .reading-menu .reading-mock-card h2 { color:var(--color-text); }
        :root[data-theme="light"] .reading-mock-card small { color:var(--color-text-soft); }
        :root[data-theme="light"] .reading-menu-access { color:var(--color-text-soft); }
        :root[data-theme="light"] .reading-menu-access.demo { border-color:#b47a15; color:#8a5900; }
        :root[data-theme="light"] .reading-menu .reading-part-card.is-complete { border-color:#159766; box-shadow:0 0 0 1px rgba(21,151,102,.28), 0 12px 26px rgba(21,94,73,.1); }
        :root[data-theme="light"] .reading-complete-icon { color:#0d9b67 !important; }
        @media (min-width:720px) { .reading-parts-grid { grid-template-columns:repeat(2, minmax(0, 1fr)); } }
        @media (max-width:620px) { .reading-menu .reading-mock-card { align-items:flex-start; flex-direction:column; } }
      `}</style>
    </main>
  );
}
