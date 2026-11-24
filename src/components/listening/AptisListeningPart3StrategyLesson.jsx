import React, { useEffect, useState } from "react";
import { Download, Headphones, Play, Printer, Radio } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Seo from "../common/Seo.jsx";
import { createOpinionStrategyLiveGame } from "../../api/aptisListeningOpinionStrategyLive.js";
import { getSitePath } from "../../siteConfig.js";
import { APTIS_OPINION_STRATEGY_PATH, APTIS_OPINION_STRATEGY_TITLE, aptisOpinionStrategyExtracts, aptisOpinionStrategyRecordingText, aptisOpinionStrategyRoutes, selectAptisOpinionStrategyExtracts } from "./aptisListeningPart3StrategyData.js";
import { currentOpinionStrategyExtract, nextOpinionStrategyState, OPINION_STRATEGY_PHASES } from "./aptisListeningPart3StrategyUtils.js";
import { StrategyFeedback, StrategyNextStep, StrategyOpinions, StrategyReflection, StrategyScript, StrategyStudentSheet } from "./AptisListeningPart3StrategyShared.jsx";
import "./aptisListeningPart3Strategy.css";

export default function AptisListeningPart3StrategyLesson() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requested = selectAptisOpinionStrategyExtracts((params.get("extracts") || "").split(","));
  const [selectedIds, setSelectedIds] = useState(() => requested.length ? requested.map((item) => item.id) : aptisOpinionStrategyRoutes[0].extractIds);
  const [lesson, setLesson] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const extracts = selectAptisOpinionStrategyExtracts(selectedIds);
  const extract = currentOpinionStrategyExtract(lesson);
  const route = aptisOpinionStrategyRoutes.find((item) => item.extractIds.join() === extracts.map((item) => item.id).join());
  const recordedCount = aptisOpinionStrategyExtracts.filter((item) => item.audioReady).length;
  const readCount = extracts.filter((item) => !item.audioReady).length;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [lesson?.phase, lesson?.extractIndex]);

  function toggleExtract(id) {
    setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

  function advance(action = "next") {
    setError("");
    setLesson((state) => nextOpinionStrategyState(state, action));
  }

  async function launchLive() {
    if (creating || !extracts.length) return;
    setCreating(true); setError("");
    try {
      const { gameId } = await createOpinionStrategyLiveGame({ extractIds: extracts.map((item) => item.id) });
      navigate(getSitePath(`/live/aptis-listening-strategy/host/${gameId}`));
    } catch (failure) {
      setError(failure.message || "Could not create the live lesson. Try again.");
    } finally { setCreating(false); }
  }

  function openStudentSheet() {
    const url = new URL(getSitePath(APTIS_OPINION_STRATEGY_PATH), window.location.origin);
    url.searchParams.set("print", "student");
    url.searchParams.set("extracts", extracts.map((item) => item.id).join(","));
    window.open(url.href, "_blank", "noopener,noreferrer");
  }

  function downloadScripts() {
    const url = URL.createObjectURL(new Blob([aptisOpinionStrategyRecordingText()], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = "aptis-listening-part-3-opinion-training-scripts.txt"; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  if (params.get("print") === "student") return <StrategyStudentSheet extracts={requested.length ? requested : aptisOpinionStrategyExtracts} onPrint={() => window.print()} />;

  return <main className="strategy-page opinion-strategy-page">
    <Seo title="Who thinks what? · Aptis Listening Part 3 opinion training" description="Short teacher-led conversations for identifying agreement, disagreement and opinions left unclear, with classroom and live modes." />
    <button className="strategy-back" type="button" onClick={() => navigate(getSitePath("/listening/parts/3"))}>Back to Listening Part 3</button>
    <header className={`strategy-hero ${lesson ? "is-compact" : ""}`}>
      <p>Aptis Listening Part 3 · Teacher resource</p><h1>{APTIS_OPINION_STRATEGY_TITLE}</h1>
      <p>Identify what each speaker really thinks. Work through short conversations about agreement, disagreement and views left unclear, then apply the same skills to a full task.</p>
      <div className="strategy-badges"><span>10 independent conversations</span><span>12 opinions</span><span>{recordedCount} recordings ready</span><span>Teacher-controlled stages</span></div>
    </header>
    {error ? <p className="strategy-error" role="alert">{error}</p> : null}

    {!lesson ? <>
      <section className="strategy-section"><h2>Choose a starting route</h2><p>Adjust the selection to suit your class. Times include two listens and brief feedback; discussion and transcript support are optional.</p>
        <div className="strategy-route-grid">{aptisOpinionStrategyRoutes.map((item) => <button type="button" className={`strategy-route ${route?.id === item.id ? "is-selected" : ""}`} aria-pressed={route?.id === item.id} key={item.id} onClick={() => setSelectedIds(item.extractIds)}><span>{item.time}</span><h3>{item.title}</h3><p>{item.description}</p><small>{item.extractIds.length} extracts</small></button>)}</div>
      </section>
      <div className="strategy-setup-grid">
        <section className="strategy-section"><div className="strategy-section-heading"><h2>Choose your extracts</h2><button type="button" onClick={() => setSelectedIds(extracts.length === aptisOpinionStrategyExtracts.length ? [] : aptisOpinionStrategyExtracts.map((item) => item.id))}>{extracts.length === aptisOpinionStrategyExtracts.length ? "Clear selection" : "Select all"}</button></div>
          <div className="strategy-extract-list">{aptisOpinionStrategyExtracts.map((item) => <label className={`strategy-extract-choice ${selectedIds.includes(item.id) ? "is-selected" : ""}`} key={item.id}>
            <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleExtract(item.id)} /><span className="strategy-extract-number">{item.number}</span>
            <span><small>{item.stage} · {item.statements.length === 1 ? "1 opinion" : "2 opinions"}</small><strong>{item.title}</strong><span className={item.audioReady ? "opinion-strategy-ready" : ""}>{item.audioReady ? "Recorded audio ready" : "Teacher-read · recording to follow"}</span><span>{item.focus}</span></span>
          </label>)}</div>
        </section>
        <aside className="strategy-section strategy-launch"><p className="strategy-eyebrow">Your lesson</p><h2>{extracts.length} extracts · {extracts.reduce((sum, item) => sum + item.statements.length, 0)} opinions</h2><p>{route ? route.time : "Custom selection · take the time you need"}</p>
          <button className="strategy-primary" type="button" disabled={!extracts.length || creating} onClick={() => { setError(""); setLesson({ phase: "preview", extractIds: extracts.map((item) => item.id), extractIndex: 0 }); }}><Play size={18} aria-hidden="true" /> Open classroom lesson</button>
          <button className="strategy-primary strategy-live-button" type="button" disabled={!extracts.length || creating} onClick={launchLive}><Radio size={18} aria-hidden="true" /> {creating ? "Creating room…" : "Run live"}</button>
          <button type="button" disabled={!extracts.length} onClick={openStudentSheet}><Printer size={18} aria-hidden="true" /> Student worksheet</button>
          <p className="strategy-callout">{readCount ? `${readCount} selected ${readCount === 1 ? "extract needs" : "extracts need"} teacher-read delivery. Read naturally without stressing the answer, and keep the script private.` : "Recordings are ready for your selection. In live mode, share the sound from the teacher's screen."}</p>
          <p className="strategy-small">The model is followed by practice requiring more inference. Live answers from each listen and transcript support are kept separately. Short strategy practice does not replace a complete Part 3 task.</p>
        </aside>
      </div>
      <section className="strategy-section"><h2>Teacher notes and recording scripts</h2><p>Keep the focus labels and scripts private before listening. The unmarked transcript can be opened after the second listen, before the key is revealed.</p><button type="button" onClick={downloadScripts}><Download size={18} aria-hidden="true" /> Download all recording scripts</button>
        <div className="strategy-teacher-bank">{aptisOpinionStrategyExtracts.map((item) => <details key={item.id}><summary>Extract {item.number} · {item.title}</summary><p><strong>Attribution focus:</strong> {item.focus}</p><p><strong>Editorial difficulty:</strong> {item.difficulty} on a 1–4 scale; these are estimates, not CEFR levels.</p><StrategyFeedback extract={item} /><p><strong>Likely difficulty:</strong> {item.likelyError}</p><p className="strategy-small">Recording file: {item.id}.mp3</p></details>)}</div>
      </section>
    </> : lesson.phase === "finished" ? <section className="strategy-section"><h2>Your selected extracts are complete</h2><StrategyReflection /><button type="button" onClick={() => setLesson(null)}>Choose another selection</button></section> : extract ? <section className="strategy-classroom">
      <div className="strategy-toolbar"><span>Extract {lesson.extractIndex + 1}/{selectAptisOpinionStrategyExtracts(lesson.extractIds).length} · {OPINION_STRATEGY_PHASES[lesson.phase]}</span><button type="button" onClick={() => { setLesson(null); setError(""); }}>Back to setup</button></div>
      <StrategyOpinions extract={extract} />
      {lesson.phase === "preview" ? <p className="strategy-discussion">{extract.prompt}</p> : null}
      {["first", "second"].includes(lesson.phase) ? <div className="strategy-callout"><Headphones size={20} aria-hidden="true" /><p>{lesson.phase === "first" ? "Try an answer on this listen." : "Check the particular evidence you were uncertain about."} {extract.audioReady ? "Play the recording below." : "The teacher reads the extract aloud. A recording will be added later."}</p>
        {extract.audioReady ? <audio className="opinion-strategy-audio" controls preload="metadata" key={`${extract.id}-${lesson.phase}`} src={extract.audioSrc} onError={() => setError("The recording could not be loaded. Try again or read the teacher script aloud.")} /> : null}
        <details key={`${extract.id}-${lesson.phase}-script`}><summary>Teacher script · open privately when reading aloud</summary>{extract.script.map((line, index) => <p key={index}><strong>{line.speaker}:</strong> {line.text}</p>)}</details>
      </div> : null}
      {lesson.phase === "compare" ? <p className="strategy-discussion">Compare your answers. What evidence supports your choice, and what did the other speaker actually endorse? Decide what to check without announcing the key.</p> : null}
      {lesson.phase === "script" ? <StrategyScript extract={extract} /> : null}
      {lesson.phase === "review" ? <StrategyFeedback extract={extract} /> : null}
      <div className="strategy-actions"><button className="strategy-primary" type="button" onClick={() => advance()}>{({ preview: "Begin first listening", first: "Compare answers", compare: "Begin second listening", second: "Reveal answer and evidence", script: "Reveal answer and evidence", review: lesson.extractIndex === selectAptisOpinionStrategyExtracts(lesson.extractIds).length - 1 ? "Finish selected extracts" : "Next extract" })[lesson.phase]}</button>
        {lesson.phase === "second" ? <button type="button" onClick={() => advance("script")}>Check unmarked transcript first</button> : null}
        {lesson.phase !== "review" ? <button type="button" onClick={() => advance("skip")}>Skip extract</button> : null}
        <button type="button" onClick={() => advance("finish")}>Finish early</button>
      </div>
    </section> : null}
    <StrategyNextStep />
  </main>;
}
