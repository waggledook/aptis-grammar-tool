import React from "react";
import { ArrowLeft, BookOpen, CheckCircle2, Clock3, FileText, FlaskConical, ListChecks, Search, Target, TextCursorInput, Users } from "lucide-react";
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
        guides: [
          {
            title: "Short Texts Strategy Guide",
            copy: "Learn the timing, question types, common traps, and a simple 80-second method.",
            progressId: "reading.part1.general-guide",
            route: "guide",
            icon: FileText,
          },
        ],
        icon: FileText,
      },
      {
        id: "part-2-matching",
        label: "Part 2",
        title: "Multiple Matching",
        copy: "Match profiles, requirements, or factual texts by scanning for detail, opinion, and attitude.",
        guides: [
          {
            title: "Six Questions → Three Texts",
            copy: "Build a quick map of three personal texts, then search efficiently for information, opinion, and attitude.",
            progressId: "reading.part2.general-three-texts-guide",
            route: "guide/three-texts",
            icon: FileText,
          },
          {
            title: "Six People → Four Choices",
            copy: "Identify each person's essential requirements, reject partial matches, and choose the best overall fit.",
            progressId: "reading.part2.general-people-choices-guide",
            route: "guide/people-and-choices",
            icon: Users,
          },
        ],
        icon: Search,
      },
      {
        id: "part-3-gapped-text",
        label: "Part 3",
        title: "Gapped Text",
        copy: "Insert six missing sentences into a longer newspaper or magazine-style text.",
        guides: [
          {
            title: "Gapped Text Strategy Guide",
            copy: "Use references, linking language, grammar, and paragraph logic to connect every gap on both sides.",
            progressId: "reading.part3.general-guide",
            route: "guide",
            icon: TextCursorInput,
          },
          {
            title: "Cohesion Detective",
            copy: "Work through two rounds of missing-sentence cases, moving from clear references and results to paragraph-level reasoning.",
            progressId: "reading.part3.general-cohesion-detective",
            route: "cohesion-detective",
            icon: Search,
            eyebrow: "Skill trainer",
          },
          {
            title: "Distractor Laboratory",
            copy: "Solve two mini gapped texts, then use short explanations to see why the tempting sentences do not fit.",
            progressId: "reading.part3.general-distractor-laboratory",
            route: "distractor-laboratory",
            icon: FlaskConical,
            eyebrow: "Skill trainer",
          },
        ],
        icon: TextCursorInput,
      },
      {
        id: "part-4-long-text",
        label: "Part 4",
        title: "Long Text",
        copy: "Answer four multiple-choice questions on a longer text.",
        guides: [
          {
            title: "Long Text Strategy Guide",
            copy: "Work through local and global questions, read words in context, and avoid realistic distractors.",
            progressId: "reading.part4.general-guide",
            route: "guide",
            icon: BookOpen,
          },
        ],
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
        guides: [
          {
            title: "Short Texts Strategy Guide",
            copy: "Learn the timing, question types, distractor patterns, and an 80-second method, then check your understanding.",
            progressId: "reading.part1.advanced-guide",
            route: "guide",
            icon: FileText,
          },
          {
            title: "Set Your Reading Target",
            copy: "Identify what each question asks, form your own answer, then test it against three realistic options.",
            progressId: "reading.part1.advanced-reading-target",
            route: "reading-target",
            icon: Target,
            eyebrow: "Skill trainer",
          },
          {
            title: "Distractor Forensics",
            copy: "Choose the best answers, then diagnose exactly how twelve realistic distractors change or overstate the text.",
            progressId: "reading.part1.advanced-distractor-forensics",
            route: "distractor-forensics",
            icon: FlaskConical,
            eyebrow: "Skill trainer",
          },
        ],
        icon: FileText,
      },
      {
        id: "part-2-matching",
        label: "Part 2",
        title: "Matching",
        copy: "Match six or seven items with texts, using fast search reading for detail, opinion, and implication.",
        guideTitle: "Multiple Matching Strategy Guide",
        guideCopy: "Compare the two possible layouts, practise a fast matching method, and learn how to reject partial matches.",
        guideProgressId: "reading.part2.advanced-guide",
        icon: Search,
      },
      {
        id: "part-3-gapped-text",
        label: "Part 3",
        title: "Gapped Text",
        copy: "Place six extracted sentences into a text, with one extra distractor sentence.",
        guides: [
          {
            title: "Gapped Text Strategy Guide",
            copy: "Use reference words, linking language, grammar, and paragraph function to connect each sentence on both sides.",
            progressId: "reading.part3.advanced-guide",
            route: "guide",
            icon: TextCursorInput,
          },
          {
            title: "Cohesion Detective",
            copy: "Solve eight missing-sentence cases by marking the backward, forward, and bridge clues that connect the paragraph.",
            progressId: "reading.part3.advanced-cohesion-detective",
            route: "cohesion-detective",
            icon: Search,
            eyebrow: "Skill trainer",
          },
          {
            title: "Distractor Laboratory",
            copy: "Solve a mini gapped text, then diagnose why four plausible alternatives fail to perform the paragraph’s required job.",
            progressId: "reading.part3.advanced-distractor-laboratory",
            route: "distractor-laboratory",
            icon: FlaskConical,
            eyebrow: "Skill trainer",
          },
        ],
        icon: TextCursorInput,
      },
      {
        id: "part-4-long-text",
        label: "Part 4",
        title: "Long Text",
        copy: "Answer four or five multiple-choice questions on a longer text.",
        guideTitle: "Long Text Strategy Guide",
        guideCopy: "Work through local and global questions efficiently, identify rhetorical purpose, and avoid realistic distractors.",
        guideProgressId: "reading.part4.advanced-guide",
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
  const guideCards = part.guides?.map((guide) => ({
    ...guide,
    path: getSitePath(`${basePath}/${variant}/${partId}/${guide.route}`),
  })) || (part.guideTitle ? [{
    title: part.guideTitle,
    copy: part.guideCopy,
    progressId: part.guideProgressId,
    path: getSitePath(`${basePath}/${variant}/${partId}/guide`),
    icon: Icon,
  }] : []);
  const advancedPartOnePracticePath = (setId) => getSitePath(`${basePath}/advanced/part-1-short-texts/practice/${setId}`);
  const advancedPartTwoPracticePath = (setId) => getSitePath(`${basePath}/advanced/part-2-matching/practice/${setId}`);
  const advancedPartThreePracticePath = (setId) => getSitePath(`${basePath}/advanced/part-3-gapped-text/practice/${setId}`);
  const advancedPartFourPracticePath = (setId) => getSitePath(`${basePath}/advanced/part-4-long-text/practice/${setId}`);
  const generalPartFourPracticePath = (setId) => getSitePath(`${basePath}/general/part-4-long-text/practice/${setId}`);
  const generalPartThreePracticePath = (setId) => getSitePath(`${basePath}/general/part-3-gapped-text/practice/${setId}`);
  const generalPartOnePracticePath = (setId) => getSitePath(`${basePath}/general/part-1-short-texts/practice/${setId}`);
  const generalPartTwoPracticePath = (setId) => getSitePath(`${basePath}/general/part-2-matching/practice/${setId}`);
  const practiceSets = variant === "advanced" ? [
    { title: "Choices and Consequences", id: "pilot-1", taskId: "advanced-reading-part-1-pilot-1" },
    { title: "Evidence and Decisions", id: "pilot-2", taskId: "advanced-reading-part-1-pilot-2" },
  ] : [
    { title: "Everyday Messages", level: "A2", id: "a2-pilot-1", taskId: "general-reading-part-1-a2-pilot-1" },
    { title: "Plans and Everyday Life", level: "B1", id: "b1-pilot-1", taskId: "general-reading-part-1-b1-pilot-1" },
    { title: "Photography and Services", level: "B2", id: "pilot-1", taskId: "general-reading-part-1-pilot-1" },
  ];
  const partOnePracticeSets = partId === "part-1-short-texts" ? practiceSets : [];
  const partTwoPracticeSets = partId === "part-2-matching" ? (variant === "advanced" ? [
    { title: "Handwriting or Digital Notes?", level: "C1", id: "c1-pilot-1", taskId: "advanced-reading-part-2-c1-pilot-1" },
    { title: "Personality Tests at Work", level: "C1", id: "c1-pilot-2", taskId: "advanced-reading-part-2-c1-pilot-2" },
    { title: "Making Cities Wilder", level: "C1", id: "c1-pilot-3", taskId: "advanced-reading-part-2-c1-pilot-3" },
  ] : [
    { title: "Learning to Cook", level: "A2", formatLabel: "Three texts", id: "a2-pilot-1", taskId: "general-reading-part-2-a2-pilot-1" },
    { title: "My Volunteer Work", level: "A2", formatLabel: "Three texts", id: "a2-pilot-2", taskId: "general-reading-part-2-a2-pilot-2" },
    { title: "Podcasts to Download", level: "B2", formatLabel: "People and choices", id: "b2-pilot-1", taskId: "general-reading-part-2-b2-pilot-1" },
    { title: "Online Course Providers", level: "B2", formatLabel: "People and choices", id: "b2-pilot-2", taskId: "general-reading-part-2-b2-pilot-2" },
  ]) : [];
  const partThreePracticeSets = partId === "part-3-gapped-text" ? (variant === "advanced" ? [
    { title: "The Case for Getting Slightly Lost", level: "C1", id: "c1-pilot-1", taskId: "advanced-reading-part-3-c1-pilot-1" },
    { title: "Why We Keep Souvenirs", level: "C1", id: "c1-pilot-2", taskId: "advanced-reading-part-3-c1-pilot-2" },
    { title: "The Value of Being Bored", level: "C1", id: "c1-pilot-3", taskId: "advanced-reading-part-3-c1-pilot-3" },
  ] : [
    { title: "My First Community Garden", level: "A2", id: "a2-pilot-1", taskId: "general-reading-part-3-a2-pilot-1" },
    { title: "A Weekend Without My Phone", level: "A2", id: "a2-pilot-2", taskId: "general-reading-part-3-a2-pilot-2" },
    { title: "My First Market Stall", level: "B1", id: "b1-pilot-1", taskId: "general-reading-part-3-b1-pilot-1" },
    { title: "Why Study Breaks Matter", level: "B1", id: "b1-pilot-2", taskId: "general-reading-part-3-b1-pilot-2" },
    { title: "Walking Meetings", level: "B2", id: "b2-pilot-1", taskId: "general-reading-part-3-b2-pilot-1" },
    { title: "Repair Cafés", level: "B2", id: "b2-pilot-2", taskId: "general-reading-part-3-b2-pilot-2" },
  ]) : [];
  const partFourPracticeSets = partId === "part-4-long-text" ? (variant === "advanced" ? [
    { title: "The Hidden Work of Small Talk", level: "C1", id: "c1-pilot-1", taskId: "advanced-reading-part-4-c1-pilot-1" },
    { title: "The Danger of Perfect Efficiency", level: "C1", id: "c1-pilot-2", taskId: "advanced-reading-part-4-c1-pilot-2" },
    { title: "Why Queues Are Not Always a Failure", level: "C1", id: "c1-queues", taskId: "advanced-reading-part-4-c1-queues" },
  ] : [
    { title: "The Right Dog for Us", level: "A2", id: "a2-new-dog", taskId: "general-reading-part-4-a2-new-dog" },
    { title: "Borrow, Don’t Buy", level: "A2", id: "a2-useful-things", taskId: "general-reading-part-4-a2-useful-things" },
    { title: "Giving Old Bicycles a Second Life", level: "B1", id: "b1-second-life", taskId: "general-reading-part-4-b1-second-life" },
    { title: "Why City Trees Matter", level: "B1", id: "b1-city-trees", taskId: "general-reading-part-4-b1-city-trees" },
    { title: "Reading Together in Silence", level: "B2", id: "b2-reading-together", taskId: "general-reading-part-4-b2-reading-together" },
    { title: "Why Holidays Seem to Change Speed", level: "B2", id: "b2-holiday-time", taskId: "general-reading-part-4-b2-holiday-time" },
  ]) : [];
  const currentPracticeSets = partOnePracticeSets.length ? partOnePracticeSets : partTwoPracticeSets.length ? partTwoPracticeSets : partThreePracticeSets.length ? partThreePracticeSets : partFourPracticeSets;
  const completedSetCount = partOnePracticeSets.filter((set) =>
    completedProgress.has(`reading.part1.practice.${set.taskId}`)
  ).length + partTwoPracticeSets.filter((set) => completedProgress.has(`reading.part2.practice.${set.taskId}`)).length + partThreePracticeSets.filter((set) => completedProgress.has(`reading.part3.practice.${set.taskId}`)).length + partFourPracticeSets.filter((set) => completedProgress.has(`reading.part4.practice.${set.taskId}`)).length;

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
        {currentPracticeSets.length ? (
          <div className="ote-training-progress-strip" aria-label="Reading practice progress">
            <span>{completedSetCount} of {currentPracticeSets.length} practice sets complete</span>
            <div className="ote-training-progress-track" aria-hidden="true">
              <span style={{ width: `${Math.round((completedSetCount / currentPracticeSets.length) * 100)}%` }} />
            </div>
          </div>
        ) : null}
      </header>

      {guideCards.length ? (
        <div className={`ote-training-activity-grid ${guideCards.length === 2 ? "is-two-column" : ""}`} aria-label={`${part.label} training ${guideCards.length === 1 ? "guide" : "guides"}`}>
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
                {guideComplete ? <CheckCircle2 className="ote-training-complete-icon" size={22} aria-label="Completed" /> : null}
                <GuideIcon size={28} aria-hidden="true" />
                <span>{guide.eyebrow || "Guide"}</span>
                <h2>{guide.title}</h2>
                <p>{guide.copy}</p>
              </button>
            );
          })}
        </div>
      ) : null}

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
      ) : partTwoPracticeSets.length ? (
        <section className="ote-training-section">
          <div className="ote-practice-set-grid">
            {partTwoPracticeSets.map((set) => {
              const isComplete = completedProgress.has(`reading.part2.practice.${set.taskId}`);
              return <button className={`ote-practice-set-card ${isComplete ? "is-complete" : ""}`} key={set.id} type="button" onClick={() => navigate(variant === "advanced" ? advancedPartTwoPracticePath(set.id) : generalPartTwoPracticePath(set.id))}>
                {isComplete ? <CheckCircle2 className="ote-training-complete-icon" size={22} aria-label="Completed" /> : null}
                <Clock3 size={28} aria-hidden="true" />
                <span>{set.level} · {set.formatLabel || "Timed practice"}</span>
                <h2>{set.title}</h2>
                <p>{variant === "advanced" ? "Seven matching questions. Three specialist responses." : set.level === "A2" ? "Six questions. Three short personal texts." : "Six profiles. Four source options."} 8 minutes for the full task.</p>
              </button>;
            })}
          </div>
        </section>
      ) : partThreePracticeSets.length ? (
        <section className="ote-training-section"><div className="ote-practice-set-grid">{partThreePracticeSets.map((set) => {
          const isComplete = completedProgress.has(`reading.part3.practice.${set.taskId}`);
          return <button className={`ote-practice-set-card ${isComplete ? "is-complete" : ""}`} key={set.id} type="button" onClick={() => navigate(variant === "advanced" ? advancedPartThreePracticePath(set.id) : generalPartThreePracticePath(set.id))}>{isComplete ? <CheckCircle2 className="ote-training-complete-icon" size={22} aria-label="Completed" /> : null}<Clock3 size={28} aria-hidden="true" /><span>{set.level} · Timed practice</span><h2>{set.title}</h2><p>Six missing sentences, one extra option, and 11 minutes for the full task.</p></button>;
        })}</div></section>
      ) : partFourPracticeSets.length ? (
        <section className="ote-training-section"><div className="ote-practice-set-grid">{partFourPracticeSets.map((set) => { const isComplete = completedProgress.has(`reading.part4.practice.${set.taskId}`); return <button className={`ote-practice-set-card ${isComplete ? "is-complete" : ""}`} key={set.id} type="button" onClick={() => navigate(variant === "advanced" ? advancedPartFourPracticePath(set.id) : generalPartFourPracticePath(set.id))}>{isComplete ? <CheckCircle2 className="ote-training-complete-icon" size={22} aria-label="Completed" /> : null}<Clock3 size={28} aria-hidden="true" /><span>{set.level} · Timed practice</span><h2>{set.title}</h2><p>One long text, {variant === "advanced" ? "five" : "four"} questions, and 8 minutes for the full task.</p></button>; })}</div></section>
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
  const readingMockPath = getSitePath(nativeRoutes ? "/reading/mock-tests/advanced-reading-1" : "/ote/reading/mock-tests/advanced-reading-1");
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
  const readingPartTwoSets = activeVariant === "advanced" ? ["advanced-reading-part-2-c1-pilot-1", "advanced-reading-part-2-c1-pilot-2", "advanced-reading-part-2-c1-pilot-3"] : ["general-reading-part-2-a2-pilot-1", "general-reading-part-2-a2-pilot-2", "general-reading-part-2-b2-pilot-1", "general-reading-part-2-b2-pilot-2"];
  const readingPartThreeSets = activeVariant === "advanced" ? ["advanced-reading-part-3-c1-pilot-1", "advanced-reading-part-3-c1-pilot-2", "advanced-reading-part-3-c1-pilot-3"] : ["general-reading-part-3-a2-pilot-1", "general-reading-part-3-a2-pilot-2", "general-reading-part-3-b1-pilot-1", "general-reading-part-3-b1-pilot-2", "general-reading-part-3-b2-pilot-1", "general-reading-part-3-b2-pilot-2"];
  const readingPartFourSets = activeVariant === "advanced" ? ["advanced-reading-part-4-c1-pilot-1", "advanced-reading-part-4-c1-pilot-2", "advanced-reading-part-4-c1-queues"] : ["general-reading-part-4-a2-new-dog", "general-reading-part-4-a2-useful-things", "general-reading-part-4-b1-second-life", "general-reading-part-4-b1-city-trees", "general-reading-part-4-b2-reading-together", "general-reading-part-4-b2-holiday-time"];
  const completedPartTwoSets = readingPartTwoSets.filter((taskId) =>
    completedProgress.has(`reading.part2.practice.${taskId}`)
  ).length;
  const completedPartThreeSets = readingPartThreeSets.filter((taskId) => completedProgress.has(`reading.part3.practice.${taskId}`)).length;
  const completedPartFourSets = readingPartFourSets.filter((taskId) => completedProgress.has(`reading.part4.practice.${taskId}`)).length;

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

      {activeVariant === "advanced" ? <section className="ote-training-section"><div className="ote-practice-set-grid"><button className="ote-practice-set-card" type="button" onClick={() => navigate(readingMockPath)}><Clock3 size={28} aria-hidden="true" /><span>Full mock test</span><h2>Advanced Reading Mock 1</h2><p>All four reading parts in sequence, followed by a read-only answer review.</p></button></div></section> : null}

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
                ) : part.id === "part-2-matching" && readingPartTwoSets.length ? (
                  <strong className="ote-reading-menu-progress">
                    {completedPartTwoSets}/{readingPartTwoSets.length} timed sets complete
                  </strong>
                ) : part.id === "part-3-gapped-text" && readingPartThreeSets.length ? (
                  <strong className="ote-reading-menu-progress">{completedPartThreeSets}/{readingPartThreeSets.length} timed sets complete</strong>
                ) : part.id === "part-4-long-text" && readingPartFourSets.length ? (
                  <strong className="ote-reading-menu-progress">{completedPartFourSets}/{readingPartFourSets.length} timed sets complete</strong>
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
