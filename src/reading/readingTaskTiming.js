import { useCallback, useEffect, useRef, useState } from "react";

export const READING_SUGGESTED_SECONDS = {
  part1: 3 * 60,
  part2: 3 * 60 + 30,
  part3: 10 * 60,
  part4: 15 * 60,
};

export function formatReadingTime(seconds) {
  const safeSeconds = Math.max(0, Math.round(Number(seconds) || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

export function useSuggestedTaskTimer(recommendedSeconds) {
  const [phase, setPhase] = useState("ready");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const phaseRef = useRef("ready");
  const startedAtRef = useRef(null);
  const elapsedRef = useRef(0);

  const updateElapsed = useCallback(() => {
    if (!startedAtRef.current) return elapsedRef.current;
    const next = Math.max(0, Math.floor((Date.now() - startedAtRef.current) / 1000));
    elapsedRef.current = next;
    setElapsedSeconds(next);
    return next;
  }, []);

  useEffect(() => {
    if (phase !== "active") return undefined;
    updateElapsed();
    const intervalId = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(intervalId);
  }, [phase, updateElapsed]);

  const start = useCallback(() => {
    startedAtRef.current = Date.now();
    elapsedRef.current = 0;
    phaseRef.current = "active";
    setElapsedSeconds(0);
    setPhase("active");
  }, []);

  const stop = useCallback(() => {
    const isFirstStop = phaseRef.current === "active";
    const durationSeconds = isFirstStop ? updateElapsed() : elapsedRef.current;
    if (isFirstStop) {
      phaseRef.current = "stopped";
      setPhase("stopped");
    }
    return { durationSeconds, isFirstStop };
  }, [updateElapsed]);

  const reset = useCallback(() => {
    startedAtRef.current = null;
    elapsedRef.current = 0;
    phaseRef.current = "ready";
    setElapsedSeconds(0);
    setPhase("ready");
  }, []);

  return {
    phase,
    elapsedSeconds,
    remainingSeconds: Math.max(0, recommendedSeconds - elapsedSeconds),
    overtimeSeconds: Math.max(0, elapsedSeconds - recommendedSeconds),
    recommendedSeconds,
    start,
    stop,
    reset,
  };
}

export function getReadingTimingDetails(timer, completionAction) {
  const stopped = timer.stop();
  const durationSeconds = stopped.durationSeconds;
  return {
    durationSeconds,
    recommendedSeconds: timer.recommendedSeconds,
    overtimeSeconds: Math.max(0, durationSeconds - timer.recommendedSeconds),
    withinSuggestedTime: durationSeconds <= timer.recommendedSeconds,
    completionAction,
    timingMode: "suggested",
    firstTimedCheck: stopped.isFirstStop,
  };
}
