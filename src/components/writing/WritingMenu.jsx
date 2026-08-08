import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AptisDemoBadge from "../access/AptisDemoBadge.jsx";
import Seo from "../common/Seo.jsx";
import { APTIS_WRITING_PARTS } from "./writingMenuData.js";
import "./writingMenu.css";

export default function WritingMenu({ user, aptisAccess, onSignIn }) {
  const navigate = useNavigate();
  const isDemoMode = !!aptisAccess?.isDemoMode;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <main className="writing-menu game-wrapper hub-menu-wrapper menu-style-hub">
      <Seo
        title="Aptis Writing Practice | Seif Aptis Trainer"
        description="Choose an Aptis Writing part, build the required skills and complete exam-style writing tasks with feedback."
      />

      <header className="writing-menu-header">
        <h1>Aptis Writing Parts</h1>
        <p>Open a part to choose between strategy training, guided activities and exam-style practice.</p>
      </header>

      <AptisDemoBadge user={user} aptisAccess={aptisAccess} onSignIn={onSignIn} />

      <section className="writing-menu-section">
        <div className="writing-parts-grid" aria-label="Aptis Writing parts">
          {APTIS_WRITING_PARTS.map((part) => {
            const Icon = part.icon;
            return (
              <button
                className="menu-card writing-part-card"
                key={part.number}
                type="button"
                onClick={() => navigate(`/writing/parts/${part.number}`)}
              >
                <div className="writing-part-card-label">
                  <Icon size={28} aria-hidden="true" />
                  <span>{part.label}</span>
                </div>
                <h3>{part.title}</h3>
                <p>{part.copy}</p>
                <strong className="writing-menu-summary">{part.menuSummary}</strong>
                {isDemoMode ? <small className="writing-menu-access demo">Demo practice available</small> : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="writing-full-test-card">
        <div>
          <div className="writing-full-test-kicker">Full test</div>
          <h2>Complete writing test</h2>
          <p>Do the whole writing paper in exam conditions when you are ready for a complete challenge.</p>
        </div>
        <a
          href="https://aptis-gen.writing1.beeskillsenglish.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="writing-full-test-link"
        >
          Open full writing test
        </a>
      </section>

      <button className="topbar-btn writing-menu-back" type="button" onClick={() => navigate("/")}>
        ← Back to main menu
      </button>
    </main>
  );
}
