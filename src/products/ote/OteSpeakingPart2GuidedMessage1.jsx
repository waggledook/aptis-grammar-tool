import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Download,
  Lightbulb,
  Mic,
  Play,
  RotateCcw,
  Timer,
  Volume2,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

const taskBullets = [
  "say who you are and when you joined the centre",
  "explain where and how you lost your card",
  "ask how you can get a replacement card",
];

const taskText =
  "You recently joined a local sports centre. However, you lost your membership card yesterday. Leave a voicemail message for the sports centre manager.";

const spokenTaskText = `${taskText} In your message, you should: ${taskBullets.join("; ")}.`;

const lucasExpansionOptions = [
  {
    id: "park",
    text: "...I lost it at the park while playing football.",
    feedback: "Good choice. This explains where and how he lost it, so it develops the second bullet point.",
    correct: true,
  },
  {
    id: "home",
    text: "...I think I left it on the kitchen table at home.",
    feedback:
      "This is possible English, but it does not fit the task as well because Lucas needs to explain losing the card yesterday outside the centre.",
    correct: false,
  },
];

const mateoSentences = [
  {
    id: "joined",
    text: "Hello, my name is Mateo and I joined the sports centre last month.",
    correct: false,
  },
  {
    id: "bag",
    text: "I lost my card yesterday because my backpack was open.",
    correct: false,
  },
  {
    id: "pool",
    text: "The swimming pool is fantastic and I go there every Tuesday with my brother.",
    correct: true,
  },
  {
    id: "machines",
    text: "Also, the gym machines are very modern.",
    correct: false,
  },
];

const usefulPhrases = [
  {
    heading: "Start and identify yourself",
    phrases: [
      "Hello, my name is... and I am calling because...",
      "Hello, I am a member of the sports centre. My name is...",
    ],
  },
  {
    heading: "Explain the problem",
    phrases: [
      "Unfortunately, I have a small problem. I lost my card yesterday.",
      "I am calling because I cannot find my membership card. I think I left it...",
    ],
  },
  {
    heading: "Ask politely",
    phrases: [
      "Could you please tell me how I can get a replacement?",
      "I would like to know what I need to do to get a new card.",
    ],
  },
];

const attemptStarters = [
  "Hello, my name is...",
  "I joined the sports centre...",
  "Unfortunately, I lost my membership card...",
  "I think...",
  "Could you please tell me...",
];

const modelAnswer =
  "Hello, my name is Maria Silva and I recently joined the sports centre last Tuesday. Unfortunately, I am calling because I have a small problem. I lost my membership card yesterday afternoon. I think it dropped out of my bag while I was walking home from the gym. Could you please tell me how I can get a replacement card? I would also like to know if I need to pay a fee for it. Thank you very much for your help. Goodbye.";

function formatTime(seconds) {
  const safe = Math.max(0, Math.ceil(seconds || 0));
  return `00:${String(safe).padStart(2, "0")}`;
}

function getSupportedMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  function speak(text) {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-GB";
    utterance.rate = 0.92;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function stop() {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }

  return { isSpeaking, speak, stop };
}

