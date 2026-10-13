import React, { useEffect, useMemo, useRef, useState } from "react";
import { onValue, ref } from "firebase/database";
import { useParams } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import {
  auth,
  logAptisListeningLiveFirstRoundSubmitted,
  logAptisListeningLiveStudentCompleted,
  logAptisListeningLiveStudentStarted,
  rtdb,
  saveAptisPracticeAttempt,
} from "../../firebase.js";
import { confirmListeningLiveScriptCheck, submitAptisListeningFirstRound, submitListeningLiveAnswer } from "../../api/liveGames.js";
import { toast } from "../../utils/toast.js";
import { APTIS_LISTENING_PART4_LIVE_GAME_TYPE, getTeacherListeningPart4Task } from "./teacherListeningPart4Data.js";
import { MultipleChoiceFeedback, MultipleChoiceScript, MultipleChoiceSheet } from "./AptisListeningPart4LiveShared.jsx";
import { hasMultipleChoice, multipleChoiceLabel, scoreMultipleChoiceAnswers } from "./aptisListeningPart4LiveUtils.js";
import "./aptisListeningPart2Live.css";
import "./aptisListeningPart3Live.css";

export default function AptisListeningPart4LivePlayer() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [localAnswers, setLocalAnswers] = useState({});
  const [confirming, setConfirming] = useState(false);
  const [submittingFirstRound, setSubmittingFirstRound] = useState(false);
  const answerQueuesRef = useRef(new Map());

  useEffect(() => onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
    setGame(snapshot.exists() ? snapshot.val() : null);
    setLoading(false);
  }), [gameId]);

  const uid = auth.currentUser?.uid;
  const player = uid ? game?.players?.[uid] : null;
  const task = getTeacherListeningPart4Task(game?.taskId);
  const phase = game?.state?.phase || "lobby";
  const reviewIndex = Math.min(Number(game?.state?.reviewIndex || 0), Math.max(0, (task?.questions.length || 1) - 1));
  const question = task?.questions[reviewIndex];
  const questionNumber = reviewIndex + 1;
  const remoteAnswers = useMemo(() => Object.fromEntries(
    (task?.questions || []).map((item) => [item.key, player?.listeningAnswers?.[item.key]?.value])
      .filter(([, value]) => value !== undefined)), [task, player?.listeningAnswers]);
  const answers = useMemo(() => ({ ...remoteAnswers, ...localAnswers }), [remoteAnswers, localAnswers]);
  const activityDetails = {
    gameId,
    pin: game?.pin || null,
    activityType: "listening-task",
    activityTitle: task?.title || game?.title || "Aptis Listening Part 4",
    part: 4,
    taskId: task?.id || game?.taskId || null,
  };

  useEffect(() => {
    setLocalAnswers((current) => {
      const next = { ...current };
      for (const [key, value] of Object.entries(remoteAnswers)) {
        if (next[key] === value) delete next[key];
      }
      return next;
    });
  }, [remoteAnswers]);

  useEffect(() => {
    if (phase === "lobby" || !player || !task || !uid) return;
    const storageKey = `aptis_listening_part4_live_started:${gameId}:${uid}`;
    if (window.localStorage.getItem(storageKey)) return;
    window.localStorage.setItem(storageKey, "1");
    void logAptisListeningLiveStudentStarted({
      gameId,
      pin: game?.pin || null,
      activityTitle: task.title,
      part: 4,
      taskId: task.id,
    });
  }, [phase, player, task, uid, gameId, game?.pin]);

  useEffect(() => {
    if (phase !== "finished" || !player || !task || !uid) return;
    const storageKey = `aptis_listening_part4_live_completed:${gameId}:${uid}`;
    if (window.localStorage.getItem(storageKey)) return;
    window.localStorage.setItem(storageKey, "1");
    void saveAptisPracticeAttempt({
      id: `listening-live-${gameId}`,
      uid,
      skill: "listening",
      part: "part4",
      taskId: task.id,
      title: task.title,
      source: "ListeningPart4Live",
      firstScore: scoreMultipleChoiceAnswers(task, player.listeningAnswers, true),
      firstTotal: task.questions.length,
      latestScore: scoreMultipleChoiceAnswers(task, player.listeningAnswers),
      latestTotal: task.questions.length,
      checkCount: 1,
      assisted: false,
      playsUsed: game?.state?.playCount || 0,
    }, { isFirstSave: true }).catch((error) => {
      window.localStorage.removeItem(storageKey);
      console.error("[AptisListeningPart4LivePlayer] result save failed", error);
    });
  }, [phase, player, task, uid, gameId, game?.state?.playCount]);

  useEffect(() => {
    if (phase !== "finished" || !player || !task || !uid) return;
    const storageKey = `aptis_listening_part4_live_logged:${gameId}:${uid}`;
    if (window.localStorage.getItem(storageKey)) return;
    window.localStorage.setItem(storageKey, "1");
    void logAptisListeningLiveStudentCompleted({
      gameId,
      pin: game?.pin || null,
      activityTitle: task.title,
      part: 4,
      taskId: task.id,
      secondMode: "full",
      firstRoundScore: scoreMultipleChoiceAnswers(task, player.listeningAnswers, true),
      score: scoreMultipleChoiceAnswers(task, player.listeningAnswers),
      total: task.questions.length,
    });
  }, [phase, player, task, uid, gameId, game?.pin]);

  async function saveAnswer(itemId, value, stage = "initial") {
    setLocalAnswers((current) => ({ ...current, [itemId]: value }));
    const prior = answerQueuesRef.current.get(itemId) || Promise.resolve();
    const request = prior.catch(() => {}).then(() => submitListeningLiveAnswer({ gameId, itemId, value, stage }));
    answerQueuesRef.current.set(itemId, request);
    try {
      await request;
    } catch (error) {
      console.error("[AptisListeningPart4LivePlayer] answer save failed", error);
      toast("Your answer could not be saved. Please try again.");
    } finally {
      if (answerQueuesRef.current.get(itemId) === request) answerQueuesRef.current.delete(itemId);
    }
  }

  async function submitFirstRound() {
    if (player?.listeningFirstRoundSubmittedAt || submittingFirstRound || Number(game?.state?.completedCount || 0) < 1) return;
    setSubmittingFirstRound(true);
    try {
      await Promise.all([...answerQueuesRef.current.values()]);
      await submitAptisListeningFirstRound({ gameId });
      await logAptisListeningLiveFirstRoundSubmitted({
        ...activityDetails,
        answeredCount: task.questions.filter((item) => hasMultipleChoice(answers[item.key])).length,
        total: task.questions.length,
      });
    } catch (error) {
      console.error("[AptisListeningPart4LivePlayer] first round submission failed", error);
      toast("Your first-round answers could not be submitted. Please try again.");
    } finally {
      setSubmittingFirstRound(false);
    }
  }

  async function confirmAnswer() {
    if (!question || !hasMultipleChoice(answers[question.key])) return;
    setConfirming(true);
    try {
      await answerQueuesRef.current.get(question.key)?.catch(() => {});
      await confirmListeningLiveScriptCheck({ gameId, itemId: question.key, value: answers[question.key] });
    } catch (error) {
      console.error("[AptisListeningPart4LivePlayer] script check failed", error);
      toast("Could not confirm your answer. Please try again.");
    } finally {
      setConfirming(false);
    }
  }

  if (loading) return <main className="aptis-p2-live-page"><p>Joining listening room…</p></main>;
  if (!game || game.type !== APTIS_LISTENING_PART4_LIVE_GAME_TYPE || !task) return <main className="aptis-p2-live-page"><h1>Session not found</h1></main>;
  if (!player) return <main className="aptis-p2-live-page"><h1>You have not joined this session.</h1><p>Return to the join page and enter the PIN.</p></main>;

  const record = question ? player.listeningAnswers?.[question.key] : null;
  const initialValue = record?.initialAnswered === false ? undefined : record?.initialValue ?? record?.value;
  const audioStage = game.state?.audioStage || "idle";
  const firstListenComplete = Number(game.state?.completedCount || 0) >= 1 && audioStage === "idle";
  const phaseLabel = phase === "lobby" ? "Waiting"
    : phase === "task" ? "First listening"
      : phase === "second" ? "Second listening"
        : phase === "finished" ? "Complete"
          : `${phase === "review" ? "Feedback" : "Script check"} ${questionNumber}/2`;

  return (
    <main className="aptis-p2-live-page">
      <Seo title={`Live Aptis Listening: ${task.title}`} description="Aptis Listening Part 4 live student task." />
      <header className="aptis-p2-live-header">
        <div><p>Aptis Listening Part 4 · Live lesson</p><h1>{task.title}</h1></div>
        <span>{phaseLabel}</span>
      </header>

      {phase === "lobby" && <section className="aptis-p2-live-card">
        <h2>You’re in the room</h2><p>Your teacher will open the task when everyone is ready.</p>
      </section>}

      {phase === "task" && <section className="aptis-p2-live-card">
        <p className="aptis-p2-live-status">{audioStage === "first" ? "The monologue is playing from your teacher’s screen." : "Listen once and answer both questions. You may leave an answer blank if you are unsure."}</p>
        <MultipleChoiceSheet task={task} answers={answers} disabled={Boolean(player.listeningFirstRoundSubmittedAt)} onChange={(itemId, value) => saveAnswer(itemId, value)} />
        <p>{player.listeningFirstRoundSubmittedAt ? "Your first-round answers are submitted. Wait for the second listening." : firstListenComplete ? "Your choices save automatically. Submit any answers you can, including a blank sheet if you are unsure." : "Your choices save automatically. Submit when the recording ends or your teacher stops it."}</p>
        <div className="aptis-p2-live-actions"><button className="is-primary" disabled={!firstListenComplete || Boolean(player.listeningFirstRoundSubmittedAt) || submittingFirstRound} onClick={submitFirstRound} type="button">{player.listeningFirstRoundSubmittedAt ? "First answers submitted" : submittingFirstRound ? "Submitting…" : "Submit first answers"}</button></div>
      </section>}

      {phase === "second" && <section className="aptis-p2-live-card">
        <p className="aptis-p2-live-status">{audioStage === "full" ? "The monologue is playing again from your teacher’s screen." : "Listen to the complete monologue again and check both answers."}</p>
        <MultipleChoiceSheet task={task} answers={answers} onChange={(itemId, value) => saveAnswer(itemId, value, "second_listen")} />
        <p>Changes save automatically. Your first-round answers are kept for comparison.</p>
      </section>}

      {phase === "script_check" && question && <section className="aptis-p2-live-card">
        <p className="aptis-p2-live-status">Read this transcript section. The correct answer is still hidden.</p>
        <MultipleChoiceScript task={task} question={question} questionNumber={questionNumber} />
        <div className="aptis-p2-live-script-check">
          <label htmlFor="aptis-p4-live-revise">Your answer for question {questionNumber}</label>
          <select
            disabled={Boolean(record?.scriptCheckedAt)}
            id="aptis-p4-live-revise"
            onChange={(event) => saveAnswer(question.key, event.target.value, "script_check")}
            value={answers[question.key] || ""}
          >
            <option value="">Choose an answer</option>
            {question.options.map((option) => <option key={option.value} value={option.value}>{option.value}. {option.text}</option>)}
          </select>
          <p>First answer: {multipleChoiceLabel(question, initialValue)}</p>
          <div className="aptis-p2-live-actions"><button className="is-primary" disabled={!hasMultipleChoice(answers[question.key]) || confirming || Boolean(record?.scriptCheckedAt)} onClick={confirmAnswer} type="button">{record?.scriptCheckedAt ? "Confirmed" : confirming ? "Saving…" : "Confirm answer"}</button></div>
        </div>
      </section>}

      {phase === "review" && question && <section className="aptis-p2-live-card">
        <MultipleChoiceFeedback task={task} question={question} questionNumber={questionNumber} value={answers[question.key]} initialValue={initialValue} />
        <p>Your teacher will open the next question when the class is ready.</p>
      </section>}

      {phase === "finished" && <section className="aptis-p2-live-card">
        <h2>Session complete</h2>
        <p>You answered {scoreMultipleChoiceAnswers(task, player.listeningAnswers)} of 2 questions correctly.</p>
        <p>After the first listening: {scoreMultipleChoiceAnswers(task, player.listeningAnswers, true)} / 2.</p>
      </section>}
    </main>
  );
}
