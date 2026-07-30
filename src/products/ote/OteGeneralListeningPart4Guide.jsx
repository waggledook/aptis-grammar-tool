import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Ear,
  Headphones,
  ListChecks,
  MessageSquareText,
  Radio,
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
    challenge: "Clear situations, decisions and reactions",
  },
  {
    level: "B1",
    length: "55–85 words",
    challenge: "More paraphrase and competing details",
  },
  {
    level: "B2",
    length: "70–96 words",
    challenge: "Qualification, implied opinions and closer distractors",
  },
];

const questionTypeRows = [
  {
    type: "Attitude, feeling or opinion",
    target: "What does the speaker think or feel overall?",
  },
  {
    type: "Reason or purpose",
    target: "What does the speaker want to achieve by speaking or calling?",
  },
  {
    type: "Gist or main point",
    target: "Which option best summarizes the complete message?",
  },
  {
    type: "Topic",
    target: "What is the recording mainly about?",
  },
  {
    type: "Speaker relationship",
    target: "How do the speakers know each other?",
  },
  {
    type: "Type or genre",
    target: "What sort of programme, message or situation is this?",
  },
];

const quizQuestions = [
  {
    id: "recordings",
    prompt: "What do you listen to in General Listening Part 4?",
    options: ["One longer dialogue", "Five separate short recordings", "One informational talk"],
    answer: "Five separate short recordings",
    explanation: "Each recording is independent and has one question with three written options.",
  },
  {
    id: "focus",
    prompt: "What can Part 4 test?",
    options: [
      "Only specific times and prices",
      "Only the speakers' final decisions",
      "Opinions, purpose, gist, topic and relationships",
    ],
    answer: "Opinions, purpose, gist, topic and relationships",
    explanation: "The exact listening focus changes from one question to the next.",
  },
  {
    id: "all-mentioned",
    prompt: "All three options are mentioned in the recording. What should you do?",
    options: [
      "Choose the first one mentioned",
      "Choose the option that answers the exact question",
      "Choose the final one automatically",
    ],
    answer: "Choose the option that answers the exact question",
    explanation: "The other options may be earlier ideas, secondary details or another person's opinion.",
  },
  {
    id: "overall-judgement",
    prompt:
      "A speaker praises the service but says the food was disappointing. The question asks for the overall opinion of the restaurant. What should you focus on?",
    options: [
      "The complete judgement",
      "The first positive detail",
      "Whichever idea repeats an option's words",
    ],
    answer: "The complete judgement",
    explanation: "One positive feature does not necessarily make the speaker's overall opinion positive.",
  },
  {
    id: "purpose",
    prompt:
      "A man discusses traffic before asking his colleague to begin a meeting without him. Why is he calling?",
    options: [
      "To report a traffic problem",
      "To ask his colleague to start the meeting",
      "To cancel the meeting",
    ],
    answer: "To ask his colleague to start the meeting",
    explanation: "The traffic explains the situation, but the request is the purpose of the call.",
  },
  {
    id: "second-listen",
    prompt: "What is the best use of the second listening?",
    options: [
      "Start again without considering your first answer",
      "Try to understand every individual word",
      "Listen for evidence that separates the closest options",
    ],
    answer: "Listen for evidence that separates the closest options",
    explanation: "Focus on the speaker's purpose, final attitude or main point.",
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

export default function OteGeneralListeningPart4Guide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const completedLoggedRef = useRef(false);
  const basePath = nativeRoutes
    ? "/listening/general/part-4-text-options"
    : "/ote/listening/general/part-4-text-options";
  const menuPath = getSitePath(basePath);
  const practicePath = getSitePath(`${basePath}/practice/b1-set-1`);
  const answeredCount = Object.keys(answers).length;
  const correctCount = useMemo(
    () => quizQuestions.filter((question) => answers[question.id] === question.answer).length,
    [answers]
  );

  useEffect(() => {
    if (completedLoggedRef.current || answeredCount < quizQuestions.length) return;
    completedLoggedRef.current = true;
    logOteTrainingCompleted({
      progressId: "listening.part4.general-guide",
      section: "listening",
      part: "part-4",
      mode: "general_guide",
      taskTitle: "General Listening Part 4 guide",
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
        title="OTE General Listening Part 4 Guide | Text Multiple Choice"
        description="Prepare for OTE General Listening Part 4 with its five short recordings, A2–B2 progression, question types, two-listening strategy, distractors and review quiz."
      />

      <button className="ote-training-back" onClick={() => navigate(menuPath)} type="button">
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Part 4 training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">General Listening Part 4</p>
        <h1>Text Multiple Choice</h1>
        <p>
          Listen to five short recordings. For each one, answer a question by choosing the written
          option that best matches the complete meaning.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="General Listening Part 4 essentials">
        <div>
          <Headphones size={24} aria-hidden="true" />
          <strong>5 short recordings</strong>
          <span>Each conversation, message or monologue is independent.</span>
        </div>
        <div>
          <MessageSquareText size={24} aria-hidden="true" />
          <strong>3 written options</strong>
          <span>Only one option answers the exact question.</span>
        </div>
        <div>
          <Target size={24} aria-hidden="true" />
          <strong>Complete meaning</strong>
          <span>Listen beyond isolated details to the speaker's real point.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How the Task Works</h2>
        <p>
          Before each recording, read the situation, the question and the three written options.
          The clock shows how much time you have to look at the task. You hear each recording twice
          and then have time to check your answer.
        </p>
        <p>
          All three options may contain ideas mentioned in the recording. One might describe an
          expectation, another somebody else's view, and another the speaker's final decision.
          Only one answers the precise question being asked.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>The Format Stays the Same</h2>
        <p>
          General Listening Part 4 can target A2, B1 or B2. The recordings become longer and the
          answers less direct, but every item remains a separate short recording with three
          written options.
        </p>
        <div className="ote-training-compare" role="table" aria-label="General Listening Part 4 levels">
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
        <h2>What Can the Question Ask?</h2>
        <div className="ote-training-compare" role="table" aria-label="General Listening Part 4 question types">
          <div className="ote-training-compare-head is-two-column" role="row">
            <span role="columnheader">Question type</span>
            <span role="columnheader">What to identify</span>
          </div>
          {questionTypeRows.map((row) => (
            <div className="ote-training-compare-row is-two-column" role="row" key={row.type}>
              <span role="cell">{row.type}</span>
              <span role="cell">{row.target}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Compare the Options Before Listening</h2>
        <div className="ote-training-rule-grid">
          <article>
            <ListChecks size={22} aria-hidden="true" />
            <h3>1. Read the question first</h3>
            <p>Identify whether you need an opinion, purpose, main point, relationship or genre.</p>
          </article>
          <article>
            <Search size={22} aria-hidden="true" />
            <h3>2. Name the difference</h3>
            <p>Compare A, B and C precisely instead of reading each option as an isolated sentence.</p>
          </article>
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>3. Predict the trap</h3>
            <p>Could an option be an earlier idea, a secondary detail or somebody else's opinion?</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>A Reliable Two-Listening Method</h2>
        <div className="ote-training-rule-grid is-two-column">
          <article>
            <Headphones size={22} aria-hidden="true" />
            <h3>First listening: understand the whole situation</h3>
            <p>
              Follow who is speaking, what the situation is, what changes and what the speaker
              finally thinks or wants. Make a provisional choice, but keep listening after the
              first matching detail.
            </p>
          </article>
          <article>
            <Ear size={22} aria-hidden="true" />
            <h3>Second listening: test your answer</h3>
            <p>
              Focus on the distinction between the two closest options. Check whether your evidence
              expresses the speaker's own view and whether it is central or merely supporting
              information.
            </p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Why Can All Three Options Sound Possible?</h2>
        <div className="ote-practice-specific-prompt">
          <p>
            <strong>Example:</strong> A man says that an online course cost more than its rivals and
            that its early exercises were basic. He then explains that the tutor's advice changed
            the way he works and concludes that the course was worth the money.
          </p>
        </div>
        <p>
          Price and difficulty are both genuine details, but they do not express his final overall
          judgement. If the question asks what he thought of the course, the tutor's feedback making
          it worthwhile is the best answer.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>Common Distractor Tricks</h2>
        <ul className="ote-training-checklist">
          <li><strong>True but secondary:</strong> the detail is correct, but it is not the main opinion or purpose.</li>
          <li><strong>Earlier idea:</strong> the speaker later changes their plan or judgement.</li>
          <li><strong>Somebody else's opinion:</strong> a reported view is not necessarily shared by the speaker.</li>
          <li><strong>Positive detail, negative conclusion:</strong> one praised feature does not determine the overall view.</li>
          <li><strong>Negative detail, positive conclusion:</strong> a problem is conceded, but the speaker still approves.</li>
          <li><strong>Right topic, wrong purpose:</strong> background information explains a request but is not the reason for speaking.</li>
          <li><strong>Keyword match:</strong> an option repeats the recording's words while changing its complete meaning.</li>
        </ul>
      </section>

      <section className="ote-training-section">
        <h2>Helpful Words to Notice</h2>
        <div className="ote-training-rule-grid">
          <article>
            <h3>Contrast or change</h3>
            <p><em>but, however, although, actually, in the end, having said that, even so</em></p>
          </article>
          <article>
            <h3>Opinion or feeling</h3>
            <p><em>I was impressed, what bothered me was, I wasn't convinced, it was worth it</em></p>
          </article>
          <article>
            <h3>Purpose or main point</h3>
            <p><em>I'm calling to, could you, the point is, overall, basically, above all</em></p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <MessageSquareText size={22} aria-hidden="true" />
            <h3>Answer the question</h3>
            <p>Several statements may be true; select the one that answers the precise question.</p>
          </article>
          <article>
            <Radio size={22} aria-hidden="true" />
            <h3>Wait for the complete meaning</h3>
            <p>The speaker may correct, qualify or reverse an earlier idea.</p>
          </article>
          <article>
            <Target size={22} aria-hidden="true" />
            <h3>Give listen two a target</h3>
            <p>Return knowing exactly which distinction between the closest options you must resolve.</p>
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
              You answered {correctCount} of {quizQuestions.length} correctly. Use the feedback
              above to sharpen your option comparison and two-listening routine.
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
          Open General Part 4 practice
        </button>
      </section>
    </main>
  );
}
