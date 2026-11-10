import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpenCheck, Check, ChevronLeft, ChevronRight, Search, Shuffle, X } from "lucide-react";
import { createHubMiniGrammarQuizLiveGame } from "../../api/liveGames.js";
import { HUB_GRAMMAR_LEVELS } from "../../data/hubGrammarActivities.js";
import { shuffleGrammarItems } from "../grammar/aptisGrammarLive.js";
import { getSitePath } from "../../siteConfig.js";
import {
  buildHubMiniGrammarQuestionBank, filterHubMiniGrammarQuestionBank, generateHubMiniGrammarQuiz,
  getHubMiniGrammarQuestionText, getHubMiniGrammarQuestionAnswer, toggleHubMiniGrammarQuizItem,
  HUB_MINI_GRAMMAR_QUESTION_TYPES, HUB_MINI_GRAMMAR_QUIZ_MAX_QUESTIONS,
} from "../../utils/hubMiniGrammarQuiz.js";
import { hubGrammarReviewCounts } from "../../utils/hubGrammarMistakes.js";

const PAGE_SIZE = 15;

function QuestionPreview({ item }) {
  const answer = useMemo(() => getHubMiniGrammarQuestionAnswer(item), [item]);
  return <details className="hub-mini-quiz-answer"><summary>View answer and feedback</summary>
    <p><strong>{answer.answer}</strong></p>{answer.explanation && <p>{answer.explanation}</p>}
  </details>;
}

