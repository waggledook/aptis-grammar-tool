// src/components/writing/WritingMenu.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import AptisDemoBadge from "../access/AptisDemoBadge.jsx";

const GUIDE_CARDS = [
  {
    title: "Part 1 Guide",
    description: "How to write effective 1–5 word answers, with mini-practice.",
    path: "/writing/part1-guide",
    demoAccess: "locked",
  },
  {
    title: "Part 4 Guide",
    description: "Understand the task and explore register, structure, and language choices.",
    path: "/writing/part4-guide",
    demoAccess: "locked",
  },
];

const PRACTICE_CARDS = [
  {
    title: "Part 1: Word-level writing",
    description: "Answer 5 short messages with single words or short phrases. Fast and focused.",
    path: "/writing/part1",
    demoAccess: "demo",
  },
  {
    title: "Part 2: Short text",
    description: "Fill in a short form or write a short sentence response (20–30 words).",
    path: "/writing/part2",
    demoAccess: "demo",
  },
  {
    title: "Part 3: Three responses",
    description: "Reply to three social-style messages. Keep each answer to 30–40 words.",
    path: "/writing/part3",
    demoAccess: "demo",
  },
  {
    title: "Part 4: Emails",
    description: "Write two emails: an informal one and a formal one in full exam format.",
    path: "/writing/part4",
    demoAccess: "demo",
  },
];

export default function WritingMenu({ user, aptisAccess, onSignIn }) {
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
      <span className={`writing-access-pill ${card.demoAccess === "demo" ? "demo" : "locked"}`}>
        {card.demoAccess === "demo" ? "Demo available" : "Full access"}
      </span>
    );
  }

  return (
    <div className="writing-menu game-wrapper menu-style-hub">
      <Seo
        title="Aptis Writing Practice | Seif Aptis Trainer"
        description="Practise Aptis Writing Parts 1 and 4 with guides and full exam-style tasks, plus a complete mock writing test."
      />
      
      <header className="header">
        <h2 className="title">Writing</h2>
        <p className="intro">
          Practise Aptis Writing Parts 1–4. Use the guides when you want support, or go straight into exam-style practice.
        </p>
      </header>

      <AptisDemoBadge user={user} aptisAccess={aptisAccess} onSignIn={onSignIn} />

      {isDemoMode && lockedItem ? (
        <div className="writing-access-prompt" role="status">
          <strong>{lockedItem} is included with full access.</strong>
          <p>The writing demo includes five Part 1 questions plus the first example task from Parts 2, 3 and 4.</p>
        </div>
      ) : null}

      <section className="menu-section guides">
        <div className="section-header">
          <h3>Guides</h3>
          <p>Learn the task type, see examples, and build confidence before you practise.</p>
        </div>
        <div className="cards">
          {GUIDE_CARDS.map((card) => (
            <button className="card guide-card" key={card.path} onClick={() => openCard(card)}>
              <h3>{card.title}{renderAccessPill(card)}</h3>
              <p>{card.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="menu-section practice">
        <div className="section-header">
          <h3>Exam Practice</h3>
          <p>Work through the writing parts in exam-style tasks, from short answers to full emails.</p>
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
          <h3>Complete writing test</h3>
          <p>Do the whole writing paper in exam conditions when you want a fuller challenge.</p>
        </div>
        <a
          href="https://aptis-gen.writing1.beeskillsenglish.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="mock-test-btn sleek menu-cta-btn"
        >
          Open full writing test
        </a>
      </section>


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
        .intro { color: var(--color-text-soft); max-width: 640px; }

        .writing-access-prompt {
          margin: 0 0 1rem;
          padding: .8rem .95rem;
          border-radius: 12px;
          border: 1px solid color-mix(in srgb, var(--color-accent) 42%, var(--color-border));
          background:
            linear-gradient(100deg, color-mix(in srgb, var(--color-accent) 14%, var(--color-surface-raised)), var(--color-surface-raised));
        }

        .writing-access-prompt strong {
          display: block;
          margin-bottom: .2rem;
          color: var(--color-text);
        }

        .writing-access-prompt p {
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
          color: var(--color-text);
        }

        .section-header p {
          margin: 0;
          color: var(--color-text-soft);
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

        .card p {
          margin:0;
          color: var(--color-text-soft);
        }

        .writing-access-pill {
          display: inline-flex;
          align-items: center;
          margin-left: .4rem;
          padding: .18rem .48rem;
          border-radius: 999px;
          border: 1px solid var(--color-border);
          color: var(--color-text-soft);
          font-size: .68rem;
          font-weight: 800;
          line-height: 1.2;
          white-space: nowrap;
        }

        .writing-access-pill.demo {
          border-color: color-mix(in srgb, var(--color-accent) 48%, var(--color-border));
          background: color-mix(in srgb, var(--color-accent) 16%, transparent);
          color: var(--color-accent);
        }

        .writing-access-pill.locked {
          border-color: color-mix(in srgb, #94a3b8 42%, var(--color-border));
          background: color-mix(in srgb, #94a3b8 10%, transparent);
        }

        .full-test-card {
          margin-top: 1.4rem;
          display: grid;
          gap: 1rem;
          align-items: center;
        }

        @media (min-width: 760px) {
          .full-test-card {
            grid-template-columns: 1.4fr auto;
          }
        }

/* Sleek 3-D pill button */
.mock-test-btn.sleek {
          position: relative;
  padding: 1rem 1.9rem;
  letter-spacing: .2px;
  box-shadow:
    0 10px 24px rgba(0,0,0,.35),      /* soft depth */
    inset 0 1px 0 rgba(255,255,255,.06),   /* faint top highlight */
    inset 0 -8px 14px rgba(0,0,0,.25);     /* inner shading for curvature */
  transition:
    transform .18s ease,
    box-shadow .18s ease,
    border-color .18s ease,
    background .18s ease,
    color .18s ease;
  cursor: pointer;
}

/* Subtle base "shadow plate" instead of chunky yellow bar */
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

/* Hover (only on devices that support hover) */
@media (hover: hover) and (pointer: fine) {
  .mock-test-btn.sleek:hover {
    transform: translateY(-3px);
    box-shadow:
      0 16px 28px rgba(0,0,0,.38),
      inset 0 1px 0 rgba(255,255,255,.08),
      inset 0 -6px 12px rgba(0,0,0,.22),
      0 0 0 2px rgba(255,207,64,.08); /* soft glow */
  }
  .mock-test-btn.sleek:hover::after {
    bottom: -8px;
    opacity: .95;
  }
}

/* Active press */
.mock-test-btn.sleek:active {
  transform: translateY(0);
  box-shadow:
    0 8px 18px rgba(0,0,0,.30),
    inset 0 1px 0 rgba(255,255,255,.05),
    inset 0 -4px 10px rgba(0,0,0,.28);
}

/* Focus ring for keyboard users */
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
