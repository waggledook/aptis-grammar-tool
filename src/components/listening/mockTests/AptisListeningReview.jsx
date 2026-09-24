import { BookOpen, CheckCircle2, CircleX, Headphones, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { LISTENING_MOCK_REVIEW } from "./listeningMockReviewData.js";

const answerKey = (questionId, itemId) => `${questionId}:${itemId}`;

function selectedAnswerText(question, item, answers) {
  const selected = answers[answerKey(question.id, item.id)];
  if (!selected) return "Not answered";
  if (question.type !== "multiple-choice") return selected;
  const optionIndex = selected.charCodeAt(0) - 65;
  return item.options[optionIndex] || selected;
}

function correctAnswerText(question, item) {
  if (question.type !== "multiple-choice") return item.answer;
  const optionIndex = item.answer.charCodeAt(0) - 65;
  return item.options[optionIndex] || item.answer;
}

function normaliseScript(script) {
  if (typeof script === "string") return [{ speaker: "", text: script }];
  if (!Array.isArray(script)) return [];
  return script.map((entry) => typeof entry === "string" ? { speaker: "", text: entry } : entry);
}

function highlightedText(text, evidenceParts) {
  const lowerText = text.toLocaleLowerCase();
  const ranges = evidenceParts
    .map((part) => {
      const start = lowerText.indexOf(part.toLocaleLowerCase());
      return start < 0 ? null : { start, end: start + part.length };
    })
    .filter(Boolean)
    .sort((a, b) => a.start - b.start)
    .reduce((merged, range) => {
      const previous = merged[merged.length - 1];
      if (previous && range.start <= previous.end) previous.end = Math.max(previous.end, range.end);
      else merged.push({ ...range });
      return merged;
    }, []);

  if (!ranges.length) return text;
  const nodes = [];
  let cursor = 0;
  ranges.forEach((range, index) => {
    if (range.start > cursor) nodes.push(text.slice(cursor, range.start));
    nodes.push(<mark key={`${range.start}-${index}`}>{text.slice(range.start, range.end)}</mark>);
    cursor = range.end;
  });
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

export default function AptisListeningReview({ questions, answers, onRestart, onLeave }) {
  const [filter, setFilter] = useState("all");
  const reviewRows = useMemo(() => questions.map((question) => {
    const correctItems = question.items.filter((item) => answers[answerKey(question.id, item.id)] === item.answer).length;
    return { question, correctItems, isCorrect: correctItems === question.items.length };
  }), [answers, questions]);
  const totalItems = questions.reduce((total, question) => total + question.items.length, 0);
  const answeredItems = questions.reduce((total, question) => total + question.items.filter((item) => answers[answerKey(question.id, item.id)]).length, 0);
  const correctItems = reviewRows.reduce((total, row) => total + row.correctItems, 0);
  const needsReviewCount = reviewRows.filter((row) => !row.isCorrect).length;
  const visibleRows = filter === "needs-review" ? reviewRows.filter((row) => !row.isCorrect) : reviewRows;

  return (
    <main className="alm-review">
      <header className="alm-review-hero">
        <p className="alm-review-eyebrow">Mock 1 · Answer review</p>
        <h1>Understand every answer</h1>
        <p>Listen again without a play limit, compare your choices with the key, and use the highlighted transcript evidence to see why each answer is correct.</p>
        <div className="alm-review-summary" aria-label="Result summary">
          <div><strong>{correctItems}</strong><span>Correct</span></div>
          <div><strong>{totalItems - correctItems}</strong><span>To review</span></div>
          <div><strong>{answeredItems}/{totalItems}</strong><span>Answered</span></div>
        </div>
        <div className="alm-review-actions">
          <button type="button" className="is-primary" onClick={onRestart}><RotateCcw size={17} /> Try the mock again</button>
          <button type="button" onClick={onLeave}>Back to listening</button>
        </div>
      </header>

      <section className="alm-review-toolbar" aria-label="Review filters and question links">
        <div className="alm-review-filters">
          <button className={filter === "all" ? "is-active" : ""} type="button" onClick={() => setFilter("all")}>All questions</button>
          <button className={filter === "needs-review" ? "is-active" : ""} type="button" onClick={() => setFilter("needs-review")}>Needs review ({needsReviewCount})</button>
        </div>
        <nav className="alm-review-jump" aria-label="Jump to a question">
          {visibleRows.map(({ question, isCorrect }) => (
            <a className={isCorrect ? "is-correct" : "is-incorrect"} href={`#review-${question.id}`} key={question.id} aria-label={`Question ${question.number}, ${isCorrect ? "correct" : "needs review"}`}>
              {question.number}
            </a>
          ))}
        </nav>
      </section>

      <div className="alm-review-list">
        {visibleRows.length === 0 && <div className="alm-review-empty"><CheckCircle2 size={28} /><h2>Nothing left to review</h2><p>You answered every item correctly.</p></div>}
        {visibleRows.map(({ question, correctItems: questionCorrectItems, isCorrect }) => {
          const review = LISTENING_MOCK_REVIEW[question.id] || {};
          const evidenceParts = question.items.flatMap((item) => review[item.id]?.evidenceParts || []);
          const script = normaliseScript(question.script);
          return (
            <article className={`alm-review-card ${isCorrect ? "is-correct" : "is-incorrect"}`} id={`review-${question.id}`} key={question.id}>
              <header className="alm-review-card-header">
                <div>
                  <span>Question {question.number} · Part {question.part}</span>
                  <h2>{question.prompt}</h2>
                </div>
                <span className="alm-review-status">
                  {isCorrect ? <CheckCircle2 size={18} /> : <CircleX size={18} />}
                  {isCorrect ? "Correct" : `${questionCorrectItems}/${question.items.length} correct`}
                </span>
              </header>

              <div className="alm-review-player">
                <div><Headphones size={19} /><span>Listen again</span></div>
                <audio controls preload="none" src={question.audioSrc}>Your browser does not support audio playback.</audio>
              </div>

              <section className="alm-review-answer-section">
                <h3>Your answers and the key</h3>
                <div className="alm-review-answer-list">
                  {question.items.map((item, itemIndex) => {
                    const selected = answers[answerKey(question.id, item.id)];
                    const isItemCorrect = selected === item.answer;
                    const itemReview = review[item.id] || {};
                    const itemLabel = item.prompt || item.label || `Item ${itemIndex + 1}`;
                    return (
                      <div className={`alm-review-answer ${isItemCorrect ? "is-correct" : "is-incorrect"}`} key={item.id}>
                        <div className="alm-review-answer-heading">
                          <h4>{itemLabel}</h4>
                          <span>{isItemCorrect ? <CheckCircle2 size={17} /> : <CircleX size={17} />}{isItemCorrect ? "Correct" : selected ? "Incorrect" : "Not answered"}</span>
                        </div>
                        <dl>
                          <div><dt>Your answer</dt><dd>{selectedAnswerText(question, item, answers)}</dd></div>
                          <div><dt>Correct answer</dt><dd>{correctAnswerText(question, item)}</dd></div>
                        </dl>
                        {itemReview.evidenceParts?.length > 0 && <p className="alm-review-evidence"><strong>Evidence:</strong> “{itemReview.evidenceParts.join("” · “")}”</p>}
                        {itemReview.explanation && <p className="alm-review-explanation"><strong>Why:</strong> {itemReview.explanation}</p>}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="alm-review-transcript">
                <h3><BookOpen size={19} /> Transcript <span>Highlighted text supports the answer key</span></h3>
                <div>
                  {script.map((line, lineIndex) => (
                    <p key={`${question.id}-line-${lineIndex}`}>
                      {line.speaker && <strong>{line.speaker}: </strong>}
                      {highlightedText(line.text, evidenceParts)}
                    </p>
                  ))}
                </div>
              </section>
            </article>
          );
        })}
      </div>
    </main>
  );
}
