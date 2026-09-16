import React from "react";
import { LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../common/Seo.jsx";
import { APTIS_SPEAKING_MOCKS } from "./aptisSpeakingMockData.js";
import "./AptisSpeakingMock.css";

const TOPICS = {
  "speaking-general-1": "Everyday life, libraries, travel and celebrations",
  "speaking-general-2": "Daily life, repairs, art and advice",
  "speaking-general-3": "Daily life, breaks, clothes and patience",
};

export default function AptisSpeakingMockMenu({ user, aptisAccess, onSignIn }) {
  const navigate = useNavigate();

  function openMock(mock) {
    if (mock.number !== 1 && aptisAccess?.isDemoMode) {
      if (!user) onSignIn?.();
      else navigate("/aptis-access");
      return;
    }
    navigate(`/speaking/mock-tests/${mock.id}`);
  }

  return (
    <main className="aptis-speaking-mock">
      <Seo
        title="Aptis General Speaking Mock Tests | Seif Aptis Trainer"
        description="Choose from three complete Aptis General speaking mock tests with timed questions, recordings, downloads and optional AI feedback."
      />
      <section className="asm-mock-menu">
        <button className="asm-link-btn" type="button" onClick={() => navigate("/speaking")}>← Back to Speaking</button>
        <p className="asm-mock-menu-kicker">Aptis General · Speaking</p>
        <h1>Complete speaking mock tests</h1>
        <p className="asm-mock-menu-intro">Choose a complete four-part test. Mock 1 is open to everyone; Mocks 2 and 3 require active Aptis Trainer access. Each test records your responses and offers optional AI feedback.</p>
        <div className="asm-mock-menu-grid">
          {APTIS_SPEAKING_MOCKS.map((mock) => {
            const locked = mock.number !== 1 && aptisAccess?.isDemoMode;
            const accessLabel = mock.number === 1
              ? "Open to everyone"
              : locked ? "Active access required" : "Included in your access";
            const buttonLabel = locked
              ? user ? "View access options" : "Sign in to unlock"
              : `Open mock ${mock.number}`;
            return (
              <article className="asm-mock-menu-card" key={mock.id}>
                <span className="asm-mock-menu-number">Mock {mock.number}</span>
                <h2>Speaking Practice Test Version {String(mock.number).padStart(3, "0")}</h2>
                <p>{TOPICS[mock.id]}</p>
                <span className={`asm-mock-menu-access${locked ? " is-locked" : ""}`}>
                  {locked ? <LockKeyhole size={15} aria-hidden="true" /> : null}
                  {accessLabel}
                </span>
                <div className="asm-mock-menu-meta">4 parts <span aria-hidden="true">·</span> About 12 minutes</div>
                <button className="asm-btn asm-btn-exam" type="button" onClick={() => openMock(mock)}>
                  {buttonLabel}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
