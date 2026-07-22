import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Gavel, Lock, Send } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { auth, logOteTrainingCompleted, rtdb } from "../../firebase.js";
import { saveOptionJuryEvaluation, submitOptionJuryFinalVote, submitOptionJuryInvestigation } from "../../api/liveGames.js";
import { toast } from "../../utils/toast.js";
import {
  OPTION_JURY_GAME_TYPE,
  OPTION_LETTERS,
  VERDICT_OPTIONS,
  getAssignedOptionForQuestion,
  getOptionIndex,
  getOptionLetter,
  optionJuryTasks,
} from "./data/oteAdvancedReadingPart4OptionJury.js";
import {
  ComparisonOptions,
  EvidencePanel,
  PassagePanel,
  PhasePill,
  TimerDisplay,
  VoteDistribution,
} from "./OteOptionJuryShared.jsx";

function useRemainingSeconds(deadline) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!deadline) return undefined;
    const timer = window.setInterval(() => setTick((value) => value + 1), 250);
    return () => window.clearInterval(timer);
  }, [deadline]);
  return deadline ? Math.max(0, Math.ceil((deadline - Date.now()) / 1000)) : null;
}

export default function OteOptionJuryPlayer() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluation, setEvaluation] = useState({ verdict: "", reason: "" });
  const [saving, setSaving] = useState(false);
  const [vote, setVote] = useState("");
  const [changedMind, setChangedMind] = useState(null);
  const autoInvestigationRef = useRef("");
  const autoVoteRef = useRef("");

  useEffect(() => {
    const unsubscribe = onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
      setGame(snapshot.exists() ? snapshot.val() : null);
      setLoading(false);
    });
    return unsubscribe;
  }, [gameId]);

  const uid = auth.currentUser?.uid;
  const player = uid ? game?.players?.[uid] : null;
  const task = optionJuryTasks[game?.taskId];
  const phase = game?.state?.phase || "lobby";
  const questionIndex = game?.state?.questionIndex ?? 0;
  const question = task?.questions?.[questionIndex];
  const teamLetter = player?.optionAssignment || "";
  const assignedOption = getAssignedOptionForQuestion(teamLetter, questionIndex);
  const assignedIndex = getOptionIndex(assignedOption);
  const storedEvaluation = question && uid ? game?.investigations?.[uid]?.[question.id] : null;
  const currentVote = question && uid ? game?.finalVotes?.[question.id]?.[uid] : null;
  const deadline = game?.state?.phaseDeadline || null;
  const remainingSeconds = useRemainingSeconds(deadline);
  const timeExpired = deadline && remainingSeconds === 0;
  const players = useMemo(
    () => Object.entries(game?.players || {}).map(([id, data]) => ({ id, ...data })),
    [game?.players]
  );

  useEffect(() => {
    setEvaluation({
      verdict: storedEvaluation?.verdict || "",
      reason: storedEvaluation?.reason || "",
    });
  }, [question?.id, storedEvaluation?.verdict, storedEvaluation?.reason, storedEvaluation?.updatedAt, storedEvaluation?.submittedAt]);

  useEffect(() => {
    setVote("");
    setChangedMind(null);
  }, [questionIndex]);

  useEffect(() => {
    if (phase !== "finished" || !uid || !task || !teamLetter) return;
    const storageKey = `ote_option_jury_completed:${gameId}:${uid}`;
    if (window.localStorage.getItem(storageKey)) return;
    const initialScore = task.questions.filter((item, index) => {
      const optionIndex = getOptionIndex(getAssignedOptionForQuestion(teamLetter, index));
      return game?.investigations?.[uid]?.[item.id]?.verdict === item.optionVerdicts[optionIndex];
    }).length;
    const finalScore = task.questions.filter(
      (item) => game?.finalVotes?.[item.id]?.[uid]?.option === getOptionLetter(item.answer)
    ).length;
    window.localStorage.setItem(storageKey, "1");
    logOteTrainingCompleted({
      section: "reading",
      part: "part-4",
      mode: "live_option_jury",
      taskId: `advanced-reading-part-4-option-jury-${task.id}`,
      taskTitle: `Option Jury: ${task.title}`,
      progressId: "reading.part4.advanced-option-jury",
      variant: "advanced",
      score: finalScore,
      total: task.questions.length,
      initialEvaluationScore: initialScore,
      teamAssignment: teamLetter,
      gameId,
    }).catch((error) => {
      window.localStorage.removeItem(storageKey);
      console.error("[OptionJuryPlayer] completion log failed", error);
    });
  }, [phase, uid, task, teamLetter, game, gameId]);

  async function persistEvaluation(next) {
    if (!question || storedEvaluation?.submitted || timeExpired) return;
    setEvaluation(next);
    try {
      await saveOptionJuryEvaluation({
        gameId,
        questionId: question.id,
        assignedOption,
        verdict: next.verdict,
        reason: next.reason,
      });
    } catch (error) {
      console.error("[OptionJuryPlayer] evaluation save failed", error);
      toast("That evaluation could not be saved. Please try again.");
    }
  }

  const submitInvestigation = useCallback(async ({ automatic = false } = {}) => {
    if (!question || !evaluation.verdict || storedEvaluation?.submitted || saving) return;
    setSaving(true);
    try {
      await submitOptionJuryInvestigation({
        gameId,
        questionId: question.id,
        assignedOption,
        verdict: evaluation.verdict,
        reason: evaluation.reason,
      });
      if (automatic) toast("Time is up. Your selected judgement was submitted.");
    } catch (error) {
      console.error("[OptionJuryPlayer] investigation submission failed", error);
      toast("Could not submit your judgement.");
    } finally {
      setSaving(false);
    }
  }, [question, evaluation, storedEvaluation?.submitted, saving, gameId, assignedOption]);

  const submitVote = useCallback(async ({ automatic = false } = {}) => {
    if (!question || !vote || currentVote || saving) return;
    setSaving(true);
    try {
      await submitOptionJuryFinalVote({ gameId, questionId: question.id, option: vote, changedMind });
      if (automatic) toast("Time is up. Your selected answer was submitted.");
    } catch (error) {
      console.error("[OptionJuryPlayer] vote failed", error);
      toast("Could not submit your final vote.");
    } finally {
      setSaving(false);
    }
  }, [question, vote, currentVote, saving, gameId, changedMind]);

  useEffect(() => {
    if (phase !== "investigation" || !deadline || remainingSeconds !== 0 || !question || storedEvaluation?.submitted || !evaluation.verdict) return;
    const key = `${question.id}:${deadline}`;
    if (autoInvestigationRef.current === key) return;
    autoInvestigationRef.current = key;
    submitInvestigation({ automatic: true });
  }, [phase, deadline, remainingSeconds, question, storedEvaluation?.submitted, evaluation.verdict, submitInvestigation]);

  useEffect(() => {
    if (phase !== "final_vote" || !deadline || remainingSeconds !== 0 || !question || currentVote || !vote) return;
    const key = `${question.id}:${deadline}`;
    if (autoVoteRef.current === key) return;
    autoVoteRef.current = key;
    submitVote({ automatic: true });
  }, [phase, deadline, remainingSeconds, question, currentVote, vote, submitVote]);

  if (loading) return <main className="option-jury-page option-jury-player"><p>Joining Option Jury…</p></main>;
  if (!game || game.type !== OPTION_JURY_GAME_TYPE || !task) return <main className="option-jury-page option-jury-player"><h1>Option Jury</h1><p>Session not found.</p></main>;
  if (!player) return <main className="option-jury-page option-jury-player"><h1>Option Jury</h1><p>You have not joined this session. Return to the join page and enter the PIN.</p></main>;

  return (
    <main className="option-jury-page option-jury-player">
      <Seo title={`Option Jury: ${task.title}`} description="OTE Advanced Reading Option Jury activity." />
      <header className="option-jury-player-header">
        <div><p>OTE Advanced Reading · Option Jury</p><h1>{task.title}</h1></div>
        <PhasePill phase={phase} questionIndex={questionIndex} totalQuestions={task.questions.length} />
      </header>

      {phase === "lobby" ? (
        <section className="option-jury-player-wait">
          <Gavel size={40} />
          <span>Your team</span>
          {teamLetter ? (
            <><h2>Team {teamLetter}</h2><p>Your team stays fixed, but the option you investigate rotates after every question.</p></>
          ) : (
            <><h2>Waiting for your team</h2><p>Your teacher will assign you to Team A, B or C.</p></>
          )}
        </section>
      ) : null}

      {phase === "skim" ? (
        <section className="option-jury-player-stage">
          <TimerDisplay remainingSeconds={remainingSeconds} label="Skim reading" />
          <div className="option-jury-question-heading"><span>First look</span><h2>Map the whole passage</h2><p>Skim the text for its structure and main argument. Questions and options will appear afterwards.</p></div>
          <PassagePanel task={task} defaultOpen />
          <Waiting compact title="Keep skimming" copy="Your teacher will open Question 1 when the class is ready." />
        </section>
      ) : null}

      {phase === "investigation" && question ? (
        <section className="option-jury-investigation">
          <TimerDisplay remainingSeconds={remainingSeconds} label={`Question ${questionIndex + 1} investigation`} />
          <EvidencePanel task={task} question={question} />
          <PassagePanel task={task} />
          {storedEvaluation?.submitted ? (
            <Waiting title="Your judgement is locked in." copy="Wait for your teacher to reveal the other two options." />
          ) : (
            <article className="option-jury-investigation-card" id="option-jury-question">
              <span>Question {questionIndex + 1} · Team {teamLetter} investigates Option {assignedOption}</span>
              <h2>{question.prompt}</h2>
              <div className="option-jury-assigned-option"><small>Your assigned option: {assignedOption}</small><p>{question.options[assignedIndex]}</p></div>
              <fieldset disabled={timeExpired || saving}>
                <legend>How well does it answer the question?</legend>
                {VERDICT_OPTIONS.map((verdict) => (
                  <button className={evaluation.verdict === verdict.id ? "is-active" : ""} type="button" key={verdict.id} onClick={() => persistEvaluation({ ...evaluation, verdict: verdict.id })}>
                    {evaluation.verdict === verdict.id ? <Check size={18} /> : null}{verdict.label}
                  </button>
                ))}
              </fieldset>
              <label>
                Why? Identify the evidence or problem. <small>Optional · {evaluation.reason.length}/220</small>
                <textarea disabled={timeExpired || saving} maxLength={220} rows={3} value={evaluation.reason} onChange={(event) => setEvaluation((current) => ({ ...current, reason: event.target.value }))} onBlur={() => persistEvaluation(evaluation)} />
              </label>
              {timeExpired && !evaluation.verdict ? <p className="option-jury-time-up">Time is up. No judgement was selected.</p> : null}
              <button className="option-jury-primary" type="button" disabled={!evaluation.verdict || saving || timeExpired} onClick={() => submitInvestigation()}><Send size={18} />{saving ? "Submitting…" : "Lock in my judgement"}</button>
            </article>
          )}
        </section>
      ) : null}

      {phase === "comparison" && question ? (
        <section className="option-jury-player-stage">
          <EvidencePanel task={task} question={question} />
          <PassagePanel task={task} />
          <div className="option-jury-question-heading" id="option-jury-question"><span>Compare · Question {questionIndex + 1}</span><h2>{question.prompt}</h2><p>Read the other teams’ judgements. Decide which option is ultimately the best answer.</p></div>
          <ComparisonOptions game={game} question={question} questionIndex={questionIndex} players={players} />
          <Waiting compact title="Discuss the evidence" copy="Your teacher will open the final vote when the class is ready." />
        </section>
      ) : null}

      {phase === "final_vote" && question ? (
        <section className="option-jury-player-stage">
          <TimerDisplay remainingSeconds={remainingSeconds} label={`Question ${questionIndex + 1} final vote`} />
          <EvidencePanel task={task} question={question} />
          <PassagePanel task={task} />
          {currentVote ? (
            <Waiting title="Your vote is locked in." copy="Wait for your teacher to reveal the answer." />
          ) : (
            <article className="option-jury-final-vote" id="option-jury-question">
              <span>Final vote · Question {questionIndex + 1}</span>
              <h2>{question.prompt}</h2>
              <p>Choose the best answer after comparing all three options.</p>
              <div>{OPTION_LETTERS.map((letter, index) => <button className={vote === letter ? "is-active" : ""} type="button" disabled={timeExpired || saving} key={letter} onClick={() => setVote(letter)}><strong>{letter}</strong>{question.options[index]}</button>)}</div>
              <fieldset disabled={timeExpired || saving}><legend>Did another student’s reasoning change your mind? <small>Optional</small></legend><button className={changedMind === true ? "is-active" : ""} type="button" onClick={() => setChangedMind(true)}>Yes</button><button className={changedMind === false ? "is-active" : ""} type="button" onClick={() => setChangedMind(false)}>No</button></fieldset>
              {timeExpired && !vote ? <p className="option-jury-time-up">Time is up. No final answer was selected.</p> : null}
              <button className="option-jury-primary" type="button" disabled={!vote || saving || timeExpired} onClick={() => submitVote()}><Lock size={18} />{saving ? "Submitting…" : "Lock in my answer"}</button>
            </article>
          )}
        </section>
      ) : null}

      {phase === "answer_reveal" && question ? (
        <section className="option-jury-player-stage">
          <EvidencePanel task={task} question={question} />
          <PassagePanel task={task} />
          <div className="option-jury-question-heading" id="option-jury-question"><span>Answer · Question {questionIndex + 1}</span><h2>{getOptionLetter(question.answer)} is correct</h2><p>{question.explanation}</p></div>
          <VoteDistribution votes={game?.finalVotes?.[question.id]} correctLetter={getOptionLetter(question.answer)} />
          <ComparisonOptions game={game} question={question} questionIndex={questionIndex} players={players} reveal />
          <Waiting compact title="Answer reviewed" copy={questionIndex === task.questions.length - 1 ? "Wait for your teacher to finish the session." : "Wait for your teacher to open the next question."} />
        </section>
      ) : null}

      {phase === "finished" ? <PlayerReport game={game} task={task} player={player} uid={uid} /> : null}
    </main>
  );
}

function Waiting({ title, copy, compact = false }) {
  return <div className={`option-jury-player-wait ${compact ? "is-compact" : ""}`}><Check size={compact ? 24 : 40} /><h2>{title}</h2><p>{copy}</p></div>;
}

function PlayerReport({ game, task, player, uid }) {
  const initialScore = task.questions.filter((question, index) => {
    const optionIndex = getOptionIndex(getAssignedOptionForQuestion(player.optionAssignment, index));
    return game?.investigations?.[uid]?.[question.id]?.verdict === question.optionVerdicts[optionIndex];
  }).length;
  const finalScore = task.questions.filter((question) => game?.finalVotes?.[question.id]?.[uid]?.option === getOptionLetter(question.answer)).length;
  return <section className="option-jury-player-report"><Gavel size={42} /><span>Session complete</span><h2>Your Option Jury report</h2><div><article><small>Option judgements</small><strong>{initialScore}/5</strong><p>How accurately you evaluated your team’s rotating option.</p></article><article><small>Final answers</small><strong>{finalScore}/5</strong><p>Your score after comparing all three options.</p></article></div><p>Your first score rewards accurate diagnosis, including recognising when a distractor is flawed.</p></section>;
}
