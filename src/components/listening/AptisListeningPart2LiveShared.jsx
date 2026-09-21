import React from "react";
import { answerText } from "./aptisListeningPart2LiveUtils.js";

export function MatchingSheet({ task, answers = {}, onChange, disabled = false, onlyPromptKey = null }) {
  return (
    <div className="aptis-p2-live-sheet">
      <p>Match each speaker with one statement. Two statements are extra.</p>
      <div className="aptis-p2-live-choice-list">
        {task.choices.map((choice) => (
          <span key={choice.key}><strong>{choice.key.toUpperCase()}.</strong> {choice.text}</span>
        ))}
      </div>
      <div className="aptis-p2-live-rows">
        {task.prompts.filter((prompt) => !onlyPromptKey || prompt.key === onlyPromptKey).map((prompt) => (
          <label key={prompt.key}>
            <strong>{prompt.text}</strong>
            <select
              aria-label={`Statement for ${prompt.text}`}
              disabled={disabled}
              onChange={(event) => onChange?.(prompt.key, event.target.value)}
              value={answers[prompt.key] || ""}
            >
              <option value="">Choose a statement</option>
              {task.choices.map((choice) => (
                <option key={choice.key} value={choice.key}>{choice.key.toUpperCase()}. {choice.text}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </div>
  );
}

function highlightedScript(text, phrases) {
  const matches = phrases.map((phrase) => ({ phrase, index: text.indexOf(phrase) }))
    .filter(({ index }) => index >= 0)
    .sort((a, b) => a.index - b.index);
  const output = [];
  let cursor = 0;
  for (const { phrase, index } of matches) {
    if (index < cursor) continue;
    if (index > cursor) output.push(text.slice(cursor, index));
    output.push(<mark key={`${index}-${phrase}`}>{phrase}</mark>);
    cursor = index + phrase.length;
  }
  if (cursor < text.length) output.push(text.slice(cursor));
  return output;
}

export function SpeakerScript({ task, prompt, showEvidence = false }) {
  const line = task.script[prompt.scriptLineIndex];
  return (
    <div className="aptis-p2-live-script">
      <h2>{prompt.text} · Transcript</h2>
      <p>{showEvidence ? highlightedScript(line.text, prompt.evidenceParts) : line.text}</p>
    </div>
  );
}

export function SpeakerFeedback({ task, prompt, value, initialValue, hostView = false }) {
  const correct = value === prompt.answer;
  return (
    <div className="aptis-p2-live-feedback">
      <div className="aptis-p2-live-verdict">
        {!hostView && <span>Your answer: <strong>{answerText(task, value)}</strong></span>}
        <span>Correct answer: <strong>{answerText(task, prompt.answer)}</strong></span>
        {!hostView && <span className={correct ? "is-correct" : "is-incorrect"}>{correct ? "Correct" : "Check the evidence"}</span>}
      </div>
      {initialValue !== undefined && initialValue !== value && (
        <p>You first chose {answerText(task, initialValue)}.</p>
      )}
      <SpeakerScript task={task} prompt={prompt} showEvidence />
      <p><strong>Why:</strong> {prompt.explanation}</p>
    </div>
  );
}
