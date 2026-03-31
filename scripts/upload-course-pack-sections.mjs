import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getStorageBucketAdmin } from "./firebaseAdmin.mjs";
import { COURSE_PACK_SECTIONS } from "../src/components/coursepack/coursePackSections.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SOURCE_DIR = path.join(__dirname, "..", "coursepack-sections");

async function main() {
  const bucket = getStorageBucketAdmin();

  for (const section of COURSE_PACK_SECTIONS) {
    const localPath = path.join(SOURCE_DIR, `${section.id}.pdf`);
    if (!fs.existsSync(localPath)) {
      throw new Error(`Missing section PDF: ${localPath}`);
    }

    await bucket.upload(localPath, {
      destination: section.storagePath,
      metadata: {
        contentType: "application/pdf",
        cacheControl: "public, max-age=31536000, immutable",
      },
    });

    console.log(`Uploaded ${section.id} -> ${section.storagePath}`);
  }
}

main().catch((error) => {
  console.error("Course pack upload failed:", error);
  process.exit(1);
});
