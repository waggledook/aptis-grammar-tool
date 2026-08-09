// src/components/GapFillList.jsx
import React, { useRef, useState } from 'react';
import GapFillItem from './GapFillItem';
import ProgressTracker from './ProgressTracker';
import { logActivity } from '../firebase';

export default function GapFillList({
  items,
  onAnswer,
  onComplete,
  runKey = "run",
  testMode = false,
  trackingContext = null,
  showProgress = false,
}) {
  const hasLoggedGrammarUse = useRef(false);
  const answersRef = useRef(new Map());
  const trackingPromisesRef = useRef([]);
  const completionSentRef = useRef(false);
  const [summary, setSummary] = useState({ answered: 0, correct: 0 });

  if (!items) return null;
  if (items.length === 0) {
    return <p>No items to display. Click “Start” above.</p>;
  }

  const handleAnswer = (answerPayload) => {
    if (!hasLoggedGrammarUse.current) {
      hasLoggedGrammarUse.current = true;

      if (trackingContext?.mode !== "review") {
        logActivity("grammar_session", {
          mode: testMode ? "test" : "practice",
          totalItems: items.length,
        });
      }
    }

    if (typeof onAnswer === "function") {
      onAnswer(answerPayload);
    }

    const itemId = answerPayload?.itemId;
    if (!itemId || answersRef.current.has(itemId)) return;

    answersRef.current.set(itemId, answerPayload);
    if (answerPayload?.trackingPromise) {
      trackingPromisesRef.current.push(answerPayload.trackingPromise);
    }
    const answered = answersRef.current.size;
    const correct = Array.from(answersRef.current.values()).filter(
      (answer) => answer?.isCorrect
    ).length;
    const nextSummary = { answered, correct };
    setSummary(nextSummary);

    if (
      answered === items.length &&
      !completionSentRef.current &&
      typeof onComplete === "function"
    ) {
      completionSentRef.current = true;
      const completionPayload = {
          ...nextSummary,
          incorrect: Math.max(0, answered - correct),
          total: items.length,
          answers: Array.from(answersRef.current.values()),
        };
      Promise.allSettled(trackingPromisesRef.current)
        .then(() => onComplete(completionPayload))
        .catch((error) =>
        console.error("[GapFillList] onComplete handler failed:", error)
      );
    }
  };

  return (
    <div>
      {items.map((item) => (
        <GapFillItem
          key={`${runKey}-${item.id}`}
          item={item}
          onAnswer={handleAnswer}
          testMode={testMode}
          trackingContext={trackingContext}
        />
      ))}
      {showProgress && (
        <ProgressTracker
          answered={summary.answered}
          correct={summary.correct}
          total={items.length}
          mode={trackingContext?.mode || "practice"}
        />
      )}
    </div>
  );
}
