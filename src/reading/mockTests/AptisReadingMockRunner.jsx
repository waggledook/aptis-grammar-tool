import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  FileClock,
  Flag,
  List,
  LockKeyhole,
  GripVertical,
  RotateCcw,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AptisMockPortalHeader from "../../components/common/AptisMockPortalHeader.jsx";
import Seo from "../../components/common/Seo.jsx";
import { auth, logActivity, saveAptisReadingMockAttempt } from "../../firebase.js";
import { APTIS_READING_MOCKS, getAptisReadingMock } from "./readingMockData.js";
import "./aptisReadingMock.css";

const TEST_SECONDS = 35 * 60;

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

const part1AnswerKey = (gapId) => `part1-${gapId}`;
const part2AnswerKey = (taskId, order) => `part2-${taskId}-${order}`;
const part3AnswerKey = (taskId, questionId) => `part3-${taskId}-${questionId}`;
const part4AnswerKey = (paragraphId) => `part4-${paragraphId}`;
const part2TaskAnswered = (task, answers) => task.sentences.filter((sentence) => answers[part2AnswerKey(task.id, sentence.order)]).length;
const part2TaskIsCorrect = (task, answers) => task.sentences.every((sentence) => answers[part2AnswerKey(task.id, sentence.order)] === sentence.id);

