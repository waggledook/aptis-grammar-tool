# SEIF Admin to SeifHub Firebase Integration

This note is for the developer who maintains the SEIF admin app. The goal is to let that app provision and renew SeifHub student access automatically when a student is registered or their contract changes.

## Current Firebase Project

- Firebase project ID: `examplay-auth`
- Auth domain: `examplay-auth.firebaseapp.com`
- Cloud Functions region used by this app: `europe-west1`
- SeifHub site URL: `https://seifhub.beeskillsenglish.com`
- Local route fallback: `/?site=seifhub`

The public Firebase web config is in `src/firebase.js`, but provisioning should not be done from browser-side code in the external admin app. It should be done server-to-server through either a dedicated HTTPS Cloud Function in this Firebase project or a locked-down backend service using Firebase Admin credentials.

## User Model Required by SeifHub

SeifHub access is controlled by the Firebase Auth user plus the matching Firestore document:

```text
Firebase Auth user
  uid
  email
  password
  displayName

Firestore document
  /users/{uid}
```

Minimum Firestore document:

```json
{
  "email": "student@example.com",
  "name": "Student Name",
  "username": "",
  "role": "student",
  "createdAt": "<server timestamp>",
  "updatedAt": "<server timestamp>",
  "siteAccess": {
    "seifhub": {
      "active": true,
      "startDate": "2026-06-09",
      "endDate": "2026-09-07",
      "indefinite": false
    }
  },
  "externalSystems": {
    "seifAdmin": {
      "studentId": "12345",
      "contractId": "abc-123",
      "contractEndDate": "2026-08-31",
      "lastSyncedAt": "<server timestamp>"
    }
  }
}
```

`siteAccess.seifhub` is the important field:

- `active: true` activates SeifHub.
- `startDate` and `endDate` are ISO dates, `YYYY-MM-DD`.
- The app allows access while today's ISO date is between `startDate` and `endDate`, inclusive.
- `indefinite: false` means `endDate` is enforced.
- For your proposed rule, set `endDate` to `contractEndDate + 7 days`.

The access logic lives in `src/siteConfig.js`.

## Registration Flow

When a new student is registered in the SEIF admin app:

1. Normalize the registration email to lower case and trim spaces.
2. Calculate `seifhubEndDate = contractEndDate + 7 days`.
3. Create or update a Firebase Auth user with:
   - `email`: the registration email
   - `password`: `12345678`
   - `displayName`: first name + last name
4. Create or merge `/users/{uid}` with:
   - `role: "student"`
   - `email`
   - `name`
   - `siteAccess.seifhub.active: true`
   - `siteAccess.seifhub.startDate`
   - `siteAccess.seifhub.endDate`
   - `siteAccess.seifhub.indefinite: false`
   - external admin identifiers, if available

Important: Firebase Auth requires unique emails. If the email already exists, the integration should update the existing user's Firestore access rather than creating a duplicate account.

## Renewal Flow

When a student renews:

1. Find the Firebase Auth user by email or by stored `externalSystems.seifAdmin.studentId`.
2. Calculate the new `seifhubEndDate = newContractEndDate + 7 days`.
3. Update only the Firestore access fields and external contract metadata.

Recommended renewal update:

```json
{
  "siteAccess.seifhub": {
    "active": true,
    "startDate": "2026-06-09",
    "endDate": "2026-12-22",
    "indefinite": false
  },
  "externalSystems.seifAdmin.contractEndDate": "2026-12-15",
  "externalSystems.seifAdmin.lastSyncedAt": "<server timestamp>",
  "updatedAt": "<server timestamp>"
}
```

## Cancellation or Non-Renewal Flow

If the admin app explicitly cancels access:

```json
{
  "siteAccess.seifhub": {
    "active": false,
    "startDate": "",
    "endDate": "",
    "indefinite": false
  },
  "updatedAt": "<server timestamp>"
}
```

If the student simply does not renew, no manual deactivation is required as long as `endDate` is populated. SeifHub will stop access after that date.

## Recommended API Boundary

Best option: add one HTTPS Cloud Function to this Firebase project, for example:

```text
POST https://europe-west1-examplay-auth.cloudfunctions.net/syncSeifHubStudent
```

Suggested request body:

```json
{
  "studentId": "12345",
  "contractId": "abc-123",
  "firstName": "Ana",
  "lastName": "Garcia",
  "email": "ana@example.com",
  "contractStartDate": "2026-06-09",
  "contractEndDate": "2026-08-31",
  "status": "active"
}
```

Suggested response:

```json
{
  "ok": true,
  "uid": "firebase-auth-uid",
  "email": "ana@example.com",
  "seifhubEndDate": "2026-09-07",
  "createdAuthUser": true
}
```

Authentication for this endpoint should be a server-only shared secret header or a Google-signed service-to-service request. Do not expose the secret in browser JavaScript.

