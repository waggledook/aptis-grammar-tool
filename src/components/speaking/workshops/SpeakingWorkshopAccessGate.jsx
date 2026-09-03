import React, { useCallback, useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import {
  getSpeakingWorkshopAccess,
  joinSpeakingWorkshopSession,
  redeemSpeakingWorkshopAccess,
} from "../../../firebase";

function hasWorkshopAccess(user) {
  if (!user) return false;
  if (user.role === "admin" || user.role === "teacher") return true;
  return user.siteAccess?.speakingWorkshops === true || !!user.siteAccess?.speakingWorkshops?.active;
}

export default function SpeakingWorkshopAccessGate({ user, onSignIn, children }) {
  const [granted, setGranted] = useState(() => hasWorkshopAccess(user));
  const [access, setAccess] = useState({ canManage: false, sessions: [], topicAccess: {} });
  const [code, setCode] = useState(() => (
    typeof window === "undefined"
      ? ""
      : new URLSearchParams(window.location.search).get("join") || ""
  ));
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!user);
  const attemptedJoinCode = useRef("");
  const isStaff = user?.role === "admin" || user?.role === "teacher";

  const loadAccess = useCallback(async ({ silent = false } = {}) => {
    if (!user || isStaff || granted || hasWorkshopAccess(user)) {
      if (!silent) setLoading(false);
      return null;
    }
    if (!silent) setLoading(true);
    try {
      const result = await getSpeakingWorkshopAccess();
      const next = {
        canManage: false,
        sessions: Array.isArray(result?.sessions) ? result.sessions : [],
        topicAccess: result?.topicAccess && typeof result.topicAccess === "object"
          ? result.topicAccess
          : {},
      };
      setAccess(next);
      return next;
    } catch (error) {
      console.error("[Speaking workshops] Could not check session access", error);
      setStatus({ type: "error", message: "Workshop registration isn’t available right now. Please try again shortly." });
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  }, [granted, isStaff, user]);

  useEffect(() => {
    loadAccess();
    if (!user || isStaff || granted || hasWorkshopAccess(user)) return undefined;
    const refresh = () => loadAccess({ silent: true });
    const intervalId = window.setInterval(refresh, 15000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refresh);
    };
  }, [granted, isStaff, loadAccess, user]);

  const redeemCode = useCallback(async (rawCode, { rethrow = false } = {}) => {
    const normalizedCode = String(rawCode || "").trim().toUpperCase();
    if (!normalizedCode || submitting) return;
    setSubmitting(true);
    setStatus({ type: "", message: "" });
    try {
      try {
        await joinSpeakingWorkshopSession(normalizedCode);
        await loadAccess();
      } catch (sessionError) {
        const sessionCode = String(sessionError?.code || "");
        if (!sessionCode.includes("not-found") && !sessionCode.includes("invalid-argument")) {
          throw sessionError;
        }
        await redeemSpeakingWorkshopAccess(normalizedCode);
        setGranted(true);
      }
      setCode("");
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("join");
        window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
      }
    } catch (error) {
      const codeName = String(error?.code || "");
      const message = codeName.includes("failed-precondition")
        ? "Registration for this workshop is closed."
        : codeName.includes("permission-denied") || codeName.includes("invalid-argument") || codeName.includes("not-found")
          ? "That workshop code isn’t valid. Check it and try again."
          : "We couldn’t check that code right now. Please try again.";
      setStatus({ type: "error", message });
      if (rethrow) throw new Error(message);
    } finally {
      setSubmitting(false);
    }
  }, [loadAccess, submitting]);

  useEffect(() => {
    if (!user || isStaff || !code || attemptedJoinCode.current === code) return;
    attemptedJoinCode.current = code;
    redeemCode(code);
  }, [code, isStaff, redeemCode, user]);

  if (isStaff || granted || hasWorkshopAccess(user)) {
    return typeof children === "function"
      ? children({ canManage: isStaff, fullAccess: true, sessions: [], topicAccess: {}, refresh: loadAccess, joinSession: (nextCode) => redeemCode(nextCode, { rethrow: true }) })
      : children;
  }

  if (!user) {
    return (
      <main className="speaking-workshops access-state">
        <section className="workshop-access-card">
          <span className="workshop-kicker">Aptis Speaking Workshops</span>
          <h1>Sign in to join the workshop</h1>
          <p>Sign in, then use the link or six-character code shared by your workshop teacher.</p>
          <button className="workshop-primary" type="button" onClick={onSignIn}>Sign in / Sign up</button>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="speaking-workshops access-state">
        <section className="workshop-access-card workshop-access-loading">
          <LoaderCircle className="workshop-spin" size={25} />
          <p>Checking your workshop access…</p>
        </section>
      </main>
    );
  }

  if (Object.keys(access.topicAccess).length) {
    return typeof children === "function"
      ? children({ ...access, fullAccess: false, refresh: loadAccess, joinSession: (nextCode) => redeemCode(nextCode, { rethrow: true }) })
      : children;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await redeemCode(code);
  }

  return (
    <main className="speaking-workshops access-state">
      <section className="workshop-access-card">
        <span className="workshop-kicker">Aptis Speaking Workshops</span>
        <h1>Join your workshop</h1>
        <p>Enter the code your teacher shared. Preparation unlocks immediately and stays linked to <strong>{user.email}</strong>.</p>
        <form className="workshop-code-form" onSubmit={handleSubmit}>
          <label htmlFor="workshop-code">Six-character workshop code</label>
          <div>
            <input
              id="workshop-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              autoComplete="one-time-code"
              spellCheck="false"
              maxLength={6}
              placeholder="ABC234"
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
