// src/components/vocabulary/VocabMistakeReview.jsx
import React, { useEffect, useState, useRef } from "react";
import { auth } from "../../firebase";
import {
  fetchUnresolvedVocabMistakes,
  resolveVocabMistake,
} from "../../firebase";
import { getHubVocabActivity } from "../../data/hubVocabularyActivities";
import { TOPIC_DATA } from "./data/vocabTopics";
import {
  canonicalizeAnswer,
  normalizeAnswers,
} from "./utils/vocabAnswers";

const ENTRY_ALIAS_ACTIVITY_TYPES = new Set([
  "matching",
  "flag-match",
  "quick-choice",
  "type-answer",
  "image-hotspot-match",
  "image-hotspot-type-answer",
  "sentence-gap-choice",
  "sentence-gap-type-answer",
  "clock-choice",
  "clock-type-answer",
]);

const GAP_ANSWER_ACTIVITY_TYPES = new Set([
  "cue-gap-type-answer",
  "gap-choice",
  "phrase-gap-fill",
]);

function withoutInitialArticle(value) {
  return String(value || "").trim().replace(/^(?:a|an|the)\s+/i, "");
}

function promptRevealsAnswer(prompt, correctAnswer) {
  const promptKey = canonicalizeAnswer(withoutInitialArticle(prompt));
  if (!promptKey) return false;

  return normalizeAnswers(correctAnswer).some(
    (answer) => canonicalizeAnswer(withoutInitialArticle(answer)) === promptKey
  );
}

function findHubSourceContext(item) {
  if (item?.source !== "hub-textbook" || !item.topic || !item.setId) return null;
  const result = getHubVocabActivity(item.topic, item.setId);
  if (!result?.theme || !result.activity) return null;

  const preferredEntries = result.activity.dataKey
    ? result.theme[result.activity.dataKey]
    : result.theme.entries;
  const preferredMatch = Array.isArray(preferredEntries)
    ? preferredEntries.find((entry) => entry?.id === item.itemId)
    : null;
  if (preferredMatch) {
    return {
      ...result,
      entries: preferredEntries,
      entry: preferredMatch,
    };
  }

  const entry = Object.values(result.theme)
    .filter(Array.isArray)
    .flat()
    .find((entry) => entry?.id === item.itemId) || null;
  return entry ? { ...result, entries: preferredEntries || [], entry } : null;
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

  const sceneImage = item?.sceneImage || activity?.sceneImage || theme?.sceneImage || "";
  const hotspotX = Number(item?.hotspotX ?? entry?.hotspotX);
  const hotspotY = Number(item?.hotspotY ?? entry?.hotspotY);
  if (!sceneImage || !Number.isFinite(hotspotX) || !Number.isFinite(hotspotY)) return null;

  return {
    sceneImage,
    hotspotX,
    hotspotY,
    hotspotNumber: Number(item?.hotspotNumber) || roundNumber || Number(entry?.hotspotNumber) || 1,
    viewBox: item?.hotspotViewBox || round?.viewBox || null,
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

function getReviewAcceptedAnswers(item, sourceEntry) {
  const savedAnswers = Array.isArray(item?.acceptedAnswers)
    ? item.acceptedAnswers
    : item?.acceptedAnswers
      ? [item.acceptedAnswers]
      : [];
  const sourceAnswers = ENTRY_ALIAS_ACTIVITY_TYPES.has(item?.activityType)
    ? sourceEntry?.acceptedAnswers || []
    : GAP_ANSWER_ACTIVITY_TYPES.has(item?.activityType)
      ? sourceEntry?.gapAnswers || []
      : [];

  return [...new Set(
    [item?.correctAnswer, ...savedAnswers, ...sourceAnswers]
      .flatMap((answer) => normalizeAnswers(answer))
      .filter(Boolean)
  )];
}

function isAcceptedReviewAnswer(userAnswer, acceptedAnswers) {
  const user = canonicalizeAnswer(userAnswer);
  return Boolean(user) && acceptedAnswers.some(
    (answer) => canonicalizeAnswer(answer) === user
  );
}

export default function VocabMistakeReview({ onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [index, setIndex] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState("");
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
        setItems(data);
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
  const savedReviewPrompt =
    current.source === "hub-textbook" && promptRevealsAnswer(current.sentence, current.correctAnswer)
      ? ""
      : current.sentence;
  const reviewPrompt = hotspotVisual
    ? `Type the word for number ${hotspotVisual.hotspotNumber}.`
    : savedReviewPrompt;
  const reviewImage = current.image || sourceEntry?.image || sourceEntry?.flag4x3 || "";
  const reviewColor = sourceEntry?.colorHex || "";
  const reviewVisualText = !reviewPrompt && !reviewImage && !reviewColor
    ? sourceEntry?.visualLabel || sourceEntry?.numeral || ""
    : "";
  const hasHubVisualClue = Boolean(hotspotVisual || reviewImage || reviewColor || reviewVisualText);

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

  function checkAnswer() {
    const ok = isAcceptedReviewAnswer(typedAnswer, acceptable);
    setIsCorrect(ok);
    setShowFeedback(true);

    if (ok) {
      resolveVocabMistake(current.id).catch((err) =>
        console.error("[VocabMistakeReview] resolve failed", err)
      );

      setTimeout(() => {
        setItems((prev) => prev.filter((it) => it.id !== current.id));
        setIndex((prev) => Math.min(prev, items.length - 2));
        setTypedAnswer("");
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
        <p className="phase-intro">
          {hasHubVisualClue
            ? "Look at the clue and type the correct word or phrase."
            : "Type the missing word or phrase to complete each sentence."}
        </p>

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
        ) : reviewImage ? (
          <div className="clue-area">
            <div className="clue-image-wrapper">
              <img
                src={reviewImage}
                alt=""
                className="clue-image"
              />
            </div>
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
            <div className="clue-image-wrapper">
              <img
                src={cluePair.image}
                alt={cluePair.term}
                className="clue-image"
              />
            </div>
          </div>
        ) : null}

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
          <button className="review-btn" onClick={checkAnswer}>
            Check
          </button>
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
            <div className="nav-btns">
              <button className="review-btn" onClick={next}>
                Next →
              </button>
            </div>
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
        }

        .clue-image {
          width: 72px;
          height: 72px;
          object-fit: contain;
          filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.45));
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
      `}</style>
    </div>
  );
}
