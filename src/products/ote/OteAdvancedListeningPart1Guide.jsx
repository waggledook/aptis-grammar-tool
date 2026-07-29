import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Ear,
  Headphones,
  Image,
  ListChecks,
  MessageSquareText,
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
    type: "Gist or main point",
    target: "What is the extract mainly about?",
    approach: "Follow the whole exchange and choose the option that captures its central point.",
  },
  {
    type: "Function, reason, or purpose",
    target: "Why does the speaker say this or do this?",
    approach: "Listen for the speaker's intention, not simply the topic they mention.",
  },
  {
    type: "Attitude, feeling, or opinion",
    target: "How does the speaker feel?",
    approach: "Use tone, qualification, and contrast as well as the literal words.",
  },
  {
    type: "Topic, type, or context",
    target: "What are the speakers discussing?",
    approach: "Build the situation from several clues rather than one familiar word.",
  },
  {
    type: "Speaker relationship",
    target: "Who are the speakers to each other?",
    approach: "Notice what they already know, what they explain, and how formally they speak.",
  },
  {
    type: "Implied meaning",
    target: "What does the speaker suggest?",
    approach: "Combine the wording, tone, and context without adding unsupported ideas.",
  },
  {
    type: "Rhetorical purpose",
    target: "Why is a detail, example, or contrast included?",
    approach: "Ask what job that part of the extract does in the speaker's argument.",
  },
  {
    type: "Specific information",
    target: "What detail is finally decided or confirmed?",
    approach: "Track corrections, rejected ideas, and changes of plan until the end.",
  },
];

