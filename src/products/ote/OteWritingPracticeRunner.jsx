import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, FileText, RotateCcw, Timer } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import {
  logOteTrainingCompleted,
  logOteTrainingStarted,
  requestOteWritingFeedback,
  saveOteWritingSubmission,
  saveWritingAiFeedback,
} from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import {
  getOteWritingPracticeGroup,
  getOteWritingPracticeGroupForSet,
  getOteWritingPracticeSet,
} from "./mockTests/data/oteWritingPracticeData.js";
import { WritingAiFeedback } from "./OteWritingMockRunner.jsx";
import "./styles/ote.css";

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

function getPracticeTaskType(task = {}) {
  if (task.type === "email") return "ote_part1_email";
  if (task.type === "review") return "ote_part2_review";
  if (task.type === "article") return "ote_part2_article";
  return "ote_part2_essay";
}

function getExpectedRegister(task = {}) {
  if (task.type === "email") {
    return task.register === "informal" ? "informal" : "neutral";
  }
  if (task.type === "review") return "review-style";
  if (task.type === "article") return "article-style";
  return "essay-style";
}

function buildPracticeInputText(task = {}) {
  if (task.type !== "email") return task.context || "";
  const email = task.email || {};
  return [
    task.setup,
    "",
    `From: ${email.from || ""}`,
    `Subject: ${email.subject || ""}`,
    email.greeting || "",
    ...(email.paragraphs || []),
    ...(email.prompts || []).map((prompt) => `${prompt.question} [Note: ${prompt.note}]`),
    ...(email.closing || []),
  ].filter(Boolean).join("\n");
}

function buildPracticePrompt(task = {}) {
  if (task.type === "email") {
    return task.setup || "Write an email responding to the input email.";
  }
  return [task.promptLabel, task.prompt, task.instruction].filter(Boolean).join("\n");
}

function buildRequiredPoints(task = {}) {
  if (task.type !== "email") return [];
  return (task.email?.prompts || []).map((prompt) =>
    `${prompt.question} Note: ${prompt.note}`.trim()
  );
}

