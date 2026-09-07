import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clipboard, Clock3, Play, Users } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "react-router-dom";
import { setLiveGameState, setLiveGameStatus } from "../api/liveGames.js";
import Seo from "../components/common/Seo.jsx";
import {
  logAptisReadingLiveFinished,
  logAptisReadingLiveReviewStarted,
  logAptisReadingLiveStarted,
  rtdb,
} from "../firebase.js";
import { getSitePath } from "../siteConfig.js";
import {
  getReadingPart2LiveScore,
  getReadingPart2TeacherTask,
  READING_PART2_LIVE_GAME_TYPE,
} from "./part2Tasks.js";
import { ReadingPart2FullReview } from "./ReadingPart2LiveShared.jsx";
import "./readingPart1Live.css";
import "./readingPart2Live.css";

const PHASE_LABELS = {
  lobby: "Waiting room",
  task: "Independent work",
  review: "Whole-task review",
  finished: "Complete",
};

function getPlayerTaskProgress(player, task) {
  if (!player || !task) return null;
  return player.readingPart2Submissions?.[task.id]
    || (player.readingPart2Submission?.taskId === task.id ? player.readingPart2Submission : null);
}

function getPlacedCount(progress) {
  return Object.keys(progress?.positions || {}).length;
}

export default function ReadingPart2LiveHost({ user }) {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copyState, setCopyState] = useState("");

  useEffect(() => onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
    setGame(snapshot.exists() ? snapshot.val() : null);
    setLoading(false);
  }), [gameId]);

  const taskIds = game?.taskIds || (game?.taskId ? [game.taskId] : []);
  const tasks = taskIds.map(getReadingPart2TeacherTask).filter(Boolean);
  const phase = game?.state?.phase || "lobby";
  const reviewIndex = Math.min(Number(game?.state?.reviewIndex || 0), Math.max(0, tasks.length - 1));
  const reviewTask = tasks[reviewIndex];
  const players = useMemo(() => Object.entries(game?.players || {})
    .map(([id, player]) => ({ id, ...player }))
    .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0)), [game?.players]);
  const isHost = Boolean(user && game?.ownerUid === user.uid);
  const joinPath = getSitePath("/live/join");
  const joinUrl = typeof window === "undefined" ? "" : `${window.location.origin}${joinPath}?pin=${encodeURIComponent(game?.pin || "")}`;
  const completedPairs = players.reduce((total, player) => total + tasks.filter((task) => getPlacedCount(getPlayerTaskProgress(player, task)) === 5).length, 0);
  const totalPairs = players.length * tasks.length;
  const startedPairs = players.reduce((total, player) => total + tasks.filter((task) => getPlacedCount(getPlayerTaskProgress(player, task)) > 0).length, 0);
  const activityDetails = {
    gameId,
    pin: game?.pin || null,
    activityType: "reading-task",
    activityTitle: game?.title || `Aptis Reading Part 2 · ${tasks.length}-task session`,
    part: 2,
    taskId: tasks[0]?.id || null,
    taskIds: tasks.map((task) => task.id),
    taskCount: tasks.length,
  };

  async function beginWork() {
    if (!players.length) return;
    await setLiveGameStatus(gameId, "in-progress");
    await setLiveGameState(gameId, { phase: "task", reviewIndex: 0, phaseStartedAt: Date.now() });
    await logAptisReadingLiveStarted({ ...activityDetails, playerCount: players.length });
  }

  async function beginReview() {
    const incompletePairs = totalPairs - completedPairs;
    if (incompletePairs > 0 && !window.confirm(
      `${incompletePairs} student task${incompletePairs === 1 ? " is" : "s are"} not complete. Saved partial answers will still appear in the review. Start the review now?`,
    )) return;
    await setLiveGameState(gameId, { phase: "review", reviewIndex: 0, phaseStartedAt: Date.now() });
    await logAptisReadingLiveReviewStarted({
      ...activityDetails,
      playerCount: players.length,
      startedTaskCount: startedPairs,
      completedTaskCount: completedPairs,
      possibleTaskCount: totalPairs,
    });
  }

  async function nextReview() {
    if (reviewIndex < tasks.length - 1) {
      await setLiveGameState(gameId, { reviewIndex: reviewIndex + 1 });
      return;
    }
    await setLiveGameStatus(gameId, "finished");
    await setLiveGameState(gameId, { phase: "finished", phaseStartedAt: Date.now() });
    await logAptisReadingLiveFinished({
      ...activityDetails,
      playerCount: players.length,
      startedTaskCount: startedPairs,
      completedTaskCount: completedPairs,
      possibleTaskCount: totalPairs,
    });
  }

  async function copyJoinLink() {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopyState("Copied");
      window.setTimeout(() => setCopyState(""), 1500);
    } catch {
      setCopyState("Copy failed");
    }
  }

  if (loading) return <main className="rp1-live-page"><p>Loading Reading Part 2 room…</p></main>;
  if (!game || game.type !== READING_PART2_LIVE_GAME_TYPE || !tasks.length) return <main className="rp1-live-page"><h1>Reading Part 2 live</h1><p>Session not found.</p></main>;
  if (!isHost) return <main className="rp1-live-page"><h1>Reading Part 2 live</h1><p>You are not the host of this session.</p></main>;

  return (
    <main className="rp1-live-page">
      <Seo title="Host Reading Part 2" description="Teacher-controlled Aptis Reading Part 2 classroom session." />
      <header className="rp1-live-header">
        <div><p>Aptis Reading Part 2 · Live classroom</p><h1>{phase === "review" ? reviewTask.subtitle || reviewTask.title : game.title}</h1><span>{tasks.length} {tasks.length === 1 ? "task" : "tasks"} selected</span></div>
        <div className="rp1-live-phase"><span>{PHASE_LABELS[phase]}</span><strong>{phase === "review" ? `Task ${reviewIndex + 1} of ${tasks.length}` : phase === "task" ? `${completedPairs} / ${totalPairs} completed` : `${players.length} joined`}</strong></div>
      </header>

      {phase === "lobby" ? (
        <section className="rp1-live-stage rp1-live-lobby">
          <div className="rp1-live-pin"><p>Students join with PIN</p><strong>{String(game.pin || "").replace(/^(\d{3})(\d{3})$/, "$1 $2")}</strong><QRCodeSVG value={joinUrl} size={184} includeMargin /><button type="button" onClick={copyJoinLink}><Clipboard size={17} /> {copyState || "Copy join link"}</button></div>
          <div className="rp1-live-roster">
            <header><div><span>Classroom</span><h2>{players.length} {players.length === 1 ? "student" : "students"} joined</h2></div><Users size={26} /></header>
            <div className="rp1-live-roster-list">{players.map((player) => <span key={player.id}>{player.name}</span>)}{!players.length ? <p>Waiting for students…</p> : null}</div>
            <div className="rp2-session-task-list"><span>Selected tasks</span>{tasks.map((task, index) => <p key={task.id}><strong>Task {index + 1}</strong> {task.subtitle || task.title}</p>)}</div>
            <button className="rp1-live-primary" disabled={!players.length} onClick={beginWork} type="button"><Play size={18} /> Open all tasks</button>
          </div>
        </section>
      ) : null}

      {phase === "task" ? (
        <section className="rp1-live-stage">
          <div className="rp1-live-status"><Clock3 size={21} /><div><strong>Students are working independently · <WorkElapsed startedAt={game.state?.phaseStartedAt} /></strong><span>Every sentence placement is saved automatically. Start the review whenever you are ready.</span></div></div>
          <WorkDashboard players={players} tasks={tasks} />
          <div className="rp1-live-actions"><button className="rp1-live-primary" onClick={beginReview} type="button">End work and start review</button></div>
        </section>
      ) : null}

      {phase === "review" && reviewTask ? (
        <section className="rp1-live-stage">
          <div className="rp1-live-status"><CheckCircle2 size={21} /><div><strong>Reviewing the complete task</strong><span>All six sentences stay visible. Class accuracy is shown for every position.</span></div></div>
          <ReadingPart2FullReview players={players} task={reviewTask} />
          <div className="rp1-live-actions"><button className="rp1-live-primary" onClick={nextReview} type="button">{reviewIndex === tasks.length - 1 ? "Finish session" : `Review task ${reviewIndex + 2}`}</button></div>
        </section>
      ) : null}

      {phase === "finished" ? <HostReport players={players} tasks={tasks} /> : null}
    </main>
  );
}

