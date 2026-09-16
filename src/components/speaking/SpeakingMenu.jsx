import React, { useEffect } from "react";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AptisDemoBadge from "../access/AptisDemoBadge.jsx";
import Seo from "../common/Seo.jsx";
import { APTIS_SPEAKING_PARTS } from "./speakingMenuData.js";
import "../listening/listeningMenu.css";
import "./speakingMenu.css";

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
        <p>Choose a complete mock test, or open a part for guided training and exam-style practice.</p>
      </header>

      <AptisDemoBadge user={user} aptisAccess={aptisAccess} onSignIn={onSignIn} />

      <section className="speaking-mock-entry listening-menu-section">
        <button className="menu-card speaking-mock-card" type="button" onClick={() => navigate("/speaking/mock-tests")}>
          <div>
            <span><ClipboardCheck size={25} aria-hidden="true" /> Full exam practice</span>
            <h2>Speaking mock tests</h2>
            <p>Take a complete four-part speaking test with timed questions, downloadable recordings and optional AI feedback.</p>
            <small>3 complete mocks · Mock 1 open to everyone · Mocks 2–3 with active access</small>
          </div>
          <strong>Open mock tests <ArrowRight size={18} aria-hidden="true" /></strong>
        </button>
      </section>

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

      <button className="topbar-btn speaking-menu-back listening-menu-back" type="button" onClick={() => navigate("/")}>
        ← Back to main menu
      </button>
    </main>
  );
}
