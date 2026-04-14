import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { QRCodeSVG } from "qrcode.react";
import Seo from "../common/Seo.jsx";
import {
  logHubSpanglishLiveFinished,
  logHubSpanglishLiveReportViewed,
  logHubSpanglishLiveStarted,
  rtdb,
} from "../../firebase";
import { getSitePath } from "../../siteConfig.js";
import { setLiveGameState, setLiveGameStatus } from "../../api/liveGames";
import { toast } from "../../utils/toast";
import { useTickSound } from "../../hooks/useTickSound";

const BASE_PHASE_SECONDS = 25;
const GRACE_SECONDS = 10;
const SPANGLISH_MUSIC_TRACKS = [
  "/audio/spanglish/tatamusic-jazz-jazz-music-485401.mp3",
  "/audio/spanglish/nikitakondrashev-groove-443114.mp3",
  "/audio/spanglish/alexguz-casino-funk-groove-299241.mp3",
  "/audio/spanglish/primalhousemusic-boyfriend-in-the-closet-336015.mp3",
  "/audio/spanglish/white_records-revival-of-chopin-waltz-hip-hop-version-background-piano-music-182223.mp3",
  "/audio/spanglish/cyberwave-orchestra-upbeat-mission-fun-and-quirky-adventure-248802.mp3",
  "/audio/spanglish/u_ljbqqscnr8-lantern-light-bistro-505936.mp3",
];

function computeScore(deadline, durationSeconds) {
  if (!deadline || !durationSeconds) return 10;
  const totalMs = durationSeconds * 1000;
  const remainingMs = Math.max(0, Math.min(totalMs, deadline - Date.now()));
  return Math.max(10, Math.min(100, Math.round(10 + 90 * (remainingMs / totalMs))));
}

function normalizeWord(value) {
  return String(value || "").toLowerCase().trim().replace(/[^\w\s]|_/g, "");
}

function splitSentence(sentence) {
  return String(sentence || "").split(" ");
}

