import React from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import { OPTION_LETTERS, VERDICT_OPTIONS, getAssignedOptionForQuestion, getOptionIndex, getOptionLetter } from "./data/oteAdvancedReadingPart4OptionJury.js";
import "./styles/option-jury.css";

export function PassagePanel({ task, defaultOpen = false }) {
  return (
    <details className="option-jury-passage" open={defaultOpen}>
      <summary><BookOpen size={19} aria-hidden="true" /> Read the full passage <ChevronDown size={18} aria-hidden="true" /></summary>
      <article>
        <h2>{task.title}</h2>
        {task.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        <a href="#option-jury-question">Return to the question</a>
      </article>
    </details>
  );
}

export function EvidencePanel({ task, question }) {
  const paragraph = task.paragraphs[question.evidenceParagraphIndex];
  return (
    <section className="option-jury-evidence-window" aria-label="Evidence paragraph">
      <header><span>Evidence window</span>{question.wholeTextQuestion ? <strong>Conclusion · Whole-text question</strong> : <strong>Paragraph {question.evidenceParagraphIndex + 1}</strong>}</header>
      <p>{paragraph}</p>
      {question.wholeTextQuestion ? <aside>Use the conclusion together with your skim of the complete text.</aside> : null}
    </section>
  );
}

export function TimerDisplay({ remainingSeconds, label }) {
  const safeSeconds = Math.max(0, remainingSeconds ?? 0);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = String(safeSeconds % 60).padStart(2, "0");
  return <div className={`option-jury-timer ${safeSeconds === 0 ? "is-finished" : safeSeconds <= 15 ? "is-low" : ""}`}><span>{label}</span><strong>{minutes}:{seconds}</strong></div>;
}

export function CorrectAnswer({ question, label = "Correct answer" }) {
  const letter = getOptionLetter(question.answer);
  return <div className="option-jury-correct-answer"><span>{label}</span><strong>{letter}</strong><p>{question.options[question.answer]}</p></div>;
}

export function PhasePill({ phase, questionIndex, totalQuestions = 5 }) {
  const label = phase.replaceAll("_", " ");
  const showQuestion = ["investigation", "comparison", "final_vote", "answer_reveal"].includes(phase);
  return <div className="option-jury-phase"><span>{label}</span>{showQuestion ? <strong>Question {questionIndex + 1} of {totalQuestions}</strong> : null}</div>;
}

export function AssignmentSummary({ players }) {
  return (
    <div className="option-jury-assignment-summary" aria-label="Option assignments">
      {OPTION_LETTERS.map((letter) => {
        const count = players.filter((player) => player.optionAssignment === letter).length;
        return <span className={count ? "" : "is-empty"} key={letter}><strong>{letter}</strong>{count} {count === 1 ? "player" : "players"}</span>;
      })}
    </div>
  );
}

function getEvaluationGroups(game, questionId, players) {
  const groups = Object.fromEntries(OPTION_LETTERS.map((letter) => [letter, []]));
  players.forEach((player) => {
    const evaluation = game?.investigations?.[player.id]?.[questionId];
    if (evaluation?.submitted && evaluation.assignedOption) groups[evaluation.assignedOption].push({ ...evaluation, player });
  });
  return groups;
}

export function ComparisonOptions({ game, question, questionIndex, players, reveal = false }) {
  const groups = getEvaluationGroups(game, question.id, players);
  return (
    <div className="option-jury-comparison-grid">
      {OPTION_LETTERS.map((letter) => {
        const optionIndex = getOptionIndex(letter);
        const evaluations = groups[letter];
        const assignedCount = players.filter((player) => getAssignedOptionForQuestion(player.optionAssignment, questionIndex) === letter).length;
        const isCorrect = optionIndex === question.answer;
        return (
          <section className={`option-jury-option-card ${reveal ? (isCorrect ? "is-correct" : "is-incorrect") : ""}`} key={letter}>
            <header><span>{letter}</span><p>{question.options[optionIndex]}</p>{reveal ? <strong>{question.optionLabels[optionIndex]}</strong> : null}</header>
            {reveal ? <p className="option-jury-feedback">{question.optionFeedback[optionIndex]}</p> : evaluations.length ? (
              <>
                <div className="option-jury-verdict-counts">
                  {VERDICT_OPTIONS.map((verdict) => <span key={verdict.id}><strong>{evaluations.filter((entry) => entry.verdict === verdict.id).length}</strong>{verdict.label}</span>)}
                </div>
                <div className="option-jury-reasons">
                  {evaluations.filter((entry) => entry.reason).map((entry) => <blockquote key={entry.player.id}><p>{entry.reason}</p><cite>{firstName(entry.player.name)}</cite></blockquote>)}
                  {!evaluations.some((entry) => entry.reason) ? <p className="muted">No written reasons submitted.</p> : null}
                </div>
              </>
            ) : <p className="option-jury-empty">{assignedCount ? "No evaluations were submitted for this option." : "No student was assigned this option."}</p>}
          </section>
        );
      })}
    </div>
  );
}

export function VoteDistribution({ votes, correctLetter = "" }) {
  const values = Object.values(votes || {});
  return <div className="option-jury-vote-bars">{OPTION_LETTERS.map((letter) => {
    const count = values.filter((vote) => vote.option === letter).length;
    const percent = values.length ? Math.round((count / values.length) * 100) : 0;
    return <div key={letter}><strong>{letter}{letter === correctLetter ? " ✓" : ""}</strong><span><i style={{ width: `${percent}%` }} /></span><b>{count} · {percent}%</b></div>;
  })}</div>;
}

function firstName(name) {
  return String(name || "Student").trim().split(/\s+/)[0];
}
