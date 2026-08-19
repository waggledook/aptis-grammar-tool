import React, { useState } from "react";
import { ArrowLeft, Clock3, Highlighter, Play, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { createFreeThingsLessonLiveGame } from "../../api/liveGames.js";
import { getSitePath } from "../../siteConfig.js";
import { toast } from "../../utils/toast.js";
import { freeThingsLessonTask } from "./data/oteAdvancedReadingPart3FreeThingsLesson.js";
import "./styles/free-things-lesson.css";

export default function OteAdvancedReadingFreeThingsLessonLaunch({ user, nativeRoutes = false }) {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const canHost = user?.role === "teacher" || user?.role === "admin";

  async function createSession() {
    if (!canHost || creating) return;
    setCreating(true);
    try {
      const { gameId } = await createFreeThingsLessonLiveGame();
      navigate(getSitePath(`/live/free-things-lesson/host/${gameId}`));
    } catch (error) {
      console.error("[FreeThingsLessonLaunch] session creation failed", error);
      toast(error.message || "Could not create the live lesson.");
      setCreating(false);
    }
  }

  if (!canHost) return <main className="free-lesson-page"><p>This teacher-led activity is not available for this account.</p></main>;

  return (
    <main className="free-lesson-page free-lesson-launch">
      <Seo title="Why Free Things Are Complicated · Live Lesson" description="Teacher-led OTE Advanced Reading Part 3 lesson." />
      <button className="free-lesson-back" type="button" onClick={() => navigate(getSitePath(`${nativeRoutes ? "/reading" : "/ote/reading"}/advanced/part-3-gapped-text`))}><ArrowLeft size={18} /> Back to Part 3</button>
      <header className="free-lesson-launch-hero">
        <p>Advanced Reading Part 3 · Teacher-led live lesson</p>
        <h1>{freeThingsLessonTask.title}</h1>
        <span>Guide the class from an open first reading to a complete gapped-text answer. Students do not have to write during the prediction stages.</span>
      </header>
      <section className="free-lesson-launch-card">
        <div className="free-lesson-launch-stages">
          <article><Clock3 /><strong>1. Quick read</strong><span>Three minutes to understand the writer’s overall message.</span></article>
          <article><Users /><strong>2. Predict</strong><span>Think or discuss what kind of idea each gap needs. A private note is optional.</span></article>
          <article><Highlighter /><strong>3. Reveal clues</strong><span>Show useful wording around each gap and discuss what it tells the reader.</span></article>
          <article><Highlighter /><strong>4. Inspect two sentences</strong><span>Find the key phrases in two contrasting sentence options before the full task.</span></article>
          <article><Play /><strong>5. Place and review</strong><span>Students place all six sentences, then compare class answers gap by gap.</span></article>
        </div>
        <aside><strong>Teacher controls every stage</strong><p>The timers are visible, but nothing advances automatically. You decide when to reveal clues, move on or begin the class review.</p></aside>
        <button className="free-lesson-primary free-lesson-create" type="button" disabled={creating} onClick={createSession}><Play size={19} /> {creating ? "Creating lesson…" : "Create live lesson"}</button>
      </section>
    </main>
  );
}
