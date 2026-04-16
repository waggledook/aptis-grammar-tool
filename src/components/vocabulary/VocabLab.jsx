// src/components/vocabulary/VocabLab.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { auth } from "../../firebase";

import FlashcardsPlayer from "./FlashcardsPlayer";
import VocabReviewPlayer from "./VocabReviewPlayer";

import { logVocabSetCompleted } from "../../firebase";

import {
  getAllTopicIds,
  getTopicMeta,
  flattenFlashcardPool,
  flattenReviewPool,
  buildSession,
} from "./utils/vocabSession";

export default function VocabLab() {
  const navigate = useNavigate();
  const isSignedIn = !!auth.currentUser; // route is already gated, but safe

  const allTopicIds = useMemo(() => getAllTopicIds(), []);
  const [selectedTopics, setSelectedTopics] = useState([]); // [] = all topics
  const [mode, setMode] = useState("flashcards"); // "flashcards" | "review"
  const [count, setCount] = useState(20);

  const [started, setStarted] = useState(false);
  const [sessionItems, setSessionItems] = useState([]);

  const usingAllTopics = selectedTopics.length === 0;

  const topicOptions = useMemo(() => {
    return allTopicIds
      .map((id) => {
        const meta = getTopicMeta(id);
        return {
          id,
          label: meta?.topicTitle || id,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [allTopicIds]);

  function toggleTopic(id) {
    setSelectedTopics((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  }

  function selectAllTopics() {
    setSelectedTopics([]); // our convention: [] means "all"
  }

  function startSession() {
    const chosen = usingAllTopics ? allTopicIds : selectedTopics;

    const pool =
      mode === "flashcards"
        ? flattenFlashcardPool(chosen)
        : flattenReviewPool(chosen);

    const built = buildSession(pool, Number(count) || 10, {
      uniqueBy: mode === "flashcards" ? "term" : "sentence",
    });

    setSessionItems(built);
    setStarted(true);
  }

  function exitSession() {
    setStarted(false);
    setSessionItems([]);
  }
// ─────────────────────────────────────────────────────────────
// 1) SETUP SCREEN
// ─────────────────────────────────────────────────────────────
if (!started) {
    return (
      <div className="topic-trainer game-wrapper fade-in">
        <header className="header">
          <h2 className="title">Vocab Lab</h2>
          <p className="intro">
            Create a random session across multiple topics (flashcards or review
            sentences).
          </p>
        </header>
  
        <button className="topbar-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
  
        <div className="card lab-card" style={{ marginTop: "1rem" }}>
          {/* Mode */}
          <div className="lab-section">
            <h3 className="col-title" style={{ marginTop: 0 }}>
              Mode
            </h3>
  
            <div className="lab-btn-row">
              <button
                className={`lab-pill ${mode === "flashcards" ? "active" : ""}`}
                onClick={() => setMode("flashcards")}
                type="button"
              >
                🃏 Flashcards
              </button>
  
              <button
                className={`lab-pill ${mode === "review" ? "active" : ""}`}
                onClick={() => setMode("review")}
                type="button"
              >
                ✍️ Review sentences
              </button>
            </div>
          </div>
  
          {/* Count */}
          <div className="lab-section">
            <h3 className="col-title">Number of items</h3>
  
            <div className="lab-select-wrap">
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="lab-select"
              >
                {[10, 15, 20, 30, 40, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="lab-select-arrow">▾</span>
            </div>
  
            <p className="muted" style={{ marginTop: ".6rem" }}>
              Items are random and won’t repeat within a session.
            </p>
          </div>
  
          {/* Topics */}
          <div className="lab-section">
            <div className="lab-topics-head">
              <h3 className="col-title" style={{ margin: 0 }}>
                Topics
              </h3>
  
              <button
                className={`lab-pill small ${usingAllTopics ? "active" : ""}`}
                onClick={selectAllTopics}
                type="button"
              >
                Use all topics
              </button>
            </div>
  
            <p className="muted" style={{ marginTop: ".5rem" }}>
              {usingAllTopics
                ? "All topics selected."
                : `${selectedTopics.length} topic(s) selected.`}
            </p>
  
            <div className="lab-topic-grid">
              {topicOptions.map((t) => {
                const selected = !usingAllTopics && selectedTopics.includes(t.id);
  
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`lab-topic-tile ${selected ? "selected" : ""}`}
                    onClick={() => toggleTopic(t.id)}
                    aria-pressed={selected}
                    title={t.label}
                  >
                    <span className="lab-topic-check" aria-hidden="true">
                      {selected ? "✓" : ""}
                    </span>
                    <span className="lab-topic-label">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
  
          <div className="lab-footer">
            <button className="review-btn" onClick={startSession} type="button">
              Start session →
            </button>
          </div>
  
          {!isSignedIn ? (
            <p className="muted" style={{ marginTop: ".75rem" }}>
              (Note: you’re not signed in, so progress/mistakes won’t be saved.)
            </p>
          ) : null}
        </div>
  
        <style>{`
          /* ───────────── Vocab Lab setup styling ───────────── */
  
          .lab-card { 
            background:#13213b;
            border:1px solid #2c4b83;
            border-radius:12px;
            padding:1.2rem 1.3rem;
          }
  
          .lab-section { margin-bottom: 1.25rem; }
  
          .lab-btn-row {
            display:flex;
            flex-wrap:wrap;
            gap:.6rem;
            align-items:center;
          }
  
          /* Pill buttons that have a clear selected state */
          .lab-pill{
            background:#101b32;
            border:1px solid #2c4b83;
            color:#cfd9f3;
            padding:.55rem 1rem;
            border-radius:999px;
            cursor:pointer;
            transition:all .15s ease;
            font-weight:700;
          }
          .lab-pill:hover{
            border-color:#4a79d8;
            color:#fff;
          }
          .lab-pill.active{
            background:#1f3560;
            border-color:#4a79d8;
            color:#fff;
            box-shadow: 0 0 0 2px rgba(74,121,216,.18);
          }
          .lab-pill.small{
            padding:.45rem .85rem;
            font-weight:700;
          }
  
          /* Styled select (dropdown) */
          .lab-select-wrap{
            position:relative;
            display:inline-block;
            width: 220px;
            max-width: 100%;
          }
          .lab-select{
            width:100%;
            appearance:none;
            -webkit-appearance:none;
            -moz-appearance:none;
            background:#101b32;
            border:1px solid #2c4b83;
            color:#e6f0ff;
            padding:.7rem 2.25rem .7rem .9rem;
            border-radius:12px;
            font-size:1.05rem;
            outline:none;
            cursor:pointer;
          }
          .lab-select:focus{
            border-color:#4a79d8;
            box-shadow:0 0 0 2px rgba(74,121,216,.25);
          }
          .lab-select-arrow{
            position:absolute;
            right:.8rem;
            top:50%;
            transform:translateY(-50%);
            pointer-events:none;
            color:#9fb0e0;
            font-size:1.1rem;
          }
  
          /* Topics header row */
          .lab-topics-head{
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:1rem;
            flex-wrap:wrap;
          }
  
          /* Topic tiles as fully clickable buttons */
          .lab-topic-grid{
            display:grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap:.7rem;
            margin-top:.85rem;
          }
  
          .lab-topic-tile{
            width:100%;
            display:flex;
            align-items:center;
            gap:.7rem;
            padding:.85rem 1rem;
            border-radius:14px;
            background: rgba(16,27,50,.65);
            border:1px solid rgba(44,75,131,.7);
            color:#e6f0ff;
            cursor:pointer;
            text-align:left;
            transition: all .15s ease;
            position:relative;
            min-height: 58px;
          }
          .lab-topic-tile:hover{
            border-color:#4a79d8;
            transform: translateY(-1px);
          }
          .lab-topic-tile.selected{
            background: rgba(31,53,96,.85);
            border-color:#4a79d8;
            box-shadow: 0 0 0 2px rgba(74,121,216,.18);
          }
  
          .lab-topic-check{
            width:26px;
            height:26px;
            border-radius:8px;
            display:flex;
            align-items:center;
            justify-content:center;
            border:1px solid rgba(159,176,224,.35);
            color:#8ee6b5;
            font-weight:900;
            flex:0 0 26px;
            background: rgba(16,27,50,.6);
          }
          .lab-topic-tile.selected .lab-topic-check{
            border-color: rgba(142,230,181,.5);
            background: rgba(16,27,50,.35);
          }
  
          .lab-topic-label{
            font-size:1.15rem;
            font-weight:800;
            line-height:1.2;
          }
  
          .lab-footer{
            display:flex;
            justify-content:flex-start;
            margin-top:.25rem;
          }
        `}</style>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2) FLASHCARDS SESSION — shared player
  // ─────────────────────────────────────────────────────────────
  if (mode === "flashcards") {
    return (
      <FlashcardsPlayer
        items={sessionItems}
        onBack={exitSession}
        isAuthenticated={isSignedIn}
        logTopic="lab"
        enableSavedMode={false}
        title="Vocab Lab • Flashcards"
        subtitle="Flip through a mixed deck of cards from your chosen topics."
      />
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3) REVIEW SESSION — shared player
  // ─────────────────────────────────────────────────────────────
  return (
    <VocabReviewPlayer
  items={sessionItems}
  isSignedIn={isSignedIn}
  onExit={exitSession}
  title="Vocab Lab • Review"
  intro="Type the missing word or phrase to complete each sentence."
  showTopicLabels={true}
  onFirstRunComplete={async ({ totalItems, correctFirstTry, mistakesCount }) => {
    if (!isSignedIn) return;

    // Log a single lab review session completion
    await logVocabSetCompleted({
      topic: "lab",
      setId: "mixed",        // arbitrary label; just keep it consistent
      mode: "review",
      totalItems,
      correctFirstTry,
      mistakesCount,
    });
  }}
/>
  );
}
