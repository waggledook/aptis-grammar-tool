import React from "react";

export default function MainMenu({ onSelect }) {
  return (
    <div className="menu-wrapper">
      <h1 className="menu-title">Seif Aptis Trainer</h1>
      <p className="menu-sub">Choose a practice area to begin.</p>

      <div className="menu-grid">
        {/* Grammar */}
<button className="menu-card" onClick={() => onSelect('grammar')}>
  <h3>Grammar Practice</h3>
  <p>Gap-fills by level & tag (A2–C1). Track mistakes & favourites.</p>
</button>

{/* Single Reading entry → sub-menu you already have */}
<button className="menu-card" onClick={() => onSelect('readingMenu')}>
  <h3>Reading: Sentence Order</h3>
  <p>Aptis Part 2 — choose Guided Lesson or Practice Activities.</p>
</button>

{/* Speaking entry → sub-menu */}
<button className="menu-card" onClick={() => onSelect('speakingMenu')}>
  <h3>Speaking Practice</h3>
  <p>Aptis Part 2 — describe a photo and answer follow-up questions.</p>
</button>
      </div>

      <style>{`
        .menu-title { margin:.25rem 0 .25rem; }
        .menu-sub { opacity:.85; margin:0 0 1rem; }
        .menu-grid { display:grid; gap:1rem; grid-template-columns:1fr; }
        @media (min-width: 920px){ .menu-grid { grid-template-columns: repeat(2, 1fr); } }
        .menu-card {
          background:#13213b; border:1px solid #2c4b83; color:#e6f0ff;
          border-radius:14px; padding:1rem; text-align:left; cursor:pointer;
          transition: transform .08s ease, box-shadow .08s ease, border-color .08s;
        }
        .menu-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0,0,0,.25);
          border-color:#4a79d8;
        }
        .menu-card h3 { margin:.1rem 0 .35rem; }
        .menu-card p { margin:0; opacity:.9; }
      `}</style>
    </div>
  );
}
