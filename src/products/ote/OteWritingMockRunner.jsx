import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Download, FileText, HelpCircle, Printer, Settings } from "lucide-react";
import {
  requestOteWritingFeedback,
  saveOteWritingSubmission,
  saveWritingAiFeedback,
} from "../../firebase.js";
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

function getOteTask2Type(option = {}) {
  const typeText = `${option.id || ""} ${option.noun || ""} ${option.title || ""}`.toLowerCase();
  if (typeText.includes("review")) return "ote_part2_review";
  if (typeText.includes("article")) return "ote_part2_article";
  return "ote_part2_essay";
}

function isNeutralOteEmailTask(email = {}) {
  const greeting = String(email.greeting || "").toLowerCase();
  const from = String(email.from || "").toLowerCase();
  return greeting.includes("dear") || from.includes("mrs") || from.includes("coordinator");
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
  const [feedbackStatus, setFeedbackStatus] = useState("idle");
  const [feedbackError, setFeedbackError] = useState("");
  const [aiFeedback, setAiFeedback] = useState(null);
  const [feedbackMeta, setFeedbackMeta] = useState(null);
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
    setFeedbackStatus("idle");
    setFeedbackError("");
    setAiFeedback(null);
    setFeedbackMeta(null);
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

  async function handleGenerateFeedback(submission) {
    if (!user) {
      onRequireSignIn?.();
      return;
    }
    if (!submissionId) {
      setFeedbackStatus("error");
      setFeedbackError("Wait for the submission to finish saving, then generate feedback.");
      return;
    }
    setFeedbackStatus("loading");
    setFeedbackError("");
    setAiFeedback(null);
    setFeedbackMeta(null);

    try {
      const selectedTask = submission.tasks?.task2?.selectedOption || {};
      const selectedAnswer = (submission.answers?.[submission.task2Choice] || "").trim();
      const task1 = submission.tasks?.task1 || {};
      const task1Email = task1.email || {};
      const task1InputText = [
        task1.setup,
        "",
        `From: ${task1Email.from || ""}`,
        `Subject: ${task1Email.subject || ""}`,
        task1Email.greeting || "",
        ...(task1Email.paragraphs || []),
        ...(task1Email.prompts || []).map((prompt) => `${prompt.question} [Note: ${prompt.note}]`),
        ...(task1Email.closing || []),
      ].filter(Boolean).join("\n");

      const task2Type = getOteTask2Type(selectedTask);

      const result = await requestOteWritingFeedback({
        exam: "OTE",
        mode: "full_mock",
        tasks: [
          {
            taskId: `${submission.mockId || "mock"}:task1`,
            taskType: "ote_part1_email",
            title: task1.title || "Email",
            inputText: task1InputText,
            prompt: task1.setup || "Write an email responding to the input email.",
            requiredPoints: (task1Email.prompts || []).map((prompt) =>
              `${prompt.question} Note: ${prompt.note}`.trim()
            ),
            targetAudience: task1.replyTo || task1Email.from || "recipient",
            expectedRegister: isNeutralOteEmailTask(task1Email) ? "neutral" : "informal",
            answer: {
              text: (submission.answers?.task1 || "").trim(),
              wordCount: submission.counts?.task1 || countWords(submission.answers?.task1),
            },
          },
          {
            taskId: `${submission.mockId || "mock"}:task2:${selectedTask.id || submission.task2Choice}`,
            taskType: task2Type,
            title: selectedTask.title || "Part 2",
            inputText: selectedTask.context || "",
            prompt: [selectedTask.promptLabel, selectedTask.prompt, selectedTask.instruction]
              .filter(Boolean)
              .join("\n"),
            requiredPoints: [],
            targetAudience: "English teacher",
            expectedRegister:
              task2Type === "ote_part2_essay"
                ? "essay-style"
                : task2Type === "ote_part2_review"
                  ? "review-style"
                  : "article-style",
            answer: {
              text: selectedAnswer,
              wordCount: submission.counts?.[submission.task2Choice] || countWords(selectedAnswer),
            },
          },
        ],
      });

      setAiFeedback(result?.feedback || null);
      setFeedbackMeta(result?.meta || null);
      if (result?.feedback) {
        try {
          await saveWritingAiFeedback({
            kind: "ote",
            submissionId,
            feedback: result.feedback,
            meta: result?.meta || null,
          });
        } catch (saveError) {
          console.warn("[OTE writing] feedback save failed", saveError);
          setFeedbackError("Feedback generated, but it could not be saved to your profile.");
        }
      }
      setFeedbackStatus("ready");
    } catch (error) {
      console.warn("[OTE writing] feedback failed", error);
      setFeedbackStatus("error");
      setFeedbackError(error?.message || "Could not generate feedback.");
    }
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
          submission={{
            ...buildSubmissionPayload(),
            aiFeedback,
            aiFeedbackMeta: feedbackMeta,
          }}
          aiFeedback={aiFeedback}
          feedbackMeta={feedbackMeta}
          feedbackStatus={feedbackStatus}
          feedbackError={feedbackError}
          onGenerateFeedback={handleGenerateFeedback}
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
  aiFeedback,
  feedbackMeta,
  feedbackStatus,
  feedbackError,
  onGenerateFeedback,
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
          {submissionStatus === "saved" ? "Saved to your profile." : null}
          {submissionStatus === "error" ? `Could not save automatically: ${submissionError}` : null}
          {submissionStatus === "idle" ? "This attempt can be exported from this page." : null}
        </div>
        <div className="ote-submission-toolbar no-print" aria-label="Submission export tools">
          <button
            className="ote-secondary-btn"
            type="button"
            disabled={feedbackStatus === "loading"}
            onClick={() => onGenerateFeedback(submission)}
          >
            <FileText size={18} />
            {feedbackStatus === "loading" ? "Getting feedback..." : "Get feedback"}
          </button>
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
        <WritingAiFeedback
          feedback={aiFeedback}
          status={feedbackStatus}
          error={feedbackError}
        />
        <div className="ote-complete-actions">
          <button className="ote-secondary-btn" type="button" onClick={onBack}>
            Back to OTE home
          </button>
        </div>
      </div>
    </section>
  );
}

