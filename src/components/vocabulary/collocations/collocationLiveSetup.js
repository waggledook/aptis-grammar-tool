export function filterCollocationLiveItems(items, { levels, topic = "all", pattern = "all" }) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.itemId || seen.has(item.itemId) || item.status !== "approved") return false;
    if (!levels.includes(item.level) || (topic !== "all" && ![item.topic, ...(item.secondaryTopics || [])].includes(topic))) return false;
    if (pattern !== "all" && item.pattern !== pattern) return false;
    seen.add(item.itemId);
    return true;
  });
}

export function readCollocationLiveFilters(search, items) {
  const params = new URLSearchParams(search);
  const availableLevels = [...new Set(items.map((item) => item.level))].sort();
  const requestedLevels = params.has("levels") ? params.get("levels").split(",") : availableLevels;
  const topics = new Set(items.flatMap((item) => [item.topic, ...(item.secondaryTopics || [])]));
  const patterns = new Set(items.map((item) => item.pattern));
  return {
    levels: availableLevels.filter((level) => requestedLevels.includes(level)),
    topic: topics.has(params.get("topic")) ? params.get("topic") : "all",
    pattern: patterns.has(params.get("pattern")) ? params.get("pattern") : "all",
  };
}

function shuffle(items, random) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}

export function selectCollocationLiveItems(pool, selectedIds, count = 10, random = Math.random) {
  const available = new Set(pool.map((item) => item.itemId));
  const retained = [...new Set(selectedIds)].filter((id) => available.has(id));
  const size = Math.min(pool.length, Math.max(2, Math.floor(Number(count) || 10)));
  const remaining = pool.filter((item) => !retained.includes(item.itemId)).map((item) => item.itemId);
  return [...retained, ...shuffle(remaining, random)].slice(0, size);
}

export function createCollocationLiveItems(pool, selectedIds, random = Math.random) {
  const byId = new Map(pool.map((item) => [item.itemId, item]));
  return [...new Set(selectedIds)].flatMap((id) => {
    const item = byId.get(id);
    return item ? [{ ...item, options: shuffle(item.options, random) }] : [];
  });
}
