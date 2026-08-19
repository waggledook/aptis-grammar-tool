import React from "react";

export function LiveChallengeCase({ item, selected = "", onSelect, disabled = false, reveal = false }) {
  return (
    <article className="cohesion-live-case">
      <header><span>Case study</span><h2>{item.title}</h2></header>
      <div className="cohesion-challenge-passage">
        {item.before.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <div className="cohesion-challenge-gap">Missing sentence</div>
        {item.after.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
      <div className="cohesion-challenge-options" role="radiogroup" aria-label={`Options for ${item.title}`}>
        {Object.entries(item.options).map(([letter, text]) => (
          <button
            className={`${selected === letter ? "is-selected" : ""} ${reveal && item.answer === letter ? "is-answer" : ""} ${reveal && selected === letter && selected !== item.answer ? "is-wrong" : ""}`}
            type="button"
            role="radio"
            aria-checked={selected === letter}
            disabled={disabled}
            key={letter}
            onClick={() => onSelect?.(letter)}
          >
            <strong>{letter}</strong><span>{text}</span>
          </button>
        ))}
      </div>
    </article>
  );
}

export function LiveAnswerKey({ item }) {
  return (
    <section className="cohesion-live-key">
      <header><span>Best answer</span><strong>{item.answer}</strong><h2>{item.clue}</h2></header>
      <div className="cohesion-correct-sentence"><strong>{item.answer}</strong><p>{item.options[item.answer]}</p></div>
      <p>{item.explanation}</p>
      <blockquote><strong>Decisive evidence</strong>{item.evidence}</blockquote>
      <div>{Object.entries(item.why).map(([letter, reason]) => <p key={letter}><strong>Why {letter} is tempting—but fails:</strong> {reason}</p>)}</div>
      <aside><strong>Discuss</strong> Which distractor was most tempting? Change as little as possible in it so that it could perform the required discourse job.</aside>
    </section>
  );
}

export function LiveClueChoices({ item, selected = "", onSelect, disabled = false, reveal = false }) {
  return (
    <section className="cohesion-live-clue-task">
      <header><span>Decisive clue</span><h2>What most strongly decides the gap?</h2></header>
      <div className="cohesion-clue-options" role="radiogroup" aria-label="Possible decisive clues">
        {item.clueChoices.map((choice) => (
          <button
            className={`${selected === choice.id ? "is-selected" : ""} ${reveal && item.clueAnswer === choice.id ? "is-answer" : ""} ${reveal && selected === choice.id && selected !== item.clueAnswer ? "is-wrong" : ""}`}
            type="button"
            role="radio"
            aria-checked={selected === choice.id}
            disabled={disabled}
            key={choice.id}
            onClick={() => onSelect?.(choice.id)}
          >
            <span>{choice.text}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function LiveAnswerDistribution({ players, item, reveal = false }) {
  const records = players.map((player) => player.cohesionAnswers?.[item.id]).filter(Boolean);
  return (
    <section className="cohesion-live-distribution">
      <header><span>Class answers</span><strong>{records.length} submitted</strong></header>
      <div>
        {["A", "B", "C"].map((letter) => {
          const count = records.filter((record) => record.option === letter).length;
          const percentage = records.length ? Math.round((count / records.length) * 100) : 0;
          return (
            <article className={reveal && letter === item.answer ? "is-answer" : ""} key={letter}>
              <strong>{letter}</strong>
              <i><b style={{ width: `${percentage}%` }} /></i>
              <span>{count} · {percentage}%</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function LiveClueDistribution({ players, item, reveal = false }) {
  const records = players.map((player) => player.cohesionAnswers?.[item.id]).filter(Boolean);
  return (
    <section className="cohesion-live-distribution cohesion-live-clue-distribution">
      <header><span>Clues selected</span><strong>{records.length} submitted</strong></header>
      <div>
        {item.clueChoices.map((choice, index) => {
          const count = records.filter((record) => record.clueId === choice.id).length;
          const percentage = records.length ? Math.round((count / records.length) * 100) : 0;
          return (
            <article className={reveal && choice.id === item.clueAnswer ? "is-answer" : ""} key={choice.id}>
              <strong>{index + 1}</strong>
              <i><b style={{ width: `${percentage}%` }} /></i>
              <span>{count} · {percentage}%</span>
              <p>{choice.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
