// src/components/speaking/SpeakingMenu.jsx
import React from "react";

export default function SpeakingMenu({ onSelect, onBack }) {
  return (
    <div className="speaking-menu game-wrapper">
      <header className="header">
        <h2 className="title">Speaking</h2>
        <p className="intro">
          Practise Aptis Speaking. Start with Part 2 (describe a photograph). Other parts coming soon.
        </p>
      </header>

      <div className="cards">
        <button className="card" onClick={() => onSelect('part2')}>
          <h3>Part 2: Describe a Photograph</h3>
          <p>1 picture · 3 questions. Q1 is always “Describe the photograph.”</p>
        </button>

        <button className="card" onClick={() => onSelect('part3')}>
          <h3>Part 3: Describe & Compare</h3>
          <p>Compare two photographs. Three questions, 45s each.</p>
        </button>

        <div className="card disabled" aria-disabled="true">
          <h3>Part 1: Personal Questions</h3>
          <p>Short answers about yourself. (Coming soon)</p>
        </div>

        <div className="card disabled" aria-disabled="true">
          <h3>Part 4: Presentation &amp; Discussion</h3>
          <p>Talk for longer with follow-up questions. (Coming soon)</p>
        </div>
      </div>

      <button className="topbar-btn" onClick={onBack} style={{ marginTop: '1rem' }}>
        ← Back to main menu
      </button>

      <style>{`
        .header { margin-bottom: 1rem; }
        .title { font-size: 1.6rem; margin-bottom: .3rem; }
        .intro { color: #a9b7d1; max-width: 600px; }
        .cards { display:grid; gap:1rem; grid-template-columns:1fr; }
        @media (min-width:720px){ .cards{ grid-template-columns: repeat(2,1fr);} }
        .card {
          background:#13213b; border:1px solid #2c4b83; border-radius:12px;
          color:#e6f0ff; padding:1rem; text-align:left; cursor:pointer;
          transition: transform .08s ease, box-shadow .08s ease, border-color .08s;
        }
        .card:hover { transform: translateY(-2px); box-shadow:0 6px 18px rgba(0,0,0,.25); border-color:#4a79d8; }
        .card h3 { margin:0 0 .35rem; }
        .card p { margin:0; color:#cfd9f3; }
        .card.disabled { cursor:default; opacity:.55; }
        .card.disabled:hover { transform:none; box-shadow:none; border-color:#2c4b83; }
      `}</style>
    </div>
  );
}
