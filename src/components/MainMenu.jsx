import React from "react";

export default function MainMenu({ onSelect }) {
  return (
    <div className="menu-wrapper">
      <header className="main-header" style={{ textAlign: "center", marginBottom: "0rem" }}>
  <img
    src="/images/seif-aptis-trainer-logo.png"
    alt="Seif Aptis Trainer Logo"
    className="menu-logo"
    draggable="false"
  />
</header>
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
  <p>Practice tasks for all parts of the speaking exam.</p>
</button>

{/* Writing entry → sub-menu */}
<button className="menu-card" onClick={() => onSelect('writingMenu')}>
  <h3>Writing Practice</h3>
  <p>Practise all parts of the Aptis Writing test, from short answers to full emails.</p>
</button>

<button className="menu-card" onClick={() => onSelect('profile')}>
  <h3>My Profile</h3>
  <p>See your progress and review saved work.</p>
</button>

      </div>

      <style>{`
  /* ——— Layout wrapper ——— */
  .menu-wrapper {
    /* tighten the whole block */
    padding-top: 0;
    margin-top: 0;
  }
  /* If your outer card adds unavoidable top padding, uncomment this nudge: */
  /* .menu-wrapper { margin-top: -0.5rem; } */

  /* ——— Logo header ——— */
  .main-header {
    /* force true centering regardless of parent layout */
    display: flex;
    justify-content: center;
    align-items: center;

    margin: 0;           /* no extra space */
    padding: 0;          /* no extra space */
    line-height: 0;      /* remove inline image line-box gap */
    text-align: center;  /* harmless with flex, keeps fallback sane */
  }

  .menu-logo {
    display: block;      /* removes baseline gap */
    width: clamp(200px, 24vw, 340px);
    height: auto;
    filter: drop-shadow(0 0 10px rgba(255,255,255,0.5))
            drop-shadow(0 0 18px rgba(255,165,0,0.35));
    animation: logoFade 1.2s ease both;
    transition: filter .3s ease;
    margin: 0;           /* ensure no default margins */
  }

  .menu-logo:hover {
    filter: drop-shadow(0 0 12px rgba(255,255,255,0.8))
            drop-shadow(0 0 25px rgba(255,165,0,0.5));
  }

  @keyframes logoFade {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }

  /* ——— Title + subtitle ——— */
  .menu-title { margin: .2rem 0 .2rem; }

  /* tighten paragraph directly below logo */
  .menu-sub {
    opacity: .85;
    margin-top: .2rem;     /* kill large default p top margin */
    margin-bottom: .6rem;  /* reduce gap before grid */
  }

  /* ——— Grid ——— */
  .menu-grid {
    margin-top: 0;
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
  }
  @media (min-width: 920px) {
    .menu-grid { grid-template-columns: repeat(2, 1fr); }
  }

  /* ——— Cards ——— */
  .menu-card {
    background: #13213b;
    border: 1px solid #2c4b83;
    color: #e6f0ff;
    border-radius: 14px;
    padding: 1rem;
    text-align: left;
    cursor: pointer;
    transition: transform .08s ease, box-shadow .08s ease, border-color .08s;
  }
  .menu-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0,0,0,.25);
    border-color: #4a79d8;
  }
  .menu-card h3 { margin: .1rem 0 .35rem; }
  .menu-card p  { margin: 0; opacity: .9; }
`}</style>


    </div>
  );
}
