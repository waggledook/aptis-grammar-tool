import React, { useState } from "react";
import { ArrowLeft, Download, Headphones, Play, Printer, Radio } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { createListeningStrategyLiveGame } from "../../api/oteListeningStrategyLive.js";
import { getSitePath } from "../../siteConfig.js";
import { toast } from "../../utils/toast.js";
import { LISTENING_STRATEGY_PATH, LISTENING_STRATEGY_TITLE, listeningStrategyExtracts, listeningStrategyRecordingText, listeningStrategyRoutes, selectListeningStrategyExtracts } from "./data/oteListeningPart2Strategy.js";
import { currentListeningStrategyExtract, nextListeningStrategyState, STRATEGY_PHASE_LABELS } from "./utils/listeningPart2Strategy.js";
import { StrategyFeedback, StrategyNextStep, StrategyNotes, StrategyReflection, StrategyScript, StrategyStudentSheet } from "./OteListeningPart2StrategyShared.jsx";
import "./styles/listening-part2-strategy.css";

export default function OteListeningPart2StrategyLesson({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requested = selectListeningStrategyExtracts((params.get("extracts") || "").split(","));
  const [selectedIds, setSelectedIds] = useState(() => requested.length ? requested.map((item) => item.id) : listeningStrategyRoutes[1].extractIds);
  const [creating, setCreating] = useState(false);
  const [lesson, setLesson] = useState(null);
  const [showPrompts, setShowPrompts] = useState(true);
  const extracts = selectListeningStrategyExtracts(selectedIds);
  const partPath = getSitePath(`${nativeRoutes ? "" : "/ote"}/listening/advanced/part-2-note-completion`);
  const pagePath = getSitePath(`${nativeRoutes ? "" : "/ote"}${LISTENING_STRATEGY_PATH}`);
  const extract = currentListeningStrategyExtract(lesson);
  const selectedRoute = listeningStrategyRoutes.find((route) => route.extractIds.join() === extracts.map((item) => item.id).join());

  function toggleExtract(id) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function launchLive() {
    if (creating || !extracts.length) return;
    setCreating(true);
    try {
      const { gameId } = await createListeningStrategyLiveGame({ extractIds: selectedIds });
      navigate(getSitePath(`/live/ote-listening-strategy/host/${gameId}`));
    } catch (error) {
      toast(error.message || "Could not create the live lesson.");
    } finally {
      setCreating(false);
    }
  }

  function openStudentSheet() {
    const url = new URL(pagePath, window.location.origin);
    url.searchParams.set("print", "student");
    url.searchParams.set("extracts", extracts.map((item) => item.id).join(","));
    window.open(url.href, "_blank", "noopener,noreferrer");
  }

  function downloadScripts() {
    const url = URL.createObjectURL(new Blob([listeningStrategyRecordingText()], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "ote-advanced-listening-part-2-strategy-recording-scripts.txt";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  if (params.get("print") === "student") return <StrategyStudentSheet extracts={requested.length ? requested : listeningStrategyExtracts} onPrint={() => window.print()} />;

  return <main className="strategy-page">
    <Seo title="Finding the right detail · OTE Listening teacher lesson" description="A flexible teacher resource for OTE Advanced Listening Part 2, with short strategy extracts and a live classroom mode." />
    <button className="strategy-back" type="button" onClick={() => navigate(partPath)}><ArrowLeft size={18} /> Back to Part 2</button>
    <header className={`strategy-hero ${lesson ? "is-compact" : ""}`}><p>OTE Advanced Listening Part 2 · Teacher resource</p><h1>{LISTENING_STRATEGY_TITLE}</h1><p>Short listening practice in predicting, matching paraphrase and choosing the precise detail. Select the extracts your class needs, then move into a full task.</p><div className="strategy-badges"><span>8 independent extracts</span><span>10 gaps</span><span>Flexible timing</span><span>{listeningStrategyExtracts.every((item) => item.audioReady) ? "Recorded audio ready" : "Recorded audio pending"}</span></div></header>

    {!lesson ? <>
      <section className="strategy-section"><h2>Start with a route, then make it yours</h2><p>Times include two listens and brief feedback. Discussion, dictation and script work are optional. Every step is teacher controlled.</p><div className="strategy-route-grid">{listeningStrategyRoutes.map((route) => <button type="button" className={`strategy-route ${selectedRoute?.id === route.id ? "is-selected" : ""}`} aria-pressed={selectedRoute?.id === route.id} key={route.id} onClick={() => setSelectedIds(route.extractIds)}><span>{route.time}</span><h3>{route.title}</h3><p>{route.description}</p><small>{route.extractIds.length} extracts</small></button>)}</div></section>
      <div className="strategy-setup-grid"><section className="strategy-section"><div className="strategy-section-heading"><h2>Choose your extracts</h2><button type="button" onClick={() => setSelectedIds(extracts.length === listeningStrategyExtracts.length ? [] : listeningStrategyExtracts.map((item) => item.id))}>{extracts.length === listeningStrategyExtracts.length ? "Clear selection" : "Select all"}</button></div><div className="strategy-extract-list">{listeningStrategyExtracts.map((item) => <label className={`strategy-extract-choice ${selectedIds.includes(item.id) ? "is-selected" : ""}`} key={item.id}><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleExtract(item.id)} /><span className="strategy-extract-number">{item.number}</span><span><small>{item.stage} · {item.gaps.length === 1 ? "1 gap" : "2 gaps"}</small><strong>{item.title}</strong><span>{item.focus}</span></span></label>)}</div></section>
        <aside className="strategy-section strategy-launch"><p className="strategy-eyebrow">Your lesson</p><h2>{extracts.length} extracts · {extracts.reduce((sum, item) => sum + item.gaps.length, 0)} gaps</h2><p>{selectedRoute ? selectedRoute.time : "Custom selection · take the time you need"}</p><button className="strategy-primary" type="button" disabled={!extracts.length || creating} onClick={() => setLesson({ phase: "preview", extractIds: extracts.map((item) => item.id), extractIndex: 0 })}><Play size={18} /> Open classroom lesson</button><button className="strategy-primary strategy-live-button" type="button" disabled={!extracts.length || creating} onClick={launchLive}><Radio size={18} /> {creating ? "Creating room…" : "Run live"}</button><button type="button" disabled={!extracts.length} onClick={openStudentSheet}><Printer size={18} /> Student worksheet</button><p className="strategy-callout"><strong>{extracts.length && extracts.every((item) => item.audioReady) ? "Recordings ready for your selection." : "Ready for teacher-read delivery."}</strong> {extracts.some((item) => !item.audioReady) ? "Some recordings are pending. Read those scripts naturally, without stressing the answer. " : ""}Live students hear your voice or the recording from your shared screen.</p><p className="strategy-small">Teaching practice for the C1 answer format. These short extracts are not calibrated C1 test items and do not count towards learner completion.</p></aside>
      </div>
      <section className="strategy-section"><h2>Teacher notes and recording scripts</h2><p>Keep scripts private until students have listened twice. The early extracts provide a model; remove prompts for the final two. Predictions help students listen, but the recording supplies the evidence.</p><button type="button" onClick={downloadScripts}><Download size={18} /> Download all recording scripts</button><div className="strategy-teacher-bank">{listeningStrategyExtracts.map((item) => <details key={item.id}><summary>Extract {item.number} · {item.title}</summary><p><strong>Focus: </strong>{item.focus}</p>{item.gaps.map((gap) => <p key={gap.id}><strong>Predict: </strong>{gap.prediction}</p>)}<StrategyScript extract={item} /><StrategyFeedback extract={item} /><p className="strategy-small">Recording file: {item.id}.mp3</p></details>)}</div></section>
    </> : lesson.phase === "finished" ? <section className="strategy-section"><h2>Your selected extracts are complete</h2><StrategyReflection /><button type="button" onClick={() => setLesson(null)}>Choose another selection</button></section> : extract ? <section className="strategy-classroom">
      <div className="strategy-toolbar"><span>Extract {lesson.extractIndex + 1}/{selectListeningStrategyExtracts(lesson.extractIds).length} · {STRATEGY_PHASE_LABELS[lesson.phase]}</span><button type="button" onClick={() => setLesson(null)}>Back to setup</button><label><input type="checkbox" checked={showPrompts} onChange={(event) => setShowPrompts(event.target.checked)} /> Show guided prompts</label></div>
      <StrategyNotes extract={extract} />
      {lesson.phase === "preview" && showPrompts && extract.guided ? <p className="strategy-discussion">{extract.prompt}</p> : null}
      {["first", "second"].includes(lesson.phase) ? <div className="strategy-callout"><Headphones size={20} /><p>{lesson.phase === "first" ? "Try an answer on this listen." : "Check the specific point you were uncertain about."} {extract.audioReady ? "Play the recording below." : "The teacher reads the extract aloud. Recorded audio is pending."}</p>{extract.audioReady ? <audio controls src={extract.audioSrc} /> : null}<details><summary>Teacher script · open privately when reading aloud</summary><p>{extract.script}</p></details></div> : null}
      {lesson.phase === "compare" ? <p className="strategy-discussion">Compare your answers briefly. What evidence supports your choice? Decide what you need to check, without announcing the key.</p> : null}
      {lesson.phase === "script" ? <StrategyScript extract={extract} /> : null}
      {lesson.phase === "review" ? <StrategyFeedback extract={extract} /> : null}
      <div className="strategy-actions"><button className="strategy-primary" type="button" onClick={() => setLesson((state) => nextListeningStrategyState(state))}>{({ preview: "Begin first listening", first: "Compare answers", compare: "Begin second listening", second: "Reveal answer and evidence", script: "Reveal answer and evidence", review: lesson.extractIndex === selectListeningStrategyExtracts(lesson.extractIds).length - 1 ? "Finish selected extracts" : "Next extract" })[lesson.phase]}</button>{lesson.phase === "second" ? <button type="button" onClick={() => setLesson((state) => nextListeningStrategyState(state, "script"))}>Check unmarked script first</button> : null}<button type="button" onClick={() => setLesson((state) => nextListeningStrategyState(state, "skip"))}>Skip extract</button></div>
    </section> : null}
    <StrategyNextStep partPath={partPath} />
  </main>;
}
