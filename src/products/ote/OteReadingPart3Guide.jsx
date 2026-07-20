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
    examples: "he, she, it, they, this, these",
    use: "Check that the missing sentence refers clearly to a person, thing, or idea nearby.",
  },
  {
    clue: "Linking words",
    examples: "however, therefore, for example, also, instead",
    use: "Decide whether the sentence adds, contrasts, explains, gives an example, or shows a result.",
  },
  {
    clue: "Repeated ideas",
    examples: "synonyms and related topic words",
    use: "Follow the topic from one sentence to the next, but do not match vocabulary alone.",
  },
  {
    clue: "Grammar",
    examples: "tense, singular/plural, articles, comparison",
    use: "Make sure the option fits naturally with the grammar before and after the gap.",
  },
  {
    clue: "Paragraph logic",
    examples: "new stage, reason, result, problem, conclusion",
    use: "Ask what kind of information the paragraph needs at that exact point.",
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
    id: "extra",
    prompt: "How many sentence options are there?",
    options: ["Six, and all are used", "Seven, with one extra sentence", "Eight, with two extra sentences"],
    answer: "Seven, with one extra sentence",
    explanation: "Six options complete the text and one distractor is not used.",
  },
  {
    id: "both-sides",
    prompt: "An option fits the sentence before a gap but not the sentence after it. What should you do?",
    options: ["Use it", "Reject it and find an option that fits both sides", "Use it if it repeats a key word"],
    answer: "Reject it and find an option that fits both sides",
    explanation: "The correct sentence must create a clear connection with the text before and after the gap.",
  },
  {
    id: "pronoun",
    prompt: "An option begins with 'They'. What should you check?",
    options: [
      "Whether the nearby text clearly mentions a plural group or thing",
      "Whether the option is short",
      "Whether another option contains a name",
    ],
    answer: "Whether the nearby text clearly mentions a plural group or thing",
    explanation: "Pronouns need a clear reference in the surrounding text.",
  },
  {
    id: "topic",
    prompt: "Why is matching only by topic word risky?",
    options: [
      "Correct options never repeat topic words",
      "Several options may discuss the topic but connect to the paragraph differently",
      "Vocabulary is not important in this task",
    ],
    answer: "Several options may discuss the topic but connect to the paragraph differently",
    explanation: "A distractor may share vocabulary but give an example, contrast, or result in the wrong place.",
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

export default function OteReadingPart3Guide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const completedLoggedRef = useRef(false);
  const basePath = nativeRoutes
    ? "/reading/general/part-3-gapped-text"
    : "/ote/reading/general/part-3-gapped-text";
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
      progressId: "reading.part3.general-guide",
      section: "reading",
      part: "part-3",
      mode: "general_guide",
      taskTitle: "General Reading Part 3 guide",
      score: correctCount,
      total: quizQuestions.length,
    });
  }, [answeredCount, correctCount]);

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Reading Part 3 Gapped Text Guide | Seif English"
        description="Prepare for OTE Reading Part 3 with cohesion clues, a clear gapped-text method, common traps, and a review quiz."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Part 3 training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Reading Part 3</p>
        <h1>Gapped Text</h1>
        <p>
          Six sentences have been removed from a newspaper or magazine article. Choose the sentence
          that connects correctly with the ideas before and after each gap.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="Reading Part 3 essentials">
        <div>
          <Clock3 size={24} aria-hidden="true" />
          <strong>11 minutes</strong>
          <span>Read the whole text, solve the clearest gaps, and leave time to reread it.</span>
        </div>
        <div>
          <FileText size={24} aria-hidden="true" />
          <strong>6 gaps</strong>
          <span>Each sentence must make sense with the text on both sides.</span>
        </div>
        <div>
          <ListChecks size={24} aria-hidden="true" />
          <strong>7 options</strong>
          <span>One extra sentence is a distractor and should not be used.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How the Task Works</h2>
        <p>
          You read one longer article with six missing sentences. Each option can be used only once.
          The correct answers rebuild the structure and flow of the original text.
        </p>
        <p>
          This is not a vocabulary-matching exercise. A sentence may discuss the correct topic but
          still be wrong because its pronouns, grammar, time sequence, or logical purpose do not fit.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>Clues That Join a Text Together</h2>
        <div className="ote-training-compare" role="table" aria-label="Reading Part 3 cohesion clues">
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
          <li><strong>Read the title and opening.</strong> Understand the topic, people, and general direction.</li>
          <li><strong>Skim the complete article.</strong> Follow the main story or argument before solving every gap.</li>
          <li><strong>Study both sides of one gap.</strong> Decide what type of sentence is missing.</li>
          <li><strong>Look for strong links.</strong> Check pronouns, linking words, repeated ideas, grammar, and time sequence.</li>
          <li><strong>Insert the best option and reread.</strong> The paragraph should sound natural and complete.</li>
          <li><strong>Finish with the extra sentence.</strong> Use elimination as the number of remaining options becomes smaller.</li>
        </ol>
      </section>

      <section className="ote-training-section">
        <h2>What Should Fit on Both Sides?</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Link2 size={22} aria-hidden="true" />
            <h3>The idea</h3>
            <p>The missing sentence should continue the same point or create a clear new connection.</p>
          </article>
          <article>
            <Search size={22} aria-hidden="true" />
            <h3>The references</h3>
            <p>Words such as this, they, and such need a clear person or idea nearby.</p>
          </article>
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>The paragraph's purpose</h3>
            <p>Decide whether the gap needs a reason, result, example, contrast, or next stage.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Link2 size={22} aria-hidden="true" />
            <h3>Check before and after</h3>
            <p>A sentence that connects on only one side is not the correct answer.</p>
          </article>
          <article>
            <FileText size={22} aria-hidden="true" />
            <h3>Use more than one clue</h3>
            <p>Combine meaning, grammar, reference words, and paragraph logic.</p>
          </article>
          <article>
            <Clock3 size={22} aria-hidden="true" />
            <h3>Do the strongest gaps first</h3>
            <p>Clear links reduce the options and make the difficult gaps easier later.</p>
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
              to sharpen your cohesion checks.
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
          Open timed Part 3 practice
        </button>
      </section>
    </main>
  );
}
