// src/components/vocabulary/VocabMistakeReview.jsx
import React, { useEffect, useState, useRef } from "react";
import { auth } from "../../firebase";
import {
  fetchUnresolvedVocabMistakes,
  resolveVocabMistake,
} from "../../firebase";
import { TOPIC_DATA } from "./data/vocabTopics";

export default function VocabMistakeReview({ onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [index, setIndex] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showReviewImage, setShowReviewImage] = useState(false);

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

  // Reset picture clue on item change
  useEffect(() => {
    setShowReviewImage(false);
  }, [index]);

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
          ← Back to profile
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

  const acceptable = current.correctAnswer
    .split("/")
    .map((a) => a.trim().toLowerCase())
    .filter(Boolean);

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
    const user = typedAnswer.trim().toLowerCase();
    const ok = acceptable.includes(user);
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
        setShowReviewImage(false);
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
    setShowReviewImage(false);
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
          Type the missing word or phrase to complete each sentence.
        </p>

        <p className="muted small">
          Item {index + 1} of {items.length}
        </p>

        <p className="prompt">{current.sentence}</p>

        {cluePair && cluePair.image && (
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
        )}

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
        ← Back to profile
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

        .muted.small {
          font-size: 0.8rem;
          color: #a9b7d1;
        }
      `}</style>
    </div>
  );
}
