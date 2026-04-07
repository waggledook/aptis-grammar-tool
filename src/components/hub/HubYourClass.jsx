import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSitePath } from "../../siteConfig.js";
import {
  fetchHubGrammarSubmissions,
  fetchWritingP1Sessions,
  fetchWritingP2Submissions,
  fetchWritingP3Submissions,
  fetchWritingP4Submissions,
  listAssignedActivitiesForStudent,
  listGrammarSetAttemptsForStudent,
  listStudentCourseTestAttempts,
  listStudentCourseTestSessions,
} from "../../firebase";

function timestampToDate(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateTime(value) {
  const date = timestampToDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function timestampToMs(value) {
  return timestampToDate(value)?.getTime?.() || 0;
}

function getSessionState(session) {
  const now = Date.now();
  const startsAt = timestampToDate(session?.startsAt)?.getTime() || 0;
  const endsAt = timestampToDate(session?.endsAt)?.getTime() || 0;

  if ((session?.status || "").toLowerCase() === "closed") return "closed";
  if (startsAt && now < startsAt) return "scheduled";
  if (endsAt && now > endsAt) return "closed";
  return "open";
}

function getControlMode(session) {
  return session?.controlMode === "self-controlled" ? "self-controlled" : "teacher-controlled";
}

function getAssignmentTypeLabel(type) {
  switch (type) {
    case "mini-test":
      return "Mini test";
    case "grammar-set":
      return "Aptis grammar set";
    case "use-of-english":
      return "Use of English set";
    case "writing":
      return "Writing task";
    default:
      return "Assigned activity";
  }
}

function getWritingBucket(type) {
  if (type === "writing-part-1") return "p1";
  if (type === "writing-part-2") return "p2";
  if (type === "writing-part-3") return "p3";
  if (type === "writing-part-4") return "p4";
  return "";
}

function buildLatestTimeMap(items, keyName) {
  return (items || []).reduce((acc, item) => {
    const key = item?.[keyName];
    if (!key) return acc;
    const nextTime = timestampToMs(item.createdAt || item.updatedAt || item.submittedAt || item.startedAt);
    if (!acc[key] || nextTime > acc[key]) acc[key] = nextTime;
    return acc;
  }, {});
}

function resolveAssignedCompletion(assignment, sources) {
  const assignedAt = timestampToMs(assignment?.createdAt);
  if (assignment?.activityType === "mini-test") {
    const completedAt = sources.miniTests?.[assignment.activityId] || 0;
    return completedAt >= assignedAt ? { completed: true, completedAt } : { completed: false, completedAt: 0 };
  }

  if (assignment?.activityType === "grammar-set" || assignment?.activityType === "use-of-english") {
    const completedAt = sources.grammarSets?.[assignment.activityId] || 0;
    return completedAt >= assignedAt ? { completed: true, completedAt } : { completed: false, completedAt: 0 };
  }

  if (assignment?.activityType === "writing") {
    const bucket = getWritingBucket(assignment.activityId);
    const completedAt = sources.writing?.[bucket] || 0;
    return completedAt >= assignedAt ? { completed: true, completedAt } : { completed: false, completedAt: 0 };
  }

  return { completed: false, completedAt: 0 };
}

export default function HubYourClass({ user }) {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attemptsBySessionId, setAttemptsBySessionId] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!user) {
        setSessions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [rows, attempts, assignedRows, miniTests, grammarAttempts, p1, p2, p3, p4] = await Promise.all([
          listStudentCourseTestSessions(user.uid),
          listStudentCourseTestAttempts(user.uid),
          listAssignedActivitiesForStudent(user.uid),
          fetchHubGrammarSubmissions(200, user.uid),
          listGrammarSetAttemptsForStudent(user.uid),
          fetchWritingP1Sessions(100, user.uid),
          fetchWritingP2Submissions(100, user.uid),
          fetchWritingP3Submissions(100, user.uid),
          fetchWritingP4Submissions(100, user.uid),
        ]);
        if (!alive) return;
        setSessions(rows || []);
        const completionSources = {
          miniTests: buildLatestTimeMap(miniTests || [], "activityId"),
          grammarSets: (grammarAttempts || []).reduce((acc, attempt) => {
            if (!attempt?.setId) return acc;
            if (!attempt.completed && !attempt.submittedAt) return acc;
            const nextTime = timestampToMs(attempt.submittedAt || attempt.updatedAt || attempt.startedAt);
            if (!acc[attempt.setId] || nextTime > acc[attempt.setId]) acc[attempt.setId] = nextTime;
            return acc;
          }, {}),
          writing: {
            p1: Math.max(0, ...(p1 || []).map((entry) => timestampToMs(entry.createdAt))),
            p2: Math.max(0, ...(p2 || []).map((entry) => timestampToMs(entry.createdAt))),
            p3: Math.max(0, ...(p3 || []).map((entry) => timestampToMs(entry.createdAt))),
            p4: Math.max(0, ...(p4 || []).map((entry) => timestampToMs(entry.createdAt))),
          },
        };
        setAssignments(
          (assignedRows || []).map((assignment) => ({
            ...assignment,
            completion: resolveAssignedCompletion(assignment, completionSources),
          }))
        );
        setAttemptsBySessionId(
          (attempts || []).reduce((acc, attempt) => {
            if (attempt?.sessionId && !acc[attempt.sessionId]) acc[attempt.sessionId] = attempt;
            return acc;
          }, {})
        );
      } catch (error) {
        console.error("[HubYourClass] load failed", error);
        if (alive) {
          setSessions([]);
          setAssignments([]);
          setAttemptsBySessionId({});
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [user]);

  const grouped = useMemo(() => {
    const open = [];
    const scheduled = [];
    const closed = [];

    for (const session of sessions) {
      const bucket = getSessionState(session);
      if (bucket === "open") open.push(session);
      else if (bucket === "scheduled") scheduled.push(session);
      else closed.push(session);
    }

    return { open, scheduled, closed };
  }, [sessions]);

  const assignmentGroups = useMemo(() => {
    const pending = [];
    const completed = [];

    for (const assignment of assignments) {
      if (assignment?.completion?.completed) completed.push(assignment);
      else pending.push(assignment);
    }

    return { pending, completed };
  }, [assignments]);

  if (!user) {
    return (
      <div className="menu-wrapper hub-class-wrapper">
        <div className="hub-class-shell">
          <div className="hub-class-topbar">
            <button className="review-btn" onClick={() => navigate(getSitePath("/"))}>
              ← Back to hub
            </button>
          </div>
          <section className="hub-class-panel">
          <h1 className="hub-class-title">Your Class</h1>
          <p className="hub-class-copy">Sign in to see teacher-assigned activities, tests, and class work here.</p>
          </section>
        </div>
        <HubYourClassStyles />
      </div>
    );
  }

  return (
    <div className="menu-wrapper hub-class-wrapper">
      <div className="hub-class-shell">
        <div className="hub-class-topbar">
          <button className="review-btn" onClick={() => navigate(getSitePath("/"))}>
            ← Back to hub
          </button>
        </div>

        <header className="hub-class-hero">
          <span className="hub-class-kicker">Student dashboard</span>
          <h1 className="hub-class-title">Your Class</h1>
          <p className="hub-class-copy">
            This is where your teacher can assign work across the site. Completed activities are marked automatically
            once you finish them.
          </p>
        </header>

        <section className="hub-class-panel">
          <div className="hub-class-panel-head">
            <div>
              <h2>Assigned activities</h2>
              <p>Mini tests, grammar sets, Use of English sets, and writing tasks from your teacher.</p>
            </div>
            <span className="hub-class-count">{assignments.length}</span>
          </div>

          {loading ? (
            <p className="hub-class-empty">Loading assigned activities…</p>
          ) : !assignments.length ? (
            <p className="hub-class-empty">No assigned activities yet.</p>
          ) : (
            <div className="hub-class-groups">
              <HubAssignmentGroup title="To do" assignments={assignmentGroups.pending} navigate={navigate} />
              <HubAssignmentGroup title="Completed" assignments={assignmentGroups.completed} navigate={navigate} />
            </div>
          )}
        </section>

        <section className="hub-class-panel">
          <div className="hub-class-panel-head">
            <div>
              <h2>Assigned tests</h2>
              <p>Course-test sessions created by your teacher.</p>
            </div>
            <span className="hub-class-count">{sessions.length}</span>
          </div>

          {loading ? (
            <p className="hub-class-empty">Loading assigned tests…</p>
          ) : !sessions.length ? (
            <p className="hub-class-empty">
              No assigned tests yet. When your teacher sets one up, it will appear here.
            </p>
          ) : (
            <div className="hub-class-groups">
              <HubSessionGroup title="Open now" sessions={grouped.open} state="open" navigate={navigate} attemptsBySessionId={attemptsBySessionId} />
              <HubSessionGroup title="Scheduled" sessions={grouped.scheduled} state="scheduled" navigate={navigate} attemptsBySessionId={attemptsBySessionId} />
              <HubSessionGroup title="Closed" sessions={grouped.closed} state="closed" navigate={navigate} attemptsBySessionId={attemptsBySessionId} />
            </div>
          )}
        </section>
      </div>

      <HubYourClassStyles />
    </div>
  );
}

function HubAssignmentGroup({ title, assignments, navigate }) {
  if (!assignments.length) return null;

  return (
    <div className="hub-class-group">
      <div className="hub-class-group-head">
        <h3>{title}</h3>
        <span>{assignments.length}</span>
      </div>

      <div className="hub-class-session-list">
        {assignments.map((assignment) => (
          <HubAssignmentCard key={assignment.id} assignment={assignment} navigate={navigate} />
        ))}
      </div>
    </div>
  );
}

function HubAssignmentCard({ assignment, navigate }) {
  const isCompleted = !!assignment?.completion?.completed;
  const completedAt = assignment?.completion?.completedAt
    ? new Date(assignment.completion.completedAt)
    : null;

  return (
    <article className="hub-class-session-card">
      <div className="hub-class-session-head">
        <div>
          <h4>{assignment.activityLabel || "Assigned activity"}</h4>
          <p>
            {getAssignmentTypeLabel(assignment.activityType)} · {assignment.teacherName || assignment.teacherEmail || "Teacher"}
          </p>
        </div>
        <span className={`hub-class-state ${isCompleted ? "is-open" : "is-scheduled"}`}>
          {isCompleted ? "completed" : "assigned"}
        </span>
      </div>

      <div className="hub-class-session-meta">
        <div>
          <span>Assigned</span>
          <p>{formatDateTime(assignment.createdAt)}</p>
        </div>
        <div>
          <span>Status</span>
          <p>{isCompleted ? "Completed" : "Not completed yet"}</p>
        </div>
        <div>
          <span>Completed</span>
          <p>{completedAt ? formatDateTime(completedAt) : "—"}</p>
        </div>
      </div>

      {assignment.notes ? (
        <div className="hub-class-session-note">
          <span>Teacher notes</span>
          <p>{assignment.notes}</p>
        </div>
      ) : null}

      <div className="hub-class-session-actions">
        <button
          className="review-btn"
          type="button"
          onClick={() => navigate(assignment.routePath || getSitePath("/"))}
        >
          {isCompleted ? "Open again" : "Start activity"}
        </button>
      </div>
    </article>
  );
}

function HubSessionGroup({ title, sessions, state, navigate, attemptsBySessionId }) {
  if (!sessions.length) return null;

  return (
    <div className="hub-class-group">
      <div className="hub-class-group-head">
        <h3>{title}</h3>
        <span>{sessions.length}</span>
      </div>

      <div className="hub-class-session-list">
        {sessions.map((session) => (
          <HubSessionCard
            key={session.id}
            session={session}
            state={state}
            navigate={navigate}
            attempt={attemptsBySessionId?.[session.id] || null}
          />
        ))}
      </div>
    </div>
  );
}

function HubSessionCard({ session, state, navigate, attempt }) {
  const controlMode = getControlMode(session);
  const mainPaperState = session?.mainPaperState || (controlMode === "self-controlled" ? "open" : "locked");
  const listeningState = session?.listeningState || (controlMode === "self-controlled" ? "open" : "locked");
  const attemptStatus = attempt?.completed || attempt?.submittedAt
    ? attempt.reviewStatus === "reviewed"
      ? "reviewed"
      : "submitted"
    : attempt
      ? "in-progress"
      : "not-started";

  return (
    <article className="hub-class-session-card">
      <div className="hub-class-session-head">
        <div>
          <h4>{session.templateTitle || "Course test session"}</h4>
          <p>
            {(session.testKind === "end-of-course" ? "End-of-course test" : "Progress test")} ·{" "}
            {(session.level || "b1").toUpperCase()} ·{" "}
            {controlMode === "self-controlled" ? "Self-controlled" : "Teacher-controlled"}
          </p>
        </div>
        <span className={`hub-class-state is-${state}`}>{state}</span>
      </div>

      <div className="hub-class-session-meta">
        <div>
          <span>Teacher</span>
          <p>{session.teacherName || session.teacherEmail || "Your teacher"}</p>
        </div>
        <div>
          <span>Class</span>
          <p>{session.className || "—"}</p>
        </div>
        <div>
          <span>PIN</span>
          <p>{session.requirePin ? session.accessPin || "Required" : "Not needed"}</p>
        </div>
      </div>

      <div className="hub-class-session-meta">
        <div>
          <span>Available from</span>
          <p>{formatDateTime(session.startsAt)}</p>
        </div>
        <div>
          <span>Available until</span>
          <p>{formatDateTime(session.endsAt)}</p>
        </div>
        <div>
          <span>Status</span>
          <p>
            {attemptStatus === "reviewed"
              ? "Reviewed"
              : attemptStatus === "submitted"
                ? "Submitted"
                : attemptStatus === "in-progress"
                  ? "In progress"
                  : state === "open"
                    ? "Ready to take"
                    : state === "scheduled"
                      ? "Not open yet"
                      : "Window ended"}
          </p>
        </div>
      </div>

      <div className="hub-class-session-meta">
        <div>
          <span>Main paper</span>
          <p>{mainPaperState}</p>
        </div>
        <div>
          <span>Listening</span>
          <p>{listeningState}</p>
        </div>
        <div>
          <span>Mode</span>
          <p>{controlMode === "self-controlled" ? "Self-controlled" : "Teacher-controlled"}</p>
        </div>
      </div>

      {attempt ? (
        <div className="hub-class-session-note">
          <span>Result</span>
          <p>
          {attempt.completed || attempt.submittedAt
            ? attempt.reviewStatus === "reviewed"
              ? `${attempt.teacherScore ?? 0}/${attempt.teacherTotal ?? 0} · ${attempt.finalPercent ?? 0}%`
              : `${attempt.percent ?? 0}% provisional · Awaiting teacher review`
              : controlMode === "teacher-controlled" && attempt?.runnerState?.mainPaperSubmittedAt && listeningState !== "open"
                ? "Main paper submitted. Waiting for your teacher to open listening."
                : "Draft saved. You can resume this test session."}
          </p>
        </div>
      ) : null}

      {session.notes ? (
        <div className="hub-class-session-note">
          <span>Teacher notes</span>
          <p>{session.notes}</p>
        </div>
      ) : null}

      <div className="hub-class-session-actions">
        <button
          className="review-btn"
          type="button"
          onClick={() => navigate(getSitePath(`/your-class/tests/${session.id}`))}
        >
          {attempt?.completed
            ? "View results"
            : attempt
              ? "Resume test session"
              : state === "open" && controlMode === "teacher-controlled" && mainPaperState !== "open"
                ? "Waiting for teacher"
                : state === "open"
                ? "Open test session"
                : state === "scheduled"
                  ? "View session"
                  : "Review session"}
        </button>
      </div>
    </article>
  );
}

function HubYourClassStyles() {
  return (
    <style>{`
      .hub-class-wrapper {
        width: min(1080px, 100%);
      }

      .hub-class-shell {
        display: grid;
        gap: 1rem;
      }

      .hub-class-topbar {
        display: flex;
        justify-content: flex-start;
      }

      .hub-class-hero,
      .hub-class-panel {
        border-radius: 20px;
        border: 1px solid rgba(70, 102, 170, 0.42);
        background:
          linear-gradient(180deg, rgba(11, 21, 48, 0.98), rgba(14, 28, 63, 0.96));
        box-shadow: 0 24px 60px rgba(2, 8, 24, 0.38);
      }

      .hub-class-hero {
        padding: 1.35rem 1.45rem;
      }

      .hub-class-panel {
        padding: 1.2rem;
      }

      .hub-class-kicker {
        display: inline-flex;
        align-items: center;
        padding: 0.28rem 0.62rem;
        border-radius: 999px;
        border: 1px solid rgba(120, 182, 255, 0.32);
        background: rgba(120, 182, 255, 0.1);
        color: #9fd0ff;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }

      .hub-class-title {
        margin: 0.6rem 0 0.45rem;
        color: #eef4ff;
        font-size: clamp(1.9rem, 4vw, 2.6rem);
      }

      .hub-class-copy,
      .hub-class-panel-head p,
      .hub-class-session-head p {
        margin: 0;
        color: #a9b7d1;
        line-height: 1.5;
      }

      .hub-class-panel-head,
      .hub-class-group-head,
      .hub-class-session-head,
      .hub-class-session-meta,
      .hub-class-session-actions {
        display: flex;
        justify-content: space-between;
        gap: 0.8rem;
      }

      .hub-class-panel-head {
        align-items: center;
        margin-bottom: 1rem;
      }

      .hub-class-panel-head h2,
      .hub-class-group-head h3,
      .hub-class-session-head h4 {
        margin: 0;
        color: #eef4ff;
      }

      .hub-class-count,
      .hub-class-group-head span,
      .hub-class-state {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 2.2rem;
        padding: 0.28rem 0.62rem;
        border-radius: 999px;
        font-weight: 700;
      }

      .hub-class-count,
      .hub-class-group-head span {
        background: rgba(120, 182, 255, 0.12);
        border: 1px solid rgba(120, 182, 255, 0.28);
        color: #9fd0ff;
      }

      .hub-class-groups {
        display: grid;
        gap: 1rem;
      }

      .hub-class-group {
        display: grid;
        gap: 0.75rem;
      }

      .hub-class-group-head {
        align-items: center;
      }

      .hub-class-session-list {
        display: grid;
        gap: 0.85rem;
      }

      .hub-class-session-card {
        display: grid;
        gap: 0.85rem;
        border-radius: 16px;
        border: 1px solid rgba(63, 94, 155, 0.46);
        background: rgba(8, 16, 38, 0.58);
        padding: 1rem;
      }

      .hub-class-state {
        text-transform: capitalize;
        font-size: 0.84rem;
      }

      .hub-class-state.is-open {
        color: #91f0bf;
        background: rgba(59, 173, 114, 0.12);
        border: 1px solid rgba(59, 173, 114, 0.3);
      }

      .hub-class-state.is-scheduled {
        color: #ffd58d;
        background: rgba(241, 176, 63, 0.12);
        border: 1px solid rgba(241, 176, 63, 0.28);
      }

      .hub-class-state.is-closed {
        color: #ffb1b1;
        background: rgba(214, 92, 92, 0.12);
        border: 1px solid rgba(214, 92, 92, 0.28);
      }

      .hub-class-session-meta {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .hub-class-session-meta span,
      .hub-class-session-note span {
        display: block;
        color: #8ea5c8;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .hub-class-session-meta p,
      .hub-class-session-note p {
        margin: 0.24rem 0 0;
        color: #eef4ff;
      }

      .hub-class-session-note {
        border-top: 1px solid rgba(63, 94, 155, 0.28);
        padding-top: 0.8rem;
      }

      .hub-class-session-actions {
        justify-content: flex-start;
      }

      .hub-class-empty {
        margin: 0;
        color: #a9b7d1;
      }

      @media (max-width: 760px) {
        .hub-class-panel,
        .hub-class-hero {
          padding: 1rem;
        }

        .hub-class-session-meta,
        .hub-class-panel-head,
        .hub-class-group-head,
        .hub-class-session-head {
          grid-template-columns: 1fr;
          display: grid;
        }
      }
    `}</style>
  );
}
