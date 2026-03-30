import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { HUB_SPANGLISH_FIX_IT_ITEMS } from "../../data/hubSpanglishFixItItems.js";
import { createSpanglishLiveGame } from "../../api/liveGames";
import { toast } from "../../utils/toast";
import {
  fetchMyTopHubGameScores,
  fetchTopHubGameScores,
  logHubSpanglishCompleted,
  logHubSpanglishLiveHosted,
  logHubSpanglishReviewStarted,
  logHubSpanglishStarted,
  saveHubGameScore,
} from "../../firebase.js";

const ROUND_SIZE = 15;
const PHASE_MAX_SCORE = 100;
const PHASE_MIN_SCORE = 10;
const PHASE_DURATION_MS = 30000;
const WRONG_PENALTY = 50;
const GAME_ID = "hub_spanglish_fixit";

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeWord(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]|_/g, "");
}

function splitSentence(sentence) {
  return String(sentence || "").split(" ");
}

function getAvailablePoints(elapsedMs) {
  return Math.max(PHASE_MAX_SCORE - Math.floor(elapsedMs / 300), PHASE_MIN_SCORE);
}

function getProgressPercent(points) {
  return ((points - PHASE_MIN_SCORE) / (PHASE_MAX_SCORE - PHASE_MIN_SCORE)) * 100;
}

