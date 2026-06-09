// src/components/speaking/SpeakingPart2.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "../../utils/toast";
import * as fb from "../../firebase";
import { loadSpeakingDone, markSpeakingDone } from "../../utils/speakingProgress";
import { PART2_TASKS } from "./banks/part2";
import SpeakingAssignButton from "./SpeakingAssignButton";
import { getSitePath } from "../../siteConfig.js";


/**
 * Speaking – Part 2 (Exam-like with Start → TTS → Beep → Record)
 * --------------------------------------------------------------
 * Flow:
 *   0) Click "Start task"
 *   1) For each question (1→3):
 *        - Read the question aloud (TTS)
 *        - Play a short BEEP
 *        - Start 45s recording & countdown
 *      Then auto-advance to the next question.
 *   2) Show summary with individual downloads + "Download all (.zip)"
 *
 * Notes:
 *   - Q1 is ALWAYS "Describe the photograph."
 *   - Q2–Q3 come from task.questions[0..1]
 *   - If speechSynthesis or mic permission is unavailable, it gracefully continues.
 */

export default function SpeakingPart2({
  tasks = PART2_TASKS,
  user,
  onRequireSignIn,
  partKey = "part2",
  activityId = "speaking-part-2",
  routeBasePath = getSitePath("/speaking/part2"),
  showAssignButton = true,
  trackProgress = true,
  lockAfterIndex = 2,
  headerActions = null,
  heading = "Speaking – Part 2 (Describe a Photograph)",
  intro = (
    <>
      Click <strong>Start task</strong>. Each question is read aloud, then a beep plays and your
      <strong> 45-second</strong> recording begins. Q1 is always <em>“Describe the photograph.”</em>
    </>
  ),
}) {
  const [searchParams] = useSearchParams();
  const items = tasks;

  // Picker / current task
  const [taskIndex, setTaskIndex] = useState(0);
  const current = items[taskIndex] || items[0];

  // Completions (✓ shown in picker)
  const [completed, setCompleted] = useState(new Set());
  useEffect(() => {
    if (!trackProgress) {
      setCompleted(new Set());
      return;
    }
    let alive = true;
    (async () => {
      const done = await loadSpeakingDone(partKey, fb, user);
      if (alive) setCompleted(done);
    })();
    return () => { alive = false; };
  }, [partKey, trackProgress, user]);

  useEffect(() => {
    const requestedTaskId = searchParams.get("task");
    if (!requestedTaskId) return;

    const nextIndex = items.findIndex((task) => task.id === requestedTaskId);
    if (nextIndex === -1) return;
    if (!user && lockAfterIndex != null && nextIndex >= lockAfterIndex) return;
    setTaskIndex(nextIndex);
  }, [lockAfterIndex, searchParams, items, user]);

  // 🔍 Debug: check user + Firebase exports
  useEffect(() => {
    console.log("[p2] user?", { hasUser: !!user, uid: fb?.auth?.currentUser?.uid || null });
    console.log("[p2] hasFB?", { save: !!fb.saveSpeakingCompletion, fetch: !!fb.fetchSpeakingCompletions });
  }, [user]);

  function handleSelectTask(nextIndex) {
    if (!user && lockAfterIndex != null && nextIndex >= lockAfterIndex) {
      onRequireSignIn?.();     // match Reading behaviour + use the prop
      return;
    }
    setTaskIndex(nextIndex);
  }

  const decorated = useMemo(
    () =>
      items.map((t, i) => {
        const locked = !user && lockAfterIndex != null && i >= lockAfterIndex; // lock tasks 3+ unless signed in
        const done = completed.has(t.id);
        const title =
          `${i + 1}. ${t.title}` +
          (done ? " ✓" : "") +
          (locked ? " 🔒" : "");
        return { ...t, locked, title };
      }),
    [items, completed, lockAfterIndex, user]
  );

  return (
    <div className="aptis-speaking game-wrapper">
      <StyleScope />

      {/* Header + picker */}
      <header className="header">
        <div>
          <h2 className="title">{heading}</h2>
          <p className="intro">{intro}</p>
        </div>
        <div className="picker">
          <ChipDropdown
            items={decorated}
            value={taskIndex}
            onChange={handleSelectTask}
            label="Task"
          />
          {showAssignButton ? (
            <SpeakingAssignButton
              user={user}
              activityId={activityId}
              activityLabel={`Aptis Speaking Part 2 — ${current.title}`}
              routePath={`${routeBasePath}?task=${encodeURIComponent(current.id)}`}
              taskId={current.id}
              taskTitle={current.title}
            />
          ) : null}
          {headerActions}
        </div>
      </header>

      <SpeakingAutoFlow
        task={current}
        user={user}
        onFinished={async () => {
          if (!trackProgress) return;
          try {
            console.log("[p2] finish → markSpeakingDone", {
              part: partKey,
              id: current.id,
              hasUser: !!user,
            });

            const updated = await markSpeakingDone(partKey, [current.id], fb, user);

            console.log("[p2] result", {
              updated: updated ? [...updated] : null,
            });

            if (updated) setCompleted(updated);
            toast("Task marked as completed ✓");

            // Log activity: Part 2 speaking task (3 questions)
            if (user && fb.logSpeakingTaskCompleted) {
              await fb.logSpeakingTaskCompleted({
                part: partKey,
                taskId: current.id,
                questionCount: 3,
              });
            }
          } catch (e) {
            console.error("[p2] error in markSpeakingDone / log", e);
            toast("Couldn’t save completion (local only).");
          }
        }}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Auto Flow: Start → (TTS → Beep → Record)x3 → Summary
   ────────────────────────────────────────────────────────────────────────── */
function SpeakingAutoFlow({ task, user, onFinished }) {
  const SPEAK_SECONDS = 45;

  // Build questions (Q1 fixed)
  const questions = useMemo(() => ([
    "Describe the photograph.",
    task?.questions?.[0] || "What do you think is happening in the photo?",
    task?.questions?.[1] || "Would you like to be there? Why / why not?",
  ]), [task]);

  // overall: ready | running | summary
  const [overall, setOverall] = useState("ready");
  // seg: 0..2 (which question)
  const [seg, setSeg] = useState(0);
  // subphase: announce (TTS) | beep | speak | doneSeg
  const [sub, setSub] = useState("announce");
  const [left, setLeft] = useState(SPEAK_SECONDS);

  // Recording per segment
  const [recordings, setRecordings] = useState(/** @type {{blob:Blob,url:string,name:string}[]} */([]));
  const [recording, setRecording] = useState(false);
  const [micError, setMicError] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackResult, setFeedbackResult] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const ttsAudioRef = useRef(null);
  const ttsCacheRef = useRef(new Map()); // key: `${voice}::${text}` → url

  const audioCtxRef = useRef(null);

  async function ensureAudioContext() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") {
      try { await ctx.resume(); } catch {}
    }
    return ctx;
  }

  // Reset when task changes
  useEffect(() => {
    setOverall("ready");
    setSeg(0);
    setSub("announce");
    setLeft(SPEAK_SECONDS);
    setRecordings([]);
    setMicError("");
    setFeedbackLoading(false);
    setFeedbackError("");
    setFeedbackResult(null);
    stopRecording(true);
    cancelTTS();
  }, [task?.id]);

  // Countdown during "speak"
  useEffect(() => {
    if (overall !== "running" || sub !== "speak") return;
    const id = setInterval(() => setLeft(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [overall, sub]);

  // Auto-finish when counter hits 0
  useEffect(() => {
    if (overall === "running" && sub === "speak" && left === 0) {
      finishSegment();
    }
  }, [overall, sub, left]);

  useEffect(() => () => {
    try {
      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== "inactive") mr.stop();
    } catch {}
  }, []);

  // Orchestrate subphases: announce → beep → speak
  useEffect(() => {
    if (overall !== "running") return;

    if (sub === "announce") {
      // Speak the question (TTS), then go to beep
      const q = questions[seg];
      (async () => {
        await speakTTS(q);
        setSub("beep");
      })();
    }

    if (sub === "beep") {
      (async () => {
        await playBeep(600, 1.2); // 600Hz, 0.2s
        startSegment();           // will set sub → speak
      })();
    }
  }, [overall, sub, seg, questions]);

  async function startTask() {
    await ensureAudioContext();         // 👈 important for iOS
    setFeedbackError("");
    setFeedbackResult(null);
    setRecordings([]);
    setOverall("running");
    setSeg(0);
    setSub("announce");
    setLeft(SPEAK_SECONDS);
  }

  async function requestPart2Feedback() {
    if (!user) {
      setFeedbackError("Sign in to get AI feedback.");
      return;
    }
    const completeRecordings = recordings.filter((item) => item?.blob);
    if (completeRecordings.length !== 3) {
      setFeedbackError("Record all three answers before requesting feedback.");
      return;
    }

    setFeedbackLoading(true);
    setFeedbackError("");
    try {
      const payloadRecordings = await Promise.all(recordings.map(async (item, index) => ({
        name: item?.name || `speaking-part2-q${index + 1}.webm`,
        mime: item?.mime || item?.blob?.type || "audio/webm",
        base64: await blobToBase64(item.blob),
      })));
      const result = await fb.requestAptisSpeakingPart2Feedback({
        task: {
          id: task?.id || "",
          title: task?.title || "",
          alt: task?.alt || "",
          photoFeedback: task?.photoFeedback || null,
        },
        questions: questions.map((text, index) => ({
          id: `q${index + 1}`,
          question: text,
        })),
        recordings: payloadRecordings,
      });
      setFeedbackResult(result);
      if (result?.feedback && fb.saveSpeakingAiFeedback) {
        try {
          await fb.saveSpeakingAiFeedback({
            part: "part2",
            taskId: task?.id || "",
            taskTitle: task?.title || "Speaking Part 2",
            questions: questions.map((text, index) => ({ id: `q${index + 1}`, question: text })),
            transcripts: result?.transcripts || [],
            feedback: result.feedback,
            meta: result?.meta || null,
          });
        } catch (saveError) {
          console.warn("[Speaking Part 2 feedback] save failed", saveError);
        }
      }
    } catch (error) {
      console.error("[p2] feedback error", error);
      setFeedbackError(error?.message || "Could not generate feedback right now.");
    } finally {
      setFeedbackLoading(false);
    }
  }

  async function startSegment() {
    setLeft(SPEAK_SECONDS);
    setSub("speak");
    await startRecording();
  }

  function finishSegment() {
    stopRecording();
    setSub("doneSeg");
  }

  function nextStep() {
    if (seg < 2) {
      // next question
      setSeg(seg + 1);
      setLeft(SPEAK_SECONDS);
      setSub("announce");
    } else {
      // all done
      setOverall("summary");
      cancelTTS();
      onFinished?.();
    }
  }

  function pickRecordingMime() {
    const prefs = [
      'audio/mp4;codecs=mp4a.40.2', // iOS best
      'audio/mp4',
      'audio/webm;codecs=opus',
      'audio/webm'
    ];
    if (window.MediaRecorder && MediaRecorder.isTypeSupported) {
      for (const t of prefs) {
        if (MediaRecorder.isTypeSupported(t)) return t;
      }
    }
    return ''; // let browser choose
  }
  function extForMime(mime='') {
    if (mime.includes('mp4')) return 'm4a';  // Safari usually writes .m4a
    if (mime.includes('webm')) return 'webm';
    return 'm4a';
  }


  // MediaRecorder
    async function startRecording() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMicError("Recording not supported in this browser.");
        return;
      }
      if (typeof MediaRecorder === 'undefined') {
        setMicError("MediaRecorder not available in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mime = pickRecordingMime();
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];

      mr.ondataavailable = (e) => { if (e.data?.size) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const finalMime = mr.mimeType || mime || 'audio/mp4';
        const blob = new Blob(audioChunksRef.current, { type: finalMime });
        const ext = extForMime(finalMime);
        const name = `task-${task?.id || "task"}-q${seg + 1}.${ext}`;
        const url = URL.createObjectURL(blob);

        setRecordings(prev => {
          const next = [...prev];
          next[seg] = { blob, url, name, mime: finalMime };
          return next;
        });

        stream.getTracks().forEach(t => t.stop());
      };

      mr.start();
      setRecording(true);
    } catch (err) {
      console.error(err);
      setMicError("Microphone access failed. You can still practise timings.");
      setRecording(false);
    }
  }

  function stopRecording(silent = false) {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      try { mr.stop(); } catch {}
    }
    if (!silent) setRecording(false);
  }


  // TTS helpers
  function cancelTTS() {
    try { window.speechSynthesis?.cancel(); } catch {}
    try {
      const a = ttsAudioRef.current;
      if (a) { a.pause(); a.removeAttribute('src'); a.load(); }
    } catch {}
  }
  async function speakTTS(text) {
    const voice = 'en-GB-Neural2-C';      // pick default (UK). Try 'en-US-Neural2-H' for US.
    const key = `${voice}::${text}`;
  
    try {
      await ensureAudioContext();
      // cache first
      let url = ttsCacheRef.current.get(key);
      if (!url) {
        const r = await fetch('/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voice, rate: 0.98, pitch: -1.0, format: 'mp3' })
        });
        if (!r.ok) throw new Error(`speak ${r.status}`);
        const data = await r.json(); // { url, cached }
        url = data.url;
        ttsCacheRef.current.set(key, url);
      }
  
      const a = ttsAudioRef.current;
      if (!a) return;
      a.src = url;
      await a.play(); // allowed (user clicked Start)
  
      // wait until audio finishes
      await new Promise((res) => {
        const onEnd = () => { a.removeEventListener('ended', onEnd); res(); };
        a.addEventListener('ended', onEnd);
      });
    } catch (e) {
      console.warn('[P2 TTS] cloud failed, falling back to speechSynthesis', e);
      // Fallback so flow continues
      await new Promise((resolve) => {
        try {
          const synth = window.speechSynthesis; if (!synth) return resolve();
          const u = new SpeechSynthesisUtterance(text);
          u.lang = 'en-GB'; u.rate = 1; u.pitch = 1; u.volume = 1;
          u.onend = resolve; u.onerror = resolve;
          synth.cancel(); synth.speak(u);
        } catch { resolve(); }
      });
    }
  }
  

  // Beep helper (Web Audio API)
  function playBeep(freq = 600, seconds = 1.2) {
    return new Promise(async (resolve) => {
      try {
        const C = await ensureAudioContext();
        const o = C.createOscillator();
        const g = C.createGain();
        o.type = "sine";
        o.frequency.value = freq;
        o.connect(g); g.connect(C.destination);

        const now = C.currentTime;
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(0.3, now + 0.02);
        const tEnd = now + seconds;
        g.gain.exponentialRampToValueAtTime(0.0001, tEnd);

        o.start(now);
        o.stop(tEnd + 0.01);
        o.onended = () => { try { o.disconnect(); g.disconnect(); } catch {} resolve(); };
      } catch { resolve(); }
    });
  }

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === " ") {
        if (overall === "ready") { e.preventDefault(); startTask(); }
        else if (overall === "running" && sub === "speak") { e.preventDefault(); finishSegment(); }
      } else if (e.key === "Enter") {
        if (overall === "running" && sub === "doneSeg") nextStep();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overall, sub, seg]);

  const qText = questions[seg];

  return (
    <>
    <div className="panes">
      {/* Left: prompt */}
<section className="panel">
  {overall === "ready" ? (
    <div className="intro-panel" style={{ textAlign: "center", padding: "2rem 1rem" }}>
      <p className="muted">Press <strong>Start task</strong> to see the photo and hear the first question.</p>
    </div>
  ) : (
    <>
      <div className="imgwrap" aria-label="Photograph">
        {task?.image ? (
          <img src={task.image} alt={task.alt || "Speaking Part 2 photograph"} />
        ) : (
          <span className="muted">No image</span>
        )}
      </div>

      <div className="qs">
        {overall !== "summary" ? (
          <div className="q">
            <strong>{seg + 1}.</strong> {qText}
          </div>
        ) : (
          <div className="q">
            <strong>Great!</strong> You’ve completed all three questions.
          </div>
        )}
      </div>
    </>
  )}
</section>

      {/* Right: controls */}
      <section className="panel">
      <audio ref={ttsAudioRef} preload="none" playsInline style={{ display: 'none' }} />
        <div className="meters">
          <span className="pill">
            {overall === "ready" && "Ready to start"}
            {overall === "running" && `Question ${seg + 1} / 3`}
            {overall === "summary" && "Complete"}
          </span>
          {overall === "running" && (
            <span className="pill" aria-live="polite">
              {sub === "announce" && "Playing question…"}
              {sub === "beep" && "Beep…"}
              {sub === "speak" && `Speaking: ${formatTime(left)}`}
              {sub === "doneSeg" && "Recorded"}
            </span>
          )}
          {recording && <span className="pill" aria-live="polite">● Recording</span>}
        </div>

        {/* Actions */}
        {overall === "ready" && (
          <div className="actions">
            <button className="btn primary" onClick={startTask}>Start task</button>
          </div>
        )}

        {overall === "running" && (
          <div className="actions">
            {sub === "speak" && (
              <button className="btn primary" onClick={finishSegment}>Stop now</button>
            )}
            {sub === "doneSeg" && (
              <>
                <audio controls playsInline preload="metadata" src={recordings[seg]?.url} />
                <a className="btn" href={recordings[seg]?.url} download={recordings[seg]?.name}>Download Q{seg + 1}</a>
                <button className="btn" onClick={() => {
                  // retry current question from TTS
                  setLeft(SPEAK_SECONDS);
                  setRecordings(prev => {
                    const next = [...prev];
                    next[seg] = undefined;
                    return next;
                  });
                  setSub("announce");
                }}>Try again</button>
                <button className="btn primary" onClick={nextStep}>
                  {seg < 2 ? "Next question" : "Finish task"}
                </button>
              </>
            )}
          </div>
        )}

        {overall === "summary" && (
          <Summary
            recordings={recordings}
            taskId={task?.id || "task"}
            user={user}
            feedbackLoading={feedbackLoading}
            feedbackError={feedbackError}
            onRequestFeedback={requestPart2Feedback}
            onDownloadAll={createZipAndDownload}
            onRestart={startTask}
          />
        )}

        {micError && <p className="muted" role="alert" style={{ marginTop: ".5rem" }}>{micError}</p>}
      </section>
    </div>
    {overall === "summary" && feedbackResult?.feedback && (
      <FeedbackPanel feedbackResult={feedbackResult} questions={questions} />
    )}
    </>
  );
}

