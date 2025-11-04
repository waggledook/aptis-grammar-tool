// src/components/vocabulary/TopicFlashcards.jsx
import React, { useMemo, useState, useEffect } from "react";
import { travelData } from "./data/travelData";

function shuffleArray(array) {
    return [...array].sort(() => Math.random() - 0.5);
  }

// Add future topics here as you create them
const TOPIC_DATA = {
  travel: travelData,
  // work: workData,
  // health: healthData,
};

export default function TopicFlashcards({ topic, onBack, isAuthenticated = false }) {
  const topicInfo = TOPIC_DATA[topic] || null;

  // If topic isn't known at all
  if (!topicInfo) {
    return (
      <div className="topic-trainer game-wrapper">
        <header className="header">
          <h2 className="title">Topic not found</h2>
          <p className="intro">No flashcards available for this topic yet.</p>
        </header>

        <button className="topbar-btn" onClick={onBack}>
          ← Back to Topics
        </button>
      </div>
    );
  }

  // Limit which sets contribute cards (e.g. guests only see first 2)
  const allowedSets = useMemo(() => {
    const sets = topicInfo.sets || [];
    if (!isAuthenticated && sets.length > 2) {
      return sets.slice(0, 2);
    }
    return sets;
  }, [topicInfo, isAuthenticated]);

  // Build one big deck from all allowed sets
  const fullDeck = useMemo(() => {
    return allowedSets.flatMap((set) =>
      (set.pairs || []).map((p) => ({
        key: `${set.id}::${p.term}`,
        term: p.term,
        definition: p.definition,
        image: p.image,
        setTitle: set.title,
      }))
    );
  }, [allowedSets]);

  const [deck, setDeck] = useState(fullDeck);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState({}); // card.key -> "ok" | "ng"
  const [mode, setMode] = useState("all"); // "all" | "wrong"
  const [animateFlip, setAnimateFlip] = useState(false); // controls whether flip animation plays


  // Load saved progress from localStorage (per topic)
  useEffect(() => {
    if (!topic) return;
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(`vocabFlashcards_${topic}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setResults(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not load flashcard progress", e);
    }
  }, [topic]);

  // Save progress whenever results change
  useEffect(() => {
    if (!topic) return;
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        `vocabFlashcards_${topic}`,
        JSON.stringify(results)
      );
    } catch (e) {
      console.warn("Could not save flashcard progress", e);
    }
  }, [topic, results]);

  // Reset deck when topic/set data changes
  useEffect(() => {
    if (!fullDeck || fullDeck.length === 0) {
      setDeck([]);
      setIndex(0);
      setFlipped(false);
      setAnimateFlip(false);
      setMode("all");
      return;
    }
    const shuffled = shuffleArray(fullDeck);
    setDeck(shuffled);
    setIndex(0);
    setFlipped(false);
    setAnimateFlip(false);
    setMode("all");
  }, [fullDeck]);

  const fullKeys = useMemo(
    () => new Set(fullDeck.map((c) => c.key)),
    [fullDeck]
  );

  const statsValues = useMemo(() => {
    const entries = Object.entries(results).filter(([k]) => fullKeys.has(k));
    const rightCount = entries.filter(([, v]) => v === "ok").length;
    const wrongCount = entries.filter(([, v]) => v === "ng").length;
    const answeredCount = entries.length;
    const allMarked = fullDeck.length > 0 && answeredCount === fullDeck.length;
    const hasWrong = wrongCount > 0;
    return { rightCount, wrongCount, allMarked, hasWrong };
  }, [results, fullDeck, fullKeys]);

  const current = deck[index] || null;
  const { rightCount, wrongCount, allMarked, hasWrong } = statsValues;

  const deckLength = deck.length;

  // Keyboard shortcuts: arrows to navigate, space to flip
  useEffect(() => {
    function handleKeyDown(e) {
      // Don't interfere with typing in inputs/textareas
      const tag = e.target && e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.code === "Space") {
        e.preventDefault();
        setAnimateFlip(true);
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (deckLength === 0) return;
        setAnimateFlip(false);
        setFlipped(false);
        setIndex((prev) => ((prev + 1) % deckLength + deckLength) % deckLength);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (deckLength === 0) return;
        setAnimateFlip(false);
        setFlipped(false);
        setIndex((prev) => ((prev - 1) % deckLength + deckLength) % deckLength);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deckLength]);


  function flip() {
    setAnimateFlip(true);       // we want animation on user flip
    setFlipped((f) => !f);
  }

  function goNext() {
    if (deck.length === 0) return;
    setAnimateFlip(false);      // no animation when jumping to another card
    setFlipped(false);          // always start new card on the front
    setIndex((prev) => {
      const next = prev + 1;
      if (next >= deck.length) return 0;
      return next;
    });
  }

  function goPrev() {
    if (deck.length === 0) return;
    setAnimateFlip(false);
    setFlipped(false);
    setIndex((prev) => {
      const next = prev - 1;
      if (next < 0) return deck.length - 1;
      return next;
    });
  }

  function mark(type) {
    if (!current) return;
    setResults((prev) => ({
      ...prev,
      [current.key]: type,
    }));
    goNext();
  }

  function restartAll() {
    const shuffled = shuffleArray(fullDeck);
    setDeck(shuffled);
    setIndex(0);
    setFlipped(false);
    setAnimateFlip(false);
    setResults({});
    setMode("all");
  }

  function shuffleDeck() {
    if (deck.length === 0) return;
    const copy = shuffleArray(deck);
    setDeck(copy);
    setIndex(0);
    setFlipped(false);
    setAnimateFlip(false);
  }

  function reviewWrongOnly() {
    if (!hasWrong) return;
    const wrongKeys = Object.entries(results)
      .filter(([k, v]) => fullKeys.has(k) && v === "ng")
      .map(([k]) => k);
    const filtered = fullDeck.filter((card) => wrongKeys.includes(card.key));
    if (filtered.length === 0) return;
    const shuffled = shuffleArray(filtered);
    setDeck(shuffled);
    setIndex(0);
    setFlipped(false);
    setAnimateFlip(false);
    setMode("wrong");
  }

  
function backToAllCards() {
    const shuffled = shuffleArray(fullDeck);
    setDeck(shuffled);
    setIndex(0);
    setFlipped(false);
    setAnimateFlip(false);
    setMode("all");
  }

  const currentStatus = current ? results[current.key] : null;
  const statusLabel =
  currentStatus === "ok"
    ? "Marked: known ✔"
    : currentStatus === "ng"
    ? "Marked: unknown ✖"
    : "";
    

  return (
    <div className="topic-trainer game-wrapper fade-in">
      {/* HEADER */}
      <header className="header">
        <h2 className="title" style={{ textTransform: "capitalize" }}>
          {topic} • Flashcards
        </h2>
        <p className="intro">
          Flip each card to check the answer. Mark whether you knew it or not,
          then review only the unknown cards.
        </p>
      </header>

      {!isAuthenticated && topicInfo.sets.length > 2 && (
        <p className="locked-note">
          You&apos;re seeing flashcards from the first{" "}
          <strong>two sets</strong>. Sign in to unlock all sets in this topic.
        </p>
      )}

      <div className="card flashcard-shell">
        <div className="flash-top-row">
          <div className="stats">
            <span className="pill">
              Card {deck.length === 0 ? 0 : index + 1} / {deck.length}
            </span>
            <span>
              ✔ Known: <strong>{rightCount}</strong>
            </span>
            <span>
              ✖ Unknown: <strong>{wrongCount}</strong>
            </span>
          </div>
          <div className="mode-pill">
            Mode:{" "}
            <strong>{mode === "all" ? "All cards" : "Unknown only"}</strong>
          </div>
        </div>

        {current ? (
          <>
            <div
  className={
    "flashcard " +
    (flipped ? "is-flipped " : "") +
    (!animateFlip ? "no-anim" : "")
  }
  onClick={flip}
>
  <div className="flash-inner">
                <div className="flash-face front">
                  <p className="face-label">Definition</p>
                  {current.image && (
                    <div className="flash-img-wrap">
                      <img src={current.image} alt={current.term} />
                    </div>
                  )}
                  <p className="flash-def">{current.definition}</p>
{statusLabel && (
  <p className="flash-status">{statusLabel}</p>
)}
<p className="flash-hint">Tap / click to show the answer</p>
                </div>

                <div className="flash-face back">
                  <p className="face-label">Answer</p>
                  <div className="flash-answer">{current.term}</div>
                  {statusLabel && (
  <p className="flash-status">{statusLabel}</p>
)}
<p className="flash-hint">
  Tap / click again to hide the answer
</p>
                </div>
              </div>
            </div>

            <div className="flash-controls">
              <div className="row">
                <button className="nav-btn" onClick={goPrev}>
                  ← Previous
                </button>
                <button className="nav-btn" onClick={flip}>
                  {flipped ? "Hide answer" : "Show answer"}
                </button>
                <button className="nav-btn" onClick={goNext}>
                  Next →
                </button>
              </div>

              <div className="row mark-row">
                <button
                  className="mark-btn ok"
                  onClick={() => mark("ok")}
                  disabled={!current}
                >
                  ✔ I knew this
                </button>
                <button
                  className="mark-btn ng"
                  onClick={() => mark("ng")}
                  disabled={!current}
                >
                  ✖ I didn&apos;t know this
                </button>
              </div>

              <div className="row util-row">
                <button className="review-btn secondary" onClick={shuffleDeck}>
                  Shuffle
                </button>
                <button className="review-btn secondary" onClick={restartAll}>
                  Restart &amp; clear marks
                </button>
                <button
  className="review-btn"
  onClick={reviewWrongOnly}
  disabled={!hasWrong}
  title={!hasWrong ? "No unknown cards to review yet." : ""}
>
  Review unknown only
</button>
                {mode === "wrong" && (
                  <button
                    className="review-btn secondary"
                    onClick={backToAllCards}
                  >
                    Back to all cards
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="phase-intro">
            No cards to show yet. Add some pairs to this topic&apos;s sets.
          </p>
        )}
      </div>

      <button
        className="topbar-btn"
        onClick={onBack}
        style={{ marginTop: "1rem" }}
      >
        ← Back to Topics
      </button>

      <style>{`
        .flashcard-shell {
          background:#13213b;
          border:1px solid #2c4b83;
          border-radius:12px;
          padding:1rem 1.2rem;
          color:#e6f0ff;
          margin-top:0.5rem;
        }

        .flash-top-row {
          display:flex;
          justify-content:space-between;
          align-items:center;
          flex-wrap:wrap;
          gap:.5rem .75rem;
          margin-bottom:.8rem;
        }

        .stats {
          display:flex;
          flex-wrap:wrap;
          gap:.5rem;
          font-size:.85rem;
          color:#cfd9f3;
        }

        .pill {
          background:#101b32;
          border-radius:999px;
          padding:.2rem .7rem;
          border:1px solid #2c4b83;
        }

        .mode-pill {
          font-size:.8rem;
          color:#9fb0e0;
        }

          .flashcard {
          background: transparent;
          border-radius: 16px;
          perspective: 1000px; /* enable 3D flip */
        }

        .flash-inner {
          position: relative;
          width: 100%;
          background: #101b32;
          border: 1px solid #2c4b83;
          border-radius: 16px;
          padding: 1.1rem;
          transition: transform 0.4s ease, box-shadow 0.15s ease, border-color 0.15s ease;
          transform-style: preserve-3d;
        }

        .flashcard.is-flipped .flash-inner {
          transform: rotateY(180deg);
        }

        .flashcard.no-anim .flash-inner {
          transition: none;
        }

        .flashcard:hover .flash-inner {
          box-shadow:0 4px 12px rgba(0,0,0,.35);
          border-color:#4a79d8;
        }


        /* FRONT face: drives the height of the card */
        .flash-face.front {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          backface-visibility: hidden;
        }



        /* BACK face: sits on top of the front, same height */
        .flash-face.back {
          position: absolute;
          inset: 0;
          padding: 1.1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          backface-visibility: hidden;
          transform: rotateY(180deg);
        }


        .face-label {
          font-size:.8rem;
          text-transform:uppercase;
          letter-spacing:.08em;
          color:#9fb0e0;
          margin:0 0 .4rem;
        }

        .flash-img-wrap {
          margin-bottom:.5rem;
          display:flex;
          justify-content:center;
        }

        .flash-img-wrap img {
          width:72px;
          height:72px;
          object-fit:contain;
          filter:drop-shadow(0 0 4px rgba(0,0,0,.45));
        }

        .flash-def {
          font-size:.95rem;
          line-height:1.4;
          margin-bottom:.4rem;
        }

        .flash-answer {
          font-size:1.3rem;
          font-weight:700;
          margin-bottom:.4rem;
        }

        .flash-def,
        .flash-answer {
          word-break: break-word;
        }

        .flash-set {
          font-size:.8rem;
          color:#a9b7d1;
          margin-bottom:.2rem;
        }

        .flash-status {
          font-size:.8rem;
          color:#cfd9f3;
          margin-bottom:.25rem;
        }

        .flash-hint {
          font-size:.75rem;
          color:#7f8fb3;
        }

        .flash-controls {
          margin-top:.9rem;
          display:flex;
          flex-direction:column;
          gap:.55rem;
        }

        .row {
          display:flex;
          flex-wrap:wrap;
          justify-content:center;
          gap:.5rem;
        }

        .nav-btn {
          background:#101b32;
          border:1px solid #2c4b83;
          border-radius:8px;
          color:#cfd9f3;
          padding:.35rem .9rem;
          font-size:.85rem;
          cursor:pointer;
          transition:all .15s ease;
        }

        .nav-btn:hover {
          background:#16284a;
          border-color:#4a79d8;
        }

        .mark-row {
          margin-top:.1rem;
        }

        .mark-btn {
          border-radius:999px;
          padding:.4rem 1rem;
          font-size:.85rem;
          font-weight:600;
          border:1px solid transparent;
          cursor:pointer;
          transition:all .15s ease;
        }

        .mark-btn.ok {
          background:#224a2d;
          border-color:#3cb371;
          color:#eafff2;
        }
        .mark-btn.ok:hover {
          background:#2b6e3f;
        }

        .mark-btn.ng {
          background:#4a2121;
          border-color:#d84a4a;
          color:#ffecec;
        }
        .mark-btn.ng:hover {
          background:#6b2c2c;
        }

        .mark-btn:disabled {
          opacity:.5;
          cursor:default;
        }

        .util-row {
          margin-top:.2rem;
        }

        .review-btn {
          background:linear-gradient(135deg, #4a79d8, #6289ff);
          color:#fff;
          border:none;
          border-radius:8px;
          padding:.35rem .9rem;
          font-size:.8rem;
          font-weight:600;
          cursor:pointer;
          transition:transform .15s ease, box-shadow .15s ease, opacity .15s ease;
        }
        .review-btn:hover:not(:disabled) {
          transform:translateY(-1px);
          box-shadow:0 0 6px rgba(98,137,255,.4);
        }
        .review-btn.secondary {
          background:#101b32;
          border:1px solid #4a79d8;
          box-shadow:none;
        }
        .review-btn.secondary:hover {
          background:#1f3560;
        }
        .review-btn:disabled {
          opacity:.45;
          cursor:default;
          box-shadow:none;
        }

        .locked-note {
          margin-top:.2rem;
          font-size:.8rem;
          color:#ffcf40;
        }
      `}</style>
    </div>
  );
}
