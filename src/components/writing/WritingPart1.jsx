// src/components/writing/WritingPart1.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as fb from "../../firebase";
import { toast } from "../../utils/toast";

/* =========================================================================
   CONFIG
   ========================================================================= */
const QUESTIONS_PER_RUN = 5;
const LS_HISTORY_KEY = "aptis_writing_p1_history_v1";

/** Question bank */
const WRITING_P1_BANK = [
  "What do you do?",
  "What did you do yesterday?",
  "What’s your favourite colour?",
  "What’s the weather like today?",
  "How do you get to work?",
  "Where do you usually eat lunch?",
  "What time do you get up on weekdays?",
  "What type of films do you like watching?",
  "What’s your favourite type of music?",
  "How often do you exercise?",
  "Who do you spend the weekend with?",
  "What’s your favourite food?",
  "What do you do in your free time?",
  "Who do you live with?",
  "Where do you live?",
  "What’s your favourite animal?",
  "What’s your favourite TV show?",
  "What’s your dream job?",
  "What’s your favourite place in your city?",
  "What dishes do you like to cook?",
  "Who is your best friend?",
  "What’s/was your favourite subject at school?",
  "How often do you use your phone?",
  "What kind of clothes do you like?",
  "What’s your favourite time of year?",
  "What do you usually do on holidays?",
  "What’s your favourite sport?",
  "How do you usually spend your evenings?",
  "What kind of movies do you like?",
  "What are you doing this weekend?",
  "Where would you like to travel?",
  "What languages do you speak?",
  "What do you usually have for breakfast?",
  "What’s your favourite app?",
  "What hobbies do you have?",
  "How do you relax after work?"
];

/* =========================================================================
   HELPERS
   ========================================================================= */
const strId = (s) => "q_" + [...s].reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);

function loadHistory() {
  try { return new Set(JSON.parse(localStorage.getItem(LS_HISTORY_KEY) || "[]")); }
  catch { return new Set(); }
}

function saveHistory(setLike) {
  try {
    const arr = Array.isArray(setLike) ? setLike : [...setLike];
    localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(arr));
  } catch {}
}

