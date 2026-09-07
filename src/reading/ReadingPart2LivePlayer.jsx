import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Save, Users } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { useParams } from "react-router-dom";
import { saveReadingPart2LiveProgress } from "../api/liveGames.js";
import Seo from "../components/common/Seo.jsx";
import { auth, rtdb } from "../firebase.js";
import { toast } from "../utils/toast.js";
import { getReadingPart2LiveScore, getReadingPart2TeacherTask, READING_PART2_LIVE_GAME_TYPE } from "./part2Tasks.js";
import { ReadingPart2FullReview, ReadingPart2LiveTask } from "./ReadingPart2LiveShared.jsx";
import "./readingPart1Live.css";
import "./readingPart2Live.css";

const PHASE_LABELS = { lobby: "Waiting", task: "Independent work", review: "Class review", finished: "Complete" };

export default function ReadingPart2LivePlayer() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [drafts, setDrafts] = useState({});
  const [saveStates, setSaveStates] = useState({});
  const saveVersions = useRef({});

  useEffect(() => onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
    setGame(snapshot.exists() ? snapshot.val() : null);
    setLoading(false);
  }), [gameId]);

  const uid = auth.currentUser?.uid;
  const player = uid ? game?.players?.[uid] : null;
  const taskIds = game?.taskIds || (game?.taskId ? [game.taskId] : []);
  const tasks = taskIds.map(getReadingPart2TeacherTask).filter(Boolean);
  const phase = game?.state?.phase || "lobby";
  const task = tasks[Math.min(activeTaskIndex, Math.max(0, tasks.length - 1))];
  const reviewIndex = Math.min(Number(game?.state?.reviewIndex || 0), Math.max(0, tasks.length - 1));
  const reviewTask = tasks[reviewIndex];

  function getSavedProgress(selectedTask) {
    if (!player || !selectedTask) return null;
    return player.readingPart2Submissions?.[selectedTask.id]
      || (player.readingPart2Submission?.taskId === selectedTask.id ? player.readingPart2Submission : null);
  }

  function getPositions(selectedTask) {
    if (!selectedTask) return {};
    if (Object.prototype.hasOwnProperty.call(drafts, selectedTask.id)) return drafts[selectedTask.id];
    return getSavedProgress(selectedTask)?.positions || {};
  }

  function getCandidateIds(selectedTask) {
    if (!selectedTask) return [];
    return game?.candidateIdsByTask?.[selectedTask.id] || (selectedTask.id === game?.taskId ? game?.candidateIds : []) || [];
  }

  async function savePositions(selectedTask, nextPositions) {
    if (!selectedTask || phase !== "task") return;
    setDrafts((current) => ({ ...current, [selectedTask.id]: nextPositions }));
    const version = (saveVersions.current[selectedTask.id] || 0) + 1;
    saveVersions.current[selectedTask.id] = version;
    setSaveStates((current) => ({ ...current, [selectedTask.id]: "saving" }));
    try {
      await saveReadingPart2LiveProgress({ gameId, taskId: selectedTask.id, positions: nextPositions });
      if (saveVersions.current[selectedTask.id] === version) {
        setSaveStates((current) => ({ ...current, [selectedTask.id]: "saved" }));
      }
    } catch (error) {
      console.error("[ReadingPart2LivePlayer] progress save failed", error);
      if (saveVersions.current[selectedTask.id] === version) {
        setSaveStates((current) => ({ ...current, [selectedTask.id]: "error" }));
        toast(error.message || "Your sentence order could not be saved.");
      }
    }
  }

  if (loading) return <main className="rp1-live-page"><p>Joining Reading Part 2 room…</p></main>;
  if (!game || game.type !== READING_PART2_LIVE_GAME_TYPE || !tasks.length) return <main className="rp1-live-page"><h1>Reading Part 2 live</h1><p>Session not found.</p></main>;
  if (!player) return <main className="rp1-live-page"><h1>Reading Part 2 live</h1><p>You have not joined this session. Return to the join page and enter the PIN.</p></main>;

  const currentPositions = getPositions(task);
  const currentCount = Object.keys(currentPositions).length;
  const reviewPositions = getPositions(reviewTask);

  return (
    <main className="rp1-live-page">
      <Seo title="Reading Part 2 Live Session" description="Student Aptis Reading Part 2 live classroom activity." />
      <header className="rp1-live-header"><div><p>Aptis Reading Part 2 · Live classroom</p><h1>{phase === "review" ? reviewTask.subtitle || reviewTask.title : task.subtitle || task.title}</h1><span>{tasks.length} {tasks.length === 1 ? "task" : "tasks"} in this session</span></div><div className="rp1-live-phase"><span>{PHASE_LABELS[phase]}</span><strong>{phase === "review" ? `Task ${reviewIndex + 1} of ${tasks.length}` : player.name}</strong></div></header>

      {phase === "lobby" ? <section className="rp1-live-stage rp1-live-wait"><Users size={44} /><h2>You’re in the room</h2><p>Your teacher will open all selected tasks when everyone is ready.</p></section> : null}

      {phase === "task" ? (
        <section className="rp1-live-stage">
          <div className="rp1-live-status"><Save size={21} /><div><strong>Work through the tasks in your own time</strong><span>Every placement is saved automatically. You can move between tasks whenever you like.</span></div></div>
          <TaskNavigator activeIndex={activeTaskIndex} getPositions={getPositions} onSelect={setActiveTaskIndex} tasks={tasks} />
          <ReadingPart2LiveTask candidateIds={getCandidateIds(task)} onPositionsChange={(next) => savePositions(task, next)} positions={currentPositions} task={task} />
          <div className="rp2-task-footer">
            <span className="rp2-save-state">{saveStates[task.id] === "saving" ? "Saving…" : saveStates[task.id] === "error" ? "Save failed" : currentCount ? `Saved · ${currentCount}/5 placed` : "Not started"}</span>
            <div className="rp1-live-actions">
              <button className="rp1-live-primary" disabled={activeTaskIndex === 0} onClick={() => setActiveTaskIndex((index) => index - 1)} type="button"><ChevronLeft size={17} /> Previous</button>
              <button className="rp1-live-primary" disabled={activeTaskIndex === tasks.length - 1} onClick={() => setActiveTaskIndex((index) => index + 1)} type="button">Next <ChevronRight size={17} /></button>
            </div>
          </div>
        </section>
      ) : null}

      {phase === "review" ? (
        <section className="rp1-live-stage">
          <div className="rp1-live-status"><CheckCircle2 size={21} /><div><strong>{getReadingPart2LiveScore(reviewTask, { positions: reviewPositions })} of 5 correctly placed</strong><span>Your complete order stays visible below with corrective feedback.</span></div></div>
          <ReadingPart2FullReview playerPositions={reviewPositions} task={reviewTask} />
        </section>
      ) : null}

      {phase === "finished" ? <PlayerReport getPositions={getPositions} tasks={tasks} /> : null}
    </main>
  );
}