export default function AptisReadingMockRunner({ user, onHome, onProfile }) {
  const navigate = useNavigate();
  const [stage, setStage] = useState("menu");
  const [mockId, setMockId] = useState(APTIS_READING_MOCKS[0].id);
  const [screenIndex, setScreenIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [seen, setSeen] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(TEST_SECONDS);
  const [questionListOpen, setQuestionListOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState({});
  const [completionReason, setCompletionReason] = useState("completed");
  const [saveState, setSaveState] = useState("idle");
  const [saveError, setSaveError] = useState("");
  const startedAtRef = useRef(null);
  const activitySessionIdRef = useRef("");
  const saveStartedRef = useRef(false);

  const mock = useMemo(() => getAptisReadingMock(mockId), [mockId]);
  const screens = useMemo(() => [...mock.sections, mock.part4], [mock]);
  const currentScreen = screens[screenIndex];
  const isRunning = stage === "test" || stage === "review";
  const part1Answered = mock.part1.gaps.filter((gap) => answers[part1AnswerKey(gap.id)]).length;
  const part2Answered = mock.part2Tasks.reduce((total, task) => total + task.sentences.filter((sentence) => answers[part2AnswerKey(task.id, sentence.order)]).length, 0);
  const part3Answered = mock.part3.questions.filter((question) => answers[part3AnswerKey(mock.part3.id, question.id)]).length;
  const part4Answered = mock.part4.paragraphs.filter((paragraph) => answers[part4AnswerKey(paragraph.id)]).length;
  const part1Score = mock.part1.gaps.filter((gap) => answers[part1AnswerKey(gap.id)] === gap.answer).length;
  const part2Score = mock.part2Tasks.reduce((total, task) => total + (part2TaskIsCorrect(task, answers) ? 3 : 0), 0);
  const part3Score = mock.part3.questions.filter((question) => answers[part3AnswerKey(mock.part3.id, question.id)] === question.answer).length;
  const part4Score = mock.part4.paragraphs.filter((paragraph) => answers[part4AnswerKey(paragraph.id)] === paragraph.answer).length;
  const score = part1Score + part2Score + part3Score + part4Score;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [screenIndex, stage]);

  useEffect(() => {
    if (!isRunning) return undefined;
    const timer = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    if (secondsLeft !== 0 || !isRunning) return;
    setCompletionReason("time_expired");
    setQuestionListOpen(false);
    setStage("results");
  }, [isRunning, secondsLeft]);

  useEffect(() => {
    if (stage !== "results" || saveStartedRef.current) return;
    saveStartedRef.current = true;
    if (!auth.currentUser) {
      setSaveState("signed-out");
      return;
    }

    setSaveState("saving");
    setSaveError("");
    saveAptisReadingMockAttempt({
      mockId: mock.id,
      mockTitle: mock.title,
      mockVersion: mock.version,
      rawScore: score,
      scaledScore: score * 2,
      percentage: Math.round((score / 25) * 100),
      part1Score,
      part2Score,
      part3Score,
      part4Score,
      answered: part1Answered + part2Answered + part3Answered + part4Answered,
      elapsedSeconds: TEST_SECONDS - secondsLeft,
      durationSeconds: TEST_SECONDS,
      startedAtClient: startedAtRef.current,
      activitySessionId: activitySessionIdRef.current,
      completionReason,
      answers,
    })
      .then(() => setSaveState("saved"))
      .catch((error) => {
        console.error("[Aptis reading mock] Could not save attempt", error);
        setSaveError(error?.message || "Your result could not be saved.");
        setSaveState("error");
      });
  }, [answers, completionReason, mock, part1Answered, part1Score, part2Answered, part2Score, part3Answered, part3Score, part4Answered, part4Score, score, secondsLeft, stage]);

  function resetAttempt(nextStage = "instructions") {
    setStage(nextStage);
    setScreenIndex(0);
    setAnswers({});
    setSeen({});
    setBookmarks({});
    setSecondsLeft(TEST_SECONDS);
    setQuestionListOpen(false);
    setContextOpen({});
    setCompletionReason("completed");
    setSaveState("idle");
    setSaveError("");
    startedAtRef.current = null;
    activitySessionIdRef.current = "";
    saveStartedRef.current = false;
  }

  function chooseMock(nextMockId) {
    setMockId(nextMockId);
    resetAttempt("landing");
  }

  function startTest() {
    if (!startedAtRef.current) {
      const startedAtClient = new Date().toISOString();
      const activitySessionId = globalThis.crypto?.randomUUID?.()
        || `aptis-reading-${mock.id}-${Date.now()}`;
      startedAtRef.current = startedAtClient;
      activitySessionIdRef.current = activitySessionId;
      void logActivity("aptis_reading_mock_started", {
        product: "aptis-general",
        module: "reading",
        mockId: mock.id,
        mockTitle: mock.title,
        mockVersion: mock.version,
        rawTotal: 25,
        scaledTotal: 50,
        responseTotal: 29,
        questionScreens: screens.length,
        durationSeconds: TEST_SECONDS,
        startedAtClient,
        activitySessionId,
      });
    }
    setStage("test");
    setScreenIndex(0);
    setSeen({ 0: true });
  }

  function goToScreen(index) {
    const nextIndex = Math.max(0, Math.min(screens.length - 1, index));
    setScreenIndex(nextIndex);
    setSeen((current) => ({ ...current, [nextIndex]: true }));
    setQuestionListOpen(false);
  }

  function returnToMenu() {
    if (isRunning && !window.confirm("Leave this mock? Your current answers will be lost.")) return;
    resetAttempt("menu");
  }

  function leaveAttempt(destination) {
    if (isRunning && !window.confirm("Leave this mock? Your current answers will be lost.")) return;
    destination?.();
  }

  function setHeading(paragraphId, headingKey) {
    setAnswers((current) => ({ ...current, [part4AnswerKey(paragraphId)]: headingKey }));
  }

  function setPart1Answer(gapId, value) {
    setAnswers((current) => ({ ...current, [part1AnswerKey(gapId)]: value }));
  }

  function setPart2Positions(taskId, positions) {
    setAnswers((current) => {
      const next = { ...current };
      [1, 2, 3, 4, 5].forEach((order) => {
        const key = part2AnswerKey(taskId, order);
        if (positions[order]) next[key] = positions[order];
        else delete next[key];
      });
      return next;
    });
  }

  function setPart3Answer(taskId, questionId, value) {
    setAnswers((current) => ({ ...current, [part3AnswerKey(taskId, questionId)]: value }));
  }

  if (stage === "menu") {
    return (
      <MockShell user={user} onHome={() => leaveAttempt(onHome)} onProfile={() => leaveAttempt(onProfile)}>
        <Seo title="Aptis General Reading Mock Exams | Seif Aptis Trainer" description="Complete timed Aptis General Reading mock exams and review every answer in context." />
        <main className="reading-mock-menu">
          <button className="reading-mock-back-link" type="button" onClick={() => navigate("/reading")}><ArrowLeft size={18} /> Reading practice</button>
          <p className="reading-mock-eyebrow">Aptis General · Reading</p>
          <h1>Choose a reading mock</h1>
          <p className="reading-mock-lead">Practise the complete five-screen exam flow, then review every available answer with its evidence and explanation.</p>
          <div className="reading-mock-menu-grid">
            {APTIS_READING_MOCKS.map((item) => (
              <button key={item.id} type="button" onClick={() => chooseMock(item.id)}>
                <span>Practice test</span>
                <strong>Mock {Number(item.version)}</strong>
                <small>Version {item.version} · 35 minutes</small>
                <p>Complete Parts 1–4 · 25 raw points, scaled to 50</p>
                <ArrowRight size={24} />
              </button>
            ))}
          </div>
        </main>
      </MockShell>
    );
  }

  if (stage === "landing") {
    return (
      <MockShell user={user} onHome={() => leaveAttempt(onHome)} onProfile={() => leaveAttempt(onProfile)}>
        <main className="reading-mock-landing">
          <section>
            <p>Aptis General Practice Test</p>
            <h1>Reading Practice Test Version {mock.version}</h1>
            <dl>
              <div><dt>Question screens</dt><dd>5</dd></div>
              <div><dt>Time allowed</dt><dd>35 min</dd></div>
            </dl>
            <div className="reading-mock-actions">
              <button className="secondary" type="button" onClick={returnToMenu}><ArrowLeft size={20} /> All mocks</button>
              <button className="primary" type="button" onClick={() => resetAttempt("instructions")}>Start assessment</button>
            </div>
          </section>
        </main>
      </MockShell>
    );
  }

  if (stage === "results") {
    return (
      <MockShell user={user} onHome={() => leaveAttempt(onHome)} onProfile={() => leaveAttempt(onProfile)}>
        <Results mock={mock} answers={answers} score={score} part1Score={part1Score} part2Score={part2Score} part3Score={part3Score} part4Score={part4Score} timedOut={secondsLeft === 0} saveState={saveState} saveError={saveError} contextOpen={contextOpen} setContextOpen={setContextOpen} onMenu={returnToMenu} onRetry={() => resetAttempt("instructions")} />
      </MockShell>
    );
  }

  return (
    <MockShell user={user} onHome={() => leaveAttempt(onHome)} onProfile={() => leaveAttempt(onProfile)}>
      {stage === "instructions" ? (
        <main className="reading-mock-instructions">
          <section>
            <p className="reading-mock-eyebrow">Aptis General</p>
            <h1>Reading instructions</h1>
            <h2>Reading</h2>
            <p>The test has five question screens covering four parts.</p>
            <p>You have 35 minutes to complete the test.</p>
            <p>Use the question list to move between screens or bookmark one to revisit.</p>
            <p className="final-line">When you click “Begin test”, the timer will start.</p>
          </section>
        </main>
      ) : (
        <main className="reading-mock-paper">
          <Timer secondsLeft={secondsLeft} />
          <header className="reading-mock-question-header">
            <div><p>Reading · Part {currentScreen.part}</p><h1>Question {screenIndex + 1} of {screens.length}</h1></div>
            <button className={bookmarks[screenIndex] ? "is-active" : ""} type="button" onClick={() => setBookmarks((current) => ({ ...current, [screenIndex]: !current[screenIndex] }))}>
              <Bookmark size={22} fill={bookmarks[screenIndex] ? "currentColor" : "none"} /> {bookmarks[screenIndex] ? "Bookmarked" : "Bookmark"}
            </button>
          </header>
          {currentScreen.kind === "part1" ? (
            <Part1Question task={currentScreen} answers={answers} onChange={setPart1Answer} />
          ) : currentScreen.kind === "part2" ? (
            <Part2Question task={currentScreen} answers={answers} onChange={setPart2Positions} />
          ) : currentScreen.kind === "part3" ? (
            <Part3Question task={currentScreen} answers={answers} onChange={setPart3Answer} />
          ) : currentScreen.part === 4 ? (
            <Part4Question task={mock.part4} answers={answers} onChange={setHeading} />
          ) : (
            <PlaceholderQuestion screen={currentScreen} />
          )}
        </main>
      )}

      <footer className="reading-mock-footer">
        <button className="icon" type="button" onClick={() => setQuestionListOpen(true)} aria-label="Open question list"><List size={25} /></button>
        <div>
          {stage === "test" ? <button className="secondary" type="button" disabled={screenIndex === 0} onClick={() => goToScreen(screenIndex - 1)}><ArrowLeft size={20} /> Previous</button> : null}
          <button className="primary" type="button" onClick={() => {
            if (stage === "instructions") startTest();
            else if (screenIndex === screens.length - 1) setStage("review");
            else goToScreen(screenIndex + 1);
          }}>
            {stage === "instructions" ? "Begin test" : screenIndex === screens.length - 1 ? "Review & submit" : "Next"}
            {stage === "test" && screenIndex === screens.length - 1 ? <Check size={20} /> : <ArrowRight size={20} />}
          </button>
        </div>
      </footer>

      {questionListOpen ? <QuestionList screens={screens} currentIndex={screenIndex} seen={seen} bookmarks={bookmarks} answers={answers} part1Answered={part1Answered} part3Answered={part3Answered} part4Answered={part4Answered} onClose={() => setQuestionListOpen(false)} onSelect={(index) => { if (stage === "instructions") startTest(); goToScreen(index); }} /> : null}
      {stage === "review" ? <SubmitReview screens={screens} answers={answers} part1Answered={part1Answered} part2Answered={part2Answered} part3Answered={part3Answered} part4Answered={part4Answered} onBack={() => setStage("test")} onSelect={(index) => { setStage("test"); goToScreen(index); }} onSubmit={() => { setCompletionReason("completed"); setStage("results"); }} /> : null}
    </MockShell>
  );
}

function MockShell({ children, user, onHome, onProfile }) {
  return (
    <div className="aptis-reading-mock notranslate" translate="no">
      <AptisMockPortalHeader user={user} onHome={onHome} onProfile={onProfile} />
      {children}
    </div>
  );
}

function Timer({ secondsLeft }) {
  return <aside className="reading-mock-timer"><strong>{formatTime(secondsLeft)}</strong><span>Time remaining</span><i><b style={{ width: `${(secondsLeft / TEST_SECONDS) * 100}%` }} /></i></aside>;
}

function Part1Question({ task, answers, onChange }) {
  return (
    <section className="reading-mock-part1">
      <p className="instruction">{task.prompt}</p>
      <article>
        {task.lines.map((line, lineIndex) => (
          <p key={lineIndex}>
            {line.map((part, partIndex) => {
              if (part.fixed) return <select className="part1-fixed-answer" key={partIndex} value={part.fixed} disabled aria-label="Completed example answer"><option value={part.fixed}>{part.fixed}</option></select>;
              if (!part.gap) return <React.Fragment key={partIndex}>{part.text}</React.Fragment>;
              const gap = task.gaps.find((item) => item.id === part.gap);
              return (
                <span className="part1-gap" key={partIndex}>
                  <select aria-label={`Answer for gap ${gap.id}`} value={answers[part1AnswerKey(gap.id)] || ""} onChange={(event) => onChange(gap.id, event.target.value)}>
                    <option value="">({gap.id}) Choose</option>
                    {gap.options.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </span>
              );
            })}
          </p>
        ))}
      </article>
    </section>
  );
}

function Part2Question({ task, answers, onChange }) {
  const positions = Object.fromEntries([1, 2, 3, 4, 5].map((order) => [order, answers[part2AnswerKey(task.id, order)]]).filter(([, value]) => value));
  const sentenceById = new Map(task.sentences.map((sentence) => [sentence.id, sentence]));
  const usedIds = new Set(Object.values(positions));
  const pool = task.candidateOrder.map((id) => sentenceById.get(id)).filter((sentence) => sentence && !usedIds.has(sentence.id));
  const firstEmpty = [1, 2, 3, 4, 5].find((order) => !positions[order]);

  function commit(next) {
    onChange(task.id, next);
  }

  function place(order, sentenceId) {
    if (!sentenceById.has(sentenceId)) return;
    const next = { ...positions };
    const previousOrder = [1, 2, 3, 4, 5].find((position) => next[position] === sentenceId);
    const displaced = next[order];
    next[order] = sentenceId;
    if (previousOrder && previousOrder !== order) {
      if (displaced) next[previousOrder] = displaced;
      else delete next[previousOrder];
    }
    commit(next);
  }

  function move(fromOrder, toOrder) {
    if (toOrder < 1 || toOrder > 5 || !positions[fromOrder]) return;
    const next = { ...positions, [toOrder]: positions[fromOrder] };
    if (positions[toOrder]) next[fromOrder] = positions[toOrder];
    else delete next[fromOrder];
    commit(next);
  }

  function returnToPool(order) {
    const next = { ...positions };
    delete next[order];
    commit(next);
  }

  function dragStart(event, payload) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", JSON.stringify(payload));
  }

  function dropOnSlot(event, order) {
    event.preventDefault();
    try {
      const payload = JSON.parse(event.dataTransfer.getData("text/plain"));
      if (payload.type === "pool") place(order, payload.sentenceId);
      if (payload.type === "slot") move(payload.order, order);
    } catch {
      // Ignore unrelated drag data.
    }
  }

  function dropOnBank(event) {
    event.preventDefault();
    try {
      const payload = JSON.parse(event.dataTransfer.getData("text/plain"));
      if (payload.type === "slot") returnToPool(payload.order);
    } catch {
      // Ignore unrelated drag data.
    }
  }

  return (
    <section className="reading-mock-part2">
      <p className="instruction">{task.instruction}</p>
      <header><div><p>{task.genre} · {task.difficulty}</p><h2>{task.title}</h2></div><span>{Object.keys(positions).length}/5 placed</span></header>
      <div className="part2-workspace">
        <div className="part2-order" aria-label="Sentence order">
          <div className="part2-order-row is-fixed"><span>1</span><div><small>Fixed opening</small><p>{task.fixed}</p></div></div>
          {[1, 2, 3, 4, 5].map((order) => {
            const sentence = sentenceById.get(positions[order]);
            return (
              <div className={`part2-order-row ${sentence ? "is-filled" : ""}`} key={order} onDragOver={(event) => event.preventDefault()} onDrop={(event) => dropOnSlot(event, order)}>
                <span>{order + 1}</span>
                {sentence ? <div className="part2-slot" role="button" tabIndex="0" draggable title="Drag to reorder or tap to return this sentence" aria-label={`Position ${order + 1}: ${sentence.text}. Tap to return to the sentence bank.`} onDragStart={(event) => dragStart(event, { type: "slot", order })} onClick={() => returnToPool(order)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); returnToPool(order); } }}><p>{sentence.text}</p></div> : <div className="part2-empty"><span>Drop a sentence here</span></div>}
              </div>
            );
          })}
        </div>
        <aside className="part2-bank" onDragOver={(event) => event.preventDefault()} onDrop={dropOnBank}>
          <header><span>Sentence bank</span><strong>Drag or place into the next space</strong></header>
          {pool.map((sentence) => <article draggable key={sentence.id} onDragStart={(event) => dragStart(event, { type: "pool", sentenceId: sentence.id })}><GripVertical size={18} /><p>{sentence.text}</p><button type="button" disabled={!firstEmpty} onClick={() => place(firstEmpty, sentence.id)}>Place next</button></article>)}
          {!pool.length ? <p className="part2-bank-empty">All sentences placed. Return one here to change it.</p> : null}
        </aside>
      </div>
    </section>
  );
}

