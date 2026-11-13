import admin from "firebase-admin";
import fs from "node:fs/promises";
import reviewPolicy from "../functions/speaking-workshop-review-policy.js";
import { getFirestoreAdmin } from "./firebaseAdmin.mjs";

const { getSpeakingWorkshopReviewCorrection } = reviewPolicy;
const MIGRATION_ID = "speaking-workshop-four-week-review-2026-11-13";
const apply = process.argv.includes("--apply");
const backupArg = process.argv.indexOf("--backup");
const backupPath = backupArg >= 0 ? process.argv[backupArg + 1] : null;
if (apply && (!backupPath || backupPath.startsWith("--"))) {
  throw new Error("Use --backup <path> with --apply to save the original deadlines.");
}

const db = getFirestoreAdmin();
try {
  const snap = await db.collection("speakingWorkshopSessions").get();
  const candidates = snap.docs.filter((doc) => (
    getSpeakingWorkshopReviewCorrection(doc.data()) !== null
  ));
  const preview = candidates.map((doc) => ({
    id: doc.id,
    label: doc.data().label,
    endedAt: doc.data().endedAt.toDate().toISOString(),
    oldReviewUntil: doc.data().reviewUntil.toDate().toISOString(),
    newReviewUntil: new Date(getSpeakingWorkshopReviewCorrection(doc.data())).toISOString(),
  }));
  console.log(JSON.stringify({ mode: apply ? "apply" : "preview", count: preview.length, sessions: preview }, null, 2));
  if (apply) {
    await fs.writeFile(backupPath, JSON.stringify({ migration: MIGRATION_ID, sessions: preview }, null, 2), { flag: "wx", mode: 0o600 });
    let corrected = 0;
    for (const candidate of candidates) {
      const auditRef = db.collection("speakingWorkshopAudit").doc(candidate.id)
        .collection("events").doc(MIGRATION_ID);
      const updated = await db.runTransaction(async (transaction) => {
        const current = await transaction.get(candidate.ref);
        if (!current.exists) return false;
        const data = current.data();
        const correctedMs = getSpeakingWorkshopReviewCorrection(data);
        // Skip any session changed since the preview/backup was taken.
        if (correctedMs === null || !current.updateTime.isEqual(candidate.updateTime)) return false;
        const audit = {
          action: "review_period_corrected",
          actorUid: MIGRATION_ID,
          actorEmail: null,
          actorRole: "system",
          at: admin.firestore.FieldValue.serverTimestamp(),
          label: data.label || "Speaking workshop",
          fromPhase: "review",
          toPhase: "review",
          previousReviewUntil: data.reviewUntil,
          reviewUntil: admin.firestore.Timestamp.fromMillis(correctedMs),
        };
        transaction.update(candidate.ref, {
          reviewUntil: audit.reviewUntil,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastAction: audit,
        });
        transaction.set(auditRef, audit);
        return true;
      });
      if (updated) corrected += 1;
    }
    console.log(JSON.stringify({ corrected, skippedAfterPreview: candidates.length - corrected, backupPath }));
  }
} finally {
  await db.terminate();
}
