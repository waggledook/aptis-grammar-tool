// src/components/speaking/SpeakingPart4.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "../../utils/toast";
import * as fb from "../../firebase";
import { loadSpeakingDone, markSpeakingDone } from "../../utils/speakingProgress";
import { PART4_TASKS } from "./banks/part4";
import SpeakingAssignButton from "./SpeakingAssignButton";
import { getSitePath } from "../../siteConfig.js";
import SpeakingDemoNotice from "./SpeakingDemoNotice.jsx";
import SpeakingFeedbackPanel from "./SpeakingFeedbackPanel.jsx";

/**
 * Aptis Speaking – Part 4 (2-minute talk)
 * Structure:
 *  • Show a topic with 3 related questions.
 *  • 1 minute preparation (countdown) — no recording.
 *  • Beep → 2 minutes recording (single continuous answer).
 *  • Summary + download.
 *
 * Props:
 *  - tasks: Part4Task[]  (id, title, qs: [q1,q2,q3])
 *  - prepareSeconds = 60
 *  - speakSeconds   = 120
 *  - user, onRequireSignIn (locks tasks 3+ when signed out)
 */

export default function SpeakingPart4({
  tasks = PART4_TASKS,
  allowedTaskIds = [],
  user,
  aptisAccess,
  onSignIn,
  onRequireSignIn,
  prepareSeconds = 60,
  speakSeconds = 120,
  partKey = "part4",
  activityId = "speaking-part-4",
  routeBasePath = getSitePath("/speaking/part4"),
  showAssignButton = true,
  trackProgress = true,
  lockAfterIndex = 2,
  headerActions = null,
  heading = "Speaking – Part 4 (2-minute Talk)",
  intro = (
    <>
      You have <strong>1 minute to prepare</strong> and then <strong>2 minutes to speak </strong>
      answering all three questions together, in order.
    </>
  ),
}) {
  const [searchParams] = useSearchParams();
  const allowedTaskSet = useMemo(() => new Set(allowedTaskIds), [allowedTaskIds]);
  const requestedTaskId = searchParams.get("task") || "";
  const requestedTaskIndex = tasks.findIndex((task) => task.id === requestedTaskId);
  const initialTaskIndex =
    requestedTaskIndex >= 0 &&
    (!allowedTaskIds.length || allowedTaskSet.has(tasks[requestedTaskIndex]?.id))
      ? requestedTaskIndex
      : 0;
  const [taskIndex, setTaskIndex] = useState(initialTaskIndex);
  const current = tasks[taskIndex] || tasks[0];

  // completed set (cross-device via Firebase; local fallback)
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

    const nextIndex = tasks.findIndex((task) => task.id === requestedTaskId);
    if (nextIndex === -1) return;
    if (isTaskLocked(tasks[nextIndex], nextIndex)) return;
    setTaskIndex(nextIndex);
  }, [allowedTaskIds.length, allowedTaskSet, lockAfterIndex, searchParams, tasks, user]);

  useEffect(() => {
    if (!tasks.length) return;
    if (isTaskLocked(tasks[taskIndex], taskIndex)) setTaskIndex(0);
  }, [allowedTaskIds.length, allowedTaskSet, lockAfterIndex, taskIndex, tasks, user]);

  function isTaskLocked(task, index) {
    return allowedTaskIds.length
      ? !allowedTaskSet.has(task?.id)
      : !user && lockAfterIndex != null && index >= lockAfterIndex;
  }

  // decorate picker (✓ done, 🔒 locked 3+ if signed out)
  const decorated = useMemo(() =>
    tasks.map((t, i) => {
      const locked = isTaskLocked(t, i);
      const done = completed.has(t.id);
      return { ...t, locked, title: `${i+1}. ${t.title}${done?" ✓":""}${locked?" 🔒":""}` };
    }),
  [allowedTaskIds.length, allowedTaskSet, tasks, completed, lockAfterIndex, user]);

  function handleSelectTask(nextIndex) {
    if (isTaskLocked(tasks[nextIndex], nextIndex)) {
      toast("That speaking task is included with full access.");
      onRequireSignIn?.();
      return;
    }
    setTaskIndex(nextIndex);
  }

  return (
    <div className="aptis-speaking4 game-wrapper wide" style={{ maxWidth: 'min(1280px, 96vw)' }}>
      <StyleScope />

      <header className="header">
        <div>
          <h2 className="title">{heading}</h2>
          <p className="intro">{intro}</p>
        </div>
        <div className="picker">
          <ChipDropdown items={decorated} value={taskIndex} onChange={handleSelectTask} label="Task" />
          {showAssignButton ? (
            <SpeakingAssignButton
              user={user}
              activityId={activityId}
              activityLabel={`Aptis Speaking Part 4 — ${current.title}`}
              routePath={`${routeBasePath}?task=${encodeURIComponent(current.id)}`}
              taskId={current.id}
              taskTitle={current.title}
            />
          ) : null}
          {headerActions}
        </div>
      </header>

      <SpeakingDemoNotice user={user} aptisAccess={aptisAccess} onSignIn={onSignIn}>
        Demo mode includes one Part 4 long-turn task. The other Part 4 topics stay visible but require full access.
      </SpeakingDemoNotice>

      <Part4Flow
        task={current}
        user={user}
        prepareSeconds={prepareSeconds}
        speakSeconds={speakSeconds}
        onFinished={async () => {
          if (!trackProgress) return;
          try {
            const updated = await markSpeakingDone(partKey, [current.id], fb, user);
            if (updated) setCompleted(updated);
            toast("Task marked as completed ✓");

            // Log activity: Part 4 long turn (single 2-minute talk with 3 prompts)
            if (user && fb.logSpeakingTaskCompleted) {
              await fb.logSpeakingTaskCompleted({
                part: partKey,
                taskId: current.id,
                questionCount: 3,
              });
            }
          } catch (e) {
            console.error("[p4] error in markSpeakingDone / log", e);
            toast("Couldn’t save completion (local only).");
          }
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

function Part4Flow({ task, user, prepareSeconds, speakSeconds, onFinished }) {
    // phases: ready → announce → prep → beep → speak → summary
    const [phase, setPhase] = useState("ready");
    const [left, setLeft] = useState(prepareSeconds);
    const [recording, setRecording] = useState(false);
    const [micError, setMicError] = useState("");
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [feedbackError, setFeedbackError] = useState("");
    const [feedbackResult, setFeedbackResult] = useState(null);
  
    const recRef = useRef(null);
    const chunksRef = useRef([]);
    const ttsAudioRef = useRef(null);
    const ttsCacheRef = useRef(new Map()); // key: `${voice}::${text}` → url
    const [file, setFile] = useState(null); // { blob, url, name }
  
    const questions = task?.qs || task?.questions || [];

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

  
    // reset on task change
    useEffect(() => {
      setPhase("ready");
      setLeft(prepareSeconds);
      setRecording(false);
      setFile(null);
      setMicError("");
      setFeedbackLoading(false);
      setFeedbackError("");
      setFeedbackResult(null);
      stopRecording(true);
      cancelTTS();
    }, [task?.id, prepareSeconds]);
  
    // timers for prep & speak
    useEffect(() => {
      if (phase !== "prep" && phase !== "speak") return;
      const id = setInterval(() => setLeft(s => (s > 0 ? s - 1 : 0)), 1000);
      return () => clearInterval(id);
    }, [phase]);
  
    // when timers hit zero
    useEffect(() => {
      if (phase === "prep" && left === 0) setPhase("beep");
      if (phase === "speak" && left === 0) finishSpeak();
    }, [phase, left]);
  
    // announce → (TTS questions) → (TTS prep note) → prep
    useEffect(() => {
      if (phase !== "announce") return;
      (async () => {
        // Read the three questions (intro paragraph is shown, not read)
        await speakTTS(
          `The questions are: One: ${questions[0]}. Two: ${questions[1]}. Three: ${questions[2]}.`
        );
        // Then the prep instruction
        await speakTTS(
          "You now have one minute to think about your answers. You can make notes if you wish."
        );
        setLeft(prepareSeconds);
        setPhase("prep");
      })();
    }, [phase, questions, prepareSeconds]);
  
    // beep → start speaking
    useEffect(() => {
      if (phase !== "beep") return;
      (async () => {
        await playBeep(600, 1.0); // adjust if you want longer/shorter
        await startSpeak();
      })();
    }, [phase]);

    useEffect(() => () => {
      try {
        const mr = recRef.current;
        if (mr && mr.state !== "inactive") mr.stop();
      } catch {}
    }, []);
    
  
    // keyboard helpers: Space to start/stop
    useEffect(() => {
      const onKey = (e) => {
        if (e.key === " ") {
          if (phase === "ready") { e.preventDefault(); startPrep(); }
          else if (phase === "speak") { e.preventDefault(); finishSpeak(); }
        }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [phase]);
  
    async function startPrep() {
      await ensureAudioContext();     // 👈 iOS needs a user-gesture resume
      setFeedbackError("");
      setFeedbackResult(null);
      setFile(null);
      setPhase("announce");
    }

    async function requestPart4Feedback() {
      if (!user) {
        setFeedbackError("Sign in to get AI feedback.");
        return;
      }
      if (!file?.blob) {
        setFeedbackError("Record your Part 4 answer before requesting feedback.");
        return;
      }

      setFeedbackLoading(true);
      setFeedbackError("");
      try {
        const result = await fb.requestAptisSpeakingPart4Feedback({
          task: {
            id: task?.id || "",
            title: task?.title || "",
            alt: task?.alt || "",
          },
          questions: questions.map((text, index) => ({
            id: `q${index + 1}`,
            question: text,
          })),
          recordings: [{
            name: file.name || "speaking-part4-talk.webm",
            mime: file.mime || file.blob.type || "audio/webm",
            base64: await blobToBase64(file.blob),
          }],
        });
        setFeedbackResult(result);
        if (result?.feedback && fb.saveSpeakingAiFeedback) {
          try {
            await fb.saveSpeakingAiFeedback({
              part: "part4",
              taskId: task?.id || "",
              taskTitle: task?.title || "Speaking Part 4",
              questions: questions.map((text, index) => ({ id: `q${index + 1}`, question: text })),
              transcripts: result?.transcripts || [],
              feedback: result.feedback,
              meta: result?.meta || null,
            });
          } catch (saveError) {
            console.warn("[Speaking Part 4 feedback] save failed", saveError);
          }
        }
      } catch (error) {
        console.error("[p4] feedback error", error);
        setFeedbackError(error?.message || "Could not generate feedback right now.");
      } finally {
        setFeedbackLoading(false);
      }
    }
  
    async function startSpeak() {
      cancelTTS();
      setLeft(speakSeconds);
      setPhase("speak");
      await startRecording();
    }
  
    function finishSpeak() {
      stopRecording();
      setPhase("summary");
      onFinished?.();
    }
  
    function pickRecordingMime() {
      const prefs = [
        'audio/mp4;codecs=mp4a.40.2', // iOS best
        'audio/mp4',
        'audio/webm;codecs=opus',
        'audio/webm'
      ];
      if (window.MediaRecorder && MediaRecorder.isTypeSupported) {
        for (const t of prefs) if (MediaRecorder.isTypeSupported(t)) return t;
      }
      return '';
    }
    function extForMime(mime='') {
      if (mime.includes('mp4')) return 'm4a';
      if (mime.includes('webm')) return 'webm';
      return 'm4a';
    }

    // recording helpers
    async function startRecording() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setMicError("Recording not supported.");
          return;
        }
        if (typeof MediaRecorder === 'undefined') {
          setMicError("MediaRecorder not available in this browser.");
          return;
        }
    
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
        const mime = pickRecordingMime();
        const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
        recRef.current = mr;
        chunksRef.current = [];
    
        mr.ondataavailable = (e) => { if (e.data?.size) chunksRef.current.push(e.data); };
        mr.onstop = () => {
          const finalMime = mr.mimeType || mime || 'audio/mp4';
          const blob = new Blob(chunksRef.current, { type: finalMime });
          const ext = extForMime(finalMime);
          const name = `part4-${task?.id || "task"}-talk.${ext}`;
          const url = URL.createObjectURL(blob);
          setFile({ blob, url, name, mime: finalMime });
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
      const mr = recRef.current;
      if (mr && mr.state !== "inactive") {
        try { mr.stop(); } catch {}
      }
      if (!silent) setRecording(false);
    }
  
    // TTS + beep
    function cancelTTS(){
      try { window.speechSynthesis?.cancel(); } catch {}
      try {
        const a = ttsAudioRef.current;
        if (a) { a.pause(); a.removeAttribute('src'); a.load(); }
      } catch {}
    }

    async function speakTTS(text){
  const voice = 'en-GB-Neural2-C';  // UK neural (change if you want)
  const key = `${voice}::${text}`;

  try {
    await ensureAudioContext(); // optional
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
    await a.play(); // user clicked Start, so autoplay OK

    // wait until it finishes
    await new Promise((res) => {
      const onEnd = () => { a.removeEventListener('ended', onEnd); res(); };
      a.addEventListener('ended', onEnd);
    });
  } catch (e) {
    console.warn('[P4 TTS] cloud failed, falling back to speechSynthesis', e);
    // graceful fallback so the flow continues
    await new Promise((resolve)=>{
      try{
        const synth = window.speechSynthesis; if(!synth) return resolve();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-GB'; u.rate = 1; u.pitch = 1; u.volume = 1;
        u.onend = resolve; u.onerror = resolve;
        synth.cancel(); synth.speak(u);
      } catch { resolve(); }
    });
  }
}

function playBeep(freq = 600, seconds = 1.0){
  return new Promise(async (resolve) => {
    try{
      const C = await ensureAudioContext();
      const o = C.createOscillator(), g = C.createGain();
      o.type = "sine"; o.frequency.value = freq;
      o.connect(g); g.connect(C.destination);

      const now = C.currentTime;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.35, now + 0.03);
      const tEnd = now + seconds;
      g.gain.exponentialRampToValueAtTime(0.0001, tEnd);

      o.start(now);
      o.stop(tEnd + 0.01);
      o.onended = () => { try { o.disconnect(); g.disconnect(); } catch {} resolve(); };
    } catch { resolve(); }
  });
}

  
    // UI
    return (
      <>
      <div className="panes panes-vertical">
        {/* Top: controls + timers */}
        <section className="panel controls-panel">
        <audio ref={ttsAudioRef} preload="none" playsInline style={{ display: 'none' }} />
          <div className="meters">
            <span className="pill">
              {phase === "ready"    && "Ready to start"}
              {phase === "announce" && "Playing instructions…"}
              {phase === "prep"     && `Preparation: ${formatTime(left)}`}
              {phase === "beep"     && "Beep…"}
              {phase === "speak"    && `Speaking: ${formatTime(left)}`}
              {phase === "summary"  && "Complete"}
            </span>
            {recording && <span className="pill">● Recording</span>}
          </div>
  
          {phase === "ready" && (
            <div className="actions">
              <button className="btn primary" onClick={startPrep}>Start (1-min prep)</button>
            </div>
          )}
  
  {phase === "announce" && (
  <div className="actions">
    <button
      className="btn"
      onClick={() => {
        cancelTTS();                 // ← was speechSynthesis?.cancel()
        setLeft(prepareSeconds);
        setPhase("prep");
      }}
    >
      Skip instructions
    </button>
  </div>
)}


{phase === "prep" && (
  <div className="actions">
    <button
      className="btn primary"
      onClick={() => {
        // No need to clear the interval manually; switching phase stops it
        setPhase("beep"); // this will trigger the beep → startSpeak flow
      }}
    >
      Start speaking now
    </button>
  </div>
)}
  
          {phase === "speak" && (
            <div className="actions">
              <button className="btn primary" onClick={finishSpeak}>Stop now</button>
            </div>
          )}
  
          {phase === "summary" && (
            <div className="actions" style={{ gap: ".5rem", flexWrap: "wrap" }}>
              {file?.url && (
  <>
    <audio controls playsInline preload="metadata" src={file.url} />
    <a className="btn primary" href={file.url} download={file.name}>Download talk</a>
    <button
      className="btn primary"
      onClick={requestPart4Feedback}
      disabled={!user || feedbackLoading || !file?.blob}
      title={!user ? "Sign in to get AI feedback" : "Generate transcript-based written feedback"}
    >
      {feedbackLoading ? "Getting feedback..." : "Get AI feedback"}
    </button>
    <button className="btn" onClick={startPrep}>Start another set</button>
  </>
)}
            </div>
          )}
  
          {!user && phase === "summary" && (
            <p className="muted" style={{ marginTop: ".5rem" }}>
              Sign in to test transcript-based AI feedback.
            </p>
          )}
          {feedbackError && (
            <p className="muted" role="alert" style={{ marginTop: ".5rem" }}>
              {feedbackError}
            </p>
          )}
          {micError && <p className="muted" role="alert" style={{ marginTop: ".5rem" }}>{micError}</p>}
        </section>
  
        {/* Bottom: title + questions (intro shown before start) */}
        <section className="panel topic-panel">
          <h3 style={{ marginTop: 0 }}>{task?.title}</h3>
  
          {phase === "ready" && (
            <p className="muted" style={{ marginBottom: ".75rem" }}>
              Part Four – In this part, I'm going to show you a picture and ask you three questions.
              You will have one minute to think about your answers before you start speaking.
              You will have two minutes to answer all three questions.
            </p>
          )}
  
          {phase !== "ready" && (
            <>
              <ol className="qs3">
                {(questions).map((q, i) => (
                  <li key={i}><span className="qnum">{i + 1}.</span> {q}</li>
                ))}
              </ol>
              {phase === "prep" && (
                <p className="muted" style={{ marginTop: ".5rem" }}>
                  You now have one minute to think about your answers. You can make notes if you wish.
                </p>
              )}
            </>
          )}
        </section>
      </div>
      {phase === "summary" && feedbackResult?.feedback && (
        <SpeakingFeedbackPanel feedbackResult={feedbackResult} questions={questions} />
      )}
      </>
    );
  }
  

function formatTime(t){ const m=Math.floor(t/60), s=t%60; return `${m}:${String(s).padStart(2,"0")}`; }

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

/* ─────────────────────────────────────────────────────────────────────── */

function ChipDropdown({ items, value, onChange, label="Task" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    function onDocClick(e){ if(!ref.current) return; if(!ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);
  const current = items[value];
  return (
    <div className="chip-select" ref={ref}>
      <button
        type="button"
        className={`count-chip ${open ? "selected":""}`}
        onClick={()=>setOpen(o=>!o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${value+1}. ${current?.title||""}`}
      >
        {value+1}<span className="chip-caret" aria-hidden>▾</span>
      </button>
      {open && (
        <ul className="chip-menu" role="listbox">
          {items.map((it, i) => {
            const active = i === value, locked = !!it.locked;
            return (
              <li key={it.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  aria-disabled={locked}
                  disabled={locked}
                  className={`chip-option ${active?"active":""} ${locked?"locked":""}`}
                  onClick={() => { if (!locked) { onChange(i); setOpen(false); } }}
                  title={it.title}
                >
                  <strong className="num">{i+1}.</strong>
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

/* Styles (aligned with your Speaking/Reading look) */
function StyleScope(){
  return (
    <style>{`
      .aptis-speaking4 { --panel:#13213b; --ink:#e6f0ff; --muted:#a9b7d1; }
      .aptis-speaking4 { color: var(--ink); }
      .aptis-speaking4 .header { display:flex; justify-content:space-between; align-items:flex-end; gap:1rem; margin-bottom:1rem; }
      .aptis-speaking4 .title { margin:0; font-size:1.4rem; }
      .aptis-speaking4 .intro { margin:.25rem 0 0; color: var(--muted); }
      .aptis-speaking4 .panel { background: var(--panel); border:1px solid #203258; border-radius:16px; padding:1rem; box-shadow: 0 6px 18px rgba(0,0,0,.25);} 
      .aptis-speaking4 .panes-vertical { display:grid; grid-template-columns:1fr; gap:1rem; }
      .aptis-speaking4 .meters { display:flex; gap:.5rem; align-items:center; flex-wrap:wrap; margin-bottom:.6rem; }
      .aptis-speaking4 .pill { padding:.25rem .6rem; border-radius:999px; border:1px solid #37598e; }
      .aptis-speaking4 .actions { display:flex; gap:.5rem; flex-wrap:wrap; }
      .aptis-speaking4 .btn { background:#24365d; border:1px solid #335086; color:#e6f0ff; padding:0.45rem .7rem; border-radius:10px; cursor:pointer; }
      .aptis-speaking4 .btn:hover { filter:brightness(1.05); }
      .aptis-speaking4 .btn.primary { background:#294b84; border-color:#3a6ebd; }
      /* questions list */
      .aptis-speaking4 .qs3 { margin:.5rem 0 0; padding-left:0; list-style:none; display:grid; gap:.5rem; }
      .aptis-speaking4 .qs3 li { background:#0f1b31; border:1px solid #203258; border-radius:10px; padding:.5rem .75rem; }
      .aptis-speaking4 .qs3 .qnum { font-weight:700; margin-right:.35rem; color:#cfe1ff; }
      /* chip dropdown */
      .aptis-speaking4 .chip-select { position: relative; display: inline-block; }
      .aptis-speaking4 .count-chip { min-width: 2.4rem; justify-content:center; display:inline-flex; align-items:center; gap:.35rem; background:#24365d; border:1px solid #335086; color:#e6f0ff; padding:.35rem .5rem; border-radius:999px; }
      .aptis-speaking4 .count-chip.selected { background:#294b84; border-color:#3a6ebd; }
      .aptis-speaking4 .chip-caret { font-size:.85em; opacity:.9; }
      .aptis-speaking4 .chip-menu { position:absolute; right:0; margin-top:.4rem; background:#132647; border:1px solid #2c4b83; border-radius:12px; padding:.35rem; list-style:none; min-width:16rem; max-height:50vh; overflow:auto; box-shadow:0 10px 24px rgba(0,0,0,.35); z-index:50; }
      .aptis-speaking4 .chip-option { width:100%; text-align:left; background:transparent; border:0; color:#e6f0ff; padding:.45rem .6rem; border-radius:10px; display:flex; gap:.5rem; align-items:baseline; cursor:pointer; }
      .aptis-speaking4 .chip-option:hover { background:#0f1b31; }
      .aptis-speaking4 .chip-option.active { background:#294b84; }
      .aptis-speaking4 .chip-option.locked { opacity:.5; cursor:not-allowed; }
      .aptis-speaking4 .chip-option .num { color:#cfe1ff; width:2.2rem; display:inline-block; }
      .aptis-speaking4 .chip-option .ttl { color:#e6f0ff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    `}</style>
  );
}
