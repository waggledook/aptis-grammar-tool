import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  Link2,
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

const clueRows = [
  {
    clue: "Reference words",
    examples: "this, these, such, they, it, the former",
    use: "Check that every pronoun or reference has a clear noun or idea to refer back to.",
  },
  {
    clue: "Linking words",
    examples: "however, therefore, for example, in contrast",
    use: "Decide whether the missing sentence should continue, contrast, explain, or give a result.",
  },
  {
    clue: "Lexical links",
    examples: "repeated topic words, synonyms, related concepts",
    use: "Follow the topic chain, but do not rely on vocabulary alone.",
  },
  {
    clue: "Grammar and time",
    examples: "tense, singular/plural, articles, comparison",
    use: "Make sure the sentence fits grammatically with the language around the gap.",
  },
  {
    clue: "Paragraph function",
    examples: "example, explanation, objection, conclusion",
    use: "Ask what job the missing sentence must perform in the argument or story.",
  },
];

const quizQuestions = [
  {
    id: "time",
    prompt: "How much time do you have for Reading Part 3?",
    options: ["8 minutes", "10 minutes", "11 minutes"],
    answer: "11 minutes",
    explanation: "The complete gapped-text task has an eleven-minute timer.",
  },
  {
    id: "gaps",
    prompt: "How many sentences are missing from the text?",
    options: ["Five", "Six", "Seven"],
    answer: "Six",
    explanation: "There are six gaps to complete.",
  },
  {
    id: "distractor",
    prompt: "How many sentence options do you see?",
    options: ["Six, and all are used", "Seven, with one extra sentence", "Eight, with two extra sentences"],
    answer: "Seven, with one extra sentence",
    explanation: "Six sentences complete the text and one plausible distractor is not used.",
  },
  {
    id: "both-sides",
    prompt: "A sentence fits the words before a gap but creates a strange connection with the next sentence. What should you do?",
    options: [
      "Use it because the first connection is enough",
      "Reject it and test a sentence that fits both sides",
      "Use it only if it repeats a topic word",
    ],
    answer: "Reject it and test a sentence that fits both sides",
    explanation: "Every correct sentence must connect logically and grammatically with the text before and after the gap.",
  },
  {
    id: "pronoun",
    prompt: "An option begins with 'This approach'. What should you check first?",
    options: [
      "Whether the previous text clearly describes an approach",
      "Whether the sentence contains advanced vocabulary",
      "Whether another option begins with a different pronoun",
    ],
    answer: "Whether the previous text clearly describes an approach",
    explanation: "Reference expressions need a clear and logical antecedent in the surrounding text.",
  },
  {
    id: "topic-only",
    prompt: "Why can matching by topic word alone be dangerous?",
    options: [
      "Because correct sentences never repeat topic vocabulary",
      "Because several options may discuss the same topic but perform different logical functions",
      "Because topic vocabulary is not tested in Reading Part 3",
    ],
    answer: "Because several options may discuss the same topic but perform different logical functions",
    explanation: "A distractor may share the topic but introduce an example, contrast, result, or reference that does not fit the gap.",
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

export default function OteAdvancedReadingPart3Guide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const completedLoggedRef = useRef(false);
  const basePath = nativeRoutes
    ? "/reading/advanced/part-3-gapped-text"
    : "/ote/reading/advanced/part-3-gapped-text";
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
      progressId: "reading.part3.advanced-guide",
      section: "reading",
      part: "part-3",
      mode: "advanced_guide",
      taskTitle: "Advanced Reading Part 3 guide",
      score: correctCount,
      total: quizQuestions.length,
    });
  }, [answeredCount, correctCount]);

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Advanced Reading Part 3 Gapped Text Guide | Seif English"
        description="Prepare for OTE Advanced Reading Part 3 with cohesion clues, a reliable gapped-text method, common traps, and a review quiz."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Part 3 training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Advanced Reading Part 3</p>
        <h1>Gapped Text</h1>
        <p>
          Six sentences have been removed from a long article or book extract. Rebuild the text by
          choosing the sentence that connects correctly with the ideas before and after each gap.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="Advanced Reading Part 3 essentials">
        <div>
          <Clock3 size={24} aria-hidden="true" />
          <strong>11 minutes</strong>
          <span>Read the whole text, complete the clearest gaps, and leave time for a final reread.</span>
        </div>
        <div>
          <FileText size={24} aria-hidden="true" />
          <strong>6 gaps</strong>
          <span>Each missing sentence must fit the text on both sides of its gap.</span>
        </div>
        <div>
          <ListChecks size={24} aria-hidden="true" />
          <strong>7 sentences</strong>
          <span>One sentence is an extra distractor and should not be used.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How the Task Works</h2>
        <p>
          The first paragraph is complete, helping you understand the topic and style. Six later
          sentences are missing. You drag or place one option into each gap, and each option can be
          used only once.
        </p>
        <p>
          This task tests how a whole text is organized. A correct sentence must make sense in the
          argument, connect clearly with surrounding ideas, and fit grammatically. A sentence can be
          about the right topic and still be wrong for that position.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>Clues That Connect a Text</h2>
        <div className="ote-training-compare" role="table" aria-label="Advanced Reading Part 3 cohesion clues">
          <div className="ote-training-compare-head" role="row">
            <span role="columnheader">Clue</span>
            <span role="columnheader">Examples</span>
            <span role="columnheader">What to check</span>
          </div>
          {clueRows.map((row) => (
            <div className="ote-training-compare-row" role="row" key={row.clue}>
              <span role="cell">{row.clue}</span>
              <span role="cell">{row.examples}</span>
              <span role="cell">{row.use}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>A Reliable Gapped-Text Method</h2>
        <ol className="ote-training-checklist">
          <li><strong>Read the title and complete first paragraph.</strong> Establish the topic, writer's direction, and register.</li>
          <li><strong>Skim the whole gapped text.</strong> Follow the main progression without trying to solve every gap immediately.</li>
          <li><strong>Study both sides of one gap.</strong> Decide what kind of sentence is missing: example, contrast, result, explanation, or new stage.</li>
          <li><strong>Predict before choosing.</strong> Think about the likely content and connection, then compare the options.</li>
          <li><strong>Check references and grammar.</strong> Make sure pronouns, articles, tense, and singular/plural links are clear.</li>
          <li><strong>Reread the complete paragraph.</strong> The inserted sentence should feel necessary and natural, not merely possible.</li>
          <li><strong>Use elimination carefully.</strong> The final unused sentence must genuinely fail to fit, not simply be the last one left.</li>
        </ol>
      </section>

      <section className="ote-training-section">
        <h2>Three Levels of Fit</h2>
        <div className="ote-training-rule-grid">
          <article>
            <FileText size={22} aria-hidden="true" />
            <h3>Content</h3>
            <p>The sentence continues the correct topic and does not introduce an unexplained new idea.</p>
          </article>
          <article>
            <Link2 size={22} aria-hidden="true" />
            <h3>Logic</h3>
            <p>The relationship is correct: continuation, contrast, example, cause, result, or conclusion.</p>
          </article>
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>Language</h3>
            <p>Pronouns, tense, articles, and linking expressions connect naturally with both sides.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Link2 size={22} aria-hidden="true" />
            <h3>Always check both sides</h3>
            <p>A sentence that links well only to the previous line is not enough.</p>
          </article>
          <article>
            <Search size={22} aria-hidden="true" />
            <h3>Predict the missing job</h3>
            <p>Decide whether the gap needs an example, contrast, result, explanation, or transition before looking for wording.</p>
          </article>
          <article>
            <Clock3 size={22} aria-hidden="true" />
            <h3>Start with strong connections</h3>
            <p>Clear pronoun, linker, or cause-and-result clues can secure easy answers and reduce the remaining options.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section ote-training-quiz">
        <div className="ote-training-quiz-header">
          <div>
            <h2>Part 3 Review Quiz</h2>
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
              to strengthen your cohesion checks.
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
          Open timed Advanced Part 3 practice
        </button>
      </section>
    </main>
  );
}
