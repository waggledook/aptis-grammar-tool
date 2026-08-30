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
import { REGISTER_SURGERY_EMAILS } from "../data/aptisWritingRegisterSurgery.js";

const INK = "0B2545";
const BLUE = "2E74B5";
const MUTED = "5D6B7A";
const PALE = "E8EEF5";
const BORDER = "D7E0EA";

function stableHash(value = "") {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function getAnonymousPlayers(players = [], seed = "") {
  return players
    .map((player) => ({ ...player, anonymousSortKey: stableHash(`${seed}:${player.id}`) }))
    .sort((a, b) => a.anonymousSortKey - b.anonymousSortKey || a.id.localeCompare(b.id))
    .map((player, index) => ({ ...player, anonymousLabel: `Response ${index + 1}` }));
}

function cleanText(value) {
  return String(value || "").trim();
}

function bodyParagraph(text, options = {}) {
  return new Paragraph({
    children: [new TextRun({ text: cleanText(text) || "(no response)", color: INK, size: 22 })],
    spacing: { after: 120, line: 300 },
    ...options,
  });
}

function responseParagraph(label, text) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, color: BLUE, size: 22 }),
      new TextRun({ text: cleanText(text), color: INK, size: 22 }),
    ],
    spacing: { after: 100, line: 300 },
    indent: { left: 240, right: 120 },
    border: { left: { color: BORDER, size: 10, space: 12 } },
  });
}

function teacherNote(item) {
  return [
    new Paragraph({
      children: [new TextRun({ text: "Teacher examples", bold: true, color: BLUE, size: 22 })],
      spacing: { before: 100, after: 60, line: 300 },
      keepNext: true,
      shading: { fill: PALE },
    }),
    bodyParagraph(item.suggestions.join(" / "), { indent: { left: 240, right: 120 }, keepNext: true }),
    new Paragraph({
      children: [new TextRun({ text: item.explanation, italics: true, color: MUTED, size: 20 })],
      spacing: { after: 200, line: 300 },
      indent: { left: 240, right: 120 },
    }),
  ];
}

function rewriteSection(kind, anonymousPlayers) {
  const email = REGISTER_SURGERY_EMAILS[kind];
  return [
    new Paragraph({
      text: `${kind === "informal" ? "Informal" : "Formal"} email rewrites`,
      style: "HeadingOneStyle",
    }),
    ...email.rewrites.flatMap((item, index) => {
      const answers = anonymousPlayers
        .map((player) => ({
          label: player.anonymousLabel,
          text: player.registerSurgery?.rewrites?.[kind]?.answers?.[item.id],
        }))
        .filter((entry) => entry.text);
      return [
        new Paragraph({ text: `${index + 1}. ${item.original}`, style: "HeadingTwoStyle" }),
        ...(answers.length
          ? answers.map((answer) => responseParagraph(answer.label, answer.text))
          : [bodyParagraph("No responses submitted.", { indent: { left: 240 } })]),
        ...teacherNote(item),
      ];
    }),
  ];
}

export function buildRegisterSurgeryLiveReportDocx({ players, gameId, generatedAt = new Date() }) {
  const anonymousPlayers = getAnonymousPlayers(players, gameId);
  const submittedCount = anonymousPlayers.filter((player) =>
    player.registerSurgery?.rewrites?.informal || player.registerSurgery?.rewrites?.formal
  ).length;
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
          name: "Section Heading",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { font: "Calibri", size: 32, bold: true, color: BLUE },
          paragraph: { spacing: { before: 360, after: 200, line: 300 }, keepNext: true },
        },
        {
          id: "HeadingTwoStyle",
          name: "Phrase Heading",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { font: "Calibri", size: 26, bold: true, color: INK },
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
            children: [new TextRun({ text: "Aptis Writing Part 4 · Register Surgery", color: MUTED, size: 18 })],
            spacing: { after: 80 },
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "Anonymous classroom rewrites · Page ", color: MUTED, size: 18 }),
              new TextRun({ children: [PageNumber.CURRENT], color: MUTED, size: 18 }),
            ],
          })],
        }),
      },
      children: [
        new Paragraph({ text: "Register Surgery", style: "TitleStyle" }),
        bodyParagraph(`Live classroom rewrite report · ${submittedCount} anonymous ${submittedCount === 1 ? "participant" : "participants"} · ${dateLabel}`, {
          children: [new TextRun({
            text: `Live classroom rewrite report · ${submittedCount} anonymous ${submittedCount === 1 ? "participant" : "participants"} · ${dateLabel}`,
            color: MUTED,
            size: 22,
          })],
          spacing: { after: 220, line: 300 },
        }),
        new Paragraph({
          children: [new TextRun({
            text: "Student names have been removed. Responses use the same stable random order as the live teacher display.",
            italics: true,
            color: MUTED,
            size: 20,
          })],
          spacing: { after: 240, line: 300 },
        }),
        ...rewriteSection("informal", anonymousPlayers),
        ...rewriteSection("formal", anonymousPlayers),
      ],
    }],
  });
}

export async function downloadRegisterSurgeryLiveReportDocx({ players, gameId }) {
  const doc = buildRegisterSurgeryLiveReportDocx({ players, gameId });
  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `aptis-register-surgery-${gameId || "live"}-rewrites.docx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 500);
}
