// src/components/speaking/SpeakingPart3Comparatives.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../common/Seo.jsx";

function normalise(text) {
  return text.trim().toLowerCase().replace(/\s+/, " ");
}

// --- Data sets -------------------------------------------------------

const BASIC_ITEMS = [
  {
    id: "basic1",
    label: "Basic 1",
    gap: "The man in the first picture looks ___ than the man in the second picture.",
    words: 1,
    answers: ["younger"],
    explanation:
      "Use a regular comparative: young → younger, old → older, etc.",
  },
  {
    id: "basic2",
    label: "Basic 2",
    gap: "The first picture seems ___ than the second one.",
    words: 1,
    answers: ["busier", "more crowded"],
    explanation:
      "You can say 'busier' or 'more crowded' to show there are more people or activity.",
  },
  {
    id: "basic3",
    label: "Basic 3",
    gap: "Working at home looks ___ comfortable than working in the office.",
    words: 1,
    answers: ["more"],
    explanation: "Use 'more' with longer adjectives: more comfortable / more interesting.",
  },
];

const NOT_AS_ITEMS = [
  {
    id: "notas1",
    label: "Not as … as 1",
    // base idea: The office is noisier than the home.
    gap: "The home office is not as ___ as the open-plan office.",
    words: 1,
    answers: ["noisy"],
    explanation:
      "We can change 'The open-plan office is noisier than the home office' to 'The home office is not as noisy as the open-plan office.'",
  },
  {
    id: "notas2",
    label: "Not as … as 2",
    // base idea: The market is more crowded than the shopping centre.
    gap: "The shopping centre is not as ___ as the street market.",
    words: 1,
    answers: ["crowded", "busy"],
    explanation:
      "Here we flip the idea: 'The street market is more crowded than the shopping centre' → 'The shopping centre is not as crowded as the street market.'",
  },
  {
    id: "notas3",
    label: "Not as … as 3",
    // base idea: The library is quieter than the café.
    gap: "The café is not as ___ as the library.",
    words: 1,
    answers: ["quiet"],
    explanation:
      "Not as + adjective + as lets you compare in the opposite direction.",
  },
];

const MODIFIER_ITEMS = [
  {
    id: "mod1",
    label: "Modifier 1",
    gap: "The rush-hour traffic in the first picture looks ___ worse than in the second picture.",
    words: 1,
    answers: ["far", "much", "a lot"],
    explanation:
      "Use 'far', 'much' or 'a lot' to show a big difference: far worse, much worse, a lot worse.",
  },
  {
    id: "mod2",
    label: "Modifier 2",
    gap: "The second picture seems ___ more relaxed than the first one.",
    words: 1,
    answers: ["slightly", "a little", "a bit"],
    explanation:
      "Use 'slightly', 'a little' or 'a bit' to show a small difference.",
  },
  {
    id: "mod3",
    label: "Modifier 3",
    gap: "The group in the first picture is ___ as interested as the group in the second picture.",
    words: 1,
    answers: ["just"],
    explanation:
      "'Just as… as…' means the level is the same: just as interested, just as busy, just as important.",
  },
  {
    id: "mod4",
    label: "Modifier 4",
    gap: "The second picture is ___ as noisy as the first one – it looks much calmer.",
    words: 2,
    answers: ["nowhere near", "not nearly"],
    explanation:
      "'Nowhere near as… as…' and 'not nearly as… as…' show a very big difference.",
  },
  {
    id: "mod5",
    label: "Modifier 5",
    gap: "The home office doesn’t look ___ as organised as the company office.",
    words: 2,
    answers: ["quite", "quite so"], // we’ll accept 'quite' alone; most learners will say 'quite as'
    explanation:
      "'Not quite as… as…' means a little less: not quite as tidy, not quite as busy.",
  },
];

// --------------------------------------------------------------------

