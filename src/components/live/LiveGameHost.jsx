// src/components/live/LiveGameHost.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { ref, onValue, set } from "firebase/database";
import { rtdb, auth, getGrammarSet } from "../../firebase";
import { fetchItemsByIds } from "../../api/grammar";
import { setLiveGameStatus, setLiveGameState } from "../../api/liveGames";
import { toast } from "../../utils/toast";
import { useTickSound } from "../../hooks/useTickSound";
import { QRCodeSVG } from "qrcode.react";


export default function LiveGameHost() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loadingGame, setLoadingGame] = useState(true);

  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [selectedExplanationIndex, setSelectedExplanationIndex] = useState(null);

  // 🔊 NEW: sound volume + mute
  const [soundVolume, setSoundVolume] = useState(0.9); // 0–1
  const [soundMuted, setSoundMuted] = useState(false);

  // Get tick refs + play function from the hook
const { tickRef, tickFastRef, playTick } = useTickSound();

// 🔊 Other audio refs (host-only sounds)
const revealRef = useRef(null);
const nextRef = useRef(null);
const finishRef = useRef(null);
const timeUpRef = useRef(null);

  // 🔊 Keep all sounds in sync with volume / mute
  useEffect(() => {
    const vol = soundMuted ? 0 : soundVolume;
    const refs = [
      tickRef,
      tickFastRef,
      revealRef,
      nextRef,
      finishRef,
      timeUpRef,
    ];

    refs.forEach((r) => {
      if (r.current) {
        r.current.volume = vol;
      }
    });
  }, [soundVolume, soundMuted, tickRef, tickFastRef, revealRef, nextRef, finishRef, timeUpRef]);


const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
// If we already know the PIN, include it as a query param
const joinUrl =
game && game.pin
  ? `${baseUrl}/live/join?pin=${encodeURIComponent(game.pin)}`
  : `${baseUrl}/live/join`;

  // Subscribe to liveGames/{gameId}
  useEffect(() => {
    const gameRef = ref(rtdb, `liveGames/${gameId}`);
    const unsubscribe = onValue(gameRef, (snap) => {
      if (!snap.exists()) {
        setGame(null);
      } else {
        setGame(snap.val());
      }
      setLoadingGame(false);
    });
    return () => unsubscribe();
  }, [gameId]);

  // Load grammar items once we know game.setId.
  // If /liveGames/{gameId}/items already exists, reuse that (do NOT reshuffle).
  useEffect(() => {
    async function loadItems() {
      if (!game || !game.setId) return;

      // If items already stored in RTDB, just use them
      if (Array.isArray(game.items) && game.items.length) {
        setItems(game.items);
        setLoadingItems(false);
        return;
      }

      try {
        setLoadingItems(true);
        const meta = await getGrammarSet(game.setId);
        if (!meta || !meta.itemIds || !meta.itemIds.length) {
          setItems([]);
          return;
        }

        // Uses your existing shuffleOptionsSafely logic internally
        const qs = await fetchItemsByIds(meta.itemIds);

        // Store the shuffled items once as the canonical order for this game
        await set(ref(rtdb, `liveGames/${gameId}/items`), qs);

        setItems(qs);
      } catch (err) {
        console.error("[LiveGameHost] failed to load items", err);
        toast("Could not load questions for this game.");
        setItems([]);
      } finally {
        setLoadingItems(false);
      }
    }
    loadItems();
  }, [game, gameId]);


  // ── Derived values ──────────────────────────
  const currentUser = auth.currentUser;
  const isHost = !!currentUser && !!game && currentUser.uid === game.ownerUid;

  const playersObj = game?.players || {};
  const players = Object.entries(playersObj).map(([uid, p]) => ({
    uid,
    ...p,
  }));

  const status = game?.status || "lobby";
  const phase = game?.state?.phase || "lobby";
  const questionIndex = game?.state?.questionIndex ?? 0;
  const questionDuration = game?.state?.questionDuration ?? 20;
  const deadline = game?.state?.questionDeadline ?? null;

  // Countdown timer based on questionDeadline
