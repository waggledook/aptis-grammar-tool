import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  Headphones,
  RotateCcw,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted, logOteTrainingStarted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import { getAdvancedListeningPart1Set } from "./data/oteAdvancedListeningPart1.js";
import { getGeneralListeningPart1Set } from "./data/oteGeneralListeningPart1.js";
import "./styles/ote.css";

const LISTEN_AGAIN_PROMPT_SRC = "/audio/ote/listening/instructions/now-listen-again.mp3";
const AUDIO_VOLUME = 0.82;
const INTERSTITIAL_PAUSE_MS = 1000;
const ANSWER_WINDOW_SECONDS = 10;

function speakerVoice(voices, speaker, lineIndex) {
  const englishVoices = voices.filter((voice) => String(voice.lang || "").toLowerCase().startsWith("en"));
  const pool = englishVoices.length ? englishVoices : voices;
  if (!pool.length) return null;
  if (speaker === "Man") return pool.find((voice) => /daniel|george|oliver|ryan|male/i.test(voice.name)) || pool[0];
  return pool.find((voice) => /serena|samantha|karen|moira|female/i.test(voice.name)) || pool[Math.min(1, pool.length - 1)] || pool[lineIndex % pool.length];
}

function formatOptionLabel(index) {
  return String.fromCharCode(65 + index);
}

function stageLabel(stage) {
  if (stage === "instructions") return "Question instructions";
  if (stage === "first-listen") return "First listening";
  if (stage === "pause-after-first") return "Preparing repeat cue";
  if (stage === "listen-again-cue") return "Preparing second listening";
  if (stage === "pause-after-cue") return "Second listening starts shortly";
  if (stage === "second-listen") return "Second listening";
  if (stage === "answering") return "Complete your answer";
  if (stage === "reviewing") return "Answer review";
  return "Ready";
}

function formatCountdown(seconds) {
  return `00:${String(seconds).padStart(2, "0")}`;
}

