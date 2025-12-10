import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "../../utils/toast";
import * as fb from "../../firebase"; // namespace import (works even if functions aren't exported by name)
import { loadSpeakingDone, markSpeakingDone } from "../../utils/speakingProgress";
import { PART1_QUESTIONS } from "./banks/part1";
import { getTtsUrl } from '../../api/speak';


/**
 * Speaking – Part 1 (Personal Questions)
 * Flow per question (×3):
 *  TTS (question) → Beep → Record (default 30s) → auto next → Summary
 *
 * Signed-in extra:
 *  • "New only" toggle picks unseen questions first (tracked per-user by id).
 *  • On finish, marks the 3 question ids as completed (namespace "part1").
 */

export default function SpeakingPart1({
  user,
  speakSeconds = 30,   // Aptis Part 1 typical speaking window
  autoBeepSeconds = 1.0
}) {
  const [newOnly, setNewOnly] = useState(!!user); // toggle enabled only if signed in
  const [phase, setPhase] = useState("ready");    // ready | running | summary
  const [seg, setSeg] = useState(0);              // 0..2
  const [sub, setSub] = useState("announce");     // announce | beep | speak | doneSeg
  const [left, setLeft] = useState(speakSeconds);
  const [recordings, setRecordings] = useState([]); // [ {blob,url,name}, ... ]
  const [micError, setMicError] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const ttsAudioRef = useRef(null);
  const ttsCacheRef = useRef(new Map()); // key: text|voice → url

  // 👇 add this new one here
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


  // -------- Bank + progress tracking --------
  const BANK = useMemo(() => PART1_QUESTIONS, []);
  const [completed, setCompleted] = useState(new Set()); // set of raw ids like "p1q001"
  useEffect(() => {
    let alive = true;
    (async () => {
    const done = await loadSpeakingDone("part1", fb, user);
    if (alive) setCompleted(done);
    })();
    return () => { alive = false; };
  }, [user]);

  // Pick 3 questions
  const [chosen, setChosen] = useState([]);
  useEffect(() => {
    if (phase !== "ready") return;
    setChosen(pickThree(BANK, completed, newOnly));
  }, [phase, completed, newOnly, BANK]);

  async function startTask() {
    await ensureAudioContext();              // <— unlock on user click
    setPhase("running");
    setSeg(0); setSub("announce");
    setLeft(speakSeconds);
    setRecordings([]);
    setMicError("");
    stopRecording(true); cancelTTS();
  }
  

  // Countdown for speaking
  useEffect(() => {
    if (phase !== "running" || sub !== "speak") return;
    const id = setInterval(() => setLeft(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [phase, sub]);

  useEffect(() => {
    if (phase === "running" && sub === "speak" && left === 0) finishSegment();
  }, [phase, sub, left]);

  useEffect(() => () => {
    try {
      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== "inactive") mr.stop();
    } catch {}
  }, []);

  // announce → beep → speak (per segment)
  useEffect(() => {
    if (phase !== "running") return;
    if (sub === "announce") {
      (async () => {
        const q = chosen[seg]?.text || "";
        await speakTTS(q);
        setSub("beep");
      })();
    }
    if (sub === "beep") {
      (async () => {
        await playBeep(600, autoBeepSeconds);
        await startSegment();
      })();
    }
  }, [phase, sub, seg, chosen, autoBeepSeconds]);

  async function startSegment() {
    setLeft(speakSeconds);
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
      setSub("announce");
      setLeft(speakSeconds);
    } else {
      setPhase("summary");
      markCompleted();  // store progress
      cancelTTS();
    }
  }

  // -------- Recording helpers --------
  async function startRecording() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMicError("Recording not supported."); return;
      }
      if (typeof MediaRecorder === 'undefined') {
        setMicError("MediaRecorder not available in this browser."); return;
      }
  
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
      const mime = pickRecordingMime();
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
  
      mr.ondataavailable = (e) => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
  
      mr.onstop = () => {
        const finalMime = mr.mimeType || mime || 'audio/mp4';
        const blob = new Blob(chunksRef.current, { type: finalMime });
        const ext = extForMime(finalMime);
        const name = `part1-q${seg + 1}-${chosen[seg]?.id}.${ext}`;
        const url = URL.createObjectURL(blob);
  
        setRecordings(prev => {
          const next = [...prev];
          next[seg] = { blob, url, name, mime: finalMime };
          return next;
        });
  
        stream.getTracks().forEach(t => t.stop());
      };
  
      mr.start();
    } catch (err) {
      console.error(err);
      setMicError("Microphone access failed. You can still practise timings.");
    }
  }

  function stopRecording(silent = false) {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      try { mr.stop(); } catch {}
    }
    if (!silent) { /* no-op UI flag for Part 1 */ }
  }
  
  

  // -------- Persistence for “new only” --------
  async function markCompleted() {
    const ids = chosen.map(q => q.id); // raw ids
    try {
      const updated = await markSpeakingDone("part1", ids, fb, user);
      if (updated) setCompleted(updated);
      toast?.("Marked these questions as completed ✓");
    } catch {}

    // Log activity: one Part 1 speaking session (3 short questions)
    try {
      if (user && fb.logSpeakingTaskCompleted) {
        await fb.logSpeakingTaskCompleted({
          part: "part1",
          taskId: null,          // randomised trio, no fixed "task"
          questionIds: ids,
          questionCount: ids.length,
        });
      }
    } catch (e) {
      console.warn("[Activity] speaking part1 log failed", e);
    }
  }


  // -------- TTS + Beep --------
  function cancelTTS(){
    try { window.speechSynthesis?.cancel(); } catch {}
    try {
      const a = ttsAudioRef.current;
      if (a) { a.pause(); a.removeAttribute('src'); a.load(); }
    } catch {}
  }
  async function speakTTS(text) {
    const voice = 'en-GB-Neural2-C';   // default voice (change if you like)
    const key = `${voice}::${text}`;
  
    try {
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
  
      // play() is allowed because your flow starts from a user click (Start)
      await a.play();
  
      // Wait until the audio finishes
      await new Promise((res) => {
        const onEnd = () => { a.removeEventListener('ended', onEnd); res(); };
        a.addEventListener('ended', onEnd);
      });
    } catch (e) {
      console.warn('[TTS] cloud failed, falling back to speechSynthesis', e);
      // Fallback to browser voice so the flow continues
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
  function playBeep(freq = 600, seconds = 1.0){
    return new Promise(async (resolve) => {
      try{
        const C = await ensureAudioContext();
        const o = C.createOscillator();
        const g = C.createGain();
        o.type = "sine";
        o.frequency.value = freq;
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
    if (mime.includes('mp4')) return 'm4a'; // Safari typically gives .m4a
    if (mime.includes('webm')) return 'webm';
    return 'm4a';
  }
  

  // -------- Keyboard helpers --------
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === " ") {
        if (phase === "ready") { e.preventDefault(); startTask(); }
        else if (phase === "running" && sub === "speak") { e.preventDefault(); finishSegment(); }
        else if (phase === "running" && sub === "doneSeg") { e.preventDefault(); nextStep(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, sub, seg, chosen]);

  const q = chosen[seg];

  function restartNewSet(){
    // Fully reset state and pick a new trio (effect will repick on phase 'ready')
    setPhase("ready");
    setSeg(0); setSub("announce");
    setLeft(speakSeconds);
    setRecordings([]);
    setMicError("");
    stopRecording(true);
    cancelTTS();
    // If you prefer to immediately launch the next run:
  }

  return (
    <div className="aptis-speaking1 game-wrapper">
      <StyleScope />

      <header className="header">
        <div>
          <h2 className="title">Speaking – Part 1 (Personal Questions)</h2>
          <p className="intro">
            You will answer three short personal questions. For each question we will read it aloud,
            play a beep, and then record your answer for {speakSeconds}s.
          </p>
        </div>
        {/* header right side */}
<div className="picker" style={{ display:"flex", alignItems:"center" }}>
  <button
    type="button"
    className={`toggle-btn ${newOnly ? "selected" : ""} ${(!user || phase !== "ready") ? "disabled" : ""}`}
    aria-pressed={newOnly}
    disabled={!user || phase !== "ready"}
    title={!user ? "Sign in to enable 'New questions only'" : (phase !== "ready" ? "Finish or reset to change" : "Only unseen questions")}
    onClick={() => setNewOnly(v => !v)}
  >
    New questions only
  </button>
</div>
      </header>

      <section className="panel">
      <audio ref={ttsAudioRef} preload="none" style={{ display: 'none' }} />
        {/* Status row */}
        <div className="meters">
          <span className="pill">
            {phase === "ready"   && "Ready"}
            {phase === "running" && `Question ${seg + 1} / 3`}
            {phase === "summary" && "Complete"}
          </span>
          {phase === "running" && (
            <span className="pill" aria-live="polite">
              {sub === "announce" && "Playing question…"}
              {sub === "beep" && "Beep…"}
              {sub === "speak" && `Speaking: ${formatTime(left)}`}
              {sub === "doneSeg" && "Recorded"}
            </span>
          )}
        </div>

        {/* Body */}
        {phase === "ready" && (
          <div className="intro-panel" style={{ textAlign:"center", padding:"1rem" }}>
            <p className="muted">Press <strong>Start</strong> to get your first question.</p>
            <button className="btn primary" onClick={startTask}>Start</button>
          </div>
        )}

        {phase === "running" && (
          <>
            <div className="qs">
              {sub !== "doneSeg" ? (
                <div className="q"><strong>{seg + 1}.</strong> {q?.text}</div>
              ) : (
                <div className="q"><strong>Recorded.</strong> Review or continue.</div>
              )}
            </div>

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
                      setLeft(speakSeconds);
                      setRecordings(prev => { const next = [...prev]; next[seg] = undefined; return next; });
                      setSub("announce");
                    }}
                  >
                    Try again
                  </button>
                  <button className="btn primary" onClick={nextStep}>
                    {seg < 2 ? "Next question" : "Finish"}
                  </button>
                </>
              )}
            </div>
            {micError && <p className="muted" role="alert" style={{ marginTop: ".5rem" }}>{micError}</p>}
          </>
        )}

{phase === "summary" && (
  <Summary
    recordings={recordings}
    onDownloadAll={() => createZipAndDownload(recordings, "aptis-part1.zip")}
    onRestart={() => restartNewSet()}            // single restart
  />
)}
      </section>
    </div>
  );
}

