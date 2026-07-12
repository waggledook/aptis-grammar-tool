import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronDown, RotateCcw, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { logOteMockCompleted, logOteMockStarted, saveOteMockAttempt } from "../../firebase.js";
import { getSitePath } from "../../siteConfig.js";
import { advancedReadingPart1PracticeSets } from "./OteAdvancedReadingPart1Practice.jsx";
import { advancedReadingPart2PracticeSets } from "./OteAdvancedReadingPart2Practice.jsx";
import { advancedReadingPart4PracticeSets } from "./OteAdvancedReadingPart4Practice.jsx";
import "./styles/ote.css";

const part1 = advancedReadingPart1PracticeSets["c1-full-mock-1"].questions;
const part2 = advancedReadingPart2PracticeSets["c1-full-mock-1"];
const part4 = advancedReadingPart4PracticeSets["c1-full-mock-1"];
const part3 = {
  heading: "The quiet intelligence of maintenance",
  text: "Innovation has a powerful public image. New bridges are opened with speeches, software updates are announced with enthusiasm, and new buildings appear in photographs long before anyone has used them. Maintenance has no comparable ceremony. Its purpose is to keep an existing system working, often by preventing changes that most people would prefer not to notice. Yet much of modern life depends less on spectacular invention than on the patient inspection, cleaning, adjustment and repair of things already in place.\n\nOne reason maintenance receives little attention is that success leaves almost no trace. When a lift fails, the inconvenience is immediate and somebody is asked why. When it operates safely for twenty years, each uneventful journey seems to require no explanation. [1] The better maintenance is performed, the easier it becomes to imagine that the system simply looks after itself. This can make maintenance departments vulnerable when organisations search for costs that appear removable.\n\nMaintenance is sometimes described as routine work, but repetition does not make it mindless. An experienced engineer listening to a machine may detect a change that no instrument has yet identified. A caretaker may know which patch of damp is harmless after heavy rain and which suggests a damaged pipe. [2] This kind of knowledge is difficult to capture completely in manuals because it includes memories of earlier faults, repairs and unusual conditions. It is built gradually through contact with the same equipment, building or environment.\n\nDigital monitoring appears to offer a different model. Sensors can record vibration, temperature and pressure continuously, allowing organisations to replace components before they fail. This is valuable, particularly where inspection is dangerous or breakdowns are costly. [3] A sensor may identify an unusual pattern without revealing whether it signals serious damage, a harmless change in operating conditions or a problem with the sensor itself. Data can extend the maintainer’s attention, but interpretation still depends on technical understanding and knowledge of context.\n\nThe economics of maintenance create a further difficulty. Replacing a worn part today has a definite cost, while the failure avoided next year remains hypothetical. [4] This imbalance encourages managers to postpone work, especially when they will not be responsible for the system by the time the consequences appear. The decision may make a budget look efficient in the short term while transferring a much larger risk to future users or managers.\n\nOur ability to maintain objects also depends on whether they were intended to be maintained. [5] Components may be sealed inside cases, spare parts may be unavailable, and software may prevent an otherwise functional device from operating after support ends. In such circumstances, the skill of the repairer is not enough. Maintenance becomes a question of design, ownership and access to information, rather than simply of technical ability.\n\nThe people who perform maintenance often occupy an uncertain position. Their work requires judgement, but because its best results are invisible, it may be treated as low-skilled. Cleaners, technicians and caretakers are frequently noticed only when something has gone wrong or when their work is interrupted. [6] Recognising this expertise does not require turning every repair into a heroic act. It means understanding that reliability is produced by attention and accumulated knowledge, not by the absence of human involvement.\n\nMaintenance also has a moral dimension. Choosing to care for an existing object, building or public service means accepting responsibility for people who will use it later. Neglect can be attractive because its costs are delayed and distributed, while the savings are immediate. A culture that praises creation but ignores care may therefore produce impressive beginnings and disappointing futures.\n\nThe point is not that societies should stop innovating. New technologies can make systems safer, cleaner and easier to repair. But innovation and maintenance should not be imagined as opposites. Every invention that lasts eventually becomes somebody’s maintenance problem. The real test of intelligent design may be not only whether something works when it is new, but whether people can understand, repair and sustain it after the excitement has passed.",
  sentences: {
    A: "Such information does not remove uncertainty; it changes the evidence on which human judgement must operate.",
    B: "The lower status of maintenance work often reflects how little people understand the expertise on which it depends.",
    C: "The outcome is a curious imbalance: failure is dramatic and attributable, while prevention disappears into ordinary life.",
    D: "Some organisations have therefore replaced permanent maintenance teams with outside companies hired only when problems occur.",
    E: "Spending on repair is immediately visible, whereas the breakdown it may prevent belongs to an uncertain future.",
    F: "Their familiarity with a particular system allows them to notice small departures from its normal behaviour.",
    G: "In many cases, however, maintenance has already been made difficult by decisions taken when the product was designed.",
  },
  answers: { 1: "C", 2: "F", 3: "A", 4: "E", 5: "G", 6: "B" },
  feedback: {
    1: "The paragraph contrasts highly visible failure with successful maintenance that produces no noticeable event. C expresses this imbalance directly, and the following sentence develops the paradox that effective maintenance appears unnecessary.",
    2: "The engineer and caretaker recognise small signs because they know their particular systems extremely well. F explains the source of this ability, and ‘This kind of knowledge’ refers back to that familiarity and pattern recognition.",
    3: "The paragraph introduces data gathered by digital sensors. A qualifies its usefulness: data changes the available evidence but does not eliminate judgement. The next sentence illustrates this with several possible explanations for one unusual reading.",
    4: "The writer contrasts a definite present cost with a future failure that may remain invisible. E reformulates this in terms of immediately visible spending and uncertain future benefit, creating the imbalance named next.",
    5: "The paragraph asks whether objects were designed to be maintained. G establishes that design decisions may already have made repair difficult, before the text gives examples such as sealed components and unavailable parts.",
    6: "The paragraph discusses maintenance workers’ uncertain professional status despite the judgement their work requires. B links their low status with invisible expertise, which ‘Recognising this expertise’ then refers back to directly.",
  },
};

