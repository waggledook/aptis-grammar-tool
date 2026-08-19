import React, { useEffect, useMemo, useState } from "react";
import { Check, Clipboard, Play, Radio, Users } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { setLiveGameState, setLiveGameStatus } from "../../api/liveGames.js";
import { rtdb } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import { toast } from "../../utils/toast.js";
import {
  COHESION_CHALLENGE_GAME_TYPE,
  cohesionChallengeTask,
} from "./data/oteAdvancedReadingCohesionChallenge.js";
import {
  LiveAnswerDistribution,
  LiveAnswerKey,
  LiveChallengeCase,
  LiveClueDistribution,
} from "./OteCohesionChallengeLiveShared.jsx";
import "./styles/ote.css";
import "./styles/cohesion-challenge.css";

export default function OteCohesionChallengeLiveHost({ user }) {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copyState, setCopyState] = useState("");

  useEffect(() => onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
    setGame(snapshot.exists() ? snapshot.val() : null);
    setLoading(false);
  }), [gameId]);

  const task = cohesionChallengeTask;
  const players = useMemo(
    () => Object.entries(game?.players || {})
      .map(([id, player]) => ({ id, ...player }))
      .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0)),
    [game?.players]
  );
  const phase = game?.state?.phase || "lobby";
  const questionIndex = game?.state?.questionIndex || 0;
  const item = task.cases[questionIndex];
  const submittedPlayers = item
    ? players.filter((player) => player.cohesionAnswers?.[item.id])
    : [];
  const isHost = Boolean(user && game?.ownerUid === user.uid);
  const joinPath = getSitePath("/live/join");
  const joinUrl = typeof window === "undefined"
    ? ""
    : `${window.location.origin}${joinPath}${joinPath.includes("?") ? "&" : "?"}pin=${encodeURIComponent(game?.pin || "")}`;

  async function beginSession() {
    if (!players.length) return toast("Wait for at least one student to join.");
    await setLiveGameStatus(gameId, "in-progress");
    await setLiveGameState(gameId, { phase: "question", questionIndex: 0 });
  }

  async function revealAnswer() {
    const missing = players.length - submittedPlayers.length;
    if (missing > 0 && !window.confirm(`${missing} student(s) have not submitted. Reveal the answer anyway?`)) return;
    await setLiveGameState(gameId, { phase: "reveal" });
  }

  async function nextCase() {
    if (questionIndex < task.cases.length - 1) {
      await setLiveGameState(gameId, { phase: "question", questionIndex: questionIndex + 1 });
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

  if (loading) return <main className="cohesion-live-page"><p>Loading cohesion room…</p></main>;
  if (!game || game.type !== COHESION_CHALLENGE_GAME_TYPE) {
    return <main className="cohesion-live-page"><h1>Classroom Cohesion Challenge</h1><p>Session not found.</p></main>;
  }
  if (!isHost) return <main className="cohesion-live-page"><h1>Classroom Cohesion Challenge</h1><p>You are not the host of this session.</p></main>;

  return (
    <main className="cohesion-live-page cohesion-live-host">
      <Seo title={`Host ${task.title}`} description="Teacher-controlled Advanced Reading cohesion session." />
      <header className="cohesion-live-header">
        <div><p>OTE Advanced Reading Part 3 · Live classroom task</p><h1>{task.title}</h1></div>
        <span>{phase === "lobby" ? "Lobby" : phase === "finished" ? "Complete" : `Case ${questionIndex + 1}/${task.cases.length} · ${phase === "reveal" ? "Review" : "Answering"}`}</span>
      </header>

      {phase === "lobby" ? (
        <section className="cohesion-live-lobby">
          <div className="cohesion-live-pin">
            <p>Students join with PIN</p>
            <strong>{String(game.pin || "").replace(/^(\d{3})(\d{3})$/, "$1 $2")}</strong>
            <QRCodeSVG value={joinUrl} size={184} includeMargin />
            <button type="button" onClick={copyJoinLink}><Clipboard size={17} /> {copyState || "Copy join link"}</button>
          </div>
          <div className="cohesion-live-roster">
            <header><Users size={24} /><h2>{players.length} {players.length === 1 ? "student" : "students"} joined</h2></header>
            <ul>{players.map((player) => <li key={player.id}>{player.name}</li>)}{!players.length ? <li>Waiting for students…</li> : null}</ul>
            <button className="cohesion-live-primary" type="button" disabled={!players.length} onClick={beginSession}><Play size={18} /> Open Case 1</button>
          </div>
        </section>
      ) : null}

      {phase === "question" && item ? (
        <section className="cohesion-live-stage">
          <div className="cohesion-live-status"><Radio size={20} /><strong>{submittedPlayers.length} of {players.length} responses received</strong><span>Students are choosing a sentence and its decisive clue.</span></div>
          <LiveChallengeCase item={item} disabled />
          <div className="cohesion-live-submissions">
            {players.map((player) => {
              const submitted = Boolean(player.cohesionAnswers?.[item.id]);
              return <span className={submitted ? "is-done" : ""} key={player.id}>{submitted ? <Check size={17} /> : <i />}{player.name}</span>;
            })}
          </div>
          <button className="cohesion-live-primary" type="button" onClick={revealAnswer}>Reveal class answers</button>
        </section>
      ) : null}

      {phase === "reveal" && item ? (
        <section className="cohesion-live-stage">
          <LiveAnswerDistribution players={players} item={item} reveal />
          <LiveClueDistribution players={players} item={item} reveal />
          <LiveChallengeCase item={item} disabled reveal />
          <LiveAnswerKey item={item} />
          <button className="cohesion-live-primary" type="button" onClick={nextCase}>{questionIndex === task.cases.length - 1 ? "Finish session" : `Open Case ${questionIndex + 2}`}</button>
        </section>
      ) : null}

      {phase === "finished" ? <HostReport players={players} task={task} /> : null}
    </main>
  );
}

function HostReport({ players, task }) {
  return (
    <section className="cohesion-live-stage cohesion-live-report">
      <Check size={42} />
      <p className="ote-kicker">Session complete</p>
      <h2>Class report</h2>
      <div>{task.cases.map((item, index) => {
        const records = players.map((player) => player.cohesionAnswers?.[item.id]).filter(Boolean);
        const correct = records.filter((record) => record.option === item.answer).length;
        return <article key={item.id}><span>Case {index + 1}</span><h3>{item.title}</h3><strong>{records.length ? Math.round((correct / records.length) * 100) : 0}% correct</strong><p>{correct} of {records.length} submitted answers</p></article>;
      })}</div>
    </section>
  );
}