/* ---------- Styles ---------- */
function StyleScope(){
  return (
    <style>{`
      .aptis-speaking1 { --panel:#13213b; --ink:#e6f0ff; --muted:#a9b7d1; }
      .aptis-speaking1 { color: var(--ink); }
      .aptis-speaking1 .header { display:flex; justify-content:space-between; align-items:flex-end; gap:1rem; margin-bottom:1rem; }
      .aptis-speaking1 .title { margin:0; font-size:1.4rem; }
      .aptis-speaking1 .intro { margin:.25rem 0 0; color: var(--muted); }
      .aptis-speaking1 .panel { background:#13213b; border:1px solid #203258; border-radius:16px; padding:1rem; box-shadow:0 6px 18px rgba(0,0,0,.25);} 
      .aptis-speaking1 .meters { display:flex; gap:.5rem; align-items:center; flex-wrap:wrap; margin-bottom:.6rem; }
      .aptis-speaking1 .pill { padding:.25rem .6rem; border-radius:999px; border:1px solid #37598e; }
      .aptis-speaking1 .pill.disabled { opacity:.55; }
      .aptis-speaking1 .btn { background:#24365d; border:1px solid #335086; color:#e6f0ff; padding:0.45rem .7rem; border-radius:10px; cursor:pointer; }
      .aptis-speaking1 .btn:hover { filter:brightness(1.05); }
      .aptis-speaking1 .btn.primary { background:#294b84; border-color:#3a6ebd; }
      .aptis-speaking1 .q { background:#0f1b31; border:1px solid #203258; border-radius:10px; padding:.6rem .75rem; }
      .aptis-speaking1 .muted { color: var(--muted); }
      .aptis-speaking1 .actions { margin-top:.6rem; display:flex; gap:.5rem; flex-wrap:wrap; }
      /* Toggle button pill */
.aptis-speaking1 .toggle-btn{
  background:#24365d; border:1px solid #335086; color:#e6f0ff;
  padding:.4rem .75rem; border-radius:999px; cursor:pointer;
  transition: filter .08s ease, background .08s ease, border-color .08s ease;
}
.aptis-speaking1 .toggle-btn:hover{ filter:brightness(1.05); }
.aptis-speaking1 .toggle-btn.selected{
  background:#294b84; border-color:#3a6ebd; box-shadow:0 0 0 2px rgba(58,110,189,.25) inset;
}
.aptis-speaking1 .toggle-btn.disabled{
  opacity:.55; cursor:not-allowed;
}
    `}</style>
  );
}