function TaskNavigator({ activeIndex, getPositions, onSelect, tasks }) {
  return <nav aria-label="Session tasks" className="rp2-task-nav">{tasks.map((task, index) => {
    const count = Object.keys(getPositions(task)).length;
    return <button className={`${index === activeIndex ? "is-active" : ""} ${count === 5 ? "is-complete" : ""}`} key={task.id} onClick={() => onSelect(index)} type="button"><span>Task {index + 1} · {count}/5 placed</span><strong>{task.subtitle || task.title}</strong></button>;
  })}</nav>;
}

function PlayerReport({ getPositions, tasks }) {
  const score = tasks.reduce((sum, task) => sum + getReadingPart2LiveScore(task, { positions: getPositions(task) }), 0);
  return <section className="rp1-live-stage rp1-live-report"><CheckCircle2 size={44} /><span>Session complete</span><h2>{score} / {tasks.length * 5}</h2><p>Your saved work from every task is included.</p><div>{tasks.map((task, index) => {
    const positions = getPositions(task);
    const taskScore = getReadingPart2LiveScore(task, { positions });
    return <article className={taskScore === 5 ? "is-correct" : "is-wrong"} key={task.id}><span>Task {index + 1}</span><h3>{task.subtitle || task.title}</h3><strong>{taskScore} / 5</strong><p>{Object.keys(positions).length}/5 sentences placed</p></article>;
  })}</div></section>;
}
