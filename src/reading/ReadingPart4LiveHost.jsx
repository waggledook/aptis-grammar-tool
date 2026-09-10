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
import { getReadingPart4TeacherTask, READING_PART4_LIVE_GAME_TYPE } from "./readingPart4TaskBanks.js";
import { ReadingPart4FullReview, ReadingPart4Headings } from "./ReadingPart4LiveShared.jsx";
import "./readingPart1Live.css";
import "./readingPart3Live.css";
import "./readingPart4Live.css";

const PHASE_LABELS = { lobby: "Waiting room", task: "Independent work", review: "Whole-task review", finished: "Complete" };

function getAnswers(player, task) {
  const submission = player?.readingPart4Submission;
  if (!submission || !task) return {};
  return submission.taskId === task.id ? submission.answers || {} : {};
}

function getScore(task, answers = {}) {
  return task.paragraphs.filter((paragraph) => answers[paragraph.id] === paragraph.answer).length;
}

export default function ReadingPart4LiveHost({ user }) {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copyState, setCopyState] = useState("");

  useEffect(() => onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
    setGame(snapshot.exists() ? snapshot.val() : null);
    setLoading(false);
  }), [gameId]);

  const task = getReadingPart4TeacherTask(game?.taskId);
  const phase = game?.state?.phase || "lobby";
  const players = useMemo(() => Object.entries(game?.players || {}).map(([id, player]) => ({ id, ...player })).sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0)), [game?.players]);
  const isHost = Boolean(user && game?.ownerUid === user.uid);
  const completedCount = players.filter((player) => Object.keys(getAnswers(player, task)).length === 7).length;
  const startedCount = players.filter((player) => Object.keys(getAnswers(player, task)).length > 0).length;
  const joinUrl = typeof window === "undefined" ? "" : `${window.location.origin}${getSitePath("/live/join")}?pin=${encodeURIComponent(game?.pin || "")}`;
  const activityDetails = {
    gameId,
    pin: game?.pin || null,
    activityType: "reading-task",
    activityTitle: game?.title || `Aptis Reading Part 4 · ${task?.title || "Live session"}`,
    part: 4,
    taskId: task?.id || null,
    taskIds: task ? [task.id] : [],
    taskCount: task ? 1 : 0,
  };

  async function beginWork() {
    if (!players.length) return;
    await setLiveGameStatus(gameId, "in-progress");
    await setLiveGameState(gameId, { phase: "task", phaseStartedAt: Date.now() });
    await logAptisReadingLiveStarted({ ...activityDetails, playerCount: players.length });
  }

  async function beginReview() {
    const incomplete = players.length - completedCount;
    if (incomplete > 0 && !window.confirm(`${incomplete} student${incomplete === 1 ? " has" : "s have"} not answered all seven paragraphs. Saved partial answers will still appear. Start the review now?`)) return;
    await setLiveGameState(gameId, { phase: "review", phaseStartedAt: Date.now() });
    await logAptisReadingLiveReviewStarted({
      ...activityDetails,
      playerCount: players.length,
      startedTaskCount: startedCount,
      completedTaskCount: completedCount,
      possibleTaskCount: players.length,
    });
  }

  async function finishSession() {
    await setLiveGameStatus(gameId, "finished");
    await setLiveGameState(gameId, { phase: "finished", phaseStartedAt: Date.now() });
    await logAptisReadingLiveFinished({
      ...activityDetails,
      playerCount: players.length,
      startedTaskCount: startedCount,
      completedTaskCount: completedCount,
      possibleTaskCount: players.length,
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

  if (loading) return <main className="rp1-live-page"><p>Loading Reading Part 4 room…</p></main>;
  if (!game || game.type !== READING_PART4_LIVE_GAME_TYPE || !task) return <main className="rp1-live-page"><h1>Reading Part 4 live</h1><p>Session not found.</p></main>;
  if (!isHost) return <main className="rp1-live-page"><h1>Reading Part 4 live</h1><p>You are not the host of this session.</p></main>;

  return (
    <main className="rp1-live-page">
      <Seo title={`Host Reading Part 4: ${task.title}`} description="Teacher-controlled Aptis Reading Part 4 classroom session." />
      <header className="rp1-live-header"><div><p>Aptis Reading Part 4 · Live classroom</p><h1>{task.title}</h1></div><div className="rp1-live-phase"><span>{PHASE_LABELS[phase]}</span><strong>{phase === "task" ? `${completedCount}/${players.length} complete` : `${players.length} joined`}</strong></div></header>

      {phase === "lobby" ? (
        <section className="rp1-live-stage rp1-live-lobby">
          <div className="rp1-live-pin"><p>Students join with PIN</p><strong>{String(game.pin || "").replace(/^(\d{3})(\d{3})$/, "$1 $2")}</strong><QRCodeSVG value={joinUrl} size={184} includeMargin /><button type="button" onClick={copyJoinLink}><Clipboard size={17} /> {copyState || "Copy join link"}</button></div>
          <div className="rp1-live-roster"><header><div><span>Classroom</span><h2>{players.length} {players.length === 1 ? "student" : "students"} joined</h2></div><Users size={26} /></header><div className="rp1-live-roster-list">{players.map((player) => <span key={player.id}>{player.name}</span>)}{!players.length ? <p>Waiting for students…</p> : null}</div><button className="rp1-live-primary" disabled={!players.length} onClick={beginWork} type="button"><Play size={18} /> Open the task</button></div>
        </section>
      ) : null}

      {phase === "task" ? (
        <section className="rp1-live-stage">
          <div className="rp1-live-status"><Clock3 size={21} /><div><strong>Students are working independently · <WorkElapsed startedAt={game.state?.phaseStartedAt} /></strong><span>Answers save automatically. Start the review whenever you are ready.</span></div></div>
          <div className="rp3-player-progress">{players.map((player) => { const count = Object.keys(getAnswers(player, task)).length; return <span className={count === 7 ? "is-complete" : ""} key={player.id}>{player.name} · {count}/7</span>; })}</div>
          <div className="rp1-live-actions"><button className="rp1-live-primary" onClick={beginReview} type="button">End work and start review</button></div>
        </section>
      ) : null}

      {phase === "review" ? (
        <section className="rp1-live-stage">
          <div className="rp1-live-status"><CheckCircle2 size={21} /><div><strong>Reviewing all seven paragraphs</strong><span>The full text and class response distribution remain visible.</span></div></div>
          <ReadingPart4Headings task={task} />
          <ReadingPart4FullReview players={players} task={task} />
          <div className="rp1-live-actions"><button className="rp1-live-primary" onClick={finishSession} type="button">Finish session</button></div>
        </section>
      ) : null}

      {phase === "finished" ? <HostReport players={players} task={task} /> : null}
    </main>
  );
}

function WorkElapsed({ startedAt }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  const totalSeconds = Math.max(0, Math.floor((now - Number(startedAt || now)) / 1000));
  return <span>{Math.floor(totalSeconds / 60)}:{String(totalSeconds % 60).padStart(2, "0")}</span>;
}

function HostReport({ players, task }) {
  const scores = players.map((player) => getScore(task, getAnswers(player, task)));
  const average = scores.length ? scores.reduce((total, score) => total + score, 0) / scores.length : 0;
  const completed = players.filter((player) => Object.keys(getAnswers(player, task)).length === 7).length;
  return <section className="rp1-live-stage rp1-live-report"><CheckCircle2 size={44} /><span>Session complete</span><h2>Class average: {average.toFixed(1)} / 7</h2><p>{completed} of {players.length} students answered all seven paragraphs.</p></section>;
}
