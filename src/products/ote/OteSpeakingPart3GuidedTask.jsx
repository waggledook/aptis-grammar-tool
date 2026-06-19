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

const taskText =
  "Your academy is upgrading its facilities for students. You are going to give a talk to your English class about different environments where people can study. Choose two photographs. Tell your class how these two environments can help students learn.";

const photoOptions = [
  {
    id: "library",
    label: "A quiet library",
    description: "A silent, traditional library with rows of books",
    src: "/images/ote/speaking/part3-guided/library.png",
  },
  {
    id: "group",
    label: "Group study rooms",
    description: "Students discussing a project around a table",
    src: "/images/ote/speaking/part3-guided/study-room.png",
  },
  {
    id: "online",
    label: "Online learning platforms",
    description: "A student watching an online lecture at home",
    src: "/images/ote/speaking/part3-guided/online-platform.png",
  },
  {
    id: "outdoors",
    label: "Studying outdoors",
    description: "A busy public park with people reading on the grass",
    src: "/images/ote/speaking/part3-guided/studying-outdoors.png",
  },
];

const spokenTaskText = `${taskText} You have 30 seconds to think. You have 1 minute to give your talk.`;

const elenaOptions = [
  {
    id: "all-four",
    text: "Today I am going to talk about all four places we can study...",
    feedback: "Not quite. Part 3 asks you to choose exactly two photographs, not list all four.",
    correct: false,
  },
  {
    id: "two-clear",
    text: "Today I am going to look at two options: the quiet library and group study rooms...",
    feedback: "Excellent. This immediately shows that you understand the instruction to choose two photographs.",
    correct: true,
  },
];

const carlosOptions = [
  {
    id: "list",
    text: "Libraries are quiet. This is good. Students concentrate. Online learning is flexible.",
    feedback: "This has useful ideas, but it still sounds like separate bullet points.",
    correct: false,
  },
  {
    id: "linked",
    text: "To begin with, libraries help students concentrate. By contrast, online platforms give them more flexibility.",
    feedback: "Good. Short linkers make the answer sound more organized without becoming memorized.",
    correct: true,
  },
];

const planningStages = [
  {
    time: "00:00-00:10",
    title: "Intro & choose 2",
    prompts: ["I’ll focus on...", "I’ve chosen...", "Both options..."],
  },
  {
    time: "00:10-00:35",
    title: "Photo 1",
    prompts: ["First of all...", "This helps because...", "For example..."],
  },
  {
    time: "00:35-00:55",
    title: "Photo 2",
    prompts: ["By contrast...", "Another benefit is...", "This is useful for..."],
  },
  {
    time: "00:55-01:00",
    title: "Conclusion",
    prompts: ["Overall...", "In the end...", "It depends on..."],
  },
];

const modelAnswer =
  "Today I am going to discuss how different environments can help students learn effectively, focusing specifically on a quiet library and online learning platforms. To begin with, a traditional library is highly beneficial because it provides an environment completely free from distractions. This quiet atmosphere enables students to concentrate deeply on difficult texts and research materials without interruption. On the other hand, online learning platforms offer a completely different set of advantages. This style of studying gives students a lot of flexibility, allowing them to access lectures from home and review materials at their own pace. In conclusion, while libraries are perfect for deep, focused concentration, online platforms provide the modern convenience and accessibility that independent learners need.";

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

