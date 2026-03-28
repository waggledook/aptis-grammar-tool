import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import { auth, fetchHubSavedFlashcards, removeHubFlashcard, saveHubFlashcard } from "../../firebase.js";
import { getHubGrammarFlashcardDeck } from "../../data/hubGrammarFlashcards.js";
import { getSitePath } from "../../siteConfig.js";

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function buildSaveId(category, deckId, cardId) {
  return `${category}__${deckId}__${cardId}`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isWordChar(char) {
  return /[A-Za-z0-9]/.test(char || "");
}

function findWholeWordMatch(text, candidate) {
  if (!text || !candidate) return null;

  const lowerText = text.toLowerCase();
  const lowerCandidate = candidate.toLowerCase();
  let startIndex = 0;

  while (startIndex < lowerText.length) {
    const foundIndex = lowerText.indexOf(lowerCandidate, startIndex);
    if (foundIndex === -1) return null;

    const beforeChar = foundIndex === 0 ? "" : text[foundIndex - 1];
    const afterChar =
      foundIndex + candidate.length >= text.length
        ? ""
        : text[foundIndex + candidate.length];

    if (!isWordChar(beforeChar) && !isWordChar(afterChar)) {
      return {
        index: foundIndex,
        length: candidate.length,
      };
    }

    startIndex = foundIndex + 1;
  }

  return null;
}

function renderHighlightedSentence(text, emphasis) {
  if (!text || !emphasis || (Array.isArray(emphasis) && emphasis.length === 0)) {
    return text;
  }

  const emphasisList = Array.isArray(emphasis) ? emphasis : [emphasis];
  let remainingText = text;
  const pieces = [];
  let matchedAnything = false;

  for (const rawEntry of emphasisList) {
    const candidates = String(rawEntry)
      .split("/")
      .map((part) => part.trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);

    let selectedMatch = null;
    for (const candidate of candidates) {
      const match = findWholeWordMatch(remainingText, candidate);
      if (match) {
        selectedMatch = { ...match, candidate };
        break;
      }
    }

    if (!selectedMatch) continue;

    matchedAnything = true;
    const before = remainingText.slice(0, selectedMatch.index);
    const highlighted = remainingText.slice(
      selectedMatch.index,
      selectedMatch.index + selectedMatch.length
    );
    remainingText = remainingText.slice(selectedMatch.index + selectedMatch.length);

    if (before) pieces.push(before);
    pieces.push(
      <span key={`${selectedMatch.candidate}-${pieces.length}`} className="hub-flashcard-highlight">
        {highlighted}
      </span>
    );
  }

  if (!matchedAnything) return text;
  if (remainingText) pieces.push(remainingText);
  return <>{pieces}</>;
}

function isPromptedFront(card) {
  if (!card?.frontBlocks || card.frontBlocks.length < 2) return false;
  const labels = card.frontBlocks.map((block) => String(block.label || "").toLowerCase());
  return labels.includes("transform using") || labels.includes("prompt");
}

export default function HubFlashcardsDeckPlayer() {
  const navigate = useNavigate();
  const { deckId } = useParams();
  const [searchParams] = useSearchParams();
  const isSavedReviewDeck = deckId === "saved-review";
  const deck = useMemo(
    () =>
      isSavedReviewDeck
        ? {
            id: "saved-review",
            category: "grammar",
            title: "Saved Flashcards Review",
            description: "Review your saved grammar flashcards from every deck together.",
            studyTip:
              "Flip through your saved grammar cards in random order and use the deck label above the card to see where each one comes from.",
            cards: [],
          }
        : getHubGrammarFlashcardDeck(deckId),
    [deckId, isSavedReviewDeck]
  );
  const [displayMode, setDisplayMode] = useState("grid");
  const [cardWidth, setCardWidth] = useState(320);
  const [focusIndex, setFocusIndex] = useState(0);
  const [focusedFlipped, setFocusedFlipped] = useState(false);
  const [gridFlipped, setGridFlipped] = useState({});
  const [savedMap, setSavedMap] = useState({});
  const [reviewMode, setReviewMode] = useState("deck");
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [savedRandomOrder, setSavedRandomOrder] = useState([]);

  const uid = auth.currentUser?.uid || "";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [deckId]);

  useEffect(() => {
    let isMounted = true;

    async function loadSaved() {
      if (!uid || !deck) {
        if (isMounted) setSavedMap({});
        return;
      }

      setIsLoadingSaved(true);
      try {
        const saved = await fetchHubSavedFlashcards(
          isSavedReviewDeck
            ? { uid, category: "grammar" }
            : {
                uid,
                category: deck.category,
                deckId: deck.id,
              }
        );

        if (!isMounted) return;
        const next = {};
        saved.forEach((entry) => {
          next[entry.cardId] = entry;
        });
        setSavedMap(next);
      } catch (error) {
        console.error("Failed to load saved flashcards", error);
      } finally {
        if (isMounted) setIsLoadingSaved(false);
      }
    }

    loadSaved();
    return () => {
      isMounted = false;
    };
  }, [uid, deck, isSavedReviewDeck]);

  useEffect(() => {
    setFocusIndex(0);
    setFocusedFlipped(false);
    setGridFlipped({});
    setReviewMode("deck");
  }, [deckId]);

  useEffect(() => {
    if (isSavedReviewDeck) {
      setDisplayMode("focus");
      setReviewMode("saved-random");
      return;
    }

    const requestedView = searchParams.get("view");
    const requestedMode = searchParams.get("mode");

    if (requestedView === "focus" || requestedView === "grid") {
      setDisplayMode(requestedView);
    }

    if (requestedMode === "saved") {
      setReviewMode("saved");
    } else if (requestedMode === "saved-random") {
      setReviewMode("saved-random");
    } else if (requestedMode === "deck") {
      setReviewMode("deck");
    }
  }, [searchParams, deckId, isSavedReviewDeck]);

  const savedCards = useMemo(() => {
    if (!deck) return [];
    if (isSavedReviewDeck) {
      return Object.values(savedMap).map((entry) => ({
        id: entry.cardId || entry.id || entry.saveId,
        saveId: entry.saveId,
        category: entry.category || "grammar",
        deckId: entry.deckId || "",
        deckTitle: entry.deckTitle || "Flashcard deck",
        frontText: entry.frontText || "",
        frontBlocks: entry.frontBlocks || [],
        backText: entry.backText || "",
        emphasisText: entry.emphasisText || "",
        emphasisTexts: entry.emphasisTexts || [],
        tag: entry.tag || "",
      }));
    }
    return deck.cards.filter((card) => !!savedMap[card.id]);
  }, [deck, savedMap, isSavedReviewDeck]);

  useEffect(() => {
    setSavedRandomOrder(shuffle(savedCards));
  }, [savedCards, deckId]);

  const visibleCards = useMemo(() => {
    if (!deck) return [];
    if (reviewMode === "saved") return savedCards;
    if (reviewMode === "saved-random") return savedRandomOrder;
    return deck.cards;
  }, [deck, reviewMode, savedCards, savedRandomOrder]);

  const moveFocusCard = useCallback((direction) => {
    if (visibleCards.length === 0) return;

    if (focusedFlipped) {
      setFocusedFlipped(false);
      window.requestAnimationFrame(() => {
        setFocusIndex((current) => (current + direction + visibleCards.length) % visibleCards.length);
      });
      return;
    }

    setFocusIndex((current) => (current + direction + visibleCards.length) % visibleCards.length);
  }, [focusedFlipped, visibleCards.length]);

  useEffect(() => {
    setFocusIndex(0);
    setFocusedFlipped(false);
    setGridFlipped({});
    if (reviewMode === "saved-random") {
      setSavedRandomOrder(shuffle(savedCards));
    }
  }, [reviewMode]);

  useEffect(() => {
    if (visibleCards.length === 0) {
      setFocusIndex(0);
      return;
    }

    setFocusIndex((current) => Math.min(current, visibleCards.length - 1));
  }, [visibleCards.length]);

  useEffect(() => {
    if (displayMode !== "focus") return;

    function onKeyDown(event) {
      const tagName = event.target?.tagName || "";
      if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") return;
      if (visibleCards.length === 0) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveFocusCard(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveFocusCard(-1);
      } else if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        setFocusedFlipped((current) => !current);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [displayMode, moveFocusCard, visibleCards.length]);

  if (!deck) {
    return (
      <div className="menu-wrapper hub-flashcards-shell">
        <p>Flashcard deck not found.</p>
        <button className="review-btn" onClick={() => navigate(getSitePath("/grammar/flashcards"))}>
          Back to flashcards
        </button>
      </div>
    );
  }

  const focusCard = visibleCards[focusIndex] || null;
  const hasSavedCards = savedCards.length > 0;
  const gridScale = Math.max(0.72, Math.min(1.7, cardWidth / 320));

  async function toggleSaved(card) {
    if (!uid) return;

    const saveId = card.saveId || buildSaveId(card.category || deck.category, card.deckId || deck.id, card.id);
    const isSaved = !!savedMap[card.id];

    try {
      if (isSaved) {
        await removeHubFlashcard(saveId);
        setSavedMap((current) => {
          const next = { ...current };
          delete next[card.id];
          return next;
        });
      } else {
        const entry = {
          saveId,
          category: card.category || deck.category,
          deckId: card.deckId || deck.id,
          deckTitle: card.deckTitle || deck.title,
          cardId: card.id,
          frontText: card.frontText || "",
          frontBlocks: card.frontBlocks || [],
          backText: card.backText,
          emphasisText: card.emphasisText || "",
          emphasisTexts: card.emphasisTexts || [],
          tag: card.tag || "",
        };
        await saveHubFlashcard(entry);
        setSavedMap((current) => ({
          ...current,
          [card.id]: entry,
        }));
      }
    } catch (error) {
      console.error("Failed to toggle saved flashcard", error);
    }
  }

  function toggleGridFlip(cardId) {
    setGridFlipped((current) => ({
      ...current,
      [cardId]: !current[cardId],
    }));
  }

  function renderCardFace(card, isFlipped, layoutMode = "grid") {
    const promptedFront = !isFlipped && isPromptedFront(card);

    return (
      <div
        className={`hub-flashcard-face-content ${isFlipped ? "is-back-face" : "is-front-face"} ${
          promptedFront ? "is-prompted-front" : ""
        } ${layoutMode === "focus" ? "is-focus-face" : "is-grid-face"}`}
      >
        <div className="hub-flashcard-meta">
          <span />
          <button
            type="button"
            className={`fav-btn hub-flashcard-save ${savedMap[card.id] ? "is-saved" : ""}`}
            onClick={(event) => {
              event.stopPropagation();
              toggleSaved(card);
            }}
            disabled={!uid}
            aria-pressed={!!savedMap[card.id]}
            aria-label={savedMap[card.id] ? "Remove from saved cards" : "Save card for review"}
            title={uid ? (savedMap[card.id] ? "Remove from saved cards" : "Save card for review") : "Sign in to save cards"}
          >
            {savedMap[card.id] ? (
              <Star size={18} fill="#ffd36a" stroke="#ffd36a" />
            ) : (
              <Star size={18} />
            )}
          </button>
        </div>

        <div className="hub-flashcard-body">
          <p className="hub-flashcard-label">{isFlipped ? "Back" : "Front"}</p>
          {isFlipped ? (
            <p className="hub-flashcard-text">
              {renderHighlightedSentence(card.backText, card.emphasisTexts || card.emphasisText)}
            </p>
          ) : card.frontBlocks?.length === 1 ? (
            <p className="hub-flashcard-text">{card.frontBlocks[0].text}</p>
          ) : promptedFront ? (
            <div className="hub-flashcard-prompted-front">
              {card.frontBlocks[0] ? (
                <div className="hub-flashcard-front-block hub-flashcard-front-block--hero">
                  <p className="hub-flashcard-text hub-flashcard-text--prompted">
                    {card.frontBlocks[0].text}
                  </p>
                </div>
              ) : null}

              <div className="hub-flashcard-prompted-rows">
                {card.frontBlocks.slice(1).map((block) => (
                  <p key={`${card.id}-${block.label}`} className="hub-flashcard-prompt-row">
                    <span className="hub-flashcard-prompt-row-label">{block.label}</span>
                    <span className="hub-flashcard-prompt-row-text">
                      {String(block.text)
                        .split("\n")
                        .join(" ")}
                    </span>
                  </p>
                ))}
              </div>
            </div>
          ) : card.frontBlocks?.length ? (
            <div className="hub-flashcard-front-blocks">
              {card.frontBlocks.map((block) => (
                <div key={`${card.id}-${block.label}`} className="hub-flashcard-front-block">
                  <p className="hub-flashcard-block-label">{block.label}</p>
                  <p className="hub-flashcard-block-text">
                    {String(block.text)
                      .split("\n")
                      .map((line, index) => (
                        <React.Fragment key={`${card.id}-${block.label}-${index}`}>
                          {index > 0 ? <br /> : null}
                          {line}
                        </React.Fragment>
                      ))}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="hub-flashcard-text">{card.frontText}</p>
          )}
        </div>

        {isFlipped ? (
          <div className="hub-flashcard-footer">
            {card.tag ? <span className="hub-flashcard-tag hub-flashcard-tag--footer">{card.tag}</span> : <span />}
          </div>
        ) : (
          <p className="hub-flashcard-hint">Click to reveal the rewritten sentence.</p>
        )}
      </div>
    );
  }

  return (
    <div className="menu-wrapper hub-flashcards-shell">
      <Seo
        title={`${deck.title} | Seif Hub`}
        description={deck.description}
      />

      <div className="hub-flashcards-header-row">
        <div className="hub-flashcards-heading">
          <p className="hub-flashcards-kicker">Grammar flashcards</p>
          <h1>{deck.title}</h1>
          <p className="hub-flashcards-subcopy">{deck.studyTip}</p>
        </div>
        <button className="review-btn" onClick={() => navigate(getSitePath("/grammar/flashcards"))}>
          All decks
        </button>
      </div>

      {!isSavedReviewDeck ? (
      <div className="hub-flashcards-toolbar hub-flashcards-toolbar--compact">
        <div className="hub-flashcards-toolbar-group">
          <span className="hub-flashcards-toolbar-label">View</span>
          <div className="hub-flashcards-pill-row">
            <button
              className={`count-chip ${displayMode === "grid" ? "selected" : ""}`}
              onClick={() => setDisplayMode("grid")}
            >
              Grid
            </button>
            <button
              className={`count-chip ${displayMode === "focus" ? "selected" : ""}`}
              onClick={() => setDisplayMode("focus")}
            >
              Focus
            </button>
          </div>
        </div>

        {displayMode === "grid" ? (
          <div className="hub-flashcards-toolbar-group">
            <div className="hub-flashcards-slider-top">
              <span className="hub-flashcards-toolbar-label">Zoom</span>
              <span className="hub-flashcards-slider-value">{cardWidth}px</span>
            </div>
            <input
              type="range"
              min="220"
              max="620"
              step="20"
              value={cardWidth}
              onChange={(event) => setCardWidth(Number(event.target.value))}
              className="hub-flashcards-slider"
            />
          </div>
        ) : (
          <div className="hub-flashcards-toolbar-group">
            <span className="hub-flashcards-toolbar-label">Navigation</span>
            <p className="hub-flashcards-mini-note">Use click, space, Enter, or arrow keys.</p>
          </div>
        )}

        <div className="hub-flashcards-toolbar-group">
          <span className="hub-flashcards-toolbar-label">Review</span>
          <div className="hub-flashcards-pill-row">
            <button
              className={`review-btn ${reviewMode === "deck" ? "selected-pill" : ""}`}
              onClick={() => setReviewMode("deck")}
            >
              Full deck
            </button>
            <button
              className={`review-btn ${reviewMode === "saved" ? "selected-pill" : ""}`}
              onClick={() => setReviewMode("saved")}
              disabled={!hasSavedCards}
            >
              Saved set
            </button>
            <button
              className={`review-btn ${reviewMode === "saved-random" ? "selected-pill" : ""}`}
              onClick={() => setReviewMode("saved-random")}
              disabled={!hasSavedCards}
            >
              Saved random
            </button>
          </div>
        </div>
      </div>
      ) : null}

      <div className="hub-flashcards-summary">
        <span className="pill">Cards: {visibleCards.length}</span>
        <span className="pill">Saved: {savedCards.length}</span>
        {isLoadingSaved ? <span className="pill">Loading saved cards...</span> : null}
        {!uid ? <span className="pill">Sign in to save cards for review</span> : null}
      </div>

      {displayMode === "grid" ? (
        <div
          className="hub-flashcards-grid"
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${cardWidth}px), ${cardWidth}px))`,
            "--hub-flashcard-scale": gridScale,
          }}
        >
          {visibleCards.map((card) => {
            const isFlipped = !!gridFlipped[card.id];
            const isPromptedCard = isPromptedFront(card);
            return (
              <button
                key={card.id}
                type="button"
                className={`hub-flashcard tile-card ${isFlipped ? "is-flipped" : ""} ${
                  isPromptedCard ? "is-prompted-card" : ""
                }`}
                onClick={() => toggleGridFlip(card.id)}
                style={{
                  "--hub-flashcard-scale": gridScale,
                  "--hub-card-width": `${cardWidth}px`,
                }}
              >
                <div className="hub-flashcard-inner">
                  <div className="hub-flashcard-face hub-flashcard-front">
                    {renderCardFace(card, false, "grid")}
                  </div>
                  <div className="hub-flashcard-face hub-flashcard-back">
                    {renderCardFace(card, true, "grid")}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : focusCard ? (
        <div className="hub-flashcard-focus-shell">
          {isSavedReviewDeck ? (
            <div className="hub-flashcards-review-context">
              Reviewing saved flashcards from all grammar decks in random order.
            </div>
          ) : reviewMode !== "deck" ? (
            <div className="hub-flashcards-review-context">
              Reviewing {reviewMode === "saved-random" ? "saved cards in random order" : "saved cards"} from{" "}
              <strong>{deck.title}</strong>.
            </div>
          ) : null}

          {isSavedReviewDeck && focusCard?.deckTitle ? (
            <div className="hub-flashcards-review-origin">
              From: <strong>{focusCard.deckTitle}</strong>
            </div>
          ) : null}

          <div className="hub-flashcard-focus-top">
            <button
              type="button"
              className="review-btn"
              onClick={() => moveFocusCard(-1)}
            >
              Previous
            </button>
            <span className="pill">
              {focusIndex + 1} / {visibleCards.length}
            </span>
            <button
              type="button"
              className="review-btn"
              onClick={() => moveFocusCard(1)}
            >
              Next
            </button>
          </div>

          <button
            key={focusCard.id}
            type="button"
            className={`hub-flashcard focus-card ${focusedFlipped ? "is-flipped" : ""}`}
            onClick={() => setFocusedFlipped((current) => !current)}
          >
            <div className="hub-flashcard-inner">
              <div className="hub-flashcard-face hub-flashcard-front">
                {renderCardFace(focusCard, false, "focus")}
              </div>
              <div className="hub-flashcard-face hub-flashcard-back">
                {renderCardFace(focusCard, true, "focus")}
              </div>
            </div>
          </button>
        </div>
      ) : (
        <div className="hub-flashcards-empty">
          <h3>No saved cards yet</h3>
          <p>Save some cards from the deck first, then come back to review them here.</p>
        </div>
      )}

      <style>{`
        .hub-flashcards-shell {
          padding-top: 0;
          margin-top: 0;
        }

        .hub-flashcards-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: .9rem;
        }

        .hub-flashcards-heading h1 {
          margin: 0;
          font-size: clamp(1.55rem, 1.25rem + 1vw, 2.15rem);
          line-height: 1.15;
          color: #eef4ff;
        }

        .hub-flashcards-kicker {
          margin: 0 0 .25rem;
          font-size: .82rem;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: #8eb6ff;
        }

        .hub-flashcards-subcopy {
          margin: .4rem 0 0;
          max-width: 62rem;
          color: rgba(230, 240, 255, 0.8);
          line-height: 1.45;
        }

        .hub-flashcards-toolbar {
          display: grid;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .hub-flashcards-toolbar--compact {
          grid-template-columns: 1.2fr 1fr 1.4fr;
          align-items: stretch;
        }

        .hub-flashcards-toolbar-group {
          padding: .8rem .9rem;
          border-radius: 20px;
          background: rgba(20, 33, 59, 0.88);
          border: 1px solid rgba(77, 110, 184, 0.45);
        }

        .hub-flashcards-toolbar-label {
          display: block;
          margin-bottom: .7rem;
          font-size: .82rem;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: #8eb6ff;
        }

        .hub-flashcards-pill-row {
          display: flex;
          flex-wrap: wrap;
          gap: .65rem;
        }

        .hub-flashcards-slider-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: .75rem;
          margin-bottom: .55rem;
        }

        .hub-flashcards-slider-value {
          color: rgba(230, 240, 255, 0.78);
          font-size: .92rem;
          font-weight: 700;
        }

        .hub-flashcards-slider {
          width: 100%;
          accent-color: #f4bf57;
          cursor: pointer;
        }

        .hub-flashcards-mini-note {
          margin: 0;
          color: rgba(230, 240, 255, 0.78);
          line-height: 1.4;
        }

        .selected-pill {
          border-color: #f4bf57;
          color: #f4bf57;
          background: rgba(244, 191, 87, 0.08);
        }

        .hub-flashcards-summary {
          display: flex;
          flex-wrap: wrap;
          gap: .65rem;
          margin-bottom: 1rem;
        }

        .hub-flashcards-grid {
          display: grid;
          gap: 1rem;
          justify-content: center;
        }

        .hub-flashcard {
          width: 100%;
          max-width: 100%;
          display: block;
          position: relative;
          appearance: none;
          -webkit-appearance: none;
          outline: none;
          -webkit-tap-highlight-color: transparent;
          border-radius: 24px;
          border: none;
          background: transparent;
          color: #eef4ff;
          box-shadow: none;
          transition: transform .16s ease, box-shadow .16s ease;
          perspective: 1200px;
        }

        .hub-flashcard:focus,
        .hub-flashcard:focus-visible,
        .hub-flashcard:active {
          outline: none;
          box-shadow: none;
        }

        .hub-flashcard::-moz-focus-inner {
          border: 0;
        }

        .hub-flashcard:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 34px rgba(0, 0, 0, 0.12);
        }

        .hub-flashcard.tile-card {
          height: clamp(230px, calc(var(--hub-card-width, 320px) * 0.72), 420px);
          padding: 0;
          text-align: left;
        }

        .hub-flashcard.tile-card.is-prompted-card {
          height: clamp(240px, calc(var(--hub-card-width, 320px) * 0.76), 430px);
        }

        .hub-flashcard.focus-card {
          width: min(100%, 860px);
          margin: 0 auto;
          height: clamp(320px, 50vh, 500px);
          min-height: 330px;
          padding: 0;
          text-align: left;
          --hub-flashcard-scale: 1.48;
        }

        .hub-flashcard-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
          transition: transform .62s cubic-bezier(.2, .8, .2, 1);
        }

        .hub-flashcard.is-flipped .hub-flashcard-inner {
          transform: rotateY(180deg);
        }

        .hub-flashcard-face {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 24px;
          border: 2px solid #35508e;
          background: linear-gradient(180deg, #22345d, #182643);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.16);
          overflow: hidden;
        }

        .hub-flashcard-front {
          transform: rotateY(0deg) translateZ(1px);
        }

        .hub-flashcard-back {
          transform: rotateY(180deg) translateZ(1px);
        }

        .hub-flashcard-face-content {
          display: flex;
          flex-direction: column;
          gap: .7rem;
          height: 100%;
          padding: calc(0.85rem * var(--hub-flashcard-scale, 1));
          position: relative;
        }

        .hub-flashcard-meta {
          position: absolute;
          top: calc(0.85rem * var(--hub-flashcard-scale, 1));
          right: calc(0.85rem * var(--hub-flashcard-scale, 1));
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: .5rem;
        }

        .hub-flashcard-tag {
          display: inline-flex;
          align-items: center;
          min-height: 36px;
          padding: calc(.3rem * var(--hub-flashcard-scale, 1)) calc(.62rem * var(--hub-flashcard-scale, 1));
          border-radius: 999px;
          font-size: calc(.8rem * var(--hub-flashcard-scale, 1));
          font-weight: 800;
          color: #eef4ff;
          background: rgba(104, 140, 221, 0.15);
          border: 1px solid rgba(104, 140, 221, 0.4);
        }

        .hub-flashcard-save {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: calc(2.35rem * var(--hub-flashcard-scale, 1));
          height: calc(2.35rem * var(--hub-flashcard-scale, 1));
          padding: 0;
          border-radius: 999px;
          border: 1px solid rgba(127, 180, 255, 0.34);
          background: rgba(127, 180, 255, 0.16);
          color: #eef4ff;
          cursor: pointer;
        }

        .hub-flashcard-save.is-saved {
          background: rgba(255, 211, 106, 0.12);
          border-color: rgba(255, 211, 106, 0.4);
          color: #fff3bf;
        }

        .hub-flashcard-save:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .hub-flashcard-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          gap: calc(.42rem * var(--hub-flashcard-scale, 1));
          padding-top: calc(2.2rem * var(--hub-flashcard-scale, 1));
          padding-bottom: calc(.45rem * var(--hub-flashcard-scale, 1));
          min-height: 0;
        }

        .hub-flashcard-front-blocks {
          display: flex;
          flex-direction: column;
          gap: calc(.8rem * var(--hub-flashcard-scale, 1));
        }

        .hub-flashcard-prompted-front {
          display: flex;
          flex-direction: column;
          gap: calc(.56rem * var(--hub-flashcard-scale, 1));
          min-height: 0;
          flex: 1;
        }

        .hub-flashcard-prompted-rows {
          display: flex;
          flex-direction: column;
          gap: calc(.22rem * var(--hub-flashcard-scale, 1));
          margin-top: auto;
        }

        .hub-flashcard-front-block--hero {
          gap: 0;
        }

        .hub-flashcard-front-block {
          display: flex;
          flex-direction: column;
          gap: calc(.24rem * var(--hub-flashcard-scale, 1));
        }

        .hub-flashcard-block-label {
          margin: 0;
          font-size: calc(.92rem * var(--hub-flashcard-scale, 1));
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: rgba(230, 240, 255, 0.68);
        }

        .hub-flashcard-block-text {
          margin: 0;
          font-size: calc(1.1rem * var(--hub-flashcard-scale, 1));
          line-height: 1.5;
          color: #eef4ff;
        }

        .hub-flashcard-prompt-row {
          margin: 0;
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: calc(.28rem * var(--hub-flashcard-scale, 1));
          color: #eef4ff;
        }

        .hub-flashcard-prompt-row-label {
          font-size: calc(.72rem * var(--hub-flashcard-scale, 1));
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: rgba(230, 240, 255, 0.68);
        }

        .hub-flashcard-prompt-row-text {
          font-size: calc(.86rem * var(--hub-flashcard-scale, 1));
          font-weight: 700;
          color: #eef4ff;
        }

        .hub-flashcard-label {
          margin: 0;
          font-size: calc(.92rem * var(--hub-flashcard-scale, 1));
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: rgba(230, 240, 255, 0.68);
        }

        .hub-flashcard-text {
          margin: 0;
          font-size: calc(1.28rem * var(--hub-flashcard-scale, 1));
          line-height: 1.45;
          color: #eef4ff;
        }

        .hub-flashcard-text--prompted {
          font-size: calc(.98rem * var(--hub-flashcard-scale, 1));
          line-height: 1.3;
        }

        .hub-flashcard.tile-card.is-prompted-card .hub-flashcard-text--prompted {
          font-size: clamp(1rem, calc(1.02rem * var(--hub-flashcard-scale, 1)), 1.95rem);
          line-height: 1.34;
        }

        .hub-flashcard.tile-card.is-prompted-card .hub-flashcard-prompt-row-label {
          font-size: clamp(.72rem, calc(.78rem * var(--hub-flashcard-scale, 1)), 1.18rem);
        }

        .hub-flashcard.tile-card.is-prompted-card .hub-flashcard-prompt-row-text {
          font-size: clamp(.88rem, calc(.9rem * var(--hub-flashcard-scale, 1)), 1.42rem);
        }

        .hub-flashcard-highlight {
          display: inline-block;
          padding: .04em .42em;
          margin: 0 .08em;
          border-radius: 999px;
          background: #f4cf45;
          color: #13213b;
          font-weight: 800;
        }

        .hub-flashcard-hint {
          margin-top: auto;
          color: rgba(230, 240, 255, 0.64);
          font-size: calc(.9rem * var(--hub-flashcard-scale, 1));
          line-height: 1.3;
          min-height: calc(1.2rem * var(--hub-flashcard-scale, 1));
        }

        .hub-flashcard-footer {
          display: flex;
          align-items: flex-end;
          justify-content: flex-start;
          min-height: 44px;
          margin-top: auto;
        }

        .hub-flashcard-tag--footer {
          background: rgba(104, 140, 221, 0.18);
        }

        .hub-flashcard-face-content.is-back-face .hub-flashcard-body {
          justify-content: center;
        }

        .hub-flashcard-face-content.is-back-face .hub-flashcard-text {
          text-align: center;
        }

        .hub-flashcard-face-content.is-back-face .hub-flashcard-footer {
          justify-content: center;
        }

        .hub-flashcard.focus-card .hub-flashcard-face-content.is-focus-face {
          gap: calc(.5rem * var(--hub-flashcard-scale, 1));
        }

        .hub-flashcard.focus-card .hub-flashcard-body {
          gap: calc(.34rem * var(--hub-flashcard-scale, 1));
          padding-bottom: calc(.2rem * var(--hub-flashcard-scale, 1));
        }

        .hub-flashcard.focus-card .hub-flashcard-prompted-front {
          gap: calc(.5rem * var(--hub-flashcard-scale, 1));
          flex: 0;
        }

        .hub-flashcard.focus-card .hub-flashcard-prompted-rows {
          gap: calc(.18rem * var(--hub-flashcard-scale, 1));
          margin-top: 0;
        }

        .hub-flashcard.focus-card .hub-flashcard-hint {
          margin-top: calc(.7rem * var(--hub-flashcard-scale, 1));
          min-height: auto;
        }

        .hub-flashcard.focus-card .hub-flashcard-footer {
          min-height: auto;
          margin-top: calc(.7rem * var(--hub-flashcard-scale, 1));
        }

        .hub-flashcard-focus-shell {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
        }

        .hub-flashcards-review-context {
          width: min(100%, 860px);
          padding: .7rem .9rem;
          border-radius: 16px;
          background: rgba(20, 33, 59, 0.76);
          border: 1px solid rgba(77, 110, 184, 0.38);
          color: rgba(230, 240, 255, 0.82);
          line-height: 1.4;
        }

        .hub-flashcards-review-origin {
          width: min(100%, 860px);
          color: rgba(230, 240, 255, 0.82);
          font-size: .98rem;
          line-height: 1.35;
        }

        .hub-flashcard-focus-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          width: min(100%, 860px);
        }

        .hub-flashcards-empty {
          padding: 1.4rem;
          border-radius: 22px;
          background: rgba(20, 33, 59, 0.88);
          border: 1px solid rgba(77, 110, 184, 0.45);
        }

        .hub-flashcards-empty h3,
        .hub-flashcards-empty p {
          margin: 0;
        }

        .hub-flashcards-empty h3 {
          margin-bottom: .45rem;
          color: #eef4ff;
        }

        .hub-flashcards-empty p {
          color: rgba(230, 240, 255, 0.82);
        }

        @media (max-width: 900px) {
          .hub-flashcards-toolbar--compact {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .hub-flashcards-header-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .hub-flashcards-header-row .review-btn {
            width: 100%;
          }

          .hub-flashcard-focus-top {
            flex-wrap: wrap;
          }

        .hub-flashcard.focus-card {
            width: 100%;
            height: clamp(280px, 52vh, 460px);
            min-height: 300px;
            --hub-flashcard-scale: 1.18;
          }
        }
      `}</style>
    </div>
  );
}
