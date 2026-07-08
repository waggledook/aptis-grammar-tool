import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Download, Mic, RotateCcw, Timer } from "lucide-react";
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
const VOICEMAIL_INSTRUCTIONS = [
  "First read and listen to the task, then decide what you want to say.",
  "The clock shows how much time you have to speak.",
  "Start speaking when you hear the tone.",
];
const ADVANCED_VOICEMAIL_INSTRUCTIONS = [
  "You are going to leave a voice message.",
  "First read and listen to the task, then decide what you want to say.",
  "You need to be diplomatic in your response.",
  "You have 40 seconds to leave your voice message.",
  "Start speaking when you hear the tone.",
];

const PRACTICE_SETS = [
  {
    id: "set-1",
    title: "Public Transportation and Dinner Plans",
    description: "A polite lost-property message and a friendly dinner reply.",
    tasks: [
      {
        id: "set-1-message-1",
        type: "message-1",
        label: "Message 1",
        title: "Lost Laptop on a Bus",
        audience: "Customer service manager",
        taskAudioSrc: "/audio/ote/speaking/part2-prompts/set1-message1.mp3",
        lead:
          "You left your laptop on a city bus this morning on your way to work. Leave a voicemail message for the customer service manager at the bus company.",
        bullets: [
          "say who you are and what time you were traveling",
          "describe your laptop and where you think you left it",
          "ask how you can find out if someone turned it in",
        ],
      },
      {
        id: "set-1-message-2",
        type: "message-2",
        label: "Message 2",
        title: "Dinner Plans",
        audience: "Friend",
        taskAudioSrc: "/audio/ote/speaking/part2-prompts/set1-message2.mp3",
        incomingAudioSrc: "/audio/ote/speaking/part2-incoming/tom.mp3",
        lead:
          "Listen to a message from your friend about cooking dinner tonight. Then, leave a voicemail message for your friend.",
        friendMessage:
          "Hey, it's Tom. I know we were planning to order food tonight, but I've decided to cook a huge Mexican dinner at my place instead! I'm planning to make it really spicy. Let me know if that sounds good to you or if you have any issues with that, OK? See ya!",
        bullets: [
          "accept your friend's invitation for dinner",
          "explain why you cannot eat spicy food",
          "suggest something sweet to bring for dessert",
        ],
      },
    ],
  },
  {
    id: "set-2",
    title: "Language Schools and Weekend Sports",
    description: "A polite class-change message and a friendly sports-plan reply.",
    tasks: [
      {
        id: "set-2-message-1",
        type: "message-1",
        label: "Message 1",
        title: "Change an Evening Class",
        audience: "School admissions coordinator",
        taskAudioSrc: "/audio/ote/speaking/part2-prompts/set2-message1.mp3",
        lead:
          "You are taking an evening English course, but you need to change your class from Tuesday to Thursday. Leave a voicemail message for the school admissions coordinator.",
        bullets: [
          "say who you are and give the name of your current class",
          "explain why your work schedule has changed",
          "ask if there is a free space for you in the Thursday group",
        ],
      },
      {
        id: "set-2-message-2",
        type: "message-2",
        label: "Message 2",
        title: "Weekend Sports",
        audience: "Friend",
        taskAudioSrc: "/audio/ote/speaking/part2-prompts/set2-message2.mp3",
        incomingAudioSrc: "/audio/ote/speaking/part2-incoming/sarah.mp3",
        lead:
          "Listen to a message from your friend about a sports activity this weekend. Then, leave a voicemail message for your friend.",
        friendMessage:
          "Hi, it's Sarah. A few of us are planning to go down to the park this Saturday morning around nine to play a few games of tennis. I know you've been wanting to play lately, so do you fancy joining us? Give me a call back when you can. Bye!",
        bullets: [
          "say why you cannot play tennis on Saturday morning",
          "ask some questions about the weather forecast",
          "suggest a different day or time to play",
        ],
      },
    ],
  },
  {
    id: "set-3",
    title: "Music Shops and Concert Tickets",
    description: "A polite product-damage message and a friendly ticket reply.",
    tasks: [
      {
        id: "set-3-message-1",
        type: "message-1",
        label: "Message 1",
        title: "Broken Guitar Strings",
        audience: "Shop manager",
        taskAudioSrc: "/audio/ote/speaking/part2-prompts/set3-message1.mp3",
        lead:
          "You recently bought a guitar from an online shop, but when it arrived, the strings were broken. Leave a voicemail message for the shop manager.",
        bullets: [
          "say who you are and when you ordered the item",
          "describe the damage to the item when you opened it",
          "ask how you can return it for a replacement or a refund",
        ],
      },
      {
        id: "set-3-message-2",
        type: "message-2",
        label: "Message 2",
        title: "Concert Tickets",
        audience: "Friend",
        taskAudioSrc: "/audio/ote/speaking/part2-prompts/set3-message2.mp3",
        incomingAudioSrc: "/audio/ote/speaking/part2-incoming/jack.mp3",
        lead:
          "Listen to a message from your friend about concert tickets. Then, leave a voicemail message for your friend.",
        friendMessage:
          "Hey, Jack here. Listen, I'm looking at the ticket website right now for that rock concert next month. The front-row seats are still available, but they are quite expensive at eighty pounds each. Do you want me to book them right now before they sell out? Let me know. Bye.",
        bullets: [
          "thank your friend for finding the tickets",
          "explain why you cannot afford the expensive seats",
          "suggest a cheaper seating option or a different event",
        ],
      },
    ],
  },
  {
    id: "set-4",
    title: "Community Gyms and Study Sessions",
    description: "A polite class-list problem message and a friendly study reply.",
    tasks: [
      {
        id: "set-4-message-1",
        type: "message-1",
        label: "Message 1",
        title: "Missing from the Class List",
        audience: "Sports centre coordinator",
        taskAudioSrc: "/audio/ote/speaking/part2-prompts/set4-message1.mp3",
        lead:
          "You signed up for a swimming class at a local sports center, but your name is missing from the student attendance list. Leave a voicemail message for the sports center coordinator.",
        bullets: [
          "say who you are and which day your class is on",
          "explain the error you saw on the notice board today",
          "ask how they can correct the problem before the class starts",
        ],
      },
      {
        id: "set-4-message-2",
        type: "message-2",
        label: "Message 2",
        title: "Study Session",
        audience: "Friend",
        taskAudioSrc: "/audio/ote/speaking/part2-prompts/set4-message2.mp3",
        incomingAudioSrc: "/audio/ote/speaking/part2-incoming/amy.mp3",
        lead:
          "Listen to a message from your friend about preparing for a test. Then, leave a voicemail message for your friend.",
        friendMessage:
          "Hi, it's Amy. Look, I'm getting a bit stressed about our final history exam next week. I thought we could meet up at the high street cafe tomorrow afternoon to go over our notes together. Let me know if that works for you or if you have a better idea. Speak soon!",
        bullets: [
          "tell your friend why you are also worried about the test",
          "explain why you prefer studying at the library instead of a cafe",
          "suggest a specific day and time to meet up",
        ],
      },
    ],
  },
  {
    id: "set-5",
    title: "Holiday Bookings and Birthday Parties",
    description: "A polite booking-change message and a friendly party-planning reply.",
    tasks: [
      {
        id: "set-5-message-1",
        type: "message-1",
        label: "Message 1",
        title: "Change a Hotel Check-in Date",
        audience: "Hotel reception manager",
        taskAudioSrc: "/audio/ote/speaking/part2-prompts/set5-message1.mp3",
        lead:
          "You recently booked a weekend stay at a hotel online. However, you need to change your check-in date to one day later. Leave a voicemail message for the hotel reception manager.",
        bullets: [
          "say who you are and when you are supposed to arrive",
          "explain why you have to delay your trip by one day",
          "ask if it is possible to change your reservation without a fee",
        ],
      },
      {
        id: "set-5-message-2",
        type: "message-2",
        label: "Message 2",
        title: "Joint Birthday Party",
        audience: "Friend",
        taskAudioSrc: "/audio/ote/speaking/part2-prompts/set5-message2.mp3",
        incomingAudioSrc: "/audio/ote/speaking/part2-incoming/sam.mp3",
        lead:
          "Listen to a message from your friend about a joint birthday party next month. Then, leave a voicemail message for your friend.",
        friendMessage:
          "Hi, it's Sam. We said we were going to discuss the best place for our joint birthday party next month. I think the Italian restaurant on the High Street would be perfect. Let me know what you think about that or where you'd like to go, OK? Thanks.",
        bullets: [
          "thank your friend for thinking of a venue",
          "explain why you do not want to have the party at a restaurant",
          "say which place you prefer for the party and why",
        ],
      },
    ],
  },
];

