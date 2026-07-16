import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  ListChecks,
  RotateCcw,
  Search,
  Target,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const questionTypeRows = [
  {
    type: "Main message",
    meaning: "What is the central point of the whole text?",
    approach: "Look beyond individual details and decide what the writer mainly wants to communicate.",
  },
  {
    type: "Writer's purpose",
    meaning: "Why was the text written?",
    approach: "Ask whether the writer is informing, warning, recommending, explaining, criticizing, or persuading.",
  },
  {
    type: "Detail",
    meaning: "What specific information does the text give?",
    approach: "Check the exact relationship between people, events, causes, conditions, and results.",
  },
  {
    type: "Implied meaning",
    meaning: "What does the writer suggest without saying it directly?",
    approach: "Use tone, contrast, and context. Do not add ideas that the text does not support.",
  },
];

const quizQuestions = [
  {
    id: "items",
    prompt: "How many short-text questions are there in Reading Part 1?",
    options: ["Four", "Six", "Eight"],
    answer: "Six",
    explanation: "Part 1 contains six separate short texts, each followed by one question.",
  },
  {
    id: "time",
    prompt: "How much time do you have for each short text?",
    options: ["1 minute", "1 minute 20 seconds", "2 minutes"],
    answer: "1 minute 20 seconds",
    explanation: "Each item has its own 1-minute-20-second timer, so you need a quick and repeatable method.",
  },
  {
    id: "options",
    prompt: "How many answer options does each question have?",
    options: ["Two", "Three", "Four"],
    answer: "Three",
    explanation: "Every short text is followed by one three-option multiple-choice question.",
  },
  {
    id: "word-match",
    prompt: "One option repeats several words from the text. What should you do?",
    options: [
      "Choose it immediately because the vocabulary matches",
      "Check whether the complete meaning matches the text",
      "Reject it because correct answers never repeat words",
    ],
    answer: "Check whether the complete meaning matches the text",
    explanation: "Repeated vocabulary can appear in a distractor. The correct option must match the full meaning, not just a few words.",
  },
  {
    id: "implied",
    prompt: "Which question requires you to read between the lines?",
    options: ["A detail question", "An implied-meaning question", "A text-type question"],
    answer: "An implied-meaning question",
    explanation: "Implied meaning is suggested through context, attitude, or contrast rather than stated directly.",
  },
  {
    id: "two-possible",
    prompt: "Two options seem possible. What is the best next step?",
    options: [
      "Choose the shorter option",
      "Compare each complete claim with the exact wording and tone of the text",
      "Choose the option with the most advanced vocabulary",
    ],
    answer: "Compare each complete claim with the exact wording and tone of the text",
    explanation: "Distractors often contain one true element but change the writer's certainty, reason, attitude, or conclusion.",
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
              {answered && isAnswer ? <CheckCircle2 size={18} aria-hidden="true" /> : null}
              {answered && isSelected && !isAnswer ? <XCircle size={18} aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
      {answered ? (
        <p className="ote-training-feedback">
          <strong>{isCorrect ? "Correct." : "Not quite."}</strong> {question.explanation}
        </p>
      ) : null}
    </section>
  );
}

export default function OteAdvancedReadingPart1Guide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const completedLoggedRef = useRef(false);
  const basePath = nativeRoutes
    ? "/reading/advanced/part-1-short-texts"
    : "/ote/reading/advanced/part-1-short-texts";
  const menuPath = getSitePath(basePath);
  const practicePath = getSitePath(`${basePath}/practice/pilot-1`);
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
      progressId: "reading.part1.advanced-guide",
      section: "reading",
      part: "part-1",
      mode: "advanced_guide",
      taskTitle: "Advanced Reading Part 1 guide",
      score: correctCount,
      total: quizQuestions.length,
    });
  }, [answeredCount, correctCount]);

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Advanced Reading Part 1 Short Texts Guide | Seif English"
        description="Prepare for OTE Advanced Reading Part 1 with timing, question types, strategy, common traps, and a review quiz."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Part 1 training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Advanced Reading Part 1</p>
        <h1>Short Texts</h1>
        <p>
          Read six separate short texts and answer one three-option question on each. You need to
          understand the writer's main message, purpose, important details, or implied meaning.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="Advanced Reading Part 1 essentials">
        <div>
          <Clock3 size={24} aria-hidden="true" />
          <strong>1:20 per text</strong>
          <span>Each question has its own timer, so make a decision before the screen moves on.</span>
        </div>
        <div>
          <FileText size={24} aria-hidden="true" />
          <strong>6 short texts</strong>
          <span>Expect different text types, styles, and topics across the six questions.</span>
        </div>
        <div>
          <ListChecks size={24} aria-hidden="true" />
          <strong>3 options each</strong>
          <span>Only one option matches the complete meaning of the text.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How the Task Works</h2>
        <p>
          Each item is independent. You see a short text, a question or unfinished statement, and
          three possible answers. The texts may be formal, neutral, or informal and can come from
          everyday, professional, literary, or academic-style sources.
        </p>
        <p>
          The challenge is not simply finding a repeated word. The options usually paraphrase the
          text, and incorrect options may contain some true information while changing the writer's
          exact point, attitude, reason, or level of certainty.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>What Can the Question Test?</h2>
        <div className="ote-training-compare" role="table" aria-label="Advanced Reading Part 1 question types">
          <div className="ote-training-compare-head" role="row">
            <span role="columnheader">Question type</span>
            <span role="columnheader">What it means</span>
            <span role="columnheader">What to do</span>
          </div>
          {questionTypeRows.map((row) => (
            <div className="ote-training-compare-row" role="row" key={row.type}>
              <span role="cell">{row.type}</span>
              <span role="cell">{row.meaning}</span>
              <span role="cell">{row.approach}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>A Reliable 80-Second Method</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>1. Identify the target</h3>
            <p>Read the question quickly. Are you looking for purpose, detail, attitude, or the main point?</p>
          </article>
          <article>
            <BookOpen size={22} aria-hidden="true" />
            <h3>2. Read for the whole meaning</h3>
            <p>Read the complete text once before deciding. Pay special attention to contrast and the final sentence.</p>
          </article>
          <article>
            <Search size={22} aria-hidden="true" />
            <h3>3. Test all three options</h3>
            <p>Choose the option that is fully supported and reject options that exaggerate, narrow, or change the point.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Common Distractor Tricks</h2>
        <ul className="ote-training-checklist">
          <li><strong>Right words, wrong meaning:</strong> the option repeats vocabulary but changes the relationship between ideas.</li>
          <li><strong>Partly true:</strong> one part is supported, but the complete statement is not.</li>
          <li><strong>Too strong:</strong> words such as <em>always</em>, <em>only</em>, or <em>completely</em> make the claim stronger than the text.</li>
          <li><strong>Outside knowledge:</strong> the option sounds logical in real life but is not supported by this text.</li>
          <li><strong>Wrong attitude:</strong> the topic is correct, but the option misrepresents whether the writer is positive, doubtful, critical, or neutral.</li>
        </ul>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Eye size={22} aria-hidden="true" />
            <h3>Read beyond keywords</h3>
            <p>The answer usually uses different wording. Match ideas and relationships, not isolated vocabulary.</p>
          </article>
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>Answer the exact question</h3>
            <p>A true detail is not automatically correct if the question asks about the writer's purpose or overall message.</p>
          </article>
          <article>
            <Clock3 size={22} aria-hidden="true" />
            <h3>Protect the final seconds</h3>
            <p>Do not spend the full timer rereading. Leave enough time to compare the options and select an answer.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section ote-training-quiz">
        <div className="ote-training-quiz-header">
          <div>
            <h2>Part 1 Review Quiz</h2>
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

        {answeredCount === quizQuestions.length ? (
          <div className="ote-training-complete">
            <strong>{correctCount === quizQuestions.length ? "Excellent, full marks." : "Good review."}</strong>
            <span>
              You answered {correctCount} of {quizQuestions.length} correctly. Use the feedback above
              to sharpen your short-text routine.
            </span>
            <button type="button" onClick={() => setAnswers({})}>
              <RotateCcw size={17} aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : null}
      </section>

      <section className="ote-training-section">
        <button className="ote-training-primary-link" type="button" onClick={() => navigate(practicePath)}>
          Open timed Advanced Part 1 practice
        </button>
      </section>
    </main>
  );
}
