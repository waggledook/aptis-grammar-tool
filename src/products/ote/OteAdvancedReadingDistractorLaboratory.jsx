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

const SENTENCES = {
  A: "A crack that appears serious may stop widening once the object has adjusted to its new environment.",
  B: "Over several months, tiny sensors recorded how the wood moved as the surrounding air became wetter or drier.",
  C: "The value of delaying treatment depends on whether deterioration is continuing or has already stabilised.",
  D: "These records help conservators distinguish a temporary adjustment from an ongoing problem.",
  E: "Visible repairs can also reassure visitors that a collection is being actively cared for.",
};

const ANSWERS = { 1: "A", 2: "B", 3: "C", 4: "D" };

const ARTICLE = [
  "When an old object becomes cracked or damaged, repairing it immediately may seem like the obvious response. Conservators, however, know that every treatment changes some of the original material. In certain situations, careful observation is safer than immediate action.",
  {
    gap: 1,
    before: "Wooden objects naturally expand and contract as temperature and humidity change. A newly visible crack may therefore appear more alarming than it really is. ",
    after: " A treatment applied too soon could instead trap moisture or place additional pressure on the surrounding wood.",
  },
  {
    gap: 2,
    before: "In one project, conservators compared painted wooden panels kept under slightly different environmental conditions. ",
    after: " The readings showed that movement was linked more closely to rapid changes in humidity than to the average level itself.",
  },
  {
    gap: 3,
    before: "Such findings do not mean that damaged objects should simply be ignored. ",
    after: " If insects are still active or paint is separating from the surface, delaying action may lead to permanent loss.",
  },
  {
    gap: 4,
    before: "Modern technology is making these decisions easier. Digital images and small sensors can create detailed records of change without requiring fragile objects to be handled repeatedly. ",
    after: " The aim is not to avoid treatment, but to intervene only when the evidence shows what kind of action is necessary.",
  },
];

const INVESTIGATIONS = [
  {
    gap: 1,
    tempting: "E",
    question: "Why is E weaker here?",
    choices: [
      "It repeats information that has already been explained.",
      "It introduces a relevant side issue but does not explain why immediate treatment may be harmful.",
      "It contradicts the idea that historical objects sometimes need repair.",
    ],
    answer: 1,
    diagnosis: "Right topic, wrong line of argument",
    explanation: "E is relevant to conservation and offers a believable reason for visible repairs. This paragraph, however, explains the physical behaviour of wood and why apparent damage may not require immediate intervention. Visitors’ reactions do not lead to the danger of treating the wood too soon.",
    highlights: {
      before: ["A newly visible crack may therefore appear more alarming than it really is"],
      answer: ["may stop widening", "adjusted to its new environment"],
      after: ["A treatment applied too soon", "trap moisture or place additional pressure"],
    },
  },
  {
    gap: 2,
    tempting: "D",
    question: "What is the main problem with D here?",
    choices: [
      "‘These records’ has no established reference because the records have not yet been introduced.",
      "It describes the findings before the project has begun.",
      "It gives an opinion rather than information from the research.",
    ],
    answer: 0,
    diagnosis: "Reference introduced too early",
    explanation: "D belongs to the article and makes sense as a general point about monitoring. At this gap, however, ‘These records’ has no established antecedent. B introduces both the sensors and the measurements that the following sentence calls ‘the readings’.",
    highlights: {
      before: ["conservators compared painted wooden panels"],
      answer: ["tiny sensors recorded how the wood moved"],
      after: ["The readings showed"],
    },
  },
  {
    gap: 3,
    tempting: "A",
    question: "Why is C stronger than A here?",
    choices: [
      "It introduces a general principle which the following example then helps to define.",
      "It gives more scientific detail about the previous experiment.",
      "It shows that all damaged objects should be treated immediately.",
    ],
    answer: 0,
    diagnosis: "An example where the paragraph needs a rule",
    explanation: "A supports the idea that waiting can sometimes be sensible, but the paragraph has moved beyond one kind of crack. It now needs a broad rule distinguishing safe delay from dangerous inaction. The next sentence illustrates the dangerous category.",
    highlights: {
      before: ["damaged objects should simply be ignored"],
      answer: ["depends on whether deterioration is continuing or has already stabilised"],
      after: ["If insects are still active or paint is separating from the surface", "permanent loss"],
    },
  },
  {
    gap: 4,
    tempting: "C",
    question: "Why is C unsuitable here?",
    choices: [
      "It is too general at a point where the text needs to explain the value of the new technology.",
      "It disagrees with the paragraph’s conclusion about treatment.",
      "It contains vocabulary that has already appeared elsewhere in the text.",
    ],
    answer: 0,
    diagnosis: "Right idea, wrong position",
    explanation: "C states an important principle, but that principle belongs in the previous paragraph. This paragraph has a new function: explaining how technology supports the decision. D develops the records mentioned immediately beforehand and leads directly to evidence-based action.",
    highlights: {
      before: ["detailed records of change"],
      answer: ["These records", "temporary adjustment", "ongoing problem"],
      after: ["evidence shows what kind of action is necessary"],
    },
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

function SentenceBank({ available, selected, onSelect }) {
  return (
    <aside className="ote-distractor-bank" aria-label="Missing sentences">
      <div>
        <p className="ote-kicker">Missing sentences</p>
        <h2>Choose or drag</h2>
      </div>
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
          <GripVertical size={18} aria-hidden="true" />
          <strong>{id}</strong>
          <span>{SENTENCES[id]}</span>
        </button>
      ))}
      <p>One sentence will remain unused.</p>
    </aside>
  );
}

