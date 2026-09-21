import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  FileAudio,
  GraduationCap,
  Headphones,
  Languages,
  Mic2,
  Radio,
  Sparkles,
  Users,
} from "lucide-react";
import Seo from "../common/Seo.jsx";
import "./TeacherResources.css";

const PRODUCT_GROUPS = [
  {
    id: "aptis",
    eyebrow: "Seif Aptis Trainer",
    title: "Aptis classroom resources",
    description:
      "Extra Aptis tasks kept outside the main learner journey. Resources are grouped by skill so it is clear which learner experience each link opens.",
    accent: "blue",
    skillGroups: [
      {
        title: "Reading",
        resources: [
          {
            title: "Reading Part 1 teacher tasks",
            description: "Five extra email gap-fill tasks for assignment, direct-link practice or a live teacher-paced lesson.",
            path: "/reading/part1-teacher",
            icon: BookOpen,
            tags: ["Assignable", "Direct link", "Live lessons"],
          },
          {
            title: "Reading Part 2 teacher tasks",
            description: "Eleven extra sentence-order texts for assignment, direct-link practice or a live teacher-paced lesson.",
            path: "/reading/part2-teacher",
            icon: BookOpen,
            tags: ["Assignable", "Direct link", "Live lessons"],
          },
          {
            title: "Reading Part 3 teacher tasks",
            description: "Five substantial matching-opinions tasks for assignment, direct-link practice or a live whole-class session.",
            path: "/reading/part3-teacher",
            icon: BookOpen,
            tags: ["Assignable", "Direct link", "Live lessons"],
          },
          {
            title: "Reading Part 4 teacher tasks",
            description: "Two substantial heading-matching texts for assignment, direct-link practice or a live whole-class session.",
            path: "/reading/part4-teacher",
            icon: BookOpen,
            tags: ["Assignable", "Direct link", "Live lessons"],
          },
        ],
      },
      {
        title: "Listening",
        resources: [
          {
            title: "Listening Part 2 · Using Customer Reviews",
            description: "Four-speaker matching task with full recording, answer feedback and transcript.",
            path: "/listening/part2-teacher/using-customer-reviews",
            icon: Headphones,
            tags: ["Direct link", "Speaker matching", "Live lesson"],
          },
          {
            title: "Listening Part 2 · Volunteering",
            description: "Four-speaker matching task with full recording, answer feedback and transcript.",
            path: "/listening/part2-teacher/volunteering",
            icon: Headphones,
            tags: ["Direct link", "Speaker matching", "Live lesson"],
          },
        ],
      },
      {
        title: "Writing",
        resources: [
          {
            title: "Writing Part 2 classroom topics",
            description: "Four extra short-response topics for assignment, direct-link practice or a live lesson.",
            path: "/teacher/writing?part=2",
            icon: GraduationCap,
            tags: ["Assignable", "Direct link", "Live lessons"],
          },
          {
            title: "Writing Part 3 classroom topics",
            description: "Four extra three-message topics for assignment, direct-link practice or a live lesson.",
            path: "/teacher/writing?part=3",
            icon: GraduationCap,
            tags: ["Assignable", "Direct link", "Live lessons"],
          },
          {
            title: "Writing Part 4 classroom topics",
            description: "Four extra email topics plus Register Surgery and Error Detective, all together in one Part 4 workspace.",
            path: "/teacher/writing?part=4",
            icon: GraduationCap,
            tags: ["Assignable", "Direct link", "Live lessons"],
          },
        ],
      },
      {
        title: "Speaking",
        resources: [
          {
            title: "Audio transcription & feedback",
            description: "Upload one recording or a speaking set, review transcripts, then request one task-aware AI feedback report.",
            path: "/teacher/transcription",
            icon: FileAudio,
            tags: ["Teacher tool", "Audio upload", "Optional feedback"],
          },
          {
            title: "Speaking Part 2 extra practice",
            description: "Six additional photo-description tasks with relaxed, timed exam and teacher-led modes.",
            path: "/speaking/part2-secret",
            icon: Mic2,
            tags: ["Relaxed practice", "Exam mode", "Teaching mode"],
          },
          {
            title: "Speaking Part 3 extra practice",
            description: "Five additional picture-comparison tasks with relaxed, timed exam and teacher-led modes.",
            path: "/speaking/part3-custom",
            icon: Mic2,
            tags: ["Relaxed practice", "Exam mode", "Teaching mode"],
          },
          {
            title: "Speaking Part 4 extra practice",
            description: "Five additional long-turn topics with relaxed, timed exam and teacher-led modes.",
            path: "/speaking/part4-extra",
            icon: Mic2,
            tags: ["Relaxed practice", "Exam mode", "Teaching mode"],
          },
          {
            title: "Similarities and differences picture sets",
            description: "Three classroom picture pairs with prompts, useful language and follow-up questions.",
            path: "/teacher/extras/speaking-part3-similarities",
            icon: Users,
            tags: ["Teacher view"],
          },
        ],
      },
    ],
  },
  {
    id: "ote",
    eyebrow: "OTE Seif",
    title: "OTE classroom resources",
    description:
      "Advanced reading and speaking extensions, plus teacher-controlled live activities. Student-facing resources are opened with a PIN or shared link.",
    accent: "violet",
    resources: [
      {
        title: "Advanced voicemail task bank",
        description: "Eight extra diplomatic voice-message tasks in two themed sets, with individual student links, timed recording and AI feedback.",
        path: "/ote/speaking/part-2-voicemails/teacher-bank",
        icon: Mic2,
        tags: ["Advanced Speaking", "Direct link", "8 tasks"],
      },
      {
        title: "Advanced summary task bank",
        description: "Two extra Part 3 summary tasks with individual student links, timed recording and AI feedback.",
        path: "/ote/speaking/part-3-summary/teacher-bank",
        icon: Mic2,
        tags: ["Advanced Speaking", "Assignable", "2 tasks"],
      },
      {
        title: "Advanced debate task bank",
        description: "Two extra Parts 4 and 5 debate-and-follow-up sets, with individual student links, timed recording and AI feedback.",
        path: "/ote/speaking/parts-4-5-debate/teacher-bank",
        icon: Mic2,
        tags: ["Advanced Speaking", "Assignable", "2 tasks"],
      },
      {
        title: "C1 gapped-text classroom sets",
        description: "Two extra Part 3 texts that do not count towards learner completion.",
        path: "/ote/reading/advanced/part-3-gapped-text",
        icon: BookOpen,
        tags: ["Advanced Reading", "Direct link"],
      },
      {
        title: "Classroom Cohesion Challenge",
        description: "Defend missing-sentence choices independently or turn the activity into a live PIN session.",
        path: "/ote/reading/advanced/part-3-gapped-text/classroom-cohesion-challenge",
        icon: Users,
        tags: ["Advanced Reading", "Independent", "Live"],
      },
      {
        title: "Why Free Things · live lesson",
        description: "Lead a class through gist, gap prediction, clue reveals, sentence placement and feedback.",
        path: "/ote/reading/advanced/part-3-gapped-text/live/free-things-lesson",
        icon: Radio,
        tags: ["Advanced Reading", "Live lesson"],
      },
      {
        title: "Part 4 live activities",
        description: "Launch Option Jury or Evidence Reveal with class answers and highlighted textual evidence.",
        path: "/ote/reading/advanced/part-4-long-text/live/option-jury",
        icon: Radio,
        tags: ["Advanced Reading", "Live lesson"],
      },
      {
        title: "Teacher-controlled Listening",
        description: "Choose an OTE Listening part and run an available set live, controlling playback and feedback.",
        path: "/ote/listening",
        icon: Headphones,
        tags: ["Listening", "Live lesson"],
      },
    ],
  },
  {
    id: "hub",
    eyebrow: "Seif Hub",
    title: "Seif Hub classroom resources",
    description:
      "Classroom games and activities from the wider Seif English learning hub.",
    accent: "amber",
    resources: [
      {
        title: "Spanglish Fix-It",
        description: "Run the Spanish-to-English correction game normally or create a teacher-hosted live round.",
        path: "/games/spanglish-fix-it?site=seifhub",
        icon: Languages,
        tags: ["Language game", "Independent", "Live"],
      },
    ],
  },
];

