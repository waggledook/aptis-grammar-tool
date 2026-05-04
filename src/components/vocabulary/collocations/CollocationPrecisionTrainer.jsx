import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, BookOpen, RotateCcw, Save, Star } from "lucide-react";

import Seo from "../../common/Seo.jsx";
import { toast } from "../../../utils/toast";
import {
  auth,
  clearCollocationPrecisionMistakes,
  fetchCollocationPrecisionDiary,
  fetchCollocationPrecisionFavourites,
  fetchCollocationPrecisionMistakes,
  fetchSeenCollocationPrecisionItemIds,
  logCollocationPrecisionCompleted,
  logCollocationPrecisionReviewLoaded,
  logCollocationPrecisionStarted,
  recordCollocationPrecisionMistake,
  removeCollocationPrecisionFavourite,
  saveCollocationPrecisionDiaryEntry,
  saveCollocationPrecisionFavourite,
  saveCollocationPrecisionResult,
  sendReport,
} from "../../../firebase";
import collocationPrecisionItems from "./data/collocationPrecisionItems.js";

const SESSION_SIZE = 6;
const REPORT_REASONS = [
  { value: "Incorrect collocation", label: "A correct collocation is marked wrong" },
  { value: "Valid distractor", label: "A distractor is actually possible or natural" },
  { value: "Pattern mismatch", label: "An option does not match the set pattern" },
  { value: "Definition or note problem", label: "The definition, example, or note is wrong" },
  { value: "Tag or level problem", label: "The topic, pattern, or level looks wrong" },
  { value: "Other", label: "Other" },
];

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function dedupeByItemId(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.itemId || seen.has(item.itemId)) return false;
    seen.add(item.itemId);
    return true;
  });
}

function buildTags(item) {
  return [item.level, item.topic, ...(item.secondaryTopics || []), item.pattern].filter(Boolean).join(",");
}

function itemTopics(item) {
  return [item.topic, ...(item.secondaryTopics || [])].filter(Boolean);
}

function correctWords(item) {
  return item.options.filter((option) => option.isCorrect).map((option) => option.word);
}

function targetCountText(count) {
  return `${count} target collocation${count === 1 ? "" : "s"}`;
}

function isPerfectSelection(item, selectedWords) {
  const selected = new Set(selectedWords);
  const correct = new Set(correctWords(item));
  if (selected.size !== correct.size) return false;
  return Array.from(correct).every((word) => selected.has(word));
}

function feedbackTitle(result, correctTotal) {
  if (result.isPerfect) return "Perfect";
  if (result.selectedCorrect.length) {
    return `Good work: ${result.selectedCorrect.length} of ${correctTotal} target collocations found`;
  }
  return "Keep going: review the target collocations";
}

function createSession(pool) {
  return shuffle(pool).slice(0, SESSION_SIZE).map((item) => ({
    ...item,
    options: shuffle(item.options),
  }));
}

function createPrioritisedSession(pool, seenItemIds = new Set()) {
  const unseen = pool.filter((item) => !seenItemIds.has(item.itemId));
  const seen = pool.filter((item) => seenItemIds.has(item.itemId));
  return [...shuffle(unseen), ...shuffle(seen)].slice(0, SESSION_SIZE).map((item) => ({
    ...item,
    options: shuffle(item.options),
  }));
}

