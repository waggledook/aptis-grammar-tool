import React, { useCallback, useMemo, useReducer, useRef, useState } from "react";
import {
  checkWordFormationPlacement,
  createWordFormationSortState,
  getWordFormationSortPrompt,
  wordFormationSortReducer,
} from "../vocabulary/utils/wordFormationSort.js";
import "./hubVocabWordFormationSort.css";

export default function HubVocabWordFormationSort({
  activity, items, coverage, onItemSeen, onMistake, onComplete,
  createSession, completionCard,
}) {
  const CompletionCard = completionCard;
  const categories = useMemo(() => activity.categories || [], [activity.categories]);
  const eligibleItems = useMemo(() => items.filter((entry) => (
    entry.id && entry.baseWord && entry.adjective
    && categories.some((category) => category.id === entry.category)
  )), [categories, items]);
  const seenIdsRef = useRef([]);
  seenIdsRef.current = coverage?.seenItemIds || [];
  const makeSession = useCallback(() => createSession(
    eligibleItems, Number(activity.itemLimit) || 12, seenIdsRef.current
  ), [activity.itemLimit, createSession, eligibleItems]);
  const [sessionItems, setSessionItems] = useState(makeSession);
  const [reviewItems, setReviewItems] = useState(null);
  const [state, dispatch] = useReducer(wordFormationSortReducer, undefined, createWordFormationSortState);
  const [isComplete, setIsComplete] = useState(false);
  const [hoveredColumn, setHoveredColumn] = useState(null);
  const [dragPoint, setDragPoint] = useState(null);
  const boardRef = useRef(null);
  const pointerDrag = useRef(null);
  const suppressClick = useRef(false);
  const reportedMistakes = useRef(new Set());
  const activeItems = reviewItems || sessionItems;
  const remainingItems = activeItems.filter((entry) => !state.placements[entry.id]);
  const roundDone = activeItems.length > 0 && remainingItems.length === 0;
  const selectedEntry = remainingItems.find((entry) => entry.id === state.selectedId);
  const feedbackEntry = activeItems.find((entry) => entry.id === state.feedback?.itemId);

  function columnAt(x, y) {
    const column = document.elementFromPoint(x, y)?.closest("[data-suffix-column]");
    return column && boardRef.current?.contains(column) ? column.dataset.suffixColumn : null;
  }

  function endDrag() {
    pointerDrag.current = null;
    setDragPoint(null);
    setHoveredColumn(null);
  }

  function place(itemId, categoryId) {
    const action = { type: "place", itemId, categoryId, items: activeItems, categories };
    const status = checkWordFormationPlacement(state, action);
    if (!status) return;
    const entry = activeItems.find((item) => item.id === itemId);
    dispatch(action);
    if (status === "correct") {
      if (!reviewItems) onItemSeen?.(entry.id);
    } else if (!reportedMistakes.current.has(entry.id)) {
      reportedMistakes.current.add(entry.id);
      onMistake?.(entry, {
        userAnswer: categories.find((category) => category.id === categoryId).label,
        correctAnswer: categories.find((category) => category.id === entry.category).label,
        answerMode: "category",
        mistakePrompt: getWordFormationSortPrompt(entry),
        reviewOptions: categories.map((category) => category.label),
        reviewCorrectOption: categories.find((category) => category.id === entry.category).label,
      });
    }
  }

  function resetBoard() {
    dispatch({ type: "reset" });
    endDrag();
    setIsComplete(false);
    reportedMistakes.current = new Set();
  }

  function restart() {
    setSessionItems(makeSession());
    setReviewItems(null);
    resetBoard();
  }

  function reviewMistakes() {
    setReviewItems(activeItems.filter((entry) => state.mistakeIds.includes(entry.id)));
    resetBoard();
  }

  if (!activeItems.length || categories.length < 2) return <p>No word-formation items are available.</p>;
  if (isComplete) {
    return (
      <CompletionCard
        title={reviewItems ? "Mistake review complete" : "Suffix columns complete"}
        total={activeItems.length}
        mistakes={reviewItems ? [] : activeItems.filter((entry) => state.mistakeIds.includes(entry.id))}
        completedItemIds={reviewItems ? [] : sessionItems.map((entry) => entry.id)}
        coverage={coverage}
        onRestart={restart}
        onReviewMistakes={reviewMistakes}
        onComplete={reviewItems ? null : onComplete}
      />
    );
  }

  return (
    <section ref={boardRef} className="hub-vocab-practice-card hub-vocab-formation-board" aria-label="Build adjectives in suffix columns">
      <div className="hub-vocab-formation-toolbar">
        <strong>{activeItems.length - remainingItems.length}/{activeItems.length} placed</strong>
        <button type="button" onClick={restart}>New round</button>
      </div>
      <p className="hub-vocab-formation-instructions">{activity.prompt}</p>
      <div className="hub-vocab-formation-word-bank" aria-label="Base words to place">
        {remainingItems.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={`hub-vocab-formation-word ${state.selectedId === entry.id ? "selected" : ""} ${dragPoint?.itemId === entry.id ? "dragging" : ""}`}
            aria-pressed={state.selectedId === entry.id}
            aria-label={`Select ${getWordFormationSortPrompt(entry)}`}
            onClick={() => {
              if (suppressClick.current) return;
              dispatch({ type: "select", itemId: entry.id, items: activeItems });
            }}
            onPointerDown={(event) => {
              // Touch keeps its normal scrolling and tap-to-place behaviour.
              if (event.pointerType === "touch" || event.button !== 0) return;
              pointerDrag.current = { itemId: entry.id, x: event.clientX, y: event.clientY, moved: false };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              const drag = pointerDrag.current;
              if (!drag || drag.itemId !== entry.id) return;
              if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 8) return;
              drag.moved = true;
              setDragPoint({ itemId: entry.id, x: event.clientX, y: event.clientY });
              setHoveredColumn(columnAt(event.clientX, event.clientY));
            }}
            onPointerUp={(event) => {
              const drag = pointerDrag.current;
              if (!drag || drag.itemId !== entry.id) return;
              if (drag.moved || Math.hypot(event.clientX - drag.x, event.clientY - drag.y) >= 8) {
                suppressClick.current = true;
                window.setTimeout(() => { suppressClick.current = false; }, 0);
                const categoryId = columnAt(event.clientX, event.clientY);
                if (categoryId) place(entry.id, categoryId);
              }
              endDrag();
            }}
            onPointerCancel={endDrag}
          >
            <strong>{entry.baseWord}</strong>
            {entry.cue ? <span>{entry.cue}</span> : null}
          </button>
        ))}
        {roundDone ? <p>All the words are placed. Read the completed adjectives below.</p> : null}
      </div>
      <p className="hub-vocab-formation-selection" aria-live="polite">
        {selectedEntry ? <>Selected: <strong>{getWordFormationSortPrompt(selectedEntry)}</strong>. Choose a suffix column.</> : "Drag a base word, or select a word and then choose a suffix column."}
      </p>
      <div className="hub-vocab-formation-columns">
        {categories.map((category) => {
          const placed = activeItems.filter((entry) => state.placements[entry.id] === category.id);
          return (
            <section
              key={category.id}
              className={`hub-vocab-formation-column ${hoveredColumn === category.id ? "drag-over" : ""}`}
              aria-label={`${category.label} column`}
              data-suffix-column={category.id}
              onClick={(event) => {
                if (!event.target.closest("button") && selectedEntry) place(selectedEntry.id, category.id);
              }}
            >
              <button
                type="button"
                className="hub-vocab-formation-column-heading"
                aria-label={`Place selected word in ${category.label}`}
                aria-disabled={!selectedEntry}
                onClick={() => selectedEntry && place(selectedEntry.id, category.id)}
              >{category.label}</button>
              <ul>
                {placed.map((entry) => (
                  <li key={entry.id}>
                    <span>{entry.baseWord} →</span>
                    <strong>{entry.adjective}</strong>
                  </li>
                ))}
              </ul>
              {!placed.length ? <span className="hub-vocab-formation-drop-hint">Drop here</span> : null}
            </section>
          );
        })}
      </div>
      {dragPoint ? (
        <div className="hub-vocab-formation-drag-preview" style={{ left: dragPoint.x + 12, top: dragPoint.y + 12 }} aria-hidden="true">
          {activeItems.find((entry) => entry.id === dragPoint.itemId)?.baseWord}
        </div>
      ) : null}
      <div className="hub-vocab-formation-feedback" role="status">
        {state.feedback?.status === "correct" && feedbackEntry ? <p>Correct: {feedbackEntry.baseWord} → <strong>{feedbackEntry.adjective}</strong>.</p> : null}
        {state.feedback?.status === "wrong" ? <p>That is not the suffix for this adjective. Try another column.</p> : null}
      </div>
      {roundDone ? <div className="hub-vocab-runner-actions"><button type="button" onClick={() => setIsComplete(true)}>Finish round</button></div> : null}
    </section>
  );
}
