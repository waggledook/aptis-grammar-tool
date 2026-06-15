import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, CircleHelp, List, LogOut, UserRound, Accessibility } from "lucide-react";
import Seo from "../common/Seo.jsx";

const TOTAL_QUESTIONS = 30;
const TEST_SECONDS = 25 * 60;

const grammarQuestions = [
  {
    id: "g1",
    speakerA: "I enjoy working on challenging projects at work.",
    speakerB: "So ____ I!",
    options: ["am", "do", "can"],
  },
  ...Array.from({ length: 24 }, (_, index) => ({
    id: `g${index + 2}`,
    speakerA: "",
    speakerB: "This grammar question is ready for content.",
    options: ["Option A", "Option B", "Option C"],
    placeholder: true,
  })),
];

const vocabularyTasks = [
  {
    id: "v1",
    instruction:
      "Select a word from each drop-down list on the right that has the same or a very similar meaning to each word on the left.",
    example: { prompt: "big", answer: "large" },
    rows: ["study", "receive", "start", "talk", "pick"],
    options: ["go", "begin", "plan", "listen", "read", "run", "choose", "speak", "end", "get"],
  },
  ...Array.from({ length: 4 }, (_, index) => ({
    id: `v${index + 2}`,
    instruction:
      "Select the best word from each drop-down list. This vocabulary task is ready for content.",
    example: { prompt: "big", answer: "large" },
    rows: ["word 1", "word 2", "word 3", "word 4", "word 5"],
    options: ["answer 1", "answer 2", "answer 3", "answer 4", "answer 5"],
    placeholder: true,
  })),
];

