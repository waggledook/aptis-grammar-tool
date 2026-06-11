import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Landmark,
  ListChecks,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const essayCriteria = [
  {
    criterion: "Answering the task",
    examinersLookFor: "A clear answer to the question, with good examples and a formal style.",
    usefulLanguage: ["It is widely believed that...", "Evidence suggests that..."],
  },
  {
    criterion: "Structure",
    examinersLookFor: "Clear paragraphs and linking words that help the reader follow your ideas.",
    usefulLanguage: ["As a result,", "On the other hand,", "Also,"],
  },
  {
    criterion: "Grammar & Vocabulary",
    examinersLookFor: "Some longer sentences, correct grammar, and words that fit the topic.",
    usefulLanguage: ["If schools had more money, ...", "...actions which are taken...", "...important advantages..."],
  },
];

const quizQuestions = [
  {
    id: "opening-topic",
    prompt: 'You receive the essay title: "Do young people spend too much money on clothes?" How should you introduce the topic in your first sentence?',
    options: [
      "Personally, I love shopping for clothes every single weekend with my friends.",
      "In recent years, fashion has become very popular, and many people now discuss how much young people spend on clothes.",
      "I am writing this essay because my teacher wants us to talk about buying clothes.",
    ],
    answer:
      "In recent years, fashion has become very popular, and many people now discuss how much young people spend on clothes.",
    explanation:
      "A good essay introduction starts with the topic, not with a personal story or the exam situation.",
  },
  {
    id: "paragraphing",
    prompt: "How should you organize your answer within the 100-160 word limit?",
    options: [
      "Type the entire response as one single block of text to maximize your space.",
      "Write a clear 3 or 4-paragraph structure: introduction, one or two argument paragraphs, and a short conclusion.",
      "Start a brand-new line after every single sentence you write.",
    ],
    answer:
      "Write a clear 3 or 4-paragraph structure: introduction, one or two argument paragraphs, and a short conclusion.",
    explanation:
      "Clear paragraphs help the reader follow your ideas. One big block is hard to read, and one line for every sentence looks unnatural.",
  },
  {
    id: "complex-grammar",
    prompt: "Which sentence uses a more advanced sentence pattern?",
    options: [
      "Young people buy clothes online because it is easy and fast.",
      "Online shopping is fun and my roommates do it whenever they are bored.",
      "Although many young people already have enough clothes, they often buy more because fashion is enjoyable.",
    ],
    answer:
      "Although many young people already have enough clothes, they often buy more because fashion is enjoyable.",
    explanation:
      "It uses Although to connect two ideas, and the vocabulary is more exact. The other sentences are simpler.",
  },
  {
    id: "conclusion",
    prompt: "What is the main goal of the final concluding paragraph?",
    options: [
      "To introduce a brand-new third argument that you did not have time to write earlier.",
      "To summarize your main viewpoints and leave the reader with a clear final thought.",
      "To ask the teacher a direct question to make the ending sound interactive.",
    ],
    answer: "To summarize your main viewpoints and leave the reader with a clear final thought.",
    explanation:
      "A conclusion brings your main ideas together. Do not add a new big idea at the end.",
  },
  {
    id: "word-count",
    prompt: "True or false: if you write 175 words, you will automatically get zero.",
    options: ["True", "False"],
    answer: "False",
    explanation:
      "You will not automatically get zero, but writing too much wastes time and can lead to more mistakes. Keep it focused.",
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

export default function OteWritingEssayGuide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const menuPath = getSitePath(nativeRoutes ? "/writing/training/essay" : "/ote/writing/training/essay");
  const practicePath = getSitePath(nativeRoutes ? "/writing/training/essay/practice" : "/ote/writing/training/essay/practice");
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
        title="OTE Writing Part 2 Essay Guide | Seif English"
        description="Understand the OTE Writing Part 2 essay task, formal style, organization, timing, and word count."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to essay training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Writing Part 2</p>
        <h1>The Essay Task</h1>
        <p>
          In Part 2 of the OTE Writing module, you can choose to write an essay about a classroom
          topic. A strong answer gives a clear opinion, uses clear paragraphs, and keeps a formal,
          serious style.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="Writing Part 2 essay essentials">
        <div>
          <Clock3 size={24} aria-hidden="true" />
          <strong>25 minutes</strong>
          <span>Read the title, plan your opinion, write the essay, and check it.</span>
        </div>
        <div>
          <FileText size={24} aria-hidden="true" />
          <strong>100-160 words</strong>
          <span>Aim for about 130-150 words so the argument has enough development.</span>
        </div>
        <div>
          <GraduationCap size={24} aria-hidden="true" />
          <strong>Teacher reader</strong>
          <span>Write for a teacher or examiner. Use a formal style and avoid slang.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How the Essay Works</h2>
        <p>
          The task gives you an essay title. It is usually about a classroom topic such as education,
          shopping, travel, health, technology, or the environment. Answer the title directly.
        </p>
        <p>
          Before you write, decide your opinion and choose one or two main points. Then write a short
          essay with an introduction, one or two middle paragraphs, and a conclusion.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>Three Parts of a Strong Essay</h2>
        <div className="ote-training-compare" role="table" aria-label="OTE essay scoring areas">
          <div className="ote-training-compare-head" role="row">
            <span role="columnheader">Criteria</span>
            <span role="columnheader">What Examiners Want</span>
            <span role="columnheader">Useful Structures</span>
          </div>
          {essayCriteria.map((row) => (
            <div className="ote-training-compare-row" role="row" key={row.criterion}>
              <span role="cell">{row.criterion}</span>
              <span role="cell">{row.examinersLookFor}</span>
              <span role="cell">{row.usefulLanguage.join(" / ")}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Landmark size={22} aria-hidden="true" />
            <h3>Sound formal</h3>
            <p>
              Avoid personal stories, slang, and comments about the exam. Focus on the topic and use
              polite, serious sentences.
            </p>
          </article>
          <article>
            <ListChecks size={22} aria-hidden="true" />
            <h3>Control the shape</h3>
            <p>
              Use 3 or 4 short paragraphs. Each paragraph should have one clear job: start, give a
              reason, show another side, or finish.
            </p>
          </article>
          <article>
            <Clock3 size={22} aria-hidden="true" />
            <h3>Leave review time</h3>
            <p>
              Check the title, word count, linking words, verbs, and whether your ending matches
              your ideas.
            </p>
          </article>
        </div>
      </section>

      <section className="ote-training-section ote-training-quiz">
        <div className="ote-training-quiz-header">
          <div>
            <h2>Introductory Review Quiz</h2>
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
            <strong>{correctCount === quizQuestions.length ? "Excellent, full marks." : "Good review."}</strong>
            <span>
              You answered {correctCount} of {quizQuestions.length} correctly. Use the feedback above
              to improve your essay plan.
            </span>
            <button type="button" onClick={() => setAnswers({})}>
              <RotateCcw size={17} aria-hidden="true" />
              Try again
            </button>
          </div>
        )}
      </section>

      <section className="ote-training-section">
        <button className="ote-training-primary-link" type="button" onClick={() => navigate(practicePath)}>
          Open timed essay practice
        </button>
      </section>
    </main>
  );
}
