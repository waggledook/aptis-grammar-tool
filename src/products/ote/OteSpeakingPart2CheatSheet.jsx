import React, { useEffect } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted } from "../../firebase.js";
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

const advancedFrames = [
  {
    title: "Open the Message",
    lines: [
      "Hello, [name]. It's [your name]. I'm calling about...",
      "Hi, [name]. I wanted to speak to you about...",
      "Good afternoon, [name]. I'm getting in touch regarding...",
      "I'm calling because I need to discuss...",
    ],
  },
  {
    title: "Acknowledge the Situation",
    lines: [
      "I understand that this is important because...",
      "I appreciate that you need...",
      "I realize that this may cause some difficulty.",
      "I completely understand your concern about...",
      "Thank you for asking me to...",
    ],
  },
  {
    title: "Explain the Problem Diplomatically",
    lines: [
      "I'm afraid I won't be able to...",
      "Unfortunately, I need to...",
      "I'm sorry, but I can't agree to...",
      "I was slightly concerned to notice that...",
      "The main difficulty is that...",
    ],
  },
  {
    title: "Suggest a Way Forward",
    lines: [
      "Would it be possible to...?",
      "Perhaps we could...",
      "One possible solution would be to...",
      "I could... instead.",
      "Please let me know what you think.",
      "Thanks for understanding.",
    ],
  },
];

const advancedToolkit = [
  {
    title: "Refusing a Request",
    lines: [
      "I'm afraid I won't be able to do that because...",
      "I'd prefer not to... as...",
      "Unfortunately, that won't be possible because...",
      "I completely understand why you asked, but...",
    ],
  },
  {
    title: "Requesting a Change",
    lines: [
      "I was wondering whether we could...",
      "Would it be possible to change...?",
      "Could we perhaps arrange... instead?",
      "Would you mind if we...?",
    ],
  },
  {
    title: "Raising a Concern",
    lines: [
      "I wanted to mention a concern about...",
      "I was slightly worried to discover that...",
      "It may be worth checking... before...",
      "I'm concerned that this could...",
    ],
  },
  {
    title: "Offering Help or a Compromise",
    lines: [
      "I'd be happy to help with...",
      "I could... instead, if that would be useful.",
      "Perhaps we could divide the work.",
      "One option might be to...",
      "I hope this would make the situation easier.",
    ],
  },
];

const advancedExamples = [
  {
    label: "Example 1",
    title: "Unable to Give a Presentation",
    task: "Your manager has asked you to give an important client presentation. Explain why it matters, why you cannot give it and who should replace you.",
    focus: "Refuse responsibly and offer a strong alternative",
    answer:
      "Hello, Mr Chapman. I'm calling about the client presentation. I understand how important it is because it could affect whether they choose to work with us. Unfortunately, I won't be able to give it because I have an urgent medical appointment that cannot be changed. Would it be possible for Elena Ruiz to present instead? She has worked closely on the project, knows the client's needs and has given similar presentations before. I'd be happy to help her prepare the slides today. Please let me know what you think.",
  },
  {
    label: "Example 2",
    title: "Cancelling a Meeting with a Tutor",
    task: "You need to cancel a meeting about your poor attendance. Explain why, acknowledge the attendance problem and suggest what to do next.",
    focus: "Show that you are taking the problem seriously",
    answer:
      "Hello, Dr Evans. I'm sorry, but I need to cancel our meeting this afternoon because I've been asked to cover an urgent shift at work. I completely understand that my recent attendance is a serious issue, and I'd like to explain the situation properly rather than avoid the conversation. Could we rearrange the meeting for tomorrow morning or Thursday afternoon? I'll also bring the documents that explain the classes I've missed. I'm sorry for the short notice, and I hope one of those times is convenient for you.",
  },
  {
    label: "Example 3",
    title: "Refusing to Lend a Laptop",
    task: "Another student wants to borrow your laptop for an important assignment. Explain why you cannot lend it and suggest another solution.",
    focus: "Refuse without sounding unhelpful",
    answer:
      "Hi, Daniel. I'm calling about your request to borrow my laptop. I'm sorry yours has broken, especially when you have an important assignment to finish. Unfortunately, I can't lend you mine for several days because I need it for my own coursework and work meetings. You could ask the college library whether they have a laptop available, or speak to your tutor about getting a short extension. I can also help you transfer your files or find a computer room. I hope you manage to sort it out.",
  },
  {
    label: "Example 4",
    title: "Negotiating a Schedule Change",
    task: "Your manager has asked you to work on Saturday because several employees are ill. Acknowledge the problem, explain why you cannot work and suggest a compromise.",
    focus: "Show understanding before explaining your difficulty",
    answer:
      "Hello, Karen. I'm calling about the change to my schedule. I understand that several people are ill and that the company needs extra help during this busy period. However, I'm afraid I can't work this Saturday because I have an important family commitment that was arranged several months ago. Would it be possible for me to take the Sunday shift instead, or work extra hours on Friday? I'm happy to help in another way, and I hope we can find an arrangement that works for the team.",
  },
];

const advancedPlanning = [
  ["Who?", "Are you speaking to a manager, tutor, colleague or student?"],
  ["What is difficult?", "Are you refusing, cancelling, disagreeing or raising a concern?"],
  ["What are the three prompts?", "Plan one short idea for each bullet point."],
  ["What is the solution?", "Choose a practical alternative, compromise or next step."],
];

