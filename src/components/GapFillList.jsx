// src/components/GapFillList.jsx
import React, { useRef } from 'react';
import GapFillItem from './GapFillItem';
import { logActivity } from '../firebase';

export default function GapFillList({
  items,
  onAnswer,
  runKey = "run",
  testMode = false,
}) {
  const hasLoggedGrammarUse = useRef(false);

  if (!items) return null;
  if (items.length === 0) {
    return <p>No items to display. Click “Generate” above.</p>;
  }

  const handleAnswer = (answerPayload) => {
    if (!hasLoggedGrammarUse.current) {
      hasLoggedGrammarUse.current = true;

      logActivity("grammar_session", {
        mode: testMode ? "test" : "practice",
        totalItems: items.length,
      });
    }

    if (typeof onAnswer === "function") {
      onAnswer(answerPayload);
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
        />
      ))}
    </div>
  );
}
