import React, { useEffect, useState } from "react";
import { CheckCircle2, Send, Users } from "lucide-react";
import { onValue, ref } from "firebase/database";
import { useParams } from "react-router-dom";
import { submitAptisWritingLiveResponse } from "../../api/liveGames.js";
import * as fb from "../../firebase.js";
import { auth, rtdb } from "../../firebase.js";
import { toast } from "../../utils/toast.js";
import Seo from "../common/Seo.jsx";
import {
  APTIS_WRITING_LIVE_GAME_TYPE,
  getAptisWritingTeacherTask,
} from "./data/aptisWritingTeacherTasks.js";
import {
  AptisWritingLiveEditor,
  AptisWritingLivePrompt,
  AptisWritingLiveTimer,
  AptisWritingSubmittedResponse,
  getEmptyWritingAnswers,
  getWritingCounts,
  hasCompleteWritingResponse,
} from "./AptisWritingLiveShared.jsx";
import "./aptisWritingLive.css";

const PHASE_LABELS = { lobby: "Waiting", writing: "Write", review: "Class review", finished: "Complete" };

export default function AptisWritingLivePlayer() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => onValue(ref(rtdb, `liveGames/${gameId}`), (snapshot) => {
    setGame(snapshot.exists() ? snapshot.val() : null);
    setLoading(false);
  }), [gameId]);

  const uid = auth.currentUser?.uid;
  const player = uid ? game?.players?.[uid] : null;
  const part = Number(game?.part);
  const task = getAptisWritingTeacherTask(part, game?.taskId, game?.questionIds);
  const phase = game?.state?.phase || "lobby";
  const submission = player?.writingSubmission || null;
  const activeAnswers = answers || getEmptyWritingAnswers(part);

  useEffect(() => {
    if ([1, 2, 3, 4].includes(part)) setAnswers(getEmptyWritingAnswers(part));
  }, [part, game?.taskId]);

  async function saveSubmissionToProfile(counts) {
    const html = (text) => `<p>${escapeHtml(text).replace(/\n/g, "<br/>")}</p>`;
    if (part === 1) {
      const items = task.questions.map((question, index) => ({
        id: question.id,
        question: question.text,
        answer: activeAnswers.responses[index].trim(),
      }));
      await fb.saveWritingP1Submission({ items, liveGameId: gameId });
      await fb.logWritingSubmitted({ part: "part1", totalItems: items.length, mode: "live" });
    } else if (part === 2) {
      await fb.saveWritingP2Submission({ taskId: task.id, answerText: activeAnswers.answer.trim(), answerHTML: html(activeAnswers.answer), counts, liveGameId: gameId });
      await fb.logWritingSubmitted({ part: "part2", taskId: task.id, wordCount: counts.answer, mode: "live" });
    } else if (part === 3) {
      const responses = activeAnswers.responses.map((answer) => answer.trim());
      await fb.saveWritingP3Submission({ taskId: task.id, answersText: responses, answersHTML: responses.map(html), counts: counts.responses, liveGameId: gameId });
      await fb.logWritingSubmitted({ part: "part3", taskId: task.id, wordCounts: counts.responses, totalWords: counts.responses.reduce((sum, count) => sum + count, 0), mode: "live" });
    } else {
      await fb.saveWritingP4Submission({ taskId: task.id, friendText: activeAnswers.informal.trim(), formalText: activeAnswers.formal.trim(), friendHTML: html(activeAnswers.informal), formalHTML: html(activeAnswers.formal), counts: { friend: counts.informal, formal: counts.formal }, liveGameId: gameId });
      await fb.logWritingSubmitted({ part: "part4", taskId: task.id, counts: { friend: counts.informal, formal: counts.formal }, totalWords: counts.informal + counts.formal, mode: "live" });
    }
  }

  async function submitResponse() {
    if (!hasCompleteWritingResponse(part, activeAnswers)) {
      toast(part === 1 ? "Please answer all five questions." : part === 3 ? "Please answer all three messages." : part === 4 ? "Please write both emails." : "Please write your response.");
      return;
    }
    const counts = getWritingCounts(part, activeAnswers);
    setSaving(true);
    try {
      await submitAptisWritingLiveResponse({ gameId, part, taskId: task.id, answers: activeAnswers, counts });
      await fb.logAptisWritingLiveSubmitted({
        gameId,
        pin: game.pin || null,
        activityType: "writing-task",
        activityTitle: task.title,
        part,
        taskId: task.id,
      });
      try {
        await saveSubmissionToProfile(counts);
      } catch (profileError) {
        console.warn("[AptisWritingLivePlayer] profile save failed", profileError);
        toast("Your live answer was submitted, but it could not be added to your profile.");
      }
    } catch (error) {
      console.error("[AptisWritingLivePlayer] response save failed", error);
      toast(error.message || "Your writing could not be submitted.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="aptis-writing-live-page"><p>Joining live writing room…</p></main>;
  if (!game || game.type !== APTIS_WRITING_LIVE_GAME_TYPE || !task) return <main className="aptis-writing-live-page"><h1>Live Aptis Writing</h1><p>Session not found.</p></main>;
  if (!player) return <main className="aptis-writing-live-page"><h1>Live Aptis Writing</h1><p>You have not joined this session. Return to the join page and enter the PIN.</p></main>;

  return (
    <main className="aptis-writing-live-page aptis-writing-live-player">
      <Seo title={`${task.title} · Live Aptis Writing`} description="Student Aptis Writing live classroom task." />
      <header className="aptis-writing-live-header">
        <div><p>Aptis Writing Part {part} · Live classroom</p><h1>{task.title}</h1></div>
        <span>{PHASE_LABELS[phase] || phase}</span>
      </header>

      {phase === "lobby" ? <section className="aptis-writing-live-wait"><Users size={44} /><h2>You’re in the room</h2><p>Your teacher will open the writing task when the class is ready.</p></section> : null}

      {phase === "writing" ? (
        <section className="aptis-writing-live-stage">
          <AptisWritingLiveTimer part={part} state={game.state} />
          <AptisWritingLivePrompt part={part} task={task} />
          {submission ? (
            <div className="aptis-writing-live-submitted"><CheckCircle2 size={38} /><h2>Writing submitted</h2><p>Wait for your teacher to begin the class review.</p></div>
          ) : (
            <>
              <AptisWritingLiveEditor answers={activeAnswers} onChange={setAnswers} part={part} task={task} />
              <button className="aptis-writing-live-primary aptis-writing-live-next" disabled={saving} onClick={submitResponse} type="button"><Send size={18} /> {saving ? "Submitting…" : "Submit writing"}</button>
            </>
          )}
        </section>
      ) : null}

      {phase === "review" ? (
        <section className="aptis-writing-live-stage">
          <div className="aptis-writing-live-stage-heading"><div><p>Class review</p><h2>Your submitted writing</h2></div></div>
          <AptisWritingSubmittedResponse part={part} submission={submission} task={task} />
          <div className="aptis-writing-live-review-note">Your own writing stays visible here. The class responses are shown in a random anonymous order on the teacher’s review screen.</div>
        </section>
      ) : null}

      {phase === "finished" ? <section className="aptis-writing-live-stage aptis-writing-live-finished"><CheckCircle2 size={46} /><p>Session complete</p><h2>{submission ? "Your writing was submitted" : "No response submitted"}</h2><span>{submission ? "A copy has also been added to your writing history." : "Ask your teacher if you should complete the direct-link version."}</span></section> : null}
    </main>
  );
}

function escapeHtml(value = "") {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