const ADVANCED_PRACTICE_SETS = [
  {
    id: "advanced-set-1",
    title: "Tutor Assignment Request",
    description: "Diplomatically respond to a tutor who wants to share your assignment.",
    tasks: [
      {
        id: "advanced-set-1-message",
        type: "advanced-diplomatic",
        label: "Voice message",
        title: "Assignment Example",
        audience: "Tutor",
        taskAudioSrc: "/audio/ote/speaking/advanced/part2-prompts/advanced-set-1-message.mp3",
        lead:
          "You study at college. Your tutor, Dr Evans, has asked for permission to show your recent assignment to other students as an example. Your tutor would like to use it in next week's class. The assignment contains some personal information, so you do not want the current version to be shared. Leave a voice message for your tutor and:",
        bullets: [
          "thank her for choosing your work",
          "explain your concern",
          "suggest a possible solution",
        ],
        prepSeconds: 10,
        responseSeconds: 40,
      },
    ],
  },
  {
    id: "advanced-set-2",
    title: "Study Room Meeting",
    description: "Ask another student to move a meeting without creating conflict.",
    tasks: [
      {
        id: "advanced-set-2-message",
        type: "advanced-diplomatic",
        label: "Voice message",
        title: "Silent Study Room",
        audience: "Student society organiser",
        taskAudioSrc: "/audio/ote/speaking/advanced/part2-prompts/advanced-set-2-message.mp3",
        lead:
          "You study at college. A student you know, Maya, has arranged a society meeting in a study room tomorrow. You have discovered that the room is reserved for silent study, and the meeting may disturb other students. The college has recently received complaints about noise in this area. Leave a voice message for Maya and:",
        bullets: [
          "explain why you are calling",
          "ask her to change the location",
          "suggest a suitable alternative",
        ],
        prepSeconds: 10,
        responseSeconds: 40,
      },
    ],
  },
  {
    id: "advanced-set-3",
    title: "Short-notice Saturday Shift",
    description: "Respond tactfully to a manager about a difficult schedule change.",
    tasks: [
      {
        id: "advanced-set-3-message",
        type: "advanced-diplomatic",
        label: "Voice message",
        title: "Saturday Work Request",
        audience: "Manager",
        taskAudioSrc: "/audio/ote/speaking/advanced/part2-prompts/advanced-set-3-message.mp3",
        lead:
          "You work for a company. Your manager, Karen Willis, has changed your work schedule at short notice and asked you to work on Saturday. The change was made because several employees are ill during a particularly busy week. You have an important personal commitment that day. Leave a voice message for your manager and:",
        bullets: [
          "acknowledge why the company needs extra staff",
          "explain why Saturday is difficult for you",
          "suggest a compromise",
        ],
        prepSeconds: 10,
        responseSeconds: 40,
      },
    ],
  },
  {
    id: "advanced-set-4",
    title: "Client Report Figures",
    description: "Ask a colleague to delay a report because figures may be inaccurate.",
    tasks: [
      {
        id: "advanced-set-4-message",
        type: "advanced-diplomatic",
        label: "Voice message",
        title: "Report Accuracy Concern",
        audience: "Colleague",
        taskAudioSrc: "/audio/ote/speaking/advanced/part2-prompts/advanced-set-4-message.mp3",
        lead:
          "You work for a company. Your colleague, Marcus, plans to send a report to a client this afternoon. You have noticed that some of the cost figures may be inaccurate, but Marcus believes the report should be sent immediately. The information could influence the client's decision. Leave a voice message for Marcus and:",
        bullets: [
          "explain why you are concerned",
          "ask him to delay sending the report",
          "suggest how you can check it quickly",
        ],
        prepSeconds: 10,
        responseSeconds: 40,
      },
    ],
  },
  {
    id: "advanced-set-5",
    title: "Training a New Employee",
    description: "Suggest a practical arrangement when two work responsibilities conflict.",
    tasks: [
      {
        id: "advanced-set-5-message",
        type: "advanced-diplomatic",
        label: "Voice message",
        title: "Training Schedule",
        audience: "Manager",
        taskAudioSrc: "/audio/ote/speaking/advanced/part2-prompts/advanced-set-5-message.mp3",
        lead:
          "You work for a company. Your manager, Ms Patel, has asked you to train a new employee throughout next week. You are willing to help, but you also have an urgent project to finish by Friday. No other experienced employee is available for the whole week. Leave a voice message for your manager and:",
        bullets: [
          "show that you understand the importance of the training",
          "explain your difficulty",
          "suggest a different arrangement",
        ],
        prepSeconds: 10,
        responseSeconds: 40,
      },
    ],
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

function buildTaskSpeech(task) {
  return `${task.lead} In your message, you should: ${task.bullets.join("; ")}.`;
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

  function speak(id, text) {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      return new Promise((resolve) => window.setTimeout(resolve, Math.min(4200, Math.max(1600, String(text).length * 48))));
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
      finishRef.current = () => {
        finish();
        return false;
      };
      utterance.lang = "en-GB";
      utterance.rate = 0.94;
      utterance.onend = finish;
      utterance.onerror = finish;
      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    });
  }

  async function playCueThenSpeak(id, cueSrc, text) {
    await playAudioFile(`${id}-cue`, cueSrc);
    return speak(id, text);
  }

  function stop() {
    finishRef.current?.(false);
    finishRef.current = null;
    audioRef.current?.pause();
    audioRef.current = null;
    window.speechSynthesis?.cancel();
    setSpeakingId("");
  }

  return { speakingId, playAudioFile, playCueThenSpeak, speak, stop };
}

