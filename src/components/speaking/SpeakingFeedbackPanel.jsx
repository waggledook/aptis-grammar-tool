import React from "react";

export default function SpeakingFeedbackPanel({ feedbackResult, questions = [], title = "AI feedback" }) {
  const feedback = feedbackResult?.feedback;
  const transcripts = feedbackResult?.transcripts || [];
  if (!feedback) return null;

  const answers = Array.isArray(feedback.answers)
    ? feedback.answers
    : feedback.answer
      ? [feedback.answer]
      : [];

  return (
    <section className="speaking-feedback-panel" aria-label={title}>
      <StyleScope />
      <div className="speaking-feedback-head">
        <h4>{title}</h4>
        {feedback.estimatedLevel?.label ? (
          <span className="speaking-level-badge">{feedback.estimatedLevel.label}</span>
        ) : null}
      </div>

      {feedback.estimatedLevel ? (
        <p>
          <strong>Observed range:</strong> {feedback.estimatedLevel.label}
          {feedback.estimatedLevel.confidence ? ` (${feedback.estimatedLevel.confidence} confidence)` : ""}
        </p>
      ) : null}
      {feedback.overall?.summary ? <p>{feedback.overall.summary}</p> : null}
      <p className="speaking-feedback-muted">
        {feedback.estimatedLevel?.note ||
          feedback.overall?.transcriptCaveat ||
          "AI-estimated transcript-based feedback, not an official score."}
      </p>

      <FeedbackBullets title="Strengths" items={feedback.overall?.mainStrengths} />
      <FeedbackBullets title="Priorities" items={feedback.overall?.mainPriorities} />
      <FeedbackBullets title="Question coverage" items={feedback.overall?.questionCoverage} />
      {feedback.overall?.photoDescriptionAdvice ? (
        <p><strong>Photo focus:</strong> {feedback.overall.photoDescriptionAdvice}</p>
      ) : null}
      {feedback.overall?.developmentAdvice ? (
        <p><strong>Development:</strong> {feedback.overall.developmentAdvice}</p>
      ) : null}

      {answers.map((item, index) => {
        const transcript = transcripts[index]?.transcript || item.transcript || "";
        const questionText = Array.isArray(questions)
          ? (typeof questions[index] === "string" ? questions[index] : questions[index]?.question || questions[index]?.text)
          : "";
        return (
          <div className="speaking-answer-feedback" key={item.questionId || index}>
            <h4>{answers.length === 1 ? "Response" : `Q${index + 1}`}: {questionText || item.question}</h4>
            <p className="speaking-transcript">"{transcript || "No clear transcript."}"</p>
            <div className="speaking-feedback-grid">
              <Criterion title="Task" data={item.taskFulfilment} />
              <Criterion title="Development" data={item.answerDevelopment} />
              <Criterion title="Content" data={item.content} />
              <Criterion title="Grammar" data={item.grammar} />
              <Criterion title="Vocabulary" data={item.vocabulary} />
              <Criterion title="Cohesion" data={item.cohesion} />
              <Criterion title="Fluency" data={item.fluency} />
            </div>
            <LanguageFixes items={item.languageErrors} />
            <ExamplesList title="Grammar examples" items={item.grammar?.examples} type="grammar" />
            <ExamplesList title="Vocabulary examples" items={item.vocabulary?.examples} type="vocabulary" />
            {item.content?.missingIdeas?.length ? (
              <FeedbackBullets title="Ideas to add" items={item.content.missingIdeas} />
            ) : null}
            {item.improvedAnswer ? (
              <div className="speaking-improved-answer">
                <strong>Improved answer</strong>
                <p>{item.improvedAnswer}</p>
              </div>
            ) : null}
            {item.teacherNote ? <p><strong>Teacher note:</strong> {item.teacherNote}</p> : null}
          </div>
        );
      })}
    </section>
  );
}

function FeedbackBullets({ title, items }) {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <>
      <h4>{title}</h4>
      <ul className="speaking-feedback-list">
        {items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    </>
  );
}

function Criterion({ title, data }) {
  if (!data) return null;
  return (
    <div className="speaking-criterion">
      <strong>{title}</strong>
      {data.status ? <span className="speaking-status">{formatStatus(data.status)}</span> : null}
      <p>{data.feedback || data.comment}</p>
    </div>
  );
}

