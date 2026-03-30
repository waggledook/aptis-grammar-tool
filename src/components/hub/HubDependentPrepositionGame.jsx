import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { useTickSound } from "../../hooks/useTickSound.js";
import {
  fetchMyTopHubGameScores,
  fetchTopHubGameScores,
  logHubDependentPrepsCompleted,
  logHubDependentPrepsReviewStarted,
  logHubDependentPrepsStarted,
  saveHubGameScore,
} from "../../firebase.js";
import {
  HUB_DEPENDENT_PREPOSITION_BANKS,
  HUB_DEPENDENT_PREPOSITION_LEVEL_ORDER,
  getDependentPrepositionLevel,
} from "../../data/hubDependentPrepositionItems.js";

const ROUND_SECONDS = 60;

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeAnswer(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[’']/g, "'");
}

function getAcceptedAnswers(item) {
  return (item?.acceptedAnswers || [item?.preposition || ""]).map(normalizeAnswer);
}

function getBlankSentence(item) {
  if (!item) return "";
  if (item.gappedSentence) return item.gappedSentence;
  if (!item.sentence || !item.preposition) return item?.sentence || "";

  const escaped = String(item.preposition).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return String(item.sentence).replace(new RegExp(`\\b${escaped}\\b`, "i"), "_____");
}

function buildRoundQueue(items) {
  return {
    order: shuffle(items).map((item) => item.id),
    cursor: 0,
  };
}

function getNextRoundItem(items, queueState) {
  if (!items.length) return { item: null, queueState };

  let nextQueue = queueState;
  if (!nextQueue.order.length || nextQueue.cursor >= nextQueue.order.length) {
    nextQueue = buildRoundQueue(items);
  }

  const nextId = nextQueue.order[nextQueue.cursor];
  const item = items.find((entry) => entry.id === nextId) || items[0];

  return {
    item,
    queueState: {
      ...nextQueue,
      cursor: nextQueue.cursor + 1,
    },
  };
}

export default function HubDependentPrepositionGame({ user }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const advanceTimeoutRef = useRef(null);
  const savedScoreRef = useRef(false);
  const activityLoggedRef = useRef({
    started: false,
    reviewStarted: false,
    completed: false,
  });
  const timeUpRef = useRef(null);
  const correctRef = useRef(null);
  const incorrectRef = useRef(null);
  const previousTimeRef = useRef(ROUND_SECONDS);
  const { tickRef, tickFastRef, playTick } = useTickSound();

  const [selectedLevel, setSelectedLevel] = useState("a2");
  const [mode, setMode] = useState("setup");
  const [currentItem, setCurrentItem] = useState(null);
  const [answer, setAnswer] = useState("");
  const [answerTone, setAnswerTone] = useState("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [soundMuted, setSoundMuted] = useState(false);
  const [feedback, setFeedback] = useState({
    tone: "info",
    text: "Choose a level and start a timed round when you're ready.",
  });
  const [report, setReport] = useState([]);
  const [reviewItems, setReviewItems] = useState([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [roundQueue, setRoundQueue] = useState({ order: [], cursor: 0 });
  const [stats, setStats] = useState({
    attempted: 0,
    correct: 0,
    wrong: 0,
  });
  const [myTopScores, setMyTopScores] = useState([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);

  const currentLevel = useMemo(
    () => getDependentPrepositionLevel(selectedLevel),
    [selectedLevel],
  );
  const leaderboardGameId = useMemo(
    () => `hub_dependent_prepositions_${selectedLevel}`,
    [selectedLevel],
  );

  const totalItems = currentLevel.items.length;
  const reviewItem = reviewItems[reviewIndex] || null;
  const activeItem = mode === "review" ? reviewItem : currentItem;
  const showInput = mode === "playing" || mode === "review";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (advanceTimeoutRef.current) window.clearTimeout(advanceTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (mode !== "playing") {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (timerRef.current) window.clearInterval(timerRef.current);

    timerRef.current = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
          setMode("report");
          setFeedback({
            tone: "info",
            text: "Time is up. Take a look at your report and review any missed items.",
          });
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [mode]);

  useEffect(() => {
    if (!showInput) return;
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [showInput, currentItem?.id, reviewItem?.id]);

  useEffect(() => {
    let cancelled = false;

    async function loadBoards() {
      try {
        const [global, personal] = await Promise.all([
          fetchTopHubGameScores(leaderboardGameId, 10),
          user?.uid ? fetchMyTopHubGameScores(leaderboardGameId, 3, user.uid) : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setGlobalLeaderboard(global);
        setMyTopScores(personal);
      } catch (error) {
        console.error("[HubDependentPrepositionGame] leaderboard load failed", error);
      }
    }

    loadBoards();
    return () => {
      cancelled = true;
    };
  }, [leaderboardGameId, user?.uid]);

  useEffect(() => {
    if (mode !== "report" || savedScoreRef.current || !stats.attempted || !user?.uid) return;

    savedScoreRef.current = true;
    saveHubGameScore(leaderboardGameId, score, {
      level: currentLevel.label,
      attempted: stats.attempted,
      correct: stats.correct,
      wrong: stats.wrong,
    })
      .then(async () => {
        const [global, personal] = await Promise.all([
          fetchTopHubGameScores(leaderboardGameId, 10),
          fetchMyTopHubGameScores(leaderboardGameId, 3, user.uid),
        ]);
        setGlobalLeaderboard(global);
        setMyTopScores(personal);
      })
      .catch((error) => {
        console.error("[HubDependentPrepositionGame] leaderboard save failed", error);
      });
  }, [mode, score, stats, user?.uid, currentLevel.label, leaderboardGameId]);

  useEffect(() => {
    if (mode !== "report" || activityLoggedRef.current.completed || !stats.attempted) return;

    activityLoggedRef.current.completed = true;
    logHubDependentPrepsCompleted({
      level: currentLevel.label,
      levelId: selectedLevel,
      score,
      attempted: stats.attempted,
      correct: stats.correct,
      wrong: stats.wrong,
    });
  }, [mode, score, stats, currentLevel.label, selectedLevel]);

  useEffect(() => {
    if (mode !== "playing") {
      previousTimeRef.current = ROUND_SECONDS;
      return;
    }

    const previous = previousTimeRef.current;
    if (!soundMuted && timeLeft < previous && timeLeft > 0 && timeLeft <= 3) {
      playTick(true);
    }

    if (!soundMuted && timeLeft === 0 && previous > 0) {
      timeUpRef.current?.play().catch(() => {});
    }

    previousTimeRef.current = timeLeft;
  }, [mode, playTick, soundMuted, timeLeft]);

  useEffect(() => {
    [tickRef, tickFastRef, timeUpRef, correctRef, incorrectRef].forEach((audioRef) => {
      if (audioRef.current) {
        audioRef.current.muted = soundMuted;
      }
    });
  }, [soundMuted, tickRef, tickFastRef]);

  function resetLevelView(levelId = selectedLevel) {
    const level = getDependentPrepositionLevel(levelId);
    savedScoreRef.current = false;
    setMode("setup");
    setCurrentItem(null);
    setAnswer("");
    setAnswerTone("idle");
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setReport([]);
    setReviewItems([]);
    setReviewIndex(0);
    setRoundQueue({ order: [], cursor: 0 });
    setStats({ attempted: 0, correct: 0, wrong: 0 });
    setFeedback({
      tone: "info",
      text: level.items.length
        ? `Choose ${level.label} and start a timed round when you're ready.`
        : `${level.label} is ready for your sentence bank, but there aren't any items there yet.`,
    });
  }

  function beginNextTimedItem(queueState = roundQueue, bank = currentLevel.items) {
    const { item, queueState: nextQueue } = getNextRoundItem(bank, queueState);
    setRoundQueue(nextQueue);
    setCurrentItem(item);
    setAnswer("");
    setAnswerTone("idle");
  }

  function startRound() {
    savedScoreRef.current = false;
    activityLoggedRef.current.completed = false;
    if (advanceTimeoutRef.current) {
      window.clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
    if (!currentLevel.items.length) {
      setFeedback({
        tone: "info",
        text: `${currentLevel.label} is ready for your sentence bank, but there aren't any items there yet.`,
      });
      return;
    }

    const initialQueue = buildRoundQueue(currentLevel.items);
    const { item, queueState } = getNextRoundItem(currentLevel.items, initialQueue);

    setMode("playing");
    setCurrentItem(item);
    setAnswer("");
    setAnswerTone("idle");
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setReport([]);
    setReviewItems([]);
    setReviewIndex(0);
    setRoundQueue(queueState);
    setStats({ attempted: 0, correct: 0, wrong: 0 });
    setFeedback({
      tone: "info",
      text: "Fill the gap with the missing preposition and press Enter. The round keeps going until time runs out.",
    });

    activityLoggedRef.current.started = true;
    logHubDependentPrepsStarted({
      level: currentLevel.label,
      levelId: selectedLevel,
      totalItems: currentLevel.items.length,
      roundSeconds: ROUND_SECONDS,
    });
  }

  function startReview() {
    if (!reviewItems.length) return;
    if (advanceTimeoutRef.current) {
      window.clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
    setMode("review");
    setReviewIndex(0);
    setAnswer("");
    setAnswerTone("idle");
    setFeedback({
      tone: "info",
      text: "Review mode is untimed and unscored. Work through the items you missed.",
    });

    activityLoggedRef.current.reviewStarted = true;
    logHubDependentPrepsReviewStarted({
      level: currentLevel.label,
      levelId: selectedLevel,
      total: reviewItems.length,
    });
  }

  function finishReview() {
    setMode("report");
    setAnswer("");
    setAnswerTone("idle");
    setFeedback({
      tone: "ok",
      text: "Review complete. You can restart the level whenever you want.",
    });
  }

  function handleTimedSubmit(event) {
    event.preventDefault();
    if (!currentItem) return;

    const normalized = normalizeAnswer(answer);
    if (!normalized) {
      setFeedback({ tone: "bad", text: "Type a preposition before you submit." });
      return;
    }

    const acceptedAnswers = getAcceptedAnswers(currentItem);
    const isCorrect = acceptedAnswers.includes(normalized);

    setReport((current) => [
      ...current,
      {
        ...currentItem,
        answer: answer.trim(),
        wasCorrect: isCorrect,
        acceptedAnswers,
      },
    ]);

    setStats((current) => ({
      attempted: current.attempted + 1,
      correct: current.correct + (isCorrect ? 1 : 0),
      wrong: current.wrong + (isCorrect ? 0 : 1),
    }));

    if (isCorrect) {
      setAnswerTone("ok");
      if (!soundMuted) {
        correctRef.current?.play().catch(() => {});
      }
      setScore((current) => current + 5);
      setFeedback({
        tone: "ok",
        text: "Correct. Keep going.",
      });
      beginNextTimedItem();
    } else {
      setAnswerTone("bad");
      if (!soundMuted) {
        incorrectRef.current?.play().catch(() => {});
      }
      setScore((current) => current - 1);
      setReviewItems((current) => {
        if (current.some((item) => item.id === currentItem.id)) return current;
        return [...current, currentItem];
      });
      setFeedback({
        tone: "bad",
        text: `Not this time. Accepted answer${acceptedAnswers.length > 1 ? "s" : ""}: ${acceptedAnswers.join(" / ")}.`,
      });
      if (advanceTimeoutRef.current) window.clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = window.setTimeout(() => {
        beginNextTimedItem();
        advanceTimeoutRef.current = null;
      }, 850);
    }
  }

  function handleReviewSubmit(event) {
    event.preventDefault();
    if (!reviewItem) return;

    const normalized = normalizeAnswer(answer);
    if (!normalized) {
      setAnswerTone("bad");
      setFeedback({ tone: "bad", text: "Type a preposition before you submit." });
      return;
    }

    const acceptedAnswers = getAcceptedAnswers(reviewItem);
    const isCorrect = acceptedAnswers.includes(normalized);

    if (isCorrect) {
      setAnswerTone("ok");
      if (!soundMuted) {
        correctRef.current?.play().catch(() => {});
      }
    } else {
      setAnswerTone("bad");
      if (!soundMuted) {
        incorrectRef.current?.play().catch(() => {});
      }
    }

    setFeedback({
      tone: isCorrect ? "ok" : "bad",
      text: isCorrect
        ? "Correct. Move on to the next review item."
        : `Try again. Accepted answer${acceptedAnswers.length > 1 ? "s" : ""}: ${acceptedAnswers.join(" / ")}.`,
    });

    if (!isCorrect) return;

    if (reviewIndex + 1 >= reviewItems.length) {
      finishReview();
      return;
    }

    setReviewIndex((current) => current + 1);
    setAnswer("");
  }

  function handleSubmit(event) {
    if (mode === "playing") {
      handleTimedSubmit(event);
      return;
    }
    if (mode === "review") {
      handleReviewSubmit(event);
    }
  }

  const progressLabel = useMemo(() => {
    if (mode === "review") {
      return `Review ${reviewIndex + 1} / ${reviewItems.length}`;
    }
    if (mode === "playing") {
      return `${stats.attempted + 1} answered next`;
    }
    return `${totalItems} item${totalItems === 1 ? "" : "s"} in ${currentLevel.label}`;
  }, [mode, reviewIndex, reviewItems.length, stats.attempted, totalItems, currentLevel.label]);

  return (
    <div className="menu-wrapper hub-dependent-wrapper">
      <Seo
        title="Dependent Preposition Challenge | Seif Hub"
        description="Practise verb, adjective, and noun + preposition patterns in a level-based Seif Hub game."
      />

      <div className="hub-dependent-topbar">
        <span className="hub-dependent-kicker">Games</span>
        <button className="hub-dependent-back" onClick={() => navigate(getSitePath("/games"))}>
          Back to games
        </button>
      </div>

      <header className="hub-dependent-hero">
        <div className="hub-dependent-title-row">
          <img
            src="/images/dependent-title.png"
            alt="Dependent Preposition Challenge"
            className="hub-dependent-title-image"
            draggable="false"
          />
        </div>
        <p>
          Build accuracy with the prepositions that naturally follow common verbs, adjectives, and nouns.
          Choose a level, then keep going until the timer runs out.
        </p>
      </header>

      <section className="hub-dependent-stage">
        <div className="hub-dependent-levels" role="tablist" aria-label="Dependent preposition level">
          {HUB_DEPENDENT_PREPOSITION_LEVEL_ORDER.map((levelId) => {
            const level = HUB_DEPENDENT_PREPOSITION_BANKS[levelId];
            const isActive = selectedLevel === levelId;
            return (
              <button
                key={levelId}
                type="button"
                className={`hub-dependent-level-pill ${isActive ? "active" : ""}`}
                onClick={() => {
                  setSelectedLevel(levelId);
                  resetLevelView(levelId);
                }}
              >
                <span>{level.label}</span>
                <small>{level.items.length}</small>
              </button>
            );
          })}
        </div>

        <div className="hub-dependent-level-note">
          <strong>{currentLevel.label}</strong>
          <p>{currentLevel.description}</p>
        </div>

        <div className="hub-dependent-stage-meta-row">
          <div className="hub-dependent-stage-meta">
            <span>{progressLabel}</span>
            <span>Score: {score}</span>
            <span>{mode === "playing" ? `Time: ${timeLeft}s` : "Timed round: 60s"}</span>
          </div>

          <button
            type="button"
            className={`hub-dependent-sound-toggle ${soundMuted ? "muted" : ""}`}
            onClick={() => setSoundMuted((current) => !current)}
          >
            <span className="hub-dependent-sound-icon" aria-hidden="true">
              {soundMuted ? "🔇" : "🔊"}
            </span>
            <span>{soundMuted ? "Sound off" : "Sound on"}</span>
          </button>
        </div>

        {showInput && activeItem ? (
          <form className="hub-dependent-card" onSubmit={handleSubmit}>
            <span className="hub-dependent-card-label">
              {mode === "review" ? `${currentLevel.label} review` : currentLevel.label}
            </span>
            <p className="hub-dependent-sentence">{getBlankSentence(activeItem)}</p>

              <div className="hub-dependent-answer-row">
                <input
                  ref={inputRef}
                  type="text"
                  className={`hub-dependent-answer-input ${answerTone}`}
                  value={answer}
                  onChange={(event) => {
                    setAnswer(event.target.value);
                    if (answerTone !== "idle") setAnswerTone("idle");
                  }}
                  placeholder="Type the missing preposition"
                  autoComplete="off"
                  autoCorrect="off"
                autoCapitalize="none"
                spellCheck="false"
              />
              <button type="submit" className="hub-dependent-check">
                Check
              </button>
            </div>
          </form>
        ) : mode === "report" ? (
          <div className="hub-dependent-report">
            <div className="hub-dependent-report-top">
              <div className="hub-dependent-report-card">
                <span>Attempted</span>
                <strong>{stats.attempted}</strong>
              </div>
              <div className="hub-dependent-report-card">
                <span>Correct</span>
                <strong>{stats.correct}</strong>
              </div>
              <div className="hub-dependent-report-card">
                <span>Wrong</span>
                <strong>{stats.wrong}</strong>
              </div>
              <div className="hub-dependent-report-card">
                <span>Final score</span>
                <strong>{score}</strong>
              </div>
            </div>

            <div className="hub-dependent-report-actions">
              <button className="hub-dependent-start" onClick={startRound}>
                Play again
              </button>
              {reviewItems.length ? (
                <button className="hub-dependent-secondary" onClick={startReview}>
                  Review mistakes
                </button>
              ) : null}
            </div>

            <div className="hub-dependent-leaderboards">
              <div className="hub-dependent-board">
                <h3>Your top scores</h3>
                <p className="hub-dependent-board-sub">{currentLevel.label}</p>
                {user?.uid ? (
                  myTopScores.length ? (
                    <div className="hub-dependent-board-list">
                      {myTopScores.map((entry, index) => (
                        <div key={entry.id} className="hub-dependent-board-row">
                          <span>#{index + 1}</span>
                          <strong>{entry.score}</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="hub-dependent-board-empty">No saved scores yet.</p>
                  )
                ) : (
                  <p className="hub-dependent-board-empty">Sign in to save your top 3 scores.</p>
                )}
              </div>

              <div className="hub-dependent-board">
                <h3>Global leaderboard</h3>
                <p className="hub-dependent-board-sub">{currentLevel.label}</p>
                {globalLeaderboard.length ? (
                  <div className="hub-dependent-board-list">
                    {globalLeaderboard.map((entry, index) => (
                      <div key={entry.id} className="hub-dependent-board-row">
                        <span>#{index + 1}</span>
                        <em>{entry.displayName}</em>
                        <strong>{entry.score}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="hub-dependent-board-empty">No leaderboard scores yet.</p>
                )}
              </div>
            </div>

            <div className="hub-dependent-report-list">
              {report.length ? (
                report.map((entry, index) => (
                  <div
                    key={`${entry.id}-${index}`}
                    className={`hub-dependent-report-item ${entry.wasCorrect ? "ok" : "bad"}`}
                  >
                    <p className="hub-dependent-report-sentence">{getBlankSentence(entry)}</p>
                    <p>
                      <strong>Your answer:</strong> {entry.answer || "—"}
                    </p>
                    <p>
                      <strong>Accepted:</strong> {entry.acceptedAnswers.join(" / ")}
                    </p>
                  </div>
                ))
              ) : (
                <div className="hub-dependent-card hub-dependent-empty">
                  <h3>No answers recorded yet</h3>
                  <p>Start a round to build a full right/wrong report here.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="hub-dependent-card hub-dependent-empty">
            <h3>{currentLevel.label} round setup</h3>
            <p>
              {currentLevel.items.length
                ? `This level currently has ${currentLevel.items.length} sentence${currentLevel.items.length === 1 ? "" : "s"} available.`
                : `No ${currentLevel.label} items have been added yet.`}
            </p>
            <p>
              The game will keep cycling through shuffled items until the timer runs out, only repeating once the whole level has been used.
            </p>
            <button className="hub-dependent-start" onClick={startRound}>
              Start round
            </button>
          </div>
        )}

        <div className={`hub-dependent-feedback ${feedback.tone}`}>
          {feedback.text}
        </div>
      </section>

      <style>{`
        .hub-dependent-wrapper {
          padding-top: 0;
        }

        .hub-dependent-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.1rem;
        }

        .hub-dependent-kicker {
          font-size: 0.9rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 800;
          color: #90b5ff;
        }

        .hub-dependent-back,
        .hub-dependent-secondary {
          border: 2px solid rgba(125, 158, 228, 0.34);
          background: rgba(31, 48, 84, 0.92);
          color: #eef4ff;
          border-radius: 14px;
          padding: 0.78rem 1.05rem;
          font-weight: 800;
          cursor: pointer;
        }

        .hub-dependent-hero {
          max-width: 760px;
          margin-bottom: 1.25rem;
        }

        .hub-dependent-title-row {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .hub-dependent-title-image {
          display: block;
          width: min(100%, 270px);
          height: auto;
          margin: 0 0 0.65rem;
          filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.24));
        }

        .hub-dependent-hero p {
          margin: 0;
          color: rgba(230, 240, 255, 0.88);
          font-size: 1.07rem;
          line-height: 1.55;
        }

        .hub-dependent-stage {
          background: rgba(24, 39, 72, 0.92);
          border: 2px solid rgba(71, 100, 166, 0.64);
          border-radius: 24px;
          padding: 1.25rem;
          box-shadow: 0 20px 44px rgba(5, 12, 28, 0.22);
        }

        .hub-dependent-levels {
          display: flex;
          flex-wrap: wrap;
          gap: 0.7rem;
          margin-bottom: 1rem;
        }

        .hub-dependent-level-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          border-radius: 999px;
          border: 2px solid rgba(104, 132, 196, 0.4);
          background: rgba(31, 48, 84, 0.9);
          color: #dfeaff;
          padding: 0.72rem 0.95rem;
          font-weight: 800;
          cursor: pointer;
        }

        .hub-dependent-level-pill small {
          opacity: 0.72;
          font-size: 0.84rem;
        }

        .hub-dependent-level-pill.active {
          background: linear-gradient(180deg, #f6bd60, #e9a93f);
          border-color: rgba(245, 193, 90, 0.95);
          color: #16233f;
        }

        .hub-dependent-level-note {
          padding: 0.9rem 1rem;
          border-radius: 18px;
          background: rgba(17, 26, 48, 0.36);
          border: 1px solid rgba(104, 132, 196, 0.28);
          margin-bottom: 1rem;
        }

        .hub-dependent-level-note strong {
          display: block;
          margin-bottom: 0.25rem;
          color: #f1c66a;
        }

        .hub-dependent-level-note p {
          margin: 0;
          color: rgba(230, 240, 255, 0.82);
          line-height: 1.45;
        }

        .hub-dependent-stage-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.85rem;
          color: rgba(230, 240, 255, 0.88);
          font-weight: 700;
        }

        .hub-dependent-stage-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .hub-dependent-sound-toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          flex-shrink: 0;
          border-radius: 999px;
          border: 2px solid rgba(104, 132, 196, 0.38);
          background: rgba(17, 26, 48, 0.48);
          color: #eef4ff;
          padding: 0.62rem 0.92rem;
          font-weight: 800;
          cursor: pointer;
        }

        .hub-dependent-sound-toggle.muted {
          opacity: 0.78;
        }

        .hub-dependent-sound-icon {
          font-size: 1rem;
          line-height: 1;
        }

        .hub-dependent-card,
        .hub-dependent-report-item {
          position: relative;
          border-radius: 24px;
          padding: 1.35rem;
          background: linear-gradient(180deg, rgba(43, 60, 104, 0.94), rgba(34, 49, 87, 0.94));
          border: 2px solid rgba(90, 121, 196, 0.55);
        }

        .hub-dependent-card {
          min-height: 280px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 1rem;
        }

        .hub-dependent-empty {
          justify-content: center;
        }

        .hub-dependent-card h3,
        .hub-dependent-empty p {
          color: #eef4ff;
        }

        .hub-dependent-card-label {
          align-self: flex-start;
          padding: 0.35rem 0.7rem;
          border-radius: 999px;
          background: rgba(255, 202, 102, 0.14);
          border: 1px solid rgba(255, 202, 102, 0.35);
          color: #ffcf70;
          font-weight: 900;
          font-size: 0.82rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .hub-dependent-sentence,
        .hub-dependent-report-sentence {
          margin: 0;
          font-size: clamp(1.25rem, 2vw, 1.85rem);
          line-height: 1.45;
          color: #eef4ff;
        }

        .hub-dependent-answer-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 0.9rem;
          align-items: center;
        }

        .hub-dependent-answer-row input {
          width: 100%;
          border-radius: 16px;
          border: 2px solid rgba(96, 124, 194, 0.68);
          background: rgba(5, 12, 28, 0.86);
          color: #eef4ff;
          padding: 1rem 1.05rem;
          font-size: 1.05rem;
          outline: none;
        }

        .hub-dependent-answer-input.ok {
          border-color: rgba(84, 188, 129, 0.95);
          background: rgba(27, 74, 50, 0.42);
          box-shadow: 0 0 0 4px rgba(84, 188, 129, 0.14);
        }

        .hub-dependent-answer-input.bad {
          border-color: rgba(227, 106, 122, 0.95);
          background: rgba(104, 31, 45, 0.34);
          box-shadow: 0 0 0 4px rgba(227, 106, 122, 0.14);
          animation: hubDependentShake 0.34s ease-in-out;
        }

        @keyframes hubDependentShake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-5px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
          100% { transform: translateX(0); }
        }

        .hub-dependent-start,
        .hub-dependent-check {
          border: none;
          border-radius: 16px;
          padding: 0.92rem 1.2rem;
          font-weight: 900;
          cursor: pointer;
          background: linear-gradient(180deg, #f6bd60, #e9a93f);
          color: #13213b;
          box-shadow: 0 14px 24px rgba(0, 0, 0, 0.18);
        }

        .hub-dependent-feedback {
          margin-top: 0.95rem;
          border-radius: 18px;
          padding: 0.95rem 1rem;
          font-weight: 700;
          line-height: 1.45;
          border: 1px solid transparent;
        }

        .hub-dependent-feedback.info {
          background: rgba(37, 55, 97, 0.82);
          border-color: rgba(108, 136, 199, 0.25);
          color: rgba(230, 240, 255, 0.9);
        }

        .hub-dependent-feedback.ok {
          background: rgba(33, 81, 58, 0.24);
          border-color: rgba(84, 188, 129, 0.34);
          color: #d7ffe7;
        }

        .hub-dependent-feedback.bad {
          background: rgba(121, 45, 56, 0.24);
          border-color: rgba(227, 106, 122, 0.34);
          color: #ffdce2;
        }

        .hub-dependent-report {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .hub-dependent-report-top {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.85rem;
        }

        .hub-dependent-report-card {
          border-radius: 20px;
          padding: 1rem;
          background: rgba(16, 24, 46, 0.4);
          border: 1px solid rgba(108, 136, 199, 0.22);
          color: #e6f0ff;
        }

        .hub-dependent-report-card span {
          display: block;
          opacity: 0.75;
          margin-bottom: 0.25rem;
        }

        .hub-dependent-report-card strong {
          font-size: 1.5rem;
        }

        .hub-dependent-report-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.8rem;
        }

        .hub-dependent-report-list {
          display: grid;
          gap: 0.85rem;
        }

        .hub-dependent-leaderboards {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }

        .hub-dependent-board {
          border-radius: 20px;
          padding: 1rem;
          background: rgba(16, 24, 46, 0.4);
          border: 1px solid rgba(108, 136, 199, 0.22);
        }

        .hub-dependent-board h3 {
          margin: 0 0 .75rem;
          color: #eef4ff;
        }

        .hub-dependent-board-sub {
          margin: -0.35rem 0 0.75rem;
          color: rgba(230, 240, 255, 0.62);
          font-size: 0.92rem;
          font-weight: 700;
        }

        .hub-dependent-board-list {
          display: grid;
          gap: .55rem;
        }

        .hub-dependent-board-row {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: .75rem;
          align-items: center;
          color: rgba(230, 240, 255, 0.9);
        }

        .hub-dependent-board-row em {
          font-style: normal;
          opacity: .88;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .hub-dependent-board-empty {
          margin: 0;
          color: rgba(230, 240, 255, 0.72);
        }

        .hub-dependent-report-item p {
          margin: 0.45rem 0 0;
          color: rgba(230, 240, 255, 0.88);
        }

        .hub-dependent-report-item.ok {
          border-color: rgba(84, 188, 129, 0.42);
        }

        .hub-dependent-report-item.bad {
          border-color: rgba(227, 106, 122, 0.42);
        }

        @media (max-width: 720px) {
          .hub-dependent-topbar {
            flex-direction: column;
            align-items: flex-start;
          }

          .hub-dependent-back {
            width: 100%;
          }

          .hub-dependent-answer-row {
            grid-template-columns: 1fr;
          }

          .hub-dependent-stage-meta-row {
            flex-direction: column;
            align-items: stretch;
          }

          .hub-dependent-check,
          .hub-dependent-start,
          .hub-dependent-secondary,
          .hub-dependent-sound-toggle {
            width: 100%;
          }

          .hub-dependent-report-top {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .hub-dependent-leaderboards {
            grid-template-columns: 1fr;
          }

          .hub-dependent-report-actions {
            flex-direction: column;
          }
        }
      `}</style>

      <audio ref={tickRef} src="/sounds/tick.mp3" preload="auto" />
      <audio ref={tickFastRef} src="/sounds/tick_fast.mp3" preload="auto" />
      <audio ref={timeUpRef} src="/sounds/time_up.mp3" preload="auto" />
      <audio ref={correctRef} src="/sounds/correct.mp3" preload="auto" />
      <audio ref={incorrectRef} src="/sounds/incorrect.mp3" preload="auto" />
    </div>
  );
}
