import React, { useMemo } from "react";
import { ArrowLeft, CheckCircle2, ClipboardList, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { useOteTrainingProgress, useOteTrainingSummary } from "./utils/trainingProgress.js";
import "./styles/ote.css";

export default function OteSpeakingPart1Menu({ user, nativeRoutes = false }) {
  const navigate = useNavigate();
  const isAdvanced = user?.oteVersion === "advanced";
  const speakingPath = getSitePath(nativeRoutes ? "/speaking" : "/ote/speaking");
  const overviewPath = getSitePath(
    nativeRoutes ? "/speaking/part-1-interview/overview" : "/ote/speaking/part-1-interview/overview"
  );
  const practicePath = getSitePath(
    nativeRoutes ? "/speaking/part-1-interview/practice" : "/ote/speaking/part-1-interview/practice"
  );
  const completedProgress = useOteTrainingProgress();
  const activities = useMemo(
    () => isAdvanced ? [] : [
      {
        label: "Activity 1",
        title: "How Part 1 Works",
        copy: "Learn the format, timing, question order, and scoring rules, then check your understanding.",
        icon: ClipboardList,
        path: overviewPath,
        progressId: "speaking.part1.overview",
      },
    ],
    [isAdvanced, overviewPath]
  );
  const summary = useOteTrainingSummary(activities, completedProgress);
  const practiceComplete = completedProgress.has("speaking.part1.practice");

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Speaking Part 1 Interview Training | Seif English"
        description="Training activities for OTE Speaking Part 1 short interview questions."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(speakingPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to speaking
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Speaking Part 1</p>
        <h1>Interview Training</h1>
        <p>
          {isAdvanced
            ? "Build confidence for the Advanced opening interview: recycle the two warm-up questions, then practise four longer timed responses."
            : "Build confidence for the opening interview: understand the question order, practise the fast timing, and record short answers across everyday topics."}
        </p>
        {!isAdvanced ? (
          <div className="ote-training-progress-strip" aria-label="Training progress">
            <span>{summary.completed} of {summary.total} training lessons complete</span>
            <div className="ote-training-progress-track" aria-hidden="true">
              <span style={{ width: `${summary.total ? Math.round((summary.completed / summary.total) * 100) : 0}%` }} />
            </div>
          </div>
        ) : null}
      </header>

      {!isAdvanced ? (
        <div className="ote-training-activity-grid" aria-label="Part 1 interview activities">
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
      ) : null}

      <section className="ote-training-section">
        <h2>Final Practice</h2>
        <p className="ote-section-lead">
          {isAdvanced
            ? "Choose a timed Advanced interview set and practise the four longer Part 1 responses."
            : summary.allComplete
            ? "Training complete. Now practise timed interview sets."
            : "Review the Part 1 format, then move into timed interview practice."}
        </p>
        <button
          className={`ote-practice-set-card ote-writing-practice-entry-card ${practiceComplete ? "is-complete" : ""}`}
          type="button"
          onClick={() => navigate(practicePath)}
        >
          {practiceComplete ? <CheckCircle2 className="ote-training-complete-icon" size={22} aria-label="Completed" /> : null}
          <PlayCircle size={28} aria-hidden="true" />
          <span>Practice</span>
          <h2>Timed Interview Sets</h2>
          <p>
            {isAdvanced
              ? "Practise two fixed warm-up questions and four Advanced interview questions with recordings."
              : "Practise two fixed warm-up questions and six topic questions with recordings."}
          </p>
        </button>
      </section>
    </main>
  );
}
