// src/components/speaking/SpeakingPart4.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "../../utils/toast";
import * as fb from "../../firebase";
import { loadSpeakingDone, markSpeakingDone } from "../../utils/speakingProgress";
import { PART4_TASKS } from "./banks/part4";

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
  user,
  onRequireSignIn,
  prepareSeconds = 60,
  speakSeconds = 120,
}) {
  const [taskIndex, setTaskIndex] = useState(0);
  const current = tasks[taskIndex] || tasks[0];

  // completed set (cross-device via Firebase; local fallback)
  const [completed, setCompleted] = useState(new Set());
  useEffect(() => {
    let alive = true;
    (async () => {
        const done = await loadSpeakingDone("part4", fb, user);
        if (alive) setCompleted(done);
    })();
    return () => { alive = false; };
  }, [user]);

  // decorate picker (✓ done, 🔒 locked 3+ if signed out)
  const decorated = useMemo(() =>
    tasks.map((t, i) => {
      const locked = !user && i >= 2;
      const done = completed.has(t.id);
      return { ...t, locked, title: `${i+1}. ${t.title}${done?" ✓":""}${locked?" 🔒":""}` };
    }),
  [tasks, completed, user]);

  function handleSelectTask(nextIndex) {
    if (!user && nextIndex >= 2) { /* reading-style: ignore click */ return; }
    setTaskIndex(nextIndex);
  }

  return (
    <div className="aptis-speaking4 game-wrapper wide" style={{ maxWidth: 'min(1280px, 96vw)' }}>
      <StyleScope />

      <header className="header">
        <div>
          <h2 className="title">Speaking – Part 4 (2-minute Talk)</h2>
          <p className="intro">
            You have <strong>1 minute to prepare</strong> and then <strong>2 minutes to speak </strong>
            answering all three questions together, in order.
          </p>
        </div>
        <div className="picker">
          <ChipDropdown items={decorated} value={taskIndex} onChange={handleSelectTask} label="Task" />
        </div>
      </header>

      <Part4Flow
        task={current}
        prepareSeconds={prepareSeconds}
        speakSeconds={speakSeconds}
        onFinished={async () => {
          const updated = await markSpeakingDone("part4", [current.id], fb, user);
          if (updated) setCompleted(updated);
          toast("Task marked as completed ✓");
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

function Part4Flow({ task, prepareSeconds, speakSeconds, onFinished }) {
    // phases: ready → announce → prep → beep → speak → summary
    const [phase, setPhase] = useState("ready");
    const [left, setLeft] = useState(prepareSeconds);
    const [recording, setRecording] = useState(false);
    const [micError, setMicError] = useState("");
  
    const recRef = useRef(null);
    const chunksRef = useRef([]);
    const [file, setFile] = useState(null); // { blob, url, name }
  
    const questions = task?.qs || task?.questions || [];
  
    // reset on task change
    useEffect(() => {
      setPhase("ready");
      setLeft(prepareSeconds);
      setRecording(false);
      setFile(null);
      setMicError("");
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
  
    function startPrep() {
      // We first read the questions + prep note in "announce"
      setPhase("announce");
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
  
    // recording helpers
    async function startRecording() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setMicError("Recording not supported."); 
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream);
        recRef.current = mr;
        chunksRef.current = [];
  
        mr.ondataavailable = (e) => { if (e.data?.size) chunksRef.current.push(e.data); };
        mr.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const url = URL.createObjectURL(blob);
          const name = `part4-${task?.id || "task"}-talk.webm`;
          setFile({ blob, url, name });
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
    function cancelTTS(){ try { window.speechSynthesis?.cancel(); } catch {} }
    function speakTTS(text){
      return new Promise((resolve)=>{
        try{
          const synth = window.speechSynthesis; if (!synth) return resolve();
          const u = new SpeechSynthesisUtterance(text);
          u.lang = "en-GB"; u.rate = 1; u.pitch = 1; u.volume = 1;
          u.onend = resolve; u.onerror = resolve;
          synth.cancel(); synth.speak(u);
        } catch { resolve(); }
      });
    }
    function playBeep(freq=600, seconds=1.0){
      return new Promise((resolve)=>{
        try{
          const C = new (window.AudioContext||window.webkitAudioContext)();
          const o=C.createOscillator(), g=C.createGain();
          o.type="sine"; o.frequency.value=freq; o.connect(g); g.connect(C.destination);
          g.gain.setValueAtTime(0.001, C.currentTime);
          g.gain.exponentialRampToValueAtTime(0.35, C.currentTime + 0.03);
          o.start();
          const tEnd = C.currentTime + seconds;
          g.gain.exponentialRampToValueAtTime(0.0001, tEnd);
          o.stop(tEnd + 0.01);
          o.onended = () => { C.close?.(); resolve(); };
        } catch { resolve(); }
      });
    }
  
    // UI
    return (
      <div className="panes panes-vertical">
        {/* Top: controls + timers */}
        <section className="panel controls-panel">
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
                onClick={() => { window.speechSynthesis?.cancel(); setLeft(prepareSeconds); setPhase("prep"); }}
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
                  <audio controls src={file.url} />
                  <a className="btn primary" href={file.url} download={file.name}>Download talk</a>
                </>
              )}
            </div>
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
    );
  }
  

function formatTime(t){ const m=Math.floor(t/60), s=t%60; return `${m}:${String(s).padStart(2,"0")}`; }

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
