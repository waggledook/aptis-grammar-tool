export const WRITING_GENERAL_SUBMISSION_TYPE = "writing_general_submission";
export const WRITING_GENERAL_GUEST_USER_ID = "__guest_aptis_writing_general__";
export const WRITING_GENERAL_GUEST_LABEL = "Guest (Aptis Writing General)";

function getDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (value instanceof Date) return value;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function stripHtmlToText(html = "") {
  if (typeof document === "undefined") {
    return String(html).replace(/<[^>]*>/g, " ");
  }

  const div = document.createElement("div");
  div.innerHTML = html;
  return div.innerText || div.textContent || "";
}

function countWords(text = "") {
  const matches = String(text).trim().match(/\S+/g);
  return matches ? matches.length : 0;
}

function getWordCountFromHtml(html = "") {
  return countWords(stripHtmlToText(html));
}

function getNonEmptyCount(items) {
  if (!Array.isArray(items)) return 0;
  return items.filter((item) => stripHtmlToText(item).trim()).length;
}

export function buildWritingGeneralSubmissionActivity(docSnap) {
  const data = docSnap.data() || {};
  const createdAt = getDate(data.createdAt);
  if (!createdAt) return null;

  const answers = data.answers || {};
  const part1Answers = Array.isArray(answers[1]) ? answers[1] : [];
  const part2Answer = typeof answers[2] === "string" ? answers[2] : "";
  const part3Answers = Array.isArray(answers[3]) ? answers[3] : [];
  const part4Answers = Array.isArray(answers[4]) ? answers[4] : [];

  const part1Answered = getNonEmptyCount(part1Answers);
  const part2Words = getWordCountFromHtml(part2Answer);
  const part3WordCounts = part3Answers.map((answer) => getWordCountFromHtml(answer));
  const part4WordCounts = part4Answers.map((answer) => getWordCountFromHtml(answer));
  const part3Answered = part3WordCounts.filter(Boolean).length;
  const part4Answered = part4WordCounts.filter(Boolean).length;
  const attemptedParts = [
    part1Answered > 0,
    part2Words > 0,
    part3Answered > 0,
    part4Answered > 0,
  ].filter(Boolean).length;
  const totalWords =
    part1Answers.reduce((sum, answer) => sum + getWordCountFromHtml(answer), 0) +
    part2Words +
    part3WordCounts.reduce((sum, count) => sum + count, 0) +
    part4WordCounts.reduce((sum, count) => sum + count, 0);

  return {
    id: `submission:${docSnap.id}`,
    userId: WRITING_GENERAL_GUEST_USER_ID,
    userEmail: WRITING_GENERAL_GUEST_LABEL,
    type: WRITING_GENERAL_SUBMISSION_TYPE,
    details: {
      submissionId: docSnap.id,
      attemptedParts,
      totalWords,
      part1Answered,
      part2Words,
      part3WordCounts,
      part4WordCounts,
      sourceCollection: "submissions",
    },
    createdAt,
  };
}

export function sortActivitiesByDateDesc(a, b) {
  return b.createdAt.getTime() - a.createdAt.getTime();
}
