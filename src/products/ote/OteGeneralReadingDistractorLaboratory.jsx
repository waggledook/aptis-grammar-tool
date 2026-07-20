import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Beaker,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  GripVertical,
  RotateCcw,
  Target,
  X,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteTrainingCompleted } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import "./styles/ote.css";

const LABS = [
  {
    id: "follow-evidence",
    title: "Follow the Evidence",
    level: "A2–B1",
    description: "Start with clear references, actions and results.",
    articleTitle: "The shared umbrellas",
    sentences: {
      A: "Each umbrella had the pool’s name printed clearly on its handle.",
      B: "Staff posted a message asking borrowers to return any umbrellas that day.",
      C: "Because the scheme worked well, the pool decided to continue it permanently.",
      D: "Several visitors suggested moving the stand closer to the changing rooms.",
    },
    answers: { 1: "A", 2: "B", 3: "C" },
    article: [
      "Visitors to a community swimming pool often arrived in good weather but left during heavy rain. Last autumn, the manager placed a stand of bright yellow umbrellas beside the main exit. Anyone could borrow one and return it on their next visit.",
      {
        gap: 1,
        before: "",
        after: " This made it easy to recognise where the umbrellas belonged and reminded people to bring them back.",
      },
      {
        gap: 2,
        before: "During the first week, nearly every umbrella was returned. One wet afternoon, however, the stand was completely empty. ",
        after: " By that evening, seven umbrellas had been returned and visitors could borrow them again.",
      },
      {
        gap: 3,
        before: "After a month, only two umbrellas were still missing. Staff had expected to lose far more. ",
        after: " The pool now plans to add several smaller umbrellas for children.",
      },
    ],
    investigations: [
      {
        gap: 1,
        tempting: "D",
        question: "Why is D weaker here?",
        choices: [
          "It describes a suggestion, not an action that could have produced the result described by ‘This’.",
          "Visitors have not been mentioned in the text.",
          "Moving the stand would make the umbrellas more difficult to borrow.",
        ],
        answer: 0,
        diagnosis: "A suggestion cannot explain a completed result",
        explanation: "D tells us what visitors suggested. It does not say the stand was moved. A explains ‘This’: the printed name helped people know where the umbrellas belonged.",
        highlights: {
          before: [],
          answer: ["pool’s name printed clearly on its handle"],
          after: ["This made it easy to recognise where the umbrellas belonged"],
        },
      },
      {
        gap: 2,
        tempting: "D",
        question: "What is the main problem with D here?",
        choices: [
          "The suggestion happens too early in the story.",
          "It does not explain why seven umbrellas were returned that evening.",
          "It repeats the information about the empty stand.",
        ],
        answer: 1,
        diagnosis: "It does not explain the result",
        explanation: "Moving the stand might help in the future, but it cannot bring the umbrellas back that day. B gives the action that caused the result: staff asked people to return them.",
        highlights: {
          before: ["the stand was completely empty"],
          answer: ["asking borrowers to return any umbrellas that day"],
          after: ["seven umbrellas had been returned"],
        },
      },
      {
        gap: 3,
        tempting: "D",
        question: "Why is C stronger?",
        choices: [
          "It explains how the umbrellas were bought.",
          "It connects the successful month to a decision about the future.",
          "It gives another problem with the umbrella stand.",
        ],
        answer: 1,
        diagnosis: "Right topic, wrong direction",
        explanation: "The text is moving from a successful trial to the pool’s future plans. D stays on the topic, but nothing later discusses the position of the stand.",
        highlights: {
          before: ["only two umbrellas were still missing", "expected to lose far more"],
          answer: ["scheme worked well", "continue it permanently"],
          after: ["plans to add several smaller umbrellas"],
        },
      },
    ],
  },
  {
    id: "convincing-distractor",
    title: "Catch the Convincing Distractor",
    level: "B1–B2",
    description: "Reject sentences that fit one side but not the whole paragraph.",
    articleTitle: "When street lights do not need to stay fully bright",
    sentences: {
      A: "Seasonal changes may have affected insect numbers as much as the lighting.",
      B: "The reduction in electricity use was easier for the council to calculate.",
      C: "Motion sensors detected approaching pedestrians, cyclists and cars.",
      D: "Successful schemes adjust each street separately instead of applying one setting everywhere.",
      E: "Concern remained highest at junctions, where traffic came from several directions.",
    },
    answers: { 1: "C", 2: "E", 3: "A", 4: "D" },
    article: [
      "Street lights help people travel safely after dark, but keeping them at full brightness all night uses energy and can disturb nocturnal animals. Some towns have therefore begun testing adaptive lights, which become brighter only when needed.",
      {
        gap: 1,
        before: "In one coastal town, lamps on quiet residential roads were dimmed after midnight. ",
        after: " The lights returned to full strength before anyone reached the darker part of the road. As a result, electricity use fell without leaving people to walk through an unlit area.",
      },
      {
        gap: 2,
        before: "Before the trial, some residents worried that the streets would feel unsafe. After several months, most walkers said they felt as safe as before. ",
        after: " This difference explains why the council kept full lighting near junctions while expanding the trial on quieter roads.",
      },
      {
        gap: 3,
        before: "The environmental findings were more difficult to interpret. Fewer moths gathered around the dimmed lamps, but the study covered only one summer. ",
        after: " Researchers therefore recommended a longer comparison before making firm claims about wildlife.",
      },
      {
        gap: 4,
        before: "Adaptive lighting is not appropriate in every location. Busy shopping streets, pedestrian crossings and emergency routes may need steady lighting throughout the night. ",
        after: " The aim is not to make streets as dark as possible, but to provide the right amount of light in the right place.",
      },
    ],
    investigations: [
      {
        gap: 1,
        tempting: "E",
        question: "Why is E unsuitable here?",
        choices: [
          "It mentions safety but does not explain how the lights become bright before people arrive.",
          "Junctions are not discussed anywhere else.",
          "It says the lights were brighter than necessary.",
        ],
        answer: 0,
        diagnosis: "Right topic, wrong explanation",
        explanation: "E is about road safety, so it sounds possible. But this gap must explain how the lights react. Only the motion sensors explain why the lights become bright before people arrive.",
        highlights: {
          before: ["become brighter only when needed"],
          answer: ["Motion sensors detected approaching pedestrians, cyclists and cars"],
          after: ["returned to full strength before anyone reached"],
        },
      },
      {
        gap: 2,
        tempting: "D",
        question: "What is missing if D is placed here?",
        choices: [
          "An explanation of how electricity use was measured.",
          "A contrast between people feeling safe in general and still feeling worried at junctions.",
          "A description of the junctions.",
        ],
        answer: 1,
        diagnosis: "The contrast is missing",
        explanation: "‘This difference’ needs two different findings. Most people felt safe, but junctions still caused concern. D gives a general policy, so the difference is missing.",
        highlights: {
          before: ["most walkers said they felt as safe as before"],
          answer: ["Concern remained highest at junctions"],
          after: ["This difference", "full lighting near junctions", "quieter roads"],
        },
      },
      {
        gap: 3,
        tempting: "B",
        question: "Why does B ultimately fail?",
        choices: [
          "It discusses a different result and does not explain why the wildlife evidence was uncertain.",
          "It proves that the lighting had no effect on insects.",
          "It repeats the information about moths.",
        ],
        answer: 0,
        diagnosis: "It fits before the gap, but not after it",
        explanation: "B sounds natural after ‘more difficult to interpret’ because it gives an easier result. But the next sentence is about uncertain wildlife evidence. Seasonal change explains that uncertainty; electricity use does not.",
        highlights: {
          before: ["the study covered only one summer"],
          answer: ["Seasonal changes may have affected insect numbers"],
          after: ["therefore recommended a longer comparison", "claims about wildlife"],
        },
      },
      {
        gap: 4,
        tempting: "E",
        question: "Why is D stronger here?",
        choices: [
          "The paragraph needs a general recommendation, not another detail from the earlier trial.",
          "The article has not mentioned streets or junctions.",
          "The final sentence says every street should become darker.",
        ],
        answer: 0,
        diagnosis: "The paragraph needs a general idea",
        explanation: "E takes us back to one detail from the coastal town. The article is now reaching its conclusion. D turns the examples into a general idea about using different lighting in different places.",
        highlights: {
          before: ["not appropriate in every location", "may need steady lighting"],
          answer: ["adjust each street separately", "one setting everywhere"],
          after: ["right amount of light in the right place"],
        },
      },
    ],
  },
];

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

