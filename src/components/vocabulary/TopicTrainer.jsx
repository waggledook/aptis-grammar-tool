// src/components/vocabulary/TopicTrainer.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { travelData } from "./data/travelData";

const TOPIC_DATA = {
  travel: travelData
  // work: workData,
  // health: healthData,
  // etc.
};

export default function TopicTrainer({
  topic,
  onBack,
  isAuthenticated = false,
  onShowFlashcards,
}) {
  const topicInfo = TOPIC_DATA[topic] || null;

  const [setIndex, setSetIndex] = useState(null);
  const [hasChosenSet, setHasChosenSet] = useState(false); // 👈 NEW

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
  const [reviewIndex, setReviewIndex] = useState(0);
  const [chosenAnswer, setChosenAnswer] = useState(null);
  const [showReviewFeedback, setShowReviewFeedback] = useState(false);
  const [showReviewImage, setShowReviewImage] = useState(false);

  // Track sentences the student got wrong on the first run
  const [mistakes, setMistakes] = useState([]);     // array of review items
  const [mistakeMode, setMistakeMode] = useState(false); // false = full set, true = only mistakes

  if (!topicInfo) {
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
  

  const currentReviewList = mistakeMode ? mistakes : shuffledReview;
  const reviewItem = currentReviewList[reviewIndex];  // ✅ use the active list
  const wordBank = activeSet ? activeSet.pairs.map((p) => p.term) : [];

  const answerOptions = reviewItem?.answer
    ? reviewItem.answer
        .split("/")
        .map((a) => a.trim().toLowerCase())
        .filter(Boolean)
    : [];

  const cluePair =
    activeSet?.pairs?.find((p) => {
      const term = p.term.toLowerCase();
      return answerOptions.some(
        (opt) =>
          term === opt || term.includes(opt) || opt.includes(term)
      );
    }) || null;

  const [typedAnswer, setTypedAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef(null);

  const totalItems = shuffledReview.length;
  const firstRunCorrect = totalItems - mistakes.length;

// 🔍 Focus input whenever we go into review / move on
useEffect(() => {
  if (phase === "review" && inputRef.current) {
    inputRef.current.focus();
  }
}, [phase, reviewIndex]);

// 🔁 Reset everything when we change to a different set
useEffect(() => {
  if (!activeSet) return;

  setPhase("match");

  // Match state
  setMatchedTerms([]);
  setMatchedDefs([]);
  setSelectedDef(null);
  setSelectedTerm(null);
  setFeedbackFlash(null);
  setShakeDef(null);
  setShakeTerm(null);
  setPulseItems({ def: null, term: null });
  setShowDefs({});

  // Review state
  setReviewIndex(0);
  setChosenAnswer(null);
  setShowReviewFeedback(false);
  setTypedAnswer("");
  setIsCorrect(false);
  setShowReviewImage(false);   // 👈 reset picture clue
  setMistakes([]);       // 👈 new
  setMistakeMode(false); // 👈 new
}, [activeSet]);

function checkTypedAnswer() {
  if (!reviewItem) return;

  const cleanUser = typedAnswer.trim().toLowerCase();
  const cleanCorrect = reviewItem.answer.trim().toLowerCase();

  const acceptableAnswers = cleanCorrect
    .split("/")
    .map((a) => a.trim().toLowerCase());

  const correct = acceptableAnswers.includes(cleanUser);
  setIsCorrect(correct);
  setShowReviewFeedback(true);

  if (!correct && !mistakeMode) {
    // Store this sentence as a mistake (only on the first full run)
    setMistakes((prev) => {
      const already = prev.some(
        (item) => item.sentence === reviewItem.sentence
      );
      if (already) return prev;
      return [...prev, reviewItem];
    });
  }

  if (correct) {
    // ✅ Auto-advance after short delay
    setTimeout(() => {
      nextReview();
    }, 1500);
  }
  // ❌ Incorrect: waits for Enter → nextReview()
}


  function handleChooseAnswer(ans) {
    if (showReviewFeedback) return;
    setChosenAnswer(ans);
    setShowReviewFeedback(true);
  }

  function nextReview() {
    const list = mistakeMode ? mistakes : shuffledReview;

    setShowReviewImage(false); // reset picture clue for the new sentence

    const next = reviewIndex + 1;
    if (next < list.length) {
      setReviewIndex(next);
      setTypedAnswer("");
      setShowReviewFeedback(false);
      setIsCorrect(false);
    } else {
      // finished this run – move index past the end so reviewItem becomes undefined
      setReviewIndex(next);
      setTypedAnswer("");
      setShowReviewFeedback(false);
      setIsCorrect(false);
    }
  }

  function restartMistakes() {
    if (mistakes.length === 0) return;
    setMistakeMode(true);
    setReviewIndex(0);
    setTypedAnswer("");
    setShowReviewFeedback(false);
    setIsCorrect(false);
    setShowReviewImage(false);
  }

  function restartFullReview() {
    setMistakeMode(false);
    setMistakes([]);
    setReviewIndex(0);
    setTypedAnswer("");
    setShowReviewFeedback(false);
    setIsCorrect(false);
    setShowReviewImage(false);
  }



  return (
    <div className="topic-trainer game-wrapper fade-in">
            <header className="header">
        <h2 className="title" style={{ textTransform: "capitalize" }}>
          {topic}
          {activeSet ? ` • ${activeSet.title}` : ""}
        </h2>
        <p className="intro">
          {activeSet
            ? activeSet.focus
            : "Choose a set below to start practising this topic."}
        </p>
      </header>

      {/* SET SELECTOR */}
      <div className="set-tabs">
        <span className="set-label">Set:</span>
        <div className="set-pill-row">
          {topicInfo.sets.map((set, idx) => (
            <button
              key={set.id}
              className={
                "set-pill " + (idx === setIndex ? "active" : "")
              }
              onClick={() => {
                setSetIndex(idx);
                setHasChosenSet(true);
              }}
            >
              {set.title}
            </button>
          ))}
        </div>
      </div>

      {/* If no set selected yet, show intro + big buttons */}
      {!hasChosenSet && (
        <div className="card set-select">
          <p className="phase-intro">
            Choose a topic set to begin practising this theme.
          </p>
          <div className="set-pill-row">
            {topicInfo.sets.map((set, idx) => (
              <button
                key={set.id}
                className="review-btn"
                onClick={() => {
                  setSetIndex(idx);
                  setHasChosenSet(true);
                }}
              >
                {set.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Flashcards CTA – now below the set chooser */}
      {onShowFlashcards && (
        <div className="flashcards-cta">
          <button
            className="flashcards-btn"
            onClick={onShowFlashcards}
          >
            🃏 Flashcards for this topic
          </button>
          <p className="flashcards-sub">
            Review all the words in this topic as simple flip cards.
          </p>
        </div>
      )}

      {/* PHASE TOGGLE / PROGRESSION – only once a set is chosen */}
      {hasChosenSet && (
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
      )}

      {/* PHASE 1: MATCHING BOARD */}
      {hasChosenSet && phase === "match" && (
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
            {hasChosenSet && phase === "review" && (
        <div className="card review-phase">
          <p className="phase-intro">
            Type the missing word or phrase to complete each sentence.
          </p>

          {reviewItem ? (
            <>
              <p className="prompt">{reviewItem.sentence}</p>

              {cluePair && cluePair.image && (
                <div className="clue-area">
                  <button
                    type="button"
                    className="clue-btn"
                    onClick={() =>
                      setShowReviewImage((prev) => !prev)
                    }
                  >
                    {showReviewImage ? "Hide picture clue" : "Picture clue"}
                  </button>

                  {showReviewImage && (
                    <div className="clue-image-wrapper">
                      <img
                        src={cluePair.image}
                        alt={cluePair.term}
                        className="clue-image"
                      />
                    </div>
                  )}
                </div>
              )}

              <input
                ref={inputRef}
                type="text"
                className="answer-input"
                placeholder="Type your answer..."
                value={typedAnswer}
                onChange={(e) => {
                  if (showReviewFeedback) return; // freeze text after feedback
                  setTypedAnswer(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (showReviewFeedback) {
                      nextReview(); // Enter after feedback → next
                    } else {
                      checkTypedAnswer(); // first Enter → check
                    }
                  }
                }}
              />

              {!showReviewFeedback && (
                <button className="review-btn" onClick={checkTypedAnswer}>
                  Check
                </button>
              )}

              {showReviewFeedback && (
                <div className="explanation-block">
                  {isCorrect ? (
                    <p className="good">
                      ✅ Great! “{reviewItem.answer}” is correct.
                    </p>
                  ) : (
                    <>
                      <p className="bad">❌ Not quite.</p>
                      <p>
                        Correct answer:{" "}
                        <strong>{reviewItem.answer}</strong>
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
                {reviewIndex + 1} / {currentReviewList.length}
              </p>
            </>
          ) : (
            <div className="review-complete">
              <h3 className="col-title">Set complete</h3>

              {!mistakeMode && (
                <>
                  <p>
                    You answered{" "}
                    <strong>
                      {firstRunCorrect} / {totalItems}
                    </strong>{" "}
                    correctly on the first try.
                  </p>
                  {mistakes.length > 0 ? (
                    <>
                      <p>
                        You had{" "}
                        <strong>{mistakes.length}</strong> sentence
                        {mistakes.length === 1 ? "" : "s"} to practise
                        again.
                      </p>
                      <div className="nav-btns">
                        <button
                          className="review-btn"
                          onClick={restartMistakes}
                        >
                          Review only my mistakes
                        </button>
                        <button
                          className="review-btn secondary"
                          onClick={restartFullReview}
                        >
                          Start full review again
                        </button>
                      </div>
                    </>
                  ) : (
                    <p>Brilliant — you got everything right first time!</p>
                  )}
                </>
              )}

              {mistakeMode && (
                <>
                  <p>
                    You’ve gone through all your mistake sentences again.
                  </p>
                  <div className="nav-btns">
                    <button
                      className="review-btn secondary"
                      onClick={restartFullReview}
                    >
                      Start full review again
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

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

                .set-tabs {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: .5rem .75rem;
          margin-bottom: 1rem;
        }

        .set-label {
          font-size: .85rem;
          text-transform: uppercase;
          letter-spacing: .08em;
          color: #9fb0e0;
        }

        .set-pill-row {
          display: flex;
          flex-wrap: wrap;
          gap: .5rem;
        }

        .set-pill {
          border-radius: 999px;
          border: 1px solid #2c4b83;
          background: #101b32;
          color: #cfd9f3;
          padding: .25rem .8rem;
          font-size: .85rem;
          cursor: pointer;
          transition: all .15s ease;
        }

        .set-pill:hover {
          background: #182544;
        }

        .set-pill.active {
          background: #1f3560;
          border-color: #4a79d8;
          color: #fff;
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

        .review-complete {
          margin-top: 0.5rem;
          background: #0e1b33;
          border: 1px solid #2c4b83;
          border-radius: 10px;
          padding: 0.9rem 1rem;
          color: #cfd9f3;
          text-align: left;
          font-size: 0.9rem;
        }

        .review-btn.secondary {
          background: #101b32;
          border: 1px solid #4a79d8;
          color: #cfd9f3;
        }

        .review-btn.secondary:hover {
          background: #1f3560;
          box-shadow: none;
        }


@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
        .clue-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;              /* adds consistent spacing between button & image */
          margin-bottom: 0.75rem;   /* space below before the input box */
        }

        .clue-btn {
          font-size: 0.8rem;
          padding: 0.3rem 0.8rem;
          border-radius: 999px;
          border: 1px solid #2c4b83;
          background: #101b32;
          color: #cfd9f3;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease;
        }

        .clue-btn:hover {
          background: #1f3560;
          border-color: #4a79d8;
        }

        .clue-image-wrapper {
          display: flex;
          justify-content: center;
        }

        .clue-image {
          width: 72px;
          height: 72px;
          object-fit: contain;
          filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.45));
        }
        .card.set-select {
          text-align: center;
        }
        .card.set-select .set-pill-row {
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .flashcards-cta {
          margin-top: 0.5rem;
          margin-bottom: 0.75rem;
          text-align: center;
        }

        .flashcards-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          background: #101b32;
          border-radius: 999px;
          border: 1px solid #4a79d8;
          padding: 0.45rem 1.3rem;
          color: #e6f0ff;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
        }

        .flashcards-btn:hover {
          background: #1f3560;
          box-shadow: 0 0 6px rgba(98,137,255,0.4);
          transform: translateY(-1px);
        }

        .flashcards-sub {
          margin-top: 0.25rem;
          font-size: 0.8rem;
          color: #a9b7d1;
        }



      `}</style>
    </div>
  );
}