export default function HubMiniGrammarQuizBuilder({ isLive, onStartClass, onBusyChange, initialDraft, onDraftChange }) {
  const navigate = useNavigate();
  const bank = useMemo(() => buildHubMiniGrammarQuestionBank(), []);
  const byKey = useMemo(() => new Map(bank.map((item) => [item.key, item])), [bank]);
  const [scope, setScope] = useState(initialDraft?.scope || "all");
  const [testIds, setTestIds] = useState(initialDraft?.testIds || []);
  const [levels, setLevels] = useState(initialDraft?.levels || []);
  const [testSearch, setTestSearch] = useState(initialDraft?.testSearch || "");
  const [selectionMode, setSelectionMode] = useState(initialDraft?.selectionMode || "random");
  const [count, setCount] = useState(initialDraft?.count || 10);
  const [selectedKeys, setSelectedKeys] = useState(initialDraft?.selectedKeys || []);
  const [search, setSearch] = useState(initialDraft?.search || "");
  const [type, setType] = useState(initialDraft?.type || "");
  const [page, setPage] = useState(initialDraft?.page || 0);
  const [title, setTitle] = useState(initialDraft?.title || "Mini grammar class practice");
  const [duration, setDuration] = useState(initialDraft?.duration || 45);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pool = useMemo(() => filterHubMiniGrammarQuestionBank(bank, { scope, testIds, levels }), [bank, scope, testIds, levels]);
  const filteredQuestions = useMemo(() => filterHubMiniGrammarQuestionBank(pool, { search, type }), [pool, search, type]);
  const poolKeys = useMemo(() => new Set(pool.map((item) => item.key)), [pool]);
  const selectedItems = useMemo(() => selectedKeys.map((key) => byKey.get(key)).filter(Boolean), [selectedKeys, byKey]);
  const selectedSet = useMemo(() => new Set(selectedKeys), [selectedKeys]);
  const counts = hubGrammarReviewCounts(pool.length, HUB_MINI_GRAMMAR_QUIZ_MAX_QUESTIONS);
  const selectedCount = counts.includes(count) ? count : counts[0] || 5;
  const pageCount = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const outsideCount = selectedItems.filter((item) => !poolKeys.has(item.key)).length;
  const tests = useMemo(() => {
    const map = new Map();
    for (const item of bank) {
      if (levels.length && !levels.includes(item.level)) continue;
      if (!map.has(item.activityId)) map.set(item.activityId, { id: item.activityId, title: item.activityTitle, level: item.level, count: 0 });
      map.get(item.activityId).count += 1;
    }
    return [...map.values()].sort((a, b) => a.title.localeCompare(b.title));
  }, [bank, levels]);
  const visibleTests = tests.filter((test) => `${test.title} ${test.level}`.toLowerCase().includes(testSearch.trim().toLowerCase()));
  useEffect(() => {
    onDraftChange?.({ scope, testIds, levels, testSearch, selectionMode, count, selectedKeys, search, type, page, title, duration });
  }, [scope, testIds, levels, testSearch, selectionMode, count, selectedKeys, search, type, page, title, duration, onDraftChange]);

  function changePool(change) {
    change();
    setPage(0);
    if (selectionMode === "random") setSelectedKeys([]);
    setError("");
  }

  function changeSelectionMode(mode) {
    setSelectionMode(mode);
    setError("");
    // A generated set can be refined by hand; switching to random starts a fresh set.
    if (mode === "random") setSelectedKeys([]);
  }

  function generate() {
    const items = generateHubMiniGrammarQuiz(pool, selectedCount);
    setSelectedKeys(items.map((item) => item.key));
    setError("");
  }

  async function launch() {
    if (busy || !title.trim() || !selectedItems.length || (isLive && selectedItems.length < 2)) return;
    if (!isLive) {
      onStartClass({ items: selectedItems, title: title.trim(), selectionMode });
      return;
    }
    setBusy(true);
    onBusyChange?.(true);
    setError("");
    try {
      const { gameId } = await createHubMiniGrammarQuizLiveGame({ items: selectedItems, title: title.trim(), questionDuration: duration });
      navigate(getSitePath(`/live/aptis-grammar/host/${gameId}`));
    } catch (cause) {
      console.error("[Mini grammar quiz builder] Live room failed", cause);
      setError(cause.message || "The live room could not be created. Please try again.");
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  }

  return <fieldset className="hub-mini-review-fields" disabled={busy}>
    <legend className="hub-mini-review-sr-only">Build a mini grammar quiz</legend>
    <section className="hub-mini-review-panel">
      <div className="hub-mini-review-heading"><div><h2>Choose your question pool</h2><p>Use the whole bank or choose one or more mini tests. No student selection is needed.</p></div><strong>{pool.length} questions</strong></div>
      <div className="hub-mini-quiz-levels" aria-label="Question levels">
        {HUB_GRAMMAR_LEVELS.filter((level) => bank.some((item) => item.level === level.id)).map((level) => <label key={level.id}><input type="checkbox" checked={levels.includes(level.id)} onChange={() => changePool(() => setLevels((current) => current.includes(level.id) ? current.filter((id) => id !== level.id) : [...current, level.id]))} />{level.label}</label>)}
      </div>
      <p className="hub-mini-review-note">{levels.length ? "Only the selected levels are included in the question pool." : "All levels included. Choose levels to focus your quiz."}</p>
      <div className="hub-mini-review-modes">
        <label><input type="radio" name="bank-test-scope" checked={scope === "all"} onChange={() => changePool(() => setScope("all"))} />All mini tests</label>
        <label><input type="radio" name="bank-test-scope" checked={scope === "selected"} onChange={() => changePool(() => setScope("selected"))} />Choose mini tests</label>
      </div>
      {scope === "selected" && <>
        <label className="hub-mini-review-search"><Search size={18} /><input aria-label="Search mini tests" value={testSearch} onChange={(event) => setTestSearch(event.target.value)} placeholder="Search mini tests or grammar points…" /></label>
        <div className="hub-mini-review-list">{visibleTests.map((test) => <label key={test.id} className="hub-mini-review-choice"><input type="checkbox" checked={testIds.includes(test.id)} onChange={() => changePool(() => setTestIds((ids) => ids.includes(test.id) ? ids.filter((id) => id !== test.id) : [...ids, test.id]))} /><span><strong>{test.title}</strong><small>{test.level?.toUpperCase()} · {test.count} questions</small></span></label>)}{!visibleTests.length && <p>No mini tests match these filters.</p>}</div>
      </>}
    </section>

    <section className="hub-mini-review-panel">
      <div className="hub-mini-review-heading"><div><h2>Choose your questions</h2><p>Generate a random set, or select the exact items you want.</p></div><strong>{selectedItems.length} / {HUB_MINI_GRAMMAR_QUIZ_MAX_QUESTIONS} selected</strong></div>
      <div className="hub-mini-review-modes" aria-label="Question selection method">
        <button type="button" aria-pressed={selectionMode === "random"} onClick={() => changeSelectionMode("random")}><Shuffle size={18} />Random questions</button>
        <button type="button" aria-pressed={selectionMode === "manual"} onClick={() => changeSelectionMode("manual")}><Check size={18} />Choose specific items</button>
      </div>
      {selectionMode === "random" ? <>
        <div className="hub-mini-review-settings"><label>Number of questions<select value={selectedCount} disabled={!pool.length} onChange={(event) => { setCount(Number(event.target.value)); setSelectedKeys([]); }}>{counts.length ? counts.map((value) => <option key={value} value={value}>{value} questions{value > pool.length ? ` · all ${pool.length} available` : ""}</option>) : <option value={5}>5 questions</option>}</select></label>
          <button className="hub-mini-review-primary" type="button" disabled={!pool.length} onClick={generate}><Shuffle size={18} />{selectedItems.length ? "Generate a new set" : "Generate questions"}</button>
        </div>
        <p className="hub-mini-review-note">Random sets use steps of five, up to 50 questions. Your generated set appears below before you start.</p>
      </> : <>
        <div className="hub-mini-review-settings"><label className="hub-mini-review-search"><Search size={18} /><input aria-label="Search questions" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} placeholder="Search questions, words or grammar points…" /></label><label>Question type<select value={type} onChange={(event) => { setType(event.target.value); setPage(0); }}><option value="">All question types</option>{HUB_MINI_GRAMMAR_QUESTION_TYPES.map((format) => <option key={format.id} value={format.id}>{format.label}</option>)}</select></label></div>
        <p className="hub-mini-review-note">{filteredQuestions.length} matching question{filteredQuestions.length === 1 ? "" : "s"}. Pick any number up to 50; your choices are kept when you change filters.</p>
        <div className="hub-mini-quiz-question-list">{filteredQuestions.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE).map((item) => <article key={item.key} className={`hub-mini-quiz-question ${selectedSet.has(item.key) ? "is-selected" : ""}`}>
          <label><input type="checkbox" aria-label={`Select ${item.activityTitle}, question ${item.number}`} checked={selectedSet.has(item.key)} disabled={!selectedSet.has(item.key) && selectedItems.length >= HUB_MINI_GRAMMAR_QUIZ_MAX_QUESTIONS} onChange={() => setSelectedKeys((keys) => toggleHubMiniGrammarQuizItem(keys, item.key))} /><span><small>{item.level?.toUpperCase()} · {item.activityTitle} · Question {item.number} · {HUB_MINI_GRAMMAR_QUESTION_TYPES.find((format) => format.id === (item.question.type || "gap-fill"))?.label}</small><strong>{item.question.prompt}</strong><p>{getHubMiniGrammarQuestionText(item)}</p></span></label>
          {item.question.options && <p className="hub-mini-quiz-options">{item.question.options.join(" · ")}</p>}
          {item.question.imageSrc && <img className="hub-mini-quiz-image" src={item.question.imageSrc} alt={item.question.imageAlt || "Question illustration"} />}
          {item.question.audioSrc && <audio controls preload="none" src={item.question.audioSrc} aria-label={`Audio for question ${item.number}`} />}
          <QuestionPreview item={item} />
        </article>)}</div>
        {!filteredQuestions.length && <p role="status">{scope === "selected" && !testIds.length ? "Choose at least one mini test to see its questions." : "No questions match these filters."}</p>}
        {pageCount > 1 && <div className="hub-mini-quiz-pagination"><button type="button" className="hub-mini-review-text-button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={17} />Previous</button><span>Page {currentPage + 1} of {pageCount}</span><button type="button" className="hub-mini-review-text-button" disabled={currentPage >= pageCount - 1} onClick={() => setPage(currentPage + 1)}>Next<ChevronRight size={17} /></button></div>}
      </>}
    </section>

    <section className="hub-mini-review-panel">
      <div className="hub-mini-review-heading"><div><h2><BookOpenCheck size={21} />Your quiz</h2><p>Check your selected questions, then start class practice or host them live.</p></div><strong>{selectedItems.length} question{selectedItems.length === 1 ? "" : "s"}</strong></div>
      {selectedItems.length ? <>
        <div className="hub-mini-quiz-selection-actions"><button className="hub-mini-review-text-button" type="button" disabled={selectedItems.length < 2} onClick={() => setSelectedKeys(shuffleGrammarItems(selectedKeys))}><Shuffle size={16} />Shuffle question order</button><button className="hub-mini-review-text-button" type="button" onClick={() => setSelectedKeys([])}>Clear selection</button></div>
        {outsideCount > 0 && <p className="hub-mini-review-note">{outsideCount} selected question{outsideCount === 1 ? " is" : "s are"} outside the current test or level filters. Remove them below if you want to narrow your set.</p>}
        <ol className="hub-mini-quiz-selected">{selectedItems.map((item) => <li key={item.key}><div><small>{item.activityTitle} · Question {item.number}</small><p>{getHubMiniGrammarQuestionText(item)}</p>{item.question.imageSrc && <img className="hub-mini-quiz-image" src={item.question.imageSrc} alt={item.question.imageAlt || "Question illustration"} />}{item.question.audioSrc && <audio controls preload="none" src={item.question.audioSrc} aria-label={`Audio for selected question ${item.number}`} />}<QuestionPreview item={item} /></div><button type="button" className="hub-mini-review-text-button" aria-label={`Remove ${item.activityTitle}, question ${item.number}`} onClick={() => setSelectedKeys((keys) => keys.filter((key) => key !== item.key))}><X size={18} /></button></li>)}</ol>
      </> : <p className="hub-mini-review-note">{selectionMode === "random" ? "Generate questions above to build your set." : "Select questions above to build your set."}</p>}
      <div className="hub-mini-review-settings"><label>Quiz title<input maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} /></label>{isLive && <label>Time per question<select value={duration} onChange={(event) => setDuration(Number(event.target.value))}>{[15, 20, 30, 45, 60, 90].map((seconds) => <option key={seconds} value={seconds}>{seconds} seconds</option>)}</select></label>}</div>
      {error && <div className="hub-mini-review-error" role="alert"><p>{error}</p></div>}
      <button type="button" className="hub-mini-review-primary" disabled={busy || !title.trim() || !selectedItems.length || (isLive && selectedItems.length < 2)} onClick={launch}>{busy ? "Creating your room…" : isLive ? `Host ${selectedItems.length} questions live` : `Start ${selectedItems.length} ${selectedItems.length === 1 ? "question" : "questions"}`}</button>
      {isLive && selectedItems.length === 1 && <p className="hub-mini-review-note">Choose at least two questions for a live quiz.</p>}
    </section>
  </fieldset>;
}
