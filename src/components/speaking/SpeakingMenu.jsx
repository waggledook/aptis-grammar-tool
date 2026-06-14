// src/components/speaking/SpeakingMenu.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import AptisDemoBadge from "../access/AptisDemoBadge.jsx";

const GUIDE_CARDS = [
  {
    title: "Guide: describing pictures",
    description: "Useful phrases, prepositions, and speculation for Speaking Parts 2 and 3.",
    path: "/speaking/photo-guide",
    underConstruction: true,
    demoAccess: "locked",
  },
  {
    title: "Guide: comparing photos (Part 3)",
    description: "Useful language and focused practice for comparing two pictures in Part 3.",
    path: "/speaking/part3-comparing",
    underConstruction: true,
    demoAccess: "locked",
  },
];

const PRACTICE_CARDS = [
  {
    title: "Part 1: Personal Questions",
    description: "Practise answering 3 short personal questions.",
    path: "/speaking/part1",
    demoAccess: "demo",
  },
  {
    title: "Part 2: Describe a Photograph",
    description: "1 picture, 3 questions. Describe a photo and answer related questions.",
    path: "/speaking/part2",
    demoAccess: "demo",
  },
  {
    title: "Part 3: Describe & Compare",
    description: "Compare two photographs and answer related questions.",
    path: "/speaking/part3",
    demoAccess: "demo",
  },
  {
    title: "Part 4: Presentation & Discussion",
    description: "1-minute prep, then a 2-minute talk answering 3 questions.",
    path: "/speaking/part4",
    demoAccess: "demo",
  },
];