function LanguageFixes({ items }) {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <div className="speaking-language-fixes">
      <h4>Language to fix</h4>
      <ul>
        {items.map((item, index) => (
          <li key={`${item.category}-${item.original}-${index}`}>
            <small className={item.category}>{formatStatus(item.category)}</small>
            <p><span>{item.original}</span>{" -> "}<strong>{item.correction}</strong></p>
            {item.explanation ? <em>{item.explanation}</em> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExamplesList({ title, items, type }) {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <>
      <h4>{title}</h4>
      <ul className="speaking-feedback-list">
        {items.map((item, index) => (
          <li key={index}>
            <strong>{item.original}</strong>
            {" -> "}
            {type === "vocabulary" ? item.suggestion : item.correction}
            {item.explanation ? ` (${item.explanation})` : ""}
          </li>
        ))}
      </ul>
    </>
  );
}

function formatStatus(status = "") {
  return String(status).replace(/_/g, " ");
}

function StyleScope() {
  return (
    <style>{`
      .speaking-feedback-panel {
        margin-top:1rem;
        background:#0f1b31;
        border:1px solid #203258;
        border-radius:10px;
        padding:.85rem;
        color:#e6f0ff;
      }
      .speaking-feedback-panel h4 { margin:.75rem 0 .35rem; }
      .speaking-feedback-panel h4:first-child { margin-top:0; }
      .speaking-feedback-panel p { margin:.25rem 0; }
      .speaking-feedback-head { display:flex; align-items:center; justify-content:space-between; gap:.75rem; flex-wrap:wrap; }
      .speaking-level-badge { border:1px solid #60a5fa; color:#dbeafe; border-radius:999px; padding:.2rem .55rem; font-size:.85rem; font-weight:800; }
      .speaking-feedback-muted { color:#a9b7d1; }
      .speaking-feedback-list { margin:.4rem 0 0; padding-left:1.1rem; display:grid; gap:.35rem; }
      .speaking-answer-feedback { border-top:1px solid #203258; padding-top:.7rem; margin-top:.7rem; }
      .speaking-transcript { color:#dbeafe; font-style:italic; }
      .speaking-feedback-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:.5rem; margin-top:.65rem; }
      .speaking-criterion { background:#13213b; border:1px solid #203258; border-radius:8px; padding:.6rem; }
      .speaking-criterion strong { display:block; margin-bottom:.25rem; color:#f8fbff; }
      .speaking-status { color:#93c5fd; font-size:.86rem; }
      .speaking-improved-answer { background:#172a49; border-left:3px solid #60a5fa; border-radius:8px; padding:.65rem; margin-top:.55rem; }
      .speaking-language-fixes { margin:.75rem 0; background:#111f38; border:1px solid #315184; border-left:3px solid #f59e0b; border-radius:8px; padding:.75rem; }
      .speaking-language-fixes ul { display:grid; gap:.55rem; margin:0; padding:0; }
      .speaking-language-fixes li { list-style:none; background:#0f1b31; border:1px solid #27436f; border-radius:8px; padding:.65rem; }
      .speaking-language-fixes small { display:inline-block; margin-bottom:.25rem; padding:.12rem .45rem; border-radius:999px; font-size:.78rem; font-weight:800; text-transform:capitalize; }
      .speaking-language-fixes small.grammar { color:#fecaca; background:rgba(185,28,28,.18); border:1px solid rgba(248,113,113,.24); }
      .speaking-language-fixes small.vocabulary { color:#bbf7d0; background:rgba(4,120,87,.18); border:1px solid rgba(52,211,153,.24); }
      .speaking-language-fixes small.word_order,
      .speaking-language-fixes small.missing_word,
      .speaking-language-fixes small.transcript_unclear { color:#bfdbfe; background:rgba(29,78,216,.2); border:1px solid rgba(96,165,250,.25); }
      .speaking-language-fixes span { color:#fca5a5; }
      .speaking-language-fixes strong { color:#86efac; }
      .speaking-language-fixes em { display:block; color:#a9b7d1; }
      :root[data-theme="light"] .speaking-feedback-panel {
        background:#f8fbff !important;
        border-color:#c8d8ef !important;
        color:#172033 !important;
        box-shadow:0 8px 22px rgba(15,23,42,.08) !important;
      }
      :root[data-theme="light"] .speaking-feedback-panel :is(h4, strong) { color:#172033 !important; }
      :root[data-theme="light"] .speaking-feedback-panel :is(p, li) { color:#334155 !important; }
      :root[data-theme="light"] .speaking-feedback-muted,
      :root[data-theme="light"] .speaking-transcript { color:#64748b !important; }
      :root[data-theme="light"] .speaking-answer-feedback { border-top-color:#d5e2f3 !important; }
      :root[data-theme="light"] .speaking-criterion,
      :root[data-theme="light"] .speaking-language-fixes li { background:#ffffff !important; border-color:#d5e2f3 !important; }
      :root[data-theme="light"] .speaking-improved-answer { background:#eaf2ff !important; border-left-color:#2563eb !important; }
    `}</style>
  );
}
