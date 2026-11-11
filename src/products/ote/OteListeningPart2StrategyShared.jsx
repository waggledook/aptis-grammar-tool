import React from "react";
import { CheckCircle2, Headphones } from "lucide-react";
import { listeningStrategyFollowUps, LISTENING_STRATEGY_TITLE } from "./data/oteListeningPart2Strategy.js";
import { strategyAnswerGroups, strategyStageScore } from "./utils/listeningPart2Strategy.js";
import { isAdvancedPart2AnswerCorrect } from "./utils/listeningLive.js";

export function StrategyNotes({ extract, answers = {}, onChange, disabled = false, instance = "lesson" }) {
  return <section className="strategy-notes" aria-label={`Notes for extract ${extract.number}`}>
    <p className="strategy-eyebrow">Extract {extract.number} · {extract.gaps.length === 1 ? "One gap" : "Two gaps"}</p>
    <h2>{extract.title}</h2>
    <p className="strategy-rubric">Complete each gap with a word or two-word phrase from the audio. Check your spelling.</p>
    {extract.gaps.map((gap) => <p className="strategy-note" key={gap.id}>
      <span>{gap.before} </span>
      {onChange ? <label className="strategy-answer"><span className="sr-only">Gap {gap.number}</span><span aria-hidden="true">({gap.number})</span><input id={`${instance}-${gap.id}`} aria-label={`Gap ${gap.number}`} autoComplete="off" autoCorrect="off" spellCheck={false} maxLength={100} value={answers[gap.id] || ""} disabled={disabled} onChange={(event) => onChange(gap.id, event.target.value)} /></label> : <span className="strategy-blank">({gap.number}) {answers[gap.id] || "________________"}</span>}
      <span>{/^[.,;:]/.test(gap.after) ? "" : " "}{gap.after}</span>
    </p>)}
  </section>;
}

export function StrategyScript({ extract, highlight = false }) {
  const phrases = highlight ? extract.gaps.flatMap((gap) => gap.evidence).sort((a, b) => b.length - a.length) : [];
  const parts = [];
  let cursor = 0;
  const matches = phrases.flatMap((quote) => {
    const start = extract.script.indexOf(quote);
    return start >= 0 ? [{ start, end: start + quote.length }] : [];
  }).sort((a, b) => a.start - b.start);
  for (const match of matches) {
    if (match.start < cursor) continue;
    parts.push(extract.script.slice(cursor, match.start), <mark key={match.start}>{extract.script.slice(match.start, match.end)}</mark>);
    cursor = match.end;
  }
  parts.push(extract.script.slice(cursor));
  return <section className="strategy-script"><h3>{highlight ? "Recording and evidence" : "Unmarked script"}</h3><p>{parts}</p></section>;
}

export function StrategyFeedback({ extract, player }) {
  return <div className="strategy-feedback">
    {extract.gaps.map((gap) => <section className="strategy-feedback-gap" key={gap.id}>
      <p className="strategy-eyebrow">Gap {gap.number}</p><h3><CheckCircle2 size={20} aria-hidden="true" /> {gap.answer}</h3>
      <p>{gap.before} <strong>{gap.answer}</strong>{/^[.,;:]/.test(gap.after) ? "" : " "}{gap.after}</p>
      {player ? <div className="strategy-answer-journey">{["first", "second", "script"].map((stage, index) => {
        const response = player.strategyResponses?.[extract.id]?.[stage];
        const answer = response?.answers?.[gap.id];
        return <div key={stage}><span>{["First listen", "Second listen", "With script"][index]}</span><strong className={response ? isAdvancedPart2AnswerCorrect(gap, answer) ? "strategy-correct" : "strategy-incorrect" : ""}>{response ? answer || "Left blank" : "Not submitted"}</strong></div>;
      })}</div> : null}
      <p>{gap.explanation}</p><p><strong>Competing information: </strong>{gap.competing}</p>
      {gap.precision ? <p className="strategy-callout">{gap.precision}</p> : null}
    </section>)}
    <StrategyScript extract={extract} highlight />
    <p className="strategy-discussion"><strong>Discuss: </strong>{extract.discussion}</p>
    <small>These are classroom keys. They are not an official Oxford marking scheme.</small>
  </div>;
}

