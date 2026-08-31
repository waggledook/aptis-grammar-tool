import React, { useLayoutEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import SpeakingPart1 from "../SpeakingPart1";
import SpeakingPart2 from "../SpeakingPart2";
import SpeakingPart3 from "../SpeakingPart3";
import SpeakingPart4 from "../SpeakingPart4";
import SpeakingWorkshopAccessGate from "./SpeakingWorkshopAccessGate";
import RelationshipsPreparation from "./RelationshipsPreparation";
import TransportPreparation from "./TransportPreparation";
import TeachingMode from "./TeachingMode";
import {
  getSpeakingWorkshopTopic,
  SPEAKING_PART_META,
  SPEAKING_WORKSHOP_TOPICS,
} from "./workshopTopics";
import "./SpeakingWorkshops.css";

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

function WorkshopLanding({ navigate }) {
  return (
    <main className="speaking-workshops">
      <section className="workshop-hero">
        <span className="workshop-kicker">Friday workshop pilot</span>
        <h1>Topic-focused Aptis speaking</h1>
        <p>Choose a topic, then use it as timed individual exam practice or as flexible material for a teacher-led session.</p>
        <div className="workshop-hero-stats">
          <span><strong>2</strong> complete topics</span>
          <span><strong>4</strong> Aptis speaking parts</span>
          <span><strong>2</strong> delivery modes</span>
        </div>
      </section>

      <section className="workshop-topic-grid" aria-label="Workshop topics">
        {SPEAKING_WORKSHOP_TOPICS.map((topic, index) => (
          <button
            className={`workshop-topic-card accent-${topic.accent}`}
            type="button"
            key={topic.id}
            onClick={() => navigate(`/speaking-workshops/${topic.id}`)}
          >
            <span className="workshop-topic-index">0{index + 1}</span>
            <h2>{topic.title}</h2>
            <p>{topic.summary}</p>
            <span className="workshop-topic-count">{topic.counts[1] + topic.counts[2] + topic.counts[3] + topic.counts[4]} prompts and tasks <b>→</b></span>
          </button>
        ))}
      </section>
    </main>
  );
}

function TopicModeChoice({ topic, navigate }) {
  return (
    <main className="speaking-workshops">
      <button className="workshop-back" type="button" onClick={() => navigate("/speaking-workshops")}>← All topics</button>
      <section className={`workshop-topic-hero accent-${topic.accent}`}>
        <span className="workshop-kicker">Aptis Speaking Topic</span>
        <h1>{topic.title}</h1>
        <p>{topic.summary}</p>
      </section>

      <section className="workshop-mode-grid" aria-label="Choose a mode">
        <button type="button" onClick={() => navigate(`/speaking-workshops/${topic.id}/prepare`)}>
          <span className="mode-icon" aria-hidden="true">◇</span>
          <span className="workshop-kicker">Before the workshop</span>
          <h2>Prepare</h2>
          <p>A short flipped-classroom sequence with topic phrases, speaking functions and an oral rehearsal.</p>
          <strong>Start the warm-up →</strong>
        </button>
        <button type="button" onClick={() => navigate(`/speaking-workshops/${topic.id}/practice`)}>
          <span className="mode-icon" aria-hidden="true">◉</span>
          <span className="workshop-kicker">Individual mode</span>
          <h2>Exam practice</h2>
          <p>Original Aptis timings, spoken instructions, microphone recording and AI feedback.</p>
          <strong>Choose a speaking part →</strong>
        </button>
        <button type="button" onClick={() => navigate(`/speaking-workshops/${topic.id}/teach`)}>
          <span className="mode-icon" aria-hidden="true">✦</span>
          <span className="workshop-kicker">Classroom mode</span>
          <h2>Teaching mode</h2>
          <p>Browse the full topic bank. Keep recommended timers available or switch timing off completely.</p>
          <strong>Open teaching board →</strong>
        </button>
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
          return (
            <button key={part} type="button" onClick={() => navigate(`/speaking-workshops/${topic.id}/practice/${part}`)}>
              <span>Part {part}</span>
              <h2>{meta.title}</h2>
              <p>{meta.timing}</p>
              <small>{topic.counts[part]} {part === 1 ? "questions in the bank" : "complete tasks"}</small>
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

export default function SpeakingWorkshops({ user, onSignIn }) {
  usePrivatePageMetadata();
  const navigate = useNavigate();
  const { topicId, mode, partNumber } = useParams();
  const topic = topicId ? getSpeakingWorkshopTopic(topicId) : null;

  let page = null;
  if (!topicId) page = <WorkshopLanding navigate={navigate} />;
  else if (!topic) page = <Navigate to="/speaking-workshops" replace />;
  else if (!mode) page = <TopicModeChoice topic={topic} navigate={navigate} />;
  else if (mode === "prepare") page = (
    <main className="speaking-workshops">
      {topic.id === "relationships-family"
        ? <RelationshipsPreparation topic={topic} user={user} />
        : <TransportPreparation topic={topic} user={user} />}
    </main>
  );
  else if (mode === "teach") page = <main className="speaking-workshops"><TeachingMode topic={topic} /></main>;
  else if (mode === "practice" && !partNumber) page = <PracticePartChoice topic={topic} navigate={navigate} />;
  else if (mode === "practice") page = <ExamPractice topic={topic} partNumber={partNumber} user={user} navigate={navigate} />;
  else page = <Navigate to={`/speaking-workshops/${topic.id}`} replace />;

  return (
    <SpeakingWorkshopAccessGate user={user} onSignIn={onSignIn}>
      {page}
    </SpeakingWorkshopAccessGate>
  );
}
