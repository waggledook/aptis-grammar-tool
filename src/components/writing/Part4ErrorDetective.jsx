import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, RotateCcw, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPart4ErrorDetectiveLiveGame } from "../../api/liveGames.js";
import { toast } from "../../utils/toast.js";
import Seo from "../common/Seo.jsx";
import { APTIS_PART4_ERROR_BANK } from "./data/aptisPart4ErrorBank.js";
import { getErrorChunks } from "./utils/errorDetectiveChunks.js";
import "./part4ErrorDetective.css";

export { getErrorChunks } from "./utils/errorDetectiveChunks.js";

const HISTORY_KEY = "aptis-part4-error-detective-seen";
const ROUND_SIZE = 8;

function shuffled(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

export function makeErrorDetectiveRound(seenIds = [], previousIds = []) {
  const seen = new Set(seenIds);
  const previous = new Set(previousIds);
  const unseen = shuffled(APTIS_PART4_ERROR_BANK.filter((item) => !seen.has(item.id)));
  const reviewed = shuffled(APTIS_PART4_ERROR_BANK.filter((item) => seen.has(item.id) && !previous.has(item.id)));
  const fallback = shuffled(APTIS_PART4_ERROR_BANK.filter((item) => previous.has(item.id)));
  const candidates = [...unseen, ...reviewed, ...fallback];
  const familyCounts = {};
  const selected = [];
  for (const item of candidates) {
    if (selected.length === ROUND_SIZE) break;
    if ((familyCounts[item.family] || 0) >= 2) continue;
    selected.push(item);
    familyCounts[item.family] = (familyCounts[item.family] || 0) + 1;
  }
  return selected;
}

function categoryLabel(category) {
  return ({ grammar: "Grammar", vocabulary: "Vocabulary", email_conventions: "Email conventions" })[category] || category;
}

export default function Part4ErrorDetective({ onBack }) {
  const navigate = useNavigate();
  const [seenIds, setSeenIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
  });
  const [round, setRound] = useState(() => makeErrorDetectiveRound(seenIds));
  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [correctionDraft, setCorrectionDraft] = useState("");
  const [correctionChecked, setCorrectionChecked] = useState(false);
  const [firstTimeCorrect, setFirstTimeCorrect] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  const item = round[index];

  useEffect(() => {
    if (!item || seenIds.includes(item.id)) return;
    const next = [...seenIds, item.id];
    setSeenIds(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  }, [item, seenIds]);

  const chunks = useMemo(() => item ? getErrorChunks(item) : [], [item]);
  const complete = index >= round.length;

  function chooseChunk(chunk, chunkIndex) {
    if (outcome && outcome !== "retry") return;
    setSelectedIndex(chunkIndex);
    if (chunk.target) {
      if (attempts === 0) setFirstTimeCorrect((value) => value + 1);
      setOutcome("correct");
      return;
    }
    if (attempts === 0) {
      setAttempts(1);
      setOutcome("retry");
    } else {
      setOutcome("revealed");
    }
  }

  function nextQuestion() {
    setIndex((value) => value + 1);
    setAttempts(0);
    setSelectedIndex(null);
    setOutcome(null);
    setCorrectionDraft("");
    setCorrectionChecked(false);
  }

  function playAnotherRound() {
    setRound(makeErrorDetectiveRound(seenIds, round.map((entry) => entry.id)));
    setIndex(0); setAttempts(0); setSelectedIndex(null); setOutcome(null); setCorrectionDraft(""); setCorrectionChecked(false); setFirstTimeCorrect(0); setReviewOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetHistory() {
    if (!window.confirm("Reset your Error Detective practice history on this browser?")) return;
    localStorage.removeItem(HISTORY_KEY);
    setSeenIds([]);
  }

  async function startLiveSession() {
    try {
      const { gameId } = await createPart4ErrorDetectiveLiveGame();
      navigate(`/live/error-detective/host/${gameId}`);
    } catch (error) {
      toast(error.message || "Unable to create the live room.");
    }
  }

  return <main className="error-detective-page game-wrapper">
    <Seo title="Part 4 Error Detective | Seif Aptis Trainer" description="Spot recurring errors from Aptis Writing Part 4 student responses." />
    <div className="error-detective-topbar">
      <button type="button" onClick={onBack}><ArrowLeft size={18} /> Back to Part 4</button>
      <span className="error-detective-tools"><button type="button" onClick={startLiveSession}>Run live in class</button><details><summary><Settings2 size={17} /> Practice settings</summary><button type="button" onClick={resetHistory}><RotateCcw size={16} /> Reset practice history</button></details></span>
    </div>
    <header className="error-detective-hero"><p>Aptis Writing Part 4 · Classroom training</p><h1>Part 4 Error Detective</h1><span>Can you spot the mistakes Aptis students commonly make?</span></header>
    <section className="error-detective-intro"><p>These sentences are based on recurring mistakes found in real Aptis Writing Part 4 answers. Every sentence contains one error. Click the part that needs changing.</p><small>Some mistakes are grammatical. Others involve vocabulary or email conventions.</small></section>
    {!complete && item ? <section className="error-detective-card" aria-live="polite">
      <header><span>Question {index + 1} of {round.length}</span><small>{seenIds.length} of {APTIS_PART4_ERROR_BANK.length} examples seen</small></header>
      <p className="error-detective-prompt">Which part needs changing?</p>
      <div className="error-detective-sentence">{chunks.map((chunk, chunkIndex) => {
        const state = outcome && (chunk.target ? "is-target" : selectedIndex === chunkIndex ? "is-wrong" : "");
        return <button className={state} disabled={Boolean(outcome && outcome !== "retry")} key={`${chunk.text}-${chunkIndex}`} onClick={() => chooseChunk(chunk, chunkIndex)} type="button"><ChunkText chunk={chunk} item={item} reveal={Boolean(outcome && chunk.target)} /></button>;
      })}</div>
      {outcome === "retry" ? <p className="error-detective-retry">Not quite — try once more.</p> : null}
      {(outcome === "correct" || outcome === "revealed") && !correctionChecked ? <CorrectionStep draft={correctionDraft} item={item} onChange={setCorrectionDraft} onCheck={() => setCorrectionChecked(true)} /> : null}
      {correctionChecked ? <Feedback correctionDraft={correctionDraft} item={item} correct={outcome === "correct"} onNext={nextQuestion} last={index === round.length - 1} /> : null}
    </section> : <Results round={round} firstTimeCorrect={firstTimeCorrect} onPlay={playAnotherRound} onReview={() => setReviewOpen((value) => !value)} reviewOpen={reviewOpen} />}
  </main>;
}

function ChunkText({ chunk, item, reveal }) {
  if (!reveal) return chunk.text;
  const targetIndex = chunk.text.indexOf(item.target);
  if (targetIndex < 0) return chunk.text;
  return <>{chunk.text.slice(0, targetIndex)}<mark>{item.target}</mark>{chunk.text.slice(targetIndex + item.target.length)}</>;
}

function normalizeCorrection(value) {
  return String(value || "").normalize("NFKC").toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, " ").replace(/[.,!?;:]+$/g, "").trim();
}

function CorrectionStep({ draft, item, onChange, onCheck }) {
  return <form className="error-detective-correction" onSubmit={(event) => { event.preventDefault(); if (draft.trim()) onCheck(); }}>
    <div><strong>Now correct it</strong><span>Rewrite the highlighted words, or write the complete corrected sentence.</span></div>
    <label><span>Problem phrase</span><s>{item.target}</s></label>
    <div className="error-detective-correction-entry"><input autoFocus maxLength={300} onChange={(event) => onChange(event.target.value)} placeholder="Type your correction…" value={draft} /><button disabled={!draft.trim()} type="submit">Compare correction</button></div>
  </form>;
}

function Feedback({ item, correct, correctionDraft, onNext, last }) {
  const correctionMatches = [item.correction, item.correctedSentence].some((answer) => normalizeCorrection(answer) === normalizeCorrection(correctionDraft));
  return <div className="error-detective-feedback"><strong>{correctionMatches ? "Your correction matches ✓" : "Compare your version with the model."}</strong><span className="error-detective-category">{categoryLabel(item.category)}</span><p className="error-detective-your-answer"><small>Your answer</small>{correctionDraft}</p><p><s>{item.sentence}</s></p><p className="is-corrected">{item.correctedSentence}</p><p>{item.explanation}</p><small>{correct ? "Error spotted independently." : "Error revealed after two attempts."}</small><button type="button" onClick={onNext}>{last ? "See round results" : "Next sentence"}</button></div>;
}

function Results({ round, firstTimeCorrect, onPlay, onReview, reviewOpen }) {
  const categories = round.reduce((counts, item) => ({ ...counts, [item.category]: (counts[item.category] || 0) + 1 }), {});
  return <section className="error-detective-results"><CheckCircle2 size={42} /><p>Round complete</p><h2>{firstTimeCorrect} / {round.length} spotted first time</h2><span>Errors practised: {Object.entries(categories).map(([category, count]) => `${categoryLabel(category)}: ${count}`).join(" · ")}</span><div><button className="is-primary" type="button" onClick={onPlay}>Play another round</button><button type="button" onClick={onReview}>{reviewOpen ? "Hide review" : "Review this round"}</button></div>{reviewOpen ? <ol>{round.map((item) => <li key={item.id}><s>{item.sentence}</s><strong>{item.correction}</strong><span>{item.explanation}</span></li>)}</ol> : null}</section>;
}
