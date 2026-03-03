import { TOPIC_DATA } from "../data/vocabTopics";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getAllTopicIds() {
  return Object.keys(TOPIC_DATA);
}

export function getTopicMeta(topicId) {
  const t = TOPIC_DATA?.[topicId];
  if (!t) return null;
  return {
    topicId,
    topicTitle: t.topicTitle || t.title || t.name || topicId,
  };
}

export function flattenFlashcardPool(selectedTopicIds) {
  const ids = selectedTopicIds?.length ? selectedTopicIds : getAllTopicIds();
  const pool = [];

  ids.forEach((topicId) => {
    const topic = TOPIC_DATA?.[topicId];
    if (!topic?.sets) return;

    topic.sets.forEach((set, setIndex) => {
      const setId = set.id ?? `set-${setIndex + 1}`;
      const setTitle = set.title ?? `Set ${setIndex + 1}`;

      // ✅ your schema: set.pairs
      (set.pairs || []).forEach((p, i) => {
        if (!p?.term || !p?.definition) return;

        pool.push({
          kind: "flashcard",
          key: `${topicId}__${setId}__p${i}`,
          topicId,
          topicTitle: topic.topicTitle || topic.title || topicId,
          setId,
          setTitle,
          term: p.term,
          definition: p.definition,
          image: p.image || null,
        });
      });
    });
  });

  return pool;
}

export function flattenReviewPool(selectedTopicIds) {
  const ids = selectedTopicIds?.length ? selectedTopicIds : getAllTopicIds();
  const pool = [];

  ids.forEach((topicId) => {
    const topic = TOPIC_DATA?.[topicId];
    if (!topic?.sets) return;

    topic.sets.forEach((set, setIndex) => {
      const setId = set.id ?? `set-${setIndex + 1}`;
      const setTitle = set.title ?? `Set ${setIndex + 1}`;

      // ✅ your schema: set.review OR set.practice
      const source =
        Array.isArray(set.review) ? set.review :
        Array.isArray(set.practice) ? set.practice :
        [];

      source.forEach((it, i) => {
        if (!it?.sentence || !it?.answer) return;

        pool.push({
          kind: "review",
          key: `${topicId}__${setId}__r${i}`,
          topicId,
          topicTitle: topic.topicTitle || topic.title || topicId,
          setId,
          setTitle,
          sentence: it.sentence,
          answer: it.answer,
          image: it.image || null,
        });
      });
    });
  });

  return pool;
}

export function buildSession(pool, count, { uniqueBy = "key" } = {}) {
  const raw = shuffle(pool);
  const seen = new Set();
  const out = [];

  for (const item of raw) {
    const signature =
      uniqueBy === "term"
        ? (item.term || "").toLowerCase().trim()
        : uniqueBy === "sentence"
        ? (item.sentence || "").toLowerCase().trim()
        : item.key;

    if (!signature) continue;
    if (seen.has(signature)) continue;

    seen.add(signature);
    out.push(item);

    if (out.length >= count) break;
  }

  return out;
}