import React, { useId, useState } from "react";
import { BookOpen, EyeOff } from "lucide-react";

export default function AptisGrammarOptionExplanations({ item }) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const options = item.options || [];
  const explanations = item.explanations || [];
  if (!options.some((_, index) => explanations[index]?.trim())) return null;

  return <section className="agl-live-explanation agl-option-explanations">
    <div className="agl-explanation-heading">
      <strong>{expanded ? "Why each option is right or wrong" : "Why this answer?"}</strong>
      <button
        className="ctl-button ctl-button-secondary"
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((previous) => !previous)}
      >
        {expanded ? <EyeOff size={17} /> : <BookOpen size={17} />}
        {expanded ? "Hide full explanations" : `Reveal all ${options.length} explanations`}
      </button>
    </div>
    {!expanded && explanations[item.answerIndex] && <p>{explanations[item.answerIndex]}</p>}
    <div id={panelId} hidden={!expanded}>
      <ol className="agl-option-explanation-list">
        {options.map((option, index) => {
          const correct = index === item.answerIndex;
          return <li className={correct ? "is-correct" : ""} key={index}>
            <div className="agl-option-explanation-heading">
              <span className="agl-option-letter">{String.fromCharCode(65 + index)}</span>
              <strong>{option}</strong>
              <span className="agl-option-verdict">{correct ? "Correct" : "Incorrect"}</span>
            </div>
            <p>{explanations[index] || "No explanation is available for this option."}</p>
          </li>;
        })}
      </ol>
    </div>
  </section>;
}
