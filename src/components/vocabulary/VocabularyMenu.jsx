import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  Languages,
  Layers3,
  Link2,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchAptisStrategyGuideProgress } from "../../firebase.js";
import AptisDemoBadge from "../access/AptisDemoBadge.jsx";
import Seo from "../common/Seo.jsx";
import "./vocabularyMenu.css";

const VOCABULARY_GUIDE_ID = "vocabulary_strategy_guide";

const BUILD_ACTIVITIES = [
  {
    id: "topics",
    eyebrow: "Topic practice",
    title: "Topic Practice",
    copy: "Study useful vocabulary by theme through flashcards, definitions, gap fills and review activities.",
    path: "/vocabulary/topics",
    demoAccess: "demo",
    icon: Layers3,
  },
  {
    id: "synonyms",
    eyebrow: "Meaning practice",
    title: "Synonym Trainer",
    copy: "Practise closest-meaning matches with exam-style sets, favourites and mistake review.",
    path: "/vocabulary/synonyms",
    demoAccess: "demo",
    icon: Languages,
  },
  {
    id: "collocation-trainer",
    eyebrow: "Precision practice",
    title: "Collocation Trainer",
    copy: "Choose all the natural word partnerships, review mistakes and save useful examples.",
    path: "/vocabulary/collocations/trainer",
    demoAccess: "locked",
    icon: Link2,
  },
  {
    id: "collocation-dash",
    eyebrow: "Fast review game",
    title: "Collocation Dash",
    copy: "Build speed by matching verbs with the phrases they naturally combine with.",
    path: "/vocabulary/collocations/dash",
    demoAccess: "locked",
    icon: Zap,
  },
];

const EXAM_ACTIVITIES = [
  {
    id: "exercise-trainer",
    eyebrow: "Exam-style sets",
    title: "Vocabulary Exercise Trainer",
    copy: "Generate mixed synonym, definition, word-use and word-combination exercises with feedback.",
    path: "/vocabulary/exercises",
    demoAccess: "demo",
    icon: BookOpenCheck,
  },
  {
    id: "full-mock",
    eyebrow: "Complete mock",
    title: "Grammar & Vocabulary Mock Exam",
    copy: "Complete all 50 questions with the shared 25-minute time limit and exam-style navigation.",
    path: "/grammar/aptis-mock",
    demoAccess: "locked",
    icon: ClipboardCheck,
  },
];

function AccessPill({ kind, isDemoMode }) {
  if (!isDemoMode) return null;
  return (
    <span className={`vocabulary-access-pill ${kind}`}>
      {kind === "demo" ? "Demo available" : "Full access"}
    </span>
  );
}

export default function VocabularyMenu({ user, aptisAccess, onSignIn }) {
  const navigate = useNavigate();
  const [lockedItem, setLockedItem] = useState("");
  const [guideComplete, setGuideComplete] = useState(false);
  const isDemoMode = Boolean(aptisAccess?.isDemoMode);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    let active = true;
    if (!user) {
      setGuideComplete(false);
      return undefined;
    }

    fetchAptisStrategyGuideProgress(VOCABULARY_GUIDE_ID)
      .then((progress) => {
        if (active) setGuideComplete(Boolean(progress?.completed));
      })
      .catch((error) => {
        console.warn("[Aptis Vocabulary] strategy progress load failed", error);
      });

    return () => {
      active = false;
    };
  }, [user]);

  function openActivity(activity) {
    if (isDemoMode && activity.demoAccess === "locked") {
      setLockedItem(activity.title);
      return;
    }
    setLockedItem("");
    navigate(activity.path);
  }

  function renderActivity(activity) {
    const ActivityIcon = activity.icon;
    return (
      <button
        className="menu-card vocabulary-activity-card"
        key={activity.id}
        type="button"
        onClick={() => openActivity(activity)}
      >
        <div className="vocabulary-card-label">
          <ActivityIcon size={25} aria-hidden="true" />
          <span>{activity.eyebrow}</span>
        </div>
        <h3>{activity.title}</h3>
        <p>{activity.copy}</p>
        <div className="vocabulary-card-footer">
          <AccessPill kind={activity.demoAccess} isDemoMode={isDemoMode} />
          <strong>Open activity <ChevronRight size={17} aria-hidden="true" /></strong>
        </div>
      </button>
    );
  }

  return (
    <main className="vocabulary-hub game-wrapper hub-menu-wrapper menu-style-hub">
      <Seo
        title="Aptis Vocabulary Strategy and Practice | Seif Aptis Trainer"
        description="Learn an effective Aptis Vocabulary strategy, build vocabulary by skill and complete exam-style vocabulary practice."
      />

      <button className="vocabulary-back" type="button" onClick={() => navigate("/grammar-vocabulary")}>
        <ArrowLeft size={18} aria-hidden="true" /> Back to Grammar &amp; Vocabulary
      </button>

      <header className="vocabulary-header">
        <div className="vocabulary-title-line"><Languages size={30} aria-hidden="true" /><span>Vocabulary</span></div>
        <h1>Vocabulary strategy &amp; practice</h1>
        <p>Learn a reliable method for the 25 vocabulary questions, then develop your range, precision and speed.</p>
      </header>

      <AptisDemoBadge user={user} aptisAccess={aptisAccess} onSignIn={onSignIn} />

      {lockedItem ? (
        <div className="vocabulary-access-prompt" role="status">
          <div><strong>{lockedItem} is included with full access.</strong><p>Sign in with your academy account or use the access link above to continue.</p></div>
          {!user && onSignIn ? <button type="button" onClick={onSignIn}>Sign in</button> : null}
        </div>
      ) : null}

      <section className="vocabulary-section">
        <div className="vocabulary-section-heading"><h2>Learn the method</h2><p>Understand the four question types and use the right strategy for each one.</p></div>
        <button
          className={`menu-card vocabulary-activity-card vocabulary-guide-card ${guideComplete ? "is-complete" : ""}`}
          type="button"
          onClick={() => navigate("/vocabulary/strategy-guide")}
        >
          {guideComplete ? <CheckCircle2 className="vocabulary-complete-icon" size={23} aria-label="Completed" /> : null}
          <div className="vocabulary-card-label"><GraduationCap size={25} aria-hidden="true" /><span>Strategy guide</span></div>
          <h3>Vocabulary Strategy Guide</h3>
          <p>Learn how to identify the task, use meaning and context, make confident matches and manage unknown words.</p>
          {guideComplete ? <strong className="vocabulary-progress">Completed</strong> : null}
          <div className="vocabulary-card-footer"><strong>Open guide <ChevronRight size={17} aria-hidden="true" /></strong></div>
        </button>
      </section>

      <section className="vocabulary-section">
        <div className="vocabulary-section-heading"><h2>Build your vocabulary</h2><p>Develop your knowledge through focused meaning, topic and word-combination practice.</p></div>
        <div className="vocabulary-card-grid">{BUILD_ACTIVITIES.map(renderActivity)}</div>
      </section>

      <section className="vocabulary-section">
        <div className="vocabulary-section-heading"><h2>Exam-style practice</h2><p>Combine the vocabulary skills or complete the full Grammar and Vocabulary component.</p></div>
        <div className="vocabulary-card-grid">{EXAM_ACTIVITIES.map(renderActivity)}</div>
      </section>
    </main>
  );
}
