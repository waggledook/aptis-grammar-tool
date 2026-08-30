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
import { APTIS_PART4_ERROR_BANK } from "../data/aptisPart4ErrorBank.js";
import { getErrorChunks } from "./errorDetectiveChunks.js";

const INK = "0B2545";
const BLUE = "2E74B5";
const MUTED = "5D6B7A";
const PALE = "E8EEF5";
const BORDER = "D7E0EA";
const GREEN = "176B4B";

function stableHash(value = "") {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function getAnonymousPlayers(players = [], seed = "") {
  return players.map((player) => ({ ...player, sortKey: stableHash(`${seed}:${player.id}`) }))
    .sort((a, b) => a.sortKey - b.sortKey || a.id.localeCompare(b.id))
    .map((player, index) => ({ ...player, anonymousLabel: `Response ${index + 1}` }));
}

function textParagraph(text, options = {}) {
  return new Paragraph({ children: [new TextRun({ text: String(text || ""), color: INK, size: 22 })], spacing: { after: 120, line: 300 }, ...options });
}

function labelledParagraph(label, text, options = {}) {
  return new Paragraph({
    children: [new TextRun({ text: `${label}: `, bold: true, color: BLUE, size: 22 }), new TextRun({ text: String(text || ""), color: INK, size: 22 })],
    spacing: { after: 100, line: 300 },
    ...options,
  });
}

function responseParagraph(label, text) {
  return labelledParagraph(label, text, { indent: { left: 240, right: 120 }, border: { left: { color: BORDER, size: 10, space: 12 } } });
}

function itemSection(item, itemNumber, anonymousPlayers) {
  const chunks = getErrorChunks(item);
  const selectionCounts = anonymousPlayers.reduce((counts, player) => {
    const answer = player.errorDetective?.[item.id];
    if (!answer || !chunks[answer.selectedIndex]) return counts;
    const phrase = chunks[answer.selectedIndex].text;
    counts[phrase] = (counts[phrase] || 0) + 1;
    return counts;
  }, {});
  const corrections = anonymousPlayers.map((player) => ({ label: player.anonymousLabel, text: player.errorDetectiveCorrections?.[item.id]?.correction })).filter((entry) => entry.text);

  return [
    new Paragraph({ text: `${itemNumber}. ${item.sentence}`, style: "HeadingTwoStyle" }),
    labelledParagraph("Correct error location", item.target),
    new Paragraph({ children: [new TextRun({ text: "Class spotting responses", bold: true, color: BLUE, size: 22 })], spacing: { before: 80, after: 60, line: 300 }, keepNext: true }),
    ...(Object.keys(selectionCounts).length
      ? Object.entries(selectionCounts).sort((a, b) => b[1] - a[1]).map(([phrase, count]) => textParagraph(`${phrase} — ${count} ${count === 1 ? "selection" : "selections"}`, { indent: { left: 240 }, keepNext: true }))
      : [textParagraph("No spotting responses submitted.", { indent: { left: 240 } })]),
    new Paragraph({ children: [new TextRun({ text: "Anonymous student corrections", bold: true, color: BLUE, size: 22 })], spacing: { before: 120, after: 60, line: 300 }, keepNext: true }),
    ...(corrections.length ? corrections.map((entry) => responseParagraph(entry.label, entry.text)) : [textParagraph("No corrections submitted.", { indent: { left: 240 } })]),
    new Paragraph({ children: [new TextRun({ text: "Model and teaching note", bold: true, color: GREEN, size: 22 })], spacing: { before: 120, after: 60, line: 300 }, shading: { fill: PALE }, keepNext: true }),
    labelledParagraph("Model", item.correctedSentence, { indent: { left: 240, right: 120 }, keepNext: true }),
    new Paragraph({ children: [new TextRun({ text: item.explanation, italics: true, color: MUTED, size: 20 })], spacing: { after: 220, line: 300 }, indent: { left: 240, right: 120 } }),
  ];
}

export function buildErrorDetectiveLiveReportDocx({ players = [], gameId, round = [], generatedAt = new Date() }) {
  const anonymousPlayers = getAnonymousPlayers(players, gameId);
  const items = round.map((id) => APTIS_PART4_ERROR_BANK.find((item) => item.id === id)).filter(Boolean);
  const participantCount = anonymousPlayers.filter((player) => player.errorDetective || player.errorDetectiveCorrections).length;
  const dateLabel = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(generatedAt);

  return new Document({
    styles: {
      default: { document: { run: { font: "Calibri", size: 22, color: INK }, paragraph: { spacing: { after: 120, line: 300 } } } },
      paragraphStyles: [
        { id: "TitleStyle", name: "Document Title", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Calibri", size: 40, bold: true, color: INK }, paragraph: { spacing: { before: 0, after: 80, line: 300 }, keepNext: true } },
        { id: "HeadingOneStyle", name: "Set Heading", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Calibri", size: 32, bold: true, color: BLUE }, paragraph: { spacing: { before: 360, after: 180, line: 300 }, keepNext: true } },
        { id: "HeadingTwoStyle", name: "Sentence Heading", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Calibri", size: 26, bold: true, color: INK }, paragraph: { spacing: { before: 280, after: 120, line: 300 }, keepNext: true } },
      ],
    },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440, header: 708, footer: 708 } } },
      headers: { default: new Header({ children: [new Paragraph({ children: [new TextRun({ text: "Aptis Writing Part 4 · Error Detective", color: MUTED, size: 18 })], spacing: { after: 80 } })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Anonymous classroom report · Page ", color: MUTED, size: 18 }), new TextRun({ children: [PageNumber.CURRENT], color: MUTED, size: 18 })] })] }) },
      children: [
        new Paragraph({ text: "Error Detective", style: "TitleStyle" }),
        new Paragraph({ children: [new TextRun({ text: `Live classroom report · ${participantCount} anonymous ${participantCount === 1 ? "participant" : "participants"} · ${dateLabel}`, color: MUTED, size: 22 })], spacing: { after: 180, line: 300 } }),
        new Paragraph({ children: [new TextRun({ text: "Student names have been removed. Spotting choices and written corrections are grouped by sentence.", italics: true, color: MUTED, size: 20 })], spacing: { after: 240, line: 300 } }),
        ...items.flatMap((item, index) => [
          ...(index % 4 === 0 ? [new Paragraph({ text: `Set ${Math.floor(index / 4) + 1}`, style: "HeadingOneStyle" })] : []),
          ...itemSection(item, index + 1, anonymousPlayers),
        ]),
      ],
    }],
  });
}

export async function downloadErrorDetectiveLiveReportDocx({ players, gameId, round }) {
  const doc = buildErrorDetectiveLiveReportDocx({ players, gameId, round });
  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `aptis-error-detective-${gameId || "live"}-report.docx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 500);
}
