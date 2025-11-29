// src/components/live/LiveGamePlayer.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { rtdb, auth } from "../../firebase";
import { submitLiveGameAnswer } from "../../api/liveGames";
import { toast } from "../../utils/toast";

export default function LiveGamePlayer() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loadingGame, setLoadingGame] = useState(true);

  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  const [answerSubmitting, setAnswerSubmitting] = useState(false);
  const [answeredQuestionIndex, setAnsweredQuestionIndex] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(null);

  // NEW: keep track of the last score the player has "seen" (after reveal)
  const [lastRevealedScore, setLastRevealedScore] = useState(null);

  // Subscribe to game node in RTDB
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

  // Subscribe to the canonical shuffled items stored by the host
  useEffect(() => {
    if (!gameId) return;
    const itemsRef = ref(rtdb, `liveGames/${gameId}/items`);
    const unsubscribe = onValue(itemsRef, (snap) => {
      if (snap.exists()) {
        setItems(snap.val());
      } else {
        setItems([]);
      }
      setLoadingItems(false);
    });
    return () => unsubscribe();
  }, [gameId]);

  // Reset local "answered this question" flag when question changes
  useEffect(() => {
    if (!game || !game.state) return;
    setAnsweredQuestionIndex(null);
  }, [game?.state?.questionIndex]);

  // Countdown timer based on questionDeadline
  useEffect(() => {
    if (!game) {
      setRemainingSeconds(null);
      return;
    }

    const deadline = game.state?.questionDeadline;
    const currentStatus = game.status || "lobby";
    const currentPhase = game.state?.phase || "lobby";

    if (
      !deadline ||
      currentStatus !== "in-progress" ||
      currentPhase !== "question"
    ) {
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
  }, [game]);

  // ── Derived values needed for score effects ───────────────────────
  const user = auth.currentUser;
  const uid = user?.uid;
  const me = uid && game?.players ? game.players[uid] : null;

  const phase = game?.state?.phase || "lobby";
  const status = game?.status || "lobby";
  const questionIndex = game?.state?.questionIndex ?? 0;
  const questionDuration = game?.state?.questionDuration ?? 20;

  const playersObj = game?.players || {};
  const players = Object.entries(playersObj).map(([pUid, p]) => ({
    uid: pUid,
    ...p,
  }));

  const sortedPlayers = [...players].sort((a, b) => {
    const sa = a.score || 0;
    const sb = b.score || 0;
    if (sb !== sa) return sb - sa;
    const na = (a.name || "").toLowerCase();
    const nb = (b.name || "").toLowerCase();
    return na.localeCompare(nb);
  });

  const topThree = sortedPlayers.slice(0, 3);

  const myRankIndex =
    uid && sortedPlayers.length
      ? sortedPlayers.findIndex((p) => p.uid === uid)
      : -1;

  const myRank = myRankIndex >= 0 ? myRankIndex + 1 : null;
  const myScore = me?.score ?? 0;


  // 🧮 Score init: when we first know "me", set a baseline score to show
  useEffect(() => {
    if (!me) return;

    if (lastRevealedScore == null) {
      setLastRevealedScore(me.score ?? 0);
    }
  }, [me, lastRevealedScore]);

  // 🧮 Score update: only update visible score on REVEAL or FINISHED
  useEffect(() => {
    if (!me) return;

    if (phase === "reveal" || status === "finished") {
      setLastRevealedScore(me.score ?? 0);
    }
  }, [me, phase, status]);

  // ── Early returns AFTER ALL HOOKS ─────────────────────────────
  if (loadingGame) {
    return (
      <div className="page narrow">
        <p>Connecting to game…</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="page narrow">
        <h1>Live Game</h1>
        <p className="muted">Game not found.</p>
      </div>
    );
  }

  const currentItem =
    !loadingItems && items.length > 0 ? items[questionIndex] : null;

  const hasAnsweredThisQuestion =
    answeredQuestionIndex !== null &&
    answeredQuestionIndex === questionIndex;

  const displayedScore =
    phase === "question" && lastRevealedScore != null
      ? lastRevealedScore
      : me?.score ?? 0;

  // Handle clicking an option
  const handleAnswerClick = async (optionIndex) => {
    if (!user) {
      toast("Please sign in to play.");
      return;
    }
    if (phase !== "question") {
      toast("You can only answer while the question is active.");
      return;
    }
    if (!currentItem) return;
    if (hasAnsweredThisQuestion || answerSubmitting) return;

    const timeUp = remainingSeconds !== null && remainingSeconds <= 0;
    if (timeUp) {
      toast("Time is up for this question.");
      return;
    }

    const correct = optionIndex === currentItem.answerIndex;

    // Time-based scoring: 1000 → 250 depending on how fast
    let scoreDelta = 0;
    if (correct) {
      const maxPoints = 1000;
      const minPoints = 250;
      const dur = questionDuration || 20;

      const remRaw =
        remainingSeconds != null ? Math.max(0, remainingSeconds) : dur;

      const ratio = Math.min(1, Math.max(0, remRaw / dur)); // 0–1
      scoreDelta = Math.round(minPoints + (maxPoints - minPoints) * ratio);
    }

    try {
      setAnswerSubmitting(true);
      await submitLiveGameAnswer({
        gameId,
        questionIndex,
        selectedIndex: optionIndex,
        correct,
        scoreDelta,
      });
      setAnsweredQuestionIndex(questionIndex);
      toast("Answer submitted!");
    } catch (err) {
      console.error("[LiveGamePlayer] submit answer failed", err);
      toast("Could not submit your answer.");
    } finally {
      setAnswerSubmitting(false);
    }
  };

  // High-level message under the header
  let message = "Waiting for the host…";
  if (status === "in-progress") {
    if (phase === "question") {
      message = "Choose the best answer.";
    } else if (phase === "reveal") {
      message = "Check the correct answer and your score.";
    }
  } else if (status === "finished") {
    message = "Game finished – check the final scores!";
  }

  // Feedback about this question for this player
  let questionFeedback = null;
  if (phase === "question" && hasAnsweredThisQuestion) {
    questionFeedback = (
      <p className="tiny muted" style={{ marginTop: ".5rem" }}>
        Answer submitted – wait for your teacher to move on.
      </p>
    );
  } else if (phase === "reveal" && me && me.lastAnswerIndex != null) {
    const wasCorrect = !!me.lastAnswerCorrect;
    questionFeedback = (
      <p
        className="small"
        style={{
          marginTop: ".5rem",
          color: wasCorrect ? "#4ade80" : "#f87171",
          fontWeight: 600,
        }}
      >
        {wasCorrect ? "✔ Correct!" : "✖ Incorrect."}
      </p>
    );
  }

  return (
    <div className="page narrow">
      <style>
        {`
          @keyframes player-podium-pop {
            0% { transform: translateY(8px) scale(0.95); opacity: 0; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
          }

          .player-summary-heading {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.25rem;
          }

          .player-rank-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.25rem 0.6rem;
            border-radius: 999px;
            background: rgba(15,23,42,0.9);
            border: 1px solid rgba(148,163,184,0.6);
            font-size: 0.9rem;
          }

          .player-podium-row {
            display: flex;
            justify-content: center;
            align-items: flex-end;
            gap: 0.75rem;
            margin-top: 0.75rem;
            animation: player-podium-pop 0.35s ease-out forwards;
          }

          .player-podium-col {
            flex: 0 0 4rem;
            text-align: center;
            border-radius: 0.7rem 0.7rem 0.3rem 0.3rem;
            padding: 0.35rem 0.25rem 0.5rem;
            background: rgba(15, 23, 42, 0.96);
            border: 1px solid rgba(148, 163, 184, 0.5);
            font-size: 0.75rem;
          }

          .player-podium-col.first {
            background: linear-gradient(
              180deg,
              rgba(250, 204, 21, 0.2),
              rgba(15, 23, 42, 0.96)
            );
            border-color: rgba(250, 204, 21, 0.7);
          }

          .player-podium-rank {
            font-weight: 700;
            margin-bottom: 0.1rem;
          }

          .player-podium-name {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .player-podium-score {
            opacity: 0.8;
            margin-top: 0.05rem;
          }
        `}
      </style>

      <h1>Live Game</h1>
      <p className="muted">
        Game PIN: <strong>{game.pin}</strong>
      </p>

      {status === "finished" && me && (
        <section className="card" style={{ marginTop: "1rem" }}>
          <h2 className="player-summary-heading">Game over 🎉</h2>

          <p className="muted" style={{ marginBottom: "0.5rem" }}>
            Thanks for playing! Here’s how you did:
          </p>

          {myRank && (
            <div style={{ marginBottom: "0.6rem" }}>
              <div className="player-rank-badge">
                <span>
                  {myRank === 1
                    ? "🥇"
                    : myRank === 2
                    ? "🥈"
                    : myRank === 3
                    ? "🥉"
                    : "🏁"}
                </span>
                <span>
                  You finished <strong>#{myRank}</strong> with{" "}
                  <strong>{myScore} pts</strong>
                </span>
              </div>
            </div>
          )}

          {topThree.length > 0 && (
            <>
              <p className="tiny muted">Top players this game:</p>
              <div className="player-podium-row">
                {/* 2nd */}
                {topThree[1] && (
                  <div className="player-podium-col">
                    <div className="player-podium-rank">🥈 2nd</div>
                    <div className="player-podium-name">
                      {topThree[1].name || "Player"}
                    </div>
                    <div className="player-podium-score">
                      {topThree[1].score ?? 0} pts
                    </div>
                  </div>
                )}

                {/* 1st */}
                {topThree[0] && (
                  <div className="player-podium-col first">
                    <div className="player-podium-rank">🥇 1st</div>
                    <div className="player-podium-name">
                      {topThree[0].name || "Player"}
                    </div>
                    <div className="player-podium-score">
                      {topThree[0].score ?? 0} pts
                    </div>
                  </div>
                )}

                {/* 3rd */}
                {topThree[2] && (
                  <div className="player-podium-col">
                    <div className="player-podium-rank">🥉 3rd</div>
                    <div className="player-podium-name">
                      {topThree[2].name || "Player"}
                    </div>
                    <div className="player-podium-score">
                      {topThree[2].score ?? 0} pts
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      )}

      <div className="card" style={{ marginTop: "1rem" }}>
        <p>{message}</p>
        <p className="muted" style={{ marginTop: ".25rem" }}>
          Question: <strong>{questionIndex + 1}</strong>
        </p>
        {me && (
          <p className="muted">
            You: <strong>{me.name || "Player"}</strong> · Score:{" "}
            <strong>{displayedScore}</strong>
          </p>
        )}
        <p className="muted" style={{ marginTop: ".25rem" }}>
          Time left:{" "}
          <strong>
            {remainingSeconds != null ? remainingSeconds : questionDuration}
          </strong>{" "}
          s
        </p>
      </div>

      {/* Question & options */}
      {status !== "finished" && (
        <div
          className="card"
          style={{ marginTop: "1rem", padding: "1.1rem 1.25rem" }}
        >
          {loadingItems && <p>Loading questions…</p>}

          {!loadingItems && !currentItem && (
            <p className="muted">
              No question available. Your teacher may have reached the end of the
              game.
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
                gap: ".5rem",
              }}
            >
              {currentItem.options.map((opt, idx) => {
                const isSelected =
                  me && me.lastAnswerIndex === idx && hasAnsweredThisQuestion;
                const timeUp =
                  remainingSeconds !== null && remainingSeconds <= 0;
                const isDisabled =
                  phase !== "question" ||
                  hasAnsweredThisQuestion ||
                  answerSubmitting ||
                  timeUp;

                return (
                  <button
                    key={idx}
                    type="button"
                    className="btn"
                    onClick={() => handleAnswerClick(idx)}
                    disabled={isDisabled}
                    style={{
                      // Dark, card-like style to match host view / site theme
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: ".5rem",
                      textAlign: "left",
                      padding: ".5rem .75rem",
                      borderRadius: ".6rem",
                      border: "1px solid #1e293b",
                      backgroundColor: "#020617",
                      color: "#e5e7eb",
                      fontSize: ".95rem",
                      opacity: isDisabled && !isSelected ? 0.7 : 1,
                      outline: isSelected
                        ? "2px solid #38bdf8"
                        : "none",
                    }}
                  >
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
                  </button>
                );
              })}
            </div>

            {questionFeedback}
          </>
        )}
      </div>
      )}
    </div>
  );
}
