// src/components/ReadingMenu.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "./common/Seo.jsx";
import AptisDemoBadge from "./access/AptisDemoBadge.jsx";

const GUIDE_CARDS = [
  {
    title: "Part 2 Guide: Sentence Order",
    description: "Learn how to spot cohesive clues and link ideas when reordering sentences.",
    path: "/reading/part2-guide",
    demoAccess: "demo",
  },
];

const PRACTICE_CARDS = [
  {
    title: "Part 1: Word Choices",
    description: "Choose the best word for each gap in short informal emails.",
    path: "/reading/part1",
    demoAccess: "demo",
  },
  {
    title: "Part 2: Sentence Order",
    description: "Reorder sentences to form a logical paragraph.",
    path: "/reading/part2",
    demoAccess: "demo",
  },
  {
    title: "Part 3: Matching Opinions",
    description: "Read four short comments and decide who says what.",
    path: "/reading/part3",
    demoAccess: "locked",
  },
  {
    title: "Part 4: Heading Matching",
    description: "Match headings to paragraphs. One heading is extra.",
    path: "/reading/part4",
    demoAccess: "demo",
  },
];

export default function ReadingMenu({ user, aptisAccess, onSignIn }) {
  const navigate = useNavigate();
  const [lockedPart, setLockedPart] = useState("");
  const isDemoMode = !!aptisAccess?.isDemoMode;

  function openCard(card) {
    if (isDemoMode && card.demoAccess === "locked") {
      setLockedPart(card.title);
      return;
    }

    navigate(card.path);
  }

  function renderAccessPill(card) {
    if (!isDemoMode || !card.demoAccess) return null;
    return (
      <span className={`reading-access-pill ${card.demoAccess === "demo" ? "demo" : "locked"}`}>
        {card.demoAccess === "demo" ? "Demo available" : "Full access"}
      </span>
    );
  }

  return (
    <div className="reading-menu game-wrapper menu-style-hub">
      <Seo
        title="Aptis Reading Practice | Seif Aptis Trainer"
        description="Practise Aptis Reading tasks, including sentence order (Part 2) and matching opinions (Part 3), plus a strategy guide for Part 2."
      />
      <header className="header">
        <h2 className="title">Reading Practice</h2>
        <p className="intro">
          Practise individual parts of the Aptis Reading test, or use the guide when you want support with sentence order.
        </p>
      </header>

      <AptisDemoBadge user={user} aptisAccess={aptisAccess} onSignIn={onSignIn} />

      {isDemoMode && lockedPart ? (
        <div className="reading-access-prompt" role="status">
          <strong>{lockedPart} is included with full access.</strong>
          <p>The reading demo currently includes two Part 1 tasks, two Part 2 tasks and one Part 4 task.</p>
        </div>
      ) : null}

      <section className="menu-section guides">
        <div className="section-header">
          <h3>Guide</h3>
          <p>Get support with the main strategy guide currently available in reading.</p>
        </div>
        <div className="cards guide-cards">
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
          <p>Practise the reading parts directly in exam-style tasks.</p>
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

      {/* Back to main menu */}
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

        .reading-access-prompt {
          margin: 0 0 1rem;
          padding: .8rem .95rem;
          border-radius: 12px;
          border: 1px solid color-mix(in srgb, var(--color-accent) 42%, var(--color-border));
          background:
            linear-gradient(100deg, color-mix(in srgb, var(--color-accent) 14%, var(--color-surface-raised)), var(--color-surface-raised));
        }

        .reading-access-prompt strong {
          display: block;
          margin-bottom: .2rem;
          color: var(--color-text);
        }

        .reading-access-prompt p {
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
          .cards {
            grid-template-columns: repeat(2,1fr);
          }
        }

        .guide-cards {
          grid-template-columns: 1fr;
        }

        @media (min-width:720px){
          .guide-cards {
            grid-template-columns: minmax(280px, 420px);
          }
        }

        .card h3 {
          margin:0 0 .35rem;
          display:flex;
          align-items:center;
          flex-wrap:wrap;
          gap:.35rem;
        }

        .reading-access-pill {
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

        .reading-access-pill.demo {
          border-color: color-mix(in srgb, var(--color-accent) 48%, var(--color-border));
          background: color-mix(in srgb, var(--color-accent) 16%, transparent);
          color: var(--color-accent);
        }

        .reading-access-pill.locked {
          border-color: color-mix(in srgb, #94a3b8 42%, var(--color-border));
          background: color-mix(in srgb, #94a3b8 10%, transparent);
        }

        .card p {
          margin:0;
          color:#cfd9f3;
        }

      `}</style>
    </div>
  );
}