const PARTS = ["part1", "part2", "part3", "part4"];
const PART_TIMES = { part1: 80, part2: 8 * 60, part3: 11 * 60, part4: 8 * 60 };
const TITLE_SECONDS = 3;
const formatTime = (value) => `${String(Math.floor(Math.max(0, value) / 60)).padStart(2, "0")}:${String(Math.max(0, value) % 60).padStart(2, "0")}`;

export default function OteAdvancedReadingMockRunner({ user, nativeRoutes = false }) {
  const navigate = useNavigate();
  const menuPath = getSitePath(nativeRoutes ? "/reading" : "/ote/reading");
  const [status, setStatus] = useState("ready");
  const [countdownLeft, setCountdownLeft] = useState(10);
  const [titleLeft, setTitleLeft] = useState(TITLE_SECONDS);
  const [partIndex, setPartIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [answers, setAnswers] = useState({ part1: {}, part2: {}, part3: {}, part4: {} });
  const [secondsLeft, setSecondsLeft] = useState(PART_TIMES.part1);
  const logged = useRef(false);
  const startedAt = useRef(null);
  const currentPart = PARTS[partIndex];
  const currentItems = currentPart === "part1" ? part1 : currentPart === "part2" ? part2.questions : currentPart === "part4" ? part4.questions : Object.keys(part3.answers);
  const score = useMemo(() => part1.reduce((n, q, i) => n + (answers.part1[i] === q.answer ? 1 : 0), 0) + part2.questions.reduce((n, q, i) => n + (answers.part2[i] === q.answer ? 1 : 0), 0) + Object.entries(part3.answers).reduce((n, [gap, answer]) => n + (answers.part3[gap] === answer ? 1 : 0), 0) + part4.questions.reduce((n, q, i) => n + (answers.part4[i] === q.answer ? 1 : 0), 0), [answers]);
  const total = part1.length + part2.questions.length + 6 + part4.questions.length;
  const partScores = useMemo(() => ({
    part1: part1.reduce((n, q, i) => n + (answers.part1[i] === q.answer ? 1 : 0), 0),
    part2: part2.questions.reduce((n, q, i) => n + (answers.part2[i] === q.answer ? 1 : 0), 0),
    part3: Object.entries(part3.answers).reduce((n, [gap, answer]) => n + (answers.part3[gap] === answer ? 1 : 0), 0),
    part4: part4.questions.reduce((n, q, i) => n + (answers.part4[i] === q.answer ? 1 : 0), 0),
  }), [answers]);

  useEffect(() => {
    if (status !== "countdown") return undefined;
    if (countdownLeft <= 0) { setTitleLeft(TITLE_SECONDS); setStatus("partTitle"); return undefined; }
    const timer = window.setTimeout(() => setCountdownLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdownLeft, status]);

  useEffect(() => {
    if (status !== "partTitle") return undefined;
    if (titleLeft <= 0) { setSecondsLeft(PART_TIMES[currentPart]); setStatus("running"); return undefined; }
    const timer = window.setTimeout(() => setTitleLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [currentPart, status, titleLeft]);

  useEffect(() => {
    if (status !== "running") return undefined;
    if (secondsLeft <= 0) { advance(); return undefined; }
    const timer = window.setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft, status, partIndex, itemIndex]);

  function start() {
    logged.current = false;
    startedAt.current = new Date();
    setAnswers({ part1: {}, part2: {}, part3: {}, part4: {} });
    setPartIndex(0); setItemIndex(0); setCountdownLeft(10); setStatus("countdown");
    logOteMockStarted({ module: "reading", mockId: "reading-advanced-1", mockTitle: "OTE Advanced Reading Mock 1" });
  }

  function advance() {
    if (currentPart !== "part3" && itemIndex < currentItems.length - 1) {
      setItemIndex((value) => value + 1);
      if (currentPart === "part1") setSecondsLeft(PART_TIMES.part1);
      return;
    }
    if (partIndex < PARTS.length - 1) {
      setPartIndex((value) => value + 1); setItemIndex(0); setTitleLeft(TITLE_SECONDS); setStatus("partTitle");
      return;
    }
    finish();
  }

  function finish() {
    if (!logged.current) {
      logged.current = true;
      const elapsedSeconds = startedAt.current ? Math.max(0, Math.floor((Date.now() - startedAt.current.getTime()) / 1000)) : 0;
      const completion = { module: "reading", mockId: "reading-advanced-1", mockTitle: "OTE Advanced Reading Mock 1", score, total, partScores, elapsedSeconds, reason: "completed" };
      logOteMockCompleted(completion);
      if (user) {
        saveOteMockAttempt({ ...completion, answers, startedAtClient: startedAt.current?.toISOString?.() || null })
          .catch((error) => console.warn("[OTE reading mock] Could not save profile attempt", error));
      }
    }
    setStatus("complete");
  }

  function skipCurrentStep() {
    if (status === "countdown") {
      setTitleLeft(TITLE_SECONDS);
      setStatus("partTitle");
      return;
    }
    if (status === "partTitle") {
      setSecondsLeft(PART_TIMES[currentPart]);
      setStatus("running");
      return;
    }
    if (status !== "running") return;
    if (currentPart === "part1") {
      advance();
      return;
    }
    if (partIndex < PARTS.length - 1) {
      setPartIndex((value) => value + 1);
      setItemIndex(0);
      setTitleLeft(TITLE_SECONDS);
      setStatus("partTitle");
      return;
    }
    finish();
  }

  function setAnswer(part, id, value) { setAnswers((current) => ({ ...current, [part]: { ...current[part], [id]: value } })); }

  if (user?.oteVersion && user.oteVersion !== "advanced") return <Unavailable onBack={() => navigate(menuPath)} />;
  const progress = status === "running" ? ((partIndex + (currentPart === "part3" ? 0.5 : itemIndex / currentItems.length)) / 4) * 100 : (partIndex / 4) * 100;

  const examInProgress = ["countdown", "partTitle", "running"].includes(status);
  return <main className="ote-exam ote-reading-exam"><Seo title="OTE Advanced Reading Mock 1 | Seif English" description="Full Advanced OTE Reading mock test." /><ReadingHeader title={status === "running" || status === "partTitle" ? `Reading Part ${partIndex + 1}` : "Reading"} progress={progress} timeLeft={status === "running" ? secondsLeft : null} />{status === "ready" ? <Start onStart={start} /> : status === "countdown" ? <Countdown secondsLeft={countdownLeft} /> : status === "partTitle" ? <PartTitle number={partIndex + 1} /> : status === "complete" ? <Review answers={answers} score={score} total={total} onBack={() => navigate(menuPath)} onRetry={start} /> : <ReadingTask part={currentPart} index={itemIndex} answers={answers} setAnswer={setAnswer} onSelectQuestion={setItemIndex} />}{examInProgress ? <ReadingFooter final={partIndex === 3 && itemIndex === currentItems.length - 1} showNext={status === "running"} skipLabel={status === "running" ? (currentPart === "part1" ? "Skip question" : "Skip part") : "Skip"} onSkip={skipCurrentStep} onNext={advance} /> : null}</main>;
}

function ReadingHeader({ title, progress, timeLeft }) {
  const [firstWord, ...rest] = title.split(" ");
  return <header className="ote-exam-header ote-reading-header"><img src="/images/seif-trainer-logo.png" alt="" className="ote-exam-mark" draggable="false" /><div className="ote-exam-title"><strong>{firstWord}</strong>{rest.length ? ` ${rest.join(" ")}` : ""}</div><div className="ote-progress-rail" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>{timeLeft == null ? <div className="ote-exam-meta"><strong>Seif OTE Trainer</strong><span>Mock</span></div> : <div className="ote-reading-timer">{formatTime(timeLeft)}</div>}</header>;
}

function Start({ onStart }) { return <section className="ote-start-screen ote-reading-start"><div className="ote-writing-intro"><h1>Oxford Test of English Advanced: Reading</h1><p>There are four parts in the Reading module.</p><div className="ote-writing-instruction-list"><div>Answer all the questions.</div><div>The clock shows how much time you have to answer the questions.</div><div>You cannot change your answer after you go to the next question.</div></div><button className="ote-primary-btn" type="button" onClick={onStart}>Start reading mock</button></div></section>; }
function Countdown({ secondsLeft }) { return <section className="ote-countdown-screen"><div><h1>Reading</h1><p>Your Reading module will begin in</p><div className="ote-large-count">{secondsLeft}</div></div></section>; }
function PartTitle({ number }) { return <section className="ote-part-card-screen"><div><strong>Reading</strong> Part {number}</div></section>; }

function ReadingTask({ part, index, answers, setAnswer, onSelectQuestion }) {
  if (part === "part1") return <Part1 index={index} answer={answers.part1[index]} setAnswer={setAnswer} />;
  if (part === "part2") return <AccordionPart task={part2} part="part2" index={index} answers={answers.part2} setAnswer={setAnswer} onSelectQuestion={onSelectQuestion} />;
  if (part === "part3") return <Part3 answers={answers.part3} setAnswer={setAnswer} />;
  return <AccordionPart task={part4} part="part4" index={index} answers={answers.part4} setAnswer={setAnswer} onSelectQuestion={onSelectQuestion} />;
}

function Part1({ index, answer, setAnswer }) {
  const question = part1[index];
  return <section className="ote-reading-workspace"><div className="ote-reading-split"><div className="ote-reading-question-pane"><p className="ote-reading-instructions">{getPart1Instruction(question.source)}</p><h2>{question.prompt}</h2><div className="ote-reading-options">{question.options.map((option, optionIndex) => <button type="button" className={answer === optionIndex ? "is-selected" : ""} onClick={() => setAnswer("part1", index, optionIndex)} key={option}>{option}</button>)}</div></div><SourceCard title={question.title} paragraphs={[question.text]} source={question.source} /></div></section>;
}

function getPart1Instruction(source = "text") {
  const lower = source.toLowerCase();
  if (lower.includes("novel")) return "Read the extract from a novel and choose the correct answer.";
  if (lower.includes("review")) return "Read the review and choose the correct answer.";
  if (lower.includes("email")) return "Read the email and choose the correct answer.";
  if (lower.includes("letter")) return "Read the extract from a letter and choose the correct answer.";
  if (lower.includes("research") || lower.includes("journal")) return "Read the extract from a professional journal and choose the correct answer.";
  if (lower.includes("article")) return "Read the article and choose the correct answer.";
  return "Read the extract and choose the correct answer.";
}

function AccordionPart({ task, part, index, answers, setAnswer, onSelectQuestion }) {
  const isPart2 = part === "part2";
  const instruction = isPart2 ? "Read the questions and match them to the correct text." : "Read the passage. For questions 1–5, choose the correct answer.";
  return <section className="ote-reading-workspace"><div className="ote-reading-split"><div className="ote-reading-question-pane"><p className="ote-reading-instructions">{instruction}</p><div className="ote-reading-accordion">{task.questions.map((question, questionIndex) => { const open = questionIndex === index; const locked = questionIndex < index; const answered = answers[questionIndex] != null; const optionIds = ["A", "B", "C"]; const options = isPart2 ? optionIds.map((id) => task.reviewers[id].name) : question.options; return <article className={`ote-reading-accordion-item ${open ? "is-open" : ""} ${answered ? "is-answered" : ""}`} key={question.prompt}><button className="ote-reading-accordion-title" type="button" disabled={locked} aria-expanded={open} onClick={() => onSelectQuestion(questionIndex)}><span>{question.prompt}</span><ChevronDown size={22} /></button>{open ? <div className="ote-reading-options">{options.map((option, optionIndex) => { const value = isPart2 ? optionIds[optionIndex] : optionIndex; return <button type="button" className={answers[questionIndex] === value ? "is-selected" : ""} onClick={() => setAnswer(part, questionIndex, value)} key={option}>{option}</button>; })}</div> : null}{locked && answered ? <span className="ote-reading-locked-answer">Answer saved</span> : null}</article>; })}</div></div>{isPart2 ? <ReviewerSource task={task} /> : <SourceCard title={task.heading} paragraphs={task.paragraphs} />}</div></section>;
}

function ReviewerSource({ task }) { return <article className="ote-reading-source-card"><header><h2>{task.heading}</h2></header>{Object.entries(task.reviewers).map(([id, reviewer]) => <section className="ote-reading-reviewer" key={id}><h3><span>{id}</span>{reviewer.name}</h3>{reviewer.text.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}</article>; }
function getSourceStyle(source = "") {
  const value = source.toLowerCase();
  if (value.includes("novel")) return "novel";
  if (value.includes("email")) return "email";
  if (value.includes("letter")) return "letter";
  if (value.includes("research") || value.includes("journal")) return "journal";
  if (value.includes("review") || value.includes("article")) return "web";
  return "document";
}

function SourceCard({ title, paragraphs, source = "" }) {
  if (!source) return <article className="ote-reading-source-card"><header><h2>{title}</h2></header>{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</article>;
  const sourceStyle = getSourceStyle(source);
  return <article className={`ote-reading-source-card ote-reading-source-${sourceStyle}`}><div className="ote-reading-source-sheet">{sourceStyle === "web" ? <div className="ote-reading-source-browser"><i /><i /><i /><span>{title.toLowerCase().replace(/\s+/g, "-")}.review</span></div> : null}{sourceStyle === "email" ? <div className="ote-reading-source-email-meta"><span>From</span><strong>Staff correspondence</strong><span>Subject</span><strong>{title}</strong></div> : null}<header><small>{source}</small><h2>{title}</h2></header>{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></article>;
}

function Part3({ answers, setAnswer }) {
  const [selectedSentence, setSelectedSentence] = useState("");
  const usedSentences = new Set(Object.entries(answers).filter(([key, value]) => key !== "selected" && value).map(([, value]) => value));

  function placeSentence(gap, sentenceId) {
    if (!sentenceId) {
      if (answers[gap]) setAnswer("part3", gap, "");
      return;
    }
    setAnswer("part3", gap, sentenceId);
    setSelectedSentence("");
  }

  return <section className="ote-reading-workspace"><div className="ote-reading-split"><aside className="ote-reading-question-pane"><p className="ote-reading-instructions">Six sentences are missing from this text. Select or drag a sentence into each gap. There is one extra sentence.</p><div className="ote-reading-sentence-bank">{Object.entries(part3.sentences).map(([id, text]) => { const selected = selectedSentence === id; const used = usedSentences.has(id); return <button type="button" draggable={!used} aria-pressed={selected} className={`${selected ? "is-selected" : ""} ${used ? "is-used" : ""}`} onClick={() => !used && setSelectedSentence(selected ? "" : id)} onDragStart={(event) => event.dataTransfer.setData("text/plain", id)} key={id}><strong>{id}</strong><span>{text}</span><i>{used ? "Placed" : selected ? "Selected" : "Select"}</i></button>; })}</div></aside><article className="ote-reading-source-card ote-reading-gapped-source"><header><h2>{part3.heading}</h2></header>{part3.text.split("\n\n").map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph.split(/(\[\d\])/).map((chunk, index) => { if (!/^\[\d\]$/.test(chunk)) return chunk; const gap = chunk[1]; const answer = answers[gap]; return <button type="button" className={`ote-reading-gap-target ${answer ? "is-filled" : ""} ${selectedSentence ? "is-ready" : ""}`} aria-label={answer ? `Gap ${gap}, sentence ${answer}. Click to remove or replace.` : `Gap ${gap}. Click to place selected sentence.`} onClick={() => placeSentence(gap, selectedSentence)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); placeSentence(gap, event.dataTransfer.getData("text/plain")); }} key={index}><span>{answer || gap}</span>{answer ? part3.sentences[answer] : `Gap ${gap}`}</button>; })}</p>)}</article></div></section>;
}

function ReadingFooter({ final, showNext, skipLabel, onSkip, onNext }) { return <footer className="ote-exam-footer"><button className="ote-settings-btn" type="button" aria-label="Settings"><Settings size={28} /></button><button className="ote-skip-btn" type="button" onClick={onSkip} aria-label={skipLabel}>Skip</button><span className="ote-reading-footer-brand">© Seif English OTE mock environment</span>{showNext ? <button className="ote-footer-next" type="button" onClick={onNext}>{final ? "Finish" : "Next"}</button> : null}</footer>; }
function Unavailable({ onBack }) { return <main className="ote-exam ote-reading-exam"><ReadingHeader title="Reading" progress={0} timeLeft={null} /><section className="ote-start-screen"><div className="ote-start-panel"><h1>Mock not available</h1><p>This mock is for the Advanced workspace.</p><button className="ote-primary-btn" onClick={onBack}><ArrowLeft size={18} /> Back to reading</button></div></section></main>; }

function Review({ answers, score, total, onBack, onRetry }) {
  const [reviewPart, setReviewPart] = useState(0);
  return <section className="ote-reading-results ote-reading-full-review"><div className="ote-reading-review-shell"><header className="ote-reading-review-summary"><CheckCircle2 size={42} /><div><p>Mock complete</p><h1>{score} / {total}</h1><span>Review every task, source text, answer and explanation below.</span></div></header><nav className="ote-reading-review-tabs" aria-label="Reading parts">{PARTS.map((part, index) => <button type="button" className={reviewPart === index ? "is-active" : ""} aria-current={reviewPart === index ? "page" : undefined} onClick={() => setReviewPart(index)} key={part}>Part {index + 1}</button>)}</nav>{reviewPart === 0 ? <Part1Review answers={answers.part1} /> : reviewPart === 1 ? <Part2Review answers={answers.part2} /> : reviewPart === 2 ? <Part3Review answers={answers.part3} /> : <Part4Review answers={answers.part4} />}<div className="ote-complete-actions"><button onClick={onBack}>Back to reading</button><button onClick={onRetry}><RotateCcw size={18} /> Try again</button></div></div></section>;
}

function FeedbackCard({ correct, prompt, yourAnswer, correctAnswer, feedback, number }) {
  return <article className={`ote-reading-review-feedback ${correct ? "is-correct" : "is-wrong"}`}><div className="ote-reading-review-feedback-heading"><strong>{number}. {prompt}</strong><span>{correct ? "Correct" : "Review"}</span></div><dl><div><dt>Your answer</dt><dd>{yourAnswer || "Not answered"}</dd></div><div><dt>Correct answer</dt><dd>{correctAnswer}</dd></div></dl><p>{feedback}</p></article>;
}

function Part1Review({ answers }) {
  return <section className="ote-reading-review-part"><div className="ote-reading-review-part-heading"><p>Reading Part 1</p><h2>Short texts</h2><span>Revisit every extract and compare your answer with the explanation.</span></div><div className="ote-reading-review-task-stack">{part1.map((question, index) => { const chosen = answers[index]; return <article className="ote-reading-review-task" key={question.prompt}><div className="ote-reading-review-text"><p className="ote-reading-review-source-label">{question.title}</p><p>{question.text}</p></div><FeedbackCard number={index + 1} prompt={question.prompt} correct={chosen === question.answer} yourAnswer={chosen == null ? "" : `${String.fromCharCode(65 + chosen)}. ${question.options[chosen]}`} correctAnswer={`${String.fromCharCode(65 + question.answer)}. ${question.options[question.answer]}`} feedback={question.feedback} /></article>; })}</div></section>;
}

function Part2Review({ answers }) {
  return <section className="ote-reading-review-part"><div className="ote-reading-review-part-heading"><p>Reading Part 2</p><h2>{part2.heading}</h2><span>Read all three source texts again, then review each match.</span></div><div className="ote-reading-review-split"><div className="ote-reading-review-feedback-list">{part2.questions.map((question, index) => { const chosen = answers[index]; return <FeedbackCard key={question.prompt} number={index + 1} prompt={question.prompt} correct={chosen === question.answer} yourAnswer={chosen ? `${chosen}. ${part2.reviewers[chosen]?.name}` : ""} correctAnswer={`${question.answer}. ${part2.reviewers[question.answer].name}`} feedback={question.feedback} />; })}</div><article className="ote-reading-review-full-text">{Object.entries(part2.reviewers).map(([id, reviewer]) => <section key={id}><h3><span>{id}</span>{reviewer.name}</h3>{reviewer.text.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}</article></div></section>;
}

function Part3Review({ answers }) {
  return <section className="ote-reading-review-part"><div className="ote-reading-review-part-heading"><p>Reading Part 3</p><h2>{part3.heading}</h2><span>The complete text is reconstructed with every correct missing sentence.</span></div><div className="ote-reading-review-split"><div className="ote-reading-review-feedback-list">{Object.entries(part3.answers).map(([gap, correctId]) => <FeedbackCard key={gap} number={gap} prompt={`Gap ${gap}`} correct={answers[gap] === correctId} yourAnswer={answers[gap] ? `${answers[gap]}. ${part3.sentences[answers[gap]]}` : ""} correctAnswer={`${correctId}. ${part3.sentences[correctId]}`} feedback={part3.feedback[gap]} />)}</div><article className="ote-reading-review-full-text ote-reading-review-reconstructed"><h3>{part3.heading}</h3>{part3.text.split("\n\n").map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph.split(/(\[\d\])/).map((chunk, index) => { if (!/^\[\d\]$/.test(chunk)) return chunk; const gap = chunk[1]; const correctId = part3.answers[gap]; return <mark key={index}><strong>{gap} — {correctId}</strong> {part3.sentences[correctId]}</mark>; })}</p>)}</article></div></section>;
}

function Part4Review({ answers }) {
  return <section className="ote-reading-review-part"><div className="ote-reading-review-part-heading"><p>Reading Part 4</p><h2>{part4.heading}</h2><span>Return to the complete passage while reviewing all five questions.</span></div><div className="ote-reading-review-split"><div className="ote-reading-review-feedback-list">{part4.questions.map((question, index) => { const chosen = answers[index]; return <FeedbackCard key={question.prompt} number={index + 1} prompt={question.prompt} correct={chosen === question.answer} yourAnswer={chosen == null ? "" : `${String.fromCharCode(65 + chosen)}. ${question.options[chosen]}`} correctAnswer={`${String.fromCharCode(65 + question.answer)}. ${question.options[question.answer]}`} feedback={question.feedback} />; })}</div><article className="ote-reading-review-full-text"><h3>{part4.heading}</h3>{part4.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</article></div></section>;
}
