import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Dices,
  Grid2X2,
  MousePointerClick,
  PenLine,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Seo from "../common/Seo.jsx";
import { createTextbookVocabLiveGame } from "../../api/liveGames.js";
import {
  getVisibleHubVocabThemes,
  HUB_VOCAB_LEVEL_COLORS,
  HUB_VOCAB_LEVELS,
} from "../../data/hubVocabularyActivities.js";
import { getSitePath } from "../../siteConfig.js";
import { toast } from "../../utils/toast.js";
import {
  buildTextbookVocabCuratedLiveItems,
  buildTextbookVocabLiveQuestions,
  buildTextbookVocabRandomLiveItems,
  getTextbookVocabLiveMode,
  TEXTBOOK_VOCAB_LIVE_MODES,
} from "./textbookVocabLive.js";
import "./textbookVocabTeacherTools.css";

const MAX_QUESTIONS = 50;
const QUESTION_PAGE_SIZE = 48;
const DEFAULT_MODE_DURATIONS = Object.fromEntries(
  TEXTBOOK_VOCAB_LIVE_MODES.map((mode) => [mode.id, mode.defaultDuration])
);

const MODE_ICONS = {
  "multiple-choice": MousePointerClick,
  write: PenLine,
  matching: Grid2X2,
};

function correctAnswer(question) {
  return question.answer || question.options?.[question.answerIndex] || "";
}

