import React, { useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  CircleHelp,
  House,
  List,
  LogOut,
  RotateCcw,
  X,
} from "lucide-react";
import Seo from "../common/Seo.jsx";
import UserAvatar from "../common/UserAvatar.jsx";
import {
  APTIS_GRAMMAR_VOCABULARY_MOCKS,
  getAptisGrammarVocabularyMock,
} from "../../data/aptisGrammarVocabularyMocks.js";
import { getAptisMockReviewFeedback } from "../../data/aptisGrammarVocabularyMockFeedback.js";
import {
  auth,
  fetchAptisGrammarVocabularyMockAttempts,
  logActivity,
  saveAptisGrammarVocabularyMockAttempt,
} from "../../firebase.js";

const TEST_SECONDS = 25 * 60;

function formatTimer(totalSeconds) {
  const clamped = Math.max(0, totalSeconds);
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function buildQuestion(index, grammarQuestions, vocabularyTasks) {
  if (index < grammarQuestions.length) {
    return {
      type: "grammar",
      displayNumber: index + 1,
      data: grammarQuestions[index],
    };
  }

  const vocabIndex = index - grammarQuestions.length;
  return {
    type: "vocabulary",
    displayNumber: index + 1,
    data: vocabularyTasks[vocabIndex],
  };
}

function shuffleValues(values) {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function buildVocabularyOptionOrders(tasks) {
  return Object.fromEntries(
    tasks.map((task) => [task.id, shuffleValues(task.options.map((option) => option.value))])
  );
}

function getOrderedVocabularyOptions(task, optionOrders) {
  const optionsByValue = new Map(task.options.map((option) => [option.value, option]));
  return (optionOrders[task.id] || task.options.map((option) => option.value))
    .map((value) => optionsByValue.get(value))
    .filter(Boolean);
}

function isQuestionAttempted(index, mock, answers) {
  if (index < mock.grammarQuestions.length) {
    return Boolean(answers[mock.grammarQuestions[index].id]);
  }
  const task = mock.vocabularyTasks[index - mock.grammarQuestions.length];
  return Object.values(answers[task.id] || {}).some(Boolean);
}

function calculateResults(mock, answers) {
  const reviewFeedback = getAptisMockReviewFeedback(mock.id);
  const grammarItems = mock.grammarQuestions.map((question, index) => {
    const selected = answers[question.id] || "";
    const correctIndex = question.correctAnswer.charCodeAt(0) - 65;
    const correctValue = question.options[correctIndex];
    return {
      id: question.id,
      number: index + 1,
      prompt: question.prompt,
      selected,
      correctValue,
      correct: selected === correctValue,
      target: question.target,
      explanation: reviewFeedback.grammar[question.id]?.explanation || "",
    };
  });

  const vocabularyTasks = mock.vocabularyTasks.map((task) => {
    const items = task.rows.map((row) => {
      const selected = answers[task.id]?.[row.number] || "";
      const correctOption = task.options.find((option) => option.value === row.correctAnswer);
      const selectedOption = task.options.find((option) => option.value === selected);
      return {
        number: row.number,
        prompt: row.prompt,
        selected: selectedOption?.label || "",
        correctValue: correctOption?.label || "",
        correct: selected === row.correctAnswer,
        explanation: reviewFeedback.vocabulary[task.id]?.[row.number]?.explanation || "",
      };
    });
    return {
      id: task.id,
      range: task.range,
      type: task.type,
      items,
      score: items.filter((item) => item.correct).length,
    };
  });

  const grammarScore = grammarItems.filter((item) => item.correct).length;
  const vocabularyScore = vocabularyTasks.reduce((total, task) => total + task.score, 0);
  const total = grammarItems.length + vocabularyTasks.reduce((sum, task) => sum + task.items.length, 0);
  const score = grammarScore + vocabularyScore;
  const answered = grammarItems.filter((item) => item.selected).length
    + vocabularyTasks.reduce(
      (sum, task) => sum + task.items.filter((item) => item.selected).length,
      0
    );

  return {
    grammarItems,
    vocabularyTasks,
    grammarScore,
    vocabularyScore,
    score,
    total,
    answered,
    percentage: total ? Math.round((score / total) * 100) : 0,
  };
}

function IconButton({ children, label, onClick }) {
  return (
    <button className="aptis-mock-icon-btn" type="button" onClick={onClick} aria-label={label} title={label}>
      {children}
    </button>
  );
}

export default function HubAptisGrammarVocabularyMock({ user, onHome, onProfile }) {
  const [stage, setStage] = useState("menu");
  const [selectedMockId, setSelectedMockId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(TEST_SECONDS);
  const [answers, setAnswers] = useState({});
  const [bookmarked, setBookmarked] = useState({});
  const [seen, setSeen] = useState({});
  const [vocabularyOptionOrders, setVocabularyOptionOrders] = useState({});
  const [questionListOpen, setQuestionListOpen] = useState(false);
  const [questionListFilter, setQuestionListFilter] = useState("all");
  const [mockAttempts, setMockAttempts] = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  const [attemptSaveState, setAttemptSaveState] = useState("idle");
  const [attemptSaveError, setAttemptSaveError] = useState("");
  const [completionReason, setCompletionReason] = useState("completed");
  const saveStartedRef = useRef(false);
  const startedAtRef = useRef(null);
  const activitySessionIdRef = useRef("");

  const activeMock = useMemo(
    () => getAptisGrammarVocabularyMock(selectedMockId) || APTIS_GRAMMAR_VOCABULARY_MOCKS[0],
    [selectedMockId]
  );
  const vocabularyTasks = activeMock.vocabularyTasks;
  const totalQuestions = activeMock.grammarQuestions.length + vocabularyTasks.length;
  const currentQuestion = useMemo(
    () => buildQuestion(currentIndex, activeMock.grammarQuestions, vocabularyTasks),
    [activeMock.grammarQuestions, currentIndex, vocabularyTasks]
  );
  const results = useMemo(() => calculateResults(activeMock, answers), [activeMock, answers]);
  const timerRunning = stage === "question";

  useEffect(() => {
    let alive = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (alive) {
          setMockAttempts([]);
          setAttemptsLoading(false);
        }
        return;
      }

      try {
        const rows = await fetchAptisGrammarVocabularyMockAttempts(50, user.uid);
        if (alive) setMockAttempts(rows);
      } catch (error) {
        console.warn("[Aptis mock] Could not load saved attempts", error);
      } finally {
        if (alive) setAttemptsLoading(false);
      }
    });

    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!timerRunning) return undefined;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning]);

  useEffect(() => {
    if (stage !== "question" || secondsLeft > 0) return;
    setCompletionReason("time_expired");
    setStage("results");
    setQuestionListOpen(false);
  }, [secondsLeft, stage]);

  useEffect(() => {
    if (stage !== "results" || saveStartedRef.current || !selectedMockId) return;
    saveStartedRef.current = true;

    const user = auth.currentUser;
    if (!user) {
      setAttemptSaveState("signed-out");
      return;
    }

    const weaknessCounts = results.grammarItems
      .filter((item) => !item.correct)
      .reduce((counts, item) => {
        counts[item.target] = (counts[item.target] || 0) + 1;
        return counts;
      }, {});
    const grammarWeaknesses = Object.entries(weaknessCounts)
      .map(([target, mistakes]) => ({ target, mistakes }))
      .sort((left, right) => right.mistakes - left.mistakes || left.target.localeCompare(right.target));

    setAttemptSaveState("saving");
    setAttemptSaveError("");
    saveAptisGrammarVocabularyMockAttempt({
      mockId: activeMock.id,
      mockTitle: activeMock.title,
      mockVersion: activeMock.version,
      score: results.score,
      total: results.total,
      percentage: results.percentage,
      grammarScore: results.grammarScore,
      vocabularyScore: results.vocabularyScore,
      answered: results.answered,
      elapsedSeconds: TEST_SECONDS - secondsLeft,
      durationSeconds: TEST_SECONDS,
      startedAtClient: startedAtRef.current,
      activitySessionId: activitySessionIdRef.current,
      completionReason,
      answers,
      review: {
        grammarItems: results.grammarItems,
        vocabularyTasks: results.vocabularyTasks,
      },
      grammarWeaknesses,
    })
      .then(async () => {
        setAttemptSaveState("saved");
        try {
          const rows = await fetchAptisGrammarVocabularyMockAttempts(50, user.uid);
          setMockAttempts(rows);
        } catch (error) {
          console.warn("[Aptis mock] Attempt saved, but progress could not be refreshed", error);
        }
      })
      .catch((error) => {
        console.error("[Aptis mock] Could not save attempt", error);
        setAttemptSaveError(error?.message || "Your result could not be saved.");
        setAttemptSaveState("error");
      });
  }, [activeMock, answers, completionReason, results, secondsLeft, selectedMockId, stage]);

  function selectMock(mockId) {
    setSelectedMockId(mockId);
    setStage("landing");
    setCurrentIndex(0);
    setSecondsLeft(TEST_SECONDS);
    setAnswers({});
    setBookmarked({});
    setSeen({});
    setVocabularyOptionOrders({});
    setQuestionListOpen(false);
    setQuestionListFilter("all");
    setAttemptSaveState("idle");
    setAttemptSaveError("");
    setCompletionReason("completed");
    saveStartedRef.current = false;
    startedAtRef.current = null;
    activitySessionIdRef.current = "";
  }

  function startAssessment() {
    setStage("instructions");
    setCurrentIndex(0);
    setSecondsLeft(TEST_SECONDS);
    setAnswers({});
    setBookmarked({});
    setSeen({});
    setVocabularyOptionOrders(buildVocabularyOptionOrders(activeMock.vocabularyTasks));
    setQuestionListFilter("all");
    setAttemptSaveState("idle");
    setAttemptSaveError("");
    setCompletionReason("completed");
    saveStartedRef.current = false;
    startedAtRef.current = null;
    activitySessionIdRef.current = "";
  }

  function startQuestions() {
    if (!startedAtRef.current) {
      const startedAtClient = new Date().toISOString();
      const activitySessionId = globalThis.crypto?.randomUUID?.()
        || `aptis-mock-${activeMock.id}-${Date.now()}`;
      startedAtRef.current = startedAtClient;
      activitySessionIdRef.current = activitySessionId;
      logActivity("aptis_mock_started", {
        product: "aptis-general",
        module: "grammar-vocabulary",
        mockId: activeMock.id,
        mockTitle: activeMock.title,
        mockVersion: activeMock.version,
        total: results.total,
        questionScreens: totalQuestions,
        durationSeconds: TEST_SECONDS,
        startedAtClient,
        activitySessionId,
      });
    }
    setStage("question");
    setSeen({ 0: true });
  }

  function updateAnswer(questionId, value) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  function updateVocabAnswer(taskId, row, value) {
    setAnswers((current) => ({
      ...current,
      [taskId]: {
        ...(current[taskId] || {}),
        [row]: value,
      },
    }));
  }

  function goToQuestion(nextIndex) {
    const boundedIndex = Math.min(totalQuestions - 1, Math.max(0, nextIndex));
    if (stage === "instructions") setStage("question");
    setCurrentIndex(boundedIndex);
    setSeen((current) => ({ ...current, [boundedIndex]: true }));
    setQuestionListOpen(false);
  }

  function submitAssessment() {
    setCompletionReason("completed");
    setStage("results");
    setQuestionListOpen(false);
  }

  function returnToMenu() {
    setStage("menu");
    setSelectedMockId(null);
    setCurrentIndex(0);
    setSecondsLeft(TEST_SECONDS);
    setAnswers({});
    setBookmarked({});
    setSeen({});
    setVocabularyOptionOrders({});
    setQuestionListOpen(false);
    setQuestionListFilter("all");
  }

  function leaveMock(destination) {
    if (
      stage === "question" &&
      !window.confirm("Leave this mock? Your current answers will not be submitted or saved.")
    ) {
      return;
    }
    destination?.();
  }

  const progressWidth = `${Math.max(4, (secondsLeft / TEST_SECONDS) * 100)}%`;

  return (
    <div className="aptis-mock notranslate" translate="no">
      <Seo
        title="Aptis Grammar and Vocabulary Mock | Seif Hub"
        description="A mock Aptis grammar and vocabulary runner with exam-style timing and navigation."
      />

      <MockPortalHeader
        user={user}
        onHome={() => leaveMock(onHome)}
        onProfile={() => leaveMock(onProfile)}
      />

      {stage === "menu" ? (
        <MockMenu attempts={mockAttempts} loading={attemptsLoading} onSelect={selectMock} />
      ) : stage === "landing" ? (
        <main className="aptis-mock-start">
          <section className="aptis-mock-start-copy">
            <p>Aptis General Practice Test</p>
            <h1>Grammar and Vocabulary Practice Test Version {activeMock.version}</h1>

            <dl>
              <div>
                <dt>Number of Questions</dt>
                <dd>30</dd>
              </div>
              <div>
                <dt>Time Allowed</dt>
                <dd>25 min</dd>
              </div>
            </dl>

            <h2>Assessment Description</h2>

            <div className="aptis-mock-start-actions">
              <button className="aptis-mock-secondary" type="button" onClick={returnToMenu}>
                <ArrowLeft size={22} />
                All mock tests
              </button>
              <button className="aptis-mock-primary is-start" type="button" onClick={startAssessment}>
                Start Assessment
              </button>
            </div>
          </section>
        </main>
      ) : stage === "results" ? (
        <ResultsReport
          mock={activeMock}
          results={results}
          timedOut={secondsLeft === 0}
          saveState={attemptSaveState}
          saveError={attemptSaveError}
          onRetry={startAssessment}
          onMenu={returnToMenu}
        />
      ) : (
        <>
          <main
            className={`aptis-mock-paper ${stage === "instructions" ? "is-instructions" : ""} ${
              stage === "question" && currentQuestion.type === "vocabulary" ? "is-vocabulary" : ""
            }`}
          >
            {stage === "instructions" ? (
              <section className="aptis-mock-instructions">
                <h1>Aptis General Grammar and Vocabulary Instructions</h1>
                <h2>Grammar and Vocabulary</h2>
                <p>The test consists of two sections:</p>
                <p>Grammar: 25 questions</p>
                <p>Vocabulary: 5 tasks with 5 questions each</p>
                <p>Total Time: 25 minutes</p>
                <p className="aptis-mock-instruction-final">
                  When you click on the 'Next' button, the test will begin.
                </p>
              </section>
            ) : (
              <section className="aptis-mock-question-screen">
                <aside className="aptis-mock-timer" aria-label="Time remaining">
                  <strong>{formatTimer(secondsLeft)}</strong>
                  <span>Time remaining</span>
                  <div>
                    <span style={{ width: progressWidth }} />
                  </div>
                </aside>

                <header className="aptis-mock-question-header">
                  <div>
                    <p>Grammar and Vocabulary</p>
                    <h1>Question {currentQuestion.displayNumber} of {totalQuestions}</h1>
                  </div>
                  <button
                    className={`aptis-mock-bookmark ${bookmarked[currentIndex] ? "is-active" : ""}`}
                    type="button"
                    aria-pressed={Boolean(bookmarked[currentIndex])}
                    onClick={() =>
                      setBookmarked((current) => ({ ...current, [currentIndex]: !current[currentIndex] }))
                    }
                  >
                    <Bookmark size={31} fill={bookmarked[currentIndex] ? "currentColor" : "none"} />
                    <span>{bookmarked[currentIndex] ? "Bookmarked" : "Bookmark"}</span>
                  </button>
                </header>

                {currentQuestion.type === "grammar" ? (
                  <GrammarQuestion
                    question={currentQuestion.data}
                    answer={answers[currentQuestion.data.id] || ""}
                    onAnswer={(value) => updateAnswer(currentQuestion.data.id, value)}
                  />
                ) : (
                  <VocabularyTask
                    task={currentQuestion.data}
                    options={getOrderedVocabularyOptions(currentQuestion.data, vocabularyOptionOrders)}
                    answers={answers[currentQuestion.data.id] || {}}
                    onAnswer={(row, value) => updateVocabAnswer(currentQuestion.data.id, row, value)}
                  />
                )}
              </section>
            )}
          </main>

          <ExamFooter
            stage={stage}
            currentIndex={currentIndex}
            onNext={() => {
              if (stage === "instructions") startQuestions();
              else if (currentIndex === totalQuestions - 1) submitAssessment();
              else goToQuestion(currentIndex + 1);
            }}
            onPrevious={() => goToQuestion(currentIndex - 1)}
            onOpenList={() => setQuestionListOpen(true)}
            onExit={returnToMenu}
            totalQuestions={totalQuestions}
          />
        </>
      )}

      {questionListOpen ? (
        <QuestionDrawer
          activeMock={activeMock}
          answers={answers}
          bookmarked={bookmarked}
          currentIndex={currentIndex}
          filter={questionListFilter}
          onChangeFilter={setQuestionListFilter}
          onClose={() => setQuestionListOpen(false)}
          onSelect={goToQuestion}
          seen={seen}
          totalQuestions={totalQuestions}
        />
      ) : null}

      <AptisMockStyles />
    </div>
  );
}

