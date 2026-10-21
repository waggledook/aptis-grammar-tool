import React from "react";

function HighlightedText({ text, phrases = [], className = "ote-part2-paragraph-highlight" }) {
  const matches = phrases.filter((phrase) => phrase && text.includes(phrase));
  if (!matches.length) return text;
  const pattern = new RegExp(`(${matches
    .sort((a, b) => b.length - a.length)
    .map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})`, "g");
  return text.split(pattern).map((part, index) => matches.includes(part)
    ? <mark className={className} key={`${part}-${index}`}>{part}</mark>
    : part);
}

export function OtePart2QuestionPreview({ task, support, revealed = false }) {
  return (
    <section className={`ote-part2-question-preview ${revealed ? "is-revealed" : ""}`}>
      <header><span>Questions 1–7</span><h2>{revealed ? "Question targets revealed" : "Read and decode the questions"}</h2><p>{revealed ? "Compare the key words with the simplified meaning." : "Think about the meaning you will need to locate. Which words carry the real target?"}</p></header>
      <ol>{task.questions.map((question, index) => {
        const help = support[question.id];
        return (
          <li key={question.id}>
            <span>{index + 1}</span>
            <div>
              <p><HighlightedText text={question.prompt} phrases={revealed ? help?.keywords : []} className="ote-part2-keyword-highlight" /></p>
              {revealed ? <div className="ote-part2-question-paraphrase"><strong>In simpler words</strong><span>{help?.paraphrase}</span></div> : null}
            </div>
          </li>
        );
      })}</ol>
    </section>
  );
}

export function OtePart2ParagraphSource({ task, sourceLetter, evidence = [] }) {
  const reviewer = task.reviewers[sourceLetter];
  return (
    <article className="ote-part2-paragraph-source">
      <header><span>Text {sourceLetter}</span><h2>{reviewer.name}</h2><p>{reviewer.role}</p></header>
      {reviewer.text.map((paragraph) => (
        <p key={paragraph}><HighlightedText text={paragraph} phrases={evidence} /></p>
      ))}
    </article>
  );
}

export function OtePart2ParagraphIdeaTask({ task, selectedIds = [], onToggle, disabled = false }) {
  const selected = new Set(selectedIds);
  return (
    <section className="ote-part2-paragraph-ideas">
      <header><span>Your ideas</span><h2>Which questions match this text?</h2><p>Select every statement you think is supported. More than one answer is possible.</p></header>
      <div>{task.questions.map((question, index) => (
        <button
          aria-pressed={selected.has(question.id)}
          className={selected.has(question.id) ? "is-selected" : ""}
          disabled={disabled}
          key={question.id}
          onClick={() => onToggle?.(question.id)}
          type="button"
        >
          <span>{index + 1}</span><p>{question.prompt}</p>
        </button>
      ))}</div>
    </section>
  );
}

export function OtePart2ParagraphReveal({
  task,
  sourceLetter,
  support,
  players = [],
  playerSelection,
  showExplanations = false,
}) {
  const studentView = playerSelection !== undefined;
  const selected = new Set(playerSelection || []);
  return (
    <section className="ote-part2-paragraph-reveal">
      <header><span>Text {sourceLetter} review</span><h2>Class ideas and correct matches</h2></header>
      <ol>{task.questions.map((question, index) => {
        const correct = question.answer === sourceLetter;
        const count = players.filter((player) => {
          const record = player?.oteReadingPart2ParagraphSubmissions?.[sourceLetter];
          return record?.taskId === task.id && record?.submitted && record?.selected?.[question.id];
        }).length;
        const chosen = selected.has(question.id);
        const stateClass = correct ? "is-correct" : studentView && chosen ? "is-extra" : "";
        return (
          <li className={stateClass} key={question.id}>
            <span>{index + 1}</span>
            <div>
              <h3>{question.prompt}</h3>
              <p className="ote-part2-paragraph-verdict">
                <strong>{correct ? `Matches text ${sourceLetter}` : `Does not match text ${sourceLetter}`}</strong>
                {studentView ? <span>{chosen ? "You selected this" : "You did not select this"}</span> : <span>{count} of {players.length} selected this</span>}
              </p>
              {correct && showExplanations ? <p className="rp3-review-explanation"><strong>Why:</strong> {question.feedback}</p> : null}
              {correct && showExplanations ? <p className="ote-part2-evidence-summary"><strong>Evidence to notice:</strong> {support[question.id]?.evidence.join(" … ")}</p> : null}
            </div>
          </li>
        );
      })}</ol>
    </section>
  );
}
