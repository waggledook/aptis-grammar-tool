import React, { useState } from "react";
import { ArrowLeft, Clipboard, ExternalLink, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  createOteAdvancedReadingPart2LiveGame,
  createOteAdvancedReadingPart2ParagraphLiveGame,
} from "../../api/liveGames.js";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { toast } from "../../utils/toast.js";
import { OTE_ADVANCED_READING_PART2_TEACHER_TASKS } from "./data/oteAdvancedReadingPart2TeacherTasks.js";
import "./styles/ote.css";

export default function OteAdvancedReadingPart2TeacherBank({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [copiedTaskId, setCopiedTaskId] = useState("");
  const [creatingRoomKey, setCreatingRoomKey] = useState("");
  const basePath = nativeRoutes ? "/reading" : "/ote/reading";

  function getTaskPath(taskId) {
    return getSitePath(`${basePath}/advanced/part-2-matching/practice/${taskId}`);
  }

  async function copyStudentLink(task) {
    const shareUrl = new URL(getTaskPath(task.id), window.location.origin).toString();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedTaskId(task.id);
      window.setTimeout(() => {
        setCopiedTaskId((current) => current === task.id ? "" : current);
      }, 1800);
    } catch (error) {
      console.warn("[OTE Reading Part 2 teacher bank] Could not copy student link", error);
      window.prompt("Copy this student link:", shareUrl);
    }
  }

  async function launchLive(task, mode) {
    if (creatingRoomKey) return;
    const roomKey = `${mode}:${task.id}`;
    setCreatingRoomKey(roomKey);
    try {
      const createRoom = mode === "paragraph"
        ? createOteAdvancedReadingPart2ParagraphLiveGame
        : createOteAdvancedReadingPart2LiveGame;
      const { gameId } = await createRoom({
        taskId: task.id,
        title: mode === "paragraph"
          ? `OTE Advanced Reading Part 2 paragraph lesson · ${task.title}`
          : `OTE Advanced Reading Part 2 · ${task.title}`,
      });
      const route = mode === "paragraph"
        ? `/live/ote-reading-part2-paragraph/host/${gameId}`
        : `/live/ote-reading-part2/host/${gameId}`;
      navigate(getSitePath(route));
    } catch (error) {
      console.error("[OTE Reading Part 2 teacher bank] Live room creation failed", error);
      toast(error.message || "Could not create the live reading room.");
      setCreatingRoomKey("");
    }
  }

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Advanced Reading Part 2 Teacher Tasks | Seif English"
        description="Standalone and live OTE Advanced Reading Part 2 classroom tasks."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(getSitePath("/teacher-resources"))}>
        <ArrowLeft size={18} aria-hidden="true" /> Back to teacher resources
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Teacher task bank · Advanced Reading Part 2</p>
        <h1>Multiple Matching Classroom Tasks</h1>
        <p>
          Open either C1 task for standalone practice, copy the student link, or choose between a whole-task live room and a scaffolded paragraph lesson.
        </p>
      </header>

      <div className="ote-practice-set-grid">
        {OTE_ADVANCED_READING_PART2_TEACHER_TASKS.map((task, index) => (
          <article className="ote-practice-set-card ote-teacher-bank-card" key={task.id}>
            <span>Task {index + 1} · C1</span>
            <h2>{task.title}</h2>
            <strong className="ote-practice-set-theme">{task.intro}</strong>
            <p>Three substantial source texts and seven multiple-matching questions, with full answer explanations and highlighted evidence.</p>
            <div className="ote-teacher-bank-card-actions">
              <button type="button" onClick={() => navigate(getTaskPath(task.id))}>
                <ExternalLink size={16} aria-hidden="true" /> Open standalone task
              </button>
              <button type="button" onClick={() => copyStudentLink(task)}>
                <Clipboard size={16} aria-hidden="true" />
                {copiedTaskId === task.id ? "Link copied" : "Copy student link"}
              </button>
              <button type="button" disabled={Boolean(creatingRoomKey)} onClick={() => launchLive(task, "whole")}>
                <Radio size={16} aria-hidden="true" />
                {creatingRoomKey === `whole:${task.id}` ? "Creating room…" : "Run whole task live"}
              </button>
              <button type="button" disabled={Boolean(creatingRoomKey)} onClick={() => launchLive(task, "paragraph")}>
                <Radio size={16} aria-hidden="true" />
                {creatingRoomKey === `paragraph:${task.id}` ? "Creating room…" : "Run paragraph lesson"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