function formatTime(total) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/* ──────────────────────────────────────────────────────────────────────────
   Summary + Download all
   ────────────────────────────────────────────────────────────────────────── */
function Summary({
  recordings,
  taskId,
  user,
  feedbackLoading,
  feedbackError,
  onRequestFeedback,
  onDownloadAll,
  onRestart,
}) {
  return (
    <div className="summary">
      <h3 style={{ marginTop: 0 }}>Recordings</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: ".5rem" }}>
        {recordings.map((r, i) => (
          <li key={i} style={{ display: "flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap" }}>
            <span className="pill">Q{i + 1}</span>
            <audio controls playsInline preload="metadata" src={r?.url} />
            <a className="btn" href={r?.url} download={r?.name}>Download Q{i + 1}</a>
          </li>
        ))}
      </ul>
      <div className="actions" style={{ marginTop: ".75rem", display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
        <button
          className="btn primary"
          onClick={async () => {
            await onDownloadAll(recordings, `aptis-part2-${taskId}.zip`);
          }}
        >
          Download all (.zip)
        </button>
        <button
          className="btn primary"
          onClick={onRequestFeedback}
          disabled={!user || feedbackLoading || recordings.filter((item) => item?.blob).length !== 3}
          title={!user ? "Sign in to get AI feedback" : "Generate transcript-based written feedback"}
        >
          {feedbackLoading ? "Getting feedback..." : "Get AI feedback"}
        </button>
        <button className="btn" onClick={onRestart}>Start another set</button>
      </div>
      {!user && (
        <p className="muted" style={{ marginTop: ".5rem" }}>
          Sign in to test transcript-based AI feedback.
        </p>
      )}
      {feedbackError && (
        <p className="muted" role="alert" style={{ marginTop: ".5rem" }}>
          {feedbackError}
        </p>
      )}
    </div>
  );
}

