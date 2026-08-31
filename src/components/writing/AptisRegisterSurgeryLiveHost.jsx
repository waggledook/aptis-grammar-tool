import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clipboard,
  Copy,
  Download,
  Eye,
  Play,
  Radio,
  Users,
} from "lucide-react";
import { onValue, ref } from "firebase/database";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "react-router-dom";
import {
  setLiveGameState,
  setLiveGameStatus,
} from "../../api/liveGames.js";
import {
  logAptisWritingLiveExported,
  logAptisWritingLiveFinished,
  logAptisWritingLiveReviewStarted,
  logAptisWritingLiveStarted,
  rtdb,
} from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import { toast } from "../../utils/toast.js";
import Seo from "../common/Seo.jsx";
import {
  REGISTER_SURGERY_COMPARISONS,
  REGISTER_SURGERY_LIVE_GAME_TYPE,
  hasRegisterSurgeryLiveSubmission,
} from "./data/aptisWritingRegisterSurgery.js";
import {
  getRegisterSurgeryRewriteExportText,
  getRegisterSurgerySpotDistribution,
  RegisterSurgeryLiveEmail,
  RegisterSurgeryLiveRewriteForm,
  RegisterSurgeryLiveRewriteReview,
  RegisterSurgeryLiveSource,
} from "./AptisRegisterSurgeryLiveShared.jsx";
import { downloadRegisterSurgeryLiveReportDocx } from "./utils/registerSurgeryLiveDocx.js";
import "./aptisRegisterSurgeryLive.css";

const PHASE_LABELS = {
  lobby: "Waiting room",
  informal_spot: "1/5 · Informal spotting",
  informal_spot_review: "1/5 · Review",
  informal_rewrite: "2/5 · Informal rewrites",
  informal_rewrite_review: "2/5 · Review",
  formal_spot: "3/5 · Formal spotting",
  formal_spot_review: "3/5 · Review",
  formal_rewrite: "4/5 · Formal rewrites",
  formal_rewrite_review: "4/5 · Review",
  compare: "5/5 · Compare register",
  finished: "Complete",
};

const ACTIVE_PHASES = {
  informal_spot: { kind: "informal", mode: "spot", review: "informal_spot_review" },
  informal_rewrite: { kind: "informal", mode: "rewrite", review: "informal_rewrite_review" },
  formal_spot: { kind: "formal", mode: "spot", review: "formal_spot_review" },
  formal_rewrite: { kind: "formal", mode: "rewrite", review: "formal_rewrite_review" },
};

const REVIEW_NEXT = {
  informal_spot_review: { phase: "informal_rewrite", label: "Open informal rewrite round" },
  informal_rewrite_review: { phase: "formal_spot", label: "Open formal spotting round" },
  formal_spot_review: { phase: "formal_rewrite", label: "Open formal rewrite round" },
  formal_rewrite_review: { phase: "compare", label: "Compare informal and formal register" },
};

