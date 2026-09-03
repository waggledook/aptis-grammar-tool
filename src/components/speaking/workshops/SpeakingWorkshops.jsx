import React, { useLayoutEffect } from "react";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Image as ImageIcon,
  Images,
  Lightbulb,
  LockKeyhole,
  MessageCircle,
  Mic2,
  Presentation,
  TrainFront,
  UsersRound,
} from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import SpeakingPart1 from "../SpeakingPart1";
import SpeakingPart2 from "../SpeakingPart2";
import SpeakingPart3 from "../SpeakingPart3";
import SpeakingPart4 from "../SpeakingPart4";
import SpeakingWorkshopAccessGate from "./SpeakingWorkshopAccessGate";
import SpeakingWorkshopSessionManager from "./SpeakingWorkshopSessionManager";
import RelationshipsPreparation from "./RelationshipsPreparation";
import SpeakingReference from "./SpeakingReference";
import TransportPreparation from "./TransportPreparation";
import TeachingMode from "./TeachingMode";
import {
  getSpeakingWorkshopTopic,
  SPEAKING_PART_META,
  SPEAKING_WORKSHOP_TOPIC_CATALOG,
  SPEAKING_WORKSHOP_TOPICS,
} from "./workshopTopics";
import "./SpeakingWorkshops.css";

const TOPIC_ICONS = {
  "relationships-family": UsersRound,
  "travel-transport": TrainFront,
};

const PART_ICONS = {
  1: MessageCircle,
  2: ImageIcon,
  3: Images,
  4: Clock3,
};

function usePrivatePageMetadata() {
  useLayoutEffect(() => {
    document.title = "Aptis Speaking Workshops";
    let robots = document.querySelector('meta[name="robots"]');
    const previous = robots?.getAttribute("content") || "";
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", "noindex, nofollow");
    return () => {
      if (previous) robots.setAttribute("content", previous);
      else robots.remove();
    };
  }, []);
}

function formatReviewDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" }).format(date);
}

function WorkshopMembershipSummary({ access }) {
  const [joinCode, setJoinCode] = React.useState("");
  const [joining, setJoining] = React.useState(false);
  const [joinError, setJoinError] = React.useState("");

  async function handleJoin(event) {
    event.preventDefault();
    if (!joinCode.trim() || joining) return;
    setJoining(true);
    setJoinError("");
    try {
      await access.joinSession(joinCode);
      setJoinCode("");
    } catch (error) {
      setJoinError(error?.message || "That workshop could not be joined.");
    } finally {
      setJoining(false);
    }
  }

  return (
    <section className="workshop-membership-summary" aria-label="Your workshop access">
      <div className="workshop-membership-list">
        <span className="workshop-kicker">Your workshop access</span>
        {access.sessions.map((session) => (
          <article key={session.id}>
            <span className={`workshop-membership-dot is-${session.phase}`} aria-hidden="true" />
            <div>
              <strong>{session.label}</strong>
              <small>
                {session.phase === "preparation" ? "Preparation available" : null}
                {session.phase === "live" ? "Workshop live — practice unlocked" : null}
                {session.phase === "review" ? `Review access until ${formatReviewDate(session.reviewUntil)}` : null}
              </small>
            </div>
          </article>
        ))}
      </div>
      <form className="workshop-join-another" onSubmit={handleJoin}>
        <label htmlFor="join-another-workshop">Join another session</label>
        <div>
          <input id="join-another-workshop" value={joinCode} maxLength={6} placeholder="ABC234" onChange={(event) => setJoinCode(event.target.value.toUpperCase())} />
          <button type="submit" disabled={joining || !joinCode.trim()}>{joining ? "Joining…" : "Join"}</button>
        </div>
        {joinError ? <small className="workshop-join-error" role="alert">{joinError}</small> : null}
      </form>
    </section>
  );
}

