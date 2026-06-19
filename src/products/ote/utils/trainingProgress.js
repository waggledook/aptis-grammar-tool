import { useEffect, useMemo, useState } from "react";
import { fetchOteTrainingProgress } from "../../../firebase.js";

export function useOteTrainingProgress() {
  const [completed, setCompleted] = useState(() => new Set());

  useEffect(() => {
    let alive = true;
    fetchOteTrainingProgress()
      .then((progress) => {
        if (alive) setCompleted(progress instanceof Set ? progress : new Set());
      })
      .catch((error) => {
        console.warn("[OTE training] progress load failed", error);
        if (alive) setCompleted(new Set());
      });
    return () => {
      alive = false;
    };
  }, []);

  return completed;
}

export function useOteTrainingSummary(items = [], completed = new Set()) {
  return useMemo(() => {
    const trackable = items.filter((item) => item.progressId);
    const done = trackable.filter((item) => completed.has(item.progressId)).length;
    return {
      completed: done,
      total: trackable.length,
      allComplete: trackable.length > 0 && done >= trackable.length,
    };
  }, [completed, items]);
}