export default function AptisRegisterSurgeryLiveHost({ user }) {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copyState, setCopyState] = useState("");
  const [exportState, setExportState] = useState("");

  useEffect(() => onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
    setGame(snapshot.exists() ? snapshot.val() : null);
    setLoading(false);
  }), [gameId]);

  const players = useMemo(
    () => Object.entries(game?.players || {})
      .map(([id, player]) => ({ id, ...player }))
      .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0)),
    [game?.players]
  );
  const phase = game?.state?.phase || "lobby";
  const activeStage = ACTIVE_PHASES[phase];
  const submittedPlayers = activeStage
    ? players.filter((player) => hasRegisterSurgeryLiveSubmission(player, activeStage.kind, activeStage.mode))
    : [];
  const isHost = Boolean(user && game?.ownerUid === user.uid);
  const joinPath = getSitePath("/live/join");
  const joinUrl = typeof window === "undefined"
    ? ""
    : `${window.location.origin}${joinPath}${joinPath.includes("?") ? "&" : "?"}pin=${encodeURIComponent(game?.pin || "")}`;

  async function copyJoinLink() {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopyState("Copied");
    } catch {
      setCopyState("Copy failed");
    }
    window.setTimeout(() => setCopyState(""), 1600);
  }

  async function beginSession() {
    if (!players.length) return toast("Wait for at least one student to join.");
    await setLiveGameStatus(gameId, "in-progress");
    await setLiveGameState(gameId, { phase: "informal_spot" });
    await logAptisWritingLiveStarted({
      gameId,
      pin: game.pin || null,
      activityType: "register-surgery",
      activityTitle: "Register Surgery",
      part: 4,
      taskId: "part4-register-surgery",
      playerCount: players.length,
    });
  }

  async function revealActiveRound() {
    if (!activeStage) return;
    const missing = players.length - submittedPlayers.length;
    if (missing > 0 && !window.confirm(`${missing} student(s) have not submitted. Review the class responses anyway?`)) return;
    await setLiveGameState(gameId, { phase: activeStage.review });
    await logAptisWritingLiveReviewStarted({
      gameId,
      pin: game.pin || null,
      activityType: "register-surgery",
      activityTitle: "Register Surgery",
      part: 4,
      taskId: "part4-register-surgery",
      playerCount: players.length,
      submissionCount: submittedPlayers.length,
      stage: `${activeStage.kind}-${activeStage.mode}`,
    });
  }

  async function openNextRound() {
    const next = REVIEW_NEXT[phase];
    if (!next) return;
    await setLiveGameState(gameId, {
      phase: next.phase,
      ...(next.phase === "compare" ? { reviewIndex: -1 } : {}),
    });
  }

  async function revealNextComparison() {
    const current = Number(game?.state?.reviewIndex ?? -1);
    if (current < REGISTER_SURGERY_COMPARISONS.length - 1) {
      await setLiveGameState(gameId, { reviewIndex: current + 1 });
      return;
    }
    await setLiveGameStatus(gameId, "finished");
    await setLiveGameState(gameId, { phase: "finished" });
    await logAptisWritingLiveFinished({
      gameId,
      pin: game.pin || null,
      activityType: "register-surgery",
      activityTitle: "Register Surgery",
      part: 4,
      taskId: "part4-register-surgery",
      playerCount: players.length,
    });
  }

  async function copyAllRewrites() {
    try {
      await navigator.clipboard.writeText(getRegisterSurgeryRewriteExportText(players, gameId));
      await logAptisWritingLiveExported({
        gameId,
        pin: game.pin || null,
        activityType: "register-surgery",
        activityTitle: "Register Surgery",
        part: 4,
        taskId: "part4-register-surgery",
        playerCount: players.length,
        exportFormat: "clipboard",
      });
      setExportState("Copied");
    } catch {
      setExportState("Copy failed");
    }
    window.setTimeout(() => setExportState(""), 1800);
  }

  async function downloadRewrites() {
    setExportState("Preparing…");
    try {
      await downloadRegisterSurgeryLiveReportDocx({ players, gameId });
      await logAptisWritingLiveExported({
        gameId,
        pin: game.pin || null,
        activityType: "register-surgery",
        activityTitle: "Register Surgery",
        part: 4,
        taskId: "part4-register-surgery",
        playerCount: players.length,
        exportFormat: "docx",
      });
      setExportState("Downloaded");
    } catch (error) {
      console.error("[AptisRegisterSurgeryLiveHost] export failed", error);
      setExportState("Download failed");
    }
    window.setTimeout(() => setExportState(""), 1800);
  }

  if (loading) return <main className="register-live-page"><p>Loading Register Surgery room…</p></main>;
  if (!game || game.type !== REGISTER_SURGERY_LIVE_GAME_TYPE) {
    return <main className="register-live-page"><h1>Live Register Surgery</h1><p>Session not found.</p></main>;
  }
  if (!isHost) return <main className="register-live-page"><h1>Live Register Surgery</h1><p>You are not the host of this session.</p></main>;

  const reviewKind = phase.startsWith("informal") ? "informal" : phase.startsWith("formal") ? "formal" : null;
  const reviewMode = phase.includes("spot_review") ? "spot" : phase.includes("rewrite_review") ? "rewrite" : null;
  const reviewSubmitted = reviewKind && reviewMode
    ? players.filter((player) => hasRegisterSurgeryLiveSubmission(player, reviewKind, reviewMode))
    : [];
  const comparisonIndex = Number(game?.state?.reviewIndex ?? -1);

  return (
    <main className="register-live-page register-live-host">
      <Seo title="Host Live Register Surgery | Seif Aptis Trainer" description="Teacher-controlled Aptis Writing Part 4 register activity." />
      <header className="register-live-header">
        <div><p>Aptis Writing Part 4 · Live classroom</p><h1>Register Surgery</h1></div>
        <span>{PHASE_LABELS[phase] || phase}</span>
      </header>

      {phase === "lobby" ? (
        <section className="register-live-lobby">
          <div className="register-live-pin">
            <p>Students join with PIN</p>
            <strong>{String(game.pin || "").replace(/^(\d{3})(\d{3})$/, "$1 $2")}</strong>
            <QRCodeSVG value={joinUrl} size={184} includeMargin />
            <button type="button" onClick={copyJoinLink}><Clipboard size={17} /> {copyState || "Copy join link"}</button>
          </div>
          <div className="register-live-roster">
            <header><Users size={25} /><h2>{players.length} {players.length === 1 ? "student" : "students"} joined</h2></header>
            <div>{players.map((player) => <span key={player.id}>{player.name}</span>)}{!players.length ? <p>Waiting for students…</p> : null}</div>
            <button className="register-live-primary" disabled={!players.length} onClick={beginSession} type="button"><Play size={18} /> Open informal spotting</button>
          </div>
        </section>
      ) : null}

      {activeStage ? (
        <section className="register-live-stage">
          <RegisterSurgeryLiveSource compact />
          <LiveSubmissionStatus players={players} submittedPlayers={submittedPlayers} mode={activeStage.mode} />
          {activeStage.mode === "spot" ? (
            <RegisterSurgeryLiveEmail kind={activeStage.kind} disabled />
          ) : (
            <RegisterSurgeryLiveRewriteForm kind={activeStage.kind} values={{}} onChange={() => {}} disabled />
          )}
          <button className="register-live-primary register-live-next" onClick={revealActiveRound} type="button"><Eye size={18} /> Review class {activeStage.mode === "spot" ? "selections" : "rewrites"}</button>
        </section>
      ) : null}

      {reviewKind && reviewMode ? (
        <section className="register-live-stage">
          {reviewMode === "spot" ? (
            <>
              <div className="register-live-stage-heading"><div><p>Class review</p><h2>Where did the class spot register problems?</h2></div><span>{reviewSubmitted.length} submissions</span></div>
              <RegisterSurgeryLiveEmail
                kind={reviewKind}
                disabled
                distribution={getRegisterSurgerySpotDistribution(reviewSubmitted, reviewKind)}
                responseCount={reviewSubmitted.length}
                reveal
              />
            </>
          ) : (
            <>
              <RegisterSurgeryLiveRewriteReview gameId={gameId} kind={reviewKind} players={players} />
              <ExportActions copyState={exportState} onCopy={copyAllRewrites} onDownload={downloadRewrites} />
            </>
          )}
          <button className="register-live-primary register-live-next" onClick={openNextRound} type="button"><ArrowRight size={18} /> {REVIEW_NEXT[phase]?.label}</button>
        </section>
      ) : null}

      {phase === "compare" ? (
        <section className="register-live-stage">
          <div className="register-live-stage-heading"><div><p>Final comparison</p><h2>What changes with the reader?</h2></div><span>{Math.max(0, comparisonIndex + 1)}/{REGISTER_SURGERY_COMPARISONS.length} revealed</span></div>
          <ComparisonReveal revealIndex={comparisonIndex} />
          <button className="register-live-primary register-live-next" onClick={revealNextComparison} type="button">
            {comparisonIndex < REGISTER_SURGERY_COMPARISONS.length - 1 ? <><Eye size={18} /> Reveal next comparison</> : <><CheckCircle2 size={18} /> Finish activity</>}
          </button>
        </section>
      ) : null}

      {phase === "finished" ? (
        <section className="register-live-stage register-live-finished">
          <CheckCircle2 size={46} />
          <p>Session complete</p>
          <h2>All class rewrites remain available below</h2>
          <span>Responses are anonymous and grouped by the original expression.</span>
          <ExportActions copyState={exportState} onCopy={copyAllRewrites} onDownload={downloadRewrites} />
          <ComparisonReveal revealIndex={REGISTER_SURGERY_COMPARISONS.length - 1} />
          <RegisterSurgeryLiveRewriteReview gameId={gameId} kind="informal" players={players} />
          <RegisterSurgeryLiveRewriteReview gameId={gameId} kind="formal" players={players} />
        </section>
      ) : null}
    </main>
  );
}

