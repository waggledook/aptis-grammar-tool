import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Fingerprint,
  ListChecks,
  RotateCcw,
  Search,
  ShieldQuestion,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import ReadingCaseNavigator from "./ReadingCaseNavigator.jsx";
import "./styles/ote.css";

function HighlightedText({ text, fragments = [], active = false }) {
  if (!active || !fragments.length) return text;
  const ranges = fragments
    .map((fragment) => ({ fragment, start: text.indexOf(fragment) }))
    .filter(({ start }) => start >= 0)
    .sort((a, b) => a.start - b.start);
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

function TrainerText({ item, activeDistractor, evidenceRevealed }) {
  return (
    <article className="ote-forensics-text">
      <header><span>{item.source}</span><h2>{item.title}</h2></header>
      {item.paragraphs.map((paragraph, index) => (
        <p key={`${item.id}:${index}`}><HighlightedText text={paragraph} fragments={activeDistractor?.evidence} active={evidenceRevealed} /></p>
      ))}
    </article>
  );
}

export default function OteReadingDistractorTrainer({ nativeRoutes = false, config }) {
  const navigate = useNavigate();
  const [caseIndex, setCaseIndex] = useState(0);
  const [distractorIndex, setDistractorIndex] = useState(0);
  const [work, setWork] = useState({});
  const [complete, setComplete] = useState(false);
  const completionLoggedRef = useRef(false);
  const {
    cases,
    diagnoses,
    diagnosticFeedback,
    variant,
    progressId,
    mode,
    taskId,
    taskTitle,
    title,
    seoTitle,
    seoDescription,
    kicker,
    intro,
    rounds = [],
    wording = {},
  } = config;
  const item = cases[caseIndex];
  const itemWork = work[item.id] || {};
  const activeDistractor = item.distractors[distractorIndex];
  const selectedDiagnosis = itemWork.diagnoses?.[activeDistractor.option];
  const diagnosisChecked = Boolean(itemWork.checkedDiagnoses?.[activeDistractor.option]);
  const diagnosisCorrect = selectedDiagnosis === activeDistractor.diagnosis;
  const answerCorrect = itemWork.answer === item.answer;
  const totalDiagnoses = cases.reduce((total, entry) => total + entry.distractors.length, 0);
  const completedCases = cases.filter((entry) => entry.distractors.every((distractor) => work[entry.id]?.checkedDiagnoses?.[distractor.option])).length;
  const basePath = nativeRoutes ? `/reading/${variant}/part-1-short-texts` : `/ote/reading/${variant}/part-1-short-texts`;
  const menuPath = getSitePath(basePath);
  const practicePath = getSitePath(`${basePath}/practice/pilot-1`);
  const answerScore = useMemo(() => cases.filter((entry) => work[entry.id]?.answer === entry.answer).length, [cases, work]);
  const diagnosisScore = useMemo(() => cases.reduce((score, entry) => score + entry.distractors.filter((distractor) => work[entry.id]?.diagnoses?.[distractor.option] === distractor.diagnosis).length, 0), [cases, work]);
  const missedDiagnosisCounts = useMemo(() => {
    const counts = {};
    cases.forEach((entry) => entry.distractors.forEach((distractor) => {
      const entryWork = work[entry.id] || {};
      if (entryWork.checkedDiagnoses?.[distractor.option] && entryWork.diagnoses?.[distractor.option] !== distractor.diagnosis) {
        counts[distractor.diagnosis] = (counts[distractor.diagnosis] || 0) + 1;
      }
    }));
    return counts;
  }, [cases, work]);
  const priorityFeedback = Object.entries(missedDiagnosisCounts).sort((a, b) => b[1] - a[1]).slice(0, 2);
  const currentRound = rounds.find((round) => round.id === item.round);

  function getDiagnosisLabel(id) {
    return diagnoses.find((entry) => entry.id === id)?.label || id;
  }

  useEffect(() => {
    if (!complete || completionLoggedRef.current) return;
    completionLoggedRef.current = true;
    logOteTrainingCompleted({
      progressId,
      section: "reading",
      part: "part-1",
      mode,
      taskId,
      taskTitle,
      variant,
      score: answerScore + diagnosisScore,
      total: cases.length + totalDiagnoses,
      answerScore,
      diagnosisScore,
    });
  }, [answerScore, cases.length, complete, diagnosisScore, mode, progressId, taskId, taskTitle, totalDiagnoses, variant]);

  function updateItem(changes) {
    setWork((current) => ({ ...current, [item.id]: { ...(current[item.id] || {}), ...changes } }));
  }

  function selectDiagnosis(diagnosis) {
    if (diagnosisChecked) return;
    setWork((current) => ({
      ...current,
      [item.id]: {
        ...(current[item.id] || {}),
        diagnoses: { ...(current[item.id]?.diagnoses || {}), [activeDistractor.option]: diagnosis },
      },
    }));
  }

  function checkDiagnosis() {
    if (!selectedDiagnosis) return;
    setWork((current) => ({
      ...current,
      [item.id]: {
        ...(current[item.id] || {}),
        checkedDiagnoses: { ...(current[item.id]?.checkedDiagnoses || {}), [activeDistractor.option]: true },
      },
    }));
  }

  function advance() {
    if (!diagnosisChecked) return;
    if (distractorIndex < item.distractors.length - 1) {
      setDistractorIndex((current) => current + 1);
      return;
    }
    if (completedCases === cases.length) {
      setComplete(true);
      return;
    }
    const nextIncomplete = cases.findIndex((entry, index) => index > caseIndex && !entry.distractors.every((distractor) => work[entry.id]?.checkedDiagnoses?.[distractor.option]));
    const firstIncomplete = cases.findIndex((entry) => !entry.distractors.every((distractor) => work[entry.id]?.checkedDiagnoses?.[distractor.option]));
    setCaseIndex(nextIncomplete >= 0 ? nextIncomplete : firstIncomplete);
    setDistractorIndex(0);
  }

  function resetActivity() {
    setCaseIndex(0);
    setDistractorIndex(0);
    setWork({});
    setComplete(false);
    completionLoggedRef.current = false;
  }

  return (
    <main className="ote-training-page ote-forensics-page">
      <Seo title={seoTitle} description={seoDescription} />
      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}><ArrowLeft size={18} aria-hidden="true" /> Back to Part 1 training</button>
      <header className="ote-training-hero">
        <p className="ote-kicker">{kicker}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </header>
      <section className="ote-training-summary" aria-label={`${title} overview`}>
        <div><ListChecks size={24} aria-hidden="true" /><strong>{cases.length} best answers</strong><span>{wording.answerSummary || "Answer each Part 1 question before examining the wrong options."}</span></div>
        <div><Fingerprint size={24} aria-hidden="true" /><strong>{totalDiagnoses} diagnoses</strong><span>{wording.diagnosisSummary || "Classify both wrong answers, even when your first choice was correct."}</span></div>
        <div><Search size={24} aria-hidden="true" /><strong>Evidence in context</strong><span>{wording.evidenceSummary || "After each diagnosis, the useful words are highlighted in the original text."}</span></div>
      </section>
      <details className="ote-forensics-reference">
        <summary>The six diagnoses</summary>
        <div>{diagnoses.map((diagnosis) => <article key={diagnosis.id}><strong>{diagnosis.label}</strong><span>{diagnosis.description}</span></article>)}</div>
      </details>

      {complete ? (
        <section className="ote-training-section ote-cohesion-complete">
          <div className="ote-cohesion-complete-icon"><Fingerprint size={34} aria-hidden="true" /></div>
          <p className="ote-kicker">{wording.reportKicker || "Forensic report complete"}</p>
          <h2>Two skills, separately measured</h2>
          <div className="ote-cohesion-score-grid">
            <article><span>Best answers</span><strong>{answerScore} / {cases.length}</strong><p>Your understanding of each complete text.</p></article>
            <article><span>Distractor diagnoses</span><strong>{diagnosisScore} / {totalDiagnoses}</strong><p>Your explanation of why each wrong answer fails.</p></article>
          </div>
          {rounds.length ? <div className="ote-forensics-round-summary">{rounds.map((round) => {
            const roundCases = cases.filter((entry) => entry.round === round.id);
            const score = roundCases.filter((entry) => work[entry.id]?.answer === entry.answer).length;
            return <article key={round.id}><span>{round.label}</span><strong>{score} / {roundCases.length}</strong></article>;
          })}</div> : null}
          <div className="ote-forensics-diagnostic-report">
            {priorityFeedback.length ? priorityFeedback.map(([diagnosis]) => <article key={diagnosis}><ShieldQuestion size={20} aria-hidden="true" /><div><strong>{getDiagnosisLabel(diagnosis)}</strong><p>{diagnosticFeedback[diagnosis]}</p></div></article>) : <article className="is-success"><CheckCircle2 size={20} aria-hidden="true" /><div><strong>{wording.successTitle || "Excellent diagnostic control"}</strong><p>{wording.successCopy || `You identified all ${totalDiagnoses} distractor patterns accurately.`}</p></div></article>}
          </div>
          <div className="ote-forensics-results">
            {cases.map((entry, index) => {
              const answerRight = work[entry.id]?.answer === entry.answer;
              const diagnosesRight = entry.distractors.filter((distractor) => work[entry.id]?.diagnoses?.[distractor.option] === distractor.diagnosis).length;
              return <button key={entry.id} type="button" onClick={() => { setCaseIndex(index); setDistractorIndex(0); setComplete(false); }}>{answerRight && diagnosesRight === entry.distractors.length ? <CheckCircle2 size={19} aria-hidden="true" /> : <XCircle size={19} aria-hidden="true" />}<span>Case {index + 1}: {entry.title}</span><small>Answer {answerRight ? "✓" : "✗"} · Diagnoses {diagnosesRight}/{entry.distractors.length}</small></button>;
            })}
          </div>
          <div className="ote-cohesion-actions is-complete">
            <button className="is-secondary" type="button" onClick={resetActivity}><RotateCcw size={17} aria-hidden="true" /> Try all cases again</button>
            <button type="button" onClick={() => navigate(practicePath)}>Open timed practice <ChevronRight size={17} aria-hidden="true" /></button>
          </div>
        </section>
      ) : (
        <section className="ote-training-section ote-forensics-runner">
          <div className="ote-cohesion-progress-head"><div><span>{currentRound ? `${currentRound.label} · ` : ""}Case {caseIndex + 1} of {cases.length} · {item.source}</span><strong>{completedCases} / {cases.length} complete</strong></div><div className="ote-practice-progress-bar" aria-hidden="true"><span style={{ width: `${(completedCases / cases.length) * 100}%` }} /></div></div>
          <ReadingCaseNavigator
            items={cases}
            currentIndex={caseIndex}
            isComplete={(entry) => entry.distractors.every((distractor) => work[entry.id]?.checkedDiagnoses?.[distractor.option])}
            onSelect={(index) => { setCaseIndex(index); setDistractorIndex(0); }}
          />
          <article className="ote-forensics-case">
            <header><p className="ote-kicker">Case {caseIndex + 1} · {item.title}</p><h2>{item.question}</h2></header>
            {!itemWork.answerChecked ? (
              <>
                <TrainerText item={item} />
                <div className="ote-cohesion-options" role="radiogroup" aria-label={`Answer options for case ${caseIndex + 1}`}>
                  {item.options.map((option) => <button className={itemWork.answer === option.id ? "is-selected" : ""} key={option.id} type="button" role="radio" aria-checked={itemWork.answer === option.id} onClick={() => updateItem({ answer: option.id })}><strong>{option.id}</strong><span>{option.text}</span></button>)}
                </div>
                <button className="ote-forensics-check" type="button" disabled={!itemWork.answer} onClick={() => updateItem({ answerChecked: true })}>Check best answer</button>
              </>
            ) : (
              <>
                <div className={`ote-forensics-answer-banner ${answerCorrect ? "is-correct" : "is-wrong"}`}>{answerCorrect ? <CheckCircle2 size={21} aria-hidden="true" /> : <XCircle size={21} aria-hidden="true" />}<p><strong>{answerCorrect ? "Correct." : `The best answer is ${item.answer}.`}</strong> {item.why}</p></div>
                <div className="ote-forensics-investigation-layout">
                  <TrainerText item={item} activeDistractor={activeDistractor} evidenceRevealed={diagnosisChecked} />
                  <aside className="ote-forensics-panel">
                    <div className="ote-distractor-lab-progress"><span>Wrong option {distractorIndex + 1} of {item.distractors.length}</span><strong>Case {caseIndex + 1}</strong></div>
                    <div className="ote-distractor-lab-progress-bar" aria-hidden="true"><span style={{ width: `${((distractorIndex + (diagnosisChecked ? 1 : 0)) / item.distractors.length) * 100}%` }} /></div>
                    <p className="ote-kicker">{wording.investigationLabel || "Forensic examination"}: {activeDistractor.option}</p>
                    <h3>{item.options.find((option) => option.id === activeDistractor.option)?.text}</h3>
                    <label htmlFor={`diagnosis-${item.id}-${activeDistractor.option}`}>{wording.diagnosisQuestion || "Where does the meaning break down?"}</label>
                    <select id={`diagnosis-${item.id}-${activeDistractor.option}`} value={selectedDiagnosis || ""} disabled={diagnosisChecked} onChange={(event) => selectDiagnosis(event.target.value)}>
                      <option value="">Select a diagnosis…</option>
                      {diagnoses.map((diagnosis) => <option value={diagnosis.id} key={diagnosis.id}>{diagnosis.label}</option>)}
                    </select>
                    {!diagnosisChecked ? <button className="ote-forensics-check" type="button" disabled={!selectedDiagnosis} onClick={checkDiagnosis}>Check diagnosis</button> : (
                      <div className={`ote-forensics-autopsy ${diagnosisCorrect ? "is-correct" : "is-wrong"}`} aria-live="polite">
                        <div>{diagnosisCorrect ? <CheckCircle2 size={20} aria-hidden="true" /> : <XCircle size={20} aria-hidden="true" />}<p><strong>{diagnosisCorrect ? "Diagnosis confirmed." : `Best diagnosis: ${getDiagnosisLabel(activeDistractor.diagnosis)}.`}</strong></p></div>
                        <span>{activeDistractor.note}</span><p>{activeDistractor.explanation}</p>
                      </div>
                    )}
                    <div className="ote-cohesion-actions">
                      <button className="is-secondary" type="button" disabled={distractorIndex === 0} onClick={() => setDistractorIndex(0)}><ChevronLeft size={17} aria-hidden="true" /> Previous option</button>
                      <button type="button" disabled={!diagnosisChecked} onClick={advance}>{distractorIndex < item.distractors.length - 1 ? "Examine second option" : completedCases === cases.length ? "View final report" : "Next case"}<ChevronRight size={17} aria-hidden="true" /></button>
                    </div>
                  </aside>
                </div>
              </>
            )}
            {!itemWork.answerChecked ? <div className="ote-cohesion-actions"><button className="is-secondary" type="button" disabled={caseIndex === 0} onClick={() => { setCaseIndex((current) => Math.max(0, current - 1)); setDistractorIndex(0); }}><ChevronLeft size={17} aria-hidden="true" /> Previous case</button></div> : null}
          </article>
        </section>
      )}
    </main>
  );
}
