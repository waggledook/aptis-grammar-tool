import React from "react";

const APTIS_FULL_ACCESS_URL = "https://idiomasseif.com/preparacion-examen-aptis/";

export default function AptisDemoBadge({ user, aptisAccess, onSignIn }) {
  if (!aptisAccess?.isDemoMode) return null;

  const isSignedIn = !!user;

  return (
    <aside className="aptis-demo-badge" aria-label="Aptis Trainer demo mode">
      <div className="aptis-demo-badge-copy">
        <span className="aptis-demo-pill">
          <span aria-hidden="true">✦</span>
          Demo access
        </span>
        <div>
          <p>
            {isSignedIn
              ? "Your account currently has demo access."
              : "You are using the Aptis Trainer demo."}{" "}
            {isSignedIn
              ? "Full access unlocks every practice activity and more AI feedback."
              : "Sign in to save your work, or get full access through Seif English Academy."}
          </p>
        </div>
      </div>

      <div className="aptis-demo-actions">
        {!isSignedIn && onSignIn ? (
          <button className="aptis-demo-action secondary" type="button" onClick={onSignIn}>
            <span>Sign in</span>
          </button>
        ) : null}
        <a
          className="aptis-demo-action"
          href={APTIS_FULL_ACCESS_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>Get full access</span>
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </aside>
  );
}
