import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AptisDemoBadge from "../access/AptisDemoBadge.jsx";
import Seo from "../common/Seo.jsx";
import { APTIS_SPEAKING_PARTS } from "./speakingMenuData.js";
import "../listening/listeningMenu.css";

export default function SpeakingMenu({ user, aptisAccess, onSignIn }) {
  const navigate = useNavigate();
  const isDemoMode = !!aptisAccess?.isDemoMode;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <main className="speaking-menu listening-menu game-wrapper hub-menu-wrapper menu-style-hub">
      <Seo
        title="Aptis Speaking Practice | Seif Aptis Trainer"
        description="Choose an Aptis Speaking part, build the skills you need and practise complete timed speaking tasks with feedback."
      />

      <header className="speaking-menu-header listening-menu-header">
        <h1>Aptis Speaking Parts</h1>
        <p>Open a part to choose between guided training and exam-style speaking practice.</p>
      </header>

      <AptisDemoBadge user={user} aptisAccess={aptisAccess} onSignIn={onSignIn} />

      <section className="speaking-menu-section listening-menu-section">
        <div className="speaking-parts-grid listening-parts-grid" aria-label="Aptis Speaking parts">
          {APTIS_SPEAKING_PARTS.map((part) => {
            const Icon = part.icon;
            const practiceLocked = isDemoMode && part.practice.demoAccess === "locked";

            return (
              <button
                className="menu-card speaking-part-card listening-part-card"
                key={part.number}
                type="button"
                onClick={() => navigate(`/speaking/parts/${part.number}`)}
              >
                <div className="speaking-part-card-label listening-part-card-label">
                  <Icon size={28} aria-hidden="true" />
                  <span>{part.label}</span>
                </div>
                <h3>{part.title}</h3>
                <p>{part.copy}</p>
                <strong className="speaking-menu-summary listening-menu-summary">{part.menuSummary}</strong>
                {isDemoMode ? (
                  <small className={`speaking-menu-access listening-menu-access ${practiceLocked ? "locked" : "demo"}`}>
                    {practiceLocked ? "Practice requires full access" : "Demo practice available"}
                  </small>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="full-test-card">
        <div>
          <div className="section-kicker">Full test</div>
          <h3>Complete speaking test</h3>
          <p>Do the whole speaking paper in exam conditions when you want a fuller challenge.</p>
        </div>
        <a
          href="https://aptis-gen.speaking1.beeskillsenglish.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="mock-test-btn menu-cta-btn"
        >
          Open complete test
        </a>
      </section>

      <button className="topbar-btn speaking-menu-back listening-menu-back" type="button" onClick={() => navigate("/")}>
        ← Back to main menu
      </button>
    </main>
  );
}
