import React from "react";
import { CLUE_TYPES } from "./utils/cohesionDetective.js";

export function SelectableText({ text, zone, selectedKeys, onToggle, disabled = false }) {
  return (
    <p className="ote-cohesion-selectable">
      {text.split(/(\s+)/).map((piece, index) => {
        if (/^\s+$/.test(piece)) return <React.Fragment key={`${zone}:space:${index}`}>{piece}</React.Fragment>;
        const clueKey = `${zone}:${index}`;
        const selected = selectedKeys.includes(clueKey);
        return (
          <button
            className={`ote-cohesion-word ${selected ? "is-selected" : ""}`}
            key={clueKey}
            type="button"
            aria-pressed={selected}
            aria-label={`${selected ? "Remove" : "Mark"} clue: ${piece}`}
            disabled={disabled}
            onClick={() => onToggle(clueKey)}
          >
            {piece}
          </button>
        );
      })}
    </p>
  );
}

export function OfficialText({ text, highlights = [] }) {
  const ranges = highlights
    .map((highlight) => ({
      ...highlight,
      start: text.indexOf(highlight.text),
      end: text.indexOf(highlight.text) + highlight.text.length,
    }))
    .filter((highlight) => highlight.start >= 0)
    .sort((a, b) => a.start - b.start);
  const content = [];
  let cursor = 0;

  ranges.forEach((highlight, index) => {
    if (highlight.start < cursor) return;
    if (highlight.start > cursor) content.push(text.slice(cursor, highlight.start));
    content.push(
      <mark
        className={`ote-cohesion-official-mark is-${highlight.type}`}
        key={`${highlight.text}:${index}`}
        title={CLUE_TYPES[highlight.type]?.label}
      >
        {text.slice(highlight.start, highlight.end)}
      </mark>
    );
    cursor = highlight.end;
  });
  if (cursor < text.length) content.push(text.slice(cursor));

  return <p>{content}</p>;
}

export function ClueLegend() {
  return (
    <div className="ote-cohesion-legend" aria-label="Official clue types">
      {Object.entries(CLUE_TYPES).map(([type, clue]) => (
        <article className={`is-${type}`} key={type}>
          <span>{clue.label}</span>
          <p>{clue.copy}</p>
        </article>
      ))}
    </div>
  );
}

export function CohesionContext({ item, selectedKeys, onToggle, revealed }) {
  const correctOption = item.options.find((option) => option.id === item.answer);

  return (
    <>
      <div className="ote-cohesion-context" aria-label="Text around the gap">
        <article>
          <span>{revealed ? "Before · official clues" : "Before the gap"}</span>
          {revealed ? (
            <OfficialText text={item.before} highlights={item.highlights.before} />
          ) : (
            <SelectableText text={item.before} zone="before" selectedKeys={selectedKeys} onToggle={onToggle} />
          )}
        </article>
        {revealed ? (
          <article className="ote-cohesion-gap is-revealed">
            <span>Answer {item.answer} · official clues</span>
            <OfficialText text={correctOption.text} highlights={item.highlights.answer} />
          </article>
        ) : (
          <div className="ote-cohesion-gap"><span>Missing sentence</span></div>
        )}
        <article>
          <span>{revealed ? "After · official clues" : "After the gap"}</span>
          {revealed ? (
            <OfficialText text={item.after} highlights={item.highlights.after} />
          ) : (
            <SelectableText text={item.after} zone="after" selectedKeys={selectedKeys} onToggle={onToggle} />
          )}
        </article>
      </div>
      {revealed ? (
        <div className="ote-cohesion-inline-legend" aria-label="Highlighted clue types">
          {Object.entries(CLUE_TYPES).map(([type, clue]) => (
            <span className={`is-${type}`} key={type}>{clue.label}</span>
          ))}
        </div>
      ) : null}
    </>
  );
}

export function CohesionExplanation({ item }) {
  return (
    <details className="ote-cohesion-explanation">
      <summary>Why this connection is strongest</summary>
      <p className="ote-cohesion-distractor-note"><strong>Why the others are weaker:</strong> {item.distractor}</p>
      <div className="ote-cohesion-connections is-compact">
        {item.connections.map((connection) => (
          <article className={`is-${connection.type}`} key={`${connection.type}:${connection.text}`}>
            <span>{CLUE_TYPES[connection.type].label}</span>
            <p>{connection.text}</p>
          </article>
        ))}
      </div>
    </details>
  );
}
