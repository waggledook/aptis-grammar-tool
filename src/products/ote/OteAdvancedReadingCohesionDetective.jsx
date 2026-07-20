import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Lightbulb,
  MousePointerClick,
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
import {
  ClueLegend,
  CohesionContext,
  CohesionExplanation,
  SelectableText,
} from "./CohesionDetectiveShared.jsx";
import "./styles/ote.css";

const CASES = [
  {
    id: "broken-rule",
    title: "The broken rule",
    before: "Several firms introduced “no-meeting Fridays” to protect uninterrupted working time.",
    after: "In departments where senior staff continued to schedule calls, complaints soon returned.",
    options: [
      { id: "A", text: "Some companies later extended the policy to include part of Thursday afternoon." },
      { id: "B", text: "Staff in client-facing roles were usually permitted to make occasional exceptions." },
      { id: "C", text: "Employees welcomed the idea, but it only worked when managers respected the rule." },
    ],
    answer: "C",
    explanation: "The final sentence is an example of the condition in C not being met: senior staff ignored the rule, so the complaints returned.",
    distractor: "A and B are plausible policy details, but neither creates the cause-and-effect link needed by the following sentence.",
    highlights: {
      before: [{ text: "“no-meeting Fridays”", type: "backward" }],
      answer: [
        { text: "the idea", type: "backward" },
        { text: "but", type: "bridge" },
        { text: "only worked when managers respected the rule", type: "forward" },
      ],
      after: [{ text: "senior staff continued to schedule calls", type: "forward" }],
    },
    connections: [
      { type: "backward", text: "“The idea” points back to the no-meeting policy." },
      { type: "forward", text: "The condition about managers predicts an example of what happens when they ignore it." },
      { type: "bridge", text: "But turns a positive reaction into a conditional judgement about whether the policy works." },
    ],
  },
  {
    id: "two-solutions",
    title: "Two possible solutions",
    before: "Planting mature trees can cool streets quickly, but transporting and maintaining them is expensive.",
    after: "For this reason, many councils now use a mixture of both.",
    options: [
      { id: "A", text: "Young trees cost less and adapt more easily, although their benefits take longer to appear." },
      { id: "B", text: "Certain species tolerate urban pollution better, although they still require regular maintenance." },
      { id: "C", text: "Residents generally favour trees that provide shade without blocking windows or shop signs." },
    ],
    answer: "A",
    explanation: "A introduces the second solution needed by both: mature trees offer speed at a cost, while young trees are cheaper but slower.",
    distractor: "B and C remain on topic, but neither establishes a second alternative that councils could combine with mature trees.",
    highlights: {
      before: [
        { text: "mature trees", type: "backward" },
        { text: "quickly", type: "bridge" },
        { text: "expensive", type: "bridge" },
      ],
      answer: [
        { text: "Young trees", type: "bridge" },
        { text: "cost less", type: "bridge" },
        { text: "take longer", type: "bridge" },
      ],
      after: [{ text: "both", type: "backward" }],
    },
    connections: [
      { type: "backward", text: "Both must refer to two tree-planting approaches, so the gap has to introduce the second one." },
      { type: "bridge", text: "A mirrors the first sentence’s trade-off: quick but expensive versus cheaper but slower." },
    ],
  },
  {
    id: "new-evidence",
    title: "New evidence",
    before: "At first, researchers believed the markings had been made after the building was abandoned.",
    after: "This changed the team’s interpretation: the symbols were probably part of everyday life rather than later graffiti.",
    options: [
      { id: "A", text: "Similar markings had already been recorded in several buildings elsewhere in the region." },
      { id: "B", text: "A new plaster analysis, however, dated them to when the rooms were still occupied." },
      { id: "C", text: "The team photographed each symbol using several different types of artificial light." },
    ],
    answer: "B",
    explanation: "The new date directly contradicts the original belief and supplies the evidence referred to by This changed.",
    distractor: "A and C sound like credible archaeological evidence, but neither overturns the abandoned-building interpretation.",
    highlights: {
      before: [
        { text: "At first", type: "forward" },
        { text: "after the building was abandoned", type: "backward" },
      ],
      answer: [
        { text: "however", type: "bridge" },
        { text: "when the rooms were still occupied", type: "backward" },
      ],
      after: [{ text: "This changed", type: "backward" }],
    },
    connections: [
      { type: "forward", text: "At first signals that the original belief is about to be revised." },
      { type: "backward", text: "This changed points to the dating result, while still occupied directly reverses abandoned." },
      { type: "bridge", text: "However marks the turn from the earlier belief to contradictory evidence." },
    ],
  },
  {
    id: "too-late",
    title: "Too late to stop the story",
    before: "The false report spread rapidly because it appeared to come from a trusted local newspaper.",
    after: "The correction therefore reached only a fraction of the original audience.",
    options: [
      { id: "A", text: "Several users questioned the story, although many shared it while asking whether it was genuine." },
      { id: "B", text: "The newspaper later published a detailed explanation of how the false report had been produced." },
      { id: "C", text: "By the time the newspaper denied publishing it, thousands of users had already shared the story." },
    ],
    answer: "C",
    explanation: "C establishes that the denial came after mass sharing, which explains why the correction reached fewer people.",
    distractor: "B mentions a later response but not the decisive timing. A describes reactions to the report rather than the limited reach of the correction.",
    highlights: {
      before: [{ text: "spread rapidly", type: "backward" }],
      answer: [
        { text: "By the time", type: "bridge" },
        { text: "already shared", type: "forward" },
      ],
      after: [
        { text: "therefore", type: "backward" },
        { text: "only a fraction", type: "forward" },
      ],
    },
    connections: [
      { type: "bridge", text: "By the time fixes the order of events: sharing first, correction later." },
      { type: "backward", text: "Therefore turns that delay into the cause of the correction’s limited reach." },
      { type: "forward", text: "Already shared prepares the contrast between the original audience and the smaller corrected audience." },
    ],
  },
  {
    id: "familiarity-memory",
    title: "From familiarity to memory",
    before: "Students often remember new words during a lesson but fail to recognise them several days later.",
    after: "Revisiting vocabulary at increasing intervals strengthens the memory each time it begins to fade.",
    options: [
      { id: "A", text: "This difference between brief familiarity and lasting recall helps explain why spaced review works." },
      { id: "B", text: "This problem is sometimes blamed on the number of unfamiliar items introduced during a lesson." },
      { id: "C", text: "This pattern is particularly common when learners study several closely related words together." },
    ],
    answer: "A",
    explanation: "A paraphrases the opening contrast and introduces spaced review, which the next sentence then explains in practical terms.",
    distractor: "B and C can refer back to the memory problem, but they do not prepare the explanation of revisiting words at intervals.",
    highlights: {
      before: [
        { text: "during a lesson", type: "backward" },
        { text: "several days later", type: "backward" },
      ],
      answer: [
        { text: "This difference", type: "backward" },
        { text: "brief familiarity and lasting recall", type: "bridge" },
        { text: "spaced review works", type: "forward" },
      ],
      after: [{ text: "Revisiting vocabulary at increasing intervals", type: "backward" }],
    },
    connections: [
      { type: "backward", text: "This difference compresses the contrast between remembering now and recalling later." },
      { type: "forward", text: "Spaced review predicts the practical explanation of revisiting vocabulary at increasing intervals." },
      { type: "bridge", text: "The answer moves from the memory problem to the learning method that addresses it." },
    ],
  },
  {
    id: "cautious-conclusion",
    title: "A cautious conclusion",
    before: "The trial showed a clear improvement in concentration among participants who exercised before work.",
    after: "Their conclusion was therefore encouraging but deliberately cautious.",
    options: [
      { id: "A", text: "Participants also reported that the exercise sessions were enjoyable and relatively easy to follow." },
      { id: "B", text: "The researchers warned, however, that the small sample could not establish exercise as the cause." },
      { id: "C", text: "The strongest improvements appeared among participants who had slept well the previous night." },
    ],
    answer: "B",
    explanation: "The improvement makes the conclusion encouraging; the limitation in B explains why it remains cautious.",
    distractor: "A only strengthens the positive result. C adds a finding, but does not clearly establish the methodological caution required next.",
    highlights: {
      before: [{ text: "clear improvement", type: "backward" }],
      answer: [
        { text: "however", type: "bridge" },
        { text: "small sample could not establish exercise as the cause", type: "forward" },
      ],
      after: [
        { text: "therefore", type: "backward" },
        { text: "encouraging but deliberately cautious", type: "bridge" },
      ],
    },
    connections: [
      { type: "backward", text: "Therefore combines the positive finding and the limitation into one conclusion." },
      { type: "forward", text: "The small-sample warning supplies the reason the conclusion must be cautious." },
      { type: "bridge", text: "However balances strong results against weak causal certainty." },
    ],
  },
  {
    id: "successful-experiment",
    title: "A successful experiment",
    before: "The museum tested an audio guide that allowed visitors to choose between a short explanation and a detailed one.",
    after: "Because of this response, the museum has now adopted the system throughout the building.",
    options: [
      { id: "A", text: "Visitors completed the recordings more often when they were allowed to select the level of detail." },
      { id: "B", text: "The guide also included interviews with artists and explanations from museum specialists." },
      { id: "C", text: "The flexible format proved popular with families wanting different amounts of information." },
    ],
    answer: "C",
    explanation: "C keeps the focus on flexibility, explains why different levels were useful, and supplies the positive response behind the museum’s decision.",
    distractor: "A is genuinely tempting because it reports a positive outcome. However, it shifts the paragraph from visitor preference to completion rates, while C continues its central idea: flexible detail suited different needs.",
    highlights: {
      before: [{ text: "a short explanation and a detailed one", type: "backward" }],
      answer: [
        { text: "The flexible format", type: "backward" },
        { text: "proved popular", type: "forward" },
        { text: "different amounts of information", type: "bridge" },
      ],
      after: [
        { text: "this response", type: "backward" },
        { text: "adopted the system", type: "forward" },
      ],
    },
    connections: [
      { type: "backward", text: "Flexible format paraphrases the choice between short and detailed explanations; this response refers back to proved popular." },
      { type: "forward", text: "Proved popular gives the museum a reason to adopt the system throughout the building." },
      { type: "bridge", text: "Different amounts of information explains why the design’s flexibility mattered to its audience." },
    ],
  },
  {
    id: "wider-idea",
    title: "From one example to a wider idea",
    before: "One village converted an unused school into shared offices, a childcare centre and a small library.",
    after: "Similar schemes could be especially valuable in rural areas where public services are widely scattered.",
    options: [
      { id: "A", text: "The project has reduced the distance residents need to travel for several everyday services." },
      { id: "B", text: "Although local, the project shows how one building can meet several community needs." },
      { id: "C", text: "The building was selected because it stood near the village’s main road and bus stop." },
    ],
    answer: "B",
    explanation: "B extracts a general principle from the single village project and prepares the suggestion that similar schemes could work elsewhere.",
    distractor: "A fits the example extremely well, but remains inside it. Without B’s general principle, the jump from one village to similar rural schemes is abrupt. C is another local detail rather than a bridge.",
    highlights: {
      before: [
        { text: "One village", type: "backward" },
        { text: "shared offices, a childcare centre and a small library", type: "backward" },
      ],
      answer: [
        { text: "Although local", type: "bridge" },
        { text: "the project", type: "backward" },
        { text: "shows how one building can meet several community needs", type: "forward" },
      ],
      after: [{ text: "Similar schemes", type: "forward" }],
    },
    connections: [
      { type: "backward", text: "The project refers to the converted school and its several services." },
      { type: "forward", text: "Shows how turns one example into a principle that similar schemes can apply elsewhere." },
      { type: "bridge", text: "Although local explicitly pivots from the individual village to a wider rural argument." },
    ],
  },
];

