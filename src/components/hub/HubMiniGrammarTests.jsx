import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Seo from "../common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { HUB_GRAMMAR_ACTIVITIES } from "../../data/hubGrammarActivities.js";
import * as fb from "../../firebase";
import { toast } from "../../utils/toast";

const LEVELS = ["a2", "b1", "b2", "c1", "c2"];
const LEVEL_COLORS = {
  a2: "#7ef0c2",
  b1: "#8fb6ff",
  b2: "#f6d26b",
  c1: "#f2b0b7",
  c2: "#c7a4ff",
};

function getSearchText(activity) {
  return [activity.title, activity.shortDescription, activity.intro, ...(activity.levels || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function HubMiniGrammarTests({ user }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [completedActivityIds, setCompletedActivityIds] = useState(new Set());
  const [students, setStudents] = useState([]);
  const [assignOverlayActivity, setAssignOverlayActivity] = useState(null);
  const [assignTargetMode, setAssignTargetMode] = useState("all");
  const [assignClassName, setAssignClassName] = useState("");
  const [assignSelectedStudentIds, setAssignSelectedStudentIds] = useState([]);
  const [assignNotes, setAssignNotes] = useState("");
  const [assignSaving, setAssignSaving] = useState(false);
  const [shareOverlayActivity, setShareOverlayActivity] = useState(null);

  const isTeacher = user?.role === "teacher" || user?.role === "admin";

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const submissions = (await fb.fetchHubGrammarSubmissions?.(200)) || [];
        if (!alive) return;
        setCompletedActivityIds(
          new Set(submissions.map((submission) => submission?.activityId).filter(Boolean))
        );
      } catch (error) {
        console.error("[HubMiniGrammarTests] completion load failed", error);
      }
    })();

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
        const rows = (await fb.listTeacherStudentsWithRosterMeta?.(user?.uid)) || [];
        if (!alive) return;
        setStudents(rows);
      } catch (error) {
        console.error("[HubMiniGrammarTests] teacher student load failed", error);
      }
    })();

    return () => {
      alive = false;
    };
  }, [isTeacher, user]);

  const filteredActivities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return HUB_GRAMMAR_ACTIVITIES.map((activity, index) => ({ activity, index }))
      .filter(({ activity }) => {
        const levels = activity.levels || [];
        const matchesLevel =
          selectedLevels.length === 0 ||
          selectedLevels.some((level) => levels.includes(level));
        const matchesQuery =
          !normalizedQuery || getSearchText(activity).includes(normalizedQuery);

        return matchesLevel && matchesQuery;
      })
      .sort((left, right) => {
        const leftCompleted = completedActivityIds.has(left.activity.id);
        const rightCompleted = completedActivityIds.has(right.activity.id);

        if (leftCompleted !== rightCompleted) {
          return leftCompleted ? 1 : -1;
        }

        return left.index - right.index;
      })
      .map(({ activity }) => activity);
  }, [completedActivityIds, query, selectedLevels]);

  function toggleLevel(level) {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((item) => item !== level) : [...prev, level]
    );
  }

  function clearFilters() {
    setQuery("");
    setSelectedLevels([]);
  }

  const classOptions = useMemo(
    () =>
      [...new Set(students.map((student) => String(student.className || "").trim()).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [students]
  );

  function openAssignOverlay(activity) {
    setAssignOverlayActivity(activity);
    setAssignTargetMode("all");
    setAssignClassName("");
    setAssignSelectedStudentIds([]);
    setAssignNotes("");
  }

  function closeAssignOverlay() {
    if (assignSaving) return;
    setAssignOverlayActivity(null);
    setAssignTargetMode("all");
    setAssignClassName("");
    setAssignSelectedStudentIds([]);
    setAssignNotes("");
  }

  function getActivityShareUrl(activityId) {
    if (typeof window === "undefined") return getSitePath(`/grammar/activity/${activityId}`);
    return `${window.location.origin}${getSitePath(`/grammar/activity/${activityId}`)}`;
  }

  function openShareOverlay(activity) {
    setShareOverlayActivity(activity);
  }

  function closeShareOverlay() {
    setShareOverlayActivity(null);
  }

  async function handleCopyShareLink(activity) {
    const shareUrl = getActivityShareUrl(activity?.id);
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast("Mini test link copied.");
    } catch (error) {
      console.error("[HubMiniGrammarTests] copy share link failed", error);
      toast("Could not copy that link.");
    }
  }

  function toggleStudent(studentId) {
    setAssignSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  }

  async function handleAssignMiniTest() {
    if (!assignOverlayActivity || !isTeacher) return;

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
      toast("Choose at least one student for this mini test.");
      return;
    }

    setAssignSaving(true);
    try {
      await fb.createAssignedActivity({
        teacherUid: user.uid,
        teacherName: user.displayName || user.name || user.email || "Teacher",
        teacherEmail: user.email || null,
        activityType: "mini-test",
        activityId: assignOverlayActivity.id,
        activityLabel: assignOverlayActivity.title,
        routePath: getSitePath(`/grammar/activity/${assignOverlayActivity.id}`),
        targetMode: assignTargetMode,
        className: assignTargetMode === "class" ? assignClassName : "",
        targetStudentIds,
        notes: String(assignNotes || "").trim(),
      });
      toast("Mini test assigned.");
      closeAssignOverlay();
    } catch (error) {
      console.error("[HubMiniGrammarTests] assignment failed", error);
      toast("Could not assign that mini test.");
    } finally {
      setAssignSaving(false);
    }
  }

  return (
    <div className="menu-wrapper hub-menu-wrapper">
      <Seo
        title="Mini Grammar Tests | Seif Hub"
        description="Choose a mini grammar test inside the Seif English Hub."
      />

      <header
        className="main-header"
        style={{ textAlign: "center", marginBottom: "0rem" }}
      >
        <img
          src="/images/seif-english-hub-logo.png"
          alt="Seif English Hub Logo"
          className="menu-logo hub-logo"
          draggable="false"
        />
      </header>

      <p className="menu-sub">Choose a mini grammar test to begin.</p>

      <div className="whats-new-banner hub-status-banner">
        <div className="whats-new-copy">
          <span className="whats-new-label">Mini grammar tests</span>
          <p>
            Short focused tests with instant corrective feedback and saved
            submissions inside the hub.
          </p>
        </div>

        <button className="whats-new-btn" onClick={() => navigate(getSitePath("/grammar"))}>
          Back to grammar
        </button>
      </div>

      <section className="hub-mini-browser">
        <div className="hub-mini-browser-head">
          <div>
            <h2>Browse Tests</h2>
            <p>Filter by level or search by grammar point as the bank grows.</p>
          </div>
          <div className="hub-mini-count">
            {filteredActivities.length} test{filteredActivities.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="hub-mini-filters">
          <div className="hub-mini-filter-group">
            <span className="hub-mini-filter-label">Levels</span>
            <div className="level-row">
              {LEVELS.map((level) => (
                <label
                  key={level}
                  className={`level-pill ${selectedLevels.includes(level) ? "selected" : ""}`}
                  style={{ "--badge-color": LEVEL_COLORS[level] || "#8aa0ff" }}
                >
                  <input
                    type="checkbox"
                    checked={selectedLevels.includes(level)}
                    onChange={() => toggleLevel(level)}
                  />
                  <span>{level.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="hub-mini-filter-group hub-mini-search-group">
            <span className="hub-mini-filter-label">Search</span>
            <div className="hub-mini-search-row">
              <input
                type="text"
                className="hub-mini-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try present perfect, passive, future..."
              />
              {(query || selectedLevels.length) ? (
                <button type="button" className="hub-mini-clear" onClick={clearFilters}>
                  Clear
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="menu-grid">
        {filteredActivities.map((activity) => {
          const isCompleted = completedActivityIds.has(activity.id);
          return (
          <article
            key={activity.id}
            className={`menu-card hub-mini-card-shell ${isCompleted ? "is-completed" : ""}`}
          >
            <button
              type="button"
              className="hub-mini-card-main"
              onClick={() => navigate(getSitePath(`/grammar/activity/${activity.id}`))}
            >
              <div className="hub-mini-card-top">
                <h3>{activity.title}</h3>
                {isCompleted ? (
                  <span className="hub-mini-complete" aria-label="Completed">
                    ✓
                  </span>
                ) : null}
              </div>
              <div className="hub-mini-card-levels">
                {(activity.levels || []).map((level) => (
                  <span
                    key={`${activity.id}-${level}`}
                    className="cefr-badge"
                    style={{ "--badge-color": LEVEL_COLORS[level] || "#8aa0ff" }}
                  >
                    {level.toUpperCase()}
                  </span>
                ))}
              </div>
              <p>{activity.shortDescription}</p>
            </button>
            {isTeacher ? (
              <div className="hub-mini-card-actions">
                <button
                  type="button"
                  className="hub-mini-assign-btn"
                  onClick={() => openAssignOverlay(activity)}
                >
                  Assign
                </button>
                <button
                  type="button"
                  className="hub-mini-share-btn"
                  onClick={() => openShareOverlay(activity)}
                  aria-label={`Show QR code for ${activity.title}`}
                >
                  QR
                </button>
              </div>
            ) : null}
          </article>
          );
        })}
      </div>

      {assignOverlayActivity ? (
        <div className="hub-mini-assign-overlay" onClick={closeAssignOverlay}>
          <div className="hub-mini-assign-modal" onClick={(event) => event.stopPropagation()}>
            <div className="hub-mini-assign-head">
              <div>
                <h3>Assign mini test</h3>
                <p>{assignOverlayActivity.title}</p>
              </div>
              <button type="button" className="ghost-btn" onClick={closeAssignOverlay}>
                Close
              </button>
            </div>

            <div className="hub-mini-assign-grid">
              <label className="hub-mini-field">
                <span>Assign to</span>
                <select value={assignTargetMode} onChange={(event) => setAssignTargetMode(event.target.value)}>
                  <option value="all">All my students</option>
                  <option value="class">One class label</option>
                  <option value="selected">Selected students</option>
                </select>
              </label>

              {assignTargetMode === "class" ? (
                <label className="hub-mini-field">
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
              <div className="hub-mini-assign-students">
                <span className="hub-mini-field-label">Students</span>
                <div className="hub-mini-assign-student-list">
                  {students.map((student) => {
                    const label =
                      student.displayName || student.name || student.username || student.email || student.id;
                    return (
                      <label key={student.id} className="hub-mini-assign-student-item">
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

            <label className="hub-mini-field">
              <span>Teacher note</span>
              <textarea
                rows={3}
                value={assignNotes}
                onChange={(event) => setAssignNotes(event.target.value)}
                placeholder="Optional note shown on the student side"
              />
            </label>

            <div className="hub-mini-assign-actions">
              <button type="button" className="review-btn" onClick={handleAssignMiniTest} disabled={assignSaving}>
                {assignSaving ? "Assigning..." : "Assign mini test"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {shareOverlayActivity ? (
        <div className="hub-mini-share-overlay" onClick={closeShareOverlay}>
          <div className="hub-mini-share-modal" onClick={(event) => event.stopPropagation()}>
            <div className="hub-mini-share-head">
              <div>
                <h3>Share mini test</h3>
                <p>{shareOverlayActivity.title}</p>
              </div>
              <button type="button" className="ghost-btn" onClick={closeShareOverlay}>
                Close
              </button>
            </div>

            <div className="hub-mini-share-body">
              <div className="hub-mini-share-code">
                <QRCodeSVG
                  value={getActivityShareUrl(shareOverlayActivity.id)}
                  size={180}
                  bgColor="transparent"
                  fgColor="#eef4ff"
                />
              </div>

              <div className="hub-mini-share-copy">
                <p className="hub-mini-share-label">Student link</p>
                <input
                  type="text"
                  value={getActivityShareUrl(shareOverlayActivity.id)}
                  readOnly
                  onFocus={(event) => event.target.select()}
                />
                <p className="hub-mini-share-help">
                  Students can scan the QR code on their phones or open the same link directly.
                </p>
                <button
                  type="button"
                  className="review-btn"
                  onClick={() => handleCopyShareLink(shareOverlayActivity)}
                >
                  Copy link
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!filteredActivities.length ? (
        <div className="hub-mini-empty">
          <strong>No tests match those filters.</strong>
          <p>Try clearing the level pills or using a broader search term.</p>
        </div>
      ) : null}

      <style>{`
        .hub-menu-wrapper {
          padding-top: 0;
          margin-top: 0;
        }

        .hub-menu-wrapper .main-header {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0;
          padding: 0;
          line-height: 0;
          text-align: center;
        }

        .hub-menu-wrapper .menu-logo {
          display: block;
          width: clamp(220px, 26vw, 380px);
          height: auto;
          filter:
            drop-shadow(0 0 10px rgba(255,255,255,0.5))
            drop-shadow(0 0 18px rgba(255,165,0,0.35));
          animation: hubLogoFade 1.2s ease both;
          transition: filter .3s ease;
          margin: 0;
        }

        .hub-menu-wrapper .menu-logo:hover {
          filter:
            drop-shadow(0 0 12px rgba(255,255,255,0.8))
            drop-shadow(0 0 25px rgba(255,165,0,0.5));
        }

        @keyframes hubLogoFade {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }

        .hub-menu-wrapper .menu-sub {
          opacity: .85;
          margin-top: .2rem;
          margin-bottom: .6rem;
          text-align: center;
        }

        .hub-menu-wrapper .whats-new-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin: 0 0 1rem;
          padding: .9rem 1rem;
          border-radius: 14px;
          background: linear-gradient(
            90deg,
            rgba(255, 191, 73, 0.10),
            rgba(255, 191, 73, 0.04)
          );
          border: 1px solid rgba(255, 191, 73, 0.35);
        }

        .hub-mini-card-shell {
          display: grid;
          gap: 0.75rem;
        }

        .hub-mini-card-main {
          all: unset;
          cursor: pointer;
          display: grid;
          gap: 0.55rem;
        }

        .hub-mini-card-actions {
          display: flex;
          justify-content: flex-start;
          gap: 0.55rem;
        }

        .hub-mini-assign-btn {
          border-radius: 999px;
          border: 1px solid rgba(120, 182, 255, 0.34);
          background: rgba(120, 182, 255, 0.12);
          color: #dce8ff;
          padding: 0.48rem 0.85rem;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }

        .hub-mini-share-btn {
          border-radius: 999px;
          border: 1px solid rgba(255, 213, 110, 0.32);
          background: rgba(255, 213, 110, 0.1);
          color: #dce8ff;
          min-width: 3.25rem;
          padding: 0.48rem 0.8rem;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }

        .hub-mini-assign-overlay {
          position: fixed;
          inset: 0;
          background: rgba(2, 6, 18, 0.72);
          display: grid;
          place-items: center;
          padding: 1rem;
          z-index: 1100;
        }

        .hub-mini-share-overlay {
          position: fixed;
          inset: 0;
          background: rgba(2, 6, 18, 0.78);
          display: grid;
          place-items: center;
          padding: 1rem;
          z-index: 1150;
        }

        .hub-mini-assign-modal {
          width: min(780px, 100%);
          display: grid;
          gap: 0.9rem;
          border-radius: 20px;
          border: 1px solid rgba(70, 102, 170, 0.42);
          background: linear-gradient(180deg, rgba(11, 21, 48, 0.98), rgba(14, 28, 63, 0.96));
          box-shadow: 0 24px 60px rgba(2, 8, 24, 0.44);
          padding: 1.1rem;
        }

        .hub-mini-share-modal {
          width: min(640px, 100%);
          display: grid;
          gap: 1rem;
          border-radius: 20px;
          border: 1px solid rgba(70, 102, 170, 0.42);
          background: linear-gradient(180deg, rgba(11, 21, 48, 0.98), rgba(14, 28, 63, 0.96));
          box-shadow: 0 24px 60px rgba(2, 8, 24, 0.44);
          padding: 1.1rem;
        }

        .hub-mini-assign-head {
          display: flex;
          justify-content: space-between;
          gap: 0.8rem;
          align-items: flex-start;
        }

        .hub-mini-share-head {
          display: flex;
          justify-content: space-between;
          gap: 0.8rem;
          align-items: flex-start;
        }

        .hub-mini-assign-head h3 {
          margin: 0;
          color: #eef4ff;
        }

        .hub-mini-share-head h3 {
          margin: 0;
          color: #eef4ff;
        }

        .hub-mini-assign-head p {
          margin: 0.25rem 0 0;
          color: #a9b7d1;
        }

        .hub-mini-share-head p {
          margin: 0.25rem 0 0;
          color: #a9b7d1;
        }

        .hub-mini-share-body {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 1rem;
          align-items: center;
        }

        .hub-mini-share-code {
          display: grid;
          place-items: center;
          padding: 1rem;
          border-radius: 18px;
          border: 1px solid rgba(63, 94, 155, 0.46);
          background: rgba(8, 16, 38, 0.7);
        }

        .hub-mini-share-copy {
          display: grid;
          gap: 0.7rem;
        }

        .hub-mini-share-label {
          margin: 0;
          color: #ffd56e;
          font-weight: 700;
        }

        .hub-mini-share-copy input {
          width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(103, 132, 197, 0.36);
          background: rgba(11, 18, 37, 0.95);
          color: #eef4ff;
          padding: 0.82rem 0.95rem;
          font: inherit;
          box-sizing: border-box;
        }

        .hub-mini-share-copy input:focus {
          outline: none;
          border-color: rgba(133, 183, 255, 0.72);
          box-shadow: 0 0 0 3px rgba(84, 136, 255, 0.18);
        }

        .hub-mini-share-help {
          margin: 0;
          color: #a9b7d1;
          line-height: 1.45;
        }

        .hub-mini-assign-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.85rem;
        }

        .hub-mini-field {
          display: grid;
          gap: 0.45rem;
        }

        .hub-mini-field span {
          display: block;
          color: rgba(230, 240, 255, 0.72);
          font-size: 0.86rem;
        }

        .hub-mini-field select,
        .hub-mini-field textarea {
          width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(103, 132, 197, 0.36);
          background: rgba(11, 18, 37, 0.95);
          color: #eef4ff;
          padding: 0.82rem 0.95rem;
          font: inherit;
          box-sizing: border-box;
          appearance: none;
        }

        .hub-mini-field select {
          padding-right: 2.7rem;
          background-image:
            linear-gradient(45deg, transparent 50%, #9fd0ff 50%),
            linear-gradient(135deg, #9fd0ff 50%, transparent 50%);
          background-position:
            calc(100% - 20px) calc(50% - 3px),
            calc(100% - 14px) calc(50% - 3px);
          background-size: 6px 6px, 6px 6px;
          background-repeat: no-repeat;
        }

        .hub-mini-field textarea {
          min-height: 110px;
          resize: vertical;
          line-height: 1.45;
        }

        .hub-mini-field select:focus,
        .hub-mini-field textarea:focus {
          outline: none;
          border-color: rgba(133, 183, 255, 0.72);
          box-shadow: 0 0 0 3px rgba(84, 136, 255, 0.18);
        }

        .hub-mini-assign-students {
          display: grid;
          gap: 0.5rem;
        }

        .hub-mini-field-label {
          color: #8ea5c8;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .hub-mini-assign-student-list {
          display: grid;
          gap: 0.55rem;
          max-height: 260px;
          overflow: auto;
          padding-right: 0.2rem;
        }

        .hub-mini-assign-student-item {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 0.7rem;
          align-items: center;
          border-radius: 14px;
          border: 1px solid rgba(63, 94, 155, 0.46);
          background: rgba(8, 16, 38, 0.46);
          padding: 0.75rem 0.8rem;
          color: #e6f0ff;
        }

        .hub-mini-assign-student-item em {
          color: #9fb3d5;
          font-style: normal;
          font-size: 0.88rem;
        }

        .hub-mini-assign-actions {
          display: flex;
          justify-content: flex-start;
        }

        .hub-mini-assign-actions .review-btn {
          min-width: 220px;
        }

        @media (max-width: 760px) {
          .hub-mini-assign-grid {
            grid-template-columns: 1fr;
          }

          .hub-mini-assign-head {
            flex-direction: column;
            align-items: flex-start;
          }

          .hub-mini-share-head {
            flex-direction: column;
            align-items: flex-start;
          }

          .hub-mini-share-body {
            grid-template-columns: 1fr;
          }

          .hub-mini-share-code {
            justify-self: center;
          }

          .hub-mini-assign-student-item {
            grid-template-columns: auto 1fr;
          }

          .hub-mini-assign-student-item em {
            grid-column: 2;
          }
        }

        .hub-menu-wrapper .whats-new-copy {
          min-width: 0;
        }

        .hub-menu-wrapper .whats-new-label {
          display: inline-block;
          margin-bottom: .35rem;
          padding: .2rem .55rem;
          border-radius: 999px;
          font-size: .75rem;
          font-weight: 700;
          letter-spacing: .02em;
          color: #ffcf70;
          background: rgba(255, 191, 73, 0.12);
          border: 1px solid rgba(255, 191, 73, 0.28);
        }

        .hub-menu-wrapper .whats-new-copy p {
          margin: 0;
          color: #e6f0ff;
          line-height: 1.4;
        }

        .hub-menu-wrapper .whats-new-btn {
          flex-shrink: 0;
          background: linear-gradient(180deg, #f6bd60, #e9a93f);
          color: #13213b;
          border: none;
          border-radius: 12px;
          padding: .7rem 1rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform .08s ease, box-shadow .08s ease;
        }

        .hub-menu-wrapper .whats-new-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(0,0,0,.18);
        }

        .hub-mini-browser {
          margin-bottom: 1rem;
          padding: 1rem 1.05rem;
          border-radius: 20px;
          background: linear-gradient(180deg, rgba(26,40,71,0.98), rgba(20,33,59,0.98));
          border: 2px solid #35508e;
          box-shadow: 0 10px 24px rgba(0,0,0,0.16);
        }

        .hub-mini-browser-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 0.95rem;
        }

        .hub-mini-browser-head h2 {
          margin: 0 0 0.25rem;
          color: #eef4ff;
          font-size: 1.2rem;
        }

        .hub-mini-browser-head p {
          margin: 0;
          color: rgba(238, 244, 255, 0.8);
          line-height: 1.45;
        }

        .hub-mini-count {
          flex-shrink: 0;
          padding: 0.45rem 0.7rem;
          border-radius: 999px;
          background: rgba(2, 6, 23, 0.38);
          border: 1px solid rgba(74, 107, 192, 0.5);
          color: #dbe7ff;
          font-weight: 700;
        }

        .hub-mini-filters {
          display: grid;
          gap: 0.85rem;
        }

        .hub-mini-filter-group {
          display: grid;
          gap: 0.45rem;
        }

        .hub-mini-filter-label {
          color: #ffd56e;
          font-weight: 700;
        }

        .level-row { display: flex; gap: 0.55rem; flex-wrap: wrap; }
        .level-pill {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.5rem 0.8rem;
          border-radius: 999px;
          border: 2px solid rgba(255,255,255,0.12);
          background: rgba(17, 27, 51, 0.82);
          color: #dbe7ff;
          cursor: pointer;
          font-weight: 700;
          transition: transform 0.14s ease, border-color 0.18s ease, background 0.18s ease;
        }

        .level-pill::before {
          content: "";
          width: 0.6rem;
          height: 0.6rem;
          border-radius: 999px;
          background: var(--badge-color, #8aa0ff);
          box-shadow: 0 0 0 2px rgba(255,255,255,0.08);
        }

        .level-pill input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }

        .level-pill.selected {
          border-color: color-mix(in srgb, var(--badge-color, #8aa0ff) 78%, white 22%);
          background: rgba(32, 48, 84, 0.96);
          color: #f8fbff;
          transform: translateY(-1px);
        }

        .hub-mini-search-row {
          display: flex;
          gap: 0.7rem;
          align-items: center;
        }

        .hub-mini-search {
          width: 100%;
          min-width: 0;
          padding: 0.8rem 0.95rem;
          border-radius: 14px;
          border: 1px solid #3b4f7e;
          background: #020617;
          color: #f8fafc;
          font-size: 1rem;
        }

        .hub-mini-clear {
          flex-shrink: 0;
          padding: 0.8rem 0.95rem;
          border-radius: 12px;
          border: 1px solid rgba(74, 107, 192, 0.55);
          background: rgba(2, 6, 23, 0.42);
          color: #eef4ff;
          font-weight: 700;
          cursor: pointer;
        }

        .hub-menu-wrapper .menu-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }

        .hub-menu-wrapper .menu-card {
          text-align: left;
          background: #1a2847;
          border: 2px solid #35508e;
          border-radius: 22px;
          padding: 1.45rem 1.5rem;
          color: #eef4ff;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16);
          transition: transform .16s ease, border-color .16s ease, box-shadow .16s ease;
        }

        .hub-menu-wrapper .menu-card:hover {
          transform: translateY(-2px);
          border-color: #4a6bc0;
          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.2);
        }

        .hub-menu-wrapper .menu-card.is-completed {
          background: linear-gradient(180deg, rgba(31, 52, 88, 0.98), rgba(22, 39, 70, 0.98));
          border-color: rgba(91, 193, 145, 0.42);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16), inset 0 1px 0 rgba(126, 240, 194, 0.06);
        }

        .hub-mini-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 0.55rem;
        }

        .hub-mini-complete {
          flex-shrink: 0;
          width: 1.8rem;
          height: 1.8rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          border: 1px solid rgba(126, 240, 194, 0.3);
          background: rgba(126, 240, 194, 0.12);
          color: #bbf7d0;
          font-size: 0.95rem;
          font-weight: 900;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .hub-mini-card-levels {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-bottom: 0.7rem;
        }

        .hub-menu-wrapper .cefr-badge {
          position: static;
          top: auto;
          right: auto;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.32rem 0.6rem;
          border-radius: 999px;
          border: 1px solid color-mix(in srgb, var(--badge-color, #8aa0ff) 52%, transparent);
          background: rgba(20, 30, 56, 0.82);
          color: #eef4ff;
          font-size: 0.82rem;
          font-weight: 800;
          line-height: 1;
        }

        .hub-menu-wrapper .cefr-badge::before {
          content: "";
          width: 0.55rem;
          height: 0.55rem;
          border-radius: 999px;
          background: var(--badge-color, #8aa0ff);
          box-shadow: 0 0 0 2px rgba(255,255,255,0.08);
        }

        .hub-menu-wrapper .menu-card h3 {
          margin: 0;
          color: #eef4ff;
          font-size: 1.15rem;
          line-height: 1.2;
        }

        .hub-menu-wrapper .menu-card p {
          margin: 0;
          color: rgba(238, 244, 255, 0.88);
          font-size: 1rem;
          line-height: 1.45;
        }

        .hub-mini-empty {
          margin-top: 1rem;
          padding: 1rem 1.05rem;
          border-radius: 18px;
          background: rgba(17, 24, 39, 0.5);
          border: 1px solid rgba(74, 107, 192, 0.35);
          color: #dbe7ff;
        }

        .hub-mini-empty strong {
          display: block;
          margin-bottom: 0.25rem;
          color: #eef4ff;
        }

        .hub-mini-empty p {
          margin: 0;
        }

        @media (max-width: 720px) {
          .hub-menu-wrapper .whats-new-banner {
            flex-direction: column;
            align-items: flex-start;
          }

          .hub-menu-wrapper .whats-new-btn {
            width: 100%;
          }

          .hub-mini-browser-head {
            flex-direction: column;
          }

          .hub-mini-search-row {
            flex-direction: column;
            align-items: stretch;
          }

          .hub-menu-wrapper .menu-grid {
            grid-template-columns: 1fr;
          }

          .hub-mini-card-levels {
            margin-bottom: 0.65rem;
          }
        }
      `}</style>
    </div>
  );
}
