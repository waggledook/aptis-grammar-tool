import React, { useEffect, useMemo, useRef, useState } from "react";
import { onValue, ref } from "firebase/database";
import { Copy, Eye, Play, SkipForward, Square } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Link, useParams } from "react-router-dom";

import {
  finishTextbookVocabLiveGame,
  revealTextbookVocabLiveQuestion,
  setTextbookVocabLiveDuration,
  startNextTextbookVocabLiveQuestion,
  startTextbookVocabLiveGame,
} from "../../api/liveGames.js";
import { auth, rtdb } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import { toast } from "../../utils/toast.js";
import useLiveRoundTimer from "../live/useLiveRoundTimer.js";
import { getTextbookVocabLiveMode } from "./textbookVocabLive.js";
import { APTIS_GRAMMAR_LIVE_GAME_TYPE } from "../grammar/aptisGrammarLive.js";
import AptisGrammarOptionExplanations from "../grammar/AptisGrammarOptionExplanations.jsx";
import AptisGrammarLiveResults from "../grammar/AptisGrammarLiveResults.jsx";
import "../vocabulary/collocations/CollocationTeamLive.css";
import "./TextbookVocabLiveGame.css";
import "../grammar/aptisGrammarLive.css";

function playerScore(player, currentAnswer, phase) {
  if (phase !== "question" || !currentAnswer) return Number(player.score) || 0;
  return Math.max(0, (Number(player.score) || 0) - (Number(currentAnswer.scoreDelta) || 0));
}