function formatTimer(totalSeconds) {
  const clamped = Math.max(0, totalSeconds);
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function buildQuestion(index) {
  if (index < grammarQuestions.length) {
    return {
      type: "grammar",
      displayNumber: index + 1,
      data: grammarQuestions[index],
    };
  }

  const vocabIndex = index - grammarQuestions.length;
  return {
    type: "vocabulary",
    displayNumber: index + 1,
    data: vocabularyTasks[vocabIndex],
  };
}

function IconButton({ children, label, onClick }) {
  return (
    <button className="aptis-mock-icon-btn" type="button" onClick={onClick} aria-label={label} title={label}>
      {children}
    </button>
  );
}

export default function HubAptisGrammarVocabularyMock() {
  const [stage, setStage] = useState("landing");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(TEST_SECONDS);
  const [answers, setAnswers] = useState({});
  const [bookmarked, setBookmarked] = useState({});
  const [questionListOpen, setQuestionListOpen] = useState(false);

  const currentQuestion = useMemo(() => buildQuestion(currentIndex), [currentIndex]);
  const timerRunning = stage === "question";

  useEffect(() => {
    if (!timerRunning) return undefined;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning]);

  function startAssessment() {
    setStage("instructions");
    setCurrentIndex(0);
    setSecondsLeft(TEST_SECONDS);
  }

  function startQuestions() {
    setStage("question");
  }

  function updateAnswer(questionId, value) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  function updateVocabAnswer(taskId, row, value) {
    setAnswers((current) => ({
      ...current,
      [taskId]: {
        ...(current[taskId] || {}),
        [row]: value,
      },
    }));
  }

  function goToQuestion(nextIndex) {
    setCurrentIndex(Math.min(TOTAL_QUESTIONS - 1, Math.max(0, nextIndex)));
    setQuestionListOpen(false);
  }

  const progressWidth = `${Math.max(4, (secondsLeft / TEST_SECONDS) * 100)}%`;

  return (
    <div className="aptis-mock notranslate" translate="no">
      <Seo
        title="Aptis Grammar and Vocabulary Mock | Seif Hub"
        description="A mock Aptis grammar and vocabulary runner with exam-style timing and navigation."
      />

      {stage === "landing" ? (
        <main className="aptis-mock-start">
          <div className="aptis-mock-brand" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="aptis-mock-user">
            <UserRound size={27} strokeWidth={2.8} />
            <span />
          </div>

          <section className="aptis-mock-start-copy">
            <p>Aptis General Practice Test</p>
            <h1>Grammar and Vocabulary Practice Test Version 001</h1>

            <dl>
              <div>
                <dt>Number of Questions</dt>
                <dd>30</dd>
              </div>
              <div>
                <dt>Time Allowed</dt>
                <dd>25 min</dd>
              </div>
            </dl>

            <h2>Assessment Description</h2>

            <button className="aptis-mock-primary is-start" type="button" onClick={startAssessment}>
              Start Assessment
            </button>
          </section>
        </main>
      ) : (
        <>
          <main className={`aptis-mock-paper ${stage === "instructions" ? "is-instructions" : ""}`}>
            {stage === "instructions" ? (
              <section className="aptis-mock-instructions">
                <h1>Aptis General Grammar and Vocabulary Instructions</h1>
                <h2>Grammar and Vocabulary</h2>
                <p>The test consists of two sections:</p>
                <p>Grammar: 25 questions</p>
                <p>Vocabulary: 5 tasks with 5 questions each</p>
                <p>Total Time: 25 minutes</p>
                <p className="aptis-mock-instruction-final">
                  When you click on the 'Next' button, the test will begin.
                </p>
              </section>
            ) : (
              <section className="aptis-mock-question-screen">
                <aside className="aptis-mock-timer" aria-label="Time remaining">
                  <strong>{formatTimer(secondsLeft)}</strong>
                  <span>Time remaining</span>
                  <div>
                    <span style={{ width: progressWidth }} />
                  </div>
                </aside>

                <header className="aptis-mock-question-header">
                  <div>
                    <p>Grammar and Vocabulary</p>
                    <h1>Question {currentQuestion.displayNumber} of 30</h1>
                  </div>
                  <button
                    className={`aptis-mock-bookmark ${bookmarked[currentIndex] ? "is-active" : ""}`}
                    type="button"
                    onClick={() =>
                      setBookmarked((current) => ({ ...current, [currentIndex]: !current[currentIndex] }))
                    }
                  >
                    <Bookmark size={31} fill={bookmarked[currentIndex] ? "currentColor" : "currentColor"} />
                    <span>Bookmark</span>
                  </button>
                </header>

                {currentQuestion.type === "grammar" ? (
                  <GrammarQuestion
                    question={currentQuestion.data}
                    answer={answers[currentQuestion.data.id] || ""}
                    onAnswer={(value) => updateAnswer(currentQuestion.data.id, value)}
                  />
                ) : (
                  <VocabularyTask
                    task={currentQuestion.data}
                    answers={answers[currentQuestion.data.id] || {}}
                    onAnswer={(row, value) => updateVocabAnswer(currentQuestion.data.id, row, value)}
                  />
                )}
              </section>
            )}
          </main>

          <ExamFooter
            stage={stage}
            currentIndex={currentIndex}
            onNext={() => (stage === "instructions" ? startQuestions() : goToQuestion(currentIndex + 1))}
            onPrevious={() => goToQuestion(currentIndex - 1)}
            onOpenList={() => setQuestionListOpen(true)}
          />
        </>
      )}

      {questionListOpen ? (
        <div className="aptis-mock-question-modal" onClick={() => setQuestionListOpen(false)}>
          <div className="aptis-mock-question-modal-card" onClick={(event) => event.stopPropagation()}>
            <div>
              <h2>Questions</h2>
              <button type="button" onClick={() => setQuestionListOpen(false)}>
                Close
              </button>
            </div>
            <div className="aptis-mock-question-grid">
              {Array.from({ length: TOTAL_QUESTIONS }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  className={index === currentIndex ? "is-current" : ""}
                  onClick={() => goToQuestion(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <AptisMockStyles />
    </div>
  );
}

function GrammarQuestion({ question, answer, onAnswer }) {
  return (
    <div className="aptis-mock-grammar">
      {question.placeholder ? (
        <p className="aptis-mock-placeholder">Placeholder grammar screen</p>
      ) : (
        <>
          <p>
            <strong>A:</strong> {question.speakerA}
          </p>
          <p>
            <strong>B:</strong> {question.speakerB}
          </p>
        </>
      )}

      <div className="aptis-mock-options">
        {question.options.map((option, index) => {
          const letter = String.fromCharCode(65 + index);
          return (
            <button
              key={`${question.id}:${option}`}
              type="button"
              className={answer === option ? "is-selected" : ""}
              onClick={() => onAnswer(option)}
            >
              <span>{letter}</span>
              <strong>{option}</strong>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VocabularyTask({ task, answers, onAnswer }) {
  return (
    <div className="aptis-mock-vocabulary">
      <p className="aptis-mock-vocab-instruction">{task.instruction}</p>

      <div className="aptis-mock-vocab-form">
        <label className="aptis-mock-vocab-row is-example">
          <span>Example:</span>
          <strong>{task.example.prompt}</strong>
          <span>=</span>
          <select value={task.example.answer} disabled>
            <option>{task.example.answer}</option>
          </select>
        </label>

        {task.rows.map((row) => (
          <label key={`${task.id}:${row}`} className="aptis-mock-vocab-row">
            <span />
            <strong>{row}</strong>
            <span>=</span>
            <select value={answers[row] || ""} onChange={(event) => onAnswer(row, event.target.value)}>
              <option value=""></option>
              {task.options.map((option) => (
                <option key={`${row}:${option}`} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </div>
  );
}

function ExamFooter({ stage, currentIndex, onNext, onPrevious, onOpenList }) {
  return (
    <footer className="aptis-mock-footer">
      <div className="aptis-mock-footer-left">
        <IconButton label="Question list" onClick={onOpenList}>
          <List size={30} />
        </IconButton>
        <IconButton label="Information">
          <CircleHelp size={30} />
        </IconButton>
        <IconButton label="Accessibility">
          <Accessibility size={30} />
        </IconButton>
      </div>

      <div className="aptis-mock-footer-right">
        <IconButton label="Exit">
          <LogOut size={28} />
        </IconButton>
        {stage === "question" ? (
          <button
            className="aptis-mock-secondary"
            type="button"
            onClick={onPrevious}
            disabled={currentIndex === 0}
          >
            <ArrowLeft size={24} />
            Previous
          </button>
        ) : null}
        <button
          className="aptis-mock-primary"
          type="button"
          onClick={onNext}
          disabled={stage === "question" && currentIndex === TOTAL_QUESTIONS - 1}
        >
          Next
          <ArrowRight size={25} />
        </button>
      </div>
    </footer>
  );
}

function AptisMockStyles() {
  return (
    <style>{`
      .aptis-mock {
        --aptis-purple: #2a075e;
        --aptis-border: #cfcfd4;
        --aptis-soft: #f5f6fa;
        width: 100%;
        min-height: 100vh;
        background: #fff;
        color: #202124;
        font-family: Arial, Helvetica, sans-serif;
        letter-spacing: 0;
      }

      .aptis-mock button,
      .aptis-mock select {
        font-family: inherit;
      }

      .aptis-mock-start {
        position: relative;
        min-height: 100vh;
        border-radius: 0 0 24px 24px;
        background: #fff;
        border-top: 1px solid #ddd;
      }

      .aptis-mock-start::before {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        top: 83px;
        height: 1px;
        background: #d6d6da;
      }

      .aptis-mock-brand {
        position: absolute;
        top: 20px;
        left: 28px;
        display: grid;
        grid-template-columns: repeat(2, 20px);
        gap: 5px;
      }

      .aptis-mock-brand span {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--aptis-purple);
      }

      .aptis-mock-user {
        position: absolute;
        top: 25px;
        right: 76px;
        display: flex;
        align-items: center;
        gap: 25px;
        color: #111;
      }

      .aptis-mock-user span {
        width: 18px;
        height: 18px;
        border-right: 3px solid currentColor;
        border-bottom: 3px solid currentColor;
        transform: rotate(45deg) translateY(-5px);
      }

      .aptis-mock-start-copy {
        padding: 126px 0 0 195px;
        max-width: 760px;
      }

      .aptis-mock-start-copy p,
      .aptis-mock-start-copy h1,
      .aptis-mock-start-copy h2,
      .aptis-mock-start-copy dt,
      .aptis-mock-start-copy dd {
        color: #27282d;
        text-align: left;
      }

      .aptis-mock-start-copy p {
        margin: 0 0 18px;
        font-size: 20px;
        font-weight: 700;
      }

      .aptis-mock-start-copy h1 {
        margin: 0 0 37px;
        font-size: 26px;
        line-height: 1.2;
      }

      .aptis-mock-start-copy dl {
        display: flex;
        gap: 110px;
        margin: 0 0 39px;
      }

      .aptis-mock-start-copy dt {
        margin-bottom: 13px;
        font-size: 17px;
        font-weight: 700;
      }

      .aptis-mock-start-copy dd {
        font-size: 20px;
        font-weight: 700;
      }

      .aptis-mock-start-copy h2 {
        margin: 0 0 57px;
        font-size: 18px;
      }

      .aptis-mock-paper {
        min-height: calc(100vh - 104px);
        padding: 112px 32px 170px;
        background: #fff;
      }

      .aptis-mock-paper.is-instructions {
        display: flex;
        justify-content: center;
        padding-top: 110px;
      }

      .aptis-mock-instructions {
        width: min(100%, 680px);
        color: #2b2d31;
      }

      .aptis-mock-instructions h1,
      .aptis-mock-instructions h2 {
        text-align: left;
        color: #2b2d31;
      }

      .aptis-mock-instructions h1 {
        margin: 0 0 22px;
        font-size: 28px;
        line-height: 1.2;
      }

      .aptis-mock-instructions h2 {
        margin: 0 0 24px;
        font-size: 22px;
      }

      .aptis-mock-instructions p {
        margin: 0 0 22px;
        font-size: 21px;
        line-height: 1.25;
      }

      .aptis-mock-instruction-final {
        padding-top: 48px;
      }

      .aptis-mock-question-screen {
        position: relative;
        width: min(100%, 1200px);
        margin: 0 auto;
      }

      .aptis-mock-timer {
        position: fixed;
        top: 17px;
        right: 31px;
        display: grid;
        gap: 2px;
        width: 170px;
        text-align: right;
        z-index: 2;
      }

      .aptis-mock-timer strong {
        color: #191a1e;
        font-size: 31px;
        line-height: 1;
      }

      .aptis-mock-timer span {
        color: #191a1e;
        font-size: 18px;
      }

      .aptis-mock-timer div {
        justify-self: end;
        width: 164px;
        height: 5px;
        margin-top: 7px;
        border-radius: 999px;
        background: #eceaf1;
        overflow: hidden;
      }

      .aptis-mock-timer div span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: var(--aptis-purple);
      }

      .aptis-mock-question-header {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
        gap: 32px;
        margin: 0 0 92px;
      }

      .aptis-mock-question-header p {
        margin: 0 0 16px;
        font-size: 24px;
        font-weight: 700;
      }

      .aptis-mock-question-header h1 {
        margin: 0;
        text-align: left;
        color: #1f2024;
        font-size: 30px;
        line-height: 1.15;
      }

      .aptis-mock-bookmark {
        display: inline-flex;
        align-items: center;
        gap: 24px;
        min-width: 234px;
        min-height: 79px;
        margin-right: 275px;
        padding: 0 28px;
        border: 2px solid #b9b9be;
        border-radius: 8px;
        background: #fff;
        color: #17181c;
        font-size: 21px;
        font-weight: 700;
      }

      .aptis-mock-bookmark.is-active {
        border-color: var(--aptis-purple);
      }

      .aptis-mock-grammar {
        width: min(100%, 1320px);
      }

      .aptis-mock-grammar p {
        margin: 0 0 28px;
        font-size: 22px;
        line-height: 1.35;
      }

      .aptis-mock-placeholder {
        color: #6b7280;
      }

      .aptis-mock-options {
        width: min(100%, 1310px);
        margin-top: 24px;
        display: grid;
        gap: 4px;
      }

      .aptis-mock-options button {
        display: grid;
        grid-template-columns: 98px minmax(0, 1fr);
        align-items: stretch;
        min-height: 93px;
        padding: 0;
        border: 2px solid #d6d6d9;
        border-radius: 0;
        background: #f7f8fb;
        color: #18191d;
        text-align: left;
        overflow: hidden;
      }

      .aptis-mock-options button.is-selected {
        border-color: var(--aptis-purple);
        box-shadow: inset 0 0 0 2px var(--aptis-purple);
      }

      .aptis-mock-options button span {
        display: grid;
        place-items: center;
        border-right: 2px solid #d6d6d9;
        background: #fff;
        font-size: 45px;
        font-weight: 400;
      }

      .aptis-mock-options button strong {
        align-self: center;
        padding: 0 17px;
        font-size: 20px;
        font-weight: 400;
      }

      .aptis-mock-vocabulary {
        max-width: 1015px;
      }

      .aptis-mock-vocab-instruction {
        max-width: 1015px;
        margin: 0 0 58px;
        font-size: 21px;
        font-weight: 700;
        line-height: 1.28;
      }

      .aptis-mock-vocab-form {
        width: 425px;
        margin: 0 auto;
        display: grid;
        gap: 19px;
      }

      .aptis-mock-vocab-row {
        display: grid;
        grid-template-columns: 116px 82px 22px 180px;
        align-items: center;
        color: #1f2024;
        font-size: 22px;
      }

      .aptis-mock-vocab-row > span:first-child {
        font-weight: 700;
        text-align: right;
      }

      .aptis-mock-vocab-row strong {
        text-align: right;
        font-size: 22px;
      }

      .aptis-mock-vocab-row > span:nth-child(3) {
        text-align: center;
        font-weight: 700;
      }

      .aptis-mock-vocab-row select {
        width: 180px;
        height: 42px;
        border: 2px solid #d5d5d8;
        border-radius: 0;
        background: #fff;
        color: #1f2024;
        font-size: 18px;
      }

      .aptis-mock-footer {
        position: fixed;
        left: 19px;
        right: 19px;
        bottom: 20px;
        z-index: 5;
        min-height: 91px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 14px 13px;
        border-radius: 9px;
        background: #fff;
        box-shadow: 0 0 26px rgba(42, 7, 94, 0.18);
      }

      .aptis-mock-footer-left,
      .aptis-mock-footer-right {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .aptis-mock-icon-btn,
      .aptis-mock-secondary,
      .aptis-mock-primary {
        min-height: 65px;
        border: 2px solid #bdbdc2;
        border-radius: 8px;
        background: #fff;
        color: #17181c;
        font-size: 21px;
        font-weight: 700;
      }

      .aptis-mock-icon-btn {
        width: 68px;
        display: grid;
        place-items: center;
        padding: 0;
      }

      .aptis-mock-secondary,
      .aptis-mock-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 18px;
        min-width: 190px;
        padding: 0 29px;
      }

      .aptis-mock-primary {
        border-color: #3f2674;
        background: var(--aptis-purple);
        color: #fff;
      }

      .aptis-mock-primary.is-start {
        min-width: 262px;
        min-height: 80px;
        border-radius: 8px;
        font-size: 21px;
      }

      .aptis-mock-secondary:disabled,
      .aptis-mock-primary:disabled {
        opacity: 0.45;
        cursor: default;
      }

      .aptis-mock-question-modal {
        position: fixed;
        inset: 0;
        z-index: 10;
        display: grid;
        place-items: center;
        background: rgba(20, 20, 24, 0.32);
      }

      .aptis-mock-question-modal-card {
        width: min(92vw, 540px);
        padding: 24px;
        border-radius: 8px;
        background: #fff;
        color: #1f2024;
        box-shadow: 0 22px 60px rgba(0, 0, 0, 0.22);
      }

      .aptis-mock-question-modal-card > div:first-child {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 18px;
      }

      .aptis-mock-question-modal-card h2 {
        margin: 0;
        color: #1f2024;
        text-align: left;
      }

      .aptis-mock-question-modal-card button {
        border: 1px solid #c7c7cc;
        background: #fff;
        color: #1f2024;
      }

      .aptis-mock-question-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 10px;
      }

      .aptis-mock-question-grid button {
        min-height: 48px;
        font-weight: 700;
      }

      .aptis-mock-question-grid button.is-current {
        border-color: var(--aptis-purple);
        background: var(--aptis-purple);
        color: #fff;
      }

      @media (max-width: 900px) {
        .aptis-mock-start-copy {
          padding: 120px 24px 0;
        }

        .aptis-mock-paper {
          padding-inline: 24px;
        }

        .aptis-mock-question-header {
          grid-template-columns: 1fr;
          margin-bottom: 58px;
        }

        .aptis-mock-bookmark {
          margin-right: 0;
          min-width: 0;
          width: fit-content;
        }

        .aptis-mock-timer {
          position: static;
          justify-self: end;
          margin: -82px 0 40px auto;
        }

        .aptis-mock-vocab-form {
          margin-left: 0;
        }

        .aptis-mock-footer {
          left: 8px;
          right: 8px;
          bottom: 8px;
          flex-wrap: wrap;
        }
      }

      @media (max-height: 760px) and (min-width: 760px) {
        .aptis-mock-paper {
          min-height: calc(100vh - 84px);
          padding-top: 64px;
          padding-bottom: 118px;
        }

        .aptis-mock-paper.is-instructions {
          padding-top: 64px;
        }

        .aptis-mock-question-header {
          margin-bottom: 44px;
        }

        .aptis-mock-question-header p {
          margin-bottom: 10px;
          font-size: 22px;
        }

        .aptis-mock-question-header h1 {
          font-size: 28px;
        }

        .aptis-mock-bookmark {
          min-height: 64px;
        }

        .aptis-mock-grammar p {
          margin-bottom: 20px;
        }

        .aptis-mock-options button {
          min-height: 78px;
        }

        .aptis-mock-vocab-instruction {
          margin-bottom: 34px;
        }

        .aptis-mock-vocab-form {
          gap: 10px;
        }

        .aptis-mock-vocab-row select {
          height: 36px;
        }

        .aptis-mock-footer {
          bottom: 12px;
          min-height: 78px;
          padding-block: 8px;
        }

        .aptis-mock-icon-btn,
        .aptis-mock-secondary,
        .aptis-mock-primary {
          min-height: 62px;
        }
      }

      @media (max-width: 640px) {
        .aptis-mock-start-copy dl,
        .aptis-mock-footer,
        .aptis-mock-footer-left,
        .aptis-mock-footer-right {
          gap: 8px;
        }

        .aptis-mock-start-copy dl {
          flex-direction: column;
        }

        .aptis-mock-options button {
          grid-template-columns: 64px minmax(0, 1fr);
          min-height: 76px;
        }

        .aptis-mock-options button span {
          font-size: 32px;
        }

        .aptis-mock-vocab-form {
          width: 100%;
        }

        .aptis-mock-vocab-row {
          grid-template-columns: 82px 1fr 20px minmax(120px, 160px);
          font-size: 18px;
        }

        .aptis-mock-vocab-row strong {
          font-size: 18px;
        }

        .aptis-mock-secondary,
        .aptis-mock-primary {
          min-width: 134px;
          padding-inline: 16px;
          font-size: 17px;
        }

        .aptis-mock-icon-btn {
          width: 56px;
        }
      }
    `}</style>
  );
}
