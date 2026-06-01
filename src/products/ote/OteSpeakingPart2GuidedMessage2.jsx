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
  "welcome your friend",
  "give your friend some advice about clubs",
  "suggest a time and place to meet",
];

const taskText =
  "Listen to a message from your friend who has just started at the college where you are a student. Then, leave a voicemail message for your friend.";

const friendMessage =
  "I've just had my first day here, and wow, this place is so big! I keep getting lost. Anyway, could you call me because I need some advice about clubs. We've got to decide tomorrow which ones to join. One other thing: if you're free this weekend, shall we meet up?";

const spokenTaskText = `${taskText} In your message, you should: ${taskBullets.join("; ")}.`;

const lucasExpansionOptions = [
  {
    id: "warm",
    text: "Oh no, I'm sorry you got lost today! The campus really is huge at first.",
    feedback: "Good choice. It reacts warmly to your friend's message before moving on to the bullet points.",
    correct: true,
  },
  {
    id: "formal",
    text: "I am sorry that you are unable to navigate the educational facilities.",
    feedback: "This is too formal and unnatural for a friendly voicemail to a classmate.",
    correct: false,
  },
];

const mateoSentences = [
  {
    id: "welcome",
    text: "Hey Sam! Welcome to the college, it's great to have you here!",
    correct: false,
  },
  {
    id: "lost",
    text: "Don't worry about getting lost, I got lost on my first day too.",
    correct: false,
  },
  {
    id: "teacher",
    text: "The teachers here are really nice, especially Mr Bell.",
    correct: true,
  },
  {
    id: "essay",
    text: "Last week we learned about ancient castles and I wrote a long essay about it.",
    correct: false,
  },
];

const usefulPhrases = [
  {
    heading: "Welcome and react",
    phrases: [
      "Hey Sam! Welcome to the college, it's so great to have you here!",
      "Hi Sam! Don't worry, the campus is huge but you'll find your way around soon!",
    ],
  },
  {
    heading: "Give advice",
    phrases: [
      "If you want my advice, you should definitely join the sports club because...",
      "You should check out the music club. I think you'd really love it.",
    ],
  },
  {
    heading: "Suggest a plan",
    phrases: [
      "How about we meet up at the campus cafe this Saturday afternoon?",
      "Let's meet outside the main library at 10 am on Sunday, okay?",
    ],
  },
];

const attemptStarters = [
  "Hey Sam! Welcome to...",
  "Don't worry about...",
  "About the clubs, you should...",
  "Because it's a great way to...",
  "How about we meet up...",
];

const modelAnswer =
  "Hey Sam! Welcome to the college, it's so great to have you here! Don't worry about getting lost today, the campus is completely huge and I got lost on my first day too! About the student clubs, you should definitely join the football club because it's a great way to meet new people and have fun. Also, you mentioned meeting up this weekend. How about we meet at the campus cafe this Saturday around two o'clock? We can look at the club lists together then. Let me know if that time works for you. Bye!";

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
    utterance.rate = 0.94;
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

