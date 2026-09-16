import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Download, Mic, RotateCcw, Timer } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { TOPIC_AUDIO, PRACTICE_SETS, ADVANCED_PRACTICE_SETS } from "./data/oteInterviewPracticeSets.js";
import SpeakingFeedbackPanel from "../../components/speaking/SpeakingFeedbackPanel.jsx";
import {
  logOteTrainingCompleted,
  logOteTrainingStarted,
  requestOteSpeakingFeedback,
  saveSpeakingAiFeedback,
} from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import { OTE_SPEAKING_AUDIO } from "./mockTests/data/oteSpeakingMockData.js";
import { recordingsToFeedbackAudio } from "./utils/speakingFeedback.js";
import OteAssignableCard from "./OteAssignableCard.jsx";
import { useOteTrainingProgress } from "./utils/trainingProgress.js";
import "./styles/ote.css";

const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
const PART1_INSTRUCTIONS = [
  "You are going to answer eight questions.",
  "The first two questions are practice questions.",
  "The clock shows how much time you have to speak.",
  "Start speaking when you hear the tone.",
];
const ADVANCED_PART1_INSTRUCTIONS = [
  "You are going to answer six questions.",
  "The first two questions are practice questions.",
  "The clock shows how much time you have to speak.",
  "Start speaking when you hear the tone.",
  "Try to speak for the full amount of time.",
];


function formatTime(seconds) {
  const safe = Math.max(0, Math.ceil(seconds || 0));
  return `00:${String(safe).padStart(2, "0")}`;
}

function getSupportedMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function buildQuestions(set) {
  if (!set) return [];
  const scoredQuestions = Array.isArray(set.questions)
    ? set.questions.map((prompt, questionIndex) => ({
        id: `${set.id}-q${questionIndex + 3}`,
        label: `Advanced question ${questionIndex + 1}`,
        title: `Question ${questionIndex + 3}`,
        prompt,
        audioSrc: set.audio?.[questionIndex] || "",
        responseSeconds: 30,
        isPractice: false,
      }))
    : set.topics.flatMap((topic, topicIndex) =>
        topic.questions.map((prompt, questionIndex) => {
          const questionNumber = 3 + topicIndex * 3 + questionIndex;
          return {
            id: `${set.id}-${topic.id}-q${questionIndex + 1}`,
            label: `${topic.title} question ${questionIndex + 1}`,
            title: `Question ${questionNumber}`,
            prompt,
            audioSrc: TOPIC_AUDIO[topic.id]?.[questionIndex] || "",
            responseSeconds: 20,
            isPractice: false,
          };
        })
      );

  return [
    {
      id: `${set.id}-q1`,
      label: "Practice question 1",
      title: "Question 1",
      prompt: "What's your name?",
      audioSrc: OTE_SPEAKING_AUDIO.whatName,
      responseSeconds: 10,
      isPractice: true,
    },
    {
      id: `${set.id}-q2`,
      label: "Practice question 2",
      title: "Question 2",
      prompt: "Which country do you come from?",
      audioSrc: OTE_SPEAKING_AUDIO.whichCountry,
      responseSeconds: 10,
      isPractice: true,
    },
    ...scoredQuestions,
  ];
}

