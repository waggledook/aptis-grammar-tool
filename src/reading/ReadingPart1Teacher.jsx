import React, { useState } from "react";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createReadingPart1LiveGame } from "../api/liveGames.js";
import { getSitePath } from "../siteConfig.js";
import { toast } from "../utils/toast.js";
import AptisPart1 from "./AptisPart1.jsx";
import { READING_PART1_TEACHER_TASKS } from "./readingPart1TeacherTasks.js";

export default function ReadingPart1Teacher({ user, onRequireSignIn }) {
  const navigate = useNavigate();
  const [creatingTaskId, setCreatingTaskId] = useState("");
  const isTeacher = user?.role === "teacher" || user?.role === "admin";

  async function launchLive(task) {
    if (!task || creatingTaskId) return;
    setCreatingTaskId(task.id);
    try {
      const { gameId } = await createReadingPart1LiveGame({
        taskId: task.id,
        title: `Aptis Reading Part 1 · ${task.title}`,
      });
      navigate(getSitePath(`/live/aptis-reading-part1/host/${gameId}`));
    } catch (error) {
      console.error("[ReadingPart1Teacher] live room creation failed", error);
      toast(error.message || "Could not create the live reading room.");
    } finally {
      setCreatingTaskId("");
    }
  }

  return (
    <AptisPart1
      tasks={READING_PART1_TEACHER_TASKS}
      user={user}
      onRequireSignIn={onRequireSignIn}
      routeBasePath="/reading/part1-teacher"
      progressPart="part1-teacher"
      heading="Reading – Part 1 Teacher Tasks"
      intro="Five additional email gap-fill tasks for classroom practice, assignment or a live teacher-paced session."
      showDemoNotice={false}
      headerActions={(task) => isTeacher ? (
        <button
          className="btn primary"
          disabled={Boolean(creatingTaskId)}
          onClick={() => launchLive(task)}
          type="button"
        >
          <Play size={16} aria-hidden="true" />
          {creatingTaskId === task?.id ? "Creating room…" : "Run live"}
        </button>
      ) : null}
    />
  );
}
