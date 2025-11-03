// src/components/vocabulary/TopicTrainer.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { travelData } from "./data/travelData";

export default function TopicTrainer({ topic, onBack }) {
  // Right now we only have travel. Later we can switch on topic.
  const topicInfo = topic === "travel" ? travelData : null;

  // We'll start with the first set in that topic.
  const [setIndex, setSetIndex] = useState(0);

  // Phase 1 = "match", Phase 2 = "review"
  const [phase, setPhase] = useState("match");

  // Load the active set
  const activeSet = topicInfo?.sets?.[setIndex];
  const shuffledReview = useMemo(() => {
    if (!activeSet) return [];
    return shuffle(activeSet.review);
  }, [activeSet]);

  // --- MATCH STATE ---
const [matchedTerms, setMatchedTerms] = useState([]);
const [matchedDefs, setMatchedDefs] = useState([]);
const [selectedDef, setSelectedDef] = useState(null);
const [selectedTerm, setSelectedTerm] = useState(null);
const [feedbackFlash, setFeedbackFlash] = useState(null);
const [shakeDef, setShakeDef] = useState(null);
const [shakeTerm, setShakeTerm] = useState(null);
const [pulseItems, setPulseItems] = useState({ def: null, term: null });
const [showDefs, setShowDefs] = useState({});



function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

// Left column = definitions (no distractors)
const leftItems = useMemo(() => {
  if (!activeSet) return [];
  return shuffle(activeSet.pairs);
}, [activeSet]);

// Right column = terms (with distractors)
const rightItems = useMemo(() => {
  if (!activeSet) return [];
  const allTerms = [...activeSet.pairs.map((p) => p.term), ...(activeSet.distractors || [])];
  return shuffle(allTerms);
}, [activeSet]);

function handleDefClick(defText) {
  if (matchedDefs.includes(defText)) return;
  setSelectedDef(defText);
  setFeedbackFlash(null);
}

function handleTermClick(term) {
  if (matchedTerms.includes(term)) return;
  if (!selectedDef) {
    setSelectedTerm(term);
    return;
  }

  // Try to match immediately
  const pair = activeSet.pairs.find((p) => p.definition === selectedDef);
  if (pair && pair.term === term) {
    // ✅ correct
    setMatchedTerms((prev) => [...prev, term]);
    setMatchedDefs((prev) => [...prev, selectedDef]);
    setSelectedDef(null);
    setSelectedTerm(null);
    setFeedbackFlash("correct");
  
    // pulse both sides
    setPulseItems({ def: selectedDef, term });
    setTimeout(() => setPulseItems({ def: null, term: null }), 500);
  } else {
    // ❌ wrong
    setFeedbackFlash("wrong");
    setShakeDef(selectedDef);
    setShakeTerm(term);
    setTimeout(() => {
      setShakeDef(null);
      setShakeTerm(null);
    }, 500);
    setSelectedDef(null);
    setSelectedTerm(null);
  }
}

const allMatched = activeSet && matchedTerms.length === activeSet.pairs.length;


  // --- REVIEW STATE ---
  // We reuse index for which review sentence we're on
  const [reviewIndex, setReviewIndex] = useState(0);
  const [chosenAnswer, setChosenAnswer] = useState(null);
  const [showReviewFeedback, setShowReviewFeedback] = useState(false);

  if (!topicInfo || !activeSet) {
    return (
      <div className="topic-trainer game-wrapper">
        <header className="header">
          <h2 className="title">Topic not found</h2>
          <p className="intro">No data available for this topic yet.</p>
        </header>

        <button className="topbar-btn" onClick={onBack}>
          ← Back to Topics
        </button>
      </div>
    );
  }

  const reviewItem = shuffledReview[reviewIndex];
  const wordBank = activeSet.pairs.map(p => p.term); // only real taught terms
  const [typedAnswer, setTypedAnswer] = useState("");
const [isCorrect, setIsCorrect] = useState(false);
const inputRef = useRef(null);

useEffect(() => {
  if (phase === "review" && inputRef.current) {
    inputRef.current.focus();
  }
}, [phase, reviewIndex]);                // ✅ triggers on phase change or next question

function checkTypedAnswer() {
  const cleanUser = typedAnswer.trim().toLowerCase();
  const cleanCorrect = reviewItem.answer.trim().toLowerCase();

  const acceptableAnswers = cleanCorrect
    .split("/")
    .map((a) => a.trim().toLowerCase());

  const correct = acceptableAnswers.includes(cleanUser);
  setIsCorrect(correct);
  setShowReviewFeedback(true);

  if (correct) {
    // ✅ Auto-advance after short delay
    setTimeout(() => {
      nextReview();
    }, 1500);
  }
  // ❌ For incorrect answers: no auto-advance — waits for Enter press
}


  function handleChooseAnswer(ans) {
    if (showReviewFeedback) return;
    setChosenAnswer(ans);
    setShowReviewFeedback(true);
  }

  function nextReview() {
    const next = reviewIndex + 1;
    if (next < shuffledReview.length) {
      setReviewIndex(next);
      setTypedAnswer("");
      setShowReviewFeedback(false);
      setIsCorrect(false);
    } else {
      // finished set
    }
  }

  return (
    <div className="topic-trainer game-wrapper fade-in">
      {/* HEADER */}
      <header className="header">
        <h2 className="title" style={{ textTransform: "capitalize" }}>
          {topic} • {activeSet.title}
        </h2>
        <p className="intro">
          {activeSet.focus}
        </p>
      </header>

      {/* PHASE TOGGLE / PROGRESSION */}
      <div className="stage-tabs">
        <button
          className={`tab-btn ${phase === "match" ? "active" : ""}`}
          onClick={() => setPhase("match")}
        >
          🔗 Match
        </button>
        <button
  className={`tab-btn ${phase === "review" ? "active" : ""}`}
  onClick={() => setPhase("review")}
>
  ✍️ Review
</button>
      </div>

      {/* PHASE 1: MATCHING BOARD */}
      {phase === "match" && (
  <div className="card match-phase">
    <p className="phase-intro">
      Match each definition (left) with the correct word or phrase (right). Some words on the right
      are extra and do not have a match.
    </p>

    <div className="match-columns">
      {/* LEFT: DEFINITIONS */}
      <div className="match-col">
        <h3 className="col-title">Picture clues</h3>
        <ul className="match-list">
  {leftItems.map((item, i) => {
    const matched = matchedDefs.includes(item.definition);
    const isSelected = selectedDef === item.definition;
    const isShaking = shakeDef === item.definition;
    const showDef = showDefs[item.definition];

    return (
      <li key={i} className="match-tile">
  <button
    className={
      "tile " +
      (matched ? "done " : "") +
      (isSelected ? "selected " : "") +
      (isShaking ? "shake " : "") +
      (pulseItems.def === item.definition ? "pulse " : "")
    }
    onClick={() => handleDefClick(item.definition)}
  >
    <img src={item.image} alt={item.term} className="thumb" />

    {/* in-tile info button */}
    <span
      className="info-dot"
      onClick={(e) => {
        e.stopPropagation(); // don't select the tile
        setShowDefs((prev) => ({
          ...prev,
          [item.definition]: !prev[item.definition],
        }));
      }}
      aria-label="Show definition"
      title="Show definition"
    >
      i
    </span>

    {/* compact overlay definition (only if toggled) */}
    {showDefs[item.definition] && (
      <div className="def-pop">
        {item.definition}
      </div>
    )}
  </button>
</li>
    );
  })}
</ul>

      </div>

      {/* RIGHT: TERMS */}
      <div className="match-col">
        <h3 className="col-title">Words / phrases</h3>
        <ul className="match-list">
          {rightItems.map((term, i) => {
            const matched = matchedTerms.includes(term);
            const isSelected = selectedTerm === term;
            const isShaking = shakeTerm === term;
            return (
              <li key={i}>
                <button
  className={
    "match-item " +
    (matched ? "done " : "") +
    (isSelected ? "selected " : "") +
    (isShaking ? "shake " : "") +
    (pulseItems.term === term ? "pulse " : "")
  }
  onClick={() => handleTermClick(term)}
>
  {term}
</button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>

    {feedbackFlash === "correct" && (
      <p className="feedback good">✅ Correct match!</p>
    )}
    {feedbackFlash === "wrong" && (
      <p className="feedback bad">❌ Not a match.</p>
    )}

    {allMatched && (
  <div className="review-prompt">
    <p>✅ Good job! You matched everything correctly.</p>
    <button className="review-btn" onClick={() => setPhase("review")}>
      Test yourself →
    </button>
  </div>
)}

    <p className="counter">
      {matchedTerms.length} / {activeSet.pairs.length} matched
    </p>
  </div>
)}


      {/* PHASE 2: REVIEW (gap-fill ALL items from this set) */}
      {phase === "review" && (
  <div className="card review-phase">
    <p className="phase-intro">
      Type the missing word or phrase to complete each sentence.
    </p>

    <p className="prompt">{reviewItem.sentence}</p>

    <input
  ref={inputRef}
  type="text"
  className="answer-input"
  placeholder="Type your answer..."
  value={typedAnswer}
  onChange={(e) => setTypedAnswer(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (showReviewFeedback) {
        nextReview();          // Enter again moves to next, regardless of correctness
      } else {
        checkTypedAnswer();    // First Enter checks the answer
      }
    }
  }}
  disabled={showReviewFeedback}
/>

    {!showReviewFeedback && (
      <button className="review-btn" onClick={checkTypedAnswer}>
        Check
      </button>
    )}

    {showReviewFeedback && (
      <div className="explanation-block">
        {isCorrect ? (
          <p className="good">✅ Great! “{reviewItem.answer}” is correct.</p>
        ) : (
          <>
            <p className="bad">❌ Not quite.</p>
            <p>
              Correct answer: <strong>{reviewItem.answer}</strong>
            </p>
          </>
        )}
        <div className="nav-btns">
          <button className="review-btn" onClick={nextReview}>
            Next →
          </button>
        </div>
      </div>
    )}

    <p className="counter">
      {reviewIndex + 1} / {shuffledReview.length}
    </p>

    <div className="tips-block">
      <h4 className="tips-title">Common mistakes</h4>
      <ul className="tips-list">
        {activeSet.tips.map((tip, i) => (
          <li key={i}>{tip}</li>
        ))}
      </ul>
    </div>
  </div>
)}


      <button
        className="topbar-btn"
        onClick={onBack}
        style={{ marginTop: "1rem" }}
      >
        ← Back to Topics
      </button>

      <style>{`
        .stage-tabs {
          display:flex;
          justify-content:center;
          gap:1rem;
          margin-bottom:1rem;
          flex-wrap:wrap;
        }
        .tab-btn {
          background:#101b32;
          border:1px solid #2c4b83;
          border-radius:8px;
          color:#cfd9f3;
          padding:.5rem 1rem;
          cursor:pointer;
          transition:all .15s ease;
        }
        .tab-btn.active {
          background:#1f3560;
          border-color:#4a79d8;
          color:#fff;
        }

        .card {
          background:#13213b;
          border:1px solid #2c4b83;
          border-radius:12px;
          padding:1.2rem;
          color:#e6f0ff;
          margin-bottom:1rem;
        }

        .phase-intro {
          color:#cfd9f3;
          font-size:.9rem;
          margin-bottom:1rem;
          line-height:1.4;
        }

        /* MATCH PHASE */
        .match-columns {
          display:flex;
          flex-direction:column;
          gap:1rem;
        }
        @media(min-width:700px){
          .match-columns {
            flex-direction:row;
          }
        }

        .match-col {
          flex:1;
        }

        .col-title {
          color:#ffcf40;
          font-size:1rem;
          margin:0 0 .5rem;
          font-weight:600;
        }

        .match-list {
          list-style:none;
          margin:0;
          padding:0;
          display:flex;
          flex-direction:column;
          gap:.5rem;
        }

        .match-item {
          width:100%;
          text-align:left;
          background:#101b32;
          border:1px solid #2c4b83;
          border-radius:8px;
          color:#e6f0ff;
          padding:.6rem .8rem;
          cursor:pointer;
          line-height:1.4;
          transition:all .12s ease;
        }
        .match-item.def {
          font-size:.9rem;
          color:#cfd9f3;
        }
        .match-item.selected {
          border-color:#4a79d8;
          background:#16284a;
        }
        .match-item.done {
  background: #224a2d !important;
  border-color: #3cb371 !important;
  color: #fff !important;
}

/* Shake animation for wrong attempts */
@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  50% { transform: translateX(4px); }
  75% { transform: translateX(-3px); }
  100% { transform: translateX(0); }
}

.match-item.shake {
  animation: shake 0.3s ease;
  border-color: #d84a4a;
  background: #4a2121;
}

/* Green pulse on correct match */
@keyframes pulseGreen {
  0% { transform: scale(1); background-color: #224a2d; }
  40% { transform: scale(1.05); background-color: #2b6e3f; }
  100% { transform: scale(1); background-color: #224a2d; }
}

.match-item.pulse {
  animation: pulseGreen 0.4s ease;
}



        .feedback {
          margin-top:.8rem;
          font-size:.9rem;
          font-weight:500;
        }
        .good { color:#6ddc88; }
        .bad { color:#ff6b6b; }

        .all-done-note {
          background:#0e1a30;
          border-left:3px solid #4a79d8;
          border-radius:6px;
          padding:.6rem .8rem;
          color:#cfd9f3;
          font-size:.9rem;
          margin-top:.8rem;
        }

        /* REVIEW PHASE */
        .prompt {
          font-weight:600;
          margin-bottom:.8rem;
          color:#e6f0ff;
        }

        .word-bank {
          display:flex;
          flex-wrap:wrap;
          gap:.5rem;
          margin-bottom:1rem;
        }

        .bank-word {
          background:#101b32;
          border:1px solid #2c4b83;
          border-radius:8px;
          color:#e6f0ff;
          padding:.5rem .7rem;
          cursor:pointer;
          font-size:.9rem;
          line-height:1.3;
          transition:all .12s ease;
          text-align:left;
        }
        .bank-word.correct {
          background:#224a2d;
          border-color:#3cb371;
          color:#fff;
        }
        .bank-word.wrong {
          background:#4a2121;
          border-color:#d84a4a;
          color:#fff;
        }

        .explanation-block {
          background:#0e1a30;
          border-left:3px solid #4a79d8;
          padding:.6rem .8rem;
          border-radius:6px;
          color:#cfd9f3;
          font-size:.9rem;
          line-height:1.4;
        }

        .tips-block {
          margin-top:1rem;
          background:#101b32;
          border:1px solid #2c4b83;
          border-radius:8px;
          padding:.8rem 1rem;
        }
        .tips-title {
          margin:0 0 .5rem;
          font-size:.9rem;
          color:#ffcf40;
          font-weight:600;
        }
        .tips-list {
          margin:0;
          padding-left:1.2rem;
          color:#cfd9f3;
          font-size:.85rem;
          line-height:1.4;
        }
        .tips-list li {
          margin-bottom:.4rem;
        }

        .counter {
          text-align:center;
          margin-top:.5rem;
          color:#a9b7d1;
          font-size:.8rem;
        }

        .nav-btns {
          display:flex;
          justify-content:center;
          gap:1rem;
          margin-top:1rem;
        }
        .answer-input {
  width: 100%;
  background: #101b32;
  border: 1px solid #2c4b83;
  border-radius: 8px;
  color: #e6f0ff;
  font-size: 1rem;
  padding: 0.6rem 0.8rem;
  margin-bottom: 1rem;
  outline: none;
  transition: all 0.15s ease;
}
.answer-input:focus {
  border-color: #4a79d8;
  background: #16284a;
}
.match-thumb {
  width: 64px;              /* 👈 fixed icon size */
  height: 64px;
  object-fit: contain;      /* ensures full image fits inside without cropping */
  display: block;
  margin: 0 auto 0.4rem;    /* center + spacing */
  pointer-events: none;     /* prevents drag issues */
  transition: transform 0.2s ease;
}

.match-item:hover .match-thumb {
  transform: scale(1.05);   /* tiny hover pop, optional */
}
@media (max-width: 480px) {
  .match-thumb {
    width: 48px;
    height: 48px;
  }
}
/* Layout tightening */
.match-columns { gap: 14px; }
.match-list { gap: 8px; }

/* Left tiles (image cards) */
.match-tile { list-style: none; }
/* ✳️ Main tile button */
.tile {
  position: relative;
  width: 100%;
  min-height: 64px;            /* ↓ smaller overall */
  background: #101b32;
  border: 1px solid #2c4b83;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  cursor: pointer;
  transition: border-color .12s ease, background .12s ease;
}

.tile.selected { background:#16284a; border-color:#4a79d8; }
.tile.done     { background:#214a2a; border-color:#3cb371; }

/* Icon size (always small) */
.thumb {
  width: 48px;
  height: 48px;
  object-fit: contain;
  pointer-events: none;
}

@media (max-width:600px){
  .thumb { width: 40px; height: 40px; }
}

/* In-tile info button (top-right) */
.info-dot {
  position: absolute;
  top: 4px; right: 4px;
  width: 18px; height: 18px;
  font-size: 11px;
  display: grid; place-items: center;
  font-weight: 700;
  color: #0f1220;
  background: #ffcf40;
  border-radius: 999px;
  box-shadow: 0 1px 0 rgba(0,0,0,.25);
}
.tile.done .info-dot { background:#ffe077; }

/* Compact definition overlay INSIDE the tile */
.def-pop {
  position: absolute;
  left: 6px; right: 6px; bottom: 4px;
  background: rgba(14,26,48,.97);
  border: 1px solid #2c4b83;
  border-radius: 6px;
  padding: 4px 6px;
  color: #cfd9f3;
  font-size: .75rem;
  line-height: 1.2;
  pointer-events: none;
}

/* Right column list items a bit slimmer */
.match-col:last-child .match-item {
  min-height: 44px;
  padding: .5rem .7rem;
}

/* Keep your shake + pulse animations as you had them */

.card.match-phase { padding: .9rem; }
.col-title { margin-bottom: .4rem; }

.review-prompt {
  margin-top: 1rem;
  background: #0e1b33;
  border: 1px solid #2c4b83;
  border-radius: 10px;
  padding: 0.9rem 1rem;
  text-align: center;
  color: #cfd9f3;
  animation: fadeIn 0.4s ease;
}

.review-prompt p {
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
}

.review-btn {
  background: linear-gradient(135deg, #4a79d8, #6289ff);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.4rem 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.review-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 6px rgba(98,137,255,0.4);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

      `}</style>
    </div>
  );
}
