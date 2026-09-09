import React from "react";

export function ReadingPart3Comments({ task }) {
  return (
    <section className="rp3-live-comments">
      <header><span>Four comments</span><h2>{task.title}</h2></header>
      <div>{task.comments.map((comment) => <article key={comment.name}><h3>{comment.name}</h3><p>{comment.text}</p></article>)}</div>
    </section>
  );
}

export function ReadingPart3LiveTask({ task, answers = {}, onChange, disabled = false }) {
  const names = task.comments.map((comment) => comment.name);
  return (
    <section className="rp3-live-questions">
      <header><span>Questions 1–7</span><h2>Who expresses each idea?</h2></header>
      <ol>{task.questions.map((question) => (
        <li key={question.id}>
          <span>{question.id}</span>
          <label>
            <strong>{question.text}</strong>
            <select aria-label={`Answer question ${question.id}`} disabled={disabled} onChange={(event) => onChange?.(question.id, event.target.value)} value={answers[question.id] || ""}>
              <option value="">Choose a person</option>
              {names.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>
        </li>
      ))}</ol>
    </section>
  );
}

export function ReadingPart3FullReview({ task, players = [], playerAnswers }) {
  const studentView = playerAnswers !== undefined;
  const answers = playerAnswers || {};
  const names = task.comments.map((comment) => comment.name);

  return (
    <section className="rp3-full-review">
      <header><div><span>Complete task review</span><h2>{task.title}</h2></div><strong>{studentView ? "Your answers" : `${players.length} students`}</strong></header>
      <ol>{task.questions.map((question) => {
        const selected = answers[question.id];
        const correct = selected === question.answer;
        const classAnswers = players.map((player) => player.readingPart3Submission?.taskId === task.id ? player.readingPart3Submission.answers?.[question.id] : null).filter(Boolean);
        const correctCount = classAnswers.filter((answer) => answer === question.answer).length;
        const stateClass = studentView ? correct ? "is-correct" : selected ? "is-wrong" : "is-empty" : "";
        return (
          <li className={stateClass} key={question.id}>
            <span>{question.id}</span>
            <div>
              <h3>{question.text}</h3>
              {studentView ? <p className="rp3-review-answer"><strong>Your answer:</strong> {selected || "Not answered"}</p> : (
                <div className="rp3-review-distribution">{names.map((name) => {
                  const count = classAnswers.filter((answer) => answer === name).length;
                  return <span className={name === question.answer ? "is-answer" : ""} key={name}>{name} <strong>{count}</strong></span>;
                })}</div>
              )}
              <p className="rp3-review-correct"><strong>Correct answer:</strong> {question.answer}{!studentView ? ` · ${correctCount}/${classAnswers.length} correct` : ""}</p>
              <p><strong>Evidence:</strong> {question.evidenceParts?.join(" … ") || question.evidence}</p>
              <p className="rp3-review-explanation"><strong>Explanation:</strong> {question.explanation}</p>
            </div>
          </li>
        );
      })}</ol>
    </section>
  );
}
