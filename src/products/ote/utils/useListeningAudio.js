import { useCallback, useRef, useState } from "react";

export default function useListeningAudio(volume) {
  const audioRef = useRef(null);
  const attemptRef = useRef(null);
  const [audioFailure, setAudioFailure] = useState(null);

  const stopRecording = useCallback(() => {
    attemptRef.current = null;
    const audio = audioRef.current;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
    }
    setAudioFailure(null);
  }, []);

  function playRecording(src, onComplete, options = {}) {
    const { onStart, skipOnError } = options;
    // WebKit grants autoplay permission to the element started by the user's click.
    const audio = audioRef.current ?? (audioRef.current = new Audio());
    const attempt = {};
    attemptRef.current = attempt;
    setAudioFailure(null);
    let settled = false;

    function settle() {
      if (settled || attemptRef.current !== attempt) return false;
      settled = true;
      audio.onended = null;
      audio.onerror = null;
      return true;
    }

    function fail(error) {
      if (!settle()) return;
      audio.pause();
      if (skipOnError) {
        attemptRef.current = null;
        onComplete();
        return;
      }
      setAudioFailure({
        blocked: error?.name === "NotAllowedError",
        retry: () => {
          if (attemptRef.current === attempt) playRecording(src, onComplete, options);
        },
      });
    }

    audio.onended = () => {
      if (!settle()) return;
      attemptRef.current = null;
      onComplete();
    };
    audio.onerror = fail;
    audio.volume = volume;
    audio.src = src;
    audio.play().then(() => {
      if (!settled && attemptRef.current === attempt) onStart?.();
    }, fail);
  }

  return { audioFailure, playRecording, stopRecording };
}
