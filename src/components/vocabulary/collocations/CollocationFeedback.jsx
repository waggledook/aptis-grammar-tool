import React from "react";
import { Save } from "lucide-react";

import "./CollocationFeedback.css";

function collocationFeedbackTitle(result, correctTotal) {
  if (result?.isPerfect) return "Perfect";
  if (result?.selectedCorrect?.length) {
    return `Good work: ${result.selectedCorrect.length} of ${correctTotal} target collocations found`;
  }
  return "Keep going: review the target collocations";
}

export default function CollocationFeedback({
  item,
  result,
  answerKey = false,
  onSave,
  canSave = false,
}) {
  if (!item) return null;
  const correctOptions = (item.options || []).filter((option) => option.isCorrect);
  const selectedCorrect = result?.selectedCorrect || [];
  const selectedWrong = result?.selectedWrong || [];
  const missed = result?.missed || [];
  const stateClass = answerKey
    ? "is-answer-key"
    : result?.isPerfect
      ? "is-correct"
      : selectedCorrect.length
        ? "is-partial"
        : "is-wrong";

  return (
    <div className={`cp-feedback ${stateClass}`}>
      <strong>{answerKey ? "Target collocations" : collocationFeedbackTitle(result, correctOptions.length)}</strong>
      {!answerKey && (
        <div className="cp-feedback-summary">
          <span className="cp-score-pill found">{selectedCorrect.length} found</span>
          {!!missed.length && <span className="cp-score-pill missed">{missed.length} to add</span>}
          {!!selectedWrong.length && <span className="cp-score-pill wrong">{selectedWrong.length} not target</span>}
          {result?.percentage != null && <span className="cp-score-pill points">{result.percentage}%</span>}
          {(result?.points != null || result?.percentage != null) && (
            <span className="cp-score-pill points">{result?.points ?? result?.percentage} points</span>
          )}
        </div>
      )}

      <div className="cp-feedback-list">
        {correctOptions.map((option) => {
          const wasFound = selectedCorrect.includes(option.word);
          return (
            <div key={option.word} className="cp-feedback-entry">
              <div className="cp-entry-head">
                <strong>{option.collocation}</strong>
                <span className={`cp-entry-status ${answerKey || wasFound ? "found" : "missed"}`}>
                  {answerKey ? "Target" : wasFound ? "Found" : "Add this"}
                </span>
                {onSave && (
                  <button
                    type="button"
                    className="cp-save"
                    onClick={() => onSave(item, option)}
                    disabled={!canSave}
                    title={canSave ? "Save example" : "Sign in to save examples"}
                  >
                    <Save size={15} /> Save
                  </button>
                )}
              </div>
              <p>{option.definition}</p>
              {option.example && <p className="cp-example">“{option.example}”</p>}
              <p className="cp-note">{option.note}</p>
            </div>
          );
        })}
      </div>

      {!answerKey && !!selectedWrong.length && (
        <div className="cp-traps">
          <strong>Not common collocations here</strong>
          {(item.options || [])
            .filter((option) => selectedWrong.includes(option.word))
            .map((option) => (
              <p key={option.word}><b>{option.word}:</b> {option.note}</p>
            ))}
        </div>
      )}
    </div>
  );
}
