import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "../../utils/toast";
import * as fb from "../../firebase";
import { loadSpeakingDone, markSpeakingDone } from "../../utils/speakingProgress";
import { PART3_TASKS } from "./banks/part3";

/**
 * Speaking – Part 3 (Compare two photos) — Exam-like
 * Flow:
 *  - Start task
 *  - For each of 3 questions: TTS(question) → Beep → 45s recording → auto-advance
 *  - Summary with individual downloads + "Download all (.zip)"
 *
 * Task shape:
 * {
 *   id, title,
 *   photoA: { src, alt? },
 *   photoB: { src, alt? },
 *   questions: [q2, q3]  // Q1 is always "Tell me what you can see in the two photographs."
 * }
 */

export default function SpeakingPart3({ tasks = PART3_TASKS, user, onRequireSignIn }) {
  const items = tasks;

  const [taskIndex, setTaskIndex] = useState(0);
  const current = items[taskIndex] || items[0];

  // completions
  const [completed, setCompleted] = useState(new Set());
  useEffect(() => {
    let alive = true;
    (async () => {
      const done = await loadSpeakingDone("part3", fb, user);
      if (alive) setCompleted(done);
    })();
    return () => { alive = false; };
  }, [user]);

  // decorate picker items (✓ for done, 🔒 for locked 3+ when signed-out)
  const decorated = useMemo(() =>
    items.map((t, i) => {
      const locked = !user && i >= 2;
      const done = completed.has(t.id);
      return {
        ...t,
        locked,
        title: `${i + 1}. ${t.title}${done ? " ✓" : ""}${locked ? " 🔒" : ""}`,
      };
    }),
  [items, completed, user]);

  function handleSelectTask(nextIndex) {
    if (!user && nextIndex >= 2) {
      onRequireSignIn?.(); // open your sign-in modal/sheet
      return;
    }
    setTaskIndex(nextIndex);
  }

  return (
    <div className="aptis-speaking3 game-wrapper wide" style={{ maxWidth: 'min(1280px, 96vw)' }}>
      <StyleScope />

      <header className="header">
        <div>
          <h2 className="title">Speaking – Part 3 (Describe & Compare)</h2>
          <p className="intro">
            You will see <strong>two photographs</strong>. For each question, we’ll read it aloud, play a beep,
            and then you speak for <strong>45 seconds</strong>.
          </p>
        </div>
        <div className="picker">
          <ChipDropdown
            items={decorated}
            value={taskIndex}
            onChange={handleSelectTask}
            label="Task"
          />
        </div>
      </header>

      <TaskFlow
        task={current}
        onFinished={async () => {
          const updated = await markSpeakingDone("part3", [current.id], fb, user);
          if (updated) setCompleted(updated);
          toast("Task marked as completed ✓");
        }}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Flow controller (3 sequential segments)
   ────────────────────────────────────────────────────────────────────────── */
function TaskFlow({ task, onFinished }) {
  const SPEAK_SECONDS = 45;

  const questions = useMemo(() => [
    "Tell me what you can see in the two photographs.",
    task?.questions?.[0] || "Which of these activities might be easier for people of different ages to do?",
    task?.questions?.[1] || "Why do you think exercise is important for people’s lives?",
  ], [task]);

  const [overall, setOverall] = useState("ready"); // ready | running | summary
  const [seg, setSeg] = useState(0);               // 0..2
  const [sub, setSub] = useState("announce");      // announce | beep | speak | doneSeg
  const [left, setLeft] = useState(SPEAK_SECONDS);

  // recordings per segment
  const [recordings, setRecordings] = useState([]);
  const [recording, setRecording] = useState(false);
  const [micError, setMicError] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const ttsAudioRef = useRef(null);
  const ttsCacheRef = useRef(new Map()); // `${voice}::${text}` → url

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
    setOverall("ready");
    setSeg(0);
    setSub("announce");
    setLeft(SPEAK_SECONDS);
    setRecordings([]);
    setMicError("");
    stopRecording(true);
    cancelTTS();
  }, [task?.id]);

  // timer
  useEffect(() => {
    if (overall !== "running" || sub !== "speak") return;
    const id = setInterval(() => setLeft(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [overall, sub]);

  useEffect(() => {
    if (overall === "running" && sub === "speak" && left === 0) finishSegment();
  }, [overall, sub, left]);

  useEffect(() => () => {
    try {
      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== "inactive") mr.stop();
    } catch {}
  }, []);
  
  // announce → beep → speak
  useEffect(() => {
    if (overall !== "running") return;
    if (sub === "announce") {
      (async () => { await speakTTS(questions[seg]); setSub("beep"); })();
    }
    if (sub === "beep") {
      (async () => { await playBeep(600, 1.2); startSegment(); })();
    }
  }, [overall, sub, seg, questions]);

  async function startTask() {
    await ensureAudioContext();               // 👈 iOS needs this
    setOverall("running");
    setSeg(0);
    setSub("announce");
    setLeft(SPEAK_SECONDS);
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
      setSeg(seg + 1);
      setLeft(SPEAK_SECONDS);
      setSub("announce");
    } else {
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
    return '';
  }
  function extForMime(mime='') {
    if (mime.includes('mp4')) return 'm4a';
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
      mr.onstop = () => {
        const finalMime = mr.mimeType || mime || 'audio/mp4';
        const blob = new Blob(audioChunksRef.current, { type: finalMime });
        const ext = extForMime(finalMime);
        const name = `part3-${task?.id || "task"}-q${seg + 1}.${ext}`;
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

  // TTS + beep
  function cancelTTS() {
    try { window.speechSynthesis?.cancel(); } catch {}
    try {
      const a = ttsAudioRef.current;
      if (a) { a.pause(); a.removeAttribute('src'); a.load(); }
    } catch {}
  }
  
  async function speakTTS(text) {
    const voice = 'en-GB-Neural2-C';   // UK neural; switch if you like
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
      await a.play(); // user gesture already happened (Start)
  
      // wait until audio ends
      await new Promise((res) => {
        const onEnd = () => { a.removeEventListener('ended', onEnd); res(); };
        a.addEventListener('ended', onEnd);
      });
    } catch (e) {
      console.warn('[P3 TTS] cloud failed, falling back to speechSynthesis', e);
      // Fallback so the flow continues
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
  

  // keyboard
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
    <div className="panes panes-vertical">
      {/* Top: controls */}
      <section className="panel controls-panel">
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
          {recording && <span className="pill">● Recording</span>}
        </div>
  
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
                <a className="btn" href={recordings[seg]?.url} download={recordings[seg]?.name}>
                  Download Q{seg + 1}
                </a>
                <button
                  className="btn"
                  onClick={() => {
                    setLeft(SPEAK_SECONDS);
                    setRecordings(prev => { const next = [...prev]; next[seg] = undefined; return next; });
                    setSub("announce");
                  }}
                >
                  Try again
                </button>
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
            onDownloadAll={createZipAndDownload}
          />
        )}
  
        {micError && (
          <p className="muted" role="alert" style={{ marginTop: ".5rem" }}>
            {micError}
          </p>
        )}
      </section>
  
      {/* Bottom: photos + question (full width row) */}
      <section className="panel photos-panel">
        {overall === "ready" ? (
          <div className="intro-panel" style={{ textAlign: "center", padding: "2rem 1rem" }}>
            <p className="muted">
              Press <strong>Start task</strong> to see the photos and hear the first question.
            </p>
          </div>
        ) : (
          <>
            <div className="twophotos wide-row">
              <div className="imgwrap" aria-label="Photo A">
                {task?.photoA?.src ? (
                  <img src={task.photoA.src} alt={task.photoA.alt || "Photo A"} />
                ) : (
                  <span className="muted">No image A</span>
                )}
              </div>
              <div className="imgwrap" aria-label="Photo B">
                {task?.photoB?.src ? (
                  <img src={task.photoB.src} alt={task.photoB.alt || "Photo B"} />
                ) : (
                  <span className="muted">No image B</span>
                )}
              </div>
            </div>
  
            <div className="qs">
              {overall !== "summary" ? (
                <div className="q">
                  <strong>{seg + 1}.</strong> {qText}
                </div>
              ) : (
                <div className="q"><strong>Great!</strong> You’ve completed all three questions.</div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );  
}

function formatTime(total){ const m = Math.floor(total/60); const s = total % 60; return `${m}:${String(s).padStart(2,"0")}`; }

/* ────────────────────────────────────────────────────────────────────────── */
function Summary({ recordings, taskId, onDownloadAll }) {
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
        <button className="btn primary" onClick={() => onDownloadAll(recordings, `aptis-part3-${taskId}.zip`)}>
          Download all (.zip)
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Tiny ZIP helper (store) — same as Part 2
   ────────────────────────────────────────────────────────────────────────── */
async function createZipAndDownload(files, zipName = "recordings.zip") {
  const enc = new TextEncoder();
  const parts = []; const central = []; let offset = 0;
  const u16 = n => { const b=new Uint8Array(2); new DataView(b.buffer).setUint16(0,n,true); return b; };
  const u32 = n => { const b=new Uint8Array(4); new DataView(b.buffer).setUint32(0,n,true); return b; };
  const concat = (arr)=>{ const len=arr.reduce((n,p)=>n+p.byteLength,0); const out=new Uint8Array(len); let pos=0; for(const p of arr){out.set(p,pos); pos+=p.byteLength;} return out; };
  const crcTable = (() => { const t=new Uint32Array(256); for(let i=0;i<256;i++){ let c=i; for(let k=0;k<8;k++) c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1); t[i]=c>>>0; } return t;})();
  const crc32 = (buf)=>{ let c=0^(-1); const v=new Uint8Array(buf); for(let i=0;i<v.length;i++) c=(c>>>8)^crcTable[(c^v[i])&0xFF]; return (c^(-1))>>>0; };

  for (const f of files) {
    const data = await f.blob.arrayBuffer();
    const nameB = enc.encode(f.name);
    const crc = crc32(data); const size = data.byteLength;

    const lfh = concat([u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(size), u32(size), u16(nameB.length), u16(0), nameB]);
    parts.push(lfh, new Uint8Array(data));
    const cdh = concat([u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(size), u32(size), u16(nameB.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), nameB]);
    central.push(cdh);
    offset += lfh.byteLength + size;
  }

  const centralBlob = concat(central);
  const eocd = concat([u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(centralBlob.byteLength), u32(offset), u16(0)]);
  const zip = concat([...parts, centralBlob, eocd]);
  const url = URL.createObjectURL(new Blob([zip], { type: "application/zip" }));
  const a = document.createElement("a"); a.href = url; a.download = zipName; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

/* ──────────────────────────────────────────────────────────────────────────
   ChipDropdown (disabled state for locked items)
   ────────────────────────────────────────────────────────────────────────── */
function ChipDropdown({ items, value, onChange, label = "Task" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e){ if (!ref.current) return; if (!ref.current.contains(e.target)) setOpen(false); }
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
        {value + 1}<span className="chip-caret" aria-hidden>▾</span>
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
                  disabled={isLocked}
                  className={`chip-option ${isActive ? "active" : ""} ${isLocked ? "locked" : ""}`}
                  onClick={() => { if (!isLocked) { onChange(i); setOpen(false); } }}
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
   Styles (aligned to your Speaking/Reading look; no image cropping)
   ────────────────────────────────────────────────────────────────────────── */
function StyleScope(){
  return (
    <style>{`
      .aptis-speaking3 { --panel:#13213b; --ink:#e6f0ff; --muted:#a9b7d1; }
      .aptis-speaking3 { color: var(--ink); }
      .aptis-speaking3 .header { display:flex; justify-content:space-between; align-items:flex-end; gap:1rem; margin-bottom:1rem; }
      .aptis-speaking3 .title { margin:0; font-size:1.4rem; }
      .aptis-speaking3 .intro { margin:.25rem 0 0; color: var(--muted); }

      .aptis-speaking3 .panes { display:grid; grid-template-columns:1fr; gap:1rem; }
      @media (min-width: 960px){ .aptis-speaking3 .panes { grid-template-columns: 1.2fr .8fr; } }

      .aptis-speaking3 .panel { background: var(--panel); border:1px solid #203258; border-radius:16px; padding:1rem; box-shadow: 0 6px 18px rgba(0,0,0,0.25);} 

      .aptis-speaking3 .twophotos { display:grid; gap:.5rem; grid-template-columns:1fr; }
      @media (min-width: 720px){ .aptis-speaking3 .twophotos { grid-template-columns:1fr 1fr; } }

      .aptis-speaking3 .imgwrap {
  width: 100%;
  border-radius: .75rem;
  overflow: hidden;
  background: #0f1b31;
  display: flex;
  align-items: center;
  justify-content: center;
}

.aptis-speaking3 .imgwrap img {
  max-width: 100%;
  max-height: min(75vh, 700px); /* ✅ bigger cap */
  width: auto;
  height: auto;
  object-fit: contain;
}

      .aptis-speaking3 .qs { display:grid; gap:.5rem; margin-top:.75rem; }
      .aptis-speaking3 .q { padding:.5rem .75rem; border-left:3px solid #3b517c; background:#0f1b31; border-radius:.4rem; }

      .aptis-speaking3 .meters { display:flex; gap:.5rem; align-items:center; flex-wrap:wrap; margin-bottom:.6rem; }
      .aptis-speaking3 .pill { padding:.25rem .6rem; border-radius:999px; border:1px solid #37598e; }

      .aptis-speaking3 .actions { display:flex; gap:.5rem; flex-wrap:wrap; }
      .aptis-speaking3 .btn { background:#24365d; border:1px solid #335086; color:#e6f0ff; padding:0.45rem .7rem; border-radius:10px; cursor:pointer; }
      .aptis-speaking3 .btn:hover { filter:brightness(1.05); }
      .aptis-speaking3 .btn.primary { background:#294b84; border-color:#3a6ebd; }

      /* chip dropdown */
      .aptis-speaking3 .chip-select { position: relative; display: inline-block; }
      .aptis-speaking3 .count-chip { min-width: 2.4rem; justify-content:center; display:inline-flex; align-items:center; gap:.35rem; background:#24365d; border:1px solid #335086; color:#e6f0ff; padding:.35rem .5rem; border-radius:999px; }
      .aptis-speaking3 .count-chip.selected { background:#294b84; border-color:#3a6ebd; }
      .aptis-speaking3 .chip-caret { font-size:.85em; opacity:.9; }
      .aptis-speaking3 .chip-menu { position:absolute; right:0; margin-top:.4rem; background:#132647; border:1px solid #2c4b83; border-radius:12px; padding:.35rem; list-style:none; min-width:16rem; max-height:50vh; overflow:auto; box-shadow:0 10px 24px rgba(0,0,0,.35); z-index:50; }
      .aptis-speaking3 .chip-option { width:100%; text-align:left; background:transparent; border:0; color:#e6f0ff; padding:.45rem .6rem; border-radius:10px; display:flex; gap:.5rem; align-items:baseline; cursor:pointer; }
      .aptis-speaking3 .chip-option:hover { background:#0f1b31; }
      .aptis-speaking3 .chip-option.active { background:#294b84; }
      .aptis-speaking3 .chip-option.locked { opacity:.5; cursor:not-allowed; }
      .aptis-speaking3 .chip-option .num { color:#cfe1ff; width:2.2rem; display:inline-block; }
      .aptis-speaking3 .chip-option .ttl { color:#e6f0ff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      
      /* Let these pages be wider than the default wrapper */
.game-wrapper.wide { 
  max-width: min(1280px, 96vw) !important;
}

/* Give more space to the photo pane on desktops */
@media (min-width: 1024px) {
  .aptis-speaking3 .panes { grid-template-columns: 2fr 1fr; }
  .aptis-speaking  .panes { grid-template-columns: 1.7fr 1fr; }
}

/* Bigger images, still no cropping */
.aptis-speaking3 .imgwrap img,
.aptis-speaking  .imgwrap img {
  max-width: 100%;
  max-height: min(85vh, 820px);
  width: auto;
  height: auto;
  object-fit: contain;
}

/* Stack controls on top, photos below (let photos use full wrapper width) */
.aptis-speaking3 .panes-vertical {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Two photos fill the row; 1 column on small screens, 2 columns on wider */
.aptis-speaking3 .twophotos.wide-row {
  display: grid;
  gap: .75rem;
  grid-template-columns: 1fr;
}
@media (min-width: 720px) {
  .aptis-speaking3 .twophotos.wide-row {
    grid-template-columns: 1fr 1fr;
  }
}

/* Bigger images, no cropping */
.aptis-speaking3 .imgwrap {
  width: 100%;
  border-radius: .75rem;
  overflow: hidden;
  background: #0f1b31;
  display: flex;
  align-items: center;
  justify-content: center;
}
.aptis-speaking3 .imgwrap img {
  max-width: 100%;
  max-height: min(80vh, 900px);
  width: auto;
  height: auto;
  object-fit: contain;
}


    `}</style>
  );
}

