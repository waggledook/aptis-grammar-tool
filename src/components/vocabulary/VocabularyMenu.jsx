// src/components/vocabulary/VocabularyMenu.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "../../utils/toast";
import UnderConstructionPanel from "../common/UnderConstructionPanel";
import UnderConstructionBadge from "../common/UnderConstructionBadge";
import Seo from "../common/Seo.jsx";


export default function VocabularyMenu() {
  const navigate = useNavigate();

  return (
    <div className="vocab-menu game-wrapper">
      <Seo
        title="Aptis Vocabulary Practice | Seif Aptis Trainer"
        description="Build vocabulary for Aptis through topic-based practice and upcoming synonym and collocation trainers."
      />
      <header className="header">
        <h2 className="title">Vocabulary Practice</h2>
        <p className="intro">
          Build your vocabulary through topics, synonym training, and collocation practice.
        </p>
      </header>

      {/* 🛠 Big under-construction notice for the whole vocab area */}
      <UnderConstructionPanel
        title="Vocabulary module in progress"
        message="Right now you can practise topic-based vocabulary. Synonym and collocation trainers are on the way!"
      />

      <div className="cards">
        {/* 🧩 Topic Practice (active, but marked as in progress) */}
        <button
          className="card menu-card"
          onClick={() => navigate("/vocabulary/topics")}
        >
          <div className="menu-card-header">
            <h3>Topic Practice</h3>
            <span className="uc-top-wrapper">
              <img
                src="/images/ui/under-construction.png"
                alt="Under construction"
                className="uc-top-icon"
              />
            </span>
          </div>
          <p>Study words by theme (e.g. Travel, Education...).</p>
        </button>

        {/* 🔁 Synonym Trainer (coming soon) */}
        <button
          className="card soon-card tease"
          onClick={() => toast("Synonym Trainer coming soon 👀")}
        >
          <div className="soon-head">
            <h3>Synonym Trainer</h3>
            <span className="soon-pill">Coming soon</span>
          </div>
          <p>
            Learn subtle differences between similar words and expand your lexical range.
          </p>
        </button>

        {/* ⚙️ Collocation Trainer (coming soon) */}
        <button
          className="card soon-card tease"
          onClick={() => toast("Collocation Trainer coming soon 👀")}
        >
          <div className="soon-head">
            <h3>Collocation Trainer</h3>
            <span className="soon-pill">Coming soon</span>
          </div>
          <p>Practise natural word combinations and fixed expressions.</p>
        </button>
      </div>

      <button
        className="topbar-btn"
        onClick={() => navigate("/")}
        style={{ marginTop: "1rem" }}
      >
        ← Back to main menu
      </button>

      <style>{`
        .header { margin-bottom: 1rem; }
        .title { font-size: 1.6rem; margin-bottom: .3rem; }
        .intro { color: #a9b7d1; max-width: 640px; }

        .cards {
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr;
        }
        @media (min-width: 720px) {
          .cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: .75rem;
          margin-bottom: .35rem;
        }

        /* ——— Active card ——— */
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
          box-shadow: 0 6px 18px rgba(0,0,0,.25);
          border-color: #4a79d8;
        }

        .card h3 {
          margin: 0;
          font-size: 1.05rem;
          color: #e6f0ff;
          font-weight: 600;
        }

        .card p {
          margin: 0;
          color: #cfd9f3;
          font-size: .9rem;
          line-height: 1.4;
        }

        /* ——— Coming soon cards ——— */
        .soon-card {
          position: relative;
          cursor: not-allowed;
          opacity: 0.6;
          background: #1a2747;
          border: 1px dashed #3a5ba0;
        }
        .soon-card:hover {
          transform: none;
          box-shadow: none;
          border-color: #3a5ba0;
        }

        .soon-card.tease {
          cursor: pointer;
          opacity: 0.85;
          transition: transform 0.08s ease, box-shadow 0.08s ease, border-color 0.08s;
        }
        .soon-card.tease:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0,0,0,.25);
          border-color: #4a79d8;
          background: #223463;
        }

        .soon-head {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: .5rem .75rem;
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
      `}</style>
    </div>
  );
}
