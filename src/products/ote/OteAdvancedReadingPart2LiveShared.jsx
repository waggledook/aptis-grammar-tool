import React from "react";

export function OteReadingPart2Sources({ task }) {
  return (
    <section className="rp3-live-comments ote-part2-live-sources">
      <header><span>Three specialist responses</span><h2>{task.heading}</h2><p>{task.intro}</p></header>
      <div>{Object.entries(task.reviewers).map(([letter, reviewer]) => (
        <article key={letter}>
          <h3>{letter} · {reviewer.name}</h3>
          <strong>{reviewer.role}</strong>
          {reviewer.text.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </article>
      ))}</div>
    </section>
  );
}

export function OteReadingPart2LiveTask({ task, answers = {}, onChange, disabled = false }) {
  return (
    <section className="rp3-live-questions">
      <header><span>Questions 1–7</span><h2>Who expresses each idea?</h2></header>
      <ol>{task.questions.map((question, index) => (
        <li key={question.id}>
          <span>{index + 1}</span>
          <label>
            <strong>{question.prompt}</strong>
            <select
              aria-label={`Answer question ${index + 1}`}
              disabled={disabled}
              onChange={(event) => onChange?.(question.id, event.target.value)}
              value={answers[question.id] || ""}
            >
              <option value="">Choose a specialist</option>
              {Object.entries(task.reviewers).map(([letter, reviewer]) => (
                <option key={letter} value={letter}>{letter}. {reviewer.name}</option>
              ))}
            </select>
          </label>
        </li>
      ))}</ol>
    </section>
  );
}

export function OteReadingPart2FullReview({ task, players = [], playerAnswers, showWhy = false }) {
  const studentView = playerAnswers !== undefined;
  const answers = playerAnswers || {};
  const reviewerEntries = Object.entries(task.reviewers);

  return (
    <section className="rp3-full-review">
      <header>
        <div><span>Complete task review</span><h2>{task.title}</h2></div>
        <strong>{studentView ? "Your answers" : `${players.length} students`}</strong>
      </header>
      <ol>{task.questions.map((question, index) => {
        const selected = answers[question.id];
        const correct = selected === question.answer;
        const classAnswers = players
          .map((player) => player.oteReadingPart2Submission?.taskId === task.id
            ? player.oteReadingPart2Submission.answers?.[question.id]
            : null)
          .filter(Boolean);
        const correctCount = classAnswers.filter((answer) => answer === question.answer).length;
        const stateClass = studentView ? correct ? "is-correct" : selected ? "is-wrong" : "is-empty" : "";
        const correctReviewer = task.reviewers[question.answer];
        const selectedReviewer = selected ? task.reviewers[selected] : null;
        return (
          <li className={stateClass} key={question.id}>
            <span>{index + 1}</span>
            <div>
              <h3>{question.prompt}</h3>
              {studentView ? (
                <p className="rp3-review-answer"><strong>Your answer:</strong> {selected ? `${selected}. ${selectedReviewer?.name}` : "Not answered"}</p>
              ) : (
                <div className="rp3-review-distribution">{reviewerEntries.map(([letter, reviewer]) => {
                  const count = classAnswers.filter((answer) => answer === letter).length;
                  return <span className={letter === question.answer ? "is-answer" : ""} key={letter}>{letter}. {reviewer.name} <strong>{count}</strong></span>;
                })}</div>
              )}
              <p className="rp3-review-correct"><strong>Correct answer:</strong> {question.answer}. {correctReviewer.name}{!studentView ? ` · ${correctCount}/${classAnswers.length} correct` : ""}</p>
              {showWhy ? <p className="rp3-review-explanation"><strong>Why:</strong> {question.feedback}</p> : null}
            </div>
          </li>
        );
      })}</ol>
    </section>
  );
}
