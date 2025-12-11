// src/components/teacher/TeacherTools.jsx
import React, { useState } from "react";
import TeacherGrammarTool from "./TeacherGrammarTool";
import TeacherGrammarSetResults from "./TeacherGrammarSetResults";

export default function TeacherTools({ user }) {
  // ---------- Auth gate ----------
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return (
      <div className="teacher-tools-page game-wrapper">
        <TeacherToolsStyleScope />
        <div className="panel" style={{ marginTop: "1rem" }}>
          <h2 className="sec-title">Teacher Tools</h2>
          <p className="muted">
            Sorry, you are not authorised to access this section.
          </p>
        </div>
      </div>
    );
  }

  // ---------- Local UI state ----------
  const [showBuilder, setShowBuilder] = useState(false);
  const [showResults, setShowResults] = useState(false);

  return (
    <div className="teacher-tools-page game-wrapper">
      <TeacherToolsStyleScope />

      {/* Header – mirroring Profile */}
      <header className="header">
        <div>
          <h1 className="title">Teacher Tools</h1>
          <p className="intro small">
            Welcome, <strong>{user.email}</strong> ({user.role}). Use this area
            to create custom grammar sets and review how your students did.
          </p>
        </div>
      </header>

      {/* 1) Create / edit a grammar set */}
      <section className="panel collapsible">
        <button
          type="button"
          className="collapse-head"
          onClick={() => setShowBuilder((v) => !v)}
        >
          <div className="head-left">
            <h2 className="sec-title">Create / edit a grammar set</h2>
            <p className="muted small">
              Search the full bank, build your set, and choose practice or test
              mode.
            </p>
          </div>
          <span className={`chev ${showBuilder ? "open" : ""}`} aria-hidden>
            ▾
          </span>
        </button>

        {showBuilder && (
          <div className="panel-body">
            <TeacherGrammarTool user={user} />
          </div>
        )}
      </section>

      {/* 2) My grammar sets & student results */}
      <section className="panel collapsible" style={{ marginTop: "0.9rem" }}>
        <button
          type="button"
          className="collapse-head"
          onClick={() => setShowResults((v) => !v)}
        >
          <div className="head-left">
            <h2 className="sec-title">My grammar sets &amp; student results</h2>
            <p className="muted small">
              Review the sets you&apos;ve created, share links, and monitor how
              students did.
            </p>
          </div>
          <span className={`chev ${showResults ? "open" : ""}`} aria-hidden>
            ▾
          </span>
        </button>

        {showResults && (
          <div className="panel-body">
            <TeacherGrammarSetResults user={user} />
          </div>
        )}
      </section>
    </div>
  );
}

/**
 * Local style scope – mirrors the Profile page look
 * but scoped to .teacher-tools-page.
 */
function TeacherToolsStyleScope() {
  return (
    <style>{`
      .teacher-tools-page {
        --panel: #13213b;
        --ink: #e6f0ff;
        --muted: #a9b7d1;
      }

      .teacher-tools-page .title {
        margin: 0 0 .25rem 0;
        font-size: 1.7rem;
        color: var(--ink);
      }

      .teacher-tools-page .intro {
        margin: 0 0 1rem 0;
        color: var(--muted);
      }

      .teacher-tools-page .muted {
        color: var(--muted);
      }

      .teacher-tools-page .small {
        font-size: 0.9em;
      }

      .teacher-tools-page .panel {
        background: #13213b;
        border: 1px solid #2c4b83;
        border-radius: 12px;
        padding: 1rem 1.1rem;
        color: var(--ink);
      }

      .teacher-tools-page .collapsible {
        margin-top: 1rem;
      }

      .teacher-tools-page .collapse-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 0.75rem;
        width: 100%;
        background: transparent;
        border: 0;
        color: var(--ink);
        cursor: pointer;
        padding: 0;
        text-align: left;
      }

      .teacher-tools-page .head-left {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .teacher-tools-page .collapse-head .sec-title {
        margin: 0;
        font-size: 1.1rem;
      }

      .teacher-tools-page .chev {
        font-size: 1.2rem;
        line-height: 1;
        transition: transform 0.2s ease, opacity 0.2s ease;
        opacity: 0.7;
        margin-left: 0.25rem;
      }

      .teacher-tools-page .chev.open {
        transform: rotate(180deg);
        opacity: 1;
      }

      .teacher-tools-page .panel-body {
        margin-top: 0.75rem;
      }

      @media (max-width: 640px) {
        .teacher-tools-page .collapse-head {
          align-items: flex-start;
        }
      }
    `}</style>
  );
}
