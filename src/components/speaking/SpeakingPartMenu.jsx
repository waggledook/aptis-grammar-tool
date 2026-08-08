import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronRight, Clock3, GraduationCap, Images, Lightbulb } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import AptisDemoBadge from "../access/AptisDemoBadge.jsx";
import Seo from "../common/Seo.jsx";
import { getAptisSpeakingPart } from "./speakingMenuData.js";
import "../listening/listeningMenu.css";

function AccessPill({ activity, isDemoMode }) {
  if (activity.status === "coming-soon") {
    return <span className="speaking-part-pill listening-part-pill coming-soon">Coming soon</span>;
  }
  if (!isDemoMode || !activity.demoAccess) return null;
  return (
    <span className={`speaking-part-pill listening-part-pill ${activity.demoAccess}`}>
      {activity.demoAccess === "demo" ? "Demo available" : "Full access"}
    </span>
  );
}

function getActivityIcon(activity, type) {
  if (type === "practice") return Clock3;
  if (activity.status === "coming-soon") return GraduationCap;
  if (activity.id === "part2-photo-guide") return Images;
  return Lightbulb;
}

export default function SpeakingPartMenu({ user, aptisAccess, onSignIn }) {
  const navigate = useNavigate();
  const { partNumber = "" } = useParams();
  const [lockedActivity, setLockedActivity] = useState("");
  const part = getAptisSpeakingPart(partNumber);
  const isDemoMode = !!aptisAccess?.isDemoMode;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    setLockedActivity("");
  }, [partNumber]);

  if (!part) return <Navigate to="/speaking" replace />;

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
        className={`menu-card speaking-part-activity listening-part-activity ${isComingSoon ? "is-coming-soon" : ""}`}
        disabled={isComingSoon}
        key={activity.id}
        type="button"
        onClick={() => openActivity(activity)}
      >
        <div className="speaking-part-activity-label listening-part-activity-label">
          <ActivityIcon size={27} aria-hidden="true" />
          <span>{activity.eyebrow}</span>
        </div>
        <h3>{activity.title}</h3>
        <p>{activity.copy}</p>
        <div className="speaking-part-activity-footer listening-part-activity-footer">
          <div>
            <AccessPill activity={activity} isDemoMode={isDemoMode} />
            {activity.badge ? <span className="speaking-shared-badge">{activity.badge}</span> : null}
          </div>
          {!isComingSoon ? (
            <strong>Open activity <ChevronRight size={17} aria-hidden="true" /></strong>
          ) : null}
        </div>
      </button>
    );
  }

  return (
    <main className="speaking-part-hub listening-part-hub game-wrapper hub-menu-wrapper menu-style-hub">
      <Seo
        title={`Aptis Speaking ${part.label}: ${part.title} | Seif Aptis Trainer`}
        description={`${part.copy} Open Aptis Speaking ${part.label} guided training and exam-style practice.`}
      />

      <button className="speaking-part-back listening-part-back" type="button" onClick={() => navigate("/speaking")}>
        <ArrowLeft size={18} aria-hidden="true" /> Back to Speaking
      </button>

      <header className="speaking-part-header listening-part-header">
        <div className="speaking-part-title-line listening-part-title-line">
          <PartIcon size={30} aria-hidden="true" />
          <span>{part.label}</span>
        </div>
        <h1>{part.title}</h1>
        <p>{part.copy}</p>
        <div className="speaking-part-header-actions listening-part-header-actions">
          <button className="speaking-practice-link listening-practice-link" type="button" onClick={() => openActivity(part.practice)}>
            <Clock3 size={16} aria-hidden="true" />
            Start exam practice
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </header>

      <AptisDemoBadge user={user} aptisAccess={aptisAccess} onSignIn={onSignIn} />

      {lockedActivity ? (
        <div className="speaking-part-access-prompt listening-part-access-prompt" role="status">
          <div>
            <strong>{lockedActivity} is included with full access.</strong>
            <p>Sign in with your academy account to continue.</p>
          </div>
          <button type="button" onClick={onSignIn}>Sign in</button>
        </div>
      ) : null}

      {part.related ? (
        <aside className="speaking-related-guide">
          <div>
            <span>{part.related.eyebrow}</span>
            <strong>{part.related.title}</strong>
            <p>{part.related.copy}</p>
          </div>
          <button type="button" onClick={() => navigate(part.related.path)}>
            {part.related.cta} <ChevronRight size={17} aria-hidden="true" />
          </button>
        </aside>
      ) : null}

      <section className="speaking-part-section listening-part-section">
        <div className="speaking-part-section-heading listening-part-section-heading">
          <h2>Learn &amp; train</h2>
          <p>Build the language and speaking method you need before attempting complete timed practice.</p>
        </div>
        <div className={`speaking-part-activity-grid listening-part-activity-grid ${part.training.length > 1 ? "has-multiple" : ""}`}>
          {part.training.map((activity) => renderActivity(activity, "training"))}
        </div>
      </section>

      <section className="speaking-part-section listening-part-section">
        <div className="speaking-part-section-heading listening-part-section-heading">
          <h2>Exam practice</h2>
          <p>Apply the method to timed prompts and receive focused feedback on your speaking.</p>
        </div>
        <div className="speaking-part-activity-grid listening-part-activity-grid">
          {renderActivity(part.practice, "practice")}
        </div>
      </section>

      <style>{`
        .speaking-part-activity-footer > div {
          display: flex;
          flex-wrap: wrap;
          gap: .4rem;
        }

        .speaking-shared-badge {
          display: inline-flex;
          padding: .2rem .46rem;
          border: 1px solid rgba(255, 189, 56, .44);
          border-radius: 999px;
          color: #ffcf70;
          font-size: .66rem;
          font-weight: 850;
        }

        .speaking-related-guide {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-top: 1rem;
          padding: .9rem 1rem;
          border: 1px solid rgba(255, 189, 56, .42);
          border-radius: 14px;
          background: #1a2847;
          color: #eef4ff;
        }

        .speaking-related-guide > div {
          display: grid;
          gap: .18rem;
        }

        .speaking-related-guide span {
          color: #ffcf70;
          font-size: .72rem;
          font-weight: 850;
          letter-spacing: .04em;
          text-transform: uppercase;
        }

        .speaking-related-guide p {
          margin: 0;
          color: rgba(238, 244, 255, .78);
          line-height: 1.45;
        }

        .speaking-related-guide button {
          display: inline-flex;
          flex: 0 0 auto;
          align-items: center;
          gap: .2rem;
          padding: .6rem .75rem;
          border: 0;
          border-radius: 9px;
          background: #ffbd38;
          color: #13213b;
          font: inherit;
          font-weight: 900;
          cursor: pointer;
        }

        :root[data-theme="light"] .speaking-shared-badge {
          border-color: #b47a15;
          color: #8a5900;
        }

        :root[data-theme="light"] .speaking-related-guide {
          border-color: rgba(180, 122, 21, .38);
          background: var(--color-surface-2);
          color: var(--color-text);
        }

        :root[data-theme="light"] .speaking-related-guide span {
          color: #8a5900;
        }

        :root[data-theme="light"] .speaking-related-guide p {
          color: var(--color-text-soft);
        }

        @media (max-width: 560px) {
          .speaking-related-guide {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}
