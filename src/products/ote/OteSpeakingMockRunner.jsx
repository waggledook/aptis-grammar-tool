import React, { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HelpCircle, Mic, MinusCircle, PlusCircle, Settings, Volume2 } from "lucide-react";
import { saveOteMockAttempt } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import { toast } from "../../utils/toast.js";
import { getOteSpeakingMock } from "./mockTests/data/oteSpeakingMockData.js";
import "./styles/ote.css";

const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

function formatTime(seconds) {
  const safe = Math.max(0, Math.ceil(seconds || 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function getSupportedMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function buildSteps(mock) {
  const part1 = mock.parts.find((part) => part.id === "part-1");
  const part2 = mock.parts.find((part) => part.id === "part-2");
  const part3 = mock.parts.find((part) => part.id === "part-3");
  const part4 = mock.parts.find((part) => part.id === "part-4");

  return [
    { kind: "module-countdown", id: "module-start", seconds: 6 },
    { kind: "part-card", id: "part-1-card", part: part1, seconds: 2 },
    ...part1.questions.map((question, index) => ({
      kind: "listen-record",
      id: question.id,
      part: part1,
      prompt: question.prompt,
      label: `Question ${index + 1} of ${part1.questions.length}`,
      responseSeconds: question.responseSeconds,
    })),
    { kind: "part-card", id: "part-2-card", part: part2, seconds: 2 },
    ...part2.tasks.map((task, index) => ({
      kind: "prep-record",
      id: task.id,
      part: part2,
      task,
      label: `Voice message ${index + 1} of ${part2.tasks.length}`,
      prepSeconds: task.prepSeconds,
      responseSeconds: task.responseSeconds,
    })),
    { kind: "part-card", id: "part-3-card", part: part3, seconds: 2 },
    {
      kind: "talk-grid",
      id: part3.task.id,
      part: part3,
      task: part3.task,
      label: "Talk",
      prepSeconds: part3.task.prepSeconds,
      responseSeconds: part3.task.responseSeconds,
    },
    { kind: "part-card", id: "part-4-card", part: part4, seconds: 2 },
    ...part4.questions.map((question, index) => ({
      kind: "listen-record",
      id: question.id,
      part: part4,
      topic: part4.topic,
      prompt: question.prompt,
      label: `Question ${index + 1} of ${part4.questions.length}`,
      responseSeconds: question.responseSeconds,
    })),
  ];
}

export default function OteSpeakingMockRunner({ user, onRequireSignIn, nativeRoutes = false }) {
  const { mockId = "speaking-1" } = useParams();
  const navigate = useNavigate();
  const mock = getOteSpeakingMock(mockId);
  const steps = useMemo(() => buildSteps(mock), [mock]);
  const totalRecordingSteps = useMemo(
    () => steps.filter((step) => ["listen-record", "prep-record", "talk-grid"].includes(step.kind)).length,
    [steps]
  );

  const [status, setStatus] = useState("ready");
  const [activeStep, setActiveStep] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [recordings, setRecordings] = useState([]);
  const [micError, setMicError] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [attemptId, setAttemptId] = useState("");

  const runningRef = useRef(false);
  const streamRef = useRef(null);
  const startedAtRef = useRef(null);
  const elapsedTimerRef = useRef(null);
  const selectedImagesRef = useRef([]);

  function updateSelectedImages(next) {
    selectedImagesRef.current = next;
    setSelectedImages(next);
  }

  async function ensureStream() {
    if (streamRef.current) return streamRef.current;
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicError("Microphone recording is not available in this browser.");
      return null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicError("");
      return stream;
    } catch (error) {
      console.warn("[OTE] microphone access failed", error);
      setMicError("Microphone access failed. The timer will continue, but audio will not be captured.");
      return null;
    }
  }

  function stopStream() {
    streamRef.current?.getTracks?.().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  async function runCountdown(seconds, nextPhase) {
    setPhase(nextPhase);
    setSecondsLeft(seconds);
    for (let left = seconds; left > 0; left -= 1) {
      if (!runningRef.current) return false;
      if (
        startedAtRef.current &&
        Date.now() - startedAtRef.current.getTime() >= mock.maxDurationSeconds * 1000
      ) {
        runningRef.current = false;
        return false;
      }
      setSecondsLeft(left);
      await wait(1000);
    }
    setSecondsLeft(0);
    return runningRef.current;
  }

  async function speakPrompt(text) {
    setPhase("listen");
    setSecondsLeft(0);

    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      await wait(Math.min(4200, Math.max(1600, String(text).length * 48)));
      return runningRef.current;
    }

    window.speechSynthesis.cancel();
    return new Promise((resolve) => {
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = "en-GB";
      utterance.rate = 0.92;
      utterance.onend = () => resolve(runningRef.current);
      utterance.onerror = () => resolve(runningRef.current);
      window.speechSynthesis.speak(utterance);
    });
  }

  async function playTone() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.value = 0.08;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      await wait(220);
      osc.stop();
      await ctx.close();
    } catch {
      await wait(220);
    }
  }

  async function recordFor(step, seconds) {
    const stream = await ensureStream();
    const mimeType = getSupportedMimeType();
    const canRecord = stream && typeof MediaRecorder !== "undefined";
    const chunks = [];
    let recorder = null;
    let stopped = Promise.resolve(null);

    if (canRecord) {
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      stopped = new Promise((resolve) => {
        recorder.ondataavailable = (event) => {
          if (event.data?.size) chunks.push(event.data);
        };
        recorder.onstop = () => {
          const finalType = mimeType || chunks[0]?.type || "audio/webm";
          const blob = new Blob(chunks, { type: finalType });
          const url = URL.createObjectURL(blob);
          resolve({
            id: step.id,
            partId: step.part?.id || "",
            partNumber: step.part?.number || null,
            label: step.label || step.task?.title || step.prompt || step.id,
            prompt: step.prompt || step.task?.lead || step.task?.prompt || "",
            selectedImageIds: step.kind === "talk-grid" ? [...selectedImagesRef.current] : [],
            durationSeconds: seconds,
            mimeType: finalType,
            size: blob.size,
            blob,
            url,
            name: `ote-${mock.id}-${step.id}.${finalType.includes("mp4") ? "m4a" : "webm"}`,
          });
        };
      });
      recorder.start();
    }

    const completed = await runCountdown(seconds, "record");
    if (recorder?.state === "recording") recorder.stop();
    const recording = await stopped;
    if (!completed) return null;

    if (!recording) {
      return {
        id: step.id,
        partId: step.part?.id || "",
        partNumber: step.part?.number || null,
        label: step.label || step.id,
        prompt: step.prompt || step.task?.lead || "",
        selectedImageIds: step.kind === "talk-grid" ? [...selectedImagesRef.current] : [],
        durationSeconds: seconds,
        mimeType: "",
        size: 0,
      };
    }
    return recording;
  }

  async function runStep(step) {
    setActiveStep(step);

    if (step.kind === "module-countdown") {
      await runCountdown(step.seconds, "module-countdown");
      return;
    }

    if (step.kind === "part-card") {
      setPhase("part-card");
      setSecondsLeft(0);
      await wait(step.seconds * 1000);
      return;
    }

    if (step.kind === "listen-record") {
      const heard = await speakPrompt(step.prompt);
      if (!heard) return;
      await playTone();
      const recording = await recordFor(step, step.responseSeconds);
      if (recording) setRecordings((prev) => [...prev, recording]);
      return;
    }

    if (step.kind === "prep-record" || step.kind === "talk-grid") {
      setPhase("prep");
      if (step.kind === "talk-grid") updateSelectedImages([]);
      const prepared = await runCountdown(step.prepSeconds, "prep");
      if (!prepared) return;
      if (step.kind === "talk-grid" && selectedImagesRef.current.length < 2) {
        const fallback = step.task.images
          .map((image) => image.id)
          .filter((id) => !selectedImagesRef.current.includes(id))
          .slice(0, 2 - selectedImagesRef.current.length);
        updateSelectedImages([...selectedImagesRef.current, ...fallback]);
      }
      await playTone();
      const recording = await recordFor(step, step.responseSeconds);
      if (recording) setRecordings((prev) => [...prev, recording]);
    }
  }

  async function handleStart() {
    if (!user) {
      onRequireSignIn?.();
      return;
    }
    setStatus("running");
    setRecordings([]);
    setAttemptId("");
    setMicError("");
    runningRef.current = true;
    startedAtRef.current = new Date();
    elapsedTimerRef.current = window.setInterval(() => {
      if (!startedAtRef.current) return;
      setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current.getTime()) / 1000));
    }, 1000);

    await ensureStream();

    for (const step of steps) {
      if (!runningRef.current) break;
      if (
        startedAtRef.current &&
        Date.now() - startedAtRef.current.getTime() >= mock.maxDurationSeconds * 1000
      ) {
        break;
      }
      await runStep(step);
    }

    runningRef.current = false;
    window.clearInterval(elapsedTimerRef.current);
    stopStream();
    setPhase("complete");
    setActiveStep(null);
    setSecondsLeft(0);
    setStatus("complete");
  }

  async function handleSubmit() {
    if (!user) {
      onRequireSignIn?.();
      return;
    }
    try {
      const id = await saveOteMockAttempt({
        mockId: mock.id,
        mockTitle: mock.title,
        module: "speaking",
        status: "submitted",
        elapsedSeconds,
        startedAtClient: startedAtRef.current ? startedAtRef.current.toISOString() : null,
        recordings: recordings.map((recording) => ({
          id: recording.id,
          partId: recording.partId,
          partNumber: recording.partNumber,
          label: recording.label,
          prompt: recording.prompt,
          selectedImageIds: recording.selectedImageIds || [],
          durationSeconds: recording.durationSeconds,
          mimeType: recording.mimeType,
          size: recording.size,
        })),
      });
      setAttemptId(id);
      toast("OTE speaking mock submitted.");
      navigate(getSitePath(nativeRoutes ? `/mock-tests/${mock.id}/results/${id}` : `/ote/mock-tests/${mock.id}/results/${id}`));
    } catch (error) {
      console.error("[OTE] submit failed", error);
      toast("Could not submit this mock. Your local recordings are still available.");
    }
  }

  function toggleImage(imageId) {
    if (status !== "running" || phase !== "prep" || activeStep?.kind !== "talk-grid") return;
    const current = selectedImagesRef.current;
    if (current.includes(imageId)) {
      updateSelectedImages(current.filter((id) => id !== imageId));
      return;
    }
    if (current.length >= 2) return;
    updateSelectedImages([...current, imageId]);
  }

  return (
    <main className="ote-exam">
      <ExamHeader mock={mock} activeStep={activeStep} elapsedSeconds={elapsedSeconds} />

      {status === "ready" ? (
        <StartScreen mock={mock} user={user} onStart={handleStart} />
      ) : status === "complete" ? (
        <CompleteScreen
          recordings={recordings}
          attemptId={attemptId}
          onSubmit={handleSubmit}
          onDashboard={() => navigate("/ote")}
        />
      ) : (
        <ExamBody
          activeStep={activeStep}
          phase={phase}
          secondsLeft={secondsLeft}
          micError={micError}
          selectedImages={selectedImages}
          onToggleImage={toggleImage}
          completedRecordings={recordings.length}
          totalRecordingSteps={totalRecordingSteps}
        />
      )}

      <ExamFooter />
    </main>
  );
}

