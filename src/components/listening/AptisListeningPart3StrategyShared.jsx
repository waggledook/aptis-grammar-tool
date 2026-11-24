import React, { useState } from "react";
import { Headphones } from "lucide-react";
import { getSitePath } from "../../siteConfig.js";
import { APTIS_OPINION_STRATEGY_TITLE } from "./aptisListeningPart3StrategyData.js";
import { OPINION_OPTIONS, opinionLabel } from "./aptisListeningPart3LiveUtils.js";
import { opinionStrategyAnswerGroups, opinionStrategyEvidenceRanges, opinionStrategyStageScore } from "./aptisListeningPart3StrategyUtils.js";

export function StrategyOpinions({ extract, answers, onChange, disabled = false }) {
  return <section className="strategy-notes" aria-label={`Opinions for extract ${extract.number}`}>
    <p className="strategy-eyebrow">Extract {extract.number} · {extract.statements.length === 1 ? "One opinion" : "Two opinions"}</p>
    <h2>{extract.title}</h2>
    <p className="strategy-rubric">Who expresses each opinion: the man, the woman or both?</p>
    <div className="opinion-strategy-statements">{extract.statements.map((statement) => <fieldset key={statement.key}>
      <legend><strong>{statement.number}.</strong> {statement.text}</legend>
      {onChange ? <select aria-label={`Who expresses opinion ${statement.number}?`} value={answers?.[statement.key] || ""} disabled={disabled} onChange={(event) => onChange(statement.key, event.target.value)}>
        <option value="">Choose a speaker</option>{OPINION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select> : answers ? <p>Your answer: <strong>{answers[statement.key] ? opinionLabel(answers[statement.key]) : "Left blank"}</strong></p> : <p className="opinion-strategy-options">□ Man <span>□ Woman</span> <span>□ Both</span></p>}
    </fieldset>)}</div>
  </section>;
}

const EVIDENCE_LABELS = { support: "Matches the opinion", context: "Context or contrast" };
const STANCE_LABELS = { supports: "Expresses this opinion", opposes: "Does not share this opinion", unclear: "No clear position on this point" };

function highlightText(text, matches) {
  const result = [];
  let cursor = 0;
  for (const { start, end, kind } of matches) {
    if (start < cursor) continue;
    result.push(text.slice(cursor, start), <mark data-evidence-kind={kind} title={EVIDENCE_LABELS[kind]} key={`${start}-${end}`}>{text.slice(start, end)}</mark>);
    cursor = end;
  }
  result.push(text.slice(cursor));
  return result;
}

export function StrategyScript({ extract, highlight = false, statementKey = extract.statements[0]?.key }) {
  const statement = extract.statements.find((item) => item.key === statementKey);
  return <section className="strategy-script">
    <h3>{highlight ? `Transcript · evidence for opinion ${statement?.number || ""}` : "Unmarked transcript"}</h3>
    {highlight ? <div className="opinion-strategy-evidence-legend" aria-label="Highlight key"><mark data-evidence-kind="support">Matches the opinion</mark><mark data-evidence-kind="context">Context or contrast</mark></div> : null}
    {extract.script.map((line, index) => <p key={index}><strong>{line.speaker}:</strong> {highlightText(line.text, highlight ? opinionStrategyEvidenceRanges(extract, statementKey, index) : [])}</p>)}
  </section>;
}

export function StrategyFeedback({ extract, player }) {
  const [selectedKeys, setSelectedKeys] = useState({});
  const statement = extract.statements.find((item) => item.key === selectedKeys[extract.id]) || extract.statements[0];
  if (!statement) return null;
  return <div className="strategy-feedback">
    {extract.statements.length > 1 ? <div className="opinion-strategy-evidence-selector" role="group" aria-label="Choose an opinion to review">{extract.statements.map((item) => <button key={item.key} type="button" aria-pressed={statement.key === item.key} className={statement.key === item.key ? "is-selected" : ""} onClick={() => setSelectedKeys((current) => ({ ...current, [extract.id]: item.key }))}>Opinion {item.number}</button>)}</div> : null}
    <section className="strategy-feedback-gap" key={statement.key}>
      <p className="strategy-eyebrow">Opinion {statement.number}</p><h3>Correct answer: {opinionLabel(statement.answer)}</h3><p>{statement.text}</p>
      {player ? <div className="strategy-answer-journey">{["first", "second", "script"].map((stage, index) => {
        const response = player.strategyResponses?.[extract.id]?.[stage];
        const value = response?.answers?.[statement.key];
        return <div key={stage}><span>{["First listen", "Second listen", "With transcript"][index]}</span><strong className={response ? value === statement.answer ? "strategy-correct" : "strategy-incorrect" : ""}>{response ? value ? opinionLabel(value) : "Left blank" : "Not submitted"}</strong></div>;
      })}</div> : null}
      <div className="opinion-strategy-answer-notes">{statement.speakerNotes.map((speaker) => <section key={speaker.speaker} aria-label={`${speaker.speaker}: ${STANCE_LABELS[speaker.stance]}`}>
        <h4>{speaker.speaker} <span>{STANCE_LABELS[speaker.stance]}</span></h4>
        <ul>{speaker.notes.map((note) => <li key={note}>{note}</li>)}</ul>
      </section>)}</div>
      <p className="opinion-strategy-key-point"><strong>Key distinction:</strong> {statement.keyPoint}</p>
    </section>
    <StrategyScript extract={extract} statementKey={statement.key} highlight />
    <p className="strategy-discussion"><strong>Discuss:</strong> {statement.discussion || extract.discussion}</p>
  </div>;
}

export function StrategyAnonymousResponses({ extract, players, stage }) {
  return <section><h3>Class responses · answer still hidden</h3><p className="strategy-small">{players.filter((player) => player.strategyResponses?.[extract.id]?.[stage]?.confidence === "sure").length} confident · {players.filter((player) => player.strategyResponses?.[extract.id]?.[stage]?.confidence === "unsure").length} uncertain</p>
    {opinionStrategyAnswerGroups(extract, players, stage).map(({ statement, groups, submitted, missing }) => <div key={statement.key}><h4>Opinion {statement.number} · {submitted} submitted{missing ? ` · ${missing} not submitted` : ""}</h4><div className="strategy-response-chips">{groups.map(({ answer, count }) => <span key={answer || "blank"}>{answer ? opinionLabel(answer) : "Left blank"}<b>{count}</b></span>)}{!groups.length ? <span>No responses yet</span> : null}</div></div>)}
  </section>;
}

export function StrategyScores({ extracts, players }) {
  return <div className="strategy-score-table"><table><caption>Listening and transcript support are reported separately. Only submitted stages contribute to each total.</caption><thead><tr><th scope="col">Student</th><th scope="col">First listen</th><th scope="col">Second listen</th><th scope="col">With transcript</th></tr></thead><tbody>{players.map((player, index) => <tr key={player.id || index}><th scope="row">{player.name || "Your responses"}</th>{["first", "second", "script"].map((stage) => { const result = opinionStrategyStageScore(extracts, player, stage); return <td key={stage}>{result.total ? `${result.correct}/${result.total}` : "Not submitted"}</td>; })}</tr>)}</tbody></table></div>;
}

export function StrategyReflection({ worksheet = false }) {
  return <section className="strategy-reflection"><h2>What helped you identify the opinion?</h2>{worksheet ? <div className="strategy-reflection-lines">{["I first chose", "The evidence showed", "The other speaker", "Next time I will check"].map((label) => <p key={label}>{label}: __________________________________________________</p>)}</div> : <p>I chose ____ because ____. The other speaker was agreeing with ____, disagreeing with ____ or leaving ____ unclear.</p>}<details><summary>Choose a useful next step</summary><dl>
    <dt>I chose Both after a positive response.</dt><dd>Identify the exact claim that the response supports. Does it cover the full statement?</dd>
    <dt>I understood the story but missed the opinion.</dt><dd>Connect the experience, decision or consequence with the judgement in the statement.</dd>
    <dt>I lost track of who thought what.</dt><dd>Note one short phrase per speaker, then check whether the view changes later.</dd>
    <dt>I heard another person's view.</dt><dd>Find who owns that view and whether the current speaker endorses it.</dd>
  </dl></details></section>;
}

export function StrategyNextStep() {
  return <section className="strategy-next-step"><Headphones size={25} aria-hidden="true" /><div><h2>Apply it to a full Part 3 task</h2><p>Read all four opinions, listen to both speakers and use the second listen to check uncertain evidence.</p><a className="strategy-link" href={getSitePath("/listening/part3")}>Choose a full Part 3 task</a></div></section>;
}

export function StrategyStudentSheet({ extracts, onPrint }) {
  return <main className="strategy-page opinion-strategy-page strategy-print-sheet"><div className="strategy-print-controls"><button type="button" onClick={onPrint}>Print student sheet</button><p>Print or save a PDF from your browser.</p></div><p className="strategy-eyebrow">Aptis Listening Part 3 · Opinion training</p><h1>{APTIS_OPINION_STRATEGY_TITLE}</h1><p>Read the exact opinion. Choose Man, Woman or Both after listening to both speakers. Use a second listen to check your evidence.</p>{extracts.map((extract) => <StrategyOpinions key={extract.id} extract={extract} />)}<StrategyReflection worksheet /></main>;
}