export default function OteSpeakingPart2GuidedMessage1({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const menuPath = getSitePath(nativeRoutes ? "/speaking/part-2-voicemails" : "/ote/speaking/part-2-voicemails");
  const [lucasChoice, setLucasChoice] = useState("");
  const [mateoChoice, setMateoChoice] = useState("");
  const [expandedStudent, setExpandedStudent] = useState("");
  const [practiceStatus, setPracticeStatus] = useState("ready");
  const [secondsLeft, setSecondsLeft] = useState(20);
  const [recording, setRecording] = useState(null);
  const [micError, setMicError] = useState("");
  const [showModel, setShowModel] = useState(false);
  const { isSpeaking, speak, stop } = useSpeech();

  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const activeObjectUrlRef = useRef("");

  const lucasFeedback = lucasExpansionOptions.find((option) => option.id === lucasChoice);
  const mateoFeedback = mateoSentences.find((sentence) => sentence.id === mateoChoice);
  const canShowModel = Boolean(recording);

  const taskPrompt = useMemo(() => attemptStarters.join("\n"), []);

  function toggleStudent(studentId) {
    setExpandedStudent((current) => (current === studentId ? "" : studentId));
  }

  useEffect(() => {
    return () => {
      window.clearInterval(timerRef.current);
      streamRef.current?.getTracks?.().forEach((track) => track.stop());
      if (activeObjectUrlRef.current) URL.revokeObjectURL(activeObjectUrlRef.current);
    };
  }, []);

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
      console.warn("[OTE training] microphone access failed", error);
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
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.24);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.26);
  }

  function clearPracticeTimer() {
    window.clearInterval(timerRef.current);
    timerRef.current = null;
  }

  function startCountdown(seconds, nextStatus, onComplete) {
    clearPracticeTimer();
    setPracticeStatus(nextStatus);
    setSecondsLeft(seconds);
    let remaining = seconds;
    timerRef.current = window.setInterval(() => {
      remaining -= 1;
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearPracticeTimer();
        onComplete?.();
      }
    }, 1000);
  }

  async function startPractice() {
    stop();
    if (practiceStatus === "thinking" || practiceStatus === "recording") return;
    if (activeObjectUrlRef.current) {
      URL.revokeObjectURL(activeObjectUrlRef.current);
      activeObjectUrlRef.current = "";
    }
    setRecording(null);
    setShowModel(false);
    const stream = await ensureStream();
    if (!stream) return;
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
      activeObjectUrlRef.current = url;
      setRecording({
        blob,
        url,
        name: `ote-speaking-part-2-message-1-${Date.now()}.webm`,
      });
      setPracticeStatus("complete");
      setSecondsLeft(0);
    };
    recorder.start();
    startCountdown(40, "recording", () => {
      if (recorder.state === "recording") recorder.stop();
    });
  }

  function stopRecordingNow() {
    clearPracticeTimer();
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  function resetPractice() {
    clearPracticeTimer();
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    if (activeObjectUrlRef.current) {
      URL.revokeObjectURL(activeObjectUrlRef.current);
      activeObjectUrlRef.current = "";
    }
    setPracticeStatus("ready");
    setSecondsLeft(20);
    setRecording(null);
    setShowModel(false);
  }

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Speaking Part 2 Guided Voicemail Task | Seif English"
        description="Practise an OTE Speaking Part 2 formal voicemail with student examples, timed recording, and a model answer."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to voicemail training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Activity 2</p>
        <h1>Guided Task: Message 1</h1>
        <p>
          First study the task and three student answers. Then record your own formal voicemail,
          listen back, download it if you want, and compare it with a model answer.
        </p>
      </header>

      <section className="ote-guided-task-card">
        <div className="ote-guided-task-heading">
          <div>
            <p className="ote-kicker">Neutral / polite</p>
            <h2>Sports centre membership card</h2>
          </div>
          <button type="button" onClick={() => speak(spokenTaskText)}>
            <Volume2 size={18} aria-hidden="true" />
            {isSpeaking ? "Playing" : "Listen to task"}
          </button>
        </div>
        <p>{taskText}</p>
        <ul>
          {taskBullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </section>

      <section className="ote-training-section">
        <h2>Think About the Problems</h2>
        <p className="ote-section-lead">
          Read each answer first. What would stop this student from getting a strong score? Open the
          card when you are ready to check.
        </p>
        <div className="ote-student-answer-list">
          <article className={`ote-student-answer-card ${expandedStudent === "lucas" ? "is-open" : ""}`}>
            <button
              className="ote-student-answer-toggle"
              type="button"
              onClick={() => toggleStudent("lucas")}
              aria-expanded={expandedStudent === "lucas"}
            >
              <span>Student Example 1</span>
              <strong>Lucas: too short and simple</strong>
              <ChevronDown size={20} aria-hidden="true" />
            </button>
            <blockquote>
              "Hello. My name is Lucas. I joined the sports centre last week. I lost my card
              yesterday. I want a new card please. Thank you. Goodbye."
            </blockquote>
            {expandedStudent === "lucas" && (
              <div className="ote-student-answer-detail">
                <p>
                  Lucas answers the prompts, but he only speaks for about 10 seconds and gives almost
                  no detail. He leaves too much silence on the timer.
                </p>
                <div className="ote-mini-challenge">
                  <strong>
                    <Lightbulb size={16} aria-hidden="true" />
                    Fix it
                  </strong>
                  <p>Which detail best expands his answer?</p>
                  {lucasExpansionOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={lucasChoice === option.id ? "is-selected" : ""}
                      onClick={() => setLucasChoice(option.id)}
                    >
                      {option.text}
                    </button>
                  ))}
                  {lucasFeedback && (
                    <p className={lucasFeedback.correct ? "is-good" : "is-note"}>
                      {lucasFeedback.correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {lucasFeedback.feedback}
                    </p>
                  )}
                </div>
              </div>
            )}
          </article>

          <article className={`ote-student-answer-card ${expandedStudent === "sofia" ? "is-open" : ""}`}>
            <button
              className="ote-student-answer-toggle"
              type="button"
              onClick={() => toggleStudent("sofia")}
              aria-expanded={expandedStudent === "sofia"}
            >
              <span>Student Example 2</span>
              <strong>Sofia: too direct and impolite</strong>
              <ChevronDown size={20} aria-hidden="true" />
            </button>
            <blockquote>
              "Listen, my name is Sofia. I joined this sports centre last week. I lost my membership
              card yesterday and it was not my fault. I need a new card immediately today. Tell me how
              I can get one right now."
            </blockquote>
            {expandedStudent === "sofia" && (
              <div className="ote-student-answer-detail">
                <p>
                  Sofia gives the information, but the tone is too demanding for a manager. A formal
                  voicemail needs softer, more polite language.
                </p>
                <div className="ote-polish-box">
                  <div>
                    <span>Instead of</span>
                    <p>"Tell me how I can get one."</p>
                  </div>
                  <div>
                    <span>Say</span>
                    <p>"Could you please tell me how I can get a new one?"</p>
                  </div>
                  <div>
                    <span>Instead of</span>
                    <p>"I need a new card right now."</p>
                  </div>
                  <div>
                    <span>Say</span>
                    <p>"I would like to know if it is possible to get a replacement."</p>
                  </div>
                </div>
              </div>
            )}
          </article>

          <article className={`ote-student-answer-card ${expandedStudent === "mateo" ? "is-open" : ""}`}>
            <button
              className="ote-student-answer-toggle"
              type="button"
              onClick={() => toggleStudent("mateo")}
              aria-expanded={expandedStudent === "mateo"}
            >
              <span>Student Example 3</span>
              <strong>Mateo: goes off-topic</strong>
              <ChevronDown size={20} aria-hidden="true" />
            </button>
            <blockquote>
              "Hello, my name is Mateo and I joined the sports centre last month. I lost my card
              yesterday because my backpack was open. I really love the sports centre. The swimming
              pool is fantastic and I go there every Tuesday with my brother. Also, the gym machines
              are very modern."
            </blockquote>
            {expandedStudent === "mateo" && (
              <div className="ote-student-answer-detail">
                <p>
                  Mateo starts well, but he forgets to ask how to get a replacement card. That means
                  he misses a mandatory part of the task.
                </p>
                <div className="ote-mini-challenge">
                  <strong>
                    <Lightbulb size={16} aria-hidden="true" />
                    Spot the error
                  </strong>
                  <p>Tap the sentence where Mateo goes off-topic.</p>
                  {mateoSentences.map((sentence) => (
                    <button
                      key={sentence.id}
                      type="button"
                      className={mateoChoice === sentence.id ? "is-selected" : ""}
                      onClick={() => setMateoChoice(sentence.id)}
                    >
                      {sentence.text}
                    </button>
                  ))}
                  {mateoFeedback && (
                    <p className={mateoFeedback.correct ? "is-good" : "is-note"}>
                      {mateoFeedback.correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {mateoFeedback.correct
                        ? "Exactly. From this point, he talks about the centre instead of asking for a replacement card."
                        : "That sentence is still connected to the bullet points. Look for the moment he starts talking about the centre generally."}
                    </p>
                  )}
                </div>
              </div>
            )}
          </article>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Before You Record</h2>
        <div className="ote-takeaway-grid">
          <p>Do not be like Lucas: add small details to fill the time.</p>
          <p>Do not be like Sofia: keep it polite and professional.</p>
          <p>Do not be like Mateo: keep your eye on the bullet points.</p>
        </div>
        <div className="ote-phrase-grid">
          {usefulPhrases.map((group) => (
            <article key={group.heading}>
              <h3>{group.heading}</h3>
              {group.phrases.map((phrase) => (
                <p key={phrase}>{phrase}</p>
              ))}
            </article>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <div className="ote-recorder-card">
          <div className="ote-recorder-top">
            <div>
              <p className="ote-kicker">Your turn</p>
              <h2>Record Your Message</h2>
              <p>
                You will get 20 seconds to think. After the tone, record your voicemail for 40
                seconds. Use the sentence starters if you need them, but add your own details.
              </p>
            </div>
            <div className={`ote-recorder-timer is-${practiceStatus}`} aria-live="polite">
              <Timer size={22} aria-hidden="true" />
              <strong>{formatTime(secondsLeft)}</strong>
              <span>{practiceStatus === "recording" ? "Recording" : practiceStatus === "thinking" ? "Thinking" : "Ready"}</span>
            </div>
          </div>

          <div className="ote-starter-card">
            <strong>Sentence starters</strong>
            <pre className="ote-task-bullets">{taskPrompt}</pre>
          </div>

          {micError && <p className="ote-mic-error">{micError}</p>}

          <div className="ote-recorder-actions">
            <button
              type="button"
              onClick={startPractice}
              disabled={practiceStatus === "thinking" || practiceStatus === "recording"}
            >
              <Mic size={18} aria-hidden="true" />
              Start exam-style recording
            </button>
            <button type="button" onClick={stopRecordingNow} disabled={practiceStatus !== "recording"}>
              Stop recording
            </button>
            <button type="button" onClick={resetPractice}>
              <RotateCcw size={18} aria-hidden="true" />
              Reset
            </button>
          </div>

          {recording && (
            <div className="ote-training-recording-review">
              <div>
                <strong>Your recording</strong>
                <span>Listen back before you compare with the model.</span>
              </div>
              <audio controls playsInline preload="metadata" src={recording.url} />
              <a href={recording.url} download={recording.name}>
                <Download size={17} aria-hidden="true" />
                Download audio
              </a>
            </div>
          )}
        </div>
      </section>

      <section className="ote-training-section">
        <div className="ote-model-card">
          <div>
            <p className="ote-kicker">Model answer</p>
            <h2>Compare Your Answer</h2>
            <p>
              Record first, then open the model. Notice the small details, polite questions, and how
              every bullet point is covered.
            </p>
          </div>
          <button type="button" onClick={() => setShowModel(true)} disabled={!canShowModel || showModel}>
            <Play size={18} aria-hidden="true" />
            Show model
          </button>
        </div>

        {showModel && (
          <div className="ote-model-answer">
            <button type="button" onClick={() => speak(modelAnswer)}>
              <Volume2 size={18} aria-hidden="true" />
              Listen to model
            </button>
            <blockquote>{modelAnswer}</blockquote>
            <div className="ote-model-why">
              <p>
                <strong>Uses the full time:</strong> it adds small details such as "last Tuesday" and
                "walking home from the gym".
              </p>
              <p>
                <strong>Stays polite:</strong> it uses phrases such as "Unfortunately", "Could you
                please", and "I would like to know".
              </p>
              <p>
                <strong>Answers everything:</strong> the manager gets all the important information
                clearly and in order.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
