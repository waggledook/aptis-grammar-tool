import React, { useEffect, useState } from "react";
import * as fb from "../../firebase";
import { toast } from "../../utils/toast";
import { PART1_QUESTIONS } from "../speaking/banks/part1";
import { PART2_TASKS } from "../speaking/banks/part2";
import { PART3_TASKS } from "../speaking/banks/part3";
import { PART4_TASKS } from "../speaking/banks/part4";
import { auth } from "../../firebase";
import { onAuthStateChanged } from 'firebase/auth';
import ProfileBadgeStudio from './ProfileBadgeStudio';

export default function Profile({ user, onBack }) {
  const [loading, setLoading] = useState(true);
  const [readingCount, setReadingCount] = useState(0);
  const [speakingCounts, setSpeakingCounts] = useState({ part1:0, part2:0, part3:0, part4:0 });
  const [mistakes, setMistakes] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [grammarDash, setGrammarDash] = useState({ answered: 0, correct: 0, total: 0 });
  const [writingP1, setWritingP1] = useState([]);
  const [showWritingP1, setShowWritingP1] = useState(false);
  const [guideEdits, setGuideEdits] = useState([]);
  const [writingP4, setWritingP4] = useState([]);
  const [showWritingP4, setShowWritingP4] = useState(false);
  const [p4Register, setP4Register] = useState([]);
  const [showP4Register, setShowP4Register] = useState(false);

  const [showGuideEdits, setShowGuideEdits] = useState(false);
  const [openStudio, setOpenStudio] = useState(false);
  const [photoURL, setPhotoURL] = useState(auth.currentUser?.photoURL || '');
  const SPEAKING_TOTALS = {
    part1: PART1_QUESTIONS.length,
    part2: PART2_TASKS.length,
    part3: PART3_TASKS.length,
    part4: PART4_TASKS.length,
  };


   // 👇 keeps photoURL live when user updates their badge or signs in/out
   useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setPhotoURL(u?.photoURL || '');
    });
    return unsub;
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [
          rCount,
          sCounts,
          m,
          f,
          w,
          gDash, // ← name this!
          gEdits,
          wP4, // NEW
          p4Reg,
        ] = await Promise.all([
          fb.fetchReadingProgressCount(),
          fb.fetchSpeakingCounts(),
          fb.fetchRecentMistakes(8),
          fb.fetchRecentFavourites(8),
          fb.fetchWritingP1Sessions(10),
          fb.fetchGrammarDashboard(),   // ← this resolves to gDash
          fb.fetchWritingP1GuideEdits(100),
          fb.fetchWritingP4Submissions?.(20) ?? Promise.resolve([]), // NEW (safe if not implemented)
          fb.fetchWritingP4RegisterAttempts?.(100) ?? Promise.resolve([]), // NEW
        ]);
  
        if (!alive) return;
        setReadingCount(rCount);
        setSpeakingCounts(sCounts);
        setMistakes(m);
        setFavourites(f);
        setWritingP1(w);
        setGrammarDash(gDash);          // ← use gDash here
        setGuideEdits(gEdits);
        setWritingP4(wP4); // NEW
        setP4Register(p4Reg); // NEW
      } catch (e) {
        console.error("[Profile] load failed", e);
        toast("Couldn’t load some profile data.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="profile-page game-wrapper">
      <StyleScope />
      <header className="header">
        <h2 className="title">My Profile</h2>
        <p className="intro">
          Signed in as <strong>{user?.email || "Guest"}</strong>
        </p>
        <div style={{marginLeft:"auto"}}>
          <button className="topbar-btn" onClick={onBack}>← Back</button>
        </div>
      </header>

      {/* Avatar + change button */}
<div className="avatar-row">
  <div className="avatar">
    {photoURL ? (
      <img src={photoURL} alt="Profile badge" className="avatar-img" />
    ) : (
      <div className="avatar-fallback">
        {(user?.email?.[0] || auth.currentUser?.displayName?.[0] || "?")
          .toUpperCase()}
      </div>
    )}
  </div>
  <button
    type="button"
    className="avatar-btn"
    onClick={() => setOpenStudio(true)}
  >
    Create/Change badge
  </button>
</div>

{openStudio && (
  <ProfileBadgeStudio
    onClose={() => setOpenStudio(false)}
    onSaved={(url) => setPhotoURL(url)}
  />
)}


      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <>
          <section className="cards">
            <div className="card">
              <h3>Reading Progress</h3>
              <p><strong>{readingCount}</strong> tasks completed</p>
            </div>
            <div className="card">
  <h3>Speaking Progress</h3>
  <div className="pbar-group">
  <ProgressBar
  value={speakingCounts.part1 || 0}
  max={SPEAKING_TOTALS.part1 || 0}
  label="Part 1"
/>
    <ProgressBar
      value={speakingCounts.part2 || 0}
      max={SPEAKING_TOTALS.part2 || 0}
      label="Part 2"
    />
    <ProgressBar
      value={speakingCounts.part3 || 0}
      max={SPEAKING_TOTALS.part3 || 0}
      label="Part 3"
    />
    <ProgressBar
      value={speakingCounts.part4 || 0}
      max={SPEAKING_TOTALS.part4 || 0}
      label="Part 4"
    />
  </div>
</div>

<div className="card">
  <h3>Grammar Progress</h3>
  <ProgressBar
    label="Answered"
    value={grammarDash.answered}
    max={grammarDash.total || 1}
    right={`${grammarDash.answered}/${grammarDash.total || 0}`}
  />
  <div style={{ height: 8 }} />
  <ProgressBar
    label="Correct"
    value={grammarDash.correct}
    max={grammarDash.total || 1}
    right={`${grammarDash.correct}/${grammarDash.total || 0}`}
  />
</div>


            <div className="card">
              <h3>Recent Mistakes</h3>
              {mistakes.length ? (
                <ul className="mini">
                  {mistakes.map((id) => <li key={id}><code>{id}</code></li>)}
                </ul>
              ) : <p className="muted">No recent mistakes</p>}
            </div>
            <div className="card">
              <h3>Recent Favourites</h3>
              {favourites.length ? (
                <ul className="mini">
                  {favourites.map((id) => <li key={id}><code>{id}</code></li>)}
                </ul>
              ) : <p className="muted">No favourites yet</p>}
            </div>
          </section>

          <section className="panel collapsible">
  <button
    type="button"
    className="collapse-head"
    aria-expanded={showWritingP1}
    onClick={() => setShowWritingP1(s => !s)}
  >
    <h3 className="sec-title" style={{ margin: 0 }}>My Writing (Part 1)</h3>
    <span className="muted">
      {writingP1.length} {writingP1.length === 1 ? "session" : "sessions"}
    </span>
    <span className={`chev ${showWritingP1 ? "open" : ""}`} aria-hidden>▾</span>
  </button>

  {showWritingP1 && (
    <>
      {!writingP1.length ? (
        <p className="muted" style={{ marginTop: ".5rem" }}>No saved sessions yet.</p>
      ) : (
        <>
          <div className="actions" style={{ marginTop: ".5rem" }}>
            <button
              className="btn"
              onClick={() => {
                const text = writingP1
                  .map((s, idx) => {
                    const when = s.createdAt?.toDate ? s.createdAt.toDate().toLocaleString() : "—";
                    const lines = s.items
                      .map((it, i) => `${i + 1}. ${it.question} — ${it.answer || "(no answer)"}`)
                      .join("\n");
                    return `Session ${idx + 1} (${when})\n${lines}`;
                  })
                  .join("\n\n");
                navigator.clipboard.writeText(text).then(() => toast("Copied all sessions ✓"));
              }}
            >
              Copy all
            </button>
          </div>

          <ul className="wlist" style={{ marginTop: ".5rem" }}>
            {writingP1.map(s => (
              <li key={s.id} className="wcard">
                <div className="whead">
                  <div>
                    <strong>Session</strong>
                    <div className="muted small">
                      {s.createdAt?.toDate ? s.createdAt.toDate().toLocaleString() : "—"}
                    </div>
                  </div>
                  <div className="actions">
                    <button
                      className="btn"
                      onClick={() => {
                        const text = s.items
                          .map((it, i) => `${i + 1}. ${it.question} — ${it.answer || "(no answer)"}`)
                          .join("\n");
                        navigator.clipboard.writeText(text).then(() => toast("Copied session ✓"));
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <ol className="qa">
                  {s.items.map((it, i) => (
                    <li key={it.id || i}>
                      <div className="q">{i + 1}. {it.question}</div>
                      <div className="a">{it.answer || <em>(no answer)</em>}</div>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )}
</section>

<section className="panel collapsible" style={{ marginTop: "1rem" }}>
  <button
    type="button"
    className="collapse-head"
    aria-expanded={showGuideEdits}
    onClick={() => setShowGuideEdits(s => !s)}
  >
    <h3 className="sec-title" style={{ margin: 0 }}>My Guide (Part 1: FixOpen)</h3>
    <span className="muted">{guideEdits.length} {guideEdits.length === 1 ? "item" : "items"}</span>
    <span className={`chev ${showGuideEdits ? "open" : ""}`} aria-hidden>▾</span>
  </button>

  {showGuideEdits && (
    <>
      {!guideEdits.length ? (
        <p className="muted" style={{ marginTop: ".5rem" }}>No saved guide answers yet.</p>
      ) : (
        <>
          <div className="actions" style={{ marginTop: ".5rem" }}>
            <button
              className="btn"
              onClick={() => {
                const text = guideEdits.map((r, i) => {
                  const when =
                    r.createdAt?.toDate?.()
                      ? r.createdAt.toDate().toLocaleString()
                      : r.updatedAt?.toDate?.()
                      ? r.updatedAt.toDate().toLocaleString()
                      : "—";
                
                  return [
                    `Item ${i + 1} (${when})`,
                    `Q: ${r.prompt || "—"}`,
                    `Your answer: ${r.attempt || "(no answer)"}`,
                    r.original ? `Original: ${r.original}` : null,
                  ]
                    .filter(Boolean)
                    .join("\n");
                }).join("\n\n");                
                navigator.clipboard.writeText(text).then(() => toast("Copied guide items ✓"));
              }}
            >
              Copy all
            </button>
          </div>

          <ul className="wlist" style={{ marginTop: ".5rem" }}>
            {guideEdits.map((r, idx) => (
              <li key={r.id || idx} className="wcard">
                <div className="whead">
                  <div>
                    <strong>Item</strong>
                    <div className="muted small">
                      {(r.createdAt?.toDate?.() && r.createdAt.toDate().toLocaleString())
                        || (r.updatedAt?.toDate?.() && r.updatedAt.toDate().toLocaleString())
                        || "—"}
                    </div>
                  </div>
                  <div className="actions">
                    <button
                      className="btn"
                      onClick={() => {
                        const text = [
                          `Q: ${r.prompt || "—"}`,
                          `Your answer: ${r.attempt || "(no answer)"}`,
                          r.suggestion ? `Suggestion: ${r.suggestion}` : null,
                          r.original ? `Original: ${r.original}` : null,
                        ].filter(Boolean).join("\n");
                        navigator.clipboard.writeText(text).then(() => toast("Copied item ✓"));
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="qa" style={{ listStyle: "none", paddingLeft: 0 }}>
                  <div className="q"><strong>Q:</strong> {r.prompt || "—"}</div>
                  <div className="a"><strong>Your answer:</strong> {r.attempt || <em>(no answer)</em>}</div>
                  {r.original && (
                    <div className="a muted"><strong>Original:</strong> {r.original}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )}
</section>

{/* --- Writing Part 4 Guide: Register & Tone attempts --- */}
<section className="panel collapsible" style={{ marginTop: "1rem" }}>
  <button
    type="button"
    className="collapse-head"
    aria-expanded={showP4Register}
    onClick={() => setShowP4Register(s => !s)}
  >
    <h3 className="sec-title" style={{ margin: 0 }}>My Guide (Part 4: Register &amp; Tone)</h3>
    <span className="muted">
      {p4Register.length} {p4Register.length === 1 ? "item" : "items"}
    </span>
    <span className={`chev ${showP4Register ? "open" : ""}`} aria-hidden>▾</span>
  </button>

  {showP4Register && (
    <>
      {!p4Register.length ? (
        <p className="muted" style={{ marginTop: ".5rem" }}>No saved attempts yet.</p>
      ) : (
        <>
          <div className="actions" style={{ marginTop: ".5rem" }}>
            <button
              className="btn"
              onClick={() => {
                const text = p4Register.map((r, i) => {
                  const when =
                    r.createdAt?.toDate?.()
                      ? r.createdAt.toDate().toLocaleString()
                      : "—";
                  return [
                    `Item ${i + 1} (${when})`,
                    `Prompt: ${r.prompt || "—"}`,
                    `Original: ${r.original || "—"}`,
                    `Your answer: ${r.attempt || "(no answer)"}`,
                    r.model ? `Suggestion: ${r.model}` : null,
                  ].filter(Boolean).join("\n");
                }).join("\n\n");
                navigator.clipboard.writeText(text).then(() => toast("Copied register items ✓"));
              }}
            >
              Copy all
            </button>
          </div>

          <ul className="wlist" style={{ marginTop: ".5rem" }}>
            {p4Register.map((r, idx) => (
              <li key={r.id || idx} className="wcard">
                <div className="whead">
                  <div>
                    <strong>Item</strong>
                    <div className="muted small">
                      {(r.createdAt?.toDate?.() && r.createdAt.toDate().toLocaleString()) || "—"}
                    </div>
                  </div>
                  <div className="actions">
                    <button
                      className="btn"
                      onClick={() => {
                        const text = [
                          `Prompt: ${r.prompt || "—"}`,
                          `Original: ${r.original || "—"}`,
                          `Your answer: ${r.attempt || "(no answer)"}`,
                          r.model ? `Suggestion: ${r.model}` : null,
                        ].filter(Boolean).join("\n");
                        navigator.clipboard.writeText(text).then(() => toast("Copied item ✓"));
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="qa" style={{ listStyle: "none", paddingLeft: 0 }}>
                  <div className="q"><strong>Prompt:</strong> {r.prompt || "—"}</div>
                  <div className="a"><strong>Original:</strong> {r.original || "—"}</div>
                  <div className="a"><strong>Your answer:</strong> {r.attempt || <em>(no answer)</em>}</div>
                  {r.model && (
                    <div className="a muted"><strong>Suggestion:</strong> {r.model}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )}
</section>

{/* --- Writing Part 4 submissions --- */}
<section className="panel collapsible" style={{ marginTop: "1rem" }}>
  <button
    type="button"
    className="collapse-head"
    aria-expanded={showWritingP4}
    onClick={() => setShowWritingP4((s) => !s)}
  >
    <h3 className="sec-title" style={{ margin: 0 }}>My Writing (Part 4)</h3>
    <span className="muted">
      {writingP4.length} {writingP4.length === 1 ? "submission" : "submissions"}
    </span>
    <span className={`chev ${showWritingP4 ? "open" : ""}`} aria-hidden>▾</span>
  </button>

  {showWritingP4 && (
    <>
      {!writingP4.length ? (
        <p className="muted" style={{ marginTop: ".5rem" }}>
          No saved submissions yet.
        </p>
      ) : (
        <ul className="wlist" style={{ marginTop: ".5rem" }}>
          {writingP4.map((s, idx) => {
            const when =
              s.createdAt?.toDate?.()
                ? s.createdAt.toDate().toLocaleString()
                : s.createdAt || "—";
            return (
              <li key={s.id || idx} className="wcard">
                <div className="whead">
                  <div>
                    <strong>Submission</strong>
                    <div className="muted small">{when}</div>
                    {s.taskId && (
                      <div className="muted small">Task: {s.taskId}</div>
                    )}
                  </div>
                  <div className="actions">
                    <button
                      className="btn"
                      onClick={() => copySubmission(s)}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* PREVIEW (two-column layout) */}
                <div className="submitted-p4">
                  {/* Informal */}
                  <div className="p4-col">
                    <div className="p4-title">
                      Informal (~50 w) — {s.counts?.friend ?? 0} words
                    </div>
                    <div
                      className="submitted-html"
                      dangerouslySetInnerHTML={{
                        __html: normalizeHtmlForDisplay(
                          s.friendHTML,
                          s.friendText
                        ),
                      }}
                    />
                  </div>

                  {/* Formal */}
                  <div className="p4-col">
                    <div className="p4-title">
                      Formal (120–150 w) — {s.counts?.formal ?? 0} words
                    </div>
                    <div
                      className="submitted-html"
                      dangerouslySetInnerHTML={{
                        __html: normalizeHtmlForDisplay(
                          s.formalHTML,
                          s.formalText
                        ),
                      }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  )}
</section>



        </>
      )}
    </div>
  );
}

function StyleScope(){
  return (
    <style>{`
      .profile-page { --panel:#13213b; --ink:#e6f0ff; --muted:#a9b7d1; }
      .title{margin:0;font-size:1.6rem}
      .intro{color:var(--muted)}
      .muted{color:var(--muted)}
      .small{font-size:.9em}
      .cards{display:grid;grid-template-columns:1fr;gap:1rem;margin-bottom:1rem}
      @media(min-width:900px){.cards{grid-template-columns:repeat(4,1fr)}}
      .card{background:#13213b;border:1px solid #2c4b83;border-radius:12px;padding:1rem;color:var(--ink)}
      .panel{background:#13213b;border:1px solid #2c4b83;border-radius:12px;padding:1rem;color:var(--ink)}
      .mini{margin:.25rem 0 0;padding-left:1.1rem}
      .wlist{list-style:none;padding:0;margin:0;display:grid;gap:1rem}
      .wcard{background:#0f1b31;border:1px solid #2c416f;border-radius:12px;padding:.75rem}
      .whead{display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem}
      .qa{margin:.25rem 0 0;padding-left:1.1rem;display:grid;gap:.35rem}
      .q{color:#cfe1ff}
      .a{color:#e6f0ff}
      .btn{background:#24365d;border:1px solid #335086;color:#e6f0ff;padding:.35rem .6rem;border-radius:10px;cursor:pointer}
      .pbar-group{ display:grid; gap:.6rem; }
.pbar{ display:grid; gap:.25rem; }
.pbar-track{ height:10px; background:#0f1b31; border:1px solid #2c416f; border-radius:999px; overflow:hidden; }
.pbar-fill{ height:100%; background:#3a6ebd; }
.pbar-meta{ display:flex; justify-content:space-between; align-items:center; font-size:.95em; }
.pbar-label{ color:#cfe1ff; }
.pbar-count{ color:#e6f0ff; font-variant-numeric: tabular-nums; }
.progress-block {
  margin-bottom: 1rem; /* more space between parts */
}

.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.35rem;
  font-weight: 500;
}

.progress-wrap {
  height: 8px;
  background: #24365d;
  border-radius: 999px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  background: linear-gradient(90deg, #3a6ebd, #5b8ff2);
  height: 100%;
  transition: width 0.4s ease;
}
  /* Collapsible panel */
.collapsible .collapse-head{
  display:flex; align-items:center; gap:.75rem;
  justify-content:space-between; width:100%;
  background:transparent; border:0; color:var(--ink);
  cursor:pointer; padding:0;
}
.collapsible .chev{
  margin-left:.25rem; transition: transform .2s ease;
  font-size:1.1em; line-height:1;
}
.collapsible .chev.open{ transform: rotate(180deg); }
.pb .row{display:flex;justify-content:space-between;align-items:center;margin-bottom:.25rem}
.pb .lbl{color:#cfe1ff}
.pb .val{color:#cfe1ff;opacity:.9}
.pb .track{height:.6rem;border-radius:999px;background:#0f1b31;border:1px solid #2c416f;overflow:hidden}
.pb .fill{height:100%; width:0%; background:#4a79d8}

.avatar-row{
  display:flex; align-items:center; gap:.75rem;
  margin: .5rem 0 1rem;
}
.avatar{
  height:80px; width:80px; border-radius:999px;
  overflow:hidden; border:1px solid #2c4b83; background:#0f1b31;
  display:grid; place-items:center;
}
.avatar-img{ width:100%; height:100%; object-fit:cover; }
.avatar-fallback{
  color:#e6f0ff; font-weight:700; font-size:1.2rem; opacity:.85;
}
.avatar-btn{
  background:#24365d; border:1px solid #335086; color:#e6f0ff;
  padding:.45rem .7rem; border-radius:10px; cursor:pointer;
}
  /* Part 4 preview layout */
.submitted-p4{
  display:grid; grid-template-columns:1fr; gap:.8rem; margin-top:.5rem;
}
@media(min-width:900px){
  .submitted-p4{ grid-template-columns: 1fr 1fr; }
}
.p4-col .p4-title{
  font-weight:700; margin-bottom:.35rem; color:#cfe1ff;
}

/* Keep HTML spacing and LTR rendering */
.submitted-html {
  white-space: pre-wrap;      /* keep any literal \n we inject (inside text nodes) */
  direction: ltr;
  unicode-bidi: plaintext;
  background:#0a1528;
  border:1px solid #223a68;
  border-radius:10px;
  padding:.65rem;
  line-height:1.6;
  color:#e6f0ff;
}
.submitted-html p, .submitted-html div { margin: 0 0 1rem; }
.submitted-html p:last-child, .submitted-html div:last-child { margin-bottom: 0; }


    `}</style>
  );
}

function ProgressBar({ label, value, max, right }) {
    const pct = Math.min(100, Math.round((value / (max || 1)) * 100));
    return (
      <div className="pb">
        <div className="row">
          <span className="lbl">{label}</span>
          <span className="val">{right}</span>
        </div>
        <div className="track"><div className="fill" style={{ width: `${pct}%` }} /></div>
      </div>
    );
  }

  // ADD — tiny helpers for Profile page
function stripHtml(html = "") {
  const el = document.createElement("div");
  el.innerHTML = html;
  return el.innerText.replace(/\s+/g, " ").trim();
}

function escHtml(txt = "") {
  // If we only have plain text, turn it into safe HTML (line breaks -> <br>)
  const safe = (txt + "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return safe.replace(/\n/g, "<br/>");
}

// Detects if the string already contains HTML-ish tags.
function looksLikeHtml(s = "") {
  return /<([a-z][\w:-]*)\b[^>]*>/i.test(s);
}

// Turn plain text into HTML paragraphs, preserving single line breaks.
function textToHtml(txt = "") {
  // strip any LRM at start so it doesn't create a weird first character
  const clean = (txt + "").replace(/^\u200E+/, "");
  const safe = clean
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // split on blank lines => paragraphs; inside each paragraph, single \n => <br>
  const paras = safe.split(/\n{2,}/).map(p => p.replace(/\n/g, "<br/>"));
  return `<p>${paras.join("</p><p>")}</p>`;
}

// Use friendHTML/formalHTML if it looks like HTML; otherwise fallback to the text.
function normalizeHtmlForDisplay(html, text) {
  if (html && looksLikeHtml(html)) {
    // also remove leading LRM if present
    return html.replace(/^\u200E+/, "");
  }
  // No HTML saved? Build HTML from the plain text we stored.
  return textToHtml(text || "");
}

// --- tiny clipboard helper (HTML + plain text) ---
async function copyHtmlWithFallback({ html = "", text = "" }) {
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const item = new window.ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" }),
      });
      await navigator.clipboard.write([item]);
    } else {
      // fallback: plain text
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    toast("Copied ✓");
  } catch (e) {
    console.warn("[Profile] copy failed", e);
    toast("Copy failed — select and copy manually.");
  }
}

// optional mini button component for reuse
function CopyBtn({ html, text, className = "" }) {
  return (
    <button
      type="button"
      className={`btn ${className}`}
      onClick={() => copyHtmlWithFallback({ html: html || "", text: text || "" })}
      title="Copy with formatting"
    >
      Copy
    </button>
  );
}

// Build plain-text summary for fallback
function buildSubmissionText(s) {
  const when =
    s.createdAt?.toDate?.()
      ? s.createdAt.toDate().toLocaleString()
      : s.createdAt || "—";

  const friendPlain = plainFromEmail({ html: s.friendHTML, text: s.friendText }) || "(empty)";
  const formalPlain = plainFromEmail({ html: s.formalHTML, text: s.formalText }) || "(empty)";

  return [
    `Aptis Writing – Part 4`,
    `Task: ${s.taskId || "—"}`,
    `${when}`,
    ``,
    `— Informal (~50 words) —`,
    friendPlain,
    ``,
    `— Formal (120–150 words) —`,
    formalPlain,
    ``,
    `Word counts: friend ${s.counts?.friend ?? "—"}, formal ${s.counts?.formal ?? "—"}`,
  ].join("\n");
}

// Build HTML summary that embeds the real email HTML (keeps formatting)
function buildSubmissionHtml(s) {
  const when =
    s.createdAt?.toDate?.()
      ? s.createdAt.toDate().toLocaleString()
      : s.createdAt || "—";

  const friend = robustEmailForClipboard({ html: s.friendHTML, text: s.friendText });
  const formal = robustEmailForClipboard({ html: s.formalHTML, text: s.formalText });

  return `
    <div>
      <h3 style="margin:0 0 .4rem 0;">Aptis Writing – Part 4</h3>
      <p style="margin:.25rem 0;"><strong>Task:</strong> ${s.taskId || "—"}</p>
      <p style="margin:.25rem 0;"><em>${when}</em></p>

      <h4 style="margin:.8rem 0 .35rem 0;">— Informal (~50 words) —</h4>
      ${friend}

      <h4 style="margin:.8rem 0 .35rem 0;">— Formal (120–150 words) —</h4>
      ${formal}

      <p style="margin:.8rem 0 0 0;"><em>Word counts: friend ${s.counts?.friend ?? "—"}, formal ${s.counts?.formal ?? "—"}</em></p>
    </div>
  `;
}


// Copy both text/html and text/plain
async function copySubmission(s) {
  try {
    const html = buildSubmissionHtml(s);
    const text = buildSubmissionText(s);

    if (navigator.clipboard && window.ClipboardItem) {
      const item = new window.ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" }),
      });
      await navigator.clipboard.write([item]);
    } else {
      // Fallback: plain text
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    toast("Copied submission ✓");
  } catch (e) {
    console.warn("[Profile] copy failed", e);
    toast("Copy failed — select and copy manually.");
  }
}

// Convert editor HTML (div/br soup) into solid <p> blocks for clipboard/Word
function normalizeEmailHtmlForClipboard(html = "") {
  let s = (html || "").replace(/^\u200E+/, ""); // strip any leading LRM

  // 1) Convert top-level <div>…</div> blocks into <p>…</p>
  s = s.replace(/<div\b[^>]*>/gi, "<p>").replace(/<\/div>/gi, "</p>");

  // 2) Turn empty lines into visible blank paragraphs
  s = s
    .replace(/<p>\s*(?:<br\s*\/?>\s*)*<\/p>/gi, "<p>&nbsp;</p>") // empty p → nbsp
    .replace(/(?:<br\s*\/?>\s*){2,}/gi, "</p><p>"); // double <br> → new <p>

  // 3) If there are still no block tags (rare), wrap lines into <p>
  if (!/<p\b|<ul\b|<ol\b|<table\b/i.test(s)) {
    const lines = s.split(/<br\s*\/?>/i).map(x => x.trim() || "&nbsp;");
    s = "<p>" + lines.join("</p><p>") + "</p>";
  }

  // 4) Some editors end with a trailing <br> that Word ignores; force a final block
  s = s.replace(/(<br\s*\/?>\s*)+<\/p>$/i, "</p><p>&nbsp;</p>");

  return s;
}

// Prefer saved plain text; otherwise derive from HTML, preserving line breaks.
function plainFromEmail({ html = "", text = "" }) {
  // If we have HTML, convert it to plain text *with paragraph breaks*.
  if (html && /<([a-z][\w:-]*)\b[^>]*>/i.test(html)) {
    let s = html;

    // normalise block boundaries into line breaks
    s = s
      // end of paragraphs/divs → blank line (new paragraph)
      .replace(/<\/p\s*>/gi, "\n\n")
      .replace(/<\/div\s*>/gi, "\n\n")
      // explicit line break
      .replace(/<br\s*\/?>/gi, "\n")
      // headings/other blocks -> also end a block
      .replace(/<\/h[1-6]\s*>/gi, "\n\n")
      // strip remaining tags
      .replace(/<[^>]+>/g, "")
      // normalise CRLF
      .replace(/\r\n/g, "\n");

    // collapse 3+ newlines → just a blank line, trim end
    s = s.replace(/\n{3,}/g, "\n\n").trimEnd();
    return s;
  }

  // Fallback to editor text if no HTML is available.
  return (text || "").replace(/\r\n/g, "\n");
}

function htmlFromPlainEmail(text = "") {
  const lines = (text || "").replace(/\r\n/g, "\n").split("\n");
  const paras = [];
  let buf = [];

  const flush = () => {
    const joined = buf.join(" ").trim();
    paras.push(joined.length ? escHtml(joined) : "&nbsp;"); // keep empty paragraph
    buf = [];
  };

  for (const ln of lines) {
    if (ln.trim() === "") flush(); else buf.push(ln.trim());
  }
  flush();

  return "<p>" + paras.join("</p><p>") + "</p>";
}

function robustEmailForClipboard({ html = "", text = "" }) {
  // Build <p>-only HTML from the plain text we just derived from HTML.
  const plain = plainFromEmail({ html, text });
  return htmlFromPlainEmail(plain);
}


  