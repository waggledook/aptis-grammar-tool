import React, { useEffect, useMemo, useRef, useState } from "react";
import Seo from "../common/Seo.jsx";
import { useNavigate } from "react-router-dom";
import { getSitePath } from "../../siteConfig.js";
import {
  fetchMyTopHubGameScores,
  fetchTopHubGameScores,
  logHubNegatrisCompleted,
  logHubNegatrisStarted,
  onAuthChange,
  saveHubGameScore,
} from "../../firebase.js";

const PREFIXES = ["un-", "in-", "dis-", "im-", "ir-", "il-"];
const SOUND_STORAGE_KEY = "hub_negatris_sound_muted_v1";
const EXTRA_LIFE_STREAK = 5;
const DEFAULT_BOARD_WIDTH = 640;
const START_TOP = "-12%";
const IMPACT_TOP = "82%";
const LEADERBOARD_GAME_ID = "hub_negatris";
const NEGATRIS_TRACKS = [
  "/sounds/negatris-track-1.mp3",
  "/sounds/negatris-track-2.mp3",
  "/sounds/negatris-track-3.mp3",
];

const WORD_TO_PREFIX = {
  responsible: "ir-",
  thoughtful: "un-",
  polite: "im-",
  patient: "im-",
  correct: "in-",
  respectful: "dis-",
  advantage: "dis-",
  relevant: "ir-",
  faithful: "un-",
  perfect: "im-",
  usual: "un-",
  rational: "ir-",
  loyal: "dis-",
  like: "dis-",
  honest: "dis-",
  mortal: "im-",
  possible: "im-",
  separable: "in-",
  resistible: "ir-",
  comfortable: "un-",
  happy: "un-",
  informed: "un-",
  helpful: "un-",
  healthy: "un-",
  real: "un-",
  fair: "un-",
  considerate: "in-",
  agreement: "dis-",
  thinkable: "un-",
  legal: "il-",
  mature: "im-",
  literate: "il-",
  fortunate: "un-",
  logical: "il-",
  moral: "im-",
  practical: "im-",
  safe: "un-",
  surprising: "un-",
  tidy: "un-",
  regular: "ir-",
  legitimate: "il-",
  attractive: "un-",
  appropriate: "in-",
  mobile: "im-",
  hospitable: "in-",
  personal: "im-",
  embark: "dis-",
  official: "un-",
  easy: "un-",
  coherent: "in-",
  continue: "dis-",
  replaceable: "ir-",
  capable: "in-",
  do: "un-",
  competent: "in-",
  legible: "il-",
  reverent: "ir-",
  modest: "im-",
  efficient: "in-",
  appear: "dis-",
  aware: "un-",
  visible: "in-",
  obey: "dis-",
  certain: "un-",
  pure: "im-",
  sane: "in-",
  flexible: "in-",
  grateful: "un-",
  approve: "dis-",
  avoidable: "un-",
  active: "in-",
  accurate: "in-",
  adequate: "in-",
  audible: "in-",
  complete: "in-",
  convenient: "in-",
  direct: "in-",
  discreet: "in-",
  expensive: "in-",
  formal: "in-",
  secure: "in-",
  sensitive: "in-",
  voluntary: "in-",
  balanced: "im-",
  measurable: "im-",
  partial: "im-",
  plausible: "im-",
  precise: "im-",
  probable: "im-",
  proper: "im-",
  reversible: "ir-",
  clear: "un-",
  equal: "un-",
  fit: "un-",
  lucky: "un-",
  pleasant: "un-",
  suitable: "un-",
  well: "un-",
  agree: "dis-",
  belief: "dis-",
  connect: "dis-",
  order: "dis-",
  qualify: "dis-",
  satisfaction: "dis-",
};

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getWordDuration(score) {
  const points = Math.max(0, score);
  const tier = Math.floor(points / 50);
  const withinTier = points % 50;
  const baseDuration = 5200 - tier * 340;
  const rampWithinTier = withinTier * 18;
  return Math.max(1320, baseDuration - rampWithinTier);
}