Example header:

```text
Authorization: Bearer <server-only secret>
```

## Sample Cloud Function

This is a sketch for `functions/index.js`. It uses Firebase Admin, so it bypasses client Firestore rules safely on the trusted server.

```js
const cors = require("cors")({ origin: true });

function addDaysIso(isoDate, days) {
  const [year, month, day] = String(isoDate || "").split("-").map(Number);
  if (!year || !month || !day) return "";
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

exports.syncSeifHubStudent = functions
  .region("europe-west1")
  .https.onRequest((req, res) => {
    cors(req, res, async () => {
      try {
        if (req.method !== "POST") {
          res.status(405).json({ ok: false, error: "Use POST." });
          return;
        }

        const expectedSecret = process.env.SEIF_ADMIN_SYNC_SECRET;
        const authHeader = req.get("authorization") || "";
        const token = authHeader.replace(/^Bearer\s+/i, "");
        if (!expectedSecret || token !== expectedSecret) {
          res.status(401).json({ ok: false, error: "Unauthorised." });
          return;
        }

        const body = req.body || {};
        const email = normalizeEmail(body.email);
        const contractEndDate = String(body.contractEndDate || "").slice(0, 10);
        const contractStartDate = String(body.contractStartDate || "").slice(0, 10);

        if (!email || !email.includes("@")) {
          res.status(400).json({ ok: false, error: "A valid email is required." });
          return;
        }

        if (!contractEndDate) {
          res.status(400).json({ ok: false, error: "contractEndDate is required." });
          return;
        }

        const seifhubEndDate = addDaysIso(contractEndDate, 7);
        const displayName = [body.firstName, body.lastName].filter(Boolean).join(" ").trim();

        let authUser;
        let createdAuthUser = false;

        try {
          authUser = await admin.auth().getUserByEmail(email);
        } catch (err) {
          if (err.code !== "auth/user-not-found") throw err;
          authUser = await admin.auth().createUser({
            email,
            password: "12345678",
            displayName: displayName || undefined,
            emailVerified: false,
          });
          createdAuthUser = true;
        }

        if (displayName && authUser.displayName !== displayName) {
          await admin.auth().updateUser(authUser.uid, { displayName });
        }

        const active = body.status !== "cancelled" && body.status !== "inactive";
        const access = active
          ? {
              active: true,
              startDate: contractStartDate || new Date().toISOString().slice(0, 10),
              endDate: seifhubEndDate,
              indefinite: false,
            }
          : {
              active: false,
              startDate: "",
              endDate: "",
              indefinite: false,
            };

        const userRef = admin.firestore().doc(`users/${authUser.uid}`);
        const existingSnap = await userRef.get();
        const existingData = existingSnap.exists ? existingSnap.data() || {} : {};
        const firestorePayload = {
          email,
          name: displayName || existingData.name || "",
          username: existingData.username || "",
          role: existingData.role || "student",
          siteAccess: { seifhub: access },
          externalSystems: {
            seifAdmin: {
              studentId: body.studentId || existingData.externalSystems?.seifAdmin?.studentId || "",
              contractId: body.contractId || "",
              contractEndDate,
              lastSyncedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (!existingSnap.exists) {
          firestorePayload.createdAt = admin.firestore.FieldValue.serverTimestamp();
        }

        await userRef.set(firestorePayload, { merge: true });

        res.json({
          ok: true,
          uid: authUser.uid,
          email,
          seifhubEndDate: access.endDate,
          createdAuthUser,
        });
      } catch (err) {
        console.error("syncSeifHubStudent failed", err);
        res.status(500).json({ ok: false, error: "Sync failed." });
      }
    });
  });
```

Before deployment, add the secret as a Cloud Functions environment variable or Firebase functions config. The exact command depends on the current deployment setup.

## Notes and Risks

- Default password `12345678` is easy operationally but weak. If possible, create the user and immediately send a password reset email, or mark the default password as temporary in the welcome instructions.
- Do not give the SEIF admin frontend direct write access to Firestore. The current Firestore rules intentionally restrict `siteAccess` updates to admins.
- Keep registration sync idempotent: repeated calls with the same email should update the existing user and contract dates.
- Store the external `studentId` and `contractId`; this makes future renewals safer than relying only on email.
- The app currently gives `teacher` and `admin` roles automatic SeifHub access, but normal students require `siteAccess.seifhub.active`.

## Relevant Code References

- Firebase setup and Auth helpers: `src/firebase.js`
- SeifHub access gate: `src/siteConfig.js`
- Admin UI that edits SeifHub access: `src/components/admin/AdminDashboard.jsx`
- Firestore rules restricting `siteAccess`: `firestore.rules`
- Existing Cloud Functions entrypoint: `functions/index.js`
