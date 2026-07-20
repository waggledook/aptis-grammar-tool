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

const requirementRows = [
  {
    type: "Essential requirement",
    example: "It must offer evening classes.",
    action: "Reject any option that does not provide it.",
  },
  {
    type: "Preference",
    example: "A small group would be ideal.",
    action: "Use it to choose between options that meet the essential needs.",
  },
  {
    type: "Restriction",
    example: "The person cannot travel far or spend much money.",
    action: "Pay special attention to negatives, limits, and practical conditions.",
  },
  {
    type: "Combination",
    example: "They need a café, children's activities, and parking.",
    action: "The best choice must satisfy the complete combination, not just one point.",
  },
];

const quizQuestions = [
  {
    id: "time",
    prompt: "How much time do you have for the complete Part 2 task?",
    options: ["6 minutes", "8 minutes", "11 minutes"],
    answer: "8 minutes",
    explanation: "The six people and four descriptions share one eight-minute timer.",
  },
  {
    id: "layout",
    prompt: "In this version of Part 2, what do you match?",
    options: [
      "Six people to four descriptions",
      "Four people to six missing sentences",
      "Six questions to one long article",
    ],
    answer: "Six people to four descriptions",
    explanation: "Each person has several needs or preferences, and you choose the best description for them.",
  },
  {
    id: "reuse",
    prompt: "Can one description be suitable for more than one person?",
    options: ["Yes", "No", "Only when two people have identical profiles"],
    answer: "Yes",
    explanation: "There are six people but only four descriptions, so some options must be used more than once.",
  },
  {
    id: "partial",
    prompt: "A place meets two of a person's three essential needs. Is it the best match?",
    options: ["Yes", "No, check for an option that meets all essential needs", "Only if it is cheaper"],
    answer: "No, check for an option that meets all essential needs",
    explanation: "A common distractor matches part of the profile but fails one important condition.",
  },
  {
    id: "negative",
    prompt: "A person does not want an outdoor activity. Which word is especially important?",
    options: ["activity", "outdoor", "not"],
    answer: "not",
    explanation: "Small negative words can completely change which option is suitable.",
  },
  {
    id: "best-method",
    prompt: "What should you do before scanning the four descriptions?",
    options: [
      "Identify the person's essential requirements",
      "Choose the description with the longest text",
      "Read every description several times",
    ],
    answer: "Identify the person's essential requirements",
    explanation: "Knowing the must-have conditions makes your search faster and protects you from partial matches.",
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

export default function OteReadingPart2PeopleAndChoicesGuide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const completedLoggedRef = useRef(false);
  const basePath = nativeRoutes
    ? "/reading/general/part-2-matching"
    : "/ote/reading/general/part-2-matching";
  const menuPath = getSitePath(basePath);
  const practicePath = getSitePath(`${basePath}/practice/b2-pilot-1`);
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
      progressId: "reading.part2.general-people-choices-guide",
      section: "reading",
      part: "part-2",
      mode: "general_people_choices_guide",
      taskTitle: "General Reading Part 2 people and choices guide",
      score: correctCount,
      total: quizQuestions.length,
    });
  }, [answeredCount, correctCount]);

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Reading Part 2 People and Choices Guide | Seif English"
        description="Prepare for the OTE Reading Part 2 people-and-choices matching task with requirement analysis, search-reading strategy, and a review quiz."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Part 2 training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Reading Part 2</p>
        <h1>Matching People to the Best Choice</h1>
        <p>
          Read six short profiles of people and match each person to the best of four descriptions.
          The correct choice must meet their full set of needs, preferences, and restrictions.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="Reading Part 2 people-and-choices essentials">
        <div>
          <Clock3 size={24} aria-hidden="true" />
          <strong>8 minutes</strong>
          <span>One timer covers all six matches, so avoid rereading everything from the beginning.</span>
        </div>
        <div>
          <Users size={24} aria-hidden="true" />
          <strong>6 people</strong>
          <span>Each profile contains several details about what the person wants or needs.</span>
        </div>
        <div>
          <FileText size={24} aria-hidden="true" />
          <strong>4 descriptions</strong>
          <span>An option can be used more than once, so do not cross it out.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How the Task Works</h2>
        <p>
          The descriptions may be places, courses, websites, activities, products, or services. They
          are often written like brochures, adverts, or magazine recommendations.
        </p>
        <p>
          Each person normally has a combination of requirements. The challenge is to find the best
          complete match. An option that looks attractive but misses one essential condition is usually a distractor.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>Understand the Person's Requirements</h2>
        <div className="ote-training-compare" role="table" aria-label="Types of profile requirements">
          <div className="ote-training-compare-head" role="row">
            <span role="columnheader">Type</span>
            <span role="columnheader">Example</span>
            <span role="columnheader">How to use it</span>
          </div>
          {requirementRows.map((row) => (
            <div className="ote-training-compare-row" role="row" key={row.type}>
              <span role="cell">{row.type}</span>
              <span role="cell">{row.example}</span>
              <span role="cell">{row.action}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>A Reliable Matching Method</h2>
        <ol className="ote-training-checklist">
          <li><strong>Read one person's profile.</strong> Do not begin with a slow reading of all four descriptions.</li>
          <li><strong>Mark the must-have details.</strong> Identify needs, limits, negatives, times, prices, and special preferences.</li>
          <li><strong>Scan the four descriptions.</strong> Look for synonyms and related ideas, not only repeated words.</li>
          <li><strong>Reject partial matches.</strong> Remove any option that fails an essential requirement.</li>
          <li><strong>Compare the remaining choices.</strong> Use preferences to decide which one is the best overall fit.</li>
          <li><strong>Move to the next person.</strong> Remember that a description may be used again.</li>
        </ol>
      </section>

      <section className="ote-training-section">
        <h2>Common Traps</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>The partial match</h3>
            <p>An option fits the general topic and one need, but fails another essential condition.</p>
          </article>
          <article>
            <Search size={22} aria-hidden="true" />
            <h3>The copied-word trap</h3>
            <p>A description repeats a word from the profile but uses it in a different way.</p>
          </article>
          <article>
            <ListChecks size={22} aria-hidden="true" />
            <h3>The missed negative</h3>
            <p>Words such as not, only, except, without, and cannot can reverse the match.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Users size={22} aria-hidden="true" />
            <h3>Start with the person</h3>
            <p>The profile tells you exactly what information you need to search for.</p>
          </article>
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>Check every must-have</h3>
            <p>Do not choose an option until the full combination of essential needs is satisfied.</p>
          </article>
          <article>
            <Clock3 size={22} aria-hidden="true" />
            <h3>Use elimination</h3>
            <p>Reject impossible options quickly, then compare the two strongest choices carefully.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section ote-training-quiz">
        <div className="ote-training-quiz-header">
          <div>
            <h2>People and Choices Review Quiz</h2>
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
              to improve how you compare complete requirements.
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
          Open timed people-and-choices practice
        </button>
      </section>
    </main>
  );
}
