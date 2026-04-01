import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import {
  db,
  fetchHubGrammarSubmissions,
  fetchWritingP2Submissions,
  fetchWritingP3Submissions,
  fetchWritingP4Submissions,
} from "../../firebase";

function timestampToMs(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (value.seconds) return value.seconds * 1000;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDate(value) {
  const ms = timestampToMs(value);
  if (!ms) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(ms);
}

function formatRelative(value) {
  const ms = timestampToMs(value);
  if (!ms) return "No recent activity";
  const diffMs = Date.now() - ms;
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) === 1 ? "" : "s"} ago`;
  return formatDate(value);
}

function buildActivitySummary(studentId, attemptStats, submissionBundle) {
  const attemptMeta = attemptStats[studentId] || null;
  const latestWriting = [submissionBundle?.part2, submissionBundle?.part3, submissionBundle?.part4]
    .filter(Boolean)
    .sort((a, b) => timestampToMs(b.createdAt) - timestampToMs(a.createdAt))[0] || null;
  const latestGrammar = submissionBundle?.grammar || null;
  const latestAttemptAt = attemptMeta?.latestSubmittedAt || null;

  const candidates = [
    latestWriting
      ? {
          kind: `Writing ${latestWriting.partLabel}`,
          createdAt: latestWriting.createdAt,
          detail:
            latestWriting.partLabel === "P2"
              ? `${latestWriting.counts?.answer || 0} words`
              : latestWriting.partLabel === "P3"
                ? `${(latestWriting.counts || []).join(" / ")} words`
                : `${latestWriting.counts?.friend || 0} + ${latestWriting.counts?.formal || 0} words`,
        }
      : null,
    latestGrammar
      ? {
          kind: latestGrammar.activityTitle || "Hub grammar",
          createdAt: latestGrammar.createdAt,
          detail:
            latestGrammar.total != null && latestGrammar.correct != null
              ? `${latestGrammar.correct}/${latestGrammar.total}`
              : latestGrammar.score != null
                ? `${latestGrammar.score}%`
                : "Completed",
        }
      : null,
    latestAttemptAt
      ? {
          kind: "Teacher quiz",
          createdAt: latestAttemptAt,
          detail:
            attemptMeta?.count > 0
              ? `${attemptMeta.count} attempt${attemptMeta.count === 1 ? "" : "s"}`
              : "",
        }
      : null,
  ].filter(Boolean);

  const latestActivity = candidates.sort((a, b) => timestampToMs(b.createdAt) - timestampToMs(a.createdAt))[0] || null;

  return {
    latestWriting,
    latestGrammar,
    latestActivity,
  };
}

export default function MyStudents({ user }) {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attemptStats, setAttemptStats] = useState({});
  const [submissionStats, setSubmissionStats] = useState({});
  const [rosterMeta, setRosterMeta] = useState({});
  const [classDrafts, setClassDrafts] = useState({});
  const [savingStudentId, setSavingStudentId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return <p>⛔ Only teachers and admins can view this page.</p>;
  }

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);

      const usersCol = collection(db, "users");
      const studentQuery = query(usersCol, where("teacherId", "==", user.uid));
      const [studentSnap, rosterSnap, attemptsSnap] = await Promise.all([
        getDocs(studentQuery),
        getDocs(collection(db, "users", user.uid, "studentRoster")),
        getDocs(query(collection(db, "grammarSetAttempts"), where("ownerUid", "==", user.uid))),
      ]);

      if (!alive) return;

      const studentRows = studentSnap.docs.map((entry) => ({
        id: entry.id,
        ...entry.data(),
      }));

      const nextRosterMeta = {};
      rosterSnap.forEach((entry) => {
        nextRosterMeta[entry.id] = entry.data() || {};
      });

      const nextAttemptStats = {};
      attemptsSnap.forEach((entry) => {
        const data = entry.data() || {};
        const studentUid = data.studentUid;
        if (!studentUid) return;

        if (!nextAttemptStats[studentUid]) {
          nextAttemptStats[studentUid] = {
            count: 0,
            totalPercent: 0,
            avgPercent: 0,
            latestSubmittedAt: null,
          };
        }

        nextAttemptStats[studentUid].count += 1;
        nextAttemptStats[studentUid].totalPercent += Number(data.percent || 0);

        const currentLatest = timestampToMs(nextAttemptStats[studentUid].latestSubmittedAt);
        const candidateLatest = data.updatedAt || data.submittedAt || null;
        if (timestampToMs(candidateLatest) > currentLatest) {
          nextAttemptStats[studentUid].latestSubmittedAt = candidateLatest;
        }
      });

      Object.keys(nextAttemptStats).forEach((studentUid) => {
        const row = nextAttemptStats[studentUid];
        row.avgPercent = row.count > 0 ? Math.round(row.totalPercent / row.count) : 0;
      });

      setStudents(studentRows);
      setRosterMeta(nextRosterMeta);
      setClassDrafts(
        studentRows.reduce((acc, studentRow) => {
          acc[studentRow.id] = nextRosterMeta[studentRow.id]?.className || "";
          return acc;
        }, {})
      );
      setAttemptStats(nextAttemptStats);

      const statsEntries = await Promise.all(
        studentRows.map(async (studentRow) => {
          const [part2, part3, part4, grammar] = await Promise.all([
            fetchWritingP2Submissions(1, studentRow.id),
            fetchWritingP3Submissions(1, studentRow.id),
            fetchWritingP4Submissions(1, studentRow.id),
            fetchHubGrammarSubmissions(1, studentRow.id),
          ]);

          return [
            studentRow.id,
            {
              part2: part2[0] ? { ...part2[0], partLabel: "P2" } : null,
              part3: part3[0] ? { ...part3[0], partLabel: "P3" } : null,
              part4: part4[0] ? { ...part4[0], partLabel: "P4" } : null,
              grammar: grammar[0] || null,
            },
          ];
        })
      );

      if (!alive) return;
      setSubmissionStats(Object.fromEntries(statsEntries));
      setLoading(false);
    }

    load().catch((error) => {
      console.error("Error loading students:", error);
      if (alive) setLoading(false);
    });

    return () => {
      alive = false;
    };
  }, [user.uid]);

  async function saveClassName(studentId) {
    setSavingStudentId(studentId);
    const nextClassName = (classDrafts[studentId] || "").trim();

    try {
      await setDoc(
        doc(db, "users", user.uid, "studentRoster", studentId),
        {
          className: nextClassName,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setRosterMeta((prev) => ({
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          className: nextClassName,
        },
      }));
    } catch (error) {
      console.error("[MyStudents] Could not save class name", error);
      window.alert("Could not save that class name.");
    } finally {
      setSavingStudentId("");
    }
  }

  const classOptions = useMemo(() => {
    const values = new Set();
    Object.values(rosterMeta).forEach((meta) => {
      if (meta?.className) values.add(meta.className);
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [rosterMeta]);

  const hydratedStudents = useMemo(() => {
    return students.map((studentRow) => {
      const meta = rosterMeta[studentRow.id] || {};
      const summary = buildActivitySummary(studentRow.id, attemptStats, submissionStats[studentRow.id] || {});
      return {
        ...studentRow,
        className: meta.className || "",
        attemptMeta: attemptStats[studentRow.id] || { count: 0, avgPercent: 0, latestSubmittedAt: null },
        activitySummary: summary,
      };
    });
  }, [students, rosterMeta, attemptStats, submissionStats]);

  const filteredStudents = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();

    const result = hydratedStudents.filter((studentRow) => {
      const label = studentRow.displayName || studentRow.name || studentRow.username || studentRow.email || studentRow.id;
      const matchesSearch =
        !needle ||
        label.toLowerCase().includes(needle) ||
        (studentRow.email || "").toLowerCase().includes(needle) ||
        (studentRow.className || "").toLowerCase().includes(needle);

      const matchesClass = classFilter === "all" || (studentRow.className || "") === classFilter;
      return matchesSearch && matchesClass;
    });

    result.sort((a, b) => {
      if (sortBy === "name") {
        const aLabel = a.displayName || a.name || a.username || a.email || a.id;
        const bLabel = b.displayName || b.name || b.username || b.email || b.id;
        return aLabel.localeCompare(bLabel);
      }

      if (sortBy === "joined") {
        return timestampToMs(b.createdAt) - timestampToMs(a.createdAt);
      }

      if (sortBy === "grammar") {
        return (b.attemptMeta?.count || 0) - (a.attemptMeta?.count || 0);
      }

      return (
        timestampToMs(b.activitySummary?.latestActivity?.createdAt) -
        timestampToMs(a.activitySummary?.latestActivity?.createdAt)
      );
    });

    return result;
  }, [classFilter, hydratedStudents, searchTerm, sortBy]);

  const summary = useMemo(() => {
    const recentThreshold = Date.now() - 14 * 86400000;
    const activeCount = hydratedStudents.filter(
      (studentRow) => timestampToMs(studentRow.activitySummary?.latestActivity?.createdAt) >= recentThreshold
    ).length;
    const writingCount = hydratedStudents.filter((studentRow) => studentRow.activitySummary?.latestWriting).length;
    return {
      total: hydratedStudents.length,
      activeCount,
      writingCount,
    };
  }, [hydratedStudents]);

  return (
    <div className="my-students-page">
      <div className="my-students-topbar">
        <button className="review-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <header className="my-students-hero">
        <h1>My students</h1>
        <p>
          Organise your learners, add simple class labels, and keep an eye on recent grammar and writing activity in
          one place.
        </p>
      </header>

      <section className="my-students-summary">
        <div className="my-students-stat">
          <span>Total students</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="my-students-stat">
          <span>Active in last 14 days</span>
          <strong>{summary.activeCount}</strong>
        </div>
        <div className="my-students-stat">
          <span>Students with writing</span>
          <strong>{summary.writingCount}</strong>
        </div>
      </section>

      <section className="my-students-controls">
        <label className="field">
          <span>Search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, email, or class"
          />
        </label>

        <label className="field">
          <span>Class</span>
          <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
            <option value="all">All classes</option>
            {classOptions.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Sort by</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="recent">Recent activity</option>
            <option value="joined">Newest students</option>
            <option value="name">Name</option>
            <option value="grammar">Grammar attempts</option>
          </select>
        </label>
      </section>

      {loading && <p className="muted">Loading students…</p>}

      {!loading && students.length === 0 && (
        <p className="muted">
          No students are linked to you yet. An admin can assign students to you from the Admin Dashboard.
        </p>
      )}

      {!loading && filteredStudents.length > 0 && (
        <div className="my-students-list">
          {filteredStudents.map((studentRow) => {
            const label =
              studentRow.displayName || studentRow.name || studentRow.username || studentRow.email || studentRow.id;
            const latestActivity = studentRow.activitySummary?.latestActivity;
            const latestWriting = studentRow.activitySummary?.latestWriting;
            const latestGrammar = studentRow.activitySummary?.latestGrammar;
            const isSaving = savingStudentId === studentRow.id;

            return (
              <article key={studentRow.id} className="student-card">
                <div className="student-card-head">
                  <div className="student-identity">
                    <h3>{label}</h3>
                    <p>{studentRow.email || "No email on file"}</p>
                    {studentRow.username ? <span className="student-handle">@{studentRow.username}</span> : null}
                  </div>

                  <div className="student-chip-row">
                    {studentRow.className ? <span className="student-chip is-class">{studentRow.className}</span> : null}
                    <span className={`student-chip ${latestActivity ? "is-active" : ""}`}>
                      {latestActivity ? formatRelative(latestActivity.createdAt) : "No recent activity"}
                    </span>
                  </div>
                </div>

                <div className="student-row-main">
                  <div className="student-meta-grid">
                    <div className="student-meta">
                      <span>Joined</span>
                      <strong>{formatDate(studentRow.createdAt)}</strong>
                    </div>
                    <div className="student-meta">
                      <span>Grammar sets</span>
                      <strong>
                        {studentRow.attemptMeta.count}
                        {studentRow.attemptMeta.count ? ` · avg ${studentRow.attemptMeta.avgPercent}%` : ""}
                      </strong>
                    </div>
                    <div className="student-meta">
                      <span>Latest activity</span>
                      <strong>{latestActivity ? latestActivity.kind : "No activity yet"}</strong>
                    </div>
                  </div>

                  <div className="student-activity-panel">
                    <div>
                      <span className="panel-label">Recent writing</span>
                      <p>
                        {latestWriting
                          ? `${latestWriting.partLabel} · ${formatRelative(latestWriting.createdAt)}`
                          : "No writing submitted yet"}
                      </p>
                    </div>
                    <div>
                      <span className="panel-label">Recent grammar</span>
                      <p>
                        {latestGrammar
                          ? `${latestGrammar.activityTitle || "Hub grammar"} · ${formatRelative(latestGrammar.createdAt)}`
                          : "No grammar activity yet"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="student-row-side">
                  <div className="student-class-editor">
                    <label className="field grow">
                      <span>Class label</span>
                      <input
                        type="text"
                        value={classDrafts[studentRow.id] || ""}
                        onChange={(event) =>
                          setClassDrafts((prev) => ({
                            ...prev,
                            [studentRow.id]: event.target.value,
                          }))
                        }
                        placeholder="e.g. Tuesday B1 evening"
                      />
                    </label>

                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={() => saveClassName(studentRow.id)}
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Save class"}
                    </button>
                  </div>

                  <div className="student-card-actions">
                    <button
                      type="button"
                      className="review-btn"
                      onClick={() => navigate(`/teacher/student/${studentRow.id}`)}
                    >
                      View profile
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && students.length > 0 && filteredStudents.length === 0 && (
        <p className="muted">No students match the current search and class filter.</p>
      )}

      <style>{`
        .my-students-page {
          max-width: 1100px;
          margin: 0 auto;
        }

        .my-students-topbar {
          margin-bottom: 0.9rem;
        }

        .my-students-hero {
          margin-bottom: 1rem;
        }

        .my-students-hero h1 {
          margin: 0 0 0.4rem;
          color: #eef4ff;
        }

        .my-students-hero p {
          margin: 0;
          color: rgba(230, 240, 255, 0.8);
          line-height: 1.55;
          max-width: 760px;
        }

        .my-students-summary,
        .my-students-controls {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.9rem;
          margin-bottom: 1rem;
        }

        .my-students-stat,
        .my-students-controls,
        .student-card {
          background: rgba(20, 33, 59, 0.9);
          border: 1px solid rgba(77, 110, 184, 0.38);
          border-radius: 18px;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.14);
        }

        .my-students-stat {
          padding: 1rem 1.1rem;
        }

        .my-students-stat span,
        .field span,
        .panel-label {
          display: block;
          color: rgba(230, 240, 255, 0.7);
          font-size: 0.86rem;
          margin-bottom: 0.35rem;
        }

        .my-students-stat strong {
          color: #eef4ff;
          font-size: 1.8rem;
        }

        .my-students-controls {
          padding: 1rem 1.1rem;
          align-items: end;
        }

        .field {
          display: grid;
          gap: 0.45rem;
        }

        .field input,
        .field select {
          width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(103, 132, 197, 0.36);
          background: rgba(11, 18, 37, 0.95);
          color: #eef4ff;
          padding: 0.82rem 0.95rem;
        }

        .my-students-list {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }

        .student-card {
          padding: 0;
          overflow: hidden;
        }

        .student-card-head {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: center;
          padding: 1rem 1.1rem;
          border-bottom: 1px solid rgba(39, 64, 111, 0.8);
        }

        .student-identity {
          min-width: 0;
        }

        .student-card-head h3 {
          margin: 0 0 0.22rem;
          color: #eef4ff;
        }

        .student-card-head p {
          margin: 0;
          color: rgba(230, 240, 255, 0.72);
        }

        .student-handle {
          display: inline-block;
          margin-top: 0.35rem;
          color: #93b5ff;
          font-size: 0.88rem;
        }

        .student-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          justify-content: flex-end;
          align-items: center;
        }

        .student-chip {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 0.42rem 0.72rem;
          font-size: 0.78rem;
          font-weight: 800;
          border: 1px solid rgba(110, 140, 204, 0.34);
          color: #e7f0ff;
          background: rgba(34, 51, 88, 0.95);
        }

        .student-chip.is-class {
          color: #16233f;
          background: linear-gradient(180deg, #f6bd60, #e9a93f);
          border-color: rgba(245, 193, 90, 0.95);
        }

        .student-chip.is-active {
          background: rgba(31, 83, 62, 0.9);
          border-color: rgba(111, 223, 169, 0.34);
          color: #d5ffe8;
        }

        .student-row-main,
        .student-row-side {
          padding: 1rem 1.1rem 1.1rem;
        }

        .student-row-main {
          display: grid;
          grid-template-columns: minmax(260px, 0.95fr) minmax(280px, 1.05fr);
          gap: 1rem;
          border-bottom: 1px solid rgba(39, 64, 111, 0.55);
        }

        .student-meta-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.8rem;
        }

        .student-meta {
          background: rgba(11, 18, 37, 0.65);
          border: 1px solid rgba(108, 136, 199, 0.18);
          border-radius: 16px;
          padding: 0.8rem 0.9rem;
        }

        .student-meta strong {
          color: #eef4ff;
          font-size: 0.95rem;
        }

        .student-activity-panel {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.8rem;
          background: rgba(11, 18, 37, 0.48);
          border: 1px solid rgba(108, 136, 199, 0.18);
          border-radius: 16px;
          padding: 0.9rem;
        }

        .student-activity-panel p {
          margin: 0;
          color: rgba(230, 240, 255, 0.9);
          line-height: 1.45;
        }

        .student-row-side {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 1rem;
        }

        .student-class-editor {
          display: flex;
          gap: 0.7rem;
          align-items: end;
          flex: 1;
        }

        .student-class-editor .grow {
          flex: 1;
        }

        .student-card-actions {
          display: flex;
          justify-content: flex-end;
          flex-shrink: 0;
        }

        @media (max-width: 900px) {
          .my-students-summary,
          .my-students-controls,
          .student-meta-grid,
          .student-activity-panel {
            grid-template-columns: 1fr;
          }

          .student-row-main {
            grid-template-columns: 1fr;
          }

          .student-card-head,
          .student-row-side,
          .student-class-editor {
            flex-direction: column;
            align-items: stretch;
          }

          .student-chip-row {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
