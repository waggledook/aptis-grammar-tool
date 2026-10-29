import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Check, ChevronLeft, ChevronRight, Copy, Dices, Eye, Library, ListChecks, Plus, Radio, Save, Search, Shuffle, SlidersHorizontal, Trash2, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import grammarItems from "../../../scripts/grammar-items.json";
import { createAptisGrammarLiveGame } from "../../api/liveGames.js";
import { createGrammarSet, listMyGrammarSets, updateGrammarSet } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import Seo from "../common/Seo.jsx";
import { APTIS_GRAMMAR_LEVELS, APTIS_GRAMMAR_MAX_QUESTIONS, buildGrammarLiveItems, buildGrammarQuestionBank, filterGrammarQuestions, generateGrammarQuiz, shuffleGrammarItems } from "../grammar/aptisGrammarLive.js";
import "./TeacherAptisGrammarLiveBuilder.css";

const BANK = buildGrammarQuestionBank(grammarItems);
const LOOKUP = new Map(BANK.map((item) => [item.id, item]));
const TAGS = [...new Set(BANK.flatMap((item) => item.tags))].sort();

function readDraft(key) {
  try { return JSON.parse(window.localStorage.getItem(key)) || {}; } catch { return {}; }
}

function toggleValue(values, value) {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

function QuestionContent({ item, showAnswer = false }) {
  return <>
    <div className="agl-meta"><span className={`agl-level agl-level-${item.level.toLowerCase()}`}>{item.level}</span><span>{item.tags.join(" · ")}</span></div>
    <p className="agl-sentence">{item.sentence}</p>
    <div className="agl-options">{item.options.map((option, index) => <span key={index} className={showAnswer && index === item.answerIndex ? "is-correct" : ""}><b>{String.fromCharCode(65 + index)}</b>{option}{showAnswer && index === item.answerIndex && <Check size={14} />}</span>)}</div>
    {showAnswer && item.explanations?.[item.answerIndex] && <p className="agl-explanation">{item.explanations[item.answerIndex]}</p>}
  </>;
}

export default function TeacherAptisGrammarLiveBuilder({ user }) {
  const navigate = useNavigate();
  const storageKey = `aptisGrammarLiveDraft:${user.uid}`;
  const [draft] = useState(() => readDraft(storageKey));
  const [levels, setLevels] = useState(() => (draft.levels || []).filter((level) => APTIS_GRAMMAR_LEVELS.includes(level)));
  const [tags, setTags] = useState(() => (draft.tags || []).filter((tag) => TAGS.includes(tag)));
  const [search, setSearch] = useState(draft.search || "");
  const [tagSearch, setTagSearch] = useState("");
  const [allTags, setAllTags] = useState(false);
  const [count, setCount] = useState(draft.count || 10);
  const [selectedIds, setSelectedIds] = useState(() => [...new Set(draft.selectedIds || [])].filter((id) => LOOKUP.has(id)).slice(0, APTIS_GRAMMAR_MAX_QUESTIONS));
  const [title, setTitle] = useState(draft.title || "My Aptis grammar quiz");
  const [duration, setDuration] = useState(draft.duration || 30);
  const [practiceMode, setPracticeMode] = useState(draft.practiceMode || "practice");
  const [savedId, setSavedId] = useState(draft.savedId || "");
  const [visibility, setVisibility] = useState(draft.visibility || "draft");
  const [savedSets, setSavedSets] = useState([]);
  const [savedError, setSavedError] = useState("");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const previewRef = useRef(null);
  const libraryRef = useRef(null);
  const selectedItems = useMemo(() => selectedIds.map((id) => LOOKUP.get(id)).filter(Boolean), [selectedIds]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const filtered = useMemo(() => filterGrammarQuestions(BANK, { levels, tags, search }), [levels, tags, search]);
  const levelPool = useMemo(() => filterGrammarQuestions(BANK, { levels }), [levels]);
  const tagCounts = useMemo(() => levelPool.reduce((counts, item) => {
    item.tags.forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1));
    return counts;
  }, new Map()), [levelPool]);
  const tagOptions = TAGS.filter((tag) => tag.toLowerCase().includes(tagSearch.trim().toLowerCase()));
  const visibleTags = allTags || tagSearch ? tagOptions : tagOptions.filter((tag, index) => index < 8 || tags.includes(tag));
  const targetCount = Math.max(1, Math.min(APTIS_GRAMMAR_MAX_QUESTIONS, Math.floor(Number(count) || 10)));
  const previewItem = selectedItems[Math.min(previewIndex, selectedItems.length - 1)];
  const practiceUrl = savedId && visibility === "published" ? `${window.location.origin}${getSitePath(`/grammar-sets/${savedId}`)}` : "";

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ levels, tags, search, count, selectedIds, title, duration, practiceMode, savedId, visibility }));
    } catch { /* The builder still works when browser storage is unavailable. */ }
  }, [storageKey, levels, tags, search, count, selectedIds, title, duration, practiceMode, savedId, visibility]);

  useEffect(() => {
    let active = true;
    listMyGrammarSets().then((sets) => {
      if (active) setSavedSets(sets.filter((set) => Array.isArray(set.itemIds) && set.itemIds.some((id) => LOOKUP.has(id))));
    }).catch(() => { if (active) setSavedError("Saved quizzes couldn’t be loaded. You can still build and host a new quiz."); });
    return () => { active = false; };
  }, [user.uid]);

  useEffect(() => {
    if (libraryRef.current) libraryRef.current.scrollTop = 0;
  }, [levels, tags, search]);

  function selectItem(id) {
    setNotice("");
    setError("");
    if (!selectedSet.has(id) && selectedIds.length >= APTIS_GRAMMAR_MAX_QUESTIONS) {
      setError("A quiz can contain up to 50 questions. Remove one to add another.");
      return;
    }
    setSelectedIds((previous) => toggleValue(previous, id));
  }

  function generate(keepSelected = false) {
    const next = generateGrammarQuiz(filtered, targetCount, keepSelected ? selectedIds : []);
    setSelectedIds(next);
    setError("");
    setNotice(next.length < targetCount
      ? `Only ${next.length} unique questions are available with these filters. Broaden the levels or topics for more.`
      : `${next.length} questions ready. You can add, remove or reorder any question.`);
  }

  function move(index, direction) {
    setSelectedIds((previous) => {
      const next = [...previous];
      [next[index], next[index + direction]] = [next[index + direction], next[index]];
      return next;
    });
  }

  function loadSaved(id) {
    const set = savedSets.find((entry) => entry.id === id);
    if (!set) return;
    const ids = [...new Set(set.itemIds)].filter((itemId) => LOOKUP.has(itemId)).slice(0, APTIS_GRAMMAR_MAX_QUESTIONS);
    setSelectedIds(ids); setTitle(set.title || "My Aptis grammar quiz");
    setSavedId(set.id); setVisibility(set.visibility || "draft");
    setDuration(set.liveQuestionDuration || 30);
    setPracticeMode(set.testMode ? set.reviewAfterTest ? "test-review" : "test" : "practice");
    setError(""); setNotice(`Opened “${set.title}”. ${ids.length} questions loaded.`);
  }

  async function saveQuiz(publish = false) {
    if (busy) return;
    if (!title.trim() || !selectedItems.length) { setError("Add a quiz title and at least one question before saving."); return; }
    setBusy(publish ? "publish" : "save"); setError(""); setNotice("");
    const payload = {
      title: title.trim(), description: "A bespoke Aptis grammar quiz created in Classroom Resources.",
      itemIds: selectedIds, levels: [...new Set(selectedItems.map((item) => item.level))],
      tags: [...new Set(selectedItems.flatMap((item) => item.tags))],
      visibility: publish || visibility === "published" ? "published" : "draft",
      testMode: practiceMode !== "practice", reviewAfterTest: practiceMode === "test-review",
      builder: "aptis-grammar-live", liveQuestionDuration: Number(duration),
    };
    try {
      const id = savedId || await createGrammarSet(payload);
      if (savedId) await updateGrammarSet(savedId, payload);
      setSavedId(id); setVisibility(payload.visibility);
      setSavedSets((sets) => [{ ...payload, id }, ...sets.filter((set) => set.id !== id)]);
      setNotice(publish ? "Quiz saved. Your practice link is ready below." : "Quiz saved. Reopen it from Saved quizzes whenever you need it.");
    } catch (cause) { setError(cause.message || "Couldn’t save the quiz. Your browser draft is still here."); }
    finally { setBusy(""); }
  }

  async function hostQuiz() {
    if (busy) return;
    if (!title.trim() || selectedItems.length < 2) { setError("Add a title and at least two questions to host a live quiz."); return; }
    setBusy("host"); setError("");
    try {
      const { gameId } = await createAptisGrammarLiveGame({ title: title.trim(), items: buildGrammarLiveItems(selectedItems), questionDuration: Number(duration) });
      navigate(getSitePath(`/live/aptis-grammar/host/${gameId}`));
    } catch (cause) { setError(cause.message || "Couldn’t create the live room. Please try again."); }
    finally { setBusy(""); }
  }

  async function copyPracticeLink() {
    try { await navigator.clipboard.writeText(practiceUrl); setNotice("Practice link copied."); }
    catch { setError("Couldn’t copy the link. You can select and copy it below."); }
  }

  return <main className="agl-page">
    <Seo title="Aptis Grammar Quiz Studio | Seif English" description="Create bespoke Aptis grammar quizzes and live classroom activities by level and grammar topic." />
    <Link className="agl-back" to={getSitePath("/teacher-resources")}><ArrowLeft size={16} /> Classroom resources</Link>
    <header className="agl-hero">
      <div><p className="agl-eyebrow"><span /> Teacher workspace · Aptis</p><h1>Grammar Quiz Studio<span>.</span></h1><p>A little practice. A friendly challenge. A quiz that fits your class.</p></div>
      <div className="agl-bank-stat"><Library size={22} /><strong>{BANK.length}</strong><span>questions to make your own</span></div>
    </header>
    <div className="agl-workflow"><span><SlidersHorizontal size={16} /> 1. Find your focus</span><i /><span><ListChecks size={16} /> 2. Make it yours</span><i /><span><Radio size={16} /> 3. Bring it to class</span></div>

    <fieldset className="agl-workspace" disabled={!!busy}>
      <legend className="agl-sr-only">Grammar quiz builder</legend>
      <div className="agl-main-column">
        <section className="agl-panel agl-filters" aria-labelledby="agl-focus-title">
          <div className="agl-section-heading"><div><p className="agl-eyebrow">Find your focus</p><h2 id="agl-focus-title">What are we practising?</h2></div>{(levels.length > 0 || tags.length > 0 || search) && <button className="agl-text-button" type="button" onClick={() => { setLevels([]); setTags([]); setSearch(""); setTagSearch(""); }}>Reset filters</button>}</div>
          <div className="agl-filter-row"><span className="agl-field-label">CEFR levels</span><div className="agl-chips"><button className={!levels.length ? "is-active" : ""} type="button" aria-pressed={!levels.length} onClick={() => setLevels([])}>All levels</button>{APTIS_GRAMMAR_LEVELS.map((level) => <button className={levels.includes(level) ? "is-active" : ""} type="button" aria-pressed={levels.includes(level)} onClick={() => setLevels(toggleValue(levels, level))} key={level}>{level}</button>)}</div></div>
          <div className="agl-topic-heading"><span className="agl-field-label">Grammar topics <small>Any selected topic</small></span><label className="agl-topic-search"><Search size={14} /><input aria-label="Find a grammar topic" placeholder="Find a topic…" value={tagSearch} onChange={(event) => setTagSearch(event.target.value)} /></label></div>
          <div className="agl-chips agl-topics"><button type="button" className={!tags.length ? "is-active" : ""} aria-pressed={!tags.length} onClick={() => setTags([])}>All topics</button>{visibleTags.map((tag) => <button key={tag} type="button" className={tags.includes(tag) ? "is-active" : ""} aria-pressed={tags.includes(tag)} onClick={() => setTags(toggleValue(tags, tag))}>{tags.includes(tag) && <Check size={12} />}{tag}<small>{tagCounts.get(tag) || 0}</small></button>)}</div>
          {!tagSearch && <button className="agl-text-button agl-more-topics" type="button" onClick={() => setAllTags(!allTags)}>{allTags ? "Show fewer topics" : `See all ${TAGS.length} topics`}</button>}
          <div className="agl-generator"><div><Dices size={23} /><div><strong>Let’s mix things up</strong><p>Random questions from your current filters. No filters? Anything goes.</p></div></div><div className="agl-generate-controls"><label>Questions<input type="number" min={1} max={50} value={count} onChange={(event) => setCount(event.target.value)} onBlur={() => setCount(targetCount)} /></label><button className="agl-button agl-primary" type="button" disabled={!filtered.length} onClick={() => generate()}><Shuffle size={16} /> Generate quiz</button></div></div>
          {selectedIds.length > 0 && <p className="agl-generation-note">Generate replaces your current selection. <button className="agl-text-button" type="button" disabled={selectedIds.length >= targetCount || !filtered.some((item) => !selectedSet.has(item.id))} onClick={() => generate(true)}>Keep my picks &amp; top up to {targetCount}</button></p>}
        </section>

        <section className="agl-library" aria-labelledby="agl-bank-title">
          <div className="agl-section-heading"><div><h2 id="agl-bank-title">The question library <span>{filtered.length}</span></h2><p>Scroll through the questions and add your favourites.</p></div><label className="agl-answer-toggle"><input type="checkbox" checked={showAnswers} onChange={(event) => setShowAnswers(event.target.checked)} /> Show answers</label></div>
          <label className="agl-search"><Search size={18} /><input aria-label="Search grammar questions" placeholder="Search sentences, answers or topics…" value={search} onChange={(event) => setSearch(event.target.value)} /><span>{filtered.length} matches</span></label>
          {filtered.length > 0 && <ul className="agl-question-list" ref={libraryRef} aria-label="Grammar question library" tabIndex={0}>{filtered.map((item) => <li className={`agl-question ${selectedSet.has(item.id) ? "is-selected" : ""}`} key={item.id}><div className="agl-question-content"><QuestionContent item={item} showAnswer={showAnswers} /></div><button className="agl-pick" type="button" aria-pressed={selectedSet.has(item.id)} aria-label={`${selectedSet.has(item.id) ? "Remove" : "Add"} question: ${item.sentence}`} onClick={() => selectItem(item.id)}>{selectedSet.has(item.id) ? <Check size={16} /> : <Plus size={16} />}{selectedSet.has(item.id) ? "In your quiz" : "Add to quiz"}</button></li>)}</ul>}
          {!filtered.length && <div className="agl-empty"><Search size={26} /><h3>No questions found</h3><p>Try a different level, topic or search term. Your quiz selection is kept.</p></div>}
        </section>
      </div>

      <aside className="agl-panel agl-quiz" aria-labelledby="agl-quiz-title">
        <div className="agl-section-heading"><div><p className="agl-eyebrow">Make it yours</p><h2 id="agl-quiz-title">Your quiz <span>{selectedIds.length}</span></h2></div><ListChecks size={24} /></div>
        <label className="agl-label">Quiz title<input value={title} maxLength={120} onChange={(event) => setTitle(event.target.value)} placeholder="Give your quiz a name" /></label>
        <div className="agl-selection-toolbar"><span>{selectedIds.length} / 50 questions</span><div><button className="agl-icon-button" type="button" title="Shuffle question order" aria-label="Shuffle question order" disabled={selectedIds.length < 2} onClick={() => setSelectedIds(shuffleGrammarItems(selectedIds))}><Shuffle size={15} /></button><button className="agl-icon-button" type="button" title="Clear quiz selection" aria-label="Clear quiz selection" disabled={!selectedIds.length} onClick={() => { setSelectedIds([]); setNotice("Selection cleared. Add questions or generate a new quiz."); }}><Trash2 size={15} /></button></div></div>
        {selectedItems.length ? <ol className="agl-selected-list">{selectedItems.map((item, index) => <li key={item.id}><span className="agl-order">{index + 1}</span><div><p>{item.sentence}</p><small>{item.level} · {item.tags.join(" · ")}</small></div><div className="agl-reorder"><button className="agl-icon-button" type="button" disabled={index === 0} aria-label={`Move question ${index + 1} up`} onClick={() => move(index, -1)}><ArrowUp size={13} /></button><button className="agl-icon-button" type="button" disabled={index === selectedIds.length - 1} aria-label={`Move question ${index + 1} down`} onClick={() => move(index, 1)}><ArrowDown size={13} /></button><button className="agl-icon-button" type="button" aria-label={`Remove question ${index + 1}`} onClick={() => selectItem(item.id)}><X size={14} /></button></div></li>)}</ol> : <div className="agl-empty agl-selection-empty"><ListChecks size={30} /><h3>Your class, your questions</h3><p>Generate a quiz or pick individual questions from the library.</p></div>}
        <button className="agl-button agl-secondary agl-full" type="button" disabled={!selectedIds.length} onClick={() => { setPreviewIndex(0); previewRef.current.showModal(); }}><Eye size={16} /> Preview quiz</button>
        <div className="agl-session-settings"><label className="agl-label">Live question timer<select value={duration} onChange={(event) => setDuration(Number(event.target.value))}>{[15, 20, 30, 45, 60, 90].map((seconds) => <option value={seconds} key={seconds}>{seconds} seconds</option>)}</select></label><label className="agl-label">Independent practice feedback<select value={practiceMode} onChange={(event) => setPracticeMode(event.target.value)}><option value="practice">After each question</option><option value="test-review">At the end, with review</option><option value="test">At the end, score only</option></select></label></div>
        <button className="agl-button agl-live agl-full" type="button" disabled={selectedItems.length < 2 || !title.trim()} onClick={hostQuiz}><Radio size={17} />{busy === "host" ? "Creating your room…" : "Host live activity"}</button>
        <p className="agl-action-hint">Students join with a PIN. You control the pace.<br />At least 2 questions · timed answers · class scores</p>
        <div className="agl-save-actions"><button className="agl-button agl-secondary" type="button" disabled={!selectedItems.length || !title.trim()} onClick={() => saveQuiz()}><Save size={15} />{busy === "save" ? "Saving…" : "Save quiz"}</button><button className="agl-button agl-secondary" type="button" disabled={!selectedItems.length || !title.trim()} onClick={() => saveQuiz(true)}><Copy size={15} />{busy === "publish" ? "Saving…" : "Practice link"}</button></div>
        {practiceUrl && <div className="agl-share"><a href={practiceUrl} target="_blank" rel="noreferrer">Open saved practice quiz</a><input aria-label="Saved practice quiz link" readOnly value={practiceUrl} onFocus={(event) => event.target.select()} /><button className="agl-text-button" type="button" onClick={copyPracticeLink}>Copy saved link</button><small>Save again to include your latest changes.</small></div>}
        <div className="agl-saved"><label className="agl-label">Saved quizzes<select value="" onChange={(event) => loadSaved(event.target.value)}><option value="">Reopen a saved quiz…</option>{savedSets.map((set) => <option key={set.id} value={set.id}>{set.title} ({set.itemIds.length})</option>)}</select></label>{savedId && <button className="agl-text-button" type="button" onClick={() => { setSavedId(""); setVisibility("draft"); setNotice("Your next save will create a separate copy."); }}>Save next as a new copy</button>}{savedError && <p className="agl-action-hint">{savedError}</p>}<p className="agl-draft-note">Your current work is also kept in this browser.</p></div>
      </aside>
    </fieldset>
    <div className="agl-status" aria-live="polite">{notice && <div className="agl-notice"><Check size={17} /><span>{notice}</span><button className="agl-icon-button" type="button" aria-label="Dismiss notification" onClick={() => setNotice("")}><X size={16} /></button></div>}</div>
    {error && <div className="agl-error" role="alert"><span>{error}</span><button className="agl-icon-button" type="button" aria-label="Dismiss error" onClick={() => setError("")}><X size={16} /></button></div>}

    <dialog className="agl-preview" ref={previewRef}>
      <div className="agl-section-heading"><div><p className="agl-eyebrow">Quiz preview · {selectedItems.length} questions</p><h2>{title}</h2></div><button className="agl-icon-button" type="button" aria-label="Close preview" onClick={() => previewRef.current.close()}><X size={21} /></button></div>
      {previewItem && <div className="agl-preview-question"><span className="agl-field-label">Question {previewIndex + 1}</span><QuestionContent item={previewItem} showAnswer={showAnswers} /><label className="agl-answer-toggle"><input type="checkbox" checked={showAnswers} onChange={(event) => setShowAnswers(event.target.checked)} /> Show answers &amp; explanations</label></div>}
      <div className="agl-pagination"><button className="agl-button agl-secondary" type="button" disabled={previewIndex === 0} onClick={() => setPreviewIndex(previewIndex - 1)}><ChevronLeft size={16} /> Previous</button><span>{previewIndex + 1} / {selectedItems.length}</span><button className="agl-button agl-secondary" type="button" disabled={previewIndex >= selectedItems.length - 1} onClick={() => setPreviewIndex(previewIndex + 1)}>Next <ChevronRight size={16} /></button></div>
    </dialog>
  </main>;
}