function FeedbackPanel({ feedbackResult, questions }) {
  const feedback = feedbackResult?.feedback;
  const transcripts = feedbackResult?.transcripts || [];
  if (!feedback) return null;

  return (
    <section className="feedback-panel" aria-label="AI feedback">
      <div className="feedback-head">
        <h4>AI feedback</h4>
        {feedback.estimatedLevel?.label && (
          <span className="level-badge">
            {feedback.estimatedLevel.label}
          </span>
        )}
      </div>
      <p>{feedback.overall?.summary}</p>
      <p className="muted">
        {feedback.estimatedLevel?.note || "AI-estimated Aptis-style feedback, not an official score."}
      </p>

      <div className="feedback-grid">
        <FeedbackBullets title="Strengths" items={feedback.overall?.mainStrengths} />
        <FeedbackBullets title="Priorities" items={feedback.overall?.mainPriorities} />
      </div>

      {feedback.overall?.photoDescriptionAdvice && (
        <p><strong>Photo description:</strong> {feedback.overall.photoDescriptionAdvice}</p>
      )}
      {feedback.overall?.developmentAdvice && (
        <p><strong>Development:</strong> {feedback.overall.developmentAdvice}</p>
      )}
      {feedback.overall?.transcriptCaveat && (
        <p className="muted">{feedback.overall.transcriptCaveat}</p>
      )}

      {Array.isArray(feedback.answers) && feedback.answers.map((item, index) => {
        const transcript = transcripts[index]?.transcript || item.transcript || "";
        return (
          <div className="answer-feedback" key={item.questionId || index}>
            <h4>Q{index + 1}: {questions[index] || item.question}</h4>
            <p className="transcript">"{transcript || "No clear transcript."}"</p>
            <div className="feedback-grid">
              <Criterion title="Task" data={item.taskFulfilment} />
              <Criterion title="Content" data={item.content} />
              <Criterion title="Development" data={item.answerDevelopment} />
              <Criterion title="Grammar" data={item.grammar} />
              <Criterion title="Vocabulary" data={item.vocabulary} />
              <Criterion title="Cohesion" data={item.cohesion} />
              <Criterion title="Fluency" data={item.fluency} />
            </div>
            <LanguageFixes items={item.languageErrors} />
            <ExamplesList title="Grammar examples" items={item.grammar?.examples} type="grammar" />
            <ExamplesList title="Vocabulary examples" items={item.vocabulary?.examples} type="vocabulary" />
            {item.improvedAnswer && (
              <div className="improved-answer">
                <strong>Improved answer</strong>
                <p>{item.improvedAnswer}</p>
              </div>
            )}
            {item.teacherNote && <p><strong>Teacher note:</strong> {item.teacherNote}</p>}
          </div>
        );
      })}
    </section>
  );
}

