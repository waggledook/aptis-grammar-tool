import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, ListChecks, MessageSquare, RotateCcw, Sparkles, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const quizQuestions = [
  {
    id: "message-count",
    prompt: "How many voice messages do you leave in Advanced Speaking Part 2?",
    options: ["One", "Two", "Three"],
    answer: "One",
    explanation: "Unlike the General test, the Advanced task contains one 40-second voice message.",
  },
  {
    id: "prep-time",
    prompt: "How much preparation time do you have?",
    options: ["No preparation time", "10 seconds", "20 seconds"],
    answer: "10 seconds",
    explanation: "Use the 10 seconds to identify the situation, the listener and the three prompts.",
  },
  {
    id: "tutor-opening",
    prompt: "Which opening is most suitable for a message to your tutor?",
    options: [
      "Hey! You need to change our meeting.",
      "Dear Sir or Madam, I am writing to inform you...",
      "Hello, Dr Evans. I'm calling about our meeting this afternoon.",
    ],
    answer: "Hello, Dr Evans. I'm calling about our meeting this afternoon.",
    explanation:
      "This sounds polite and natural in a spoken message. The first is too direct, while the second sounds like a formal letter.",
  },
  {
    id: "manager-saturday",
    prompt: "Your manager asks you to work on Saturday, but you cannot. Which response is most diplomatic?",
    options: [
      "I'm not working on Saturday. Find somebody else.",
      "I'm afraid I already have an important commitment on Saturday. Would it be possible for me to cover a different shift instead?",
      "Saturday is impossible because I don't want to change my plans.",
    ],
    answer:
      "I'm afraid I already have an important commitment on Saturday. Would it be possible for me to cover a different shift instead?",
    explanation:
      "It explains the difficulty clearly and suggests a compromise without sounding rude.",
  },
  {
    id: "prep-strategy",
    prompt: "What should you do during the 10 seconds of preparation?",
    options: [
      "Write a complete 80-word message.",
      "Plan one idea for each bullet point and decide on a polite opening.",
      "Memorize the task wording so that you can repeat it exactly.",
    ],
    answer: "Plan one idea for each bullet point and decide on a polite opening.",
    explanation:
      "Ten seconds is only enough for a quick plan. Focus on the three prompts, the listener and the solution you want to suggest.",
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

export default function OteSpeakingPart2AdvancedGuide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const completedLoggedRef = useRef(false);
  const menuPath = getSitePath(nativeRoutes ? "/speaking/part-2-voicemails" : "/ote/speaking/part-2-voicemails");
  const practicePath = getSitePath(nativeRoutes ? "/speaking/part-2-voicemails/practice" : "/ote/speaking/part-2-voicemails/practice");
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
      progressId: "speaking.part2.advanced-overview",
      section: "speaking",
      part: "part-2",
      mode: "advanced_overview",
      taskTitle: "Advanced voice message strategy",
      score: correctCount,
      total: quizQuestions.length,
    });
  }, [answeredCount, correctCount]);

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Advanced Speaking Part 2 Voice Message | Seif English"
        description="Learn how to handle Advanced OTE Speaking Part 2 diplomatic voice-message tasks."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to voicemail training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Speaking Part 2</p>
        <h1>The Advanced Voice Message</h1>
        <p>
          In Part 2, you leave one voice message about a difficult or sensitive situation. The
          situation takes place at college or at work. You may need to refuse a request, explain a
          problem, ask someone to change something or suggest a solution.
        </p>
        <p>The key is to answer all three prompts while sounding polite and diplomatic.</p>
      </header>

      <section className="ote-training-summary" aria-label="Advanced Part 2 essentials">
        <div>
          <Clock3 size={24} aria-hidden="true" />
          <strong>10 seconds</strong>
          <span>You have a short time to read the task and plan your response.</span>
        </div>
        <div>
          <ListChecks size={24} aria-hidden="true" />
          <strong>3 prompts</strong>
          <span>Your message must clearly cover all three bullet points.</span>
        </div>
        <div>
          <MessageSquare size={24} aria-hidden="true" />
          <strong>40 seconds</strong>
          <span>Speak until the timer finishes. A complete response will usually be around 80-90 words.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How Part 2 Works</h2>
        <p>The task is both spoken and shown on screen.</p>
        <p>It begins with one of these settings:</p>
        <ul className="ote-practice-bullets">
          <li>You study at college.</li>
          <li>You work for a company.</li>
        </ul>
        <p>
          You are then given a situation and told who will receive your message. This may be your
          tutor, your manager, a colleague, or another student. The person you are speaking to helps
          you decide how formal and polite your language should be.
        </p>
        <p>
          The task ends with three bullet points explaining what you need to include. After 10
          seconds of preparation, recording begins. A timer counts down from 40 seconds and the
          recording stops automatically.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>What Kind of Situation Will You Get?</h2>
        <p>The situation normally requires diplomacy. For example, you may need to:</p>
        <ul className="ote-practice-bullets">
          <li>refuse a request</li>
          <li>cancel an arrangement</li>
          <li>explain why you cannot do something</li>
          <li>raise a concern</li>
          <li>ask someone to change a decision</li>
          <li>suggest a compromise or alternative</li>
        </ul>
        <p>You should be clear, but avoid sounding rude, angry or too direct.</p>
      </section>

      <section className="ote-training-section">
        <h2>Direct vs. Diplomatic Language</h2>
        <div className="ote-training-compare" role="table" aria-label="Direct and diplomatic language examples">
          <div className="ote-training-compare-head" role="row">
            <span role="columnheader">Too direct</span>
            <span role="columnheader">More diplomatic</span>
          </div>
          {[
            [
              "I can't do the presentation. Ask Daniel instead.",
              "I'm afraid I won't be able to give the presentation. Would it be possible for Daniel to do it instead? He already knows the client and has worked on the project from the beginning.",
            ],
            [
              "You need to move the meeting.",
              "I was wondering whether we could move the meeting to another time, as I have an important appointment that afternoon.",
            ],
          ].map(([direct, diplomatic]) => (
            <div className="ote-training-compare-row" role="row" key={direct}>
              <span role="cell">{direct}</span>
              <span role="cell">{diplomatic}</span>
            </div>
          ))}
        </div>
        <p>
          Diplomatic language does not mean avoiding the main point. You should explain the problem
          clearly while protecting the relationship with the other person.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>A Simple Message Plan</h2>
        <div className="ote-training-rule-grid">
          <article>
            <h3>1. Open naturally</h3>
            <p>Greet the person and explain why you are calling.</p>
            <p>Hi, Dr Evans. I'm calling about...</p>
            <p>Hello, Karen. I wanted to speak to you about...</p>
          </article>
          <article>
            <h3>2. Cover the three prompts</h3>
            <p>Use the bullet points as your plan. Give each one enough detail to be clear.</p>
          </article>
          <article>
            <h3>3. Suggest a way forward</h3>
            <p>When possible, offer an alternative, solution or compromise.</p>
            <p>Would it be possible to...? Perhaps we could... One option might be to...</p>
          </article>
          <article>
            <h3>4. Finish briefly</h3>
            <p>Please let me know what you think. I hope we can find a solution. Thanks for understanding.</p>
          </article>
        </div>
        <p>You do not need to use a long formal ending. This is a spoken message, not a letter.</p>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <h3>Cover every prompt</h3>
            <p>
              Do not spend most of the message explaining only the first point. Use the 10 seconds to
              decide what you will say for each bullet.
            </p>
          </article>
          <article>
            <h3>Match the person and situation</h3>
            <p>
              A message to your manager or tutor should usually be polite and fairly formal. A
              message to a colleague or another student may sound slightly more relaxed, but it
              should still be respectful.
            </p>
          </article>
          <article>
            <h3>Be polite but clear</h3>
            <p>
              Do not hide the main message behind too many apologies. State the problem, explain it
              and offer a practical next step.
            </p>
          </article>
        </div>
        <p>Try to use your own words rather than repeating whole phrases from the task.</p>
      </section>

      <section className="ote-training-section ote-training-quiz">
        <div className="ote-training-quiz-header">
          <div>
            <h2>Advanced Voice Message Review Quiz</h2>
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
              You answered {correctCount} of {quizQuestions.length} correctly. Use the practice sets
              to build diplomatic 40-second voice messages.
            </span>
            <button type="button" onClick={() => setAnswers({})}>
              <RotateCcw size={17} aria-hidden="true" />
              Try again
            </button>
            <button type="button" onClick={() => navigate(practicePath)}>
              <Sparkles size={17} aria-hidden="true" />
              Open practice
            </button>
          </div>
        )}
      </section>

      <section className="ote-training-section">
        <h2>Final Check Before Part 2</h2>
        <ul className="ote-practice-bullets">
          <li>Do I know who will receive the message?</li>
          <li>Have I chosen a suitable level of formality?</li>
          <li>Can I cover all three prompts?</li>
          <li>Can I explain the problem clearly?</li>
          <li>Can I use polite language to refuse, disagree or request a change?</li>
          <li>Can I suggest a practical solution?</li>
          <li>Can I speak naturally for most of the 40 seconds?</li>
        </ul>
        <button className="ote-training-primary-link" type="button" onClick={() => navigate(practicePath)}>
          <Sparkles size={17} aria-hidden="true" />
          Open Advanced Part 2 voice-message practice
        </button>
      </section>
    </main>
  );
}
