import React from "react";
import { Check, Clock3 } from "lucide-react";
import useLiveRoundTimer from "../components/live/useLiveRoundTimer.js";
import { FIRST_PASS_PHASE_LABELS, firstPassResponses } from "./readingPart4FirstPass.js";

export function FirstPassHeader({ task, state, playerName }) {
  const inRound = ["main_idea", "heading_choice", "paragraph_review"].includes(state.phase);
  return <header className="sfp-header"><div><p className="sfp-kicker">Aptis Reading Part 4 · Main idea first</p><h1>{task.title}</h1></div><div className="sfp-phase"><strong>{FIRST_PASS_PHASE_LABELS[state.phase]}</strong><span>{inRound ? `Paragraph ${state.paragraphIndex + 1} of 7` : playerName || "Teacher-paced classroom lesson"}</span></div></header>;
}

export function FirstPassTimer({ state }) {
  const active = ["main_idea", "heading_choice"].includes(state.phase);
  const seconds = state.phase === "main_idea" ? state.mainIdeaSeconds || 75 : state.headingSeconds || 25;
  const remaining = useLiveRoundTimer(state.phaseStartedAt ? state.phaseStartedAt + seconds * 1000 : null, active);
  if (!active) return null;
  return <div className="sfp-soft-timer"><Clock3 size={19} /><div><strong>{remaining == null ? "—" : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`}</strong><span>{remaining === 0 ? "Suggested time used · take more time if needed" : "Suggested time · your teacher controls the pace"}</span></div></div>;
}

export function FirstPassParagraph({ paragraph, showEvidence = false }) {
  const evidence = showEvidence ? paragraph.evidenceParts?.[0] : "";
  const index = evidence ? paragraph.text.indexOf(evidence) : -1;
  return <article className="sfp-paragraph"><span className="sfp-kicker">Paragraph {paragraph.id}</span><p>{index < 0 ? paragraph.text : <>{paragraph.text.slice(0, index)}<mark>{evidence}</mark>{paragraph.text.slice(index + evidence.length)}</>}</p></article>;
}

export function FirstPassExample({ task, showModel = true }) {
  const example = task.firstPass.example;
  return <section className="sfp-example"><span className="sfp-kicker">0 · Worked example</span><h2>{example.heading}</h2><p>{example.text}</p>{showModel && <div className="sfp-callout"><strong>One way to express the main idea</strong><p>{example.modelMainIdea}</p><small>Identify the overall message. You do not need perfect English.</small></div>}</section>;
}

export function FirstPassOwnIdea({ text, submitted = true }) {
  return <aside className="sfp-own-idea"><strong>{submitted ? "Your main idea" : "Your draft · not submitted"}</strong><p>{text || "No main idea was submitted for this paragraph."}</p></aside>;
}

export function FirstPassHeadingOptions({ paragraph, selectedIndex, onSelect, locked = false, reveal = false, stats, playerCount }) {
  return <section className="sfp-heading-options" aria-label="Four classroom headings"><h2>{reveal ? "Which heading covers the whole paragraph?" : "Choose the best heading"}</h2><div>{paragraph.roundOptions.map((option, index) => {
    const correct = index === paragraph.correctOptionIndex;
    const className = `${selectedIndex === index ? "is-selected" : ""} ${reveal && correct ? "is-correct" : ""} ${reveal && selectedIndex === index && !correct ? "is-wrong" : ""}`;
    const content = <><b>{index + 1}</b><span>{option}{reveal && correct && <small>Correct heading</small>}{selectedIndex === index && <small>Your choice</small>}</span>{reveal && correct && <Check size={19} />}{stats && <em>{stats.optionCounts[index]}/{playerCount} · {playerCount ? Math.round(stats.optionCounts[index] / playerCount * 100) : 0}%</em>}</>;
    return onSelect ? <button type="button" aria-pressed={selectedIndex === index} disabled={locked} className={className} key={index} onClick={() => onSelect(index)}>{content}</button> : <div className={className} key={index}>{content}</div>;
  })}</div>{stats && <p className="sfp-muted">{stats.unanswered} unanswered · percentages use all {playerCount} students.</p>}</section>;
}

export function FirstPassAnonymousIdeas({ game, paragraphId }) {
  const selected = (game.state.sharedMainIdeaUids || []).slice(0, 3);
  const texts = selected.map((uid) => firstPassResponses(game.players?.[uid], paragraphId).mainIdea?.text).filter(Boolean);
  return <section className="sfp-anonymous"><h2>Main ideas from the class</h2><p className="sfp-muted">Discuss the meaning, not spelling or grammar. These examples have no names.</p><div>{texts.map((text, index) => <blockquote key={index}><span>Response {index + 1}</span><p>{text}</p></blockquote>)}</div>{!texts.length && <p className="sfp-muted">No examples have been shared yet.</p>}</section>;
}

export function FirstPassRoundReasoning({ task, paragraph }) {
  return <section className="sfp-reasoning"><h2>Discuss the main idea</h2><div className="sfp-callout"><strong>A possible main idea</strong><p>{paragraph.modelMainIdea}</p><small>This is a model for discussion, not an exact-match answer.</small></div><p>{paragraph.roundExplanation}</p><blockquote>{paragraph.evidenceParts[0]}</blockquote><strong>{task.firstPass.discussionPrompt}</strong></section>;
}

export function FirstPassReviewNote({ task }) {
  return <p className="sfp-review-note">{task.firstPass.reviewNote}</p>;
}
