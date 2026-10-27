import { getHubVocabTheme } from "../data/hubVocabularyActivities.js";

function timestampToMs(value) {
  if (!value) return 0;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (typeof value?.toDate === "function") return value.toDate().getTime();
  if (value?.seconds) return value.seconds * 1000;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

export function resolveTextbookVocabAssignmentCompletion(assignment, progress = {}) {
  const assignedAt = timestampToMs(assignment?.createdAt);
  const themeId = assignment?.themeId || "";
  const activityId = assignment?.textbookActivityId || "";
  const theme = getHubVocabTheme(themeId);
  if (!theme) return { completed: false, completedAt: 0 };

  const activityIds = activityId
    ? theme.activities.filter((activity) => activity.id === activityId).map((activity) => activity.id)
    : theme.activities.map((activity) => activity.id);

  if (!activityIds.length) return { completed: false, completedAt: 0 };

  const completionTimes = activityIds.map((id) => {
    const row = progress[`${themeId}:${id}`];
    if (!row?.completed) return 0;
    return timestampToMs(row.updatedAt);
  });
  const completed = completionTimes.every((time) => time >= assignedAt && time > 0);

  return {
    completed,
    completedAt: completed ? Math.max(...completionTimes) : 0,
  };
}
