import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CircleMinus,
  Eye,
  GitCompareArrows,
  RotateCcw,
  X,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted, logOteTrainingStarted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import ReadingCaseNavigator from "./ReadingCaseNavigator.jsx";
import { generalCompareModes } from "./data/oteGeneralReadingComparePeople.js";
import "./styles/ote.css";

const MAIN_PROGRESS_ID = "reading.part2.general-compare-people";

function HighlightedParagraph({ text, fragments = [] }) {
  const ranges = fragments
    .map((fragment) => ({ fragment, start: text.indexOf(fragment) }))
    .filter(({ start }) => start >= 0)
    .sort((a, b) => a.start - b.start);
  if (!ranges.length) return text;
  const output = [];
  let cursor = 0;
  ranges.forEach(({ fragment, start }) => {
    if (start < cursor) return;
    if (start > cursor) output.push(text.slice(cursor, start));
    output.push(<mark key={`${fragment}:${start}`}>{fragment}</mark>);
    cursor = start + fragment.length;
  });
  if (cursor < text.length) output.push(text.slice(cursor));
  return output;
}

function RequirementStatus({ label, status }) {
  const Icon = status === "yes" ? Check : status === "partial" ? CircleMinus : X;
  return <span className={`ote-general-fit-status is-${status}`}><Icon size={15} aria-hidden="true" /><span>{label}</span><small>{status === "yes" ? "Meets" : status === "partial" ? "Partly" : "Does not meet"}</small></span>;
}

function ComparisonTexts({ mode, item = null }) {
  return mode.texts.map((text) => {
    const candidate = item?.candidates?.[text.id];
    return (
      <article className="ote-decode-profile ote-general-compare-text" key={text.id}>
        <header><span>{text.id}</span><div><h3>{text.name}</h3>{mode.id === "people" ? <p>Learning to drive</p> : <p>Volunteering programme</p>}</div></header>
        <p>{text.paragraphs.map((paragraph, index) => <React.Fragment key={`${text.id}:${index}`}>{index > 0 ? " " : ""}<HighlightedParagraph text={paragraph} fragments={candidate?.highlights || []} /></React.Fragment>)}</p>
        {mode.id === "programmes" && item ? <div className="ote-general-fit-checks" aria-label={`${text.name} requirement check`}>{item.requirements.map((requirement, index) => <RequirementStatus key={requirement} label={requirement} status={candidate.checks[index]} />)}</div> : null}
      </article>
    );
  });
}

function getModeScores(mode, work) {
  const bestScore = mode.items.filter((item) => work[item.id]?.diagnoses?.[item.answer] === item.candidates[item.answer].diagnosis).length;
  const alternativeScore = mode.items.reduce((total, item) => total + mode.texts.filter((text) => text.id !== item.answer && work[item.id]?.diagnoses?.[text.id] === item.candidates[text.id].diagnosis).length, 0);
  const completed = mode.items.filter((item) => work[item.id]?.checked).length;
  return { bestScore, alternativeScore, completed, total: mode.items.length + mode.items.length * (mode.texts.length - 1) };
}

function getFeedback(mode, scores) {
  const bestTotal = mode.items.length;
  const alternativeTotal = mode.items.length * (mode.texts.length - 1);
  if (scores.bestScore === bestTotal && scores.alternativeScore === alternativeTotal) return "Excellent. You found every complete match and explained every alternative correctly.";
  if (scores.bestScore >= bestTotal - 1 && scores.alternativeScore < alternativeTotal - 3) return mode.id === "people" ? "You usually find the correct person. Check why a related detail is not always a full match." : "You usually find the best programme. Check every requirement before deciding that an alternative is only a partial fit.";
  if (scores.bestScore < bestTotal - 1) return mode.id === "people" ? "Compare the complete meaning of the question with each highlighted extract. A shared topic is not enough." : "Use all three requirement checks. One missing essential detail means the programme is not a complete fit.";
  return "Strong work. Review the few alternatives whose topic looked right but whose complete meaning did not fit.";
}

