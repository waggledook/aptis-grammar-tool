import React from "react";
import { useNavigate } from "react-router-dom";
import UnderConstructionPanel from "../../common/UnderConstructionPanel";
import Seo from "../../common/Seo.jsx";

export default function CollocationMenu() {
  const navigate = useNavigate();

  return (
    <div className="vocab-topics game-wrapper">
      <Seo
        title="Collocation Trainer | Seif Aptis Trainer"
        description="Practise common collocations for Aptis. Collocation Dash is available now; more modes coming soon."
      />

      <header className="header">
        <h2 className="title">Collocation Trainer</h2>
        <p className="intro">
          Practise natural word combinations (make/do/take/have/give) and fixed
          expressions.
        </p>
      </header>

      <UnderConstructionPanel
        title="Collocation module in progress"
        message="Collocation Dash is ready to play. More modes (sets by topic, review, and exams) are coming soon."
      />

      <div className="cards">
        {/* Live card */}
        <button
          className="card"
          onClick={() => navigate("/vocabulary/collocations/dash")}
        >
          <div className="card-head">
            <h3>
              <span style={{ fontSize: "1.3rem" }}>⚡</span> Collocation Dash
            </h3>
            <span className="live-pill">Live</span>
          </div>
          <p>Fast matching game: choose the correct verb for each phrase.</p>
        </button>

        {/* Coming soon card */}
        <button className="card soon-card" onClick={() => {}}>
          <div className="card-head">
            <h3>
              <span style={{ fontSize: "1.3rem" }}>🧩</span> Collocation Sets
            </h3>
            <span className="soon-pill">Coming soon</span>
          </div>
          <p>Practise by topic (Travel, Work…) with spaced review.</p>
        </button>
      </div>

      <button
        className="topbar-btn"
        onClick={() => navigate("/vocabulary")}
        style={{ marginTop: "1rem" }}
      >
        ← Back to Vocabulary Menu
      </button>

      <style>{`
        .header { margin-bottom: 1rem; }
        .title { font-size: 1.6rem; margin-bottom: .3rem; }
        .intro { color: #a9b7d1; max-width: 640px; }

        .cards {
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr;
          margin-top: 1rem;
        }
        @media (min-width: 720px) {
          .cards {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .card {
          background: #13213b;
          border: 1px solid #2c4b83;
          border-radius: 12px;
          color: #e6f0ff;
          padding: 1rem;
          text-align: left;
          cursor: pointer;
          transition: transform .08s ease, box-shadow .08s ease, border-color .08s;
        }
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, .25);
          border-color: #4a79d8;
        }

        .soon-card {
          opacity: 0.65;
          cursor: pointer;
          background: #1a2747;
          border: 1px dashed #3a5ba0;
        }
        .soon-card:hover {
          transform: none;
          box-shadow: none;
          border-color: #3a5ba0;
        }

        .card-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: .35rem;
        }

        .soon-pill {
          background: #24365d;
          border: 1px solid #37598e;
          color: #9eb7e5;
          font-size: .75rem;
          line-height: 1.2;
          padding: .2rem .5rem;
          border-radius: 999px;
          font-weight: 600;
          white-space: nowrap;
        }

        /* live pill: same shape as soon-pill, but green */
        .live-pill {
          background: rgba(46, 125, 79, 0.18);
          border: 1px solid rgba(46, 125, 79, 0.55);
          color: #8ee6b5;
          font-size: .75rem;
          line-height: 1.2;
          padding: .2rem .5rem;
          border-radius: 999px;
          font-weight: 600;
          white-space: nowrap;
        }

        .card h3 {
          margin: 0;
          font-size: 1.05rem;
          color: #e6f0ff;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: .4rem;
        }

        .card p {
          margin: 0;
          color: #cfd9f3;
          font-size: .9rem;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}