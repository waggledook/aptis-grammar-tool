import {
  AlignmentType,
  Document,
  Packer,
  Paragraph,
  TextRun
} from 'docx';
import { EMPTY_ANSWERS, sanitizeRichTextHtml } from './answerContent';
import {
  buildFeedbackReport,
  FEEDBACK_PARTS,
  hasGeneratedFeedback
} from './feedbackFormat';
import { DEFAULT_MOCK_ID, getWritingMock } from '../data/mocks';

export function getNormalizedSubmission(loaded) {
  return {
    part1: Array.isArray(loaded?.[1]) ? loaded[1] : EMPTY_ANSWERS[1],
    part2: typeof loaded?.[2] === 'string' ? sanitizeRichTextHtml(loaded[2]) : EMPTY_ANSWERS[2],
    part3: Array.isArray(loaded?.[3])
      ? loaded[3].map((answer) => sanitizeRichTextHtml(answer))
      : EMPTY_ANSWERS[3],
    part4: Array.isArray(loaded?.[4])
      ? loaded[4].map((answer) => sanitizeRichTextHtml(answer))
      : EMPTY_ANSWERS[4]
  };
}

export function getSubmissionFileBase(submissionId) {
  return `aptis-general-writing-${submissionId || 'submission'}`;
}

function makeAnswerRunsFromNode(node, formatting = {}) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || '';
    if (!text) {
      return [];
    }

    return [new TextRun({
      text,
      bold: formatting.bold,
      italics: formatting.italics,
      underline: formatting.underline ? {} : undefined,
      strike: formatting.strike
    })];
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return [];
  }

  const tag = node.nodeName.toUpperCase();
  const nextFormatting = {
    bold: formatting.bold || tag === 'B' || tag === 'STRONG',
    italics: formatting.italics || tag === 'I' || tag === 'EM',
    underline: formatting.underline || tag === 'U',
    strike: formatting.strike || tag === 'S' || tag === 'STRIKE'
  };

  if (tag === 'BR') {
    return [new TextRun({ break: 1 })];
  }

  const childRuns = Array.from(node.childNodes).flatMap((child) =>
    makeAnswerRunsFromNode(child, nextFormatting)
  );

  if (tag === 'DIV' || tag === 'P') {
    childRuns.push(new TextRun({ break: 1 }));
  }

  return childRuns;
}

export function htmlToTextRuns(html) {
  if (!html) {
    return [new TextRun({ text: '(no answer)', italics: true })];
  }

  const container = document.createElement('div');
  container.innerHTML = sanitizeRichTextHtml(html);
  const runs = Array.from(container.childNodes).flatMap((node) => makeAnswerRunsFromNode(node));

  if (!runs.length) {
    return [new TextRun({ text: '(no answer)', italics: true })];
  }

  return runs;
}

function answerParagraph(html) {
  return new Paragraph({
    children: htmlToTextRuns(html),
    spacing: { after: 180 }
  });
}

function questionParagraph(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true })],
    spacing: { after: 120 }
  });
}

function bodyParagraph(text, options = {}) {
  return new Paragraph({
    text,
    spacing: { after: 140 },
    ...options
  });
}

function headingParagraph(text, options = {}) {
  return new Paragraph({
    text,
    style: 'HeadingOneStyle',
    ...options
  });
}

function bulletParagraph(text, options = {}) {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 80 },
    ...options
  });
}

function noteParagraph(label, text) {
  return bodyParagraph(`${label}: ${text}`);
}

function feedbackListParagraphs(title, items = []) {
  if (!items.length) return [];
  return [
    new Paragraph({
      children: [new TextRun({ text: title, bold: true })],
      spacing: { before: 120, after: 60 }
    }),
    ...items.map((item) => bulletParagraph(item))
  ];
}

function mistakeParagraphs(mistakes = []) {
  if (!mistakes.length) return [];
  return [
    new Paragraph({
      children: [new TextRun({ text: 'Mistakes to fix', bold: true })],
      spacing: { before: 140, after: 80 }
    }),
    ...mistakes.map((mistake) =>
      bodyParagraph(
        `${mistake.category ? `${mistake.category}: ` : ''}${mistake.original} -> ${mistake.correction}${mistake.explanation ? `: ${mistake.explanation}` : ''}`
      )
    )
  ];
}

function suggestionParagraphs(suggestions = []) {
  if (!suggestions.length) return [];
  return [
    new Paragraph({
      children: [new TextRun({ text: 'Suggestions', bold: true })],
      spacing: { before: 140, after: 80 }
    }),
    ...suggestions.map((suggestion) =>
      bodyParagraph(
        `${suggestion.category ? `${suggestion.category}: ` : ''}${suggestion.original} -> ${suggestion.correction}${suggestion.explanation ? `: ${suggestion.explanation}` : ''}`
      )
    )
  ];
}

