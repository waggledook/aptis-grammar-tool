import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Layers3,
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

const ROUNDS = [
  {
    id: "follow-the-clues",
    title: "Follow the Clues",
    range: "Cases 1–5",
    level: "A2–B1",
    copy: "Find visible references, time links, repeated ideas, and clear causes or results.",
  },
  {
    id: "read-between-lines",
    title: "Read Between the Lines",
    range: "Cases 6–10",
    level: "B1–B2",
    copy: "Follow the paragraph’s complete direction and reject options that connect on only one side.",
  },
];

const CASES = [
  {
    id: "book-exchange",
    title: "The book exchange",
    before: "At the village library, volunteers created a shelf where residents could leave books they no longer wanted.",
    after: "By the end of the month, more than a hundred books had changed owners.",
    options: [
      { id: "A", text: "Volunteers added labels so readers could sort the books by subject." },
      { id: "B", text: "Anyone could take a book as long as they left another one in its place." },
      { id: "C", text: "The library also asked local schools to donate recent magazines." },
    ],
    answer: "B",
    explanation: "B explains how the exchange worked. Taking one book and leaving another naturally leads to books changing owners.",
    distractor: "A and C are believable library details, but neither explains the exchange described afterwards.",
    highlights: {
      before: [{ text: "books they no longer wanted", type: "backward" }],
      answer: [
        { text: "take a book", type: "backward" },
        { text: "as long as", type: "bridge" },
        { text: "left another one in its place", type: "forward" },
      ],
      after: [{ text: "books had changed owners", type: "backward" }],
    },
    connections: [
      { type: "backward", text: "Book and another one refer back to the books placed on the shelf." },
      { type: "forward", text: "Leaving one book while taking another prepares the result: many books change owners." },
      { type: "bridge", text: "As long as states the rule that turns a shelf of unwanted books into an exchange." },
    ],
  },
  {
    id: "delayed-journey",
    title: "A delayed journey",
    before: "Daniel planned to catch the 8:10 train, but his bus arrived at the station several minutes late.",
    after: "When he reached the office, the morning meeting had already started.",
    options: [
      { id: "A", text: "He called a colleague and asked her to send him the meeting notes later." },
      { id: "B", text: "He considered walking to the station but decided the distance was too great." },
      { id: "C", text: "He had to wait nearly thirty minutes for the next train into the city." },
    ],
    answer: "C",
    explanation: "The sequence is complete only with C: Daniel misses the 8:10 train, waits for the next one, and reaches work after the meeting starts.",
    distractor: "A could happen after he realises he will be late, but it does not cause the delay. B belongs before the bus journey, not after arrival at the station.",
    highlights: {
      before: [
        { text: "8:10 train", type: "backward" },
        { text: "several minutes late", type: "forward" },
      ],
      answer: [{ text: "wait nearly thirty minutes for the next train", type: "bridge" }],
      after: [{ text: "had already started", type: "forward" }],
    },
    connections: [
      { type: "backward", text: "Next train makes sense because the late bus caused Daniel to miss the 8:10 service." },
      { type: "forward", text: "The extra thirty-minute wait explains why the meeting has already started." },
      { type: "bridge", text: "C supplies the missing middle event in a clear time sequence." },
    ],
  },
  {
    id: "clearer-menu",
    title: "A clearer menu",
    before: "A café replaced its pale grey menu with one that used larger black print.",
    after: "As a result, older customers said it was much easier to read.",
    options: [
      { id: "A", text: "The stronger contrast made each dish and price stand out more clearly." },
      { id: "B", text: "The new menu also included photographs of several popular dishes." },
      { id: "C", text: "Staff moved the menus from the counter to every table in the café." },
    ],
    answer: "A",
    explanation: "A explains why the change from pale grey to black print improved readability. As a result then introduces the effect on customers.",
    distractor: "Photographs and table placement might help in other ways, but they do not directly explain why the print became easier to read.",
    highlights: {
      before: [
        { text: "pale grey", type: "backward" },
        { text: "larger black print", type: "backward" },
      ],
      answer: [
        { text: "stronger contrast", type: "backward" },
        { text: "stand out more clearly", type: "forward" },
      ],
      after: [
        { text: "As a result", type: "bridge" },
        { text: "easier to read", type: "forward" },
      ],
    },
    connections: [
      { type: "backward", text: "Stronger contrast paraphrases the change from pale grey to black print." },
      { type: "forward", text: "Stand out more clearly predicts that customers will find the menu easier to read." },
      { type: "bridge", text: "As a result confirms that the final sentence is the consequence of that contrast." },
    ],
  },
  {
    id: "study-room",
    title: "A better study room",
    before: "Students complained that the shared study room was noisy and difficult to use.",
    after: "These changes made it possible to work alone or discuss projects without disturbing others.",
    options: [
      { id: "A", text: "The school extended the opening hours and added charging points beside each desk." },
      { id: "B", text: "It divided the room into quiet areas and small spaces for group work." },
      { id: "C", text: "Teachers began booking the room for revision sessions before important exams." },
    ],
    answer: "B",
    explanation: "B creates one area for each use named afterwards: quiet work alone and separate spaces for group discussion.",
    distractor: "Opening hours and charging points do not solve the noise problem. Teacher bookings could make the shared room busier rather than separate its uses.",
    highlights: {
      before: [{ text: "noisy and difficult to use", type: "backward" }],
      answer: [
        { text: "quiet areas", type: "forward" },
        { text: "spaces for group work", type: "forward" },
      ],
      after: [
        { text: "These changes", type: "backward" },
        { text: "work alone or discuss projects", type: "bridge" },
      ],
    },
    connections: [
      { type: "backward", text: "These changes refers directly to the two types of space introduced in B." },
      { type: "forward", text: "Quiet areas prepare work alone; group spaces prepare discuss projects." },
      { type: "bridge", text: "The correct option turns the original noise problem into a two-part practical solution." },
    ],
  },
  {
    id: "technical-questions",
    title: "Fewer technical questions",
    before: "During the first week of an online course, the tutor received dozens of messages about logging in and uploading assignments.",
    after: "After that, the number of technical questions fell sharply.",
    options: [
      { id: "A", text: "She answered each message separately and kept a list of the most common problems." },
      { id: "B", text: "She asked the college to extend the first assignment deadline by two days." },
      { id: "C", text: "She recorded a short video showing students how to complete both processes." },
    ],
    answer: "C",
    explanation: "The video solves both common problems for everyone, which explains why fewer students ask technical questions afterwards.",
    distractor: "Answering separately does not prevent future messages. A later deadline gives students more time but does not teach them how to use the system.",
    highlights: {
      before: [{ text: "logging in and uploading assignments", type: "backward" }],
      answer: [
        { text: "both processes", type: "backward" },
        { text: "showing students how", type: "forward" },
      ],
      after: [
        { text: "After that", type: "backward" },
        { text: "fell sharply", type: "forward" },
      ],
    },
    connections: [
      { type: "backward", text: "Both processes refers to logging in and uploading assignments." },
      { type: "forward", text: "Showing everyone how to complete them prepares the sharp fall in questions." },
      { type: "bridge", text: "After that marks the video as the cause of the later improvement." },
    ],
  },
  {
    id: "repair-limit",
    title: "Not every repair succeeds",
    before: "The community repair workshop helps residents fix small appliances instead of throwing them away. Volunteers also teach visitors basic practical skills.",
    after: "Nevertheless, organisers say the sessions are valuable even when an object cannot be repaired.",
    options: [
      { id: "A", text: "Some visitors later return as volunteers after gaining confidence at earlier sessions." },
      { id: "B", text: "Certain items are too damaged or require parts that are no longer available." },
      { id: "C", text: "The workshop now takes place twice a month in the local community centre." },
    ],
    answer: "B",
    explanation: "Nevertheless introduces a contrast, so the gap must present a difficulty. B explains why some objects cannot be repaired despite the workshop’s benefits.",
    distractor: "A adds another benefit and C adds practical information. Neither gives nevertheless a limitation to contrast with.",
    highlights: {
      before: [
        { text: "helps residents fix", type: "backward" },
        { text: "teach visitors", type: "backward" },
      ],
      answer: [{ text: "too damaged or require parts that are no longer available", type: "bridge" }],
      after: [
        { text: "Nevertheless", type: "bridge" },
        { text: "even when an object cannot be repaired", type: "backward" },
      ],
    },
    connections: [
      { type: "backward", text: "Cannot be repaired points back to the damage and unavailable parts in B." },
      { type: "forward", text: "The limitation prepares a conclusion that the workshop still has value despite failure." },
      { type: "bridge", text: "Nevertheless reverses the direction from repair failure back to the workshop’s wider benefits." },
    ],
  },
  {
    id: "promising-result",
    title: "A promising result",
    before: "A trial found that employees who took short walks at lunchtime reported better concentration during the afternoon.",
    after: "The researchers therefore described the result as promising rather than final.",
    options: [
      { id: "A", text: "However, the study involved only one company and lasted for three weeks." },
      { id: "B", text: "Most participants chose to walk with colleagues rather than go out alone." },
      { id: "C", text: "The company also provided a quiet room where staff could rest after lunch." },
    ],
    answer: "A",
    explanation: "The positive finding makes the result promising; the small, short study explains why the researchers do not call it final.",
    distractor: "B and C are plausible trial details, but neither limits the strength of the conclusion.",
    highlights: {
      before: [{ text: "better concentration", type: "backward" }],
      answer: [
        { text: "However", type: "bridge" },
        { text: "only one company and lasted for three weeks", type: "forward" },
      ],
      after: [
        { text: "therefore", type: "backward" },
        { text: "promising rather than final", type: "bridge" },
      ],
    },
    connections: [
      { type: "backward", text: "Therefore combines the positive result with the limitation in A." },
      { type: "forward", text: "A small, short trial prepares the cautious words rather than final." },
      { type: "bridge", text: "However turns from encouraging evidence to a reason for caution." },
    ],
  },
  {
    id: "wider-value",
    title: "A small change with wider value",
    before: "One small hotel stopped replacing towels every day unless guests specifically requested fresh ones.",
    after: "Similar changes could help other businesses reduce waste without seriously affecting customers.",
    options: [
      { id: "A", text: "The hotel also replaced plastic water bottles with glass containers in each room." },
      { id: "B", text: "Some guests said they preferred fresh towels even when staying for only one night." },
      { id: "C", text: "The experiment showed that a simple change in routine could save water with few complaints." },
    ],
    answer: "C",
    explanation: "C extracts a general lesson from the hotel’s experiment and prepares the idea that similar changes could work in other businesses.",
    distractor: "A adds another environmental measure but does not explain what the towel experiment demonstrated. B remains focused on dissatisfied guests and does not support the positive wider conclusion.",
    highlights: {
      before: [{ text: "stopped replacing towels every day", type: "backward" }],
      answer: [
        { text: "The experiment", type: "backward" },
        { text: "simple change in routine", type: "bridge" },
        { text: "save water with few complaints", type: "forward" },
      ],
      after: [{ text: "Similar changes", type: "forward" }],
    },
    connections: [
      { type: "backward", text: "The experiment and change in routine refer to the hotel’s towel policy." },
      { type: "forward", text: "Saving water with few complaints supports applying similar changes elsewhere." },
      { type: "bridge", text: "C moves from one hotel’s experience to a lesson other businesses can use." },
    ],
  },
  {
    id: "app-not-enough",
    title: "The app was not enough",
    before: "A new bus app allowed passengers to see delays and live arrival times.",
    after: "For this reason, the town continued to display paper timetables at every stop.",
    options: [
      { id: "A", text: "Younger passengers quickly began using the app to plan journeys more accurately." },
      { id: "B", text: "Some older residents did not own smartphones or felt uncomfortable using the service." },
      { id: "C", text: "Drivers also received updates when roadworks affected their usual routes." },
    ],
    answer: "B",
    explanation: "B connects on both sides: it concerns the digital app and identifies the passengers who still need paper information.",
    distractor: "A fits naturally after the first sentence, making it a strong distractor, but popularity among younger passengers does not explain why paper timetables remained. C concerns drivers, not access for passengers.",
    highlights: {
      before: [{ text: "bus app", type: "backward" }],
      answer: [
        { text: "did not own smartphones", type: "bridge" },
        { text: "uncomfortable using the service", type: "bridge" },
      ],
      after: [
        { text: "For this reason", type: "backward" },
        { text: "paper timetables", type: "forward" },
      ],
    },
    connections: [
      { type: "backward", text: "The service refers back to the bus app; this reason points back to the access problem in B." },
      { type: "forward", text: "Passengers without usable smartphones create a clear need for paper timetables." },
      { type: "bridge", text: "B moves from what the app can do to the group the app cannot serve." },
    ],
  },
  {
    id: "park-lesson",
    title: "From a park to a general lesson",
    before: "Local residents helped plan the new park, choose its equipment and organise its opening events. Visitor numbers remained high after the first summer.",
    after: "Other councils may therefore benefit from involving residents before, not after, making major decisions.",
    options: [
      { id: "A", text: "The project suggests that early public involvement can create stronger long-term support." },
      { id: "B", text: "The park also includes a small café and an area for outdoor performances." },
      { id: "C", text: "Some residents had originally wanted more parking beside the main entrance." },
    ],
    answer: "A",
    explanation: "A transforms the park example into a general principle and prepares the recommendation that other councils should involve residents early.",
    distractor: "B is a relevant park detail but performs the wrong job at the paragraph’s conclusion. C returns to an earlier disagreement when the argument is moving towards a wider lesson.",
    highlights: {
      before: [
        { text: "residents helped plan", type: "backward" },
        { text: "remained high after the first summer", type: "backward" },
      ],
      answer: [
        { text: "The project suggests", type: "bridge" },
        { text: "early public involvement", type: "backward" },
        { text: "stronger long-term support", type: "forward" },
      ],
      after: [
        { text: "Other councils", type: "forward" },
        { text: "therefore", type: "backward" },
      ],
    },
    connections: [
      { type: "backward", text: "Early public involvement paraphrases residents helping during the planning stage." },
      { type: "forward", text: "The project’s general lesson prepares a recommendation for other councils." },
      { type: "bridge", text: "Suggests turns one park into evidence for a wider principle: right topic and the right job in the paragraph." },
    ],
  },
];

