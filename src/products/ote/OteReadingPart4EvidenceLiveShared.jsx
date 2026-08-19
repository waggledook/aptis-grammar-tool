import React, { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, ChevronDown, Highlighter } from "lucide-react";
import { OPTION_LETTERS, getOptionLetter } from "./data/oteAdvancedReadingPart4OptionJury.js";

function renderHighlightedParagraph(text, highlights = []) {
  const ranges = highlights
    .map((highlight) => {
      const start = text.indexOf(highlight);
      return { text: highlight, start, end: start + highlight.length };
    })
    .filter((range) => range.start >= 0)
    .sort((a, b) => a.start - b.start);
  const result = [];
  let cursor = 0;
  ranges.forEach((range, index) => {
    if (range.start < cursor) return;
    if (range.start > cursor) result.push(text.slice(cursor, range.start));
    result.push(<mark key={`${range.start}:${index}`}>{text.slice(range.start, range.end)}</mark>);
    cursor = range.end;
  });
  if (cursor < text.length) result.push(text.slice(cursor));
  return result;
}

export function Part4EvidenceTimer({ deadline, label = "Skim reading" }) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!deadline) { setRemaining(0); return undefined; }
    const update = () => setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [deadline]);
  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, "0");
  return <div className={`option-jury-timer ${remaining === 0 ? "is-finished" : remaining <= 15 ? "is-low" : ""}`}><span>{label}</span><strong>{minutes}:{seconds}</strong></div>;
}

export function Part4FullPassage({ task, defaultOpen = false }) {
  return (
    <details className="part4-evidence-full-passage" open={defaultOpen}>
      <summary><BookOpen size={18} aria-hidden="true" /><span>{defaultOpen ? "Complete passage" : "Open the complete passage"}</span><ChevronDown size={18} aria-hidden="true" /></summary>
      <article><h2>{task.title}</h2>{task.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</article>
    </details>
  );
}

export function Part4EvidenceQuestion({ task, question, selected = "", onSelect, disabled = false, reveal = false }) {
  const paragraph = task.paragraphs[question.evidenceParagraphIndex];
  const correctLetter = getOptionLetter(question.answer);
  return (
    <article className="part4-evidence-question">
      <section className={`part4-evidence-paragraph ${reveal ? "is-revealed" : ""}`}>
        <header>
          <BookOpen size={19} aria-hidden="true" />
          <div><span>{reveal ? "Highlighted answer evidence" : "Relevant paragraph"}</span><strong>{question.wholeTextQuestion ? "Conclusion · Whole-text question" : `Paragraph ${question.evidenceParagraphIndex + 1}`}</strong></div>
        </header>
        <p>{reveal ? renderHighlightedParagraph(paragraph, question.evidenceHighlights) : paragraph}</p>
        {question.wholeTextQuestion ? <aside>Use this conclusion together with your understanding of the complete text.</aside> : null}
      </section>

      <section className="part4-evidence-answer-card">
        <header><span>Question</span><h2>{question.prompt}</h2></header>
        <div className="part4-evidence-options" role="radiogroup" aria-label={question.prompt}>
          {OPTION_LETTERS.map((letter, index) => {
            const isSelected = selected === letter;
            const isCorrect = reveal && letter === correctLetter;
            const isWrong = reveal && isSelected && letter !== correctLetter;
            return (
              <button
                className={`${isSelected ? "is-selected" : ""} ${isCorrect ? "is-correct" : ""} ${isWrong ? "is-wrong" : ""}`}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={disabled}
                key={letter}
                onClick={() => onSelect?.(letter)}
              >
                <strong>{letter}</strong><span>{question.options[index]}</span>
              </button>
            );
          })}
        </div>
      </section>
    </article>
  );
}

export function Part4AnswerDistribution({ answers = {}, question, reveal = false }) {
  const records = Object.values(answers || {});
  const correctLetter = getOptionLetter(question.answer);
  return (
    <section className="part4-evidence-distribution">
      <header><span>Class answers</span><strong>{records.length} submitted</strong></header>
      <div>
        {OPTION_LETTERS.map((letter) => {
          const count = records.filter((record) => record.option === letter).length;
          const percentage = records.length ? Math.round((count / records.length) * 100) : 0;
          return (
            <article className={reveal && letter === correctLetter ? "is-correct" : ""} key={letter}>
              <strong>{letter}</strong><i><b style={{ width: `${percentage}%` }} /></i><span>{count} · {percentage}%</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function Part4EvidenceExplanation({ question }) {
  const correctLetter = getOptionLetter(question.answer);
  return (
    <section className="part4-evidence-explanation">
      <header><CheckCircle2 size={23} aria-hidden="true" /><span>Correct answer</span><strong>{correctLetter}</strong></header>
      <div className="part4-evidence-correct-sentence"><strong>{correctLetter}</strong><p>{question.options[question.answer]}</p></div>
      <p>{question.explanation}</p>
      <div className="part4-evidence-option-feedback">
        {OPTION_LETTERS.map((letter, index) => (
          <article className={index === question.answer ? "is-correct" : ""} key={letter}>
            <header><strong>{letter}</strong><span>{question.optionLabels[index]}</span></header>
            <p>{question.optionFeedback[index]}</p>
          </article>
        ))}
      </div>
      <aside><Highlighter size={19} aria-hidden="true" /><p><strong>Compare with the highlight.</strong> Which words make the correct option precise, and which tempting option changes or overstates the writer’s meaning?</p></aside>
    </section>
  );
}
