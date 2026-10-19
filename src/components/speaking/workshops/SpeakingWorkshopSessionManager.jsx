import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarClock,
  Check,
  ChevronDown,
  Clipboard,
  Clock3,
  LoaderCircle,
  MessageSquareText,
  Play,
  Plus,
  Square,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  addSpeakingWorkshopMember,
  createSpeakingWorkshopSession,
  deleteSpeakingWorkshopSession,
  listSpeakingWorkshopSessions,
  searchSpeakingWorkshopStudents,
  updateSpeakingWorkshopSession,
} from "../../../firebase";
import {
  SPEAKING_WORKSHOP_PROGRAMME,
  SPEAKING_WORKSHOP_TOPIC_CATALOG,
} from "./workshopTopics";
import {
  getNextSpeakingWorkshopDate,
  getSpeakingWorkshopProgrammeWeek,
} from "./workshopSchedule";

const WORKSHOP_TIME_ZONE = "Europe/Madrid";

function capitalize(value = "") {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : "";
}

function phaseLabel(session) {
  if (session.phase === "live") return "Live now";
  if (session.phase === "review") {
    return new Date(session.reviewUntil || 0) > new Date() ? "Two-week review" : "Review expired";
  }
  return "Preparation open";
}

function withScheduledPhase(session, now) {
  const startsAt = session.startsAt ? new Date(session.startsAt).getTime() : NaN;
  if (session.phase === "preparation" && Number.isFinite(startsAt) && startsAt <= now) {
    return { ...session, phase: "live" };
  }
  return session;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: WORKSHOP_TIME_ZONE,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatSessionStart(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: WORKSHOP_TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function buildInvitationText(session, joinUrl, topicTitles) {
  const startsAt = session.startsAt ? new Date(session.startsAt) : null;
  const hasStart = startsAt && !Number.isNaN(startsAt.getTime());
  const time = hasStart ? new Intl.DateTimeFormat("es-ES", {
    timeZone: WORKSHOP_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(startsAt) : "";
  const weekday = hasStart ? capitalize(new Intl.DateTimeFormat("es-ES", {
    timeZone: WORKSHOP_TIME_ZONE,
    weekday: "long",
  }).format(startsAt)) : "";
  const fullDate = hasStart ? capitalize(new Intl.DateTimeFormat("es-ES", {
    timeZone: WORKSHOP_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(startsAt)) : "";
  const topics = new Intl.ListFormat("es-ES", { type: "conjunction" }).format(
    session.topicIds.map((id) => topicTitles[id] || id)
  );
  const heading = hasStart
    ? `Taller de Speaking Aptis — ${weekday} ${time}`
    : "Taller de Speaking Aptis";
  const schedule = hasStart ? `\n📅 ${fullDate}\n🕕 ${time}` : "";

  return `${heading}

Antes del taller tienes disponible una preparación opcional en Aptis Trainer sobre los temas ${topics}.

La preparación dura aproximadamente 12–15 minutos e incluye vocabulario útil, ejercicios cortos, ideas para responder y una breve práctica oral.

👉 ${joinUrl}

Importante: este enlace es únicamente para acceder al material de preparación y práctica en Aptis Trainer. No es el enlace de Zoom para entrar en la clase.

No es obligatorio completar la preparación para asistir al taller.${schedule}`;
}

export default function SpeakingWorkshopSessionManager({ user }) {
  const [sessions, setSessions] = useState([]);
  const [label, setLabel] = useState("Friday speaking workshop");
  const [sessionDate, setSessionDate] = useState(() => getNextSpeakingWorkshopDate());
  const [startTime, setStartTime] = useState("18:00");
  const [topicIds, setTopicIds] = useState(() => [
    ...getSpeakingWorkshopProgrammeWeek().topicIds,
  ]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [addingMemberId, setAddingMemberId] = useState("");
  const [memberEmails, setMemberEmails] = useState({});
  const [memberNotices, setMemberNotices] = useState({});
  const [memberSearches, setMemberSearches] = useState({});
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const memberSearchTimer = useRef(null);
  const memberSearchRequest = useRef(0);

  async function loadSessions() {
    setLoading(true);
    setError("");
    try {
      const result = await listSpeakingWorkshopSessions();
      setSessions(Array.isArray(result?.sessions) ? result.sessions : []);
    } catch (requestError) {
      console.error("[Speaking workshops] Could not load sessions", requestError);
      setError("Workshop sessions aren’t available yet. The new Firebase functions may still need deploying.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => () => {
    if (memberSearchTimer.current) window.clearTimeout(memberSearchTimer.current);
  }, []);

  const topicTitles = useMemo(() => Object.fromEntries(
    SPEAKING_WORKSHOP_TOPIC_CATALOG.map((topic) => [topic.id, topic.title])
  ), []);

  const topicsById = useMemo(() => Object.fromEntries(
    SPEAKING_WORKSHOP_TOPIC_CATALOG.map((topic) => [topic.id, topic])
  ), []);

  function toggleTopic(topicId) {
    setTopicIds((current) => current.includes(topicId)
      ? current.filter((id) => id !== topicId)
      : [...current, topicId]);
  }

  function selectWeek(programmeWeek) {
    setTopicIds([...programmeWeek.topicIds]);
  }

  function selectDate(value) {
    setSessionDate(value);
    if (value) setTopicIds([...getSpeakingWorkshopProgrammeWeek(value).topicIds]);
  }

  async function handleCreate(event) {
    event.preventDefault();
    if (!topicIds.length || creating) return;
    const startsAt = new Date(`${sessionDate}T${startTime}:00`);
    if (Number.isNaN(startsAt.getTime())) {
      setError("Choose a valid workshop date and start time.");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const result = await createSpeakingWorkshopSession({
        label,
        topicIds,
        startsAt: startsAt.toISOString(),
      });
      if (result?.session) setSessions((current) => [{ ...result.session, attendees: [] }, ...current]);
    } catch (requestError) {
      console.error("[Speaking workshops] Could not create session", requestError);
      setError("The workshop couldn’t be created. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function updateSession(sessionId, action) {
    if (updatingId || deletingId) return;
    setUpdatingId(sessionId);
    setError("");
    try {
      const result = await updateSpeakingWorkshopSession(sessionId, action);
      if (result?.session) {
        setSessions((current) => current.map((session) => (
          session.id === sessionId ? { ...session, ...result.session } : session
        )));
      }
    } catch (requestError) {
      console.error("[Speaking workshops] Could not update session", requestError);
      setError("The workshop status couldn’t be changed. Refresh and try again.");
    } finally {
      setUpdatingId("");
    }
  }

  async function deleteSession(session) {
    if (deletingId || updatingId || addingMemberId || user?.role !== "admin") return;
    const confirmed = window.confirm(
      `Delete “${session.label}”? This will remove the session and revoke access for ${session.attendeeCount || 0} registered participant${session.attendeeCount === 1 ? "" : "s"}. This cannot be undone.`
    );
    if (!confirmed) return;
    setDeletingId(session.id);
    setError("");
    try {
      await deleteSpeakingWorkshopSession(session.id);
      setSessions((current) => current.filter((item) => item.id !== session.id));
    } catch (requestError) {
      console.error("[Speaking workshops] Could not delete session", requestError);
      setError("The workshop couldn’t be deleted. Refresh and try again.");
    } finally {
      setDeletingId("");
    }
  }

  async function addMember(event, sessionId) {
    event.preventDefault();
    if (addingMemberId || user?.role !== "admin") return;
    const email = String(memberEmails[sessionId] || "").trim();
    if (!email) return;
    setAddingMemberId(sessionId);
    setMemberNotices((current) => ({ ...current, [sessionId]: null }));
    try {
      const result = await addSpeakingWorkshopMember(sessionId, email);
      if (result?.session && result?.attendee) {
        setSessions((current) => current.map((session) => {
          if (session.id !== sessionId) return session;
          const attendees = Array.isArray(session.attendees) ? session.attendees : [];
          const nextAttendees = attendees.some((attendee) => attendee.uid === result.attendee.uid)
            ? attendees.map((attendee) => (
              attendee.uid === result.attendee.uid ? { ...attendee, ...result.attendee } : attendee
            ))
            : [...attendees, result.attendee];
          return { ...session, ...result.session, attendees: nextAttendees };
        }));
      }
      setMemberEmails((current) => ({ ...current, [sessionId]: "" }));
      setMemberSearches((current) => ({
        ...current,
        [sessionId]: { status: "idle", students: [] },
      }));
      setMemberNotices((current) => ({
        ...current,
        [sessionId]: {
          type: "success",
          message: result?.alreadyMember
            ? "This student already has access to the workshop."
            : "Participant added. Their workshop access is ready.",
        },
      }));
    } catch (requestError) {
      console.error("[Speaking workshops] Could not add participant", requestError);
      const code = String(requestError?.code || "");
      const message = code.includes("not-found")
        ? "No Aptis Trainer account was found for that email."
        : code.includes("failed-precondition")
          ? "Participants can only be added before or during a live workshop."
          : code.includes("permission-denied")
            ? "Only administrators can add participants."
            : "The participant couldn’t be added. Please try again.";
      setMemberNotices((current) => ({
        ...current,
        [sessionId]: { type: "error", message },
      }));
    } finally {
      setAddingMemberId("");
    }
  }

  function updateMemberSearch(sessionId, value) {
    setMemberEmails((current) => ({ ...current, [sessionId]: value }));
    setMemberNotices((current) => ({ ...current, [sessionId]: null }));
    if (memberSearchTimer.current) window.clearTimeout(memberSearchTimer.current);
    const query = value.trim();
    if (query.length < 2) {
      memberSearchRequest.current += 1;
      setMemberSearches((current) => ({
        ...current,
        [sessionId]: { status: "idle", students: [] },
      }));
      return;
    }

    const requestId = memberSearchRequest.current + 1;
    memberSearchRequest.current = requestId;
    setMemberSearches((current) => ({
      ...current,
      [sessionId]: { status: "loading", students: [] },
    }));
    memberSearchTimer.current = window.setTimeout(async () => {
      try {
        const result = await searchSpeakingWorkshopStudents(sessionId, query);
        if (memberSearchRequest.current !== requestId) return;
        setMemberSearches((current) => ({
          ...current,
          [sessionId]: {
            status: "ready",
            students: Array.isArray(result?.students) ? result.students : [],
          },
        }));
      } catch (requestError) {
        if (memberSearchRequest.current !== requestId) return;
        console.error("[Speaking workshops] Could not search students", requestError);
        setMemberSearches((current) => ({
          ...current,
          [sessionId]: { status: "error", students: [] },
        }));
      }
    }, 250);
  }

  function selectMemberSearchResult(sessionId, student) {
    memberSearchRequest.current += 1;
    if (memberSearchTimer.current) window.clearTimeout(memberSearchTimer.current);
    setMemberEmails((current) => ({ ...current, [sessionId]: student.email }));
    setMemberSearches((current) => ({
      ...current,
      [sessionId]: { status: "idle", students: [] },
    }));
  }

  async function copyText(value, copyKey) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(copyKey);
      window.setTimeout(() => setCopiedId(""), 1800);
    } catch {
      setError(`Copy this text manually: ${value}`);
    }
  }

  const visibleSessions = useMemo(
    () => sessions.map((session) => withScheduledPhase(session, now)),
    [now, sessions]
  );
  const currentSessions = visibleSessions.filter((session) => session.phase !== "review");
  const endedSessions = visibleSessions.filter((session) => session.phase === "review");

  function renderSessionCard(session) {
    const joinUrl = `${window.location.origin}/speaking-workshops?join=${session.joinCode}&session=${session.id}`;
    const isReviewSession = session.phase === "review";
    const invitationText = buildInvitationText(session, joinUrl, topicTitles);
    const linkCopyKey = `${session.id}:link`;
    const invitationCopyKey = `${session.id}:invitation`;
    const memberSearch = memberSearches[session.id] || { status: "idle", students: [] };
    const memberSearchListId = `workshop-member-results-${session.id}`;

    return (
      <article className={`workshop-session-card is-${session.phase}`} key={session.id}>
        <div className="workshop-session-main">
          <span className="workshop-session-phase">{phaseLabel(session)}</span>
          <h3>{session.label}</h3>
          <p>{session.topicIds.map((id) => topicTitles[id] || id).join(" · ")}</p>
          {session.startsAt ? (
            <span className="workshop-session-start">
              <Clock3 size={16} />
              {session.phase === "preparation" ? "Practice unlocks automatically" : "Scheduled start"}: {formatSessionStart(session.startsAt)}
            </span>
          ) : null}
          <span className="workshop-attendee-count"><Users size={17} /> {session.attendeeCount} registered</span>
          {session.attendees?.length ? (
            <details className="workshop-attendee-list">
              <summary>View participants</summary>
              <div>
                {session.attendees.map((attendee) => (
                  <span key={attendee.uid}>{attendee.name || attendee.email || "Participant"}</span>
                ))}
              </div>
            </details>
          ) : null}
          {user?.role === "admin" && !isReviewSession ? (
            <form className="workshop-add-member" onSubmit={(event) => addMember(event, session.id)}>
              <label htmlFor={`workshop-add-member-${session.id}`}>Add participant by account email</label>
              <div>
                <input
                  id={`workshop-add-member-${session.id}`}
                  type="email"
                  value={memberEmails[session.id] || ""}
                  onChange={(event) => updateMemberSearch(session.id, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setMemberSearches((current) => ({
                        ...current,
                        [session.id]: { status: "idle", students: [] },
                      }));
                    }
                  }}
                  placeholder="Start typing a name or email"
                  autoComplete="off"
                  aria-autocomplete="list"
                  aria-controls={memberSearchListId}
                  aria-expanded={memberSearch.status === "loading" || memberSearch.status === "ready"}
                  required
                />
                <button
                  type="submit"
                  disabled={Boolean(addingMemberId) || !String(memberEmails[session.id] || "").trim()}
                >
                  {addingMemberId === session.id
                    ? <LoaderCircle className="workshop-spin" size={16} />
                    : <UserPlus size={16} />}
                  {addingMemberId === session.id ? "Adding…" : "Add"}
                </button>
              </div>
              {memberSearch.status === "loading" ? (
                <div className="workshop-student-search-state">
                  <LoaderCircle className="workshop-spin" size={15} /> Searching active students…
                </div>
              ) : null}
              {memberSearch.status === "ready" && memberSearch.students.length ? (
                <ul className="workshop-student-suggestions" id={memberSearchListId} role="listbox">
                  {memberSearch.students.map((student) => (
                    <li key={student.uid}>
                      <button
                        type="button"
                        role="option"
                        aria-selected="false"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => selectMemberSearchResult(session.id, student)}
                      >
                        <span>
                          <strong>{student.name || student.email}</strong>
                          {student.name ? <small>{student.email}</small> : null}
                        </span>
                        {student.alreadyMember ? <em>Already added</em> : null}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {memberSearch.status === "ready" && !memberSearch.students.length ? (
                <div className="workshop-student-search-state">No matching active students.</div>
              ) : null}
              {memberSearch.status === "error" ? (
                <div className="workshop-student-search-state is-error">Student search is unavailable right now.</div>
              ) : null}
              {memberNotices[session.id] ? (
                <small className={`is-${memberNotices[session.id].type}`} role="status">
                  {memberNotices[session.id].message}
                </small>
              ) : null}
            </form>
          ) : null}
          {isReviewSession && session.reviewUntil ? (
            <small>
              {new Date(session.reviewUntil) > new Date()
                ? `Participant access ends automatically on ${formatDate(session.reviewUntil)}.`
                : `Participant access ended on ${formatDate(session.reviewUntil)}.`}
            </small>
          ) : null}
        </div>

        {!isReviewSession ? (
          <div className="workshop-session-invite">
            <QRCodeSVG value={joinUrl} size={94} includeMargin />
            <div>
              <span>Student code</span>
              <strong>{session.joinCode}</strong>
              <button type="button" onClick={() => copyText(joinUrl, linkCopyKey)}>
                {copiedId === linkCopyKey ? <Check size={16} /> : <Clipboard size={16} />}
                {copiedId === linkCopyKey ? "Copied" : "Copy join link"}
              </button>
              <button type="button" onClick={() => copyText(invitationText, invitationCopyKey)}>
                {copiedId === invitationCopyKey ? <Check size={16} /> : <MessageSquareText size={16} />}
                {copiedId === invitationCopyKey ? "Copied" : "Copy invitation"}
              </button>
            </div>
          </div>
        ) : null}

        {session.phase !== "review" || user?.role === "admin" ? (
          <div className="workshop-session-actions">
            {session.phase === "preparation" ? (
              <button type="button" disabled={updatingId === session.id || deletingId === session.id} onClick={() => updateSession(session.id, "start")}>
                <Play size={17} /> Start now
              </button>
            ) : null}
            {session.phase === "live" ? (
              <button className="is-end" type="button" disabled={updatingId === session.id || deletingId === session.id} onClick={() => updateSession(session.id, "end")}>
                <Square size={16} /> End & start review
              </button>
            ) : null}
            {user?.role === "admin" ? (
              <button className="is-delete" type="button" disabled={Boolean(updatingId) || Boolean(deletingId) || Boolean(addingMemberId)} onClick={() => deleteSession(session)}>
                {deletingId === session.id ? <LoaderCircle className="workshop-spin" size={16} /> : <Trash2 size={16} />}
                {deletingId === session.id ? "Deleting…" : "Delete"}
              </button>
            ) : null}
          </div>
        ) : null}
      </article>
    );
  }

  return (
    <section className="workshop-manager" aria-labelledby="workshop-manager-title">
      <header className="workshop-manager-heading">
        <div>
          <span className="workshop-kicker">Teacher controls</span>
          <h2 id="workshop-manager-title">Run a workshop session</h2>
          <p>Preparation opens immediately. Practice unlocks at the scheduled start, and students can still register while the workshop is live. Ending it keeps access open for exactly two weeks.</p>
        </div>
        <span className="workshop-review-rule"><CalendarClock size={19} /> 14-day review</span>
      </header>

      <form className="workshop-create-form" onSubmit={handleCreate}>
        <label>
          <span>Session name</span>
          <input value={label} onChange={(event) => setLabel(event.target.value)} maxLength={80} />
        </label>
        <label>
          <span>Workshop date</span>
          <input type="date" value={sessionDate} onChange={(event) => selectDate(event.target.value)} required />
        </label>
        <label>
          <span>Start time</span>
          <input
            type="time"
            value={startTime}
            min="10:00"
            max="18:00"
            step="900"
            onChange={(event) => setStartTime(event.target.value)}
            required
          />
        </label>
        <fieldset className="workshop-programme-selector">
          <legend>Four-week programme · selected automatically from Saturday</legend>
          <div className="workshop-programme-weeks">
            {SPEAKING_WORKSHOP_PROGRAMME.map((programmeWeek) => {
              const isSelected = programmeWeek.topicIds.length === topicIds.length &&
                programmeWeek.topicIds.every((id) => topicIds.includes(id));
              return (
                <section className={isSelected ? "is-selected" : ""} key={programmeWeek.week}>
                  <button type="button" onClick={() => selectWeek(programmeWeek)}>
                    Week {programmeWeek.week}
                    {isSelected ? <Check size={16} /> : null}
                  </button>
                  <div>
                    {programmeWeek.topicIds.map((topicId) => {
                      const topic = topicsById[topicId];
                      return (
                        <label className={topicIds.includes(topicId) ? "is-selected" : ""} key={topicId}>
                          <input
                            type="checkbox"
                            checked={topicIds.includes(topicId)}
                            onChange={() => toggleTopic(topicId)}
                          />
                          <span>{topic.title}</span>
                          <small>{topic.ready
                            ? "Ready"
                            : topic.visualsReady
                              ? "Tasks & visuals ready · preparation pending"
                              : topic.contentReady
                                ? "Tasks wired · visuals pending"
                                : "Materials pending"}</small>
                        </label>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </fieldset>
        <button className="workshop-primary" type="submit" disabled={creating || !topicIds.length}>
          {creating ? <LoaderCircle className="workshop-spin" size={18} /> : <Plus size={18} />}
          {creating ? "Creating…" : "Create session"}
        </button>
      </form>

      {error ? <p className="workshop-manager-error" role="alert">{error}</p> : null}
      {loading ? <p className="workshop-manager-loading"><LoaderCircle className="workshop-spin" size={18} /> Loading sessions…</p> : null}

      {!loading && sessions.length ? (
        <div className="workshop-session-list">
          {currentSessions.map(renderSessionCard)}
          {endedSessions.length ? (
            <details className="workshop-review-archive">
              <summary>
                <span className="workshop-review-archive-label">
                  <CalendarClock size={20} aria-hidden="true" />
                  <span>
                    <strong>Ended workshops</strong>
                    <small>{endedSessions.length} session{endedSessions.length === 1 ? "" : "s"} in review or expired</small>
                  </span>
                </span>
                <ChevronDown size={20} aria-hidden="true" />
              </summary>
              <div className="workshop-review-session-list">
                {endedSessions.map(renderSessionCard)}
              </div>
            </details>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