function ArticleGap({
  id,
  phase,
  placement,
  selectedSentence,
  onPlace,
  onClear,
  activeInvestigation,
  evidenceRevealed,
}) {
  const isSolving = phase === "solve";
  const isActive = activeInvestigation?.gap === id;
  const sentenceId = isSolving ? placement : ANSWERS[id];
  const sentence = sentenceId ? SENTENCES[sentenceId] : "";

  return (
    <span
      className={`ote-distractor-gap ${sentenceId ? "is-filled" : ""} ${isActive ? "is-active" : ""}`}
      data-gap={id}
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
          <span>
            <HighlightedText
              text={sentence}
              fragments={activeInvestigation?.highlights.answer}
              active={isActive && evidenceRevealed}
            />
          </span>
          {isSolving ? (
            <button type="button" onClick={() => onClear(id)} aria-label={`Remove sentence from gap ${id}`}>
              <X size={15} aria-hidden="true" />
            </button>
          ) : null}
        </span>
      ) : (
        <button type="button" onClick={() => onPlace(id, selectedSentence)} disabled={!selectedSentence}>
          Gap {id}
        </button>
      )}
    </span>
  );
}

function LaboratoryArticle(props) {
  const { activeInvestigation, evidenceRevealed } = props;
  return (
    <article className="ote-distractor-article">
      <header>
        <p className="ote-kicker">Mini gapped text</p>
        <h2>When waiting protects the past</h2>
      </header>
      {ARTICLE.map((paragraph, index) => {
        if (typeof paragraph === "string") return <p key={`intro:${index}`}>{paragraph}</p>;
        const isActive = activeInvestigation?.gap === paragraph.gap;
        return (
          <p className={isActive ? "is-investigating" : ""} key={paragraph.gap}>
            <HighlightedText
              text={paragraph.before}
              fragments={activeInvestigation?.highlights.before}
              active={isActive && evidenceRevealed}
            />
            <ArticleGap id={paragraph.gap} {...props} />
            <HighlightedText
              text={paragraph.after}
              fragments={activeInvestigation?.highlights.after}
              active={isActive && evidenceRevealed}
            />
          </p>
        );
      })}
    </article>
  );
}

