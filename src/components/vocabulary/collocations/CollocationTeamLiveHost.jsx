import React, { useMemo, useState, useEffect } from "react";
import { onValue, ref } from "firebase/database";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "react-router-dom";

import { auth, rtdb } from "../../../firebase.js";
import {
  configureCollocationLiveTeams,
  finishCollocationTeamLiveGame,
  setCollocationLiveTeamsLocked,
  startCollocationTeamLiveGame,
  startCollocationTeamReview,
  updateCollocationLiveTeam,
} from "../../../api/liveGames.js";
import { toast } from "../../../utils/toast.js";
import { getSitePath } from "../../../siteConfig.js";
import {
  buildBalancedCollocationTeams,
  buildCollocationReviewIndexes,
  getCollocationTeamCaptain,
} from "./collocationTeamLive.js";
import "./CollocationTeamLive.css";

function playerName(playersById, uid) {
  return playersById[uid]?.name || "Player";
}

function answerCount(answerMap) {
  return Object.keys(answerMap || {}).length;
}

export default function CollocationTeamLiveHost() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamCount, setTeamCount] = useState(2);
  const [busy, setBusy] = useState(false);
  const [copyState, setCopyState] = useState("");

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
  const phase = game?.state?.phase || "lobby";
  const teamsLocked = !!game?.state?.teamsLocked;
  const reviewIndexes = game?.state?.reviewItemIndexes || [];
  const isHost = auth.currentUser?.uid === game?.ownerUid;
  const unassignedPlayers = players.filter((player) => !player.teamId || !teams[player.teamId]);
  const activeTeams = teamEntries.filter(([, team]) => (team.memberUids || []).length > 0);
  const allMainComplete = activeTeams.length > 0 && activeTeams.every(([teamId]) => (
    answerCount(game?.teamAnswers?.[teamId]) >= items.length
  ));
  const allReviewComplete = activeTeams.length > 0 && reviewIndexes.length > 0 && activeTeams.every(([teamId]) => (
    reviewIndexes.every((itemIndex) => game?.reviewAnswers?.[teamId]?.[itemIndex])
  ));

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
      nextTeams[destinationTeamId].memberUids = [
        ...(nextTeams[destinationTeamId].memberUids || []),
        uid,
      ];
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
    const indexes = buildCollocationReviewIndexes(items, game?.teamAnswers);
    if (!indexes.length) {
      toast("Every submitted set was perfect, so there is nothing to retest.");
      runAction(() => finishCollocationTeamLiveGame(gameId), "Could not finish the game.");
      return;
    }
    runAction(
      () => startCollocationTeamReview(gameId, indexes),
      "Could not start the review."
    );
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

  return (
    <main className="ctl-page ctl-host">
      <header className="ctl-hero">
        <div>
          <p className="ctl-kicker">Live team game</p>
          <h1>{game.title}</h1>
          <p>{items.length} collocation sets · captains rotate every 3 sets</p>
        </div>
        <span className={`ctl-phase ctl-phase-${phase}`}>{phase === "play" ? "Team round" : phase}</span>
      </header>

      {phase === "lobby" && (
        <>
          <section className="ctl-panel ctl-join-panel">
            <div>
              <span className="ctl-label">Game PIN</span>
              <strong className="ctl-pin">{game.pin}</strong>
              <button className="ctl-button ctl-button-secondary" type="button" onClick={handleCopy}>
                Copy join link
              </button>
              {copyState && <span className="ctl-small">{copyState}</span>}
            </div>
            <QRCodeSVG value={joinUrl} size={112} bgColor="#ffffff" fgColor="#10213c" />
          </section>

          <section className="ctl-panel">
            <div className="ctl-panel-heading">
              <div>
                <span className="ctl-label">Lobby</span>
                <h2>{players.length} student{players.length === 1 ? "" : "s"} joined</h2>
              </div>
              {!teamsLocked && (
                <div className="ctl-team-controls">
                  <label>
                    Teams
                    <input
                      type="number"
                      min="1"
                      max={Math.max(1, players.length)}
                      value={teamCount}
                      onChange={(event) => setTeamCount(Math.max(1, Number(event.target.value) || 1))}
                    />
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
                  {unassignedPlayers.map((player) => (
                    <span key={player.uid} className="ctl-player-chip">{player.name}</span>
                  ))}
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
                              {teamEntries.map(([optionId, optionTeam]) => (
                                <option key={optionId} value={optionId}>{optionTeam.name || optionId}</option>
                              ))}
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
                        <select
                          value={team.captainOverrideUid || ""}
                          disabled={teamsLocked}
                          onChange={(event) => handleTeamChange(teamId, { captainOverrideUid: event.target.value })}
                        >
                          <option value="">Rotate automatically</option>
                          {(team.memberUids || []).map((uid) => (
                            <option key={uid} value={uid}>{playerName(playersById, uid)}</option>
                          ))}
                        </select>
                      </label>
                    )}
                  </article>
                ))}
              </div>
            )}

            <div className="ctl-actions">
              {!!teamEntries.length && !teamsLocked && (
                <button className="ctl-button" type="button" onClick={handleLock} disabled={busy}>Lock teams</button>
              )}
              {teamsLocked && (
                <>
                  <button
                    className="ctl-button ctl-button-secondary"
                    type="button"
                    onClick={() => runAction(
                      () => setCollocationLiveTeamsLocked(gameId, false),
                      "Could not unlock the teams."
                    )}
                    disabled={busy}
                  >
                    Unlock teams
                  </button>
                  <button className="ctl-button ctl-button-primary" type="button" onClick={handleStart} disabled={busy}>
                    Start team round
                  </button>
                </>
              )}
            </div>
          </section>
        </>
      )}

      {phase === "play" && (
        <section className="ctl-panel">
          <div className="ctl-panel-heading">
            <div><span className="ctl-label">Team round</span><h2>Teams work through all {items.length} sets</h2></div>
            <button className="ctl-button ctl-button-primary" type="button" onClick={handleStartReview} disabled={busy || !allMainComplete}>
              Start most-missed review
            </button>
          </div>
          {!allMainComplete && <p className="ctl-muted">The review becomes available when every team finishes.</p>}
          <div className="ctl-progress-grid">
            {activeTeams.map(([teamId, team]) => {
              const completed = answerCount(game?.teamAnswers?.[teamId]);
              const captainUid = getCollocationTeamCaptain(team, Math.min(completed, items.length - 1));
              return (
                <article className="ctl-progress-card" key={teamId}>
                  <strong>{team.name}</strong>
                  <span>{completed} / {items.length}</span>
                  <div className="ctl-progress-track"><i style={{ width: `${(completed / items.length) * 100}%` }} /></div>
                  <small>{completed >= items.length ? "Finished" : `Captain: ${playerName(playersById, captainUid)}`}</small>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {phase === "review" && (
        <section className="ctl-panel">
          <div className="ctl-panel-heading">
            <div><span className="ctl-label">Most-missed review</span><h2>{reviewIndexes.length} sets selected automatically</h2></div>
            <button className="ctl-button ctl-button-primary" type="button" onClick={() => runAction(() => finishCollocationTeamLiveGame(gameId), "Could not finish the game.")} disabled={busy || !allReviewComplete}>
              Finish and reveal
            </button>
          </div>
          <div className="ctl-progress-grid">
            {activeTeams.map(([teamId, team]) => {
              const completed = reviewIndexes.filter((itemIndex) => game?.reviewAnswers?.[teamId]?.[itemIndex]).length;
              return (
                <article className="ctl-progress-card" key={teamId}>
                  <strong>{team.name}</strong>
                  <span>{completed} / {reviewIndexes.length}</span>
                  <div className="ctl-progress-track"><i style={{ width: `${(completed / reviewIndexes.length) * 100}%` }} /></div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {phase === "finished" && (
        <section className="ctl-panel">
          <span className="ctl-label">Complete</span>
          <h2>Team results</h2>
          <div className="ctl-results-grid">
            {activeTeams.map(([teamId, team]) => {
              const mainAnswers = Object.values(game?.teamAnswers?.[teamId] || {});
              const reviewAnswers = Object.values(game?.reviewAnswers?.[teamId] || {});
              return (
                <article className="ctl-result-card" key={teamId}>
                  <h3>{team.name}</h3>
                  <strong>{mainAnswers.filter((answer) => answer.isPerfect).length}/{items.length}</strong>
                  <span>perfect first time</span>
                  {!!reviewIndexes.length && <p>{reviewAnswers.filter((answer) => answer.isPerfect).length}/{reviewIndexes.length} perfect in review</p>}
                </article>
              );
            })}
          </div>
          {!!reviewIndexes.length && (
            <div className="ctl-answer-review">
              <h3>Reviewed collocations</h3>
              {reviewIndexes.map((itemIndex) => (
                <div key={itemIndex}>
                  <strong>{items[itemIndex]?.prompt}</strong>
                  <span>{items[itemIndex]?.options?.filter((option) => option.isCorrect).map((option) => option.collocation).join(" · ")}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
