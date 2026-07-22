import React, { useEffect, useMemo, useState } from "react";
import { Check, Clock3, Clipboard, Gavel, Play, Plus, Shuffle, Users } from "lucide-react";
import { useParams } from "react-router-dom";
import { onValue, ref } from "firebase/database";
import { QRCodeSVG } from "qrcode.react";
import Seo from "../../components/common/Seo.jsx";
import { rtdb } from "../../firebase.js";
import { assignOptionJuryPlayer, autoBalanceOptionJuryPlayers, setLiveGameState, setLiveGameStatus } from "../../api/liveGames.js";
import { getSitePath } from "../../siteConfig.js";
import { toast } from "../../utils/toast.js";
import {
  OPTION_JURY_GAME_TYPE,
  OPTION_JURY_TIMINGS,
  OPTION_LETTERS,
  VERDICT_OPTIONS,
  getAssignedOptionForQuestion,
  getOptionLetter,
  optionJuryTasks,
} from "./data/oteAdvancedReadingPart4OptionJury.js";
import {
  AssignmentSummary,
  ComparisonOptions,
  CorrectAnswer,
  EvidencePanel,
  PassagePanel,
  PhasePill,
  TimerDisplay,
  VoteDistribution,
} from "./OteOptionJuryShared.jsx";

function useRemainingSeconds(deadline) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!deadline) { setRemaining(0); return undefined; }
    const update = () => setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [deadline]);
  return remaining;
}

