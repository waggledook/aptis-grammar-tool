import React, { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle2, Clipboard, Play, Send, Users } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "react-router-dom";
import { setLiveGameState, setLiveGameStatus } from "../api/liveGames.js";
import Seo from "../components/common/Seo.jsx";
import { rtdb } from "../firebase.js";
import { getSitePath } from "../siteConfig.js";
import {
  APTIS_READING_PART1_LIVE_GAME_TYPE,
  getReadingPart1LiveScore,
  getReadingPart1TeacherTask,
} from "./readingPart1TeacherTasks.js";
import {
  ReadingPart1Distribution,
  ReadingPart1LiveTask,
} from "./ReadingPart1LiveShared.jsx";
import "./readingPart1Live.css";

const PHASE_LABELS = { lobby: "Waiting room", task: "Students answering", review: "Class review", finished: "Complete" };

export default function ReadingPart1LiveHost({ user }) {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copyState, setCopyState] = useState("");

  useEffect(() => onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
    setGame(snapshot.exists() ? snapshot.val() : null);
    setLoading(false);
  }), [gameId]);

  const task = getReadingPart1TeacherTask(game?.taskId);
  const phase = game?.state?.phase || "lobby";
  const reviewIndex = Number(game?.state?.reviewIndex || 0);
  const answerableGaps = task?.gaps.filter((gap) => !gap.fixed) || [];
  const reviewGap = answerableGaps[reviewIndex];
  const players = useMemo(() => Object.entries(game?.players || {})
    .map(([id, player]) => ({ id, ...player }))
    .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0)), [game?.players]);
  const submissions = players.filter((player) => player.readingPart1Submission?.taskId === task?.id);
  const isHost = Boolean(user && game?.ownerUid === user.uid);
  const joinPath = getSitePath("/live/join");
  const joinUrl = typeof window === "undefined" ? "" : `${window.location.origin}${joinPath}?pin=${encodeURIComponent(game?.pin || "")}`;

  async function beginTask() {
    if (!players.length) return;
    await setLiveGameStatus(gameId, "in-progress");
    await setLiveGameState(gameId, { phase: "task", reviewIndex: 0 });
  }

  async function beginReview() {
    const outstanding = players.length - submissions.length;
    if (outstanding > 0 && !window.confirm(`${outstanding} student(s) have not submitted. Begin the review anyway?`)) return;
    await setLiveGameState(gameId, { phase: "review", reviewIndex: 0 });
  }

  async function nextReview() {
    if (reviewIndex < answerableGaps.length - 1) {
      await setLiveGameState(gameId, { reviewIndex: reviewIndex + 1 });
      return;
    }
    await setLiveGameStatus(gameId, "finished");
    await setLiveGameState(gameId, { phase: "finished" });
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

  if (loading) return <main className="rp1-live-page"><p>Loading Reading Part 1 room…</p></main>;
  if (!game || game.type !== APTIS_READING_PART1_LIVE_GAME_TYPE || !task) return <main className="rp1-live-page"><h1>Reading Part 1 live</h1><p>Session not found.</p></main>;
  if (!isHost) return <main className="rp1-live-page"><h1>Reading Part 1 live</h1><p>You are not the host of this session.</p></main>;

  return (
    <main className="rp1-live-page">
      <Seo title={`Host Reading Part 1: ${task.title}`} description="Teacher-controlled Aptis Reading Part 1 classroom session." />
      <header className="rp1-live-header">
        <div><p>Aptis Reading Part 1 · Live classroom</p><h1>{task.title}</h1></div>
        <div className="rp1-live-phase"><span>{PHASE_LABELS[phase]}</span>{phase === "review" ? <strong>Gap {reviewGap?.id} of 5</strong> : <strong>{submissions.length} / {players.length} submitted</strong>}</div>
      </header>

      {phase === "lobby" ? (
        <section className="rp1-live-stage rp1-live-lobby">
          <div className="rp1-live-pin"><p>Students join with PIN</p><strong>{String(game.pin || "").replace(/^(\d{3})(\d{3})$/, "$1 $2")}</strong><QRCodeSVG value={joinUrl} size={184} includeMargin /><button type="button" onClick={copyJoinLink}><Clipboard size={17} /> {copyState || "Copy join link"}</button></div>
          <div className="rp1-live-roster">
            <header><div><span>Classroom</span><h2>{players.length} {players.length === 1 ? "student" : "students"} joined</h2></div><Users size={26} /></header>
            <div className="rp1-live-roster-list">{players.map((player) => <span key={player.id}>{player.name}</span>)}{!players.length ? <p>Waiting for students…</p> : null}</div>
            <button className="rp1-live-primary" disabled={!players.length} onClick={beginTask} type="button"><Play size={18} /> Open the task</button>
          </div>
        </section>
      ) : null}

      {phase === "task" ? (
        <section className="rp1-live-stage">
          <div className="rp1-live-status"><Send size={21} /><div><strong>{submissions.length} of {players.length} responses received</strong><span>Students complete all five gaps and submit once.</span></div></div>
          <ReadingPart1LiveTask task={task} disabled showChoices />
          <div className="rp1-live-submission-list">{players.map((player) => <span className={player.readingPart1Submission ? "is-done" : ""} key={player.id}>{player.readingPart1Submission ? <Check size={15} /> : null}{player.name}</span>)}</div>
          <div className="rp1-live-actions"><button className="rp1-live-primary" type="button" onClick={beginReview}>Review class answers</button></div>
        </section>
      ) : null}

      {phase === "review" && reviewGap ? (
        <section className="rp1-live-stage">
          <ReadingPart1Distribution gap={reviewGap} players={players} reveal />
          <ReadingPart1LiveTask task={task} disabled revealGapIds={[reviewGap.id]} />
          <div className="rp1-live-actions"><button className="rp1-live-primary" type="button" onClick={nextReview}>{reviewIndex === answerableGaps.length - 1 ? "Finish session" : `Reveal gap ${answerableGaps[reviewIndex + 1]?.id}`}</button></div>
        </section>
      ) : null}

      {phase === "finished" ? <HostReport players={players} task={task} /> : null}
    </main>
  );
}

function HostReport({ players, task }) {
  const submitted = players.filter((player) => player.readingPart1Submission);
  const average = submitted.length
    ? submitted.reduce((sum, player) => sum + getReadingPart1LiveScore(task, player.readingPart1Submission), 0) / submitted.length
    : 0;
  return (
    <section className="rp1-live-stage rp1-live-report">
      <CheckCircle2 size={44} /><span>Session complete</span><h2>Class average: {average.toFixed(1)} / 5</h2><p>{submitted.length} of {players.length} students submitted.</p>
      <div>{task.gaps.filter((gap) => !gap.fixed).map((gap) => {
        const correct = submitted.filter((player) => player.readingPart1Submission.answers[gap.id] === gap.answer).length;
        const percent = submitted.length ? Math.round((correct / submitted.length) * 100) : 0;
        return <article key={gap.id}><span>Gap {gap.id}</span><h3>{gap.answer}</h3><strong>{percent}% correct</strong><p>{correct} of {submitted.length} answers</p></article>;
      })}</div>
    </section>
  );
}