function ExamHeader({ mock, activeStep, elapsedSeconds }) {
  const part = activeStep?.part;
  const title = part ? (
    <>
      <strong>{mock.moduleLabel}</strong> Part {part.number}
    </>
  ) : (
    <strong>{mock.title}</strong>
  );
  const progress = part ? ((part.number - 1) / 4) * 100 : 0;

  return (
    <header className="ote-exam-header">
      <div className="ote-rosette" aria-hidden="true" />
      <div className="ote-exam-title">{title}</div>
      <div className="ote-progress-rail" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="ote-exam-meta">
        <strong>Oxford Test Of English Demo Test</strong>
        <span>Demo</span>
        <small>{formatTime(elapsedSeconds)}</small>
      </div>
    </header>
  );
}

function StartScreen({ mock, user, onStart }) {
  return (
    <section className="ote-start-screen">
      <div className="ote-logo-wordmark">
        <span className="ote-rosette" aria-hidden="true" />
        <span>Oxford Test of English</span>
      </div>
      <div className="ote-start-panel">
        <p className="ote-kicker">Speaking module</p>
        <h1>{mock.title}</h1>
        <p>
          Your speaking module will run automatically. Once it begins, there are no skip,
          pause, or back controls.
        </p>
        {!user ? <p className="ote-warning">Sign in to save this mock to your account.</p> : null}
        <button className="ote-primary-btn" type="button" onClick={onStart}>
          Start speaking mock
        </button>
      </div>
    </section>
  );
}

