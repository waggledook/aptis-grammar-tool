import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AptisDemoBadge from "../access/AptisDemoBadge.jsx";
import Seo from "../common/Seo.jsx";
import { APTIS_LISTENING_PARTS } from "./listeningMenuData.js";
import "./listeningMenu.css";

export default function ListeningMenu({ user, aptisAccess, onSignIn }) {
  const navigate = useNavigate();
  const isDemoMode = !!aptisAccess?.isDemoMode;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <main className="listening-menu game-wrapper hub-menu-wrapper menu-style-hub">
      <Seo
        title="Aptis Listening Practice | Seif Aptis Trainer"
        description="Choose an Aptis Listening part, learn its strategy and practise complete exam-style listening tasks with feedback."
      />

      <header className="listening-menu-header">
        <h1>Aptis Listening Parts</h1>
        <p>Open a part to choose between strategy training and exam-style practice.</p>
      </header>

      <AptisDemoBadge user={user} aptisAccess={aptisAccess} onSignIn={onSignIn} />

      <section className="listening-menu-section">
        <div className="listening-parts-grid" aria-label="Aptis Listening parts">
          {APTIS_LISTENING_PARTS.map((part) => {
            const Icon = part.icon;
            const practiceLocked = isDemoMode && part.practice.demoAccess === "locked";

            return (
              <button
                className="menu-card listening-part-card"
                key={part.number}
                type="button"
                onClick={() => navigate(`/listening/parts/${part.number}`)}
              >
                <div className="listening-part-card-label">
                  <Icon size={28} aria-hidden="true" />
                  <span>{part.label}</span>
                </div>
                <h3>{part.title}</h3>
                <p>{part.copy}</p>
                <strong className="listening-menu-summary">{part.menuSummary}</strong>
                {isDemoMode ? (
                  <small className={`listening-menu-access ${practiceLocked ? "locked" : "demo"}`}>
                    {practiceLocked ? "Practice requires full access" : "Demo practice available"}
                  </small>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <button className="topbar-btn listening-menu-back" type="button" onClick={() => navigate("/")}>
        ← Back to main menu
      </button>
    </main>
  );
}