function SentenceBank({ lab, placements, selected, onSelect }) {
  const available = Object.keys(lab.sentences).filter((id) => !Object.values(placements).includes(id));
  return (
    <aside className="ote-distractor-bank" aria-label="Missing sentences">
      <div><p className="ote-kicker">Missing sentences</p><h2>Choose or drag</h2></div>
      {available.map((id) => (
        <button
          className={selected === id ? "is-selected" : ""}
          draggable
          key={id}
          type="button"
          aria-pressed={selected === id}
          onClick={() => onSelect(selected === id ? "" : id)}
          onDragStart={(event) => event.dataTransfer.setData("text/plain", id)}
        >
          <GripVertical size={18} aria-hidden="true" /><strong>{id}</strong><span>{lab.sentences[id]}</span>
        </button>
      ))}
      <p>One sentence will remain unused.</p>
    </aside>
  );
}

function ArticleGap({ lab, id, phase, placement, selectedSentence, onPlace, onClear, investigation, evidenceRevealed }) {
  const isSolving = phase === "solve";
  const isActive = investigation?.gap === id;
  const sentenceId = isSolving ? placement : lab.answers[id];
  return (
    <span
      className={`ote-distractor-gap ${sentenceId ? "is-filled" : ""} ${isActive ? "is-active" : ""}`}
      onDragOver={(event) => { if (isSolving) event.preventDefault(); }}
      onDrop={(event) => {
        if (!isSolving) return;
        event.preventDefault();
        onPlace(id, event.dataTransfer.getData("text/plain"));
      }}
    >
      {sentenceId ? (
        <span className="ote-distractor-gap-answer">
          <strong>{sentenceId}</strong>
          <span><HighlightedText text={lab.sentences[sentenceId]} fragments={investigation?.highlights.answer} active={isActive && evidenceRevealed} /></span>
          {isSolving ? <button type="button" onClick={() => onClear(id)} aria-label={`Remove sentence from gap ${id}`}><X size={15} aria-hidden="true" /></button> : null}
        </span>
      ) : (
        <button type="button" onClick={() => onPlace(id, selectedSentence)} disabled={!selectedSentence}>Gap {id}</button>
      )}
    </span>
  );
}

