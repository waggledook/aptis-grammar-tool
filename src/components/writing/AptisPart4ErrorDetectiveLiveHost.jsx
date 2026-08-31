import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clipboard, Download, Eye, PenLine, Play, Radio, Users } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "react-router-dom";
import { setLiveGameState, setLiveGameStatus } from "../../api/liveGames.js";
import {
  logAptisWritingLiveExported,
  logAptisWritingLiveFinished,
  logAptisWritingLiveReviewStarted,
  logAptisWritingLiveStarted,
  rtdb,
} from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import Seo from "../common/Seo.jsx";
import { APTIS_PART4_ERROR_BANK, PART4_ERROR_DETECTIVE_LIVE_GAME_TYPE } from "./data/aptisPart4ErrorBank.js";
import { getErrorChunks, makeErrorDetectiveRound } from "./Part4ErrorDetective.jsx";
import { downloadErrorDetectiveLiveReportDocx } from "./utils/errorDetectiveLiveDocx.js";
import "./aptisRegisterSurgeryLive.css";
import "./part4ErrorDetective.css";
import "./part4ErrorDetectiveLive.css";

const BATCH_SIZE = 4;
const PHASE_LABELS = { spot: "Spot errors", spot_review: "Spot review", correct: "Write corrections", correct_review: "Correction review" };

export function LiveErrorChunks({ chunks, reveal, selectedIndex, counts = {} }) {
  return <div className="error-detective-sentence error-detective-live-sentence">{chunks.map((chunk, index) => <span className={reveal && chunk.target ? "is-target" : selectedIndex === index ? "is-selected" : ""} key={`${chunk.text}-${index}`}>{chunk.text}{reveal && counts[index] ? <small>{counts[index]}</small> : null}</span>)}</div>;
}

function getBatchItems(round, batchIndex) {
  return round.slice(batchIndex * BATCH_SIZE, (batchIndex + 1) * BATCH_SIZE).map((id) => APTIS_PART4_ERROR_BANK.find((item) => item.id === id)).filter(Boolean);
}

function getAnswerCounts(players, itemId) {
  return players.reduce((counts, player) => { const answer = player.errorDetective?.[itemId]; if (answer) counts[answer.selectedIndex] = (counts[answer.selectedIndex] || 0) + 1; return counts; }, {});
}

