import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Clipboard, Play, Square } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { auth, logOteTrainingCompleted, logOteTrainingStarted, rtdb } from "../../firebase.js";
import { advanceListeningStrategyLive, setListeningStrategyAudio, submitListeningStrategyResponse } from "../../api/oteListeningStrategyLive.js";
import { getSitePath } from "../../siteConfig.js";
import { LISTENING_STRATEGY_GAME_TYPE, LISTENING_STRATEGY_PATH, LISTENING_STRATEGY_TITLE, selectListeningStrategyExtracts } from "./data/oteListeningPart2Strategy.js";
import { currentListeningStrategyExtract, STRATEGY_PHASE_LABELS, STRATEGY_RESPONSE_STAGES, strategyStageScore } from "./utils/listeningPart2Strategy.js";
import { StrategyAnonymousResponses, StrategyFeedback, StrategyNextStep, StrategyNotes, StrategyReflection, StrategyScores, StrategyScript } from "./OteListeningPart2StrategyShared.jsx";
import "./styles/listening-part2-strategy.css";

function useStrategyRoom(gameId) {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    setLoading(true);
    return onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
      setGame(snapshot.val()); setLoading(false); setError("");
    }, () => { setError("The lesson could not be loaded. Check your connection and sign-in, then reload."); setLoading(false); });
  }, [gameId]);
  const players = useMemo(() => Object.entries(game?.players || {}).map(([id, player]) => ({ id, ...player })).sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0)), [game?.players]);
  return { game, loading, error, players, extract: currentListeningStrategyExtract(game?.state), extracts: selectListeningStrategyExtracts(game?.state?.extractIds) };
}

function SessionHeader({ phase, extract, index, count }) {
  return <header className="strategy-session-header"><div><p className="strategy-eyebrow">OTE Advanced Listening Part 2 · Live strategy lesson</p><h1>{LISTENING_STRATEGY_TITLE}</h1>{extract && !["lobby", "finished"].includes(phase) ? <p>Selected extract {index + 1} of {count} · {extract.title}</p> : null}</div><span className="strategy-phase-badge" role="status">{STRATEGY_PHASE_LABELS[phase]}</span></header>;
}

