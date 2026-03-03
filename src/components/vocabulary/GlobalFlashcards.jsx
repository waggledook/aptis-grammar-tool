// src/components/vocabulary/GlobalFlashcards.jsx
import { useMemo, useState } from "react";

export default function GlobalFlashcards({ items = [], onExit }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const current = items[idx];

  const progressText = useMemo(() => {
    if (!items.length) return "0 / 0";
    return `${idx + 1} / ${items.length}`;
  }, [idx, items.length]);

  function next() {
    setFlipped(false);
    setIdx((n) => Math.min(n + 1, items.length - 1));
  }

  function prev() {
    setFlipped(false);
    setIdx((n) => Math.max(n - 1, 0));
  }

  if (!items.length) {
    return (
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Flashcards</h2>
        <p className="muted">No items found for this selection.</p>
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
          <h2 style={{ margin: 0 }}>Mixed Flashcards</h2>
          <div className="muted" style={{ marginTop: ".15rem" }}>
            {progressText} · {current.topicTitle} → {current.setTitle}
          </div>
        </div>

        <button className="review-btn" onClick={onExit}>
          ← Exit
        </button>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => setFlipped((v) => !v)}
        onKeyDown={(e) => (e.key === "Enter" ? setFlipped((v) => !v) : null)}
        className="panel"
        style={{
          cursor: "pointer",
          userSelect: "none",
          minHeight: "220px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: ".75rem",
        }}
      >
        <div className="muted" style={{ fontSize: ".9rem" }}>
          Click to flip
        </div>

        {!flipped ? (
          <>
            <div style={{ fontSize: "2rem", fontWeight: 800 }}>{current.term}</div>
            {current.image ? (
              <img
                src={current.image}
                alt={current.term}
                style={{ maxWidth: "140px", height: "auto" }}
              />
            ) : null}
          </>
        ) : (
          <>
            <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>Definition</div>
            <div style={{ fontSize: "1.1rem" }}>{current.definition}</div>
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: ".5rem", marginTop: ".75rem" }}>
        <button className="review-btn" onClick={prev} disabled={idx === 0}>
          ← Prev
        </button>
        <button className="review-btn" onClick={() => setFlipped((v) => !v)}>
          Flip
        </button>
        <button className="review-btn" onClick={next} disabled={idx === items.length - 1}>
          Next →
        </button>
      </div>
    </div>
  );
}