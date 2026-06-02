import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Download, Mic, Timer } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { OTE_SPEAKING_AUDIO } from "./mockTests/data/oteSpeakingMockData.js";
import "./styles/ote.css";

const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
const PART3_INSTRUCTIONS = [
  "You are going to give a talk.",
  "Read and listen to the task.",
  "The clock shows how much time you have to speak.",
  "Start speaking when you hear the tone.",
];
const PART4_INSTRUCTIONS = [
  "You are going to answer six questions about your talk.",
  "The clock shows how much time you have to speak.",
  "Start speaking when you hear the tone.",
];

const PRACTICE_SETS = [
  {
    id: "environment-eco-projects",
    title: "Environment and Eco-Projects",
    description: "Talk about town eco-projects, then answer related questions about the environment.",
    talkAudioSrc: "/audio/ote/speaking/part34-prompts/environment-eco-projects.mp3",
    talkPrompt:
      "The local council has some money to make your town more environmentally friendly. You are going to give a talk to your English class about different ways of using this money. Choose two photographs. Tell your class how these two ideas might help the environment in your town.",
    images: [
      { id: "bike-sharing", label: "A bike-sharing scheme", description: "A bicycle-sharing station", src: "/images/ote/speaking/part34/bike-sharing.png" },
      { id: "solar-energy", label: "Solar energy panels", description: "Solar panels on a roof", src: "/images/ote/speaking/part34/solar-energy.png" },
      { id: "urban-garden", label: "An urban garden", description: "People growing vegetables", src: "/images/ote/speaking/part34/urban-garden.png" },
      { id: "recycling", label: "Recycling facilities", description: "Recycling bins on a street", src: "/images/ote/speaking/part34/recycling.png" },
    ],
    questions: [
      {
        prompt: "Your talk was about the environment. Tell me about a park or green space in your town.",
        audioSrc: "/audio/ote/speaking/part34-followups/environment-eco-projects/q1.mp3",
      },
      {
        prompt: "Some people say individuals can do very little to stop pollution. Do you agree?",
        audioSrc: "/audio/ote/speaking/part34-followups/environment-eco-projects/q2.mp3",
      },
      {
        prompt: "How do you think cities will be cleaner in the future?",
        audioSrc: "/audio/ote/speaking/part34-followups/environment-eco-projects/q3.mp3",
      },
      {
        prompt: "In your home, what is the easiest thing to recycle?",
        audioSrc: "/audio/ote/speaking/part34-followups/environment-eco-projects/q4.mp3",
      },
      {
        prompt: "What is the best age to teach children about nature?",
        audioSrc: "/audio/ote/speaking/part34-followups/environment-eco-projects/q5.mp3",
      },
      {
        prompt: "Would you prefer to live in a green eco-city or a historic town?",
        audioSrc: "/audio/ote/speaking/part34-followups/environment-eco-projects/q6.mp3",
      },
    ],
  },
  {
    id: "work-careers",
    title: "Work and Careers",
    description: "Talk about modern working styles, then answer related career questions.",
    talkAudioSrc: "/audio/ote/speaking/part34-prompts/work-careers.mp3",
    talkPrompt:
      "Your school is organising a career week. You are going to give a talk to your English class about different working styles that young people can choose today. Choose two photographs. Tell your class about the benefits these two working styles offer.",
    images: [
      { id: "remote-working", label: "Remote working", description: "A person working from a cafe", src: "/images/ote/speaking/part34/remote-working.png" },
      { id: "corporate-office", label: "A corporate office", description: "People collaborating in a modern office", src: "/images/ote/speaking/part34/corporate-office.png" },
      { id: "freelance-work", label: "Freelance work", description: "An artist working alone in a studio", src: "/images/ote/speaking/part34/freelance.png" },
      { id: "business-travel", label: "Business travel", description: "A professional at an airport", src: "/images/ote/speaking/part34/business-travel.png" },
    ],
    questions: [
      {
        prompt: "Your talk was about careers. Tell me about a job you find interesting.",
        audioSrc: "/audio/ote/speaking/part34-followups/work-careers/q1.mp3",
      },
      {
        prompt: "Some people say that working from home makes people lonely. What do you think?",
        audioSrc: "/audio/ote/speaking/part34-followups/work-careers/q2.mp3",
      },
      {
        prompt: "How do you think technology will change offices in the future?",
        audioSrc: "/audio/ote/speaking/part34-followups/work-careers/q3.mp3",
      },
      {
        prompt: "In your career, would you prefer to work alone or in a team?",
        audioSrc: "/audio/ote/speaking/part34-followups/work-careers/q4.mp3",
      },
      {
        prompt: "What is the best age to start a first part-time job?",
        audioSrc: "/audio/ote/speaking/part34-followups/work-careers/q5.mp3",
      },
      {
        prompt: "Which would you prefer to have: a high salary or more free time?",
        audioSrc: "/audio/ote/speaking/part34-followups/work-careers/q6.mp3",
      },
    ],
  },
  {
    id: "travel-tourism",
    title: "Travel and Tourism",
    description: "Talk about different types of travel, then answer related tourism questions.",
    talkAudioSrc: "/audio/ote/speaking/part34-prompts/travel-tourism.mp3",
    talkPrompt:
      "A travel magazine wants to show alternative ways to experience holidays. You are going to give a talk to your English class about different ways of travelling. Choose two photographs. Tell your class how these two types of travel can be a good experience.",
    images: [
      { id: "cultural-homestay", label: "A cultural homestay", description: "A tourist staying with a local family", src: "/images/ote/speaking/part34/cultural-homestay.png" },
      { id: "cruise", label: "An all-inclusive cruise", description: "A large cruise ship at sea", src: "/images/ote/speaking/part34/cruise.png" },
      { id: "ecotourism", label: "Ecotourism", description: "Hikers walking on a mountain trail", src: "/images/ote/speaking/part34/eco-tourism.png" },
      { id: "solo-backpacking", label: "Solo backpacking", description: "A young person exploring a city alone", src: "/images/ote/speaking/part34/solo-backpacking.png" },
    ],
    questions: [
      {
        prompt: "Your talk was about travel. Tell me about a holiday you really enjoyed.",
        audioSrc: "/audio/ote/speaking/part34-followups/travel-tourism/q1.mp3",
      },
      {
        prompt: "Some people say that tourism ruins beautiful historic places. Do you agree?",
        audioSrc: "/audio/ote/speaking/part34-followups/travel-tourism/q2.mp3",
      },
      {
        prompt: "How do you think travel will be different fifty years from now?",
        audioSrc: "/audio/ote/speaking/part34-followups/travel-tourism/q3.mp3",
      },
      {
        prompt: "When you visit a new place, what do you like to do most?",
        audioSrc: "/audio/ote/speaking/part34-followups/travel-tourism/q4.mp3",
      },
      {
        prompt: "What is the best age to travel abroad without parents?",
        audioSrc: "/audio/ote/speaking/part34-followups/travel-tourism/q5.mp3",
      },
      {
        prompt: "Where would you prefer to spend a weekend: at a beach resort or in a mountain cabin?",
        audioSrc: "/audio/ote/speaking/part34-followups/travel-tourism/q6.mp3",
      },
    ],
  },
  {
    id: "shopping-consumerism",
    title: "Shopping and Consumerism",
    description: "Talk about shopping habits, then answer related consumer questions.",
    talkAudioSrc: "/audio/ote/speaking/part34-prompts/shopping-consumerism.mp3",
    talkPrompt:
      "A local business group is looking at how modern shopping habits are changing. You are going to give a talk to your English class about different ways people buy things. Choose two photographs. Tell your class how these two choices can be a good way to shop.",
    images: [
      { id: "online-shopping", label: "Online shopping", description: "A delivery van outside a house", src: "/images/ote/speaking/part34/online-shopping.png" },
      { id: "street-markets", label: "Local street markets", description: "A busy stall at an outdoor market", src: "/images/ote/speaking/part34/street-markets.png" },
      { id: "shopping-centres", label: "Shopping centres", description: "A large shopping centre with various clothes shops", src: "/images/ote/speaking/part34/shopping-centres.png" },
      { id: "second-hand", label: "Second-hand shops", description: "A customer buying used clothes or vintage items", src: "/images/ote/speaking/part34/second-hand-shops.png" },
    ],
    questions: [
      {
        prompt: "Your talk was about shopping. Tell me about a shop you like to visit in your town.",
        audioSrc: "/audio/ote/speaking/part34-followups/shopping-consumerism/q1.mp3",
      },
      {
        prompt: "Some people say that buying things online is safer than going to shops. Do you agree?",
        audioSrc: "/audio/ote/speaking/part34-followups/shopping-consumerism/q2.mp3",
      },
      {
        prompt: "What are the advantages of buying second-hand items?",
        audioSrc: "/audio/ote/speaking/part34-followups/shopping-consumerism/q3.mp3",
      },
      {
        prompt: "In your free time, do you prefer shopping alone or with other people?",
        audioSrc: "/audio/ote/speaking/part34-followups/shopping-consumerism/q4.mp3",
      },
      {
        prompt: "What is the best age for a young person to get their first credit card?",
        audioSrc: "/audio/ote/speaking/part34-followups/shopping-consumerism/q5.mp3",
      },
      {
        prompt: "Do you think people spend too much money on things they do not need?",
        audioSrc: "/audio/ote/speaking/part34-followups/shopping-consumerism/q6.mp3",
      },
    ],
  },
  {
    id: "media-entertainment",
    title: "Media and Entertainment",
    description: "Talk about forms of entertainment, then answer related media questions.",
    talkAudioSrc: "/audio/ote/speaking/part34-prompts/media-entertainment.mp3",
    talkPrompt:
      "Your school's cultural society is looking at how entertainment has changed. You are going to give a talk to your English class about different forms of media. Choose two photographs. Tell your class how these two media can successfully entertain an audience.",
    images: [
      { id: "live-theatre", label: "Live theatre", description: "An audience watching a live play", src: "/images/ote/speaking/part34/live-theatre.png" },
      { id: "streaming", label: "Streaming services", description: "Someone watching a series on a phone", src: "/images/ote/speaking/part34/streaming-services.png" },
      { id: "print-books", label: "Print books", description: "A local bookshop hosting a book reading", src: "/images/ote/speaking/part34/print-books.png" },
      { id: "video-games", label: "Video games", description: "A person using a VR headset", src: "/images/ote/speaking/part34/video-games.png" },
    ],
    questions: [
      {
        prompt: "Your talk was about media. Tell me about a film or book you liked recently.",
        audioSrc: "/audio/ote/speaking/part34-followups/media-entertainment/q1.mp3",
      },
      {
        prompt: "Some people say that traditional cinemas will close down completely. Do you agree?",
        audioSrc: "/audio/ote/speaking/part34-followups/media-entertainment/q2.mp3",
      },
      {
        prompt: "What are the advantages of reading a book compared to watching a film?",
        audioSrc: "/audio/ote/speaking/part34-followups/media-entertainment/q3.mp3",
      },
      {
        prompt: "In your free time, do you prefer playing video games alone or with friends?",
        audioSrc: "/audio/ote/speaking/part34-followups/media-entertainment/q4.mp3",
      },
      {
        prompt: "What is a good age for a child to have a smartphone?",
        audioSrc: "/audio/ote/speaking/part34-followups/media-entertainment/q5.mp3",
      },
      {
        prompt: "Do you think digital entertainment is better than traditional media?",
        audioSrc: "/audio/ote/speaking/part34-followups/media-entertainment/q6.mp3",
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

function useSpeech() {
  const [speakingId, setSpeakingId] = useState("");
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
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
        setSpeakingId("");
        resolve(played);
      };
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
      const utterance = new SpeechSynthesisUtterance(text);
      const finish = () => {
        setSpeakingId("");
        resolve(true);
      };
      utterance.lang = "en-GB";
      utterance.rate = 0.94;
      utterance.onend = finish;
      utterance.onerror = finish;
      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    });
  }

  function stop() {
    audioRef.current?.pause();
    audioRef.current = null;
    window.speechSynthesis?.cancel();
    setSpeakingId("");
  }

  return { speakingId, playAudioFile, speak, stop };
}

