import React, { useEffect, useMemo, useState } from "react";
import { onValue, ref } from "firebase/database";
import { Check, LockKeyhole, Send } from "lucide-react";
import { useParams } from "react-router-dom";

import { submitTextbookVocabLiveAnswer } from "../../api/liveGames.js";
import { auth, rtdb } from "../../firebase.js";
import { toast } from "../../utils/toast.js";
import useLiveRoundTimer from "../live/useLiveRoundTimer.js";
import { getTextbookVocabLiveMode } from "./textbookVocabLive.js";
import "../vocabulary/collocations/CollocationTeamLive.css";
import "./TextbookVocabLiveGame.css";

export default function TextbookVocabLivePlayer() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [matches, setMatches] = useState([]);

  useEffect(() => onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
    setGame(snapshot.exists() ? snapshot.val() : null);
    setLoading(false);
  }), [gameId]);

  const uid = auth.currentUser?.uid || "";
  const me = uid ? game?.players?.[uid] : null;
  const players = useMemo(() => Object.entries(game?.players || {})
    .map(([playerUid, player]) => ({ uid: playerUid, ...player }))
    .sort((left, right) => (Number(right.score) || 0) - (Number(left.score) || 0)
      || String(left.name || "").localeCompare(String(right.name || ""))), [game?.players]);
  const items = game?.items || [];
  const status = game?.status || "lobby";
  const phase = game?.state?.phase || "lobby";
  const questionIndex = Number(game?.state?.questionIndex) || 0;
  const questionDuration = Number(game?.state?.questionDuration) || 30;
  const deadline = game?.state?.questionDeadline || null;
  const currentItem = items[questionIndex] || null;
  const interactionType = currentItem?.interactionType || game?.interactionType || "multiple-choice";
  const interactionMode = getTextbookVocabLiveMode(interactionType);
  const myAnswer = uid ? game?.answers?.[questionIndex]?.[uid] : null;
  const isQuestion = status === "in-progress" && phase === "question";
  const isReveal = status === "in-progress" && phase === "reveal";
  const remainingSeconds = useLiveRoundTimer(deadline, isQuestion);
  const displayedScore = isQuestion && myAnswer
    ? Math.max(0, (Number(me?.score) || 0) - (Number(myAnswer.scoreDelta) || 0))
    : Number(me?.score) || 0;
  const myRank = players.findIndex((player) => player.uid === uid) + 1;

  useEffect(() => {
    setTypedAnswer("");
    setMatches(Array(currentItem?.pairs?.length || 0).fill(""));
  }, [currentItem?.id, currentItem?.pairs?.length]);

  async function answer(payload) {
    if (!isQuestion || !currentItem || myAnswer || submitting || remainingSeconds === 0) return;
    setSubmitting(true);
    try {
      await submitTextbookVocabLiveAnswer({ gameId, ...payload });
    } catch (error) {
      console.error("[TextbookVocabLivePlayer] answer failed", error);
      toast(error.message || "Could not submit your answer.");
    } finally {
      setSubmitting(false);
    }
  }

  function optionState(optionIndex) {
    if (isReveal) {
      if (optionIndex === currentItem?.answerIndex) return "correct";
      if (myAnswer?.selectedIndex === optionIndex) return "wrong";
      return "quiet";
    }
    return myAnswer?.selectedIndex === optionIndex ? "selected" : "";
  }

  function submitWrittenAnswer(event) {
    event.preventDefault();
    answer({ typedAnswer });
  }

  function updateMatch(pairIndex, optionIndex) {
    setMatches((previous) => previous.map((value, index) => index === pairIndex ? optionIndex : value));
  }

  function submitMatches(event) {
    event.preventDefault();
    answer({ matches: matches.map(Number) });
  }

  if (loading) return <main className="ctl-page tvl-page"><p>Joining the vocabulary room…</p></main>;
  if (!game) return <main className="ctl-page tvl-page"><h1>Textbook Vocabulary Live</h1><p>Quiz not found.</p></main>;

  const matchingComplete = matches.length === 4 && matches.every((value) => value !== "");
  const actionPrompt = interactionType === "write"
    ? "Write the answer"
    : interactionType === "matching"
      ? "Match all four items"
      : "Choose the best answer";
  const revealHeading = interactionType === "matching" && myAnswer
    ? `${myAnswer.correctCount || 0} out of ${myAnswer.totalCount || 4} correct`
    : myAnswer?.correct
      ? "Correct — well done"
      : myAnswer
        ? "Check the answer"
        : "No answer submitted";

  return (
    <main className="ctl-page tvl-page tvl-player">
      <header className="ctl-hero">
        <div>
          <p className="ctl-kicker">Textbook Vocabulary Live</p>
          <h1>{game.title || "Textbook Vocabulary Quiz"}</h1>
          <p>PIN {game.pin} · {items.length} live rounds · {game.interactionType === "mixed" ? "Mixed formats" : interactionMode.label}</p>
        </div>
        {me && <span className="ctl-team-badge">{displayedScore} pts{myRank ? ` · #${myRank}` : ""}</span>}
      </header>

      {phase === "lobby" && (
        <section className="ctl-panel ctl-player-lobby">
          {!me ? <><span className="ctl-label">Not joined</span><h2>Enter this room through the join page</h2><p>Your teacher can share the PIN or QR link with you.</p></> : <><span className="ctl-label">You’re in</span><h2>Hi, {me.name || "player"}</h2><p>Waiting for your teacher to start the first {interactionType === "matching" ? "round" : "question"}.</p><div className="ctl-player-list ctl-player-list-centred">{players.map((player) => <span className="ctl-player-chip" key={player.uid}>{player.name || "Player"}</span>)}</div></>}
        </section>
      )}

      {(isQuestion || isReveal) && currentItem && me && (
        <>
          <section className="ctl-round-status">
            <div>
              <span className="ctl-label">{interactionType === "matching" ? "Round" : "Question"} {questionIndex + 1} of {items.length}</span>
              <strong>{isReveal ? revealHeading : myAnswer ? "Answer locked" : actionPrompt}</strong>
            </div>
            {isQuestion ? <div className={`ctl-timer ${remainingSeconds != null && remainingSeconds <= 10 ? "is-low" : ""}`}><span>Time left</span><strong>{remainingSeconds ?? questionDuration}</strong></div> : <div className={`tvl-feedback-badge ${myAnswer?.correct || Number(myAnswer?.scoreDelta) > 0 ? "is-correct" : ""}`}><span>{myAnswer ? `+${myAnswer.scoreDelta || 0} points` : "Answer revealed"}</span></div>}
          </section>

          <section className="ctl-question-card tvl-question-card">
            <div className="ctl-question-meta"><span>{interactionMode.shortLabel}</span><span>{currentItem.level?.toUpperCase()}</span><span>{currentItem.sourceThemeTitle}</span><span>{currentItem.sourceActivityTitle}</span></div>
            {interactionType !== "matching" && currentItem.image && <img className="tvl-question-media" src={currentItem.image} alt={currentItem.imageAlt || "Vocabulary question"} />}
            {interactionType !== "matching" && !currentItem.image && currentItem.colorHex && <div className="tvl-question-media tvl-colour" role="img" aria-label="Colour shown for this vocabulary question" style={{ background: currentItem.colorHex }} />}
            <h2>{String(currentItem.text || currentItem.sentence || "").replace("___", "_____")}</h2>

            {interactionType === "multiple-choice" && (
              <div className="ctl-option-grid tvl-option-grid">
                {(currentItem.options || []).map((option, optionIndex) => (
                  <button
                    className={optionState(optionIndex)}
                    type="button"
                    key={`${option}-${optionIndex}`}
                    disabled={!isQuestion || !!myAnswer || submitting || remainingSeconds === 0}
                    onClick={() => answer({ selectedIndex: optionIndex })}
                  >
                    <b>{String.fromCharCode(65 + optionIndex)}</b><span>{option}</span>{myAnswer?.selectedIndex === optionIndex && !isReveal ? <LockKeyhole size={18} /> : null}{isReveal && optionIndex === currentItem.answerIndex ? <Check size={20} /> : null}
                  </button>
                ))}
              </div>
            )}

            {interactionType === "write" && (
              <form className="tvl-write-form" onSubmit={submitWrittenAnswer}>
                <label htmlFor="tvl-written-answer">Your answer</label>
                <div><input id="tvl-written-answer" value={myAnswer?.typedAnswer || typedAnswer} onChange={(event) => setTypedAnswer(event.target.value)} disabled={!isQuestion || !!myAnswer || submitting || remainingSeconds === 0} autoComplete="off" maxLength={200} autoFocus /><button className="ctl-button ctl-button-primary" type="submit" disabled={!isQuestion || !!myAnswer || submitting || remainingSeconds === 0 || !typedAnswer.trim()}><Send size={17} /> Submit</button></div>
              </form>
            )}

            {interactionType === "matching" && (
              <form className="tvl-player-matching" onSubmit={submitMatches}>
                <div className="tvl-matching-select-list">
                  {(currentItem.pairs || []).map((pair, pairIndex) => (
                    <label key={pair.id}>
                      <span className="tvl-match-prompt">
                        {pair.image && <img src={pair.image} alt={pair.imageAlt || "Vocabulary prompt"} />}
                        {!pair.image && pair.colorHex && <i aria-label="Colour prompt" style={{ background: pair.colorHex }} />}
                        <strong>{String(pair.prompt || "").replace("___", "_____")}</strong>
                      </span>
                      <select value={myAnswer?.matches?.[pairIndex] ?? matches[pairIndex] ?? ""} onChange={(event) => updateMatch(pairIndex, event.target.value)} disabled={!isQuestion || !!myAnswer || submitting || remainingSeconds === 0} className={isReveal && myAnswer ? (myAnswer.matches?.[pairIndex] === pair.answerIndex ? "correct" : "wrong") : ""}>
                        <option value="">Choose a match…</option>
                        {(currentItem.matchOptions || []).map((option, optionIndex) => <option value={optionIndex} disabled={!myAnswer && matches.some((value, index) => value !== "" && index !== pairIndex && Number(value) === optionIndex)} key={option}>{option}</option>)}
                      </select>
                      {isReveal ? <small>Correct: {currentItem.matchOptions?.[pair.answerIndex]}</small> : null}
                    </label>
                  ))}
                </div>
                <button className="ctl-button ctl-button-primary tvl-match-submit" type="submit" disabled={!isQuestion || !!myAnswer || submitting || remainingSeconds === 0 || !matchingComplete}><Check size={17} /> Lock all four matches</button>
              </form>
            )}
            {isQuestion && myAnswer && <p className="ctl-discuss-note ctl-answer-locked">Your answer is locked. The result stays hidden until the reveal.</p>}
            {isQuestion && !myAnswer && remainingSeconds === 0 && <p className="ctl-discuss-note">Time is up. Waiting for the answer reveal.</p>}
            {isReveal && interactionType !== "matching" && <div className={`tvl-personal-feedback ${myAnswer?.correct ? "is-correct" : "is-wrong"}`}><strong>{myAnswer?.correct ? "That’s right." : `Correct answer: ${currentItem.answer || currentItem.options?.[currentItem.answerIndex] || ""}`}</strong>{myAnswer?.correct ? <span>You earned {myAnswer.scoreDelta || 0} points.</span> : <span>Use the feedback before the next question begins.</span>}</div>}
            {isReveal && interactionType === "matching" && <div className={`tvl-personal-feedback ${myAnswer?.correct ? "is-correct" : "is-wrong"}`}><strong>{myAnswer ? `${myAnswer.correctCount || 0} of ${myAnswer.totalCount || 4} matches correct.` : "No matches submitted."}</strong><span>{myAnswer ? `You earned ${myAnswer.scoreDelta || 0} points.` : "Review the four correct pairs above."}</span></div>}
          </section>
        </>
      )}

      {(isQuestion || isReveal) && !me && <section className="ctl-panel ctl-player-lobby"><h2>You haven’t joined this room.</h2><p>Return to the join page and enter PIN {game.pin}.</p></section>}

      {phase === "finished" && (
        <section className="ctl-panel ctl-player-lobby">
          <span className="ctl-label">Quiz complete</span><h2>{me ? `${me.name || "Player"}, you finished #${myRank}` : "Final scores"}</h2>
          {me && <div className="ctl-personal-result"><strong>{Number(me.score) || 0}</strong><span>total points</span></div>}
          <div className="ctl-results-grid tvl-player-results">{players.slice(0, 5).map((player, index) => <article className="ctl-result-card" key={player.uid}><span>#{index + 1}</span><h3>{player.name || "Player"}</h3><strong>{Number(player.score) || 0}</strong><span>points</span></article>)}</div>
        </section>
      )}
    </main>
  );
}
