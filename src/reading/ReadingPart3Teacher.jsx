import React, { useState } from "react";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createReadingPart3LiveGame } from "../api/liveGames.js";
import { getSitePath } from "../siteConfig.js";
import { toast } from "../utils/toast.js";
import AptisPart3Matching from "./AptisPart3Matching.jsx";
import { READING_PART3_TEACHER_TASKS } from "./readingPart3TeacherTasks.js";

export default function ReadingPart3Teacher({ user }) {
  const navigate = useNavigate();
  const [creatingTaskId, setCreatingTaskId] = useState("");
  const isTeacher = user?.role === "teacher" || user?.role === "admin";

  async function launchLive(task) {
    if (!task || creatingTaskId) return;
    setCreatingTaskId(task.id);
    try {
      const { gameId } = await createReadingPart3LiveGame({
        taskId: task.id,
        title: `Aptis Reading Part 3 · ${task.title}`,
      });
      navigate(getSitePath(`/live/aptis-reading-part3/host/${gameId}`));
    } catch (error) {
      console.error("[ReadingPart3Teacher] live room creation failed", error);
      toast(error.message || "Could not create the live reading room.");
    } finally {
      setCreatingTaskId("");
    }
  }

  return (
    <AptisPart3Matching
      activityId="reading-part-3"
      tasks={READING_PART3_TEACHER_TASKS}
      user={user}
      routeBasePath={getSitePath("/reading/part3-teacher")}
      progressPart="part3-teacher"
      source="AptisPart3Teacher"
      heading="Reading – Part 3 Teacher Tasks"
      intro="Five additional matching-opinions tasks for classroom practice, assignment or a live session."
      headerActions={(task) => isTeacher ? (
        <button className="btn primary" disabled={Boolean(creatingTaskId)} onClick={() => launchLive(task)} type="button">
          <Play aria-hidden="true" size={16} />
          {creatingTaskId === task?.id ? "Creating room…" : "Run live"}
        </button>
      ) : null}
    />
  );
}
