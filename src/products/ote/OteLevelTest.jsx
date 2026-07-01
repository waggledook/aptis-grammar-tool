import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownToLine, ArrowRight, CheckCircle2, Mail, Mic, PenLine, Play, RotateCcw, Square, Timer, Volume2 } from "lucide-react";
import Seo from "../../components/common/Seo.jsx";
import {
  logOteLevelProductionStarted,
  logOteLevelProductionSubmitted,
  logOteLevelTestCheckpoint,
  logOteLevelTestCompleted,
  logOteLevelTestStarted,
  requestOteLevelProductionFeedback,
} from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import { OTE_LEVEL_TEST_BATCHES, getOteLevelTestProfile } from "./data/oteLevelTestItems.js";
import { OTE_LEVEL_PRODUCTION_TASKS, shouldRecommendAdvancedDiagnostic } from "./data/oteLevelProductionTasks.js";
import { recordingsToFeedbackAudio } from "./utils/speakingFeedback.js";
import "./styles/ote.css";

const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

function getSupportedMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function formatClock(seconds) {
  const safeSeconds = Math.max(0, Number(seconds || 0));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function countWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

function createLevelTestSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `ote-level-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function scrollElementIntoViewAfterRender(elementRef, fallbackTop = 0) {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      if (elementRef.current) {
        elementRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      window.scrollTo({ top: fallbackTop, behavior: "smooth" });
    });
  });
}

function getBatchScore(items, answers) {
  return items.reduce((score, item) => (answers[item.id] === item.answer ? score + 1 : score), 0);
}

function getAnsweredCount(items, answers) {
  return items.filter((item) => answers[item.id]).length;
}

function getQuestionReportItems(coreItems, routeBatch, answers) {
  const items = [...coreItems, ...(routeBatch?.items || [])];
  return items.map((item, index) => {
    const selectedAnswer = answers[item.id] || "";
    const isCorrect = selectedAnswer === item.answer;
    return {
      number: index + 1,
      id: item.id,
      level: item.level,
      focus: item.focus,
      prompt: item.prompt,
      selectedAnswer,
      correctAnswer: item.answer,
      isCorrect,
      feedback: isCorrect
        ? `Correcto. Este punto evalúa: ${item.focus}.`
        : `Revisa este punto: ${item.focus}. Compara tu respuesta con la opción correcta.`,
    };
  });
}

function buildQuizReportText({ profile, routeKey, batch1Score, batch2Score, totalScore, reportItems, reportTitle = "Informe del test de nivel Oxford Test of English" }) {
  const lines = [
    reportTitle,
    "",
    `Resultado orientativo: ${profile.cefr} | ${profile.title}`,
    `Puntuación: ${totalScore}/20`,
    `Ruta: ${routeKey === "lower" ? "Ruta de consolidación" : "Ruta superior"}`,
    `Primera parte: ${batch1Score}/10`,
    `Segunda parte: ${batch2Score}/10`,
    `Recomendación: ${profile.redirectLabel}`,
    "",
    "Revisión de preguntas",
    "",
  ];

  reportItems.forEach((item) => {
    lines.push(
      `${item.number}. ${item.level} | ${item.focus}`,
      item.prompt,
      `Tu respuesta: ${item.selectedAnswer || "Sin respuesta"}`,
      `Respuesta correcta: ${item.correctAnswer}`,
      `Resultado: ${item.isCorrect ? "Correcto" : "Para revisar"}`,
      `Comentario: ${item.feedback}`,
      ""
    );
  });

  lines.push(
    "Nota: este es un test de nivel breve para orientación, no una puntuación oficial del Oxford Test of English.",
    "La parte opcional de speaking y writing puede hacer la recomendación más precisa."
  );
  return lines.join("\n");
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function OptionButton({ item, option, selected, onSelect }) {
  return (
    <button
      className={`ote-level-option${selected ? " is-selected" : ""}`}
      type="button"
      onClick={() => onSelect(item.id, option)}
    >
      <span>{option}</span>
      {selected ? <CheckCircle2 size={18} aria-hidden="true" /> : null}
    </button>
  );
}

function ProductionCheck({
  profile,
  phase1,
  quizReport,
  coursePath,
  homePath,
  onBackToResult,
  productionTasks = OTE_LEVEL_PRODUCTION_TASKS,
  feedbackMode = "general_production_check",
  showAdvancedDiagnosticCard = false,
  testEdition = "general",
  sessionId = "",
}) {
  const [step, setStep] = useState("mic");
  const [activeSpeakingIndex, setActiveSpeakingIndex] = useState(0);
  const [recordingPhase, setRecordingPhase] = useState("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [recordings, setRecordings] = useState({});
  const [micCheckPhase, setMicCheckPhase] = useState("idle");
  const [micCheckSecondsLeft, setMicCheckSecondsLeft] = useState(0);
  const [micCheckRecording, setMicCheckRecording] = useState(null);
  const [micError, setMicError] = useState("");
  const [writingAnswer, setWritingAnswer] = useState("");
  const [writingStarted, setWritingStarted] = useState(false);
  const [writingSecondsLeft, setWritingSecondsLeft] = useState(productionTasks.writing.recommendedSeconds);
  const [leadEmail, setLeadEmail] = useState("");
  const [leadStatus, setLeadStatus] = useState("idle");
  const [feedbackResult, setFeedbackResult] = useState(null);
  const [feedbackError, setFeedbackError] = useState("");
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const micCheckRecorderRef = useRef(null);
  const micCheckChunksRef = useRef([]);
  const micCheckTimerRef = useRef(null);
  const micCheckRecordingRef = useRef(null);
  const timerRef = useRef(null);
  const writingTimerRef = useRef(null);
  const recordingsRef = useRef({});
  const activeTask = productionTasks.speaking[activeSpeakingIndex];
  const speakingComplete = productionTasks.speaking.every((task) => recordings[task.id]);
  const writingWordCount = countWords(writingAnswer);
  const writingTask = productionTasks.writing;
  const advancedRecommended = showAdvancedDiagnosticCard && shouldRecommendAdvancedDiagnostic(profile);

  useEffect(() => {
    recordingsRef.current = recordings;
  }, [recordings]);

  useEffect(() => {
    micCheckRecordingRef.current = micCheckRecording;
  }, [micCheckRecording]);

  useEffect(() => {
    return () => {
      window.clearInterval(timerRef.current);
      window.clearInterval(micCheckTimerRef.current);
      window.clearInterval(writingTimerRef.current);
      window.speechSynthesis?.cancel?.();
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      if (micCheckRecorderRef.current?.state === "recording") micCheckRecorderRef.current.stop();
      streamRef.current?.getTracks?.().forEach((track) => track.stop());
      if (micCheckRecordingRef.current?.url) URL.revokeObjectURL(micCheckRecordingRef.current.url);
      Object.values(recordingsRef.current).forEach((recording) => {
        if (recording?.url) URL.revokeObjectURL(recording.url);
      });
    };
  }, []);

  function clearTimer() {
    window.clearInterval(timerRef.current);
    timerRef.current = null;
  }

  function clearMicCheckTimer() {
    window.clearInterval(micCheckTimerRef.current);
    micCheckTimerRef.current = null;
  }

  async function ensureStream() {
    if (streamRef.current) return streamRef.current;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setMicError("La grabación no está disponible en este navegador.");
      return null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicError("");
      return stream;
    } catch (error) {
      console.warn("[OTE level production] microphone access failed", error);
      setMicError("No se ha podido acceder al micrófono. Permite el acceso y vuelve a intentarlo.");
      return null;
    }
  }

  function playTone(durationSeconds = 0.8) {
    return new Promise((resolve) => {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
          resolve();
          return;
        }
        const audioContext = new AudioContextClass();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const startTime = audioContext.currentTime;
        const endTime = startTime + durationSeconds;
        oscillator.frequency.value = 880;
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.04);
        gain.gain.setValueAtTime(0.18, Math.max(startTime + 0.05, endTime - 0.12));
        gain.gain.exponentialRampToValueAtTime(0.001, endTime);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.onended = () => {
          audioContext.close?.();
          resolve();
        };
        oscillator.start(startTime);
        oscillator.stop(endTime);
      } catch {
        // The tone is a convenience only; recording still works without it.
        resolve();
      }
    });
  }

  async function startMicCheck() {
    const stream = await ensureStream();
    if (!stream || micCheckPhase === "recording") return;
    if (micCheckRecordingRef.current?.url) URL.revokeObjectURL(micCheckRecordingRef.current.url);
    setMicCheckRecording(null);
    setMicError("");
    setMicCheckPhase("recording");
    setMicCheckSecondsLeft(5);
    micCheckChunksRef.current = [];

    const mimeType = getSupportedMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    micCheckRecorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data?.size) micCheckChunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      clearMicCheckTimer();
      const blob = new Blob(micCheckChunksRef.current, { type: mimeType || "audio/webm" });
      const url = URL.createObjectURL(blob);
      const recording = { blob, url };
      micCheckRecordingRef.current = recording;
      setMicCheckRecording(recording);
      setMicCheckPhase("ready");
      setMicCheckSecondsLeft(0);
    };

    await playTone();
    recorder.start();
    let remaining = 5;
    clearMicCheckTimer();
    micCheckTimerRef.current = window.setInterval(() => {
      remaining -= 1;
      setMicCheckSecondsLeft(Math.max(0, remaining));
      if (remaining <= 0) {
        clearMicCheckTimer();
        if (recorder.state === "recording") recorder.stop();
      }
    }, 1000);
  }

  function stopMicCheck() {
    clearMicCheckTimer();
    if (micCheckRecorderRef.current?.state === "recording") {
      micCheckRecorderRef.current.stop();
    }
  }

  function runCountdown(seconds, phase, onDone) {
    clearTimer();
    setRecordingPhase(phase);
    setSecondsLeft(seconds);
    if (seconds <= 0) {
      onDone?.();
      return;
    }
    let remaining = seconds;
    timerRef.current = window.setInterval(() => {
      remaining -= 1;
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearTimer();
        onDone?.();
      }
    }, 1000);
  }

  function getSpeakingTaskText(task) {
    if (!task) return "";
    return [
      task.prompt,
      ...(task.bulletPoints || []),
      ...(task.imageOptions || []).map((image) => image.label),
      ...(task.imageIdeas || []),
      ...(task.ideaPrompts || []),
    ].filter(Boolean).join(". ");
  }

  function playAudioSource(src) {
    return new Promise((resolve) => {
      if (!src) {
        resolve();
        return;
      }
      const audio = new Audio(src);
      audio.onended = resolve;
      audio.onerror = resolve;
      audio.play().catch(resolve);
    });
  }

  function getPrepInstructionText(task) {
    if (!task?.preparationSeconds) return "";
    return task.prepInstructionText || `You now have ${task.preparationSeconds} seconds to think about your answer.`;
  }

  function readSpeakingTask(task) {
    return new Promise((resolve) => {
      if (!task) {
        resolve();
        return;
      }

      if (task.audioSrc) {
        playAudioSource(task.audioSrc).then(resolve);
        return;
      }

      const text = getSpeakingTaskText(task);
      if (!text || !window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") {
        window.setTimeout(resolve, 800);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-GB";
      utterance.rate = 0.95;
      utterance.onend = resolve;
      utterance.onerror = resolve;
      window.speechSynthesis.speak(utterance);
    });
  }

  function readPrepInstruction(task) {
    return new Promise((resolve) => {
      const text = getPrepInstructionText(task);
      if (task?.prepAudioSrc) {
        playAudioSource(task.prepAudioSrc).then(resolve);
        return;
      }
      if (!text || !window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") {
        window.setTimeout(resolve, 500);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-GB";
      utterance.rate = 0.95;
      utterance.onend = resolve;
      utterance.onerror = resolve;
      window.speechSynthesis.speak(utterance);
    });
  }

  async function startSpeakingTask() {
    if (!activeTask || recordings[activeTask.id] || recordingPhase !== "idle") return;
    const stream = await ensureStream();
    if (!stream) return;
    setRecordingPhase("reading");
    setSecondsLeft(0);
    await readSpeakingTask(activeTask);
    if (activeTask.preparationSeconds > 0) {
      setRecordingPhase("preparing");
      setSecondsLeft(activeTask.preparationSeconds);
      await readPrepInstruction(activeTask);
      runCountdown(activeTask.preparationSeconds, "preparing", () => startRecording(stream));
    } else {
      startRecording(stream);
    }
  }

  async function startRecording(stream) {
    if (!activeTask) return;
    await playTone();
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
      setRecordings((current) => ({
        ...current,
        [activeTask.id]: {
          taskId: activeTask.id,
          title: activeTask.title,
          prompt: activeTask.prompt,
          durationSeconds: activeTask.responseSeconds,
          blob,
          url,
        },
      }));
      setRecordingPhase("done");
      setSecondsLeft(0);
    };
    recorder.start();
    runCountdown(activeTask.responseSeconds, "recording", () => {
      if (recorder.state === "recording") recorder.stop();
    });
  }

  function moveToNextSpeaking() {
    clearTimer();
    if (activeSpeakingIndex < productionTasks.speaking.length - 1) {
      setActiveSpeakingIndex((current) => current + 1);
      setRecordingPhase("idle");
      setSecondsLeft(0);
      window.speechSynthesis?.cancel?.();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setStep("writing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startWritingTimer() {
    if (writingStarted) return;
    setWritingStarted(true);
    let remaining = writingSecondsLeft;
    writingTimerRef.current = window.setInterval(() => {
      remaining -= 1;
      setWritingSecondsLeft(Math.max(0, remaining));
      if (remaining <= 0) {
        window.clearInterval(writingTimerRef.current);
      }
    }, 1000);
  }

  async function submitLead(event) {
    event.preventDefault();
    const trimmedEmail = leadEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setLeadStatus("invalid");
      return;
    }
    setLeadStatus("loading");
    setFeedbackError("");
    try {
      const orderedRecordings = productionTasks.speaking
        .map((task) => recordings[task.id])
        .filter(Boolean);
      const feedbackAudio = await recordingsToFeedbackAudio(orderedRecordings, "ote-level-production");
      const inputText = writingTask.inputEmail
        ? [
          `From: ${writingTask.inputEmail.from}`,
          `Subject: ${writingTask.inputEmail.subject}`,
          ...writingTask.inputEmail.body,
        ].join("\n")
        : [
          writingTask.question ? `Question: ${writingTask.question}` : "",
          writingTask.topicPrompts?.length ? `Topic prompts: ${writingTask.topicPrompts.join("; ")}` : "",
          writingTask.audience ? `Audience: ${writingTask.audience}` : "",
          writingTask.register ? `Register: ${writingTask.register}` : "",
        ].filter(Boolean).join("\n");
      const result = await requestOteLevelProductionFeedback({
        mode: feedbackMode,
        lead: { email: trimmedEmail },
        phase1,
        quizReport,
        speaking: { recordings: feedbackAudio },
        writing: {
          task: {
            id: writingTask.id,
            title: writingTask.title,
            inputText,
            question: writingTask.question,
            prompt: writingTask.prompt,
            requiredPoints: writingTask.bulletPoints,
            expectedContent: writingTask.expectedContent,
            assessmentFocus: writingTask.assessmentFocus,
            targetWordsMin: writingTask.targetWordsMin,
            targetWordsMax: writingTask.targetWordsMax,
          },
          answer: {
            text: writingAnswer,
            wordCount: writingWordCount,
          },
        },
      });
      logOteLevelProductionSubmitted({
        sessionId,
        edition: testEdition,
        mode: feedbackMode,
        routeKey: phase1?.routeKey || "",
        profileId: phase1?.profile?.id || "",
        cefr: phase1?.profile?.cefr || "",
        totalScore: phase1?.totalScore ?? null,
        speakingRecordings: feedbackAudio.length,
        writingWordCount,
        productionEstimate: result?.feedback?.productionEstimate || "",
        courseRecommendation: result?.feedback?.courseRecommendation || "",
        reportEmailed: !!result?.reportEmailed,
      });
      setFeedbackResult(result);
      setLeadStatus("ready");
    } catch (error) {
      console.error("[OTE level production] feedback failed", error);
      setFeedbackError(error?.message || "No se ha podido generar el informe completo en este momento.");
      setLeadStatus("error");
    }
  }

  if (step === "intro") {
    return (
      <section className="ote-production-shell">
        <div className="ote-level-result-banner">
          <span>Siguiente paso</span>
          <h2>Completa tu test con speaking y writing</h2>
          <p>
            Completa tres tareas breves de speaking y un email corto. Así podemos confirmar mejor tu nivel para Oxford Test of English y recomendarte el curso más adecuado.
          </p>
        </div>
        <div className="ote-production-summary">
          <article><Mic size={22} aria-hidden="true" /><strong>2 minutos de speaking</strong><span>Pregunta personal, mensaje de voz y una respuesta más larga.</span></article>
          <article><PenLine size={22} aria-hidden="true" /><strong>7 minutos de writing</strong><span>Un email breve con contador de palabras.</span></article>
          <article><Mail size={22} aria-hidden="true" /><strong>Informe por email</strong><span>Te enviaremos el informe completo después de la muestra.</span></article>
        </div>
        <div className="ote-level-cta-row">
          <button className="ote-level-primary" type="button" onClick={() => setStep("mic")}>
            Continuar
            <ArrowRight size={18} aria-hidden="true" />
          </button>
          <a className="ote-level-secondary" href={coursePath}>Saltar y ver cursos</a>
        </div>
      </section>
    );
  }

  if (step === "mic") {
    return (
      <section className="ote-production-shell">
        <div className="ote-production-task">
          <span>Comprobación del micrófono</span>
          <h2>Prueba tu micrófono antes de empezar</h2>
          <p>Graba una frase corta y escúchala. Esta prueba no se evalúa ni se envía: solo confirma que el audio se guarda correctamente en tu navegador.</p>
          {micError ? <p className="ote-production-warning">{micError}</p> : null}
          <div className={`ote-mic-check-card ote-mic-check-${micCheckPhase}`}>
            <div>
              <strong>
                {micCheckPhase === "recording"
                  ? "Grabando prueba"
                  : micCheckPhase === "ready"
                    ? "Escucha tu prueba"
                    : "Grabación de prueba"}
              </strong>
              <p>
                {micCheckPhase === "recording"
                  ? "Di algo como: This is my microphone test."
                  : micCheckPhase === "ready"
                    ? "Si puedes escucharte con claridad, ya puedes continuar."
                    : "Pulsa grabar y habla durante unos segundos."}
              </p>
            </div>
            {micCheckPhase === "recording" ? (
              <div className="ote-mic-check-status" aria-live="polite">
                <Mic size={20} aria-hidden="true" />
                <span>{micCheckSecondsLeft}s</span>
              </div>
            ) : null}
            {micCheckRecording?.url ? (
              <audio className="ote-mic-check-audio" controls src={micCheckRecording.url} />
            ) : null}
          </div>
          <div className="ote-level-cta-row">
            {micCheckPhase === "recording" ? (
              <button className="ote-level-secondary" type="button" onClick={stopMicCheck}>
                Detener prueba
                <Square size={18} aria-hidden="true" />
              </button>
            ) : (
              <button className={micCheckPhase === "ready" ? "ote-level-secondary" : "ote-level-primary"} type="button" onClick={startMicCheck}>
                {micCheckPhase === "ready" ? "Grabar otra vez" : "Grabar prueba de 5 segundos"}
                {micCheckPhase === "ready" ? <RotateCcw size={18} aria-hidden="true" /> : <Mic size={18} aria-hidden="true" />}
              </button>
            )}
            {micCheckPhase === "ready" ? (
              <button className="ote-level-primary" type="button" onClick={() => {
                setStep("speaking");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}>
                Continuar a speaking
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            ) : null}
            <button className="ote-level-secondary" type="button" onClick={onBackToResult}>Volver al resultado</button>
          </div>
        </div>
      </section>
    );
  }

  if (step === "speaking") {
    const activeRecording = recordings[activeTask.id];
    const taskHasStarted = recordingPhase !== "idle" || !!activeRecording;
    const prepInstructionText = getPrepInstructionText(activeTask);
    const stageLabel = recordingPhase === "reading"
      ? "Escucha la pregunta"
      : recordingPhase === "preparing"
        ? "Preparación"
        : recordingPhase === "recording"
          ? "Ahora habla"
          : recordingPhase === "done"
            ? "Grabación guardada"
            : "Listo para empezar";
    const stageHelp = recordingPhase === "reading"
      ? "La pregunta aparecerá y se leerá antes de iniciar el tiempo."
      : recordingPhase === "preparing"
        ? "No hables todavía. Usa este tiempo para preparar tu respuesta."
        : recordingPhase === "recording"
          ? "Habla ahora. La grabación está en marcha."
          : recordingPhase === "done"
            ? "Puedes escuchar tu grabación antes de continuar."
            : "Pulsa empezar para ver y escuchar la pregunta.";
    const timerLabel = recordingPhase === "preparing"
      ? "preparación"
      : recordingPhase === "recording"
        ? "grabando"
        : recordingPhase === "reading"
          ? "escuchando"
          : "tiempo de respuesta";
    return (
      <section className="ote-production-shell">
        <div className="ote-level-status">
          <div>
            <Mic size={20} aria-hidden="true" />
            <strong>Speaking {activeSpeakingIndex + 1} de {productionTasks.speaking.length}: {activeTask.title}</strong>
            <span>{stageHelp}</span>
          </div>
          <div>
            <strong>{recordingPhase === "reading" ? "..." : recordingPhase === "idle" ? formatClock(activeTask.responseSeconds) : formatClock(secondsLeft)}</strong>
            <span>{timerLabel}</span>
          </div>
        </div>
        <article className={`ote-production-task ote-speaking-stage-${recordingPhase}`}>
          <span>{stageLabel}</span>
          {taskHasStarted ? (
            <>
              <h2>{activeTask.prompt}</h2>
              {recordingPhase === "preparing" && prepInstructionText ? (
                <p className="ote-speaking-prep-instruction">{prepInstructionText}</p>
              ) : null}
              {activeTask.bulletPoints?.length ? <ul>{activeTask.bulletPoints.map((point) => <li key={point}>{point}</li>)}</ul> : null}
              {activeTask.imageOptions?.length ? (
                <div className="ote-part34-image-grid ote-production-image-grid">
                  {activeTask.imageOptions.map((image) => (
                    <figure key={image.id}>
                      {image.src ? (
                        <img src={image.src} alt={image.description || ""} />
                      ) : (
                        <div className="ote-part34-image-placeholder" aria-hidden="true">
                          <span>{image.label}</span>
                        </div>
                      )}
                      <figcaption>
                        <strong>{image.label}</strong>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ) : null}
              {activeTask.imageIdeas?.length ? (
                <div className="ote-production-ideas">
                  {activeTask.imageIdeas.map((idea) => <strong key={idea}>{idea}</strong>)}
                </div>
              ) : null}
              {activeTask.ideaPrompts?.length ? (
                <div className="ote-production-ideas">
                  {activeTask.ideaPrompts.map((idea) => <strong key={idea}>{idea}</strong>)}
                </div>
              ) : null}
            </>
          ) : (
            <div className="ote-speaking-ready-card">
              <strong>{activeTask.topic || activeTask.title}</strong>
              <p>{activeTask.instructions}</p>
              <p>La pregunta no se muestra hasta que empieces la tarea.</p>
            </div>
          )}
          {activeRecording ? (
            <div className="ote-production-recording">
              <audio controls playsInline preload="metadata" src={activeRecording.url} />
              <span>Grabación guardada. En este test, cada tarea se graba una sola vez.</span>
            </div>
          ) : (
            <div className="ote-level-cta-row">
              <button className="ote-level-primary" type="button" disabled={recordingPhase !== "idle"} onClick={startSpeakingTask}>
                {recordingPhase === "reading" ? "Leyendo pregunta..." : recordingPhase === "preparing" ? "Preparando..." : recordingPhase === "recording" ? "Grabando..." : "Empezar tarea"}
                {recordingPhase === "recording" ? <Square size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
              </button>
            </div>
          )}
          {micError ? <p className="ote-production-warning">{micError}</p> : null}
        </article>
        <div className="ote-level-actions">
          <button className="ote-level-secondary" type="button" onClick={onBackToResult}>Volver al resultado</button>
          <button className="ote-level-primary" type="button" disabled={!activeRecording} onClick={moveToNextSpeaking}>
            {activeSpeakingIndex < productionTasks.speaking.length - 1 ? "Siguiente tarea de speaking" : "Continuar a writing"}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
        {speakingComplete ? <p className="ote-production-note">Muestras de speaking completadas.</p> : null}
      </section>
    );
  }

  if (step === "writing") {
    return (
      <section className="ote-production-shell">
        <div className="ote-level-status">
          <div>
            <PenLine size={20} aria-hidden="true" />
            <strong>{writingTask.title}</strong>
            <span>Escribe {writingTask.targetWordsMin}-{writingTask.targetWordsMax} palabras. El temporizador es orientativo; no se cortará tu respuesta.</span>
          </div>
          <div>
            <strong>{formatClock(writingSecondsLeft)}</strong>
            <span>{writingWordCount} palabras</span>
          </div>
        </div>
        <div className="ote-production-writing">
          {writingTask.inputEmail ? (
            <article className="ote-production-email">
              <p><strong>De:</strong> {writingTask.inputEmail.from}</p>
              <p><strong>Asunto:</strong> {writingTask.inputEmail.subject}</p>
              {writingTask.inputEmail.body.map((line) => <p key={line}>{line}</p>)}
            </article>
          ) : (
            <article className="ote-production-email">
              <p><strong>Pregunta:</strong> {writingTask.question}</p>
              {writingTask.topicPrompts?.length ? (
                <ul>{writingTask.topicPrompts.map((point) => <li key={point}>{point}</li>)}</ul>
              ) : null}
            </article>
          )}
          <article className="ote-production-task">
            <span>{writingTask.prompt}</span>
            <ul>{writingTask.bulletPoints.map((point) => <li key={point}>{point}</li>)}</ul>
            <textarea
              value={writingAnswer}
              onChange={(event) => setWritingAnswer(event.target.value)}
              onFocus={startWritingTimer}
              placeholder={writingTask.inputEmail ? "Escribe tu email aquí..." : "Escribe tu respuesta aquí..."}
            />
            {writingWordCount > 0 && writingWordCount < writingTask.targetWordsMin ? (
              <p className="ote-production-warning">Tu respuesta tiene menos de {writingTask.targetWordsMin} palabras, así que habrá menos información para evaluar tu writing.</p>
            ) : null}
            {writingWordCount > writingTask.targetWordsMax ? (
              <p className="ote-production-warning">Has escrito más de {writingTask.targetWordsMax} palabras. No pasa nada, pero la tarea está pensada para ser breve.</p>
            ) : null}
          </article>
        </div>
        <div className="ote-level-actions">
          <button className="ote-level-secondary" type="button" onClick={() => setStep("speaking")}>Volver a speaking</button>
          <button className="ote-level-primary" type="button" disabled={writingWordCount < 35} onClick={() => {
            setStep("lead");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}>
            Obtener mi informe
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </section>
    );
  }

  if (step === "lead") {
    return (
      <section className="ote-production-shell">
        <div className="ote-level-result-banner">
          <span>Muestras completadas</span>
          <h2>Recibe tu informe completo</h2>
          <p>
            Introduce tu email para recibir el informe completo, con tus correcciones de Use of English y una estimación de speaking/writing. Nuestro equipo académico recibirá una copia para poder recomendarte el siguiente paso.
          </p>
        </div>
        {advancedRecommended ? (
          <div className="ote-level-route-card">
            <span>Posible ruta avanzada</span>
            <strong>Recomendamos una evaluación avanzada de Oxford Test of English</strong>
            <p>Tu resultado en Use of English sugiere que podrías estar preparado/a para una prueba avanzada más específica.</p>
          </div>
        ) : null}
        <form className="ote-production-lead-form" onSubmit={submitLead}>
          <label htmlFor="ote-production-email">Email</label>
          <input
            id="ote-production-email"
            type="email"
            value={leadEmail}
            onChange={(event) => {
              setLeadEmail(event.target.value);
              setLeadStatus("idle");
            }}
            placeholder="you@example.com"
          />
          {leadStatus === "invalid" ? <p className="ote-production-warning">Introduce un email válido.</p> : null}
          {leadStatus === "ready" && feedbackResult?.feedback ? (
            <div className="ote-production-feedback-result">
              <span>Estimación de speaking/writing</span>
              <h3>{feedbackResult.feedback.productionEstimate}</h3>
              <p>{feedbackResult.feedback.candidateMessage}</p>
              <p><strong>Punto fuerte:</strong> {feedbackResult.feedback.strength}</p>
              <p><strong>Prioridad:</strong> {feedbackResult.feedback.priority}</p>
              <p><strong>Ruta recomendada:</strong> {feedbackResult.feedback.courseRecommendation}</p>
              <p>
                <strong>Email:</strong>{" "}
                {feedbackResult.reportEmailed
                  ? `Hemos enviado tu informe a ${leadEmail.trim()}.`
                  : "Tu informe está listo aquí. No hemos podido confirmar el envío por email, así que usa la descarga del resultado como copia."}
              </p>
            </div>
          ) : null}
          {leadStatus === "error" ? <p className="ote-production-warning">{feedbackError}</p> : null}
          <button className="ote-level-primary" type="submit" disabled={leadStatus === "loading"}>
            {leadStatus === "loading" ? "Generando informe..." : "Generar mi informe"}
            <Mail size={18} aria-hidden="true" />
          </button>
        </form>
        <div className="ote-level-actions is-results">
          <a className="ote-level-secondary" href={coursePath}>Ver curso recomendado</a>
          <a className="ote-level-secondary" href={homePath}>Volver a OTE</a>
        </div>
      </section>
    );
  }

  return null;
}

const DEFAULT_LEVEL_TEST_COPY = {
  testEdition: "general",
  seoTitle: "Test de nivel Oxford Test of English | OTE Seif",
  seoDescription: "Haz un test de nivel rápido para Oxford Test of English y recibe una orientación CEFR en menos de 10 minutos.",
  kicker: "Test de nivel Oxford Test of English",
  heading: "Comprueba tu nivel para Oxford Test of English",
  intro: "Responde 20 preguntas breves de Use of English. Al terminar, verás tu nivel orientativo y una ruta de preparación recomendada.",
  firstPartTitle: "Primera parte",
  firstPartSubtitle: "10 preguntas iniciales",
  lowerPartSubtitle: "10 preguntas para consolidar base",
  upperPartSubtitle: "10 preguntas de nivel más alto",
  reportTitle: "Informe del test de nivel Oxford Test of English",
  downloadFilename: "informe-nivel-oxford-test-of-english.txt",
  feedbackMode: "general_production_check",
  showAdvancedDiagnosticSuggestion: true,
};

export default function OteLevelTest({
  nativeRoutes = false,
  batches = OTE_LEVEL_TEST_BATCHES,
  getProfile = getOteLevelTestProfile,
  productionTasks = OTE_LEVEL_PRODUCTION_TASKS,
  copy = {},
}) {
  const testCopy = { ...DEFAULT_LEVEL_TEST_COPY, ...copy };
  const sessionIdRef = useRef(createLevelTestSessionId());
  const startedLoggedRef = useRef(false);
  const checkpointLoggedRef = useRef(false);
  const completedLoggedRef = useRef(false);
  const productionStartedLoggedRef = useRef(false);
  const quizTopRef = useRef(null);
  const [phase, setPhase] = useState("batch1");
  const [routeKey, setRouteKey] = useState("");
  const [answers, setAnswers] = useState({});
  const coreItems = batches.core.items;
  const routeBatch = routeKey ? batches[routeKey] : null;
  const activeItems = phase === "batch1" ? coreItems : routeBatch?.items || [];
  const batch1Score = useMemo(() => getBatchScore(coreItems, answers), [answers, coreItems]);
  const batch2Score = useMemo(() => (routeBatch ? getBatchScore(routeBatch.items, answers) : 0), [answers, routeBatch]);
  const totalScore = batch1Score + batch2Score;
  const answeredCount = getAnsweredCount(activeItems, answers);
  const totalAnswered = getAnsweredCount(coreItems, answers) + (routeBatch ? getAnsweredCount(routeBatch.items, answers) : 0);
  const speakingMinutes = Math.max(1, Math.ceil(productionTasks.speaking.reduce(
    (total, task) => total + Number(task.preparationSeconds || 0) + Number(task.responseSeconds || 0),
    0
  ) / 60));
  const writingMinutes = Math.max(1, Math.round(Number(productionTasks.writing.recommendedSeconds || 0) / 60));
  const isBatchComplete = answeredCount === activeItems.length;
  const profile = routeKey ? getProfile(routeKey, totalScore) : null;
  const coursePath = profile ? getSitePath(nativeRoutes ? profile.coursePath.replace("/ote", "") : profile.coursePath) : "";
  const homePath = getSitePath(nativeRoutes ? "/" : "/ote");
  const advancedTestPath = getSitePath(nativeRoutes ? "/level-test/advanced" : "/ote/level-test/advanced");
  const reportItems = useMemo(
    () => (routeBatch ? getQuestionReportItems(coreItems, routeBatch, answers) : []),
    [answers, coreItems, routeBatch]
  );
  const quizReportText = useMemo(
    () => (profile && routeBatch
      ? buildQuizReportText({
        profile,
        routeKey,
        batch1Score,
        batch2Score,
        totalScore,
        reportItems,
        reportTitle: testCopy.reportTitle,
      })
      : ""),
    [batch1Score, batch2Score, profile, reportItems, routeBatch, routeKey, testCopy.reportTitle, totalScore]
  );
  const quizReport = useMemo(
    () => (profile && routeBatch ? {
      result: {
        cefr: profile.cefr,
        title: profile.title,
        profileId: profile.id,
        summary: profile.summary,
        redirectLabel: profile.redirectLabel,
        coursePath: profile.coursePath,
        commercialCue: profile.commercialCue,
      },
      routeKey,
      scores: {
        batch1: batch1Score,
        batch2: batch2Score,
        total: totalScore,
        max: 20,
      },
      items: reportItems,
      text: quizReportText,
    } : null),
    [batch1Score, batch2Score, profile, quizReportText, reportItems, routeBatch, routeKey, totalScore]
  );

  useEffect(() => {
    if (startedLoggedRef.current) return;
    startedLoggedRef.current = true;
    logOteLevelTestStarted({
      sessionId: sessionIdRef.current,
      edition: testCopy.testEdition,
      batchId: batches.core?.id || "",
      totalQuestions: 20,
    });
  }, [batches.core?.id, testCopy.testEdition]);

  function chooseAnswer(itemId, option) {
    setAnswers((current) => ({ ...current, [itemId]: option }));
  }

  function continueFromBatch1() {
    const nextRouteKey = batch1Score <= 5 ? "lower" : "upper";
    if (!checkpointLoggedRef.current) {
      checkpointLoggedRef.current = true;
      logOteLevelTestCheckpoint({
        sessionId: sessionIdRef.current,
        edition: testCopy.testEdition,
        checkpoint: "batch1",
        batchId: batches.core?.id || "",
        batch1Score,
        routeKey: nextRouteKey,
        nextBatchId: batches[nextRouteKey]?.id || "",
      });
    }
    setRouteKey(nextRouteKey);
    setPhase("batch2");
    scrollElementIntoViewAfterRender(quizTopRef);
  }

  function finishTest() {
    if (!completedLoggedRef.current) {
      completedLoggedRef.current = true;
      const nextProfile = getProfile(routeKey, totalScore);
      logOteLevelTestCompleted({
        sessionId: sessionIdRef.current,
        edition: testCopy.testEdition,
        routeKey,
        batch1Score,
        batch2Score,
        totalScore,
        maxScore: 20,
        profileId: nextProfile?.id || "",
        cefr: nextProfile?.cefr || "",
        redirectLabel: nextProfile?.redirectLabel || "",
      });
    }
    setPhase("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetTest() {
    const nextSessionId = createLevelTestSessionId();
    sessionIdRef.current = nextSessionId;
    startedLoggedRef.current = true;
    checkpointLoggedRef.current = false;
    completedLoggedRef.current = false;
    productionStartedLoggedRef.current = false;
    logOteLevelTestStarted({
      sessionId: nextSessionId,
      edition: testCopy.testEdition,
      batchId: batches.core?.id || "",
      totalQuestions: 20,
      restarted: true,
    });
    setAnswers({});
    setRouteKey("");
    setPhase("batch1");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="ote-level-test">
      <Seo
        title={testCopy.seoTitle}
        description={testCopy.seoDescription}
      />

      <section className="ote-level-hero">
        <div>
          <span className="ote-kicker">{testCopy.kicker}</span>
          <h1>{testCopy.heading}</h1>
          <p>{testCopy.intro}</p>
        </div>
        <div className="ote-level-meter" aria-label={`${totalAnswered} de 20 preguntas respondidas`}>
          <strong>{totalAnswered}/20</strong>
          <span>respondidas</span>
        </div>
      </section>

      {phase === "production" && profile ? (
        <ProductionCheck
          profile={profile}
          phase1={{
            routeKey,
            batch1Score,
            totalScore,
            profile: {
              id: profile.id,
              cefr: profile.cefr,
              title: profile.title,
              redirectLabel: profile.redirectLabel,
            },
            testEdition: testCopy.testEdition,
          }}
          quizReport={quizReport}
          coursePath={coursePath}
          homePath={homePath}
          productionTasks={productionTasks}
          feedbackMode={testCopy.feedbackMode}
          showAdvancedDiagnosticCard={testCopy.showAdvancedDiagnosticSuggestion}
          testEdition={testCopy.testEdition}
          sessionId={sessionIdRef.current}
          onBackToResult={() => {
            setPhase("results");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : phase !== "results" ? (
        <>
          <div className="ote-level-status" ref={quizTopRef}>
            <div>
              <Timer size={20} aria-hidden="true" />
              <strong>{phase === "batch1" ? testCopy.firstPartTitle : "Segunda parte"}</strong>
              <span>{phase === "batch1" ? testCopy.firstPartSubtitle : routeKey === "lower" ? testCopy.lowerPartSubtitle : testCopy.upperPartSubtitle}</span>
            </div>
            <div>
              <strong>{answeredCount}/{activeItems.length}</strong>
              <span>esta parte</span>
            </div>
          </div>

          <form className="ote-level-question-list">
            {activeItems.map((item, index) => (
              <article className="ote-level-question" key={item.id}>
                <div className="ote-level-question-head">
                  <span>Pregunta {phase === "batch1" ? index + 1 : index + 11}</span>
                  <small>{item.level} | {item.focus}</small>
                </div>
                <h2>{item.prompt}</h2>
                <div className="ote-level-options">
                  {item.options.map((option) => (
                    <OptionButton
                      key={option}
                      item={item}
                      option={option}
                      selected={answers[item.id] === option}
                      onSelect={chooseAnswer}
                    />
                  ))}
                </div>
              </article>
            ))}
          </form>

          <div className="ote-level-actions">
            <button className="ote-level-secondary" type="button" onClick={resetTest}>
              <RotateCcw size={18} aria-hidden="true" />
              Reiniciar
            </button>
            <button
              className="ote-level-primary"
              type="button"
              disabled={!isBatchComplete}
              onClick={phase === "batch1" ? continueFromBatch1 : finishTest}
            >
              {phase === "batch1" ? "Continuar" : "Ver mi resultado"}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </>
      ) : (
        <section className="ote-level-results">
          <div className="ote-level-result-banner">
            <span>Resultado orientativo</span>
            <h2>{profile.cefr} | {profile.title}</h2>
            <p>{profile.summary} Para confirmar mejor tu recomendación, el siguiente paso normal es añadir una breve muestra de speaking y writing.</p>
            <div className="ote-level-score-row">
              <strong>{totalScore}/20</strong>
              <span>{routeKey === "lower" ? "Ruta de consolidación" : "Ruta superior"} | Perfil {profile.id}</span>
            </div>
          </div>

          <div className="ote-level-upsell">
            <article>
              <Mic size={24} aria-hidden="true" />
              <h3>1. Speaking</h3>
              <p>Graba tres respuestas cortas en unos {speakingMinutes} minutos para completar una recomendación más fiable.</p>
            </article>
            <article>
              <PenLine size={24} aria-hidden="true" />
              <h3>2. Writing</h3>
              <p>Escribe una respuesta breve de {writingMinutes} minutos para comprobar precisión, registro y claridad.</p>
            </article>
            <article>
              <Volume2 size={24} aria-hidden="true" />
              <h3>3. Informe completo</h3>
              <p>Recibe el informe por email con tu resultado, correcciones y siguiente paso recomendado.</p>
            </article>
          </div>

          <div className="ote-level-cta-row">
            <button
              className="ote-level-primary"
              type="button"
              onClick={() => {
                if (!productionStartedLoggedRef.current) {
                  productionStartedLoggedRef.current = true;
                  logOteLevelProductionStarted({
                    sessionId: sessionIdRef.current,
                    edition: testCopy.testEdition,
                    mode: testCopy.feedbackMode,
                    routeKey,
                    profileId: profile?.id || "",
                    cefr: profile?.cefr || "",
                    totalScore,
                  });
                }
                setPhase("production");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Continuar con speaking y writing
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            <a className="ote-level-secondary" href={coursePath}>
              Saltar y ver curso
            </a>
          </div>

          <div className="ote-level-route-card">
            <span>Informe del test</span>
            <strong>Tus respuestas y correcciones</strong>
            <p>Revisa tus errores y descarga una copia del informe de Use of English.</p>
            <button
              className="ote-level-secondary"
              type="button"
              onClick={() => downloadTextFile(testCopy.downloadFilename, quizReportText)}
            >
              <ArrowDownToLine size={18} aria-hidden="true" />
              Descargar informe
            </button>
          </div>

          <div className="ote-level-review-list">
            {reportItems.map((item) => (
              <article className={`ote-level-review-item${item.isCorrect ? " is-correct" : " is-wrong"}`} key={item.id}>
                <div>
                  <span>Pregunta {item.number}</span>
                  <strong>{item.level} | {item.focus}</strong>
                </div>
                <p>{item.prompt}</p>
                <p><b>Tu respuesta:</b> {item.selectedAnswer || "Sin respuesta"}</p>
                {!item.isCorrect ? <p><b>Respuesta correcta:</b> {item.correctAnswer}</p> : null}
                <p>{item.feedback}</p>
              </article>
            ))}
          </div>

          <div className="ote-level-route-card">
            <span>Ruta recomendada</span>
            <strong>{profile.redirectLabel}</strong>
            <p>{profile.commercialCue}</p>
          </div>

          {testCopy.showAdvancedDiagnosticSuggestion && shouldRecommendAdvancedDiagnostic(profile) ? (
            <div className="ote-level-route-card">
              <span>Ruta avanzada</span>
              <strong>Recomendamos una evaluación avanzada de Oxford Test of English</strong>
              <p>Este test general indica un resultado alto. El siguiente paso recomendado es hacer el test avanzado para comprobar si tu perfil encaja con una ruta C1.</p>
              <a className="ote-level-secondary" href={advancedTestPath}>
                Ir al test avanzado
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
          ) : null}

          <div className="ote-level-actions is-results">
            <button className="ote-level-secondary" type="button" onClick={resetTest}>
              <RotateCcw size={18} aria-hidden="true" />
              Repetir test
            </button>
            <a className="ote-level-secondary" href={homePath}>
              Volver a OTE
            </a>
          </div>
        </section>
      )}
    </main>
  );
}
