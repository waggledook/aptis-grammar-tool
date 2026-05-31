import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Settings } from "lucide-react";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { getOteWritingMocks } from "./mockTests/data/oteWritingMockData.js";
import "./styles/ote.css";

export default function OteWritingMockMenu({ user, onRequireSignIn, nativeRoutes = false }) {
  const navigate = useNavigate();
  const mocks = getOteWritingMocks();
  const basePath = nativeRoutes ? "/writing/mock-tests" : "/ote/writing/mock-tests";
  const backPath = getSitePath(nativeRoutes ? "/writing" : "/ote/writing");

  function openMock(mockId) {
    if (!user) {
      onRequireSignIn?.();
      return;
    }
    navigate(getSitePath(`${basePath}/${mockId}`));
  }

  return (
    <main className="ote-exam ote-writing-exam">
      <Seo
        title="OTE Writing Mock Tests | Seif English"
        description="Choose an Oxford Test of English writing mock test in the Seif OTE Trainer."
      />
      <header className="ote-exam-header ote-writing-header">
        <img src="/images/seif-trainer-logo.png" alt="" className="ote-exam-mark" draggable="false" />
        <div className="ote-exam-title">Writing</div>
        <div className="ote-progress-rail" aria-hidden="true">
          <span style={{ width: "0%" }} />
        </div>
        <div className="ote-exam-meta">
          <strong>Seif OTE Trainer</strong>
          <span>Mock</span>
        </div>
      </header>

      <section className="ote-writing-mock-menu-screen">
        <div className="ote-writing-mock-menu-inner">
          <p className="ote-writing-lead">Choose a mock writing test.</p>
          <p>
            Each mock has a 20-minute email task, a two-minute Part 2 choice screen, and a 25-minute extended writing task.
          </p>
          {!user ? <p className="ote-warning">Sign in to save your completed writing mock to your profile.</p> : null}
          <div className="ote-writing-mock-list">
            {mocks.map((mock, index) => (
              <button key={mock.id} className="ote-writing-mock-select-card" type="button" onClick={() => openMock(mock.id)}>
                <span>Mock {index + 1}</span>
                <strong>{mock.title}</strong>
                <em>
                  Email: {mock.task1.maxWords} words max. Part 2: choose {Object.values(mock.task2.options).map((option) => option.noun).join(" or ")}.
                </em>
                <ChevronRight size={28} />
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer className="ote-exam-footer">
        <button className="ote-settings-btn" type="button" disabled aria-label="Visual display options">
          <Settings size={26} />
        </button>
        <button type="button" onClick={() => navigate(backPath)}>
          Back
        </button>
        <span>Choose one mock test to begin.</span>
      </footer>
    </main>
  );
}