/* ---------- Summary + ZIP ---------- */
function Summary({ recordings, onDownloadAll, onRestart }) {
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
          <button className="btn primary" onClick={onDownloadAll}>Download all (.zip)</button>
          <button className="btn" onClick={onRestart}>Start another set</button>
        </div>
      </div>
    );
  }

/* Minimal ZIP (store) – same helper used elsewhere */
async function createZipAndDownload(files, zipName="recordings.zip"){
  const enc = new TextEncoder(); const parts=[]; const central=[]; let offset=0;
  const u16=n=>{ const b=new Uint8Array(2); new DataView(b.buffer).setUint16(0,n,true); return b; };
  const u32=n=>{ const b=new Uint8Array(4); new DataView(b.buffer).setUint32(0,n,true); return b; };
  const concat=(arr)=>{ const len=arr.reduce((n,p)=>n+p.byteLength,0); const out=new Uint8Array(len); let pos=0; for(const p of arr){ out.set(p,pos); pos+=p.byteLength; } return out; };
  const crcTable=(()=>{ const t=new Uint32Array(256); for(let i=0;i<256;i++){ let c=i; for(let k=0;k<8;k++) c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1); t[i]=c>>>0; } return t;})();
  const crc32=(buf)=>{ let c=0^(-1), v=new Uint8Array(buf); for(let i=0;i<v.length;i++) c=(c>>>8)^crcTable[(c^v[i])&0xFF]; return (c^(-1))>>>0; };

  for(const f of files){
    const data=await f.blob.arrayBuffer(); const nameB=enc.encode(f.name);
    const crc=crc32(data); const size=data.byteLength;
    const lfh=concat([u32(0x04034b50),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(size),u32(size),u16(nameB.length),u16(0),nameB]);
    parts.push(lfh,new Uint8Array(data));
    const cdh=concat([u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(size),u32(size),u16(nameB.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),nameB]);
    central.push(cdh); offset+=lfh.byteLength+size;
  }
  const centralBlob=concat(central);
  const eocd=concat([u32(0x06054b50),u16(0),u16(0),u16(files.length),u16(files.length),u32(centralBlob.byteLength),u32(offset),u16(0)]);
  const zip=concat([...parts,centralBlob,eocd]);
  const url=URL.createObjectURL(new Blob([zip],{type:"application/zip"}));
  const a=document.createElement("a"); a.href=url; a.download=zipName; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

