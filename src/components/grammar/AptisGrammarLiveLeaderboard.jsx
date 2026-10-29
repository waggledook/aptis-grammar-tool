import React from "react";
import { Trophy } from "lucide-react";
import { formatGrammarPercent } from "./aptisGrammarLiveResults.js";

export default function AptisGrammarLiveLeaderboard({ progress, myUid }) {
  const { standings, completedQuestionCount, roundCorrectCount, roundCorrectPercent } = progress;
  const me = standings.find((player) => player.uid === myUid);

  return <section className="ctl-panel agl-round-leaderboard" aria-labelledby="agl-round-leaderboard-heading">
    <div className="agl-round-leaderboard-heading">
      <h2 id="agl-round-leaderboard-heading"><Trophy size={20} aria-hidden="true" /> Leaderboard</h2>
      <span>{completedQuestionCount ? `After ${completedQuestionCount} round${completedQuestionCount === 1 ? "" : "s"}` : "First round in progress"}</span>
    </div>
    <div className="agl-round-accuracy" aria-live="polite">
      {me && <p><span>Your correct answers</span><strong>{completedQuestionCount ? formatGrammarPercent(me.correctPercent) : "—"}</strong><small>{me.correctCount} of {completedQuestionCount} completed questions</small></p>}
      {roundCorrectCount !== null && <p><span>Class correct this round</span><strong>{formatGrammarPercent(roundCorrectPercent)}</strong><small>{roundCorrectCount} of {standings.length} players</small></p>}
    </div>
    <div className="agl-round-leaderboard-table">
      <table>
        <caption>Ranked by points. Correct percentages include missed questions and update after each reveal.</caption>
        <thead><tr><th scope="col">Rank</th><th scope="col">Player</th><th scope="col">Points</th><th scope="col">Correct</th></tr></thead>
        <tbody>{standings.map((player) => <tr key={player.uid} className={player.uid === myUid ? "is-me" : ""}>
          <td>#{player.rank}</td>
          <th scope="row">{player.name}{player.uid === myUid && <small>you</small>}</th>
          <td>{player.score.toLocaleString("en-GB")}</td>
          <td>{completedQuestionCount ? formatGrammarPercent(player.correctPercent) : "—"}</td>
        </tr>)}</tbody>
      </table>
    </div>
  </section>;
}
