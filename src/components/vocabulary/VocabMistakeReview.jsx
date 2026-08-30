// src/components/vocabulary/VocabMistakeReview.jsx
import React, { useEffect, useState, useRef } from "react";
import { auth } from "../../firebase";
import {
  fetchUnresolvedVocabMistakes,
  resolveVocabMistake,
} from "../../firebase";
import { TOPIC_DATA } from "./data/vocabTopics";
import {
  findHubSourceContext,
  getHubReviewChoice,
  getHubReviewInstruction,
  getHubReviewPrompt,
  getReviewAcceptedAnswers,
  isAcceptedReviewAnswer,
} from "./utils/hubVocabMistakeReview.js";

function collapseDuplicateHubMistakes(items = []) {
  const bySourceItem = new Map();
  const output = [];

  items.forEach((item) => {
    if (item?.source !== "hub-textbook" || !item.topic || !item.setId || !item.itemId) {
      output.push({ ...item, mistakeIds: [item.id] });
      return;
    }
    const key = `${item.topic}:${item.setId}:${item.itemId}`;
    const existing = bySourceItem.get(key);
    if (existing) {
      existing.mistakeIds.push(item.id);
      return;
    }
    const merged = { ...item, mistakeIds: [item.id] };
    bySourceItem.set(key, merged);
    output.push(merged);
  });

  return output;
}

function getHotspotReviewVisual(item, sourceContext) {
  const isHotspotActivity = item?.activityType === "image-hotspot-match"
    || item?.activityType === "image-hotspot-type-answer"
    || sourceContext?.activity?.type === "image-hotspot-match"
    || sourceContext?.activity?.type === "image-hotspot-type-answer";
  if (!isHotspotActivity) return null;

  const { theme, activity, entry } = sourceContext || {};
  const entries = Array.isArray(sourceContext?.entries) ? sourceContext.entries : [];
  const configuredRounds = Array.isArray(activity?.rounds) ? activity.rounds : [];
  const round = configuredRounds.find((candidate) => {
    const entryIds = candidate.entryIds || [];
    const categories = candidate.categories || [];
    return entryIds.includes(entry?.id) || categories.includes(entry?.category);
  }) || null;
  const roundEntries = round
    ? entries.filter((candidate) => (
      (round.entryIds || []).includes(candidate.id)
      || (round.categories || []).includes(candidate.category)
    ))
    : entries;
  const roundNumber = entry
    ? roundEntries.findIndex((candidate) => candidate.id === entry.id) + 1
    : 0;

  const sceneImage = activity?.sceneImage || theme?.sceneImage || item?.sceneImage || "";
  const hotspotX = Number(entry?.hotspotX ?? item?.hotspotX);
  const hotspotY = Number(entry?.hotspotY ?? item?.hotspotY);
  if (!sceneImage || !Number.isFinite(hotspotX) || !Number.isFinite(hotspotY)) return null;

  return {
    sceneImage,
    hotspotX,
    hotspotY,
    hotspotNumber: Number(item?.hotspotNumber) || roundNumber || Number(entry?.hotspotNumber) || 1,
    viewBox: round?.viewBox || item?.hotspotViewBox || null,
  };
}

function HotspotReviewClue({ visual }) {
  const viewBox = visual?.viewBox;
  const hasViewBox = viewBox
    && Number(viewBox.width) > 0
    && Number(viewBox.height) > 0;
  const sceneStyle = hasViewBox
    ? { aspectRatio: `${(1.5 * viewBox.width) / viewBox.height}` }
    : undefined;
  const imageStyle = hasViewBox
    ? {
      height: `${10000 / viewBox.height}%`,
      left: `${(-viewBox.x * 100) / viewBox.width}%`,
      position: "absolute",
      top: `${(-viewBox.y * 100) / viewBox.height}%`,
      width: `${10000 / viewBox.width}%`,
    }
    : undefined;
  const left = hasViewBox
    ? ((visual.hotspotX - viewBox.x) / viewBox.width) * 100
    : visual.hotspotX;
  const top = hasViewBox
    ? ((visual.hotspotY - viewBox.y) / viewBox.height) * 100
    : visual.hotspotY;

  return (
    <div className="review-hotspot-scene" style={sceneStyle}>
      <img src={visual.sceneImage} alt="Mapped vocabulary scene" style={imageStyle} />
      <span
        className="review-hotspot-marker"
        style={{ left: `${left}%`, top: `${top}%` }}
        aria-label={`Number ${visual.hotspotNumber}`}
      >
        {visual.hotspotNumber}
      </span>
    </div>
  );
}

