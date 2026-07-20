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
    type: "Attitude or opinion",
    meaning: "What does the writer or a person in the text think or feel?",
  },
  {
    type: "Purpose",
    meaning: "Why does the writer mention an example, event, or piece of information?",
  },
  {
    type: "Reference",
    meaning: "What does a word such as it, this, they, or which refer to?",
  },
  {
    type: "Word in context",
    meaning: "What does a word or phrase mean in this particular sentence?",
  },
  {
    type: "Global meaning",
    meaning: "What is the main point, development, or overall message of the text?",
  },
];

const quizQuestions = [
  {
    id: "time",
    prompt: "How much time do you have for Reading Part 4?",
    options: ["6 minutes", "8 minutes", "11 minutes"],
    answer: "8 minutes",
    explanation: "The long text and all four questions share one eight-minute timer.",
  },
  {
    id: "questions",
    prompt: "How many questions are there?",
    options: ["Four", "Five", "Six"],
    answer: "Four",
    explanation: "Part 4 contains four three-option multiple-choice questions.",
  },
  {
    id: "context",
    prompt: "A question asks what a word means. What should you do?",
    options: [
      "Choose its most common dictionary meaning",
      "Read the sentence and surrounding context",
      "Choose the longest option",
    ],
    answer: "Read the sentence and surrounding context",
    explanation: "Word-in-context questions test the meaning that fits this passage, not every possible definition.",
  },
  {
    id: "reference",
    prompt: "A question asks what 'it' refers to. Where should you look first?",
    options: ["At the nearby nouns and ideas", "Only at the title", "At the final paragraph"],
    answer: "At the nearby nouns and ideas",
    explanation: "Reference words usually point to a person, thing, action, or whole idea in the nearby text.",
  },
  {
    id: "purpose",
    prompt: "Why might a writer include an example?",
    options: [
      "To support or explain a larger point",
      "To make the article longer",
      "To introduce an unrelated topic",
    ],
    answer: "To support or explain a larger point",
    explanation: "Purpose questions ask what job the example performs in the writer's message.",
  },
  {
    id: "global",
    prompt: "One option is true about a single paragraph but not the complete text. Can it answer a global question?",
    options: ["Yes", "No", "Only if it uses words from the title"],
    answer: "No",
    explanation: "A global answer must represent the overall direction or message of the whole text.",
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

export default function OteReadingPart4Guide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const completedLoggedRef = useRef(false);
  const basePath = nativeRoutes
    ? "/reading/general/part-4-long-text"
    : "/ote/reading/general/part-4-long-text";
  const menuPath = getSitePath(basePath);
  const practicePath = getSitePath(`${basePath}/practice/a2-new-dog`);
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
      progressId: "reading.part4.general-guide",
      section: "reading",
      part: "part-4",
      mode: "general_guide",
      taskTitle: "General Reading Part 4 guide",
      score: correctCount,
      total: quizQuestions.length,
    });
  }, [answeredCount, correctCount]);

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Reading Part 4 Long Text Guide | Seif English"
        description="Prepare for OTE Reading Part 4 with question types, a practical long-text strategy, common distractors, and a review quiz."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Part 4 training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Reading Part 4</p>
        <h1>Long Text</h1>
        <p>
          Read one newspaper or magazine article and answer four three-option questions. You need to
          understand details, opinions, references, vocabulary in context, and the overall message.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="Reading Part 4 essentials">
        <div>
          <Clock3 size={24} aria-hidden="true" />
          <strong>8 minutes</strong>
          <span>The text and all four questions share one timer.</span>
        </div>
        <div>
          <FileText size={24} aria-hidden="true" />
          <strong>1 long text</strong>
          <span>Follow the ideas across several paragraphs, not just one sentence at a time.</span>
        </div>
        <div>
          <ListChecks size={24} aria-hidden="true" />
          <strong>4 questions</strong>
          <span>Each question has three options, and only one matches the passage.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How the Task Works</h2>
        <p>
          The questions ask about different parts of the article and may also include one question
          about its overall meaning. You need careful reading, but the time is limited, so use the
          questions to guide you through the text.
        </p>
        <p>
          Incorrect options are often based on real words or details from the article. They may be
          partly true, too strong, or correct for a different person or paragraph.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>What Can the Questions Test?</h2>
        <div className="ote-training-compare" role="table" aria-label="Reading Part 4 question types">
          <div className="ote-training-compare-head is-two-column" role="row">
            <span role="columnheader">Question type</span>
            <span role="columnheader">What you need to understand</span>
          </div>
          {questionTypeRows.map((row) => (
            <div className="ote-training-compare-row is-two-column" role="row" key={row.type}>
              <span role="cell">{row.type}</span>
              <span role="cell">{row.meaning}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>A Reliable Long-Text Method</h2>
        <ol className="ote-training-checklist">
          <li><strong>Read the title and questions.</strong> Notice the names, paragraphs, words, or ideas you need to find.</li>
          <li><strong>Read the opening carefully.</strong> Understand the topic and the direction of the article.</li>
          <li><strong>Work through the questions.</strong> Locate the relevant part and read the surrounding sentences.</li>
          <li><strong>Answer in your own words first.</strong> Decide what the text means before comparing A, B, and C.</li>
          <li><strong>Test the complete options.</strong> Check person, reason, time, attitude, and strength of meaning.</li>
          <li><strong>Use the whole article for global meaning.</strong> Consider repeated ideas and the conclusion.</li>
        </ol>
      </section>

      <section className="ote-training-section">
        <h2>How Distractors Mislead You</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Eye size={22} aria-hidden="true" />
            <h3>Partly true</h3>
            <p>The option contains a real detail but does not answer the exact question.</p>
          </article>
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>Too strong</h3>
            <p>The text says may or sometimes, but the option changes this to always or definitely.</p>
          </article>
          <article>
            <Search size={22} aria-hidden="true" />
            <h3>Wrong connection</h3>
            <p>The option links a real reason, result, or opinion to the wrong person or event.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <BookOpen size={22} aria-hidden="true" />
            <h3>Read around the answer</h3>
            <p>The key line may be explained or changed by the sentence before or after it.</p>
          </article>
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>Match the strength</h3>
            <p>Check whether the writer is certain, doubtful, positive, critical, or simply reporting.</p>
          </article>
          <article>
            <Clock3 size={22} aria-hidden="true" />
            <h3>Keep time for the whole text</h3>
            <p>Do not spend most of the eight minutes on one difficult question.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section ote-training-quiz">
        <div className="ote-training-quiz-header">
          <div>
            <h2>Part 4 Review Quiz</h2>
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
              to sharpen your long-text strategy.
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
          Open timed Part 4 practice
        </button>
      </section>
    </main>
  );
}
