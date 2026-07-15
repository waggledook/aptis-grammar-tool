import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  GitMerge,
  ListChecks,
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
    examinersLookFor: "Synthesize the main ideas with appropriate supporting details from both texts. Communicate the topic clearly, avoid unnecessary information and maintain an appropriate academic register.",
  },
  {
    criterion: "Organization",
    examinersLookFor: "Reorganize information in a logical way rather than following the sources mechanically. Create a coherent progression and use cohesive features to show relationships between ideas.",
  },
  {
    criterion: "Grammar",
    examinersLookFor: "Adapt source structures rather than copying them. Maintain grammatical control while expressing the information clearly and concisely.",
  },
  {
    criterion: "Lexis",
    examinersLookFor: "Adapt source vocabulary where possible while keeping necessary technical terms accurate. Use precise, concise language and avoid forced synonyms.",
  },
];

const methodSteps = [
  "Identify the overarching idea shared by both texts.",
  "Find the two or three main ideas that explain or develop it.",
  "Match supporting details to each main idea, including details found in the other source.",
  "Mark long examples, repetition and low-priority information that can be omitted.",
  "Select enough supporting detail to make each main idea understandable.",
  "Organize the paragraph around ideas, not around the textbook and lecture separately.",
  "Paraphrase vocabulary and sentence structures without changing the meaning.",
  "Check that both sources are represented and remove unnecessary wording.",
  "Check the word count.",
];

