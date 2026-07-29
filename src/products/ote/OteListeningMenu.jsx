import React, { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileAudio,
  Headphones,
  Image,
  ListChecks,
  MessageSquareText,
  NotebookTabs,
  Radio,
  Users,
} from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { advancedListeningPart1Sets } from "./data/oteAdvancedListeningPart1.js";
import { advancedListeningPart2Sets } from "./data/oteAdvancedListeningPart2.js";
import { advancedListeningPart3Sets } from "./data/oteAdvancedListeningPart3.js";
import { generalListeningPart1Sets } from "./data/oteGeneralListeningPart1.js";
import { generalListeningPart2Sets } from "./data/oteGeneralListeningPart2.js";
import { generalListeningPart3Sets } from "./data/oteGeneralListeningPart3.js";
import { useOteTrainingProgress } from "./utils/trainingProgress.js";
import { createOteListeningLiveGame } from "../../api/liveGames.js";
import { getOteListeningLiveActivityId } from "./data/oteListeningLive.js";
import { toast } from "../../utils/toast.js";
import "./styles/ote.css";

const LISTENING_VARIANTS = {
  general: {
    label: "General",
    title: "OTE General Listening",
    subtitle: "A2-B2 practice for all four parts of the Oxford Test of English Listening module.",
    seoDescription: "Oxford Test of English General listening sections and part menus.",
    parts: [
      {
        id: "part-1-picture-options",
        label: "Part 1",
        title: "Picture options",
        copy: "Five short monologues or dialogues with one three-picture multiple-choice question each.",
        icon: Image,
        availableSets: 3,
      },
      {
        id: "part-2-note-completion",
        label: "Part 2",
        title: "Note completion",
        copy: "A longer monologue with five multiple-choice questions completing a set of notes.",
        icon: NotebookTabs,
        availableSets: 4,
        guides: [
          {
            title: "Note Completion Strategy Guide",
            copy: "Learn how the task changes from A2 to B2, use the 30-second preview, track competing details, and review the key distractor patterns.",
            progressId: "listening.part2.general-guide",
            route: "guide",
            icon: BookOpen,
          },
        ],
      },
      {
        id: "part-3-opinion-matching",
        label: "Part 3",
        title: "Opinion matching",
        copy: "A longer dialogue with five questions matching opinions to the people who express them.",
        icon: Users,
        availableSets: 3,
      },
      {
        id: "part-4-text-options",
        label: "Part 4",
        title: "Multiple-choice extracts",
        copy: "Five short monologues or dialogues with one three-option text question each.",
        icon: MessageSquareText,
      },
    ],
  },
  advanced: {
    label: "Advanced",
    title: "OTE Advanced Listening",
    subtitle: "B2-C1 practice for the three task formats used across the four parts of the Oxford Test of English Advanced Listening module.",
    seoDescription: "Oxford Test of English Advanced listening sections and part menus.",
    sectionTitle: "Advanced Listening task formats",
    sectionLead: "Parts 1 and 4 use the same short-extract format, so they share one training area.",
    parts: [
      {
        id: "part-1-short-extracts",
        label: "Parts 1 & 4",
        title: "Short extracts",
        copy: "Five short monologues or dialogues with three-option questions: Part 1 may use pictures or text, while Part 4 uses text only.",
        icon: Image,
        availableSets: 3,
        guides: [
          {
            title: "Parts 1 & 4 Short Extracts Guide",
            copy: "Compare the two parts, then learn their shared question types, two-listening method, and distractor patterns.",
            progressId: "listening.part1.advanced-guide",
            route: "guide",
            icon: BookOpen,
          },
        ],
      },
      {
        id: "part-2-note-completion",
        label: "Part 2",
        title: "Note completion",
        copy: "A longer monologue with five multiple-choice note questions or six gaps to complete.",
        icon: NotebookTabs,
        availableSets: 2,
        guides: [
          {
            title: "Note Completion Strategy Guide",
            copy: "Compare the adaptive B2 and C1 formats, build a reliable note-following method, and review the answer rules.",
            progressId: "listening.part2.advanced-guide",
            route: "guide",
            icon: BookOpen,
          },
        ],
      },
      {
        id: "part-3-opinion-matching",
        label: "Part 3",
        title: "Opinion matching",
        copy: "A longer dialogue with five or six questions matching stated and implied opinions to speakers.",
        icon: Users,
        availableSets: 2,
      },
    ],
  },
};

