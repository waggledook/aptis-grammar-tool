import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clipboard, Clock3, Lightbulb, Play, Users } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "react-router-dom";
import { setLiveGameState, setLiveGameStatus } from "../../api/liveGames.js";
import Seo from "../../components/common/Seo.jsx";
import { rtdb } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import {
  getOteAdvancedReadingPart2TeacherTask,
  OTE_ADVANCED_READING_PART2_LIVE_GAME_TYPE,
} from "./data/oteAdvancedReadingPart2TeacherTasks.js";
import { OteReadingPart2FullReview, OteReadingPart2Sources } from "./OteAdvancedReadingPart2LiveShared.jsx";
import "../../reading/readingPart1Live.css";
import "../../reading/readingPart3Live.css";
import "./styles/reading-part2-live.css";

const PHASE_LABELS = { lobby: "Waiting room", task: "Independent work", review: "Whole-task review", finished: "Complete" };

function getAnswers(player, task) {
  if (!player?.oteReadingPart2Submission || !task) return {};
  return player.oteReadingPart2Submission.taskId === task.id
    ? player.oteReadingPart2Submission.answers || {}
    : {};
}

function getScore(task, answers = {}) {
  return task.questions.filter((question) => answers[question.id] === question.answer).length;
}

export default function OteAdvancedReadingPart2LiveHost({ user }) {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copyState, setCopyState] = useState("");

  useEffect(() => onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
    setGame(snapshot.exists() ? snapshot.val() : null);
    setLoading(false);
  }), [gameId]);

  const task = getOteAdvancedReadingPart2TeacherTask(game?.taskId);
  const phase = game?.state?.phase || "lobby";
  const whyRevealed = Boolean(game?.state?.whyRevealed);
  const players = useMemo(() => Object.entries(game?.players || {})
    .map(([id, player]) => ({ id, ...player }))
    .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0)), [game?.players]);
  const isHost = Boolean(user && game?.ownerUid === user.uid);
  const completedCount = players.filter((player) => Object.keys(getAnswers(player, task)).length === task?.questions.length).length;
  const joinUrl = typeof window === "undefined" ? "" : `${window.location.origin}${getSitePath("/live/join")}?pin=${encodeURIComponent(game?.pin || "")}`;

  async function beginWork() {
    if (!players.length) return;
    await setLiveGameStatus(gameId, "in-progress");
    await setLiveGameState(gameId, { phase: "task", phaseStartedAt: Date.now(), whyRevealed: false });
  }

  async function beginReview() {
    const incomplete = players.length - completedCount;
    if (incomplete > 0 && !window.confirm(`${incomplete} student${incomplete === 1 ? " has" : "s have"} not answered all seven questions. Saved partial answers will still appear. Start the review now?`)) return;
    await setLiveGameState(gameId, { phase: "review", phaseStartedAt: Date.now(), whyRevealed: false });
  }

  async function finishSession() {
    await setLiveGameStatus(gameId, "finished");
    await setLiveGameState(gameId, { phase: "finished", phaseStartedAt: Date.now() });
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

  if (loading) return <main className="rp1-live-page"><p>Loading OTE Reading Part 2 room…</p></main>;
  if (!game || game.type !== OTE_ADVANCED_READING_PART2_LIVE_GAME_TYPE || !task) return <main className="rp1-live-page"><h1>OTE Reading Part 2 live</h1><p>Session not found.</p></main>;
  if (!isHost) return <main className="rp1-live-page"><h1>OTE Reading Part 2 live</h1><p>You are not the host of this session.</p></main>;

  return (
    <main className="rp1-live-page ote-part2-live-page">
      <Seo title={`Host OTE Reading Part 2: ${task.title}`} description="Teacher-controlled OTE Advanced Reading Part 2 classroom session." />
      <header className="rp1-live-header"><div><p>OTE Advanced Reading Part 2 · Live classroom</p><h1>{task.title}</h1></div><div className="rp1-live-phase"><span>{PHASE_LABELS[phase]}</span><strong>{phase === "task" ? `${completedCount}/${players.length} complete` : `${players.length} joined`}</strong></div></header>

      {phase === "lobby" ? (
        <section className="rp1-live-stage rp1-live-lobby">
          <div className="rp1-live-pin"><p>Students join with PIN</p><strong>{String(game.pin || "").replace(/^(\d{3})(\d{3})$/, "$1 $2")}</strong><QRCodeSVG value={joinUrl} size={184} includeMargin /><button type="button" onClick={copyJoinLink}><Clipboard size={17} /> {copyState || "Copy join link"}</button></div>
          <div className="rp1-live-roster"><header><div><span>Classroom</span><h2>{players.length} {players.length === 1 ? "student" : "students"} joined</h2></div><Users size={26} /></header><div className="rp1-live-roster-list">{players.map((player) => <span key={player.id}>{player.name}</span>)}{!players.length ? <p>Waiting for students…</p> : null}</div><button className="rp1-live-primary" disabled={!players.length} onClick={beginWork} type="button"><Play size={18} /> Open the task</button></div>
        </section>
      ) : null}

      {phase === "task" ? (
        <section className="rp1-live-stage">
          <div className="rp1-live-status"><Clock3 size={21} /><div><strong>Students are working independently · <WorkElapsed startedAt={game.state?.phaseStartedAt} /></strong><span>Answers save automatically. Start the review whenever you are ready.</span></div></div>
          <div className="rp3-player-progress">{players.map((player) => { const count = Object.keys(getAnswers(player, task)).length; return <span className={count === task.questions.length ? "is-complete" : ""} key={player.id}>{player.name} · {count}/{task.questions.length}</span>; })}</div>
          <div className="rp1-live-actions"><button className="rp1-live-primary" onClick={beginReview} type="button">End work and start review</button></div>
        </section>
      ) : null}

      {phase === "review" ? (
        <section className="rp1-live-stage">
          <div className="rp1-live-status"><CheckCircle2 size={21} /><div><strong>Reviewing all seven matches</strong><span>{whyRevealed ? "Answer explanations are now visible to everyone." : "Correct answers and class responses are visible; explanations remain hidden."}</span></div></div>
          <OteReadingPart2Sources task={task} />
          <OteReadingPart2FullReview players={players} showWhy={whyRevealed} task={task} />
          <div className="rp1-live-actions">
            {!whyRevealed ? <button className="rp1-live-primary" onClick={() => setLiveGameState(gameId, { whyRevealed: true })} type="button"><Lightbulb size={18} /> Reveal why</button> : null}
            <button className="rp1-live-secondary" onClick={finishSession} type="button">Finish session</button>
          </div>
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
  const completed = players.filter((player) => Object.keys(getAnswers(player, task)).length === task.questions.length).length;
  return <section className="rp1-live-stage rp1-live-report"><CheckCircle2 size={44} /><span>Session complete</span><h2>Class average: {average.toFixed(1)} / {task.questions.length}</h2><p>{completed} of {players.length} students answered all seven questions.</p></section>;
}