function LaboratoryArticle(props) {
  const { lab, investigation, evidenceRevealed } = props;
  return (
    <article className="ote-distractor-article">
      <header><p className="ote-kicker">Mini gapped text</p><h2>{lab.articleTitle}</h2></header>
      {lab.article.map((paragraph, index) => {
        if (typeof paragraph === "string") return <p key={`intro:${index}`}>{paragraph}</p>;
        const active = investigation?.gap === paragraph.gap;
        return (
          <p className={active ? "is-investigating" : ""} key={paragraph.gap}>
            <HighlightedText text={paragraph.before} fragments={investigation?.highlights.before} active={active && evidenceRevealed} />
            <ArticleGap lab={lab} id={paragraph.gap} {...props} />
            <HighlightedText text={paragraph.after} fragments={investigation?.highlights.after} active={active && evidenceRevealed} />
          </p>
        );
      })}
    </article>
  );
}

function InvestigationPanel({ lab, investigation, index, placementScore, selectedDiagnosis, revealed, onSelect, onReveal, onPrevious, onNext }) {
  const correct = selectedDiagnosis === investigation.answer;
  return (
    <aside className="ote-distractor-investigation">
      <div className="ote-distractor-lab-progress"><span>Question {index + 1} of {lab.investigations.length}</span><strong>Placement: {placementScore} / {lab.investigations.length}</strong></div>
      <div className="ote-distractor-lab-progress-bar" aria-hidden="true"><span style={{ width: `${((index + (revealed ? 1 : 0)) / lab.investigations.length) * 100}%` }} /></div>
      <p className="ote-kicker">Look at Gap {investigation.gap}</p>
      <h2>Why is the other sentence wrong?</h2>
      <div className="ote-distractor-comparison">
        <span>Best sentence</span><p><strong>{lab.answers[investigation.gap]}</strong> {lab.sentences[lab.answers[investigation.gap]]}</p>
        <span>Tempting sentence</span><p><strong>{investigation.tempting}</strong> {lab.sentences[investigation.tempting]}</p>
      </div>
      <fieldset disabled={revealed}>
        <legend>{investigation.question}</legend>
        {investigation.choices.map((choice, choiceIndex) => {
          const selected = selectedDiagnosis === choiceIndex;
          const answer = revealed && investigation.answer === choiceIndex;
          const incorrect = revealed && selected && !answer;
          return (
            <label className={`${selected ? "is-selected" : ""} ${answer ? "is-answer" : ""} ${incorrect ? "is-incorrect" : ""}`} key={choice}>
              <input type="radio" name={`diagnosis-${lab.id}-${investigation.gap}`} checked={selected} onChange={() => onSelect(choiceIndex)} />
              <strong>{String.fromCharCode(65 + choiceIndex)}</strong><span>{choice}</span>
            </label>
          );
        })}
      </fieldset>
      {revealed ? (
        <div className={`ote-distractor-autopsy ${correct ? "is-correct" : "is-wrong"}`} aria-live="polite">
          <div>{correct ? <CheckCircle2 size={20} aria-hidden="true" /> : <XCircle size={20} aria-hidden="true" />}<strong>{correct ? "Yes—that is the key." : "The best answer is highlighted."}</strong></div>
          <span>{investigation.diagnosis}</span><p>{investigation.explanation}</p>
        </div>
      ) : null}
      <div className="ote-cohesion-actions">
        <button className="is-secondary" type="button" disabled={index === 0} onClick={onPrevious}><ChevronLeft size={17} aria-hidden="true" /> Previous</button>
        {revealed ? (
          <button type="button" onClick={onNext}>{index === lab.investigations.length - 1 ? "Finish this laboratory" : "Next question"}<ChevronRight size={17} aria-hidden="true" /></button>
        ) : (
          <button type="button" disabled={selectedDiagnosis === undefined} onClick={onReveal}>Show the explanation</button>
        )}
      </div>
    </aside>
  );
}

