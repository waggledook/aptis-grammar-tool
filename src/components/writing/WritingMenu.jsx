// src/components/writing/WritingMenu.jsx
import React from "react";

export default function WritingMenu({ onSelect, onBack }) {
  function comingSoon() {
    alert("Coming soon! Parts 2–4 will be available shortly.");
  }

  return (
    <div className="writing-menu game-wrapper">
      <header className="header">
        <h2 className="title">Writing</h2>
        <p className="intro">
          Practise Aptis Writing tasks (Parts 1–4). Start short, build up to full emails.
        </p>
      </header>

      <div className="cards">
        <button className="card" onClick={() => onSelect("part1")}>
          <h3>Part 1: Word-level writing</h3>
          <p>Answer 5 short messages with single words or short phrases. Fast and focused.</p>
        </button>

        <button className="card" onClick={() => onSelect("part1Guide")}>
  <h3>Part 1 Guide</h3>
  <p>How to write effective 1–5 word answers, with mini-practice.</p>
</button>

        <button className="card disabled" onClick={comingSoon}>
          <h3>Part 2: Short text  <span className="soon">Coming soon</span></h3>
          <p>Fill a short form or write a short sentence response (20–30 words).</p>
        </button>

        <button className="card disabled" onClick={comingSoon}>
          <h3>Part 3: Three responses  <span className="soon">Coming soon</span></h3>
          <p>Reply to three social-style messages. Keep each answer to 30–40 words.</p>
        </button>

        <button
    className="card"
    onClick={() => onSelect("part4Guide")}
  >
    <h3>Part 4 Guide</h3>
    <p>Understand the task and explore Register, Structure, Language, and more.</p>
  </button>

        <button
  className="card"
  onClick={() => onSelect("part4")}
>
  <h3>Part 4: Emails</h3>
  <p>Write two emails: an informal one (40–50 words) and a formal one (120–150 words).</p>
</button>


      </div>

{/* External mock test link */}
<div className="mock-test-link">
  <a
    href="https://aptis-gen.writing1.beeskillsenglish.com/"
    target="_blank"
    rel="noopener noreferrer"
    className="mock-test-btn sleek"
  >
    🚀 Try a complete writing test in exam conditions!
  </a>
</div>


      <button className="topbar-btn" onClick={onBack} style={{ marginTop: "1rem" }}>
        ← Back to main menu
      </button>

      <style>{`
        .header { margin-bottom: 1rem; }
        .title { font-size: 1.6rem; margin-bottom: .3rem; }
        .intro { color: #a9b7d1; max-width: 640px; }

        .cards { display:grid; gap:1rem; grid-template-columns:1fr; }
        @media (min-width:720px){ .cards{ grid-template-columns: repeat(2,1fr);} }

        .card {
          background:#13213b; border:1px solid #2c4b83; border-radius:12px;
          color:#e6f0ff; padding:1rem; text-align:left; cursor:pointer;
          transition: transform .08s ease, box-shadow .08s ease, border-color .08s;
        }
        .card:hover {
          transform: translateY(-2px);
          box-shadow:0 6px 18px rgba(0,0,0,.25);
          border-color:#4a79d8;
        }

        .card h3 { margin:0 0 .35rem; display:flex; align-items:center; flex-wrap:wrap; gap:.35rem; }
        .card p { margin:0; color:#cfd9f3; }

        .card.disabled {
          cursor:default;
          opacity:.55;
        }
        .card.disabled:hover {
          transform:none;
          box-shadow:none;
          border-color:#2c4b83;
        }

        .soon {
          font-size:.75em;
          background:#2c4b83;
          color:#fff;
          padding:.1rem .45rem;
          border-radius:6px;
          text-transform:uppercase;
          letter-spacing:.03em;
        }
          .mock-test-link {
  margin-top: 1.8rem;
  text-align: center;
}

/* Container */
.mock-test-link {
  margin-top: 1.6rem;
  text-align: center;
}

/* Sleek 3-D pill button */
.mock-test-btn.sleek {
  position: relative;
  display: inline-block;
  padding: 1rem 1.6rem;
  border-radius: 16px;
  text-decoration: none;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: .2px;
  color: #ffcf40;                     /* honey accent */
  background: linear-gradient(180deg, #0e1a2f 0%, #1a2b4a 100%);  /* navy → deeper navy */
  border: 1px solid rgba(255, 207, 64, 0.75);                     /* subtle honey rim */
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
    border-color: rgba(255, 207, 64, 0.95);
    color: #ffe07a;
    background: linear-gradient(180deg, #142444 0%, #21365f 100%);
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
