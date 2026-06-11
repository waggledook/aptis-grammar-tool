import React from "react";
import { ArrowLeft, ClipboardList, FileText, Lightbulb, PenLine, PlayCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { getOteWritingPracticeGroup } from "./mockTests/data/oteWritingPracticeData.js";
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
      },
      {
        label: "Activity 2",
        title: "Register Basics",
        copy: "Decide if sentences are formal or informal, then rewrite them in the other style.",
        icon: Lightbulb,
        route: "register-basics",
      },
      {
        label: "Activity 3",
        title: "Register Gap Trainer",
        copy: "Complete formal and informal emails with the same meaning.",
        icon: PenLine,
        route: "register-gaps",
      },
      {
        label: "Activity 4",
        title: "Guided Email Builder",
        copy: "Plan the three content points and turn them into a clear exam-ready reply.",
        icon: PenLine,
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
      },
      {
        label: "Activity 2",
        title: "Introductions and Conclusions",
        copy: "Practise opening the essay clearly and finishing with a strong final opinion.",
        icon: PenLine,
        route: "introductions-conclusions",
      },
      {
        label: "Activity 3",
        title: "Essay Planning",
        copy: "Brainstorm ideas for and against the title, then choose a clear structure.",
        icon: Lightbulb,
        route: "planning",
      },
      {
        label: "Activity 4",
        title: "Body Paragraphs",
        copy: "Choose strong topic sentences and match linking words to their purpose.",
        icon: PenLine,
        route: "body-paragraphs",
      },
      ["Reference", "Essay Language Bank", "Review useful phrases for opinions, contrast, reasons, and results.", FileText],
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
      },
      ["Activity 2", "Style Upgrade", "Practise openings, reader-friendly details, opinions, and stronger endings.", Lightbulb],
      ["Activity 3", "Guided Article / Review", "Plan a complete answer from a prompt and check that every question is covered.", PenLine],
    ],
    practiceTitle: "Timed Article / Review Sets",
    practiceCopy: "Choose an individual article or review prompt, then write one timed Part 2 response in the native OTE layout.",
  },
};

export default function OteWritingTrainingMenu({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const { section = "email" } = useParams();
  const config = TRAINING_SECTIONS[section] || TRAINING_SECTIONS.email;
  const practiceGroup = getOteWritingPracticeGroup(section);
  const writingPath = getSitePath(nativeRoutes ? "/writing" : "/ote/writing");
  const practiceMenuPath = getSitePath(
    nativeRoutes ? `/writing/training/${practiceGroup.id}/practice` : `/ote/writing/training/${practiceGroup.id}/practice`
  );
  const trainingBasePath = nativeRoutes ? `/writing/training/${practiceGroup.id}` : `/ote/writing/training/${practiceGroup.id}`;

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
      </header>

      <div className="ote-training-activity-grid" aria-label={`${config.title} activities`}>
        {config.activities.map((activity) => {
          const normalized = Array.isArray(activity)
            ? { label: activity[0], title: activity[1], copy: activity[2], icon: activity[3] }
            : activity;
          const Icon = normalized.icon;
          const route = normalized.route || "";
          return (
            <button
              key={normalized.title}
              className="ote-training-activity-card"
              type="button"
              disabled={!route}
              onClick={route ? () => navigate(getSitePath(`${trainingBasePath}/${route}`)) : undefined}
            >
              <Icon size={28} aria-hidden="true" />
              <span>{normalized.label}</span>
              <h2>{normalized.title}</h2>
              <p>{normalized.copy}</p>
            </button>
          );
        })}
      </div>

      <section className="ote-training-section">
        <h2>Final Practice</h2>
        <p className="ote-section-lead">
          Timed placeholder tasks are ready now, so new materials can drop into this task-type menu later.
        </p>
        <button className="ote-practice-set-card ote-writing-practice-entry-card" type="button" onClick={() => navigate(practiceMenuPath)}>
          <PlayCircle size={28} aria-hidden="true" />
          <span>Practice</span>
          <h2>{config.practiceTitle}</h2>
          <p>{config.practiceCopy}</p>
        </button>
      </section>
    </main>
  );
}