export default function OteWritingPracticeRunner({ user, onRequireSignIn, nativeRoutes = false }) {
  const { section = "", setId = "email-informal-1" } = useParams();
  const navigate = useNavigate();
  const task = getOteWritingPracticeSet(setId);
  const group = section ? getOteWritingPracticeGroup(section) : getOteWritingPracticeGroupForSet(task.id);
  const [phase, setPhase] = useState("ready");
  const [secondsLeft, setSecondsLeft] = useState(task.timeSeconds);
  const [answer, setAnswer] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState("idle");
  const [feedbackError, setFeedbackError] = useState("");
  const [aiFeedback, setAiFeedback] = useState(null);
  const [submissionId, setSubmissionId] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState("idle");
  const [submissionError, setSubmissionError] = useState("");
  const [finishedAt, setFinishedAt] = useState(null);
  const [finishReason, setFinishReason] = useState("");
  const saveStartedRef = useRef(false);
  const words = useMemo(() => countWords(answer), [answer]);
  const practiceMenuPath = getSitePath(
    nativeRoutes ? `/writing/training/${group.id}/practice` : `/ote/writing/training/${group.id}/practice`
  );

  useEffect(() => {
    setPhase("ready");
    setSecondsLeft(task.timeSeconds);
    setAnswer("");
    setFeedbackStatus("idle");
    setFeedbackError("");
    setAiFeedback(null);
    setSubmissionId("");
    setSubmissionStatus("idle");
    setSubmissionError("");
    setFinishedAt(null);
    setFinishReason("");
    saveStartedRef.current = false;
  }, [task.id, task.timeSeconds]);

  useEffect(() => {
    if (phase !== "writing") return undefined;
    if (secondsLeft <= 0) {
      finishPractice("time");
      return undefined;
    }
    const timer = window.setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, secondsLeft]);

  function startPractice() {
    setAnswer("");
    setSecondsLeft(task.timeSeconds);
    setPhase("writing");
    setFeedbackStatus("idle");
    setFeedbackError("");
    setAiFeedback(null);
    setSubmissionId("");
    setSubmissionStatus("idle");
    setSubmissionError("");
    setFinishedAt(null);
    setFinishReason("");
    saveStartedRef.current = false;
    logOteTrainingStarted({
      section: "writing",
      part: task.type === "email" ? "part-1" : "part-2",
      mode: "timed_practice",
      taskId: task.id,
      taskTitle: task.title,
      taskType: task.type,
      sectionId: group.id,
    });
  }

  function resetPractice() {
    setAnswer("");
    setSecondsLeft(task.timeSeconds);
    setPhase("ready");
    setFeedbackStatus("idle");
    setFeedbackError("");
    setAiFeedback(null);
    setSubmissionId("");
    setSubmissionStatus("idle");
    setSubmissionError("");
    setFinishedAt(null);
    setFinishReason("");
    saveStartedRef.current = false;
  }

  function finishPractice(reason = "manual") {
    setFinishedAt(new Date().toISOString());
    setFinishReason(reason);
    setPhase("complete");
    logOteTrainingCompleted({
      section: "writing",
      part: task.type === "email" ? "part-1" : "part-2",
      mode: "timed_practice",
      taskId: task.id,
      taskTitle: task.title,
      taskType: task.type,
      sectionId: group.id,
      wordCount: words,
      reason,
    });
  }

  function buildSubmissionPayload() {
    const answerText = answer.trim();
    const countKey = task.type === "email" ? "task1" : task.type;
    return {
      product: "ote",
      type: "ote-writing-practice",
      mockId: "",
      mockTitle: task.title,
      moduleLabel: "Writing Practice",
      practiceTaskId: task.id,
      practiceSection: group.id,
      practiceSectionLabel: group.label,
      practiceTaskType: task.type,
      practiceTaskLabel: task.typeLabel,
      task2Choice: task.type === "email" ? "" : task.type,
      answers: {
        task: answerText,
        [countKey]: answerText,
      },
      counts: {
        task: words,
        [countKey]: words,
      },
      tasks: {
        practice: {
          title: task.title,
          type: task.type,
          typeLabel: task.typeLabel,
          minWords: task.minWords,
          maxWords: task.maxWords,
          timeSeconds: task.timeSeconds,
          setup: task.setup || "",
          replyTo: task.replyTo || "",
          replySubject: task.replySubject || "",
          email: task.email || null,
          context: task.context || "",
          promptLabel: task.promptLabel || "",
          prompt: task.prompt || "",
          instruction: task.instruction || "",
          theme: task.theme || "",
          register: task.register || "",
          registerLabel: task.registerLabel || "",
        },
      },
      timings: {
        taskSeconds: task.timeSeconds,
        secondsRemaining: secondsLeft,
      },
      finishedAt: finishedAt || new Date().toISOString(),
      reason: finishReason || "manual",
    };
  }

  async function handleGenerateFeedback() {
    if (!user) {
      onRequireSignIn?.();
      return;
    }
    if (!submissionId) {
      setFeedbackStatus("error");
      setFeedbackError(
        submissionStatus === "saving"
          ? "Wait for the practice attempt to finish saving, then generate feedback."
          : "This practice attempt needs to be saved before feedback can be added to your profile."
      );
      return;
    }
    const answerText = answer.trim();
    if (!answerText) {
      setFeedbackStatus("error");
      setFeedbackError("Write an answer before requesting feedback.");
      return;
    }

    setFeedbackStatus("loading");
    setFeedbackError("");
    setAiFeedback(null);

    try {
      const taskType = getPracticeTaskType(task);
      const result = await requestOteWritingFeedback({
        exam: "OTE",
        mode: "single_task",
        tasks: [
          {
            taskId: `training:${task.id}`,
            taskType,
            title: task.title,
            inputText: buildPracticeInputText(task),
            prompt: buildPracticePrompt(task),
            requiredPoints: buildRequiredPoints(task),
            targetAudience: task.type === "email" ? task.replyTo || task.email?.from || "recipient" : "English teacher",
            expectedRegister: getExpectedRegister(task),
            answer: {
              text: answerText,
              wordCount: words,
            },
          },
        ],
      });
      setAiFeedback(result?.feedback || null);
      if (result?.feedback && submissionId) {
        try {
          await saveWritingAiFeedback({
            kind: "ote",
            submissionId,
            feedback: result.feedback,
            meta: result?.meta || null,
          });
        } catch (saveError) {
          console.warn("[OTE writing practice] feedback save failed", saveError);
          setFeedbackError("Feedback generated, but it could not be saved to your profile.");
        }
      }
      setFeedbackStatus("ready");
    } catch (error) {
      console.warn("[OTE writing practice] feedback failed", {
        code: error?.code,
        message: error?.message,
        details: error?.details,
        customData: error?.customData,
        submissionId,
        mode: "single_task",
        taskType: getPracticeTaskType(task),
        wordCount: words,
        taskId: task?.id,
      });
      setFeedbackStatus("error");
      setFeedbackError(error?.message || "Could not generate feedback.");
    }
  }

  useEffect(() => {
    if (phase !== "complete" || !user || saveStartedRef.current) return;
    saveStartedRef.current = true;
    setSubmissionStatus("saving");
    setSubmissionError("");
    saveOteWritingSubmission(buildSubmissionPayload())
      .then((id) => {
        setSubmissionId(id || "");
        setSubmissionStatus(id ? "saved" : "idle");
      })
      .catch((error) => {
        console.warn("[OTE writing practice] save failed", error);
        setSubmissionStatus("error");
        setSubmissionError(error?.message || "Could not save this practice attempt.");
      });
  }, [phase, user]);

  return (
    <main className="ote-training-page">
      <Seo title={`${task.title} | Seif English`} description="Timed OTE writing practice task." />

      <button className="ote-training-back" type="button" onClick={() => navigate(practiceMenuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to practice sets
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">{task.registerLabel ? `${task.registerLabel} ${group.label} practice` : `${group.label} practice`}</p>
        <h1>{task.title}</h1>
        <p>Complete one timed writing task. Signed-in attempts are saved to your profile.</p>
      </header>

      {phase === "writing" ? (
        <div className="ote-writing-floating-timer" aria-hidden="true">
          <Timer size={20} />
          <strong>{formatTime(secondsLeft)}</strong>
          <span>Writing</span>
        </div>
      ) : null}

      <section className="ote-practice-runner">
        {phase !== "complete" ? (
          <article className="ote-practice-task-card ote-writing-practice-task-card">
            <div className="ote-recorder-top">
              <div>
                <p className="ote-kicker">{task.typeLabel}</p>
                <h2>{phase === "ready" ? "Ready to start" : "Timed writing task"}</h2>
              </div>
              <div className={`ote-recorder-timer is-${phase}`} aria-live="polite">
                <Timer size={22} aria-hidden="true" />
                <strong>{formatTime(secondsLeft)}</strong>
                <span>{phase === "writing" ? "Writing" : "Ready"}</span>
              </div>
            </div>

            <div className="ote-practice-instructions">
              <p className="ote-kicker">Instructions</p>
              <ul>
                <li>The clock shows how much time you have for this practice task.</li>
                <li>Read the prompt carefully and write one complete answer.</li>
                <li>Check your word count before you finish.</li>
              </ul>
            </div>

            <div className="ote-writing-practice-layout">
              <div className="ote-writing-practice-prompt">
                {task.type === "email" ? <EmailPrompt task={task} /> : <ExtendedPrompt task={task} />}
              </div>

              <div className="ote-writing-practice-answer">
                {task.type === "email" ? (
                  <div className="ote-reply-fields">
                    <p><strong>To:</strong> <span>{task.replyTo}</span></p>
                    <p><strong>Subject:</strong> <span>{task.replySubject}</span></p>
                  </div>
                ) : null}
                <textarea
                  value={answer}
                  disabled={phase !== "writing"}
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="off"
                  autoComplete="off"
                  data-gramm="false"
                  data-gramm_editor="false"
                  placeholder={phase === "writing" ? "Write your answer here ..." : "Start the timer when you are ready ..."}
                  onChange={(event) => setAnswer(event.target.value)}
                />
                <div className={`ote-word-count ${words < task.minWords ? "is-low" : words > task.maxWords ? "is-high" : "is-good"}`}>
                  {words} words / {task.minWords}-{task.maxWords}
                </div>
              </div>
            </div>

            <div className="ote-recorder-actions">
              {phase === "ready" ? (
                <button type="button" onClick={startPractice}>
                  <Timer size={18} aria-hidden="true" />
                  Start timed practice
                </button>
              ) : (
                <button type="button" onClick={() => finishPractice("manual")}>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  Finish practice
                </button>
              )}
              <button type="button" onClick={resetPractice}>
                <RotateCcw size={18} aria-hidden="true" />
                Reset
              </button>
            </div>
          </article>
        ) : (
          <section className="ote-practice-complete">
            <p className="ote-kicker">Practice complete</p>
            <h2>{task.title}</h2>
            <p>{words} words written. Review your answer below, then try again or choose another set.</p>
            <div className={`ote-submission-status is-${submissionStatus}`}>
              {!user ? "Sign in to save this practice attempt to your profile." : null}
              {submissionStatus === "saving" ? "Saving practice attempt to your profile..." : null}
              {submissionStatus === "saved" ? "Saved to your profile." : null}
              {submissionStatus === "error" ? `Could not save automatically: ${submissionError}` : null}
            </div>
            <div className="ote-writing-practice-review">
              <article>
                <h3>{task.typeLabel} task</h3>
                <p>{task.type === "email" ? task.setup : task.prompt}</p>
              </article>
              <article>
                <h3>Your answer</h3>
                <pre>{answer || "No answer written."}</pre>
              </article>
            </div>
            <div className="ote-recorder-actions">
              <button
                type="button"
                disabled={feedbackStatus === "loading" || submissionStatus === "saving"}
                onClick={handleGenerateFeedback}
              >
                <FileText size={18} aria-hidden="true" />
                {feedbackStatus === "loading" ? "Getting feedback..." : "Get feedback"}
              </button>
              <button type="button" onClick={startPractice}>
                <RotateCcw size={18} aria-hidden="true" />
                Try again
              </button>
              <button type="button" onClick={() => navigate(practiceMenuPath)}>
                Back to practice sets
              </button>
            </div>
            <WritingAiFeedback feedback={aiFeedback} status={feedbackStatus} error={feedbackError} />
          </section>
        )}
      </section>
    </main>
  );
}

function EmailPrompt({ task }) {
  return (
    <>
      <p className="ote-writing-lead">{task.intro}</p>
      <p>{task.setup}</p>
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
            <p><HighlightedPrompt text={prompt.question} highlight={prompt.highlight} /></p>
            <em>{prompt.note}</em>
          </div>
        ))}
        {task.email.closing.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </article>
    </>
  );
}

function HighlightedPrompt({ text, highlight }) {
  const source = String(text || "");
  const target = String(highlight || "");
  const start = target ? source.indexOf(target) : -1;

  if (start < 0) return source;

  return (
    <>
      {source.slice(0, start)}
      <mark>{target}</mark>
      {source.slice(start + target.length)}
    </>
  );
}

function ExtendedPrompt({ task }) {
  return (
    <>
      <p className="ote-writing-lead">{task.intro}</p>
      <p>{task.context}</p>
      <p>{task.promptLabel}</p>
      <article className="ote-writing-option-card">
        <p className="ote-writing-preview-lead">
          You have {Math.round(task.timeSeconds / 60)} minutes to write a {task.noun}. Write {task.minWords}-{task.maxWords} words.
        </p>
        <div className="ote-writing-title-box">
          <strong>{task.promptLabel}</strong>
          <p>{task.prompt}</p>
        </div>
        <p>{task.instruction}</p>
      </article>
    </>
  );
}