function InvestigationPanel({
  investigation,
  index,
  placementScore,
  selectedDiagnosis,
  revealed,
  onSelect,
  onReveal,
  onPrevious,
  onNext,
}) {
  const correct = selectedDiagnosis === investigation.answer;
  return (
    <aside className="ote-distractor-investigation">
      <div className="ote-distractor-lab-progress">
        <span>Laboratory phase · {index + 1} of {INVESTIGATIONS.length}</span>
        <strong>Placement: {placementScore} / 4</strong>
      </div>
      <div className="ote-distractor-lab-progress-bar" aria-hidden="true">
        <span style={{ width: `${((index + (revealed ? 1 : 0)) / INVESTIGATIONS.length) * 100}%` }} />
      </div>
      <p className="ote-kicker">Investigation {index + 1} · Gap {investigation.gap}</p>
      <h2>Distractor autopsy</h2>
      <div className="ote-distractor-comparison">
        <span>Correct sentence</span>
        <p><strong>{ANSWERS[investigation.gap]}</strong> {SENTENCES[ANSWERS[investigation.gap]]}</p>
        <span>Tempting alternative</span>
        <p><strong>{investigation.tempting}</strong> {SENTENCES[investigation.tempting]}</p>
      </div>
      <fieldset disabled={revealed}>
        <legend>{investigation.question}</legend>
        {investigation.choices.map((choice, choiceIndex) => {
          const selected = selectedDiagnosis === choiceIndex;
          const answer = revealed && investigation.answer === choiceIndex;
          const incorrect = revealed && selected && !answer;
          return (
            <label className={`${selected ? "is-selected" : ""} ${answer ? "is-answer" : ""} ${incorrect ? "is-incorrect" : ""}`} key={choice}>
              <input
                type="radio"
                name={`diagnosis-${investigation.gap}`}
                value={choiceIndex}
                checked={selected}
                onChange={() => onSelect(choiceIndex)}
              />
              <strong>{String.fromCharCode(65 + choiceIndex)}</strong>
              <span>{choice}</span>
            </label>
          );
        })}
      </fieldset>
      {revealed ? (
        <div className={`ote-distractor-autopsy ${correct ? "is-correct" : "is-wrong"}`} aria-live="polite">
          <div>
            {correct ? <CheckCircle2 size={20} aria-hidden="true" /> : <XCircle size={20} aria-hidden="true" />}
            <strong>{correct ? "Diagnosis confirmed" : "Best diagnosis"}</strong>
          </div>
          <span>{investigation.diagnosis}</span>
          <p>{investigation.explanation}</p>
        </div>
      ) : null}
      <div className="ote-cohesion-actions">
        <button className="is-secondary" type="button" disabled={index === 0} onClick={onPrevious}>
          <ChevronLeft size={17} aria-hidden="true" /> Previous
        </button>
        {revealed ? (
          <button type="button" onClick={onNext}>
            {index === INVESTIGATIONS.length - 1 ? "View final report" : "Next investigation"}
            <ChevronRight size={17} aria-hidden="true" />
          </button>
        ) : (
          <button type="button" disabled={selectedDiagnosis === undefined} onClick={onReveal}>
            Reveal the autopsy
          </button>
        )}
      </div>
    </aside>
  );
}

