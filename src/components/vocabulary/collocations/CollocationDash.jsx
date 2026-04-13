// src/components/vocabulary/collocations/CollocationDash.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { COLLOCATION_BANK, VERBS } from "../data/collocationBank";
import { useTickSound } from "../../../hooks/useTickSound";
import {
  saveCollocationDashScore,
  fetchTopCollocationDashScores,
  logCollocationDashStarted,
  logCollocationDashCompleted,
} from "../../../firebase";

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

function getVerbThemeClass(verb) {
  switch (verb) {
    case "make":
      return "theme-make";
    case "do":
      return "theme-do";
    case "take":
      return "theme-take";
    case "give":
      return "theme-give";
    case "have":
      return "theme-have";
    default:
      return "";
  }
}

function renderHint(hint) {
  if (!hint) return null;

  const trimmed = hint.trim();
  if (!trimmed.toLowerCase().startsWith("not with ")) {
    return <div className="cd-hint">{trimmed}</div>;
  }

  const highlight = trimmed.slice(9);
  return (
    <div className="cd-hint cd-hint-warning">
      <span className="cd-hint-prefix">not with</span>{" "}
      <span className="cd-hint-focus">‘{highlight}’</span>
    </div>
  );
}

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
const correctRef = useRef(null);
const incorrectRef = useRef(null);

const [topScores, setTopScores] = useState([]);

const [leaderboard, setLeaderboard] = useState([]); // top 10
const savedScoreRef = useRef(false);
const activityLoggedRef = useRef({ started: false, completed: false });

