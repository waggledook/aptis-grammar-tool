import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "../../common/Seo.jsx";
import SpeakingFeedbackPanel from "../SpeakingFeedbackPanel.jsx";
import {
  logAptisSpeakingMockCompleted,
  logAptisSpeakingMockStarted,
  requestAptisSpeakingPart1Feedback,
  requestAptisSpeakingPart2Feedback,
  requestAptisSpeakingPart3Feedback,
  requestAptisSpeakingPart4Feedback,
  saveSpeakingAiFeedback,
} from "../../../firebase.js";
import { recordingsToFeedbackAudio } from "../../../products/ote/utils/speakingFeedback.js";
import { getAptisSpeakingMock, getAptisSpeakingMockPart } from "./aptisSpeakingMockData.js";
import { downloadRecordingsZip } from "./downloadRecordingsZip.js";
import "./AptisSpeakingMock.css";

const MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

function supportedMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  return MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function extensionForMime(mimeType = "") {
  return mimeType.includes("mp4") ? "m4a" : "webm";
}

function partRecordingCount(partNumber) {
  return partNumber === 4 ? 1 : 3;
}

function formatSeconds(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;
  return minutes ? `${minutes}:${String(remainder).padStart(2, "0")}` : `${remainder}s`;
}

function feedbackErrorMessage(error) {
  const message = String(error?.message || "");
  if (/resource-exhausted|credit/i.test(message)) {
    return "You do not have enough AI feedback credits for this part.";
  }
  return message || "Could not generate feedback right now. Please try again.";
}

export default function AptisSpeakingMock({ user, onRequireSignIn }) {
  const { mockId } = useParams();
  const mock = getAptisSpeakingMock(mockId);
  if (!mock) {
    return <UnknownMockScreen />;
  }
  return <AptisSpeakingMockRunner key={mock.id} mock={mock} user={user} onRequireSignIn={onRequireSignIn} />;
}

function UnknownMockScreen() {
  const navigate = useNavigate();
  return (
    <main className="aptis-speaking-mock">
      <CenteredScreen title="Speaking mock not found">
        <button className="asm-btn asm-btn-primary" type="button" onClick={() => navigate("/speaking/mock-tests")}>Choose a mock test</button>
      </CenteredScreen>
    </main>
  );
}

