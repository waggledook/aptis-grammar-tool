import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logActivity } from "../../../firebase";
import { relationshipsPreparationConfig } from "./relationshipsPreparationData";

const BASE_CHAPTERS = [
  { id: "set-a", label: "Learn A", title: "First vocabulary set", description: "Meet eight useful expressions, then retrieve every one." },
  { id: "set-b", label: "Learn B", title: "Second vocabulary set", description: "Add eight complementary expressions and practise them." },
  { id: "review", label: "Use it", title: "Review and ideas", description: "Mix both sets, then choose ideas you could talk about." },
  { id: "speak", label: "Speak", title: "45-second rehearsal", description: "Use the language once before the live workshop." },
];

const WRITE_CHAPTER = {
  id: "write",
  label: "Write",
  title: "Key-word writing check",
  description: "Complete eight short sentences with key language from both vocabulary sets.",
};

function normalizeWrittenAnswer(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[-–—]/g, " ")
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ")
    .replace(/[’']/g, "'");
}

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function readSavedProgress(key) {
  try {
    const saved = JSON.parse(window.localStorage.getItem(key) || "{}");
    return Array.isArray(saved.completedChapters) ? saved.completedChapters : [];
  } catch {
    return [];
  }
}

function VocabularyCards({ set, onFinish }) {
  const [cardIndex, setCardIndex] = useState(0);
  const item = set.items[cardIndex];

  return (
    <section className="prep-activity-card">
      <div className="prep-activity-heading">
        <div>
          <span className="workshop-kicker">{set.label} · Learn</span>
          <h2>{set.title}</h2>
          <p className="prep-lead">{set.introduction}</p>
        </div>
        <strong>{cardIndex + 1} / {set.items.length}</strong>
      </div>
      <article className={`prep-vocab-card ${item.image ? "has-image" : ""}`}>
        {item.image ? <img src={item.image} alt="" /> : <span className="prep-word-mark" aria-hidden="true">{item.term.charAt(0)}</span>}
        <div>
          <span className="prep-vocab-label">Useful language</span>
          <h3>{item.term}</h3>
          <p>{item.meaning}</p>
          <blockquote>{item.example}</blockquote>
          {item.gap ? <small>{item.gap}</small> : null}
        </div>
      </article>
      <footer className="prep-card-actions">
        <button type="button" disabled={cardIndex === 0} onClick={() => setCardIndex((index) => Math.max(0, index - 1))}>← Back</button>
        <div className="prep-card-dots" aria-label={`Vocabulary item ${cardIndex + 1} of ${set.items.length}`}>
          {set.items.map((card, index) => <span key={card.id} className={index === cardIndex ? "is-active" : ""} />)}
        </div>
        <button className="workshop-primary" type="button" onClick={() => cardIndex === set.items.length - 1 ? onFinish() : setCardIndex((index) => index + 1)}>
          {cardIndex === set.items.length - 1 ? "Practise these →" : "Next →"}
        </button>
      </footer>
    </section>
  );
}

function QuestionCycle({ kicker, title, questions, answers, setAnswers, onFinish, finishLabel = "Continue →" }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const question = questions[questionIndex];
  const selected = answers[question.id];
  const isLast = questionIndex === questions.length - 1;
  const correctCount = questions.filter((item) => answers[item.id] === item.answer).length;
  const finished = Object.keys(answers).length === questions.length;

  if (finished && isLast) {
    return (
      <section className="prep-activity-card prep-complete-card">
        <span className="prep-card-icon" aria-hidden="true">✓</span>
        <h2>{correctCount} / {questions.length} correct</h2>
        <p>You retrieved every target item in this activity. You can repeat it now or continue.</p>
        <div className="prep-complete-actions">
          <button className="workshop-secondary" type="button" onClick={() => { setAnswers({}); setQuestionIndex(0); }}>Try again</button>
          <button className="workshop-primary" type="button" onClick={onFinish}>{finishLabel}</button>
        </div>
      </section>
    );
  }

  function choose(option) {
    if (selected) return;
    setAnswers((current) => ({ ...current, [question.id]: option }));
  }

  return (
    <section className="prep-activity-card">
      <div className="prep-activity-heading">
        <div><span className="workshop-kicker">{kicker}</span><h2>{title}</h2></div>
        <strong>{questionIndex + 1} / {questions.length}</strong>
      </div>
      {question.context ? <p className="prep-question-context">{question.context}</p> : null}
      <p className="prep-context-sentence">{question.prompt}</p>
      <div className="prep-choice-grid">
        {question.options.map((option) => {
          const isCorrect = selected && option === question.answer;
          const isWrong = selected === option && option !== question.answer;
          return <button key={option} type="button" className={isCorrect ? "is-correct" : isWrong ? "is-wrong" : ""} onClick={() => choose(option)}>{option}</button>;
        })}
      </div>
      {selected ? (
        <div className={`prep-feedback ${selected === question.answer ? "is-correct" : "is-wrong"}`}>
          <strong>{selected === question.answer ? "That’s it." : `Best answer: “${question.answer}”.`}</strong>
          <span>{question.feedback}</span>
        </div>
      ) : null}
      <footer className="prep-question-actions">
        <button type="button" disabled={questionIndex === 0} onClick={() => setQuestionIndex((index) => Math.max(0, index - 1))}>← Previous</button>
        <button type="button" disabled={!selected} onClick={() => setQuestionIndex((index) => Math.min(questions.length - 1, index + 1))}>{isLast ? "See result" : "Next →"}</button>
      </footer>
    </section>
  );
}

function VocabularyChapter({ set, chapterId, chapterIndex, setChapterIndex, onComplete }) {
  const [stage, setStage] = useState("learn");
  const [answers, setAnswers] = useState({});

  if (stage === "learn") return <VocabularyCards set={set} onFinish={() => setStage("practice")} />;
  return (
    <QuestionCycle
      kicker={`${set.label} · Retrieve`}
      title="Use every expression"
      questions={set.practice}
      answers={answers}
      setAnswers={setAnswers}
      finishLabel={chapterIndex === 0 ? "Learn Set B →" : "Mixed review →"}
      onFinish={() => {
        onComplete(chapterId);
        setChapterIndex(chapterIndex + 1);
      }}
    />
  );
}

function IdeaActivation({ tasks, selections, setSelections, onFinish, finishLabel = "Speaking rehearsal →" }) {
  const complete = tasks.every((task) => (selections[task.id] || []).length >= task.minimum);

  function toggle(task, idea) {
    const current = selections[task.id] || [];
    const next = current.includes(idea) ? current.filter((item) => item !== idea) : [...current, idea];
    setSelections((value) => ({ ...value, [task.id]: next }));
  }

  return (
    <section className="prep-activity-card">
      <div className="prep-activity-heading">
        <div>
          <span className="workshop-kicker">Make it personal</span>
          <h2>What could you say?</h2>
          <p className="prep-lead">Choose at least three talking points for each question. There are no wrong answers.</p>
        </div>
      </div>
      <div className="prep-idea-grid">
        {tasks.map((task) => (
          <fieldset key={task.id}>
            <legend>{task.question}</legend>
            <p>{task.instruction}</p>
            <div>
              {task.ideas.map((idea) => {
                const selected = (selections[task.id] || []).includes(idea);
                return <button key={idea} type="button" className={selected ? "is-selected" : ""} aria-pressed={selected} onClick={() => toggle(task, idea)}>{selected ? "✓ " : "+ "}{idea}</button>;
              })}
            </div>
            <small>{(selections[task.id] || []).length} selected · choose at least {task.minimum}</small>
          </fieldset>
        ))}
      </div>
      <footer className="prep-idea-actions">
        <span>{complete ? "You have enough ideas to speak." : "Choose your easiest ideas—not the most impressive ones."}</span>
        <button className="workshop-primary" type="button" disabled={!complete} onClick={onFinish}>{finishLabel}</button>
      </footer>
    </section>
  );
}

function ReviewChapter({ config, setChapterIndex, onComplete }) {
  const [stage, setStage] = useState("review");
  const [answers, setAnswers] = useState({});
  const [selections, setSelections] = useState({});

  if (stage === "review") {
    return <QuestionCycle kicker="Sets A + B" title="Mixed vocabulary review" questions={config.mixedReview} answers={answers} setAnswers={setAnswers} finishLabel="Choose your ideas →" onFinish={() => setStage("ideas")} />;
  }
  return (
    <IdeaActivation
      tasks={config.ideaTasks}
      selections={selections}
      setSelections={setSelections}
      finishLabel={config.writeTest ? "Writing check →" : "Speaking rehearsal →"}
      onFinish={() => {
        onComplete("review");
        setChapterIndex(3);
      }}
    />
  );
}

function SpeakingRehearsal({ rehearsal, onComplete, onOpenReference }) {
  const [secondsLeft, setSecondsLeft] = useState(45);
  const [running, setRunning] = useState(false);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (!running || secondsLeft <= 0) return undefined;
    const timer = window.setInterval(() => setSecondsLeft((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0) {
      setRunning(false);
      setAttempted(true);
    }
  }, [secondsLeft]);

  function startAgain() {
    setSecondsLeft(45);
    setAttempted(false);
    setRunning(true);
  }

  return (
    <section className="prep-activity-card prep-speaking-card">
      <div className="prep-activity-heading">
        <div><span className="workshop-kicker">Final step · Speak</span><h2>One 45-second rehearsal</h2></div>
        <strong className={secondsLeft <= 10 ? "prep-time-low" : ""}>0:{String(secondsLeft).padStart(2, "0")}</strong>
      </div>
      <div className="prep-rehearsal-layout">
        {rehearsal.image ? <img src={rehearsal.image} alt={rehearsal.imageAlt || ""} /> : null}
        <div>
          <blockquote>{rehearsal.question}</blockquote>
          <div className="prep-speaking-support">
            <section><span>Possible ideas</span>{rehearsal.ideaPrompts.map((idea) => <p key={idea}>• {idea}</p>)}</section>
            <section><span>Useful language</span>{rehearsal.usefulChunks.map((chunk) => <p key={chunk}>{chunk}</p>)}</section>
          </div>
          <p className="prep-support-note">Nothing is recorded. Start when you are ready and keep talking until the timer finishes.</p>
          <div className="prep-timer-actions">
            {!attempted ? <button className="workshop-primary" type="button" onClick={() => setRunning((value) => !value)}>{running ? "Pause" : secondsLeft < 45 ? "Continue" : "Start"}</button> : <button className="workshop-primary" type="button" onClick={startAgain}>Try again</button>}
            <button className="workshop-secondary" type="button" onClick={onOpenReference}>Language guide</button>
          </div>
        </div>
      </div>
      {attempted ? (
        <div className="prep-finish-row">
          <span>Rehearsal complete. You’re ready for the workshop.</span>
          <button className="prep-finish-button" type="button" onClick={onComplete}>Finish preparation ✓</button>
        </div>
      ) : null}
    </section>
  );
}

function WritingTest({ writeTest, onComplete }) {
  const [questions, setQuestions] = useState(() => shuffle(writeTest.items));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const question = questions[questionIndex];

  function checkAnswer(event) {
    event.preventDefault();
    if (!answer.trim() || result) return;
    const acceptedAnswers = [question.answer, ...(question.acceptedAnswers || [])].map(normalizeWrittenAnswer);
    const correct = acceptedAnswers.includes(normalizeWrittenAnswer(answer));
    setResult(correct ? "correct" : "wrong");
    if (correct) setScore((current) => current + 1);
  }

  function showAnswer() {
    if (result) return;
    setResult("wrong");
  }

  function nextQuestion() {
    if (questionIndex === questions.length - 1) {
      setFinished(true);
      return;
    }
    setQuestionIndex((current) => current + 1);
    setAnswer("");
    setResult(null);
  }

  function tryAgain() {
    setQuestions(shuffle(writeTest.items));
    setQuestionIndex(0);
    setAnswer("");
    setResult(null);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <section className="prep-activity-card prep-complete-card">
        <span className="prep-card-icon" aria-hidden="true">✓</span>
        <h2>{score} / {questions.length} correct</h2>
        <p>You completed the writing check. Review any answers you missed, or try the eight items again in a new order.</p>
        <div className="prep-complete-actions">
          <button className="workshop-secondary" type="button" onClick={tryAgain}>Try again</button>
          <button className="workshop-primary" type="button" onClick={onComplete}>Speaking rehearsal →</button>
        </div>
      </section>
    );
  }

  return (
    <section className="prep-activity-card">
      <div className="prep-activity-heading">
        <div>
          <span className="workshop-kicker">Sets A + B · Write</span>
          <h2>{writeTest.title || "Write the key words"}</h2>
          <p className="prep-lead">{writeTest.introduction}</p>
        </div>
        <strong>{questionIndex + 1} / {questions.length}</strong>
      </div>
      <div className="prep-write-layout">
        {question.image ? <img src={question.image} alt="" /> : null}
        <div className="prep-write-question">
          <span>Complete the sentence</span>
          <p>{question.prompt}</p>
          <form onSubmit={checkAnswer}>
            <label htmlFor={`prep-write-${question.id}`}>Missing word or words</label>
            <input
              id={`prep-write-${question.id}`}
              key={question.id}
              type="text"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              disabled={Boolean(result)}
              autoComplete="off"
              autoFocus
            />
            {!result ? (
              <div className="prep-write-actions">
                <button className="workshop-secondary" type="button" onClick={showAnswer}>Show answer</button>
                <button className="workshop-primary" type="submit" disabled={!answer.trim()}>Check</button>
              </div>
            ) : null}
          </form>
          {result ? (
            <div className={`prep-feedback ${result === "correct" ? "is-correct" : "is-wrong"}`} role="status">
              <strong>{result === "correct" ? "Correct." : `Answer: “${question.answer}”.`}</strong>
              <span>{question.feedback}</span>
            </div>
          ) : null}
          {result ? <button className="prep-write-next" type="button" onClick={nextQuestion}>{questionIndex === questions.length - 1 ? "See result" : "Next →"}</button> : null}
        </div>
      </div>
    </section>
  );
}

