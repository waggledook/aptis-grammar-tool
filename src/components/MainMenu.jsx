import React from "react";
import { toast } from "../utils/toast"; // only needed if you pick Option B
import UnderConstructionBadge from "./common/UnderConstructionBadge";
import { useNavigate } from "react-router-dom";


export default function MainMenu({ onSelect }) {
  const navigate = useNavigate();
  return (
    <div className="menu-wrapper">
      <header
        className="main-header"
        style={{ textAlign: "center", marginBottom: "0rem" }}
      >
        <img
          src="/images/seif-aptis-trainer-logo.png"
          alt="Seif Aptis Trainer Logo"
          className="menu-logo"
          draggable="false"
        />
      </header>

      <p className="menu-sub">Choose a practice area to begin.</p>

      <div className="menu-grid">
        {/* Grammar */}
        <button className="menu-card" onClick={() => onSelect("grammar")}>
          <h3>Grammar Practice</h3>
          <p>Gap-fills by level & tag (A2–C1). Track mistakes & favourites.</p>
        </button>

        {/* Reading */}
        <button className="menu-card" onClick={() => navigate("/reading")}>
        <h3>Reading Practice</h3>
        <p>Practice tasks for all reading sections.</p>
      </button>

        {/* Speaking */}
<button className="menu-card" onClick={() => navigate("/speaking")}>
  <h3>Speaking Practice</h3>
  <p>Practice tasks for all parts of the speaking exam.</p>
</button>

        {/* Writing */}
        <button className="menu-card" onClick={() => onSelect("writingMenu")}>
          <h3>Writing Practice</h3>
          <p>
            Practise all parts of the Aptis Writing test, from short answers to
            full emails.
          </p>
        </button>

        <button className="menu-card" onClick={() => navigate("/vocabulary")}>
  <div className="menu-card-header">
    <h3>Vocabulary Practice</h3>
    <span className="uc-top-wrapper">
      <img
        src="/images/ui/under-construction.png"
        alt="Under construction"
        className="uc-top-icon"
      />
    </span>
  </div>
  <p>Topics, synonyms, and collocations.</p>
</button>


<button
  className="menu-card soon-card tease"
  onClick={() => toast("Listening practice coming soon 👀")}
>
  <div className="soon-head">
    <h3>Listening Practice</h3>
    <span className="soon-pill">Coming soon</span>
  </div>
  <p>Exam-style listening tasks with transcripts and tips.</p>
</button>

        {/* Profile */}
        <button className="menu-card" onClick={() => onSelect("profile")}>
          <h3>My Profile</h3>
          <p>See your progress and review saved work.</p>
        </button>
      </div>

      <style>{`
        /* ——— Layout wrapper ——— */
        .menu-wrapper {
          padding-top: 0;
          margin-top: 0;
        }

        .main-header {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0;
          padding: 0;
          line-height: 0;
          text-align: center;
        }

        .menu-logo {
          display: block;
          width: clamp(200px, 24vw, 340px);
          height: auto;
          filter:
            drop-shadow(0 0 10px rgba(255,255,255,0.5))
            drop-shadow(0 0 18px rgba(255,165,0,0.35));
          animation: logoFade 1.2s ease both;
          transition: filter .3s ease;
          margin: 0;
        }
        .menu-logo:hover {
          filter:
            drop-shadow(0 0 12px rgba(255,255,255,0.8))
            drop-shadow(0 0 25px rgba(255,165,0,0.5));
        }
        @keyframes logoFade {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }

        .menu-sub {
          opacity: .85;
          margin-top: .2rem;
          margin-bottom: .6rem;
        }

        /* ——— Grid ——— */
        .menu-grid {
          margin-top: 0;
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr;
        }
        @media (min-width: 920px) {
          .menu-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* ——— Cards ——— */
        .menu-card {
          background: #13213b;
          border: 1px solid #2c4b83;
          color: #e6f0ff;
          border-radius: 14px;
          padding: 1rem;
          text-align: left;
          cursor: pointer;
          transition:
            transform .08s ease,
            box-shadow .08s ease,
            border-color .08s;
        }
        .menu-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0,0,0,.25);
          border-color: #4a79d8;
        }
        .menu-card h3 {
          margin: .1rem 0 .35rem;
        }
        .menu-card p {
          margin: 0;
          opacity: .9;
        }

        /* ——— "Coming soon" variants ——— */
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

        .soon-head {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: .5rem .75rem;
          margin-bottom: .35rem;
        }

        .soon-head h3 {
          margin: 0;
          font-size: 1.05rem;
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

      `}</style>
    </div>
  );
}
