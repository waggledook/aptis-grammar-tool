// src/hooks/useTickSound.js
import { useRef, useCallback } from "react";

export function useTickSound() {
  const tickRef = useRef(null);
  const tickFastRef = useRef(null);
  const lastPlayedRef = useRef(null);

  const playTick = useCallback((isFast = false) => {
    const base = isFast ? tickFastRef.current : tickRef.current;
    if (!base) return;

    if (lastPlayedRef.current && lastPlayedRef.current !== base) {
      lastPlayedRef.current.pause();
      lastPlayedRef.current.currentTime = 0;
    }

    base.pause();
    base.currentTime = 0;
    lastPlayedRef.current = base;

    base.play().catch(() => {
      // Ignore autoplay / user-gesture issues
    });
  }, []);

  const stopTicks = useCallback(() => {
    [tickRef.current, tickFastRef.current].forEach((audio) => {
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
    });
    lastPlayedRef.current = null;
  }, []);

  return { tickRef, tickFastRef, playTick, stopTicks };
}