export default function HubSpanglishLiveHost({ user }) {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const transitionLockRef = useRef(false);
  const graceLockRef = useRef(false);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [copyState, setCopyState] = useState("");
  const [soundVolume, setSoundVolume] = useState(0.9);
  const [soundMuted, setSoundMuted] = useState(false);
  const [musicSrc, setMusicSrc] = useState("");
  const liveActivityRef = useRef({
    started: false,
    finished: false,
    reportViewed: false,
  });
  const { tickRef, tickFastRef, playTick } = useTickSound();
  const revealRef = useRef(null);
  const finishRef = useRef(null);
  const musicRef = useRef(null);

  useEffect(() => {
    const gameRef = ref(rtdb, `liveGames/${gameId}`);
    const unsubscribe = onValue(gameRef, (snap) => {
      setGame(snap.exists() ? snap.val() : null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [gameId]);

  const isHost = !!user && !!game && user.uid === game.ownerUid;
  const items = Array.isArray(game?.items) ? game.items : [];
  const players = Object.entries(game?.players || {}).map(([id, data]) => ({ id, ...data }));
  const roundIndex = game?.state?.roundIndex ?? 0;
  const phase = game?.state?.phase || "lobby";
  const showRoundContent = game?.status === "in-progress" || game?.status === "finished";
  const currentItem = showRoundContent ? (items[roundIndex] || null) : null;
  const questionDeadline = game?.state?.questionDeadline ?? null;
  const scoreDeadline = game?.state?.scoreDeadline ?? null;
  const clickDuration = game?.state?.clickDuration || BASE_PHASE_SECONDS;
  const correctionDuration = game?.state?.correctionDuration || BASE_PHASE_SECONDS;
  const joinUrl = typeof window !== "undefined"
    ? `${window.location.origin}${getSitePath("/games/spanglish-fix-it/join")}?pin=${encodeURIComponent(game?.pin || "")}`
    : "";

  const clickCount = useMemo(() => {
    return Object.keys(game?.rounds?.[roundIndex]?.clickAnswers || {}).length;
  }, [game, roundIndex]);

  const correctionCount = useMemo(() => {
    return Object.keys(game?.rounds?.[roundIndex]?.correctionAnswers || {}).length;
  }, [game, roundIndex]);

  const roundClickAnswers = useMemo(
    () => Object.values(game?.rounds?.[roundIndex]?.clickAnswers || {}),
    [game, roundIndex]
  );

  const roundCorrectionAnswers = useMemo(
    () => Object.values(game?.rounds?.[roundIndex]?.correctionAnswers || {}),
    [game, roundIndex]
  );

  const currentPoints = useMemo(() => {
    if (phase === "click") return computeScore(scoreDeadline, clickDuration);
    if (phase === "correction") return computeScore(scoreDeadline, correctionDuration);
    return null;
  }, [phase, scoreDeadline, clickDuration, correctionDuration, remainingSeconds]);
  const phaseDuration = phase === "click" ? clickDuration : correctionDuration;
  const pointsBarKey = `${roundIndex}-${phase}-${scoreDeadline ?? "none"}`;

  const isGraceActive = (phase === "click" || phase === "correction") && questionDeadline && scoreDeadline && questionDeadline !== scoreDeadline;
  const revealClickCorrect = roundClickAnswers.filter((entry) => entry?.correct).length;
  const revealCorrectionCorrect = roundCorrectionAnswers.filter((entry) => entry?.correct).length;
  const topPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 5);
  const clickAnswerSummary = useMemo(() => {
    const counts = new Map();
    roundClickAnswers.forEach((entry) => {
      const key = entry?.selectedWord || "No answer";
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return [...counts.entries()].map(([value, count]) => ({ value, count }));
  }, [roundClickAnswers]);

  const correctionAnswerSummary = useMemo(() => {
    const counts = new Map();
    roundCorrectionAnswers.forEach((entry) => {
      const key = entry?.answer || "No answer";
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return [...counts.entries()].map(([value, count]) => ({ value, count }));
  }, [roundCorrectionAnswers]);

  const gameReport = useMemo(() => {
    const rounds = game?.rounds || {};
    const totalRounds = items.length;
    const totalPlayers = players.length;
    let totalClickSubmissions = 0;
    let totalCorrectionSubmissions = 0;
    let totalCorrectClicks = 0;
    let totalCorrectCorrections = 0;

    const perRound = items.map((item, index) => {
      const clickAnswers = Object.values(rounds?.[index]?.clickAnswers || {});
      const correctionAnswers = Object.values(rounds?.[index]?.correctionAnswers || {});
      totalClickSubmissions += clickAnswers.length;
      totalCorrectionSubmissions += correctionAnswers.length;
      totalCorrectClicks += clickAnswers.filter((entry) => entry?.correct).length;
      totalCorrectCorrections += correctionAnswers.filter((entry) => entry?.correct).length;

      const clickCounts = new Map();
      clickAnswers.forEach((entry) => {
        const key = entry?.selectedWord || "No answer";
        clickCounts.set(key, (clickCounts.get(key) || 0) + 1);
      });

      const correctionCounts = new Map();
      correctionAnswers.forEach((entry) => {
        const key = entry?.answer || "No answer";
        correctionCounts.set(key, (correctionCounts.get(key) || 0) + 1);
      });

      return {
        item,
        index,
        clickTotal: clickAnswers.length,
        correctionTotal: correctionAnswers.length,
        clickCorrect: clickAnswers.filter((entry) => entry?.correct).length,
        correctionCorrect: correctionAnswers.filter((entry) => entry?.correct).length,
        clickSummary: [...clickCounts.entries()].map(([value, count]) => ({ value, count })),
        correctionSummary: [...correctionCounts.entries()].map(([value, count]) => ({ value, count })),
      };
    });

    return {
      totalRounds,
      totalPlayers,
      totalClickSubmissions,
      totalCorrectionSubmissions,
      totalCorrectClicks,
      totalCorrectCorrections,
      perRound,
    };
  }, [game, items, players]);

  useEffect(() => {
    if (!questionDeadline || game?.status !== "in-progress" || (phase !== "click" && phase !== "correction" && phase !== "reveal")) {
      setRemainingSeconds(null);
      return;
    }

    function updateRemaining() {
      const diffMs = questionDeadline - Date.now();
      setRemainingSeconds(Math.max(0, Math.ceil(diffMs / 1000)));
    }

    updateRemaining();
    const id = window.setInterval(updateRemaining, 250);
    return () => window.clearInterval(id);
  }, [questionDeadline, game?.status, phase]);

  useEffect(() => {
    const vol = soundMuted ? 0 : soundVolume;
    [tickRef, tickFastRef, revealRef, finishRef, musicRef].forEach((audioRef) => {
      if (audioRef.current) {
        audioRef.current.volume = vol;
        audioRef.current.muted = soundMuted;
      }
    });
  }, [soundVolume, soundMuted, tickRef, tickFastRef]);

  async function setPhase(phaseName, extra = {}) {
    try {
      await setLiveGameState(gameId, { phase: phaseName, ...extra });
    } catch (error) {
      console.error("[HubSpanglishLiveHost] state update failed", error);
      toast("Could not update the live game state.");
    }
  }

  async function handleCopyJoinLink() {
    if (!joinUrl || typeof window === "undefined" || !navigator?.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopyState("Copied");
      window.setTimeout(() => setCopyState(""), 1800);
    } catch (error) {
      console.error("[HubSpanglishLiveHost] copy join link failed", error);
      setCopyState("Copy failed");
      window.setTimeout(() => setCopyState(""), 1800);
    }
  }

  async function handleStart() {
    try {
      await setLiveGameStatus(gameId, "in-progress");
      await setPhase("click", {
        roundIndex: 0,
        scoreDeadline: Date.now() + clickDuration * 1000,
        questionDeadline: Date.now() + clickDuration * 1000,
      });
      liveActivityRef.current.started = true;
      logHubSpanglishLiveStarted({
        gameId,
        pin: game?.pin || null,
        playerCount: players.length,
        roundCount: items.length,
      });
    } catch (error) {
      console.error("[HubSpanglishLiveHost] start failed", error);
      toast("Could not start the live game.");
    }
  }

  async function handleAdvance() {
    try {
      if (phase === "click") {
        await setPhase("correction", {
          scoreDeadline: Date.now() + correctionDuration * 1000,
          questionDeadline: Date.now() + correctionDuration * 1000,
        });
        return;
      }
      if (phase === "correction") {
        await setPhase("reveal", {
          scoreDeadline: null,
          questionDeadline: null,
        });
        if (revealRef.current) {
          try {
            revealRef.current.currentTime = 0;
            revealRef.current.play().catch(() => {});
          } catch {}
        }
        return;
      }
      if (phase === "reveal" && roundIndex < items.length - 1) {
        await setPhase("click", {
          roundIndex: roundIndex + 1,
          scoreDeadline: Date.now() + clickDuration * 1000,
          questionDeadline: Date.now() + clickDuration * 1000,
        });
        return;
      }
      await setLiveGameStatus(gameId, "finished");
      await setPhase("finished", { scoreDeadline: null, questionDeadline: null });
      liveActivityRef.current.finished = true;
      logHubSpanglishLiveFinished({
        gameId,
        pin: game?.pin || null,
        playerCount: players.length,
        roundCount: items.length,
        completedRounds: roundIndex + 1,
      });
      if (finishRef.current) {
        try {
          finishRef.current.currentTime = 0;
          finishRef.current.play().catch(() => {});
        } catch {}
      }
    } catch (error) {
      console.error("[HubSpanglishLiveHost] advance failed", error);
      toast("Could not move to the next live phase.");
    }
  }

  useEffect(() => {
    graceLockRef.current = false;
  }, [roundIndex, phase]);

  useEffect(() => {
    if (!isHost || game?.status !== "in-progress") return;
    if (phase !== "click") return;
    if (players.length < 1) return;
    if (clickCount < players.length) return;
    if (transitionLockRef.current) return;

    transitionLockRef.current = true;
    handleAdvance().finally(() => {
      window.setTimeout(() => {
        transitionLockRef.current = false;
      }, 400);
    });
  }, [isHost, game?.status, phase, clickCount, players.length]);

  useEffect(() => {
    if (!isHost || game?.status !== "in-progress") return;
    if (phase !== "click" && phase !== "correction") return;

    const answerCount = phase === "click" ? clickCount : correctionCount;
    if (answerCount < 1) return;
    if (!scoreDeadline) return;

    const now = Date.now();
    if (remainingSeconds == null || now < scoreDeadline) return;

    const graceDeadline = now + GRACE_SECONDS * 1000;

    if (questionDeadline === scoreDeadline) {
      if (graceLockRef.current) return;
      graceLockRef.current = true;
      setPhase(phase, { questionDeadline: graceDeadline }).catch(() => {
        graceLockRef.current = false;
      });
    }
  }, [isHost, game?.status, phase, questionDeadline, scoreDeadline, clickCount, correctionCount, remainingSeconds]);

  useEffect(() => {
    if (!isHost || game?.status !== "in-progress") return;
    if (phase !== "click" && phase !== "correction") return;
    if (remainingSeconds == null || remainingSeconds > 0) return;
    if (!scoreDeadline || questionDeadline === scoreDeadline) return;
    if (transitionLockRef.current) return;

    transitionLockRef.current = true;
    handleAdvance().finally(() => {
      window.setTimeout(() => {
        transitionLockRef.current = false;
      }, 400);
    });
  }, [isHost, game?.status, phase, remainingSeconds]);

  useEffect(() => {
    if (!isHost || !isGraceActive) return;
    if (remainingSeconds == null || remainingSeconds <= 0) return;
    playTick(remainingSeconds <= 3);
  }, [isHost, isGraceActive, remainingSeconds, playTick]);

  useEffect(() => {
    if (game?.status !== "finished" || liveActivityRef.current.finished) return;
    liveActivityRef.current.finished = true;
    logHubSpanglishLiveFinished({
      gameId,
      pin: game?.pin || null,
      playerCount: players.length,
      roundCount: items.length,
      completedRounds: items.length,
    });
  }, [game?.status, gameId, game?.pin, players.length, items.length]);

  useEffect(() => {
    const isMainPhase = (phase === "click" || phase === "correction") && !!scoreDeadline && questionDeadline === scoreDeadline;
    if (!isHost || !musicRef.current) return;

    if (!isMainPhase) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
      return;
    }

    const nextTrack = SPANGLISH_MUSIC_TRACKS[Math.floor(Math.random() * SPANGLISH_MUSIC_TRACKS.length)];
    setMusicSrc(nextTrack);
  }, [isHost, phase, roundIndex, scoreDeadline, questionDeadline]);

  useEffect(() => {
    if (!isHost || !musicRef.current || !musicSrc) return;
    const isMainPhase = (phase === "click" || phase === "correction") && !!scoreDeadline && questionDeadline === scoreDeadline;
    if (!isMainPhase) return;

    try {
      musicRef.current.currentTime = 0;
      musicRef.current.play().catch(() => {});
    } catch {}
  }, [isHost, musicSrc, phase, scoreDeadline, questionDeadline]);

  if (loading) {
    return <div className="page narrow"><p>Loading live host…</p></div>;
  }

  if (!game) {
    return <div className="page narrow"><p>Live game not found.</p></div>;
  }

  if (!isHost) {
    return <div className="page narrow"><p>You are not the host of this Spanglish game.</p></div>;
  }

  function handleToggleReport() {
    const next = !showReport;
    setShowReport(next);
    if (next && !liveActivityRef.current.reportViewed) {
      liveActivityRef.current.reportViewed = true;
      logHubSpanglishLiveReportViewed({
        gameId,
        pin: game?.pin || null,
        playerCount: players.length,
        roundCount: items.length,
      });
    }
  }

  return (
    <div className="menu-wrapper hub-spanglish-live-shell">
      <Seo title="Host Spanglish Fix-It Live | Seif Hub" description="Host a live Spanglish Fix-It game." />

      <div className="hub-spanglish-live-head">
        <div>
          <p className="hub-live-kicker">Spanglish Live Host</p>
          <h1>{game.title || "Spanglish Fix-It"}</h1>
          <p className="hub-live-copy">Teacher-only host screen. Students can join openly with the PIN, QR code, or link below.</p>
        </div>
        <button className="review-btn" onClick={() => navigate(getSitePath("/games/spanglish-fix-it"))}>
          Back to game
        </button>
      </div>

      {game.status === "finished" ? (
        <section className="hub-live-panel">
          <div className="hub-live-report-head">
            <div>
              <h2>Game complete</h2>
              <p className="hub-live-copy">Open the report for a full stats breakdown and question-by-question review.</p>
            </div>
            <button className="whats-new-btn" onClick={handleToggleReport}>
              {showReport ? "Hide game report" : "See game report"}
            </button>
          </div>
          {topPlayers.length ? (
            <div className="hub-live-podium-wrap">
              <p className="hub-live-kicker">Top 3</p>
              <div className="hub-live-podium">
                {topPlayers[1] ? (
                  <div className="hub-live-podium-card second">
                    <span className="hub-live-podium-rank">2</span>
                    <strong className="hub-live-podium-name">{topPlayers[1].name || "Guest"}</strong>
                    <span className="hub-live-podium-score">{topPlayers[1].score || 0} pts</span>
                  </div>
                ) : <div className="hub-live-podium-spacer" />}
                {topPlayers[0] ? (
                  <div className="hub-live-podium-card first">
                    <span className="hub-live-podium-rank">1</span>
                    <strong className="hub-live-podium-name">{topPlayers[0].name || "Guest"}</strong>
                    <span className="hub-live-podium-score">{topPlayers[0].score || 0} pts</span>
                  </div>
                ) : null}
                {topPlayers[2] ? (
                  <div className="hub-live-podium-card third">
                    <span className="hub-live-podium-rank">3</span>
                    <strong className="hub-live-podium-name">{topPlayers[2].name || "Guest"}</strong>
                    <span className="hub-live-podium-score">{topPlayers[2].score || 0} pts</span>
                  </div>
                ) : <div className="hub-live-podium-spacer" />}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {game.status === "finished" && showReport ? (
        <section className="hub-live-report">
          <div className="hub-live-report-summary">
            <div className="hub-live-stage-card">
              <h3>Main stats</h3>
              <div className="hub-live-meta">
                <span className="pill">Players: {gameReport.totalPlayers}</span>
                <span className="pill">Rounds: {gameReport.totalRounds}</span>
                <span className="pill">Click answers: {gameReport.totalClickSubmissions}</span>
                <span className="pill">Correction answers: {gameReport.totalCorrectionSubmissions}</span>
              </div>
              <div className="hub-live-meta">
                <span className="pill">Correct clicks: {gameReport.totalCorrectClicks}</span>
                <span className="pill">Correct corrections: {gameReport.totalCorrectCorrections}</span>
              </div>
            </div>

            <div className="hub-live-stage-card">
              <h3>Top scores</h3>
              <div className="hub-live-leaderboard">
                {topPlayers.map((player, index) => (
                  <div key={`report-${player.id}`} className="hub-live-player-card">
                    <strong>{index + 1}. {player.name || "Guest"}</strong>
                    <span>{player.score || 0} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="hub-live-report-questions">
            {gameReport.perRound.map((round) => (
              <article key={round.item.id} className="hub-live-stage-card">
                <h3>Round {round.index + 1}</h3>
                <p className="hub-live-copy">{round.item.sentence}</p>
                <div className="hub-live-meta">
                  <span className="pill">Wrong word: {round.item.errorWord}</span>
                  <span className="pill">Correct clicks: {round.clickCorrect}/{round.clickTotal}</span>
                  <span className="pill">Correct corrections: {round.correctionCorrect}/{round.correctionTotal}</span>
                </div>
                <p className="hub-live-copy"><strong>Accepted answer{round.item.correctAnswers?.length > 1 ? "s" : ""}:</strong> {round.item.correctAnswers?.join(" / ")}</p>

                <div className="hub-live-answer-summary">
                  <h4>Click responses</h4>
                  <div className="hub-live-answer-list">
                    {round.clickSummary.length ? round.clickSummary.map((entry) => (
                      <span key={`report-click-${round.item.id}-${entry.value}`} className={`hub-live-answer-chip ${normalizeWord(entry.value) === normalizeWord(round.item.errorWord) ? "is-correct" : "is-incorrect"}`}>
                        {entry.value} x{entry.count}
                      </span>
                    )) : <span className="hub-live-copy">No click submissions</span>}
                  </div>
                </div>

                <div className="hub-live-answer-summary">
                  <h4>Correction responses</h4>
                  <div className="hub-live-answer-list">
                    {round.correctionSummary.length ? round.correctionSummary.map((entry) => {
                      const isAccepted = (round.item.correctAnswers || []).some((answer) => normalizeWord(answer) === normalizeWord(entry.value));
                      return (
                        <span key={`report-correction-${round.item.id}-${entry.value}`} className={`hub-live-answer-chip ${isAccepted ? "is-correct" : "is-incorrect"}`}>
                          {entry.value} x{entry.count}
                        </span>
                      );
                    }) : <span className="hub-live-copy">No correction submissions</span>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {game.status === "lobby" ? (
        <div className="hub-live-grid">
          <section className="hub-live-panel">
            <h2>Join details</h2>
            <div className="hub-live-meta">
              <span className="pill">PIN: {game.pin}</span>
              <span className="pill">Players: {players.length}</span>
              <span className="pill">Phase: {phase}</span>
            </div>
            {joinUrl ? (
              <div className="hub-live-join-card">
                <div className="hub-live-qr-block">
                  <div className="hub-live-qr-frame">
                    <div className="hub-live-qr">
                      <QRCodeSVG value={joinUrl} size={164} includeMargin bgColor="#ffffff" fgColor="#13213b" />
                    </div>
                  </div>
                  <button type="button" className="review-btn" onClick={handleCopyJoinLink}>
                    {copyState || "Copy link"}
                  </button>
                </div>
              </div>
            ) : null}
          </section>

          <section className="hub-live-panel">
            <h2>Round control</h2>
            <p className="hub-live-copy">Ready to start the live game. Students can join now with the PIN, QR code, or link.</p>
            <div className="hub-live-actions">
              <button className="whats-new-btn" onClick={handleStart}>Start live game</button>
            </div>
          </section>
        </div>
      ) : (
        <section className="hub-live-stage">
          <div className="hub-live-stage-top">
            <div className="hub-live-stage-copy">
              <p className="hub-live-kicker">Round {currentItem ? `${roundIndex + 1}/${items.length}` : "Ready"}</p>
              <h2>{phase === "click" ? "Find the error" : phase === "correction" ? "Correction phase" : phase === "reveal" ? "Answer reveal" : "Game complete"}</h2>
              <div className="hub-live-meta">
                <span className="pill">PIN: {game.pin}</span>
                <span className="pill">Players: {players.length}</span>
                <span className="pill">Phase: {phase}</span>
                {remainingSeconds != null ? <span className="pill">{remainingSeconds}s left</span> : null}
                {isGraceActive ? <span className="pill">Grace period</span> : null}
                {phase === "reveal" ? <span className="pill">Teacher-led reveal</span> : null}
              </div>
            </div>
            <div className="hub-live-stage-controls">
              <div className="hub-live-sound">
                <span className="hub-live-sound-label">Sound</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round(soundVolume * 100)}
                  onChange={(e) => setSoundVolume(Number(e.target.value) / 100)}
                  aria-label="Live game volume"
                />
                <button
                  type="button"
                  className="review-btn"
                  onClick={() => setSoundMuted((current) => !current)}
                >
                  {soundMuted ? "Muted" : "Sound on"}
                </button>
              </div>
              <button className="whats-new-btn" onClick={handleAdvance}>
                {phase === "click" ? "Open correction" : phase === "correction" ? "Reveal answer" : phase === "reveal" && roundIndex < items.length - 1 ? "Next round" : "Finish game"}
              </button>
            </div>
          </div>

          {(phase === "click" || phase === "correction") && currentPoints != null ? (
            <div className="hub-live-stage-meter">
              <div className="hub-live-stage-meter-copy">
                <strong>{phase === "click" ? "Points available for spotting the error" : "Points available for the correction"}</strong>
                <span>{currentPoints} pts</span>
              </div>
              <div className="hub-live-stage-meter-bar">
                <div
                  key={pointsBarKey}
                  className="hub-live-stage-meter-fill is-animated"
                  style={
                    scoreDeadline
                      ? { animationDuration: `${phaseDuration * 1000}ms` }
                      : { width: "0%" }
                  }
                />
              </div>
            </div>
          ) : null}

          {currentItem ? (
            <div className="hub-live-stage-sentence-wrap">
              <p className="hub-live-stage-sentence">
                {splitSentence(currentItem.sentence).map((word, index) => {
                  const showTarget = phase === "correction" || phase === "reveal" || phase === "finished";
                  const isTarget = showTarget && normalizeWord(word) === normalizeWord(currentItem.errorWord);
                  return (
                    <span key={`${currentItem.id}-${index}`} className={isTarget ? "hub-live-stage-word is-target" : "hub-live-stage-word"}>
                      {word}{" "}
                    </span>
                  );
                })}
              </p>
            </div>
          ) : (
            <p className="hub-live-copy">Waiting for the next round.</p>
          )}

          <div className="hub-live-stage-grid">
            <div className="hub-live-stage-card">
              <h3>Live response status</h3>
              <div className="hub-live-meta">
                <span className="pill">Clicks: {clickCount}</span>
                <span className="pill">Corrections: {correctionCount}</span>
              </div>
              {phase === "click" ? (
                <p className="hub-live-copy">Students are choosing the wrong word. After the main timer ends, a short grace period starts once at least one answer has been submitted.</p>
              ) : null}
              {phase === "correction" ? (
                <p className="hub-live-copy">Students are typing the correction. The same timing logic applies here before you reveal the answer.</p>
              ) : null}
              {phase === "reveal" ? (
                <div className="hub-live-reveal-block">
                  <p><strong>Wrong word:</strong> {currentItem?.errorWord}</p>
                  <p><strong>Accepted answer{currentItem?.correctAnswers?.length > 1 ? "s" : ""}:</strong> {currentItem?.correctAnswers?.join(" / ")}</p>
                  <div className="hub-live-meta">
                    <span className="pill">Correct clicks: {revealClickCorrect}</span>
                    <span className="pill">Correct corrections: {revealCorrectionCorrect}</span>
                  </div>
                  {clickAnswerSummary.length ? (
                    <div className="hub-live-answer-summary">
                      <h4>Anonymous click answers</h4>
                      <div className="hub-live-answer-list">
                        {clickAnswerSummary.map((entry) => (
                          <span key={`click-${entry.value}`} className={`hub-live-answer-chip ${normalizeWord(entry.value) === normalizeWord(currentItem?.errorWord) ? "is-correct" : "is-incorrect"}`}>
                            {entry.value} x{entry.count}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {correctionAnswerSummary.length ? (
                    <div className="hub-live-answer-summary">
                      <h4>Anonymous correction answers</h4>
                      <div className="hub-live-answer-list">
                        {correctionAnswerSummary.map((entry) => {
                          const isAccepted = (currentItem?.correctAnswers || []).some((answer) => normalizeWord(answer) === normalizeWord(entry.value));
                          return (
                            <span key={`correction-${entry.value}`} className={`hub-live-answer-chip ${isAccepted ? "is-correct" : "is-incorrect"}`}>
                              {entry.value} x{entry.count}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="hub-live-stage-card">
              <h3>Leaderboard</h3>
              <div className="hub-live-leaderboard">
                {topPlayers.length ? topPlayers.map((player, index) => (
                  <div key={player.id} className="hub-live-player-card">
                    <strong>{index + 1}. {player.name || "Guest"}</strong>
                    <span>{player.score || 0} pts</span>
                  </div>
                )) : <p className="hub-live-copy">No players have joined yet.</p>}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="hub-live-panel">
        <h2>Players</h2>
        <div className="hub-live-players">
          {players.length ? players.map((player) => (
            <div key={player.id} className="hub-live-player-card">
              <strong>{player.name || "Guest"}</strong>
              <span>{player.score || 0} pts</span>
            </div>
          )) : <p className="hub-live-copy">No players have joined yet.</p>}
        </div>
      </section>

      <style>{`
        .hub-spanglish-live-shell { padding-top: 0; margin-top: 0; }
        .hub-spanglish-live-head { display:flex; justify-content:space-between; gap:1rem; align-items:flex-start; margin-bottom:1rem; }
        .hub-live-kicker { margin:0 0 .25rem; font-size:.82rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:#8eb6ff; }
        .hub-spanglish-live-head h1 { margin:0; color:#eef4ff; font-size:clamp(1.7rem,1.35rem + 1vw,2.35rem); }
        .hub-live-copy, .hub-live-link { color:rgba(230,240,255,.82); line-height:1.45; }
        .hub-live-grid { display:grid; grid-template-columns:1.1fr 1fr; gap:1rem; margin-bottom:1rem; }
        .hub-live-podium-wrap { margin-top:1rem; padding-top:1rem; border-top:1px solid rgba(118,146,219,.2); }
        .hub-live-podium { display:flex; justify-content:center; align-items:flex-end; gap:1rem; margin-top:.75rem; }
        .hub-live-podium-card { width:min(180px, 30vw); min-height:132px; border-radius:22px 22px 12px 12px; padding:1rem .9rem; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; text-align:center; box-shadow:0 16px 28px rgba(0,0,0,.18); border:1px solid rgba(118,146,219,.26); background:linear-gradient(180deg, rgba(41,59,102,.95), rgba(21,34,61,.96)); color:#eef4ff; }
        .hub-live-podium-card.first { min-height:182px; background:linear-gradient(180deg, rgba(246,189,96,.28), rgba(31,46,81,.96)); border-color:rgba(246,189,96,.58); }
        .hub-live-podium-card.second { min-height:154px; background:linear-gradient(180deg, rgba(198,210,226,.16), rgba(31,46,81,.96)); }
        .hub-live-podium-card.third { min-height:140px; background:linear-gradient(180deg, rgba(211,138,92,.18), rgba(31,46,81,.96)); }
        .hub-live-podium-rank { display:block; font-size:2rem; line-height:1; font-weight:900; margin-bottom:.45rem; color:#fff7db; }
        .hub-live-podium-name { display:block; font-size:1rem; line-height:1.2; max-width:100%; overflow:hidden; text-overflow:ellipsis; }
        .hub-live-podium-score { margin-top:.35rem; color:rgba(230,240,255,.78); font-weight:700; }
        .hub-live-podium-spacer { width:min(180px, 30vw); }
        .hub-live-report-head { display:flex; justify-content:space-between; gap:1rem; align-items:flex-start; }
        .hub-live-report { display:grid; gap:1rem; margin-bottom:1rem; }
        .hub-live-report-summary { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        .hub-live-report-questions { display:grid; gap:1rem; }
        .hub-live-panel { background:rgba(20,33,59,.86); border:1px solid rgba(77,110,184,.38); border-radius:22px; padding:1.1rem 1.2rem; box-shadow:0 12px 26px rgba(0,0,0,.16); }
        .hub-live-panel h2 { margin-top:0; color:#eef4ff; }
        .hub-live-meta { display:flex; gap:.55rem; flex-wrap:wrap; margin-bottom:.85rem; }
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
        .hub-live-stage { background:linear-gradient(180deg, rgba(20,33,59,.92), rgba(16,28,51,.92)); border:1px solid rgba(96,128,204,.42); border-radius:26px; padding:1.25rem 1.35rem; box-shadow:0 18px 36px rgba(0,0,0,.2); margin-bottom:1rem; }
        .hub-live-stage-top { display:flex; justify-content:space-between; gap:1rem; align-items:flex-start; margin-bottom:1rem; }
        .hub-live-stage-copy h2 { margin:.1rem 0 .35rem; color:#eef4ff; font-size:clamp(1.55rem,1.25rem + .7vw,2.1rem); }
        .hub-live-stage-controls { display:grid; justify-items:end; gap:.75rem; }
        .hub-live-sound { display:flex; align-items:center; gap:.65rem; flex-wrap:wrap; justify-content:flex-end; }
        .hub-live-sound-label { color:#dfeaff; font-weight:800; font-size:.92rem; }
        .hub-live-sound input[type="range"] { width:132px; accent-color:#f0b956; }
        .hub-live-stage-meter { margin-bottom:1.1rem; }
        .hub-live-stage-meter-copy { display:flex; justify-content:space-between; gap:1rem; align-items:center; margin-bottom:.45rem; color:#eef4ff; }
        .hub-live-stage-meter-copy span { color:rgba(230,240,255,.82); font-weight:700; }
        .hub-live-stage-meter-bar { width:100%; height:16px; border-radius:999px; background:rgba(255,255,255,.1); overflow:hidden; box-shadow:inset 0 0 0 1px rgba(255,255,255,.08); }
        .hub-live-stage-meter-fill { height:100%; border-radius:inherit; background:linear-gradient(90deg, #f87171, #facc15, #4ade80); }
        .hub-live-stage-meter-fill.is-animated { width:100%; transform-origin:left center; animation-name:hubLiveHostPointsDrain; animation-timing-function:linear; animation-fill-mode:forwards; }
        @keyframes hubLiveHostPointsDrain {
          from { transform:scaleX(1); }
          to { transform:scaleX(0); }
        }
        .hub-live-stage-sentence-wrap { padding:1.1rem 1.15rem; border-radius:22px; background:rgba(255,255,255,.04); border:1px solid rgba(118,146,219,.26); margin-bottom:1rem; }
        .hub-live-stage-sentence { margin:0; color:#f4f7ff; font-size:clamp(1.5rem,1.2rem + 1vw,2.3rem); line-height:1.42; font-weight:700; letter-spacing:-.01em; }
        .hub-live-stage-word.is-target { background:rgba(40,167,69,.82); color:#f4fff6; border-radius:14px; padding:.04em .28em; }
        .hub-live-stage-grid { display:grid; grid-template-columns:1.2fr .85fr; gap:1rem; }
        .hub-live-stage-card { background:rgba(255,255,255,.035); border:1px solid rgba(118,146,219,.2); border-radius:20px; padding:1rem 1.05rem; }
        .hub-live-stage-card h3 { margin:0 0 .7rem; color:#eef4ff; font-size:1.02rem; }
        .hub-live-reveal-block p { color:#eef4ff; margin:.2rem 0 .5rem; line-height:1.45; }
        .hub-live-answer-summary { margin-top:.85rem; }
        .hub-live-answer-summary h4 { margin:0 0 .45rem; color:#dfeaff; font-size:.94rem; }
        .hub-live-answer-list { display:flex; flex-wrap:wrap; gap:.45rem; }
        .hub-live-answer-chip { display:inline-flex; align-items:center; gap:.3rem; padding:.42rem .62rem; border-radius:999px; border:1px solid rgba(118,146,219,.28); background:rgba(255,255,255,.05); color:#eef4ff; font-size:.88rem; font-weight:700; }
        .hub-live-answer-chip.is-correct { background:rgba(40,167,69,.14); border-color:rgba(40,167,69,.4); color:#dbf8e6; }
        .hub-live-answer-chip.is-incorrect { background:rgba(231,76,60,.13); border-color:rgba(231,76,60,.34); color:#ffe1de; }
        .hub-live-leaderboard { display:grid; gap:.65rem; }
        .hub-live-join-card { display:flex; justify-content:center; margin-top:1rem; padding:1rem; border-radius:20px; background:rgba(255,255,255,.04); border:1px solid rgba(118,146,219,.24); }
        .hub-live-qr-block { display:grid; justify-items:center; gap:.85rem; }
        .hub-live-qr-frame { display:flex; align-items:center; justify-content:center; padding:.8rem; border-radius:22px; background:linear-gradient(180deg, rgba(41,59,102,.96), rgba(26,41,74,.96)); border:1px solid rgba(118,146,219,.28); box-shadow:inset 0 0 0 1px rgba(255,255,255,.04); }
        .hub-live-qr { display:flex; justify-content:center; padding:.35rem; border-radius:18px; background:#ffffff; }
        .hub-live-qr-block .review-btn { width:fit-content; }
        .hub-live-actions { margin-top:1rem; display:flex; gap:.7rem; }
        .hub-live-players { display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:.75rem; }
        .hub-live-player-card { background:rgba(26,40,71,.9); border:1px solid rgba(77,110,184,.36); border-radius:16px; padding:.9rem 1rem; display:flex; flex-direction:column; gap:.25rem; color:#eef4ff; }
        @media (max-width: 720px) {
          .hub-spanglish-live-head { flex-direction:column; }
          .hub-spanglish-live-head .review-btn { width:100%; }
          .hub-live-grid { grid-template-columns:1fr; }
          .hub-live-podium { gap:.65rem; }
          .hub-live-podium-card, .hub-live-podium-spacer { width:30%; min-width:0; }
          .hub-live-report-head { flex-direction:column; }
          .hub-live-report-head .whats-new-btn { width:100%; }
          .hub-live-report-summary { grid-template-columns:1fr; }
          .hub-live-stage-top { flex-direction:column; }
          .hub-live-sound { width:100%; justify-content:flex-start; }
          .hub-live-sound input[type="range"] { width:100%; }
          .hub-live-stage-controls .whats-new-btn { width:100%; }
          .hub-live-stage-controls { width:100%; justify-items:stretch; }
          .hub-live-stage-grid { grid-template-columns:1fr; }
          .hub-live-stage-meter-copy { flex-direction:column; align-items:flex-start; gap:.25rem; }
        }
      `}</style>

      <audio ref={tickRef} src="/sounds/tick.mp3" preload="auto" />
      <audio ref={tickFastRef} src="/sounds/tick_fast.mp3" preload="auto" />
      <audio ref={revealRef} src="/sounds/reveal.mp3" preload="auto" />
      <audio ref={finishRef} src="/sounds/finish.mp3" preload="auto" />
      <audio ref={musicRef} src={musicSrc || undefined} preload="auto" loop />
    </div>
  );
}