function AptisSpeakingMockRunner({ mock, user, onRequireSignIn }) {
  const navigate = useNavigate();
  const [screen, setScreen] = useState("opening");
  const [partNumber, setPartNumber] = useState(1);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [recordings, setRecordings] = useState([]);
  const [micError, setMicError] = useState("");
  const [micTestState, setMicTestState] = useState("idle");
  const [micTestSeconds, setMicTestSeconds] = useState(3);
  const [micTestUrl, setMicTestUrl] = useState("");
  const [skippedParts, setSkippedParts] = useState([]);
  const [feedbackResults, setFeedbackResults] = useState({});
  const [feedbackLoading, setFeedbackLoading] = useState({});
  const [feedbackErrors, setFeedbackErrors] = useState({});

  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const recordingMetaRef = useRef(null);
  const micTestRecorderRef = useRef(null);
  const currentAudioRef = useRef(null);
  const recordingsRef = useRef([]);
  const skippedPartsRef = useRef([]);
  const startedAtRef = useRef(null);
  const completionLoggedRef = useRef(false);
  const mountedRef = useRef(true);
  const finishingRef = useRef(false);
  const nextAfterRecordingRef = useRef(null);
  const advanceAfterRecordingRef = useRef(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks?.().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const cancelActiveAudio = useCallback(() => {
    currentAudioRef.current?.finish?.();
    currentAudioRef.current = null;
  }, []);

  const playFile = useCallback((src) => {
    if (!src) return Promise.resolve();
    return new Promise((resolve) => {
      const audio = new Audio(src);
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        audio.pause();
        if (currentAudioRef.current?.audio === audio) currentAudioRef.current = null;
        resolve();
      };
      currentAudioRef.current = { audio, finish };
      audio.onended = finish;
      audio.onerror = finish;
      audio.play().catch(finish);
    });
  }, []);

  const ensureStream = useCallback(async () => {
    if (streamRef.current?.active) return streamRef.current;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setMicError("Microphone recording is not available in this browser.");
      return null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicError("");
      return stream;
    } catch (error) {
      console.warn("[Aptis speaking mock] microphone access failed", error);
      setMicError("Microphone access was not granted. Check your browser settings and try again.");
      return null;
    }
  }, []);

  const completeMock = useCallback((reason = "completed") => {
    cancelActiveAudio();
    stopStream();
    setPhase("idle");
    setScreen("complete");
    if (!completionLoggedRef.current) {
      completionLoggedRef.current = true;
      const elapsedSeconds = startedAtRef.current
        ? Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000))
        : 0;
      void logAptisSpeakingMockCompleted({
        mockId: mock.id,
        mockTitle: mock.title,
        recordingCount: recordingsRef.current.length,
        completedParts: [1, 2, 3, 4].filter(
          (number) => recordingsRef.current.filter((recording) => recording.partNumber === number).length === partRecordingCount(number)
        ),
        skippedParts: skippedPartsRef.current,
        elapsedSeconds,
        reason,
      });
    }
  }, [cancelActiveAudio, mock.id, mock.title, stopStream]);

  const moveToPartReady = useCallback((number) => {
    cancelActiveAudio();
    setPartNumber(number);
    setQuestionIndex(0);
    setPhase("idle");
    setSecondsLeft(0);
    setScreen("part-ready");
  }, [cancelActiveAudio]);

  const advanceAfterRecording = useCallback((meta) => {
    const override = nextAfterRecordingRef.current;
    nextAfterRecordingRef.current = null;
    if (override?.type === "part") {
      moveToPartReady(override.partNumber);
      return;
    }
    if (override?.type === "complete") {
      completeMock("completed_with_skips");
      return;
    }

    if (meta.partNumber === 4) {
      completeMock(skippedPartsRef.current.length ? "completed_with_skips" : "completed");
      return;
    }

    const part = getAptisSpeakingMockPart(meta.partNumber, mock);
    if (meta.questionIndex + 1 < part.questions.length) {
      setQuestionIndex(meta.questionIndex + 1);
      setPhase("listen");
      setSecondsLeft(0);
      setScreen("question");
      return;
    }
    moveToPartReady(meta.partNumber + 1);
  }, [completeMock, mock, moveToPartReady]);

  advanceAfterRecordingRef.current = advanceAfterRecording;

  const startCapture = useCallback(async (meta) => {
    finishingRef.current = false;
    recordingMetaRef.current = meta;

    const stream = await ensureStream();
    if (!mountedRef.current || recordingMetaRef.current !== meta) return;
    if (!stream) {
      setPhase("capture-error");
      return;
    }

    try {
      const mimeType = supportedMimeType();
      const chunks = [];
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data?.size) chunks.push(event.data);
      };
      recorder.onerror = (event) => {
        console.error("[Aptis speaking mock] recorder error", event?.error || event);
        setMicError("The browser stopped the recording unexpectedly. Please retry this response.");
      };
      recorder.onstop = () => {
        recorderRef.current = null;
        finishingRef.current = false;
        if (!mountedRef.current) return;
        const finalType = recorder.mimeType || mimeType || chunks[0]?.type || "audio/webm";
        const blob = new Blob(chunks, { type: finalType });
        if (!blob.size) {
          if (nextAfterRecordingRef.current) {
            setPhase("done");
            window.setTimeout(() => advanceAfterRecordingRef.current?.(meta), 100);
            return;
          }
          setMicError("No audio data was captured. Check that microphone access is still enabled, then retry this response.");
          setPhase("capture-error");
          return;
        }

        const recording = {
          id: meta.id,
          partNumber: meta.partNumber,
          partId: `part${meta.partNumber}`,
          questionIndex: meta.questionIndex,
          prompt: meta.prompt,
          label: meta.label,
          durationSeconds: meta.durationSeconds,
          mimeType: finalType,
          blob,
          url: URL.createObjectURL(blob),
          filename: `aptis-speaking-part${meta.partNumber}-${meta.id}.${extensionForMime(finalType)}`,
        };
        recordingsRef.current = [...recordingsRef.current, recording];
        setRecordings(recordingsRef.current);
        setPhase("done");
        window.setTimeout(() => advanceAfterRecordingRef.current?.(meta), 350);
      };

      // A short timeslice makes browsers flush audio chunks throughout longer
      // answers instead of relying on a single final dataavailable event.
      recorder.start(250);
      setSecondsLeft(meta.durationSeconds);
      setPhase("record");
    } catch (error) {
      console.error("[Aptis speaking mock] could not start recorder", error);
      recorderRef.current = null;
      finishingRef.current = false;
      setMicError("The browser could not start recording. Check microphone access, then retry this response.");
      setPhase("capture-error");
    }
  }, [ensureStream]);

  const finishCapture = useCallback(() => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setPhase("finishing");
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.requestData();
      } catch {
        // Some MediaRecorder implementations do not support requestData here.
      }
      recorder.stop();
      return;
    }
    finishingRef.current = false;
    setMicError("No active audio recorder was found. Check microphone access, then retry this response.");
    setPhase("capture-error");
  }, []);

  useEffect(() => {
    if (screen !== "part-intro") return undefined;
    let cancelled = false;
    const part = getAptisSpeakingMockPart(partNumber, mock);
    setPhase("listen");
    (async () => {
      await playFile(part.instructionAudio);
      if (cancelled) return;
      if (partNumber === 4) {
        // Show the photograph and questions before their audio is played.
        setScreen("part4");
        setPhase("questions");
        return;
      }
      await playFile(mock.beepAudio);
      if (cancelled) return;
      setQuestionIndex(0);
      setScreen("question");
      setPhase("listen");
    })();
    return () => {
      cancelled = true;
      cancelActiveAudio();
    };
  }, [cancelActiveAudio, mock, partNumber, playFile, screen]);

  useEffect(() => {
    if (screen !== "part4" || phase !== "questions") return undefined;
    let cancelled = false;
    const part = getAptisSpeakingMockPart(4, mock);
    (async () => {
      await playFile(mock.beepAudio);
      if (cancelled) return;
      await playFile(part.questionsAudio);
      if (cancelled) return;
      setPhase("prep");
      setSecondsLeft(part.prepSeconds);
    })();
    return () => {
      cancelled = true;
      cancelActiveAudio();
    };
  }, [cancelActiveAudio, mock, phase, playFile, screen]);

  useEffect(() => {
    if (screen !== "question" || phase !== "listen") return undefined;
    let cancelled = false;
    const part = getAptisSpeakingMockPart(partNumber, mock);
    const question = part.questions[questionIndex];
    (async () => {
      await playFile(question.audio);
      if (cancelled) return;
      await playFile(mock.beepAudio);
      if (cancelled) return;
      await startCapture({
        id: question.id,
        partNumber,
        questionIndex,
        prompt: question.text,
        label: `Part ${partNumber} – Question ${questionIndex + 1}`,
        durationSeconds: part.responseSeconds,
      });
    })();
    return () => {
      cancelled = true;
      cancelActiveAudio();
    };
  }, [cancelActiveAudio, mock, partNumber, phase, playFile, questionIndex, screen, startCapture]);

  useEffect(() => {
    if (!(["prep", "record"].includes(phase))) return undefined;
    if (secondsLeft > 0) {
      const timeoutId = window.setTimeout(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
      return () => window.clearTimeout(timeoutId);
    }

    if (phase === "record") {
      finishCapture();
      return undefined;
    }

    if (phase === "prep" && screen === "part4") {
      setPhase("transition");
      return undefined;
    }
    return undefined;
  }, [cancelActiveAudio, finishCapture, phase, playFile, screen, secondsLeft, startCapture]);

  useEffect(() => {
    if (screen !== "part4" || phase !== "transition") return undefined;
    let cancelled = false;
    const part = getAptisSpeakingMockPart(4, mock);
    (async () => {
      // Match the original test sequence: announce the two-minute response,
      // play the signal, then begin the recorder.
      await playFile(part.startAudio);
      if (cancelled) return;
      await playFile(mock.beepAudio);
      if (cancelled) return;
      await startCapture({
        id: "part4-talk",
        partNumber: 4,
        questionIndex: 0,
        prompt: part.questions.map((question) => question.text).join(" / "),
        label: "Part 4 – Presentation",
        durationSeconds: part.responseSeconds,
      });
    })();
    return () => {
      cancelled = true;
      cancelActiveAudio();
    };
  }, [cancelActiveAudio, mock, phase, playFile, screen, startCapture]);

  useEffect(() => {
    // React Strict Mode deliberately mounts, cleans up and mounts again in
    // development. Resetting this flag here keeps recorder callbacks alive on
    // the second mount as well as in production.
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cancelActiveAudio();
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      if (micTestRecorderRef.current?.state === "recording") micTestRecorderRef.current.stop();
      stopStream();
      recordingsRef.current.forEach((recording) => recording.url && URL.revokeObjectURL(recording.url));
    };
  }, [cancelActiveAudio, stopStream]);

  function startPart(number) {
    setPartNumber(number);
    setQuestionIndex(0);
    setPhase("listen");
    setScreen("part-intro");
  }

  async function runMicTest() {
    if (micTestState === "recording") return;
    if (micTestUrl) URL.revokeObjectURL(micTestUrl);
    setMicTestUrl("");
    setMicTestSeconds(3);
    const stream = await ensureStream();
    if (!stream) return;

    try {
      const mimeType = supportedMimeType();
      const chunks = [];
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      micTestRecorderRef.current = recorder;
      setMicTestState("recording");
      recorder.ondataavailable = (event) => {
        if (event.data?.size) chunks.push(event.data);
      };
      recorder.onerror = (event) => {
        console.error("[Aptis speaking mock] microphone test recorder error", event?.error || event);
        setMicError("The microphone test stopped unexpectedly. Please try it again.");
      };
      recorder.onstop = () => {
        micTestRecorderRef.current = null;
        if (!mountedRef.current) return;
        const blob = new Blob(chunks, { type: recorder.mimeType || mimeType || "audio/webm" });
        if (blob.size) {
          setMicTestUrl(URL.createObjectURL(blob));
          setMicError("");
        } else {
          setMicError("No audio was captured. Check your microphone permission and try the test again.");
        }
        setMicTestState("ready");
      };
      recorder.start(250);
      for (let left = 3; left > 0; left -= 1) {
        setMicTestSeconds(left);
        await new Promise((resolve) => window.setTimeout(resolve, 1000));
      }
      setMicTestSeconds(0);
      if (recorder.state === "recording") {
        try {
          recorder.requestData();
        } catch {
          // The stop event will still request the final available data.
        }
        recorder.stop();
      }
    } catch (error) {
      console.error("[Aptis speaking mock] could not start microphone test", error);
      micTestRecorderRef.current = null;
      setMicTestState("ready");
      setMicError("The browser could not start the microphone test. Check microphone access and try again.");
    }
  }

  function beginMock() {
    recordingsRef.current = [];
    skippedPartsRef.current = [];
    setRecordings([]);
    setSkippedParts([]);
    setFeedbackResults({});
    setFeedbackErrors({});
    completionLoggedRef.current = false;
    startedAtRef.current = Date.now();
    void logAptisSpeakingMockStarted({
      mockId: mock.id,
      mockTitle: mock.title,
    });
    startPart(1);
  }

  function skipCurrentPart() {
    const nextPart = partNumber < 4 ? partNumber + 1 : null;
    if (!skippedPartsRef.current.includes(partNumber)) {
      skippedPartsRef.current = [...skippedPartsRef.current, partNumber];
      setSkippedParts(skippedPartsRef.current);
    }
    cancelActiveAudio();
    if (phase === "record" || phase === "finishing") {
      nextAfterRecordingRef.current = nextPart
        ? { type: "part", partNumber: nextPart }
        : { type: "complete" };
      finishCapture();
      return;
    }
    if (nextPart) moveToPartReady(nextPart);
    else completeMock("completed_with_skips");
  }

  async function retryCurrentRecording() {
    const meta = recordingMetaRef.current;
    if (!meta) return;
    setMicError("");
    setPhase("transition");
    await playFile(mock.beepAudio);
    if (!mountedRef.current) return;
    await startCapture(meta);
  }

  async function generateFeedback(part) {
    if (!user) {
      setFeedbackErrors((current) => ({ ...current, [part]: "Sign in to generate and save AI feedback." }));
      onRequireSignIn?.();
      return;
    }

    const definition = getAptisSpeakingMockPart(part, mock);
    const partRecordings = recordings.filter((recording) => recording.partNumber === part);
    if (partRecordings.length !== partRecordingCount(part)) return;

    setFeedbackLoading((current) => ({ ...current, [part]: true }));
    setFeedbackErrors((current) => ({ ...current, [part]: "" }));
    try {
      const feedbackAudio = await recordingsToFeedbackAudio(partRecordings, `aptis-speaking-mock-part${part}`);
      const questions = definition.questions.map((question, index) => ({
        id: question.id,
        question: question.text,
        questionNumber: index + 1,
      }));
      let result;
      if (part === 1) {
        result = await requestAptisSpeakingPart1Feedback({ questions, recordings: feedbackAudio });
      } else if (part === 2) {
        result = await requestAptisSpeakingPart2Feedback({
          task: { id: mock.id, title: definition.title, alt: definition.imageAlt },
          questions,
          recordings: feedbackAudio,
        });
      } else if (part === 3) {
        result = await requestAptisSpeakingPart3Feedback({
          task: {
            id: mock.id,
            title: definition.title,
            photoA: { alt: definition.images[0].alt },
            photoB: { alt: definition.images[1].alt },
          },
          questions,
          recordings: feedbackAudio,
        });
      } else {
        result = await requestAptisSpeakingPart4Feedback({
          task: { id: mock.id, title: definition.title, alt: definition.imageAlt },
          questions,
          recordings: feedbackAudio,
        });
      }

      setFeedbackResults((current) => ({ ...current, [part]: result }));
      if (result?.feedback) {
        try {
          await saveSpeakingAiFeedback({
            product: "aptis",
            part: `part${part}`,
            taskId: `${mock.id}-part${part}`,
            taskTitle: `${mock.title} – Part ${part}`,
            questions,
            transcripts: result.transcripts || [],
            feedback: result.feedback,
            meta: { ...(result.meta || {}), mockId: mock.id },
          });
        } catch (saveError) {
          console.warn(`[Aptis speaking mock] Part ${part} feedback could not be saved`, saveError);
          setFeedbackErrors((current) => ({
            ...current,
            [part]: "Feedback was generated, but it could not be saved to your profile.",
          }));
        }
      }
    } catch (error) {
      console.error(`[Aptis speaking mock] Part ${part} feedback failed`, error);
      setFeedbackErrors((current) => ({ ...current, [part]: feedbackErrorMessage(error) }));
    } finally {
      setFeedbackLoading((current) => ({ ...current, [part]: false }));
    }
  }

  const part = getAptisSpeakingMockPart(partNumber, mock);
  const question = part.questions?.[questionIndex];

  return (
    <main className="aptis-speaking-mock">
      <Seo
        title={`${mock.title} | Seif Aptis Trainer`}
        description="Complete a four-part Aptis General Speaking mock with timed prompts, microphone recording, downloads and optional AI transcript feedback."
      />
      {screen === "opening" ? (
        <OpeningScreen mock={mock} onStart={() => setScreen("instructions")} onBack={() => navigate("/speaking/mock-tests")} />
      ) : null}

      {screen === "instructions" ? (
        <InstructionsScreen mock={mock} onBegin={() => setScreen("mic")} />
      ) : null}

      {screen === "mic" ? (
        <MicTestScreen
          state={micTestState}
          seconds={micTestSeconds}
          url={micTestUrl}
          error={micError}
          onRecord={runMicTest}
          onContinue={beginMock}
        />
      ) : null}

      {screen === "part-ready" ? (
        <CenteredScreen title={part.title}>
          <button className="asm-btn asm-btn-primary" type="button" onClick={() => startPart(partNumber)}>
            Begin {part.title}
          </button>
        </CenteredScreen>
      ) : null}

      {screen === "part-intro" ? (
        <PromptScreen part={part} onSkip={skipCurrentPart} />
      ) : null}

      {screen === "question" ? (
        <QuestionScreen
          part={part}
          question={question}
          questionIndex={questionIndex}
          phase={phase}
          secondsLeft={secondsLeft}
          micError={micError}
          onFinish={finishCapture}
          onRetry={retryCurrentRecording}
          onSkip={skipCurrentPart}
        />
      ) : null}

      {screen === "part4" ? (
        <Part4Screen
          part={part}
          phase={phase}
          secondsLeft={secondsLeft}
          micError={micError}
          onFinish={finishCapture}
          onRetry={retryCurrentRecording}
          onSkip={skipCurrentPart}
        />
      ) : null}

      {screen === "complete" ? (
        <CompleteScreen
          user={user}
          mock={mock}
          recordings={recordings}
          skippedParts={skippedParts}
          feedbackResults={feedbackResults}
          feedbackLoading={feedbackLoading}
          feedbackErrors={feedbackErrors}
          onGenerateFeedback={generateFeedback}
          onDownloadZip={() => downloadRecordingsZip(recordings)}
          onBack={() => navigate("/speaking/mock-tests")}
        />
      ) : null}
    </main>
  );
}

