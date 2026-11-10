import { useCallback, useEffect, useRef, useState } from "react";
import { saveHubGrammarReviewAnswer } from "../../api/hubGrammarReview.js";

/** Keep failed writes retryable with their original identity and answer time. */
export default function useHubGrammarReviewSaving(uid, onSaved) {
  const entries = useRef(new Map());
  const completed = useRef(new Set());
  const mounted = useRef(true);
  const currentUid = useRef(uid);
  currentUid.current = uid;
  const callback = useRef(onSaved);
  callback.current = onSaved;
  const [, refresh] = useState(0);
  const notify = useCallback(() => { if (mounted.current) refresh((value) => value + 1); }, []);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { entries.current.clear(); completed.current.clear(); notify(); }, [uid, notify]);

  const persist = useCallback(async (entry) => {
    if (entry.saving) return;
    entry.saving = true;
    entry.error = false;
    notify();
    try {
      const progress = await saveHubGrammarReviewAnswer(entry.event);
      entries.current.delete(entry.event.eventId);
      completed.current.add(entry.event.eventId);
      if (mounted.current && currentUid.current === entry.event.expectedUid && progress) callback.current?.(progress);
    } catch (error) {
      console.error("[Mini grammar review] Progress save failed", error);
      entry.error = true;
    } finally {
      entry.saving = false;
      notify();
    }
  }, [notify]);

  const queueAnswer = useCallback((event) => {
    if (entries.current.has(event.eventId) || completed.current.has(event.eventId)) return;
    const entry = { event: { ...event, expectedUid: uid }, saving: false, error: false };
    entries.current.set(event.eventId, entry);
    void persist(entry);
  }, [persist, uid]);
  const retry = useCallback(() => {
    for (const entry of entries.current.values()) if (entry.error) void persist(entry);
  }, [persist]);
  return { queueAnswer, retry,
    saving: [...entries.current.values()].some((entry) => entry.saving),
    error: [...entries.current.values()].some((entry) => entry.error),
  };
}
