// src/components/speaking/SpeakingPart2.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "../../utils/toast";
import * as fb from "../../firebase";
import { loadSpeakingDone, markSpeakingDone } from "../../utils/speakingProgress";

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

export default function SpeakingPart2({ tasks = DEMO_TASKS, user, onRequireSignIn }) {
  const items = tasks;

  // Picker / current task
  const [taskIndex, setTaskIndex] = useState(0);
  const current = items[taskIndex] || items[0];

  // Completions
  const [completed, setCompleted] = useState(new Set());
  useEffect(() => {
    let alive = true;
    (async () => {
      const done = await loadSpeakingDone("part2", fb, user);
      if (alive) setCompleted(done);
    })();
    return () => { alive = false; };
  }, [user]);

  function handleSelectTask(nextIndex) {
    // If guest, ignore clicks on locked items (index >= 2)
    if ((!user && nextIndex >= 2)) {
      // optional: toast("Sign in to unlock more tasks");
      return; // do nothing (no redirect)
    }
    setTaskIndex(nextIndex);
  }

  const decorated = useMemo(
    () =>
      items.map((t, i) => {
        const locked = !user && i >= 2; // lock tasks 3+ unless signed in
        const done = completed.has(t.id);
        const title =
          `${i + 1}. ${t.title}` +
          (done ? " ✓" : "") +
          (locked ? " 🔒" : "");
        return { ...t, locked, title };
      }),
    [items, completed, user]
  );

  return (
    <div className="aptis-speaking game-wrapper">
      <StyleScope />

      {/* Header + picker */}
      <header className="header">
        <div>
          <h2 className="title">Speaking – Part 2 (Describe a Photograph)</h2>
          <p className="intro">
            Click <strong>Start task</strong>. Each question is read aloud, then a beep plays and your
            <strong> 45-second</strong> recording begins. Q1 is always <em>“Describe the photograph.”</em>
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

      <SpeakingAutoFlow
        task={current}
        onFinished={async () => {
          const updated = await markSpeakingDone("part2", [current.id], fb, user);
          if (updated) setCompleted(updated);
          toast("Task marked as completed ✓");
        }}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Auto Flow: Start → (TTS → Beep → Record)x3 → Summary
   ────────────────────────────────────────────────────────────────────────── */
function SpeakingAutoFlow({ task, onFinished }) {
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
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Reset when task changes
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

  function startTask() {
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

  // MediaRecorder
  async function startRecording() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMicError("Recording not supported in this browser.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];

      mr.ondataavailable = (e) => { if (e.data?.size) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const name = `task-${task?.id || "task"}-q${seg + 1}.webm`;
        setRecordings(prev => {
          const next = [...prev];
          next[seg] = { blob, url, name };
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
  }
  function speakTTS(text) {
    return new Promise((resolve) => {
      try {
        const synth = window.speechSynthesis;
        if (!synth) return resolve(undefined);
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "en-GB";   // ✅ force English
        u.rate = 1; u.pitch = 1; u.volume = 1;
        u.onend = () => resolve(undefined);
        u.onerror = () => resolve(undefined);
        synth.cancel(); // stop any previous
        synth.speak(u);
      } catch {
        resolve(undefined);
      }
    });
  }

  // Beep helper (Web Audio API)
  function playBeep(freq = 600, seconds = 0.2) {
    return new Promise((resolve) => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = freq;
        o.connect(g);
        g.connect(ctx.destination);
        g.gain.setValueAtTime(0.001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
        o.start();
        const tEnd = ctx.currentTime + seconds;
        g.gain.exponentialRampToValueAtTime(0.0001, tEnd);
        o.stop(tEnd + 0.01);
        o.onended = () => { ctx.close?.(); resolve(undefined); };
      } catch {
        resolve(undefined);
      }
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
                <audio controls src={recordings[seg]?.url} />
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
            onDownloadAll={createZipAndDownload}
          />
        )}

        {micError && <p className="muted" role="alert" style={{ marginTop: ".5rem" }}>{micError}</p>}
      </section>
    </div>
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
function Summary({ recordings, taskId, onDownloadAll }) {
  return (
    <div className="summary">
      <h3 style={{ marginTop: 0 }}>Recordings</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: ".5rem" }}>
        {recordings.map((r, i) => (
          <li key={i} style={{ display: "flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap" }}>
            <span className="pill">Q{i + 1}</span>
            <audio controls src={r?.url} />
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
      </div>
    </div>
  );
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
    `}</style>
  );
}

// ─── Speaking Part 2 — Your five new tasks ─────────────────────────────────
const DEMO_TASKS = [
  {
    id: "train-station",
    title: "At the Train Station",
    image: "/images/speaking/train-platform.png",
    alt:
      "A group of travellers are standing on a busy platform. Some are carrying backpacks, others are checking the timetable.",
    questions: [
      "Tell me about a time you travelled by train.",
      "Do you think travelling by train is better than travelling by car? Why?"
    ]
  },
  {
    id: "football-park",
    title: "Playing Football in the Park",
    image: "/images/speaking/football-park.png",
    alt:
      "Several children are kicking a football around on the grass while their parents watch from a bench.",
    questions: [
      "Tell me about a sport you enjoyed playing as a child.",
      "Do you think children should spend more time outdoors? Why or why not?"
    ]
  },
  {
    id: "library",
    title: "In the Library",
    image: "/images/speaking/library-laptops.png",
    alt:
      "Two students are sitting at a large wooden table with open books and laptops. Shelves full of books can be seen in the background.",
    questions: [
      "Tell me about a time you studied in a library.",
      "Do you think libraries are still important in the digital age?"
    ]
  },
  {
    id: "market",
    title: "At the Market",
    image: "/images/speaking/street-market.png",
    alt:
      "A woman is choosing fruit at an outdoor market stall, while the vendor smiles and holds a bag. Other shoppers walk past in the background.",
    questions: [
      "Tell me about a time you went shopping in a market.",
      "Do you think local markets are better than supermarkets?"
    ]
  },
  {
    id: "home-working",
    title: "Working from Home",
    image: "/images/speaking/home-working.png",
    alt:
      "A young man is sitting at a desk in front of a laptop. He has headphones on and a cup of coffee beside him.",
    questions: [
      "Tell me about a time you worked or studied from home.",
      "Do you think working from home will become more common in the future?"
    ]
  }
];
