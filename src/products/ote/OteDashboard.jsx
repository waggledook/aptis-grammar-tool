import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import "./styles/ote.css";

export default function OteDashboard({ user, onRequireSignIn }) {
  const navigate = useNavigate();

  function openSpeakingMock() {
    if (!user) {
      onRequireSignIn?.();
      return;
    }
    navigate("/ote/mock-tests/speaking-1");
  }

  return (
    <main className="ote-dashboard">
      <Seo
        title="OTE Training | Seif English"
        description="Oxford Test of English mock-test training for speaking and writing."
      />

      <section className="ote-dashboard-hero">
        <div>
          <p className="ote-kicker">Oxford Test of English</p>
          <h1>OTE Training</h1>
          <p>
            Exam-style mock tests in a dedicated test environment, connected to
            your Seif English account.
          </p>
        </div>
        <div className="ote-hero-mark" aria-hidden="true">
          OTE
        </div>
      </section>

      <section className="ote-dashboard-grid" aria-label="OTE mock tests">
        <button className="ote-dashboard-card" type="button" onClick={openSpeakingMock}>
          <span>Speaking</span>
          <strong>Speaking Mock 1</strong>
          <small>Four-part forward-only speaking module with timed recordings.</small>
        </button>

        <button className="ote-dashboard-card is-disabled" type="button" disabled>
          <span>Writing</span>
          <strong>Writing Mock 1</strong>
          <small>Coming next: exam-style writing module and submission review.</small>
        </button>
      </section>
    </main>
  );
}
