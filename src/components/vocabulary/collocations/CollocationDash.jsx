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
            {feedback && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: feedback.kind === "ok" ? "rgba(0,200,120,0.15)" : "rgba(255,70,70,0.15)",
                }}
              >
                <strong>{feedback.text}</strong>
              </div>
            )}

            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(5, minmax(120px, 1fr))", gap: 10 }}>
              {VERBS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => submitToVerb(v)}
                  style={{
                    padding: "14px 10px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.06)",
                    cursor: selectedId ? "pointer" : "not-allowed",
                    opacity: selectedId ? 1 : 0.65,
                    fontWeight: 700,
                  }}
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
                      style={{
                        textAlign: "left",
                        padding: "12px 12px",
                        borderRadius: 12,
                        border: active ? "1px solid rgba(255,255,255,0.55)" : "1px solid rgba(255,255,255,0.15)",
                        background: active ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.05)",
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{it.phrase}</div>
                      {it.hint ? (
                        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{it.hint}</div>
                      ) : (
                        <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}> </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="review-btn" onClick={restart}>Restart</button>
              <button className="review-btn" onClick={endGame}>End game</button>
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
      </div>
    </div>
  );
}
