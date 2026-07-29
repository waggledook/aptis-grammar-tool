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
import { getAdvancedListeningPart3Set } from "./data/oteAdvancedListeningPart3.js";
import { getGeneralListeningPart3Set } from "./data/oteGeneralListeningPart3.js";
import "./styles/ote.css";

const LISTEN_AGAIN_PROMPT_SRC = "/audio/ote/listening/instructions/now-listen-again.mp3";
const AUDIO_VOLUME = 0.82;
const INTERSTITIAL_PAUSE_MS = 1000;

function formatCountdown(seconds) {
  return `00:${String(seconds).padStart(2, "0")}`;
}

function stageLabel(stage) {
  if (stage === "instructions") return "Task instructions";
  if (stage === "preview") return "Look at the task";
  if (stage === "first-listen") return "First listening";
  if (stage === "pause-after-first") return "Preparing repeat cue";
  if (stage === "listen-again-cue") return "Now listen again";
  if (stage === "pause-after-cue") return "Second listening starts shortly";
  if (stage === "second-listen") return "Second listening";
  if (stage === "complete-task") return "Complete and check your answers";
  return "Ready";
}

function splitForSpeech(script) {
  return script.flatMap((line) => {
    const sentences = line.text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [line.text];
    return sentences
      .map((text) => ({ ...line, text: text.trim() }))
      .filter((line) => line.text);
  });
}

function selectSpeechVoices() {
  const englishVoices = window.speechSynthesis
    ?.getVoices()
    .filter((voice) => String(voice.lang || "").toLowerCase().startsWith("en")) || [];
  const woman =
    englishVoices.find((voice) =>
      /samantha|serena|karen|moira|susan|female|ava|victoria/i.test(voice.name)
    ) ||
    englishVoices[1] ||
    englishVoices[0] ||
    null;
  const man =
    englishVoices.find((voice) =>
      /daniel|george|oliver|ryan|alex|male/i.test(voice.name)
    ) ||
    englishVoices.find((voice) => voice !== woman) ||
    englishVoices[0] ||
    null;
  return { Woman: woman, Man: man };
}

