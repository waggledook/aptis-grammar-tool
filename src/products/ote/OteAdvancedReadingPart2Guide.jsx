import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  ListChecks,
  RotateCcw,
  Search,
  Target,
  Users,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const formatRows = [
  {
    format: "Questions and texts",
    layout: "Seven questions matched to three texts",
    note: "The same text may answer more than one question. This format can test stated and implied meaning.",
  },
  {
    format: "People and choices",
    layout: "Six people matched to four longer descriptions",
    note: "Match every person's complete requirements, not only their general interest or topic.",
  },
];

const quizQuestions = [
  {
    id: "time",
    prompt: "How much time do you have for the complete Part 2 task?",
    options: ["6 minutes", "8 minutes", "11 minutes"],
    answer: "8 minutes",
    explanation: "Part 2 has one eight-minute timer for all six or seven matches.",
  },
  {
    id: "formats",
    prompt: "Which statement about the Part 2 format is correct?",
    options: [
      "It always contains seven questions and three texts",
      "It may use seven questions and three texts, or six people and four descriptions",
      "It always contains six unrelated multiple-choice questions",
    ],
    answer: "It may use seven questions and three texts, or six people and four descriptions",
    explanation: "The Advanced test can use either of the two multiple-matching layouts described in the specifications.",
  },
  {
    id: "reuse",
    prompt: "Can the same text be selected for more than one question?",
    options: ["Yes", "No", "Only for the final two questions"],
    answer: "Yes",
    explanation: "This is multiple matching, so one text or description may provide the answer to several items.",
  },
  {
    id: "keyword",
    prompt: "A question and a text contain the same unusual word. Is that enough to make a match?",
    options: [
      "Yes, unusual vocabulary always identifies the answer",
      "No, you still need to check the full meaning and all conditions",
      "Only when the word appears in the heading",
    ],
    answer: "No, you still need to check the full meaning and all conditions",
    explanation: "A shared word helps you locate a possible answer, but it does not prove that the text satisfies the complete question.",
  },
  {
    id: "fast-reading",
    prompt: "What is the main reading skill in Part 2?",
    options: [
      "Reading every text slowly from beginning to end",
      "Searching quickly for relevant information, opinion, attitude, and implied meaning",
      "Understanding the meaning of every individual word",
    ],
    answer: "Searching quickly for relevant information, opinion, attitude, and implied meaning",
    explanation: "The task is designed to test efficient search reading rather than slow, equally detailed reading of every line.",
  },
  {
    id: "profile",
    prompt: "A person wants a cheap course that also offers evening classes. One option is cheap but only runs in the morning. What should you do?",
    options: [
      "Choose it because it matches the most important condition",
      "Reject it because it does not meet all the essential requirements",
      "Choose it if no option repeats the phrase evening classes",
    ],
    answer: "Reject it because it does not meet all the essential requirements",
    explanation: "In the profiles format, the best match must satisfy the person's complete set of important needs.",
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

export default function OteAdvancedReadingPart2Guide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const completedLoggedRef = useRef(false);
  const basePath = nativeRoutes
    ? "/reading/advanced/part-2-matching"
    : "/ote/reading/advanced/part-2-matching";
  const menuPath = getSitePath(basePath);
  const practicePath = getSitePath(`${basePath}/practice/c1-pilot-1`);
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
      progressId: "reading.part2.advanced-guide",
      section: "reading",
      part: "part-2",
      mode: "advanced_guide",
      taskTitle: "Advanced Reading Part 2 guide",
      score: correctCount,
      total: quizQuestions.length,
    });
  }, [answeredCount, correctCount]);

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Advanced Reading Part 2 Matching Guide | Seif English"
        description="Prepare for OTE Advanced Reading Part 2 with both matching formats, search-reading strategy, common traps, and a review quiz."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Part 2 training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Advanced Reading Part 2</p>
        <h1>Multiple Matching</h1>
        <p>
          Search several texts quickly and match each question or person to the best option. The task
          rewards accurate scanning, careful comparison, and attention to opinion and implied meaning.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="Advanced Reading Part 2 essentials">
        <div>
          <Clock3 size={24} aria-hidden="true" />
          <strong>8 minutes</strong>
          <span>One timer covers the whole task, so do not spend too long on a single match.</span>
        </div>
        <div>
          <ListChecks size={24} aria-hidden="true" />
          <strong>6 or 7 matches</strong>
          <span>The number of items depends on which of the two layouts appears.</span>
        </div>
        <div>
          <FileText size={24} aria-hidden="true" />
          <strong>3 or 4 texts</strong>
          <span>A text may be used more than once, so do not cross it out after one answer.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How the Task Works</h2>
        <p>
          Part 2 is a search-reading task. You are not expected to read every text with equal care from
          the beginning. Instead, identify the key requirement in each question, scan the texts for a
          possible location, and then read that section closely enough to confirm the match.
        </p>
        <p>
          The task may ask about factual information, a writer's opinion or attitude, and at C1 level,
          meaning that is implied rather than directly stated.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>Two Possible Layouts</h2>
        <div className="ote-training-compare" role="table" aria-label="Advanced Reading Part 2 formats">
          <div className="ote-training-compare-head" role="row">
            <span role="columnheader">Format</span>
            <span role="columnheader">What you see</span>
            <span role="columnheader">Important point</span>
          </div>
          {formatRows.map((row) => (
            <div className="ote-training-compare-row" role="row" key={row.format}>
              <span role="cell">{row.format}</span>
              <span role="cell">{row.layout}</span>
              <span role="cell">{row.note}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>A Reliable Matching Method</h2>
        <ol className="ote-training-checklist">
          <li><strong>Read the question or profile first.</strong> Identify the two or three details that make it distinctive.</li>
          <li><strong>Underline the non-negotiable conditions.</strong> Notice negatives, preferences, restrictions, and attitude words.</li>
          <li><strong>Scan the texts.</strong> Use headings, names, dates, topic vocabulary, and synonyms to locate a likely section.</li>
          <li><strong>Read locally and carefully.</strong> Check the sentence before and after the possible match.</li>
          <li><strong>Confirm every important condition.</strong> A text that matches only the general topic is not enough.</li>
          <li><strong>Move on and return.</strong> Complete the clearest matches first, then use the remaining time for harder items.</li>
        </ol>
      </section>

      <section className="ote-training-section">
        <h2>What Makes a Match Difficult?</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Search size={22} aria-hidden="true" />
            <h3>Paraphrase</h3>
            <p>The question and text often express the same idea with different vocabulary or grammar.</p>
          </article>
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>Partial matches</h3>
            <p>A text may satisfy one requirement but fail another important condition.</p>
          </article>
          <article>
            <Users size={22} aria-hidden="true" />
            <h3>Attitude and implication</h3>
            <p>Two writers may discuss the same subject but feel very differently about it.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Search size={22} aria-hidden="true" />
            <h3>Use keywords to locate, not decide</h3>
            <p>A shared word points you towards a passage. The full meaning must still prove the answer.</p>
          </article>
          <article>
            <ListChecks size={22} aria-hidden="true" />
            <h3>Check the complete requirement</h3>
            <p>Especially with profiles, make sure the option meets all essential needs rather than just one attractive detail.</p>
          </article>
          <article>
            <Clock3 size={22} aria-hidden="true" />
            <h3>Do the easy matches first</h3>
            <p>Do not let one ambiguous question consume the timer. Mark a likely answer, continue, and return if time allows.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section ote-training-quiz">
        <div className="ote-training-quiz-header">
          <div>
            <h2>Part 2 Review Quiz</h2>
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
              to improve your search-reading routine.
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
          Open timed Advanced Part 2 practice
        </button>
      </section>
    </main>
  );
}
