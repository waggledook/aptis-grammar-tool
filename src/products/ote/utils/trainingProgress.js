import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchOteTrainingProgress } from "../../../firebase.js";

export function useOteTrainingProgress() {
  const [completed, setCompleted] = useState(() => new Set());
  const refreshProgress = useCallback(() => {
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

  useEffect(() => {
    return refreshProgress();
  }, [refreshProgress]);

  useEffect(() => {
    function handleProgressUpdated(event) {
      const progressIds = Array.isArray(event.detail?.progressIds) ? event.detail.progressIds : [];
      if (!progressIds.length) return;
      setCompleted((current) => {
        const next = new Set(current);
        progressIds.forEach((id) => {
          if (id) next.add(id);
        });
        return next;
      });
    }

    function handleFocus() {
      refreshProgress();
    }

    window.addEventListener("ote-training-progress-updated", handleProgressUpdated);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);
    return () => {
      window.removeEventListener("ote-training-progress-updated", handleProgressUpdated);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [refreshProgress]);

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
