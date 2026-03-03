// src/components/vocabulary/FlashcardsPlayer.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { logFlashcardsSession } from "../../firebase";

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

/**
 * items: [{ key, term, definition, image, setTitle?, topicTitle? }]
 * storageKey: e.g. "vocabFlashcards_food" or "vocabFlashcards_lab"
 * logTopic: string passed to logFlashcardsSession (e.g. "food" or "lab")
 */
export default function FlashcardsPlayer({
  items = [],
  onBack,
  isAuthenticated = false,
  storageKey = null,
  logTopic = null,
  title = "Flashcards",
  subtitle = null,
}) {
  const hasLogged = useRef(false);

  // Log session once per visit when there are cards
  useEffect(() => {
    if (!logTopic) return;
    if (items.length === 0) return;
    if (hasLogged.current) return;

    hasLogged.current = true;

    logFlashcardsSession({
      topic: logTopic,
      totalCards: items.length,
      isAuthenticated,
    });
  }, [logTopic, items.length, isAuthenticated]);

  const [deck, setDeck] = useState(items);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState({}); // card.key -> "ok" | "ng"
  const [mode, setMode] = useState("all"); // "all" | "wrong"
  const [animateFlip, setAnimateFlip] = useState(false);

  // Load saved progress
  useEffect(() => {
    if (!storageKey) return;
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") setResults(parsed);
      }
    } catch (e) {
      console.warn("Could not load flashcard progress", e);
    }
  }, [storageKey]);

  // Save progress whenever results change
  useEffect(() => {
    if (!storageKey) return;
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(results));
    } catch (e) {
      console.warn("Could not save flashcard progress", e);
    }
  }, [storageKey, results]);

  // Reset deck whenever items change
  useEffect(() => {
    if (!items || items.length === 0) {
      setDeck([]);
      setIndex(0);
      setFlipped(false);
      setAnimateFlip(false);
      setMode("all");
      return;
    }
    const shuffled = shuffleArray(items);
    setDeck(shuffled);
    setIndex(0);
    setFlipped(false);
    setAnimateFlip(false);
    setMode("all");
  }, [items]);

  const fullKeys = useMemo(() => new Set(items.map((c) => c.key)), [items]);

  const statsValues = useMemo(() => {
    const entries = Object.entries(results).filter(([k]) => fullKeys.has(k));
    const rightCount = entries.filter(([, v]) => v === "ok").length;
    const wrongCount = entries.filter(([, v]) => v === "ng").length;
    const answeredCount = entries.length;
    const allMarked = items.length > 0 && answeredCount === items.length;
    const hasWrong = wrongCount > 0;
    return { rightCount, wrongCount, allMarked, hasWrong };
  }, [results, items, fullKeys]);

  const current = deck[index] || null;
  const { rightCount, wrongCount, hasWrong } = statsValues;

  const deckLength = deck.length;

  // Keyboard shortcuts: arrows to navigate, space to flip
  useEffect(() => {
    function handleKeyDown(e) {
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
    setAnimateFlip(true);
    setFlipped((f) => !f);
  }

  function goNext() {
    if (deck.length === 0) return;
    setAnimateFlip(false);
    setFlipped(false);
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
      [current.key]: type, // "ok" | "ng"
    }));
    goNext();
  }

  function restartAll() {
    const shuffled = shuffleArray(items);
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

    const filtered = items.filter((card) => wrongKeys.includes(card.key));
    if (filtered.length === 0) return;

    const shuffled = shuffleArray(filtered);
    setDeck(shuffled);
    setIndex(0);
    setFlipped(false);
    setAnimateFlip(false);
    setMode("wrong");
  }

  function backToAllCards() {
    const shuffled = shuffleArray(items);
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
      <header className="header">
        <h2 className="title">{title}</h2>
        {subtitle ? <p className="intro">{subtitle}</p> : null}
      </header>

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
            Mode: <strong>{mode === "all" ? "All cards" : "Unknown only"}</strong>
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

                  {statusLabel && <p className="flash-status">{statusLabel}</p>}

                  <p className="flash-hint">Tap / click to show the answer</p>
                </div>

                <div className="flash-face back">
                  <p className="face-label">Answer</p>
                  <div className="flash-answer">{current.term}</div>

                  {statusLabel && <p className="flash-status">{statusLabel}</p>}

                  <p className="flash-hint">Tap / click again to hide the answer</p>
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
                <button className="mark-btn ok" onClick={() => mark("ok")} disabled={!current}>
                  ✔ I knew this
                </button>
                <button className="mark-btn ng" onClick={() => mark("ng")} disabled={!current}>
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
                  <button className="review-btn secondary" onClick={backToAllCards}>
                    Back to all cards
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="phase-intro">No cards to show yet.</p>
        )}
      </div>

      <button className="topbar-btn" onClick={onBack} style={{ marginTop: "1rem" }}>
        ← Back
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
          perspective: 1000px;
          cursor: pointer;
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

        .flash-face.front {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          backface-visibility: hidden;
        }

        .flash-face.back {
          position: absolute;
          inset: 0;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          text-align:center;
          backface-visibility:hidden;
          transform: rotateY(180deg);
        }

        .face-label{
          font-size:.8rem;
          letter-spacing:.06em;
          text-transform:uppercase;
          color:#9fb0e0;
          margin:0 0 .5rem;
        }

        .flash-img-wrap img{
          max-width:120px;
          height:auto;
          display:block;
        }

        .flash-def{
          font-size:1.05rem;
          margin:.6rem 0 .3rem;
          color:#e6f0ff;
        }

        .flash-answer{
          font-size:1.8rem;
          font-weight:800;
          margin:.5rem 0 .2rem;
        }

        .flash-hint{
          margin-top:.7rem;
          font-size:.85rem;
          color:#9fb0e0;
        }

        .flash-status{
          margin-top:.55rem;
          font-size:.85rem;
          color:#cfd9f3;
          opacity:.9;
        }

        .flash-controls{ margin-top: .9rem; }
        .row{ display:flex; gap:.5rem; flex-wrap:wrap; justify-content:center; margin-top:.55rem; }

        .nav-btn{
          background:#101b32;
          border:1px solid #2c4b83;
          color:#e6f0ff;
          padding:.45rem .8rem;
          border-radius:10px;
          cursor:pointer;
        }

        .mark-row .mark-btn{
          border:none;
          border-radius:10px;
          padding:.5rem .9rem;
          cursor:pointer;
          font-weight:700;
        }

        .mark-btn.ok{ background:#38c172; color:#0c1530; }
        .mark-btn.ng{ background:#ef4444; color:#fff; }

        .util-row{ margin-top:.7rem; }
      `}</style>
    </div>
  );
}