function getRoundFeedback(roundIndex, score) {
  if (roundIndex === 0) {
    if (score === 5) return "Excellent. You are identifying clear links accurately.";
    if (score >= 3) return "Good work. Review any missed references or cause-and-result links.";
    return "Try again and mark clues on both sides before choosing.";
  }
  if (score === 5) return "Excellent. You are following the writer’s full line of thought.";
  if (score >= 3) return "Strong result. Check whether your wrong answers fitted only one side of the gap.";
  return "Slow down and ask what job the missing sentence performs in the paragraph.";
}

export default function OteGeneralReadingCohesionDetective({ nativeRoutes = false }) {
  const navigate = useNavigate();
  const [caseIndex, setCaseIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [clues, setClues] = useState({});
  const [revealed, setRevealed] = useState({});
  const [roundBreak, setRoundBreak] = useState(false);
  const [complete, setComplete] = useState(false);
  const completionLoggedRef = useRef(false);
  const basePath = nativeRoutes
    ? "/reading/general/part-3-gapped-text"
    : "/ote/reading/general/part-3-gapped-text";
  const menuPath = getSitePath(basePath);
  const practicePath = getSitePath(`${basePath}/practice/a2-pilot-1`);
  const currentCase = CASES[caseIndex];
  const currentRoundIndex = caseIndex < 5 ? 0 : 1;
  const currentRound = ROUNDS[currentRoundIndex];
  const roundCaseNumber = (caseIndex % 5) + 1;
  const selectedAnswer = answers[currentCase.id] || "";
  const selectedOption = currentCase.options.find((option) => option.id === selectedAnswer);
  const selectedClues = clues[currentCase.id] || [];
  const isRevealed = Boolean(revealed[currentCase.id]);
  const isCorrect = selectedAnswer === currentCase.answer;
  const roundScores = useMemo(
    () => ROUNDS.map((_, roundIndex) => {
      const start = roundIndex * 5;
      return CASES.slice(start, start + 5).filter((item) => answers[item.id] === item.answer).length;
    }),
    [answers]
  );
  const totalScore = roundScores[0] + roundScores[1];
  const revealedCount = Object.keys(revealed).length;

  useEffect(() => {
    if (!complete || completionLoggedRef.current) return;
    completionLoggedRef.current = true;
    logOteTrainingCompleted({
      progressId: "reading.part3.general-cohesion-detective",
      section: "reading",
      part: "part-3",
      mode: "cohesion_detective_general",
      taskId: "general-reading-part-3-cohesion-detective",
      taskTitle: "Cohesion Detective: OTE General",
      variant: "general",
      score: totalScore,
      total: CASES.length,
    });
  }, [complete, totalScore]);

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

  function advance() {
    if (!isRevealed) return;
    if (caseIndex === 4) {
      setRoundBreak(true);
      return;
    }
    if (caseIndex === CASES.length - 1) {
      setComplete(true);
      return;
    }
    setCaseIndex((current) => current + 1);
  }

  function beginSecondRound() {
    setCaseIndex(5);
    setRoundBreak(false);
  }

  function resetActivity() {
    setCaseIndex(0);
    setAnswers({});
    setClues({});
    setRevealed({});
    setRoundBreak(false);
    setComplete(false);
    completionLoggedRef.current = false;
  }

  return (
    <main className="ote-training-page ote-cohesion-detective-page ote-general-cohesion-page">
      <Seo
        title="Cohesion Detective | OTE General Reading Part 3 | Seif English"
        description="Train OTE General Reading Part 3 cohesion in two rounds, moving from visible sentence links to paragraph-level reasoning."
      />

      <button className="ote-training-back" type="button" onClick={() => navigate(menuPath)}>
        <ArrowLeft size={18} aria-hidden="true" /> Back to Part 3 training
      </button>

      <header className="ote-training-hero">
        <p className="ote-kicker">General Reading Part 3 · Two-round skill trainer</p>
        <h1>Cohesion Detective</h1>
        <p>
          Investigate ten missing-sentence cases. Begin with visible references, sequences, and
          results, then move towards paragraph-level reasoning and more convincing distractors.
        </p>
      </header>

      <section className="ote-training-summary" aria-label="General Cohesion Detective overview">
        <div><Layers3 size={24} aria-hidden="true" /><strong>2 rounds</strong><span>Five supported cases followed by five more demanding cases.</span></div>
        <div><MousePointerClick size={24} aria-hidden="true" /><strong>Mark your clues</strong><span>Your word selections help you think and are never scored.</span></div>
        <div><Eye size={24} aria-hidden="true" /><strong>Reveal the evidence</strong><span>Compare your reasoning with the official connection map.</span></div>
      </section>

      <section className="ote-training-section ote-cohesion-intro">
        <div>
          <p className="ote-kicker">The detective method</p>
          <h2>Connect both sides of the gap</h2>
          <ol className="ote-training-checklist">
            <li><strong>Look before the gap.</strong> Identify the topic, event, problem, or contrast already established.</li>
            <li><strong>Look after the gap.</strong> Notice reference words, results, contrasts, and ideas that require preparation.</li>
            <li><strong>Choose the connecting sentence.</strong> A sentence can fit the topic and still be in the wrong place.</li>
          </ol>
        </div>
        <ClueLegend />
      </section>

      <section className="ote-cohesion-round-overview" aria-label="Activity rounds">
        {ROUNDS.map((round, index) => (
          <article className={index === 1 ? "is-advanced" : ""} key={round.id}>
            <span>Round {index + 1} · {round.level}</span>
            <h2>{round.title}</h2>
            <strong>{round.range}</strong>
            <p>{round.copy}</p>
          </article>
        ))}
      </section>

      {complete ? (
        <section className="ote-training-section ote-cohesion-complete">
          <div className="ote-cohesion-complete-icon"><Target size={34} aria-hidden="true" /></div>
          <p className="ote-kicker">Both case files complete</p>
          <h2>Your two cohesion scores</h2>
          <div className="ote-cohesion-score-grid">
            {ROUNDS.map((round, index) => (
              <article key={round.id}>
                <span>Round {index + 1}</span>
                <h3>{round.title}</h3>
                <strong>{roundScores[index]} / 5</strong>
                <p>{getRoundFeedback(index, roundScores[index])}</p>
              </article>
            ))}
          </div>
          <div className="ote-cohesion-results is-two-rounds">
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
            <button className="is-secondary" type="button" onClick={resetActivity}><RotateCcw size={17} aria-hidden="true" /> Try both rounds again</button>
            <button type="button" onClick={() => navigate(practicePath)}>Open timed Part 3 practice <ChevronRight size={17} aria-hidden="true" /></button>
          </div>
        </section>
      ) : roundBreak ? (
        <section className="ote-training-section ote-cohesion-round-break">
          <div className="ote-cohesion-complete-icon"><CheckCircle2 size={34} aria-hidden="true" /></div>
          <p className="ote-kicker">Case File 1 complete</p>
          <h2>{ROUNDS[0].title}: {roundScores[0]} / 5</h2>
          <p>{getRoundFeedback(0, roundScores[0])}</p>
          <div className="ote-cohesion-round-shift">
            <span>Next: B1–B2</span>
            <h3>Now read between the lines</h3>
            <p>More than one option may fit the first sentence. Check which one also prepares the sentence after the gap.</p>
          </div>
          <div className="ote-cohesion-actions">
            <button className="is-secondary" type="button" onClick={() => { setRoundBreak(false); setCaseIndex(4); }}><ChevronLeft size={17} aria-hidden="true" /> Review Case 5</button>
            <button type="button" onClick={beginSecondRound}>Start Round 2 <ChevronRight size={17} aria-hidden="true" /></button>
          </div>
        </section>
      ) : (
        <section className="ote-training-section ote-cohesion-runner">
          <div className="ote-cohesion-progress-head">
            <div><span>Round {currentRoundIndex + 1}: {currentRound.title} · Case {roundCaseNumber} of 5</span><strong>{revealedCount} of 10 clue maps revealed</strong></div>
            <div className="ote-practice-progress-bar" aria-hidden="true"><span style={{ width: `${(revealedCount / CASES.length) * 100}%` }} /></div>
          </div>

          <ReadingCaseNavigator
            items={CASES}
            currentIndex={caseIndex}
            isComplete={(item) => Boolean(revealed[item.id])}
            onSelect={(index) => { setCaseIndex(index); setRoundBreak(false); }}
          />

          <article className="ote-cohesion-case">
            <header>
              <p className="ote-kicker">Case {caseIndex + 1} · {currentRound.level}</p>
              <h2>{currentCase.title}</h2>
              <p>Choose the missing sentence, then mark at least one word or phrase that supports your decision.</p>
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
                  <strong>{option.id}</strong><span>{option.text}</span>
                </button>
              ))}
            </div>

            {selectedOption && !isRevealed ? (
              <div className="ote-cohesion-candidate">
                <div><Lightbulb size={19} aria-hidden="true" /><span>Your candidate — mark clues here too</span></div>
                <SelectableText text={selectedOption.text} zone="candidate" selectedKeys={selectedClues} onToggle={toggleClue} disabled={isRevealed} />
              </div>
            ) : null}

            {!isRevealed ? (
              <p className="ote-cohesion-prompt">
                {!selectedAnswer ? "Choose a candidate sentence, then mark your evidence." : !selectedClues.length ? "Now mark at least one clue on either side or in your candidate." : `${selectedClues.length} clue${selectedClues.length === 1 ? "" : "s"} marked. Ready to reveal.`}
              </p>
            ) : (
              <div className={`ote-cohesion-feedback ${isCorrect ? "is-correct" : "is-wrong"}`}>
                <div className="ote-cohesion-feedback-title">
                  {isCorrect ? <CheckCircle2 size={22} aria-hidden="true" /> : <XCircle size={22} aria-hidden="true" />}
                  <div><strong>{isCorrect ? "Case solved." : `The strongest answer is ${currentCase.answer}.`}</strong><p>{currentCase.explanation}</p></div>
                </div>
                <CohesionExplanation item={currentCase} />
              </div>
            )}

            <div className="ote-cohesion-actions">
              <button className="is-secondary" type="button" disabled={caseIndex === 0 || caseIndex === 5} onClick={() => setCaseIndex((current) => Math.max(currentRoundIndex * 5, current - 1))}><ChevronLeft size={17} aria-hidden="true" /> Previous case</button>
              {!isRevealed ? (
                <button type="button" disabled={!selectedAnswer || !selectedClues.length} onClick={() => setRevealed((current) => ({ ...current, [currentCase.id]: true }))}><Eye size={17} aria-hidden="true" /> Reveal answer and clues</button>
              ) : (
                <button type="button" onClick={advance}>{caseIndex === 4 ? "Complete Round 1" : caseIndex === 9 ? "Finish both rounds" : "Next case"}<ChevronRight size={17} aria-hidden="true" /></button>
              )}
            </div>
          </article>
        </section>
      )}
    </main>
  );
}