function WritingAiFeedback({ feedback, status, error }) {
  if (status === "idle") {
    return (
      <section className="ote-ai-feedback-panel">
        <h2>Feedback</h2>
        <p>Get a feedback report for the writing above.</p>
      </section>
    );
  }

  if (status === "loading") {
    return (
      <section className="ote-ai-feedback-panel" aria-live="polite">
        <h2>Feedback</h2>
        <p>Checking the writing against the task...</p>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="ote-ai-feedback-panel is-error" role="alert">
        <h2>Feedback</h2>
        <p>{error || "Could not generate feedback."}</p>
      </section>
    );
  }

  if (!feedback) return null;

  return (
    <section className="ote-ai-feedback-panel">
      <div className="ote-ai-feedback-heading">
        <div>
          <h2>Feedback</h2>
          <p className="ote-ai-feedback-auto-note">Generated automatically to help you improve your writing.</p>
          <p>{feedback.overall?.summary}</p>
        </div>
        <strong>{feedback.estimatedWritingLevel?.label}</strong>
      </div>

      <div className="ote-ai-feedback-overview">
        <article>
          <h3>Main strengths</h3>
          <ul>{(feedback.overall?.mainStrengths || []).map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <article>
          <h3>Main priorities</h3>
          <ul>{(feedback.overall?.mainPriorities || []).map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
      </div>

      <div className="ote-ai-feedback-task-list">
        {(feedback.tasks || []).map((task, index) => (
          <article className="ote-ai-feedback-task" key={`${task.taskId}-${index}`}>
            <div className="ote-ai-feedback-task-head">
              <h3>{index === 0 ? "Part 1 Email" : getOteTaskLabel(task.taskType)}</h3>
              <span>{task.wordCount} words · {task.wordCountStatus?.replace(/_/g, " ")}</span>
            </div>
            <p className="ote-ai-feedback-word-count">{task.wordCountFeedback}</p>
            <p><strong>Task fulfilment:</strong> {task.taskFulfilment?.feedback}</p>
            {task.taskFulfilment?.requiredPoints?.length ? (
              <ul className="ote-ai-feedback-points">
                {task.taskFulfilment.requiredPoints.map((point) => (
                  <li key={point.point}>
                    <strong>{point.status?.replace(/_/g, " ")}:</strong> {point.point}
                    {point.feedback ? <em>{point.feedback}</em> : null}
                  </li>
                ))}
              </ul>
            ) : null}
            <p><strong>Content:</strong> {task.taskFulfilment?.contentSpecificity?.feedback}</p>
            {task.mistakes?.length ? (
              <div className="ote-ai-feedback-mistakes">
                <h4>Mistakes to fix</h4>
                <ul>
                  {task.mistakes.map((mistake) => (
                    <li key={`${mistake.category}-${mistake.original}-${mistake.correction}`}>
                      <small>{mistake.category}</small>
                      <p><span>{mistake.original}</span> → <strong>{mistake.correction}</strong></p>
                      <em>{mistake.explanation}</em>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p><strong>Format/register:</strong> {task.formatAndRegister?.feedback}</p>
            <OteExampleList examples={task.formatAndRegister?.examples} type="suggestion" />
            <p><strong>Organization:</strong> {task.organization?.feedback}</p>
            <p><strong>Grammar:</strong> {task.grammar?.feedback}</p>
            <OteExampleList examples={task.grammar?.examples} type="correction" />
            <p><strong>Lexis:</strong> {task.lexis?.feedback}</p>
            <OteExampleList examples={task.lexis?.examples} type="suggestion" />
            <div className="ote-ai-feedback-improved">
              <strong>Improved version</strong>
              <pre>{task.improvedVersion}</pre>
            </div>
            <blockquote>{task.teacherNote}</blockquote>
          </article>
        ))}
      </div>

      {feedback.estimatedWritingLevel?.note ? <p className="ote-ai-feedback-note">{feedback.estimatedWritingLevel.note}</p> : null}
    </section>
  );
}

function getOteTaskLabel(taskType) {
  if (taskType === "ote_part2_article") return "Part 2 Article";
  if (taskType === "ote_part2_review") return "Part 2 Review";
  return "Part 2 Essay";
}

function OteExampleList({ examples = [], type }) {
  if (!examples.length) return null;
  return (
    <ul className="ote-ai-feedback-examples">
      {examples.slice(0, 2).map((example) => (
        <li key={`${example.original}-${example[type]}`}>
          <span>{example.original}</span> → <strong>{example[type]}</strong>
          {example.explanation ? <em>{example.explanation}</em> : null}
        </li>
      ))}
    </ul>
  );
}
