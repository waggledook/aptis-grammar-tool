import React, { useState } from "react";
import { ArrowLeft, Gavel, Highlighter, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { createOptionJuryLiveGame, createPart4EvidenceLiveGame } from "../../api/liveGames.js";
import { getSitePath } from "../../siteConfig.js";
import { toast } from "../../utils/toast.js";
import { DEFAULT_OPTION_JURY_TASK_ID, optionJuryTasks } from "./data/oteAdvancedReadingPart4OptionJury.js";
import "./styles/option-jury.css";

export default function OteAdvancedReadingOptionJuryLaunch({ user, nativeRoutes = false }) {
  const navigate = useNavigate();
  const [creatingMode, setCreatingMode] = useState("");
  const task = optionJuryTasks[DEFAULT_OPTION_JURY_TASK_ID];
  const canHost = user?.role === "teacher" || user?.role === "admin";

  async function createSession(mode) {
    if (!canHost || creatingMode) return;
    setCreatingMode(mode);
    try {
      const isJury = mode === "jury";
      const { gameId } = isJury
        ? await createOptionJuryLiveGame({ taskId: task.id, title: `Option Jury: ${task.title}` })
        : await createPart4EvidenceLiveGame({ taskId: task.id, title: `Evidence Reveal: ${task.title}` });
      navigate(getSitePath(isJury ? `/live/option-jury/host/${gameId}` : `/live/part4-evidence/host/${gameId}`));
    } catch (error) {
      console.error("[Part4LiveLaunch] session creation failed", error);
      toast(error.message || "Could not create the Part 4 session.");
      setCreatingMode("");
    }
  }

  if (!canHost) return <main className="ote-training-page"><p>This teacher-led activity is not available for this account.</p></main>;

  return (
    <main className="ote-training-page option-jury-launch">
      <Seo title="Part 4 Live Activities | OTE Advanced Reading" description="Teacher-led OTE Advanced Reading Part 4 classroom activities." />
      <button className="ote-training-back" type="button" onClick={() => navigate(getSitePath(`${nativeRoutes ? "/reading" : "/ote/reading"}/advanced/part-4-long-text`))}><ArrowLeft size={18} /> Back to Part 4</button>
      <header className="ote-training-hero"><p className="ote-kicker">Advanced Reading Part 4 · Live classroom activities</p><h1>Choose a live format</h1><p>Use the same complete Part 4 text in a collaborative Option Jury or a more traditional answer-and-evidence activity.</p></header>
      <div className="option-jury-launch-grid">
      <section className="option-jury-launch-card">
        <div><Gavel size={34} aria-hidden="true" /><span>Task</span><h2>{task.title}</h2><p>One complete long text, five questions and three carefully designed options for each question.</p></div>
        <h3>Option Jury</h3>
        <p>Best for groups ready to investigate and defend one rotating option before the final class vote.</p>
        <button className="option-jury-primary option-jury-launch-button" type="button" onClick={() => createSession("jury")} disabled={Boolean(creatingMode)}><Users size={19} />{creatingMode === "jury" ? "Creating session…" : "Create Option Jury"}</button>
        <ol><li><strong>Skim:</strong> four minutes to map the complete text.</li><li><strong>Investigate:</strong> each team sees one option and the relevant evidence paragraph.</li><li><strong>Compare and vote:</strong> reveal all three evaluations, choose an answer, then repeat with the next question.</li></ol>
      </section>
      <section className="option-jury-launch-card is-evidence-format">
        <div><Highlighter size={34} aria-hidden="true" /><span>Same task · Alternative format</span><h2>{task.title}</h2><p>Every student sees the relevant paragraph, question and all three answer options.</p></div>
        <h3>Answer &amp; Evidence</h3>
        <p>Best for groups who benefit from a familiar multiple-choice routine and a clear evidence reveal.</p>
        <button className="option-jury-primary option-jury-launch-button" type="button" onClick={() => createSession("evidence")} disabled={Boolean(creatingMode)}><Highlighter size={19} />{creatingMode === "evidence" ? "Creating session…" : "Create Answer & Evidence"}</button>
        <ol><li><strong>Skim:</strong> four minutes to map the complete text before any questions appear.</li><li><strong>Read and answer:</strong> everyone sees the relevant paragraph and all three options.</li><li><strong>Reveal:</strong> compare the class distribution with the correct answer and highlighted textual evidence.</li></ol>
      </section>
      </div>
    </main>
  );
}