export default function OteAdvancedReadingCohesionDetective({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [caseIndex, setCaseIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [clues, setClues] = useState({});
  const [revealed, setRevealed] = useState({});
  const [complete, setComplete] = useState(false);
  const completionLoggedRef = useRef(false);
  const basePath = nativeRoutes
    ? "/reading/advanced/part-3-gapped-text"
    : "/ote/reading/advanced/part-3-gapped-text";
  const menuPath = getSitePath(basePath);
  const practicePath = getSitePath(`${basePath}/practice/c1-pilot-1`);
  const currentCase = CASES[caseIndex];
  const selectedAnswer = answers[currentCase.id] || "";
  const selectedOption = currentCase.options.find((option) => option.id === selectedAnswer);
  const selectedClues = clues[currentCase.id] || [];
  const isRevealed = Boolean(revealed[currentCase.id]);
  const isCorrect = selectedAnswer === currentCase.answer;
  const correctCount = useMemo(
    () => CASES.filter((item) => answers[item.id] === item.answer).length,
    [answers]
  );
  const revealedCount = Object.keys(revealed).length;

  useEffect(() => {
    if (!complete || completionLoggedRef.current) return;
    completionLoggedRef.current = true;
    logOteTrainingCompleted({
      progressId: "reading.part3.advanced-cohesion-detective",
      section: "reading",
      part: "part-3",
      mode: "cohesion_detective",
      taskId: "advanced-reading-part-3-cohesion-detective",
      taskTitle: "Cohesion Detective",
      variant: "advanced",
      score: correctCount,
      total: CASES.length,
    });
  }, [complete, correctCount]);

  function selectAnswer(optionId) {
    if (isRevealed) return;
    setAnswers((current) => ({ ...current, [currentCase.id]: optionId }));
    setClues((current) => ({
      ...current,
      [currentCase.id]: (current[currentCase.id] || []).filter((key) => !key.startsWith("candidate:")),
    }));
  }

  function toggleClue(clueKey) {
    if (isRevealed) return;
    setClues((current) => {
      const next = new Set(current[currentCase.id] || []);
      if (next.has(clueKey)) next.delete(clueKey);
      else next.add(clueKey);
      return { ...current, [currentCase.id]: Array.from(next) };
    });
  }

  function revealCase() {
    if (!selectedAnswer || !selectedClues.length) return;
    setRevealed((current) => ({ ...current, [currentCase.id]: true }));
  }

  function advance() {
    if (!isRevealed) return;
    if (caseIndex === CASES.length - 1) {
      setComplete(true);
      return;
    }
    setCaseIndex((current) => current + 1);
  }

  function resetActivity() {
    setCaseIndex(0);
    setAnswers({});
    setClues({});
    setRevealed({});
    setComplete(false);
    completionLoggedRef.current = false;
  }

  return (
    <main className="ote-training-page ote-cohesion-detective-page">
      <Seo
        title="Cohesion Detective | OTE Advanced Reading Part 3 | Seif English"
        description="Train cohesion detection for OTE Advanced Reading with eight interactive missing-sentence cases and backward, forward, and bridge clues."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Part 3 training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">Advanced Reading Part 3 · Skill trainer</p>
        <h1>Cohesion Detective</h1>
        <p>
          Solve eight missing-sentence cases by following the language that connects ideas. Choose
          a sentence, mark the clues you noticed, and then compare your reasoning with the official clue map.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="Cohesion Detective overview">
        <div>
          <Search size={24} aria-hidden="true" />
          <strong>8 cases</strong>
          <span>The final two contain deliberately close, coherent distractors.</span>
        </div>
        <div>
          <MousePointerClick size={24} aria-hidden="true" />
          <strong>Mark your clues</strong>
          <span>Your word selections are exploratory and are never scored right or wrong.</span>
        </div>
        <div>
          <Eye size={24} aria-hidden="true" />
          <strong>Reveal the links</strong>
          <span>Compare backward, forward, and bridge connections after every answer.</span>
        </div>
      </section>

      <section className="ote-training-section ote-cohesion-intro">
        <div>
          <p className="ote-kicker">The detective method</p>
          <h2>Test the whole connection</h2>
          <ol className="ote-training-checklist">
            <li><strong>Read across the gap.</strong> Notice what the first sentence creates and what the last sentence assumes.</li>
            <li><strong>Choose the best bridge.</strong> A sentence can be possible English and still perform the wrong job.</li>
            <li><strong>Mark your evidence.</strong> Tap words in the context and in your candidate before revealing the official map.</li>
          </ol>
        </div>
        <ClueLegend />
      </section>

      {complete ? (
        <section className="ote-training-section ote-cohesion-complete">
          <div className="ote-cohesion-complete-icon"><Target size={34} aria-hidden="true" /></div>
          <p className="ote-kicker">Casebook complete</p>
          <h2>{correctCount} of {CASES.length} sentences chosen correctly</h2>
          <p>
            The option score records your decisions; your clue selections remain unscored. The aim
            is to make the invisible links in a paragraph increasingly visible to you.
          </p>
          <div className="ote-cohesion-results">
            {CASES.map((item, index) => {
              const correct = answers[item.id] === item.answer;
              return (
                <button key={item.id} type="button" onClick={() => { setCaseIndex(index); setComplete(false); }}>
                  {correct ? <CheckCircle2 size={19} aria-hidden="true" /> : <XCircle size={19} aria-hidden="true" />}
                  <span>Case {index + 1}: {item.title}</span>
                  <strong>{answers[item.id] || "—"} / {item.answer}</strong>
                </button>
              );
            })}
          </div>
          <div className="ote-cohesion-actions is-complete">
            <button className="is-secondary" type="button" onClick={resetActivity}>
              <RotateCcw size={17} aria-hidden="true" /> Try all cases again
            </button>
            <button type="button" onClick={() => navigate(practicePath)}>
              Open timed Part 3 practice <ChevronRight size={17} aria-hidden="true" />
            </button>
          </div>
        </section>
      ) : (
        <section className="ote-training-section ote-cohesion-runner">
          <div className="ote-cohesion-progress-head">
            <div>
              <span>Case {caseIndex + 1} of {CASES.length}</span>
              <strong>{revealedCount} clue maps revealed</strong>
            </div>
            <div className="ote-practice-progress-bar" aria-hidden="true">
              <span style={{ width: `${(revealedCount / CASES.length) * 100}%` }} />
            </div>
          </div>

          <ReadingCaseNavigator
            items={CASES}
            currentIndex={caseIndex}
            isComplete={(item) => Boolean(revealed[item.id])}
            onSelect={(index) => setCaseIndex(index)}
          />

          <article className="ote-cohesion-case">
            <header>
              <p className="ote-kicker">Case {caseIndex + 1}</p>
              <h2>{currentCase.title}</h2>
              <p>Which sentence belongs in the gap? Tap any words you consider useful evidence.</p>
            </header>

            <CohesionContext
              item={currentCase}
              selectedKeys={selectedClues}
              onToggle={toggleClue}
              revealed={isRevealed}
            />

            <div className="ote-cohesion-options" role="radiogroup" aria-label={`Options for case ${caseIndex + 1}`}>
              {currentCase.options.map((option) => (
                <button
                  className={`${selectedAnswer === option.id ? "is-selected" : ""} ${isRevealed && option.id === currentCase.answer ? "is-answer" : ""} ${isRevealed && selectedAnswer === option.id && !isCorrect ? "is-incorrect" : ""}`}
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selectedAnswer === option.id}
                  disabled={isRevealed}
                  onClick={() => selectAnswer(option.id)}
                >
                  <strong>{option.id}</strong>
                  <span>{option.text}</span>
                </button>
              ))}
            </div>

            {selectedOption && !isRevealed ? (
              <div className="ote-cohesion-candidate">
                <div>
                  <Lightbulb size={19} aria-hidden="true" />
                  <span>Your candidate — mark clues here too</span>
                </div>
                <SelectableText
                  text={selectedOption.text}
                  zone="candidate"
                  selectedKeys={selectedClues}
                  onToggle={toggleClue}
                  disabled={isRevealed}
                />
              </div>
            ) : null}

            {!isRevealed ? (
              <p className="ote-cohesion-prompt">
                {!selectedAnswer
                  ? "Choose a candidate sentence, then mark the words that support your decision."
                  : !selectedClues.length
                    ? "Now mark at least one clue in the surrounding text or your candidate."
                    : `${selectedClues.length} clue${selectedClues.length === 1 ? "" : "s"} marked. Ready to reveal.`}
              </p>
            ) : (
              <div className={`ote-cohesion-feedback ${isCorrect ? "is-correct" : "is-wrong"}`}>
                <div className="ote-cohesion-feedback-title">
                  {isCorrect ? <CheckCircle2 size={22} aria-hidden="true" /> : <XCircle size={22} aria-hidden="true" />}
                  <div>
                    <strong>{isCorrect ? "Case solved." : `The strongest answer is ${currentCase.answer}.`}</strong>
                    <p>{currentCase.explanation}</p>
                  </div>
                </div>
                <CohesionExplanation item={currentCase} />
              </div>
            )}

            <div className="ote-cohesion-actions">
              <button
                className="is-secondary"
                type="button"
                disabled={caseIndex === 0}
                onClick={() => setCaseIndex((current) => Math.max(0, current - 1))}
              >
                <ChevronLeft size={17} aria-hidden="true" /> Previous case
              </button>
              {!isRevealed ? (
                <button type="button" disabled={!selectedAnswer || !selectedClues.length} onClick={revealCase}>
                  <Eye size={17} aria-hidden="true" /> Reveal answer and clue map
                </button>
              ) : (
                <button type="button" onClick={advance}>
                  {caseIndex === CASES.length - 1 ? "Finish casebook" : "Next case"}
                  <ChevronRight size={17} aria-hidden="true" />
                </button>
              )}
            </div>
          </article>
        </section>
      )}
    </main>
  );
}
