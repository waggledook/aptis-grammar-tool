import React, { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, MessageSquare, RotateCcw, Volume2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const quizQuestions = [
  {
    id: "speaking-time",
    prompt: "How much time do you have to speak for each message?",
    options: ["20 seconds", "30 seconds", "40 seconds"],
    answer: "40 seconds",
    explanation: "You have a strict 40-second window to record each voice message.",
  },
  {
    id: "message-two-extra",
    prompt: "What extra thing do you get in Message 2?",
    options: [
      "A longer text message.",
      "An audio message from a friend that you must listen to.",
      "More time to think.",
    ],
    answer: "An audio message from a friend that you must listen to.",
    explanation: "Message 2 includes a recorded voice message from a friend, so you need to listen before planning.",
  },
  {
    id: "formal-opening",
    prompt: "You are leaving a message for a garage manager about your broken car. How should you start?",
    options: [
      '"Hi mate! My car is broken again. Fix it soon, okay?"',
      '"Hello, my name is Chris Reynolds. I am calling because my car still has a problem..."',
      '"Dear Sir or Madam, I am writing this letter to you..."',
    ],
    answer: '"Hello, my name is Chris Reynolds. I am calling because my car still has a problem..."',
    explanation:
      "That opening is polite and natural for a spoken voicemail. The first option is too casual, and the third sounds like a letter.",
  },
  {
    id: "friend-opening",
    prompt: "How should you start your reply to a friend in Message 2?",
    options: [
      "Read the first bullet point on the screen immediately.",
      "Speak very slowly so you don't make mistakes.",
      'React to their news first, like saying: "Hey Sam! I\'d love to come to your party!"',
    ],
    answer: 'React to their news first, like saying: "Hey Sam! I\'d love to come to your party!"',
    explanation:
      "For Message 2, show you understood your friend's audio message before you answer the bullet points.",
  },
  {
    id: "skip-time",
    prompt: "True or False: If you finish speaking early, you can press a button to go to the next question.",
    options: ["True", "False"],
    answer: "False",
    explanation:
      "The real exam and this training environment move automatically when the timer reaches zero, so try to use the full time.",
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

export default function OteSpeakingPart2Voicemails({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const menuPath = getSitePath(nativeRoutes ? "/speaking/part-2-voicemails" : "/ote/speaking/part-2-voicemails");
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
        title="OTE Speaking Part 2 Voicemails | Seif English"
        description="Learn how to answer OTE Speaking Part 2 voicemail tasks, then check your understanding with instant feedback."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to voicemail training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Speaking Part 2</p>
        <h1>Spoken Voice Messages</h1>
        <p>
          In this part of the Oxford Test of English Speaking module, you leave two short voice
          messages. The key is to speak clearly, answer every instruction, and choose the right tone.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="Part 2 essentials">
        <div>
          <Clock3 size={24} aria-hidden="true" />
          <strong>20 seconds</strong>
          <span>Read, listen, and plan each message.</span>
        </div>
        <div>
          <MessageSquare size={24} aria-hidden="true" />
          <strong>2 messages</strong>
          <span>One polite formal message and one friend reply.</span>
        </div>
        <div>
          <Volume2 size={24} aria-hidden="true" />
          <strong>40 seconds</strong>
          <span>Record each answer after the beep.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How Part 2 Works</h2>
        <p>
          The voicemail section takes less than three minutes. The test moves forward automatically,
          so you cannot pause the timer or go back. For each task, use the thinking time to read the
          bullet points, notice who you are speaking to, and plan a simple message you can keep going
          with for most of the recording time.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>Message 1 vs. Message 2</h2>
        <div className="ote-training-compare" role="table" aria-label="Comparison of the two voice messages">
          <div className="ote-training-compare-head" role="row">
            <span role="columnheader">Feature</span>
            <span role="columnheader">Message 1: Formal task</span>
            <span role="columnheader">Message 2: Friend reply</span>
          </div>
          {[
            ["What you do", "Leave a new message.", "Reply to a message you just heard."],
            ["What you get", "A text box with 3 bullet points.", "3 bullet points and an audio message."],
            ["Audience", "A teacher, manager, mechanic, or receptionist.", "A classmate or close friend."],
            ["Tone", "Serious and polite. Avoid slang.", "Relaxed and friendly. Contractions are fine."],
            ["Main goal", "Say your name, explain the problem, and ask for help.", "React first, then answer the prompts."],
          ].map(([feature, formal, friend]) => (
            <div className="ote-training-compare-row" role="row" key={feature}>
              <span role="cell">{feature}</span>
              <span role="cell">{formal}</span>
              <span role="cell">{friend}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <h3>Keep going</h3>
            <p>
              Try to speak for most of the 40 seconds. Extend your ideas with phrases like
              "because", "also", and "next".
            </p>
          </article>
          <article>
            <h3>Pick the right words</h3>
            <p>
              Match your English to the person you are calling. Be polite with strangers and natural
              with friends.
            </p>
          </article>
          <article>
            <h3>Be a good friend</h3>
            <p>
              In Message 2, react to the audio before answering the prompts: "Hey Alex, thanks for
              your message" or "Oh no, I'm sorry to hear that."
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
              to tighten your voicemail strategy.
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
