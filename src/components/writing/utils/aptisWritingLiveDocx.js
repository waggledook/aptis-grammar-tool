import {
  AlignmentType,
  Document,
  Footer,
  Header,
  Packer,
  PageNumber,
  Paragraph,
  TextRun,
} from "docx";

const INK = "0B2545";
const BLUE = "2E74B5";
const MUTED = "5D6B7A";
const BORDER = "D7E0EA";

function safeText(value) {
  return String(value || "").trim();
}

function bodyParagraph(text, options = {}) {
  return new Paragraph({
    children: [new TextRun({ text: safeText(text) || "(no response)", color: INK })],
    spacing: { after: 120, line: 300 },
    ...options,
  });
}

function labelParagraph(text, options = {}) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, color: BLUE, size: 23 })],
    spacing: { before: 120, after: 60, line: 300 },
    keepNext: true,
    ...options,
  });
}

function answerParagraphs(text) {
  const paragraphs = safeText(text).split(/\n{2,}/).filter(Boolean);
  const values = paragraphs.length ? paragraphs : ["(no response)"];
  return values.map((value, index) => new Paragraph({
    children: [new TextRun({ text: value.replace(/\n/g, " "), color: INK, italics: value === "(no response)" })],
    spacing: { after: index === values.length - 1 ? 180 : 100, line: 300 },
    indent: { left: 240, right: 120 },
    border: { left: { color: BORDER, size: 10, space: 12 } },
  }));
}

function taskPromptBlocks(part, task) {
  if (Number(part) === 1) {
    return [
      bodyParagraph(task.context),
      ...task.questions.map((question, index) => bodyParagraph(`${index + 1}. ${question.text}`, { indent: { left: 240 } })),
    ];
  }
  if (Number(part) === 2) {
    return [
      bodyParagraph(task.context),
      labelParagraph("Writing prompt"),
      bodyParagraph(task.prompt, { indent: { left: 240 } }),
    ];
  }
  if (Number(part) === 3) {
    return [
      bodyParagraph(task.context),
      ...task.chats.flatMap((chat, index) => [
        labelParagraph(`Message ${index + 1} · ${chat.name}`),
        bodyParagraph(chat.question, { indent: { left: 240 } }),
      ]),
    ];
  }
  return [
    labelParagraph(task.sourceTitle || "Source email"),
    ...safeText(task.source).split(/\n{2,}/).map((paragraph) => bodyParagraph(paragraph, { indent: { left: 240, right: 120 } })),
    labelParagraph("Informal email · 40–50 words"),
    bodyParagraph(task.friendPrompt, { indent: { left: 240 } }),
    labelParagraph("Formal email · 120–150 words"),
    bodyParagraph(task.formalPrompt, { indent: { left: 240 } }),
  ];
}

function responseBlocks(part, entry, index) {
  const submission = entry.writingSubmission || {};
  const answers = submission.answers || {};
  const counts = submission.counts || {};
  const header = new Paragraph({
    text: entry.anonymousLabel || `Response ${index + 1}`,
    style: "HeadingOneStyle",
    pageBreakBefore: true,
  });

  if (Number(part) === 1) {
    return [
      header,
      ...(entry.task?.questions || []).flatMap((question, answerIndex) => [
        labelParagraph(`${answerIndex + 1}. ${question.text} · ${counts.responses?.[answerIndex] || 0} words`),
        ...answerParagraphs(answers.responses?.[answerIndex]),
      ]),
    ];
  }

  if (Number(part) === 2) {
    return [
      header,
      labelParagraph(`Short text · ${counts.answer || 0} words`),
      ...answerParagraphs(answers.answer),
    ];
  }
  if (Number(part) === 3) {
    return [
      header,
      ...(answers.responses || []).flatMap((answer, answerIndex) => [
        labelParagraph(`Reply ${answerIndex + 1} · ${counts.responses?.[answerIndex] || 0} words`),
        ...answerParagraphs(answer),
      ]),
    ];
  }
  return [
    header,
    labelParagraph(`Informal email · ${counts.informal || 0} words`),
    ...answerParagraphs(answers.informal),
    labelParagraph(`Formal email · ${counts.formal || 0} words`),
    ...answerParagraphs(answers.formal),
  ];
}

export function buildAptisWritingLiveResponsesDocx({ part, task, submissions, generatedAt = new Date() }) {
  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(generatedAt);

  return new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22, color: INK },
          paragraph: { spacing: { after: 120, line: 300 } },
        },
      },
      paragraphStyles: [
        {
          id: "TitleStyle",
          name: "Document Title",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { font: "Calibri", size: 40, bold: true, color: INK },
          paragraph: { spacing: { before: 0, after: 80, line: 300 }, keepNext: true },
        },
        {
          id: "HeadingOneStyle",
          name: "Response Heading",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { font: "Calibri", size: 32, bold: true, color: BLUE },
          paragraph: { spacing: { before: 360, after: 160, line: 300 }, keepNext: true },
        },
        {
          id: "HeadingTwoStyle",
          name: "Section Heading",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { font: "Calibri", size: 26, bold: true, color: BLUE },
          paragraph: { spacing: { before: 280, after: 120, line: 300 }, keepNext: true },
        },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440, header: 708, footer: 708 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [new TextRun({ text: "Aptis Writing · Live classroom responses", color: MUTED, size: 18 })],
            spacing: { after: 80 },
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "Anonymous classroom compilation · Page ", color: MUTED, size: 18 }),
              new TextRun({ children: [PageNumber.CURRENT], color: MUTED, size: 18 }),
            ],
          })],
        }),
      },
      children: [
        new Paragraph({ text: task.title, style: "TitleStyle" }),
        bodyParagraph(`Aptis Writing Part ${part} · ${submissions.length} anonymous ${submissions.length === 1 ? "response" : "responses"} · ${dateLabel}`, {
          children: [new TextRun({
            text: `Aptis Writing Part ${part} · ${submissions.length} anonymous ${submissions.length === 1 ? "response" : "responses"} · ${dateLabel}`,
            color: MUTED,
          })],
          spacing: { after: 260, line: 300 },
        }),
        new Paragraph({ text: "Task", style: "HeadingTwoStyle" }),
        ...taskPromptBlocks(part, task),
        new Paragraph({
          children: [new TextRun({ text: "Responses are shown in a stable random order and contain no student names.", italics: true, color: MUTED })],
          spacing: { before: 180, after: 180, line: 300 },
        }),
        ...submissions.flatMap((entry, index) => responseBlocks(part, { ...entry, task }, index)),
      ],
    }],
  });
}

export async function downloadAptisWritingLiveResponsesDocx({ gameId, part, task, submissions }) {
  const doc = buildAptisWritingLiveResponsesDocx({ part, task, submissions });
  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeTaskId = String(task.id || "writing-task").replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
  link.href = url;
  link.download = `aptis-writing-part-${part}-${safeTaskId}-${gameId || "live"}-responses.docx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 500);
}
