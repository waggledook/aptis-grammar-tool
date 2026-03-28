#!/usr/bin/env node
/* eslint-disable no-undef */
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

function parseArgs(argv) {
  const args = {
    project: process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "",
    uids: [],
    write: false,
    includeSubcollections: false,
    backupDir: "",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--project" && argv[i + 1]) {
      args.project = argv[i + 1];
      i += 1;
    } else if (token === "--uid" && argv[i + 1]) {
      args.uids.push(argv[i + 1]);
      i += 1;
    } else if (token === "--write") {
      args.write = true;
    } else if (token === "--include-subcollections") {
      args.includeSubcollections = true;
    } else if (token === "--backup-dir" && argv[i + 1]) {
      args.backupDir = argv[i + 1];
      i += 1;
    }
  }

  return args;
}

function initAdmin(projectId) {
  const options = {};
  if (projectId) options.projectId = projectId;

  try {
    admin.initializeApp(options);
  } catch (err) {
    if (!/already exists/u.test(String(err && err.message))) {
      throw err;
    }
  }
}

function formatDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return value;
}

function serialize(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(serialize);
  if (typeof value === "object") {
    if (typeof value.toDate === "function") {
      return value.toDate().toISOString();
    }
    const out = {};
    Object.entries(value).forEach(([key, nested]) => {
      out[key] = serialize(nested);
    });
    return out;
  }
  return value;
}

async function getSubcollections(docRef) {
  const subcollections = await docRef.listCollections();
  const result = {};

  for (const col of subcollections) {
    const snap = await col.get();
    result[col.id] = snap.docs.map((doc) => ({
      id: doc.id,
      data: serialize(doc.data()),
    }));
  }

  return result;
}

async function deleteSubcollections(docRef) {
  const subcollections = await docRef.listCollections();

  for (const col of subcollections) {
    const snap = await col.get();
    const batchSize = 400;
    for (let i = 0; i < snap.docs.length; i += batchSize) {
      const batch = admin.firestore().batch();
      snap.docs.slice(i, i + batchSize).forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.uids.length) {
    throw new Error("Provide at least one --uid <firestore-user-doc-id>.");
  }

  initAdmin(args.project);
  const db = admin.firestore();
  const auth = admin.auth();

  const reports = [];

  for (const uid of args.uids) {
    const docRef = db.collection("users").doc(uid);
    const snap = await docRef.get();
    const authUser = await auth.getUser(uid).catch(() => null);

    if (!snap.exists) {
      reports.push({
        uid,
        existsInFirestore: false,
        existsInAuth: !!authUser,
      });
      continue;
    }

    const data = snap.data() || {};
    const report = {
      uid,
      existsInFirestore: true,
      existsInAuth: !!authUser,
      email: data.email || "",
      username: data.username || "",
      role: data.role || "",
      createdAt: formatDate(data.createdAt),
      data: serialize(data),
    };

    if (args.includeSubcollections || args.backupDir) {
      report.subcollections = await getSubcollections(docRef);
    }

    reports.push(report);
  }

  if (args.backupDir) {
    fs.mkdirSync(args.backupDir, { recursive: true });
    reports.forEach((report) => {
      const filePath = path.join(args.backupDir, `${report.uid}.json`);
      fs.writeFileSync(filePath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    });
  }

  console.log("");
  console.log(args.write ? "Cleanup plan (write mode)" : "Cleanup plan (dry run)");
  console.log(`Project: ${admin.app().options.projectId || "(unknown)"}`);
  console.log("");

  reports.forEach((report) => {
    if (!report.existsInFirestore) {
      console.log(`- ${report.uid}: Firestore doc not found`);
      return;
    }

    console.log(
      `- ${report.uid}: email=${report.email || "-"} auth=${report.existsInAuth ? "yes" : "no"} role=${report.role || "-"} username=${report.username || "-"} created=${report.createdAt || "-"}`
    );

    if (report.subcollections && Object.keys(report.subcollections).length) {
      const summary = Object.entries(report.subcollections)
        .map(([name, docs]) => `${name}(${docs.length})`)
        .join(", ");
      console.log(`  subcollections: ${summary}`);
    }
  });

  if (!args.write) {
    console.log("");
    console.log("Dry run only. No data was changed.");
    console.log("Add --write to actually delete these Firestore /users docs.");
    console.log("Use --backup-dir <dir> if you want JSON backups before deletion.");
    return;
  }

  console.log("");
  console.log("Deleting Firestore /users docs...");

  for (const report of reports) {
    if (!report.existsInFirestore) continue;
    const docRef = db.collection("users").doc(report.uid);
    if (args.includeSubcollections) {
      await deleteSubcollections(docRef);
    }
    await docRef.delete();
    console.log(`  deleted /users/${report.uid}`);
  }

  console.log("");
  console.log("Done.");
  console.log("Only Firestore docs were touched. Firebase Auth users were not deleted.");
}

main().catch((err) => {
  console.error("");
  console.error("Cleanup script failed.");
  console.error(err && err.message ? err.message : err);
  process.exitCode = 1;
});