function useSpeech() {
  const audioRef = useRef(null);
  const finishRef = useRef(null);

  useEffect(() => {
    return () => {
      finishRef.current?.(false);
      window.speechSynthesis?.cancel();
      audioRef.current?.pause();
    };
  }, []);

  function playAudioFile(src) {
    if (!src) return Promise.resolve(false);
    window.speechSynthesis?.cancel();
    audioRef.current?.pause();
    return new Promise((resolve) => {
      const audio = new Audio(src);
      let settled = false;
      const finish = (played) => {
        if (settled) return;
        settled = true;
        audio.pause();
        audioRef.current = null;
        finishRef.current = null;
        resolve(played);
      };
      finishRef.current = finish;
      audioRef.current = audio;
      audio.onended = () => finish(true);
      audio.onerror = () => finish(false);
      audio.play().catch(() => finish(false));
    });
  }

  function speak(text) {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      return new Promise((resolve) =>
        window.setTimeout(resolve, Math.min(4200, Math.max(1600, String(text).length * 48)))
      );
    }
    audioRef.current?.pause();
    window.speechSynthesis.cancel();
    return new Promise((resolve) => {
      let settled = false;
      const utterance = new SpeechSynthesisUtterance(text);
      const finish = () => {
        if (settled) return;
        settled = true;
        finishRef.current = null;
        resolve(true);
      };
      finishRef.current = finish;
      utterance.lang = "en-GB";
      utterance.rate = 0.94;
      utterance.onend = finish;
      utterance.onerror = finish;
      window.speechSynthesis.speak(utterance);
    });
  }

  function stop() {
    finishRef.current?.(false);
    finishRef.current = null;
    audioRef.current?.pause();
    audioRef.current = null;
    window.speechSynthesis?.cancel();
  }

  return { playAudioFile, speak, stop };
}

