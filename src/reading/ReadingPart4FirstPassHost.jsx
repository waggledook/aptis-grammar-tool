import React, { useMemo, useState } from "react";
import { ArrowRight, Clipboard, Lightbulb, Play, Users } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router-dom";
import { advanceReadingPart4FirstPass, setReadingPart4FirstPassTiming, shareReadingPart4FirstPassResponses } from "../api/readingPart4FirstPass.js";
import { getSitePath } from "../siteConfig.js";
import Seo from "../components/common/Seo.jsx";
import { firstPassClassSummary, firstPassPlayers, firstPassResponses, finalFirstPassAnswers, finalFirstPassScore } from "./readingPart4FirstPass.js";
import { ReadingPart4Headings, ReadingPart4LiveTask, ReadingPart4FullReview } from "./ReadingPart4LiveShared.jsx";
import { FirstPassHeader, FirstPassTimer, FirstPassParagraph, FirstPassExample, FirstPassHeadingOptions, FirstPassAnonymousIdeas, FirstPassRoundReasoning, FirstPassReviewNote } from "./ReadingPart4FirstPassShared.jsx";
import "./readingPart4FirstPass.css";

export default function ReadingPart4FirstPassHost({ game, gameId, task }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copyState, setCopyState] = useState("");
  const state = game.state;
  const phase = state.phase;
  const paragraphIndex = Number(state.paragraphIndex) || 0;
  const paragraph = task.paragraphs[paragraphIndex];
  const players = useMemo(() => firstPassPlayers(game), [game]);
  const summary = useMemo(() => firstPassClassSummary(task, players), [task, players]);
  const stats = summary[paragraphIndex];
  const written = players.filter((player) => firstPassResponses(player, paragraph.id).mainIdea?.text);
  const finalComplete = players.filter((player) => Object.keys(finalFirstPassAnswers(task, player)).length === 7).length;
  const inRound = ["main_idea", "heading_choice", "paragraph_review"].includes(phase);
  const joinUrl = `${window.location.origin}${getSitePath(`/live/join?pin=${game.pin}`)}`;
  const nextLabels = { lobby: "Start worked example", example: "Open paragraph 1", main_idea: "Reveal the four headings", heading_choice: "Close choices and reveal the answer", paragraph_review: paragraphIndex < 6 ? `Open paragraph ${paragraphIndex + 2}` : "Open the complete article and master bank", final_match: "Close matching and open final review", review: "Finish lesson" };

  async function action(callback) {
    if (busy) return;
    setBusy(true); setError("");
    try { await callback(); } catch (cause) { setError(cause.message || "The lesson could not be updated. Please try again."); }
    finally { setBusy(false); }
  }
  function next() { action(() => advanceReadingPart4FirstPass({ gameId, expectedPhase: phase, expectedParagraphIndex: paragraphIndex })); }
  async function copyLink() {
    try { await navigator.clipboard.writeText(joinUrl); setCopyState("Copied"); } catch { setCopyState("Could not copy"); }
  }

  return <main className="sfp-page">
    <Seo title={`${task.title} · First-pass live lesson`} description="A teacher-paced Reading Part 4 main-idea lesson with seven scaffolded rounds and a final matching review." />
    <FirstPassHeader task={task} state={state} />
    {phase === "lobby" && <section className="sfp-panel sfp-lobby"><div className="sfp-pin"><span>Join with PIN</span><strong>{game.pin}</strong><QRCodeSVG value={joinUrl} size={140} bgColor="#ffffff" fgColor="#14243a" /><button type="button" className="sfp-button sfp-secondary" onClick={copyLink}><Clipboard size={16} />{copyState || "Copy join link"}</button></div><div><p className="sfp-kicker">Read · write · choose · discuss</p><h2>{players.length} student{players.length === 1 ? "" : "s"} joined</h2><div className="sfp-roster">{players.map((player) => <span key={player.uid}>{player.name || "Student"}</span>)}{!players.length && <p>Share the PIN or QR code to invite your class.</p>}</div><div className="sfp-timing-fields"><label>Main idea<select disabled={busy} value={state.mainIdeaSeconds || 75} onChange={(event) => action(() => setReadingPart4FirstPassTiming({ gameId, mainIdeaSeconds: Number(event.target.value), headingSeconds: state.headingSeconds || 25 }))}>{[60, 75, 90].map((seconds) => <option key={seconds} value={seconds}>{seconds} seconds</option>)}</select></label><label>Choose a heading<select disabled={busy} value={state.headingSeconds || 25} onChange={(event) => action(() => setReadingPart4FirstPassTiming({ gameId, headingSeconds: Number(event.target.value), mainIdeaSeconds: state.mainIdeaSeconds || 75 }))}>{[20, 25, 30].map((seconds) => <option key={seconds} value={seconds}>{seconds} seconds</option>)}</select></label></div><p className="sfp-muted">These are flexible prompts, not cut-offs. Every stage waits for you.</p><button type="button" className="sfp-button sfp-primary" disabled={busy || !players.length} onClick={next}><Play size={17} />{nextLabels.lobby}</button></div></section>}
    {phase === "example" && <><FirstPassExample task={task} /><div className="sfp-callout"><strong>Think about the whole paragraph</strong><p>Model the response above, then ask students to explain each new paragraph in their own words before they see any headings.</p></div></>}
    {inRound && <>
      <div className="sfp-progress"><div><Users size={19} /><strong>{phase === "main_idea" ? `${stats.mainIdeaCount}/${players.length} main ideas submitted` : `${stats.headingCount}/${players.length} heading choices submitted`}</strong><span>{phase === "main_idea" ? "The headings are still hidden." : phase === "heading_choice" ? "Students can still see their own main idea." : "Choices are closed. Discuss the overall message."}</span></div><FirstPassTimer state={state} /></div>
      <FirstPassParagraph paragraph={paragraph} showEvidence={phase === "paragraph_review"} />
      {phase === "main_idea" && <section className="sfp-panel"><h2>Before looking at headings…</h2><p>{task.firstPass.prompt}</p><p className="sfp-muted">{task.firstPass.responseHint}</p></section>}
      {phase !== "main_idea" && <FirstPassHeadingOptions paragraph={paragraph} reveal={phase === "paragraph_review"} stats={phase === "paragraph_review" ? stats : undefined} playerCount={players.length} />}
      {phase === "paragraph_review" && <><FirstPassAnonymousIdeas game={game} paragraphId={paragraph.id} /><details className="sfp-response-picker"><summary>Choose up to three anonymous examples</summary><div>{written.map((player, index) => <label key={player.uid}><input type="checkbox" disabled={busy || (!(state.sharedMainIdeaUids || []).includes(player.uid) && (state.sharedMainIdeaUids || []).length >= 3)} checked={(state.sharedMainIdeaUids || []).includes(player.uid)} onChange={() => action(() => shareReadingPart4FirstPassResponses({ gameId, uids: (state.sharedMainIdeaUids || []).includes(player.uid) ? state.sharedMainIdeaUids.filter((uid) => uid !== player.uid) : [...(state.sharedMainIdeaUids || []), player.uid] }))} /><span><small>Response {index + 1}</small>{firstPassResponses(player, paragraph.id).mainIdea.text}</span></label>)}{!written.length && <p>No main ideas were submitted for this round.</p>}</div></details><FirstPassRoundReasoning task={task} paragraph={paragraph} /></>}
    </>}
    {phase === "final_match" && <><div className="sfp-progress"><div><Lightbulb size={20} /><strong>{finalComplete}/{players.length} students have matched all seven paragraphs</strong><span>The complete article and the original A–H bank are now visible.</span></div></div><FirstPassReviewNote task={task} /><ReadingPart4Headings task={task} /><FirstPassExample task={task} showModel={false} /><ReadingPart4LiveTask task={task} disabled /></>}
    {phase === "review" && <><FirstPassReviewNote task={task} /><ReadingPart4Headings task={task} /><ReadingPart4FullReview task={task} players={players.map((player) => ({ ...player, id: player.uid }))} showWhy /><div className="sfp-callout"><strong>Unused heading: {task.firstPass.unusedHeading}</strong><p>{task.firstPass.unusedExplanation}</p></div></>}
    {phase === "finished" && <section className="sfp-panel"><p className="sfp-kicker">Lesson complete</p><h2>Main ideas before headings</h2><FirstPassReviewNote task={task} /><div className="sfp-report-metrics"><div><strong>{summary.reduce((total, round) => total + round.mainIdeaCount, 0)}</strong><span>Written main ideas · ungraded</span></div><div><strong>{players.length ? (players.reduce((total, player) => total + finalFirstPassScore(task, player), 0) / players.length).toFixed(1) : "0"}/7</strong><span>Class average · final review match</span></div></div><h3>Guided heading rounds · anonymous class results</h3><div className="sfp-report-rows">{summary.map((round) => <div key={round.paragraphId}><strong>Paragraph {round.paragraphId}</strong><span>{round.mainIdeaCount} {round.mainIdeaCount === 1 ? "main idea" : "main ideas"}</span><span>{round.correctCount}/{players.length} chose the correct heading · {players.length ? Math.round(round.correctCount / players.length * 100) : 0}%</span><small>{round.unanswered} unanswered</small></div>)}</div><Link className="sfp-button sfp-secondary" to={getSitePath("/teacher-resources/reading-part4-saving-smells")}>Back to the teacher lesson</Link></section>}
    {phase !== "lobby" && phase !== "finished" && <footer className="sfp-teacher-actions"><p>{["main_idea", "heading_choice"].includes(phase) ? "Wait for your class, or move on when you judge they are ready. Submissions close when you continue." : "Move on when the discussion is complete."}</p><button className="sfp-button sfp-primary" type="button" disabled={busy} onClick={next}>{busy ? "Updating…" : nextLabels[phase]}<ArrowRight size={17} /></button></footer>}
    {error && <p className="sfp-error" role="alert">{error}</p>}
  </main>;
}