const quizQuestions = [
  {
    id: "recordings",
    prompt: "How many separate recordings are there in each of Advanced Listening Parts 1 and 4?",
    options: ["Four", "Five", "Six"],
    answer: "Five",
    explanation: "Each part contains five independent short dialogues or monologues.",
  },
  {
    id: "options",
    prompt: "What is the main format difference between Parts 1 and 4?",
    options: [
      "Part 1 may use pictures or text; Part 4 uses text only",
      "Part 1 uses text only; Part 4 may use pictures",
      "Part 1 is multiple choice; Part 4 requires typed answers",
    ],
    answer: "Part 1 may use pictures or text; Part 4 uses text only",
    explanation: "Every item has three options. Part 1 can include picture questions, whereas Part 4 presents text options.",
  },
  {
    id: "plays",
    prompt: "How many times can you play each recording?",
    options: ["Once only", "Up to twice", "As many times as you want"],
    answer: "Up to twice",
    explanation: "You can hear each extract once and then use the second play to confirm the distinction between the options.",
  },
  {
    id: "word-match",
    prompt: "An option repeats words from the recording. What should you do?",
    options: [
      "Choose it immediately",
      "Check whether its complete meaning matches",
      "Reject it because correct answers always paraphrase",
    ],
    answer: "Check whether its complete meaning matches",
    explanation: "A distractor can repeat exact words while changing the time, reason, attitude, or final decision.",
  },
  {
    id: "decision",
    prompt: "A speaker mentions one plan and later changes it. Which detail usually matters?",
    options: ["The first plan", "The final decision", "Whichever detail sounds more practical"],
    answer: "The final decision",
    explanation: "These short-extract tasks often test whether you can track a change of mind and distinguish the final answer from an earlier idea.",
  },
  {
    id: "second-listen",
    prompt: "What is the best use of the second listening?",
    options: [
      "Start the whole question again without a target",
      "Listen for evidence that separates the remaining options",
      "Ignore the options and write down every word",
    ],
    answer: "Listen for evidence that separates the remaining options",
    explanation: "A focused second listen is most useful: test your provisional answer against the exact contrast, correction, or implication.",
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

export default function OteAdvancedListeningPart1Guide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const completedLoggedRef = useRef(false);
  const basePath = nativeRoutes
    ? "/listening/advanced/part-1-short-extracts"
    : "/ote/listening/advanced/part-1-short-extracts";
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
      progressId: "listening.part1.advanced-guide",
      section: "listening",
      part: "part-1",
      mode: "advanced_guide",
      taskTitle: "Advanced Listening Parts 1 and 4 guide",
      score: correctCount,
      total: quizQuestions.length,
    });
  }, [answeredCount, correctCount]);

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Advanced Listening Parts 1 & 4 Guide | Seif English"
        description="Prepare for OTE Advanced Listening Parts 1 and 4 with their shared short-extract format, answer-option difference, two-listening strategy, distractor traps, and review quiz."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Parts 1 & 4 training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Advanced Listening Parts 1 & 4</p>
        <h1>Short Dialogues and Monologues</h1>
        <p>
          Parts 1 and 4 use essentially the same task: listen to five separate short recordings
          and answer one three-option question on each. Part 1 may include picture options,
          whereas Part 4 uses text options only.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="Advanced Listening Parts 1 and 4 essentials">
        <div>
          <Headphones size={24} aria-hidden="true" />
          <strong>5 recordings per part</strong>
          <span>Each short dialogue or monologue is independent and has one question.</span>
        </div>
        <div>
          <ListChecks size={24} aria-hidden="true" />
          <strong>One format difference</strong>
          <span>Part 1 may use pictures or text; Part 4 uses text only.</span>
        </div>
        <div>
          <Ear size={24} aria-hidden="true" />
          <strong>The same core method</strong>
          <span>Use the first listen for the situation and the second to confirm the evidence.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How Both Parts Work</h2>
        <p>
          Before each recording, you hear the situation and question and can inspect the three
          options. The recording then plays automatically. After the first play, you can listen
          again before making your final choice.
        </p>
        <p>
          The answer-option presentation changes, but the listening skill does not. More than one
          option may reuse genuine details from the recording, and the correct answer is the one
          that matches the speaker's complete meaning. At C1, the speech may also contain natural
          hesitation, reformulation, idiomatic language, or a conclusion that is implied rather
          than stated directly.
        </p>
        <div className="ote-practice-specific-prompt">
          <p>
            <strong>Where Part 1 fits:</strong> after your fifth Part 1 response, the test updates
            its estimate of your level. That estimate determines whether you see the B2 or C1
            version of Part 2. Part 4 returns to the same short-extract skills later in the module,
            without picture questions.
          </p>
        </div>
        <div className="ote-practice-specific-prompt">
          <p>
            <strong>Is Part 4 harder?</strong> Not automatically. Both parts cover the same B2-C1
            range and the difficulty varies from item to item. Later questions may concentrate the
            more interpretive end of the format, especially a speaker's purpose, priority, or
            attitude, but the technique remains the same.
          </p>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>What Can the Question Test?</h2>
        <div className="ote-training-compare" role="table" aria-label="Advanced Listening Parts 1 and 4 question types">
          <div className="ote-training-compare-head" role="row">
            <span role="columnheader">Question type</span>
            <span role="columnheader">What it asks</span>
            <span role="columnheader">Listening focus</span>
          </div>
          {questionTypeRows.map((row) => (
            <div className="ote-training-compare-row" role="row" key={row.type}>
              <span role="cell">{row.type}</span>
              <span role="cell">{row.target}</span>
              <span role="cell">{row.approach}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>A Reliable Two-Listening Method</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>1. Compare before listening</h3>
            <p>
              Identify exactly what the question targets, then compare the options and predict the
              distinction the recording must resolve.
            </p>
          </article>
          <article>
            <MessageSquareText size={22} aria-hidden="true" />
            <h3>2. Build the whole situation</h3>
            <p>
              On the first listen, follow who is speaking, what changes, and where the conversation
              finishes. Make a provisional choice.
            </p>
          </article>
          <article>
            <Search size={22} aria-hidden="true" />
            <h3>3. Test the distinction</h3>
            <p>
              On the second listen, focus on the correction, contrast, tone, or final detail that
              proves one option and rules out the others.
            </p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Common Distractor Tricks</h2>
        <ul className="ote-training-checklist">
          <li><strong>Original plan:</strong> it is mentioned clearly, but the speaker later changes it.</li>
          <li><strong>Suggested option:</strong> another speaker proposes it, but it is rejected.</li>
          <li><strong>Secondary benefit:</strong> it is true, but it is not the main reason asked for.</li>
          <li><strong>Right topic, wrong attitude:</strong> the detail is correct, but the speaker's view of it is not.</li>
          <li><strong>Temporary effect:</strong> it happens at first, while the question asks what is most significant overall.</li>
          <li><strong>Explicitly rejected idea:</strong> the recording spends time on it before explaining why it is unsuitable.</li>
          <li><strong>Keyword echo:</strong> an option repeats the recording's language but changes its complete meaning.</li>
        </ul>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Image size={22} aria-hidden="true" />
            <h3>Read the options as claims</h3>
            <p>Whether they are words or pictures, ask precisely what each option would mean if it were true.</p>
          </article>
          <article>
            <Ear size={22} aria-hidden="true" />
            <h3>Track the final meaning</h3>
            <p>Do not stop at the first matching detail. Keep listening for qualification, correction, and conclusion.</p>
          </article>
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>Use play two with a purpose</h3>
            <p>Return with a precise question: what evidence confirms this answer and eliminates its closest rival?</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section ote-training-quiz">
        <div className="ote-training-quiz-header">
          <div>
            <h2>Parts 1 & 4 Review Quiz</h2>
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
              above to sharpen your two-listening routine.
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
          Open timed Advanced Parts 1 & 4 practice
        </button>
      </section>
    </main>
  );
}
