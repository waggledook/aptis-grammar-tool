import React, { useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Circle, CircleCheck, CircleX, RotateCcw, Search, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted, logOteTrainingStarted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import { insideParagraphCases } from "./data/oteAdvancedReadingInsideParagraph.js";
import "./styles/ote.css";

const PROGRESS_ID = "reading.part4.advanced-inside-paragraph";

function assessEvidence(item, selectedIds, chosenAnswer) {
  const selected = new Set(selectedIds);
  const strong = item.evidence.strongSets.some((set) => set.every((id) => selected.has(id)));
  if (strong) {
    return {
      id: "strong",
      label: "Strong evidence",
      scored: true,
      copy: "Your selection includes the language that most directly proves the interpretation.",
    };
  }

  const distractorLink = Object.entries(item.evidence.distractorLinks || {}).find(([, ids]) =>
    ids.some((id) => selected.has(id))
  );
  if (distractorLink) {
    return {
      id: "related",
      label: "Related detail",
      scored: false,
      copy: chosenAnswer === distractorLink[0]
        ? `Your evidence explains why option ${distractorLink[0]} is tempting, but it does not establish the writer's full point.`
        : `Your evidence is related to option ${distractorLink[0]}, but it does not establish the writer's full point.`,
    };
  }

  if (item.evidence.partial.some((id) => selected.has(id))) {
    return {
      id: "partial",
      label: "Partly relevant",
      scored: false,
      copy: item.evidence.partialFeedback,
    };
  }

  return {
    id: "unsupported",
    label: "Evidence does not support the answer",
    scored: false,
    copy: "The selected sentence does not provide a clear reason for choosing the best interpretation.",
  };
}

function getScores(responses) {
  return insideParagraphCases.reduce((scores, item) => {
    const response = responses[item.id];
    if (!response?.submitted) return scores;
    if (response.answer === item.answer) scores.answers += 1;
    if (response.evidenceAssessment?.scored) scores.evidence += 1;
    return scores;
  }, { answers: 0, evidence: 0 });
}

export default function OteAdvancedReadingInsideParagraph({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const menuPath = getSitePath(nativeRoutes ? "/reading/advanced/part-4-long-text" : "/ote/reading/advanced/part-4-long-text");
  const [phase, setPhase] = useState("intro");
  const [caseIndex, setCaseIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const completionLogged = useRef(false);
  const completionPromise = useRef(null);
  const item = insideParagraphCases[caseIndex];
  const response = responses[item.id] || { answer: "", evidence: [], submitted: false };
  const submittedCount = Object.values(responses).filter((entry) => entry.submitted).length;
  const scores = useMemo(() => getScores(responses), [responses]);

  function startActivity() {
    completionLogged.current = false;
    completionPromise.current = null;
    setResponses({});
    setCaseIndex(0);
    setPhase("active");
    logOteTrainingStarted({
      progressId: PROGRESS_ID,
      section: "reading",
      part: "part-4",
      mode: "inside_paragraph",
      taskId: "advanced-reading-part-4-inside-paragraph",
      taskTitle: "Inside the Paragraph",
      variant: "advanced",
    });
  }

  function updateResponse(patch) {
    setResponses((current) => ({
      ...current,
      [item.id]: {
        answer: "",
        evidence: [],
        submitted: false,
        ...current[item.id],
        ...patch,
      },
    }));
  }

  function chooseAnswer(answer) {
    if (response.submitted) return;
    updateResponse({ answer });
  }

  function toggleEvidence(sentenceId) {
    if (!response.answer || response.submitted) return;
    const selected = response.evidence || [];
    if (selected.includes(sentenceId)) {
      updateResponse({ evidence: selected.filter((id) => id !== sentenceId) });
      return;
    }
    if (selected.length >= 2) return;
    updateResponse({ evidence: [...selected, sentenceId] });
  }

  function recordCompletion(nextResponses) {
    if (completionLogged.current) return Promise.resolve(true);
    if (completionPromise.current) return completionPromise.current;
    const finalScores = getScores(nextResponses);
    completionPromise.current = logOteTrainingCompleted({
      progressId: PROGRESS_ID,
      section: "reading",
      part: "part-4",
      mode: "inside_paragraph",
      taskId: "advanced-reading-part-4-inside-paragraph",
      taskTitle: "Inside the Paragraph",
      variant: "advanced",
      score: finalScores.answers,
      total: insideParagraphCases.length,
      percent: Math.round((finalScores.answers / insideParagraphCases.length) * 100),
      evidenceScore: finalScores.evidence,
      evidenceTotal: insideParagraphCases.length,
      reason: "completed",
    })
      .then(() => { completionLogged.current = true; return true; })
      .catch((error) => { console.warn("[Inside the Paragraph] completion save failed", error); return false; })
      .finally(() => { completionPromise.current = null; });
    return completionPromise.current;
  }

  function submitCase() {
    if (!response.answer || !response.evidence?.length || response.submitted) return;
    const evidenceAssessment = assessEvidence(item, response.evidence, response.answer);
    const nextResponses = {
      ...responses,
      [item.id]: { ...response, submitted: true, evidenceAssessment },
    };
    setResponses(nextResponses);
    if (Object.values(nextResponses).filter((entry) => entry.submitted).length === insideParagraphCases.length) {
      void recordCompletion(nextResponses);
    }
  }

  async function showResults() {
    if (submittedCount !== insideParagraphCases.length) return;
    setPhase("complete");
    const saved = await recordCompletion(responses);
    if (!saved) void recordCompletion(responses);
  }

  function moveAfterCase() {
    const nextUnfinished = insideParagraphCases.findIndex((candidate, index) => index > caseIndex && !responses[candidate.id]?.submitted);
    if (nextUnfinished >= 0) {
      setCaseIndex(nextUnfinished);
      return;
    }
    const firstUnfinished = insideParagraphCases.findIndex((candidate) => !responses[candidate.id]?.submitted);
    if (firstUnfinished >= 0) setCaseIndex(firstUnfinished);
  }

  if (phase === "intro") {
    return <main className="ote-training-page ote-inside-paragraph-page">
      <Seo title="Inside the Paragraph | OTE Advanced Reading Part 4 | Seif English" description="Choose a Part 4 interpretation, then identify the sentence evidence that proves it." />
      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}><ArrowLeft size={18} aria-hidden="true" /> Back to Part 4</button>
      <header className="ote-training-hero"><p className="ote-kicker">Advanced Reading Part 4 · Skill trainer</p><h1>Inside the Paragraph</h1><p>Read locally, choose carefully, and prove your interpretation from the paragraph.</p></header>
      <section className="ote-practice-task-card ote-inside-intro">
        <div className="ote-recorder-top"><div><p className="ote-kicker">Six cases</p><h2>One paragraph at a time</h2></div><Search size={42} aria-hidden="true" /></div>
        <div className="ote-training-rule-grid">
          <article><h3>1. Choose</h3><p>Read the complete paragraph and select the best answer.</p></article>
          <article><h3>2. Prove</h3><p>Select one or two sentences that provide the strongest evidence.</p></article>
          <article><h3>3. Compare</h3><p>See your evidence and the model evidence inside the original paragraph.</p></article>
        </div>
        <div className="ote-inside-intro-note"><Target size={20} aria-hidden="true" /><p><strong>Keep both scores separate.</strong> A correct answer can still be based on weak evidence—and strong evidence can still be misinterpreted.</p></div>
        <div className="ote-recorder-actions"><button type="button" onClick={startActivity}>Start case 1</button></div>
      </section>
    </main>;
  }

  if (phase === "complete") {
    return <main className="ote-training-page ote-inside-paragraph-page">
      <Seo title="Inside the Paragraph Results | OTE Advanced Reading Part 4 | Seif English" description="Results from the Inside the Paragraph evidence trainer." />
      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}><ArrowLeft size={18} aria-hidden="true" /> Back to Part 4</button>
      <section className="ote-practice-complete ote-inside-complete">
        <CheckCircle2 size={42} aria-hidden="true" />
        <div><p className="ote-kicker">Inside the Paragraph complete</p><h1>Interpretation and evidence</h1>
          <div className="ote-inside-score-grid"><article><span>Answer choices</span><strong>{scores.answers}/{insideParagraphCases.length}</strong></article><article><span>Strong evidence</span><strong>{scores.evidence}/{insideParagraphCases.length}</strong></article></div>
          <div className="ote-inside-results">{insideParagraphCases.map((caseItem, index) => { const result = responses[caseItem.id]; const answerCorrect = result?.answer === caseItem.answer; return <button type="button" key={caseItem.id} onClick={() => { setCaseIndex(index); setPhase("active"); }}><span>{answerCorrect ? <CircleCheck size={21} /> : <CircleX size={21} />}</span><span><strong>Case {index + 1}: {caseItem.title}</strong><small>Answer: {answerCorrect ? "Correct" : "Review"} · Evidence: {result?.evidenceAssessment?.label || "Review"}</small></span></button>; })}</div>
          <div className="ote-complete-actions"><button type="button" onClick={() => navigate(menuPath)}>Back to Part 4</button><button type="button" onClick={startActivity}><RotateCcw size={18} aria-hidden="true" /> Try again</button></div>
        </div>
      </section>
    </main>;
  }

  const selectedEvidence = new Set(response.evidence || []);
  const modelEvidence = new Set(response.submitted ? item.evidence.model : []);
  const answerCorrect = response.answer === item.answer;

  return <main className="ote-training-page ote-inside-paragraph-page">
    <Seo title={`${item.title} | Inside the Paragraph | Seif English`} description="Advanced Reading Part 4 paragraph interpretation and evidence practice." />
    <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}><ArrowLeft size={18} aria-hidden="true" /> Back to Part 4</button>
    <header className="ote-training-hero ote-inside-hero"><p className="ote-kicker">Advanced Reading Part 4 · Inside the Paragraph</p><h1>{item.title}</h1><p>{submittedCount} of {insideParagraphCases.length} cases completed</p></header>
    <nav className="ote-inside-case-nav" aria-label="Choose a case">{insideParagraphCases.map((caseItem, index) => { const done = responses[caseItem.id]?.submitted; return <button type="button" key={caseItem.id} className={`${index === caseIndex ? "is-current" : ""} ${done ? "is-done" : ""}`} aria-current={index === caseIndex ? "step" : undefined} onClick={() => setCaseIndex(index)}><span>{done ? <CircleCheck size={17} /> : <Circle size={17} />}</span>Case {index + 1}</button>; })}</nav>

    <section className="ote-inside-workspace">
      <aside className="ote-inside-question-card">
        <div className="ote-inside-question-copy"><div><p className="ote-kicker">Question · {item.type}</p><h2>{item.question}</h2></div><p>{!response.answer ? "Choose the best interpretation, then prove it from the paragraph." : response.submitted ? "Compare all three options before moving on." : "Now select one or two sentences that best support your answer."}</p></div>
        <div className="ote-inside-options">{item.options.map((option) => { const selected = response.answer === option.id; const correct = option.id === item.answer; return <article key={option.id} className={`${selected ? "is-selected" : ""} ${response.submitted && correct ? "is-answer" : ""} ${response.submitted && selected && !correct ? "is-incorrect" : ""}`}><button type="button" disabled={response.submitted} onClick={() => chooseAnswer(option.id)}><strong>{option.id}</strong><span>{option.text}</span></button>{response.submitted ? <p><strong>{correct ? "Best answer." : "Distractor."}</strong> {option.feedback}</p> : null}</article>; })}</div>
      </aside>

      <article className="ote-inside-reading-card">
        <header><div><p className="ote-kicker">Case {caseIndex + 1} · Reading text</p><h2>{item.title}</h2></div><p>{response.answer && !response.submitted ? "Select one or two sentences as evidence." : !response.answer ? "Read the complete paragraph before deciding." : "Compare your selection with the model evidence."}</p></header>
        {response.submitted ? <div className="ote-inside-evidence-legend"><span className="is-student">Your evidence</span><span className="is-model">Model evidence</span><span className="is-both">Both</span></div> : null}
        <p className={`ote-inside-paragraph ${response.answer && !response.submitted ? "is-selecting" : ""}`}>{item.sentences.map((sentence) => { const selected = selectedEvidence.has(sentence.id); const model = modelEvidence.has(sentence.id); const selectable = Boolean(response.answer && !response.submitted); return <React.Fragment key={sentence.id}><span className={`ote-inside-sentence ${selected ? "is-student" : ""} ${model ? "is-model" : ""} ${selected && model ? "is-both" : ""}`} role={selectable ? "button" : undefined} tabIndex={selectable ? 0 : undefined} aria-pressed={selectable ? selected : undefined} onClick={selectable ? () => toggleEvidence(sentence.id) : undefined} onKeyDown={selectable ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggleEvidence(sentence.id); } } : undefined}>{sentence.text}</span>{" "}</React.Fragment>; })}</p>
      </article>

      <section className="ote-inside-review-panel" aria-label="Answer and evidence review">
        {response.answer && !response.submitted ? <div className="ote-inside-evidence-prompt"><strong>Now prove it.</strong><span>{response.evidence?.length || 0}/2 sentences selected</span></div> : null}
        {response.submitted ? <div className="ote-inside-feedback"><div className={`ote-inside-result-banner ${answerCorrect ? "is-correct" : "is-wrong"}`}>{answerCorrect ? <CircleCheck size={22} /> : <CircleX size={22} />}<p><strong>Answer: {answerCorrect ? "Correct" : `The best answer is ${item.answer}`}</strong>{item.explanation}</p></div><div className={`ote-inside-result-banner is-${response.evidenceAssessment.id}`}><Target size={22} /><p><strong>Evidence: {response.evidenceAssessment.label}</strong>{response.evidenceAssessment.copy}</p></div><p className="ote-inside-lesson"><strong>Distractor lesson:</strong> {item.lesson}</p></div> : null}
        <div className="ote-inside-actions">{!response.submitted ? <button type="button" disabled={!response.answer || !response.evidence?.length} onClick={submitCase}>Submit answer and evidence</button> : submittedCount === insideParagraphCases.length ? <button type="button" onClick={showResults}>View results</button> : <button type="button" onClick={moveAfterCase}>Next unfinished case</button>}</div>
      </section>
    </section>
  </main>;
}
