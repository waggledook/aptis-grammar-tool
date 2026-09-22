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
import { APTIS_LISTENING_PART3_LIVE_GAME_TYPE, getTeacherListeningPart3Task } from "./teacherListeningPart3Data.js";
import { OpinionFeedback, OpinionScript, OpinionSheet } from "./AptisListeningPart3LiveShared.jsx";
import { hasOpinion, scoreOpinionAnswers } from "./aptisListeningPart3LiveUtils.js";
import "./aptisListeningPart2Live.css";
import "./aptisListeningPart3Live.css";

export default function AptisListeningPart3LiveHost({ user }) {
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

  const task = getTeacherListeningPart3Task(game?.taskId);
  const players = useMemo(() => Object.entries(game?.players || {})
    .map(([id, player]) => ({ id, ...player }))
    .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0)), [game?.players]);
  const phase = game?.state?.phase || "lobby";
  const secondMode = game?.state?.secondMode || "";
  const reviewIndex = Math.min(Number(game?.state?.reviewIndex || 0), 3);
  const statement = task?.statements[reviewIndex];
  const completedCount = Number(game?.state?.completedCount || 0);
  const firstRoundCount = players.filter((player) => player.listeningFirstRoundSubmittedAt).length;
  const answerCount = task ? players.reduce((sum, player) => sum + task.statements.filter((item) =>
    hasOpinion(player.listeningAnswers?.[item.key]?.value)).length, 0) : 0;
  const confirmedCount = statement ? players.filter((player) => player.listeningAnswers?.[statement.key]?.scriptCheckedAt).length : 0;
  const joinUrl = typeof window === "undefined" ? "" : `${window.location.origin}${getSitePath("/live/join")}?pin=${encodeURIComponent(game?.pin || "")}`;
  const activityDetails = {
    gameId,
    pin: game?.pin || null,
    activityType: "listening-task",
    activityTitle: task?.title || game?.title || "Aptis Listening Part 3",
    part: 3,
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
    const expectedCount = kind === "first" ? 0 : kind === "full" ? 1 : reviewIndex + 1;
    if (playing || !task || completedCount !== expectedCount) return;
    const token = ++playbackTokenRef.current;
    const nextCount = completedCount + 1;
    let completed = false;
    setPlaying(true);
    try {
      await setLiveGameState(gameId, { audioStage: kind === "section" ? `section-${reviewIndex + 1}` : kind, playCount: nextCount });
      const sources = kind === "first"
        ? [task.audioSrc]
        : kind === "full"
          ? [LISTEN_AGAIN_PROMPT_SRC, task.audioSrc]
          : reviewIndex === 0
            ? [LISTEN_AGAIN_PROMPT_SRC, task.sectionAudio[reviewIndex]]
            : [task.sectionAudio[reviewIndex]];
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
      console.error("[AptisListeningPart3LiveHost] playback failed", error);
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

  async function chooseSecondMode(mode) {
    if (playing || completedCount !== 1) return;
    const missing = players.length - firstRoundCount;
    if (missing && !window.confirm(`${missing} student${missing === 1 ? " has" : "s have"} not submitted first-round answers. Start the second round?`)) return;
    await setLiveGameState(gameId, { phase: "second", secondMode: mode, reviewIndex: 0, audioStage: "idle" });
    await logAptisListeningLiveSecondRoundStarted({ ...activityDetails, secondMode: mode, playerCount: players.length, firstRoundCount });
  }

  async function beginScriptCheck() {
    if (playing || (secondMode === "full" ? completedCount !== 2 : completedCount !== reviewIndex + 2)) return;
    await setLiveGameState(gameId, { phase: "script_check" });
    if (reviewIndex === 0) await logAptisListeningLiveReviewStarted({ ...activityDetails, secondMode, playerCount: players.length });
  }

  async function revealAnswer() {
    const missing = players.length - confirmedCount;
    if (missing && !window.confirm(`${missing} student${missing === 1 ? " has" : "s have"} not confirmed this script check. Reveal the answer?`)) return;
    await setLiveGameState(gameId, { phase: "review" });
  }

  async function advanceReview() {
    if (reviewIndex < task.statements.length - 1) {
      await setLiveGameState(gameId, { phase: secondMode === "section" ? "second" : "script_check", reviewIndex: reviewIndex + 1 });
    } else {
      await setLiveGameStatus(gameId, "finished");
      await setLiveGameState(gameId, { phase: "finished", audioStage: "idle" });
      await logAptisListeningLiveFinished({ ...activityDetails, secondMode, playerCount: players.length, firstRoundCount });
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
  if (!game || game.type !== APTIS_LISTENING_PART3_LIVE_GAME_TYPE || !task) return <main className="aptis-p2-live-page"><h1>Session not found</h1></main>;
  if (game.ownerUid !== user?.uid) return <main className="aptis-p2-live-page"><h1>You are not the host of this session.</h1></main>;

  return (
    <main className="aptis-p2-live-page">
      <Seo title={`Host live Aptis Listening: ${task.title}`} description="Teacher-led Aptis Listening Part 3 session." />
      <header className="aptis-p2-live-header">
        <div><p>Aptis Listening Part 3 · Live lesson</p><h1>{task.title}</h1></div>
        <span>{phase === "lobby" ? "Lobby" : phase === "task" ? "First listening" : phase === "second" ? secondMode === "section" ? `Question ${reviewIndex + 1}/4` : "Full replay" : phase === "finished" ? "Complete" : `${phase === "review" ? "Feedback" : "Script check"} ${reviewIndex + 1}/4`}</span>
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
        <p className="aptis-p2-live-status">Play the whole dialogue once. Students answer any opinions they can, then submit their first-round answers.</p>
        <div className="aptis-p2-live-actions">
          <button disabled={playing || completedCount !== 0} onClick={() => playRecording("first")} type="button">Play full recording</button>
          <button disabled={!playing} onClick={stopAudio} type="button">Stop audio</button>
        </div>
        <p>{firstRoundCount} of {players.length} students submitted · {answerCount} of {players.length * 4} opinions answered</p>
        <OpinionSheet task={task} disabled />
        <h2>Choose the second round</h2>
        <p>Replay the full dialogue before checking each question, or replay one question section at a time and review its transcript.</p>
        <div className="aptis-p2-live-actions">
          <button className="is-primary" disabled={playing || completedCount !== 1} onClick={() => chooseSecondMode("full")} type="button">Replay the full dialogue</button>
          <button className="is-primary" disabled={playing || completedCount !== 1} onClick={() => chooseSecondMode("section")} type="button">Replay question by question</button>
        </div>
      </section>}

      {phase === "second" && <section className="aptis-p2-live-card">
        <p className="aptis-p2-live-status">{secondMode === "section" ? `Play the part of the dialogue for question ${statement?.key.toUpperCase()}. Students can revise that answer before reading the transcript.` : "Play the full dialogue again. Students can revise all four answers before the script checks."}</p>
        <div className="aptis-p2-live-actions">
          <button disabled={playing || (secondMode === "full" ? completedCount !== 1 : completedCount !== reviewIndex + 1)} onClick={() => playRecording(secondMode === "full" ? "full" : "section")} type="button">{secondMode === "full" ? "Play full recording again" : `Play question ${statement?.key.toUpperCase()} section`}</button>
          <button disabled={!playing} onClick={stopAudio} type="button">Stop audio</button>
        </div>
        <OpinionSheet task={task} disabled onlyStatementKey={secondMode === "section" ? statement?.key : null} />
        <p>{secondMode === "full" ? `${answerCount} of ${players.length * 4} opinions currently answered` : `${players.filter((player) => hasOpinion(player.listeningAnswers?.[statement.key]?.value)).length} of ${players.length} students currently have an answer for question ${statement.key.toUpperCase()}`}</p>
        <div className="aptis-p2-live-actions"><button className="is-primary" disabled={playing || (secondMode === "full" ? completedCount !== 2 : completedCount !== reviewIndex + 2)} onClick={beginScriptCheck} type="button">{secondMode === "full" ? "Begin script checks" : `Show question ${statement?.key.toUpperCase()} transcript`}</button></div>
      </section>}

      {phase === "script_check" && statement && <section className="aptis-p2-live-card">
        <p className="aptis-p2-live-status">Question {statement.key.toUpperCase()}: the correct attribution is hidden. Students can use the transcript to revise and confirm their answer.</p>
        <OpinionScript task={task} statement={statement} />
        <p>{confirmedCount} of {players.length} students confirmed</p>
        <div className="aptis-p2-live-actions"><button className="is-primary" onClick={revealAnswer} type="button">Reveal answer and evidence</button></div>
      </section>}

      {phase === "review" && statement && <section className="aptis-p2-live-card">
        <OpinionFeedback task={task} statement={statement} value={statement.answer} hostView />
        <p>{players.filter((player) => player.listeningAnswers?.[statement.key]?.value === statement.answer).length} of {players.length} students currently have this attribution correct.</p>
        <div className="aptis-p2-live-actions"><button className="is-primary" onClick={advanceReview} type="button">{reviewIndex === 3 ? "Finish session" : secondMode === "section" ? `Replay question ${task.statements[reviewIndex + 1].key.toUpperCase()}` : `Check question ${task.statements[reviewIndex + 1].key.toUpperCase()}`}</button></div>
      </section>}

      {phase === "finished" && <section className="aptis-p2-live-card">
        <h2>Class results</h2>
        <ul className="aptis-p2-live-report">{players.map((player) => <li key={player.id}>{player.name}: {scoreOpinionAnswers(task, player.listeningAnswers)} / 4 (after first listening: {scoreOpinionAnswers(task, player.listeningAnswers, true)} / 4)</li>)}</ul>
      </section>}
    </main>
  );
}
