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
import { getAdvancedListeningPart2Set } from "./data/oteAdvancedListeningPart2.js";
import "./styles/ote.css";

const LISTEN_AGAIN_PROMPT_SRC = "/audio/ote/listening/instructions/now-listen-again.mp3";
const AUDIO_VOLUME = 0.82;
const INTERSTITIAL_PAUSE_MS = 1000;

function formatCountdown(seconds) {
  return `00:${String(seconds).padStart(2, "0")}`;
}

function normaliseAnswer(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("en-GB")
    .replace(/\s+/g, " ");
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
    return sentences.map((text) => ({ ...line, text: text.trim() })).filter((line) => line.text);
  });
}

function evidenceForGap(gap) {
  return [
    { quote: gap.review.correctQuote, type: "correct" },
    ...gap.review.distractors.map((item) => ({ ...item, type: "distractor" })),
  ];
}

function renderPartTwoHighlightedText(text, evidence) {
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

function GapContextReview({ set, gap }) {
  const evidence = evidenceForGap(gap);
  const contextLine = set.script.find((line) => line.text.includes(gap.review.correctQuote));

  return (
    <details className="ote-listening-gap-context">
      <summary>
        <BookOpenCheck size={17} aria-hidden="true" />
        Review in context
        <ChevronDown size={17} aria-hidden="true" />
      </summary>
      <p className="ote-listening-gap-explanation">{gap.review.explanation}</p>
      <div className="ote-listening-feedback-legend" aria-label="Context highlight key">
        <span className="is-correct">Answer evidence</span>
        <span className="is-distractor">Competing information</span>
      </div>
      {contextLine ? (
        <blockquote className="ote-listening-gap-context-script">
          <strong>{contextLine.speaker}:</strong>{" "}
          {renderPartTwoHighlightedText(contextLine.text, evidence)}
        </blockquote>
      ) : null}
      <div className="ote-listening-gap-distractors">
        {gap.review.distractors.map((item) => (
          <p key={item.quote}>
            <strong>Why “{item.quote}” is not the answer:</strong> {item.note}
          </p>
        ))}
      </div>
    </details>
  );
}

function NoteSheet({ set, answers, onChange, inputRefs, disabled = false }) {
  const sectionNames = [...new Set(set.gaps.map((gap) => gap.section))];

  function focusNextGap(index) {
    inputRefs?.current?.[index + 1]?.focus();
  }

  return (
    <div className="ote-listening-notes-sheet">
      <h2>{set.title}</h2>
      {sectionNames.map((sectionName) => {
        const sectionGaps = set.gaps.filter((gap) => gap.section === sectionName);
        const sectionNotes = set.supportingNotes.filter((note) => note.section === sectionName);

        return (
          <section key={sectionName}>
            <h3>{sectionName}</h3>
            {sectionGaps.map((gap) => {
              const gapIndex = set.gaps.findIndex((item) => item.id === gap.id);
              const beforeNotes = sectionNotes.filter((note) => note.beforeGap === gap.id);
              const afterNotes = sectionNotes.filter((note) => note.afterGap === gap.id);
              const leadingPunctuation = gap.after.match(/^[.,;:]/)?.[0] || "";
              const remainingText = leadingPunctuation ? gap.after.slice(1) : gap.after;
              return (
                <React.Fragment key={gap.id}>
                  {beforeNotes.map((note) => <p key={note.text}>{note.text}</p>)}
                  <p className="ote-listening-note-line">
                    <span>{gap.before} </span>
                    <label>
                      <span className="sr-only">Gap {gapIndex + 1}</span>
                      <span className="ote-listening-gap-number" aria-hidden="true">{gapIndex + 1}</span>
                      <input
                        ref={(node) => {
                          if (inputRefs?.current) inputRefs.current[gapIndex] = node;
                        }}
                        type="text"
                        value={answers[gap.id] || ""}
                        onChange={(event) => onChange?.(gap.id, event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            focusNextGap(gapIndex);
                          }
                        }}
                        autoComplete="off"
                        disabled={disabled}
                        aria-label={`Gap ${gapIndex + 1}`}
                      />
                      {leadingPunctuation ? (
                        <span className="ote-listening-gap-punctuation" aria-hidden="true">{leadingPunctuation}</span>
                      ) : null}
                    </label>
                    <span>{remainingText}</span>
                  </p>
                  {afterNotes.map((note) => <p key={note.text}>{note.text}</p>)}
                </React.Fragment>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}

export default function OteAdvancedListeningPart2Practice({ user, nativeRoutes = false }) {
  const { setId = "set-1" } = useParams();
  const navigate = useNavigate();
  const practiceSet = useMemo(() => getAdvancedListeningPart2Set(setId), [setId]);
  const menuPath = getSitePath(nativeRoutes ? "/listening" : "/ote/listening");
  const partPath = getSitePath(
    nativeRoutes
      ? "/listening/advanced/part-2-note-completion"
      : "/ote/listening/advanced/part-2-note-completion"
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
  const inputRefs = useRef([]);

  const score = practiceSet.gaps.reduce(
    (total, gap) => total + (normaliseAnswer(answers[gap.id]) === normaliseAnswer(gap.answer) ? 1 : 0),
    0
  );
  const answeredCount = practiceSet.gaps.filter((gap) => normaliseAnswer(answers[gap.id])).length;
  const isPlaying = ["instructions", "first-listen", "pause-after-first", "listen-again-cue", "pause-after-cue", "second-listen"].includes(stage);

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

  function speakPreview(token, onComplete) {
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") {
      if (token === sequenceTokenRef.current) onComplete();
      return;
    }

    const lines = splitForSpeech(practiceSet.script);
    const englishVoices = window.speechSynthesis
      .getVoices()
      .filter((voice) => String(voice.lang || "").toLowerCase().startsWith("en"));
    const voice = englishVoices.find((item) => /daniel|george|oliver|ryan|male/i.test(item.name)) || englishVoices[0] || null;
    let lineIndex = 0;

    const speakNext = () => {
      if (token !== sequenceTokenRef.current) return;
      if (lineIndex >= lines.length) {
        onComplete();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(lines[lineIndex].text);
      utterance.lang = "en-GB";
      utterance.rate = 0.92;
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
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") {
      if (token === sequenceTokenRef.current) onComplete();
      return;
    }

    const lines = [practiceSet.instructions, practiceSet.preparationPrompt];
    const englishVoices = window.speechSynthesis
      .getVoices()
      .filter((voice) => String(voice.lang || "").toLowerCase().startsWith("en"));
    const voice = englishVoices[0] || null;
    let lineIndex = 0;

    const speakNext = () => {
      if (token !== sequenceTokenRef.current) return;
      if (lineIndex >= lines.length) {
        onComplete();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(lines[lineIndex]);
      utterance.lang = "en-GB";
      utterance.rate = 0.92;
      utterance.volume = AUDIO_VOLUME;
      utterance.voice = voice;
      lineIndex += 1;
      utterance.onend = speakNext;
      utterance.onerror = speakNext;
      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  }

  function playTaskInstructions(token, onComplete) {
    if (!practiceSet.instructionAudioReady) {
      speakInstructionPreview(token, onComplete);
      return;
    }

    const audio = new Audio(practiceSet.instructionAudioSrc);
    let fellBack = false;
    const fallback = () => {
      if (fellBack || token !== sequenceTokenRef.current) return;
      fellBack = true;
      audio.pause();
      audioRef.current = null;
      speakInstructionPreview(token, onComplete);
    };

    audio.preload = "auto";
    audio.volume = AUDIO_VOLUME;
    audio.onended = () => {
      if (token !== sequenceTokenRef.current) return;
      audioRef.current = null;
      onComplete();
    };
    audio.onerror = fallback;
    audioRef.current = audio;
    audio.play().catch(fallback);
  }

  function playLecture(token, onComplete) {
    if (!practiceSet.audioReady) {
      speakPreview(token, onComplete);
      return;
    }

    const audio = new Audio(practiceSet.audioSrc);
    let fellBack = false;
    const fallback = () => {
      if (fellBack || token !== sequenceTokenRef.current) return;
      fellBack = true;
      audio.pause();
      audioRef.current = null;
      speakPreview(token, onComplete);
    };

    audio.preload = "auto";
    audio.volume = AUDIO_VOLUME;
    audio.onended = () => {
      if (token !== sequenceTokenRef.current) return;
      audioRef.current = null;
      onComplete();
    };
    audio.onerror = fallback;
    audioRef.current = audio;
    audio.play().catch(fallback);
  }

  function playPrompt(token, onComplete) {
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
      if (token !== sequenceTokenRef.current) return;
      setStage("complete-notes");
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
      playPrompt(token, () => {
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
    inputRefs.current = [];
    beginInstructionSequence();
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
    logOteTrainingStarted({
      section: "listening",
      part: "part-2",
      mode: "exam_style_note_completion",
      taskId: `advanced-listening-part-2-${practiceSet.id}`,
      taskTitle: `Advanced Listening Part 2 ${practiceSet.title}`,
      variant: "advanced",
    });
  }

  function updateAnswer(gapId, value) {
    setAnswers((current) => ({ ...current, [gapId]: value }));
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
      mode: "exam_style_note_completion",
      taskId: `advanced-listening-part-2-${practiceSet.id}`,
      taskTitle: `Advanced Listening Part 2 ${practiceSet.title}`,
      variant: "advanced",
      score,
      total: practiceSet.gaps.length,
    });
  }

  if (user && user.oteVersion !== "advanced") {
    return (
      <main className="ote-training-page">
        <header className="ote-training-hero">
          <p className="ote-kicker">Advanced Listening Part 2</p>
          <h1>Practice not available</h1>
          <p>Switch your OTE workspace to Advanced to open this set.</p>
        </header>
        <button className="topbar-btn" type="button" onClick={() => navigate(menuPath)}>Back to listening</button>
      </main>
    );
  }

  if (phase === "ready") {
    return (
      <main className="ote-training-page ote-listening-ready-page">
        <Seo title="OTE Advanced Listening Part 2 | Seif English" description="Exam-style note-completion listening practice." />
        <button className="ote-training-back" type="button" onClick={() => navigate(partPath)}>
          <ArrowLeft size={18} aria-hidden="true" />
          Back to Part 2
        </button>
        <header className="ote-training-hero">
          <p className="ote-kicker">Advanced Listening Part 2</p>
          <h1>{practiceSet.title}</h1>
          <p>{practiceSet.description}</p>
        </header>
        <section className="ote-practice-runner">
          <article className="ote-practice-task-card ote-listening-ready-card">
            <div className="ote-recorder-top">
              <div>
                <p className="ote-kicker">Ready to start</p>
                <h2>Complete the notes as you listen</h2>
              </div>
              <div className="ote-recorder-timer is-ready">
                <Headphones size={22} aria-hidden="true" />
                <strong>2×</strong>
                <span>One lecture</span>
              </div>
            </div>
            <p className="ote-listening-part2-ready-copy">
              The task instructions play first. The clock then shows the preparation time before the lecture plays twice automatically. You can type throughout.
            </p>
            {!practiceSet.audioReady || !practiceSet.instructionAudioReady ? (
              <p className="ote-listening-audio-note">
                {!practiceSet.audioReady
                  ? "The task is ready to preview using a browser voice. Its final recorded lecture can be added later without changing the activity."
                  : "The final lecture is ready. A browser voice will read the task instructions until their recording is added."}
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
      <PartTwoComplete
        set={practiceSet}
        answers={answers}
        score={score}
        onBack={() => navigate(partPath)}
        onRetry={startPractice}
      />
    );
  }

  return (
    <main className="ote-training-page ote-listening-practice-page ote-listening-part2-page">
      <Seo title={`${practiceSet.title} | OTE Advanced Listening Part 2`} description="Advanced note-completion listening practice." />
      <button className="ote-training-back" type="button" onClick={() => navigate(partPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Part 2
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Advanced Listening Part 2</p>
        <h1>Note completion</h1>
      </header>

      <section className="ote-practice-runner">
        <div className="ote-practice-progress">
          <div>
            <span>{answeredCount} of {practiceSet.gaps.length} gaps completed</span>
            <strong>{stageLabel(stage)}</strong>
          </div>
          <div className="ote-practice-progress-bar" aria-hidden="true">
            <span style={{ width: `${(answeredCount / practiceSet.gaps.length) * 100}%` }} />
          </div>
        </div>

        <article className="ote-practice-task-card ote-listening-native-task ote-listening-part2-task">
          <div className="ote-recorder-top">
            <div>
              <p className="ote-kicker">Complete the gaps</p>
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

          <NoteSheet
            set={practiceSet}
            answers={answers}
            onChange={updateAnswer}
            inputRefs={inputRefs}
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

function PartTwoComplete({ set, answers, score, onBack, onRetry }) {
  return (
    <main className="ote-training-page ote-listening-results-page">
      <Seo title="OTE Advanced Listening Part 2 Results | Seif English" description="Review your note-completion answers." />
      <section className="ote-practice-complete ote-listening-native-complete">
        <CheckCircle2 size={42} aria-hidden="true" />
        <div>
          <p className="ote-kicker">{set.title} complete</p>
          <h1>{score} / {set.gaps.length}</h1>
          <p>{score === set.gaps.length ? "Excellent work. Every answer and spelling is correct." : "Compare your notes with the exact words used in the lecture."}</p>
        </div>

        <div className="ote-listening-part2-review">
          {set.gaps.map((gap, index) => {
            const isCorrect = normaliseAnswer(answers[gap.id]) === normaliseAnswer(gap.answer);
            return (
              <article className={isCorrect ? "is-correct" : "is-wrong"} key={gap.id}>
                <span>Gap {index + 1}</span>
                <strong>{gap.answer}</strong>
                <p>
                  {isCorrect
                    ? "Correct"
                    : `Your answer: ${answers[gap.id]?.trim() || "No answer"}`}
                </p>
                <GapContextReview set={set} gap={gap} />
              </article>
            );
          })}
        </div>

        <details className="ote-listening-part2-script-review">
          <summary>Full lecture script, audio, and answer evidence <ChevronDown size={18} aria-hidden="true" /></summary>
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
                {renderPartTwoHighlightedText(
                  line.text,
                  set.gaps.flatMap((gap) => evidenceForGap(gap))
                )}
              </p>
            ))}
          </div>
          <ol className="ote-listening-part2-review-explanations">
            {set.gaps.map((gap, index) => (
              <li key={gap.id}>
                <strong>Gap {index + 1}: {gap.answer}</strong>
                <span>{gap.review.explanation}</span>
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