export function WorkshopPreparation({ topic, user, config, workshopSessions = [] }) {
  const navigate = useNavigate();
  const chapters = useMemo(() => config.writeTest?.items?.length ? [...BASE_CHAPTERS.slice(0, 3), WRITE_CHAPTER, BASE_CHAPTERS[3]] : BASE_CHAPTERS, [config.writeTest]);
  const workshopSessionSignature = workshopSessions
    .map((session) => `${session.id}:${session.phase}`)
    .sort()
    .join("|");
  const activityContext = useMemo(() => ({
    app: "aptis-speaking-workshops",
    topicId: topic.id,
    topicTitle: topic.title,
    sessionIds: workshopSessions.map((session) => session.id),
    sessionPhases: workshopSessions.map((session) => session.phase),
    beforeWorkshop: workshopSessions.some((session) => session.phase === "preparation"),
  }), [topic.id, topic.title, workshopSessions]);
  const storageKey = useMemo(() => `speaking-workshop-prep:${user?.uid || "local"}:${topic.id}:${config.storageVersion}`, [config.storageVersion, topic.id, user?.uid]);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [completedChapters, setCompletedChapters] = useState(() => readSavedProgress(storageKey));

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify({ completedChapters }));
  }, [completedChapters, storageKey]);

  useEffect(() => {
    if (!user?.uid || user.role === "admin" || user.role === "teacher") return;
    const viewKey = `activity:speaking-workshop-preparation:${user.uid}:${topic.id}:${workshopSessionSignature || "no-session"}`;
    try {
      if (window.sessionStorage.getItem(viewKey)) return;
      window.sessionStorage.setItem(viewKey, "1");
    } catch {
      // A blocked sessionStorage should not prevent activity logging.
    }
    void logActivity("speaking_workshop_preparation_viewed", activityContext);
  }, [activityContext, topic.id, user?.role, user?.uid, workshopSessionSignature]);

  const completedSet = useMemo(() => new Set(completedChapters), [completedChapters]);
  const chapter = chapters[chapterIndex] || chapters[0];
  const completedCount = chapters.filter((item) => completedSet.has(item.id)).length;

  function completeChapter(id) {
    if (completedSet.has(id)) return;
    const nextCompletedCount = chapters.filter((item) => item.id === id || completedSet.has(item.id)).length;
    setCompletedChapters((current) => [...current, id]);
    if (!user?.uid || user.role === "admin" || user.role === "teacher") return;
    const completedChapter = chapters.find((item) => item.id === id);
    void logActivity("speaking_workshop_preparation_progress", {
      ...activityContext,
      chapterId: id,
      chapterLabel: completedChapter?.label || id,
      completedChapters: nextCompletedCount,
      totalChapters: chapters.length,
    });
    if (nextCompletedCount === chapters.length) {
      void logActivity("speaking_workshop_preparation_completed", {
        ...activityContext,
        totalChapters: chapters.length,
      });
    }
  }

  return (
    <div className="workshop-prep-shell">
      <header className="workshop-session-header prep-session-header">
        <div>
          <span className="workshop-kicker">Prepare before the workshop · {topic.title}</span>
          <h1>Build your topic vocabulary</h1>
          <p>{config.writeTest ? "Learn 16 useful expressions, choose ideas, complete a short writing check, then rehearse once. Allow about 15–18 minutes." : "Learn 16 useful expressions, choose ideas you can discuss, then try one short rehearsal. Allow about 12–15 minutes."}</p>
        </div>
        <div className="workshop-session-header-actions">
          <button className="workshop-secondary" type="button" onClick={() => navigate(`/speaking-workshops/${topic.id}/reference`)}>Language guide</button>
          <button className="workshop-secondary" type="button" onClick={() => navigate(`/speaking-workshops/${topic.id}`)}>Change mode</button>
        </div>
      </header>
      <section className="prep-progress-summary" aria-label={`${completedCount} of ${chapters.length} preparation chapters complete`}>
        <div><strong>{completedCount} / {chapters.length}</strong><span>chapters complete</span></div>
        <div className="prep-progress-track" aria-hidden="true"><span style={{ width: `${(completedCount / chapters.length) * 100}%` }} /></div>
        {completedCount === chapters.length ? <b>Ready for the workshop ✓</b> : <small>Your progress is saved on this device.</small>}
      </section>
      <nav className="prep-step-nav" aria-label="Preparation chapters" style={{ "--prep-chapter-count": chapters.length }}>
        {chapters.map((item, index) => (
          <button key={item.id} type="button" className={`${chapterIndex === index ? "is-active" : ""} ${completedSet.has(item.id) ? "is-complete" : ""}`} onClick={() => setChapterIndex(index)}>
            <span>{completedSet.has(item.id) ? "✓" : index + 1}</span><strong>{item.label}</strong><small>{item.title}</small>
          </button>
        ))}
      </nav>
      <div className="prep-current-intro"><span>Chapter {chapterIndex + 1}</span><div><h2>{chapter.title}</h2><p>{chapter.description}</p></div></div>
      {chapterIndex === 0 ? <VocabularyChapter key="set-a" set={config.sets[0]} chapterId="set-a" chapterIndex={0} setChapterIndex={setChapterIndex} onComplete={completeChapter} /> : null}
      {chapterIndex === 1 ? <VocabularyChapter key="set-b" set={config.sets[1]} chapterId="set-b" chapterIndex={1} setChapterIndex={setChapterIndex} onComplete={completeChapter} /> : null}
      {chapterIndex === 2 ? <ReviewChapter key="review" config={config} setChapterIndex={setChapterIndex} onComplete={completeChapter} /> : null}
      {chapterIndex === 3 && config.writeTest ? <WritingTest writeTest={config.writeTest} onComplete={() => { completeChapter("write"); setChapterIndex(4); }} /> : null}
      {chapterIndex === 3 && !config.writeTest ? <SpeakingRehearsal rehearsal={config.rehearsal} onOpenReference={() => navigate(`/speaking-workshops/${topic.id}/reference`)} onComplete={() => completeChapter("speak")} /> : null}
      {chapterIndex === 4 && config.writeTest ? <SpeakingRehearsal rehearsal={config.rehearsal} onOpenReference={() => navigate(`/speaking-workshops/${topic.id}/reference`)} onComplete={() => completeChapter("speak")} /> : null}
    </div>
  );
}

export default function RelationshipsPreparation(props) {
  return <WorkshopPreparation {...props} config={relationshipsPreparationConfig} />;
}
