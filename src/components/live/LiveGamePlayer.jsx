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
      <h1>Live Game</h1>
      <p className="muted">
        Game PIN: <strong>{game.pin}</strong>
      </p>

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
    </div>
  );
}
