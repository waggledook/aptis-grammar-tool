import React from "react";

export default function OteListeningAudioRetry({ failure }) {
  if (!failure) return null;

  return (
    <div>
      <p className="ote-listening-audio-note" role="status">
        {failure.blocked
          ? "Your browser blocked automatic playback. Tap below to continue."
          : "The recording could not play. Try again to continue from this step."}
      </p>
      <div className="ote-recorder-actions">
        <button type="button" onClick={failure.retry}>
          {failure.blocked ? "Play audio" : "Retry audio"}
        </button>
      </div>
    </div>
  );
}
