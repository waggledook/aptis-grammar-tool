import React from "react";
import { OPINION_OPTIONS, opinionLabel } from "./aptisListeningPart3LiveUtils.js";

export function OpinionSheet({ task, answers = {}, onChange, disabled = false, onlyStatementKey = null }) {
  return (
    <div className="aptis-p3-live-rows">
      {task.statements.filter((statement) => !onlyStatementKey || statement.key === onlyStatementKey).map((statement) => (
        <label key={statement.key}>
          <span><strong>{statement.key.toUpperCase()}.</strong> {statement.text}</span>
          <select
            aria-label={`Who expresses opinion ${statement.key.toUpperCase()}?`}
            disabled={disabled}
            onChange={(event) => onChange?.(statement.key, event.target.value)}
            value={answers[statement.key] || ""}
          >
            <option value="">Choose a speaker</option>
            {OPINION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      ))}
    </div>
  );
}

function highlightedText(text, phrases) {
  const matches = phrases.map((phrase) => ({ phrase, index: text.indexOf(phrase) }))
    .filter(({ index }) => index >= 0)
    .sort((a, b) => a.index - b.index);
  const result = [];
  let cursor = 0;
  for (const { phrase, index } of matches) {
    if (index < cursor) continue;
    if (index > cursor) result.push(text.slice(cursor, index));
    result.push(<mark key={`${index}-${phrase}`}>{phrase}</mark>);
    cursor = index + phrase.length;
  }
  if (cursor < text.length) result.push(text.slice(cursor));
  return result;
}

export function OpinionScript({ task, statement, showEvidence = false }) {
  const [start, end] = statement.scriptRange;
  return (
    <div className="aptis-p2-live-script aptis-p3-live-script">
      <h2>Question {statement.key.toUpperCase()} · Transcript section</h2>
      {task.script.slice(start, end).map((line, index) => (
        <p key={start + index}><strong>{line.speaker}:</strong> {showEvidence ? highlightedText(line.text, statement.evidenceParts) : line.text}</p>
      ))}
    </div>
  );
}

export function OpinionFeedback({ task, statement, value, initialValue, hostView = false }) {
  const correct = value === statement.answer;
  return (
    <div className="aptis-p2-live-feedback">
      <div className="aptis-p2-live-verdict">
        {!hostView && <span>Your answer: <strong>{opinionLabel(value)}</strong></span>}
        <span>Correct answer: <strong>{opinionLabel(statement.answer)}</strong></span>
        {!hostView && <span className={correct ? "is-correct" : "is-incorrect"}>{correct ? "Correct" : "Check the evidence"}</span>}
      </div>
      {initialValue !== undefined && initialValue !== value && <p>You first chose {opinionLabel(initialValue)}.</p>}
      <OpinionScript task={task} statement={statement} showEvidence />
      <p><strong>Why:</strong> {statement.explanation}</p>
    </div>
  );
}
