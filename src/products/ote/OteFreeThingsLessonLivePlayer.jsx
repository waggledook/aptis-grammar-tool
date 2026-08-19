import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, Send, Users } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { markFreeThingsLessonPredictionReady, submitFreeThingsLessonPlacements } from "../../api/liveGames.js";
import { auth, logOteTrainingCompleted, logOteTrainingStarted, rtdb } from "../../firebase.js";
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
  lobby: "Waiting",
  gist: "Quick read",
  prediction: "Your prediction",
  clue_reveal: "Clue reveal",
  sentence_focus: "Inspect a sentence",
  sentence_focus_reveal: "Key phrases",
  placement: "Place the sentences",
  review: "Class review",
  finished: "Complete",
};

export default function OteFreeThingsLessonLivePlayer() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});
  const [placements, setPlacements] = useState({});
  const [selected, setSelected] = useState("");
  const [saving, setSaving] = useState(false);
  const loggedRef = useRef(new Set());

  useEffect(() => onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
    setGame(snapshot.exists() ? snapshot.val() : null);
    setLoading(false);
  }), [gameId]);

  const uid = auth.currentUser?.uid;
  const player = uid ? game?.players?.[uid] : null;
  const phase = game?.state?.phase || "lobby";
  const gapIndex = Number(game?.state?.gapIndex || 0);
  const reviewIndex = Number(game?.state?.reviewIndex || 0);
  const sentenceIndex = Number(game?.state?.sentenceIndex || 0);
  const gap = gapIndex + 1;
  const reviewGap = reviewIndex + 1;
  const ready = Boolean(uid && game?.predictionReady?.[String(gap)]?.[uid]);
  const placementsByPlayer = game?.part3LessonPlacements || {};
  const response = uid ? placementsByPlayer[uid] : null;
  const activePlacements = response?.answers || placements;

  useEffect(() => {
    if (!uid || !player || phase === "lobby") return;
    const common = {
      section: "reading",
      part: "part-3",
      mode: "live_guided_lesson",
      taskId: "advanced-reading-part-3-free-things-live-lesson",
      taskTitle: "Why Free Things Are Complicated · Live lesson",
      variant: "advanced",
      gameId,
      participantRole: "student",
    };
    const startedKey = `started:${gameId}:${uid}`;
    if (!loggedRef.current.has(startedKey) && !window.localStorage.getItem(`ote_free_things_lesson_${startedKey}`)) {
      loggedRef.current.add(startedKey);
      window.localStorage.setItem(`ote_free_things_lesson_${startedKey}`, "1");
      logOteTrainingStarted(common).catch(() => window.localStorage.removeItem(`ote_free_things_lesson_${startedKey}`));
    }
    if (phase !== "finished") return;
    const completedKey = `completed:${gameId}:${uid}`;
    if (loggedRef.current.has(completedKey) || window.localStorage.getItem(`ote_free_things_lesson_${completedKey}`)) return;
    const score = Object.keys(freeThingsLessonTask.answers).filter((item) => response?.answers?.[item] === freeThingsLessonTask.answers[item]).length;
    loggedRef.current.add(completedKey);
    window.localStorage.setItem(`ote_free_things_lesson_${completedKey}`, "1");
    logOteTrainingCompleted({ ...common, progressId: "reading.part3.advanced-free-things-live-lesson", score, total: 6, answeredCount: response ? 6 : 0, completionReason: "host_finished" }).catch(() => window.localStorage.removeItem(`ote_free_things_lesson_${completedKey}`));
  }, [gameId, phase, player, response, uid]);

  async function markReady() {
    if (ready || saving) return;
    setSaving(true);
    try {
      await markFreeThingsLessonPredictionReady({ gameId, gap });
    } catch (error) {
      console.error("[FreeThingsLessonPlayer] readiness save failed", error);
      toast(error.message || "Your readiness could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  function placeSentence(targetGap, letter) {
    if (!letter || response) return;
    setPlacements((current) => {
      const next = { ...current };
      Object.keys(next).forEach((item) => { if (next[item] === letter) delete next[item]; });
      next[targetGap] = letter;
      return next;
    });
    setSelected("");
  }

  function clearGap(targetGap) {
    setPlacements((current) => { const next = { ...current }; delete next[targetGap]; return next; });
  }

  async function submitPlacements() {
    if (response || Object.keys(placements).length !== 6 || saving) return;
    setSaving(true);
    try {
      await submitFreeThingsLessonPlacements({ gameId, answers: placements });
    } catch (error) {
      console.error("[FreeThingsLessonPlayer] placements save failed", error);
      toast(error.message || "Your answers could not be submitted.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="free-lesson-page"><p>Joining live lesson…</p></main>;
  if (!game || game.type !== FREE_THINGS_LESSON_GAME_TYPE) return <main className="free-lesson-page"><h1>Live Part 3 lesson</h1><p>Session not found.</p></main>;
  if (!player) return <main className="free-lesson-page"><h1>Live Part 3 lesson</h1><p>You have not joined this session. Return to the join page and enter the PIN.</p></main>;

  return (
    <main className="free-lesson-page">
      <Seo title={`${freeThingsLessonTask.title} · Live Lesson`} description="Student OTE Advanced Reading Part 3 live lesson." />
      <header className="free-lesson-session-header">
        <div><p>OTE Advanced Reading Part 3 · Live lesson</p><h1>{freeThingsLessonTask.title}</h1></div>
        <aside><span>{PHASE_LABELS[phase] || phase}</span>{phase === "prediction" || phase === "clue_reveal" ? <strong>Gap {gap} of 6</strong> : phase === "sentence_focus" || phase === "sentence_focus_reveal" ? <strong>Sentence {sentenceIndex + 1} of {freeThingsLesson.sentenceFocus.length}</strong> : phase === "review" ? <strong>Gap {reviewGap} of 6</strong> : null}</aside>
      </header>

      {phase === "lobby" ? <section className="free-lesson-wait"><Users size={44} /><h2>You’re in the room</h2><p>Your teacher will begin the quick read when the class is ready.</p></section> : null}

      {phase === "gist" ? <section className="free-lesson-stage"><LessonTimer deadline={game?.state?.phaseDeadline} label="Quick read" /><div className="free-lesson-stage-prompt"><strong>Read for the overall message</strong><span>{freeThingsLesson.gistPrompt}</span></div><GistArticle task={freeThingsLessonTask} /><div className="free-lesson-wait is-compact"><p>Your teacher will open the first gap next.</p></div></section> : null}

      {phase === "prediction" ? <section className="free-lesson-stage"><PredictionGap task={freeThingsLessonTask} lesson={freeThingsLesson} gap={gap} note={notes[gap] || ""} onNoteChange={(value) => setNotes((current) => ({ ...current, [gap]: value }))} ready={ready} onReady={markReady} /></section> : null}

      {phase === "clue_reveal" ? <section className="free-lesson-stage"><PredictionGap task={freeThingsLessonTask} lesson={freeThingsLesson} gap={gap} reveal note={notes[gap] || ""} /><div className="free-lesson-wait is-compact"><p>Compare the highlighted wording with the idea you predicted.</p></div></section> : null}

      {phase === "sentence_focus" ? <section className="free-lesson-stage"><SentenceFocus task={freeThingsLessonTask} lesson={freeThingsLesson} index={sentenceIndex} /></section> : null}

      {phase === "sentence_focus_reveal" ? <section className="free-lesson-stage"><SentenceFocus task={freeThingsLessonTask} lesson={freeThingsLesson} index={sentenceIndex} reveal /><div className="free-lesson-wait is-compact"><p>Your teacher will open the next sentence or begin the placement task.</p></div></section> : null}

      {phase === "placement" ? (
        <section className="free-lesson-stage free-lesson-placement-stage">
          <LessonTimer deadline={game?.state?.phaseDeadline} label="Place six sentences" />
          {response ? <div className="free-lesson-stage-prompt is-done"><CheckCircle2 size={20} /><strong>Answers submitted</strong><span>Wait for the class review.</span></div> : <div className="free-lesson-stage-prompt"><strong>Choose and place six sentences</strong><span>Each sentence can be used once. One sentence is not needed.</span></div>}
          <PlacementBoard task={freeThingsLessonTask} placements={activePlacements} selected={selected} onSelect={setSelected} onPlace={placeSentence} onClear={clearGap} disabled={Boolean(response)} />
          {!response ? <button className="free-lesson-primary free-lesson-next" type="button" disabled={Object.keys(placements).length !== 6 || saving} onClick={submitPlacements}><Send size={18} /> {saving ? "Submitting…" : "Submit all six answers"}</button> : null}
        </section>
      ) : null}

      {phase === "review" ? <section className="free-lesson-stage"><GapReview task={freeThingsLessonTask} lesson={freeThingsLesson} gap={reviewGap} placementsByPlayer={placementsByPlayer} studentAnswer={response?.answers?.[String(reviewGap)] || ""} /><div className="free-lesson-wait is-compact"><p>Discuss why the other sentences do not perform the same job here.</p></div></section> : null}

      {phase === "finished" ? <PlayerReport response={response} /> : null}
    </main>
  );
}

function PlayerReport({ response }) {
  const gaps = Object.keys(freeThingsLessonTask.answers);
  const score = gaps.filter((gap) => response?.answers?.[gap] === freeThingsLessonTask.answers[gap]).length;
  return (
    <section className="free-lesson-stage free-lesson-report"><CheckCircle2 size={44} /><span>Lesson complete</span><h2>{score} / 6</h2><p>Use the clue explanations from the review when you meet another gapped text.</p><div>{gaps.map((gap) => { const answer = response?.answers?.[gap]; const correct = freeThingsLessonTask.answers[gap]; return <article className={answer === correct ? "is-correct" : "is-wrong"} key={gap}><span>Gap {gap}</span><strong>{answer ? `You chose ${answer}` : "No answer"}</strong><p>Correct answer: {correct} — {freeThingsLessonTask.sentences[correct]}</p></article>; })}</div></section>
  );
}
