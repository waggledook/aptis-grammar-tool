import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

export default function OteDashboard({ user, nativeRoutes = false }) {
  const navigate = useNavigate();
  const speakingPath = getSitePath(nativeRoutes ? "/speaking" : "/ote/speaking");
  const writingPath = getSitePath(nativeRoutes ? "/writing" : "/ote/writing");
  const profilePath = getSitePath("/profile");
  const isAdvanced = user?.oteVersion === "advanced";

  return (
    <main className="menu-wrapper hub-menu-wrapper ote-menu-wrapper">
      <Seo
        title="OTE Training | Seif English"
        description="Oxford Test of English mock-test training for speaking and writing."
      />

      <header className="main-header ote-main-header">
        <img
          src="/images/seif-ote-trainer-logo.png"
          alt="Seif OTE Trainer by Seif English Academy"
          className="menu-logo ote-menu-logo"
          draggable="false"
        />
      </header>

      <p className="menu-sub">Oxford Test of English training for Seif English students.</p>

      <div className="whats-new-banner hub-status-banner">
        <div className="whats-new-copy">
          <span className="whats-new-label">{isAdvanced ? "Advanced practice" : "Mock-test environment"}</span>
          <h3>{isAdvanced ? "Prepare for OTE Advanced" : "Speaking and writing mocks are ready"}</h3>
          <p>
            {isAdvanced
              ? "Practise the higher-level speaking and writing tasks with timed mock-test activities."
              : "Start with OTE-style mock environments for speaking recordings and timed writing practice."}
          </p>
        </div>
        {!isAdvanced ? (
          <button className="whats-new-btn" type="button" onClick={() => navigate(speakingPath)}>
            Open speaking
          </button>
        ) : null}
      </div>

      {isAdvanced ? (
        <div className="menu-grid" aria-label="Advanced OTE sections">
          <button className="menu-card" type="button" onClick={() => navigate(speakingPath)}>
            <h3>Advanced Speaking</h3>
            <p>Practise the five-part speaking module: questions, voicemail, summary, debate, and follow-up questions.</p>
          </button>

          <button className="menu-card" type="button" onClick={() => navigate(writingPath)}>
            <h3>Advanced Writing</h3>
            <p>Practise the advanced essay and integrated summary tasks in a timed writing environment.</p>
          </button>

          <button className="menu-card" type="button" disabled>
            <h3>Advanced Language Lab</h3>
            <p>Coming soon: complex grammar, lexical range, discourse markers, and precision practice.</p>
          </button>

          <button className="menu-card" type="button" onClick={() => navigate(profilePath)}>
            <h3>My Profile</h3>
            <p>Review saved OTE speaking feedback, writing submissions, and progress.</p>
          </button>
        </div>
      ) : (
        <div className="menu-grid" aria-label="OTE sections">
          <button className="menu-card" type="button" onClick={() => navigate(speakingPath)}>
            <h3>Speaking</h3>
            <p>Mock tests and speaking training for the four-part OTE speaking module.</p>
          </button>

          <button className="menu-card" type="button" onClick={() => navigate(writingPath)}>
            <h3>Writing</h3>
            <p>Timed writing mocks and task practice for email, essay, and article responses.</p>
          </button>

          <button className="menu-card" type="button" onClick={() => navigate(profilePath)}>
            <h3>My Profile</h3>
            <p>Review saved OTE speaking feedback, writing submissions, and progress.</p>
          </button>

          <button className="menu-card" type="button" disabled>
            <h3>Training Library</h3>
            <p>Future lessons, phrase banks, and focused drills for OTE skills.</p>
          </button>
        </div>
      )}
    </main>
  );
}
