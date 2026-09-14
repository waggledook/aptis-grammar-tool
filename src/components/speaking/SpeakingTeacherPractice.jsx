import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, MessageCircle, Mic2, Presentation, Users } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SpeakingAssignButton from "./SpeakingAssignButton.jsx";
import "./SpeakingTeacherPractice.css";

const PART_DETAILS = {
  2: {
    title: "Describe a photograph",
    timing: "45 seconds per question",
    fixedQuestion: "Describe the photograph.",
  },
  3: {
    title: "Describe and compare",
    timing: "45 seconds per question",
    fixedQuestion: "Tell me what you can see in the two photographs.",
  },
  4: {
    title: "Two-minute talk",
    timing: "1 minute to prepare · 2 minutes to speak",
  },
};

function formatTime(value) {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function PracticeTimer({ seconds, label }) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setLeft(seconds);
    setRunning(false);
  }, [seconds]);

  useEffect(() => {
    if (!running || left <= 0) return undefined;
    const timerId = window.setInterval(() => setLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timerId);
  }, [left, running]);

  useEffect(() => {
    if (left === 0) setRunning(false);
  }, [left]);

  return (
    <div className={`teacher-speaking-timer ${left === 0 ? "is-finished" : ""}`}>
      <div>
        <span>{label}</span>
        <strong aria-live="polite">{formatTime(left)}</strong>
      </div>
      <div className="teacher-speaking-timer-actions">
        <button type="button" onClick={() => setRunning((value) => !value)}>
          {running ? "Pause" : left === 0 ? "Restart" : "Start"}
        </button>
        <button type="button" onClick={() => { setRunning(false); setLeft(seconds); }}>Reset</button>
      </div>
    </div>
  );
}

function ModeChoice({ partNumber, taskCount, isTeacher, onChoose }) {
  const detail = PART_DETAILS[partNumber];

  return (
    <main className="teacher-speaking-resource">
      <section className="teacher-speaking-hero">
        <span className="teacher-speaking-kicker">Aptis Speaking · Part {partNumber}</span>
        <h1>{detail.title}</h1>
        <p>Choose a low-pressure practice board, the complete timed exam flow, or a teacher-led classroom view.</p>
        <div className="teacher-speaking-summary">
          <span><strong>{taskCount}</strong> extra tasks</span>
          <span><strong>3</strong> questions per task</span>
          <span><strong>Flexible</strong> class or home use</span>
        </div>
      </section>

      <section className="teacher-speaking-mode-grid" aria-label="Choose a practice mode">
        <button className="is-relaxed" type="button" onClick={() => onChoose("relaxed")}>
          <span className="teacher-speaking-mode-icon" aria-hidden="true"><MessageCircle size={28} /></span>
          <span className="teacher-speaking-kicker">At your own pace</span>
          <h2>Relaxed practice</h2>
          <p>Browse every task without spoken instructions, automatic progression, recording or feedback.</p>
          <strong>Browse the task bank <ArrowRight size={17} /></strong>
        </button>

        <button className="is-exam" type="button" onClick={() => onChoose("exam")}>
          <span className="teacher-speaking-mode-icon" aria-hidden="true"><Mic2 size={28} /></span>
          <span className="teacher-speaking-kicker">Individual mode</span>
          <h2>Exam practice</h2>
          <p>Use the original Aptis timings, spoken instructions, microphone recording and AI feedback.</p>
          <strong>Open timed practice <ArrowRight size={17} /></strong>
        </button>

        {isTeacher ? (
          <button className="is-teaching" type="button" onClick={() => onChoose("teaching")}>
            <span className="teacher-speaking-mode-icon" aria-hidden="true"><Presentation size={28} /></span>
            <span className="teacher-speaking-kicker">Classroom mode</span>
            <h2>Teaching mode</h2>
            <p>Project the task bank, control the optional timers and open simple teaching prompts when useful.</p>
            <strong>Open teaching board <ArrowRight size={17} /></strong>
          </button>
        ) : null}
      </section>
    </main>
  );
}

function TaskVisual({ partNumber, task }) {
  if (partNumber === 2) {
    return (
      <figure className="teacher-speaking-photo">
        <img src={task.image} alt={task.alt || "Aptis speaking practice photograph"} />
      </figure>
    );
  }

  if (partNumber === 3) {
    return (
      <div className="teacher-speaking-photo-pair">
        {[task.photoA, task.photoB].map((photo, index) => (
          <figure className="teacher-speaking-photo" key={index}>
            <span>{index === 0 ? "A" : "B"}</span>
            <img src={photo.src} alt={photo.alt || `Practice photograph ${index === 0 ? "A" : "B"}`} />
          </figure>
        ))}
      </div>
    );
  }

  return null;
}

function TeacherNotes({ partNumber, task }) {
  const feedback = task.photoFeedback;

  return (
    <aside className="teacher-speaking-notes">
      <div className="teacher-speaking-notes-heading">
        <Users size={20} aria-hidden="true" />
        <div>
          <span className="teacher-speaking-kicker">Teacher prompts</span>
          <h3>Turn this into a conversation</h3>
        </div>
      </div>
      <ul>
        <li>Give learners quiet planning time, then let them rehearse with a partner before speaking to the class.</li>
        <li>Ask the listener to note one strong phrase and ask one natural follow-up question.</li>
        <li>Repeat the task with the recommended timer only after learners have built their answer once.</li>
      </ul>
      {partNumber === 2 && feedback ? (
        <div className="teacher-speaking-language">
          <p><strong>Details to notice:</strong> {feedback.keyDetails?.join(" · ")}</p>
          <p><strong>Useful language:</strong> {feedback.usefulLanguage?.join(" · ")}</p>
        </div>
      ) : null}
    </aside>
  );
}