async function createZipAndDownload(files, zipName = "ote-talk-follow-up-practice.zip") {
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

export default function OteSpeakingPart34Practice({ nativeRoutes = false }) {
  const { setId } = useParams();
  const navigate = useNavigate();
  const { playAudioFile, speak, stop } = useSpeech();
  const speakingPath = getSitePath(nativeRoutes ? "/speaking" : "/ote/speaking");
  const basePath = getSitePath(nativeRoutes ? "/speaking/parts-3-4-practice" : "/ote/speaking/parts-3-4-practice");
  const selectedSet = useMemo(() => PRACTICE_SETS.find((item) => item.id === setId), [setId]);

  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState("ready");
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [recordings, setRecordings] = useState([]);
  const [micError, setMicError] = useState("");
  const [flowStep, setFlowStep] = useState(null);

  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const objectUrlsRef = useRef([]);

  const steps = useMemo(() => {
    if (!selectedSet) return [];
    return [
      {
        id: "talk",
        kind: "talk",
        label: "Part 3 Talk",
        title: selectedSet.title,
        prompt: selectedSet.talkPrompt,
        audioSrc: selectedSet.talkAudioSrc || "",
        prepSeconds: 30,
        responseSeconds: 60,
      },
      ...selectedSet.questions.map((question, index) => {
        const prompt = typeof question === "string" ? question : question.prompt;
        const audioSrc = typeof question === "string" ? "" : question.audioSrc || "";
        return {
          id: `q-${index + 1}`,
          kind: "question",
          label: `Follow-up ${index + 1}`,
          title: `Question ${index + 1}`,
          prompt,
          audioSrc,
          prepSeconds: 0,
          responseSeconds: 30,
        };
      }),
    ];
  }, [selectedSet]);

  const activeStep = steps[stepIndex];
  const visibleStep = flowStep || activeStep;
  const complete = selectedSet && recordings.length >= steps.length;

  useEffect(() => {
    return () => {
      window.clearInterval(timerRef.current);
      streamRef.current?.getTracks?.().forEach((track) => track.stop());
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    setStepIndex(0);
    setFlowStep(null);
    setPhase("ready");
    setSecondsLeft(30);
    setRecordings([]);
    setMicError("");
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
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
      console.warn("[OTE parts 3/4 practice] microphone access failed", error);
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

  async function runPrep(seconds, stream, step) {
    await playAudioFile(`think-auto-${step.id}`, OTE_SPEAKING_AUDIO.timeToThink);
    return new Promise((resolve) => {
      startCountdown(seconds, "thinking", () => resolve(startRecording(stream, step)));
    });
  }

  async function startStep() {
    stop();
    if (!activeStep || phase === "listening" || phase === "thinking" || phase === "recording") return;
    const stream = await ensureStream();
    if (!stream) return;

    if (activeStep.kind === "talk") {
      setFlowStep(activeStep);
      setPhase("listening");
      setSecondsLeft(0);
      await playAudioFile(`instructions-${activeStep.id}`, OTE_SPEAKING_AUDIO.part3Instructions);
      if (activeStep.audioSrc) {
        await playAudioFile(activeStep.id, activeStep.audioSrc);
      } else {
        await speak(activeStep.id, activeStep.prompt);
      }
      await runPrep(activeStep.prepSeconds, stream, activeStep);
      setFlowStep(null);
      return;
    }

    setPhase("listening");
    setSecondsLeft(0);
    await playAudioFile("part-4-instructions", OTE_SPEAKING_AUDIO.part4Instructions);
    for (let index = stepIndex; index < steps.length; index += 1) {
      const step = steps[index];
      if (step.kind !== "question") continue;
      setStepIndex(index);
      setFlowStep(step);
      setPhase("listening");
      setSecondsLeft(0);
      if (step.audioSrc) {
        await playAudioFile(step.id, step.audioSrc);
      } else {
        await speak(step.id, step.prompt);
      }
      await startRecording(stream, step);
      await new Promise((resolve) => window.setTimeout(resolve, 450));
    }
    setFlowStep(null);
    setPhase("complete");
    setSecondsLeft(0);
  }

  function startRecording(stream, step = activeStep) {
    playBeep();
    chunksRef.current = [];
    const mimeType = getSupportedMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorderRef.current = recorder;
    return new Promise((resolve) => {
      recorder.ondataavailable = (event) => {
        if (event.data?.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
        const url = URL.createObjectURL(blob);
        const recording = {
          stepId: step.id,
          label: step.label,
          title: step.title,
          durationSeconds: step.responseSeconds,
          blob,
          url,
          name: `ote-parts-3-4-${selectedSet.id}-${step.id}.webm`,
        };
        objectUrlsRef.current.push(url);
        setRecordings((current) => [
          ...current.filter((item) => item.stepId !== step.id),
          recording,
        ]);
        setPhase("review");
        setSecondsLeft(0);
        resolve(recording);
      };
      recorder.start();
      startCountdown(step.responseSeconds, "recording", () => {
        if (recorder.state === "recording") recorder.stop();
      });
    });
  }

  function stopRecordingNow() {
    clearTimer();
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  function goNext() {
    stop();
    if (stepIndex < steps.length - 1) {
      setFlowStep(null);
      setStepIndex((index) => index + 1);
      setPhase("ready");
      setSecondsLeft(steps[stepIndex + 1]?.prepSeconds || steps[stepIndex + 1]?.responseSeconds || 30);
      return;
    }
    setPhase("complete");
  }

  function resetSet() {
    clearTimer();
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
    setRecordings([]);
    setStepIndex(0);
    setFlowStep(null);
    setPhase("ready");
    setSecondsLeft(30);
    setMicError("");
    stop();
  }

  if (!selectedSet) {
    return (
      <main className="ote-training-page">
        <Seo title="OTE Speaking Parts 3 and 4 Practice | Seif English" description="Timed talk and follow-up question practice for OTE Speaking Parts 3 and 4." />
        <button className="ote-training-back" type="button" onClick={() => navigate(speakingPath)}>
          <ArrowLeft size={18} aria-hidden="true" />
          Back to speaking
        </button>
        <header className="ote-training-hero">
          <p className="ote-kicker">Parts 3 and 4</p>
          <h1>Talk and Follow-up Practice</h1>
          <p>Choose a topic. Record a Part 3 talk, then answer related Part 4 follow-up questions.</p>
        </header>
        <div className="ote-practice-set-grid">
          {PRACTICE_SETS.map((set, index) => (
            <button className="ote-practice-set-card" key={set.id} type="button" onClick={() => navigate(`${basePath}/${set.id}`)}>
              <span>Set {index + 1}</span>
              <h2>{set.title}</h2>
              <p>{set.description}</p>
            </button>
          ))}
        </div>
      </main>
    );
  }

  const activeRecording = recordings.find((recording) => recording.stepId === visibleStep?.id);

  return (
    <main className="ote-training-page">
      <Seo title={`${selectedSet.title} | OTE Parts 3 and 4 Practice`} description="Timed OTE Speaking Parts 3 and 4 practice." />
      <button className="ote-training-back" type="button" onClick={() => navigate(basePath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to practice sets
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Parts 3 and 4</p>
        <h1>{selectedSet.title}</h1>
        <p>Record the talk first. Then answer the related follow-up questions one by one.</p>
      </header>

      <section className="ote-practice-runner">
        {!complete && visibleStep && (
          <article className="ote-practice-task-card">
            <div className="ote-recorder-top">
              <div>
                <p className="ote-kicker">{visibleStep.label}</p>
                <h2>{visibleStep.kind === "talk" ? "Choose two pictures and give your talk" : visibleStep.title}</h2>
              </div>
              <div className={`ote-recorder-timer is-${phase}`} aria-live="polite">
                <Timer size={22} aria-hidden="true" />
                <strong>{formatTime(secondsLeft)}</strong>
                <span>{phase === "recording" ? "Recording" : phase === "thinking" ? "Thinking" : phase === "listening" ? "Listening" : phase === "review" ? "Review" : "Ready"}</span>
              </div>
            </div>

            <div className="ote-practice-instructions">
              <p className="ote-kicker">Instructions</p>
              <ul>
                {(visibleStep.kind === "talk" ? PART3_INSTRUCTIONS : PART4_INSTRUCTIONS).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>

            {visibleStep.kind === "talk" && (
              <div className="ote-practice-specific-prompt">
                <p>{visibleStep.prompt}</p>
              </div>
            )}

            {visibleStep.kind === "talk" && (
              <div className="ote-part34-image-grid">
                {selectedSet.images.map((image) => (
                  <figure key={image.id}>
                    {image.src ? (
                      <img src={image.src} alt="" />
                    ) : (
                      <div className="ote-part34-image-placeholder" aria-hidden="true">
                        <span>{image.label}</span>
                      </div>
                    )}
                    <figcaption>
                      <strong>{image.label}</strong>
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}

            {micError && <p className="ote-mic-error">{micError}</p>}

            <div className="ote-recorder-actions">
              <button type="button" onClick={startStep} disabled={phase === "listening" || phase === "thinking" || phase === "recording"}>
                <Mic size={18} aria-hidden="true" />
                {phase === "listening" ? "Task running" : visibleStep.kind === "talk" ? "Start task" : "Start follow-up questions"}
              </button>
              {phase === "recording" && (
                <button type="button" onClick={stopRecordingNow}>
                  Stop recording
                </button>
              )}
            </div>

            {activeRecording && (
              <div className="ote-training-recording-review">
                <div>
                  <strong>{visibleStep.label} recording</strong>
                  <span>Listen back before moving on.</span>
                </div>
                <audio controls playsInline preload="metadata" src={activeRecording.url} />
                <a href={activeRecording.url} download={activeRecording.name}>
                  <Download size={17} aria-hidden="true" />
                  Download audio
                </a>
                <button type="button" onClick={goNext}>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  {stepIndex < steps.length - 1 ? "Next question" : "Finish set"}
                </button>
              </div>
            )}
          </article>
        )}

        {(complete || phase === "complete") && (
          <section className="ote-practice-complete">
            <p className="ote-kicker">Practice complete</p>
            <h2>Review Your Talk and Follow-ups</h2>
            <p>Play them back, download individual files, or download the full set as a ZIP.</p>
            <button
              className="ote-reference-download"
              type="button"
              onClick={() => createZipAndDownload(recordings, `ote-parts-3-4-${selectedSet.id}.zip`)}
              disabled={!recordings.length}
            >
              <Download size={18} aria-hidden="true" />
              Download ZIP
            </button>
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
        )}
      </section>
    </main>
  );
}
