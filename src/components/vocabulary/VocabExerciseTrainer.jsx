import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Star } from "lucide-react";
import Seo from "../common/Seo.jsx";
import AptisDemoBadge from "../access/AptisDemoBadge.jsx";
import {
  VOCAB_EXERCISE_TYPES,
  VOCAB_WORD_CLASSES,
  vocabExerciseTasks,
} from "./data/vocabExerciseBank.js";
import { toast } from "../../utils/toast";
import {
  auth,
  clearVocabExerciseMistakes,
  fetchSeenVocabExerciseTaskIds,
  fetchVocabExerciseFavourites,
  fetchVocabExerciseItemFavourites,
  fetchVocabExerciseMistakes,
  logVocabExerciseCompleted,
  logVocabExerciseReviewLoaded,
  logVocabExerciseStarted,
  recordVocabExerciseMistake,
  removeVocabExerciseFavourite,
  removeVocabExerciseItemFavourite,
  saveVocabExerciseFavourite,
  saveVocabExerciseItemFavourite,
  saveVocabExerciseTaskResult,
  sendReport,
} from "../../firebase";

const SESSION_SIZES = [1, 2, 3, 5];
const REPORT_REASONS = [
  { value: "answer_problem", label: "Answer problem" },
  { value: "ambiguous", label: "Ambiguous item" },
  { value: "typo", label: "Typo or wording" },
  { value: "feedback_problem", label: "Feedback problem" },
  { value: "Other", label: "Other" },
];

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function labelForType(type) {
  if (type === "gap-fill") return "Gap-fill";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function labelForWordClass(wordClass) {
  if (wordClass === "mixed") return "Mixed";
  return wordClass.charAt(0).toUpperCase() + wordClass.slice(1);
}

function buildTypeSummary(tasks) {
  const counts = tasks.reduce((acc, task) => {
    acc[task.type] = (acc[task.type] || 0) + 1;
    return acc;
  }, {});

  return VOCAB_EXERCISE_TYPES.map((type) => `${labelForType(type)}: ${counts[type] || 0}`).join(" · ");
}

function getQuestionText(task, question) {
  if (task.type !== "gap-fill") return question.prompt;
  const [before, after = ""] = question.sentence.split("___");
  return (
    <>
      {before}
      <strong className="blank">_____</strong>
      {after}
    </>
  );
}

function randomiseTaskOptions(task) {
  return {
    ...task,
    options: shuffle(task.options),
  };
}

function canonicalTaskId(task) {
  return task.sourceTaskId || task.id;
}

function dedupeTasks(tasks) {
  const seen = new Set();
  return tasks.filter((task) => {
    if (!task?.id || seen.has(task.id)) return false;
    seen.add(task.id);
    return true;
  });
}

function buildTaskTags(task) {
  return [task.type, task.wordClass].filter(Boolean).join(",");
}

function buildTaskPayload(task) {
  const sourceTask = task.sourceTask || task;
  return {
    taskId: canonicalTaskId(task),
    type: task.type,
    title: sourceTask.title || task.title,
    wordClass: task.wordClass,
    tags: buildTaskTags(task),
    task: sourceTask,
  };
}

function buildItemFavouriteId(task, question) {
  return `${canonicalTaskId(task)}__${question.id}`;
}

function buildItemFavouritePayload(task, question) {
  const sourceTask = task.sourceTask || task;
  const taskId = canonicalTaskId(task);
  return {
    itemId: buildItemFavouriteId(task, question),
    taskId,
    questionId: question.id,
    type: task.type,
    title: sourceTask.title || task.title,
    wordClass: task.wordClass,
    tags: buildTaskTags(task),
    question,
    task: sourceTask,
  };
}

function buildQuestionReviewTasks(entries, suffix, titleSuffix, instructionSuffix) {
  const byTaskId = new Map();

  entries.forEach((entry) => {
    const sourceTask = entry.task;
    const sourceTaskId = entry.taskId || sourceTask?.id;
    const questionIds = Array.isArray(entry.questionIds)
      ? entry.questionIds
      : Array.isArray(entry.wrongQuestions)
        ? entry.wrongQuestions.map((question) => question.questionId)
        : entry.questionId
          ? [entry.questionId]
          : [];

    if (!sourceTask || !sourceTaskId || !questionIds.length) return;

    const current = byTaskId.get(sourceTaskId) || {
      sourceTask,
      questionIds: new Set(),
    };

    questionIds.filter(Boolean).forEach((questionId) => current.questionIds.add(questionId));
    byTaskId.set(sourceTaskId, current);
  });

  return Array.from(byTaskId.entries())
    .map(([sourceTaskId, entry]) => {
      const questions = entry.sourceTask.questions.filter((question) => entry.questionIds.has(question.id));
      if (!questions.length) return null;

      return {
        ...entry.sourceTask,
        id: `${sourceTaskId}__${suffix}`,
        sourceTaskId,
        sourceTask: entry.sourceTask,
        title: `${entry.sourceTask.title}: ${titleSuffix}`,
        instruction: `${entry.sourceTask.instruction} ${instructionSuffix}`,
        questions,
        isQuestionReview: true,
      };
    })
    .filter(Boolean);
}

function buildMistakeReviewTasks(mistakes) {
  return buildQuestionReviewTasks(mistakes, "mistakes", "mistakes", "Review only the questions you missed last time.")
    .map((task) => ({ ...task, isMistakeReview: true }));
}

function buildFavouriteItemReviewTasks(itemFavourites) {
  return buildQuestionReviewTasks(itemFavourites, "favourites", "favourites", "Review only your saved questions.");
}

function formatReportQuestion(task) {
  const optionList = task.options.map((option) => option.text).join(", ");
  const questionLines = task.questions.map((question, index) => {
    const prompt = question.prompt || question.sentence || "";
    return `${index + 1}. ${prompt} = ${question.answer}`;
  });

  return [
    `Vocabulary exercise task: ${task.title}`,
    `Task ID: ${task.id}`,
    `Type: ${task.type}`,
    `Word class: ${task.wordClass}`,
    `Options: ${optionList}`,
    "",
    questionLines.join("\n"),
  ].join("\n");
}

function formatSelectedAnswers(task, taskAnswers = {}) {
  return task.questions
    .map((question, index) => {
      const selectedLetter = taskAnswers[question.id] || "";
      const selected = task.options.find((option) => option.letter === selectedLetter)?.text || "No answer";
      return `${index + 1}. ${selected}`;
    })
    .join(" / ");
}

export default function VocabExerciseTrainer({ user, aptisAccess, onSignIn }) {
  const navigate = useNavigate();
  const completionLoggedRef = useRef(false);
  const signedIn = !!(user || auth.currentUser);
  const [selectedTypes, setSelectedTypes] = useState(["synonyms", "definitions", "collocations", "gap-fill"]);
  const [selectedWordClasses, setSelectedWordClasses] = useState(["noun", "verb", "adjective", "mixed"]);
  const [sessionSize, setSessionSize] = useState(2);
  const [sessionTasks, setSessionTasks] = useState([]);
  const [answers, setAnswers] = useState({});
  const [checkedTasks, setCheckedTasks] = useState({});
  const [loadingUserState, setLoadingUserState] = useState(true);
  const [seenTaskIds, setSeenTaskIds] = useState(new Set());
  const [favouriteIds, setFavouriteIds] = useState(new Set());
  const [favouriteItemIds, setFavouriteItemIds] = useState(new Set());
  const [reportReason, setReportReason] = useState("");
  const [reportComment, setReportComment] = useState("");
  const [sendingReport, setSendingReport] = useState(false);

  const filteredPool = useMemo(() => {
    return vocabExerciseTasks.filter((task) => {
      const typeMatch = selectedTypes.includes(task.type);
      const classMatch = selectedWordClasses.includes(task.wordClass);
      return typeMatch && classMatch;
    });
  }, [selectedTypes, selectedWordClasses]);

  const totalQuestions = sessionTasks.reduce((sum, task) => sum + task.questions.length, 0);
  const checkedQuestions = sessionTasks.reduce(
    (sum, task) => sum + (checkedTasks[task.id] ? task.questions.length : 0),
    0
  );
  const score = sessionTasks.reduce((sum, task) => {
    if (!checkedTasks[task.id]) return sum;
    const taskAnswers = answers[task.id] || {};
    return sum + task.questions.filter((question) => taskAnswers[question.id] === question.answerLetter).length;
  }, 0);

  useEffect(() => {
    let cancelled = false;

    async function loadUserState() {
      setLoadingUserState(true);
      try {
        const [seenIds, favourites, itemFavourites] = await Promise.all([
          signedIn ? fetchSeenVocabExerciseTaskIds() : Promise.resolve([]),
          signedIn ? fetchVocabExerciseFavourites() : Promise.resolve([]),
          signedIn ? fetchVocabExerciseItemFavourites() : Promise.resolve([]),
        ]);

        if (cancelled) return;
        setSeenTaskIds(new Set(seenIds));
        setFavouriteIds(new Set(favourites.map((entry) => entry.taskId || entry.id).filter(Boolean)));
        setFavouriteItemIds(new Set(itemFavourites.map((entry) => entry.itemId || entry.id).filter(Boolean)));
      } catch (error) {
        console.error("[VocabExerciseTrainer] Could not load user state", error);
        if (!cancelled) toast("Could not load your vocabulary exercise progress.");
      } finally {
        if (!cancelled) setLoadingUserState(false);
      }
    }

    loadUserState();
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  useEffect(() => {
    if (!sessionTasks.length || checkedQuestions !== totalQuestions || completionLoggedRef.current) return;

    completionLoggedRef.current = true;
    logVocabExerciseCompleted({
      totalTasks: sessionTasks.length,
      totalQuestions,
      correct: score,
    });
  }, [checkedQuestions, score, sessionTasks, totalQuestions]);

  function toggleType(type) {
    setSelectedTypes((current) => {
      if (current.includes(type)) return current.filter((entry) => entry !== type);
      return [...current, type];
    });
  }

  function toggleWordClass(wordClass) {
    setSelectedWordClasses((current) => {
      if (current.includes(wordClass)) return current.filter((entry) => entry !== wordClass);
      return [...current, wordClass];
    });
  }

  function generateSession() {
    const unseen = filteredPool.filter((task) => !seenTaskIds.has(task.id));
    const seen = filteredPool.filter((task) => seenTaskIds.has(task.id));
    const nextTasks = [...shuffle(unseen), ...shuffle(seen)].slice(0, sessionSize).map(randomiseTaskOptions);
    completionLoggedRef.current = false;
    setSessionTasks(nextTasks);
    setAnswers({});
    setCheckedTasks({});
    closeReportForm();
    logVocabExerciseStarted({
      mode: "normal",
      totalTasks: nextTasks.length,
    });
  }

  function chooseAnswer(taskId, questionId, letter) {
    if (checkedTasks[taskId]) return;
    setAnswers((current) => ({
      ...current,
      [taskId]: {
        ...(current[taskId] || {}),
        [questionId]: letter,
      },
    }));
  }

  async function checkTask(task) {
    const taskAnswers = answers[task.id] || {};
    const allAnswered = task.questions.every((question) => taskAnswers[question.id]);
    if (!allAnswered) return;

    const wrongQuestions = task.questions
      .filter((question) => taskAnswers[question.id] !== question.answerLetter)
      .map((question) => ({
        questionId: question.id,
        prompt: question.prompt || question.sentence || "",
        selectedLetter: taskAnswers[question.id] || "",
        selectedAnswer: task.options.find((option) => option.letter === taskAnswers[question.id])?.text || "",
        answerLetter: question.answerLetter,
        answer: question.answer,
      }));
    const taskScore = task.questions.length - wrongQuestions.length;
    const isPerfect = wrongQuestions.length === 0;
    const taskId = canonicalTaskId(task);

    setCheckedTasks((current) => ({ ...current, [task.id]: true }));
    setSeenTaskIds((current) => new Set([...current, taskId]));

    if (!signedIn) return;

    try {
      if (!task.isQuestionReview) {
        await saveVocabExerciseTaskResult({
          taskId,
          tags: buildTaskTags(task),
          score: taskScore,
          total: task.questions.length,
          isPerfect,
        });
      }

      if (isPerfect) {
        if (!task.isQuestionReview || task.isMistakeReview) {
          await clearVocabExerciseMistakes(taskId);
        }
      } else {
        if (task.isMistakeReview) {
          await clearVocabExerciseMistakes(taskId);
        }
        await recordVocabExerciseMistake({
          ...buildTaskPayload(task),
          score: taskScore,
          total: task.questions.length,
          wrongQuestions,
        });
      }
    } catch (error) {
      console.error("[VocabExerciseTrainer] Could not save task result", error);
      toast("Could not save this vocabulary task result.");
    }
  }

  async function toggleFavourite(task) {
    if (!signedIn) {
      toast("Sign in to save favourite vocabulary tasks.");
      return;
    }

    const taskId = canonicalTaskId(task);
    const isFavourite = favouriteIds.has(taskId);
    try {
      if (isFavourite) {
        await removeVocabExerciseFavourite(taskId);
        setFavouriteIds((current) => {
          const next = new Set(current);
          next.delete(taskId);
          return next;
        });
        toast("Removed from favourites.");
      } else {
        await saveVocabExerciseFavourite(buildTaskPayload(task));
        setFavouriteIds((current) => new Set([...current, taskId]));
        toast("Added to favourites.");
      }
    } catch (error) {
      console.error("[VocabExerciseTrainer] Could not update favourite", error);
      toast("Could not update favourites.");
    }
  }

  async function toggleQuestionFavourite(task, question) {
    if (!signedIn) {
      toast("Sign in to save favourite vocabulary questions.");
      return;
    }

    const itemId = buildItemFavouriteId(task, question);
    const isFavourite = favouriteItemIds.has(itemId);
    try {
      if (isFavourite) {
        await removeVocabExerciseItemFavourite(itemId);
        setFavouriteItemIds((current) => {
          const next = new Set(current);
          next.delete(itemId);
          return next;
        });
        toast("Removed question from favourites.");
      } else {
        await saveVocabExerciseItemFavourite(buildItemFavouritePayload(task, question));
        setFavouriteItemIds((current) => new Set([...current, itemId]));
        toast("Added question to favourites.");
      }
    } catch (error) {
      console.error("[VocabExerciseTrainer] Could not update question favourite", error);
      toast("Could not update question favourite.");
    }
  }

  async function loadFavouriteSession() {
    if (!signedIn) {
      toast("Sign in to review favourite vocabulary tasks.");
      return;
    }
    try {
      const [favourites, itemFavourites] = await Promise.all([
        fetchVocabExerciseFavourites(),
        fetchVocabExerciseItemFavourites(),
      ]);
      const fullTaskFavourites = favourites.map((entry) => entry.task).filter(Boolean);
      const itemTasks = buildFavouriteItemReviewTasks(itemFavourites);
      const tasks = dedupeTasks([...fullTaskFavourites, ...itemTasks]);
      if (!tasks.length) {
        toast("No favourite vocabulary exercise tasks or questions yet.");
        return;
      }
      const nextTasks = shuffle(tasks).slice(0, sessionSize).map(randomiseTaskOptions);
      completionLoggedRef.current = false;
      setSessionTasks(nextTasks);
      setAnswers({});
      setCheckedTasks({});
      closeReportForm();
      await logVocabExerciseReviewLoaded({
        mode: "favourites",
        totalTasks: nextTasks.length,
      });
    } catch (error) {
      console.error("[VocabExerciseTrainer] Could not load favourites", error);
      toast("Could not load favourite vocabulary tasks.");
    }
  }

  async function loadMistakeSession() {
    if (!signedIn) {
      toast("Sign in to review vocabulary mistakes.");
      return;
    }
    try {
      const mistakes = await fetchVocabExerciseMistakes(50);
      const tasks = buildMistakeReviewTasks(mistakes);
      if (!tasks.length) {
        toast("No vocabulary exercise mistakes yet.");
        return;
      }
      const nextTasks = tasks.slice(0, sessionSize).map(randomiseTaskOptions);
      completionLoggedRef.current = false;
      setSessionTasks(nextTasks);
      setAnswers({});
      setCheckedTasks({});
      closeReportForm();
      await logVocabExerciseReviewLoaded({
        mode: "mistakes",
        totalTasks: nextTasks.length,
      });
    } catch (error) {
      console.error("[VocabExerciseTrainer] Could not load mistakes", error);
      toast("Could not load vocabulary mistake tasks.");
    }
  }

  function closeReportForm() {
    setReportReason("");
    setReportComment("");
  }

  async function handleSendReport(task, nextReportReason = reportReason, nextReportComment = reportComment) {
    if (!nextReportReason || sendingReport || !task) return false;

    const taskAnswers = answers[task.id] || {};
    setSendingReport(true);
    try {
      await sendReport({
        itemId: task.id,
        question: formatReportQuestion(task),
        issue: nextReportReason === "Other" ? "other" : nextReportReason,
        comments: nextReportComment.trim(),
        level: task.wordClass || null,
        selectedOption: formatSelectedAnswers(task, taskAnswers),
        correctOption: task.questions.map((question, index) => `${index + 1}. ${question.answer}`).join(" / "),
      });

      toast(
        auth.currentUser?.email
          ? `Thanks — we emailed a copy to ${auth.currentUser.email}.`
          : "Thanks — your report was sent."
      );

      closeReportForm();
      return true;
    } catch (error) {
      console.error("[VocabExerciseTrainer] report failed", error);
      toast("Sorry — failed to send. Please try again.");
      return false;
    } finally {
      setSendingReport(false);
    }
  }

  return (
    <div className="vocab-exercise-page game-wrapper">
      <Seo
        title="Vocabulary Exercise Trainer | Seif Aptis Trainer"
        description="Generate Aptis vocabulary tasks with five questions sharing one option bank."
      />

      <button className="topbar-btn" onClick={() => navigate("/vocabulary")}>
        ← Back to Vocabulary Menu
      </button>

      <header className="vocab-exercise-header">
        <h1>Vocabulary Exercise Trainer</h1>
        <p>
          Generate Aptis-style vocabulary tasks: five questions with the same ten-option word bank.
        </p>
      </header>

      <AptisDemoBadge user={user} aptisAccess={aptisAccess} onSignIn={onSignIn} />

      <section className="vocab-exercise-setup card gapfill-card">
        <div className="vocab-exercise-filter-grid">
          <fieldset className="levels-fieldset">
            <legend>Exercise types:</legend>
            <div className="level-row">
              {VOCAB_EXERCISE_TYPES.map((type) => {
                const selected = selectedTypes.includes(type);
                return (
                  <label
                    key={type}
                    className={`level-chip vocab-type-chip ${selected ? "selected" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleType(type)}
                    />
                    <span className="dot" aria-hidden="true" />
                    <span className="txt">{labelForType(type)}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="levels-fieldset">
            <legend>Word class:</legend>
            <div className="level-row">
              {VOCAB_WORD_CLASSES.map((wordClass) => {
                const selected = selectedWordClasses.includes(wordClass);
                return (
                  <label
                    key={wordClass}
                    className={`level-chip vocab-class-chip ${selected ? "selected" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleWordClass(wordClass)}
                    />
                    <span className="dot" aria-hidden="true" />
                    <span className="txt">{labelForWordClass(wordClass)}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <label className="vocab-exercise-count">
            Number of tasks
            <span className="select-wrap">
              <select
                className="select"
                value={sessionSize}
                onChange={(event) => setSessionSize(Number(event.target.value))}
              >
                {SESSION_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size} task{size === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
            </span>
          </label>
        </div>

        <div className="vocab-exercise-actions">
          <button
            className="generate-btn"
            type="button"
            onClick={generateSession}
            disabled={!filteredPool.length || !selectedTypes.length || !selectedWordClasses.length}
          >
            Generate Tasks
          </button>
          <button
            className="review-btn mistakes"
            type="button"
            onClick={loadMistakeSession}
            disabled={loadingUserState || !signedIn}
          >
            Review Mistakes
          </button>
          <button
            className="review-btn favourites"
            type="button"
            onClick={loadFavouriteSession}
            disabled={loadingUserState || !signedIn}
          >
            Review Favourites
          </button>
          <p>
            Pool: <strong>{filteredPool.length}</strong> tasks · {buildTypeSummary(filteredPool)}
          </p>
        </div>
      </section>

      {sessionTasks.length ? (
        <p className="vocab-exercise-progress">
          Progress: {checkedQuestions} / {totalQuestions} questions checked · Correct: {score} / {totalQuestions}
        </p>
      ) : (
        <p className="vocab-exercise-empty">
          Choose your filters and generate a set to begin.
          {signedIn ? " Untested tasks are prioritised when possible." : " Sign in to save progress, mistakes, and favourites."}
        </p>
      )}

      <div className="vocab-exercise-list">
        {sessionTasks.map((task, index) => (
          <VocabularyTaskCard
            key={task.id}
            task={task}
            index={index}
            answers={answers[task.id] || {}}
            checked={!!checkedTasks[task.id]}
            isFavourite={favouriteIds.has(canonicalTaskId(task))}
            favouriteItemIds={favouriteItemIds}
            sendingReport={sendingReport}
            onChoose={(questionId, letter) => chooseAnswer(task.id, questionId, letter)}
            onCheck={() => checkTask(task)}
            onToggleFavourite={() => toggleFavourite(task)}
            onToggleQuestionFavourite={(question) => toggleQuestionFavourite(task, question)}
            onSendReport={(nextReportReason, nextReportComment) =>
              handleSendReport(task, nextReportReason, nextReportComment)
            }
          />
        ))}
      </div>

      <VocabExerciseStyles />
    </div>
  );
}

function VocabularyTaskCard({
  task,
  index,
  answers,
  checked,
  isFavourite,
  favouriteItemIds,
  sendingReport,
  onChoose,
  onCheck,
  onToggleFavourite,
  onToggleQuestionFavourite,
  onSendReport,
}) {
  const [reportOpen, setReportOpen] = useState(false);
  const [localReportReason, setLocalReportReason] = useState("");
  const [localReportComment, setLocalReportComment] = useState("");
  const allAnswered = task.questions.every((question) => answers[question.id]);
  const taskScore = task.questions.filter((question) => answers[question.id] === question.answerLetter).length;

  function toggleReportForm() {
    setReportOpen((open) => !open);
    setLocalReportReason("");
    setLocalReportComment("");
  }

  function closeLocalReportForm() {
    setReportOpen(false);
    setLocalReportReason("");
    setLocalReportComment("");
  }

  async function sendLocalReport() {
    const sent = await onSendReport(localReportReason, localReportComment);
    if (sent) closeLocalReportForm();
  }

  return (
    <article className="card gapfill-card vocab-exercise-card">
      <div className="card-header vocab-exercise-card-head">
        <div>
          <span className="vocab-exercise-number">Task {index + 1}</span>
          <span className="vocab-mini-tag">{labelForType(task.type)}</span>
          <span className="vocab-mini-tag ghost">{labelForWordClass(task.wordClass)}</span>
        </div>
        <div className="vocab-task-card-actions">
          <span className="vocab-exercise-title">{task.title}</span>
          <button
            className="vocab-report-btn"
            type="button"
            onClick={toggleReportForm}
            title="Report a problem"
          >
            <AlertCircle size={17} />
            <span>Report</span>
          </button>
          <button
            className={`fav-btn ${isFavourite ? "active" : ""}`}
            type="button"
            onClick={onToggleFavourite}
            aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
            title={isFavourite ? "Remove from favourites" : "Add to favourites"}
          >
            <Star size={18} fill={isFavourite ? "#ffd36a" : "none"} stroke={isFavourite ? "#ffd36a" : "currentColor"} />
          </button>
        </div>
      </div>

      {reportOpen ? (
        <div className="vocab-report-bar">
          <div className="vocab-report-fields">
            <select
              className="select"
              value={localReportReason}
              onChange={(event) => setLocalReportReason(event.target.value)}
            >
              <option value="">-- select problem --</option>
              {REPORT_REASONS.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>

            <textarea
              className="vocab-report-input"
              placeholder="Add details (optional)..."
              value={localReportComment}
              onChange={(event) => setLocalReportComment(event.target.value)}
              rows={3}
            />
          </div>

          <div className="vocab-report-actions">
            <button className="review-btn" type="button" onClick={sendLocalReport} disabled={!localReportReason || sendingReport}>
              {sendingReport ? "Sending..." : "Send report"}
            </button>
            <button className="review-btn secondary" type="button" onClick={closeLocalReportForm}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <p className="vocab-exercise-instruction">{task.instruction}</p>

      {task.example ? (
        <p className="vocab-exercise-example">
          Example: <strong>{task.example.prompt}</strong> = {task.example.answer}
        </p>
      ) : null}

      <div className="vocab-task-layout">
        <div className="vocab-task-questions">
          {task.questions.map((question, questionIndex) => {
            const selectedLetter = answers[question.id] || "";
            const isCorrect = selectedLetter === question.answerLetter;
            const itemFavouriteId = buildItemFavouriteId(task, question);
            const isQuestionFavourite = favouriteItemIds.has(itemFavouriteId);
            return (
              <div
                key={question.id}
                className={`vocab-task-row ${checked ? (isCorrect ? "is-correct" : "is-wrong") : ""}`}
              >
                <span className="vocab-task-number">{questionIndex + 1}</span>
                <p>{getQuestionText(task, question)}</p>
                <div className="vocab-task-answer-controls">
                  <span className="select-wrap vocab-task-select-wrap">
                    <select
                      className="select"
                      value={selectedLetter}
                      onChange={(event) => onChoose(question.id, event.target.value)}
                      disabled={checked}
                    >
                      <option value="">Choose</option>
                      {task.options.map((option) => (
                        <option key={`${question.id}-${option.letter}`} value={option.letter}>
                          {option.text}
                        </option>
                      ))}
                    </select>
                  </span>
                  <button
                    className={`fav-btn vocab-question-fav ${isQuestionFavourite ? "active" : ""}`}
                    type="button"
                    onClick={() => onToggleQuestionFavourite(question)}
                    aria-label={isQuestionFavourite ? "Remove question from favourites" : "Add question to favourites"}
                    title={isQuestionFavourite ? "Remove question from favourites" : "Add question to favourites"}
                  >
                    <Star size={17} fill={isQuestionFavourite ? "#ffd36a" : "none"} stroke={isQuestionFavourite ? "#ffd36a" : "currentColor"} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="vocab-task-actions">
        <button className="review-btn" type="button" onClick={onCheck} disabled={!allAnswered || checked}>
          {checked ? `Checked: ${taskScore}/${task.questions.length}` : "Check task"}
        </button>
        {!allAnswered && !checked ? (
          <p>Answer all five questions before checking.</p>
        ) : null}
      </div>

      {checked ? (
        <div className="explanation vocab-exercise-feedback">
          <p className="explanation-title">Task feedback: {taskScore} / {task.questions.length}</p>
          <div className="vocab-feedback-list">
            {task.questions.map((question, questionIndex) => {
              const selectedLetter = answers[question.id] || "";
              const selectedOption = task.options.find((option) => option.letter === selectedLetter);
              const synonymFeedback = task.type === "synonyms" ? question.feedback : null;
              const definitionFeedback = task.type === "definitions" ? question.feedback : null;
              const gapFillFeedback = task.type === "gap-fill" ? question.feedback : null;
              return (
                <div
                  key={`${question.id}-feedback`}
                  className={`vocab-feedback-row ${selectedLetter === question.answerLetter ? "is-correct" : "is-wrong"}`}
                >
                  <strong>{questionIndex + 1}. {selectedLetter === question.answerLetter ? "Correct" : "Review"}</strong>
                  <p>
                    Your answer: {selectedOption ? selectedOption.text : "—"} · Best answer: {question.answer}
                  </p>
                  {synonymFeedback ? (
                    <>
                      <p>
                        <strong>Core meaning:</strong> {synonymFeedback.coreMeaning}
                      </p>
                      {synonymFeedback.usageNote ? (
                        <p>
                          <strong>Usage:</strong> {synonymFeedback.usageNote}
                        </p>
                      ) : null}
                      {synonymFeedback.commonPatterns?.length ? (
                        <p>
                          <strong>Common patterns:</strong> {synonymFeedback.commonPatterns.join(" · ")}
                        </p>
                      ) : null}
                      {synonymFeedback.nuanceNote ? (
                        <p>
                          <strong>Nuance:</strong> {synonymFeedback.nuanceNote}
                        </p>
                      ) : null}
                      {synonymFeedback.exampleWithSynonym ? (
                        <p className="vocab-example-sentence">Synonym example: {synonymFeedback.exampleWithSynonym}</p>
                      ) : null}
                    </>
                  ) : definitionFeedback ? (
                    <>
                      <p>
                        <strong>Meaning:</strong> {definitionFeedback.meaning}
                      </p>
                      {definitionFeedback.usageNote ? (
                        <p>
                          <strong>Usage:</strong> {definitionFeedback.usageNote}
                        </p>
                      ) : null}
                      {definitionFeedback.commonPatterns?.length ? (
                        <p>
                          <strong>Common patterns:</strong> {definitionFeedback.commonPatterns.join(" · ")}
                        </p>
                      ) : null}
                      {definitionFeedback.contrastNote ? (
                        <p>
                          <strong>Watch out:</strong> {definitionFeedback.contrastNote}
                        </p>
                      ) : null}
                    </>
                  ) : gapFillFeedback ? (
                    <>
                      <p>
                        <strong>Meaning in context:</strong> {gapFillFeedback.meaningInContext}
                      </p>
                      {gapFillFeedback.whyItFits ? (
                        <p>
                          <strong>Why it fits:</strong> {gapFillFeedback.whyItFits}
                        </p>
                      ) : null}
                      {gapFillFeedback.commonPattern ? (
                        <p>
                          <strong>Common pattern:</strong> {gapFillFeedback.commonPattern}
                        </p>
                      ) : null}
                      {gapFillFeedback.usageNote ? (
                        <p>
                          <strong>Usage:</strong> {gapFillFeedback.usageNote}
                        </p>
                      ) : null}
                      {gapFillFeedback.contrastNote ? (
                        <p>
                          <strong>Watch out:</strong> {gapFillFeedback.contrastNote}
                        </p>
                      ) : null}
                      {gapFillFeedback.completedSentence ? (
                        <p className="vocab-example-sentence">Completed sentence: {gapFillFeedback.completedSentence}</p>
                      ) : null}
                      {gapFillFeedback.extraExample ? (
                        <p className="vocab-example-sentence">Extra example: {gapFillFeedback.extraExample}</p>
                      ) : null}
                    </>
                  ) : (
                    <p>
                      <strong>{task.type === "collocations" ? "Definition" : "Explanation"}:</strong>{" "}
                      {question.explanation}
                    </p>
                  )}
                  {!gapFillFeedback ? (
                    <p className="vocab-example-sentence">Example: {question.exampleSentence}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function VocabExerciseStyles() {
  return (
    <style>{`
      .vocab-exercise-page {
        display: grid;
        gap: 1rem;
        max-width: 100%;
        min-width: 0;
        overflow-x: hidden;
      }

      .vocab-exercise-header {
        display: grid;
        gap: .35rem;
      }

      .vocab-exercise-header h1 {
        color: var(--color-accent);
        text-align: left;
        font-size: clamp(1.55rem, 5vw, 2.35rem);
        line-height: 1.08;
        overflow-wrap: anywhere;
      }

      .vocab-exercise-header p,
      .vocab-exercise-empty,
      .vocab-exercise-setup p {
        color: var(--color-text-soft);
        line-height: 1.48;
        overflow-wrap: anywhere;
      }

      .vocab-exercise-setup,
      .vocab-exercise-card,
      .vocab-exercise-list {
        display: grid;
        gap: 1rem;
      }

      .vocab-exercise-filter-grid {
        display: grid;
        gap: 1rem;
        min-width: 0;
      }

      .vocab-exercise-count,
      .vocab-exercise-actions,
      .vocab-task-actions {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: .75rem 1rem;
      }

      .vocab-exercise-count {
        color: var(--color-text);
        font-weight: 700;
        min-width: 0;
      }

      .vocab-exercise-actions {
        justify-content: space-between;
        min-width: 0;
      }

      .vocab-exercise-actions p,
      .vocab-exercise-note,
      .vocab-task-actions p {
        margin: 0;
        color: var(--color-text-soft);
        font-size: .93rem;
        min-width: 0;
        overflow-wrap: anywhere;
      }

      .vocab-exercise-page .levels-fieldset,
      .vocab-exercise-page .level-row {
        min-width: 0;
      }

      .vocab-exercise-page .level-row {
        display: flex;
        flex-wrap: wrap;
        overflow: visible;
      }

      .vocab-exercise-page .level-chip {
        min-width: 0;
        max-width: 100%;
        white-space: normal;
      }

      .vocab-exercise-page .level-chip .txt {
        overflow-wrap: anywhere;
        line-height: 1.1;
      }

      .vocab-exercise-count .select-wrap,
      .vocab-exercise-count .select {
        min-width: 0;
        max-width: 100%;
      }

      .vocab-exercise-note {
        padding: .7rem .85rem;
        border-radius: 12px;
        border: 1px solid color-mix(in srgb, var(--color-accent) 34%, var(--color-border));
        background: color-mix(in srgb, var(--color-accent) 10%, transparent);
      }

      .vocab-exercise-progress {
        margin: 0;
        padding: .75rem .9rem;
        border-radius: 14px;
        border: 1px solid var(--color-border);
        background: var(--color-surface-raised);
        color: var(--color-text);
        font-weight: 800;
      }

      .vocab-exercise-card-head {
        align-items: flex-start;
        gap: .75rem;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
      }

      .vocab-exercise-card-head > div {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: .45rem;
        min-width: 0;
      }

      .vocab-task-card-actions {
        justify-content: flex-end;
        min-width: 14rem;
      }

      .vocab-exercise-page .fav-btn {
        display: inline-grid;
        place-items: center;
        width: 2.25rem;
        height: 2.25rem;
        flex: 0 0 auto;
        border-radius: 999px;
        border: 1px solid var(--color-border);
        background: var(--color-surface-2);
        color: var(--color-text-soft);
        box-shadow: 0 8px 18px var(--color-shadow-soft);
      }

      .vocab-exercise-page .fav-btn:hover {
        opacity: 1;
        color: var(--color-text);
        border-color: var(--color-border-strong);
      }

      .vocab-exercise-page .fav-btn.active {
        border-color: color-mix(in srgb, #f7b731 55%, var(--color-border));
        background: color-mix(in srgb, #f7b731 16%, var(--color-surface-2));
        color: #a56800;
      }

      .vocab-report-btn {
        min-height: 2.25rem;
        display: inline-flex;
        align-items: center;
        gap: .35rem;
        padding: 0 .65rem;
        border-radius: 8px;
        border: 1px solid var(--color-border);
        background: var(--color-surface-2);
        color: var(--color-text-soft);
        cursor: pointer;
        font-weight: 800;
        font-size: .84rem;
        box-shadow: 0 8px 18px var(--color-shadow-soft);
      }

      .vocab-report-btn:hover {
        border-color: var(--color-border-strong);
        color: var(--color-text);
      }

      .vocab-report-bar {
        border-radius: 8px;
        border: 1px solid color-mix(in srgb, var(--color-accent) 28%, var(--color-border));
        background: color-mix(in srgb, var(--color-surface-raised) 82%, transparent);
        padding: .85rem;
      }

      .vocab-report-fields,
      .vocab-report-actions {
        display: flex;
        flex-wrap: wrap;
        gap: .75rem;
      }

      .vocab-report-fields {
        flex-direction: column;
      }

      .vocab-report-input {
        width: 100%;
        resize: vertical;
        min-height: 88px;
        border-radius: 8px;
        border: 1px solid var(--color-border);
        background: var(--color-surface);
        color: var(--color-text);
        padding: .75rem .85rem;
        font: inherit;
      }

      .vocab-report-actions {
        margin-top: .75rem;
        justify-content: flex-end;
      }

      .vocab-exercise-number {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 2.25rem;
        min-width: 5.4rem;
        padding: .35rem .8rem;
        border-radius: 999px;
        border: 1px solid color-mix(in srgb, var(--color-accent) 48%, var(--color-border));
        background: color-mix(in srgb, var(--color-accent) 14%, transparent);
        color: var(--color-accent);
        font-size: .84rem;
        font-weight: 900;
        line-height: 1;
        justify-content: center;
      }

      .vocab-mini-tag {
        display: inline-flex;
        align-items: center;
        padding: .18rem .5rem;
        border-radius: 999px;
        border: 1px solid color-mix(in srgb, var(--color-accent) 35%, var(--color-border));
        color: var(--color-accent);
        font-size: .72rem;
        font-weight: 800;
      }

      .vocab-mini-tag.ghost {
        border-color: var(--color-border);
        color: var(--color-text-soft);
      }

      .vocab-exercise-title,
      .vocab-exercise-instruction,
      .vocab-exercise-example {
        color: var(--color-text-soft);
      }

      .vocab-exercise-title {
        font-size: .85rem;
        text-align: right;
        min-width: 0;
      }

      .vocab-exercise-instruction,
      .vocab-exercise-example {
        margin: 0;
        line-height: 1.45;
      }

      .vocab-task-layout,
      .vocab-task-questions {
        display: grid;
        gap: .75rem;
      }

      .vocab-task-row {
        display: grid;
        grid-template-columns: 2.1rem minmax(0, 1fr) minmax(170px, 235px);
        align-items: center;
        gap: .7rem;
        padding: .7rem;
        border-radius: 12px;
        border: 1px solid var(--color-border);
        background: color-mix(in srgb, var(--color-surface-raised) 72%, transparent);
      }

      .vocab-task-row.is-correct {
        border-color: color-mix(in srgb, #22c55e 55%, var(--color-border));
        background: color-mix(in srgb, #22c55e 10%, var(--color-surface-raised));
      }

      .vocab-task-row.is-wrong {
        border-color: color-mix(in srgb, #ef4444 55%, var(--color-border));
        background: color-mix(in srgb, #ef4444 10%, var(--color-surface-raised));
      }

      .vocab-task-number {
        display: inline-grid;
        place-items: center;
        width: 2rem;
        height: 2rem;
        border-radius: 999px;
        background: color-mix(in srgb, var(--color-accent) 14%, transparent);
        color: var(--color-accent);
        font-weight: 900;
      }

      .vocab-task-row p {
        margin: 0;
        color: var(--color-text);
        line-height: 1.42;
      }

      .vocab-task-answer-controls {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 2.25rem;
        align-items: center;
        gap: .5rem;
        min-width: 0;
      }

      .vocab-task-select-wrap {
        display: block;
        min-width: 0;
      }

      .vocab-task-select-wrap .select {
        box-sizing: border-box;
        min-width: 0;
        width: 100%;
      }

      .vocab-question-fav {
        width: 2.25rem;
        height: 2.25rem;
        min-width: 2.25rem;
        padding: 0;
        border-radius: 10px;
        box-shadow: none;
        position: relative;
        z-index: 1;
      }

      .vocab-exercise-feedback {
        margin-top: .1rem;
      }

      .vocab-feedback-list {
        display: grid;
        gap: .6rem;
      }

      .vocab-feedback-row {
        padding: .7rem .8rem;
        border-radius: 12px;
        border: 1px solid var(--color-border);
        background: color-mix(in srgb, var(--color-surface) 68%, transparent);
      }

      .vocab-feedback-row.is-correct {
        border-color: color-mix(in srgb, #22c55e 42%, var(--color-border));
      }

      .vocab-feedback-row.is-wrong {
        border-color: color-mix(in srgb, #ef4444 42%, var(--color-border));
      }

      .vocab-feedback-row p {
        margin: .35rem 0 0;
        color: var(--color-text-soft);
        line-height: 1.42;
      }

      .vocab-feedback-row strong,
      .vocab-example-sentence {
        color: var(--color-text);
      }

      @media (max-width: 760px) {
        .vocab-exercise-page {
          gap: .85rem;
        }

        .vocab-exercise-page > .topbar-btn {
          justify-self: start;
          max-width: 100%;
          white-space: normal;
        }

        .vocab-exercise-header h1 {
          font-size: clamp(1.35rem, 9vw, 1.85rem);
        }

        .vocab-exercise-setup {
          padding: 1rem;
          overflow: hidden;
        }

        .vocab-exercise-count {
          align-items: flex-start;
          flex-direction: column;
          gap: .5rem;
        }

        .vocab-exercise-count .select-wrap {
          width: min(100%, 10.5rem);
        }

        .vocab-exercise-actions {
          align-items: stretch;
          flex-direction: column;
        }

        .vocab-exercise-actions > button {
          width: 100%;
          justify-content: center;
          white-space: normal;
        }

        .vocab-exercise-card-head {
          grid-template-columns: 1fr;
        }

        .vocab-task-card-actions {
          justify-content: flex-start;
          min-width: 0;
          width: 100%;
        }

        .vocab-task-row {
          grid-template-columns: 2.1rem minmax(0, 1fr);
        }

        .vocab-task-answer-controls {
          grid-column: 2;
        }

        .vocab-exercise-title {
          text-align: left;
        }
      }
    `}</style>
  );
}
