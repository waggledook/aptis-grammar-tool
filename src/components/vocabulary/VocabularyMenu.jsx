// src/components/vocabulary/VocabularyMenu.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import AptisDemoBadge from "../access/AptisDemoBadge.jsx";


export default function VocabularyMenu({ user, aptisAccess, onSignIn }) {
  const navigate = useNavigate();
  const [lockedItem, setLockedItem] = useState("");
  const isDemoMode = !!aptisAccess?.isDemoMode;

  function openCard(path, demoAccess, label) {
    if (isDemoMode && demoAccess === "locked") {
      setLockedItem(label);
      return;
    }
    navigate(path);
  }

  function renderAccessPill(kind) {
    if (!isDemoMode) return null;
    return (
      <span className={`vocab-access-pill ${kind === "demo" ? "demo" : "locked"}`}>
        {kind === "demo" ? "Demo available" : "Full access"}
      </span>
    );
  }

  return (
    <div className="vocab-menu game-wrapper menu-style-hub">
      <Seo
        title="Aptis Vocabulary Practice | Seif Aptis Trainer"
        description="Build vocabulary for Aptis through topic-based practice, synonym training, and collocation practice."
      />
      <header className="header">
        <h2 className="title">Vocabulary Practice</h2>
        <p className="intro">
          Build your vocabulary through topics, synonym training, and collocation practice.
        </p>
      </header>

      <AptisDemoBadge user={user} aptisAccess={aptisAccess} onSignIn={onSignIn} />

      {isDemoMode && lockedItem ? (
        <div className="vocab-access-prompt" role="status">
          <strong>{lockedItem} is included with full access.</strong>
          <p>The vocabulary demo includes Transport and Education topic practice plus a small synonym sample.</p>
        </div>
      ) : null}

      <div className="cards">
        <button
          className="card menu-card"
          onClick={() => openCard("/vocabulary/topics", "demo", "Topic Practice")}
        >
          <div className="menu-card-header">
            <h3>Topic Practice{renderAccessPill("demo")}</h3>
          </div>
          <p>Study words by theme (e.g. Travel, Education...).</p>
        </button>

        {/* 🔁 Synonym Trainer */}
        <button
          className="card menu-card"
          onClick={() => openCard("/vocabulary/synonyms", "demo", "Synonym Trainer")}
        >
          <div className="menu-card-header">
            <h3>Synonym Trainer{renderAccessPill("demo")}</h3>
            <span className="soon-pill">New</span>
          </div>
          <p>
            Practise closest-meaning matching with exam-style sets, favourites, and mistake review.
          </p>
        </button>

        {/* ⚙️ Collocation Trainer (LIVE) */}
<button
  className="card menu-card"
  onClick={() => openCard("/vocabulary/collocations", "locked", "Collocation Trainer")}
>
  <div className="menu-card-header">
    <h3>Collocation Trainer{renderAccessPill("locked")}</h3>
    <span className="uc-top-wrapper">
              <img
                src="/images/ui/under-construction.png"
                alt="Under construction"
                className="uc-top-icon"
              />
            </span>
  </div>
  <p>Practise natural word combinations and fixed expressions.</p>
</button>
      </div>

      <button
        className="topbar-btn"
        onClick={() => navigate("/")}
        style={{ marginTop: "1rem" }}
      >
        ← Back to main menu
      </button>

      <style>{`
        .header { margin-bottom: 1rem; }
        .title { font-size: 1.6rem; margin-bottom: .3rem; }
        .intro { color: #a9b7d1; max-width: 640px; }

        .vocab-access-prompt {
          margin: 0 0 1rem;
          padding: .8rem .95rem;
          border-radius: 12px;
          border: 1px solid color-mix(in srgb, var(--color-accent) 42%, var(--color-border));
          background:
            linear-gradient(100deg, color-mix(in srgb, var(--color-accent) 14%, var(--color-surface-raised)), var(--color-surface-raised));
        }

        .vocab-access-prompt strong {
          display: block;
          margin-bottom: .2rem;
          color: var(--color-text);
        }

        .vocab-access-prompt p {
          margin: 0;
          color: var(--color-text-soft);
          line-height: 1.38;
          font-size: .9rem;
        }

        .cards {
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr;
        }
        @media (min-width: 720px) {
          .cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: .75rem;
          margin-bottom: .35rem;
        }

        /* ——— Active card ——— */
        .card h3 {
          margin: 0;
          font-size: 1.05rem;
          color: #e6f0ff;
          font-weight: 600;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: .4rem;
        }

        .card p {
          margin: 0;
          color: #cfd9f3;
          font-size: .9rem;
          line-height: 1.4;
        }

        /* ——— Coming soon cards ——— */
        .soon-card {
          position: relative;
          cursor: not-allowed;
          opacity: 0.6;
          background: #1a2747;
          border: 1px dashed #3a5ba0;
        }
        .soon-card:hover {
          transform: none;
          box-shadow: none;
          border-color: #3a5ba0;
        }

        .soon-card.tease {
          cursor: pointer;
          opacity: 0.85;
          transition: transform 0.08s ease, box-shadow 0.08s ease, border-color 0.08s;
        }
        .soon-card.tease:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0,0,0,.25);
          border-color: #4a79d8;
          background: #223463;
        }

        .soon-head {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: .5rem .75rem;
          margin-bottom: .35rem;
        }

        .soon-pill {
          background: #24365d;
          border: 1px solid #37598e;
          color: #9eb7e5;
          font-size: .75rem;
          line-height: 1.2;
          padding: .2rem .5rem;
          border-radius: 999px;
          font-weight: 600;
          white-space: nowrap;
        }

        .vocab-access-pill {
          display: inline-flex;
          align-items: center;
          padding: .18rem .48rem;
          border-radius: 999px;
          border: 1px solid var(--color-border);
          color: var(--color-text-soft);
          font-size: .68rem;
          font-weight: 800;
          line-height: 1.2;
          white-space: nowrap;
        }

        .vocab-access-pill.demo {
          border-color: color-mix(in srgb, var(--color-accent) 48%, var(--color-border));
          background: color-mix(in srgb, var(--color-accent) 16%, transparent);
          color: var(--color-accent);
        }

        .vocab-access-pill.locked {
          border-color: color-mix(in srgb, #94a3b8 42%, var(--color-border));
          background: color-mix(in srgb, #94a3b8 10%, transparent);
        }
      `}</style>
    </div>
  );
}