function ExamBody({
  activeStep,
  phase,
  secondsLeft,
  micError,
  selectedImages,
  onToggleImage,
  completedRecordings,
  totalRecordingSteps,
}) {
  if (!activeStep) return null;

  if (activeStep.kind === "module-countdown") {
    return (
      <section className="ote-countdown-screen">
        <h1>Speaking</h1>
        <p>Your Speaking module will begin in</p>
        <div className="ote-large-count">{secondsLeft}</div>
      </section>
    );
  }

  if (activeStep.kind === "part-card") {
    return (
      <section className="ote-part-card-screen">
        <div>
          <strong>Speaking</strong> Part {activeStep.part.number}
        </div>
      </section>
    );
  }

  return (
    <section className={`ote-task-screen ${activeStep.kind === "talk-grid" ? "has-image-grid" : ""}`}>
      <div className="ote-task-copy">
        <h2>{activeStep.part.title}</h2>
        <InstructionBlock lines={activeStep.part.instructions} />
        {activeStep.kind === "listen-record" ? (
          <>
            {activeStep.topic ? <p className="ote-topic">Topic: {activeStep.topic}</p> : null}
            <p className="ote-question-text">{phase === "record" ? "Speak now." : "Listen to the question."}</p>
          </>
        ) : null}
        {activeStep.kind === "prep-record" ? <VoicemailPrompt task={activeStep.task} /> : null}
        {activeStep.kind === "talk-grid" ? <TalkPrompt task={activeStep.task} /> : null}
        {micError ? <p className="ote-warning">{micError}</p> : null}
        <button className="ote-help-btn" type="button" aria-label="Help" disabled>
          <HelpCircle size={24} />
        </button>
      </div>

      <StatusPanel phase={phase} secondsLeft={secondsLeft} />

      {activeStep.kind === "talk-grid" ? (
        <ImageGrid task={activeStep.task} selectedImages={selectedImages} onToggleImage={onToggleImage} phase={phase} />
      ) : null}

      <div className="ote-recording-progress">
        Recorded {completedRecordings} of {totalRecordingSteps}
      </div>
    </section>
  );
}

