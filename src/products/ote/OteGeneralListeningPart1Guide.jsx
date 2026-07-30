import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Ear,
  Headphones,
  Image,
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

const levelRows = [
  {
    level: "A2",
    length: "30–65 words",
    challenge: "Clear details and simple changes of plan",
  },
  {
    level: "B1",
    length: "55–85 words",
    challenge: "More competing information and paraphrase",
  },
  {
    level: "B2",
    length: "70–96 words",
    challenge: "Longer exchanges, corrections and less direct answers",
  },
];

const pictureRows = [
  { type: "Object", target: "What does someone buy, need, bring or leave behind?" },
  { type: "Place", target: "Where is something, or where will the speakers meet or go?" },
  { type: "Activity", target: "Which sport, class or leisure activity does someone choose?" },
  { type: "Transport", target: "How will the person finally travel?" },
  { type: "Person or action", target: "Who performs an action, or what is somebody doing?" },
  { type: "Final arrangement", target: "What do the speakers decide after considering alternatives?" },
];

const quizQuestions = [
  {
    id: "recordings",
    prompt: "What do you listen to in General Listening Part 1?",
    options: ["One long conversation", "Five separate short recordings", "One informational talk"],
    answer: "Five separate short recordings",
    explanation: "Each recording is independent and has its own question and picture options.",
  },
  {
    id: "options",
    prompt: "How many picture options are there for each question?",
    options: ["Two", "Three", "Four"],
    answer: "Three",
    explanation: "You choose the picture labelled A, B or C.",
  },
  {
    id: "focus",
    prompt: "What does Part 1 mainly test?",
    options: [
      "Identifying specific information",
      "Matching opinions to speakers",
      "Completing notes about a long talk",
    ],
    answer: "Identifying specific information",
    explanation: "You may identify an object, place, activity, person, journey or final decision.",
  },
  {
    id: "changed-plan",
    prompt: "A speaker rejects the train and finally chooses the bus. Which picture answers the question?",
    options: ["The train", "The bus", "Whichever is mentioned most often"],
    answer: "The bus",
    explanation: "The final arrangement replaces the original plan.",
  },
  {
    id: "all-mentioned",
    prompt: "All three picture options are mentioned. What should you do?",
    options: [
      "Choose the first one mentioned",
      "Choose the final one automatically",
      "Check which one answers the exact question",
    ],
    answer: "Check which one answers the exact question",
    explanation: "The other pictures may represent rejected ideas, background details or different situations.",
  },
  {
    id: "second-listen",
    prompt: "What is the best use of the second listening?",
    options: [
      "Try to write down every word",
      "Check the detail separating the possible answers",
      "Ignore the first answer and begin again",
    ],
    answer: "Check the detail separating the possible answers",
    explanation: "Listen for the correction, restriction or final decision that proves one picture correct.",
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
              className={`ote-training-option ${isSelected ? "is-selected" : ""} ${
                answered && isAnswer ? "is-answer" : ""
              }`}
              key={option}
              onClick={() => onSelect(question.id, option)}
              type="button"
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

export default function OteGeneralListeningPart1Guide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const completedLoggedRef = useRef(false);
  const basePath = nativeRoutes
    ? "/listening/general/part-1-picture-options"
    : "/ote/listening/general/part-1-picture-options";
  const menuPath = getSitePath(basePath);
  const practicePath = getSitePath(`${basePath}/practice/a2-set-1`);
  const answeredCount = Object.keys(answers).length;
  const correctCount = useMemo(
    () => quizQuestions.filter((question) => answers[question.id] === question.answer).length,
    [answers]
  );

  useEffect(() => {
    if (completedLoggedRef.current || answeredCount < quizQuestions.length) return;
    completedLoggedRef.current = true;
    logOteTrainingCompleted({
      progressId: "listening.part1.general-guide",
      section: "listening",
      part: "part-1",
      mode: "general_guide",
      taskTitle: "General Listening Part 1 guide",
      score: correctCount,
      total: quizQuestions.length,
    });
  }, [answeredCount, correctCount]);

  function selectAnswer(questionId, answer) {
    setAnswers((current) => ({ ...current, [questionId]: answer }));
  }

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE General Listening Part 1 Guide | Picture Multiple Choice"
        description="Prepare for OTE General Listening Part 1 with its picture questions, A2–B2 progression, two-listening strategy, distractors and review quiz."
      />

      <button className="ote-training-back" onClick={() => navigate(menuPath)} type="button">
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Part 1 training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">General Listening Part 1</p>
        <h1>Picture Multiple Choice</h1>
        <p>
          Listen to five short recordings. For each one, choose the picture that matches the
          specific information asked for in the question.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="General Listening Part 1 essentials">
        <div>
          <Headphones size={24} aria-hidden="true" />
          <strong>5 short recordings</strong>
          <span>Each conversation or monologue is independent and has one question.</span>
        </div>
        <div>
          <Image size={24} aria-hidden="true" />
          <strong>3 picture options</strong>
          <span>Compare pictures A, B and C before the recording begins.</span>
        </div>
        <div>
          <Target size={24} aria-hidden="true" />
          <strong>Specific information</strong>
          <span>Identify the object, place, activity, person, journey or final arrangement.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How the Task Works</h2>
        <p>
          Before each recording, read the question and inspect the three pictures. The clock shows
          how much time you have to look at the task. You hear each recording twice and then have
          time to check your answer.
        </p>
        <p>
          The pictures normally show similar possibilities. More than one may be mentioned in the
          recording, but only one answers the precise question. A familiar word is not enough:
          follow the complete meaning and notice any correction or change of plan.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>The Format Stays the Same</h2>
        <p>
          General Listening Part 1 can target A2, B1 or B2. The extracts become longer and the
          competing information closer, but every question still has three picture options.
        </p>
        <div className="ote-training-compare" role="table" aria-label="General Listening Part 1 levels">
          <div className="ote-training-compare-head" role="row">
            <span role="columnheader">Level</span>
            <span role="columnheader">Recording length</span>
            <span role="columnheader">Typical challenge</span>
          </div>
          {levelRows.map((row) => (
            <div className="ote-training-compare-row" role="row" key={row.level}>
              <span role="cell">{row.level}</span>
              <span role="cell">{row.length}</span>
              <span role="cell">{row.challenge}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>What Can the Pictures Show?</h2>
        <div className="ote-training-compare" role="table" aria-label="General Listening Part 1 picture types">
          <div className="ote-training-compare-head is-two-column" role="row">
            <span role="columnheader">Picture type</span>
            <span role="columnheader">Possible question</span>
          </div>
          {pictureRows.map((row) => (
            <div className="ote-training-compare-row is-two-column" role="row" key={row.type}>
              <span role="cell">{row.type}</span>
              <span role="cell">{row.target}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Look at the Pictures Before Listening</h2>
        <div className="ote-training-rule-grid">
          <article>
            <ListChecks size={22} aria-hidden="true" />
            <h3>1. Read the exact question</h3>
            <p>Decide whether you need the original idea, a completed action or the final decision.</p>
          </article>
          <article>
            <Search size={22} aria-hidden="true" />
            <h3>2. Name the difference</h3>
            <p>Silently label the important contrast between pictures A, B and C.</p>
          </article>
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>3. Predict paraphrases</h3>
            <p>A train may be described as a service, travelling by rail or leaving from the station.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>A Reliable Two-Listening Method</h2>
        <div className="ote-training-rule-grid is-two-column">
          <article>
            <Headphones size={22} aria-hidden="true" />
            <h3>First listening: follow what happens</h3>
            <p>
              Track the original plan, problems, suggestions and final arrangement. Make a
              provisional choice, but do not select the first recognisable picture automatically.
            </p>
          </article>
          <article>
            <Ear size={22} aria-hidden="true" />
            <h3>Second listening: prove the answer</h3>
            <p>
              Focus on the exact detail separating your choice from its closest rival. Check
              whether another option was rejected, unavailable, already provided or linked to the
              wrong person.
            </p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Why Can All Three Pictures Sound Possible?</h2>
        <div className="ote-practice-specific-prompt">
          <p>
            <strong>Example:</strong> “I originally planned to take the train. Sara offered to
            drive me, but she needs to leave too early. I’ll use the airport bus instead.” The
            train is the original plan, the car is a rejected offer, and the bus is the final
            decision.
          </p>
        </div>
        <p>
          The correct picture is not necessarily the first, final or most frequently mentioned
          option. It is the one that answers the question after every detail has been considered.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>Common Distractor Tricks</h2>
        <ul className="ote-training-checklist">
          <li><strong>Original plan:</strong> the speaker later changes their mind.</li>
          <li><strong>Rejected suggestion:</strong> another person proposes it, but it is not accepted.</li>
          <li><strong>Already provided:</strong> the speaker considers bringing something that is available there.</li>
          <li><strong>Unavailable preference:</strong> the preferred activity is not possible, so another is chosen.</li>
          <li><strong>Wrong person:</strong> the action is correct, but a different person performs it.</li>
          <li><strong>Right object, wrong purpose:</strong> it is mentioned but not bought, requested or selected.</li>
          <li><strong>Keyword match:</strong> the exact object is named while being rejected.</li>
        </ul>
      </section>

      <section className="ote-training-section">
        <h2>Helpful Words to Notice</h2>
        <div className="ote-training-rule-grid">
          <article>
            <h3>A change</h3>
            <p><em>but, actually, instead, in the end, after all, I’ve changed my mind</em></p>
          </article>
          <article>
            <h3>A final decision</h3>
            <p><em>I’ll…, I’ve decided…, Let’s…, We’d better…, That’s what I booked</em></p>
          </article>
          <article>
            <h3>A rejection or correction</h3>
            <p><em>That won’t work, We’ve already got…, My mistake, I thought…, but…</em></p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Image size={22} aria-hidden="true" />
            <h3>Compare first</h3>
            <p>Know the exact difference between the three pictures before listening.</p>
          </article>
          <article>
            <Ear size={22} aria-hidden="true" />
            <h3>Wait for the complete meaning</h3>
            <p>A clearly mentioned option may later be rejected or replaced.</p>
          </article>
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>Use listen two with a target</h3>
            <p>Find the precise evidence that confirms your answer and eliminates the rival.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section ote-training-quiz">
        <div className="ote-training-quiz-header">
          <div>
            <h2>Part 1 Review Quiz</h2>
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
              above to sharpen your picture comparison and two-listening routine.
            </span>
            <button onClick={() => setAnswers({})} type="button">
              <RotateCcw size={17} aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : null}
      </section>

      <section className="ote-training-section">
        <button className="ote-training-primary-link" onClick={() => navigate(practicePath)} type="button">
          Open General Part 1 practice
        </button>
      </section>
    </main>
  );
}
