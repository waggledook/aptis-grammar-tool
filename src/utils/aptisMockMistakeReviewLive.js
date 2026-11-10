import { shuffleGrammarItems } from "../components/grammar/aptisGrammarLive.js";

export const APTIS_MOCK_MISTAKE_REVIEW_LIVE_SOURCE = "aptis-mock-mistake-review";
export const APTIS_MOCK_MISTAKE_REVIEW_LIVE_MAX_QUESTIONS = 300;

function vocabularyPrompt(item) {
  const prompt = item.row?.prompt || "";
  switch (item.task?.type) {
    case "Synonyms": return `Choose the closest meaning to: ${prompt}`;
    case "Definitions": return `Choose the word for this definition: ${prompt}`;
    case "Collocations": return `Choose the word that goes with: ${prompt}`;
    default: return prompt;
  }
}

/** Publish question content only; source learners and their past answers stay private. */
export function buildAptisMockMistakeReviewLiveItems(items, random = Math.random) {
  return items.map((item) => {
    const isGrammar = item.kind === "grammar";
    const sentence = isGrammar ? item.question?.prompt : vocabularyPrompt(item);
    const correctIndex = isGrammar
      ? String(item.question?.correctAnswer || "").charCodeAt(0) - 65
      : item.task?.options?.findIndex((option) => option.value === item.row?.correctAnswer);
    const originalOptions = isGrammar ? item.question?.options : item.task?.options?.map((option) => option.label);
    if (!item.key || !sentence?.trim() || !Array.isArray(originalOptions)
      || originalOptions.length < 2 || originalOptions.length > 10
      || originalOptions.some((option) => !String(option || "").trim())
      || !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= originalOptions.length) {
      throw new Error("One of the selected mock review questions is incomplete. Reload the students’ mistakes and try again.");
    }
    const options = shuffleGrammarItems(originalOptions.map((text, index) => ({
      text,
      correct: index === correctIndex,
    })), random);
    const answerIndex = options.findIndex((option) => option.correct);
    return {
      id: item.key,
      interactionType: "multiple-choice",
      sourceThemeTitle: isGrammar ? "Grammar" : `Vocabulary · ${item.task.type}`,
      sourceActivityTitle: `${item.mockTitle} · Question ${item.number}`,
      sentence,
      options: options.map((option) => option.text),
      answerIndex,
      explanations: options.map((_, index) => index === answerIndex ? item.explanation || "" : ""),
    };
  });
}
