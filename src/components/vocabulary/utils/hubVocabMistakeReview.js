import { getHubVocabActivity } from "../../../data/hubVocabularyActivities.js";
import { canonicalizeAnswer, normalizeAnswers } from "./vocabAnswers.js";

export const HUB_CHOICE_REVIEW_TYPES = new Set([
  "matching",
  "flag-match",
  "quick-choice",
  "gap-choice",
  "nationality-choice",
  "opposites-choice",
  "category-choice",
  "speaker-choice",
  "article-choice",
  "category-sort",
  "image-hotspot-match",
  "sentence-gap-choice",
  "clock-choice",
  "sequence-order",
]);

const ENTRY_ALIAS_ACTIVITY_TYPES = new Set([
  "matching",
  "flag-match",
  "quick-choice",
  "type-answer",
  "image-hotspot-match",
  "image-hotspot-type-answer",
  "sentence-gap-choice",
  "sentence-gap-type-answer",
  "clock-choice",
  "clock-type-answer",
]);

const GAP_ANSWER_ACTIVITY_TYPES = new Set([
  "cue-gap-type-answer",
  "gap-choice",
  "phrase-gap-fill",
]);

function normalizeList(value) {
  return (Array.isArray(value) ? value : value ? [value] : [])
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

function uniqueLabels(values) {
  const seen = new Set();
  return values.filter((value) => {
    const key = canonicalizeAnswer(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function withoutInitialArticle(value) {
  return String(value || "").trim().replace(/^(?:a|an|the)\s+/i, "");
}

export function promptRevealsAnswer(prompt, correctAnswer) {
  const promptKey = canonicalizeAnswer(withoutInitialArticle(prompt));
  if (!promptKey) return false;

  return normalizeAnswers(correctAnswer).some(
    (answer) => canonicalizeAnswer(withoutInitialArticle(answer)) === promptKey
  );
}

export function getHubSourceEntries(theme, activity) {
  if (!theme || !activity) return [];
  if (
    theme.id === "people-family"
    && (activity.id === "family-matching" || activity.id === "family-spelling")
  ) {
    return [...(theme.entries || []), ...(theme.familyEntries || [])];
  }
  const entries = activity.dataKey ? theme[activity.dataKey] : theme.entries;
  return Array.isArray(entries) ? entries : [];
}

export function findHubSourceContext(item) {
  if (item?.source !== "hub-textbook" || !item.topic || !item.setId) return null;
  const result = getHubVocabActivity(item.topic, item.setId);
  if (!result?.theme || !result.activity) return null;

  const preferredEntries = getHubSourceEntries(result.theme, result.activity);
  const preferredMatch = preferredEntries.find((entry) => entry?.id === item.itemId) || null;
  if (preferredMatch) return { ...result, entries: preferredEntries, entry: preferredMatch };

  const entry = Object.entries(result.theme)
    .filter(([key, value]) => key !== "activities" && Array.isArray(value))
    .flatMap(([, value]) => value)
    .find((candidate) => candidate?.id === item.itemId) || null;
  return entry ? { ...result, entries: preferredEntries, entry } : null;
}

export function getReviewAcceptedAnswers(item, sourceEntry) {
  const savedAnswers = normalizeList(item?.acceptedAnswers);
  const sourceAnswers = ENTRY_ALIAS_ACTIVITY_TYPES.has(item?.activityType)
    ? sourceEntry?.acceptedAnswers || []
    : GAP_ANSWER_ACTIVITY_TYPES.has(item?.activityType)
      ? sourceEntry?.gapAnswers || []
      : [];

  return [...new Set(
    [item?.correctAnswer, ...savedAnswers, ...sourceAnswers]
      .flatMap((answer) => normalizeAnswers(answer))
      .filter(Boolean)
  )];
}

export function isAcceptedReviewAnswer(userAnswer, acceptedAnswers) {
  const user = canonicalizeAnswer(userAnswer);
  return Boolean(user) && acceptedAnswers.some(
    (answer) => canonicalizeAnswer(answer) === user
  );
}

function getPrimaryLabel(entry, themeId) {
  if (themeId === "numbers") return entry?.term || "";
  return entry?.displayTerm || entry?.term || entry?.country || entry?.phrase || "";
}

function getStructuredAnswer(entry) {
  return entry?.answer || entry?.gapAnswers?.[0] || entry?.term || "";
}

function getChoiceAnswer(entry, theme, activityType) {
  if (!entry) return "";
  if (activityType === "matching" || activityType === "flag-match") {
    return entry.matchAnswer || getPrimaryLabel(entry, theme?.id);
  }
  if (activityType === "gap-choice") return entry.gapAnswers?.[0] || entry.term || "";
  if (activityType === "nationality-choice") return entry.nationality || "";
  if (activityType === "opposites-choice") return entry.opposite || "";
  if (activityType === "category-choice") return entry.category || "";
  if (activityType === "speaker-choice") {
    return entry.speaker === "teacher" ? "The teacher says it" : "You say it";
  }
  if (activityType === "article-choice") return entry.article || "";
  if (activityType === "sentence-gap-choice" || activityType === "clock-choice") {
    return getStructuredAnswer(entry);
  }
  if (activityType === "image-hotspot-match") return entry.term || "";
  if (activityType === "quick-choice") {
    if (entry.choiceAnswer) return entry.choiceAnswer;
    if (theme?.id === "numbers") return entry.term || "";
    if (entry.country) return entry.country;
    return entry.term || "";
  }
  return "";
}

function getHotspotRoundEntries(context) {
  const { activity, entry, entries } = context || {};
  const round = (activity?.rounds || []).find((candidate) => (
    (candidate.entryIds || []).includes(entry?.id)
    || (candidate.categories || []).includes(entry?.category)
  ));
  if (!round) return entries || [];
  return (entries || []).filter((candidate) => (
    (round.entryIds || []).includes(candidate.id)
    || (round.categories || []).includes(candidate.category)
  ));
}

function getSequenceEntries(context) {
  const { activity, entries } = context || {};
  if (Array.isArray(activity?.sequence) && activity.sequence.length) {
    const byId = new Map((entries || []).map((entry) => [entry.id, entry]));
    return activity.sequence.map((id) => byId.get(id)).filter(Boolean);
  }
  if ((entries || []).some((entry) => Number.isFinite(Number(entry.sequenceOrder)))) {
    return [...entries]
      .filter((entry) => Number.isFinite(Number(entry.sequenceOrder)))
      .sort((left, right) => Number(left.sequenceOrder) - Number(right.sequenceOrder));
  }
  return entries || [];
}

function getSourceChoiceLabels(context, activityType) {
  const { activity, entry, entries = [], theme } = context || {};
  if (!entry || !activity) return [];

  if (activityType === "speaker-choice") return ["The teacher says it", "You say it"];
  if (activityType === "article-choice") return ["a", "an"];
  if (activityType === "category-sort") {
    return (activity.categories || []).map((category) => category?.label).filter(Boolean);
  }
  if (activityType === "sequence-order") {
    return getSequenceEntries(context).map((_, index) => `Position ${index + 1}`);
  }

  const configured = normalizeList(entry.options);
  const correct = getChoiceAnswer(entry, theme, activityType);
  if (configured.length) return [correct, ...configured];

  const optionEntries = activityType === "image-hotspot-match"
    ? getHotspotRoundEntries(context)
    : entries;
  return optionEntries.map((candidate) => getChoiceAnswer(candidate, theme, activityType));
}

function getSourceCorrectOption(item, context, activityType) {
  const { activity, entry } = context || {};
  if (activityType === "category-sort") {
    const categoryId = entry?.[activity?.categoryKey || "category"];
    return activity?.categories?.find((category) => category.id === categoryId)?.label || item.correctAnswer || "";
  }
  if (activityType === "sequence-order") {
    const index = getSequenceEntries(context).findIndex((candidate) => candidate.id === entry?.id);
    return index >= 0 ? `Position ${index + 1}` : item.correctAnswer || "";
  }
  return getChoiceAnswer(entry, context?.theme, activityType) || item.correctAnswer || "";
}

function getOptionLimit(activityType, activity, sourceLabels) {
  if (["speaker-choice", "article-choice", "category-sort", "sequence-order"].includes(activityType)) {
    return sourceLabels.length;
  }
  if (["matching", "flag-match"].includes(activityType)) {
    return Math.max(2, Math.min(Number(activity?.itemLimit) || 8, sourceLabels.length));
  }
  if (activityType === "image-hotspot-match") return sourceLabels.length;
  return Math.max(2, Number(activity?.optionCount) || 4);
}

function rotateOptions(labels, seedValue) {
  if (labels.length < 2) return labels;
  const hash = [...String(seedValue || "review")]
    .reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 0);
  const offset = (hash % (labels.length - 1)) + 1;
  return [...labels.slice(offset), ...labels.slice(0, offset)];
}

export function getHubReviewChoice(item, context = findHubSourceContext(item)) {
  const activityType = item?.activityType || context?.activity?.type || "";
  const savedOptions = normalizeList(item?.reviewOptions);
  if (!HUB_CHOICE_REVIEW_TYPES.has(activityType) && !savedOptions.length) return null;

  const sourceLabels = savedOptions.length
    ? savedOptions
    : getSourceChoiceLabels(context, activityType);
  const correctLabel = String(
    item?.reviewCorrectOption
    || getSourceCorrectOption(item, context, activityType)
    || item?.correctAnswer
    || ""
  ).trim();
  const correctKey = canonicalizeAnswer(correctLabel);
  const uniqueSourceLabels = uniqueLabels(sourceLabels);
  let labels;
  if (savedOptions.length) {
    labels = uniqueLabels([...uniqueSourceLabels, correctLabel]);
  } else {
    const limit = getOptionLimit(activityType, context?.activity, uniqueSourceLabels);
    const distractors = uniqueSourceLabels.filter((label) => canonicalizeAnswer(label) !== correctKey);
    labels = rotateOptions(
      [correctLabel, ...distractors.slice(0, Math.max(1, limit - 1))].filter(Boolean),
      item?.itemId || item?.id
    );
  }

  if (!correctKey || labels.length < 2) return null;
  return {
    correctLabel,
    options: labels.map((label) => ({
      label,
      correct: canonicalizeAnswer(label) === correctKey,
    })),
  };
}

export function getHubReviewPrompt(item, context = findHubSourceContext(item)) {
  const { activity, entry, theme } = context || {};
  const activityType = item?.activityType || activity?.type || "";
  const savedPrompt = promptRevealsAnswer(item?.sentence, item?.correctAnswer)
    ? ""
    : String(item?.sentence || "").trim();

  if (activityType === "clock-choice" || activityType === "clock-type-answer") return "";
  if (activityType === "category-sort" && activity?.promptKey && entry?.[activity.promptKey]) {
    return entry[activity.promptKey];
  }
  if (activityType === "sentence-gap-choice" || activityType === "sentence-gap-type-answer") {
    return entry?.sentence || savedPrompt;
  }
  if (savedPrompt) return savedPrompt;
  if (["matching", "flag-match", "quick-choice", "image-hotspot-match", "image-hotspot-type-answer"].includes(activityType)) {
    if (entry?.matchPrompt) return entry.matchPrompt;
    if (entry?.image || entry?.flag4x3 || entry?.colorHex || entry?.visualLabel) return "";
  }
  if (activityType === "speaker-choice") return entry?.phrase || "";
  if (activityType === "article-choice") return entry?.term || "";
  if (activityType === "nationality-choice" || activityType === "nationality-type-answer") {
    return entry?.country || "";
  }
  if (activityType === "opposites-choice" || activityType === "opposite-type-answer") {
    return entry?.cueText || entry?.displayTerm || entry?.term || "";
  }
  if (activityType === "gap-choice" || activityType === "cue-gap-type-answer") {
    return entry?.cueText || entry?.term || "";
  }
  if (activityType === "sequence-order") return entry?.term || entry?.phrase || "";
  if (theme?.id === "numbers") return entry?.numeral || "";
  return entry?.country || entry?.cueText || entry?.term || entry?.phrase || "";
}

export function getHubReviewInstruction(item, context = findHubSourceContext(item), hasVisual = false) {
  const activityType = item?.activityType || context?.activity?.type || "";
  if (HUB_CHOICE_REVIEW_TYPES.has(activityType) || normalizeList(item?.reviewOptions).length) {
    return context?.activity?.prompt || "Choose the correct answer.";
  }
  if (activityType === "clock-type-answer") return "Look at the clock and type the time in words.";
  if (hasVisual) return context?.activity?.prompt || "Look at the clue and type the correct word or phrase.";
  return context?.activity?.prompt || "Type the missing word or phrase to complete each sentence.";
}
