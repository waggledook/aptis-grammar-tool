import { deleteApp, initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { get, getDatabase, ref, set, update } from "firebase/database";
import admin from "firebase-admin";
import { getDatabase as getAdminDatabase } from "firebase-admin/database";
import { getFirestoreAdmin } from "./firebaseAdmin.mjs";

const firebaseConfig = {
  apiKey: "AIzaSyCvpE87D16safq68oFB4fJKPyCURsc-mrU",
  authDomain: "examplay-auth.firebaseapp.com",
  projectId: "examplay-auth",
  storageBucket: "examplay-auth.firebasestorage.app",
  messagingSenderId: "654835226958",
  appId: "1:654835226958:web:a95cd8da4adb09c8a5661f",
  databaseURL: "https://examplay-auth-default-rtdb.europe-west1.firebasedatabase.app",
};

const TYPE = "ote-advanced-reading-part4-option-jury";
const LETTERS = ["A", "B", "C"];
const gameId = `smoke_option_jury_${Date.now()}`;
const contexts = [];
const results = [];
const createdAdminUids = [];

function createContext(label) {
  const app = initializeApp(firebaseConfig, `${label}-${gameId}`);
  const context = { label, app, auth: getAuth(app), db: getDatabase(app) };
  contexts.push(context);
  return context;
}

function assignedOption(team, questionIndex) {
  return LETTERS[(LETTERS.indexOf(team) + questionIndex) % LETTERS.length];
}

async function expectDenied(label, operation) {
  try {
    await operation();
    throw new Error(`${label}: write unexpectedly succeeded`);
  } catch (error) {
    if (String(error?.code || "").includes("PERMISSION_DENIED") || String(error?.message || "").includes("PERMISSION_DENIED")) {
      results.push(`PASS ${label}`);
      return;
    }
    throw error;
  }
}

const host = createContext("host");
const studentA = createContext("student-a");
const studentB = createContext("student-b");

try {
  getFirestoreAdmin();
  for (const context of contexts) {
    const uid = `${context.label.replaceAll("-", "_")}_${gameId}`.slice(0, 120);
    await admin.auth().createUser({ uid, displayName: `Option Jury ${context.label}` });
    createdAdminUids.push(uid);
    const token = await admin.auth().createCustomToken(uid);
    await signInWithCustomToken(context.auth, token);
  }
  results.push("PASS three isolated authenticated identities created");

  await set(ref(host.db, `liveGames/${gameId}`), {
    ownerUid: host.auth.currentUser.uid,
    pin: String(Date.now()).slice(-6),
    title: "Option Jury smoke test",
    type: TYPE,
    taskId: "forecasts-change-future",
    status: "lobby",
    createdAt: Date.now(),
    state: { phase: "lobby", questionIndex: 0 },
  });
  results.push("PASS host created lobby");

  await Promise.all([
    set(ref(studentA.db, `liveGames/${gameId}/players/${studentA.auth.currentUser.uid}`), {
      name: "Smoke Student A",
      joinedAt: Date.now(),
    }),
    set(ref(studentB.db, `liveGames/${gameId}/players/${studentB.auth.currentUser.uid}`), {
      name: "Smoke Student B",
      joinedAt: Date.now() + 1,
    }),
  ]);
  results.push("PASS two students joined the same lobby");

  await Promise.all([
    set(ref(host.db, `liveGames/${gameId}/players/${studentA.auth.currentUser.uid}/optionAssignment`), "A"),
    set(ref(host.db, `liveGames/${gameId}/players/${studentB.auth.currentUser.uid}/optionAssignment`), "B"),
  ]);
  results.push("PASS host assigned A and B");

  await expectDenied("student cannot change own assignment", () =>
    set(ref(studentA.db, `liveGames/${gameId}/players/${studentA.auth.currentUser.uid}/optionAssignment`), "C")
  );

  await update(ref(host.db, `liveGames/${gameId}`), {
    status: "in-progress",
    "state/phase": "skim",
    "state/questionIndex": 0,
    "state/phaseDeadline": Date.now() + 240_000,
  });
  results.push("PASS host opened question-free skim");

  await expectDenied("student cannot investigate during skim", () =>
    set(ref(studentA.db, `liveGames/${gameId}/investigations/${studentA.auth.currentUser.uid}/q1`), {
      assignedOption: "A", verdict: "strong", reason: "Too early", submitted: true, submittedAt: Date.now(),
    })
  );

  for (let questionIndex = 0; questionIndex < 5; questionIndex += 1) {
    const questionId = `q${questionIndex + 1}`;
    const assignedA = assignedOption("A", questionIndex);
    const assignedB = assignedOption("B", questionIndex);

    await update(ref(host.db, `liveGames/${gameId}/state`), {
      phase: "investigation",
      questionIndex,
      phaseDeadline: Date.now() + 90_000,
    });

    if (questionIndex === 0) {
      await expectDenied("student cannot forge rotating option assignment", () =>
        set(ref(studentA.db, `liveGames/${gameId}/investigations/${studentA.auth.currentUser.uid}/${questionId}`), {
          assignedOption: "C", verdict: "strong", reason: "Wrong assignment", submitted: true, submittedAt: Date.now(),
        })
      );
      await expectDenied("student cannot submit a later question early", () =>
        set(ref(studentA.db, `liveGames/${gameId}/investigations/${studentA.auth.currentUser.uid}/q2`), {
          assignedOption: "B", verdict: "strong", reason: "Wrong question", submitted: true, submittedAt: Date.now(),
        })
      );
      await set(ref(studentA.db, `liveGames/${gameId}/investigations/${studentA.auth.currentUser.uid}/${questionId}`), {
        assignedOption: assignedA,
        verdict: "flawed",
        reason: "",
        submitted: false,
        updatedAt: Date.now(),
      });
      results.push("PASS current-question draft autosave is allowed");
    }

    await Promise.all([
      set(ref(studentA.db, `liveGames/${gameId}/investigations/${studentA.auth.currentUser.uid}/${questionId}`), {
        assignedOption: assignedA,
        verdict: questionIndex % 2 ? "strong" : "flawed",
        reason: `Team A evidence ${questionIndex + 1}`,
        submitted: true,
        submittedAt: Date.now(),
      }),
      set(ref(studentB.db, `liveGames/${gameId}/investigations/${studentB.auth.currentUser.uid}/${questionId}`), {
        assignedOption: assignedB,
        verdict: questionIndex % 2 ? "flawed" : "strong",
        reason: `Team B evidence ${questionIndex + 1}`,
        submitted: true,
        submittedAt: Date.now(),
      }),
    ]);

    await expectDenied(`Question ${questionIndex + 1} submitted investigation is locked`, () =>
      update(ref(studentA.db, `liveGames/${gameId}/investigations/${studentA.auth.currentUser.uid}/${questionId}`), { verdict: "no_match" })
    );

    await update(ref(host.db, `liveGames/${gameId}/state`), { phase: "comparison", questionIndex });
    await expectDenied(`Question ${questionIndex + 1} cannot be voted during comparison`, () =>
      set(ref(studentA.db, `liveGames/${gameId}/finalVotes/${questionId}/${studentA.auth.currentUser.uid}`), { option: "A", submittedAt: Date.now() })
    );

    await update(ref(host.db, `liveGames/${gameId}/state`), { phase: "final_vote", questionIndex, phaseDeadline: Date.now() + 30_000 });
    await Promise.all([
      set(ref(studentA.db, `liveGames/${gameId}/finalVotes/${questionId}/${studentA.auth.currentUser.uid}`), { option: LETTERS[questionIndex % 3], changedMind: false, submittedAt: Date.now() }),
      set(ref(studentB.db, `liveGames/${gameId}/finalVotes/${questionId}/${studentB.auth.currentUser.uid}`), { option: LETTERS[(questionIndex + 1) % 3], changedMind: true, submittedAt: Date.now() }),
    ]);

    await expectDenied(`Question ${questionIndex + 1} final vote is locked`, () =>
      update(ref(studentB.db, `liveGames/${gameId}/finalVotes/${questionId}/${studentB.auth.currentUser.uid}`), { option: "C" })
    );

    await update(ref(host.db, `liveGames/${gameId}/state`), { phase: "answer_reveal", questionIndex });
  }
  results.push("PASS all five question cycles retained rotating investigations and independent votes");

  await update(ref(host.db, `liveGames/${gameId}`), { status: "finished", "state/phase": "finished" });

  const snapshot = await get(ref(host.db, `liveGames/${gameId}`));
  const game = snapshot.val();
  const playerIds = Object.keys(game.players || {});
  const investigationCounts = playerIds.map((id) => Object.keys(game.investigations?.[id] || {}).length);
  const voteCounts = [1, 2, 3, 4, 5].map((number) => Object.keys(game.finalVotes?.[`q${number}`] || {}).length);
  if (playerIds.length !== 2 || investigationCounts.some((count) => count !== 5) || voteCounts.some((count) => count !== 2)) throw new Error("Final session state did not retain every investigation and vote");
  if (game.players[studentA.auth.currentUser.uid].optionAssignment !== "A" || game.players[studentB.auth.currentUser.uid].optionAssignment !== "B") throw new Error("Assignments changed unexpectedly");
  if (game.investigations[studentA.auth.currentUser.uid].q2.assignedOption !== "B" || game.investigations[studentB.auth.currentUser.uid].q2.assignedOption !== "C") throw new Error("Question 2 assignments did not rotate");
  results.push("PASS finished state retained both teams and every per-question record");

  console.log(results.join("\n"));
} finally {
  await Promise.allSettled(contexts.map((context) => deleteApp(context.app)));
  try {
    getFirestoreAdmin();
    const cleanupRef = getAdminDatabase(admin.app()).ref(`liveGames/${gameId}`);
    await cleanupRef.remove();
    await new Promise((resolve) => setTimeout(resolve, 2500));
    await cleanupRef.remove();
    if ((await cleanupRef.get()).exists()) throw new Error("test record still exists after removal");
    console.log("PASS smoke-test game data cleaned up");
  } catch (error) {
    console.error("Smoke-test game cleanup failed:", error.message);
  }
  await Promise.allSettled(createdAdminUids.map((uid) => admin.auth().deleteUser(uid)));
}