export default function OteSpeakingPart2GuidedMessage2({ nativeRoutes = false }) {
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

  useEffect(() => {
    return () => {
      window.clearInterval(timerRef.current);
      streamRef.current?.getTracks?.().forEach((track) => track.stop());
      if (activeObjectUrlRef.current) URL.revokeObjectURL(activeObjectUrlRef.current);
    };
  }, []);

  function toggleStudent(studentId) {
    setExpandedStudent((current) => (current === studentId ? "" : studentId));
  }

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
        name: `ote-speaking-part-2-message-2-${Date.now()}.webm`,
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
        title="OTE Speaking Part 2 Guided Friend Reply | Seif English"
        description="Practise an OTE Speaking Part 2 friend-reply voicemail with student examples, timed recording, and a model answer."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to voicemail training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Activity 3</p>
        <h1>Guided Task: Message 2</h1>
        <p>
          This time you are replying to a friend. React to their message first, keep your tone
          informal, and make sure you still answer every bullet point.
        </p>
      </header>

      <section className="ote-guided-task-card">
        <div className="ote-guided-task-heading">
          <div>
            <p className="ote-kicker">Friendly / informal</p>
            <h2>College clubs and meeting up</h2>
          </div>
          <div className="ote-guided-task-buttons">
            <button type="button" onClick={() => speak(spokenTaskText)}>
              <Volume2 size={18} aria-hidden="true" />
              {isSpeaking ? "Playing" : "Listen to task"}
            </button>
            <button type="button" onClick={() => speak(friendMessage)}>
              <Volume2 size={18} aria-hidden="true" />
              Listen to friend
            </button>
          </div>
        </div>
        <p>{taskText}</p>
        <blockquote className="ote-friend-message">"{friendMessage}"</blockquote>
        <ul>
          {taskBullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </section>

      <section className="ote-training-section">
        <h2>Think About the Problems</h2>
        <p className="ote-section-lead">
          Read each reply first. What would stop this student from getting a strong score? Open the
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
              "Hi Sam. Welcome to the college. You should join the football club. Let's meet at the
              cafe on Saturday at two o'clock. Bye."
            </blockquote>
            {expandedStudent === "lucas" && (
              <div className="ote-student-answer-detail">
                <p>
                  Lucas answers the prompts, but he gives almost no detail and ignores his friend's
                  comment about getting lost. He leaves too much silence on the timer.
                </p>
                <div className="ote-mini-challenge">
                  <strong>
                    <Lightbulb size={16} aria-hidden="true" />
                    Fix it
                  </strong>
                  <p>Which sentence best expands his answer and reacts to his friend?</p>
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
              <strong>Sofia: too formal</strong>
              <ChevronDown size={20} aria-hidden="true" />
            </button>
            <blockquote>
              "Dear Sam, I am writing to welcome you to our college. Regarding your query about the
              student clubs, I would highly recommend that you register for the photography club.
              Furthermore, it would be a pleasure to meet you this Saturday at noon outside the main
              library building. Best regards, Sofia."
            </blockquote>
            {expandedStudent === "sofia" && (
              <div className="ote-student-answer-detail">
                <p>
                  Sofia speaks smoothly, but she sounds like she is writing a formal email. A friend
                  reply needs natural, conversational language.
                </p>
                <div className="ote-polish-box">
                  <div>
                    <span>Instead of</span>
                    <p>"I would highly recommend..."</p>
                  </div>
                  <div>
                    <span>Say</span>
                    <p>"You should definitely try..."</p>
                  </div>
                  <div>
                    <span>Instead of</span>
                    <p>"Furthermore, it would be a pleasure to meet..."</p>
                  </div>
                  <div>
                    <span>Say</span>
                    <p>"How about we meet up..."</p>
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
              "Hey Sam! Welcome to the college, it's great to have you here! Don't worry about
              getting lost, I got lost on my first day too. The teachers here are really nice,
              especially Mr Bell. He teaches history and his classes are so interesting. Anyway, see
              you soon!"
            </blockquote>
            {expandedStudent === "mateo" && (
              <div className="ote-student-answer-detail">
                <p>
                  Mateo starts with an excellent friendly tone, but then he talks about a teacher and
                  forgets the clubs and meeting arrangement.
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
                        ? "Exactly. From this point, he leaves the task and starts talking about school generally."
                        : "That sentence still responds to the friend. Look for the moment he starts a new, unrelated topic."}
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
          <p>React to your friend's news before answering the bullet points.</p>
          <p>Use friendly, informal language instead of email-style phrases.</p>
          <p>Stay on the clubs and meeting plan. Do not drift into a new story.</p>
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
              <h2>Record Your Reply</h2>
              <p>
                You will get 20 seconds to think. After the tone, record your reply for 40 seconds.
                Use the sentence starters if you need them, but add your own details.
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
              Record first, then open the model. Notice how it reacts to the friend, gives advice,
              and suggests a clear meeting plan.
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
                <strong>Sustains the relationship:</strong> it reacts warmly to the friend's problem
                before answering the prompts.
              </p>
              <p>
                <strong>Uses an informal register:</strong> it uses contractions and conversational
                transitions such as "About the student clubs".
              </p>
              <p>
                <strong>Fills the 40 seconds smoothly:</strong> it adds small details about the club,
                the day, the time, and what they can do together.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
