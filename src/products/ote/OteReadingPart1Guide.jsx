import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
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
    meaning: "What is the most important idea in the text?",
    approach: "Think about the complete message, not one interesting detail.",
  },
  {
    type: "Purpose",
    meaning: "Why has the writer sent or published the text?",
    approach: "Decide whether the writer is informing, inviting, warning, requesting, explaining, or recommending.",
  },
  {
    type: "Detail",
    meaning: "What exact information does the text give?",
    approach: "Check names, times, conditions, reasons, changes, and who must do what.",
  },
];

const quizQuestions = [
  {
    id: "items",
    prompt: "How many short texts are there in Reading Part 1?",
    options: ["Four", "Six", "Eight"],
    answer: "Six",
    explanation: "Part 1 contains six separate short texts, each with one question.",
  },
  {
    id: "time",
    prompt: "How much time do you have for each text and question?",
    options: ["1 minute", "1 minute 20 seconds", "2 minutes"],
    answer: "1 minute 20 seconds",
    explanation: "Each item has its own 1-minute-20-second timer, giving eight minutes in total.",
  },
  {
    id: "options",
    prompt: "How many answer options does each question have?",
    options: ["Two", "Three", "Four"],
    answer: "Three",
    explanation: "Each text is followed by one three-option multiple-choice question.",
  },
  {
    id: "purpose",
    prompt: "A question asks why somebody wrote a message. What are you looking for?",
    options: ["The writer's purpose", "The longest sentence", "A difficult word"],
    answer: "The writer's purpose",
    explanation: "Purpose questions ask what the writer wants the reader to know, feel, or do.",
  },
  {
    id: "word-match",
    prompt: "An option repeats several words from the text. What should you do?",
    options: [
      "Choose it immediately",
      "Check whether its complete meaning matches",
      "Reject it because correct answers use different words",
    ],
    answer: "Check whether its complete meaning matches",
    explanation: "A repeated word may help, but distractors often copy vocabulary while changing the real message.",
  },
  {
    id: "partly-true",
    prompt: "An option contains one true detail but does not answer the question. Is it correct?",
    options: ["Yes", "No", "Only when it is the shortest option"],
    answer: "No",
    explanation: "The correct option must answer the exact question and match the whole relevant meaning.",
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

export default function OteReadingPart1Guide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const completedLoggedRef = useRef(false);
  const basePath = nativeRoutes
    ? "/reading/general/part-1-short-texts"
    : "/ote/reading/general/part-1-short-texts";
  const menuPath = getSitePath(basePath);
  const practicePath = getSitePath(`${basePath}/practice/a2-pilot-1`);
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
      progressId: "reading.part1.general-guide",
      section: "reading",
      part: "part-1",
      mode: "general_guide",
      taskTitle: "General Reading Part 1 guide",
      score: correctCount,
      total: quizQuestions.length,
    });
  }, [answeredCount, correctCount]);

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Reading Part 1 Short Texts Guide | Seif English"
        description="Prepare for OTE Reading Part 1 with timing, question types, a quick strategy, common traps, and a review quiz."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Part 1 training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Reading Part 1</p>
        <h1>Short Texts</h1>
        <p>
          Read six short everyday texts and answer one three-option question on each. You need to
          understand the main message, the writer's purpose, or an important detail.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="Reading Part 1 essentials">
        <div>
          <Clock3 size={24} aria-hidden="true" />
          <strong>1:20 per text</strong>
          <span>Each question has its own timer, so answer before the screen moves on.</span>
        </div>
        <div>
          <FileText size={24} aria-hidden="true" />
          <strong>6 short texts</strong>
          <span>You may see emails, adverts, notes, notices, blogs, or text messages.</span>
        </div>
        <div>
          <ListChecks size={24} aria-hidden="true" />
          <strong>3 options each</strong>
          <span>Only one option matches the exact message of the text.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How the Task Works</h2>
        <p>
          Every item is separate. You read one short text, then choose A, B, or C. The style may be
          informal, neutral, or formal, but the situation will normally be familiar and practical.
        </p>
        <p>
          The options often use different words from the text. A wrong answer may mention a true
          detail, but change the reason, person, time, action, or overall message.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>What Can the Question Test?</h2>
        <div className="ote-training-compare" role="table" aria-label="Reading Part 1 question types">
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
        <h2>A Simple 80-Second Method</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>1. Read the question</h3>
            <p>Know whether you need the main message, purpose, or one exact detail.</p>
          </article>
          <article>
            <BookOpen size={22} aria-hidden="true" />
            <h3>2. Read the complete text</h3>
            <p>Notice contrast words, changes of plan, conditions, and the final sentence.</p>
          </article>
          <article>
            <Search size={22} aria-hidden="true" />
            <h3>3. Compare all three options</h3>
            <p>Choose the option that answers the question without adding or changing information.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Common Traps</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Search size={22} aria-hidden="true" />
            <h3>The same-word trap</h3>
            <p>An option repeats words from the text but gives the wrong message.</p>
          </article>
          <article>
            <FileText size={22} aria-hidden="true" />
            <h3>The partly-true trap</h3>
            <p>An option contains a real detail but does not answer the question asked.</p>
          </article>
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>The wrong-purpose trap</h3>
            <p>An option says what the text discusses, but not why the writer wrote it.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>Answer the exact question</h3>
            <p>A true sentence is not enough if it answers a different question.</p>
          </article>
          <article>
            <BookOpen size={22} aria-hidden="true" />
            <h3>Read to the end</h3>
            <p>The writer's final point may change or clarify what came before.</p>
          </article>
          <article>
            <Clock3 size={22} aria-hidden="true" />
            <h3>Make a decision</h3>
            <p>Do not lose the answer by waiting for the timer to finish.</p>
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
              to improve your short-text routine.
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
          Open timed Part 1 practice
        </button>
      </section>
    </main>
  );
}
