import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Download, Mic, NotebookTabs, Timer } from "lucide-react";
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

const SUMMARY_PRACTICE_SETS = [
  {
    id: "urban-green-spaces",
    title: "Urban Green Spaces",
    description: "Combine two expert views on how urban nature supports health and why access and quality matter.",
    topic: "urban green spaces",
    taskAudioSrc: "/audio/ote/speaking/advanced/part3-summary/urban-green-spaces-task.mp3",
    prompt:
      "Your tutor has asked you to summarize some research for your tutor group. Listen to two experts talking about research into urban green spaces. The two experts make the same two main points. You should:",
    requirements: [
      "combine the information from the two experts.",
      "summarize the two main points the experts make.",
    ],
    experts: [
      {
        label: "Expert 1",
        audioSrc: "/audio/ote/speaking/advanced/part3-summary/urban-green-spaces-expert-1.mp3",
        script:
          "A substantial body of research links urban green spaces with better health. People who spend time in parks, gardens or tree-lined areas often report lower stress and improved mood, and regular visits can encourage walking and other forms of physical activity. These effects may be especially valuable in crowded cities, where contact with nature offers relief from noise and pressure. Yet simply placing a park on a map is not enough. Green spaces are used more frequently when they feel safe, are easy to reach and contain features that suit local residents, such as paths, seating and shaded areas. Poorly maintained spaces may provide little benefit because people are unlikely to spend time there.",
        wordCount: 114,
      },
      {
        label: "Expert 2",
        audioSrc: "/audio/ote/speaking/advanced/part3-summary/urban-green-spaces-expert-2.mp3",
        script:
          "Cities are often assessed by how much green land they contain, but researchers argue that quality and access are just as important as total area. Contact with natural surroundings can reduce feelings of anxiety, support social interaction and create opportunities for exercise, all of which contribute to physical and mental well-being. However, these advantages depend on people being able and willing to use the space regularly. A large park far from residential neighbourhoods may be less useful than several smaller areas within walking distance. Good lighting, suitable facilities and careful maintenance also influence who visits. In short, urban nature can improve health, but planners need to consider how green spaces function in everyday life, not merely how much land is provided.",
        wordCount: 121,
      },
    ],
    teacherKey: {
      essentialContentPoints: [
        "Urban green spaces can improve mental and physical health by reducing stress, encouraging exercise and supporting social contact.",
        "Their benefits depend on usability rather than quantity alone: spaces must be accessible, safe, well maintained and suited to residents' needs.",
      ],
      wordCounts: {
        total: 235,
        expert1: 114,
        expert2: 121,
      },
    },
  },
  {
    id: "short-breaks",
    title: "Short Breaks",
    description: "Summarize two expert views on planned breaks, attention, and what makes a break useful.",
    topic: "taking short breaks",
    taskAudioSrc: "/audio/ote/speaking/advanced/part3-summary/short-breaks-task.mp3",
    prompt:
      "Your tutor has asked you to summarize some research for your tutor group. Listen to two experts talking about research into taking short breaks. The two experts make the same two main points. You should:",
    requirements: [
      "combine the information from the two experts.",
      "summarize the two main points the experts make.",
    ],
    experts: [
      {
        label: "Expert 1",
        audioSrc: "/audio/ote/speaking/advanced/part3-summary/short-breaks-expert-1.mp3",
        script:
          "Research into attention suggests that short breaks can make study and work more effective. When people concentrate for a long period, their performance often falls because the mind becomes less responsive to the task. In several experiments, participants who paused briefly returned with better focus and made fewer mistakes than those who continued without stopping. The nature of the break also seems important. A few minutes of walking, stretching or looking away from a screen can be useful, whereas checking messages may simply replace one demanding activity with another. Very long or frequent breaks can also interrupt progress, so the aim is not to avoid effort but to divide it into manageable periods.",
        wordCount: 113,
      },
      {
        label: "Expert 2",
        audioSrc: "/audio/ote/speaking/advanced/part3-summary/short-breaks-expert-2.mp3",
        script:
          "People sometimes assume that productive workers should remain at their desks continuously, but the evidence points in a different direction. Brief, planned pauses can restore attention and may help learners remember material more successfully, particularly during tasks that require sustained concentration. However, not every pause has the same effect. Researchers have found that light movement or a quiet change of activity is generally more refreshing than spending the break on social media, which continues to place demands on attention. Breaks also need to be kept under control: if they last too long or occur whenever a task becomes difficult, it may be harder to return to the original goal and maintain momentum.",
        wordCount: 112,
      },
    ],
    teacherKey: {
      essentialContentPoints: [
        "Brief, planned breaks can restore attention and improve performance or learning.",
        "The type and length of the break matter: light movement or a genuine mental rest is useful, whereas screen use and excessively long or frequent breaks may be counterproductive.",
      ],
      wordCounts: {
        total: 225,
        expert1: 113,
        expert2: 112,
      },
    },
  },
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

export default function OteSpeakingPart3SummaryPractice({ nativeRoutes = false, user = null, onRequireSignIn }) {
  const { setId } = useParams();
  const navigate = useNavigate();
  const { speakingId, playAudioFile, speak, stop } = useSpeech();
  const menuPath = getSitePath(nativeRoutes ? "/speaking" : "/ote/speaking");
  const rawBasePath = nativeRoutes ? "/speaking/part-3-summary/practice" : "/ote/speaking/part-3-summary/practice";
  const basePath = getSitePath(rawBasePath);
  const getSetPath = (id) => getSitePath(`${rawBasePath}/${id}`);
  const selectedSet = useMemo(() => SUMMARY_PRACTICE_SETS.find((item) => item.id === setId), [setId]);
  const completedProgress = useOteTrainingProgress();

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

  function buildAssignmentItem(set) {
    return {
      id: `ote.advanced.speaking.part3.practice.${set.id}`,
      variant: "advanced",
      category: "Speaking",
      label: `Part 3 Summary: ${set.title}`,
      routePath: getSetPath(set.id),
      progressId: `speaking.parts34.practice.${set.id}`,
      parentProgressId: "speaking.parts34.practice",
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
        mode: "summary_practice",
        setId: selectedSet.id,
        setTitle: selectedSet.title,
      });
    }
    setPhase("listening");
    setSecondsLeft(0);
    await playAudioFile("summary-instructions", OTE_SPEAKING_AUDIO.summaryAdvancedInstructions);
    if (skipListeningRef.current) return beginThinkingPhase(stream, { playCue: false });
    if (selectedSet.taskAudioSrc) {
      const played = await playAudioFile("summary-task", selectedSet.taskAudioSrc);
      if (!played) await speak("summary-task", `${selectedSet.prompt} ${selectedSet.requirements.join(" ")}`, 0.92);
    } else {
      await speak("summary-task", `${selectedSet.prompt} ${selectedSet.requirements.join(" ")}`, 0.92);
    }
    if (skipListeningRef.current) return beginThinkingPhase(stream, { playCue: false });
    await speak("summary-listen-cue", "Now listen to the two experts.", 0.94);
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
          mode: "summary_practice",
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
        <Seo title="OTE Advanced Speaking Part 3 Summary Practice | Seif English" description="Timed Advanced OTE speaking summary practice sets." />
        <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
          <ArrowLeft size={18} aria-hidden="true" />
          Back to speaking
        </button>
        <header className="ote-training-hero">
          <p className="ote-kicker">Advanced Speaking Part 3</p>
          <h1>Summary Practice</h1>
          <p>
            Choose a set, listen to two expert sources, make notes, then give one timed spoken summary that combines the shared ideas.
          </p>
        </header>
        <div className="ote-practice-set-grid">
          {SUMMARY_PRACTICE_SETS.map((set, index) => (
            <OteAssignableCard
              key={set.id}
              user={user}
              item={buildAssignmentItem(set)}
              className={`ote-practice-set-card ${completedProgress.has(`speaking.parts34.practice.${set.id}`) ? "is-complete" : ""}`}
              onClick={() => navigate(getSetPath(set.id))}
            >
              {completedProgress.has(`speaking.parts34.practice.${set.id}`) ? (
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

  return (
    <main className="ote-training-page">
      <Seo title={`${selectedSet.title} | OTE Summary Practice`} description="Timed OTE Advanced Speaking Part 3 summary practice." />
      <button className="ote-training-back" type="button" onClick={() => navigate(basePath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to summary sets
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Part 3 summary set</p>
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

            <section className="ote-summary-script-panel" aria-label="Source information">
              <p className="ote-kicker">Sources</p>
              <strong>Now listen to the two experts.</strong>
              <div className="ote-summary-source-list">
                {selectedSet.experts.map((expert) => (
                  <article key={expert.label}>
                    <span>{expert.label}</span>
                    <p>{expert.wordCount} words</p>
                  </article>
                ))}
              </div>
              <small>
                The transcript is hidden during the timed task. Use the audio and your notes to identify the two shared ideas.
              </small>
            </section>

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
