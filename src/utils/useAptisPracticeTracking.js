import { useEffect, useRef } from "react";
import { saveAptisPracticeAttempt } from "../firebase.js";
import { advanceAptisPracticeRun } from "./aptisPracticeRun.js";

// One document represents one run through a task. Checks update that document;
// navigating to another task or pressing Reset starts a fresh run.
export function useAptisPracticeTracking({ user, skill, part, taskId, title, source, preserveAcrossTaskSwitches = false }) {
  const currentRef = useRef(null);
  const runsRef = useRef(new Map());
  const key = `${user?.uid || ""}:${skill}:${part}:${source}:${taskId}`;

  useEffect(() => {
    if (!preserveAcrossTaskSwitches) currentRef.current = null;
  }, [user?.uid, skill, part, taskId, source, preserveAcrossTaskSwitches]);

  function getRun() {
    if (!user?.uid || !taskId) return null;
    let run = preserveAcrossTaskSwitches ? runsRef.current.get(key) : currentRef.current;
    if (run?.key !== key) {
      run = {
        key,
        id: crypto.randomUUID(),
        checkCount: 0,
        firstScore: null,
        firstTotal: null,
        latestScore: null,
        latestTotal: null,
        assisted: false,
        revealedBeforeFirstCheck: false,
        pending: Promise.resolve(),
        saved: false,
      };
      if (preserveAcrossTaskSwitches) runsRef.current.set(key, run);
      else currentRef.current = run;
    }
    return run;
  }

  function persist(run, extra = {}) {
    const isFirstSave = !run.saved;
    run.saved = true;
    const payload = {
      id: run.id,
      uid: user.uid,
      skill,
      part,
      taskId,
      title: title || taskId,
      source: source || "",
      checkCount: run.checkCount,
      firstScore: run.firstScore,
      firstTotal: run.firstTotal,
      latestScore: run.latestScore,
      latestTotal: run.latestTotal,
      assisted: run.assisted,
      revealedBeforeFirstCheck: run.revealedBeforeFirstCheck,
      ...extra,
    };
    run.pending = run.pending.catch(() => {}).then(() =>
      saveAptisPracticeAttempt(payload, { isFirstSave })
    );
    return run.pending.catch((error) => {
      console.warn("[Aptis practice] Could not save attempt", error);
    });
  }

  function recordCheck({ score, total, playsUsed = null, durationSeconds = null }) {
    const run = getRun();
    if (!run) return Promise.resolve();
    Object.assign(run, advanceAptisPracticeRun(run, { type: "check", score, total }));
    return persist(run, {
      ...(Number.isFinite(playsUsed) ? { playsUsed } : {}),
      ...(Number.isFinite(durationSeconds) ? { durationSeconds } : {}),
    });
  }

  function recordReveal() {
    const run = getRun();
    if (!run) return Promise.resolve();
    Object.assign(run, advanceAptisPracticeRun(run, { type: "reveal" }));
    return persist(run);
  }

  function restart() {
    if (preserveAcrossTaskSwitches) runsRef.current.delete(key);
    currentRef.current = null;
  }

  function restartAll() {
    runsRef.current.clear();
    currentRef.current = null;
  }

  return { recordCheck, recordReveal, restart, restartAll };
}
