import React, { useState } from "react";
import { ArrowLeft, Clipboard, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import OteAssignButton from "./OteAssignButton.jsx";
import { OTE_ADVANCED_WRITING_SUMMARY_TEACHER_TASKS } from "./data/oteAdvancedWritingSummaryTasks.js";
import "./styles/ote.css";

export default function OteWritingAdvancedSummaryTeacherBank({ user, nativeRoutes = false }) {
  const navigate = useNavigate();
  const [copiedTaskId, setCopiedTaskId] = useState("");
  const rawBasePath = nativeRoutes
    ? "/writing/advanced-summary/teacher-bank"
    : "/ote/writing/advanced-summary/teacher-bank";
  const getTaskPath = (taskId) => getSitePath(`${rawBasePath}/${taskId}`);

  function buildAssignmentItem(task) {
    return {
      id: `ote.advanced.writing.summary.teacher-bank.${task.id}`,
      variant: "advanced",
      category: "Writing",
      label: `Part 2 Summary: ${task.title}`,
      routePath: getTaskPath(task.id),
      progressId: `writing.advanced-summary.teacher-bank.${task.id}`,
      parentProgressId: "",
    };
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
      console.warn("[OTE writing summary teacher bank] Could not copy student link", error);
      window.prompt("Copy this student link:", shareUrl);
    }
  }

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Advanced Writing Summary Teacher Bank | Seif English"
        description="Assignable OTE Advanced Writing Part 2 summary tasks for classroom use."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(getSitePath("/teacher-resources"))}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to teacher resources
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Teacher task bank</p>
        <h1>Advanced Writing Summary Tasks</h1>
        <p>
          Open a classroom task, copy its student link, or assign it. These extra Part 2 tasks stay outside the main learner practice bank.
        </p>
      </header>

      <div className="ote-practice-set-grid">
        {OTE_ADVANCED_WRITING_SUMMARY_TEACHER_TASKS.map((task, index) => (
          <article className="ote-practice-set-card ote-teacher-bank-card" key={task.id}>
            <span>Task {index + 1}</span>
            <h2>{task.title}</h2>
            <strong className="ote-practice-set-theme">{task.theme}</strong>
            <p>{task.description}</p>
            <div className="ote-teacher-bank-card-actions">
              <button type="button" onClick={() => navigate(getTaskPath(task.id))}>
                <ExternalLink size={16} aria-hidden="true" /> Open task
              </button>
              <button type="button" onClick={() => copyStudentLink(task)}>
                <Clipboard size={16} aria-hidden="true" />
                {copiedTaskId === task.id ? "Link copied" : "Copy student link"}
              </button>
              <OteAssignButton user={user} item={buildAssignmentItem(task)} />
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
