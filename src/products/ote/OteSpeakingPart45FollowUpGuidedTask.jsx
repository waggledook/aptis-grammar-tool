import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Lightbulb,
  MessageCircleQuestion,
  Play,
  Sparkles,
  Timer,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const followUpQuestions = [
  {
    id: "q1",
    label: "Question 1",
    type: "Opinion + qualification",
    prompt: "Your debate was about attendance at lectures. Do you think students learn better when they have more freedom?",
    skill: "Give a clear view, but avoid being too absolute.",
  },
  {
    id: "q2",
    label: "Question 2",
    type: "Evaluation",
    prompt: "Some people say online lectures make university more accessible. What do you think?",
    skill: "Discuss benefits and possible limits.",
  },
  {
    id: "q3",
    label: "Question 3",
    type: "Abstract explanation",
    prompt: "In what ways can universities help students become more independent?",
    skill: "Give two general ideas with examples.",
  },
  {
    id: "q4",
    label: "Question 4",
    type: "Hypothetical",
    prompt: "Imagine you were responsible for improving student motivation at a university. What changes would you make?",
    skill: "Use conditional language and propose actions.",
  },
];

const answerShape = [
  {
    title: "1. Direct answer",
    body: "Answer the question immediately.",
    phrases: ["Yes, to some extent.", "I think it depends on the student.", "If I were responsible for this, I would..."],
  },
  {
    title: "2. Reason",
    body: "Explain why.",
    phrases: ["The main reason is that...", "This matters because...", "One problem is that..."],
  },
  {
    title: "3. Development",
    body: "Add one extra layer.",
    phrases: ["For example...", "On the other hand...", "The risk is that..."],
  },
];

const weakAnswers = [
  {
    id: "too-short",
    label: "Weak answer 1",
    title: "Too short",
    question: "Do you think students learn better when they have more freedom?",
    answer: "Yes, I think so. Freedom is important because students are adults. So yes, they learn better.",
    problem: "It answers the question, but it stops after one simple reason.",
    better:
      "Yes, to some extent, because university students need to become responsible for their own learning. If they are given some freedom, they can decide which lectures are essential and which materials they can study independently. However, too much freedom can be risky for students who lack discipline, so I think freedom works best when there is still some structure.",
  },
  {
    id: "repeats-debate",
    label: "Weak answer 2",
    title: "Repeats Part 4",
    question: "Some people say online lectures make university more accessible. What do you think?",
    answer: "As I said in my debate, attendance should not be optional because students may miss important explanations and get worse results.",
    problem: "This goes back to the debate instead of answering the new question.",
    better:
      "I agree that online lectures can make university more accessible, especially for students who live far away, have health problems or need to work part-time. They can follow the course without always being physically present. However, accessibility is not just about uploading videos. Universities also need to make sure students can ask questions and feel connected to the course.",
  },
  {
    id: "vague",
    label: "Weak answer 3",
    title: "Vague and repetitive",
    question: "In what ways can universities help students become more independent?",
    answer: "Universities can help students be independent by teaching independence. They should give them independence because independence is important for university students.",
    problem: "The answer repeats the key word but does not explain anything specific.",
    better:
      "Universities can help by gradually giving students more responsibility. For example, instead of telling them exactly what to read for every class, tutors could ask them to choose sources and justify their choices. Another useful approach would be to teach study skills explicitly, such as planning research, managing deadlines and evaluating information critically.",
  },
  {
    id: "not-hypothetical",
    label: "Weak answer 4",
    title: "No hypothetical language",
    question: "Imagine you were responsible for improving student motivation at a university. What changes would you make?",
    answer: "I improve classes and students are more motivated. Also teachers explain better and students go to lectures.",
    problem: "The answer has ideas, but the language does not match the hypothetical situation.",
    better:
      "If I were responsible for improving motivation, I would make courses feel more connected to students' future goals. For instance, I would include more practical projects, guest speakers and real-world case studies. I would also give students more regular feedback, because motivation often drops when people do not know whether they are making progress.",
  },
];

