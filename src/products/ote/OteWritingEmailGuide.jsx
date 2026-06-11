import React, { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, FileText, Mail, MessageSquareText, RotateCcw, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const quizQuestions = [
  {
    id: "known-recipient",
    prompt: 'You open the task and see the email is from "Mr. Bell, Course Instructor". How should you open your response?',
    options: ["Dear Sir or Madam,", "Dear Mr. Bell,", "Hi Bell, how's it going?"],
    answer: "Dear Mr. Bell,",
    explanation:
      "If you know the sender's name, use it. Dear Sir or Madam is for a person whose name you do not know, and Hi Bell is not polite enough.",
  },
  {
    id: "word-count",
    prompt: "Your email is only 65 words. What is the main risk?",
    options: [
      "Nothing, as long as all three notes are included.",
      "The system will not let you submit.",
      "Your score can be much lower because the answer is too short.",
    ],
    answer: "Your score can be much lower because the answer is too short.",
    explanation:
      "OTE Writing Part 1 asks for 80-130 words. If your answer is much too short, you can lose marks even if your English is correct.",
  },
  {
    id: "expanded-reason",
    prompt: 'A note says "No, because...". Which informal response is strongest?',
    options: [
      "I regret to inform you that I cannot attend due to an unexpected conflict.",
      "No, because I am busy.",
      "I'd love to, but I can't make it because I have to help my family move that day.",
    ],
    answer: "I'd love to, but I can't make it because I have to help my family move that day.",
    explanation:
      "It sounds friendly and gives a clear reason. The short answer is too simple.",
  },
  {
    id: "leftover-time",
    prompt: "True or false: leftover time from Part 1 carries over to the Part 2 task.",
    options: ["True", "False"],
    answer: "False",
    explanation:
      "Each writing task has its own timer. If you finish early, use the spare time to review, expand, and proofread.",
  },
  {
    id: "offer-help-formal",
    prompt: 'The note says "Offer to help". You are writing to a college principal. Which phrase fits best?',
    options: [
      "Just let me know if you want me to sort out the decorations.",
      "I would be delighted to assist with the preparation of the event.",
      "I can give you a hand with setting everything up on Friday.",
    ],
    answer: "I would be delighted to assist with the preparation of the event.",
    explanation:
      "It sounds polite and serious, so it fits an email to a college principal.",
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

export default function OteWritingEmailGuide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const menuPath = getSitePath(nativeRoutes ? "/writing/training/email" : "/ote/writing/training/email");
  const practicePath = getSitePath(nativeRoutes ? "/writing/training/email/practice" : "/ote/writing/training/email/practice");
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
        title="OTE Writing Part 1 Email Guide | Seif English"
        description="Understand the OTE Writing Part 1 email task, register choices, handwritten notes, timing, and word count."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to email training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Writing Part 1</p>
        <h1>The Email Task</h1>
        <p>
          In the first section of the OTE Writing module, you read an email and write a reply of
          80-130 words. First check who you are writing to. Then answer all three handwritten notes
          and keep an eye on the 20-minute timer.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="Writing Part 1 essentials">
        <div>
          <Clock3 size={24} aria-hidden="true" />
          <strong>20 minutes</strong>
          <span>Read, plan, write, and proofread inside one strict timer.</span>
        </div>
        <div>
          <FileText size={24} aria-hidden="true" />
          <strong>80-130 words</strong>
          <span>Very short answers lose marks. Very long answers waste time.</span>
        </div>
        <div>
          <MessageSquareText size={24} aria-hidden="true" />
          <strong>3 notes</strong>
          <span>Each green handwritten note needs a clear response and detail.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How the Email Task Works</h2>
        <p>
          The screen gives you an email from one person and three handwritten notes. The notes tell
          you what to include in your reply. You must answer all of them.
        </p>
        <p>
          Before you write, ask: Who am I writing to? A friend needs friendly, informal language.
          A teacher, manager, or coordinator needs more polite, formal language. This choice is
          called register.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>Register: Formal vs. Informal</h2>
        <div className="ote-training-compare" role="table" aria-label="Comparison of formal and informal OTE email language">
          <div className="ote-training-compare-head" role="row">
            <span role="columnheader">Feature</span>
            <span role="columnheader">Formal / Polite Task</span>
            <span role="columnheader">Informal / Friendly Task</span>
          </div>
          {[
            ["Reader", "A principal, course tutor, manager, or coordinator.", "A classmate, close friend, or family member."],
            ["Opening", "Dear Mr. Davis, / Dear Ms. Smith,", "Hi Sam, / Hey Alex,"],
            ["Grammar", "Full forms: I am writing, I cannot.", "Short forms are natural: I'm writing, I can't."],
            ["Useful phrases", "Polite phrases: I would like to suggest...", "Friendly phrases: What about...? / Any ideas?"],
            ["Closing", "Yours sincerely, / Kind regards,", "Write back soon, / Cheers, / Speak soon,"],
          ].map(([feature, formal, informal]) => (
            <div className="ote-training-compare-row" role="row" key={feature}>
              <span role="cell">{feature}</span>
              <span role="cell">{formal}</span>
              <span role="cell">{informal}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <Mail size={22} aria-hidden="true" />
            <h3>Hunt down the notes</h3>
            <p>
              Every email has three handwritten notes. Answer each one and add a detail, reason, or
              result so your reply feels complete.
            </p>
          </article>
          <article>
            <MessageSquareText size={22} aria-hidden="true" />
            <h3>Let the sender choose the tone</h3>
            <p>
              If the sender is a friend, sound warm and natural. If the sender is a tutor or coordinator,
              use more formal register with polite and complete sentences.
            </p>
          </article>
          <article>
            <Clock3 size={22} aria-hidden="true" />
            <h3>Save two minutes</h3>
            <p>
              Do not type until the final second. Leave time to check word count, spelling, the greeting,
              the closing, and whether all three notes are covered.
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
              to improve your email plan.
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
          Open timed email practice
        </button>
      </section>
    </main>
  );
}
