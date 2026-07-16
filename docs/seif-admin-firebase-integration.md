# SEIF Admin platform-access API

This is the English counterpart of the canonical Spanish specification in
`docs/integracion-seif-admin-firebase.md`.

## Endpoint

```text
POST https://europe-west1-examplay-auth.cloudfunctions.net/syncSeifAdminStudent
Content-Type: application/json
Authorization: Bearer <SHARED_TOKEN>
```

The token is server-only. It must not be exposed in browser JavaScript, public source
control, or logs.

## Request

Every request sends the student's complete current state:

```json
{
  "studentId": "12345",
  "contractId": "contract-2026-12345",
  "firstName": "Ana",
  "lastName": "Garcia",
  "email": "ana@example.com",
  "courseStartDate": "2026-09-01",
  "courseEndDate": "2027-06-30",
  "status": "active",
  "access": {
    "aptisTrainer": true,
    "ote": false
  }
}
```

| Field | Type | Required | Meaning |
|---|---|---:|---|
| `studentId` | string | Yes | Permanent unique ID in SEIF Admin. |
| `contractId` | string | No | Current contract ID. |
| `firstName` | string | Recommended | Student's first name. |
| `lastName` | string | Recommended | Student's surname. |
| `email` | string | Yes | Current email; normalized to lower case. |
| `courseStartDate` | `YYYY-MM-DD` | No | Access start; today is used for a new active record if omitted. |
| `courseEndDate` | `YYYY-MM-DD` | With `active` or `completed` | Course or contract end date. |
| `status` | string | Yes | `active`, `completed`, or `cancelled`. |
| `access.aptisTrainer` | boolean | With `active` or `completed` | Desired Aptis Trainer access. |
| `access.ote` | boolean | With `active` or `completed` | Desired OTE access. |

SeifHub is not sent as a choice. It is active for `active` students and retained until
the calculated expiry date for `completed` students.

## Behaviour

- All access expires 14 days after `courseEndDate`.
- An `active` or `completed` request must always include both access booleans.
- Changing a boolean to `false` removes that platform's access.
- `completed` retains the selected access until `courseEndDate + 14 days`.
- `cancelled` immediately disables all three platforms.
- Repeating a request updates the same account and does not create duplicates.
- A changed `courseEndDate` handles a renewal and recalculates the expiry date.
- `studentId` is the primary identity, so an email address may be updated safely.
- An email already attached to another account returns HTTP `409` and is never merged
  automatically.

For a new student, the API creates Firebase Auth and Firestore records and sets the
initial password to `12345678`. It never resets or overwrites an existing user's
password.

## Successful response

A new Auth account returns HTTP `201`; an update returns HTTP `200`:

```json
{
  "ok": true,
  "uid": "firebase-auth-uid",
  "studentId": "12345",
  "email": "ana@example.com",
  "createdAuthUser": false,
  "status": "active",
  "accessEndDate": "2027-07-14",
  "access": {
    "seifhub": true,
    "aptisTrainer": true,
    "ote": false
  }
}
```

## Errors

```json
{
  "ok": false,
  "error": {
    "code": "invalid_request",
    "message": "courseEndDate must use YYYY-MM-DD format."
  }
}
```

| HTTP | Meaning |
|---:|---|
| `400` | Missing or invalid request data. |
| `401` | Missing or invalid token. |
| `405` | The request did not use `POST`. |
| `409` | The student ID or email conflicts with another account. |
| `500` | Temporary internal failure. |

SEIF Admin should record the HTTP status and `error.code`. It may retry `500` errors.
It should not automatically retry `400`, `401`, or `409` responses before correcting
the cause.

## Firebase setup

Create the server-side secret once:

```bash
firebase functions:secrets:set SEIF_ADMIN_SYNC_SECRET
```

Deploy the endpoint:

```bash
firebase deploy --only functions:syncSeifAdminStudent
```

Deliver the token to the SEIF Admin developer through a secure channel separate from
this document.
