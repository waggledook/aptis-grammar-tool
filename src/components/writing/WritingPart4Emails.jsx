// src/components/writing/WritingPart4Emails.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import * as fb from "../../firebase";
import { toast } from "../../utils/toast";
import RichTextExamEditor from "../common/RichTextExamEditor";

/**
 * Aptis Writing – Part 4 (two emails: informal ~50w, formal 120–150w)
 * - 2 tasks fully open; tasks 3+ require sign-in (like reading/speaking).
 * - Word counters live; submit stores to Firestore when signed in.
 */

const TASKS = [
    {
      id: "sports-fee",
      title: "Sports Club: Introduction of a Membership Fee",
      sourceTitle: "Email from the club committee",
      source: `Dear Member,
  
  Our club has always operated thanks to volunteers and small local donations. However, increasing maintenance and equipment costs mean we now need a more stable source of funding.
  
  For this reason, the committee has decided to introduce a small annual membership fee of £15, starting next month. The money will go directly towards maintaining our facilities and buying new sports materials.
  
  We understand that not everyone may agree with this decision, so we would like to hear your opinions before the final vote. Please send your comments or suggestions by next Friday.
  
  Kind regards,
  The Club Committee`,
      friendPrompt: "Write an email to your friend. Say how you feel about the new membership fee and whether you plan to keep attending. (About 50 words)",
      formalPrompt: "Write an email to the club committee. Express your opinion about the new fee, give your reasons, and suggest other ways the club could raise money. (120–150 words)",
    },
    {
      id: "debate-club",
      title: "Debate Club",
      sourceTitle: "Message from the club leader",
      source: `Dear Member,
  
  As part of our plan to promote the debate club, we are creating a new section on our website featuring comments from current members. The idea is to show potential students how taking part in debates can improve communication skills and self-confidence.
  
  We would like each member to contribute a short paragraph explaining why they joined, what they have learned from participating, and how debating has helped them in other areas of life. Your comments will appear with your first name and photo.
  
  Please send your contribution by next Monday, together with your permission to use your picture.
  
  Thank you,
  The Debate Club Committee`,
      friendPrompt: "Write a message to your friend. Tell them how you feel about the club’s website project and ask what they think you should include in your comment. (About 50 words)",
      formalPrompt: "Write your comment for the club website. Explain what you have gained from being a member of the debate club and why you would recommend it to others. (120–150 words)",
    },
    {
      id: "volunteer-change",
      title: "Volunteer Group: Change in Project Location",
      sourceTitle: "Email from the project coordinator",
      source: `Dear Volunteer,
  
  Thank you for signing up for our weekend clean-up project at Central Park. We’ve just been informed that access to the park will be restricted next weekend due to safety work being carried out by the local council.
  
  As a result, we’ll need to move the event to Greenfield Nature Reserve, about 20 minutes away. The meeting time and schedule will remain the same, but we’ll now focus on cleaning the walking paths near the river.
  
  Please confirm if you are still available and let us know whether you’ll need help arranging transport.
  
  Best wishes,
  Maria Lopez
  Project Coordinator`,
      friendPrompt: "Write an email to your friend. Say how you feel about the new location and whether you’ll still take part. (About 50 words)",
      formalPrompt: "Write an email to the coordinator. Confirm whether you can still join the event and offer any suggestions for organising transport or improving the day. (120–150 words)",
    },
    {
      id: "travel-club",
      title: "Travel Club",
      sourceTitle: "Email from the organiser",
      source: `Dear Member,
  
  We are planning next month’s meeting and would like to try something a little different. Instead of our usual presentation, we hope to invite one of our own members to give a short talk about their personal travel experiences. Ideally, the speaker would describe a recent trip, share advice about travelling safely and responsibly, and answer a few questions from the audience.
  
  If you have travelled abroad recently and would enjoy speaking to the group, we would be delighted to hear from you. Alternatively, you may wish to recommend another member who could do it.
  
  Please reply by Friday 12 May so that we can confirm the details and prepare the publicity.
  
  Kind regards,
  The Travel Club Team`,
      friendPrompt: "Write an email to your friend. Write about whether you are thinking of volunteering and why or why not. (About 50 words)",
      formalPrompt: "Write an email to the club organiser. Write about whether you would like to volunteer and explain your reasons. You can also make suggestions for the talk. (120–150 words)",
    },
    {
      id: "ebook-switch",
      title: "Book Club: Switching to E-Books",
      sourceTitle: "Email from the club leader",
      source: `Dear Member,
  
  We’ve recently received feedback that some members find it difficult to buy the printed versions of our monthly books. To make reading more convenient and sustainable, the committee is considering switching entirely to e-books starting next month.
  
  Members would receive a digital copy of each title and read it on their phones, tablets, or computers. The club would also save money on printing and postage.
  
  Before we make the change, we’d like to know your opinion. Do you think switching to e-books is a good idea? What problems could it cause for members?
  
  Kind regards,
  The Book Club Committee`,
      friendPrompt: "Write an email to your friend. Write about your feelings on using e-books instead of printed books. (About 50 words)",
      formalPrompt: "Write an email to the committee. Give your opinion about the idea of switching to e-books and suggest how the club could make the change easier for everyone. (120–150 words)",
    },
    {
      id: "book-exchange",
      title: "Book Exchange Website",
      sourceTitle: "Message about a used book",
      source: `You have seen an advertisement for a used book you want. However, the description is not very clear, and the price seems quite high. You are also not sure about the condition of the book.`,
      friendPrompt: "Write an email to your friend. Tell them about the book you’ve found and ask what they think about buying used books online. (About 50 words)",
      formalPrompt: "Write an email to the seller. Ask for more details about the book’s condition and explain that you think the price is a bit high. Suggest a lower price if you wish. (120–150 words)",
    },
    {
      id: "film-club",
      title: "Film Club: Cinema Closed for Repairs",
      sourceTitle: "Message from the club president",
      source: `Dear Member,
  
  We’ve just been informed that the university cinema room will be closed for the next two months while new seats and sound equipment are installed.
  
  Rather than cancelling all our screenings, we’re thinking of moving them online. Members would be able to watch the film at home and then join a video call for discussion afterwards.
  
  We realise this won’t suit everyone, but it would allow the club to continue meeting until the repairs are finished.
  
  Please let us know what you think about this temporary solution and whether you’d like to take part.
  
  Best,
  Tom Evans
  Club President`,
      friendPrompt: "Write an email to your friend. Say how you feel about the cinema being closed and whether you’ll join the online screenings. (About 50 words)",
      formalPrompt: "Write an email to the president. Give your opinion about the temporary online plan and suggest ways to keep the meetings enjoyable and interactive. (120–150 words)",
    },
  ];
  

