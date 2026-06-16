import React from "react";
import { Link } from "react-router-dom";
import { APTIS_ACCESS_PATH } from "./aptisAccessLinks.js";

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
        <Link
          className="aptis-demo-action"
          to={APTIS_ACCESS_PATH}
        >
          <span>Get full access</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </aside>
  );
}
