import React, { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Download, HelpCircle, Mic, MinusCircle, Play, PlusCircle, Settings, Volume2 } from "lucide-react";
import { getOteSpeakingMock } from "./mockTests/data/oteSpeakingMockData.js";
import SpeakingFeedbackPanel from "../../components/speaking/SpeakingFeedbackPanel.jsx";
import {
  logOteMockCompleted,
  logOteMockStarted,
  requestOteSpeakingFeedback,
  saveOteMockAttempt,
} from "../../firebase.js";
import { recordingsToFeedbackAudio } from "./utils/speakingFeedback.js";
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

function buildRecordingPrompt(step) {
  if (step.prompt) return step.prompt;
  if (!step.task) return "";
  const bullets = Array.isArray(step.task.bullets) && step.task.bullets.length
    ? ` In your message, you should: ${step.task.bullets.join("; ")}.`
    : "";
  return `${step.task.lead || step.task.prompt || ""}${bullets}`.trim();
}

function stripRecordingForStorage(recording) {
  if (!recording) return null;
  const { blob, url, ...rest } = recording;
  return {
    ...rest,
    audioStored: false,
  };
}

function buildSteps(mock) {
  const part1 = mock.parts.find((part) => part.id === "part-1");
  const part2 = mock.parts.find((part) => part.id === "part-2");
  const part3 = mock.parts.find((part) => part.id === "part-3");
  const part4 = mock.parts.find((part) => part.id === "part-4");
  const part5 = mock.parts.find((part) => part.id === "part-5");

  const steps = [
    { kind: "module-countdown", id: "module-start", seconds: 10 },
  ];

  if (part1) {
    steps.push(
      { kind: "part-card", id: "part-1-card", part: part1, seconds: 2 },
      ...(part1.instructionAudioSrc
        ? [{ kind: "part-instructions", id: "part-1-instructions", part: part1, audioSrc: part1.instructionAudioSrc }]
        : []),
      ...part1.questions.map((question, index) => ({
        kind: "listen-record",
        id: question.id,
        part: part1,
        progressIndex: index + 1,
        progressTotal: part1.questions.length,
        prompt: question.prompt,
        audioSrc: question.audioSrc,
        label: `Question ${index + 1} of ${part1.questions.length}`,
        responseSeconds: question.responseSeconds,
      }))
    );
  }

  if (part2) {
    steps.push(
      { kind: "part-card", id: "part-2-card", part: part2, seconds: 2 },
      ...(part2.instructionAudioSrc
        ? [{
            kind: "part-instructions",
            id: "part-2-instructions",
            part: part2,
            audioSrc: part2.instructionAudioSrc,
            task: part2.showTaskDuringInstructions ? part2.tasks[0] : null,
          }]
        : []),
      ...part2.tasks.map((task, index) => ({
        kind: "prep-record",
        id: task.id,
        part: part2,
        progressIndex: index + 1,
        progressTotal: part2.tasks.length,
        task,
        label: task.title || `Voice message ${index + 1} of ${part2.tasks.length}`,
        prepSeconds: task.prepSeconds,
        responseSeconds: task.responseSeconds,
      }))
    );
  }

  if (part3?.task) {
    steps.push(
      { kind: "part-card", id: "part-3-card", part: part3, seconds: 2 },
      ...(part3.instructionAudioSrc
        ? [{
            kind: "part-instructions",
            id: "part-3-instructions",
            part: part3,
            audioSrc: part3.instructionAudioSrc,
            task: part3.task.visualType === "summary" ? part3.task : null,
          }]
        : []),
      {
        kind: part3.task.visualType === "summary" ? "summary-task" : "talk-grid",
        id: part3.task.id,
        part: part3,
        progressIndex: 1,
        progressTotal: 1,
        task: part3.task,
        label: part3.task.title || "Task",
        prepSeconds: part3.task.prepSeconds,
        responseSeconds: part3.task.responseSeconds,
      }
    );
  }

  if (part4?.task) {
    steps.push(
      { kind: "part-card", id: "part-4-card", part: part4, seconds: 2 },
      ...(part4.instructionAudioSrc
        ? [{ kind: "part-instructions", id: "part-4-instructions", part: part4, audioSrc: part4.instructionAudioSrc }]
        : []),
      {
        kind: part4.task.visualType === "debate" ? "debate-task" : "prep-record",
        id: part4.task.id,
        part: part4,
        progressIndex: 1,
        progressTotal: 1,
        task: part4.task,
        label: part4.task.title || "Task",
        prepSeconds: part4.task.prepSeconds,
        responseSeconds: part4.task.responseSeconds,
      }
    );
  } else if (part4?.questions?.length) {
    steps.push(
      { kind: "part-card", id: "part-4-card", part: part4, seconds: 2 },
      ...(part4.instructionAudioSrc
        ? [{ kind: "part-instructions", id: "part-4-instructions", part: part4, audioSrc: part4.instructionAudioSrc }]
        : []),
      ...part4.questions.map((question, index) => ({
        kind: "listen-record",
        id: question.id,
        part: part4,
        progressIndex: index + 1,
        progressTotal: part4.questions.length,
        topic: part4.topic,
        prompt: question.prompt,
        audioSrc: question.audioSrc,
        label: `Question ${index + 1} of ${part4.questions.length}`,
        responseSeconds: question.responseSeconds,
      }))
    );
  }

  if (part5?.questions?.length) {
    steps.push(
      { kind: "part-card", id: "part-5-card", part: part5, seconds: 2 },
      ...(part5.instructionAudioSrc
        ? [{ kind: "part-instructions", id: "part-5-instructions", part: part5, audioSrc: part5.instructionAudioSrc }]
        : []),
      ...part5.questions.map((question, index) => ({
        kind: "listen-record",
        id: question.id,
        part: part5,
        progressIndex: index + 1,
        progressTotal: part5.questions.length,
        prompt: question.prompt,
        audioSrc: question.audioSrc,
        label: `Question ${index + 1} of ${part5.questions.length}`,
        responseSeconds: question.responseSeconds,
      }))
    );
  }

  return steps;
}

