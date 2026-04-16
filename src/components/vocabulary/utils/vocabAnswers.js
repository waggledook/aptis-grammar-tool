function splitAnswerOptions(answerStr) {
  return String(answerStr || "")
    .toLowerCase()
    .split(/[\/,]/g)
    .map((a) => a.trim())
    .filter(Boolean);
}

function swapFilmMovie(option) {
  const out = new Set([option]);

  if (/\bfilm\b/.test(option)) {
    out.add(option.replace(/\bfilm\b/g, "movie"));
  }
  if (/\bmovie\b/.test(option)) {
    out.add(option.replace(/\bmovie\b/g, "film"));
  }

  return [...out];
}

export function normalizeAnswers(answerStr) {
  const expanded = new Set();

  splitAnswerOptions(answerStr).forEach((option) => {
    swapFilmMovie(option).forEach((variant) => expanded.add(variant));
  });

  return [...expanded];
}

export function canonicalizeAnswer(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[-–—_\s]+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function isAcceptedAnswer(userAnswer, answerStr) {
  const user = canonicalizeAnswer(userAnswer);
  if (!user) return false;

  return normalizeAnswers(answerStr).some(
    (option) => canonicalizeAnswer(option) === user
  );
}
