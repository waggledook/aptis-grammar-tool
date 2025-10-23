import React from "react";

/**
 * Main Writing Part 4 Guide
 * Overview of the task + navigation to subsections
 */
export default function WritingPart4Guide({ onBack, onOpen }) {
  const comingSoon = () => {}; // inert for disabled cards

  return (
    <div className="writing-p4-main game-wrapper">
      <StyleScope />

      <header className="header">
        <div>
          <h2 className="title">Writing – Part 4 Guide</h2>
          <p className="intro">
            In this final part of the Aptis Advanced Writing test, you respond to a short message by writing
            <br />• an <strong>informal email</strong> (≈ 50 words) to a <strong>friend</strong>, and
            <br />• a <strong>formal email</strong> (≈ 120–150 words) to a <strong>club, committee or organisation</strong>.
          </p>
          <p className="intro">
            There’s no fixed timing for each email, but most candidates spend about <strong>30 minutes in total</strong> —
            roughly 10 minutes for the informal and 20 minutes for the formal message.
          </p>
        </div>
        <div className="actions">
          <button className="btn" onClick={onBack}>← Back</button>
        </div>
      </header>

      <section className="panel">
        <h3>What you’ll learn in this guide</h3>
        <ul className="bullets">
          <li>Understand the <strong>task format</strong> and what examiners look for</li>
          <li>Practise choosing the correct <strong>register & tone</strong></li>
          <li>Organise your ideas clearly and <strong>structure</strong> both emails</li>
          <li>Use <strong>useful phrases</strong> for opinions, suggestions, and requests</li>
          <li>Practise <strong>paraphrasing</strong> and responding precisely to the input text</li>
          <li>Try a full <strong>practice task</strong> with feedback</li>
        </ul>
      </section>

      <section className="panel">
        <h3>Choose a section to explore</h3>
        <div className="grid-menu">
          {/* ACTIVE: Register & Tone */}
          <button className="menu-card" onClick={() => onOpen("register")}>
            <h4>Register &amp; Tone</h4>
            <p>Distinguish between formal and informal language; adapt tone to audience.</p>
          </button>

          {/* ACTIVE: Practice (opens Part 4 Emails tool) */}
          <button className="menu-card" onClick={() => onOpen("practice")}>
            <h4>Practice: Part 4 Emails</h4>
            <p>Write the informal and formal emails using the live Part 4 tool.</p>
          </button>

          {/* DISABLED: Error correction */}
          <button className="menu-card disabled" onClick={comingSoon} aria-disabled="true" tabIndex={-1}>
            <h4>
              Error Correction <span className="soon">Coming soon</span>
            </h4>
            <p>Fix typical mistakes in email tasks (register, tone, linking, grammar).</p>
          </button>

          {/* DISABLED: Model emails */}
          <button className="menu-card disabled" onClick={comingSoon} aria-disabled="true" tabIndex={-1}>
            <h4>
              Model Emails <span className="soon">Coming soon</span>
            </h4>
            <p>Study complete examples with strong phrasing and clear structure.</p>
          </button>
        </div>
      </section>
    </div>
  );
}

function StyleScope() {
  return (
    <style>{`
      .writing-p4-main { --panel:#13213b; --ink:#e6f0ff; --muted:#a9b7d1; color:var(--ink); }
      .title{margin:0;font-size:1.4rem}
      .intro{color:var(--muted)}
      .actions{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.5rem}
      .btn{background:#24365d;border:1px solid #335086;color:var(--ink);padding:.45rem .7rem;border-radius:10px;cursor:pointer}

      .panel{background:#13213b;border:1px solid #2c4b83;border-radius:12px;padding:1rem;margin-bottom:1rem}
      .bullets{margin:.3rem 0 0 1.2rem}
      .grid-menu{display:grid;gap:1rem;margin-top:.75rem}
      @media(min-width:720px){.grid-menu{grid-template-columns:1fr 1fr}}

      .menu-card{
        background:#0f1b31;border:1px solid #2c416f;border-radius:12px;padding:.9rem;
        text-align:left;cursor:pointer;transition:background .2s ease,border-color .2s ease, transform .08s ease;
      }
      .menu-card:hover{background:#182c52;border-color:#3a6ebd; transform: translateY(-1px);}
      .menu-card h4{margin:0 0 .3rem;font-size:1.05rem;color:#cfe1ff;display:flex;gap:.5rem;align-items:baseline}
      .menu-card p{margin:0;color:var(--muted)}
      .soon{
        background:#5b8ff2; color:#0b1730; font-weight:700;
        padding:.05rem .4rem; border-radius:999px; font-size:.75rem; letter-spacing:.02em;
      }
      .menu-card.disabled{
        opacity:.6; cursor:default; pointer-events:none;
        border-style:dashed; border-color:#2a3d67;
      }
    `}</style>
  );
}
