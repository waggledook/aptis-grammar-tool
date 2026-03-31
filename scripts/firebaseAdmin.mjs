import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import admin from "firebase-admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveServiceAccountPath() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }

  const localPath = path.join(__dirname, "serviceAccountKey.json");
  if (fs.existsSync(localPath)) {
    return localPath;
  }

  return null;
}

function readServiceAccount(serviceAccountPath) {
  const raw = fs.readFileSync(serviceAccountPath, "utf8");
  return JSON.parse(raw);
}

export function getFirestoreAdmin() {
  if (!admin.apps.length) {
    const serviceAccountPath = resolveServiceAccountPath();

    if (!serviceAccountPath) {
      throw new Error(
        "No Firebase Admin credentials found. Set GOOGLE_APPLICATION_CREDENTIALS or add scripts/serviceAccountKey.json."
      );
    }

    const serviceAccount = readServiceAccount(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  return admin.firestore();
}

export function getStorageBucketAdmin() {
  if (!admin.apps.length) {
    getFirestoreAdmin();
  }
  return admin.storage().bucket("examplay-auth.firebasestorage.app");
}
