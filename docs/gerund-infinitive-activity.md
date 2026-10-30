# Gerund or infinitive direct-link activity

The supplied HTML activity is implemented as a native React activity within the
existing app shell. No menu entries or dashboard links are added.

The same route is available on all three platforms:

- https://seifhub.beeskillsenglish.com/activities/gerund-or-infinitive
- https://aptis-trainer.beeskillsenglish.com/activities/gerund-or-infinitive
- https://ote-seif.beeskillsenglish.com/activities/gerund-or-infinitive

This shared classroom resource requires sign-in, independently of a platform's
subscription gate. Signing in keeps the direct URL. For local checks, append
`?site=seifhub` or `?site=ote` to the same route.

## Start and finish logs

Selecting **Start activity** saves `gerund_infinitive_started` to the existing
Firestore `activityLog`. Opening the link alone does not create an attempt.

After checking all 24 practice gaps and all 12 mixed-test gaps, the learner can
select **Finish and save** to save `gerund_infinitive_completed`. A checked wrong
answer counts as attempted. Empty or edited, unchecked gaps prevent finishing.
Leaving an activity unfinished creates no completion event.

Both events include the same session ID, the learner's ID/email, platform, and
start time. The finish event adds elapsed time, checked/correct/revealed counts,
first-check correct counts, and separate scores/check counts for each practice
card and the mixed test. Raw answer text is not sent to the log. The existing
admin Activity Log includes labels, filters, and readable details for both events.

Revealed answers never count toward earned correct scores within that attempt,
even if retyped. Resetting a card or test clears its input and feedback while
preserving first-check and reveal history. **Start again** after finishing
creates a fresh session.

Answers and session state are stored in this browser, separately for each
account and platform. Refreshing resumes the same attempt without a new start
event. A completed attempt stays read-only. Browser storage failures show a
notice; failed start/finish saves show an error and allow retry.

## Validation and deployment

- `npm run test:gerund-infinitive`
- `npm run build`
- Native display checked in dark/light themes and at desktop/phone widths.
- Start/finish, refresh, reveal accounting and failed-save retries checked with a
  local test logger; production activity data is not used for these checks.
- Signed-out direct-route checks cover all three platform variants.

Deploy frontend changes through GitHub so Netlify builds the app. No Firebase
Functions, Firestore rules, or Firebase Hosting deployment is needed.
