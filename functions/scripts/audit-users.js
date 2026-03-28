#!/usr/bin/env node
/* eslint-disable no-undef */
/* eslint-disable no-console */
const admin = require("firebase-admin");

function parseArgs(argv) {
  const args = {project: process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || ""};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--project" && argv[i + 1]) {
      args.project = argv[i + 1];
      i += 1;
    } else if (token === "--email" && argv[i + 1]) {
      args.email = argv[i + 1].trim().toLowerCase();
      i += 1;
    } else if (token === "--json") {
      args.json = true;
    }
  }

  return args;
}

function formatDate(value) {
  if (!value) return "-";
  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return String(value);
}

async function listAllAuthUsers() {
  const auth = admin.auth();
  const users = [];
  let nextPageToken;

  do {
    const page = await auth.listUsers(1000, nextPageToken);
    users.push(...page.users);
    nextPageToken = page.pageToken;
  } while (nextPageToken);

  return users;
}

function initAdmin(projectId) {
  const options = {};

  if (projectId) {
    options.projectId = projectId;
  }

  try {
    admin.initializeApp(options);
  } catch (err) {
    if (!/already exists/u.test(String(err && err.message))) {
      throw err;
    }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  initAdmin(args.project);

  const db = admin.firestore();
  const [usersSnap, authUsers] = await Promise.all([
    db.collection("users").get(),
    listAllAuthUsers(),
  ]);

  const authByUid = new Map(authUsers.map((user) => [user.uid, user]));
  const firestoreUsers = usersSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const groupedByEmail = firestoreUsers.reduce((acc, user) => {
    const email = (user.email || "").trim().toLowerCase();
    if (!email) return acc;
    if (args.email && email !== args.email) return acc;
    if (!acc[email]) acc[email] = [];
    acc[email].push(user);
    return acc;
  }, {});

  const duplicates = Object.entries(groupedByEmail)
    .filter(([, group]) => group.length > 1)
    .map(([email, group]) => ({
      email,
      count: group.length,
      users: group
        .map((user) => ({
          uid: user.id,
          username: user.username || "",
          role: user.role || "",
          teacherId: user.teacherId || "",
          createdAt: formatDate(user.createdAt),
          authExists: authByUid.has(user.id),
          authEmail: authByUid.get(user.id)?.email || "",
          name: user.name || user.displayName || "",
        }))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    }))
    .sort((a, b) => b.count - a.count || a.email.localeCompare(b.email));

  const orphanedUsers = firestoreUsers
    .filter((user) => !authByUid.has(user.id))
    .filter((user) => !args.email || (user.email || "").trim().toLowerCase() === args.email)
    .map((user) => ({
      uid: user.id,
      email: user.email || "",
      username: user.username || "",
      role: user.role || "",
      createdAt: formatDate(user.createdAt),
    }))
    .sort((a, b) => a.email.localeCompare(b.email) || a.uid.localeCompare(b.uid));

  if (args.json) {
    console.log(JSON.stringify({
      projectId: admin.app().options.projectId || "",
      firestoreUserCount: firestoreUsers.length,
      authUserCount: authUsers.length,
      duplicateEmails: duplicates,
      orphanedFirestoreUsers: orphanedUsers,
    }, null, 2));
    return;
  }

  console.log("");
  console.log("User Audit");
  console.log(`Project: ${admin.app().options.projectId || "(unknown)"}`);
  console.log(`Firestore /users docs: ${firestoreUsers.length}`);
  console.log(`Firebase Auth users: ${authUsers.length}`);
  console.log("");

  if (!duplicates.length) {
    console.log("No duplicate emails found in /users.");
  } else {
    console.log(`Duplicate emails found: ${duplicates.length}`);
    console.log("");
    duplicates.forEach((entry) => {
      console.log(`${entry.count}x ${entry.email}`);
      entry.users.forEach((user) => {
        console.log(
          `  - uid=${user.uid} auth=${user.authExists ? "yes" : "no "} role=${user.role || "-"} username=${user.username || "-"} created=${user.createdAt}`
        );
      });
      console.log("");
    });
  }

  console.log(`Orphaned Firestore /users docs (missing in Auth): ${orphanedUsers.length}`);
  if (orphanedUsers.length) {
    console.log("");
    orphanedUsers.forEach((user) => {
      console.log(
        `  - ${user.email || "(no email)"} uid=${user.uid} role=${user.role || "-"} username=${user.username || "-"} created=${user.createdAt}`
      );
    });
  }

  console.log("");
  console.log("This script is read-only. It does not delete or modify any data.");
}

main().catch((err) => {
  console.error("");
  console.error("Audit failed.");
  console.error(err && err.message ? err.message : err);
  console.error("");
  console.error("Tip: this script needs Firebase Admin credentials with access to Auth and Firestore.");
  console.error("If needed, run it with --project <project-id> and make sure your local ADC/service account is configured.");
  process.exitCode = 1;
});
