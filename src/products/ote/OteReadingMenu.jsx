import React from "react";
import { ArrowLeft, BookOpen, CheckCircle2, Clock3, FileText, ListChecks, Search, TextCursorInput } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { useOteTrainingProgress } from "./utils/trainingProgress.js";
import "./styles/ote.css";

const READING_VARIANTS = {
  general: {
    label: "General",
    title: "OTE General Reading",
    subtitle: "A2-B2 reading practice structure for the four-part Oxford Test of English module.",
    seoTitle: "OTE General Reading | Seif English",
    seoDescription: "Oxford Test of English General reading sections and part menus.",
    parts: [
      {
        id: "part-1-short-texts",
        label: "Part 1",
        title: "Short Texts",
        copy: "Six short texts with one three-option multiple-choice question each.",
        icon: FileText,
      },
      {
        id: "part-2-matching",
        label: "Part 2",
        title: "Multiple Matching",
        copy: "Match profiles, requirements, or factual texts by scanning for detail, opinion, and attitude.",
        icon: Search,
      },
      {
        id: "part-3-gapped-text",
        label: "Part 3",
        title: "Gapped Text",
        copy: "Insert six missing sentences into a longer newspaper or magazine-style text.",
        icon: TextCursorInput,
      },
      {
        id: "part-4-long-text",
        label: "Part 4",
        title: "Long Text",
        copy: "Answer four multiple-choice questions on a longer text.",
        icon: BookOpen,
      },
    ],
  },
  advanced: {
    label: "Advanced",
    title: "OTE Advanced Reading",
    subtitle: "B2-C1 reading practice structure for the advanced four-part reading module.",
    seoTitle: "OTE Advanced Reading | Seif English",
    seoDescription: "Oxford Test of English Advanced reading sections and part menus.",
    parts: [
      {
        id: "part-1-short-texts",
        label: "Part 1",
        title: "Short Texts",
        copy: "Six short texts, each with one multiple-choice question focused on local and global meaning.",
        icon: FileText,
      },
      {
        id: "part-2-matching",
        label: "Part 2",
        title: "Matching",
        copy: "Match six or seven items with texts, using fast search reading for detail, opinion, and implication.",
        icon: Search,
      },
      {
        id: "part-3-gapped-text",
        label: "Part 3",
        title: "Gapped Text",
        copy: "Place six extracted sentences into a text, with one extra distractor sentence.",
        icon: TextCursorInput,
      },
      {
        id: "part-4-long-text",
        label: "Part 4",
        title: "Long Text",
        copy: "Answer four or five multiple-choice questions on a longer text.",
        icon: BookOpen,
      },
    ],
  },
};

function getReadingBasePath(nativeRoutes) {
  return nativeRoutes ? "/reading" : "/ote/reading";
}

function getUserReadingVariant(user) {
  return user?.oteVersion === "advanced" ? "advanced" : "general";
}