export default function SpeakingMenu({ user, aptisAccess, onSignIn }) {
  const navigate = useNavigate();
  const [lockedItem, setLockedItem] = useState("");
  const isDemoMode = !!aptisAccess?.isDemoMode;

  function openCard(card) {
    if (isDemoMode && card.demoAccess === "locked") {
      setLockedItem(card.title);
      return;
    }
    navigate(card.path);
  }

  function renderAccessPill(card) {
    if (!isDemoMode || !card.demoAccess) return null;
    return (
      <span className={`speaking-access-pill ${card.demoAccess === "demo" ? "demo" : "locked"}`}>
        {card.demoAccess === "demo" ? "Demo available" : "Full access"}
      </span>
    );
  }

  return (
    <div className="speaking-menu game-wrapper menu-style-hub">
      <Seo
        title="Aptis Speaking Practice | Seif Aptis Trainer"
        description="Practise all parts of the Aptis Speaking test: personal questions, photo description, compare & discuss, and a short presentation."
      />
      <header className="header">
        <h2 className="title">Speaking</h2>
        <p className="intro">
          Practise Aptis Speaking Parts 1 to 4. Use the guides when you want support, or go straight into exam-style speaking tasks.
        </p>
      </header>

      <AptisDemoBadge user={user} aptisAccess={aptisAccess} onSignIn={onSignIn} />

      {isDemoMode && lockedItem ? (
        <div className="speaking-access-prompt" role="status">
          <strong>{lockedItem} is included with full access.</strong>
          <p>The speaking demo includes Part 1 plus the first example task from Parts 2, 3 and 4.</p>
        </div>
      ) : null}

      <section className="menu-section guides">
        <div className="section-header">
          <h3>Guides</h3>
          <p>Build the language and task confidence you need before doing the timed speaking parts.</p>
        </div>
        <div className="cards">
          {GUIDE_CARDS.map((card) => (
            <button className="card guide-card" key={card.path} onClick={() => openCard(card)}>
              <div className="menu-card-header">
                <h3>{card.title}{renderAccessPill(card)}</h3>
                {card.underConstruction ? (
                  <span className="uc-top-wrapper">
                    <img
                      src="/images/ui/under-construction.png"
                      alt="Under construction"
                      className="uc-top-icon"
                    />
                  </span>
                ) : null}
              </div>
              <p>{card.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="menu-section practice">
        <div className="section-header">
          <h3>Exam Practice</h3>
          <p>Work through the four speaking parts in exam-style practice, from personal questions to the final talk.</p>
        </div>
        <div className="cards">
          {PRACTICE_CARDS.map((card) => (
            <button className="card practice-card" key={card.path} onClick={() => openCard(card)}>
              <h3>{card.title}{renderAccessPill(card)}</h3>
              <p>{card.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="full-test-card">
        <div>
          <div className="section-kicker">Full Test</div>
          <h3>Complete speaking test</h3>
          <p>Do the whole speaking paper in exam conditions when you want a fuller challenge.</p>
        </div>
        <div className="mock-test-link">
        <a
          href="https://aptis-gen.speaking1.beeskillsenglish.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="mock-test-btn sleek menu-cta-btn"
        >
          🎤 Try a complete speaking test in exam conditions!
        </a>
        </div>
      </section>

      {/* Back to main menu via router */}
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
        .intro { color: #a9b7d1; max-width: 600px; }

        .speaking-access-prompt {
          margin: 0 0 1rem;
          padding: .8rem .95rem;
          border-radius: 12px;
          border: 1px solid color-mix(in srgb, var(--color-accent) 42%, var(--color-border));
          background:
            linear-gradient(100deg, color-mix(in srgb, var(--color-accent) 14%, var(--color-surface-raised)), var(--color-surface-raised));
        }

        .speaking-access-prompt strong {
          display: block;
          margin-bottom: .2rem;
          color: var(--color-text);
        }

        .speaking-access-prompt p {
          margin: 0;
          color: var(--color-text-soft);
          line-height: 1.38;
          font-size: .9rem;
        }

        .menu-section {
          margin-top: 1.2rem;
        }

        .section-header {
          margin-bottom: .85rem;
        }

        .section-header h3 {
          margin: 0 0 .25rem;
          color: #e6f0ff;
        }

        .section-header p {
          margin: 0;
          color: #a9b7d1;
          max-width: 680px;
        }

        .cards {
          display:grid;
          gap:1rem;
          grid-template-columns:1fr;
        }

        @media (min-width:720px){
          .cards{
            grid-template-columns: repeat(2,1fr);
          }
        }

        .card h3 {
          margin:0 0 .35rem;
          display:flex;
          align-items:center;
          flex-wrap:wrap;
          gap:.35rem;
        }

        .speaking-access-pill {
          display: inline-flex;
          align-items: center;
          padding: .2rem .48rem;
          border-radius: 999px;
          border: 1px solid var(--color-border);
          color: var(--color-text-soft);
          font-size: .68rem;
          font-weight: 800;
          line-height: 1.2;
          white-space: nowrap;
        }

        .speaking-access-pill.demo {
          border-color: color-mix(in srgb, var(--color-accent) 48%, var(--color-border));
          background: color-mix(in srgb, var(--color-accent) 16%, transparent);
          color: var(--color-accent);
        }

        .speaking-access-pill.locked {
          border-color: color-mix(in srgb, #94a3b8 42%, var(--color-border));
          background: color-mix(in srgb, #94a3b8 10%, transparent);
        }

        .card p {
          margin:0;
          color:#cfd9f3;
        }

        .full-test-card {
          margin-top: 1.4rem;
        }

        @media (min-width: 760px) {
          .full-test-card {
            grid-template-columns: 1.4fr auto;
          }
        }

        .mock-test-link {
          text-align: center;
        }

        .mock-test-btn.sleek {
          position: relative;
          padding: 1rem 1.9rem;
          letter-spacing: .2px;
          box-shadow:
            0 10px 24px rgba(0,0,0,.35),
            inset 0 1px 0 rgba(255,255,255,.06),
            inset 0 -8px 14px rgba(0,0,0,.25);
          transition:
            transform .18s ease,
            box-shadow .18s ease,
            border-color .18s ease,
            background .18s ease,
            color .18s ease;
          cursor: pointer;
        }

        .mock-test-btn.sleek::after {
          content: "";
          position: absolute;
          left: 10px;
          right: 10px;
          bottom: -6px;
          height: 8px;
          border-radius: 12px;
          background: radial-gradient(60% 120% at 50% 0%, rgba(255,207,64,.25), rgba(255,207,64,0)),
                      radial-gradient(80% 140% at 50% 100%, rgba(0,0,0,.35), rgba(0,0,0,0));
          filter: blur(.2px);
          pointer-events: none;
        }

        @media (hover: hover) and (pointer: fine) {
          .mock-test-btn.sleek:hover {
            transform: translateY(-3px);
            box-shadow:
              0 16px 28px rgba(0,0,0,.38),
              inset 0 1px 0 rgba(255,255,255,.08),
              inset 0 -6px 12px rgba(0,0,0,.22),
              0 0 0 2px rgba(255,207,64,.08);
          }
          .mock-test-btn.sleek:hover::after {
            bottom: -8px;
            opacity: .95;
          }
        }

        .mock-test-btn.sleek:active {
          transform: translateY(0);
          box-shadow:
            0 8px 18px rgba(0,0,0,.30),
            inset 0 1px 0 rgba(255,255,255,.05),
            inset 0 -4px 10px rgba(0,0,0,.28);
        }

        .mock-test-btn.sleek:focus-visible {
          outline: none;
          box-shadow:
            0 0 0 3px rgba(255,207,64,.25),
            0 10px 24px rgba(0,0,0,.35),
            inset 0 1px 0 rgba(255,255,255,.06),
            inset 0 -8px 14px rgba(0,0,0,.25);
        }
      `}</style>
    </div>
  );
}
