import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Download, Mic, Timer } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { OTE_SPEAKING_AUDIO } from "./mockTests/data/oteSpeakingMockData.js";
import "./styles/ote.css";

const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
const VOICEMAIL_INSTRUCTIONS = [
  "First read and listen to the task, then decide what you want to say.",
  "The clock shows how much time you have to speak.",
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

  async function playCueThenSpeak(id, cueSrc, text) {
    await playAudioFile(`${id}-cue`, cueSrc);
    return speak(id, text);
  }

  function stop() {
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

export default function OteSpeakingPart2Practice({ nativeRoutes = false }) {
  const { setId } = useParams();
  const navigate = useNavigate();
  const { speakingId, playAudioFile, playCueThenSpeak, speak, stop } = useSpeech();
  const menuPath = getSitePath(nativeRoutes ? "/speaking/part-2-voicemails" : "/ote/speaking/part-2-voicemails");
  const basePath = getSitePath(nativeRoutes ? "/speaking/part-2-voicemails/practice" : "/ote/speaking/part-2-voicemails/practice");
  const selectedSet = useMemo(() => PRACTICE_SETS.find((item) => item.id === setId), [setId]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState("ready");
  const [secondsLeft, setSecondsLeft] = useState(20);
  const [recordings, setRecordings] = useState([]);
  const [micError, setMicError] = useState("");

  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const objectUrlsRef = useRef([]);

  const activeTask = selectedSet?.tasks?.[activeIndex];
  const complete = selectedSet && recordings.length >= selectedSet.tasks.length;

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
    setSecondsLeft(20);
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

  async function startTask() {
    stop();
    if (!activeTask || phase === "listening" || phase === "thinking" || phase === "recording") return;
    const stream = await ensureStream();
    if (!stream) return;
    setPhase("listening");
    setSecondsLeft(0);
    await playAudioFile(
      `instructions-${activeTask.id}`,
      activeTask.type === "message-2" ? OTE_SPEAKING_AUDIO.voicemailInstructions2 : OTE_SPEAKING_AUDIO.voicemailInstructions1
    );
    if (activeTask.taskAudioSrc) {
      await playAudioFile(`task-${activeTask.id}`, activeTask.taskAudioSrc);
    } else {
      await speak(`task-${activeTask.id}`, taskSpeech);
    }
    if (activeTask.incomingAudioSrc) {
      await playAudioFile(`friend-cue-${activeTask.id}`, OTE_SPEAKING_AUDIO.nowListenToMessage);
      await playAudioFile(`friend-${activeTask.id}`, activeTask.incomingAudioSrc);
    } else if (activeTask.friendMessage) {
      await playCueThenSpeak(`friend-${activeTask.id}`, OTE_SPEAKING_AUDIO.nowListenToMessage, activeTask.friendMessage);
    }
    await playAudioFile(`think-auto-${activeTask.id}`, OTE_SPEAKING_AUDIO.timeToThink);
    startCountdown(20, "thinking", () => startRecording(stream));
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
          label: activeTask.label,
          title: activeTask.title,
          durationSeconds: 40,
          blob,
          url,
          name: `ote-part-2-${selectedSet.id}-${activeTask.type}.webm`,
        },
      ]);
      setPhase("review");
      setSecondsLeft(0);
    };
    recorder.start();
    startCountdown(40, "recording", () => {
      if (recorder.state === "recording") recorder.stop();
    });
  }

  function stopRecordingNow() {
    clearTimer();
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  function goNext() {
    stop();
    if (!selectedSet) return;
    if (activeIndex < selectedSet.tasks.length - 1) {
      setActiveIndex((index) => index + 1);
      setPhase("ready");
      setSecondsLeft(20);
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
    setActiveIndex(0);
    setPhase("ready");
    setSecondsLeft(20);
    setMicError("");
    stop();
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
          <p>Choose a set. Each one includes a polite Message 1 task and a friendly Message 2 reply.</p>
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

  const activeRecording = recordings.find((recording) => recording.taskId === activeTask?.id);
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
        <p>Run both voicemail types with exam-style timing, then listen back and download your recordings.</p>
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

            <div className="ote-practice-instructions">
              <p className="ote-kicker">Instructions</p>
              <ul>
                {VOICEMAIL_INSTRUCTIONS.map((line) => (
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
            </div>

            {activeRecording && (
              <div className="ote-training-recording-review">
                <div>
                  <strong>Your {activeTask.label} recording</strong>
                  <span>Listen back before moving on.</span>
                </div>
                <audio controls playsInline preload="metadata" src={activeRecording.url} />
                <a href={activeRecording.url} download={activeRecording.name}>
                  <Download size={17} aria-hidden="true" />
                  Download audio
                </a>
                <button type="button" onClick={goNext}>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  {activeIndex < selectedSet.tasks.length - 1 ? "Next voicemail" : "Finish set"}
                </button>
              </div>
            )}
          </article>
        )}

        {(complete || phase === "complete") && (
          <section className="ote-practice-complete">
            <p className="ote-kicker">Practice complete</p>
            <h2>Review Your Two Voicemails</h2>
            <p>Play them back, download individual files, or download the full set as a ZIP.</p>
            <button
              className="ote-reference-download"
              type="button"
              onClick={() => createZipAndDownload(recordings, `ote-part-2-${selectedSet.id}.zip`)}
              disabled={!recordings.length}
            >
              <Download size={18} aria-hidden="true" />
              Download ZIP
            </button>
            <div className="ote-recording-list">
              {recordings.map((recording) => (
                <article key={recording.taskId} className="ote-recording-card">
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
