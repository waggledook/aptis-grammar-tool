import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getFirestoreAdmin } from "./firebaseAdmin.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, "..", "src", "data", "content", "wordFormation.json");

function normalizeItem(docId, item, index) {
  const itemId = item.itemId || item.id || docId || `wf_${String(index + 1).padStart(4, "0")}`;
  return {
    itemId,
    gappedSentence: item.gappedSentence || "",
    base: item.base || "",
    answer: item.answer || "",
    tags: item.tags || "",
  };
}

async function main() {
  const db = getFirestoreAdmin();
  const snap = await db.collection("masterWordFormations").get();
  const normalized = snap.docs
    .map((docSnap, index) => normalizeItem(docSnap.id, docSnap.data() || {}, index))
    .sort((a, b) => a.itemId.localeCompare(b.itemId));

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");

  console.log(`Exported ${normalized.length} word formation items to ${outputPath}`);
}

main().catch((error) => {
  console.error("Word formation export failed:", error);
  process.exit(1);
});