export default function OteSpeakingPart3GuidedTask({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const menuPath = getSitePath(nativeRoutes ? "/speaking/parts-3-4" : "/ote/speaking/parts-3-4");
  const [elenaChoice, setElenaChoice] = useState("");
  const [carlosChoice, setCarlosChoice] = useState("");
  const [expandedStudent, setExpandedStudent] = useState("");
  const [practiceStatus, setPracticeStatus] = useState("ready");
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [recording, setRecording] = useState(null);
  const [micError, setMicError] = useState("");
  const [showModel, setShowModel] = useState(false);
  const { isSpeaking, speak, stop } = useSpeech();

  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const activeObjectUrlRef = useRef("");

  const elenaFeedback = elenaOptions.find((option) => option.id === elenaChoice);
  const carlosFeedback = carlosOptions.find((option) => option.id === carlosChoice);
  const canShowModel = Boolean(recording);
  const livePrompt = useMemo(() => planningStages.map((stage) => `${stage.time} -> ${stage.title}`).join("\n"), []);

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
      console.warn("[OTE Part 3 guided task] microphone access failed", error);
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
    startCountdown(30, "thinking", () => startRecording(stream));
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
        name: `ote-speaking-part-3-guided-talk-${Date.now()}.webm`,
      });
      setPracticeStatus("complete");
      setSecondsLeft(0);
      logOteTrainingCompleted({
        section: "speaking",
        part: "parts-3-4",
        mode: "guided_talk",
        taskId: "guided-talk",
        taskTitle: "Guided Talk Builder",
        recordingCount: 1,
      });
    };
    recorder.start();
    startCountdown(60, "recording", () => {
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
    setSecondsLeft(30);
    setRecording(null);
    setShowModel(false);
  }

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Speaking Part 3 Guided Presentation Task | Seif English"
        description="Practise an OTE Speaking Part 3 long talk with student examples, structural guides, and a model response."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to long talk training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Activity 2</p>
        <h1>Guided Task: The Long Talk</h1>
        <p>
          Study the prompt and analyze three flawed student answers. Then use a simple four-part
          structure to record your own one-minute talk and compare it with a high-scoring model.
        </p>
      </header>

      <section className="ote-guided-task-card">
        <div className="ote-guided-task-heading">
          <div>
            <p className="ote-kicker">Learning & study environments</p>
            <h2>Choose two photographs</h2>
          </div>
          <button type="button" onClick={() => speak(spokenTaskText)}>
            <Volume2 size={18} aria-hidden="true" />
            {isSpeaking ? "Playing" : "Listen to task"}
          </button>
        </div>
        <p>{taskText}</p>
        <div className="ote-part34-image-grid ote-guided-photo-grid" aria-label="Part 3 photograph options">
          {photoOptions.map((photo) => (
            <figure key={photo.id}>
              <img src={photo.src} alt={photo.description} />
              <figcaption>{photo.label}</figcaption>
            </figure>
          ))}
        </div>
        <div className="ote-guided-timing-note">
          <span>30 seconds to think</span>
          <span>1 minute to speak</span>
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Analyze the Problems</h2>
        <p className="ote-section-lead">
          Read each answer first. What would stop this student from getting a strong score? Open the
          card when you are ready to check.
        </p>

        <div className="ote-student-answer-list">
          <article className={`ote-student-answer-card ${expandedStudent === "elena" ? "is-open" : ""}`}>
            <button
              className="ote-student-answer-toggle"
              type="button"
              onClick={() => toggleStudent("elena")}
              aria-expanded={expandedStudent === "elena"}
            >
              <span>Student Example 1</span>
              <strong>Elena's answer</strong>
              <ChevronDown size={20} aria-hidden="true" />
            </button>
            <blockquote>
              "Hello class. I want to talk about studying. First, a quiet library is good because
              there are books and it is quiet. Second, group study rooms are good because you talk to
              friends. Third, online learning platforms are easy because you stay at home. Finally,
              studying outdoors is nice when it is sunny. Thank you."
            </blockquote>
            {expandedStudent === "elena" && (
              <div className="ote-student-answer-detail">
                <h3>The problem: talks about all four pictures</h3>
                <p>
                  Elena lists every option instead of choosing exactly two. Because she covers
                  everything superficially, she cannot develop a clear argument.
                </p>
                <div className="ote-mini-challenge">
                  <strong>
                    <Lightbulb size={16} aria-hidden="true" />
                    Fix the opening
                  </strong>
                  <p>Which opening shows she understands the instructions?</p>
                  {elenaOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={elenaChoice === option.id ? "is-selected" : ""}
                      onClick={() => setElenaChoice(option.id)}
                    >
                      {option.text}
                    </button>
                  ))}
                  {elenaFeedback && (
                    <p className={elenaFeedback.correct ? "is-good" : "is-note"}>
                      {elenaFeedback.correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {elenaFeedback.feedback}
                    </p>
                  )}
                </div>
              </div>
            )}
          </article>

          <article className={`ote-student-answer-card ${expandedStudent === "david" ? "is-open" : ""}`}>
            <button
              className="ote-student-answer-toggle"
              type="button"
              onClick={() => toggleStudent("david")}
              aria-expanded={expandedStudent === "david"}
            >
              <span>Student Example 2</span>
              <strong>David's answer</strong>
              <ChevronDown size={20} aria-hidden="true" />
            </button>
            <blockquote>
              "Hello everyone. I am choosing the library and studying outdoors. I really love books,
              and my town has an enormous library downtown that was built in 1920. However, I prefer
              studying outdoors in the park because I like playing football there with my friends on
              Saturdays, and then we go to get ice cream."
            </blockquote>
            {expandedStudent === "david" && (
              <div className="ote-student-answer-detail">
                <h3>The problem: misses the core question</h3>
                <p>
                  David chooses two images, but he talks about personal habits and hobbies instead of
                  explaining how these environments help students learn.
                </p>
                <div className="ote-polish-box">
                  <div>
                    <span>Instead of</span>
                    <p>"I like playing football in the park on Saturdays."</p>
                  </div>
                  <div>
                    <span>Say</span>
                    <p>"Studying outdoors can help students focus because fresh air gives them energy."</p>
                  </div>
                  <div>
                    <span>Instead of</span>
                    <p>"My town has an enormous library built in 1920."</p>
                  </div>
                  <div>
                    <span>Say</span>
                    <p>"A quiet library gives students a distraction-free space for difficult work."</p>
                  </div>
                </div>
              </div>
            )}
          </article>

          <article className={`ote-student-answer-card ${expandedStudent === "carlos" ? "is-open" : ""}`}>
            <button
              className="ote-student-answer-toggle"
              type="button"
              onClick={() => toggleStudent("carlos")}
              aria-expanded={expandedStudent === "carlos"}
            >
              <span>Student Example 3</span>
              <strong>Carlos's answer</strong>
              <ChevronDown size={20} aria-hidden="true" />
            </button>
            <blockquote>
              "I will talk about libraries and online learning. Libraries are quiet. This is good
              for reading. Students can concentrate. Online learning is different. It is flexible.
              You don't travel. You save money. It is comfortable."
            </blockquote>
            {expandedStudent === "carlos" && (
              <div className="ote-student-answer-detail">
                <h3>The problem: choppy sentences with little cohesion</h3>
                <p>
                  Carlos has useful ideas, but his speech sounds like a list. A few short linking
                  phrases would make it much easier to follow.
                </p>
                <div className="ote-mini-challenge">
                  <strong>
                    <Lightbulb size={16} aria-hidden="true" />
                    Improve the flow
                  </strong>
                  <p>Which version connects the ideas more naturally?</p>
                  {carlosOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={carlosChoice === option.id ? "is-selected" : ""}
                      onClick={() => setCarlosChoice(option.id)}
                    >
                      {option.text}
                    </button>
                  ))}
                  {carlosFeedback && (
                    <p className={carlosFeedback.correct ? "is-good" : "is-note"}>
                      {carlosFeedback.correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      {carlosFeedback.feedback}
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
        <p className="ote-section-lead">
          Keep the discourse markers short and flexible. You only need enough language to guide the
          listener through your two choices.
        </p>
        <div className="ote-part3-stage-grid">
          {planningStages.map((stage) => (
            <article key={stage.time}>
              <span>{stage.time}</span>
              <h3>{stage.title}</h3>
              <div>
                {stage.prompts.map((prompt) => (
                  <p key={prompt}>{prompt}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <div className="ote-recorder-card">
          <div className="ote-recorder-top">
            <div>
              <p className="ote-kicker">Your turn</p>
              <h2>Record Your Talk</h2>
              <p>
                You will get 30 seconds to think. After the tone, record your Part 3 talk for 60
                seconds. Choose two photos and keep your timing balanced.
              </p>
            </div>
            <div className={`ote-recorder-timer is-${practiceStatus}`} aria-live="polite">
              <Timer size={22} aria-hidden="true" />
              <strong>{formatTime(secondsLeft)}</strong>
              <span>{practiceStatus === "recording" ? "Recording" : practiceStatus === "thinking" ? "Thinking" : "Ready"}</span>
            </div>
          </div>

          <div className="ote-starter-card">
            <strong>Live timing guide</strong>
            <pre className="ote-task-bullets">{livePrompt}</pre>
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
              Record first, then open the model. Notice how it chooses exactly two options, stays on
              the learning question, and uses short transitions.
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
                <strong>Strictly fulfils the task:</strong> it highlights exactly two options and
                links both clearly to how students learn.
              </p>
              <p>
                <strong>Balanced timing:</strong> the transitions help both photographs get enough
                development.
              </p>
              <p>
                <strong>Natural flow:</strong> short linkers such as "To begin with" and "On the
                other hand" connect the ideas without sounding too scripted.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