function ResourceCard({ resource }) {
  const Icon = resource.icon;

  return (
    <Link className="teacher-resource-card" to={resource.path}>
      <div className="teacher-resource-card-icon" aria-hidden="true">
        <Icon size={24} strokeWidth={2} />
      </div>
      <div className="teacher-resource-card-copy">
        <h3>{resource.title}</h3>
        <p>{resource.description}</p>
        <div className="teacher-resource-tags" aria-label="Resource features">
          {resource.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
      <ArrowRight className="teacher-resource-card-arrow" size={20} aria-hidden="true" />
    </Link>
  );
}

export default function TeacherResources({ user }) {
  const isTeacher = user?.role === "teacher" || user?.role === "admin";

  if (!isTeacher) {
    return (
      <main className="teacher-resources-page game-wrapper">
        <Seo
          title="Teacher Resources | Seif English"
          description="Classroom activities and teacher-led resources across Seif English products."
        />
        <section className="teacher-resources-denied">
          <GraduationCap size={34} aria-hidden="true" />
          <h1>Teacher resources</h1>
          <p>This page is available to teacher and administrator accounts.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="teacher-resources-page game-wrapper">
      <Seo
        title="Teacher Resources | Seif English"
        description="Classroom activities and teacher-led resources across Seif English products."
      />

      <header className="teacher-resources-hero">
        <div className="teacher-resources-hero-icon" aria-hidden="true">
          <GraduationCap size={35} strokeWidth={1.8} />
        </div>
        <div>
          <p className="teacher-resources-kicker">Teacher workspace</p>
          <h1>Classroom resources</h1>
          <p>
            Ready-made activities for lessons, assignments and live class sessions.
            Resources are separated by product so you always know which student experience you are opening.
          </p>
        </div>
        <Sparkles className="teacher-resources-sparkle" size={28} aria-hidden="true" />
      </header>

      <nav className="teacher-resources-jump" aria-label="Resource product sections">
        <span>Jump to</span>
        {PRODUCT_GROUPS.map((group) => (
          <a key={group.id} href={`#${group.id}`}>{group.eyebrow}</a>
        ))}
      </nav>

      <div className="teacher-resources-products">
        {PRODUCT_GROUPS.map((group) => (
          <section
            className={`teacher-resource-product is-${group.accent}`}
            id={group.id}
            key={group.id}
          >
            <header className="teacher-resource-product-header">
              <p>{group.eyebrow}</p>
              <h2>{group.title}</h2>
              <span>{group.description}</span>
            </header>
            {group.skillGroups ? group.skillGroups.map((skillGroup) => (
              <section className="teacher-resource-skill-group" key={skillGroup.title}>
                <h3>{skillGroup.title}</h3>
                <div className="teacher-resource-grid">
                  {skillGroup.resources.map((resource) => (
                    <ResourceCard key={resource.path} resource={resource} />
                  ))}
                </div>
              </section>
            )) : (
              <div className="teacher-resource-grid">
                {group.resources.map((resource) => (
                  <ResourceCard key={resource.path} resource={resource} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
