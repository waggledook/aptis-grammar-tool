# Live activity emails

Live sessions send an admin notification when their lobby is created, and a
summary when their status changes to `finished`. The start transition records
the event time without sending a third email. Individual answers do not invoke
the email function.

The launch message identifies the host (Firestore profile, with Firebase Auth
as a fallback), activity, task/content set, available level/topics and question
count, Madrid date/time, PIN, session ID, and registered teacher-view route.
For older records without a site field, the site is explicitly marked as
inferred from the activity type. Unknown types do not get a guessed host link.

Completion summaries include participants and activity-specific responses:

- Grammar, vocabulary and Spanglish: answered rounds, recorded scores, accuracy,
  completion when the round count is known, and the most-missed questions among
  submitted answers. Matching rounds retain partial credit.
- Writing: submitted/missing writing responses and a review link. The email does
  not include the student's full writing or fabricate an automatic score.
- Reading: submitted or partially completed work, including multi-task sessions.
- Listening and other teacher-led activities: response counts, with first-round
  submission markers when available. A response is not treated as proof that a
  student completed every stage.
- Collocations: team first-pass accuracy, labelled as a team result.

Duration uses the recorded game start or the server status-event timestamp. A
session already running before this function was deployed may have no recorded
start; its report says so and omits duration.

## Functions and deployment

Only these Firebase Cloud Functions need deployment:

```sh
firebase deploy --only functions:emailLiveGameActivity,functions:emailAnyTestResults --project examplay-auth
```

- `emailLiveGameActivity` (`europe-west1`) watches
  `/liveGames/{gameId}/status`.
- `emailAnyTestResults` keeps its existing name, region (`us-central1`), and
  `/{testName}/{pushId}` trigger. Its source was recovered from the deployed
  function on 26 October 2026. Its existing test formatting and student-copy
  behaviour are retained; `liveGames` and `liveGamePins` are excluded.

Deploy both together so the old sender does not duplicate the new launch email.
There are no frontend, Hosting, Firestore-rule, or Realtime Database-rule changes.
SMTP uses the existing `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `TEACHER_EMAIL`
environment configuration.

## Delivery records

The Admin SDK keeps private records in Firestore:

- `liveActivityEmailSessions/{gameId}` records first lifecycle timestamps.
- `liveActivityEmailDeliveries/{gameId}--{launched|finished}` atomically claims
  a delivery before SMTP and records its outcome. Duplicate or concurrent
  Firebase events cannot send another copy once claimed or sent.

An SMTP failure is marked `failed` and a redelivered event can retry it. A record
left at `sending` is deliberately not retried automatically: SMTP may already
have accepted that message before the receipt write failed. Check the
`MAIL_OK live activity`, `MAIL_FAIL live activity`, and
`LIVE_EMAIL_RECEIPT_WRITE_FAILED` logs before manually retrying an uncertain
delivery. Credentials and student writing are not written to these records.

Run `npm --prefix functions test` and `npm --prefix functions run lint` to check
the handlers. To regenerate the sample launch and completion email preview, run
`node scripts/preview-live-activity-emails.mjs`.
