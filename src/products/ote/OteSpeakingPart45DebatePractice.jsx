import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Download, Mic, NotebookTabs, RotateCcw, Timer } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
import OteAssignButton from "./OteAssignButton.jsx";
import { useOteTrainingProgress } from "./utils/trainingProgress.js";
import "./styles/ote.css";

const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

const DEBATE_INSTRUCTIONS = [
  "You are going to take part in a debate.",
  "First read and listen to the task, then decide what you want to say.",
  "The clock shows how much time you have to speak.",
  "Start speaking when you hear the tone.",
];

const FOLLOW_UP_INSTRUCTIONS = [
  "You are going to answer four questions on the topic of your debate.",
  "You have 40 seconds to answer each question.",
  "Start speaking when you hear the tone.",
];

const DEBATE_REQUIREMENTS = [
  "use two or three of the ideas below to argue your case",
  "provide support for the ideas you choose",
  "give a conclusion",
];

const DEBATE_STATEMENT_LEAD_AUDIO = "/audio/ote/speaking/advanced/debate-prompts/your-tutor-statement.mp3";

const DEBATE_PRACTICE_SETS = [
  {
    id: "travel-environment",
    title: "Travel and Environment",
    description: "Debate international tourism, then answer follow-up questions about tourism, culture, and globalisation.",
    statement: "International tourism does more harm than good.",
    topic: "the impact of global tourism",
    followUpLead: "The topic of your debate was the impact of global tourism.",
    taskAudioSrc: "/audio/ote/speaking/advanced/debate-prompts/travel-environment-topic.mp3",
    followUpAudioSources: [
      "/audio/ote/speaking/advanced/debate-followups/travel-environment-q1.mp3",
      "/audio/ote/speaking/advanced/debate-followups/travel-environment-q2.mp3",
      "/audio/ote/speaking/advanced/debate-followups/travel-environment-q3.mp3",
      "/audio/ote/speaking/advanced/debate-followups/travel-environment-q4.mp3",
    ],
    mindMapIdeas: [
      "cultural preservation",
      "local businesses",
      "carbon footprint",
      "infrastructure damage",
      "global understanding",
    ],
    questions: [
      "The topic of your debate was the impact of global tourism. How likely is it that people will change their travel habits to protect the environment?",
      "Many historic cities are crowded with visitors. Should local governments restrict access to popular cultural landmarks?",
      "Do you agree that learning a foreign language is essential to truly understand another country's culture?",
      "Some people believe that global trade leads to a loss of national identity. What do you think?",
    ],
  },
  {
    id: "shopping-consumerism",
    title: "Shopping and Consumerism",
    description: "Debate a cashless society, then answer follow-up questions about spending, local shops, and money.",
    statement: "Physical cash should be completely phased out of society.",
    topic: "a cashless society",
    followUpLead: "The topic of your debate was a cashless society.",
    taskAudioSrc: "/audio/ote/speaking/advanced/debate-prompts/shopping-consumerism-topic.mp3",
    followUpAudioSources: [
      "/audio/ote/speaking/advanced/debate-followups/shopping-consumerism-q1.mp3",
      "/audio/ote/speaking/advanced/debate-followups/shopping-consumerism-q2.mp3",
      "/audio/ote/speaking/advanced/debate-followups/shopping-consumerism-q3.mp3",
      "/audio/ote/speaking/advanced/debate-followups/shopping-consumerism-q4.mp3",
    ],
    mindMapIdeas: [
      "financial fraud",
      "transaction speed",
      "digital exclusion",
      "privacy concerns",
      "bank fees",
    ],
    questions: [
      "The topic of your debate was a cashless society. Do you think a totally digital economy makes people spend more money than they should?",
      "Many people prefer to shop online rather than visit local markets. What are the consequences of this trend for small towns?",
      "How important is it for schools to teach children practical financial management and budgeting skills?",
      "Some people say that money cannot buy long-term happiness. What is your view?",
    ],
  },
  {
    id: "science-natural-world",
    title: "Science and the Natural World",
    description: "Debate science funding priorities, then answer follow-up questions about space, climate, and cooperation.",
    statement: "Governments should fund environmental protection over space exploration.",
    topic: "funding priorities for science and the environment",
    followUpLead: "The topic of your debate was funding priorities for science and the environment.",
    taskAudioSrc: "/audio/ote/speaking/advanced/debate-prompts/science-natural-world-topic.mp3",
    followUpAudioSources: [
      "/audio/ote/speaking/advanced/debate-followups/science-natural-world-q1.mp3",
      "/audio/ote/speaking/advanced/debate-followups/science-natural-world-q2.mp3",
      "/audio/ote/speaking/advanced/debate-followups/science-natural-world-q3.mp3",
      "/audio/ote/speaking/advanced/debate-followups/science-natural-world-q4.mp3",
    ],
    mindMapIdeas: [
      "climate change",
      "technological breakthroughs",
      "resource allocation",
      "national pride",
      "scientific discovery",
    ],
    questions: [
      "The topic of your debate was funding priorities for science and the environment. If private companies fund space missions, should they own what they discover?",
      "Many people feel powerless to combat global warming on an individual level. What actions should local communities take?",
      "Do you agree that international cooperation is vital for major scientific advancements?",
      "Some people say that we should remain entirely optimistic about the future of human civilization. What do you think?",
    ],
  },
];

