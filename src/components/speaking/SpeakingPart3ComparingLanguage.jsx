// src/components/speaking/SpeakingPart3ComparingLanguage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../common/Seo.jsx";

export default function SpeakingPart3ComparingLanguage() {
  const navigate = useNavigate();

  return (
    <div className="game-wrapper speaking-guide">
      <Seo
        title="Comparing Photos – Useful Language | Seif Aptis Trainer"
        description="Key phrases for Aptis Speaking Part 3: expressing similarities, differences and using comparative structures when comparing two pictures."
      />

      <header className="header">
        <div>
          <h2 className="title">Useful language for comparing photos</h2>
          <p className="intro">
            Here are practical phrases you can use in Aptis Speaking Part 3 to
            compare two pictures. Try to mix them in naturally instead of
            repeating the same structure every time.
          </p>
        </div>
        <div className="actions">
          <button
            className="btn"
            onClick={() => navigate("/speaking/part3-comparing")}
          >
            ← Back to Comparing Menu
          </button>
        </div>
      </header>

      {/* A. Starting your comparison */}
      <section className="panel">
        <h3>A. Starting your comparison</h3>
        <p className="lead">
          Use these to start speaking about both pictures in a clear, simple
          way:
        </p>
        <ul className="bullets">
          <li>Both pictures show…</li>
          <li>In both pictures we can see…</li>
          <li>In both cases, there are…</li>
          <li>They both involve…</li>
          <li>The main focus in each picture is…</li>
        </ul>
      </section>

      {/* B. Talking about similarities */}
      <section className="panel">
        <h3>B. Expressing similarities</h3>
        <p className="lead">
          Use these when the pictures have something in common:
        </p>
        <ul className="bullets">
          <li>Both pictures show people…</li>
          <li>In both pictures, the people seem to be…</li>
          <li>They both seem to…, because…</li>
          <li>A common feature is that…</li>
          <li>What they have in common is…</li>
          <li>Another similarity is that…</li>
        </ul>
        <p className="example">
          <strong>Example:</strong> Both pictures show people working with
          technology, but in different situations.
        </p>
      </section>

      {/* C. Talking about differences */}
      <section className="panel">
        <h3>C. Expressing differences</h3>
        <p className="lead">Use these to contrast the two photos:</p>
        <ul className="bullets">
          <li>One difference is that in the first picture…, whereas in the second…</li>
          <li>Unlike the first picture, the second one shows…</li>
          <li>Compared to the first picture, the second one looks…</li>
          <li>The first picture focuses more on…, while the second highlights…</li>
          <li>The setting in the first picture is…, in contrast to…</li>
        </ul>
        <p className="example">
          <strong>Example:</strong> In the first picture the people are indoors,
          whereas in the second they are outside.
        </p>
      </section>

      {/* D. Comparative structures */}
      <section className="panel">
        <h3>D. Comparative structures</h3>
        <p className="lead">
          These help you show how big or small the difference is:
        </p>
        <ul className="bullets">
          <li>
            <strong>Stronger difference:</strong> far / much / a lot + comparative
            <br />
            <span className="inline-example">
              Living alone is <strong>far more</strong> expensive than sharing a flat.
            </span>
          </li>
          <li>
            <strong>Smaller difference:</strong> slightly / a little / a bit + comparative
            <br />
            <span className="inline-example">
              The first picture seems <strong>slightly more</strong> relaxing than the second.
            </span>
          </li>
          <li>
            <strong>Equal comparison:</strong> as… as…
            <br />
            <span className="inline-example">
              The activities in both pictures look <strong>as interesting as</strong> each other.
            </span>
          </li>
          <li>
            <strong>Not fully equal:</strong> not quite as… as…
            <br />
            <span className="inline-example">
              The second picture doesn’t look <strong>quite as</strong> busy as the first.
            </span>
          </li>
          <li>
            <strong>Very different:</strong> nowhere near as… / not nearly as…
            <br />
            <span className="inline-example">
              The second picture is <strong>nowhere near as</strong> crowded as the first one.
            </span>
          </li>
        </ul>
      </section>

      {/* E. Linking words for comparing */}
      <section className="panel">
        <h3>E. Linking words for comparing</h3>
        <p className="lead">These help your comparison sound more organised:</p>
        <ul className="bullets">
          <li>
            <strong>To contrast:</strong> whereas, while, however, on the other hand, by
            contrast, in contrast
          </li>
          <li>
            <strong>To show similarity:</strong> similarly, likewise, in the same way
          </li>
        </ul>
        <p className="example">
          <strong>Example:</strong> Both pictures show people studying.{" "}
          <em>However</em>, in the first picture they are in a classroom,
          whereas in the second they are at home.
        </p>
      </section>

      {/* F. Speculating and evaluating (Part 3 flavour) */}
      <section className="panel">
        <h3>F. Speculating and evaluating</h3>
        <p className="lead">
          In Part 3 you often need to guess and give opinions as you compare:
        </p>
        <ul className="bullets">
          <li>
            <strong>Speculating:</strong> might be…, could be…, seem to be…, it looks like…
          </li>
          <li>
            <strong>Evaluating:</strong> I would say…, it seems to me that…, perhaps the main
            difference is…, the most important similarity is…
          </li>
          <li>
            <strong>Deciding:</strong> overall, I think…, if I had to choose, I’d say…, this
            would be better for…
          </li>
        </ul>
        <p className="example">
          <strong>Example:</strong> In both pictures the people are working, but in different
          ways. The first picture might be an office, whereas the second could be a home
          workspace. Overall, I think the second situation looks more comfortable.
        </p>
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