export default function AptisPart4ErrorDetectiveLiveHost({ user }) {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [exportState, setExportState] = useState("");
  useEffect(() => onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => { setGame(snapshot.exists() ? snapshot.val() : null); setLoading(false); }), [gameId]);
  const players = useMemo(() => Object.entries(game?.players || {}).map(([id, player]) => ({ id, ...player })), [game?.players]);
  const phase = game?.state?.phase || "lobby";
  const batchIndex = Number(game?.state?.roundIndex || 0);
  const batchItems = getBatchItems(game?.state?.round || [], batchIndex);
  const joinUrl = typeof window === "undefined" ? "" : `${window.location.origin}${getSitePath("/live/join")}?pin=${game?.pin || ""}`;

  async function startSession() {
    await setLiveGameStatus(gameId, "in-progress");
    await setLiveGameState(gameId, { phase: "spot", roundIndex: 0, round: makeErrorDetectiveRound().map((item) => item.id) });
    await logAptisWritingLiveStarted({
      gameId, pin: game.pin || null, activityType: "error-detective", activityTitle: "Error Detective",
      part: 4, taskId: "part4-error-detective", playerCount: players.length,
    });
  }
  async function openReview(reviewPhase, stage) {
    await setLiveGameState(gameId, { phase: reviewPhase });
    const progressKey = stage === "spot" ? "errorDetective" : "errorDetectiveCorrections";
    const submissionCount = players.filter((player) => batchItems.some((item) => player[progressKey]?.[item.id])).length;
    await logAptisWritingLiveReviewStarted({
      gameId, pin: game.pin || null, activityType: "error-detective", activityTitle: "Error Detective",
      part: 4, taskId: "part4-error-detective", playerCount: players.length, submissionCount,
      stage: `set-${batchIndex + 1}-${stage}`,
    });
  }
  async function continueSession() {
    if (batchIndex === 0) return setLiveGameState(gameId, { phase: "spot", roundIndex: 1 });
    await setLiveGameStatus(gameId, "finished");
    await setLiveGameState(gameId, { phase: "finished" });
    await logAptisWritingLiveFinished({
      gameId, pin: game.pin || null, activityType: "error-detective", activityTitle: "Error Detective",
      part: 4, taskId: "part4-error-detective", playerCount: players.length,
    });
  }
  async function copyJoinLink() { await navigator.clipboard.writeText(joinUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }
  async function downloadReport() {
    setExportState("Preparing…");
    try {
      await downloadErrorDetectiveLiveReportDocx({ players, gameId, round: game?.state?.round || [] });
      await logAptisWritingLiveExported({
        gameId, pin: game.pin || null, activityType: "error-detective", activityTitle: "Error Detective",
        part: 4, taskId: "part4-error-detective", playerCount: players.length, exportFormat: "docx",
      });
      setExportState("Downloaded");
    } catch (error) {
      console.error("[AptisPart4ErrorDetectiveLiveHost] report export failed", error);
      setExportState("Download failed");
    }
    window.setTimeout(() => setExportState(""), 1800);
  }

  if (loading) return <main className="register-live-page"><p>Loading Error Detective room…</p></main>;
  if (!game || game.type !== PART4_ERROR_DETECTIVE_LIVE_GAME_TYPE) return <main className="register-live-page"><h1>Live Error Detective</h1><p>Session not found.</p></main>;
  if (game.ownerUid !== user?.uid) return <main className="register-live-page"><h1>Live Error Detective</h1><p>You are not the host of this session.</p></main>;

  return <main className="register-live-page register-live-host error-detective-live-page">
    <Seo title="Host Live Error Detective | Seif Aptis Trainer" description="Teacher-paced Aptis Writing Part 4 error activity." />
    <header className="register-live-header"><div><p>Aptis Writing Part 4 · Live classroom</p><h1>Error Detective</h1></div><span>{phase === "lobby" ? "Waiting room" : phase === "finished" ? "Complete" : `Set ${batchIndex + 1} of 2 · ${PHASE_LABELS[phase] || phase}`}</span></header>

    {phase === "lobby" ? <section className="register-live-lobby"><div className="register-live-pin"><p>Students join with PIN</p><strong>{String(game.pin).replace(/^(\d{3})(\d{3})$/, "$1 $2")}</strong><QRCodeSVG value={joinUrl} size={184} includeMargin /><button type="button" onClick={copyJoinLink}><Clipboard size={17} /> {copied ? "Copied" : "Copy join link"}</button></div><div className="register-live-roster"><header><Users size={25} /><h2>{players.length} joined</h2></header><div>{players.map((player) => <span key={player.id}>{player.name}</span>)}</div><button className="register-live-primary" disabled={!players.length} onClick={startSession} type="button"><Play size={18} /> Open first set of 4</button></div></section> : null}

    {phase === "spot" ? <WorkStage heading="Find the error in these four sentences" kicker="Pair or group work · Stage 1" items={batchItems} players={players} progressKey="errorDetective" renderItem={(item, number) => { const responseCount = players.filter((player) => player.errorDetective?.[item.id]).length; return <LiveItem item={item} key={item.id} number={batchIndex * 4 + number} status={`${responseCount}/${players.length} responses`} />; }} note="Spotting review can begin at any time, even if some students have not finished." button={<button className="register-live-primary register-live-next" onClick={() => openReview("spot_review", "spot")} type="button"><Eye size={18} /> Review error locations</button>} /> : null}

    {phase === "spot_review" ? <section className="register-live-stage"><StageHeading batchIndex={batchIndex} kicker="Stage 1 review" title="Confirm the four error locations" />
      <div className="error-detective-live-grid is-review">{batchItems.map((item, itemIndex) => { const counts = getAnswerCounts(players, item.id); const responseCount = Object.values(counts).reduce((total, count) => total + count, 0); return <article className="error-detective-live-item" key={item.id}><header><strong>{batchIndex * 4 + itemIndex + 1}</strong><span>{responseCount} responses</span></header><LiveErrorChunks chunks={getErrorChunks(item)} counts={counts} reveal /><p className="error-detective-live-target"><strong>Problem phrase:</strong> {item.target}</p></article>; })}</div>
      <button className="register-live-primary register-live-next" onClick={() => setLiveGameState(gameId, { phase: "correct" })} type="button"><PenLine size={18} /> Open correction phase</button>
    </section> : null}

    {phase === "correct" ? <WorkStage heading="Write a correction for each problem phrase" kicker="Pair or group work · Stage 2" items={batchItems} players={players} progressKey="errorDetectiveCorrections" renderItem={(item, number) => { const responseCount = players.filter((player) => player.errorDetectiveCorrections?.[item.id]).length; return <article className="error-detective-live-item" key={item.id}><header><strong>{batchIndex * 4 + number}</strong><span>{responseCount}/{players.length} corrections</span></header><p className="error-detective-live-original">{item.sentence}</p><p className="error-detective-live-target"><strong>Correct:</strong> {item.target}</p></article>; }} note="Correction review can begin at any time, even if some students have not finished." button={<button className="register-live-primary register-live-next" onClick={() => openReview("correct_review", "correction")} type="button"><Eye size={18} /> Review corrections</button>} /> : null}

    {phase === "correct_review" ? <section className="register-live-stage"><StageHeading batchIndex={batchIndex} kicker="Stage 2 review" title="Compare the class corrections" />
      <div className="error-detective-live-grid is-review">{batchItems.map((item, itemIndex) => { const corrections = players.map((player) => player.errorDetectiveCorrections?.[item.id]?.correction).filter(Boolean); return <article className="error-detective-live-item" key={item.id}><header><strong>{batchIndex * 4 + itemIndex + 1}</strong><span>{corrections.length} corrections</span></header><div className="error-detective-live-class-corrections">{corrections.length ? corrections.map((correction, index) => <blockquote key={`${correction}-${index}`}>{correction}</blockquote>) : <p>No correction submitted.</p>}</div><p className="error-detective-live-correction"><strong>Model:</strong> {item.correctedSentence}</p><p>{item.explanation}</p></article>; })}</div>
      <div className="error-detective-live-export"><button onClick={downloadReport} type="button"><Download size={18} /> {exportState || "Download Word report"}</button><button className="register-live-primary" onClick={continueSession} type="button">{batchIndex === 0 ? "Open second set of 4" : <><CheckCircle2 size={18} /> Finish activity</>}</button></div>
    </section> : null}

    {phase === "finished" ? <section className="register-live-stage register-live-finished"><CheckCircle2 size={48} /><p>Session complete</p><h2>Eight recurring Part 4 errors spotted and corrected</h2><button className="register-live-primary" onClick={downloadReport} type="button"><Download size={18} /> {exportState || "Download Word report"}</button></section> : null}
  </main>;
}

