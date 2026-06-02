import React, { useEffect } from "react";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const messageOneFrames = [
  {
    title: "Opening the Call",
    lines: [
      "Hello, my name is... and I'm calling about...",
      "Good morning/afternoon. My name is... and I'm a student/member at your...",
      "I'm getting in touch because I need to change my plans for...",
    ],
  },
  {
    title: "Stating the Issue",
    lines: [
      "Unfortunately, something has come up and I can't make it to...",
      "I'm afraid I won't be able to come tomorrow because...",
      "I'm calling because I think I've lost my...",
    ],
  },
  {
    title: "Asking for Help",
    lines: [
      "Could you please let me know how I can...?",
      "I was wondering if it might be possible to change this to...?",
      "Could you tell me what I need to do about...?",
    ],
  },
  {
    title: "Polite Sign-off",
    lines: [
      "Thanks a lot for your help. Goodbye.",
      "Please give me a call back when you have a moment. Thanks!",
      "I look forward to hearing from you soon. Goodbye.",
    ],
  },
];

const messageTwoFrames = [
  {
    title: "React to the Audio",
    lines: [
      "Hey [Name]! Great to hear from you! / Thanks for the message!",
      "Oh no! I'm so sorry to hear you're having a tough time with...",
      "That sounds like an awesome plan, count me in!",
    ],
  },
  {
    title: "Move to the Bullet Points",
    lines: ["About what you said regarding the...", "As for your question about the...", "In terms of the..."],
  },
  {
    title: "Give Advice or Preference",
    lines: [
      "If I were you, I'd definitely look into...",
      "To be honest, I'm not a huge fan of... so I'd much rather...",
      "You should absolutely try... because it's a great way to...",
    ],
  },
  {
    title: "Suggest Something Together",
    lines: [
      "Why don't we meet up outside the... around [time] on [day]?",
      "How about we get there a bit earlier so we can grab a bite to eat first?",
      "Let me know if that time works for you, or if you prefer to...",
    ],
  },
];

const examples = [
  {
    label: "Message 1",
    title: "Cancelling a Lesson with a Tutor",
    task: "You have to cancel your private English lesson today because you have transport problems.",
    focus: "Focus on an alternative day",
    answer:
      "Hello, my name is David and I'm calling about our English lesson today. Unfortunately, something has come up and I can't make it to the class because my car broke down. I was wondering if it might be possible to change this to Thursday afternoon instead? Please give me a call back when you have a moment. Thanks!",
  },
  {
    label: "Message 1",
    title: "Rescheduling a Session",
    task: "You cannot attend your lesson tomorrow because of a train strike.",
    focus: "Focus on a direct question",
    answer:
      "Good afternoon. My name is Anna Blanco and I'm a student at your academy. I'm afraid I won't be able to come tomorrow because of a train strike. Could you please let me know how I can reschedule this session? Thanks a lot for your help. Goodbye.",
  },
  {
    label: "Message 2",
    title: "Weekend Study Plans",
    task: "Your friend wants to study at a busy cafe. You prefer the library. Suggest a time to meet.",
    focus: "Focus on smooth transitions",
    answer:
      "Hey Jo! Thanks for the message! That sounds like an awesome plan, count me in! About what you said regarding the place to study, to be honest, I'm not a huge fan of that cafe because it gets really noisy, so I'd much rather go to the city library instead. Why don't we meet up outside the main gates around ten o'clock on Saturday? Let me know if that time works for you! Bye!",
  },
  {
    label: "Message 2",
    title: "A More Collaborative Reply",
    task: "Your friend wants to study at a busy cafe. You prefer the library. Suggest a time to meet.",
    focus: "Focus on a collaborative twist",
    answer:
      "Hi Jo! Great to hear from you! I really need to study too. As for your question about where to go, if I were you, I'd definitely look into using the library study rooms instead of the cafe. How about we get there a bit earlier so we can grab a bite to eat first? Let me know if you prefer to do something else. See ya!",
  },
];

function FrameSection({ eyebrow, title, description, frames }) {
  return (
    <section className="ote-reference-section">
      <div className="ote-reference-section-head">
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="ote-reference-frame-grid">
        {frames.map((frame, index) => (
          <article key={frame.title} className="ote-reference-frame">
            <strong>{index + 1}</strong>
            <h3>{frame.title}</h3>
            <ul>
              {frame.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function OteSpeakingPart2CheatSheet({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const menuPath = getSitePath(nativeRoutes ? "/speaking/part-2-voicemails" : "/ote/speaking/part-2-voicemails");

  useEffect(() => {
    document.body.classList.add("ote-reference-print-mode");
    return () => document.body.classList.remove("ote-reference-print-mode");
  }, []);

  return (
    <main className="ote-training-page ote-reference-page">
      <Seo
        title="OTE Speaking Part 2 Cheat Sheet | Seif English"
        description="A printable reference for OTE Speaking Part 2 voicemail frameworks and model phrases."
      />

      <div className="ote-reference-toolbar no-print">
        <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
          <ArrowLeft size={18} aria-hidden="true" />
          Back to voicemail training
        </button>
        <button className="ote-reference-download" type="button" onClick={() => window.print()}>
          <Download size={18} aria-hidden="true" />
          Download PDF
        </button>
      </div>

      <article className="ote-reference-print">
        <header className="ote-reference-hero">
          <img src="/images/seif-ote-trainer-logo.png" alt="Seif OTE Trainer" />
          <div>
            <p className="ote-kicker">Speaking Part 2</p>
            <h1>The Spoken Framework Cheat Sheet</h1>
            <p>
              A quick reference for building clear 40-second voicemail answers in both Part 2 task
              types.
            </p>
          </div>
        </header>

        <FrameSection
          eyebrow="Message 1"
          title="Transactional / Polite Frameworks"
          description="Use these when calling a manager, teacher, receptionist, or business owner. Keep it polite, helpful, and natural."
          frames={messageOneFrames}
        />

        <FrameSection
          eyebrow="Message 2"
          title="Interpersonal / Informal Frameworks"
          description="Use these when replying to a classmate, colleague, or close friend. Keep it relaxed, warm, and conversational."
          frames={messageTwoFrames}
        />

        <section className="ote-reference-section">
          <div className="ote-reference-section-head">
            <span>Examples</span>
            <h2>Put the Prompts to Use</h2>
            <p>Choose frames that match the task, then add small details so the message feels natural.</p>
          </div>
          <div className="ote-reference-example-grid">
            {examples.map((example) => (
              <article key={`${example.title}-${example.focus}`} className="ote-reference-example">
                <span>{example.label}</span>
                <h3>{example.title}</h3>
                <p>
                  <strong>Task:</strong> {example.task}
                </p>
                <p>
                  <strong>{example.focus}:</strong>
                </p>
                <blockquote>{example.answer}</blockquote>
              </article>
            ))}
          </div>
        </section>

        <footer className="ote-reference-footer">
          <span>Seif English Academy</span>
          <span>OTE Speaking Part 2 Reference</span>
        </footer>
      </article>
    </main>
  );
}