function InstructionBlock({ lines }) {
  return (
    <div className="ote-instructions">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

function VoicemailPrompt({ task }) {
  return (
    <div className="ote-prompt-block">
      <p>{task.lead}</p>
      <ul>
        {task.bullets.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <strong>You now have some time to think about what you want to say.</strong>
    </div>
  );
}

function TalkPrompt({ task }) {
  return (
    <div className="ote-prompt-block">
      <p>{task.prompt}</p>
      <p>Choose exactly two photographs.</p>
      <strong>You now have some time to think about what you want to say.</strong>
    </div>
  );
}

function StatusPanel({ phase, secondsLeft }) {
  const isPrep = phase === "prep";
  const isRecord = phase === "record";
  const isListen = phase === "listen";

  return (
    <aside className="ote-status-panel">
      <div className="ote-status-top">
        <StatusIcon label="Listen" active={isListen} icon={<Volume2 size={72} />} />
        {isPrep ? (
          <div className="ote-think-meter">
            <strong>Think</strong>
            <span className="ote-vertical-meter">
              <i style={{ height: `${Math.max(8, Math.min(100, secondsLeft * 5))}%` }} />
            </span>
            <b>{formatTime(secondsLeft)}</b>
          </div>
        ) : null}
        <StatusIcon label="Speak" active={isRecord} icon={<Mic size={72} />} time={isRecord ? formatTime(secondsLeft) : "00:00"} />
      </div>
      <div className="ote-volume-row">
        <MinusCircle size={28} />
        <span className="ote-bars" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
        <PlusCircle size={28} />
      </div>
    </aside>
  );
}

function StatusIcon({ label, active, icon, time }) {
  return (
    <div className={`ote-status-icon ${active ? "is-active" : ""}`}>
      <strong>{label}</strong>
      <span>{icon}</span>
      {time ? <b>{time}</b> : null}
    </div>
  );
}

function ImageGrid({ task, selectedImages, onToggleImage, phase }) {
  return (
    <div className={`ote-image-grid ${phase !== "prep" ? "is-locked" : ""}`}>
      {task.images.map((image) => {
        const selected = selectedImages.includes(image.id);
        return (
          <button
            key={image.id}
            type="button"
            className={`ote-image-choice ${selected ? "is-selected" : ""}`}
            onClick={() => onToggleImage(image.id)}
            disabled={phase !== "prep"}
          >
            <img src={image.src} alt="" />
            <span>{image.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function CompleteScreen({ recordings, onSubmit, onDashboard }) {
  return (
    <section className="ote-complete-screen">
      <div className="ote-results-panel">
        <p className="ote-kicker">Speaking module complete</p>
        <h1>Submit your mock test</h1>
        <p>
          {recordings.length} timed response{recordings.length === 1 ? "" : "s"} captured.
          Submit now to save the attempt to your account.
        </p>
        <div className="ote-recording-list">
          {recordings.filter((recording) => recording.url).map((recording, index) => (
            <a key={recording.id} href={recording.url} download={recording.name}>
              Download recording {index + 1}
            </a>
          ))}
        </div>
        <div className="ote-complete-actions">
          <button className="ote-secondary-btn" type="button" onClick={onDashboard}>
            OTE dashboard
          </button>
          <button className="ote-primary-btn" type="button" onClick={onSubmit}>
            Submit
          </button>
        </div>
      </div>
    </section>
  );
}

function ExamFooter() {
  return (
    <footer className="ote-exam-footer">
      <Settings size={28} />
      <button type="button" disabled>
        Jump to
      </button>
      <span>© Seif English OTE mock environment</span>
    </footer>
  );
}
