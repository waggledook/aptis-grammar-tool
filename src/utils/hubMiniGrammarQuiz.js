import { HUB_GRAMMAR_ACTIVITIES } from "../data/hubGrammarActivities.js";
import { shuffleGrammarItems } from "../components/grammar/aptisGrammarLive.js";
import { buildHubGrammarReviewLiveItems } from "./hubGrammarMistakes.js";

export const HUB_MINI_GRAMMAR_QUIZ_MAX_QUESTIONS = 50;
export const HUB_MINI_GRAMMAR_QUESTION_TYPES = [
  { id: "multiple-choice", label: "Multiple choice" },
  { id: "gap-fill", label: "Gap fill" },
  { id: "error-correction", label: "Error correction" },
  { id: "word-order", label: "Word order" },
  { id: "adverb-placement", label: "Adverb placement" },
  { id: "comma-placement", label: "Comma placement" },
  { id: "audio-response", label: "Audio response" },
];

export function buildHubMiniGrammarQuestionBank(activities = HUB_GRAMMAR_ACTIVITIES) {
  const seen = new Set();
  return activities.flatMap((activity) => (activity.items || []).flatMap((question, index) => {
    const key = `${activity.id}:${question.id}`;
    if (!question.id || seen.has(key)) return [];
    seen.add(key);
    return [{ key, activityId: activity.id, activityTitle: activity.title,
      level: activity.level, number: index + 1, question, studentIds: [] }];
  }));
}

export function getHubMiniGrammarQuestionText(item) {
  const question = item.question;
  return question.question || question.sentence
    || question.parts?.map((part) => typeof part === "string" ? part : "_____").join("")
    || question.baseSentence || question.tokens?.join(" / ") || question.prompt || "";
}

export function filterHubMiniGrammarQuestionBank(bank, { scope = "all", testIds = [], levels = [], search = "", type = "" } = {}) {
  const term = search.trim().toLowerCase();
  return bank.filter((item) => (scope === "all" || testIds.includes(item.activityId))
    && (!levels.length || levels.includes(item.level))
    && (!type || (item.question.type || "gap-fill") === type)
    && (!term || [item.activityTitle, item.level, item.question.prompt, getHubMiniGrammarQuestionText(item),
      ...(item.question.options || [])].join(" ").toLowerCase().includes(term)));
}

/** Generate a concrete set to inspect before starting, without repeating questions. */
export function generateHubMiniGrammarQuiz(pool, count, random = Math.random) {
  const unique = [...new Map(pool.map((item) => [item.key, item])).values()];
  const size = Math.max(0, Math.min(HUB_MINI_GRAMMAR_QUIZ_MAX_QUESTIONS, Math.floor(Number(count) || 0)));
  return shuffleGrammarItems(unique, random).slice(0, size);
}

export function toggleHubMiniGrammarQuizItem(keys, key, maximum = HUB_MINI_GRAMMAR_QUIZ_MAX_QUESTIONS) {
  if (keys.includes(key)) return keys.filter((value) => value !== key);
  return keys.length < maximum ? [...keys, key] : keys;
}

export function getHubMiniGrammarQuestionAnswer(item) {
  const [liveItem] = buildHubGrammarReviewLiveItems([item], () => 0);
  return { answer: liveItem.answer || liveItem.options[liveItem.answerIndex],
    explanation: liveItem.explanation || liveItem.explanations?.[liveItem.answerIndex] || "" };
}
