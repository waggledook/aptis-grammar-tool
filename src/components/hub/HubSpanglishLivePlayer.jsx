import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import Seo from "../common/Seo.jsx";
import { rtdb } from "../../firebase";
import {
  getSpanglishGuestPlayerId,
  getSpanglishGuestPlayerToken,
  submitSpanglishLiveClick,
  submitSpanglishLiveCorrection,
} from "../../api/liveGames";
import { toast } from "../../utils/toast";

function normalizeWord(value) {
  return String(value || "").toLowerCase().trim().replace(/[^\w\s]|_/g, "");
}

function splitSentence(sentence) {
  return String(sentence || "").split(" ");
}

function computeScore(deadline, durationSeconds) {
  if (!deadline || !durationSeconds) return 10;
  const totalMs = durationSeconds * 1000;
  const remainingMs = Math.max(0, Math.min(totalMs, deadline - Date.now()));
  return Math.max(10, Math.min(100, Math.round(10 + 90 * (remainingMs / totalMs))));
}

function getPointBarPercent(deadline, durationSeconds) {
  if (!deadline || !durationSeconds) return 0;
  const available = computeScore(deadline, durationSeconds);
  return Math.max(0, Math.min(100, ((available - 10) / 90) * 100));
}

export default function HubSpanglishLivePlayer() {
  const { gameId } = useParams();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const playerId = params.get("player") || getSpanglishGuestPlayerId();
  const playerToken = getSpanglishGuestPlayerToken();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState("");
  const [correction, setCorrection] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [phasePoints, setPhasePoints] = useState(10);

  useEffect(() => {
    const gameRef = ref(rtdb, `liveGames/${gameId}`);
    const unsubscribe = onValue(gameRef, (snap) => {
      setGame(snap.exists() ? snap.val() : null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [gameId]);

  useEffect(() => {
    const deadline = game?.state?.questionDeadline;
    if (!deadline) {
      setRemainingSeconds(null);
      return;
    }
    const updateRemaining = () => {
      const diffMs = deadline - Date.now();
      setRemainingSeconds(Math.max(0, Math.ceil(diffMs / 1000)));
    };
    updateRemaining();
    const id = window.setInterval(updateRemaining, 250);
    return () => window.clearInterval(id);
  }, [game?.state?.questionDeadline]);

  useEffect(() => {
    setSelectedWord("");
    setCorrection("");
    setFeedback("");
  }, [game?.state?.roundIndex, game?.state?.phase]);

  const roundIndex = game?.state?.roundIndex ?? 0;
  const phase = game?.state?.phase || "lobby";
  const scoreDeadline = game?.state?.scoreDeadline ?? null;
  const questionDeadline = game?.state?.questionDeadline ?? null;
  const showRoundContent = game?.status === "in-progress" || game?.status === "finished";
  const item = showRoundContent && Array.isArray(game?.items) ? game.items[roundIndex] : null;
  const clickDuration = game?.state?.clickDuration || 25;
  const correctionDuration = game?.state?.correctionDuration || 25;
  const me = playerId && game?.players ? game.players[playerId] : null;
  const clickAnswer = game?.rounds?.[roundIndex]?.clickAnswers?.[playerId] || null;
  const correctionAnswer = game?.rounds?.[roundIndex]?.correctionAnswers?.[playerId] || null;
  const acceptedAnswers = item?.correctAnswers || [];
  const acceptedNormalized = acceptedAnswers.map(normalizeWord);
  const leaderboard = Object.entries(game?.players || {})
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));
  const myRank = leaderboard.findIndex((entry) => entry.id === playerId) + 1;

  const phaseCopy = useMemo(() => {
    if (phase === "lobby") return "Waiting for the teacher to start.";
    if (phase === "click") return "Click the wrong word.";
    if (phase === "correction") return "Type the correction.";
    if (phase === "reveal") return "Answer reveal.";
    if (phase === "finished") return "Game complete.";
    return "";
  }, [phase]);

  const phaseDuration = phase === "click" ? clickDuration : correctionDuration;
  const pointsBarKey = `${roundIndex}-${phase}-${scoreDeadline ?? "none"}`;
  const isGraceActive = (phase === "click" || phase === "correction") && !!questionDeadline && !!scoreDeadline && questionDeadline !== scoreDeadline;

  useEffect(() => {
    if ((phase !== "click" && phase !== "correction") || !scoreDeadline) {
      setPhasePoints(10);
      return;
    }
    const duration = phase === "click" ? clickDuration : correctionDuration;
    const updatePoints = () => {
      setPhasePoints(computeScore(scoreDeadline, duration));
    };
    updatePoints();
    const id = window.setInterval(updatePoints, 100);
    return () => window.clearInterval(id);
  }, [phase, scoreDeadline, clickDuration, correctionDuration]);

  const pointsBarStyle = useMemo(() => {
    if ((phase !== "click" && phase !== "correction") || !scoreDeadline) {
      return { width: "0%" };
    }
    const duration = phaseDuration * 1000;
    const phaseStart = scoreDeadline - duration;
    const elapsed = Math.max(0, Math.min(duration, Date.now() - phaseStart));
    if (elapsed >= duration) {
      return { width: "0%" };
    }
    return {
      animationDuration: `${duration}ms`,
      animationDelay: `${-elapsed}ms`,
    };
  }, [phase, phaseDuration, scoreDeadline, roundIndex]);

  async function handleWordClick(word) {
    if (!item || phase !== "click" || clickAnswer) return;
    try {
      const correct = normalizeWord(word) === normalizeWord(item.errorWord);
      const scoreDelta = correct
        ? computeScore(scoreDeadline, clickDuration)
        : 0;
      setSelectedWord(word);
      setFeedback(correct ? "Correct word selected." : `Not quite. The error is "${item.errorWord}".`);
      await submitSpanglishLiveClick({
        gameId,
        roundIndex,
        playerId,
        playerToken,
        selectedWord: word,
        correct,
        scoreDelta,
      });
    } catch (error) {
      console.error("[HubSpanglishLivePlayer] click submit failed", error);
      toast("Could not submit your click.");
    }
  }

  async function handleCorrectionSubmit(event) {
    event.preventDefault();
    if (!item || phase !== "correction" || correctionAnswer) return;
    try {
      const normalizedAnswer = normalizeWord(correction);
      const correct = acceptedNormalized.includes(normalizedAnswer);
      const scoreDelta = correct
        ? computeScore(scoreDeadline, correctionDuration)
        : 0;
      setFeedback(correct ? "Correction submitted." : "Correction submitted. You’ll see the accepted answer in the reveal phase.");
      await submitSpanglishLiveCorrection({
        gameId,
        roundIndex,
        playerId,
        playerToken,
        answer: correction,
        correct,
        scoreDelta,
      });
    } catch (error) {
      console.error("[HubSpanglishLivePlayer] correction submit failed", error);
      toast("Could not submit your correction.");
    }
  }

  if (loading) {
    return <div className="page narrow"><p>Joining live game…</p></div>;
  }

  if (!game) {
    return <div className="page narrow"><p>Live game not found.</p></div>;
  }

  const effectiveSelectedWord = clickAnswer?.selectedWord || selectedWord;
  const selectedWasCorrect = clickAnswer?.correct ?? (
    effectiveSelectedWord
      ? normalizeWord(effectiveSelectedWord) === normalizeWord(item?.errorWord)
      : false
  );

  return (
    <div className="menu-wrapper hub-spanglish-live-shell">
      <Seo title="Play Spanglish Fix-It Live | Seif Hub" description="Play an open live Spanglish Fix-It game." />
      <div className="hub-live-panel">
        <p className="hub-live-kicker">Spanglish live</p>
        <h1>{game.title || "Spanglish Fix-It"}</h1>
        <div className="hub-live-meta">
          <span className="pill">{me?.name || "Guest"}</span>
          <span className="pill">Score: {me?.score || 0}</span>
          {remainingSeconds != null ? <span className="pill">{remainingSeconds}s</span> : null}
          {isGraceActive ? <span className="pill">Grace period</span> : null}
        </div>
        <p className="hub-live-copy">{phaseCopy}</p>
        {(phase === "click" || phase === "correction") && scoreDeadline ? (
          <div className="hub-live-points-wrap" aria-label="Points available">
            <div className="hub-live-points-row">
              <strong>{phase === "click" ? "Find the error" : "Type the correction"}</strong>
              <span>{phasePoints} pts available</span>
            </div>
            <div className="hub-live-points-bar">
              <div key={pointsBarKey} className="hub-live-points-fill is-animated" style={pointsBarStyle} />
            </div>
          </div>
        ) : null}
      </div>

      {phase === "lobby" ? (
        <div className="hub-live-panel">
          <h2>Waiting room</h2>
          <p className="hub-live-copy">You’re in. Wait for your teacher to start the game.</p>
        </div>
      ) : null}

      {phase === "finished" ? (
        <div className="hub-live-panel hub-live-finish">
          <p className="hub-live-kicker">Game complete</p>
          <h2>Nice work{me?.name ? `, ${me.name}` : ""}.</h2>
          <div className="hub-live-meta">
            <span className="pill">Final score: {me?.score || 0}</span>
            {myRank > 0 ? <span className="pill">Rank: #{myRank}</span> : null}
            <span className="pill">Players: {leaderboard.length}</span>
          </div>
          <p className="hub-live-copy">Your teacher can now review the podium and full game report on the host screen.</p>
          <div className="hub-live-finish-board">
            {leaderboard.slice(0, 3).map((entry, index) => (
              <div
                key={`finish-${entry.id}`}
                className={`hub-live-finish-card ${entry.id === playerId ? "is-me" : ""}`}
              >
                <strong>{index + 1}. {entry.name || "Guest"}</strong>
                <span>{entry.score || 0} pts</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {item && phase !== "finished" ? (
        <div className="hub-live-panel">
          <p className="hub-live-copy">Round {roundIndex + 1} / {(game.items || []).length}</p>

          <div className="hub-live-sentence">
            {splitSentence(item.sentence).map((word, index) => (
              <button
                key={`${item.id}-${index}`}
                type="button"
                className={[
                  "hub-live-word",
                  effectiveSelectedWord && normalizeWord(word) === normalizeWord(effectiveSelectedWord)
                    ? selectedWasCorrect ? "is-correct" : "is-incorrect"
                    : "",
                  effectiveSelectedWord && !selectedWasCorrect && normalizeWord(word) === normalizeWord(item.errorWord)
                    ? "is-target"
                    : "",
                ].filter(Boolean).join(" ")}
                onClick={() => handleWordClick(word)}
                disabled={phase !== "click" || !!effectiveSelectedWord}
              >
                {word}
              </button>
            ))}
          </div>

          {feedback ? <div className="hub-live-feedback">{feedback}</div> : null}

          {phase === "correction" || correctionAnswer || phase === "reveal" ? (
            <form className="hub-live-form" onSubmit={handleCorrectionSubmit}>
              <label>
                Correction
                <textarea
                  value={correction}
                  onChange={(e) => setCorrection(e.target.value)}
                  disabled={phase !== "correction" || !!correctionAnswer}
                  rows={2}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleCorrectionSubmit(event);
                    }
                  }}
                />
              </label>
              <button className="whats-new-btn" type="submit" disabled={phase !== "correction" || !!correctionAnswer}>
                Submit correction
              </button>
            </form>
          ) : null}

          {phase === "reveal" ? (
            <div className="hub-live-reveal">
              <strong>Error:</strong> {item.errorWord} <br />
              <strong>Accepted answer{item.correctAnswers?.length > 1 ? "s" : ""}:</strong>
              <div className="hub-live-answer-list">
                {acceptedAnswers.map((answer) => (
                  <span key={answer} className="hub-live-answer-chip is-correct">{answer}</span>
                ))}
              </div>
              {correctionAnswer?.answer || correction ? (
                <>
                  <strong>Your answer:</strong>
                  <div className="hub-live-answer-list">
                    <span className={`hub-live-answer-chip ${(correctionAnswer?.correct ?? acceptedNormalized.includes(normalizeWord(correctionAnswer?.answer || correction))) ? "is-correct" : "is-incorrect"}`}>
                      {correctionAnswer?.answer || correction}
                    </span>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <style>{`
        .hub-spanglish-live-shell { padding-top:0; margin-top:0; }
        .hub-live-panel { background:rgba(20,33,59,.86); border:1px solid rgba(77,110,184,.38); border-radius:22px; padding:1.1rem 1.2rem; box-shadow:0 12px 26px rgba(0,0,0,.16); max-width:760px; margin:0 auto 1rem; }
        .hub-live-kicker { margin:0 0 .25rem; font-size:.82rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:#8eb6ff; }
        .hub-live-panel h1, .hub-live-panel h2 { margin-top:0; color:#eef4ff; }
        .hub-live-copy { color:rgba(230,240,255,.82); line-height:1.45; }
        .hub-live-meta { display:flex; flex-wrap:wrap; gap:.6rem; margin:.75rem 0; }
        .hub-spanglish-live-shell .review-btn,
        .hub-spanglish-live-shell .whats-new-btn {
          min-height:48px;
          padding:.82rem 1.1rem;
          border-radius:14px;
          font-size:1rem;
          font-weight:800;
          letter-spacing:.01em;
          transition:transform .12s ease, box-shadow .12s ease, border-color .12s ease, background .12s ease, color .12s ease;
        }
        .hub-spanglish-live-shell .review-btn {
          background:rgba(35,52,92,.9);
          color:#e8f0ff;
          border:2px solid rgba(86,118,196,.45);
          box-shadow:0 10px 22px rgba(0,0,0,.14);
        }
        .hub-spanglish-live-shell .review-btn:hover {
          transform:translateY(-1px);
          border-color:rgba(111,146,230,.72);
          box-shadow:0 14px 24px rgba(0,0,0,.18);
        }
        .hub-spanglish-live-shell .whats-new-btn {
          background:linear-gradient(180deg, #f6bd60, #e9a93f);
          color:#13213b;
          border:none;
          box-shadow:0 12px 24px rgba(0,0,0,.18);
        }
        .hub-spanglish-live-shell .whats-new-btn:hover:not(:disabled) {
          transform:translateY(-1px);
          box-shadow:0 16px 28px rgba(0,0,0,.22);
        }
        .hub-live-points-wrap { margin-top:.75rem; }
        .hub-live-points-row { display:flex; justify-content:space-between; gap:1rem; align-items:center; color:#eef4ff; font-weight:700; margin-bottom:.45rem; }
        .hub-live-points-row span { color:rgba(230,240,255,.8); font-weight:600; }
        .hub-live-points-bar { width:100%; height:14px; border-radius:999px; background:rgba(255,255,255,.12); overflow:hidden; box-shadow:inset 0 0 0 1px rgba(255,255,255,.08); }
        .hub-live-points-fill { height:100%; border-radius:999px; background:linear-gradient(90deg, #f87171 0%, #facc15 45%, #4ade80 100%); }
        .hub-live-points-fill.is-animated { width:100%; transform-origin:left center; animation-name:hubLivePointsDrain; animation-timing-function:linear; animation-fill-mode:forwards; }
        @keyframes hubLivePointsDrain {
          from { transform:scaleX(1); }
          to { transform:scaleX(0); }
        }
        .hub-live-sentence { margin:1rem 0; font-size:clamp(1.15rem, 1rem + .6vw, 1.5rem); line-height:1.7; }
        .hub-live-word { display:inline-block; margin:0 .12rem .3rem 0; padding:.12rem .28rem; border-radius:12px; border:none; background:transparent; color:#eef4ff; font:inherit; cursor:pointer; }
        .hub-live-word:hover:not(:disabled) { background:rgba(255,255,255,.1); }
        .hub-live-word.is-correct { background:rgba(40,167,69,.82); }
        .hub-live-word.is-incorrect { background:rgba(231,76,60,.85); }
        .hub-live-word.is-target { background:rgba(40,167,69,.82); }
        .hub-live-form { display:grid; gap:.8rem; }
        .hub-live-form label { display:grid; gap:.45rem; color:#e8f0ff; font-weight:700; }
        .hub-live-form textarea { resize:none; padding:.85rem 1rem; border-radius:14px; border:2px solid #35508e; background:#020617; color:#eef4ff; font-size:1rem; font-family:inherit; }
        .hub-live-feedback { margin:.65rem 0 1rem; padding:.8rem .95rem; border-radius:14px; background:rgba(104,140,221,.12); border:1px solid rgba(104,140,221,.28); color:#eef4ff; line-height:1.45; }
        .hub-live-reveal { margin-top:1rem; padding:.9rem 1rem; border-radius:16px; background:rgba(104,140,221,.12); border:1px solid rgba(104,140,221,.28); color:#eef4ff; line-height:1.5; }
        .hub-live-answer-list { display:flex; flex-wrap:wrap; gap:.45rem; margin:.45rem 0 .75rem; }
        .hub-live-answer-chip { display:inline-flex; align-items:center; padding:.42rem .62rem; border-radius:999px; border:1px solid rgba(118,146,219,.28); background:rgba(255,255,255,.05); color:#eef4ff; font-size:.9rem; font-weight:700; }
        .hub-live-answer-chip.is-correct { background:rgba(40,167,69,.14); border-color:rgba(40,167,69,.4); color:#dbf8e6; }
        .hub-live-answer-chip.is-incorrect { background:rgba(231,76,60,.13); border-color:rgba(231,76,60,.34); color:#ffe1de; }
        .hub-live-finish { text-align:center; }
        .hub-live-finish-board { display:grid; gap:.7rem; margin-top:1rem; }
        .hub-live-finish-card { display:flex; justify-content:space-between; gap:1rem; align-items:center; padding:.9rem 1rem; border-radius:16px; background:rgba(255,255,255,.05); border:1px solid rgba(118,146,219,.24); color:#eef4ff; }
        .hub-live-finish-card.is-me { background:rgba(246,189,96,.12); border-color:rgba(246,189,96,.38); }
      `}</style>
    </div>
  );
}
