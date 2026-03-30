import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { fetchMyTopHubGameScores, fetchTopHubGameScores } from "../../firebase.js";
import {
  HUB_DEPENDENT_PREPOSITION_BANKS,
  HUB_DEPENDENT_PREPOSITION_LEVEL_ORDER,
} from "../../data/hubDependentPrepositionItems.js";

const SPANGLISH_GAME_ID = "hub_spanglish_fixit";

function boardGameIdForDependent(levelId) {
  return `hub_dependent_prepositions_${levelId}`;
}

function BoardSection({ title, subtitle, personalScores, globalScores, user }) {
  return (
    <section className="hub-game-board">
      <div className="hub-game-board-head">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>

      <div className="hub-game-board-grid">
        <div className="hub-game-board-card">
          <h4>Your top 3</h4>
          {user?.uid ? (
            personalScores.length ? (
              <div className="hub-game-board-list">
                {personalScores.map((entry, index) => (
                  <div key={entry.id} className="hub-game-board-row">
                    <span>#{index + 1}</span>
                    <strong>{entry.score}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="hub-game-board-empty">No saved scores yet.</p>
            )
          ) : (
            <p className="hub-game-board-empty">Sign in to save and track your best scores.</p>
          )}
        </div>

        <div className="hub-game-board-card">
          <h4>Global leaderboard</h4>
          {globalScores.length ? (
            <div className="hub-game-board-list">
              {globalScores.map((entry, index) => (
                <div key={entry.id} className="hub-game-board-row is-global">
                  <span>#{index + 1}</span>
                  <em>{entry.displayName}</em>
                  <strong>{entry.score}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="hub-game-board-empty">No leaderboard scores yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default function HubGameLeaderboards({ user }) {
  const navigate = useNavigate();
  const [activePrepsLevel, setActivePrepsLevel] = useState("a2");
  const [spanglishPersonal, setSpanglishPersonal] = useState([]);
  const [spanglishGlobal, setSpanglishGlobal] = useState([]);
  const [dependentPersonal, setDependentPersonal] = useState([]);
  const [dependentGlobal, setDependentGlobal] = useState([]);

  const activeDependentLevel = useMemo(
    () => HUB_DEPENDENT_PREPOSITION_BANKS[activePrepsLevel],
    [activePrepsLevel],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadSpanglish() {
      try {
        const [global, personal] = await Promise.all([
          fetchTopHubGameScores(SPANGLISH_GAME_ID, 10),
          user?.uid ? fetchMyTopHubGameScores(SPANGLISH_GAME_ID, 3, user.uid) : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setSpanglishGlobal(global);
        setSpanglishPersonal(personal);
      } catch (error) {
        console.error("[HubGameLeaderboards] Spanglish leaderboard load failed", error);
      }
    }

    loadSpanglish();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  useEffect(() => {
    let cancelled = false;

    async function loadDependentLevel() {
      const gameId = boardGameIdForDependent(activePrepsLevel);
      try {
        const [global, personal] = await Promise.all([
          fetchTopHubGameScores(gameId, 10),
          user?.uid ? fetchMyTopHubGameScores(gameId, 3, user.uid) : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setDependentGlobal(global);
        setDependentPersonal(personal);
      } catch (error) {
        console.error("[HubGameLeaderboards] Dependent preposition leaderboard load failed", error);
      }
    }

    loadDependentLevel();
    return () => {
      cancelled = true;
    };
  }, [activePrepsLevel, user?.uid]);

  return (
    <div className="menu-wrapper hub-game-leaderboards-wrapper">
      <Seo
        title="Leaderboards | Seif Hub"
        description="See your best game scores and compare them with players across Seif Hub."
      />

      <div className="hub-game-leaderboards-topbar">
        <span className="hub-game-leaderboards-kicker">Games</span>
        <button className="hub-game-leaderboards-back" onClick={() => navigate(getSitePath("/games"))}>
          Back to games
        </button>
      </div>

      <header className="hub-game-leaderboards-hero">
        <h1>Leaderboards</h1>
        <p>
          Track your best scores, compare them with other players, and see how each game is shaping up across the hub.
        </p>
      </header>

      <BoardSection
        title="Spanglish Fix-It"
        subtitle="One shared board for the game."
        personalScores={spanglishPersonal}
        globalScores={spanglishGlobal}
        user={user}
      />

      <section className="hub-game-board">
        <div className="hub-game-board-head">
          <div>
            <h3>Dependent Preposition Challenge</h3>
            <p>Separate boards for each CEFR band.</p>
          </div>
        </div>

        <div className="hub-game-levels" role="tablist" aria-label="Dependent preposition leaderboard level">
          {HUB_DEPENDENT_PREPOSITION_LEVEL_ORDER.map((levelId) => {
            const level = HUB_DEPENDENT_PREPOSITION_BANKS[levelId];
            const isActive = activePrepsLevel === levelId;
            return (
              <button
                key={levelId}
                type="button"
                className={`hub-game-level-pill ${isActive ? "active" : ""}`}
                onClick={() => setActivePrepsLevel(levelId)}
              >
                <span>{level.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hub-game-board-grid">
          <div className="hub-game-board-card">
            <h4>Your top 3</h4>
            <p className="hub-game-board-sub">{activeDependentLevel.label}</p>
            {user?.uid ? (
              dependentPersonal.length ? (
                <div className="hub-game-board-list">
                  {dependentPersonal.map((entry, index) => (
                    <div key={entry.id} className="hub-game-board-row">
                      <span>#{index + 1}</span>
                      <strong>{entry.score}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="hub-game-board-empty">No saved scores yet.</p>
              )
            ) : (
              <p className="hub-game-board-empty">Sign in to save and track your best scores.</p>
            )}
          </div>

          <div className="hub-game-board-card">
            <h4>Global leaderboard</h4>
            <p className="hub-game-board-sub">{activeDependentLevel.label}</p>
            {dependentGlobal.length ? (
              <div className="hub-game-board-list">
                {dependentGlobal.map((entry, index) => (
                  <div key={entry.id} className="hub-game-board-row is-global">
                    <span>#{index + 1}</span>
                    <em>{entry.displayName}</em>
                    <strong>{entry.score}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="hub-game-board-empty">No leaderboard scores yet.</p>
            )}
          </div>
        </div>
      </section>

      <style>{`
        .hub-game-leaderboards-wrapper {
          padding-top: 0;
        }

        .hub-game-leaderboards-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.1rem;
        }

        .hub-game-leaderboards-kicker {
          font-size: 0.9rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 800;
          color: #90b5ff;
        }

        .hub-game-leaderboards-back {
          border: 2px solid rgba(125, 158, 228, 0.34);
          background: rgba(31, 48, 84, 0.92);
          color: #eef4ff;
          border-radius: 14px;
          padding: 0.78rem 1.05rem;
          font-weight: 800;
          cursor: pointer;
        }

        .hub-game-leaderboards-hero {
          max-width: 760px;
          margin-bottom: 1.25rem;
        }

        .hub-game-leaderboards-hero h1 {
          margin: 0 0 0.55rem;
          font-size: clamp(2rem, 4vw, 3.25rem);
          line-height: 1.02;
          color: #eef4ff;
        }

        .hub-game-leaderboards-hero p {
          margin: 0;
          color: rgba(230, 240, 255, 0.88);
          font-size: 1.07rem;
          line-height: 1.55;
        }

        .hub-game-board {
          background: rgba(20, 33, 59, 0.86);
          border: 1px solid rgba(77, 110, 184, 0.38);
          border-radius: 22px;
          padding: 1.1rem 1.2rem;
          box-shadow: 0 12px 26px rgba(0, 0, 0, 0.16);
          margin-bottom: 1rem;
        }

        .hub-game-board-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .hub-game-board-head h3 {
          margin: 0 0 0.2rem;
          color: #eef4ff;
          font-size: 1.3rem;
        }

        .hub-game-board-head p {
          margin: 0;
          color: rgba(230, 240, 255, 0.72);
        }

        .hub-game-board-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }

        .hub-game-board-card {
          border-radius: 18px;
          padding: 1rem;
          background: rgba(16, 24, 46, 0.42);
          border: 1px solid rgba(108, 136, 199, 0.22);
        }

        .hub-game-board-card h4 {
          margin: 0 0 .35rem;
          color: #eef4ff;
        }

        .hub-game-board-sub {
          margin: 0 0 .75rem;
          color: rgba(230, 240, 255, 0.62);
          font-size: 0.92rem;
          font-weight: 700;
        }

        .hub-game-board-list {
          display: grid;
          gap: .55rem;
        }

        .hub-game-board-row {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: .75rem;
          align-items: center;
          color: rgba(230, 240, 255, 0.9);
        }

        .hub-game-board-row em {
          font-style: normal;
          opacity: .88;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .hub-game-board-empty {
          margin: 0;
          color: rgba(230, 240, 255, 0.72);
        }

        .hub-game-levels {
          display: flex;
          flex-wrap: wrap;
          gap: 0.7rem;
          margin-bottom: 1rem;
        }

        .hub-game-level-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          border-radius: 999px;
          border: 2px solid rgba(104, 132, 196, 0.4);
          background: rgba(31, 48, 84, 0.9);
          color: #dfeaff;
          padding: 0.72rem 0.95rem;
          font-weight: 800;
          cursor: pointer;
        }

        .hub-game-level-pill.active {
          background: linear-gradient(180deg, #f6bd60, #e9a93f);
          border-color: rgba(245, 193, 90, 0.95);
          color: #16233f;
        }

        @media (max-width: 720px) {
          .hub-game-leaderboards-topbar {
            flex-direction: column;
            align-items: flex-start;
          }

          .hub-game-leaderboards-back {
            width: 100%;
          }

          .hub-game-board-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

