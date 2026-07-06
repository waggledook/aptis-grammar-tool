import React, { useMemo } from "react";
import { ArrowLeft, CheckCircle2, ClipboardList, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { useOteTrainingProgress, useOteTrainingSummary } from "./utils/trainingProgress.js";
import OteAssignableCard from "./OteAssignableCard.jsx";
import { getOteAssignmentItems } from "./data/oteAssignmentCatalog.js";
import "./styles/ote.css";

export default function OteSpeakingPart45DebateMenu({ user, nativeRoutes = false }) {
  const navigate = useNavigate();
  const speakingPath = getSitePath(nativeRoutes ? "/speaking" : "/ote/speaking");
  const overviewPath = getSitePath(
    nativeRoutes ? "/speaking/parts-4-5-debate/overview" : "/ote/speaking/parts-4-5-debate/overview"
  );
  const practicePath = getSitePath(
    nativeRoutes ? "/speaking/parts-4-5-debate/practice" : "/ote/speaking/parts-4-5-debate/practice"
  );
  const completedProgress = useOteTrainingProgress();
  const activities = useMemo(
    () => [
      {
        label: "Activity 1",
        title: "Advanced Debate Strategy",
        copy: "Learn how to choose a position, use the debate prompts, build a two-minute argument, and handle Part 5 follow-ups.",
        icon: ClipboardList,
        path: overviewPath,
        progressId: "speaking.parts45.advanced-debate-overview",
      },
    ],
    [overviewPath]
  );
  const summary = useOteTrainingSummary(activities, completedProgress);
  const practiceComplete = completedProgress.has("speaking.parts45.practice");
  const assignmentItems = getOteAssignmentItems({ variant: "advanced", nativeRoutes });
  const assignmentByProgressId = Object.fromEntries(assignmentItems.map((item) => [item.progressId, item]));

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Advanced Speaking Parts 4 and 5 Training | Seif English"
        description="Training activities for OTE Advanced debate and follow-up question practice."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(speakingPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to speaking
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Speaking Parts 4 & 5</p>
        <h1>Debate Training</h1>
        <p>
          Build the skills for Advanced debate and follow-up tasks: choose a clear side, develop two
          or three prompts, use the mind map effectively, and answer wider topic questions without
          preparation time.
        </p>
        <div className="ote-training-progress-strip" aria-label="Training progress">
          <span>{summary.completed} of {summary.total} training lessons complete</span>
          <div className="ote-training-progress-track" aria-hidden="true">
            <span style={{ width: `${summary.total ? Math.round((summary.completed / summary.total) * 100) : 0}%` }} />
          </div>
        </div>
      </header>

      <div className="ote-training-activity-grid" aria-label="Parts 4 and 5 debate activities">
        {activities.map((activity) => {
          const Icon = activity.icon;
          const isComplete = completedProgress.has(activity.progressId);
          return (
            <OteAssignableCard
              key={activity.progressId}
              user={user}
              item={assignmentByProgressId[activity.progressId]}
              className={`ote-training-activity-card ${isComplete ? "is-complete" : ""}`}
              onClick={() => navigate(activity.path)}
            >
              {isComplete ? <CheckCircle2 className="ote-training-complete-icon" size={22} aria-label="Completed" /> : null}
              <Icon size={28} aria-hidden="true" />
              <span>{activity.label}</span>
              <h2>{activity.title}</h2>
              <p>{activity.copy}</p>
            </OteAssignableCard>
          );
        })}
      </div>

      <section className="ote-training-section">
        <h2>Final Practice</h2>
        <p className="ote-section-lead">
          {summary.allComplete
            ? "Guide complete. Now practise full debate and follow-up sets, or jump straight to Part 5 questions."
            : "Work through the debate strategy guide, then practise timed Parts 4 and 5 sets."}
        </p>
        <OteAssignableCard
          user={user}
          item={assignmentByProgressId["speaking.parts45.practice"]}
          className={`ote-practice-set-card ote-writing-practice-entry-card ${practiceComplete ? "is-complete" : ""}`}
          onClick={() => navigate(practicePath)}
        >
          {practiceComplete ? <CheckCircle2 className="ote-training-complete-icon" size={22} aria-label="Completed" /> : null}
          <PlayCircle size={28} aria-hidden="true" />
          <span>Practice</span>
          <h2>Timed Debate Sets</h2>
          <p>Practise a two-minute debate, then answer four related follow-up questions with recordings.</p>
        </OteAssignableCard>
      </section>
    </main>
  );
}