function feedbackReportParagraphs(report) {
  if (!report) return [];

  return [
    headingParagraph(report.title),
    ...(report.level ? [bodyParagraph(`Estimated level: ${report.level}`)] : []),
    ...(report.summary ? [bodyParagraph(report.summary)] : []),
    ...(report.notes || []).map((note) => noteParagraph(note.label, note.text)),
    ...feedbackListParagraphs('Main strengths', report.strengths || []),
    ...feedbackListParagraphs('Priority advice', report.priorities || []),
    ...(report.sections || []).flatMap((section) => [
      new Paragraph({
        children: [new TextRun({ text: section.title, bold: true })],
        spacing: { before: 180, after: 80 }
      }),
      ...(section.question ? [bodyParagraph(`Question: ${section.question}`)] : []),
      ...(section.studentAnswer ? [bodyParagraph(`Student response: ${section.studentAnswer}`)] : []),
      ...(section.note ? [bodyParagraph(section.note)] : []),
      ...(section.notes || []).map((note) => noteParagraph(note.label, note.text)),
      ...feedbackListParagraphs('Missing or weak content', section.bullets || []),
      ...mistakeParagraphs(section.mistakes || []),
      ...suggestionParagraphs(section.suggestions || []),
      ...(section.improvedVersion
        ? [
            new Paragraph({
              children: [new TextRun({ text: 'Improved version', bold: true })],
              spacing: { before: 140, after: 80 }
            }),
            bodyParagraph(section.improvedVersion)
          ]
        : []),
      ...(section.teacherNote ? [bodyParagraph(`Teacher note: ${section.teacherNote}`)] : [])
    ]),
    ...(report.teacherNote ? [bodyParagraph(`Teacher note: ${report.teacherNote}`)] : [])
  ];
}

function feedbackSectionParagraphs(feedback = {}) {
  if (!hasGeneratedFeedback(feedback)) {
    return [];
  }

  return [
    new Paragraph({
      text: 'Automated Feedback',
      style: 'HeadingOneStyle',
      pageBreakBefore: true
    }),
    bodyParagraph('AI-generated Aptis-style feedback. This is not an official Aptis score.'),
    ...FEEDBACK_PARTS.flatMap(([partKey, label]) => {
      const report = buildFeedbackReport(partKey, feedback[partKey]);
      if (!report) {
        return [];
      }

      return feedbackReportParagraphs({ ...report, title: label });
    })
  ];
}

export async function downloadSubmissionDocx({ submissionId, submission, mock, feedback = {} }) {
  const writingMock = mock || getWritingMock(DEFAULT_MOCK_ID);
  const part4Prompt1 = writingMock.part4.prompts[0];
  const part4Prompt2 = writingMock.part4.prompts[1];

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Aptos',
            size: 24
          },
          paragraph: {
            spacing: {
              line: 276
            }
          }
        }
      },
      paragraphStyles: [
        {
          id: 'TitleStyle',
          name: 'Title Style',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            font: 'Aptos',
            size: 32,
            bold: true
          },
          paragraph: {
            spacing: { after: 240 }
          }
        },
        {
          id: 'HeadingOneStyle',
          name: 'Heading One Style',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            font: 'Aptos',
            size: 28,
            bold: true
          },
          paragraph: {
            spacing: { before: 200, after: 120 }
          }
        }
      ]
    },
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: `Aptis General Practice Test - Writing: ${writingMock.title}`,
            style: 'TitleStyle'
          }),
          bodyParagraph('The test has four parts and takes up to 50 minutes.'),
          bodyParagraph('Recommended times:', { spacing: { after: 80 } }),
          ...[
            'Part One: 3 minutes',
            'Part Two: 7 minutes',
            'Part Three: 10 minutes',
            'Part Four: 30 minutes'
          ].map((item) => new Paragraph({
            text: item,
            bullet: { level: 0 },
            spacing: { after: 80 }
          })),
          new Paragraph({ text: '', spacing: { after: 160 } }),
          new Paragraph({
            text: 'Part One: Short answers',
            style: 'HeadingOneStyle'
          }),
          bodyParagraph(writingMock.part1.prompt),
          ...writingMock.part1.questions.flatMap((question, index) => [
            questionParagraph(question),
            answerParagraph(submission.part1[index] || '')
          ]),
          new Paragraph({
            text: 'Part Two: Form completion',
            style: 'HeadingOneStyle',
            pageBreakBefore: true
          }),
          bodyParagraph(writingMock.part2.prompt),
          questionParagraph(writingMock.part2.question),
          answerParagraph(submission.part2),
          new Paragraph({
            text: 'Part Three: Chat room',
            style: 'HeadingOneStyle'
          }),
          bodyParagraph(writingMock.part3.prompt),
          ...writingMock.part3.questions.flatMap((question, index) => [
            questionParagraph(`${question.speaker}: ${question.text}`),
            answerParagraph(submission.part3[index] || '')
          ]),
          new Paragraph({
            text: 'Part Four: Emails',
            style: 'HeadingOneStyle',
            pageBreakBefore: true
          }),
          bodyParagraph(writingMock.part4.intro),
          ...writingMock.part4.sourceEmail.map((line) =>
            bodyParagraph(line, {
              indent: { left: 360 },
              border: {
                left: { color: 'AAAAAA', size: 6, space: 10 }
              }
            })
          ),
          questionParagraph(`1) ${part4Prompt1.heading} ${part4Prompt1.instructions}`),
          answerParagraph(submission.part4[0] || ''),
          questionParagraph(`2) ${part4Prompt2.heading} ${part4Prompt2.instructions}`),
          answerParagraph(submission.part4[1] || ''),
          ...feedbackSectionParagraphs(feedback),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `Submission ID: ${submissionId}`,
                italics: true
              })
            ],
            spacing: { before: 300 }
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${getSubmissionFileBase(submissionId)}.docx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
