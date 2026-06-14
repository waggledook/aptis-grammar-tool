import admin from "firebase-admin";
import { getFirestoreAdmin } from "./firebaseAdmin.mjs";
import { APTIS_TRAINER_ACCESS_KEY } from "../src/siteConfig.js";

function getTodayLocalIsoDate() {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzOffset).toISOString().slice(0, 10);
}

function parseArgs(argv) {
  return argv.reduce(
    (acc, arg) => {
      if (arg === "--apply") acc.apply = true;
      if (arg === "--overwrite") acc.overwrite = true;
      if (arg.startsWith("--start=")) acc.startDate = arg.slice("--start=".length);
      return acc;
    },
    {
      apply: false,
      overwrite: false,
      startDate: getTodayLocalIsoDate(),
    }
  );
}

function hasExistingAptisAccess(userData = {}) {
  return Object.prototype.hasOwnProperty.call(
    userData.siteAccess || {},
    APTIS_TRAINER_ACCESS_KEY
  );
}

function labelForUser(user = {}) {
  return user.email || user.username || user.name || user.displayName || user.id;
}

async function commitInBatches(db, docs, payload) {
  let batch = db.batch();
  let batchSize = 0;
  let written = 0;

  for (const entry of docs) {
    batch.update(entry.ref, {
      [`siteAccess.${APTIS_TRAINER_ACCESS_KEY}`]: payload,
      aptisTrainerGrandfatheredAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    batchSize += 1;
    written += 1;

    if (batchSize === 450) {
      await batch.commit();
      batch = db.batch();
      batchSize = 0;
    }
  }

  if (batchSize > 0) {
    await batch.commit();
  }

  return written;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const db = getFirestoreAdmin();
  const snap = await db.collection("users").get();
  const payload = {
    active: true,
    startDate: options.startDate,
    endDate: "",
    indefinite: true,
    grantReason: "grandfathered-existing-user",
  };

  const rows = snap.docs.map((entry) => ({
    id: entry.id,
    ref: entry.ref,
    data: entry.data() || {},
  }));

  const alreadyConfigured = rows.filter((entry) => hasExistingAptisAccess(entry.data));
  const candidates = rows.filter(
    (entry) => options.overwrite || !hasExistingAptisAccess(entry.data)
  );

  console.log(`Aptis Trainer access grandfathering`);
  console.log(`Mode: ${options.apply ? "APPLY" : "DRY RUN"}`);
  console.log(`Start date: ${payload.startDate}`);
  console.log(`Overwrite existing aptisTrainer access: ${options.overwrite ? "yes" : "no"}`);
  console.log(`Total user docs: ${rows.length}`);
  console.log(`Already configured: ${alreadyConfigured.length}`);
  console.log(`Will grant/update: ${candidates.length}`);

  if (candidates.length) {
    console.log("");
    console.log("Sample affected users:");
    candidates.slice(0, 12).forEach((entry) => {
      console.log(`- ${labelForUser({ id: entry.id, ...entry.data })}`);
    });
    if (candidates.length > 12) {
      console.log(`- ...and ${candidates.length - 12} more`);
    }
  }

  if (!options.apply) {
    console.log("");
    console.log("Dry run only. Re-run with --apply to write these access grants.");
    return;
  }

  const written = await commitInBatches(db, candidates, payload);
  console.log("");
  console.log(`Done. Wrote Aptis Trainer access for ${written} user doc(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