function MockPortalHeader({ user, onHome, onProfile }) {
  return (
    <header className="aptis-mock-portal-header">
      <img
        src="/images/seif-trainer-logo.png"
        alt="Seif English"
        className="aptis-mock-portal-logo"
        draggable="false"
      />
      <nav aria-label="Mock navigation">
        <button type="button" onClick={onHome} className="aptis-mock-home-button">
          <House size={19} aria-hidden="true" />
          Home
        </button>
        <button
          type="button"
          onClick={onProfile}
          className="aptis-mock-profile-button"
          aria-label="Open profile"
          title={user?.email || "My profile"}
        >
          <UserAvatar user={user} size="md" />
        </button>
      </nav>
    </header>
  );
}

function MockMenu({ attempts, loading, onSelect }) {
  return (
    <main className="aptis-mock-menu">
      <section className="aptis-mock-menu-copy">
        <p className="aptis-mock-menu-eyebrow">Aptis General Practice Tests</p>
        <h1>Choose a grammar and vocabulary mock</h1>
        <p className="aptis-mock-menu-intro">
          Each practice test has 25 grammar questions, followed by five vocabulary tasks.
        </p>

        <div className="aptis-mock-menu-grid">
          {APTIS_GRAMMAR_VOCABULARY_MOCKS.map((mock) => {
            const savedAttempts = attempts.filter((attempt) => attempt.mockId === mock.id);
            const latestAttempt = savedAttempts[0] || null;
            const bestAttempt = savedAttempts.reduce(
              (best, attempt) => (!best || Number(attempt.score || 0) > Number(best.score || 0) ? attempt : best),
              null
            );

            return (
              <button key={mock.id} type="button" onClick={() => onSelect(mock.id)}>
                <span>Practice Test</span>
                <strong>Mock {Number(mock.version)}</strong>
                <small>Version {mock.version} · 25 minutes</small>
                <span className={`aptis-mock-menu-status ${latestAttempt ? "is-complete" : ""}`}>
                  {loading ? (
                    "Checking progress…"
                  ) : latestAttempt ? (
                    <>
                      <CheckCircle2 size={16} aria-hidden="true" />
                      Completed · latest {latestAttempt.score ?? 0}/{latestAttempt.total || 50}
                      {savedAttempts.length > 1 ? ` · best ${bestAttempt?.score ?? 0}/${bestAttempt?.total || 50}` : ""}
                    </>
                  ) : (
                    "Not completed"
                  )}
                </span>
                <ArrowRight size={26} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function QuestionDrawer({
  activeMock,
  answers,
  bookmarked,
  currentIndex,
  filter,
  onChangeFilter,
  onClose,
  onSelect,
  seen,
  totalQuestions,
}) {
  const bookmarkedCount = Object.values(bookmarked).filter(Boolean).length;
  const questionIndexes = Array.from({ length: totalQuestions }, (_, index) => index)
    .filter((index) => filter === "all" || bookmarked[index]);

  return (
    <div className="aptis-mock-drawer-backdrop" onClick={onClose}>
      <aside className="aptis-mock-question-drawer" aria-label="Question list" onClick={(event) => event.stopPropagation()}>
        <header>
          <h2>Questions</h2>
          <button type="button" onClick={onClose} aria-label="Close question list">
            <X size={26} />
          </button>
        </header>

        <div className="aptis-mock-drawer-filters" role="group" aria-label="Question filters">
          <button
            type="button"
            className={filter === "all" ? "is-active" : ""}
            onClick={() => onChangeFilter("all")}
          >
            All
          </button>
          <button
            type="button"
            className={filter === "bookmarked" ? "is-active" : ""}
            onClick={() => onChangeFilter("bookmarked")}
          >
            Bookmarked ({bookmarkedCount})
          </button>
        </div>

        <div className="aptis-mock-drawer-instructions">
          <strong>Aptis General Grammar and Vocabulary Instructions</strong>
        </div>

        <section className="aptis-mock-drawer-section">
          <div className="aptis-mock-drawer-section-heading">
            <div>
              <h3>Grammar and Vocabulary</h3>
              <p>{totalQuestions} Questions</p>
            </div>
            <span aria-hidden="true">−</span>
          </div>

          <div className="aptis-mock-drawer-list">
            {questionIndexes.length ? questionIndexes.map((index) => {
              const attempted = isQuestionAttempted(index, activeMock, answers);
              return (
                <button
                  key={index}
                  type="button"
                  className={index === currentIndex ? "is-current" : ""}
                  onClick={() => onSelect(index)}
                >
                  <strong>{String(index + 1).padStart(2, "0")}</strong>
                  <span className="aptis-mock-drawer-bookmark-slot">
                    {bookmarked[index] ? <Bookmark size={23} fill="currentColor" aria-label="Bookmarked" /> : null}
                  </span>
                  <span>{seen[index] ? "Seen" : "Unseen"}</span>
                  <span>{attempted ? "Attempted" : "Not Attempted"}</span>
                </button>
              );
            }) : (
              <p className="aptis-mock-drawer-empty">No questions have been bookmarked yet.</p>
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}

function getResultFeedback(percentage) {
  if (percentage === 100) {
    return {
      title: "Perfect score",
      body: "You answered all 50 questions correctly. Your grammar and vocabulary control was excellent throughout this mock.",
    };
  }
  if (percentage >= 90) {
    return {
      title: "Excellent control",
      body: "You showed consistently accurate grammar and vocabulary knowledge. Review the few missed items to polish the remaining weak points.",
    };
  }
  if (percentage >= 75) {
    return {
      title: "Strong performance",
      body: "Your overall control is good. Focus your next review on the specific grammar targets and vocabulary task types listed below.",
    };
  }
  if (percentage >= 60) {
    return {
      title: "Developing performance",
      body: "You have a useful foundation, but several areas still need attention. Work through the missed answers below before attempting the mock again.",
    };
  }
  return {
    title: "More focused practice needed",
    body: "Review the highlighted grammar targets and vocabulary groups, then retake the mock after some targeted practice.",
  };
}

function ResultsReport({ mock, results, timedOut, saveState, saveError, onRetry, onMenu }) {
  const feedback = getResultFeedback(results.percentage);
  const vocabularyItems = results.vocabularyTasks.flatMap((task) =>
    task.items.map((item) => ({ ...item, type: task.type, range: task.range }))
  );

  return (
    <main className="aptis-mock-results">
      <section className="aptis-mock-results-inner">
        <header className="aptis-mock-results-header">
          <CheckCircle2 size={50} aria-hidden="true" />
          <div>
            <p>{mock.title}</p>
            <h1>Your results</h1>
            {timedOut ? <span>The test was submitted when the timer reached zero.</span> : null}
          </div>
        </header>

        <div className="aptis-mock-score-grid">
          <article className="is-total">
            <span>Overall score</span>
            <strong>{results.score}/{results.total}</strong>
            <small>{results.percentage}%</small>
          </article>
          <article>
            <span>Grammar</span>
            <strong>{results.grammarScore}/25</strong>
          </article>
          <article>
            <span>Vocabulary</span>
            <strong>{results.vocabularyScore}/25</strong>
          </article>
          <article>
            <span>Answered</span>
            <strong>{results.answered}/{results.total}</strong>
          </article>
        </div>

        <div className={`aptis-mock-save-status is-${saveState}`} role="status">
          {saveState === "saving" ? "Saving this attempt to your profile…" : null}
          {saveState === "saved" ? "This attempt has been saved to your profile for future review." : null}
          {saveState === "signed-out" ? "Sign in to keep this attempt in your profile." : null}
          {saveState === "error" ? `This attempt could not be saved. ${saveError}` : null}
        </div>

        <section className="aptis-mock-feedback-card">
          <h2>{feedback.title}</h2>
          <p>{feedback.body}</p>
        </section>

        <section className="aptis-mock-breakdown">
          <h2>Vocabulary breakdown</h2>
          <div>
            {results.vocabularyTasks.map((task) => (
              <article key={task.id}>
                <span>{task.range}</span>
                <strong>{task.type}</strong>
                <b>{task.score}/5</b>
              </article>
            ))}
          </div>
        </section>

        <section className="aptis-mock-review">
          <h2>Answer review</h2>
          <p className="aptis-mock-review-intro">
            Open a section to review correct and incorrect answers. Detailed explanations are available where provided.
          </p>

          <details>
            <summary>Grammar answers · {results.grammarScore}/25 correct</summary>
            <div className="aptis-mock-review-list">
              {results.grammarItems.map((item) => (
                <AnswerReviewItem
                  key={item.id}
                  item={item}
                  label={`Grammar ${item.number} · ${item.target}`}
                />
              ))}
            </div>
          </details>

          <details>
            <summary>Vocabulary answers · {results.vocabularyScore}/25 correct</summary>
            <div className="aptis-mock-review-list">
              {vocabularyItems.map((item) => (
                <AnswerReviewItem
                  key={`${item.range}:${item.number}`}
                  item={item}
                  label={`Vocabulary ${item.number} · ${item.type}`}
                />
              ))}
            </div>
          </details>
        </section>

        <div className="aptis-mock-results-actions">
          <button className="aptis-mock-secondary" type="button" onClick={onMenu}>
            All mock tests
          </button>
          <button className="aptis-mock-primary" type="button" onClick={onRetry}>
            <RotateCcw size={21} />
            Try again
          </button>
        </div>
      </section>
    </main>
  );
}

function AnswerReviewItem({ item, label }) {
  return (
    <article className={item.correct ? "is-correct" : "is-incorrect"}>
      <header>
        <span>{label}</span>
        <b>{item.correct ? "Correct" : "Review"}</b>
      </header>
      <strong>{item.prompt}</strong>
      <p>Your answer: {item.selected || "Not answered"}</p>
      <p>Correct answer: {item.correctValue}</p>
      {item.explanation ? (
        <details className="aptis-mock-answer-explanation">
          <summary>Why is this correct?</summary>
          <p>{item.explanation}</p>
        </details>
      ) : null}
    </article>
  );
}

function GrammarQuestion({ question, answer, onAnswer }) {
  return (
    <div className="aptis-mock-grammar">
      <p className="aptis-mock-grammar-prompt">{question.prompt}</p>

      <div className="aptis-mock-options">
        {question.options.map((option, index) => {
          const letter = String.fromCharCode(65 + index);
          return (
            <button
              key={`${question.id}:${option}`}
              type="button"
              className={answer === option ? "is-selected" : ""}
              onClick={() => onAnswer(option)}
            >
              <span>{letter}</span>
              <strong>{option}</strong>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VocabularyTask({ task, options, answers, onAnswer }) {
  return (
    <div className="aptis-mock-vocabulary">
      <p className="aptis-mock-vocab-section">{task.range}: {task.type}</p>
      <p className="aptis-mock-vocab-instruction">{task.instruction}</p>

      <div className="aptis-mock-vocab-form">
        {task.rows.map((row) => {
          const sentenceParts = row.prompt.split("__________");
          const isSentence = sentenceParts.length === 2;
          return isSentence ? (
            <div key={`${task.id}:${row.number}`} className="aptis-mock-vocab-row is-sentence">
              <span>{row.number}.</span>
              <label>
                <span>{sentenceParts[0]}</span>
                <VocabularySelect
                  row={row}
                  options={options}
                  value={answers[row.number] || ""}
                  onAnswer={onAnswer}
                />
                <span>{sentenceParts[1]}</span>
              </label>
            </div>
          ) : (
            <label key={`${task.id}:${row.number}`} className="aptis-mock-vocab-row">
              <span>{row.number}.</span>
              <strong>{row.prompt}</strong>
              <span>{task.type === "Collocations" ? "+" : task.showEquals ? "=" : ""}</span>
              <VocabularySelect
                row={row}
                options={options}
                value={answers[row.number] || ""}
                onAnswer={onAnswer}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}

function VocabularySelect({ row, options, value, onAnswer }) {
  return (
    <select
      aria-label={`Question ${row.number}`}
      value={value}
      onChange={(event) => onAnswer(row.number, event.target.value)}
    >
      <option value="">Choose a word</option>
      {options.map((option) => (
        <option key={`${row.number}:${option.value}`} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function ExamFooter({ stage, currentIndex, onNext, onPrevious, onOpenList, onExit, totalQuestions }) {
  return (
    <footer className="aptis-mock-footer">
      <div className="aptis-mock-footer-left">
        <IconButton label="Question list" onClick={onOpenList}>
          <List size={30} />
        </IconButton>
        <IconButton label="Information">
          <CircleHelp size={30} />
        </IconButton>
      </div>

      <div className="aptis-mock-footer-right">
        <IconButton label="Exit" onClick={onExit}>
          <LogOut size={28} />
        </IconButton>
        {stage === "question" ? (
          <button
            className="aptis-mock-secondary"
            type="button"
            onClick={onPrevious}
            disabled={currentIndex === 0}
          >
            <ArrowLeft size={24} />
            Previous
          </button>
        ) : null}
        <button
          className="aptis-mock-primary"
          type="button"
          onClick={onNext}
        >
          {stage === "question" && currentIndex === totalQuestions - 1 ? "Submit test" : "Next"}
          {stage === "question" && currentIndex === totalQuestions - 1 ? (
            <CheckCircle2 size={24} />
          ) : (
            <ArrowRight size={25} />
          )}
        </button>
      </div>
    </footer>
  );
}

function AptisMockStyles() {
  return (
    <style>{`
      .aptis-mock {
        --aptis-purple: #2a075e;
        --aptis-border: #cfcfd4;
        --aptis-soft: #f5f6fa;
        width: 100%;
        min-height: 100vh;
        position: relative;
        background: #fff;
        color: #202124;
        font-family: Arial, Helvetica, sans-serif;
        letter-spacing: 0;
      }

      .aptis-mock button,
      .aptis-mock select {
        font-family: inherit;
      }

      .aptis-mock-start,
      .aptis-mock-menu {
        position: relative;
        min-height: 100vh;
        border-radius: 0 0 24px 24px;
        background: #fff;
        border-top: 1px solid #ddd;
      }

      .aptis-mock-portal-header {
        position: absolute;
        inset: 0 0 auto;
        z-index: 5;
        min-height: 84px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 10px 28px;
        border-bottom: 1px solid #d6d6da;
        background: #fff;
      }

      .aptis-mock-portal-logo {
        display: block;
        width: 58px;
        height: 58px;
        object-fit: contain;
        filter: drop-shadow(0 0 8px rgba(2, 15, 40, 0.14));
      }

      .aptis-mock-portal-header nav {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .aptis-mock-home-button,
      .aptis-mock-profile-button {
        min-height: 44px;
        border: 1px solid #d6d2dc;
        background: #fff;
        color: #2a075e;
        cursor: pointer;
      }

      .aptis-mock-home-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 0 16px;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 800;
      }

      .aptis-mock-profile-button {
        width: 46px;
        display: grid;
        place-items: center;
        padding: 0;
        border-radius: 50%;
      }

      .aptis-mock-home-button:hover,
      .aptis-mock-home-button:focus-visible,
      .aptis-mock-profile-button:hover,
      .aptis-mock-profile-button:focus-visible {
        border-color: var(--aptis-purple);
        background: #f6f3fa;
      }

      .aptis-mock-menu-copy {
        width: min(100%, 1120px);
        margin: 0 auto;
        padding: 132px 32px 72px;
      }

      .aptis-mock-menu-copy h1 {
        max-width: 720px;
        margin: 0 0 18px;
        color: #24252a;
        text-align: left;
        font-size: clamp(30px, 4vw, 48px);
        line-height: 1.08;
      }

      .aptis-mock-menu-eyebrow {
        margin: 0 0 14px;
        color: var(--aptis-purple);
        font-size: 17px;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .aptis-mock-menu-intro {
        max-width: 680px;
        margin: 0;
        color: #555760;
        font-size: 20px;
        line-height: 1.45;
      }

      .aptis-mock-menu-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 20px;
        margin-top: 52px;
      }

      .aptis-mock-menu-grid button {
        position: relative;
        min-height: 230px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 30px;
        border: 2px solid #d4cde2;
        border-radius: 12px;
        background: linear-gradient(145deg, #fff 15%, #f7f4fc 100%);
        color: #25232a;
        text-align: left;
        cursor: pointer;
        box-shadow: 0 12px 28px rgba(42, 7, 94, 0.08);
        transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
      }

      .aptis-mock-menu-grid button:hover,
      .aptis-mock-menu-grid button:focus-visible {
        border-color: var(--aptis-purple);
        box-shadow: 0 18px 36px rgba(42, 7, 94, 0.16);
        transform: translateY(-3px);
      }

      .aptis-mock-menu-grid button span {
        color: #6a5b80;
        font-size: 15px;
        font-weight: 800;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .aptis-mock-menu-grid button strong {
        margin-top: 17px;
        color: var(--aptis-purple);
        font-size: 32px;
      }

      .aptis-mock-menu-grid button small {
        margin-top: 12px;
        color: #555760;
        font-size: 16px;
      }

      .aptis-mock-menu-grid button .aptis-mock-menu-status {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-top: 22px;
        padding: 6px 10px;
        border-radius: 999px;
        background: #eeebf3;
        color: #67616d;
        font-size: 13px;
        font-weight: 750;
        letter-spacing: 0;
        line-height: 1.3;
        text-transform: none;
      }

      .aptis-mock-menu-grid button .aptis-mock-menu-status.is-complete {
        background: #e9f4ec;
        color: #326644;
      }

      .aptis-mock-menu-grid button svg {
        position: absolute;
        right: 26px;
        bottom: 25px;
        color: var(--aptis-purple);
      }

      .aptis-mock-start-copy {
        padding: 126px 0 0 195px;
        max-width: 760px;
      }

      .aptis-mock-start-copy p,
      .aptis-mock-start-copy h1,
      .aptis-mock-start-copy h2,
      .aptis-mock-start-copy dt,
      .aptis-mock-start-copy dd {
        color: #27282d;
        text-align: left;
      }

      .aptis-mock-start-copy p {
        margin: 0 0 18px;
        font-size: 20px;
        font-weight: 700;
      }

      .aptis-mock-start-copy h1 {
        margin: 0 0 37px;
        font-size: 26px;
        line-height: 1.2;
      }

      .aptis-mock-start-copy dl {
        display: flex;
        gap: 110px;
        margin: 0 0 39px;
      }

      .aptis-mock-start-copy dt {
        margin-bottom: 13px;
        font-size: 17px;
        font-weight: 700;
      }

      .aptis-mock-start-copy dd {
        font-size: 20px;
        font-weight: 700;
      }

      .aptis-mock-start-copy h2 {
        margin: 0 0 57px;
        font-size: 18px;
      }

      .aptis-mock-start-actions {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .aptis-mock-paper {
        min-height: calc(100vh - 104px);
        padding: 128px 32px 170px;
        background: #fff;
      }

      .aptis-mock-paper.is-instructions {
        display: flex;
        justify-content: center;
        padding-top: 126px;
      }

      .aptis-mock-paper.is-vocabulary {
        padding-top: 118px;
      }

      .aptis-mock-paper.is-vocabulary .aptis-mock-question-header {
        margin-bottom: 30px;
      }

      .aptis-mock-instructions {
        width: min(100%, 680px);
        color: #2b2d31;
      }

      .aptis-mock-instructions h1,
      .aptis-mock-instructions h2 {
        text-align: left;
        color: #2b2d31;
      }

      .aptis-mock-instructions h1 {
        margin: 0 0 22px;
        font-size: 28px;
        line-height: 1.2;
      }

      .aptis-mock-instructions h2 {
        margin: 0 0 24px;
        font-size: 22px;
      }

      .aptis-mock-instructions p {
        margin: 0 0 22px;
        font-size: 21px;
        line-height: 1.25;
      }

      .aptis-mock-instruction-final {
        padding-top: 48px;
      }

      .aptis-mock-question-screen {
        position: relative;
        width: min(100%, 1200px);
        margin: 0 auto;
      }

      .aptis-mock-timer {
        position: fixed;
        top: 100px;
        right: 31px;
        display: grid;
        gap: 2px;
        width: 170px;
        text-align: right;
        z-index: 2;
      }

      .aptis-mock-timer strong {
        color: #191a1e;
        font-size: 31px;
        line-height: 1;
      }

      .aptis-mock-timer span {
        color: #191a1e;
        font-size: 18px;
      }

      .aptis-mock-timer div {
        justify-self: end;
        width: 164px;
        height: 5px;
        margin-top: 7px;
        border-radius: 999px;
        background: #eceaf1;
        overflow: hidden;
      }

      .aptis-mock-timer div span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: var(--aptis-purple);
      }

      .aptis-mock-question-header {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
        gap: 32px;
        margin: 0 0 92px;
      }

      .aptis-mock-question-header p {
        margin: 0 0 16px;
        font-size: 24px;
        font-weight: 700;
      }

      .aptis-mock-question-header h1 {
        margin: 0;
        text-align: left;
        color: #1f2024;
        font-size: 30px;
        line-height: 1.15;
      }

      .aptis-mock-bookmark {
        display: inline-flex;
        align-items: center;
        gap: 24px;
        min-width: 234px;
        min-height: 79px;
        margin-right: 275px;
        padding: 0 28px;
        border: 2px solid #b9b9be;
        border-radius: 8px;
        background: #fff;
        color: #17181c;
        font-size: 21px;
        font-weight: 700;
      }

      .aptis-mock-bookmark.is-active {
        border-color: var(--aptis-purple);
      }

      .aptis-mock-grammar {
        width: min(100%, 1320px);
      }

      .aptis-mock-grammar p {
        margin: 0 0 28px;
        font-size: 22px;
        line-height: 1.35;
      }

      .aptis-mock-placeholder {
        color: #6b7280;
      }

      .aptis-mock-options {
        width: min(100%, 1310px);
        margin-top: 24px;
        display: grid;
        gap: 4px;
      }

      .aptis-mock-options button {
        display: grid;
        grid-template-columns: 98px minmax(0, 1fr);
        align-items: stretch;
        min-height: 93px;
        padding: 0;
        border: 2px solid #d6d6d9;
        border-radius: 0;
        background: #f7f8fb;
        color: #18191d;
        text-align: left;
        overflow: hidden;
      }

      .aptis-mock-options button.is-selected {
        border-color: var(--aptis-purple);
        box-shadow: inset 0 0 0 2px var(--aptis-purple);
      }

      .aptis-mock-options button span {
        display: grid;
        place-items: center;
        border-right: 2px solid #d6d6d9;
        background: #fff;
        font-size: 45px;
        font-weight: 400;
      }

      .aptis-mock-options button strong {
        align-self: center;
        padding: 0 17px;
        font-size: 20px;
        font-weight: 400;
      }

      .aptis-mock-vocabulary {
        width: min(100%, 1040px);
        margin: 0 auto;
      }

      .aptis-mock-vocab-section {
        margin: 0 0 12px;
        color: var(--aptis-purple);
        font-size: 18px;
        font-weight: 800;
      }

      .aptis-mock-vocab-instruction {
        margin: 0 0 24px;
        color: #24252a;
        font-size: 20px;
        font-weight: 700;
        line-height: 1.35;
      }

      .aptis-mock-vocab-form {
        width: min(100%, 1000px);
        margin: 0 auto;
        display: grid;
        gap: 8px;
      }

      .aptis-mock-vocab-row {
        display: grid;
        grid-template-columns: 46px minmax(0, 1fr) 24px 220px;
        align-items: center;
        gap: 8px;
        min-height: 54px;
        padding: 5px 0;
        border-bottom: 1px solid #e5e2ea;
        color: #1f2024;
        font-size: 19px;
      }

      .aptis-mock-vocab-row > span:first-child {
        font-weight: 700;
        text-align: center;
      }

      .aptis-mock-vocab-row strong {
        text-align: left;
        font-size: 19px;
        line-height: 1.35;
      }

      .aptis-mock-vocab-row > span:nth-child(3) {
        text-align: center;
        font-weight: 700;
      }

      .aptis-mock-vocab-row select {
        width: 220px;
        height: 44px;
        padding: 0 8px;
        border: 2px solid #d5d5d8;
        border-radius: 4px;
        background: #fff;
        color: #1f2024;
        font-size: 17px;
      }

      .aptis-mock-vocab-row.is-sentence {
        grid-template-columns: 46px minmax(0, 1fr);
      }

      .aptis-mock-vocab-row.is-sentence > label {
        grid-column: 2;
        color: #1f2024;
        font-size: 19px;
        font-weight: 700;
        line-height: 1.5;
        text-align: right;
      }

      .aptis-mock-vocab-row.is-sentence select {
        display: inline-block;
        margin: 0 7px;
        vertical-align: middle;
      }

      .aptis-mock-footer {
        position: fixed;
        left: 19px;
        right: 19px;
        bottom: 20px;
        z-index: 5;
        min-height: 91px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 14px 13px;
        border-radius: 9px;
        background: #fff;
        box-shadow: 0 0 26px rgba(42, 7, 94, 0.18);
      }

      .aptis-mock-footer-left,
      .aptis-mock-footer-right {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .aptis-mock-icon-btn,
      .aptis-mock-secondary,
      .aptis-mock-primary {
        min-height: 65px;
        border: 2px solid #bdbdc2;
        border-radius: 8px;
        background: #fff;
        color: #17181c;
        font-size: 21px;
        font-weight: 700;
      }

      .aptis-mock-icon-btn {
        width: 68px;
        display: grid;
        place-items: center;
        padding: 0;
      }

      .aptis-mock-secondary,
      .aptis-mock-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 18px;
        min-width: 190px;
        padding: 0 29px;
      }

      .aptis-mock-primary {
        border-color: #3f2674;
        background: var(--aptis-purple);
        color: #fff;
      }

      .aptis-mock-primary.is-start {
        min-width: 262px;
        min-height: 80px;
        border-radius: 8px;
        font-size: 21px;
      }

      .aptis-mock-secondary:disabled,
      .aptis-mock-primary:disabled {
        opacity: 0.45;
        cursor: default;
      }

      .aptis-mock-drawer-backdrop {
        position: fixed;
        inset: 0 0 126px;
        z-index: 10;
        display: flex;
        align-items: flex-start;
        background: rgba(42, 7, 94, 0.12);
      }

      .aptis-mock-question-drawer {
        width: min(92vw, 430px);
        height: 100%;
        padding: 20px 16px 28px;
        overflow-y: auto;
        background: #fff;
        color: #1f2024;
        box-shadow: 14px 0 42px rgba(42, 7, 94, 0.2);
      }

      .aptis-mock-question-drawer > header {
        position: sticky;
        top: -20px;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: -20px -16px 20px;
        padding: 20px 18px 14px;
        background: #fff;
      }

      .aptis-mock-question-drawer h2 {
        margin: 0;
        color: #1f2024;
        text-align: left;
        font-size: 25px;
      }

      .aptis-mock-question-drawer > header button {
        width: 46px;
        height: 46px;
        display: grid;
        place-items: center;
        padding: 0;
        border: 1px solid #c7c7cc;
        background: #fff;
        color: #1f2024;
      }

      .aptis-mock-drawer-filters {
        display: flex;
        gap: 10px;
        margin-bottom: 22px;
      }

      .aptis-mock-drawer-filters button {
        min-height: 48px;
        padding: 0 20px;
        border: 1px solid #d5d2dc;
        border-radius: 999px;
        background: #fff;
        color: #1f2024;
        font-size: 17px;
        font-weight: 700;
      }

      .aptis-mock-drawer-filters button.is-active {
        background: var(--aptis-purple);
        color: #fff;
      }

      .aptis-mock-drawer-instructions,
      .aptis-mock-drawer-section {
        border: 1px solid #dedde2;
        border-radius: 9px;
        background: #fff;
      }

      .aptis-mock-drawer-instructions {
        margin-bottom: 18px;
        padding: 20px;
        font-size: 19px;
        line-height: 1.4;
      }

      .aptis-mock-drawer-section {
        padding: 16px;
      }

      .aptis-mock-drawer-section-heading {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 18px;
      }

      .aptis-mock-drawer-section-heading h3 {
        margin: 0 0 6px;
        color: #1f2024;
        font-size: 21px;
      }

      .aptis-mock-drawer-section-heading p {
        margin: 0;
        font-size: 17px;
      }

      .aptis-mock-drawer-section-heading > span {
        width: 40px;
        height: 40px;
        display: grid;
        place-items: center;
        border-radius: 8px;
        background: #e8e5f5;
        color: var(--aptis-purple);
        font-size: 26px;
        font-weight: 700;
      }

      .aptis-mock-drawer-list {
        display: grid;
        gap: 10px;
      }

      .aptis-mock-drawer-list > button {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 12px;
        min-height: 104px;
        padding: 14px 16px;
        border: 1px solid #dedde2;
        border-radius: 8px;
        background: #fff;
        color: #1f2024;
        text-align: left;
      }

      .aptis-mock-drawer-list > button.is-current {
        border-color: #d8d3e8;
        background: #efedf7;
      }

      .aptis-mock-drawer-list > button strong {
        font-size: 21px;
      }

      .aptis-mock-drawer-bookmark-slot {
        justify-self: end;
      }

      .aptis-mock-drawer-list > button span:last-child {
        justify-self: end;
      }

      .aptis-mock-drawer-empty {
        padding: 24px 8px;
        color: #66616e;
        text-align: center;
      }

      .aptis-mock-results {
        min-height: 100vh;
        padding: 124px 28px 80px;
        background: #f5f3f9;
      }

      .aptis-mock-results-inner {
        width: min(100%, 1120px);
        margin: 0 auto;
      }

      .aptis-mock-results-header {
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 30px;
        color: var(--aptis-purple);
      }

      .aptis-mock-results-header p,
      .aptis-mock-results-header h1 {
        margin: 0;
        color: #211d28;
        text-align: left;
      }

      .aptis-mock-results-header p {
        margin-bottom: 5px;
        font-size: 16px;
        font-weight: 700;
      }

      .aptis-mock-results-header h1 {
        font-size: 38px;
      }

      .aptis-mock-results-header span {
        display: block;
        margin-top: 7px;
        color: #75531b;
      }

      .aptis-mock-score-grid {
        display: grid;
        grid-template-columns: 1.3fr repeat(3, 1fr);
        gap: 14px;
        margin-bottom: 22px;
      }

      .aptis-mock-score-grid article {
        min-height: 142px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 22px;
        border: 1px solid #ded9e7;
        border-radius: 12px;
        background: #fff;
      }

      .aptis-mock-score-grid article.is-total {
        background: var(--aptis-purple);
        color: #fff;
      }

      .aptis-mock-score-grid span {
        font-weight: 700;
      }

      .aptis-mock-score-grid strong {
        margin-top: 8px;
        font-size: 34px;
      }

      .aptis-mock-score-grid small {
        margin-top: 3px;
        font-size: 17px;
      }

      .aptis-mock-feedback-card,
      .aptis-mock-breakdown,
      .aptis-mock-review {
        margin-top: 20px;
        padding: 24px;
        border: 1px solid #ded9e7;
        border-radius: 12px;
        background: #fff;
      }

      .aptis-mock-save-status {
        margin-top: 16px;
        padding: 12px 15px;
        border: 1px solid #dcd6e6;
        border-radius: 9px;
        background: #f6f3fa;
        color: #51475c;
        line-height: 1.45;
      }

      .aptis-mock-save-status:empty {
        display: none;
      }

      .aptis-mock-save-status.is-saved {
        border-color: #c9dfcf;
        background: #eff7f1;
        color: #315e3e;
      }

      .aptis-mock-save-status.is-error {
        border-color: #e4c9c2;
        background: #fbf1ef;
        color: #7a3d32;
      }

      .aptis-mock-feedback-card h2,
      .aptis-mock-breakdown h2,
      .aptis-mock-review h2 {
        margin: 0 0 10px;
        color: #211d28;
        text-align: left;
        font-size: 24px;
      }

      .aptis-mock-feedback-card p {
        margin: 0;
        color: #4c4752;
        font-size: 18px;
        line-height: 1.55;
      }

      .aptis-mock-breakdown > div {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 10px;
      }

      .aptis-mock-breakdown article {
        display: grid;
        gap: 5px;
        padding: 15px;
        border-radius: 9px;
        background: #f5f3f9;
      }

      .aptis-mock-breakdown article span {
        color: #6c6672;
        font-size: 13px;
      }

      .aptis-mock-breakdown article strong {
        font-size: 15px;
      }

      .aptis-mock-breakdown article b {
        color: var(--aptis-purple);
        font-size: 22px;
      }

      .aptis-mock-review details {
        margin-top: 12px;
        border: 1px solid #e1dee7;
        border-radius: 9px;
        overflow: hidden;
      }

      .aptis-mock-review summary {
        padding: 16px 18px;
        background: #f5f3f9;
        font-size: 17px;
        font-weight: 800;
        cursor: pointer;
      }

      .aptis-mock-review-intro {
        margin: 0 0 14px;
        color: #625d67;
        line-height: 1.5;
      }

      .aptis-mock-review-list {
        display: grid;
        gap: 10px;
        padding: 14px;
      }

      .aptis-mock-review-list article {
        padding: 15px;
        border: 1px solid #e1dee7;
        border-left: 3px solid #b9b4c1;
        border-radius: 7px;
        background: #fff;
      }

      .aptis-mock-review-list article.is-correct {
        border-left-color: #79a887;
      }

      .aptis-mock-review-list article.is-incorrect {
        border-left-color: #c6a05d;
      }

      .aptis-mock-review-list article > header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 7px;
      }

      .aptis-mock-review-list article span,
      .aptis-mock-review-list article strong {
        display: block;
      }

      .aptis-mock-review-list article span {
        color: #5d5663;
        font-size: 14px;
        font-weight: 800;
      }

      .aptis-mock-review-list article header b {
        padding: 3px 9px;
        border-radius: 999px;
        background: #f0eef4;
        color: #5c5662;
        font-size: 12px;
      }

      .aptis-mock-review-list article.is-correct header b {
        background: #edf6ef;
        color: #326644;
      }

      .aptis-mock-review-list article.is-incorrect header b {
        background: #faf3e7;
        color: #785b28;
      }

      .aptis-mock-review-list article strong {
        margin-bottom: 9px;
        line-height: 1.4;
      }

      .aptis-mock-review-list article p {
        margin: 3px 0 0;
        color: #4b454c;
      }

      .aptis-mock-review .aptis-mock-answer-explanation {
        margin-top: 12px;
        border: 1px solid #e3dfea;
        background: #faf9fc;
      }

      .aptis-mock-review .aptis-mock-answer-explanation summary {
        padding: 10px 12px;
        background: transparent;
        color: var(--aptis-purple);
        font-size: 15px;
        font-weight: 800;
      }

      .aptis-mock-review .aptis-mock-answer-explanation p {
        margin: 0;
        padding: 0 12px 13px;
        color: #46404b;
        line-height: 1.55;
      }

      .aptis-mock-results-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;
      }

      @media (max-width: 900px) {
        .aptis-mock-score-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .aptis-mock-breakdown > div {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .aptis-mock-menu-grid {
          grid-template-columns: 1fr;
        }

        .aptis-mock-menu-grid button {
          min-height: 180px;
        }

        .aptis-mock-start-copy {
          padding: 120px 24px 0;
        }

        .aptis-mock-paper {
          padding-inline: 24px;
        }

        .aptis-mock-question-header {
          grid-template-columns: 1fr;
          margin-bottom: 58px;
        }

        .aptis-mock-bookmark {
          margin-right: 0;
          min-width: 0;
          width: fit-content;
        }

        .aptis-mock-timer {
          position: static;
          justify-self: end;
          margin: 0 0 40px auto;
        }

        .aptis-mock-paper.is-vocabulary .aptis-mock-timer {
          margin: 0 0 24px auto;
        }

        .aptis-mock-vocab-form {
          margin-left: 0;
        }

        .aptis-mock-footer {
          left: 8px;
          right: 8px;
          bottom: 8px;
          flex-wrap: wrap;
        }
      }

      @media (max-height: 760px) and (min-width: 760px) {
        .aptis-mock-paper {
          min-height: calc(100vh - 84px);
          padding-top: 108px;
          padding-bottom: 118px;
        }

        .aptis-mock-paper.is-instructions {
          padding-top: 108px;
        }

        .aptis-mock-question-header {
          margin-bottom: 44px;
        }

        .aptis-mock-question-header p {
          margin-bottom: 10px;
          font-size: 22px;
        }

        .aptis-mock-question-header h1 {
          font-size: 28px;
        }

        .aptis-mock-bookmark {
          min-height: 64px;
        }

        .aptis-mock-grammar p {
          margin-bottom: 20px;
        }

        .aptis-mock-options button {
          min-height: 78px;
        }

        .aptis-mock-vocab-instruction {
          margin-bottom: 34px;
        }

        .aptis-mock-vocab-form {
          gap: 10px;
        }

        .aptis-mock-vocab-row select {
          height: 36px;
        }

        .aptis-mock-footer {
          bottom: 12px;
          min-height: 78px;
          padding-block: 8px;
        }

        .aptis-mock-icon-btn,
        .aptis-mock-secondary,
        .aptis-mock-primary {
          min-height: 62px;
        }
      }

      @media (max-width: 640px) {
        .aptis-mock-portal-header {
          min-height: 74px;
          padding: 8px 14px;
        }

        .aptis-mock-portal-logo {
          width: 50px;
          height: 50px;
        }

        .aptis-mock-home-button {
          min-height: 42px;
          padding: 0 12px;
        }

        .aptis-mock-profile-button {
          width: 44px;
          min-height: 44px;
        }

        .aptis-mock-results {
          padding: 104px 16px 56px;
        }

        .aptis-mock-results-header {
          align-items: flex-start;
        }

        .aptis-mock-results-header h1 {
          font-size: 31px;
        }

        .aptis-mock-score-grid,
        .aptis-mock-breakdown > div {
          grid-template-columns: 1fr;
        }

        .aptis-mock-score-grid article {
          min-height: 112px;
        }

        .aptis-mock-results-actions {
          flex-direction: column-reverse;
        }

        .aptis-mock-results-actions button {
          width: 100%;
        }

        .aptis-mock-menu-copy {
          padding: 118px 20px 48px;
        }

        .aptis-mock-menu-grid {
          margin-top: 34px;
        }

        .aptis-mock-start-actions {
          flex-direction: column-reverse;
          align-items: stretch;
        }

        .aptis-mock-start-copy dl,
        .aptis-mock-footer,
        .aptis-mock-footer-left,
        .aptis-mock-footer-right {
          gap: 8px;
        }

        .aptis-mock-start-copy dl {
          flex-direction: column;
        }

        .aptis-mock-options button {
          grid-template-columns: 64px minmax(0, 1fr);
          min-height: 76px;
        }

        .aptis-mock-options button span {
          font-size: 32px;
        }

        .aptis-mock-vocab-form {
          width: 100%;
        }

        .aptis-mock-vocab-row {
          grid-template-columns: 34px minmax(0, 1fr);
          gap: 5px 8px;
          font-size: 18px;
        }

        .aptis-mock-vocab-row strong {
          font-size: 18px;
        }

        .aptis-mock-vocab-row > span:nth-child(3) {
          display: none;
        }

        .aptis-mock-vocab-row select {
          grid-column: 2;
          width: 100%;
        }

        .aptis-mock-vocab-row.is-sentence > label {
          text-align: left;
        }

        .aptis-mock-vocab-row.is-sentence select {
          display: block;
          width: 100%;
          margin: 8px 0;
        }

        .aptis-mock-secondary,
        .aptis-mock-primary {
          min-width: 134px;
          padding-inline: 16px;
          font-size: 17px;
        }

        .aptis-mock-icon-btn {
          width: 56px;
        }
      }
    `}</style>
  );
}
