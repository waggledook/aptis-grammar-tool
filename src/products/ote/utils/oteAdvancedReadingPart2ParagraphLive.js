export function getOtePart2ParagraphSelection(player, taskId, sourceLetter) {
  const record = player?.oteReadingPart2ParagraphSubmissions?.[sourceLetter];
  if (!record || record.taskId !== taskId || !record.submitted) return [];
  return Object.entries(record.selected || {})
    .filter(([, value]) => value)
    .map(([questionId]) => questionId);
}

export function getOtePart2ParagraphEvidence(task, support, sourceLetter) {
  return task.questions
    .filter((question) => question.answer === sourceLetter)
    .flatMap((question) => support[question.id]?.evidence || []);
}
