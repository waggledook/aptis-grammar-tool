const DAY_MS = 86400000;

export const SPEAKING_WORKSHOP_PROGRAMME_START = "2026-09-04";

export const SPEAKING_WORKSHOP_PROGRAMME = [
  { week: 1, topicIds: ["relationships-family", "travel-transport"] },
  { week: 2, topicIds: ["home-neighbourhood", "technology-communication"] },
  { week: 3, topicIds: ["food-eating", "education-learning"] },
  { week: 4, topicIds: ["sport-entertainment", "work-careers"] },
];

function calendarParts(value = new Date()) {
  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
    }
  }
  const date = value instanceof Date ? value : new Date(value);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

function calendarDay(value) {
  const { year, month, day } = calendarParts(value);
  return Date.UTC(year, month - 1, day);
}

function formatCalendarDay(value) {
  const date = new Date(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getSpeakingWorkshopProgrammeWeek(value = new Date()) {
  const daysFromStart = Math.floor(
    (calendarDay(value) - calendarDay(SPEAKING_WORKSHOP_PROGRAMME_START)) / DAY_MS
  );
  // The programme is anchored on a Friday. Adding six makes the cycle
  // advance the following day, so Saturday begins the next workshop week.
  const weekOffset = Math.floor((daysFromStart + 6) / 7);
  const programmeIndex = ((weekOffset % SPEAKING_WORKSHOP_PROGRAMME.length) +
    SPEAKING_WORKSHOP_PROGRAMME.length) % SPEAKING_WORKSHOP_PROGRAMME.length;
  return SPEAKING_WORKSHOP_PROGRAMME[programmeIndex];
}

export function getNextSpeakingWorkshopDate(value = new Date()) {
  const dayValue = calendarDay(value);
  const dayOfWeek = new Date(dayValue).getUTCDay();
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
  return formatCalendarDay(dayValue + daysUntilFriday * DAY_MS);
}
