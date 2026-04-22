import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

import Seo from "../common/Seo.jsx";
import synonymSeedItems from "./data/synonymSeedItems.js";
import { toast } from "../../utils/toast";
import {
  auth,
  clearSynonymTrainerMistakes,
  fetchSeenSynonymTrainerItemIds,
  fetchSynonymTrainerFavourites,
  fetchSynonymTrainerMistakes,
  logSynonymTrainerCompleted,
  logSynonymTrainerReviewLoaded,
  logSynonymTrainerStarted,
  recordSynonymTrainerMistake,
  removeSynonymTrainerFavourite,
  saveSynonymTrainerFavourite,
  saveSynonymTrainerResult,
} from "../../firebase";

const PARTS_OF_SPEECH = ["noun", "verb", "adjective"];
const AMBIGUITY_LEVELS = ["low", "medium", "high"];
const SESSION_SIZE = 8;
const EXAM_QUESTION_COUNT = 5;
const EXAM_OPTION_COUNT = 10;

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function buildTags(item) {
  return [item.level, item.topic, item.partOfSpeech].filter(Boolean).join(",");
}

function ambiguityValue(risk) {
  const index = AMBIGUITY_LEVELS.indexOf(risk);
  return index === -1 ? 0 : index;
}

function isWithinAmbiguity(item, maxRisk) {
  return ambiguityValue(item?.ambiguityRisk || "low") <= ambiguityValue(maxRisk);
}

function withLearnOptions(item, pool) {
  const distractors = shuffle(
    pool.filter(
      (candidate) =>
        candidate.itemId !== item.itemId &&
        candidate.answer !== item.answer &&
        !(item.confusableWith || []).includes(candidate.answer)
    )
  ).slice(0, 3);

  return {
    ...item,
    options: shuffle([item.answer, ...distractors.map((candidate) => candidate.answer)]),
  };
}

function dedupeByItemId(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.itemId || seen.has(item.itemId)) return false;
    seen.add(item.itemId);
    return true;
  });
}

function createLearnSet(pool, seenItemIds) {
  const unseen = pool.filter((item) => !seenItemIds.has(item.itemId));
  const seen = pool.filter((item) => seenItemIds.has(item.itemId));
  const chosen = [...shuffle(unseen), ...shuffle(seen)].slice(0, SESSION_SIZE);
  return chosen.map((item) => withLearnOptions(item, pool));
}

function createExamSet(pool, preferredPartOfSpeech = "all", seenItemIds = new Set()) {
  const availableParts =
    preferredPartOfSpeech === "all"
      ? PARTS_OF_SPEECH.filter(
          (part) => pool.filter((item) => item.partOfSpeech === part).length >= EXAM_OPTION_COUNT
        )
      : [preferredPartOfSpeech];

  const chosenPart = availableParts
    .map((part) => ({
      part,
      total: pool.filter((item) => item.partOfSpeech === part).length,
    }))
    .sort((a, b) => b.total - a.total)[0]?.part;

  if (!chosenPart) return null;

  const candidates = pool.filter((item) => item.partOfSpeech === chosenPart);
  if (candidates.length < EXAM_OPTION_COUNT) return null;

  const unseen = candidates.filter((item) => !seenItemIds.has(item.itemId));
  const seen = candidates.filter((item) => seenItemIds.has(item.itemId));
  const questions = [...shuffle(unseen), ...shuffle(seen)].slice(0, EXAM_QUESTION_COUNT);

  if (questions.length < EXAM_QUESTION_COUNT) return null;

  const extraOptions = shuffle(
    candidates.filter(
      (item) => !questions.some((question) => question.itemId === item.itemId)
    )
  ).slice(0, EXAM_OPTION_COUNT - EXAM_QUESTION_COUNT);

  if (extraOptions.length < EXAM_OPTION_COUNT - EXAM_QUESTION_COUNT) return null;

  return {
    partOfSpeech: chosenPart,
    questions,
    optionEntries: shuffle([...questions, ...extraOptions]).map((item, index) => ({
      key: String.fromCharCode(65 + index),
      label: item.answer,
      sourceItemId: item.itemId,
    })),
  };
}

