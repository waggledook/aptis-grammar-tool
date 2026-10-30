import React, { useEffect, useRef, useState } from "react";
import { saveGerundInfinitiveActivityEvent } from "../../firebase.js";
import {
  GERUND_INFINITIVE_ITEMS,
  checkVerbPatternAnswer,
  createVerbPatternAttempt,
  normaliseVerbAnswer,
  restoreVerbPatternAttempt,
  summariseVerbPatternAttempt,
} from "../../utils/gerundInfinitiveActivity.js";
import { GERUND_INFINITIVE_LESSONS as lessons } from "./data/gerundInfinitiveData.js";
import { GerundInfinitiveOverview, GerundInfinitiveExplore, GerundInfinitiveReferences } from "./GerundInfinitiveReference.jsx";
import Seo from "../common/Seo.jsx";
import "./gerundInfinitiveActivity.css";

// These fragments are fixed lesson content from the supplied activity, never learner input.
function LessonCopy({ html }) {
  return <span dangerouslySetInnerHTML={{ __html: html.replace(/class="(ing|inf)"/g, 'class="gi-$1"') }} />;
}

function answerFeedback(entry, item, mixed, lessonIndex, questionIndex) {
  if (!entry.status) return "";
  if (entry.status === "correct") return `✓ Correct. ${item.why}${normaliseVerbAnswer(entry.value).startsWith("having ") ? " The perfect gerund also works here." : ""}`;
  if (entry.status === "revealed") return `Answer shown: ${item.answers[0]}. ${item.why}`;
  if (mixed) return `Reconsider this one. ${item.other === normaliseVerbAnswer(entry.value) ? "That form is grammatical, but it changes the focus. " : ""}${item.why}`;
  if (lessonIndex === 2 && normaliseVerbAnswer(entry.value) === item.other) {
    return `A different focus. That form is grammatical, but ${[0, 3, 4].includes(questionIndex) ? "it suggests testing an activity or method." : "it focuses on the effort to perform the action."} ${item.hint}`;
  }
  if (normaliseVerbAnswer(entry.value) === item.verb && item.answers[0].startsWith("to ")) return "Almost. You have the base verb. Add “to” to make the infinitive.";
  return `Not quite yet. ${item.hint}`;
}

