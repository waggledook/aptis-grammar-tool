/* eslint-disable no-undef */
function canUseRelaxedPractice(session = {}, phase = "preparation") {
  if (session.relaxedPracticeRequiresLive !== true) return true;
  return phase === "live" || phase === "review";
}

module.exports = {canUseRelaxedPractice};
