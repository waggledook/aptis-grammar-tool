import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BookOpenCheck, Radio, Search, Users } from "lucide-react";
import { listTeacherStudentsWithRosterMeta, logActivity } from "../../firebase.js";
import { createHubGrammarMistakeReviewLiveGame } from "../../api/liveGames.js";
import { fetchHubGrammarReviewData } from "../../api/hubGrammarReview.js";
import { getSitePath } from "../../siteConfig.js";
import {
  buildHubGrammarReviewSession, hubGrammarReviewCounts,
  selectHubGrammarMistakes, HUB_GRAMMAR_REVIEW_LIVE_MAX_QUESTIONS,
} from "../../utils/hubGrammarMistakes.js";
import { buildHubGrammarClassReviewQueue, buildHubGrammarStudentReviewQueue, summarizeHubGrammarReview } from "../../utils/hubGrammarReview.js";
import useHubGrammarReviewSaving from "./useHubGrammarReviewSaving.js";
import HubGrammarActivityRunner from "./HubGrammarActivityRunner.jsx";
import HubMiniGrammarQuizBuilder from "./HubMiniGrammarQuizBuilder.jsx";
import Seo from "../common/Seo.jsx";
import "./HubMiniGrammarReview.css";

function studentLabel(student) {
  return student.displayName || student.name || student.username || student.email || "Student";
}

