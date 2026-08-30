import React from "react";

/* eslint-disable react-refresh/only-export-components */

export function wordCount(value = "") {
  return (String(value).trim().match(/\b[\p{L}\p{N}’'-]+\b/gu) || []).length;
}

export function getEmptyWritingAnswers(part) {
  if (Number(part) === 3) return { responses: ["", "", ""] };
  if (Number(part) === 4) return { informal: "", formal: "" };
  return { answer: "" };
}

export function getWritingCounts(part, answers) {
  if (Number(part) === 3) return {
    responses: (answers?.responses || ["", "", ""]).map(wordCount),
  };
  if (Number(part) === 4) return {
    informal: wordCount(answers?.informal),
    formal: wordCount(answers?.formal),
  };
  return { answer: wordCount(answers?.answer) };
}

export function hasCompleteWritingResponse(part, answers) {
  if (Number(part) === 3) {
    return (answers?.responses || []).length === 3 && answers.responses.every((answer) => answer.trim());
  }
  if (Number(part) === 4) return Boolean(answers?.informal?.trim() && answers?.formal?.trim());
  return Boolean(answers?.answer?.trim());
}

function stableHash(value = "") {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getAnonymousLiveSubmissions(players = [], seed = "") {
  return players
    .filter((player) => player.writingSubmission)
    .map((player) => ({
      ...player,
      anonymousSortKey: stableHash(`${seed}:${player.id}`),
    }))
    .sort((a, b) => a.anonymousSortKey - b.anonymousSortKey || a.id.localeCompare(b.id))
    .map((player, index) => ({
      ...player,
      anonymousLabel: `Response ${index + 1}`,
    }));
}

export function AptisWritingLivePrompt({ part, task }) {
  if (!task) return null;

  if (Number(part) === 2) {
    return (
      <section className="aptis-writing-live-prompt">
        <p className="aptis-writing-live-kicker">Part 2 · Short text</p>
        <h2>{task.title}</h2>
        <p>{task.context}</p>
        <div className="aptis-writing-live-callout">{task.prompt}</div>
      </section>
    );
  }

  if (Number(part) === 3) {
    return (
      <section className="aptis-writing-live-prompt">
        <p className="aptis-writing-live-kicker">Part 3 · Three online responses</p>
        <h2>{task.title}</h2>
        <p>{task.context}</p>
        <div className="aptis-writing-live-chat-list">
          {task.chats.map((chat) => (
            <article key={chat.name}>
              <strong>{chat.name}</strong>
              <p>{chat.question}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="aptis-writing-live-prompt">
      <p className="aptis-writing-live-kicker">Part 4 · Informal and formal emails</p>
      <h2>{task.title}</h2>
      <h3>{task.sourceTitle}</h3>
      <pre className="aptis-writing-live-source">{task.source}</pre>
      <div className="aptis-writing-live-email-prompts">
        <article><strong>Informal email · 40–50 words</strong><p>{task.friendPrompt}</p></article>
        <article><strong>Formal email · 120–150 words</strong><p>{task.formalPrompt}</p></article>
      </div>
    </section>
  );
}

export function AptisWritingLiveEditor({ part, task, answers, onChange, disabled = false }) {
  const counts = getWritingCounts(part, answers);

  if (Number(part) === 2) {
    return (
      <div className="aptis-writing-live-editor">
        <WritingField
          count={counts.answer}
          disabled={disabled}
          label="Your response"
          maxLabel="Aim for 20–30 words"
          onChange={(value) => onChange({ ...answers, answer: value })}
          placeholder="Write your answer in full sentences…"
          value={answers.answer}
        />
      </div>
    );
  }

  if (Number(part) === 3) {
    return (
      <div className="aptis-writing-live-editor">
        {task.chats.map((chat, index) => (
          <WritingField
            count={counts.responses[index]}
            disabled={disabled}
            key={chat.name}
            label={`Reply to ${chat.name}`}
            maxLabel="Aim for 30–40 words"
            onChange={(value) => {
              const responses = [...answers.responses];
              responses[index] = value;
              onChange({ ...answers, responses });
            }}
            placeholder={`Write your reply to ${chat.name}…`}
            value={answers.responses[index]}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="aptis-writing-live-editor">
      <WritingField
        count={counts.informal}
        disabled={disabled}
        label="Informal email"
        maxLabel="Aim for 40–50 words"
        onChange={(value) => onChange({ ...answers, informal: value })}
        placeholder="Write the informal email…"
        value={answers.informal}
      />
      <WritingField
        count={counts.formal}
        disabled={disabled}
        label="Formal email"
        maxLabel="Aim for 120–150 words"
        onChange={(value) => onChange({ ...answers, formal: value })}
        placeholder="Write the formal email…"
        rows={10}
        value={answers.formal}
      />
    </div>
  );
}

function WritingField({ label, value, onChange, count, maxLabel, placeholder, disabled, rows = 6 }) {
  return (
    <label className="aptis-writing-live-field">
      <span><strong>{label}</strong><em>{count} words · {maxLabel}</em></span>
      <textarea
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        value={value}
      />
    </label>
  );
}

export function AptisWritingSubmittedResponse({ part, submission }) {
  if (!submission) return <p className="aptis-writing-live-empty">No response submitted.</p>;
  const answers = submission.answers || {};
  const counts = submission.counts || getWritingCounts(part, answers);

  if (Number(part) === 2) {
    return <ResponseBlock label={`Short text · ${counts.answer || 0} words`} text={answers.answer} />;
  }
  if (Number(part) === 3) {
    return (
      <div className="aptis-writing-live-submission-blocks">
        {(answers.responses || []).map((text, index) => (
          <ResponseBlock key={index} label={`Reply ${index + 1} · ${counts.responses?.[index] || 0} words`} text={text} />
        ))}
      </div>
    );
  }
  return (
    <div className="aptis-writing-live-submission-blocks">
      <ResponseBlock label={`Informal email · ${counts.informal || 0} words`} text={answers.informal} />
      <ResponseBlock label={`Formal email · ${counts.formal || 0} words`} text={answers.formal} />
    </div>
  );
}

export function AptisWritingLiveFeedback({ part, feedback }) {
  if (!feedback) return null;

  if (Number(part) === 4) {
    return (
      <section className="aptis-writing-live-ai-report">
        <header>
          <div><small>AI feedback</small><strong>{feedback.estimatedLevel?.label || "Aptis-style review"}</strong></div>
          <span>Teacher view</span>
        </header>
        {feedback.overall?.summary ? <p>{feedback.overall.summary}</p> : null}
        <div className="aptis-writing-live-ai-overview">
          <FeedbackPoint label="Register contrast" value={feedback.overall?.registerContrast?.feedback} />
          <FeedbackPoint label="Content" value={feedback.overall?.contentSpecificity?.feedback} />
        </div>
        <LiveEmailFeedback title="Informal email" data={feedback.informalEmail} />
        <LiveEmailFeedback title="Formal email" data={feedback.formalEmail} />
        <FeedbackList label="Main strengths" items={feedback.overall?.mainStrengths} />
        <FeedbackList label="Main priorities" items={feedback.overall?.mainPriorities} />
        <p className="aptis-writing-live-ai-note">AI-estimated Aptis-style feedback, not an official score.</p>
      </section>
    );
  }

  return (
    <section className="aptis-writing-live-ai-report">
      <header>
        <div>
          <small>AI feedback</small>
          <strong>{feedback.estimatedResponseLevel?.label || "Aptis-style review"}</strong>
        </div>
        <span>Teacher view</span>
      </header>
      {feedback.overall?.summary ? <p>{feedback.overall.summary}</p> : null}
      {feedback.overall?.wordCountComment ? <p className="aptis-writing-live-ai-note">{feedback.overall.wordCountComment}</p> : null}
      <div className="aptis-writing-live-ai-answers">
        {(feedback.answers || []).map((answer, index) => (
          <article key={answer.index ?? index}>
            <strong>{Number(part) === 3 ? `Reply ${index + 1}` : "Response"}</strong>
            <FeedbackPoint label="Task" value={answer.taskFulfilment} />
            <FeedbackPoint label="Grammar" value={answer.grammar} />
            <FeedbackPoint label="Vocabulary" value={answer.vocabulary} />
            <FeedbackPoint label="Cohesion" value={answer.cohesion} />
            <LanguageFixes items={answer.languageErrors} />
            {answer.improvedVersion ? <div className="aptis-writing-live-ai-improved"><strong>Improved version</strong><p>{answer.improvedVersion}</p></div> : null}
          </article>
        ))}
      </div>
      <FeedbackList label="Priority advice" items={feedback.priorityAdvice} />
      {feedback.teacherComment ? <blockquote>{feedback.teacherComment}</blockquote> : null}
      <p className="aptis-writing-live-ai-note">AI-estimated Aptis-style feedback, not an official score.</p>
    </section>
  );
}

function LiveEmailFeedback({ title, data }) {
  if (!data) return null;
  return (
    <article className="aptis-writing-live-ai-email">
      <h4>{title}</h4>
      <FeedbackPoint label="Task" value={data.taskFulfilment?.feedback} />
      <FeedbackPoint label="Register" value={data.register?.feedback} />
      <FeedbackPoint label="Grammar" value={data.grammar?.feedback} />
      <FeedbackPoint label="Vocabulary" value={data.vocabulary?.feedback} />
      <FeedbackPoint label="Cohesion" value={data.cohesion?.feedback} />
      <LanguageFixes items={data.languageErrors} />
      {data.improvedVersion ? <div className="aptis-writing-live-ai-improved"><strong>Improved version</strong><p>{data.improvedVersion}</p></div> : null}
    </article>
  );
}

function FeedbackPoint({ label, value }) {
  if (!value) return null;
  return <p><strong>{label}:</strong> {value}</p>;
}

function FeedbackList({ label, items }) {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <div className="aptis-writing-live-ai-list">
      <strong>{label}</strong>
      <ul>{items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
    </div>
  );
}

function LanguageFixes({ items }) {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <div className="aptis-writing-live-ai-fixes">
      <strong>Mistakes to fix</strong>
      <ul>
        {items.map((item, index) => (
          <li key={`${item.original}-${index}`}>
            <span>{item.original}</span> → <strong>{item.correction}</strong>
            {item.explanation ? <em>{item.explanation}</em> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResponseBlock({ label, text }) {
  return (
    <article className="aptis-writing-live-response-block">
      <strong>{label}</strong>
      <p>{text || "No response"}</p>
    </article>
  );
}
