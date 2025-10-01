// src/utils/speakingProgress.js
// Robust progress storage for Speaking parts (1–4).
// Uses Firebase when available + user signed in, and also mirrors to localStorage.

const KEY = (part) => `aptis_speaking_${part}_done`;

export async function loadSpeakingDone(part, fb, user) {
  // Try Firebase first (cross-device)
  try {
    if (user && fb?.fetchSpeakingCompletions) {
      // expected: returns Set<string> of completed ids for that part
      const set = await fb.fetchSpeakingCompletions(part);
      if (set && set.size != null) return set;
      // If backend returns array, normalize:
      if (Array.isArray(set)) return new Set(set);
    }
  } catch {}

  // Fallback to local storage
  try {
    const raw = localStorage.getItem(KEY(part)) || "[]";
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

export async function markSpeakingDone(part, ids, fb, user) {
  const unique = [...new Set(ids.filter(Boolean))];

  // Best-effort Firebase (cross-device)
  if (user && fb?.saveSpeakingCompletion) {
    try {
      for (const id of unique) {
        // expected signature: saveSpeakingCompletion(id: string, part?: string)
        await fb.saveSpeakingCompletion(id, part);
      }
    } catch {}
  }

  // Local mirror (so ticks survive reload even if offline)
  try {
    const cur = new Set(JSON.parse(localStorage.getItem(KEY(part)) || "[]"));
    unique.forEach((id) => cur.add(id));
    localStorage.setItem(KEY(part), JSON.stringify([...cur]));
    return cur; // handy to update UI immediately
  } catch {
    return null;
  }
}