export default function SynonymTrainer() {
  const navigate = useNavigate();
  const completionLoggedRef = useRef(false);
  const signedIn = !!auth.currentUser;

  const [loading, setLoading] = useState(true);
  const [favouriteIds, setFavouriteIds] = useState(new Set());
  const [seenItemIds, setSeenItemIds] = useState(new Set());
  const availableLevels = useMemo(
    () => Array.from(new Set(synonymSeedItems.map((item) => item.level))).sort(),
    []
  );
  const [levels, setLevels] = useState(() => [...availableLevels]);
  const [partOfSpeech, setPartOfSpeech] = useState("all");
  const [topic, setTopic] = useState("all");
  const [maxAmbiguity, setMaxAmbiguity] = useState("medium");
  const [sessionMode, setSessionMode] = useState("learn");
  const [currentSetMode, setCurrentSetMode] = useState("normal");
  const [learnItems, setLearnItems] = useState([]);
  const [examSet, setExamSet] = useState(null);
  const [learnAnswers, setLearnAnswers] = useState({});
  const [learnResults, setLearnResults] = useState({});
  const [examAnswers, setExamAnswers] = useState({});
  const [examResults, setExamResults] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUserState() {
      setLoading(true);
      try {
        const [favourites, seenIds] = await Promise.all([
          signedIn ? fetchSynonymTrainerFavourites() : Promise.resolve([]),
          signedIn ? fetchSeenSynonymTrainerItemIds() : Promise.resolve([]),
        ]);

        if (cancelled) return;

        setFavouriteIds(new Set(favourites.map((item) => item.itemId)));
        setSeenItemIds(new Set(seenIds));
      } catch (error) {
        console.error("[SynonymTrainer] load failed", error);
        if (!cancelled) toast("Could not load your synonym trainer data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUserState();
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  const topicOptions = useMemo(() => {
    return Array.from(new Set(synonymSeedItems.map((item) => item.topic))).sort();
  }, []);

  const filteredPool = useMemo(() => {
    return synonymSeedItems.filter((item) => {
      const levelMatch = levels.includes(item.level);
      const posMatch = partOfSpeech === "all" || item.partOfSpeech === partOfSpeech;
      const topicMatch = topic === "all" || item.topic === topic;
      const statusMatch = item.status === "approved";
      const ambiguityMatch = isWithinAmbiguity(item, maxAmbiguity);
      return levelMatch && posMatch && topicMatch && statusMatch && ambiguityMatch;
    });
  }, [levels, maxAmbiguity, partOfSpeech, topic]);

  const examPool = useMemo(
    () => filteredPool.filter((item) => isWithinAmbiguity(item, "low")),
    [filteredPool]
  );

  const canBuildExamSet = useMemo(() => {
    if (partOfSpeech === "all") {
      return PARTS_OF_SPEECH.some(
        (part) => examPool.filter((item) => item.partOfSpeech === part).length >= EXAM_OPTION_COUNT
      );
    }
    return examPool.length >= EXAM_OPTION_COUNT;
  }, [examPool, partOfSpeech]);

  function resetSession() {
    completionLoggedRef.current = false;
    setLearnItems([]);
    setExamSet(null);
    setLearnAnswers({});
    setLearnResults({});
    setExamAnswers({});
    setExamResults(null);
  }

  function toggleLevel(level) {
    setLevels((previous) =>
      previous.includes(level)
        ? previous.filter((entry) => entry !== level)
        : [...previous, level]
    );
  }

  async function startLearnSession(items = null, source = "normal") {
    const sourcePool = dedupeByItemId(items || filteredPool);
    if (!sourcePool.length) {
      toast("No synonym items match those filters yet.");
      return;
    }

    const nextItems = createLearnSet(sourcePool, seenItemIds);
    if (!nextItems.length) {
      toast("Could not build a learn set yet.");
      return;
    }

    resetSession();
    setCurrentSetMode(source);
    setLearnItems(nextItems);
    setSessionMode("learn");

    await logSynonymTrainerStarted({
      mode: source,
      practiceMode: "learn",
      total: nextItems.length,
      poolSize: sourcePool.length,
      levels,
      topic,
      partOfSpeech,
      maxAmbiguity,
      source: "SynonymTrainer",
    });
  }

  async function startExamSession() {
    if (!canBuildExamSet) {
      toast("Exam mode needs at least 10 items from one word class.");
      return;
    }

    const nextExamSet = createExamSet(examPool, partOfSpeech, seenItemIds);
    if (!nextExamSet) {
      toast("Could not build an exam-style set from those filters.");
      return;
    }

    resetSession();
    setCurrentSetMode("normal");
    setExamSet(nextExamSet);
    setSessionMode("exam");

    await logSynonymTrainerStarted({
      mode: "normal",
      practiceMode: "exam",
      total: nextExamSet.questions.length,
      optionCount: nextExamSet.optionEntries.length,
      examPartOfSpeech: nextExamSet.partOfSpeech,
      levels,
      topic,
      partOfSpeech,
      maxAmbiguity: "low",
      source: "SynonymTrainer",
    });
  }

  async function loadFavouriteSet() {
    try {
      const favourites = dedupeByItemId(await fetchSynonymTrainerFavourites());
      if (!favourites.length) {
        toast("No favourite synonym items yet.");
        return;
      }

      await logSynonymTrainerReviewLoaded({
        mode: "favourites",
        total: favourites.length,
        source: "SynonymTrainer",
      });

      await startLearnSession(favourites, "favourites");
    } catch (error) {
      console.error("[SynonymTrainer] load favourites failed", error);
      toast("Could not load favourite synonym items.");
    }
  }

  async function loadMistakeSet() {
    try {
      const mistakes = dedupeByItemId(await fetchSynonymTrainerMistakes());
      if (!mistakes.length) {
        toast("No recent synonym mistakes yet.");
        return;
      }

      await logSynonymTrainerReviewLoaded({
        mode: "mistakes",
        total: mistakes.length,
        source: "SynonymTrainer",
      });

      await startLearnSession(mistakes, "mistakes");
    } catch (error) {
      console.error("[SynonymTrainer] load mistakes failed", error);
      toast("Could not load recent synonym mistakes.");
    }
  }

  async function persistResult(item, isCorrect) {
    try {
      await saveSynonymTrainerResult(item.itemId, buildTags(item), isCorrect);
      setSeenItemIds((previous) => new Set([...previous, item.itemId]));
    } catch (error) {
      console.error("[SynonymTrainer] save result failed", error);
    }

    if (isCorrect) {
      try {
        await clearSynonymTrainerMistakes(item.itemId);
      } catch (error) {
        console.error("[SynonymTrainer] clear mistakes failed", error);
      }
      return;
    }

    try {
      await recordSynonymTrainerMistake({
        itemId: item.itemId,
        prompt: item.prompt,
        answer: item.answer,
        explanation: item.explanation,
        level: item.level,
        topic: item.topic,
        partOfSpeech: item.partOfSpeech,
        ambiguityRisk: item.ambiguityRisk,
        status: item.status,
        confusableWith: item.confusableWith || [],
        tags: buildTags(item),
      });
    } catch (error) {
      console.error("[SynonymTrainer] record mistake failed", error);
    }
  }

  async function checkLearnItem(index, forcedAnswer = null) {
    const item = learnItems[index];
    const selected = forcedAnswer ?? learnAnswers[index] ?? "";
    if (!item || !selected) {
      toast("Choose an answer first.");
      return;
    }

    const isCorrect = selected === item.answer;
    setLearnResults((previous) => ({
      ...previous,
      [index]: {
        isCorrect,
        selected,
      },
    }));

    await persistResult(item, isCorrect);
  }

  async function handleLearnOptionSelect(index, option) {
    setLearnAnswers((previous) => ({ ...previous, [index]: option }));
    await checkLearnItem(index, option);
  }

  async function checkExamSet() {
    if (!examSet) return;
    if (examSet.questions.some((_, index) => !examAnswers[index])) {
      toast("Choose an option for every question first.");
      return;
    }

    const nextResults = {};

    await Promise.all(
      examSet.questions.map(async (question, index) => {
        const selectedKey = examAnswers[index] || "";
        const selectedOption = examSet.optionEntries.find((entry) => entry.key === selectedKey);
        const isCorrect = selectedOption?.label === question.answer;

        nextResults[index] = {
          isCorrect,
          selectedKey,
          selectedLabel: selectedOption?.label || "",
          correctKey:
            examSet.optionEntries.find((entry) => entry.label === question.answer)?.key || "",
        };

        await persistResult(question, isCorrect);
      })
    );

    setExamResults(nextResults);
  }

  async function toggleFavourite(item) {
    const isFavourite = favouriteIds.has(item.itemId);
    try {
      if (isFavourite) {
        await removeSynonymTrainerFavourite(item.itemId);
        setFavouriteIds((previous) => {
          const next = new Set(previous);
          next.delete(item.itemId);
          return next;
        });
        toast("Removed from favourites.");
      } else {
        await saveSynonymTrainerFavourite({
          itemId: item.itemId,
          prompt: item.prompt,
          answer: item.answer,
          explanation: item.explanation,
          level: item.level,
          topic: item.topic,
          partOfSpeech: item.partOfSpeech,
          ambiguityRisk: item.ambiguityRisk,
          status: item.status,
          confusableWith: item.confusableWith || [],
          tags: buildTags(item),
        });
        setFavouriteIds((previous) => new Set([...previous, item.itemId]));
        toast("Added to favourites.");
      }
    } catch (error) {
      console.error("[SynonymTrainer] favourite toggle failed", error);
      toast("Could not update favourites.");
    }
  }

  const learnCheckedCount = Object.keys(learnResults).length;
  const learnScore = Object.values(learnResults).filter((result) => result?.isCorrect).length;
  const examCheckedCount = examResults ? Object.keys(examResults).length : 0;
  const examScore = examResults
    ? Object.values(examResults).filter((result) => result?.isCorrect).length
    : 0;
  const totalItems = learnItems.length || examSet?.questions.length || 0;
  const completedCount = learnItems.length ? learnCheckedCount : examCheckedCount;
  const score = learnItems.length ? learnScore : examScore;

  useEffect(() => {
    if (!totalItems || completedCount !== totalItems || completionLoggedRef.current) return;

    completionLoggedRef.current = true;
    logSynonymTrainerCompleted({
      mode: currentSetMode,
      practiceMode: learnItems.length ? "learn" : "exam",
      total: totalItems,
      correct: score,
      levels,
      topic,
      partOfSpeech,
      maxAmbiguity: learnItems.length ? maxAmbiguity : "low",
      source: "SynonymTrainer",
    });
  }, [completedCount, currentSetMode, learnItems.length, levels, maxAmbiguity, partOfSpeech, score, topic, totalItems]);

  return (
    <div className="synonym-page game-wrapper">
      <Seo
        title="Synonym Trainer | Seif Aptis Trainer"
        description="Practise Aptis-style synonym matching with learn mode, exam mode, favourites, and recent-mistakes review."
      />

      <div className="synonym-shell">
        <button className="topbar-btn" onClick={() => navigate("/vocabulary")}>
          ← Back to Vocabulary Menu
        </button>

        <header className="synonym-header">
          <h1>Synonym Trainer</h1>
          <p>
            Practise Aptis-style synonym matching with learn mode, exam mode, favourites, and recent-mistakes review.
          </p>
        </header>

        <section className="synonym-setup">
          <div className="filter-panel synonym-filters">
            <fieldset className="levels-fieldset">
              <legend>Levels:</legend>
              <div className="level-row">
                {availableLevels.map((level) => (
                  <label
                    key={level}
                    className={`level-chip cefr-${level.toUpperCase()} ${levels.includes(level) ? "selected" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={levels.includes(level)}
                      onChange={() => toggleLevel(level)}
                    />
                    <span className="dot" aria-hidden="true" />
                    <span className="txt">{level.toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="field-block">
              <label className="field-label" htmlFor="synonym-pos">Word class:</label>
              <span className="select-wrap">
                <select
                  id="synonym-pos"
                  className="select"
                  value={partOfSpeech}
                  onChange={(event) => setPartOfSpeech(event.target.value)}
                >
                  <option value="all">All word classes</option>
                  {PARTS_OF_SPEECH.map((part) => (
                    <option key={part} value={part}>
                      {part}
                    </option>
                  ))}
                </select>
              </span>
            </div>

            <div className="field-block">
              <label className="field-label" htmlFor="synonym-topic">Topic:</label>
              <span className="select-wrap">
                <select
                  id="synonym-topic"
                  className="select"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                >
                  <option value="all">All topics</option>
                  {topicOptions.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
              </span>
            </div>

          </div>

          <div className="synonym-toolbar">
            <div className="synonym-mode-row">
              <button
                type="button"
                className={`mode-pill ${sessionMode === "learn" ? "active" : ""}`}
                onClick={() => setSessionMode("learn")}
              >
                Learn
              </button>
              <button
                type="button"
                className={`mode-pill ${sessionMode === "exam" ? "active" : ""}`}
                onClick={() => setSessionMode("exam")}
              >
                Exam
              </button>
            </div>

            <div className="synonym-pool-wrap">
              <span className="synonym-meta">Pool: {filteredPool.length} items</span>
            </div>
          </div>

          <div className="btn-row synonym-actions">
            <button
              className="review-btn"
              onClick={() => (sessionMode === "exam" ? startExamSession() : startLearnSession())}
              disabled={loading || !levels.length}
            >
              {loading ? "Loading..." : sessionMode === "exam" ? "Generate Exam Set" : "Generate Exercises"}
            </button>
            <button className="review-btn mistakes" onClick={loadMistakeSet} disabled={loading || !signedIn}>
              Review Mistakes
            </button>
            <button className="review-btn favourites" onClick={loadFavouriteSet} disabled={loading || !signedIn}>
              Review Favourites
            </button>
          </div>

          {!signedIn && (
            <p className="muted-note">
              Sign in to save favourites and record mistakes for review.
            </p>
          )}

          {sessionMode === "exam" && (
            <p className="muted-note">
              Exam mode automatically uses low-ambiguity approved items only and needs at least 10 matching items.
            </p>
          )}
        </section>

        {!!totalItems && (
          <p className="synonym-progress">Progress: {completedCount} / {totalItems} · Correct: {score} / {totalItems}</p>
        )}

        {!!learnItems.length && learnItems.map((item, index) => {
          const result = learnResults[index];
          const isFavourite = favouriteIds.has(item.itemId);

          return (
            <article key={item.itemId} className="synonym-card synonym-question-card">
              <div className="question-top">
                <div>
                  <span className="mini-tag">{item.level.toUpperCase()}</span>
                  <span className="mini-tag ghost">{item.partOfSpeech}</span>
                  <span className="mini-tag ghost">{item.topic}</span>
                </div>

                <button
                  className={`fav-btn ${isFavourite ? "active" : ""}`}
                  onClick={() => toggleFavourite(item)}
                  aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
                >
                  {isFavourite ? <Star size={18} fill="#ffd36a" stroke="#ffd36a" /> : <Star size={18} />}
                </button>
              </div>

              <p className="question-label">Choose the closest meaning.</p>
              <h2 className="question-word">{item.prompt}</h2>

              <div className="option-grid">
                {item.options.map((option) => {
                  const selected = learnAnswers[index] === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`option-btn ${selected ? "selected" : ""}`}
                      onClick={() => handleLearnOptionSelect(index, option)}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {result && (
                <div className={`feedback-box ${result.isCorrect ? "is-correct" : "is-wrong"}`}>
                  <strong>{result.isCorrect ? "Correct" : `Best answer: ${item.answer}`}</strong>
                  <p>{item.explanation}</p>
                  {!result.isCorrect && !!item.confusableWith?.length && (
                    <p className="feedback-note">
                      Nearby words to watch: {item.confusableWith.join(", ")}.
                    </p>
                  )}
                </div>
              )}
            </article>
          );
        })}

        {!!examSet && (
          <section className="synonym-card synonym-question-card">
            <div className="exam-head">
              <div>
                <span className="mini-tag">{examSet.partOfSpeech}</span>
                <span className="mini-tag ghost">exam style</span>
              </div>
              <p>
                Match each word on the left to the closest meaning on the right.
                Use each option once only.
              </p>
            </div>

            <div className="exam-left">
              {examSet.questions.map((question, index) => {
                const result = examResults?.[index];
                const isFavourite = favouriteIds.has(question.itemId);

                return (
                  <div key={question.itemId} className="exam-row">
                    <div className="exam-prompt">
                      <span className="exam-number">{index + 1}.</span>
                      <strong>{question.prompt}</strong>
                    </div>

                    <div className="exam-controls">
                      <span className="select-wrap exam-select-wrap">
                        <select
                          className="select"
                          value={examAnswers[index] || ""}
                          onChange={(event) =>
                            setExamAnswers((previous) => ({
                              ...previous,
                              [index]: event.target.value,
                            }))
                          }
                        >
                          <option value="">Choose</option>
                          {examSet.optionEntries.map((option) => (
                            <option key={option.key} value={option.key}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </span>

                      <button
                        className={`fav-btn ${isFavourite ? "active" : ""}`}
                        onClick={() => toggleFavourite(question)}
                        aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
                      >
                        {isFavourite ? <Star size={18} fill="#ffd36a" stroke="#ffd36a" /> : <Star size={18} />}
                      </button>
                    </div>

                    {result && (
                      <div className={`feedback-box compact ${result.isCorrect ? "is-correct" : "is-wrong"}`}>
                        <strong>{`Correct: ${question.answer}`}</strong>
                        <p>{question.explanation}</p>
                        {!result.isCorrect && !!question.confusableWith?.length && (
                          <p className="feedback-note">
                            Nearby words to watch: {question.confusableWith.join(", ")}.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="question-actions">
              <button className="review-btn" onClick={checkExamSet}>
                Check answers
              </button>
            </div>
          </section>
        )}
      </div>

      <style>{`
        .synonym-shell {
          max-width: 980px;
          margin: 0 auto;
        }
        .synonym-header {
          margin-top: 1rem;
        }
        .synonym-setup {
          margin-top: 0.75rem;
          margin-bottom: 1.1rem;
        }
        .synonym-header h1 {
          margin: 0 0 0.45rem;
          color: #fdbf2d;
          text-align: left;
          font-size: clamp(2.2rem, 5vw, 4rem);
          line-height: 1.05;
        }
        .synonym-header p {
          margin: 0;
          max-width: 760px;
          color: #d7e4ff;
          line-height: 1.55;
          font-size: 1.02rem;
        }
        .synonym-filters {
          display: grid;
          gap: 0.95rem;
          grid-template-columns: 1.3fr 1fr 1fr;
          align-items: end;
          margin-bottom: 1.15rem;
        }
        .field-block {
          display: grid;
          gap: 0.45rem;
        }
        .field-label {
          color: #fdbf2d;
          font-weight: 700;
        }
        .synonym-mode-row,
        .synonym-actions,
        .question-actions,
        .question-top,
        .exam-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 0.65rem;
          align-items: center;
        }
        .synonym-toolbar {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 1rem;
          align-items: center;
          margin: 0.25rem 0 1rem;
        }
        .synonym-mode-row {
          margin: 0;
        }
        .mode-pill,
        .option-btn {
          background: #0f2246;
          border: 1px solid #2a3d6e;
          color: #cfe2ff;
          border-radius: 12px;
          padding: 10px 14px;
          font-weight: 800;
          cursor: pointer;
        }
        .mode-pill.active {
          border-color: #fdbf2d;
          color: #fdbf2d;
          box-shadow: 0 0 0 1px rgba(253, 191, 45, 0.18);
        }
        .synonym-actions {
          justify-content: flex-start;
          margin-bottom: 0.15rem;
        }
        .synonym-pool-wrap {
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }
        .synonym-meta,
        .muted-note,
        .feedback-box p,
        .exam-head p,
        .synonym-progress {
          color: #d7e4ff;
          line-height: 1.5;
        }
        .synonym-meta {
          font-size: 0.95rem;
          opacity: 0.85;
        }
        .muted-note {
          margin-top: 0.65rem;
          color: #aac0ee;
        }
        .synonym-progress {
          margin: 1rem 0 1.35rem;
          font-size: 1rem;
        }
        .synonym-card {
          padding: 1rem 0;
          margin-top: 0.2rem;
          border-top: 1px solid rgba(159, 184, 236, 0.18);
        }
        .synonym-question-card {
          background: transparent;
          border-radius: 0;
          box-shadow: none;
        }
        .mini-tag {
          display: inline-flex;
          align-items: center;
          padding: 0.22rem 0.58rem;
          border-radius: 999px;
          font-size: 0.76rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .question-top {
          justify-content: space-between;
        }
        .mini-tag {
          margin-right: 0.45rem;
          color: #cfe0ff;
          background: rgba(91, 143, 255, 0.18);
          border: 1px solid rgba(91, 143, 255, 0.34);
        }
        .mini-tag.ghost {
          color: #bad0ff;
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.12);
        }
        .fav-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 999px;
          border: 1px solid rgba(74, 121, 216, 0.45);
          background: #0f1b33;
          color: #dbe7ff;
          cursor: pointer;
        }
        .fav-btn.active {
          border-color: rgba(255, 211, 106, 0.6);
          background: rgba(255, 211, 106, 0.08);
        }
        .question-label {
          margin: 1rem 0 0.4rem;
          color: #9eb7e5;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .question-word {
          margin: 0;
          color: #ffffff;
          font-size: 1.8rem;
        }
        .option-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
          margin-top: 1rem;
        }
        .option-btn {
          width: 100%;
          text-align: left;
        }
        .option-btn.selected {
          border-color: #fdbf2d;
          color: #fdbf2d;
          background: rgba(253, 191, 45, 0.08);
        }
        .feedback-box {
          margin-top: 1rem;
          padding: 0.9rem 1rem;
          border-radius: 12px;
          border: 1px solid transparent;
        }
        .feedback-box.is-correct {
          background: rgba(40, 167, 110, 0.12);
          border-color: rgba(40, 167, 110, 0.28);
          color: #d9ffef;
        }
        .feedback-box.is-wrong {
          background: rgba(255, 180, 92, 0.12);
          border-color: rgba(255, 180, 92, 0.28);
          color: #fff2d8;
        }
        .feedback-box.compact {
          margin-top: 0.75rem;
        }
        .feedback-note {
          margin-top: 0.45rem;
          color: #bcd0f7;
          font-size: 0.92rem;
        }
        .exam-head {
          display: grid;
          gap: 0.7rem;
        }
        .exam-left {
          display: grid;
          gap: 0.85rem;
          margin-top: 1rem;
        }
        .exam-row {
          padding: 0.95rem;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .exam-prompt {
          display: flex;
          gap: 0.6rem;
          align-items: baseline;
          color: #eef4ff;
          margin-bottom: 0.8rem;
        }
        .exam-select-wrap {
          width: min(360px, 100%);
        }
        .exam-select-wrap .select {
          width: 100%;
          min-width: 0;
        }
        .exam-number {
          color: #8fb0f5;
          font-weight: 700;
        }
        @media (max-width: 820px) {
          .synonym-filters,
          .option-grid {
            grid-template-columns: 1fr;
          }
          .synonym-toolbar {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
          .synonym-pool-wrap {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