function renderHighlightedText(text, speaker, opinions) {
  const evidence = opinions
    .flatMap((opinion) => opinion.review.evidence)
    .filter((entry) => entry.speaker === speaker)
    .map((entry) => ({ ...entry, start: text.indexOf(entry.quote) }))
    .filter((entry) => entry.start >= 0)
    .sort((a, b) => a.start - b.start);

  if (!evidence.length) return text;

  const parts = [];
  let cursor = 0;
  evidence.forEach((entry, index) => {
    if (entry.start < cursor) return;
    if (entry.start > cursor) parts.push(text.slice(cursor, entry.start));
    parts.push(
      <mark
        className={entry.type === "correct" ? "is-correct" : "is-distractor"}
        key={`${speaker}-${entry.start}-${index}`}
      >
        {entry.quote}
      </mark>
    );
    cursor = entry.start + entry.quote.length;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

export function OpinionMatchingTask({
  set,
  answers,
  onChange,
  disabled = false,
  revealAnswers = false,
}) {
  const rows = [
    ...(set.example ? [{ opinion: set.example, example: true, number: 0 }] : []),
    ...set.opinions.map((opinion, index) => ({
      opinion,
      example: false,
      number: index + 1,
    })),
  ];

  return (
    <div className="ote-listening-opinion-sheet">
      <div className="ote-listening-opinion-heading" aria-hidden="true">
        <span>Opinion</span>
        {set.speakers.map((speaker) => <strong key={speaker.id}>{speaker.label}</strong>)}
      </div>
      {rows.map(({ opinion, example, number }) => (
        <section
          className={`ote-listening-opinion-row ${example ? "is-example" : ""}`}
          key={opinion.id}
        >
          <div className="ote-listening-opinion-copy">
            <strong>{number}</strong>
            <p>{opinion.text}</p>
          </div>
          <div
            className="ote-listening-opinion-options"
            role="radiogroup"
            aria-label={`Opinion ${number}: ${opinion.text}`}
          >
            {set.speakers.map((speaker) => {
              const selected = example
                ? opinion.answer === speaker.id
                : answers[opinion.id] === speaker.id;
              const isAnswer = (example || revealAnswers) && opinion.answer === speaker.id;
              const isWrong = revealAnswers && selected && !isAnswer;
              return (
                <button
                  aria-checked={selected}
                  className={`${selected ? "is-selected" : ""} ${isAnswer ? "is-answer" : ""} ${isWrong ? "is-wrong" : ""}`}
                  disabled={disabled || example}
                  key={speaker.id}
                  onClick={() => onChange?.(opinion.id, speaker.id)}
                  role="radio"
                  type="button"
                >
                  <span aria-hidden="true" />
                  <strong>{speaker.label}</strong>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function OpinionContextReview({ opinion }) {
  return (
    <details className="ote-listening-gap-context">
      <summary>
        <BookOpenCheck size={17} aria-hidden="true" />
        Review in context
        <ChevronDown size={17} aria-hidden="true" />
      </summary>
      <p className="ote-listening-gap-explanation">{opinion.review.explanation}</p>
      <div className="ote-listening-feedback-legend" aria-label="Context highlight key">
        <span className="is-correct">Answer evidence</span>
        <span className="is-distractor">Contrast or competing evidence</span>
      </div>
      <div className="ote-listening-opinion-evidence">
        {opinion.review.evidence.map((entry, index) => (
          <blockquote className={entry.type === "correct" ? "is-correct" : "is-distractor"} key={`${entry.quote}-${index}`}>
            <strong>{entry.speaker}:</strong> “{entry.quote}”
            <span>{entry.note}</span>
          </blockquote>
        ))}
      </div>
    </details>
  );
}

export function OteListeningPart3Practice({
  user,
  nativeRoutes = false,
  variant = "advanced",
}) {
  const isAdvanced = variant === "advanced";
  const variantLabel = isAdvanced ? "Advanced" : "General";
  const { setId = isAdvanced ? "set-1" : "a2-sports-centre" } = useParams();
  const navigate = useNavigate();
  const practiceSet = useMemo(
    () =>
      isAdvanced
        ? getAdvancedListeningPart3Set(setId)
        : getGeneralListeningPart3Set(setId),
    [isAdvanced, setId]
  );
  const menuPath = getSitePath(nativeRoutes ? "/listening" : "/ote/listening");
  const partPath = getSitePath(
    nativeRoutes
      ? `/listening/${variant}/part-3-opinion-matching`
      : `/ote/listening/${variant}/part-3-opinion-matching`
  );
  const [phase, setPhase] = useState("ready");
  const [stage, setStage] = useState("idle");
  const [previewSeconds, setPreviewSeconds] = useState(practiceSet.preparationSeconds);
  const [playCount, setPlayCount] = useState(0);
  const [answers, setAnswers] = useState({});
  const audioRef = useRef(null);
  const sequenceTimeoutRef = useRef(null);
  const sequenceTokenRef = useRef(0);
  const beginSequenceRef = useRef(() => {});
  const completionLoggedRef = useRef(false);

  const score = practiceSet.opinions.reduce(
    (total, opinion) => total + (answers[opinion.id] === opinion.answer ? 1 : 0),
    0
  );
  const answeredCount = practiceSet.opinions.filter((opinion) => answers[opinion.id]).length;
  const isPlaying = [
    "instructions",
    "first-listen",
    "pause-after-first",
    "listen-again-cue",
    "pause-after-cue",
    "second-listen",
  ].includes(stage);

  useEffect(() => () => stopPlayback(), []);

  useEffect(() => {
    if (phase !== "active" || stage !== "preview") return undefined;
    if (previewSeconds <= 0) {
      beginSequenceRef.current();
      return undefined;
    }
    const timeoutId = window.setTimeout(() => {
      setPreviewSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearTimeout(timeoutId);
  }, [phase, previewSeconds, stage]);

  function stopPlayback() {
    sequenceTokenRef.current += 1;
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
  }

  function pauseSequence(token, onComplete) {
    sequenceTimeoutRef.current = window.setTimeout(() => {
      sequenceTimeoutRef.current = null;
      if (token === sequenceTokenRef.current) onComplete();
    }, INTERSTITIAL_PAUSE_MS);
  }

  function speakLines(lines, token, onComplete, alternatingVoices = false) {
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") {
      if (token === sequenceTokenRef.current) onComplete();
      return;
    }
    const voices = selectSpeechVoices();
    let lineIndex = 0;
    const speakNext = () => {
      if (token !== sequenceTokenRef.current) return;
      if (lineIndex >= lines.length) {
        onComplete();
        return;
      }
      const line = lines[lineIndex];
      const utterance = new SpeechSynthesisUtterance(line.text || line);
      utterance.lang = "en-GB";
      utterance.rate = 0.94;
      utterance.volume = AUDIO_VOLUME;
      utterance.voice = alternatingVoices ? voices[line.speaker] : voices.Woman || voices.Man;
      lineIndex += 1;
      utterance.onend = speakNext;
      utterance.onerror = speakNext;
      window.speechSynthesis.speak(utterance);
    };
    speakNext();
  }

  function playSource(src, token, onComplete, fallback) {
    const audio = new Audio(src);
    let fellBack = false;
    const useFallback = () => {
      if (fellBack || token !== sequenceTokenRef.current) return;
      fellBack = true;
      audio.pause();
      audioRef.current = null;
      fallback();
    };
    audio.preload = "auto";
    audio.volume = AUDIO_VOLUME;
    audio.onended = () => {
      if (token !== sequenceTokenRef.current) return;
      audioRef.current = null;
      onComplete();
    };
    audio.onerror = useFallback;
    audioRef.current = audio;
    audio.play().catch(useFallback);
  }

  function playTaskInstructions(token, onComplete) {
    const spokenLines = [practiceSet.instructions, practiceSet.preparationPrompt];
    if (!practiceSet.instructionAudioReady) {
      speakLines(spokenLines, token, onComplete);
      return;
    }
    playSource(
      practiceSet.instructionAudioSrc,
      token,
      onComplete,
      () => speakLines(spokenLines, token, onComplete)
    );
  }

  function playDiscussion(token, onComplete) {
    const speechLines = splitForSpeech(practiceSet.script);
    if (!practiceSet.audioReady) {
      speakLines(speechLines, token, onComplete, true);
      return;
    }
    playSource(
      practiceSet.audioSrc,
      token,
      onComplete,
      () => speakLines(speechLines, token, onComplete, true)
    );
  }

  function playRepeatPrompt(token, onComplete) {
    playSource(LISTEN_AGAIN_PROMPT_SRC, token, onComplete, onComplete);
  }

  function beginListeningSequence() {
    stopPlayback();
    const token = sequenceTokenRef.current;
    const finishSequence = () => {
      if (token === sequenceTokenRef.current) setStage("complete-task");
    };
    const playSecondDiscussion = () => {
      if (token !== sequenceTokenRef.current) return;
      setStage("second-listen");
      setPlayCount(2);
      playDiscussion(token, finishSequence);
    };
    const playRepeatCue = () => {
      if (token !== sequenceTokenRef.current) return;
      setStage("listen-again-cue");
      playRepeatPrompt(token, () => {
        if (token !== sequenceTokenRef.current) return;
        setStage("pause-after-cue");
        pauseSequence(token, playSecondDiscussion);
      });
    };
    setStage("first-listen");
    setPlayCount(1);
    playDiscussion(token, () => {
      if (token !== sequenceTokenRef.current) return;
      setStage("pause-after-first");
      pauseSequence(token, playRepeatCue);
    });
  }

  beginSequenceRef.current = beginListeningSequence;

  function beginInstructionSequence() {
    stopPlayback();
    const token = sequenceTokenRef.current;
    setStage("instructions");
    playTaskInstructions(token, () => {
      if (token !== sequenceTokenRef.current) return;
      setPreviewSeconds(practiceSet.preparationSeconds);
      setStage("preview");
    });
  }

  function startPractice() {
    stopPlayback();
    completionLoggedRef.current = false;
    setAnswers({});
    setPlayCount(0);
    setPreviewSeconds(practiceSet.preparationSeconds);
    setPhase("active");
    setStage("instructions");
    beginInstructionSequence();
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
    logOteTrainingStarted({
      section: "listening",
      part: "part-3",
      mode: "exam_style_opinion_matching",
      taskId: `${variant}-listening-part-3-${practiceSet.id}`,
      taskTitle: `${variantLabel} Listening Part 3 ${practiceSet.title}`,
      variant,
      level: practiceSet.level,
    });
  }

  function finishPractice() {
    stopPlayback();
    setPhase("complete");
    setStage("idle");
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
    if (completionLoggedRef.current) return;
    completionLoggedRef.current = true;
    logOteTrainingCompleted({
      section: "listening",
      part: "part-3",
      mode: "exam_style_opinion_matching",
      taskId: `${variant}-listening-part-3-${practiceSet.id}`,
      taskTitle: `${variantLabel} Listening Part 3 ${practiceSet.title}`,
      variant,
      level: practiceSet.level,
      score,
      total: practiceSet.opinions.length,
    });
  }

  const userVariant = user?.oteVersion === "advanced" ? "advanced" : "general";
  if (user && userVariant !== variant) {
    return (
      <main className="ote-training-page">
        <header className="ote-training-hero">
          <p className="ote-kicker">{variantLabel} Listening Part 3</p>
          <h1>Practice not available</h1>
          <p>Switch your OTE workspace to {variantLabel} to open this set.</p>
        </header>
        <button className="topbar-btn" type="button" onClick={() => navigate(menuPath)}>Back to listening</button>
      </main>
    );
  }

  if (phase === "ready") {
    return (
      <main className="ote-training-page ote-listening-ready-page">
        <Seo title={`OTE ${variantLabel} Listening Part 3 | Seif English`} description="Exam-style opinion-matching listening practice." />
        <button className="ote-training-back" type="button" onClick={() => navigate(partPath)}>
          <ArrowLeft size={18} aria-hidden="true" />
          Back to Part 3
        </button>
        <header className="ote-training-hero">
          <p className="ote-kicker">{variantLabel} Listening Part 3 · {practiceSet.level}</p>
          <h1>{practiceSet.title}</h1>
          <p>{practiceSet.description}</p>
        </header>
        <section className="ote-practice-runner">
          <article className="ote-practice-task-card ote-listening-ready-card">
            <div className="ote-recorder-top">
              <div>
                <p className="ote-kicker">Ready to start</p>
                <h2>Match each opinion to the speaker</h2>
              </div>
              <div className="ote-recorder-timer is-ready">
                <Headphones size={22} aria-hidden="true" />
                <strong>2×</strong>
                <span>One discussion</span>
              </div>
            </div>
            <p className="ote-listening-part2-ready-copy">
              The instructions play first. The clock then shows how much time you have to read
              {practiceSet.example
                ? " the worked example and five opinions"
                : ` all ${practiceSet.opinions.length} opinions`} before the complete discussion plays twice automatically.
            </p>
            {!practiceSet.audioReady ? (
              <p className="ote-listening-audio-note">
                This content preview uses distinct browser voices for the two speakers. Final recorded audio can be added later without changing the activity.
              </p>
            ) : !practiceSet.instructionAudioReady ? (
              <p className="ote-listening-audio-note">
                The discussion uses the final recording. The task instructions currently use a browser voice.
              </p>
            ) : null}
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
      <PartThreeComplete
        answers={answers}
        onBack={() => navigate(partPath)}
        onRetry={startPractice}
        score={score}
        set={practiceSet}
        variantLabel={variantLabel}
      />
    );
  }

  return (
    <main className="ote-training-page ote-listening-practice-page ote-listening-part3-page">
      <Seo title={`${practiceSet.title} | OTE ${variantLabel} Listening Part 3`} description={`${variantLabel} opinion-matching listening practice.`} />
      <button className="ote-training-back" type="button" onClick={() => navigate(partPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Part 3
      </button>
      <header className="ote-training-hero">
        <p className="ote-kicker">{variantLabel} Listening Part 3</p>
        <h1>Opinion matching</h1>
      </header>
      <section className="ote-practice-runner">
        <div className="ote-practice-progress">
          <div>
            <span>{answeredCount} of {practiceSet.opinions.length} opinions matched</span>
            <strong>{stageLabel(stage)}</strong>
          </div>
          <div className="ote-practice-progress-bar" aria-hidden="true">
            <span style={{ width: `${(answeredCount / practiceSet.opinions.length) * 100}%` }} />
          </div>
        </div>
        <article className="ote-practice-task-card ote-listening-native-task ote-listening-part3-task">
          <div className="ote-recorder-top">
            <div>
              <p className="ote-kicker">Woman, man, or both?</p>
              <h2>{practiceSet.instructions}</h2>
              {stage === "preview" ? <p>{practiceSet.preparationPrompt}</p> : null}
            </div>
            <div className={`ote-recorder-timer ${stage === "preview" ? "is-answering" : isPlaying ? "is-listening" : "is-ready"}`} aria-live="polite">
              <Headphones size={22} aria-hidden="true" />
              <strong>
                {stage === "preview"
                  ? formatCountdown(previewSeconds)
                  : stage === "instructions"
                    ? "Task"
                    : `${playCount}/2`}
              </strong>
              <span>
                {stage === "preview"
                  ? "Preparation"
                  : stage === "instructions"
                    ? "Instructions"
                    : isPlaying
                      ? "Playing"
                      : "Listens"}
              </span>
            </div>
          </div>
          <OpinionMatchingTask
            answers={answers}
            onChange={(opinionId, value) =>
              setAnswers((current) => ({ ...current, [opinionId]: value }))
            }
            set={practiceSet}
          />
          <div className="ote-recorder-actions ote-listening-native-actions">
            <button className="ote-listening-primary-action" type="button" onClick={finishPractice}>
              Check answers
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}

function PartThreeComplete({ set, answers, score, onBack, onRetry, variantLabel }) {
  return (
    <main className="ote-training-page ote-listening-results-page">
      <Seo title={`OTE ${variantLabel} Listening Part 3 Results | Seif English`} description="Review your opinion-matching answers." />
      <section className="ote-practice-complete ote-listening-native-complete">
        <CheckCircle2 size={42} aria-hidden="true" />
        <div>
          <p className="ote-kicker">{set.title} complete</p>
          <h1>{score} / {set.opinions.length}</h1>
          <p>{score === set.opinions.length ? "Excellent work. You tracked every speaker’s position." : "Compare each opinion with the evidence and contrasts in the discussion."}</p>
        </div>
        <div className="ote-listening-part3-review">
          {set.opinions.map((opinion, index) => {
            const selected = answers[opinion.id];
            const correct = selected === opinion.answer;
            const answerLabel = set.speakers.find((speaker) => speaker.id === opinion.answer)?.label;
            const selectedLabel = set.speakers.find((speaker) => speaker.id === selected)?.label;
            return (
              <article className={correct ? "is-correct" : "is-wrong"} key={opinion.id}>
                <header>
                  <span>Opinion {index + 1}</span>
                  <strong>{answerLabel}</strong>
                </header>
                <p>{opinion.text}</p>
                <small>{correct ? "Correct" : `Your answer: ${selectedLabel || "No answer"}`}</small>
                <OpinionContextReview opinion={opinion} />
              </article>
            );
          })}
        </div>
        <details className="ote-listening-part2-script-review">
          <summary>Full discussion script, audio, and opinion evidence <ChevronDown size={18} aria-hidden="true" /></summary>
          <div className="ote-listening-feedback-audio">
            <div>
              <Headphones size={20} aria-hidden="true" />
              <span>
                <strong>Listen with the full script</strong>
                <small>Pause, replay, or move backwards and forwards.</small>
              </span>
            </div>
            {set.audioReady ? (
              <audio controls preload="metadata" src={set.audioSrc}>
                Your browser does not support audio playback.
              </audio>
            ) : (
              <p>The final recording is still being prepared. Script feedback is available below.</p>
            )}
          </div>
          <div className="ote-listening-feedback-legend" aria-label="Full transcript highlight key">
            <span className="is-correct">Opinion evidence</span>
            <span className="is-distractor">Contrast or competing evidence</span>
          </div>
          <div className="ote-listening-script ote-listening-feedback-script">
            {set.script.map((line, index) => (
              <p key={`${line.speaker}-${index}`}>
                <strong>{line.speaker}:</strong>{" "}
                {renderHighlightedText(line.text, line.speaker, set.opinions)}
              </p>
            ))}
          </div>
          <ol className="ote-listening-part2-review-explanations">
            {set.opinions.map((opinion, index) => (
              <li key={opinion.id}>
                <strong>Opinion {index + 1}: {set.speakers.find((speaker) => speaker.id === opinion.answer)?.label}</strong>
                <span>{opinion.review.explanation}</span>
              </li>
            ))}
          </ol>
        </details>
        <div className="ote-complete-actions">
          <button type="button" onClick={onBack}>Back to Part 3</button>
          <button type="button" onClick={onRetry}><RotateCcw size={18} aria-hidden="true" /> Try again</button>
        </div>
      </section>
    </main>
  );
}

export default function OteAdvancedListeningPart3Practice(props) {
  return <OteListeningPart3Practice {...props} variant="advanced" />;
}
