import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sourcePath = process.argv[2];
if (!sourcePath) {
  throw new Error("Usage: node scripts/import-aptis-grammar-vocabulary-mocks.mjs <draft.md>");
}

const outputPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/data/aptisGrammarVocabularyMocks4to6.js"
);
const source = fs.readFileSync(sourcePath, "utf8");
const labels = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function clean(value) {
  return value.trim().replaceAll("<br>", "\n").replaceAll("*", "");
}

function tableRows(section) {
  return section.split("\n")
    .filter((line) => /^\| \d+ \|/.test(line))
    .map((line) => line.split("|").slice(1, -1).map(clean));
}

function parseVocabularyTask(section, mockNumber, taskNumber, start, end, type) {
  const optionsLine = section.match(/^\*\*Options:\*\* (.+)$/m)?.[1];
  assert(optionsLine, `Mock ${mockNumber}, vocabulary task ${taskNumber}: options missing`);
  const options = optionsLine.split(" · ").map((entry) => {
    const match = entry.match(/^([A-HJK]) (.+)$/);
    assert(match, `Mock ${mockNumber}, vocabulary task ${taskNumber}: bad option ${entry}`);
    return { value: match[1], label: clean(match[2]) };
  });
  assert(options.length === 10 && options.every((option, index) => option.value === labels[index]),
    `Mock ${mockNumber}, vocabulary task ${taskNumber}: option labels incomplete`);

  const rows = tableRows(section).map(([number, prompt, keyedAnswer]) => {
    const match = keyedAnswer.match(/^([A-HJK]) — (.+)$/);
    assert(match, `Mock ${mockNumber}, vocabulary question ${number}: bad answer`);
    const option = options.find((entry) => entry.value === match[1]);
    assert(option?.label === match[2], `Mock ${mockNumber}, vocabulary question ${number}: answer does not match option`);
    return { number: Number(number), prompt, correctAnswer: match[1] };
  });
  assert(rows.length === 5 && rows.every((row, index) => row.number === start + index),
    `Mock ${mockNumber}, vocabulary task ${taskNumber}: question numbering incomplete`);
  assert(new Set(rows.map((row) => row.correctAnswer)).size === 5,
    `Mock ${mockNumber}, vocabulary task ${taskNumber}: an answer is reused`);

  const instruction = section.split("\n").map((line) => line.trim())
    .find((line) => line && !line.startsWith("**Options:**") && !line.startsWith("|"));
  return {
    id: `m${mockNumber}-v${taskNumber}`,
    range: `Questions ${start}–${end}`,
    type,
    instruction,
    showEquals: type === "Synonyms",
    options,
    rows,
  };
}

function parseMock(number, body) {
  const grammarSection = body.split(/^## Vocabulary\s*$/m)[0];
  const grammarQuestions = tableRows(grammarSection).map(
    ([numberText, prompt, a, b, c, answer, target, difficulty]) => {
      const questionNumber = Number(numberText);
      const correctAnswer = answer;
      assert(["A", "B", "C"].includes(correctAnswer),
        `Mock ${number}, grammar question ${questionNumber}: invalid key`);
      // "Dislikes to be told" is also grammatical; keep only one passive answer.
      if (number === 6 && questionNumber === 15) b = "to tell";
      // Both "isn't large enough" and "isn't too large" fit the original stem.
      if (number === 4 && questionNumber === 7) c = "large too";
      // "Taken to the hospital" is defensible; test a clearer zero-article phrase.
      if (number === 5 && questionNumber === 13) {
        prompt = "On weekdays, Daniel goes to __________ work by bus.";
        target = "Zero article: go to work";
      }
      return {
        id: `m${number}-g${questionNumber}`,
        prompt,
        options: [a, b, c],
        correctAnswer,
        target,
        difficulty,
      };
    }
  );
  assert(grammarQuestions.length === 25 && grammarQuestions.every((question, index) =>
    question.id === `m${number}-g${index + 1}`), `Mock ${number}: grammar numbering incomplete`);

  const vocabularySection = body.split(/^## Vocabulary\s*$/m)[1];
  assert(vocabularySection, `Mock ${number}: vocabulary section missing`);
  const headings = [...vocabularySection.matchAll(/^### Questions (\d+)–(\d+) — (.+)$/gm)];
  assert(headings.length === 5, `Mock ${number}: expected five vocabulary tasks`);
  const vocabularyTasks = headings.map((heading, index) => {
    const endIndex = headings[index + 1]?.index ?? vocabularySection.length;
    return parseVocabularyTask(
      vocabularySection.slice(heading.index + heading[0].length, endIndex),
      number,
      index + 1,
      Number(heading[1]),
      Number(heading[2]),
      heading[3]
    );
  });
  assert(vocabularyTasks.flatMap((task) => task.rows).every((row, index) => row.number === index + 1),
    `Mock ${number}: vocabulary numbering incomplete`);

  return {
    id: `mock-${number}`,
    version: String(number).padStart(3, "0"),
    title: `Aptis Grammar and Vocabulary Mock ${number}`,
    grammarQuestions,
    vocabularyTasks,
  };
}

const headings = [...source.matchAll(/^# Mock ([456])\s*$/gm)];
assert(headings.length === 3, "Expected drafts for Mocks 4, 5 and 6");
const mocks = headings.map((heading, index) => parseMock(
  Number(heading[1]),
  source.slice(heading.index + heading[0].length, headings[index + 1]?.index ?? source.length)
));
assert(mocks.every((mock, index) => mock.id === `mock-${index + 4}`), "Mock order is wrong");

fs.writeFileSync(
  outputPath,
  `// Imported from Aptis_Grammar_Vocabulary_Mocks_4-6.md with reviewed question revisions.\nexport const APTIS_GRAMMAR_VOCABULARY_MOCKS_4_TO_6 = ${JSON.stringify(mocks, null, 2)};\n`
);
console.log(`Wrote ${mocks.length} mocks to ${outputPath}`);