/* ---------- Question bank (deduped & id'd) ---------- */
const RAW_BANK = [
  "Who do you usually spend your weekends with?",
  "Tell me about your best friend",
  "What's your favourite city?",
  "What’s the food like in your country?",
  "Describe your home",
  "Tell me about your favourite book",
  "What’s the weather like today?",
  "Tell me about your family",
  "What do you like doing in your free time?",
  "Tell me about your last holiday",
  "What did you do last night?",
  "What’s your typical day like?",
  "Tell me about your town",
  "Describe the room you are in now",
  "What do you like doing at the weekend?",
  "Tell me about your work or studies",
  "What was your favourite toy as a child?",
  "What are you wearing today?",
  "Tell me about your favourite film",
  "Tell me about your favourite animal",
  "What is your favourite item of clothing?",
  "What is your favourite time of the year?",
  "Tell me about your favourite food",
  "What’s your favourite subject at school (or what was it)?",
  "What’s the most interesting place you have visited?",
  "Do you prefer mornings or evenings? Why?",
  "What’s your favourite type of music?",
  "Tell me about a tradition in your country.",
  "Do you prefer summer or winter holidays? Why?",
  "What are you wearing today?",
  "Tell me about your favourite film",
  "Tell me about your favourite animal",
  "What is your favourite item of clothing?",
  "What is your favourite time of the year?",
  "Where did you last go on holiday?",
  "What do you like about your neighbourhood?"
];

// dedupe and tag with ids
const DEDUP_BANK = Array.from(new Set(RAW_BANK)).map((text, i) => ({
  id: `p1q${String(i + 1).padStart(3, "0")}`,
  text
}));

/* ---------- helpers ---------- */
function formatTime(t){ const m=Math.floor(t/60), s=t%60; return `${m}:${String(s).padStart(2,"0")}`; }

function pickThree(bank, completedSet, newOnly){
  const isDone = (q) => completedSet.has(q.id);
  const unseen = bank.filter(q => !isDone(q));
  const pool = newOnly && unseen.length >= 3 ? unseen : bank.slice();
  shuffleInPlace(pool);
  return pool.slice(0, 3);
}
function shuffleInPlace(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } }
