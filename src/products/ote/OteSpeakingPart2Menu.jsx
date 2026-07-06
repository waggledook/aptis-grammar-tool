import React, { useMemo } from "react";
import { ArrowLeft, CheckCircle2, ClipboardList, FileText, MessageSquareText, Mic, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { useOteTrainingProgress, useOteTrainingSummary } from "./utils/trainingProgress.js";
import OteAssignableCard from "./OteAssignableCard.jsx";
import { getOteAssignmentItems } from "./data/oteAssignmentCatalog.js";
import "./styles/ote.css";

export default function OteSpeakingPart2Menu({ user, nativeRoutes = false }) {
  const navigate = useNavigate();
  const isAdvanced = user?.oteVersion === "advanced";
  const speakingPath = getSitePath(nativeRoutes ? "/speaking" : "/ote/speaking");
  const introPath = getSitePath(
    nativeRoutes ? "/speaking/part-2-voicemails/overview" : "/ote/speaking/part-2-voicemails/overview"
  );
  const guidedPath = getSitePath(
    nativeRoutes ? "/speaking/part-2-voicemails/guided-message-1" : "/ote/speaking/part-2-voicemails/guided-message-1"
  );
  const guidedMessage2Path = getSitePath(
    nativeRoutes ? "/speaking/part-2-voicemails/guided-message-2" : "/ote/speaking/part-2-voicemails/guided-message-2"
  );
  const cheatSheetPath = getSitePath(
    nativeRoutes ? "/speaking/part-2-voicemails/cheat-sheet" : "/ote/speaking/part-2-voicemails/cheat-sheet"
  );
  const practicePath = getSitePath(
    nativeRoutes ? "/speaking/part-2-voicemails/practice" : "/ote/speaking/part-2-voicemails/practice"
  );
  const completedProgress = useOteTrainingProgress();
  const activities = useMemo(
    () =>
      isAdvanced
        ? [
            {
              label: "Activity 1",
              title: "Advanced Voice Message Strategy",
              copy: "Learn the one-message format, 10-second planning window, diplomatic language, and a simple response plan.",
              icon: ClipboardList,
              path: introPath,
              progressId: "speaking.part2.advanced-overview",
            },
            {
              label: "Reference",
              title: "Diplomatic Voice Message Cheat Sheet",
              copy: "Review Advanced diplomatic phrases, planning questions, model answers, and final reminders.",
              icon: FileText,
              path: cheatSheetPath,
              progressId: "speaking.part2.advanced-cheat-sheet",
            },
          ]
        : [
            {
              label: "Activity 1",
              title: "How Voicemails Work",
              copy: "Learn the format, compare Message 1 and Message 2, then check your understanding.",
              icon: ClipboardList,
              path: introPath,
              progressId: "speaking.part2.overview",
            },
            {
              label: "Activity 2",
              title: "Guided Task: Message 1",
              copy: "Review student answers, record your own polite voicemail, and compare with a model.",
              icon: Mic,
              path: guidedPath,
              progressId: "speaking.part2.guided-message-1",
            },
            {
              label: "Activity 3",
              title: "Guided Task: Message 2",
              copy: "Reply to a friend's voice message with the right informal tone and clear structure.",
              icon: MessageSquareText,
              path: guidedMessage2Path,
              progressId: "speaking.part2.guided-message-2",
            },
            {
              label: "Reference",
              title: "Part 2 Cheat Sheet",
              copy: "Review useful frameworks and download a branded PDF reference for practice.",
              icon: FileText,
              path: cheatSheetPath,
              progressId: "speaking.part2.cheat-sheet",
            },
          ],
    [cheatSheetPath, guidedMessage2Path, guidedPath, introPath, isAdvanced]
  );
  const summary = useOteTrainingSummary(activities, completedProgress);
  const practiceComplete = completedProgress.has("speaking.part2.practice");
  const assignmentItems = getOteAssignmentItems({
    variant: isAdvanced ? "advanced" : "general",
    nativeRoutes,
  });
  const assignmentByProgressId = Object.fromEntries(assignmentItems.map((item) => [item.progressId, item]));
  const practiceAssignment = assignmentByProgressId["speaking.part2.practice"];

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Speaking Part 2 Voicemail Training | Seif English"
        description="Training activities for OTE Speaking Part 2 spoken voicemail messages."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(speakingPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to speaking
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Speaking Part 2</p>
        <h1>Voicemail Training</h1>
        <p>
          {isAdvanced
            ? "Practise Advanced diplomatic voice messages: read and listen to the task, think briefly, then record a tactful 40-second response."
            : "Build the skills for formal and friendly OTE voice messages: understand the format, spot common mistakes, practise under timed conditions, and compare your answer with a model."}
        </p>
        <div className="ote-training-progress-strip" aria-label="Training progress">
          <span>{summary.completed} of {summary.total} training lessons complete</span>
          <div className="ote-training-progress-track" aria-hidden="true">
            <span style={{ width: `${summary.total ? Math.round((summary.completed / summary.total) * 100) : 0}%` }} />
          </div>
        </div>
      </header>

      <div className="ote-training-activity-grid" aria-label="Part 2 voicemail activities">
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
              ? "Guide complete. Now choose a timed diplomatic voicemail task and practise under Advanced exam conditions."
              : "Review the Advanced voice-message strategy, then move into timed diplomatic practice."
            : summary.allComplete
            ? "Training complete. Now practise complete voicemail sets with exam-style timing."
            : "Work through the training cards above, then practise full timed voicemail sets."}
        </p>
        <OteAssignableCard
          user={user}
          item={practiceAssignment}
          className={`ote-practice-set-card ote-writing-practice-entry-card ${practiceComplete ? "is-complete" : ""}`}
          onClick={() => navigate(practicePath)}
        >
          {practiceComplete ? <CheckCircle2 className="ote-training-complete-icon" size={22} aria-label="Completed" /> : null}
          <PlayCircle size={28} aria-hidden="true" />
          <span>Practice</span>
          <h2>{isAdvanced ? "Timed Diplomatic Voicemail Sets" : "Timed Voicemail Sets"}</h2>
          <p>
            {isAdvanced
              ? "Practise one diplomatic voice message at a time with some time to think and 40 seconds to speak."
              : "Practise both voicemail types with exam-style timing and downloadable recordings."}
          </p>
        </OteAssignableCard>
      </section>
    </main>
  );
}