function renderHighlightedText(text, evidence) {
  const matches = evidence
    .map((item) => ({ ...item, start: text.indexOf(item.quote) }))
    .filter((item) => item.start >= 0)
    .sort((a, b) => a.start - b.start);

  if (!matches.length) return text;

  const parts = [];
  let cursor = 0;

  matches.forEach((item, index) => {
    if (item.start < cursor) return;
    if (item.start > cursor) parts.push(text.slice(cursor, item.start));
    const isCorrectEvidence = item.option === item.answer;
    parts.push(
      <mark
        className={isCorrectEvidence ? "is-correct" : "is-distractor"}
        key={`${item.option}-${item.start}-${index}`}
        title={`Option ${formatOptionLabel(item.option)}`}
      >
        {item.quote}
      </mark>
    );
    cursor = item.start + item.quote.length;
  });

  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

function QuestionFeedback({ item, selectedAnswer, audioReady }) {
  const isCorrect = selectedAnswer === item.answer;
  const evidence = (item.reviewEvidence || []).map((entry) => ({ ...entry, answer: item.answer }));

  return (
    <section className={`ote-listening-question-feedback ${isCorrect ? "is-correct" : "is-wrong"}`}>
      <header>
        {isCorrect ? <CheckCircle2 size={25} aria-hidden="true" /> : <BookOpenCheck size={25} aria-hidden="true" />}
        <div>
          <p className="ote-kicker">{isCorrect ? "Correct answer" : "Review this answer"}</p>
          <h3>
            {formatOptionLabel(item.answer)}. {item.options[item.answer].text}
          </h3>
        </div>
      </header>

      {selectedAnswer != null && !isCorrect ? (
        <p className="ote-listening-selected-answer">
          <strong>Your answer:</strong> {formatOptionLabel(selectedAnswer)}. {item.options[selectedAnswer].text}
        </p>
      ) : null}

      <p className="ote-listening-feedback-explanation">{item.explanation}</p>

      <div className="ote-listening-feedback-audio">
        <div>
          <Headphones size={20} aria-hidden="true" />
          <span>
            <strong>Listen with the script</strong>
            <small>Pause, replay, or move backwards and forwards.</small>
          </span>
        </div>
        {audioReady ? (
          <audio controls preload="metadata" src={item.audioSrc}>
            Your browser does not support audio playback.
          </audio>
        ) : (
          <p>The final recording is still being prepared. Script feedback is available below.</p>
        )}
      </div>

      <div className="ote-listening-feedback-legend" aria-label="Transcript highlight key">
        <span className="is-correct">Correct-answer evidence</span>
        <span className="is-distractor">Distractor evidence</span>
      </div>

      <div className="ote-listening-feedback-script">
        {item.script.map((line, lineIndex) => (
          <p key={`${line.speaker}-${lineIndex}`}>
            <strong>{line.speaker}:</strong>{" "}
            {renderHighlightedText(line.text, evidence)}
          </p>
        ))}
      </div>

      <div className="ote-listening-evidence-grid">
        {evidence.map((entry, index) => {
          const isCorrectEvidence = entry.option === item.answer;
          return (
            <article className={isCorrectEvidence ? "is-correct" : "is-distractor"} key={`${entry.option}-${index}`}>
              <span>
                {isCorrectEvidence ? "Correct" : "Distractor"} · Option {formatOptionLabel(entry.option)}
              </span>
              <strong>{item.options[entry.option].text}</strong>
              <p>{entry.note}</p>
            </article>
          );
        })}
      </div>

      <dl className="ote-listening-feedback-profile">
        <div><dt>Main listening skill</dt><dd>{item.profile.focus}</dd></div>
        <div><dt>Distractor design</dt><dd>{item.profile.distractors}</dd></div>
      </dl>
    </section>
  );
}

export default function OteAdvancedListeningPart1Practice({
  user,
  nativeRoutes = false,
  variant = "advanced",
}) {
  const { setId: routeSetId } = useParams();
  const navigate = useNavigate();
  const isGeneral = variant === "general";
  const listeningLabel = isGeneral ? "General" : "Advanced";
  const setId = routeSetId || (isGeneral ? "a2-set-1" : "set-1");
  const practiceSet = useMemo(
    () => (
      isGeneral
        ? getGeneralListeningPart1Set(setId)
        : getAdvancedListeningPart1Set(setId)
    ),
    [isGeneral, setId]
  );
  const menuPath = getSitePath(nativeRoutes ? "/listening" : "/ote/listening");
  const partPath = getSitePath(
    nativeRoutes
      ? `/listening/${variant}/${isGeneral ? "part-1-picture-options" : "part-1-short-extracts"}`
      : `/ote/listening/${variant}/${isGeneral ? "part-1-picture-options" : "part-1-short-extracts"}`
  );
  const questions = practiceSet.questions;

  const [phase, setPhase] = useState("ready");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [playCounts, setPlayCounts] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [questionStage, setQuestionStage] = useState("idle");
  const [answerSeconds, setAnswerSeconds] = useState(ANSWER_WINDOW_SECONDS);
  const audioRef = useRef(null);
  const sequenceTimeoutRef = useRef(null);
  const ttsTokenRef = useRef(0);
  const completionLoggedRef = useRef(false);
  const countdownCompleteRef = useRef(() => {});

  const question = questions[questionIndex];
  const currentAnswer = answers[question.id];
  const currentPlayCount = playCounts[question.id] || 0;
  const score = questions.reduce(
    (total, item) => total + (answers[item.id] === item.answer ? 1 : 0),
    0
  );
  const progress = (questionIndex / questions.length) * 100;

  useEffect(() => () => stopPlayback(), []);

  useEffect(() => {
    if (phase !== "active" || questionStage !== "answering") return undefined;
    if (answerSeconds <= 0) {
      countdownCompleteRef.current();
      return undefined;
    }
    const timeoutId = window.setTimeout(() => {
      setAnswerSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearTimeout(timeoutId);
  }, [answerSeconds, phase, questionStage]);

  function stopPlayback() {
    ttsTokenRef.current += 1;
    if (sequenceTimeoutRef.current) {
      window.clearTimeout(sequenceTimeoutRef.current);
      sequenceTimeoutRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
  }

  function pauseSequence(token, onComplete) {
    sequenceTimeoutRef.current = window.setTimeout(() => {
      sequenceTimeoutRef.current = null;
      if (token === ttsTokenRef.current) onComplete();
    }, INTERSTITIAL_PAUSE_MS);
  }

  function speakPreview(script, token, onComplete) {
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") {
      if (token === ttsTokenRef.current) onComplete();
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    let lineIndex = 0;

    const speakNext = () => {
      if (token !== ttsTokenRef.current) return;
      if (lineIndex >= script.length) {
        onComplete();
        return;
      }
      const line = script[lineIndex];
      const utterance = new SpeechSynthesisUtterance(line.text);
      utterance.lang = "en-GB";
      utterance.rate = 0.92;
      utterance.volume = AUDIO_VOLUME;
      utterance.voice = speakerVoice(voices, line.speaker, lineIndex);
      lineIndex += 1;
      utterance.onend = speakNext;
      utterance.onerror = speakNext;
      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  }

  function playExtract(item, token, onComplete) {
    if (token !== ttsTokenRef.current) return;
    if (!practiceSet.audioReady) {
      speakPreview(item.script, token, onComplete);
      return;
    }

    const audio = new Audio(item.audioSrc);
    let fellBack = false;

    const fallback = () => {
      if (fellBack || token !== ttsTokenRef.current) return;
      fellBack = true;
      audio.pause();
      audioRef.current = null;
      speakPreview(item.script, token, onComplete);
    };

    audio.preload = "auto";
    audio.volume = AUDIO_VOLUME;
    audio.onended = () => {
      if (token !== ttsTokenRef.current) return;
      audioRef.current = null;
      onComplete();
    };
    audio.onerror = fallback;
    audioRef.current = audio;
    audio.play().catch(fallback);
  }

  function playPrompt(promptSrc, token, onComplete) {
    const promptAudio = new Audio(promptSrc);
    let continued = false;

    const continueSequence = () => {
      if (continued || token !== ttsTokenRef.current) return;
      continued = true;
      promptAudio.pause();
      audioRef.current = null;
      onComplete();
    };

    promptAudio.preload = "auto";
    promptAudio.volume = AUDIO_VOLUME;
    promptAudio.onended = continueSequence;
    promptAudio.onerror = continueSequence;
    audioRef.current = promptAudio;
    promptAudio.play().catch(continueSequence);
  }

  function beginQuestionSequence(item) {
    const token = ttsTokenRef.current;
    setIsPlaying(true);
    setQuestionStage("instructions");
    setAnswerSeconds(ANSWER_WINDOW_SECONDS);
    setPlayCounts((current) => ({ ...current, [item.id]: 0 }));

    const finishSequence = () => {
      if (token !== ttsTokenRef.current) return;
      setIsPlaying(false);
      setQuestionStage("answering");
      setAnswerSeconds(ANSWER_WINDOW_SECONDS);
    };

    const playSecondExtract = () => {
      if (token !== ttsTokenRef.current) return;
      setQuestionStage("second-listen");
      setPlayCounts((current) => ({ ...current, [item.id]: 2 }));
      playExtract(item, token, finishSequence);
    };

    const playListenAgainCue = () => {
      if (token !== ttsTokenRef.current) return;
      setQuestionStage("listen-again-cue");
      playPrompt(LISTEN_AGAIN_PROMPT_SRC, token, () => {
        if (token !== ttsTokenRef.current) return;
        setQuestionStage("pause-after-cue");
        pauseSequence(token, playSecondExtract);
      });
    };

    const playFirstExtract = () => {
      if (token !== ttsTokenRef.current) return;
      setQuestionStage("first-listen");
      setPlayCounts((current) => ({ ...current, [item.id]: 1 }));
      playExtract(item, token, () => {
        if (token !== ttsTokenRef.current) return;
        setQuestionStage("pause-after-first");
        pauseSequence(token, playListenAgainCue);
      });
    };

    if (item.instructionAudioSrc) playPrompt(item.instructionAudioSrc, token, playFirstExtract);
    else playFirstExtract();
  }

  function startPractice() {
    stopPlayback();
    completionLoggedRef.current = false;
    setQuestionIndex(0);
    setAnswers({});
    setPlayCounts({});
    setQuestionStage("idle");
    setAnswerSeconds(ANSWER_WINDOW_SECONDS);
    setPhase("active");
    beginQuestionSequence(questions[0]);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
    logOteTrainingStarted({
      section: "listening",
      part: "part-1",
      mode: "exam_style_practice",
      taskId: `${variant}-listening-part-1-${practiceSet.id}`,
      taskTitle: `${listeningLabel} Listening Part 1 ${practiceSet.title}`,
      variant,
    });
  }

  function chooseAnswer(optionIndex) {
    if (phase !== "active" || questionStage === "reviewing") return;
    setAnswers((current) => ({ ...current, [question.id]: optionIndex }));
  }

  function reviewCurrentQuestion() {
    if (currentAnswer == null || questionStage !== "answering") return;
    stopPlayback();
    setQuestionStage("reviewing");
    window.requestAnimationFrame(() => {
      document.querySelector(".ote-listening-question-feedback")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function goToQuestion(nextIndex) {
    stopPlayback();
    setQuestionIndex(nextIndex);
    setQuestionStage("idle");
    setAnswerSeconds(ANSWER_WINDOW_SECONDS);
    beginQuestionSequence(questions[nextIndex]);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
  }

  function finishPractice() {
    stopPlayback();
    setPhase("complete");
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
    if (completionLoggedRef.current) return;
    completionLoggedRef.current = true;
    logOteTrainingCompleted({
      section: "listening",
      part: "part-1",
      mode: "exam_style_practice",
      taskId: `${variant}-listening-part-1-${practiceSet.id}`,
      taskTitle: `${listeningLabel} Listening Part 1 ${practiceSet.title}`,
      variant,
      score,
      total: questions.length,
    });
  }

  function advance() {
    if (questionIndex < questions.length - 1) {
      goToQuestion(questionIndex + 1);
      return;
    }
    finishPractice();
  }

  countdownCompleteRef.current = () => {
    if (questionIndex < questions.length - 1) {
      goToQuestion(questionIndex + 1);
      return;
    }
    finishPractice();
  };

  if (user && user.oteVersion !== variant) {
    return (
      <main className="ote-training-page">
        <header className="ote-training-hero">
          <p className="ote-kicker">{listeningLabel} Listening Part 1</p>
          <h1>Practice not available</h1>
          <p>Switch your OTE workspace to {listeningLabel} to open this set.</p>
        </header>
        <button className="topbar-btn" type="button" onClick={() => navigate(menuPath)}>Back to listening</button>
      </main>
    );
  }

  if (practiceSet.assetsReady === false) {
    return (
      <main className="ote-training-page ote-listening-ready-page">
        <Seo
          title={`${practiceSet.title} | OTE ${listeningLabel} Listening Part 1`}
          description={`${listeningLabel} Listening Part 1 set in production.`}
        />
        <button className="ote-training-back" type="button" onClick={() => navigate(partPath)}>
          <ArrowLeft size={18} aria-hidden="true" />
          Back to Part 1
        </button>
        <header className="ote-training-hero">
          <p className="ote-kicker">{listeningLabel} Listening Part 1</p>
          <h1>{practiceSet.title}</h1>
          <p>The questions and scoring are integrated. This set will open when its picture and audio assets have been added.</p>
        </header>
      </main>
    );
  }

  if (phase === "ready") {
    return (
      <main className="ote-training-page ote-listening-ready-page">
        <Seo
          title={`OTE ${listeningLabel} Listening Part 1 | Seif English`}
          description={`Exam-style ${listeningLabel} Listening Part 1 practice.`}
        />
        <button className="ote-training-back" type="button" onClick={() => navigate(partPath)}>
          <ArrowLeft size={18} aria-hidden="true" />
          Back to Part 1
        </button>
        <header className="ote-training-hero">
          <p className="ote-kicker">{listeningLabel} Listening Part 1</p>
          <h1>{practiceSet.title}</h1>
          <p>{practiceSet.description}</p>
        </header>
        <section className="ote-practice-runner">
          <article className="ote-practice-task-card ote-listening-ready-card">
            <div className="ote-recorder-top">
              <div>
                <p className="ote-kicker">Ready to start</p>
                <h2>Listen and choose the correct answer</h2>
              </div>
              <div className="ote-recorder-timer is-ready">
                <Headphones size={22} aria-hidden="true" />
                <strong>2×</strong>
                <span>Each extract</span>
              </div>
            </div>
            <div className="ote-training-rule-grid">
              <article>
                <h3>Five questions</h3>
                <p>{isGeneral ? "Five picture-option rounds." : "Two picture rounds and three text-option rounds."}</p>
              </article>
              <article><h3>Optional review</h3><p>Review each answer immediately, or continue and use the detailed feedback at the end.</p></article>
            </div>
            <p className="ote-listening-audio-note">
              {practiceSet.audioReady
                ? "This set uses the final recorded extracts. Each question runs automatically through both listens and the answer countdown."
                : "The final MP3 recordings can be added without changing the activity. Until then, the runner uses browser voice previews."}
            </p>
            <div className="ote-recorder-actions">
              <button type="button" onClick={startPractice}><Headphones size={18} aria-hidden="true" /> Start practice</button>
            </div>
          </article>
        </section>
      </main>
    );
  }

  if (phase === "complete") {
    return (
      <ListeningComplete
        answers={answers}
        audioReady={practiceSet.audioReady}
        questions={questions}
        score={score}
        setTitle={practiceSet.title}
        listeningLabel={listeningLabel}
        onBack={() => navigate(partPath)}
        onRetry={startPractice}
      />
    );
  }

  return (
    <main className="ote-training-page ote-listening-practice-page">
      <Seo
        title={`OTE ${listeningLabel} Listening Part 1 ${practiceSet.title} | Seif English`}
        description={`Exam-style ${listeningLabel} Listening Part 1 practice.`}
      />
      <button className="ote-training-back" type="button" onClick={() => navigate(partPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Part 1
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">{listeningLabel} Listening Part 1</p>
        <h1>{practiceSet.title}</h1>
        <p>Listen to each short extract twice and choose the best answer.</p>
      </header>

      <section className="ote-practice-runner">
        <div className="ote-practice-progress">
          <div>
            <span>Question {questionIndex + 1} of {questions.length}</span>
            <strong>{questionStage === "answering" ? `${answerSeconds} seconds to answer` : stageLabel(questionStage)}</strong>
          </div>
          <div className="ote-practice-progress-bar" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>

        <article className={`ote-practice-task-card ote-listening-native-task is-${question.kind}`}>
          <div className="ote-recorder-top">
            <div>
              <p className="ote-kicker">
                {question.kind === "pictures" ? "Choose the correct picture" : "Choose the correct answer"}
              </p>
              <h2>{question.prompt}</h2>
              <p>{question.context}</p>
            </div>
            <div className={`ote-recorder-timer ${questionStage === "answering" ? "is-answering" : isPlaying ? "is-listening" : "is-ready"}`} aria-live="polite">
              <Headphones size={22} aria-hidden="true" />
              <strong>
                {questionStage === "answering"
                  ? formatCountdown(answerSeconds)
                  : questionStage === "reviewing"
                    ? "Review"
                    : `${currentPlayCount}/2`}
              </strong>
              <span>
                {questionStage === "answering"
                  ? "Answer now"
                  : questionStage === "reviewing"
                    ? "Feedback"
                    : isPlaying
                      ? "Playing"
                      : "Listens"}
              </span>
            </div>
          </div>

          <div className="ote-listening-native-question">
            <p className="ote-instructions">
              {question.kind === "pictures" ? "Listen and choose the correct picture." : "Listen and choose the correct answer."}
            </p>

            {question.kind === "text" ? (
              <div className="ote-training-options" role="radiogroup" aria-label={question.prompt}>
                {question.options.map((option, optionIndex) => (
                  <button
                    className={[
                      "ote-training-option",
                      currentAnswer === optionIndex ? "is-selected" : "",
                      questionStage === "reviewing" && optionIndex === question.answer ? "is-review-correct" : "",
                      questionStage === "reviewing" && currentAnswer === optionIndex && optionIndex !== question.answer ? "is-review-wrong" : "",
                    ].filter(Boolean).join(" ")}
                    key={option.text}
                    type="button"
                    role="radio"
                    aria-checked={currentAnswer === optionIndex}
                    disabled={questionStage === "reviewing"}
                    onClick={() => chooseAnswer(optionIndex)}
                  >
                    <span><strong>{formatOptionLabel(optionIndex)}.</strong> {option.text}</span>
                    {currentAnswer === optionIndex ? <CheckCircle2 size={20} aria-hidden="true" /> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {question.kind === "pictures" ? (
            <div className="ote-listening-native-pictures" role="radiogroup" aria-label={question.prompt}>
              {question.options.map((option, optionIndex) => (
                <button
                  className={[
                    currentAnswer === optionIndex ? "is-selected" : "",
                    questionStage === "reviewing" && optionIndex === question.answer ? "is-review-correct" : "",
                    questionStage === "reviewing" && currentAnswer === optionIndex && optionIndex !== question.answer ? "is-review-wrong" : "",
                  ].filter(Boolean).join(" ")}
                  key={option.text}
                  type="button"
                  role="radio"
                  aria-label={`Option ${formatOptionLabel(optionIndex)}`}
                  aria-checked={currentAnswer === optionIndex}
                  disabled={questionStage === "reviewing"}
                  onClick={() => chooseAnswer(optionIndex)}
                >
                  <img src={option.image} alt="" />
                  {currentAnswer === optionIndex ? (
                    <CheckCircle2 className="ote-listening-picture-check" size={25} aria-hidden="true" />
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}

          {questionStage === "reviewing" ? (
            <QuestionFeedback
              item={question}
              selectedAnswer={currentAnswer}
              audioReady={practiceSet.audioReady}
            />
          ) : null}

          <div className="ote-recorder-actions ote-listening-native-actions">
            {questionIndex > 0 ? (
              <button className="ote-listening-secondary-action" type="button" onClick={() => goToQuestion(questionIndex - 1)} disabled={isPlaying}>
                Previous question
              </button>
            ) : null}
            {questionStage === "answering" ? (
              <button
                className="ote-listening-secondary-action"
                type="button"
                onClick={reviewCurrentQuestion}
                disabled={currentAnswer == null}
              >
                <BookOpenCheck size={18} aria-hidden="true" />
                Review answer
              </button>
            ) : null}
            <button className="ote-listening-primary-action" type="button" onClick={advance}>
              {questionIndex === questions.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}

function ListeningComplete({
  answers,
  audioReady,
  listeningLabel,
  questions,
  score,
  setTitle,
  onRetry,
  onBack,
}) {
  return (
    <main className="ote-training-page ote-listening-results-page">
      <Seo
        title={`OTE ${listeningLabel} Listening Part 1 Results | Seif English`}
        description={`Review your ${listeningLabel} Listening Part 1 practice.`}
      />
      <section className="ote-practice-complete ote-listening-native-complete">
        <CheckCircle2 size={42} aria-hidden="true" />
        <div>
          <p className="ote-kicker">{setTitle} complete</p>
          <h1>{score} / {questions.length}</h1>
          <p>{score === questions.length ? "Excellent work. Every answer was correct." : "Review the answers, scripts, and distractor logic below."}</p>
        </div>

        <div className="ote-listening-review-list">
          {questions.map((item, index) => {
            const selected = answers[item.id];
            const isCorrect = selected === item.answer;
            return (
              <article className={isCorrect ? "is-correct" : "is-wrong"} key={item.id}>
                <header>
                  <div>
                    <span>Question {index + 1} · {item.profile.level}</span>
                    <h2>{item.prompt}</h2>
                  </div>
                  <strong>{isCorrect ? "Correct" : "Review"}</strong>
                </header>
                <p><b>Correct answer:</b> {formatOptionLabel(item.answer)}. {item.options[item.answer].text}</p>
                {selected != null && !isCorrect ? <p><b>Your answer:</b> {formatOptionLabel(selected)}. {item.options[selected].text}</p> : null}
                <details className="ote-listening-results-feedback">
                  <summary>Detailed feedback, script, and audio <ChevronDown size={18} aria-hidden="true" /></summary>
                  <QuestionFeedback
                    item={item}
                    selectedAnswer={selected}
                    audioReady={audioReady}
                  />
                </details>
              </article>
            );
          })}
        </div>

        <div className="ote-complete-actions">
          <button type="button" onClick={onBack}>Back to listening</button>
          <button type="button" onClick={onRetry}><RotateCcw size={18} aria-hidden="true" /> Try again</button>
        </div>
      </section>
    </main>
  );
}
