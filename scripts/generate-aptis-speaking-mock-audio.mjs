import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { APTIS_SPEAKING_MOCKS } from "../src/components/speaking/mockTests/aptisSpeakingMockData.js";

const workspace = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const voice = "Daniel";
const rate = "165";
const workDir = mkdtempSync(join(tmpdir(), "aptis-speaking-tts-"));

function outputFor(assetPath) {
  if (!assetPath.startsWith("/aptis-speaking/")) {
    throw new Error(`Unexpected asset path: ${assetPath}`);
  }
  return join(workspace, "public", assetPath);
}

function render(text, outputPath) {
  if (existsSync(outputPath)) {
    console.log(`Exists: ${outputPath}`);
    return;
  }

  mkdirSync(dirname(outputPath), { recursive: true });
  const inputPath = join(workDir, "speech.aiff");
  execFileSync("say", ["-v", voice, "-r", rate, "-o", inputPath, text]);
  execFileSync("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y", "-i", inputPath,
    "-af", "loudnorm=I=-18:TP=-2:LRA=11",
    "-ar", "44100", "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "160k",
    outputPath,
  ]);
  if (statSync(outputPath).size < 3000) {
    throw new Error(`Generated audio is unexpectedly small: ${outputPath}`);
  }
  console.log(`Generated: ${outputPath}`);
}

try {
  // The original test has its own recorded assets; display numbers can change.
  for (const mock of APTIS_SPEAKING_MOCKS.filter((item) => item.id !== "speaking-general-1")) {
    for (const partNumber of [1, 2, 3]) {
      for (const question of mock.parts[partNumber].questions) {
        render(question.text, outputFor(question.audio));
      }
    }
    const partFour = mock.parts[4];
    const questionsScript = [
      ...partFour.questions.map((question) => question.text),
      "You now have one minute to think about your answers. You can make notes if you wish.",
    ].join(" ");
    render(questionsScript, outputFor(partFour.questionsAudio));
  }
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