async function createZipAndDownload(files, zipName = "ote-voicemail-practice.zip") {
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

export default function OteSpeakingPart2Practice({ nativeRoutes = false, user = null, onRequireSignIn }) {
  const { setId } = useParams();
  const navigate = useNavigate();
  const { speakingId, playAudioFile, playCueThenSpeak, speak, stop } = useSpeech();
  const menuPath = getSitePath(nativeRoutes ? "/speaking/part-2-voicemails" : "/ote/speaking/part-2-voicemails");
  const rawBasePath = nativeRoutes ? "/speaking/part-2-voicemails/practice" : "/ote/speaking/part-2-voicemails/practice";
  const basePath = getSitePath(rawBasePath);
  const getSetPath = (id) => getSitePath(`${rawBasePath}/${id}`);
  const isAdvanced = user?.oteVersion === "advanced";
  const activeSets = isAdvanced ? ADVANCED_PRACTICE_SETS : PRACTICE_SETS;
  const activeInstructions = isAdvanced ? ADVANCED_VOICEMAIL_INSTRUCTIONS : VOICEMAIL_INSTRUCTIONS;
  const selectedSet = useMemo(() => activeSets.find((item) => item.id === setId), [activeSets, setId]);
  const completedProgress = useOteTrainingProgress();

  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState("ready");
  const [secondsLeft, setSecondsLeft] = useState(20);
  const [recordings, setRecordings] = useState([]);
  const [micError, setMicError] = useState("");
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

  const activeTask = selectedSet?.tasks?.[activeIndex];
  const complete = selectedSet && recordings.length >= selectedSet.tasks.length;
  const assignmentVariant = isAdvanced ? "advanced" : "general";
  const getPrepSeconds = (task) => task?.prepSeconds || (isAdvanced ? 10 : 20);

  function buildAssignmentItem(set) {
    return {
      id: `ote.${assignmentVariant}.speaking.part2.practice.${set.id}`,
      variant: assignmentVariant,
      category: "Speaking",
      label: `Part 2: ${set.title}`,
      routePath: getSetPath(set.id),
      progressId: `speaking.part2.practice.${set.id}`,
      parentProgressId: "speaking.part2.practice",
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
    setActiveIndex(0);
    setPhase("ready");
    setSecondsLeft(getPrepSeconds(activeSets.find((set) => set.id === setId)?.tasks?.[0]));
    setRecordings([]);
    setMicError("");
    setFeedbackResult(null);
    setFeedbackError("");
    activeRunStreamRef.current = null;
    skipListeningRef.current = false;
    skipThinkingRef.current = false;
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
    activityStartedRef.current = false;
    activityCompletedRef.current = false;
    stop();
  }, [setId, isAdvanced]);

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
      console.warn("[OTE practice] microphone access failed", error);
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

  async function beginThinkingPhase(stream, { playCue = true } = {}) {
    if (!stream) return;
    skipThinkingRef.current = false;
    setPhase("thinking");
    setSecondsLeft(getPrepSeconds(activeTask));
    if (playCue) await playAudioFile(`think-auto-${activeTask.id}`, OTE_SPEAKING_AUDIO.timeToThink);
    if (skipListeningRef.current || skipThinkingRef.current) return;
    startCountdown(getPrepSeconds(activeTask), "thinking", () => startRecording(stream));
  }

  function listeningWasSkipped(stream) {
    if (!skipListeningRef.current) return false;
    skipListeningRef.current = false;
    beginThinkingPhase(stream, { playCue: false });
    return true;
  }

  async function startTask() {
    stop();
    if (!activeTask || phase === "listening" || phase === "thinking" || phase === "recording") return;
    const stream = await ensureStream();
    if (!stream) return;
    activeRunStreamRef.current = stream;
    skipListeningRef.current = false;
    skipThinkingRef.current = false;
    if (!activityStartedRef.current) {
      activityStartedRef.current = true;
      logOteTrainingStarted({
        section: "speaking",
        part: "part-2",
        mode: "voicemail_practice",
        setId: selectedSet.id,
        setTitle: selectedSet.title,
        taskCount: selectedSet.tasks.length,
      });
    }
    setPhase("listening");
    setSecondsLeft(0);
    await playAudioFile(
      `instructions-${activeTask.id}`,
      isAdvanced
        ? OTE_SPEAKING_AUDIO.voicemailAdvancedInstructions
        : activeTask.type === "message-2" ? OTE_SPEAKING_AUDIO.voicemailInstructions2 : OTE_SPEAKING_AUDIO.voicemailInstructions1
    );
    if (listeningWasSkipped(stream)) return;
    if (activeTask.taskAudioSrc) {
      await playAudioFile(`task-${activeTask.id}`, activeTask.taskAudioSrc);
    } else {
      await speak(`task-${activeTask.id}`, taskSpeech);
    }
    if (listeningWasSkipped(stream)) return;
    if (activeTask.incomingAudioSrc) {
      await playAudioFile(`friend-cue-${activeTask.id}`, OTE_SPEAKING_AUDIO.nowListenToMessage);
      if (listeningWasSkipped(stream)) return;
      await playAudioFile(`friend-${activeTask.id}`, activeTask.incomingAudioSrc);
    } else if (activeTask.friendMessage) {
      await playCueThenSpeak(`friend-${activeTask.id}`, OTE_SPEAKING_AUDIO.nowListenToMessage, activeTask.friendMessage);
    }
    if (listeningWasSkipped(stream)) return;
    await beginThinkingPhase(stream);
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
      setRecordings((current) => [
        ...current.filter((recording) => recording.taskId !== activeTask.id),
        {
          taskId: activeTask.id,
          id: activeTask.id,
          partId: "part-2",
          label: activeTask.label,
          title: activeTask.title,
          prompt: buildTaskSpeech(activeTask),
          durationSeconds: activeTask.responseSeconds || 40,
          blob,
          url,
          name: `ote-part-2-${selectedSet.id}-${activeTask.type}.webm`,
        },
      ]);
      setPhase("review");
      setSecondsLeft(0);
    };
    recorder.start();
    startCountdown(activeTask.responseSeconds || 40, "recording", () => {
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
      setPhase("thinking");
      setSecondsLeft(getPrepSeconds(activeTask));
      stop();
      return;
    }
    if (phase === "thinking") {
      clearTimer();
      skipThinkingRef.current = true;
      startRecording(activeRunStreamRef.current || streamRef.current);
      return;
    }
    if (phase === "recording") {
      stopRecordingNow();
    }
  }

  function repeatActiveTask() {
    if (!activeTask) return;
    clearTimer();
    stop();
    const recording = recordings.find((item) => item.taskId === activeTask.id);
    if (recording?.url) URL.revokeObjectURL(recording.url);
    objectUrlsRef.current = objectUrlsRef.current.filter((url) => url !== recording?.url);
    setRecordings((current) => current.filter((item) => item.taskId !== activeTask.id));
    setPhase("ready");
    setSecondsLeft(getPrepSeconds(activeTask));
    activeRunStreamRef.current = null;
    skipListeningRef.current = false;
    skipThinkingRef.current = false;
    setFeedbackResult(null);
    setFeedbackError("");
  }

  function goNext() {
    stop();
    if (!selectedSet) return;
    if (activeIndex < selectedSet.tasks.length - 1) {
      const nextTask = selectedSet.tasks[activeIndex + 1];
      setActiveIndex((index) => index + 1);
      setPhase("ready");
      setSecondsLeft(getPrepSeconds(nextTask));
      return;
    }
    setPhase("complete");
    if (!activityCompletedRef.current) {
      activityCompletedRef.current = true;
      logOteTrainingCompleted({
        section: "speaking",
        part: "part-2",
        mode: "voicemail_practice",
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
    setActiveIndex(0);
    setPhase("ready");
    setSecondsLeft(getPrepSeconds(selectedSet?.tasks?.[0]));
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
      const orderedRecordings = selectedSet.tasks
        .map((task) => recordings.find((recording) => recording.taskId === task.id))
        .filter(Boolean);
      const feedbackAudio = await recordingsToFeedbackAudio(orderedRecordings, `ote-part-2-${selectedSet.id}`);
      const result = await requestOteSpeakingFeedback({
        partId: "part-2",
        task: {
          id: selectedSet.id,
          title: selectedSet.title,
          instructions: activeInstructions,
          tasks: selectedSet.tasks,
        },
        recordings: feedbackAudio,
      });
      setFeedbackResult(result);
      await saveSpeakingAiFeedback({
        product: "ote",
        part: "part-2",
        taskId: selectedSet.id,
        taskTitle: selectedSet.title,
        questions: selectedSet.tasks.map((task) => buildTaskSpeech(task)),
        transcripts: result?.transcripts || [],
        feedback: result?.feedback,
        meta: result?.meta || null,
      });
    } catch (error) {
      console.error("[OTE part 2 feedback] failed", error);
      setFeedbackError(error?.message || "Could not generate feedback right now.");
    } finally {
      setFeedbackLoading(false);
    }
  }

  if (!selectedSet) {
    return (
      <main className="ote-training-page">
        <Seo title="OTE Speaking Part 2 Practice | Seif English" description="Timed voicemail practice sets for OTE Speaking Part 2." />
        <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
          <ArrowLeft size={18} aria-hidden="true" />
          Back to voicemail training
        </button>
        <header className="ote-training-hero">
          <p className="ote-kicker">Practice</p>
          <h1>Voicemail Practice Sets</h1>
          <p>
            {isAdvanced
              ? "Choose a set. Each one gives you a diplomatic voice message task with some time to think and 40 seconds to speak."
              : "Choose a set. Each one includes a polite Message 1 task and a friendly Message 2 reply."}
          </p>
        </header>
        <div className="ote-practice-set-grid">
          {activeSets.map((set, index) => (
            <OteAssignableCard
              key={set.id}
              user={user}
              item={buildAssignmentItem(set)}
              className={`ote-practice-set-card ${completedProgress.has(`speaking.part2.practice.${set.id}`) ? "is-complete" : ""}`}
              onClick={() => navigate(getSetPath(set.id))}
            >
              {completedProgress.has(`speaking.part2.practice.${set.id}`) ? (
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

  const activeRecording = recordings.find((recording) => recording.taskId === activeTask?.id);
  const shouldRevealActiveTask = phase !== "ready" || Boolean(activeRecording);
  const taskSpeech = activeTask ? buildTaskSpeech(activeTask) : "";

  return (
    <main className="ote-training-page">
      <Seo title={`${selectedSet.title} | OTE Voicemail Practice`} description="Timed OTE Speaking Part 2 voicemail practice." />
      <button className="ote-training-back" type="button" onClick={() => navigate(basePath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to practice sets
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Practice set</p>
        <h1>{selectedSet.title}</h1>
        <p>
          {isAdvanced
            ? "Read and listen to the task, then use the time to think before leaving one diplomatic 40-second voice message."
            : "Run both voicemail types with exam-style timing, then listen back and download your recordings."}
        </p>
      </header>

      <section className="ote-practice-runner">
        {!complete && activeTask && (
          <article className="ote-practice-task-card">
            <div className="ote-recorder-top">
              <div>
                <p className="ote-kicker">{activeTask.label}</p>
                <h2>{activeTask.title}</h2>
              </div>
              <div className={`ote-recorder-timer is-${phase}`} aria-live="polite">
                <Timer size={22} aria-hidden="true" />
                <strong>{formatTime(secondsLeft)}</strong>
                <span>{phase === "recording" ? "Recording" : phase === "thinking" ? "Thinking" : phase === "listening" ? "Listening" : phase === "review" ? "Review" : "Ready"}</span>
              </div>
            </div>

            {shouldRevealActiveTask ? (
              <>
                <div className="ote-practice-instructions">
                  <p className="ote-kicker">Instructions</p>
                  <ul>
                    {activeInstructions.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>

                <div className="ote-practice-specific-prompt">
                  <p>{activeTask.lead}</p>
                </div>

                <ul className="ote-practice-bullets">
                  {activeTask.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="ote-practice-hidden-task">
                <p className="ote-kicker">Task hidden</p>
                <p>
                  {isAdvanced
                    ? "Press Start task to reveal the voice message task and begin the timed sequence."
                    : "Press Start task to reveal the voicemail instructions and begin the timed sequence."}
                </p>
              </div>
            )}

            {micError && <p className="ote-mic-error">{micError}</p>}

            <div className="ote-recorder-actions">
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

            {activeRecording && (
              <div className="ote-training-recording-review">
                <div className="ote-training-review-playback">
                  <div>
                    <strong>Your {activeTask.label} recording</strong>
                    <span>Listen back before moving on.</span>
                  </div>
                  <audio controls playsInline preload="metadata" src={activeRecording.url} />
                </div>
                <div className="ote-training-review-actions">
                  <button className="ote-review-primary-action" type="button" onClick={goNext}>
                    <CheckCircle2 size={20} aria-hidden="true" />
                    {activeIndex < selectedSet.tasks.length - 1 ? "Next voicemail" : "Finish set"}
                  </button>
                  <div className="ote-training-review-secondary-actions">
                    <button className="ote-review-secondary-action" type="button" onClick={repeatActiveTask}>
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
            <h2>{isAdvanced ? "Review Your Voice Message" : "Review Your Two Voicemails"}</h2>
            <p>
              {isAdvanced
                ? "Play your voice message back, download the file, or generate feedback."
                : "Play them back, download individual files, or download the full set as a ZIP."}
            </p>
            <div className="ote-complete-action-panel">
              <button
                className="ote-complete-primary-action"
                type="button"
                onClick={handleGenerateFeedback}
                disabled={!recordings.length || feedbackLoading}
              >
                <CheckCircle2 size={20} aria-hidden="true" />
                {feedbackLoading ? "Generating feedback..." : "Get AI feedback"}
              </button>
              <div className="ote-complete-secondary-actions">
                <button className="ote-complete-secondary-action" type="button" onClick={repeatActiveTask}>
                  <RotateCcw size={17} aria-hidden="true" />
                  Record again
                </button>
                <button
                  className="ote-complete-utility-action"
                  type="button"
                  onClick={() => createZipAndDownload(recordings, `ote-part-2-${selectedSet.id}.zip`)}
                  disabled={!recordings.length}
                >
                  <Download size={17} aria-hidden="true" />
                  Download ZIP
                </button>
              </div>
            </div>
            {feedbackError ? <p className="ote-mic-error">{feedbackError}</p> : null}
            <SpeakingFeedbackPanel
              feedbackResult={feedbackResult}
              questions={selectedSet.tasks.map((task) => buildTaskSpeech(task))}
              title="OTE Part 2 feedback"
            />
            <div className="ote-recording-list">
              {recordings.map((recording) => (
                <article key={recording.taskId} className="ote-recording-card">
                  <div>
                    <span>{recording.label}</span>
                    <strong>{recording.title}</strong>
                    <small>{recording.durationSeconds}s response window</small>
                  </div>
                  <audio controls playsInline preload="metadata" src={recording.url} />
                  <a className="ote-recording-download-link" href={recording.url} download={recording.name}>
                    <Download size={17} aria-hidden="true" />
                    Download audio
                  </a>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
