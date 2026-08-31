import React from "react";
import { Clock3 } from "lucide-react";

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getPhaseLabel(phase) {
  if (phase === "announce") return "Playing question";
  if (phase === "beep") return "Get ready";
  if (phase === "doneSeg") return "Answer recorded";
  return "Time remaining";
}

export default function SpeakingStickyTimer({
  active,
  questionIndex,
  questionCount = 3,
  phase,
  secondsLeft,
  recording,
}) {
  if (!active) return null;

  const phaseLabel = getPhaseLabel(phase);

  return (
    <div className="speaking-sticky-timer-wrap">
      <div
        className={`speaking-sticky-timer ${phase === "speak" ? "is-counting" : ""}`}
        role="timer"
        aria-label={`Question ${questionIndex + 1} of ${questionCount}. ${phaseLabel}. ${formatTime(secondsLeft)}.`}
      >
        <Clock3 size={19} aria-hidden="true" />
        <span className="speaking-sticky-timer-question">
          Question {questionIndex + 1}/{questionCount}
        </span>
        <strong>{formatTime(secondsLeft)}</strong>
        <span className="speaking-sticky-timer-phase">
          {recording ? "● Recording" : phaseLabel}
        </span>
      </div>
      <SpeakingStickyTimerStyles />
    </div>
  );
}

function SpeakingStickyTimerStyles() {
  return <style>{`
    .speaking-sticky-timer-wrap {
      position: sticky;
      top: max(.7rem, env(safe-area-inset-top));
      z-index: 40;
      display: flex;
      justify-content: flex-end;
      margin: .35rem 0 .7rem;
      pointer-events: none;
    }
    .speaking-sticky-timer {
      display: grid;
      grid-template-columns: auto auto auto;
      align-items: center;
      gap: .05rem .5rem;
      width: max-content;
      max-width: 100%;
      padding: .6rem .8rem;
      border: 1px solid color-mix(in srgb, var(--color-accent, #7db3ff) 58%, var(--color-border, #2c4b83));
      border-radius: 13px;
      background: color-mix(in srgb, var(--color-surface-raised, #13213b) 94%, transparent);
      color: var(--color-text, #e6f0ff);
      box-shadow: 0 10px 24px rgba(0, 0, 0, .22);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    .speaking-sticky-timer svg {
      grid-row: 1 / 3;
      color: var(--color-accent, #7db3ff);
    }
    .speaking-sticky-timer-question,
    .speaking-sticky-timer-phase {
      color: var(--color-text-soft, #a9b7d1);
      font-size: .72rem;
      font-weight: 800;
      line-height: 1.15;
      text-transform: uppercase;
      letter-spacing: .04em;
    }
    .speaking-sticky-timer strong {
      grid-column: 3;
      grid-row: 1 / 3;
      min-width: 4ch;
      font-size: 1.25rem;
      font-variant-numeric: tabular-nums;
      line-height: 1;
      text-align: right;
    }
    .speaking-sticky-timer.is-counting {
      border-color: color-mix(in srgb, var(--color-accent, #7db3ff) 78%, white);
    }
    .speaking-sticky-timer.is-counting .speaking-sticky-timer-phase {
      color: #ff8d7a;
    }
    @media (max-width: 560px) {
      .speaking-sticky-timer-wrap { justify-content: stretch; }
      .speaking-sticky-timer { width: 100%; box-sizing: border-box; }
    }
  `}</style>;
}
