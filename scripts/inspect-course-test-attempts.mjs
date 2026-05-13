import fs from "node:fs";
import path from "node:path";
import { getFirestoreAdmin } from "./firebaseAdmin.mjs";

function getArg(name) {
  const prefix = `--${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length).trim();

  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0) return String(process.argv[index + 1] || "").trim();
  return "";
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function toMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function toIso(value) {
  if (!value) return "";
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
}

function valueHasAnswer(value) {
  if (value == null) return false;
  if (Array.isArray(value)) return value.some(valueHasAnswer);
  if (typeof value === "object") return Object.values(value).some(valueHasAnswer);
  return String(value).trim().length > 0;
}

function countAnswerValues(sectionAnswers = {}) {
  let answered = 0;
  let slots = 0;

  for (const items of Object.values(sectionAnswers || {})) {
    if (!items || typeof items !== "object") continue;
    for (const value of Object.values(items)) {
      slots += 1;
      if (valueHasAnswer(value)) answered += 1;
    }
  }

  return { answered, slots };
}

function lower(value) {
  return String(value || "").toLowerCase();
}

function matchesText(value, needle) {
  return !needle || lower(value).includes(lower(needle));
}

function serializable(data) {
  return JSON.parse(JSON.stringify(data));
}

function printUsage() {
  console.log(`
Usage:
  node scripts/inspect-course-test-attempts.mjs --student "name or email"
  node scripts/inspect-course-test-attempts.mjs --uid STUDENT_UID
  node scripts/inspect-course-test-attempts.mjs --session SESSION_ID
  node scripts/inspect-course-test-attempts.mjs --attempt ATTEMPT_ID --export

Options:
  --student   Case-insensitive match against studentName/studentEmail.
  --uid       Exact studentUid.
  --session   Exact courseTestSessions document id.
  --attempt   Exact courseTestAttempts document id.
  --export    Write matching full attempt JSON files into tmp/course-test-attempts.
  --limit     Max results to print, default 20.
`);
}

async function loadAttempts(db, { attemptId, uid, sessionId }) {
  if (attemptId) {
    const snap = await db.collection("courseTestAttempts").doc(attemptId).get();
    return snap.exists ? [{ id: snap.id, ...snap.data() }] : [];
  }

  let query = db.collection("courseTestAttempts");
  if (uid) query = query.where("studentUid", "==", uid);
  if (sessionId) query = query.where("sessionId", "==", sessionId);

  const snap = await query.get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function main() {
  const student = getArg("student");
  const uid = getArg("uid");
  const sessionId = getArg("session");
  const attemptId = getArg("attempt");
  const shouldExport = hasFlag("export");
  const limit = Number(getArg("limit") || 20);

  if (!student && !uid && !sessionId && !attemptId) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const db = getFirestoreAdmin();
  let rows = await loadAttempts(db, { attemptId, uid, sessionId });

  if (student) {
    rows = rows.filter(
      (row) => matchesText(row.studentName, student) || matchesText(row.studentEmail, student)
    );
  }

  rows.sort((a, b) => {
    const aTime = toMillis(a.submittedAt) || toMillis(a.updatedAt) || toMillis(a.startedAt);
    const bTime = toMillis(b.submittedAt) || toMillis(b.updatedAt) || toMillis(b.startedAt);
    return bTime - aTime;
  });

  const limitedRows = rows.slice(0, Number.isFinite(limit) && limit > 0 ? limit : 20);

  console.log(`Found ${rows.length} matching attempt(s). Showing ${limitedRows.length}.`);
  for (const row of limitedRows) {
    const sectionAnswers = row.runnerState?.sectionAnswers || {};
    const { answered, slots } = countAnswerValues(sectionAnswers);
    const sectionIds = Object.keys(sectionAnswers);

    console.log("");
    console.log(`Attempt: ${row.id}`);
    console.log(`Student: ${row.studentName || "unknown"} (${row.studentEmail || row.studentUid || "no id"})`);
    console.log(`Session: ${row.sessionId || ""}`);
    console.log(`Template: ${row.templateTitle || row.templateId || ""}`);
    console.log(`Started: ${toIso(row.startedAt) || "n/a"}`);
    console.log(`Updated: ${toIso(row.updatedAt) || "n/a"}`);
    console.log(`Submitted: ${toIso(row.submittedAt) || "n/a"}`);
    console.log(`Completed: ${Boolean(row.completed)} | Review: ${row.reviewStatus || "n/a"}`);
    console.log(`Answer slots: ${answered}/${slots} non-empty across ${sectionIds.length} section(s)`);
    console.log(`Scores: auto ${row.autoScore ?? 0}/${row.autoTotal ?? 0}, percent ${row.percent ?? 0}`);
  }

  if (shouldExport && limitedRows.length) {
    const outDir = path.resolve("tmp/course-test-attempts");
    fs.mkdirSync(outDir, { recursive: true });
    for (const row of limitedRows) {
      const outPath = path.join(outDir, `${row.id}.json`);
      fs.writeFileSync(outPath, `${JSON.stringify(serializable(row), null, 2)}\n`);
      console.log(`Exported ${outPath}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
