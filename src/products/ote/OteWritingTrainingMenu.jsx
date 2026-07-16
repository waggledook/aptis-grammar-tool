import React, { useMemo } from "react";
import { ArrowLeft, CheckCircle2, ClipboardList, FileText, Lightbulb, PenLine, PlayCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { getOteWritingPracticeGroup } from "./mockTests/data/oteWritingPracticeData.js";
import { useOteTrainingProgress, useOteTrainingSummary } from "./utils/trainingProgress.js";
import OteAssignableCard from "./OteAssignableCard.jsx";
import { getOteAssignmentItems } from "./data/oteAssignmentCatalog.js";
import "./styles/ote.css";

const TRAINING_SECTIONS = {
  email: {
    kicker: "Writing Part 1",
    title: "Email Task Training",
    description:
      "Build the skills for OTE email replies: read carefully, answer all three notes, choose the right register, and stay inside the word limit.",
    activities: [
      {
        label: "Activity 1",
        title: "How Email Tasks Work",
        copy: "Understand the email, the notes, the timer, and the word count.",
        icon: ClipboardList,
        route: "guide",
        progressId: "writing.email.guide",
      },
      {
        label: "Activity 2",
        title: "Register Basics",
        copy: "Decide if sentences are formal or informal, then rewrite them in the other style.",
        icon: Lightbulb,
        route: "register-basics",
        progressId: "writing.email.register-basics",
      },
      {
        label: "Activity 3",
        title: "Register Gap Trainer",
        copy: "Complete formal and informal emails with the same meaning.",
        icon: PenLine,
        route: "register-gaps",
        progressId: "writing.email.register-gaps",
      },
      {
        label: "Activity 4",
        title: "Guided Email Builder",
        copy: "Plan the three content points and turn them into a clear exam-ready reply.",
        icon: PenLine,
        progressId: "writing.email.guided-builder",
      },
    ],
    practiceTitle: "Timed Email Sets",
    practiceCopy: "Choose an individual email task, then write one timed Part 1 response in the native OTE layout.",
  },
  essay: {
    kicker: "Writing Part 2",
    title: "Essay Task Training",
    description:
      "Build strong OTE essays: answer the title directly, organize paragraphs, and use linking words naturally.",
    activities: [
      {
        label: "Activity 1",
        title: "How Essays Work",
        copy: "Understand the title and decide your opinion before you write.",
        icon: ClipboardList,
        route: "guide",
        progressId: "writing.essay.guide",
      },
      {
        label: "Activity 2",
        title: "Introductions and Conclusions",
        copy: "Practise opening the essay clearly and finishing with a strong final opinion.",
        icon: PenLine,
        route: "introductions-conclusions",
        progressId: "writing.essay.introductions-conclusions",
      },
      {
        label: "Activity 3",
        title: "Essay Planning",
        copy: "Brainstorm ideas for and against the title, then choose a clear structure.",
        icon: Lightbulb,
        route: "planning",
        progressId: "writing.essay.planning",
      },
      {
        label: "Activity 4",
        title: "Body Paragraphs",
        copy: "Choose strong topic sentences and match linking words to their purpose.",
        icon: PenLine,
        route: "body-paragraphs",
        progressId: "writing.essay.body-paragraphs",
      },
      ["Reference", "Essay Language Bank", "Review useful phrases for opinions, contrast, reasons, and results.", FileText, "", "writing.essay.language-bank"],
    ],
    practiceTitle: "Timed Essay Sets",
    practiceCopy: "Choose an individual essay title, then write one timed Part 2 essay in the native OTE layout.",
  },
  "article-review": {
    kicker: "Writing Part 2",
    title: "Article / Review Training",
    description:
      "Prepare for articles and reviews: make the writing interesting, answer the task fully, and keep the style clear.",
    activities: [
      {
        label: "Activity 1",
        title: "How Articles and Reviews Work",
        copy: "Compare the reader, purpose, titles, recommendations, and useful details.",
        icon: ClipboardList,
        route: "guide",
        progressId: "writing.article-review.guide",
      },
      ["Activity 2", "Article Planning and Structure", "Extract content points, build connected plans, and compare two complete article models.", Lightbulb, "article-structure", "writing.article-review.article-structure"],
      ["Activity 3", "Review Planning and Structure", "Plan two reviews, compare model answers, and learn an adaptable paragraph structure.", Lightbulb, "structure", "writing.article-review.structure"],
      ["Activity 4", "Review Vocabulary", "Build precise vocabulary for films, restaurants, travel, technology, courses and experiences.", Lightbulb, "vocabulary", "writing.article-review.style-upgrade"],
      ["Activity 5", "Guided Article / Review", "Plan a complete answer from a prompt and check that every question is covered.", PenLine, "", "writing.article-review.guided"],
    ],
    practiceTitle: "Timed Article / Review Sets",
    practiceCopy: "Choose an individual article or review prompt, then write one timed Part 2 response in the native OTE layout.",
  },
  "advanced-essay": {
    kicker: "Writing Part 1",
    title: "Advanced Essay Training",
    description:
      "Prepare for the OTE Advanced essay: answer the exact question, develop at least two prompts, and keep a clear academic argument.",
    activities: [
      {
        label: "Guide",
        title: "The Advanced Essay Task",
        copy: "Review timing, word count, marking areas, structure, and complete the final quiz.",
        icon: ClipboardList,
        route: "guide",
        progressId: "writing.advanced-essay.guide",
      },
      {
        label: "Lesson 2",
        title: "Introductions and Conclusions",
        copy: "Diagnose weak openings and endings, build stronger paragraphs, and compare your writing with advanced models.",
        icon: PenLine,
        route: "introductions-conclusions",
        progressId: "writing.advanced-essay.introductions-conclusions",
      },
      {
        label: "Lesson 3",
        title: "Essay Planning",
        copy: "Brainstorm both sides, choose a structure and position, then map at least two prompts across a four-paragraph plan.",
        icon: Lightbulb,
        route: "planning",
        progressId: "writing.advanced-essay.planning",
      },
      {
        label: "Lesson 4",
        title: "Academic Style",
        copy: "Make essay writing clearer, more precise and appropriately measured without making it unnecessarily complicated.",
        icon: PenLine,
        route: "academic-style",
        progressId: "writing.advanced-essay.academic-style",
      },
      {
        label: "Reference",
        title: "Advanced Essay Language Toolkit",
        copy: "Keep a practical bank of natural expressions for framing, developing, qualifying and concluding an argument.",
        icon: FileText,
        route: "language-toolkit",
        progressId: "writing.advanced-essay.language-toolkit",
      },
    ],
    practiceTitle: "Timed Advanced Essay Sets",
    practiceCopy: "Choose an individual advanced essay prompt, then write one timed 220-280 word response.",
  },
  "advanced-summary": {
    kicker: "Writing Part 2",
    title: "Advanced Summary Training",
    description:
      "Prepare for the OTE Advanced summary: combine a textbook extract and lecture transcript into one concise academic paragraph.",
    activities: [
      {
        label: "Guide",
        title: "The Advanced Summary Task",
        copy: "Review synthesis, source selection, word-limit rules, and complete the final quiz.",
        icon: ClipboardList,
        route: "guide",
        progressId: "writing.advanced-summary.guide",
      },
      {
        label: "Lesson 1",
        title: "Finding the Main Ideas",
        copy: "Reveal the information hierarchy, compare two plausible summaries, and identify stronger source synthesis.",
        icon: Lightbulb,
        route: "main-ideas",
        progressId: "writing.advanced-summary.main-ideas",
      },
      {
        label: "Lesson 2",
        title: "Effective Paraphrasing",
        copy: "Identify source-dependent wording, retain necessary terms, and practise natural lexical and grammatical paraphrases.",
        icon: PenLine,
        route: "paraphrasing",
        progressId: "writing.advanced-summary.paraphrasing",
      },
    ],
    practiceTitle: "Timed Advanced Summary Sets",
    practiceCopy: "Choose an integrated summary task, then write one timed 80-100 word response.",
  },
};

export default function OteWritingTrainingMenu({ user, nativeRoutes = false }) {
  const navigate = useNavigate();
  const { section = "email" } = useParams();
  const config = TRAINING_SECTIONS[section] || TRAINING_SECTIONS.email;
  const practiceGroup = getOteWritingPracticeGroup(section);
  const groupIsAdvanced = practiceGroup.id.startsWith("advanced-");
  const userIsAdvanced = user?.oteVersion === "advanced";
  const groupMatchesVariant = !user || groupIsAdvanced === userIsAdvanced;
  const writingPath = getSitePath(nativeRoutes ? "/writing" : "/ote/writing");
  const practiceMenuPath = getSitePath(
    nativeRoutes ? `/writing/training/${practiceGroup.id}/practice` : `/ote/writing/training/${practiceGroup.id}/practice`
  );
  const trainingBasePath = nativeRoutes ? `/writing/training/${practiceGroup.id}` : `/ote/writing/training/${practiceGroup.id}`;
  const completedProgress = useOteTrainingProgress();
  const normalizedActivities = useMemo(
    () =>
      config.activities.map((activity) =>
        Array.isArray(activity)
          ? { label: activity[0], title: activity[1], copy: activity[2], icon: activity[3], route: activity[4] || "", progressId: activity[5] || "" }
          : activity
      ),
    [config.activities]
  );
  const summary = useOteTrainingSummary(normalizedActivities, completedProgress);
  const practiceProgressId = `writing.${practiceGroup.id}.practice`;
  const practiceComplete = completedProgress.has(practiceProgressId);
  const assignmentItems = getOteAssignmentItems({
    variant: groupIsAdvanced ? "advanced" : "general",
    nativeRoutes,
  });
  const assignmentByProgressId = Object.fromEntries(assignmentItems.map((item) => [item.progressId, item]));

  if (!groupMatchesVariant) {
    return (
      <main className="ote-training-page">
        <Seo title="Writing training unavailable | Seif English" description="This writing training section is not available in the selected OTE variant." />

        <button className="ote-training-back" type="button" onClick={() => navigate(writingPath)}>
          <ArrowLeft size={18} aria-hidden="true" />
          Back to writing
        </button>

        <header className="ote-training-hero">
          <p className="ote-kicker">Writing training</p>
          <h1>Training not available</h1>
          <p>
            {groupIsAdvanced
              ? "This advanced writing training is only available in the Advanced OTE workspace."
              : "This general writing training is only available in the General OTE workspace."}
          </p>
        </header>
      </main>
    );
  }

  return (
    <main className="ote-training-page">
      <Seo
        title={`${config.title} | Seif English`}
        description={`OTE ${config.title.toLowerCase()} activities and timed writing practice.`}
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(writingPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to writing
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">{config.kicker}</p>
        <h1>{config.title}</h1>
        <p>{config.description}</p>
        <div className="ote-training-progress-strip" aria-label="Training progress">
          <span>{summary.completed} of {summary.total} training lessons complete</span>
          <div className="ote-training-progress-track" aria-hidden="true">
            <span style={{ width: `${summary.total ? Math.round((summary.completed / summary.total) * 100) : 0}%` }} />
          </div>
        </div>
      </header>

      <div className="ote-training-activity-grid" aria-label={`${config.title} activities`}>
        {normalizedActivities.map((normalized, index) => {
          const Icon = normalized.icon;
          const route = normalized.route || "";
          const isComplete = normalized.progressId && completedProgress.has(normalized.progressId);
          return (
            <OteAssignableCard
              key={normalized.title}
              user={user}
              item={assignmentByProgressId[normalized.progressId]}
              className={`ote-training-activity-card ${isComplete ? "is-complete" : ""}`}
              disabled={!route}
              onClick={route ? () => navigate(getSitePath(`${trainingBasePath}/${route}`)) : undefined}
            >
              {isComplete ? <CheckCircle2 className="ote-training-complete-icon" size={22} aria-label="Completed" /> : null}
              <Icon size={28} aria-hidden="true" />
              <span>{normalized.label || `Activity ${index + 1}`}</span>
              <h2>{normalized.title}</h2>
              <p>{normalized.copy}</p>
            </OteAssignableCard>
          );
        })}
      </div>

      <section className="ote-training-section">
        <h2>Final Practice</h2>
        <p className="ote-section-lead">
          {summary.allComplete
            ? "Training complete. Now choose a timed task and practise under exam conditions."
            : "Complete the training lessons above, then move into timed exam-style practice."}
        </p>
        <OteAssignableCard
          user={user}
          item={assignmentByProgressId[practiceProgressId]}
          className={`ote-practice-set-card ote-writing-practice-entry-card ${practiceComplete ? "is-complete" : ""}`}
          onClick={() => navigate(practiceMenuPath)}
        >
          {practiceComplete ? <CheckCircle2 className="ote-training-complete-icon" size={22} aria-label="Completed" /> : null}
          <PlayCircle size={28} aria-hidden="true" />
          <span>Practice</span>
          <h2>{config.practiceTitle}</h2>
          <p>{config.practiceCopy}</p>
        </OteAssignableCard>
      </section>
    </main>
  );
}
