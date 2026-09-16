import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Clipboard, Download, ExternalLink, Mic, NotebookTabs, Timer } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
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
import { SUMMARY_PRACTICE_SETS, SUMMARY_TEACHER_SETS, SUMMARY_SHARED_TASK_ENDING } from "./data/oteSummaryPracticeSets.js";
import OteAssignButton from "./OteAssignButton.jsx";
import OteAssignableCard from "./OteAssignableCard.jsx";
import { useOteTrainingProgress } from "./utils/trainingProgress.js";
import "./styles/ote.css";

const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

const SUMMARY_INSTRUCTIONS = [
  "You are going to give a summary.",
  "First read and listen to the task.",
  "You can make notes while you listen. Your notes will not be marked.",
  "You will then have some time to think about what you want to say.",
  "The clock shows how much time you have to give your summary.",
  "Start speaking when you hear the tone.",
];


function formatTime(seconds) {
  const safe = Math.max(0, Math.ceil(seconds || 0));
  return `00:${String(safe).padStart(2, "0")}`;
}

function getSupportedMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function buildTaskText(task) {
  return `${task.prompt} ${task.requirements.join(" ")}`;
}

function useSpeech() {
  const [speakingId, setSpeakingId] = useState("");
  const audioRef = useRef(null);
  const finishRef = useRef(null);

  useEffect(() => {
    return () => {
      finishRef.current?.(false);
      window.speechSynthesis?.cancel();
      audioRef.current?.pause();
    };
  }, []);

  function playAudioFile(id, src) {
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
        setSpeakingId("");
        resolve(played);
      };
      finishRef.current = finish;
      audioRef.current = audio;
      audio.onended = () => finish(true);
      audio.onerror = () => finish(false);
      setSpeakingId(id);
      audio.play().catch(() => finish(false));
    });
  }

  function speak(id, text, rate = 0.94) {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      return new Promise((resolve) => window.setTimeout(resolve, Math.min(9000, Math.max(1800, String(text).length * 42))));
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
        setSpeakingId("");
        resolve(true);
      };
      finishRef.current = finish;
      utterance.lang = "en-GB";
      utterance.rate = rate;
      utterance.onend = finish;
      utterance.onerror = finish;
      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    });
  }

  function stop() {
    finishRef.current?.(false);
    finishRef.current = null;
    audioRef.current?.pause();
    audioRef.current = null;
    window.speechSynthesis?.cancel();
    setSpeakingId("");
  }

  return { speakingId, playAudioFile, speak, stop };
}

