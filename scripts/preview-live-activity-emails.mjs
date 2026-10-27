import {createRequire} from "node:module";
import {writeFile} from "node:fs/promises";

const require = createRequire(import.meta.url);
const {buildLiveGameEmail} = require("../functions/live-game-email.js");
const createdAt = Date.parse("2026-10-26T15:00:00Z");
const sample = {
  gameId: "example-session",
  host: {displayName: "Sample Teacher", email: "teacher@example.com"},
  game: {
    type: "textbook-vocabulary-live", title: "Everyday objects · vocabulary quiz", site: "seifhub",
    ownerUid: "sample-host", pin: "123456", createdAt,
    items: [
      {sentence: "Which word means a place to keep your clothes?", level: "A1", sourceThemeTitle: "At home"},
      {sentence: "Match the objects to their names", level: "A1", sourceThemeTitle: "At home"},
      {sentence: "Name the object in the picture", level: "A1", sourceThemeTitle: "At home"},
    ],
    players: {ana: {name: "Ana"}, ben: {name: "Ben"}, cara: {name: "Cara"}},
    answers: {
      0: {ana: {correct: true, scoreDelta: 900}, ben: {correct: false, scoreDelta: 0}},
      1: {ana: {correct: false, correctCount: 3, totalCount: 4, scoreDelta: 500}, ben: {correct: true, correctCount: 4, totalCount: 4, scoreDelta: 700}},
      2: {ana: {correct: true, scoreDelta: 700}},
    },
  },
  createdAt, startedAt: createdAt + 120000, finishedAt: createdAt + 600000,
};
const escapeAttribute = (value) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const sections = ["launched", "finished"].map((kind) => {
  const email = buildLiveGameEmail({...sample, kind});
  return `<section><h2>${kind === "launched" ? "Launch email" : "Completion email"}</h2><p class="subject"><strong>Subject:</strong> ${escapeAttribute(email.subject)}</p><iframe title="${kind} email preview" srcdoc="${escapeAttribute(email.html)}"></iframe></section>`;
}).join("");
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Live activity email previews</title><style>body{font-family:Arial,sans-serif;background:#e2e8f0;color:#172033;margin:0;padding:24px}h1{font-size:24px}main{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}section{min-width:0}.subject{font-size:14px;line-height:1.6;min-height:48px}iframe{width:100%;height:1500px;border:1px solid #cbd5e1;background:#f1f5f9;border-radius:8px}h2{font-size:18px}header p{color:#52627a}@media(max-width:1000px){main{grid-template-columns:1fr}body{padding:16px}}</style></head><body><header><h1>Live activity email previews</h1><p>Sample data only. These previews use the production email builder.</p></header><main>${sections}</main></body></html>`;
const target = new URL("../docs/live-activity-email-preview.html", import.meta.url);
await writeFile(target, html);
console.log(`Preview generated: ${target.pathname}`);
