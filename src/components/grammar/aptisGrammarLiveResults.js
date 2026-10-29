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

// Keep the active question out of both scores and accuracy until the host reveals it.
export function buildGrammarLiveProgress(game) {
  const items = Array.isArray(game?.items) ? game.items : [];
  const phase = game?.state?.phase || "lobby";
  const questionIndex = Math.max(0, Math.floor(Number(game?.state?.questionIndex) || 0));
  const completedQuestionCount = Math.min(items.length, phase === "finished" ? items.length
    : phase === "reveal" ? questionIndex + 1 : phase === "question" ? questionIndex : 0);
  const visiblePlayers = Object.fromEntries(participantEntries(game?.players).map(([uid, player]) => [uid, {
    ...player,
    score: (Number(player.score) || 0) - (phase === "question"
      ? Number(game?.answers?.[questionIndex]?.[uid]?.scoreDelta) || 0 : 0),
  }]));
  const isCorrect = (index, uid) => {
    const selectedIndex = game?.answers?.[index]?.[uid]?.selectedIndex;
    return Number.isInteger(selectedIndex) && selectedIndex >= 0
      && selectedIndex < (items[index]?.options?.length || 0)
      && selectedIndex === items[index].answerIndex;
  };
  const standings = buildGrammarLiveStandings(visiblePlayers).map((player) => {
    const correctCount = items.slice(0, completedQuestionCount)
      .reduce((count, _, index) => count + Number(isCorrect(index, player.uid)), 0);
    return { ...player, correctCount, correctPercent: percentage(correctCount, completedQuestionCount) };
  });
  const roundCorrectCount = phase === "reveal" && items[questionIndex]
    ? standings.filter((player) => isCorrect(questionIndex, player.uid)).length : null;
  return {
    standings,
    completedQuestionCount,
    roundCorrectCount,
    roundCorrectPercent: roundCorrectCount === null ? null : percentage(roundCorrectCount, standings.length),
  };
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