export default function OteAdvancedReadingDistractorLaboratory({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("solve");
  const [placements, setPlacements] = useState({});
  const [selectedSentence, setSelectedSentence] = useState("");
  const [investigationIndex, setInvestigationIndex] = useState(0);
  const [diagnoses, setDiagnoses] = useState({});
  const [revealed, setRevealed] = useState({});
  const completionLoggedRef = useRef(false);
  const basePath = nativeRoutes
    ? "/reading/advanced/part-3-gapped-text"
    : "/ote/reading/advanced/part-3-gapped-text";
  const menuPath = getSitePath(basePath);
  const practicePath = getSitePath(`${basePath}/practice/c1-pilot-1`);
  const available = Object.keys(SENTENCES).filter((id) => !Object.values(placements).includes(id));
  const placedCount = Object.keys(placements).length;
  const placementScore = useMemo(
    () => Object.entries(ANSWERS).filter(([gap, answer]) => placements[gap] === answer).length,
    [placements]
  );
  const diagnosisScore = useMemo(
    () => INVESTIGATIONS.filter((item) => diagnoses[item.gap] === item.answer).length,
    [diagnoses]
  );
  const currentInvestigation = INVESTIGATIONS[investigationIndex];
  const currentDiagnosis = diagnoses[currentInvestigation?.gap];
  const currentRevealed = Boolean(revealed[currentInvestigation?.gap]);

  useEffect(() => {
    if (phase !== "complete" || completionLoggedRef.current) return;
    completionLoggedRef.current = true;
    logOteTrainingCompleted({
      progressId: "reading.part3.advanced-distractor-laboratory",
      section: "reading",
      part: "part-3",
      mode: "distractor_laboratory",
      taskId: "advanced-reading-part-3-distractor-laboratory",
      taskTitle: "Distractor Laboratory",
      variant: "advanced",
      score: placementScore + diagnosisScore,
      total: 8,
      placementScore,
      diagnosisScore,
    });
  }, [diagnosisScore, phase, placementScore]);

  function placeSentence(gap, sentenceId) {
    if (phase !== "solve" || !sentenceId) return;
    setPlacements((current) => {
      const next = { ...current };
      Object.entries(next).forEach(([placedGap, placedId]) => {
        if (placedId === sentenceId) delete next[placedGap];
      });
      next[gap] = sentenceId;
      return next;
    });
    setSelectedSentence("");
  }

  function clearGap(gap) {
    setPlacements((current) => {
      const next = { ...current };
      delete next[gap];
      return next;
    });
  }

  function beginInvestigations() {
    if (placedCount !== 4) return;
    setPhase("investigate");
    setInvestigationIndex(0);
  }

  function advanceInvestigation() {
    if (!currentRevealed) return;
    if (investigationIndex === INVESTIGATIONS.length - 1) {
      setPhase("complete");
      return;
    }
    setInvestigationIndex((current) => current + 1);
  }

  function resetActivity() {
    setPhase("solve");
    setPlacements({});
    setSelectedSentence("");
    setInvestigationIndex(0);
    setDiagnoses({});
    setRevealed({});
    completionLoggedRef.current = false;
  }

  const profile = diagnosisScore === 4
    ? "You consistently reject sentences that are relevant but structurally misplaced."
    : diagnosisScore >= 2
      ? "You recognise many strong links. Keep checking whether a sentence prepares what follows, not only whether it fits what comes before."
      : "Related vocabulary can make a distractor feel convincing. Slow down and identify the exact job the missing sentence must perform.";

  return (
    <main className="ote-training-page ote-distractor-laboratory-page">
      <Seo
        title="Distractor Laboratory | OTE Advanced Reading Part 3 | Seif English"
        description="Investigate plausible distractors in an interactive OTE Advanced Reading mini gapped text."
      />
      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" /> Back to Part 3 training
      </button>
      <header className="ote-training-hero">
        <p className="ote-kicker">Advanced Reading Part 3 · Skill trainer</p>
        <h1>Distractor Laboratory</h1>
        <p>
          Solve one mini gapped text, then examine why the strongest alternatives fail. A sentence
          can belong to the topic and sound natural—yet still perform the wrong job in the paragraph.
        </p>
      </header>
      <section className="ote-training-summary" aria-label="Distractor Laboratory overview">
        <div><FlaskConical size={24} aria-hidden="true" /><strong>One connected text</strong><span>Four gaps and one plausible unused sentence.</span></div>
        <div><Target size={24} aria-hidden="true" /><strong>Two separate skills</strong><span>Sentence placement and distractor diagnosis receive separate scores.</span></div>
        <div><Beaker size={24} aria-hidden="true" /><strong>Four autopsies</strong><span>Evidence appears directly in the article, one investigation at a time.</span></div>
      </section>

      {phase === "complete" ? (
        <section className="ote-training-section ote-cohesion-complete">
          <div className="ote-cohesion-complete-icon"><FlaskConical size={34} aria-hidden="true" /></div>
          <p className="ote-kicker">Final laboratory report</p>
          <h2>Two skills, independently measured</h2>
          <div className="ote-cohesion-score-grid">
            <article><span>Sentence placement</span><strong>{placementScore} / 4</strong><p>Your first decisions in the complete text.</p></article>
            <article><span>Distractor diagnosis</span><strong>{diagnosisScore} / 4</strong><p>Your analysis of why the alternatives fail.</p></article>
          </div>
          <p className="ote-distractor-profile">{profile}</p>
          <div className="ote-distractor-final-list">
            {INVESTIGATIONS.map((item) => {
              const correct = diagnoses[item.gap] === item.answer;
              return (
                <button key={item.gap} type="button" onClick={() => { setInvestigationIndex(item.gap - 1); setPhase("investigate"); }}>
                  {correct ? <CheckCircle2 size={19} aria-hidden="true" /> : <XCircle size={19} aria-hidden="true" />}
                  <span>Gap {item.gap}</span>
                  <strong>{item.diagnosis}</strong>
                </button>
              );
            })}
          </div>
          <div className="ote-cohesion-actions is-complete">
            <button className="is-secondary" type="button" onClick={resetActivity}><RotateCcw size={17} aria-hidden="true" /> Try again</button>
            <button type="button" onClick={() => navigate(practicePath)}>Continue to timed practice <ChevronRight size={17} aria-hidden="true" /></button>
          </div>
        </section>
      ) : (
        <section className="ote-training-section ote-distractor-runner">
          {phase === "solve" ? (
            <>
              <div className="ote-distractor-stage-head">
                <div><p className="ote-kicker">Stage 1 · First attempt</p><h2>Solve the complete text</h2></div>
                <strong>{placedCount} / 4 gaps filled</strong>
              </div>
              <p className="ote-distractor-stage-copy">Choose a sentence, then tap a gap—or drag sentences directly into the article. Check both sides before you place it.</p>
              <div className="ote-distractor-solve-layout">
                <SentenceBank available={available} selected={selectedSentence} onSelect={setSelectedSentence} />
                <LaboratoryArticle
                  phase={phase}
                  placements={placements}
                  selectedSentence={selectedSentence}
                  onPlace={placeSentence}
                  onClear={clearGap}
                />
              </div>
              <div className="ote-distractor-check-row">
                <span>{placedCount === 4 ? "One sentence remains unused. Ready for the laboratory phase." : "Fill all four gaps before checking."}</span>
                <button type="button" disabled={placedCount !== 4} onClick={beginInvestigations}>Check sentence placement</button>
              </div>
            </>
          ) : (
            <>
              <div className="ote-distractor-stage-head">
                <div><p className="ote-kicker">Stage 2 · Laboratory phase</p><h2>Inspect the text, not a duplicate</h2></div>
                <strong>Placement: {placementScore} / 4</strong>
              </div>
              <p className="ote-distractor-stage-copy">The correct sentences are now in place. Reveal each autopsy to see its evidence highlighted inside the article.</p>
              <div className="ote-distractor-investigation-layout">
                <LaboratoryArticle
                  phase={phase}
                  placements={placements}
                  activeInvestigation={currentInvestigation}
                  evidenceRevealed={currentRevealed}
                />
                <InvestigationPanel
                  investigation={currentInvestigation}
                  index={investigationIndex}
                  placementScore={placementScore}
                  selectedDiagnosis={currentDiagnosis}
                  revealed={currentRevealed}
                  onSelect={(choice) => setDiagnoses((current) => ({ ...current, [currentInvestigation.gap]: choice }))}
                  onReveal={() => setRevealed((current) => ({ ...current, [currentInvestigation.gap]: true }))}
                  onPrevious={() => setInvestigationIndex((current) => Math.max(0, current - 1))}
                  onNext={advanceInvestigation}
                />
              </div>
            </>
          )}
        </section>
      )}
    </main>
  );
}