export function StrategyAnonymousResponses({ extract, players, stage }) {
  const responses = players.map((player) => player.strategyResponses?.[extract.id]?.[stage]).filter(Boolean);
  return <section className="strategy-class-responses"><h3>Class responses · {stage === "first" ? "first listen" : "second listen"}</h3><p>Discuss the evidence for these responses. Names and correctness are hidden in this comparison.</p><p className="strategy-small">{responses.filter((response) => response.confidence === "sure").length} confident · {responses.filter((response) => response.confidence !== "sure").length} uncertain</p>
    {strategyAnswerGroups(extract, players, stage).map(({ gap, groups, submitted, missing }) => <div key={gap.id}><h4>Gap {gap.number} · {submitted} submitted{missing ? ` · ${missing} not submitted` : ""}</h4><div className="strategy-response-chips">{groups.map(({ answer, count }) => <span key={answer || "blank"}>{answer || "Left blank"}<b>{count}</b></span>)}{!groups.length ? <span>No responses yet</span> : null}</div></div>)}
  </section>;
}

export function StrategyScores({ extracts, players }) {
  return <div className="strategy-score-table"><table><caption>Listening and transcript support are reported separately. Only submitted stages contribute to each total.</caption><thead><tr><th scope="col">Student</th><th scope="col">First listen</th><th scope="col">Second listen</th><th scope="col">With script</th></tr></thead><tbody>{players.map((player, index) => <tr key={player.id || index}><th scope="row">{player.name || "Your responses"}</th>{["first", "second", "script"].map((stage) => { const result = strategyStageScore(extracts, player, stage); return <td key={stage}>{result.total ? `${result.correct}/${result.total}` : "—"}</td>; })}</tr>)}</tbody></table></div>;
}

export function StrategyNextStep({ partPath }) {
  return <section className="strategy-next-step"><Headphones size={25} aria-hidden="true" /><div><h2>Now try a full task</h2><p>Use an existing Part 2 task in exam conditions: 30 seconds to preview, two complete plays and 15 seconds to check. Apply the same routine without discussion or a script.</p><a className="strategy-link" href={partPath}>Choose a full Part 2 task →</a></div></section>;
}

export function StrategyReflection({ worksheet = false }) {
  return <section className="strategy-reflection"><h2>Choose one useful next step</h2>{worksheet ? <div className="strategy-reflection-lines">{["I needed information about", "I chose", "My evidence was", "Next time I will"].map((label) => <p key={label}>{label}: __________________________________________________</p>)}</div> : <p>I needed information about ____. I chose ____ because ____. The evidence supported ____. Next time I will ____.</p>}<details><summary>Follow-up ideas for different difficulties</summary><dl>{listeningStrategyFollowUps.map((item) => <div key={item.difficulty}><dt>{item.difficulty}</dt><dd>{item.action}</dd></div>)}</dl></details></section>;
}

export function StrategyStudentSheet({ extracts, onPrint }) {
  return <main className="strategy-page strategy-print-sheet"><div className="strategy-print-controls"><button type="button" onClick={onPrint}>Print student sheet</button><p>Use your browser's print dialog to print or save a PDF.</p></div><p className="strategy-eyebrow">OTE Advanced Listening Part 2 · Strategy practice</p><h1>{LISTENING_STRATEGY_TITLE}</h1><p>Read each complete note. Predict the information you need, then listen for the speaker's wording. Every answer is a noun phrase of one or two words. Try to answer on the first listen and use the second listen to check uncertainty.</p>{extracts.map((extract) => <StrategyNotes key={extract.id} extract={extract} />)}<StrategyReflection worksheet /></main>;
}
