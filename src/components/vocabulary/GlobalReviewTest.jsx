// src/components/vocabulary/GlobalReviewTest.jsx
import { useMemo, useState } from "react";

function normalize(s) {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/[.!?]+$/g, "")     // ignore final punctuation
    .replace(/\s+/g, " ");       // collapse whitespace
}

function parseAnswers(answer) {
  // supports "strawberry / strawberries" style
  return String(answer || "")
    .split("/")
    .map((a) => normalize(a))
    .filter(Boolean);
}

export default function GlobalReviewTest({ items = [], onExit }) {
  const [idx, setIdx] = useState(0);
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const current = items[idx];

  const progressText = useMemo(() => {
    if (!items.length) return "0 / 0";
    return `${idx + 1} / ${items.length}`;
  }, [idx, items.length]);

  function check() {
    const user = normalize(value);
    const accepted = parseAnswers(current.answer);
    const ok = accepted.includes(user);
    setIsCorrect(ok);
    setChecked(true);
  }

  function next() {
    setValue("");
    setChecked(false);
    setIsCorrect(false);
    setIdx((n) => Math.min(n + 1, items.length - 1));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!checked) check();
    else next();
  }

  if (!items.length) {
    return (
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Test (Review sentences)</h2>
        <p className="muted">No review sentences found for this selection.</p>
        <button className="review-btn" onClick={onExit}>
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="pk-topbar" style={{ marginBottom: ".75rem" }}>
        <div>
          <h2 style={{ margin: 0 }}>Mixed Test</h2>
          <div className="muted" style={{ marginTop: ".15rem" }}>
            {progressText} · {current.topicTitle} → {current.setTitle}
          </div>
        </div>

        <button className="review-btn" onClick={onExit}>
          ← Exit
        </button>
      </div>

      <div className="panel" style={{ marginBottom: ".75rem" }}>
        <div style={{ fontSize: "1.2rem", lineHeight: 1.35 }}>
          {current.sentence}
        </div>
        {current.image ? (
          <img
            src={current.image}
            alt=""
            style={{ marginTop: ".6rem", maxWidth: "160px", height: "auto" }}
          />
        ) : null}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: ".5rem" }}>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={checked}
          placeholder="Type the missing word(s)…"
          style={{ flex: 1 }}
        />
        <button className="review-btn" type="submit">
          {!checked ? "Check" : "Next"}
        </button>
      </form>

      {checked ? (
        <div style={{ marginTop: ".75rem" }}>
          {isCorrect ? (
            <div style={{ fontWeight: 800 }}>✅ Correct</div>
          ) : (
            <>
              <div style={{ fontWeight: 800 }}>❌ Not quite</div>
              <div className="muted" style={{ marginTop: ".25rem" }}>
                Accepted: <span style={{ fontWeight: 700 }}>{current.answer}</span>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}