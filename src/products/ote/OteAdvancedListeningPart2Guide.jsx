import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Ear,
  Headphones,
  Keyboard,
  ListChecks,
  Map,
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

const formatRows = [
  {
    feature: "Task type",
    b2: "Multiple-choice note completion",
    c1: "Open note completion",
  },
  {
    feature: "Questions shown",
    b2: "1 worked example + 5 scored questions",
    c1: "6 scored gaps",
  },
  {
    feature: "Response",
    b2: "Choose one of three options for each gap",
    c1: "Type a word or two-word phrase from the audio",
  },
  {
    feature: "Talk length",
    b2: "Approximately 350–450 words",
    c1: "Approximately 450–550 words",
  },
  {
    feature: "Language and content",
    b2: "A clear longer monologue with competing details and paraphrase",
    c1: "A denser monologue with more complex ideas and more natural spoken features",
  },
  {
    feature: "Main challenge",
    b2: "Rejecting plausible options that belong to the wrong note",
    c1: "Locating and reproducing the exact short phrase accurately",
  },
];

const quizQuestions = [
  {
    id: "format",
    prompt: "What determines whether you see the B2 or C1 version of Part 2?",
    options: [
      "A format you choose before the test",
      "The level estimate updated after Part 1",
      "The speed at which you open Part 2",
    ],
    answer: "The level estimate updated after Part 1",
    explanation: "Your fifth Part 1 response updates the test's estimate, which selects the Part 2 format.",
  },
  {
    id: "b2-count",
    prompt: "What does the B2 task show?",
    options: [
      "One worked example and five scored questions",
      "Six scored typed gaps with no example",
      "Five picture questions",
    ],
    answer: "One worked example and five scored questions",
    explanation: "The B2 version uses a worked example followed by five scored three-option questions.",
  },
  {
    id: "order",
    prompt: "How does the information in the notes relate to the recording?",
    options: [
      "It normally follows the order of the talk",
      "It appears in reverse order",
      "The gaps are deliberately mixed",
    ],
    answer: "It normally follows the order of the talk",
    explanation: "The notes provide a route through the monologue, so headings and surrounding sentences help you keep your place.",
  },
  {
    id: "preview",
    prompt: "What is the best use of the time before the recording starts?",
    options: [
      "Memorise every note word for word",
      "Map the sections and predict the kind of information each gap needs",
      "Choose every answer before hearing the talk",
    ],
    answer: "Map the sections and predict the kind of information each gap needs",
    explanation: "The title, headings, grammar, and nearby words reveal the talk's structure and the likely answer category.",
  },
  {
    id: "c1-answer",
    prompt: "Which answer follows the C1 gap-completion rule?",
    options: [
      "A short noun phrase of no more than two words from the audio",
      "A three-word paraphrase with the same general idea",
      "A full sentence that explains the answer",
    ],
    answer: "A short noun phrase of no more than two words from the audio",
    explanation: "C1 answers are reproduced from the audio, contain no more than two words, and form a noun phrase rather than a verb or adjective.",
  },
  {
    id: "extra-words",
    prompt: "You hear the answer inside a longer expression. What should you type?",
    options: [
      "The whole expression, even if it is more than two words",
      "Only the one- or two-word phrase that completes the note",
      "A synonym that is easier to spell",
    ],
    answer: "Only the one- or two-word phrase that completes the note",
    explanation: "The note already supplies the surrounding grammar. Copy only the short phrase needed for the gap and do not add extra words.",
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

export default function OteAdvancedListeningPart2Guide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const completedLoggedRef = useRef(false);
  const basePath = nativeRoutes
    ? "/listening/advanced/part-2-note-completion"
    : "/ote/listening/advanced/part-2-note-completion";
  const menuPath = getSitePath(basePath);
  const practicePath = getSitePath(`${basePath}/practice/set-1`);
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
      progressId: "listening.part2.advanced-guide",
      section: "listening",
      part: "part-2",
      mode: "advanced_guide",
      taskTitle: "Advanced Listening Part 2 guide",
      score: correctCount,
      total: quizQuestions.length,
    });
  }, [answeredCount, correctCount]);

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Advanced Listening Part 2 Note Completion Guide | Seif English"
        description="Prepare for OTE Advanced Listening Part 2 with its adaptive B2 and C1 formats, preview strategy, answer rules, common traps, and a review quiz."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Part 2 training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Advanced Listening Part 2</p>
        <h1>Note Completion</h1>
        <p>
          Listen to one longer monologue and complete a structured set of notes. Depending on the
          level estimate produced after Part 1, you will either select answers in a B2
          multiple-choice task or type short phrases in a C1 open task.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="Advanced Listening Part 2 essentials">
        <div>
          <Headphones size={24} aria-hidden="true" />
          <strong>1 longer monologue</strong>
          <span>The recording develops one topic across several clearly related sections.</span>
        </div>
        <div>
          <ListChecks size={24} aria-hidden="true" />
          <strong>2 possible formats</strong>
          <span>B2 uses answer options; C1 requires one- or two-word phrases.</span>
        </div>
        <div>
          <Map size={24} aria-hidden="true" />
          <strong>Information in order</strong>
          <span>The headings and notes guide you through the sequence of the talk.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How the Task Works</h2>
        <p>
          You first have time to inspect the task while the clock shows how long remains. The title,
          headings, completed notes, and gaps form a map of the recording. The talk then plays, and
          you can hear it a second time before submitting the task.
        </p>
        <p>
          The notes paraphrase the speaker rather than simply copying every sentence. Strong
          candidates therefore listen for meaning, follow the order of the notes, and check that
          each selected or typed answer fits both the audio and the grammar of its sentence.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>The Two Possible Versions</h2>
        <div className="ote-training-compare" role="table" aria-label="B2 and C1 versions of Advanced Listening Part 2">
          <div className="ote-training-compare-head" role="row">
            <span role="columnheader">Feature</span>
            <span role="columnheader">B2 version</span>
            <span role="columnheader">C1 version</span>
          </div>
          {formatRows.map((row) => (
            <div className="ote-training-compare-row" role="row" key={row.feature}>
              <span role="cell">{row.feature}</span>
              <span role="cell">{row.b2}</span>
              <span role="cell">{row.c1}</span>
            </div>
          ))}
        </div>
        <div className="ote-practice-specific-prompt">
          <p>
            <strong>Which format will I see?</strong> You do not choose it yourself. After the fifth
            Part 1 task, the test updates its estimate of your level and selects the appropriate B2
            or C1 Part 2 format.
          </p>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Use the Preview Time Well</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Map size={22} aria-hidden="true" />
            <h3>1. Map the sections</h3>
            <p>Read the title and headings first. They reveal how the speaker will organise the topic.</p>
          </article>
          <article>
            <Search size={22} aria-hidden="true" />
            <h3>2. Read the complete notes</h3>
            <p>Follow the ideas around each gap so you know what information has already been supplied.</p>
          </article>
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>3. Predict the answer type</h3>
            <p>Decide whether you need a material, place, process, person, number, cause, or other detail.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>A Reliable Listening Method</h2>
        <ul className="ote-training-checklist">
          <li><strong>Follow the notes:</strong> move through the task in order and use each heading as a new signpost.</li>
          <li><strong>Listen for meaning before wording:</strong> the note may express the speaker's idea with a different grammatical structure.</li>
          <li><strong>Keep moving:</strong> if you miss one answer, leave it temporarily rather than losing the next section too.</li>
          <li><strong>Separate competing details:</strong> identify which item is rejected, secondary, conditional, or attached to a different point.</li>
          <li><strong>Use signposting:</strong> words such as <em>however</em>, <em>instead</em>, and <em>the main point</em> often introduce the decisive information.</li>
          <li><strong>Use the second listen to resolve uncertainty:</strong> return to gaps with a precise prediction or shortlist.</li>
          <li><strong>Read the completed notes:</strong> check that every answer creates a natural, logical, and grammatically complete statement.</li>
        </ul>
      </section>

      <section className="ote-training-section">
        <h2>Strategy by Format</h2>
        <div className="ote-training-rule-grid is-two-column">
          <article>
            <ListChecks size={22} aria-hidden="true" />
            <h3>B2: compare all three options</h3>
            <p>
              All three details may occur in the talk. Decide which one completes this exact note,
              and watch for earlier plans, exceptions, and information linked to another section.
            </p>
          </article>
          <article>
            <Keyboard size={22} aria-hidden="true" />
            <h3>C1: reproduce the short phrase</h3>
            <p>
              Enter a noun phrase of no more than two words from the audio. British and American
              spelling are accepted, but a verb or adjective is not. Type only the phrase required
              by the note rather than extra surrounding words.
            </p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Common Traps</h2>
        <ul className="ote-training-checklist">
          <li><strong>Correct detail, wrong gap:</strong> the information is heard, but it belongs to another heading or sentence.</li>
          <li><strong>First idea, not final idea:</strong> the speaker revises a plan or gives a more dependable conclusion later.</li>
          <li><strong>Useful but not central:</strong> a secondary benefit or clue appears before the answer the note requires.</li>
          <li><strong>Lost after one missed answer:</strong> focusing on the previous gap causes you to miss the next signpost.</li>
          <li><strong>Grammar mismatch:</strong> the idea is correct, but the selected or typed answer does not complete the note naturally.</li>
          <li><strong>Too many words:</strong> a C1 response includes surrounding language that the note already provides.</li>
          <li><strong>Spelling error:</strong> the phrase is correctly identified but inaccurately entered.</li>
        </ul>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Map size={22} aria-hidden="true" />
            <h3>Let the notes guide you</h3>
            <p>The structure is your navigation system. Use it to predict where you are and what comes next.</p>
          </article>
          <article>
            <Ear size={22} aria-hidden="true" />
            <h3>Wait for the complete point</h3>
            <p>Do not commit to the first related detail when the speaker may correct, contrast, or qualify it.</p>
          </article>
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>Check meaning and form</h3>
            <p>The final answer must be supported by the audio and fit its note grammatically and precisely.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section ote-training-quiz">
        <div className="ote-training-quiz-header">
          <div>
            <h2>Part 2 Review Quiz</h2>
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
              You answered {correctCount} of {quizQuestions.length} correctly. Use the feedback
              above to refine your preview and note-following routine.
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
          Open timed Advanced Part 2 practice
        </button>
      </section>
    </main>
  );
}