function WorkshopLanding({ navigate, access }) {
  const visibleTopics = access.fullAccess
    ? SPEAKING_WORKSHOP_TOPICS
    : SPEAKING_WORKSHOP_TOPICS.filter((topic) => access.topicAccess[topic.id]?.preparation);
  const plannedTopics = access.fullAccess ? [] : SPEAKING_WORKSHOP_TOPIC_CATALOG.filter((topic) => (
    access.topicAccess[topic.id]?.preparation && !getSpeakingWorkshopTopic(topic.id)
  ));

  return (
    <main className="speaking-workshops">
      <section className="workshop-hero">
        <span className="workshop-kicker">Friday workshop pilot</span>
        <h1>Topic-focused Aptis speaking</h1>
        <p>Choose a topic, then use it as timed individual exam practice or as flexible material for a teacher-led session.</p>
        <div className="workshop-hero-stats">
          <span><strong>2</strong> complete topics</span>
          <span><strong>8</strong> programme topics</span>
          <span><strong>4</strong> week cycle</span>
        </div>
      </section>

      {access.canManage ? <SpeakingWorkshopSessionManager /> : null}
      {!access.fullAccess && access.sessions.length ? <WorkshopMembershipSummary access={access} /> : null}

      <section className="workshop-topic-grid" aria-label="Workshop topics">
        {visibleTopics.map((topic, index) => {
          const TopicIcon = TOPIC_ICONS[topic.id] || Mic2;
          const totalTasks = topic.counts[1] + topic.counts[2] + topic.counts[3] + topic.counts[4];
          const coverTask = topic.parts[2].tasks[0];
          return (
            <button
              className={`workshop-topic-card accent-${topic.accent}`}
              type="button"
              key={topic.id}
              onClick={() => navigate(`/speaking-workshops/${topic.id}`)}
            >
              <span className="workshop-topic-visual" aria-hidden="true">
                <img src={coverTask?.image} alt="" />
                <span className="workshop-topic-number">0{index + 1}</span>
                <span className="workshop-topic-icon"><TopicIcon size={23} strokeWidth={2.2} /></span>
              </span>
              <span className="workshop-topic-copy">
                <span className="workshop-topic-eyebrow">Workshop topic</span>
                <h2>{topic.title}</h2>
                <p>{topic.summary}</p>
                <span className="workshop-topic-footer">
                  <span><strong>{totalTasks}</strong> prompts & tasks</span>
                  <span className="workshop-card-arrow"><ArrowRight size={20} /></span>
                </span>
              </span>
            </button>
          );
        })}
        {plannedTopics.map((topic) => (
          <article className={`workshop-planned-card accent-${topic.accent}`} key={topic.id}>
            <span className="workshop-planned-week">Programme week {topic.week} · Hour {topic.hour}</span>
            <span className="workshop-planned-icon" aria-hidden="true"><LockKeyhole size={23} /></span>
            <h2>{topic.title}</h2>
            <p>{topic.summary}</p>
            <strong>Materials are being prepared</strong>
          </article>
        ))}
      </section>
    </main>
  );
}

