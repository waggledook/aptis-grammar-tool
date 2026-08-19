import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock3, Lightbulb, Search, X } from "lucide-react";

function useLessonTimer(deadline) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!deadline) { setRemaining(0); return undefined; }
    const update = () => setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [deadline]);
  return remaining;
}

export function LessonTimer({ deadline, label }) {
  const seconds = useLessonTimer(deadline);
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  const remainder = String(Math.max(0, seconds) % 60).padStart(2, "0");
  return <div className={`free-lesson-timer ${seconds <= 30 ? "is-low" : ""}`}><Clock3 size={20} /><span>{label}</span><strong>{minutes}:{remainder}</strong></div>;
}

function highlightedText(text, fragments = []) {
  const ranges = fragments
    .map((fragment) => ({ fragment, start: text.indexOf(fragment) }))
    .filter((entry) => entry.start >= 0)
    .sort((a, b) => a.start - b.start);
  const content = [];
  let cursor = 0;
  ranges.forEach(({ fragment, start }, index) => {
    if (start < cursor) return;
    if (start > cursor) content.push(text.slice(cursor, start));
    content.push(<mark key={`${start}:${index}`}>{text.slice(start, start + fragment.length)}</mark>);
    cursor = start + fragment.length;
  });
  if (cursor < text.length) content.push(text.slice(cursor));
  return content;
}

function gapParagraph(task, gap) {
  return task.paragraphs.find((paragraph) => Array.isArray(paragraph) && Number(paragraph[1]) === Number(gap));
}

export function GistArticle({ task }) {
  return (
    <article className="free-lesson-article">
      <header><span>Quick read</span><h2>{task.heading}</h2></header>
      {task.paragraphs.map((paragraph, index) => {
        if (!Array.isArray(paragraph)) return <p key={index}>{paragraph}</p>;
        return <p key={index}>{paragraph[0]}<span className="free-lesson-gap-marker">Gap {paragraph[1]}</span>{paragraph[2]}</p>;
      })}
    </article>
  );
}

export function PredictionGap({ task, lesson, gap, reveal = false, note = "", onNoteChange, ready = false, onReady, showResponseControls = true }) {
  const paragraph = gapParagraph(task, gap);
  const clue = lesson.gaps[gap];
  if (!paragraph) return null;
  return (
    <article className="free-lesson-prediction">
      <header><span>Gap {gap} of 6</span><h2>What kind of idea seems to be missing here?</h2><p>Think privately or discuss it. Writing is optional.</p></header>
      <div className={`free-lesson-context ${reveal ? "is-revealed" : ""}`}>
        <p>{reveal ? highlightedText(paragraph[0], clue.beforeHighlights) : paragraph[0]}</p>
        <div>Gap {gap}</div>
        <p>{reveal ? highlightedText(paragraph[2], clue.afterHighlights) : paragraph[2]}</p>
      </div>
      {showResponseControls ? <label className="free-lesson-note">
        <span>Your private idea <small>Optional · not sent to the teacher</small></span>
        <textarea rows={3} maxLength={180} value={note} disabled={reveal || ready} onChange={(event) => onNoteChange?.(event.target.value)} placeholder="A few words are enough…" />
      </label> : null}
      {reveal ? (
        <aside className="free-lesson-clue-explanation"><Lightbulb size={21} /><div><strong>What the surrounding text tells us</strong><p>{clue.explanation}</p></div></aside>
      ) : !showResponseControls ? null : ready ? (
        <div className="free-lesson-ready"><CheckCircle2 size={20} /><strong>Ready</strong><span>Wait for your teacher to show the clues.</span></div>
      ) : (
        <button className="free-lesson-primary" type="button" onClick={onReady}>I’m ready</button>
      )}
    </article>
  );
}

