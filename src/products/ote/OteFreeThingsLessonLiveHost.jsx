import React, { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle2, Clipboard, Clock3, Highlighter, Play, Users } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { setLiveGameState, setLiveGameStatus } from "../../api/liveGames.js";
import { rtdb } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import { toast } from "../../utils/toast.js";
import {
  FREE_THINGS_LESSON_GAME_TYPE,
  freeThingsLesson,
  freeThingsLessonTask,
} from "./data/oteAdvancedReadingPart3FreeThingsLesson.js";
import {
  GapReview,
  GistArticle,
  LessonTimer,
  PlacementBoard,
  PredictionGap,
  SentenceFocus,
} from "./OteFreeThingsLessonLiveShared.jsx";
import "./styles/free-things-lesson.css";

const PHASE_LABELS = {
  lobby: "Lobby",
  gist: "Quick read",
  prediction: "Open prediction",
  clue_reveal: "Clue reveal",
  sentence_focus: "Inspect a sentence",
  sentence_focus_reveal: "Key-phrase reveal",
  placement: "Sentence placement",
  review: "Class review",
  finished: "Complete",
};

export default function OteFreeThingsLessonLiveHost({ user }) {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copyState, setCopyState] = useState("");

  useEffect(() => onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
    setGame(snapshot.exists() ? snapshot.val() : null);
    setLoading(false);
  }), [gameId]);

  const players = useMemo(
    () => Object.entries(game?.players || {}).map(([id, player]) => ({ id, ...player })).sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0)),
    [game?.players]
  );
  const phase = game?.state?.phase || "lobby";
  const gapIndex = Number(game?.state?.gapIndex || 0);
  const reviewIndex = Number(game?.state?.reviewIndex || 0);
  const sentenceIndex = Number(game?.state?.sentenceIndex || 0);
  const gap = gapIndex + 1;
  const reviewGap = reviewIndex + 1;
  const readyIds = new Set(Object.keys(game?.predictionReady?.[String(gap)] || {}));
  const placementsByPlayer = game?.part3LessonPlacements || {};
  const submittedIds = new Set(Object.keys(placementsByPlayer));
  const isHost = Boolean(user && game?.ownerUid === user.uid);
  const joinPath = getSitePath("/live/join");
  const joinUrl = typeof window === "undefined" ? "" : `${window.location.origin}${joinPath}${joinPath.includes("?") ? "&" : "?"}pin=${encodeURIComponent(game?.pin || "")}`;

  async function updateState(state) {
    try {
      await setLiveGameState(gameId, state);
    } catch (error) {
      console.error("[FreeThingsLessonHost] state update failed", error);
      toast(error.message || "The lesson could not be updated.");
    }
  }

  async function beginLesson() {
    if (!players.length) return toast("Wait for at least one student to join.");
    await setLiveGameStatus(gameId, "in-progress");
    await updateState({ phase: "gist", gapIndex: 0, sentenceIndex: 0, reviewIndex: 0, phaseDeadline: Date.now() + freeThingsLesson.gistSeconds * 1000 });
  }

  function startPredictions() {
    updateState({ phase: "prediction", gapIndex: 0, phaseDeadline: null });
  }

  function revealClues() {
    const missing = players.length - readyIds.size;
    if (missing > 0 && !window.confirm(`${missing} student(s) have not marked themselves ready. Show the clues anyway?`)) return;
    updateState({ phase: "clue_reveal", gapIndex, phaseDeadline: null });
  }

  function continueAfterClues() {
    if (gapIndex < 5) {
      updateState({ phase: "prediction", gapIndex: gapIndex + 1, phaseDeadline: null });
      return;
    }
    updateState({ phase: "sentence_focus", sentenceIndex: 0, phaseDeadline: null });
  }

  function revealSentencePhrases() {
    updateState({ phase: "sentence_focus_reveal", sentenceIndex, phaseDeadline: null });
  }

  function continueSentenceFocus() {
    if (sentenceIndex < freeThingsLesson.sentenceFocus.length - 1) {
      updateState({ phase: "sentence_focus", sentenceIndex: sentenceIndex + 1, phaseDeadline: null });
      return;
    }
    updateState({ phase: "placement", phaseDeadline: Date.now() + freeThingsLesson.placementSeconds * 1000 });
  }

  function addThirtySeconds() {
    updateState({ phaseDeadline: Math.max(Date.now(), Number(game?.state?.phaseDeadline || 0)) + 30000 });
  }

  function beginReview() {
    const missing = players.length - submittedIds.size;
    if (missing > 0 && !window.confirm(`${missing} student(s) have not submitted. Begin the review anyway?`)) return;
    updateState({ phase: "review", reviewIndex: 0, phaseDeadline: null });
  }

  async function nextReview() {
    if (reviewIndex < 5) {
      await updateState({ phase: "review", reviewIndex: reviewIndex + 1, phaseDeadline: null });
      return;
    }
    await setLiveGameStatus(gameId, "finished");
    await updateState({ phase: "finished", phaseDeadline: null });
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

  if (loading) return <main className="free-lesson-page"><p>Loading live lesson…</p></main>;
  if (!game || game.type !== FREE_THINGS_LESSON_GAME_TYPE) return <main className="free-lesson-page"><h1>Live Part 3 lesson</h1><p>Session not found.</p></main>;
  if (!isHost) return <main className="free-lesson-page"><h1>Live Part 3 lesson</h1><p>You are not the host of this session.</p></main>;

  return (
    <main className="free-lesson-page">
      <Seo title={`Host live lesson: ${freeThingsLessonTask.title}`} description="Teacher-controlled OTE Advanced Reading Part 3 lesson." />
      <header className="free-lesson-session-header">
        <div><p>OTE Advanced Reading Part 3 · Live lesson</p><h1>{freeThingsLessonTask.title}</h1></div>
        <aside><span>{PHASE_LABELS[phase] || phase}</span>{phase === "prediction" || phase === "clue_reveal" ? <strong>Gap {gap} of 6</strong> : phase === "sentence_focus" || phase === "sentence_focus_reveal" ? <strong>Sentence {sentenceIndex + 1} of {freeThingsLesson.sentenceFocus.length}</strong> : phase === "review" ? <strong>Gap {reviewGap} of 6</strong> : null}</aside>
      </header>

      {phase === "lobby" ? (
        <section className="free-lesson-lobby">
          <div className="free-lesson-pin-card"><p>Students join with PIN</p><strong>{String(game.pin || "").replace(/^(\d{3})(\d{3})$/, "$1 $2")}</strong><QRCodeSVG value={joinUrl} size={184} includeMargin /><button type="button" onClick={copyJoinLink}><Clipboard size={17} /> {copyState || "Copy join link"}</button></div>
          <div className="free-lesson-roster-card"><header><div><span>Classroom</span><h2>{players.length} {players.length === 1 ? "student" : "students"} joined</h2></div><Users size={25} /></header><div className="free-lesson-roster">{players.map((player) => <span key={player.id}>{player.name}</span>)}{!players.length ? <p>Waiting for students…</p> : null}</div><button className="free-lesson-primary" type="button" disabled={!players.length} onClick={beginLesson}><Play size={18} /> Begin quick read</button></div>
        </section>
      ) : null}

      {phase === "gist" ? (
        <section className="free-lesson-stage">
          <StageToolbar><LessonTimer deadline={game?.state?.phaseDeadline} label="Quick read" /><button type="button" onClick={addThirtySeconds}><Clock3 size={17} /> Add 30 seconds</button></StageToolbar>
          <div className="free-lesson-stage-prompt"><strong>Read for the overall message</strong><span>{freeThingsLesson.gistPrompt}</span></div>
          <GistArticle task={freeThingsLessonTask} />
          <button className="free-lesson-primary free-lesson-next" type="button" onClick={startPredictions}>Start gap predictions</button>
        </section>
      ) : null}

      {phase === "prediction" ? (
        <section className="free-lesson-stage">
          <div className="free-lesson-stage-prompt"><strong>{readyIds.size} of {players.length} ready</strong><span>Students may think, discuss or add a private note. You will only see their readiness.</span></div>
          <PredictionGap task={freeThingsLessonTask} lesson={freeThingsLesson} gap={gap} showResponseControls={false} />
          <ReadinessRoster players={players} readyIds={readyIds} />
          <button className="free-lesson-primary free-lesson-next" type="button" onClick={revealClues}><Highlighter size={18} /> Show the clues</button>
        </section>
      ) : null}

      {phase === "clue_reveal" ? (
        <section className="free-lesson-stage">
          <PredictionGap task={freeThingsLessonTask} lesson={freeThingsLesson} gap={gap} reveal showResponseControls={false} />
          <button className="free-lesson-primary free-lesson-next" type="button" onClick={continueAfterClues}>{gapIndex < 5 ? `Move to Gap ${gap + 1}` : "Inspect two sentences"}</button>
        </section>
      ) : null}

      {phase === "sentence_focus" ? (
        <section className="free-lesson-stage"><SentenceFocus task={freeThingsLessonTask} lesson={freeThingsLesson} index={sentenceIndex} /><button className="free-lesson-primary free-lesson-next" type="button" onClick={revealSentencePhrases}><Highlighter size={18} /> Show key phrases</button></section>
      ) : null}

      {phase === "sentence_focus_reveal" ? (
        <section className="free-lesson-stage"><SentenceFocus task={freeThingsLessonTask} lesson={freeThingsLesson} index={sentenceIndex} reveal /><button className="free-lesson-primary free-lesson-next" type="button" onClick={continueSentenceFocus}>{sentenceIndex < freeThingsLesson.sentenceFocus.length - 1 ? "Inspect the next sentence" : "Start sentence placement"}</button></section>
      ) : null}

      {phase === "placement" ? (
        <section className="free-lesson-stage free-lesson-placement-stage">
          <StageToolbar><LessonTimer deadline={game?.state?.phaseDeadline} label="Place six sentences" /><button type="button" onClick={addThirtySeconds}><Clock3 size={17} /> Add 30 seconds</button></StageToolbar>
          <div className="free-lesson-stage-prompt"><strong>{submittedIds.size} of {players.length} answers submitted</strong><span>Students can use each sentence once. One sentence is not needed.</span></div>
          <PlacementBoard task={freeThingsLessonTask} disabled />
          <SubmissionRoster players={players} submittedIds={submittedIds} />
          <button className="free-lesson-primary free-lesson-next" type="button" onClick={beginReview}>Begin gap-by-gap review</button>
        </section>
      ) : null}

      {phase === "review" ? (
        <section className="free-lesson-stage"><GapReview task={freeThingsLessonTask} lesson={freeThingsLesson} gap={reviewGap} placementsByPlayer={placementsByPlayer} /><button className="free-lesson-primary free-lesson-next" type="button" onClick={nextReview}>{reviewIndex < 5 ? `Review Gap ${reviewGap + 1}` : "Finish lesson"}</button></section>
      ) : null}

      {phase === "finished" ? <HostReport players={players} placementsByPlayer={placementsByPlayer} /> : null}
    </main>
  );
}

