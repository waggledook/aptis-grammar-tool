import React from "react";
import { BookOpenCheck, CheckCircle2, Headphones, Radio } from "lucide-react";
import { normaliseListeningAnswer, optionLetter } from "./utils/listeningLive.js";
import { OpinionMatchingTask } from "./OteAdvancedListeningPart3Practice.jsx";

function evidenceFor(activity, item) {
  if (activity.format === "part1") {
    return (item.reviewEvidence || []).map((entry) => ({
      ...entry,
      type: entry.option === item.answer ? "correct" : "distractor",
    }));
  }
  if (activity.format === "part3") {
    return item.review.evidence.map((entry) => ({ ...entry }));
  }
  return [
    { quote: item.review?.correctQuote || "", type: "correct" },
    ...(item.review?.distractors || []).map((entry) => ({
      ...entry,
      type: "distractor",
    })),
  ].filter((entry) => entry.quote);
}

function renderHighlightedText(text, evidence) {
  const matches = evidence
    .map((entry) => ({ ...entry, start: text.indexOf(entry.quote) }))
    .filter((entry) => entry.start >= 0)
    .sort((a, b) => a.start - b.start);
  if (!matches.length) return text;

  const parts = [];
  let cursor = 0;
  matches.forEach((entry, index) => {
    if (entry.start < cursor) return;
    if (entry.start > cursor) parts.push(text.slice(cursor, entry.start));
    parts.push(
      <mark
        className={entry.type === "correct" ? "is-correct" : "is-distractor"}
        key={`${entry.type}-${entry.start}-${index}`}
      >
        {entry.quote}
      </mark>
    );
    cursor = entry.start + entry.quote.length;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

export function ListeningLiveStatus({ children }) {
  return (
    <div className="ote-listening-live-status">
      <Radio size={18} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

export function PartOneQuestion({ item, value, onChange, disabled = false }) {
  return (
    <section className="ote-listening-live-question">
      <header>
        <p>{item.context}</p>
        <h2>{item.prompt}</h2>
      </header>
      <div
        className={`ote-listening-live-options ${item.kind === "pictures" ? "is-pictures" : "is-text"}`}
        role="radiogroup"
        aria-label={item.prompt}
      >
        {item.options.map((option, index) => {
          const selected = value === index;
          return (
            <button
              className={selected ? "is-selected" : ""}
              disabled={disabled}
              key={`${item.id}-${index}`}
              onClick={() => onChange?.(index)}
              role="radio"
              aria-checked={selected}
              aria-label={`${optionLetter(index)}. ${option.text}`}
              type="button"
            >
              {item.kind === "pictures" ? (
                <img src={option.image} alt="" />
              ) : (
                <><strong>{optionLetter(index)}</strong><span>{option.text}</span></>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function GeneralChoiceRow({ item, number, value, onChange, example = false, disabled = false }) {
  return (
    <div className={`ote-general-listening-choice-row ${example ? "is-example" : ""}`}>
      <div className="ote-general-listening-choice-stem">
        <strong>{example ? "Example" : number}</strong>
        <span>{item.before}</span>
      </div>
      <div className="ote-general-listening-choice-options" role="radiogroup">
        {item.options.map((option, index) => (
          <button
            className={value === index ? "is-selected" : ""}
            disabled={example || disabled}
            key={option}
            onClick={() => onChange?.(index)}
            role="radio"
            aria-checked={value === index}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export function GeneralPartTwoTask({ set, answers, onChange, disabled = false }) {
  const rows = [
    { item: set.example, example: true, number: 0 },
    ...set.items.map((item, index) => ({ item, example: false, number: index + 1 })),
  ];
  const sections = [...new Set(rows.map(({ item }) => item.section))];
  return (
    <div className="ote-general-listening-notes-sheet">
      <h2>{set.title}</h2>
      {sections.map((section) => (
        <section key={section}>
          <h3>{section}</h3>
          {rows.filter(({ item }) => item.section === section).map(({ item, example, number }) => (
            <GeneralChoiceRow
              disabled={disabled}
              example={example}
              item={item}
              key={item.id}
              number={number}
              onChange={(value) => onChange?.(item.id, value)}
              value={example ? item.answer : answers[item.id]}
            />
          ))}
        </section>
      ))}
    </div>
  );
}

export function AdvancedPartTwoTask({ set, answers, onChange, disabled = false }) {
  const sections = [...new Set(set.gaps.map((gap) => gap.section))];
  return (
    <div className="ote-listening-notes-sheet">
      <h2>{set.title}</h2>
      {sections.map((section) => {
        const gaps = set.gaps.filter((gap) => gap.section === section);
        const notes = (set.supportingNotes || []).filter((note) => note.section === section);
        return (
          <section key={section}>
            <h3>{section}</h3>
            {gaps.map((gap) => {
              const index = set.gaps.findIndex((entry) => entry.id === gap.id);
              const before = notes.filter((note) => note.beforeGap === gap.id);
              const after = notes.filter((note) => note.afterGap === gap.id);
              const leadingPunctuation = gap.after.match(/^[.,;:]/)?.[0] || "";
              const remainingText = leadingPunctuation ? gap.after.slice(1) : gap.after;
              return (
                <React.Fragment key={gap.id}>
                  {before.map((note) => <p key={note.text}>{note.text}</p>)}
                  <p className="ote-listening-note-line">
                    <span>{gap.before} </span>
                    <label>
                      <span className="sr-only">Gap {index + 1}</span>
                      <span className="ote-listening-gap-number" aria-hidden="true">{index + 1}</span>
                      <input
                        aria-label={`Gap ${index + 1}`}
                        autoComplete="off"
                        disabled={disabled}
                        onChange={(event) => onChange?.(gap.id, event.target.value)}
                        type="text"
                        value={answers[gap.id] || ""}
                      />
                      {leadingPunctuation ? (
                        <span className="ote-listening-gap-punctuation" aria-hidden="true">
                          {leadingPunctuation}
                        </span>
                      ) : null}
                    </label>
                    <span>{remainingText}</span>
                  </p>
                  {after.map((note) => <p key={note.text}>{note.text}</p>)}
                </React.Fragment>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}

export function ListeningTask({
  activity,
  answers,
  onChange,
  questionIndex = 0,
  disabled = false,
}) {
  if (activity.format === "part1") {
    const item = activity.set.questions[questionIndex];
    return (
      <PartOneQuestion
        disabled={disabled}
        item={item}
        onChange={(value) => onChange?.(item.id, value)}
        value={answers[item.id]?.value ?? answers[item.id]}
      />
    );
  }
  if (activity.format === "general-part2") {
    return <GeneralPartTwoTask set={activity.set} answers={answers} onChange={onChange} disabled={disabled} />;
  }
  if (activity.format === "part3") {
    return (
      <OpinionMatchingTask
        answers={answers}
        disabled={disabled}
        onChange={onChange}
        set={activity.set}
      />
    );
  }
  return <AdvancedPartTwoTask set={activity.set} answers={answers} onChange={onChange} disabled={disabled} />;
}

function CompletedReviewSentence({ before, answer, after }) {
  return (
    <p className="ote-listening-live-review-sentence">
      <span>{before} </span>
      <mark>{answer}</mark>
      <span>{after}</span>
    </p>
  );
}

function PartOneReviewContext({ item, selectedValue, showSelection }) {
  return (
    <div className="ote-listening-live-review-context is-part-one">
      <div className="ote-listening-live-review-question">
        <p>{item.context}</p>
        <h4>{item.prompt}</h4>
      </div>
      <div
        className={`ote-listening-live-review-options ${item.kind === "pictures" ? "is-pictures" : "is-text"}`}
        aria-label="Answer options"
      >
        {item.options.map((option, index) => {
          const isCorrect = index === item.answer;
          const isSelected = showSelection && index === selectedValue;
          return (
            <div
              className={`${isCorrect ? "is-correct" : ""} ${isSelected ? "is-selected" : ""}`}
              key={`${item.id}-review-${index}`}
            >
              {item.kind === "pictures" ? <img src={option.image} alt="" /> : <span>{option.text}</span>}
              <strong aria-label={`Option ${optionLetter(index)}`}>{optionLetter(index)}</strong>
              <small>
                {isCorrect ? "Correct answer" : isSelected ? "Your answer" : ""}
              </small>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ListeningReviewContext({ activity, item, selectedValue, showSelection }) {
  if (activity.format === "part1") {
    return (
      <PartOneReviewContext
        item={item}
        selectedValue={selectedValue}
        showSelection={showSelection}
      />
    );
  }

  if (activity.format === "part3") {
    const answerLabel = activity.set.speakers.find((speaker) => speaker.id === item.answer)?.label;
    return (
      <div className="ote-listening-live-review-context">
        <p className="ote-listening-live-review-section">Opinion</p>
        <p className="ote-listening-live-review-sentence">{item.text}</p>
        <p><strong>Expressed by: {answerLabel}</strong></p>
      </div>
    );
  }

  const answer = activity.format === "general-part2"
    ? item.options[item.answer]
    : item.answer;
  return (
    <div className="ote-listening-live-review-context">
      {item.section ? <p className="ote-listening-live-review-section">{item.section}</p> : null}
      <CompletedReviewSentence before={item.before} answer={answer} after={item.after} />
    </div>
  );
}

export function ListeningFeedback({ activity, item, selectedValue, showAudio = false }) {
  const evidence = evidenceFor(activity, item);
  const isPartOne = activity.format === "part1";
  const isPartThree = activity.format === "part3";
  const hasResponse =
    selectedValue !== undefined &&
    selectedValue !== null &&
    String(selectedValue).trim() !== "";
  const correctText = isPartOne
    ? `${optionLetter(item.answer)}. ${item.options[item.answer].text}`
    : isPartThree
      ? activity.set.speakers.find((speaker) => speaker.id === item.answer)?.label
    : activity.format === "general-part2"
      ? `${optionLetter(item.answer)}. ${item.options[item.answer]}`
      : item.answer;
  const selectedText = !hasResponse
    ? "No answer submitted"
    : isPartOne
      ? `${optionLetter(selectedValue)}. ${item.options[selectedValue].text}`
      : isPartThree
        ? activity.set.speakers.find((speaker) => speaker.id === selectedValue)?.label || String(selectedValue)
      : activity.format === "general-part2"
        ? `${optionLetter(selectedValue)}. ${item.options[selectedValue]}`
        : String(selectedValue).trim();
  const correct =
    isPartOne || activity.format === "general-part2"
      ? selectedValue === item.answer
      : isPartThree
        ? selectedValue === item.answer
      : normaliseListeningAnswer(selectedValue) === normaliseListeningAnswer(item.answer);

  return (
    <section className={`ote-listening-question-feedback ${correct ? "is-correct" : "is-wrong"}`}>
      <header>
        {correct ? <CheckCircle2 size={25} /> : <BookOpenCheck size={25} />}
        <div>
          <p className="ote-kicker">{correct ? "Correct answer" : "Detailed review"}</p>
          <h3>{correctText}</h3>
        </div>
      </header>
      {!showAudio ? (
        <div className={`ote-listening-live-student-response ${correct ? "is-correct" : "is-wrong"}`}>
          <span>Your response</span>
          <strong>{selectedText}</strong>
        </div>
      ) : null}
      <ListeningReviewContext
        activity={activity}
        item={item}
        selectedValue={selectedValue}
        showSelection={!showAudio && hasResponse}
      />
      <p className="ote-listening-feedback-explanation">
        {isPartOne ? item.explanation : item.review?.explanation}
      </p>

      {showAudio ? (
        <div className="ote-listening-feedback-audio">
          <div>
            <Headphones size={20} />
            <span><strong>Play with the script</strong><small>Host audio is shared with the class.</small></span>
          </div>
          <audio controls preload="metadata" src={isPartOne ? item.audioSrc : activity.set.audioSrc}>
            Your browser does not support audio playback.
          </audio>
        </div>
      ) : null}

      <div className="ote-listening-feedback-legend">
        <span className="is-correct">Correct-answer evidence</span>
        <span className="is-distractor">Distractor evidence</span>
      </div>
      <div className="ote-listening-feedback-script">
        {(isPartOne ? item.script : activity.set.script).map((line, index) => (
          <p key={`${line.speaker}-${index}`}>
            <strong>{line.speaker}:</strong>{" "}
            {renderHighlightedText(line.text, evidence)}
          </p>
        ))}
      </div>

      <div className="ote-listening-evidence-grid">
        {isPartOne
          ? evidence.map((entry, index) => (
              <article className={entry.type === "correct" ? "is-correct" : "is-distractor"} key={`${entry.quote}-${index}`}>
                <span>{entry.type === "correct" ? "Correct evidence" : `Distractor · ${optionLetter(entry.option)}`}</span>
                <strong>{entry.quote}</strong>
                <p>{entry.note}</p>
              </article>
            ))
          : isPartThree
            ? evidence.map((entry, index) => (
                <article className={entry.type === "correct" ? "is-correct" : "is-distractor"} key={`${entry.quote}-${index}`}>
                  <span>{entry.type === "correct" ? `${entry.speaker} · Opinion evidence` : `${entry.speaker} · Contrast`}</span>
                  <strong>{entry.quote}</strong>
                  <p>{entry.note}</p>
                </article>
              ))
          : (item.review?.distractors || []).map((entry) => (
              <article className="is-distractor" key={entry.quote}>
                <span>Distractor</span>
                <strong>{entry.quote}</strong>
                <p>{entry.note}</p>
              </article>
            ))}
      </div>
    </section>
  );
}