function WorkElapsed({ startedAt }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const totalSeconds = Math.max(0, Math.floor((now - Number(startedAt || now)) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return <span className="rp2-elapsed">{minutes}:{seconds}</span>;
}

function WorkDashboard({ players, tasks }) {
  return (
    <section className="rp2-work-dashboard">
      {tasks.map((task, index) => {
        const counts = players.map((player) => getPlacedCount(getPlayerTaskProgress(player, task)));
        const completed = counts.filter((count) => count === 5).length;
        const started = counts.filter((count) => count > 0).length;
        const placements = counts.reduce((total, count) => total + count, 0);
        return <article key={task.id}><div><span>Task {index + 1}</span><h3>{task.subtitle || task.title}</h3></div><strong>{completed}/{players.length} complete</strong><p>{started} started · {placements} of {players.length * 5} sentence positions saved</p></article>;
      })}
    </section>
  );
}

function HostReport({ players, tasks }) {
  const possiblePerStudent = tasks.length * 5;
  const scores = players.map((player) => tasks.reduce((total, task) => (
    total + getReadingPart2LiveScore(task, getPlayerTaskProgress(player, task) || { positions: {} })
  ), 0));
  const average = scores.length ? scores.reduce((total, score) => total + score, 0) / scores.length : 0;
  const studentsWithWork = players.filter((player) => tasks.some((task) => getPlacedCount(getPlayerTaskProgress(player, task)) > 0)).length;

  return (
    <section className="rp1-live-stage rp1-live-report">
      <CheckCircle2 size={44} /><span>Session complete</span><h2>Class average: {average.toFixed(1)} / {possiblePerStudent}</h2><p>{studentsWithWork} of {players.length} students saved work.</p>
      <div>{tasks.map((task, index) => {
        const taskScores = players.map((player) => getReadingPart2LiveScore(task, getPlayerTaskProgress(player, task) || { positions: {} }));
        const taskAverage = taskScores.length ? taskScores.reduce((total, score) => total + score, 0) / taskScores.length : 0;
        const completed = players.filter((player) => getPlacedCount(getPlayerTaskProgress(player, task)) === 5).length;
        return <article key={task.id}><span>Task {index + 1}</span><h3>{task.subtitle || task.title}</h3><strong>{taskAverage.toFixed(1)} / 5 average</strong><p>{completed} of {players.length} completed</p></article>;
      })}</div>
    </section>
  );
}
