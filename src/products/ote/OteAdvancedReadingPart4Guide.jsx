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
    type: "Fact, opinion, or attitude",
    meaning: "Identify what the writer states, believes, doubts, approves of, or criticizes.",
  },
  {
    type: "Writer's purpose",
    meaning: "Explain why a paragraph, example, comparison, or phrase is included.",
  },
  {
    type: "Implication and inference",
    meaning: "Understand a conclusion that is supported but not stated in exactly the same words.",
  },
  {
    type: "Words and references",
    meaning: "Work out meaning from context or identify what a word such as this, they, or it refers to.",
  },
  {
    type: "Rhetorical purpose",
    meaning: "Recognize how examples, comparisons, or exaggeration support the writer's point.",
  },
  {
    type: "Global meaning",
    meaning: "Identify the writer's overall argument, conclusion, or view of the subject.",
  },
];

const quizQuestions = [
  {
    id: "time",
    prompt: "How much time do you have for Reading Part 4?",
    options: ["8 minutes", "10 minutes", "11 minutes"],
    answer: "8 minutes",
    explanation: "The long text and all four or five questions share one eight-minute timer.",
  },
  {
    id: "questions",
    prompt: "How many questions can appear in Part 4?",
    options: ["Exactly four", "Four or five", "Six or seven"],
    answer: "Four or five",
    explanation: "The task contains four or five three-option multiple-choice questions on one long text.",
  },
  {
    id: "order",
    prompt: "How are most questions arranged in relation to the text?",
    options: [
      "They normally follow the order of information in the text",
      "They are arranged from longest to shortest",
      "They appear in random paragraph order",
    ],
    answer: "They normally follow the order of information in the text",
    explanation: "The specifications state that questions follow the order of the relevant information, helping you move through the passage efficiently.",
  },
  {
    id: "example-purpose",
    prompt: "A question asks why the writer gives an example. What should you identify?",
    options: [
      "Whether the example is factually interesting",
      "Which larger point or claim the example is supporting",
      "Whether the example contains the answer to the next question",
    ],
    answer: "Which larger point or claim the example is supporting",
    explanation: "Rhetorical-purpose questions test the function of the example, not simply the information inside it.",
  },
  {
    id: "overall",
    prompt: "Which evidence is most important for an overall-view question?",
    options: [
      "One striking sentence from the middle",
      "The direction and conclusion of the whole text",
      "The paragraph containing the most difficult vocabulary",
    ],
    answer: "The direction and conclusion of the whole text",
    explanation: "Global questions require the writer's complete argument or position, not one isolated detail.",
  },
  {
    id: "partly-true",
    prompt: "An option accurately describes one paragraph but misrepresents the writer's overall view. Can it answer a global question?",
    options: ["Yes", "No", "Only if it repeats the title"],
    answer: "No",
    explanation: "A global answer must represent the complete text, even when a distractor is true of one small section.",
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

export default function OteAdvancedReadingPart4Guide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const completedLoggedRef = useRef(false);
  const basePath = nativeRoutes
    ? "/reading/advanced/part-4-long-text"
    : "/ote/reading/advanced/part-4-long-text";
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
      progressId: "reading.part4.advanced-guide",
      section: "reading",
      part: "part-4",
      mode: "advanced_guide",
      taskTitle: "Advanced Reading Part 4 guide",
      score: correctCount,
      total: quizQuestions.length,
    });
  }, [answeredCount, correctCount]);

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Advanced Reading Part 4 Long Text Guide | Seif English"
        description="Prepare for OTE Advanced Reading Part 4 with question types, long-text strategy, distractor analysis, and a review quiz."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Part 4 training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Advanced Reading Part 4</p>
        <h1>Long Text</h1>
        <p>
          Read one extended passage and answer four or five three-option questions. The task tests
          detailed understanding, inference, writer attitude, purpose, and the overall argument.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="Advanced Reading Part 4 essentials">
        <div>
          <Clock3 size={24} aria-hidden="true" />
          <strong>8 minutes</strong>
          <span>The passage and all questions share one strict timer.</span>
        </div>
        <div>
          <FileText size={24} aria-hidden="true" />
          <strong>1 long text</strong>
          <span>Follow the writer's argument across several paragraphs rather than reading isolated lines.</span>
        </div>
        <div>
          <ListChecks size={24} aria-hidden="true" />
          <strong>4 or 5 questions</strong>
          <span>Each question has three options, and the information normally appears in text order.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How the Task Works</h2>
        <p>
          The text appears alongside all the questions. Most questions follow the order of the
          relevant information, so you can work progressively through the passage. However, an
          overall-view question may require you to consider the complete text and its conclusion.
        </p>
        <p>
          The correct option normally paraphrases the passage. Distractors are realistic and rooted
          in the text, which means they may be partly true, refer to the correct paragraph, or use the
          writer's vocabulary while changing the actual meaning.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>What Can the Questions Test?</h2>
        <div className="ote-training-compare" role="table" aria-label="Advanced Reading Part 4 question types">
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
          <li><strong>Preview the title and questions.</strong> Notice whether each item asks about a paragraph, phrase, example, attitude, or overall view.</li>
          <li><strong>Read the opening carefully.</strong> Establish the topic, problem, and likely direction of the writer's argument.</li>
          <li><strong>Work through local questions in order.</strong> Locate the relevant paragraph, then read enough context before and after the key line.</li>
          <li><strong>Paraphrase the answer mentally.</strong> Decide what the passage means before allowing the options to influence you.</li>
          <li><strong>Compare complete claims.</strong> Check certainty, attitude, cause, contrast, and scope, not only topic vocabulary.</li>
          <li><strong>Use the whole text for global questions.</strong> Give extra weight to repeated ideas, turning points, and the final conclusion.</li>
        </ol>
      </section>

      <section className="ote-training-section">
        <h2>How Distractors Mislead You</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Eye size={22} aria-hidden="true" />
            <h3>Partly true</h3>
            <p>The option reports a real detail but does not answer the question being asked.</p>
          </article>
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>Too strong or too narrow</h3>
            <p>The option changes words such as may, often, partly, or some into a much stronger claim.</p>
          </article>
          <article>
            <Search size={22} aria-hidden="true" />
            <h3>Right paragraph, wrong purpose</h3>
            <p>The option describes what an example says but not why the writer included it.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <BookOpen size={22} aria-hidden="true" />
            <h3>Read around the evidence</h3>
            <p>A single sentence may depend on a contrast, qualification, or conclusion in the surrounding lines.</p>
          </article>
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>Separate content from function</h3>
            <p>When asked why the writer uses an example or comparison, identify the larger point it supports.</p>
          </article>
          <article>
            <Clock3 size={22} aria-hidden="true" />
            <h3>Keep moving through the text</h3>
            <p>Use question order to avoid repeatedly searching from the beginning, and reserve time for the overall question.</p>
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
          Open timed Advanced Part 4 practice
        </button>
      </section>
    </main>
  );
}
