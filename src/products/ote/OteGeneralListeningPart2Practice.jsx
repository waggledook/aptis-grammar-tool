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
import { getGeneralListeningPart2Set } from "./data/oteGeneralListeningPart2.js";
import "./styles/ote.css";

const LISTEN_AGAIN_PROMPT_SRC = "/audio/ote/listening/instructions/now-listen-again.mp3";
const AUDIO_VOLUME = 0.82;
const INTERSTITIAL_PAUSE_MS = 1000;

function formatCountdown(seconds) {
  return `00:${String(seconds).padStart(2, "0")}`;
}

function formatOptionLabel(index) {
  return String.fromCharCode(65 + index);
}

function stageLabel(stage) {
  if (stage === "instructions") return "Task instructions";
  if (stage === "preview") return "Look at the task";
  if (stage === "first-listen") return "First listening";
  if (stage === "pause-after-first") return "Preparing repeat cue";
  if (stage === "listen-again-cue") return "Now listen again";
  if (stage === "pause-after-cue") return "Second listening starts shortly";
  if (stage === "second-listen") return "Second listening";
  if (stage === "complete-notes") return "Complete and check your notes";
  return "Ready";
}

function splitForSpeech(script) {
  return script.flatMap((line) => {
    const sentences = line.text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [line.text];
    return sentences.map((text) => text.trim()).filter(Boolean);
  });
}

function evidenceForItem(item) {
  return [
    { quote: item.review.correctQuote, type: "correct" },
    ...item.review.distractors.map((entry) => ({ ...entry, type: "distractor" })),
  ];
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
    parts.push(
      <mark
        className={item.type === "correct" ? "is-correct" : "is-distractor"}
        key={`${item.type}-${item.start}-${index}`}
      >
        {item.quote}
      </mark>
    );
    cursor = item.start + item.quote.length;
  });

  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

function ContextReview({ set, item }) {
  const evidence = evidenceForItem(item);
  const contextLine = set.script.find((line) => line.text.includes(item.review.correctQuote));

  return (
    <details className="ote-listening-gap-context">
      <summary>
        <BookOpenCheck size={17} aria-hidden="true" />
        Review in context
        <ChevronDown size={17} aria-hidden="true" />
      </summary>
      <p className="ote-listening-gap-explanation">{item.review.explanation}</p>
      <div className="ote-listening-feedback-legend" aria-label="Context highlight key">
        <span className="is-correct">Answer evidence</span>
        <span className="is-distractor">Competing information</span>
      </div>
      {contextLine ? (
        <blockquote className="ote-listening-gap-context-script">
          <strong>{contextLine.speaker}:</strong>{" "}
          {renderHighlightedText(contextLine.text, evidence)}
        </blockquote>
      ) : null}
      <div className="ote-listening-gap-distractors">
        {item.review.distractors.map((entry) => (
          <p key={entry.quote}>
            <strong>Why “{entry.quote}” is not the answer:</strong> {entry.note}
          </p>
        ))}
      </div>
    </details>
  );
}

