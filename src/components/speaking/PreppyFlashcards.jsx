// src/components/speaking/PreppyFlashcards.jsx
import React, { useState, useEffect, useRef } from "react";
import preppyPrepositionCards from "./banks/preppyPrepositionCards";

// Fisher–Yates shuffle
function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

const FLIP_DURATION = 260; // ms (keep in sync with CSS transition)

export default function PreppyFlashcards() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef(null);

  const [cards] = useState(() => shuffleArray(preppyPrepositionCards));
  const total = cards.length;
  const current = cards[index];
  const [imageLoaded, setImageLoaded] = useState(false);

  // Preload all card images once
useEffect(() => {
    cards.forEach(card => {
      const img = new Image();
      img.src = card.image;
    });
  }, [cards]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Whenever the card changes, hide the image until it loads
useEffect(() => {
    setImageLoaded(false);
  }, [current.id]);

  const safeSetIndex = (delta) => {
    setIndex((i) => (i + delta + total) % total);
  };

  const goTo = (delta) => {
    if (isAnimating || total === 0) return;

    // if flipped, “unflip” first so answers don’t flash
    if (flipped) {
      setIsAnimating(true);
      setFlipped(false);
      timerRef.current = setTimeout(() => {
        safeSetIndex(delta);
        setIsAnimating(false);
      }, FLIP_DURATION);
    } else {
      safeSetIndex(delta);
    }
  };

  const goNext = () => goTo(1);
  const goPrev = () => goTo(-1);

  const flip = () => {
    if (isAnimating) return;
    setFlipped((f) => !f);
  };

  // keyboard shortcuts
useEffect(() => {
  const handler = (e) => {
    // Don't hijack keys while the user is typing
    const t = e.target;
    const tag = t?.tagName;
    const isTypingField =
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      t?.isContentEditable;

    if (isTypingField) return;

    if (e.code === "Space") {
      e.preventDefault();
      flip();
    } else if (e.key === "ArrowRight") {
      goNext();
    } else if (e.key === "ArrowLeft") {
      goPrev();
    }
  };

  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, [flip, goNext, goPrev]);


  if (!current) return null;

  return (
    <div className="preppy3-wrapper">
      <div
        className={
          "preppy3-card" +
          (flipped ? " preppy3-card--flipped" : "") +
          (isAnimating ? " preppy3-card--animating" : "")
        }
        onClick={flip}
      >
        <div className="preppy3-inner">
          {/* FRONT = picture + gap */}
          <div className="preppy3-face preppy3-face--front">
            <p className="preppy3-face-label">Picture</p>
            <div className="preppy3-img-wrap">
  <img
    src={current.image}
    alt={current.fullSentence}
    onLoad={() => setImageLoaded(true)}
    className={imageLoaded ? "preppy3-img" : "preppy3-img preppy3-img--loading"}
  />
</div>
            <p className="preppy3-gap">{current.gapSentence}</p>
            <p className="preppy3-hint">
              Say the sentence aloud. Which preposition fits?{" "}
              <span className="preppy3-key">(Tap / space to flip.)</span>
            </p>
          </div>

          {/* BACK = answer + explanation */}
          <div className="preppy3-face preppy3-face--back">
            <p className="preppy3-face-label">Answer</p>
            <p className="preppy3-answer">
              <strong>{current.answer}</strong>
            </p>
            <p className="preppy3-full">{current.fullSentence}</p>
            {current.explanation && (
              <p className="preppy3-hint">{current.explanation}</p>
            )}
          </div>
        </div>
      </div>

      <div className="preppy3-nav">
        <button className="btn tiny" onClick={goPrev} disabled={isAnimating}>
          ◀ Prev
        </button>
        <span className="muted small">
          Card {index + 1} / {total} – space = flip, ← / → = move
        </span>
        <button className="btn tiny" onClick={goNext} disabled={isAnimating}>
          Next ▶
        </button>
      </div>

      <style>{`
        .preppy3-wrapper {
          margin-top: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .preppy3-card {
          width: min(360px, 90vw);
          background: #0b1730;
          border-radius: 16px;
          border: 1px solid #203a66;
          padding: 0.9rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.35);
          cursor: pointer;
        }

        .preppy3-inner {
          position: relative;
          width: 100%;
          height: 340px;
          background: #101b32;
          border-radius: 12px;
          border: 1px solid #2c4b83;
          overflow: hidden;
        }

        .preppy3-card--animating {
          pointer-events: none;
        }

        /* Faces – fake flip: rotate & fade, but always facing the user */
        .preppy3-face {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          padding: 0.8rem 0.9rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-sizing: border-box;
          transition:
            opacity ${FLIP_DURATION}ms ease,
            transform ${FLIP_DURATION}ms ease;
          transform-origin: center;
        }

        .preppy3-face--front {
          opacity: 1;
          transform: rotateY(0deg);
          z-index: 2;
        }

        .preppy3-face--back {
          opacity: 0;
          transform: rotateY(90deg);
          z-index: 1;
          pointer-events: none;
        }

        .preppy3-card--flipped .preppy3-face--front {
          opacity: 0;
          transform: rotateY(-90deg);
          pointer-events: none;
        }

        .preppy3-card--flipped .preppy3-face--back {
          opacity: 1;
          transform: rotateY(0deg);
          pointer-events: auto;
          z-index: 2;
        }

        /* Image box */
        .preppy3-img-wrap {
          width: 100%;
          max-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.6rem;
        }

        .preppy3-img-wrap img {
          max-width: 100%;
          max-height: 200px;
          object-fit: contain;
          border-radius: 12px;
          display: block;
        }

        .preppy3-face-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #9fb0e0;
          margin-bottom: 0.35rem;
        }

        .preppy3-gap,
        .preppy3-full {
          color: #e4ebff;
          font-size: 0.95rem;
          margin: 0.3rem 0;
        }

        .preppy3-answer {
          color: #ffcf40;
          font-size: 1.2rem;
          margin-bottom: 0.25rem;
        }

        .preppy3-hint {
          color: #9fb0e0;
          font-size: 0.8rem;
          margin-top: 0.35rem;
        }

        .preppy3-key {
          opacity: 0.9;
        }

        .preppy3-nav {
          display: flex;
          justify-content: center;
          align-items: baseline;
          gap: 0.75rem;
        }

        @media (max-width: 480px) {
          .preppy3-card {
            width: 100%;
          }
          .preppy3-inner {
            height: 320px;
          }
          .preppy3-img-wrap {
            max-height: 180px;
          }
          .preppy3-img-wrap img {
            max-height: 180px;
          }
        }
        .preppy3-img-wrap {
  width: 100%;
  max-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.6rem;
}

/* base image style */
.preppy3-img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 12px;
  display: block;
  transition: opacity 160ms ease;
}

/* while loading the new image, hide it and show a neutral placeholder */
.preppy3-img--loading {
  opacity: 0;
}

      `}</style>
    </div>
  );
}