export default function HubSpanglishFixIt({ user }) {
  const navigate = useNavigate();
  const answerRef = useRef(null);
  const timerRef = useRef(null);
  const phaseStartRef = useRef(0);
  const savedScoreRef = useRef(false);
  const activityLoggedRef = useRef({
    normalStarted: false,
    reviewStarted: false,
    completed: false,
  });

  const [items, setItems] = useState([]);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState("");
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState({
    tone: "info",
    text: "Click the wrong word first, then type the correction.",
  });
  const [revealedCorrectWord, setRevealedCorrectWord] = useState("");
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [phase, setPhase] = useState("idle");
  const [phasePoints, setPhasePoints] = useState(PHASE_MAX_SCORE);
  const [phaseRunKey, setPhaseRunKey] = useState(0);
  const [myTopScores, setMyTopScores] = useState([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);

  const currentSet = reviewMode ? reviewQueue : items;
  const currentItem = currentSet[currentIndex] || null;

  const progressLabel = useMemo(() => {
    const total = currentSet.length || 0;
    const position = total ? currentIndex + 1 : 0;
    return reviewMode ? `Review ${position}/${total}` : `Sentence ${position}/${total}`;
  }, [currentIndex, currentSet.length, reviewMode]);

  const phaseLabel = phase === "correction" ? "Correction timer" : "Find the error";

  function stopPhaseTimer() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function startPhaseTimer(nextPhase) {
    stopPhaseTimer();
    phaseStartRef.current = Date.now();
    setPhase(nextPhase);
    setPhasePoints(PHASE_MAX_SCORE);
    setPhaseRunKey((current) => current + 1);

    timerRef.current = window.setInterval(() => {
      const availablePoints = getAvailablePoints(Date.now() - phaseStartRef.current);
      setPhasePoints((current) => (current === availablePoints ? current : availablePoints));
    }, 100);
  }

  function resetForCurrentSentence() {
    setSelectedWord("");
    setAnswer("");
    setRevealedCorrectWord("");
    setFeedback({
      tone: "info",
      text: "Click the wrong word first, then type the correction.",
    });
    startPhaseTimer("click");
  }

  function focusAnswerField() {
    window.setTimeout(() => {
      if (answerRef.current) {
        answerRef.current.focus();
        answerRef.current.select();
      }
    }, 0);
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    return () => stopPhaseTimer();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadBoards() {
      try {
        const [global, personal] = await Promise.all([
          fetchTopHubGameScores(GAME_ID, 10),
          user?.uid ? fetchMyTopHubGameScores(GAME_ID, 3, user.uid) : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setGlobalLeaderboard(global);
        setMyTopScores(personal);
      } catch (error) {
        console.error("[HubSpanglishFixIt] leaderboard load failed", error);
      }
    }

    loadBoards();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!showSummary || reviewMode || savedScoreRef.current || !user?.uid || score <= 0) return;

    savedScoreRef.current = true;
    saveHubGameScore(GAME_ID, score, {
      totalItems: currentSet.length,
      wrongAnswers: wrongAnswers.length,
    })
      .then(async () => {
        const [global, personal] = await Promise.all([
          fetchTopHubGameScores(GAME_ID, 10),
          fetchMyTopHubGameScores(GAME_ID, 3, user.uid),
        ]);
        setGlobalLeaderboard(global);
        setMyTopScores(personal);
      })
      .catch((error) => {
        console.error("[HubSpanglishFixIt] leaderboard save failed", error);
      });
  }, [showSummary, reviewMode, score, user?.uid, currentSet.length, wrongAnswers.length]);

  useEffect(() => {
    if (!showSummary || reviewMode || activityLoggedRef.current.completed) return;

    activityLoggedRef.current.completed = true;
    logHubSpanglishCompleted({
      mode: "normal",
      score,
      totalItems: currentSet.length,
      wrongAnswers: wrongAnswers.length,
    });
  }, [showSummary, reviewMode, score, currentSet.length, wrongAnswers.length]);

  useEffect(() => {
    if (!started || !currentItem) {
      stopPhaseTimer();
      return;
    }
    resetForCurrentSentence();
    return () => stopPhaseTimer();
  }, [started, currentIndex, reviewMode]);

  function startRound(mode = "normal") {
    if (mode === "normal") {
      savedScoreRef.current = false;
      activityLoggedRef.current.completed = false;
    }
    const source =
      mode === "review"
        ? shuffle(wrongAnswers)
        : shuffle(HUB_SPANGLISH_FIX_IT_ITEMS).slice(0, ROUND_SIZE);

    if (mode === "review") {
      setReviewQueue(source);
    } else {
      setItems(source);
      setWrongAnswers([]);
      setScore(0);
      setReviewQueue([]);
    }

    setReviewMode(mode === "review");
    setStarted(true);
    setShowSummary(false);
    setCurrentIndex(0);
    setPhase("idle");
    setPhasePoints(PHASE_MAX_SCORE);

    if (mode === "review") {
      activityLoggedRef.current.reviewStarted = true;
      logHubSpanglishReviewStarted({
        mode: "review",
        total: source.length,
      });
      return;
    }

    activityLoggedRef.current.normalStarted = true;
    logHubSpanglishStarted({
      mode: "normal",
      total: source.length,
      poolSize: HUB_SPANGLISH_FIX_IT_ITEMS.length,
    });
  }

  function handleWordClick(word) {
    if (!currentItem || phase !== "click") return;

    stopPhaseTimer();

    const normalizedClicked = normalizeWord(word);
    const normalizedError = normalizeWord(currentItem.errorWord);
    const wasCorrectClick = normalizedClicked === normalizedError;
    const clickScore = getAvailablePoints(Date.now() - phaseStartRef.current);

    setSelectedWord(word);
    setRevealedCorrectWord(currentItem.errorWord);

    if (wasCorrectClick) {
      if (!reviewMode) {
        setScore((s) => s + clickScore);
      }
      setFeedback({
        tone: "ok",
        text: `Nice spot. You selected "${word}". Now type the correction.`,
      });
    } else {
      if (!reviewMode) {
        setScore((s) => s - WRONG_PENALTY);
        setWrongAnswers((current) => {
          if (current.some((item) => item.id === currentItem.id)) return current;
          return [...current, currentItem];
        });
      }
      setFeedback({
        tone: "bad",
        text: `That wasn’t the target word. The incorrect word is "${currentItem.errorWord}". Now type the correction.`,
      });
    }

    startPhaseTimer("correction");
    focusAnswerField();
  }

  function moveNext() {
    stopPhaseTimer();
    if (currentIndex + 1 >= currentSet.length) {
      setShowSummary(true);
      setStarted(false);
      setPhase("idle");
      return;
    }
    setCurrentIndex((i) => i + 1);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!currentItem) return;
    if (!selectedWord) {
      setFeedback({ tone: "bad", text: "Click the wrong word before you type the correction." });
      return;
    }
    if (phase !== "correction") return;

    stopPhaseTimer();

    const normalizedAnswer = normalizeWord(answer);
    const accepted = currentItem.correctAnswers.map(normalizeWord);
    const isCorrect = accepted.includes(normalizedAnswer);
    const correctionScore = getAvailablePoints(Date.now() - phaseStartRef.current);

    if (isCorrect) {
      if (!reviewMode) {
        setScore((s) => s + correctionScore);
      }
      setFeedback({
        tone: "ok",
        text: `Correct. Accepted answer${currentItem.correctAnswers.length > 1 ? "s" : ""}: ${currentItem.correctAnswers.join(" / ")}.`,
      });
      window.setTimeout(moveNext, 900);
      return;
    }

    if (!reviewMode) {
      setScore((s) => s - WRONG_PENALTY);
      setWrongAnswers((current) => {
        if (current.some((item) => item.id === currentItem.id)) return current;
        return [...current, currentItem];
      });
    }
    setFeedback({
      tone: "bad",
      text: `Not quite. Accepted answer${currentItem.correctAnswers.length > 1 ? "s" : ""}: ${currentItem.correctAnswers.join(" / ")}.`,
    });
    window.setTimeout(moveNext, 1100);
  }

  async function handleHostLiveGame() {
    if (!user || (user.role !== "teacher" && user.role !== "admin")) {
      toast("Only teachers can host live Spanglish games.");
      return;
    }

    try {
      const items = shuffle(HUB_SPANGLISH_FIX_IT_ITEMS).slice(0, ROUND_SIZE);
      const { gameId, pin } = await createSpanglishLiveGame({ items });
      await logHubSpanglishLiveHosted({
        gameId,
        pin,
        roundCount: items.length,
      });
      toast(`Live game created – PIN ${pin}`);
      navigate(getSitePath(`/games/spanglish-fix-it/host/${gameId}`));
    } catch (error) {
      console.error("[HubSpanglishFixIt] create live game failed", error);
      toast(error.message || "Could not create the live game.");
    }
  }

  return (
    <div className="menu-wrapper hub-spanglish-shell">
      <Seo
        title="Spanglish Fix-It | Seif Hub"
        description="Spot and correct common Spanish-to-English mistakes inside the Seif Hub."
      />

      <div className="hub-spanglish-topbar">
        <div className="hub-spanglish-intro">
          <p className="hub-spanglish-kicker">Games</p>
          <div className="hub-spanglish-title-wrap">
            <img
              src="/images/spanglish-title.png"
              alt="Spanglish Fix-It"
              className="hub-spanglish-title-image"
              draggable="false"
            />
          </div>
          <p className="hub-spanglish-copy">
            Spot the wrong word, correct it quickly, and build faster awareness of common Spanish-to-English transfer mistakes.
          </p>
          {user?.role === "teacher" || user?.role === "admin" ? (
            <div className="hub-spanglish-host-actions">
              <button className="review-btn selected-pill" onClick={handleHostLiveGame}>
                Host live game
              </button>
            </div>
          ) : null}
        </div>

        <button className="review-btn hub-spanglish-back-btn" onClick={() => navigate(getSitePath("/games"))}>
          Back to games
        </button>
      </div>

      {!started && !showSummary && (
        <div className="hub-spanglish-panel">
          <h2>How it works</h2>
          <ul className="hub-spanglish-list">
            <li>Read each sentence carefully.</li>
            <li>Click the word that sounds wrong in English.</li>
            <li>Type the correction and press Enter.</li>
            <li>Both parts are timed, so quicker accurate answers score higher.</li>
          </ul>

          <div className="hub-spanglish-actions">
            <button className="whats-new-btn" onClick={() => startRound("normal")}>
              Start game
            </button>
          </div>
        </div>
      )}

      {started && currentItem && (
        <div className="hub-spanglish-panel">
          <div className="hub-spanglish-stats">
            <span className="pill">{progressLabel}</span>
            <span className="pill">Score: {score}</span>
            {reviewMode ? <span className="pill">Review mode</span> : null}
          </div>

          <div className="hub-spanglish-phase">
            <div className="hub-spanglish-phase-copy">
              <strong>{phaseLabel}</strong>
              <span>{phasePoints} pts available</span>
            </div>
            <div className="hub-spanglish-meter" aria-hidden="true">
              <div
                key={phaseRunKey}
                className="hub-spanglish-meter-fill"
                style={{ animationDuration: `${PHASE_DURATION_MS}ms` }}
              />
            </div>
          </div>

          <div className="hub-spanglish-sentence">
            {splitSentence(currentItem.sentence).map((word, index) => {
              const cleanWord = normalizeWord(word);
              const isTarget = revealedCorrectWord && cleanWord === normalizeWord(currentItem.errorWord);
              const isSelected = selectedWord && cleanWord === normalizeWord(selectedWord);
              return (
                <button
                  key={`${currentItem.id}-${index}`}
                  type="button"
                  className={`hub-spanglish-word ${isTarget ? "is-target" : ""} ${isSelected ? "is-selected" : ""}`}
                  onClick={() => handleWordClick(word)}
                  disabled={phase !== "click"}
                >
                  {word}
                </button>
              );
            })}
          </div>

          <form className="hub-spanglish-answer" onSubmit={handleSubmit}>
            <label htmlFor="spanglish-answer">Correction</label>
            <textarea
              id="spanglish-answer"
              ref={answerRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={2}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="Type the correct word"
              disabled={phase !== "correction"}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSubmit(event);
                }
              }}
            />
            <button className="whats-new-btn" type="submit" disabled={phase !== "correction"}>
              Check
            </button>
          </form>

          <div className={`hub-spanglish-feedback is-${feedback.tone}`}>{feedback.text}</div>
        </div>
      )}

      {showSummary && (
        <div className="hub-spanglish-panel">
          <h2>{reviewMode ? "Review complete" : "Round complete"}</h2>
          <p className="hub-spanglish-copy">
            Final score: <strong>{score}</strong>
          </p>
          {!reviewMode && wrongAnswers.length > 0 ? (
            <p className="hub-spanglish-copy">
              You saved {wrongAnswers.length} sentence{wrongAnswers.length === 1 ? "" : "s"} for review.
            </p>
          ) : null}

          <div className="hub-spanglish-actions">
            {!reviewMode && wrongAnswers.length > 0 ? (
              <button className="review-btn selected-pill" onClick={() => startRound("review")}>
                Review mistakes
              </button>
            ) : null}
            <button className="whats-new-btn" onClick={() => startRound("normal")}>
              Play again
            </button>
          </div>

          <div className="hub-spanglish-leaderboards">
            <div className="hub-spanglish-board">
              <h3>Your top scores</h3>
              {user?.uid ? (
                myTopScores.length ? (
                  <div className="hub-spanglish-board-list">
                    {myTopScores.map((entry, index) => (
                      <div key={entry.id} className="hub-spanglish-board-row">
                        <span>#{index + 1}</span>
                        <strong>{entry.score}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="hub-spanglish-board-empty">No saved scores yet.</p>
                )
              ) : (
                <p className="hub-spanglish-board-empty">Sign in to save your top 3 scores.</p>
              )}
            </div>

            <div className="hub-spanglish-board">
              <h3>Global leaderboard</h3>
              {globalLeaderboard.length ? (
                <div className="hub-spanglish-board-list">
                  {globalLeaderboard.map((entry, index) => (
                    <div key={entry.id} className="hub-spanglish-board-row">
                      <span>#{index + 1}</span>
                      <em>{entry.displayName}</em>
                      <strong>{entry.score}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="hub-spanglish-board-empty">No leaderboard scores yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hub-spanglish-shell {
          padding-top: 0;
          margin-top: 0;
        }

        .hub-spanglish-topbar {
          position: relative;
          display: block;
          margin-bottom: 1rem;
          min-height: 70px;
        }

        .hub-spanglish-intro {
          max-width: 760px;
          margin: 0 auto;
        }

        .hub-spanglish-kicker {
          margin: 0 0 .25rem;
          font-size: .82rem;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: #8eb6ff;
        }

        .hub-spanglish-topbar h1 {
          margin: 0;
          font-size: clamp(1.7rem, 1.35rem + 1vw, 2.35rem);
          color: #eef4ff;
        }

        .hub-spanglish-title-wrap {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .hub-spanglish-title-image {
          display: block;
          width: clamp(180px, 24vw, 280px);
          height: auto;
          margin: 0;
          filter: drop-shadow(0 10px 22px rgba(0, 0, 0, 0.18));
        }

        .hub-spanglish-copy {
          margin: .4rem 0 0;
          color: rgba(230, 240, 255, 0.82);
          line-height: 1.45;
        }

        .hub-spanglish-panel {
          background: rgba(20, 33, 59, 0.86);
          border: 1px solid rgba(77, 110, 184, 0.38);
          border-radius: 22px;
          padding: 1.1rem 1.2rem;
          box-shadow: 0 12px 26px rgba(0, 0, 0, 0.16);
          max-width: 760px;
          margin: 0 auto;
        }

        .hub-spanglish-panel h2 {
          margin-top: 0;
          color: #eef4ff;
        }

        .hub-spanglish-shell .review-btn,
        .hub-spanglish-shell .whats-new-btn {
          min-height: 48px;
          padding: .82rem 1.1rem;
          border-radius: 14px;
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: .01em;
          transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease, background .12s ease, color .12s ease;
        }

        .hub-spanglish-shell .review-btn {
          background: rgba(35, 52, 92, 0.9);
          color: #e8f0ff;
          border: 2px solid rgba(86, 118, 196, 0.45);
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.14);
        }

        .hub-spanglish-shell .hub-spanglish-back-btn {
          position: absolute;
          top: 0;
          right: 0;
        }

        .hub-spanglish-shell .review-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(111, 146, 230, 0.72);
          box-shadow: 0 14px 24px rgba(0, 0, 0, 0.18);
        }

        .hub-spanglish-shell .review-btn.selected-pill {
          background: linear-gradient(180deg, rgba(44, 66, 116, 0.98), rgba(32, 51, 91, 0.98));
          color: #dfeaff;
          border-color: rgba(116, 149, 230, 0.5);
        }

        .hub-spanglish-shell .whats-new-btn {
          background: linear-gradient(180deg, #f6bd60, #e9a93f);
          color: #13213b;
          border: none;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.18);
        }

        .hub-spanglish-shell .whats-new-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 16px 28px rgba(0, 0, 0, 0.22);
        }

        .hub-spanglish-list {
          margin: .35rem 0 0;
          padding-left: 1.2rem;
          color: rgba(230, 240, 255, 0.84);
          line-height: 1.55;
        }

        .hub-spanglish-actions {
          display: flex;
          gap: .65rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        .hub-spanglish-leaderboards {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .hub-spanglish-board {
          border-radius: 18px;
          padding: 1rem;
          background: rgba(16, 24, 46, 0.42);
          border: 1px solid rgba(108, 136, 199, 0.22);
        }

        .hub-spanglish-board h3 {
          margin: 0 0 .75rem;
          color: #eef4ff;
        }

        .hub-spanglish-board-list {
          display: grid;
          gap: .55rem;
        }

        .hub-spanglish-board-row {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: .75rem;
          align-items: center;
          color: rgba(230, 240, 255, 0.9);
        }

        .hub-spanglish-board-row em {
          font-style: normal;
          opacity: .88;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .hub-spanglish-board-empty {
          margin: 0;
          color: rgba(230, 240, 255, 0.72);
        }

        .hub-spanglish-host-actions {
          margin-top: .85rem;
        }

        .hub-spanglish-host-actions .review-btn {
          position: static;
        }

        .hub-spanglish-stats {
          display: flex;
          flex-wrap: wrap;
          gap: .6rem;
          margin-bottom: .9rem;
        }

        .hub-spanglish-phase {
          margin-bottom: 1rem;
        }

        .hub-spanglish-phase-copy {
          display: flex;
          justify-content: space-between;
          gap: .8rem;
          margin-bottom: .45rem;
          color: rgba(230, 240, 255, 0.86);
          font-size: .92rem;
        }

        .hub-spanglish-meter {
          height: 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .hub-spanglish-meter-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #f87171, #facc15, #34d399);
          width: 100%;
          transform-origin: left center;
          animation-name: hubSpanglishDrain;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }

        @keyframes hubSpanglishDrain {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }

        .hub-spanglish-sentence {
          margin-bottom: 1rem;
          font-size: clamp(1.2rem, 1rem + .75vw, 1.65rem);
          line-height: 1.7;
        }

        .hub-spanglish-word {
          display: inline-block;
          margin: 0 .12rem .3rem 0;
          padding: .12rem .28rem;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: #eef4ff;
          font: inherit;
          cursor: pointer;
          transition: background .14s ease, transform .14s ease, opacity .14s ease;
        }

        .hub-spanglish-word:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
        }

        .hub-spanglish-word:disabled {
          cursor: default;
        }

        .hub-spanglish-word.is-selected {
          background: rgba(231, 76, 60, 0.85);
        }

        .hub-spanglish-word.is-target {
          background: rgba(40, 167, 69, 0.82);
        }

        .hub-spanglish-answer {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: .8rem;
          align-items: end;
          margin-bottom: .9rem;
        }

        .hub-spanglish-answer label {
          grid-column: 1 / -1;
          font-size: .92rem;
          font-weight: 700;
          color: rgba(230, 240, 255, 0.82);
        }

        .hub-spanglish-answer textarea {
          min-width: 0;
          width: 100%;
          resize: none;
          padding: .85rem 1rem;
          border-radius: 14px;
          border: 2px solid #35508e;
          background: #020617;
          color: #eef4ff;
          font-size: 1.05rem;
          font-family: inherit;
        }

        .hub-spanglish-answer textarea:disabled,
        .hub-spanglish-answer .whats-new-btn:disabled,
        .hub-spanglish-shell .review-btn:disabled {
          opacity: .6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .hub-spanglish-feedback {
          padding: .9rem 1rem;
          border-radius: 16px;
          line-height: 1.45;
          border: 1px solid transparent;
        }

        .hub-spanglish-feedback.is-info {
          background: rgba(104, 140, 221, 0.12);
          border-color: rgba(104, 140, 221, 0.28);
          color: rgba(230, 240, 255, 0.9);
        }

        .hub-spanglish-feedback.is-ok {
          background: rgba(53, 176, 109, 0.12);
          border-color: rgba(53, 176, 109, 0.3);
          color: #dff7ea;
        }

        .hub-spanglish-feedback.is-bad {
          background: rgba(220, 38, 38, 0.12);
          border-color: rgba(248, 113, 113, 0.28);
          color: #ffe2e2;
        }

        @media (max-width: 720px) {
          .hub-spanglish-leaderboards {
            grid-template-columns: 1fr;
          }

          .hub-spanglish-topbar {
            min-height: 0;
          }

          .hub-spanglish-topbar .hub-spanglish-back-btn {
            position: static;
            width: 100%;
            margin-top: .85rem;
          }

          .hub-spanglish-answer {
            grid-template-columns: 1fr;
          }

          .hub-spanglish-answer .whats-new-btn {
            width: 100%;
          }

          .hub-spanglish-phase-copy {
            flex-direction: column;
            align-items: flex-start;
            gap: .2rem;
          }
        }
      `}</style>
    </div>
  );
}
