import React from "react";
import { multipleChoiceLabel } from "./aptisListeningPart4LiveUtils.js";

export function MultipleChoiceSheet({ task, answers = {}, onChange, disabled = false, onlyQuestionKey = null }) {
  return (
    <div className="aptis-p3-live-rows">
      {task.questions.map((question, index) => ({ question, index }))
        .filter(({ question }) => !onlyQuestionKey || question.key === onlyQuestionKey)
        .map(({ question, index }) => (
          <label key={question.key}>
            <span><strong>{index + 1}.</strong> {question.text}</span>
            <select
              aria-label={`Answer question ${index + 1}`}
              disabled={disabled}
              onChange={(event) => onChange?.(question.key, event.target.value)}
              value={answers[question.key] || ""}
            >
              <option value="">Choose an answer</option>
              {question.options.map((option) => (
                <option key={option.value} value={option.value}>{option.value}. {option.text}</option>
              ))}
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

export function MultipleChoiceScript({ task, question, questionNumber, showEvidence = false }) {
  const [start, end] = question.scriptRange || [0, task.script.length];
  return (
    <div className="aptis-p2-live-script aptis-p3-live-script">
      <h2>Question {questionNumber} · Transcript section</h2>
      {task.script.slice(start, end).map((line, index) => (
        <p key={start + index}><strong>{line.speaker}:</strong> {showEvidence ? highlightedText(line.text, question.evidenceParts) : line.text}</p>
      ))}
    </div>
  );
}

export function MultipleChoiceFeedback({ task, question, questionNumber, value, initialValue, hostView = false }) {
  const correct = value === question.answer;
  return (
    <div className="aptis-p2-live-feedback">
      <div className="aptis-p2-live-verdict">
        {!hostView && <span>Your answer: <strong>{multipleChoiceLabel(question, value)}</strong></span>}
        <span>Correct answer: <strong>{multipleChoiceLabel(question, question.answer)}</strong></span>
        {!hostView && <span className={correct ? "is-correct" : "is-incorrect"}>{correct ? "Correct" : "Check the evidence"}</span>}
      </div>
      {initialValue !== undefined && initialValue !== value && <p>You first chose {multipleChoiceLabel(question, initialValue)}.</p>}
      <MultipleChoiceScript task={task} question={question} questionNumber={questionNumber} showEvidence />
      <p><strong>Why:</strong> {question.explanation}</p>
    </div>
  );
}
