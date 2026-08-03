import admin from "firebase-admin";
import { getFirestoreAdmin } from "./firebaseAdmin.mjs";

const CREDIT_FLOOR = 120;
const MIGRATION_ID = "student-weekly-feedback-credit-floor-120";

function parseArgs(argv) {
  return { apply: argv.includes("--apply") };
}

function effectiveStudentLimit(userData = {}) {
  const rawValue = userData.writingFeedbackWeeklyCredits;
  if (rawValue === undefined || rawValue === null || rawValue === "") return null;

  const numericValue = Number(rawValue);
  return Number.isFinite(numericValue) ? Math.max(0, Math.floor(numericValue)) : null;
}

async function commitInBatches(db, candidates) {
  let batch = db.batch();
  let batchSize = 0;
  let written = 0;

  for (const candidate of candidates) {
    batch.set(
      candidate.ref,
      {
        writingFeedbackWeeklyCredits: CREDIT_FLOOR,
        writingFeedbackCreditsUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        writingFeedbackCreditsUpdatedBy: MIGRATION_ID,
      },
      { merge: true }
    );
    batchSize += 1;
    written += 1;

    if (batchSize === 450) {
      await batch.commit();
      batch = db.batch();
      batchSize = 0;
    }
  }

  if (batchSize > 0) await batch.commit();
  return written;
}

async function main() {
  const { apply } = parseArgs(process.argv.slice(2));
  const db = getFirestoreAdmin();
  const snap = await db.collection("users").get();
  const students = snap.docs
    .map((entry) => ({ ref: entry.ref, data: entry.data() || {} }))
    .filter((entry) => (entry.data.role || "student") === "student");

  const candidates = [];
  let withoutCustomLimit = 0;
  let belowFloor = 0;
  let atFloor = 0;
  let aboveFloor = 0;

  students.forEach((entry) => {
    const limit = effectiveStudentLimit(entry.data);
    if (limit === null) {
      withoutCustomLimit += 1;
      candidates.push(entry);
    } else if (limit < CREDIT_FLOOR) {
      belowFloor += 1;
      candidates.push(entry);
    } else if (limit === CREDIT_FLOOR) {
      atFloor += 1;
    } else {
      aboveFloor += 1;
    }
  });

  console.log("Student weekly AI feedback credit floor");
  console.log(`Mode: ${apply ? "APPLY" : "DRY RUN"}`);
  console.log(`Credit floor: ${CREDIT_FLOOR}`);
  console.log(`Total user documents: ${snap.size}`);
  console.log(`Student accounts: ${students.length}`);
  console.log(`No custom allocation: ${withoutCustomLimit}`);
  console.log(`Custom allocation below ${CREDIT_FLOOR}: ${belowFloor}`);
  console.log(`Already at ${CREDIT_FLOOR}: ${atFloor}`);
  console.log(`Above ${CREDIT_FLOOR} (unchanged): ${aboveFloor}`);
  console.log(`Accounts to update: ${candidates.length}`);

  if (!apply) {
    console.log("Dry run only. Re-run with --apply to update these accounts.");
    return;
  }

  const written = await commitInBatches(db, candidates);
  console.log(`Done. Updated ${written} student account(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
