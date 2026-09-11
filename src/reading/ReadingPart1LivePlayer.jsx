import React, { useEffect, useState } from "react";
import { CheckCircle2, Send, Users } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { useParams } from "react-router-dom";
import { submitReadingPart1LiveAnswers } from "../api/liveGames.js";
import Seo from "../components/common/Seo.jsx";
import { auth, rtdb } from "../firebase.js";
import { toast } from "../utils/toast.js";
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

const PHASE_LABELS = { lobby: "Waiting", task: "Your answers", review: "Class review", finished: "Complete" };

export default function ReadingPart1LivePlayer() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
    setGame(snapshot.exists() ? snapshot.val() : null);
    setLoading(false);
  }), [gameId]);

  const uid = auth.currentUser?.uid;
  const player = uid ? game?.players?.[uid] : null;
  const task = getReadingPart1TeacherTask(game?.taskId);
  const phase = game?.state?.phase || "lobby";
  const reviewIndex = Number(game?.state?.reviewIndex || 0);
  const answerableGaps = task?.gaps.filter((gap) => !gap.fixed) || [];
  const reviewGap = answerableGaps[reviewIndex];
  const whyRevealedByGap = game?.state?.whyRevealedByGap || {};
  const whyRevealed = Boolean(reviewGap && whyRevealedByGap[reviewGap.id]);
  const submission = player?.readingPart1Submission;
  const players = Object.entries(game?.players || {}).map(([id, value]) => ({ id, ...value }));
  const complete = answerableGaps.length > 0 && answerableGaps.every((gap) => answers[gap.id]);

  function changeAnswer(gapId, value) {
    setAnswers((current) => ({ ...current, [gapId]: value }));
  }

  async function submitAnswers() {
    if (!task || !complete || submission || saving) return;
    setSaving(true);
    try {
      await submitReadingPart1LiveAnswers({ gameId, taskId: task.id, answers });
    } catch (error) {
      console.error("[ReadingPart1LivePlayer] submission failed", error);
      toast(error.message || "Your answers could not be submitted.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="rp1-live-page"><p>Joining Reading Part 1 room…</p></main>;
  if (!game || game.type !== APTIS_READING_PART1_LIVE_GAME_TYPE || !task) return <main className="rp1-live-page"><h1>Reading Part 1 live</h1><p>Session not found.</p></main>;
  if (!player) return <main className="rp1-live-page"><h1>Reading Part 1 live</h1><p>You have not joined this session. Return to the join page and enter the PIN.</p></main>;

  return (
    <main className="rp1-live-page">
      <Seo title={`Reading Part 1: ${task.title}`} description="Student Aptis Reading Part 1 live classroom activity." />
      <header className="rp1-live-header">
        <div><p>Aptis Reading Part 1 · Live classroom</p><h1>{task.title}</h1></div>
        <div className="rp1-live-phase"><span>{PHASE_LABELS[phase]}</span>{phase === "review" ? <strong>Gap {reviewGap?.id} of 5</strong> : <strong>{player.name}</strong>}</div>
      </header>

      {phase === "lobby" ? <section className="rp1-live-stage rp1-live-wait"><Users size={44} /><h2>You’re in the room</h2><p>Your teacher will open the task when everyone is ready.</p></section> : null}

      {phase === "task" ? (
        <section className="rp1-live-stage">
          {submission ? <div className="rp1-live-status is-done"><CheckCircle2 size={21} /><div><strong>Answers submitted</strong><span>Wait for your teacher to begin the class review.</span></div></div> : null}
          <ReadingPart1LiveTask task={task} answers={submission?.answers || answers} onChange={changeAnswer} disabled={Boolean(submission)} />
          {!submission ? <div className="rp1-live-actions"><button className="rp1-live-primary" disabled={!complete || saving} onClick={submitAnswers} type="button"><Send size={18} /> {saving ? "Submitting…" : "Submit all answers"}</button></div> : null}
        </section>
      ) : null}

      {phase === "review" && reviewGap ? (
        <section className="rp1-live-stage">
          <div className="rp1-live-status"><CheckCircle2 size={21} /><div><strong>Your answer: {submission?.answers?.[reviewGap.id] || "No answer"}</strong><span>{whyRevealed ? "The explanation has now been revealed." : "The answer is visible. Your teacher will reveal the explanation when ready."}</span></div></div>
          <ReadingPart1Distribution gap={reviewGap} players={players} reveal showWhy={whyRevealed} />
          <ReadingPart1LiveTask task={task} answers={submission?.answers || {}} disabled revealGapIds={[reviewGap.id]} />
        </section>
      ) : null}

      {phase === "finished" ? <PlayerReport submission={submission} task={task} whyRevealedByGap={whyRevealedByGap} /> : null}
    </main>
  );
}

function PlayerReport({ submission, task, whyRevealedByGap }) {
  const score = getReadingPart1LiveScore(task, submission);
  return (
    <section className="rp1-live-stage rp1-live-report">
      <CheckCircle2 size={44} /><span>Session complete</span><h2>{score} / 5</h2><p>Review the answers and explanations from the class discussion.</p>
      <div>{task.gaps.filter((gap) => !gap.fixed).map((gap) => {
        const answer = submission?.answers?.[gap.id];
        const correct = answer === gap.answer;
        return <article className={correct ? "is-correct" : "is-wrong"} key={gap.id}><span>Gap {gap.id}</span><h3>{answer || "No answer"}</h3><strong>{correct ? "Correct" : `Answer: ${gap.answer}`}</strong>{whyRevealedByGap?.[gap.id] ? <p>{gap.explanation}</p> : null}</article>;
      })}</div>
    </section>
  );
}
