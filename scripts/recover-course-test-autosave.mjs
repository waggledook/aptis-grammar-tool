import fs from "node:fs";
import path from "node:path";
import admin from "firebase-admin";
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

function parseDate(value, label) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
  date.setSeconds(0, 0);
  return date;
}

function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIso(value) {
  const date = toDate(value);
  return date ? date.toISOString() : "";
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

function plainValue(value) {
  if (value == null) return value;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(plainValue);
  if (typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, plainValue(entry)]));
  }
  return value;
}

function printUsage() {
  console.log(`
Usage:
  node scripts/recover-course-test-autosave.mjs --attempt ATTEMPT_ID --from "2026-05-13T09:00:00Z" --to "2026-05-13T10:30:00Z" --export-best
  node scripts/recover-course-test-autosave.mjs --attempt ATTEMPT_ID --at "2026-05-13T09:45:00Z" --export

Options:
  --attempt       Required courseTestAttempts document id.
  --at            Read exactly one older version at this timestamp.
  --from          Scan start timestamp. Defaults to the attempt startedAt.
  --to            Scan end timestamp. Defaults to the attempt updatedAt/submittedAt.
  --step-minutes  Scan interval. Default 1.
  --export        Export every version that contains answers.
  --export-best   Export only the version with the most non-empty answer slots.

Notes:
  Firestore point-in-time reads are only available if the project still retains
  that timestamp. Without PITR, this may only work for a short recent window.
`);
}

async function readAttemptAt(db, attemptId, date) {
  const ref = db.collection("courseTestAttempts").doc(attemptId);
  const readTime = admin.firestore.Timestamp.fromDate(date);
  return db.runTransaction(
    async (transaction) => {
      const snap = await transaction.get(ref);
      return snap.exists ? { id: snap.id, readAt: date.toISOString(), ...snap.data() } : null;
    },
    { readOnly: true, readTime }
  );
}

async function exportVersion(row, suffix) {
  const outDir = path.resolve("tmp/course-test-autosaves");
  fs.mkdirSync(outDir, { recursive: true });
  const safeSuffix = suffix.replace(/[^a-z0-9._-]/gi, "_");
  const outPath = path.join(outDir, `${row.id}-${safeSuffix}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(plainValue(row), null, 2)}\n`);
  console.log(`Exported ${outPath}`);
}

async function main() {
  const attemptId = getArg("attempt");
  const at = parseDate(getArg("at"), "--at");
  const stepMinutes = Math.max(1, Number(getArg("step-minutes") || 1));
  const shouldExport = hasFlag("export");
  const shouldExportBest = hasFlag("export-best");

  if (!attemptId) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const db = getFirestoreAdmin();
  const liveSnap = await db.collection("courseTestAttempts").doc(attemptId).get();
  if (!liveSnap.exists) {
    throw new Error(`No live attempt found for ${attemptId}`);
  }
  const live = { id: liveSnap.id, ...liveSnap.data() };

  if (at) {
    const row = await readAttemptAt(db, attemptId, at);
    const counts = countAnswerValues(row?.runnerState?.sectionAnswers || {});
    console.log(`Read ${attemptId} at ${at.toISOString()}: ${counts.answered}/${counts.slots} non-empty answer slots`);
    if (row && counts.answered > 0 && (shouldExport || shouldExportBest)) {
      await exportVersion(row, at.toISOString());
    }
    return;
  }

  const from =
    parseDate(getArg("from"), "--from") ||
    parseDate(toIso(live.startedAt), "startedAt");
  const to =
    parseDate(getArg("to"), "--to") ||
    parseDate(toIso(live.submittedAt || live.updatedAt), "updatedAt/submittedAt");

  if (!from || !to) {
    throw new Error("Could not infer scan range. Pass --from and --to explicitly.");
  }
  if (from > to) {
    throw new Error("--from must be before --to.");
  }

  console.log(`Scanning ${attemptId} from ${from.toISOString()} to ${to.toISOString()} every ${stepMinutes} minute(s).`);
  console.log("If this fails with an out-of-range readTime error, Firestore no longer has that timestamp available.");

  const versionsWithAnswers = [];
  let best = null;

  for (let t = from.getTime(); t <= to.getTime(); t += stepMinutes * 60 * 1000) {
    const date = new Date(t);
    let row = null;
    try {
      row = await readAttemptAt(db, attemptId, date);
    } catch (error) {
      const message = String(error?.message || error);
      if (message.includes("read_time") || message.includes("readTime")) {
        console.log(`${date.toISOString()}  unavailable (${message})`);
        continue;
      }
      throw error;
    }
    const counts = countAnswerValues(row?.runnerState?.sectionAnswers || {});
    console.log(`${date.toISOString()}  answers ${counts.answered}/${counts.slots}`);

    if (row && counts.answered > 0) {
      const version = { row, counts };
      versionsWithAnswers.push(version);
      if (!best || counts.answered > best.counts.answered) best = version;
      if (shouldExport) {
        await exportVersion(row, date.toISOString());
      }
    }
  }

  console.log("");
  console.log(`Found ${versionsWithAnswers.length} retained version(s) with answers.`);
  if (best) {
    console.log(`Best version: ${best.row.readAt} with ${best.counts.answered}/${best.counts.slots} non-empty answer slots.`);
    if (shouldExportBest) {
      await exportVersion(best.row, `best-${best.row.readAt}`);
    }
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
