export function getSummaryMainIdeas(markingGuide = {}) {
  return (markingGuide.mainIdeas || [])
    .map((item) => (typeof item === "string" ? item : item?.idea))
    .filter(Boolean);
}

export function formatSummaryMarkingGuide(markingGuide = {}) {
  if (!markingGuide?.overarchingIdea) return "";

  const lines = [`Teacher information map - overarching idea: ${markingGuide.overarchingIdea}`];
  (markingGuide.mainIdeas || []).forEach((item, index) => {
    const idea = typeof item === "string" ? { idea: item } : item;
    if (!idea?.idea) return;
    lines.push(`Main idea ${index + 1} (${idea.id || `idea-${index + 1}`}): ${idea.idea}`);
    (idea.supportingDetails || []).forEach((detail) => {
      lines.push(`Acceptable supporting detail [${detail.source || "source"}]: ${detail.detail}`);
    });
  });
  (markingGuide.crossTextLinks || []).forEach((link) => {
    lines.push(`Cross-text relationship [${link.mainIdeaId || "general"}]: ${link.explanation}`);
  });
  (markingGuide.lowPriorityDetails || []).forEach((detail) => {
    lines.push(`Low-priority detail [${detail.source || "source"}]: ${detail.detail}`);
  });
  if (markingGuide.modelSummary) lines.push(`Model summary: ${markingGuide.modelSummary}`);
  (markingGuide.commonWeaknesses || []).forEach((weakness) => lines.push(`Common weakness: ${weakness}`));
  return lines.join("\n");
}