function OpeningScreen({ mock, onStart, onBack }) {
  return (
    <section className="asm-setup-screen">
      <div className="asm-setup-content asm-opening-content">
        <p className="asm-setup-kicker">{mock.displayTitle}</p>
        <h1>Speaking Practice Test Version {String(mock.number).padStart(3, "0")}</h1>
        <dl className="asm-assessment-facts">
          <div>
            <dt>Number of Questions</dt>
            <dd>4</dd>
          </div>
          <div>
            <dt>Assessment Description</dt>
            <dd>A complete Aptis General speaking practice test with four timed tasks.</dd>
          </div>
        </dl>
        <div className="asm-setup-actions">
          <button className="asm-btn asm-btn-exam" type="button" onClick={onStart}>Start Assessment</button>
          <button className="asm-link-btn" type="button" onClick={onBack}>← Choose another mock</button>
        </div>
      </div>
    </section>
  );
}

function InstructionsScreen({ mock, onBegin }) {
  return (
    <section className="asm-setup-screen">
      <div className="asm-setup-content asm-instructions-content">
        <h1>Aptis General Speaking Test Instructions</h1>
        <h2>Speaking</h2>
        <div className="asm-instruction-list">
        <p>You will answer some questions about yourself and then do three short speaking tasks.</p>
        <p>Listen to the instructions and speak clearly into your microphone when you hear the signal.</p>
        <p>Each part of the test will appear automatically.</p>
        <p>The test will take about {mock.durationMinutes} minutes.</p>
        <p className="asm-instruction-final">When you click on the ‘Next’ button, you will test your microphone before the test begins.</p>
        </div>
        <button className="asm-btn asm-btn-exam" type="button" onClick={onBegin}>Next</button>
      </div>
    </section>
  );
}

