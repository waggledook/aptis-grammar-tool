import { APTIS_GRAMMAR_VOCABULARY_MOCKS } from "../data/aptisGrammarVocabularyMocks.js";
import { getAptisMockReviewFeedback } from "../data/aptisGrammarVocabularyMockFeedback.js";

function hasAnswer(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function findStoredGrammarItem(attempt, question, questionIndex) {
  const items = attempt?.review?.grammarItems;
  if (!Array.isArray(items)) return null;
  return items.find((item) => item?.id === question.id)
    || items.find((item) => Number(item?.number) === questionIndex + 1)
    || null;
}

function findStoredVocabularyItem(attempt, task, row) {
  const tasks = attempt?.review?.vocabularyTasks;
  if (!Array.isArray(tasks)) return null;
  const storedTask = tasks.find((entry) => entry?.id === task.id)
    || tasks.find((entry) => entry?.range === task.range && entry?.type === task.type);
  if (!Array.isArray(storedTask?.items)) return null;
  return storedTask.items.find((item) => Number(item?.number) === Number(row.number)) || null;
}

function wasGrammarAnswerWrong(attempt, question, questionIndex) {
  const storedItem = findStoredGrammarItem(attempt, question, questionIndex);
  if (storedItem && hasAnswer(storedItem.selected)) return storedItem.correct === false;

  const selected = attempt?.answers?.[question.id];
  if (!hasAnswer(selected)) return false;
  const correctIndex = question.correctAnswer.charCodeAt(0) - 65;
  return selected !== question.options[correctIndex];
}

function wasVocabularyAnswerWrong(attempt, task, row) {
  const storedItem = findStoredVocabularyItem(attempt, task, row);
  if (storedItem && hasAnswer(storedItem.selected)) return storedItem.correct === false;

  const selected = attempt?.answers?.[task.id]?.[row.number];
  return hasAnswer(selected) && selected !== row.correctAnswer;
}

/**
 * Build one deduplicated review item for every question the learner has ever
 * answered incorrectly in a saved Grammar & Vocabulary mock attempt.
 *
 * Both the saved review snapshot and the original raw-answer shape are
 * supported so attempts created before this review feature do not need a
 * migration. Unanswered questions are deliberately excluded.
 */
export function buildAptisGrammarVocabularyMistakes(
  attempts,
  mocks = APTIS_GRAMMAR_VOCABULARY_MOCKS
) {
  const mockById = new Map(mocks.map((mock) => [mock.id, mock]));
  const mistakes = new Map();

  for (const attempt of Array.isArray(attempts) ? attempts : []) {
    const mock = mockById.get(attempt?.mockId);
    if (!mock) continue;
    const feedback = getAptisMockReviewFeedback(mock.id);

    mock.grammarQuestions.forEach((question, questionIndex) => {
      if (!wasGrammarAnswerWrong(attempt, question, questionIndex)) return;
      const key = `grammar:${question.id}`;
      if (mistakes.has(key)) return;

      const correctIndex = question.correctAnswer.charCodeAt(0) - 65;
      mistakes.set(key, {
        key,
        kind: "grammar",
        mockId: mock.id,
        mockTitle: mock.title,
        mockVersion: mock.version,
        number: questionIndex + 1,
        question,
        correctValue: question.options[correctIndex],
        explanation: feedback.grammar[question.id]?.explanation || "",
      });
    });

    mock.vocabularyTasks.forEach((task) => {
      task.rows.forEach((row) => {
        if (!wasVocabularyAnswerWrong(attempt, task, row)) return;
        const key = `vocabulary:${task.id}:${row.number}`;
        if (mistakes.has(key)) return;

        const correctOption = task.options.find((option) => option.value === row.correctAnswer);
        mistakes.set(key, {
          key,
          kind: "vocabulary",
          mockId: mock.id,
          mockTitle: mock.title,
          mockVersion: mock.version,
          number: row.number,
          task,
          row,
          correctValue: correctOption?.label || "",
          explanation: feedback.vocabulary[task.id]?.[row.number]?.explanation || "",
        });
      });
    });
  }

  return Array.from(mistakes.values());
}

/** Merge several learners' mistake pools while preserving who missed each item. */
export function buildAptisGrammarVocabularyClassMistakes(studentAttemptGroups) {
  const merged = new Map();

  for (const group of Array.isArray(studentAttemptGroups) ? studentAttemptGroups : []) {
    const student = group?.student || {};
    const studentId = String(student.id || "").trim();
    if (!studentId) continue;
    const studentName = String(
      student.displayName || student.name || student.username || student.email || "Student"
    ).trim();

    for (const mistake of buildAptisGrammarVocabularyMistakes(group.attempts)) {
      const existing = merged.get(mistake.key);
      if (existing) {
        if (!existing.studentIds.includes(studentId)) {
          existing.studentIds.push(studentId);
          existing.studentNames.push(studentName);
        }
        continue;
      }

      merged.set(mistake.key, {
        ...mistake,
        studentIds: [studentId],
        studentNames: [studentName],
      });
    }
  }

  return Array.from(merged.values());
}

/** Return a new list ordered by how many selected learners missed each item. */
export function prioritizeAptisGrammarVocabularyMistakes(items) {
  if (!Array.isArray(items)) return [];

  return [...items].sort((left, right) => {
    const leftCount = Array.isArray(left?.studentIds) ? left.studentIds.length : 0;
    const rightCount = Array.isArray(right?.studentIds) ? right.studentIds.length : 0;
    return rightCount - leftCount;
  });
}
