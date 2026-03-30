import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import admin from "firebase-admin";
import { getFirestoreAdmin } from "./firebaseAdmin.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inputPath = path.join(__dirname, "..", "src", "data", "content", "openCloze.json");

function ensureString(value, fieldName, itemId) {
  if (typeof value !== "string") {
    throw new Error(`Open cloze item ${itemId} has invalid ${fieldName}; expected a string.`);
  }
  return value;
}

function ensureAnswer(value, itemId) {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value) && value.every((entry) => typeof entry === "string")) {
    return value;
  }
  throw new Error(`Open cloze item ${itemId} has invalid answer; expected a string or array of strings.`);
}

function normalizeItem(item, index) {
  const itemId = ensureString(item.itemId || `oc_${String(index + 1).padStart(4, "0")}`, "itemId", `row_${index + 1}`);
  return {
    itemId,
    gappedSentence: ensureString(item.gappedSentence || "", "gappedSentence", itemId),
    answer: ensureAnswer(item.answer ?? "", itemId),
    tags: ensureString(item.tags || "", "tags", itemId),
  };
}

function validate(items) {
  const seen = new Set();
  items.forEach((item) => {
    if (!item.itemId) throw new Error("Every open cloze item must have an itemId.");
    if (seen.has(item.itemId)) throw new Error(`Duplicate open cloze itemId: ${item.itemId}`);
    seen.add(item.itemId);
  });
}

async function main() {
  const db = getFirestoreAdmin();
  const raw = JSON.parse(await fs.readFile(inputPath, "utf8"));
  const items = (Array.isArray(raw) ? raw : []).map(normalizeItem);
  validate(items);

  await db.doc("masterOpenCloze/all").set(
    {
      list: items,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      count: items.length,
      source: "repo-sync",
    },
    { merge: true }
  );

  console.log(`Synced ${items.length} open cloze items to masterOpenCloze/all.list`);
}

main().catch((error) => {
  console.error("Open cloze sync failed:", error);
  process.exit(1);
});