function MicTestScreen({ state, seconds, url, error, onRecord, onContinue }) {
  return (
    <CenteredScreen title="Microphone Test">
      <p>Record a short clip, then listen back to make sure your microphone sounds right.</p>
      <button className="asm-btn asm-btn-secondary" type="button" onClick={onRecord} disabled={state === "recording"}>
        {state === "recording" ? `Recording… ${seconds}s` : "Start Mic Test"}
      </button>
      {error ? <p className="asm-error" role="alert">{error}</p> : null}
      {url ? (
        <div className="asm-mic-playback">
          <p>Here’s your test clip. Does it sound right?</p>
          <audio src={url} controls playsInline />
          <button className="asm-btn asm-btn-primary" type="button" onClick={onContinue}>Continue to Part 1</button>
        </div>
      ) : null}
    </CenteredScreen>
  );
}

function CenteredScreen({ title, subtitle, children }) {
  return (
    <section className="asm-centered-screen">
      <div className="asm-centered-card">
        <h1>{title}</h1>
        {subtitle ? <h2>{subtitle}</h2> : null}
        {children}
      </div>
    </section>
  );
}

function PromptScreen({ part, onSkip }) {
  return (
    <section className="asm-prompt-screen">
      <div className="asm-prompt-content">
        <h1>Prompt</h1>
        <p className="asm-intro-copy"><strong>{part.title}</strong> – {part.instructionText}</p>
      </div>
      <div className="asm-prompt-footer">
        <p>The test will continue automatically.</p>
        <SkipPartButton partNumber={part.number} onSkip={onSkip} />
      </div>
    </section>
  );
}