const quizQuestions = [
  {
    id: "synthesis",
    prompt: "What does it mean to combine or synthesize the two texts?",
    options: [
      "Copy the most advanced sentences from both texts",
      "Connect related ideas from both sources in a new, logical order",
      "Write about the textbook first and the lecture second",
    ],
    answer: "Connect related ideas from both sources in a new, logical order",
    explanation: "A strong summary is organized around ideas, not around the order of the two source texts.",
  },
  {
    id: "one-source",
    prompt: "A candidate writes an accurate summary using only the textbook extract. What is the main problem?",
    options: [
      "The response does not use and combine information from both sources",
      "The paragraph should be divided into two sections",
      "The language is too academic",
    ],
    answer: "The response does not use and combine information from both sources",
    explanation: "Both sources are essential. If only one source is used, completing the task and organization are capped at B1.2.",
  },
  {
    id: "opinion",
    prompt: "Which sentence is least suitable for the summary?",
    options: [
      "High urban temperatures are particularly dangerous for vulnerable residents.",
      "Green and reflective roofs can reduce the heat stored by buildings.",
      "In my opinion, governments should spend far more money on this problem.",
    ],
    answer: "In my opinion, governments should spend far more money on this problem.",
    explanation: "The task asks you to summarize source information. Do not add your own opinion or recommendation.",
  },
  {
    id: "104-words",
    prompt: "A candidate writes 104 words. Which statement is correct?",
    options: [
      "The highest possible score is B2.2",
      "The response is slightly over the stated limit, but it can still receive any score",
      "The response receives zero for completing the task",
    ],
    answer: "The response is slightly over the stated limit, but it can still receive any score",
    explanation: "Responses up to 105 words can still receive any score, but it is safer to aim for 90-100 words.",
  },
  {
    id: "112-words",
    prompt: "A candidate writes an excellent summary of 112 words. What does this mean?",
    options: [
      "There is no problem because the content is excellent",
      "The final twelve words will not be read",
      "The highest score in each marking area is B2.2",
    ],
    answer: "The highest score in each marking area is B2.2",
    explanation: "A summary of 106-120 words cannot receive more than B2.2 in any marking area.",
  },
  {
    id: "cross-text-detail",
    prompt: "A main idea appears in the lecture, while a useful explanation of it appears in the textbook. What should you do?",
    options: [
      "Summarize each source in a different sentence.",
      "Connect the main idea and explanation in the same part of your summary.",
      "Use only the idea from the lecture.",
    ],
    answer: "Connect the main idea and explanation in the same part of your summary.",
    explanation: "This is cross-text synthesis. Organize the response around the relationship between the pieces of information, not their original sources.",
  },
  {
    id: "information-hierarchy",
    prompt: "Which plan is most suitable for an 80–100-word summary?",
    options: [
      "Include every example so that no information is lost.",
      "State the overarching idea, cover the main ideas and select only useful supporting details.",
      "Give equal numbers of words to the textbook and lecture.",
    ],
    answer: "State the overarching idea, cover the main ideas and select only useful supporting details.",
    explanation: "The two sources do not need equal space. The priority is a clear and accurate information hierarchy.",
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

export default function OteWritingAdvancedSummaryGuide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const menuPath = getSitePath(nativeRoutes ? "/writing/training/advanced-summary" : "/ote/writing/training/advanced-summary");
  const practicePath = getSitePath(
    nativeRoutes ? "/writing/training/advanced-summary/practice" : "/ote/writing/training/advanced-summary/practice"
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
        title="OTE Advanced Writing Part 2 Summary Guide | Seif English"
        description="Prepare for the OTE Advanced Writing Part 2 summary task with synthesis strategy, word-limit guidance, and a quiz."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to advanced summary training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Writing Part 2</p>
        <h1>The Advanced Summary Task</h1>
        <p>
          Read a textbook extract and a lecture transcript about the same academic topic. Then write
          one paragraph that combines the main ideas from both texts in 80-100 words.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="Advanced summary essentials">
        <div>
          <Clock3 size={24} aria-hidden="true" />
          <strong>20 minutes</strong>
          <span>Read both texts, identify main ideas, write, and check your answer.</span>
        </div>
        <div>
          <FileText size={24} aria-hidden="true" />
          <strong>80-100 words</strong>
          <span>Aim for around 90-100 words so you can cover both texts without extra detail.</span>
        </div>
        <div>
          <GitMerge size={24} aria-hidden="true" />
          <strong>2 sources, 1 paragraph</strong>
          <span>Combine important information from the textbook extract and lecture transcript.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How the Summary Task Works</h2>
        <p>
          The two source texts discuss the same topic but usually provide different information. Your
          job is to decide what is important, connect related information, and give classmates a clear
          understanding of the topic.
        </p>
        <p>
          Do not give your own opinion, add facts from outside the texts, include every example, copy
          long sections, or write one separate summary of each source.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>The Four Marking Areas</h2>
        <div className="ote-training-compare" role="table" aria-label="Advanced summary marking areas">
          <div className="ote-training-compare-head is-two-column" role="row">
            <span role="columnheader">Area</span>
            <span role="columnheader">A strong answer...</span>
          </div>
          {criteriaRows.map((row) => (
            <div className="ote-training-compare-row is-two-column" role="row" key={row.criterion}>
              <span role="cell">{row.criterion}</span>
              <span role="cell">{row.examinersLookFor}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>What Does Combine Mean?</h2>
        <div className="ote-training-rule-grid">
          <article>
            <XCircle size={22} aria-hidden="true" />
            <h3>Weaker approach</h3>
            <p>The textbook says that cities store heat. The lecture says that trees and green roofs can reduce heat.</p>
          </article>
          <article>
            <CheckCircle2 size={22} aria-hidden="true" />
            <h3>Stronger approach</h3>
            <p>Cities store heat because of built surfaces and limited vegetation, so planners can reduce temperatures with trees and green or reflective roofs.</p>
          </article>
          <article>
            <GitMerge size={22} aria-hidden="true" />
            <h3>Why it works</h3>
            <p>The stronger version connects the cause from one text with the solution from the other.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Build an Information Map</h2>
        <p>
          Both texts share one overarching idea. Beneath it, there are usually two or three main ideas,
          each supported by explanations, examples, evidence or processes. A supporting detail may
          appear in a different source from the main idea it develops.
        </p>
        <p>
          Do not assume that the textbook or lecture is always more important. In some tasks, one
          source provides the main framework and the other develops it. In others, the main ideas are
          distributed more evenly.
        </p>
        <p>Before writing, identify:</p>
        <ul className="ote-training-checklist">
          <li><strong>The overarching idea:</strong> the central message that unites both texts.</li>
          <li><strong>The main ideas:</strong> the major points needed to understand that message.</li>
          <li><strong>The supporting details:</strong> selected explanations or examples that clarify the main ideas.</li>
          <li><strong>The redundant information:</strong> accurate material that is not necessary within 100 words.</li>
        </ul>
      </section>

      <section className="ote-training-section">
        <h2>A Reliable Summary Method</h2>
        <ol className="ote-training-checklist">
          {methodSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="ote-training-section">
        <h2>Be Careful with the Word Limit</h2>
        <div className="ote-training-compare" role="table" aria-label="Advanced summary word limit">
          <div className="ote-training-compare-head is-two-column" role="row">
            <span role="columnheader">Length</span>
            <span role="columnheader">What it means</span>
          </div>
          {[
            ["100 words or fewer", "Within the official maximum."],
            ["101-105 words", "Slightly over the stated limit, but still eligible for any score."],
            ["106-120 words", "The highest score in each marking area is B2.2."],
            ["121 words or more", "The highest score in each marking area is B1.2."],
          ].map(([length, meaning]) => (
            <div className="ote-training-compare-row is-two-column" role="row" key={length}>
              <span role="cell">{length}</span>
              <span role="cell">{meaning}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <GitMerge size={22} aria-hidden="true" />
            <h3>Combine by idea</h3>
            <p>Do not write one mini-summary of the textbook followed by one mini-summary of the lecture.</p>
          </article>
          <article>
            <ListChecks size={22} aria-hidden="true" />
            <h3>Select before writing</h3>
            <p>The texts contain more information than you can use. Choose the main ideas first.</p>
          </article>
          <article>
            <FileText size={22} aria-hidden="true" />
            <h3>Make every word useful</h3>
            <p>Avoid personal opinions, repeated points, minor examples, and general conclusions not found in the sources.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section ote-training-quiz">
        <div className="ote-training-quiz-header">
          <div>
            <h2>Advanced Summary Review Quiz</h2>
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
              to sharpen your summary strategy.
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
          Open timed Advanced summary practice
        </button>
      </section>
    </main>
  );
}