export default function WritingPart4Emails({ user, onRequireSignIn }) {
  // lock tasks 3+ if signed out
  const [taskIndex, setTaskIndex] = useState(0);
  const current = TASKS[taskIndex] || TASKS[0];

 // form state
const [friendHTML, setFriendHTML] = useState("");
const [formalHTML, setFormalHTML] = useState("");
const [friendText, setFriendText] = useState("");
const [formalText, setFormalText] = useState("");


// derived word counts (no state; avoids naming clash)
const counts = useMemo(() => ({
  friend: wordCount(friendText),
  formal: wordCount(formalText),
}), [friendText, formalText]);

// summary state
const [showSummary, setShowSummary] = useState(false);

// plain-text export used for copy/download
function buildSummaryText() {
  return [
    `Aptis Writing – Part 4`,
    `Task: ${current.title}`,
    ``,
    `— Informal (~50 words) —`,
    friendText.trim() || "(empty)",
    ``,
    `— Formal (120–150 words) —`,
    formalText.trim() || "(empty)",
    ``,
    `Word counts: friend ${counts.friend}, formal ${counts.formal}`,
  ].join("\n");
}

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(buildSummaryText());
    toast("Answers copied ✓");
  } catch {
    toast("Copy failed — select and copy manually.");
  }
}

