import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import { getSitePath } from "../../siteConfig.js";
import { getHubVocabActivity, getHubVocabTheme } from "../../data/hubVocabularyActivities.js";
import {
  fetchHubVocabProgress,
  recordVocabMistake,
  saveHubVocabActivityResult,
} from "../../firebase.js";

function normalizeAnswer(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/[-–—]/g, " ")
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ")
    .replace(/[’']/g, "'");
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function makePrioritizedSession(items, itemLimit, seenItemIds = []) {
  const seen = new Set(seenItemIds);
  const unseenItems = shuffle(items.filter((item) => item?.id && !seen.has(item.id)));
  const previouslySeenItems = shuffle(items.filter((item) => item?.id && seen.has(item.id)));
  return [...unseenItems, ...previouslySeenItems].slice(0, itemLimit);
}

function makeUniquePrioritizedSession(items, itemLimit, seenItemIds = [], answerKey = "") {
  if (!answerKey) return makePrioritizedSession(items, itemLimit, seenItemIds);
  const prioritized = makePrioritizedSession(items, items.length, seenItemIds);
  const seenAnswers = new Set();
  return prioritized.filter((item) => {
    const normalized = normalizeAnswer(item?.[answerKey]);
    if (!normalized || seenAnswers.has(normalized)) return false;
    seenAnswers.add(normalized);
    return true;
  }).slice(0, itemLimit);
}

function shuffleDifferent(items) {
  if (items.length < 2) return [...items];
  const originalIds = items.map((item) => item.id);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const shuffled = shuffle(items);
    if (shuffled.some((item, index) => item.id !== originalIds[index])) return shuffled;
  }
  return [...items.slice(1), items[0]];
}

function moveItem(items, fromIndex, toIndex) {
  if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex)) return items;
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return items;
  if (fromIndex >= items.length || toIndex >= items.length) return items;
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function getStructuredAnswer(entry) {
  return entry?.answer || entry?.gapAnswers?.[0] || entry?.term || "";
}

function getStructuredAcceptedAnswers(entry) {
  return [getStructuredAnswer(entry), ...(entry?.acceptedAnswers || [])]
    .filter(Boolean)
    .map(normalizeAnswer);
}

