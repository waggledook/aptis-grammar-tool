import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchGrammarReviewSummary } from "../../firebase";

const REVIEW_ALERT_THRESHOLD = 5;
const REVIEW_ALERT_SNOOZE_MS = 3 * 24 * 60 * 60 * 1000;
const ELIGIBLE_PATHS = new Set(["/", "/grammar", "/grammar/aptis"]);

function storageKey(uid, suffix) {
  return `aptis-grammar-review-nudge:${uid}:${suffix}`;
}

function isSnoozed(uid) {
  try {
    const raw = window.localStorage.getItem(storageKey(uid, "snooze"));
    const stored = raw ? JSON.parse(raw) : null;
    return Number(stored?.until) > Date.now();
  } catch {
    return false;
  }
}

function wasShownThisSession(uid) {
  try {
    return window.sessionStorage.getItem(storageKey(uid, "shown")) === "1";
  } catch {
    return false;
  }
}

function markShownThisSession(uid) {
  try {
    window.sessionStorage.setItem(storageKey(uid, "shown"), "1");
  } catch {
    // Storage can be unavailable in strict privacy modes; the nudge still works.
  }
}

export default function GrammarReviewNudge({ user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const isStudent = user && user.role !== "teacher" && user.role !== "admin";
  const isEligiblePath = ELIGIBLE_PATHS.has(location.pathname);

  useEffect(() => {
    setSummary(null);
    if (!isStudent || !isEligiblePath) return undefined;
    if (isSnoozed(user.uid) || wasShownThisSession(user.uid)) return undefined;

    let alive = true;
    fetchGrammarReviewSummary(user.uid)
      .then((nextSummary) => {
        if (!alive || nextSummary.ready < REVIEW_ALERT_THRESHOLD) return;
        markShownThisSession(user.uid);
        setSummary(nextSummary);
      })
      .catch((error) =>
        console.error("[GrammarReviewNudge] Could not load review count", error)
      );

    return () => {
      alive = false;
    };
  }, [isEligiblePath, isStudent, user?.uid]);

  if (!summary) return null;

  function dismiss() {
    try {
      window.localStorage.setItem(
        storageKey(user.uid, "snooze"),
        JSON.stringify({ until: Date.now() + REVIEW_ALERT_SNOOZE_MS })
      );
    } catch {
      // The session-level guard still prevents repeated nudges in this tab.
    }
    setSummary(null);
  }

  return (
    <aside
      className="grammar-review-nudge"
      aria-label="Grammar review reminder"
    >
      <div className="grammar-review-nudge-copy" aria-live="polite">
        <span>Ready for review</span>
        <strong>
          You have {summary.ready} grammar questions ready to review.
        </strong>
        <p>A short session now will help the tricky points stick.</p>
      </div>
      <div className="grammar-review-nudge-actions">
        <button
          type="button"
          className="review-btn grammar-review-featured"
          onClick={() => navigate("/profile/grammar-review-beta")}
        >
          Review now
        </button>
        <button type="button" className="ghost-btn" onClick={dismiss}>
          Not now
        </button>
      </div>
    </aside>
  );
}