function handleDownload() {
  const blob = new Blob([buildSummaryText()], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `aptis-writing-p4-${current.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}


  // reset when task changes
  useEffect(() => {
    setFriendHTML("");
    setFormalHTML("");
    setFriendText("");
    setFormalText("");
  }, [current.id]);

  function handleSelectTask(nextIdx) {
    if (!user && nextIdx >= 2) {
      onRequireSignIn?.();
      return;
    }
    setTaskIndex(nextIdx);
    setShowSummary(false); // ✅ hide summary on new task
  }

  async function handleSubmit() {
  if (!friendText.trim() || !formalText.trim()) {
    toast("Please write both emails before submitting.");
    return;
  }

  if (user && fb?.saveWritingP4Submission) {
    try {
      await fb.saveWritingP4Submission({
        taskId: current.id,
        friendText: friendText.trim(),
        formalText: formalText.trim(),
        friendHTML,
        formalHTML,
        counts: { friend: counts.friend, formal: counts.formal },
      });
    } catch (e) {
      console.warn("[WritingP4] save failed", e);
    }
  }

  toast("Saved ✓");
  setShowSummary(true);  // ✅ shows the summary panel
}


  return (
    <div className="aptis-writing-p4 game-wrapper">
      <StyleScope />

      <header className="header">
        <div>
          <h2 className="title">Writing – Part 4 (Two emails)</h2>
          <p className="intro">
            Write an informal message (~50 words) and a formal email (120–150 words). Two tasks are open; sign in to unlock more.
          </p>
        </div>
        <div className="picker">
          <ChipDropdown
            items={decorateTasks(TASKS, user)}
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
          <button type="button" className="btn" onClick={handleCopy}>
            Copy answers
          </button>
          <button type="button" className="btn" onClick={handleDownload}>
            Download .txt
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="card">
          <div className="card-title">Informal (~50w)</div>
          <div className="card-meta">{counts.friend} words</div>
          <div
            className="preview"
            dangerouslySetInnerHTML={{
              __html: friendHTML || "<em>(empty)</em>",
            }}
          />
        </div>

        <div className="card">
          <div className="card-title">Formal (120–150w)</div>
          <div className="card-meta">{counts.formal} words</div>
          <div
            className="preview"
            dangerouslySetInnerHTML={{
              __html: formalHTML || "<em>(empty)</em>",
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
      <h3 style={{ marginTop: 0 }}>{current.title}</h3>
      <h4 style={{ marginBottom: ".3rem" }}>{current.sourceTitle}</h4>

      <div className="email-source">
        <pre>{current.source}</pre>
      </div>

      {/* Friend email */}
      <div className="block">
        <h4>1) Informal message to a friend (~50 words)</h4>
        <p className="muted">{current.friendPrompt}</p>
        <RichTextExamEditor
          valueHTML={friendHTML}
          placeholder="Write ~50 words to your friend…"
          ariaLabel="Friend email editor"
          onChange={({ html, text }) => {
            setFriendHTML(html);
            setFriendText(text);
          }}
        />
        <div className="meter">
          <span className={`pill ${within(counts.friend, 35, 70) ? "ok" : ""}`}>
            {counts.friend} words (aim ≈50)
          </span>
        </div>
      </div>

      {/* Formal email */}
      <div className="block">
        <h4>2) Formal email (120–150 words)</h4>
        <p className="muted">{current.formalPrompt}</p>
        <RichTextExamEditor
          valueHTML={formalHTML}
          placeholder="Write 120–150 words…"
          ariaLabel="Formal email editor"
          onChange={({ html, text }) => {
            setFormalHTML(html);
            setFormalText(text);
          }}
        />
        <div className="meter">
          <span className={`pill ${within(counts.formal, 110, 170) ? "ok" : ""}`}>
            {counts.formal} words (aim 120–150)
          </span>
        </div>
      </div>

      <div className="actions">
        <button type="submit" className="btn primary">Submit</button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setFriendHTML(""); setFormalHTML("");
            setFriendText(""); setFormalText("");
            setShowSummary(false);
          }}
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
function within(n, min, max) { return n >= min && n <= max; }

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

function ChipDropdown({ items, value, onChange, label="Task" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onDocClick = (e) => { if (!ref.current) return; if (!ref.current.contains(e.target)) setOpen(false); };
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

/* ---------- styles ---------- */
function StyleScope(){
  return (
    <style>{`
      .aptis-writing-p4 { --panel:#13213b; --ink:#e6f0ff; --muted:#a9b7d1; }
      .aptis-writing-p4 { color: var(--ink); }
      .aptis-writing-p4 .header { display:flex; justify-content:space-between; align-items:flex-end; gap:1rem; margin-bottom:1rem; }
      .aptis-writing-p4 .title { margin:0; font-size:1.35rem; }
      .aptis-writing-p4 .intro { margin:.25rem 0 0; color: var(--muted); }

      .aptis-writing-p4 .grid { display:grid; grid-template-columns:1fr; gap:1rem; }

      .aptis-writing-p4 .panel { background: var(--panel); border:1px solid #203258; border-radius:16px; padding:1rem; box-shadow: 0 6px 18px rgba(0,0,0,.25);} 
      .aptis-writing-p4 .muted { color: var(--muted); }
      .aptis-writing-p4 .actions { display:flex; gap:.5rem; flex-wrap:wrap; margin-top:.6rem; }
      .aptis-writing-p4 .btn { background:#24365d; border:1px solid #335086; color:#e6f0ff; padding:.45rem .7rem; border-radius:10px; cursor:pointer; }
      .aptis-writing-p4 .btn.primary { background:#294b84; border-color:#3a6ebd; }

      .aptis-writing-p4 .block { margin:.75rem 0 1rem; }
      .aptis-writing-p4 .ta { width:100%; background:#0f1b31; border:1px solid #335086; color:#e6f0ff; border-radius:10px; padding:.6rem .7rem; outline:none; }
      .aptis-writing-p4 .ta:focus { border-color:#4a79d8; }
      .aptis-writing-p4 .meter { margin-top:.35rem; }
      .aptis-writing-p4 .pill { padding:.2rem .5rem; border-radius:999px; border:1px solid #37598e; }
      .aptis-writing-p4 .pill.ok { border-color:#2f9d69; }

      /* chip dropdown */
      .aptis-writing-p4 .chip-select { position: relative; display: inline-block; }
      .aptis-writing-p4 .count-chip { min-width: 2.4rem; justify-content:center; display:inline-flex; align-items:center; gap:.35rem; background:#24365d; border:1px solid #335086; color:#e6f0ff; padding:.35rem .5rem; border-radius:999px; }
      .aptis-writing-p4 .count-chip.selected { background:#294b84; border-color:#3a6ebd; }
      .aptis-writing-p4 .chip-caret { font-size:.85em; opacity:.9; }
      .aptis-writing-p4 .chip-menu { position:absolute; right:0; margin-top:.4rem; background:#132647; border:1px solid #2c4b83; border-radius:12px; padding:.35rem; list-style:none; min-width:16rem; max-height:50vh; overflow:auto; box-shadow:0 10px 24px rgba(0,0,0,.35); z-index:50; }
      .aptis-writing-p4 .chip-option { width:100%; text-align:left; background:transparent; border:0; color:#e6f0ff; padding:.45rem .6rem; border-radius:10px; display:flex; gap:.5rem; align-items:baseline; cursor:pointer; }
      .aptis-writing-p4 .chip-option:hover { background:#0f1b31; }
      .aptis-writing-p4 .chip-option.active { background:#294b84; }
      .aptis-writing-p4 .chip-option.locked { opacity:.5; cursor:not-allowed; }
      .aptis-writing-p4 .chip-option .num { color:#cfe1ff; width:2.2rem; display:inline-block; }
      .aptis-writing-p4 .chip-option .ttl { color:#e6f0ff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

      .aptis-writing-p4 .bullets { margin:.3rem 0 0 1rem; }
      .aptis-writing-p4 .bullets li { margin:.2rem 0; }
      .email-source pre {
  white-space: pre-line;     /* <-- preserves line breaks from your source text */
  font-family: inherit;      /* match app font */
  color: #e6f0ff;
  background: #0f1b31;
  border: 1px solid #2c416f;
  border-radius: 10px;
  padding: .75rem;
  margin: .25rem 0 .9rem;
  line-height: 1.45;
}
  [contenteditable][data-placeholder]:empty:before{
  content: attr(data-placeholder);
  opacity: .5;
}
/* Editor host */
.aptis-writing-p4 .rte-editable {
  direction: ltr;
  unicode-bidi: plaintext; /* lets the editor compute LTR per paragraph reliably */
  text-align: left;
  white-space: pre-wrap;
  word-break: break-word;
}

/* When empty, inject an invisible LTR mark so the first keystroke is LTR */
.aptis-writing-p4 .rte-editable:empty::before {
  content: "\\200E"; /* LRM (escaped for JS string) */
  display: inline-block;
}
  /* --- Rich text toolbar --- */
.aptis-writing-p4 .rte-toolbar{
  display:flex; gap:.4rem; margin:.35rem 0 .5rem;
}

.aptis-writing-p4 .rte-btn{
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

.aptis-writing-p4 .rte-btn:hover{
  background:#294b84;
  border-color:#3a6ebd;
  box-shadow:0 2px 8px rgba(0,0,0,.25), inset 0 -1px 0 rgba(255,255,255,.05);
}

.aptis-writing-p4 .rte-btn:active{
  transform: translateY(1px);
}

.aptis-writing-p4 .rte-btn.active{
  background:#3a6ebd;
  border-color:#6ea8ff;
  box-shadow: inset 0 2px 6px rgba(0,0,0,.25), 0 0 0 1px rgba(110,168,255,.15);
}

.aptis-writing-p4 .rte-btn:disabled{
  opacity:.55; cursor:not-allowed;
}

/* make buttons look like “chips” on small screens */
@media (max-width: 520px){
  .aptis-writing-p4 .rte-btn{ padding:.32rem .5rem; border-radius:10px; }
}
  /* --- Part 4 summary --- */
.aptis-writing-p4 .summary .summary-header{
  display:flex; align-items:center; justify-content:space-between; gap:.75rem; margin-bottom:.6rem;
}
.aptis-writing-p4 .summary .summary-actions{ display:flex; gap:.4rem; flex-wrap:wrap; }

.aptis-writing-p4 .summary .summary-grid{
  display:grid; grid-template-columns:1fr; gap:.8rem;
}
@media(min-width:900px){
  .aptis-writing-p4 .summary .summary-grid{ grid-template-columns: 1fr 1fr; }
}

.aptis-writing-p4 .summary .card{
  background:#0f1b31; border:1px solid #2c416f; border-radius:12px; padding:.8rem;
}
.aptis-writing-p4 .summary .card-title{
  font-weight:700; margin-bottom:.15rem;
}
.aptis-writing-p4 .summary .card-meta{
  color: var(--muted); font-size:.9rem; margin-bottom:.5rem;
}
.aptis-writing-p4 .summary .preview{
  background:#0a1528; border:1px solid #223a68; border-radius:10px; padding:.65rem; min-height:3.5rem;
}
.aptis-writing-p4 .summary .preview *{ color:#e6f0ff; }
.aptis-writing-p4 .summary .preview p{ margin:.3rem 0; }

/* For rendered submissions (not the editor) */
.aptis-writing-p4 .submitted-html {
  white-space: pre-wrap;        /* preserve line breaks */
  direction: ltr;
  unicode-bidi: plaintext;
  color: var(--ink);
  line-height: 1.6;
}

/* Give paragraphs/divs proper spacing */
.aptis-writing-p4 .submitted-html p,
.aptis-writing-p4 .submitted-html div {
  margin: 0 0 1rem;
}

/* Keep consistent rhythm for <br> lines */
.aptis-writing-p4 .submitted-html br {
  line-height: 1.6;
}

/* Keep paragraphs/line breaks in the summary preview */
.aptis-writing-p4 .summary .preview {
  white-space: pre-wrap;
  unicode-bidi: plaintext;
  direction: ltr;
  background: #0f1b31;
  border: 1px solid #2c416f;
  border-radius: 12px;
  padding: .8rem;
  line-height: 1.6;
}
.aptis-writing-p4 .summary .preview p,
.aptis-writing-p4 .summary .preview div { margin: 0 0 1rem; }
.aptis-writing-p4 .summary .preview p:last-child,
.aptis-writing-p4 .summary .preview div:last-child { margin-bottom: 0; }


    `}</style>
  );
}
