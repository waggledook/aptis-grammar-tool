export const FIRST_PASS_PHASE_LABELS = {
  lobby: "Waiting room", example: "Worked example", main_idea: "Main idea first", heading_choice: "Choose a heading",
  paragraph_review: "Discuss the paragraph", final_match: "Full-bank review match", review: "Final review", finished: "Complete",
};

export function nextFirstPassState(task, state, now) {
  const index = Number(state.paragraphIndex) || 0;
  let phase;
  let paragraphIndex = index;
  switch (state.phase) {
    case "lobby": phase = "example"; paragraphIndex = 0; break;
    case "example": phase = "main_idea"; break;
    case "main_idea": phase = "heading_choice"; break;
    case "heading_choice": phase = "paragraph_review"; break;
    case "paragraph_review":
      phase = index < task.paragraphs.length - 1 ? "main_idea" : "final_match";
      if (phase === "main_idea") paragraphIndex += 1;
      break;
    case "final_match": phase = "review"; break;
    case "review": phase = "finished"; break;
    default: throw new Error("This first-pass lesson cannot move forward from its current stage.");
  }
  if (!task.paragraphs[paragraphIndex]) throw new Error("That paragraph is unavailable.");
  return { ...state, phase, paragraphIndex, phaseStartedAt: now, sharedMainIdeaUids: [], whyRevealed: false };
}

export function firstPassPlayers(game) {
  return Object.entries(game.players || {}).filter(([, player]) => player && typeof player === "object")
    .map(([uid, player]) => ({ ...player, uid })).sort((left, right) => (left.joinedAt || 0) - (right.joinedAt || 0));
}

export function firstPassResponses(player, paragraphId) {
  return player?.readingPart4FirstPass?.[paragraphId] || {};
}

export function firstPassClassSummary(task, players) {
  return task.paragraphs.map((paragraph) => {
    const responses = players.map((player) => firstPassResponses(player, paragraph.id));
    const optionCounts = paragraph.roundOptions.map((_, index) => responses.filter((response) => response.heading?.selectedIndex === index).length);
    const headingCount = optionCounts.reduce((total, count) => total + count, 0);
    return { paragraphId: paragraph.id, mainIdeaCount: responses.filter((response) => response.mainIdea?.text?.trim()).length,
      headingCount, optionCounts, correctCount: optionCounts[paragraph.correctOptionIndex], unanswered: players.length - headingCount };
  });
}

export function finalFirstPassAnswers(task, player) {
  return player?.readingPart4Submission?.taskId === task.id ? player.readingPart4Submission.answers || {} : {};
}

export function finalFirstPassScore(task, player) {
  const answers = finalFirstPassAnswers(task, player);
  return task.paragraphs.filter((paragraph) => answers[paragraph.id] === paragraph.answer).length;
}
