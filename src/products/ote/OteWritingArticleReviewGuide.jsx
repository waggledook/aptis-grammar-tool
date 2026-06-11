import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  MessageSquareText,
  Newspaper,
  RotateCcw,
  Sparkles,
  Star,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const articleReviewTypes = [
  {
    taskType: "Magazine Article",
    corePurpose: "To interest and inform a general reader.",
    keyElements: ["A catchy title", "Personal examples or facts", "Clear description or a short story"],
    usefulLanguage: ["Have you ever wondered...?", "What makes them stand out is...", "It is an experience you won't forget."],
  },
  {
    taskType: "Review",
    corePurpose: "To give your opinion and tell the reader if you recommend it.",
    keyElements: ["The name of the product or place", "Good points and bad points", "A clear final opinion"],
    usefulLanguage: ["I was highly impressed by...", "One major drawback is...", "I would thoroughly recommend..."],
  },
];

const quizQuestions = [
  {
    id: "article-title",
    prompt: "You choose to write a magazine article about a famous sports star. What is the best way to format and start your text?",
    options: [
      'Start with "Dear Editor," and explain why you like sports.',
      "Give your article a catchy, interesting title to grab the reader's attention.",
      'Start immediately with: "This is an essay about a famous football player."',
    ],
    answer: "Give your article a catchy, interesting title to grab the reader's attention.",
    explanation:
      "Articles are for general readers. A good title shows the reader what kind of text it is.",
  },
  {
    id: "review-lexis",
    prompt: "You are writing a review of an educational website. What kind of vocabulary should you use?",
    options: [
      'Repeat the words "good" and "nice" as many times as possible so your opinion is clear.',
      "Use simple lists of features without using any descriptive language.",
      "Use clear adjectives and adverbs that fit the topic.",
    ],
    answer: "Use clear adjectives and adverbs that fit the topic.",
    explanation:
      'Specific words help your opinion. For example, "easy to use" or "very interactive" is stronger than only saying "good website."',
  },
  {
    id: "review-ending",
    prompt: "What should a strong OTE review include at the end?",
    options: [
      "A clear recommendation to the reader.",
      "A promise to write another text next week.",
      'A sign-off that says "Yours sincerely,".',
    ],
    answer: "A clear recommendation to the reader.",
    explanation:
      "A review helps the reader decide. Tell them clearly if you recommend it or not.",
  },
  {
    id: "paragraphing",
    prompt: "How should paragraphs in an article or review be different from an essay?",
    options: [
      "Use the exact same paragraph format: serious and balanced, without showing personal feelings.",
      "Use paragraphs, but make them shorter and more interesting for the reader.",
      "Write it as a numbered list of points so the magazine editor can read it quickly.",
    ],
    answer:
      "Use paragraphs, but make them shorter and more interesting for the reader.",
    explanation:
      "You still need clear paragraphs, but a magazine text should feel more lively than an essay.",
  },
  {
    id: "personal-feelings",
    prompt: "True or false: you can include personal feelings in an OTE article or review task.",
    options: ["True", "False"],
    answer: "True",
    explanation:
      "Yes. In articles and reviews, you can show your opinions and feelings for a general reader.",
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

export default function OteWritingArticleReviewGuide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const menuPath = getSitePath(nativeRoutes ? "/writing/training/article-review" : "/ote/writing/training/article-review");
  const practicePath = getSitePath(
    nativeRoutes ? "/writing/training/article-review/practice" : "/ote/writing/training/article-review/practice"
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
        title="OTE Writing Part 2 Article and Review Guide | Seif English"
        description="Understand the OTE Writing Part 2 article and review option, reader, tone, structure, and recommendation language."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to article / review training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Writing Part 2</p>
        <h1>Articles and Reviews</h1>
        <p>
          When you choose the non-essay option in Part 2, you write either a magazine article or a
          review. This option tests how well you can describe, tell a short story, give opinions, and
          recommend things to readers.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="Writing Part 2 article and review essentials">
        <div>
          <Clock3 size={24} aria-hidden="true" />
          <strong>25 minutes</strong>
          <span>Plan the structure, write the descriptions, and check your word count.</span>
        </div>
        <div>
          <FileText size={24} aria-hidden="true" />
          <strong>100-160 words</strong>
          <span>Keep your answer focused and do not add too many extra ideas.</span>
        </div>
        <div>
          <MessageSquareText size={24} aria-hidden="true" />
          <strong>Reader shift</strong>
          <span>Write for a fellow student or magazine reader, not a teacher.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How Articles and Reviews Work</h2>
        <p>
          Unlike the essay, an article or review is written for a general reader. It should sound
          lively and interesting, but it still needs clear paragraphs.
        </p>
        <p>
          Articles usually give information, descriptions, or a short story. Reviews give an opinion
          about a product, place, website, film, restaurant, or experience. Reviews should finish
          with a clear recommendation.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>Article vs. Review: What to Focus On</h2>
        <div className="ote-training-compare" role="table" aria-label="OTE article and review comparison">
          <div className="ote-training-compare-head" role="row">
            <span role="columnheader">Task Type</span>
            <span role="columnheader">Main Purpose</span>
            <span role="columnheader">What to Include</span>
          </div>
          {articleReviewTypes.map((row) => (
            <div className="ote-training-compare-row" role="row" key={row.taskType}>
              <span role="cell">{row.taskType}</span>
              <span role="cell">{row.corePurpose}</span>
              <span role="cell">
                {row.keyElements.join(" / ")}
                <br />
                <strong>{row.usefulLanguage.join(" / ")}</strong>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Newspaper size={22} aria-hidden="true" />
            <h3>Use the right format</h3>
            <p>
              Give articles a catchy title. Do not use email greetings, essay openings, numbered
              lists, or formal endings.
            </p>
          </article>
          <article>
            <Sparkles size={22} aria-hidden="true" />
            <h3>Make it vivid</h3>
            <p>
              Use descriptive adjectives, specific examples, and questions that speak to the reader.
            </p>
          </article>
          <article>
            <Star size={22} aria-hidden="true" />
            <h3>End with purpose</h3>
            <p>
              A review needs a final recommendation. An article needs a clear final idea that feels
              complete.
            </p>
          </article>
        </div>
      </section>

      <section className="ote-training-section ote-training-quiz">
        <div className="ote-training-quiz-header">
          <div>
            <h2>Joint Review and Article Quiz</h2>
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
              to improve your article and review plan.
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
          Open timed article / review practice
        </button>
      </section>
    </main>
  );
}