function getListeningBasePath(nativeRoutes) {
  return nativeRoutes ? "/listening" : "/ote/listening";
}

function getUserListeningVariant(user) {
  return user?.oteVersion === "advanced" ? "advanced" : "general";
}

function getListeningSets(variant, partId) {
  if (variant === "general" && partId === "part-1-picture-options") {
    return generalListeningPart1Sets;
  }
  if (variant === "general" && partId === "part-2-note-completion") {
    return generalListeningPart2Sets;
  }
  if (variant === "general" && partId === "part-3-opinion-matching") {
    return generalListeningPart3Sets;
  }
  if (variant === "advanced" && partId === "part-1-short-extracts") {
    return advancedListeningPart1Sets;
  }
  if (variant === "advanced" && partId === "part-2-note-completion") {
    return advancedListeningPart2Sets;
  }
  if (variant === "advanced" && partId === "part-3-opinion-matching") {
    return advancedListeningPart3Sets;
  }
  return [];
}

function getListeningTaskId(variant, partId, setId) {
  const partNumber =
    partId === "part-3-opinion-matching"
      ? 3
      : partId === "part-2-note-completion"
        ? 2
        : 1;
  return `listening.part${partNumber}.practice.${variant}-listening-part-${partNumber}-${setId}`;
}

function OteListeningPartShell({ user, nativeRoutes = false }) {
  const navigate = useNavigate();
  const { variant = "general", partId = "" } = useParams();
  const activeVariant = getUserListeningVariant(user);
  const config = LISTENING_VARIANTS[activeVariant];
  const basePath = getListeningBasePath(nativeRoutes);
  const requestedPartIsValid = config.parts.some((item) => item.id === partId);
  const completedProgress = useOteTrainingProgress();
  const [creatingLiveSetId, setCreatingLiveSetId] = useState("");
  const canHostLive = user?.role === "teacher" || user?.role === "admin";

  if (variant !== activeVariant || !requestedPartIsValid) {
    const fallbackPartId = requestedPartIsValid ? partId : config.parts[0].id;
    return <Navigate to={getSitePath(`${basePath}/${activeVariant}/${fallbackPartId}`)} replace />;
  }

  const part = config.parts.find((item) => item.id === partId) || config.parts[0];
  const Icon = part.icon || Headphones;
  const menuPath = getSitePath(basePath);
  const listeningSets = getListeningSets(variant, partId);
  const hasListeningSets = listeningSets.length > 0;
  const visiblePracticeSets = canHostLive
    ? listeningSets
    : listeningSets.filter((set) => set.hiddenFromStudentMenu !== true);
  const hasVisiblePracticeSets = visiblePracticeSets.length > 0;
  const guideCards = (part.guides || []).map((guide) => ({
    ...guide,
    path: getSitePath(`${basePath}/${variant}/${partId}/${guide.route}`),
  }));

  async function launchLiveSet(set) {
    const partNumber =
      partId === "part-3-opinion-matching"
        ? 3
        : partId === "part-2-note-completion"
          ? 2
          : 1;
    setCreatingLiveSetId(set.id);
    try {
      const { gameId } = await createOteListeningLiveGame({
        activityId: getOteListeningLiveActivityId(variant, partNumber, set.id),
        title: set.title,
      });
      navigate(getSitePath(`/live/ote-listening/host/${gameId}`));
    } catch (error) {
      console.error("[OteListeningPartShell] live session creation failed", error);
      toast(error.message || "Could not create the listening room.");
    } finally {
      setCreatingLiveSetId("");
    }
  }

  return (
    <main className="ote-training-page ote-listening-part-page">
      <Seo
        title={`${config.label} Listening ${part.label}: ${part.title} | Seif English`}
        description={`OTE ${config.label.toLowerCase()} listening ${part.label.toLowerCase()} practice for ${part.title.toLowerCase()}.`}
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to listening
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">{config.label} Listening {part.label}</p>
        <h1>{part.title}</h1>
        <p>{part.copy} Each recording can be played up to twice.</p>
      </header>

      {guideCards.length ? (
        <div className="ote-training-activity-grid" aria-label={`${part.label} strategy guide`}>
          {guideCards.map((guide) => {
            const GuideIcon = guide.icon || Icon;
            const guideComplete = completedProgress.has(guide.progressId);
            return (
              <button
                className={`ote-training-activity-card ${guideComplete ? "is-complete" : ""}`}
                key={guide.progressId}
                type="button"
                onClick={() => navigate(guide.path)}
              >
                {guideComplete ? (
                  <CheckCircle2 className="ote-training-complete-icon" size={22} aria-label="Completed" />
                ) : null}
                <GuideIcon size={28} aria-hidden="true" />
                <span>Guide</span>
                <h2>{guide.title}</h2>
                <p>{guide.copy}</p>
              </button>
            );
          })}
        </div>
      ) : null}

      <section className="ote-training-section">
        <h2>Practice sets</h2>
        <p className="ote-section-lead">
          {hasVisiblePracticeSets
            ? "Open a ready set to practise this part in the native listening interface."
            : "This section is in place and ready for its first listening set."}
        </p>
        <div className="ote-practice-set-grid">
          {hasVisiblePracticeSets ? (
            visiblePracticeSets.map((set) => {
              const setPath = getSitePath(`${basePath}/${variant}/${partId}/practice/${set.id}`);
              const isComplete = completedProgress.has(
                getListeningTaskId(variant, partId, set.id)
              );
              const isReady = set.assetsReady !== false;
              const mainAudioReady = set.audioReady !== false;
              const instructionAudioReady = set.instructionAudioReady !== false;
              const levelLabel = set.level || (variant === "advanced" ? "B2-C1" : "A2-B2");
              return (
                <button
                  className={`ote-practice-set-card ${isComplete ? "is-complete" : ""}`}
                  type="button"
                  key={set.id}
                  onClick={() => navigate(setPath)}
                  disabled={!isReady}
                >
                  {isComplete ? <CheckCircle2 className="ote-training-complete-icon" size={22} aria-label="Completed" /> : null}
                  <Headphones size={28} aria-hidden="true" />
                  <span>
                    {!isReady
                      ? `${levelLabel} · Assets in production`
                      : mainAudioReady
                        ? `${levelLabel} · Timed practice`
                        : `${levelLabel} · Content preview`}
                  </span>
                  <h2>{set.title}</h2>
                  <p>{set.description}</p>
                  {!isReady ? (
                    <strong className="ote-reading-menu-progress">Content integrated · Images and audio pending</strong>
                  ) : !mainAudioReady ? (
                    <strong className="ote-reading-menu-progress">Browser-voice preview · Final audio pending</strong>
                  ) : !instructionAudioReady ? (
                    <strong className="ote-reading-menu-progress">Recorded discussion · Browser-voiced instructions</strong>
                  ) : null}
                </button>
              );
            })
          ) : (
            <article className="ote-practice-set-card ote-writing-practice-entry-card">
              <FileAudio size={28} aria-hidden="true" />
              <span>Coming soon</span>
              <h2>{config.label} {part.label} Set 1</h2>
              <p>The part menu and route are ready. The first question set and audio will be added here.</p>
            </article>
          )}
        </div>
        {canHostLive && hasListeningSets ? (
          <aside className="ote-listening-teacher-mode">
            <div>
              <Radio size={25} aria-hidden="true" />
              <span>
                <strong>Teacher mode</strong>
                <small>Host the audio and control the task, repeat and detailed feedback for a live class.</small>
              </span>
            </div>
            <div>
              {listeningSets
                .filter((set) => set.assetsReady !== false && set.audioReady !== false)
                .map((set) => (
                  <button
                    disabled={!!creatingLiveSetId}
                    key={set.id}
                    onClick={() => launchLiveSet(set)}
                    type="button"
                  >
                    <Radio size={16} />
                    {creatingLiveSetId === set.id
                      ? "Creating room…"
                      : `Run ${set.level ? `${set.level} · ${set.title}` : set.title} live`}
                  </button>
                ))}
            </div>
          </aside>
        ) : null}
      </section>
    </main>
  );
}