function ClockReviewClue({ hour, minute }) {
  const safeHour = Number(hour) || 0;
  const safeMinute = Number(minute) || 0;
  const hourAngle = ((safeHour % 12) * 30 + safeMinute * 0.5) * (Math.PI / 180);
  const minuteAngle = safeMinute * 6 * (Math.PI / 180);
  const handEnd = (angle, length) => ({
    x: 100 + Math.sin(angle) * length,
    y: 100 - Math.cos(angle) * length,
  });
  const hourEnd = handEnd(hourAngle, 48);
  const minuteEnd = handEnd(minuteAngle, 70);

  return (
    <div className="review-clock" role="img" aria-label="Analogue clock">
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <circle className="clock-face" cx="100" cy="100" r="92" />
        {Array.from({ length: 60 }, (_, index) => {
          const angle = index * 6 * (Math.PI / 180);
          const isHour = index % 5 === 0;
          const outer = handEnd(angle, 84);
          const inner = handEnd(angle, isHour ? 72 : 79);
          return (
            <line
              key={index}
              className={isHour ? "clock-mark hour" : "clock-mark"}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
            />
          );
        })}
        <line className="clock-hand hour" x1="100" y1="100" x2={hourEnd.x} y2={hourEnd.y} />
        <line className="clock-hand minute" x1="100" y1="100" x2={minuteEnd.x} y2={minuteEnd.y} />
        <circle className="clock-pin" cx="100" cy="100" r="5" />
      </svg>
    </div>
  );
}

function ImageReviewClue({ sources, focusArea = null }) {
  const availableSources = [...new Set(
    (Array.isArray(sources) ? sources : [sources]).filter(Boolean)
  )];
  const sourceKey = availableSources.join("|");
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [sourceKey]);

  const src = availableSources[sourceIndex] || "";
  if (!src) return null;
  const image = (
    <img
      src={src}
      alt=""
      className="clue-image"
      onError={() => setSourceIndex((currentIndex) => currentIndex + 1)}
    />
  );
  if (!focusArea) return <div className="clue-image-wrapper">{image}</div>;

  return (
    <div
      className="clue-image-wrapper has-focus"
      role="img"
      aria-label={focusArea.label || "The relevant part of the image is highlighted."}
    >
      {image}
      <span
        className="review-image-focus-marker"
        style={{
          left: `${focusArea.x}%`,
          top: `${focusArea.y}%`,
          width: `${focusArea.width}%`,
          height: `${focusArea.height}%`,
        }}
        aria-hidden="true"
      />
    </div>
  );
}

