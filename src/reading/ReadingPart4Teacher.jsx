import React, { useState } from "react";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createReadingPart4LiveGame } from "../api/liveGames.js";
import { getSitePath } from "../siteConfig.js";
import { toast } from "../utils/toast.js";
import AptisPart4 from "./AptisPart4.jsx";
import { READING_PART4_TEACHER_TASKS } from "./readingPart4TaskBanks.js";

export default function ReadingPart4Teacher({ user }) {
  const navigate = useNavigate();
  const [creatingTaskId, setCreatingTaskId] = useState("");
  const isTeacher = user?.role === "teacher" || user?.role === "admin";

  async function launchLive(task) {
    if (!task || creatingTaskId) return;
    setCreatingTaskId(task.id);
    try {
      const { gameId } = await createReadingPart4LiveGame({
        taskId: task.id,
        title: `Aptis Reading Part 4 · ${task.title}`,
      });
      navigate(getSitePath(`/live/aptis-reading-part4/host/${gameId}`));
    } catch (error) {
      console.error("[ReadingPart4Teacher] live room creation failed", error);
      toast(error.message || "Could not create the live reading room.");
    } finally {
      setCreatingTaskId("");
    }
  }

  return (
    <AptisPart4
      activityId="reading-part-4"
      tasks={READING_PART4_TEACHER_TASKS}
      user={user}
      routeBasePath={getSitePath("/reading/part4-teacher")}
      progressPart="part4-teacher"
      source="AptisPart4Teacher"
      heading="Reading – Part 4 Teacher Tasks"
      showDemoNotice={false}
      headerActions={(task) => isTeacher ? (
        <button className="btn primary" disabled={Boolean(creatingTaskId)} onClick={() => launchLive(task)} type="button">
          <Play aria-hidden="true" size={16} />
          {creatingTaskId === task?.id ? "Creating room…" : "Run live"}
        </button>
      ) : null}
    />
  );
}
