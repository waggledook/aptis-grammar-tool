import {
  getHubVocabActivityItems,
  getVisibleHubVocabThemes,
} from "../../data/hubVocabularyActivities.js";

export const TEXTBOOK_VOCAB_LIVE_GAME_TYPE = "textbook-vocabulary-live";

export const TEXTBOOK_VOCAB_LIVE_MODES = [
  {
    id: "multiple-choice",
    label: "Multiple choice",
    shortLabel: "Choose",
    description: "Choose one answer from up to four options.",
    defaultDuration: 20,
  },
  {
    id: "write",
    label: "Write",
    shortLabel: "Write",
    description: "Type the answer from memory. Capitalisation is ignored.",
    defaultDuration: 30,
  },
  {
    id: "matching",
    label: "Matching",
    shortLabel: "Match 4",
    description: "Match four prompts and answers in each round.",
    defaultDuration: 45,
  },
];

export function getTextbookVocabLiveMode(mode) {
  return TEXTBOOK_VOCAB_LIVE_MODES.find((entry) => entry.id === mode)
    || TEXTBOOK_VOCAB_LIVE_MODES[0];
}

export function normalizeTextbookVocabLiveAnswer(value = "") {
  return String(value)
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function isTextbookVocabLiveWrittenAnswerCorrect(value, acceptedAnswers = []) {
  const normalizedValue = normalizeTextbookVocabLiveAnswer(value);
  if (!normalizedValue) return false;
  return acceptedAnswers.some((answer) => normalizeTextbookVocabLiveAnswer(answer) === normalizedValue);
}

export function scoreTextbookVocabLiveAnswer({ correct, remainingMs, durationSeconds }) {
  if (!correct) return 0;
  const durationMs = Math.max(1, Number(durationSeconds) || 30) * 1000;
  const ratio = Math.max(0, Math.min(1, Number(remainingMs) / durationMs));
  return Math.round(300 + (700 * ratio));
}

const UNSUPPORTED_ACTIVITY_TYPES = new Set(["sequence-order"]);

function normalize(value = "") {
  return normalizeTextbookVocabLiveAnswer(value);
}

function uniqueStrings(values = []) {
  const seen = new Set();
  return values.filter((value) => {
    const key = normalize(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map(String);
}

function answerFor(entry, activity) {
  if (activity.type === "nationality-choice" || activity.type === "nationality-type-answer") {
    return entry.nationality || "";
  }
  if (activity.type === "opposites-choice" || activity.type === "opposite-type-answer") {
    return entry.opposite || "";
  }
  if (activity.type === "plural-type-answer") return entry.plural || "";
  if (activity.type === "article-choice") return entry.article || "";
  if (activity.type === "speaker-choice") {
    return entry.speaker === "teacher" ? "The teacher" : entry.speaker === "student" ? "The student" : "";
  }
  if (activity.type === "category-sort") return entry.category || "";
  if (activity.type === "matching" || activity.type === "flag-match") {
    const answerKey = activity.uniqueMatchAnswerKey || "matchAnswer";
    return entry[answerKey] || entry.answer || entry.term || entry.country || entry.phrase || "";
  }
  return (
    entry.answer ||
    entry.choiceAnswer ||
    entry.gapAnswers?.[0] ||
    entry.term ||
    entry.country ||
    entry.phrase ||
    entry.adjective ||
    ""
  );
}

function acceptedAnswersFor(entry, activity, answer) {
  if (activity.type === "speaker-choice") {
    return uniqueStrings([answer, String(answer).replace(/^the\s+/i, "")]);
  }
  if (activity.type === "category-sort" || activity.type === "article-choice" || activity.type === "opposites-choice" || activity.type === "opposite-type-answer") {
    return uniqueStrings([answer]);
  }
  if (activity.type === "cue-gap-type-answer" || activity.type === "sentence-gap-type-answer" || activity.type === "phrase-gap-fill") {
    return uniqueStrings([answer, ...(entry.gapAnswers || [])]);
  }
  return uniqueStrings([answer, ...(entry.acceptedAnswers || []), ...(entry.also ? [entry.also] : [])]);
}

function promptFor(entry, activity, answer) {
  if (entry.sentence) return entry.baseWord ? `${entry.sentence} (${entry.baseWord.toUpperCase()})` : entry.sentence;
  if (activity.type === "nationality-choice" || activity.type === "nationality-type-answer") {
    return `What is the nationality for ${entry.country}?`;
  }
  if (activity.type === "opposites-choice" || activity.type === "opposite-type-answer") {
    return `What is the opposite of ${entry.term || entry.cueText}?`;
  }
  if (activity.type === "plural-type-answer") return `What is the plural of ${entry.singular || entry.term}?`;
  if (activity.type === "article-choice") return `Which article comes before “${entry.term}”?`;
  if (activity.type === "speaker-choice") return `Who would normally say “${entry.phrase || entry.term}”?`;
  if (activity.type === "category-sort") return `Which group does “${entry.term || entry.phrase}” belong to?`;
  if (activity.type === "clock-choice" || activity.type === "clock-type-answer") {
    const hour = String(entry.hour ?? "").padStart(2, "0");
    const minute = String(entry.minute ?? "").padStart(2, "0");
    return `How do you say ${hour}:${minute}?`;
  }
  if (entry.gappedPhrase) return entry.gappedPhrase;
  if (entry.gapCueText) return entry.gapCueText;
  if ((activity.type === "flashcards" || activity.type === "flag-flashcards") && entry.flashcardPrompt) {
    return entry.flashcardPrompt;
  }
  if ((activity.type === "matching" || activity.type === "flag-match") && entry.matchPrompt) {
    return entry.matchPrompt;
  }
  if (entry.meaning) return entry.meaning;
  if (entry.definition) return entry.definition;
  if (entry.cueText && normalize(entry.cueText) !== normalize(answer)) return entry.cueText;
  if (entry.numeral) return `What is ${entry.numeral} in words?`;
  if (entry.hotspotNumber) return `Number ${entry.hotspotNumber}: which word is it?`;
  if (entry.image || entry.flag4x3 || entry.colorHex || activity.sceneImage) {
    return activity.question || activity.prompt || "Which word matches the picture?";
  }
  if (entry.imagePrompt) return entry.imagePrompt;
  if ((activity.type === "matching" || activity.type === "flag-match") && entry.country && normalize(entry.country) !== normalize(answer)) {
    return entry.country;
  }
  return "";
}

function promptContainsAnswer(prompt, answer) {
  const answerWords = normalize(answer).replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  if (answerWords.length < 3) return false;
  const promptWords = normalize(prompt).replace(/[^a-z0-9_ ]/g, " ").replace(/\s+/g, " ").trim();
  return ` ${promptWords} `.includes(` ${answerWords} `);
}

function questionImage(entry, activity) {
  return entry.image || entry.flag4x3 || activity.sceneImage || "";
}

function distractorAnswers(items, activity, entryId) {
  return items
    .filter((candidate) => candidate?.id !== entryId)
    .map((candidate) => answerFor(candidate, activity))
    .filter(Boolean);
}

function buildOptions(entry, activity, items, answer) {
  const configured = Array.isArray(entry.options) ? entry.options : [];
  const candidates = uniqueStrings([
    answer,
    ...configured,
    ...distractorAnswers(items, activity, entry.id),
  ]);
  const answerKey = normalize(answer);
  const correct = candidates.find((option) => normalize(option) === answerKey) || String(answer);
  const distractors = candidates.filter((option) => normalize(option) !== answerKey).slice(0, 3);
  if (distractors.length < 1) return [];
  return [correct, ...distractors];
}

function hash(value = "") {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function stableShuffle(values, seed) {
  return [...values].sort((left, right) => hash(`${seed}:${left}`) - hash(`${seed}:${right}`));
}

export function buildTextbookVocabLiveQuestions(user, { includeDrafts = false } = {}) {
  const themes = getVisibleHubVocabThemes(user, { includeDrafts });
  const questions = [];

  themes.forEach((theme) => {
    (theme.activities || []).forEach((activity) => {
      if (UNSUPPORTED_ACTIVITY_TYPES.has(activity.type)) return;
      const items = getHubVocabActivityItems(theme, activity);
      items.forEach((entry) => {
        const answer = answerFor(entry, activity);
        const prompt = promptFor(entry, activity, answer);
        if (
          !entry?.id ||
          !answer ||
          !prompt ||
          normalize(prompt) === normalize(answer) ||
          promptContainsAnswer(prompt, answer)
        ) return;
        const options = buildOptions(entry, activity, items, answer);
        if (options.length < 2) return;
        const shuffledOptions = stableShuffle(options, `${theme.id}:${activity.id}:${entry.id}`);
        const answerIndex = shuffledOptions.findIndex((option) => normalize(option) === normalize(answer));
        if (answerIndex < 0) return;

        questions.push({
          id: `${theme.id}:${activity.id}:${entry.id}`,
          interactionType: "multiple-choice",
          sourceThemeId: theme.id,
          sourceThemeTitle: theme.title,
          sourceActivityId: activity.id,
          sourceActivityTitle: activity.title,
          sourceActivityType: activity.type,
          level: theme.level,
          textbookRef: theme.textbookRef || "",
          sentence: prompt,
          text: prompt,
          image: questionImage(entry, activity),
          colorHex: entry.colorHex || "",
          imageAlt: `${theme.title} vocabulary question image`,
          options: shuffledOptions,
          answerIndex,
          answer: String(answer),
          acceptedAnswers: acceptedAnswersFor(entry, activity, answer),
          explanations: shuffledOptions.map((option, index) => (
            index === answerIndex
              ? entry.explanation || `“${answer}” is the correct answer.`
              : ""
          )),
        });
      });
    });
  });

  return questions;
}

export function setTextbookVocabLiveQuestionMode(question, interactionType) {
  const mode = getTextbookVocabLiveMode(interactionType).id;
  if (mode === "matching") return question;
  return {
    ...question,
    interactionType: mode,
  };
}

function matchingRoundFromQuestions(questions, roundIndex) {
  const ids = questions.map((question) => question.id);
  const matchOptions = stableShuffle(
    questions.map((question) => String(question.answer || question.options?.[question.answerIndex] || "")),
    `matching:${ids.join(":")}`
  );
  const themeTitles = uniqueStrings(questions.map((question) => question.sourceThemeTitle));
  const activityTitles = uniqueStrings(questions.map((question) => question.sourceActivityTitle));

  return {
    id: `matching:${ids.join("|")}`,
    interactionType: "matching",
    sourceThemeId: questions[0]?.sourceThemeId || "",
    sourceThemeTitle: themeTitles.length === 1 ? themeTitles[0] : "Mixed vocabulary banks",
    sourceActivityId: questions[0]?.sourceActivityId || "",
    sourceActivityTitle: activityTitles.length === 1 ? activityTitles[0] : "Four-item matching",
    sourceActivityType: "matching",
    level: uniqueStrings(questions.map((question) => question.level)).join(" · "),
    textbookRef: uniqueStrings(questions.map((question) => question.textbookRef)).join(" · "),
    sentence: `Match the four vocabulary items (round ${roundIndex + 1}).`,
    text: "Match each prompt to the correct answer.",
    matchOptions,
    pairs: questions.map((question) => {
      const answer = String(question.answer || question.options?.[question.answerIndex] || "");
      return {
        id: question.id,
        prompt: String(question.sentence || question.text || ""),
        image: String(question.image || ""),
        colorHex: String(question.colorHex || ""),
        imageAlt: String(question.imageAlt || "Vocabulary prompt"),
        answerIndex: matchOptions.findIndex((option) => normalize(option) === normalize(answer)),
      };
    }),
  };
}

export function buildTextbookVocabMatchingRounds(
  questions,
  { seed = null, maxRounds = Number.POSITIVE_INFINITY } = {}
) {
  const ordered = seed == null
    ? [...questions]
    : stableShuffle(questions.map((question) => question.id), String(seed))
      .map((id) => questions.find((question) => question.id === id))
      .filter(Boolean);
  const rounds = [];
  let current = [];
  let currentAnswers = new Set();

  for (const question of ordered) {
    const answer = String(question.answer || question.options?.[question.answerIndex] || "");
    const answerKey = normalize(answer);
    if (!answerKey || currentAnswers.has(answerKey)) continue;
    current.push(question);
    currentAnswers.add(answerKey);
    if (current.length === 4) {
      rounds.push(matchingRoundFromQuestions(current, rounds.length));
      if (rounds.length >= maxRounds) break;
      current = [];
      currentAnswers = new Set();
    }
  }
  return rounds;
}

function cleanLiveInteractionTypes(interactionTypes = []) {
  const validModes = new Set(TEXTBOOK_VOCAB_LIVE_MODES.map((mode) => mode.id));
  const cleaned = [...new Set(interactionTypes)].filter((mode) => validModes.has(mode));
  return cleaned.length ? cleaned : ["multiple-choice"];
}

function removeUsedQuestions(questions, usedIds) {
  return questions.filter((question) => !usedIds.has(question.id));
}

export function buildTextbookVocabRandomLiveItems(
  questions,
  { interactionTypes = ["multiple-choice"], count = 10, seed = Date.now() } = {}
) {
  const modes = cleanLiveInteractionTypes(interactionTypes);
  const requestedCount = Math.max(0, Number(count) || 0);
  let available = selectRandomTextbookVocabQuestions(questions, questions.length, `${seed}:questions`);
  const items = [];

  for (let index = 0; index < requestedCount; index += 1) {
    const cycle = Math.floor(index / modes.length);
    const cycleModes = stableShuffle(modes, `${seed}:modes:${cycle}`);
    const interactionType = cycleModes[index % modes.length];

    if (interactionType === "matching") {
      const round = buildTextbookVocabMatchingRounds(available, { maxRounds: 1 })[0];
      if (!round) break;
      const usedIds = new Set(round.pairs.map((pair) => pair.id));
      items.push({
        ...round,
        sentence: `Match the four vocabulary items (round ${items.length + 1}).`,
      });
      available = removeUsedQuestions(available, usedIds);
    } else {
      const question = available.shift();
      if (!question) break;
      items.push(setTextbookVocabLiveQuestionMode(question, interactionType));
    }
  }
  return items;
}

export function buildTextbookVocabCuratedLiveItems(questions, formatByQuestionId = {}) {
  const items = [];
  let pendingMatching = [];

  questions.forEach((question) => {
    const interactionType = getTextbookVocabLiveMode(formatByQuestionId[question.id]).id;
    if (interactionType !== "matching") {
      items.push(setTextbookVocabLiveQuestionMode(question, interactionType));
      return;
    }

    pendingMatching.push(question);
    const round = buildTextbookVocabMatchingRounds(pendingMatching, { maxRounds: 1 })[0];
    if (!round) return;
    const usedIds = new Set(round.pairs.map((pair) => pair.id));
    items.push({
      ...round,
      sentence: `Match the four vocabulary items (round ${items.length + 1}).`,
    });
    pendingMatching = removeUsedQuestions(pendingMatching, usedIds);
  });

  return items;
}

export function selectRandomTextbookVocabQuestions(questions, count, seed = Date.now()) {
  const safeCount = Math.max(0, Math.min(Number(count) || 0, questions.length));
  return stableShuffle(questions.map((question) => question.id), String(seed))
    .slice(0, safeCount)
    .map((id) => questions.find((question) => question.id === id))
    .filter(Boolean);
}
