import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import {
  getAllHubVocabThemes,
  HUB_VOCAB_LEVELS,
  HUB_VOCAB_LEVEL_COLORS,
} from "../../data/hubVocabularyActivities.js";

function getSearchText(theme) {
  return [
    theme.title,
    theme.shortDescription,
    theme.textbookRef,
    ...(theme.activities || []).map((activity) => activity.title),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function HubVocabularyA1Menu() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedLevels, setSelectedLevels] = useState([]);
  const themes = useMemo(() => getAllHubVocabThemes(), []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, []);

  const filteredThemes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return themes.filter((theme) => {
      const matchesLevel =
        selectedLevels.length === 0 || selectedLevels.includes(theme.level);
      const matchesQuery = !normalizedQuery || getSearchText(theme).includes(normalizedQuery);
      return matchesLevel && matchesQuery;
    });
  }, [query, selectedLevels, themes]);

  function toggleLevel(levelId) {
    setSelectedLevels((prev) =>
      prev.includes(levelId) ? prev.filter((item) => item !== levelId) : [...prev, levelId]
    );
  }

  function clearFilters() {
    setQuery("");
    setSelectedLevels([]);
  }

  return (
    <div className="menu-wrapper hub-menu-wrapper hub-vocab-a1-menu">
      <Seo
        title="Vocabulary Activities | Seif Hub"
        description="Practise textbook vocabulary topics through flexible Seif Hub activities."
      />

      <header className="main-header" style={{ textAlign: "center", marginBottom: "0rem" }}>
        <img
          src="/images/seif-english-hub-logo.png"
          alt="Seif English Hub Logo"
          className="menu-logo hub-logo"
          draggable="false"
        />
      </header>

      <p className="menu-sub">Choose a vocabulary topic to practise.</p>

      <div className="whats-new-banner hub-status-banner">
        <div className="whats-new-copy">
          <span className="whats-new-label">Vocabulary bank</span>
          <p>
            Textbook topics become flexible practice sets with the right activity
            types for each theme.
          </p>
        </div>

        <button className="whats-new-btn" onClick={() => navigate(getSitePath("/vocabulary"))}>
          Back to vocabulary
        </button>
      </div>

      <section className="hub-mini-browser">
        <div className="hub-mini-browser-head">
          <div>
            <h2>Browse Topics</h2>
            <p>Filter by level or search by topic as the vocabulary bank grows.</p>
          </div>
          <div className="hub-mini-count">
            {filteredThemes.length} topic{filteredThemes.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="hub-mini-filters">
          <div className="hub-mini-filter-group">
            <span className="hub-mini-filter-label">Level</span>
            <div className="level-row">
              {HUB_VOCAB_LEVELS.map((level) => (
                <label
                  key={level.id}
                  className={`level-pill ${selectedLevels.includes(level.id) ? "selected" : ""}`}
                  style={{ "--badge-color": HUB_VOCAB_LEVEL_COLORS[level.id] || "#8aa0ff" }}
                >
                  <input
                    type="checkbox"
                    checked={selectedLevels.includes(level.id)}
                    onChange={() => toggleLevel(level.id)}
                  />
                  <span>{level.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="hub-mini-filter-group hub-mini-search-group">
            <span className="hub-mini-filter-label">Search</span>
            <div className="hub-mini-search-row">
              <input
                type="text"
                className="hub-mini-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try numbers, flags, nationalities..."
              />
              {query || selectedLevels.length ? (
                <button type="button" className="hub-mini-clear" onClick={clearFilters}>
                  Clear
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="menu-grid">
        {filteredThemes.map((theme) => (
          <article key={theme.id} className="menu-card hub-vocab-topic-card" style={{ "--theme-accent": theme.accent }}>
            <button
              type="button"
              className="hub-vocab-topic-main"
              onClick={() =>
                navigate(getSitePath(`/vocabulary/textbook/${theme.id}/${theme.activities[0]?.id || "flashcards"}`))
              }
            >
              <div className="hub-vocab-topic-top">
                <span
                  className="cefr-badge"
                  style={{ "--badge-color": HUB_VOCAB_LEVEL_COLORS[theme.level] || theme.accent }}
                >
                  {theme.level.toUpperCase()}
                </span>
                <span className="hub-vocab-topic-ref">{theme.textbookRef}</span>
              </div>
              <h3>{theme.title}</h3>
              <p>{theme.shortDescription}</p>
              <div className="hub-vocab-topic-meta">
                <span>{theme.itemCount || theme.entries.length} items</span>
                <span>{theme.activities.length} activity types</span>
              </div>
              <span className="hub-vocab-card-cta">Open practice menu</span>
            </button>
          </article>
        ))}
      </div>

      {!filteredThemes.length ? (
        <div className="hub-mini-empty">
          <strong>No vocabulary topics match that search.</strong>
          <p>Try a broader topic, activity type, or textbook word.</p>
        </div>
      ) : null}

      <style>{`
        .hub-menu-wrapper {
          padding-top: 0;
          margin-top: 0;
        }

        .hub-menu-wrapper .main-header {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0;
          padding: 0;
          line-height: 0;
          text-align: center;
        }

        .hub-menu-wrapper .menu-logo {
          display: block;
          width: clamp(220px, 26vw, 380px);
          height: auto;
          filter:
            drop-shadow(0 0 10px rgba(255,255,255,0.5))
            drop-shadow(0 0 18px rgba(255,165,0,0.35));
          animation: hubLogoFade 1.2s ease both;
          transition: filter .3s ease;
          margin: 0;
        }

        @keyframes hubLogoFade {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }

        .hub-menu-wrapper .menu-sub {
          opacity: .85;
          margin-top: .2rem;
          margin-bottom: .6rem;
          text-align: center;
        }

        .hub-menu-wrapper .whats-new-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin: 0 0 1rem;
          padding: .9rem 1rem;
          border-radius: 14px;
          background: linear-gradient(
            90deg,
            rgba(255, 191, 73, 0.10),
            rgba(255, 191, 73, 0.04)
          );
          border: 1px solid rgba(255, 191, 73, 0.35);
        }

        .hub-menu-wrapper .whats-new-label {
          display: inline-block;
          margin-bottom: .35rem;
          padding: .2rem .55rem;
          border-radius: 999px;
          font-size: .75rem;
          font-weight: 700;
          letter-spacing: .02em;
          color: #ffcf70;
          background: rgba(255, 191, 73, 0.12);
          border: 1px solid rgba(255, 191, 73, 0.28);
        }

        .hub-menu-wrapper .whats-new-copy p {
          margin: 0;
          color: #e6f0ff;
          line-height: 1.4;
        }

        .hub-menu-wrapper .whats-new-btn {
          flex-shrink: 0;
          background: linear-gradient(180deg, #f6bd60, #e9a93f);
          color: #13213b;
          border: none;
          border-radius: 12px;
          padding: .7rem 1rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform .08s ease, box-shadow .08s ease;
        }

        .hub-menu-wrapper .menu-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }

        .hub-menu-wrapper .menu-card {
          text-align: left;
          background: #1a2847;
          border: 2px solid #35508e;
          border-radius: 22px;
          padding: 1.45rem 1.5rem;
          color: #eef4ff;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16);
          transition: transform .16s ease, border-color .16s ease, box-shadow .16s ease;
        }

        .hub-menu-wrapper .menu-card:hover {
          transform: translateY(-2px);
          border-color: #4a6bc0;
          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.2);
        }

        .hub-menu-wrapper .menu-card h3 {
          margin-bottom: .55rem;
          color: #eef4ff;
          font-size: 1.15rem;
          line-height: 1.2;
        }

        .hub-menu-wrapper .menu-card p {
          margin: 0;
          color: rgba(238, 244, 255, 0.88);
          font-size: 1rem;
          line-height: 1.45;
        }

        .hub-mini-browser {
          border: 1px solid rgba(238, 244, 255, 0.12);
          border-radius: 22px;
          background: rgba(16, 25, 45, 0.84);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
          margin-bottom: 1rem;
          padding: 1rem;
        }

        .hub-mini-browser-head {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.9rem;
        }

        .hub-mini-browser-head h2 {
          color: #eef4ff;
          margin: 0 0 0.25rem;
        }

        .hub-mini-browser-head p {
          color: rgba(238, 244, 255, 0.72);
          margin: 0;
        }

        .hub-mini-count {
          align-self: flex-start;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          color: #eef4ff;
          font-weight: 800;
          padding: 0.42rem 0.75rem;
          white-space: nowrap;
        }

        .hub-mini-filters {
          display: grid;
          grid-template-columns: auto minmax(220px, 1fr);
          gap: 1rem;
        }

        .hub-mini-filter-group {
          display: grid;
          gap: 0.4rem;
        }

        .hub-mini-filter-label {
          color: rgba(238, 244, 255, 0.68);
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .level-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
        }

        .level-pill {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.5rem 0.8rem;
          border-radius: 999px;
          border: 2px solid rgba(255,255,255,0.12);
          background: rgba(17, 27, 51, 0.82);
          color: #dbe7ff;
          cursor: pointer;
          font-weight: 700;
          transition: transform 0.14s ease, border-color 0.18s ease, background 0.18s ease;
        }

        .level-pill::before {
          content: "";
          width: 0.6rem;
          height: 0.6rem;
          border-radius: 999px;
          background: var(--badge-color, #8aa0ff);
          box-shadow: 0 0 0 2px rgba(255,255,255,0.08);
        }

        .level-pill input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }

        .level-pill.selected {
          border-color: color-mix(in srgb, var(--badge-color, #8aa0ff) 78%, white 22%);
          background: rgba(32, 48, 84, 0.96);
          color: #f8fbff;
          transform: translateY(-1px);
        }

        .hub-mini-search-row {
          display: flex;
          gap: 0.55rem;
        }

        .hub-mini-search {
          border: 1px solid rgba(238, 244, 255, 0.16);
          border-radius: 14px;
          background: #17243f;
          color: #fff;
          flex: 1;
          font: inherit;
          padding: 0.75rem 0.85rem;
        }

        .hub-mini-clear {
          border: 1px solid rgba(238, 244, 255, 0.16);
          border-radius: 14px;
          background: rgba(238, 244, 255, 0.08);
          color: #eef4ff;
          cursor: pointer;
          font-weight: 800;
          padding: 0.75rem 0.9rem;
        }

        .hub-menu-wrapper .cefr-badge {
          position: static;
          top: auto;
          right: auto;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.32rem 0.6rem;
          border-radius: 999px;
          border: 1px solid color-mix(in srgb, var(--badge-color, #8aa0ff) 52%, transparent);
          background: rgba(20, 30, 56, 0.82);
          color: #eef4ff;
          font-size: 0.82rem;
          font-weight: 800;
          line-height: 1;
        }

        .hub-menu-wrapper .cefr-badge::before {
          content: "";
          width: 0.55rem;
          height: 0.55rem;
          border-radius: 999px;
          background: var(--badge-color, #8aa0ff);
          box-shadow: 0 0 0 2px rgba(255,255,255,0.08);
        }

        .hub-vocab-topic-card {
          --theme-accent: #72df9b;
          display: grid;
          gap: 1rem;
          overflow: hidden;
          position: relative;
        }

        .hub-vocab-topic-card::before {
          content: "";
          position: absolute;
          inset: 0 auto 0 0;
          width: 5px;
          background: var(--theme-accent);
          opacity: 0.95;
        }

        .hub-vocab-topic-main {
          all: unset;
          cursor: pointer;
          display: grid;
          gap: 0.7rem;
          padding-left: 0.25rem;
        }

        .hub-vocab-topic-top,
        .hub-vocab-topic-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.55rem;
        }

        .hub-vocab-topic-ref,
        .hub-vocab-topic-meta span,
        .hub-vocab-card-cta {
          border-radius: 999px;
          border: 1px solid rgba(238, 244, 255, 0.18);
          background: rgba(238, 244, 255, 0.08);
          color: rgba(238, 244, 255, 0.82);
          font-size: 0.82rem;
          font-weight: 700;
          padding: 0.25rem 0.62rem;
        }

        .hub-vocab-card-cta {
          justify-self: start;
          border-color: color-mix(in srgb, var(--theme-accent), transparent 42%);
          background: color-mix(in srgb, var(--theme-accent), transparent 86%);
          color: #eef4ff;
          margin-top: 0.1rem;
        }

        @media (max-width: 720px) {
          .hub-menu-wrapper .whats-new-banner,
          .hub-mini-browser-head {
            flex-direction: column;
            align-items: flex-start;
          }

          .hub-menu-wrapper .menu-grid,
          .hub-mini-filters {
            grid-template-columns: 1fr;
          }

          .hub-menu-wrapper .whats-new-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
