import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Download,
  Lightbulb,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Timer,
  Volume2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import SpeakingFeedbackPanel from "../../components/speaking/SpeakingFeedbackPanel.jsx";
import {
  logOteTrainingCompleted,
  requestOteSpeakingFeedback,
  saveSpeakingAiFeedback,
} from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import { recordingsToFeedbackAudio } from "./utils/speakingFeedback.js";
import "./styles/ote.css";

const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
];

function getSupportedMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

const followUpQuestions = [
  {
    id: "q1",
    type: "Preference",
    opening: "Personally, I prefer...",
    prompt: "Where do you prefer to study, and why?",
    audioSrc: "/audio/ote/speaking/general/guided-followups/study-environments-q1.mp3",
    skill: "Describe a personal preference and give a reason.",
  },
  {
    id: "q2",
    type: "Comparison",
    opening: "I think it depends, but...",
    prompt: "Do you think it is better to study alone or with other people?",
    audioSrc: "/audio/ote/speaking/general/guided-followups/study-environments-q2.mp3",
    skill: "Compare two options and give an opinion.",
  },
  {
    id: "q3",
    type: "Advantages",
    opening: "One big advantage is...",
    prompt: "How can online learning help students?",
    audioSrc: "/audio/ote/speaking/general/guided-followups/study-environments-q3.mp3",
    skill: "Explain one or two advantages.",
  },
  {
    id: "q4",
    type: "Problems",
    opening: "One common problem is...",
    prompt: "What problems can students have when they study at home?",
    audioSrc: "/audio/ote/speaking/general/guided-followups/study-environments-q4.mp3",
    skill: "Describe problems and add examples.",
  },
  {
    id: "q5",
    type: "Suggestions",
    opening: "They could...",
    prompt: "What could schools or academies do to help students study better?",
    audioSrc: "/audio/ote/speaking/general/guided-followups/study-environments-q5.mp3",
    skill: "Make practical suggestions.",
  },
  {
    id: "q6",
    type: "Future prediction",
    opening: "I think they probably will...",
    prompt: "Do you think people will study more online in the future?",
    audioSrc: "/audio/ote/speaking/general/guided-followups/study-environments-q6.mp3",
    skill: "Speculate about the future.",
  },
];

const answerShape = [
  {
    title: "1. Answer",
    body: "Give the direct answer immediately.",
    phrases: ["Personally, I prefer...", "I think it depends...", "Yes, probably..."],
  },
  {
    title: "2. Reason",
    body: "Explain why.",
    phrases: ["because...", "The main reason is...", "This is useful because..."],
  },
  {
    title: "3. Detail",
    body: "Add one example, contrast, or extra detail.",
    phrases: ["For example...", "However...", "This is especially helpful when..."],
  },
];

const weakAnswers = [
  {
    id: "too-short",
    label: "Weak answer 1",
    title: "Too short",
    question: "Where do you prefer to study, and why?",
    answer: "I prefer to study at home because it is good.",
    problem: "The answer is clear, but it is too short and underdeveloped.",
    better:
      "Personally, I prefer to study at home because I feel more relaxed there. I can organize my desk, choose the music I want and take short breaks when I need to. However, I need to put my phone away, or I get distracted very easily.",
  },
  {
    id: "no-comparison",
    label: "Weak answer 2",
    title: "No real comparison",
    question: "Do you think it is better to study alone or with other people?",
    answer: "Studying alone is good and studying with people is good too. Both are good.",
    problem: "The student mentions both options but does not compare them properly.",
    better:
      "I think it depends on the activity. If I need to memorize vocabulary or read something difficult, studying alone is better because I can concentrate. But if I am preparing a presentation or practising speaking, studying with other people is much more useful.",
  },
  {
    id: "repeats-idea",
    label: "Weak answer 3",
    title: "Repeats one idea",
    question: "How can online learning help students?",
    answer: "Online learning helps students because it is online. Students can study online and learn online.",
    problem: "The student repeats the same word without adding meaning.",
    better:
      "Online learning can help students because it gives them more flexibility. For example, they can watch a video lesson again if they do not understand something the first time. It is also useful for people who live far away or cannot come to class every day.",
  },
  {
    id: "wrong-question",
    label: "Weak answer 4",
    title: "Does not answer the question",
    question: "What problems can students have when they study at home?",
    answer: "I like studying at home because it is comfortable and I can drink coffee.",
    problem: "This answers a different question. The question asks about problems, not preferences.",
    better:
      "One common problem is distraction. At home, students may have their phone, family, television or other things around them, so it can be hard to concentrate. Another problem is that home can feel too comfortable, so students may not work as seriously as they would in a library or classroom.",
  },
];