function formatTime(seconds) {
  const safe = Math.max(0, Math.ceil(seconds || 0));
  const minutes = Math.floor(safe / 60);
  const remainingSeconds = safe % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function getSupportedMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function buildDebateTaskSpeech(set) {
  return [
    "Your tutor has asked you to take part in a class debate. You are going to put a case for or against the following statement:",
    set.statement,
    "Prepare your case for the debate. You should:",
    ...DEBATE_REQUIREMENTS,
    "You now have 45 seconds to prepare. You can make notes if you wish.",
  ].join(" ");
}

function buildDebateTopicSpeech(set) {
  return set.statement;
}

function buildSteps(set, mode) {
  if (!set) return [];
  const steps = [];
  if (mode !== "followups") {
    steps.push({
      id: "debate",
      kind: "debate",
      partId: "part-4",
      label: "Part 4 Debate",
      title: "Debate",
      prompt: buildDebateTaskSpeech(set),
      taskAudioSrc: set.taskAudioSrc,
      prepSeconds: 45,
      responseSeconds: 120,
    });
  }
  set.questions.forEach((prompt, index) => {
    steps.push({
      id: `follow-up-${index + 1}`,
      kind: "question",
      partId: "part-5",
      label: `Follow-up ${index + 1}`,
      title: `Question ${index + 1}`,
      prompt,
      audioSrc: set.followUpAudioSources?.[index],
      prepSeconds: 0,
      responseSeconds: 40,
    });
  });
  return steps;
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
      return new Promise((resolve) => window.setTimeout(resolve, Math.min(9000, Math.max(1600, String(text).length * 42))));
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

async function createZipAndDownload(files, zipName = "ote-debate-practice.zip") {
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
  const panelRef = useRef(null);
  const dragRef = useRef(null);
  const [position, setPosition] = useState(null);

  function clampPosition(left, top, width, height) {
    const margin = 12;
    const maxLeft = Math.max(margin, window.innerWidth - width - margin);
    const maxTop = Math.max(margin, window.innerHeight - height - margin);
    return {
      left: Math.min(Math.max(margin, left), maxLeft),
      top: Math.min(Math.max(margin, top), maxTop),
    };
  }

  function startDrag(event) {
    if (event.button !== 0 || !panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    dragRef.current = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    };
    setPosition(clampPosition(rect.left, rect.top, rect.width, rect.height));
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function moveDrag(event) {
    if (!dragRef.current) return;
    const { offsetX, offsetY, width, height } = dragRef.current;
    setPosition(clampPosition(event.clientX - offsetX, event.clientY - offsetY, width, height));
  }

  function stopDrag(event) {
    dragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  return (
    <aside
      ref={panelRef}
      className="ote-notes-panel"
      role="dialog"
      aria-label="Notes"
      style={position ? { left: `${position.left}px`, top: `${position.top}px`, right: "auto" } : undefined}
    >
      <div
        className="ote-notes-header"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      >
        <strong>Notes</strong>
        <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={onClose} aria-label="Close notes">x</button>
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

function NativeDebateMindMap({ set }) {
  return (
    <div className="ote-debate-map ote-native-debate-map" aria-label="Debate ideas">
      <div className="ote-debate-map-instructions">
        <p>Prepare your case for the debate. You should:</p>
        <ul>
          {DEBATE_REQUIREMENTS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>You now have 45 seconds to prepare. You can make notes if you wish.</p>
      </div>
      <div className="ote-debate-center">{set.statement}</div>
      {set.mindMapIdeas.map((idea, index) => (
        <div key={idea} className={`ote-debate-idea idea-${index + 1}`}>
          {idea}
        </div>
      ))}
    </div>
  );
}

export default function OteSpeakingPart45DebatePractice({ nativeRoutes = false, user = null, onRequireSignIn }) {
  const { setId } = useParams();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "followups" ? "followups" : "full";
  const navigate = useNavigate();
  const { speakingId, playAudioFile, speak, stop } = useSpeech();
  const menuPath = getSitePath(nativeRoutes ? "/speaking/parts-4-5-debate" : "/ote/speaking/parts-4-5-debate");
  const rawBasePath = nativeRoutes ? "/speaking/parts-4-5-debate/practice" : "/ote/speaking/parts-4-5-debate/practice";
  const basePath = getSitePath(rawBasePath);
  const getSetPath = (id, query = "") => getSitePath(`${rawBasePath}/${id}${query}`);
  const selectedSet = useMemo(() => DEBATE_PRACTICE_SETS.find((item) => item.id === setId), [setId]);
  const steps = useMemo(() => buildSteps(selectedSet, initialMode), [selectedSet, initialMode]);
  const completedProgress = useOteTrainingProgress();

  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState("ready");
  const [secondsLeft, setSecondsLeft] = useState(45);
  const [recordings, setRecordings] = useState([]);
  const [micError, setMicError] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const [part4FeedbackResult, setPart4FeedbackResult] = useState(null);
  const [part5FeedbackResult, setPart5FeedbackResult] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState("");
  const [feedbackError, setFeedbackError] = useState("");

  const streamRef = useRef(null);
  const activeRunStreamRef = useRef(null);
  const skipListeningRef = useRef(false);
  const skipThinkingRef = useRef(false);
  const autoStartNextStepRef = useRef(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const objectUrlsRef = useRef([]);
  const activityStartedRef = useRef(false);
  const activityCompletedRef = useRef(false);

  const activeStep = steps[stepIndex];
  const activeRecording = recordings.find((recording) => recording.stepId === activeStep?.id);
  const shouldRevealActiveStep = phase !== "ready" || Boolean(activeRecording);
  const complete = Boolean(selectedSet) && steps.length > 0 && recordings.length >= steps.length;
  const progressPercent = steps.length ? Math.round(((stepIndex + 1) / steps.length) * 100) : 0;
  const hasDebate = steps.some((step) => step.kind === "debate");
  const modeLabel = initialMode === "followups" ? "Follow-ups only" : "Debate + follow-ups";

  useEffect(() => {
    if (!complete || !selectedSet || activityCompletedRef.current) return;
    activityCompletedRef.current = true;
    logOteTrainingCompleted({
      section: "speaking",
      part: initialMode === "followups" ? "part-5" : "parts-4-5",
      mode: initialMode === "followups" ? "follow_up_practice" : "debate_follow_up_practice",
      setId: selectedSet.id,
      setTitle: selectedSet.title,
      recordingCount: recordings.length,
    });
  }, [complete, initialMode, recordings.length, selectedSet]);

  function buildAssignmentItem(set) {
    return {
      id: `ote.advanced.speaking.parts45.practice.${set.id}`,
      variant: "advanced",
      category: "Speaking",
      label: `Parts 4 and 5: ${set.title}`,
      routePath: getSetPath(set.id),
      progressId: `speaking.parts45.practice.${set.id}`,
      parentProgressId: "speaking.parts45.practice",
    };
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
    setStepIndex(0);
    setPhase("ready");
    setSecondsLeft(initialMode === "followups" ? 40 : 45);
    setRecordings([]);
    setMicError("");
    setNotesOpen(false);
    setNotesDraft("");
    setPart4FeedbackResult(null);
    setPart5FeedbackResult(null);
    setFeedbackError("");
    activeRunStreamRef.current = null;
    skipListeningRef.current = false;
    skipThinkingRef.current = false;
    autoStartNextStepRef.current = false;
    activityStartedRef.current = false;
    activityCompletedRef.current = false;
    stop();
  }, [setId, initialMode]);

  useEffect(() => {
    if (!autoStartNextStepRef.current || phase !== "ready" || activeRecording || !activeStep) return;
    autoStartNextStepRef.current = false;
    startStep();
  }, [stepIndex, phase, activeStep, activeRecording]);

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
      console.warn("[OTE debate practice] microphone access failed", error);
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

  async function startStep() {
    stop();
    if (!selectedSet || !activeStep || ["listening", "thinking", "recording"].includes(phase)) return;
    const stream = await ensureStream();
    if (!stream) return;
    activeRunStreamRef.current = stream;
    skipListeningRef.current = false;
    skipThinkingRef.current = false;
    if (!activityStartedRef.current) {
      activityStartedRef.current = true;
      logOteTrainingStarted({
        section: "speaking",
        part: initialMode === "followups" ? "part-5" : "parts-4-5",
        mode: initialMode === "followups" ? "follow_up_practice" : "debate_follow_up_practice",
        setId: selectedSet.id,
        setTitle: selectedSet.title,
        taskCount: steps.length,
      });
    }
    setPhase("listening");
    setSecondsLeft(0);
    if (activeStep.kind === "debate") {
      await playAudioFile("debate-instructions", OTE_SPEAKING_AUDIO.debateAdvancedInstructions);
      if (skipListeningRef.current) return beginThinkingPhase(stream, activeStep, { playCue: false });
      const playedLeadAudio = await playAudioFile("debate-statement-lead", DEBATE_STATEMENT_LEAD_AUDIO);
      if (!playedLeadAudio) {
        await speak(
          "debate-statement-lead",
          "Your tutor has asked you to take part in a class debate. You are going to put a case for or against the following statement:",
          0.92
        );
      }
      if (skipListeningRef.current) return beginThinkingPhase(stream, activeStep, { playCue: false });
      const playedTopicAudio = await playAudioFile("debate-topic", activeStep.taskAudioSrc);
      if (!playedTopicAudio) await speak("debate-topic", buildDebateTopicSpeech(selectedSet), 0.92);
      if (skipListeningRef.current) return beginThinkingPhase(stream, activeStep, { playCue: false });
      beginThinkingPhase(stream, activeStep);
    } else {
      if (stepIndex === (hasDebate ? 1 : 0)) {
        await playAudioFile("follow-up-instructions", OTE_SPEAKING_AUDIO.followUpAdvancedInstructions);
        if (skipListeningRef.current) {
          skipListeningRef.current = false;
          startRecording(stream, activeStep);
          return;
        }
      }
      const playedQuestionAudio = await playAudioFile(activeStep.id, activeStep.audioSrc);
      if (!playedQuestionAudio) await speak(activeStep.id, activeStep.prompt, 0.94);
      if (skipListeningRef.current) {
        skipListeningRef.current = false;
        startRecording(stream, activeStep);
        return;
      }
      startRecording(stream, activeStep);
    }
  }

  async function beginThinkingPhase(stream, step, { playCue = true } = {}) {
    skipListeningRef.current = false;
    skipThinkingRef.current = false;
    setPhase("thinking");
    setSecondsLeft(step.prepSeconds);
    if (playCue) await playAudioFile("debate-prepare", OTE_SPEAKING_AUDIO.debatePrepareInstructions);
    if (skipThinkingRef.current) return;
    startCountdown(step.prepSeconds, "thinking", () => startRecording(stream, step));
  }

  function startRecording(stream, step) {
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
        ...current.filter((recording) => recording.stepId !== step.id),
        {
          id: step.id,
          stepId: step.id,
          partId: step.partId,
          label: step.label,
          title: step.title,
          prompt: step.prompt,
          durationSeconds: step.responseSeconds,
          notes: notesDraft,
          blob,
          url,
          name: `ote-${step.partId}-${selectedSet.id}-${step.id}.webm`,
        },
      ]);
      setPhase("review");
      setSecondsLeft(0);
    };
    recorder.start();
    startCountdown(step.responseSeconds, "recording", () => {
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
      startRecording(activeRunStreamRef.current || streamRef.current, activeStep);
      return;
    }
    if (phase === "recording") stopRecordingNow();
  }

  function repeatActiveStep() {
    if (!activeStep) return;
    clearTimer();
    stop();
    const recording = recordings.find((item) => item.stepId === activeStep.id);
    if (recording?.url) URL.revokeObjectURL(recording.url);
    objectUrlsRef.current = objectUrlsRef.current.filter((url) => url !== recording?.url);
    setRecordings((current) => current.filter((item) => item.stepId !== activeStep.id));
    setPhase("ready");
    setSecondsLeft(activeStep.prepSeconds || activeStep.responseSeconds || 40);
    activeRunStreamRef.current = null;
    skipListeningRef.current = false;
    skipThinkingRef.current = false;
    setPart4FeedbackResult(null);
    setPart5FeedbackResult(null);
    setFeedbackError("");
  }

  function goNext() {
    stop();
    if (stepIndex < steps.length - 1) {
      const nextStep = steps[stepIndex + 1];
      autoStartNextStepRef.current = nextStep.kind === "question";
      setStepIndex((index) => index + 1);
      setPhase("ready");
      setSecondsLeft(nextStep.prepSeconds || nextStep.responseSeconds || 40);
      return;
    }
    setPhase("complete");
    if (!activityCompletedRef.current) {
      activityCompletedRef.current = true;
      logOteTrainingCompleted({
        section: "speaking",
        part: initialMode === "followups" ? "part-5" : "parts-4-5",
        mode: initialMode === "followups" ? "follow_up_practice" : "debate_follow_up_practice",
        setId: selectedSet.id,
        setTitle: selectedSet.title,
        recordingCount: recordings.length,
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
    setStepIndex(0);
    setPhase("ready");
    setSecondsLeft(initialMode === "followups" ? 40 : 45);
    setMicError("");
    setNotesOpen(false);
    setNotesDraft("");
    setPart4FeedbackResult(null);
    setPart5FeedbackResult(null);
    setFeedbackError("");
    activeRunStreamRef.current = null;
    skipListeningRef.current = false;
    skipThinkingRef.current = false;
    autoStartNextStepRef.current = false;
    stop();
  }

  async function handleGenerateFeedback(partId) {
    if (!user) {
      onRequireSignIn?.();
      setFeedbackError("Sign in to generate OTE speaking feedback.");
      return;
    }
    setFeedbackLoading(partId);
    setFeedbackError("");
    try {
      const partSteps = partId === "part-4"
        ? steps.filter((step) => step.partId === "part-4")
        : steps.filter((step) => step.partId === "part-5");
      const orderedRecordings = partSteps
        .map((step) => recordings.find((recording) => recording.stepId === step.id))
        .filter(Boolean);
      const feedbackAudio = await recordingsToFeedbackAudio(orderedRecordings, `ote-${partId}-${selectedSet.id}`);
      const task = partId === "part-4"
        ? {
            id: `${selectedSet.id}-debate`,
            title: `${selectedSet.title} debate`,
            instructions: DEBATE_INSTRUCTIONS,
            statement: selectedSet.statement,
            requirements: DEBATE_REQUIREMENTS,
            mindMapIdeas: selectedSet.mindMapIdeas,
          }
        : {
            id: `${selectedSet.id}-follow-ups`,
            title: `${selectedSet.title} follow-ups`,
            instructions: FOLLOW_UP_INSTRUCTIONS,
            topic: selectedSet.topic,
          };
      const result = await requestOteSpeakingFeedback({
        partId,
        task,
        recordings: feedbackAudio,
      });
      if (partId === "part-4") setPart4FeedbackResult(result);
      else setPart5FeedbackResult(result);
      await saveSpeakingAiFeedback({
        product: "ote",
        part: partId,
        taskId: task.id,
        taskTitle: task.title,
        questions: partSteps.map((step) => step.prompt),
        transcripts: result?.transcripts || [],
        feedback: result?.feedback,
        meta: result?.meta || null,
      });
    } catch (error) {
      console.error(`[OTE ${partId} feedback] failed`, error);
      setFeedbackError(error?.message || "Could not generate feedback right now.");
    } finally {
      setFeedbackLoading("");
    }
  }

  if (!selectedSet) {
    return (
      <main className="ote-training-page ote-debate-practice-page">
        <Seo title="OTE Advanced Speaking Parts 4 and 5 Practice | Seif English" description="Advanced OTE debate and follow-up question practice." />
        <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
          <ArrowLeft size={18} aria-hidden="true" />
          Back to speaking
        </button>
        <header className="ote-training-hero">
          <p className="ote-kicker">Advanced Speaking Parts 4 and 5</p>
          <h1>Debate and Follow-up Practice</h1>
          <p>
            Choose a debate set. Start with Part 4 to practise the full flow, or jump straight to Part 5 follow-up questions.
          </p>
        </header>
        <div className="ote-practice-set-grid">
          {DEBATE_PRACTICE_SETS.map((set, index) => (
            <article
              className={`ote-practice-set-card ote-debate-set-card ${completedProgress.has(`speaking.parts45.practice.${set.id}`) ? "is-complete" : ""}`}
              key={set.id}
            >
              <OteAssignButton user={user} item={buildAssignmentItem(set)} className="ote-assign-btn ote-assign-card-btn" />
              {completedProgress.has(`speaking.parts45.practice.${set.id}`) ? (
                <CheckCircle2 className="ote-training-complete-icon" size={22} aria-label="Completed" />
              ) : null}
              <span>Set {index + 1}</span>
              <h2>{set.title}</h2>
              <p>{set.description}</p>
              <div className="ote-debate-set-actions">
                <button type="button" onClick={() => navigate(getSetPath(set.id))}>
                  Debate + follow-ups
                </button>
                <button type="button" onClick={() => navigate(getSetPath(set.id, "?mode=followups"))}>
                  Follow-ups only
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="ote-training-page ote-debate-practice-page">
      <Seo title={`${selectedSet.title} | OTE Debate Practice`} description="Timed OTE Advanced Speaking Parts 4 and 5 practice." />
      <button className="ote-training-back" type="button" onClick={() => navigate(basePath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to debate sets
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">{modeLabel}</p>
        <h1>{selectedSet.title}</h1>
        <p>
          {initialMode === "followups"
            ? "Answer four follow-up questions on the topic of the debate, with 40 seconds for each response."
            : "Prepare and record a two-minute debate response, then answer four related follow-up questions."}
        </p>
      </header>

      <section className="ote-practice-runner">
        <div className="ote-practice-progress" aria-label="Parts 4 and 5 progress">
          <div>
            <span>{activeStep?.partId === "part-4" ? "Part 4" : "Part 5"}</span>
            <strong>
              {activeStep?.label || "Step"} of {steps.length}
            </strong>
          </div>
          <div className="ote-practice-progress-bar" aria-hidden="true">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {!complete && activeStep ? (
          <article className="ote-practice-task-card">
            <div className="ote-recorder-top">
              <div>
                <p className="ote-kicker">{activeStep.label}</p>
                <h2>{activeStep.kind === "debate" && shouldRevealActiveStep ? selectedSet.statement : activeStep.title}</h2>
              </div>
              <div className={`ote-recorder-timer is-${phase}`} aria-live="polite">
                <Timer size={22} aria-hidden="true" />
                <strong>{formatTime(secondsLeft)}</strong>
                <span>{phase === "recording" ? "Recording" : phase === "thinking" ? "Thinking" : phase === "listening" ? "Listening" : phase === "review" ? "Review" : "Ready"}</span>
              </div>
            </div>

            {shouldRevealActiveStep ? (
              activeStep.kind === "debate" ? (
                <NativeDebateMindMap set={selectedSet} />
              ) : (
                <>
                  <div className="ote-practice-instructions">
                    <p className="ote-kicker">Instructions</p>
                    <ul>
                      {FOLLOW_UP_INSTRUCTIONS.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )
            ) : (
              <div className="ote-practice-hidden-task">
                <p className="ote-kicker">Task hidden</p>
                <p>
                  Press Start task when you are ready. The task materials will be shown and read at
                  the start of this step.
                </p>
              </div>
            )}

            {speakingId ? <p className="ote-speaking-status">Playing: {speakingId.replaceAll("-", " ")}</p> : null}
            {micError ? <p className="ote-mic-error">{micError}</p> : null}

            <div className="ote-recorder-actions">
              <button type="button" onClick={() => setNotesOpen((open) => !open)}>
                <NotebookTabs size={18} aria-hidden="true" />
                {notesOpen ? "Hide notes" : "Open notes"}
              </button>
              {!activeRecording ? (
                <button type="button" onClick={startStep} disabled={phase === "listening" || phase === "thinking" || phase === "recording"}>
                  <Mic size={18} aria-hidden="true" />
                  {phase === "listening" ? "Task running" : "Start task"}
                </button>
              ) : null}
              {phase === "recording" ? (
                <button type="button" onClick={stopRecordingNow}>
                  Stop recording
                </button>
              ) : null}
              {phase === "listening" ? (
                <button type="button" onClick={skipToNextPhase}>
                  {activeStep.kind === "debate" ? "Skip to thinking" : "Skip to recording"}
                </button>
              ) : null}
              {phase === "thinking" ? (
                <button type="button" onClick={skipToNextPhase}>
                  Skip to recording
                </button>
              ) : null}
            </div>

            {notesOpen ? (
              <NotesPanel value={notesDraft} onChange={setNotesDraft} onClose={() => setNotesOpen(false)} />
            ) : null}

            {activeRecording ? (
              <div className="ote-training-recording-review">
                <div className="ote-training-review-playback">
                  <div>
                    <strong>{activeStep.label} recording</strong>
                    <span>Listen back before moving on.</span>
                  </div>
                  <audio controls playsInline preload="metadata" src={activeRecording.url} />
                </div>
                <div className="ote-training-review-actions">
                  <button className="ote-review-primary-action" type="button" onClick={goNext}>
                    <CheckCircle2 size={20} aria-hidden="true" />
                    {stepIndex < steps.length - 1
                      ? steps[stepIndex + 1]?.kind === "question" ? "Next question" : "Next task"
                      : "Finish set"}
                  </button>
                  <div className="ote-training-review-secondary-actions">
                    <button className="ote-review-secondary-action" type="button" onClick={repeatActiveStep}>
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
            ) : null}
          </article>
        ) : null}

        {(complete || phase === "complete") ? (
          <section className="ote-practice-complete">
            <p className="ote-kicker">Practice complete</p>
            <h2>{initialMode === "followups" ? "Review Your Follow-up Practice" : "Review Your Debate Practice"}</h2>
            <p>Play back your recordings, download the set, or generate focused feedback.</p>
            <div className="ote-practice-complete-actions">
              <button
                className="ote-reference-download"
                type="button"
                onClick={() => createZipAndDownload(recordings, `ote-parts-4-5-${selectedSet.id}.zip`)}
                disabled={!recordings.length}
              >
                <Download size={18} aria-hidden="true" />
                Download ZIP
              </button>
              <button className="ote-training-primary-link" type="button" onClick={resetSet}>
                Try this set again
              </button>
              <button className="ote-training-primary-link" type="button" onClick={repeatActiveStep}>
                Record current task again
              </button>
              {hasDebate ? (
                <button
                  className="ote-training-primary-link"
                  type="button"
                  onClick={() => handleGenerateFeedback("part-4")}
                  disabled={!recordings.some((recording) => recording.partId === "part-4") || feedbackLoading === "part-4"}
                >
                  {feedbackLoading === "part-4" ? "Generating debate feedback..." : "Get Part 4 feedback"}
                </button>
              ) : null}
              <button
                className="ote-training-primary-link"
                type="button"
                onClick={() => handleGenerateFeedback("part-5")}
                disabled={!recordings.some((recording) => recording.partId === "part-5") || feedbackLoading === "part-5"}
              >
                {feedbackLoading === "part-5" ? "Generating follow-up feedback..." : "Get Part 5 feedback"}
              </button>
            </div>
            {feedbackError ? <p className="ote-mic-error">{feedbackError}</p> : null}
            <SpeakingFeedbackPanel
              feedbackResult={part4FeedbackResult}
              questions={steps.filter((step) => step.partId === "part-4").map((step) => step.prompt)}
              title="OTE Part 4 debate feedback"
            />
            <SpeakingFeedbackPanel
              feedbackResult={part5FeedbackResult}
              questions={steps.filter((step) => step.partId === "part-5").map((step) => step.prompt)}
              title="OTE Part 5 follow-up feedback"
            />
            <div className="ote-recording-list">
              {recordings.map((recording) => (
                <article key={recording.stepId} className="ote-recording-card">
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
        ) : null}
      </section>
    </main>
  );
}
