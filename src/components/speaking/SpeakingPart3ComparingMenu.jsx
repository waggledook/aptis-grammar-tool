// src/components/speaking/SpeakingPart3ComparingMenu.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import UnderConstructionPanel from "../common/UnderConstructionPanel";

export default function SpeakingPart3ComparingMenu() {
  const navigate = useNavigate();

  const goTo = (path) => {
    navigate(path);
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // or "smooth" if you prefer
    });
  };

  return (
    <div className="game-wrapper speaking-guide">
      <Seo
        title="Speaking Part 3 – Comparing Photos | Seif Aptis Trainer"
        description="Hub for Aptis Speaking Part 3: comparing photos. Useful phrases, similarities & differences practice, and comparative structures."
      />

      <header className="header">
        <div>
          <h2 className="title">Speaking – Part 3: Comparing Photos</h2>
          <p className="intro">
            In Part 3 you describe and compare two pictures, then answer extra
            questions. Use this mini hub to explore useful language and
            practise expressing similarities and differences.
          </p>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => navigate("/speaking")}>
            ← Back to speaking menu
          </button>
        </div>
      </header>

      <UnderConstructionPanel
        title="Comparing photos guide in progress"
        message="We’re still adding more practice tasks, model answers, and extra examples for Part 3. You can already use the useful language and similarities practice sections."
      />

      <section className="panel">
        <h3>What you’ll practise</h3>
        <ul className="bullets">
          <li>Starting a comparison clearly and naturally</li>
          <li>Talking about <strong>similarities and differences</strong></li>
          <li>Using <strong>comparative structures</strong> more precisely</li>
          <li>Preparing language for exam-style Part 3 questions</li>
        </ul>
      </section>

      <section className="panel">
        <h3>Choose a section</h3>
        <div className="grid-menu">
          <button
            className="menu-card"
            onClick={() => goTo("/speaking/part3-comparing/language")}
          >
            <h4>Useful language</h4>
            <p>
              Key phrases for comparing photos: both…, unlike…, compared to…,
              as… as…, not quite as….
            </p>
          </button>

          <button
            className="menu-card"
            onClick={() => goTo("/speaking/part3-comparing/similarities")}
          >
            <h4>Similarities &amp; differences</h4>
            <p>
              Practise saying one similarity and one difference for different
              picture situations.
            </p>
          </button>

                    {/* Comparatives – coming soon */}
                    <button
            className="menu-card disabled"
            type="button"
            disabled
          >
            <h4>
              Comparative structures{" "}
              <span className="soon">Coming soon</span>
            </h4>
            <p>
              This section will help you use far/much more…, slightly less…,
              nowhere near as…, not quite as… as… when comparing pictures.
            </p>
          </button>


          {/* Optional future section */}
          {/* <button
            className="menu-card disabled"
            type="button"
            disabled
          >
            <h4>Pros &amp; cons (coming soon)</h4>
            <p>Language for advantages, disadvantages and choosing the best option.</p>
          </button> */}
        </div>
      </section>

      {/* ===== Styles (scoped to speaking-guide) ===== */}
<style>{`
  .speaking-guide {
    --panel: #13213b;
    --ink: #e6f0ff;
    --muted: #a9b7d1;
    --accent: #f6d365;
    color: var(--ink);
  }

  .speaking-guide .header {
    margin-bottom: 1rem;
  }

  .speaking-guide .title {
    margin: 0;
    font-size: 1.5rem;
    color: var(--accent);
  }

  .speaking-guide .intro {
    margin: 0.25rem 0 0;
    color: var(--muted);
    max-width: 700px;
  }

  .speaking-guide .actions {
    margin-top: 0.75rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .guide-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* Panels */
  .speaking-guide .panel {
    background: var(--panel);
    border: 1px solid #2c4b83;
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 0.2rem;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  }

  .speaking-guide .panel h2 {
    font-size: 1.15rem;
    margin: 0 0 0.35rem;
    color: var(--accent);
  }

  .speaking-guide .panel h3 {
    margin: 0 0 0.35rem;
    color: var(--ink);
  }

  .speaking-guide .panel-text {
    margin-bottom: 0.75rem;
    color: var(--muted);
  }

  .bullets {
    padding-left: 1.1rem;
    font-size: 0.9rem;
    color: var(--ink);
  }

  .bullets li + li {
    margin-top: 0.2rem;
  }

  /* Menu grid */
  .speaking-guide .grid-menu {
    display: grid;
    gap: 1rem;
    margin-top: 0.75rem;
  }

  @media (min-width: 720px) {
    .speaking-guide .grid-menu {
      grid-template-columns: 1fr 1fr;
    }
  }

  .speaking-guide .menu-card {
    background: #0f1b31;
    border: 1px solid #2c416f;
    border-radius: 12px;
    padding: 0.9rem;
    text-align: left;
    cursor: pointer;
    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      transform 0.08s ease;
  }

  .speaking-guide .menu-card:hover {
    background: #182c52;
    border-color: #3a6ebd;
    transform: translateY(-1px);
  }

  .speaking-guide .menu-card h4 {
    margin: 0 0 0.3rem;
    font-size: 1.05rem;
    color: #cfe1ff;
    display: flex;
    gap: 0.5rem;
    align-items: baseline;
  }

  .speaking-guide .menu-card p {
    margin: 0;
    color: var(--muted);
  }

  .speaking-guide .menu-card.disabled {
    opacity: 0.6;
    cursor: default;
    pointer-events: none;
    border-style: dashed;
    border-color: #2a3d67;
  }

  .speaking-guide .soon {
    background: #5b8ff2;
    color: #0b1730;
    font-weight: 700;
    padding: 0.05rem 0.4rem;
    border-radius: 999px;
    font-size: 0.75rem;
    letter-spacing: 0.02em;
  }

  /* Phrase boxes (for useful language screens) */
  .phrases-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0.75rem;
  }

  .phrase-box {
    background: #0f1b31;
    border-radius: 0.75rem;
    padding: 0.6rem 0.7rem;
    border: 1px solid #2c416f;
  }

  .phrase-box h3 {
    font-size: 0.95rem;
    margin-bottom: 0.3rem;
    color: var(--ink);
  }

  .phrase-box ul {
    margin: 0;
    padding-left: 1.1rem;
    font-size: 0.9rem;
    color: var(--ink);
  }

  .phrase-box li + li {
    margin-top: 0.15rem;
  }

  .tip {
    margin-top: 0.7rem;
    font-size: 0.9rem;
    color: #d1fae5;
  }

  /* Buttons */
  .speaking-guide .btn {
    background: #24365d;
    border: 1px solid #335086;
    color: var(--ink);
    padding: 0.45rem 0.7rem;
    border-radius: 10px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .speaking-guide .btn.primary {
    background: #294b84;
    border-color: #3a6ebd;
    color: var(--ink);
    font-weight: 600;
  }

  .speaking-guide .btn.tiny {
    padding: 0.25rem 0.65rem;
    font-size: 0.8rem;
    border-radius: 999px;
    background: #24365d;
    border: 1px solid #335086;
  }

  .speaking-guide .btn.tiny.ghost {
    background: transparent;
    border: 1px solid #335086;
  }

  /* Mobile tweaks */
  @media (max-width: 600px) {
    .speaking-guide .title {
      font-size: 1.3rem;
    }

    .game-wrapper.speaking-guide {
      width: 100%;
      max-width: 100%;
      overflow-x: hidden;
    }

    .speaking-guide .panel {
      width: 100%;
      box-sizing: border-box;
    }
  }
`}</style>
    </div>
  );
}