function TopicModeChoice({ topic, navigate, access }) {
  const grant = access.topicAccess[topic.id] || {};
  const canUsePractice = access.fullAccess || grant.live;

  return (
    <main className="speaking-workshops">
      <button className="workshop-back" type="button" onClick={() => navigate("/speaking-workshops")}>← All topics</button>
      <section className={`workshop-topic-hero accent-${topic.accent}`}>
        <span className="workshop-kicker">Aptis Speaking Topic</span>
        <h1>{topic.title}</h1>
        <p>{topic.summary}</p>
      </section>

      <section className="workshop-mode-grid" aria-label="Choose a mode">
        <button className="mode-reference" type="button" onClick={() => navigate(`/speaking-workshops/${topic.id}/reference`)}>
          <span className="mode-icon" aria-hidden="true"><BookOpen size={28} /></span>
          <span className="workshop-kicker">Student reference</span>
          <h2>Language guide</h2>
          <p>Consult useful topic language for descriptions, comparisons, opinions and developed answers.</p>
          <strong>Open the reference <ArrowRight size={17} /></strong>
        </button>
        <button className="mode-prepare" type="button" onClick={() => navigate(`/speaking-workshops/${topic.id}/prepare`)}>
          <span className="mode-icon" aria-hidden="true"><Lightbulb size={28} /></span>
          <span className="workshop-kicker">Before the workshop</span>
          <h2>Prepare</h2>
          <p>A short flipped-classroom sequence with topic phrases, speaking functions and an oral rehearsal.</p>
          <strong>Start the warm-up <ArrowRight size={17} /></strong>
        </button>
        <button className={`mode-practice ${canUsePractice ? "" : "is-locked"}`} type="button" disabled={!canUsePractice} onClick={() => navigate(`/speaking-workshops/${topic.id}/practice`)}>
          <span className="mode-icon" aria-hidden="true">{canUsePractice ? <Mic2 size={28} /> : <LockKeyhole size={27} />}</span>
          <span className="workshop-kicker">Individual mode</span>
          <h2>Exam practice</h2>
          <p>{canUsePractice
            ? "Original Aptis timings, spoken instructions, microphone recording and AI feedback."
            : "Your preparation is ready. Practice unlocks when the teacher starts the workshop."}</p>
          <strong>{canUsePractice ? <>Choose a speaking part <ArrowRight size={17} /></> : "Waiting for the workshop to start"}</strong>
        </button>
        {access.canManage ? (
          <button className="mode-teach" type="button" onClick={() => navigate(`/speaking-workshops/${topic.id}/teach`)}>
            <span className="mode-icon" aria-hidden="true"><Presentation size={28} /></span>
            <span className="workshop-kicker">Classroom mode</span>
            <h2>Teaching mode</h2>
            <p>Browse the full topic bank. Keep recommended timers available or switch timing off completely.</p>
            <strong>Open teaching board <ArrowRight size={17} /></strong>
          </button>
        ) : null}
      </section>
    </main>
  );
}