function StageHeading({ batchIndex, kicker, title }) { return <div className="register-live-stage-heading"><div><p>{kicker}</p><h2>{title}</h2></div><span>Set {batchIndex + 1} of 2</span></div>; }
function LiveItem({ item, number, status }) { return <article className="error-detective-live-item"><header><strong>{number}</strong><span>{status}</span></header><LiveErrorChunks chunks={getErrorChunks(item)} /></article>; }
function WorkStage({ heading, kicker, items, players, progressKey, renderItem, note, button }) {
  return <section className="register-live-stage"><div className="register-live-stage-heading"><div><p>{kicker}</p><h2>{heading}</h2></div></div><div className="error-detective-live-grid">{items.map((item, itemIndex) => renderItem(item, itemIndex + 1))}</div><ClassProgress players={players} items={items} progressKey={progressKey} /><div className="error-detective-live-review-action"><small>{note}</small>{button}</div></section>;
}
function ClassProgress({ players, items, progressKey }) { return <div className="register-live-submission-status"><header><Radio size={20} /><div><strong>Live completion</strong><span>Partial submissions are counted.</span></div></header><div>{players.map((player) => { const completed = items.filter((item) => player[progressKey]?.[item.id]).length; return <span className={completed === items.length ? "is-done" : ""} key={player.id}>{player.name} · {completed}/{items.length}</span>; })}</div></div>; }
