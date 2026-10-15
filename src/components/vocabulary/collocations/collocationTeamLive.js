export const COLLOCATION_TEAM_GAME_TYPE = "collocation-team";
export const COLLOCATION_TEAM_ROTATION_SIZE = 3;
export const COLLOCATION_TEAM_REVIEW_SIZE = 5;
export const COLLOCATION_TEAM_ROUND_SECONDS = 45;

export function getCorrectWords(item) {
  return (item?.options || [])
    .filter((option) => option?.isCorrect)
    .map((option) => option.word);
}

export function evaluateCollocationSelection(item, selectedWords = []) {
  const selected = new Set(selectedWords);
  const uniqueWords = [...selected];
  const correctWords = getCorrectWords(item);
  const correct = new Set(correctWords);
  const selectedCorrect = uniqueWords.filter((word) => correct.has(word));
  const selectedWrong = uniqueWords.filter((word) => !correct.has(word));
  const missed = correctWords.filter((word) => !selected.has(word));

  const percentage = correctWords.length
    ? Math.round((selectedCorrect.length / correctWords.length) * 100)
    : 0;

  return {
    selectedWords: uniqueWords,
    selectedCorrect,
    selectedWrong,
    missed,
    isPerfect: selectedWrong.length === 0 && missed.length === 0,
    score: selectedCorrect.length,
    possibleScore: correctWords.length,
    percentage,
    points: percentage,
  };
}

function shuffled(items, random = Math.random) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function buildBalancedCollocationTeams(players, requestedCount, random = Math.random) {
  const playerList = shuffled(players || [], random);
  const safeCount = Math.max(1, Math.min(Number(requestedCount) || 1, Math.max(1, playerList.length)));
  const teams = {};
  const assignments = {};

  for (let index = 0; index < safeCount; index += 1) {
    const teamId = `team-${index + 1}`;
    teams[teamId] = {
      name: `Team ${index + 1}`,
      memberUids: [],
      captainOverrideUid: "",
    };
  }

  playerList.forEach((player, index) => {
    const teamId = `team-${(index % safeCount) + 1}`;
    teams[teamId].memberUids.push(player.uid);
    assignments[player.uid] = teamId;
  });

  return { teams, assignments };
}

export function getCollocationTeamCaptain(team, position) {
  const members = team?.memberUids || [];
  if (!members.length) return null;
  if (team?.captainOverrideUid && members.includes(team.captainOverrideUid)) {
    return team.captainOverrideUid;
  }
  const blockIndex = Math.floor(Math.max(0, Number(position) || 0) / COLLOCATION_TEAM_ROTATION_SIZE);
  return members[blockIndex % members.length];
}

export function getNextUnansweredIndex(answerMap, total) {
  for (let index = 0; index < total; index += 1) {
    if (!answerMap || !answerMap[index]) return index;
  }
  return total;
}

export function buildCollocationReviewIndexes(
  items,
  teamAnswers,
  limit = COLLOCATION_TEAM_REVIEW_SIZE,
  teamIds = Object.keys(teamAnswers || {})
) {
  const scores = (items || []).map((item, itemIndex) => {
    let errorCount = 0;
    let imperfectTeams = 0;

    teamIds.forEach((teamId) => {
      const answers = teamAnswers?.[teamId];
      const answer = answers?.[itemIndex];
      const evaluation = evaluateCollocationSelection(item, answer?.selectedWords || []);
      const errors = evaluation.missed.length + evaluation.selectedWrong.length;
      errorCount += errors;
      if (!evaluation.isPerfect) imperfectTeams += 1;
    });

    return { itemIndex, errorCount, imperfectTeams };
  });

  return scores
    .filter((entry) => entry.errorCount > 0)
    .sort((a, b) => (
      b.imperfectTeams - a.imperfectTeams ||
      b.errorCount - a.errorCount ||
      a.itemIndex - b.itemIndex
    ))
    .slice(0, limit)
    .map((entry) => entry.itemIndex);
}

export function collocationTeamTotalPoints(game, teamId) {
  const { isQuestion, isReview, itemIndex } = getCollocationLiveRound(game);
  return ["teamAnswers", "reviewAnswers"].reduce((total, answerRoot) => (
    total + Object.entries(game?.[answerRoot]?.[teamId] || {}).reduce((sum, [key, answer]) => {
      if (isQuestion && (answerRoot === "reviewAnswers") === isReview && Number(key) === itemIndex) return sum;
      return sum + evaluateCollocationSelection(game?.items?.[key], answer?.selectedWords || []).points;
    }, 0)
  ), 0);
}

export function getCollocationLiveRound(game) {
  const phase = game?.state?.phase || "lobby";
  const isReview = phase.startsWith("review-");
  const index = Number(isReview ? game?.state?.reviewIndex || 0 : game?.state?.questionIndex || 0);
  const itemIndex = isReview ? game?.state?.reviewItemIndexes?.[index] : index;
  return {
    phase,
    isReview,
    isQuestion: phase === "question" || phase === "review-question",
    isReveal: phase === "reveal" || phase === "review-reveal",
    index,
    itemIndex,
    item: game?.items?.[itemIndex],
    captainPosition: isReview ? (game?.items?.length || 0) + index : index,
  };
}

export function createCollocationRoundState(game, index, review, serverNow) {
  const itemIndex = review ? game?.state?.reviewItemIndexes?.[index] : index;
  if (!game?.items?.[itemIndex]) throw new Error("That collocation set could not be found.");
  const captainPosition = review ? game.items.length + index : index;
  const captainUids = Object.fromEntries(
    Object.entries(game.teams || {})
      .map(([teamId, team]) => [teamId, getCollocationTeamCaptain(team, captainPosition)])
      .filter(([, uid]) => uid)
  );
  return {
    phase: review ? "review-question" : "question",
    [review ? "reviewIndex" : "questionIndex"]: index,
    questionDuration: COLLOCATION_TEAM_ROUND_SECONDS,
    questionDeadline: serverNow + COLLOCATION_TEAM_ROUND_SECONDS * 1000,
    captainUids,
  };
}

export function collocationTeamName(game, teamId) {
  return game?.teams?.[teamId]?.name || teamId || "Team";
}