function StageToolbar({ children }) {
  return <div className="free-lesson-toolbar">{children}</div>;
}

function ReadinessRoster({ players, readyIds }) {
  return <div className="free-lesson-response-roster">{players.map((player) => <span className={readyIds.has(player.id) ? "is-done" : ""} key={player.id}>{readyIds.has(player.id) ? <Check size={16} /> : <i />}{player.name}</span>)}</div>;
}

function SubmissionRoster({ players, submittedIds }) {
  return <div className="free-lesson-response-roster">{players.map((player) => <span className={submittedIds.has(player.id) ? "is-done" : ""} key={player.id}>{submittedIds.has(player.id) ? <Check size={16} /> : <i />}{player.name}</span>)}</div>;
}

function HostReport({ players, placementsByPlayer }) {
  const records = Object.values(placementsByPlayer || {});
  const average = records.length ? Math.round(records.reduce((sum, record) => sum + Object.keys(freeThingsLessonTask.answers).filter((gap) => record?.answers?.[gap] === freeThingsLessonTask.answers[gap]).length, 0) / records.length * 10) / 10 : 0;
  return (
    <section className="free-lesson-stage free-lesson-report"><CheckCircle2 size={44} /><span>Lesson complete</span><h2>Class report</h2><p>{records.length} of {players.length} students submitted · class average {average} / 6</p><div>{Object.keys(freeThingsLessonTask.answers).map((gap) => { const correct = records.filter((record) => record?.answers?.[gap] === freeThingsLessonTask.answers[gap]).length; return <article key={gap}><span>Gap {gap}</span><strong>{records.length ? Math.round(correct / records.length * 100) : 0}% correct</strong><p>{correct} of {records.length} submitted answers</p></article>; })}</div></section>
  );
}