function ChoiceRow({ item, number, selectedAnswer, onChoose, workedExample = false }) {
  return (
    <div className={`ote-general-listening-choice-row ${workedExample ? "is-example" : ""}`}>
      <div className="ote-general-listening-choice-stem">
        <strong>{workedExample ? "Example" : number}</strong>
        <span>{item.before}</span>
      </div>
      <div
        className="ote-general-listening-choice-options"
        role="radiogroup"
        aria-label={workedExample ? "Worked example" : `Question ${number}`}
      >
        {item.options.map((option, optionIndex) => {
          const isSelected = selectedAnswer === optionIndex;
          return (
            <button
              className={isSelected ? "is-selected" : ""}
              key={option}
              type="button"
              role="radio"
              aria-label={`${formatOptionLabel(optionIndex)}. ${option}`}
              aria-checked={isSelected}
              disabled={workedExample}
              onClick={() => onChoose?.(optionIndex)}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChoiceNoteSheet({ set, answers, onChoose }) {
  const entries = [
    { item: set.example, workedExample: true, number: 0 },
    ...set.items.map((item, index) => ({ item, workedExample: false, number: index + 1 })),
  ];
  const sections = [...new Set(entries.map((entry) => entry.item.section))];

  return (
    <div className="ote-general-listening-notes-sheet">
      <h2>{set.title}</h2>
      {sections.map((section) => (
        <section key={section}>
          <h3>{section}</h3>
          {entries
            .filter((entry) => entry.item.section === section)
            .map((entry) => (
              <ChoiceRow
                item={entry.item}
                key={entry.item.id}
                number={entry.number}
                selectedAnswer={entry.workedExample ? entry.item.answer : answers[entry.item.id]}
                workedExample={entry.workedExample}
                onChoose={(optionIndex) => onChoose(entry.item.id, optionIndex)}
              />
            ))}
        </section>
      ))}
    </div>
  );
}

export default function OteGeneralListeningPart2Practice({ user, nativeRoutes = false }) {
  const { setId = "a2-open-day" } = useParams();
  const navigate = useNavigate();
  const practiceSet = useMemo(() => getGeneralListeningPart2Set(setId), [setId]);
  const menuPath = getSitePath(nativeRoutes ? "/listening" : "/ote/listening");
  const partPath = getSitePath(
    nativeRoutes
      ? "/listening/general/part-2-note-completion"
      : "/ote/listening/general/part-2-note-completion"
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

  const score = practiceSet.items.reduce(
    (total, item) => total + (answers[item.id] === item.answer ? 1 : 0),
    0
  );
  const answeredCount = practiceSet.items.filter((item) => answers[item.id] != null).length;
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

  function speakText(lines, token, onComplete) {
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") {
      if (token === sequenceTokenRef.current) onComplete();
      return;
    }

    const englishVoices = window.speechSynthesis
      .getVoices()
      .filter((voice) => String(voice.lang || "").toLowerCase().startsWith("en"));
    const voice =
      englishVoices.find((item) => /serena|samantha|karen|moira|female/i.test(item.name)) ||
      englishVoices[0] ||
      null;
    let lineIndex = 0;

    const speakNext = () => {
      if (token !== sequenceTokenRef.current) return;
      if (lineIndex >= lines.length) {
        onComplete();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(lines[lineIndex]);
      utterance.lang = "en-GB";
      utterance.rate = 0.94;
      utterance.volume = AUDIO_VOLUME;
      utterance.voice = voice;
      lineIndex += 1;
      utterance.onend = speakNext;
      utterance.onerror = speakNext;
      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  }

  function speakInstructionPreview(token, onComplete) {
    speakText([practiceSet.instructions, practiceSet.preparationPrompt], token, onComplete);
  }

  function speakLecturePreview(token, onComplete) {
    speakText(splitForSpeech(practiceSet.script), token, onComplete);
  }

  function playAudio(src, token, fallback, onComplete) {
    const audio = new Audio(src);
    let fellBack = false;
    const useFallback = () => {
      if (fellBack || token !== sequenceTokenRef.current) return;
      fellBack = true;
      audio.pause();
      audioRef.current = null;
      fallback(token, onComplete);
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
    if (!practiceSet.instructionAudioReady) {
      speakInstructionPreview(token, onComplete);
      return;
    }
    playAudio(practiceSet.instructionAudioSrc, token, speakInstructionPreview, onComplete);
  }

  function playLecture(token, onComplete) {
    if (!practiceSet.audioReady) {
      speakLecturePreview(token, onComplete);
      return;
    }
    playAudio(practiceSet.audioSrc, token, speakLecturePreview, onComplete);
  }

  function playRepeatPrompt(token, onComplete) {
    const audio = new Audio(LISTEN_AGAIN_PROMPT_SRC);
    let continued = false;
    const continueSequence = () => {
      if (continued || token !== sequenceTokenRef.current) return;
      continued = true;
      audio.pause();
      audioRef.current = null;
      onComplete();
    };
    audio.preload = "auto";
    audio.volume = AUDIO_VOLUME;
    audio.onended = continueSequence;
    audio.onerror = continueSequence;
    audioRef.current = audio;
    audio.play().catch(continueSequence);
  }

  function beginListeningSequence() {
    stopPlayback();
    const token = sequenceTokenRef.current;

    const finishSequence = () => {
      if (token === sequenceTokenRef.current) setStage("complete-notes");
    };

    const playSecondLecture = () => {
      if (token !== sequenceTokenRef.current) return;
      setStage("second-listen");
      setPlayCount(2);
      playLecture(token, finishSequence);
    };

    const playRepeatCue = () => {
      if (token !== sequenceTokenRef.current) return;
      setStage("listen-again-cue");
      playRepeatPrompt(token, () => {
        if (token !== sequenceTokenRef.current) return;
        setStage("pause-after-cue");
        pauseSequence(token, playSecondLecture);
      });
    };

    setStage("first-listen");
    setPlayCount(1);
    playLecture(token, () => {
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
    setStage("instructions");
    setPhase("active");
    beginInstructionSequence();
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
    logOteTrainingStarted({
      section: "listening",
      part: "part-2",
      mode: "general_multiple_choice_notes",
      taskId: `general-listening-part-2-${practiceSet.id}`,
      taskTitle: `General Listening Part 2 ${practiceSet.title}`,
      variant: "general",
    });
  }

  function chooseAnswer(itemId, optionIndex) {
    setAnswers((current) => ({ ...current, [itemId]: optionIndex }));
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
      part: "part-2",
      mode: "general_multiple_choice_notes",
      taskId: `general-listening-part-2-${practiceSet.id}`,
      taskTitle: `General Listening Part 2 ${practiceSet.title}`,
      variant: "general",
      score,
      total: practiceSet.items.length,
    });
  }

  if (user && user.oteVersion === "advanced") {
    return (
      <main className="ote-training-page">
        <header className="ote-training-hero">
          <p className="ote-kicker">General Listening Part 2</p>
          <h1>Practice not available</h1>
          <p>Switch your OTE workspace to General to open this set.</p>
        </header>
        <button className="topbar-btn" type="button" onClick={() => navigate(menuPath)}>Back to listening</button>
      </main>
    );
  }

  if (phase === "ready") {
    return (
      <main className="ote-training-page ote-listening-ready-page">
        <Seo title="OTE General Listening Part 2 | Seif English" description="General multiple-choice note-completion listening practice." />
        <button className="ote-training-back" type="button" onClick={() => navigate(partPath)}>
          <ArrowLeft size={18} aria-hidden="true" />
          Back to Part 2
        </button>
        <header className="ote-training-hero">
          <p className="ote-kicker">General Listening Part 2 · {practiceSet.level}</p>
          <h1>{practiceSet.title}</h1>
          <p>{practiceSet.description}</p>
        </header>
        <section className="ote-practice-runner">
          <article className="ote-practice-task-card ote-listening-ready-card">
            <div className="ote-recorder-top">
              <div>
                <p className="ote-kicker">Ready to start</p>
                <h2>Choose answers to complete the notes</h2>
              </div>
              <div className="ote-recorder-timer is-ready">
                <Headphones size={22} aria-hidden="true" />
                <strong>2×</strong>
                <span>One talk</span>
              </div>
            </div>
            <div className="ote-training-rule-grid">
              <article><h3>Worked example</h3><p>Question 0 is completed before the task begins.</p></article>
              <article><h3>Five questions</h3><p>Select one answer in each row to complete the notes.</p></article>
            </div>
            {!practiceSet.audioReady || !practiceSet.instructionAudioReady ? (
              <p className="ote-listening-audio-note">
                Browser-voice preview is available now. The final recordings can be added without changing the activity.
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
      <GeneralPartTwoComplete
        set={practiceSet}
        answers={answers}
        score={score}
        onBack={() => navigate(partPath)}
        onRetry={startPractice}
      />
    );
  }

  return (
    <main className="ote-training-page ote-listening-practice-page ote-general-listening-part2-page">
      <Seo title={`${practiceSet.title} | OTE General Listening Part 2`} description="General multiple-choice note-completion listening practice." />
      <button className="ote-training-back" type="button" onClick={() => navigate(partPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Part 2
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">General Listening Part 2 · {practiceSet.level}</p>
        <h1>Multiple-choice notes</h1>
      </header>

      <section className="ote-practice-runner">
        <div className="ote-practice-progress">
          <div>
            <span>{answeredCount} of {practiceSet.items.length} questions answered</span>
            <strong>{stageLabel(stage)}</strong>
          </div>
          <div className="ote-practice-progress-bar" aria-hidden="true">
            <span style={{ width: `${(answeredCount / practiceSet.items.length) * 100}%` }} />
          </div>
        </div>

        <article className="ote-practice-task-card ote-listening-native-task ote-general-listening-part2-task">
          <div className="ote-recorder-top">
            <div>
              <p className="ote-kicker">Complete the notes</p>
              <h2>{practiceSet.instructions}</h2>
              <p>{practiceSet.preparationPrompt}</p>
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

          <ChoiceNoteSheet set={practiceSet} answers={answers} onChoose={chooseAnswer} />

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

function GeneralPartTwoComplete({ set, answers, score, onBack, onRetry }) {
  const allReviewItems = [set.example, ...set.items];
  const fullEvidence = allReviewItems.flatMap((item) => evidenceForItem(item));

  return (
    <main className="ote-training-page ote-listening-results-page">
      <Seo title="OTE General Listening Part 2 Results | Seif English" description="Review your multiple-choice notes." />
      <section className="ote-practice-complete ote-listening-native-complete">
        <CheckCircle2 size={42} aria-hidden="true" />
        <div>
          <p className="ote-kicker">{set.title} complete</p>
          <h1>{score} / {set.items.length}</h1>
          <p>{score === set.items.length ? "Excellent work. Every scored answer is correct." : "Review each answer in the context of the talk."}</p>
        </div>

        <div className="ote-listening-part2-review ote-listening-general-part2-review">
          {set.items.map((item, index) => {
            const selected = answers[item.id];
            const isCorrect = selected === item.answer;
            return (
              <article className={isCorrect ? "is-correct" : "is-wrong"} key={item.id}>
                <span>Question {index + 1} · {item.section}</span>
                <strong>{item.options[item.answer]}</strong>
                <p>
                  {isCorrect
                    ? "Correct"
                    : `Your answer: ${selected == null ? "No answer" : item.options[selected]}`}
                </p>
                <ContextReview set={set} item={item} />
              </article>
            );
          })}
        </div>

        <details className="ote-listening-part2-script-review">
          <summary>Full script, audio, and answer evidence <ChevronDown size={18} aria-hidden="true" /></summary>
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
            <span className="is-correct">Answer evidence</span>
            <span className="is-distractor">Competing information</span>
          </div>
          <div className="ote-listening-script ote-listening-feedback-script">
            {set.script.map((line, index) => (
              <p key={index}>
                <strong>{line.speaker}:</strong>{" "}
                {renderHighlightedText(line.text, fullEvidence)}
              </p>
            ))}
          </div>
          <ol className="ote-listening-part2-review-explanations">
            {allReviewItems.map((item, index) => (
              <li key={item.id}>
                <strong>{index === 0 ? "Worked example" : `Question ${index}`}: {item.options[item.answer]}</strong>
                <span>{item.review.explanation}</span>
              </li>
            ))}
          </ol>
        </details>

        <div className="ote-complete-actions">
          <button type="button" onClick={onBack}>Back to Part 2</button>
          <button type="button" onClick={onRetry}><RotateCcw size={18} aria-hidden="true" /> Try again</button>
        </div>
      </section>
    </main>
  );
}
