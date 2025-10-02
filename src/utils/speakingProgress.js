// src/utils/speakingProgress.js
// Robust progress storage for Speaking parts (1–4).
// Uses Firebase when available + user signed in, and also mirrors to localStorage.

const KEY = (part) => `aptis_speaking_${part}_done`;

/**
 * Normalize IDs coming from the server.
 * Accepts "partX:<id>" or just "<id>" and returns a Set of plain "<id>" strings.
 * Only strips the namespace if it matches the requested part.
 */
function normalizeIds(part, incoming) {
  const arr = Array.isArray(incoming) ? incoming : Array.from(incoming || []);
  return new Set(
    arr.map((s) => {
      if (typeof s !== "string") return s;
      const idx = s.indexOf(":");
      if (idx > -1) {
        const ns = s.slice(0, idx);
        const id = s.slice(idx + 1);
        return ns === part ? id : s;
      }
      return s;
    })
  );
}

/**
 * Load completion set for a speaking part.
 * Priority: Firebase (if signed in) → mirror to localStorage → return Set<string>
 * Fallback: localStorage only.
 */
export async function loadSpeakingDone(part, fb, user) {
  // Try Firebase first (cross-device)
  try {
    if (user && fb?.fetchSpeakingCompletions) {
      const server = await fb.fetchSpeakingCompletions(part);
      const norm = normalizeIds(part, server);
      // Mirror to local so ticks persist offline
      try {
        localStorage.setItem(KEY(part), JSON.stringify([...norm]));
      } catch {}
      return norm;
    }
  } catch {
    // ignore and fall back to local
  }

  // Fallback to local storage
  try {
    const raw = localStorage.getItem(KEY(part)) || "[]";
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

/**
 * Mark one or more IDs as completed for a speaking part.
 * If signed in, writes to Firebase (best-effort), then re-reads to avoid drift.
 * Always mirrors the resulting set to localStorage.
 * Returns Set<string> of completed IDs when possible, else null.
 */
export async function markSpeakingDone(part, ids, fb, user) {
  const unique = [...new Set((ids || []).filter(Boolean))];

  // Best-effort Firebase (cross-device)
  if (user && fb?.saveSpeakingCompletion) {
    try {
      for (const id of unique) {
        // expected signature: saveSpeakingCompletion(id: string, part?: string)
        await fb.saveSpeakingCompletion(id, part);
      }
      // Re-read from server to avoid drift and normalize
      const server = await fb.fetchSpeakingCompletions(part);
      const norm = normalizeIds(part, server);
      // Mirror to local
      try {
        localStorage.setItem(KEY(part), JSON.stringify([...norm]));
      } catch {}
      return norm;
    } catch {
      // If server write fails, we still mirror locally as a fallback below
    }
  }

  // Local mirror (so ticks survive reload even if offline/guest)
  try {
    const cur = new Set(JSON.parse(localStorage.getItem(KEY(part)) || "[]"));
    unique.forEach((id) => cur.add(id));
    localStorage.setItem(KEY(part), JSON.stringify([...cur]));
    return cur; // handy to update UI immediately
  } catch {
    return null;
  }
}

export default {
  loadSpeakingDone,
  markSpeakingDone,
};
