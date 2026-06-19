import React, { useMemo } from "react";
import { ArrowLeft, CheckCircle2, ClipboardList, Mic, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { useOteTrainingProgress, useOteTrainingSummary } from "./utils/trainingProgress.js";
import "./styles/ote.css";

export default function OteSpeakingPart34Menu({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const speakingPath = getSitePath(nativeRoutes ? "/speaking" : "/ote/speaking");
  const overviewPath = getSitePath(
    nativeRoutes ? "/speaking/parts-3-4/overview" : "/ote/speaking/parts-3-4/overview"
  );
  const practicePath = getSitePath(
    nativeRoutes ? "/speaking/parts-3-4/practice" : "/ote/speaking/parts-3-4/practice"
  );
  const guidedPath = getSitePath(
    nativeRoutes ? "/speaking/parts-3-4/guided-talk" : "/ote/speaking/parts-3-4/guided-talk"
  );
  const completedProgress = useOteTrainingProgress();
  const activities = useMemo(
    () => [
      {
        label: "Activity 1",
        title: "How Parts 3 & 4 Work",
        copy: "Learn the format, compare the long talk with the follow-up questions, then check your understanding.",
        icon: ClipboardList,
        path: overviewPath,
        progressId: "speaking.parts34.overview",
      },
      {
        label: "Activity 2",
        title: "Guided Talk Builder",
        copy: "Plan two photo choices, build transitions, and compare your answer with a model response.",
        icon: Mic,
        path: guidedPath,
        progressId: "speaking.parts34.guided-talk",
      },
    ],
    [guidedPath, overviewPath]
  );
  const summary = useOteTrainingSummary(activities, completedProgress);
  const practiceComplete = completedProgress.has("speaking.parts34.practice");

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Speaking Parts 3 & 4 Training | Seif English"
        description="Training activities for the OTE Speaking Part 3 long talk and Part 4 follow-up questions."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(speakingPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to speaking
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Speaking Parts 3 & 4</p>
        <h1>Long Talk Training</h1>
        <p>
          Build the skills for the final OTE Speaking tasks: understand the format, manage the
          one-minute talk, answer follow-up questions without preparation time, and practise under
          exam-style timing.
        </p>
        <div className="ote-training-progress-strip" aria-label="Training progress">
          <span>{summary.completed} of {summary.total} training lessons complete</span>
          <div className="ote-training-progress-track" aria-hidden="true">
            <span style={{ width: `${summary.total ? Math.round((summary.completed / summary.total) * 100) : 0}%` }} />
          </div>
        </div>
      </header>

      <div className="ote-training-activity-grid" aria-label="Parts 3 and 4 activities">
        {activities.map((activity) => {
          const Icon = activity.icon;
          const isComplete = completedProgress.has(activity.progressId);
          return (
            <button
              key={activity.progressId}
              className={`ote-training-activity-card ${isComplete ? "is-complete" : ""}`}
              type="button"
              onClick={() => navigate(activity.path)}
            >
              {isComplete ? <CheckCircle2 className="ote-training-complete-icon" size={22} aria-label="Completed" /> : null}
              <Icon size={28} aria-hidden="true" />
              <span>{activity.label}</span>
              <h2>{activity.title}</h2>
              <p>{activity.copy}</p>
            </button>
          );
        })}
      </div>

      <section className="ote-training-section">
        <h2>Final Practice</h2>
        <p className="ote-section-lead">
          {summary.allComplete
            ? "Training complete. Now practise timed talks and follow-up questions."
            : "Work through the training activities above, then practise full timed Parts 3 and 4 sets."}
        </p>
        <button
          className={`ote-practice-set-card ote-writing-practice-entry-card ${practiceComplete ? "is-complete" : ""}`}
          type="button"
          onClick={() => navigate(practicePath)}
        >
          {practiceComplete ? <CheckCircle2 className="ote-training-complete-icon" size={22} aria-label="Completed" /> : null}
          <PlayCircle size={28} aria-hidden="true" />
          <span>Practice</span>
          <h2>Timed Talk Sets</h2>
          <p>Practise a picture-based talk, then answer six related follow-up questions with recordings.</p>
        </button>
      </section>
    </main>
  );
}
