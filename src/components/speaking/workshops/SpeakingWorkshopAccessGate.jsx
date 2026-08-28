import React, { useState } from "react";
import { redeemSpeakingWorkshopAccess } from "../../../firebase";

function hasWorkshopAccess(user) {
  if (!user) return false;
  if (user.role === "admin" || user.role === "teacher") return true;
  return user.siteAccess?.speakingWorkshops === true || !!user.siteAccess?.speakingWorkshops?.active;
}

export default function SpeakingWorkshopAccessGate({ user, onSignIn, children }) {
  const [granted, setGranted] = useState(() => hasWorkshopAccess(user));
  const [code, setCode] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  if (granted || hasWorkshopAccess(user)) return children;

  if (!user) {
    return (
      <main className="speaking-workshops access-state">
        <section className="workshop-access-card">
          <span className="workshop-kicker">Aptis Speaking Workshops</span>
          <h1>Sign in to join the workshop</h1>
          <p>This unlisted area is available to registered Aptis Trainer users with a workshop access code.</p>
          <button className="workshop-primary" type="button" onClick={onSignIn}>Sign in / Sign up</button>
        </section>
      </main>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!code.trim() || submitting) return;
    setSubmitting(true);
    setStatus({ type: "", message: "" });
    try {
      await redeemSpeakingWorkshopAccess(code);
      setGranted(true);
    } catch (error) {
      const codeName = String(error?.code || "");
      const message = codeName.includes("failed-precondition")
        ? "Workshop access has not been configured yet."
        : codeName.includes("permission-denied") || codeName.includes("invalid-argument")
          ? "That access code isn’t valid. Check it and try again."
          : "We couldn’t check that code right now. Please try again.";
      setStatus({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="speaking-workshops access-state">
      <section className="workshop-access-card">
        <span className="workshop-kicker">Aptis Speaking Workshops</span>
        <h1>Enter your workshop code</h1>
        <p>Access is linked to <strong>{user.email}</strong>, so you’ll only need to enter the code once.</p>
        <form className="workshop-code-form" onSubmit={handleSubmit}>
          <label htmlFor="workshop-code">Access code</label>
          <div>
            <input
              id="workshop-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              autoComplete="one-time-code"
              spellCheck="false"
              maxLength={64}
              placeholder="Enter code"
            />
            <button className="workshop-primary" type="submit" disabled={submitting || !code.trim()}>
              {submitting ? "Checking…" : "Continue"}
            </button>
          </div>
        </form>
        {status.message ? <p className="workshop-form-error" role="alert">{status.message}</p> : null}
      </section>
    </main>
  );
}