function QuestionScreen({ part, question, questionIndex, phase, secondsLeft, micError, onFinish, onRetry, onSkip }) {
  const canFinish = phase === "record" && secondsLeft <= part.responseSeconds - 5;
  return (
    <section className={`asm-task-wrap${part.number === 2 ? " asm-part2-question" : ""}`}>
      <div className="asm-two-column">
        <div className="asm-panel">
          <header className="asm-task-heading">
            <p>Speaking</p>
            <h1>Part {questionIndex + 1} of {part.questions.length}</h1>
          </header>
          <div className="asm-task-content">
          {part.image ? <img className="asm-single-image" src={part.image} alt={part.imageAlt} /> : null}
          {part.images?.length ? (
            <div className="asm-image-pair">
              {part.images.map((image) => <img key={image.src} src={image.src} alt={image.alt} />)}
            </div>
          ) : null}
          <p className="asm-question">{question.text}</p>
          </div>
        </div>
        <aside className="asm-sidebar">
          <RecordingStatus phase={phase} secondsLeft={secondsLeft} />
          {canFinish ? <button className="asm-btn asm-btn-exam asm-finish-btn" type="button" onClick={onFinish}>Finish Recording</button> : null}
          {phase === "capture-error" ? <button className="asm-btn asm-btn-exam asm-finish-btn" type="button" onClick={onRetry}>Retry Recording</button> : null}
          {micError ? <p className="asm-error" role="alert">{micError}</p> : null}
          <SkipPartButton partNumber={part.number} onSkip={onSkip} />
        </aside>
      </div>
    </section>
  );
}