export default function OteListeningMenu({ user, nativeRoutes = false }) {
  const navigate = useNavigate();
  const homePath = getSitePath(nativeRoutes ? "/" : "/ote");
  const basePath = getListeningBasePath(nativeRoutes);
  const activeVariant = getUserListeningVariant(user);
  const config = LISTENING_VARIANTS[activeVariant];
  const completedProgress = useOteTrainingProgress();
  const canSeeHiddenSets = user?.role === "teacher" || user?.role === "admin";
  const visibleParts = config.parts.filter(
    (part) =>
      part.id !== "part-3-opinion-matching" ||
      activeVariant === "advanced" ||
      canSeeHiddenSets
  );

  return (
    <main className="menu-wrapper hub-menu-wrapper ote-menu-wrapper ote-listening-menu">
      <Seo
        title={`${config.title} | Seif English`}
        description={config.seoDescription}
      />

      <header className="main-header ote-main-header">
        <div className="ote-hub-logo" aria-label={config.title}>
          <Headphones size={28} aria-hidden="true" />
          <strong>{config.title}</strong>
        </div>
      </header>

      <p className="menu-sub">{config.subtitle}</p>

      <section className="ote-training-section">
        <h2>{config.sectionTitle || `${config.label} Listening Parts`}</h2>
        <p className="ote-section-lead">
          {config.sectionLead || "Open the section for each part of the module."}
        </p>
        <div className="menu-grid" aria-label={`${config.label} listening parts`}>
          {visibleParts.map((part) => {
            const Icon = part.icon || ListChecks;
            const partPath = getSitePath(`${basePath}/${activeVariant}/${part.id}`);
            const partSets = getListeningSets(activeVariant, part.id);
            const listedPartSets = canSeeHiddenSets
              ? partSets
              : partSets.filter((set) => set.hiddenFromStudentMenu !== true);
            const readyPartSets = listedPartSets.filter((set) => set.assetsReady !== false);
            const completedPartSets = readyPartSets.filter((set) =>
              completedProgress.has(getListeningTaskId(activeVariant, part.id, set.id))
            );
            return (
              <button className="menu-card" type="button" key={part.id} onClick={() => navigate(partPath)}>
                <div className="ote-listening-card-icon"><Icon size={25} aria-hidden="true" /></div>
                <span>{part.label}</span>
                <h3>{part.title}</h3>
                <p>{part.copy}</p>
                {part.availableSets ? (
                  <strong className="ote-reading-menu-progress">
                    {completedPartSets.length}/{readyPartSets.length} available sets complete
                    {listedPartSets.length > readyPartSets.length
                      ? ` · ${listedPartSets.length - readyPartSets.length} in production`
                      : ""}
                  </strong>
                ) : (
                  <strong className="ote-reading-menu-progress">Section ready · Sets coming soon</strong>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <button className="topbar-btn ote-back-btn" type="button" onClick={() => navigate(homePath)}>
        <ArrowLeft size={17} aria-hidden="true" />
        Back to OTE home
      </button>
    </main>
  );
}

export { OteListeningPartShell };
