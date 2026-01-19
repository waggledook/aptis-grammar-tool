// src/components/vocabulary/collocations/CollocationDash.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { COLLOCATION_BANK, VERBS } from "../data/collocationBank";
// If you already have logActivity in src/firebase.js, you can wire it in:
// import { logActivity } from "../../../firebase";

function pickRoundItems({ perRound = 5 }) {
  // Flatten bank into items with correctVerb
  const all = [];
  for (const verb of VERBS) {
    for (const item of COLLOCATION_BANK[verb] || []) {
      all.push({ correctVerb: verb, phrase: item.phrase, hint: item.hint || "" });
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
  const [status, setStatus] = useState("idle"); // idle | playing | over
  const [round, setRound] = useState(1);
  const [roundTime, setRoundTime] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25);
  const [score, setScore] = useState(0);

  const [items, setItems] = useState(() => pickRoundItems({ perRound: 5 }));
  const [selectedId, setSelectedId] = useState(null); // phrase key
  const [feedback, setFeedback] = useState(null); // { kind, text }
  const [wrongAnswers, setWrongAnswers] = useState([]); // { phrase, selectedVerb, correctVerb }

  const intervalRef = useRef(null);

  const remainingCount = useMemo(() => items.length, [items]);

  const start = () => {
    // Optional: gate by sign-in if you want (your old game didn’t)
    // If you want this gated:
    // if (!user) { onRequireSignIn?.(); return; }

    setStatus("playing");
    setRound(1);
    setRoundTime(25);
    setTimeLeft(25);
    setScore(0);
    setWrongAnswers([]);
    setFeedback(null);
    setSelectedId(null);
    setItems(pickRoundItems({ perRound: 5 }));

    // logActivity?.("vocab_collocations_dash_started", { uid: user?.uid ?? null });
  };

  const restart = () => {
    stopTimer();
    setStatus("idle");
    start();
  };

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const endGame = () => {
    stopTimer();
    setStatus("over");
    setFeedback(null);
    setSelectedId(null);

    // logActivity?.("vocab_collocations_dash_ended", {
    //   uid: user?.uid ?? null,
    //   score,
    //   roundsCompleted: round - 1,
    //   mistakes: wrongAnswers.length,
    // });
  };

  const nextRound = () => {
    stopTimer();
    const next = round + 1;
    const nextTime = Math.max(5, roundTime - 1);

    setRound(next);
    setRoundTime(nextTime);
    setTimeLeft(nextTime);
    setItems(pickRoundItems({ perRound: 5 }));
    setSelectedId(null);
    setFeedback(null);
  };

  useEffect(() => {
    if (status !== "playing") return;

    stopTimer();
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // reach zero -> end
          setTimeout(() => endGame(), 0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, round, roundTime]);

  // When the player clears the round, advance automatically.
  useEffect(() => {
    if (status !== "playing") return;
    if (remainingCount === 0) {
      nextRound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingCount, status]);

  const submitToVerb = (verb) => {
    if (status !== "playing") return;
    if (!selectedId) return;

    const selectedItem = items.find((it) => it.phrase === selectedId);
    if (!selectedItem) return;

    const correct = selectedItem.correctVerb === verb;

    if (correct) {
      setScore((s) => s + 10);
      setItems((prev) => prev.filter((it) => it.phrase !== selectedId));
      setFeedback({ kind: "ok", text: "Correct." });
      setSelectedId(null);
      setTimeout(() => setFeedback(null), 800);
    } else {
      setScore((s) => s - 5);
      setFeedback({ kind: "bad", text: "Try again." });
      setTimeout(() => setFeedback(null), 800);

      setWrongAnswers((prev) => {
        // de-dupe by phrase + chosen verb
        const exists = prev.some(
          (x) => x.phrase === selectedItem.phrase && x.selectedVerb === verb
        );
        if (exists) return prev;
        return [
          ...prev,
          { phrase: selectedItem.phrase, selectedVerb: verb, correctVerb: selectedItem.correctVerb },
        ];
      });
    }
  };

  return (
    <div className="game-wrapper">
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
                onClick={() => submitToVerb(v)}
                className="cd-verb-btn"
                disabled={!selectedId}
                title={selectedId ? `Submit: ${v}` : "Select a phrase first"}
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
                  const active = selectedId === it.phrase;
                  return (
                    <button
  key={it.phrase}
  type="button"
  onClick={() => setSelectedId(it.phrase)}
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

        {status === "over" && (
          <div style={{ marginTop: 16 }}>
            <h2 style={{ marginTop: 0 }}>Game over</h2>
            <p style={{ opacity: 0.9 }}>
              Final score: <strong>{score}</strong>
            </p>

            {wrongAnswers.length > 0 ? (
              <>
                <h3>Mistakes to review</h3>
                <div style={{ display: "grid", gap: 8 }}>
                  {wrongAnswers.slice().reverse().map((w, idx) => (
                    <div
                      key={`${w.phrase}-${w.selectedVerb}-${idx}`}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "rgba(255,255,255,0.05)",
                      }}
                    >
                      You chose <strong>{w.selectedVerb} {w.phrase}</strong>. Correct:{" "}
                      <strong>{w.correctVerb} {w.phrase}</strong>.
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p style={{ opacity: 0.9 }}>No mistakes recorded. Nice.</p>
            )}

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

        `}</style>
      </div>
    </div>
  );
}
