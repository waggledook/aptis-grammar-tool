import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getFirestoreAdmin } from "./firebaseAdmin.mjs";

const OLD_TAG = "unreal forms";
const NEW_TAG = "Unreal forms";
const EXPECTED_ITEM_COUNT = 19;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(__dirname, "unreal-forms-grammar-items.json");

function parseArgs(argv) {
  return { apply: argv.includes("--apply") };
}

function loadItemIds() {
  const items = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const ids = items.map((item) => String(item.id || "").trim()).filter(Boolean);

  if (ids.length !== EXPECTED_ITEM_COUNT || new Set(ids).size !== ids.length) {
    throw new Error(
      `Expected ${EXPECTED_ITEM_COUNT} unique Unreal forms item IDs; found ${ids.length}.`
    );
  }
  if (items.some((item) => item.tag !== NEW_TAG)) {
    throw new Error(`Every source item must use the tag “${NEW_TAG}” before migration.`);
  }

  return ids;
}

function normalizedTags(data = {}) {
  if (Array.isArray(data.tags)) return data.tags;
  if (typeof data.tag === "string" && data.tag) return [data.tag];
  return [];
}

async function inspectItems(db, ids) {
  const snapshots = await Promise.all(
    ids.map((id) => db.collection("grammarItems").doc(id).get())
  );

  const missing = snapshots.filter((snapshot) => !snapshot.exists).map((snapshot) => snapshot.id);
  const candidates = [];
  const alreadyUpdated = [];
  const unexpected = [];

  snapshots.forEach((snapshot) => {
    if (!snapshot.exists) return;
    const tags = normalizedTags(snapshot.data());
    if (tags.includes(OLD_TAG)) {
      candidates.push({
        ref: snapshot.ref,
        tags: tags.map((tag) => (tag === OLD_TAG ? NEW_TAG : tag)),
      });
    } else if (tags.includes(NEW_TAG)) {
      alreadyUpdated.push(snapshot.id);
    } else {
      unexpected.push({ id: snapshot.id, tags });
    }
  });

  return { candidates, alreadyUpdated, missing, unexpected };
}

async function main() {
  const { apply } = parseArgs(process.argv.slice(2));
  const ids = loadItemIds();
  const db = getFirestoreAdmin();
  const inspection = await inspectItems(db, ids);

  console.log("Capitalize Unreal forms grammar tag");
  console.log(`Mode: ${apply ? "APPLY" : "DRY RUN"}`);
  console.log(`Source items: ${ids.length}`);
  console.log(`Items to update: ${inspection.candidates.length}`);
  console.log(`Already updated: ${inspection.alreadyUpdated.length}`);
  console.log(`Missing documents: ${inspection.missing.length}`);
  console.log(`Unexpected tags: ${inspection.unexpected.length}`);

  if (inspection.missing.length || inspection.unexpected.length) {
    console.log(JSON.stringify({
      missing: inspection.missing,
      unexpected: inspection.unexpected,
    }, null, 2));
    throw new Error("Refusing to write because the live grammar bank did not match expectations.");
  }

  if (!apply) {
    console.log("Dry run only. Re-run with --apply to update the matching tags.");
    return;
  }

  if (inspection.candidates.length) {
    const batch = db.batch();
    inspection.candidates.forEach(({ ref, tags }) => batch.update(ref, { tags }));
    await batch.commit();
  }

  const verification = await inspectItems(db, ids);
  if (
    verification.candidates.length ||
    verification.missing.length ||
    verification.unexpected.length ||
    verification.alreadyUpdated.length !== ids.length
  ) {
    throw new Error("Post-write verification failed.");
  }

  console.log(`Done. Verified ${verification.alreadyUpdated.length} item(s) with “${NEW_TAG}”.`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
