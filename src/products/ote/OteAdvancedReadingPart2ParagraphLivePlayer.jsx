import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, Lightbulb, Send, Users } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { useParams } from "react-router-dom";
import { submitOteAdvancedReadingPart2ParagraphIdeas } from "../../api/liveGames.js";
import Seo from "../../components/common/Seo.jsx";
import { auth, logOteTrainingCompleted, logOteTrainingStarted, rtdb } from "../../firebase.js";
import { toast } from "../../utils/toast.js";
import {
  getOteAdvancedReadingPart2TeacherTask,
  OTE_ADVANCED_READING_PART2_PARAGRAPH_LIVE_GAME_TYPE,
  OTE_ADVANCED_READING_PART2_PARAGRAPH_SUPPORT,
} from "./data/oteAdvancedReadingPart2TeacherTasks.js";
import {
  OtePart2ParagraphIdeaTask,
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
  lobby: "Waiting",
  "question-preview": "Decode the questions",
  "keyword-reveal": "Question support",
  paragraph: "Read and nominate",
  "paragraph-reveal": "Paragraph review",
  finished: "Complete",
};

function getResult(player, task) {
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
}

export default function OteAdvancedReadingPart2ParagraphLivePlayer() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState(false);
  const loggedRef = useRef(new Set());

  useEffect(() => onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
    setGame(snapshot.exists() ? snapshot.val() : null);
    setLoading(false);
  }), [gameId]);

  const uid = auth.currentUser?.uid;
  const player = uid ? game?.players?.[uid] : null;
  const task = getOteAdvancedReadingPart2TeacherTask(game?.taskId);
  const support = OTE_ADVANCED_READING_PART2_PARAGRAPH_SUPPORT[task?.id] || {};
  const phase = game?.state?.phase || "lobby";
  const sourceIndex = Math.min(2, Math.max(0, Number(game?.state?.sourceIndex || 0)));
  const sourceLetter = SOURCE_LETTERS[sourceIndex];
  const explanationsRevealed = Boolean(game?.state?.explanationsRevealed);
  const record = player?.oteReadingPart2ParagraphSubmissions?.[sourceLetter];
  const submitted = Boolean(record?.submitted && record.taskId === task?.id);
  const savedSelection = task ? getOtePart2ParagraphSelection(player, task.id, sourceLetter) : [];
  const selectedIds = drafts[sourceLetter] ?? savedSelection;

  useEffect(() => {
    if (!uid || !player || !task || phase === "lobby") return;
    const common = {
      section: "reading",
      part: "part-2",
      mode: "teacher_resource_paragraph_live",
      taskId: `advanced-reading-part-2-paragraph-${task.id}`,
      taskTitle: `Paragraph lesson: ${task.title}`,
      variant: "advanced",
      gameId,
      participantRole: "student",
    };
    const startedKey = `started:${gameId}:${uid}`;
    const startedStorageKey = `ote_part2_paragraph_live_${startedKey}`;
    if (!loggedRef.current.has(startedKey) && !window.localStorage.getItem(startedStorageKey)) {
      loggedRef.current.add(startedKey);
      window.localStorage.setItem(startedStorageKey, "1");
      logOteTrainingStarted(common).catch(() => window.localStorage.removeItem(startedStorageKey));
    }
    if (phase !== "finished") return;
    const completedKey = `completed:${gameId}:${uid}`;
    const completedStorageKey = `ote_part2_paragraph_live_${completedKey}`;
    if (loggedRef.current.has(completedKey) || window.localStorage.getItem(completedStorageKey)) return;
    const result = getResult(player, task);
    loggedRef.current.add(completedKey);
    window.localStorage.setItem(completedStorageKey, "1");
    logOteTrainingCompleted({
      ...common,
      progressId: `reading.part2.advanced.teacher-paragraph-live.${task.id}`,
      score: result.found,
      total: task.questions.length,
      completionReason: "host_finished",
    }).catch(() => window.localStorage.removeItem(completedStorageKey));
  }, [gameId, phase, player, task, uid]);

  function toggleQuestion(questionId) {
    if (submitted || phase !== "paragraph") return;
    setDrafts((current) => {
      const selected = new Set(current[sourceLetter] ?? savedSelection);
      if (selected.has(questionId)) selected.delete(questionId);
      else selected.add(questionId);
      return { ...current, [sourceLetter]: [...selected] };
    });
  }

  async function submitIdeas() {
    if (!task || submitted || !selectedIds.length || saving) return;
    setSaving(true);
    try {
      await submitOteAdvancedReadingPart2ParagraphIdeas({
        gameId,
        taskId: task.id,
        sourceLetter,
        selectedQuestionIds: selectedIds,
      });
    } catch (error) {
      console.error("[OTE Reading Part 2 paragraph live] Submission failed", error);
      toast(error.message || "Your ideas could not be submitted.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="rp1-live-page"><p>Joining paragraph-by-paragraph room…</p></main>;
  if (!game || game.type !== OTE_ADVANCED_READING_PART2_PARAGRAPH_LIVE_GAME_TYPE || !task) return <main className="rp1-live-page"><h1>OTE Reading Part 2 paragraph live</h1><p>Session not found.</p></main>;
  if (!player) return <main className="rp1-live-page"><h1>OTE Reading Part 2 paragraph live</h1><p>You have not joined this session. Return to the join page and enter the PIN.</p></main>;

  return (
    <main className="rp1-live-page ote-part2-paragraph-live-page">
      <Seo title={`Paragraph lesson: ${task.title}`} description="Student OTE Advanced Reading Part 2 paragraph-by-paragraph lesson." />
      <header className="rp1-live-header"><div><p>OTE Advanced Reading Part 2 · Paragraph-by-paragraph</p><h1>{task.title}</h1></div><div className="rp1-live-phase"><span>{PHASE_LABELS[phase]}</span><strong>{["paragraph", "paragraph-reveal"].includes(phase) ? `Text ${sourceLetter} · ${sourceIndex + 1}/3` : player.name}</strong></div></header>

      {phase === "lobby" ? <section className="rp1-live-stage rp1-live-wait"><Users size={44} /><h2>You’re in the room</h2><p>Your teacher will open the questions when everyone is ready.</p></section> : null}

      {phase === "question-preview" ? (
        <section className="rp1-live-stage">
          <div className="rp1-live-status"><Users size={21} /><div><strong>Read all seven questions first</strong><span>Think about the key meaning in each one. The texts will appear later.</span></div></div>
          <OtePart2QuestionPreview task={task} support={support} />
        </section>
      ) : null}

      {phase === "keyword-reveal" ? (
        <section className="rp1-live-stage">
          <div className="rp1-live-status"><Lightbulb size={21} /><div><strong>Compare your question targets</strong><span>The key words and a brief simpler paraphrase are now visible.</span></div></div>
          <OtePart2QuestionPreview task={task} support={support} revealed />
        </section>
      ) : null}

      {phase === "paragraph" ? (
        <section className="rp1-live-stage">
          <div className={`rp1-live-status ${submitted ? "is-done" : ""}`}><Send size={21} /><div><strong>{submitted ? `Ideas submitted for text ${sourceLetter}` : `Read text ${sourceLetter} and nominate its questions`}</strong><span>{submitted ? "Wait for the teacher to reveal the class ideas and correct matches." : "Select every question this specialist appears to answer, then submit once."}</span></div></div>
          <OtePart2ParagraphSource task={task} sourceLetter={sourceLetter} />
          <OtePart2ParagraphIdeaTask task={task} selectedIds={selectedIds} onToggle={toggleQuestion} disabled={submitted} />
          {!submitted ? <div className="rp1-live-actions"><button className="rp1-live-primary" type="button" disabled={!selectedIds.length || saving} onClick={submitIdeas}><Send size={18} /> {saving ? "Submitting…" : "Submit my ideas"}</button></div> : null}
        </section>
      ) : null}

      {phase === "paragraph-reveal" ? (
        <section className="rp1-live-stage">
          <div className="rp1-live-status"><CheckCircle2 size={21} /><div><strong>Reviewing text {sourceLetter}</strong><span>{explanationsRevealed ? "The full explanations are now visible." : "Compare your choices with the correct matches and highlighted extracts."}</span></div></div>
          <OtePart2ParagraphSource task={task} sourceLetter={sourceLetter} evidence={getOtePart2ParagraphEvidence(task, support, sourceLetter)} />
          <OtePart2ParagraphReveal task={task} sourceLetter={sourceLetter} support={support} playerSelection={savedSelection} showExplanations={explanationsRevealed} />
        </section>
      ) : null}

      {phase === "finished" ? <PlayerReport player={player} task={task} /> : null}
    </main>
  );
}

function PlayerReport({ player, task }) {
  const result = getResult(player, task);
  return <section className="rp1-live-stage rp1-live-report"><CheckCircle2 size={44} /><span>Session complete</span><h2>{result.found} / {task.questions.length} correct matches found</h2><p>{result.extra ? `${result.extra} extra ${result.extra === 1 ? "match was" : "matches were"} selected along the way.` : "No extra matches were selected."}</p></section>;
}