export default function SpeakingPart3Comparatives() {
  const navigate = useNavigate();

  const [answers, setAnswers] = useState({});
  const [checkState, setCheckState] = useState({});

  const handleChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    if (checkState[id]) {
      setCheckState((prev) => ({
        ...prev,
        [id]: { ...prev[id], checked: false },
      }));
    }
  };

  const checkItem = (item) => {
    const raw = answers[item.id] || "";
    if (!raw.trim()) return;
    const user = normalise(raw);
    const ok = (item.answers || []).some(
      (ans) => normalise(ans) === user
    );

    setCheckState((prev) => ({
      ...prev,
      [item.id]: { ...(prev[item.id] || {}), checked: true, ok },
    }));
  };

  const showModel = (id) => {
    setCheckState((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), showModel: true },
    }));
  };

  const renderGapLine = (item) => {
    const [left, right] = item.gap.split("___");
    const state = checkState[item.id] || {};
    const { checked, ok, showModel: showModelFlag } = state;

    return (
      <div className="gap-item" key={item.id}>
        <label>
          <span style={{ fontWeight: 600 }}>{item.label}</span>
          <div className="gap-row">
            <span>{left}</span>
            <input
              type="text"
              className="spec-gap-input"
              value={answers[item.id] || ""}
              onChange={(e) => handleChange(item.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  checkItem(item);
                }
              }}
              placeholder={
                item.words === 1 ? "1 word" : `${item.words} words`
              }
            />
            <span>{right}</span>

            <button
              type="button"
              className="btn tiny"
              onClick={() => checkItem(item)}
            >
              Check
            </button>
            <button
              type="button"
              className="btn tiny ghost"
              onClick={() => showModel(item.id)}
            >
              Show suggestion
            </button>
          </div>
        </label>

        {checked && (
          <p className={`feedback ${ok ? "ok" : "wrong"}`}>
            {ok
              ? "Good – that fits this comparative pattern."
              : "Not quite – check the target structure again or show the suggestion."}
          </p>
        )}

        {showModelFlag && (
          <>
            <p className="feedback">
              Answer:{" "}
              <strong>
                {item.answers.length > 1
                  ? item.answers.join(" / ")
                  : item.answers[0]}
              </strong>
            </p>
            {item.explanation && (
              <p className="feedback note">{item.explanation}</p>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="game-wrapper speaking-guide">
      <Seo
        title="Speaking Part 3 – Comparative Structures | Seif Aptis Trainer"
        description="Practise comparative structures for Aptis Speaking Part 3: basic comparatives, 'not as... as...' and advanced modifiers."
      />

      <header className="header">
        <div>
          <h2 className="title">Comparative structures</h2>
          <p className="intro">
            Work through these three steps: first basic comparatives, then
            sentences with <strong>not as… as…</strong>, and finally more
            advanced <strong>modifiers</strong> like <em>far / much / slightly /
            not quite / nowhere near / just as</em>.
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

      <main className="guide-body">
        {/* Panel 1 – basic comparatives */}
        <section className="panel">
          <h2>Step 1 – Basic comparatives</h2>
          <p className="panel-text">
            Imagine a pair of pictures where people are{" "}
            <em>younger / older, busier / calmer, more or less comfortable</em>.
            Complete the sentences with a correct comparative form.
          </p>

          <div className="compare-images">
            <img
              src="/images/speaking/part3-comparing/placeholders/young-vs-old.png"
              alt="Placeholder: younger person vs older person"
              className="exercise-image"
              draggable="false"
            />
            <img
              src="/images/speaking/part3-comparing/placeholders/busy-vs-calm.png"
              alt="Placeholder: busy space vs calm space"
              className="exercise-image"
              draggable="false"
            />
          </div>

          <div className="gap-exercise">
            {BASIC_ITEMS.map((item) => renderGapLine(item))}
          </div>
        </section>

        {/* Panel 2 – not as ... as */}
        <section className="panel">
          <h2>Step 2 – Changing to “not as… as…”</h2>
          <p className="panel-text">
            Now imagine one picture is{" "}
            <strong>noisier / more crowded / quieter</strong> than the other.
            We can flip the idea using <strong>not as… as…</strong>. Complete
            these sentences.
          </p>

          <div className="compare-images">
            <img
              src="/images/speaking/part3-comparing/placeholders/office-vs-home.png"
              alt="Placeholder: company office vs home office"
              className="exercise-image"
              draggable="false"
            />
            <img
              src="/images/speaking/part3-comparing/placeholders/market-vs-mall.png"
              alt="Placeholder: street market vs shopping centre"
              className="exercise-image"
              draggable="false"
            />
          </div>

          <div className="gap-exercise">
            {NOT_AS_ITEMS.map((item) => renderGapLine(item))}
          </div>

          <p className="tip">
            Example: <em>The market is more crowded than the shopping centre.</em>{" "}
            → <em>The shopping centre is not as crowded as the market.</em>
          </p>
        </section>

        {/* Panel 3 – modifiers */}
        <section className="panel">
          <h2>Step 3 – Advanced modifiers</h2>
          <p className="panel-text">
            Finally, add <strong>modifiers</strong> to show how big or small the
            difference is. Think of pairs like{" "}
            <em>very busy vs quite busy</em> or{" "}
            <em>really noisy vs not noisy at all</em>.
          </p>

          <div className="compare-images">
            <img
              src="/images/speaking/part3-comparing/placeholders/rush-hour.png"
              alt="Placeholder: heavy traffic vs light traffic"
              className="exercise-image"
              draggable="false"
            />
            <img
              src="/images/speaking/part3-comparing/placeholders/cafe-vs-library.png"
              alt="Placeholder: noisy café vs quiet library"
              className="exercise-image"
              draggable="false"
            />
          </div>

          <p className="panel-text">
            Complete the sentences using one of these:{" "}
            <em>far, much, a lot, slightly, a little, a bit, just, nowhere near,
            not nearly, not quite</em>.
          </p>

          <div className="gap-exercise">
            {MODIFIER_ITEMS.map((item) => renderGapLine(item))}
          </div>
        </section>
      </main>

      {/* ===== Styles (same speaking-guide base styles + exercise layout) ===== */}
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

        .speaking-guide .panel-text {
          margin-bottom: 0.75rem;
          color: var(--muted);
        }

        .tip {
          margin-top: 0.7rem;
          font-size: 0.9rem;
          color: #d1fae5;
        }

        .speaking-guide .btn {
          background: #24365d;
          border: 1px solid #335086;
          color: var(--ink);
          padding: 0.45rem 0.7rem;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.9rem;
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

        .exercise-image {
          width: 100%;
          max-width: 260px;
          border-radius: 0.75rem;
          margin: 0.4rem auto 0.4rem;
          display: block;
        }

        .compare-images {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
          margin-bottom: 0.75rem;
        }

        .gap-exercise {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .gap-item {
          display: flex;
          flex-direction: column;
          margin-bottom: 0.2rem;
        }

        .gap-item label {
          font-size: 0.95rem;
          color: var(--ink);
        }

        .gap-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          align-items: center;
          margin-top: 0.25rem;
        }

        .spec-gap-input {
          display: inline-block;
          min-width: 120px;
          max-width: 240px;
          padding: 0.25rem 0.45rem;
          margin: 0 0.3rem;
          border-radius: 0.45rem;
          border: 1px solid #4b5563;
          background: #020617;
          color: #e5e7eb;
          font-size: 0.9rem;
        }

        .feedback {
          font-size: 0.8rem;
          margin-top: 0.15rem;
          font-weight: bold;
        }

        .feedback.ok {
          color: #86efac;
        }

        .feedback.wrong {
          color: #fca5a5;
        }

        .feedback.note {
          font-weight: normal;
          color: var(--muted);
          margin-top: 0.1rem;
        }

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

          .gap-row {
            flex-direction: column;
            align-items: stretch;
          }

          .spec-gap-input {
            width: 100%;
            max-width: 100%;
          }

          .gap-row .btn.tiny {
            align-self: flex-start;
            margin-top: 0.25rem;
          }

          .exercise-image {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