// Tick refs + play function
const { tickRef, tickFastRef, playTick, stopTicks } = useTickSound();

  const intervalRef = useRef(null);

  const remainingCount = useMemo(() => items.length, [items]);

  const start = () => {
    stopTicks();
    savedScoreRef.current = false; // ✅ allow saving again for the new run
    activityLoggedRef.current.completed = false;

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

    if (!activityLoggedRef.current.started) {
      activityLoggedRef.current.started = true;
      logCollocationDashStarted({
        roundsPlanned: 5,
        roundSeconds: 40,
      }).catch((e) => console.error("[CollocationDash] start log failed:", e));
    }
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
    activityLoggedRef.current.started = false;
    activityLoggedRef.current.completed = false;
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

  const playCorrect = () => {
    try {
      if (!correctRef.current) return;
      correctRef.current.currentTime = 0;
      correctRef.current.play();
    } catch {}
  };

  const playIncorrect = () => {
    try {
      if (!incorrectRef.current) return;
      incorrectRef.current.currentTime = 0;
      incorrectRef.current.play();
    } catch {}
  };
  

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    stopTicks();
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

    if (!activityLoggedRef.current.completed) {
      activityLoggedRef.current.completed = true;
      logCollocationDashCompleted({
        score,
        roundsReached: round,
        wrongCount: wrongAnswers.length,
        reviewCount: buildUniqueReviewQueue(wrongAnswers).length,
      }).catch((e) => console.error("[CollocationDash] completion log failed:", e));
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
    const tickVolume = Math.min(1, vol * 0.48);
    const tickFastVolume = Math.min(1, vol * 0.58);
  
    if (tickRef.current) {
      tickRef.current.volume = tickVolume;
      tickRef.current.muted = soundMuted;
    }

    if (tickFastRef.current) {
      tickFastRef.current.volume = tickFastVolume;
      tickFastRef.current.muted = soundMuted;
    }

    [nextRef, finishRef, timeUpRef, correctRef, incorrectRef].forEach((r) => {
      if (r.current) {
        r.current.volume = vol;
        r.current.muted = soundMuted;
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
    playCorrect();
    setScore((s) => s + 10);
    setItems((prev) => prev.filter((it) => it.phrase !== phrase));
    setFeedback({ kind: "ok", text: "Correct." });

    setSelectedPhrase(null);
    setSelectedVerb(null);

    setTimeout(() => setFeedback(null), 800);
  } else {
    playIncorrect();
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
          hint: selectedItem.hint,
          definition: selectedItem.definition,
          example: selectedItem.example,
          es: selectedItem.es,
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
<audio ref={correctRef} src="/sounds/correct.mp3" preload="auto" />
<audio ref={incorrectRef} src="/sounds/incorrect.mp3" preload="auto" />


      <div className="game-container cd-shell" style={{ maxWidth: 1180 }}>
        <div className="cd-hero">
          <div className="cd-hero-copy">
            <h1 className="cd-title">Collocation Dash</h1>
            <p className="cd-subtitle">
              Select a phrase, then choose the verb it collocates with.
            </p>
          </div>

          <div className="cd-status-bar">
            <div className="cd-stat-stack">
              <div className="cd-stat-pill"><strong>Round:</strong> {round}</div>
              {status === "playing" && (
                <div className="cd-stat-pill"><strong>Left:</strong> {remainingCount}</div>
              )}
            </div>

            <div className="cd-timer-orb" aria-label={`Time left ${timeLeft} seconds`}>
              <div className="cd-timer-ring" />
              <div className="cd-timer-core">
                <span className="cd-timer-number">{timeLeft}</span>
              </div>
            </div>

            <div className="cd-status-right">
              <div className="cd-score-inline"><strong>Score:</strong> {score}</div>
              <div className="cd-sound">
                <span className="cd-sound-label">Sound</span>
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
                  {soundMuted ? "🔇" : "🔊"} {soundMuted ? "Off" : "On"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {status === "idle" && (
          <div className="cd-panel" style={{ marginTop: 16 }}>
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


            <button className="review-btn cd-primary-btn" onClick={start}>
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

            <div className="cd-verb-grid">
              {VERBS.map((v) => (
                <button
                key={v}
                type="button"
                onClick={() => {
                  if (selectedPhrase) submitMatch(v, selectedPhrase);
                  else setSelectedVerb(v);
                }}
                className={`cd-verb-btn ${getVerbThemeClass(v)} ${selectedVerb === v ? "is-selected" : ""}`}
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

            <div className="cd-section">
              <div className="cd-section-label">
                Select one:
              </div>

              <div className="cd-phrase-grid">
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
                      {it.hint ? renderHint(it.hint) : <div className="cd-hint"> </div>}
</button>
                  );
                })}
              </div>
            </div>

            <div className="cd-actions">
  <button className="review-btn cd-secondary-btn" onClick={restart}>Restart</button>
  <button
    className="review-btn cd-danger-btn"
    onClick={endGame}
  >
    End game
  </button>
</div>
          </>
        )}

{status === "review" && (
  <div className="cd-panel" style={{ marginTop: 16 }}>
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
          playCorrect();
          setReviewFeedback({ kind: "ok", text: "Correct ✅" });
          setReviewScore((s) => s + 1);
        } else {
          playIncorrect();
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
              <button className="review-btn cd-primary-btn" onClick={restart}>Play again</button>
            </div>
          </div>
        )}

      {/* Collocation Dash scoped styles */}
      <style>{`
        .cd-shell {
          position: relative;
          overflow: hidden;
          padding: 28px;
          border-radius: 32px;
          background:
            radial-gradient(circle at 50% 18%, rgba(255, 186, 72, 0.22), transparent 20%),
            radial-gradient(circle at 18% 78%, rgba(90, 170, 255, 0.16), transparent 28%),
            radial-gradient(circle at 82% 72%, rgba(255, 110, 160, 0.14), transparent 22%),
            linear-gradient(180deg, #132250 0%, #1a295c 52%, #16244f 100%);
          border: 1px solid rgba(150, 186, 255, 0.14);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.08),
            0 24px 64px rgba(3, 8, 23, 0.42);
        }

        .cd-shell::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle, rgba(255,255,255,0.18) 0 1px, transparent 1.5px) 0 0 / 22px 22px,
            radial-gradient(circle, rgba(255,214,128,0.14) 0 1px, transparent 1.5px) 11px 9px / 28px 28px;
          opacity: 0.18;
          mask-image: linear-gradient(180deg, transparent, rgba(0,0,0,0.85) 18%, rgba(0,0,0,0.9) 78%, transparent);
        }

        .cd-hero {
          position: relative;
          z-index: 1;
          display: grid;
          gap: 18px;
          justify-items: center;
          text-align: center;
          margin-bottom: 10px;
        }

        .cd-hero-copy {
          display: grid;
          gap: 8px;
          justify-items: center;
        }

        .cd-title {
          margin: 0;
          font-size: clamp(3rem, 7vw, 4.8rem);
          line-height: 0.95;
          letter-spacing: -0.04em;
          font-weight: 900;
          color: #ffc94d;
          text-shadow:
            0 3px 0 rgba(120, 66, 0, 0.45),
            0 12px 28px rgba(255, 186, 72, 0.18);
        }

        .cd-subtitle {
          margin: 0;
          max-width: 760px;
          font-size: clamp(1.05rem, 2.2vw, 1.7rem);
          color: rgba(233, 241, 255, 0.9);
        }

        .cd-status-bar {
          width: 100%;
          max-width: 980px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 22px;
          padding: 18px 22px;
          border-radius: 32px;
          background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04));
          border: 1px solid rgba(175, 203, 255, 0.18);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.08),
            0 14px 34px rgba(5, 10, 28, 0.28);
        }

        .cd-stat-stack {
          display: grid;
          gap: 12px;
          justify-items: start;
        }

        .cd-stat-pill {
          min-width: 136px;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(242, 246, 255, 0.95);
          font-size: 0.98rem;
          font-weight: 700;
          text-align: left;
        }

        .cd-timer-orb {
          position: relative;
          width: 118px;
          height: 118px;
          display: grid;
          place-items: center;
          filter: drop-shadow(0 14px 26px rgba(0,0,0,0.35));
        }

        .cd-timer-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: conic-gradient(from -90deg, #3ca7ff 0 35%, #ffb32f 35% 100%);
          box-shadow:
            0 0 0 4px rgba(255,255,255,0.08),
            0 0 28px rgba(255, 183, 77, 0.22);
        }

        .cd-timer-ring::after {
          content: "";
          position: absolute;
          inset: 8px;
          border-radius: 50%;
          background: linear-gradient(180deg, rgba(15, 32, 82, 0.96), rgba(9, 21, 60, 0.96));
          border: 2px solid rgba(255,255,255,0.08);
        }

        .cd-timer-core {
          position: relative;
          z-index: 1;
          width: 80px;
          height: 80px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, rgba(255,255,255,0.2), rgba(34, 58, 126, 0.88) 60%);
          box-shadow: inset 0 2px 10px rgba(255,255,255,0.08);
        }

        .cd-timer-number {
          font-size: 2.55rem;
          font-weight: 900;
          line-height: 1;
          color: #f7f3ee;
          text-shadow: 0 2px 8px rgba(0,0,0,0.28);
        }

        .cd-status-right {
          display: grid;
          gap: 12px;
          justify-items: end;
          align-items: center;
        }

        .cd-score-inline {
          color: rgba(242, 246, 255, 0.96);
          font-size: 1.28rem;
          font-weight: 800;
          text-align: right;
        }

        .cd-panel,
        .cd-feedback {
          min-height: 52px;
          margin-top: 12px;
          margin-bottom: 14px;
          padding: 12px 14px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.06);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
        }

        .cd-panel {
          min-height: unset;
        }

        .cd-feedback {
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

        .cd-feedback.is-ok {
          background: rgba(0,200,120,0.15);
        }

        .cd-feedback.is-bad {
          background: rgba(255,70,70,0.15);
        }

        .cd-verb-grid {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 14px;
        }

        .cd-verb-btn {
          position: relative;
          padding: 18px 14px;
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.24);
          background: linear-gradient(180deg, rgba(67,91,156,0.92), rgba(34,53,109,0.96));
          color: #f3f6ff;
          font-weight: 800;
          font-size: 1.15rem;
          letter-spacing: 0.2px;
          cursor: pointer;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.18),
            inset 0 -4px 0 rgba(0,0,0,0.18),
            0 10px 24px rgba(0,0,0,0.22);
          transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease, background 120ms ease, filter 120ms ease;
        }

        .cd-verb-btn:hover {
          transform: translateY(-2px) scale(1.01);
          filter: brightness(1.04);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.2),
            inset 0 -4px 0 rgba(0,0,0,0.18),
            0 14px 30px rgba(0,0,0,0.28);
        }

        .cd-verb-btn:disabled {
          cursor: not-allowed;
          opacity: 0.55;
          transform: none;
          box-shadow: none;
        }

        .cd-verb-btn.theme-make {
          background: linear-gradient(180deg, #2f8eff 0%, #174dc7 100%);
          border-color: rgba(117, 197, 255, 0.5);
        }

        .cd-verb-btn.theme-do {
          background: linear-gradient(180deg, #8f5dff 0%, #5328c8 100%);
          border-color: rgba(176, 140, 255, 0.48);
        }

        .cd-verb-btn.theme-take {
          background: linear-gradient(180deg, #ffb43c 0%, #e06d1c 100%);
          border-color: rgba(255, 215, 109, 0.5);
        }

        .cd-verb-btn.theme-give {
          background: linear-gradient(180deg, #6fd84d 0%, #2f8e33 100%);
          border-color: rgba(169, 245, 121, 0.46);
        }

        .cd-verb-btn.theme-have {
          background: linear-gradient(180deg, #f16087 0%, #b52959 100%);
          border-color: rgba(255, 152, 188, 0.44);
        }

        .cd-verb-btn.is-selected {
          transform: translateY(-2px) scale(1.02);
          border-color: rgba(255,255,255,0.78);
          box-shadow:
            0 0 0 3px rgba(255,255,255,0.14),
            0 0 24px rgba(255,255,255,0.12),
            inset 0 1px 0 rgba(255,255,255,0.22),
            inset 0 -4px 0 rgba(0,0,0,0.18);
        }

        .cd-section {
          margin-top: 24px;
        }

        .cd-section-label {
          opacity: 0.92;
          margin-bottom: 12px;
          font-size: 1.05rem;
          font-weight: 800;
        }

        .cd-phrase-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .cd-phrase-btn {
          text-align: left;
          min-height: 96px;
          padding: 16px 18px;
          border-radius: 20px;
          border: 1px solid rgba(162, 191, 255, 0.14);
          background: linear-gradient(180deg, rgba(42,59,116,0.86), rgba(29,43,92,0.9));
          color: #eef3ff;
          cursor: pointer;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.08),
            0 8px 22px rgba(0,0,0,0.18);
          transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease, background 120ms ease;
        }

        .cd-phrase-btn:hover {
          transform: translateY(-2px);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.1),
            0 12px 28px rgba(0,0,0,0.26);
          border-color: rgba(180, 207, 255, 0.3);
        }

        .cd-phrase-btn.active {
          border-color: rgba(255, 221, 102, 0.95);
          background: linear-gradient(180deg, rgba(39,81,180,0.94), rgba(22,44,109,0.96));
          box-shadow:
            0 0 0 3px rgba(255, 212, 82, 0.24),
            0 0 22px rgba(255, 212, 82, 0.18),
            inset 0 1px 0 rgba(255,255,255,0.1);
        }

        .cd-phrase-btn div {
          color: inherit;
        }

        .cd-hint {
          color: rgba(230,240,255,0.72);
          font-size: 0.96rem;
          margin-top: 8px;
        }

        .cd-hint-warning {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          width: fit-content;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(255, 214, 102, 0.1);
          border: 1px solid rgba(255, 214, 102, 0.18);
          color: rgba(255, 237, 184, 0.92);
        }

        .cd-hint-prefix {
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 0.68rem;
          font-weight: 900;
          color: rgba(255, 225, 150, 0.76);
        }

        .cd-hint-focus {
          font-weight: 800;
          color: rgba(255, 245, 210, 0.98);
        }

        .cd-sound {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.06);
        }

        .cd-sound-label {
          font-size: 0.88rem;
          opacity: 0.9;
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
          font-size: 0.88rem;
          cursor: pointer;
          white-space: nowrap;
        }

        .cd-sound-btn:hover {
          border-color: rgba(255,255,255,0.28);
          background: rgba(255,255,255,0.12);
        }

        .cd-actions {
          margin-top: 28px;
          display: flex;
          justify-content: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        .cd-primary-btn,
        .cd-secondary-btn,
        .cd-danger-btn {
          min-width: 180px;
          border-radius: 20px;
          padding: 14px 22px;
          font-size: 1rem;
          font-weight: 900;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.12),
            0 12px 28px rgba(0,0,0,0.2);
        }

        .cd-primary-btn,
        .cd-secondary-btn {
          background: linear-gradient(180deg, rgba(43,77,170,0.9), rgba(30,53,116,0.95));
          border-color: rgba(130, 174, 255, 0.38);
        }

        .cd-danger-btn {
          background: linear-gradient(180deg, rgba(181,55,89,0.95), rgba(116,28,51,0.98));
          border-color: rgba(255, 117, 149, 0.35) !important;
        }

        .cd-mistake-card{
          width: 100%;
          text-align: left;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
          color: #e6f0ff;
          cursor: pointer;
          animation: cdPulse 700ms ease 1;
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

        .cd-review-card{
          margin-top: 12px;
          padding: 16px;
          border-radius: 18px;
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
          grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
          gap: 10px;
        }

        .cd-review-verb {
          min-width: 0;
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

        .cd-leaderboard-table{
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 16px;
          overflow: hidden;
          background: transparent !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }

        .cd-lb-row{
          display: grid;
          grid-template-columns: 60px 1fr 120px;
          align-items: center;
          padding: 14px 16px;
          border-top: 1px solid rgba(255,255,255,0.10);
          background: rgba(110,180,255,0.06) !important;
        }

        .cd-lb-row:first-child{
          border-top: none;
        }

        .cd-lb-header{
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-size: 13px;
          background: rgba(110,180,255,0.12) !important;
        }

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

        @media (max-width: 980px) {
          .cd-status-bar {
            grid-template-columns: 1fr;
            justify-items: center;
          }

          .cd-stat-stack,
          .cd-status-right,
          .cd-sound {
            justify-items: center;
            justify-content: center;
          }

          .cd-verb-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }

          .cd-phrase-grid {
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          }
        }

        @media (max-width: 700px) {
          .cd-shell {
            padding: 14px 10px;
            border-radius: 20px;
          }

          .cd-title {
            font-size: clamp(2.1rem, 12vw, 3rem);
          }

          .cd-subtitle {
            font-size: 0.96rem;
          }

          .cd-hero {
            gap: 12px;
          }

          .cd-status-bar {
            padding: 12px;
            gap: 10px;
            border-radius: 22px;
          }

          .cd-stat-stack {
            width: 100%;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }

          .cd-stat-pill {
            min-width: 0;
            width: 100%;
            padding: 8px 10px;
            font-size: 0.9rem;
            text-align: center;
          }

          .cd-timer-orb {
            width: 88px;
            height: 88px;
          }

          .cd-timer-core {
            width: 60px;
            height: 60px;
          }

          .cd-timer-number {
            font-size: 1.8rem;
          }

          .cd-status-right {
            width: 100%;
            gap: 8px;
          }

          .cd-score-inline {
            width: 100%;
            font-size: 1rem;
            text-align: center;
          }

          .cd-sound {
            width: 100%;
            display: grid;
            grid-template-columns: auto 1fr auto;
            align-items: center;
            gap: 6px;
            padding: 6px 8px;
          }

          .cd-sound input[type="range"] {
            width: 100%;
            min-width: 0;
          }

          .cd-sound-label {
            font-size: 0.8rem;
          }

          .cd-sound-btn {
            padding: 5px 8px;
            font-size: 0.8rem;
          }

          .cd-feedback,
          .cd-panel {
            padding: 10px 12px;
            border-radius: 14px;
            margin-bottom: 10px;
          }

          .cd-verb-grid {
            margin-top: 12px;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 8px;
          }

          .cd-verb-btn {
            padding: 12px 8px;
            border-radius: 16px;
            font-size: 0.95rem;
          }

          .cd-section {
            margin-top: 16px;
          }

          .cd-section-label {
            margin-bottom: 8px;
            font-size: 0.95rem;
          }

          .cd-phrase-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .cd-phrase-btn {
            min-height: 68px;
            padding: 12px 14px;
            border-radius: 16px;
          }

          .cd-phrase-btn div:first-child {
            font-size: 0.95rem;
          }

          .cd-hint {
            font-size: 0.82rem;
            margin-top: 6px;
          }

          .cd-hint-warning {
            padding: 3px 8px;
            gap: 5px;
          }

          .cd-hint-prefix {
            font-size: 0.6rem;
          }

          .cd-actions {
            margin-top: 18px;
            gap: 10px;
          }

          .cd-primary-btn,
          .cd-secondary-btn,
          .cd-danger-btn {
            min-width: 0;
            width: 100%;
            padding: 11px 14px;
            border-radius: 16px;
            font-size: 0.92rem;
          }

          .cd-review-verbs {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          }
        }

        @media (max-width: 520px) {
          .cd-review-card {
            padding: 12px;
            border-radius: 16px;
          }

          .cd-review-verbs {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }

          .cd-review-verb {
            padding: 12px 8px;
            min-width: 0;
            font-size: 0.95rem;
          }

          .cd-review-actions {
            gap: 8px;
          }

          .cd-review-actions .review-btn {
            width: 100%;
          }
        }
      `}</style>
      </div>
    </div>
  );
}