function Part4Screen({ part, phase, secondsLeft, micError, onFinish, onRetry, onSkip }) {
  const canFinish = phase === "record" && secondsLeft <= part.responseSeconds - 5;
  return (
    <section className="asm-task-wrap">
      <div className="asm-two-column">
        <div className="asm-panel">
          <header className="asm-task-heading">
            <p>Speaking</p>
            <h1>Question 4 of 4</h1>
          </header>
          <div className="asm-task-content asm-part4-content">
            <p className="asm-part4-instructions"><strong>{part.title}</strong> – {part.instructionText}</p>
            <img className="asm-single-image" src={part.image} alt={part.imageAlt} />
            <div className="asm-part4-questions">
              {part.questions.map((item) => <p key={item.id}>{item.text}</p>)}
            </div>
            {phase === "prep" ? <p className="asm-prep-copy"><strong>You now have one minute to think about your answers. You can make notes if you wish.</strong></p> : null}
          </div>
        </div>
        <aside className="asm-sidebar">
          <RecordingStatus phase={phase} secondsLeft={secondsLeft} />
          {canFinish ? <button className="asm-btn asm-btn-exam asm-finish-btn" type="button" onClick={onFinish}>Finish Recording</button> : null}
          {phase === "capture-error" ? <button className="asm-btn asm-btn-exam asm-finish-btn" type="button" onClick={onRetry}>Retry Recording</button> : null}
          {micError ? <p className="asm-error" role="alert">{micError}</p> : null}
          <SkipPartButton partNumber={4} onSkip={onSkip} />
        </aside>
      </div>
    </section>
  );
}

