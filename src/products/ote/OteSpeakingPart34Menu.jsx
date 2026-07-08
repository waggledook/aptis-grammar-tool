import React, { useMemo } from "react";
import { ArrowLeft, CheckCircle2, ClipboardList, MessageCircleQuestion, Mic, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { useOteTrainingProgress, useOteTrainingSummary } from "./utils/trainingProgress.js";
import OteAssignableCard from "./OteAssignableCard.jsx";
import { getOteAssignmentItems } from "./data/oteAssignmentCatalog.js";
import "./styles/ote.css";

export default function OteSpeakingPart34Menu({ user, nativeRoutes = false }) {
  const navigate = useNavigate();
  const isAdvanced = user?.oteVersion === "advanced";
  const speakingPath = getSitePath(nativeRoutes ? "/speaking" : "/ote/speaking");
  const overviewPath = getSitePath(
    nativeRoutes ? "/speaking/parts-3-4/overview" : "/ote/speaking/parts-3-4/overview"
  );
  const talkPracticePath = getSitePath(
    nativeRoutes ? "/speaking/parts-3-4/practice" : "/ote/speaking/parts-3-4/practice"
  );
  const summaryPracticePath = getSitePath(
    nativeRoutes ? "/speaking/part-3-summary/practice" : "/ote/speaking/part-3-summary/practice"
  );
  const practicePath = isAdvanced ? summaryPracticePath : talkPracticePath;
  const guidedPath = getSitePath(
    nativeRoutes ? "/speaking/parts-3-4/guided-talk" : "/ote/speaking/parts-3-4/guided-talk"
  );
  const followUpGuidedPath = getSitePath(
    nativeRoutes ? "/speaking/parts-3-4/follow-up-guided-task" : "/ote/speaking/parts-3-4/follow-up-guided-task"
  );
  const completedProgress = useOteTrainingProgress();
  const activities = useMemo(
    () =>
      isAdvanced
        ? [
            {
              label: "Activity 1",
              title: "Advanced Summary Strategy",
              copy: "Learn how to combine two expert talks, organize notes by main point, and give a 50-second summary.",
              icon: ClipboardList,
              path: overviewPath,
              progressId: "speaking.part3.advanced-summary-overview",
            },
          ]
        : [
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
            {
              label: "Activity 3",
              title: "Guided Task: Follow-up Question Sprint",
              copy: "Recognize Part 4 question types, improve weak answers, and record six short follow-up responses.",
              icon: MessageCircleQuestion,
              path: followUpGuidedPath,
              progressId: "speaking.parts34.followup-guided",
            },
          ],
    [followUpGuidedPath, guidedPath, isAdvanced, overviewPath]
  );
  const summary = useOteTrainingSummary(activities, completedProgress);
  const practiceTotal = isAdvanced ? 2 : 5;
  const practiceChildCount = Array.from(completedProgress).filter((progressId) =>
    /^speaking\.parts34\.practice\.[\w-]+$/.test(progressId)
  ).length;
  const practiceCompleted = Math.min(practiceTotal, Math.max(
    practiceChildCount,
    completedProgress.has("speaking.parts34.practice") ? 1 : 0
  ));
  const practiceComplete = practiceCompleted >= practiceTotal;
  const assignmentItems = getOteAssignmentItems({
    variant: isAdvanced ? "advanced" : "general",
    nativeRoutes,
  });
  const assignmentByProgressId = Object.fromEntries(assignmentItems.map((item) => [item.progressId, item]));
  const practiceAssignment = assignmentByProgressId["speaking.parts34.practice"];

  return (
    <main className="ote-training-page">
      <Seo
        title={isAdvanced ? "OTE Advanced Speaking Part 3 Summary Training | Seif English" : "OTE Speaking Parts 3 & 4 Training | Seif English"}
        description={
          isAdvanced
            ? "Training activities for the OTE Advanced Speaking Part 3 summary task."
            : "Training activities for the OTE Speaking Part 3 long talk and Part 4 follow-up questions."
        }
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(speakingPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to speaking
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">{isAdvanced ? "Speaking Part 3" : "Speaking Parts 3 & 4"}</p>
        <h1>{isAdvanced ? "Summary Training" : "Long Talk Training"}</h1>
        <p>
          {isAdvanced
            ? "Build the skills for Advanced summary tasks: listen to two experts, identify their shared main points, organize notes, and record a clear combined response."
            : "Build the skills for the final OTE Speaking tasks: understand the format, manage the one-minute talk, answer follow-up questions without preparation time, and practise under exam-style timing."}
        </p>
        <div className="ote-training-progress-strip" aria-label="Training progress">
          <span>{summary.completed} of {summary.total} training lessons complete</span>
          <div className="ote-training-progress-track" aria-hidden="true">
            <span style={{ width: `${summary.total ? Math.round((summary.completed / summary.total) * 100) : 0}%` }} />
          </div>
        </div>
      </header>

      <div className="ote-training-activity-grid" aria-label={isAdvanced ? "Part 3 summary activities" : "Parts 3 and 4 activities"}>
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
          {isAdvanced
            ? summary.allComplete
              ? "Guide complete. Now practise timed integrated summary sets with notes, preparation time, and recording."
              : "Work through the summary strategy guide, then practise full timed Part 3 summary sets."
            : summary.allComplete
            ? "Training complete. Now practise timed talks and follow-up questions."
            : "Work through the training activities above, then practise full timed Parts 3 and 4 sets."}
        </p>
        <OteAssignableCard
          user={user}
          item={practiceAssignment}
          className={`ote-practice-set-card ote-writing-practice-entry-card ${practiceComplete ? "is-complete" : ""}`}
          onClick={() => navigate(practicePath)}
        >
          <span className={`ote-training-count-badge ${practiceComplete ? "is-complete" : ""}`}>
            {practiceCompleted}/{practiceTotal}
          </span>
          <PlayCircle size={28} aria-hidden="true" />
          <span>Practice</span>
          <h2>{isAdvanced ? "Timed Summary Sets" : "Timed Talk Sets"}</h2>
          <p>
            {isAdvanced
              ? "Practise listening to two experts, preparing from notes, and recording one combined summary."
              : "Practise a picture-based talk, then answer six related follow-up questions with recordings."}
          </p>
        </OteAssignableCard>
      </section>
    </main>
  );
}
