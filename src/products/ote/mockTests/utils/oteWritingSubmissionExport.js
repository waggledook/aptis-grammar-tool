import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

export function getOteWritingSubmissionFileBase(submissionId) {
  return `ote-writing-${submissionId || "submission"}`;
}

function safeText(value) {
  return String(value || "").trim();
}

function normalizeComparableText(value) {
  return safeText(value).replace(/\s+/g, " ");
}

function needsImprovedVersion(task = {}) {
  const improved = normalizeComparableText(task.improvedVersion);
  if (!improved) return false;
  return improved !== normalizeComparableText(task.studentAnswer);
}

function bodyParagraph(text, options = {}) {
  return new Paragraph({
    text: safeText(text) || "(no answer)",
    spacing: { after: 140 },
    ...options,
  });
}

function headingParagraph(text, options = {}) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    ...options,
  });
}

function answerBlock(text) {
  return new Paragraph({
    children: [
      new TextRun({
        text: safeText(text) || "(no answer)",
        italics: !safeText(text),
      }),
    ],
    spacing: { after: 220 },
    border: {
      left: { color: "D6DAE2", size: 8, space: 12 },
    },
    indent: { left: 240 },
  });
}

function getFeedbackLines(feedback) {
  if (!feedback) return [];

  const lines = [
    "",
    "FEEDBACK",
    "Generated automatically to help you improve your writing.",
    feedback.estimatedWritingLevel?.label
      ? `Estimated level: ${feedback.estimatedWritingLevel.label}`
      : "",
    feedback.overall?.summary ? `Summary: ${feedback.overall.summary}` : "",
  ].filter(Boolean);

  if (feedback.overall?.mainStrengths?.length) {
    lines.push("", "Main strengths");
    feedback.overall.mainStrengths.forEach((item) => lines.push(`- ${item}`));
  }

  if (feedback.overall?.mainPriorities?.length) {
    lines.push("", "Priority advice");
    feedback.overall.mainPriorities.forEach((item) => lines.push(`- ${item}`));
  }

  (feedback.tasks || []).forEach((task, index) => {
    lines.push("", `Task ${index + 1} feedback`);
    if (task.taskFulfilment?.feedback) lines.push(`Content: ${task.taskFulfilment.feedback}`);
    if (task.wordCountFeedback) lines.push(`Word count: ${task.wordCountFeedback}`);
    if (task.formatAndRegister?.feedback) lines.push(`Register: ${task.formatAndRegister.feedback}`);
    if (task.organization?.feedback) lines.push(`Organization: ${task.organization.feedback}`);
    if (task.grammar?.feedback) lines.push(`Grammar: ${task.grammar.feedback}`);
    if (task.lexis?.feedback) lines.push(`Lexis: ${task.lexis.feedback}`);

    if (task.mistakes?.length) {
      lines.push("", "Mistakes to fix");
      task.mistakes.forEach((mistake) => {
        lines.push(`- ${mistake.original} -> ${mistake.correction}: ${mistake.explanation}`);
      });
    }

    if (needsImprovedVersion(task)) {
      lines.push("", "Improved version", task.improvedVersion);
    } else if (task.improvedVersion) {
      lines.push("", "Improved version", "No rewrite needed; the original version is already strong.");
    }

    if (task.teacherNote) lines.push("", `Teacher note: ${task.teacherNote}`);
  });

  return lines;
}

function feedbackDocxBlocks(feedback) {
  if (!feedback) return [];

  const children = [
    headingParagraph("Feedback", { pageBreakBefore: true }),
    bodyParagraph("Generated automatically to help you improve your writing."),
  ];

  if (feedback.estimatedWritingLevel?.label) {
    children.push(bodyParagraph(`Estimated level: ${feedback.estimatedWritingLevel.label}`));
  }
  if (feedback.overall?.summary) {
    children.push(bodyParagraph(feedback.overall.summary));
  }

  if (feedback.overall?.mainStrengths?.length) {
    children.push(headingParagraph("Main Strengths"));
    feedback.overall.mainStrengths.forEach((item) => children.push(bodyParagraph(`- ${item}`)));
  }

  if (feedback.overall?.mainPriorities?.length) {
    children.push(headingParagraph("Priority Advice"));
    feedback.overall.mainPriorities.forEach((item) => children.push(bodyParagraph(`- ${item}`)));
  }

  (feedback.tasks || []).forEach((task, index) => {
    children.push(headingParagraph(`Task ${index + 1} Feedback`));
    if (task.taskFulfilment?.feedback) children.push(bodyParagraph(`Content: ${task.taskFulfilment.feedback}`));
    if (task.wordCountFeedback) children.push(bodyParagraph(`Word count: ${task.wordCountFeedback}`));
    if (task.formatAndRegister?.feedback) children.push(bodyParagraph(`Register: ${task.formatAndRegister.feedback}`));
    if (task.organization?.feedback) children.push(bodyParagraph(`Organization: ${task.organization.feedback}`));
    if (task.grammar?.feedback) children.push(bodyParagraph(`Grammar: ${task.grammar.feedback}`));
    if (task.lexis?.feedback) children.push(bodyParagraph(`Lexis: ${task.lexis.feedback}`));

    if (task.mistakes?.length) {
      children.push(headingParagraph("Mistakes to Fix"));
      task.mistakes.forEach((mistake) => {
        children.push(bodyParagraph(`${mistake.original} -> ${mistake.correction}: ${mistake.explanation}`));
      });
    }

    if (needsImprovedVersion(task)) {
      children.push(headingParagraph("Improved Version"));
      children.push(answerBlock(task.improvedVersion));
    } else if (task.improvedVersion) {
      children.push(headingParagraph("Improved Version"));
      children.push(bodyParagraph("No rewrite needed; the original version is already strong."));
    }

    if (task.teacherNote) {
      children.push(bodyParagraph(`Teacher note: ${task.teacherNote}`));
    }
  });

  return children;
}

