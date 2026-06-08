import React, { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, Images, MessageCircleQuestion, RotateCcw, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const quizQuestions = [
  {
    id: "two-photos",
    prompt: "In Part 3, how many photographs are you required to choose and talk about?",
    options: ["One photograph", "Exactly two photographs", "As many as you can fit in one minute"],
    answer: "Exactly two photographs",
    explanation:
      "The instructions ask you to choose two photographs. Covering only one, or trying to cover three, weakens task fulfilment.",
  },
  {
    id: "part4-prep",
    prompt: "True or False: In Part 4, you get 10 seconds of preparation time before each question begins.",
    options: ["True", "False"],
    answer: "False",
    explanation:
      "Part 4 has no preparation time. You listen to the question, hear the tone, and start speaking immediately.",
  },
  {
    id: "overrun-first-photo",
    prompt: "You are in Part 3 and notice you have talked about your first photo choice for 40 seconds. What should you do?",
    options: [
      "Keep talking about the first photo to make it fully detailed.",
      'Stop immediately, say "Moving on," and spend the final time on your second choice.',
      "Restart your talk from the beginning.",
    ],
    answer: 'Stop immediately, say "Moving on," and spend the final time on your second choice.',
    explanation:
      "You need to address both chosen photos. Use a clear transition and protect time for your second idea.",
  },
  {
    id: "question-pivot",
    prompt: "How do the six Part 4 questions usually change as you progress?",
    options: [
      "They stay exactly the same difficulty from start to finish.",
      "They get shorter and simpler as the test moves along.",
      "They start with personal experiences and move into broader or more abstract ideas.",
    ],
    answer: "They start with personal experiences and move into broader or more abstract ideas.",
    explanation:
      "Early questions are often personal or local. Later questions tend to ask for opinions, predictions, comparisons, or wider social ideas.",
  },
  {
    id: "timer-zero",
    prompt: "If you finish your answer while there are still 15 seconds remaining, what happens?",
    options: [
      "You can click a button to skip to the next task immediately.",
      "The system waits for the timer to reach zero before moving forward automatically.",
      "The exam pauses until you click record again.",
    ],
    answer: "The system waits for the timer to reach zero before moving forward automatically.",
    explanation:
      "The screen progresses automatically only when the countdown finishes, so use spare time to add examples or a second reason.",
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

export default function OteSpeakingPart34Guide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const menuPath = getSitePath(nativeRoutes ? "/speaking/parts-3-4" : "/ote/speaking/parts-3-4");
  const practicePath = getSitePath(nativeRoutes ? "/speaking/parts-3-4/practice" : "/ote/speaking/parts-3-4/practice");
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
        title="OTE Speaking Parts 3 & 4 | Seif English"
        description="Master the Part 3 Long Talk and Part 4 follow-up questions for the Oxford Test of English."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to long talk training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Speaking Parts 3 & 4</p>
        <h1>The Long Talk & Follow-up Questions</h1>
        <p>
          In the final sections of the OTE Speaking module, you move from short messages to an
          organized one-minute talk, followed by immediate interview questions. Success depends on
          strict time management, clear transitions, and enough ideas to keep speaking until the
          timer ends.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="Parts 3 and 4 essentials">
        <div>
          <Clock3 size={24} aria-hidden="true" />
          <strong>30 sec + 1 min</strong>
          <span>Plan quickly, then give your full Part 3 talk.</span>
        </div>
        <div>
          <Images size={24} aria-hidden="true" />
          <strong>4 photo options</strong>
          <span>Choose exactly two labelled photographs to compare.</span>
        </div>
        <div>
          <MessageCircleQuestion size={24} aria-hidden="true" />
          <strong>6 questions</strong>
          <span>Answer each Part 4 audio question for 30 seconds.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How Part 3 Works</h2>
        <p>
          The Long Talk tests your ability to organize an extended spoken response under tight time
          pressure. You receive a situation, a central question, and four labelled photographs.
          Choose exactly two photos and explain how they answer the prompt in one cohesive talk.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>How Part 4 Works</h2>
        <p>
          As soon as your one-minute talk finishes, Part 4 begins automatically. You listen to six
          audio-only questions connected to the same general theme. There is no preparation time:
          when the tone sounds, your 30-second answer starts.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>Part 3 vs. Part 4</h2>
        <div className="ote-training-compare" role="table" aria-label="Comparison of OTE Speaking Parts 3 and 4">
          <div className="ote-training-compare-head" role="row">
            <span role="columnheader">Feature</span>
            <span role="columnheader">Part 3: Long Talk</span>
            <span role="columnheader">Part 4: Follow-up Questions</span>
          </div>
          {[
            ["Preparation time", "30 seconds to think and plan.", "None. Speak immediately after the tone."],
            ["Speaking time", "1 full minute.", "30 seconds per question."],
            ["Number of tasks", "1 continuous presentation.", "6 separate audio-only answers."],
            ["Visual support", "Task instructions plus 4 labelled photographs.", "No images. Focus on the audio question and timer."],
            ["Core focus", "Choose 2 photos, compare them, and structure a talk.", "Move quickly from personal ideas to broader opinions."],
          ].map(([feature, part3, part4]) => (
            <div className="ote-training-compare-row" role="row" key={feature}>
              <span role="cell">{feature}</span>
              <span role="cell">{part3}</span>
              <span role="cell">{part4}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <h3>Balance the clock</h3>
            <p>
              Spend about 5-10 seconds introducing your choices, then give each photo roughly
              20-25 seconds. Do not let the first photo eat the whole minute.
            </p>
          </article>
          <article>
            <h3>Expect the pivot</h3>
            <p>
              Part 4 usually moves from personal experience to wider issues, future predictions, or
              abstract debates. Be ready to widen your answer quickly.
            </p>
          </article>
          <article>
            <h3>Keep expanding</h3>
            <p>
              If you finish early, the screen will still wait for the timer. Add a second reason,
              a brief example, or a contrast instead of going silent.
            </p>
          </article>
        </div>
      </section>

      <section className="ote-training-section ote-training-quiz">
        <div className="ote-training-quiz-header">
          <div>
            <h2>Quick Review Quiz</h2>
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
            <strong>{correctCount === quizQuestions.length ? "Nice, full marks." : "Good review."}</strong>
            <span>
              You answered {correctCount} of {quizQuestions.length} correctly. Use the feedback above
              to sharpen your Parts 3 and 4 strategy.
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
          Practise Parts 3 & 4
        </button>
      </section>
    </main>
  );
}
