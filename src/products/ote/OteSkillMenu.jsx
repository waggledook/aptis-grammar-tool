import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

export default function OteSkillMenu({ skill = "speaking", user, onRequireSignIn, nativeRoutes = false }) {
  const navigate = useNavigate();
  const isSpeaking = skill === "speaking";
  const isAdvanced = user?.oteVersion === "advanced";
  const homePath = getSitePath(nativeRoutes ? "/" : "/ote");
  const speakingMockId = isAdvanced ? "speaking-advanced-1" : "speaking-1";
  const speakingMockPath = getSitePath(nativeRoutes ? `/mock-tests/${speakingMockId}` : `/ote/mock-tests/${speakingMockId}`);
  const interviewTrainingPath = getSitePath(nativeRoutes ? "/speaking/part-1-interview" : "/ote/speaking/part-1-interview");
  const voicemailTrainingPath = getSitePath(nativeRoutes ? "/speaking/part-2-voicemails" : "/ote/speaking/part-2-voicemails");
  const talkTrainingPath = getSitePath(nativeRoutes ? "/speaking/parts-3-4" : "/ote/speaking/parts-3-4");
  const writingMockPath = getSitePath(nativeRoutes ? "/writing/mock-tests" : "/ote/writing/mock-tests");
  const emailTrainingPath = getSitePath(nativeRoutes ? "/writing/training/email" : "/ote/writing/training/email");
  const essayTrainingPath = getSitePath(nativeRoutes ? "/writing/training/essay" : "/ote/writing/training/essay");
  const articleReviewTrainingPath = getSitePath(
    nativeRoutes ? "/writing/training/article-review" : "/ote/writing/training/article-review"
  );

  function openSpeakingMock() {
    if (!user) {
      onRequireSignIn?.();
      return;
    }
    navigate(speakingMockPath);
  }

  function openWritingMock() {
    if (!user) {
      onRequireSignIn?.();
      return;
    }
    navigate(writingMockPath);
  }

  return (
    <main className="menu-wrapper hub-menu-wrapper ote-menu-wrapper ote-skill-menu-wrapper">
      <Seo
        title={`${isSpeaking ? "OTE Speaking" : "OTE Writing"} | Seif English`}
        description={`${isSpeaking ? "Speaking" : "Writing"} mock tests and training for Oxford Test of English students.`}
      />

      <header className="main-header ote-main-header">
        <div className="ote-hub-logo" aria-label="OTE Seif">
          <strong>{isSpeaking ? "OTE Speaking" : "OTE Writing"}</strong>
        </div>
      </header>

      <p className="menu-sub">
        {isSpeaking
          ? "Mock tests and training for the OTE Speaking module."
          : "Mock tests and training for the OTE Writing module."}
      </p>

      <div className="whats-new-banner hub-status-banner">
        <div className="whats-new-copy">
          <span className="whats-new-label">Available now</span>
          <h3>{isSpeaking ? (isAdvanced ? "Advanced Speaking Mock 1" : "Speaking Mock 1") : "Writing mocks"}</h3>
          <p>
            {isSpeaking
              ? isAdvanced
                ? "A five-part OTE Advanced speaking mock shell with interview, diplomatic voicemail, summary, debate, and follow-up sections."
                : "A full four-part OTE-style speaking mock with automatic timing and recordings."
              : "Choose from the available two-part OTE-style writing mocks with separate task timers, a choice screen, and live word counts."}
          </p>
        </div>
        <button className="whats-new-btn" type="button" onClick={isSpeaking ? openSpeakingMock : openWritingMock}>
          {isSpeaking ? "Start mock" : "Open mocks"}
        </button>
      </div>

      <div className="menu-grid">
        {isSpeaking ? (
          <>
            <button className="menu-card" type="button" onClick={openSpeakingMock}>
              <h3>{isAdvanced ? "Advanced Speaking Mock 1" : "Speaking Mock 1"}</h3>
              <p>
                {isAdvanced
                  ? "Run the five-part advanced speaking module with placeholder tasks and timed recordings."
                  : "Run the full speaking module in a locked exam-style environment."}
              </p>
            </button>
            <button className="menu-card" type="button" onClick={() => navigate(interviewTrainingPath)}>
              <h3>Part 1 Interview Training</h3>
              <p>Learn the interview format, timing, scoring rules, and check your understanding.</p>
            </button>
            <button className="menu-card" type="button" onClick={() => navigate(voicemailTrainingPath)}>
              <h3>{isAdvanced ? "Part 2 Diplomatic Voicemail" : "Part 2 Voicemail Training"}</h3>
              <p>
                {isAdvanced
                  ? "Placeholder area for diplomatic transaction and disagreement practice."
                  : "Learn the format, compare formal and friendly messages, then check your understanding."}
              </p>
            </button>
            <button className="menu-card" type="button" onClick={() => navigate(talkTrainingPath)}>
              <h3>{isAdvanced ? "Summary and Debate Training" : "Parts 3 and 4 Talk Training"}</h3>
              <p>
                {isAdvanced
                  ? "Placeholder area for integrated summaries, debate planning, and follow-up question strategy."
                  : "Open the long-talk training menu, then choose a guide, guided activity, or timed practice."}
              </p>
            </button>
          </>
        ) : (
          <>
            <button className="menu-card" type="button" onClick={openWritingMock}>
              <h3>Writing Mock Tests</h3>
              <p>Choose Mock 1 or Mock 2, then run the full OTE-style writing module in the exam environment.</p>
            </button>
            <button className="menu-card" type="button" onClick={() => navigate(emailTrainingPath)}>
              <h3>Email Task Training</h3>
              <p>Plan, write, and improve email responses for OTE writing tasks.</p>
            </button>
            <button className="menu-card" type="button" onClick={() => navigate(essayTrainingPath)}>
              <h3>Essay Task Training</h3>
              <p>Build structure, arguments, linking, and exam-ready paragraphing.</p>
            </button>
            <button className="menu-card" type="button" onClick={() => navigate(articleReviewTrainingPath)}>
              <h3>Article / Review Training</h3>
              <p>Practise engaging article and review responses for the optional extended task.</p>
            </button>
          </>
        )}
      </div>

      <button className="topbar-btn ote-back-btn" type="button" onClick={() => navigate(homePath)}>
        Back to OTE home
      </button>
    </main>
  );
}
