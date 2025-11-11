// src/api/grammar.js
import itemsData from '../../scripts/grammar-items.json';

// Keep options ↔ explanations aligned when shuffling
function shuffleOptionsSafely(item) {
  const { options, explanations = [], answerIndex } = item;

  // Only shuffle when data is clearly aligned
  const canShuffle =
    Array.isArray(options) &&
    Array.isArray(explanations) &&
    options.length === explanations.length &&
    typeof answerIndex === 'number';

  if (!canShuffle) return item;

  // Pair up option + explanation + correctness
  const pairs = options.map((opt, i) => ({
    opt,
    exp: explanations[i],
    correct: i === answerIndex,
  }));

  // Fisher–Yates shuffle
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  const newAnswerIndex = pairs.findIndex(p => p.correct);

  return {
    ...item,
    options: pairs.map(p => p.opt),
    explanations: pairs.map(p => p.exp),
    answerIndex: newAnswerIndex,
  };
}

/**
 * Choose items, optionally preferring "unseen" ones for a user.
 * `seenIds` should be the IDs of items the user has already answered.
 */
function chooseItemsWithSeen({
  items,
  count,
  seenIds = [],
  preferNew = false,
}) {
  // No preference → original behaviour
  if (!preferNew || !seenIds.length) {
    return items
      .sort(() => Math.random() - 0.5)
      .slice(0, count)
      .map(shuffleOptionsSafely);
  }

  const seenSet = new Set(seenIds);

  const unseen = items.filter(it => !seenSet.has(it.id));
  const seen   = items.filter(it =>  seenSet.has(it.id));

  // Shuffle both buckets
  unseen.sort(() => Math.random() - 0.5);
  seen.sort(() => Math.random() - 0.5);

  const chosen = [];

  // Take as many unseen as we can
  for (let i = 0; i < unseen.length && chosen.length < count; i++) {
    chosen.push(unseen[i]);
  }

  // If we still need more, fill from seen
  for (let i = 0; i < seen.length && chosen.length < count; i++) {
    chosen.push(seen[i]);
  }

  return chosen.map(shuffleOptionsSafely);
}

/**
 * Fetches a random set of grammar items matching the given filters.
 *
 * @param {{
 *   levels?: string[],   // array of CEFR levels to include; empty = all levels
 *   tags?: string[],     // array of tags to include; empty = all tags
 *   count?: number       // number of items to return
 * }} params
 * @returns {Promise<Object[]>} Array of grammar items
 */
// src/api/grammar.js
export async function fetchItems({
  levels    = [],
  tags      = [],
  count     = 5,
  preferNew = false,
  seenIds   = [],
}) {
  // Normalise tags into an array on each item
  let items = itemsData.map(item => ({
    ...item,
    tags: Array.isArray(item.tags)
      ? item.tags
      : item.tag
        ? [item.tag]
        : [],
  }));

  if (levels.length) {
    items = items.filter(item => levels.includes(item.level));
  }

  if (tags.length) {
    items = items.filter(item =>
      item.tags.some(t => tags.includes(t))
    );
  }

  // Delegate to helper that can prefer unseen items
  return chooseItemsWithSeen({
    items,
    count,
    seenIds,
    preferNew,
  });
}


/**
 * Look up a batch of items by their document IDs
 * in your static JSON (preserving original order).
 *
 * @param {string[]} ids
 * @returns {Promise<Object[]>}
 */
export async function fetchItemsByIds(ids) {
  if (!ids.length) return [];

  // build a lookup map
  const all = itemsData.map(item => ({
    ...item,
    tags: Array.isArray(item.tags)
      ? item.tags
      : item.tag
        ? [item.tag]
        : []
  }));
  const lookup = all.reduce((map, itm) => {
    map[itm.id] = itm;
    return map;
  }, {});

  const chosen = ids.map(id => lookup[id]).filter(Boolean);
  // Shuffle options/explanations together so they always match
  return chosen.map(shuffleOptionsSafely);
}
