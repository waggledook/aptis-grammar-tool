import React from "react";

export function ReadingPart1LiveTask({
  task,
  answers = {},
  onChange,
  disabled = false,
  revealGapIds = [],
  showChoices = false,
}) {
  const revealed = new Set(revealGapIds.map(Number));

  function renderGap(gapId) {
    const gap = task.gaps.find((item) => item.id === gapId);
    if (!gap) return null;
    if (gap.fixed) return <span className="rp1-live-fixed">{gap.answer}</span>;
    const showAnswer = revealed.has(gap.id);
    return (
      <span className={`rp1-live-gap ${showAnswer ? "is-revealed" : ""}`}>
        <select
          aria-label={`Choose answer for gap ${gap.id}`}
          disabled={disabled || showAnswer}
          onChange={(event) => onChange?.(gap.id, event.target.value)}
          value={showAnswer ? gap.answer : answers[gap.id] || ""}
        >
          <option value="">—</option>
          {gap.options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        {showAnswer ? <small>Correct answer</small> : null}
      </span>
    );
  }

  return (
    <article className="rp1-live-email-card">
      <p className="rp1-live-prompt">{task.prompt}</p>
      <div className="rp1-live-email">
        {task.lines.map((line, lineIndex) => (
          <p key={lineIndex}>
            {line.map((part, partIndex) => Object.prototype.hasOwnProperty.call(part, "gap")
              ? <React.Fragment key={`${lineIndex}-${partIndex}`}>{renderGap(part.gap)}</React.Fragment>
              : <React.Fragment key={`${lineIndex}-${partIndex}`}>{part.text}</React.Fragment>)}
          </p>
        ))}
        {task.closing ? <p>{task.closing}</p> : null}
        <p>{task.sender}</p>
      </div>
      {showChoices ? (
        <div className="rp1-live-choice-key">
          {task.gaps.filter((gap) => !gap.fixed).map((gap) => (
            <p key={gap.id}><strong>Gap {gap.id}</strong>{gap.options.map((option, index) => <span key={option}>{String.fromCharCode(65 + index)} · {option}</span>)}</p>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function ReadingPart1Distribution({ players, gap, reveal = false, showWhy = false }) {
  const submissions = players
    .map((player) => player.readingPart1Submission?.answers?.[gap.id])
    .filter(Boolean);
  const max = Math.max(1, submissions.length);

  return (
    <section className="rp1-live-distribution">
      <header>
        <div><span>Gap {gap.id}</span><h2>Class answers</h2></div>
        <strong>{submissions.length} submitted</strong>
      </header>
      <div>
        {gap.options.map((option, index) => {
          const count = submissions.filter((answer) => answer === option).length;
          const correct = reveal && option === gap.answer;
          return (
            <article className={correct ? "is-correct" : ""} key={option}>
              <span>{String.fromCharCode(65 + index)}</span>
              <strong>{option}</strong>
              <i><b style={{ width: `${Math.round((count / max) * 100)}%` }} /></i>
              <em>{count}</em>
            </article>
          );
        })}
      </div>
      {showWhy ? <p><strong>Why:</strong> {gap.explanation}</p> : null}
    </section>
  );
}
