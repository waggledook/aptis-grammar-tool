import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Fingerprint,
  FlaskConical,
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

const DIAGNOSES = [
  { id: "different-question", label: "Answers a different question", description: "The option contains a true detail, but not the information requested." },
  { id: "too-strong", label: "Too strong", description: "The option removes a limit such as may, some, partly or not necessarily." },
  { id: "partly-supported", label: "Only partly supported", description: "One part is accurate, but the complete statement goes beyond the evidence." },
  { id: "not-supported", label: "Not supported", description: "The option sounds plausible, but the text gives no evidence for it." },
  { id: "reverses", label: "Reverses the meaning", description: "The option turns the writer’s meaning into its opposite." },
  { id: "wrong-link", label: "Wrong person, reason or time", description: "The view belongs to somebody else, or the option changes the cause, person or stage." },
];

const CASES = [
  {
    id: "borrowed-light",
    title: "Borrowed Light",
    source: "Exhibition review",
    question: "What does the reviewer particularly admire about the exhibition?",
    paragraphs: [
      "Borrowed Light follows people who work while most of the city is asleep: cleaners, bakers, couriers and hospital staff. Rao’s technical control is impressive. Difficult pools of artificial light remain clear without making the workplaces look unreal.",
      "A few captions explain the photographs’ symbolism more firmly than the images require, as though visitors could not be trusted to notice repeated gestures for themselves.",
      "Yet the exhibition’s real achievement emerges across the sequence. No single routine is presented as remarkable, but together the images form a patient portrait of work that the city depends on and rarely sees.",
    ],
    options: [
      { id: "A", text: "The technical skill used to photograph difficult night-time conditions" },
      { id: "B", text: "The way ordinary routines combine into a wider picture of unnoticed work" },
      { id: "C", text: "The captions used to direct visitors towards the photographs’ symbolism" },
    ],
    answer: "B",
    why: "The reviewer calls the cumulative portrait of unnoticed work the exhibition’s ‘real achievement’.",
    distractors: [
      {
        option: "A",
        diagnosis: "different-question",
        evidence: ["technical control is impressive", "real achievement emerges across the sequence"],
        note: "True detail, wrong importance",
        explanation: "The reviewer genuinely praises Rao’s technical control. However, the question asks what is particularly admired, and the text identifies the exhibition’s wider cumulative effect as its real achievement.",
      },
      {
        option: "C",
        diagnosis: "reverses",
        evidence: ["captions explain the photographs’ symbolism more firmly than the images require", "visitors could not be trusted"],
        note: "Correct feature, opposite evaluation",
        explanation: "The captions do direct attention to symbolism, but the reviewer thinks they explain too much. The option turns a criticism into praise.",
      },
    ],
  },
  {
    id: "drawing-meanings",
    title: "Drawing new meanings",
    source: "Research extract",
    question: "What do the findings suggest?",
    paragraphs: [
      "Researchers asked adult learners to study twenty-four unfamiliar symbols and their meanings. One group copied written definitions, a second created an original example for each symbol, and a third produced a quick drawing that represented its meaning.",
      "Immediate test scores were similar across the three groups. One week later, however, the drawing group remembered significantly more. A follow-up task showed that this advantage disappeared when participants produced decorative images that had no clear connection with the meaning.",
      "The study involved learners from one evening course, and the material was particularly suitable for visual representation. The findings should therefore not be assumed to apply equally to every subject or learner.",
    ],
    options: [
      { id: "A", text: "Adding any kind of drawing to study material improves long-term memory." },
      { id: "B", text: "Creating examples supports immediate understanding but not later recall." },
      { id: "C", text: "Representing meaning visually may strengthen the retention of new information." },
    ],
    answer: "C",
    why: "C preserves the study’s limits: meaningful visual representation may improve later retention in this kind of task.",
    distractors: [
      {
        option: "A",
        diagnosis: "too-strong",
        evidence: ["advantage disappeared", "no clear connection with the meaning", "should therefore not be assumed to apply equally to every subject or learner"],
        note: "The option has lost the qualifications",
        explanation: "The benefit appeared only when the drawing represented the meaning, and the researchers warn against applying the result to every subject or learner. A turns a limited finding into a general rule.",
      },
      {
        option: "B",
        diagnosis: "partly-supported",
        evidence: ["Immediate test scores were similar across the three groups", "drawing group remembered significantly more"],
        note: "A possible comparison becomes a definite absence of benefit",
        explanation: "The immediate part is compatible with the results. The text does not, however, establish that creating examples produced no later recall or no lasting value at all.",
      },
    ],
  },
  {
    id: "quotation",
    title: "An identifiable quotation",
    source: "Formal letter",
    question: "Why does Dana ask for the quotation to be removed?",
    paragraphs: [
      "Dear Dr Malik,",
      "Thank you for sending me the proof of your article based on the oral-history interviews about the Hartwell factory. I am pleased that my contribution has been included, and I do not object to your summary of the closure.",
      "I am concerned, however, about the passage quoting a former supervisor. I mentioned his comments only after being assured that individuals discussed in the interviews would not be identifiable. The quotation itself is accurate and not defamatory, but the combination of his exact role, department and words would make him immediately recognisable to many local readers.",
      "As he was not interviewed or asked for consent, could the quotation be removed before publication? I would be happy for the broader point to remain in anonymous form.",
      "Yours sincerely,\nDana Reeves",
    ],
    options: [
      { id: "A", text: "It may break an assurance that another person would remain unidentifiable." },
      { id: "B", text: "It does not accurately reflect what she said during the original interview." },
      { id: "C", text: "It may distract readers from the article’s main argument." },
    ],
    answer: "A",
    why: "Dana had been promised that people discussed in the interviews would not be identifiable, but the details could reveal who the supervisor is.",
    distractors: [
      {
        option: "B",
        diagnosis: "reverses",
        evidence: ["The quotation itself is accurate"],
        note: "Explicit confirmation becomes criticism",
        explanation: "Dana directly accepts the quotation’s accuracy. Her concern is identification and consent, not misquotation.",
      },
      {
        option: "C",
        diagnosis: "not-supported",
        evidence: ["I would be happy for the broader point to remain in anonymous form"],
        note: "Plausible editorial concern, absent evidence",
        explanation: "The letter never says that the quotation weakens or distracts from the article’s argument. Dana is happy for the broader point to remain; she only wants the identifying details removed.",
      },
    ],
  },
  {
    id: "apology",
    title: "Rewriting the apology",
    source: "Extract from a novel",
    question: "What does Elias realise about his earlier messages?",
    paragraphs: [
      "By midnight, Elias had rewritten the message four times. Each version began with the cancelled train, the impossible deadline and the battery failure—facts, all of them, and each placed carefully before the sentence admitting that he had forgotten Mara’s performance.",
      "Reading the latest draft aloud, he noticed that it asked for understanding before it offered regret. He deleted the first paragraph, then the second. The remaining line looked embarrassingly small:",
      "I said I would be there, and I wasn’t.",
      "For the first time that evening, Elias understood that his revisions had not really been attempts to explain the mistake. They had been attempts to control the verdict.",
    ],
    options: [
      { id: "A", text: "He has spent too much time explaining the circumstances of his absence." },
      { id: "B", text: "He has been shaping the apology to control how Mara judges him." },
      { id: "C", text: "Mara is unlikely to accept an apology delivered in a written message." },
    ],
    answer: "B",
    why: "Elias realises that he arranged the apology to secure understanding and influence Mara’s judgement before fully accepting responsibility.",
    distractors: [
      {
        option: "A",
        diagnosis: "partly-supported",
        evidence: ["cancelled train, the impossible deadline and the battery failure", "attempts to control the verdict"],
        note: "Accurate behaviour, incomplete interpretation",
        explanation: "A accurately describes what Elias did, but not what he now understands about his motive. He was not simply writing too much; he was trying to control Mara’s judgement.",
      },
      {
        option: "C",
        diagnosis: "not-supported",
        evidence: ["attempts to control the verdict"],
        note: "Reasonable prediction, absent evidence",
        explanation: "The extract gives no information about Mara’s preferred form of communication or whether she will accept the apology. The question concerns Elias’s self-realisation.",
      },
    ],
  },
  {
    id: "emergency-alerts",
    title: "Measuring emergency alerts",
    source: "Professional article",
    question: "Why does the writer mention the Redbank fire?",
    paragraphs: [
      "Emergency-warning systems are often judged by their delivery rate. During the Redbank fire, 96 per cent of phones in the target area received an alert within two minutes, a figure initially celebrated as a success.",
      "Follow-up interviews produced a less reassuring picture. Many residents did not understand the instruction to ‘prepare to relocate from Zone C’, and some did not know whether their homes were inside that zone. Evacuation therefore began slowly despite the rapid delivery.",
      "In our new trials, we measure whether recipients can identify the required action and location, not simply whether the message reaches their device. Alerts are also tested with residents unfamiliar with official terminology before being approved.",
    ],
    options: [
      { id: "A", text: "To show that delayed transmission reduced the practical value of the warning" },
      { id: "B", text: "To suggest that residents understood the message but chose not to follow it" },
      { id: "C", text: "To explain why successful alerts should be measured by understanding as well as delivery" },
    ],
    answer: "C",
    why: "The Redbank case shows that rapid delivery can look successful even when recipients do not understand what to do.",
    distractors: [
      {
        option: "A",
        diagnosis: "reverses",
        evidence: ["received an alert within two minutes", "despite the rapid delivery"],
        note: "Right result, opposite cause",
        explanation: "The message arrived quickly. The practical problem came after delivery because residents did not understand it. A reverses the article’s central contrast.",
      },
      {
        option: "B",
        diagnosis: "wrong-link",
        evidence: ["did not understand the instruction", "did not know whether their homes were inside that zone"],
        note: "Correct event, incorrect reason",
        explanation: "Residents were slow to act, but the writer attributes this to confusion, not a decision to ignore a message they understood.",
      },
    ],
  },
  {
    id: "rialto",
    title: "The Rialto’s empty seats",
    source: "Blog entry",
    question: "What does the blogger see as the main reason for the cinema’s decline?",
    paragraphs: [
      "Attendance at the Rialto cinema has fallen again, and the explanations appearing beneath every local-news article are predictable. Some blame streaming services; others say ticket prices have become unreasonable. A few insist that the cinema no longer shows films worth seeing.",
      "None of these claims explains why the independent cinema across town, which charges slightly more and screens many of the same releases, is regularly full.",
      "The Rialto’s real difficulty is that customers can no longer rely on it. Weekly programmes are sometimes published only two days in advance. Screenings disappear without warning, and opening times change from one week to the next. People stop building an evening around a venue when they cannot be confident that the advertised evening will happen.",
    ],
    options: [
      { id: "A", text: "The difficulty of relying on its programme from one week to the next" },
      { id: "B", text: "The growing preference for watching newly released films at home" },
      { id: "C", text: "The Rialto is less conveniently located than the independent cinema across town" },
    ],
    answer: "A",
    why: "The blogger calls reliability the cinema’s real difficulty and supports this with late programmes, cancelled screenings and changing opening times.",
    distractors: [
      {
        option: "B",
        diagnosis: "wrong-link",
        evidence: ["Some blame streaming services", "None of these claims explains"],
        note: "Somebody says it, but not the writer",
        explanation: "Streaming is an explanation offered by commenters, not one accepted by the blogger. The successful cinema across town helps the writer challenge that view.",
      },
      {
        option: "C",
        diagnosis: "not-supported",
        evidence: ["independent cinema across town"],
        note: "Plausible comparison, absent evidence",
        explanation: "The text tells us that another cinema is across town, but says nothing about whether either location is more convenient. The option adds a reason that the writer never gives.",
      },
    ],
  },
];