const languageGroups = [
  {
    title: "Preference",
    phrases: ["Personally, I prefer...", "I usually find it easier to...", "For me, the best place is...", "I feel more comfortable when..."],
  },
  {
    title: "Comparison",
    phrases: ["It depends on the situation.", "Both options have advantages.", "Studying alone is better for...", "Studying with other people is useful when..."],
  },
  {
    title: "Advantages",
    phrases: ["One big advantage is...", "This can help students because...", "It makes it easier to...", "It gives students the chance to..."],
  },
  {
    title: "Problems",
    phrases: ["One common problem is...", "The main difficulty is...", "Students may find it hard to...", "There is a risk that..."],
  },
  {
    title: "Suggestions",
    phrases: ["Schools could...", "It would be useful to...", "They should provide...", "One simple change would be to..."],
  },
  {
    title: "Future",
    phrases: ["I think people will probably...", "In the future, we may see more...", "Online learning will become more common, but...", "I do not think it will completely replace..."],
  },
];

const modelAnswers = [
  {
    label: "Question 1",
    answer:
      "Personally, I prefer to study in a quiet library because there are fewer distractions. When I am at home, I often check my phone or start doing other things. In a library, the atmosphere is more serious, so I find it easier to concentrate for a longer time.",
  },
  {
    label: "Question 2",
    answer:
      "I think it depends on the activity. If I need to read, revise grammar or memorize vocabulary, I prefer to study alone. But if I want to practise speaking or prepare ideas for a project, studying with other people can be much more useful.",
  },
  {
    label: "Question 3",
    answer:
      "Online learning can help students because it is flexible. They can study at home, repeat a video lesson or do extra practice when they have time. It is especially useful for students who are busy or who cannot travel to the academy every day.",
  },
  {
    label: "Question 4",
    answer:
      "The biggest problem is distraction. At home, students may have their phone, family or television nearby, so it is easy to lose concentration. Also, some students find it difficult to separate study time from free time when they are in the same place.",
  },
  {
    label: "Question 5",
    answer:
      "They could create different study spaces for different needs. For example, they could have quiet rooms for individual work and group rooms for speaking practice or projects. They could also give students advice about how to organize their study time outside class.",
  },
  {
    label: "Question 6",
    answer:
      "Yes, I think online learning will probably become more common because it is convenient and flexible. However, I do not think it will completely replace face-to-face classes. Many students still need personal contact with teachers and classmates to stay motivated.",
  },
];

