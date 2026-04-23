import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { HUB_GRAMMAR_FLASHCARD_DECKS } from "../../data/hubGrammarFlashcards.js";
import {
  auth,
  createAssignedActivity,
  fetchHubSavedFlashcards,
  listTeacherStudentsWithRosterMeta,
} from "../../firebase.js";
import { toast } from "../../utils/toast.js";

export default function HubGrammarFlashcardsMenu({ user }) {
  const navigate = useNavigate();
  const [savedCount, setSavedCount] = useState(0);
  const [students, setStudents] = useState([]);
  const [assignOverlayDeck, setAssignOverlayDeck] = useState(null);
  const [assignTargetMode, setAssignTargetMode] = useState("all");
  const [assignClassName, setAssignClassName] = useState("");
  const [assignSelectedStudentIds, setAssignSelectedStudentIds] = useState([]);
  const [assignNotes, setAssignNotes] = useState("");
  const [assignSaving, setAssignSaving] = useState(false);

  const isTeacher = user?.role === "teacher" || user?.role === "admin";

  useEffect(() => {
    let alive = true;

    async function loadSavedCount() {
      if (!auth.currentUser?.uid) {
        if (alive) setSavedCount(0);
        return;
      }

      try {
        const saved = await fetchHubSavedFlashcards({
          uid: auth.currentUser.uid,
          category: "grammar",
        });
        if (alive) setSavedCount(saved.length);
      } catch (error) {
        console.error("Failed to load saved flashcards count", error);
      }
    }

    loadSavedCount();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    if (!isTeacher) {
      setStudents([]);
      return undefined;
    }

    (async () => {
      try {
        const rows = (await listTeacherStudentsWithRosterMeta?.(user?.uid)) || [];
        if (!alive) return;
        setStudents(rows);
      } catch (error) {
        console.error("[HubGrammarFlashcardsMenu] teacher student load failed", error);
      }
    })();

    return () => {
      alive = false;
    };
  }, [isTeacher, user]);

  const classOptions = useMemo(
    () =>
      [...new Set(students.map((student) => String(student.className || "").trim()).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [students]
  );

  function openAssignOverlay(deck) {
    setAssignOverlayDeck(deck);
    setAssignTargetMode("all");
    setAssignClassName("");
    setAssignSelectedStudentIds([]);
    setAssignNotes("");
  }

  function closeAssignOverlay() {
    if (assignSaving) return;
    setAssignOverlayDeck(null);
    setAssignTargetMode("all");
    setAssignClassName("");
    setAssignSelectedStudentIds([]);
    setAssignNotes("");
  }

  function toggleStudent(studentId) {
    setAssignSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  }

  async function handleAssignDeck() {
    if (!assignOverlayDeck || !isTeacher) return;

    let targetStudentIds = [];
    if (assignTargetMode === "all") {
      targetStudentIds = students.map((student) => student.id);
    } else if (assignTargetMode === "class") {
      targetStudentIds = students
        .filter((student) => String(student.className || "").trim() === assignClassName)
        .map((student) => student.id);
    } else {
      targetStudentIds = assignSelectedStudentIds;
    }

    targetStudentIds = [...new Set(targetStudentIds)].filter(Boolean);

    if (!targetStudentIds.length) {
      toast("Choose at least one student for this flashcard deck.");
      return;
    }

    setAssignSaving(true);
    try {
      await createAssignedActivity({
        teacherUid: user.uid,
        teacherName: user.displayName || user.name || user.email || "Teacher",
        teacherEmail: user.email || null,
        activityType: "flashcards",
        activityId: assignOverlayDeck.id,
        activityLabel: assignOverlayDeck.title,
        routePath: `${getSitePath(`/grammar/flashcards/${assignOverlayDeck.id}`)}?assignment=__ASSIGNMENT_ID__`,
        targetMode: assignTargetMode,
        className: assignTargetMode === "class" ? assignClassName : "",
        targetStudentIds,
        notes: String(assignNotes || "").trim(),
      });
      toast("Flashcard deck assigned.");
      closeAssignOverlay();
    } catch (error) {
      console.error("[HubGrammarFlashcardsMenu] assignment failed", error);
      toast("Could not assign that flashcard deck.");
    } finally {
      setAssignSaving(false);
    }
  }

  return (
    <div className="menu-wrapper hub-flashcards-menu-shell">
      <Seo
        title="Grammar Flashcards | Seif Hub"
        description="Choose a grammar flashcard deck inside the Seif English Hub."
      />

      <div className="hub-flashcards-menu-topbar">
        <div>
          <p className="hub-flashcards-eyebrow">Grammar flashcards</p>
          <h1 className="hub-flashcards-title">Choose a deck</h1>
          <p className="hub-flashcards-copy">
            Use grid view for a page full of cards, or switch to focus mode for one card at a time.
          </p>
        </div>
        <div style={{ display: "flex", gap: ".65rem", flexWrap: "wrap" }}>
          <button
            className="review-btn"
            onClick={() => navigate(getSitePath("/grammar/flashcards/saved-review"))}
            disabled={!savedCount}
          >
            {savedCount ? `Review saved cards (${savedCount})` : "No saved cards yet"}
          </button>
          <button className="review-btn" onClick={() => navigate(getSitePath("/grammar"))}>
            Back to grammar
          </button>
        </div>
      </div>

      <div className="hub-flashcards-menu-grid">
        {HUB_GRAMMAR_FLASHCARD_DECKS.map((deck) => (
          <article
            key={deck.id}
            className="hub-flashcards-menu-card"
          >
            <button
              type="button"
              className="hub-flashcards-menu-card-main"
              onClick={() => navigate(getSitePath(`/grammar/flashcards/${deck.id}`))}
            >
              <div className="hub-flashcards-menu-card-top">
                <h3>{deck.title}</h3>
                <span className="hub-flashcards-menu-card-pill">{deck.cards.length} cards</span>
              </div>
              <p>{deck.description}</p>
            </button>
            {isTeacher ? (
              <div className="hub-flashcards-menu-card-actions">
                <button
                  type="button"
                  className="hub-flashcards-assign-btn"
                  onClick={() => openAssignOverlay(deck)}
                >
                  Assign
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      {assignOverlayDeck ? (
        <div className="hub-flashcards-assign-overlay" onClick={closeAssignOverlay}>
          <div className="hub-flashcards-assign-modal" onClick={(event) => event.stopPropagation()}>
            <div className="hub-flashcards-assign-head">
              <div>
                <h3>Assign flashcard deck</h3>
                <p>{assignOverlayDeck.title}</p>
              </div>
              <button type="button" className="review-btn" onClick={closeAssignOverlay}>
                Close
              </button>
            </div>

            <div className="hub-flashcards-assign-grid">
              <label className="hub-flashcards-field">
                <span>Assign to</span>
                <select value={assignTargetMode} onChange={(event) => setAssignTargetMode(event.target.value)}>
                  <option value="all">All my students</option>
                  <option value="class">One class label</option>
                  <option value="selected">Selected students</option>
                </select>
              </label>

              {assignTargetMode === "class" ? (
                <label className="hub-flashcards-field">
                  <span>Class label</span>
                  <select value={assignClassName} onChange={(event) => setAssignClassName(event.target.value)}>
                    <option value="">Choose a class</option>
                    {classOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </div>

            {assignTargetMode === "selected" ? (
              <div className="hub-flashcards-assign-students">
                <span className="hub-flashcards-field-label">Students</span>
                <div className="hub-flashcards-assign-student-list">
                  {students.map((student) => {
                    const label =
                      student.displayName || student.name || student.username || student.email || student.id;
                    return (
                      <label key={student.id} className="hub-flashcards-assign-student-item">
                        <input
                          type="checkbox"
                          checked={assignSelectedStudentIds.includes(student.id)}
                          onChange={() => toggleStudent(student.id)}
                        />
                        <span>{label}</span>
                        {student.className ? <em>{student.className}</em> : null}
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <label className="hub-flashcards-field">
              <span>Teacher note</span>
              <textarea
                rows={3}
                value={assignNotes}
                onChange={(event) => setAssignNotes(event.target.value)}
                placeholder="Optional note shown on the student side"
              />
            </label>

            <div className="hub-flashcards-assign-actions">
              <button type="button" className="review-btn" onClick={handleAssignDeck} disabled={assignSaving}>
                {assignSaving ? "Assigning..." : "Assign flashcard deck"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <style>{`
        .hub-flashcards-menu-shell {
          padding-top: 0;
          margin-top: 0;
        }

        .hub-flashcards-menu-topbar {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .hub-flashcards-eyebrow {
          margin: 0 0 .25rem;
          font-size: .82rem;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: #8eb6ff;
        }

        .hub-flashcards-title {
          margin: 0;
          font-size: clamp(1.6rem, 1.3rem + 1vw, 2.2rem);
          color: #eef4ff;
        }

        .hub-flashcards-copy {
          margin: .35rem 0 0;
          max-width: 52rem;
          color: rgba(230, 240, 255, 0.84);
          line-height: 1.5;
        }

        .hub-flashcards-menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }

        .hub-flashcards-menu-card {
          text-align: left;
          background: #1a2847;
          border: 2px solid #35508e;
          border-radius: 22px;
          padding: 0;
          color: #eef4ff;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16);
          transition: transform .16s ease, border-color .16s ease, box-shadow .16s ease;
          overflow: hidden;
        }

        .hub-flashcards-menu-card:hover {
          transform: translateY(-2px);
          border-color: #4a6bc0;
          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.2);
        }

        .hub-flashcards-menu-card-main {
          all: unset;
          display: block;
          box-sizing: border-box;
          width: 100%;
          cursor: pointer;
          padding: 1.25rem 1.35rem;
        }

        .hub-flashcards-menu-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: .75rem;
          margin-bottom: .55rem;
        }

        .hub-flashcards-menu-card h3 {
          margin: 0;
          color: #eef4ff;
          font-size: 1.15rem;
          line-height: 1.2;
        }

        .hub-flashcards-menu-card p {
          margin: 0;
          color: rgba(238, 244, 255, 0.88);
          font-size: 1rem;
          line-height: 1.45;
        }

        .hub-flashcards-menu-card-pill {
          flex-shrink: 0;
          padding: .35rem .7rem;
          border-radius: 999px;
          background: rgba(255, 191, 73, 0.12);
          color: #ffcf70;
          border: 1px solid rgba(255, 191, 73, 0.28);
          font-size: .82rem;
          font-weight: 800;
        }

        .hub-flashcards-menu-card-actions {
          padding: 0 1.35rem 1.15rem;
        }

        .hub-flashcards-assign-btn {
          width: 100%;
          border: 1px solid rgba(126, 240, 194, 0.35);
          border-radius: 14px;
          background: rgba(126, 240, 194, 0.12);
          color: #bfffe7;
          font-weight: 850;
          padding: .72rem .9rem;
          cursor: pointer;
        }

        .hub-flashcards-assign-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: grid;
          place-items: center;
          padding: 1rem;
          background: rgba(2, 8, 22, 0.72);
        }

        .hub-flashcards-assign-modal {
          width: min(720px, 100%);
          max-height: min(84vh, 760px);
          overflow: auto;
          border: 1px solid rgba(126, 160, 255, 0.35);
          border-radius: 24px;
          background: #102044;
          padding: 1.2rem;
          color: #eef4ff;
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
        }

        .hub-flashcards-assign-head,
        .hub-flashcards-assign-grid,
        .hub-flashcards-assign-actions {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .hub-flashcards-assign-head h3,
        .hub-flashcards-assign-head p {
          margin: 0;
        }

        .hub-flashcards-assign-head p {
          color: rgba(238, 244, 255, 0.75);
          margin-top: .25rem;
        }

        .hub-flashcards-field {
          display: grid;
          gap: .38rem;
          width: 100%;
          margin-bottom: 1rem;
        }

        .hub-flashcards-field span,
        .hub-flashcards-field-label {
          color: rgba(238, 244, 255, 0.82);
          font-weight: 800;
          font-size: .88rem;
        }

        .hub-flashcards-field select,
        .hub-flashcards-field textarea {
          border: 1px solid rgba(143, 182, 255, 0.35);
          border-radius: 14px;
          background: rgba(4, 11, 27, 0.72);
          color: #eef4ff;
          padding: .72rem .85rem;
        }

        .hub-flashcards-assign-student-list {
          display: grid;
          gap: .55rem;
          max-height: 260px;
          overflow: auto;
          padding: .7rem;
          border: 1px solid rgba(143, 182, 255, 0.22);
          border-radius: 16px;
          background: rgba(4, 11, 27, 0.4);
          margin: .4rem 0 1rem;
        }

        .hub-flashcards-assign-student-item {
          display: flex;
          align-items: center;
          gap: .6rem;
          color: #eef4ff;
        }

        .hub-flashcards-assign-student-item em {
          margin-left: auto;
          color: rgba(238, 244, 255, 0.62);
          font-style: normal;
          font-size: .82rem;
        }

        @media (max-width: 720px) {
          .hub-flashcards-menu-topbar {
            flex-direction: column;
            align-items: flex-start;
          }

          .hub-flashcards-menu-topbar .review-btn {
            width: 100%;
          }

          .hub-flashcards-menu-topbar > div:last-child {
            width: 100%;
          }

          .hub-flashcards-menu-topbar > div:last-child .review-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
