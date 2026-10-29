import React, { useMemo } from "react";
import { Crown, Medal, Trophy } from "lucide-react";
import { buildGrammarLiveStandings } from "./aptisGrammarLiveResults.js";
import "./aptisGrammarLiveResults.css";

export default function AptisGrammarPodium({ players, myUid = "" }) {
  const standings = useMemo(() => buildGrammarLiveStandings(players), [players]);
  const places = [1, 2, 3].map((rank) => ({ rank, players: standings.filter((player) => player.rank === rank) }))
    .filter((place) => place.players.length);
  const sharedPlace = places.some((place) => place.players.length > 1);

  return <section className="agl-podium-panel" aria-label="Final podium">
    <div className="agl-podium-intro"><Trophy size={26} aria-hidden="true" /><p className="agl-results-kicker">Activity complete</p><h2>Well played, everyone.</h2><p>A moment to celebrate your class.</p></div>
    {places.length ? <div className={`agl-podium agl-podium-count-${places.length}`}>
      {places.map((place) => <article key={place.rank} className={`agl-podium-place agl-podium-place-${place.rank}`} aria-label={`Place ${place.rank}`}>
        <div className="agl-podium-medal">{place.rank === 1 ? <Crown size={27} aria-hidden="true" /> : <Medal size={25} aria-hidden="true" />}</div>
        <div className="agl-podium-names">{place.players.map((player) => <strong key={player.uid}>{player.name}{player.uid === myUid && <small>you</small>}</strong>)}</div>
        <p className="agl-podium-points"><strong>{place.players[0].score.toLocaleString("en-GB")}</strong><span>points</span></p>
        <div className="agl-podium-step"><span>{place.rank}</span></div>
      </article>)}
    </div> : <p className="agl-results-empty">No students joined this activity.</p>}
    <p className="agl-podium-footer">{standings.length} student{standings.length === 1 ? "" : "s"}{sharedPlace ? " · Equal scores share a place." : " · Every question was a chance to learn."}</p>
  </section>;
}
