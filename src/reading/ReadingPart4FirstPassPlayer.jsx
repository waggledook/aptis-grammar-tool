import React, { useRef, useState } from "react";
import { CheckCircle2, Save, Send, Users } from "lucide-react";
import { saveReadingPart4FirstPassFinalAnswers, submitReadingPart4FirstPassResponse } from "../api/readingPart4FirstPass.js";
import Seo from "../components/common/Seo.jsx";
import { firstPassResponses, finalFirstPassAnswers, finalFirstPassScore } from "./readingPart4FirstPass.js";
import { ReadingPart4Headings, ReadingPart4LiveTask, ReadingPart4FullReview } from "./ReadingPart4LiveShared.jsx";
import { FirstPassHeader, FirstPassTimer, FirstPassParagraph, FirstPassExample, FirstPassHeadingOptions, FirstPassOwnIdea, FirstPassAnonymousIdeas, FirstPassRoundReasoning, FirstPassReviewNote } from "./ReadingPart4FirstPassShared.jsx";
import "./readingPart4FirstPass.css";

function readDraft(key) {
  try { return JSON.parse(window.localStorage.getItem(key)) || {}; } catch { return {}; }
}

export default function ReadingPart4FirstPassPlayer({ game, gameId, task, player, uid }) {
  const state = game.state;
  const phase = state.phase;
  const paragraph = task.paragraphs[Number(state.paragraphIndex) || 0];
  const storageKey = `readingPart4FirstPass:${gameId}:${uid}`;
  const [drafts, setDrafts] = useState(() => readDraft(storageKey));
  const [choices, setChoices] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [finalDraft, setFinalDraft] = useState(null);
  const [saveState, setSaveState] = useState("");
  const finalQueue = useRef(Promise.resolve());
  const saveVersion = useRef(0);
  const responses = firstPassResponses(player, paragraph.id);
  const ownIdea = responses.mainIdea?.text || drafts[paragraph.id] || "";
  const selectedIndex = responses.heading?.selectedIndex ?? (phase === "heading_choice" ? choices[paragraph.id] : undefined);
  const finalAnswers = finalDraft ?? finalFirstPassAnswers(task, player);
  const inRound = ["main_idea", "heading_choice", "paragraph_review"].includes(phase);

  function writeDraft(value) {
    const next = { ...drafts, [paragraph.id]: value };
    setDrafts(next);
    try { window.localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Submissions still work without local storage. */ }
  }

  async function submit(kind) {
    if (busy) return;
    setBusy(true); setError("");
    try { await submitReadingPart4FirstPassResponse({ gameId, paragraphId: paragraph.id, kind, ...(kind === "mainIdea" ? { text: ownIdea } : { selectedIndex }) }); }
    catch (cause) { setError(cause.message || "Your response could not be submitted. Please try again."); }
    finally { setBusy(false); }
  }

  function saveFinal(next) {
    setFinalDraft(next);
    setSaveState("saving");
    const version = ++saveVersion.current;
    // Serialize changes so a slow earlier request cannot overwrite a later choice.
    const request = finalQueue.current.catch(() => {}).then(() => saveReadingPart4FirstPassFinalAnswers({ gameId, taskId: task.id, answers: next }));
    finalQueue.current = request;
    request.then(() => { if (version === saveVersion.current) setSaveState("saved"); }).catch((cause) => {
      if (version === saveVersion.current) { setSaveState("error"); setError(cause.message || "Your final matches could not be saved."); }
    });
  }

  function changeFinal(paragraphId, value) {
    const next = { ...finalAnswers };
    if (value) next[paragraphId] = value;
    else delete next[paragraphId];
    saveFinal(next);
  }

  const ownGuidedScore = task.paragraphs.filter((item) => firstPassResponses(player, item.id).heading?.selectedIndex === item.correctOptionIndex).length;

  return <main className="sfp-page">
    <Seo title={`${task.title} · Reading Part 4 live`} description="Read each paragraph, express its main idea and then choose a heading in a teacher-paced classroom lesson." />
    <FirstPassHeader task={task} state={state} playerName={player.name || "Student"} />
    {phase === "lobby" && <section className="sfp-panel sfp-wait"><Users size={36} /><h2>You’re in, {player.name || "student"}.</h2><p>Your teacher will start with a worked example. For each new paragraph, explain the main idea before looking at the headings.</p></section>}
    {phase === "example" && <FirstPassExample task={task} />}
    {inRound && <>
      <FirstPassTimer state={state} />
      <FirstPassParagraph paragraph={paragraph} showEvidence={phase === "paragraph_review"} />
      {phase === "main_idea" && !responses.mainIdea ? <form className="sfp-panel sfp-main-idea-form" onSubmit={(event) => { event.preventDefault(); submit("mainIdea"); }}><label htmlFor="sfp-main-idea">{task.firstPass.prompt}</label><p className="sfp-muted">{task.firstPass.responseHint}</p><textarea id="sfp-main-idea" value={ownIdea} disabled={busy} maxLength={1000} rows={3} placeholder="It explains…" onChange={(event) => writeDraft(event.target.value)} /><div><span>{ownIdea.trim() ? ownIdea.trim().split(/\s+/).length : 0} words · your idea, in your own words</span><button type="submit" className="sfp-button sfp-primary" disabled={busy || !ownIdea.trim()}><Send size={16} />{busy ? "Submitting…" : "Submit main idea"}</button></div></form> : <FirstPassOwnIdea text={ownIdea} submitted={Boolean(responses.mainIdea)} />}
      {phase === "main_idea" && responses.mainIdea && <p className="sfp-saved"><CheckCircle2 size={18} />Main idea submitted. Your teacher will reveal the headings when the class is ready.</p>}
      {phase !== "main_idea" && <><FirstPassHeadingOptions paragraph={paragraph} selectedIndex={selectedIndex} onSelect={(index) => setChoices((current) => ({ ...current, [paragraph.id]: index }))} locked={busy || Boolean(responses.heading) || phase !== "heading_choice"} reveal={phase === "paragraph_review"} />{phase === "heading_choice" && !responses.heading && <button type="button" className="sfp-button sfp-primary" disabled={busy || !Number.isInteger(selectedIndex)} onClick={() => submit("heading")}><Send size={16} />{busy ? "Submitting…" : "Submit heading"}</button>}{phase === "heading_choice" && responses.heading && <p className="sfp-saved"><CheckCircle2 size={18} />Heading submitted. Wait for the answer reveal.</p>}</>}
      {phase === "paragraph_review" && <><FirstPassAnonymousIdeas game={game} paragraphId={paragraph.id} /><FirstPassRoundReasoning task={task} paragraph={paragraph} /></>}
    </>}
    {phase === "final_match" && <><FirstPassReviewNote task={task} /><div className="sfp-progress"><div><Save size={19} /><strong>{Object.keys(finalAnswers).length}/7 headings chosen</strong><span>{saveState === "saving" ? "Saving your latest choices…" : saveState === "error" ? "The last save failed. Retry below." : "Every choice saves automatically. Match against the original A–H bank."}</span></div>{saveState === "error" && <button className="sfp-button sfp-secondary" type="button" onClick={() => saveFinal(finalAnswers)}>Retry saving</button>}</div><ReadingPart4Headings task={task} /><FirstPassExample task={task} showModel={false} /><ReadingPart4LiveTask task={task} answers={finalAnswers} onChange={changeFinal} /></>}
    {phase === "review" && <><FirstPassReviewNote task={task} /><div className="sfp-callout"><strong>Final review match: {finalFirstPassScore(task, player)}/7</strong><p>This is practice after the guided rounds, not an independent exam-readiness score.</p></div><ReadingPart4Headings task={task} /><ReadingPart4FullReview task={task} playerAnswers={finalFirstPassAnswers(task, player)} showWhy /><div className="sfp-callout"><strong>Unused heading: {task.firstPass.unusedHeading}</strong><p>{task.firstPass.unusedExplanation}</p></div></>}
    {phase === "finished" && <section className="sfp-panel"><p className="sfp-kicker">Lesson complete</p><h2>From main ideas to headings</h2><FirstPassReviewNote task={task} /><div className="sfp-report-metrics"><div><strong>{ownGuidedScore}/7</strong><span>Guided heading rounds</span></div><div><strong>{finalFirstPassScore(task, player)}/7</strong><span>Final review match</span></div></div><p className="sfp-muted">Your written main ideas were used for discussion and were not automatically graded.</p><details className="sfp-final-revisit"><summary>Revisit the complete article and reasoning</summary><ReadingPart4Headings task={task} /><ReadingPart4FullReview task={task} playerAnswers={finalFirstPassAnswers(task, player)} showWhy /></details></section>}
    {error && <p className="sfp-error" role="alert">{error}</p>}
  </main>;
}
