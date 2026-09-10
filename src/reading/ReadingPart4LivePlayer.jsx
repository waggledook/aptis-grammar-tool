import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, Save, Users } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { useParams } from "react-router-dom";
import { saveReadingPart4LiveProgress } from "../api/liveGames.js";
import Seo from "../components/common/Seo.jsx";
import { auth, rtdb } from "../firebase.js";
import { toast } from "../utils/toast.js";
import { getReadingPart4TeacherTask, READING_PART4_LIVE_GAME_TYPE } from "./readingPart4TaskBanks.js";
import { ReadingPart4FullReview, ReadingPart4Headings, ReadingPart4LiveTask } from "./ReadingPart4LiveShared.jsx";
import "./readingPart1Live.css";
import "./readingPart4Live.css";

const PHASE_LABELS = { lobby: "Waiting", task: "Independent work", review: "Class review", finished: "Complete" };

function getScore(task, answers = {}) {
  return task.paragraphs.filter((paragraph) => answers[paragraph.id] === paragraph.answer).length;
}

export default function ReadingPart4LivePlayer() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(null);
  const [saveState, setSaveState] = useState("");
  const saveVersion = useRef(0);

  useEffect(() => onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
    setGame(snapshot.exists() ? snapshot.val() : null);
    setLoading(false);
  }), [gameId]);

  const uid = auth.currentUser?.uid;
  const player = uid ? game?.players?.[uid] : null;
  const task = getReadingPart4TeacherTask(game?.taskId);
  const phase = game?.state?.phase || "lobby";
  const submission = player?.readingPart4Submission;
  const savedAnswers = submission && task && submission.taskId === task.id ? submission.answers || {} : {};
  const answers = draft ?? savedAnswers;
  const answeredCount = Object.keys(answers).length;

  async function changeAnswer(paragraphId, value) {
    if (!task || phase !== "task") return;
    const next = { ...answers };
    if (value) next[paragraphId] = value;
    else delete next[paragraphId];
    setDraft(next);
    const version = saveVersion.current + 1;
    saveVersion.current = version;
    setSaveState("saving");
    try {
      await saveReadingPart4LiveProgress({ gameId, taskId: task.id, answers: next });
      if (saveVersion.current === version) setSaveState("saved");
    } catch (error) {
      console.error("[ReadingPart4LivePlayer] progress save failed", error);
      if (saveVersion.current === version) setSaveState("error");
      toast(error.message || "Your answers could not be saved.");
    }
  }

  if (loading) return <main className="rp1-live-page"><p>Joining Reading Part 4 room…</p></main>;
  if (!game || game.type !== READING_PART4_LIVE_GAME_TYPE || !task) return <main className="rp1-live-page"><h1>Reading Part 4 live</h1><p>Session not found.</p></main>;
  if (!player) return <main className="rp1-live-page"><h1>Reading Part 4 live</h1><p>You have not joined this session. Return to the join page and enter the PIN.</p></main>;

  return (
    <main className="rp1-live-page">
      <Seo title={`Reading Part 4 Live: ${task.title}`} description="Student Aptis Reading Part 4 live classroom activity." />
      <header className="rp1-live-header"><div><p>Aptis Reading Part 4 · Live classroom</p><h1>{task.title}</h1></div><div className="rp1-live-phase"><span>{PHASE_LABELS[phase]}</span><strong>{phase === "task" ? `${answeredCount}/7 answered` : player.name}</strong></div></header>

      {phase === "lobby" ? <section className="rp1-live-stage rp1-live-wait"><Users size={44} /><h2>You’re in the room</h2><p>Your teacher will open the task when everyone is ready.</p></section> : null}

      {phase === "task" ? (
        <section className="rp1-live-stage">
          <div className="rp1-live-status"><Save size={21} /><div><strong>Read and answer in your own time</strong><span>Every choice is saved automatically. {saveState === "saving" ? "Saving…" : saveState === "error" ? "The last change could not be saved." : answeredCount ? `${answeredCount} of 7 saved.` : "No answers yet."}</span></div></div>
          <ReadingPart4Headings task={task} />
          <ReadingPart4LiveTask answers={answers} onChange={changeAnswer} task={task} />
        </section>
      ) : null}

      {phase === "review" ? (
        <section className="rp1-live-stage">
          <div className="rp1-live-status"><CheckCircle2 size={21} /><div><strong>{getScore(task, answers)} of 7 correct</strong><span>Your full text remains visible with clear corrective feedback.</span></div></div>
          <ReadingPart4Headings task={task} />
          <ReadingPart4FullReview playerAnswers={answers} task={task} />
        </section>
      ) : null}

      {phase === "finished" ? <section className="rp1-live-stage rp1-live-report"><CheckCircle2 size={44} /><span>Session complete</span><h2>{getScore(task, answers)} / 7</h2><p>{answeredCount} of 7 paragraphs answered.</p></section> : null}
    </main>
  );
}
