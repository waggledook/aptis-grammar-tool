import React, { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, MessageCircle, Radio, Send, Users } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { submitCohesionChallengeLiveAnswer } from "../../api/liveGames.js";
import {
  auth,
  logOteTrainingCompleted,
  logOteTrainingStarted,
  rtdb,
} from "../../firebase.js";
import { toast } from "../../utils/toast.js";
import {
  COHESION_CHALLENGE_GAME_TYPE,
  cohesionChallengeTask,
} from "./data/oteAdvancedReadingCohesionChallenge.js";
import {
  LiveAnswerDistribution,
  LiveAnswerKey,
  LiveChallengeCase,
  LiveClueChoices,
  LiveClueDistribution,
} from "./OteCohesionChallengeLiveShared.jsx";
import "./styles/ote.css";
import "./styles/cohesion-challenge.css";

export default function OteCohesionChallengeLivePlayer() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({ option: "", clueId: "" });
  const [saving, setSaving] = useState(false);
  const loggedRef = useRef(new Set());

  useEffect(() => onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
    setGame(snapshot.exists() ? snapshot.val() : null);
    setLoading(false);
  }), [gameId]);

  const task = cohesionChallengeTask;
  const uid = auth.currentUser?.uid;
  const player = uid ? game?.players?.[uid] : null;
  const players = useMemo(
    () => Object.entries(game?.players || {}).map(([id, entry]) => ({ id, ...entry })),
    [game?.players]
  );
  const phase = game?.state?.phase || "lobby";
  const questionIndex = game?.state?.questionIndex || 0;
  const item = task.cases[questionIndex];
  const response = item ? player?.cohesionAnswers?.[item.id] : null;

  useEffect(() => {
    setDraft({ option: "", clueId: "" });
  }, [questionIndex]);

  useEffect(() => {
    if (!uid || !player || phase === "lobby") return;
    const common = {
      section: "reading",
      part: "part-3",
      mode: "teacher_led_live",
      taskId: "advanced-reading-part-3-classroom-cohesion-challenge",
      taskTitle: task.title,
      variant: "advanced",
      gameId,
      participantRole: "student",
    };
    const startedKey = `started:${gameId}:${uid}`;
    if (!loggedRef.current.has(startedKey) && !window.localStorage.getItem(`ote_cohesion_live_${startedKey}`)) {
      loggedRef.current.add(startedKey);
      window.localStorage.setItem(`ote_cohesion_live_${startedKey}`, "1");
      logOteTrainingStarted(common).catch(() => window.localStorage.removeItem(`ote_cohesion_live_${startedKey}`));
    }
    if (phase !== "finished") return;
    const completeKey = `completed:${gameId}:${uid}`;
    if (loggedRef.current.has(completeKey) || window.localStorage.getItem(`ote_cohesion_live_${completeKey}`)) return;
    loggedRef.current.add(completeKey);
    window.localStorage.setItem(`ote_cohesion_live_${completeKey}`, "1");
    const score = task.cases.filter((entry) => player.cohesionAnswers?.[entry.id]?.option === entry.answer).length;
    logOteTrainingCompleted({
      ...common,
      progressId: "reading.part3.advanced-classroom-cohesion-challenge",
      score,
      total: task.cases.length,
      answeredCount: task.cases.filter((entry) => player.cohesionAnswers?.[entry.id]).length,
      completionReason: "host_finished",
    }).catch(() => window.localStorage.removeItem(`ote_cohesion_live_${completeKey}`));
  }, [gameId, phase, player, task.cases, task.title, uid]);

  async function submitAnswer() {
    if (!item || response || saving) return;
    if (!draft.option || !draft.clueId) {
      toast("Choose a sentence and the decisive clue.");
      return;
    }
    setSaving(true);
    try {
      await submitCohesionChallengeLiveAnswer({ gameId, caseId: item.id, ...draft });
    } catch (error) {
      console.error("[CohesionChallengeLivePlayer] answer save failed", error);
      toast(error.message || "Your response could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="cohesion-live-page"><p>Joining cohesion room…</p></main>;
  if (!game || game.type !== COHESION_CHALLENGE_GAME_TYPE) {
    return <main className="cohesion-live-page"><h1>{task.title}</h1><p>Session not found.</p></main>;
  }
  if (!player) {
    return <main className="cohesion-live-page"><h1>{task.title}</h1><p>You have not joined this session. Return to the join page and enter the PIN.</p></main>;
  }

  const chosenOption = response?.option || draft.option;
  return (
    <main className="cohesion-live-page cohesion-live-player">
      <Seo title={`Live: ${task.title}`} description="Student Advanced Reading cohesion response screen." />
      <header className="cohesion-live-header">
        <div><p>OTE Advanced Reading Part 3 · Live classroom task</p><h1>{task.title}</h1></div>
        <span>{phase === "lobby" ? "Waiting" : phase === "finished" ? "Complete" : `Case ${questionIndex + 1}/${task.cases.length} · ${phase === "reveal" ? "Review" : "Detect"}`}</span>
      </header>

      {phase === "lobby" ? (
        <section className="cohesion-live-wait"><Users size={44} /><h2>You’re in the room</h2><p>Your teacher will open the first case when everyone is ready.</p></section>
      ) : null}

      {phase === "question" && item ? (
        <section className="cohesion-live-stage">
          {response ? (
            <div className="cohesion-live-status is-done"><CheckCircle2 size={21} /><strong>Response submitted</strong><span>Wait for your teacher to reveal the class answers.</span></div>
          ) : (
            <div className="cohesion-live-status"><Radio size={20} /><strong>Detect the connection</strong><span>Choose one sentence and the clue that most strongly supports it.</span></div>
          )}
          <LiveChallengeCase item={item} selected={chosenOption} onSelect={(option) => setDraft((current) => ({ ...current, option }))} disabled={Boolean(response)} />
          <LiveClueChoices item={item} selected={response?.clueId || draft.clueId} onSelect={(clueId) => setDraft((current) => ({ ...current, clueId }))} disabled={Boolean(response)} />
          {!response && draft.option && draft.clueId ? (
            <aside className="cohesion-discussion-prompt">
              <MessageCircle size={21} aria-hidden="true" />
              <div><strong>Think before you submit</strong><p>Which other option is most tempting? Why is it coherent but still wrong in this exact gap?</p></div>
            </aside>
          ) : null}
          {!response ? <button className="cohesion-live-primary" type="button" disabled={saving || !draft.option || !draft.clueId} onClick={submitAnswer}><Send size={18} /> {saving ? "Submitting…" : "Submit answer and clue"}</button> : null}
        </section>
      ) : null}

      {phase === "reveal" && item ? (
        <section className="cohesion-live-stage">
          <LiveAnswerDistribution players={players} item={item} reveal />
          <LiveClueDistribution players={players} item={item} reveal />
          <LiveChallengeCase item={item} selected={response?.option || ""} disabled reveal />
          <LiveClueChoices item={item} selected={response?.clueId || ""} disabled reveal />
          <LiveAnswerKey item={item} />
          <div className="cohesion-live-wait is-compact"><p>Discuss the distractors. Your teacher will open the next case.</p></div>
        </section>
      ) : null}

      {phase === "finished" ? <PlayerReport player={player} task={task} /> : null}
    </main>
  );
}

function PlayerReport({ player, task }) {
  const answers = player.cohesionAnswers || {};
  const score = task.cases.filter((item) => answers[item.id]?.option === item.answer).length;
  return (
    <section className="cohesion-live-stage cohesion-live-report">
      <CheckCircle2 size={44} />
      <p className="ote-kicker">Session complete</p>
      <h2>{score} / {task.cases.length}</h2>
      <p>Your score records the sentence choices. Clue selection and distractor discussion were reflective and unscored.</p>
      <div>{task.cases.map((item, index) => {
        const answer = answers[item.id]?.option;
        return <article key={item.id}><span>Case {index + 1}</span><h3>{item.title}</h3><strong>{answer ? `You chose ${answer}` : "No answer"}</strong><p>Best answer: {item.answer}</p></article>;
      })}</div>
    </section>
  );
}
