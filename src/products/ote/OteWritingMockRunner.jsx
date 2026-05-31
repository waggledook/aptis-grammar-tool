import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Download, FileText, HelpCircle, Printer, Settings } from "lucide-react";
import { saveOteWritingSubmission } from "../../firebase.js";
import { getOteWritingMock } from "./mockTests/data/oteWritingMockData.js";
import {
  downloadOteWritingSubmissionDocx,
  downloadOteWritingSubmissionText,
} from "./mockTests/utils/oteWritingSubmissionExport.js";
import "./styles/ote.css";

const WRITING_PART_TITLE_SECONDS = 5;

function formatTime(seconds) {
  const safe = Math.max(0, Math.ceil(seconds || 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function countWords(value) {
  const text = String(value || "").trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

export default function OteWritingMockRunner({ user, onRequireSignIn, nativeRoutes = false }) {
  const { mockId = "writing-1" } = useParams();
  const navigate = useNavigate();
  const mock = getOteWritingMock(mockId);

  const [status, setStatus] = useState("ready");
  const [countdownLeft, setCountdownLeft] = useState(mock.countdownSeconds);
  const [partTitleLeft, setPartTitleLeft] = useState(WRITING_PART_TITLE_SECONDS);
  const [timerLeft, setTimerLeft] = useState(0);
  const [task2Choice, setTask2Choice] = useState("essay");
  const [answers, setAnswers] = useState({ task1: "", essay: "", article: "" });
  const [finishedAt, setFinishedAt] = useState(null);
  const [finishNotice, setFinishNotice] = useState("");
  const [finishReason, setFinishReason] = useState("");
  const [submissionId, setSubmissionId] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState("idle");
  const [submissionError, setSubmissionError] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [visualSettings, setVisualSettings] = useState({
    fontSize: "medium",
    theme: "default",
  });
  const saveStartedRef = useRef(false);

  const wordCounts = useMemo(
    () => ({
      task1: countWords(answers.task1),
      essay: countWords(answers.essay),
      article: countWords(answers.article),
    }),
    [answers]
  );

  useEffect(() => {
    if (status !== "countdown") return undefined;
    if (countdownLeft <= 0) {
      showPartTitle("part1Title");
      return undefined;
    }
    const timer = window.setTimeout(() => setCountdownLeft((prev) => prev - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdownLeft, mock.task1.timeSeconds, status]);

  useEffect(() => {
    if (!["part1Title", "part2Title"].includes(status)) return undefined;
    if (partTitleLeft <= 0) {
      if (status === "part1Title") {
        setStatus("task1");
        setTimerLeft(mock.task1.timeSeconds);
        return undefined;
      }
      setStatus("choice");
      setTimerLeft(mock.task2.choiceSeconds);
      return undefined;
    }
    const timer = window.setTimeout(() => setPartTitleLeft((prev) => prev - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [mock.task1.timeSeconds, mock.task2.choiceSeconds, partTitleLeft, status]);

  useEffect(() => {
    if (!["task1", "choice", "task2"].includes(status)) return undefined;
    if (timerLeft <= 0) {
      advanceFromTimer();
      return undefined;
    }
    const timer = window.setTimeout(() => setTimerLeft((prev) => prev - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [status, timerLeft]);

  useEffect(() => {
    if (status !== "complete" || !user || saveStartedRef.current) return;
    saveStartedRef.current = true;
    const payload = buildSubmissionPayload();
    setSubmissionStatus("saving");
    saveOteWritingSubmission(payload)
      .then((id) => {
        setSubmissionId(id || "");
        setSubmissionStatus(id ? "saved" : "idle");
      })
      .catch((error) => {
        console.warn("[OTE writing] save failed", error);
        setSubmissionStatus("error");
        setSubmissionError(error?.message || "Could not save this submission.");
      });
  }, [status, user]);

  function startMock() {
    if (!user) {
      onRequireSignIn?.();
      return;
    }
    setAnswers({ task1: "", essay: "", article: "" });
    setTask2Choice("essay");
    setFinishedAt(null);
    setFinishNotice("");
    setFinishReason("");
    setSubmissionId("");
    setSubmissionStatus("idle");
    setSubmissionError("");
    saveStartedRef.current = false;
    setCountdownLeft(mock.countdownSeconds);
    setPartTitleLeft(WRITING_PART_TITLE_SECONDS);
    setStatus("countdown");
  }

  function updateAnswer(key, value) {
    if (status === "complete") return;
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function showPartTitle(nextStatus) {
    setPartTitleLeft(WRITING_PART_TITLE_SECONDS);
    setStatus(nextStatus);
  }

  function goToChoice() {
    showPartTitle("part2Title");
  }

  function beginTask2() {
    setStatus("task2");
    setTimerLeft(mock.task2.timeSeconds);
  }

  function finishMock(reason = "manual") {
    const endedAt = new Date().toISOString();
    setFinishedAt(endedAt);
    setFinishReason(reason);
    setFinishNotice(reason === "time" ? "Time is up. Your writing is locked for review." : "");
    setStatus("complete");
  }

  function advanceFromTimer() {
    if (status === "task1") {
      goToChoice();
      return;
    }
    if (status === "choice") {
      beginTask2();
      return;
    }
    if (status === "task2") {
      finishMock("time");
    }
  }

  function buildSubmissionPayload() {
    return {
      mockId: mock.id,
      mockTitle: mock.title,
      moduleLabel: mock.moduleLabel,
      task2Choice,
      answers: {
        task1: answers.task1,
        essay: answers.essay,
        article: answers.article,
      },
      counts: wordCounts,
      tasks: {
        task1: {
          title: mock.task1.title,
          minWords: mock.task1.minWords,
          maxWords: mock.task1.maxWords,
          setup: mock.task1.setup,
          replyTo: mock.task1.replyTo,
          replySubject: mock.task1.replySubject,
          email: mock.task1.email,
        },
        task2: {
          title: mock.task2.title,
          minWords: mock.task2.minWords,
          maxWords: mock.task2.maxWords,
          selectedOption: mock.task2.options[task2Choice],
        },
      },
      timings: {
        task1Seconds: mock.task1.timeSeconds,
        task2ChoiceSeconds: mock.task2.choiceSeconds,
        task2Seconds: mock.task2.timeSeconds,
      },
      finishedAt: finishedAt || new Date().toISOString(),
      reason: finishReason,
    };
  }

  const homePath = nativeRoutes ? "/" : "/ote";
  const headerState = getHeaderState(status, mock, timerLeft);

  return (
    <main className={`ote-exam ote-writing-exam ote-font-${visualSettings.fontSize} ote-theme-${visualSettings.theme}`}>
      <WritingHeader {...headerState} />

      {status === "ready" ? (
        <WritingStartScreen user={user} onStart={startMock} />
      ) : status === "countdown" ? (
        <WritingCountdown secondsLeft={countdownLeft} />
      ) : status === "part1Title" ? (
        <WritingPartTitle partNumber={1} />
      ) : status === "part2Title" ? (
        <WritingPartTitle partNumber={2} />
      ) : status === "task1" ? (
        <TaskOne
          mock={mock}
          value={answers.task1}
          words={wordCounts.task1}
          onChange={(value) => updateAnswer("task1", value)}
        />
      ) : status === "choice" ? (
        <TaskTwoChoice
          mock={mock}
          choice={task2Choice}
          onChoiceChange={setTask2Choice}
        />
      ) : status === "task2" ? (
        <TaskTwoWriting
          mock={mock}
          choice={task2Choice}
          value={answers[task2Choice]}
          words={wordCounts[task2Choice]}
          onChange={(value) => updateAnswer(task2Choice, value)}
        />
      ) : (
        <WritingComplete
          mock={mock}
          answers={answers}
          task2Choice={task2Choice}
          wordCounts={wordCounts}
          notice={finishNotice}
          submissionId={submissionId}
          submissionStatus={submissionStatus}
          submissionError={submissionError}
          submission={buildSubmissionPayload()}
          onPrint={() => window.print()}
          onDownloadText={(submission) => downloadOteWritingSubmissionText({ submissionId, submission, mock })}
          onDownloadDocx={(submission) => downloadOteWritingSubmissionDocx({ submissionId, submission, mock })}
          onBack={() => navigate(homePath)}
        />
      )}

      {["task1", "choice", "task2"].includes(status) ? (
        <WritingFooter
          status={status}
          onOpenSettings={() => setSettingsOpen(true)}
          onNext={status === "task1" ? goToChoice : status === "choice" ? beginTask2 : () => finishMock("manual")}
        />
      ) : null}
      <VisualOptionsDrawer
        open={settingsOpen}
        settings={visualSettings}
        onChange={setVisualSettings}
        onClose={() => setSettingsOpen(false)}
      />
    </main>
  );
}

function getHeaderState(status, mock, timerLeft) {
  if (status === "task2" || status === "choice" || status === "part2Title") {
    return {
      title: "Writing Part 2",
      progress: status === "choice" ? 0 : 50,
      timeLeft: status === "part2Title" ? null : timerLeft,
    };
  }
  if (status === "task1" || status === "part1Title") {
    return {
      title: "Writing Part 1",
      progress: 0,
      timeLeft: status === "part1Title" ? null : timerLeft,
    };
  }
  return {
    title: mock.title,
    progress: 0,
    timeLeft: null,
  };
}

function WritingHeader({ title, progress, timeLeft }) {
  return (
    <header className="ote-exam-header ote-writing-header">
      <img src="/images/seif-trainer-logo.png" alt="" className="ote-exam-mark" draggable="false" />
      <div className="ote-exam-title">{title}</div>
      <div className="ote-progress-rail" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      {timeLeft == null ? (
        <div className="ote-exam-meta">
          <strong>Seif OTE Trainer</strong>
          <span>Mock</span>
        </div>
      ) : (
        <div className="ote-writing-timer">{formatTime(timeLeft)}</div>
      )}
    </header>
  );
}

function WritingStartScreen({ user, onStart }) {
  return (
    <section className="ote-start-screen ote-writing-start">
      <div className="ote-writing-intro">
        <h1>Writing</h1>
        <p>There are two parts in the Writing module.</p>
        <div className="ote-writing-instruction-list">
          <div>Answer both questions.</div>
          <div>The clock shows how much time you have to answer each question.</div>
          <div>You cannot change your answer after you go to the next question.</div>
        </div>
        {!user ? <p className="ote-warning">Sign in to save this mock to your account later.</p> : null}
        <button className="ote-primary-btn" type="button" onClick={onStart}>
          Start writing mock
        </button>
      </div>
    </section>
  );
}

function WritingCountdown({ secondsLeft }) {
  return (
    <section className="ote-countdown-screen">
      <div>
        <h1>Writing</h1>
        <p>Your Writing module will begin in</p>
        <div className="ote-large-count">{secondsLeft}</div>
      </div>
    </section>
  );
}

function WritingPartTitle({ partNumber }) {
  return (
    <section className="ote-part-card-screen">
      <div>
        <strong>Writing</strong> Part {partNumber}
      </div>
    </section>
  );
}

function TaskOne({ mock, value, words, onChange }) {
  const task = mock.task1;
  return (
    <section className="ote-writing-workspace">
      <div className="ote-writing-task-layout">
        <div className="ote-writing-prompt-pane">
          <p className="ote-writing-lead">{task.intro}</p>
          <p>{task.setup}</p>
          <button className="ote-help-btn" type="button" aria-label="Help">
            <HelpCircle size={24} />
          </button>
          <article className="ote-email-card">
            <p><strong>From:</strong> {task.email.from}</p>
            <p><strong>Subject:</strong> {task.email.subject}</p>
            <hr />
            <p>{task.email.greeting}</p>
            {task.email.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {task.email.prompts.map((prompt) => (
              <div className="ote-email-prompt" key={prompt.question}>
                <p><mark>{prompt.question}</mark></p>
                <em>{prompt.note}</em>
              </div>
            ))}
            {task.email.closing.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </article>
        </div>
        <div className="ote-writing-answer-pane">
          <div className="ote-reply-fields">
            <p><strong>To:</strong> <span>{task.replyTo}</span></p>
            <p><strong>Subject:</strong> <span>{task.replySubject}</span></p>
          </div>
          <WritingTextarea value={value} onChange={onChange} />
          <WordCounter words={words} min={task.minWords} max={task.maxWords} />
        </div>
      </div>
    </section>
  );
}

function TaskTwoChoice({ mock, choice, onChoiceChange }) {
  const options = Object.values(mock.task2.options);
  return (
    <section className="ote-writing-choice-screen">
      <div className="ote-writing-choice-inner">
        <p className="ote-writing-lead">{mock.task2.chooserIntro}</p>
        {mock.task2.chooserCopy.map((line) => (
          <p key={line}>{line}</p>
        ))}
        <button className="ote-help-btn" type="button" aria-label="Help">
          <HelpCircle size={24} />
        </button>
        <div className="ote-writing-choice-grid">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`ote-writing-choice-card ${choice === option.id ? "is-selected" : ""}`}
              onClick={() => onChoiceChange(option.id)}
            >
              <PreviewOption option={option} minWords={mock.task2.minWords} maxWords={mock.task2.maxWords} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function TaskTwoWriting({ mock, choice, value, words, onChange }) {
  const task = mock.task2;
  const option = task.options[choice];
  return (
    <section className="ote-writing-workspace">
      <div className="ote-writing-task-layout">
        <div className="ote-writing-prompt-pane">
          <p className="ote-writing-lead">{option.intro}</p>
          <button className="ote-help-btn" type="button" aria-label="Help">
            <HelpCircle size={24} />
          </button>
          <p>{option.context}</p>
          <p>{option.promptLabel}</p>
          <article className="ote-writing-option-card">
            <PreviewOption option={option} minWords={task.minWords} maxWords={task.maxWords} compact />
          </article>
          <p>{option.instruction}</p>
        </div>
        <div className="ote-writing-answer-pane">
          <WritingTextarea value={value} onChange={onChange} />
          <WordCounter words={words} min={task.minWords} max={task.maxWords} />
        </div>
      </div>
    </section>
  );
}

function PreviewOption({ option, minWords = 100, maxWords = 160, compact = false }) {
  if (option.id === "essay") {
    return (
      <>
        <p className="ote-writing-preview-lead">
          You have 25 minutes to write an essay. Write {minWords}-{maxWords} words.
        </p>
        {!compact ? <p>{option.context}</p> : null}
        <p>{option.promptLabel}</p>
        <div className="ote-writing-title-box">{option.prompt}</div>
        <p>{option.instruction}</p>
      </>
    );
  }

  return (
    <>
      <p className="ote-writing-preview-lead">
        You have 25 minutes to write a {option.noun}. Write {minWords}-{maxWords} words.
      </p>
      {!compact ? <p>{option.context}</p> : null}
      <p>{option.promptLabel}</p>
      <div className="ote-writing-title-box">
        <strong>{option.promptLabel}</strong>
        <p>{option.prompt}</p>
      </div>
      <p>{option.instruction}</p>
    </>
  );
}

function WritingTextarea({ value, onChange }) {
  return (
    <textarea
      value={value}
      spellCheck={false}
      autoCorrect="off"
      autoCapitalize="off"
      autoComplete="off"
      data-gramm="false"
      data-gramm_editor="false"
      placeholder="Write your answer here ..."
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function WordCounter({ words, min, max }) {
  const status = words < min ? "is-low" : words > max ? "is-high" : "is-good";
  return (
    <div className={`ote-word-count ${status}`}>
      {words} words / {min}-{max}
    </div>
  );
}

function WritingFooter({ status, onOpenSettings, onNext }) {
  const nextLabel = status === "task1" ? "Next" : status === "choice" ? "Next" : "Finish mock";
  return (
    <footer className="ote-exam-footer">
      <button className="ote-settings-btn" type="button" onClick={onOpenSettings} aria-label="Visual display options">
        <Settings size={26} />
      </button>
      <button type="button" disabled>
        Jump to
      </button>
      <span>{status === "choice" ? "Choose one question before continuing." : "You cannot return after choosing Next."}</span>
      <button className="ote-footer-next" type="button" onClick={onNext}>
        {nextLabel}
      </button>
    </footer>
  );
}

function VisualOptionsDrawer({ open, settings, onChange, onClose }) {
  if (!open) return null;

  function setFontSize(fontSize) {
    onChange((current) => ({ ...current, fontSize }));
  }

  function setTheme(theme) {
    onChange((current) => ({ ...current, theme: current.theme === theme ? "default" : theme }));
  }

  return (
    <aside className="ote-options-drawer" aria-label="Visual display options">
      <div className="ote-options-header">
        <button type="button" className="ote-options-close" onClick={onClose}>
          Close ×
        </button>
        <h2>Visual display options</h2>
        <p>Choose a display option for your Test.</p>
      </div>

      <section className="ote-options-section">
        <h3>Font size</h3>
        <div className="ote-font-preview" aria-hidden="true">
          <span>Aa</span>
          <span>Aa</span>
          <span>Aa</span>
        </div>
        <div className="ote-segmented" role="group" aria-label="Font size">
          {["medium", "large", "extra-large"].map((size) => (
            <button
              key={size}
              type="button"
              className={settings.fontSize === size ? "is-selected" : ""}
              onClick={() => setFontSize(size)}
            >
              {size === "medium" ? "Medium" : size === "large" ? "Large" : "Extra Large"}
            </button>
          ))}
        </div>
      </section>

      <section className="ote-options-section">
        <h3>Colour themes</h3>
        <ThemeToggle
          label="High Contrast Theme"
          swatch="dark"
          checked={settings.theme === "contrast"}
          onClick={() => setTheme("contrast")}
        />
        <ThemeToggle
          label="Pastel Theme"
          swatch="pastel"
          checked={settings.theme === "pastel"}
          onClick={() => setTheme("pastel")}
        />
      </section>

      <div className="ote-options-confirm">
        <button type="button" onClick={onClose}>
          Confirm
        </button>
      </div>
    </aside>
  );
}

function ThemeToggle({ label, swatch, checked, onClick }) {
  return (
    <button type="button" className="ote-theme-toggle" onClick={onClick} aria-pressed={checked}>
      <span className={`ote-theme-swatch is-${swatch}`} aria-hidden="true" />
      <span>{label}</span>
      <i className={checked ? "is-on" : ""} aria-hidden="true" />
    </button>
  );
}

function WritingComplete({
  mock,
  answers,
  task2Choice,
  wordCounts,
  notice,
  submissionId,
  submissionStatus,
  submissionError,
  submission,
  onPrint,
  onDownloadText,
  onDownloadDocx,
  onBack,
}) {
  const task2 = mock.task2.options[task2Choice];
  return (
    <section className="ote-complete-screen">
      <div className="ote-results-panel ote-writing-results-panel">
        <h1>Writing Mock Complete</h1>
        <p>{notice || "Your answers are locked and ready to review."}</p>
        <div className={`ote-submission-status is-${submissionStatus}`}>
          {submissionStatus === "saving" ? "Saving submission to your profile..." : null}
          {submissionStatus === "saved" ? `Saved to your profile${submissionId ? ` as ${submissionId}` : ""}.` : null}
          {submissionStatus === "error" ? `Could not save automatically: ${submissionError}` : null}
          {submissionStatus === "idle" ? "This attempt can be exported from this page." : null}
        </div>
        <div className="ote-submission-toolbar no-print" aria-label="Submission export tools">
          <button className="ote-secondary-btn" type="button" onClick={onPrint}>
            <Printer size={18} />
            Print / Save PDF
          </button>
          <button className="ote-secondary-btn" type="button" onClick={() => onDownloadDocx(submission)}>
            <FileText size={18} />
            Export .docx
          </button>
          <button className="ote-secondary-btn" type="button" onClick={() => onDownloadText(submission)}>
            <Download size={18} />
            Download .txt
          </button>
        </div>
        <div className="ote-writing-review-grid">
          <article>
            <h2>Task 1</h2>
            <p>{wordCounts.task1} words</p>
            <pre>{answers.task1 || "No answer written."}</pre>
          </article>
          <article>
            <h2>Task 2: {task2.title}</h2>
            <p>{wordCounts[task2Choice]} words</p>
            <pre>{answers[task2Choice] || "No answer written."}</pre>
          </article>
        </div>
        <div className="ote-complete-actions">
          <button className="ote-secondary-btn" type="button" onClick={onBack}>
            Back to OTE home
          </button>
        </div>
      </div>
    </section>
  );
}