function RecordingStatus({ phase, secondsLeft }) {
  const isListening = phase === "listen" || phase === "questions" || phase === "transition";
  if (isListening) {
    return (
      <div className="asm-status-stage">
        <h2 className="asm-status">Instructions…</h2>
        <div className="asm-sound-disc"><SpeakerIcon /></div>
      </div>
    );
  }
  if (phase === "prep") {
    return (
      <div className="asm-status-stage">
        <h2 className="asm-status">Preparation…</h2>
        <div className="asm-timer-ring"><span>{formatSeconds(secondsLeft)}</span></div>
        <p className="asm-status-note">You can make notes if you wish.</p>
      </div>
    );
  }
  if (phase === "record") {
    return (
      <div className="asm-status-stage">
        <h2 className="asm-status">Recording…</h2>
        <div className="asm-timer-ring"><span>{formatSeconds(secondsLeft)}</span></div>
        <Waveform />
      </div>
    );
  }
  if (phase === "finishing") return <div className="asm-status-stage"><h2 className="asm-status">Saving recording…</h2></div>;
  if (phase === "capture-error") return <div className="asm-status-stage"><h2 className="asm-status">Recording needs attention</h2></div>;
  return <div className="asm-status-stage"><h2 className="asm-status">Next task…</h2></div>;
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M13 27h11l14-12v34L24 37H13z" fill="currentColor" />
      <path d="M44 24c4 4 4 12 0 16M50 18c8 8 8 20 0 28" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function Waveform() {
  const bars = [7, 12, 18, 24, 30, 38, 46, 40, 34, 28, 22, 18, 24, 30, 26, 20, 16, 22, 28, 34, 30, 24, 20, 16, 22, 28, 34, 38, 30, 24, 18, 14, 20, 26, 22, 16, 12, 8];
  return (
    <div className="asm-waveform" aria-hidden="true">
      {bars.map((height, index) => <span key={index} style={{ "--asm-bar-height": `${height}px`, "--asm-bar-delay": `${index * -34}ms` }} />)}
    </div>
  );
}

function SkipPartButton({ partNumber, onSkip }) {
  return (
    <div className="asm-skip-block">
      <p>Don’t want to practise Part {partNumber}?</p>
      <button className="asm-btn asm-btn-secondary asm-btn-small" type="button" onClick={onSkip}>
        {partNumber < 4 ? `Skip to Part ${partNumber + 1}` : "Skip to End"}
      </button>
    </div>
  );
}

function CompleteScreen({
  user,
  mock,
  recordings,
  skippedParts,
  feedbackResults,
  feedbackLoading,
  feedbackErrors,
  onGenerateFeedback,
  onDownloadZip,
  onBack,
}) {
  return (
    <section className="asm-complete-screen">
      <div className="asm-complete-card">
        <h1>That’s the end of the test!</h1>
        <p>{recordings.length} response{recordings.length === 1 ? "" : "s"} recorded. Audio stays in this browser and is not uploaded or stored.</p>
        {skippedParts.length ? <p className="asm-muted">Skipped parts: {skippedParts.join(", ")}</p> : null}
        {recordings.length > 1 ? (
          <button className="asm-btn asm-btn-secondary" type="button" onClick={onDownloadZip}>Download All Recordings as ZIP</button>
        ) : null}

        <section className="asm-review-section">
          <div className="asm-review-intro">
            <div>
              <p className="asm-review-eyebrow">Playback, download and improve</p>
              <h2>Your recordings and AI feedback</h2>
            </div>
            <p>Listen to each response, download the audio, or generate transcript-based feedback for a completed part. Each feedback request uses your normal AI feedback credits and is saved to your profile.</p>
          </div>
          {!user ? <p className="asm-muted">You can sign in without losing the recordings on this page.</p> : null}
          <div className="asm-review-grid">
            {[1, 2, 3, 4].map((partNumber) => {
              const definition = getAptisSpeakingMockPart(partNumber, mock);
              const partRecordings = recordings.filter((recording) => recording.partNumber === partNumber);
              const count = partRecordings.length;
              const complete = count === partRecordingCount(partNumber);
              return (
                <article className="asm-review-part" key={partNumber}>
                  <div className="asm-review-part-head">
                    <div>
                      <h3>Part {partNumber}</h3>
                      <span>{count}/{partRecordingCount(partNumber)} response{partRecordingCount(partNumber) === 1 ? "" : "s"} recorded</span>
                    </div>
                    <div className="asm-feedback-action">
                      <span>AI feedback</span>
                      <button
                        className="asm-btn asm-btn-primary asm-btn-small"
                        type="button"
                        disabled={!complete || feedbackLoading[partNumber] || Boolean(feedbackResults[partNumber])}
                        onClick={() => onGenerateFeedback(partNumber)}
                      >
                        {feedbackLoading[partNumber]
                          ? "Generating…"
                          : feedbackResults[partNumber]
                            ? "Feedback saved"
                            : complete
                              ? "Analyse this part"
                              : "Complete part to unlock"}
                      </button>
                    </div>
                  </div>
                  {partRecordings.length ? (
                    <div className="asm-review-responses">
                      {partRecordings.map((recording) => (
                        <div className="asm-review-response" key={`${recording.id}-${recording.url}`}>
                          <strong>{recording.label}</strong>
                          <audio controls playsInline preload="metadata" src={recording.url} />
                          <a className="asm-btn asm-btn-secondary asm-btn-small" href={recording.url} download={recording.filename}>Download</a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="asm-review-empty">No responses recorded for this part.</p>
                  )}
                  {feedbackErrors[partNumber] ? <p className="asm-error" role="alert">{feedbackErrors[partNumber]}</p> : null}
                  <SpeakingFeedbackPanel
                    feedbackResult={feedbackResults[partNumber]}
                    questions={definition.questions.map((question) => question.text)}
                    title={`Part ${partNumber} feedback`}
                    appearance="light"
                  />
                </article>
              );
            })}
          </div>
          <p className="asm-review-note">AI feedback is based on the transcript of your recording. Pronunciation is not assessed reliably.</p>
        </section>

        <button className="asm-link-btn" type="button" onClick={onBack}>← Choose another mock</button>
      </div>
    </section>
  );
}
