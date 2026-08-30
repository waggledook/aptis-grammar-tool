import React from "react";
import { CheckCircle2, Mail, Users } from "lucide-react";
import {
  REGISTER_SURGERY_EMAILS,
  REGISTER_SURGERY_SCENARIO,
} from "./data/aptisWritingRegisterSurgery.js";

/* eslint-disable react-refresh/only-export-components */

function stableHash(value = "") {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getRegisterSurgeryAnonymousPlayers(players = [], seed = "") {
  return players
    .map((player) => ({ ...player, anonymousSortKey: stableHash(`${seed}:${player.id}`) }))
    .sort((a, b) => a.anonymousSortKey - b.anonymousSortKey || a.id.localeCompare(b.id))
    .map((player, index) => ({ ...player, anonymousLabel: `Response ${index + 1}` }));
}

export function getRegisterSurgerySelectablePhrases(kind) {
  return (REGISTER_SURGERY_EMAILS[kind]?.blocks || [])
    .flatMap((block) => block.chunks || [])
    .filter((chunk) => chunk.selectable);
}

export function getRegisterSurgerySpotDistribution(players = [], kind) {
  const phrases = getRegisterSurgerySelectablePhrases(kind);
  return Object.fromEntries(phrases.map((phrase) => [
    phrase.id,
    players.filter((player) => player.registerSurgery?.spot?.[kind]?.selectedIds?.includes(phrase.id)).length,
  ]));
}

export function getRegisterSurgeryRewriteExportText(players = [], gameId = "") {
  const anonymousPlayers = getRegisterSurgeryAnonymousPlayers(players, gameId);
  const sections = [
    "Aptis Writing Part 4 · Register Surgery",
    "Anonymous live classroom rewrites",
    "",
  ];

  ["informal", "formal"].forEach((kind) => {
    const email = REGISTER_SURGERY_EMAILS[kind];
    sections.push(`${kind === "informal" ? "INFORMAL" : "FORMAL"} EMAIL REWRITES`, "");
    email.rewrites.forEach((item) => {
      sections.push(`Original: ${item.original}`);
      const answers = anonymousPlayers
        .map((player) => ({ label: player.anonymousLabel, text: player.registerSurgery?.rewrites?.[kind]?.answers?.[item.id] }))
        .filter((entry) => entry.text);
      if (answers.length) answers.forEach((entry) => sections.push(`${entry.label}: ${entry.text}`));
      else sections.push("No responses submitted.");
      sections.push(`Teacher examples: ${item.suggestions.join(" / ")}`, "");
    });
  });

  return sections.join("\n");
}

export function RegisterSurgeryLiveSource({ compact = false }) {
  return (
    <details className={`register-live-source${compact ? " is-compact" : ""}`} open={!compact}>
      <summary><Mail size={18} /><span><strong>Original task</strong>{REGISTER_SURGERY_SCENARIO.title}</span></summary>
      <div>
        <h2>{REGISTER_SURGERY_SCENARIO.sourceTitle}</h2>
        {REGISTER_SURGERY_SCENARIO.source.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </div>
    </details>
  );
}

export function RegisterSurgeryLiveEmail({
  kind,
  selectedIds = [],
  onToggle,
  disabled = false,
  reveal = false,
  distribution = {},
  responseCount = 0,
}) {
  const email = REGISTER_SURGERY_EMAILS[kind];
  const selected = new Set(selectedIds);

  return (
    <section className="register-live-email-card">
      <header>
        <div><p>{kind === "informal" ? "Email to a friend" : "Email to the club committee"}</p><h2>{email.heading}</h2></div>
        <span>{email.targetCount} expressions</span>
      </header>
      <p className="register-live-email-instruction">{email.instruction}</p>
      <div className="register-live-email-text">
        {email.blocks.map((block) => (
          <p key={block.id}>
            {block.chunks.map((chunk, index) => {
              if (!chunk.selectable) return <React.Fragment key={`${block.id}-${index}`}>{chunk.text}</React.Fragment>;
              const isSelected = selected.has(chunk.id);
              const count = distribution[chunk.id] || 0;
              const className = [
                "register-live-phrase",
                isSelected ? "is-selected" : "",
                reveal && chunk.target ? "is-target" : "",
                reveal && !chunk.target ? "is-appropriate" : "",
              ].filter(Boolean).join(" ");
              return (
                <button
                  aria-pressed={isSelected}
                  className={className}
                  disabled={disabled}
                  key={chunk.id}
                  onClick={() => onToggle?.(chunk.id)}
                  type="button"
                >
                  <span>{chunk.text}</span>
                  {reveal ? <em>{count}/{responseCount}</em> : null}
                </button>
              );
            })}
          </p>
        ))}
      </div>
      {reveal ? (
        <div className="register-live-review-key">
          <span><i className="is-target" /> Register problem</span>
          <span><i className="is-appropriate" /> Appropriate language</span>
          <span><Users size={15} /> Number of student selections</span>
        </div>
      ) : null}
    </section>
  );
}

export function RegisterSurgeryLiveRewriteForm({ kind, values, onChange, disabled = false }) {
  const email = REGISTER_SURGERY_EMAILS[kind];
  return (
    <section className="register-live-rewrite-form">
      <header><p>{kind === "informal" ? "Informal email" : "Formal email"}</p><h2>Rewrite the unsuitable expressions</h2></header>
      <p>Keep the meaning, but make each expression suitable for the reader.</p>
      <div>
        {email.rewrites.map((item, index) => (
          <label key={item.id}>
            <span><i>{index + 1}</i><strong>{item.original}</strong></span>
            <textarea
              disabled={disabled}
              onChange={(event) => onChange(item.id, event.target.value)}
              placeholder="Write a more suitable version…"
              rows={3}
              value={values[item.id] || ""}
            />
          </label>
        ))}
      </div>
    </section>
  );
}

export function RegisterSurgeryLiveRewriteReview({ kind, players, gameId }) {
  const email = REGISTER_SURGERY_EMAILS[kind];
  const anonymousPlayers = getRegisterSurgeryAnonymousPlayers(players, gameId);

  return (
    <section className="register-live-rewrite-review">
      <header>
        <div><p>{kind === "informal" ? "Informal email" : "Formal email"} · Class review</p><h2>Anonymous rewrite suggestions</h2></div>
        <span>{players.filter((player) => player.registerSurgery?.rewrites?.[kind]).length} submissions</span>
      </header>
      <div className="register-live-rewrite-groups">
        {email.rewrites.map((item, itemIndex) => {
          const answers = anonymousPlayers
            .map((player) => ({
              label: player.anonymousLabel,
              text: player.registerSurgery?.rewrites?.[kind]?.answers?.[item.id],
            }))
            .filter((entry) => entry.text);
          return (
            <article key={item.id}>
              <header><i>{itemIndex + 1}</i><div><small>Original expression</small><strong>{item.original}</strong></div></header>
              <div className="register-live-answer-grid">
                {answers.map((answer) => (
                  <blockquote key={answer.label}><span>{answer.label}</span><p>{answer.text}</p></blockquote>
                ))}
                {!answers.length ? <p className="register-live-empty">No rewrites were submitted for this expression.</p> : null}
              </div>
              <aside>
                <CheckCircle2 size={19} />
                <div><strong>Teacher examples</strong><p>{item.suggestions.join(" / ")}</p><span>{item.explanation}</span></div>
              </aside>
            </article>
          );
        })}
      </div>
    </section>
  );
}
