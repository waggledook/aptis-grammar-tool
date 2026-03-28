import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { HUB_GRAMMAR_FLASHCARD_DECKS } from "../../data/hubGrammarFlashcards.js";
import { auth, fetchHubSavedFlashcards } from "../../firebase.js";

export default function HubGrammarFlashcardsMenu() {
  const navigate = useNavigate();
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    let alive = true;

    async function loadSavedCount() {
      if (!auth.currentUser?.uid) {
        if (alive) setSavedCount(0);
        return;
      }

      try {
        const saved = await fetchHubSavedFlashcards({
          uid: auth.currentUser.uid,
          category: "grammar",
        });
        if (alive) setSavedCount(saved.length);
      } catch (error) {
        console.error("Failed to load saved flashcards count", error);
      }
    }

    loadSavedCount();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="menu-wrapper hub-flashcards-menu-shell">
      <Seo
        title="Grammar Flashcards | Seif Hub"
        description="Choose a grammar flashcard deck inside the Seif English Hub."
      />

      <div className="hub-flashcards-menu-topbar">
        <div>
          <p className="hub-flashcards-eyebrow">Grammar flashcards</p>
          <h1 className="hub-flashcards-title">Choose a deck</h1>
          <p className="hub-flashcards-copy">
            Use grid view for a page full of cards, or switch to focus mode for one card at a time.
          </p>
        </div>
        <div style={{ display: "flex", gap: ".65rem", flexWrap: "wrap" }}>
          <button
            className="review-btn"
            onClick={() => navigate(getSitePath("/grammar/flashcards/saved-review"))}
            disabled={!savedCount}
          >
            {savedCount ? `Review saved cards (${savedCount})` : "No saved cards yet"}
          </button>
          <button className="review-btn" onClick={() => navigate(getSitePath("/grammar"))}>
            Back to grammar
          </button>
        </div>
      </div>

      <div className="hub-flashcards-menu-grid">
        {HUB_GRAMMAR_FLASHCARD_DECKS.map((deck) => (
          <button
            key={deck.id}
            className="hub-flashcards-menu-card"
            onClick={() => navigate(getSitePath(`/grammar/flashcards/${deck.id}`))}
          >
            <div className="hub-flashcards-menu-card-top">
              <h3>{deck.title}</h3>
              <span className="hub-flashcards-menu-card-pill">{deck.cards.length} cards</span>
            </div>
            <p>{deck.description}</p>
          </button>
        ))}
      </div>

      <style>{`
        .hub-flashcards-menu-shell {
          padding-top: 0;
          margin-top: 0;
        }

        .hub-flashcards-menu-topbar {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .hub-flashcards-eyebrow {
          margin: 0 0 .25rem;
          font-size: .82rem;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: #8eb6ff;
        }

        .hub-flashcards-title {
          margin: 0;
          font-size: clamp(1.6rem, 1.3rem + 1vw, 2.2rem);
          color: #eef4ff;
        }

        .hub-flashcards-copy {
          margin: .35rem 0 0;
          max-width: 52rem;
          color: rgba(230, 240, 255, 0.84);
          line-height: 1.5;
        }

        .hub-flashcards-menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }

        .hub-flashcards-menu-card {
          text-align: left;
          background: #1a2847;
          border: 2px solid #35508e;
          border-radius: 22px;
          padding: 1.25rem 1.35rem;
          color: #eef4ff;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16);
          transition: transform .16s ease, border-color .16s ease, box-shadow .16s ease;
        }

        .hub-flashcards-menu-card:hover {
          transform: translateY(-2px);
          border-color: #4a6bc0;
          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.2);
        }

        .hub-flashcards-menu-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: .75rem;
          margin-bottom: .55rem;
        }

        .hub-flashcards-menu-card h3 {
          margin: 0;
          color: #eef4ff;
          font-size: 1.15rem;
          line-height: 1.2;
        }

        .hub-flashcards-menu-card p {
          margin: 0;
          color: rgba(238, 244, 255, 0.88);
          font-size: 1rem;
          line-height: 1.45;
        }

        .hub-flashcards-menu-card-pill {
          flex-shrink: 0;
          padding: .35rem .7rem;
          border-radius: 999px;
          background: rgba(255, 191, 73, 0.12);
          color: #ffcf70;
          border: 1px solid rgba(255, 191, 73, 0.28);
          font-size: .82rem;
          font-weight: 800;
        }

        @media (max-width: 720px) {
          .hub-flashcards-menu-topbar {
            flex-direction: column;
            align-items: flex-start;
          }

          .hub-flashcards-menu-topbar .review-btn {
            width: 100%;
          }

          .hub-flashcards-menu-topbar > div:last-child {
            width: 100%;
          }

          .hub-flashcards-menu-topbar > div:last-child .review-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
