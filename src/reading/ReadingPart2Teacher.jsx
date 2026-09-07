import React, { useState } from "react";
import { Check, Play, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createReadingPart2LiveGame } from "../api/liveGames.js";
import AptisPart2Reorder from "./AptisPart2Reorder.jsx";
import { READING_PART2_TEACHER_TASKS } from "./part2Tasks.js";
import { getSitePath } from "../siteConfig.js";
import { toast } from "../utils/toast.js";

export default function ReadingPart2Teacher({ user, onRequireSignIn }) {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [liveBuilderOpen, setLiveBuilderOpen] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const isTeacher = user?.role === "teacher" || user?.role === "admin";
  const liveTasks = READING_PART2_TEACHER_TASKS.map((task) => ({
    id: `${task.id}__${task.texts[0].id}`,
    title: task.title,
    subtitle: task.texts[0].title,
  }));

  function openLiveBuilder(task) {
    setSelectedTaskIds(task?.id ? [task.id] : [liveTasks[0]?.id].filter(Boolean));
    setLiveBuilderOpen(true);
  }

  function toggleTask(taskId) {
    setSelectedTaskIds((current) => current.includes(taskId)
      ? current.filter((id) => id !== taskId)
      : [...current, taskId]);
  }

  async function launchLive() {
    if (!selectedTaskIds.length || creating) return;
    const orderedTaskIds = liveTasks.filter((task) => selectedTaskIds.includes(task.id)).map((task) => task.id);
    setCreating(true);
    try {
      const { gameId } = await createReadingPart2LiveGame({
        taskIds: orderedTaskIds,
        title: orderedTaskIds.length === 1
          ? `Aptis Reading Part 2 · ${liveTasks.find((task) => task.id === orderedTaskIds[0])?.title || "Live task"}`
          : `Aptis Reading Part 2 · ${orderedTaskIds.length}-task session`,
      });
      navigate(getSitePath(`/live/aptis-reading-part2/host/${gameId}`));
    } catch (error) {
      console.error("[ReadingPart2Teacher] live room creation failed", error);
      toast(error.message || "Could not create the live reading room.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <AptisPart2Reorder
        tasks={READING_PART2_TEACHER_TASKS}
        user={user}
        onRequireSignIn={onRequireSignIn}
        routeBasePath={getSitePath("/reading/part2-teacher")}
        showAssignButton={true}
        trackProgress={true}
        progressPart="part2-teacher"
        lockAfterIndex={null}
        heading="Reading – Part 2 Teacher Tasks"
        intro="Additional sentence-order tasks for classroom practice, assignment or a live teacher-paced session."
        headerActions={(task) => isTeacher ? (
          <button className="btn primary" onClick={() => openLiveBuilder(task)} type="button">
            <Play size={16} aria-hidden="true" /> Build live session
          </button>
        ) : null}
      />

      {liveBuilderOpen ? (
        <div className="reading-part2-live-builder-overlay" role="presentation">
          <section aria-labelledby="part2-live-builder-title" aria-modal="true" className="reading-part2-live-builder" role="dialog">
            <header>
              <div><p>Live classroom</p><h2 id="part2-live-builder-title">Choose session tasks</h2><span>Select one task or combine several in the order shown.</span></div>
              <button aria-label="Close live session builder" disabled={creating} onClick={() => setLiveBuilderOpen(false)} type="button"><X size={20} /></button>
            </header>
            <div className="reading-part2-live-builder-tools">
              <strong>{selectedTaskIds.length} selected</strong>
              <button onClick={() => setSelectedTaskIds(liveTasks.map((task) => task.id))} type="button">Select all</button>
              <button onClick={() => setSelectedTaskIds([])} type="button">Clear</button>
            </div>
            <div className="reading-part2-live-builder-list">
              {liveTasks.map((task, index) => {
                const selected = selectedTaskIds.includes(task.id);
                return (
                  <button aria-pressed={selected} className={selected ? "is-selected" : ""} key={task.id} onClick={() => toggleTask(task.id)} type="button">
                    <span>{selected ? <Check size={16} /> : index + 1}</span>
                    <div><strong>{task.title}</strong><small>{task.subtitle}</small></div>
                  </button>
                );
              })}
            </div>
            <footer><button disabled={creating} onClick={() => setLiveBuilderOpen(false)} type="button">Cancel</button><button className="is-primary" disabled={!selectedTaskIds.length || creating} onClick={launchLive} type="button"><Play size={17} /> {creating ? "Creating room…" : `Create ${selectedTaskIds.length || ""}-task room`}</button></footer>
          </section>
          <style>{`
            .reading-part2-live-builder-overlay { position:fixed; inset:0; z-index:1300; display:grid; place-items:center; padding:1rem; background:rgba(4,10,24,.76); }
            .reading-part2-live-builder { width:min(720px,100%); max-height:90vh; overflow:auto; padding:1rem; border:1px solid #35558f; border-radius:18px; background:#12213b; color:#edf4ff; box-shadow:0 24px 70px rgba(0,0,0,.38); }
            .reading-part2-live-builder > header { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; }
            .reading-part2-live-builder h2,.reading-part2-live-builder p { margin:0; }
            .reading-part2-live-builder header p { color:#8eb6f5; font-size:.75rem; font-weight:850; text-transform:uppercase; }
            .reading-part2-live-builder header h2 { margin:.15rem 0; }
            .reading-part2-live-builder header span,.reading-part2-live-builder-list small { color:#aebdd4; }
            .reading-part2-live-builder button { border:1px solid #35558f; border-radius:9px; background:#1b2d4d; color:#edf4ff; font:inherit; cursor:pointer; }
            .reading-part2-live-builder > header > button { display:grid; place-items:center; padding:.45rem; }
            .reading-part2-live-builder-tools { display:flex; align-items:center; gap:.5rem; margin:.9rem 0 .65rem; }
            .reading-part2-live-builder-tools strong { margin-right:auto; }
            .reading-part2-live-builder-tools button { padding:.35rem .55rem; }
            .reading-part2-live-builder-list { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.5rem; }
            .reading-part2-live-builder-list > button { display:grid; grid-template-columns:32px 1fr; align-items:center; gap:.55rem; padding:.65rem; text-align:left; }
            .reading-part2-live-builder-list > button > span { display:grid; place-items:center; width:28px; height:28px; border-radius:50%; background:#29446f; font-weight:900; }
            .reading-part2-live-builder-list > button div { display:grid; gap:.1rem; }
            .reading-part2-live-builder-list > button.is-selected { border-color:#2aba7e; background:#123d34; }
            .reading-part2-live-builder-list > button.is-selected > span { background:#21845f; }
            .reading-part2-live-builder footer { display:flex; justify-content:flex-end; gap:.55rem; margin-top:1rem; }
            .reading-part2-live-builder footer button { display:inline-flex; align-items:center; gap:.35rem; padding:.65rem .8rem; font-weight:850; }
            .reading-part2-live-builder footer .is-primary { border-color:#e6ad42; background:#f0b84d; color:#12203a; }
            .reading-part2-live-builder button:disabled { cursor:not-allowed; opacity:.5; }
            @media(max-width:620px){ .reading-part2-live-builder-list { grid-template-columns:1fr; } .reading-part2-live-builder-tools { flex-wrap:wrap; } }
          `}</style>
        </div>
      ) : null}
    </>
  );
}
