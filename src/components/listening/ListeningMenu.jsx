import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import AptisDemoBadge from "../access/AptisDemoBadge.jsx";

const LISTENING_CARDS = [
  {
    title: "Part 1: Information Recognition (Q1-13)",
    description: "Multiple choice extracts.",
    path: "/listening/part1",
    demoAccess: "demo",
  },
  {
    title: "Part 2: Information Matching (Q14)",
    description: "Matching speakers.",
    path: "/listening/part2",
    demoAccess: "demo",
  },
  {
    title: "Part 3: Inference - Discussion (Q15)",
    description: "Opinion matching.",
    path: "/listening/part3",
    demoAccess: "locked",
  },
  {
    title: "Part 4: Inference - Longer Monologues (Q16-17)",
    description: "Multiple-choice extracts.",
    path: "/listening/part4",
    demoAccess: "locked",
  },
];

export default function ListeningMenu({ user, aptisAccess, onSignIn }) {
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
      <span className={`listening-access-pill ${card.demoAccess === "demo" ? "demo" : "locked"}`}>
        {card.demoAccess === "demo" ? "Demo available" : "Full access"}
      </span>
    );
  }

  return (
    <div className="listening-menu game-wrapper menu-style-hub">
      <Seo
        title="Aptis Listening Practice | Seif Aptis Trainer"
        description="Practise all parts of the Aptis Listening test: multiple-choice extracts, speaker matching, opinion matching and longer monologues."
      />

      <header className="header">
        <h2 className="title">Listening</h2>
        <p className="intro">
          Practise Aptis Listening Tasks parts 1 to 4.
        </p>
      </header>

      <AptisDemoBadge user={user} aptisAccess={aptisAccess} onSignIn={onSignIn} />

      {isDemoMode && lockedItem ? (
        <div className="listening-access-prompt" role="status">
          <strong>{lockedItem} is included with full access.</strong>
          <p>The listening demo includes three Part 1 questions and one Part 2 sample task.</p>
        </div>
      ) : null}

      <div className="cards">
        {LISTENING_CARDS.map((card) => (
          <button className="card" key={card.path} onClick={() => openCard(card)}>
            <h3>{card.title}{renderAccessPill(card)}</h3>
            <p>{card.description}</p>
          </button>
        ))}
      </div>

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
  .intro { color: #a9b7d1; max-width: 600px; }

  .listening-access-prompt {
    margin: 0 0 1rem;
    padding: .8rem .95rem;
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--color-accent) 42%, var(--color-border));
    background:
      linear-gradient(100deg, color-mix(in srgb, var(--color-accent) 14%, var(--color-surface-raised)), var(--color-surface-raised));
  }

  .listening-access-prompt strong {
    display: block;
    margin-bottom: .2rem;
    color: var(--color-text);
  }

  .listening-access-prompt p {
    margin: 0;
    color: var(--color-text-soft);
    line-height: 1.38;
    font-size: .9rem;
  }

  .cards { display:grid; gap:1rem; grid-template-columns:1fr; }
  @media (min-width:720px){ .cards{ grid-template-columns: repeat(2,1fr);} }

  .card-head{
    display:flex;
    justify-content:space-between;
    align-items:center;
    flex-wrap:wrap;
    gap:.6rem;
    margin-bottom:.35rem;
  }

  .card h3 {
    margin:0;
    font-size:1.05rem;
    font-weight:600;
    display:flex;
    align-items:center;
    flex-wrap:wrap;
    gap:.4rem;
  }
  .card p { margin:0; color:#cfd9f3; font-size:.9rem; line-height:1.4; }

  .listening-access-pill {
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

  .listening-access-pill.demo {
    border-color: color-mix(in srgb, var(--color-accent) 48%, var(--color-border));
    background: color-mix(in srgb, var(--color-accent) 16%, transparent);
    color: var(--color-accent);
  }

  .listening-access-pill.locked {
    border-color: color-mix(in srgb, #94a3b8 42%, var(--color-border));
    background: color-mix(in srgb, #94a3b8 10%, transparent);
  }

  /* Coming soon: dim + dashed (CollocationMenu style) */
  .soon-card{
    opacity:.65;
    background:#1a2747;
    border:1px dashed #3a5ba0;
  }
  .soon-card:hover{
    transform:none;
    box-shadow:none;
    border-color:#3a5ba0;
  }

  .soon-pill{
    background:#24365d;
    border:1px solid #37598e;
    color:#9eb7e5;
    font-size:.75rem;
    line-height:1.2;
    padding:.2rem .5rem;
    border-radius:999px;
    font-weight:600;
    white-space:nowrap;
  }

  /* Optional: use this if you add a “Live” pill to Part 3 */
  .live-pill{
    background: rgba(46, 125, 79, 0.18);
    border: 1px solid rgba(46, 125, 79, 0.55);
    color: #8ee6b5;
    font-size: .75rem;
    line-height: 1.2;
    padding: .2rem .5rem;
    border-radius: 999px;
    font-weight: 600;
    white-space: nowrap;
  }
`}</style>
    </div>
  );
}
