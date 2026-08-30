import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, PenLine, Radio, Send, Users } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { useParams } from "react-router-dom";
import { submitPart4ErrorDetectiveLiveAnswer, submitPart4ErrorDetectiveLiveCorrection } from "../../api/liveGames.js";
import { auth, rtdb } from "../../firebase.js";
import Seo from "../common/Seo.jsx";
import { APTIS_PART4_ERROR_BANK, PART4_ERROR_DETECTIVE_LIVE_GAME_TYPE } from "./data/aptisPart4ErrorBank.js";
import { getErrorChunks } from "./Part4ErrorDetective.jsx";
import { LiveErrorChunks } from "./AptisPart4ErrorDetectiveLiveHost.jsx";
import "./aptisRegisterSurgeryLive.css";
import "./part4ErrorDetective.css";
import "./part4ErrorDetectiveLive.css";

const BATCH_SIZE = 4;
const PHASE_LABELS = { spot: "Spot", spot_review: "Review", correct: "Correct", correct_review: "Compare" };
function getBatchItems(round, batchIndex) { return round.slice(batchIndex * BATCH_SIZE, (batchIndex + 1) * BATCH_SIZE).map((id) => APTIS_PART4_ERROR_BANK.find((item) => item.id === id)).filter(Boolean); }