const DIAGNOSTIC_FEEDBACK = {
  "different-question": "You are spotting true information, but not always checking whether it answers the precise question.",
  "too-strong": "Watch for limits such as may, some, in this study and not necessarily.",
  "partly-supported": "Check every part of an option. One accurate phrase does not make the complete answer correct.",
  "not-supported": "Avoid filling gaps in the text with assumptions that seem reasonable in real life.",
  reverses: "Recheck contrasts, negatives and qualifications. The option may use the right topic but the opposite meaning.",
  "wrong-link": "Track who holds each view and distinguish the cause of an event from the event itself.",
};

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

function ForensicText({ item, activeDistractor, evidenceRevealed }) {
  return (
    <article className="ote-forensics-text">
      <header><span>{item.source}</span><h2>{item.title}</h2></header>
      {item.paragraphs.map((paragraph, index) => (
        <p key={`${item.id}:${index}`}><HighlightedText text={paragraph} fragments={activeDistractor?.evidence} active={evidenceRevealed} /></p>
      ))}
    </article>
  );
}

function getDiagnosisLabel(id) {
  return DIAGNOSES.find((entry) => entry.id === id)?.label || id;
}

export default function OteAdvancedReadingDistractorForensics({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [caseIndex, setCaseIndex] = useState(0);
  const [forensicIndex, setForensicIndex] = useState(0);
  const [work, setWork] = useState({});
  const [complete, setComplete] = useState(false);
  const completionLoggedRef = useRef(false);
  const item = CASES[caseIndex];
  const itemWork = work[item.id] || {};
  const activeDistractor = item.distractors[forensicIndex];
  const selectedDiagnosis = itemWork.diagnoses?.[activeDistractor.option];
  const diagnosisChecked = Boolean(itemWork.checkedDiagnoses?.[activeDistractor.option]);
  const diagnosisCorrect = selectedDiagnosis === activeDistractor.diagnosis;
  const answerCorrect = itemWork.answer === item.answer;
  const completedCases = CASES.filter((entry) => entry.distractors.every((distractor) => work[entry.id]?.checkedDiagnoses?.[distractor.option])).length;
  const basePath = nativeRoutes ? "/reading/advanced/part-1-short-texts" : "/ote/reading/advanced/part-1-short-texts";
  const menuPath = getSitePath(basePath);
  const practicePath = getSitePath(`${basePath}/practice/pilot-1`);
  const answerScore = useMemo(() => CASES.filter((entry) => work[entry.id]?.answer === entry.answer).length, [work]);
  const diagnosisScore = useMemo(() => CASES.reduce((score, entry) => score + entry.distractors.filter((distractor) => work[entry.id]?.diagnoses?.[distractor.option] === distractor.diagnosis).length, 0), [work]);
  const missedDiagnosisCounts = useMemo(() => {
    const counts = {};
    CASES.forEach((entry) => entry.distractors.forEach((distractor) => {
      const entryWork = work[entry.id] || {};
      if (entryWork.checkedDiagnoses?.[distractor.option] && entryWork.diagnoses?.[distractor.option] !== distractor.diagnosis) {
        counts[distractor.diagnosis] = (counts[distractor.diagnosis] || 0) + 1;
      }
    }));
    return counts;
  }, [work]);
  const priorityFeedback = Object.entries(missedDiagnosisCounts).sort((a, b) => b[1] - a[1]).slice(0, 2);

  useEffect(() => {
    if (!complete || completionLoggedRef.current) return;
    completionLoggedRef.current = true;
    logOteTrainingCompleted({
      progressId: "reading.part1.advanced-distractor-forensics",
      section: "reading",
      part: "part-1",
      mode: "distractor_forensics",
      taskId: "advanced-reading-part-1-distractor-forensics",
      taskTitle: "Distractor Forensics",
      variant: "advanced",
      score: answerScore + diagnosisScore,
      total: 18,
      answerScore,
      diagnosisScore,
    });
  }, [answerScore, complete, diagnosisScore]);

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
    if (forensicIndex === 0) {
      setForensicIndex(1);
      return;
    }
    if (caseIndex === CASES.length - 1) {
      setComplete(true);
      return;
    }
    setCaseIndex((current) => current + 1);
    setForensicIndex(0);
  }

  function resetActivity() {
    setCaseIndex(0);
    setForensicIndex(0);
    setWork({});
    setComplete(false);
    completionLoggedRef.current = false;
  }

  return (
    <main className="ote-training-page ote-forensics-page">
      <Seo title="Distractor Forensics | OTE Advanced Reading Part 1 | Seif English" description="Learn to identify exactly how realistic distractors change, overstate or misrepresent an Advanced Reading Part 1 text." />
      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}><ArrowLeft size={18} aria-hidden="true" /> Back to Part 1 training</button>
      <header className="ote-training-hero">
        <p className="ote-kicker">Advanced Reading Part 1 · Skill trainer</p>
        <h1>Distractor Forensics</h1>
        <p>Choose the best answer, then examine both wrong options and identify exactly where their meaning breaks down.</p>
      </header>
      <section className="ote-training-summary" aria-label="Distractor Forensics overview">
        <div><ListChecks size={24} aria-hidden="true" /><strong>6 best answers</strong><span>Answer each Part 1 question before beginning the forensic examination.</span></div>
        <div><Fingerprint size={24} aria-hidden="true" /><strong>12 diagnoses</strong><span>Classify both wrong answers, even when your first choice was correct.</span></div>
        <div><Search size={24} aria-hidden="true" /><strong>Evidence in context</strong><span>The relevant wording appears inside the original text, not in a duplicate.</span></div>
      </section>
      <details className="ote-forensics-reference">
        <summary>The six diagnoses</summary>
        <div>{DIAGNOSES.map((diagnosis) => <article key={diagnosis.id}><strong>{diagnosis.label}</strong><span>{diagnosis.description}</span></article>)}</div>
      </details>

      {complete ? (
        <section className="ote-training-section ote-cohesion-complete">
          <div className="ote-cohesion-complete-icon"><Fingerprint size={34} aria-hidden="true" /></div>
          <p className="ote-kicker">Forensic report complete</p>
          <h2>Two skills, separately measured</h2>
          <div className="ote-cohesion-score-grid">
            <article><span>Best answers</span><strong>{answerScore} / 6</strong><p>Your interpretation of each complete text.</p></article>
            <article><span>Distractor diagnoses</span><strong>{diagnosisScore} / 12</strong><p>Your analysis of exactly why each wrong answer fails.</p></article>
          </div>
          <div className="ote-forensics-diagnostic-report">
            {priorityFeedback.length ? priorityFeedback.map(([diagnosis]) => <article key={diagnosis}><ShieldQuestion size={20} aria-hidden="true" /><div><strong>{getDiagnosisLabel(diagnosis)}</strong><p>{DIAGNOSTIC_FEEDBACK[diagnosis]}</p></div></article>) : <article className="is-success"><CheckCircle2 size={20} aria-hidden="true" /><div><strong>Excellent diagnostic control</strong><p>You identified all twelve distractor patterns accurately.</p></div></article>}
          </div>
          <div className="ote-forensics-results">
            {CASES.map((entry, index) => {
              const answerRight = work[entry.id]?.answer === entry.answer;
              const diagnosesRight = entry.distractors.filter((distractor) => work[entry.id]?.diagnoses?.[distractor.option] === distractor.diagnosis).length;
              return <button key={entry.id} type="button" onClick={() => { setCaseIndex(index); setForensicIndex(0); setComplete(false); }}>{answerRight && diagnosesRight === 2 ? <CheckCircle2 size={19} aria-hidden="true" /> : <XCircle size={19} aria-hidden="true" />}<span>Case {index + 1}: {entry.title}</span><small>Answer {answerRight ? "✓" : "✗"} · Diagnoses {diagnosesRight}/2</small></button>;
            })}
          </div>
          <div className="ote-cohesion-actions is-complete">
            <button className="is-secondary" type="button" onClick={resetActivity}><RotateCcw size={17} aria-hidden="true" /> Try all cases again</button>
            <button type="button" onClick={() => navigate(practicePath)}>Open timed practice <ChevronRight size={17} aria-hidden="true" /></button>
          </div>
        </section>
      ) : (
        <section className="ote-training-section ote-forensics-runner">
          <div className="ote-cohesion-progress-head"><div><span>Case {caseIndex + 1} of {CASES.length} · {item.source}</span><strong>{completedCases} / 6 complete</strong></div><div className="ote-practice-progress-bar" aria-hidden="true"><span style={{ width: `${(completedCases / CASES.length) * 100}%` }} /></div></div>
          <ReadingCaseNavigator
            items={CASES}
            currentIndex={caseIndex}
            isComplete={(entry) => entry.distractors.every((distractor) => work[entry.id]?.checkedDiagnoses?.[distractor.option])}
            onSelect={(index) => { setCaseIndex(index); setForensicIndex(0); }}
          />
          <article className="ote-forensics-case">
            <header><p className="ote-kicker">Case {caseIndex + 1} · {item.title}</p><h2>{item.question}</h2></header>
            {!itemWork.answerChecked ? (
              <>
                <ForensicText item={item} />
                <div className="ote-cohesion-options" role="radiogroup" aria-label={`Answer options for case ${caseIndex + 1}`}>
                  {item.options.map((option) => <button className={itemWork.answer === option.id ? "is-selected" : ""} key={option.id} type="button" role="radio" aria-checked={itemWork.answer === option.id} onClick={() => updateItem({ answer: option.id })}><strong>{option.id}</strong><span>{option.text}</span></button>)}
                </div>
                <button className="ote-forensics-check" type="button" disabled={!itemWork.answer} onClick={() => updateItem({ answerChecked: true })}>Check best answer</button>
              </>
            ) : (
              <>
                <div className={`ote-forensics-answer-banner ${answerCorrect ? "is-correct" : "is-wrong"}`}>{answerCorrect ? <CheckCircle2 size={21} aria-hidden="true" /> : <XCircle size={21} aria-hidden="true" />}<p><strong>{answerCorrect ? "Correct." : `The best answer is ${item.answer}.`}</strong> {item.why}</p></div>
                <div className="ote-forensics-investigation-layout">
                  <ForensicText item={item} activeDistractor={activeDistractor} evidenceRevealed={diagnosisChecked} />
                  <aside className="ote-forensics-panel">
                    <div className="ote-distractor-lab-progress"><span>Wrong option {forensicIndex + 1} of 2</span><strong>Case {caseIndex + 1}</strong></div>
                    <div className="ote-distractor-lab-progress-bar" aria-hidden="true"><span style={{ width: `${((forensicIndex + (diagnosisChecked ? 1 : 0)) / 2) * 100}%` }} /></div>
                    <p className="ote-kicker">Forensic examination: {activeDistractor.option}</p>
                    <h3>{item.options.find((option) => option.id === activeDistractor.option)?.text}</h3>
                    <label htmlFor={`diagnosis-${item.id}-${activeDistractor.option}`}>Where does the meaning break down?</label>
                    <select id={`diagnosis-${item.id}-${activeDistractor.option}`} value={selectedDiagnosis || ""} disabled={diagnosisChecked} onChange={(event) => selectDiagnosis(event.target.value)}>
                      <option value="">Select a diagnosis…</option>
                      {DIAGNOSES.map((diagnosis) => <option value={diagnosis.id} key={diagnosis.id}>{diagnosis.label}</option>)}
                    </select>
                    {!diagnosisChecked ? <button className="ote-forensics-check" type="button" disabled={!selectedDiagnosis} onClick={checkDiagnosis}>Check diagnosis</button> : (
                      <div className={`ote-forensics-autopsy ${diagnosisCorrect ? "is-correct" : "is-wrong"}`} aria-live="polite">
                        <div>{diagnosisCorrect ? <CheckCircle2 size={20} aria-hidden="true" /> : <XCircle size={20} aria-hidden="true" />}<p><strong>{diagnosisCorrect ? "Diagnosis confirmed." : `Best diagnosis: ${getDiagnosisLabel(activeDistractor.diagnosis)}.`}</strong></p></div>
                        <span>{activeDistractor.note}</span><p>{activeDistractor.explanation}</p>
                      </div>
                    )}
                    <div className="ote-cohesion-actions">
                      <button className="is-secondary" type="button" disabled={forensicIndex === 0} onClick={() => setForensicIndex(0)}><ChevronLeft size={17} aria-hidden="true" /> Previous option</button>
                      <button type="button" disabled={!diagnosisChecked} onClick={advance}>{forensicIndex === 0 ? "Examine second option" : caseIndex === CASES.length - 1 ? "View final report" : "Next case"}<ChevronRight size={17} aria-hidden="true" /></button>
                    </div>
                  </aside>
                </div>
              </>
            )}
            {!itemWork.answerChecked ? <div className="ote-cohesion-actions"><button className="is-secondary" type="button" disabled={caseIndex === 0} onClick={() => { setCaseIndex((current) => Math.max(0, current - 1)); setForensicIndex(0); }}><ChevronLeft size={17} aria-hidden="true" /> Previous case</button></div> : null}
          </article>
        </section>
      )}
    </main>
  );
}
