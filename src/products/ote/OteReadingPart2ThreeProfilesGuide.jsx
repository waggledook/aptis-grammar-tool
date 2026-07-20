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

const questionTypeRows = [
  {
    type: "Specific information",
    meaning: "Which person had a particular experience, need, plan, or result?",
    approach: "Scan for paraphrases of the key detail, then read the surrounding sentence carefully.",
  },
  {
    type: "Opinion",
    meaning: "Which person thinks that something is useful, difficult, disappointing, or important?",
    approach: "Separate what happened from how the person feels about it.",
  },
  {
    type: "Attitude",
    meaning: "Which person sounds positive, doubtful, surprised, critical, or satisfied?",
    approach: "Notice evaluative language, contrast, and the person's final comment.",
  },
];

const quizQuestions = [
  {
    id: "time",
    prompt: "How much time do you have for the whole Part 2 task?",
    options: ["6 minutes", "8 minutes", "11 minutes"],
    answer: "8 minutes",
    explanation: "Part 2 has one eight-minute timer for all six matches.",
  },
  {
    id: "layout",
    prompt: "In this version of Part 2, what do you match?",
    options: [
      "Six questions to three profiles",
      "Three questions to six adverts",
      "Six missing sentences to one article",
    ],
    answer: "Six questions to three profiles",
    explanation: "You read three longer profiles or factual texts and decide which one answers each of six questions.",
  },
  {
    id: "reuse",
    prompt: "Can the same profile answer more than one question?",
    options: ["Yes", "No", "Only at A2 level"],
    answer: "Yes",
    explanation: "There are six questions but only three profiles, so each profile may be used several times.",
  },
  {
    id: "best-start",
    prompt: "What is a useful first step before answering the questions?",
    options: [
      "Memorize every sentence in the profiles",
      "Skim the three profiles and note what makes each person different",
      "Read only the first line of each profile",
    ],
    answer: "Skim the three profiles and note what makes each person different",
    explanation: "A quick mental map helps you know where to search when you read each question.",
  },
  {
    id: "keyword",
    prompt: "A question repeats a word from one profile. Is that enough to prove the match?",
    options: ["Yes", "No, the full meaning must match", "Only if the word is a name"],
    answer: "No, the full meaning must match",
    explanation: "The repeated word may only identify the topic. Check the person's exact experience or opinion.",
  },
  {
    id: "opinion",
    prompt: "Two people mention the same activity, but only one enjoyed it. What should you compare?",
    options: ["The length of their profiles", "Their attitude to the activity", "The number of times the activity is named"],
    answer: "Their attitude to the activity",
    explanation: "Part 2 can test opinion and attitude, not only whether a topic appears in the text.",
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

export default function OteReadingPart2ThreeProfilesGuide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const completedLoggedRef = useRef(false);
  const basePath = nativeRoutes
    ? "/reading/general/part-2-matching"
    : "/ote/reading/general/part-2-matching";
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
      progressId: "reading.part2.general-three-texts-guide",
      section: "reading",
      part: "part-2",
      mode: "general_three_texts_guide",
      taskTitle: "General Reading Part 2 three texts guide",
      score: correctCount,
      total: quizQuestions.length,
    });
  }, [answeredCount, correctCount]);

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Reading Part 2 Three Texts Guide | Seif English"
        description="Prepare for the OTE Reading Part 2 three-text matching task with search-reading strategy, common traps, and a review quiz."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Part 2 training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Reading Part 2</p>
        <h1>Matching Questions to Three Texts</h1>
        <p>
          Read three longer profiles about people and match six questions to the correct person. You
          need to search quickly for specific information, opinions, and attitudes.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="Reading Part 2 three-text essentials">
        <div>
          <Clock3 size={24} aria-hidden="true" />
          <strong>8 minutes</strong>
          <span>One timer covers the complete task, so keep moving through the questions.</span>
        </div>
        <div>
          <Users size={24} aria-hidden="true" />
          <strong>3 personal texts</strong>
          <span>Build a quick picture of each person's experiences and opinions.</span>
        </div>
        <div>
          <ListChecks size={24} aria-hidden="true" />
          <strong>6 questions</strong>
          <span>The same profile can be the answer more than once.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How the Task Works</h2>
        <p>
          The three profiles are factual texts, often based on magazine articles or blogs. All three
          people normally discuss the same general topic, but their experiences and opinions are different.
        </p>
        <p>
          For each question, choose the person whose text contains the matching information. The wording
          is usually paraphrased, so you need to match ideas rather than identical phrases.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>What Can the Questions Test?</h2>
        <div className="ote-training-compare" role="table" aria-label="Three-text question types">
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
        <h2>A Reliable Search-Reading Method</h2>
        <ol className="ote-training-checklist">
          <li><strong>Skim all three profiles.</strong> Note the main experience, opinion, or situation of each person.</li>
          <li><strong>Read one question.</strong> Identify the key action, feeling, reason, or result.</li>
          <li><strong>Predict a paraphrase.</strong> Think of other words the profile might use for the same idea.</li>
          <li><strong>Scan the three texts.</strong> Locate the most likely sentence or section.</li>
          <li><strong>Read around the evidence.</strong> Check that the person's exact meaning matches the question.</li>
          <li><strong>Continue without crossing anybody out.</strong> Every person may answer several questions.</li>
        </ol>
      </section>

      <section className="ote-training-section">
        <h2>Build a Quick Profile Map</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Users size={22} aria-hidden="true" />
            <h3>What happened?</h3>
            <p>Note the person's main experience, action, problem, or achievement.</p>
          </article>
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>Why did it matter?</h3>
            <p>Notice reasons, results, changes of plan, and lessons learned.</p>
          </article>
          <article>
            <FileText size={22} aria-hidden="true" />
            <h3>How do they feel?</h3>
            <p>Mark whether the person sounds pleased, critical, uncertain, surprised, or disappointed.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Search size={22} aria-hidden="true" />
            <h3>Search for ideas, not copies</h3>
            <p>The question and profile will often use synonyms or different grammar.</p>
          </article>
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>Check opinion carefully</h3>
            <p>Mentioning a topic does not mean that two people feel the same way about it.</p>
          </article>
          <article>
            <Clock3 size={22} aria-hidden="true" />
            <h3>Answer the clear ones first</h3>
            <p>Return to a difficult match after you have completed the easier questions.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section ote-training-quiz">
        <div className="ote-training-quiz-header">
          <div>
            <h2>Three Texts Review Quiz</h2>
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
          Open timed three-text practice
        </button>
      </section>
    </main>
  );
}
