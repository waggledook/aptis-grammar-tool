import React, { useEffect, useRef, useState } from "react";
import { Check, CheckCircle2, Clock3, Highlighter, Send, Users } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { submitPart4EvidenceLiveAnswer } from "../../api/liveGames.js";
import { auth, logOteTrainingCompleted, logOteTrainingStarted, rtdb } from "../../firebase.js";
import { toast } from "../../utils/toast.js";
import {
  PART4_EVIDENCE_LIVE_GAME_TYPE,
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

export default function OteReadingPart4EvidenceLivePlayer() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("");
  const [saving, setSaving] = useState(false);
  const loggedRef = useRef(new Set());

  useEffect(() => onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
    setGame(snapshot.exists() ? snapshot.val() : null);
    setLoading(false);
  }), [gameId]);

  const uid = auth.currentUser?.uid;
  const player = uid ? game?.players?.[uid] : null;
  const task = optionJuryTasks[game?.taskId];
  const phase = game?.state?.phase || "lobby";
  const questionIndex = game?.state?.questionIndex || 0;
  const question = task?.questions?.[questionIndex];
  const answers = question ? game?.part4Answers?.[question.id] || {} : {};
  const response = uid ? answers[uid] : null;

  useEffect(() => setSelected(""), [questionIndex]);

  useEffect(() => {
    if (!uid || !player || !task || phase === "lobby") return;
    const common = {
      section: "reading",
      part: "part-4",
      mode: "live_answer_evidence",
      taskId: `advanced-reading-part-4-answer-evidence-${task.id}`,
      taskTitle: `Answer & Evidence: ${task.title}`,
      variant: "advanced",
      gameId,
      participantRole: "student",
    };
    const startedKey = `started:${gameId}:${uid}`;
    if (!loggedRef.current.has(startedKey) && !window.localStorage.getItem(`ote_part4_evidence_${startedKey}`)) {
      loggedRef.current.add(startedKey);
      window.localStorage.setItem(`ote_part4_evidence_${startedKey}`, "1");
      logOteTrainingStarted(common).catch(() => window.localStorage.removeItem(`ote_part4_evidence_${startedKey}`));
    }
    if (phase !== "finished") return;
    const completedKey = `completed:${gameId}:${uid}`;
    if (loggedRef.current.has(completedKey) || window.localStorage.getItem(`ote_part4_evidence_${completedKey}`)) return;
    const score = task.questions.filter((item) => game?.part4Answers?.[item.id]?.[uid]?.option === getOptionLetter(item.answer)).length;
    loggedRef.current.add(completedKey);
    window.localStorage.setItem(`ote_part4_evidence_${completedKey}`, "1");
    logOteTrainingCompleted({
      ...common,
      progressId: "reading.part4.advanced-answer-evidence-live",
      score,
      total: task.questions.length,
      answeredCount: task.questions.filter((item) => game?.part4Answers?.[item.id]?.[uid]).length,
      completionReason: "host_finished",
    }).catch(() => window.localStorage.removeItem(`ote_part4_evidence_${completedKey}`));
  }, [game, gameId, phase, player, task, uid]);

  async function submitAnswer() {
    if (!question || !selected || response || saving) return;
    setSaving(true);
    try {
      await submitPart4EvidenceLiveAnswer({ gameId, questionId: question.id, option: selected });
    } catch (error) {
      console.error("[Part4EvidenceLivePlayer] answer save failed", error);
      toast(error.message || "Your answer could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="option-jury-page part4-evidence-live-page"><p>Joining Part 4 room…</p></main>;
  if (!game || game.type !== PART4_EVIDENCE_LIVE_GAME_TYPE || !task) return <main className="option-jury-page part4-evidence-live-page"><h1>Answer &amp; Evidence</h1><p>Session not found.</p></main>;
  if (!player) return <main className="option-jury-page part4-evidence-live-page"><h1>Answer &amp; Evidence</h1><p>You have not joined this session. Return to the join page and enter the PIN.</p></main>;

  return (
    <main className="option-jury-page part4-evidence-live-page">
      <Seo title={`Answer & Evidence: ${task.title}`} description="Student OTE Advanced Reading Part 4 live activity." />
      <header className="option-jury-player-header">
        <div><p>OTE Advanced Reading Part 4 · Answer &amp; Evidence</p><h1>{task.title}</h1></div>
        <div className="option-jury-phase"><span>{phase === "lobby" ? "Waiting" : phase === "skim" ? "First reading" : phase === "finished" ? "Complete" : phase === "reveal" ? "Evidence reveal" : "Your answer"}</span>{question && ["question", "reveal"].includes(phase) ? <strong>Question {questionIndex + 1} of {task.questions.length}</strong> : null}</div>
      </header>

      {phase === "lobby" ? <section className="part4-evidence-wait"><Users size={42} /><h2>You’re in the room</h2><p>Your teacher will begin the first reading when everyone is ready.</p></section> : null}

      {phase === "skim" ? (
        <section className="part4-evidence-live-stage">
          <Part4EvidenceTimer deadline={game?.state?.phaseDeadline} />
          <div className="part4-evidence-status"><Clock3 size={20} /><strong>Map the complete passage</strong><span>Read for the structure and main argument. Questions and options will appear afterwards.</span></div>
          <Part4FullPassage task={task} defaultOpen />
          <div className="part4-evidence-wait is-compact"><p>Keep reading until your teacher opens Question 1.</p></div>
        </section>
      ) : null}

      {phase === "question" && question ? (
        <section className="part4-evidence-live-stage">
          {response ? <div className="part4-evidence-status is-done"><CheckCircle2 size={20} /><strong>Answer submitted</strong><span>Wait for the class distribution and highlighted evidence.</span></div> : <div className="part4-evidence-status"><Highlighter size={20} /><strong>Choose the best answer</strong><span>The evidence is not highlighted yet.</span></div>}
          <Part4FullPassage task={task} />
          <Part4EvidenceQuestion task={task} question={question} selected={response?.option || selected} onSelect={setSelected} disabled={Boolean(response)} />
          {!response ? <button className="option-jury-primary part4-evidence-next" type="button" disabled={!selected || saving} onClick={submitAnswer}><Send size={18} /> {saving ? "Submitting…" : "Submit my answer"}</button> : null}
        </section>
      ) : null}

      {phase === "reveal" && question ? (
        <section className="part4-evidence-live-stage">
          <Part4AnswerDistribution answers={answers} question={question} reveal />
          <Part4FullPassage task={task} />
          <Part4EvidenceQuestion task={task} question={question} selected={response?.option || ""} disabled reveal />
          <Part4EvidenceExplanation question={question} />
          <div className="part4-evidence-wait is-compact"><p>{questionIndex === task.questions.length - 1 ? "Your teacher will finish the session after the review." : "Your teacher will open the next question after the discussion."}</p></div>
        </section>
      ) : null}

      {phase === "finished" ? <PlayerReport game={game} task={task} uid={uid} /> : null}
    </main>
  );
}

function PlayerReport({ game, task, uid }) {
  const score = task.questions.filter((question) => game?.part4Answers?.[question.id]?.[uid]?.option === getOptionLetter(question.answer)).length;
  return (
    <section className="part4-evidence-live-stage part4-evidence-report">
      <Check size={42} /><span>Session complete</span><h2>{score} / {task.questions.length}</h2><p>Compare any missed answers with the precise evidence highlighted during the review.</p>
      <div>{task.questions.map((question, index) => {
        const answer = game?.part4Answers?.[question.id]?.[uid]?.option;
        const correctLetter = getOptionLetter(question.answer);
        return <article className={answer === correctLetter ? "is-correct" : "is-wrong"} key={question.id}><span>Question {index + 1}</span><h3>{question.prompt}</h3><strong>{answer ? `You chose ${answer}` : "No answer"}</strong><p>Correct answer: {correctLetter} — {question.options[question.answer]}</p></article>;
      })}</div>
    </section>
  );
}
