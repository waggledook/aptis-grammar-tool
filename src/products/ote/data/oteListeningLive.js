import { advancedListeningPart1Sets } from "./oteAdvancedListeningPart1.js";
import { advancedListeningPart2Sets } from "./oteAdvancedListeningPart2.js";
import { advancedListeningPart3Sets } from "./oteAdvancedListeningPart3.js";
import { generalListeningPart1Sets } from "./oteGeneralListeningPart1.js";
import { generalListeningPart2Sets } from "./oteGeneralListeningPart2.js";

export const OTE_LISTENING_LIVE_GAME_TYPE = "ote_listening_teacher";

function buildActivity(variant, part, set) {
  const id = `${variant}-part-${part}-${set.id}`;
  return {
    id,
    variant,
    part,
    level: set.level || (variant === "advanced" ? "B2-C1" : "A2-B2"),
    title: set.title,
    format:
      part === 1
        ? "part1"
        : part === 3
          ? "part3"
        : variant === "general"
          ? "general-part2"
          : "advanced-part2",
    set,
  };
}

const activities = [
  ...generalListeningPart1Sets.map((set) => buildActivity("general", 1, set)),
  ...advancedListeningPart1Sets.map((set) => buildActivity("advanced", 1, set)),
  ...generalListeningPart2Sets.map((set) => buildActivity("general", 2, set)),
  ...advancedListeningPart2Sets.map((set) => buildActivity("advanced", 2, set)),
  ...advancedListeningPart3Sets.map((set) => buildActivity("advanced", 3, set)),
];

export const oteListeningLiveActivities = Object.fromEntries(
  activities.map((activity) => [activity.id, activity])
);

export function getOteListeningLiveActivity(activityId) {
  return oteListeningLiveActivities[activityId] || null;
}

export function getOteListeningLiveActivityId(variant, part, setId) {
  return `${variant}-part-${part}-${setId}`;
}

export function getOteListeningItems(activity) {
  if (!activity) return [];
  if (activity.format === "part1") return activity.set.questions || [];
  if (activity.format === "general-part2") return activity.set.items || [];
  if (activity.format === "part3") return activity.set.opinions || [];
  return activity.set.gaps || [];
}
