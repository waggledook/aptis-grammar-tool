import React, { useEffect, useMemo, useRef, useState } from "react";
import { onValue, ref } from "firebase/database";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "react-router-dom";

import { auth, rtdb } from "../../../firebase.js";
import {
  configureCollocationLiveTeams,
  finishCollocationTeamLiveGame,
  revealCollocationTeamRound,
  setCollocationLiveTeamsLocked,
  startCollocationTeamLiveGame,
  startCollocationTeamReview,
  startNextCollocationTeamRound,
  updateCollocationLiveTeam,
} from "../../../api/liveGames.js";
import { toast } from "../../../utils/toast.js";
import { getSitePath } from "../../../siteConfig.js";
import CollocationFeedback from "./CollocationFeedback.jsx";
import {
  buildBalancedCollocationTeams,
  buildCollocationReviewIndexes,
  collocationTeamTotalPoints,
  evaluateCollocationSelection,
  getCollocationTeamCaptain,
  getCollocationLiveRound,
} from "./collocationTeamLive.js";
import useCollocationRoundTimer from "./useCollocationRoundTimer.js";
import "./CollocationTeamLive.css";

function playerName(playersById, uid) {
  return playersById[uid]?.name || "Player";
}

export default function CollocationTeamLiveHost() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamCount, setTeamCount] = useState(2);
  const [busy, setBusy] = useState(false);
  const [copyState, setCopyState] = useState("");
  const [feedbackTeamId, setFeedbackTeamId] = useState("");
  const autoRevealKeyRef = useRef("");

  useEffect(() => {
    const unsubscribe = onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
      setGame(snapshot.exists() ? snapshot.val() : null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [gameId]);

  useEffect(() => {
    if (game?.state?.teamCount) setTeamCount(game.state.teamCount);
  }, [game?.state?.teamCount]);

  const players = useMemo(() => Object.entries(game?.players || {})
    .map(([uid, player]) => ({ uid, ...player }))
    .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0)), [game?.players]);
  const playersById = useMemo(
    () => Object.fromEntries(players.map((player) => [player.uid, player])),
    [players]
  );
  const teams = game?.teams || {};
  const teamEntries = Object.entries(teams);
  const items = game?.items || [];
  const {
    phase, isReview, isQuestion, isReveal,
    index: roundIndex, itemIndex: currentItemIndex, item: currentItem,
  } = getCollocationLiveRound(game);
  const teamsLocked = !!game?.state?.teamsLocked;
  const reviewIndexes = game?.state?.reviewItemIndexes || [];
  const answersRoot = isReview ? game?.reviewAnswers : game?.teamAnswers;
  const isHost = auth.currentUser?.uid === game?.ownerUid;
  const unassignedPlayers = players.filter((player) => !player.teamId || !teams[player.teamId]);
  const activeTeams = teamEntries.filter(([, team]) => (team.memberUids || []).length > 0);
  const answeredTeams = activeTeams.filter(([teamId]) => answersRoot?.[teamId]?.[currentItemIndex]);
  const allTeamsAnswered = activeTeams.length > 0 && answeredTeams.length === activeTeams.length;
  const deadline = game?.state?.questionDeadline;
  const remainingSeconds = useCollocationRoundTimer(deadline, isQuestion);

  useEffect(() => {
    if (!isHost || !isQuestion || (!allTeamsAnswered && remainingSeconds !== 0)) return;
    const key = `${gameId}:${phase}:${currentItemIndex}:${deadline}`;
    if (autoRevealKeyRef.current === key) return;
    autoRevealKeyRef.current = key;
    revealCollocationTeamRound(gameId, isReview, deadline, roundIndex).catch((error) => {
      autoRevealKeyRef.current = "";
      console.error("[CollocationTeamLiveHost] automatic reveal failed", error);
      toast("Could not reveal this set automatically.");
    });
  }, [allTeamsAnswered, currentItemIndex, deadline, gameId, isHost, isQuestion, isReview, phase, remainingSeconds, roundIndex]);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const joinPath = getSitePath(`/live/join?pin=${encodeURIComponent(game?.pin || "")}`);
  const joinUrl = `${baseUrl}${joinPath}`;

  async function runAction(action, failureMessage) {
    if (busy) return;
    setBusy(true);
    try {
      await action();
    } catch (error) {
      console.error("[CollocationTeamLiveHost] action failed", error);
      toast(error.message || failureMessage);
    } finally {
      setBusy(false);
    }
  }

  function assignmentsFromTeams(nextTeams) {
    const assignments = Object.fromEntries(players.map((player) => [player.uid, null]));
    Object.entries(nextTeams).forEach(([teamId, team]) => {
      (team.memberUids || []).forEach((uid) => {
        assignments[uid] = teamId;
      });
    });
    return assignments;
  }

  function handleRandomise() {
    if (!players.length) {
      toast("Wait for students to join before creating teams.");
      return;
    }
    const next = buildBalancedCollocationTeams(players, teamCount);
    runAction(
      () => configureCollocationLiveTeams({
        gameId,
        ...next,
        teamCount: Object.keys(next.teams).length,
        teamsLocked: false,
      }),
      "Could not create the teams."
    );
  }

  function handleMovePlayer(uid, destinationTeamId) {
    const nextTeams = Object.fromEntries(teamEntries.map(([teamId, team]) => [teamId, {
      ...team,
      memberUids: (team.memberUids || []).filter((memberUid) => memberUid !== uid),
    }]));
    if (destinationTeamId && nextTeams[destinationTeamId]) {
      nextTeams[destinationTeamId].memberUids = [...(nextTeams[destinationTeamId].memberUids || []), uid];
    }
    runAction(
      () => configureCollocationLiveTeams({
        gameId,
        teams: nextTeams,
        assignments: assignmentsFromTeams(nextTeams),
        teamCount: teamEntries.length,
        teamsLocked: false,
      }),
      "Could not move that student."
    );
  }

  function handleTeamChange(teamId, changes) {
    const nextTeam = { ...teams[teamId], ...changes };
    if (changes.captainOverrideUid === "") delete nextTeam.captainOverrideUid;
    runAction(
      () => updateCollocationLiveTeam({ gameId, teamId, team: nextTeam }),
      "Could not update that team."
    );
  }

  function handleLock() {
    if (!teamEntries.length || unassignedPlayers.length) {
      toast("Assign every student to a team first.");
      return;
    }
    if (teamEntries.some(([, team]) => !(team.memberUids || []).length)) {
      toast("Each team needs at least one student.");
      return;
    }
    runAction(() => setCollocationLiveTeamsLocked(gameId, true), "Could not lock the teams.");
  }

  function handleStart() {
    if (!teamsLocked) {
      toast("Lock the teams before starting.");
      return;
    }
    runAction(() => startCollocationTeamLiveGame(gameId), "Could not start the game.");
  }

  function handleStartReview() {
    const indexes = buildCollocationReviewIndexes(
      items,
      game?.teamAnswers,
      undefined,
      activeTeams.map(([teamId]) => teamId)
    );
    if (!indexes.length) {
      toast("Every team was perfect, so there is nothing to retest.");
      runAction(() => finishCollocationTeamLiveGame(gameId), "Could not finish the game.");
      return;
    }
    runAction(() => startCollocationTeamReview(gameId, indexes), "Could not start the review.");
  }

  function handleNextRound() {
    if (isReview) {
      if (roundIndex >= reviewIndexes.length - 1) {
        runAction(() => finishCollocationTeamLiveGame(gameId), "Could not finish the game.");
      } else {
        runAction(
          () => startNextCollocationTeamRound({ gameId, index: roundIndex + 1, review: true }),
          "Could not start the next review set."
        );
      }
      return;
    }
    if (roundIndex >= items.length - 1) {
      handleStartReview();
    } else {
      runAction(
        () => startNextCollocationTeamRound({ gameId, index: roundIndex + 1 }),
        "Could not start the next set."
      );
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopyState("Copied");
      window.setTimeout(() => setCopyState(""), 1600);
    } catch {
      setCopyState("Copy failed");
    }
  }

  if (loading) return <div className="ctl-page"><p>Opening the team room…</p></div>;
  if (!game) return <div className="ctl-page"><h1>Collocation Team Challenge</h1><p>Game not found.</p></div>;
  if (!isHost) return <div className="ctl-page"><h1>Collocation Team Challenge</h1><p>You are not the host of this game.</p></div>;

  const phaseLabel = phase === "question"
    ? `Set ${roundIndex + 1} of ${items.length}`
    : phase === "reveal"
      ? `Set ${roundIndex + 1} feedback`
      : phase === "review-question"
        ? `Review ${roundIndex + 1} of ${reviewIndexes.length}`
        : phase === "review-reveal"
          ? `Review ${roundIndex + 1} feedback`
          : phase;

  return (
    <main className="ctl-page ctl-host">
      <header className="ctl-hero">
        <div>
          <p className="ctl-kicker">Live team game</p>
          <h1>{game.title}</h1>
          <p>{items.length} collocation sets · 45 seconds per set · captains rotate every 3 sets</p>
        </div>
        <span className={`ctl-phase ctl-phase-${phase}`}>{phaseLabel}</span>
      </header>

      {(phase === "play" || phase === "review") && (
        <section className="ctl-panel">
          <h2>Start a new room for timed sets</h2>
          <p>This room was started with the previous game format. New rooms use the 45-second rounds and immediate feedback.</p>
          <a className="ctl-button" href={getSitePath("/vocabulary/collocations/trainer")}>Open Collocation Trainer</a>
        </section>
      )}

      {phase === "lobby" && (
        <>
          <section className="ctl-panel ctl-join-panel">
            <div>
              <span className="ctl-label">Game PIN</span>
              <strong className="ctl-pin">{game.pin}</strong>
              <button className="ctl-button ctl-button-secondary" type="button" onClick={handleCopy}>Copy join link</button>
              {copyState && <span className="ctl-small">{copyState}</span>}
            </div>
            <QRCodeSVG value={joinUrl} size={112} bgColor="#ffffff" fgColor="#10213c" />
          </section>

          <section className="ctl-panel">
            <div className="ctl-panel-heading">
              <div><span className="ctl-label">Lobby</span><h2>{players.length} student{players.length === 1 ? "" : "s"} joined</h2></div>
              {!teamsLocked && (
                <div className="ctl-team-controls">
                  <label>
                    Teams
                    <input type="number" min="1" max={Math.max(1, players.length)} value={teamCount} onChange={(event) => setTeamCount(Math.max(1, Number(event.target.value) || 1))} />
                  </label>
                  <button className="ctl-button" type="button" onClick={handleRandomise} disabled={busy || !players.length}>
                    {teamEntries.length ? "Randomise again" : "Create teams"}
                  </button>
                </div>
              )}
            </div>

            {!!unassignedPlayers.length && (
              <div className="ctl-waiting">
                <strong>Waiting for a team</strong>
                <div className="ctl-player-list">
                  {unassignedPlayers.map((player) => <span key={player.uid} className="ctl-player-chip">{player.name}</span>)}
                </div>
              </div>
            )}

            {!!teamEntries.length && (
              <div className="ctl-team-grid">
                {teamEntries.map(([teamId, team]) => (
                  <article className="ctl-team-card" key={teamId}>
                    <input
                      className="ctl-team-name"
                      defaultValue={team.name || teamId}
                      disabled={teamsLocked}
                      onBlur={(event) => {
                        const name = event.target.value.trim();
                        if (name && name !== team.name) handleTeamChange(teamId, { name });
                      }}
                    />
                    <div className="ctl-team-members">
                      {(team.memberUids || []).map((uid) => (
                        <div className="ctl-member-row" key={uid}>
                          <span>{playerName(playersById, uid)}</span>
                          {!teamsLocked && (
                            <select value={teamId} onChange={(event) => handleMovePlayer(uid, event.target.value)}>
                              {teamEntries.map(([optionId, optionTeam]) => <option key={optionId} value={optionId}>{optionTeam.name || optionId}</option>)}
                              <option value="">Unassigned</option>
                            </select>
                          )}
                        </div>
                      ))}
                      {!(team.memberUids || []).length && <p className="ctl-muted">No students yet</p>}
                    </div>
                    {!!(team.memberUids || []).length && (
                      <label className="ctl-captain-select">
                        Captain
                        <select value={team.captainOverrideUid || ""} disabled={teamsLocked} onChange={(event) => handleTeamChange(teamId, { captainOverrideUid: event.target.value })}>
                          <option value="">Rotate automatically</option>
                          {(team.memberUids || []).map((uid) => <option key={uid} value={uid}>{playerName(playersById, uid)}</option>)}
                        </select>
                      </label>
                    )}
                  </article>
                ))}
              </div>
            )}

            <div className="ctl-actions">
              {!!teamEntries.length && !teamsLocked && <button className="ctl-button" type="button" onClick={handleLock} disabled={busy}>Lock teams</button>}
              {teamsLocked && (
                <>
                  <button className="ctl-button ctl-button-secondary" type="button" onClick={() => runAction(() => setCollocationLiveTeamsLocked(gameId, false), "Could not unlock the teams.")} disabled={busy}>Unlock teams</button>
                  <button className="ctl-button ctl-button-primary" type="button" onClick={handleStart} disabled={busy}>Start first set</button>
                </>
              )}
            </div>
          </section>
        </>
      )}

      {(isQuestion || isReveal) && currentItem && (
        <>
          <section className="ctl-round-status">
            <div>
              <span className="ctl-label">{isReview ? "Most-missed review" : "Team round"}</span>
              <strong>{answeredTeams.length} / {activeTeams.length} teams answered</strong>
            </div>
            {isQuestion ? (
              <div className={`ctl-timer ${remainingSeconds != null && remainingSeconds <= 10 ? "is-low" : ""}`}>
                <span>Time left</span><strong>{remainingSeconds ?? 45}</strong>
              </div>
            ) : (
              <button className="ctl-button ctl-button-primary" type="button" onClick={handleNextRound} disabled={busy}>
                {isReview && roundIndex >= reviewIndexes.length - 1
                  ? "Finish game"
                  : !isReview && roundIndex >= items.length - 1
                    ? "Start most-missed review"
                    : "Start next set"}
              </button>
            )}
          </section>

          <section className="ctl-question-card">
            <div className="ctl-question-meta">
              <span>{currentItem.level?.toUpperCase()}</span><span>{currentItem.topic}</span><span>{currentItem.pattern}</span>
            </div>
            <p className="ctl-question-copy">{currentItem.question}</p>
            <h2>{currentItem.prompt}</h2>
            <div className="ctl-option-grid ctl-option-grid-display">
              {(currentItem.options || []).map((option) => {
                const selections = feedbackTeamId ? answersRoot?.[feedbackTeamId]?.[currentItemIndex]?.selectedWords || [] : [];
                const status = !isReveal ? "" : option.isCorrect
                  ? !feedbackTeamId || selections.includes(option.word) ? "correct" : "missed"
                  : selections.includes(option.word) ? "wrong" : "quiet";
                return <div key={option.word} className={status}>{option.word}</div>;
              })}
            </div>
            {isReveal && (
              <>
                <label className="ctl-feedback-team">
                  Show feedback for
                  <select value={feedbackTeamId} onChange={(event) => setFeedbackTeamId(event.target.value)}>
                    <option value="">Class answer key</option>
                    {activeTeams.map(([teamId, team]) => <option key={teamId} value={teamId}>{team.name}</option>)}
                  </select>
                </label>
                <CollocationFeedback
                  item={currentItem}
                  answerKey={!feedbackTeamId}
                  result={evaluateCollocationSelection(currentItem, answersRoot?.[feedbackTeamId]?.[currentItemIndex]?.selectedWords || [])}
                />
              </>
            )}
          </section>

          <section className="ctl-panel">
            <div className="ctl-panel-heading"><div><span className="ctl-label">Scoreboard</span><h2>{isReveal ? "Round points" : "Live progress"}</h2></div></div>
            <div className="ctl-progress-grid">
              {[...activeTeams]
                .sort(([teamA], [teamB]) => collocationTeamTotalPoints(game, teamB) - collocationTeamTotalPoints(game, teamA))
                .map(([teamId, team]) => {
                  const answer = answersRoot?.[teamId]?.[currentItemIndex];
                  const result = evaluateCollocationSelection(currentItem, answer?.selectedWords || []);
                  const captainUid = getCollocationTeamCaptain(team, isReview ? items.length + roundIndex : roundIndex);
                  return (
                    <article className="ctl-progress-card ctl-score-card" key={teamId}>
                      <strong>{team.name}</strong>
                      <span>{collocationTeamTotalPoints(game, teamId)} pts</span>
                      <div className="ctl-progress-track"><i style={{ width: `${isReveal ? result.percentage : answer ? 100 : 0}%` }} /></div>
                      <small>
                        {isReveal
                          ? `${result.score}/${result.possibleScore} correct · ${result.percentage}% · +${result.points} pts${answer ? "" : " (no answer)"}`
                          : answer
                            ? "Answer locked"
                            : `Captain: ${playerName(playersById, captainUid)}`}
                      </small>
                    </article>
                  );
                })}
            </div>
            {isQuestion && (
              <div className="ctl-actions">
                <button className="ctl-button ctl-button-secondary" type="button" onClick={() => runAction(() => revealCollocationTeamRound(gameId, isReview, deadline, roundIndex), "Could not reveal this set.")} disabled={busy}>Reveal now</button>
              </div>
            )}
          </section>
        </>
      )}

      {phase === "finished" && (
        <section className="ctl-panel">
          <span className="ctl-label">Complete</span>
          <h2>Final team scores</h2>
          <div className="ctl-results-grid">
            {[...activeTeams]
              .sort(([teamA], [teamB]) => collocationTeamTotalPoints(game, teamB) - collocationTeamTotalPoints(game, teamA))
              .map(([teamId, team], index) => (
                <article className="ctl-result-card" key={teamId}>
                  <span>#{index + 1}</span>
                  <h3>{team.name}</h3>
                  <strong>{collocationTeamTotalPoints(game, teamId)}</strong>
                  <span>points</span>
                </article>
              ))}
          </div>
        </section>
      )}
    </main>
  );
}