export default function AptisPart4ErrorDetectiveLivePlayer() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [choices, setChoices] = useState({});
  const [corrections, setCorrections] = useState({});
  const [saving, setSaving] = useState(false);
  useEffect(() => onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => { setGame(snapshot.exists() ? snapshot.val() : null); setLoading(false); }), [gameId]);
  const player = game?.players?.[auth.currentUser?.uid];
  const phase = game?.state?.phase || "lobby";
  const batchIndex = Number(game?.state?.roundIndex || 0);
  const batchItems = useMemo(() => getBatchItems(game?.state?.round || [], batchIndex), [game?.state?.round, batchIndex]);
  useEffect(() => { setChoices({}); setCorrections({}); }, [batchIndex]);

  async function submitSpots() {
    const pending = batchItems.filter((item) => Number.isInteger(choices[item.id]) && !player?.errorDetective?.[item.id]);
    if (!pending.length) return;
    setSaving(true);
    try { await Promise.all(pending.map((item) => submitPart4ErrorDetectiveLiveAnswer({ gameId, questionId: item.id, selectedIndex: choices[item.id] }))); } finally { setSaving(false); }
  }
  async function submitCorrections() {
    const pending = batchItems.filter((item) => corrections[item.id]?.trim() && !player?.errorDetectiveCorrections?.[item.id]);
    if (!pending.length) return;
    setSaving(true);
    try { await Promise.all(pending.map((item) => submitPart4ErrorDetectiveLiveCorrection({ gameId, questionId: item.id, correction: corrections[item.id] }))); } finally { setSaving(false); }
  }

  if (loading) return <main className="register-live-page"><p>Joining Error Detective…</p></main>;
  if (!game || game.type !== PART4_ERROR_DETECTIVE_LIVE_GAME_TYPE) return <main className="register-live-page"><h1>Live Error Detective</h1><p>Session not found.</p></main>;
  if (!player) return <main className="register-live-page"><h1>Live Error Detective</h1><p>You have not joined this session. Return to the join page and enter the PIN.</p></main>;

  const spotSubmitted = batchItems.filter((item) => player.errorDetective?.[item.id]).length;
  const spotPending = batchItems.filter((item) => Number.isInteger(choices[item.id]) && !player.errorDetective?.[item.id]).length;
  const correctionsSubmitted = batchItems.filter((item) => player.errorDetectiveCorrections?.[item.id]).length;
  const correctionsPending = batchItems.filter((item) => corrections[item.id]?.trim() && !player.errorDetectiveCorrections?.[item.id]).length;

  return <main className="register-live-page register-live-player error-detective-live-page">
    <Seo title="Live Error Detective | Seif Aptis Trainer" description="Aptis Writing Part 4 live error-detection activity." />
    <header className="register-live-header"><div><p>Aptis Writing Part 4 · Live classroom</p><h1>Error Detective</h1></div><span>{phase === "finished" ? "Complete" : phase === "lobby" ? "Waiting" : `Set ${batchIndex + 1} · ${PHASE_LABELS[phase] || phase}`}</span></header>
    {phase === "lobby" ? <section className="register-live-wait"><Users size={45} /><h2>You’re in the room</h2><p>Your teacher will open the first set when everyone is ready.</p></section> : null}

    {phase === "spot" ? <section className="register-live-stage"><Notice icon={<Radio size={20} />} title="Stage 1 · Spot the errors" text="Discuss the four sentences, then submit the error locations you have completed." /><div className="error-detective-live-grid">{batchItems.map((item, itemIndex) => { const chunks = getErrorChunks(item); const answer = player.errorDetective?.[item.id]; const selectedIndex = answer?.selectedIndex ?? choices[item.id]; return <article className="error-detective-live-item" key={item.id}><header><strong>{batchIndex * 4 + itemIndex + 1}</strong><span>{answer ? "Submitted ✓" : "Choose one phrase"}</span></header><div className="error-detective-sentence error-detective-live-sentence">{chunks.map((chunk, chunkIndex) => <button className={selectedIndex === chunkIndex ? "is-selected" : ""} disabled={Boolean(answer)} key={`${chunk.text}-${chunkIndex}`} onClick={() => setChoices((current) => ({ ...current, [item.id]: chunkIndex }))} type="button">{chunk.text}</button>)}</div></article>; })}</div><SubmitButton count={spotPending} label="location" onClick={submitSpots} saving={saving} /><Progress count={spotSubmitted} text="locations" /></section> : null}

    {phase === "spot_review" ? <section className="register-live-stage"><div className="register-live-stage-heading"><div><p>Stage 1 review</p><h2>Check the error locations</h2></div><span>{spotSubmitted}/4 submitted</span></div><div className="error-detective-live-grid is-review">{batchItems.map((item, itemIndex) => <article className="error-detective-live-item" key={item.id}><header><strong>{batchIndex * 4 + itemIndex + 1}</strong><span>{player.errorDetective?.[item.id] ? "Your choice is outlined" : "No answer submitted"}</span></header><LiveErrorChunks chunks={getErrorChunks(item)} reveal selectedIndex={player.errorDetective?.[item.id]?.selectedIndex} /><p className="error-detective-live-target"><strong>Problem phrase:</strong> {item.target}</p></article>)}</div><Wait text="Your teacher will open the correction phase next." /></section> : null}

    {phase === "correct" ? <section className="register-live-stage"><Notice icon={<PenLine size={20} />} title="Stage 2 · Correct the errors" text="Rewrite each highlighted problem phrase, or write the complete corrected sentence." /><div className="error-detective-live-grid">{batchItems.map((item, itemIndex) => { const submission = player.errorDetectiveCorrections?.[item.id]; return <article className="error-detective-live-item" key={item.id}><header><strong>{batchIndex * 4 + itemIndex + 1}</strong><span>{submission ? "Submitted ✓" : "Write a correction"}</span></header><p className="error-detective-live-original">{item.sentence}</p><label className="error-detective-live-input"><span>Correct “{item.target}”</span><input disabled={Boolean(submission)} maxLength={500} onChange={(event) => setCorrections((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Your correction…" value={submission?.correction || corrections[item.id] || ""} /></label></article>; })}</div><SubmitButton count={correctionsPending} label="correction" onClick={submitCorrections} saving={saving} /><Progress count={correctionsSubmitted} text="corrections" /></section> : null}

    {phase === "correct_review" ? <section className="register-live-stage"><div className="register-live-stage-heading"><div><p>Stage 2 review</p><h2>Compare your corrections</h2></div><span>{correctionsSubmitted}/4 submitted</span></div><div className="error-detective-live-grid is-review">{batchItems.map((item, itemIndex) => <article className="error-detective-live-item" key={item.id}><header><strong>{batchIndex * 4 + itemIndex + 1}</strong><span>{player.errorDetectiveCorrections?.[item.id] ? "Your correction" : "No correction submitted"}</span></header>{player.errorDetectiveCorrections?.[item.id] ? <blockquote className="error-detective-live-own-correction">{player.errorDetectiveCorrections[item.id].correction}</blockquote> : null}<p className="error-detective-live-correction"><strong>Model:</strong> {item.correctedSentence}</p><p>{item.explanation}</p></article>)}</div><Wait text="Your teacher will open the next set when the review is finished." /></section> : null}

    {phase === "finished" ? <section className="register-live-stage register-live-player-finished"><CheckCircle2 size={48} /><p>Activity complete</p><h2>Eight recurring errors spotted and corrected</h2></section> : null}
  </main>;
}

function Notice({ icon, title, text }) { return <div className="register-live-round-notice">{icon}<div><strong>{title}</strong><span>{text}</span></div></div>; }
function SubmitButton({ count, label, onClick, saving }) { return <button className="register-live-primary register-live-next" disabled={!count || saving} onClick={onClick} type="button"><Send size={18} /> {saving ? "Submitting…" : `Submit ${count || "selected"} ${count === 1 ? label : `${label}s`}`}</button>; }
function Progress({ count, text }) { return <p className="error-detective-live-progress">{count} of 4 {text} submitted. Your teacher may begin the review before everyone finishes.</p>; }
function Wait({ text }) { return <div className="register-live-wait is-compact"><p>{text}</p></div>; }
