export const LISTEN_AGAIN_PROMPT_SRC =
  "/audio/ote/listening/instructions/now-listen-again.mp3";

export function optionLetter(index) {
  return String.fromCharCode(65 + Number(index || 0));
}

export function normaliseListeningAnswer(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("en-GB")
    .replace(/\s+/g, " ");
}