export default function OteOptionJuryHost({ user }) {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copyState, setCopyState] = useState("");

  useEffect(() => {
    const unsubscribe = onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
      setGame(snapshot.exists() ? snapshot.val() : null);
      setLoading(false);
    });
    return unsubscribe;
  }, [gameId]);

  const task = optionJuryTasks[game?.taskId];
  const players = useMemo(() => Object.entries(game?.players || {}).map(([id, player]) => ({ id, ...player })).sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0)), [game?.players]);
  const phase = game?.state?.phase || "lobby";
  const questionIndex = game?.state?.questionIndex || 0;
  const question = task?.questions?.[questionIndex];
  const isHost = !!user && game?.ownerUid === user.uid;
  const deadline = game?.state?.phaseDeadline || null;
  const remainingSeconds = useRemainingSeconds(deadline);
  const submittedCount = question ? players.filter((player) => game?.investigations?.[player.id]?.[question.id]?.submitted).length : 0;
  const votes = question ? game?.finalVotes?.[question.id] || {} : {};
  const voteCount = Object.keys(votes).length;
  const joinPath = getSitePath("/live/join");
  const joinUrl = typeof window === "undefined" ? "" : `${window.location.origin}${joinPath}${joinPath.includes("?") ? "&" : "?"}pin=${encodeURIComponent(game?.pin || "")}`;

  async function updatePhase(nextPhase, nextQuestionIndex = questionIndex, timerSeconds = null) {
    try {
      const now = Date.now();
      await setLiveGameState(gameId, {
        phase: nextPhase,
        questionIndex: nextQuestionIndex,
        phaseStartedAt: timerSeconds ? now : null,
        phaseDeadline: timerSeconds ? now + timerSeconds * 1000 : null,
        phaseDuration: timerSeconds,
      });
    } catch (error) {
      console.error("[OptionJuryHost] phase update failed", error);
      toast("Could not move to the next phase.");
    }
  }

  async function extendTimer() {
    const newDeadline = Math.max(Date.now(), deadline || Date.now()) + 30_000;
    try { await setLiveGameState(gameId, { phaseDeadline: newDeadline }); }
    catch (error) { console.error(error); toast("Could not add more time."); }
  }

  async function handleAssign(playerId, letter) {
    try { await assignOptionJuryPlayer({ gameId, playerId, optionAssignment: letter }); }
    catch (error) { console.error(error); toast("Could not update that team."); }
  }

  async function handleAutoBalance() {
    try { await autoBalanceOptionJuryPlayers({ gameId, playerIds: players.map((player) => player.id) }); }
    catch (error) { console.error(error); toast("Could not balance the teams."); }
  }

  async function handleStart() {
    if (!players.length) return toast("Wait for at least one student to join.");
    if (players.some((player) => !OPTION_LETTERS.includes(player.optionAssignment))) return toast("Assign every student to Team A, B or C before starting.");
    await setLiveGameStatus(gameId, "in-progress");
    await updatePhase("skim", 0, OPTION_JURY_TIMINGS.skim);
  }

  async function openComparison() {
    if (submittedCount < players.length && !window.confirm(`${players.length - submittedCount} student(s) have not submitted this question. Open the comparison anyway?`)) return;
    await updatePhase("comparison");
  }

  async function revealAnswer() {
    if (voteCount < players.length && !window.confirm(`${players.length - voteCount} student(s) have not voted. Reveal the answer anyway?`)) return;
    await updatePhase("answer_reveal");
  }

  async function nextQuestion() {
    if (questionIndex < task.questions.length - 1) return updatePhase("investigation", questionIndex + 1, OPTION_JURY_TIMINGS.investigation);
    await setLiveGameStatus(gameId, "finished");
    await updatePhase("finished", questionIndex);
  }

  async function copyJoinLink() {
    try { await navigator.clipboard.writeText(joinUrl); setCopyState("Copied"); window.setTimeout(() => setCopyState(""), 1600); }
    catch { setCopyState("Copy failed"); }
  }

  if (loading) return <main className="option-jury-page"><p>Loading Option Jury…</p></main>;
  if (!game || game.type !== OPTION_JURY_GAME_TYPE || !task) return <main className="option-jury-page"><h1>Option Jury</h1><p>Session not found.</p></main>;
  if (!isHost) return <main className="option-jury-page"><h1>Option Jury</h1><p>You are not the host of this session.</p></main>;

  return (
    <main className="option-jury-page option-jury-host">
      <Seo title={`Host Option Jury: ${task.title}`} description="Option Jury teacher display." />
      <header className="option-jury-host-header"><div><p>OTE Advanced Reading · Option Jury</p><h1>{task.title}</h1></div><PhasePill phase={phase} questionIndex={questionIndex} totalQuestions={task.questions.length} /></header>

      {phase === "lobby" ? <section className="option-jury-lobby-layout">
        <div className="option-jury-pin-card"><p>Students join at</p><strong>{game.pin}</strong><QRCodeSVG value={joinUrl} size={184} includeMargin /><button type="button" onClick={copyJoinLink}><Clipboard size={17} />{copyState || "Copy join link"}</button></div>
        <div className="option-jury-lobby-players"><header><div><span>Lobby</span><h2>{players.length} {players.length === 1 ? "player" : "players"} joined</h2></div><button type="button" onClick={handleAutoBalance} disabled={!players.length}><Shuffle size={17} /> Auto-balance teams</button></header>
          <AssignmentSummary players={players} />
          {OPTION_LETTERS.filter((letter) => !players.some((player) => player.optionAssignment === letter)).map((letter) => <p className="option-jury-warning" key={letter}>No player is currently in Team {letter}. You can still begin.</p>)}
          <div className="option-jury-player-list">{players.map((player) => <div key={player.id}><span><Users size={17} />{player.name}</span><div role="group" aria-label={`Assign ${player.name} to a team`}>{OPTION_LETTERS.map((letter) => <button className={player.optionAssignment === letter ? "is-active" : ""} type="button" key={letter} onClick={() => handleAssign(player.id, letter)}>{letter}</button>)}</div></div>)}{!players.length ? <p className="muted">Waiting for students to join…</p> : null}</div>
          <p className="option-jury-rotation-note">Teams stay fixed, but the option each team investigates rotates after every question.</p>
          <button className="option-jury-primary" type="button" onClick={handleStart} disabled={!players.length || players.some((player) => !player.optionAssignment)}><Play size={19} /> Begin four-minute skim</button>
        </div>
      </section> : null}

      {phase === "skim" ? <section className="option-jury-host-stage"><div className="option-jury-stage-toolbar"><TimerDisplay remainingSeconds={remainingSeconds} label="Skim reading" /><button type="button" onClick={extendTimer}><Plus size={17} /> Add 30 seconds</button></div><div className="option-jury-stage-callout"><Clock3 size={30} /><div><span>Skim first</span><h2>Students are mapping the complete passage</h2><p>No questions or answer options are visible yet.</p></div></div><PassagePanel task={task} /><button className="option-jury-primary" type="button" onClick={() => updatePhase("investigation", 0, OPTION_JURY_TIMINGS.investigation)}><Play size={18} /> Open Question 1</button></section> : null}

      {phase === "investigation" && question ? <section className="option-jury-host-stage"><div className="option-jury-stage-toolbar"><TimerDisplay remainingSeconds={remainingSeconds} label={`Question ${questionIndex + 1} investigation`} /><button type="button" onClick={extendTimer}><Plus size={17} /> Add 30 seconds</button></div><div className="option-jury-question-heading"><span>Question {questionIndex + 1}</span><h2>{question.prompt}</h2><p>{submittedCount} of {players.length} students have submitted their current option judgement.</p></div><EvidencePanel task={task} question={question} /><div className="option-jury-submission-list">{players.map((player) => { const submitted = game?.investigations?.[player.id]?.[question.id]?.submitted; const assignedOption = getAssignedOptionForQuestion(player.optionAssignment, questionIndex); return <span className={submitted ? "is-done" : ""} key={player.id}>{submitted ? <Check size={17} /> : <i />}{player.name}<b>Team {player.optionAssignment} → Option {assignedOption}</b></span>; })}</div><button className="option-jury-primary" type="button" onClick={openComparison}>Begin comparison</button></section> : null}

      {phase === "comparison" && question ? <section className="option-jury-host-stage"><div className="option-jury-question-heading"><span>Question {questionIndex + 1}</span><h2>{question.prompt}</h2><p>Compare the class’s judgements. The correct answer is still hidden.</p></div><EvidencePanel task={task} question={question} /><ComparisonOptions game={game} question={question} questionIndex={questionIndex} players={players} /><button className="option-jury-primary" type="button" onClick={() => updatePhase("final_vote", questionIndex, OPTION_JURY_TIMINGS.finalVote)}>Open 30-second final vote</button></section> : null}

      {phase === "final_vote" && question ? <section className="option-jury-host-stage"><div className="option-jury-stage-toolbar"><TimerDisplay remainingSeconds={remainingSeconds} label={`Question ${questionIndex + 1} final vote`} /><button type="button" onClick={extendTimer}><Plus size={17} /> Add 30 seconds</button></div><div className="option-jury-stage-callout"><Gavel size={30} /><div><span>Final vote · Question {questionIndex + 1}</span><h2>{voteCount} of {players.length} votes received</h2><p>{question.prompt}</p></div></div><VoteDistribution votes={votes} /><div className="option-jury-submission-list">{players.map((player) => <span className={votes[player.id] ? "is-done" : ""} key={player.id}>{votes[player.id] ? <Check size={17} /> : <i />}{player.name}</span>)}</div><button className="option-jury-primary" type="button" onClick={revealAnswer}>Reveal answer</button></section> : null}

      {phase === "answer_reveal" && question ? <section className="option-jury-host-stage"><div className="option-jury-question-heading"><span>Answer · Question {questionIndex + 1}</span><h2>{getOptionLetter(question.answer)} is correct</h2><p>{question.explanation}</p></div><EvidencePanel task={task} question={question} /><VoteDistribution votes={votes} correctLetter={getOptionLetter(question.answer)} /><ComparisonOptions game={game} question={question} questionIndex={questionIndex} players={players} reveal /><button className="option-jury-primary" type="button" onClick={nextQuestion}>{questionIndex === task.questions.length - 1 ? "Finish session" : `Open Question ${questionIndex + 2}`}</button></section> : null}

      {phase === "finished" ? <HostReport game={game} task={task} players={players} /> : null}
    </main>
  );
}

