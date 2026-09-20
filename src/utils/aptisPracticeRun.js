export function advanceAptisPracticeRun(run, event) {
  if (event.type === "reveal") {
    return {
      ...run,
      assisted: true,
      revealedBeforeFirstCheck: run.revealedBeforeFirstCheck || run.checkCount === 0,
    };
  }

  if (event.type !== "check") return run;
  const total = Math.max(0, Number(event.total) || 0);
  const score = Math.min(total, Math.max(0, Number(event.score) || 0));
  const isIndependentFirstCheck = run.checkCount === 0 && !run.revealedBeforeFirstCheck;
  return {
    ...run,
    checkCount: run.checkCount + 1,
    firstScore: isIndependentFirstCheck ? score : run.firstScore,
    firstTotal: isIndependentFirstCheck ? total : run.firstTotal,
    latestScore: score,
    latestTotal: total,
  };
}
