import React, { useEffect, useMemo, useState } from "react";
import { onValue, ref } from "firebase/database";
import { useParams } from "react-router-dom";

import { auth, rtdb } from "../../../firebase.js";
import { submitCollocationTeamAnswer } from "../../../api/liveGames.js";
import { toast } from "../../../utils/toast.js";
import {
  getCollocationTeamCaptain,
  getCorrectWords,
  getNextUnansweredIndex,
} from "./collocationTeamLive.js";
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
  const phase = game?.state?.phase || "lobby";
  const reviewIndexes = game?.state?.reviewItemIndexes || [];
  const mainAnswers = teamId ? game?.teamAnswers?.[teamId] || {} : {};
  const reviewAnswers = teamId ? game?.reviewAnswers?.[teamId] || {} : {};
  const mainPosition = getNextUnansweredIndex(mainAnswers, items.length);
  const reviewPosition = reviewIndexes.findIndex((itemIndex) => !reviewAnswers?.[itemIndex]);
  const activePosition = phase === "review"
    ? items.length + (reviewPosition < 0 ? reviewIndexes.length : reviewPosition)
    : mainPosition;
  const activeItemIndex = phase === "review"
    ? (reviewPosition < 0 ? null : reviewIndexes[reviewPosition])
    : (mainPosition >= items.length ? null : mainPosition);
  const currentItem = activeItemIndex == null ? null : items[activeItemIndex];
  const captainUid = getCollocationTeamCaptain(team, activePosition);
  const isCaptain = !!uid && uid === captainUid;
  const correctTargetCount = getCorrectWords(currentItem).length;
  const completedCount = phase === "review"
    ? reviewIndexes.filter((itemIndex) => reviewAnswers?.[itemIndex]).length
    : mainPosition;
  const totalCount = phase === "review" ? reviewIndexes.length : items.length;
  const teammates = useMemo(
    () => (team?.memberUids || []).map((memberUid) => ({
      uid: memberUid,
      name: displayName(game?.players, memberUid),
    })),
    [game?.players, team?.memberUids]
  );

  useEffect(() => {
    setSelectedWords([]);
  }, [activeItemIndex, phase]);

  function toggleWord(word) {
    if (!isCaptain || submitting) return;
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
    if (!isCaptain || !currentItem || submitting) return;
    if (selectedWords.length !== correctTargetCount) {
      toast(`Choose ${correctTargetCount} words before submitting.`);
      return;
    }
    setSubmitting(true);
    try {
      await submitCollocationTeamAnswer({
        gameId,
        itemIndex: activeItemIndex,
        selectedWords,
        review: phase === "review",
      });
    } catch (error) {
      console.error("[CollocationTeamLivePlayer] submit failed", error);
      toast(error.message || "Could not submit the team answer.");
    } finally {
      setSubmitting(false);
    }
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
        {team && <span className="ctl-team-badge">{team.name}</span>}
      </header>

      {phase === "lobby" && (
        <section className="ctl-panel ctl-player-lobby">
          {!me && <p>Your place in the lobby is being confirmed…</p>}
          {me && !team && (
            <>
              <span className="ctl-label">You’re in</span>
              <h2>Waiting for your teacher to create the teams</h2>
            </>
          )}
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

      {(phase === "play" || phase === "review") && team && (
        <>
          <section className="ctl-round-status">
            <div>
              <span className="ctl-label">{phase === "review" ? "Most-missed review" : "Team round"}</span>
              <strong>{completedCount} / {totalCount} complete</strong>
            </div>
            <div className={isCaptain ? "ctl-captain-banner is-you" : "ctl-captain-banner"}>
              <span>Captain</span>
              <strong>{isCaptain ? "You" : displayName(game.players, captainUid)}</strong>
            </div>
          </section>

          {currentItem ? (
            <section className="ctl-question-card">
              <div className="ctl-question-meta">
                <span>{currentItem.level?.toUpperCase()}</span>
                <span>{currentItem.topic}</span>
                <span>{currentItem.pattern}</span>
              </div>
              <p className="ctl-question-copy">{currentItem.question}</p>
              <p className="ctl-target-copy">
                Choose {correctTargetCount} target collocations. Selected: {selectedWords.length} / {correctTargetCount}
              </p>
              <h2>{currentItem.prompt}</h2>
              <div className="ctl-option-grid">
                {(currentItem.options || []).map((option) => (
                  <button
                    key={option.word}
                    type="button"
                    className={selectedWords.includes(option.word) ? "selected" : ""}
                    onClick={() => toggleWord(option.word)}
                    disabled={!isCaptain || submitting}
                  >
                    {option.word}
                  </button>
                ))}
              </div>
              {isCaptain ? (
                <button className="ctl-button ctl-button-primary ctl-submit" type="button" onClick={handleSubmit} disabled={submitting || selectedWords.length !== correctTargetCount}>
                  {submitting ? "Submitting…" : "Submit team answer"}
                </button>
              ) : (
                <p className="ctl-discuss-note">Discuss the choices. Only the current captain submits the team answer.</p>
              )}
            </section>
          ) : (
            <section className="ctl-panel ctl-wait-card">
              <span className="ctl-label">Your team is finished</span>
              <h2>Wait for the other teams</h2>
              <p>The teacher will start the next phase when everyone is ready.</p>
            </section>
          )}
        </>
      )}

      {(phase === "play" || phase === "review") && !team && (
        <section className="ctl-panel"><h2>You have not been assigned to a team.</h2><p>Ask your teacher to return to the lobby setup.</p></section>
      )}

      {phase === "finished" && (
        <section className="ctl-panel">
          <span className="ctl-label">Game complete</span>
          <h2>{team?.name || "Your team"}</h2>
          {team && (
            <div className="ctl-personal-result">
              <strong>{Object.values(mainAnswers).filter((answer) => answer.isPerfect).length}/{items.length}</strong>
              <span>sets perfect first time</span>
              {!!reviewIndexes.length && <p>{Object.values(reviewAnswers).filter((answer) => answer.isPerfect).length}/{reviewIndexes.length} perfect in the review</p>}
            </div>
          )}
          {!!reviewIndexes.length && (
            <div className="ctl-answer-review">
              <h3>Review answers</h3>
              {reviewIndexes.map((itemIndex) => {
                const item = items[itemIndex];
                return (
                  <article key={itemIndex}>
                    <h4>{item?.prompt}</h4>
                    {(item?.options || []).filter((option) => option.isCorrect).map((option) => (
                      <div className="ctl-revealed-collocation" key={option.word}>
                        <strong>{option.collocation}</strong>
                        <p>{option.definition}</p>
                        {option.example && <blockquote>“{option.example}”</blockquote>}
                      </div>
                    ))}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
