import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Lightbulb,
  Mic,
  Play,
  Sparkles,
  Timer,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const taskPrompts = [
  "independent learning",
  "academic results",
  "student motivation",
  "accessibility",
  "social pressure",
];

const debateStatement = "Universities should make attendance at lectures optional.";

const weakAnswers = [
  {
    id: "list-maker",
    name: "Elena",
    example: "Student Example 1",
    label: "The List Maker",
    answer:
      "I think universities should make attendance optional. Independent learning is important. Academic results are important too. Student motivation is also important. Accessibility is important because some people cannot go. Social pressure is also a thing. So yes, I agree.",
    problem: "Elena tries to use all five prompts, but she does not really develop any of them.",
    feedback:
      "A list of prompts is not the same as an argument. In this task, it is usually better to choose two strong prompts and develop them properly.",
    better:
      "I would argue in favour of making attendance optional, especially because it encourages independent learning. At university level, students need to learn how to manage their time and take responsibility for their progress. If they are forced to attend every lecture, they may become passive rather than genuinely engaged.",
  },
  {
    id: "fence-sitter",
    name: "Marcos",
    example: "Student Example 2",
    label: "The Fence-Sitter",
    answer:
      "Well, I suppose there are good arguments on both sides. On the one hand, university students are adults, so maybe they should be free to decide whether a lecture is useful for them or not. Some people learn better alone, and some students have jobs or family responsibilities, so compulsory attendance might be unfair in some cases. But on the other hand, lectures are also important because students can ask questions and follow the course more easily. If attendance is optional, some students might miss too many classes and then have problems with their academic results. So I think attendance can be useful, but optional attendance can also be useful. It really depends on the student, the subject and the teacher.",
    problem: "Marcos gives several relevant ideas, but he never really puts a case forward.",
    feedback:
      "A balanced answer is fine, but this is a debate. The listener needs to know which side you are arguing for. You can acknowledge the other side briefly, but your own position should control the answer.",
    better:
      "Although compulsory attendance can help some students stay organized, I would still argue that attendance should be optional. At university level, students should be treated as adults and given responsibility for their own learning. This does not mean that lectures are unimportant; it means that students should be trusted to decide when attending in person is genuinely necessary.",
  },
  {
    id: "underdeveloped",
    name: "Sara",
    example: "Student Example 3",
    label: "The One-Point Answer",
    answer:
      "I disagree with the statement because attendance is very important for academic results. If students stop going to lectures, they may miss explanations from the teacher, and then they might not understand the subject properly. This is especially true in difficult courses, where one topic is connected to the next. For example, if a student misses several lectures at the beginning of term, they may feel lost later and get worse marks in the exam. So, in my opinion, attendance should not be optional because students need to go to class if they want to do well.",
    problem: "Sara has a clear position and one relevant argument, but the answer depends too heavily on a single point.",
    feedback:
      "This is a good start, but a two-minute debate needs more range. Sara should add a second developed idea, use clearer transitions, and possibly acknowledge the strongest argument on the other side before returning to her position.",
    better:
      "I would argue against the statement because making lectures optional could seriously affect academic results. Many students believe they can study independently, but in practice they may miss explanations, examples and opportunities to ask questions. A further concern is motivation: if attendance is completely optional, some students may gradually stop going, not because they have a better learning strategy, but because they lack structure.",
  },
];

const planningSteps = [
  {
    title: "1. Choose your side",
    body: "Do not search for your perfect personal opinion. Choose the side you can argue clearly under time pressure.",
    extra: "For optional attendance: independence, flexibility, accessibility. Against optional attendance: academic results, motivation, discipline.",
  },
  {
    title: "2. Choose two or three prompts",
    body: "Do not choose the best prompts in theory. Choose the prompts you can actually develop.",
    extra: "A narrow, developed answer is usually stronger than a quick tour of all five ideas.",
  },
  {
    title: "3. Add support",
    body: "For each prompt, add one reason, consequence, example, contrast, or limitation.",
    extra: "This turns a point into an argument.",
  },
  {
    title: "4. Plan your final sentence",
    body: "Your conclusion does not need to be long. It just needs to bring the argument back to your position.",
    extra: "Avoid adding a brand-new idea at the end.",
  },
];

