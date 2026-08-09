// src/components/ProgressTracker.jsx
import React from 'react';

export default function ProgressTracker({ answered, correct = 0, total, mode = "practice" }) {
  const complete = total > 0 && answered >= total;
  const incorrect = Math.max(0, answered - correct);
  const accuracy = answered ? Math.round((correct / answered) * 100) : 0;
  const isReview = mode === "review";

  return (
    <div className="progress-tracker" aria-live="polite">
      <p>{isReview ? "Today’s review" : "Progress"}: {answered} / {total}</p>
      {complete && (
        <section className="grammar-session-summary">
          <div>
            <span className="grammar-session-summary-label">
              {isReview ? "Review complete" : "Set complete"}
            </span>
            <h2>{correct} of {total} correct</h2>
            <p>
              {isReview
                ? incorrect === 0
                  ? "Brilliant — you remembered every answer. These questions will return later to help them stick."
                  : `${incorrect} ${incorrect === 1 ? "question will" : "questions will"} come back again, giving you another chance to practise.`
                : incorrect === 0
                  ? "Excellent — every answer was correct."
                  : `${incorrect} ${incorrect === 1 ? "answer needs" : "answers need"} another look.`}
            </p>
          </div>
          <div className="grammar-session-summary-stats">
            <div>
              <span>{isReview ? "Score" : "Accuracy"}</span>
              <strong>{accuracy}%</strong>
            </div>
            <div>
              <span>{isReview ? "Remembered" : "Correct"}</span>
              <strong>{correct}</strong>
            </div>
            <div>
              <span>{isReview ? "Practise again" : "To review"}</span>
              <strong>{incorrect}</strong>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
