import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Check,
  Clipboard,
  LoaderCircle,
  Play,
  Plus,
  Square,
  Users,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  createSpeakingWorkshopSession,
  listSpeakingWorkshopSessions,
  updateSpeakingWorkshopSession,
} from "../../../firebase";
import {
  SPEAKING_WORKSHOP_PROGRAMME,
  SPEAKING_WORKSHOP_TOPIC_CATALOG,
} from "./workshopTopics";

function phaseLabel(session) {
  if (session.phase === "live") return "Live now";
  if (session.phase === "review") {
    return new Date(session.reviewUntil || 0) > new Date() ? "Two-week review" : "Review expired";
  }
  return "Preparation open";
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function SpeakingWorkshopSessionManager() {
  const [sessions, setSessions] = useState([]);
  const [label, setLabel] = useState("Friday speaking workshop");
  const [topicIds, setTopicIds] = useState(() => [...SPEAKING_WORKSHOP_PROGRAMME[0].topicIds]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [error, setError] = useState("");

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

  async function handleCreate(event) {
    event.preventDefault();
    if (!topicIds.length || creating) return;
    setCreating(true);
    setError("");
    try {
      const result = await createSpeakingWorkshopSession({ label, topicIds });
      if (result?.session) setSessions((current) => [{ ...result.session, attendees: [] }, ...current]);
    } catch (requestError) {
      console.error("[Speaking workshops] Could not create session", requestError);
      setError("The workshop couldn’t be created. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function updateSession(sessionId, action) {
    if (updatingId) return;
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

  async function copyJoinLink(session) {
    const url = `${window.location.origin}/speaking-workshops?join=${session.joinCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(session.id);
      window.setTimeout(() => setCopiedId(""), 1800);
    } catch {
      setError(`Copy this link: ${url}`);
    }
  }

  return (
    <section className="workshop-manager" aria-labelledby="workshop-manager-title">
      <header className="workshop-manager-heading">
        <div>
          <span className="workshop-kicker">Teacher controls</span>
          <h2 id="workshop-manager-title">Run a workshop session</h2>
          <p>Registration opens preparation immediately. Ending a live session keeps access open for exactly two weeks.</p>
        </div>
        <span className="workshop-review-rule"><CalendarClock size={19} /> 14-day review</span>
      </header>

      <form className="workshop-create-form" onSubmit={handleCreate}>
        <label>
          <span>Session name</span>
          <input value={label} onChange={(event) => setLabel(event.target.value)} maxLength={80} />
        </label>
        <fieldset className="workshop-programme-selector">
          <legend>Four-week programme</legend>
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
                          <small>{topic.ready ? "Ready" : "Materials pending"}</small>
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
          {sessions.map((session) => {
            const joinUrl = `${window.location.origin}/speaking-workshops?join=${session.joinCode}`;
            return (
              <article className={`workshop-session-card is-${session.phase}`} key={session.id}>
                <div className="workshop-session-main">
                  <span className="workshop-session-phase">{phaseLabel(session)}</span>
                  <h3>{session.label}</h3>
                  <p>{session.topicIds.map((id) => topicTitles[id] || id).join(" · ")}</p>
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
                  {session.phase === "review" && session.reviewUntil ? (
                    <small>
                      {new Date(session.reviewUntil) > new Date()
                        ? `Participant access ends automatically on ${formatDate(session.reviewUntil)}.`
                        : `Participant access ended on ${formatDate(session.reviewUntil)}.`}
                    </small>
                  ) : null}
                </div>

                {session.phase !== "review" ? (
                  <div className="workshop-session-invite">
                    <QRCodeSVG value={joinUrl} size={94} includeMargin />
                    <div>
                      <span>Student code</span>
                      <strong>{session.joinCode}</strong>
                      <button type="button" onClick={() => copyJoinLink(session)}>
                        {copiedId === session.id ? <Check size={16} /> : <Clipboard size={16} />}
                        {copiedId === session.id ? "Copied" : "Copy join link"}
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="workshop-session-actions">
                  {session.phase === "preparation" ? (
                    <button type="button" disabled={updatingId === session.id} onClick={() => updateSession(session.id, "start")}>
                      <Play size={17} /> Start workshop
                    </button>
                  ) : null}
                  {session.phase === "live" ? (
                    <button className="is-end" type="button" disabled={updatingId === session.id} onClick={() => updateSession(session.id, "end")}>
                      <Square size={16} /> End & start review
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
