// src/components/writing/WritingPart2.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as fb from "../../firebase";
import { toast } from "../../utils/toast";
import RichTextExamEditor from "../common/RichTextExamEditor";

/**
 * Aptis Writing – Part 2 (short form, 20–30 words)
 * - 7 tasks mirroring the Part 4 threads.
 * - Tasks 1–2 open to everyone; 3+ require sign-in.
 */

const TASKS = [
  {
    id: "sports-fee",
    title: "Sports Club",
    context:
      "You are a new member of a sports club. Complete the information on the online form. Write in full sentences using 20–30 words.",
    prompt:
      "Please write about the sports you like doing or watching and why you decided to join the club.",
  },
  {
    id: "debate-club",
    title: "Debate Club",
    context:
      "You are a new member of a debate club. Complete the information on the online form. Write in full sentences using 20–30 words.",
    prompt:
      "Please tell us a little about you experience of debating or speaking in public.",
  },
  {
    id: "volunteer-change",
    title: "Volunteer Group",
    context:
      "You have joined a volunteer group that organises community projects at weekends. Complete the information on the online form. Write in full sentences using 20–30 words.",
    prompt:
      "Please write about any volunteering you have done before and what kind of projects you are most interested in.",
  },
  {
    id: "travel-club",
    title: "Travel Club",
    context:
      "You are a new member of a travel club. Complete the information on the online form. Write in full sentences using 20–30 words.",
    prompt:
      "Please write about why you are interested in travel, and where you would like to go next.",
  },
  {
    id: "ebook-switch",
    title: "Book Club",
    context:
      "You are a new member of a book club. Complete the information on the online form. Write in full sentences using 20–30 words.",
    prompt:
      "Please tell us about the kinds of books you enjoy and how often you usually read.",
  },
  {
    id: "book-exchange",
    title: "Book Exchange Website",
    context:
      "You have joined a book-exchange website. Complete the information on the online form. Write in full sentences using 20–30 words.",
    prompt:
      "Please tell us whether you prefer buying new books or second-hand books, and why.",
  },
  {
    id: "film-club",
    title: "Film Club",
    context:
      "You are a new member of a film club connected with a local cinema. Complete the information on the online form. Write in full sentences using 20–30 words.",
    prompt:
      "Please write about your favourite kinds of films and how often you go to the cinema or watch films at home.",
  },
];

