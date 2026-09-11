import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SPEAKING_PART_META } from "./workshopTopics";

function formatTime(value) {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function randomSample(items, count) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled.slice(0, count);
}

function ClassroomTimer({ seconds, label }) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setLeft(seconds);
    setRunning(false);
  }, [seconds]);

  useEffect(() => {
    if (!running || left <= 0) return undefined;
    const timerId = window.setInterval(() => setLeft((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timerId);
  }, [left, running]);

  useEffect(() => {
    if (left === 0) setRunning(false);
  }, [left]);

  return (
    <div className={`classroom-timer ${left === 0 ? "is-finished" : ""}`}>
      <div><span>{label}</span><strong aria-live="polite">{formatTime(left)}</strong></div>
      <div className="classroom-timer-actions">
        <button type="button" onClick={() => setRunning((value) => !value)}>{running ? "Pause" : left === 0 ? "Restart" : "Start"}</button>
        <button type="button" onClick={() => { setRunning(false); setLeft(seconds); }}>Reset</button>
      </div>
    </div>
  );
}

function Photo({ src, alt, label, brief }) {
  return (
    <figure className={`workshop-photo ${src ? "" : "is-placeholder"}`}>
      {label ? <span>{label}</span> : null}
      {src ? <img src={src} alt={alt} /> : (
        <div>
          <strong>Visual pending</strong>
          <p>{brief || alt}</p>
        </div>
      )}
    </figure>
  );
}

export default function TeachingMode({ topic, variant = "teaching", canUseExamPractice = topic.visualsReady }) {
  const navigate = useNavigate();
  const isRelaxedPractice = variant === "relaxed-practice";
  const [part, setPart] = useState(1);
  const [taskIndex, setTaskIndex] = useState(0);
  const [timing, setTiming] = useState(isRelaxedPractice ? "off" : "suggested");
  const [randomPart1Set, setRandomPart1Set] = useState(null);

  const items = useMemo(() => {
    if (part === 1) return topic.parts[1].questions.map((question, index) => ({
      id: question.id,
      title: `Question ${index + 1}`,
      questions: [question.text],
      allQuestions: [question.text],
    }));
    return topic.parts[part].tasks;
  }, [part, topic]);
  const isRandomPart1Set = isRelaxedPractice && part === 1 && Boolean(randomPart1Set);
  const current = isRandomPart1Set ? randomPart1Set : items[taskIndex] || items[0];
  const meta = SPEAKING_PART_META[part];

  useEffect(() => {
    setTaskIndex(0);
    setRandomPart1Set(null);
  }, [part]);

  function generatePart1Set() {
    const questions = randomSample(topic.parts[1].questions, 3);
    setRandomPart1Set({
      id: `${topic.id}-random-${Date.now()}`,
      title: "Three random questions",
      questions: questions.map((question) => question.text),
      allQuestions: questions.map((question) => question.text),
    });
  }

  const timerSeconds = part === 4 ? 120 : meta.seconds;

  return (
    <div className="workshop-teaching-shell">
      <header className="workshop-session-header">
        <div>
          <span className="workshop-kicker">{isRelaxedPractice ? "Relaxed practice" : "Teaching mode"} · {topic.title}</span>
          <h1>{meta.shortTitle}: {meta.title}</h1>
          <p>{isRelaxedPractice
            ? "Work through the task bank at your own pace. There is no recording or feedback, and the optional timer never advances the task automatically."
            : "Move through the bank at your own pace. The timer is a classroom aid and never advances the task automatically."}</p>
        </div>
        <button className="workshop-secondary" type="button" onClick={() => navigate(`/speaking-workshops/${topic.id}`)}>Change mode</button>
      </header>

      <nav className="workshop-part-tabs" aria-label="Speaking part">
        {[1, 2, 3, 4].map((number) => (
          <button key={number} type="button" className={part === number ? "is-active" : ""} onClick={() => setPart(number)}>
            Part {number}<small>{topic.counts[number]} {number === 1 ? "questions" : "tasks"}</small>
          </button>
        ))}
      </nav>

      <section className="workshop-teacher-toolbar">
        <label>
          <span>Task</span>
          <select value={isRandomPart1Set ? "random" : taskIndex} onChange={(event) => {
            if (event.target.value === "random") return;
            setRandomPart1Set(null);
            setTaskIndex(Number(event.target.value));
          }}>
            {isRandomPart1Set ? <option value="random">Random set</option> : null}
            {items.map((item, index) => <option key={item.id} value={index}>{index + 1}. {item.title}</option>)}
          </select>
        </label>
        {isRelaxedPractice && part === 1 ? (
          <button className="workshop-secondary" type="button" onClick={generatePart1Set}>
            {isRandomPart1Set ? "Generate 3 new questions" : "Generate 3 random questions"}
          </button>
        ) : null}
        <div className="workshop-timing-choice" role="group" aria-label="Timer setting">
          <span>Timing</span>
          <button type="button" className={timing === "off" ? "is-active" : ""} onClick={() => setTiming("off")}>Off</button>
          <button type="button" className={timing === "suggested" ? "is-active" : ""} onClick={() => setTiming("suggested")}>Recommended</button>
        </div>
        {!isRelaxedPractice || canUseExamPractice ? (
          <button className="workshop-secondary" type="button" disabled={!topic.visualsReady} onClick={() => navigate(`/speaking-workshops/${topic.id}/practice/${part}`)}>
            {topic.visualsReady ? "Open exam practice" : "Exam practice opens with visuals"}
          </button>
        ) : null}
      </section>

      {timing === "suggested" ? (
        <div className="workshop-timer-row">
          {part === 4 ? <ClassroomTimer key={`${current?.id}-prep`} seconds={60} label="Preparation" /> : null}
          <ClassroomTimer key={`${current?.id}-speak-${part}`} seconds={timerSeconds} label={part === 4 ? "Speaking" : "Recommended speaking time"} />
          <p>{meta.timing}</p>
        </div>
      ) : null}

      <article className="workshop-task-stage">
        <div className="workshop-task-number">{isRandomPart1Set ? "RANDOM SET" : <>{String(taskIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</>}</div>
        <h2>{current?.title}</h2>

        {part === 2 ? <Photo src={current.image} alt={current.alt} brief={current.photoBriefs?.[0]?.text} /> : null}
        {part === 3 ? (
          <div className="workshop-photo-pair">
            <Photo src={current.photoA.src} alt={current.photoA.alt} label="A" brief={current.photoBriefs?.[0]?.text} />
            <Photo src={current.photoB.src} alt={current.photoB.alt} label="B" brief={current.photoBriefs?.[1]?.text} />
          </div>
        ) : null}

        {!isRelaxedPractice && current?.photoBriefs?.length ? (
          <details className="workshop-photo-briefs">
            <summary>Original photo brief</summary>
            {current.photoBriefs.map((brief, index) => <p key={index}>{brief.label ? <strong>Photo {brief.label}: </strong> : null}{brief.text}</p>)}
          </details>
        ) : null}

        <ol className="workshop-question-list">
          {(current?.allQuestions || current?.questions || []).map((question, index) => <li key={index}>{question}</li>)}
        </ol>

        {isRandomPart1Set ? (
          <footer className="workshop-stage-actions">
            <button type="button" onClick={() => setRandomPart1Set(null)}>← Full question bank</button>
            <button type="button" onClick={generatePart1Set}>Another random set →</button>
          </footer>
        ) : (
          <footer className="workshop-stage-actions">
            <button type="button" disabled={taskIndex === 0} onClick={() => setTaskIndex((value) => Math.max(0, value - 1))}>← Previous</button>
            <button type="button" disabled={taskIndex >= items.length - 1} onClick={() => setTaskIndex((value) => Math.min(items.length - 1, value + 1))}>Next →</button>
          </footer>
        )}
      </article>
    </div>
  );
}
