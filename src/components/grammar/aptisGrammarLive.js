export const APTIS_GRAMMAR_LIVE_GAME_TYPE = "aptis-grammar-quiz-live";
export const APTIS_GRAMMAR_LEVELS = ["A2", "B1", "B2", "C1"];
export const APTIS_GRAMMAR_MAX_QUESTIONS = 50;

export function grammarItemTags(item) {
  return [...new Set((Array.isArray(item.tags) ? item.tags : [item.tag])
    .filter(Boolean).map((tag) => String(tag).trim()).filter(Boolean))];
}

export function buildGrammarQuestionBank(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item.id || seen.has(item.id) || !item.sentence?.trim()
      || !Array.isArray(item.options) || item.options.length < 2 || item.options.length > 4
      || item.options.some((option) => !String(option).trim())
      || !Number.isInteger(item.answerIndex) || !item.options[item.answerIndex]) return false;
    seen.add(item.id);
    return true;
  }).map((item) => ({ ...item, tags: grammarItemTags(item) }));
}

export function filterGrammarQuestions(items, { levels = [], tags = [], search = "" } = {}) {
  const needle = search.trim().toLowerCase();
  return items.filter((item) => (!levels.length || levels.includes(item.level))
    && (!tags.length || grammarItemTags(item).some((tag) => tags.includes(tag)))
    && (!needle || [item.sentence, item.level, ...grammarItemTags(item), ...item.options]
      .join(" ").toLowerCase().includes(needle)));
}

export function shuffleGrammarItems(items, random = Math.random) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [next[index], next[target]] = [next[target], next[index]];
  }
  return next;
}

// Top-up keeps hand-picked items in their original order, including items outside the current filters.
export function generateGrammarQuiz(pool, count, existingIds = [], random = Math.random) {
  const target = Math.max(1, Math.min(APTIS_GRAMMAR_MAX_QUESTIONS, Math.floor(Number(count) || 10)));
  const existing = [...new Set(existingIds)].slice(0, APTIS_GRAMMAR_MAX_QUESTIONS);
  const excluded = new Set(existing);
  const uniquePool = pool.filter((item) => {
    if (excluded.has(item.id)) return false;
    excluded.add(item.id);
    return true;
  });
  return [...existing, ...shuffleGrammarItems(uniquePool, random)
    .slice(0, Math.max(0, target - existing.length)).map((item) => item.id)];
}

export function buildGrammarLiveItems(items, random = Math.random) {
  return items.map((item) => {
    const options = shuffleGrammarItems(item.options.map((text, index) => ({
      text, explanation: item.explanations?.[index] || "", correct: index === item.answerIndex,
    })), random);
    return {
      id: item.id,
      interactionType: "multiple-choice",
      sourceThemeTitle: grammarItemTags(item).join(" · "),
      sourceActivityTitle: "Aptis grammar",
      level: item.level,
      sentence: item.sentence,
      options: options.map((option) => option.text),
      answerIndex: options.findIndex((option) => option.correct),
      explanations: options.map((option) => option.explanation),
    };
  });
}
