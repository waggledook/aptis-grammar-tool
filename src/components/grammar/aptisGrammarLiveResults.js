function participantEntries(players) {
  return Object.entries(players || {}).filter(([, player]) => player && typeof player === "object");
}

function percentage(count, total) {
  return total > 0 ? (count / total) * 100 : 0;
}

export function buildGrammarLiveStandings(players) {
  let rank = 0;
  let previousScore;
  return participantEntries(players)
    .map(([uid, player]) => ({ uid, name: String(player.name || "Player"), score: Number.isFinite(Number(player.score)) ? Math.max(0, Number(player.score)) : 0 }))
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name) || left.uid.localeCompare(right.uid))
    .map((player) => {
      if (player.score !== previousScore) rank += 1;
      previousScore = player.score;
      return { ...player, rank };
    });
}

// This report deliberately contains aggregates rather than student identifiers or names.
export function buildGrammarLiveReport(game) {
  const participants = participantEntries(game?.players).map(([uid]) => uid);
  const participantCount = participants.length;
  const items = Array.isArray(game?.items) ? game.items : [];
  const questions = items.map((item, index) => {
    const options = item.options || [];
    const optionCounts = Array(options.length).fill(0);
    participants.forEach((uid) => {
      const selectedIndex = game?.answers?.[index]?.[uid]?.selectedIndex;
      if (Number.isInteger(selectedIndex) && selectedIndex >= 0 && selectedIndex < options.length) optionCounts[selectedIndex] += 1;
    });
    const answered = optionCounts.reduce((total, count) => total + count, 0);
    const correct = optionCounts[item.answerIndex] || 0;
    const incorrect = answered - correct;
    const unanswered = participantCount - answered;
    return {
      index,
      item,
      answered,
      correct,
      incorrect,
      unanswered,
      correctPercent: percentage(correct, participantCount),
      incorrectPercent: percentage(incorrect, participantCount),
      unansweredPercent: percentage(unanswered, participantCount),
      options: options.map((text, optionIndex) => ({
        text, index: optionIndex, correct: optionIndex === item.answerIndex,
        count: optionCounts[optionIndex], percent: percentage(optionCounts[optionIndex], participantCount),
      })),
    };
  });
  const opportunities = participantCount * questions.length;
  const correct = questions.reduce((total, question) => total + question.correct, 0);
  const answered = questions.reduce((total, question) => total + question.answered, 0);
  return {
    participantCount,
    questionCount: questions.length,
    opportunities,
    correct,
    incorrect: answered - correct,
    answered,
    unanswered: opportunities - answered,
    accuracy: percentage(correct, opportunities),
    responseRate: percentage(answered, opportunities),
    questions,
  };
}

export function formatGrammarPercent(value) {
  return `${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 }).format(value)}%`;
}