export function OteListeningPart2StrategyLiveHost({ user }) {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { game, loading, error, players, extract, extracts } = useStrategyRoom(gameId);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [copied, setCopied] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const audioToken = useRef(0);
  const phase = game?.state?.phase || "lobby";
  const index = Number(game?.state?.extractIndex || 0);

  useEffect(() => {
    audioToken.current += 1;
    audioRef.current?.pause(); audioRef.current = null; setPlaying(false);
    return () => { audioToken.current += 1; audioRef.current?.pause(); };
  }, [phase, index, gameId]);

  async function advance(action = "next") {
    if (busy || playing) return;
    if (STRATEGY_RESPONSE_STAGES.includes(phase) && action === "next") {
      const missing = players.filter((player) => !player.strategyResponses?.[extract.id]?.[phase]).length;
      if (missing && !window.confirm(`${missing} student(s) have not submitted this stage. Move on anyway? Their missing submissions will remain separate from blank answers.`)) return;
    }
    if (action === "finish" && !window.confirm("Finish the lesson now? Submitted responses will be kept.")) return;
    setBusy(true); setActionError("");
    try { await advanceListeningStrategyLive({ gameId, expectedPhase: phase, expectedIndex: index, action }); }
    catch (failure) { setActionError(failure.message || "The lesson could not be updated. Try again."); }
    finally { setBusy(false); }
  }

  async function playAudio() {
    if (playing || !extract.audioReady) return;
    const token = ++audioToken.current;
    setActionError(""); setPlaying(true);
    try {
      await setListeningStrategyAudio({ gameId, expectedPhase: phase, expectedIndex: index, audioStage: "playing" });
      if (token !== audioToken.current) return;
      const audio = new Audio(extract.audioSrc);
      audioRef.current = audio;
      const done = (message = "") => {
        if (token !== audioToken.current) return;
        audioRef.current = null; setPlaying(false); if (message) setActionError(message);
        setListeningStrategyAudio({ gameId, expectedPhase: phase, expectedIndex: index, audioStage: "idle" }).catch(() => {});
      };
      audio.onended = () => done();
      audio.onerror = () => done("The recording could not be played. Try again or read the teacher script aloud.");
      await audio.play();
    } catch {
      if (token === audioToken.current) {
        setPlaying(false); setActionError("Playback failed. Try again or read the teacher script aloud.");
        setListeningStrategyAudio({ gameId, expectedPhase: phase, expectedIndex: index, audioStage: "idle" }).catch(() => {});
      }
    }
  }

  function stopAudio() {
    audioToken.current += 1; audioRef.current?.pause(); audioRef.current = null; setPlaying(false);
    setListeningStrategyAudio({ gameId, expectedPhase: phase, expectedIndex: index, audioStage: "idle" }).catch(() => {});
  }

  async function copyLink() {
    try { await navigator.clipboard.writeText(joinUrl); setCopied(true); }
    catch { setActionError("The link could not be copied. Students can use the PIN or QR code."); }
  }

  if (loading) return <main className="strategy-page"><p>Loading lesson…</p></main>;
  if (error) return <main className="strategy-page"><p role="alert">{error}</p></main>;
  if (game?.type !== LISTENING_STRATEGY_GAME_TYPE || !extract) return <main className="strategy-page"><h1>Lesson not found</h1></main>;
  if (!user || game.ownerUid !== user.uid) return <main className="strategy-page"><h1>This is the teacher's lesson control page</h1></main>;
  const joinUrl = new URL(getSitePath("/live/join"), window.location.origin);
  joinUrl.searchParams.set("pin", game.pin);
  const submitted = players.filter((player) => player.strategyResponses?.[extract.id]?.[phase]).length;
  const isResponseStage = STRATEGY_RESPONSE_STAGES.includes(phase);

  return <main className="strategy-page">
    <Seo title={`Host: ${LISTENING_STRATEGY_TITLE}`} description="Teacher-controlled listening strategy lesson." />
    <button className="strategy-back" type="button" onClick={() => navigate(getSitePath(`/ote${LISTENING_STRATEGY_PATH}`))}><ArrowLeft size={18} /> Teacher resource</button>
    <SessionHeader phase={phase} extract={extract} index={index} count={extracts.length} />
    {actionError ? <p className="strategy-error" role="alert">{actionError}</p> : null}
    {phase === "lobby" ? <section className="strategy-section strategy-lobby"><div className="strategy-pin"><span>Students join with PIN</span><strong>{String(game.pin).replace(/^(\d{3})(\d{3})$/, "$1 $2")}</strong><QRCodeSVG value={joinUrl.href} size={184} includeMargin /><button type="button" onClick={copyLink}><Clipboard size={17} /> {copied ? "Copied" : "Copy join link"}</button></div><div><h2>{players.length} {players.length === 1 ? "student" : "students"} joined</h2><div className="strategy-roster">{players.map((player) => <span key={player.id}>{player.name}</span>)}</div><p>{extracts.length} selected extracts · no automatic timers. Choose whether to use transcript support after each second listen.</p><p className="strategy-callout">{extracts.some((item) => !item.audioReady) ? "Some recordings are pending. You can read those scripts aloud naturally. " : "Recordings are ready for your selected extracts. "}Keep teacher scripts private while students listen.</p><button className="strategy-primary" type="button" disabled={!players.length || busy} onClick={() => advance()}><Play size={18} /> Begin lesson</button></div></section> : null}
    {!["lobby", "finished"].includes(phase) ? <section className="strategy-section">
      <StrategyNotes extract={extract} />
      {phase === "preview" ? <p className="strategy-discussion">{extract.guided ? extract.prompt : "Read both notes. Predict the information needed, then keep moving if an answer is uncertain."}</p> : null}
      {["first", "second"].includes(phase) ? <><p className="strategy-callout">{phase === "first" ? "Students attempt the gaps now and submit their first-listen answers." : "Students check specific uncertainty and submit a separate second-listen response."} {extract.audioReady ? "Play audio from this screen and share sound with the class." : "Read the extract aloud. Recorded audio is pending."}</p><div className="strategy-audio-controls"><button type="button" disabled={playing || !extract.audioReady} onClick={playAudio}><Play size={17} /> {extract.audioReady ? "Play recording" : "Recording pending"}</button><button type="button" disabled={!playing} onClick={stopAudio}><Square size={17} /> Stop</button></div><details key={`${extract.id}-${phase}`}><summary>Teacher script · open privately when reading aloud</summary><p>{extract.script}</p></details></> : null}
      {isResponseStage ? <><p role="status">{submitted} of {players.length} students submitted</p><div className="strategy-roster">{players.map((player) => <span key={player.id} className={player.strategyResponses?.[extract.id]?.[phase] ? "is-submitted" : ""}>{player.strategyResponses?.[extract.id]?.[phase] ? <Check size={15} /> : null}{player.name}</span>)}</div></> : null}
      {phase === "compare" ? <><p className="strategy-discussion">Compare briefly. Explain your evidence and decide what needs checking. The answer is still hidden.</p><StrategyAnonymousResponses extract={extract} players={players} stage="first" /></> : null}
      {phase === "script" ? <><p className="strategy-callout">The unmarked script is visible to students. Revisions here are recorded separately from listening.</p><StrategyScript extract={extract} /></> : null}
      {phase === "review" ? <><StrategyFeedback extract={extract} /><StrategyAnonymousResponses extract={extract} players={players} stage="second" /></> : null}
      <div className="strategy-actions"><button className="strategy-primary" type="button" disabled={busy || playing} onClick={() => advance()}>{({ preview: "Open first listening", first: "Compare before replay", compare: "Open second listening", second: "Reveal answer and evidence", script: "Reveal answer and evidence", review: index === extracts.length - 1 ? "Finish lesson" : "Next extract" })[phase]}</button>{phase === "second" ? <button type="button" disabled={busy || playing} onClick={() => {
        const missing = players.filter((player) => !player.strategyResponses?.[extract.id]?.second).length;
        if (!missing || window.confirm(`${missing} student(s) have not submitted the second listen. Open the script anyway?`)) advance("script");
      }}>Check unmarked script first</button> : null}{phase !== "review" ? <button type="button" disabled={busy || playing} onClick={() => advance("skip")}>Skip this extract</button> : null}<button type="button" disabled={busy || playing} onClick={() => advance("finish")}>Finish early</button></div>
    </section> : null}
    {phase === "finished" ? <section className="strategy-section"><h2>What changed with another listen?</h2><StrategyScores extracts={extracts} players={players} /><StrategyReflection /><StrategyNextStep partPath={getSitePath("/ote/listening/advanced/part-2-note-completion")} /></section> : null}
  </main>;
}