export default function TextbookVocabLiveHost({ subject = "vocabulary" }) {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [copyState, setCopyState] = useState("");
  const [connectionError, setConnectionError] = useState("");
  const autoRevealKeyRef = useRef("");

  useEffect(() => onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
    setGame(snapshot.exists() ? snapshot.val() : null);
    setLoading(false);
  }, () => { setConnectionError("Could not connect to this live room. Please reload and try again."); setLoading(false); }), [gameId]);

  const isGrammar = subject === "grammar" || game?.type === APTIS_GRAMMAR_LIVE_GAME_TYPE;
  const activityTitle = isGrammar ? "Aptis Grammar Live" : "Textbook Vocabulary Live";

  const players = useMemo(() => Object.entries(game?.players || {})
    .map(([uid, player]) => ({ uid, ...player }))
    .sort((left, right) => (left.joinedAt || 0) - (right.joinedAt || 0)), [game?.players]);
  const items = game?.items || [];
  const status = game?.status || "lobby";
  const phase = game?.state?.phase || "lobby";
  const questionIndex = Number(game?.state?.questionIndex) || 0;
  const questionDuration = Number(game?.state?.questionDuration) || 30;
  const deadline = game?.state?.questionDeadline || null;
  const currentItem = items[questionIndex] || null;
  const interactionType = currentItem?.interactionType || game?.interactionType || "multiple-choice";
  const interactionMode = getTextbookVocabLiveMode(interactionType);
  const activeInteractionTypes = [...new Set(items.map((item) => item.interactionType || "multiple-choice"))];
  const sessionModeLabel = activeInteractionTypes.length > 1
    ? "Mixed formats"
    : getTextbookVocabLiveMode(activeInteractionTypes[0]).label;
  const answers = useMemo(() => game?.answers?.[questionIndex] || {}, [game?.answers, questionIndex]);
  const answeredCount = Object.keys(answers).length;
  const isQuestion = status === "in-progress" && phase === "question";
  const isReveal = status === "in-progress" && phase === "reveal";
  const isHost = auth.currentUser?.uid === game?.ownerUid;
  const remainingSeconds = useLiveRoundTimer(deadline, isQuestion);
  const allPlayersAnswered = players.length > 0 && answeredCount >= players.length;
  const sortedPlayers = useMemo(() => [...players].sort((left, right) => {
    const scoreDifference = playerScore(right, answers[right.uid], phase) - playerScore(left, answers[left.uid], phase);
    return scoreDifference || String(left.name || "").localeCompare(String(right.name || ""));
  }), [answers, phase, players]);

  useEffect(() => {
    if (!isHost || !isQuestion || (!allPlayersAnswered && remainingSeconds !== 0)) return;
    const key = `${questionIndex}:${deadline}`;
    if (autoRevealKeyRef.current === key) return;
    autoRevealKeyRef.current = key;
    revealTextbookVocabLiveQuestion(gameId, deadline, questionIndex).catch((error) => {
      autoRevealKeyRef.current = "";
      console.error("[TextbookVocabLiveHost] automatic reveal failed", error);
      toast("Could not reveal this question automatically.");
    });
  }, [allPlayersAnswered, deadline, gameId, isHost, isQuestion, questionIndex, remainingSeconds]);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const joinUrl = `${baseUrl}${getSitePath(`/live/join?pin=${encodeURIComponent(game?.pin || "")}`)}`;
  const optionCounts = (currentItem?.options || []).map((_, optionIndex) => (
    Object.values(answers).filter((answer) => answer?.selectedIndex === optionIndex).length
  ));

  async function runAction(action, failureMessage) {
    if (busy) return;
    setBusy(true);
    try {
      await action();
    } catch (error) {
      console.error("[TextbookVocabLiveHost] action failed", error);
      toast(error.message || failureMessage);
    } finally {
      setBusy(false);
    }
  }

  async function copyJoinLink() {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopyState("Copied");
      window.setTimeout(() => setCopyState(""), 1600);
    } catch {
      setCopyState("Copy failed");
    }
  }

  function startQuiz() {
    if (!players.length) {
      toast("Wait for at least one student to join.");
      return;
    }
    runAction(() => startTextbookVocabLiveGame(gameId), "Could not start the quiz.");
  }

  function nextQuestion() {
    const isLastQuestion = questionIndex >= items.length - 1;
    runAction(
      () => isLastQuestion ? finishTextbookVocabLiveGame(gameId) : startNextTextbookVocabLiveQuestion(gameId),
      isLastQuestion ? "Could not finish the quiz." : `Could not start the next ${interactionType === "matching" ? "round" : "question"}.`
    );
  }

  if (loading) return <main className="ctl-page tvl-page"><p>Opening the live room…</p></main>;
  if (!game) return <main className="ctl-page tvl-page"><h1>{activityTitle}</h1><p>{connectionError || "Quiz not found."}</p></main>;
  if (!isHost) return <main className="ctl-page tvl-page"><h1>{activityTitle}</h1><p>You are not the host of this quiz.</p></main>;

  const phaseLabel = phase === "question"
    ? `${interactionType === "matching" ? "Round" : "Question"} ${questionIndex + 1} of ${items.length}`
    : phase === "reveal"
      ? `${interactionType === "matching" ? "Round" : "Question"} ${questionIndex + 1} feedback`
      : phase === "finished"
        ? "Complete"
        : "Lobby";

  return (
    <main className={`ctl-page tvl-page tvl-host ${isGrammar ? "agl-live-room" : ""} ${isGrammar && phase === "finished" ? "agl-finished-room" : ""}`}>
      {isGrammar && (phase === "lobby" || phase === "finished") && <Link className="agl-back" to={getSitePath("/teacher-resources/aptis-grammar")}>← Back to Grammar Quiz Studio</Link>}
      <header className="ctl-hero">
        <div>
          <p className="ctl-kicker">{activityTitle}</p>
          <h1>{game.title || activityTitle}</h1>
          <p>{items.length} live rounds · {sessionModeLabel}</p>
        </div>
        <span className={`ctl-phase ctl-phase-${phase}`}>{phaseLabel}</span>
      </header>

      {phase === "lobby" && (
        <>
          <section className="ctl-panel ctl-join-panel">
            <div>
              <span className="ctl-label">Game PIN</span>
              <strong className="ctl-pin">{game.pin}</strong>
              <button className="ctl-button ctl-button-secondary" type="button" onClick={copyJoinLink}><Copy size={17} /> Copy join link</button>
              {copyState && <span className="ctl-small">{copyState}</span>}
            </div>
            <QRCodeSVG value={joinUrl} size={112} bgColor="#ffffff" fgColor="#10213c" />
          </section>

          <section className="ctl-panel">
            <div className="ctl-panel-heading">
              <div><span className="ctl-label">Lobby</span><h2>{players.length} student{players.length === 1 ? "" : "s"} joined</h2></div>
              <div className="tvl-duration-fields">
                {activeInteractionTypes.map((activeType) => {
                  const activeMode = getTextbookVocabLiveMode(activeType);
                  const duration = Number(game?.state?.modeDurations?.[activeType]) || activeMode.defaultDuration;
                  return <label className="tvl-duration-field" key={activeType}>{activeMode.label}<select value={duration} disabled={busy} onChange={(event) => runAction(() => setTextbookVocabLiveDuration(gameId, Number(event.target.value), activeType), "Could not change the timer.")}><option value={15}>15 seconds</option><option value={20}>20 seconds</option><option value={30}>30 seconds</option><option value={45}>45 seconds</option><option value={60}>60 seconds</option><option value={90}>90 seconds</option></select></label>;
                })}
              </div>
            </div>
            {players.length ? (
              <div className="ctl-player-list tvl-lobby-players">{players.map((player) => <span className="ctl-player-chip" key={player.uid}>{player.name || "Player"}</span>)}</div>
            ) : <div className="ctl-waiting"><strong>Waiting for students</strong><p>Share the PIN or QR code. Joined students will appear here.</p></div>}
            <div className="ctl-actions"><button className="ctl-button ctl-button-primary" type="button" disabled={busy || !players.length} onClick={startQuiz}><Play size={17} /> Start first round</button></div>
          </section>
        </>
      )}

      {(isQuestion || isReveal) && currentItem && (
        <>
          <section className="ctl-round-status">
            <div><span className="ctl-label">Class progress</span><strong>{answeredCount} / {players.length} students answered</strong><small>{isQuestion ? "The answer reveals automatically when everyone responds or time runs out." : "Review the answer, then move the class on."}</small></div>
            {isQuestion ? (
              <div className="tvl-round-controls">
                <div className={`ctl-timer ${remainingSeconds != null && remainingSeconds <= 10 ? "is-low" : ""}`}><span>Time left</span><strong>{remainingSeconds ?? questionDuration}</strong></div>
                <button className="ctl-button ctl-button-secondary" type="button" disabled={busy} onClick={() => runAction(() => revealTextbookVocabLiveQuestion(gameId, deadline, questionIndex), "Could not reveal the answer.")}><Eye size={17} /> Reveal now</button>
              </div>
            ) : (
              <button className="ctl-button ctl-button-primary" type="button" disabled={busy} onClick={nextQuestion}>{questionIndex >= items.length - 1 ? <Square size={17} /> : <SkipForward size={17} />}{questionIndex >= items.length - 1 ? "Finish quiz" : `Next ${interactionType === "matching" ? "round" : "question"}`}</button>
            )}
          </section>

          <section className="ctl-question-card tvl-question-card">
            <div className="ctl-question-meta"><span>{interactionMode.shortLabel}</span><span>{currentItem.level?.toUpperCase()}</span><span>{currentItem.sourceThemeTitle}</span><span>{currentItem.sourceActivityTitle}</span></div>
            {interactionType !== "matching" && currentItem.image && <img className="tvl-question-media" src={currentItem.image} alt={currentItem.imageAlt || "Vocabulary question"} />}
            {interactionType !== "matching" && !currentItem.image && currentItem.colorHex && <div className="tvl-question-media tvl-colour" role="img" aria-label="Colour shown for this vocabulary question" style={{ background: currentItem.colorHex }} />}
            <h2>{String(currentItem.text || currentItem.sentence || "").replace("___", "_____")}</h2>

            {interactionType === "multiple-choice" && (
              <div className="ctl-option-grid ctl-option-grid-display tvl-option-grid">
                {(currentItem.options || []).map((option, optionIndex) => {
                  const count = optionCounts[optionIndex] || 0;
                  const percentage = answeredCount ? Math.round((count / answeredCount) * 100) : 0;
                  const optionState = isReveal ? optionIndex === currentItem.answerIndex ? "correct" : "quiet" : "";
                  return <div className={`tvl-host-option ${optionState}`} key={`${option}-${optionIndex}`}><span><b>{String.fromCharCode(65 + optionIndex)}</b>{option}</span>{isReveal && <span className="tvl-response"><i style={{ width: `${percentage}%` }} /><small>{count} · {percentage}%</small></span>}</div>;
                })}
              </div>
            )}

            {interactionType === "write" && (
              <div className="tvl-host-write">
                {isReveal ? <p className="tvl-correct-answer"><span>Correct answer</span><strong>{currentItem.answer}</strong></p> : <p>Students are writing their answers now.</p>}
                {isReveal && answeredCount > 0 ? (
                  <div className="tvl-written-response-grid">
                    {Object.entries(answers).map(([uid, answer]) => <span className={answer.correct ? "correct" : ""} key={uid}>{answer.typedAnswer}</span>)}
                  </div>
                ) : null}
              </div>
            )}

            {interactionType === "matching" && (
              <div className="tvl-host-matching">
                <div className="tvl-matching-pairs">
                  {(currentItem.pairs || []).map((pair) => (
                    <article key={pair.id}>
                      <div className="tvl-match-prompt">
                        {pair.image && <img src={pair.image} alt={pair.imageAlt || "Vocabulary prompt"} />}
                        {!pair.image && pair.colorHex && <i aria-label="Colour prompt" style={{ background: pair.colorHex }} />}
                        <strong>{String(pair.prompt || "").replace("___", "_____")}</strong>
                      </div>
                      <span aria-hidden="true">→</span>
                      <b className={isReveal ? "revealed" : ""}>{isReveal ? currentItem.matchOptions?.[pair.answerIndex] : "?"}</b>
                    </article>
                  ))}
                </div>
                {!isReveal ? <div className="tvl-match-answer-bank">{(currentItem.matchOptions || []).map((option) => <span key={option}>{option}</span>)}</div> : null}
              </div>
            )}
            {isGrammar && isReveal && <AptisGrammarOptionExplanations key={`${gameId}:${questionIndex}`} item={currentItem} />}
          </section>

          <section className="ctl-panel">
            <div className="ctl-panel-heading"><div><span className="ctl-label">Scoreboard</span><h2>{isReveal ? `${interactionType === "matching" ? "Round" : "Question"} results` : "Live progress"}</h2></div></div>
            <div className="ctl-progress-grid">
              {sortedPlayers.map((player, index) => {
                const answer = answers[player.uid];
                const score = playerScore(player, answer, phase);
                const revealedResult = interactionType === "matching" && answer
                  ? `${answer.correctCount || 0} / ${answer.totalCount || 4} correct · +${answer.scoreDelta || 0} pts`
                  : answer?.correct
                    ? `Correct · +${answer.scoreDelta || 0} pts`
                    : answer
                      ? "Not this time"
                      : "No answer";
                return <article className="ctl-progress-card" key={player.uid}><strong>#{index + 1} · {player.name || "Player"}</strong><span>{score} pts</span><div className="ctl-progress-track"><i style={{ width: `${answer ? 100 : 0}%` }} /></div><small>{isReveal ? revealedResult : answer ? "Answer locked" : "Thinking…"}</small></article>;
              })}
            </div>
          </section>
        </>
      )}

      {phase === "finished" && (
        isGrammar ? <AptisGrammarLiveResults key={gameId} game={game} /> :
        <section className="ctl-panel">
          <span className="ctl-label">Quiz complete</span><h2>Final scores</h2>
          <div className="ctl-results-grid">{sortedPlayers.map((player, index) => <article className="ctl-result-card" key={player.uid}><span>#{index + 1}</span><h3>{player.name || "Player"}</h3><strong>{Number(player.score) || 0}</strong><span>points</span></article>)}</div>
        </section>
      )}
    </main>
  );
}