export default function WritingPart2({ user, onRequireSignIn }) {
  const [taskIndex, setTaskIndex] = useState(0);
  const current = TASKS[taskIndex] || TASKS[0];

  const [answerHTML, setAnswerHTML] = useState("");
  const [answerText, setAnswerText] = useState("");

  const [showSummary, setShowSummary] = useState(false);

  // word counts
  const counts = useMemo(
    () => ({
      answer: wordCount(answerText),
    }),
    [answerText]
  );

  // decorate tasks with lock info + numbered titles
  const decoratedTasks = useMemo(() => decorateTasks(TASKS, user), [user]);

  // reset editor when task changes
  useEffect(() => {
    setAnswerHTML("");
    setAnswerText("");
    setShowSummary(false);
  }, [current.id]);

  function handleSelectTask(nextIdx) {
    // Hard gate: non-signed users -> only tasks 0 and 1
    if (!user && nextIdx >= 2) {
      onRequireSignIn?.();
      return;
    }
    setTaskIndex(nextIdx);
  }

  // ---------- summary + export helpers (inside component so they see current task) ----------

  function buildSummaryPlain() {
    const plain = htmlToPlainKeepLines(answerHTML, answerText);
    return [
      "Aptis Writing – Part 2",
      `Task: ${current.title}`,
      "",
      "— Short form (20–30 words) —",
      plain || "(empty)",
      "",
      `Word count: ${counts.answer}`,
    ].join("\n");
  }

  function buildSummaryHtml() {
    const body = normalizeHtmlForClipboard(answerHTML, answerText);
    return `
      <div>
        <h3 style="margin:0 0 .4rem 0;">Aptis Writing – Part 2</h3>
        <p style="margin:0 0 .6rem 0;"><strong>Task:</strong> ${current.title}</p>
        <h4 style="margin:.4rem 0 .3rem 0;">Short form (20–30 words)</h4>
        ${body}
        <p style="margin:.8rem 0 0 0;"><em>Word count: ${counts.answer}</em></p>
      </div>
    `;
  }

  async function handleCopy() {
    const plain = buildSummaryPlain();
    const rich = buildSummaryHtml();

    try {
      if (
        window.ClipboardItem &&
        navigator.clipboard &&
        navigator.clipboard.write
      ) {
        await navigator.clipboard.write([
          new window.ClipboardItem({
            "text/plain": new Blob([plain], {
              type: "text/plain;charset=utf-8",
            }),
            "text/html": new Blob([rich], {
              type: "text/html;charset=utf-8",
            }),
          }),
        ]);
      } else {
        // fallback: plain text only
        await navigator.clipboard.writeText(plain);
      }
      toast("Answer copied ✓");
    } catch (e) {
      console.warn("[WritingP2] copy failed", e);
      toast("Copy failed — try the download button instead.");
    }
  }

  async function handleDownload() {
    const plain = buildSummaryPlain();
    try {
      const blob = new Blob([plain], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aptis-writing-part2-${current.id}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast("Download ready ✓");
    } catch (e) {
      console.warn("[WritingP2] download failed", e);
      toast("Download failed — copy your answer instead.");
    }
  }

  async function handleSubmit() {
    if (!answerText.trim()) {
      toast("Please write your answer before submitting.");
      return;
    }

    // Optional: save to Firestore if the helper exists
    if (user && fb?.saveWritingP2Submission) {
      try {
        await fb.saveWritingP2Submission({
          taskId: current.id,
          answerText: answerText.trim(),
          answerHTML,
          counts: { answer: counts.answer },
        });
      } catch (e) {
        console.warn("[WritingP2] save failed", e);
      }
    }

    toast("Saved ✓");
    setShowSummary(true);
  }

  function handleReset() {
    setAnswerHTML("");
    setAnswerText("");
    setShowSummary(false);
    toast("Cleared ✓");
  }

  return (
    <div className="aptis-writing-p2 game-wrapper">
      <StyleScope />
      <header className="header">
        <div>
          <h2 className="title">Writing – Part 2 (Short form)</h2>
          <p className="intro">
            Question 2 of 4. You are a new member of a club or website. Write
            one short paragraph of <strong>20–30 words</strong> in full
            sentences. Recommended time: <strong>7 minutes</strong>.
          </p>
        </div>
        <div className="actions">
          <ChipDropdown
            items={decoratedTasks}
            value={taskIndex}
            onChange={handleSelectTask}
            label="Task"
          />
        </div>
      </header>

      <div className="grid">
        {showSummary ? (
          /* ---------- SUMMARY PANEL ---------- */
          <section className="panel summary">
            <div className="summary-header">
              <h4 style={{ margin: 0 }}>Complete</h4>
              <div className="summary-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowSummary(false)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={handleCopy}
                >
                  Copy answer
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={handleDownload}
                >
                  Download .txt
                </button>
              </div>
            </div>

            <div className="summary-grid">
              <div className="card">
                <div className="card-title">Short form (20–30w)</div>
                <div className="card-meta">
                  {counts.answer} words
                </div>
                <div
                  className="preview submitted-html"
                  dangerouslySetInnerHTML={{
                    __html: normalizeHtmlForClipboard(
                      answerHTML,
                      answerText
                    ),
                  }}
                />
              </div>
            </div>
          </section>
        ) : (
          /* ---------- FORM PANEL ---------- */
          <form
            className="panel"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="block">
              <h3 style={{ marginTop: 0, marginBottom: "0.4rem" }}>
                {current.title}
              </h3>
              <p className="muted" style={{ marginTop: 0 }}>
                {current.context}
              </p>
            </div>

            <div className="block">
              <p
                style={{ fontWeight: 500, marginBottom: "0.4rem" }}
              >
                {current.prompt}
              </p>

              <RichTextExamEditor
                valueHTML={answerHTML}
                placeholder="Write 20–30 words here…"
                ariaLabel="Part 2 answer editor"
                onChange={({ html, text }) => {
                  setAnswerHTML(html);
                  setAnswerText(text);
                }}
              />

              <div className="meter">
                <span
                  className={`pill ${
                    // Slightly generous band around 20–30
                    within(counts.answer, 18, 35) ? "ok" : ""
                  }`}
                >
                  {counts.answer} words (aim 20–30)
                </span>
              </div>
            </div>

            <div className="actions">
              <button type="submit" className="btn primary">
                Submit
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleReset}
              >
                Reset
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function wordCount(s = "") {
  return (s.trim().match(/\b[\p{L}\p{N}’'-]+\b/gu) || []).length;
}
function within(n, min, max) {
  return n >= min && n <= max;
}

function decorateTasks(tasks, user) {
  return tasks.map((t, i) => {
    const locked = !user && i >= 2;
    return {
      ...t,
      locked,
      title: `${i + 1}. ${t.title}${locked ? " 🔒" : ""}`,
    };
  });
}

/**
 * More robust HTML → plain-text conversion, keeping line breaks sensible.
 * Mirrors the newer helper used in Part 3 / Part 4.
 */
function htmlToPlainKeepLines(html = "", fallbackText = "") {
  if (!html) {
    return (fallbackText || "").replace(/\r\n/g, "\n").trim();
  }

  const tmp = document.createElement("div");
  tmp.innerHTML = html.replace(/^\u200E+/, "");

  tmp.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));

  const blocks = [];
  const isBlock = (n) =>
    /^(P|DIV|LI|H[1-6]|PRE|BLOCKQUOTE)$/i.test(n.nodeName);

  if ([...tmp.childNodes].some((n) => n.nodeType === 1 && isBlock(n))) {
    tmp.childNodes.forEach((n) => {
      if (n.nodeType === 1) {
        const t = n.textContent
          .replace(/\u00A0/g, " ")
          .replace(/[ \t]+\n/g, "\n")
          .trimEnd();
        if (t) blocks.push(t);
        if (isBlock(n)) blocks.push("");
      } else if (n.nodeType === 3) {
        const t = n.nodeValue.replace(/\u00A0/g, " ");
        if (t.trim()) blocks.push(t.trimEnd());
      }
    });
  }

  let out = blocks.length ? blocks.join("\n") : tmp.textContent;

  return out
    .replace(/\u00A0/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function looksLikeHtml(s = "") {
  return /<([a-z][\w:-]*)\b[^>]*>/i.test(s);
}

// Plain text -> minimal paragraph HTML
function textToHtml(txt = "") {
  const clean = (txt + "").replace(/^\u200E+/, "");
  const safe = clean
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const paras = safe
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, "<br/>"));
  return `<p>${paras.join("</p><p>")}</p>`;
}

// Normalise HTML for clipboard / preview: always return clean <p>..</p> HTML
function normalizeHtmlForClipboard(html, fallbackText) {
  const plain = htmlToPlainKeepLines(
    looksLikeHtml(html) ? html : "",
    fallbackText
  );
  return textToHtml(plain);
}

function ChipDropdown({ items, value, onChange, label = "Task" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const current = items[value];

  return (
    <div className="chip-select" ref={ref}>
      <button
        type="button"
        className={`count-chip ${open ? "selected" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${value + 1}. ${current?.title || ""}`}
      >
        {value + 1}
        <span className="chip-caret" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <ul className="chip-menu" role="listbox">
          {items.map((it, i) => {
            const active = i === value;
            const locked = !!it.locked;
            return (
              <li key={it.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  aria-disabled={locked}
                  disabled={locked}
                  className={`chip-option ${active ? "active" : ""} ${
                    locked ? "locked" : ""
                  }`}
                  onClick={() => {
                    if (!locked) {
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

function StyleScope() {
  return (
    <style>{`
      .aptis-writing-p2 {
        --panel:#13213b;
        --ink:#e6f0ff;
        --muted:#a9b7d1;
        color: var(--ink);
      }

      .aptis-writing-p2 .header {
        display:flex;
        justify-content:space-between;
        align-items:flex-end;
        gap:1rem;
        margin-bottom:1rem;
      }

      .aptis-writing-p2 .title {
        margin:0;
        font-size:1.35rem;
      }

      .aptis-writing-p2 .intro {
        margin:.25rem 0 0;
        color:var(--muted);
      }

      .aptis-writing-p2 .grid {
        display:grid;
        grid-template-columns:1fr;
        gap:1rem;
      }

      .aptis-writing-p2 .panel {
        background:var(--panel);
        border:1px solid #203258;
        border-radius:16px;
        padding:1rem;
        box-shadow:0 6px 18px rgba(0,0,0,.25);
      }

      .aptis-writing-p2 .muted {
        color:var(--muted);
      }

      .aptis-writing-p2 .block {
        margin:.75rem 0 1rem;
      }

      .aptis-writing-p2 .actions {
        display:flex;
        gap:.5rem;
        flex-wrap:wrap;
        margin-top:.6rem;
      }

      .aptis-writing-p2 .btn,
      .aptis-writing-p2 .pill,
      .aptis-writing-p2 .count-chip {
        background:#24365d;
        border:1px solid #335086;
        color:#e6f0ff;
        border-radius:10px;
        font-size:.9rem;
      }

      .aptis-writing-p2 .btn {
        padding:.45rem .7rem;
        cursor:pointer;
      }

      .aptis-writing-p2 .btn.primary {
        background:#294b84;
        border-color:#3a6ebd;
      }

      .aptis-writing-p2 .pill {
        padding:.2rem .6rem;
        border-radius:999px;
      }

      .aptis-writing-p2 .pill.ok {
        border-color:#2f9d69;
      }

      .aptis-writing-p2 .meter {
        margin-top:.35rem;
      }

      /* Chip dropdown */
      .aptis-writing-p2 .chip-select {
        position:relative;
        display:inline-block;
      }

      .aptis-writing-p2 .count-chip {
        min-width:2.4rem;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:.25rem;
        padding:.35rem .6rem;
      }

      .aptis-writing-p2 .count-chip.selected {
        background:#294b84;
        border-color:#3a6ebd;
      }

      .aptis-writing-p2 .chip-caret {
        font-size:.7rem;
        margin-left:.1rem;
      }

      .aptis-writing-p2 .chip-menu {
        position:absolute;
        right:0;
        margin-top:.35rem;
        background:#0f1b31;
        border:1px solid #24365d;
        border-radius:10px;
        padding:.35rem;
        min-width:220px;
        max-height:260px;
        overflow:auto;
        z-index:20;
      }

      .aptis-writing-p2 .chip-option {
        width:100%;
        text-align:left;
        padding:.3rem .45rem;
        border-radius:8px;
        border:none;
        background:transparent;
        color:inherit;
        cursor:pointer;
        font-size:.9rem;
        display:flex;
        gap:.45rem;
        align-items:flex-start;
      }

      .aptis-writing-p2 .chip-option .num {
        flex-shrink:0;
      }

      .aptis-writing-p2 .chip-option .ttl {
        flex:1;
      }

      .aptis-writing-p2 .chip-option.active {
        background:#24365d;
      }

      .aptis-writing-p2 .chip-option.locked {
        opacity:.55;
        cursor:not-allowed;
      }

      @media (max-width: 640px) {
        .aptis-writing-p2 .header {
          flex-direction:column;
          align-items:flex-start;
        }
      }

      /* --- Rich text editor host (match Part 4) --- */
      .aptis-writing-p2 .rte-editable {
        direction: ltr;
        unicode-bidi: plaintext;
        text-align: left;
        white-space: pre-wrap;
        word-break: break-word;
      }

      /* When empty, inject an invisible LTR mark so the first keystroke is LTR */
      .aptis-writing-p2 .rte-editable:empty::before {
        content: "\\\\200E";
        display: inline-block;
      }

      /* --- Rich text toolbar + buttons (match Part 4) --- */
      .aptis-writing-p2 .rte-toolbar {
        display:flex;
        gap:.4rem;
        margin:.35rem 0 .5rem;
      }

      .aptis-writing-p2 .rte-btn {
        background:#24365d;
        border:1px solid #335086;
        color:#e6f0ff;
        padding:.35rem .6rem;
        border-radius:12px;
        font-weight:700;
        letter-spacing:.02em;
        line-height:1;
        box-shadow:0 1px 0 rgba(0,0,0,.25), inset 0 -1px 0 rgba(255,255,255,.03);
        transition:transform .06s ease, background .12s ease, border-color .12s ease, box-shadow .12s ease;
      }

      .aptis-writing-p2 .rte-btn:hover {
        background:#294b84;
        border-color:#3a6ebd;
        box-shadow:0 2px 8px rgba(0,0,0,.25), inset 0 -1px 0 rgba(255,255,255,.05);
      }

      .aptis-writing-p2 .rte-btn:active {
        transform: translateY(1px);
      }

      .aptis-writing-p2 .rte-btn.active {
        background:#3a6ebd;
        border-color:#6ea8ff;
        box-shadow: inset 0 2px 6px rgba(0,0,0,.25), 0 0 0 1px rgba(110,168,255,.15);
      }

      .aptis-writing-p2 .rte-btn:disabled {
        opacity:.55;
        cursor:not-allowed;
      }

      @media (max-width: 520px){
        .aptis-writing-p2 .rte-btn{
          padding:.32rem .5rem;
          border-radius:10px;
        }
      }

      /* --- Summary panel (match Part 4 styling) --- */
      .aptis-writing-p2 .summary .summary-header {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:.75rem;
        margin-bottom:.6rem;
      }
      .aptis-writing-p2 .summary .summary-actions {
        display:flex;
        gap:.4rem;
        flex-wrap:wrap;
      }

      .aptis-writing-p2 .summary .summary-grid {
        display:grid;
        grid-template-columns:1fr;
        gap:.8rem;
      }

      .aptis-writing-p2 .summary .card {
        background:#0f1b31;
        border:1px solid #2c416f;
        border-radius:12px;
        padding:.8rem;
      }
      .aptis-writing-p2 .summary .card-title {
        font-weight:700;
        margin-bottom:.15rem;
      }
      .aptis-writing-p2 .summary .card-meta {
        color: var(--muted);
        font-size:.9rem;
        margin-bottom:.5rem;
      }
      .aptis-writing-p2 .summary .preview {
        background:#0a1528;
        border:1px solid #223a68;
        border-radius:10px;
        padding:.65rem;
        min-height:3.5rem;
      }
      .aptis-writing-p2 .summary .preview * {
        color:#e6f0ff;
      }
      .aptis-writing-p2 .summary .preview p {
        margin:.3rem 0;
      }
    `}</style>
  );
}