export function OteListeningPart2StrategyLivePlayer() {
  const { gameId } = useParams();
  const { game, loading, error, extract, extracts } = useStrategyRoom(gameId);
  const [drafts, setDrafts] = useState({});
  const [confidences, setConfidences] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const logged = useRef(new Set());
  const uid = auth.currentUser?.uid;
  const player = game?.players?.[uid];
  const phase = game?.state?.phase || "lobby";
  const response = player?.strategyResponses?.[extract?.id]?.[phase];
  const previous = player?.strategyResponses?.[extract?.id]?.[phase === "script" ? "second" : "first"];
  const draftKey = `${extract?.id}:${phase}`;
  const answers = response?.answers || drafts[draftKey] || previous?.answers || {};
  const confidence = response?.confidence || confidences[draftKey] || previous?.confidence || "unsure";

  useEffect(() => { setSaveError(""); }, [phase, extract?.id]);
  useEffect(() => {
    if (!uid || !player || game?.type !== LISTENING_STRATEGY_GAME_TYPE || phase === "lobby") return;
    const stage = phase === "finished" ? "completed" : "started";
    const key = `ote-listening-strategy:${gameId}:${uid}:${stage}`;
    if (logged.current.has(key) || window.localStorage.getItem(key)) return;
    logged.current.add(key);
    const first = strategyStageScore(extracts, player, "first");
    const second = strategyStageScore(extracts, player, "second");
    const script = strategyStageScore(extracts, player, "script");
    const details = { section: "listening", part: "part-2", mode: "teacher_bank_strategy_live", taskId: "advanced-listening-part-2-strategy-lesson", taskTitle: LISTENING_STRATEGY_TITLE, progressId: "listening.part2.teacher-bank.strategy-lesson", variant: "advanced", gameId, participantRole: "student", reviewOnly: true };
    const log = stage === "completed" ? logOteTrainingCompleted({ ...details, score: second.correct, total: second.total, firstListenScore: first.correct, firstListenTotal: first.total, scriptScore: script.correct, scriptTotal: script.total, selectedExtractIds: extracts.map((item) => item.id), completionReason: "host_finished" }) : logOteTrainingStarted(details);
    log.then(() => window.localStorage.setItem(key, "1")).catch(() => logged.current.delete(key));
  }, [extracts, game?.type, gameId, phase, player, uid]);

  async function submit(event) {
    event.preventDefault();
    if (saving || response) return;
    setSaving(true); setSaveError("");
    try { await submitListeningStrategyResponse({ gameId, extractId: extract.id, stage: phase, answers, confidence }); }
    catch (failure) { setSaveError(failure.message || "Your answers could not be saved. Try again."); }
    finally { setSaving(false); }
  }

  if (loading) return <main className="strategy-page"><p>Joining lesson…</p></main>;
  if (error) return <main className="strategy-page"><p role="alert">{error}</p></main>;
  if (game?.type !== LISTENING_STRATEGY_GAME_TYPE || !extract) return <main className="strategy-page"><h1>Lesson not found</h1></main>;
  if (!player) return <main className="strategy-page"><h1>Join the lesson first</h1><a className="strategy-link" href={getSitePath("/live/join")}>Enter the teacher's PIN</a></main>;

  return <main className="strategy-page">
    <Seo title={`${LISTENING_STRATEGY_TITLE} · Live lesson`} description="Short listening strategy practice led by your teacher." />
    <SessionHeader phase={phase} extract={extract} index={Number(game.state.extractIndex || 0)} count={extracts.length} />
    {saveError ? <p className="strategy-error" role="alert">{saveError}</p> : null}
    {phase === "lobby" ? <section className="strategy-section"><h2>You're in, {player.name}</h2><p>Your teacher will begin shortly. Have a go on the first listen, then use the second to check. Your answers after each stage are kept separately.</p></section> : null}
    {phase === "preview" ? <section className="strategy-section"><StrategyNotes extract={extract} /><p className="strategy-discussion">{extract.prompt}</p><p>Think or discuss. You do not need to guess the exact answer or type a prediction.</p></section> : null}
    {STRATEGY_RESPONSE_STAGES.includes(phase) ? <form className="strategy-section" onSubmit={submit}>
      <p className="strategy-callout" role="status">{phase === "script" ? "Check the script before the answer is revealed. This response is recorded as reading support." : `${game.state.audioStage === "playing" ? "The recording is playing from your teacher's screen." : "Listen to the audio or reading shared by your teacher."} ${phase === "first" ? "Try an answer now." : "Check what you were uncertain about."}`}</p>
      <StrategyNotes extract={extract} answers={answers} onChange={(gapId, value) => setDrafts((current) => ({ ...current, [draftKey]: { ...answers, [gapId]: value } }))} disabled={Boolean(response) || saving} instance="student" />
      {phase === "script" ? <StrategyScript extract={extract} /> : null}
      <label className="strategy-confidence">How confident are you?<select value={confidence} disabled={Boolean(response) || saving} onChange={(event) => setConfidences((current) => ({ ...current, [draftKey]: event.target.value }))}><option value="unsure">Still uncertain</option><option value="sure">Confident in my evidence</option></select></label>
      <button className="strategy-primary" type="submit" disabled={Boolean(response) || saving}>{response ? "Submitted · waiting for the teacher" : saving ? "Saving…" : phase === "first" ? "Submit first-listen answers" : phase === "second" ? "Submit second-listen answers" : "Confirm script-check answers"}</button><p className="strategy-small">You can submit a blank if you missed a gap. Submitting locks this stage; the next stage gives you a separate chance to revise.</p>
    </form> : null}
    {phase === "compare" ? <section className="strategy-section"><StrategyNotes extract={extract} answers={player.strategyResponses?.[extract.id]?.first?.answers} /><p className="strategy-discussion">Compare your evidence with a partner. What did the speaker say? Decide what you need to check on the second listen. Your first response stays as submitted.</p></section> : null}
    {phase === "review" ? <section className="strategy-section"><StrategyNotes extract={extract} /><StrategyFeedback extract={extract} player={player} /></section> : null}
    {phase === "finished" ? <section className="strategy-section"><h2>Your listening and review</h2><StrategyScores extracts={extracts} players={[{ ...player, name: "Your responses" }]} /><StrategyReflection /><StrategyNextStep partPath={getSitePath("/ote/listening/advanced/part-2-note-completion")} /></section> : null}
  </main>;
}