const timePlan = [
  {
    time: "00:00-00:15",
    stage: "Position",
    action: "Say clearly whether you are for or against the statement.",
    language: "I would argue in favour of this statement because...",
  },
  {
    time: "00:15-00:50",
    stage: "Point 1",
    action: "Introduce and develop your first prompt.",
    language: "The first issue to consider is... This matters because...",
  },
  {
    time: "00:50-01:25",
    stage: "Point 2",
    action: "Move to your second prompt and support it.",
    language: "A further point is... This could lead to...",
  },
  {
    time: "01:25-01:45",
    stage: "Counterargument or third point",
    action: "Add another prompt or briefly respond to the opposite view.",
    language: "Of course, some people might argue that... However...",
  },
  {
    time: "01:45-02:00",
    stage: "Conclusion",
    action: "Restate your position clearly.",
    language: "Taking these points into account, I would argue that...",
  },
];

const languageGroups = [
  {
    title: "Taking a Position",
    phrases: [
      "I would argue in favour of this statement.",
      "I broadly agree with this view.",
      "I do not believe this would be a positive development.",
      "My position is that attendance should remain compulsory.",
    ],
  },
  {
    title: "Developing a Point",
    phrases: [
      "This is important because...",
      "One possible consequence is that...",
      "In practical terms, this means that...",
      "A good example of this would be...",
    ],
  },
  {
    title: "Adding Precision",
    phrases: [
      "This is especially true for...",
      "This does not necessarily mean that...",
      "The key issue is not simply..., but...",
      "In the long term, this could...",
    ],
  },
  {
    title: "Counterargument",
    phrases: [
      "Of course, there is a reasonable argument on the other side.",
      "Some people might say that...",
      "While this may be true in some cases,...",
      "However, this argument overlooks...",
    ],
  },
  {
    title: "Conclusion",
    phrases: [
      "Overall, I would argue that...",
      "For these reasons, I believe that...",
      "Taking these points into account,...",
      "Therefore, I think the strongest case is...",
    ],
  },
];

const modelAnswer = [
  "I would argue against the idea that universities should make attendance at lectures optional. Although students at university level should certainly become more independent, I think regular attendance still plays an important role in academic success.",
  "The first issue to consider is academic results. Many students believe they can simply read the material at home or watch a recording later, but lectures often provide explanations, examples and connections that are not obvious from the notes alone. This is especially true in complex subjects, where missing several sessions can make it much harder to follow the course as a whole.",
  "A second important point is student motivation. If attendance is completely optional, some students may gradually stop going, not because they have a better learning strategy, but because they are tired, busy or poorly organized. In that sense, compulsory attendance can provide a useful structure, particularly for younger students who are still adapting to university life.",
  "Of course, there are cases where flexibility is necessary, for example for students with health problems, work responsibilities or long journeys. However, I think this should be handled through reasonable exceptions rather than by making attendance optional for everyone.",
  "Overall, while independent learning is important, I believe universities should continue to expect students to attend lectures because it supports both academic progress and long-term study habits.",
];