function reviewDate(value) {
  const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function HubMiniGrammarReview({ user }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const isTeacher = user?.role === "teacher" || user?.role === "admin";
  const isLive = isTeacher && params.get("mode") === "live";
  const isQuestionBank = isTeacher && params.get("source") === "bank";
  const [students, setStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [testSearch, setTestSearch] = useState("");
  const [scope, setScope] = useState("all");
  const [selectedTestIds, setSelectedTestIds] = useState([]);
  const [learnerData, setLearnerData] = useState(null);
  const [classGroups, setClassGroups] = useState(null);
  const [studentView, setStudentView] = useState("due");
  const [includeReviewed, setIncludeReviewed] = useState(true);
  const [nowMs, setNowMs] = useState(Date.now);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [count, setCount] = useState(10);
  const [prioritize, setPrioritize] = useState(true);
  const [session, setSession] = useState(null);
  const [liveTitle, setLiveTitle] = useState("Mini grammar mistake review");
  const [duration, setDuration] = useState(45);
  const [creating, setCreating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const requestRef = useRef(0);
  const trackingRef = useRef(null);
  const bankDraftRef = useRef(null);
  const reviewSaving = useHubGrammarReviewSaving(user.uid, (progress) => {
    setLearnerData((data) => {
      if (!data) return data;
      const current = data.progress.find((row) => row.itemKey === progress.itemKey);
      if ((current?.lastOutcomeAtMs || 0) > progress.lastOutcomeAtMs) return data;
      return { ...data, progress: [...data.progress.filter((row) => row.itemKey !== progress.itemKey), progress] };
    });
    setNowMs(Date.now());
  });

  useEffect(() => {
    const update = () => setNowMs(Date.now());
    const timer = window.setInterval(update, 60000);
    window.addEventListener("focus", update);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", update); };
  }, []);

  const mistakes = useMemo(() => isTeacher
    ? classGroups === null ? null : buildHubGrammarClassReviewQueue(classGroups, new Date(nowMs))
    : learnerData === null ? null : buildHubGrammarStudentReviewQueue(learnerData.submissions, learnerData.progress, user.uid, new Date(nowMs)),
  [isTeacher, classGroups, learnerData, user.uid, nowMs]);

  useEffect(() => {
    let alive = true;
    requestRef.current += 1;
    setLoading(true);
    setError("");
    setLearnerData(null);
    setClassGroups(null);
    setSelectedStudentIds([]);
    setSelectedTestIds([]);
    setSession(null);
    (async () => {
      try {
        if (isTeacher) {
          const rows = await listTeacherStudentsWithRosterMeta(user.uid);
          if (alive) setStudents(rows);
        } else {
          const data = await fetchHubGrammarReviewData(user.uid);
          if (alive) setLearnerData(data);
        }
      } catch (cause) {
        console.error("[Mini grammar review] Load failed", cause);
        if (alive) setError(isTeacher ? "Your students could not be loaded. Please try again." : "Your saved mini tests could not be loaded. Please try again.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; requestRef.current += 1; };
  }, [isTeacher, user.uid, reloadKey]);

  const visibleStudents = useMemo(() => students.filter((student) =>
    [studentLabel(student), student.className, student.email, student.username]
      .some((value) => String(value || "").toLowerCase().includes(studentSearch.trim().toLowerCase()))),
  [students, studentSearch]);
  const allVisibleSelected = visibleStudents.length > 0
    && visibleStudents.every((student) => selectedStudentIds.includes(student.id));
  const tests = useMemo(() => {
    const byId = new Map();
    for (const item of mistakes || []) {
      if (!byId.has(item.activityId)) byId.set(item.activityId, {
        id: item.activityId, title: item.activityTitle, level: item.level, count: 0,
      });
      byId.get(item.activityId).count += 1;
    }
    return [...byId.values()].sort((a, b) => a.title.localeCompare(b.title));
  }, [mistakes]);
  const visibleTests = tests.filter((test) => `${test.title} ${test.level}`.toLowerCase().includes(testSearch.trim().toLowerCase()));
  const scopedMistakes = useMemo(() => (mistakes || []).filter((item) => scope === "all" || selectedTestIds.includes(item.activityId)),
    [mistakes, scope, selectedTestIds]);
  const summary = summarizeHubGrammarReview(scopedMistakes);
  const pool = scopedMistakes.filter((item) => isTeacher
    ? includeReviewed || item.reviewStatus === "due" : item.reviewStatus === studentView);
  const counts = hubGrammarReviewCounts(pool.length, isLive ? HUB_GRAMMAR_REVIEW_LIVE_MAX_QUESTIONS : pool.length);
  const selectedCount = counts.includes(count) ? count : counts[0] || 5;
  const reviewTotal = Math.min(selectedCount, pool.length);

  function changeMode(live) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (live) next.set("mode", "live");
      else next.delete("mode");
      return next;
    });
  }

  function changeQuestionSource(source) {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (source === "bank") next.set("source", "bank");
      else next.delete("source");
      return next;
    });
  }

  function startBankPractice({ items, title, selectionMode }) {
    const details = { app: "seifhub", questionSource: "bank", selectionMode,
      questionCount: items.length, testCount: new Set(items.map((item) => item.activityId)).size };
    trackingRef.current = { details, startedAt: Date.now(), completed: false };
    void logActivity("hub_grammar_quiz_started", details);
    setSession({ ...buildHubGrammarReviewSession(items, 0, { title, questionSource: "bank" }),
      setupLabel: "Back to quiz builder" });
  }

  function changeStudents(ids) {
    requestRef.current += 1;
    setSelectedStudentIds(ids);
    setClassGroups(null);
    setSelectedTestIds([]);
    setError("");
  }

  async function loadClassMistakes() {
    if (loading || !selectedStudentIds.length) return;
    const request = ++requestRef.current;
    setLoading(true);
    setError("");
    const results = await Promise.allSettled(selectedStudentIds.map(async (id) => ({
      student: { id }, ...await fetchHubGrammarReviewData(id),
    })));
    if (request !== requestRef.current) return;
    const groups = results.filter((result) => result.status === "fulfilled").map((result) => result.value);
    const failed = results.length - groups.length;
    setClassGroups(groups.length ? groups : null);
    if (failed) setError(`${failed} ${failed === 1 ? "student’s tests could" : "students’ tests could"} not be loaded. ${groups.length ? "The available mistakes are shown below." : "Please try again."}`);
    setLoading(false);
  }

  async function launch() {
    if (loading || creating || !reviewTotal || reviewSaving.saving || reviewSaving.error) return;
    const items = selectHubGrammarMistakes(pool, reviewTotal, isTeacher && prioritize);
    if (isLive) {
      setCreating(true);
      setError("");
      try {
        const { gameId } = await createHubGrammarMistakeReviewLiveGame({ items, title: liveTitle, questionDuration: duration });
        navigate(getSitePath(`/live/aptis-grammar/host/${gameId}`));
      } catch (cause) {
        console.error("[Mini grammar review] Live room failed", cause);
        setError(cause.message || "The live room could not be created. Please try again.");
      } finally {
        setCreating(false);
      }
      return;
    }
    const details = {
      app: "seifhub", questionCount: items.length,
      testCount: new Set(items.map((item) => item.activityId)).size,
      reviewScope: isTeacher ? "teacher_class" : "student",
      selectedStudentCount: isTeacher ? selectedStudentIds.length : 1,
      selectionMode: isTeacher ? includeReviewed ? "all_recorded" : "due" : studentView,
    };
    trackingRef.current = { details, startedAt: Date.now(), completed: false };
    void logActivity("hub_grammar_mistake_review_started", details);
    setSession({ ...buildHubGrammarReviewSession(items, isTeacher ? selectedStudentIds.length : 0),
      selectedMistakes: items, trackingMode: studentView === "due" ? "review" : "practice" });
  }

  function saveReviewAnswer(event) {
    if (isTeacher || !session) return;
    const mistake = session.selectedMistakes.find((item) => item.key === event.itemKey);
    if (!mistake) return;
    reviewSaving.queueAnswer({ ...event, source: session.trackingMode, knownMistake: true,
      sourceMistakeAtMs: mistake.latestMistakeAtMs || 0 });
  }

  function completeReview(result) {
    const tracking = trackingRef.current;
    if (!tracking || tracking.completed) return;
    tracking.completed = true;
    void logActivity(tracking.details.questionSource === "bank" ? "hub_grammar_quiz_completed" : "hub_grammar_mistake_review_completed", {
      ...tracking.details, correct: result.correct, total: result.total, score: result.score,
      durationSeconds: Math.round((Date.now() - tracking.startedAt) / 1000),
    });
  }

  if (session) return <HubGrammarActivityRunner user={user} reviewSession={session}
    onExitReview={() => setSession(null)} onReviewComplete={completeReview}
    onReviewItemChecked={isTeacher ? undefined : saveReviewAnswer}
    reviewSaveStatus={isTeacher ? undefined : reviewSaving} />;

  return <main className="hub-mini-review">
    <Seo title={`${isQuestionBank ? "Mini grammar quiz builder" : "Mini test mistake review"} | Seif Hub`} description="Build a mini grammar quiz from the question bank or review saved mistakes with your class." />
    <Link className="hub-mini-review-back" to={getSitePath("/grammar/mini-tests")}>← Back to mini tests</Link>
    <header className="hub-mini-review-hero">
      <BookOpenCheck size={32} aria-hidden="true" />
      <p className="hub-mini-review-kicker">Seif Hub · Mini grammar tests</p>
      <h1>{isQuestionBank ? isLive ? "Build a live mini grammar quiz" : "Build a mini grammar quiz" : isLive ? "Host a live mistake review" : isTeacher ? "Review your students’ mistakes" : "Learn from your mistakes"}</h1>
      <p>{isQuestionBank ? "Choose from the full mini test bank. Generate random questions or pick the exact items for your class." : isTeacher ? "Choose one or more students, combine their mini test mistakes and practise together." : "Have another go at questions you answered incorrectly in your saved mini tests."}</p>
    </header>
    {isTeacher && <div className="hub-mini-review-modes" aria-label="Review format">
      <button type="button" aria-pressed={!isLive} disabled={creating} onClick={() => changeMode(false)}><BookOpenCheck size={18} />{isQuestionBank ? "Class practice" : "Class review"}</button>
      <button type="button" aria-pressed={isLive} disabled={creating} onClick={() => changeMode(true)}><Radio size={18} />Live quiz</button>
    </div>}
    {isTeacher && <div className="hub-mini-review-source">
      <h2>Question source</h2>
      <div className="hub-mini-review-modes" aria-label="Question source">
        <button type="button" aria-pressed={!isQuestionBank} disabled={creating} onClick={() => changeQuestionSource("mistakes")}><Users size={18} />Students’ mistakes</button>
        <button type="button" aria-pressed={isQuestionBank} disabled={creating} onClick={() => changeQuestionSource("bank")}><BookOpenCheck size={18} />Build from question bank</button>
      </div>
    </div>}
    {!isQuestionBank && error && <div className="hub-mini-review-error" role="alert"><p>{error}</p><button type="button" disabled={loading || creating} onClick={() => isTeacher && students.length && selectedStudentIds.length ? loadClassMistakes() : setReloadKey((key) => key + 1)}>Try again</button></div>}
    {reviewSaving.error && <div className="hub-mini-review-error" role="alert"><p>Some review progress could not be saved. Retry before starting another review.</p><button type="button" onClick={reviewSaving.retry}>Retry saving progress</button></div>}
    {isQuestionBank ? <HubMiniGrammarQuizBuilder isLive={isLive} onStartClass={startBankPractice} onBusyChange={setCreating}
      initialDraft={bankDraftRef.current} onDraftChange={(draft) => { bankDraftRef.current = draft; }} /> : <fieldset className="hub-mini-review-fields" disabled={creating}>
      <legend className="hub-mini-review-sr-only">Mistake review setup</legend>
      {isTeacher && <section className="hub-mini-review-panel">
        <div className="hub-mini-review-heading"><div><h2><Users size={21} />Choose students</h2><p>Search by name or class, then select one or more students.</p></div><strong>{selectedStudentIds.length} selected</strong></div>
        <label className="hub-mini-review-search"><Search size={18} /><input aria-label="Search students" value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Search students or classes…" /></label>
        <button className="hub-mini-review-text-button" type="button" disabled={loading || !visibleStudents.length} onClick={() => changeStudents(allVisibleSelected
          ? selectedStudentIds.filter((id) => !visibleStudents.some((student) => student.id === id))
          : [...new Set([...selectedStudentIds, ...visibleStudents.map((student) => student.id)])])}>{allVisibleSelected ? "Deselect shown students" : "Select all shown students"}</button>
        <div className="hub-mini-review-list">
          {visibleStudents.map((student) => <label key={student.id} className="hub-mini-review-choice"><input type="checkbox" disabled={loading} checked={selectedStudentIds.includes(student.id)} onChange={() => changeStudents(selectedStudentIds.includes(student.id) ? selectedStudentIds.filter((id) => id !== student.id) : [...selectedStudentIds, student.id])} /><span><strong>{studentLabel(student)}</strong><small>{student.className || student.email || "Allocated student"}</small></span></label>)}
          {!loading && !visibleStudents.length && <p>{students.length ? "No students match your search." : "No allocated students are available."}</p>}
        </div>
        <button className="hub-mini-review-primary" type="button" disabled={loading || !selectedStudentIds.length} onClick={loadClassMistakes}>{loading ? "Loading…" : "Load students’ mistakes"}</button>
      </section>}
      {!isTeacher && loading && <p role="status">Loading your mini test mistakes…</p>}
      {mistakes !== null && <section className="hub-mini-review-panel">
        <div className="hub-mini-review-heading"><div><h2>Choose mini tests</h2><p>Repeated mistakes appear once. Choose from all tests or focus on particular tests.</p></div><strong>{mistakes.length} questions</strong></div>
        {!mistakes.length ? <div className="hub-mini-review-empty"><BookOpenCheck size={30} /><h3>No saved mistakes to review</h3><p>{isTeacher ? "These students have no recorded mistakes in their saved mini tests yet." : "Complete a mini grammar test to start building your review."}</p><Link to={getSitePath("/grammar/mini-tests")}>Browse mini tests →</Link></div> : <>
          <div className="hub-mini-review-modes">
            <label><input type="radio" name="mini-review-scope" checked={scope === "all"} onChange={() => setScope("all")} />All mini tests</label>
            <label><input type="radio" name="mini-review-scope" checked={scope === "selected"} onChange={() => setScope("selected")} />Choose mini tests</label>
          </div>
          {scope === "selected" && <>
            <label className="hub-mini-review-search"><Search size={18} /><input aria-label="Search mini tests" value={testSearch} onChange={(event) => setTestSearch(event.target.value)} placeholder="Search tests or levels…" /></label>
            <div className="hub-mini-review-list">{visibleTests.map((test) => <label key={test.id} className="hub-mini-review-choice"><input type="checkbox" checked={selectedTestIds.includes(test.id)} onChange={() => setSelectedTestIds((ids) => ids.includes(test.id) ? ids.filter((id) => id !== test.id) : [...ids, test.id])} /><span><strong>{test.title}</strong><small>{test.level?.toUpperCase()} · {test.count} question{test.count === 1 ? "" : "s"}</small></span></label>)}{!visibleTests.length && <p>No tests match your search.</p>}</div>
          </>}
          {isTeacher ? <div className="hub-mini-review-teacher-scope">
            <label><input type="checkbox" checked={includeReviewed} onChange={(event) => setIncludeReviewed(event.target.checked)} />Include recently reviewed and mastered mistakes</label>
            <p className="hub-mini-review-note">{includeReviewed ? "Your class pool includes the full mistake history, even questions students have recently practised or mastered." : "Only questions currently due for at least one selected student are included."} {isLive ? "Each student’s own submitted live answers update their personal progress. Unanswered questions leave it unchanged." : "Shared class review does not change students’ personal review schedules."}</p>
          </div> : <>
            <div className="hub-mini-review-modes" aria-label="Review queue">
              {[["due", "Due now"], ["scheduled", "Scheduled"], ["mastered", "Mastered"]].map(([value, label]) => <button key={value} type="button" aria-pressed={studentView === value} onClick={() => setStudentView(value)}>{label} · {summary[value]}</button>)}
            </div>
            <p className="hub-mini-review-note">{studentView === "due" ? "Correct reviews move to longer gaps: 1, 3, 7 and 14 days. Mistakes return to the start." : "Practise these questions whenever you like. Early practice keeps the scheduled review date; a new mistake returns the question to Due now."}</p>
            {studentView === "scheduled" && summary.nextReviewAt && <p className="hub-mini-review-note">Next scheduled review: {reviewDate(summary.nextReviewAt)}.</p>}
            {!pool.length && <div className="hub-mini-review-empty"><h3>{studentView === "due" ? "You’re up to date" : studentView === "scheduled" ? "No scheduled reviews yet" : "No mastered questions yet"}</h3><p>{studentView === "due" && summary.nextReviewAt ? `Next review: ${reviewDate(summary.nextReviewAt)}. You can practise scheduled questions in the meantime.` : studentView === "mastered" ? "Questions move here after the final successful delayed review." : "Choose another queue or mini test to keep practising."}</p></div>}
          </>}
          <div className="hub-mini-review-settings">
            <label>Questions to review<select value={selectedCount} disabled={!pool.length} onChange={(event) => setCount(Number(event.target.value))}>{counts.length ? counts.map((value) => <option key={value} value={value}>{value} questions{value > pool.length ? ` · all ${pool.length} available` : ""}</option>) : <option value={5}>5 questions</option>}</select></label>
            {isTeacher && <label className="hub-mini-review-priority"><input type="checkbox" checked={prioritize} onChange={(event) => setPrioritize(event.target.checked)} />Most common mistakes first</label>}
          </div>
          <p className="hub-mini-review-note">{pool.length ? `${pool.length} unique questions available. This review will include ${reviewTotal}.` : scope === "selected" && !selectedTestIds.length ? "Choose at least one mini test to review." : "No questions in this selection."} Questions are selected in steps of five; smaller pools use every available question.</p>
          {isLive && <div className="hub-mini-review-settings"><label>Live quiz title<input value={liveTitle} maxLength={120} onChange={(event) => setLiveTitle(event.target.value)} /></label><label>Time per question<select value={duration} onChange={(event) => setDuration(Number(event.target.value))}>{[15, 20, 30, 45, 60, 90].map((seconds) => <option key={seconds} value={seconds}>{seconds} seconds</option>)}</select></label><p className="hub-mini-review-note">Live quizzes include up to 50 questions, a PIN lobby, timed answers and class results. Gap fills and sentence tasks use written answers.</p></div>}
          <button className="hub-mini-review-primary" type="button" disabled={loading || creating || reviewSaving.saving || reviewSaving.error || !reviewTotal || (isLive && (reviewTotal < 2 || !liveTitle.trim()))} onClick={launch}>{creating ? "Creating live room…" : isLive ? `Host ${reviewTotal} questions live` : !isTeacher && studentView !== "due" ? `Practise ${reviewTotal} questions anyway` : `Start ${reviewTotal} questions`}</button>
          {isLive && reviewTotal === 1 && <p className="hub-mini-review-note">Live quizzes need at least two questions. Include more mini tests or students, or use class review.</p>}
        </>}
      </section>}
    </fieldset>}
  </main>;
}