function PracticePartChoice({ topic, navigate }) {
  return (
    <main className="speaking-workshops">
      <button className="workshop-back" type="button" onClick={() => navigate(`/speaking-workshops/${topic.id}`)}>← {topic.title}</button>
      <section className="workshop-practice-intro">
        <span className="workshop-kicker">Exam practice · {topic.title}</span>
        <h1>Choose a speaking part</h1>
        <p>Each activity uses the same recording, timing and AI-feedback flow as the main Aptis practice area.</p>
      </section>
      <section className="workshop-part-grid">
        {[1, 2, 3, 4].map((part) => {
          const meta = SPEAKING_PART_META[part];
          const PartIcon = PART_ICONS[part];
          return (
            <button key={part} type="button" onClick={() => navigate(`/speaking-workshops/${topic.id}/practice/${part}`)}>
              <span className="workshop-part-card-top">
                <span>Part {part}</span>
                <span className="workshop-part-icon" aria-hidden="true"><PartIcon size={22} /></span>
              </span>
              <h2>{meta.title}</h2>
              <p>{meta.timing}</p>
              <span className="workshop-part-footer">
                <small>{topic.counts[part]} {part === 1 ? "questions in the bank" : "complete tasks"}</small>
                <ArrowRight size={18} aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </section>
    </main>
  );
}

function ExamPractice({ topic, partNumber, user, navigate }) {
  const part = Number(partNumber);
  const common = {
    user,
    aptisAccess: { hasFullAccess: true, isDemoMode: false },
    onRequireSignIn: () => {},
    onSignIn: () => {},
  };
  const routeBasePath = `/speaking-workshops/${topic.id}/practice/${part}`;

  let activity = null;
  if (part === 1) {
    activity = (
      <SpeakingPart1
        {...common}
        questions={topic.parts[1].questions}
        partKey={`workshop-${topic.id}-part1`}
        heading={`${topic.title} — Part 1`}
        showNewOnly={false}
      />
    );
  } else if (part === 2) {
    activity = (
      <SpeakingPart2
        {...common}
        tasks={topic.parts[2].tasks}
        partKey={`workshop-${topic.id}-part2`}
        activityId={`workshop-${topic.id}-part2`}
        routeBasePath={routeBasePath}
        showAssignButton={false}
        lockAfterIndex={null}
        heading={`${topic.title} — Part 2`}
      />
    );
  } else if (part === 3) {
    activity = (
      <SpeakingPart3
        {...common}
        tasks={topic.parts[3].tasks}
        partKey={`workshop-${topic.id}-part3`}
        activityId={`workshop-${topic.id}-part3`}
        routeBasePath={routeBasePath}
        showAssignButton={false}
        lockAfterIndex={null}
        heading={`${topic.title} — Part 3`}
      />
    );
  } else if (part === 4) {
    activity = (
      <SpeakingPart4
        {...common}
        tasks={topic.parts[4].tasks}
        partKey={`workshop-${topic.id}-part4`}
        activityId={`workshop-${topic.id}-part4`}
        routeBasePath={routeBasePath}
        showAssignButton={false}
        lockAfterIndex={null}
        heading={`${topic.title} — Part 4`}
      />
    );
  }

  if (!activity) return <Navigate to={`/speaking-workshops/${topic.id}/practice`} replace />;

  return (
    <main className="speaking-workshops workshop-exam-shell">
      <div className="workshop-exam-nav">
        <button className="workshop-back" type="button" onClick={() => navigate(`/speaking-workshops/${topic.id}/practice`)}>← Change part</button>
        <button className="workshop-secondary" type="button" onClick={() => navigate(`/speaking-workshops/${topic.id}/teach`)}>Teaching mode</button>
      </div>
      {activity}
    </main>
  );
}

function SpeakingWorkshopsContent({ user, access }) {
  const navigate = useNavigate();
  const { topicId, mode, partNumber } = useParams();
  const topic = topicId ? getSpeakingWorkshopTopic(topicId) : null;
  const topicGrant = topic ? access.topicAccess[topic.id] || {} : {};
  const canOpenTopic = !topic || access.fullAccess || topicGrant.preparation;
  const canOpenPractice = access.fullAccess || topicGrant.live;

  let page = null;
  if (!topicId) page = <WorkshopLanding navigate={navigate} access={access} />;
  else if (!topic) page = <Navigate to="/speaking-workshops" replace />;
  else if (!canOpenTopic) page = <Navigate to="/speaking-workshops" replace />;
  else if (!mode) page = <TopicModeChoice topic={topic} navigate={navigate} access={access} />;
  else if (mode === "prepare") page = (
    <main className="speaking-workshops">
      {topic.id === "relationships-family"
        ? <RelationshipsPreparation topic={topic} user={user} />
        : <TransportPreparation topic={topic} user={user} />}
    </main>
  );
  else if (mode === "reference") page = <main className="speaking-workshops"><SpeakingReference topic={topic} /></main>;
  else if (mode === "teach" && access.canManage) page = <main className="speaking-workshops"><TeachingMode topic={topic} /></main>;
  else if (mode === "practice" && !canOpenPractice) page = <Navigate to={`/speaking-workshops/${topic.id}`} replace />;
  else if (mode === "practice" && !partNumber) page = <PracticePartChoice topic={topic} navigate={navigate} />;
  else if (mode === "practice") page = <ExamPractice topic={topic} partNumber={partNumber} user={user} navigate={navigate} />;
  else page = <Navigate to={`/speaking-workshops/${topic.id}`} replace />;

  return page;
}

export default function SpeakingWorkshops({ user, onSignIn }) {
  usePrivatePageMetadata();
  const { topicId, mode, partNumber } = useParams();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [topicId, mode, partNumber]);

  return (
    <SpeakingWorkshopAccessGate user={user} onSignIn={onSignIn}>
      {(access) => <SpeakingWorkshopsContent user={user} access={access} />}
    </SpeakingWorkshopAccessGate>
  );
}