function LiveSubmissionStatus({ players, submittedPlayers, mode }) {
  const submittedIds = new Set(submittedPlayers.map((player) => player.id));
  return (
    <div className="register-live-submission-status">
      <header><Radio size={20} /><div><strong>{submittedPlayers.length} of {players.length} responses received</strong><span>Students are {mode === "spot" ? "selecting expressions" : "writing alternatives"}.</span></div></header>
      <div>{players.map((player) => <span className={submittedIds.has(player.id) ? "is-done" : ""} key={player.id}>{submittedIds.has(player.id) ? <Check size={15} /> : <i />}{player.name}</span>)}</div>
    </div>
  );
}

function ExportActions({ copyState, onCopy, onDownload }) {
  return (
    <div className="register-live-export-actions">
      <button onClick={onCopy} type="button"><Copy size={17} /> {copyState === "Copied" || copyState === "Copy failed" ? copyState : "Copy all rewrites"}</button>
      <button onClick={onDownload} type="button"><Download size={17} /> {copyState === "Preparing…" || copyState === "Downloaded" || copyState === "Download failed" ? copyState : "Download rewrites (.docx)"}</button>
    </div>
  );
}

function ComparisonReveal({ revealIndex }) {
  return (
    <div className="register-live-comparison-grid">
      {REGISTER_SURGERY_COMPARISONS.map((item, index) => (
        <article className={index <= revealIndex ? "is-revealed" : ""} key={item.area}>
          <header><span>{index + 1}</span><strong>{item.area}</strong></header>
          {index <= revealIndex ? <div><p><small>Informal</small>{item.informal}</p><ArrowRight size={18} /><p><small>Formal</small>{item.formal}</p></div> : <p>Waiting for teacher reveal…</p>}
        </article>
      ))}
    </div>
  );
}
