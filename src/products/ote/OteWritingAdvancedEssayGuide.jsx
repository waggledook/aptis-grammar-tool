import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  ListChecks,
  PenLine,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const criteriaRows = [
  {
    criterion: "Task fulfilment",
    examinersLookFor: "A direct answer, a clear argument, at least two prompts, developed support, and suitable academic register.",
    usefulMoves: "It is often argued that... / A key consideration is... / While this concern is valid, ...",
  },
  {
    criterion: "Organization",
    examinersLookFor: "A clear introduction and conclusion, logical paragraphing, coherent development, and varied cohesive features.",
    usefulMoves: "One reason for this is that... / By contrast, ... / Overall, therefore, ...",
  },
  {
    criterion: "Grammar",
    examinersLookFor: "Controlled simple and complex structures that express ideas clearly and precisely.",
    usefulMoves: "Although this may benefit..., it can also... / If this policy were introduced, ...",
  },
  {
    criterion: "Lexis",
    examinersLookFor: "Precise topic vocabulary, natural collocations, limited repetition, and few distracting errors.",
    usefulMoves: "Use advanced vocabulary only when it is natural, accurate, and relevant to the argument.",
  },
];

const quizQuestions = [
  {
    id: "ideas-count",
    prompt: "The task gives you three ideas. How many must you include?",
    options: ["All three, with no exceptions", "At least two", "Only one, provided it is explained fully"],
    answer: "At least two",
    explanation: "The task specifically requires at least two of the three ideas. Two well-developed ideas are enough.",
  },
  {
    id: "one-prompt",
    prompt: "A candidate writes about only one prompt but produces accurate, advanced English. What is the main problem?",
    options: [
      "The candidate has not fully met the task requirements",
      "The candidate has used too much formal language",
      "The essay must automatically receive zero",
    ],
    answer: "The candidate has not fully met the task requirements",
    explanation: "Language quality cannot replace task coverage. Using fewer than two prompts limits Task fulfilment.",
  },
  {
    id: "development",
    prompt: "Which is the strongest body-paragraph development?",
    options: [
      "Tourism affects the environment. This is a serious problem.",
      "Tourism affects the environment because tourists go to many places.",
      "Large visitor numbers can increase waste and damage fragile habitats, which may eventually make the destination less attractive to future tourists.",
    ],
    answer:
      "Large visitor numbers can increase waste and damage fragile habitats, which may eventually make the destination less attractive to future tourists.",
    explanation: "The strongest option makes a claim, explains the effect, and connects it to the wider argument.",
  },
  {
    id: "introduction",
    prompt: "What should the introduction do?",
    options: [
      "Give a detailed history of the topic",
      "Introduce the issue and make the direction of the argument clear",
      "List every example that will appear later",
    ],
    answer: "Introduce the issue and make the direction of the argument clear",
    explanation: "A strong introduction helps the reader understand the topic and your position.",
  },
  {
    id: "under-length",
    prompt: "Your essay is 205 words but answers the question clearly. What is the main risk?",
    options: [
      "There is no risk because the content is relevant",
      "The response is under length, so the marks may be limited",
      "The system will automatically add fifteen words",
    ],
    answer: "The response is under length, so the marks may be limited",
    explanation: "The target is 220-280 words. Under-length essays may not contain enough development and are subject to marking limitations.",
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

export default function OteWritingAdvancedEssayGuide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const menuPath = getSitePath(nativeRoutes ? "/writing/training/advanced-essay" : "/ote/writing/training/advanced-essay");
  const practicePath = getSitePath(
    nativeRoutes ? "/writing/training/advanced-essay/practice" : "/ote/writing/training/advanced-essay/practice"
  );
  const answeredCount = Object.keys(answers).length;
  const correctCount = useMemo(
    () => quizQuestions.filter((question) => answers[question.id] === question.answer).length,
    [answers]
  );

  function selectAnswer(questionId, answer) {
    setAnswers((current) => ({ ...current, [questionId]: answer }));
  }

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Advanced Writing Part 1 Essay Guide | Seif English"
        description="Prepare for the OTE Advanced Writing Part 1 essay task with structure, criteria, and a review quiz."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to advanced essay training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Writing Part 1</p>
        <h1>The Advanced Essay Task</h1>
        <p>
          Write a 220-280 word essay for your tutor. Answer the exact question, develop a clear
          argument, and include at least two of the three ideas in the task.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="Advanced essay essentials">
        <div>
          <Clock3 size={24} aria-hidden="true" />
          <strong>30 minutes</strong>
          <span>Plan your position, write the essay, and leave enough time to check it.</span>
        </div>
        <div>
          <FileText size={24} aria-hidden="true" />
          <strong>220-280 words</strong>
          <span>Develop your points fully while keeping the essay focused.</span>
        </div>
        <div>
          <ListChecks size={24} aria-hidden="true" />
          <strong>At least 2 ideas</strong>
          <span>Use and develop at least two of the three prompts provided.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How the Essay Task Works</h2>
        <p>
          The task begins with a general topic from a class discussion. You receive an essay statement,
          a question, and three ideas. The question may ask you to agree or disagree, decide whether a
          development is positive or negative, choose between opinions, or compare advantages and disadvantages.
        </p>
        <p>
          You are writing for an academic tutor, so keep the register appropriately formal. You do not
          need all three prompts: two well-developed ideas are usually stronger than three ideas mentioned briefly.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>What Examiners Look For</h2>
        <div className="ote-training-compare" role="table" aria-label="Advanced essay marking areas">
          <div className="ote-training-compare-head" role="row">
            <span role="columnheader">Area</span>
            <span role="columnheader">What examiners want</span>
            <span role="columnheader">Useful moves</span>
          </div>
          {criteriaRows.map((row) => (
            <div className="ote-training-compare-row" role="row" key={row.criterion}>
              <span role="cell">{row.criterion}</span>
              <span role="cell">{row.examinersLookFor}</span>
              <span role="cell">{row.usefulMoves}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>A Reliable Essay Structure</h2>
        <div className="ote-training-rule-grid">
          <article>
            <PenLine size={22} aria-hidden="true" />
            <h3>Introduction</h3>
            <p>Introduce the issue, paraphrase the task, and make your position clear.</p>
          </article>
          <article>
            <GraduationCap size={22} aria-hidden="true" />
            <h3>Main paragraphs</h3>
            <p>Develop two prompts with reasons, consequences, examples, or a response to an opposing view.</p>
          </article>
          <article>
            <CheckCircle2 size={22} aria-hidden="true" />
            <h3>Conclusion</h3>
            <p>Bring the argument together and answer the question clearly without adding a new idea.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <ListChecks size={22} aria-hidden="true" />
            <h3>Build around the prompts</h3>
            <p>Use at least two ideas and turn them into developed arguments, not repeated bullet points.</p>
          </article>
          <article>
            <PenLine size={22} aria-hidden="true" />
            <h3>Explain every claim</h3>
            <p>A point is developed when the reader understands why it matters or what example supports it.</p>
          </article>
          <article>
            <FileText size={22} aria-hidden="true" />
            <h3>Keep one argument</h3>
            <p>Your introduction, body paragraphs, and conclusion should support the same overall position.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section ote-training-quiz">
        <div className="ote-training-quiz-header">
          <div>
            <h2>Advanced Essay Review Quiz</h2>
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
              to sharpen your essay plan.
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
          Open timed Advanced essay practice
        </button>
      </section>
    </main>
  );
}