export function SpeakingTeacherPracticeBoard({
  partNumber,
  tasks,
  user,
  routeBasePath,
  activityId,
  variant = "relaxed",
  onChangeMode,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTaskId = searchParams.get("task") || "";
  const requestedIndex = tasks.findIndex((task) => task.id === requestedTaskId);
  const [taskIndex, setTaskIndex] = useState(requestedIndex >= 0 ? requestedIndex : 0);
  const [timing, setTiming] = useState(variant === "teaching" ? "recommended" : "off");
  const task = tasks[taskIndex] || tasks[0];
  const detail = PART_DETAILS[partNumber];
  const questions = useMemo(() => {
    const taskQuestions = task?.qs || task?.questions || [];
    return detail.fixedQuestion ? [detail.fixedQuestion, ...taskQuestions] : taskQuestions;
  }, [detail.fixedQuestion, task]);

  useEffect(() => {
    if (requestedIndex >= 0) setTaskIndex(requestedIndex);
  }, [requestedIndex]);

  function selectTask(nextIndex) {
    setTaskIndex(nextIndex);
    const next = new URLSearchParams(searchParams);
    next.set("mode", variant);
    next.set("task", tasks[nextIndex].id);
    setSearchParams(next, { replace: true });
  }

  return (
    <main className="teacher-speaking-resource teacher-speaking-board">
      <header className="teacher-speaking-session-header">
        <div>
          <span className="teacher-speaking-kicker">{variant === "teaching" ? "Teaching mode" : "Relaxed practice"} · Aptis Part {partNumber}</span>
          <h1>{detail.title}</h1>
          <p>{variant === "teaching"
            ? "Lead the task at the pace that suits the room. The timers are independent and never move the class on automatically."
            : "Work through the extra task bank at your own pace. Nothing is recorded and the optional timer never advances the task automatically."}</p>
        </div>
        <button className="teacher-speaking-secondary" type="button" onClick={onChangeMode}>Change mode</button>
      </header>

      <section className="teacher-speaking-toolbar">
        <label>
          <span>Task</span>
          <select value={taskIndex} onChange={(event) => selectTask(Number(event.target.value))}>
            {tasks.map((item, index) => <option key={item.id} value={index}>{index + 1}. {item.title}</option>)}
          </select>
        </label>
        <div className="teacher-speaking-timing-choice" role="group" aria-label="Timer setting">
          <span>Timing</span>
          <button type="button" className={timing === "off" ? "is-active" : ""} onClick={() => setTiming("off")}>Off</button>
          <button type="button" className={timing === "recommended" ? "is-active" : ""} onClick={() => setTiming("recommended")}>Recommended</button>
        </div>
        <SpeakingAssignButton
          user={user}
          activityId={activityId}
          activityLabel={`Aptis Speaking Part ${partNumber} relaxed practice — ${task.title}`}
          routePath={`${routeBasePath}?mode=relaxed&task=${encodeURIComponent(task.id)}`}
          taskId={task.id}
          taskTitle={task.title}
        />
      </section>

      {timing === "recommended" ? (
        <section className="teacher-speaking-timer-row">
          {partNumber === 4 ? <PracticeTimer key={`${task.id}-prep`} seconds={60} label="Preparation" /> : null}
          <PracticeTimer key={`${task.id}-speak`} seconds={partNumber === 4 ? 120 : 45} label={partNumber === 4 ? "Speaking" : "Recommended speaking time"} />
          <p>{detail.timing}</p>
        </section>
      ) : null}

      <article className="teacher-speaking-stage">
        <div className="teacher-speaking-task-number">{String(taskIndex + 1).padStart(2, "0")} / {String(tasks.length).padStart(2, "0")}</div>
        <h2>{task.title}</h2>
        <TaskVisual partNumber={partNumber} task={task} />
        <ol className="teacher-speaking-question-list">
          {questions.map((question, index) => <li key={index}>{question}</li>)}
        </ol>

        {variant === "teaching" ? <TeacherNotes partNumber={partNumber} task={task} /> : null}

        <footer className="teacher-speaking-stage-actions">
          <button type="button" disabled={taskIndex === 0} onClick={() => selectTask(Math.max(0, taskIndex - 1))}>← Previous</button>
          <button type="button" disabled={taskIndex >= tasks.length - 1} onClick={() => selectTask(Math.min(tasks.length - 1, taskIndex + 1))}>Next →</button>
        </footer>
      </article>
    </main>
  );
}

export default function SpeakingTeacherResource({
  partNumber,
  tasks,
  user,
  routeBasePath,
  activityId,
  renderExamPractice,
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedMode = searchParams.get("mode");
  const hasAssignedTask = Boolean(searchParams.get("task"));
  const isTeacher = user?.role === "teacher" || user?.role === "admin";
  const mode = requestedMode || (hasAssignedTask ? "exam" : "choose");

  function openMode(nextMode) {
    navigate(`${routeBasePath}?mode=${nextMode}`);
  }

  if (mode === "relaxed" || (mode === "teaching" && isTeacher)) {
    return (
      <SpeakingTeacherPracticeBoard
        partNumber={partNumber}
        tasks={tasks}
        user={user}
        routeBasePath={routeBasePath}
        activityId={activityId}
        variant={mode}
        onChangeMode={() => navigate(routeBasePath)}
      />
    );
  }

  if (mode === "exam") return renderExamPractice(() => navigate(routeBasePath));

  return (
    <ModeChoice
      partNumber={partNumber}
      taskCount={tasks.length}
      isTeacher={isTeacher}
      onChoose={openMode}
    />
  );
}
