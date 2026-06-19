export function buildOteAudioName(prefix, id, mimeType = "audio/webm") {
  const extension = mimeType.includes("mp4") ? "m4a" : "webm";
  return `${prefix}-${String(id || "recording").replace(/[^a-z0-9-]+/gi, "-").toLowerCase()}.${extension}`;
}

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",").pop() : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function recordingsToFeedbackAudio(recordings = [], prefix = "ote-speaking") {
  const usable = recordings.filter((recording) => recording?.blob);
  return Promise.all(
    usable.map(async (recording) => ({
      id: recording.id || recording.questionId || recording.taskId || recording.stepId || "",
      partId: recording.partId || "",
      prompt: recording.prompt || "",
      label: recording.label || recording.title || "",
      durationSeconds: Number(recording.durationSeconds || 0),
      mime: recording.blob.type || recording.mimeType || "audio/webm",
      name: recording.name || buildOteAudioName(prefix, recording.id || recording.questionId || recording.taskId || recording.stepId, recording.blob.type),
      base64: await blobToBase64(recording.blob),
    }))
  );
}
