// src/components/vocabulary/VocabReviewPlayer.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import { recordVocabMistake } from "../../firebase";
import { TOPIC_DATA } from "./data/vocabTopics";

function escRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenMatch(term, opt) {
  if (!term || !opt) return false;
  if (term === opt) return true;

  const t = term.replace(/[-–—]/g, " ");
  const o = opt.replace(/[-–—]/g, " ");

  const reOptInTerm = new RegExp(`(^|\\s)${escRe(o)}(\\s|$)`, "i");
  if (reOptInTerm.test(t)) return true;

  const reTermInOpt = new RegExp(`(^|\\s)${escRe(t)}(\\s|$)`, "i");
  if (reTermInOpt.test(o)) return true;

  return false;
}

function normalizeAnswers(answerStr) {
  return String(answerStr || "")
    .toLowerCase()
    .split(/[\/,]/g)
    .map((a) => a.trim())
    .filter(Boolean);
}

function getPairsFor(topicId, setId) {
  const topic = TOPIC_DATA?.[topicId];
  if (!topic?.sets) return [];
  const set = topic.sets.find((s, idx) => String(s.id ?? idx) === String(setId));
  return set?.pairs || [];
}

/**
 * items: [{ topicId, setId, sentence, answer }]
 * tips: optional array of strings (TopicTrainer passes activeSet.tips)
 * onFirstRunComplete: optional callback for TopicTrainer to save progress
 */