export function SentenceFocus({ task, lesson, index, reveal = false }) {
  const focus = lesson.sentenceFocus[index];
  if (!focus) return null;
  const sentence = task.sentences[focus.letter];
  return (
    <section className="free-lesson-sentence-focus">
      <header><span>Sentence {index + 1} of {lesson.sentenceFocus.length}</span><h2>Look inside the sentence before placing it</h2><p>{reveal ? "Compare the highlighted phrases with the job you expected this sentence to do." : "Read the sentence and find the few phrases that tell you what kind of passage it can join."}</p></header>
      <article className={reveal ? "is-revealed" : ""}><strong>{focus.letter}</strong><p>{reveal ? highlightedText(sentence, focus.keyPhrases) : sentence}</p></article>
      {reveal ? <aside className="free-lesson-clue-explanation"><Lightbulb size={21} /><div><strong>What those phrases tell us</strong><p>{focus.explanation}</p></div></aside> : <aside className="free-lesson-find-prompt"><Search size={21} /><div><strong>Find the useful wording</strong><p>Which words point backwards, introduce a reason or show the sentence’s main contrast? You do not need to write anything.</p></div></aside>}
    </section>
  );
}

export function PlacementBoard({ task, placements = {}, selected = "", onSelect, onPlace, onClear, disabled = false }) {
  const usedAt = (letter) => Object.entries(placements).find(([, value]) => value === letter)?.[0];
  return (
    <div className="free-lesson-placement-layout">
      <aside className="free-lesson-sentence-bank">
        <header><span>Sentence bank</span><h2>Choose a sentence</h2></header>
        {Object.entries(task.sentences).map(([letter, sentence]) => {
          const gap = usedAt(letter);
          return <button className={`${selected === letter ? "is-selected" : ""} ${gap ? "is-used" : ""}`} type="button" disabled={disabled} key={letter} onClick={() => onSelect?.(selected === letter ? "" : letter)}><strong>{letter}</strong><span>{sentence}</span>{gap ? <small>Gap {gap}</small> : null}</button>;
        })}
        <p>Use six sentences. One is not needed.</p>
      </aside>
      <article className="free-lesson-article is-placement">
        <header><span>Place the sentences</span><h2>{task.heading}</h2></header>
        {task.paragraphs.map((paragraph, index) => {
          if (!Array.isArray(paragraph)) return <p key={index}>{paragraph}</p>;
          const gap = String(paragraph[1]);
          const answer = placements[gap];
          return (
            <p key={index}>{paragraph[0]}
              <span className={`free-lesson-placement-gap ${answer ? "is-filled" : ""}`}>
                {answer ? <><strong>{answer}</strong><span>{task.sentences[answer]}</span>{!disabled ? <button type="button" onClick={() => onClear?.(gap)} aria-label={`Clear gap ${gap}`}><X size={15} /></button> : null}</> : <button type="button" disabled={disabled || !selected} onClick={() => onPlace?.(gap, selected)}>Place in Gap {gap}</button>}
              </span>
              {paragraph[2]}
            </p>
          );
        })}
      </article>
    </div>
  );
}

export function GapReview({ task, lesson, gap, placementsByPlayer = {}, studentAnswer = "" }) {
  const paragraph = gapParagraph(task, gap);
  const clue = lesson.gaps[gap];
  const correctLetter = task.answers[gap];
  const records = Object.values(placementsByPlayer || {}).map((entry) => entry?.answers?.[gap]).filter(Boolean);
  return (
    <section className="free-lesson-review">
      <header><span>Gap {gap} of 6 · Class review</span><h2>{studentAnswer ? (studentAnswer === correctLetter ? "Your answer was correct" : `You chose ${studentAnswer}; the answer is ${correctLetter}`) : `Correct answer: ${correctLetter}`}</h2></header>
      <div className="free-lesson-distribution">
        {Object.keys(task.sentences).map((letter) => {
          const count = records.filter((answer) => answer === letter).length;
          const percent = records.length ? Math.round((count / records.length) * 100) : 0;
          return <article className={letter === correctLetter ? "is-correct" : ""} key={letter}><strong>{letter}</strong><i><b style={{ width: `${percent}%` }} /></i><span>{count} · {percent}%</span></article>;
        })}
      </div>
      <article className="free-lesson-review-context">
        <p>{highlightedText(paragraph[0], clue.beforeHighlights)}</p>
        <div><strong>{correctLetter}</strong><span>{task.sentences[correctLetter]}</span></div>
        <p>{highlightedText(paragraph[2], clue.afterHighlights)}</p>
      </article>
      <aside className="free-lesson-clue-explanation"><Lightbulb size={21} /><div><strong>How the evidence connects</strong><p>{clue.explanation}</p><p className="free-lesson-fit-summary"><b>Why {correctLetter} fits:</b> {task.rationales[gap]}</p></div></aside>
    </section>
  );
}