export function buildOteWritingSubmissionText({ submissionId, submission, mock }) {
  const task2Choice = submission.task2Choice || "essay";
  const task2 = mock.task2.options[task2Choice];
  const task1Label = mock.task1.kind === "essay" ? "Essay" : "Email";
  return [
    `${mock.title}`,
    `Submission ID: ${submissionId || "local"}`,
    mock.task2.noChoice ? `Part 2: ${task2.title}` : `Part 2 option: ${task2.title}`,
    "",
    `Task 1: ${task1Label} (${submission.counts?.task1 ?? 0} words)`,
    submission.answers?.task1 || "(no answer)",
    "",
    `Task 2: ${task2.title} (${submission.counts?.[task2Choice] ?? 0} words)`,
    submission.answers?.[task2Choice] || "(no answer)",
    ...getFeedbackLines(submission.aiFeedback),
  ].join("\n");
}

export async function downloadOteWritingSubmissionDocx({ submissionId, submission, mock }) {
  const task2Choice = submission.task2Choice || "essay";
  const task2 = mock.task2.options[task2Choice];
  const task1Label = mock.task1.kind === "essay" ? "Essay" : "Email";
  const task1PromptBlocks = mock.task1.kind === "essay"
    ? [
        bodyParagraph(mock.task1.setup),
        bodyParagraph(mock.task1.prompt),
        bodyParagraph(mock.task1.question),
        ...(mock.task1.ideas || []).map((idea) => bodyParagraph(`- ${idea}`)),
        bodyParagraph(mock.task1.organizationInstruction),
      ]
    : [
        bodyParagraph(mock.task1.setup),
        ...(mock.task1.email?.prompts || []).flatMap((prompt, index) => [
          new Paragraph({
            children: [new TextRun({ text: `${index + 1}. ${prompt.question}`, bold: true })],
            spacing: { after: 80 },
          }),
          bodyParagraph(prompt.note),
        ]),
      ];
  const task2PromptBlocks = task2.kind === "summary"
    ? [
        bodyParagraph(task2.setup),
        ...(task2.sources || []).flatMap((source) => [
          headingParagraph(source.title),
          bodyParagraph(source.text),
        ]),
      ]
    : [
        bodyParagraph(task2.context),
        bodyParagraph(task2.prompt),
      ];

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Aptos", size: 24 },
          paragraph: { spacing: { line: 276 } },
        },
      },
      paragraphStyles: [
        {
          id: "TitleStyle",
          name: "Title Style",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { font: "Aptos", size: 32, bold: true },
          paragraph: { spacing: { after: 240 } },
        },
      ],
    },
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: `Oxford Test of English Practice - Writing: ${mock.title}`,
            style: "TitleStyle",
          }),
          bodyParagraph(`Submission ID: ${submissionId || "local"}`),
          bodyParagraph(mock.task2.noChoice ? `Part 2: ${task2.title}` : `Part 2 option: ${task2.title}`),
          headingParagraph(`Part 1: ${task1Label}`),
          ...task1PromptBlocks,
          bodyParagraph(`Word count: ${submission.counts?.task1 ?? 0}`),
          answerBlock(submission.answers?.task1),
          headingParagraph(`Part 2: ${task2.title}`, { pageBreakBefore: true }),
          ...task2PromptBlocks,
          bodyParagraph(`Word count: ${submission.counts?.[task2Choice] ?? 0}`),
          answerBlock(submission.answers?.[task2Choice]),
          ...feedbackDocxBlocks(submission.aiFeedback),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `Generated by Seif OTE Trainer`,
                italics: true,
              }),
            ],
            spacing: { before: 300 },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${getOteWritingSubmissionFileBase(submissionId)}.docx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function downloadOteWritingSubmissionText({ submissionId, submission, mock }) {
  const blob = new Blob([buildOteWritingSubmissionText({ submissionId, submission, mock })], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${getOteWritingSubmissionFileBase(submissionId)}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}
