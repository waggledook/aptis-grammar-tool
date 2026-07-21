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
  { id: "main-message", label: "Main message or opinion", lookFor: "The writer’s central idea, reaction or overall view." },
  { id: "purpose", label: "Purpose or reason for writing", lookFor: "Why the message, email, advert or notice was written." },
  { id: "action", label: "Action or instruction", lookFor: "What somebody needs, wants or advises another person to do." },
  { id: "specific", label: "Specific information", lookFor: "The correct detail, condition, cause, time, place or feature." },
];

const ROUNDS = [
  { title: "Clear Evidence", copy: "Find direct instructions, purposes and details." },
  { title: "Read the Whole Message", copy: "Use the whole text and reject options that repeat only one detail." },
];

const CASES = [
  {
    id: "reserved-book",
    title: "Reserved book",
    source: "Email",
    question: "What should Ella do before Saturday evening?",
    target: "action",
    targetFeedback: "You need to identify what the recipient is expected to do.",
    prompt: "Ella should…",
    paragraphs: [
      "From: Westfield Library\nTo: Ella Moore\nSubject: Your reservation",
      "Hi Ella,\n\nThe book you reserved has arrived. We can keep it for you until Saturday evening. Please collect it before then and bring your library card. There is no charge.",
    ],
    options: [
      { id: "A", text: "Ask the library to keep the book beyond Saturday." },
      { id: "B", text: "Collect the reserved book before the stated deadline." },
      { id: "C", text: "Pay for the book when she arrives at the library." },
    ],
    answer: "B",
    why: "The library will only hold the book until Saturday evening, so Ella needs to collect it before then.",
    distractor: "A uses the deadline from the email, but Ella is not asked to request more time.",
    evidence: ["keep it for you until Saturday evening", "Please collect it before then"],
  },
  {
    id: "cinema-change",
    title: "Change of cinema",
    source: "Text message",
    question: "Why did Maya send this message to Ben?",
    target: "purpose",
    targetFeedback: "Ask what the message is mainly trying to communicate.",
    prompt: "Maya is writing to tell Ben that…",
    paragraphs: [
      "Hi Ben. Rain is expected during the outdoor film, so I have moved our booking to the indoor cinema. It starts at the same time. Tell me if that causes a problem.\n\nMaya",
    ],
    options: [
      { id: "A", text: "He needs to choose whether they still see the film." },
      { id: "B", text: "The film will now begin later because of the weather." },
      { id: "C", text: "Their booking has been moved to an indoor location." },
    ],
    answer: "C",
    why: "The main reason for the message is to tell Ben about the new location.",
    distractor: "A is tempting because Maya asks Ben to mention a problem. However, she has already moved the booking and is informing him of the change.",
    evidence: ["Rain is expected during the outdoor film", "moved our booking to the indoor cinema", "It starts at the same time"],
  },
  {
    id: "bicycle-storage",
    title: "Bicycle storage",
    source: "Notice",
    question: "Who should leave their bicycles beside the main gate?",
    target: "specific",
    targetFeedback: "Look for the rule that applies to one particular group of people.",
    prompt: "The racks beside the gate are for…",
    paragraphs: [
      "BICYCLE ROOM\n\nResidents may enter with a blue key card. Visitors should use the racks beside the main gate. The room is locked between 10 p.m. and 6 a.m.",
    ],
    options: [
      { id: "A", text: "Visitors to the building." },
      { id: "B", text: "Residents who have a blue card." },
      { id: "C", text: "Cyclists arriving after ten at night." },
    ],
    answer: "A",
    why: "The notice directly assigns the outside racks to visitors.",
    distractor: "C combines two real details—the racks and the room closing at 10 p.m.—but the racks are specifically for visitors.",
    evidence: ["Visitors should use the racks beside the main gate"],
  },
  {
    id: "one-room",
    title: "One room at a time",
    source: "Blog entry",
    question: "What is the blogger’s main message?",
    target: "main-message",
    targetFeedback: "Look for the wider lesson, not only what the writer did.",
    prompt: "The experience showed the blogger that…",
    paragraphs: [
      "Last month I helped repaint the small community hall. We only finished one room, so the result did not seem very impressive. But classes started there again the next week. It reminded me that a modest improvement can still make a real difference.",
    ],
    options: [
      { id: "A", text: "Community buildings should not reopen until all work is complete." },
      { id: "B", text: "A relatively small improvement can still have a useful effect." },
      { id: "C", text: "Volunteers should choose projects that can be completed quickly." },
    ],
    answer: "B",
    why: "The central point is that limited progress can still produce a worthwhile result.",
    distractor: "C sounds like practical advice, but the blogger says nothing about choosing projects by how quickly they can be completed.",
    evidence: ["only finished one room", "classes started there again", "a modest improvement can still make a real difference"],
  },
  {
    id: "photography-workshop",
    title: "Photography workshop",
    source: "Email",
    question: "What should a participant do if the new workshop time is unsuitable?",
    target: "action",
    targetFeedback: "Find the action required under the condition in the question.",
    prompt: "A participant who cannot attend should…",
    paragraphs: [
      "Subject: Saturday photography workshop",
      "Your place on Saturday’s photography workshop is confirmed. Because the tutor is unwell, the session will now begin at 11 rather than 10.",
      "If the new time suits you, there is no need to reply. Contact us by Thursday only if you cannot attend, so we can offer the place to someone else.",
    ],
    options: [
      { id: "A", text: "Arrive at the original time and wait for the tutor." },
      { id: "B", text: "Confirm that the later starting time is convenient." },
      { id: "C", text: "Contact the organisers no later than Thursday." },
    ],
    answer: "C",
    why: "A reply is only required if the changed time makes attendance impossible.",
    distractor: "B reverses the instruction. Participants who can attend at 11 do not need to confirm anything.",
    evidence: ["there is no need to reply", "Contact us by Thursday only if you cannot attend"],
  },
  {
    id: "trailpaws",
    title: "TrailPaws",
    source: "Advertisement",
    question: "What is distinctive about the TrailPaws service?",
    target: "specific",
    targetFeedback: "Several features are mentioned. Find the one that makes the service different.",
    prompt: "TrailPaws is different because…",
    paragraphs: [
      "TRAILPAWS GROUP WALKS",
      "TrailPaws does not place new dogs directly into group walks. Every dog first has a short individual walk with one of our staff, allowing us to observe its behaviour and choose a suitable group.",
      "Owners then receive a route map and a photograph after each regular walk.",
    ],
    options: [
      { id: "A", text: "Dogs are assessed individually before they join a group." },
      { id: "B", text: "Owners can select the exact route used for every walk." },
      { id: "C", text: "Dogs are photographed during their first individual assessment." },
    ],
    answer: "A",
    why: "The service observes each dog alone before deciding which walking group is suitable.",
    distractor: "C combines two real details incorrectly. Photographs are sent after regular walks, not during the first assessment.",
    evidence: ["does not place new dogs directly into group walks", "Every dog first has a short individual walk", "choose a suitable group"],
  },
  {
    id: "science-honestly",
    title: "Science, Honestly",
    source: "Review",
    question: "What is the reviewer’s overall opinion of the podcast?",
    target: "main-message",
    targetFeedback: "The review includes praise and criticism. Decide how the writer balances them.",
    prompt: "Overall, the reviewer thinks the podcast…",
    paragraphs: [
      "The first episodes of Science, Honestly are carefully produced, and the guests explain their research with unusual clarity.",
      "The host is enthusiastic, but often interrupts to restate points that were already perfectly understandable. The programme is most successful when it gives the experts room to develop an idea.",
      "It is certainly worth hearing, though it could trust both its contributors and its audience a little more.",
    ],
    options: [
      { id: "A", text: "Needs the host’s explanations because its guests are often unclear." },
      { id: "B", text: "Contains too much scientific detail to be easy to follow." },
      { id: "C", text: "Is worthwhile, although the host explains more than necessary." },
    ],
    answer: "C",
    why: "The reviewer recommends the programme but believes the presenter should interfere less.",
    distractor: "A reverses the relationship. The guests are already clear, so the host’s extra explanations are often unnecessary.",
    evidence: ["unusual clarity", "often interrupts to restate points", "certainly worth hearing"],
  },
  {
    id: "riverside-festival",
    title: "Riverside Festival",
    source: "Letter",
    question: "Why is the writer contacting the festival organisers?",
    target: "purpose",
    targetFeedback: "Identify the specific change the writer wants, not only the general subject of the letter.",
    prompt: "The writer wants the organisers to…",
    paragraphs: [
      "Dear organisers,",
      "We support the Riverside Festival and understand why you want the parade to pass through the town centre.",
      "However, the proposed route would block the only public entrance to the health clinic for nearly three hours. The rear entrance is suitable for emergency vehicles but not for patients with limited mobility.",
      "Could the route be moved one street east, while keeping the rest of the plan unchanged?",
      "Yours sincerely,\nDr Helen Mora",
    ],
    options: [
      { id: "A", text: "Abandon plans to hold the festival in the town centre." },
      { id: "B", text: "Make a small route change to protect access to the clinic." },
      { id: "C", text: "Allow patients to enter the clinic through its rear entrance." },
    ],
    answer: "B",
    why: "The writer supports the event but requests one limited adjustment so patients can still enter the clinic.",
    distractor: "A ignores the writer’s support for the festival and makes the requested change much stronger than it is.",
    evidence: ["We support the Riverside Festival", "only public entrance", "route be moved one street east", "keeping the rest of the plan unchanged"],
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
  if (targetScore === 8 && answerScore === 8) return "Excellent. You identified every target and used it to find every answer.";
  if (targetScore >= 6 && answerScore >= 6) return "Strong work. Keep forming your own answer before you compare the options.";
  if (targetScore > answerScore) return "You usually understand what the question asks. Now match every part of your answer to the evidence.";
  if (answerScore > targetScore) return "You often find the answer. Choosing the target first can make you faster and more consistent.";
  return "Use the question as your reading instruction: decide what information you need before reading closely.";
}

export default function OteGeneralReadingPart1TargetTrainer({ nativeRoutes = false }) {
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
  const currentRoundIndex = caseIndex < 4 ? 0 : 1;
  const roundCaseNumber = (caseIndex % 4) + 1;
  const basePath = nativeRoutes ? "/reading/general/part-1-short-texts" : "/ote/reading/general/part-1-short-texts";
  const menuPath = getSitePath(basePath);
  const practicePath = getSitePath(`${basePath}/practice/a2-pilot-1`);
  const targetScore = useMemo(() => CASES.filter((entry) => work[entry.id]?.target === entry.target).length, [work]);
  const answerScore = useMemo(() => CASES.filter((entry) => work[entry.id]?.answer === entry.answer).length, [work]);
  const roundScores = useMemo(() => ROUNDS.map((_, roundIndex) => {
    const cases = CASES.slice(roundIndex * 4, roundIndex * 4 + 4);
    return {
      targets: cases.filter((entry) => work[entry.id]?.target === entry.target).length,
      answers: cases.filter((entry) => work[entry.id]?.answer === entry.answer).length,
    };
  }), [work]);
  const checkedAnswers = CASES.filter((entry) => work[entry.id]?.answerChecked).length;

  useEffect(() => {
    if (!complete || completionLoggedRef.current) return;
    completionLoggedRef.current = true;
    logOteTrainingCompleted({
      progressId: "reading.part1.general-reading-target",
      section: "reading",
      part: "part-1",
      mode: "reading_target_trainer_general",
      taskId: "general-reading-part-1-reading-target",
      taskTitle: "Set Your Reading Target: OTE General",
      variant: "general",
      score: targetScore + answerScore,
      total: 16,
      targetScore,
      answerScore,
      roundOneScore: roundScores[0].answers,
      roundTwoScore: roundScores[1].answers,
    });
  }, [answerScore, complete, roundScores, targetScore]);

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
    <main className="ote-training-page ote-reading-target-page ote-general-reading-target-page">
      <Seo title="Set Your Reading Target | OTE General Reading Part 1 | Seif English" description="Practise identifying the question type, forming an answer and checking the options in OTE General Reading Part 1." />
      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}><ArrowLeft size={18} aria-hidden="true" /> Back to Part 1 training</button>
      <header className="ote-training-hero">
        <p className="ote-kicker">General Reading Part 1 · Two-round skill trainer</p>
        <h1>Set Your Reading Target</h1>
        <p>Decide what the question asks. Then read for that information before you look at the three options.</p>
      </header>
      <section className="ote-training-summary" aria-label="Reading Target trainer overview">
        <div><Target size={24} aria-hidden="true" /><strong>1. Choose the target</strong><span>What kind of answer are you looking for?</span></div>
        <div><BookOpen size={24} aria-hidden="true" /><strong>2. Read and think</strong><span>Form a short answer in your mind or write a few words.</span></div>
        <div><ListChecks size={24} aria-hidden="true" /><strong>3. Check the options</strong><span>Choose the closest match and inspect the evidence.</span></div>
      </section>
      <details className="ote-reading-target-reference">
        <summary>Four reading targets</summary>
        <div>{READING_TARGETS.map((entry) => <article key={entry.id}><strong>{entry.label}</strong><span>{entry.lookFor}</span></article>)}</div>
      </details>

      {complete ? (
        <section className="ote-training-section ote-cohesion-complete">
          <div className="ote-cohesion-complete-icon"><Target size={34} aria-hidden="true" /></div>
          <p className="ote-kicker">All eight cases complete</p>
          <h2>Your reading routine report</h2>
          <div className="ote-cohesion-score-grid">
            <article><span>Reading targets</span><strong>{targetScore} / 8</strong><p>Did you understand what each question asked?</p></article>
            <article><span>Final answers</span><strong>{answerScore} / 8</strong><p>Did you choose the closest complete match?</p></article>
          </div>
          <div className="ote-cohesion-score-grid">
            {ROUNDS.map((round, index) => <article key={round.title}><span>Round {index + 1}</span><h3>{round.title}</h3><strong>{roundScores[index].answers} / 4</strong><p>Targets: {roundScores[index].targets} / 4</p></article>)}
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
            <button className="is-secondary" type="button" onClick={resetActivity}><RotateCcw size={17} aria-hidden="true" /> Try both rounds again</button>
            <button type="button" onClick={() => navigate(practicePath)}>Open timed practice <ChevronRight size={17} aria-hidden="true" /></button>
          </div>
        </section>
      ) : (
        <section className="ote-training-section ote-reading-target-runner">
          <div className="ote-cohesion-progress-head">
            <div><span>Round {currentRoundIndex + 1}: {ROUNDS[currentRoundIndex].title} · Case {roundCaseNumber} of 4</span><strong>{checkedAnswers} / 8 completed</strong></div>
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
                <p>Choose the kind of information you need to find.</p>
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
