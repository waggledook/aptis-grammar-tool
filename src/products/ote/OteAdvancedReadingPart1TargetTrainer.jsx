import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  ListChecks,
  RotateCcw,
  Search,
  Target,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import ReadingCaseNavigator from "./ReadingCaseNavigator.jsx";
import "./styles/ote.css";

const READING_TARGETS = [
  { id: "personal-response", label: "Personal response", lookFor: "A feeling, reaction, realisation or change of mind." },
  { id: "writers-view", label: "Writer’s view", lookFor: "Approval, criticism, evaluation, advice or a priority." },
  { id: "reason", label: "Reason or motivation", lookFor: "Why somebody acted, waited or made a decision." },
  { id: "purpose", label: "Purpose of information", lookFor: "Why an example, study, detail or earlier event is mentioned." },
  { id: "implied", label: "Implied meaning", lookFor: "Something suggested but not stated directly." },
  { id: "finding", label: "Finding or conclusion", lookFor: "What evidence shows and how certain the conclusion is." },
];

const CASES = [
  {
    id: "baton",
    title: "Taking the baton",
    source: "Extract from a novel",
    question: "What does Lena realise during the rehearsal?",
    target: "personal-response",
    targetFeedback: "The question asks about a realisation: how Lena’s understanding of herself changes during the experience.",
    prompt: "Lena realises that…",
    paragraphs: [
      "When the conductor failed to appear, Lena was told to begin the rehearsal. She had spent three years at the second desk watching his broad, theatrical gestures, and initially copied them. Her first entry came too early. The violins corrected themselves without complaint, and the room did not collapse into judgement as she had imagined.",
      "By the second movement, her movements had become smaller and more precise. When the conductor finally entered, she handed back the baton, then felt unexpectedly reluctant to return to her chair. What surprised her was not that she had survived the half-hour, but that leading it had begun to feel less like an emergency and more like work she could learn.",
    ],
    options: [
      { id: "A", text: "She may be more capable of directing the group than she had assumed." },
      { id: "B", text: "Her success depends on copying the regular conductor’s technique." },
      { id: "C", text: "The musicians have become dissatisfied with the regular conductor." },
    ],
    answer: "A",
    why: "Lena expects the rehearsal to go badly, but she begins to see conducting as a skill she could develop.",
    distractor: "B uses a real detail: Lena copies the conductor at first. However, she improves when she develops a smaller, more precise style of her own.",
    evidence: [
      "the room did not collapse into judgement as she had imagined",
      "her movements had become smaller and more precise",
      "felt unexpectedly reluctant to return to her chair",
      "work she could learn",
    ],
  },
  {
    id: "long-way-home",
    title: "The Long Way Home",
    source: "Review",
    question: "What does the reviewer particularly admire about the series?",
    target: "writers-view",
    targetFeedback: "Look for the feature the reviewer values most. Other positive and negative comments may be distractions.",
    prompt: "The reviewer most admires the way the series…",
    paragraphs: [
      "The Long Way Home follows a family driving across three countries to attend a wedding. The plot could easily have become a sequence of comic disasters, and there are moments when the dialogue strains too hard for humour.",
      "Yet the production’s great achievement is the way it allows small misunderstandings to accumulate without assigning blame. Each episode revisits one incident from another passenger’s perspective, and a remark that seemed cruel in one version becomes protective, or merely tired, in the next.",
      "The final episode is quieter than expected and may disappoint listeners hoping for a dramatic reconciliation. For me, that restraint is exactly right: the series trusts its audience to recognise that understanding another person does not necessarily solve the disagreement.",
    ],
    options: [
      { id: "A", text: "It balances serious family conflict with consistently successful humour." },
      { id: "B", text: "It brings the characters’ disagreements to a realistic final resolution." },
      { id: "C", text: "It uses different viewpoints to complicate simple judgements about people." },
    ],
    answer: "C",
    why: "The reviewer admires how changing perspectives stop the audience from making simple judgements about the characters.",
    distractor: "B is tempting because the reviewer praises the quiet ending. However, the disagreement is not resolved; understanding another person does not necessarily solve it.",
    evidence: [
      "without assigning blame",
      "revisits one incident from another passenger’s perspective",
      "becomes protective, or merely tired, in the next",
      "understanding another person does not necessarily solve the disagreement",
    ],
  },
  {
    id: "judging-panel",
    title: "Leaving the panel",
    source: "Formal letter",
    question: "Why does the writer ask to withdraw from the judging panel?",
    target: "reason",
    targetFeedback: "Find the reason for the requested action. Separate what the writer believes from what she worries other people may believe.",
    prompt: "She wants to withdraw because…",
    paragraphs: [
      "Dear Ms Rahman,",
      "Thank you for inviting me to remain on the short-film judging panel. I accepted before seeing the final shortlist. One of the directors, Joel Park, was a student in my documentary class until last year.",
      "I do not believe this would prevent me from assessing his film fairly; indeed, I was often among his more demanding critics. Nevertheless, other entrants would have no way of knowing how limited our contact has been since the course ended. Even a decision reached honestly could therefore appear influenced by a prior relationship.",
      "I would prefer to withdraw now and, if useful, help you identify another judge with no connection to the candidates.",
      "Yours sincerely,\nMarian Cole",
    ],
    options: [
      { id: "A", text: "She no longer feels qualified to assess the former student’s work." },
      { id: "B", text: "Her involvement could make the judging process appear less impartial." },
      { id: "C", text: "She has maintained a close professional relationship with one candidate." },
    ],
    answer: "B",
    why: "She believes she can remain fair. Her concern is that the judging process may appear biased to the other candidates.",
    distractor: "A confuses actual fairness with the appearance of fairness. The writer clearly says that she can assess the film fairly.",
    evidence: [
      "I do not believe this would prevent me from assessing his film fairly",
      "other entrants would have no way of knowing how limited our contact has been",
      "could therefore appear influenced by a prior relationship",
    ],
  },
  {
    id: "backups",
    title: "Backups are not recovery",
    source: "Professional article",
    question: "Why does the writer mention the closure of Northbridge Clinic?",
    target: "purpose",
    targetFeedback: "Do not only identify what happened. Ask what general point the clinic example helps the writer demonstrate.",
    prompt: "The clinic is mentioned to show that…",
    paragraphs: [
      "Many organisations treat backup systems as proof that they can recover from a cyberattack. The closure of Northbridge Clinic last winter shows why that confidence can be misplaced.",
      "The clinic had copied its patient records every night, yet restoration took six days because the recovery software had not been tested since a major upgrade. Several files were intact but could not initially be opened by the new system.",
      "The incident is not evidence that backups are pointless. Rather, it demonstrates that storing information and being able to restore it are separate capabilities. A recovery plan should therefore be rehearsed under realistic conditions.",
    ],
    options: [
      { id: "A", text: "Possessing backups may create false confidence unless recovery has been tested." },
      { id: "B", text: "Healthcare organisations face more serious cyber risks than other institutions." },
      { id: "C", text: "Newly upgraded software is generally less reliable than older technology." },
    ],
    answer: "A",
    why: "The example shows that keeping copies of data is not enough if an organisation has never tested whether it can restore them.",
    distractor: "C uses the real detail about the software upgrade. The writer does not, however, compare newer and older software in general.",
    evidence: [
      "copied its patient records every night",
      "restoration took six days",
      "Several files were intact but could not initially be opened",
      "storing information and being able to restore it are separate capabilities",
    ],
  },
  {
    id: "membership",
    title: "Flexible membership",
    source: "Blog entry",
    question: "What does the blogger imply about the company’s new membership plan?",
    target: "implied",
    targetFeedback: "The criticism is not stated in one direct sentence. Combine the details to understand the blogger’s overall message.",
    prompt: "The blogger suggests that the plan…",
    paragraphs: [
      "CoWorkNow’s new ‘flexible’ membership was presented as a response to freelancers who no longer wanted a permanent desk. Members can reserve space by the hour and cancel through the app.",
      "The attractive headline price, however, applies only to bookings made ten days in advance. Same-day reservations cost almost twice as much, while cancellations within twenty-four hours lose the full fee.",
      "In practice, regular users must either predict their schedules well ahead or pay a premium for the spontaneity the plan supposedly offers. The company may have removed the monthly contract, but it has replaced one kind of commitment with another—one that is less visible when customers first compare prices.",
    ],
    options: [
      { id: "A", text: "It is designed mainly for people who rarely need to book in advance." },
      { id: "B", text: "It uses cancellation charges primarily to reduce overcrowding." },
      { id: "C", text: "It offers less genuine flexibility than its advertising initially suggests." },
    ],
    answer: "C",
    why: "Although the plan is advertised as flexible, customers must either plan well ahead or pay considerably more.",
    distractor: "A reverses the blogger’s point. People who cannot book early receive the least attractive price.",
    evidence: [
      "applies only to bookings made ten days in advance",
      "Same-day reservations cost almost twice as much",
      "pay a premium for the spontaneity the plan supposedly offers",
      "replaced one kind of commitment with another",
    ],
  },
  {
    id: "lecture-speed",
    title: "Watching lectures faster",
    source: "Research extract",
    question: "What do the findings of the study suggest?",
    target: "finding",
    targetFeedback: "Identify the conclusion supported by the evidence. Notice qualifications and differences of degree.",
    prompt: "The results suggest that…",
    paragraphs: [
      "In our study, students watched the same recorded lecture at normal speed, 1.25 times speed or 1.75 times speed.",
      "Immediate quiz scores were similar for the first two groups, while the fastest group performed slightly worse. One week later, the 1.25 group retained almost as much information as those who watched at normal speed, whereas the 1.75 group showed a much larger decline.",
      "Participants’ confidence did not reflect this difference: viewers at the highest speed often believed they had understood the material as well as everyone else.",
      "The results suggest that a modest increase in playback speed may save time without a major cost, but stronger acceleration can conceal losses that become clear only later.",
    ],
    options: [
      { id: "A", text: "Students can reliably judge how playback speed has affected their learning." },
      { id: "B", text: "Moderate acceleration may be acceptable, while higher speeds can damage later recall." },
      { id: "C", text: "Increasing playback speed has the same effect on immediate and delayed understanding." },
    ],
    answer: "B",
    why: "The evidence supports a qualified conclusion: a modest increase may have little effect, but a much faster speed can harm later recall.",
    distractor: "A reverses the evidence about confidence. Students at the fastest speed often overestimated how well they had learned.",
    evidence: [
      "Immediate quiz scores were similar for the first two groups",
      "the 1.25 group retained almost as much information",
      "the 1.75 group showed a much larger decline",
      "confidence did not reflect this difference",
    ],
  },
];