const languageGroups = [
  {
    title: "Balanced Opinion",
    phrases: ["I agree up to a point.", "It depends on the student.", "I can see both sides, but...", "In general, I would say that..."],
  },
  {
    title: "Evaluation",
    phrases: ["One clear advantage is...", "The main drawback is...", "This can be useful in cases where...", "The problem is that this may not work for everyone."],
  },
  {
    title: "Speculation",
    phrases: ["This could lead to...", "It might encourage students to...", "There is a risk that...", "In the long term, this may..."],
  },
  {
    title: "Hypotheticals",
    phrases: ["If I were responsible for this, I would...", "I would probably start by...", "One change I would make is...", "The first thing I would do is..."],
  },
];

const modelAnswers = [
  {
    label: "Question 1",
    answer:
      "I think students often learn better when they have some freedom, because they become more responsible for their own progress. For example, they can decide which lectures are essential and which topics they can review independently. However, freedom only works if students understand the consequences of their choices. If there is no structure at all, some students may fall behind quite quickly.",
  },
  {
    label: "Question 2",
    answer:
      "I agree, especially for students who cannot always attend in person because of work, illness or distance. Online lectures can make it easier for them to continue studying without missing important content. Having said that, accessibility is not only about recording lectures. Students also need opportunities to ask questions, interact with classmates and receive support from tutors.",
  },
  {
    label: "Question 3",
    answer:
      "Universities can help by giving students more responsibility gradually. For example, tutors could ask students to choose some of their own reading or design small research projects. At the same time, students need guidance on how to manage that freedom. Teaching practical study skills, such as planning, note-taking and evaluating sources, would make independence much more realistic.",
  },
  {
    label: "Question 4",
    answer:
      "If I were responsible for this, I would try to make courses feel more connected to students' real goals. I would include more practical projects, case studies and links to future careers. I would also improve feedback, because students often lose motivation when they do not know how they are doing. Regular, specific feedback could help them feel that their effort is leading somewhere.",
  },
];