const advancedReminders = [
  "Cover all three prompts.",
  "Match your tone to the listener.",
  "Acknowledge the other person's situation.",
  "State the difficult point clearly.",
  "Give a reason, not just an apology.",
  "Suggest a practical next step.",
  "Use your own words rather than repeating the task.",
  "Keep the message spoken and natural.",
  "Aim to speak for most of the 40 seconds.",
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

function AdvancedCheatSheetContent() {
  return (
    <>
      <header className="ote-reference-hero">
        <img src="/images/seif-ote-trainer-logo.png" alt="Seif OTE Trainer" />
        <div>
          <p className="ote-kicker">Advanced Speaking Part 2</p>
          <h1>The Diplomatic Voice Message Cheat Sheet</h1>
          <p>
            A quick reference for building a clear, polite 40-second voice message in a college or workplace situation.
          </p>
          <p className="ote-reference-timing">1 message · 10 seconds to prepare · 40 seconds to speak · 3 prompts</p>
        </div>
      </header>

      <FrameSection
        eyebrow="Framework"
        title="The 40-Second Framework"
        description="Use the three task prompts as your content plan. These phrases help you connect them naturally."
        frames={advancedFrames}
      />

      <FrameSection
        eyebrow="Toolkit"
        title="The Diplomatic Language Toolkit"
        description="A manager or tutor normally needs a more formal tone. A colleague or student can sound more natural, but still respectful."
        frames={advancedToolkit}
      />

      <section className="ote-reference-section">
        <div className="ote-reference-section-head">
          <span>Clarity</span>
          <h2>Diplomatic Does Not Mean Unclear</h2>
          <p>A strong answer protects the relationship and makes the problem and next step clear.</p>
        </div>
        <div className="ote-reference-example-grid">
          <article className="ote-reference-example">
            <span>Too direct</span>
            <blockquote>I can't do the presentation. Ask Elena.</blockquote>
            <span>Better</span>
            <blockquote>
              I'm afraid I won't be able to give the presentation because I have an urgent appointment. Would it be possible for Elena to do it instead? She already knows the client and has worked closely on the project.
            </blockquote>
          </article>
          <article className="ote-reference-example">
            <span>Too vague</span>
            <blockquote>There might possibly be a small problem with the report.</blockquote>
            <span>Better</span>
            <blockquote>
              I'm slightly concerned that some of the figures in the report may be inaccurate. Could we check them together before it is sent to the client?
            </blockquote>
          </article>
        </div>
      </section>

      <section className="ote-reference-section">
        <div className="ote-reference-section-head">
          <span>Plan</span>
          <h2>Your 10-Second Plan</h2>
          <p>Do not try to write a complete script. Use short keywords and begin speaking as soon as recording starts.</p>
        </div>
        <div className="ote-reference-frame-grid">
          {advancedPlanning.map(([title, text], index) => (
            <article key={title} className="ote-reference-frame">
              <strong>{index + 1}</strong>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ote-reference-section">
        <div className="ote-reference-section-head">
          <span>Examples</span>
          <h2>Put the Frameworks to Use</h2>
          <p>Notice how each answer acknowledges the situation, explains the difficulty, and offers a practical next step.</p>
        </div>
        <div className="ote-reference-example-grid">
          {advancedExamples.map((example) => (
            <article key={example.title} className="ote-reference-example">
              <span>{example.label}</span>
              <h3>{example.title}</h3>
              <p>
                <strong>Task:</strong> {example.task}
              </p>
              <p>
                <strong>Focus:</strong> {example.focus}
              </p>
              <blockquote>{example.answer}</blockquote>
            </article>
          ))}
        </div>
      </section>

      <section className="ote-reference-section">
        <div className="ote-reference-section-head">
          <span>Final reminders</span>
          <h2>Before You Record</h2>
        </div>
        <ul className="ote-reference-reminders">
          {advancedReminders.map((reminder) => (
            <li key={reminder}>{reminder}</li>
          ))}
        </ul>
      </section>

      <footer className="ote-reference-footer">
        <span>Seif English Academy</span>
        <span>OTE Advanced Speaking Part 2 Reference</span>
      </footer>
    </>
  );
}

function GeneralCheatSheetContent() {
  return (
    <>
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
    </>
  );
}

export default function OteSpeakingPart2CheatSheet({ nativeRoutes = false, user = null }) {
  const navigate = useNavigate();
  const menuPath = getSitePath(nativeRoutes ? "/speaking/part-2-voicemails" : "/ote/speaking/part-2-voicemails");
  const isAdvanced = user?.oteVersion === "advanced";

  useEffect(() => {
    document.body.classList.add("ote-reference-print-mode");
    return () => document.body.classList.remove("ote-reference-print-mode");
  }, []);

  useEffect(() => {
    logOteTrainingCompleted({
      progressId: isAdvanced ? "speaking.part2.advanced-cheat-sheet" : "speaking.part2.cheat-sheet",
      section: "speaking",
      part: "part-2",
      mode: isAdvanced ? "advanced_cheat_sheet" : "cheat_sheet",
      taskTitle: isAdvanced ? "Advanced diplomatic voice message cheat sheet" : "Part 2 voicemail cheat sheet",
    });
  }, [isAdvanced]);

  return (
    <main className="ote-training-page ote-reference-page">
      <Seo
        title={isAdvanced ? "OTE Advanced Speaking Part 2 Cheat Sheet | Seif English" : "OTE Speaking Part 2 Cheat Sheet | Seif English"}
        description={
          isAdvanced
            ? "A printable reference for Advanced OTE Speaking Part 2 diplomatic voice messages."
            : "A printable reference for OTE Speaking Part 2 voicemail frameworks and model phrases."
        }
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
        {isAdvanced ? <AdvancedCheatSheetContent /> : <GeneralCheatSheetContent />}
      </article>
    </main>
  );
}
