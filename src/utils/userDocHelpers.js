// src/utils/userDocHelpers.js
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";

/**
 * Ensure /users/{uid} exists for the current user.
 * - Creates doc with role: "student" on first sign-in
 * - On later sign-ins, merges email/displayName but DOES NOT touch role.
 */
export async function ensureCurrentUserDoc() {
  const user = auth.currentUser;
  if (!user) return;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // First time we see this user in this project
    await setDoc(ref, {
      email: user.email || "",
      displayName: user.displayName || "",
      role: "student",          // default; your doc is already "admin"
      createdAt: serverTimestamp(),
      app: "aptis-trainer",
    });
  } else {
    // Merge in basic info, but DON'T touch role
    await setDoc(
      ref,
      {
        email: user.email || "",
        displayName: user.displayName || "",
        app: "aptis-trainer",
      },
      { merge: true }
    );
  }
}