export default function GerundInfinitiveActivity({ user, siteId }) {
  const storageKey = `gerund-or-infinitive:v1:${siteId}:${user.uid}`;
  const [attempt, setAttempt] = useState(() => {
    try { return restoreVerbPatternAttempt(JSON.parse(localStorage.getItem(storageKey)), siteId); }
    catch { return null; }
  });
  const attemptRef = useRef(attempt);
  const timers = useRef(new Map());
  const busyRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [storageWarning, setStorageWarning] = useState(false);
  const contentRef = useRef(null);
  const page = attempt?.page || 0;
  const summary = attempt ? summariseVerbPatternAttempt(attempt) : null;
  const finished = Boolean(attempt?.completedAtMs);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function commit(next) {
    attemptRef.current = next;
    setAttempt(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); }
    catch { setStorageWarning(true); }
  }

  function navigate(nextPage) {
    if (!attemptRef.current) return;
    commit({ ...attemptRef.current, page: nextPage });
    requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({ block: "start" });
      contentRef.current?.querySelector("h2")?.focus({ preventScroll: true });
    });
  }

  async function start() {
    if (busyRef.current) return;
    busyRef.current = true;
    setSaving(true); setError("");
    const next = createVerbPatternAttempt(siteId);
    try {
      await saveGerundInfinitiveActivityEvent("started", summariseVerbPatternAttempt(next), user.uid);
      commit(next);
    } catch {
      setError("Your start could not be saved. Check your connection and try again.");
    } finally { busyRef.current = false; setSaving(false); }
  }

  function check(index, reveal = false) {
    const current = attemptRef.current;
    if (!current || current.completedAtMs || busyRef.current) return;
    clearTimeout(timers.current.get(index));
    const answers = [...current.answers];
    answers[index] = checkVerbPatternAnswer(answers[index], GERUND_INFINITIVE_ITEMS[index], reveal);
    commit({ ...current, answers });
  }

  function edit(index, value) {
    const current = attemptRef.current;
    clearTimeout(timers.current.get(index));
    const answers = current.answers.map((entry, i) => i === index ? { ...entry, value, status: "" }
      : index >= 24 && i >= 24 ? { ...entry, status: "" } : entry);
    const next = { ...current, answers, mixedSubmitted: index >= 24 ? false : current.mixedSubmitted };
    commit(next);
    if (index < 24 && value.trim()) {
      if (GERUND_INFINITIVE_ITEMS[index].answers.includes(normaliseVerbAnswer(value))) check(index);
      else if (value.trim().length > 1) timers.current.set(index, setTimeout(() => check(index), 850));
    }
  }

  function checkMixed() {
    const current = attemptRef.current;
    const answers = current.answers.map((entry, i) => i >= 24 ? checkVerbPatternAnswer(entry, GERUND_INFINITIVE_ITEMS[i]) : entry);
    commit({ ...current, answers, mixedSubmitted: true });
  }

  function reset(from, to) {
    const current = attemptRef.current;
    const answers = current.answers.map((entry, i) => {
      if (i < from || i >= to) return entry;
      clearTimeout(timers.current.get(i));
      // Keep first-check and reveal history honest within the same attempt.
      return { ...entry, value: "", status: "" };
    });
    commit({ ...current, answers, mixedSubmitted: from >= 24 ? false : current.mixedSubmitted });
  }

  async function finish() {
    if (busyRef.current || !attemptRef.current || attemptRef.current.completedAtMs) return;
    const next = { ...attemptRef.current, completedAtMs: Date.now() };
    const details = summariseVerbPatternAttempt(next);
    if (!details.canFinish) return;
    busyRef.current = true; setSaving(true); setError("");
    timers.current.forEach(clearTimeout);
    try {
      await saveGerundInfinitiveActivityEvent("completed", details, user.uid);
      commit(next);
    } catch {
      setError("Your finish could not be saved. Your answers are still here; check your connection and select Finish and save again.");
    } finally { busyRef.current = false; setSaving(false); }
  }

  function renderAnswer(index) {
    const item = GERUND_INFINITIVE_ITEMS[index];
    const entry = attempt.answers[index];
    const mixed = index >= 24;
    const visibleEntry = mixed && !attempt.mixedSubmitted ? { ...entry, status: "" } : entry;
    const number = mixed ? index - 23 : index % 6 + 1;
    const label = mixed ? "Mixed test" : lessons[Math.floor(index / 6)].title;
    return <div className="gi-exercise-row" key={index}>
      <span className="gi-item-num" aria-hidden="true">{number}</span>
      <div>
        <p className="gi-sentence" id={`gi-context-${index}`}>
          {item.before}<input value={entry.value} className={`gi-answer ${visibleEntry.status ? `gi-${visibleEntry.status}` : ""}`}
            style={{ width: `${Math.max(12, Math.min(25, entry.value.length + 2))}ch` }}
            aria-label={`${label}, question ${number}: form of ${item.verb}`}
            aria-describedby={`gi-context-${index} gi-feedback-${index}`} aria-invalid={visibleEntry.status === "retry"}
            autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={60} disabled={finished || saving}
            onChange={(event) => edit(index, event.target.value)}
            onBlur={() => { if (!mixed && entry.status === "") check(index); }}
            onKeyDown={(event) => { if (!mixed && event.key === "Enter") { event.preventDefault(); check(index); } }}
          />{item.after} <span className="gi-verb-prompt">({item.verb})</span>
        </p>
        {!mixed && <div className="gi-actions">
          <button className="gi-check" type="button" disabled={finished || saving} onClick={() => check(index)}>Check</button>
          <button className="gi-reveal" type="button" disabled={finished || saving} onClick={() => check(index, true)}>Show answer</button>
        </div>}
        <p className={`gi-feedback gi-${visibleEntry.status}`} id={`gi-feedback-${index}`} role="status" aria-live="polite">
          {answerFeedback(visibleEntry, item, mixed, Math.floor(index / 6), index % 6)}
        </p>
        {mixed && attempt.mixedSubmitted && visibleEntry.status === "retry" && <button className="gi-reveal" type="button" disabled={finished || saving} onClick={() => check(index, true)}>Show answer</button>}
      </div>
    </div>;
  }

  return <div className="gerund-infinitive">
    <Seo title="Gerund or infinitive? | Verb patterns" description="Explore verb patterns with four practice cards and a 12-question mixed test." />
    <header className="gi-hero">
      <p className="gi-eyebrow">Grammar · Gerunds &amp; infinitives</p>
      <h1>One verb. Two possibilities.</h1>
      <p>Sometimes the meaning stays the same. Sometimes it changes completely. Let the context guide you.</p>
    </header>
    {error && <p className="gi-error" role="alert">{error}</p>}
    {storageWarning && <p className="gi-note" role="status">Browser storage is unavailable. Keep this page open until you finish to preserve your answers.</p>}
    {!attempt ? <>
      <div className="gi-surface gi-intro-card">
        <h2>Gerund or infinitive?</h2><p>Four practice cards, 24 practice gaps and a 12-question mixed test. Your start and finish will be saved to your account.</p>
        <button className="gi-btn" type="button" disabled={saving} onClick={start}>{saving ? "Saving start…" : "Start activity"}</button>
      </div>
      <GerundInfinitiveReferences />
    </> : <>
      <div className="gi-progress" role="status">
        <strong>{summary.answeredCount} / 36 checked</strong><span>{summary.correctCount} correct · {summary.revealedCount} answers shown</span>
      </div>
      <progress className="gi-progress-bar" value={summary.answeredCount} max={36} aria-label="Gaps checked" />
      <nav className="gi-nav" aria-label="Lesson sections">
        {["Overview", ...lessons.map((lesson) => lesson.title), "Mixed test", "Explore"].map((label, i) => <button type="button" key={label} aria-current={page === i ? "step" : undefined} onClick={() => navigate(i)}>{label}</button>)}
      </nav>
      <div className="gi-content" ref={contentRef}>
        {page === 0 && <GerundInfinitiveOverview onNavigate={navigate} />}
        {page >= 1 && page <= 4 && (() => {
          const lesson = lessons[page - 1], card = summary.cards[page - 1];
          return <section aria-labelledby="gi-lesson-title">
            <article className="gi-surface gi-intro-card">
              <div className="gi-section-top"><div><p className="gi-eyebrow">Practice card {page} / 4</p><h2 id="gi-lesson-title" tabIndex={-1}>{lesson.title}</h2></div><span className="gi-score-chip">{card.correctCount} / 6 correct · {card.revealedCount} shown</span></div>
              <h3>{lesson.subtitle}</h3><p className="gi-lesson-copy">{lesson.intro}</p>
              <div className="gi-two-col">
                {["gerund", "infinitive"].map((form) => <div className={`gi-example-box ${form === "gerund" ? "gi-green" : "gi-blue"}`} key={form}>
                  <p className="gi-rule-label">{form === "gerund" ? "Verb + -ing" : "Verb + to + infinitive"}</p>
                  <h3>{lesson[`${form}Title`]}</h3><p className="gi-gloss">{lesson[`${form}Rule`]}</p>
                  <div className="gi-extra-example">{lesson[`${form}Examples`].map((example) => <p className="gi-example" key={example}><LessonCopy html={example} /></p>)}<p className="gi-gloss">{lesson[`${form}Gloss`]}</p></div>
                </div>)}
              </div>
              <p className="gi-note"><LessonCopy html={lesson.note} /></p>
            </article>
            <div className="gi-surface gi-practice">
              <div className="gi-practice-head"><h3>Read the context. Complete the gap.</h3><button className="gi-reset" type="button" disabled={finished || saving} onClick={() => reset((page - 1) * 6, page * 6)}>Reset card</button></div>
              <p className="gi-practice-instruction">Use the verb in brackets. Feedback appears when you pause typing; you can also press Enter or Check. Include <strong>to</strong> when needed.</p>
              {lesson.items.map((_, i) => renderAnswer((page - 1) * 6 + i))}
            </div>
            <div className="gi-pager"><button className="gi-btn gi-secondary" type="button" onClick={() => navigate(page - 1)}>← {page === 1 ? "Overview" : lessons[page - 2].title}</button><button className="gi-btn" type="button" onClick={() => navigate(page + 1)}>Next: {page === 4 ? "mixed test" : lessons[page].title} →</button></div>
          </section>;
        })()}
        {page === 5 && <section aria-labelledby="gi-mixed-title">
          <article className="gi-surface gi-intro-card"><p className="gi-eyebrow">Put it all together · 12 items</p><h2 id="gi-mixed-title" tabIndex={-1}>Mixed practice</h2><p>Remember, forget, stop, try and regret — all mixed together in new contexts. Read carefully and choose the form that best expresses the intended meaning.</p><p className="gi-note">Complete the gaps, then select <strong>Check test</strong> for your score and explanations. Include <strong>to</strong> when needed.</p></article>
          <div className="gi-surface gi-practice">
            <div className="gi-practice-head"><h3>Choose the form from the context.</h3><button className="gi-reset" type="button" disabled={finished || saving} onClick={() => reset(24, 36)}>Reset test</button></div>
            <p className="gi-practice-instruction">Feedback is held until you check the whole test.</p>
            {GERUND_INFINITIVE_ITEMS.slice(24).map((_, i) => renderAnswer(i + 24))}
            {attempt.mixedSubmitted && <p className="gi-card-result" role="status">{summary.mixed.correctCount} / 12 correct · {summary.mixed.revealedCount} shown. Review the explanations, then edit your answers and check again.</p>}
            <div className="gi-test-controls"><button className="gi-btn" type="button" disabled={finished || saving} onClick={checkMixed}>{attempt.mixedSubmitted ? "Check again" : "Check test"}</button><span>{attempt.answers.slice(24).filter((e) => e.value.trim()).length} / 12 filled</span></div>
          </div>
          <div className="gi-pager"><button className="gi-btn gi-secondary" type="button" onClick={() => navigate(4)}>← Back to regret</button><button className="gi-btn" type="button" onClick={() => navigate(6)}>Explore more verbs →</button></div>
        </section>}
        {page === 6 && <GerundInfinitiveExplore onNavigate={navigate} />}
      </div>
      <section className="gi-surface gi-finish" aria-labelledby="gi-finish-title">
        <h2 id="gi-finish-title">{finished ? "Activity saved" : "Save your finish"}</h2>
        <p>{finished ? `Your finish is saved: ${summary.correctCount} / 36 correct, ${summary.revealedCount} answers shown.` : "Check all 36 gaps, then select Finish and save. Incorrect answers count as attempted; shown answers are recorded separately from correct answers."}</p>
        <p className="gi-subtle">{finished ? "Start again for a fresh attempt." : "Your answers stay in this browser when storage is available. Resetting a card keeps its first-check and shown-answer history until you start a fresh attempt."}</p>
        {finished ? <button className="gi-btn" type="button" onClick={start} disabled={saving}>{saving ? "Saving start…" : "Start again"}</button>
          : <button className="gi-btn" type="button" disabled={!summary.canFinish || saving} onClick={finish}>{saving ? "Saving finish…" : `Finish and save${summary.canFinish ? "" : ` (${summary.answeredCount}/36 checked)`}`}</button>}
      </section>
      <GerundInfinitiveReferences />
    </>}
  </div>;
}