function OteReadingPartShell({ user, nativeRoutes = false }) {
  const navigate = useNavigate();
  const { variant = "general", partId = "" } = useParams();
  const activeVariant = getUserReadingVariant(user);
  const activeConfig = READING_VARIANTS[activeVariant];
  const basePath = getReadingBasePath(nativeRoutes);
  const requestedPartIsValid = activeConfig.parts.some((item) => item.id === partId);
  const completedProgress = useOteTrainingProgress();

  if (variant !== activeVariant || !requestedPartIsValid) {
    const fallbackPartId = requestedPartIsValid ? partId : activeConfig.parts[0].id;
    return <Navigate to={getSitePath(`${basePath}/${activeVariant}/${fallbackPartId}`)} replace />;
  }

  const config = READING_VARIANTS[variant] || READING_VARIANTS.general;
  const part = config.parts.find((item) => item.id === partId) || config.parts[0];
  const menuPath = getSitePath(basePath);
  const Icon = part.icon || ListChecks;
  const advancedPartOnePracticePath = (setId) => getSitePath(`${basePath}/advanced/part-1-short-texts/practice/${setId}`);
  const generalPartOnePracticePath = (setId) => getSitePath(`${basePath}/general/part-1-short-texts/practice/${setId}`);
  const practiceSets = variant === "advanced" ? [
    { title: "Pilot Set 1", id: "pilot-1", taskId: "advanced-reading-part-1-pilot-1" },
    { title: "Pilot Set 2", id: "pilot-2", taskId: "advanced-reading-part-1-pilot-2" },
  ] : [
    { title: "A2 Pilot Set 1", level: "A2", id: "a2-pilot-1", taskId: "general-reading-part-1-a2-pilot-1" },
    { title: "B1 Pilot Set 1", level: "B1", id: "b1-pilot-1", taskId: "general-reading-part-1-b1-pilot-1" },
    { title: "B2 Pilot Set 1", level: "B2", id: "pilot-1", taskId: "general-reading-part-1-pilot-1" },
  ];
  const partOnePracticeSets = partId === "part-1-short-texts" ? practiceSets : [];
  const completedSetCount = partOnePracticeSets.filter((set) =>
    completedProgress.has(`reading.part1.practice.${set.taskId}`)
  ).length;

  return (
    <main className="ote-training-page">
      <Seo
        title={`${config.label} Reading ${part.label}: ${part.title} | Seif English`}
        description={`OTE ${config.label.toLowerCase()} reading ${part.label.toLowerCase()} section shell for ${part.title.toLowerCase()} practice.`}
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to reading
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">{config.label} Reading {part.label}</p>
        <h1>{part.title}</h1>
        <p>{part.copy}</p>
        {partOnePracticeSets.length ? (
          <div className="ote-training-progress-strip" aria-label="Reading practice progress">
            <span>{completedSetCount} of {partOnePracticeSets.length} practice sets complete</span>
            <div className="ote-training-progress-track" aria-hidden="true">
              <span style={{ width: `${Math.round((completedSetCount / partOnePracticeSets.length) * 100)}%` }} />
            </div>
          </div>
        ) : null}
      </header>

      {variant === "advanced" && partId === "part-1-short-texts" ? (
        <section className="ote-training-section">
          <div className="ote-practice-set-grid">
            {practiceSets.map((set) => {
              const isComplete = completedProgress.has(`reading.part1.practice.${set.taskId}`);
              return (
              <button className={`ote-practice-set-card ${isComplete ? "is-complete" : ""}`} key={set.id} type="button" onClick={() => navigate(advancedPartOnePracticePath(set.id))}>
                {isComplete ? <CheckCircle2 className="ote-training-complete-icon" size={22} aria-label="Completed" /> : null}
                <Clock3 size={28} aria-hidden="true" />
                <span>Timed practice</span>
                <h2>{set.title}</h2>
                <p>Six short texts. One multiple-choice question at a time. 1 minute 20 seconds for each answer.</p>
              </button>
            );
            })}
          </div>
        </section>
      ) : variant === "general" && partId === "part-1-short-texts" ? (
        <section className="ote-training-section">
          <div className="ote-practice-set-grid">
            {practiceSets.map((set) => {
              const isComplete = completedProgress.has(`reading.part1.practice.${set.taskId}`);
              return (
              <button className={`ote-practice-set-card ${isComplete ? "is-complete" : ""}`} key={set.id} type="button" onClick={() => navigate(generalPartOnePracticePath(set.id))}>
                {isComplete ? <CheckCircle2 className="ote-training-complete-icon" size={22} aria-label="Completed" /> : null}
                <Clock3 size={28} aria-hidden="true" />
                <span>{set.level} · Timed practice</span>
                <h2>{set.title}</h2>
                <p>Six practical short texts. One multiple-choice question at a time. 1 minute 20 seconds for each answer.</p>
              </button>
            );
            })}
          </div>
        </section>
      ) : (
      <section className="ote-training-section">
        <div className="ote-practice-set-card ote-writing-practice-entry-card">
          <Icon size={28} aria-hidden="true" />
          <span>Coming soon</span>
          <h2>{part.label} practice builder</h2>
          <p>
            This reading section is now in the OTE navigation. The next step is to add the actual
            training activity and timed practice flow for this part.
          </p>
        </div>
      </section>
      )}
    </main>
  );
}

export default function OteReadingMenu({ user, nativeRoutes = false }) {
  const navigate = useNavigate();
  const homePath = getSitePath(nativeRoutes ? "/" : "/ote");
  const basePath = getReadingBasePath(nativeRoutes);
  const activeVariant = getUserReadingVariant(user);
  const config = READING_VARIANTS[activeVariant];
  const completedProgress = useOteTrainingProgress();
  const readingPartOneSets = activeVariant === "advanced" ? [
    "advanced-reading-part-1-pilot-1",
    "advanced-reading-part-1-pilot-2",
  ] : [
    "general-reading-part-1-a2-pilot-1",
    "general-reading-part-1-b1-pilot-1",
    "general-reading-part-1-pilot-1",
  ];
  const completedPartOneSets = readingPartOneSets.filter((taskId) =>
    completedProgress.has(`reading.part1.practice.${taskId}`)
  ).length;

  return (
    <main className="menu-wrapper hub-menu-wrapper ote-menu-wrapper ote-skill-menu-wrapper">
      <Seo
        title={`${config.title} | Seif English`}
        description={`${config.title} sections and part menu.`}
      />

      <header className="main-header ote-main-header">
        <div className="ote-hub-logo" aria-label="OTE Reading">
          <strong>{config.title}</strong>
        </div>
      </header>

      <p className="menu-sub">{config.subtitle}</p>

      <section className="ote-training-section">
        <h2>{config.label} Reading Parts</h2>
        <p className="ote-section-lead">Open the section for each part of the module.</p>
        <div className="menu-grid" aria-label={`${config.label} reading parts`}>
          {config.parts.map((part) => {
            const Icon = part.icon;
            const partPath = getSitePath(`${basePath}/${activeVariant}/${part.id}`);
            return (
              <button className="menu-card" key={part.id} type="button" onClick={() => navigate(partPath)}>
                <Icon size={28} aria-hidden="true" />
                <span>{part.label}</span>
                <h3>{part.title}</h3>
                <p>{part.copy}</p>
                {part.id === "part-1-short-texts" ? (
                  <strong className="ote-reading-menu-progress">
                    {completedPartOneSets}/{readingPartOneSets.length} timed sets complete
                  </strong>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <button className="topbar-btn ote-back-btn" type="button" onClick={() => navigate(homePath)}>
        Back to OTE home
      </button>
    </main>
  );
}

export { OteReadingPartShell };
