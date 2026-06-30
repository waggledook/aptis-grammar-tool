import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, ListChecks, RotateCcw, Sparkles, XCircle, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const quizQuestions = [
  {
    id: "assessed-count",
    prompt: "How many questions in Advanced Speaking Part 1 are assessed?",
    options: ["Two", "Four", "Six"],
    answer: "Four",
    explanation:
      "There are six questions altogether, but Questions 1 and 2 are not assessed. Questions 3-6 are assessed.",
  },
  {
    id: "advanced-timing",
    prompt: "How much time do you have for each assessed question?",
    options: ["20 seconds", "30 seconds", "40 seconds"],
    answer: "30 seconds",
    explanation:
      "You have 30 seconds for each of Questions 3-6. There is no separate preparation time.",
  },
  {
    id: "question-topics",
    prompt: "Which statement about Questions 3-6 is correct?",
    options: [
      "They are all about one shared topic.",
      "They are on different familiar topics.",
      "They require specialist academic knowledge.",
    ],
    answer: "They are on different familiar topics.",
    explanation:
      "Each assessed question is on a different everyday topic. Be ready to change subject quickly.",
  },
  {
    id: "strongest-answer",
    prompt: 'The computer asks: "How have your interests changed as you have got older?" Which answer is strongest?',
    options: [
      "My interests have changed.",
      "I like books now. They are interesting.",
      "When I was younger, I was mainly interested in sport, but I now spend more time reading because I enjoy learning about new subjects.",
    ],
    answer:
      "When I was younger, I was mainly interested in sport, but I now spend more time reading because I enjoy learning about new subjects.",
    explanation:
      "The strongest answer compares past and present, gives detail and explains the change.",
  },
  {
    id: "advanced-missed-question",
    prompt: "You do not understand one word in the question. What should you do?",
    options: [
      "Stay silent until the time finishes.",
      "Ask the computer to repeat the question.",
      "Use the words you understood and give the most relevant answer you can.",
    ],
    answer: "Use the words you understood and give the most relevant answer you can.",
    explanation:
      "The question cannot be repeated. Use the information you understood and keep communicating.",
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

export default function OteSpeakingPart1AdvancedGuide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const completedLoggedRef = useRef(false);
  const menuPath = getSitePath(nativeRoutes ? "/speaking/part-1-interview" : "/ote/speaking/part-1-interview");
  const practicePath = getSitePath(nativeRoutes ? "/speaking/part-1-interview/practice" : "/ote/speaking/part-1-interview/practice");
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
      progressId: "speaking.part1.advanced-overview",
      section: "speaking",
      part: "part-1",
      mode: "advanced_overview",
      taskTitle: "Advanced interview strategy",
      score: correctCount,
      total: quizQuestions.length,
    });
  }, [answeredCount, correctCount]);

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Advanced Speaking Part 1 Interview | Seif English"
        description="Learn how to handle Advanced OTE Speaking Part 1 interview questions with timing, structure, and a quick review quiz."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to interview training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Advanced Speaking Part 1</p>
        <h1>The Advanced Interview</h1>
        <p>
          The Advanced Speaking test begins with six short interview questions. The first two
          questions ask for basic personal information and are not assessed. Questions 3-6 ask about
          different everyday topics. You need to answer clearly, develop your ideas and use most of
          the available speaking time.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="Advanced Part 1 essentials">
        <div>
          <Clock3 size={24} aria-hidden="true" />
          <strong>30 seconds</strong>
          <span>You have 30 seconds to answer each assessed question.</span>
        </div>
        <div>
          <ListChecks size={24} aria-hidden="true" />
          <strong>6 questions</strong>
          <span>Questions 1 and 2 are simple personal-information questions. Questions 3-6 are assessed.</span>
        </div>
        <div>
          <Zap size={24} aria-hidden="true" />
          <strong>No planning time</strong>
          <span>Listen, wait for the tone, and start shaping your answer immediately.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How Part 1 Works</h2>
        <p>
          You wear a headset and answer questions spoken by the computer.
        </p>
        <p>
          The questions are audio-only, so you hear them but do not see the words on screen. An
          on-screen clock shows how much speaking time remains.
        </p>
        <p>
          The test moves forward automatically when the time finishes. You cannot pause the test or
          ask to hear the question again.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>Order of the Questions</h2>
        <div className="ote-training-compare" role="table" aria-label="Advanced Speaking Part 1 question order">
          <div className="ote-training-compare-head" role="row">
            <span role="columnheader">Questions</span>
            <span role="columnheader">Assessment</span>
            <span role="columnheader">What to expect</span>
          </div>
          {[
            ["1 and 2", "Not assessed", "The first two questions are always: What's your name? Which country do you come from? A short, clear answer is enough."],
            ["3-6", "Assessed", "Four questions about different familiar topics. Question 3 normally begins with \"Thinking about...\", while Question 6 begins with \"Finally...\"."],
          ].map(([questions, assessment, expectation]) => (
            <div className="ote-training-compare-row" role="row" key={questions}>
              <span role="cell">{questions}</span>
              <span role="cell">{assessment}</span>
              <span role="cell">{expectation}</span>
            </div>
          ))}
        </div>
        <p>
          In Questions 3-6, you may need to describe a place, person or experience, explain an
          opinion, talk about something important in your life, compare the past and present, discuss
          a future plan, or imagine a hypothetical situation.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>Build a Full Answer</h2>
        <p>A strong answer usually has three simple parts:</p>
        <div className="ote-training-rule-grid">
          <article>
            <h3>1. Answer the question</h3>
            <p>Give a clear response immediately.</p>
          </article>
          <article>
            <h3>2. Explain</h3>
            <p>Add a reason or useful detail.</p>
          </article>
          <article>
            <h3>3. Develop</h3>
            <p>Give an example, contrast or personal experience.</p>
          </article>
        </div>
        <div className="ote-practice-specific-prompt">
          <p><strong>Question:</strong> How important is sport to you?</p>
          <p><strong>Too short:</strong> Sport is very important to me.</p>
          <p>
            <strong>Better:</strong> Sport is quite important to me because it helps me stay healthy
            and manage stress. I usually go running two or three times a week, and I always feel more
            relaxed afterwards.
          </p>
        </div>
        <p>
          You do not need to speak perfectly. The important thing is to stay relevant and communicate
          enough information.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <h3>Answer first</h3>
            <p>Do not spend several seconds introducing the topic. Give your answer immediately, then explain it.</p>
          </article>
          <article>
            <h3>Add one more detail</h3>
            <p>After your first reason, add an example, result, comparison or personal detail.</p>
          </article>
          <article>
            <h3>Keep going after mistakes</h3>
            <p>
              If you make a small grammar or vocabulary mistake, continue speaking. Restarting the
              whole answer wastes time and can affect fluency.
            </p>
          </article>
        </div>
      </section>

      <section className="ote-training-section ote-training-quiz">
        <div className="ote-training-quiz-header">
          <div>
            <h2>Advanced Interview Review Quiz</h2>
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
              to build fluency across the longer 30-second answers.
            </span>
            <button type="button" onClick={() => setAnswers({})}>
              <RotateCcw size={17} aria-hidden="true" />
              Try again
            </button>
            <button type="button" onClick={() => navigate(practicePath)}>
              <Sparkles size={17} aria-hidden="true" />
              Open timed practice
            </button>
          </div>
        )}
      </section>

      <section className="ote-training-section">
        <h2>Final Check Before Part 1</h2>
        <ul className="ote-practice-bullets">
          <li>Do I know that Questions 1 and 2 are not assessed?</li>
          <li>Can I begin with a direct answer?</li>
          <li>Can I add a reason and one more detail?</li>
          <li>Am I ready to change topic quickly?</li>
          <li>Can I keep speaking after a small mistake?</li>
          <li>Can I use most of the 30 seconds?</li>
        </ul>
        <button className="ote-training-primary-link" type="button" onClick={() => navigate(practicePath)}>
          <Sparkles size={17} aria-hidden="true" />
          Open Advanced Part 1 interview practice
        </button>
      </section>
    </main>
  );
}
