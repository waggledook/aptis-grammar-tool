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
  onClick={() => onSelect("part4")}
>
  <h3>Part 4: Emails</h3>
  <p>Write two emails: an informal one (40–50 words) and a formal one (120–150 words).</p>
</button>
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
      `}</style>
    </div>
  );
}
