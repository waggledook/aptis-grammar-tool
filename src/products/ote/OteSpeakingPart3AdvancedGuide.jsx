import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, ListChecks, MessageSquareText, RotateCcw, Sparkles, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const quizQuestions = [
  {
    id: "prep-time",
    prompt: "How much preparation time do you have after listening to the experts?",
    options: ["20 seconds", "40 seconds", "50 seconds"],
    answer: "40 seconds",
    explanation: "Use this time to identify the two main points and decide how to organize your response.",
  },
  {
    id: "speaking-time",
    prompt: "How long do you have to give your summary?",
    options: ["40 seconds", "50 seconds", "1 minute"],
    answer: "50 seconds",
    explanation: "Try to speak for most of the 50 seconds. A complete response is usually around 90-100 words.",
  },
  {
    id: "main-purpose",
    prompt: "What is the main purpose of the task?",
    options: [
      "Compare the experts and decide which one is correct.",
      "Combine and summarize the two main points shared by the experts.",
      "Give your personal opinion about the research.",
    ],
    answer: "Combine and summarize the two main points shared by the experts.",
    explanation:
      "Both speakers make the same two main points. Your job is to combine their information, not judge their opinions.",
  },
  {
    id: "organization",
    prompt: "Which organization is strongest?",
    options: [
      "Summarize everything Speaker 1 says, then everything Speaker 2 says.",
      "Describe only the speaker you understood most clearly.",
      "Combine both speakers' information about the first point, then do the same for the second point.",
    ],
    answer: "Combine both speakers' information about the first point, then do the same for the second point.",
    explanation: "Organizing by main point creates a clearer combined summary.",
  },
  {
    id: "notes",
    prompt: "What is the best way to make notes?",
    options: [
      "Try to write every sentence exactly as you hear it.",
      "Write short keywords under the two main points.",
      "Ignore the first speaker and take notes only during the second.",
    ],
    answer: "Write short keywords under the two main points.",
    explanation:
      "Short notes help you listen and identify the structure. Trying to copy everything may cause you to miss important information.",
  },
];

