import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "./common/Seo.jsx"; // adjust path if your folder structure differs
import AptisDemoBadge from "./access/AptisDemoBadge.jsx";


export default function MainMenu({ user, aptisAccess, onSignIn }) {
  const navigate = useNavigate();
  const [lockedSection, setLockedSection] = useState("");
  const isDemoMode = !!aptisAccess?.isDemoMode;

  const fullAccessSections = new Set([]);

  function openSection(sectionId, path) {
    if (isDemoMode && fullAccessSections.has(sectionId)) {
      setLockedSection(sectionId);
      return;
    }

    navigate(path);
  }

  function renderAccessPill(kind) {
    if (!isDemoMode) return null;

    return (
      <span className={`menu-access-pill ${kind === "demo" ? "demo" : "locked"}`}>
        {kind === "demo" ? "Demo available" : "Full access"}
      </span>
    );
  }

  const lockedLabels = {
    reading: "Reading Practice",
    speaking: "Speaking Practice",
    writing: "Writing Practice",
    vocabulary: "Vocabulary Practice",
    listening: "Listening Practice",
  };

  return (
    <div className="menu-wrapper menu-style-hub">
      <Seo
        title="Seif Aptis Trainer | Free Aptis Practice"
        description="Practise Aptis grammar, reading, writing, speaking and vocabulary online. Exam-style tasks with tips, guides and progress tracking."
      />
      <header
        className="main-header"
        style={{ textAlign: "center", marginBottom: "0rem" }}
      >
        <img
          src="/images/seif-aptis-trainer-logo.png"
          alt="Seif Aptis Trainer Logo"
          className="menu-logo"
          draggable="false"
        />
      </header>

      <p className="menu-sub">Choose a practice area to begin.</p>

      <AptisDemoBadge user={user} aptisAccess={aptisAccess} onSignIn={onSignIn} />

      <div className="whats-new-banner">
  <div className="whats-new-copy">
    <span className="whats-new-label">What’s new</span>
    <p>
      <strong>Automatic writing feedback</strong> Get instant Aptis-style feedback on your Writing Part 1, 2, 3 and 4 practice tasks.
    </p>
  </div>

  <button
    className="whats-new-btn"
    onClick={() => openSection("writing", "/writing")}
  >
    Open writing practice
  </button>
</div>

      {isDemoMode && lockedSection && (
        <div className="menu-access-prompt" role="status">
          <div>
            <strong>{lockedLabels[lockedSection]} is included with full access.</strong>
            <p>
              The demo currently includes grammar, selected reading, writing, speaking, vocabulary and listening samples.
            </p>
          </div>
          {!user && onSignIn ? (
            <button type="button" className="menu-access-prompt-btn" onClick={onSignIn}>
              Sign in
            </button>
          ) : null}
        </div>
      )}

      <div className="menu-grid">
        {/* Grammar */}
<button className="menu-card" onClick={() => navigate("/grammar")}>
  <div className="menu-card-title-row">
    <h3>Grammar Practice</h3>
    {renderAccessPill("demo")}
  </div>
  <p>Gap-fills by level & tag (A2–C1). Track mistakes & favourites.</p>
</button>

        {/* Reading */}
        <button className="menu-card" onClick={() => openSection("reading", "/reading")}>
        <div className="menu-card-title-row">
          <h3>Reading Practice</h3>
          {renderAccessPill("demo")}
        </div>
        <p>Practice tasks for all reading sections.</p>
      </button>

        {/* Speaking */}
<button className="menu-card" onClick={() => openSection("speaking", "/speaking")}>
  <div className="menu-card-title-row">
    <h3>Speaking Practice</h3>
    {renderAccessPill("demo")}
  </div>
  <p>Practice tasks for all parts of the speaking exam.</p>
</button>

        {/* Writing */}
<button className="menu-card" onClick={() => openSection("writing", "/writing")}>
  <div className="menu-card-title-row">
    <h3>Writing Practice</h3>
    {renderAccessPill("demo")}
  </div>
  <p>
    Practise all parts of the Aptis Writing test, from short answers to
    full emails.
  </p>
</button>

        <button className="menu-card" onClick={() => openSection("vocabulary", "/vocabulary")}>
  <div className="menu-card-header">
    <div className="menu-card-title-row">
      <h3>Vocabulary Practice</h3>
      {renderAccessPill("demo")}
    </div>
    <span className="uc-top-wrapper">
      <img
        src="/images/ui/under-construction.png"
        alt="Under construction"
        className="uc-top-icon"
      />
    </span>
  </div>
  <p>Topics, synonyms, and collocations.</p>
</button>


<button className="menu-card" onClick={() => openSection("listening", "/listening")}>
  <div className="menu-card-header">
    <div className="menu-card-title-row">
      <h3>Listening Practice</h3>
      {renderAccessPill("demo")}
    </div>
    <span className="uc-top-wrapper">
      <img
        src="/images/ui/under-construction.png"
        alt="Under construction"
        className="uc-top-icon"
      />
    </span>
  </div>
  <p>Exam-style listening tasks (Parts 1–4).</p>
</button>

        {/* Profile */}
<button className="menu-card" onClick={() => (user ? navigate("/profile") : onSignIn?.())}>
  <div className="menu-card-title-row">
    <h3>My Profile</h3>
    {isDemoMode && !user ? <span className="menu-access-pill neutral">Sign-in feature</span> : null}
  </div>
  <p>See your progress and review saved work.</p>
</button>

{/* Course Pack – only for authorised users */}
{user?.courseAccess?.["seif-pack-v1"] && (
  <button className="menu-card" onClick={() => navigate("/course-pack")}>
    <h3>Course Pack</h3>
    <p>View the Seif Aptis Trainer Pack (PDF) inside the app.</p>
  </button>
)}

{/* Admin tools – only for admins */}
{user?.role === "admin" && (
  <button
    className="menu-card"
    onClick={() => navigate("/admin")}
  >
    <h3>Admin Tools</h3>
    <p>Manage teacher accounts & user roles.</p>
  </button>
)}

        {/* Teacher tools – for teachers and admins */}
        {(user?.role === "teacher" || user?.role === "admin") && (
          <button
            className="menu-card"
            onClick={() => navigate("/teacher-tools")}
          >
            <h3>Teacher Tools</h3>
            <p>Extra materials and test controls for teachers.</p>
          </button>
        )}

{user && (user.role === "teacher" || user.role === "admin") && (
  <button
    className="menu-card"
    onClick={() => navigate("/my-students")}
  >
    <h3>My Students</h3>
    <p>Track your students' progress.</p>
  </button>
)}

      </div>

{/* --- Promo Banner --- */}
<div className="promo-banner">
  <p>
    🎓 Looking for full Aptis B1–C1 preparation with live classes?
    <a
      href="https://idiomasseif.com/preparacion-examen-aptis/aptis-b1-b2-c1/"
      target="_blank"
      rel="noopener noreferrer"
    >
      View Seif Academy courses →
    </a>
  </p>
</div>

      <style>{`
        /* ——— Layout wrapper ——— */
        .menu-wrapper {
          padding-top: 0;
          margin-top: 0;
        }

        .main-header {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0;
          padding: 0;
          line-height: 0;
          text-align: center;
        }

        .menu-logo {
          display: block;
          width: clamp(200px, 24vw, 340px);
          height: auto;
          filter:
            drop-shadow(0 0 10px rgba(255,255,255,0.5))
            drop-shadow(0 0 18px rgba(255,165,0,0.35));
          animation: logoFade 1.2s ease both;
          transition: filter .3s ease;
          margin: 0;
        }
        .menu-logo:hover {
          filter:
            drop-shadow(0 0 12px rgba(255,255,255,0.8))
            drop-shadow(0 0 25px rgba(255,165,0,0.5));
        }
        @keyframes logoFade {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }

        .menu-sub {
          opacity: .85;
          color: var(--color-text-soft);
          margin-top: .2rem;
          margin-bottom: .6rem;
        }

        .whats-new-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 0 0 1rem;
  padding: .9rem 1rem;
  border-radius: 14px;
  background: linear-gradient(
    90deg,
    rgba(255, 191, 73, 0.10),
    rgba(255, 191, 73, 0.04)
  );
  border: 1px solid rgba(255, 191, 73, 0.35);
}

.whats-new-copy {
  min-width: 0;
}

.whats-new-label {
  display: inline-block;
  margin-bottom: .35rem;
  padding: .2rem .55rem;
  border-radius: 999px;
  font-size: .75rem;
  font-weight: 700;
  letter-spacing: .02em;
  color: var(--color-accent);
  background: rgba(255, 191, 73, 0.12);
  border: 1px solid rgba(255, 191, 73, 0.28);
}

.whats-new-copy p {
  margin: 0;
  color: var(--color-text-soft);
  line-height: 1.4;
}

@media (max-width: 720px) {
  .whats-new-banner {
    flex-direction: column;
    align-items: stretch;
  }

  .whats-new-btn {
    width: 100%;
  }
}

.menu-access-prompt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .85rem;
  margin: 0 0 1rem;
  padding: .78rem .95rem;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--color-accent) 42%, var(--color-border));
  background:
    linear-gradient(100deg, color-mix(in srgb, var(--color-accent) 14%, var(--color-surface-raised)), var(--color-surface-raised));
}

.menu-access-prompt strong {
  display: block;
  margin-bottom: .18rem;
  color: var(--color-text);
}

.menu-access-prompt p {
  margin: 0;
  color: var(--color-text-soft);
  line-height: 1.38;
  font-size: .9rem;
}

.menu-access-prompt-btn {
  flex: 0 0 auto;
  padding: .45rem .75rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--color-accent) 45%, var(--color-border));
  background: color-mix(in srgb, var(--color-accent) 16%, transparent);
  color: var(--color-accent);
  font-size: .85rem;
  font-weight: 800;
}

@media (max-width: 720px) {
  .menu-access-prompt {
    align-items: stretch;
    flex-direction: column;
  }
}

        /* ——— Grid ——— */
        .menu-grid {
          margin-top: 0;
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr;
        }
        @media (min-width: 920px) {
          .menu-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .menu-card-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: .65rem;
          margin-bottom: .35rem;
        }

        .menu-card-title-row h3 {
          margin: 0;
        }

        .menu-access-pill {
          flex: 0 0 auto;
          padding: .2rem .48rem;
          border-radius: 999px;
          border: 1px solid var(--color-border);
          background: color-mix(in srgb, var(--color-surface-raised) 82%, transparent);
          color: var(--color-text-soft);
          font-size: .68rem;
          font-weight: 800;
          line-height: 1.2;
          white-space: nowrap;
        }

        .menu-access-pill.demo {
          border-color: color-mix(in srgb, var(--color-accent) 48%, var(--color-border));
          background: color-mix(in srgb, var(--color-accent) 16%, transparent);
          color: var(--color-accent);
        }

        .menu-access-pill.locked {
          border-color: color-mix(in srgb, #94a3b8 42%, var(--color-border));
          background: color-mix(in srgb, #94a3b8 10%, transparent);
        }

        .menu-access-pill.neutral {
          border-color: color-mix(in srgb, var(--color-link) 42%, var(--color-border));
          background: color-mix(in srgb, var(--color-link) 10%, transparent);
          color: var(--color-link);
        }

        /* ——— Cards ——— */
        /* ——— "Coming soon" variants ——— */
        .soon-card {
          position: relative;
          cursor: not-allowed;
          opacity: 0.6;
          background: var(--color-surface-3);
          border: 1px dashed var(--color-border);
        }
        .soon-card:hover {
          transform: none;
          box-shadow: none;
          border-color: var(--color-border);
        }

        .soon-head {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: .5rem .75rem;
          margin-bottom: .35rem;
        }

        .soon-head h3 {
          margin: 0;
          font-size: 1.05rem;
        }

        .soon-pill {
          background: var(--color-surface-3);
          border: 1px solid var(--color-border);
          color: var(--color-muted);
          font-size: .75rem;
          line-height: 1.2;
          padding: .2rem .5rem;
          border-radius: 999px;
          font-weight: 600;
          white-space: nowrap;
        }
          .soon-card.tease {
  cursor: pointer;
  opacity: 0.85;
  transition: transform 0.08s ease, box-shadow 0.08s ease, border-color 0.08s;
}

.soon-card.tease:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0,0,0,.25);
  border-color: var(--color-border-strong);
  background: var(--color-surface-3);
}

:root[data-theme="light"] .main-header {
  background: #13213b;
  border-radius: 12px;
  margin-bottom: .8rem;
  padding: .75rem;
}

:root[data-theme="light"] .menu-logo {
  filter:
    drop-shadow(0 4px 12px rgba(15, 23, 42, 0.35))
    drop-shadow(0 0 18px rgba(255, 180, 64, 0.18));
}

:root[data-theme="light"] .menu-logo:hover {
  filter:
    drop-shadow(0 5px 14px rgba(15, 23, 42, 0.45))
    drop-shadow(0 0 22px rgba(255, 180, 64, 0.24));
}

      `}</style>
    </div>
  );
}
