// src/hooks/useTickSound.js
import { useRef, useCallback } from "react";

export function useTickSound() {
  const tickRef = useRef(null);
  const tickFastRef = useRef(null);

  const playTick = useCallback((isFast = false) => {
    const base = isFast ? tickFastRef.current : tickRef.current;
    if (!base) return;

    const clone = base.cloneNode();

    // 🔊 Make sure clones respect current volume / mute settings
    clone.volume = base.volume ?? 1;
    clone.muted = base.muted ?? false;

    clone.play().catch(() => {
      // Ignore autoplay / user-gesture issues
    });
  }, []);

  return { tickRef, tickFastRef, playTick };
}
