import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getFirestoreAdmin } from "./firebaseAdmin.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, "..", "src", "data", "content", "openCloze.json");

function normalizeItem(item, index) {
  const itemId = item.itemId || item.id || `oc_${String(index + 1).padStart(4, "0")}`;
  return {
    itemId,
    gappedSentence: item.gappedSentence || "",
    answer: item.answer || "",
    tags: item.tags || "",
  };
}

async function main() {
  const db = getFirestoreAdmin();
  const snap = await db.doc("masterOpenCloze/all").get();
  const data = snap.exists ? snap.data() || {} : {};
  const list = Array.isArray(data.list) ? data.list : [];

  const normalized = list.map(normalizeItem).sort((a, b) => a.itemId.localeCompare(b.itemId));

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");

  console.log(`Exported ${normalized.length} open cloze items to ${outputPath}`);
}

main().catch((error) => {
  console.error("Open cloze export failed:", error);
  process.exit(1);
});