function HostReport({ game, task, players }) {
  return <section className="option-jury-host-stage"><div className="option-jury-stage-callout"><Check size={30} /><div><span>Session complete</span><h2>Class report</h2><p>Initial option judgement and final-answer performance remain separate.</p></div></div><div className="option-jury-report-grid">{task.questions.map((question, index) => {
    const votes = Object.values(game?.finalVotes?.[question.id] || {});
    const correctLetter = getOptionLetter(question.answer);
    const correct = votes.filter((vote) => vote.option === correctLetter).length;
    const changed = votes.filter((vote) => vote.changedMind === true).length;
    const mindChangeResponses = votes.filter((vote) => typeof vote.changedMind === "boolean");
    return <article key={question.id}><span>Question {index + 1}</span><h3>{question.prompt}</h3><CorrectAnswer question={question} /><strong>{votes.length ? Math.round((correct / votes.length) * 100) : 0}% final answers correct</strong><p>{mindChangeResponses.length ? `${Math.round((changed / mindChangeResponses.length) * 100)}% of respondents` : "No responses"} said another student’s reasoning changed their mind</p><InitialDistribution game={game} question={question} players={players} /></article>;
  })}</div></section>;
}

function InitialDistribution({ game, question, players }) {
  return <div className="option-jury-mini-distribution">{OPTION_LETTERS.map((letter) => {
    const entries = players.map((player) => game?.investigations?.[player.id]?.[question.id]).filter((entry) => entry?.submitted && entry.assignedOption === letter);
    return <div key={letter}><b>{letter}</b>{VERDICT_OPTIONS.map((verdict) => <span key={verdict.id}>{verdict.label}: {entries.filter((entry) => entry.verdict === verdict.id).length}</span>)}</div>;
  })}</div>;
}