function EvidenceText({ text, evidence, revealed }) {
  if (!revealed) return text;
  const ranges = evidence
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

function ReadingText({ item, evidenceRevealed }) {
  return (
    <article className={`ote-reading-target-text ${evidenceRevealed ? "has-evidence" : ""}`}>
      <header><span>{item.source}</span><h2>{item.title}</h2></header>
      {item.paragraphs.map((paragraph, index) => (
        <p key={`${item.id}:${index}`}><EvidenceText text={paragraph} evidence={item.evidence} revealed={evidenceRevealed} /></p>
      ))}
    </article>
  );
}

function getScoreMessage(targetScore, answerScore) {
  if (targetScore === 6 && answerScore === 6) return "Excellent. You identified every reading purpose and used it to find the answer.";
  if (targetScore >= 4 && answerScore >= 4) return "Strong work. Keep forming your own answer before you compare the options.";
  if (targetScore < answerScore) return "Your final answers were stronger than your target choices. Spend a little longer deciding exactly what each question asks.";
  return "Use the question as a search instruction: decide what kind of meaning you need before you read closely.";
}

export default function OteAdvancedReadingPart1TargetTrainer({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [caseIndex, setCaseIndex] = useState(0);
  const [work, setWork] = useState({});
  const [complete, setComplete] = useState(false);
  const completionLoggedRef = useRef(false);
  const item = CASES[caseIndex];
  const itemWork = work[item.id] || {};
  const target = READING_TARGETS.find((entry) => entry.id === item.target);
  const targetCorrect = itemWork.target === item.target;
  const answerCorrect = itemWork.answer === item.answer;
  const basePath = nativeRoutes ? "/reading/advanced/part-1-short-texts" : "/ote/reading/advanced/part-1-short-texts";
  const menuPath = getSitePath(basePath);
  const practicePath = getSitePath(`${basePath}/practice/pilot-1`);
  const targetScore = useMemo(() => CASES.filter((entry) => work[entry.id]?.target === entry.target).length, [work]);
  const answerScore = useMemo(() => CASES.filter((entry) => work[entry.id]?.answer === entry.answer).length, [work]);
  const checkedAnswers = CASES.filter((entry) => work[entry.id]?.answerChecked).length;

  useEffect(() => {
    if (!complete || completionLoggedRef.current) return;
    completionLoggedRef.current = true;
    logOteTrainingCompleted({
      progressId: "reading.part1.advanced-reading-target",
      section: "reading",
      part: "part-1",
      mode: "reading_target_trainer",
      taskId: "advanced-reading-part-1-reading-target",
      taskTitle: "Set Your Reading Target",
      variant: "advanced",
      score: targetScore + answerScore,
      total: 12,
      targetScore,
      answerScore,
    });
  }, [answerScore, complete, targetScore]);

  function updateItem(changes) {
    setWork((current) => ({ ...current, [item.id]: { ...(current[item.id] || {}), ...changes } }));
  }

  function nextCase() {
    if (!itemWork.answerChecked) return;
    if (caseIndex === CASES.length - 1) {
      setComplete(true);
      return;
    }
    setCaseIndex((current) => current + 1);
  }

  function resetActivity() {
    setCaseIndex(0);
    setWork({});
    setComplete(false);
    completionLoggedRef.current = false;
  }

  return (
    <main className="ote-training-page ote-reading-target-page">
      <Seo title="Set Your Reading Target | OTE Advanced Reading Part 1 | Seif English" description="Practise identifying the reading purpose, predicting an answer and evaluating options in OTE Advanced Reading Part 1." />
      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}><ArrowLeft size={18} aria-hidden="true" /> Back to Part 1 training</button>
      <header className="ote-training-hero">
        <p className="ote-kicker">Advanced Reading Part 1 · Skill trainer</p>
        <h1>Set Your Reading Target</h1>
        <p>Decide what the question asks, read with that purpose, form your own answer, and only then compare the three options.</p>
      </header>
      <section className="ote-training-summary" aria-label="Reading Target trainer overview">
        <div><Target size={24} aria-hidden="true" /><strong>1. Set the target</strong><span>Identify the kind of meaning the question asks for.</span></div>
        <div><BookOpen size={24} aria-hidden="true" /><strong>2. Read and predict</strong><span>Form a short answer before the options can influence you.</span></div>
        <div><ListChecks size={24} aria-hidden="true" /><strong>3. Test the options</strong><span>Choose the closest complete match and inspect the evidence.</span></div>
      </section>
      <details className="ote-reading-target-reference">
        <summary>Reading target reference</summary>
        <div>{READING_TARGETS.map((entry) => <article key={entry.id}><strong>{entry.label}</strong><span>{entry.lookFor}</span></article>)}</div>
      </details>

      {complete ? (
        <section className="ote-training-section ote-cohesion-complete">
          <div className="ote-cohesion-complete-icon"><Target size={34} aria-hidden="true" /></div>
          <p className="ote-kicker">All six cases complete</p>
          <h2>Your reading routine report</h2>
          <div className="ote-cohesion-score-grid">
            <article><span>Reading targets</span><strong>{targetScore} / 6</strong><p>Did you understand exactly what each question asked?</p></article>
            <article><span>Final answers</span><strong>{answerScore} / 6</strong><p>Did you interpret the evidence and reject the distractors?</p></article>
          </div>
          <p className="ote-reading-target-result">{getScoreMessage(targetScore, answerScore)}</p>
          <div className="ote-reading-target-results">
            {CASES.map((entry, index) => {
              const targetRight = work[entry.id]?.target === entry.target;
              const answerRight = work[entry.id]?.answer === entry.answer;
              return (
                <button key={entry.id} type="button" onClick={() => { setCaseIndex(index); setComplete(false); }}>
                  {targetRight && answerRight ? <CheckCircle2 size={19} aria-hidden="true" /> : <XCircle size={19} aria-hidden="true" />}
                  <span>Case {index + 1}: {entry.title}</span>
                  <small>Target {targetRight ? "✓" : "✗"} · Answer {answerRight ? "✓" : "✗"}</small>
                </button>
              );
            })}
          </div>
          <div className="ote-cohesion-actions is-complete">
            <button className="is-secondary" type="button" onClick={resetActivity}><RotateCcw size={17} aria-hidden="true" /> Try all cases again</button>
            <button type="button" onClick={() => navigate(practicePath)}>Open timed practice <ChevronRight size={17} aria-hidden="true" /></button>
          </div>
        </section>
      ) : (
        <section className="ote-training-section ote-reading-target-runner">
          <div className="ote-cohesion-progress-head">
            <div><span>Case {caseIndex + 1} of {CASES.length} · {item.source}</span><strong>{checkedAnswers} / 6 completed</strong></div>
            <div className="ote-practice-progress-bar" aria-hidden="true"><span style={{ width: `${(checkedAnswers / CASES.length) * 100}%` }} /></div>
          </div>
          <ReadingCaseNavigator
            items={CASES}
            currentIndex={caseIndex}
            isComplete={(entry) => Boolean(work[entry.id]?.answerChecked)}
            onSelect={(index) => setCaseIndex(index)}
          />
          <article className="ote-reading-target-case">
            <header><p className="ote-kicker">Case {caseIndex + 1} · {item.title}</p><h2>{item.question}</h2></header>
            <section className="ote-reading-target-step">
              <div className="ote-reading-target-step-number">1</div>
              <div>
                <h3>What is your reading target?</h3>
                <p>Choose what kind of meaning you need to find.</p>
                <div className="ote-reading-target-select-row">
                  <select value={itemWork.target || ""} disabled={itemWork.targetChecked} onChange={(event) => updateItem({ target: event.target.value })} aria-label="Select the reading target">
                    <option value="">Select the reading target…</option>
                    {READING_TARGETS.map((entry) => <option value={entry.id} key={entry.id}>{entry.label}</option>)}
                  </select>
                  {!itemWork.targetChecked ? <button type="button" disabled={!itemWork.target} onClick={() => updateItem({ targetChecked: true })}>Check target</button> : null}
                </div>
                {itemWork.targetChecked ? (
                  <div className={`ote-reading-target-feedback ${targetCorrect ? "is-correct" : "is-wrong"}`} aria-live="polite">
                    {targetCorrect ? <CheckCircle2 size={20} aria-hidden="true" /> : <XCircle size={20} aria-hidden="true" />}
                    <p><strong>{targetCorrect ? "Correct target." : `Best target: ${target.label}.`}</strong> {item.targetFeedback}</p>
                  </div>
                ) : null}
              </div>
            </section>

            {itemWork.targetChecked ? (
              <section className="ote-reading-target-step">
                <div className="ote-reading-target-step-number">2</div>
                <div>
                  <h3>Read with that target</h3>
                  <ReadingText item={item} evidenceRevealed={itemWork.answerChecked} />
                  {!itemWork.optionsRevealed ? (
                    <div className="ote-reading-target-prediction">
                      <label htmlFor={`prediction-${item.id}`}><strong>Form your answer</strong><span>{item.prompt}</span></label>
                      <textarea id={`prediction-${item.id}`} value={itemWork.note || ""} onChange={(event) => updateItem({ note: event.target.value })} placeholder="Optional: write a few words here…" />
                      <button type="button" onClick={() => updateItem({ optionsRevealed: true })}>{itemWork.note?.trim() ? "Reveal the options" : "I have an answer in mind"}<Eye size={17} aria-hidden="true" /></button>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}

            {itemWork.optionsRevealed ? (
              <section className="ote-reading-target-step">
                <div className="ote-reading-target-step-number">3</div>
                <div>
                  <h3>Choose the closest match</h3>
                  <div className="ote-cohesion-options" role="radiogroup" aria-label={`Answer options for case ${caseIndex + 1}`}>
                    {item.options.map((option) => (
                      <button
                        className={`${itemWork.answer === option.id ? "is-selected" : ""} ${itemWork.answerChecked && option.id === item.answer ? "is-answer" : ""} ${itemWork.answerChecked && itemWork.answer === option.id && !answerCorrect ? "is-incorrect" : ""}`}
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={itemWork.answer === option.id}
                        disabled={itemWork.answerChecked}
                        onClick={() => updateItem({ answer: option.id })}
                      ><strong>{option.id}</strong><span>{option.text}</span></button>
                    ))}
                  </div>
                  {!itemWork.answerChecked ? <button className="ote-reading-target-check" type="button" disabled={!itemWork.answer} onClick={() => updateItem({ answerChecked: true })}>Check answer</button> : (
                    <div className={`ote-reading-target-answer ${answerCorrect ? "is-correct" : "is-wrong"}`} aria-live="polite">
                      <div>{answerCorrect ? <CheckCircle2 size={21} aria-hidden="true" /> : <XCircle size={21} aria-hidden="true" />}<p><strong>{answerCorrect ? "Correct." : `The best answer is ${item.answer}.`}</strong> {item.why}</p></div>
                      <details><summary>Why the closest distractor is wrong</summary><p>{item.distractor}</p></details>
                    </div>
                  )}
                </div>
              </section>
            ) : null}

            <div className="ote-cohesion-actions">
              <button className="is-secondary" type="button" disabled={caseIndex === 0} onClick={() => setCaseIndex((current) => Math.max(0, current - 1))}><ChevronLeft size={17} aria-hidden="true" /> Previous case</button>
              <button type="button" disabled={!itemWork.answerChecked} onClick={nextCase}>{caseIndex === CASES.length - 1 ? "View final report" : "Next case"}<ChevronRight size={17} aria-hidden="true" /></button>
            </div>
          </article>
        </section>
      )}
    </main>
  );
}