export default function VocabMistakeReview({ onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [index, setIndex] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [selectedChoice, setSelectedChoice] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const inputRef = useRef(null);

  // Load unresolved mistakes
  useEffect(() => {
    let alive = true;

    async function load() {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        if (alive) setLoading(false);
        return;
      }
      try {
        const data = await fetchUnresolvedVocabMistakes(50, uid);
        if (!alive) return;
        setItems(collapseDuplicateHubMistakes(data));
      } catch (err) {
        console.error("[VocabMistakeReview] load failed", err);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  // Focus input
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [index, showFeedback]);

  if (loading) {
    return (
      <div className="topic-trainer game-wrapper fade-in">
        <p>Loading vocab mistakes…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="topic-trainer game-wrapper fade-in">
        <header className="header">
          <h2 className="title">Vocab mistakes</h2>
          <p className="intro">All caught up – no active vocab mistakes 🎉</p>
        </header>
        <button className="topbar-btn" onClick={onBack}>
          ← Back
        </button>

        <style>{`
          .topic-trainer .card {
            background:#13213b;
            border:1px solid #2c4b83;
            border-radius:12px;
            padding:1.2rem;
            color:#e6f0ff;
            margin-bottom:1rem;
          }
        `}</style>
      </div>
    );
  }

  const current = items[index];
  const sourceContext = findHubSourceContext(current);
  const sourceEntry = sourceContext?.entry || null;
  const hotspotVisual = getHotspotReviewVisual(current, sourceContext);
  const choiceReview = getHubReviewChoice(current, sourceContext);
  const reviewPrompt = current.source === "hub-textbook"
    ? getHubReviewPrompt(current, sourceContext)
    : current.sentence;
  const reviewImageSources = [sourceEntry?.image, sourceEntry?.flag4x3, current.image].filter(Boolean);
  const reviewFocusArea = sourceEntry?.focusArea || current.focusArea || null;
  const reviewColor = sourceEntry?.colorHex || current.colorHex || "";
  const sourceVisualText = sourceEntry?.visualLabel || sourceEntry?.numeral || current.visualLabel || current.numeral || "";
  const reviewVisualText = !reviewImageSources.length && !reviewColor && sourceVisualText !== reviewPrompt
    ? sourceVisualText
    : "";
  const activityType = current.activityType || sourceContext?.activity?.type || "";
  const clockHour = sourceEntry?.hour ?? current.hour;
  const clockMinute = sourceEntry?.minute ?? current.minute;
  const hasClock = ["clock-choice", "clock-type-answer"].includes(activityType)
    && Number.isFinite(Number(clockHour))
    && Number.isFinite(Number(clockMinute));
  const hasHubVisualClue = Boolean(hotspotVisual || hasClock || reviewImageSources.length || reviewColor || reviewVisualText);
  const reviewInstruction = current.source === "hub-textbook"
    ? getHubReviewInstruction(current, sourceContext, hasHubVisualClue)
    : "Type the missing word or phrase to complete each sentence.";

  const acceptable = getReviewAcceptedAnswers(current, sourceEntry);

  // Try to find a matching pair for picture clue
  let cluePair = null;
  const topicInfo = current.topic ? TOPIC_DATA[current.topic] : null;

  if (topicInfo && Array.isArray(topicInfo.sets)) {
    const set = topicInfo.sets.find(
      (s, idx) => s.id === current.setId || String(idx) === String(current.setId)
    );

    if (set && Array.isArray(set.pairs)) {
      cluePair =
        set.pairs.find((p) => {
          const term = p.term.toLowerCase();
          return acceptable.some(
            (opt) =>
              term === opt || term.includes(opt) || opt.includes(term)
          );
        }) || null;
    }
  }

  function checkAnswer(answerValue = typedAnswer) {
    const selectedOption = choiceReview?.options.find((option) => option.label === answerValue);
    const ok = choiceReview
      ? Boolean(selectedOption?.correct)
      : isAcceptedReviewAnswer(answerValue, acceptable);
    setSelectedChoice(choiceReview ? answerValue : "");
    setIsCorrect(ok);
    setShowFeedback(true);

    if (ok) {
      Promise.all((current.mistakeIds || [current.id]).map((mistakeId) => (
        resolveVocabMistake(mistakeId)
      ))).catch((err) => console.error("[VocabMistakeReview] resolve failed", err));

      setTimeout(() => {
        setItems((prev) => {
          const remaining = prev.filter((it) => it.id !== current.id);
          setIndex((previousIndex) => remaining.length ? Math.min(previousIndex, remaining.length - 1) : 0);
          return remaining;
        });
        setTypedAnswer("");
        setSelectedChoice("");
        setShowFeedback(false);
      }, 1200);
    }
  }

  function next() {
    const nextIndex = index + 1;
    if (nextIndex < items.length) {
      setIndex(nextIndex);
    } else {
      setIndex(0);
    }
    setTypedAnswer("");
    setSelectedChoice("");
    setIsCorrect(false);
    setShowFeedback(false);
  }

  return (
    <div className="topic-trainer game-wrapper fade-in">
      <header className="header">
        <h2 className="title">Vocab mistakes</h2>
        <p className="intro">
          Practise the vocabulary items you got wrong in previous sessions.
        </p>
      </header>

      <div className="card review-phase">
        <p className="phase-intro">{reviewInstruction}</p>

        <p className="muted small">
          Item {index + 1} of {items.length}
        </p>

        {current.source === "hub-textbook" ? (
          <p className="muted small">
            {current.themeTitle || current.topic} · {current.activityTitle || current.setId}
          </p>
        ) : null}

        {reviewPrompt ? <p className="prompt">{reviewPrompt}</p> : null}

        {hotspotVisual ? (
          <div className="clue-area review-hotspot-clue">
            <HotspotReviewClue visual={hotspotVisual} />
          </div>
        ) : hasClock ? (
          <div className="clue-area">
            <ClockReviewClue hour={clockHour} minute={clockMinute} />
          </div>
        ) : reviewImageSources.length ? (
          <div className="clue-area">
            <ImageReviewClue sources={reviewImageSources} focusArea={reviewFocusArea} />
          </div>
        ) : reviewColor ? (
          <div className="clue-area">
            <div
              className="clue-colour"
              style={{ backgroundColor: reviewColor }}
              aria-label="Colour clue"
            />
          </div>
        ) : reviewVisualText ? (
          <div className="clue-area">
            <strong className="clue-text" aria-label="Vocabulary clue">
              {reviewVisualText}
            </strong>
          </div>
        ) : cluePair && cluePair.image ? (
          <div className="clue-area">
            <ImageReviewClue sources={[cluePair.image]} />
          </div>
        ) : null}

        {choiceReview ? (
          <div className="review-choice-grid" role="group" aria-label="Answer options">
            {choiceReview.options.map((option) => (
              <button
                key={option.label}
                type="button"
                disabled={showFeedback}
                className={
                  showFeedback && option.correct
                    ? "correct"
                    : showFeedback && selectedChoice === option.label
                      ? "wrong"
                      : showFeedback
                        ? "dimmed"
                        : ""
                }
                onClick={() => checkAnswer(option.label)}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : (
          <>
            <input
              ref={inputRef}
              type="text"
              className="answer-input"
              value={typedAnswer}
              onChange={(e) => {
                if (showFeedback) return;
                setTypedAnswer(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (showFeedback) {
                    next();
                  } else {
                    checkAnswer();
                  }
                }
              }}
              placeholder="Type your answer..."
            />

            {!showFeedback && (
              <button className="review-btn" onClick={() => checkAnswer()}>
                Check
              </button>
            )}
          </>
        )}

        {showFeedback && (
          <div className="explanation-block">
            {isCorrect ? (
              <p className="good">
                ✅ Correct: <strong>{current.correctAnswer}</strong>
              </p>
            ) : (
              <>
                <p className="bad">❌ Not quite.</p>
                <p>
                  Correct answer:{" "}
                  <strong>{current.correctAnswer}</strong>
                </p>
                {current.userAnswer && (
                  <p className="muted small">
                    Previous answer: {current.userAnswer}
                  </p>
                )}
              </>
            )}
            {!isCorrect ? (
              <div className="nav-btns">
                <button className="review-btn" onClick={next}>
                  Next →
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <button className="topbar-btn" onClick={onBack}>
        ← Back
      </button>

      {/* 🔹 Borrowed styles from TopicTrainer for visual parity */}
      <style>{`
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

        .prompt {
          font-weight:600;
          margin-bottom:.8rem;
          color:#e6f0ff;
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

        .review-btn {
          background: linear-gradient(135deg, #4a79d8, #6289ff);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 0.4rem 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          display:inline-flex;
          align-items:center;
          justify-content:center;
        }
        .review-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 6px rgba(98,137,255,0.4);
        }

        .explanation-block {
          background:#0e1a30;
          border-left:3px solid #4a79d8;
          padding:.6rem .8rem;
          border-radius:6px;
          color:#cfd9f3;
          font-size:.9rem;
          line-height:1.4;
          margin-top:0.75rem;
        }

        .good { color:#6ddc88; }
        .bad { color:#ff6b6b; }

        .nav-btns {
          display:flex;
          justify-content:center;
          gap:1rem;
          margin-top:1rem;
        }

        .clue-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
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
          max-width: min(100%, 420px);
          position: relative;
        }

        .clue-image {
          width: auto;
          height: auto;
          max-width: 100%;
          max-height: 280px;
          object-fit: contain;
          filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.45));
          border-radius: 12px;
        }

        .review-image-focus-marker {
          position: absolute;
          border: 3px solid #72df9b;
          border-radius: 12px;
          box-shadow: 0 0 0 5px rgba(114, 223, 155, 0.24), 0 6px 18px rgba(0, 0, 0, 0.35);
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .review-hotspot-clue {
          width: 100%;
        }

        .review-hotspot-scene {
          border: 1px solid #3f5f96;
          border-radius: 14px;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
          max-width: 620px;
          overflow: hidden;
          position: relative;
          width: 100%;
        }

        .review-hotspot-scene img {
          display: block;
          height: auto;
          max-width: none;
          width: 100%;
        }

        .review-hotspot-marker {
          align-items: center;
          background: #72df9b;
          border: 2px solid #e9fff1;
          border-radius: 999px;
          box-shadow: 0 0 0 5px rgba(114, 223, 155, 0.26), 0 8px 18px rgba(0, 0, 0, 0.35);
          color: #13213b;
          display: flex;
          font-size: clamp(0.7rem, 2.2vw, 0.95rem);
          font-weight: 950;
          height: clamp(1.5rem, 4vw, 2rem);
          justify-content: center;
          position: absolute;
          transform: translate(-50%, -50%);
          width: clamp(1.5rem, 4vw, 2rem);
          z-index: 2;
        }

        .review-clock {
          width: min(220px, 70vw);
          padding: 0.65rem;
          border: 1px solid #3f5f96;
          border-radius: 50%;
          background: #f8fbff;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
        }

        .review-clock svg {
          display: block;
          width: 100%;
        }

        .review-clock .clock-face {
          fill: #f8fbff;
          stroke: #1c3154;
          stroke-width: 4;
        }

        .review-clock .clock-mark {
          stroke: #6d7d97;
          stroke-width: 1.5;
        }

        .review-clock .clock-mark.hour {
          stroke: #1c3154;
          stroke-width: 3;
        }

        .review-clock .clock-hand {
          stroke: #14233d;
          stroke-linecap: round;
        }

        .review-clock .clock-hand.hour { stroke-width: 7; }
        .review-clock .clock-hand.minute { stroke-width: 4; }
        .review-clock .clock-pin { fill: #4a79d8; }

        .review-choice-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.7rem;
          margin: 0.9rem 0 1rem;
        }

        .review-choice-grid button {
          min-height: 48px;
          padding: 0.7rem 0.8rem;
          border: 1px solid #3f5f96;
          border-radius: 10px;
          background: #101b32;
          color: #e6f0ff;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.15s ease, border-color 0.15s ease, opacity 0.15s ease;
        }

        .review-choice-grid button:not(:disabled):hover {
          transform: translateY(-1px);
          border-color: #6289ff;
        }

        .review-choice-grid button.correct {
          border-color: #6ddc88;
          background: rgba(38, 117, 67, 0.42);
        }

        .review-choice-grid button.wrong {
          border-color: #ff6b6b;
          background: rgba(145, 42, 51, 0.42);
        }

        .review-choice-grid button.dimmed {
          opacity: 0.5;
        }

        .clue-colour,
        .clue-text {
          width: 72px;
          min-height: 72px;
          border: 1px solid #3f5f96;
          border-radius: 10px;
        }

        .clue-text {
          display: grid;
          place-items: center;
          padding: 0.5rem;
          background: #101b32;
          color: #e6f0ff;
          text-align: center;
        }

        .muted.small {
          font-size: 0.8rem;
          color: #a9b7d1;
        }

        @media (max-width: 560px) {
          .review-choice-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
