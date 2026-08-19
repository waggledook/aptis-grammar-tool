import React, { useEffect, useMemo, useState } from "react";
import { Check, Clock3, Clipboard, Highlighter, Play, Plus, Users } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { setLiveGameState, setLiveGameStatus } from "../../api/liveGames.js";
import { rtdb } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import { toast } from "../../utils/toast.js";
import {
  PART4_EVIDENCE_LIVE_GAME_TYPE,
  OPTION_JURY_TIMINGS,
  getOptionLetter,
  optionJuryTasks,
} from "./data/oteAdvancedReadingPart4OptionJury.js";
import {
  Part4AnswerDistribution,
  Part4EvidenceExplanation,
  Part4EvidenceQuestion,
  Part4EvidenceTimer,
  Part4FullPassage,
} from "./OteReadingPart4EvidenceLiveShared.jsx";
import "./styles/option-jury.css";
import "./styles/part4-evidence-live.css";

export default function OteReadingPart4EvidenceLiveHost({ user }) {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copyState, setCopyState] = useState("");

  useEffect(() => onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
    setGame(snapshot.exists() ? snapshot.val() : null);
    setLoading(false);
  }), [gameId]);

  const task = optionJuryTasks[game?.taskId];
  const players = useMemo(
    () => Object.entries(game?.players || {}).map(([id, player]) => ({ id, ...player })).sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0)),
    [game?.players]
  );
  const phase = game?.state?.phase || "lobby";
  const questionIndex = game?.state?.questionIndex || 0;
  const question = task?.questions?.[questionIndex];
  const answers = question ? game?.part4Answers?.[question.id] || {} : {};
  const submittedIds = new Set(Object.keys(answers));
  const isHost = Boolean(user && game?.ownerUid === user.uid);
  const joinPath = getSitePath("/live/join");
  const joinUrl = typeof window === "undefined" ? "" : `${window.location.origin}${joinPath}${joinPath.includes("?") ? "&" : "?"}pin=${encodeURIComponent(game?.pin || "")}`;

  async function beginSession() {
    if (!players.length) return toast("Wait for at least one student to join.");
    await setLiveGameStatus(gameId, "in-progress");
    const now = Date.now();
    await setLiveGameState(gameId, { phase: "skim", questionIndex: 0, phaseStartedAt: now, phaseDeadline: now + OPTION_JURY_TIMINGS.skim * 1000, phaseDuration: OPTION_JURY_TIMINGS.skim });
  }

  async function addSkimTime() {
    const deadline = Number(game?.state?.phaseDeadline || 0);
    await setLiveGameState(gameId, { phaseDeadline: Math.max(Date.now(), deadline) + 30000 });
  }

  async function openFirstQuestion() {
    await setLiveGameState(gameId, { phase: "question", questionIndex: 0, phaseStartedAt: null, phaseDeadline: null, phaseDuration: null });
  }

  async function revealAnswer() {
    const missing = players.length - submittedIds.size;
    if (missing > 0 && !window.confirm(`${missing} student(s) have not submitted. Reveal the evidence anyway?`)) return;
    await setLiveGameState(gameId, { phase: "reveal" });
  }

  async function nextQuestion() {
    if (questionIndex < task.questions.length - 1) {
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

  if (loading) return <main className="option-jury-page part4-evidence-live-page"><p>Loading Part 4 room…</p></main>;
  if (!game || game.type !== PART4_EVIDENCE_LIVE_GAME_TYPE || !task) return <main className="option-jury-page part4-evidence-live-page"><h1>Answer &amp; Evidence</h1><p>Session not found.</p></main>;
  if (!isHost) return <main className="option-jury-page part4-evidence-live-page"><h1>Answer &amp; Evidence</h1><p>You are not the host of this session.</p></main>;

  return (
    <main className="option-jury-page part4-evidence-live-page">
      <Seo title={`Host Answer & Evidence: ${task.title}`} description="Teacher-controlled OTE Advanced Reading Part 4 activity." />
      <header className="option-jury-host-header">
        <div><p>OTE Advanced Reading Part 4 · Answer &amp; Evidence</p><h1>{task.title}</h1></div>
        <div className="option-jury-phase"><span>{phase === "lobby" ? "Lobby" : phase === "skim" ? "First reading" : phase === "finished" ? "Complete" : phase === "reveal" ? "Evidence reveal" : "Answering"}</span>{question && ["question", "reveal"].includes(phase) ? <strong>Question {questionIndex + 1} of {task.questions.length}</strong> : null}</div>
      </header>

      {phase === "lobby" ? (
        <section className="option-jury-lobby-layout">
          <div className="option-jury-pin-card"><p>Students join with PIN</p><strong>{String(game.pin || "").replace(/^(\d{3})(\d{3})$/, "$1 $2")}</strong><QRCodeSVG value={joinUrl} size={184} includeMargin /><button type="button" onClick={copyJoinLink}><Clipboard size={17} /> {copyState || "Copy join link"}</button></div>
          <div className="option-jury-lobby-players">
            <header><div><span>Classroom</span><h2>{players.length} {players.length === 1 ? "student" : "students"} joined</h2></div><Users size={25} /></header>
            <div className="part4-evidence-roster">{players.map((player) => <span key={player.id}>{player.name}</span>)}{!players.length ? <p>Waiting for students…</p> : null}</div>
            <button className="option-jury-primary" type="button" disabled={!players.length} onClick={beginSession}><Play size={18} /> Begin four-minute skim</button>
          </div>
        </section>
      ) : null}

      {phase === "skim" ? (
        <section className="part4-evidence-live-stage">
          <div className="part4-evidence-skim-toolbar"><Part4EvidenceTimer deadline={game?.state?.phaseDeadline} /><button type="button" onClick={addSkimTime}><Plus size={17} /> Add 30 seconds</button></div>
          <div className="part4-evidence-status"><Clock3 size={20} /><strong>Students are mapping the complete passage</strong><span>No questions, options or highlighted evidence are visible yet.</span></div>
          <Part4FullPassage task={task} defaultOpen />
          <button className="option-jury-primary part4-evidence-next" type="button" onClick={openFirstQuestion}><Play size={18} /> Open Question 1</button>
        </section>
      ) : null}

      {phase === "question" && question ? (
        <section className="part4-evidence-live-stage">
          <div className="part4-evidence-status"><Highlighter size={20} /><strong>{submittedIds.size} of {players.length} answers received</strong><span>The evidence remains unhighlighted until the reveal.</span></div>
          <Part4FullPassage task={task} />
          <Part4EvidenceQuestion task={task} question={question} disabled />
          <div className="part4-evidence-submissions">{players.map((player) => <span className={submittedIds.has(player.id) ? "is-done" : ""} key={player.id}>{submittedIds.has(player.id) ? <Check size={16} /> : <i />}{player.name}</span>)}</div>
          <button className="option-jury-primary part4-evidence-next" type="button" onClick={revealAnswer}>Reveal class answers and evidence</button>
        </section>
      ) : null}

      {phase === "reveal" && question ? (
        <section className="part4-evidence-live-stage">
          <Part4AnswerDistribution answers={answers} question={question} reveal />
          <Part4FullPassage task={task} />
          <Part4EvidenceQuestion task={task} question={question} disabled reveal />
          <Part4EvidenceExplanation question={question} />
          <button className="option-jury-primary part4-evidence-next" type="button" onClick={nextQuestion}>{questionIndex === task.questions.length - 1 ? "Finish session" : `Open Question ${questionIndex + 2}`}</button>
        </section>
      ) : null}

      {phase === "finished" ? <HostReport game={game} task={task} players={players} /> : null}
    </main>
  );
}

function HostReport({ game, task, players }) {
  return (
    <section className="part4-evidence-live-stage part4-evidence-report">
      <Check size={42} /><span>Session complete</span><h2>Class report</h2>
      <div>{task.questions.map((question, index) => {
        const records = Object.values(game?.part4Answers?.[question.id] || {});
        const correctLetter = getOptionLetter(question.answer);
        const correct = records.filter((record) => record.option === correctLetter).length;
        return <article key={question.id}><span>Question {index + 1}</span><h3>{question.prompt}</h3><strong>{records.length ? Math.round((correct / records.length) * 100) : 0}% correct</strong><p>{correct} of {records.length} submitted answers · {players.length} students in session</p></article>;
      })}</div>
    </section>
  );
}