function pickRandomQuestions(bank, historySet, count = QUESTIONS_PER_RUN) {
  const withIds = bank.map((q) => ({ id: strId(q), text: q }));
  const unseen = withIds.filter((q) => !historySet.has(q.id));
  const pool = unseen.length >= count ? unseen : withIds;
  const shuffled = pool.slice().sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/* =========================================================================
   COMPONENT
   ========================================================================= */
export default function WritingPart1({ user }) {
  const [history, setHistory] = useState(() => loadHistory());
  const [sessionQs, setSessionQs] = useState(() => pickRandomQuestions(WRITING_P1_BANK, history));
  const [answers, setAnswers] = useState(() => Array(sessionQs.length).fill(""));
  const [phase, setPhase] = useState("ready"); // ready | typing | summary

  // Refs for sequential focusing
  const inputRefs = useRef([]);

  useEffect(() => {
    setAnswers((prev) => {
      const next = Array(sessionQs.length).fill("");
      for (let i = 0; i < Math.min(prev.length, next.length); i++) next[i] = prev[i] ?? "";
      return next;
    });
    inputRefs.current = [];
  }, [sessionQs.length]);

  function start() {
    setPhase("typing");
    setTimeout(() => {
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    }, 100);
  }

  function handleChange(i, value) {
    setAnswers((prev) => {
      const next = prev.slice();
      next[i] = value;
      return next;
    });
  }

  function handleKeyDown(e, i) {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextInput = inputRefs.current[i + 1];
      if (nextInput) {
        nextInput.focus();
      } else {
        // Last question → submit automatically
        handleSubmit();
      }
    }
  }

  async function handleSubmit() {
    const allFilled = answers.every((a) => (a || "").trim().length > 0);
    if (!allFilled) {
      toast("Please answer all five questions before submitting.");
      return;
    }

    const updated = new Set(history);
    sessionQs.forEach((q) => updated.add(q.id));
    setHistory(updated);
    saveHistory(updated);

    // Save to Firestore (if signed in)
if (user && fb?.saveWritingP1Submission) {
    try {
      const items = sessionQs.map((q, i) => ({
        id: q.id,
        question: q.text,
        answer: (answers[i] || "").trim(),
      }));
      await fb.saveWritingP1Submission({ items });
    } catch (err) {
      console.error("[WritingP1] saveWritingP1Submission failed", err);
      // keep UX happy even if cloud save fails
    }
  }

    setPhase("summary");
    toast("Session saved ✓");
  }


  function newSet() {
    const h = loadHistory();
    const qs = pickRandomQuestions(WRITING_P1_BANK, h);
    setSessionQs(qs);
    setAnswers(Array(qs.length).fill(""));
    setPhase("ready");
  }

  const completedCount = useMemo(() => history.size, [history]);

  return (
    <div className="aptis-writing-p1">
      <StyleScope />
      <header className="header">
        <div>
          <h2 className="title">Writing – Part 1 (Word-level responses)</h2>
          <p className="intro">
            Write short answers of 1–5 words. You’ll receive 5 random personal questions once you start.  
            Completed so far: {completedCount}.
          </p>
        </div>
        <div className="actions">
          <button className="btn" onClick={newSet}>New random set</button>
        </div>
      </header>

      <div className="grid">
        <section className="panel">
          {phase === "ready" && (
            <div className="intro-panel" style={{ textAlign: "center", padding: "1.5rem 0" }}>
              <p className="muted">Press <strong>Start</strong> to begin this short task.</p>
              <button className="btn primary" onClick={start}>Start</button>
            </div>
          )}

          {phase === "typing" && (
            <form
              className="qform"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              {sessionQs.map((q, i) => (
                <div className="qrow" key={q.id}>
                  <label className="qlabel">
                    <span className="num">{i + 1}.</span> {q.text}
                  </label>
                  <input
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    className="input"
                    placeholder="1–5 words…"
                    value={answers[i] || ""}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, i)}  // 👈 added key navigation
                  />
                </div>
              ))}

              <div className="actions" style={{ marginTop: ".5rem" }}>
                <button type="submit" className="btn primary">Submit</button>
                <button type="button" className="btn" onClick={newSet}>Restart</button>
              </div>
            </form>
          )}

          {phase === "summary" && (
            <>
              <h3 style={{ marginTop: 0 }}>Summary</h3>
              <ol className="list">
                {sessionQs.map((q, i) => (
                  <li key={q.id}>
                    <div className="p">{q.text}</div>
                    <div className="ans">{(answers[i] || "").trim() || <em>(no answer)</em>}</div>
                  </li>
                ))}
              </ol>
            </>
          )}
        </section>

        <section className="panel">
          <div className="meters">
            <span className="pill">
              {phase === "ready" && "Ready"}
              {phase === "typing" && "Answer all five questions"}
              {phase === "summary" && "Complete"}
            </span>
          </div>

          {phase === "summary" && (
            <div className="actions">
              <button className="btn" onClick={newSet}>Try another 5</button>
              <button
  className="btn"
  onClick={() => {
    const textToCopy = sessionQs
      .map(
        (q, i) =>
          `${i + 1}. ${q.text} — ${answers[i] ? answers[i].trim() : "(no answer)"}`
      )
      .join("\n");
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => toast("Copied questions + answers ✓"));
  }}
>
  Copy answers
</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* =========================================================================
   STYLES
   ========================================================================= */
function StyleScope() {
  return (
    <style>{`
      .aptis-writing-p1 { --panel:#13213b; --ink:#e6f0ff; --muted:#a9b7d1; }
      .aptis-writing-p1 .title{margin:0;font-size:1.35rem;color:var(--ink)}
      .aptis-writing-p1 .intro{margin:.25rem 0 0;color:var(--muted)}
      .grid{display:grid;grid-template-columns:1fr;gap:1rem}
      @media(min-width:960px){.grid{grid-template-columns:1.2fr .8fr}}
      .panel{background:var(--panel);border:1px solid #203258;border-radius:16px;padding:1rem;box-shadow:0 6px 18px rgba(0,0,0,.25)}
      .pill{padding:.25rem .6rem;border-radius:999px;border:1px solid #37598e}
      .actions{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.6rem;justify-content:center}
      .btn{background:#24365d;border:1px solid #335086;color:var(--ink);padding:.45rem .7rem;border-radius:10px;cursor:pointer}
      .btn.primary{background:#294b84;border-color:#3a6ebd}
      .muted{color:var(--muted)}
      .qform{display:grid;gap:.75rem}
      .qlabel{display:block;margin-bottom:.25rem;color:#e6f0ff}
      .num{display:inline-block;width:1.5rem;color:#cfe1ff}
      .input{width:100%;background:#0f1b31;border:1px solid #335086;color:var(--ink);border-radius:10px;padding:.55rem .65rem;outline:none}
      .input:focus{border-color:#4a79d8}
      .list{display:grid;gap:.5rem;padding:0;margin:0}
      .list li{list-style:none;background:#0f1b31;border:1px solid #2c416f;border-radius:.5rem;padding:.6rem}
      .list .p{color:#cfe1ff;margin-bottom:.3rem}
      .list .ans{color:#e6f0ff}
    `}</style>
  );
}