function getSpawnDelay(score) {
  const points = Math.max(0, score);
  const tier = Math.floor(points / 50);
  const withinTier = points % 50;
  const baseDelay = 520 - tier * 38;
  const rampWithinTier = withinTier * 1.4;
  return Math.max(160, Math.round(baseDelay - rampWithinTier));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getLaneCenterPercent(index) {
  return ((index + 0.5) / PREFIXES.length) * 100;
}

function getLaneIndexFromPercent(xPercent) {
  return clamp(Math.floor((xPercent / 100) * PREFIXES.length), 0, PREFIXES.length - 1);
}

function wrapPercent(value, min, max) {
  const range = max - min;
  if (range <= 0) return min;
  if (value < min) return max - (min - value);
  if (value > max) return min + (value - max);
  return value;
}

function buildWordState(score, metrics, width) {
  const words = Object.keys(WORD_TO_PREFIX);
  const text = words[Math.floor(Math.random() * words.length)];
  const estimatedWidth = clamp(
    text.length * metrics.wordFontSize * 0.58 + metrics.wordPaddingX * 2,
    metrics.wordMinWidth,
    metrics.wordMaxWidth,
  );
  const halfPercent = ((estimatedWidth / 2) / width) * 100;
  const minX = Math.max(10, halfPercent + 2);
  const maxX = Math.min(90, 100 - halfPercent - 2);
  return {
    id: `${text}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text,
    correctPrefix: WORD_TO_PREFIX[text],
    xPercent: Math.random() * (maxX - minX) + minX,
    durationMs: getWordDuration(score),
    resolved: false,
  };
}

export default function HubNegatrisGame() {
  const navigate = useNavigate();
  const endingRef = useRef(false);
  const pendingNextWordRef = useRef(null);
  const resolveTimeoutRef = useRef(null);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const streakRef = useRef(0);
  const activeWordRef = useRef(null);
  const stageRef = useRef(null);
  const musicRef = useRef(null);
  const lifeSoundRef = useRef(null);
  const incorrectSoundRef = useRef(null);
  const correctSoundRef = useRef(null);
  const gameOverSoundRef = useRef(null);
  const scoreSavedRef = useRef(false);
  const activityLoggedRef = useRef({ started: false, completed: false });

  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("intro");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [activeWord, setActiveWord] = useState(null);
  const [feedback, setFeedback] = useState("Move the word into the correct prefix bucket.");
  const [mistakes, setMistakes] = useState([]);
  const [bonusPulse, setBonusPulse] = useState(false);
  const [impactState, setImpactState] = useState(null);
  const [boardWidth, setBoardWidth] = useState(DEFAULT_BOARD_WIDTH);
  const [lifePopup, setLifePopup] = useState(false);
  const [myTopScores, setMyTopScores] = useState([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [soundVolume, setSoundVolume] = useState(0.9);
  const [soundMuted, setSoundMuted] = useState(() => {
    try {
      return localStorage.getItem(SOUND_STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const controlHoldRef = useRef(null);

  const wordLeft = useMemo(() => {
    if (!activeWord) return "50%";
    return `${activeWord.xPercent}%`;
  }, [activeWord]);
  const bestScore = myTopScores.length
    ? Math.max(...myTopScores.map((entry) => Number(entry.score) || 0))
    : 0;

  useEffect(() => onAuthChange(setUser), []);

  useEffect(() => {
    let cancelled = false;

    async function loadBoards() {
      try {
        const [global, personal] = await Promise.all([
          fetchTopHubGameScores(LEADERBOARD_GAME_ID, 10),
          user?.uid ? fetchMyTopHubGameScores(LEADERBOARD_GAME_ID, 3, user.uid) : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setGlobalLeaderboard(global);
        setMyTopScores(personal);
      } catch (error) {
        console.error("[HubNegatrisGame] leaderboard load failed", error);
      }
    }

    loadBoards();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  useEffect(() => {
    scoreRef.current = score;
    livesRef.current = lives;
    streakRef.current = streak;
  }, [score, lives, streak]);

  useEffect(() => {
    activeWordRef.current = activeWord;
  }, [activeWord]);

  useEffect(() => {
    if (!stageRef.current || typeof ResizeObserver === "undefined") return undefined;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setBoardWidth(entry.contentRect.width || DEFAULT_BOARD_WIDTH);
    });

    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, [mode]);

  const boardMetrics = useMemo(() => {
    const width = boardWidth || DEFAULT_BOARD_WIDTH;
    const bucketHeight = Math.round(width * 0.1375);
    const wordMinWidth = Math.round(width * 0.15);
    const wordMaxWidth = Math.round(width * 0.34);
    const wordFontSize = Math.max(15, Math.min(28, Math.round(width * 0.035)));
    const wordPaddingY = Math.max(8, Math.min(12, Math.round(width * 0.012)));
    const wordPaddingX = Math.max(11, Math.min(16, Math.round(width * 0.017)));
    const bucketFontSize = Math.max(18, Math.min(28, Math.round(bucketHeight * 0.34)));
    const bucketRadius = Math.max(14, Math.min(18, Math.round(width * 0.025)));
    const moveStepPercent = Math.max(3.5, Math.min(8.5, (width * 0.09 * 100) / width));

    return {
      bucketHeight,
      wordMinWidth,
      wordMaxWidth,
      wordFontSize,
      wordPaddingY,
      wordPaddingX,
      bucketFontSize,
      bucketRadius,
      moveStepPercent,
    };
  }, [boardWidth]);

  useEffect(() => {
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, soundMuted ? "1" : "0");
    } catch {}
    if (musicRef.current) {
      musicRef.current.muted = soundMuted;
      musicRef.current.volume = soundMuted ? 0 : soundVolume * 0.55;
    }
    if (lifeSoundRef.current) {
      lifeSoundRef.current.muted = soundMuted;
      lifeSoundRef.current.volume = soundMuted ? 0 : soundVolume * 0.9;
    }
    if (incorrectSoundRef.current) {
      incorrectSoundRef.current.muted = soundMuted;
      incorrectSoundRef.current.volume = soundMuted ? 0 : soundVolume * 0.85;
    }
    if (correctSoundRef.current) {
      correctSoundRef.current.muted = soundMuted;
      correctSoundRef.current.volume = soundMuted ? 0 : soundVolume * 0.68;
    }
    if (gameOverSoundRef.current) {
      gameOverSoundRef.current.muted = soundMuted;
      gameOverSoundRef.current.volume = soundMuted ? 0 : soundVolume * 0.92;
    }
  }, [soundMuted, soundVolume]);

  useEffect(() => {
    return () => {
      if (pendingNextWordRef.current) window.clearTimeout(pendingNextWordRef.current);
      if (resolveTimeoutRef.current) window.clearTimeout(resolveTimeoutRef.current);
      if (controlHoldRef.current) window.clearInterval(controlHoldRef.current);
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current.currentTime = 0;
      }
      if (lifeSoundRef.current) {
        lifeSoundRef.current.pause();
        lifeSoundRef.current.currentTime = 0;
      }
      if (incorrectSoundRef.current) {
        incorrectSoundRef.current.pause();
        incorrectSoundRef.current.currentTime = 0;
      }
      if (correctSoundRef.current) {
        correctSoundRef.current.pause();
        correctSoundRef.current.currentTime = 0;
      }
      if (gameOverSoundRef.current) {
        gameOverSoundRef.current.pause();
        gameOverSoundRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (mode !== "playing") return undefined;

    function handleKeyDown(event) {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        event.preventDefault();
        moveWord(-1);
      }
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        event.preventDefault();
        moveWord(1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, activeWord]);

  useEffect(() => {
    if (mode !== "report" || scoreSavedRef.current || !score || !user?.uid) return;

    scoreSavedRef.current = true;
    saveHubGameScore(LEADERBOARD_GAME_ID, score, {
      livesRemaining: lives,
      longestStreak: streak,
      mistakes: mistakes.length,
    })
      .then(async () => {
        const [global, personal] = await Promise.all([
          fetchTopHubGameScores(LEADERBOARD_GAME_ID, 10),
          fetchMyTopHubGameScores(LEADERBOARD_GAME_ID, 3, user.uid),
        ]);
        setGlobalLeaderboard(global);
        setMyTopScores(personal);
      })
      .catch((error) => {
        console.error("[HubNegatrisGame] leaderboard save failed", error);
      });
  }, [mode, score, user?.uid, lives, streak, mistakes.length]);

  useEffect(() => {
    if (mode !== "report" || activityLoggedRef.current.completed) return;

    activityLoggedRef.current.completed = true;
    logHubNegatrisCompleted({
      score,
      mistakes: mistakes.length,
      livesRemaining: lives,
      streak,
    }).catch((error) => console.error("[HubNegatrisGame] completion log failed", error));
  }, [mode, score, mistakes.length, lives, streak]);

  function startBackgroundMusic() {
    if (typeof window === "undefined") return;
    const track = NEGATRIS_TRACKS[Math.floor(Math.random() * NEGATRIS_TRACKS.length)];
    if (!musicRef.current) {
      musicRef.current = new window.Audio(track);
      musicRef.current.loop = true;
    } else {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
      musicRef.current.src = track;
      musicRef.current.loop = true;
    }
    musicRef.current.muted = soundMuted;
    musicRef.current.volume = soundMuted ? 0 : soundVolume * 0.55;
    musicRef.current.play().catch(() => {});
  }

  function stopBackgroundMusic() {
    if (!musicRef.current) return;
    musicRef.current.pause();
    musicRef.current.currentTime = 0;
  }

  function playLifeSound() {
    if (typeof window === "undefined" || soundMuted) return;
    if (!lifeSoundRef.current) {
      lifeSoundRef.current = new window.Audio("/sounds/negatris-1up.mp3");
    }
    lifeSoundRef.current.muted = soundMuted;
    lifeSoundRef.current.volume = soundMuted ? 0 : soundVolume * 0.9;
    lifeSoundRef.current.currentTime = 0;
    lifeSoundRef.current.play().catch(() => {});
  }

  function playIncorrectSound() {
    if (typeof window === "undefined" || soundMuted) return;
    if (!incorrectSoundRef.current) {
      incorrectSoundRef.current = new window.Audio("/sounds/incorrect.mp3");
    }
    incorrectSoundRef.current.muted = soundMuted;
    incorrectSoundRef.current.volume = soundMuted ? 0 : soundVolume * 0.85;
    incorrectSoundRef.current.currentTime = 0;
    incorrectSoundRef.current.play().catch(() => {});
  }

  function playCorrectSound() {
    if (typeof window === "undefined" || soundMuted) return;
    if (!correctSoundRef.current) {
      correctSoundRef.current = new window.Audio("/sounds/whoosh.mp3");
    }
    correctSoundRef.current.muted = soundMuted;
    correctSoundRef.current.volume = soundMuted ? 0 : soundVolume * 0.68;
    correctSoundRef.current.currentTime = 0;
    correctSoundRef.current.play().catch(() => {});
  }

  function playGameOverSound() {
    if (typeof window === "undefined" || soundMuted) return;
    if (!gameOverSoundRef.current) {
      gameOverSoundRef.current = new window.Audio("/sounds/negatris-game-over.mp3");
    }
    gameOverSoundRef.current.muted = soundMuted;
    gameOverSoundRef.current.volume = soundMuted ? 0 : soundVolume * 0.92;
    gameOverSoundRef.current.currentTime = 0;
    gameOverSoundRef.current.play().catch(() => {});
  }

  function startGame() {
    endingRef.current = false;
    scoreSavedRef.current = false;
    activityLoggedRef.current.started = false;
    activityLoggedRef.current.completed = false;
    if (pendingNextWordRef.current) window.clearTimeout(pendingNextWordRef.current);
    if (resolveTimeoutRef.current) window.clearTimeout(resolveTimeoutRef.current);
    setScore(0);
    setLives(3);
    setStreak(0);
    setMistakes([]);
    setImpactState(null);
    setFeedback("Catch each word in the correct prefix bucket.");
    setBonusPulse(false);
    setLifePopup(false);
    setMode("playing");
    activityLoggedRef.current.started = true;
    logHubNegatrisStarted({
      startingLives: 3,
      extraLifeStreak: EXTRA_LIFE_STREAK,
    }).catch((error) => console.error("[HubNegatrisGame] start log failed", error));
    startBackgroundMusic();
    spawnNextWord(0);
  }

  function endGame() {
    if (endingRef.current) return;
    endingRef.current = true;
    if (pendingNextWordRef.current) window.clearTimeout(pendingNextWordRef.current);
    if (resolveTimeoutRef.current) window.clearTimeout(resolveTimeoutRef.current);
    if (controlHoldRef.current) window.clearInterval(controlHoldRef.current);
    setActiveWord(null);
    stopBackgroundMusic();
    setMode("report");
  }

  function spawnNextWord(nextScore) {
    if (endingRef.current) return;
    const nextWord = buildWordState(nextScore, boardMetrics, boardWidth || DEFAULT_BOARD_WIDTH);
    setActiveWord(nextWord);
    if (resolveTimeoutRef.current) window.clearTimeout(resolveTimeoutRef.current);
    resolveTimeoutRef.current = window.setTimeout(() => {
      resolveWord(activeWordRef.current || nextWord);
    }, nextWord.durationMs);
  }

  function resolveWord(word) {
    if (endingRef.current || !word || word.resolved) return;

    const laneIndex = getLaneIndexFromPercent(word.xPercent);
    const chosenPrefix = PREFIXES[laneIndex];
    const correct = chosenPrefix === word.correctPrefix;
    const currentScore = scoreRef.current;
    const currentLives = livesRef.current;
    const currentStreak = streakRef.current;
    const nextScore = correct ? currentScore + 10 : Math.max(0, currentScore - 5);
    const nextLives = correct ? currentLives : currentLives - 1;
    const nextStreak = correct ? currentStreak + 1 : 0;
    const earnedLife = correct && nextStreak > 0 && nextStreak % EXTRA_LIFE_STREAK === 0;

    if (!correct) {
      setMistakes((current) => [
        ...current,
        {
          word: word.text,
          chosen: chosenPrefix,
          correct: word.correctPrefix,
        },
      ]);
      if (nextLives <= 0) {
        playGameOverSound();
      } else {
        playIncorrectSound();
      }
      setFeedback(`${word.text} takes ${word.correctPrefix}, not ${chosenPrefix}`);
    } else {
      playCorrectSound();
      setFeedback(`${word.correctPrefix}${word.text} — nice catch.`);
    }

    setScore(nextScore);
    setStreak(nextStreak);
    setLives(earnedLife ? nextLives + 1 : nextLives);
    setImpactState({
      laneIndex,
      correct,
      chosenPrefix,
      correctPrefix: word.correctPrefix,
      word: word.text,
    });
    setActiveWord({
      ...word,
      resolved: true,
      xPercent: getLaneCenterPercent(laneIndex),
    });

    if (earnedLife) {
      setBonusPulse(true);
      window.setTimeout(() => setBonusPulse(false), 900);
      setLifePopup(true);
      window.setTimeout(() => setLifePopup(false), 1200);
      playLifeSound();
      setFeedback(`Streak of ${EXTRA_LIFE_STREAK}! Extra life earned.`);
    }

    if (nextLives <= 0) {
      endGame();
      return;
    }

    pendingNextWordRef.current = window.setTimeout(() => {
      setImpactState(null);
      setActiveWord(null);
      spawnNextWord(nextScore);
    }, getSpawnDelay(nextScore));
  }

  function moveWord(direction) {
    setActiveWord((current) => {
      if (!current || current.resolved) return current;
      const estimatedWidth = clamp(
        current.text.length * boardMetrics.wordFontSize * 0.58 + boardMetrics.wordPaddingX * 2,
        boardMetrics.wordMinWidth,
        boardMetrics.wordMaxWidth,
      );
      const halfPercent = ((estimatedWidth / 2) / (boardWidth || DEFAULT_BOARD_WIDTH)) * 100;
      // Let the word travel partly off-stage before wrapping so the move feels intentional.
      const wrapMin = -halfPercent + 1;
      const wrapMax = 100 + halfPercent - 1;
      return {
        ...current,
        xPercent: wrapPercent(current.xPercent + direction * boardMetrics.moveStepPercent, wrapMin, wrapMax),
      };
    });
  }

  function startMoveHold(direction) {
    moveWord(direction);
    if (controlHoldRef.current) window.clearInterval(controlHoldRef.current);
    controlHoldRef.current = window.setInterval(() => moveWord(direction), 95);
  }

  function stopMoveHold() {
    if (controlHoldRef.current) {
      window.clearInterval(controlHoldRef.current);
      controlHoldRef.current = null;
    }
  }

  return (
    <div className="menu-wrapper hub-menu-wrapper negatris-page">
      <Seo
        title="Negatris | Seif Hub"
        description="Steer falling words into the correct negative-prefix lane in this fast Seif Hub word-building game."
      />

      <button className="topbar-btn" onClick={() => navigate(getSitePath("/games"))} style={{ marginBottom: "1rem" }}>
        ← Back to games
      </button>

      <div className="negatris-shell">
        <header className="negatris-header">
          <img
            src="/images/games/negatris-title.png"
            alt="Negatris"
            className="negatris-title"
            draggable="false"
          />
          <p className="negatris-sub">
            Build negative words at speed by guiding each word into the correct prefix bucket.
          </p>
          <div className="negatris-sound-row">
            <label className="negatris-sound-slider">
              <span className="negatris-sound-label">Volume</span>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={Math.round(soundVolume * 100)}
                onChange={(event) => setSoundVolume(Number(event.target.value) / 100)}
                aria-label="Negatris volume"
              />
            </label>
            <button
              type="button"
              className={`negatris-sound-toggle ${soundMuted ? "muted" : ""}`}
              onClick={() => setSoundMuted((current) => !current)}
              aria-pressed={soundMuted}
            >
              <span className="negatris-sound-icon" aria-hidden="true">
                {soundMuted ? "🔇" : "🔊"}
              </span>
              <span>{soundMuted ? "Sound off" : "Sound on"}</span>
            </button>
          </div>
        </header>

        <div className="negatris-panel">
          <div className="negatris-status">
            <div className="status-chip">
              <span>Score</span>
              <strong>{score}</strong>
            </div>
            <div className={`status-chip ${bonusPulse ? "bonus" : ""}`}>
              <span>Lives</span>
              <strong>{lives}</strong>
            </div>
            <div className="status-chip">
              <span>Streak</span>
              <strong>{streak}</strong>
            </div>
            <div className="status-chip">
              <span>Best</span>
              <strong>{bestScore}</strong>
            </div>
          </div>

          {mode === "intro" ? (
            <div className="negatris-intro">
              <div className="intro-card">
                <img
                  src="/images/games/negatris-icon.png"
                  alt=""
                  className="negatris-icon"
                  draggable="false"
                />
                <div>
                  <h2>How to play</h2>
                  <ul>
                    <li>Each round gives you one falling word.</li>
                    <li>Move it left or right into the correct prefix bucket.</li>
                    <li>Keep your streak going to win an extra life.</li>
                    <li>A wrong bucket costs a life, so stay sharp.</li>
                  </ul>
                </div>
              </div>

              <div className="intro-actions">
                <button className="hero-btn" onClick={startGame}>
                  Start game
                </button>
              </div>

              <div className="negatris-leaderboards">
                <div className="negatris-board">
                  <h3>Your top scores</h3>
                  {user?.uid ? (
                    myTopScores.length ? (
                      <div className="negatris-board-list">
                        {myTopScores.map((entry, index) => (
                          <div key={entry.id} className="negatris-board-row">
                            <span>#{index + 1}</span>
                            <strong>{entry.score}</strong>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="negatris-board-empty">No saved scores yet.</p>
                    )
                  ) : (
                    <p className="negatris-board-empty">Sign in to save your top 3 scores.</p>
                  )}
                </div>

                <div className="negatris-board">
                  <h3>Global leaderboard</h3>
                  {globalLeaderboard.length ? (
                    <div className="negatris-board-list">
                      {globalLeaderboard.map((entry, index) => (
                        <div key={entry.id} className="negatris-board-row">
                          <span>#{index + 1}</span>
                          <em>{entry.displayName}</em>
                          <strong>{entry.score}</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="negatris-board-empty">No leaderboard scores yet.</p>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {mode === "playing" ? (
            <>
              <div
                className="game-stage"
                ref={stageRef}
                style={{
                  "--bucket-row-height": `${boardMetrics.bucketHeight}px`,
                  "--bucket-font-size": `${boardMetrics.bucketFontSize}px`,
                  "--bucket-radius": `${boardMetrics.bucketRadius}px`,
                  "--word-min-width": `${boardMetrics.wordMinWidth}px`,
                  "--word-max-width": `${boardMetrics.wordMaxWidth}px`,
                  "--word-font-size": `${boardMetrics.wordFontSize}px`,
                  "--word-pad-y": `${boardMetrics.wordPaddingY}px`,
                  "--word-pad-x": `${boardMetrics.wordPaddingX}px`,
                }}
              >
                <div className="stage-track" />
                {lifePopup ? (
                  <div className="life-popup" aria-hidden="true">
                    <span className="life-popup-ring life-popup-ring-a" />
                    <span className="life-popup-ring life-popup-ring-b" />
                    <span className="life-popup-burst" />
                    <strong>1UP</strong>
                  </div>
                ) : null}
                {activeWord ? (
                  <div
                    className={`falling-word ${activeWord.resolved ? "resolved" : ""} ${impactState?.correct ? "is-correct" : ""} ${impactState && !impactState.correct ? "is-wrong" : ""}`}
                    style={{
                      left: wordLeft,
                      "--fall-duration": `${activeWord.durationMs}ms`,
                    }}
                  >
                    {activeWord.text}
                  </div>
                ) : null}

                {impactState ? (
                  <div className={`impact-badge ${impactState.correct ? "correct" : "incorrect"}`}>
                    {impactState.correct
                      ? `${impactState.chosenPrefix}${impactState.word}`
                      : `${impactState.word} -> ${impactState.correctPrefix}${impactState.word}`}
                  </div>
                ) : null}

                <div className="bucket-shadow-lip" />
                <div className="lane-row">
                  {PREFIXES.map((prefix, index) => (
                    <div
                      key={prefix}
                      className={`lane-button ${impactState?.laneIndex === index ? "active" : ""} ${
                        impactState?.laneIndex === index && impactState?.correct ? "flash-correct" : ""
                      } ${impactState?.laneIndex === index && impactState && !impactState.correct ? "flash-incorrect" : ""}`}
                    >
                      <span>{prefix.replace("-", "")}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="control-row">
                <button
                  className="control-btn"
                  onMouseDown={() => startMoveHold(-1)}
                  onMouseUp={stopMoveHold}
                  onMouseLeave={stopMoveHold}
                  onTouchStart={() => startMoveHold(-1)}
                  onTouchEnd={stopMoveHold}
                  aria-label="Move left"
                >
                  <svg viewBox="0 0 64 64" aria-hidden="true" className="control-icon">
                    <path
                      className="control-icon-shadow"
                      d="M39 14L19 32L39 50"
                    />
                    <path
                      className="control-icon-main"
                      d="M39 14L19 32L39 50"
                    />
                  </svg>
                </button>
                <button
                  className="control-btn"
                  onMouseDown={() => startMoveHold(1)}
                  onMouseUp={stopMoveHold}
                  onMouseLeave={stopMoveHold}
                  onTouchStart={() => startMoveHold(1)}
                  onTouchEnd={stopMoveHold}
                  aria-label="Move right"
                >
                  <svg viewBox="0 0 64 64" aria-hidden="true" className="control-icon">
                    <path
                      className="control-icon-shadow"
                      d="M25 14L45 32L25 50"
                    />
                    <path
                      className="control-icon-main"
                      d="M25 14L45 32L25 50"
                    />
                  </svg>
                </button>
              </div>
              <div className="feedback-bar outboard">{feedback}</div>
            </>
          ) : null}

          {mode === "report" ? (
            <div className="report-view">
              <div className="report-summary">
                <h2>Game over</h2>
                <p>
                  Final score: <strong>{score}</strong>
                </p>
                <p>
                  Mistakes: <strong>{mistakes.length}</strong>
                </p>
              </div>

              <div className="report-actions">
                <button className="hero-btn" onClick={startGame}>
                  Play again
                </button>
                <button className="secondary-btn" onClick={() => setMode("intro")}>
                  Back to start
                </button>
              </div>

              <div className="negatris-leaderboards">
                <div className="negatris-board">
                  <h3>Your top scores</h3>
                  {user?.uid ? (
                    myTopScores.length ? (
                      <div className="negatris-board-list">
                        {myTopScores.map((entry, index) => (
                          <div key={entry.id} className="negatris-board-row">
                            <span>#{index + 1}</span>
                            <strong>{entry.score}</strong>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="negatris-board-empty">No saved scores yet.</p>
                    )
                  ) : (
                    <p className="negatris-board-empty">Sign in to save your top 3 scores.</p>
                  )}
                </div>

                <div className="negatris-board">
                  <h3>Global leaderboard</h3>
                  {globalLeaderboard.length ? (
                    <div className="negatris-board-list">
                      {globalLeaderboard.map((entry, index) => (
                        <div key={entry.id} className="negatris-board-row">
                          <span>#{index + 1}</span>
                          <em>{entry.displayName}</em>
                          <strong>{entry.score}</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="negatris-board-empty">No leaderboard scores yet.</p>
                  )}
                </div>
              </div>

              <div className="mistake-list">
                <h3>Mistakes to review</h3>
                {mistakes.length ? (
                  <ul>
                    {mistakes.map((entry, index) => (
                      <li key={`${entry.word}-${index}`}>
                        <strong>{entry.word}</strong>
                        <span>you chose {entry.chosen}</span>
                        <span>correct: {entry.correct}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No mistakes. Very tidy work.</p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <style>{`
        .negatris-page {
          padding-top: 0;
          width: 100%;
          max-width: none;
        }

        .negatris-shell {
          max-width: 760px;
          margin: 0 auto;
          width: 100%;
        }

        .negatris-header {
          text-align: center;
          margin-bottom: 1rem;
        }

        .negatris-title {
          width: min(480px, 88vw);
          height: auto;
          display: block;
          margin: 0 auto .6rem;
          filter: drop-shadow(0 8px 18px rgba(0,0,0,.28));
        }

        .negatris-sub {
          margin: 0 auto;
          max-width: 720px;
          color: #d8e6ff;
          line-height: 1.45;
        }

        .negatris-sound-row {
          margin-top: .85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: .75rem;
          flex-wrap: wrap;
        }

        .negatris-sound-slider {
          display: inline-flex;
          align-items: center;
          gap: .55rem;
          color: #d8e6ff;
          font-weight: 700;
        }

        .negatris-sound-label {
          color: #d8e6ff;
          font-size: .95rem;
        }

        .negatris-sound-slider input[type="range"] {
          width: 140px;
          accent-color: #f0b956;
        }

        .negatris-sound-toggle {
          display: inline-flex;
          align-items: center;
          gap: .55rem;
          border: 1px solid rgba(98, 139, 218, 0.38);
          border-radius: 999px;
          padding: .55rem .9rem;
          background: rgba(8, 14, 31, 0.6);
          color: #eaf2ff;
          font-weight: 800;
          cursor: pointer;
          transition: transform .08s ease, border-color .12s ease, background .12s ease;
        }

        .negatris-sound-toggle:hover {
          transform: translateY(-1px);
          border-color: rgba(122, 174, 255, 0.55);
        }

        .negatris-sound-toggle.muted {
          background: rgba(8, 14, 31, 0.46);
          color: #bed0f0;
        }

        .negatris-sound-icon {
          font-size: 1rem;
          line-height: 1;
        }

        .negatris-panel {
          background:
            linear-gradient(180deg, rgba(29, 45, 81, 0.96), rgba(18, 31, 58, 0.96)),
            radial-gradient(circle at top right, rgba(96, 225, 255, 0.10), transparent 32%);
          border: 1px solid rgba(98, 139, 218, 0.42);
          border-radius: 24px;
          padding: 1rem;
          box-shadow: 0 16px 34px rgba(0, 0, 0, 0.22);
          max-width: 720px;
          margin: 0 auto;
        }

        .negatris-status {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: .75rem;
          margin-bottom: .7rem;
        }

        .status-chip {
          background: rgba(8, 14, 31, 0.72);
          border: 1px solid rgba(98, 139, 218, 0.3);
          border-radius: 16px;
          padding: .75rem .9rem;
        }

        .status-chip span {
          display: block;
          font-size: .8rem;
          text-transform: uppercase;
          letter-spacing: .05em;
          color: #a9c2f5;
          margin-bottom: .18rem;
        }

        .status-chip strong {
          font-size: 1.25rem;
          color: #eef4ff;
        }

        .status-chip.bonus {
          border-color: rgba(255, 207, 64, 0.95);
          box-shadow: 0 0 0 2px rgba(255, 207, 64, 0.12);
        }

        .negatris-intro,
        .report-view {
          display: grid;
          gap: 1rem;
        }

        .intro-card,
        .report-summary,
        .mistake-list,
        .negatris-board {
          background: rgba(8, 14, 31, 0.72);
          border: 1px solid rgba(98, 139, 218, 0.3);
          border-radius: 20px;
          padding: 1rem;
        }

        .intro-card {
          display: grid;
          gap: 1rem;
          align-items: center;
        }

        .negatris-icon {
          width: 92px;
          height: 92px;
          object-fit: contain;
          margin: 0 auto;
        }

        .intro-card h2,
        .report-summary h2,
        .mistake-list h3,
        .negatris-board h3 {
          margin: 0 0 .55rem;
          color: #eef4ff;
        }

        .intro-card ul,
        .mistake-list ul {
          margin: 0;
          padding-left: 1.1rem;
          color: #d8e6ff;
          line-height: 1.55;
        }

        .intro-actions,
        .report-actions {
          display: flex;
          gap: .75rem;
          flex-wrap: wrap;
          align-items: flex-start;
        }

        .hero-btn,
        .secondary-btn,
        .control-btn,
        .lane-button {
          border: none;
          cursor: pointer;
          transition: transform .08s ease, box-shadow .08s ease, border-color .08s ease;
        }

        .hero-btn,
        .secondary-btn {
          border-radius: 14px;
          padding: .85rem 1.2rem;
          font-weight: 800;
        }

        .hero-btn {
          background: linear-gradient(180deg, #f6bd60, #e9a93f);
          color: #13213b;
          box-shadow: 0 10px 18px rgba(0,0,0,.16);
        }

        .secondary-btn {
          background: #1f3157;
          color: #e7f0ff;
          border: 1px solid rgba(98, 139, 218, 0.38);
        }

        .feedback-bar {
          padding: .8rem .95rem;
          border-radius: 16px;
          background: rgba(8, 14, 31, 0.72);
          border: 1px solid rgba(98, 139, 218, 0.3);
          color: #dce9ff;
        }

        .feedback-bar.outboard {
          margin-top: .75rem;
        }

        .game-stage {
          position: relative;
          width: 100%;
          max-width: 640px;
          aspect-ratio: 10 / 9;
          margin: 0 auto;
          --bucket-row-height: 88px;
          --bucket-font-size: 24px;
          --bucket-radius: 16px;
          --word-min-width: 92px;
          --word-max-width: 180px;
          --word-font-size: 26px;
          --word-pad-y: 11px;
          --word-pad-x: 14px;
          border-radius: 22px;
          overflow: hidden;
          background:
            linear-gradient(180deg, rgba(9, 16, 34, 0.92) 0%, rgba(15, 24, 47, 0.96) 100%),
            radial-gradient(circle at top, rgba(53, 154, 240, 0.18), transparent 45%);
          border: 1px solid rgba(98, 139, 218, 0.28);
        }

        .stage-track {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 100% 46px, calc(100% / 6) 100%;
          pointer-events: none;
        }

        .falling-word {
          position: absolute;
          top: ${START_TOP};
          transform: translateX(-50%);
          min-width: var(--word-min-width);
          max-width: var(--word-max-width);
          padding: var(--word-pad-y) var(--word-pad-x);
          border-radius: 20px;
          background:
            linear-gradient(180deg, rgba(111, 240, 255, 0.24), rgba(111, 240, 255, 0.06) 18%, rgba(111, 240, 255, 0) 22%),
            linear-gradient(180deg, #203d98 0%, #172f7f 52%, #0f245f 100%);
          color: #f7fbff;
          border: 3px solid rgba(62, 235, 255, 0.98);
          font-weight: 900;
          font-size: var(--word-font-size);
          line-height: 1.05;
          text-align: center;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.22),
            inset 0 -5px 0 rgba(4, 15, 42, 0.45),
            0 0 0 2px rgba(8, 27, 72, 0.9),
            0 0 18px rgba(32, 208, 255, 0.32),
            0 0 30px rgba(32, 208, 255, 0.18),
            0 10px 20px rgba(0,0,0,.24);
          text-transform: lowercase;
          letter-spacing: .01em;
          white-space: nowrap;
          z-index: 3;
          text-shadow: 0 1px 0 rgba(7, 18, 51, 0.45);
          transition: left .08s linear, background .14s ease, box-shadow .14s ease, border-color .14s ease;
          animation: fall-word var(--fall-duration) linear forwards;
        }

        .falling-word.resolved {
          z-index: 2;
          animation: none;
          top: ${IMPACT_TOP};
          transform: translateX(-50%) scale(0.95);
        }

        .falling-word.is-correct {
          background:
            linear-gradient(180deg, rgba(201, 255, 182, 0.22), rgba(201, 255, 182, 0.05) 18%, rgba(201, 255, 182, 0) 22%),
            linear-gradient(180deg, #1c7b53 0%, #176845 50%, #114c32 100%);
          border-color: rgba(136, 255, 174, 0.98);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.18),
            inset 0 -5px 0 rgba(5, 32, 17, 0.4),
            0 0 0 2px rgba(8, 27, 72, 0.9),
            0 0 18px rgba(101, 245, 146, 0.28),
            0 0 28px rgba(101, 245, 146, 0.16),
            0 10px 20px rgba(0,0,0,.24);
        }

        .falling-word.is-wrong {
          background:
            linear-gradient(180deg, rgba(255, 190, 190, 0.2), rgba(255, 190, 190, 0.05) 18%, rgba(255, 190, 190, 0) 22%),
            linear-gradient(180deg, #8e2742 0%, #742039 48%, #57182b 100%);
          border-color: rgba(255, 132, 132, 0.98);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.16),
            inset 0 -5px 0 rgba(41, 8, 15, 0.42),
            0 0 0 2px rgba(8, 27, 72, 0.9),
            0 0 18px rgba(255, 104, 126, 0.24),
            0 0 28px rgba(255, 104, 126, 0.14),
            0 10px 20px rgba(0,0,0,.24);
        }

        .lane-row {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: .3rem;
          padding: .35rem;
          height: var(--bucket-row-height);
          box-sizing: border-box;
          background: rgba(8, 14, 31, 0.88);
          z-index: 5;
        }

        .bucket-shadow-lip {
          position: absolute;
          left: 0;
          right: 0;
          bottom: calc(var(--bucket-row-height) - 14px);
          height: 26px;
          background: linear-gradient(180deg, rgba(8, 14, 31, 0), rgba(8, 14, 31, 0.78));
          z-index: 4;
          pointer-events: none;
        }

        .lane-button {
          height: 100%;
          border-radius: var(--bucket-radius);
          background:
            linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0) 36%),
            linear-gradient(180deg, #79dfa5 0%, #63cdb9 42%, #57a9ea 100%);
          color: white;
          font-size: var(--bucket-font-size);
          line-height: 1;
          font-weight: 900;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.22),
            inset 0 -5px 0 rgba(10, 25, 45, 0.18),
            0 4px 10px rgba(0,0,0,.16);
          touch-action: manipulation;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          text-transform: lowercase;
        }

        .lane-button::before {
          content: "";
          position: absolute;
          inset: 3px 3px auto;
          height: 34%;
          border-radius: calc(var(--bucket-radius) - 4px);
          background: linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,0));
          pointer-events: none;
        }

        .lane-button::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 18%;
          background: linear-gradient(180deg, rgba(7, 18, 36, 0), rgba(7, 18, 36, .22));
          pointer-events: none;
        }

        .lane-button span {
          position: relative;
          z-index: 1;
          display: block;
          transform: translateY(2px);
          letter-spacing: -.01em;
          text-shadow: 0 1px 0 rgba(0,0,0,.12);
        }

        .lane-button.active {
          outline: 3px solid rgba(255, 207, 64, 0.85);
          transform: translateY(-1px);
        }

        .lane-button.flash-correct {
          background:
            linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0) 36%),
            linear-gradient(180deg, #91f6a2 0%, #54dc79 48%, #28be69 100%);
          box-shadow: 0 0 0 3px rgba(122, 245, 143, 0.18);
        }

        .lane-button.flash-incorrect {
          background:
            linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0) 36%),
            linear-gradient(180deg, #ffb2a2 0%, #ff7d7d 45%, #f14f68 100%);
          box-shadow: 0 0 0 3px rgba(255, 106, 106, 0.15);
        }

        .impact-badge {
          position: absolute;
          top: 1rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 4;
          padding: .55rem .85rem;
          border-radius: 999px;
          font-weight: 800;
          letter-spacing: .01em;
          box-shadow: 0 10px 18px rgba(0,0,0,.22);
        }

        .impact-badge.correct {
          background: rgba(69, 219, 135, 0.95);
          color: #0d1c2d;
        }

        .impact-badge.incorrect {
          background: rgba(255, 109, 109, 0.96);
          color: white;
        }

        .life-popup {
          position: absolute;
          top: 15%;
          left: 50%;
          width: 156px;
          height: 156px;
          display: grid;
          place-items: center;
          transform: translateX(-50%);
          z-index: 6;
          pointer-events: none;
          animation: life-pop 1.15s ease-out forwards;
        }

        .life-popup strong {
          position: relative;
          z-index: 3;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 88px;
          padding: .5rem .85rem;
          border-radius: 999px;
          background:
            linear-gradient(180deg, rgba(255,255,255,.22), rgba(255,255,255,0) 36%),
            linear-gradient(180deg, #c1ff75 0%, #68ef65 52%, #20c86f 100%);
          border: 2px solid rgba(237, 255, 223, 0.72);
          color: #10211f;
          font-size: 1.45rem;
          font-weight: 900;
          letter-spacing: .12em;
          text-indent: .12em;
          text-shadow: 0 1px 0 rgba(255,255,255,.18);
          box-shadow:
            inset 0 2px 0 rgba(255,255,255,.26),
            inset 0 -6px 12px rgba(10, 45, 32, .18),
            0 10px 22px rgba(0,0,0,.24);
        }

        .life-popup-burst {
          position: absolute;
          inset: 28px;
          border-radius: 50%;
          background:
            radial-gradient(circle, rgba(190,255,170,.38) 0%, rgba(190,255,170,.24) 36%, rgba(190,255,170,0) 68%),
            conic-gradient(
              from 0deg,
              rgba(255,255,255,0) 0deg 16deg,
              rgba(159,255,132,.82) 16deg 34deg,
              rgba(255,255,255,0) 34deg 46deg,
              rgba(93,242,129,.78) 46deg 64deg,
              rgba(255,255,255,0) 64deg 76deg,
              rgba(159,255,132,.82) 76deg 94deg,
              rgba(255,255,255,0) 94deg 106deg,
              rgba(93,242,129,.78) 106deg 124deg,
              rgba(255,255,255,0) 124deg 136deg,
              rgba(159,255,132,.82) 136deg 154deg,
              rgba(255,255,255,0) 154deg 166deg,
              rgba(93,242,129,.78) 166deg 184deg,
              rgba(255,255,255,0) 184deg 196deg,
              rgba(159,255,132,.82) 196deg 214deg,
              rgba(255,255,255,0) 214deg 226deg,
              rgba(93,242,129,.78) 226deg 244deg,
              rgba(255,255,255,0) 244deg 256deg,
              rgba(159,255,132,.82) 256deg 274deg,
              rgba(255,255,255,0) 274deg 286deg,
              rgba(93,242,129,.78) 286deg 304deg,
              rgba(255,255,255,0) 304deg 316deg,
              rgba(159,255,132,.82) 316deg 334deg,
              rgba(255,255,255,0) 334deg 346deg,
              rgba(93,242,129,.78) 346deg 360deg
            );
          filter: drop-shadow(0 0 12px rgba(149, 255, 145, 0.26));
          opacity: .95;
          z-index: 1;
        }

        .life-popup-ring {
          position: absolute;
          inset: 18px;
          border-radius: 50%;
          border: 2px solid rgba(178, 255, 159, 0.5);
          z-index: 0;
        }

        .life-popup-ring-a {
          transform: scale(1);
        }

        .life-popup-ring-b {
          inset: 8px;
          border-color: rgba(225, 255, 214, 0.3);
          transform: scale(1.06);
        }

        @keyframes fall-word {
          from {
            top: ${START_TOP};
          }
          to {
            top: ${IMPACT_TOP};
          }
        }

        @keyframes life-pop {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(20px) scale(0.72);
          }
          20% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1.08);
          }
          75% {
            opacity: 1;
            transform: translateX(-50%) translateY(-10px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-34px) scale(0.94);
          }
        }

        .control-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          margin-top: 1rem;
          padding: 0 .4rem;
        }

        .control-btn {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background:
            radial-gradient(circle at 30% 28%, rgba(255,255,255,.38), rgba(255,255,255,0) 34%),
            linear-gradient(180deg, #87ddff 0%, #66bdf3 48%, #4d8ce9 100%);
          border: 2px solid rgba(255,255,255,0.22);
          box-shadow:
            inset 0 2px 0 rgba(255,255,255,.28),
            inset 0 -8px 16px rgba(18, 53, 112, 0.28),
            0 10px 18px rgba(0,0,0,.2),
            0 0 0 3px rgba(92, 167, 241, .12);
          touch-action: manipulation;
          position: relative;
          overflow: hidden;
        }

        .control-btn::before {
          content: "";
          position: absolute;
          inset: 8px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.18);
          pointer-events: none;
        }

        .control-btn:hover {
          transform: translateY(-1px);
          box-shadow:
            inset 0 2px 0 rgba(255,255,255,.3),
            inset 0 -8px 16px rgba(18, 53, 112, 0.24),
            0 12px 20px rgba(0,0,0,.22),
            0 0 0 3px rgba(92, 167, 241, .16);
        }

        .control-btn:active {
          transform: translateY(2px) scale(0.98);
          box-shadow:
            inset 0 2px 0 rgba(255,255,255,.18),
            inset 0 -4px 12px rgba(18, 53, 112, 0.24),
            0 5px 10px rgba(0,0,0,.18);
        }

        .control-icon {
          width: 44%;
          height: 44%;
          overflow: visible;
        }

        .control-icon-shadow,
        .control-icon-main {
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .control-icon-shadow {
          stroke: rgba(16, 42, 84, 0.38);
          stroke-width: 11;
          transform: translateY(3px);
        }

        .control-icon-main {
          stroke: #f7fbff;
          stroke-width: 8;
          filter: drop-shadow(0 1px 0 rgba(255,255,255,.12));
        }

        .control-btn:active .control-icon {
          transform: translateY(1px);
        }

        .mistake-list ul li {
          display: grid;
          gap: .15rem;
          margin-bottom: .7rem;
        }

        .mistake-list ul li span {
          color: #b9ccef;
        }

        .negatris-leaderboards {
          display: grid;
          gap: 1rem;
        }

        .negatris-board-list {
          display: grid;
          gap: .45rem;
        }

        .negatris-board-row {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: .55rem;
          padding: .55rem .65rem;
          border-radius: 14px;
          background: rgba(22, 35, 66, 0.7);
          color: #dce8ff;
        }

        .negatris-board-row em {
          font-style: normal;
          color: #c3d6f7;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .negatris-board-row strong {
          color: #fff1ba;
        }

        .negatris-board-empty {
          margin: 0;
          color: #c2d2ef;
        }

        @media (min-width: 760px) {
          .negatris-intro {
            grid-template-columns: 1.3fr .9fr;
          }

          .negatris-leaderboards {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .negatris-panel {
            padding: .7rem;
            border-radius: 20px;
          }

          .negatris-status {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .negatris-sound-row {
            width: 100%;
            justify-content: stretch;
          }

          .negatris-sound-slider {
            width: 100%;
            justify-content: space-between;
          }

          .negatris-sound-slider input[type="range"] {
            flex: 1;
            min-width: 0;
          }

          .game-stage {
            border-radius: 18px;
          }

          .life-popup {
            width: 132px;
            height: 132px;
          }

          .life-popup strong {
            min-width: 74px;
            font-size: 1.18rem;
          }

          .bucket-shadow-lip {
            bottom: calc(var(--bucket-row-height) - 12px);
            height: 30px;
          }

          .lane-row {
            gap: .22rem;
            padding: .25rem;
          }

          .control-row {
            justify-content: space-between;
            gap: .75rem;
            padding: 0;
          }

          .control-btn {
            flex: 1;
            max-width: none;
            width: auto;
            height: 68px;
            border-radius: 999px;
          }

          .control-icon {
            width: 34px;
            height: 34px;
          }
        }
      `}</style>
    </div>
  );
}