export default function OteSpeakingPart45DebateGuidedTask({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [expandedStudent, setExpandedStudent] = useState("");
  const [showModel, setShowModel] = useState(false);
  const completedLoggedRef = useRef(false);
  const menuPath = getSitePath(nativeRoutes ? "/speaking/parts-4-5-debate" : "/ote/speaking/parts-4-5-debate");
  const practicePath = getSitePath(nativeRoutes ? "/speaking/parts-4-5-debate/practice" : "/ote/speaking/parts-4-5-debate/practice");

  function toggleStudent(studentId) {
    setExpandedStudent((current) => (current === studentId ? "" : studentId));
  }

  useEffect(() => {
    if (completedLoggedRef.current || !showModel) return;
    completedLoggedRef.current = true;
    logOteTrainingCompleted({
      progressId: "speaking.parts45.advanced-debate-guided-task",
      section: "speaking",
      part: "parts-4-5",
      mode: "advanced_debate_guided_task",
      taskTitle: "Guided Task: The Debate Builder",
      completed: true,
    });
  }, [showModel]);

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Advanced Speaking Part 4 Guided Debate Task | Seif English"
        description="Build an OTE Advanced debate response by analyzing weak answers, planning a two-minute argument, and comparing with a model."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to debate training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Activity 2</p>
        <h1>Guided Task: The Debate Builder</h1>
        <p>
          Study an Advanced debate task, diagnose three student answers, then use a four-part
          structure to prepare and record your own two-minute response.
        </p>
      </header>

      <section className="ote-guided-task-card">
        <div className="ote-debate-map ote-native-debate-map ote-guided-debate-map" aria-label="Example debate task">
          <div className="ote-debate-map-instructions">
            <p>Your tutor has asked you to take part in a class debate. You are going to put a case for or against the following statement:</p>
            <p><strong>{debateStatement}</strong></p>
            <p>Prepare your case for the debate. You should:</p>
            <ul>
              <li>use two or three of the ideas below to argue your case;</li>
              <li>provide support for the ideas you choose;</li>
              <li>give a conclusion.</li>
            </ul>
            <p>You now have 45 seconds to prepare. You can make notes if you wish.</p>
          </div>
          <div className="ote-debate-center">{debateStatement}</div>
          {taskPrompts.map((prompt, index) => (
            <div key={prompt} className={`ote-debate-idea idea-${index + 1}`}>
              {prompt}
            </div>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Analyze the Problems</h2>
        <p className="ote-section-lead">
          Read each answer first. What would limit the score? Open the card when you are ready to check.
        </p>
        <div className="ote-student-answer-list">
          {weakAnswers.map((item) => (
            <article key={item.id} className={`ote-student-answer-card ${expandedStudent === item.id ? "is-open" : ""}`}>
              <button
                className="ote-student-answer-toggle"
                type="button"
                onClick={() => toggleStudent(item.id)}
                aria-expanded={expandedStudent === item.id}
              >
                <span>{item.example}</span>
                <strong>{item.name}'s answer</strong>
                <ChevronDown size={20} aria-hidden="true" />
              </button>
              <blockquote>"{item.answer}"</blockquote>
              {expandedStudent === item.id ? (
                <div className="ote-student-answer-detail">
                  <h3>The problem: {item.label}</h3>
                  <p>{item.problem}</p>
                  <p>{item.feedback}</p>
                  <div className="ote-mini-challenge">
                    <strong>
                      <Lightbulb size={16} aria-hidden="true" />
                      Better version
                    </strong>
                    <p>{item.better}</p>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>The 45-Second Planning Challenge</h2>
        <p className="ote-section-lead">
          In the real task, your notes need to be tiny. Think in decisions, not sentences.
        </p>
        <div className="ote-training-rule-grid">
          {planningSteps.map((step) => (
            <article key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <p>{step.extra}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Two-Minute Structure</h2>
        <p className="ote-section-lead">
          Use the timings as a guide, not a script. The aim is to stop one point swallowing the whole answer.
        </p>
        <div className="ote-training-compare" role="table" aria-label="Two-minute debate structure">
          <div className="ote-training-compare-head" role="row">
            <span role="columnheader">Time</span>
            <span role="columnheader">Stage</span>
            <span role="columnheader">What to do</span>
          </div>
          {timePlan.map((stage) => (
            <div className="ote-training-compare-row" role="row" key={stage.time}>
              <span role="cell"><strong>{stage.time}</strong></span>
              <span role="cell">{stage.stage}</span>
              <span role="cell">{stage.action}<br /><em>{stage.language}</em></span>
            </div>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Useful Debate Language</h2>
        <div className="ote-training-rule-grid">
          {languageGroups.map((group) => (
            <article key={group.title}>
              <h3>{group.title}</h3>
              <ul className="ote-practice-bullets">
                {group.phrases.map((phrase) => <li key={phrase}>{phrase}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <div className="ote-recorder-card">
          <div className="ote-recorder-top">
            <div>
              <p className="ote-kicker">Your turn</p>
              <h2>Record Your Debate</h2>
              <p>Use the practice sets for the timed recorder. Before you start, check your plan against these points.</p>
            </div>
            <div className="ote-recorder-timer is-ready" aria-label="Task timing">
              <Timer size={22} aria-hidden="true" />
              <strong>2:00</strong>
              <span>Speaking time</span>
            </div>
          </div>
        <div className="ote-training-rule-grid">
          <article>
            <h3>Before you start</h3>
            <ul className="ote-practice-bullets">
              <li>Have you chosen for or against?</li>
              <li>Have you chosen two or three prompts?</li>
              <li>Can you support each point?</li>
              <li>Do you have a final sentence?</li>
            </ul>
          </article>
          <article>
            <h3>After recording</h3>
            <ul className="ote-practice-bullets">
              <li>Did you state your position quickly?</li>
              <li>Did you develop your ideas, or just list them?</li>
              <li>Did you use clear transitions?</li>
              <li>Did you finish with a conclusion?</li>
              <li>Did you keep speaking for most of the two minutes?</li>
            </ul>
          </article>
        </div>
          <button className="ote-training-primary-link" type="button" onClick={() => navigate(practicePath)}>
            <Mic size={17} aria-hidden="true" />
            Open timed debate practice
          </button>
        </div>
      </section>

      <section className="ote-training-section">
        <div className="ote-model-card">
          <div>
            <p className="ote-kicker">Model answer</p>
            <h2>Compare Your Answer</h2>
            <p>
              Try planning or recording first, then open the model. Notice how it chooses a clear side,
              develops two main prompts, briefly acknowledges the other side, and finishes cleanly.
            </p>
          </div>
          <button type="button" onClick={() => setShowModel(true)} disabled={showModel}>
            <Play size={18} aria-hidden="true" />
            Show model
          </button>
        </div>

        {showModel ? (
          <div className="ote-model-answer">
            {modelAnswer.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <div className="ote-model-why">
              <p><strong>Clear position:</strong> the answer argues against optional attendance from the first sentence.</p>
              <p><strong>Selected prompts:</strong> it develops academic results and student motivation instead of listing all five ideas.</p>
              <p><strong>Controlled concession:</strong> it acknowledges flexibility, then explains why exceptions are better than a general rule.</p>
            </div>
          </div>
        ) : null}
      </section>

      <section className="ote-training-section">
        <h2>How Part 5 Connects</h2>
        <p>
          After the debate, you answer four audio-only follow-up questions. Question 1 stays close
          to the debate topic, while later questions usually move into wider related issues.
        </p>
        <ul className="ote-practice-bullets">
          <li>Answer the exact question you hear.</li>
          <li>Make your opinion clear quickly.</li>
          <li>Add a reason, example, consequence or limitation.</li>
          <li>Do not simply repeat your Part 4 debate speech.</li>
        </ul>
      </section>

      <section className="ote-training-section">
        <h2>Final Check</h2>
        <p className="ote-section-lead">
          Use this as a self-check after planning or recording. It is more useful here than a second strategy quiz.
        </p>
        <ul className="ote-practice-bullets">
          <li>Can I choose a clear side quickly?</li>
          <li>Can I select two or three useful prompts?</li>
          <li>Can I support each point with a reason, example or consequence?</li>
          <li>Can I organize a two-minute debate with a conclusion?</li>
          <li>Can I briefly acknowledge the other side without losing my position?</li>
          <li>Can I avoid turning the prompts into a checklist?</li>
        </ul>
        <button className="ote-training-primary-link" type="button" onClick={() => navigate(practicePath)}>
          <Sparkles size={17} aria-hidden="true" />
          Open Advanced debate practice
        </button>
      </section>
    </main>
  );
}
