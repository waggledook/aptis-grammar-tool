import React from "react";
import { useNavigate } from "react-router-dom";
import UnderConstructionPanel from "../../common/UnderConstructionPanel";
import Seo from "../../common/Seo.jsx";

export default function CollocationMenu() {
  const navigate = useNavigate();

  return (
    <div className="game-wrapper">
      <Seo
        title="Collocation Trainer | Seif Aptis Trainer"
        description="Practise common collocations for Aptis. Collocation Dash is available now; more modes coming soon."
      />

      <button
        onClick={() => navigate("/vocabulary")}
        className="review-btn"
        style={{ marginBottom: "1rem" }}
      >
        ← Back
      </button>

      <header className="header">
        <h2 className="title">Collocation Trainer</h2>
        <p className="intro">
          Practise natural word combinations (make/do/take/have/give) and fixed expressions.
        </p>
      </header>

      <UnderConstructionPanel
        title="Collocation module in progress"
        message="Collocation Dash is ready to play. More modes (sets by topic, review, and exams) are coming soon."
      />

      <div className="cards" style={{ marginTop: "1rem" }}>
        <button
          className="card menu-card"
          onClick={() => navigate("/vocabulary/collocations/dash")}
        >
          <div className="menu-card-header">
            <h3>Collocation Dash</h3>
          </div>
          <p>Fast matching game: choose the correct verb for each phrase.</p>
        </button>

        <button className="card soon-card" disabled>
          <div className="soon-head">
            <h3>Collocation Sets</h3>
            <span className="soon-pill">Coming soon</span>
          </div>
          <p>Practise by topic (Travel, Work…) with spaced review.</p>
        </button>
      </div>
    </div>
  );
}
