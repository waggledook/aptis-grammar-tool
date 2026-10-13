import React, { useEffect, useMemo, useRef, useState } from "react";
import { onValue, ref } from "firebase/database";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import {
  logAptisListeningLiveFinished,
  logAptisListeningLiveReviewStarted,
  logAptisListeningLiveSecondRoundStarted,
  logAptisListeningLiveStarted,
  rtdb,
} from "../../firebase.js";
import { setLiveGameState, setLiveGameStatus } from "../../api/liveGames.js";
import { getSitePath } from "../../siteConfig.js";
import { toast } from "../../utils/toast.js";
import { LISTEN_AGAIN_PROMPT_SRC } from "../../products/ote/utils/listeningLive.js";
import { APTIS_LISTENING_PART4_LIVE_GAME_TYPE, getTeacherListeningPart4Task } from "./teacherListeningPart4Data.js";
import { MultipleChoiceFeedback, MultipleChoiceScript, MultipleChoiceSheet } from "./AptisListeningPart4LiveShared.jsx";
import { hasMultipleChoice, scoreMultipleChoiceAnswers } from "./aptisListeningPart4LiveUtils.js";
import "./aptisListeningPart2Live.css";
import "./aptisListeningPart3Live.css";

export default function AptisListeningPart4LiveHost({ user }) {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [copyState, setCopyState] = useState("");
  const audioRef = useRef(null);
  const playbackTokenRef = useRef(0);

  useEffect(() => onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
    setGame(snapshot.exists() ? snapshot.val() : null);
    setLoading(false);
  }), [gameId]);

  useEffect(() => () => {
    playbackTokenRef.current += 1;
    audioRef.current?.pause();
  }, []);

  const task = getTeacherListeningPart4Task(game?.taskId);
  const players = useMemo(() => Object.entries(game?.players || {})
    .map(([id, player]) => ({ id, ...player }))
    .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0)), [game?.players]);
  const phase = game?.state?.phase || "lobby";
  const reviewIndex = Math.min(Number(game?.state?.reviewIndex || 0), Math.max(0, (task?.questions.length || 1) - 1));
  const question = task?.questions[reviewIndex];
  const questionNumber = reviewIndex + 1;
  const completedCount = Number(game?.state?.completedCount || 0);
  const firstRoundCount = players.filter((player) => player.listeningFirstRoundSubmittedAt).length;
  const answerCount = task ? players.reduce((sum, player) => sum + task.questions.filter((item) =>
    hasMultipleChoice(player.listeningAnswers?.[item.key]?.value)).length, 0) : 0;
  const confirmedCount = question ? players.filter((player) => player.listeningAnswers?.[question.key]?.scriptCheckedAt).length : 0;
  const joinUrl = typeof window === "undefined" ? "" : `${window.location.origin}${getSitePath("/live/join")}?pin=${encodeURIComponent(game?.pin || "")}`;
  const activityDetails = {
    gameId,
    pin: game?.pin || null,
    activityType: "listening-task",
    activityTitle: task?.title || game?.title || "Aptis Listening Part 4",
    part: 4,
    taskId: task?.id || game?.taskId || null,
  };

  function stopAudio() {
    const stoppedDuringPlayback = playing;
    playbackTokenRef.current += 1;
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    audioRef.current = null;
    setPlaying(false);
    if (stoppedDuringPlayback) {
      const listenCount = completedCount + 1;
      void setLiveGameState(gameId, { audioStage: "idle", playCount: listenCount, completedCount: listenCount }).catch(() => {});
    }
  }

  async function playRecording(kind) {
    const expectedCount = kind === "first" ? 0 : 1;
    if (playing || !task || completedCount !== expectedCount) return;
    const token = ++playbackTokenRef.current;
    const nextCount = completedCount + 1;
    let completed = false;
    setPlaying(true);
    try {
      await setLiveGameState(gameId, { audioStage: kind, playCount: nextCount });
      const sources = kind === "first" ? [task.audioSrc] : [LISTEN_AGAIN_PROMPT_SRC, task.audioSrc];
      for (const src of sources) {
        if (token !== playbackTokenRef.current) return;
        const audio = new Audio(src);
        audio.volume = .86;
        audioRef.current = audio;
        await new Promise((resolve, reject) => {
          audio.onended = resolve;
          audio.onpause = resolve;
          audio.onerror = () => reject(new Error(`Audio failed: ${src}`));
          audio.play().catch(reject);
        });
      }
      completed = true;
    } catch (error) {
      console.error("[AptisListeningPart4LiveHost] playback failed", error);
      toast("Audio could not be played. Check screen-share audio and try again.");
      await setLiveGameState(gameId, { playCount: completedCount }).catch(() => {});
    } finally {
      if (token === playbackTokenRef.current) {
        audioRef.current = null;
        setPlaying(false);
        await setLiveGameState(gameId, {
          audioStage: "idle",
          ...(completed ? { completedCount: nextCount } : {}),
        }).catch(() => {});
      }
    }
  }

  async function beginTask() {
    if (!players.length) return;
    await setLiveGameStatus(gameId, "in-progress");
    await setLiveGameState(gameId, { phase: "task", reviewIndex: 0, playCount: 0, completedCount: 0, audioStage: "idle", secondMode: "" });
    await logAptisListeningLiveStarted({ ...activityDetails, playerCount: players.length });
  }

  async function beginSecondRound() {
    if (playing || completedCount !== 1) return;
    const missing = players.length - firstRoundCount;
    if (missing && !window.confirm(`${missing} student${missing === 1 ? " has" : "s have"} not submitted first-round answers. Start the second listening?`)) return;
    await setLiveGameState(gameId, { phase: "second", secondMode: "full", reviewIndex: 0, audioStage: "idle" });
    await logAptisListeningLiveSecondRoundStarted({ ...activityDetails, secondMode: "full", playerCount: players.length, firstRoundCount });
  }

  async function beginScriptCheck() {
    if (playing || completedCount !== 2) return;
    await setLiveGameState(gameId, { phase: "script_check", reviewIndex: 0 });
    await logAptisListeningLiveReviewStarted({ ...activityDetails, secondMode: "full", playerCount: players.length });
  }

  async function revealAnswer() {
    const missing = players.length - confirmedCount;
    if (missing && !window.confirm(`${missing} student${missing === 1 ? " has" : "s have"} not confirmed this script check. Reveal the answer?`)) return;
    await setLiveGameState(gameId, { phase: "review" });
  }

  async function advanceReview() {
    if (reviewIndex < task.questions.length - 1) {
      await setLiveGameState(gameId, { phase: "script_check", reviewIndex: reviewIndex + 1 });
    } else {
      await setLiveGameStatus(gameId, "finished");
      await setLiveGameState(gameId, { phase: "finished", audioStage: "idle" });
      await logAptisListeningLiveFinished({ ...activityDetails, secondMode: "full", playerCount: players.length, firstRoundCount });
    }
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

  if (loading) return <main className="aptis-p2-live-page"><p>Loading listening room…</p></main>;
  if (!game || game.type !== APTIS_LISTENING_PART4_LIVE_GAME_TYPE || !task) return <main className="aptis-p2-live-page"><h1>Session not found</h1></main>;
  if (game.ownerUid !== user?.uid) return <main className="aptis-p2-live-page"><h1>You are not the host of this session.</h1></main>;

  const phaseLabel = phase === "lobby" ? "Lobby"
    : phase === "task" ? "First listening"
      : phase === "second" ? "Second listening"
        : phase === "finished" ? "Complete"
          : `${phase === "review" ? "Feedback" : "Script check"} ${questionNumber}/2`;

  return (
    <main className="aptis-p2-live-page">
      <Seo title={`Host live Aptis Listening: ${task.title}`} description="Teacher-led Aptis Listening Part 4 session." />
      <header className="aptis-p2-live-header">
        <div><p>Aptis Listening Part 4 · Live lesson</p><h1>{task.title}</h1></div>
        <span>{phaseLabel}</span>
      </header>

      {phase === "lobby" && <div className="aptis-p2-live-lobby">
        <section className="aptis-p2-live-card aptis-p2-live-pin">
          <p>Students join with PIN</p>
          <strong>{String(game.pin || "").replace(/^(\d{3})(\d{3})$/, "$1 $2")}</strong>
          <QRCodeSVG value={joinUrl} size={184} includeMargin />
          <button onClick={copyJoinLink} type="button">{copyState || "Copy join link"}</button>
        </section>
        <section className="aptis-p2-live-card">
          <h2>{players.length} {players.length === 1 ? "student" : "students"} joined</h2>
          <ul className="aptis-p2-live-roster">{players.map((player) => <li key={player.id}>{player.name}</li>)}</ul>
          {!players.length && <p>Waiting for students…</p>}
          <div className="aptis-p2-live-actions"><button className="is-primary" disabled={!players.length} onClick={beginTask} type="button">Open task</button></div>
        </section>
      </div>}

      {phase === "task" && <section className="aptis-p2-live-card">
        <p className="aptis-p2-live-status">Play the monologue once. Students answer both questions, then submit their first-round answers.</p>
        <div className="aptis-p2-live-actions">
          <button disabled={playing || completedCount !== 0} onClick={() => playRecording("first")} type="button">Play full recording</button>
          <button disabled={!playing} onClick={stopAudio} type="button">Stop audio</button>
        </div>
        <p>{firstRoundCount} of {players.length} students submitted · {answerCount} of {players.length * 2} questions answered</p>
        <MultipleChoiceSheet task={task} disabled />
        <div className="aptis-p2-live-actions"><button className="is-primary" disabled={playing || completedCount !== 1} onClick={beginSecondRound} type="button">Start second listening</button></div>
      </section>}

      {phase === "second" && <section className="aptis-p2-live-card">
        <p className="aptis-p2-live-status">Play the complete monologue again. Students can revise both answers before the transcript checks.</p>
        <div className="aptis-p2-live-actions">
          <button disabled={playing || completedCount !== 1} onClick={() => playRecording("full")} type="button">Play full recording again</button>
          <button disabled={!playing} onClick={stopAudio} type="button">Stop audio</button>
        </div>
        <MultipleChoiceSheet task={task} disabled />
        <p>{answerCount} of {players.length * 2} questions currently answered</p>
        <div className="aptis-p2-live-actions"><button className="is-primary" disabled={playing || completedCount !== 2} onClick={beginScriptCheck} type="button">Begin question reviews</button></div>
      </section>}

      {phase === "script_check" && question && <section className="aptis-p2-live-card">
        <p className="aptis-p2-live-status">Question {questionNumber}: the correct answer is hidden. Students can use the transcript to revise and confirm their choice.</p>
        <MultipleChoiceScript task={task} question={question} questionNumber={questionNumber} />
        <p>{confirmedCount} of {players.length} students confirmed</p>
        <div className="aptis-p2-live-actions"><button className="is-primary" onClick={revealAnswer} type="button">Reveal answer and evidence</button></div>
      </section>}

      {phase === "review" && question && <section className="aptis-p2-live-card">
        <MultipleChoiceFeedback task={task} question={question} questionNumber={questionNumber} value={question.answer} hostView />
        <p>{players.filter((player) => player.listeningAnswers?.[question.key]?.value === question.answer).length} of {players.length} students currently have this answer correct.</p>
        <div className="aptis-p2-live-actions"><button className="is-primary" onClick={advanceReview} type="button">{reviewIndex === 1 ? "Finish session" : "Check question 2"}</button></div>
      </section>}

      {phase === "finished" && <section className="aptis-p2-live-card">
        <h2>Class results</h2>
        <ul className="aptis-p2-live-report">{players.map((player) => <li key={player.id}>{player.name}: {scoreMultipleChoiceAnswers(task, player.listeningAnswers)} / 2 (after first listening: {scoreMultipleChoiceAnswers(task, player.listeningAnswers, true)} / 2)</li>)}</ul>
      </section>}
    </main>
  );
}
