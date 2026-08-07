import React from "react";
import { Clock3, Play } from "lucide-react";
import { formatReadingTime } from "./readingTaskTiming.js";

export function ReadingTaskStart({
  partLabel,
  taskTitle,
  itemCountLabel,
  recommendedSeconds,
  onStart,
}) {
  return (
    <section className="reading-task-ready">
      <div className="reading-task-ready-top">
        <div>
          <span className="reading-task-kicker">{partLabel}</span>
          <h3>Ready to start?</h3>
          <p>{taskTitle}</p>
        </div>
        <div className="reading-task-ready-time" aria-label={`Suggested pace ${formatReadingTime(recommendedSeconds)}`}>
          <Clock3 size={22} aria-hidden="true" />
          <strong>{formatReadingTime(recommendedSeconds)}</strong>
          <span>Suggested pace</span>
        </div>
      </div>
      <div className="reading-task-ready-grid">
        <article><strong>{itemCountLabel}</strong><span>Complete the full task before checking.</span></article>
        <article><strong>One shared exam timer</strong><span>The real Reading test gives you 35 minutes for all four parts.</span></article>
        <article><strong>No cutoff here</strong><span>You can keep working after the suggested time is reached.</span></article>
      </div>
      <p className="reading-task-ready-note">
        The exam does not time this part separately. This recommendation is only a guide to help you practise your pace.
      </p>
      <button className="reading-task-start-button" type="button" onClick={onStart}>
        <Play size={18} fill="currentColor" aria-hidden="true" /> Start task
      </button>
      <ReadingTimingStyles />
    </section>
  );
}

export function ReadingTaskTimer({ timer }) {
  const isStopped = timer.phase === "stopped";
  const isOver = timer.elapsedSeconds > timer.recommendedSeconds;
  const displayedSeconds = isStopped
    ? timer.elapsedSeconds
    : isOver
      ? timer.overtimeSeconds
      : timer.remainingSeconds;
  const label = isStopped
    ? "Time taken"
    : isOver
      ? "Past suggested pace"
      : "Suggested pace";

  return (
    <div className="reading-task-timer-wrap">
      <div
        className={`reading-task-timer ${isOver ? "is-over" : ""} ${isStopped ? "is-stopped" : ""}`}
        aria-label={`${label}: ${formatReadingTime(displayedSeconds)}`}
      >
        <Clock3 size={19} aria-hidden="true" />
        <strong>{isOver && !isStopped ? "+" : ""}{formatReadingTime(displayedSeconds)}</strong>
        <span>{label}</span>
      </div>
      <ReadingTimingStyles />
    </div>
  );
}

function ReadingTimingStyles() {
  return <style>{`
    .reading-task-ready {
      --rt-accent:var(--color-accent, #6ea8ff);
      --rt-ink:var(--color-text, #e6f0ff);
      --rt-soft:var(--color-text-soft, #a9b7d1);
      --rt-panel:var(--color-surface-raised, #13213b);
      --rt-border:var(--color-border, #2c4b83);
      margin:1rem 0;
      padding:clamp(1rem, 3vw, 1.5rem);
      border:1px solid var(--rt-border);
      border-radius:18px;
      background:linear-gradient(140deg, color-mix(in srgb, var(--rt-accent) 9%, var(--rt-panel)), var(--rt-panel) 70%);
      color:var(--rt-ink);
      box-shadow:0 16px 36px rgba(0,0,0,.16);
    }
    .reading-task-ready-top { display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; }
    .reading-task-kicker { color:var(--rt-accent); font-size:.76rem; font-weight:900; letter-spacing:.08em; text-transform:uppercase; }
    .reading-task-ready h3 { margin:.25rem 0 .2rem; font-size:clamp(1.35rem, 4vw, 1.9rem); }
    .reading-task-ready-top p { margin:0; color:var(--rt-soft); }
    .reading-task-ready-time, .reading-task-timer {
      display:grid;
      grid-template-columns:auto auto;
      align-items:center;
      gap:.05rem .5rem;
      min-width:9.5rem;
      padding:.7rem .85rem;
      border:1px solid color-mix(in srgb, var(--rt-accent, var(--color-accent, #6ea8ff)) 48%, var(--rt-border, var(--color-border, #2c4b83)));
      border-radius:13px;
      background:color-mix(in srgb, var(--rt-accent, var(--color-accent, #6ea8ff)) 12%, var(--rt-panel, var(--color-surface-raised, #13213b)));
      color:var(--rt-ink, var(--color-text, #e6f0ff));
    }
    .reading-task-ready-time svg, .reading-task-timer svg { grid-row:1 / 3; color:var(--rt-accent, var(--color-accent, #6ea8ff)); }
    .reading-task-ready-time strong, .reading-task-timer strong { font-size:1.22rem; font-variant-numeric:tabular-nums; line-height:1.1; }
    .reading-task-ready-time span, .reading-task-timer span { color:var(--rt-soft, var(--color-text-soft, #a9b7d1)); font-size:.72rem; font-weight:800; text-transform:uppercase; letter-spacing:.04em; }
    .reading-task-ready-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:.7rem; margin:1.15rem 0; }
    .reading-task-ready-grid article { padding:.85rem; border:1px solid var(--rt-border); border-radius:12px; background:color-mix(in srgb, var(--rt-panel) 88%, transparent); }
    .reading-task-ready-grid strong, .reading-task-ready-grid span { display:block; }
    .reading-task-ready-grid span { margin-top:.25rem; color:var(--rt-soft); font-size:.88rem; line-height:1.45; }
    .reading-task-ready-note { margin:.8rem 0; color:var(--rt-soft); font-size:.9rem; line-height:1.5; }
    .reading-task-start-button { display:inline-flex; align-items:center; gap:.45rem; padding:.72rem 1rem; border:1px solid color-mix(in srgb, var(--rt-accent) 72%, white); border-radius:11px; background:color-mix(in srgb, var(--rt-accent) 60%, #16325c); color:white; font:inherit; font-weight:900; cursor:pointer; }
    .reading-task-start-button:hover { filter:brightness(1.08); }
    .reading-task-timer-wrap { position:sticky; top:.7rem; z-index:30; display:flex; justify-content:flex-end; margin:.35rem 0 .7rem; pointer-events:none; }
    .reading-task-timer { --rt-accent:var(--color-accent, #6ea8ff); --rt-ink:var(--color-text, #e6f0ff); --rt-soft:var(--color-text-soft, #a9b7d1); --rt-panel:var(--color-surface-raised, #13213b); --rt-border:var(--color-border, #2c4b83); width:max-content; box-shadow:0 10px 24px rgba(0,0,0,.18); backdrop-filter:blur(10px); }
    .reading-task-timer.is-over { --rt-accent:#d89a26; }
    .reading-task-timer.is-stopped { --rt-accent:#36a978; }
    @media (max-width:680px) {
      .reading-task-ready-top { flex-direction:column; }
      .reading-task-ready-time { width:100%; box-sizing:border-box; }
      .reading-task-ready-grid { grid-template-columns:1fr; }
    }
  `}</style>;
}