export default function VocabReviewPlayer({
  items = [],
  tips = null,
  onExit,
  isSignedIn = false,
  onFirstRunComplete = null,
  title = "Review",
  intro = "Type the missing word or phrase to complete each sentence.",
  showTopicLabels = false,
}) {
  const [reviewIndex, setReviewIndex] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [showReviewFeedback, setShowReviewFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showReviewImage, setShowReviewImage] = useState(false);

  const [mistakes, setMistakes] = useState([]); // store review items
  const [mistakeMode, setMistakeMode] = useState(false);

  const inputRef = useRef(null);
  const didFireFirstRunComplete = useRef(false);

  const currentReviewList = mistakeMode ? mistakes : items;
  const reviewItem = currentReviewList[reviewIndex];

  const totalItems = items.length;
  const firstRunCorrect = totalItems - mistakes.length;

  // Focus input when entering / advancing
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [reviewIndex, mistakeMode]);

  // Fire onFirstRunComplete once when full run finishes
  useEffect(() => {
    const endOfFirstRun =
      !mistakeMode && totalItems > 0 && !reviewItem && reviewIndex >= totalItems;

    if (!endOfFirstRun) return;
    if (!onFirstRunComplete) return;
    if (didFireFirstRunComplete.current) return;

    didFireFirstRunComplete.current = true;

    onFirstRunComplete({
      totalItems,
      correctFirstTry: firstRunCorrect,
      mistakesCount: mistakes.length,
    });
  }, [mistakeMode, totalItems, reviewItem, reviewIndex, onFirstRunComplete, firstRunCorrect, mistakes.length]);

  const cluePair = useMemo(() => {
    if (!reviewItem) return null;

    const answerOptions = normalizeAnswers(reviewItem.answer);
    if (!answerOptions.length) return null;

    const pairs = getPairsFor(reviewItem.topicId, reviewItem.setId);

    return (
      pairs.find((p) => {
        const term = (p.term || "").toLowerCase().trim();
        return answerOptions.some((opt) => tokenMatch(term, opt));
      }) || null
    );
  }, [reviewItem]);

  function checkTypedAnswer() {
    if (!reviewItem) return;

    const cleanUser = typedAnswer.trim().toLowerCase();
    const acceptable = normalizeAnswers(reviewItem.answer);

    const correct = acceptable.includes(cleanUser);
    setIsCorrect(correct);
    setShowReviewFeedback(true);

    if (!correct && !mistakeMode) {
      // add to session mistakes (first run only)
      setMistakes((prev) => {
        const already = prev.some((x) => x.sentence === reviewItem.sentence);
        return already ? prev : [...prev, reviewItem];
      });

      // persist to profile mistakes
      if (isSignedIn) {
        recordVocabMistake({
          topic: reviewItem.topicId,
          setId: reviewItem.setId,
          sentence: reviewItem.sentence,
          correctAnswer: reviewItem.answer,
          userAnswer: typedAnswer.trim(),
        }).catch((err) =>
          console.error("[VocabReviewPlayer] recordVocabMistake failed", err)
        );
      }
    }

    if (correct) {
      setTimeout(() => nextReview(), 1500);
    }
  }

  function nextReview() {
    const list = mistakeMode ? mistakes : items;

    setShowReviewImage(false);

    const next = reviewIndex + 1;
    if (next < list.length) {
      setReviewIndex(next);
      setTypedAnswer("");
      setShowReviewFeedback(false);
      setIsCorrect(false);
    } else {
      setReviewIndex(next); // push past end
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
    didFireFirstRunComplete.current = false;
    setMistakeMode(false);
    setMistakes([]);
    setReviewIndex(0);
    setTypedAnswer("");
    setShowReviewFeedback(false);
    setIsCorrect(false);
    setShowReviewImage(false);
  }

  if (!items.length) {
    return (
      <div className="topic-trainer game-wrapper fade-in">
        <header className="header">
          <h2 className="title">{title}</h2>
          <p className="intro">No review sentences found for this selection.</p>
        </header>

        <button className="topbar-btn" onClick={onExit}>
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="topic-trainer game-wrapper fade-in">
      <header className="header">
        <h2 className="title">{title}</h2>
        <p className="intro">{intro}</p>
      </header>

      <button className="topbar-btn" onClick={onExit}>
        ← Back
      </button>

      <div className="card review-phase">
        {reviewItem ? (
          <>
            {showTopicLabels ? (
  <p className="review-label">
    {(reviewItem.topicTitle || reviewItem.topicId)} •{" "}
    {(reviewItem.setTitle || reviewItem.setId)}
  </p>
) : null}

            <p className="prompt">{reviewItem.sentence}</p>

            {cluePair && cluePair.image ? (
              <div className="clue-area">
                <button
                  type="button"
                  className="clue-btn"
                  onClick={() => setShowReviewImage((prev) => !prev)}
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
            ) : null}

            <input
              ref={inputRef}
              type="text"
              className="answer-input"
              placeholder="Type your answer..."
              value={typedAnswer}
              onChange={(e) => {
                if (showReviewFeedback) return;
                setTypedAnswer(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (showReviewFeedback) nextReview();
                  else checkTypedAnswer();
                }
              }}
            />

            {!showReviewFeedback ? (
              <button className="review-btn" onClick={checkTypedAnswer}>
                Check
              </button>
            ) : (
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
              {reviewIndex + 1} / {currentReviewList.length}
            </p>
          </>
        ) : (
          <div className="review-complete">
            <h3 className="col-title">Session complete</h3>

            {!mistakeMode ? (
              <>
                <p>
                  You answered <strong>{firstRunCorrect} / {totalItems}</strong>{" "}
                  correctly on the first try.
                </p>

                {mistakes.length > 0 ? (
                  <>
                    <p>
                      You had <strong>{mistakes.length}</strong> sentence
                      {mistakes.length === 1 ? "" : "s"} to practise again.
                    </p>
                    <div className="nav-btns">
                      <button className="review-btn" onClick={restartMistakes}>
                        Review only my mistakes
                      </button>
                      <button className="review-btn secondary" onClick={restartFullReview}>
                        Start full review again
                      </button>
                    </div>
                  </>
                ) : (
                  <p>Brilliant — you got everything right first time!</p>
                )}
              </>
            ) : (
              <>
                <p>You’ve gone through all your mistake sentences again.</p>
                <div className="nav-btns">
                  <button className="review-btn secondary" onClick={restartFullReview}>
                    Start full review again
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {Array.isArray(tips) && tips.length > 0 ? (
          <div className="tips-block">
            <h4 className="tips-title">Common mistakes</h4>
            <ul className="tips-list">
              {tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      <style>{`
  /* --- Shared review styling (matches TopicTrainer) --- */

  .review-phase{
    background:#13213b;
    border:1px solid #2c4b83;
    border-radius:12px;
    padding:1.2rem 1.3rem;
    color:#e6f0ff;
  }

  .review-label{
    margin:0 0 .9rem;
    color:#cfd9f3;
    opacity:.9;
    font-size:1.05rem;
  }

  .prompt{
    font-size:1.7rem;
    font-weight:700;
    line-height:1.35;
    margin: .2rem 0 1rem;
    text-align:center;
  }

  .clue-area{
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:.75rem;
    margin:.2rem 0 1rem;
  }

  .clue-btn{
    background:#101b32;
    border:1px solid #2c4b83;
    color:#e6f0ff;
    padding:.55rem 1.1rem;
    border-radius:12px;
    cursor:pointer;
  }

  .clue-btn:hover{
    border-color:#4a79d8;
  }

  .clue-image-wrapper{
    display:flex;
    justify-content:center;
    width:100%;
  }

  .clue-image{
    max-width:260px;
    height:auto;
    border-radius:12px;
    background:#101b32;
    border:1px solid #2c4b83;
    padding:.8rem;
    display:block;
  }

  .answer-input{
    width:100%;
    padding:1rem 1.1rem;
    border-radius:12px;
    border:1px solid #2c4b83;
    background:#101b32;
    color:#e6f0ff;
    font-size:1.15rem;
    outline:none;
    margin: .25rem 0 1rem;
  }

  .answer-input:focus{
    border-color:#4a79d8;
    box-shadow:0 0 0 2px rgba(74,121,216,.25);
  }

  /* keep your existing .review-btn styles, but ensure spacing */
  .review-phase .review-btn{
    min-width: 140px;
  }

  .counter{
    text-align:center;
    margin-top:1rem;
    color:#9fb0e0;
    font-size:1.1rem;
  }

  .explanation-block{
    margin-top:1rem;
    padding:1rem;
    border-radius:12px;
    background:#101b32;
    border:1px solid #2c4b83;
  }

  .good{ color:#8ee6b5; font-weight:800; }
  .bad{ color:#ff9aa2; font-weight:800; }

  .review-complete{
    text-align:center;
  }

  .tips-block{
    margin-top:1.2rem;
    padding:1rem;
    border-radius:12px;
    background:#101b32;
    border:1px solid #2c4b83;
  }

  .tips-title{
    margin:0 0 .6rem;
    color:#f6c84f;
    font-weight:800;
    font-size:1.2rem;
  }

  .tips-list{
    margin:0;
    padding-left:1.25rem;
    color:#cfd9f3;
    line-height:1.45;
    text-align:left;
  }
`}</style>

    </div>
  );
}