async function createZipAndDownload(files, zipName = "ote-part-1-practice.zip") {
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
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(size),
      u32(size),
      u16(nameBytes.length),
      u16(0),
      nameBytes,
    ]);
    localParts.push(localHeader, new Uint8Array(data));
    centralDir.push(
      concatU8([
        u32(0x02014b50),
        u16(20),
        u16(20),
        u16(0),
        u16(0),
        u16(0),
        u16(0),
        u32(crc),
        u32(size),
        u32(size),
        u16(nameBytes.length),
        u16(0),
        u16(0),
        u16(0),
        u16(0),
        u32(0),
        u32(offset),
        nameBytes,
      ])
    );
    offset += localHeader.byteLength + size;
  }

  const central = centralDir.length ? concatU8(centralDir) : new Uint8Array();
  const end = concatU8([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(central.byteLength),
    u32(offset),
    u16(0),
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

export default function OteSpeakingPart1Practice({ nativeRoutes = false, user = null, onRequireSignIn }) {
  const { setId } = useParams();
  const navigate = useNavigate();
  const { playAudioFile, speak, stop } = useSpeech();
  const menuPath = getSitePath(nativeRoutes ? "/speaking/part-1-interview" : "/ote/speaking/part-1-interview");
  const rawBasePath = nativeRoutes ? "/speaking/part-1-interview/practice" : "/ote/speaking/part-1-interview/practice";
  const basePath = getSitePath(rawBasePath);
  const getSetPath = (id) => getSitePath(`${rawBasePath}/${id}`);
  const isAdvanced = user?.oteVersion === "advanced";
  const activeSets = isAdvanced ? ADVANCED_PRACTICE_SETS : PRACTICE_SETS;
  const selectedSet = useMemo(() => activeSets.find((item) => item.id === setId), [activeSets, setId]);
  const questions = useMemo(() => buildQuestions(selectedSet), [selectedSet]);
  const instructions = isAdvanced ? ADVANCED_PART1_INSTRUCTIONS : PART1_INSTRUCTIONS;
  const completedProgress = useOteTrainingProgress();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState("ready");
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [recordings, setRecordings] = useState([]);
  const [micError, setMicError] = useState("");
  const [feedbackResult, setFeedbackResult] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  const streamRef = useRef(null);
  const activeRunStreamRef = useRef(null);
  const skipListeningRef = useRef(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const objectUrlsRef = useRef([]);
  const activityStartedRef = useRef(false);
  const activityCompletedRef = useRef(false);

  const activeQuestion = questions[questionIndex];
  const complete = selectedSet && recordings.length >= questions.length;
  const progressPercent = questions.length ? ((questionIndex + 1) / questions.length) * 100 : 0;
  const assignmentVariant = isAdvanced ? "advanced" : "general";

  useEffect(() => {
    if (!complete || !selectedSet || activityCompletedRef.current) return;
    activityCompletedRef.current = true;
    logOteTrainingCompleted({
      section: "speaking",
      part: "part-1",
      mode: "timed_practice",
      setId: selectedSet.id,
      setTitle: selectedSet.title,
      recordingCount: recordings.length,
      scoredRecordingCount: recordings.filter((recording) => !recording.label?.toLowerCase().includes("practice")).length,
    });
  }, [complete, recordings, selectedSet]);

  function buildAssignmentItem(set) {
    return {
      id: `ote.${assignmentVariant}.speaking.part1.practice.${set.id}`,
      variant: assignmentVariant,
      category: "Speaking",
      label: `Part 1: ${set.title}`,
      routePath: getSetPath(set.id),
      progressId: `speaking.part1.practice.${set.id}`,
      parentProgressId: "speaking.part1.practice",
    };
  }

  useEffect(() => {
    return () => {
      window.clearInterval(timerRef.current);
      streamRef.current?.getTracks?.().forEach((track) => track.stop());
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    setQuestionIndex(0);
    setPhase("ready");
    setSecondsLeft(10);
    setRecordings([]);
    setMicError("");
    setFeedbackResult(null);
    setFeedbackError("");
    activeRunStreamRef.current = null;
    skipListeningRef.current = false;
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
    activityStartedRef.current = false;
    activityCompletedRef.current = false;
    stop();
  }, [setId]);

  async function ensureStream() {
    if (streamRef.current) return streamRef.current;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setMicError("Recording is not available in this browser.");
      return null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicError("");
      return stream;
    } catch (error) {
      console.warn("[OTE part 1 practice] microphone access failed", error);
      setMicError("Microphone access failed. Please allow microphone access and try again.");
      return null;
    }
  }

  function playBeep() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.28, now + 0.03);
    gain.gain.setValueAtTime(0.28, now + 0.36);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(now + 0.54);
  }

  function clearTimer() {
    window.clearInterval(timerRef.current);
    timerRef.current = null;
  }

  function startCountdown(seconds, nextPhase, onComplete) {
    clearTimer();
    setPhase(nextPhase);
    setSecondsLeft(seconds);
    let remaining = seconds;
    timerRef.current = window.setInterval(() => {
      remaining -= 1;
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearTimer();
        onComplete?.();
      }
    }, 1000);
  }

  async function runQuestion(question, index, stream) {
    setPhase("listening");
    setSecondsLeft(0);
    if (index === 0) {
      await playAudioFile(isAdvanced ? OTE_SPEAKING_AUDIO.part1AdvancedInstructions : OTE_SPEAKING_AUDIO.part1Instructions);
      if (skipListeningRef.current) {
        skipListeningRef.current = false;
        startRecording(stream, question);
        return;
      }
    }
    if (question.audioSrc) {
      const played = await playAudioFile(question.audioSrc);
      if (!played) await speak(question.prompt);
    } else {
      await speak(question.prompt);
    }
    if (skipListeningRef.current) {
      skipListeningRef.current = false;
      startRecording(stream, question);
      return;
    }
    startRecording(stream, question);
  }

  async function startQuestion() {
    stop();
    if (!activeQuestion || phase === "listening" || phase === "recording") return;
    const stream = await ensureStream();
    if (!stream) return;
    activeRunStreamRef.current = stream;
    skipListeningRef.current = false;
    if (!activityStartedRef.current) {
      activityStartedRef.current = true;
      logOteTrainingStarted({
        section: "speaking",
        part: "part-1",
        mode: "timed_practice",
        setId: selectedSet.id,
        setTitle: selectedSet.title,
        questionCount: questions.length,
      });
    }
    await runQuestion(activeQuestion, questionIndex, stream);
  }

  function startRecording(stream, question) {
    playBeep();
    chunksRef.current = [];
    const mimeType = getSupportedMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data?.size) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
      const url = URL.createObjectURL(blob);
      objectUrlsRef.current.push(url);
      setRecordings((current) => [
        ...current.filter((recording) => recording.questionId !== question.id),
        {
          questionId: question.id,
          id: question.id,
          partId: "part-1",
          label: question.label,
          title: question.title,
          prompt: question.prompt,
          durationSeconds: question.responseSeconds,
          blob,
          url,
          name: `ote-part-1-${selectedSet.id}-${question.title.toLowerCase().replace(/\s+/g, "-")}.webm`,
        },
      ]);
      setPhase("review");
      setSecondsLeft(0);
    };
    recorder.start();
    startCountdown(question.responseSeconds, "recording", () => {
      if (recorder.state === "recording") recorder.stop();
    });
  }

  function stopRecordingNow() {
    clearTimer();
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  function skipToNextPhase() {
    if (phase === "listening") {
      skipListeningRef.current = true;
      stop();
      return;
    }
    if (phase === "recording") {
      stopRecordingNow();
    }
  }

  function repeatActiveQuestion() {
    if (!activeQuestion) return;
    clearTimer();
    stop();
    const recording = recordings.find((item) => item.questionId === activeQuestion.id);
    if (recording?.url) URL.revokeObjectURL(recording.url);
    objectUrlsRef.current = objectUrlsRef.current.filter((url) => url !== recording?.url);
    setRecordings((current) => current.filter((item) => item.questionId !== activeQuestion.id));
    setPhase("ready");
    setSecondsLeft(activeQuestion.responseSeconds || 20);
    activeRunStreamRef.current = null;
    skipListeningRef.current = false;
    setFeedbackResult(null);
    setFeedbackError("");
  }

  function skipPracticeQuestions() {
    const firstScoredIndex = questions.findIndex((question) => !question.isPractice);
    if (firstScoredIndex <= questionIndex) return;
    stop();
    clearTimer();
    setQuestionIndex(firstScoredIndex);
    setPhase("ready");
    setSecondsLeft(questions[firstScoredIndex]?.responseSeconds || (isAdvanced ? 30 : 20));
    activeRunStreamRef.current = null;
    skipListeningRef.current = false;
  }

  async function goNext() {
    stop();
    if (!selectedSet) return;
    if (questionIndex < questions.length - 1) {
      const stream = await ensureStream();
      if (!stream) return;
      const nextIndex = questionIndex + 1;
      const nextQuestion = questions[questionIndex + 1];
      setQuestionIndex(nextIndex);
      setSecondsLeft(nextQuestion?.responseSeconds || 20);
      await runQuestion(nextQuestion, nextIndex, stream);
      return;
    }
    setPhase("complete");
    if (!activityCompletedRef.current) {
      activityCompletedRef.current = true;
      logOteTrainingCompleted({
        section: "speaking",
        part: "part-1",
        mode: "timed_practice",
        setId: selectedSet.id,
        setTitle: selectedSet.title,
        recordingCount: recordings.length,
        scoredRecordingCount: recordings.filter((recording) => !recording.label?.toLowerCase().includes("practice")).length,
      });
    }
  }

  function resetSet() {
    clearTimer();
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
    activityStartedRef.current = false;
    activityCompletedRef.current = false;
    setRecordings([]);
    setQuestionIndex(0);
    setPhase("ready");
    setSecondsLeft(10);
    setMicError("");
    setFeedbackResult(null);
    setFeedbackError("");
    stop();
  }

  async function handleGenerateFeedback() {
    if (!user) {
      onRequireSignIn?.();
      setFeedbackError("Sign in to generate OTE speaking feedback.");
      return;
    }
    setFeedbackLoading(true);
    setFeedbackError("");
    try {
      const feedbackQuestions = questions.filter((question) => !question.isPractice);
      const orderedRecordings = feedbackQuestions
        .map((question) => recordings.find((recording) => recording.questionId === question.id))
        .filter(Boolean);
      const feedbackAudio = await recordingsToFeedbackAudio(orderedRecordings, `ote-part-1-${selectedSet.id}`);
      const result = await requestOteSpeakingFeedback({
        partId: "part-1",
        task: {
          id: selectedSet.id,
          title: selectedSet.title,
          instructions: PART1_INSTRUCTIONS,
        },
        recordings: feedbackAudio,
      });
      setFeedbackResult(result);
      await saveSpeakingAiFeedback({
        product: "ote",
        part: "part-1",
        taskId: selectedSet.id,
        taskTitle: selectedSet.title,
        questions: feedbackQuestions.map((question) => question.prompt),
        transcripts: result?.transcripts || [],
        feedback: result?.feedback,
        meta: result?.meta || null,
      });
    } catch (error) {
      console.error("[OTE part 1 feedback] failed", error);
      setFeedbackError(error?.message || "Could not generate feedback right now.");
    } finally {
      setFeedbackLoading(false);
    }
  }

  if (!selectedSet) {
    return (
      <main className="ote-training-page">
        <Seo title="OTE Speaking Part 1 Practice | Seif English" description="Timed interview practice sets for OTE Speaking Part 1." />
        <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
          <ArrowLeft size={18} aria-hidden="true" />
          Back to interview training
        </button>
        <header className="ote-training-hero">
          <p className="ote-kicker">Speaking Part 1</p>
          <h1>Timed Interview Sets</h1>
          <p>
            {isAdvanced
              ? "Choose a set. Every set starts with the same two practice questions, then gives you four Advanced interview questions."
              : "Choose a set. Every set starts with the same two practice questions, then combines two everyday topics for questions 3 to 8."}
          </p>
        </header>
        <div className="ote-practice-set-grid">
          {activeSets.map((set, index) => (
            <OteAssignableCard
              key={set.id}
              user={user}
              item={buildAssignmentItem(set)}
              className={`ote-practice-set-card ${completedProgress.has(`speaking.part1.practice.${set.id}`) ? "is-complete" : ""}`}
              onClick={() => navigate(getSetPath(set.id))}
            >
              {completedProgress.has(`speaking.part1.practice.${set.id}`) ? (
                <CheckCircle2 className="ote-training-complete-icon" size={22} aria-label="Completed" />
              ) : null}
              <span>Set {index + 1}</span>
              <h2>{set.title}</h2>
              <p>{set.description}</p>
            </OteAssignableCard>
          ))}
        </div>
      </main>
    );
  }

  const activeRecording = recordings.find((recording) => recording.questionId === activeQuestion?.id);

  return (
    <main className="ote-training-page">
      <Seo title={`${selectedSet.title} | OTE Part 1 Practice`} description="Timed OTE Speaking Part 1 interview practice." />
      <button className="ote-training-back" type="button" onClick={() => navigate(basePath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to practice sets
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Part 1 timed set</p>
        <h1>{selectedSet.title}</h1>
        <p>
          {isAdvanced
            ? "Answer six short interview questions with the real Advanced Part 1 timing: 10 seconds for practice, then 30 seconds for each scored answer."
            : "Answer eight short interview questions with the real Part 1 timing: 10 seconds for practice, then 20 seconds for each scored answer."}
        </p>
      </header>

      <section className="ote-practice-runner">
        <div className="ote-practice-progress" aria-label="Part 1 question progress">
          <div>
            <span>{activeQuestion?.isPractice ? "Practice" : "Scored"}</span>
            <strong>
              {activeQuestion?.title || "Question"} of {questions.length}
            </strong>
          </div>
          <div className="ote-practice-progress-bar" aria-hidden="true">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {!complete && activeQuestion && (
          <article className="ote-practice-task-card">
            <div className="ote-recorder-top">
              <div>
                <p className="ote-kicker">{activeQuestion.label}</p>
                <h2>{activeQuestion.title}</h2>
              </div>
              <div className={`ote-recorder-timer is-${phase}`} aria-live="polite">
                <Timer size={22} aria-hidden="true" />
                <strong>{formatTime(secondsLeft)}</strong>
                <span>{phase === "recording" ? "Recording" : phase === "listening" ? "Listening" : phase === "review" ? "Review" : "Ready"}</span>
              </div>
            </div>

            <div className="ote-practice-instructions">
              <p className="ote-kicker">Instructions</p>
              <ul>
                {instructions.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>

            {micError && <p className="ote-mic-error">{micError}</p>}

            {!activeRecording && (
              <div className="ote-recorder-actions">
                <button type="button" onClick={startQuestion} disabled={phase === "listening" || phase === "recording"}>
                  <Mic size={18} aria-hidden="true" />
                  {phase === "listening" ? "Question running" : "Start question"}
                </button>
                {activeQuestion.isPractice && questionIndex === 0 && phase === "ready" ? (
                  <button type="button" onClick={skipPracticeQuestions}>
                    Skip practice questions
                  </button>
                ) : null}
                {phase === "recording" && (
                  <button type="button" onClick={stopRecordingNow}>
                    Stop recording
                  </button>
                )}
                {phase === "listening" ? (
                  <button type="button" onClick={skipToNextPhase}>
                    Skip to recording
                  </button>
                ) : null}
              </div>
            )}

            {activeRecording && (
              <div className="ote-training-recording-review">
                <div className="ote-training-review-playback">
                  <div>
                    <strong>{activeQuestion.title} recording</strong>
                    <span>Listen back before moving on.</span>
                  </div>
                  <audio controls playsInline preload="metadata" src={activeRecording.url} />
                </div>
                <div className="ote-training-review-actions">
                  <button className="ote-review-primary-action" type="button" onClick={goNext}>
                    <CheckCircle2 size={20} aria-hidden="true" />
                    {questionIndex < questions.length - 1 ? "Play next question" : "Finish set"}
                  </button>
                  <div className="ote-training-review-secondary-actions">
                    <button className="ote-review-secondary-action" type="button" onClick={repeatActiveQuestion}>
                      <RotateCcw size={17} aria-hidden="true" />
                      Record again
                    </button>
                    <a className="ote-review-utility-action" href={activeRecording.url} download={activeRecording.name}>
                      <Download size={17} aria-hidden="true" />
                      Download audio
                    </a>
                  </div>
                </div>
              </div>
            )}
          </article>
        )}

        {(complete || phase === "complete") && (
          <section className="ote-practice-complete">
            <p className="ote-kicker">Practice complete</p>
            <h2>Review Your Interview Answers</h2>
            <p>Play them back, download individual files, or download the full set as a ZIP.</p>
            <div className="ote-practice-complete-actions">
              <button
                className="ote-reference-download"
                type="button"
                onClick={() => createZipAndDownload(recordings, `ote-part-1-${selectedSet.id}.zip`)}
                disabled={!recordings.length}
              >
                <Download size={18} aria-hidden="true" />
                Download ZIP
              </button>
              <button className="ote-training-primary-link" type="button" onClick={resetSet}>
                Try this set again
              </button>
              <button className="ote-training-primary-link" type="button" onClick={repeatActiveQuestion}>
                Record current question again
              </button>
              <button
                className="ote-training-primary-link"
                type="button"
                onClick={handleGenerateFeedback}
                disabled={!recordings.length || feedbackLoading}
              >
                {feedbackLoading ? "Generating feedback..." : "Get AI feedback"}
              </button>
            </div>
            {feedbackError ? <p className="ote-mic-error">{feedbackError}</p> : null}
            <SpeakingFeedbackPanel
              feedbackResult={feedbackResult}
              questions={questions.filter((question) => !question.isPractice).map((question) => question.prompt)}
              title="OTE Part 1 feedback"
            />
            <div className="ote-recording-list">
              {recordings.map((recording) => (
                <article key={recording.questionId} className="ote-recording-card">
                  <div>
                    <span>{recording.label}</span>
                    <strong>{recording.title}</strong>
                    <small>{recording.durationSeconds}s response window</small>
                  </div>
                  <audio controls playsInline preload="metadata" src={recording.url} />
                  <a href={recording.url} download={recording.name}>Download audio</a>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