function getRoundMessage(labIndex, score, total) {
  if (score === total) return labIndex === 0 ? "Excellent. You followed every clear clue." : "Excellent. You checked the whole paragraph every time.";
  if (score >= Math.ceil(total / 2)) return labIndex === 0 ? "Good work. Check which action causes the result." : "Good work. Remember to read both sides of every gap.";
  return labIndex === 0 ? "Look for simple links: reference, action and result." : "A sentence can fit the topic and still be in the wrong place.";
}

export default function OteGeneralReadingDistractorLaboratory({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [labIndex, setLabIndex] = useState(0);
  const [phase, setPhase] = useState("solve");
  const [placements, setPlacements] = useState({});
  const [selectedSentence, setSelectedSentence] = useState("");
  const [investigationIndex, setInvestigationIndex] = useState(0);
  const [diagnoses, setDiagnoses] = useState({});
  const [revealed, setRevealed] = useState({});
  const completionLoggedRef = useRef(false);
  const lab = LABS[labIndex];
  const labPlacements = placements[lab.id] || {};
  const labDiagnoses = diagnoses[lab.id] || {};
  const labRevealed = revealed[lab.id] || {};
  const placedCount = Object.keys(labPlacements).length;
  const currentInvestigation = lab.investigations[investigationIndex];
  const currentDiagnosis = labDiagnoses[currentInvestigation?.gap];
  const currentRevealed = Boolean(labRevealed[currentInvestigation?.gap]);
  const basePath = nativeRoutes ? "/reading/general/part-3-gapped-text" : "/ote/reading/general/part-3-gapped-text";
  const menuPath = getSitePath(basePath);
  const practicePath = getSitePath(`${basePath}/practice/a2-pilot-1`);
  const scores = useMemo(() => LABS.map((item) => {
    const itemPlacements = placements[item.id] || {};
    const itemDiagnoses = diagnoses[item.id] || {};
    return {
      placement: Object.entries(item.answers).filter(([gap, answer]) => itemPlacements[gap] === answer).length,
      diagnosis: item.investigations.filter((investigation) => itemDiagnoses[investigation.gap] === investigation.answer).length,
    };
  }), [diagnoses, placements]);
  const currentScore = scores[labIndex];
  const totalScore = scores.reduce((total, score) => total + score.placement + score.diagnosis, 0);

  useEffect(() => {
    if (phase !== "complete" || completionLoggedRef.current) return;
    completionLoggedRef.current = true;
    logOteTrainingCompleted({
      progressId: "reading.part3.general-distractor-laboratory",
      section: "reading",
      part: "part-3",
      mode: "distractor_laboratory_general",
      taskId: "general-reading-part-3-distractor-laboratory",
      taskTitle: "Distractor Laboratory: OTE General",
      variant: "general",
      score: totalScore,
      total: 14,
      roundOnePlacement: scores[0].placement,
      roundOneDiagnosis: scores[0].diagnosis,
      roundTwoPlacement: scores[1].placement,
      roundTwoDiagnosis: scores[1].diagnosis,
    });
  }, [phase, scores, totalScore]);

  function placeSentence(gap, sentenceId) {
    if (phase !== "solve" || !sentenceId) return;
    setPlacements((current) => {
      const nextLab = { ...(current[lab.id] || {}) };
      Object.entries(nextLab).forEach(([placedGap, placedId]) => { if (placedId === sentenceId) delete nextLab[placedGap]; });
      nextLab[gap] = sentenceId;
      return { ...current, [lab.id]: nextLab };
    });
    setSelectedSentence("");
  }

  function clearGap(gap) {
    setPlacements((current) => {
      const nextLab = { ...(current[lab.id] || {}) };
      delete nextLab[gap];
      return { ...current, [lab.id]: nextLab };
    });
  }

  function finishInvestigation() {
    if (!currentRevealed) return;
    if (investigationIndex < lab.investigations.length - 1) {
      setInvestigationIndex((current) => current + 1);
      return;
    }
    setPhase(labIndex === 0 ? "round-break" : "complete");
  }

  function beginSecondRound() {
    setLabIndex(1);
    setInvestigationIndex(0);
    setSelectedSentence("");
    setPhase("solve");
  }

  function resetActivity() {
    setLabIndex(0);
    setPhase("solve");
    setPlacements({});
    setSelectedSentence("");
    setInvestigationIndex(0);
    setDiagnoses({});
    setRevealed({});
    completionLoggedRef.current = false;
  }

  return (
    <main className="ote-training-page ote-distractor-laboratory-page ote-general-distractor-page">
      <Seo title="Distractor Laboratory | OTE General Reading Part 3 | Seif English" description="Practise rejecting tempting sentences in two supported OTE General Reading mini gapped texts." />
      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}><ArrowLeft size={18} aria-hidden="true" /> Back to Part 3 training</button>
      <header className="ote-training-hero">
        <p className="ote-kicker">General Reading Part 3 · Two-round skill trainer</p>
        <h1>Distractor Laboratory</h1>
        <p>First, choose the missing sentences. Then find out why the other sentences do not fit. Start with clear clues and finish with stronger distractors.</p>
      </header>
      <section className="ote-training-summary" aria-label="Distractor Laboratory overview">
        <div><FlaskConical size={24} aria-hidden="true" /><strong>2 laboratories</strong><span>A clear first text followed by a more challenging one.</span></div>
        <div><Target size={24} aria-hidden="true" /><strong>2 skills</strong><span>Choose the sentence, then explain why another one is wrong.</span></div>
        <div><Beaker size={24} aria-hidden="true" /><strong>Simple explanations</strong><span>Short teaching notes show the important link.</span></div>
      </section>
      <section className="ote-cohesion-round-overview" aria-label="Laboratory rounds">
        {LABS.map((item, index) => <article className={index === 1 ? "is-advanced" : ""} key={item.id}><span>Laboratory {index + 1} · {item.level}</span><h2>{item.title}</h2><p>{item.description}</p></article>)}
      </section>

      {phase === "complete" ? (
        <section className="ote-training-section ote-cohesion-complete">
          <div className="ote-cohesion-complete-icon"><FlaskConical size={34} aria-hidden="true" /></div>
          <p className="ote-kicker">Both laboratories complete</p>
          <h2>Your final report</h2>
          <div className="ote-general-distractor-scores">
            {LABS.map((item, index) => <article key={item.id}><span>Laboratory {index + 1}</span><h3>{item.title}</h3><div><strong>{scores[index].placement} / {item.investigations.length}<small>Sentence placement</small></strong><strong>{scores[index].diagnosis} / {item.investigations.length}<small>Distractor questions</small></strong></div><p>{getRoundMessage(index, scores[index].diagnosis, item.investigations.length)}</p></article>)}
          </div>
          <div className="ote-cohesion-actions is-complete">
            <button className="is-secondary" type="button" onClick={resetActivity}><RotateCcw size={17} aria-hidden="true" /> Try both again</button>
            <button type="button" onClick={() => navigate(practicePath)}>Open timed practice <ChevronRight size={17} aria-hidden="true" /></button>
          </div>
        </section>
      ) : phase === "round-break" ? (
        <section className="ote-training-section ote-cohesion-round-break">
          <div className="ote-cohesion-complete-icon"><CheckCircle2 size={34} aria-hidden="true" /></div>
          <p className="ote-kicker">Laboratory 1 complete</p>
          <h2>{LABS[0].title}</h2>
          <div className="ote-cohesion-score-grid"><article><span>Sentence placement</span><strong>{scores[0].placement} / 3</strong></article><article><span>Distractor questions</span><strong>{scores[0].diagnosis} / 3</strong></article></div>
          <p>{getRoundMessage(0, scores[0].diagnosis, 3)}</p>
          <div className="ote-cohesion-round-shift"><span>Next: B1–B2</span><h3>Now check the whole paragraph</h3><p>Some wrong sentences will fit one side of the gap. Make sure your answer also connects to the sentence after it.</p></div>
          <div className="ote-cohesion-actions"><button className="is-secondary" type="button" onClick={() => { setInvestigationIndex(2); setPhase("investigate"); }}><ChevronLeft size={17} aria-hidden="true" /> Review Question 3</button><button type="button" onClick={beginSecondRound}>Start Laboratory 2 <ChevronRight size={17} aria-hidden="true" /></button></div>
        </section>
      ) : (
        <section className="ote-training-section ote-distractor-runner">
          {phase === "solve" ? (
            <>
              <div className="ote-distractor-stage-head"><div><p className="ote-kicker">Laboratory {labIndex + 1} · First attempt</p><h2>{lab.title}</h2></div><strong>{placedCount} / {lab.investigations.length} gaps filled</strong></div>
              <p className="ote-distractor-stage-copy">Choose a sentence, then tap a gap—or drag it into the text. Read the sentence before and after each gap.</p>
              <div className="ote-distractor-solve-layout"><SentenceBank lab={lab} placements={labPlacements} selected={selectedSentence} onSelect={setSelectedSentence} /><LaboratoryArticle lab={lab} phase={phase} placements={labPlacements} selectedSentence={selectedSentence} onPlace={placeSentence} onClear={clearGap} /></div>
              <div className="ote-distractor-check-row"><span>{placedCount === lab.investigations.length ? "One sentence is not used. You are ready to check." : "Fill every gap before checking."}</span><button type="button" disabled={placedCount !== lab.investigations.length} onClick={() => { setInvestigationIndex(0); setPhase("investigate"); }}>Check my sentences</button></div>
            </>
          ) : (
            <>
              <div className="ote-distractor-stage-head"><div><p className="ote-kicker">Laboratory {labIndex + 1} · Explanation stage</p><h2>Why does the other sentence fail?</h2></div><strong>Placement: {currentScore.placement} / {lab.investigations.length}</strong></div>
              <p className="ote-distractor-stage-copy">The best sentences are now in the text. Answer one short question, then see the important words highlighted.</p>
              <div className="ote-distractor-investigation-layout">
                <LaboratoryArticle lab={lab} phase={phase} placements={labPlacements} investigation={currentInvestigation} evidenceRevealed={currentRevealed} />
                <InvestigationPanel
                  lab={lab}
                  investigation={currentInvestigation}
                  index={investigationIndex}
                  placementScore={currentScore.placement}
                  selectedDiagnosis={currentDiagnosis}
                  revealed={currentRevealed}
                  onSelect={(choice) => setDiagnoses((current) => ({ ...current, [lab.id]: { ...(current[lab.id] || {}), [currentInvestigation.gap]: choice } }))}
                  onReveal={() => setRevealed((current) => ({ ...current, [lab.id]: { ...(current[lab.id] || {}), [currentInvestigation.gap]: true } }))}
                  onPrevious={() => setInvestigationIndex((current) => Math.max(0, current - 1))}
                  onNext={finishInvestigation}
                />
              </div>
            </>
          )}
        </section>
      )}
    </main>
  );
}