function dedupeQuestions(questions) {
  const seen = new Set();
  return questions.filter((question) => {
    const signature = [
      question.sourceThemeId,
      String(question.sentence || "").trim().toLowerCase(),
      String(correctAnswer(question)).trim().toLowerCase(),
    ].join("::");
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
}

function moveItem(items, index, direction) {
  const destination = index + direction;
  if (destination < 0 || destination >= items.length) return items;
  const next = [...items];
  [next[index], next[destination]] = [next[destination], next[index]];
  return next;
}

function QuestionCard({ question, selected, onToggle, number }) {
  return (
    <article className={`textbook-live-question${selected ? " is-selected" : ""}`}>
      <button type="button" className="textbook-live-question-toggle" onClick={onToggle}>
        <span className="textbook-live-question-check" aria-hidden="true">{selected ? <Check size={16} /> : number}</span>
        <span>
          <small>{question.sourceThemeTitle} · {question.sourceActivityTitle}</small>
          <strong>{question.sentence}</strong>
          <em>Answer: {correctAnswer(question)}</em>
        </span>
      </button>
      {question.image ? <img src={question.image} alt={question.imageAlt || ""} loading="lazy" /> : null}
      {!question.image && question.colorHex ? (
        <span className="textbook-live-question-colour" style={{ background: question.colorHex }} aria-label="Colour question preview" />
      ) : null}
    </article>
  );
}

export default function TextbookVocabLiveBuilder({ user }) {
  const navigate = useNavigate();
  const themes = useMemo(() => getVisibleHubVocabThemes(user), [user]);
  const allQuestions = useMemo(() => buildTextbookVocabLiveQuestions(user), [user]);
  const [selectedInteractionTypes, setSelectedInteractionTypes] = useState(
    () => TEXTBOOK_VOCAB_LIVE_MODES.map((liveMode) => liveMode.id)
  );
  const [bankMode, setBankMode] = useState("all");
  const [selectedThemeIds, setSelectedThemeIds] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [mode, setMode] = useState("random");
  const [questionCount, setQuestionCount] = useState(10);
  const [randomSeed, setRandomSeed] = useState(() => Date.now());
  const [curatedIds, setCuratedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [visibleQuestionCount, setVisibleQuestionCount] = useState(QUESTION_PAGE_SIZE);
  const [title, setTitle] = useState("Textbook Vocabulary Quiz");
  const [modeDurations, setModeDurations] = useState(DEFAULT_MODE_DURATIONS);
  const [curatedFormats, setCuratedFormats] = useState({});
  const [creating, setCreating] = useState(false);

  const sourcePool = useMemo(() => {
    const selectedThemes = new Set(selectedThemeIds);
    const levels = new Set(selectedLevels);
    return dedupeQuestions(allQuestions.filter((question) => {
      if (bankMode === "selected" && !selectedThemes.has(question.sourceThemeId)) return false;
      if (levels.size && !levels.has(question.level)) return false;
      return true;
    }));
  }, [allQuestions, bankMode, selectedLevels, selectedThemeIds]);
  const minimumRandomRounds = selectedInteractionTypes.length === 1
    ? selectedInteractionTypes[0] === "matching" ? 1 : 2
    : selectedInteractionTypes.length;

  useEffect(() => {
    const availableIds = new Set(sourcePool.map((question) => question.id));
    setCuratedIds((previous) => previous.filter((id) => availableIds.has(id)).slice(0, MAX_QUESTIONS));
    setQuestionCount((previous) => Math.max(minimumRandomRounds, Math.min(previous, MAX_QUESTIONS)));
  }, [minimumRandomRounds, sourcePool]);

  useEffect(() => {
    setVisibleQuestionCount(QUESTION_PAGE_SIZE);
  }, [search, sourcePool]);

  const questionsById = useMemo(
    () => new Map(sourcePool.map((question) => [question.id, question])),
    [sourcePool]
  );
  const curatedQuestions = useMemo(
    () => curatedIds.map((id) => questionsById.get(id)).filter(Boolean),
    [curatedIds, questionsById]
  );
  const effectiveCuratedFormats = useMemo(() => Object.fromEntries(curatedIds.map((id, index) => [
    id,
    selectedInteractionTypes.includes(curatedFormats[id])
      ? curatedFormats[id]
      : selectedInteractionTypes[index % selectedInteractionTypes.length],
  ])), [curatedFormats, curatedIds, selectedInteractionTypes]);
  const quizItems = useMemo(() => {
    if (mode === "random") return buildTextbookVocabRandomLiveItems(sourcePool, {
      interactionTypes: selectedInteractionTypes,
      count: Math.min(questionCount, MAX_QUESTIONS),
      seed: randomSeed,
    });
    return buildTextbookVocabCuratedLiveItems(curatedQuestions, effectiveCuratedFormats);
  }, [curatedQuestions, effectiveCuratedFormats, mode, questionCount, randomSeed, selectedInteractionTypes, sourcePool]);
  const usedCuratedIds = useMemo(() => new Set(quizItems.flatMap((item) => (
    item.interactionType === "matching" ? item.pairs.map((pair) => pair.id) : [item.id]
  ))), [quizItems]);
  const unusedMatchingItems = mode === "curated"
    ? curatedIds.filter((id) => effectiveCuratedFormats[id] === "matching" && !usedCuratedIds.has(id)).length
    : 0;
  const minimumItems = quizItems.length > 0 && quizItems.every((item) => item.interactionType === "matching") ? 1 : 2;
  const canCreate = quizItems.length >= minimumItems && unusedMatchingItems === 0;
  const activeQuizInteractionTypes = quizItems.length
    ? [...new Set(quizItems.map((item) => item.interactionType))]
    : selectedInteractionTypes;

  const filteredQuestions = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return sourcePool;
    return sourcePool.filter((question) => [
      question.sentence,
      correctAnswer(question),
      question.sourceThemeTitle,
      question.sourceActivityTitle,
      question.textbookRef,
      question.level,
    ].filter(Boolean).join(" ").toLowerCase().includes(needle));
  }, [search, sourcePool]);
  const displayedQuestions = filteredQuestions.slice(0, visibleQuestionCount);

  function toggleTheme(themeId) {
    setSelectedThemeIds((previous) => (
      previous.includes(themeId) ? previous.filter((id) => id !== themeId) : [...previous, themeId]
    ));
  }

  function toggleLevel(levelId) {
    setSelectedLevels((previous) => (
      previous.includes(levelId) ? previous.filter((id) => id !== levelId) : [...previous, levelId]
    ));
  }

  function toggleInteractionType(nextType) {
    setSelectedInteractionTypes((previous) => {
      if (!previous.includes(nextType)) return [...previous, nextType];
      if (previous.length === 1) {
        toast("Keep at least one activity format selected.");
        return previous;
      }
      return previous.filter((type) => type !== nextType);
    });
  }

  function toggleCuratedQuestion(questionId) {
    if (curatedIds.includes(questionId)) {
      setCuratedIds((previous) => previous.filter((id) => id !== questionId));
      setCuratedFormats((previous) => {
        const next = { ...previous };
        delete next[questionId];
        return next;
      });
      return;
    }
    if (curatedIds.length >= MAX_QUESTIONS) {
      toast(`Choose up to ${MAX_QUESTIONS} vocabulary items.`);
      return;
    }
    const defaultFormat = selectedInteractionTypes[curatedIds.length % selectedInteractionTypes.length];
    setCuratedIds((previous) => [...previous, questionId]);
    setCuratedFormats((previous) => ({ ...previous, [questionId]: defaultFormat }));
  }

  function selectVisibleQuestions() {
    setCuratedIds((previous) => {
      const next = [...previous];
      for (const question of filteredQuestions) {
        if (next.length >= MAX_QUESTIONS) break;
        if (!next.includes(question.id)) next.push(question.id);
      }
      setCuratedFormats((previousFormats) => ({
        ...previousFormats,
        ...Object.fromEntries(next.map((id, index) => [
          id,
          selectedInteractionTypes.includes(previousFormats[id])
            ? previousFormats[id]
            : selectedInteractionTypes[index % selectedInteractionTypes.length],
        ])),
      }));
      return next;
    });
  }

  function setCuratedQuestionFormat(questionId, interactionType) {
    setCuratedFormats((previous) => ({ ...previous, [questionId]: interactionType }));
  }

  function setModeDuration(interactionType, duration) {
    setModeDurations((previous) => ({ ...previous, [interactionType]: Number(duration) }));
  }

  async function createQuiz() {
    if (quizItems.length < minimumItems) {
      toast(selectedInteractionTypes.length === 1 && selectedInteractionTypes[0] === "matching"
        ? "Choose at least four vocabulary items for one matching round."
        : "Choose enough vocabulary for at least two live rounds.");
      return;
    }
    if (unusedMatchingItems) {
      toast("Finish or remove the incomplete matching group before creating the lobby.");
      return;
    }
    setCreating(true);
    try {
      const { gameId } = await createTextbookVocabLiveGame({
        items: quizItems,
        title,
        modeDurations,
      });
      navigate(getSitePath(`/live/textbook-vocabulary/host/${gameId}`));
    } catch (error) {
      console.error("[TextbookVocabLiveBuilder] create failed", error);
      toast(error.message || "Could not create the vocabulary quiz.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="textbook-live-builder">
      <Seo title="Live Textbook Vocabulary Quiz | Seif Hub" description="Build a live vocabulary quiz from textbook banks." />
      <header className="textbook-live-hero">
        <div>
          <span className="textbook-live-kicker"><Users size={16} /> Teacher live activity</span>
          <h1>Build a textbook vocabulary quiz</h1>
          <p>Mix activity formats, choose the vocabulary, then open the live room.</p>
        </div>
        <button type="button" className="review-btn" onClick={() => navigate(getSitePath("/vocabulary/textbook"))}>
          Back to vocabulary banks
        </button>
      </header>

      <section className="textbook-live-panel">
        <div className="textbook-live-panel-head">
          <div><span>1</span><div><h2>Choose the activity formats</h2><p>Select one, several, or all three formats for this session.</p></div></div>
          <button type="button" className="review-btn" onClick={() => setSelectedInteractionTypes(TEXTBOOK_VOCAB_LIVE_MODES.map((liveMode) => liveMode.id))}>Use all formats</button>
        </div>
        <div className="textbook-live-interaction-grid">
          {TEXTBOOK_VOCAB_LIVE_MODES.map((liveMode) => {
            const ModeIcon = MODE_ICONS[liveMode.id];
            return (
              <button
                key={liveMode.id}
                type="button"
                className={selectedInteractionTypes.includes(liveMode.id) ? "active" : ""}
                aria-pressed={selectedInteractionTypes.includes(liveMode.id)}
                onClick={() => toggleInteractionType(liveMode.id)}
              >
                <ModeIcon />
                <span><strong>{liveMode.label}</strong><small>{liveMode.description}</small></span>
                <em>{liveMode.defaultDuration}s default</em>
              </button>
            );
          })}
        </div>
      </section>

      <section className="textbook-live-panel">
        <div className="textbook-live-panel-head">
          <div><span>2</span><div><h2>Choose the vocabulary</h2><p>Use everything, or narrow the pool by level and bank.</p></div></div>
          <strong>{sourcePool.length} available</strong>
        </div>

        <div className="textbook-live-segmented">
          <button type="button" className={bankMode === "all" ? "active" : ""} onClick={() => setBankMode("all")}>All banks</button>
          <button type="button" className={bankMode === "selected" ? "active" : ""} onClick={() => setBankMode("selected")}>Specific banks</button>
        </div>

        <div className="textbook-live-filter-block">
          <span className="textbook-live-label">Levels <small>Leave clear to include every level</small></span>
          <div className="textbook-live-chip-row">
            {HUB_VOCAB_LEVELS.map((level) => (
              <button
                key={level.id}
                type="button"
                className={selectedLevels.includes(level.id) ? "selected" : ""}
                style={{ "--chip-accent": HUB_VOCAB_LEVEL_COLORS[level.id] }}
                onClick={() => toggleLevel(level.id)}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {bankMode === "selected" ? (
          <div className="textbook-live-bank-grid">
            {themes.filter((theme) => !selectedLevels.length || selectedLevels.includes(theme.level)).map((theme) => (
              <label key={theme.id} className={selectedThemeIds.includes(theme.id) ? "selected" : ""}>
                <input type="checkbox" checked={selectedThemeIds.includes(theme.id)} onChange={() => toggleTheme(theme.id)} />
                <span><strong>{theme.title}</strong><small>{theme.textbookRef} · {theme.level.toUpperCase()}</small></span>
              </label>
            ))}
          </div>
        ) : null}
      </section>

      <section className="textbook-live-panel">
        <div className="textbook-live-panel-head">
          <div><span>3</span><div><h2>Build the activity</h2><p>Random gives you a fresh sample; curated lets you choose the vocabulary item by item.</p></div></div>
          <strong>{mode === "curated" ? `${curatedQuestions.length} items · ` : ""}{quizItems.length} round{quizItems.length === 1 ? "" : "s"}</strong>
        </div>
        <div className="textbook-live-mode-grid">
          <button type="button" className={mode === "random" ? "active" : ""} onClick={() => setMode("random")}>
            <Dices /><span><strong>Random quiz</strong><small>Sample questions from the pool.</small></span>
          </button>
          <button type="button" className={mode === "curated" ? "active" : ""} onClick={() => setMode("curated")}>
            <Sparkles /><span><strong>Curated quiz</strong><small>Select and order each question.</small></span>
          </button>
        </div>

        {mode === "random" ? (
          <div className="textbook-live-random-controls">
            <label>
              <span>Number of live rounds</span>
              <input
                type="number"
                min={minimumRandomRounds}
                max={MAX_QUESTIONS}
                value={questionCount}
                onChange={(event) => {
                  setQuestionCount(Math.max(minimumRandomRounds, Math.min(MAX_QUESTIONS, Number(event.target.value || minimumRandomRounds))));
                }}
              />
            </label>
            <button type="button" className="review-btn" onClick={() => setRandomSeed(Date.now())}><Dices size={17} /> Generate another mix</button>
          </div>
        ) : (
          <>
            <p className={`textbook-live-mode-note${unusedMatchingItems ? " is-warning" : ""}`}>{unusedMatchingItems ? `${unusedMatchingItems} matching item${unusedMatchingItems === 1 ? " is" : "s are"} not yet in a complete four-answer group.` : "Choose a format for each selected item below. Matching items combine into four-item rounds."}</p>
            <div className="textbook-live-question-tools">
              <label><Search size={17} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search questions, answers, banks..." /></label>
              <button type="button" className="review-btn" onClick={selectVisibleQuestions}>Select results</button>
              <button type="button" className="review-btn" onClick={() => setCuratedIds([])}>Clear</button>
            </div>
            <div className="textbook-live-question-grid">
              {displayedQuestions.map((question, index) => (
                <QuestionCard key={question.id} question={question} selected={curatedIds.includes(question.id)} onToggle={() => toggleCuratedQuestion(question.id)} number={index + 1} />
              ))}
            </div>
            {visibleQuestionCount < filteredQuestions.length ? (
              <button type="button" className="textbook-live-load-more" onClick={() => setVisibleQuestionCount((count) => count + QUESTION_PAGE_SIZE)}>
                Show more ({filteredQuestions.length - visibleQuestionCount} remaining)
              </button>
            ) : null}
            {curatedQuestions.length ? (
              <div className="textbook-live-curated-plan">
                <span className="textbook-live-label">Selected vocabulary and format</span>
                {curatedQuestions.map((question, index) => (
                  <div key={question.id}>
                    <span>{index + 1}</span>
                    <p><strong>{question.sentence}</strong><small>{question.sourceThemeTitle} · {correctAnswer(question)}</small></p>
                    <select value={effectiveCuratedFormats[question.id]} onChange={(event) => setCuratedQuestionFormat(question.id, event.target.value)} aria-label={`Format for ${question.sentence}`}>
                      {selectedInteractionTypes.map((interactionType) => {
                        const liveMode = getTextbookVocabLiveMode(interactionType);
                        return <option value={interactionType} key={interactionType}>{liveMode.label}</option>;
                      })}
                    </select>
                    <div>
                      <button type="button" aria-label="Move item up" disabled={index === 0} onClick={() => setCuratedIds((ids) => moveItem(ids, index, -1))}><ChevronUp size={16} /></button>
                      <button type="button" aria-label="Move item down" disabled={index === curatedIds.length - 1} onClick={() => setCuratedIds((ids) => moveItem(ids, index, 1))}><ChevronDown size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        )}
      </section>

      <section className="textbook-live-panel">
        <div className="textbook-live-panel-head">
          <div><span>4</span><div><h2>Review and launch</h2><p>The lobby opens with a join PIN and QR code.</p></div></div>
        </div>
        <div className="textbook-live-session-settings">
          <label className="textbook-live-title-field"><span>Quiz title</span><input value={title} maxLength={120} onChange={(event) => setTitle(event.target.value)} /></label>
          <div className="textbook-live-duration-grid">
            {activeQuizInteractionTypes.map((interactionType) => {
              const liveMode = getTextbookVocabLiveMode(interactionType);
              return (
                <label className="textbook-live-title-field" key={interactionType}>
                  <span>{liveMode.label} time</span>
                  <select value={modeDurations[interactionType]} onChange={(event) => setModeDuration(interactionType, event.target.value)}><option value={15}>15 seconds</option><option value={20}>20 seconds</option><option value={30}>30 seconds</option><option value={45}>45 seconds</option><option value={60}>60 seconds</option><option value={90}>90 seconds</option></select>
                </label>
              );
            })}
          </div>
        </div>
        <div className="textbook-live-selected-list">
          {quizItems.length ? quizItems.map((question, index) => (
            <div key={question.id}>
              <span>{index + 1}</span>
              {question.interactionType === "matching" ? (
                <p>
                  <strong>Four-item matching round</strong>
                  <small>{question.pairs.map((pair) => `${pair.prompt} → ${question.matchOptions[pair.answerIndex]}`).join(" · ")}</small>
                </p>
              ) : (
                <p><strong>{question.sentence}</strong><small>{question.sourceThemeTitle} · {correctAnswer(question)}</small></p>
              )}
              <em className="textbook-live-format-badge">{getTextbookVocabLiveMode(question.interactionType).shortLabel}</em>
            </div>
          )) : <p className="textbook-live-empty">Choose enough vocabulary to create the live rounds.</p>}
        </div>
        <div className="textbook-live-launch-row">
          <p>{quizItems.length} live round{quizItems.length === 1 ? "" : "s"} · {activeQuizInteractionTypes.map((interactionType) => getTextbookVocabLiveMode(interactionType).shortLabel).join(" + ")}</p>
          <button type="button" className="textbook-live-launch" onClick={createQuiz} disabled={creating || !canCreate}>
            {creating ? "Creating lobby…" : "Create live lobby"}
          </button>
        </div>
      </section>
    </main>
  );
}
