import React, { useMemo, useState, useEffect, useRef } from "react";
import { Star } from "lucide-react";

import { logFlashcardsSession } from "../../firebase";
import { toast } from "../../utils/toast";
import {
  fetchVocabFavourites,
  toggleVocabFavourite,
} from "./utils/vocabFavourites";

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function FlashcardsPlayer({
  items = [],
  onBack,
  isAuthenticated = false,
  logTopic = null,
  title = "Flashcards",
  subtitle = null,
  enableSavedMode = true,
  savedModeLabel = "Saved cards",
}) {
  const hasLogged = useRef(false);
  const preloadedImages = useRef(new Set());

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [animateFlip, setAnimateFlip] = useState(false);
  const [mode, setMode] = useState("all");
  const [shuffleTick, setShuffleTick] = useState(0);
  const [favouriteIds, setFavouriteIds] = useState(new Set());
  const [loadingFavourites, setLoadingFavourites] = useState(enableSavedMode);

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

  useEffect(() => {
    let alive = true;

    if (!enableSavedMode) {
      setFavouriteIds(new Set());
      setLoadingFavourites(false);
      return () => {
        alive = false;
      };
    }

    async function loadFavourites() {
      setLoadingFavourites(true);
      try {
        const ids = await fetchVocabFavourites({ isAuthenticated });
        if (alive) setFavouriteIds(new Set(ids));
      } catch (error) {
        console.error("[FlashcardsPlayer] favourites load failed", error);
      } finally {
        if (alive) setLoadingFavourites(false);
      }
    }

    loadFavourites();
    return () => {
      alive = false;
    };
  }, [enableSavedMode, isAuthenticated]);

  const fullDeck = useMemo(() => shuffleArray(items), [items, shuffleTick]);
  const savedDeck = useMemo(() => {
    if (!enableSavedMode) return [];
    return shuffleArray(items.filter((item) => item.favouriteId && favouriteIds.has(item.favouriteId)));
  }, [items, favouriteIds, enableSavedMode, shuffleTick]);

  const activeDeck = mode === "saved" ? savedDeck : fullDeck;
  const current = activeDeck[index] || null;
  const deckLength = activeDeck.length;
  const savedCount = useMemo(
    () => items.filter((item) => item.favouriteId && favouriteIds.has(item.favouriteId)).length,
    [items, favouriteIds]
  );
  const currentIsFavourite = !!(current?.favouriteId && favouriteIds.has(current.favouriteId));

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
    setAnimateFlip(false);
  }, [mode, items]);

  useEffect(() => {
    if (mode !== "saved") return;
    if (savedDeck.length > 0) return;
    setMode("all");
  }, [mode, savedDeck.length]);

  useEffect(() => {
    if (!deckLength) {
      setIndex(0);
      return;
    }
    setIndex((prev) => Math.min(prev, deckLength - 1));
  }, [deckLength]);

  useEffect(() => {
    if (!deckLength) return;

    const neighborIndexes = [
      index,
      (index + 1) % deckLength,
      (index + 2) % deckLength,
      (index - 1 + deckLength) % deckLength,
    ];

    neighborIndexes.forEach((deckIndex) => {
      const src = activeDeck[deckIndex]?.image;
      if (!src) return;
      if (preloadedImages.current.has(src)) return;

      const img = new Image();
      img.src = src;
      preloadedImages.current.add(src);
    });
  }, [activeDeck, index, deckLength]);

  useEffect(() => {
    function handleKeyDown(e) {
      const tag = e.target && e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.code === "Space") {
        e.preventDefault();
        if (!current) return;
        setAnimateFlip(true);
        setFlipped((prev) => !prev);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (!deckLength) return;
        setAnimateFlip(false);
        setFlipped(false);
        setIndex((prev) => (prev + 1) % deckLength);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (!deckLength) return;
        setAnimateFlip(false);
        setFlipped(false);
        setIndex((prev) => (prev - 1 + deckLength) % deckLength);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [current, deckLength]);

  function flip() {
    if (!current) return;
    setAnimateFlip(true);
    setFlipped((prev) => !prev);
  }

  function goNext() {
    if (!deckLength) return;
    setAnimateFlip(false);
    setFlipped(false);
    setIndex((prev) => (prev + 1) % deckLength);
  }

  function goPrev() {
    if (!deckLength) return;
    setAnimateFlip(false);
    setFlipped(false);
    setIndex((prev) => (prev - 1 + deckLength) % deckLength);
  }

  function shuffleDeck() {
    setShuffleTick((prev) => prev + 1);
    setIndex(0);
    setFlipped(false);
    setAnimateFlip(false);
  }

  async function handleToggleFavourite(e) {
    e?.stopPropagation?.();
    if (!current?.favouriteId) return;

    const nextIsFavourite = !currentIsFavourite;

    setFavouriteIds((prev) => {
      const next = new Set(prev);
      if (nextIsFavourite) next.add(current.favouriteId);
      else next.delete(current.favouriteId);
      return next;
    });

    try {
      await toggleVocabFavourite({
        favouriteId: current.favouriteId,
        isAuthenticated,
        isFavourite: currentIsFavourite,
      });
      toast(nextIsFavourite ? "Saved card." : "Removed from saved cards.");
    } catch (error) {
      console.error("[FlashcardsPlayer] favourite toggle failed", error);
      setFavouriteIds((prev) => {
        const rollback = new Set(prev);
        if (currentIsFavourite) rollback.add(current.favouriteId);
        else rollback.delete(current.favouriteId);
        return rollback;
      });
      toast("Could not update saved cards.");
    }
  }

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
              Card {deckLength === 0 ? 0 : index + 1} / {deckLength}
            </span>
            {enableSavedMode ? (
              <span className="saved-meta">
                Saved: <strong>{savedCount}</strong>
              </span>
            ) : null}
          </div>

          <div className="flash-top-actions">
            {enableSavedMode ? (
              <>
                <button
                  className={`mode-chip ${mode === "all" ? "active" : ""}`}
                  onClick={() => setMode("all")}
                  type="button"
                >
                  All cards
                </button>
                <button
                  className={`mode-chip ${mode === "saved" ? "active" : ""}`}
                  onClick={() => setMode("saved")}
                  type="button"
                  disabled={loadingFavourites || savedCount === 0}
                  title={savedCount === 0 ? "No saved cards yet." : ""}
                >
                  {savedModeLabel}
                </button>
              </>
            ) : (
              <div className="mode-pill">Mixed session</div>
            )}
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
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") flip();
              }}
            >
              <div className="flash-inner">
                {enableSavedMode ? (
                  <button
                    className={`fav-btn flash-fav-btn ${currentIsFavourite ? "active" : ""}`}
                    onClick={handleToggleFavourite}
                    aria-pressed={currentIsFavourite}
                    aria-label={currentIsFavourite ? "Remove from saved cards" : "Save card"}
                    title={currentIsFavourite ? "Remove from saved cards" : "Save card"}
                    type="button"
                  >
                    {currentIsFavourite ? (
                      <Star size={18} fill="#ffd36a" stroke="#ffd36a" />
                    ) : (
                      <Star size={18} />
                    )}
                  </button>
                ) : null}

                <div className="flash-face front">
                  <p className="face-label">Definition</p>
                  {current.image ? (
                    <div className="flash-img-wrap">
                      <img
                        src={current.image}
                        alt={current.term}
                        decoding="async"
                      />
                    </div>
                  ) : null}
                  <p className="flash-def">{current.definition}</p>
                  <p className="flash-hint">Tap / click anywhere on the card to flip</p>
                </div>

                <div className="flash-face back">
                  <p className="face-label">Answer</p>
                  <div className="flash-answer">{current.term}</div>
                  {current.setTitle ? <p className="flash-meta">{current.setTitle}</p> : null}
                  <p className="flash-hint">Tap / click anywhere on the card to flip back</p>
                </div>

                <div className="flash-overlay-controls">
                  <button
                    className="overlay-btn overlay-btn-left"
                    onClick={(e) => {
                      e.stopPropagation();
                      goPrev();
                    }}
                    type="button"
                    aria-label="Previous card"
                  >
                    ←
                  </button>
                  <button
                    className="overlay-btn overlay-btn-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      flip();
                    }}
                    type="button"
                  >
                    {flipped ? "Hide" : "Flip"}
                  </button>
                  <button
                    className="overlay-btn overlay-btn-right"
                    onClick={(e) => {
                      e.stopPropagation();
                      goNext();
                    }}
                    type="button"
                    aria-label="Next card"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>

            <div className="flash-toolbar">
              <button className="review-btn secondary" onClick={shuffleDeck} type="button">
                Shuffle
              </button>
              {enableSavedMode && mode === "saved" ? (
                <button className="review-btn secondary" onClick={() => setMode("all")} type="button">
                  Back to all cards
                </button>
              ) : null}
            </div>
          </>
        ) : (
          <div className="flash-empty">
            <p className="phase-intro">
              {mode === "saved"
                ? "No saved cards in this topic yet."
                : "No cards to show yet."}
            </p>
            {mode === "saved" ? (
              <button className="review-btn" onClick={() => setMode("all")} type="button">
                Back to all cards
              </button>
            ) : null}
          </div>
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
          gap:.6rem .9rem;
          margin-bottom:.9rem;
        }

        .stats {
          display:flex;
          flex-wrap:wrap;
          align-items:center;
          gap:.55rem;
          font-size:.9rem;
          color:#cfd9f3;
        }

        .pill {
          background:#101b32;
          border-radius:999px;
          padding:.28rem .8rem;
          border:1px solid #2c4b83;
        }

        .saved-meta {
          color:#9fb0e0;
        }

        .flash-top-actions {
          display:flex;
          flex-wrap:wrap;
          justify-content:flex-end;
          gap:.5rem;
        }

        .mode-chip {
          background:#101b32;
          border:1px solid #2c4b83;
          color:#cfd9f3;
          border-radius:999px;
          padding:.38rem .85rem;
          cursor:pointer;
          font-size:.85rem;
        }

        .mode-chip.active {
          background:#203867;
          color:#fff;
          border-color:#4a79d8;
        }

        .mode-chip:disabled {
          opacity:.55;
          cursor:not-allowed;
        }

        .mode-pill {
          font-size:.85rem;
          color:#9fb0e0;
        }

        .flashcard {
          background: transparent;
          border-radius: 18px;
          perspective: 1000px;
          cursor: pointer;
        }

        .flash-inner {
          position: relative;
          width: 100%;
          min-height: 460px;
          background: #101b32;
          border: 1px solid #2c4b83;
          border-radius: 18px;
          padding: 1.25rem 1.25rem 4.3rem;
          transition: box-shadow 0.15s ease, border-color 0.15s ease;
          overflow:hidden;
        }

        .flashcard:hover .flash-inner {
          box-shadow:0 4px 16px rgba(0,0,0,.32);
          border-color:#4a79d8;
        }

        .flash-face.front,
        .flash-face.back {
          position:absolute;
          inset:0;
          padding: 1.25rem 1.25rem 4.3rem;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          text-align:center;
          height:100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transition: transform 0.4s ease, opacity 0.4s ease;
        }

        .flash-face.front {
          transform: rotateY(0deg);
          opacity:1;
        }

        .flash-face.back {
          transform: rotateY(180deg);
          opacity:0;
        }

        .flashcard.is-flipped .flash-face.front {
          transform: rotateY(-180deg);
          opacity:0;
        }

        .flashcard.is-flipped .flash-face.back {
          transform: rotateY(0deg);
          opacity:1;
        }

        .flashcard.no-anim .flash-face.front,
        .flashcard.no-anim .flash-face.back {
          transition: none;
        }

        .face-label{
          font-size:.82rem;
          letter-spacing:.08em;
          text-transform:uppercase;
          color:#9fb0e0;
          margin:0 0 .7rem;
        }

        .flash-img-wrap{
          min-height:140px;
          display:flex;
          align-items:center;
          justify-content:center;
        }

        .flash-img-wrap img{
          max-width:160px;
          max-height:160px;
          height:auto;
          display:block;
        }

        .flash-def{
          font-size:1.35rem;
          line-height:1.5;
          margin:.85rem 0 .25rem;
          color:#e6f0ff;
          max-width: 680px;
        }

        .flash-answer{
          font-size:2.15rem;
          font-weight:800;
          line-height:1.15;
          margin:.5rem 0 .35rem;
        }

        .flash-meta{
          margin:0;
          color:#9fb0e0;
          font-size:1rem;
        }

        .flash-hint{
          margin-top:1rem;
          font-size:.92rem;
          color:#9fb0e0;
        }

        .flash-overlay-controls {
          position:absolute;
          left:0;
          right:0;
          bottom:1rem;
          display:grid;
          grid-template-columns: 1fr auto 1fr;
          align-items:center;
          gap:.75rem;
          padding:0 1rem;
          pointer-events:none;
        }

        .overlay-btn {
          pointer-events:auto;
          border:none;
          background:rgba(19,33,59,.92);
          border:1px solid #31528e;
          color:#e6f0ff;
          border-radius:999px;
          padding:.5rem .9rem;
          cursor:pointer;
          font-weight:700;
          min-width:52px;
        }

        .overlay-btn-left {
          justify-self:start;
        }

        .overlay-btn-center {
          justify-self:center;
          min-width:88px;
        }

        .overlay-btn-right {
          justify-self:end;
        }

        .flash-fav-btn {
          position:absolute;
          top:1rem;
          right:1rem;
          z-index:2;
          width:42px;
          height:42px;
          border-radius:999px;
          border:1px solid #31528e;
          background:rgba(19,33,59,.92);
          color:#d8e4ff;
          display:flex;
          align-items:center;
          justify-content:center;
          cursor:pointer;
        }

        .flash-fav-btn.active {
          border-color:#ffd36a;
          box-shadow:0 0 0 1px rgba(255,211,106,.2);
        }

        .flash-toolbar {
          display:flex;
          justify-content:center;
          flex-wrap:wrap;
          gap:.6rem;
          margin-top:.95rem;
        }

        .flash-empty {
          padding:1rem 0 .4rem;
          text-align:center;
        }

        @media (max-width: 720px) {
          .flash-inner {
            min-height: 410px;
            padding: 1rem 1rem 4rem;
          }

          .flash-face.front,
          .flash-face.back {
            padding: 1rem 1rem 4rem;
          }

          .flash-def {
            font-size:1.15rem;
          }

          .flash-answer {
            font-size:1.8rem;
          }

          .flash-img-wrap img {
            max-width:130px;
            max-height:130px;
          }
        }
      `}</style>
    </div>
  );
}
