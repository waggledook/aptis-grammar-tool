import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { HUB_GRAMMAR_ACTIVITIES } from "../../data/hubGrammarActivities.js";
import * as fb from "../../firebase";

const LEVELS = ["a2", "b1", "b2", "c1", "c2"];
const LEVEL_COLORS = {
  a2: "#7ef0c2",
  b1: "#8fb6ff",
  b2: "#f6d26b",
  c1: "#f2b0b7",
  c2: "#c7a4ff",
};

function getSearchText(activity) {
  return [activity.title, activity.shortDescription, activity.intro, ...(activity.levels || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function HubMiniGrammarTests() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [completedActivityIds, setCompletedActivityIds] = useState(new Set());

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const submissions = (await fb.fetchHubGrammarSubmissions?.(200)) || [];
        if (!alive) return;
        setCompletedActivityIds(
          new Set(submissions.map((submission) => submission?.activityId).filter(Boolean))
        );
      } catch (error) {
        console.error("[HubMiniGrammarTests] completion load failed", error);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const filteredActivities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return HUB_GRAMMAR_ACTIVITIES.filter((activity) => {
      const levels = activity.levels || [];
      const matchesLevel =
        selectedLevels.length === 0 ||
        selectedLevels.some((level) => levels.includes(level));
      const matchesQuery =
        !normalizedQuery || getSearchText(activity).includes(normalizedQuery);

      return matchesLevel && matchesQuery;
    });
  }, [query, selectedLevels]);

  function toggleLevel(level) {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((item) => item !== level) : [...prev, level]
    );
  }

  function clearFilters() {
    setQuery("");
    setSelectedLevels([]);
  }

  return (
    <div className="menu-wrapper hub-menu-wrapper">
      <Seo
        title="Mini Grammar Tests | Seif Hub"
        description="Choose a mini grammar test inside the Seif English Hub."
      />

      <header
        className="main-header"
        style={{ textAlign: "center", marginBottom: "0rem" }}
      >
        <img
          src="/images/seif-english-hub-logo.png"
          alt="Seif English Hub Logo"
          className="menu-logo hub-logo"
          draggable="false"
        />
      </header>

      <p className="menu-sub">Choose a mini grammar test to begin.</p>

      <div className="whats-new-banner hub-status-banner">
        <div className="whats-new-copy">
          <span className="whats-new-label">Mini grammar tests</span>
          <p>
            Short focused tests with instant corrective feedback and saved
            submissions inside the hub.
          </p>
        </div>

        <button className="whats-new-btn" onClick={() => navigate(getSitePath("/grammar"))}>
          Back to grammar
        </button>
      </div>

      <section className="hub-mini-browser">
        <div className="hub-mini-browser-head">
          <div>
            <h2>Browse Tests</h2>
            <p>Filter by level or search by grammar point as the bank grows.</p>
          </div>
          <div className="hub-mini-count">
            {filteredActivities.length} test{filteredActivities.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="hub-mini-filters">
          <div className="hub-mini-filter-group">
            <span className="hub-mini-filter-label">Levels</span>
            <div className="level-row">
              {LEVELS.map((level) => (
                <label
                  key={level}
                  className={`level-pill ${selectedLevels.includes(level) ? "selected" : ""}`}
                  style={{ "--badge-color": LEVEL_COLORS[level] || "#8aa0ff" }}
                >
                  <input
                    type="checkbox"
                    checked={selectedLevels.includes(level)}
                    onChange={() => toggleLevel(level)}
                  />
                  <span>{level.toUpperCase()}</span>
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
                placeholder="Try present perfect, passive, future..."
              />
              {(query || selectedLevels.length) ? (
                <button type="button" className="hub-mini-clear" onClick={clearFilters}>
                  Clear
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="menu-grid">
        {filteredActivities.map((activity) => {
          const isCompleted = completedActivityIds.has(activity.id);
          return (
          <button
            key={activity.id}
            className={`menu-card ${isCompleted ? "is-completed" : ""}`}
            onClick={() => navigate(getSitePath(`/grammar/activity/${activity.id}`))}
          >
            <div className="hub-mini-card-top">
              <h3>{activity.title}</h3>
              {isCompleted ? (
                <span className="hub-mini-complete" aria-label="Completed">
                  ✓
                </span>
              ) : null}
            </div>
            <div className="hub-mini-card-levels">
                {(activity.levels || []).map((level) => (
                  <span
                    key={`${activity.id}-${level}`}
                    className="cefr-badge"
                    style={{ "--badge-color": LEVEL_COLORS[level] || "#8aa0ff" }}
                  >
                    {level.toUpperCase()}
                  </span>
                ))}
            </div>
            <p>{activity.shortDescription}</p>
          </button>
          );
        })}
      </div>

      {!filteredActivities.length ? (
        <div className="hub-mini-empty">
          <strong>No tests match those filters.</strong>
          <p>Try clearing the level pills or using a broader search term.</p>
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

        .hub-menu-wrapper .menu-logo:hover {
          filter:
            drop-shadow(0 0 12px rgba(255,255,255,0.8))
            drop-shadow(0 0 25px rgba(255,165,0,0.5));
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

        .hub-menu-wrapper .whats-new-copy {
          min-width: 0;
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

        .hub-menu-wrapper .whats-new-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(0,0,0,.18);
        }

        .hub-mini-browser {
          margin-bottom: 1rem;
          padding: 1rem 1.05rem;
          border-radius: 20px;
          background: linear-gradient(180deg, rgba(26,40,71,0.98), rgba(20,33,59,0.98));
          border: 2px solid #35508e;
          box-shadow: 0 10px 24px rgba(0,0,0,0.16);
        }

        .hub-mini-browser-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 0.95rem;
        }

        .hub-mini-browser-head h2 {
          margin: 0 0 0.25rem;
          color: #eef4ff;
          font-size: 1.2rem;
        }

        .hub-mini-browser-head p {
          margin: 0;
          color: rgba(238, 244, 255, 0.8);
          line-height: 1.45;
        }

        .hub-mini-count {
          flex-shrink: 0;
          padding: 0.45rem 0.7rem;
          border-radius: 999px;
          background: rgba(2, 6, 23, 0.38);
          border: 1px solid rgba(74, 107, 192, 0.5);
          color: #dbe7ff;
          font-weight: 700;
        }

        .hub-mini-filters {
          display: grid;
          gap: 0.85rem;
        }

        .hub-mini-filter-group {
          display: grid;
          gap: 0.45rem;
        }

        .hub-mini-filter-label {
          color: #ffd56e;
          font-weight: 700;
        }

        .level-row { display: flex; gap: 0.55rem; flex-wrap: wrap; }
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
          gap: 0.7rem;
          align-items: center;
        }

        .hub-mini-search {
          width: 100%;
          min-width: 0;
          padding: 0.8rem 0.95rem;
          border-radius: 14px;
          border: 1px solid #3b4f7e;
          background: #020617;
          color: #f8fafc;
          font-size: 1rem;
        }

        .hub-mini-clear {
          flex-shrink: 0;
          padding: 0.8rem 0.95rem;
          border-radius: 12px;
          border: 1px solid rgba(74, 107, 192, 0.55);
          background: rgba(2, 6, 23, 0.42);
          color: #eef4ff;
          font-weight: 700;
          cursor: pointer;
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

        .hub-menu-wrapper .menu-card.is-completed {
          background: linear-gradient(180deg, rgba(31, 52, 88, 0.98), rgba(22, 39, 70, 0.98));
          border-color: rgba(91, 193, 145, 0.42);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16), inset 0 1px 0 rgba(126, 240, 194, 0.06);
        }

        .hub-mini-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 0.55rem;
        }

        .hub-mini-complete {
          flex-shrink: 0;
          width: 1.8rem;
          height: 1.8rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          border: 1px solid rgba(126, 240, 194, 0.3);
          background: rgba(126, 240, 194, 0.12);
          color: #bbf7d0;
          font-size: 0.95rem;
          font-weight: 900;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .hub-mini-card-levels {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-bottom: 0.7rem;
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

        .hub-menu-wrapper .menu-card h3 {
          margin: 0;
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

        .hub-mini-empty {
          margin-top: 1rem;
          padding: 1rem 1.05rem;
          border-radius: 18px;
          background: rgba(17, 24, 39, 0.5);
          border: 1px solid rgba(74, 107, 192, 0.35);
          color: #dbe7ff;
        }

        .hub-mini-empty strong {
          display: block;
          margin-bottom: 0.25rem;
          color: #eef4ff;
        }

        .hub-mini-empty p {
          margin: 0;
        }

        @media (max-width: 720px) {
          .hub-menu-wrapper .whats-new-banner {
            flex-direction: column;
            align-items: flex-start;
          }

          .hub-menu-wrapper .whats-new-btn {
            width: 100%;
          }

          .hub-mini-browser-head {
            flex-direction: column;
          }

          .hub-mini-search-row {
            flex-direction: column;
            align-items: stretch;
          }

          .hub-menu-wrapper .menu-grid {
            grid-template-columns: 1fr;
          }

          .hub-mini-card-levels {
            margin-bottom: 0.65rem;
          }
        }
      `}</style>
    </div>
  );
}