export default function CollocationPrecisionTrainer() {
  const navigate = useNavigate();
  const completionLoggedRef = useRef(false);
  const signedIn = !!auth.currentUser;

  const levels = useMemo(
    () => Array.from(new Set(collocationPrecisionItems.map((item) => item.level))).sort(),
    []
  );
  const topics = useMemo(
    () => Array.from(new Set(collocationPrecisionItems.flatMap((item) => itemTopics(item)))).sort(),
    []
  );
  const patterns = useMemo(
    () => Array.from(new Set(collocationPrecisionItems.map((item) => item.pattern))).sort(),
    []
  );

  const [selectedLevels, setSelectedLevels] = useState(() => [...levels]);
  const [topic, setTopic] = useState("all");
  const [pattern, setPattern] = useState("all");
  const [mode, setMode] = useState("learn");
  const [currentSetMode, setCurrentSetMode] = useState("normal");
  const [items, setItems] = useState([]);
  const [selectedByIndex, setSelectedByIndex] = useState({});
  const [resultsByIndex, setResultsByIndex] = useState({});
  const [favouriteIds, setFavouriteIds] = useState(new Set());
  const [seenItemIds, setSeenItemIds] = useState(new Set());
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [diaryLoading, setDiaryLoading] = useState(false);
  const [reportingIndex, setReportingIndex] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportComment, setReportComment] = useState("");
  const [sendingReport, setSendingReport] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUserState() {
      if (!signedIn) {
        setFavouriteIds(new Set());
        setSeenItemIds(new Set());
        return;
      }

      try {
        const [favourites, seenIds] = await Promise.all([
          fetchCollocationPrecisionFavourites(),
          fetchSeenCollocationPrecisionItemIds(),
        ]);
        if (!cancelled) {
          setFavouriteIds(new Set(favourites.map((item) => item.itemId)));
          setSeenItemIds(new Set(seenIds));
        }
      } catch (error) {
        console.error("[CollocationPrecisionTrainer] load user state failed", error);
        if (!cancelled) toast("Could not load saved collocation progress.");
      }
    }

    loadUserState();
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  const filteredPool = useMemo(() => {
    return collocationPrecisionItems.filter((item) => {
      const levelMatch = selectedLevels.includes(item.level);
      const topicMatch = topic === "all" || itemTopics(item).includes(topic);
      const patternMatch = pattern === "all" || item.pattern === pattern;
      return item.status === "approved" && levelMatch && topicMatch && patternMatch;
    });
  }, [pattern, selectedLevels, topic]);

  const checkedCount = Object.keys(resultsByIndex).length;
  const perfectScore = Object.values(resultsByIndex).filter((result) => result?.isPerfect).length;
  const preciseScore = Object.values(resultsByIndex).reduce(
    (total, result) => total + (result?.selectedCorrect?.length || 0),
    0
  );
  const possibleScore = items.reduce((total, item) => total + correctWords(item).length, 0);

  useEffect(() => {
    if (mode !== "diary" || !signedIn) return;
    loadDiary();
  }, [mode, signedIn]);

  useEffect(() => {
    if (!items.length || checkedCount !== items.length || completionLoggedRef.current) return;

    completionLoggedRef.current = true;
    logCollocationPrecisionCompleted({
      mode: currentSetMode,
      total: items.length,
      correct: perfectScore,
      preciseCorrect: preciseScore,
      preciseTotal: possibleScore,
      topic,
      pattern,
      levels: selectedLevels,
      source: "CollocationPrecisionTrainer",
    });
  }, [checkedCount, currentSetMode, items, pattern, perfectScore, possibleScore, preciseScore, selectedLevels, topic]);

  function resetSession() {
    completionLoggedRef.current = false;
    setItems([]);
    setSelectedByIndex({});
    setResultsByIndex({});
    setReportingIndex(null);
    setReportReason("");
    setReportComment("");
  }

  function toggleLevel(level) {
    setSelectedLevels((previous) =>
      previous.includes(level)
        ? previous.filter((entry) => entry !== level)
        : [...previous, level]
    );
  }

  function toggleOption(index, word) {
    if (resultsByIndex[index]) return;

    setSelectedByIndex((previous) => {
      const item = items[index];
      const current = new Set(previous[index] || []);
      if (current.has(word)) current.delete(word);
      else if (item && current.size >= correctWords(item).length) {
        toast(`Choose only ${targetCountText(correctWords(item).length)} for this set.`);
        return previous;
      } else current.add(word);
      return {
        ...previous,
        [index]: Array.from(current),
      };
    });
  }

  async function startSession(sourceItems = null, source = "normal") {
    const pool = dedupeByItemId(sourceItems || filteredPool);
    if (!pool.length) {
      toast("No collocation items match those filters yet.");
      return;
    }

    const nextItems = source === "normal" ? createPrioritisedSession(pool, seenItemIds) : createSession(pool);
    resetSession();
    setItems(nextItems);
    setMode("learn");
    setCurrentSetMode(source);

    await logCollocationPrecisionStarted({
      mode: source,
      total: nextItems.length,
      poolSize: pool.length,
      ...(source === "normal"
        ? { unseenPoolSize: pool.filter((item) => !seenItemIds.has(item.itemId)).length }
        : {}),
      topic,
      pattern,
      levels: selectedLevels,
      source: "CollocationPrecisionTrainer",
    });
  }

  async function loadMistakeSet() {
    try {
      const mistakes = dedupeByItemId(await fetchCollocationPrecisionMistakes());
      if (!mistakes.length) {
        toast("No recent collocation mistakes yet.");
        return;
      }

      await logCollocationPrecisionReviewLoaded({
        mode: "mistakes",
        total: mistakes.length,
        source: "CollocationPrecisionTrainer",
      });

      await startSession(mistakes, "mistakes");
    } catch (error) {
      console.error("[CollocationPrecisionTrainer] load mistakes failed", error);
      toast("Could not load recent collocation mistakes.");
    }
  }

  async function loadFavouriteSet() {
    try {
      const favourites = dedupeByItemId(await fetchCollocationPrecisionFavourites());
      if (!favourites.length) {
        toast("No favourite collocation sets yet.");
        return;
      }

      await logCollocationPrecisionReviewLoaded({
        mode: "favourites",
        total: favourites.length,
        source: "CollocationPrecisionTrainer",
      });

      await startSession(favourites, "favourites");
    } catch (error) {
      console.error("[CollocationPrecisionTrainer] load favourites failed", error);
      toast("Could not load favourite collocation sets.");
    }
  }

  async function loadDiary() {
    setDiaryLoading(true);
    try {
      setDiaryEntries(await fetchCollocationPrecisionDiary());
    } catch (error) {
      console.error("[CollocationPrecisionTrainer] load diary failed", error);
      toast("Could not load your collocation diary.");
    } finally {
      setDiaryLoading(false);
    }
  }

  async function checkItem(index) {
    const item = items[index];
    const selectedWords = selectedByIndex[index] || [];
    if (!item || !selectedWords.length) {
      toast("Choose one or more options first.");
      return;
    }

    const isPerfect = isPerfectSelection(item, selectedWords);
    const selectedCorrect = selectedWords.filter((word) =>
      item.options.some((option) => option.word === word && option.isCorrect)
    );
    const selectedWrong = selectedWords.filter((word) =>
      item.options.some((option) => option.word === word && !option.isCorrect)
    );
    const missed = correctWords(item).filter((word) => !selectedWords.includes(word));

    setResultsByIndex((previous) => ({
      ...previous,
      [index]: {
        isPerfect,
        score: selectedCorrect.length,
        possibleScore: correctWords(item).length,
        selectedWords,
        selectedCorrect,
        selectedWrong,
        missed,
      },
    }));

    try {
      await saveCollocationPrecisionResult(item.itemId, buildTags(item), isPerfect);
      setSeenItemIds((previous) => new Set([...previous, item.itemId]));
    } catch (error) {
      console.error("[CollocationPrecisionTrainer] save result failed", error);
    }

    if (!isPerfect) {
      try {
        await recordCollocationPrecisionMistake({
          ...item,
          selectedWords,
          selectedWrong,
          missed,
          tags: buildTags(item),
        });
      } catch (error) {
        console.error("[CollocationPrecisionTrainer] record mistake failed", error);
      }
      return;
    }

    try {
      await clearCollocationPrecisionMistakes(item.itemId);
    } catch (error) {
      console.error("[CollocationPrecisionTrainer] clear mistakes failed", error);
    }
  }

  async function saveDiaryEntry(item, option) {
    try {
      await saveCollocationPrecisionDiaryEntry({
        itemId: item.itemId,
        prompt: item.prompt,
        word: option.word,
        collocation: option.collocation,
        definition: option.definition,
        example: option.example,
        note: option.note,
        level: item.level,
        topic: item.topic,
        secondaryTopics: item.secondaryTopics || [],
        pattern: item.pattern,
        tags: buildTags(item),
      });
      toast("Saved to your collocation diary.");
      if (mode === "diary") await loadDiary();
    } catch (error) {
      console.error("[CollocationPrecisionTrainer] save diary failed", error);
      toast("Could not save that example.");
    }
  }

  async function toggleFavourite(item) {
    const isFavourite = favouriteIds.has(item.itemId);

    try {
      if (isFavourite) {
        await removeCollocationPrecisionFavourite(item.itemId);
        setFavouriteIds((previous) => {
          const next = new Set(previous);
          next.delete(item.itemId);
          return next;
        });
        toast("Removed from favourites.");
        return;
      }

      await saveCollocationPrecisionFavourite({
        itemId: item.itemId,
        prompt: item.prompt,
        question: item.question,
        level: item.level,
        topic: item.topic,
        secondaryTopics: item.secondaryTopics || [],
        pattern: item.pattern,
        options: item.options,
        tags: buildTags(item),
      });
      setFavouriteIds((previous) => new Set([...previous, item.itemId]));
      toast("Added to favourites.");
    } catch (error) {
      console.error("[CollocationPrecisionTrainer] favourite toggle failed", error);
      toast("Could not update favourites.");
    }
  }

  async function handleSendReport(index) {
    const item = items[index];
    if (!reportReason || sendingReport || !item) return;

    const selectedWords = selectedByIndex[index] || [];
    const correctSelections = item.options
      .filter((option) => option.isCorrect)
      .map((option) => option.collocation || `${item.prompt} ${option.word}`);

    setSendingReport(true);
    try {
      await sendReport({
        itemId: item.itemId,
        question: `${item.question}\n\nPrompt: ${item.prompt}\nPattern: ${item.pattern}\nOptions: ${item.options.map((option) => option.word).join(", ")}`,
        issue: reportReason === "Other" ? "other" : reportReason,
        comments: reportComment.trim(),
        level: item.level?.toUpperCase?.() || null,
        selectedOption: selectedWords.length ? selectedWords.join(", ") : null,
        correctOption: correctSelections.join(" / "),
      });

      toast(
        auth.currentUser?.email
          ? `Thanks — we emailed a copy to ${auth.currentUser.email}.`
          : "Thanks — your report was sent."
      );

      setReportingIndex(null);
      setReportReason("");
      setReportComment("");
    } catch (error) {
      console.error("[CollocationPrecisionTrainer] report failed", error);
      toast("Sorry — failed to send. Please try again.");
    } finally {
      setSendingReport(false);
    }
  }

  function optionClass(item, option, selectedWords, result) {
    const selected = selectedWords.includes(option.word);
    if (!result) return selected ? "selected" : "";
    if (option.isCorrect && selected) return "correct";
    if (option.isCorrect && !selected) return "missed";
    if (!option.isCorrect && selected) return "wrong";
    return "quiet";
  }

  return (
    <div className="collocation-precision-page game-wrapper">
      <Seo
        title="Collocation Trainer | Seif Aptis Trainer"
        description="Practise natural collocations by choosing all the words that combine with a prompt."
      />

      <div className="cp-shell">
        <button className="topbar-btn" onClick={() => navigate("/vocabulary/collocations")}>
          ← Back to Collocations
        </button>

        <header className="cp-header">
          <img
            className="cp-title-art"
            src="/images/collocation-trainer-title.png"
            alt="Collocation Trainer"
          />
          <p>Choose all the natural collocations for each word.</p>
        </header>

        <section className="cp-setup">
          <div className="cp-filters">
            <fieldset className="levels-fieldset">
              <legend>Levels:</legend>
              <div className="level-row">
                {levels.map((level) => (
                  <label
                    key={level}
                    className={`level-chip cefr-${level.toUpperCase()} ${selectedLevels.includes(level) ? "selected" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedLevels.includes(level)}
                      onChange={() => toggleLevel(level)}
                    />
                    <span className="dot" aria-hidden="true" />
                    <span className="txt">{level.toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="cp-field">
              <span>Topic</span>
              <select className="select" value={topic} onChange={(event) => setTopic(event.target.value)}>
                <option value="all">All topics</option>
                {topics.map((entry) => (
                  <option key={entry} value={entry}>{entry}</option>
                ))}
              </select>
            </label>

            <label className="cp-field">
              <span>Pattern</span>
              <select className="select" value={pattern} onChange={(event) => setPattern(event.target.value)}>
                <option value="all">All patterns</option>
                {patterns.map((entry) => (
                  <option key={entry} value={entry}>{entry}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="cp-toolbar">
            <div className="cp-tabs">
              <button type="button" className={mode === "learn" ? "active" : ""} onClick={() => setMode("learn")}>
                Learn
              </button>
              <button type="button" className={mode === "diary" ? "active" : ""} onClick={() => setMode("diary")} disabled={!signedIn}>
                Diary
              </button>
            </div>
            <span className="cp-meta">Pool: {filteredPool.length} items</span>
          </div>

          <div className="cp-actions">
            <button className="review-btn" onClick={() => startSession()} disabled={!selectedLevels.length}>
              Generate Practice Set
            </button>
            <button className="review-btn secondary" onClick={loadMistakeSet} disabled={!signedIn}>
              <RotateCcw size={16} /> Review Mistakes
            </button>
            <button className="review-btn secondary" onClick={loadFavouriteSet} disabled={!signedIn}>
              <Star size={16} /> Review Favourites
            </button>
            <button className="review-btn secondary" onClick={() => setMode("diary")} disabled={!signedIn}>
              <BookOpen size={16} /> Open Diary
            </button>
          </div>

          {!signedIn && (
            <p className="muted-note">Sign in to save favourites, save diary examples, and review collocation mistakes.</p>
          )}
        </section>

        {mode === "learn" && !!items.length && (
          <p className="cp-progress">
            Progress: {checkedCount} / {items.length} · Collocations found: {preciseScore} / {possibleScore} · Perfect sets: {perfectScore} / {items.length}
          </p>
        )}

        {mode === "learn" && items.map((item, index) => {
          const selectedWords = selectedByIndex[index] || [];
          const result = resultsByIndex[index];
          const correctOptions = item.options.filter((option) => option.isCorrect);
          const selectionLimit = correctOptions.length;
          const atSelectionLimit = !result && selectedWords.length >= selectionLimit;
          const isFavourite = favouriteIds.has(item.itemId);
          const isReporting = reportingIndex === index;

          return (
            <article key={item.itemId} className="cp-card">
              <div className="cp-card-top">
                <div className="cp-card-tags">
                  <span className="mini-tag">{item.level.toUpperCase()}</span>
                  <span className="mini-tag ghost">{itemTopics(item).join(" / ")}</span>
                  <span className="mini-tag ghost">{item.pattern}</span>
                </div>
                <div className="cp-card-top-actions">
                  <button
                    type="button"
                    className={`cp-fav ${isFavourite ? "active" : ""}`}
                    onClick={() => toggleFavourite(item)}
                    disabled={!signedIn}
                    aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
                    title={signedIn ? (isFavourite ? "Remove from favourites" : "Add to favourites") : "Sign in to save favourites"}
                  >
                    <Star size={18} fill={isFavourite ? "currentColor" : "none"} />
                  </button>

                  <button
                    type="button"
                    className="cp-report-btn"
                    onClick={() => {
                      setReportingIndex((previous) => (previous === index ? null : index));
                      setReportReason("");
                      setReportComment("");
                    }}
                    title="Report a problem"
                  >
                    <AlertCircle size={18} />
                    <span>Report</span>
                  </button>
                </div>
              </div>

              <p className="cp-question-label">{item.question}</p>
              <p className="cp-target-count">
                Choose {targetCountText(selectionLimit)}. Selected: {selectedWords.length} / {selectionLimit}
              </p>
              <h2>{item.prompt}</h2>

              {isReporting && (
                <div className="cp-report-bar">
                  <div className="cp-report-fields">
                    <select
                      className="select"
                      value={reportReason}
                      onChange={(event) => setReportReason(event.target.value)}
                    >
                      <option value="">-- select problem --</option>
                      {REPORT_REASONS.map((reason) => (
                        <option key={reason.value} value={reason.value}>
                          {reason.label}
                        </option>
                      ))}
                    </select>

                    <textarea
                      className="cp-report-input"
                      placeholder="Add details (optional)..."
                      value={reportComment}
                      onChange={(event) => setReportComment(event.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="cp-report-actions">
                    <button
                      className="review-btn"
                      onClick={() => handleSendReport(index)}
                      disabled={!reportReason || sendingReport}
                    >
                      {sendingReport ? "Sending..." : "Send report"}
                    </button>
                    <button
                      className="review-btn secondary"
                      onClick={() => setReportingIndex(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="cp-option-grid">
                {item.options.map((option) => (
                  <button
                    key={option.word}
                    type="button"
                    className={`cp-option ${optionClass(item, option, selectedWords, result)}`}
                    onClick={() => toggleOption(index, option.word)}
                    disabled={!!result || (atSelectionLimit && !selectedWords.includes(option.word))}
                  >
                    {option.word}
                  </button>
                ))}
              </div>

              {!result && (
                <div className="cp-card-actions">
                  <button className="review-btn" onClick={() => checkItem(index)}>
                    Check Answers
                  </button>
                </div>
              )}

              {result && (
                <div className={`cp-feedback ${result.isPerfect ? "is-correct" : result.selectedCorrect.length ? "is-partial" : "is-wrong"}`}>
                  <strong>{feedbackTitle(result, correctOptions.length)}</strong>
                  <div className="cp-feedback-summary">
                    <span className="cp-score-pill found">{result.selectedCorrect.length} found</span>
                    {!!result.missed.length && <span className="cp-score-pill missed">{result.missed.length} to add</span>}
                    {!!result.selectedWrong.length && <span className="cp-score-pill wrong">{result.selectedWrong.length} not target</span>}
                  </div>

                  <div className="cp-feedback-list">
                    {correctOptions.map((option) => (
                      <div key={option.word} className="cp-feedback-entry">
                        <div className="cp-entry-head">
                          <strong>{option.collocation}</strong>
                          <span className={`cp-entry-status ${result.selectedCorrect.includes(option.word) ? "found" : "missed"}`}>
                            {result.selectedCorrect.includes(option.word) ? "Found" : "Add this"}
                          </span>
                          <button
                            type="button"
                            className="cp-save"
                            onClick={() => saveDiaryEntry(item, option)}
                            disabled={!signedIn}
                            title={signedIn ? "Save example" : "Sign in to save examples"}
                          >
                            <Save size={15} /> Save
                          </button>
                        </div>
                        <p>{option.definition}</p>
                        {option.example && <p className="cp-example">“{option.example}”</p>}
                        <p className="cp-note">{option.note}</p>
                      </div>
                    ))}
                  </div>

                  {!!result.selectedWrong.length && (
                    <div className="cp-traps">
                      <strong>Not common collocations here</strong>
                      {item.options
                        .filter((option) => result.selectedWrong.includes(option.word))
                        .map((option) => (
                          <p key={option.word}><b>{option.word}:</b> {option.note}</p>
                        ))}
                    </div>
                  )}
                </div>
              )}

            </article>
          );
        })}

        {mode === "diary" && (
          <section className="cp-card">
            <div className="cp-card-top">
              <div>
                <span className="mini-tag">saved examples</span>
                <span className="mini-tag ghost">{diaryEntries.length} entries</span>
              </div>
              <button className="review-btn secondary" onClick={loadDiary} disabled={diaryLoading}>
                Refresh
              </button>
            </div>

            {diaryLoading && <p className="muted-note">Loading diary...</p>}
            {!diaryLoading && !diaryEntries.length && (
              <p className="muted-note">No saved collocation examples yet.</p>
            )}

            <div className="cp-diary-grid">
              {diaryEntries.map((entry) => (
                <article key={entry.id || `${entry.itemId}-${entry.word}`} className="cp-diary-entry">
                  <span className="mini-tag">{entry.level?.toUpperCase?.() || entry.level}</span>
                  <h3>{entry.collocation}</h3>
                  <p>{entry.definition}</p>
                  {entry.example && <p className="cp-example">“{entry.example}”</p>}
                  <p className="cp-note">{entry.pattern} · {[entry.topic, ...(entry.secondaryTopics || [])].filter(Boolean).join(" / ")}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      <style>{`
        .cp-shell {
          max-width: 980px;
          margin: 0 auto;
          display: grid;
          gap: 1rem;
        }
        .cp-title-art {
          display: block;
          width: min(100%, 920px);
          height: auto;
          margin: .7rem 0 .35rem;
        }
        .cp-header p,
        .cp-question-label,
        .cp-target-count,
        .cp-progress,
        .cp-meta,
        .cp-note,
        .muted-note {
          color: #a9b7d1;
        }
        .cp-setup,
        .cp-card {
          background: #13213b;
          border: 1px solid #2c4b83;
          border-radius: 8px;
          padding: 1rem;
        }
        .cp-filters,
        .cp-toolbar,
        .cp-actions,
        .cp-card-top,
        .cp-card-actions,
        .cp-entry-head {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: .75rem;
        }
        .cp-card-top,
        .cp-entry-head {
          justify-content: space-between;
        }
        .cp-card-tags {
          display: flex;
          flex: 1 1 220px;
          flex-wrap: wrap;
          gap: .35rem;
          min-width: 0;
        }
        .cp-card-top-actions {
          display: inline-flex;
          align-items: center;
          gap: .55rem;
          flex: 0 0 auto;
        }
        .cp-field {
          display: grid;
          gap: .25rem;
          color: #cfd9f3;
          font-size: .9rem;
        }
        .cp-toolbar {
          justify-content: space-between;
          margin-top: .9rem;
        }
        .cp-tabs {
          display: inline-flex;
          border: 1px solid #37598e;
          border-radius: 8px;
          overflow: hidden;
        }
        .cp-tabs button {
          min-height: 38px;
          padding: 0 .95rem;
          color: #cfd9f3;
          background: #192846;
          border: 0;
          border-right: 1px solid #37598e;
          cursor: pointer;
        }
        .cp-tabs button:last-child {
          border-right: 0;
        }
        .cp-tabs button.active {
          color: #071426;
          background: #8fb8ff;
          font-weight: 700;
        }
        .cp-tabs button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }
        .cp-actions {
          margin-top: .9rem;
        }
        .cp-actions .review-btn,
        .cp-card-actions .review-btn,
        .cp-card-top .review-btn {
          display: inline-flex;
          align-items: center;
          gap: .4rem;
        }
        .cp-card h2 {
          margin: .25rem 0 .8rem;
          color: #f7fbff;
          font-size: 2rem;
        }
        .cp-target-count {
          margin: -.15rem 0 .45rem;
          font-weight: 800;
        }
        .cp-option-grid {
          display: grid;
          gap: .65rem;
          grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
        }
        .cp-option {
          min-height: 48px;
          border-radius: 8px;
          border: 1px solid #37598e;
          background: #0f1c34;
          color: #edf4ff;
          cursor: pointer;
          font-weight: 700;
        }
        .cp-option.selected {
          border-color: #8fb8ff;
          background: #244a83;
        }
        .cp-option.correct {
          border-color: #65d49a;
          background: rgba(46, 125, 79, .35);
        }
        .cp-option.missed {
          border-color: #e5bf62;
          border-style: dashed;
          background: rgba(229, 191, 98, .16);
        }
        .cp-option.wrong {
          border-color: #f18989;
          background: rgba(152, 58, 58, .35);
        }
        .cp-option.quiet {
          opacity: .65;
        }
        .cp-option:disabled {
          cursor: not-allowed;
        }
        .cp-option:disabled:not(.selected):not(.correct):not(.missed):not(.wrong) {
          opacity: .48;
        }
        .cp-card-actions {
          margin-top: .9rem;
        }
        .cp-feedback {
          margin-top: 1rem;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid #37598e;
          background: #101d35;
        }
        .cp-feedback.is-correct {
          border-color: rgba(101, 212, 154, .7);
        }
        .cp-feedback.is-partial {
          border-color: rgba(229, 191, 98, .7);
          background: rgba(229, 191, 98, .08);
        }
        .cp-feedback.is-wrong {
          border-color: rgba(241, 137, 137, .7);
        }
        .cp-feedback-summary {
          display: flex;
          flex-wrap: wrap;
          gap: .45rem;
          margin-top: .65rem;
        }
        .cp-score-pill,
        .cp-entry-status {
          display: inline-flex;
          align-items: center;
          min-height: 26px;
          border-radius: 999px;
          padding: .15rem .55rem;
          border: 1px solid rgba(143, 184, 255, .25);
          font-size: .78rem;
          font-weight: 800;
          letter-spacing: 0;
          white-space: nowrap;
        }
        .cp-score-pill.found,
        .cp-entry-status.found {
          color: #a7f3c9;
          border-color: rgba(101, 212, 154, .45);
          background: rgba(101, 212, 154, .12);
        }
        .cp-score-pill.missed,
        .cp-entry-status.missed {
          color: #f3df9b;
          border-color: rgba(229, 191, 98, .45);
          background: rgba(229, 191, 98, .12);
        }
        .cp-score-pill.wrong {
          color: #ffc2c2;
          border-color: rgba(241, 137, 137, .42);
          background: rgba(241, 137, 137, .1);
        }
        .cp-feedback-list,
        .cp-diary-grid {
          display: grid;
          gap: .75rem;
          margin-top: .75rem;
        }
        .cp-feedback-entry,
        .cp-diary-entry,
        .cp-traps {
          border: 1px solid rgba(143, 184, 255, .25);
          border-radius: 8px;
          padding: .8rem;
          background: rgba(255, 255, 255, .03);
        }
        .cp-feedback-entry .cp-entry-head {
          align-items: flex-start;
        }
        .cp-feedback-entry .cp-entry-head > strong {
          margin-right: auto;
        }
        .cp-feedback-entry p,
        .cp-diary-entry p,
        .cp-traps p {
          margin: .35rem 0 0;
          color: #cfd9f3;
          line-height: 1.45;
        }
        .cp-example {
          color: #f3df9b !important;
        }
        .cp-save {
          min-height: 32px;
          display: inline-flex;
          align-items: center;
          gap: .3rem;
          border: 1px solid #37598e;
          border-radius: 8px;
          background: #192846;
          color: #e6f0ff;
          cursor: pointer;
        }
        .cp-save:disabled {
          opacity: .55;
          cursor: not-allowed;
        }
        .cp-fav {
          width: 38px;
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          border-radius: 8px;
          border: 1px solid #37598e;
          background: #192846;
          color: #cfd9f3;
          cursor: pointer;
        }
        .cp-fav:hover:not(:disabled) {
          border-color: #8fb8ff;
          color: #f3df9b;
        }
        .cp-fav.active {
          background: rgba(253, 191, 45, 0.16);
          border-color: rgba(253, 191, 45, 0.7);
          color: #ffd36a;
        }
        .cp-fav:disabled {
          opacity: .55;
          cursor: not-allowed;
        }
        .cp-fav svg {
          width: 18px;
          height: 18px;
          display: block;
          flex: 0 0 auto;
          stroke-width: 2.25;
        }
        .cp-report-btn {
          min-height: 38px;
          display: inline-flex;
          align-items: center;
          gap: .4rem;
          padding: 0 .8rem;
          border-radius: 8px;
          border: 1px solid #37598e;
          background: #192846;
          color: #cfd9f3;
          cursor: pointer;
          font-weight: 700;
        }
        .cp-report-btn:hover {
          border-color: #8fb8ff;
          color: #e6f0ff;
        }
        .cp-report-bar {
          margin-top: 1rem;
          border-radius: 8px;
          border: 1px solid rgba(143, 184, 255, .3);
          background: rgba(255, 255, 255, .03);
          padding: .85rem;
        }
        .cp-report-fields,
        .cp-report-actions {
          display: flex;
          flex-wrap: wrap;
          gap: .75rem;
        }
        .cp-report-fields {
          flex-direction: column;
        }
        .cp-report-input {
          width: 100%;
          resize: vertical;
          min-height: 88px;
          border-radius: 8px;
          border: 1px solid #37598e;
          background: #0f1c34;
          color: #edf4ff;
          padding: .75rem .85rem;
          font: inherit;
        }
        .cp-report-actions {
          margin-top: .75rem;
          justify-content: flex-end;
        }
        .cp-traps {
          margin-top: .75rem;
        }
        .cp-diary-grid {
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
        }
        .cp-diary-entry h3 {
          margin: .45rem 0 .2rem;
          color: #f7fbff;
          font-size: 1.05rem;
        }
        :root[data-theme="light"] .collocation-precision-page {
          color: var(--color-text);
        }
        :root[data-theme="light"] .collocation-precision-page .cp-diary-entry h3,
        :root[data-theme="light"] .collocation-precision-page .cp-card h2,
        :root[data-theme="light"] .collocation-precision-page strong {
          color: var(--color-text) !important;
        }
        :root[data-theme="light"] .collocation-precision-page :is(
          .cp-header p,
          .cp-question-label,
          .cp-target-count,
          .cp-progress,
          .cp-meta,
          .cp-note,
          .muted-note
        ) {
          color: var(--color-text-soft) !important;
        }
        :root[data-theme="light"] .collocation-precision-page :is(.cp-setup, .cp-card) {
          background: var(--color-surface-2) !important;
          border-color: var(--color-border) !important;
          color: var(--color-text) !important;
          box-shadow: 0 10px 28px var(--color-shadow-soft) !important;
        }
        :root[data-theme="light"] .collocation-precision-page :is(
          .cp-field,
          .cp-field span,
          .levels-fieldset,
          .levels-fieldset legend
        ) {
          color: var(--color-text-soft) !important;
        }
        :root[data-theme="light"] .collocation-precision-page :is(.select, .cp-tabs, .cp-tabs button, .cp-option, .cp-save, .cp-fav) {
          background: var(--color-surface-3) !important;
          border-color: var(--color-border) !important;
          color: var(--color-text) !important;
          box-shadow: none !important;
          filter: none !important;
        }
        :root[data-theme="light"] .collocation-precision-page :is(.cp-report-btn, .cp-report-input) {
          background: var(--color-surface-3) !important;
          border-color: var(--color-border) !important;
          color: var(--color-text) !important;
        }
        :root[data-theme="light"] .collocation-precision-page :is(.review-btn, .topbar-btn) {
          background: var(--color-surface-3) !important;
          border: 1px solid var(--color-border) !important;
          color: var(--color-link) !important;
          box-shadow: 0 6px 18px var(--color-shadow-soft), inset 0 0 0 9999px rgba(255, 255, 255, 0.02) !important;
          filter: none !important;
        }
        :root[data-theme="light"] .collocation-precision-page :is(
          .review-btn:hover:not(:disabled),
          .topbar-btn:hover,
          .cp-option:hover:not(:disabled),
          .cp-save:hover:not(:disabled),
          .cp-fav:hover:not(:disabled),
          .cp-report-btn:hover,
          .cp-tabs button:hover:not(:disabled)
        ) {
          background: var(--color-surface) !important;
          border-color: var(--color-border-strong) !important;
          color: var(--color-text) !important;
          box-shadow: 0 8px 22px var(--color-shadow-soft), 0 0 0 3px var(--focus-ring) !important;
        }
        :root[data-theme="light"] .collocation-precision-page .cp-tabs button.active,
        :root[data-theme="light"] .collocation-precision-page .cp-option.selected {
          background: #dbeafe !important;
          border-color: #2563eb !important;
          color: #172033 !important;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.18) !important;
        }
        :root[data-theme="light"] .collocation-precision-page .cp-option.correct {
          background: rgba(22, 128, 60, 0.12) !important;
          border-color: rgba(22, 128, 60, 0.46) !important;
          color: #075e2c !important;
        }
        :root[data-theme="light"] .collocation-precision-page .cp-option.missed {
          background: rgba(154, 103, 0, 0.12) !important;
          border-color: rgba(154, 103, 0, 0.5) !important;
          color: #7c5200 !important;
        }
        :root[data-theme="light"] .collocation-precision-page .cp-option.wrong {
          background: rgba(180, 35, 24, 0.11) !important;
          border-color: rgba(180, 35, 24, 0.42) !important;
          color: #7a180f !important;
        }
        :root[data-theme="light"] .collocation-precision-page .cp-option.quiet {
          background: var(--color-surface) !important;
          color: var(--color-text-soft) !important;
          opacity: .9;
        }
        :root[data-theme="light"] .collocation-precision-page .cp-fav.active {
          background: rgba(253, 191, 45, 0.14) !important;
          border-color: rgba(154, 103, 0, 0.38) !important;
          color: #9a6700 !important;
          box-shadow: 0 0 0 2px rgba(253, 191, 45, 0.16) !important;
        }
        :root[data-theme="light"] .collocation-precision-page .cp-feedback {
          background: var(--color-surface) !important;
          border-color: var(--color-border) !important;
          color: var(--color-text) !important;
        }
        :root[data-theme="light"] .collocation-precision-page .cp-feedback.is-correct {
          background: rgba(22, 128, 60, 0.08) !important;
          border-color: rgba(22, 128, 60, 0.35) !important;
        }
        :root[data-theme="light"] .collocation-precision-page .cp-feedback.is-partial {
          background: rgba(154, 103, 0, 0.08) !important;
          border-color: rgba(154, 103, 0, 0.34) !important;
        }
        :root[data-theme="light"] .collocation-precision-page .cp-feedback.is-wrong {
          background: rgba(180, 35, 24, 0.08) !important;
          border-color: rgba(180, 35, 24, 0.34) !important;
        }
        :root[data-theme="light"] .collocation-precision-page :is(.cp-feedback-entry, .cp-diary-entry, .cp-traps) {
          background: var(--color-surface) !important;
          border-color: var(--color-border) !important;
          color: var(--color-text) !important;
        }
        :root[data-theme="light"] .collocation-precision-page .cp-report-bar {
          background: var(--color-surface) !important;
          border-color: var(--color-border) !important;
        }
        :root[data-theme="light"] .collocation-precision-page :is(.cp-feedback-entry p, .cp-diary-entry p, .cp-traps p) {
          color: var(--color-text-soft) !important;
        }
        :root[data-theme="light"] .collocation-precision-page :is(.cp-score-pill.found, .cp-entry-status.found) {
          background: rgba(22, 128, 60, 0.1) !important;
          border-color: rgba(22, 128, 60, 0.38) !important;
          color: #075e2c !important;
        }
        :root[data-theme="light"] .collocation-precision-page :is(.cp-score-pill.missed, .cp-entry-status.missed) {
          background: rgba(154, 103, 0, 0.1) !important;
          border-color: rgba(154, 103, 0, 0.38) !important;
          color: #7c5200 !important;
        }
        :root[data-theme="light"] .collocation-precision-page .cp-score-pill.wrong {
          background: rgba(180, 35, 24, 0.09) !important;
          border-color: rgba(180, 35, 24, 0.36) !important;
          color: #7a180f !important;
        }
        :root[data-theme="light"] .collocation-precision-page .cp-example {
          color: #7c5200 !important;
        }
        :root[data-theme="light"] .collocation-precision-page .mini-tag {
          background: #dbeafe !important;
          border-color: rgba(37, 99, 235, 0.25) !important;
          color: #1e3a8a !important;
        }
        :root[data-theme="light"] .collocation-precision-page .mini-tag.ghost {
          background: var(--color-surface) !important;
          border-color: var(--color-border) !important;
          color: var(--color-text-soft) !important;
        }
        :root[data-theme="light"] .collocation-precision-page .level-chip {
          background: var(--color-surface) !important;
          color: var(--color-text) !important;
          border-color: var(--color-border) !important;
        }
        :root[data-theme="light"] .collocation-precision-page .level-chip.selected {
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.13) !important;
        }
        :root[data-theme="light"] .collocation-precision-page :is(button:disabled, .cp-save:disabled) {
          opacity: .58 !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
        }
        @media (max-width: 680px) {
          .cp-card h2 {
            font-size: 1.55rem;
          }
          .cp-toolbar,
          .cp-actions {
            align-items: stretch;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
