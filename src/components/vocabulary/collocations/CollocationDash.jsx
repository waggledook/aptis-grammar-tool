// src/components/vocabulary/collocations/CollocationDash.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { COLLOCATION_BANK, VERBS } from "../data/collocationBank";
import { useTickSound } from "../../../hooks/useTickSound";
import { saveCollocationDashScore, fetchTopCollocationDashScores } from "../../../firebase";

import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../../firebase"; // <-- adjust path to where your firebase.js export is



// If you already have logActivity in src/firebase.js, you can wire it in:
// import { logActivity } from "../../../firebase";

function pickRoundItems({ perRound = 5 }) {
  // Flatten bank into items with correctVerb
  const all = [];
  for (const verb of VERBS) {
    for (const item of COLLOCATION_BANK[verb] || []) {
      all.push({
        correctVerb: verb,
        phrase: item.phrase,
        hint: item.hint || "",
        definition: item.definition || "",
        example: item.example || "",
        es: item.es || "",
      });
    }
  }

  // Shuffle and take N unique phrases (bank already mostly unique, but we enforce)
  const shuffled = all
    .map((x) => ({ x, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(({ x }) => x);

  const seen = new Set();
  const out = [];
  for (const it of shuffled) {
    if (seen.has(it.phrase)) continue;
    seen.add(it.phrase);
    out.push(it);
    if (out.length === perRound) break;
  }
  return out;
}

export default function CollocationDash({ user, onRequireSignIn }) {
  const [status, setStatus] = useState("idle"); // idle | playing | review | over
  const [round, setRound] = useState(1);
  const [roundTime, setRoundTime] = useState(40);
  const [timeLeft, setTimeLeft] = useState(40);
  const [score, setScore] = useState(0);

  const [items, setItems] = useState(() => pickRoundItems({ perRound: 5 }));
  const [selectedPhrase, setSelectedPhrase] = useState(null);
const [selectedVerb, setSelectedVerb] = useState(null);
  const [feedback, setFeedback] = useState(null); // { kind, text }
  const [wrongAnswers, setWrongAnswers] = useState([]); // { phrase, selectedVerb, correctVerb }

  const [expandedKey, setExpandedKey] = useState(null);
const [showSpanish, setShowSpanish] = useState(false);

const mistakeKey = (w) => `${w.correctVerb}__${w.phrase}`;

const [reviewQueue, setReviewQueue] = useState([]); // unique items to review
const [reviewIndex, setReviewIndex] = useState(0);
const [reviewFeedback, setReviewFeedback] = useState(null); // ok/bad message
const [reviewScore, setReviewScore] = useState(0); // optional separate score

  // 🔊 Sound controls
const [soundVolume, setSoundVolume] = useState(0.9); // 0–1
const [soundMuted, setSoundMuted] = useState(false);
const nextRef = useRef(null);
const finishRef = useRef(null);
const timeUpRef = useRef(null);

const [topScores, setTopScores] = useState([]);

const [leaderboard, setLeaderboard] = useState([]); // top 10
const savedScoreRef = useRef(false);

// Tick refs + play function
const { tickRef, tickFastRef, playTick } = useTickSound();

  const intervalRef = useRef(null);

  const remainingCount = useMemo(() => items.length, [items]);

  const start = () => {
    savedScoreRef.current = false; // ✅ allow saving again for the new run

    // Optional: gate by sign-in if you want (your old game didn’t)
    // If you want this gated:
    // if (!user) { onRequireSignIn?.(); return; }

    setStatus("playing");
    setRound(1);
    setRoundTime(40);
    setTimeLeft(40);
    setScore(0);
    setWrongAnswers([]);
    setFeedback(null);
    setSelectedPhrase(null);
setSelectedVerb(null);
    setItems(pickRoundItems({ perRound: 5 }));

    // logActivity?.("vocab_collocations_dash_started", { uid: user?.uid ?? null });
  };

  const saveLeaderboardScore = async (finalScore) => {
    if (!user?.uid) return;      // only signed in
    if (finalScore <= 0) return; // optional: don’t save 0/negative
  
    await addDoc(collection(db, "leaderboards", "collocation_dash", "scores"), {
      uid: user.uid,
      score: finalScore,
      createdAt: serverTimestamp(),
      displayName: user.displayName || user.email || "User",
    });
  };
  

  const loadLeaderboard = async () => {
    const q = query(
      collection(db, "leaderboards", "collocation_dash", "scores"),
      orderBy("score", "desc"),
      limit(10)
    );
  
    const snap = await getDocs(q);
    setLeaderboard(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };
  

  
  const restart = () => {
    stopTimer();
    savedScoreRef.current = false; // optional (start() already does it)
    setStatus("idle");
    start();
  };

  const playNext = () => {
    try {
      if (!nextRef.current) return;
      nextRef.current.currentTime = 0;
      nextRef.current.play();
    } catch {}
  };
  
  const playFinish = () => {
    try {
      if (!finishRef.current) return;
      finishRef.current.currentTime = 0;
      finishRef.current.play();
    } catch {}
  };
  
  const playTimeUp = () => {
    try {
      if (!timeUpRef.current) return;
      timeUpRef.current.currentTime = 0;
      timeUpRef.current.play();
    } catch {}
  };
  

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const endGame = () => {
    stopTimer();
    setFeedback(null);
    setSelectedPhrase(null);
setSelectedVerb(null);
  
    // ✅ Save ONCE per run (signed-in only)
    if (user?.uid && !savedScoreRef.current) {
      savedScoreRef.current = true;
  
      // personal top scores
      saveCollocationDashScore(score).catch((e) =>
        console.error("[CollocationDash] save score failed:", e)
      );
  
      // global leaderboard + refresh
      saveLeaderboardScore(score)
        .then(loadLeaderboard)
        .catch((e) => console.error("[CollocationDash] leaderboard save failed:", e));
    }
  
    const q = buildUniqueReviewQueue(wrongAnswers);
  
    if (q.length > 0) {
      setReviewQueue(q);
      setReviewIndex(0);
      setReviewFeedback(null);
      setReviewScore(0);
      setStatus("review");
    } else {
      setStatus("over");
    }
  };
  

  const nextRound = () => {
    stopTimer();
    const next = round + 1;
    const nextTime = Math.max(5, roundTime - 1);

    setRound(next);
    setRoundTime(nextTime);
    setTimeLeft(nextTime);
    setItems(pickRoundItems({ perRound: 5 }));
    setSelectedPhrase(null);
setSelectedVerb(null);
    setFeedback(null);
  };

  useEffect(() => {
    if (status !== "playing") return;

    stopTimer();
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          playTimeUp();
          setTimeout(() => endGame(), 0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, round, roundTime]);

  useEffect(() => {
    if (status !== "over") return;
    if (!user?.uid) {
      setTopScores([]);
      return;
    }
  
    fetchTopCollocationDashScores(3, user.uid)
      .then(setTopScores)
      .catch((e) => console.error("[CollocationDash] fetch top scores failed:", e));
  }, [status, user?.uid]);
  

  useEffect(() => {
    const vol = soundMuted ? 0 : soundVolume;
  
    [tickRef, tickFastRef, nextRef, finishRef, timeUpRef].forEach((r) => {
      if (r.current) {
        r.current.volume = vol;
        r.current.muted = soundMuted; // optional but nice to keep in sync
      }
    });
  }, [soundVolume, soundMuted, tickRef, tickFastRef]);

  useEffect(() => {
    if (status !== "playing") return;
    if (timeLeft == null) return;
    if (timeLeft <= 0) return;
  
    // Fast tick for last 3 seconds
    const isFast = timeLeft <= 5;
    playTick(isFast);
  }, [timeLeft, status, playTick]);

  useEffect(() => {
    if (status !== "over") return;
    loadLeaderboard().catch((e) =>
      console.error("[CollocationDash] load leaderboard failed:", e)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
  
  
  // When the player clears the round, advance automatically (with "next" sound)
useEffect(() => {
  if (status !== "playing") return;

  if (items.length === 0) {
    playNext();
    const t = setTimeout(() => nextRound(), 200);
    return () => clearTimeout(t);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [items.length, status]);

const submitMatch = (verb, phrase) => {
  if (status !== "playing") return;
  if (!verb || !phrase) return;

  const selectedItem = items.find((it) => it.phrase === phrase);
  if (!selectedItem) return;

  const correct = selectedItem.correctVerb === verb;

  if (correct) {
    setScore((s) => s + 10);
    setItems((prev) => prev.filter((it) => it.phrase !== phrase));
    setFeedback({ kind: "ok", text: "Correct." });

    setSelectedPhrase(null);
    setSelectedVerb(null);

    setTimeout(() => setFeedback(null), 800);
  } else {
    setScore((s) => s - 5);
    setFeedback({ kind: "bad", text: "Try again." });

    setTimeout(() => setFeedback(null), 800);

    setWrongAnswers((prev) => {
      const exists = prev.some(
        (x) => x.phrase === selectedItem.phrase && x.selectedVerb === verb
      );
      if (exists) return prev;
      return [
        ...prev,
        {
          phrase: selectedItem.phrase,
          selectedVerb: verb,
          correctVerb: selectedItem.correctVerb,
        },
      ];
    });

    // optional: keep phrase selected but clear verb (or clear both)
    setSelectedVerb(null);
  }
};


  function buildUniqueReviewQueue(wrongAnswers) {
    const map = new Map();
    for (const w of wrongAnswers) {
      // Unique key = the correct collocation itself (NOT the wrong attempt)
      const key = `${w.correctVerb}__${w.phrase}`;
      if (!map.has(key)) {
        map.set(key, w);
      }
    }
    return Array.from(map.values());
  }
  
  return (
    <div className="game-wrapper">

      {/* 🔊 Tick sounds (hidden audio elements) */}
    <audio ref={tickRef} src="/sounds/tick.mp3" preload="auto" />
    <audio ref={tickFastRef} src="/sounds/tick_fast.mp3" preload="auto" />
    <audio ref={nextRef} src="/sounds/next.mp3" preload="auto" />
<audio ref={finishRef} src="/sounds/finish.mp3" preload="auto" />
<audio ref={timeUpRef} src="/sounds/time_up.mp3" preload="auto" />


      <div className="game-container" style={{ maxWidth: 920 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0 }}>Collocation Dash</h1>
            <p style={{ marginTop: 6, opacity: 0.85 }}>
              Select a phrase, then choose the verb it collocates with.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div><strong>Round:</strong> {round}</div>
            <div><strong>Time:</strong> {timeLeft}s</div>
            <div><strong>Score:</strong> {score}</div>

            <div className="cd-sound">
  <span className="cd-sound-label">Sound:</span>

  <input
    type="range"
    min={0}
    max={100}
    value={Math.round(soundVolume * 100)}
    onChange={(e) => setSoundVolume(Number(e.target.value) / 100)}
  />

  <button
    type="button"
    className="cd-sound-btn"
    onClick={() => setSoundMuted((m) => !m)}
  >
    {soundMuted ? "🔇 Muted" : "🔊 On"}
  </button>
</div>

          </div>
        </div>

        {status === "idle" && (
          <div style={{ marginTop: 16 }}>
            <div style={{ opacity: 0.9, lineHeight: 1.5 }}>
              <ul style={{ marginTop: 8 }}>
                <li>+10 points for a correct match</li>
                <li>−5 points for an incorrect match</li>
                <li>Each round gets 1 second faster (minimum 5s)</li>
              </ul>
            </div>

            {!user && (
  <div className="auth-nudge" style={{ marginTop: 14, marginBottom: 12 }}>
    <p className="auth-nudge-text" style={{ margin: 0 }}>
      Want to <strong>save your scores</strong> and compete with others?
      <br />
      <strong>Sign in or create a free account.</strong>
    </p>

    <button
      type="button"
      className="topbar-btn"
      onClick={() => onRequireSignIn?.()}
      style={{ marginLeft: "auto" }}
    >
      Sign in / Sign up
    </button>
  </div>
)}


            <button className="review-btn" onClick={start}>
              Start
            </button>
          </div>
        )}

        {status === "playing" && (
          <>
            <div
  className={`cd-feedback ${feedback ? "show" : ""} ${feedback?.kind ? `is-${feedback.kind}` : ""}`}
  aria-live="polite"
>
  <strong>{feedback?.text || "\u00A0"}</strong>
</div>

            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
              {VERBS.map((v) => (
                <button
                key={v}
                type="button"
                onClick={() => {
                  if (selectedPhrase) submitMatch(v, selectedPhrase);
                  else setSelectedVerb(v);
                }}
                className={`cd-verb-btn ${selectedVerb === v ? "is-selected" : ""}`}
                title={
                  selectedPhrase
                    ? `Submit: ${v} + ${selectedPhrase}`
                    : `Select a phrase to match with "${v}"`
                }
              >
                {v}
              </button>
              ))}
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ opacity: 0.8, marginBottom: 8 }}>
                Select one:
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                {items.map((it) => {
                  const active = selectedPhrase === it.phrase;
                  return (
                    <button
  key={it.phrase}
  type="button"
  onClick={() => {
    if (selectedVerb) submitMatch(selectedVerb, it.phrase);
    else setSelectedPhrase(it.phrase);
  }}
  className={`cd-phrase-btn ${active ? "active" : ""}`}
>
                      <div style={{ fontWeight: 700 }}>{it.phrase}</div>
                      {it.hint ? (
    <div className="cd-hint">{it.hint}</div>
  ) : (
    <div className="cd-hint"> </div>
  )}
</button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
  <button className="review-btn" onClick={restart}>Restart</button>
  <button
    className="review-btn"
    onClick={endGame}
    style={{ borderColor: "rgba(255,70,70,0.45)" }}
  >
    End game
  </button>
</div>
          </>
        )}

{status === "review" && (
  <div style={{ marginTop: 16 }}>
    <h2 style={{ marginTop: 0 }}>Review mistakes</h2>

    <p style={{ opacity: 0.9 }}>
      Item {reviewIndex + 1} of {reviewQueue.length}
      {reviewScore !== null ? (
        <> • <strong>Review score:</strong> {reviewScore}</>
      ) : null}
    </p>

    {(() => {
      const current = reviewQueue[reviewIndex];
      if (!current) return null;

      return (
        <div className="cd-review-card">
          <div className="cd-review-phrase">
            <strong>{current.phrase}</strong>
            {current.hint ? <div className="cd-review-hint">{current.hint}</div> : null}
          </div>

          <div className="cd-review-prompt">Which verb collocates?</div>

          <div className="cd-review-verbs">
  {VERBS.map((v) => (
    <button
      key={v}
      type="button"
      className="cd-verb-btn cd-review-verb"
      disabled={!!reviewFeedback}
      onClick={() => {
        const current = reviewQueue[reviewIndex];
        if (!current) return;

        const correct = v === current.correctVerb;

        if (correct) {
          setReviewFeedback({ kind: "ok", text: "Correct ✅" });
          setReviewScore((s) => s + 1);
        } else {
          setReviewFeedback({
            kind: "bad",
            text: `Not quite — it’s "${current.correctVerb} ${current.phrase}".`,
          });
        }

        setTimeout(() => {
          setReviewFeedback(null);

          const next = reviewIndex + 1;
          if (next >= reviewQueue.length) {
            playFinish?.(); // optional (see note below)
            setStatus("over");
          } else {
            setReviewIndex(next);
          }
        }, 900);
      }}
    >
      {v}
    </button>
  ))}
</div>

<div className="cd-review-actions">
  <button
    type="button"
    className="review-btn"
    onClick={() => {
      playFinish?.(); // optional
      setStatus("over");
    }}
  >
    Skip review
  </button>
</div>


          {reviewFeedback && (
            <div
              className={`cd-review-feedback ${reviewFeedback.kind}`}
              style={{ marginTop: 10 }}
            >
              <strong>{reviewFeedback.text}</strong>
            </div>
          )}
        </div>
      );
    })()}
  </div>
)}

        {status === "over" && (
          <div style={{ marginTop: 16 }}>
            <h2 style={{ marginTop: 0 }}>Game over</h2>
            <p style={{ opacity: 0.9 }}>
              Final score: <strong>{score}</strong>
            </p>
            {wrongAnswers.length > 0 ? (
              <>
                <h3>Mistakes to review</h3>
                <p className="cd-mistakes-hint">
  Tip: click a mistake to see the definition, an example, and Spanish 🇪🇸
</p>
                <div style={{ display: "grid", gap: 8 }}>
                {wrongAnswers.slice().reverse().map((w, idx) => {
  const key = mistakeKey(w);
  const isOpen = expandedKey === key;

  return (
    <div key={`${key}-${w.selectedVerb}-${idx}`} className="cd-mistake-wrap">
      <button
  type="button"
  className="cd-mistake-card"
  onClick={() => {
    setExpandedKey((prev) => (prev === key ? null : key));
    setShowSpanish(false);
  }}
  aria-expanded={isOpen}
>
  <div className="cd-mistake-line">
    <span>
      You chose <strong>{w.selectedVerb} {w.phrase}</strong>. Correct:{" "}
      <strong>{w.correctVerb} {w.phrase}</strong>.
    </span>

    <span className="cd-details-cue" aria-hidden="true">
      Details <span className={`cd-caret ${isOpen ? "open" : ""}`}>▾</span>
    </span>
  </div>
</button>

      {isOpen && (
        <div className="cd-mistake-expand">
          <div className="cd-expand-title">
            <strong>{w.correctVerb} {w.phrase}</strong>
            {w.hint ? <span className="cd-expand-hint"> — {w.hint}</span> : null}
          </div>

          <div className="cd-expand-row">
            <div className="cd-expand-label">Definition</div>
            <div className="cd-expand-text">{w.definition || "—"}</div>
          </div>

          <div className="cd-expand-row">
            <div className="cd-expand-label">Example</div>
            <div className="cd-expand-text">{w.example || "—"}</div>
          </div>

          <div className="cd-expand-actions">
            <button
              type="button"
              className="cd-flag-btn"
              onClick={() => setShowSpanish((s) => !s)}
              title="Show Spanish equivalent"
            >
              🇪🇸 Spanish
            </button>
          </div>

          {showSpanish && (
            <div className="cd-modal-es">
              {w.es || "—"}
            </div>
          )}
        </div>
      )}
    </div>
  );
})}
                </div>
              </>
            ) : (
              <p style={{ opacity: 0.9 }}>No mistakes recorded. Nice.</p>
            )}

            {/* 🔐 Nudge unsigned-in users to sign in (game over) */}
{!user?.uid && (
  <div className="auth-nudge" style={{ marginTop: 12 }}>
    <p className="auth-nudge-text">
      Want to save your scores and compete with others?
      <br />
      <strong>Sign in or create a free account.</strong>
    </p>
    <button
      type="button"
      className="topbar-btn"
      onClick={() => onRequireSignIn?.()}
    >
      Sign in / Sign up
    </button>
  </div>
)}
            {user?.uid ? (
      <div className="cd-top-scores" style={{ marginTop: 12 }}>
        <h3 style={{ marginBottom: 8 }}>Your top scores</h3>
        {topScores.length ? (
  <div className="cd-top-scores-list">
    {topScores.map((s, idx) => {
      const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉";
      const label = idx === 0 ? "Best" : idx === 1 ? "2nd best" : "3rd best";

      return (
        <div key={s.id} className="cd-top-score-row">
          <div className="cd-top-score-rank">
            <span className="cd-top-score-medal">{medal}</span>
            <span className="cd-top-score-label">{label}</span>
          </div>

          <div className="cd-top-score-value">{s.score}</div>
        </div>
      );
    })}
  </div>
) : (
  <p style={{ opacity: 0.85, margin: 0 }}>No saved scores yet.</p>
)}

        <p style={{ opacity: 0.75, marginTop: 8, marginBottom: 0 }}>
          (Scores are saved only when you’re signed in.)
        </p>
      </div>
    ) : (
      <p style={{ opacity: 0.85 }}>
        Sign in to save your scores and see your top 3.
      </p>
    )}

    {/* 👇 PASTE GLOBAL TOP 10 LEADERBOARD HERE */}
    <div className="cd-leaderboard" style={{ marginTop: 16 }}>
  <div className="cd-leaderboard-head">
    <h3 style={{ margin: 0 }}>Top 10 (global)</h3>
    <span className="cd-leaderboard-sub">All-time</span>
  </div>

  {!user?.uid ? (
    <p style={{ opacity: 0.85, margin: 0 }}>
      Sign in to appear on the leaderboard.
    </p>
  ) : leaderboard.length ? (
    <div className="cd-leaderboard-table" role="table" aria-label="Global leaderboard">
      <div className="cd-lb-row cd-lb-header" role="row">
        <div className="cd-lb-rank" role="columnheader">#</div>
        <div className="cd-lb-name" role="columnheader">Player</div>
        <div className="cd-lb-score" role="columnheader">Score</div>
      </div>

      {leaderboard.map((s, idx) => {
        const isMe = s.uid === user.uid;
        return (
          <div
            key={s.id}
            className={`cd-lb-row ${isMe ? "is-me" : ""}`}
            role="row"
            title={isMe ? "That’s you" : undefined}
          >
            <div className="cd-lb-rank" role="cell">
              {idx + 1}
            </div>
            <div className="cd-lb-name" role="cell">
              <span className="cd-lb-name-text">{s.displayName || "User"}</span>
              {isMe && <span className="cd-lb-me">you</span>}
            </div>
            <div className="cd-lb-score" role="cell">
              {s.score}
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <p style={{ opacity: 0.85, margin: 0 }}>No leaderboard scores yet.</p>
  )}
</div>


            

            <div style={{ marginTop: 16 }}>
              <button className="review-btn" onClick={restart}>Play again</button>
            </div>
          </div>
        )}

      {/* Collocation Dash scoped styles */}
      <style>{`
          .cd-feedback {
            min-height: 52px;
            margin-top: 12px;
            margin-bottom: 14px;
            padding: 10px 12px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.15);
            background: rgba(255,255,255,0.06);
            opacity: 0;
            transform: translateY(-4px);
            transition: opacity 120ms ease, transform 120ms ease;
            display: flex;
            align-items: center;
            font-weight: 800;
          }

          .cd-feedback.show {
            opacity: 1;
            transform: translateY(0);
          }

          .cd-verb-btn {
            padding: 16px 12px;
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.18);
            background: rgba(255,255,255,0.08);
            color: #e6f0ff;
            font-weight: 800;
            font-size: 1.05rem;
            letter-spacing: 0.2px;
            cursor: pointer;
            transition: transform 80ms ease, box-shadow 80ms ease, border-color 80ms ease, background 80ms ease;
          }

          .cd-verb-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 22px rgba(0,0,0,0.25);
            border-color: rgba(255,255,255,0.28);
          }

          .cd-verb-btn:disabled {
            cursor: not-allowed;
            opacity: 0.55;
            transform: none;
            box-shadow: none;
          }

          .cd-phrase-btn {
            text-align: left;
            padding: 12px 12px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.15);
            background: rgba(255,255,255,0.05);
            color: #e6f0ff;
            cursor: pointer;
            transition: transform 80ms ease, box-shadow 80ms ease, border-color 80ms ease, background 80ms ease;
          }

          .cd-phrase-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 22px rgba(0,0,0,0.25);
            border-color: rgba(255,255,255,0.28);
          }

          .cd-phrase-btn.active {
            border-color: rgba(110,180,255,0.95);
            background: rgba(110,180,255,0.14);
            box-shadow: 0 0 0 3px rgba(110,180,255,0.25);
          }
          .cd-feedback.is-ok {
  background: rgba(0,200,120,0.15);
}

.cd-feedback.is-bad {
  background: rgba(255,70,70,0.15);
}
.cd-phrase-btn {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.18);
}

.cd-phrase-btn div {
  color: inherit;
}

.cd-hint {
  color: rgba(230,240,255,0.72);
  font-size: 12px;
  margin-top: 4px;
}

.cd-sound {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.06);
}

.cd-sound-label {
  font-size: 0.85rem;
  opacity: 0.85;
  font-weight: 700;
}

.cd-sound input[type="range"] {
  width: 120px;
}

.cd-sound-btn {
  border-radius: 999px;
  padding: 6px 10px;
  border: 1px solid rgba(255,255,255,0.18);
  background: rgba(255,255,255,0.08);
  color: #e6f0ff;
  font-weight: 800;
  cursor: pointer;
}

.cd-sound-btn:hover {
  border-color: rgba(255,255,255,0.28);
  background: rgba(255,255,255,0.12);
}
.cd-mistake-card{
  text-align: left;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.05);
  color: #e6f0ff;
  cursor: pointer;
}
.cd-mistake-card:hover{
  border-color: rgba(110,180,255,0.55);
  background: rgba(110,180,255,0.10);
}

.cd-modal-backdrop{
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  z-index: 9999;
}
.cd-modal{
  width: min(680px, 100%);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.16);
  background: #0f1b33;
  box-shadow: 0 18px 60px rgba(0,0,0,0.55);
  padding: 14px;
}
.cd-modal-head{
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  padding: 6px 6px 10px;
  border-bottom: 1px solid rgba(255,255,255,0.10);
}
.cd-modal-title{
  font-weight: 900;
  font-size: 1.15rem;
  color: #e6f0ff;
}
.cd-modal-hint{
  margin-top: 4px;
  color: rgba(230,240,255,0.75);
  font-size: 0.9rem;
}
.cd-modal-close{
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.18);
  background: rgba(255,255,255,0.08);
  color: #e6f0ff;
  font-weight: 900;
  cursor: pointer;
  padding: 6px 10px;
}
.cd-modal-close:hover{
  background: rgba(255,255,255,0.12);
}

.cd-modal-body{
  padding: 12px 6px 6px;
  display: grid;
  gap: 12px;
}
.cd-modal-row{
  display: grid;
  gap: 6px;
}
.cd-modal-label{
  font-size: 0.85rem;
  opacity: 0.8;
  font-weight: 800;
}
.cd-modal-text{
  line-height: 1.45;
  color: rgba(230,240,255,0.92);
}
.cd-modal-actions{
  display: flex;
  gap: 10px;
  align-items: center;
}
.cd-flag-btn{
  border-radius: 999px;
  padding: 8px 12px;
  border: 1px solid rgba(255,255,255,0.18);
  background: rgba(255,255,255,0.08);
  color: #e6f0ff;
  font-weight: 900;
  cursor: pointer;
}
.cd-flag-btn:hover{
  background: rgba(255,255,255,0.12);
  border-color: rgba(110,180,255,0.55);
}
.cd-modal-es{
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.06);
  color: rgba(230,240,255,0.92);
  font-weight: 800;
}
.cd-mistake-wrap{
  display: grid;
  gap: 8px;
}

.cd-mistake-expand{
  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.06);
  color: rgba(230,240,255,0.92);
}

.cd-expand-title{
  margin-bottom: 10px;
  font-size: 1rem;
}

.cd-expand-hint{
  color: rgba(230,240,255,0.72);
  font-weight: 700;
}

.cd-expand-row{
  display: grid;
  gap: 6px;
  margin-top: 10px;
}

.cd-expand-label{
  font-size: 0.85rem;
  opacity: 0.8;
  font-weight: 800;
}

.cd-expand-text{
  line-height: 1.45;
}

.cd-expand-actions{
  margin-top: 12px;
}
.cd-mistakes-hint{
  margin: 6px 0 10px;
  opacity: 0.9;
  color: rgba(230,240,255,0.82);
  font-weight: 700;
}
.cd-mistake-line{
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 14px;
}

.cd-details-cue{
  flex: 0 0 auto;
  font-weight: 900;
  font-size: 0.85rem;
  color: rgba(230,240,255,0.75);
  opacity: 0.95;
  white-space: nowrap;
}

.cd-caret{
  display: inline-block;
  transform: translateY(-1px);
  transition: transform 120ms ease;
}

.cd-caret.open{
  transform: rotate(180deg) translateY(1px);
}
.cd-mistake-card{
  width: 100%;
}

.cd-mistake-card:focus-visible{
  outline: none;
  border-color: rgba(110,180,255,0.85);
  box-shadow: 0 0 0 3px rgba(110,180,255,0.25);
}
@keyframes cdPulse {
  0% { box-shadow: 0 0 0 0 rgba(110,180,255,0.0); }
  40% { box-shadow: 0 0 0 6px rgba(110,180,255,0.12); }
  100% { box-shadow: 0 0 0 0 rgba(110,180,255,0.0); }
}

.cd-mistake-card{
  animation: cdPulse 700ms ease 1;
}

.cd-review-card{
  margin-top: 12px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.06);
}

.cd-review-phrase{
  font-size: 1.05rem;
  margin-bottom: 6px;
}

.cd-review-hint{
  margin-top: 6px;
  opacity: 0.8;
  font-size: 0.9rem;
}

.cd-review-prompt{
  margin: 10px 0 8px;
  opacity: 0.85;
  font-weight: 700;
}

.cd-review-verbs{
  display: grid;
  grid-template-columns: repeat(5, minmax(120px, 1fr));
  gap: 10px;
}


.cd-review-actions{
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.cd-review-feedback.ok{
  border: 1px solid rgba(0,200,120,0.35);
  background: rgba(0,200,120,0.12);
  padding: 10px 12px;
  border-radius: 10px;
}

.cd-review-feedback.bad{
  border: 1px solid rgba(255,70,70,0.35);
  background: rgba(255,70,70,0.12);
  padding: 10px 12px;
  border-radius: 10px;
}

.cd-top-scores-list {
  display: grid;
  gap: 10px;
  margin-top: 10px;
  max-width: 420px;
}

.cd-top-score-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;

  padding: 12px 14px;
  border-radius: 14px;

  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.cd-top-score-rank {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cd-top-score-medal {
  font-size: 18px;
  line-height: 1;
}

.cd-top-score-label {
  font-size: 12px;
  opacity: 0.8;
}

.cd-top-score-value {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

/* ─────────────────────────────────────────────
   Leaderboard (match page blue, no grey slab)
──────────────────────────────────────────── */

/* make the table itself transparent (no slab) */
.cd-leaderboard-table{
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 16px;
  overflow: hidden;
  background: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* rows: use a subtle blue tint instead of grey */
.cd-lb-row{
  display: grid;
  grid-template-columns: 60px 1fr 120px;
  align-items: center;

  padding: 14px 16px;
  border-top: 1px solid rgba(255,255,255,0.10);

  background: rgba(110,180,255,0.06) !important; /* blue-tinted */
}

.cd-lb-row:first-child{
  border-top: none;
}

/* header slightly stronger, still blue not grey */
.cd-lb-header{
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 13px;

  background: rgba(110,180,255,0.12) !important;
}

/* hover = a touch brighter */
.cd-lb-row:not(.cd-lb-header):hover{
  background: rgba(110,180,255,0.10) !important;
}

.cd-lb-rank{
  opacity: 0.85;
}

.cd-lb-name-text{
  font-weight: 700;
  color: rgba(255,255,255,0.92);
}

.cd-lb-score{
  text-align: right;
  font-weight: 900;
  font-size: 18px;
  color: rgba(255,255,255,0.95);
}

/* “you” row: keep the gold highlight, but remove any grey feel */
.cd-lb-row.is-me{
  background: rgba(255,200,80,0.10) !important;
  box-shadow: inset 0 0 0 1px rgba(255,200,80,0.22);
}

.cd-lb-me{
  margin-left: 10px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;

  color: rgba(255,220,140,0.95);
  border: 1px solid rgba(255,220,140,0.35);
  background: rgba(255,200,80,0.12);
}
  .cd-verb-btn.is-selected{
  border-color: rgba(255,255,255,0.55);
  background: rgba(255,255,255,0.14);
  box-shadow: 0 0 0 2px rgba(110,180,255,0.18);
}



        `}</style>
      </div>
    </div>
  );
}
