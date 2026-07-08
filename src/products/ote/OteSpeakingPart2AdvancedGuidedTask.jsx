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
import { logOteTrainingCompleted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

const taskBullets = [
  "acknowledge the work she has done to organize the event",
  "explain why the venue is a problem",
  "suggest a practical solution",
];

const taskText =
  "You work for a company. Your colleague, Helen, has organized an off-site training day at a venue outside the city. You have discovered that the venue does not have step-free access, and one member of your team uses a wheelchair. Helen has already paid a deposit for the booking. Leave a voice message for Helen.";

const spokenTaskText = `${taskText} In your message, you should: ${taskBullets.join("; ")}. Preparation time: 10 seconds. Speaking time: 40 seconds.`;

const alexOptions = [
  {
    id: "access",
    text: "One member of the team uses a wheelchair, so they may not be able to enter the building safely.",
    feedback: "Good choice. This explains exactly why the venue is unsuitable.",
    correct: true,
  },
  {
    id: "room",
    text: "The venue is outside the city and has a large meeting room.",
    feedback:
      "This gives extra information about the venue, but it does not develop the accessibility problem.",
    correct: false,
  },
];

const danielOptions = [
  {
    id: "transfer",
    text: "Could we ask the venue whether they can offer another accessible room or transfer our booking to one of their other locations?",
    feedback:
      "Exactly. This gives Helen two realistic ways to solve the problem while recognizing that a deposit has already been paid.",
    correct: true,
  },
  {
    id: "garden",
    text: "The venue also has a garden where we could take photographs during the lunch break.",
    feedback:
      "This is still off-topic. Daniel needs a practical solution, not another detail about the venue.",
    correct: false,
  },
];

const diplomaticRewrites = [
  {
    before: "You have booked the wrong venue.",
    after: "I've just noticed a possible accessibility problem with the venue.",
  },
  {
    before: "You should have checked before paying the deposit.",
    after: "I realize you've already put a lot of work into the booking and paid the deposit.",
  },
  {
    before: "Cancel it immediately.",
    after:
      "Would it be possible to contact the venue and ask whether they have an accessible entrance or another suitable room?",
  },
];

const usefulPhrases = [
  {
    heading: "Acknowledge effort",
    phrases: [
      "Thanks for all the work you've done organizing...",
      "I know you've spent a lot of time arranging...",
      "I appreciate that you have already...",
      "I realize the booking has already been made.",
      "I understand that changing the plans may be difficult.",
    ],
  },
  {
    heading: "Raise the concern",
    phrases: [
      "I've just noticed a possible problem with...",
      "I'm slightly concerned that...",
      "Unfortunately, the venue does not appear to...",
      "This could mean that...",
      "It may be worth checking whether...",
    ],
  },
  {
    heading: "Explain the importance",
    phrases: [
      "One member of the team may not be able to attend safely.",
      "We need to make sure that everyone can take part.",
      "This could exclude a colleague from the event.",
      "Accessibility needs to be considered before the plans are confirmed.",
    ],
  },
  {
    heading: "Suggest a practical solution",
    phrases: [
      "Would it be possible to contact the venue and ask whether...?",
      "Perhaps they have another accessible room.",
      "We could ask whether the deposit can be transferred.",
      "One option might be to move the event to another branch.",
      "I'd be happy to call the venue and discuss the options.",
      "Please let me know how I can help.",
    ],
  },
];

const planSteps = [
  { heading: "Acknowledge", text: "Helen worked hard + deposit paid" },
  { heading: "Problem", text: "No step-free access -> colleague cannot attend safely" },
  { heading: "Solution", text: "Ask venue about accessible room / transfer booking" },
];

const attemptStarters = [
  "Hi Helen, it's...",
  "Thanks for all the work you've done...",
  "I've just noticed...",
  "I'm slightly concerned that...",
  "This could mean that...",
  "Would it be possible to...?",
  "Perhaps we could...",
  "I'd be happy to...",
  "Please let me know...",
];

const listenBackQuestions = [
  "Did I acknowledge Helen's work?",
  "Did I explain the accessibility problem clearly?",
  "Did I explain why the problem matters?",
  "Did I avoid blaming Helen?",
  "Did I suggest a realistic solution?",
  "Did I remember that the deposit had already been paid?",
  "Did I speak for most of the 40 seconds?",
  "Was my message easy to follow?",
];

const modelAnswer =
  "Hi Helen, it's Sam. I'm calling about next week's training day. I know you've put a lot of work into organizing it, particularly as the deposit has already been paid. However, I've just found out that the venue doesn't have step-free access, which means one of our colleagues may not be able to attend safely. Could you contact the venue and ask whether they have another accessible room? If not, perhaps they could transfer the booking to a different location. I'd be happy to help you arrange this.";

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
    utterance.rate = 0.9;
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

export default function OteSpeakingPart2AdvancedGuidedTask({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const menuPath = getSitePath(nativeRoutes ? "/speaking/part-2-voicemails" : "/ote/speaking/part-2-voicemails");
  const [alexChoice, setAlexChoice] = useState("");
  const [danielChoice, setDanielChoice] = useState("");
  const [expandedStudent, setExpandedStudent] = useState("");
  const [practiceStatus, setPracticeStatus] = useState("ready");
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [recording, setRecording] = useState(null);
  const [micError, setMicError] = useState("");
  const [showModel, setShowModel] = useState(false);
  const { isSpeaking, speak, stop } = useSpeech();

  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const activeObjectUrlRef = useRef("");

  const alexFeedback = alexOptions.find((option) => option.id === alexChoice);
  const danielFeedback = danielOptions.find((option) => option.id === danielChoice);
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
    startCountdown(10, "thinking", () => startRecording(stream));
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
        name: `ote-speaking-part-2-advanced-guided-message-${Date.now()}.webm`,
      });
      setPracticeStatus("complete");
      setSecondsLeft(0);
      logOteTrainingCompleted({
        progressId: "speaking.part2.advanced-guided-message",
        section: "speaking",
        part: "part-2",
        mode: "advanced_guided_voicemail",
        taskId: "advanced-guided-message",
        taskTitle: "Diplomatic voice message",
        recordingCount: 1,
      });
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
    setSecondsLeft(10);
    setRecording(null);
    setShowModel(false);
  }

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Advanced Speaking Part 2 Guided Diplomatic Voice Message | Seif English"
        description="Practise an OTE Advanced Speaking Part 2 diplomatic voice message with student examples, timed recording, and a model answer."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to voicemail training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Activity 2</p>
        <h1>Guided Task: A Diplomatic Voice Message</h1>
        <p>
          Study the task and three student answers, then record your own message under Advanced exam
          timing and compare it with a model answer.
        </p>
      </header>

      <section className="ote-guided-task-card">
        <div className="ote-guided-task-heading">
          <div>
            <p className="ote-kicker">Workplace / diplomatic</p>
            <h2>Off-site training venue</h2>
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
        <p className="ote-reference-timing">
          Preparation time: <strong>10 seconds</strong> | Speaking time: <strong>40 seconds</strong>
        </p>
      </section>

      <section className="ote-training-section">
        <h2>Think About the Problems</h2>
        <p className="ote-section-lead">
          Read each answer first. What might prevent the student from receiving a strong score?
        </p>
        <div className="ote-student-answer-list">
          <article className={`ote-student-answer-card ${expandedStudent === "alex" ? "is-open" : ""}`}>
            <button
              className="ote-student-answer-toggle"
              type="button"
              onClick={() => toggleStudent("alex")}
              aria-expanded={expandedStudent === "alex"}
            >
              <span>Student Example 1</span>
              <strong>Alex's answer</strong>
              <ChevronDown size={20} aria-hidden="true" />
            </button>
            <blockquote>
              "Hi Helen. Thanks for organizing the training day. There is a problem with the venue
              because it is not accessible. We need to find another solution. Please call me back.
              Thanks."
            </blockquote>
            {expandedStudent === "alex" && (
              <div className="ote-student-answer-detail">
                <h3>The problem: too short and vague</h3>
                <p>
                  Alex mentions the task, but Helen does not clearly understand who may be unable to
                  attend, why the problem matters, or what solution Alex is suggesting.
                </p>
                <div className="ote-mini-challenge">
                  <strong>
                    <Lightbulb size={16} aria-hidden="true" />
                    Fix it
                  </strong>
                  <p>Which sentence would best develop Alex's explanation?</p>
                  {alexOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={alexChoice === option.id ? "is-selected" : ""}
                      onClick={() => setAlexChoice(option.id)}
                    >
                      {option.text}
                    </button>
                  ))}
                  {alexFeedback && (
                    <p className={alexFeedback.correct ? "is-good" : "is-note"}>
                      {alexFeedback.correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {alexFeedback.feedback}
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
              <strong>Sofia's answer</strong>
              <ChevronDown size={20} aria-hidden="true" />
            </button>
            <blockquote>
              "Helen, you have booked the wrong venue. You should have checked whether it was
              accessible before paying the deposit. Cancel it immediately and find somewhere better."
            </blockquote>
            {expandedStudent === "sofia" && (
              <div className="ote-student-answer-detail">
                <h3>The problem: too critical and accusatory</h3>
                <p>
                  Sofia makes the problem clear, but she blames Helen directly and gives commands. The
                  aim is to solve the problem without damaging the relationship.
                </p>
                <div className="ote-polish-box">
                  {diplomaticRewrites.map((rewrite) => (
                    <React.Fragment key={rewrite.before}>
                      <div>
                        <span>Instead of</span>
                        <p>"{rewrite.before}"</p>
                      </div>
                      <div>
                        <span>Say</span>
                        <p>"{rewrite.after}"</p>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </article>

          <article className={`ote-student-answer-card ${expandedStudent === "daniel" ? "is-open" : ""}`}>
            <button
              className="ote-student-answer-toggle"
              type="button"
              onClick={() => toggleStudent("daniel")}
              aria-expanded={expandedStudent === "daniel"}
            >
              <span>Student Example 3</span>
              <strong>Daniel's answer</strong>
              <ChevronDown size={20} aria-hidden="true" />
            </button>
            <blockquote>
              "Hi Helen. Thanks for all the work you've done organizing the training day. I know
              arranging the venue and transport must have taken a long time. Unfortunately, the
              building doesn't have step-free access, so one colleague may not be able to attend. The
              lunch menu looks excellent, though, and I think everyone will enjoy the activities."
            </blockquote>
            {expandedStudent === "daniel" && (
              <div className="ote-student-answer-detail">
                <h3>The problem: no practical solution</h3>
                <p>
                  Daniel acknowledges Helen's effort and explains the accessibility issue, but he
                  misses the third prompt and changes the subject.
                </p>
                <div className="ote-mini-challenge">
                  <strong>
                    <Lightbulb size={16} aria-hidden="true" />
                    Complete the message
                  </strong>
                  <p>Which sentence would best complete Daniel's response?</p>
                  {danielOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={danielChoice === option.id ? "is-selected" : ""}
                      onClick={() => setDanielChoice(option.id)}
                    >
                      {option.text}
                    </button>
                  ))}
                  {danielFeedback && (
                    <p className={danielFeedback.correct ? "is-good" : "is-note"}>
                      {danielFeedback.correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {danielFeedback.feedback}
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
          <p>Do not be like Alex: explain clearly and give a specific solution.</p>
          <p>Do not be like Sofia: raise concerns without blaming.</p>
          <p>Do not be like Daniel: keep all three prompts in mind.</p>
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
        <h2>Your 10-Second Plan</h2>
        <p className="ote-section-lead">
          Make a very short mental plan. Do not try to write or memorize a complete message.
        </p>
        <div className="ote-takeaway-grid">
          {planSteps.map((step) => (
            <p key={step.heading}>
              <strong>{step.heading}:</strong> {step.text}
            </p>
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
                You will get 10 seconds to think. After the tone, record your voice message for 40
                seconds. Use the sentence starters if you need them, but speak naturally.
              </p>
            </div>
            <div className={`ote-recorder-timer is-${practiceStatus}`} aria-live="polite">
              <Timer size={22} aria-hidden="true" />
              <strong>{formatTime(secondsLeft)}</strong>
              <span>
                {practiceStatus === "recording"
                  ? "Recording"
                  : practiceStatus === "thinking"
                  ? "Thinking"
                  : "Ready"}
              </span>
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
              <div className="ote-training-review-playback">
                <div>
                  <strong>Your recording</strong>
                  <span>Listen back before you compare with the model.</span>
                </div>
                <audio controls playsInline preload="metadata" src={recording.url} />
              </div>
              <div className="ote-training-review-actions">
                <a className="ote-review-utility-action" href={recording.url} download={recording.name}>
                  <Download size={17} aria-hidden="true" />
                  Download audio
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Listen Back</h2>
        <div className="ote-reference-reminders">
          {listenBackQuestions.map((question) => (
            <p key={question}>
              <CheckCircle2 size={16} aria-hidden="true" />
              {question}
            </p>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <div className="ote-model-card">
          <div>
            <p className="ote-kicker">Model answer</p>
            <h2>Compare Your Answer</h2>
            <p>
              Record first, then open the model. Notice the acknowledgement, precise problem, polite
              request, and second option.
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
                <strong>Recognizes Helen's effort:</strong> the speaker starts collaboratively rather
                than critically.
              </p>
              <p>
                <strong>Includes the difficult detail:</strong> the deposit is mentioned, so the
                solution feels realistic.
              </p>
              <p>
                <strong>Solves the problem:</strong> the answer offers an accessible room, a transfer
                to another location, and help arranging it.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
