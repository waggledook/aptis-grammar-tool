import React from "react";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightEvidence(text, evidenceParts = []) {
  const parts = evidenceParts.filter(Boolean);
  if (!parts.length) return text;
  const pattern = new RegExp(`(${parts.map((part) => escapeRegex(String(part).trim())).join("|")})`, "gi");
  return String(text).split(pattern).map((segment, index) => {
    const isEvidence = parts.some((part) => segment.toLowerCase() === String(part).trim().toLowerCase());
    return isEvidence ? <mark className="rp4-review-highlight" key={`${index}-${segment}`}>{segment}</mark> : <React.Fragment key={`${index}-${segment}`}>{segment}</React.Fragment>;
  });
}

export function ReadingPart4Headings({ task }) {
  return (
    <section className="rp4-live-headings">
      <header><span>Headings A–H</span><h2>Choose the main idea of each paragraph</h2></header>
      <div>{task.headings.map((heading) => (
        <p key={heading.key}><strong>{heading.key}</strong><span>{heading.text}</span></p>
      ))}</div>
      <small>There is one heading you do not need.</small>
    </section>
  );
}

export function ReadingPart4LiveTask({ task, answers = {}, onChange, disabled = false }) {
  return (
    <section className="rp4-live-task">
      <header><span>Paragraphs 1–7</span><h2>{task.title}</h2></header>
      <ol>{task.paragraphs.map((paragraph) => (
        <li key={paragraph.id}>
          <div className="rp4-live-answer-row">
            <span>{paragraph.id}</span>
            <label>
              <span>Heading</span>
              <select
                aria-label={`Choose heading for paragraph ${paragraph.id}`}
                disabled={disabled}
                onChange={(event) => onChange?.(paragraph.id, event.target.value)}
                value={answers[paragraph.id] || ""}
              >
                <option value="">Choose a heading</option>
                {task.headings.map((heading) => <option key={heading.key} value={heading.key}>{heading.key}. {heading.text}</option>)}
              </select>
            </label>
          </div>
          <p>{paragraph.text}</p>
        </li>
      ))}</ol>
    </section>
  );
}

export function ReadingPart4FullReview({ task, players = [], playerAnswers }) {
  const studentView = playerAnswers !== undefined;
  const answers = playerAnswers || {};

  return (
    <section className="rp4-full-review">
      <header><div><span>Complete task review</span><h2>{task.title}</h2></div><strong>{studentView ? "Your answers" : `${players.length} students`}</strong></header>
      <ol>{task.paragraphs.map((paragraph) => {
        const selected = answers[paragraph.id];
        const correct = selected === paragraph.answer;
        const classAnswers = players
          .map((player) => player.readingPart4Submission?.taskId === task.id ? player.readingPart4Submission.answers?.[paragraph.id] : null)
          .filter(Boolean);
        const correctCount = classAnswers.filter((answer) => answer === paragraph.answer).length;
        const selectedHeading = task.headings.find((heading) => heading.key === selected);
        const correctHeading = task.headings.find((heading) => heading.key === paragraph.answer);
        const stateClass = studentView ? correct ? "is-correct" : selected ? "is-wrong" : "is-empty" : "";
        const evidenceParts = paragraph.evidenceParts || [];

        return (
          <li className={stateClass} key={paragraph.id}>
            <div className="rp4-review-answer-row">
              <span>{paragraph.id}</span>
              <div>
                {studentView ? (
                  <p className="rp4-review-choice"><strong>Your answer:</strong> {selectedHeading ? `${selectedHeading.key}. ${selectedHeading.text}` : "Not answered"}</p>
                ) : (
                  <div className="rp4-review-distribution">{task.headings.map((heading) => {
                    const count = classAnswers.filter((answer) => answer === heading.key).length;
                    return <span className={heading.key === paragraph.answer ? "is-answer" : ""} key={heading.key}>{heading.key} <strong>{count}</strong></span>;
                  })}</div>
                )}
                <p className="rp4-review-correct"><strong>Correct heading:</strong> {correctHeading.key}. {correctHeading.text}{!studentView ? ` · ${correctCount}/${classAnswers.length} correct` : ""}</p>
              </div>
            </div>
            <p className="rp4-review-text">{highlightEvidence(paragraph.text, evidenceParts)}</p>
            {evidenceParts.length ? <p className="rp4-review-evidence"><strong>Evidence:</strong> {evidenceParts.join(" … ")}</p> : null}
            {paragraph.explanation ? <p className="rp4-review-explanation"><strong>Why it matches:</strong> {paragraph.explanation}</p> : null}
          </li>
        );
      })}</ol>
    </section>
  );
}
