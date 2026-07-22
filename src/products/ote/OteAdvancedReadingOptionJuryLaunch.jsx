import React, { useState } from "react";
import { ArrowLeft, Gavel, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { createOptionJuryLiveGame } from "../../api/liveGames.js";
import { getSitePath } from "../../siteConfig.js";
import { toast } from "../../utils/toast.js";
import { DEFAULT_OPTION_JURY_TASK_ID, optionJuryTasks } from "./data/oteAdvancedReadingPart4OptionJury.js";
import "./styles/option-jury.css";

export default function OteAdvancedReadingOptionJuryLaunch({ user, nativeRoutes = false }) {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const task = optionJuryTasks[DEFAULT_OPTION_JURY_TASK_ID];
  const canHost = user?.role === "teacher" || user?.role === "admin";

  async function createSession() {
    if (!canHost || creating) return;
    setCreating(true);
    try {
      const { gameId } = await createOptionJuryLiveGame({ taskId: task.id, title: `Option Jury: ${task.title}` });
      navigate(getSitePath(`/live/option-jury/host/${gameId}`));
    } catch (error) {
      console.error("[OptionJuryLaunch] session creation failed", error);
      toast(error.message || "Could not create the Option Jury session.");
      setCreating(false);
    }
  }

  if (!canHost) return <main className="ote-training-page"><p>This teacher-led activity is not available for this account.</p></main>;

  return (
    <main className="ote-training-page option-jury-launch">
      <Seo title="Option Jury | OTE Advanced Reading" description="Teacher-led OTE Advanced Reading Part 4 classroom activity." />
      <button className="ote-training-back" type="button" onClick={() => navigate(getSitePath(`${nativeRoutes ? "/reading" : "/ote/reading"}/advanced/part-4-long-text`))}><ArrowLeft size={18} /> Back to Part 4</button>
      <header className="ote-training-hero"><p className="ote-kicker">Advanced Reading Part 4 · Live classroom game</p><h1>Option Jury</h1><p>Students skim the whole text, then investigate one rotating option at a time before comparing the class’s reasoning and voting.</p></header>
      <section className="option-jury-launch-card">
        <div><Gavel size={34} aria-hidden="true" /><span>Task</span><h2>{task.title}</h2><p>One complete long text, five questions and three carefully designed options for each question.</p></div>
        <button className="option-jury-primary option-jury-launch-button" type="button" onClick={createSession} disabled={creating}><Users size={19} />{creating ? "Creating session…" : "Create live session"}</button>
        <ol><li><strong>Skim:</strong> four minutes to map the complete text.</li><li><strong>Investigate:</strong> each team sees one option and the relevant evidence paragraph.</li><li><strong>Compare and vote:</strong> reveal all three evaluations, choose an answer, then repeat with the next question.</li></ol>
      </section>
    </main>
  );
}