useEffect(() => {
    if (!deadline || status !== "in-progress" || phase !== "question") {
      setRemainingSeconds(null);
      return;
    }
  
    function updateRemaining() {
      const now = Date.now();
      const diffMs = deadline - now;
      const secs = Math.max(0, Math.ceil(diffMs / 1000));
      setRemainingSeconds(secs);
    }
  
    updateRemaining();
    const id = setInterval(updateRemaining, 250);
    return () => clearInterval(id);
  }, [deadline, status, phase]);

  // Clear any shown explanation when question or phase changes
  useEffect(() => {
    setSelectedExplanationIndex(null);
  }, [questionIndex, phase]);

  useEffect(() => {
    if (status !== "in-progress" || phase !== "question") return;
    if (remainingSeconds == null || remainingSeconds <= 0) return;
  
    const isFast = remainingSeconds <= 3;
    playTick(isFast);
  }, [remainingSeconds, status, phase]);
  
  

  // 🔊 Time-up sound when countdown reaches 0 (host only)
useEffect(() => {
    if (!isHost) return;
    if (status !== "in-progress" || phase !== "question") return;
    if (remainingSeconds !== 0) return;
    if (!timeUpRef.current) return;
  
    try {
      timeUpRef.current.currentTime = 0;
      timeUpRef.current.play().catch(() => {});
    } catch {
      // ignore audio errors
    }
  }, [remainingSeconds, status, phase, isHost]);
  

  const totalQuestions = items.length;
  const currentItem =
    !loadingItems && totalQuestions > 0 && questionIndex < totalQuestions
      ? items[questionIndex]
      : null;

  const totalPlayers = players.length;
  const answersForQ =
    (game && game.answers && game.answers[questionIndex]) || {};
  const answeredCount = Object.keys(answersForQ).length;

  const isLastQuestion =
    totalQuestions > 0 && questionIndex === totalQuestions - 1;

  // Response stats per option
  const responseStats = useMemo(() => {
    if (!currentItem || !Array.isArray(currentItem.options)) {
      return { optionCounts: [], correctIndex: null };
    }
    const optionCounts = new Array(currentItem.options.length).fill(0);
    Object.values(answersForQ).forEach((ans) => {
      const idx = ans?.selectedIndex;
      if (
        typeof idx === "number" &&
        idx >= 0 &&
        idx < optionCounts.length
      ) {
        optionCounts[idx] += 1;
      }
    });
    return {
      optionCounts,
      correctIndex: currentItem.answerIndex,
    };
  }, [answersForQ, currentItem]);

  // Sorted scoreboard
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      const sa = a.score || 0;
      const sb = b.score || 0;
      if (sb !== sa) return sb - sa;
      const na = (a.name || "").toLowerCase();
      const nb = (b.name || "").toLowerCase();
      return na.localeCompare(nb);
    });
  }, [players]);

  const topThree = sortedPlayers.slice(0, 3);

  // ── Early returns ────────────────────────────────
  if (loadingGame) {
    return (
      <div className="page narrow">
        <p>Loading game…</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="page narrow">
        <h1>Host Live Game</h1>
        <p className="muted">Game not found.</p>
      </div>
    );
  }

  // ── Host controls ─────────────────────────────────────────────────
  async function handleStart() {
    if (!isHost) return;
    if (!totalQuestions) {
      toast("This set has no questions.");
      return;
    }
    try {
      const duration = questionDuration || 20;
      const deadline = Date.now() + duration * 1000;

      await setLiveGameStatus(gameId, "in-progress");
      await setLiveGameState(gameId, {
        phase: "question",
        questionIndex: 0,
        questionDeadline: deadline,
      });
    } catch (err) {
      console.error("[LiveGameHost] start failed", err);
      toast("Could not start game.");
    }
  }

  async function handleReveal() {
    if (!isHost) return;
    try {
      await setLiveGameState(gameId, { phase: "reveal" });
      // 🔊 Reveal sound
      if (revealRef.current) {
        try {
          revealRef.current.currentTime = 0;
          revealRef.current.play().catch(() => {});
        } catch {}
      }
    } catch (err) {
      console.error("[LiveGameHost] reveal failed", err);
      toast("Could not reveal answers.");
    }
  }

  async function handleNextQuestion() {
    if (!isHost) return;
    const nextIndex = questionIndex + 1;
  
    if (nextIndex >= totalQuestions) {
      await handleEnd();
      return;
    }
  
    // 🔊 Play "next question" sound *before* changing state / starting new countdown
    if (nextRef.current) {
      try {
        nextRef.current.currentTime = 0;
        nextRef.current.play().catch(() => {});
      } catch {
        // ignore audio errors
      }
    }
  
    try {
      const duration = questionDuration || 20;
      const deadline = Date.now() + duration * 1000;
  
      await setLiveGameState(gameId, {
        phase: "question",
        questionIndex: nextIndex,
        questionDeadline: deadline,
      });
    } catch (err) {
      console.error("[LiveGameHost] next failed", err);
      toast("Could not move to next question.");
    }
  }  

  async function handleEnd() {
    if (!isHost) return;
    try {
      await setLiveGameStatus(gameId, "finished");
      await setLiveGameState(gameId, { phase: "finished" });

      // 🔊 Finish sound
      if (finishRef.current) {
        try {
          finishRef.current.currentTime = 0;
          finishRef.current.play().catch(() => {});
        } catch {}
      }
    } catch (err) {
      console.error("[LiveGameHost] end failed", err);
      toast("Could not finish game.");
    }
  }

  return (
    <div className="page wide">
        {/* Local styles for the podium animation */}
        <style>
          {`
            @keyframes podium-pop {
              0% {
                transform: translateY(10px) scale(0.95);
                opacity: 0;
              }
              100% {
                transform: translateY(0) scale(1);
                opacity: 1;
              }
            }
  
            .podium-row {
              display: flex;
              justify-content: center;
              align-items: flex-end;
              gap: 1rem;
              margin-top: 0.75rem;
            }
  
            .podium-column {
              flex: 0 0 5rem;
              text-align: center;
              border-radius: 0.75rem 0.75rem 0.25rem 0.25rem;
              padding: 0.4rem 0.3rem 0.6rem;
              background: rgba(15, 23, 42, 0.95);
              border: 1px solid rgba(148, 163, 184, 0.4);
              animation: podium-pop 0.4s ease-out forwards;
            }
  
            .podium-column.first {
              height: 6rem;
              background: linear-gradient(
                180deg,
                rgba(250, 204, 21, 0.18),
                rgba(15, 23, 42, 0.95)
              );
              border-color: rgba(250, 204, 21, 0.7);
            }
  
            .podium-column.second {
              height: 4.8rem;
            }
  
            .podium-column.third {
              height: 4rem;
            }
  
            .podium-rank {
              font-size: 1.1rem;
              font-weight: 700;
              display: block;
              margin-bottom: 0.15rem;
            }
  
            .podium-name {
              font-size: 0.85rem;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
  
            .podium-score {
              font-size: 0.75rem;
              opacity: 0.8;
              margin-top: 0.1rem;
            }
          `}
        </style>  
      <header className="page-header">
        <h1>Host Live Game</h1>
        <p className="muted">
          Game ID: <code>{gameId}</code>
        </p>
      </header>

      <section className="card">
        <h2>PIN for students</h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "1.25rem",
            marginTop: ".5rem",
          }}
        >
          {/* Big PIN display */}
          <div>
            <p
              style={{
                fontSize: "2.6rem",
                fontWeight: 800,
                letterSpacing: "0.18em",
                marginBottom: ".15rem",
              }}
            >
              {game.pin}
            </p>
            <p className="muted" style={{ maxWidth: "260px" }}>
              Ask students to open the{" "}
              <strong>Join Live Game</strong> page and enter this PIN.
            </p>
          </div>

          {/* QR code */}
          <div
            style={{
              marginLeft: "auto",
              padding: ".6rem .9rem",
              borderRadius: ".9rem",
              border: "1px solid #1e293b",
              background: "#020617",
              display: "flex",
              alignItems: "center",
              gap: ".75rem",
            }}
          >
            <QRCodeSVG
              value={joinUrl}
              size={96}
              bgColor="transparent"
              fgColor="#e5e7eb"
            />
            <p
              className="tiny muted"
              style={{ maxWidth: "180px", margin: 0, lineHeight: 1.4 }}
            >
              Students can also{" "}
              <strong>scan this QR</strong> to open the join page on their
              phones.
            </p>
          </div>
        </div>
      </section>


      {/* Game status + controls */}
      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>Game status</h2>
        <p>
          Status: <strong>{status}</strong> · Phase: <strong>{phase}</strong>{" "}
          · Question{" "}
          <strong>
            {totalQuestions ? questionIndex + 1 : 0}/{totalQuestions}
          </strong>
        </p>
        <p className="muted">
          Players answered:{" "}
          <strong>
            {answeredCount}/{totalPlayers}
          </strong>
        </p>

        {/* Timer info */}
        <p className="muted">
          Timer:{" "}
          <strong>
            {remainingSeconds != null ? remainingSeconds : questionDuration}
          </strong>{" "}
          s
        </p>

        {isHost && status === "lobby" && (
          <div
            style={{
              marginTop: ".5rem",
              display: "flex",
              alignItems: "center",
              gap: ".5rem",
              flexWrap: "wrap",
            }}
          >
            <span className="tiny muted">Timer per question:</span>
            <select
              value={questionDuration}
              onChange={async (e) => {
                const secs = parseInt(e.target.value, 10) || 20;
                try {
                  await setLiveGameState(gameId, { questionDuration: secs });
                } catch (err) {
                  console.error("[LiveGameHost] set duration failed", err);
                  toast("Could not update timer.");
                }
              }}
              style={{
                padding: ".25rem .5rem",
                borderRadius: ".4rem",
                border: "1px solid #1e293b",
                background: "#020617",
                color: "#e5e7eb",
                fontSize: ".85rem",
              }}
            >
              <option value={10}>10 seconds</option>
              <option value={20}>20 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={45}>45 seconds</option>
            </select>
          </div>
        )}

                {/* 🔊 Volume / mute controls (host only) */}
                {isHost && (
          <div
            style={{
              marginTop: "0.6rem",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              flexWrap: "wrap",
            }}
          >
            <span className="muted small">Sound:</span>

            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(soundVolume * 100)}
              onChange={(e) =>
                setSoundVolume(Number(e.target.value) / 100)
              }
              style={{ width: "140px" }}
            />

            <button
              type="button"
              className="btn"
              onClick={() => setSoundMuted((m) => !m)}
              style={{ padding: "6px 10px", fontSize: "0.8rem" }}
            >
              {soundMuted ? "🔇 Muted" : "🔊 On"}
            </button>
          </div>
        )}


        {isHost ? (
          <div
            className="btn-row"
            style={{ marginTop: "0.75rem", gap: "0.5rem", flexWrap: "wrap" }}
          >
            {status === "lobby" && (
              <button className="btn primary" onClick={handleStart}>
                ▶ Start game
              </button>
            )}

            {status === "in-progress" && phase === "question" && (
              <>
                <button className="btn" onClick={handleReveal}>
                  👁 Reveal answers
                </button>
                <button className="btn danger" onClick={handleEnd}>
                  ⏹ End game
                </button>
              </>
            )}

            {status === "in-progress" && phase === "reveal" && (
              <>
                <button className="btn" onClick={handleNextQuestion}>
                  {isLastQuestion ? "🏁 Finish game" : "⏭ Next question"}
                </button>
                <button className="btn danger" onClick={handleEnd}>
                  ⏹ End game
                </button>
              </>
            )}

            {status === "finished" && (
              <button className="btn danger" onClick={handleEnd}>
                Close game
              </button>
            )}
          </div>
        ) : (
          <p className="muted" style={{ marginTop: ".75rem" }}>
            You are not the host of this game.
          </p>
        )}
      </section>

      {/* Current question + responses */}
      <section
        className="card"
        style={{ marginTop: "1rem", padding: "1.1rem 1.25rem" }}
      >
        <h2 style={{ marginBottom: ".5rem" }}>Current question</h2>

        {loadingItems && <p>Loading questions…</p>}

        {!loadingItems && !currentItem && (
          <p className="muted">
            No question available. You may have reached the end of the set.
          </p>
        )}

        {!loadingItems && currentItem && (
          <>
            <p
              style={{
                marginBottom: ".75rem",
                lineHeight: 1.5,
              }}
            >
              <strong>
                {(currentItem.sentence || currentItem.text || "").replace(
                  "___",
                  "_____"
                )}
              </strong>
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: ".4rem",
              }}
            >
              {currentItem.options.map((opt, idx) => {
                const count = responseStats.optionCounts[idx] || 0;
                const isCorrect = idx === responseStats.correctIndex;
                const total = Math.max(answeredCount, 1);
                const pct = Math.round((count / total) * 100);

                const highlight =
                  phase === "reveal" && isCorrect
                    ? {
                        border: "1px solid #22c55e",
                        background: "rgba(34, 197, 94, 0.12)",
                      }
                    : {};

                const hasExplanation =
                  Array.isArray(currentItem.explanations) &&
                  currentItem.explanations[idx];

                const isSelected = selectedExplanationIndex === idx;

                const canClickForExplanation =
                  isHost && phase === "reveal" && hasExplanation;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (!canClickForExplanation) return;
                      setSelectedExplanationIndex((prev) =>
                        prev === idx ? null : idx
                      );
                    }}
                    style={{
                      padding: ".4rem .6rem",
                      borderRadius: ".6rem",
                      border: "1px solid #1e293b",
                      background: "#020617",
                      fontSize: ".92rem",
                      cursor: canClickForExplanation ? "pointer" : "default",
                      boxShadow: isSelected
                        ? "0 0 0 1px rgba(59,130,246,0.7)"
                        : "none",
                      ...highlight,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: ".5rem",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            display: "inline-block",
                            width: "1.5rem",
                            fontWeight: 600,
                          }}
                        >
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        {opt}
                      </div>
                      <div
                        style={{
                          fontSize: ".8rem",
                          opacity: 0.8,
                          textAlign: "right",
                        }}
                      >
                        <div>{count} answers</div>
                        <div>{pct}%</div>
                      </div>
                    </div>

                    {isSelected && hasExplanation && (
                      <p
                        className="tiny muted"
                        style={{
                          marginTop: ".4rem",
                          paddingTop: ".35rem",
                          borderTop: "1px dashed rgba(148,163,184,0.4)",
                        }}
                      >
                        {currentItem.explanations[idx]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {phase === "question" && (
              <p className="tiny muted" style={{ marginTop: ".6rem" }}>
                Students can answer now. When you’re ready, click{" "}
                <strong>Reveal answers</strong>, then{" "}
                <strong>Next question</strong>.
              </p>
            )}

            {phase === "reveal" && (
              <p className="tiny muted" style={{ marginTop: ".6rem" }}>
                Correct option is highlighted. Click{" "}
                <strong>
                  {isLastQuestion ? "Finish game" : "Next question"}
                </strong>{" "}
                when you are ready.
              </p>
            )}
          </>
        )}
      </section>

      {status === "finished" && topThree.length > 0 && (
        <section className="card" style={{ marginTop: "1rem" }}>
          <h2>Game finished 🎉</h2>
          <p className="muted">
            Great job! Here are the top players for this game.
          </p>

          <div className="podium-row">
            {/* 2nd place */}
            {topThree[1] && (
              <div className="podium-column second">
                <span className="podium-rank">🥈 2nd</span>
                <div className="podium-name">
                  {topThree[1].name || "Player"}
                </div>
                <div className="podium-score">
                  {topThree[1].score ?? 0} pts
                </div>
              </div>
            )}

            {/* 1st place */}
            {topThree[0] && (
              <div className="podium-column first">
                <span className="podium-rank">🥇 1st</span>
                <div className="podium-name">
                  {topThree[0].name || "Player"}
                </div>
                <div className="podium-score">
                  {topThree[0].score ?? 0} pts
                </div>
              </div>
            )}

            {/* 3rd place */}
            {topThree[2] && (
              <div className="podium-column third">
                <span className="podium-rank">🥉 3rd</span>
                <div className="podium-name">
                  {topThree[2].name || "Player"}
                </div>
                <div className="podium-score">
                  {topThree[2].score ?? 0} pts
                </div>
              </div>
            )}
          </div>
        </section>
      )}

            {/* Scoreboard – only show after reveal or when finished */}
            {(phase === "reveal" || status === "finished") && (
        <section className="card" style={{ marginTop: "1rem" }}>
          <h2>Scoreboard</h2>
          {sortedPlayers.length === 0 ? (
            <p className="muted">No players joined yet.</p>
          ) : (
            <ol
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: ".25rem",
              }}
            >
              {sortedPlayers.map((p, idx) => (
                <li
                  key={p.uid}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.3rem 0.4rem",
                    borderRadius: "999px",
                    background: "#020617",
                    border: "1px solid #1f2937",
                    fontSize: "0.8rem",
                  }}
                >
                  <span>
                    <strong>{idx + 1}.</strong>{" "}
                    {p.name || p.displayName || "Player"}
                  </span>
                  <span>{p.score ?? 0} pts</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}


      {/* 🔊 Hidden audio elements – only in host view */}
      <audio ref={tickRef} src="/sounds/tick.mp3" preload="auto" />
      <audio ref={tickFastRef} src="/sounds/tick_fast.mp3" preload="auto" />
      <audio ref={revealRef} src="/sounds/reveal.mp3" preload="auto" />
      <audio ref={nextRef} src="/sounds/next.mp3" preload="auto" />
      <audio ref={finishRef} src="/sounds/finish.mp3" preload="auto" />
      <audio ref={timeUpRef} src="/sounds/time_up.mp3" preload="auto" /> {/* 👈 NEW */}
    </div>
  );
}
