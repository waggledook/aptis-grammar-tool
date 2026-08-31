import React, { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle2, Clipboard, Download, Eye, Play, Sparkles, Users } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "react-router-dom";
import {
  saveAptisWritingLiveFeedback,
  setLiveGameState,
  setLiveGameStatus,
} from "../../api/liveGames.js";
import * as fb from "../../firebase.js";
import { rtdb } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import Seo from "../common/Seo.jsx";
import {
  APTIS_WRITING_LIVE_GAME_TYPE,
  getAptisWritingTeacherTask,
  getAptisWritingLiveSuggestedSeconds,
} from "./data/aptisWritingTeacherTasks.js";
import {
  AptisWritingLiveFeedback,
  AptisWritingLivePrompt,
  AptisWritingLiveTimer,
  AptisWritingSubmittedResponse,
  getAnonymousLiveSubmissions,
  getAptisWritingLiveTimerSnapshot,
} from "./AptisWritingLiveShared.jsx";
import { downloadAptisWritingLiveResponsesDocx } from "./utils/aptisWritingLiveDocx.js";
import "./aptisWritingLive.css";

const PHASE_LABELS = {
  lobby: "Waiting room",
  writing: "Students writing",
  review: "Class review",
  finished: "Complete",
};

export default function AptisWritingLiveHost({ user }) {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copyState, setCopyState] = useState("");
  const [downloadState, setDownloadState] = useState("");
  const [feedbackProgress, setFeedbackProgress] = useState({ status: "idle", completed: 0, total: 0, failed: 0 });

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
  const part = Number(game?.part);
  const task = getAptisWritingTeacherTask(part, game?.taskId, game?.questionIds);
  const phase = game?.state?.phase || "lobby";
  const submissions = players.filter((player) => player.writingSubmission);
  const anonymousSubmissions = useMemo(
    () => getAnonymousLiveSubmissions(players, gameId),
    [gameId, players]
  );
  const isHost = Boolean(user && game?.ownerUid === user.uid);
  const joinPath = getSitePath("/live/join");
  const joinUrl = typeof window === "undefined"
    ? ""
    : `${window.location.origin}${joinPath}?pin=${encodeURIComponent(game?.pin || "")}`;

  async function copyJoinLink() {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopyState("Copied");
      window.setTimeout(() => setCopyState(""), 1500);
    } catch {
      setCopyState("Copy failed");
    }
  }

  async function beginWriting() {
    await setLiveGameStatus(gameId, "in-progress");
    await setLiveGameState(gameId, { phase: "writing" });
    await fb.logAptisWritingLiveStarted({
      gameId,
      pin: game.pin || null,
      activityType: "writing-task",
      activityTitle: task.title,
      part,
      taskId: task.id,
      playerCount: players.length,
    });
  }

  async function startWritingTimer() {
    const timer = getAptisWritingLiveTimerSnapshot(game?.state, Date.now(), getAptisWritingLiveSuggestedSeconds(part));
    const remainingSeconds = timer.status === "paused" && timer.remainingSeconds > 0
      ? timer.remainingSeconds
      : timer.durationSeconds;
    await setLiveGameState(gameId, {
      writingTimerDeadline: Date.now() + remainingSeconds * 1000,
      writingTimerRemaining: null,
      writingTimerStatus: "running",
    });
  }

  async function pauseWritingTimer() {
    const timer = getAptisWritingLiveTimerSnapshot(game?.state, Date.now(), getAptisWritingLiveSuggestedSeconds(part));
    await setLiveGameState(gameId, {
      writingTimerDeadline: null,
      writingTimerRemaining: timer.remainingSeconds,
      writingTimerStatus: "paused",
    });
  }

  async function resetWritingTimer() {
    const timer = getAptisWritingLiveTimerSnapshot(game?.state, Date.now(), getAptisWritingLiveSuggestedSeconds(part));
    await setLiveGameState(gameId, {
      writingTimerDeadline: null,
      writingTimerRemaining: timer.durationSeconds,
      writingTimerStatus: "ready",
    });
  }

  async function beginReview() {
    const outstanding = players.length - submissions.length;
    if (outstanding > 0 && !window.confirm(`${outstanding} student(s) have not submitted. Begin the review anyway?`)) return;
    await setLiveGameState(gameId, { phase: "review" });
    await fb.logAptisWritingLiveReviewStarted({
      gameId,
      pin: game.pin || null,
      activityType: "writing-task",
      activityTitle: task.title,
      part,
      taskId: task.id,
      playerCount: players.length,
      submissionCount: submissions.length,
    });
  }

  async function finishSession() {
    await setLiveGameStatus(gameId, "finished");
    await setLiveGameState(gameId, { phase: "finished" });
    await fb.logAptisWritingLiveFinished({
      gameId,
      pin: game.pin || null,
      activityType: "writing-task",
      activityTitle: task.title,
      part,
      taskId: task.id,
      playerCount: players.length,
      submissionCount: submissions.length,
    });
  }

  async function downloadResponses() {
    if (!anonymousSubmissions.length) return;
    setDownloadState("Preparing…");
    try {
      await downloadAptisWritingLiveResponsesDocx({
        gameId,
        part,
        task,
        submissions: anonymousSubmissions,
      });
      await fb.logAptisWritingLiveExported({
        gameId,
        pin: game.pin || null,
        activityType: "writing-task",
        activityTitle: task.title,
        part,
        taskId: task.id,
        playerCount: players.length,
        submissionCount: anonymousSubmissions.length,
        exportFormat: "docx",
      });
      setDownloadState("Downloaded");
    } catch (error) {
      console.error("[AptisWritingLiveHost] DOCX export failed", error);
      setDownloadState("Download failed");
    } finally {
      window.setTimeout(() => setDownloadState(""), 1800);
    }
  }

  async function generateAllFeedback() {
    const pending = anonymousSubmissions.filter((player) => player.writingFeedback?.taskId !== task.id);
    if (!pending.length) {
      setFeedbackProgress({ status: "complete", completed: anonymousSubmissions.length, total: anonymousSubmissions.length, failed: 0 });
      return;
    }

    const creditCost = ({ 1: 1, 2: 2, 3: 3, 4: 5 })[part] || 0;
    const totalCredits = pending.length * creditCost;
    if (!window.confirm(`Generate AI feedback for ${pending.length} ${pending.length === 1 ? "response" : "responses"}? This will use ${totalCredits} writing-feedback ${totalCredits === 1 ? "credit" : "credits"} from your allowance.`)) return;

    let completed = 0;
    let failed = 0;
    setFeedbackProgress({ status: "running", completed, total: pending.length, failed });

    for (const player of pending) {
      try {
        const result = await requestFeedbackForSubmission(part, task, player.writingSubmission);
        await saveAptisWritingLiveFeedback({
          gameId,
          playerId: player.id,
          taskId: task.id,
          feedback: result.feedback,
          meta: result.meta,
        });
        completed += 1;
      } catch (error) {
        console.error("[AptisWritingLiveHost] feedback generation failed", error);
        failed += 1;
        const isQuotaError = String(error?.code || "").includes("resource-exhausted");
        setFeedbackProgress({
          status: isQuotaError ? "quota-error" : "running",
          completed,
          total: pending.length,
          failed,
          message: error?.message || "Some feedback could not be generated.",
        });
        if (isQuotaError) break;
      }
      setFeedbackProgress({ status: "running", completed, total: pending.length, failed });
    }

    setFeedbackProgress((current) => ({
      ...current,
      status: current.status === "quota-error" ? "quota-error" : failed ? "partial" : "complete",
      completed,
      failed,
    }));
  }

  if (loading) return <main className="aptis-writing-live-page"><p>Loading live writing room…</p></main>;
  if (!game || game.type !== APTIS_WRITING_LIVE_GAME_TYPE || !task) {
    return <main className="aptis-writing-live-page"><h1>Live Aptis Writing</h1><p>Session not found.</p></main>;
  }
  if (!isHost) return <main className="aptis-writing-live-page"><h1>Live Aptis Writing</h1><p>You are not the host of this session.</p></main>;

  return (
    <main className="aptis-writing-live-page">
      <Seo title={`Host live Writing: ${task.title}`} description="Teacher-controlled Aptis Writing classroom session." />
      <header className="aptis-writing-live-header">
        <div><p>Aptis Writing Part {part} · Live classroom</p><h1>{task.title}</h1></div>
        <span>{PHASE_LABELS[phase] || phase}</span>
      </header>

      {phase === "lobby" ? (
        <section className="aptis-writing-live-lobby">
          <div className="aptis-writing-live-pin">
            <p>Students join with PIN</p>
            <strong>{String(game.pin || "").replace(/^(\d{3})(\d{3})$/, "$1 $2")}</strong>
            <QRCodeSVG value={joinUrl} size={184} includeMargin />
            <button type="button" onClick={copyJoinLink}><Clipboard size={17} /> {copyState || "Copy join link"}</button>
          </div>
          <div className="aptis-writing-live-roster">
            <header><div><p>Classroom</p><h2>{players.length} {players.length === 1 ? "student" : "students"} joined</h2></div><Users size={26} /></header>
            <div className="aptis-writing-live-roster-list">
              {players.map((player) => <span key={player.id}>{player.name}</span>)}
              {!players.length ? <p>Waiting for students…</p> : null}
            </div>
            <button className="aptis-writing-live-primary" disabled={!players.length} onClick={beginWriting} type="button"><Play size={18} /> Open the writing task</button>
          </div>
        </section>
      ) : null}

      {phase === "writing" ? (
        <section className="aptis-writing-live-stage">
          <AptisWritingLiveTimer
            onPause={pauseWritingTimer}
            onReset={resetWritingTimer}
            onStart={startWritingTimer}
            part={part}
            state={game.state}
          />
          <div className="aptis-writing-live-progress">
            <div><p>Live responses</p><h2>{submissions.length} of {players.length} submitted</h2></div>
            <div>{players.map((player) => <span className={player.writingSubmission ? "is-done" : ""} key={player.id}>{player.writingSubmission ? <Check size={15} /> : <i />}{player.name}</span>)}</div>
          </div>
          <AptisWritingLivePrompt part={part} task={task} />
          <button className="aptis-writing-live-primary aptis-writing-live-next" onClick={beginReview} type="button"><Eye size={18} /> Review submitted writing</button>
        </section>
      ) : null}

      {phase === "review" ? (
        <section className="aptis-writing-live-stage">
          <div className="aptis-writing-live-stage-heading"><div><p>Class review</p><h2>Anonymous responses</h2></div><span>{submissions.length} of {players.length} students</span></div>
          <p className="aptis-writing-live-anonymous-note">Names are hidden and the response order is randomised consistently for this session.</p>
          <div className="aptis-writing-live-teacher-actions">
            <button type="button" onClick={downloadResponses}><Download size={18} /> {downloadState || "Download answers (.docx)"}</button>
            <button type="button" disabled={feedbackProgress.status === "running"} onClick={generateAllFeedback}><Sparkles size={18} /> {feedbackButtonLabel(feedbackProgress, anonymousSubmissions)}</button>
          </div>
          {feedbackProgress.message ? <p className="aptis-writing-live-feedback-status" role="status">{feedbackProgress.message}</p> : null}
          <div className="aptis-writing-live-review-grid">
            {anonymousSubmissions.map((player) => (
              <article className="aptis-writing-live-student-submission" key={player.id}>
                <header><strong>{player.anonymousLabel}</strong><CheckCircle2 size={19} /></header>
                <AptisWritingSubmittedResponse part={part} submission={player.writingSubmission} task={task} />
                <AptisWritingLiveFeedback part={part} feedback={player.writingFeedback?.taskId === task.id ? player.writingFeedback.feedback : null} />
              </article>
            ))}
          </div>
          <button className="aptis-writing-live-primary aptis-writing-live-next" onClick={finishSession} type="button"><CheckCircle2 size={18} /> Finish session</button>
        </section>
      ) : null}

      {phase === "finished" ? (
        <section className="aptis-writing-live-stage aptis-writing-live-finished">
          <CheckCircle2 size={46} /><p>Session complete</p><h2>{submissions.length} of {players.length} students submitted</h2>
          <span>The anonymous responses and teacher tools remain available below.</span>
          <div className="aptis-writing-live-teacher-actions">
            <button type="button" onClick={downloadResponses}><Download size={18} /> {downloadState || "Download answers (.docx)"}</button>
            <button type="button" disabled={feedbackProgress.status === "running"} onClick={generateAllFeedback}><Sparkles size={18} /> {feedbackButtonLabel(feedbackProgress, anonymousSubmissions)}</button>
          </div>
          {feedbackProgress.message ? <p className="aptis-writing-live-feedback-status" role="status">{feedbackProgress.message}</p> : null}
          <div className="aptis-writing-live-review-grid aptis-writing-live-finished-grid">
            {anonymousSubmissions.map((player) => (
              <article className="aptis-writing-live-student-submission" key={player.id}>
                <header><strong>{player.anonymousLabel}</strong><CheckCircle2 size={19} /></header>
                <AptisWritingSubmittedResponse part={part} submission={player.writingSubmission} task={task} />
                <AptisWritingLiveFeedback part={part} feedback={player.writingFeedback?.taskId === task.id ? player.writingFeedback.feedback : null} />
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function feedbackButtonLabel(progress, submissions) {
  if (progress.status === "running") return `Generating ${progress.completed} of ${progress.total}…`;
  const ready = submissions.filter((player) => player.writingFeedback?.feedback).length;
  if (ready === submissions.length && submissions.length) return "AI feedback complete";
  if (ready) return `Get AI feedback for ${submissions.length - ready} remaining`;
  return "Get AI feedback for all";
}

async function requestFeedbackForSubmission(part, task, submission) {
  const answers = submission?.answers || {};
  const counts = submission?.counts || {};
  if (Number(part) === 1) {
    return fb.requestAptisWritingPart1Feedback(task.questions.map((question, index) => ({
      id: question.id,
      question: question.text,
      answer: answers.responses?.[index] || "",
    })));
  }
  if (Number(part) === 2) {
    return fb.requestAptisWritingPart23Feedback({
      part: "part2",
      taskId: task.id,
      title: task.title,
      context: task.context,
      prompt: task.prompt,
      answers: [{ text: answers.answer, wordCount: counts.answer }],
    });
  }
  if (Number(part) === 3) {
    return fb.requestAptisWritingPart23Feedback({
      part: "part3",
      taskId: task.id,
      title: task.title,
      context: task.context,
      chats: task.chats.map(({ name, question }) => ({ name, question })),
      answers: (answers.responses || []).map((text, index) => ({
        text,
        wordCount: counts.responses?.[index],
      })),
    });
  }
  return fb.requestAptisWritingPart4Feedback({
    part: "part4",
    taskId: task.id,
    title: task.title,
    sourceTitle: task.sourceTitle,
    source: task.source,
    friendPrompt: task.friendPrompt,
    formalPrompt: task.formalPrompt,
    friendEmail: { text: answers.informal, wordCount: counts.informal },
    formalEmail: { text: answers.formal, wordCount: counts.formal },
  });
}
