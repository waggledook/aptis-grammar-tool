// src/reading/AptisPart3Matching.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  fetchReadingCompletionsByPart,
  logReadingPart3Attempted,
  logReadingPart3Completed,
} from "../firebase";
import { toast } from "../utils/toast";
import { getSitePath } from "../siteConfig.js";
import ReadingAssignButton from "./ReadingAssignButton.jsx";
import { READING_PART3_TASKS } from "./part3Tasks.js";
import {
  ReadingTaskStart,
  ReadingTaskTimer,
} from "./ReadingTaskTimer.jsx";
import { getReadingTimingDetails, READING_SUGGESTED_SECONDS, useSuggestedTaskTimer } from "./readingTaskTiming.js";

function ChipDropdown({ items, value, onChange, label = "Task" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleDocumentClick(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }

    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  const active = items[value];

  return (
    <div className="chip-select" ref={ref}>
      <button
        type="button"
        className={`count-chip ${open ? "selected" : ""}`}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="lbl">{label}</span>
        <span className="val">{active?.title ?? "—"}</span>
        <span className="chev" aria-hidden="true">
          ▾
        </span>
      </button>

      {open ? (
        <ul className="chip-menu" role="listbox">
          {items.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                role="option"
                aria-selected={index === value}
                className={`chip-option ${index === value ? "active" : ""}`}
                onClick={() => {
                  onChange(index);
                  setOpen(false);
                }}
                title={item.title}
              >
                <strong className="num">{index + 1}.</strong>
                <span className="ttl">{item.title}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

// ---------- Component ----------
export default function AptisPart3Matching({ tasks = READING_PART3_TASKS, user }) {
  const initialTaskId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("task") : "";
  const initialTaskIndex = Math.max(0, tasks.findIndex((task) => task.id === initialTaskId));
  const [taskIndex, setTaskIndex] = useState(initialTaskIndex);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [resultMode, setResultMode] = useState(null);
  const [completed, setCompleted] = useState(new Set());
  const [whyOpen, setWhyOpen] = useState(null);
  const taskTimer = useSuggestedTaskTimer(READING_SUGGESTED_SECONDS.part3);
  const commentRefs = useRef({});
  const current = tasks[taskIndex] || tasks[0];

  

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user) return setCompleted(new Set());
      const done = await fetchReadingCompletionsByPart("part3");
      if (alive) setCompleted(done);
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  // 🔹 NEW SCROLL EFFECT — paste here
useEffect(() => {
    if (!whyOpen) return;
  
    // which question is open?
    const q = current.questions.find((qq) => qq.id === whyOpen);
    if (!q) return;
  
    const who = q.answer; // e.g. "Leo"
    const node = commentRefs.current[who]?.current;
    if (node) {
      node.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [whyOpen, current]);

  const names = useMemo(() => current.comments.map((c) => c.name), [current]);

  const decoratedItems = useMemo(
    () =>
      tasks.map((task) => ({
        ...task,
        title: `${task.title}${completed.has(task.id) ? " ✓" : ""}`,
      })),
    [completed, tasks]
  );

  function handleSelectTask(nextIndex) {
    setTaskIndex(nextIndex);
    setAnswers({});
    setFeedback({});
    setResultMode(null);
    setWhyOpen(null);
    commentRefs.current = {};
    taskTimer.reset();
  }

  function handleChange(qid, val) {
    setAnswers((p) => ({ ...p, [qid]: val }));
    setFeedback((p) => ({ ...p, [qid]: null }));
    setResultMode((currentMode) => currentMode === "revealed" ? "checked" : currentMode);
    // if they change an answer, hide any open explanation for that question
    if (whyOpen === qid) setWhyOpen(null);
  }

  async function markCurrentTaskCompleted() {
    if (!user || completed.has(current.id)) return;

    try {
      await logReadingPart3Completed({ taskId: current.id, source: "AptisPart3" });
      setCompleted((p) => new Set(p).add(current.id));
      toast("Task marked as completed ✓");
    } catch (err) {
      console.warn("[reading p3] completion save failed:", err);
      toast("We couldn’t save this completion.");
    }
  }

  async function handleCheck() {
    const timingDetails = getReadingTimingDetails(taskTimer, "checked");
    const fb = {};
    current.questions.forEach((q) => {
      const given = answers[q.id];
      fb[q.id] = given ? given === q.answer : null;
    });
    setFeedback(fb);
    setResultMode("checked");
  
    const total = current.questions.length;
    const score = current.questions.reduce(
      (acc, q) => acc + (fb[q.id] === true ? 1 : 0),
      0
    );
    const allCorrect = score === total;
  
    // ✅ Log an attempt whenever the user clicks "Check"
    if (user) {
      await logReadingPart3Attempted({
        taskId: current.id,
        score,
        total,
        source: "AptisPart3",
        ...timingDetails,
      });
    }
  
    // ✅ Only mark as completed if perfect score, and only once
    if (allCorrect) {
      await markCurrentTaskCompleted();
    }
  }

  async function handleShowAnswers() {
    const timingDetails = getReadingTimingDetails(taskTimer, "answers_revealed");
    const score = current.questions.reduce(
      (total, question) => total + (answers[question.id] === question.answer ? 1 : 0),
      0
    );
    const fb = {};
    const ans = {};
    current.questions.forEach((q) => {
      fb[q.id] = true;
      ans[q.id] = q.answer;
    });
    setAnswers(ans);
    setFeedback(fb);
    setResultMode("revealed");
    setWhyOpen(null); // close explanations so they can open them one by one

    if (user) {
      await logReadingPart3Attempted({
        taskId: current.id,
        score,
        total: current.questions.length,
        source: "AptisPart3",
        ...timingDetails,
      });
    }

    await markCurrentTaskCompleted();
  }

  function handleReset() {
    setAnswers({});
    setFeedback({});
    setResultMode(null);
    setWhyOpen(null);
    taskTimer.reset();
  }

 // helper: get highlighted version of a comment's text if it's the open explanation
 function renderCommentTextWithHighlight(commentName) {
    if (!whyOpen) return null;
  
    const q = current.questions.find((qq) => qq.id === whyOpen);
    if (!q) return null;
    if (q.answer !== commentName) return null;
  
    const fullText =
      current.comments.find((c) => c.name === commentName)?.text || "";
  
    // normalise to an array: ["part1", "part2", ...]
    const parts = Array.isArray(q.evidenceParts)
      ? q.evidenceParts
      : q.evidence
      ? [q.evidence]
      : [];
  
    if (parts.length === 0) {
      return <p>{fullText}</p>;
    }
  
    // We'll build a regex that matches any of the parts, case-insensitive.
    // We need to escape regex characters in the parts.
    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  
    const regex = new RegExp(
      "(" + parts.map(p => escapeRegex(p.trim())).join("|") + ")",
      "gi"
    );
  
    // Split the text on those matches, keeping the matches
    const segments = fullText.split(regex);
  
    return (
      <p>
        {segments.map((seg, i) => {
          // If this segment matches any part (case-insensitive), highlight it.
          const matchIndex = parts.findIndex(p =>
            seg.toLowerCase() === p.trim().toLowerCase()
          );
          if (matchIndex !== -1) {
            return (
              <mark key={i} className="evidence">
                {seg}
              </mark>
            );
          }
          return <React.Fragment key={i}>{seg}</React.Fragment>;
        })}
      </p>
    );
  }  

  return (
    <div className="aptis-matching game-wrapper">
      <StyleScope />
      <header className="header">
        <div>
          <h2 className="title">Reading – Part 3 (Matching Opinions)</h2>
          <p className="intro"><em>{current.title}</em></p>
        </div>
        <div className="header-tools">
          <ReadingAssignButton
            user={user}
            activityId="reading-part-3"
            activityLabel={`Aptis Reading Part 3 — ${current?.title || "Matching opinions"}`}
            routePath={getSitePath(`/reading/part3?task=${encodeURIComponent(current?.id || "")}`)}
            taskId={current?.id || ""}
            taskTitle={current?.title || ""}
          />
          <ChipDropdown
            items={decoratedItems}
            value={taskIndex}
            onChange={handleSelectTask}
            label="Task"
          />
        </div>
      </header>

      {taskTimer.phase === "ready" ? (
        <ReadingTaskStart
          partLabel="Aptis Reading Part 3"
          taskTitle={current.title}
          itemCountLabel="7 opinion matches"
          recommendedSeconds={taskTimer.recommendedSeconds}
          onStart={taskTimer.start}
        />
      ) : (
        <>
          <ReadingTaskTimer timer={taskTimer} />
          {/* ---------- Comments section ---------- */}
          <section className="comments">
  <h3>Comments</h3>

  {current.comments.map((c, i) => {
    const isActive =
      whyOpen &&
      current.questions.find((q) => q.id === whyOpen)?.answer === c.name;

    // ensure there's a ref for this name
    if (!commentRefs.current[c.name]) {
      commentRefs.current[c.name] = React.createRef();
    }

    return (
      <div
        key={i}
        ref={commentRefs.current[c.name]}
        className={`comment ${isActive ? "active-speaker" : ""}`}
      >
        <strong>{c.name}</strong>

        {isActive
          ? renderCommentTextWithHighlight(c.name)
          : <p>{c.text}</p>}
      </div>
    );
  })}
          </section>


      {/* ---------- Questions section ---------- */}
          <section className="questions-section">
        <h3>Questions</h3>

        {resultMode ? (() => {
          const correctCount = current.questions.filter((q) => feedback[q.id] === true).length;
          const incorrectCount = current.questions.filter((q) => feedback[q.id] === false).length;
          const unansweredCount = current.questions.filter((q) => !answers[q.id]).length;
          const recheckCount = current.questions.filter(
            (q) => answers[q.id] && feedback[q.id] == null
          ).length;

          return (
            <div className={`results-summary ${resultMode === "revealed" ? "is-revealed" : ""}`} role="status" aria-live="polite">
              <strong>
                {resultMode === "revealed"
                  ? "Answers shown"
                  : `Score: ${correctCount} / ${current.questions.length}`}
              </strong>
              <div className="results-counts">
                <span className="correct-count">✓ {correctCount} correct</span>
                {resultMode === "checked" ? (
                  <>
                    <span className="incorrect-count">✕ {incorrectCount} incorrect</span>
                    <span className="unanswered-count">! {unansweredCount} unanswered</span>
                    {recheckCount ? <span className="recheck-count">↻ {recheckCount} to recheck</span> : null}
                  </>
                ) : null}
              </div>
            </div>
          );
        })() : null}

        <ol className="questions">
          {current.questions.map((q) => {
            const fb = feedback[q.id];
            const isUnanswered = !!resultMode && !answers[q.id];
            const needsRecheck = !!resultMode && !!answers[q.id] && fb == null;
            const cls = fb === true
              ? "ok"
              : fb === false
                ? "bad"
                : isUnanswered
                  ? "unanswered"
                  : needsRecheck
                    ? "needs-recheck"
                    : "";

            const canExplain = fb !== null && fb !== undefined; // means they've hit Check (or Show answers)
            const isOpen = whyOpen === q.id;
            const status = fb === true
              ? { icon: "✓", label: resultMode === "revealed" ? "Correct answer" : "Correct" }
              : fb === false
                ? { icon: "✕", label: "Incorrect" }
                : isUnanswered
                  ? { icon: "!", label: "Not answered" }
                  : needsRecheck
                    ? { icon: "↻", label: "Check again" }
                    : null;

            return (
              <li key={q.id} className={cls}>
                <div className="q-row">
                  <span className="qtext">{q.text}</span>

                  <select
                    aria-label={`Answer question ${q.id}: ${q.text}`}
                    value={answers[q.id] || ""}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                  >
                    <option value="">—</option>
                    {names.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="why-btn"
                    disabled={!canExplain}
                    onClick={() => {
                      setWhyOpen((cur) => (cur === q.id ? null : q.id));
                    }}
                    title={canExplain ? "Show explanation" : "Check first"}
                  >
                    Why?
                  </button>

                  {status ? (
                    <span className="answer-status" role="status">
                      <span className="status-icon" aria-hidden="true">{status.icon}</span>
                      {status.label}
                    </span>
                  ) : null}
                </div>

                {isOpen && (
                  <div className="why-box">
                    <div className="why-answer">
                      <strong>Answer: {q.answer}</strong>
                    </div>
                    <div className="why-evidence">
  <span className="label">Evidence:</span>{" "}
  <em>
    {Array.isArray(q.evidenceParts)
      ? q.evidenceParts.join(" … ")
      : q.evidence}
  </em>
</div>
                    <div className="why-explain">
                      <span className="label">Explanation:</span>{" "}
                      {q.explanation}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        <div className="controls">
          <button className="btn" onClick={handleReset}>
            Reset
          </button>
          <button className="btn primary" onClick={handleCheck}>
            Check
          </button>
          <button className="btn ghost" onClick={handleShowAnswers}>
            Show answers
          </button>
        </div>
          </section>
        </>
      )}
    </div>
  );
}

// ---------- Styles ----------
function StyleScope() {
  return (
    <style>{`
        .aptis-matching {
          --bg:#0e1a2f;
          --panel:#13213b;
          --ink:#e6f0ff;
          --muted:#a9b7d1;
          --ok:#2fb67c;
          --bad:#e46c6c;
          --warning:#f1b84b;
          --accent:#6ea8ff;
          --evidence-bg:rgba(255,214,102,.2);
          --evidence-border:rgba(255,214,102,.6);
          color:var(--ink);
        }
  
        .aptis-matching .header {
          margin-bottom:1rem;
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
          gap:1rem;
        }
        .aptis-matching .title { margin:0; font-size:1.4rem; }
        .aptis-matching .intro { color:var(--muted); margin-top:.2rem; }
        .aptis-matching .header-tools {
          display:flex;
          align-items:center;
          justify-content:flex-end;
          gap:.6rem;
          flex-wrap:wrap;
        }

        /* TASK PICKER */
        .aptis-matching .chip-select { position:relative; display:inline-block; }
        .aptis-matching .count-chip {
          min-width:13rem;
          max-width:min(24rem, 78vw);
          display:inline-flex;
          align-items:center;
          justify-content:space-between;
          gap:.5rem;
          background:#24365d;
          border:1px solid #335086;
          color:var(--ink);
          padding:.45rem .7rem;
          border-radius:10px;
          cursor:pointer;
        }
        .aptis-matching .count-chip .lbl { color:#cfe1ff; font-weight:800; }
        .aptis-matching .count-chip .val {
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
        }
        .aptis-matching .chip-menu {
          position:absolute;
          right:0;
          margin-top:.4rem;
          background:#132647;
          border:1px solid #2c4b83;
          border-radius:12px;
          padding:.35rem;
          list-style:none;
          min-width:17rem;
          max-height:50vh;
          overflow:auto;
          box-shadow:0 10px 24px rgba(0,0,0,.35);
          z-index:50;
        }
        .aptis-matching .chip-option {
          width:100%;
          text-align:left;
          background:transparent;
          border:0;
          color:var(--ink);
          padding:.45rem .6rem;
          border-radius:10px;
          display:flex;
          gap:.5rem;
          align-items:baseline;
          cursor:pointer;
        }
        .aptis-matching .chip-option:hover { background:#0f1b31; }
        .aptis-matching .chip-option.active { background:#294b84; }
        .aptis-matching .chip-option .num {
          color:#cfe1ff;
          width:2.2rem;
          display:inline-block;
        }
        .aptis-matching .chip-option .ttl {
          color:var(--ink);
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        }
  
        /* COMMENTS */
        .aptis-matching .comment {
  margin-bottom:1rem;
  border:1px solid transparent;
  border-radius:10px;
  padding:.5rem .6rem;
  transition: box-shadow .18s ease, background .18s ease, border-color .18s ease;
}
        .aptis-matching .comments h3 {
          margin-top:0;
          color:var(--ok);
          font-size:1.1rem;
        }
        .aptis-matching .comment {
          margin-bottom:1rem;
          border:1px solid transparent;
          border-radius:10px;
          padding:.5rem .6rem;
        }
        .aptis-matching .comment.active-speaker {
  border-color:#37598e;
  background:#0f1b31;
  box-shadow:0 0 0 2px rgba(110,168,255,.3), 0 8px 24px rgba(0,0,0,.6);
}
        .aptis-matching .comment strong {
          color:var(--ok);
          display:block;
          margin-bottom:.25rem;
        }
  
        .aptis-matching mark.evidence {
          background:var(--evidence-bg);
          border-bottom:2px solid var(--evidence-border);
          color:var(--ink);
          padding:0 .1rem;
          border-radius:2px;
        }
  
        /* QUESTIONS */
        .aptis-matching .questions-section {
          background:var(--panel);
          border-radius:16px;
          padding:1rem;
        }
        .aptis-matching .questions-section h3 {
          margin-top:0;
          color:var(--accent);
          font-size:1.1rem;
        }

        .aptis-matching .results-summary {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:.8rem;
          margin:.25rem 0 1rem;
          padding:.75rem .85rem;
          border:1px solid #37598e;
          border-radius:12px;
          background:#0f1b31;
          color:var(--ink);
        }
        .aptis-matching .results-summary > strong {
          font-size:1rem;
          color:var(--ink);
        }
        .aptis-matching .results-counts {
          display:flex;
          gap:.45rem;
          flex-wrap:wrap;
          justify-content:flex-end;
        }
        .aptis-matching .results-counts span,
        .aptis-matching .answer-status {
          display:inline-flex;
          align-items:center;
          gap:.32rem;
          border:1px solid;
          border-radius:999px;
          padding:.28rem .55rem;
          font-size:.78rem;
          font-weight:800;
          line-height:1.2;
          white-space:nowrap;
        }
        .aptis-matching .correct-count,
        .aptis-matching li.ok .answer-status {
          color:#b8f5d7;
          background:rgba(47,182,124,.14);
          border-color:rgba(47,182,124,.7);
        }
        .aptis-matching .incorrect-count,
        .aptis-matching li.bad .answer-status {
          color:#ffd0d0;
          background:rgba(228,108,108,.14);
          border-color:rgba(228,108,108,.72);
        }
        .aptis-matching .unanswered-count,
        .aptis-matching .recheck-count,
        .aptis-matching li.unanswered .answer-status,
        .aptis-matching li.needs-recheck .answer-status {
          color:#ffe1a3;
          background:rgba(241,184,75,.14);
          border-color:rgba(241,184,75,.75);
        }
        .aptis-matching .status-icon {
          display:inline-grid;
          place-items:center;
          width:1rem;
          height:1rem;
          font-size:.82rem;
          font-weight:900;
        }
  
        .aptis-matching .questions {
          list-style:decimal;
          padding-left:1.2rem;
          display:flex;
          flex-direction:column;
          gap:.9rem;
        }

        .aptis-matching .questions > li {
          padding:.7rem .75rem;
          border:2px solid transparent;
          border-radius:12px;
          color:var(--ink);
          transition:border-color .18s ease, background .18s ease;
        }

        .aptis-matching .questions > li.ok {
          background:rgba(47,182,124,.09) !important;
          border-color:rgba(47,182,124,.82) !important;
          color:var(--ink) !important;
        }
        .aptis-matching .questions > li.bad {
          background:rgba(228,108,108,.09) !important;
          border-color:rgba(228,108,108,.86) !important;
          color:var(--ink) !important;
        }
        .aptis-matching .questions > li.unanswered,
        .aptis-matching .questions > li.needs-recheck {
          background:rgba(241,184,75,.08) !important;
          border-color:rgba(241,184,75,.82) !important;
          color:var(--ink) !important;
        }
  
        .aptis-matching .q-row {
          display:flex;
          flex-wrap:wrap;
          gap:.5rem .6rem;
          align-items:flex-start;
        }
  
        .aptis-matching .qtext {
          flex:1 1 14rem;
        }
  
        .aptis-matching select {
          background:#24365d;
          color:var(--ink);
          border-radius:8px;
          border:1px solid #37598e;
          padding:.3rem .4rem;
        }
  
        .aptis-matching .why-btn {
          background:#24365d;
          border:1px solid #37598e;
          color:var(--accent);
          font-weight:600;
          border-radius:8px;
          padding:.3rem .5rem;
          line-height:1.2;
          cursor:pointer;
        }
        .aptis-matching .why-btn:disabled {
          opacity:.4;
          cursor:not-allowed;
        }
  
        .aptis-matching li.ok select {
          border:2px solid var(--ok);
          box-shadow:0 0 0 2px rgba(47,182,124,.16);
        }
        .aptis-matching li.bad select {
          border:2px solid var(--bad);
          box-shadow:0 0 0 2px rgba(228,108,108,.16);
        }
        .aptis-matching li.unanswered select,
        .aptis-matching li.needs-recheck select {
          border:2px solid var(--warning);
          box-shadow:0 0 0 2px rgba(241,184,75,.14);
        }
  
        .aptis-matching .why-box {
          background:#0f1b31;
          border:1px solid #37598e;
          border-radius:10px;
          padding:.6rem .7rem;
          margin-top:.5rem;
          font-size:.9rem;
          line-height:1.4;
        }
  
        .aptis-matching .why-answer {
          font-weight:600;
          margin-bottom:.4rem;
          color:var(--ink);
        }
  
        .aptis-matching .why-evidence {
          margin-bottom:.4rem;
          color:var(--ink);
        }
  
        .aptis-matching .why-explain {
          color:var(--muted);
        }
  
        .aptis-matching .why-box .label {
          color:var(--accent);
          font-weight:600;
        }
  
        .aptis-matching .controls {
          margin-top:1rem;
          display:flex;
          gap:.5rem;
          flex-wrap:wrap;
        }
  
        .aptis-matching .btn {
          background:#24365d;
          border:1px solid #335086;
          color:var(--ink);
          padding:.45rem .7rem;
          border-radius:10px;
          cursor:pointer;
        }
        .aptis-matching .btn.primary {
          background:#294b84;
          border-color:#3a6ebd;
        }
        .aptis-matching .btn.ghost {
          background:transparent;
          border-color:#37598e;
        }

        @media (max-width:720px) {
          .aptis-matching .header { flex-direction:column; }
          .aptis-matching .header-tools {
            width:100%;
            justify-content:flex-start;
          }
          .aptis-matching .count-chip,
          .aptis-matching .chip-select { width:100%; }
          .aptis-matching .chip-menu {
            left:0;
            right:auto;
            width:100%;
            min-width:0;
          }
          .aptis-matching .results-summary {
            align-items:flex-start;
            flex-direction:column;
          }
          .aptis-matching .results-counts { justify-content:flex-start; }
        }

        :root[data-theme="light"] .aptis-matching .results-summary {
          background:#ffffff !important;
          border-color:#b7c7dd !important;
          color:#172033 !important;
          box-shadow:0 5px 14px rgba(38,65,105,.08) !important;
        }
        :root[data-theme="light"] .aptis-matching .results-summary > strong {
          color:#172033 !important;
        }
        :root[data-theme="light"] .aptis-matching .correct-count,
        :root[data-theme="light"] .aptis-matching li.ok .answer-status {
          color:#075a3e !important;
          background:#d9f8ea !important;
          border-color:#16825d !important;
        }
        :root[data-theme="light"] .aptis-matching .incorrect-count,
        :root[data-theme="light"] .aptis-matching li.bad .answer-status {
          color:#8f2028 !important;
          background:#fee7e9 !important;
          border-color:#c44751 !important;
        }
        :root[data-theme="light"] .aptis-matching .unanswered-count,
        :root[data-theme="light"] .aptis-matching .recheck-count,
        :root[data-theme="light"] .aptis-matching li.unanswered .answer-status,
        :root[data-theme="light"] .aptis-matching li.needs-recheck .answer-status {
          color:#704600 !important;
          background:#fff2cc !important;
          border-color:#b87a00 !important;
        }
        :root[data-theme="light"] .aptis-matching .questions > li.ok {
          background:#effcf6 !important;
          border-color:#16825d !important;
          color:#172033 !important;
        }
        :root[data-theme="light"] .aptis-matching .questions > li.bad {
          background:#fff3f4 !important;
          border-color:#c44751 !important;
          color:#172033 !important;
        }
        :root[data-theme="light"] .aptis-matching .questions > li.unanswered,
        :root[data-theme="light"] .aptis-matching .questions > li.needs-recheck {
          background:#fff9e8 !important;
          border-color:#b87a00 !important;
          color:#172033 !important;
        }
        :root[data-theme="light"] .aptis-matching li.ok select {
          border-color:#16825d !important;
          box-shadow:0 0 0 2px rgba(22,130,93,.13) !important;
        }
        :root[data-theme="light"] .aptis-matching li.bad select {
          border-color:#c44751 !important;
          box-shadow:0 0 0 2px rgba(196,71,81,.13) !important;
        }
        :root[data-theme="light"] .aptis-matching li.unanswered select,
        :root[data-theme="light"] .aptis-matching li.needs-recheck select {
          border-color:#b87a00 !important;
          box-shadow:0 0 0 2px rgba(184,122,0,.12) !important;
        }
      `}</style>
    );
}