function FeedbackBullets({ title, items }) {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <div className="criterion">
      <strong>{title}</strong>
      <ul className="feedback-list">
        {items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    </div>
  );
}

function Criterion({ title, data }) {
  if (!data) return null;
  return (
    <div className="criterion">
      <strong>{title}</strong>
      {data.status && <span className="status">{formatStatus(data.status)}</span>}
      <p>{data.feedback || data.comment}</p>
      {Array.isArray(data.missingIdeas) && data.missingIdeas.length ? (
        <ul className="feedback-list compact">
          {data.missingIdeas.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      ) : null}
    </div>
  );
}

function LanguageFixes({ items }) {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <div className="language-fixes">
      <h4>Language to fix</h4>
      <ul>
        {items.map((item, index) => (
          <li key={`${item.category}-${item.original}-${index}`}>
            <small className={item.category}>{formatStatus(item.category)}</small>
            <p><span>{item.original}</span> → <strong>{item.correction}</strong></p>
            {item.explanation ? <em>{item.explanation}</em> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExamplesList({ title, items, type }) {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <>
      <h4>{title}</h4>
      <ul className="feedback-list">
        {items.map((item, index) => (
          <li key={index}>
            <strong>{item.original}</strong>
            {" → "}
            {type === "vocabulary" ? item.suggestion : item.correction}
            {item.explanation ? ` (${item.explanation})` : ""}
          </li>
        ))}
      </ul>
    </>
  );
}

function formatStatus(status = "") {
  return String(status).replace(/_/g, " ");
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      resolve(value.includes(",") ? value.split(",").pop() : value);
    };
    reader.onerror = () => reject(reader.error || new Error("Could not read recording."));
    reader.readAsDataURL(blob);
  });
}

/* ──────────────────────────────────────────────────────────────────────────
   Tiny ZIP (store) builder
   ────────────────────────────────────────────────────────────────────────── */
async function createZipAndDownload(files, zipName = "recordings.zip") {
  const enc = new TextEncoder();
  const centralDir = [];
  const localParts = [];
  let offset = 0;

  const u16 = (n) => { const b=new Uint8Array(2); new DataView(b.buffer).setUint16(0,n,true); return b; };
  const u32 = (n) => { const b=new Uint8Array(4); new DataView(b.buffer).setUint32(0,n,true); return b; };

  // CRC32
  const crcTable = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[i] = c >>> 0;
    }
    return t;
  })();
  const crc32 = (buf) => {
    let c = 0 ^ (-1), v = new Uint8Array(buf);
    for (let i = 0; i < v.length; i++) c = (c >>> 8) ^ crcTable[(c ^ v[i]) & 0xFF];
    return (c ^ (-1)) >>> 0;
  };

  const concatU8 = (parts) => {
    const total = parts.reduce((n, p) => n + p.byteLength, 0);
    const out = new Uint8Array(total);
    let pos = 0;
    parts.forEach(p => { out.set(p, pos); pos += p.byteLength; });
    return out;
  };

  for (const f of files) {
    const data = await f.blob.arrayBuffer();
    const nameBytes = enc.encode(f.name);
    const crc = crc32(data);
    const size = data.byteLength;

    const LFH = concatU8([
      u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0),
      u32(crc), u32(size), u32(size), u16(nameBytes.length), u16(0),
      nameBytes
    ]);
    localParts.push(LFH, new Uint8Array(data));
    const localLen = LFH.byteLength + size;

    const CDH = concatU8([
      u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0),
      u32(crc), u32(size), u32(size),
      u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0), u32(0),
      u32(offset), nameBytes
    ]);
    centralDir.push(CDH);

    offset += localLen;
  }

  const central = centralDir.length ? concatU8(centralDir) : new Uint8Array();
  const EOCD = concatU8([
    u32(0x06054b50), u16(0), u16(0),
    u16(files.length), u16(files.length),
    u32(central.byteLength), u32(offset),
    u16(0)
  ]);

  const zipBytes = concatU8([...localParts, central, EOCD]);
  const blob = new Blob([zipBytes], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ──────────────────────────────────────────────────────────────────────────
   ChipDropdown (same pattern as Reading)
   ────────────────────────────────────────────────────────────────────────── */
   function ChipDropdown({ items, value, onChange, label = "Task" }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
  
    useEffect(() => {
      function onDocClick(e) {
        if (!ref.current) return;
        if (!ref.current.contains(e.target)) setOpen(false);
      }
      document.addEventListener("mousedown", onDocClick);
      return () => document.removeEventListener("mousedown", onDocClick);
    }, []);
  
    const current = items[value];
  
    return (
      <div className="chip-select" ref={ref}>
        <button
          type="button"
          className={`count-chip ${open ? "selected" : ""}`}
          onClick={() => setOpen(o => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`${label}: ${value + 1}. ${current?.title || ""}`}
        >
          {value + 1}
          <span className="chip-caret" aria-hidden>▾</span>
        </button>
  
        {open && (
          <ul className="chip-menu" role="listbox">
            {items.map((it, i) => {
              const isActive = i === value;
              const isLocked = !!it.locked;
              return (
                <li key={it.id}>
                  <button
  type="button"
  role="option"
  aria-selected={isActive}
  aria-disabled={isLocked}
  disabled={isLocked} // ← truly unselectable
  className={`chip-option ${isActive ? "active" : ""} ${isLocked ? "locked" : ""}`}
  onClick={() => {
    if (!isLocked) {
      onChange(i);
      setOpen(false);
    }
  }}
  title={it.title}
>
  <strong className="num">{i + 1}.</strong>
  <span className="ttl">{it.title}</span>
</button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }  

/* ──────────────────────────────────────────────────────────────────────────
   Styles (aligned with your Reading page)
   ────────────────────────────────────────────────────────────────────────── */
function StyleScope(){
  return (
    <style>{`
      .aptis-speaking { --bg:#0e1a2f; --panel:#13213b; --ink:#e6f0ff; --muted:#a9b7d1; --accent:#7db3ff; }
      .aptis-speaking { color: var(--ink); }
      .aptis-speaking .header { display:flex; justify-content:space-between; align-items:flex-end; gap:1rem; margin-bottom:1rem; }
      .aptis-speaking .title { margin:0; font-size:1.4rem; }
      .aptis-speaking .intro { margin:.25rem 0 0; color: var(--muted); }
      .aptis-speaking .muted { color: var(--muted); }

      .aptis-speaking .panes { display:grid; grid-template-columns:1fr; gap:1rem; }
      @media (min-width: 960px){ .aptis-speaking .panes { grid-template-columns: 1.2fr .8fr; } }

      .aptis-speaking .panel { background: var(--panel); border:1px solid #203258; border-radius:16px; padding:1rem; box-shadow: 0 6px 18px rgba(0,0,0,0.25);} 

      .aptis-speaking .imgwrap {
  width: 100%;
  border-radius: .75rem;
  overflow: hidden;
  background: #0f1b31;
  display: flex;
  align-items: center;
  justify-content: center;
}

.aptis-speaking .imgwrap img {
  max-width: 100%;
  max-height: min(60vh, 520px); /* keeps it big but not overflowing */
  width: auto;
  height: auto;
  object-fit: contain;          /* ← no cropping */
}

      .aptis-speaking .qs { display:grid; gap:.5rem; margin-top:.75rem; }
      .aptis-speaking .q { padding:.5rem .75rem; border-left:3px solid #3b517c; background:#0f1b31; border-radius:.4rem; }

      .aptis-speaking .meters { display:flex; gap:.5rem; align-items:center; flex-wrap:wrap; margin-bottom:.6rem; }
      .aptis-speaking .pill { padding:.25rem .6rem; border-radius:999px; border:1px solid #37598e; }

      .aptis-speaking .actions { display:flex; gap:.5rem; flex-wrap:wrap; }
      .aptis-speaking .btn { background:#24365d; border:1px solid #335086; color:var(--ink); padding:0.45rem 0.7rem; border-radius:10px; cursor:pointer; }
      .aptis-speaking .btn:hover { filter:brightness(1.05); }
      .aptis-speaking .btn.primary { background:#294b84; border-color:#3a6ebd; }

      .aptis-speaking .playback { display:flex; gap:1rem; align-items:center; flex-wrap:wrap; margin-top:.75rem; }

      .aptis-speaking .feedback-panel { margin-top:1.2rem; padding:1rem; border:1px solid #2f4776; border-radius:14px; background:#0f1b31; display:grid; gap:.85rem; }
      .aptis-speaking .feedback-head { display:flex; align-items:center; justify-content:space-between; gap:.75rem; flex-wrap:wrap; }
      .aptis-speaking .feedback-head h4 { margin:0; font-size:1.05rem; }
      .aptis-speaking .level-badge { display:inline-flex; align-items:center; border-radius:999px; padding:.35rem .65rem; background:#f1b84a; color:#17223d; font-weight:800; }
      .aptis-speaking .feedback-list { margin:.35rem 0 0; padding-left:1.1rem; color:#dbe7ff; }
      .aptis-speaking .feedback-list.compact { margin-top:.25rem; }
      .aptis-speaking .feedback-grid { display:grid; grid-template-columns:1fr; gap:.75rem; }
      @media (min-width: 760px){ .aptis-speaking .feedback-grid { grid-template-columns:repeat(2, minmax(0, 1fr)); } }
      .aptis-speaking .criterion { border:1px solid #2a416e; border-radius:12px; padding:.75rem; background:#162744; }
      .aptis-speaking .criterion strong { display:block; margin-bottom:.25rem; }
      .aptis-speaking .criterion p { margin:.35rem 0 0; color:#dbe7ff; }
      .aptis-speaking .criterion .status { display:inline-flex; margin-top:.2rem; border-radius:999px; padding:.15rem .45rem; background:#24365d; color:#cfe1ff; font-size:.78rem; text-transform:capitalize; }
      .aptis-speaking .answer-feedback { border-top:1px solid #2f4776; padding-top:1rem; display:grid; gap:.75rem; }
      .aptis-speaking .answer-feedback h4 { margin:0; }
      .aptis-speaking .transcript { margin:0; padding:.75rem; border-radius:12px; background:#101d35; color:#e6f0ff; }
      .aptis-speaking .language-fixes { border:1px solid #2a416e; border-radius:12px; padding:.75rem; background:#162744; }
      .aptis-speaking .language-fixes h4 { margin:0 0 .5rem; }
      .aptis-speaking .language-fixes ul { margin:0; padding:0; list-style:none; display:grid; gap:.65rem; }
      .aptis-speaking .language-fixes li { border-top:1px solid #2a416e; padding-top:.65rem; }
      .aptis-speaking .language-fixes li:first-child { border-top:0; padding-top:0; }
      .aptis-speaking .language-fixes small { display:inline-flex; margin-bottom:.25rem; border-radius:999px; padding:.12rem .45rem; background:#24365d; color:#cfe1ff; text-transform:capitalize; }
      .aptis-speaking .language-fixes p { margin:.1rem 0; }
      .aptis-speaking .language-fixes em { color:#a9b7d1; }
      .aptis-speaking .improved-answer { border:1px solid #345889; border-radius:12px; padding:.75rem; background:#172a4a; }
      .aptis-speaking .improved-answer p { margin:.4rem 0 0; }

      /* Chip dropdown (match reading) */
      .aptis-speaking .chip-select { position: relative; display: inline-block; }
      .aptis-speaking .count-chip { min-width: 2.4rem; justify-content: center; display: inline-flex; align-items: center; gap: .35rem; background:#24365d; border:1px solid #335086; color:var(--ink); padding:.35rem .5rem; border-radius:999px; }
      .aptis-speaking .count-chip.selected { background:#294b84; border-color:#3a6ebd; }
      .aptis-speaking .chip-caret { font-size:.85em; opacity:.9; }
      .aptis-speaking .chip-menu { position:absolute; right:0; margin-top:.4rem; background:#132647; border:1px solid #2c4b83; border-radius:12px; padding:.35rem; list-style:none; min-width:16rem; max-height:50vh; overflow:auto; box-shadow:0 10px 24px rgba(0,0,0,.35); z-index:50; }
      .aptis-speaking .chip-option { width:100%; text-align:left; background:transparent; border:0; color:#e6f0ff; padding:.45rem .6rem; border-radius:10px; display:flex; gap:.5rem; align-items:baseline; cursor:pointer; }
      .aptis-speaking .chip-option:hover { background:#0f1b31; }
      .aptis-speaking .chip-option.active { background:#294b84; }
      .aptis-speaking .chip-option .num { color:#cfe1ff; width:2.2rem; display:inline-block; }
      .aptis-speaking .chip-option .ttl { color:#e6f0ff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      /* inside StyleScope */
.aptis-speaking .chip-option.locked { opacity: .5; cursor: not-allowed; }

      :root[data-theme="light"] .aptis-speaking { --panel:#ffffff; --ink:#24314d; --muted:#667085; }
      :root[data-theme="light"] .aptis-speaking .panel { border-color:#d8e0ee; box-shadow:0 10px 24px rgba(33, 51, 84, .08); }
      :root[data-theme="light"] .aptis-speaking .imgwrap,
      :root[data-theme="light"] .aptis-speaking .q,
      :root[data-theme="light"] .aptis-speaking .feedback-panel,
      :root[data-theme="light"] .aptis-speaking .transcript { background:#f7f9fc; }
      :root[data-theme="light"] .aptis-speaking .pill,
      :root[data-theme="light"] .aptis-speaking .criterion,
      :root[data-theme="light"] .aptis-speaking .language-fixes,
      :root[data-theme="light"] .aptis-speaking .improved-answer { background:#ffffff; border-color:#d8e0ee; color:#24314d; }
      :root[data-theme="light"] .aptis-speaking .feedback-list,
      :root[data-theme="light"] .aptis-speaking .criterion p,
      :root[data-theme="light"] .aptis-speaking .transcript { color:#24314d; }
      :root[data-theme="light"] .aptis-speaking .btn,
      :root[data-theme="light"] .aptis-speaking .count-chip { background:#eef3fb; border-color:#cbd7ea; color:#24314d; }
      :root[data-theme="light"] .aptis-speaking .btn.primary,
      :root[data-theme="light"] .aptis-speaking .count-chip.selected,
      :root[data-theme="light"] .aptis-speaking .chip-option.active { background:#315f9f; border-color:#315f9f; color:#ffffff; }
      :root[data-theme="light"] .aptis-speaking .chip-menu { background:#ffffff; border-color:#d8e0ee; box-shadow:0 16px 32px rgba(33, 51, 84, .14); }
      :root[data-theme="light"] .aptis-speaking .chip-option { color:#24314d; }
      :root[data-theme="light"] .aptis-speaking .chip-option:hover { background:#f0f5fb; }
      :root[data-theme="light"] .aptis-speaking .chip-option .num,
      :root[data-theme="light"] .aptis-speaking .chip-option .ttl { color:inherit; }
    `}</style>
  );
}
