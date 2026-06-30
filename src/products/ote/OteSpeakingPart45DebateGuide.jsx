import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, ListChecks, MessageCircleQuestion, RotateCcw, Sparkles, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const quizQuestions = [
  {
    id: "prompt-count",
    prompt: "How many of the five debate prompts should you use?",
    options: ["All five", "Two or three", "Exactly one"],
    answer: "Two or three",
    explanation: "The instructions ask you to use two or three prompts, support your ideas and give a conclusion.",
  },
  {
    id: "prep-use",
    prompt: "What is the best use of the 45-second preparation time?",
    options: [
      "Write a complete two-minute script.",
      "Choose a side, select prompts and note reasons or examples.",
      "Plan arguments for both sides without choosing a position.",
    ],
    answer: "Choose a side, select prompts and note reasons or examples.",
    explanation:
      "You do not have time to write a script. Make short notes that help you organize and support a clear position.",
  },
  {
    id: "developed-point",
    prompt: "Which debate point is best developed?",
    options: [
      "Public transport is important.",
      "Public transport is important because it is good.",
      "Better public transport can reduce traffic and pollution because more people may choose to leave their cars at home.",
    ],
    answer:
      "Better public transport can reduce traffic and pollution because more people may choose to leave their cars at home.",
    explanation: "The final answer explains the point and shows a clear possible result.",
  },
  {
    id: "part5-time",
    prompt: "How much time do you have for each Part 5 question?",
    options: ["30 seconds", "40 seconds", "1 minute"],
    answer: "40 seconds",
    explanation: "There are four questions, and you have 40 seconds for each answer. There is no separate preparation time.",
  },
  {
    id: "part5-development",
    prompt: "How do the Part 5 questions usually develop?",
    options: [
      "All four repeat the exact debate statement.",
      "Question 1 relates closely to the debate, while later questions move into wider related issues.",
      "The questions become personal and unrelated to the debate topic.",
    ],
    answer: "Question 1 relates closely to the debate, while later questions move into wider related issues.",
    explanation:
      "The first question stays close to your debate, but Questions 2-4 gradually move away from it to test a wider range of ideas and language.",
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

export default function OteSpeakingPart45DebateGuide({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const completedLoggedRef = useRef(false);
  const menuPath = getSitePath(nativeRoutes ? "/speaking/parts-4-5-debate" : "/ote/speaking/parts-4-5-debate");
  const practicePath = getSitePath(nativeRoutes ? "/speaking/parts-4-5-debate/practice" : "/ote/speaking/parts-4-5-debate/practice");
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
      progressId: "speaking.parts45.advanced-debate-overview",
      section: "speaking",
      part: "parts-4-5",
      mode: "advanced_debate_overview",
      taskTitle: "Advanced debate and follow-up strategy",
      score: correctCount,
      total: quizQuestions.length,
    });
  }, [answeredCount, correctCount]);

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Advanced Speaking Parts 4 and 5 Debate | Seif English"
        description="Learn how to prepare an Advanced OTE debate response and answer related follow-up questions."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to debate training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Speaking Parts 4 & 5</p>
        <h1>The Advanced Debate and Follow-up Questions</h1>
        <p>
          In Part 4, you give a two-minute argument for or against a debate statement. In Part 5,
          you answer four questions connected to the same general topic.
        </p>
        <p>
          The two parts are closely connected, so a clear understanding of the debate topic will
          also help you with the follow-up questions.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="Advanced Parts 4 and 5 essentials">
        <div>
          <Clock3 size={24} aria-hidden="true" />
          <strong>45 sec + 2 min</strong>
          <span>Prepare your debate, then speak for two minutes.</span>
        </div>
        <div>
          <ListChecks size={24} aria-hidden="true" />
          <strong>5 prompts</strong>
          <span>Choose two or three ideas, support them, and give a conclusion.</span>
        </div>
        <div>
          <MessageCircleQuestion size={24} aria-hidden="true" />
          <strong>4 questions</strong>
          <span>Answer each follow-up question for 40 seconds with no preparation time.</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How Part 4 Works</h2>
        <p>Your tutor asks you to take part in a class debate.</p>
        <p>
          You see and hear a statement and must decide whether to argue for or against it. The
          debate statement appears in the centre of the screen, surrounded by five short prompts.
          The prompts give you possible ideas for your argument.
        </p>
        <p>You should:</p>
        <ul className="ote-practice-bullets">
          <li>choose a clear position</li>
          <li>use two or three prompts</li>
          <li>support each point with reasons, explanations or examples</li>
          <li>organize the argument clearly</li>
          <li>finish with a conclusion</li>
        </ul>
        <p>You do not need to discuss all five prompts. It is better to develop two strong ideas than mention five ideas very briefly.</p>
      </section>

      <section className="ote-training-section">
        <h2>A Simple Debate Plan</h2>
        <div className="ote-training-rule-grid">
          <article>
            <h3>1. Choose your position</h3>
            <p>Decide whether you are arguing for or against the statement.</p>
            <p>Do not spend too long searching for your true personal opinion. Choose the side you can support most clearly.</p>
          </article>
          <article>
            <h3>2. Choose two or three prompts</h3>
            <p>Pick the ideas that connect most easily and give you something specific to say.</p>
          </article>
          <article>
            <h3>3. Add support</h3>
            <p>For each prompt, plan a reason, an example, or a possible result.</p>
          </article>
          <article>
            <h3>4. Plan your conclusion</h3>
            <p>Decide how you will bring the argument together at the end.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>A Useful Speaking Structure</h2>
        <div className="ote-training-rule-grid">
          <article>
            <h3>Introduction</h3>
            <p>State your position clearly.</p>
            <p>I would argue in favour of this statement.</p>
            <p>I do not believe that this would be a positive development.</p>
          </article>
          <article>
            <h3>First main point</h3>
            <p>Introduce one of the prompts and develop it.</p>
            <p>The first issue to consider is... This is important because... For example, ...</p>
          </article>
          <article>
            <h3>Second main point</h3>
            <p>Move clearly to the next idea.</p>
            <p>A further concern is... Another significant advantage would be... This could lead to...</p>
          </article>
          <article>
            <h3>Conclusion</h3>
            <p>Restate your position without repeating the whole talk.</p>
            <p>Overall, I believe that... Taking these points into account, I would argue against...</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>How Part 5 Works</h2>
        <p>After the debate, you answer four questions on the same general topic.</p>
        <p>
          The questions are audio-only. You hear each question but do not see its words on screen.
          Only the question number and the timer appear.
        </p>
        <p>
          You have no separate preparation time. When the tone sounds, your 40-second answer begins.
          The questions are connected, but they do not all ask about exactly the same issue.
        </p>
        <ul className="ote-practice-bullets">
          <li>Question 1 relates directly to the debate.</li>
          <li>Questions 2-4 gradually move further away from the original statement.</li>
          <li>Later questions may ask about wider social issues, different opinions or imaginary situations.</li>
        </ul>
        <p>You may need to express an opinion, consider another side, speculate about results, or respond to a hypothetical situation.</p>
      </section>

      <section className="ote-training-section">
        <h2>Build a Full Follow-up Answer</h2>
        <div className="ote-training-rule-grid">
          <article>
            <h3>1. Answer directly</h3>
            <p>Make your opinion clear.</p>
          </article>
          <article>
            <h3>2. Explain</h3>
            <p>Give one or two reasons.</p>
          </article>
          <article>
            <h3>3. Develop</h3>
            <p>Add an example, result, contrast or limitation.</p>
          </article>
        </div>
        <div className="ote-training-compare" role="table" aria-label="Short and developed follow-up answers">
          <div className="ote-training-compare-head" role="row">
            <span role="columnheader">Too short</span>
            <span role="columnheader">Better</span>
          </div>
          <div className="ote-training-compare-row" role="row">
            <span role="cell">Yes, I think they are.</span>
            <span role="cell">
              Yes, particularly younger people, because social media exposes them to new trends
              constantly. This can create pressure to buy clothes they do not need simply to fit in.
              However, the effect probably depends on the person, as some people are much less
              influenced by fashion than others.
            </span>
          </div>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>3 Rules for a High Score</h2>
        <div className="ote-training-rule-grid">
          <article>
            <h3>Choose depth, not quantity</h3>
            <p>Use two or three prompts and develop them properly. Do not turn the talk into a quick list of all five ideas.</p>
          </article>
          <article>
            <h3>Support every main point</h3>
            <p>A statement alone is not enough. Add a reason, example, consequence or comparison.</p>
          </article>
          <article>
            <h3>Treat every follow-up as new</h3>
            <p>Listen carefully and answer the exact question asked. Do not simply repeat your debate speech.</p>
          </article>
        </div>
      </section>

      <section className="ote-training-section ote-training-quiz">
        <div className="ote-training-quiz-header">
          <div>
            <h2>Advanced Debate and Follow-up Review Quiz</h2>
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
              to build confident debate and follow-up responses.
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
        <h2>Final Check Before Parts 4 & 5</h2>
        <ul className="ote-practice-bullets">
          <li>Can I choose a clear side quickly?</li>
          <li>Can I select two or three useful prompts?</li>
          <li>Can I support each point with a reason or example?</li>
          <li>Can I organize a two-minute talk with a conclusion?</li>
          <li>Can I listen carefully to audio-only questions?</li>
          <li>Can I answer each question directly?</li>
          <li>Can I add a reason and one more detail?</li>
          <li>Can I discuss wider or hypothetical issues without preparation?</li>
          <li>Can I keep speaking after a small mistake?</li>
        </ul>
        <button className="ote-training-primary-link" type="button" onClick={() => navigate(practicePath)}>
          <Sparkles size={17} aria-hidden="true" />
          Open Advanced debate and follow-up practice
        </button>
      </section>
    </main>
  );
}
