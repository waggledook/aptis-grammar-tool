import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clipboard, Eye, Lightbulb, Play, Users } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "react-router-dom";
import { setLiveGameState, setLiveGameStatus } from "../../api/liveGames.js";
import Seo from "../../components/common/Seo.jsx";
import { rtdb } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import {
  getOteAdvancedReadingPart2TeacherTask,
  OTE_ADVANCED_READING_PART2_PARAGRAPH_LIVE_GAME_TYPE,
  OTE_ADVANCED_READING_PART2_PARAGRAPH_SUPPORT,
} from "./data/oteAdvancedReadingPart2TeacherTasks.js";
import {
  OtePart2ParagraphReveal,
  OtePart2ParagraphSource,
  OtePart2QuestionPreview,
} from "./OteAdvancedReadingPart2ParagraphLiveShared.jsx";
import {
  getOtePart2ParagraphEvidence,
  getOtePart2ParagraphSelection,
} from "./utils/oteAdvancedReadingPart2ParagraphLive.js";
import "../../reading/readingPart1Live.css";
import "../../reading/readingPart3Live.css";
import "./styles/reading-part2-paragraph-live.css";

const SOURCE_LETTERS = ["A", "B", "C"];
const PHASE_LABELS = {
  lobby: "Waiting room",
  "question-preview": "Decode the questions",
  "keyword-reveal": "Question support",
  paragraph: "Read and nominate",
  "paragraph-reveal": "Paragraph review",
  finished: "Complete",
};

