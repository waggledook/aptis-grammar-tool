export const COLLOCATION_TEAM_GAME_TYPE = "collocation-team";
export const COLLOCATION_TEAM_ROTATION_SIZE = 3;
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

export function buildCollocationTeamReviews(game) {
  const reviewItemIndexesByTeam = Object.fromEntries(
    Object.entries(game?.teams || {})
      .filter(([, team]) => (team.memberUids || []).length > 0)
      .map(([teamId]) => [teamId, (game.items || [])
        .map((item, index) => (
          evaluateCollocationSelection(item, game.teamAnswers?.[teamId]?.[index]?.selectedWords || []).missed.length
            ? index
            : null
        ))
        .filter((index) => index !== null)])
  );
  return {
    reviewMode: "personalised",
    reviewItemIndexesByTeam,
    reviewRoundCount: Math.max(0, ...Object.values(reviewItemIndexesByTeam).map((indexes) => indexes.length)),
  };
}

export function getCollocationTeamReviewItem(game, teamId, itemIndex) {
  const originalItem = game?.items?.[itemIndex];
  if (!originalItem) return null;
  const originalResult = evaluateCollocationSelection(
    originalItem,
    game?.teamAnswers?.[teamId]?.[itemIndex]?.selectedWords || []
  );
  const masteredWords = new Set(originalResult.selectedCorrect);
  return {
    ...originalItem,
    options: originalItem.options.filter((option) => !masteredWords.has(option.word)),
    previouslyFound: masteredWords.size,
    originalTargetCount: originalResult.possibleScore,
  };
}

export function evaluateCollocationTeamAnswer(game, teamId, itemIndex, selectedWords = [], review = false) {
  const originalItem = game?.items?.[itemIndex];
  if (!review || game?.state?.reviewMode !== "personalised") {
    return evaluateCollocationSelection(originalItem, selectedWords);
  }
  const reviewItem = getCollocationTeamReviewItem(game, teamId, itemIndex);
  const result = evaluateCollocationSelection(reviewItem, selectedWords);
  const originalResult = evaluateCollocationSelection(originalItem, game?.teamAnswers?.[teamId]?.[itemIndex]?.selectedWords || []);
  const improvedPercentage = originalResult.possibleScore
    ? Math.round(((originalResult.score + result.score) / originalResult.possibleScore) * 100)
    : 0;
  return {
    ...result,
    // Recovered collocations top up the original card to at most 100 points.
    points: Math.max(0, Math.min(100, improvedPercentage) - originalResult.percentage),
  };
}

export function collocationTeamTotalPoints(game, teamId) {
  const { isQuestion, isReview, itemIndex } = getCollocationLiveRound(game, teamId);
  return ["teamAnswers", "reviewAnswers"].reduce((total, answerRoot) => (
    total + Object.entries(game?.[answerRoot]?.[teamId] || {}).reduce((sum, [key, answer]) => {
      if (isQuestion && (answerRoot === "reviewAnswers") === isReview && Number(key) === itemIndex) return sum;
      return sum + evaluateCollocationTeamAnswer(game, teamId, Number(key), answer?.selectedWords || [], answerRoot === "reviewAnswers").points;
    }, 0)
  ), 0);
}

export function getCollocationLiveRound(game, teamId) {
  const phase = game?.state?.phase || "lobby";
  const isReview = phase.startsWith("review-");
  const index = Number(isReview ? game?.state?.reviewIndex || 0 : game?.state?.questionIndex || 0);
  const isPersonalisedReview = isReview && game?.state?.reviewMode === "personalised";
  const reviewIndexes = isPersonalisedReview
    ? game?.state?.reviewItemIndexesByTeam?.[teamId] || []
    : game?.state?.reviewItemIndexes || [];
  const itemIndex = isReview ? reviewIndexes[index] : index;
  const item = isPersonalisedReview
    ? getCollocationTeamReviewItem(game, teamId, itemIndex)
    : game?.items?.[itemIndex];
  return {
    phase,
    isReview,
    isPersonalisedReview,
    isQuestion: phase === "question" || phase === "review-question",
    isReveal: phase === "reveal" || phase === "review-reveal",
    index,
    itemIndex,
    item,
    hasTask: !!item && getCorrectWords(item).length > 0,
    reviewCount: reviewIndexes.length,
    reviewRoundCount: isPersonalisedReview ? Number(game.state.reviewRoundCount) || 0 : reviewIndexes.length,
    captainPosition: isReview ? (game?.items?.length || 0) + index : index,
  };
}

export function createCollocationRoundState(game, index, review, serverNow) {
  const isPersonalisedReview = review && game?.state?.reviewMode === "personalised";
  const itemIndex = review ? game?.state?.reviewItemIndexes?.[index] : index;
  if (!isPersonalisedReview && !game?.items?.[itemIndex]) throw new Error("That collocation set could not be found.");
  const reviewItemKeysByTeam = isPersonalisedReview
    ? Object.fromEntries(Object.entries(game.teams || {}).flatMap(([teamId, team]) => {
      const nextIndex = game.state.reviewItemIndexesByTeam?.[teamId]?.[index];
      return (team.memberUids || []).length && game.items?.[nextIndex]
        ? [[teamId, String(nextIndex)]]
        : [];
    }))
    : {};
  if (isPersonalisedReview && !Object.keys(reviewItemKeysByTeam).length) {
    throw new Error("There are no more collocations to review.");
  }
  const captainPosition = review ? game.items.length + index : index;
  const captainUids = Object.fromEntries(
    Object.entries(game.teams || {})
      .filter(([teamId]) => !isPersonalisedReview || Object.hasOwn(reviewItemKeysByTeam, teamId))
      .map(([teamId, team]) => [teamId, getCollocationTeamCaptain(team, captainPosition)])
      .filter(([, uid]) => uid)
  );
  return {
    phase: review ? "review-question" : "question",
    [review ? "reviewIndex" : "questionIndex"]: index,
    questionDuration: COLLOCATION_TEAM_ROUND_SECONDS,
    questionDeadline: serverNow + COLLOCATION_TEAM_ROUND_SECONDS * 1000,
    captainUids,
    ...(isPersonalisedReview ? { reviewItemKeysByTeam } : {}),
  };
}

export function collocationTeamName(game, teamId) {
  return game?.teams?.[teamId]?.name || teamId || "Team";
}