export default function OteSpeakingPart34FollowUpGuidedTask({ nativeRoutes = false, user = null, onRequireSignIn }) {
  const navigate = useNavigate();
  const [expandedAnswer, setExpandedAnswer] = useState("");
  const [showModel, setShowModel] = useState(false);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practicePhase, setPracticePhase] = useState("ready");
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [recordings, setRecordings] = useState([]);
  const [micError, setMicError] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackResult, setFeedbackResult] = useState(null);
  const completedLoggedRef = useRef(false);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const objectUrlsRef = useRef([]);
  const audioRef = useRef(null);
  const menuPath = getSitePath(nativeRoutes ? "/speaking/parts-3-4" : "/ote/speaking/parts-3-4");
  const activeQuestion = followUpQuestions[practiceIndex] || followUpQuestions[0];
  const activeRecording = recordings.find((recording) => recording.questionId === activeQuestion.id);
  const practiceComplete = practicePhase === "complete";

  function toggleAnswer(answerId) {
    setExpandedAnswer((current) => (current === answerId ? "" : answerId));
  }

  function clearTimer() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  }

  function startCountdown(durationSeconds, onComplete) {
    clearTimer();
    setSecondsLeft(durationSeconds);
    let remaining = durationSeconds;
    timerRef.current = window.setInterval(() => {
      remaining -= 1;
      setSecondsLeft(Math.max(remaining, 0));
      if (remaining <= 0) {
        clearTimer();
        onComplete?.();
      }
    }, 1000);
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
      console.error(error);
      setMicError("Microphone permission is needed to record your answer.");
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

  function speakPrompt(prompt) {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") {
        resolve(false);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(prompt);
      utterance.lang = "en-GB";
      utterance.rate = 0.94;
      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);
      window.speechSynthesis.speak(utterance);
    });
  }

  function playAudioFile(src) {
    return new Promise((resolve) => {
      if (!src) {
        resolve(false);
        return;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      const audio = new Audio(src);
      audioRef.current = audio;
      audio.onended = () => resolve(true);
      audio.onerror = () => resolve(false);
      audio.play().catch(() => resolve(false));
    });
  }

  async function playQuestion(question) {
    const playedAudio = await playAudioFile(question.audioSrc);
    if (!playedAudio) await speakPrompt(question.prompt);
  }

  async function startQuestion(index = practiceIndex) {
    if (["listening", "recording"].includes(practicePhase)) return;
    const question = followUpQuestions[index];
    const stream = await ensureStream();
    if (!question || !stream) return;
    setPracticeIndex(index);
    setPracticePhase("listening");
    setSecondsLeft(0);
    await playQuestion(question);
    startRecording(stream, question);
  }

  function startRecording(stream, question) {
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
        ...current.filter((recording) => recording.questionId !== question.id),
        {
          id: question.id,
          questionId: question.id,
          label: `Question ${followUpQuestions.findIndex((item) => item.id === question.id) + 1}`,
          blob,
          url,
          name: `ote-general-followup-guided-${question.id}.webm`,
          partId: "part-4",
          prompt: question.prompt,
          durationSeconds: 30,
        },
      ]);
      setPracticePhase("review");
      setSecondsLeft(0);
    };
    setPracticePhase("recording");
    recorder.start();
    startCountdown(30, () => {
      if (recorder.state === "recording") recorder.stop();
    });
  }

  function stopRecordingNow() {
    clearTimer();
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  function repeatQuestion() {
    clearTimer();
    const recording = recordings.find((item) => item.questionId === activeQuestion.id);
    if (recording?.url) URL.revokeObjectURL(recording.url);
    objectUrlsRef.current = objectUrlsRef.current.filter((url) => url !== recording?.url);
    setRecordings((current) => current.filter((item) => item.questionId !== activeQuestion.id));
    setPracticePhase("ready");
    setSecondsLeft(30);
  }

  function goNextQuestion() {
    if (practiceIndex >= followUpQuestions.length - 1) {
      setPracticePhase("complete");
      setSecondsLeft(0);
      return;
    }
    const nextIndex = practiceIndex + 1;
    setPracticeIndex(nextIndex);
    setPracticePhase("ready");
    setSecondsLeft(30);
    window.setTimeout(() => startQuestion(nextIndex), 0);
  }

  function resetSprint() {
    clearTimer();
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
    setRecordings([]);
    setPracticeIndex(0);
    setPracticePhase("ready");
    setSecondsLeft(30);
    setMicError("");
    setFeedbackError("");
    setFeedbackResult(null);
  }

  function restartSprint() {
    resetSprint();
    window.setTimeout(() => startQuestion(0), 0);
  }

  async function handleGenerateFeedback() {
    if (!user) {
      onRequireSignIn?.();
      setFeedbackError("Sign in to generate OTE speaking feedback.");
      return;
    }
    const orderedRecordings = followUpQuestions
      .map((question) => recordings.find((recording) => recording.questionId === question.id))
      .filter(Boolean);
    if (orderedRecordings.length < followUpQuestions.length) {
      setFeedbackError("Record all six follow-up answers before generating feedback.");
      return;
    }
    setFeedbackLoading(true);
    setFeedbackError("");
    try {
      const feedbackAudio = await recordingsToFeedbackAudio(orderedRecordings, "ote-general-guided-followup-study");
      const task = {
        id: "guided-followup-study-environments",
        title: "Guided follow-up sprint: study environments",
        instructions: [
          "You are going to answer six questions on the topic of your presentation.",
          "You have 30 seconds to answer each question.",
          "Start speaking when you hear the tone.",
        ],
        topic: "Different environments where people can study.",
      };
      const result = await requestOteSpeakingFeedback({
        partId: "part-4",
        task,
        recordings: feedbackAudio,
      });
      setFeedbackResult(result);
      await saveSpeakingAiFeedback({
        product: "ote",
        part: "part-4",
        taskId: task.id,
        taskTitle: task.title,
        questions: followUpQuestions.map((question) => question.prompt),
        transcripts: result?.transcripts || [],
        feedback: result?.feedback,
        meta: result?.meta || null,
      });
    } catch (error) {
      console.error("[OTE guided Part 4 feedback] failed", error);
      setFeedbackError(error?.message || "Could not generate feedback right now.");
    } finally {
      setFeedbackLoading(false);
    }
  }

  useEffect(() => {
    if (completedLoggedRef.current || !showModel) return;
    completedLoggedRef.current = true;
    logOteTrainingCompleted({
      progressId: "speaking.parts34.followup-guided",
      section: "speaking",
      part: "part-4",
      mode: "general_followup_guided_task",
      taskTitle: "Guided Task: Follow-up Question Sprint",
      completed: true,
    });
  }, [showModel]);

  useEffect(() => {
    return () => {
      clearTimer();
      if (audioRef.current) audioRef.current.pause();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <main className="ote-training-page">
      <Seo
        title="OTE Speaking Part 4 Guided Follow-up Task | Seif English"
        description="Train OTE General Speaking Part 4 follow-up answers by recognizing question types, recording six short answers, and comparing with models."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to long talk training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Activity 3</p>
        <h1>Guided Task: Follow-up Question Sprint</h1>
        <p>
          You have just given your one-minute presentation. Now train six audio-only follow-up
          questions: answer clearly, give a reason, and add one extra detail.
        </p>
      </header>

      <section className="ote-guided-task-card">
        <div className="ote-guided-task-heading">
          <div>
            <p className="ote-kicker">Topic link</p>
            <h2>Different environments where people can study</h2>
          </div>
          <div className="ote-guided-timing-note" aria-label="Task timing">
            <span>6 follow-up questions</span>
            <span>30 seconds each</span>
          </div>
        </div>
        <p>
          This follows the guided Part 3 presentation task: your academy is upgrading its facilities
          for students, and you are talking about different places where people can study.
        </p>
        <p>
          In the real test, you only hear each question. You do not see the full question on screen.
          Your aim is a short, clear answer, not a second long talk.
        </p>
      </section>

      <section className="ote-training-section">
        <h2>Recognize the Question Type</h2>
        <p className="ote-section-lead">
          Part 4 questions are quick. The faster you recognize the job of the question, the easier it is to answer well.
        </p>
        <div className="ote-followup-type-grid" aria-label="General follow-up question types">
          {followUpQuestions.map((question, index) => (
            <article className="ote-followup-type-card" key={question.id}>
              <div className="ote-followup-type-top">
                <span>Q{index + 1}</span>
                <strong>{question.type}</strong>
              </div>
              <p>{question.prompt}</p>
              <div className="ote-followup-type-aim">
                <span>Useful opening</span>
                <p>{question.opening}</p>
              </div>
              <div className="ote-followup-type-aim">
                <span>Aim</span>
                <p>{question.skill}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>The 30-Second Shape</h2>
        <p className="ote-section-lead">
          Most answers only need three moves: answer, reason, example or extra detail.
        </p>
        <div className="ote-training-rule-grid">
          {answerShape.map((step) => (
            <article key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <ul className="ote-practice-bullets">
                {step.phrases.map((phrase) => <li key={phrase}>{phrase}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Analyze Weak Answers</h2>
        <p className="ote-section-lead">
          Open each card after you have decided what the problem is. The headings are hidden so they do not give away the answer.
        </p>
        <div className="ote-student-answer-list">
          {weakAnswers.map((item) => (
            <article key={item.id} className={`ote-student-answer-card ${expandedAnswer === item.id ? "is-open" : ""}`}>
              <button
                className="ote-student-answer-toggle"
                type="button"
                onClick={() => toggleAnswer(item.id)}
                aria-expanded={expandedAnswer === item.id}
              >
                <span>{item.label}</span>
                <strong>Student answer</strong>
                <ChevronDown size={20} aria-hidden="true" />
              </button>
              <p><strong>Question:</strong> {item.question}</p>
              <blockquote>"{item.answer}"</blockquote>
              {expandedAnswer === item.id ? (
                <div className="ote-student-answer-detail">
                  <h3>The problem: {item.title}</h3>
                  <p>{item.problem}</p>
                  <div className="ote-mini-challenge">
                    <strong>
                      <Lightbulb size={16} aria-hidden="true" />
                      Better version
                    </strong>
                    <p>{item.better}</p>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <h2>Useful Part 4 Language</h2>
        <div className="ote-training-rule-grid">
          {languageGroups.map((group) => (
            <article key={group.title}>
              <h3>{group.title}</h3>
              <ul className="ote-practice-bullets">
                {group.phrases.map((phrase) => <li key={phrase}>{phrase}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="ote-training-section">
        <div className="ote-recorder-card">
          <div className="ote-recorder-top">
            <div>
              <p className="ote-kicker">Your turn</p>
              <h2>Record a Part 4 Follow-up Sprint</h2>
              <p>
                Each question plays immediately and the recorder starts after the tone. Listen,
                answer, review, then move to the next question.
              </p>
            </div>
            <div className={`ote-recorder-timer ${practicePhase === "recording" ? "is-recording" : "is-ready"}`} aria-label="Answer timing">
              {practicePhase === "listening" ? <Volume2 size={22} aria-hidden="true" /> : <Timer size={22} aria-hidden="true" />}
              <strong>{practicePhase === "recording" ? `0:${String(secondsLeft).padStart(2, "0")}` : "0:30"}</strong>
              <span>{practicePhase === "listening" ? "Listening" : practicePhase === "review" ? "Review" : "Each answer"}</span>
            </div>
          </div>

          <div className="ote-guided-sprint-panel" aria-live="polite">
            <div>
              <p className="ote-kicker">{practiceComplete ? "Sprint complete" : `Question ${practiceIndex + 1}`}</p>
              <h3>
                {practiceComplete
                  ? "All six answers recorded"
                  : practicePhase === "listening"
                    ? "Listen to the question"
                    : practicePhase === "recording"
                      ? "Speak now"
                      : practicePhase === "review"
                        ? "Review your answer"
                        : "Ready to start"}
              </h3>
              <p>
                {practiceComplete
                  ? "Listen back to your recordings, then reveal the model answers below."
                  : practicePhase === "review"
                    ? "Listen back before moving on. The next question will play immediately when you continue."
                    : practicePhase === "recording"
                      ? "Answer directly, give a reason, then add one extra detail."
                      : "You will hear the question, then the tone will start your 30-second answer."}
              </p>
            </div>

            {micError ? <p className="ote-practice-error">{micError}</p> : null}

            {practicePhase === "ready" ? (
              <button className="ote-training-primary-link" type="button" onClick={() => startQuestion(practiceIndex)}>
                <Play size={17} aria-hidden="true" />
                {recordings.length ? `Start Question ${practiceIndex + 1}` : "Start follow-up sprint"}
              </button>
            ) : null}

            {practicePhase === "listening" ? (
              <button className="ote-training-primary-link" type="button" disabled>
                <Volume2 size={17} aria-hidden="true" />
                Playing question
              </button>
            ) : null}

            {practicePhase === "recording" ? (
              <button className="ote-training-primary-link" type="button" onClick={stopRecordingNow}>
                <Square size={17} aria-hidden="true" />
                Stop recording
              </button>
            ) : null}

            {practicePhase === "review" && activeRecording ? (
              <div className="ote-guided-sprint-review">
                <div className="ote-training-review-playback">
                  <div>
                    <strong>{activeRecording.label} recording</strong>
                    <span>Listen back before moving on.</span>
                  </div>
                  <audio controls src={activeRecording.url} />
                </div>
                <div className="ote-training-review-actions">
                  <button className="ote-review-primary-action" type="button" onClick={goNextQuestion}>
                    <CheckCircle2 size={18} aria-hidden="true" />
                    {practiceIndex >= followUpQuestions.length - 1 ? "Finish sprint" : "Next question"}
                  </button>
                  <div className="ote-training-review-secondary-actions">
                    <button className="ote-review-secondary-action" type="button" onClick={repeatQuestion}>
                      <RotateCcw size={18} aria-hidden="true" />
                      Record again
                    </button>
                    <a className="ote-review-utility-action" href={activeRecording.url} download={activeRecording.name}>
                      <Download size={18} aria-hidden="true" />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            ) : null}

            {practiceComplete ? (
              <>
                <div className="ote-complete-action-panel">
                  <button
                    className="ote-complete-primary-action"
                    type="button"
                    onClick={handleGenerateFeedback}
                    disabled={feedbackLoading || recordings.length < followUpQuestions.length}
                  >
                    <Sparkles size={18} aria-hidden="true" />
                    {feedbackLoading ? "Generating feedback..." : "Get AI feedback"}
                  </button>
                </div>
                {feedbackError ? <p className="ote-mic-error">{feedbackError}</p> : null}
                <SpeakingFeedbackPanel
                  feedbackResult={feedbackResult}
                  questions={followUpQuestions.map((question) => question.prompt)}
                  title="OTE Part 4 guided follow-up feedback"
                />
                <div className="ote-recording-list">
                  {recordings.map((recording) => (
                    <article className="ote-recording-card" key={recording.questionId}>
                      <div>
                        <span>{recording.label}</span>
                        <strong>Guided follow-up answer</strong>
                      </div>
                      <audio controls src={recording.url} />
                      <a href={recording.url} download={recording.name}>
                        <Download size={18} aria-hidden="true" />
                        Download
                      </a>
                    </article>
                  ))}
                </div>
              </>
            ) : null}

            <div className="ote-training-rule-grid">
              <article>
                <h3>Before recording</h3>
                <ul className="ote-practice-bullets">
                  <li>Listen for the question type.</li>
                  <li>Answer the exact question first.</li>
                  <li>Add one reason and one extra detail.</li>
                </ul>
              </article>
              <article>
                <h3>After each answer</h3>
                <ul className="ote-practice-bullets">
                  <li>Did you answer directly?</li>
                  <li>Did you give a reason?</li>
                  <li>Did you add detail?</li>
                </ul>
              </article>
            </div>

            {recordings.length ? (
              <button className="ote-complete-utility-action" type="button" onClick={resetSprint}>
                <RotateCcw size={17} aria-hidden="true" />
                Reset sprint
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="ote-training-section">
        <div className="ote-model-card">
          <div>
            <p className="ote-kicker">Model answers</p>
            <h2>Compare After Recording</h2>
            <p>
              Try the sprint first, then reveal the models. Notice how each answer stays short but
              still includes an answer, a reason, and one extra detail.
            </p>
          </div>
          <button type="button" onClick={() => setShowModel(true)} disabled={showModel}>
            <Play size={18} aria-hidden="true" />
            Show models
          </button>
        </div>

        {showModel ? (
          <div className="ote-model-answer">
            {modelAnswers.map((model) => (
              <article key={model.label} className="ote-model-why">
                <p><strong>{model.label}</strong></p>
                <p>{model.answer}</p>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className="ote-training-section">
        <h2>Final Reflection</h2>
        <p className="ote-section-lead">
          Which question type was hardest: preference, comparison, advantages, problems, suggestions, or future prediction?
        </p>
        <ul className="ote-practice-bullets">
          <li>Can I recognize the question type quickly?</li>
          <li>Can I answer directly in the first sentence?</li>
          <li>Can I add a reason without speaking for too long?</li>
          <li>Can I add one useful detail before the time runs out?</li>
        </ul>
        <button className="ote-training-primary-link" type="button" onClick={restartSprint}>
          <Sparkles size={17} aria-hidden="true" />
          Practise this sprint again
        </button>
      </section>
    </main>
  );
}