export default function OteSpeakingMockRunner({ user, onRequireSignIn, nativeRoutes = false }) {
  const { mockId = "speaking-1" } = useParams();
  const navigate = useNavigate();
  const mock = getOteSpeakingMock(mockId);
  const steps = useMemo(() => buildSteps(mock), [mock]);
  const totalRecordingSteps = useMemo(
    () => steps.filter((step) => ["listen-record", "prep-record", "talk-grid", "summary-task", "debate-task"].includes(step.kind)).length,
    [steps]
  );

  const [status, setStatus] = useState("ready");
  const [activeStep, setActiveStep] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [recordings, setRecordings] = useState([]);
  const [micError, setMicError] = useState("");
  const [volume, setVolume] = useState(0.8);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundCheckState, setSoundCheckState] = useState("idle");
  const [soundCheckSecondsLeft, setSoundCheckSecondsLeft] = useState(10);
  const [soundCheckUrl, setSoundCheckUrl] = useState("");
  const [visualSettings, setVisualSettings] = useState({
    fontSize: "medium",
    theme: "default",
  });
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");

  const runningRef = useRef(false);
  const streamRef = useRef(null);
  const startedAtRef = useRef(null);
  const elapsedTimerRef = useRef(null);
  const volumeRef = useRef(volume);
  const soundCheckUrlRef = useRef("");
  const skipRequestedRef = useRef(false);
  const skipResolverRef = useRef(null);
  const currentAudioRef = useRef(null);

  function updateVolume(nextValue) {
    const next = Math.max(0.2, Math.min(1, Number(nextValue)));
    volumeRef.current = next;
    if (currentAudioRef.current) currentAudioRef.current.volume = next;
    setVolume(next);
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

  function waitSkippable(ms) {
    if (skipRequestedRef.current) return Promise.resolve(false);
    return new Promise((resolve) => {
      const timeoutId = window.setTimeout(() => {
        skipResolverRef.current = null;
        resolve(true);
      }, ms);
      skipResolverRef.current = () => {
        window.clearTimeout(timeoutId);
        skipResolverRef.current = null;
        resolve(false);
      };
    });
  }

  function consumeSkipRequest() {
    if (!skipRequestedRef.current) return false;
    skipRequestedRef.current = false;
    setSecondsLeft(0);
    return true;
  }

  async function runCountdown(seconds, nextPhase) {
    setPhase(nextPhase);
    setSecondsLeft(seconds);
    for (let left = seconds; left > 0; left -= 1) {
      if (consumeSkipRequest()) return runningRef.current;
      if (!runningRef.current) return false;
      if (
        startedAtRef.current &&
        Date.now() - startedAtRef.current.getTime() >= mock.maxDurationSeconds * 1000
      ) {
        runningRef.current = false;
        return false;
      }
      setSecondsLeft(left);
      const waited = await waitSkippable(1000);
      if (!waited && consumeSkipRequest()) return runningRef.current;
    }
    setSecondsLeft(0);
    return runningRef.current;
  }

  async function speakPrompt(text) {
    setPhase("listen");
    setSecondsLeft(0);
    if (consumeSkipRequest()) return runningRef.current;

    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      await waitSkippable(Math.min(4200, Math.max(1600, String(text).length * 48)));
      return runningRef.current;
    }

    window.speechSynthesis.cancel();
    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        skipResolverRef.current = null;
        resolve(runningRef.current);
      };
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = "en-GB";
      utterance.rate = 0.92;
      utterance.volume = volumeRef.current;
      utterance.onend = finish;
      utterance.onerror = finish;
      skipResolverRef.current = () => {
        window.speechSynthesis.cancel();
        finish();
      };
      window.speechSynthesis.speak(utterance);
    });
  }

  async function playAudioFile(src) {
    if (!src) return runningRef.current;
    setPhase("listen");
    setSecondsLeft(0);
    if (consumeSkipRequest()) return runningRef.current;

    return new Promise((resolve) => {
      const audio = new Audio(src);
      let settled = false;

      const finish = () => {
        if (settled) return;
        settled = true;
        audio.pause();
        currentAudioRef.current = null;
        skipResolverRef.current = null;
        resolve(runningRef.current);
      };

      currentAudioRef.current = audio;
      audio.volume = volumeRef.current;
      audio.onended = finish;
      audio.onerror = finish;
      skipResolverRef.current = finish;
      audio.play().catch(finish);
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
      gain.gain.value = 0.08 * volumeRef.current;
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

  async function recordSoundCheck() {
    if (soundCheckState === "recording") return;
    if (soundCheckUrlRef.current) URL.revokeObjectURL(soundCheckUrlRef.current);
    soundCheckUrlRef.current = "";
    setSoundCheckUrl("");
    setSoundCheckState("recording");
    setSoundCheckSecondsLeft(10);

    const stream = await ensureStream();
    const mimeType = getSupportedMimeType();
    const canRecord = stream && typeof MediaRecorder !== "undefined";

    if (!canRecord) {
      setSoundCheckState("idle");
      setMicError("Microphone recording is not available in this browser.");
      return;
    }

    const chunks = [];
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const stopped = new Promise((resolve) => {
      recorder.ondataavailable = (event) => {
        if (event.data?.size) chunks.push(event.data);
      };
      recorder.onstop = () => {
        const finalType = mimeType || chunks[0]?.type || "audio/webm";
        const blob = new Blob(chunks, { type: finalType });
        const url = URL.createObjectURL(blob);
        soundCheckUrlRef.current = url;
        setSoundCheckUrl(url);
        resolve();
      };
    });

    recorder.start();
    for (let left = 10; left > 0; left -= 1) {
      setSoundCheckSecondsLeft(left);
      await wait(1000);
    }
    setSoundCheckSecondsLeft(0);
    if (recorder.state === "recording") recorder.stop();
    await stopped;
    setSoundCheckState("ready");
  }

  function playSoundCheck() {
    if (!soundCheckUrl) return;
    const audio = new Audio(soundCheckUrl);
    audio.volume = volumeRef.current;
    setSoundCheckState("playing");
    audio.onended = () => setSoundCheckState("ready");
    audio.onerror = () => setSoundCheckState("ready");
    audio.play().catch(() => setSoundCheckState("ready"));
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
            prompt: buildRecordingPrompt(step),
            selectedImageIds: [],
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
        prompt: buildRecordingPrompt(step),
        selectedImageIds: [],
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
      await waitSkippable(step.seconds * 1000);
      consumeSkipRequest();
      return;
    }

    if (step.kind === "part-instructions") {
      await playAudioFile(step.audioSrc);
      consumeSkipRequest();
      return;
    }

    if (step.kind === "listen-record") {
      const heard = step.audioSrc ? await playAudioFile(step.audioSrc) : await speakPrompt(step.prompt);
      if (!heard) return;
      if (consumeSkipRequest()) return;
      await playTone();
      const recording = await recordFor(step, step.responseSeconds);
      if (recording) setRecordings((prev) => [...prev, recording]);
      return;
    }

    if (["prep-record", "talk-grid", "summary-task", "debate-task"].includes(step.kind)) {
      if (step.task?.instructionAudioSrc) {
        await playAudioFile(step.task.instructionAudioSrc);
        consumeSkipRequest();
      }
      if (step.task?.taskAudioSrc) {
        await playAudioFile(step.task.taskAudioSrc);
        consumeSkipRequest();
      }
      if (step.task?.nowListenAudioSrc) {
        await playAudioFile(step.task.nowListenAudioSrc);
        consumeSkipRequest();
      }
      if (step.task?.incomingAudioSrc) {
        await playAudioFile(step.task.incomingAudioSrc);
        consumeSkipRequest();
      }
      if (Array.isArray(step.task?.expertAudioSources) || Array.isArray(step.task?.expertIntroAudioSources)) {
        const expertAudioSources = step.task.expertAudioSources || [];
        const expertIntroAudioSources = step.task.expertIntroAudioSources || [];
        const expertAudioCount = Math.max(expertAudioSources.length, expertIntroAudioSources.length);
        for (let index = 0; index < expertAudioCount; index += 1) {
          if (expertIntroAudioSources[index]) {
            await playAudioFile(expertIntroAudioSources[index]);
            consumeSkipRequest();
          }
          if (expertAudioSources[index]) {
            await playAudioFile(expertAudioSources[index]);
            consumeSkipRequest();
          }
        }
      }
      if (step.task?.prepInstructionAudioSrc) {
        await playAudioFile(step.task.prepInstructionAudioSrc);
        consumeSkipRequest();
      }
      if (step.task?.thinkingAudioSrc) {
        await playAudioFile(step.task.thinkingAudioSrc);
        consumeSkipRequest();
      }
      setPhase("prep");
      const prepared = await runCountdown(step.prepSeconds, "prep");
      if (!prepared) return;
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
    setStatus("sound-check");
    setMicError("");
    await ensureStream();
  }

  async function handleBeginExam() {
    setStatus("running");
    setRecordings([]);
    setMicError("");
    setElapsedSeconds(0);
    setActiveStep(null);
    setPhase("idle");
    setSecondsLeft(0);
    skipRequestedRef.current = false;
    skipResolverRef.current = null;
    runningRef.current = true;
    startedAtRef.current = new Date();
    logOteMockStarted({
      module: "speaking",
      mockId: mock.id,
      mockTitle: mock.title,
    });
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
    logOteMockCompleted({
      module: "speaking",
      mockId: mock.id,
      mockTitle: mock.title,
      recordingCount: totalRecordingSteps,
      elapsedSeconds: Math.floor((Date.now() - startedAtRef.current.getTime()) / 1000),
      reason: "completed",
    });
  }

  function handleSkip() {
    if (status !== "running") return;
    skipRequestedRef.current = true;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (currentAudioRef.current) currentAudioRef.current.pause();
    skipResolverRef.current?.();
  }

  return (
    <main className={`ote-exam ote-font-${visualSettings.fontSize} ote-theme-${visualSettings.theme}`}>
      <ExamHeader mock={mock} activeStep={activeStep} />

      {status === "ready" ? (
        <StartScreen mock={mock} user={user} onStart={handleStart} />
      ) : status === "sound-check" ? (
        <SoundCheckScreen
          micError={micError}
          soundCheckState={soundCheckState}
          secondsLeft={soundCheckSecondsLeft}
          soundCheckUrl={soundCheckUrl}
          volume={volume}
          onRecord={recordSoundCheck}
          onListen={playSoundCheck}
          onVolumeChange={updateVolume}
        />
      ) : status === "complete" ? (
        <CompleteScreen
          user={user}
          mock={mock}
          recordings={recordings}
          elapsedSeconds={elapsedSeconds}
          onRequireSignIn={onRequireSignIn}
          onDashboard={() => navigate("/ote")}
          onResult={(attemptId) =>
            navigate(nativeRoutes ? `/mock-tests/${mock.id}/results/${attemptId}` : `/ote/mock-tests/${mock.id}/results/${attemptId}`)
          }
        />
      ) : (
        <ExamBody
          activeStep={activeStep}
          phase={phase}
          secondsLeft={secondsLeft}
          micError={micError}
          completedRecordings={recordings.length}
          totalRecordingSteps={totalRecordingSteps}
          volume={volume}
          onVolumeChange={updateVolume}
          notesOpen={notesOpen}
          notesDraft={notesDraft}
          onToggleNotes={() => setNotesOpen((prev) => !prev)}
          onNotesChange={setNotesDraft}
        />
      )}

      <ExamFooter
        onOpenSettings={() => setSettingsOpen(true)}
        onSkip={status === "running" ? handleSkip : undefined}
        notesEnabled={status === "running" && activeStep?.task?.allowNotes}
        notesOpen={notesOpen}
        onToggleNotes={() => setNotesOpen((prev) => !prev)}
        nextLabel={status === "sound-check" ? "Next" : ""}
        onNext={status === "sound-check" ? handleBeginExam : undefined}
        nextDisabled={status === "sound-check" && soundCheckState === "recording"}
      />
      <VisualOptionsDrawer
        open={settingsOpen}
        settings={visualSettings}
        onChange={setVisualSettings}
        onClose={() => setSettingsOpen(false)}
      />
    </main>
  );
}

function ExamHeader({ mock, activeStep }) {
  const part = activeStep?.part;
  const title = part ? (
    <>
      <strong>{mock.moduleLabel}</strong> Part {part.number}
    </>
  ) : (
    <strong>{mock.title}</strong>
  );
  const progress =
    activeStep?.progressTotal
      ? ((activeStep.progressIndex - 1) / activeStep.progressTotal) * 100
      : 0;

  return (
    <header className="ote-exam-header">
      <img
        src="/images/seif-trainer-logo.png"
        alt=""
        className="ote-exam-mark"
        draggable="false"
      />
      <div className="ote-exam-title">{title}</div>
      <div className="ote-progress-rail" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="ote-exam-meta">
        <strong>Seif OTE Trainer</strong>
        <span>Mock</span>
      </div>
    </header>
  );
}

function StartScreen({ mock, user, onStart }) {
  return (
    <section className="ote-start-screen">
      <div className="ote-start-panel">
        <p className="ote-kicker">Speaking module</p>
        <h1>{mock.title}</h1>
        <p>
          Your speaking module will run automatically. You can use Skip to move through
          practice questions more quickly.
        </p>
        {!user ? <p className="ote-warning">Sign in to save this mock to your account.</p> : null}
        <button className="ote-primary-btn" type="button" onClick={onStart}>
          Start speaking mock
        </button>
      </div>
    </section>
  );
}

function SoundCheckScreen({
  micError,
  soundCheckState,
  secondsLeft,
  soundCheckUrl,
  volume,
  onRecord,
  onListen,
  onVolumeChange,
}) {
  const isRecording = soundCheckState === "recording";
  const isPlaying = soundCheckState === "playing";
  const canListen = Boolean(soundCheckUrl) && !isRecording;
  const activeBars = Math.max(1, Math.round(volume * 6));

  return (
    <section className="ote-sound-check-screen">
      <div className="ote-sound-check-inner">
        <h1>Check your sound</h1>
        <div className="ote-sound-check-panel">
          <div className="ote-sound-check-column">
            <p>
              Choose <strong>Record</strong>
              <br />
              Speak for 10 seconds
            </p>
            <div className={`ote-sound-icon ${isRecording ? "is-active" : ""}`}>
              <Mic size={58} />
              <span className="ote-sound-meter" aria-hidden="true">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => (
                  <i key={bar} className={isRecording ? "is-active" : ""} />
                ))}
              </span>
            </div>
            <button type="button" onClick={onRecord} disabled={isRecording}>
              {isRecording ? formatTime(secondsLeft) : "Record"}
            </button>
          </div>

          <div className="ote-sound-check-column">
            <p>
              <strong>Listen</strong> to check your
              <br />
              recording
            </p>
            <div className={`ote-sound-icon is-round ${isPlaying ? "is-active" : ""}`}>
              <Play size={58} fill="currentColor" />
            </div>
            <button type="button" onClick={onListen} disabled={!canListen || isPlaying}>
              {isPlaying ? "Playing" : "Listen"}
            </button>
          </div>

          <div className="ote-sound-check-column">
            <p>
              You can change
              <br />
              the volume
            </p>
            <div className="ote-sound-volume">
              <button
                type="button"
                className="ote-volume-btn"
                onClick={() => onVolumeChange(volume - 0.15)}
                aria-label="Decrease sound check volume"
              >
                <MinusCircle size={28} />
              </button>
              <span className="ote-bars" aria-hidden="true">
                {[1, 2, 3, 4, 5, 6].map((bar) => (
                  <i key={bar} className={bar <= activeBars ? "is-active" : ""} />
                ))}
              </span>
              <button
                type="button"
                className="ote-volume-btn"
                onClick={() => onVolumeChange(volume + 0.15)}
                aria-label="Increase sound check volume"
              >
                <PlusCircle size={28} />
              </button>
            </div>
            <span className="ote-sound-volume-label">Change volume</span>
          </div>
        </div>
        <p className="ote-sound-check-copy">
          Sound checks OK?
          <br />
          Yes? Choose <strong>Next.</strong>
          <br />
          No? Speak to your teacher.
        </p>
        {micError ? <p className="ote-warning">{micError}</p> : null}
      </div>
    </section>
  );
}