function QuizQuestion({ question, selectedAnswer, onSelect }) {
  const answered = Boolean(selectedAnswer);
  const isCorrect = selectedAnswer === question.answer;

  return (
    <section className={`ote-training-quiz-item ${answered ? (isCorrect ? "is-correct" : "is-wrong") : ""}`}>
      <h3>{question.prompt}</h3>
      <div className="ote-training-options">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option;
          const isAnswer = question.answer === option;
          return (
            <button
              key={option}
              type="button"
              className={`ote-training-option ${isSelected ? "is-selected" : ""} ${
                answered && isAnswer ? "is-answer" : ""
              }`}
              onClick={() => onSelect(question.id, option)}
            >
              <span>{option}</span>
              {answered && isAnswer && <CheckCircle2 size={18} aria-hidden="true" />}
              {answered && isSelected && !isAnswer && <XCircle size={18} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      {answered && (
        <p className="ote-training-feedback">
          <strong>{isCorrect ? "Correct." : "Not quite."}</strong> {question.explanation}
        </p>
      )}
    </section>
  );
}

export default function OteSpeakingPart3AdvancedGuide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const completedLoggedRef = useRef(false);
  const menuPath = getSitePath(nativeRoutes ? "/speaking/parts-3-4" : "/ote/speaking/parts-3-4");
  const practicePath = getSitePath(nativeRoutes ? "/speaking/part-3-summary/practice" : "/ote/speaking/part-3-summary/practice");
  const answeredCount = Object.keys(answers).length;
  const correctCount = useMemo(
    () => quizQuestions.filter((question) => answers[question.id] === question.answer).length,
    [answers]
  );

  function selectAnswer(questionId, answer) {
    setAnswers((current) => ({ ...current, [questionId]: answer }));
  }

  useEffect(() => {
    if (completedLoggedRef.current || answeredCount < quizQuestions.length) return;
    completedLoggedRef.current = true;
    logOteTrainingCompleted({
      progressId: "speaking.part3.advanced-summary-overview",
      section: "speaking",
      part: "part-3",
      mode: "advanced_summary_overview",
      taskTitle: "Advanced speaking summary strategy",
      score: correctCount,
      total: quizQuestions.length,
    });
  }, [answeredCount, correctCount]);

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Advanced Speaking Part 3 Summary | Seif English"
        description="Learn how to combine two expert talks into one clear Advanced OTE Speaking Part 3 summary."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to summary training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Speaking Part 3</p>
        <h1>The Advanced Speaking Summary</h1>
        <p>
          In Part 3, you listen to two experts discussing the same research topic. They express the
          same two main points, but they may explain them differently or provide different supporting
          details.
        </p>
        <p>Your task is to combine their information and give one clear spoken summary.</p>
      </header>

      <section className="ote-training-summary" aria-label="Advanced Part 3 essentials">
        <div>
          <MessageSquareText size={24} aria-hidden="true" />
          <strong>2 expert speakers</strong>
          <span>Listen for the two main points that both experts make.</span>
        </div>
        <div>
          <Clock3 size={24} aria-hidden="true" />
          <strong>40 seconds</strong>
          <span>After listening, organize your notes and prepare your response.</span>
        </div>
        <div>
          <ListChecks size={24} aria-hidden="true" />
          <strong>50 seconds</strong>
          <span>Give one combined summary of around 90-100 words.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How Part 3 Works</h2>
        <p>First, you read and hear the instructions.</p>
        <p>
          You then listen to two short expert talks about an academic or research topic. You can use
          the Notes button to make notes while you listen.
        </p>
        <p>
          After both experts have finished, you have 40 seconds to prepare. Recording then starts
          automatically, and you have 50 seconds to give your summary.
        </p>
        <p>
          Your audience is a tutor group, so your response should sound clear, neutral and
          appropriately academic. You are not expected to give your own opinion.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>What Do You Need to Summarize?</h2>
        <p>The two experts make the same two main points.</p>
        <p>For example, in a task about breathing techniques, both speakers might argue that:</p>
        <ol className="ote-practice-bullets">
          <li>breathing exercises can improve general health and reduce stress;</li>
          <li>claims that they can cure particular illnesses still require more research.</li>
        </ol>
        <p>The speakers may use different examples or wording, but the central ideas are shared.</p>
        <p>Your summary should include:</p>
        <ul className="ote-practice-bullets">
          <li>both main points</li>
          <li>useful supporting information from both speakers</li>
          <li>clear links between the ideas</li>
        </ul>
        <p>The examiner has a task-specific list of the important content that should appear in your response.</p>
      </section>

      <section className="ote-training-section">
        <h2>Combine the Speakers</h2>
        <div className="ote-training-compare" role="table" aria-label="Weak and strong summary organization examples">
          <div className="ote-training-compare-head" role="row">
            <span role="columnheader">Weaker approach</span>
            <span role="columnheader">Stronger approach</span>
          </div>
          <div className="ote-training-compare-row" role="row">
            <span role="cell">
              Speaker 1 says that breathing reduces stress. Speaker 2 says that breathing helps
              people feel calmer. Speaker 1 also says that more research is necessary.
            </span>
            <span role="cell">
              Both experts agree that breathing techniques can reduce stress and support general
              health. They also discuss claims that these techniques may treat specific illnesses,
              although they emphasize that more reliable research is needed.
            </span>
          </div>
        </div>
        <p>The stronger version brings together the information by main point.</p>
      </section>

      <section className="ote-training-section">
        <h2>A Simple Note Plan</h2>
        <p>While listening, divide your notes into two areas:</p>
        <div className="ote-training-rule-grid">
          <article>
            <h3>Main point 1</h3>
            <ul className="ote-practice-bullets">
              <li>Speaker 1 detail</li>
              <li>Speaker 2 detail</li>
            </ul>
          </article>
          <article>
            <h3>Main point 2</h3>
            <ul className="ote-practice-bullets">
              <li>Speaker 1 detail</li>
              <li>Speaker 2 detail</li>
            </ul>
          </article>
        </div>
        <p>Use short keywords rather than trying to write full sentences.</p>
        <div className="ote-training-rule-grid">
          <article>
            <h3>Point 1: health benefits</h3>
            <ul className="ote-practice-bullets">
              <li>less stress</li>
              <li>calmer</li>
              <li>general health</li>
            </ul>
          </article>
          <article>
            <h3>Point 2: medical claims</h3>
            <ul className="ote-practice-bullets">
              <li>may treat illness</li>
              <li>evidence promising</li>
              <li>more research needed</li>
            </ul>
          </article>
        </div>
        <p>During the 40-second preparation time, turn these notes into a clear two-part response.</p>
      </section>

      <section className="ote-training-section">
        <h2>A Simple Response Structure</h2>
        <div className="ote-training-rule-grid">
          <article>
            <h3>1. Introduce the shared topic</h3>
            <p>Both experts discuss research into...</p>
          </article>
          <article>
            <h3>2. Summarize the first main point</h3>
            <p>They agree that...</p>
            <p>Add the most useful supporting details.</p>
          </article>
          <article>
            <h3>3. Summarize the second main point</h3>
            <p>They also suggest that...</p>
            <p>Include any important limitation, contrast or conclusion.</p>
          </article>
        </div>
        <p>You do not need a long introduction or conclusion. Use most of the 50 seconds for the actual content.</p>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <h3>Find both main points</h3>
            <p>Do not focus too heavily on an interesting example and miss one of the central ideas.</p>
          </article>
          <article>
            <h3>Organize by idea, not by speaker</h3>
            <p>Combine what both experts say about Point 1, then combine what they say about Point 2.</p>
          </article>
          <article>
            <h3>Paraphrase clearly</h3>
            <p>
              Use your own words where possible. You can keep necessary technical terms, but avoid
              repeating long parts of the recordings exactly.
            </p>
          </article>
        </div>
      </section>

      <section className="ote-training-section ote-training-quiz">
        <div className="ote-training-quiz-header">
          <div>
            <h2>Advanced Speaking Summary Review Quiz</h2>
            <p>Choose an answer to get immediate feedback.</p>
          </div>
          <div className="ote-training-score" aria-live="polite">
            {correctCount}/{quizQuestions.length}
          </div>
        </div>

        {quizQuestions.map((question) => (
          <QuizQuestion
            key={question.id}
            question={question}
            selectedAnswer={answers[question.id]}
            onSelect={selectAnswer}
          />
        ))}

        {answeredCount === quizQuestions.length && (
          <div className="ote-training-complete">
            <strong>{correctCount === quizQuestions.length ? "Nice, full marks." : "Good review."}</strong>
            <span>
              You answered {correctCount} of {quizQuestions.length} correctly. Use the practice sets
              to build clear 50-second combined summaries.
            </span>
            <button type="button" onClick={() => setAnswers({})}>
              <RotateCcw size={17} aria-hidden="true" />
              Try again
            </button>
            <button type="button" onClick={() => navigate(practicePath)}>
              <Sparkles size={17} aria-hidden="true" />
              Open practice
            </button>
          </div>
        )}
      </section>

      <section className="ote-training-section">
        <h2>Final Check Before Part 3</h2>
        <ul className="ote-practice-bullets">
          <li>Have I identified the two main points?</li>
          <li>Have I used information from both experts?</li>
          <li>Have I organized my answer by idea rather than by speaker?</li>
          <li>Have I selected only useful supporting details?</li>
          <li>Have I avoided adding my own opinion?</li>
          <li>Can I use my notes without reading a full script?</li>
          <li>Can I speak clearly for most of the 50 seconds?</li>
        </ul>
        <button className="ote-training-primary-link" type="button" onClick={() => navigate(practicePath)}>
          <Sparkles size={17} aria-hidden="true" />
          Open Advanced Part 3 summary practice
        </button>
      </section>
    </main>
  );
}
