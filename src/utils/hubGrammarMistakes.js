import { HUB_GRAMMAR_ACTIVITIES } from "../data/hubGrammarActivities.js";
import { shuffleGrammarItems } from "../components/grammar/aptisGrammarLive.js";
import { grammarReviewDateToMs } from "./grammarReview.js";

export const HUB_GRAMMAR_REVIEW_LIVE_SOURCE = "hub-mini-grammar-mistake-review";
export const HUB_GRAMMAR_QUIZ_LIVE_SOURCE = "hub-mini-grammar-custom-quiz";
export const HUB_GRAMMAR_REVIEW_LIVE_MAX_QUESTIONS = 50;

export function isHubMiniGrammarLiveSource(source) {
  return source === HUB_GRAMMAR_REVIEW_LIVE_SOURCE || source === HUB_GRAMMAR_QUIZ_LIVE_SOURCE;
}

export function normalizeHubGrammarAnswer(text) {
  return String(text || "")
    .trim().toLowerCase()
    .replace(/[\u2018\u2019\u201B\u0060\u00B4]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/^'m\b/g, "am")
    .replace(/^'re\b/g, "are")
    .replace(/^'ve\b/g, "have")
    .replace(/^'ll\b/g, "will")
    .replace(/^'s\b(?=\s+(used to|getting used to)\b)/g, "is")
    .replace(/\b(can)'t\b/g, "$1 not")
    .replace(/\b(won)'t\b/g, "$1 not")
    .replace(/\b([a-z]+)n't\b/g, "$1 not")
    .replace(/\b(i)'m\b/g, "$1 am")
    .replace(/\b([a-z]+)'re\b/g, "$1 are")
    .replace(/\b([a-z]+)'ve\b/g, "$1 have")
    .replace(/\b([a-z]+)'ll\b/g, "$1 will")
    .replace(/\b(i|you|we|they|he|she|it|that|there|here)'s used to\b/g, "$1 is used to")
    .replace(/\b(i|you|we|they|he|she|it|that|there|here)'s getting used to\b/g, "$1 is getting used to")
    .replace(/\b(what|who|where|when|why|how)'s\b/g, "$1 is")
    .replace(/\s+/g, " ")
    .replace(/\s+([?!.,])/g, "$1")
    .replace(/[?!.,]+$/g, "");
}

export function isHubGrammarMistake(item) {
  if (!item || item.hasAnswer === false) return false;
  if (Array.isArray(item.gaps)) {
    return item.gaps.some((gap) => gap.isCorrect === false && String(gap.answer || "").trim());
  }
  if (item.type === "word-order" && !item.selectedOrder?.length) return false;
  if (item.type === "audio-response" && !String(item.answer || "").trim()) return false;
  if (item.type === "adverb-placement" && !Object.keys(item.placements || {}).length) return false;
  return item.isCorrect === false;
}

/** Each question appears once, even across repeated attempts and several learners. */
export function buildHubGrammarMistakes(groups, activities = HUB_GRAMMAR_ACTIVITIES) {
  const activityMap = new Map(activities.map((activity) => [activity.id, activity]));
  const mistakes = new Map();
  for (const group of Array.isArray(groups) ? groups : []) {
    const studentId = String(group.student?.id || "");
    for (const submission of group.submissions || []) {
      const activity = activityMap.get(submission?.activityId);
      if (!activity || !Array.isArray(submission.items)) continue;
      for (const evaluated of submission.items) {
        if (!isHubGrammarMistake(evaluated)) continue;
        const number = activity.items.findIndex((item) => String(item.id) === String(evaluated.id));
        if (number < 0) continue;
        const key = `${activity.id}:${evaluated.id}`;
        if (!mistakes.has(key)) {
          mistakes.set(key, {
            key, activityId: activity.id, activityTitle: activity.title,
            level: activity.level, number: number + 1,
            question: activity.items[number], studentIds: [],
            latestMistakeAtMs: 0, studentMistakeAtMs: {},
          });
        }
        const mistake = mistakes.get(key);
        const completedAtMs = Number(submission.completedAtMs) || grammarReviewDateToMs(submission.createdAt);
        mistake.latestMistakeAtMs = Math.max(mistake.latestMistakeAtMs, completedAtMs);
        if (studentId) mistake.studentMistakeAtMs[studentId] = Math.max(mistake.studentMistakeAtMs[studentId] || 0, completedAtMs);
        if (studentId && !mistake.studentIds.includes(studentId)) mistake.studentIds.push(studentId);
      }
    }
  }
  return [...mistakes.values()];
}

/** Offer 5, 10, 15…; a smaller remaining pool can still be reviewed in full. */
export function hubGrammarReviewCounts(total, maximum = total) {
  const available = Math.max(0, Math.min(total, maximum));
  return Array.from({ length: Math.ceil(available / 5) }, (_, index) => (index + 1) * 5);
}

export function selectHubGrammarMistakes(items, count, prioritizeFrequent = false, random = Math.random) {
  const shuffled = shuffleGrammarItems(items, random);
  if (prioritizeFrequent) shuffled.sort((a, b) => b.studentIds.length - a.studentIds.length);
  return shuffled.slice(0, Math.max(0, Number(count) || 0));
}

export function buildHubGrammarReviewSession(items, studentCount = 0, { title = "Mini test mistake review", questionSource = "mistakes" } = {}) {
  const questions = items.map((item) => ({
    ...item.question, id: item.key,
    sourceLabel: `${item.activityTitle} · Question ${item.number}`,
  }));
  return {
    activity: {
      id: questionSource === "bank" ? "mini-grammar-custom-practice" : "mini-test-mistake-review", title, items: questions,
    },
    submission: { items: questions.map((item) => ({ id: item.id, isCorrect: false })) },
    testCount: new Set(items.map((item) => item.activityId)).size,
    studentCount,
    questionSource,
  };
}

function answersFor(question) {
  return (Array.isArray(question.acceptedAnswers) ? question.acceptedAnswers : [question.answer])
    .filter(Boolean).map(String);
}

/** Live rooms contain public question content, never source learners or past answers. */
export function buildHubGrammarReviewLiveItems(items, random = Math.random) {
  return items.map((item) => {
    const question = item.question;
    const base = {
      id: item.key, sourceActivityTitle: `${item.activityTitle} · Question ${item.number}`,
      sourceThemeTitle: "Mini grammar test", level: item.level || "",
      image: question.imageSrc || "", imageAlt: question.imageAlt || "Grammar question",
      audioSrc: question.audioSrc || "", explanation: question.explanation || "",
    };
    if (question.type === "multiple-choice") {
      const options = shuffleGrammarItems(question.options.map((text, index) => ({
        text, correct: index === question.answerIndex,
      })), random);
      const answerIndex = options.findIndex((option) => option.correct);
      return { ...base, interactionType: "multiple-choice",
        sentence: `${question.prompt}\n${question.question}`, options: options.map((option) => option.text),
        answerIndex, explanations: options.map((_, index) => index === answerIndex ? base.explanation : ""),
      };
    }
    let sentence;
    let acceptedAnswers;
    let acceptedAnswerGroups;
    switch (question.type) {
      case "error-correction":
        sentence = `${question.sentence}\nCheck “${question.highlighted}”. Write the correction, or “Correct” if it is already correct.`;
        acceptedAnswers = question.isCorrect ? ["Correct"] : (Array.isArray(question.correction)
          ? question.correction : String(question.correction || "").split("/").map((value) => value.trim()));
        break;
      case "word-order":
        sentence = `${question.prompt}\n${question.tokens.join(" / ")}\nWrite the complete sentence.`;
        acceptedAnswers = answersFor(question);
        break;
      case "adverb-placement":
        sentence = `${question.baseSentence}\nAdd: ${question.adverbs.join(", ")}. Write the complete sentence.`;
        acceptedAnswers = [question.correctSentence];
        break;
      case "comma-placement": {
        sentence = `${question.sentence}\nWrite the complete sentence with the correct commas, keeping the text in brackets.`;
        const positions = new Set(question.commaPositions || []);
        acceptedAnswers = [(question.words || question.sentence.split(/\s+/))
          .map((word, index) => `${word}${positions.has(index) ? "," : ""}`).join(" ")];
        break;
      }
      case "audio-response":
        sentence = question.prompt;
        acceptedAnswers = answersFor(question);
        break;
      default:
        acceptedAnswerGroups = question.gaps.map((gap) => gap.acceptedAnswers);
        sentence = `${question.prompt}\n${question.parts.map((part) => typeof part === "string" ? part : "_____").join("")}`;
        if (question.gaps.length > 1) sentence += "\nWrite the missing answers in order, separated by / .";
        acceptedAnswers = [acceptedAnswerGroups.map((answers) => answers[0]).join(" / ")];
        base.explanation = question.gaps.map((gap) => gap.feedback).filter(Boolean).join("\n");
    }
    if (!acceptedAnswers?.length || acceptedAnswers.some((answer) => !answer?.trim())) {
      throw new Error("A selected mini test question has no review answer. Reload the mistakes and try again.");
    }
    return { ...base, interactionType: "write", sentence,
      answer: acceptedAnswers[0], acceptedAnswers,
      ...(acceptedAnswerGroups ? { acceptedAnswerGroups } : {}),
    };
  });
}

export function isHubGrammarLiveAnswerCorrect(value, item) {
  if (item.acceptedAnswerGroups) {
    if (item.acceptedAnswerGroups.length === 1) {
      const normalized = normalizeHubGrammarAnswer(value);
      return !!normalized && item.acceptedAnswerGroups[0]
        .some((answer) => normalizeHubGrammarAnswer(answer) === normalized);
    }
    const answers = String(value).split("/").map(normalizeHubGrammarAnswer);
    return answers.length === item.acceptedAnswerGroups.length
      && item.acceptedAnswerGroups.every((group, index) => answers[index]
        && group.some((answer) => normalizeHubGrammarAnswer(answer) === answers[index]));
  }
  const normalized = normalizeHubGrammarAnswer(value);
  return !!normalized && (item.acceptedAnswers || [item.answer])
    .some((answer) => normalizeHubGrammarAnswer(answer) === normalized);
}
