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
        ] = await Promise.all([
          fb.fetchReadingProgressCount(),
          fb.fetchSpeakingCounts(),
          fb.fetchRecentMistakes(8),
          fb.fetchRecentFavourites(8),
          fb.fetchWritingP1Sessions(10),
          fb.fetchGrammarDashboard(),   // ← this resolves to gDash
        ]);
  
        if (!alive) return;
        setReadingCount(rCount);
        setSpeakingCounts(sCounts);
        setMistakes(m);
        setFavourites(f);
        setWritingP1(w);
        setGrammarDash(gDash);          // ← use gDash here
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
  
  