function Part3Question({ task, answers, onChange }) {
  const names = task.comments.map((comment) => comment.name);
  return (
    <section className="reading-mock-part3">
      <p className="instruction">{task.instruction}</p>
      <h2>{task.title}</h2>
      <div className="part3-workspace">
        <div className="part3-comments">
          {task.comments.map((comment) => (
            <article key={comment.name}>
              <h3>{comment.name}</h3>
              <p>{comment.text}</p>
            </article>
          ))}
        </div>
        <ol className="part3-questions">
          {task.questions.map((question) => (
            <li key={question.id}>
              <label htmlFor={`${task.id}-${question.id}`}><span>{question.id}. {question.text}</span></label>
              <select id={`${task.id}-${question.id}`} value={answers[part3AnswerKey(task.id, question.id)] || ""} onChange={(event) => onChange(task.id, question.id, event.target.value)}>
                <option value="">Choose a person</option>
                {names.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PlaceholderQuestion({ screen }) {
  return (
    <section className="reading-mock-placeholder">
      <LockKeyhole size={35} />
      <p>Content placeholder</p>
      <h2>{screen.title}</h2>
      <strong>{screen.format}</strong>
      <p>{screen.description}</p>
      <small>This question screen is ready for its task content. It is skipped in the provisional score.</small>
    </section>
  );
}

function Part4Question({ task, answers, onChange }) {
  const usedHeadings = new Set(task.paragraphs.map((paragraph) => answers[part4AnswerKey(paragraph.id)]).filter(Boolean));
  return (
    <section className="reading-mock-part4">
      <p className="instruction">{task.instruction}</p>
      <h2>{task.title}</h2>
      <ol>
        {task.paragraphs.map((paragraph) => (
          <li key={paragraph.id}>
            <label><span>{paragraph.id}.</span><select value={answers[part4AnswerKey(paragraph.id)] || ""} onChange={(event) => onChange(paragraph.id, event.target.value)} aria-label={`Heading for paragraph ${paragraph.id}`}>
              <option value="">Choose a heading</option>
              {task.headings.map((heading) => <option key={heading.key} value={heading.key} disabled={usedHeadings.has(heading.key) && answers[part4AnswerKey(paragraph.id)] !== heading.key}>{heading.text}</option>)}
            </select></label>
            <p>{paragraph.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function QuestionList({ screens, currentIndex, seen, bookmarks, answers, part1Answered, part3Answered, part4Answered, onClose, onSelect }) {
  return (
    <div className="reading-mock-overlay" onClick={onClose}>
      <aside className="reading-mock-drawer" onClick={(event) => event.stopPropagation()}>
        <header><div><p>Reading</p><h2>Question review</h2></div><button type="button" onClick={onClose}><X size={24} /></button></header>
        <p>Select a question screen to revisit it.</p>
        <div>{screens.map((screen, index) => {
          const status = screen.kind === "part1"
            ? part1Answered ? `${part1Answered}/5 answered` : "Not attempted"
            : screen.kind === "part2"
              ? part2TaskAnswered(screen, answers) ? `${part2TaskAnswered(screen, answers)}/5 placed` : "Not attempted"
            : screen.kind === "part3"
              ? part3Answered ? `${part3Answered}/7 answered` : "Not attempted"
            : screen.part === 4
              ? part4Answered ? `${part4Answered}/7 answered` : "Not attempted"
              : "Placeholder";
          const rowClass = [index === currentIndex ? "is-current" : "", bookmarks[index] ? "is-bookmarked" : ""].filter(Boolean).join(" ");
          return <button key={screen.id} className={rowClass} type="button" onClick={() => onSelect(index)}><strong>{String(index + 1).padStart(2, "0")}</strong><span>Part {screen.part} · {screen.title}</span>{bookmarks[index] ? <Bookmark size={17} fill="currentColor" aria-label="Bookmarked" /> : null}<small>{seen[index] ? "Seen" : "Unseen"} · {status}</small></button>;
        })}</div>
      </aside>
    </div>
  );
}

function SubmitReview({ screens, answers, part1Answered, part2Answered, part3Answered, part4Answered, onBack, onSelect, onSubmit }) {
  const unanswered = (5 - part1Answered) + (10 - part2Answered) + (7 - part3Answered) + (7 - part4Answered);
  return (
    <div className="reading-mock-overlay reading-mock-submit-overlay">
      <section className="reading-mock-submit-dialog" role="dialog" aria-modal="true" aria-labelledby="submit-title">
        <Flag size={30} />
        <h2 id="submit-title">Review before submitting</h2>
        <p>All four reading parts are included. Part 2 awards three points only when all five sentences in a task are correctly ordered; each other item awards one point.</p>
        <div>{screens.map((screen, index) => {
          const status = screen.kind === "part1" ? `${part1Answered}/5 answered` : screen.kind === "part2" ? `${part2TaskAnswered(screen, answers)}/5 placed` : screen.kind === "part3" ? `${part3Answered}/7 answered` : screen.part === 4 ? `${part4Answered}/7 answered` : "Not attempted";
          return <button type="button" key={screen.id} onClick={() => onSelect(index)}><span>Question {index + 1} · Part {screen.part}</span><strong>{status}</strong></button>;
        })}</div>
        {unanswered ? <aside><strong>{unanswered} {unanswered === 1 ? "response is" : "responses are"} still blank.</strong> Blank responses will be marked incorrect.</aside> : null}
        <footer><button className="secondary" type="button" onClick={onBack}>Keep working</button><button className="primary" type="button" onClick={onSubmit}>Submit &amp; see correction <CheckCircle2 size={20} /></button></footer>
      </section>
    </div>
  );
}

function Results({ mock, answers, score, part1Score, part2Score, part3Score, part4Score, timedOut, saveState, saveError, contextOpen, setContextOpen, onMenu, onRetry }) {
  const scaledScore = score * 2;
  const percentage = Math.round((score / 25) * 100);
  return (
    <main className="reading-mock-results">
      <header><CheckCircle2 size={48} /><div><p>{mock.title}</p><h1>Your reading correction</h1><span>{timedOut ? "Time expired, so the available work was submitted automatically." : "Submission complete."}</span></div></header>
      <section className="reading-mock-score"><div><span>Scaled score</span><strong>{scaledScore}/50</strong><small>{percentage}%</small></div><p>Raw score: {score}/25 · Part 1: {part1Score}/5 · Part 2: {part2Score}/6 · Part 3: {part3Score}/7 · Part 4: {part4Score}/7. Open any item below to see the relevant text in context with an explanation.</p></section>
      <p className={`reading-mock-save-status is-${saveState}`} role="status">{saveState === "saving" ? "Saving this result to your profile…" : saveState === "saved" ? "This result has been saved to your profile." : saveState === "signed-out" ? "Sign in before starting a future mock to save its result to your profile." : saveState === "error" ? saveError : ""}</p>
      <section className="reading-mock-answer-review">
        <div className="section-heading"><p>Part 1 · {part1Score}/5</p><h2>{mock.part1.title}</h2></div>
        {mock.part1.gaps.map((gap) => {
          const selected = answers[part1AnswerKey(gap.id)] || "";
          const correct = selected === gap.answer;
          const contextKey = `part1-${gap.id}`;
          const open = Boolean(contextOpen[contextKey]);
          return (
            <article className={correct ? "is-correct" : "is-wrong"} key={gap.id}>
              <header><span>Gap {gap.id}</span><b>{correct ? "Correct" : "Review"}</b></header>
              <div className="answer-lines"><p><strong>Your answer</strong>{selected || "Not answered"}</p><p><strong>Correct answer</strong>{gap.answer}</p></div>
              <button type="button" aria-expanded={open} onClick={() => setContextOpen((current) => ({ ...current, [contextKey]: !current[contextKey] }))}><FileClock size={18} /> {open ? "Hide question context" : "Show question in context"}</button>
              {open ? <div className="reading-mock-context"><Part1ReviewContext task={mock.part1} targetGap={gap.id} /><p><strong>Why this answer fits</strong>{gap.explanation}</p></div> : null}
            </article>
          );
        })}

        <div className="section-heading is-part2"><p>Part 2 · {part2Score}/6</p><h2>Sentence order</h2></div>
        {mock.part2Tasks.map((task, taskIndex) => {
          const taskScore = part2TaskIsCorrect(task, answers) ? 3 : 0;
          return (
            <section className="part2-review-task" key={task.id}>
              <header><div><span>Question {taskIndex + 2}</span><h3>{task.title}</h3></div><strong>{taskScore}/3</strong></header>
              {task.sentences.map((sentence) => {
                const selectedId = answers[part2AnswerKey(task.id, sentence.order)] || "";
                const selected = task.sentences.find((item) => item.id === selectedId);
                const correct = selectedId === sentence.id;
                const contextKey = `part2-${task.id}-${sentence.order}`;
                const open = Boolean(contextOpen[contextKey]);
                return (
                  <article className={correct ? "is-correct" : "is-wrong"} key={sentence.id}>
                    <header><span>Position {sentence.order + 1}</span><b>{correct ? "Correct" : "Review"}</b></header>
                    <div className="answer-lines"><p><strong>Your sentence</strong>{selected?.text || "Not placed"}</p><p><strong>Correct sentence</strong>{sentence.text}</p></div>
                    <button type="button" aria-expanded={open} onClick={() => setContextOpen((current) => ({ ...current, [contextKey]: !current[contextKey] }))}><FileClock size={18} /> {open ? "Hide text in context" : "Show text in context"}</button>
                    {open ? <div className="reading-mock-context"><Part2ReviewContext task={task} targetOrder={sentence.order} /><p><strong>Why this follows</strong>{sentence.explanation}</p></div> : null}
                  </article>
                );
              })}
            </section>
          );
        })}

        <div className="section-heading is-part3"><p>Part 3 · {part3Score}/7</p><h2>{mock.part3.title}</h2></div>
        {mock.part3.questions.map((question) => {
          const selected = answers[part3AnswerKey(mock.part3.id, question.id)] || "";
          const correct = selected === question.answer;
          const contextKey = `part3-${mock.part3.id}-${question.id}`;
          const open = Boolean(contextOpen[contextKey]);
          const correctComment = mock.part3.comments.find((comment) => comment.name === question.answer);
          return (
            <article className={correct ? "is-correct" : "is-wrong"} key={question.id}>
              <header><span>Question {question.id} · {question.text}</span><b>{correct ? "Correct" : "Review"}</b></header>
              <div className="answer-lines"><p><strong>Your answer</strong>{selected || "Not answered"}</p><p><strong>Correct answer</strong>{question.answer}</p></div>
              <button type="button" aria-expanded={open} onClick={() => setContextOpen((current) => ({ ...current, [contextKey]: !current[contextKey] }))}><FileClock size={18} /> {open ? "Hide question context" : "Show question in context"}</button>
              {open ? <div className="reading-mock-context part3-review-context"><blockquote><strong>{question.answer}</strong>{correctComment?.text}</blockquote><p><strong>Key evidence</strong><mark>{question.evidence}</mark></p><p><strong>Why this person fits</strong>{question.explanation}</p></div> : null}
            </article>
          );
        })}

        <div className="section-heading is-part4"><p>Part 4 · {part4Score}/7</p><h2>{mock.part4.title}</h2></div>
        {mock.part4.paragraphs.map((paragraph) => {
          const selectedKey = answers[part4AnswerKey(paragraph.id)] || "";
          const selected = mock.part4.headings.find((heading) => heading.key === selectedKey);
          const correctHeading = mock.part4.headings.find((heading) => heading.key === paragraph.answer);
          const correct = selectedKey === paragraph.answer;
          const contextKey = `part4-${paragraph.id}`;
          const open = Boolean(contextOpen[contextKey]);
          return (
            <article className={correct ? "is-correct" : "is-wrong"} key={paragraph.id}>
              <header><span>Paragraph {paragraph.id}</span><b>{correct ? "Correct" : "Review"}</b></header>
              <div className="answer-lines"><p><strong>Your answer</strong>{selected ? `${selected.key}. ${selected.text}` : "Not answered"}</p><p><strong>Correct answer</strong>{correctHeading.key}. {correctHeading.text}</p></div>
              <button type="button" aria-expanded={open} onClick={() => setContextOpen((current) => ({ ...current, [contextKey]: !current[contextKey] }))}><FileClock size={18} /> {open ? "Hide question context" : "Show question in context"}</button>
              {open ? <div className="reading-mock-context"><p className="summary"><strong>Main idea</strong>{paragraph.summary}</p><blockquote>{paragraph.text}</blockquote><p><strong>Key evidence</strong><mark>{paragraph.evidence}</mark></p><p><strong>Why this heading fits</strong>{paragraph.explanation}</p></div> : null}
            </article>
          );
        })}
        <article className="reading-mock-unused"><header><span>Unused heading</span><b>{mock.part4.unusedHeading}</b></header><p><strong>{mock.part4.unusedHeading}. {mock.part4.headings.find((heading) => heading.key === mock.part4.unusedHeading)?.text}</strong></p><p>{mock.part4.unusedExplanation}</p></article>
      </section>
      <div className="reading-mock-result-actions"><button className="secondary" type="button" onClick={onMenu}>All mock tests</button><button className="primary" type="button" onClick={onRetry}><RotateCcw size={20} /> Try again</button></div>
    </main>
  );
}

function Part1ReviewContext({ task, targetGap }) {
  return (
    <div className="part1-context-message">
      {task.lines.map((line, lineIndex) => (
        <p key={lineIndex}>
          {line.map((part, partIndex) => {
            if (part.fixed) return <strong key={partIndex}>{part.fixed}</strong>;
            if (!part.gap) return <React.Fragment key={partIndex}>{part.text}</React.Fragment>;
            const gap = task.gaps.find((item) => item.id === part.gap);
            return part.gap === targetGap
              ? <mark key={partIndex}>{gap.answer}</mark>
              : <strong key={partIndex}>{gap.answer}</strong>;
          })}
        </p>
      ))}
    </div>
  );
}

function Part2ReviewContext({ task, targetOrder }) {
  return (
    <ol className="part2-context-text">
      <li><span>1</span><p>{task.fixed}</p></li>
      {task.sentences.map((sentence) => (
        <li className={sentence.order === targetOrder ? "is-target" : ""} key={sentence.id}><span>{sentence.order + 1}</span><p>{sentence.text}</p></li>
      ))}
    </ol>
  );
}