export default function OteAdvancedReadingPart2ParagraphLiveHost({ user }) {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copyState, setCopyState] = useState("");

  useEffect(() => onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
    setGame(snapshot.exists() ? snapshot.val() : null);
    setLoading(false);
  }), [gameId]);

  const task = getOteAdvancedReadingPart2TeacherTask(game?.taskId);
  const support = OTE_ADVANCED_READING_PART2_PARAGRAPH_SUPPORT[task?.id] || {};
  const phase = game?.state?.phase || "lobby";
  const sourceIndex = Math.min(2, Math.max(0, Number(game?.state?.sourceIndex || 0)));
  const sourceLetter = SOURCE_LETTERS[sourceIndex];
  const explanationsRevealed = Boolean(game?.state?.explanationsRevealed);
  const players = useMemo(() => Object.entries(game?.players || {})
    .map(([id, player]) => ({ id, ...player }))
    .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0)), [game?.players]);
  const isHost = Boolean(user && game?.ownerUid === user.uid);
  const submittedPlayers = players.filter((player) => {
    const record = player.oteReadingPart2ParagraphSubmissions?.[sourceLetter];
    return record?.submitted && record.taskId === task?.id;
  });
  const joinUrl = typeof window === "undefined" ? "" : `${window.location.origin}${getSitePath("/live/join")}?pin=${encodeURIComponent(game?.pin || "")}`;

  async function beginQuestionPreview() {
    if (!players.length) return;
    await setLiveGameStatus(gameId, "in-progress");
    await setLiveGameState(gameId, { phase: "question-preview", phaseStartedAt: Date.now() });
  }

  async function beginParagraph(index = 0) {
    await setLiveGameState(gameId, {
      phase: "paragraph",
      phaseStartedAt: Date.now(),
      sourceIndex: index,
      explanationsRevealed: false,
    });
  }

  async function revealParagraph() {
    const incomplete = players.length - submittedPlayers.length;
    if (incomplete > 0 && !window.confirm(`${incomplete} student${incomplete === 1 ? " has" : "s have"} not submitted ideas for text ${sourceLetter}. Reveal the matches now?`)) return;
    await setLiveGameState(gameId, {
      phase: "paragraph-reveal",
      phaseStartedAt: Date.now(),
      explanationsRevealed: false,
    });
  }

  async function advance() {
    if (sourceIndex < SOURCE_LETTERS.length - 1) {
      await beginParagraph(sourceIndex + 1);
      return;
    }
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

  if (loading) return <main className="rp1-live-page"><p>Loading paragraph-by-paragraph room…</p></main>;
  if (!game || game.type !== OTE_ADVANCED_READING_PART2_PARAGRAPH_LIVE_GAME_TYPE || !task) return <main className="rp1-live-page"><h1>OTE Reading Part 2 paragraph live</h1><p>Session not found.</p></main>;
  if (!isHost) return <main className="rp1-live-page"><h1>OTE Reading Part 2 paragraph live</h1><p>You are not the host of this session.</p></main>;

  return (
    <main className="rp1-live-page ote-part2-paragraph-live-page">
      <Seo title={`Host paragraph lesson: ${task.title}`} description="Paragraph-by-paragraph OTE Advanced Reading Part 2 live lesson." />
      <header className="rp1-live-header"><div><p>OTE Advanced Reading Part 2 · Paragraph-by-paragraph</p><h1>{task.title}</h1></div><div className="rp1-live-phase"><span>{PHASE_LABELS[phase]}</span><strong>{["paragraph", "paragraph-reveal"].includes(phase) ? `Text ${sourceLetter} · ${sourceIndex + 1}/3` : `${players.length} joined`}</strong></div></header>

      {phase === "lobby" ? (
        <section className="rp1-live-stage rp1-live-lobby">
          <div className="rp1-live-pin"><p>Students join with PIN</p><strong>{String(game.pin || "").replace(/^(\d{3})(\d{3})$/, "$1 $2")}</strong><QRCodeSVG value={joinUrl} size={184} includeMargin /><button type="button" onClick={copyJoinLink}><Clipboard size={17} /> {copyState || "Copy join link"}</button></div>
          <div className="rp1-live-roster"><header><div><span>Classroom</span><h2>{players.length} {players.length === 1 ? "student" : "students"} joined</h2></div><Users size={26} /></header><div className="rp1-live-roster-list">{players.map((player) => <span key={player.id}>{player.name}</span>)}{!players.length ? <p>Waiting for students…</p> : null}</div><button className="rp1-live-primary" disabled={!players.length} onClick={beginQuestionPreview} type="button"><Play size={18} /> Open the questions</button></div>
        </section>
      ) : null}

      {phase === "question-preview" ? (
        <section className="rp1-live-stage">
          <div className="rp1-live-status"><Eye size={21} /><div><strong>Students are decoding the seven questions</strong><span>Give them time to underline the meaning they expect to search for.</span></div></div>
          <OtePart2QuestionPreview task={task} support={support} />
          <div className="rp1-live-actions"><button className="rp1-live-primary" type="button" onClick={() => setLiveGameState(gameId, { phase: "keyword-reveal", phaseStartedAt: Date.now() })}><Lightbulb size={18} /> Reveal key words and paraphrases</button></div>
        </section>
      ) : null}

      {phase === "keyword-reveal" ? (
        <section className="rp1-live-stage">
          <div className="rp1-live-status"><Lightbulb size={21} /><div><strong>Question targets revealed</strong><span>Check the highlighted words and simplified meanings before opening the first text.</span></div></div>
          <OtePart2QuestionPreview task={task} support={support} revealed />
          <div className="rp1-live-actions"><button className="rp1-live-primary" type="button" onClick={() => beginParagraph(0)}><Play size={18} /> Open text A</button></div>
        </section>
      ) : null}

      {phase === "paragraph" ? (
        <section className="rp1-live-stage">
          <div className="rp1-live-status"><Users size={21} /><div><strong>{submittedPlayers.length} of {players.length} submitted ideas for text {sourceLetter}</strong><span>Students can nominate several questions before submitting once.</span></div></div>
          <OtePart2ParagraphSource task={task} sourceLetter={sourceLetter} />
          <div className="rp3-player-progress">{players.map((player) => { const record = player.oteReadingPart2ParagraphSubmissions?.[sourceLetter]; const submitted = record?.submitted && record.taskId === task.id; return <span className={submitted ? "is-complete" : ""} key={player.id}>{player.name} · {submitted ? "submitted" : "thinking"}</span>; })}</div>
          <div className="rp1-live-actions"><button className="rp1-live-primary" type="button" onClick={revealParagraph}>Reveal class ideas and answers</button></div>
        </section>
      ) : null}

      {phase === "paragraph-reveal" ? (
        <section className="rp1-live-stage">
          <div className="rp1-live-status"><CheckCircle2 size={21} /><div><strong>Reviewing text {sourceLetter}</strong><span>{explanationsRevealed ? "Explanations and evidence extracts are visible." : "Correct matches, class choices and highlighted extracts are visible."}</span></div></div>
          <OtePart2ParagraphSource task={task} sourceLetter={sourceLetter} evidence={getOtePart2ParagraphEvidence(task, support, sourceLetter)} />
          <OtePart2ParagraphReveal task={task} sourceLetter={sourceLetter} support={support} players={players} showExplanations={explanationsRevealed} />
          <div className="rp1-live-actions">
            {!explanationsRevealed ? <button className="rp1-live-primary" type="button" onClick={() => setLiveGameState(gameId, { explanationsRevealed: true })}><Lightbulb size={18} /> Reveal explanations</button> : null}
            <button className="rp1-live-secondary" type="button" onClick={advance}>{sourceIndex < 2 ? `Open text ${SOURCE_LETTERS[sourceIndex + 1]}` : "Finish session"}</button>
          </div>
        </section>
      ) : null}

      {phase === "finished" ? <HostReport players={players} task={task} /> : null}
    </main>
  );
}

function HostReport({ players, task }) {
  const results = players.map((player) => {
    let found = 0;
    let extra = 0;
    SOURCE_LETTERS.forEach((letter) => {
      const selected = new Set(getOtePart2ParagraphSelection(player, task.id, letter));
      task.questions.forEach((question) => {
        if (selected.has(question.id) && question.answer === letter) found += 1;
        if (selected.has(question.id) && question.answer !== letter) extra += 1;
      });
    });
    return { found, extra };
  });
  const averageFound = results.length ? results.reduce((total, result) => total + result.found, 0) / results.length : 0;
  const averageExtra = results.length ? results.reduce((total, result) => total + result.extra, 0) / results.length : 0;
  return <section className="rp1-live-stage rp1-live-report"><CheckCircle2 size={44} /><span>Session complete</span><h2>Average correct matches found: {averageFound.toFixed(1)} / {task.questions.length}</h2><p>Average extra matches selected: {averageExtra.toFixed(1)}.</p></section>;
}
