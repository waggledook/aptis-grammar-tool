import React, { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, ListChecks, RotateCcw, XCircle, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const quizQuestions = [
  {
    id: "real-question-time",
    prompt: "How much time do you have to speak for each real question (Questions 3 to 8) in Part 1?",
    options: ["10 seconds", "20 seconds", "30 seconds"],
    answer: "20 seconds",
    explanation:
      "You have exactly 20 seconds for each real test question. Only the first two practice questions use the shorter 10-second timer.",
  },
  {
    id: "missed-question",
    prompt: "If you do not understand a question, what can you do?",
    options: [
      "Click a button to listen to the question again.",
      "Pause the clock to read the question text on the screen.",
      "Make your best guess and start speaking immediately.",
    ],
    answer: "Make your best guess and start speaking immediately.",
    explanation:
      "You cannot repeat the audio and you cannot pause the test. The text does not appear on screen. If you miss a word, guess the topic and keep talking.",
  },
  {
    id: "future-work-answer",
    prompt: 'The computer asks: "What kind of work would you like to do in the future?" Which answer is best for a good score?',
    options: [
      '"I want to be a lawyer."',
      '"I want to be a lawyer because my brother is a lawyer. He has a nice office and I think his job is very exciting."',
      '"In the future, I will write letters and work in a big building with many offices."',
    ],
    answer:
      '"I want to be a lawyer because my brother is a lawyer. He has a nice office and I think his job is very exciting."',
    explanation:
      "This answer gives a direct answer, adds personal details, and links ideas with words like 'because' and 'and'. The first option is too short.",
  },
  {
    id: "skip-early",
    prompt: "True or False: If you finish your answer in 10 seconds, you can click a button to go to the next question early.",
    options: ["True", "False"],
    answer: "False",
    explanation:
      "The test only moves forward when the clock reaches zero. If you have extra time left, add an example or another reason.",
  },
  {
    id: "missed-answers",
    prompt: "What happens if you do not say anything, or if you speak about the wrong topic?",
    options: [
      "You will get a zero for the whole Speaking test.",
      "It is fine, as long as your other answers are good.",
      "If you miss or fail more than three questions, your score will go down.",
    ],
    answer: "If you miss or fail more than three questions, your score will go down.",
    explanation:
      "The test allows one or two weak answers. But if you do not answer four or more questions, your score can go down across the marking areas.",
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

export default function OteSpeakingPart1Guide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const menuPath = getSitePath(nativeRoutes ? "/speaking/part-1-interview" : "/ote/speaking/part-1-interview");
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
        title="OTE Speaking Part 1 Interview | Seif English"
        description="Learn how to answer the first questions in the OTE Speaking test and practice with our quick review quiz."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to interview training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Speaking Part 1</p>
        <h1>The Spoken Interview</h1>
        <p>
          The test starts with a short, friendly conversation about everyday topics. To do well in
          Part 1, you need to answer quickly, use natural words, and watch the countdown clock on
          the screen.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="Part 1 essentials">
        <div>
          <Clock3 size={24} aria-hidden="true" />
          <strong>10 or 20 seconds</strong>
          <span>You get 10 seconds for practice questions and 20 seconds for real questions.</span>
        </div>
        <div>
          <ListChecks size={24} aria-hidden="true" />
          <strong>8 questions total</strong>
          <span>2 practice questions, then 6 real questions about two everyday topics.</span>
        </div>
        <div>
          <Zap size={24} aria-hidden="true" />
          <strong>No time to plan</strong>
          <span>Listen, wait for the beep, and start speaking as soon as recording begins.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How Part 1 Works</h2>
        <p>
          The interview part feels like a normal, everyday conversation. You wear a headset and talk
          into the microphone to answer single-sentence questions from the computer.
        </p>
        <p>
          You only hear the questions; the words do not appear on the screen. As soon as the
          computer finishes speaking, a countdown clock appears to show how much recording time you
          have left. The test moves forward automatically, so you cannot stop or pause the timer.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>Order of the Questions</h2>
        <div className="ote-training-compare" role="table" aria-label="OTE Speaking Part 1 question order">
          <div className="ote-training-compare-head" role="row">
            <span role="columnheader">Questions</span>
            <span role="columnheader">Type</span>
            <span role="columnheader">What to expect</span>
          </div>
          {[
            ["1 & 2", "Practice - 10 seconds each", "Usually your name and where you come from. These check your microphone and do not give you points."],
            ["3, 4 & 5", "Topic One - 20 seconds each", "A normal topic such as music, books, hobbies, or another everyday subject."],
            ["6, 7 & 8", "Topic Two - 20 seconds each", "A new everyday topic such as your future job, hometown, or daily routine."],
          ].map(([questions, type, expectation]) => (
            <div className="ote-training-compare-row" role="row" key={questions}>
              <span role="cell">{questions}</span>
              <span role="cell">{type}</span>
              <span role="cell">{expectation}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <h3>Give facts + opinions</h3>
            <p>
              Say more than "yes" or "no". Give the answer, then add a reason, feeling, or example
              so the examiner hears your range.
            </p>
          </article>
          <article>
            <h3>Do not stop to correct mistakes</h3>
            <p>
              You only have 20 seconds. If you make a small grammar mistake or choose the wrong
              word, keep speaking calmly instead of restarting.
            </p>
          </article>
          <article>
            <h3>Speak until the time finishes</h3>
            <p>
              It is fine if the timer cuts you off. The important thing is showing that you have
              enough ideas to keep going for the full answer time.
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
              to sharpen your Part 1 strategy.
            </span>
            <button type="button" onClick={() => setAnswers({})}>
              <RotateCcw size={17} aria-hidden="true" />
              Try again
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
