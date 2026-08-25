export const EXAM_DURATION_SECONDS = 50 * 60;
export const TIMER_END_KEY = 'aptis-writing-end-time';

export function getTimerKey(mockId) {
  return mockId ? `${TIMER_END_KEY}:${mockId}` : TIMER_END_KEY;
}

export function getStoredEndTime(mockId) {
  const rawValue = localStorage.getItem(getTimerKey(mockId));
  const parsedValue = Number(rawValue);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null;
}

export function resetExamTimer(mockId) {
  const endTime = Date.now() + EXAM_DURATION_SECONDS * 1000;
  localStorage.setItem(getTimerKey(mockId), String(endTime));
  return endTime;
}

export function getOrCreateExamEndTime(mockId) {
  const storedEndTime = getStoredEndTime(mockId);
  if (storedEndTime) {
    return storedEndTime;
  }

  return resetExamTimer(mockId);
}

export function getRemainingSeconds(endTime) {
  const remainingMs = endTime - Date.now();
  return Math.max(0, Math.round(remainingMs / 1000));
}

export function clearExamTimer(mockId) {
  localStorage.removeItem(getTimerKey(mockId));
}
