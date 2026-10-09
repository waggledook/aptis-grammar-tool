// src/components/teacher/TeacherTools.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getSitePath, getSiteVariant } from "../../siteConfig.js";
import TeacherGrammarTool from "./TeacherGrammarTool";
import TeacherGrammarSetResults from "./TeacherGrammarSetResults";
import TeacherUseOfEnglishQuizBuilder from "./TeacherUseOfEnglishQuizBuilder";
import TeacherCourseTests from "./TeacherCourseTests";
import TeacherAssignedActivities from "./TeacherAssignedActivities";

export default function TeacherTools({ user }) {
  // ---------- Local UI state ----------
  const [showBuilder, setShowBuilder] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showUseOfEnglishBuilder, setShowUseOfEnglishBuilder] = useState(false);
  const [showCourseTests, setShowCourseTests] = useState(false);
  const [showAssignments, setShowAssignments] = useState(false);
  const currentSite = getSiteVariant();
  const resourceSection = currentSite.id === "ote" ? "ote" : currentSite.id === "seifhub" ? "hub" : "aptis";
  const teacherResourcesPath = `${getSitePath("/teacher-resources")}#${resourceSection}`;

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

  return (
    <div className="teacher-tools-page game-wrapper">
      <TeacherToolsStyleScope />

      {/* Header – mirroring Profile */}
      <header className="header">
        <div>
          <h1 className="title">Teacher Tools</h1>
          <p className="intro small">
            Welcome, <strong>{user.email}</strong> ({user.role}). Use this area
            to build Aptis grammar sets, create mixed Use of English quizzes,
            set up fixed course-test sessions, and review how your students did.
          </p>
        </div>
      </header>

      <section className="teacher-resources-shortcut">
        <div>
          <p className="teacher-resources-shortcut-label">Ready-made teaching material</p>
          <h2>Classroom resources</h2>
          <p>Browse activities for lessons, assignments, and teacher-controlled live sessions across all three platforms.</p>
        </div>
        <Link className="teacher-resources-shortcut-link" to={teacherResourcesPath}>
          Browse resources <span aria-hidden="true">→</span>
        </Link>
      </section>

      {/* 1) Create / edit a grammar set */}
      <section className="panel collapsible">
        <button
          type="button"
          className="collapse-head"
          onClick={() => setShowBuilder((v) => !v)}
        >
          <div className="head-left">
            <h2 className="sec-title">Create / edit an Aptis grammar set</h2>
            <p className="muted small">
              Build multiple-choice Aptis-style grammar sets, then save them as drafts or publish them for students.
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

      <section className="panel collapsible" style={{ marginTop: "0.9rem" }}>
        <button
          type="button"
          className="collapse-head"
          onClick={() => setShowAssignments((v) => !v)}
        >
          <div className="head-left">
            <h2 className="sec-title">Assign class activities</h2>
            <p className="muted small">
              Send mini tests, grammar sets, Use of English sets, writing tasks, and dictation tasks to your students.
            </p>
          </div>
          <span className={`chev ${showAssignments ? "open" : ""}`} aria-hidden>
            ▾
          </span>
        </button>

        {showAssignments && (
          <div className="panel-body">
            <TeacherAssignedActivities user={user} />
          </div>
        )}
      </section>

      <section className="panel collapsible" style={{ marginTop: "0.9rem" }}>
        <button
          type="button"
          className="collapse-head"
          onClick={() => setShowUseOfEnglishBuilder((v) => !v)}
        >
          <div className="head-left">
            <h2 className="sec-title">Create a custom Use of English quiz</h2>
            <p className="muted small">
              Mix keyword, word formation, and open cloze items into a custom quiz, or generate one quickly from source counts.
            </p>
          </div>
          <span className={`chev ${showUseOfEnglishBuilder ? "open" : ""}`} aria-hidden>
            ▾
          </span>
        </button>

        {showUseOfEnglishBuilder && (
          <div className="panel-body">
            <TeacherUseOfEnglishQuizBuilder user={user} />
          </div>
        )}
      </section>

      <section className="panel collapsible" style={{ marginTop: "0.9rem" }}>
        <button
          type="button"
          className="collapse-head"
          onClick={() => setShowCourseTests((v) => !v)}
        >
          <div className="head-left">
            <h2 className="sec-title">Set up course tests</h2>
            <p className="muted small">
              Create teacher-run B1 progress and end-of-course test sessions from the fixed Oxford templates, then assign them to a class or selected students.
            </p>
          </div>
          <span className={`chev ${showCourseTests ? "open" : ""}`} aria-hidden>
            ▾
          </span>
        </button>

        {showCourseTests && (
          <div className="panel-body">
            <TeacherCourseTests user={user} />
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
              Review your Aptis grammar sets and custom quizzes, share links,
              and monitor how students did.
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

      .teacher-tools-page .teacher-resources-shortcut {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin: 0 0 1rem;
        padding: 1rem 1.1rem;
        border: 1px solid rgba(96, 165, 250, 0.42);
        border-radius: 14px;
        background: linear-gradient(135deg, rgba(30, 64, 175, 0.2), rgba(14, 116, 144, 0.12));
        color: var(--ink);
      }

      .teacher-tools-page .teacher-resources-shortcut-label {
        margin: 0 0 0.2rem;
        color: #93c5fd;
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .teacher-tools-page .teacher-resources-shortcut h2 {
        margin: 0;
        font-size: 1.15rem;
      }

      .teacher-tools-page .teacher-resources-shortcut p:last-child {
        margin: 0.3rem 0 0;
        color: var(--muted);
      }

      .teacher-tools-page .teacher-resources-shortcut-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.45rem;
        flex: 0 0 auto;
        min-height: 42px;
        padding: 0.7rem 0.9rem;
        border-radius: 10px;
        background: #2563eb;
        color: #fff;
        font-weight: 800;
        text-decoration: none;
        transition: background 0.2s ease, transform 0.2s ease;
      }

      .teacher-tools-page .teacher-resources-shortcut-link:hover {
        background: #1d4ed8;
        transform: translateY(-1px);
      }

      .teacher-tools-page .teacher-resources-shortcut-link:focus-visible {
        outline: 3px solid rgba(147, 197, 253, 0.75);
        outline-offset: 3px;
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
        .teacher-tools-page .teacher-resources-shortcut {
          align-items: stretch;
          flex-direction: column;
        }

        .teacher-tools-page .collapse-head {
          align-items: flex-start;
        }
      }
    `}</style>
  );
}
