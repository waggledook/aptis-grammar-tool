import React, { useEffect, useMemo, useState } from "react";
import { onValue, ref } from "firebase/database";
import { useParams } from "react-router-dom";

import { auth, rtdb } from "../../../firebase.js";
import { submitCollocationTeamAnswer } from "../../../api/liveGames.js";
import { toast } from "../../../utils/toast.js";
import CollocationFeedback from "./CollocationFeedback.jsx";
import {
  collocationTeamTotalPoints,
  evaluateCollocationSelection,
  getCollocationTeamCaptain,
  getCollocationLiveRound,
  getCorrectWords,
} from "./collocationTeamLive.js";
import useCollocationRoundTimer from "./useCollocationRoundTimer.js";
import "./CollocationTeamLive.css";

function displayName(players, uid) {
  return players?.[uid]?.name || "Player";
}

export default function CollocationTeamLivePlayer() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWords, setSelectedWords] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
      setGame(snapshot.exists() ? snapshot.val() : null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [gameId]);

  const uid = auth.currentUser?.uid;
  const me = uid ? game?.players?.[uid] : null;
  const teamId = me?.teamId;
  const team = teamId ? game?.teams?.[teamId] : null;
  const items = game?.items || [];
  const {
    phase, isReview, isQuestion, isReveal,
    index: roundIndex, itemIndex: currentItemIndex, item: currentItem, captainPosition,
  } = getCollocationLiveRound(game);
  const answersRoot = isReview ? game?.reviewAnswers : game?.teamAnswers;
  const teamAnswer = teamId ? answersRoot?.[teamId]?.[currentItemIndex] : null;
  const captainUid = getCollocationTeamCaptain(team, captainPosition);
  const isCaptain = !!uid && uid === captainUid;
  const correctTargetCount = getCorrectWords(currentItem).length;
  const feedbackResult = evaluateCollocationSelection(currentItem, teamAnswer?.selectedWords || []);
  const remainingSeconds = useCollocationRoundTimer(game?.state?.questionDeadline, isQuestion);
  const teammates = useMemo(
    () => (team?.memberUids || []).map((memberUid) => ({
      uid: memberUid,
      name: displayName(game?.players, memberUid),
    })),
    [game?.players, team?.memberUids]
  );

  useEffect(() => {
    setSelectedWords([]);
  }, [currentItemIndex, isReview]);

  function toggleWord(word) {
    if (!isCaptain || submitting || teamAnswer || !isQuestion || remainingSeconds === 0) return;
    setSelectedWords((previous) => {
      if (previous.includes(word)) return previous.filter((entry) => entry !== word);
      if (previous.length >= correctTargetCount) {
        toast(`Choose only ${correctTargetCount} target collocations.`);
        return previous;
      }
      return [...previous, word];
    });
  }

  async function handleSubmit() {
    if (!isCaptain || !currentItem || submitting || teamAnswer || !isQuestion) return;
    if (selectedWords.length !== correctTargetCount) {
      toast(`Choose ${correctTargetCount} words before submitting.`);
      return;
    }
    setSubmitting(true);
    try {
      await submitCollocationTeamAnswer({
        gameId,
        itemIndex: currentItemIndex,
        selectedWords,
        review: isReview,
      });
    } catch (error) {
      console.error("[CollocationTeamLivePlayer] submit failed", error);
      toast(error.message || "Could not submit the team answer.");
    } finally {
      setSubmitting(false);
    }
  }

  function optionClass(option) {
    const chosenWords = isReveal ? teamAnswer?.selectedWords || [] : teamAnswer?.selectedWords || selectedWords;
    if (!isReveal) return chosenWords.includes(option.word) ? "selected" : "";
    if (option.isCorrect && chosenWords.includes(option.word)) return "correct";
    if (option.isCorrect) return "missed";
    if (chosenWords.includes(option.word)) return "wrong";
    return "quiet";
  }

  if (loading) return <main className="ctl-page"><p>Joining the team room…</p></main>;
  if (!game) return <main className="ctl-page"><h1>Collocation Team Challenge</h1><p>Game not found.</p></main>;

  return (
    <main className="ctl-page ctl-player">
      <header className="ctl-hero">
        <div>
          <p className="ctl-kicker">Collocation Team Challenge</p>
          <h1>{game.title}</h1>
          <p>PIN {game.pin}</p>
        </div>
        {team && <span className="ctl-team-badge">{team.name} · {collocationTeamTotalPoints(game, teamId)} pts</span>}
      </header>

      {(phase === "play" || phase === "review") && (
        <section className="ctl-panel">
          <h2>This room uses the previous game format</h2>
          <p>Ask your teacher to create a new room to use timed sets and immediate feedback.</p>
        </section>
      )}

      {phase === "lobby" && (
        <section className="ctl-panel ctl-player-lobby">
          {!me && <p>Your place in the lobby is being confirmed…</p>}
          {me && !team && <><span className="ctl-label">You’re in</span><h2>Waiting for your teacher to create the teams</h2></>}
          {team && (
            <>
              <span className="ctl-label">Your team</span>
              <h2>{team.name}</h2>
              <div className="ctl-player-list ctl-player-list-centred">
                {teammates.map((player) => <span className="ctl-player-chip" key={player.uid}>{player.name}</span>)}
              </div>
              <p className="ctl-muted">
                {game.state?.teamsLocked
                  ? `Teams are locked. ${displayName(game.players, getCollocationTeamCaptain(team, 0))} will be the first captain.`
                  : "Your teacher can still adjust the teams."}
              </p>
            </>
          )}
        </section>
      )}

      {(isQuestion || isReveal) && team && currentItem && (
        <>
          <section className="ctl-round-status">
            <div>
              <span className="ctl-label">{isReview ? `Review set ${roundIndex + 1} of ${game.state.reviewItemIndexes.length}` : `Set ${roundIndex + 1} of ${items.length}`}</span>
              <strong>{isReveal ? `${feedbackResult.percentage}% · ${feedbackResult.points} points this set` : teamAnswer ? "Answer locked" : "Choose together"}</strong>
            </div>
            {isQuestion ? (
              <div className={`ctl-timer ${remainingSeconds != null && remainingSeconds <= 10 ? "is-low" : ""}`}>
                <span>Time left</span><strong>{remainingSeconds ?? 45}</strong>
              </div>
            ) : (
              <div className="ctl-captain-banner"><span>Next step</span><strong>Teacher starts the next set</strong></div>
            )}
          </section>

          <section className="ctl-question-card">
            <div className="ctl-question-meta">
              <span>{currentItem.level?.toUpperCase()}</span><span>{currentItem.topic}</span><span>{currentItem.pattern}</span>
            </div>
            <p className="ctl-question-copy">{currentItem.question}</p>
            <p className="ctl-target-copy">Choose {correctTargetCount} target collocations.</p>
            <h2>{currentItem.prompt}</h2>
            <div className="ctl-option-grid">
              {(currentItem.options || []).map((option) => (
                <button
                  key={option.word}
                  type="button"
                  className={optionClass(option)}
                  onClick={() => toggleWord(option.word)}
                  disabled={!isQuestion || !isCaptain || submitting || !!teamAnswer || remainingSeconds === 0}
                >
                  {option.word}
                </button>
              ))}
            </div>

            {isQuestion && isCaptain && !teamAnswer && (
              <button className="ctl-button ctl-button-primary ctl-submit" type="button" onClick={handleSubmit} disabled={submitting || selectedWords.length !== correctTargetCount || remainingSeconds === 0}>
                {submitting ? "Submitting…" : `Submit team answer (${selectedWords.length}/${correctTargetCount})`}
              </button>
            )}
            {isQuestion && !isCaptain && !teamAnswer && <p className="ctl-discuss-note">Discuss the choices. {displayName(game.players, captainUid)} is this set’s captain.</p>}
            {isQuestion && teamAnswer && <p className="ctl-discuss-note ctl-answer-locked">Answer locked — waiting for the reveal.</p>}
            {isQuestion && remainingSeconds === 0 && !teamAnswer && <p className="ctl-discuss-note">Time is up. No answer was submitted for this set.</p>}
            {isReveal && !teamAnswer && <p className="ctl-discuss-note">No answer was submitted. This set earns 0 points.</p>}
            {isReveal && <CollocationFeedback item={currentItem} result={feedbackResult} />}
          </section>
        </>
      )}

      {(isQuestion || isReveal) && !team && (
        <section className="ctl-panel"><h2>You have not been assigned to a team.</h2><p>Ask your teacher to create the teams again.</p></section>
      )}

      {phase === "finished" && (
        <section className="ctl-panel ctl-player-lobby">
          <span className="ctl-label">Game complete</span>
          <h2>{team?.name || "Your team"}</h2>
          <div className="ctl-personal-result">
            <strong>{team ? collocationTeamTotalPoints(game, teamId) : 0}</strong>
            <span>total points</span>
          </div>
        </section>
      )}
    </main>
  );
}
