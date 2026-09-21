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
import { APTIS_LISTENING_PART2_LIVE_GAME_TYPE, getTeacherListeningPart2Task } from "./teacherListeningPart2Data.js";
import { MatchingSheet, SpeakerFeedback, SpeakerScript } from "./AptisListeningPart2LiveShared.jsx";
import { answerText, hasListeningAnswer, scoreAnswers } from "./aptisListeningPart2LiveUtils.js";
import "./aptisListeningPart2Live.css";

export default function AptisListeningPart2LivePlayer() {
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
  const task = getTeacherListeningPart2Task(game?.taskId);
  const phase = game?.state?.phase || "lobby";
  const secondMode = game?.state?.secondMode || "";
  const reviewIndex = Math.min(Number(game?.state?.reviewIndex || 0), 3);
  const prompt = task?.prompts[reviewIndex];
  const remoteAnswers = useMemo(() => Object.fromEntries(
    (task?.prompts || []).map((item) => [item.key, player?.listeningAnswers?.[item.key]?.value])
      .filter(([, value]) => value !== undefined)), [task, player?.listeningAnswers]);
  const answers = useMemo(() => ({ ...remoteAnswers, ...localAnswers }), [remoteAnswers, localAnswers]);
  const activityDetails = {
    gameId,
    pin: game?.pin || null,
    activityType: "listening-task",
    activityTitle: task?.title || game?.title || "Aptis Listening Part 2",
    part: 2,
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
    const storageKey = `aptis_listening_part2_live_started:${gameId}:${uid}`;
    if (window.localStorage.getItem(storageKey)) return;
    window.localStorage.setItem(storageKey, "1");
    void logAptisListeningLiveStudentStarted({
      gameId,
      pin: game?.pin || null,
      activityTitle: task.title,
      part: 2,
      taskId: task.id,
    });
  }, [phase, player, task, uid, gameId, game?.pin]);

  useEffect(() => {
    if (phase !== "finished" || !player || !task || !uid) return;
    const storageKey = `aptis_listening_part2_live_completed:${gameId}:${uid}`;
    if (window.localStorage.getItem(storageKey)) return;
    window.localStorage.setItem(storageKey, "1");
    void saveAptisPracticeAttempt({
      id: `listening-live-${gameId}`,
      uid,
      skill: "listening",
      part: "part2",
      taskId: task.id,
      title: task.title,
      source: "ListeningPart2Live",
      firstScore: scoreAnswers(task, player.listeningAnswers, true),
      firstTotal: 4,
      latestScore: scoreAnswers(task, player.listeningAnswers),
      latestTotal: 4,
      checkCount: 1,
      assisted: false,
      playsUsed: game?.state?.secondMode === "speaker" ? 2 : game?.state?.playCount || 0,
    }, { isFirstSave: true }).catch((error) => {
      window.localStorage.removeItem(storageKey);
      console.error("[AptisListeningPart2LivePlayer] result save failed", error);
    });
  }, [phase, player, task, uid, gameId, game?.state?.playCount, game?.state?.secondMode]);

  useEffect(() => {
    if (phase !== "finished" || !player || !task || !uid) return;
    const storageKey = `aptis_listening_part2_live_logged:${gameId}:${uid}`;
    if (window.localStorage.getItem(storageKey)) return;
    window.localStorage.setItem(storageKey, "1");
    void logAptisListeningLiveStudentCompleted({
      gameId,
      pin: game?.pin || null,
      activityTitle: task.title,
      part: 2,
      taskId: task.id,
      secondMode: game?.state?.secondMode || null,
      firstRoundScore: scoreAnswers(task, player.listeningAnswers, true),
      score: scoreAnswers(task, player.listeningAnswers),
      total: task.prompts.length,
    });
  }, [phase, player, task, uid, gameId, game?.pin, game?.state?.secondMode]);

  async function saveAnswer(itemId, value, stage = "initial") {
    setLocalAnswers((current) => ({ ...current, [itemId]: value }));
    const prior = answerQueuesRef.current.get(itemId) || Promise.resolve();
    const request = prior.catch(() => {}).then(() => submitListeningLiveAnswer({ gameId, itemId, value, stage }));
    answerQueuesRef.current.set(itemId, request);
    try {
      await request;
    } catch (error) {
      console.error("[AptisListeningPart2LivePlayer] answer save failed", error);
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
        answeredCount: task.prompts.filter((prompt) => hasListeningAnswer(answers[prompt.key])).length,
        total: task.prompts.length,
      });
    } catch (error) {
      console.error("[AptisListeningPart2LivePlayer] first round submission failed", error);
      toast("Your first-round answers could not be submitted. Please try again.");
    } finally {
      setSubmittingFirstRound(false);
    }
  }

  async function confirmAnswer() {
    if (!prompt || !hasListeningAnswer(answers[prompt.key])) return;
    setConfirming(true);
    try {
      await answerQueuesRef.current.get(prompt.key)?.catch(() => {});
      await confirmListeningLiveScriptCheck({ gameId, itemId: prompt.key, value: answers[prompt.key] });
    } catch (error) {
      console.error("[AptisListeningPart2LivePlayer] script check failed", error);
      toast("Could not confirm your answer. Please try again.");
    } finally {
      setConfirming(false);
    }
  }

  if (loading) return <main className="aptis-p2-live-page"><p>Joining listening room…</p></main>;
  if (!game || game.type !== APTIS_LISTENING_PART2_LIVE_GAME_TYPE || !task) return <main className="aptis-p2-live-page"><h1>Session not found</h1></main>;
  if (!player) return <main className="aptis-p2-live-page"><h1>You have not joined this session.</h1><p>Return to the join page and enter the PIN.</p></main>;

  const record = prompt ? player.listeningAnswers?.[prompt.key] : null;
  const initialValue = record?.initialAnswered === false ? undefined : record?.initialValue ?? record?.value;
  const audioStage = game.state?.audioStage || "idle";
  const firstListenComplete = Number(game.state?.completedCount || 0) >= 1 && audioStage === "idle";

  return (
    <main className="aptis-p2-live-page">
      <Seo title={`Live Aptis Listening: ${task.title}`} description="Aptis Listening Part 2 live student task." />
      <header className="aptis-p2-live-header">
        <div><p>Aptis Listening Part 2 · Live lesson</p><h1>{task.title}</h1></div>
        <span>{phase === "lobby" ? "Waiting" : phase === "task" ? "First listening" : phase === "second" ? secondMode === "speaker" ? `Speaker ${reviewIndex + 1}/4` : "Full replay" : phase === "finished" ? "Complete" : `${phase === "review" ? "Feedback" : "Script check"} ${reviewIndex + 1}/4`}</span>
      </header>

      {phase === "lobby" && <section className="aptis-p2-live-card">
        <h2>You’re in the room</h2><p>Your teacher will open the task when everyone is ready.</p>
      </section>}

      {phase === "task" && <section className="aptis-p2-live-card">
        <p className="aptis-p2-live-status">{audioStage === "first" ? "The full recording is playing from your teacher’s screen." : "Listen once and match any speakers you can. You may leave answers blank."}</p>
        <MatchingSheet task={task} answers={answers} disabled={Boolean(player.listeningFirstRoundSubmittedAt)} onChange={(itemId, value) => saveAnswer(itemId, value)} />
        <p>{player.listeningFirstRoundSubmittedAt ? "Your first-round answers are submitted. Wait for the second listening." : firstListenComplete ? "Your choices save automatically. Submit any matches you can make, including a blank sheet if you are unsure." : "Your choices save automatically. Submit when the recording ends or your teacher stops it."}</p>
        <div className="aptis-p2-live-actions"><button className="is-primary" disabled={!firstListenComplete || Boolean(player.listeningFirstRoundSubmittedAt) || submittingFirstRound} onClick={submitFirstRound} type="button">{player.listeningFirstRoundSubmittedAt ? "First answers submitted" : submittingFirstRound ? "Submitting…" : "Submit first answers"}</button></div>
      </section>}

      {phase === "second" && <section className="aptis-p2-live-card">
        <p className="aptis-p2-live-status">{secondMode === "speaker" ? audioStage === `speaker-${reviewIndex + 1}` ? `${prompt?.text} is playing from your teacher’s screen.` : `Listen to ${prompt?.text} again and check your match. The script comes next.` : audioStage === "full" ? "The complete recording is playing again from your teacher’s screen." : "Listen to the full recording again and check your four matches."}</p>
        <MatchingSheet task={task} answers={answers} onlyPromptKey={secondMode === "speaker" ? prompt?.key : null} onChange={(itemId, value) => saveAnswer(itemId, value, "second_listen")} />
        <p>Changes save automatically. Your first-round answers are kept for comparison.</p>
      </section>}

      {phase === "script_check" && prompt && <section className="aptis-p2-live-card">
        <p className="aptis-p2-live-status">Read this speaker’s transcript. The correct answer is still hidden.</p>
        <SpeakerScript task={task} prompt={prompt} />
        <div className="aptis-p2-live-script-check">
          <label htmlFor="aptis-p2-live-revise">Your match for {prompt.text}</label>
          <select
            disabled={Boolean(record?.scriptCheckedAt)}
            id="aptis-p2-live-revise"
            onChange={(event) => saveAnswer(prompt.key, event.target.value, "script_check")}
            value={answers[prompt.key] || ""}
          >
            <option value="">Choose a statement</option>
            {task.choices.map((choice) => <option key={choice.key} value={choice.key}>{choice.key.toUpperCase()}. {choice.text}</option>)}
          </select>
          <p>First answer: {answerText(task, initialValue)}</p>
          <div className="aptis-p2-live-actions"><button className="is-primary" disabled={!hasListeningAnswer(answers[prompt.key]) || confirming || Boolean(record?.scriptCheckedAt)} onClick={confirmAnswer} type="button">{record?.scriptCheckedAt ? "Confirmed" : confirming ? "Saving…" : "Confirm match"}</button></div>
        </div>
      </section>}

      {phase === "review" && prompt && <section className="aptis-p2-live-card">
        <SpeakerFeedback task={task} prompt={prompt} value={answers[prompt.key]} initialValue={initialValue} />
        <p>Your teacher will open the next speaker when the class is ready.</p>
      </section>}

      {phase === "finished" && <section className="aptis-p2-live-card">
        <h2>Session complete</h2>
        <p>You matched {scoreAnswers(task, player.listeningAnswers)} of 4 speakers correctly.</p>
        <p>After the first listening: {scoreAnswers(task, player.listeningAnswers, true)} / 4.</p>
      </section>}
    </main>
  );
}
