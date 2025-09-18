// src/components/ReadingMenu.jsx
import React from "react";

export default function ReadingMenu({ onSelect, onBack }) {
  return (
    <div className="reading-menu game-wrapper">
      <header className="header">
        <h2 className="title">Reading – Sentence Order</h2>
        <p className="intro">
          Practise Aptis Part 2. Choose a guided lesson with explanations, or
          exam-style practice activities.
        </p>
      </header>

      <div className="cards">
        <button className="card" onClick={() => onSelect('readingGuide')}>
          <h3>Guided Lesson</h3>
          <p>Spot cohesive clues, then reorder with support.</p>
        </button>

        <button className="card" onClick={() => onSelect('reading')}>
          <h3>Practice Activities</h3>
          <p>Full reorder tasks without hints.</p>
        </button>
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
      `}</style>
    </div>
  );
}