function ExamBody({
  activeStep,
  phase,
  secondsLeft,
  micError,
  completedRecordings,
  totalRecordingSteps,
  volume,
  onVolumeChange,
  notesOpen,
  notesDraft,
  onToggleNotes,
  onNotesChange,
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

  const hasVisualPanel = ["talk-grid", "debate-task"].includes(activeStep.kind);

  return (
    <section className={`ote-task-screen ${hasVisualPanel ? "has-image-grid" : ""}`}>
      <div className="ote-task-copy">
        <h2>{activeStep.part.title}</h2>
        {activeStep.kind === "prep-record" ? <VoicemailModeLine mode={activeStep.task.mode} /> : null}
        <InstructionBlock lines={activeStep.part.instructions} />
        {activeStep.kind === "listen-record" ? (
          <>
            {activeStep.topic ? <p className="ote-topic">Topic: {activeStep.topic}</p> : null}
            <p className="ote-question-text">
              {activeStep.displayQuestionLabelOnly
                ? activeStep.label
                : phase === "record"
                  ? "Speak now."
                  : "Listen to the question."}
            </p>
          </>
        ) : null}
        {activeStep.task && (activeStep.kind === "prep-record" ||
          (activeStep.kind === "part-instructions" && activeStep.part?.id === "part-2")) ? (
          <VoicemailPrompt task={activeStep.task} />
        ) : null}
        {activeStep.kind === "talk-grid" ? <TalkPrompt task={activeStep.task} /> : null}
        {((activeStep.kind === "part-instructions" && activeStep.task?.visualType === "summary") ||
          activeStep.kind === "summary-task") ? (
          <SummaryPrompt task={activeStep.task} />
        ) : null}
        {activeStep.kind === "debate-task" ? <DebatePrompt task={activeStep.task} /> : null}
        {activeStep.task?.allowNotes && notesOpen ? (
          <NotesPanel value={notesDraft} onChange={onNotesChange} onClose={onToggleNotes} />
        ) : null}
        {micError ? <p className="ote-warning">{micError}</p> : null}
        <button className="ote-help-btn" type="button" aria-label="Help" disabled>
          <HelpCircle size={24} />
        </button>
      </div>

      <StatusPanel
        phase={phase}
        secondsLeft={secondsLeft}
        prepSeconds={activeStep.prepSeconds}
        showThink={Boolean(activeStep.prepSeconds)}
        volume={volume}
        onVolumeChange={onVolumeChange}
      />

      {activeStep.kind === "talk-grid" ? (
        <ImageGrid task={activeStep.task} />
      ) : null}
      {activeStep.kind === "debate-task" ? (
        <DebateMindMap task={activeStep.task} />
      ) : null}

      <div className="ote-recording-progress">
        Recorded {completedRecordings} of {totalRecordingSteps}
      </div>
    </section>
  );
}

function VoicemailModeLine({ mode }) {
  if (mode === "diplomatic") return null;

  return (
    <p className="ote-mode-line">
      {mode === "reply"
        ? "You are going to reply to a voice message."
        : "You are going to leave a voice message."}
    </p>
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
      {task.incomingAudioScript ? (
        <blockquote className="ote-incoming-script">{task.incomingAudioScript}</blockquote>
      ) : null}
      <ul>
        {task.bullets.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {task.nowListenAudioSrc ? <strong>Now listen to the message.</strong> : null}
      <strong>You now have some time to think about what you want to say.</strong>
    </div>
  );
}

function TalkPrompt({ task }) {
  return (
    <div className="ote-prompt-block">
      <p>{task.prompt}</p>
      <strong>You now have some time to think about what you want to say.</strong>
    </div>
  );
}

function SummaryPrompt({ task }) {
  return (
    <div className="ote-prompt-block">
      <p>{task.prompt}</p>
      {Array.isArray(task.requirements) && task.requirements.length ? (
        <ul>
          {task.requirements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {Array.isArray(task.listenItems) && task.listenItems.length ? (
        <>
          <strong>{task.listenPrompt || "Now listen to the two speakers."}</strong>
          <ul>
            {task.listenItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      ) : null}
      <strong>You now have some time to think about what you want to say.</strong>
    </div>
  );
}

function DebatePrompt({ task }) {
  return (
    <div className="ote-prompt-block">
      <p>{task.prompt}</p>
      <p>
        <strong>&lsquo;{task.statement}&rsquo;</strong>
      </p>
    </div>
  );
}

function NotesPanel({ value, onChange, onClose }) {
  return (
    <aside className="ote-notes-panel" role="dialog" aria-label="Notes">
      <div className="ote-notes-header">
        <strong>Notes</strong>
        <button type="button" onClick={onClose} aria-label="Close notes">×</button>
      </div>
      <div className="ote-notes-paper">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Write your notes here ..."
        />
      </div>
    </aside>
  );
}

function StatusPanel({ phase, secondsLeft, prepSeconds = 0, showThink = false, volume, onVolumeChange }) {
  const isPrep = phase === "prep";
  const isRecord = phase === "record";
  const isListen = phase === "listen";
  const activeBars = Math.max(1, Math.round(volume * 6));
  const thinkProgress = isPrep && prepSeconds
    ? Math.max(8, Math.min(100, (secondsLeft / prepSeconds) * 100))
    : 0;

  return (
    <aside className="ote-status-panel">
      <div className="ote-status-top">
        <StatusIcon label="Listen" active={isListen} icon={<Volume2 size={72} />} />
        {showThink ? (
          <div className="ote-think-meter">
            <strong>Think</strong>
            <span className="ote-vertical-meter">
              <i style={{ height: `${thinkProgress}%` }} />
            </span>
            <b>{isPrep ? formatTime(secondsLeft) : "00:00"}</b>
          </div>
        ) : null}
        <StatusIcon label="Speak" active={isRecord} icon={<Mic size={72} />} time={isRecord ? formatTime(secondsLeft) : "00:00"} />
      </div>
      <div className="ote-volume-row">
        <button
          type="button"
          className="ote-volume-btn"
          onClick={() => onVolumeChange(volume - 0.15)}
          aria-label="Decrease question volume"
        >
          <MinusCircle size={28} />
        </button>
        <span className="ote-bars" aria-hidden="true" style={{ "--active-bars": activeBars }}>
          {[1, 2, 3, 4, 5, 6].map((bar) => (
            <i key={bar} className={bar <= activeBars ? "is-active" : ""} />
          ))}
        </span>
        <button
          type="button"
          className="ote-volume-btn"
          onClick={() => onVolumeChange(volume + 0.15)}
          aria-label="Increase question volume"
        >
          <PlusCircle size={28} />
        </button>
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

function ImageGrid({ task }) {
  return (
    <div className="ote-image-grid">
      {task.images.map((image) => (
        <figure key={image.id} className="ote-image-choice">
          <img src={image.src} alt="" />
          <figcaption>{image.label}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function DebateMindMap({ task }) {
  const ideas = task.mindMapIdeas || [];

  return (
    <div className="ote-debate-map" aria-label="Debate ideas">
      <div className="ote-debate-map-instructions">
        <p>Prepare your case for the debate. You should:</p>
        <ul>
          {(task.requirements || []).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>You now have {task.prepSeconds || 45} seconds to prepare. You can make notes if you wish.</p>
      </div>
      <div className="ote-debate-center">{task.statement}</div>
      {ideas.map((idea, index) => (
        <div key={idea} className={`ote-debate-idea idea-${index + 1}`}>
          {idea}
        </div>
      ))}
    </div>
  );
}

async function createZipAndDownload(files, zipName = "recordings.zip") {
  const enc = new TextEncoder();
  const centralDir = [];
  const localParts = [];
  let offset = 0;

  const u16 = (n) => {
    const b = new Uint8Array(2);
    new DataView(b.buffer).setUint16(0, n, true);
    return b;
  };
  const u32 = (n) => {
    const b = new Uint8Array(4);
    new DataView(b.buffer).setUint32(0, n, true);
    return b;
  };
  const concatU8 = (parts) => {
    const total = parts.reduce((n, p) => n + p.byteLength, 0);
    const out = new Uint8Array(total);
    let pos = 0;
    parts.forEach((p) => {
      out.set(p, pos);
      pos += p.byteLength;
    });
    return out;
  };
  const crcTable = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i += 1) {
      let c = i;
      for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[i] = c >>> 0;
    }
    return t;
  })();
  const crc32 = (buf) => {
    let c = 0 ^ -1;
    const v = new Uint8Array(buf);
    for (let i = 0; i < v.length; i += 1) c = (c >>> 8) ^ crcTable[(c ^ v[i]) & 0xff];
    return (c ^ -1) >>> 0;
  };

  for (const f of files) {
    const data = await f.blob.arrayBuffer();
    const nameBytes = enc.encode(f.name);
    const crc = crc32(data);
    const size = data.byteLength;
    const localHeader = concatU8([
      u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0),
      u32(crc), u32(size), u32(size), u16(nameBytes.length), u16(0), nameBytes,
    ]);
    localParts.push(localHeader, new Uint8Array(data));
    centralDir.push(concatU8([
      u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0),
      u32(crc), u32(size), u32(size), u16(nameBytes.length), u16(0), u16(0),
      u16(0), u16(0), u32(0), u32(offset), nameBytes,
    ]));
    offset += localHeader.byteLength + size;
  }

  const central = centralDir.length ? concatU8(centralDir) : new Uint8Array();
  const end = concatU8([
    u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
    u32(central.byteLength), u32(offset), u16(0),
  ]);
  const url = URL.createObjectURL(new Blob([concatU8([...localParts, central, end])], { type: "application/zip" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function CompleteScreen({ user, mock, recordings, elapsedSeconds = 0, onDashboard, onResult, onRequireSignIn }) {
  const downloadableRecordings = recordings.filter((recording) => recording.url && recording.blob);
  const [feedbackResult, setFeedbackResult] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [savedAttemptId, setSavedAttemptId] = useState("");

  async function handleGenerateFeedback() {
    if (!user) {
      onRequireSignIn?.();
      setFeedbackError("Sign in to generate and save mock feedback.");
      return;
    }
    setFeedbackLoading(true);
    setFeedbackError("");
    try {
      const feedbackAudio = await recordingsToFeedbackAudio(downloadableRecordings, `ote-${mock.id}`);
      const result = await requestOteSpeakingFeedback({
        partId: "mock",
        mockId: mock.id,
        mockTitle: mock.title,
        task: {
          id: mock.id,
          title: mock.title,
          topic: mock.part3Theme || "",
          parts: mock.parts,
        },
        recordings: feedbackAudio,
      });
      setFeedbackResult(result);
      const attemptId = await saveOteMockAttempt({
        mockId: mock.id,
        mockTitle: mock.title,
        module: "speaking",
        elapsedSeconds,
        recordings: downloadableRecordings.map(stripRecordingForStorage).filter(Boolean),
        aiFeedback: result?.feedback || null,
        aiFeedbackMeta: result?.meta || null,
        aiFeedbackTranscripts: result?.transcripts || [],
      });
      setSavedAttemptId(attemptId);
    } catch (error) {
      console.error("[OTE speaking mock feedback] failed", error);
      setFeedbackError(error?.message || "Could not generate mock feedback right now.");
    } finally {
      setFeedbackLoading(false);
    }
  }

  return (
    <section className="ote-complete-screen">
      <div className="ote-results-panel">
        <p className="ote-kicker">Speaking module complete</p>
        <h1>Review your recordings</h1>
        <p>
          {recordings.length} timed response{recordings.length === 1 ? "" : "s"} captured.
          Play them back here or download them before leaving this page.
        </p>
        <button
          className="ote-download-zip-btn"
          type="button"
          onClick={() => createZipAndDownload(downloadableRecordings, "ote-speaking-mock-1-recordings.zip")}
          disabled={!downloadableRecordings.length}
        >
          <Download size={22} />
          Download full test as ZIP
        </button>
        <button
          className="ote-download-zip-btn"
          type="button"
          onClick={handleGenerateFeedback}
          disabled={!downloadableRecordings.length || feedbackLoading}
        >
          {feedbackLoading ? "Generating feedback..." : "Get speaking feedback"}
        </button>
        {savedAttemptId ? (
          <button className="ote-secondary-btn" type="button" onClick={() => onResult?.(savedAttemptId)}>
            Open saved result
          </button>
        ) : null}
        {feedbackError ? <p className="ote-warning">{feedbackError}</p> : null}
        <SpeakingFeedbackPanel
          feedbackResult={feedbackResult}
          questions={downloadableRecordings.map((recording) => recording.prompt || recording.label)}
          title="OTE speaking mock feedback"
          appearance="light"
        />
        <div className="ote-recording-list">
          {downloadableRecordings.map((recording, index) => (
            <article key={recording.id} className="ote-recording-card">
              <div>
                <span>Recording {index + 1}</span>
                <strong>{recording.label}</strong>
                <small>{recording.durationSeconds}s response window</small>
              </div>
              <audio controls playsInline preload="metadata" src={recording.url} />
              <a href={recording.url} download={recording.name}>
                Download audio
              </a>
            </article>
          ))}
        </div>
        <div className="ote-complete-actions">
          <button className="ote-secondary-btn" type="button" onClick={onDashboard}>
            OTE dashboard
          </button>
        </div>
      </div>
    </section>
  );
}

function ExamFooter({
  onOpenSettings,
  onSkip,
  notesEnabled = false,
  notesOpen = false,
  onToggleNotes,
  nextLabel,
  onNext,
  nextDisabled = false,
}) {
  return (
    <footer className="ote-exam-footer">
      <button type="button" className="ote-settings-btn" onClick={onOpenSettings} aria-label="Visual display options">
        <Settings size={28} />
      </button>
      <button type="button" className="ote-skip-btn" onClick={onSkip} disabled={!onSkip}>
        Skip
      </button>
      {notesEnabled ? (
        <button type="button" className="ote-notes-btn" onClick={onToggleNotes}>
          Notes
        </button>
      ) : null}
      <span>© Seif English OTE mock environment</span>
      {nextLabel ? (
        <button type="button" className="ote-footer-next" onClick={onNext} disabled={nextDisabled}>
          {nextLabel}
        </button>
      ) : null}
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