export default function OteGeneralReadingComparePeople({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [stage, setStage] = useState("intro");
  const [modeIndex, setModeIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [work, setWork] = useState({});
  const loggedRef = useRef(new Set());
  const mode = generalCompareModes[modeIndex];
  const item = mode.items[itemIndex];
  const itemWork = work[item.id] || {};
  const modeScores = useMemo(() => generalCompareModes.map((entry) => getModeScores(entry, work)), [work]);
  const currentScores = modeScores[modeIndex];
  const allDiagnosed = mode.texts.every((text) => itemWork.diagnoses?.[text.id]);
  const menuPath = getSitePath(nativeRoutes ? "/reading/general/part-2-matching" : "/ote/reading/general/part-2-matching");
  const practicePath = getSitePath(`${nativeRoutes ? "/reading" : "/ote/reading"}/general/part-2-matching/practice/b2-pilot-1`);

  useEffect(() => {
    if (stage !== "mode-complete" || loggedRef.current.has(mode.id)) return;
    loggedRef.current.add(mode.id);
    const alternativeTotal = mode.items.length * (mode.texts.length - 1);
    void logOteTrainingCompleted({
      progressId: `${MAIN_PROGRESS_ID}-${mode.id}`,
      section: "reading",
      part: "part-2",
      mode: `general_compare_${mode.id}`,
      taskId: `general-reading-part-2-compare-${mode.id}`,
      taskTitle: `${mode.title} · ${mode.level}`,
      variant: "general",
      score: currentScores.bestScore + currentScores.alternativeScore,
      total: mode.items.length + alternativeTotal,
      matchScore: currentScores.bestScore,
      diagnosisScore: currentScores.alternativeScore,
    });

    const bothComplete = generalCompareModes.every((entry, index) => index === modeIndex || modeScores[index].completed === entry.items.length);
    if (bothComplete && !loggedRef.current.has("lesson")) {
      loggedRef.current.add("lesson");
      const combinedScore = modeScores.reduce((total, scores, index) => total + (index === modeIndex ? currentScores.bestScore + currentScores.alternativeScore : scores.bestScore + scores.alternativeScore), 0);
      const combinedTotal = generalCompareModes.reduce((total, entry) => total + entry.items.length * entry.texts.length, 0);
      void logOteTrainingCompleted({
        progressId: MAIN_PROGRESS_ID,
        section: "reading",
        part: "part-2",
        mode: "general_compare_people_complete",
        taskId: "general-reading-part-2-compare-people",
        taskTitle: "Compare the People",
        variant: "general",
        score: combinedScore,
        total: combinedTotal,
      });
    }
  }, [currentScores.alternativeScore, currentScores.bestScore, mode, modeIndex, modeScores, stage]);

  function updateItem(changes) {
    setWork((current) => ({ ...current, [item.id]: { ...(current[item.id] || {}), ...changes } }));
  }

  function chooseDiagnosis(textId, diagnosis) {
    const diagnoses = { ...(itemWork.diagnoses || {}) };
    const positiveDiagnosis = mode.diagnoses[0].id;
    if (diagnosis === positiveDiagnosis) {
      mode.texts.forEach((text) => {
        if (text.id !== textId && diagnoses[text.id] === positiveDiagnosis) delete diagnoses[text.id];
      });
    }
    diagnoses[textId] = diagnosis;
    updateItem({ diagnoses });
  }

  function startMode() {
    setStage("run");
    setItemIndex(0);
    void logOteTrainingStarted({
      progressId: `${MAIN_PROGRESS_ID}-${mode.id}`,
      section: "reading",
      part: "part-2",
      mode: `general_compare_${mode.id}`,
      taskId: `general-reading-part-2-compare-${mode.id}`,
      taskTitle: mode.title,
      variant: "general",
    });
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function selectMode(index) {
    setModeIndex(index);
    setItemIndex(0);
    setStage("intro");
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function goNext() {
    if (currentScores.completed === mode.items.length) {
      setStage("mode-complete");
      return;
    }
    const next = mode.items.findIndex((entry, index) => index > itemIndex && !work[entry.id]?.checked);
    const first = mode.items.findIndex((entry) => !work[entry.id]?.checked);
    setItemIndex(next >= 0 ? next : first);
  }

  function resetActivity() {
    setStage("intro");
    setModeIndex(0);
    setItemIndex(0);
    setWork({});
    loggedRef.current = new Set();
  }

  const renderModeSelector = () => <div className="ote-candidates-round-selector" aria-label="Choose an activity mode">{generalCompareModes.map((entry, index) => { const scores = modeScores[index]; const complete = scores.completed === entry.items.length; return <button className={index === modeIndex ? "is-active" : ""} type="button" key={entry.id} onClick={() => selectMode(index)}><span>{entry.label} · {entry.level}</span><strong>{entry.title}</strong><small>{complete ? `${scores.bestScore}/6 matches · ${scores.alternativeScore}/${entry.items.length * (entry.texts.length - 1)} alternatives` : entry.description}</small></button>; })}</div>;

  return (
    <main className="ote-training-page ote-decode-page ote-candidates-page ote-general-compare-page">
      <Seo title="Compare the People | OTE General Reading Part 2 | Seif English" description="Compare people and choices across both OTE General Reading Part 2 matching formats." />
      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}><ArrowLeft size={18} aria-hidden="true" /> Back to Part 2 training</button>
      <header className="ote-training-hero"><p className="ote-kicker">General Reading Part 2 · {mode.label}</p><h1>{mode.title}</h1><p>{stage === "intro" ? mode.intro : stage === "run" ? mode.id === "people" ? "Compare the highlighted meanings. Choose one full match and diagnose the alternatives." : "Check every requirement. A promising programme is not a complete fit if one essential detail is missing." : "Review this mode or continue to the other Part 2 format."}</p></header>

      {stage === "run" ? <><section className="ote-training-summary" aria-label="Comparison method"><div><CircleHelp size={24} /><strong>1. Read the target</strong><span>Notice every important detail.</span></div><div><Eye size={24} /><strong>2. Compare the evidence</strong><span>Use the highlights and requirement checks.</span></div><div><GitCompareArrows size={24} /><strong>3. Diagnose every choice</strong><span>Find the complete match and explain the alternatives.</span></div></section><details className="ote-reading-target-reference ote-candidates-reference"><summary>The three comparison labels</summary><div>{mode.diagnoses.map((diagnosis) => <article key={diagnosis.id}><strong>{diagnosis.label}</strong><span>{diagnosis.description}</span></article>)}</div></details></> : null}

      {stage === "intro" ? <section className="ote-training-section ote-candidates-intro">{renderModeSelector()}<div className="ote-candidates-intro-prompt"><Eye size={30} /><div><p className="ote-kicker">Before the questions</p><h2>{mode.id === "people" ? "Skim the three profiles" : "Read the six people"}</h2><p>{mode.intro}</p></div></div>{mode.id === "people" ? <div className="ote-decode-profile-stack"><div className="ote-decode-text-heading"><p className="ote-kicker">Learning to drive</p><h2>Three people talk about learning to drive.</h2></div><ComparisonTexts mode={mode} /></div> : <div className="ote-general-people-grid">{mode.items.map((person) => <article key={person.id}><span>{person.title}</span><p>{person.prompt}</p><div>{person.requirements.map((requirement) => <small key={requirement}>{requirement}</small>)}</div></article>)}</div>}<div className="ote-candidates-intro-action"><p>{mode.id === "people" ? "Finished your first reading?" : "Ready to compare the four programmes?"}</p><button type="button" onClick={startMode}>Start {mode.label.toLowerCase()} <ChevronRight size={17} /></button></div></section> : stage === "run" ? <section className="ote-training-section ote-decode-runner"><ReadingCaseNavigator items={mode.items} currentIndex={itemIndex} label={`Choose a ${mode.title.toLowerCase()} item`} isComplete={(entry) => Boolean(work[entry.id]?.checked)} onSelect={setItemIndex} /><div className="ote-decode-search-layout"><div className="ote-decode-profile-stack"><div className="ote-decode-text-heading"><p className="ote-kicker">{mode.id === "people" ? "Learning to drive" : "Choose a volunteering programme"}</p><h2>{mode.id === "people" ? "Relevant evidence is highlighted in all three profiles." : `Compare each programme with ${item.title}'s requirements.`}</h2></div><ComparisonTexts mode={mode} item={item} /></div><aside className="ote-decode-task-panel ote-candidates-task-panel"><p className="ote-kicker">{mode.label} · Item {itemIndex + 1} of {mode.items.length}</p><h2>{item.question}</h2>{mode.id === "programmes" ? <><p className="ote-general-person-prompt">{item.prompt}</p><div className="ote-general-requirement-chips">{item.requirements.map((requirement) => <span key={requirement}>{requirement}</span>)}</div></> : null}<section className="ote-decode-task-step"><h3>Evaluate every candidate</h3><p>Choose one {mode.diagnoses[0].label.toLowerCase()}. Then decide whether each alternative is partly related or ruled out.</p><div className="ote-candidate-diagnosis-stack">{mode.texts.map((text) => { const candidate = item.candidates[text.id]; const selected = itemWork.diagnoses?.[text.id]; const correct = selected === candidate.diagnosis; return <article className={`ote-candidate-diagnosis ${itemWork.checked ? correct ? "is-correct" : "is-wrong" : ""}`} key={text.id}><header><strong>{text.id} — {text.name}</strong>{itemWork.checked ? <span>{mode.diagnoses.find((entry) => entry.id === candidate.diagnosis)?.label}</span> : null}</header><div className="ote-candidate-label-row">{mode.diagnoses.map((diagnosis) => <button className={selected === diagnosis.id ? "is-selected" : ""} type="button" key={diagnosis.id} disabled={itemWork.checked} onClick={() => chooseDiagnosis(text.id, diagnosis.id)}>{diagnosis.label}</button>)}</div>{itemWork.checked ? <div className="ote-candidate-inline-feedback">{correct ? <CheckCircle2 size={17} /> : <XCircle size={17} />}<p><strong>{correct ? "Correct." : `Best label: ${mode.diagnoses.find((entry) => entry.id === candidate.diagnosis)?.label}.`}</strong> {candidate.reason}</p></div> : null}</article>; })}</div>{!itemWork.checked ? <button className="ote-reading-target-check" type="button" disabled={!allDiagnosed} onClick={() => updateItem({ checked: true })}>Check the comparison</button> : <div className="ote-candidates-distinction"><strong>Key distinction</strong><p>{item.distinction || "A complete fit meets every essential requirement. A partial fit still leaves an important need unmet."}</p></div>}</section><div className="ote-cohesion-actions"><button className="is-secondary" type="button" disabled={itemIndex === 0} onClick={() => setItemIndex((current) => Math.max(0, current - 1))}><ChevronLeft size={17} /> Previous</button><button type="button" disabled={!itemWork.checked} onClick={goNext}>{currentScores.completed === mode.items.length ? `Complete ${mode.label}` : "Next item"}<ChevronRight size={17} /></button></div></aside></div></section> : stage === "mode-complete" ? <section className="ote-training-section ote-cohesion-complete"><div className="ote-cohesion-complete-icon"><GitCompareArrows size={34} /></div><p className="ote-kicker">{mode.label} complete</p><h2>{mode.title}</h2><div className="ote-cohesion-score-grid"><article><span>{mode.id === "people" ? "Exact people" : "Complete matches"}</span><strong>{currentScores.bestScore} / 6</strong><p>The one candidate that answers the whole target.</p></article><article><span>Alternative diagnoses</span><strong>{currentScores.alternativeScore} / {mode.items.length * (mode.texts.length - 1)}</strong><p>Why the other candidates are incomplete or unsuitable.</p></article></div><div className="ote-decode-diagnostic"><p>{getFeedback(mode, currentScores)}</p></div><div className="ote-reading-target-results">{mode.items.map((entry, index) => { const row = work[entry.id] || {}; const alternativeScore = mode.texts.filter((text) => text.id !== entry.answer && row.diagnoses?.[text.id] === entry.candidates[text.id].diagnosis).length; const bestCorrect = row.diagnoses?.[entry.answer] === entry.candidates[entry.answer].diagnosis; return <button key={entry.id} type="button" onClick={() => { setItemIndex(index); setStage("run"); }}>{bestCorrect && alternativeScore === mode.texts.length - 1 ? <CheckCircle2 size={19} /> : <XCircle size={19} />}<span>{index + 1}. {entry.title}</span><small>{bestCorrect ? 1 : 0}/1 · {alternativeScore}/{mode.texts.length - 1}</small></button>; })}</div><div className="ote-cohesion-actions is-complete"><button className="is-secondary" type="button" onClick={() => setStage("complete")}>Finish for now</button><button type="button" onClick={() => selectMode(modeIndex === 0 ? 1 : 0)}>Open {modeIndex === 0 ? "Mode 2" : "Mode 1"} <ChevronRight size={17} /></button></div></section> : <section className="ote-training-section ote-cohesion-complete"><div className="ote-cohesion-complete-icon"><GitCompareArrows size={34} /></div><p className="ote-kicker">General Reading Part 2</p><h2>{modeScores.every((scores, index) => scores.completed === generalCompareModes[index].items.length) ? "Both modes complete" : "Your lesson report"}</h2><div className="ote-candidates-lesson-report">{generalCompareModes.map((entry, index) => { const scores = modeScores[index]; const complete = scores.completed === entry.items.length; return <article key={entry.id}><span>{entry.label} · {entry.level}</span><h3>{entry.title}</h3>{complete ? <strong>{scores.bestScore}/6 matches · {scores.alternativeScore}/{entry.items.length * (entry.texts.length - 1)} alternatives</strong> : <p>This mode is still available.</p>}<button type="button" onClick={() => selectMode(index)}>{complete ? "Review this mode" : "Open this mode"}</button></article>; })}</div><div className="ote-cohesion-actions is-complete"><button className="is-secondary" type="button" onClick={resetActivity}><RotateCcw size={17} /> Start again</button><button type="button" onClick={() => navigate(practicePath)}>Open B2 timed practice <ChevronRight size={17} /></button></div></section>}
    </main>
  );
}