async function createZipAndDownload(files, zipName = "ote-summary-practice.zip") {
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

function NotesPanel({ value, onChange, onClose }) {
  return (
    <aside className="ote-notes-panel" role="dialog" aria-label="Notes">
      <div className="ote-notes-header">
        <strong>Notes</strong>
        <button type="button" onClick={onClose} aria-label="Close notes">x</button>
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

export default function OteSpeakingPart3SummaryPractice({ nativeRoutes = false, user = null, onRequireSignIn, teacherBank = false }) {
  const { setId } = useParams();
  const navigate = useNavigate();
  const { speakingId, playAudioFile, speak, stop } = useSpeech();
  const menuPath = getSitePath(nativeRoutes ? "/speaking" : "/ote/speaking");
  const teacherResourcesPath = getSitePath("/teacher-resources");
  const rawBasePath = teacherBank
    ? nativeRoutes ? "/speaking/part-3-summary/teacher-bank" : "/ote/speaking/part-3-summary/teacher-bank"
    : nativeRoutes ? "/speaking/part-3-summary/practice" : "/ote/speaking/part-3-summary/practice";
  const basePath = getSitePath(rawBasePath);
  const getSetPath = (id) => getSitePath(`${rawBasePath}/${id}`);
  const activeSets = teacherBank ? SUMMARY_TEACHER_SETS : SUMMARY_PRACTICE_SETS;
  const selectedSet = useMemo(() => activeSets.find((item) => item.id === setId), [activeSets, setId]);
  const progressPrefix = teacherBank ? "speaking.part3.teacher-bank" : "speaking.parts34.practice";
  const activityMode = teacherBank ? "summary_teacher_bank" : "summary_practice";
  const completedProgress = useOteTrainingProgress();
  const [copiedSetId, setCopiedSetId] = useState("");

  const [phase, setPhase] = useState("ready");
  const [secondsLeft, setSecondsLeft] = useState(40);
  const [recordings, setRecordings] = useState([]);
  const [micError, setMicError] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [feedbackResult, setFeedbackResult] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  const streamRef = useRef(null);
  const activeRunStreamRef = useRef(null);
  const skipListeningRef = useRef(false);
  const skipThinkingRef = useRef(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const objectUrlsRef = useRef([]);
  const activityStartedRef = useRef(false);
  const activityCompletedRef = useRef(false);

  const recording = recordings[0] || null;
  const complete = Boolean(recording);

  useEffect(() => {
    if (!complete || !selectedSet || activityCompletedRef.current) return;
    activityCompletedRef.current = true;
    logOteTrainingCompleted({
      section: "speaking",
      part: "part-3",
      mode: activityMode,
      progressId: teacherBank ? `${progressPrefix}.${selectedSet.id}` : undefined,
      setId: selectedSet.id,
      setTitle: selectedSet.title,
      recordingCount: recordings.length,
    });
  }, [activityMode, complete, progressPrefix, recordings.length, selectedSet, teacherBank]);

  function buildAssignmentItem(set) {
    return {
      id: `ote.advanced.speaking.part3.${teacherBank ? "teacher-bank" : "practice"}.${set.id}`,
      variant: "advanced",
      category: "Speaking",
      label: `Part 3 Summary: ${set.title}`,
      routePath: getSetPath(set.id),
      progressId: `${progressPrefix}.${set.id}`,
      parentProgressId: teacherBank ? "" : "speaking.parts34.practice",
    };
  }

  async function copyStudentLink(set) {
    const relativeUrl = getSetPath(set.id);
    const shareUrl = new URL(relativeUrl, window.location.origin).toString();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedSetId(set.id);
      window.setTimeout(() => setCopiedSetId((current) => current === set.id ? "" : current), 1800);
    } catch (error) {
      console.warn("[OTE summary teacher bank] Could not copy student link", error);
      window.prompt("Copy this student link:", shareUrl);
    }
  }

  useEffect(() => {
    return () => {
      window.clearInterval(timerRef.current);
      streamRef.current?.getTracks?.().forEach((track) => track.stop());
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      stop();
    };
  }, []);

  useEffect(() => {
    window.clearInterval(timerRef.current);
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
    setPhase("ready");
    setSecondsLeft(40);
    setRecordings([]);
    setMicError("");
    setNotesOpen(false);
    setNotesDraft("");
    setFeedbackResult(null);
    setFeedbackError("");
    activeRunStreamRef.current = null;
    skipListeningRef.current = false;
    skipThinkingRef.current = false;
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
      console.warn("[OTE summary practice] microphone access failed", error);
      setMicError("Microphone access failed. Please allow microphone access and try again.");
      return null;
    }
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

  async function startTask() {
    stop();
    if (!selectedSet || ["listening", "thinking", "recording"].includes(phase)) return;
    const stream = await ensureStream();
    if (!stream) return;
    activeRunStreamRef.current = stream;
    skipListeningRef.current = false;
    skipThinkingRef.current = false;
    if (!activityStartedRef.current) {
      activityStartedRef.current = true;
      logOteTrainingStarted({
        section: "speaking",
        part: "part-3",
        mode: activityMode,
        progressId: teacherBank ? `${progressPrefix}.${selectedSet.id}` : undefined,
        setId: selectedSet.id,
        setTitle: selectedSet.title,
      });
    }
    setPhase("listening");
    setSecondsLeft(0);
    await playAudioFile("summary-instructions", OTE_SPEAKING_AUDIO.summaryAdvancedInstructions);
    if (skipListeningRef.current) return beginThinkingPhase(stream, { playCue: false });
    if (selectedSet.taskIntroAudioSrc) {
      const playedIntro = await playAudioFile("summary-task-intro", selectedSet.taskIntroAudioSrc);
      if (!playedIntro && !skipListeningRef.current) await speak("summary-task-intro", selectedSet.taskIntroScript, 0.92);
      if (skipListeningRef.current) return beginThinkingPhase(stream, { playCue: false });
      const playedEnding = await playAudioFile("summary-task-ending", OTE_SPEAKING_AUDIO.combineAndSummarise);
      if (!playedEnding && !skipListeningRef.current) await speak("summary-task-ending", SUMMARY_SHARED_TASK_ENDING, 0.92);
    } else if (selectedSet.taskAudioSrc) {
      const played = await playAudioFile("summary-task", selectedSet.taskAudioSrc);
      if (!played && !skipListeningRef.current) await speak("summary-task", `${selectedSet.prompt} ${selectedSet.requirements.join(" ")}`, 0.92);
    } else {
      await speak("summary-task", `${selectedSet.prompt} ${selectedSet.requirements.join(" ")}`, 0.92);
    }
    if (skipListeningRef.current) return beginThinkingPhase(stream, { playCue: false });
    const playedListenCue = await playAudioFile("summary-listen-cue", OTE_SPEAKING_AUDIO.nowListenToTwoExperts);
    if (!playedListenCue) await speak("summary-listen-cue", "Now listen to the two experts.", 0.94);
    if (skipListeningRef.current) return beginThinkingPhase(stream, { playCue: false });
    for (let index = 0; index < selectedSet.experts.length; index += 1) {
      const expert = selectedSet.experts[index];
      const introSrc = index === 0 ? OTE_SPEAKING_AUDIO.summaryExpert1Intro : OTE_SPEAKING_AUDIO.summaryExpert2Intro;
      await playAudioFile(`expert-${index + 1}-intro`, introSrc);
      if (skipListeningRef.current) return beginThinkingPhase(stream, { playCue: false });
      if (expert.audioSrc) {
        const played = await playAudioFile(`expert-${index + 1}`, expert.audioSrc);
        if (!played) await speak(`expert-${index + 1}`, expert.script, 0.9);
      } else {
        await speak(`expert-${index + 1}`, expert.script, 0.9);
      }
      if (skipListeningRef.current) return beginThinkingPhase(stream, { playCue: false });
    }
    await beginThinkingPhase(stream);
  }

  async function beginThinkingPhase(stream, { playCue = true } = {}) {
    skipListeningRef.current = false;
    skipThinkingRef.current = false;
    setPhase("thinking");
    setSecondsLeft(40);
    if (playCue) await playAudioFile("summary-time-to-think", OTE_SPEAKING_AUDIO.timeToThink);
    if (skipThinkingRef.current) return;
    startCountdown(40, "thinking", () => startRecording(stream));
  }

  function startRecording(stream) {
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
      setRecordings([
        {
          id: selectedSet.id,
          taskId: selectedSet.id,
          partId: "part-3",
          label: "Part 3 Summary",
          title: selectedSet.title,
          prompt: buildTaskText(selectedSet),
          durationSeconds: 50,
          notes: notesDraft,
          blob,
          url,
          name: `ote-part-3-summary-${selectedSet.id}.webm`,
        },
      ]);
      setPhase("review");
      setSecondsLeft(0);
      if (!activityCompletedRef.current) {
        activityCompletedRef.current = true;
        logOteTrainingCompleted({
          section: "speaking",
          part: "part-3",
          mode: activityMode,
          progressId: teacherBank ? `${progressPrefix}.${selectedSet.id}` : undefined,
          setId: selectedSet.id,
          setTitle: selectedSet.title,
          recordingCount: 1,
        });
      }
    };
    recorder.start();
    startCountdown(50, "recording", () => {
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
    if (phase === "thinking") {
      clearTimer();
      skipThinkingRef.current = true;
      startRecording(activeRunStreamRef.current || streamRef.current);
      return;
    }
    if (phase === "recording") stopRecordingNow();
  }

  function repeatTask() {
    clearTimer();
    stop();
    const currentRecording = recordings[0];
    if (currentRecording?.url) URL.revokeObjectURL(currentRecording.url);
    objectUrlsRef.current = objectUrlsRef.current.filter((url) => url !== currentRecording?.url);
    setRecordings([]);
    setPhase("ready");
    setSecondsLeft(40);
    activeRunStreamRef.current = null;
    skipListeningRef.current = false;
    skipThinkingRef.current = false;
    setFeedbackResult(null);
    setFeedbackError("");
    activityCompletedRef.current = false;
  }

  function resetSet() {
    clearTimer();
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
    activityStartedRef.current = false;
    activityCompletedRef.current = false;
    setRecordings([]);
    setPhase("ready");
    setSecondsLeft(40);
    setMicError("");
    setNotesOpen(false);
    setNotesDraft("");
    setFeedbackResult(null);
    setFeedbackError("");
    activeRunStreamRef.current = null;
    skipListeningRef.current = false;
    skipThinkingRef.current = false;
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
      const feedbackAudio = await recordingsToFeedbackAudio(recordings, `ote-part-3-summary-${selectedSet.id}`);
      const result = await requestOteSpeakingFeedback({
        partId: "part-3",
        task: {
          id: selectedSet.id,
          title: selectedSet.title,
          instructions: SUMMARY_INSTRUCTIONS,
          taskType: "summary",
          prompt: selectedSet.prompt,
          requirements: selectedSet.requirements,
          audioScript: selectedSet.experts.reduce((acc, expert, index) => {
            acc[`expert${index + 1}`] = expert.script;
            return acc;
          }, {}),
          teacherKey: selectedSet.teacherKey,
        },
        recordings: feedbackAudio,
      });
      setFeedbackResult(result);
      await saveSpeakingAiFeedback({
        product: "ote",
        part: "part-3",
        taskId: selectedSet.id,
        taskTitle: selectedSet.title,
        questions: [buildTaskText(selectedSet)],
        transcripts: result?.transcripts || [],
        feedback: result?.feedback,
        meta: result?.meta || null,
      });
    } catch (error) {
      console.error("[OTE summary feedback] failed", error);
      setFeedbackError(error?.message || "Could not generate feedback right now.");
    } finally {
      setFeedbackLoading(false);
    }
  }

  if (!selectedSet) {
    return (
      <main className="ote-training-page">
        <Seo title={teacherBank ? "OTE Advanced Summary Teacher Bank | Seif English" : "OTE Advanced Speaking Part 3 Summary Practice | Seif English"} description="Timed Advanced OTE speaking summary practice sets." />
        <button className="ote-training-back" type="button" onClick={() => navigate(teacherBank ? teacherResourcesPath : menuPath)}>
          <ArrowLeft size={18} aria-hidden="true" />
          {teacherBank ? "Back to teacher resources" : "Back to speaking"}
        </button>
        <header className="ote-training-hero">
          <p className="ote-kicker">{teacherBank ? "Teacher task bank" : "Advanced Speaking Part 3"}</p>
          <h1>{teacherBank ? "Advanced Summary Tasks" : "Summary Practice"}</h1>
          <p>
            {teacherBank
              ? "Open a classroom task, copy its student link, or assign it. These extra tasks are available to enabled users through their link or assignment."
              : "Choose a set, listen to two expert sources, make notes, then give one timed spoken summary that combines the shared ideas."}
          </p>
        </header>
        <div className="ote-practice-set-grid">
          {activeSets.map((set, index) => {
            const isComplete = completedProgress.has(`${progressPrefix}.${set.id}`);
            if (teacherBank) return (
              <article className={`ote-practice-set-card ote-teacher-bank-card ${isComplete ? "is-complete" : ""}`} key={set.id}>
                {isComplete ? <CheckCircle2 className="ote-training-complete-icon" size={22} aria-label="Completed" /> : null}
                <span>Task {index + 1}</span>
                <h2>{set.title}</h2>
                <p>{set.description}</p>
                <div className="ote-teacher-bank-card-actions">
                  <button type="button" onClick={() => navigate(getSetPath(set.id))}>
                    <ExternalLink size={16} aria-hidden="true" /> Open task
                  </button>
                  <button type="button" onClick={() => copyStudentLink(set)}>
                    <Clipboard size={16} aria-hidden="true" />
                    {copiedSetId === set.id ? "Link copied" : "Copy student link"}
                  </button>
                  <OteAssignButton user={user} item={buildAssignmentItem(set)} />
                </div>
              </article>
            );
            return (
              <OteAssignableCard
                key={set.id}
                user={user}
                item={buildAssignmentItem(set)}
                className={`ote-practice-set-card ${isComplete ? "is-complete" : ""}`}
                onClick={() => navigate(getSetPath(set.id))}
              >
                {isComplete ? <CheckCircle2 className="ote-training-complete-icon" size={22} aria-label="Completed" /> : null}
                <span>Set {index + 1}</span>
                <h2>{set.title}</h2>
                <p>{set.description}</p>
              </OteAssignableCard>
            );
          })}
        </div>
      </main>
    );
  }

  return (
    <main className="ote-training-page">
      <Seo title={`${selectedSet.title} | OTE Summary Practice`} description="Timed OTE Advanced Speaking Part 3 summary practice." />
      <button className="ote-training-back" type="button" onClick={() => navigate(basePath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        {teacherBank ? "Back to teacher task bank" : "Back to summary sets"}
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">{teacherBank ? "Teacher bank task" : "Part 3 summary set"}</p>
        <h1>{selectedSet.title}</h1>
        <p>
          Listen to both experts, use the notes area if you wish, then prepare and record a 50-second spoken summary.
        </p>
      </header>

      <section className="ote-practice-runner">
        {!complete && (
          <article className="ote-practice-task-card ote-summary-practice-card">
            <div className="ote-recorder-top">
              <div>
                <p className="ote-kicker">Summary task</p>
                <h2>{selectedSet.topic}</h2>
              </div>
              <div className={`ote-recorder-timer is-${phase}`} aria-live="polite">
                <Timer size={22} aria-hidden="true" />
                <strong>{formatTime(secondsLeft)}</strong>
                <span>{phase === "recording" ? "Recording" : phase === "thinking" ? "Thinking" : phase === "listening" ? "Listening" : "Ready"}</span>
              </div>
            </div>

            <div className="ote-practice-instructions">
              <p className="ote-kicker">Instructions</p>
              <ul>
                {SUMMARY_INSTRUCTIONS.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>

            <div className="ote-practice-specific-prompt">
              <p>{selectedSet.prompt}</p>
            </div>
            <ul className="ote-practice-bullets">
              {selectedSet.requirements.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>

            {speakingId ? <p className="ote-speaking-status">Playing: {speakingId.replaceAll("-", " ")}</p> : null}
            {micError ? <p className="ote-mic-error">{micError}</p> : null}

            <div className="ote-recorder-actions">
              <button type="button" onClick={() => setNotesOpen((open) => !open)}>
                <NotebookTabs size={18} aria-hidden="true" />
                {notesOpen ? "Hide notes" : "Open notes"}
              </button>
              <button type="button" onClick={startTask} disabled={phase === "listening" || phase === "thinking" || phase === "recording"}>
                <Mic size={18} aria-hidden="true" />
                {phase === "listening" ? "Task running" : "Start task"}
              </button>
              {phase === "recording" && (
                <button type="button" onClick={stopRecordingNow}>
                  Stop recording
                </button>
              )}
              {phase === "listening" ? (
                <button type="button" onClick={skipToNextPhase}>
                  Skip to thinking
                </button>
              ) : null}
              {phase === "thinking" ? (
                <button type="button" onClick={skipToNextPhase}>
                  Skip to recording
                </button>
              ) : null}
            </div>
            {notesOpen ? (
              <NotesPanel
                value={notesDraft}
                onChange={setNotesDraft}
                onClose={() => setNotesOpen(false)}
              />
            ) : null}
          </article>
        )}

        {(complete || phase === "review") && (
          <section className="ote-practice-complete">
            <p className="ote-kicker">Practice complete</p>
            <h2>Review Your Summary</h2>
            <p>Listen back, download your recording, or generate feedback against the summary task.</p>
            <div className="ote-practice-complete-actions">
              <button
                className="ote-reference-download"
                type="button"
                onClick={() => createZipAndDownload(recordings, `ote-part-3-summary-${selectedSet.id}.zip`)}
                disabled={!recordings.length}
              >
                <Download size={18} aria-hidden="true" />
                Download ZIP
              </button>
              <button className="ote-training-primary-link" type="button" onClick={resetSet}>
                Try this set again
              </button>
              <button className="ote-training-primary-link" type="button" onClick={repeatTask}>
                Record again
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
              questions={[buildTaskText(selectedSet)]}
              title="OTE Part 3 summary feedback"
            />
            {recording ? (
              <div className="ote-recording-list">
                <article className="ote-recording-card">
                  <div>
                    <span>{recording.label}</span>
                    <strong>{recording.title}</strong>
                    <small>{recording.durationSeconds}s response window</small>
                  </div>
                  <audio controls playsInline preload="metadata" src={recording.url} />
                  <a href={recording.url} download={recording.name}>Download audio</a>
                </article>
              </div>
            ) : null}
          </section>
        )}
      </section>
    </main>
  );
}