function getStructuredOptions(entry, items, optionLimit = 4) {
  const correctAnswer = getStructuredAnswer(entry);
  const configured = Array.isArray(entry?.options) ? entry.options : [];
  const candidates = [
    ...configured,
    correctAnswer,
    ...shuffle(items.filter((item) => item.id !== entry.id)).map(getStructuredAnswer),
  ];
  const seen = new Set();
  const unique = candidates.filter((option) => {
    const normalized = normalizeAnswer(option);
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
  const accepted = new Set(getStructuredAcceptedAnswers(entry));
  if (configured.length) {
    const configuredCorrect = unique.filter((option) => accepted.has(normalizeAnswer(option)));
    const configuredDistractors = unique.filter((option) => !accepted.has(normalizeAnswer(option)));
    return shuffle([
      ...configuredCorrect,
      ...configuredDistractors.slice(0, Math.max(0, optionLimit - configuredCorrect.length)),
    ]);
  }
  const correctOption = unique.find((option) => accepted.has(normalizeAnswer(option))) || correctAnswer;
  const distractors = unique.filter((option) => !accepted.has(normalizeAnswer(option)));
  return shuffle([correctOption, ...distractors.slice(0, Math.max(1, optionLimit - 1))]);
}

function getActivityItems(theme, activity) {
  if (
    theme?.id === "people-family" &&
    (activity?.id === "family-matching" || activity?.id === "family-spelling")
  ) {
    return [...(theme.entries || []), ...(theme.familyEntries || [])];
  }
  const dataset = activity?.dataKey ? theme?.[activity.dataKey] : theme?.entries;
  return Array.isArray(dataset) ? dataset : [];
}

function getPrimaryLabel(entry, themeId) {
  if (themeId === "numbers") return entry.term;
  return entry.displayTerm || entry.term || entry.country || entry.phrase || "";
}

function getPromptLabel(entry, themeId) {
  if (themeId === "numbers") return entry.numeral;
  return entry.country || entry.term || entry.phrase || "";
}

function getTypeAnswer(entry, themeId) {
  if (themeId === "numbers") return entry.term;
  return entry.country || entry.term || entry.phrase || "";
}

function getAcceptedAnswers(entry, themeId, answerMode = "default") {
  const answer =
    answerMode === "nationality"
      ? entry.nationality
      : answerMode === "plural"
        ? entry.plural
        : answerMode === "opposite"
          ? entry.opposite
        : answerMode === "gap"
          ? entry.gapAnswers?.[0]
        : getTypeAnswer(entry, themeId);
  const answers = answerMode === "gap" ? [...(entry.gapAnswers || [])] : [answer, ...(entry.acceptedAnswers || [])];
  if (answerMode !== "nationality" && themeId === "numbers" && entry.also) answers.push(entry.also);
  if (answerMode !== "nationality" && themeId === "countries-nationalities") {
    answers.push(answer.replace(/^the\s+/i, ""));
  }
  return answers.map(normalizeAnswer);
}

function renderVisualPrompt(entry, options = {}) {
  const className = options.compact ? "hub-vocab-visual-tile compact" : "hub-vocab-visual-tile";
  if (entry.colorHex) {
    return (
      <div
        className={`${className} is-colour`}
        style={{ "--tile-colour": entry.colorHex }}
        aria-hidden="true"
      />
    );
  }
  if (entry.image) {
    const image = (
      <img
        src={entry.image}
        alt=""
        className={options.compact ? "hub-vocab-object-image compact" : "hub-vocab-object-image"}
        draggable="false"
      />
    );
    if (!entry.focusArea) return image;
    return (
      <span
        className={options.compact ? "hub-vocab-image-focus compact" : "hub-vocab-image-focus"}
        role="img"
        aria-label={entry.focusArea.label || "The relevant part of the image is highlighted."}
      >
        {image}
        <span
          className="hub-vocab-image-focus-marker"
          style={{
            "--focus-x": `${entry.focusArea.x}%`,
            "--focus-y": `${entry.focusArea.y}%`,
            "--focus-width": `${entry.focusArea.width}%`,
            "--focus-height": `${entry.focusArea.height}%`,
          }}
          aria-hidden="true"
        />
      </span>
    );
  }
  if (entry.cueText) {
    return (
      <strong className={options.compact ? "hub-vocab-cue-prompt compact" : "hub-vocab-cue-prompt"}>
        {entry.cueText}
      </strong>
    );
  }
  if (entry.flag4x3) {
    return (
      <img
        src={entry.flag4x3}
        alt=""
        className={options.compact ? "hub-vocab-flag-large compact" : "hub-vocab-flag-large"}
        draggable="false"
      />
    );
  }
  if (entry.numeral) {
    return (
      <strong className={options.compact ? "hub-vocab-number-large compact" : "hub-vocab-number-large"}>
        {entry.numeral}
      </strong>
    );
  }
  if (entry.visualLabel) {
    return (
      <div className={className} aria-hidden="true">
        <span>{entry.visualLabel}</span>
      </div>
    );
  }
  return <strong className="hub-vocab-country-prompt">{entry.country || entry.term || entry.phrase}</strong>;
}

function dedupeById(items = []) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function ProgressLine({ current, total, label = "complete", action = null }) {
  const safeTotal = Math.max(Number(total) || 0, 0);
  const safeCurrent = Math.min(Math.max(Number(current) || 0, 0), safeTotal);

  return (
    <div className="hub-vocab-progress-line">
      <span>{safeCurrent}/{safeTotal} {label}</span>
      {action}
    </div>
  );
}

function OverallCoverageTracker({ coverage }) {
  if (!coverage?.tracked) return null;
  const total = Math.max(Number(coverage.total) || 0, 0);
  const seen = Math.min(new Set(coverage.seenItemIds || []).size, total);
  const percentage = total ? Math.round((seen / total) * 100) : 0;

  return (
    <section className="hub-vocab-overall-progress" aria-label={`${seen} of ${total} activity items seen`}>
      <div>
        <strong>Overall activity progress</strong>
        <span>{seen}/{total} items seen</span>
      </div>
      <div className="hub-vocab-overall-progress-track" aria-hidden="true">
        <span style={{ width: `${percentage}%` }} />
      </div>
      <p>{seen >= total ? "You have seen every item." : "New items will be shown before repeated items."}</p>
    </section>
  );
}

function getDisplayAnswer(entry, themeId, answerMode = "default") {
  if (answerMode === "nationality") return entry.nationality || "";
  if (answerMode === "plural") return entry.plural || "";
  if (answerMode === "opposite") return entry.opposite || "";
  if (answerMode === "category") return entry.category || "";
  if (answerMode === "gap") return entry.gapAnswers?.[0] || "";
  if (entry.choiceAnswer) return entry.choiceAnswer;
  if (entry.article) return `${entry.article} ${entry.term}`;
  if (entry.speaker) return entry.speaker === "teacher" ? "The teacher says it" : "You say it";
  return getTypeAnswer(entry, themeId);
}

function getMistakePrompt(entry, theme, activity, answerMode = "default") {
  if (entry.sentence) return entry.sentence;
  if (answerMode === "clock") {
    return `Clock showing ${String(entry.hour).padStart(2, "0")}:${String(entry.minute).padStart(2, "0")}`;
  }
  if (answerMode === "sequence") return entry.term || entry.phrase || activity?.title || theme.title;
  if (entry.gappedPhrase) return entry.gappedPhrase;
  if (entry.gapCueText) return entry.gapCueText;
  if (entry.imagePrompt) return entry.imagePrompt;
  if (entry.cueText) return entry.cueText;
  if (entry.hotspotNumber) return `Number ${entry.hotspotNumber}`;
  if (answerMode === "nationality") return `Nationality for ${entry.country}`;
  if (answerMode === "opposite") return `Opposite of ${entry.cueText || entry.displayTerm || entry.term}`;
  if (answerMode === "plural") return `Plural of ${entry.singular || entry.term}`;
  // A visual is the prompt in image-led activities. Falling through to the
  // vocabulary label here would save the answer itself as the review prompt.
  if (entry.image || entry.flag4x3 || entry.colorHex || entry.visualLabel) return "";
  return getPromptLabel(entry, theme.id) || activity?.title || theme.title;
}

function ActivityCompleteCard({
  title = "Set complete",
  total = 0,
  mistakes = [],
  completedItemIds = [],
  coverage = null,
  onRestart,
  onReviewMistakes,
  onComplete,
}) {
  const didCompleteRef = useRef(false);
  const isCoverageRound = Boolean(coverage?.tracked && onComplete);
  const coverageSeen = new Set([
    ...(coverage?.seenItemIds || []),
    ...completedItemIds,
  ]).size;
  const coverageTotal = Number(coverage?.total) || 0;
  const overallComplete = isCoverageRound && coverageTotal > 0 && coverageSeen >= coverageTotal;

  useEffect(() => {
    if (didCompleteRef.current) return;
    didCompleteRef.current = true;
    onComplete?.({
      total,
      mistakes: dedupeById(mistakes),
      itemIds: completedItemIds,
    });
  }, [completedItemIds, onComplete, total]);

  return (
    <section className="hub-vocab-practice-card hub-vocab-complete-card">
      <div className="hub-vocab-complete-copy">
        <span className="hub-vocab-phrase-kicker">
          {isCoverageRound ? (overallComplete ? "Activity complete" : "Round complete") : "Set complete"}
        </span>
        <h2>{isCoverageRound && !overallComplete ? "Round complete" : title}</h2>
        {isCoverageRound ? (
          <p>
            You have now covered <strong>{Math.min(coverageSeen, coverageTotal)}</strong> of{" "}
            <strong>{coverageTotal}</strong> items.
            {!overallComplete ? ` ${Math.max(coverageTotal - coverageSeen, 0)} still to see.` : " You have seen every item."}
          </p>
        ) : (
          <p>
            You finished <strong>{total}</strong> item{total === 1 ? "" : "s"}.
          </p>
        )}
        {mistakes.length ? (
          <p>
            You have <strong>{mistakes.length}</strong> mistake
            {mistakes.length === 1 ? "" : "s"} to review.
          </p>
        ) : (
          <p>No mistakes this round. Nice work.</p>
        )}
      </div>

      <div className="hub-vocab-runner-actions">
        <button type="button" onClick={onRestart}>
          {isCoverageRound && !overallComplete ? "Start next set" : "Restart set"}
        </button>
        {mistakes.length && onReviewMistakes ? (
          <button type="button" onClick={onReviewMistakes}>Review mistakes</button>
        ) : null}
      </div>
    </section>
  );
}

function ActivityTabs({ theme, activityId, progressMap = {} }) {
  const navigate = useNavigate();

  return (
    <div className="hub-vocab-tabs" aria-label="Vocabulary activity types">
      {theme.activities.map((activity) => {
        const completed = Boolean(progressMap[`${theme.id}:${activity.id}`]?.completed);
        return (
          <button
            key={activity.id}
            type="button"
            className={`${activity.id === activityId ? "active" : ""} ${completed ? "completed" : ""}`}
            onClick={() => navigate(getSitePath(`/vocabulary/textbook/${theme.id}/${activity.id}`))}
          >
            {activity.title}
            {completed ? <span className="hub-vocab-tab-check" aria-label="Completed">✓</span> : null}
          </button>
        );
      })}
    </div>
  );
}

function FlashcardMode({
  items,
  activity,
  flagMode = false,
  phraseMode = false,
  coverage = null,
  onItemSeen,
  onComplete,
}) {
  const configuredLimit = Number(activity?.itemLimit);
  const itemLimit = Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : items.length;
  const seenItemIdsRef = useRef(coverage?.seenItemIds || []);
  seenItemIdsRef.current = coverage?.seenItemIds || [];
  const makeDeck = useCallback(
    (source = items) => makePrioritizedSession(source, itemLimit, seenItemIdsRef.current),
    [itemLimit, items]
  );
  const [cardEntries, setCardEntries] = useState(() => makeDeck());
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewedIds, setViewedIds] = useState(() => new Set());
  const entry = cardEntries[index];
  const isRoundComplete = cardEntries.length > 0 && viewedIds.size >= cardEntries.length;

  useEffect(() => {
    if (!entry?.id) return;
    onItemSeen?.(entry.id);
    setViewedIds((prev) => {
      if (prev.has(entry.id)) return prev;
      const next = new Set(prev);
      next.add(entry.id);
      return next;
    });
  }, [entry?.id, onItemSeen]);

  useEffect(() => {
    function handleKeyDown(event) {
      const tagName = event.target?.tagName?.toLowerCase();
      if (["input", "textarea", "select"].includes(tagName) || event.target?.isContentEditable) {
        return;
      }

      if (event.key === " " || event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        setIsFlipped((prev) => !prev);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cardEntries.length]);

  function move(direction) {
    setIsFlipped(false);
    setIndex((prev) => (prev + direction + cardEntries.length) % cardEntries.length);
  }

  function reshuffle() {
    const nextEntries = makeDeck();
    setCardEntries(nextEntries);
    setIndex(0);
    setIsFlipped(false);
    setViewedIds(nextEntries[0]?.id ? new Set([nextEntries[0].id]) : new Set());
  }

  if (isRoundComplete) {
    return (
      <ActivityCompleteCard
        title="Flashcard activity complete"
        total={cardEntries.length}
        mistakes={[]}
        completedItemIds={cardEntries.map((item) => item.id)}
        coverage={coverage}
        onRestart={reshuffle}
        onReviewMistakes={null}
        onComplete={onComplete}
      />
    );
  }

  return (
    <section className="hub-vocab-practice-card">
      <div className="hub-vocab-card-count">
        <span>Card {index + 1} of {cardEntries.length} · viewed {Math.min(viewedIds.size, cardEntries.length)}/{cardEntries.length}</span>
        <span className="hub-vocab-shortcuts">Space / ↑ / ↓ flip · ← / → move</span>
      </div>

      <button type="button" className="hub-vocab-flashcard" onClick={() => setIsFlipped((prev) => !prev)}>
        {!isFlipped ? (
          <div className="hub-vocab-card-face">
            {phraseMode ? (
              <>
                <span className="hub-vocab-phrase-kicker">Phrase</span>
                <strong className="hub-vocab-country-prompt">{entry.phrase}</strong>
              </>
            ) : (
              entry.image
                ? (
                  <>
                    {renderVisualPrompt(flagMode ? { ...entry, flag4x3: entry.flag4x3 } : entry)}
                    {entry.imagePrompt ? <strong className="hub-vocab-image-gap-prompt">{entry.imagePrompt}</strong> : null}
                  </>
                )
                : entry.flashcardPrompt
                  ? <strong className="hub-vocab-cue-prompt hub-vocab-flashcard-text-prompt">{entry.flashcardPrompt}</strong>
                  : renderVisualPrompt(flagMode ? { ...entry, flag4x3: entry.flag4x3 } : entry)
            )}
            <span>Tap to reveal</span>
          </div>
        ) : (
          <div className="hub-vocab-card-face is-answer">
            {phraseMode ? (
              <>
                <strong>{entry.speaker === "teacher" ? "The teacher says it" : "You say it"}</strong>
                <span>{entry.speaker === "teacher" ? "teacher phrase" : "student phrase"}</span>
              </>
            ) : flagMode ? (
              <>
                <strong>{entry.country}</strong>
                <span>{entry.nationality}</span>
              </>
            ) : (
              <>
                <strong>{entry.flashcardAnswer || entry.displayTerm || entry.term}</strong>
                <span>{entry.flashcardNote || entry.pronunciation || entry.spokenLabel || entry.displayTerm || entry.term}</span>
              </>
            )}
          </div>
        )}
      </button>

      <div className="hub-vocab-runner-actions">
        <button type="button" onClick={() => move(-1)}>Previous</button>
        <button type="button" onClick={() => setIsFlipped((prev) => !prev)}>
          {isFlipped ? "Hide answer" : "Show answer"}
        </button>
        <button type="button" onClick={() => move(1)}>Next</button>
        <button type="button" onClick={reshuffle}>Shuffle</button>
      </div>
    </section>
  );
}

function MatchingMode({
  theme,
  activity,
  items,
  coverage = null,
  onItemSeen,
  onComplete,
  onMistake,
}) {
  const configuredLimit = Number(activity?.itemLimit);
  const itemLimit = Number.isFinite(configuredLimit) && configuredLimit > 0
    ? Math.min(configuredLimit, items.length)
    : Math.min(8, items.length);
  const seenItemIdsRef = useRef(coverage?.seenItemIds || []);
  seenItemIdsRef.current = coverage?.seenItemIds || [];
  const makeSession = useCallback(
    (source = items) => makeUniquePrioritizedSession(
      source,
      itemLimit,
      seenItemIdsRef.current,
      activity?.uniqueMatchAnswerKey
    ),
    [activity?.uniqueMatchAnswerKey, itemLimit, items]
  );
  const [sessionItems, setSessionItems] = useState(() => makeSession());
  const [reviewItems, setReviewItems] = useState(null);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const [mistakeItems, setMistakeItems] = useState([]);
  const [status, setStatus] = useState("");

  const activeItems = reviewItems || sessionItems;
  const roundItems = useMemo(() => shuffle(activeItems), [activeItems]);
  const leftItems = useMemo(() => shuffle(roundItems), [roundItems]);
  const rightItems = useMemo(() => shuffle(roundItems), [roundItems]);
  const isComplete = roundItems.length > 0 && matchedIds.length === roundItems.length;

  useEffect(() => {
    if (reviewItems) return;
    roundItems.forEach((entry) => onItemSeen?.(entry.id));
  }, [onItemSeen, reviewItems, roundItems]);

  function chooseRight(entry) {
    if (!selectedLeft || matchedIds.includes(entry.id)) return;
    if (selectedLeft.id === entry.id) {
      setMatchedIds((prev) => [...prev, entry.id]);
      setSelectedLeft(null);
      setStatus("Nice match.");
    } else {
      setMistakeItems((prev) => dedupeById([...prev, selectedLeft]));
      onMistake?.(selectedLeft, {
        userAnswer: entry.matchAnswer || getPrimaryLabel(entry, theme.id),
        correctAnswer: selectedLeft.matchAnswer || getPrimaryLabel(selectedLeft, theme.id),
      });
      setStatus("Not that one. Try again.");
    }
  }

  function startNewRound(nextItems = items) {
    setSessionItems(makeSession(nextItems));
    setReviewItems(null);
    setSelectedLeft(null);
    setMatchedIds([]);
    setMistakeItems([]);
    setStatus("");
  }

  function reviewMistakes() {
    const nextReviewItems = dedupeById(mistakeItems);
    setReviewItems(nextReviewItems);
    setSelectedLeft(null);
    setMatchedIds([]);
    setMistakeItems([]);
    setStatus("");
  }

  if (isComplete) {
    return (
      <ActivityCompleteCard
        title={reviewItems ? "Mistake review complete" : "Matching set complete"}
        total={roundItems.length}
        mistakes={reviewItems ? [] : dedupeById(mistakeItems)}
        completedItemIds={roundItems.map((item) => item.id)}
        coverage={coverage}
        onRestart={() => startNewRound(items)}
        onReviewMistakes={reviewMistakes}
        onComplete={reviewItems ? null : onComplete}
      />
    );
  }

  return (
    <section className="hub-vocab-practice-card">
      <ProgressLine
        current={matchedIds.length}
        total={roundItems.length}
        label="matched"
        action={<button type="button" onClick={() => startNewRound(items)}>New round</button>}
      />

      <div className="hub-vocab-match-grid">
        <div className="hub-vocab-match-column">
          {leftItems.map((entry) => {
            const matched = matchedIds.includes(entry.id);
            return (
              <button
                key={entry.id}
                type="button"
                disabled={matched}
                className={`${selectedLeft?.id === entry.id ? "selected" : ""} ${matched ? "matched" : ""}`}
                onClick={() => setSelectedLeft(entry)}
              >
                {entry.matchPrompt
                  ? <strong className="hub-vocab-cue-prompt compact">{entry.matchPrompt}</strong>
                  : renderVisualPrompt(entry, { compact: true })}
              </button>
            );
          })}
        </div>

        <div className="hub-vocab-match-column">
          {rightItems.map((entry) => {
            const matched = matchedIds.includes(entry.id);
            return (
              <button
                key={entry.id}
                type="button"
                disabled={matched}
                className={matched ? "matched" : ""}
                onClick={() => chooseRight(entry)}
              >
                {entry.matchAnswer || getPrimaryLabel(entry, theme.id)}
              </button>
            );
          })}
        </div>
      </div>

      {status ? <p className="hub-vocab-status">{status}</p> : null}
    </section>
  );
}

function ChoiceMode({
  theme,
  activity,
  items,
  mode = "word",
  coverage = null,
  onItemSeen,
  onComplete,
  onMistake,
}) {
  const configuredLimit = Number(activity?.itemLimit);
  const itemLimit = Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : items.length;
  const seenItemIdsRef = useRef(coverage?.seenItemIds || []);
  seenItemIdsRef.current = coverage?.seenItemIds || [];
  const makeSession = useCallback(
    (source = items) => makePrioritizedSession(source, itemLimit, seenItemIdsRef.current),
    [itemLimit, items]
  );
  const [sessionItems, setSessionItems] = useState(() => makeSession());
  const [reviewItems, setReviewItems] = useState(null);
  const [index, setIndex] = useState(0);
  const [choiceStatus, setChoiceStatus] = useState(null);
  const [mistakeItems, setMistakeItems] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const entries = reviewItems || sessionItems;
  const entry = entries[index % entries.length];
  const isGapChoiceMode = mode === "gap";

  useEffect(() => {
    setSessionItems(makeSession());
    setReviewItems(null);
    setIndex(0);
    setChoiceStatus(null);
    setMistakeItems([]);
    setIsComplete(false);
  }, [makeSession, mode, theme.id]);

  useEffect(() => {
    if (!reviewItems && entry?.id) onItemSeen?.(entry.id);
  }, [entry?.id, onItemSeen, reviewItems]);

  const options = useMemo(() => {
    if (isGapChoiceMode) {
      const correctLabel = entry.gapAnswers?.[0] || entry.term;
      const seen = new Set([normalizeAnswer(correctLabel)]);
      const distractors = [];
      shuffle(items).forEach((item) => {
        const label = item.gapAnswers?.[0] || item.term;
        const normalized = normalizeAnswer(label);
        if (!normalized || seen.has(normalized)) return;
        seen.add(normalized);
        distractors.push(label);
      });
      return shuffle([
        { id: `correct-${correctLabel}`, label: correctLabel, correct: true },
        ...distractors.slice(0, 3).map((label) => ({
          id: `distractor-${label}`,
          label,
          correct: false,
        })),
      ]);
    }

    const key =
      entry.choiceAnswer
        ? "choiceAnswer"
        : mode === "nationality"
          ? "nationality"
          : mode === "opposite"
            ? "opposite"
            : mode === "category"
              ? "category"
              : mode === "plural"
                ? "plural"
                : theme.id === "numbers"
                  ? "term"
                  : entry.country
                    ? "country"
                    : "term";
    if (Array.isArray(entry.options) && entry.options.length) {
      const correctLabels = new Set(
        [entry[key], ...(entry.acceptedAnswers || [])].filter(Boolean).map(normalizeAnswer)
      );
      const seen = new Set();
      const configuredOptions = [entry[key], ...entry.options].filter((label) => {
        const normalized = normalizeAnswer(label);
        if (!normalized || seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
      });
      return shuffle(configuredOptions).map((label) => ({
        id: `${entry.id}-${normalizeAnswer(label)}`,
        label,
        correct: correctLabels.has(normalizeAnswer(label)),
      }));
    }
    const distractors = shuffle(entries.filter((item) => item.id !== entry.id)).slice(0, 3);
    return shuffle([entry, ...distractors]).map((item) => ({
      id: item.id,
      label: item[key],
      correct: item.id === entry.id,
    }));
  }, [entries, entry, isGapChoiceMode, items, mode, theme.id]);

  useEffect(() => {
    if (choiceStatus !== "correct") return undefined;
    const timer = window.setTimeout(next, 700);
    return () => window.clearTimeout(timer);
  }, [choiceStatus]);

  function choose(option) {
    if (option.correct) {
      setChoiceStatus("correct");
    } else {
      setMistakeItems((prev) => dedupeById([...prev, entry]));
      onMistake?.(entry, {
        userAnswer: option.label,
        correctAnswer: option.correct ? option.label : getDisplayAnswer(entry, theme.id, mode),
        answerMode: mode,
      });
      setChoiceStatus("wrong");
    }
  }

  function next() {
    setChoiceStatus(null);
    if (index >= entries.length - 1) {
      setIsComplete(true);
      return;
    }
    setIndex((prev) => prev + 1);
  }

  function restart() {
    setSessionItems(makeSession());
    setReviewItems(null);
    setIndex(0);
    setChoiceStatus(null);
    setMistakeItems([]);
    setIsComplete(false);
  }

  function reviewMistakes() {
    const nextReviewItems = dedupeById(mistakeItems);
    setReviewItems(nextReviewItems);
    setIndex(0);
    setChoiceStatus(null);
    setMistakeItems([]);
    setIsComplete(false);
  }

  if (isComplete) {
    return (
      <ActivityCompleteCard
        title={reviewItems ? "Mistake review complete" : "Set complete"}
        total={entries.length}
        mistakes={reviewItems ? [] : dedupeById(mistakeItems)}
        completedItemIds={reviewItems ? [] : sessionItems.map((item) => item.id)}
        coverage={coverage}
        onRestart={restart}
        onReviewMistakes={reviewMistakes}
        onComplete={reviewItems ? null : onComplete}
      />
    );
  }

  return (
    <section className="hub-vocab-practice-card">
      <ProgressLine current={index + 1} total={entries.length} label="questions" />

      <div className="hub-vocab-choice-prompt">
        {mode === "opposite" ? (
          <strong className="hub-vocab-country-prompt">{entry.cueText || entry.displayTerm || entry.term}</strong>
        ) : mode === "category" ? (
          renderVisualPrompt(entry)
        ) : mode === "plural" ? (
          <strong className="hub-vocab-country-prompt">{entry.singular || entry.term}</strong>
        ) : isGapChoiceMode ? (
          <>
            {entry.image ? renderVisualPrompt(entry) : null}
            <strong className="hub-vocab-country-prompt">{entry.cueText || entry.term}</strong>
          </>
        ) : (
          <>
            {renderVisualPrompt(entry)}
            {entry.imagePrompt ? <strong className="hub-vocab-image-gap-prompt">{entry.imagePrompt}</strong> : null}
          </>
        )}
        <p>
          {entry.question
            ? entry.question
            : mode === "nationality"
            ? `What nationality is someone from ${entry.country}?`
            : mode === "opposite"
              ? `What is the opposite of ${entry.cueText || entry.displayTerm || entry.term}?`
              : mode === "category"
                ? `Is ${entry.term} food or drink?`
              : mode === "plural"
                ? `Choose the plural of ${entry.singular || entry.term}.`
              : isGapChoiceMode
                ? "Choose the missing words."
            : `Choose the correct ${
                entry.cueText ? "phrase" : theme.id === "numbers" ? "word" : entry.country ? "country" : "word"
              }.`}
        </p>
      </div>

      <div className="hub-vocab-choice-grid">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={
              choiceStatus && option.correct
                ? "correct"
                : choiceStatus === "wrong" && !option.correct
                  ? "dimmed"
                  : ""
            }
            onClick={() => choose(option)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {choiceStatus ? (
        <div className={`hub-vocab-feedback ${choiceStatus}`}>
          {choiceStatus === "correct" ? "Correct. Next one coming..." : "Not quite. Try again or move on."}
          {choiceStatus === "wrong" ? <button type="button" onClick={next}>Next</button> : null}
        </div>
      ) : null}
    </section>
  );
}

function SpeakerChoiceMode({ theme, items, onComplete, onMistake }) {
  const [sessionItems, setSessionItems] = useState(() => shuffle(items));
  const [reviewItems, setReviewItems] = useState(null);
  const [index, setIndex] = useState(0);
  const [choiceStatus, setChoiceStatus] = useState(null);
  const [mistakeItems, setMistakeItems] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const activeItems = reviewItems || sessionItems;
  const entry = activeItems[index % activeItems.length];

  useEffect(() => {
    setSessionItems(shuffle(items));
    setReviewItems(null);
    setIndex(0);
    setChoiceStatus(null);
    setMistakeItems([]);
    setIsComplete(false);
  }, [items]);

  useEffect(() => {
    if (choiceStatus !== "correct") return undefined;
    const timer = window.setTimeout(next, 700);
    return () => window.clearTimeout(timer);
  }, [choiceStatus]);

  function next() {
    setChoiceStatus(null);
    if (index >= activeItems.length - 1) {
      setIsComplete(true);
      return;
    }
    setIndex((prev) => prev + 1);
  }

  function choose(optionValue) {
    if (optionValue === entry.speaker) {
      setChoiceStatus("correct");
    } else {
      setMistakeItems((prev) => dedupeById([...prev, entry]));
      onMistake?.(entry, {
        userAnswer: optionValue === "teacher" ? "The teacher says it" : "You say it",
        correctAnswer: getDisplayAnswer(entry, theme.id),
      });
      setChoiceStatus("wrong");
    }
  }

  function restart() {
    setSessionItems(shuffle(items));
    setReviewItems(null);
    setIndex(0);
    setChoiceStatus(null);
    setMistakeItems([]);
    setIsComplete(false);
  }

  function reviewMistakes() {
    const nextReviewItems = dedupeById(mistakeItems);
    setReviewItems(nextReviewItems);
    setIndex(0);
    setChoiceStatus(null);
    setMistakeItems([]);
    setIsComplete(false);
  }

  if (isComplete) {
    return (
      <ActivityCompleteCard
        title={reviewItems ? "Mistake review complete" : "Set complete"}
        total={activeItems.length}
        mistakes={reviewItems ? [] : dedupeById(mistakeItems)}
        onRestart={restart}
        onReviewMistakes={reviewMistakes}
        onComplete={reviewItems ? null : onComplete}
      />
    );
  }

  return (
    <section className="hub-vocab-practice-card">
      <ProgressLine current={index + 1} total={activeItems.length} label="questions" />

      <div className="hub-vocab-choice-prompt">
        <strong className="hub-vocab-country-prompt">{entry.phrase}</strong>
        <p>Who usually says this?</p>
      </div>

      <div className="hub-vocab-choice-grid article-grid">
        {[
          { value: "teacher", label: "The teacher says it" },
          { value: "student", label: "You say it" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            className={
              choiceStatus && option.value === entry.speaker
                ? "correct"
                : choiceStatus === "wrong" && option.value !== entry.speaker
                  ? "dimmed"
                  : ""
            }
            onClick={() => choose(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {choiceStatus ? (
        <div className={`hub-vocab-feedback ${choiceStatus}`}>
          {choiceStatus === "correct"
            ? "Correct. Next one coming..."
            : `Not quite. This is usually ${entry.speaker === "teacher" ? "a teacher phrase" : "something the student says"}.`}
          {choiceStatus === "wrong" ? <button type="button" onClick={next}>Next</button> : null}
        </div>
      ) : null}
    </section>
  );
}

function TypeAnswerMode({
  theme,
  items,
  activity,
  answerMode = "default",
  coverage = null,
  onItemSeen,
  onComplete,
  onMistake,
}) {
  const configuredLimit = Number(activity?.itemLimit);
  const itemLimit = Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : items.length;
  const seenItemIdsRef = useRef(coverage?.seenItemIds || []);
  seenItemIdsRef.current = coverage?.seenItemIds || [];
  const makeSession = useCallback(
    (source = items) => makePrioritizedSession(source, itemLimit, seenItemIdsRef.current),
    [itemLimit, items]
  );
  const [sessionItems, setSessionItems] = useState(() => makeSession());
  const [reviewItems, setReviewItems] = useState(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [mistakeItems, setMistakeItems] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const activeItems = reviewItems || sessionItems;
  const entry = activeItems[index % activeItems.length];
  const isNationalityMode = answerMode === "nationality";
  const isPluralMode = answerMode === "plural";
  const isOppositeMode = answerMode === "opposite";
  const isGapMode = answerMode === "gap";
  const answerLabel = isNationalityMode
    ? "Nationality"
    : isPluralMode
      ? "Plural form"
    : isOppositeMode
      ? "Opposite adjective"
    : isGapMode
      ? activity?.answerLabel || "Missing words"
    : activity?.answerLabel
      ? activity.answerLabel
    : theme.id === "numbers"
      ? "Number in words"
      : theme.id === "countries-nationalities"
        ? "Country"
        : "Word";
  const answerPlaceholder = isNationalityMode
    ? "e.g. Brazilian"
    : isPluralMode
      ? "Type the plural"
    : isOppositeMode
      ? "Type the opposite"
    : isGapMode
      ? activity?.answerPlaceholder || "Type the missing words"
    : activity?.answerPlaceholder
      ? activity.answerPlaceholder
    : theme.id === "numbers"
      ? "e.g. twenty-one"
      : "Type the word";

  useEffect(() => {
    setSessionItems(makeSession());
    setReviewItems(null);
    setIndex(0);
    setAnswer("");
    setFeedback(null);
    setMistakeItems([]);
    setIsComplete(false);
  }, [answerMode, makeSession, theme.id]);

  useEffect(() => {
    if (!reviewItems && entry?.id) onItemSeen?.(entry.id);
  }, [entry?.id, onItemSeen, reviewItems]);

  function checkAnswer(event) {
    event.preventDefault();
    const accepted = getAcceptedAnswers(entry, theme.id, answerMode);
    const isCorrect = accepted.includes(normalizeAnswer(answer));
    if (!isCorrect) {
      setMistakeItems((prev) => dedupeById([...prev, entry]));
      onMistake?.(entry, {
        userAnswer: answer,
        correctAnswer: getDisplayAnswer(entry, theme.id, answerMode),
        acceptedAnswers: getAcceptedAnswers(entry, theme.id, answerMode),
        answerMode,
      });
    }
    setFeedback(isCorrect ? "correct" : "wrong");
  }

  useEffect(() => {
    if (feedback !== "correct") return undefined;
    const timer = window.setTimeout(next, 700);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  function next() {
    setAnswer("");
    setFeedback(null);
    if (index >= activeItems.length - 1) {
      setIsComplete(true);
      return;
    }
    setIndex((prev) => prev + 1);
  }

  function restart() {
    setSessionItems(makeSession());
    setReviewItems(null);
    setIndex(0);
    setAnswer("");
    setFeedback(null);
    setMistakeItems([]);
    setIsComplete(false);
  }

  function reviewMistakes() {
    const nextReviewItems = dedupeById(mistakeItems);
    setReviewItems(nextReviewItems);
    setIndex(0);
    setAnswer("");
    setFeedback(null);
    setMistakeItems([]);
    setIsComplete(false);
  }

  if (isComplete) {
    return (
      <ActivityCompleteCard
        title={reviewItems ? "Mistake review complete" : "Set complete"}
        total={activeItems.length}
        mistakes={reviewItems ? [] : dedupeById(mistakeItems)}
        completedItemIds={reviewItems ? [] : sessionItems.map((item) => item.id)}
        coverage={coverage}
        onRestart={restart}
        onReviewMistakes={reviewMistakes}
        onComplete={reviewItems ? null : onComplete}
      />
    );
  }

  return (
    <section className="hub-vocab-practice-card">
      <ProgressLine current={index + 1} total={activeItems.length} label="questions" />

      <form className="hub-vocab-type-form" onSubmit={checkAnswer}>
        <div className="hub-vocab-choice-prompt">
          {isNationalityMode ? (
            <strong className="hub-vocab-country-prompt">{entry.country}</strong>
          ) : isPluralMode ? (
            <>
              <strong className="hub-vocab-country-prompt">{entry.singular || entry.term}</strong>
              <p>Type the plural form.</p>
            </>
          ) : isOppositeMode ? (
            <>
              <strong className="hub-vocab-country-prompt">{entry.cueText || entry.displayTerm || entry.term}</strong>
              <p>Type the opposite adjective.</p>
            </>
          ) : isGapMode ? (
            <>
              {entry.image ? renderVisualPrompt(entry) : null}
              <strong className="hub-vocab-country-prompt">{entry.cueText || entry.term}</strong>
              <p>Type only the missing word{entry.gapAnswers?.[0]?.includes(" ") ? "s" : ""}.</p>
            </>
          ) : activity?.showGapPrompt && entry.gapCueText ? (
            <>
              {renderVisualPrompt(entry)}
              <strong className="hub-vocab-country-prompt">{entry.gapCueText}</strong>
            </>
          ) : entry.image && entry.imagePrompt ? (
            <>
              {renderVisualPrompt(entry)}
              <strong className="hub-vocab-image-gap-prompt">{entry.imagePrompt}</strong>
            </>
          ) : entry.image && entry.cueText ? (
            <>
              {renderVisualPrompt(entry)}
              <strong className="hub-vocab-country-prompt">{entry.cueText}</strong>
            </>
          ) : (
            renderVisualPrompt(entry)
          )}
        </div>

        <label>
          <span>{answerLabel}</span>
          <input
            value={answer}
            onChange={(event) => {
              setAnswer(event.target.value);
              if (feedback === "wrong") setFeedback(null);
            }}
            placeholder={answerPlaceholder}
            autoComplete="off"
          />
        </label>

        <div className="hub-vocab-runner-actions">
          <button type="submit">Check</button>
          <button type="button" onClick={next}>Skip / next</button>
        </div>
      </form>

      {feedback ? (
        <div className={`hub-vocab-feedback ${feedback}`}>
          {feedback === "correct" ? (
            <span>Correct. Next one coming...</span>
          ) : (
            <span>
              Answer: <strong>{isNationalityMode ? entry.nationality : isPluralMode ? entry.plural : isOppositeMode ? entry.opposite : isGapMode ? entry.gapAnswers?.[0] : getTypeAnswer(entry, theme.id)}</strong>
            </span>
          )}
          {feedback === "wrong" ? <button type="button" onClick={next}>Next</button> : null}
        </div>
      ) : null}
    </section>
  );
}

function PhraseGapFillMode({ items, onComplete, onMistake }) {
  const gapItems = useMemo(() => items.filter((entry) => entry.gappedPhrase && entry.gapAnswers?.length), [items]);
  const [sessionItems, setSessionItems] = useState(() => shuffle(gapItems));
  const [reviewItems, setReviewItems] = useState(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [mistakeItems, setMistakeItems] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const activeItems = reviewItems || sessionItems;
  const entry = activeItems[index % activeItems.length];

  useEffect(() => {
    setSessionItems(shuffle(gapItems));
    setReviewItems(null);
    setIndex(0);
    setAnswer("");
    setFeedback(null);
    setMistakeItems([]);
    setIsComplete(false);
  }, [gapItems]);

  useEffect(() => {
    if (feedback !== "correct") return undefined;
    const timer = window.setTimeout(next, 700);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  function checkAnswer(event) {
    event.preventDefault();
    const accepted = (entry.gapAnswers || []).map(normalizeAnswer);
    const isCorrect = accepted.includes(normalizeAnswer(answer));
    if (!isCorrect) {
      setMistakeItems((prev) => dedupeById([...prev, entry]));
      onMistake?.(entry, {
        userAnswer: answer,
        correctAnswer: entry.gapAnswers?.[0] || "",
        answerMode: "gap",
      });
    }
    setFeedback(isCorrect ? "correct" : "wrong");
  }

  function next() {
    setAnswer("");
    setFeedback(null);
    if (index >= activeItems.length - 1) {
      setIsComplete(true);
      return;
    }
    setIndex((prev) => prev + 1);
  }

  function restart() {
    setSessionItems(shuffle(gapItems));
    setReviewItems(null);
    setIndex(0);
    setAnswer("");
    setFeedback(null);
    setMistakeItems([]);
    setIsComplete(false);
  }

  function reviewMistakes() {
    const nextReviewItems = dedupeById(mistakeItems);
    setReviewItems(nextReviewItems);
    setIndex(0);
    setAnswer("");
    setFeedback(null);
    setMistakeItems([]);
    setIsComplete(false);
  }

  if (!entry) return null;

  if (isComplete) {
    return (
      <ActivityCompleteCard
        title={reviewItems ? "Mistake review complete" : "Set complete"}
        total={activeItems.length}
        mistakes={reviewItems ? [] : dedupeById(mistakeItems)}
        onRestart={restart}
        onReviewMistakes={reviewMistakes}
        onComplete={reviewItems ? null : onComplete}
      />
    );
  }

  return (
    <section className="hub-vocab-practice-card">
      <ProgressLine current={index + 1} total={activeItems.length} label="questions" />

      <form className="hub-vocab-type-form" onSubmit={checkAnswer}>
        <div className="hub-vocab-choice-prompt">
          {entry.image ? (
            <img
              src={entry.image}
              alt=""
              className="hub-vocab-phrase-image"
              draggable="false"
            />
          ) : null}
          <span className="hub-vocab-phrase-kicker">
            {entry.speaker === "teacher" ? "Teacher phrase" : "Student phrase"}
          </span>
          <strong className="hub-vocab-gapped-phrase">{entry.gappedPhrase}</strong>
        </div>

        <label>
          <span>Missing word</span>
          <input
            value={answer}
            onChange={(event) => {
              setAnswer(event.target.value);
              if (feedback === "wrong") setFeedback(null);
            }}
            placeholder="Type the missing word"
            autoComplete="off"
            autoFocus
          />
        </label>

        <div className="hub-vocab-runner-actions">
          <button type="submit">Check</button>
          <button type="button" onClick={next}>Skip / next</button>
        </div>
      </form>

      {feedback ? (
        <div className={`hub-vocab-feedback ${feedback}`}>
          {feedback === "correct" ? (
            <span>Correct. Next one coming...</span>
          ) : (
            <span>
              Answer: <strong>{entry.gapAnswers?.[0]}</strong>
            </span>
          )}
          {feedback === "wrong" ? <button type="button" onClick={next}>Next</button> : null}
        </div>
      ) : null}
    </section>
  );
}

function getHotspotRounds(items, activity) {
  const configuredRounds = Array.isArray(activity?.rounds) ? activity.rounds : [];
  if (!configuredRounds.length) {
    return [{ id: "all", title: "All words", description: "", items, viewBox: null }];
  }

  const rounds = configuredRounds.map((round, index) => {
    const entryIds = new Set(round.entryIds || []);
    const categories = new Set(round.categories || []);
    const roundItems = items.filter((entry) => (
      entryIds.has(entry.id) || categories.has(entry.category)
    ));
    return {
      ...round,
      id: round.id || `round-${index + 1}`,
      items: roundItems,
    };
  }).filter((round) => round.items.length);

  return rounds.length ? rounds : [{ id: "all", title: "All words", description: "", items, viewBox: null }];
}

function getRoundNumberMap(items) {
  return Object.fromEntries(items.map((entry, index) => [entry.id, index + 1]));
}

function HotspotRoundHeader({ round, roundIndex, roundCount }) {
  return (
    <div className="hub-vocab-hotspot-round-header">
      <span>Round {roundIndex + 1} of {roundCount}</span>
      <div>
        <strong>{round.title}</strong>
        {round.description ? <p>{round.description}</p> : null}
      </div>
    </div>
  );
}

function HotelScene({
  image,
  items,
  selectedId = null,
  matchedIds = [],
  activeId = null,
  onSelect = null,
  viewBox = null,
  numberById = null,
}) {
  const hasViewBox = viewBox
    && Number(viewBox.width) > 0
    && Number(viewBox.height) > 0;
  const sceneStyle = hasViewBox
    ? { aspectRatio: `${(1.5 * viewBox.width) / viewBox.height}` }
    : undefined;
  const imageStyle = hasViewBox
    ? {
      height: `${10000 / viewBox.height}%`,
      left: `${(-viewBox.x * 100) / viewBox.width}%`,
      position: "absolute",
      top: `${(-viewBox.y * 100) / viewBox.height}%`,
      width: `${10000 / viewBox.width}%`,
    }
    : undefined;

  return (
    <div className={`hub-vocab-hotel-scene ${hasViewBox ? "is-zoomed" : ""}`} style={sceneStyle}>
      <img src={image} alt="" draggable="false" style={imageStyle} />
      {items.map((entry) => {
        const isMatched = matchedIds.includes(entry.id);
        const isSelected = selectedId === entry.id;
        const isActive = activeId === entry.id;
        const left = hasViewBox
          ? ((entry.hotspotX - viewBox.x) / viewBox.width) * 100
          : entry.hotspotX;
        const top = hasViewBox
          ? ((entry.hotspotY - viewBox.y) / viewBox.height) * 100
          : entry.hotspotY;
        const displayNumber = numberById?.[entry.id] || entry.hotspotNumber;
        return (
          <button
            key={entry.id}
            type="button"
            className={`${isMatched ? "matched" : ""} ${isSelected ? "selected" : ""} ${isActive ? "active" : ""}`}
            style={{ left: `${left}%`, top: `${top}%` }}
            onClick={onSelect ? () => onSelect(entry) : undefined}
            aria-label={`Number ${displayNumber}`}
          >
            {displayNumber}
          </button>
        );
      })}
    </div>
  );
}

function ImageHotspotMatchMode({ theme, items, activity, onComplete, onMistake }) {
  const rounds = useMemo(() => getHotspotRounds(items, activity), [items, activity]);
  const [roundIndex, setRoundIndex] = useState(0);
  const activeRound = rounds[roundIndex] || rounds[0];
  const [sessionItems, setSessionItems] = useState(() => shuffle(rounds[0]?.items || items));
  const [wordItems, setWordItems] = useState(() => shuffle(rounds[0]?.items || items));
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const [completedIds, setCompletedIds] = useState([]);
  const [mistakeItems, setMistakeItems] = useState([]);
  const [status, setStatus] = useState("");
  const isRoundComplete = matchedIds.length === sessionItems.length && sessionItems.length > 0;
  const isFinalRound = roundIndex === rounds.length - 1;
  const isComplete = isRoundComplete && isFinalRound;
  const numberById = useMemo(() => getRoundNumberMap(activeRound.items), [activeRound]);

  useEffect(() => {
    const firstRoundItems = rounds[0]?.items || items;
    setRoundIndex(0);
    setSessionItems(shuffle(firstRoundItems));
    setWordItems(shuffle(firstRoundItems));
    setSelectedHotspot(null);
    setMatchedIds([]);
    setCompletedIds([]);
    setMistakeItems([]);
    setStatus("");
  }, [items, rounds, theme.id]);

  function chooseWord(entry) {
    if (!selectedHotspot || matchedIds.includes(entry.id)) return;
    if (entry.id === selectedHotspot.id) {
      setMatchedIds((prev) => [...prev, entry.id]);
      setSelectedHotspot(null);
      setStatus("Correct.");
      return;
    }
    setMistakeItems((prev) => dedupeById([...prev, selectedHotspot]));
    onMistake?.(selectedHotspot, {
      userAnswer: entry.term,
      correctAnswer: selectedHotspot.term,
      mistakePrompt: `Number ${numberById[selectedHotspot.id] || selectedHotspot.hotspotNumber}`,
      hotspotNumber: numberById[selectedHotspot.id] || selectedHotspot.hotspotNumber,
      hotspotViewBox: activeRound.viewBox || null,
      sceneImage: activity?.sceneImage || theme.sceneImage || "",
    });
    setStatus("Not quite. Try another word.");
  }

  function restart() {
    const firstRoundItems = rounds[0]?.items || items;
    setRoundIndex(0);
    setSessionItems(shuffle(firstRoundItems));
    setWordItems(shuffle(firstRoundItems));
    setSelectedHotspot(null);
    setMatchedIds([]);
    setCompletedIds([]);
    setMistakeItems([]);
    setStatus("");
  }

  function restartRound() {
    setSessionItems(shuffle(activeRound.items));
    setWordItems(shuffle(activeRound.items));
    setSelectedHotspot(null);
    setMatchedIds([]);
    setStatus("");
  }

  function continueToNextRound() {
    const nextRoundIndex = roundIndex + 1;
    const nextRound = rounds[nextRoundIndex];
    setCompletedIds((prev) => dedupeById([...prev, ...sessionItems]));
    setRoundIndex(nextRoundIndex);
    setSessionItems(shuffle(nextRound.items));
    setWordItems(shuffle(nextRound.items));
    setSelectedHotspot(null);
    setMatchedIds([]);
    setStatus("");
  }

  if (isComplete) {
    return (
      <ActivityCompleteCard
        title="House matching complete"
        total={items.length}
        mistakes={dedupeById(mistakeItems)}
        onRestart={restart}
        onReviewMistakes={null}
        onComplete={onComplete}
      />
    );
  }

  if (isRoundComplete) {
    return (
      <section className="hub-vocab-practice-card hub-vocab-hotspot-card">
        <HotspotRoundHeader round={activeRound} roundIndex={roundIndex} roundCount={rounds.length} />
        <div className="hub-vocab-round-complete">
          <span aria-hidden="true">✓</span>
          <strong>{activeRound.title} complete</strong>
          <p>{completedIds.length + sessionItems.length} of {items.length} house words finished.</p>
          <button type="button" onClick={continueToNextRound}>Continue to {rounds[roundIndex + 1].title}</button>
        </div>
      </section>
    );
  }

  return (
    <section className="hub-vocab-practice-card hub-vocab-hotspot-card">
      <HotspotRoundHeader round={activeRound} roundIndex={roundIndex} roundCount={rounds.length} />
      <ProgressLine
        current={matchedIds.length}
        total={sessionItems.length}
        label="matched"
        action={<button type="button" onClick={restartRound}>Restart round</button>}
      />

      <div className={`hub-vocab-hotspot-layout ${activeRound.viewBox ? "is-zoomed-layout" : ""}`}>
        <HotelScene
          image={activity?.sceneImage || theme.sceneImage}
          items={sessionItems}
          selectedId={selectedHotspot?.id}
          matchedIds={matchedIds}
          viewBox={activeRound.viewBox}
          numberById={numberById}
          onSelect={(entry) => {
            if (matchedIds.includes(entry.id)) return;
            setSelectedHotspot(entry);
            setStatus(`Number ${numberById[entry.id] || entry.hotspotNumber} selected.`);
          }}
        />

        <div className="hub-vocab-hotspot-words">
          {wordItems.map((entry) => {
            const matched = matchedIds.includes(entry.id);
            return (
              <button
                key={entry.id}
                type="button"
                disabled={matched}
                className={matched ? "matched" : ""}
                onClick={() => chooseWord(entry)}
              >
                {entry.term}
              </button>
            );
          })}
        </div>
      </div>

      {status ? <p className="hub-vocab-status">{status}</p> : null}
    </section>
  );
}

function ImageHotspotTypeMode({ theme, items, activity, onComplete, onMistake }) {
  const rounds = useMemo(() => getHotspotRounds(items, activity), [items, activity]);
  const makeSession = useCallback(
    () => rounds.flatMap((round) => shuffle(round.items)),
    [rounds]
  );
  const [sessionItems, setSessionItems] = useState(() => rounds.flatMap((round) => shuffle(round.items)));
  const [reviewItems, setReviewItems] = useState(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [mistakeItems, setMistakeItems] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const activeItems = reviewItems || sessionItems;
  const entry = activeItems[index % activeItems.length];
  const activeRoundIndex = Math.max(0, rounds.findIndex((round) => round.items.some((item) => item.id === entry?.id)));
  const activeRound = rounds[activeRoundIndex] || rounds[0];
  const numberById = useMemo(() => getRoundNumberMap(activeRound.items), [activeRound]);
  const displayNumber = entry ? numberById[entry.id] : null;

  useEffect(() => {
    setSessionItems(makeSession());
    setReviewItems(null);
    setIndex(0);
    setAnswer("");
    setFeedback(null);
    setMistakeItems([]);
    setIsComplete(false);
  }, [items, makeSession, theme.id]);

  useEffect(() => {
    if (feedback !== "correct") return undefined;
    const timer = window.setTimeout(next, 700);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  function checkAnswer(event) {
    event.preventDefault();
    const accepted = [entry.term, ...(entry.acceptedAnswers || [])].map(normalizeAnswer);
    const isCorrect = accepted.includes(normalizeAnswer(answer));
    if (!isCorrect) {
      setMistakeItems((prev) => dedupeById([...prev, entry]));
      onMistake?.(entry, {
        userAnswer: answer,
        correctAnswer: entry.term,
        mistakePrompt: `Number ${displayNumber || entry.hotspotNumber}`,
        hotspotNumber: displayNumber || entry.hotspotNumber,
        hotspotViewBox: activeRound.viewBox || null,
        sceneImage: activity?.sceneImage || theme.sceneImage || "",
      });
    }
    setFeedback(isCorrect ? "correct" : "wrong");
  }

  function next() {
    setAnswer("");
    setFeedback(null);
    if (index >= activeItems.length - 1) {
      setIsComplete(true);
      return;
    }
    setIndex((prev) => prev + 1);
  }

  function restart() {
    setSessionItems(makeSession());
    setReviewItems(null);
    setIndex(0);
    setAnswer("");
    setFeedback(null);
    setMistakeItems([]);
    setIsComplete(false);
  }

  function reviewMistakes() {
    const nextReviewItems = dedupeById(mistakeItems);
    setReviewItems(nextReviewItems);
    setIndex(0);
    setAnswer("");
    setFeedback(null);
    setMistakeItems([]);
    setIsComplete(false);
  }

  if (!entry) return null;

  if (isComplete) {
    return (
      <ActivityCompleteCard
        title={reviewItems ? "Mistake review complete" : "Set complete"}
        total={activeItems.length}
        mistakes={reviewItems ? [] : dedupeById(mistakeItems)}
        onRestart={restart}
        onReviewMistakes={reviewMistakes}
        onComplete={reviewItems ? null : onComplete}
      />
    );
  }

  return (
    <section className="hub-vocab-practice-card hub-vocab-hotspot-card">
      <HotspotRoundHeader round={activeRound} roundIndex={activeRoundIndex} roundCount={rounds.length} />
      <ProgressLine current={index + 1} total={activeItems.length} label="questions" />

      <form className="hub-vocab-type-form" onSubmit={checkAnswer}>
        <div className="hub-vocab-choice-prompt">
          <HotelScene
            image={activity?.sceneImage || theme.sceneImage}
            items={activeRound.items}
            activeId={entry.id}
            viewBox={activeRound.viewBox}
            numberById={numberById}
          />
          <p>Type the word for number <strong>{displayNumber}</strong>.</p>
        </div>

        <label>
          <span>{activity?.answerLabel || "Word"}</span>
          <input
            value={answer}
            onChange={(event) => {
              setAnswer(event.target.value);
              if (feedback === "wrong") setFeedback(null);
            }}
            placeholder={activity?.answerPlaceholder || "Type the word"}
            autoComplete="off"
            autoFocus
          />
        </label>

        <div className="hub-vocab-runner-actions">
          <button type="submit">Check</button>
          <button type="button" onClick={next}>Skip / next</button>
        </div>
      </form>

      {feedback ? (
        <div className={`hub-vocab-feedback ${feedback}`}>
          {feedback === "correct" ? (
            <span>Correct. Next one coming...</span>
          ) : (
            <span>
              Answer: <strong>{entry.term}</strong>
            </span>
          )}
          {feedback === "wrong" ? <button type="button" onClick={next}>Next</button> : null}
        </div>
      ) : null}
    </section>
  );
}

function ArticleChoiceMode({ theme, items, onComplete, onMistake }) {
  const [sessionItems, setSessionItems] = useState(() => shuffle(items.filter((entry) => entry.article)));
  const [reviewItems, setReviewItems] = useState(null);
  const [index, setIndex] = useState(0);
  const [choiceStatus, setChoiceStatus] = useState(null);
  const articleItems = useMemo(() => items.filter((entry) => entry.article), [items]);
  const [mistakeItems, setMistakeItems] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const activeItems = reviewItems || sessionItems;
  const entry = activeItems[index % activeItems.length];

  useEffect(() => {
    setSessionItems(shuffle(articleItems));
    setReviewItems(null);
    setIndex(0);
    setChoiceStatus(null);
    setMistakeItems([]);
    setIsComplete(false);
  }, [articleItems]);

  useEffect(() => {
    if (choiceStatus !== "correct") return undefined;
    const timer = window.setTimeout(next, 700);
    return () => window.clearTimeout(timer);
  }, [choiceStatus]);

  function next() {
    setChoiceStatus(null);
    if (index >= activeItems.length - 1) {
      setIsComplete(true);
      return;
    }
    setIndex((prev) => prev + 1);
  }

  function choose(option) {
    if (option === entry.article) {
      setChoiceStatus("correct");
    } else {
      setMistakeItems((prev) => dedupeById([...prev, entry]));
      onMistake?.(entry, {
        userAnswer: `${option} ${entry.term}`,
        correctAnswer: getDisplayAnswer(entry, theme.id),
      });
      setChoiceStatus("wrong");
    }
  }

  function restart() {
    setSessionItems(shuffle(articleItems));
    setReviewItems(null);
    setIndex(0);
    setChoiceStatus(null);
    setMistakeItems([]);
    setIsComplete(false);
  }

  function reviewMistakes() {
    const nextReviewItems = dedupeById(mistakeItems);
    setReviewItems(nextReviewItems);
    setIndex(0);
    setChoiceStatus(null);
    setMistakeItems([]);
    setIsComplete(false);
  }

  if (isComplete) {
    return (
      <ActivityCompleteCard
        title={reviewItems ? "Mistake review complete" : "Set complete"}
        total={activeItems.length}
        mistakes={reviewItems ? [] : dedupeById(mistakeItems)}
        onRestart={restart}
        onReviewMistakes={reviewMistakes}
        onComplete={reviewItems ? null : onComplete}
      />
    );
  }

  return (
    <section className="hub-vocab-practice-card">
      <ProgressLine current={index + 1} total={activeItems.length} label="questions" />

      <div className="hub-vocab-choice-prompt">
        {renderVisualPrompt(entry)}
        <p>Choose the correct article before <strong>{entry.term}</strong>.</p>
      </div>

      <div className="hub-vocab-choice-grid article-grid">
        {["a", "an"].map((option) => (
          <button
            key={option}
            type="button"
            className={
              choiceStatus && option === entry.article
                ? "correct"
                : choiceStatus === "wrong" && option !== entry.article
                  ? "dimmed"
                  : ""
            }
            onClick={() => choose(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {choiceStatus ? (
        <div className={`hub-vocab-feedback ${choiceStatus}`}>
          {choiceStatus === "correct" ? `Correct. ${entry.article} ${entry.term}.` : `Not quite. It should be ${entry.article} ${entry.term}.`}
          {choiceStatus === "wrong" ? <button type="button" onClick={next}>Next</button> : null}
        </div>
      ) : null}
    </section>
  );
}

function EmptyActivityCard({ message = "This activity does not have any items yet." }) {
  return (
    <section className="hub-vocab-practice-card hub-vocab-empty-card">
      <strong>Activity unavailable</strong>
      <p>{message}</p>
    </section>
  );
}

function CategorySortMode({
  theme,
  activity,
  items,
  coverage = null,
  onItemSeen,
  onComplete,
  onMistake,
}) {
  const categoryKey = activity.categoryKey || "category";
  const categories = useMemo(() => {
    if (Array.isArray(activity.categories) && activity.categories.length) {
      return activity.categories.filter((category) => category?.id && category?.label);
    }
    return [...new Set(items.map((entry) => entry?.[categoryKey]).filter(Boolean))].map((value) => ({
      id: value,
      label: value,
    }));
  }, [activity.categories, categoryKey, items]);
  const categoryIds = useMemo(() => new Set(categories.map((category) => category.id)), [categories]);
  const eligibleItems = useMemo(
    () => items.filter((entry) => entry?.id && categoryIds.has(entry?.[categoryKey])),
    [categoryIds, categoryKey, items]
  );
  const itemLimit = Math.max(1, Number(activity.itemLimit) || 12);
  const seenItemIdsRef = useRef(coverage?.seenItemIds || []);
  seenItemIdsRef.current = coverage?.seenItemIds || [];
  const makeSession = useCallback(
    (source = eligibleItems) => makePrioritizedSession(source, itemLimit, seenItemIdsRef.current),
    [eligibleItems, itemLimit]
  );
  const [sessionItems, setSessionItems] = useState(() => makeSession());
  const [reviewItems, setReviewItems] = useState(null);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [mistakeItems, setMistakeItems] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const activeItems = reviewItems || sessionItems;
  const entry = activeItems[index];
  const next = useCallback(() => {
    setFeedback(null);
    if (index >= activeItems.length - 1) {
      setIsComplete(true);
      return;
    }
    setIndex((previous) => previous + 1);
  }, [activeItems.length, index]);

  useEffect(() => {
    setSessionItems(makeSession());
    setReviewItems(null);
    setIndex(0);
    setFeedback(null);
    setMistakeItems([]);
    setIsComplete(false);
  }, [makeSession, theme.id]);

  useEffect(() => {
    if (!reviewItems && entry?.id) onItemSeen?.(entry.id);
  }, [entry?.id, onItemSeen, reviewItems]);

  useEffect(() => {
    if (feedback?.status !== "correct") return undefined;
    const timer = window.setTimeout(next, 700);
    return () => window.clearTimeout(timer);
  }, [feedback, next]);

  function choose(category) {
    if (!entry || feedback) return;
    const expectedId = entry[categoryKey];
    const correctCategory = categories.find((item) => item.id === expectedId);
    if (category.id === expectedId) {
      setFeedback({ status: "correct", selectedId: category.id, correctId: expectedId });
      return;
    }
    setMistakeItems((previous) => dedupeById([...previous, entry]));
    onMistake?.(entry, {
      userAnswer: category.label,
      correctAnswer: correctCategory?.label || expectedId,
      answerMode: "category",
    });
    setFeedback({ status: "wrong", selectedId: category.id, correctId: expectedId });
  }

  function restart() {
    setSessionItems(makeSession());
    setReviewItems(null);
    setIndex(0);
    setFeedback(null);
    setMistakeItems([]);
    setIsComplete(false);
  }

  function reviewMistakes() {
    setReviewItems(dedupeById(mistakeItems));
    setIndex(0);
    setFeedback(null);
    setMistakeItems([]);
    setIsComplete(false);
  }

  if (!categories.length || !eligibleItems.length) {
    return <EmptyActivityCard message={`Add categories and entries with a ${categoryKey} field to use this activity.`} />;
  }

  if (isComplete) {
    return (
      <ActivityCompleteCard
        title={reviewItems ? "Mistake review complete" : "Sorting set complete"}
        total={activeItems.length}
        mistakes={reviewItems ? [] : dedupeById(mistakeItems)}
        completedItemIds={reviewItems ? [] : sessionItems.map((item) => item.id)}
        coverage={coverage}
        onRestart={restart}
        onReviewMistakes={reviewMistakes}
        onComplete={reviewItems ? null : onComplete}
      />
    );
  }

  return (
    <section className="hub-vocab-practice-card">
      <ProgressLine current={index + 1} total={activeItems.length} label="items" />
      <div className="hub-vocab-choice-prompt">
        {activity.promptKey && entry[activity.promptKey] ? (
          <strong className="hub-vocab-structured-prompt">{entry[activity.promptKey]}</strong>
        ) : entry.image ? renderVisualPrompt(entry) : (
          <strong className="hub-vocab-structured-prompt">{entry.term || entry.phrase}</strong>
        )}
        <p>{activity.prompt || "Choose the correct category."}</p>
      </div>
      <div className="hub-vocab-category-grid">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            disabled={Boolean(feedback)}
            className={
              feedback?.correctId === category.id
                ? "correct"
                : feedback?.selectedId === category.id
                  ? "wrong"
                  : feedback
                    ? "dimmed"
                    : ""
            }
            onClick={() => choose(category)}
          >
            {category.label}
          </button>
        ))}
      </div>
      {feedback ? (
        <div className={`hub-vocab-feedback ${feedback.status}`}>
          <span>
            {feedback.status === "correct"
              ? "Correct. Next one coming..."
              : <>Answer: <strong>{categories.find((category) => category.id === feedback.correctId)?.label}</strong></>}
          </span>
          {feedback.status === "wrong" ? <button type="button" onClick={next}>Next</button> : null}
        </div>
      ) : null}
    </section>
  );
}

function ClockFace({ hour, minute }) {
  const safeHour = Number(hour) || 0;
  const safeMinute = Number(minute) || 0;
  const hourAngle = ((safeHour % 12) * 30 + safeMinute * 0.5) * (Math.PI / 180);
  const minuteAngle = safeMinute * 6 * (Math.PI / 180);
  const handEnd = (angle, length) => ({
    x: 100 + Math.sin(angle) * length,
    y: 100 - Math.cos(angle) * length,
  });
  const hourEnd = handEnd(hourAngle, 48);
  const minuteEnd = handEnd(minuteAngle, 70);

  return (
    <div className="hub-vocab-clock" role="img" aria-label="Analogue clock">
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <circle className="clock-face" cx="100" cy="100" r="92" />
        {Array.from({ length: 60 }, (_, index) => {
          const angle = index * 6 * (Math.PI / 180);
          const isHour = index % 5 === 0;
          const outer = handEnd(angle, 84);
          const inner = handEnd(angle, isHour ? 72 : 79);
          return (
            <line
              key={index}
              className={isHour ? "clock-mark hour" : "clock-mark"}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
            />
          );
        })}
        <line className="clock-hand hour" x1="100" y1="100" x2={hourEnd.x} y2={hourEnd.y} />
        <line className="clock-hand minute" x1="100" y1="100" x2={minuteEnd.x} y2={minuteEnd.y} />
        <circle className="clock-pin" cx="100" cy="100" r="5" />
      </svg>
    </div>
  );
}

function StructuredQuestionMode({
  theme,
  activity,
  items,
  promptType,
  inputMode,
  coverage = null,
  onItemSeen,
  onComplete,
  onMistake,
}) {
  const eligibleItems = useMemo(
    () => items.filter((entry) => {
      if (!entry?.id || !getStructuredAnswer(entry)) return false;
      return promptType === "clock"
        ? Number.isFinite(Number(entry.hour)) && Number.isFinite(Number(entry.minute))
        : Boolean(entry.sentence);
    }),
    [items, promptType]
  );
  const configuredLimit = Number(activity?.itemLimit);
  const itemLimit = Number.isFinite(configuredLimit) && configuredLimit > 0
    ? configuredLimit
    : eligibleItems.length;
  const seenItemIdsRef = useRef(coverage?.seenItemIds || []);
  seenItemIdsRef.current = coverage?.seenItemIds || [];
  const makeSession = useCallback(
    (source = eligibleItems) => makePrioritizedSession(source, itemLimit, seenItemIdsRef.current),
    [eligibleItems, itemLimit]
  );
  const [sessionItems, setSessionItems] = useState(() => makeSession());
  const [reviewItems, setReviewItems] = useState(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [mistakeItems, setMistakeItems] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const activeItems = reviewItems || sessionItems;
  const entry = activeItems[index];
  const options = useMemo(
    () => entry ? getStructuredOptions(entry, eligibleItems, Number(activity.optionCount) || 4) : [],
    [activity.optionCount, eligibleItems, entry]
  );
  const next = useCallback(() => {
    setAnswer("");
    setFeedback(null);
    if (index >= activeItems.length - 1) {
      setIsComplete(true);
      return;
    }
    setIndex((previous) => previous + 1);
  }, [activeItems.length, index]);

  useEffect(() => {
    setSessionItems(makeSession());
    setReviewItems(null);
    setIndex(0);
    setAnswer("");
    setFeedback(null);
    setMistakeItems([]);
    setIsComplete(false);
  }, [inputMode, makeSession, promptType, theme.id]);

  useEffect(() => {
    if (!reviewItems && entry?.id) onItemSeen?.(entry.id);
  }, [entry?.id, onItemSeen, reviewItems]);

  useEffect(() => {
    if (feedback?.status !== "correct") return undefined;
    const timer = window.setTimeout(next, 700);
    return () => window.clearTimeout(timer);
  }, [feedback, next]);

  function recordWrong(userAnswer) {
    setMistakeItems((previous) => dedupeById([...previous, entry]));
    onMistake?.(entry, {
      userAnswer,
      correctAnswer: getStructuredAnswer(entry),
      answerMode: promptType === "clock" ? "clock" : "sentence-gap",
    });
  }

  function choose(option) {
    if (feedback) return;
    const correct = getStructuredAcceptedAnswers(entry).includes(normalizeAnswer(option));
    if (!correct) recordWrong(option);
    setFeedback({ status: correct ? "correct" : "wrong", selected: option });
  }

  function checkAnswer(event) {
    event.preventDefault();
    if (feedback) return;
    const correct = getStructuredAcceptedAnswers(entry).includes(normalizeAnswer(answer));
    if (!correct) recordWrong(answer);
    setFeedback({ status: correct ? "correct" : "wrong" });
  }

  function restart() {
    setSessionItems(makeSession());
    setReviewItems(null);
    setIndex(0);
    setAnswer("");
    setFeedback(null);
    setMistakeItems([]);
    setIsComplete(false);
  }

  function reviewMistakes() {
    setReviewItems(dedupeById(mistakeItems));
    setIndex(0);
    setAnswer("");
    setFeedback(null);
    setMistakeItems([]);
    setIsComplete(false);
  }

  if (!eligibleItems.length) {
    return (
      <EmptyActivityCard
        message={promptType === "clock"
          ? "Add items with hour, minute, answer and acceptedAnswers fields to use this activity."
          : "Add items with sentence, answer and acceptedAnswers fields to use this activity."}
      />
    );
  }

  if (isComplete) {
    return (
      <ActivityCompleteCard
        title={reviewItems ? "Mistake review complete" : "Set complete"}
        total={activeItems.length}
        mistakes={reviewItems ? [] : dedupeById(mistakeItems)}
        completedItemIds={reviewItems ? [] : sessionItems.map((item) => item.id)}
        coverage={coverage}
        onRestart={restart}
        onReviewMistakes={reviewMistakes}
        onComplete={reviewItems ? null : onComplete}
      />
    );
  }

  const prompt = (
    <div className="hub-vocab-choice-prompt">
      {promptType === "clock" ? (
        <ClockFace hour={entry.hour} minute={entry.minute} />
      ) : (
        <>
          {entry.image ? renderVisualPrompt(entry) : null}
          <strong className="hub-vocab-structured-prompt">{entry.sentence}</strong>
        </>
      )}
      <p>{activity.question || (promptType === "clock" ? "What time is it?" : "Complete the sentence.")}</p>
    </div>
  );

  return (
    <section className="hub-vocab-practice-card">
      <ProgressLine current={index + 1} total={activeItems.length} label="questions" />
      {inputMode === "choice" ? (
        <>
          {prompt}
          <div className="hub-vocab-choice-grid">
            {options.map((option) => {
              const isCorrectOption = getStructuredAcceptedAnswers(entry).includes(normalizeAnswer(option));
              return (
                <button
                  key={option}
                  type="button"
                  disabled={Boolean(feedback)}
                  className={
                    feedback && isCorrectOption
                      ? "correct"
                      : feedback?.selected === option
                        ? "wrong"
                        : feedback
                          ? "dimmed"
                          : ""
                  }
                  onClick={() => choose(option)}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <form className="hub-vocab-type-form" onSubmit={checkAnswer}>
          {prompt}
          <label>
            <span>{activity.answerLabel || (promptType === "clock" ? "Time in words" : "Missing word or phrase")}</span>
            <input
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value);
                if (feedback?.status === "wrong") setFeedback(null);
              }}
              placeholder={activity.answerPlaceholder || (promptType === "clock" ? "It's ..." : "Type the missing word or phrase")}
              autoComplete="off"
              autoFocus
            />
          </label>
          <div className="hub-vocab-runner-actions">
            <button type="submit">Check</button>
            <button type="button" onClick={next}>Skip / next</button>
          </div>
        </form>
      )}
      {feedback ? (
        <div className={`hub-vocab-feedback ${feedback.status}`}>
          <span>
            {feedback.status === "correct"
              ? "Correct. Next one coming..."
              : <>Answer: <strong>{getStructuredAnswer(entry)}</strong></>}
          </span>
          {feedback.status === "wrong" ? <button type="button" onClick={next}>Next</button> : null}
        </div>
      ) : null}
    </section>
  );
}

function SequenceOrderMode({ theme, activity, items, onComplete, onMistake }) {
  const correctItems = useMemo(() => {
    if (Array.isArray(activity.sequence) && activity.sequence.length) {
      const byId = new Map(items.map((entry) => [entry.id, entry]));
      return activity.sequence.map((id) => byId.get(id)).filter(Boolean);
    }
    if (items.some((entry) => Number.isFinite(Number(entry.sequenceOrder)))) {
      return [...items]
        .filter((entry) => Number.isFinite(Number(entry.sequenceOrder)))
        .sort((left, right) => Number(left.sequenceOrder) - Number(right.sequenceOrder));
    }
    return [...items];
  }, [activity.sequence, items]);
  const [orderedItems, setOrderedItems] = useState(() => shuffleDifferent(correctItems));
  const [feedback, setFeedback] = useState(null);
  const [mistakeItems, setMistakeItems] = useState([]);
  const [reportedIds, setReportedIds] = useState(() => new Set());
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setOrderedItems(shuffleDifferent(correctItems));
    setFeedback(null);
    setMistakeItems([]);
    setReportedIds(new Set());
    setIsComplete(false);
  }, [correctItems, theme.id]);

  function reorder(fromIndex, toIndex) {
    setOrderedItems((previous) => moveItem(previous, fromIndex, toIndex));
    setFeedback(null);
  }

  function checkOrder() {
    const nextFeedback = orderedItems.map((entry, index) => entry.id === correctItems[index]?.id);
    const misplaced = orderedItems.filter((entry, index) => !nextFeedback[index]);
    setFeedback(nextFeedback);
    if (!misplaced.length) {
      setIsComplete(true);
      return;
    }
    setMistakeItems((previous) => dedupeById([...previous, ...misplaced]));
    const nextReported = new Set(reportedIds);
    misplaced.forEach((entry) => {
      if (nextReported.has(entry.id)) return;
      const currentPosition = orderedItems.findIndex((item) => item.id === entry.id);
      const expectedPosition = correctItems.findIndex((item) => item.id === entry.id);
      onMistake?.(entry, {
        userAnswer: `Position ${currentPosition + 1}`,
        correctAnswer: `Position ${expectedPosition + 1}`,
        answerMode: "sequence",
      });
      nextReported.add(entry.id);
    });
    setReportedIds(nextReported);
  }

  function restart() {
    setOrderedItems(shuffleDifferent(correctItems));
    setFeedback(null);
    setMistakeItems([]);
    setReportedIds(new Set());
    setIsComplete(false);
  }

  if (correctItems.length < 2) {
    return <EmptyActivityCard message="Add a sequence of at least two entry IDs, or sequenceOrder values, to use this activity." />;
  }

  if (isComplete) {
    return (
      <ActivityCompleteCard
        title="Sequence complete"
        total={correctItems.length}
        mistakes={dedupeById(mistakeItems)}
        onRestart={restart}
        onReviewMistakes={null}
        onComplete={onComplete}
      />
    );
  }

  return (
    <section className="hub-vocab-practice-card">
      <ProgressLine current={feedback?.filter(Boolean).length || 0} total={correctItems.length} label="in the right place" />
      <p className="hub-vocab-sequence-instructions">
        {activity.prompt || "Drag the items into order, or use the arrow buttons."}
      </p>
      <ol className="hub-vocab-sequence-list">
        {orderedItems.map((entry, index) => (
          <li
            key={entry.id}
            className={feedback ? (feedback[index] ? "correct" : "wrong") : ""}
            draggable
            onDragStart={(event) => event.dataTransfer.setData("text/plain", String(index))}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              reorder(Number(event.dataTransfer.getData("text/plain")), index);
            }}
          >
            <span className="hub-vocab-sequence-number">{index + 1}</span>
            {entry.image ? renderVisualPrompt(entry, { compact: true }) : null}
            <strong>{entry.term || entry.phrase || entry.label || entry.id}</strong>
            <div className="hub-vocab-sequence-actions">
              <button type="button" disabled={index === 0} aria-label={`Move ${entry.term || entry.id} up`} onClick={() => reorder(index, index - 1)}>↑</button>
              <button type="button" disabled={index === orderedItems.length - 1} aria-label={`Move ${entry.term || entry.id} down`} onClick={() => reorder(index, index + 1)}>↓</button>
            </div>
          </li>
        ))}
      </ol>
      <div className="hub-vocab-runner-actions">
        <button type="button" onClick={checkOrder}>Check order</button>
        <button type="button" onClick={restart}>Shuffle / reset</button>
      </div>
      {feedback && feedback.some((result) => !result) ? (
        <div className="hub-vocab-feedback wrong">
          <span>{feedback.filter(Boolean).length} of {feedback.length} are in the right place. Move the highlighted items and check again.</span>
        </div>
      ) : null}
    </section>
  );
}

function renderActivity(theme, activity, handlers = {}) {
  const items = getActivityItems(theme, activity);
  const props = {
    onComplete: handlers.onComplete,
    onMistake: handlers.onMistake,
    onItemSeen: handlers.onItemSeen,
    coverage: handlers.coverage,
  };
  const activityKey = `${theme.id}:${activity.id}:${items.length}`;
  if (activity.type === "flashcards") return <FlashcardMode key={activityKey} activity={activity} items={items} {...props} />;
  if (activity.type === "flag-flashcards") return <FlashcardMode key={activityKey} activity={activity} items={items} flagMode {...props} />;
  if (activity.type === "phrase-flashcards") return <FlashcardMode key={activityKey} activity={activity} items={items} phraseMode {...props} />;
  if (activity.type === "matching" || activity.type === "flag-match") {
    return <MatchingMode key={activityKey} theme={theme} activity={activity} items={items} {...props} />;
  }
  if (activity.type === "quick-choice") return <ChoiceMode theme={theme} activity={activity} items={items} {...props} />;
  if (activity.type === "gap-choice") return <ChoiceMode theme={theme} activity={activity} items={items} mode="gap" {...props} />;
  if (activity.type === "nationality-choice") return <ChoiceMode theme={theme} activity={activity} items={items} mode="nationality" {...props} />;
  if (activity.type === "opposites-choice") return <ChoiceMode theme={theme} activity={activity} items={items} mode="opposite" {...props} />;
  if (activity.type === "category-choice") return <ChoiceMode theme={theme} activity={activity} items={items} mode="category" {...props} />;
  if (activity.type === "speaker-choice") return <SpeakerChoiceMode theme={theme} activity={activity} items={items} {...props} />;
  if (activity.type === "phrase-gap-fill") return <PhraseGapFillMode theme={theme} activity={activity} items={items} {...props} />;
  if (activity.type === "image-hotspot-match") return <ImageHotspotMatchMode theme={theme} items={items} activity={activity} {...props} />;
  if (activity.type === "image-hotspot-type-answer") {
    return <ImageHotspotTypeMode theme={theme} items={items} activity={activity} {...props} />;
  }
  if (activity.type === "type-answer") return <TypeAnswerMode theme={theme} items={items} activity={activity} {...props} />;
  if (activity.type === "nationality-type-answer") {
    return <TypeAnswerMode theme={theme} items={items} activity={activity} answerMode="nationality" {...props} />;
  }
  if (activity.type === "plural-type-answer") {
    return <TypeAnswerMode theme={theme} items={items} activity={activity} answerMode="plural" {...props} />;
  }
  if (activity.type === "opposite-type-answer") {
    return <TypeAnswerMode theme={theme} items={items} activity={activity} answerMode="opposite" {...props} />;
  }
  if (activity.type === "cue-gap-type-answer") {
    return <TypeAnswerMode theme={theme} items={items} activity={activity} answerMode="gap" {...props} />;
  }
  if (activity.type === "article-choice") return <ArticleChoiceMode theme={theme} activity={activity} items={items} {...props} />;
  if (activity.type === "category-sort") return <CategorySortMode theme={theme} activity={activity} items={items} {...props} />;
  if (activity.type === "sequence-order") return <SequenceOrderMode theme={theme} activity={activity} items={items} {...props} />;
  if (activity.type === "sentence-gap-choice") {
    return <StructuredQuestionMode theme={theme} activity={activity} items={items} promptType="sentence" inputMode="choice" {...props} />;
  }
  if (activity.type === "sentence-gap-type-answer") {
    return <StructuredQuestionMode theme={theme} activity={activity} items={items} promptType="sentence" inputMode="type" {...props} />;
  }
  if (activity.type === "clock-choice") {
    return <StructuredQuestionMode theme={theme} activity={activity} items={items} promptType="clock" inputMode="choice" {...props} />;
  }
  if (activity.type === "clock-type-answer") {
    return <StructuredQuestionMode theme={theme} activity={activity} items={items} promptType="clock" inputMode="type" {...props} />;
  }
  return null;
}

function ThemeSupplementaryContent({ theme }) {
  const notes = Array.isArray(theme.infoNotes) ? theme.infoNotes : [];
  const extensionEntries = Array.isArray(theme.extensionEntries) ? theme.extensionEntries : [];
  const practicePrompt = theme.practicePrompt;
  if (!notes.length && !extensionEntries.length && !practicePrompt) return null;

  return (
    <aside className="hub-vocab-supplementary" aria-label="Extra vocabulary notes">
      {notes.map((note) => (
        <section key={note.title} className="hub-vocab-supplementary-card">
          <h2>{note.title}</h2>
          {(note.body || []).map((line) => <p key={line}>{line}</p>)}
        </section>
      ))}
      {extensionEntries.length ? (
        <section className="hub-vocab-supplementary-card">
          <h2>{theme.extensionTitle || "More vocabulary"}</h2>
          <dl className="hub-vocab-extension-list">
            {extensionEntries.map((entry) => (
              <div key={entry.id}>
                <dt>{entry.term}</dt>
                <dd>{entry.clue || entry.meaningNote}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
      {practicePrompt ? (
        <section className="hub-vocab-supplementary-card">
          <h2>{practicePrompt.title}</h2>
          <p>{practicePrompt.prompt}</p>
          {practicePrompt.followUp ? <p className="muted">{practicePrompt.followUp}</p> : null}
        </section>
      ) : null}
    </aside>
  );
}

export default function HubVocabularyActivityRunner() {
  const navigate = useNavigate();
  const { themeId, activityId } = useParams();
  const result = getHubVocabActivity(themeId, activityId);
  const theme = result?.theme || getHubVocabTheme(themeId);
  const activity = result?.activity;
  const activityItems = useMemo(
    () => theme && activity ? getActivityItems(theme, activity) : [],
    [activity, theme]
  );
  const [progressMap, setProgressMap] = useState({});
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [liveSeenIds, setLiveSeenIds] = useState(() => new Set());
  const progressKey = theme && activity ? `${theme.id}:${activity.id}` : "";
  const activityProgress = progressKey ? progressMap[progressKey] || {} : {};
  const activityItemIds = useMemo(
    () => new Set(activityItems.map((item) => item?.id).filter(Boolean)),
    [activityItems]
  );
  const configuredItemLimit = Number(activity?.itemLimit);
  const tracksCoverage = Boolean(
    activityItems.length > 0 &&
    Number.isFinite(configuredItemLimit) &&
    configuredItemLimit > 0 &&
    configuredItemLimit < activityItems.length
  );
  const coverage = useMemo(() => ({
    tracked: tracksCoverage,
    total: activityItems.length,
    seenItemIds: [...new Set([
      ...(activityProgress.seenItemIds || []),
      ...liveSeenIds,
    ])].filter((itemId) => activityItemIds.has(itemId)),
  }), [activityItemIds, activityItems.length, activityProgress.seenItemIds, liveSeenIds, tracksCoverage]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [themeId, activityId]);

  useEffect(() => {
    let alive = true;
    setProgressLoaded(false);
    setLiveSeenIds(new Set());
    fetchHubVocabProgress()
      .then((progress) => {
        if (alive) setProgressMap(progress || {});
      })
      .catch((error) => {
        console.error("[HubVocabularyActivityRunner] progress load failed", error);
      })
      .finally(() => {
        if (alive) setProgressLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, [themeId, activityId]);

  const handleItemSeen = useCallback((itemId) => {
    if (!itemId || !tracksCoverage) return;
    setLiveSeenIds((previous) => {
      if (previous.has(itemId)) return previous;
      const next = new Set(previous);
      next.add(itemId);
      return next;
    });
  }, [tracksCoverage]);

  const handleComplete = useCallback(
    ({ total, mistakes = [], itemIds = [] } = {}) => {
      if (!theme || !activity) return;
      const uniqueMistakes = dedupeById(mistakes);
      const completedItemIds = tracksCoverage
        ? [...new Set(itemIds.filter(Boolean))]
        : [];
      const mergedSeenItemIds = [...new Set([
        ...(coverage.seenItemIds || []),
        ...completedItemIds,
      ])];
      const locallyComplete = tracksCoverage
        ? mergedSeenItemIds.length >= activityItems.length
        : true;
      saveHubVocabActivityResult({
        themeId: theme.id,
        themeTitle: theme.title,
        level: theme.level,
        activityId: activity.id,
        activityTitle: activity.title,
        activityType: activity.type,
        totalItems: total ?? activityItems.length,
        correctFirstTry: Math.max((total ?? activityItems.length) - uniqueMistakes.length, 0),
        mistakesCount: uniqueMistakes.length,
        seenItemIds: completedItemIds,
        coverageTotal: tracksCoverage ? activityItems.length : null,
      })
        .then((savedProgress) => {
          const savedSeenItemIds = (savedProgress?.seenItemIds || mergedSeenItemIds)
            .filter((itemId) => activityItemIds.has(itemId));
          setProgressMap((prev) => ({
            ...prev,
            [`${theme.id}:${activity.id}`]: {
              id: `${theme.id}:${activity.id}`,
              themeId: theme.id,
              activityId: activity.id,
              completed: tracksCoverage ? locallyComplete : (savedProgress?.completed ?? true),
              seenItemIds: savedSeenItemIds,
              coverageTotal: savedProgress?.coverageTotal || (tracksCoverage ? activityItems.length : null),
            },
          }));
        })
        .catch((error) => {
          console.error("[HubVocabularyActivityRunner] save progress failed", error);
        });
    },
    [activity, activityItemIds, activityItems.length, coverage.seenItemIds, theme, tracksCoverage]
  );

  const handleMistake = useCallback(
    (entry, details = {}) => {
      if (!theme || !activity || !entry) return;
      const isHotspotActivity = activity.type === "image-hotspot-match"
        || activity.type === "image-hotspot-type-answer";
      recordVocabMistake({
        topic: theme.id,
        setId: activity.id,
        sentence: details.mistakePrompt
          || getMistakePrompt(entry, theme, activity, details.answerMode),
        correctAnswer: details.correctAnswer || getDisplayAnswer(entry, theme.id, details.answerMode),
        acceptedAnswers: details.acceptedAnswers || [],
        userAnswer: details.userAnswer || "",
        source: "hub-textbook",
        itemId: entry.id || "",
        themeTitle: theme.title,
        activityTitle: activity.title,
        activityType: activity.type,
        image: entry.image || entry.flag4x3 || "",
        ...(isHotspotActivity ? {
          sceneImage: details.sceneImage || activity.sceneImage || theme.sceneImage || "",
          hotspotX: entry.hotspotX,
          hotspotY: entry.hotspotY,
          hotspotNumber: details.hotspotNumber || entry.hotspotNumber,
          hotspotViewBox: details.hotspotViewBox || null,
        } : {}),
      }).catch((error) => {
        console.error("[HubVocabularyActivityRunner] save mistake failed", error);
      });
    },
    [activity, theme]
  );

  if (!theme || !activity) {
    return (
      <div className="panel">
        <h2>Vocabulary activity not found</h2>
        <p className="muted">That vocabulary activity does not exist yet.</p>
        <button className="review-btn" onClick={() => navigate(getSitePath("/vocabulary/textbook"))}>
          Back to vocabulary topics
        </button>
      </div>
    );
  }

  return (
    <div className="menu-wrapper hub-vocab-runner">
      <Seo
        title={`${activity.title} | ${theme.title} | Seif Hub`}
        description={activity.shortDescription}
      />

      <div className="hub-vocab-top-actions">
        <button className="review-btn" onClick={() => navigate(getSitePath("/vocabulary/textbook"))}>
          ← Back to vocabulary topics
        </button>
        <button className="review-btn mistakes" onClick={() => navigate(getSitePath("/vocabulary/textbook/mistakes"))}>
          Review mistakes
        </button>
      </div>

      <header className="hub-vocab-runner-head" style={{ "--theme-accent": theme.accent }}>
        <div>
          <span className="cefr-badge" style={{ "--badge-color": theme.accent }}>{theme.level.toUpperCase()}</span>
          <p className="hub-vocab-kicker">{theme.textbookRef}</p>
          <h1>{theme.title}</h1>
          <p>{activity.prompt || activity.shortDescription}</p>
        </div>
        <div className="hub-vocab-runner-stat">
          <strong>{activityItems.length}</strong>
          <span>items</span>
        </div>
      </header>

      <ActivityTabs theme={theme} activityId={activity.id} progressMap={progressMap} />

      <OverallCoverageTracker coverage={coverage} />

      {progressLoaded ? (
        renderActivity(theme, activity, {
          onComplete: handleComplete,
          onMistake: handleMistake,
          onItemSeen: handleItemSeen,
          coverage,
        })
      ) : (
        <section className="hub-vocab-practice-card hub-vocab-empty-card">
          <strong>Loading activity progress…</strong>
        </section>
      )}

      <ThemeSupplementaryContent theme={theme} />

      <style>{`
        .hub-vocab-runner {
          display: grid;
          gap: 1rem;
        }

        .hub-vocab-supplementary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 0.9rem;
        }

        .hub-vocab-supplementary-card {
          border: 1px solid rgba(143, 182, 255, 0.22);
          border-radius: 18px;
          background: rgba(9, 20, 43, 0.54);
          padding: 1rem 1.1rem;
        }

        .hub-vocab-supplementary-card h2 {
          margin: 0 0 0.55rem;
          font-size: 1rem;
        }

        .hub-vocab-supplementary-card p {
          margin: 0.35rem 0 0;
        }

        .hub-vocab-extension-list {
          display: grid;
          gap: 0.55rem;
          margin: 0;
        }

        .hub-vocab-extension-list div {
          display: grid;
          grid-template-columns: minmax(100px, 0.7fr) minmax(150px, 1.3fr);
          gap: 0.75rem;
        }

        .hub-vocab-extension-list dt {
          font-weight: 800;
        }

        .hub-vocab-extension-list dd {
          margin: 0;
          color: var(--muted-text, #b9c5dc);
        }

        .hub-vocab-top-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.7rem;
        }

        .hub-vocab-runner-head {
          --theme-accent: #72df9b;
          display: flex;
          justify-content: space-between;
          gap: 1.25rem;
          border: 1px solid color-mix(in srgb, var(--theme-accent), transparent 62%);
          border-radius: 26px;
          background:
            radial-gradient(circle at top right, color-mix(in srgb, var(--theme-accent), transparent 72%), transparent 42%),
            linear-gradient(135deg, #17243f, #10192d);
          color: #eef4ff;
          padding: 1.35rem;
          box-shadow: 0 18px 38px rgba(0, 0, 0, 0.22);
        }

        .hub-vocab-kicker {
          color: color-mix(in srgb, var(--theme-accent), white 20%);
          font-weight: 800;
          letter-spacing: 0.08em;
          margin: 0.65rem 0 0.2rem;
          text-transform: uppercase;
        }

        .hub-vocab-runner-head h1 {
          color: #fff;
          font-size: clamp(2rem, 5vw, 4rem);
          line-height: 0.95;
          margin: 0;
        }

        .hub-vocab-runner-head p:last-child {
          color: rgba(238, 244, 255, 0.82);
          font-size: 1.05rem;
          margin-bottom: 0;
        }

        .hub-vocab-runner-stat {
          align-self: stretch;
          display: grid;
          min-width: 8rem;
          place-content: center;
          text-align: center;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
        }

        .hub-vocab-runner-stat strong {
          color: #fff;
          font-size: 2.6rem;
          line-height: 1;
        }

        .hub-vocab-runner-stat span {
          color: rgba(238, 244, 255, 0.7);
          font-weight: 800;
          text-transform: uppercase;
        }

        .hub-vocab-tabs {
          display: flex;
          gap: 0.55rem;
          overflow-x: auto;
          padding: 0.15rem 0 0.35rem;
        }

        .hub-vocab-tabs button,
        .hub-vocab-runner-actions button,
        .hub-vocab-progress-line button,
        .hub-vocab-feedback button {
          border: 1px solid rgba(238, 244, 255, 0.16);
          border-radius: 999px;
          background: #1a2847;
          color: #eef4ff;
          cursor: pointer;
          font: inherit;
          font-weight: 800;
          padding: 0.65rem 1rem;
        }

        .hub-vocab-tabs button.active {
          background: #f6bd60;
          border-color: #f6bd60;
          color: #13213b;
        }

        .hub-vocab-tabs button.completed:not(.active) {
          border-color: rgba(114, 223, 155, 0.46);
        }

        .hub-vocab-tab-check {
          align-items: center;
          background: rgba(114, 223, 155, 0.18);
          border: 1px solid rgba(114, 223, 155, 0.5);
          border-radius: 999px;
          display: inline-flex;
          font-size: 0.78rem;
          height: 1.15rem;
          justify-content: center;
          margin-left: 0.45rem;
          width: 1.15rem;
        }

        .hub-vocab-practice-card {
          border-radius: 28px;
          background: #10192d;
          border: 1px solid rgba(238, 244, 255, 0.12);
          color: #eef4ff;
          display: grid;
          gap: 1rem;
          padding: clamp(1rem, 3vw, 1.5rem);
        }

        .hub-vocab-complete-card {
          justify-items: center;
          text-align: center;
        }

        .hub-vocab-complete-copy {
          display: grid;
          gap: 0.6rem;
          max-width: 40rem;
        }

        .hub-vocab-complete-copy h2 {
          color: #fff;
          font-size: clamp(2rem, 6vw, 3.2rem);
          line-height: 0.95;
          margin: 0;
        }

        .hub-vocab-complete-copy p {
          color: rgba(238, 244, 255, 0.82);
          font-size: 1.02rem;
          margin: 0;
        }

        .hub-vocab-overall-progress {
          background: rgba(9, 20, 43, 0.58);
          border: 1px solid rgba(143, 182, 255, 0.22);
          border-radius: 18px;
          display: grid;
          gap: 0.55rem;
          padding: 0.9rem 1rem;
        }

        .hub-vocab-overall-progress > div:first-child {
          align-items: center;
          display: flex;
          gap: 1rem;
          justify-content: space-between;
        }

        .hub-vocab-overall-progress > div:first-child span,
        .hub-vocab-overall-progress p {
          color: rgba(238, 244, 255, 0.7);
          margin: 0;
        }

        .hub-vocab-overall-progress-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 999px;
          height: 0.6rem;
          overflow: hidden;
        }

        .hub-vocab-overall-progress-track span {
          background: linear-gradient(90deg, #6da7ff, #72df9b);
          border-radius: inherit;
          display: block;
          height: 100%;
          transition: width 180ms ease;
        }

        .hub-vocab-card-count,
        .hub-vocab-progress-line {
          align-items: center;
          color: rgba(238, 244, 255, 0.72);
          display: flex;
          font-weight: 800;
          justify-content: space-between;
        }

        .hub-vocab-shortcuts {
          color: rgba(238, 244, 255, 0.52);
          font-size: 0.82rem;
          text-align: right;
        }

        .hub-vocab-flashcard {
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 26px;
          background:
            radial-gradient(circle at 20% 20%, rgba(246, 189, 96, 0.18), transparent 36%),
            #17243f;
          color: #eef4ff;
          cursor: pointer;
          min-height: 330px;
          padding: 1.5rem;
        }

        .hub-vocab-card-face {
          display: grid;
          gap: 1rem;
          height: 100%;
          place-items: center;
          text-align: center;
        }

        .hub-vocab-card-face strong,
        .hub-vocab-number-large,
        .hub-vocab-country-prompt,
        .hub-vocab-cue-prompt {
          color: #fff;
          font-size: clamp(4rem, 18vw, 9rem);
          line-height: 0.9;
        }

        .hub-vocab-country-prompt,
        .hub-vocab-cue-prompt {
          font-size: clamp(2.8rem, 11vw, 6.5rem);
          text-align: center;
        }

        .hub-vocab-cue-prompt {
          font-size: clamp(1.8rem, 7vw, 4.1rem);
          line-height: 1.05;
          white-space: pre-wrap;
        }

        .hub-vocab-cue-prompt.compact {
          font-size: 0.9rem;
          line-height: 1.1;
        }

        .hub-vocab-card-face .hub-vocab-flashcard-text-prompt {
          font-size: clamp(1.2rem, 3.5vw, 2rem);
          line-height: 1.3;
          max-width: 42rem;
        }

        .hub-vocab-card-face .hub-vocab-image-gap-prompt,
        .hub-vocab-choice-prompt .hub-vocab-image-gap-prompt {
          color: #fff;
          font-size: clamp(1.05rem, 3vw, 1.55rem);
          line-height: 1.25;
          max-width: 42rem;
          text-align: center;
        }

        .hub-vocab-number-large.compact {
          font-size: 1.7rem;
          line-height: 1;
        }

        .hub-vocab-card-face.is-answer strong {
          font-size: clamp(2.7rem, 10vw, 6rem);
        }

        .hub-vocab-card-face span {
          color: rgba(238, 244, 255, 0.72);
          font-size: 1.25rem;
          font-weight: 800;
        }

        .hub-vocab-phrase-kicker {
          border: 1px solid rgba(246, 189, 96, 0.32);
          border-radius: 999px;
          background: rgba(246, 189, 96, 0.12);
          color: #ffd27d;
          font-size: 0.78rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          padding: 0.3rem 0.65rem;
          text-transform: uppercase;
        }

        .hub-vocab-visual-tile {
          align-items: center;
          aspect-ratio: 1 / 1;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 26px;
          background:
            radial-gradient(circle at top left, rgba(255,255,255,0.14), transparent 45%),
            linear-gradient(135deg, #2a3d67, #17243f);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
          display: grid;
          max-width: min(320px, 72vw);
          padding: 1rem;
          width: 100%;
        }

        .hub-vocab-visual-tile.is-colour {
          background:
            linear-gradient(180deg, rgba(255,255,255,0.34), rgba(255,255,255,0.04) 28%, rgba(0,0,0,0.12)),
            var(--tile-colour, #60a5fa);
          border-color: rgba(255, 255, 255, 0.22);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.22),
            0 14px 28px rgba(0, 0, 0, 0.18);
        }

        .hub-vocab-visual-tile span {
          color: #f3f7ff;
          font-size: clamp(1.15rem, 4vw, 2rem);
          font-weight: 900;
          letter-spacing: 0.08em;
          line-height: 1.05;
          text-align: center;
          text-transform: uppercase;
        }

        .hub-vocab-visual-tile.compact {
          aspect-ratio: auto;
          border-radius: 14px;
          max-width: none;
          min-height: 3.2rem;
          padding: 0.45rem;
        }

        .hub-vocab-visual-tile.is-colour.compact {
          min-height: 2.9rem;
        }

        .hub-vocab-visual-tile.compact span {
          font-size: 0.82rem;
          letter-spacing: 0.04em;
        }

        .hub-vocab-flag-large {
          border-radius: 18px;
          box-shadow: 0 18px 34px rgba(0, 0, 0, 0.28);
          max-width: min(340px, 80vw);
          width: 100%;
        }

        .hub-vocab-object-image {
          border-radius: 22px;
          box-shadow: 0 18px 34px rgba(0, 0, 0, 0.24);
          max-height: min(320px, 48vw);
          max-width: min(340px, 78vw);
          object-fit: contain;
          width: auto;
        }

        .hub-vocab-object-image.compact {
          border-radius: 8px;
          box-shadow: none;
          max-height: 2.25rem;
          max-width: 3.9rem;
          transition: transform 0.18s ease;
        }

        .hub-vocab-image-focus {
          display: inline-flex;
          line-height: 0;
          position: relative;
        }

        .hub-vocab-image-focus-marker {
          background: rgba(246, 189, 96, 0.08);
          border: 3px solid #f6bd60;
          border-radius: 999px;
          box-shadow:
            0 0 0 3px rgba(9, 20, 43, 0.68),
            0 0 18px rgba(246, 189, 96, 0.9);
          height: var(--focus-height);
          left: var(--focus-x);
          pointer-events: none;
          position: absolute;
          top: var(--focus-y);
          transform: translate(-50%, -50%);
          width: var(--focus-width);
        }

        .hub-vocab-image-focus.compact .hub-vocab-image-focus-marker {
          border-width: 1px;
          box-shadow: 0 0 0 1px rgba(9, 20, 43, 0.72);
        }

        .hub-vocab-flag-large.compact {
          border-radius: 8px;
          box-shadow: none;
          max-height: 2.15rem;
          max-width: 3.8rem;
          transition: transform 0.18s ease;
          width: auto;
        }

        .hub-vocab-runner-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.7rem;
          justify-content: center;
        }

        .hub-vocab-match-grid {
          display: grid;
          gap: 0.65rem;
          grid-template-columns: minmax(5.5rem, 0.8fr) minmax(0, 1.2fr);
          max-width: 760px;
          width: 100%;
          justify-self: center;
        }

        .hub-vocab-match-column {
          display: grid;
          gap: 0.42rem;
        }

        .hub-vocab-match-column button,
        .hub-vocab-choice-grid button {
          align-items: center;
          border: 1px solid rgba(238, 244, 255, 0.14);
          border-radius: 18px;
          background: #1a2847;
          color: #eef4ff;
          cursor: pointer;
          display: flex;
          font: inherit;
          font-size: 0.98rem;
          font-weight: 800;
          justify-content: center;
          min-height: 3.2rem;
          overflow: visible;
          padding: 0.58rem 0.68rem;
          position: relative;
          transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
        }

        .hub-vocab-match-column button > * {
          transition: transform 0.22s ease, filter 0.22s ease;
          transform-origin: center;
        }

        @media (hover: hover) {
          .hub-vocab-match-column button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 14px 24px rgba(0, 0, 0, 0.22);
            z-index: 3;
          }

          .hub-vocab-match-column button:hover:not(:disabled) > * {
            filter: drop-shadow(0 14px 22px rgba(0, 0, 0, 0.22));
            transform: scale(1.42);
          }
        }

        .hub-vocab-match-column button:active:not(:disabled) > *,
        .hub-vocab-match-column button.selected > * {
          filter: drop-shadow(0 14px 22px rgba(0, 0, 0, 0.22));
          transform: scale(1.42);
        }

        .hub-vocab-match-column button.selected {
          border-color: #f6bd60;
          box-shadow: 0 0 0 3px rgba(246, 189, 96, 0.16);
          z-index: 3;
        }

        .hub-vocab-match-column button.matched,
        .hub-vocab-choice-grid button.correct {
          background: rgba(114, 223, 155, 0.18);
          border-color: rgba(114, 223, 155, 0.65);
        }

        .hub-vocab-choice-grid button.dimmed {
          opacity: 0.45;
        }

        .hub-vocab-status {
          color: rgba(238, 244, 255, 0.78);
          font-weight: 800;
          margin: 0;
          text-align: center;
        }

        .hub-vocab-choice-prompt {
          display: grid;
          gap: 1rem;
          justify-items: center;
          text-align: center;
        }

        .hub-vocab-choice-prompt p {
          color: rgba(238, 244, 255, 0.82);
          font-weight: 800;
          margin: 0;
        }

        .hub-vocab-gapped-phrase {
          color: #fff;
          font-size: clamp(1.35rem, 3vw, 2rem);
          line-height: 1.25;
          max-width: 760px;
        }

        .hub-vocab-phrase-image {
          border: 1px solid rgba(238, 244, 255, 0.13);
          border-radius: 16px;
          box-shadow: 0 18px 38px rgba(0, 0, 0, 0.25);
          display: block;
          max-height: 360px;
          max-width: min(100%, 720px);
          object-fit: contain;
          width: auto;
        }

        .hub-vocab-hotspot-card {
          overflow: hidden;
        }

        .hub-vocab-hotspot-round-header {
          align-items: center;
          background: linear-gradient(135deg, rgba(246, 189, 96, 0.16), rgba(143, 182, 255, 0.12));
          border: 1px solid rgba(246, 189, 96, 0.34);
          border-radius: 16px;
          display: flex;
          gap: 0.85rem;
          margin-bottom: 1rem;
          padding: 0.78rem 0.9rem;
        }

        .hub-vocab-hotspot-round-header > span {
          background: #f6bd60;
          border-radius: 999px;
          color: #13213b;
          flex: 0 0 auto;
          font-size: 0.76rem;
          font-weight: 950;
          letter-spacing: 0.04em;
          padding: 0.38rem 0.62rem;
          text-transform: uppercase;
        }

        .hub-vocab-hotspot-round-header strong {
          color: #fff;
          display: block;
          font-size: 1.05rem;
        }

        .hub-vocab-hotspot-round-header p {
          color: rgba(238, 244, 255, 0.76);
          font-size: 0.88rem;
          margin: 0.12rem 0 0;
        }

        .hub-vocab-round-complete {
          align-items: center;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          min-height: 18rem;
          justify-content: center;
          text-align: center;
        }

        .hub-vocab-round-complete > span {
          align-items: center;
          background: rgba(114, 223, 155, 0.2);
          border: 1px solid rgba(114, 223, 155, 0.64);
          border-radius: 999px;
          color: #72df9b;
          display: flex;
          font-size: 1.7rem;
          font-weight: 950;
          height: 3.5rem;
          justify-content: center;
          width: 3.5rem;
        }

        .hub-vocab-round-complete strong {
          color: #fff;
          font-size: 1.35rem;
        }

        .hub-vocab-round-complete p {
          color: rgba(238, 244, 255, 0.76);
          margin: 0;
        }

        .hub-vocab-round-complete button {
          background: #f6bd60;
          border: 1px solid #ffd48d;
          border-radius: 999px;
          color: #13213b;
          cursor: pointer;
          font: inherit;
          font-weight: 900;
          margin-top: 0.35rem;
          padding: 0.72rem 1rem;
        }

        .hub-vocab-hotspot-layout {
          align-items: start;
          display: grid;
          gap: 1rem;
          grid-template-columns: minmax(0, 1.4fr) minmax(13rem, 0.6fr);
        }

        .hub-vocab-hotspot-layout.is-zoomed-layout {
          grid-template-columns: 1fr;
        }

        .hub-vocab-hotspot-layout.is-zoomed-layout .hub-vocab-hotspot-words {
          grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
        }

        .hub-vocab-hotspot-layout.is-zoomed-layout .hub-vocab-hotspot-words button {
          text-align: center;
        }

        .hub-vocab-hotel-scene {
          border: 1px solid rgba(238, 244, 255, 0.14);
          border-radius: 20px;
          box-shadow: 0 18px 38px rgba(0, 0, 0, 0.28);
          justify-self: center;
          max-width: 940px;
          overflow: hidden;
          position: relative;
          width: 100%;
        }

        .hub-vocab-hotel-scene img {
          display: block;
          height: auto;
          width: 100%;
        }

        .hub-vocab-hotel-scene.is-zoomed img {
          max-width: none;
        }

        .hub-vocab-hotel-scene button {
          align-items: center;
          background: #f6bd60;
          border: 2px solid #fff8e8;
          border-radius: 999px;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
          color: #13213b;
          cursor: pointer;
          display: flex;
          font: inherit;
          font-size: clamp(0.65rem, 1.35vw, 0.88rem);
          font-weight: 950;
          height: clamp(1.22rem, 2.45vw, 1.65rem);
          justify-content: center;
          min-width: 0;
          padding: 0;
          position: absolute;
          transform: translate(-50%, -50%);
          transition: background 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;
          width: clamp(1.22rem, 2.45vw, 1.65rem);
        }

        .hub-vocab-hotel-scene button.selected,
        .hub-vocab-hotel-scene button.active {
          background: #72df9b;
          border-color: #e9fff1;
          box-shadow: 0 0 0 5px rgba(114, 223, 155, 0.26), 0 10px 24px rgba(0, 0, 0, 0.34);
          transform: translate(-50%, -50%) scale(1.16);
          z-index: 2;
        }

        .hub-vocab-hotel-scene button.matched {
          background: #8fb6ff;
          border-color: #eaf1ff;
          color: #0f1d34;
          opacity: 0.82;
        }

        .hub-vocab-hotspot-words {
          display: grid;
          gap: 0.5rem;
        }

        .hub-vocab-hotspot-words button {
          border: 1px solid rgba(238, 244, 255, 0.14);
          border-radius: 14px;
          background: #1a2847;
          color: #eef4ff;
          cursor: pointer;
          font: inherit;
          font-weight: 850;
          min-height: 2.65rem;
          padding: 0.54rem 0.68rem;
          text-align: left;
        }

        .hub-vocab-hotspot-words button.matched,
        .hub-vocab-hotspot-words button:disabled {
          background: rgba(114, 223, 155, 0.18);
          border-color: rgba(114, 223, 155, 0.65);
          cursor: default;
          opacity: 0.74;
        }

        .hub-vocab-structured-prompt {
          color: #fff;
          font-size: clamp(1.55rem, 4vw, 2.65rem);
          line-height: 1.25;
          max-width: 52rem;
          text-align: center;
        }

        .hub-vocab-category-grid {
          display: grid;
          gap: 0.7rem;
          grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
        }

        .hub-vocab-category-grid button {
          border: 1px solid rgba(238, 244, 255, 0.14);
          border-radius: 18px;
          background: #1a2847;
          color: #eef4ff;
          cursor: pointer;
          font: inherit;
          font-weight: 850;
          min-height: 3.5rem;
          padding: 0.7rem 0.9rem;
        }

        .hub-vocab-category-grid button.correct,
        .hub-vocab-choice-grid button.correct {
          background: rgba(114, 223, 155, 0.18);
          border-color: rgba(114, 223, 155, 0.65);
        }

        .hub-vocab-category-grid button.wrong,
        .hub-vocab-choice-grid button.wrong {
          background: rgba(255, 133, 133, 0.13);
          border-color: rgba(255, 133, 133, 0.58);
        }

        .hub-vocab-category-grid button.dimmed {
          opacity: 0.45;
        }

        .hub-vocab-clock {
          aspect-ratio: 1;
          background: #f8fbff;
          border: 8px solid #2a3d67;
          border-radius: 50%;
          box-shadow: 0 18px 34px rgba(0, 0, 0, 0.28);
          max-width: min(330px, 76vw);
          padding: 0.4rem;
          width: 100%;
        }

        .hub-vocab-clock svg {
          display: block;
          height: auto;
          width: 100%;
        }

        .hub-vocab-clock .clock-face {
          fill: #f8fbff;
          stroke: #d9e2f2;
          stroke-width: 2;
        }

        .hub-vocab-clock .clock-mark {
          stroke: #8795ad;
          stroke-linecap: round;
          stroke-width: 1.5;
        }

        .hub-vocab-clock .clock-mark.hour {
          stroke: #273754;
          stroke-width: 4;
        }

        .hub-vocab-clock .clock-hand {
          stroke-linecap: round;
        }

        .hub-vocab-clock .clock-hand.hour {
          stroke: #13213b;
          stroke-width: 8;
        }

        .hub-vocab-clock .clock-hand.minute {
          stroke: #e59c32;
          stroke-width: 5;
        }

        .hub-vocab-clock .clock-pin {
          fill: #13213b;
          stroke: #f6bd60;
          stroke-width: 2;
        }

        .hub-vocab-sequence-instructions {
          color: rgba(238, 244, 255, 0.78);
          margin: 0;
          text-align: center;
        }

        .hub-vocab-sequence-list {
          display: grid;
          gap: 0.55rem;
          list-style: none;
          margin: 0 auto;
          max-width: 740px;
          padding: 0;
          width: 100%;
        }

        .hub-vocab-sequence-list li {
          align-items: center;
          background: #1a2847;
          border: 1px solid rgba(238, 244, 255, 0.14);
          border-radius: 16px;
          cursor: grab;
          display: grid;
          gap: 0.7rem;
          grid-template-columns: auto auto minmax(0, 1fr) auto;
          min-height: 3.8rem;
          padding: 0.55rem 0.65rem;
        }

        .hub-vocab-sequence-list li:active {
          cursor: grabbing;
        }

        .hub-vocab-sequence-list li.correct {
          background: rgba(114, 223, 155, 0.15);
          border-color: rgba(114, 223, 155, 0.58);
        }

        .hub-vocab-sequence-list li.wrong {
          background: rgba(255, 133, 133, 0.1);
          border-color: rgba(255, 133, 133, 0.5);
        }

        .hub-vocab-sequence-number {
          align-items: center;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 999px;
          display: inline-flex;
          font-weight: 900;
          height: 2rem;
          justify-content: center;
          width: 2rem;
        }

        .hub-vocab-sequence-actions {
          display: flex;
          gap: 0.35rem;
        }

        .hub-vocab-sequence-actions button {
          align-items: center;
          background: #24365d;
          border: 1px solid rgba(238, 244, 255, 0.14);
          border-radius: 9px;
          color: #eef4ff;
          cursor: pointer;
          display: inline-flex;
          font: inherit;
          font-weight: 900;
          height: 2.2rem;
          justify-content: center;
          width: 2.2rem;
        }

        .hub-vocab-sequence-actions button:disabled {
          cursor: default;
          opacity: 0.32;
        }

        .hub-vocab-empty-card {
          justify-items: center;
          text-align: center;
        }

        .hub-vocab-empty-card strong {
          font-size: 1.35rem;
        }

        .hub-vocab-empty-card p {
          color: rgba(238, 244, 255, 0.72);
          margin: 0;
        }

        .hub-vocab-choice-grid {
          display: grid;
          gap: 0.7rem;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .hub-vocab-choice-grid.article-grid {
          max-width: 460px;
          justify-self: center;
          width: 100%;
        }

        .hub-vocab-type-form {
          display: grid;
          gap: 1rem;
        }

        .hub-vocab-type-form label {
          display: grid;
          gap: 0.45rem;
        }

        .hub-vocab-type-form label span {
          color: rgba(238, 244, 255, 0.72);
          font-weight: 800;
        }

        .hub-vocab-type-form input {
          border: 1px solid rgba(238, 244, 255, 0.16);
          border-radius: 16px;
          background: #17243f;
          color: #fff;
          font: inherit;
          font-size: 1.2rem;
          padding: 0.9rem 1rem;
        }

        .hub-vocab-feedback {
          align-items: center;
          border-radius: 18px;
          display: flex;
          gap: 1rem;
          justify-content: space-between;
          padding: 0.9rem 1rem;
        }

        .hub-vocab-feedback.correct {
          background: rgba(114, 223, 155, 0.15);
          border: 1px solid rgba(114, 223, 155, 0.45);
        }

        .hub-vocab-feedback.wrong {
          background: rgba(255, 133, 133, 0.13);
          border: 1px solid rgba(255, 133, 133, 0.36);
        }

        :root[data-theme="light"] .hub-vocab-runner {
          color: #18253f;
        }

        :root[data-theme="light"] .hub-vocab-runner-head {
          border-color: color-mix(in srgb, var(--theme-accent), white 18%);
          background:
            radial-gradient(circle at top right, color-mix(in srgb, var(--theme-accent), white 66%), transparent 42%),
            linear-gradient(135deg, #fff7fb, #eef4ff 58%, #f8f1ff);
          color: #16233d;
          box-shadow: 0 18px 34px rgba(35, 56, 100, 0.12);
        }

        :root[data-theme="light"] .hub-vocab-kicker {
          color: color-mix(in srgb, var(--theme-accent), #8b2f56 35%);
        }

        :root[data-theme="light"] .hub-vocab-runner-head h1,
        :root[data-theme="light"] .hub-vocab-runner-stat strong {
          color: #14213b;
        }

        :root[data-theme="light"] .hub-vocab-runner-head p:last-child,
        :root[data-theme="light"] .hub-vocab-runner-stat span {
          color: rgba(20, 33, 59, 0.74);
        }

        :root[data-theme="light"] .hub-vocab-runner-stat {
          background: rgba(255, 255, 255, 0.52);
          border-color: rgba(59, 84, 134, 0.18);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
        }

        :root[data-theme="light"] .hub-vocab-tabs button,
        :root[data-theme="light"] .hub-vocab-runner-actions button,
        :root[data-theme="light"] .hub-vocab-progress-line button,
        :root[data-theme="light"] .hub-vocab-feedback button {
          background: #ffffff;
          border-color: rgba(44, 73, 128, 0.16);
          color: #1b2a48;
          box-shadow: 0 8px 18px rgba(43, 67, 112, 0.08);
        }

        :root[data-theme="light"] .hub-vocab-tabs button.active {
          background: #f6bd60;
          border-color: #d59b3b;
          color: #13213b;
          box-shadow: 0 10px 18px rgba(213, 155, 59, 0.24);
        }

        :root[data-theme="light"] .hub-vocab-practice-card {
          background: linear-gradient(180deg, #ffffff, #f7f9ff);
          border-color: rgba(44, 73, 128, 0.14);
          color: #172540;
          box-shadow: 0 20px 42px rgba(43, 67, 112, 0.08);
        }

        :root[data-theme="light"] .hub-vocab-overall-progress {
          background: #fff;
          border-color: rgba(44, 73, 128, 0.14);
        }

        :root[data-theme="light"] .hub-vocab-overall-progress > div:first-child span,
        :root[data-theme="light"] .hub-vocab-overall-progress p {
          color: rgba(23, 37, 64, 0.72);
        }

        :root[data-theme="light"] .hub-vocab-overall-progress-track {
          background: rgba(44, 73, 128, 0.12);
        }

        :root[data-theme="light"] .hub-vocab-complete-copy h2,
        :root[data-theme="light"] .hub-vocab-card-face strong,
        :root[data-theme="light"] .hub-vocab-number-large,
        :root[data-theme="light"] .hub-vocab-country-prompt,
        :root[data-theme="light"] .hub-vocab-cue-prompt {
          color: #16233d;
        }

        :root[data-theme="light"] .hub-vocab-complete-copy p,
        :root[data-theme="light"] .hub-vocab-card-count,
        :root[data-theme="light"] .hub-vocab-progress-line,
        :root[data-theme="light"] .hub-vocab-choice-prompt p,
        :root[data-theme="light"] .hub-vocab-type-form label span,
        :root[data-theme="light"] .hub-vocab-status {
          color: rgba(23, 37, 64, 0.78);
        }

        :root[data-theme="light"] .hub-vocab-shortcuts {
          color: rgba(23, 37, 64, 0.56);
        }

        :root[data-theme="light"] .hub-vocab-flashcard {
          border-color: rgba(44, 73, 128, 0.14);
          background:
            radial-gradient(circle at 18% 18%, rgba(246, 189, 96, 0.22), transparent 34%),
            linear-gradient(180deg, #ffffff, #f2f6ff);
          color: #16233d;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.82);
        }

        :root[data-theme="light"] .hub-vocab-card-face span {
          color: rgba(23, 37, 64, 0.72);
        }

        :root[data-theme="light"] .hub-vocab-visual-tile {
          border-color: rgba(44, 73, 128, 0.1);
          background:
            radial-gradient(circle at top left, rgba(255,255,255,0.95), transparent 48%),
            linear-gradient(135deg, #eef5ff, #ffffff);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.85),
            0 10px 24px rgba(43, 67, 112, 0.08);
        }

        :root[data-theme="light"] .hub-vocab-visual-tile.is-colour {
          background:
            linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.08) 28%, rgba(0,0,0,0.08)),
            var(--tile-colour, #60a5fa);
          border-color: rgba(26, 40, 71, 0.16);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.38),
            0 10px 24px rgba(15, 23, 42, 0.1);
        }

        :root[data-theme="light"] .hub-vocab-visual-tile span {
          color: #30466f;
        }

        :root[data-theme="light"] .hub-vocab-object-image,
        :root[data-theme="light"] .hub-vocab-flag-large {
          box-shadow: 0 16px 28px rgba(43, 67, 112, 0.12);
        }

        :root[data-theme="light"] .hub-vocab-hotel-scene {
          border-color: rgba(44, 73, 128, 0.14);
          box-shadow: 0 16px 28px rgba(43, 67, 112, 0.14);
        }

        :root[data-theme="light"] .hub-vocab-match-column button,
        :root[data-theme="light"] .hub-vocab-choice-grid button,
        :root[data-theme="light"] .hub-vocab-category-grid button,
        :root[data-theme="light"] .hub-vocab-sequence-list li,
        :root[data-theme="light"] .hub-vocab-hotspot-words button {
          background: #ffffff;
          border-color: rgba(44, 73, 128, 0.14);
          color: #18253f;
          box-shadow: 0 8px 18px rgba(43, 67, 112, 0.06);
        }

        :root[data-theme="light"] .hub-vocab-hotspot-round-header strong,
        :root[data-theme="light"] .hub-vocab-round-complete strong {
          color: #17223a;
        }

        :root[data-theme="light"] .hub-vocab-hotspot-round-header p,
        :root[data-theme="light"] .hub-vocab-round-complete p {
          color: rgba(23, 34, 58, 0.72);
        }

        :root[data-theme="light"] .hub-vocab-match-column button.selected {
          border-color: #d59b3b;
          box-shadow: 0 0 0 3px rgba(246, 189, 96, 0.26);
        }

        :root[data-theme="light"] .hub-vocab-match-column button.matched,
        :root[data-theme="light"] .hub-vocab-choice-grid button.correct,
        :root[data-theme="light"] .hub-vocab-category-grid button.correct,
        :root[data-theme="light"] .hub-vocab-sequence-list li.correct,
        :root[data-theme="light"] .hub-vocab-hotspot-words button.matched,
        :root[data-theme="light"] .hub-vocab-hotspot-words button:disabled {
          background: rgba(114, 223, 155, 0.22);
          border-color: rgba(50, 142, 101, 0.4);
          color: #173826;
        }

        :root[data-theme="light"] .hub-vocab-choice-grid button.wrong,
        :root[data-theme="light"] .hub-vocab-category-grid button.wrong,
        :root[data-theme="light"] .hub-vocab-sequence-list li.wrong {
          background: rgba(255, 133, 133, 0.14);
          border-color: rgba(183, 72, 72, 0.34);
          color: #5a2020;
        }

        :root[data-theme="light"] .hub-vocab-structured-prompt {
          color: #16233d;
        }

        :root[data-theme="light"] .hub-vocab-sequence-instructions,
        :root[data-theme="light"] .hub-vocab-empty-card p {
          color: rgba(23, 37, 64, 0.76);
        }

        :root[data-theme="light"] .hub-vocab-sequence-number {
          background: rgba(44, 73, 128, 0.09);
        }

        :root[data-theme="light"] .hub-vocab-sequence-actions button {
          background: #eef3ff;
          border-color: rgba(44, 73, 128, 0.16);
          color: #18253f;
        }

        :root[data-theme="light"] .hub-vocab-choice-grid button.dimmed {
          opacity: 0.58;
        }

        :root[data-theme="light"] .hub-vocab-type-form input {
          background: #ffffff;
          border-color: rgba(44, 73, 128, 0.16);
          color: #16233d;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.82);
        }

        :root[data-theme="light"] .hub-vocab-type-form input::placeholder {
          color: rgba(23, 37, 64, 0.42);
        }

        :root[data-theme="light"] .hub-vocab-feedback.correct {
          background: rgba(114, 223, 155, 0.18);
          border-color: rgba(50, 142, 101, 0.34);
          color: #173826;
        }

        :root[data-theme="light"] .hub-vocab-feedback.wrong {
          background: rgba(255, 133, 133, 0.14);
          border-color: rgba(183, 72, 72, 0.3);
          color: #5a2020;
        }

        @media (max-width: 720px) {
          .hub-vocab-runner-head,
          .hub-vocab-feedback {
            flex-direction: column;
            align-items: stretch;
          }

          .hub-vocab-choice-grid {
            grid-template-columns: 1fr;
          }

          .hub-vocab-choice-grid.article-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .hub-vocab-category-grid {
            grid-template-columns: 1fr;
          }

          .hub-vocab-sequence-list li {
            gap: 0.48rem;
            grid-template-columns: auto minmax(0, 1fr) auto;
          }

          .hub-vocab-sequence-list li > .hub-vocab-visual-tile,
          .hub-vocab-sequence-list li > .hub-vocab-object-image,
          .hub-vocab-sequence-list li > .hub-vocab-flag-large {
            display: none;
          }

          .hub-vocab-hotspot-layout {
            grid-template-columns: 1fr;
          }

          .hub-vocab-practice-card {
            border-radius: 20px;
            padding: 0.85rem;
          }

          .hub-vocab-match-grid {
            grid-template-columns: minmax(4.8rem, 0.74fr) minmax(0, 1.26fr);
            gap: 0.42rem;
          }

          .hub-vocab-match-column {
            gap: 0.34rem;
          }

          .hub-vocab-match-column button {
            border-radius: 13px;
            font-size: 0.86rem;
            min-height: 2.75rem;
            padding: 0.42rem 0.48rem;
          }

          .hub-vocab-flag-large.compact {
            max-height: 1.75rem;
            max-width: 3.1rem;
          }

          .hub-vocab-object-image.compact {
            max-height: 1.85rem;
            max-width: 3.2rem;
          }
        }
      `}</style>
    </div>
  );
}
