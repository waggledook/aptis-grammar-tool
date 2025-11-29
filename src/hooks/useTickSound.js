// src/hooks/useTickSound.js
import { useRef, useCallback } from "react";

export function useTickSound() {
  // Base <audio> elements – React will attach DOM nodes to these
  const tickRef = useRef(null);
  const tickFastRef = useRef(null);

  const playTick = useCallback((isFast = false) => {
    const base = isFast ? tickFastRef.current : tickRef.current;
    if (!base) return;

    // Clone the audio node so each tick plays on its own "channel"
    const clone = base.cloneNode();
    clone.play().catch(() => {
      // Ignore autoplay / user-gesture issues
    });
  }, []);

  return { tickRef, tickFastRef, playTick };
}