export default function OteSpeakingPart45FollowUpGuidedTask({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [expandedAnswer, setExpandedAnswer] = useState("too-short");
  const [showModel, setShowModel] = useState(false);
  const completedLoggedRef = useRef(false);
  const menuPath = getSitePath(nativeRoutes ? "/speaking/parts-4-5-debate" : "/ote/speaking/parts-4-5-debate");
  const practicePath = getSitePath(nativeRoutes ? "/speaking/parts-4-5-debate/practice" : "/ote/speaking/parts-4-5-debate/practice");
  const followUpPracticePath = `${practicePath}?mode=followups`;

  function toggleAnswer(answerId) {
    setExpandedAnswer((current) => (current === answerId ? "" : answerId));
  }

  useEffect(() => {
    if (completedLoggedRef.current || !showModel) return;
    completedLoggedRef.current = true;
    logOteTrainingCompleted({
      progressId: "speaking.parts45.advanced-followup-guided-task",
      section: "speaking",
      part: "part-5",
      mode: "advanced_followup_guided_task",
      taskTitle: "Guided Task: Follow-up Question Sprint",
      completed: true,
    });
  }, [showModel]);

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Advanced Speaking Part 5 Guided Follow-up Task | Seif English"
        description="Train OTE Advanced Part 5 follow-up answers by classifying question types, improving weak responses, and comparing with model answers."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to debate training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Activity 3</p>
        <h1>Guided Task: Follow-up Question Sprint</h1>
        <p>
          You have already given your debate answer. Now train the four audio-only follow-up
          questions: identify the question type, answer directly, and develop one clear idea.
        </p>
      </header>

      <section className="ote-guided-task-card">
        <div className="ote-guided-task-heading">
          <div>
            <p className="ote-kicker">Topic link</p>
            <h2>Universities should make attendance at lectures optional.</h2>
          </div>
          <div className="ote-guided-timing-note" aria-label="Task timing">
            <span>4 follow-up questions</span>
            <span>40 seconds each</span>
          </div>
        </div>
        <p>
          In the real test, you only hear each question. You do not see the full question on screen.
          The first question stays close to your debate, then the later questions move outwards.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>Classify the Questions</h2>
        <p className="ote-section-lead">
          Part 5 is not just opinion practice. The question type tells you what kind of language to show.
        </p>
        <div className="ote-training-compare" role="table" aria-label="Follow-up question types">
          <div className="ote-training-compare-head" role="row">
            <span role="columnheader">Question</span>
            <span role="columnheader">Main skill</span>
            <span role="columnheader">Student needs to</span>
          </div>
          {followUpQuestions.map((question) => (
            <div className="ote-training-compare-row" role="row" key={question.id}>
              <span role="cell"><strong>{question.label}</strong><br />{question.prompt}</span>
              <span role="cell">{question.type}</span>
              <span role="cell">{question.skill}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>The 40-Second Shape</h2>
        <p className="ote-section-lead">
          A strong answer does not need an introduction or conclusion. It needs to answer, explain, and develop.
        </p>
        <div className="ote-training-rule-grid">
          {answerShape.map((step) => (
            <article key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <ul className="ote-practice-bullets">
                {step.phrases.map((phrase) => <li key={phrase}>{phrase}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Analyze Weak Answers</h2>
        <p className="ote-section-lead">
          These better versions are teaching fixes. Record your own full sprint before opening the complete model answers.
        </p>
        <div className="ote-student-answer-list">
          {weakAnswers.map((item) => (
            <article key={item.id} className={`ote-student-answer-card ${expandedAnswer === item.id ? "is-open" : ""}`}>
              <button
                className="ote-student-answer-toggle"
                type="button"
                onClick={() => toggleAnswer(item.id)}
                aria-expanded={expandedAnswer === item.id}
              >
                <span>{item.label}</span>
                <strong>{item.title}</strong>
                <ChevronDown size={20} aria-hidden="true" />
              </button>
              <p><strong>Question:</strong> {item.question}</p>
              <blockquote>"{item.answer}"</blockquote>
              {expandedAnswer === item.id ? (
                <div className="ote-student-answer-detail">
                  <h3>The problem: {item.problem}</h3>
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
        <h2>Useful Follow-up Language</h2>
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
              <h2>Record a Follow-up Sprint</h2>
              <p>
                In timed practice, each question plays immediately and the recorder starts after the tone.
                Listen, answer, review, then move to the next question.
              </p>
            </div>
            <div className="ote-recorder-timer is-ready" aria-label="Answer timing">
              <Timer size={22} aria-hidden="true" />
              <strong>0:40</strong>
              <span>Each answer</span>
            </div>
          </div>
          <div className="ote-training-rule-grid">
            <article>
              <h3>Before recording</h3>
              <ul className="ote-practice-bullets">
                <li>Listen for the question type.</li>
                <li>Answer the exact question first.</li>
                <li>Choose one idea you can develop.</li>
              </ul>
            </article>
            <article>
              <h3>After each answer</h3>
              <ul className="ote-practice-bullets">
                <li>Did you answer directly?</li>
                <li>Did you give a reason?</li>
                <li>Did you develop the idea?</li>
              </ul>
            </article>
          </div>
          <button className="ote-training-primary-link" type="button" onClick={() => navigate(followUpPracticePath)}>
            <MessageCircleQuestion size={17} aria-hidden="true" />
            Open follow-up practice
          </button>
        </div>
      </section>

      <section className="ote-training-section">
        <div className="ote-model-card">
          <div>
            <p className="ote-kicker">Model answers</p>
            <h2>Compare After Recording</h2>
            <p>
              Try the sprint first, then reveal the models. Notice how each answer uses the same
              simple shape but changes language for the question type.
            </p>
          </div>
          <button type="button" onClick={() => setShowModel(true)} disabled={showModel}>
            <Play size={18} aria-hidden="true" />
            Show models
          </button>
        </div>

        {showModel ? (
          <div className="ote-model-answer">
            {modelAnswers.map((model) => (
              <article key={model.label} className="ote-model-why">
                <p><strong>{model.label}</strong></p>
                <p>{model.answer}</p>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className="ote-training-section">
        <h2>Final Reflection</h2>
        <p className="ote-section-lead">
          Which answer was hardest: opinion, evaluation, abstract explanation, or hypothetical?
        </p>
        <ul className="ote-practice-bullets">
          <li>Can I avoid repeating my Part 4 debate?</li>
          <li>Can I answer an abstract question with specific ideas?</li>
          <li>Can I use conditional language for hypothetical questions?</li>
          <li>Can I develop one point instead of rushing through several undeveloped ideas?</li>
        </ul>
        <button className="ote-training-primary-link" type="button" onClick={() => navigate(followUpPracticePath)}>
          <Sparkles size={17} aria-hidden="true" />
          Practise timed follow-up questions
        </button>
      </section>
    </main>
  );
}
