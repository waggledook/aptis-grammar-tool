# Aptis Listening Part 3 opinion training implementation

The teacher activity is available at `/teacher-resources/listening-part3-opinion-training`. It is linked from Aptis Teacher Resources under Listening and from the teacher's Listening Part 3 menu. The classroom lesson and live host require a teacher or admin account; live participants sign in and join through the existing PIN page.

## Content and recordings

The app uses the harder manuscript in `audio-scripts/aptis-listening-part-3-strategy-lesson-draft.md`. Its ten conversations and twelve opinion statements are stored in `src/components/listening/aptisListeningPart3StrategyData.js`. The more accessible manuscript remains separate for later integration.

| Extract | Topic | Supplied recording | App asset |
| --- | --- | --- | --- |
| 1 | Name badges at a social event | extract1.mp3 | public/audio/listening/part3/strategy/extract-01.mp3 |
| 2 | A pottery workshop | extract2.mp3 | public/audio/listening/part3/strategy/extract-02.mp3 |
| 3 | A planetarium visit | extract3.mp3 | public/audio/listening/part3/strategy/extract-03.mp3 |
| 4 | Booking a haircut | extract4.mp3 | public/audio/listening/part3/strategy/extract-04.mp3 |
| 5 | Meal kits | extract5.mp3 | public/audio/listening/part3/strategy/extract-05.mp3 |
| 6 | A new escape room | extract6.mp3 | public/audio/listening/part3/strategy/extract-06.mp3 |
| 7 | A personalised present | extract7.mp3 | public/audio/listening/part3/strategy/extract-07.mp3 |
| 8 | Telephone menus | extract8.mp3 | public/audio/listening/part3/strategy/extract-08.mp3 |
| 9 | An outdoor film screening | extract9.mp3 | public/audio/listening/part3/strategy/extract-09.mp3 |
| 10 | Looking after cats | extract10.mp3 | public/audio/listening/part3/strategy/extract-10.mp3 |

The files are mapped by the revised manuscript's extract numbers. They were copied byte for byte from the supplied files; `audio-scripts/aptis-listening-part-3-strategy-audio.json` records duration, codec details and hashes. The initial browser check confirmed playback in the classroom player, and Extracts 4–10 passed full MP3 decoding checks. The recordings have not been independently transcribed against the manuscript.

All ten harder extracts now have recordings, including both final extracts with two statements. Every route can run entirely with recorded audio. The default recorded starter continues to select Extracts 1–3; teachers can select the complete lesson or customise the selection.

To add a later recording, place it at `public/audio/listening/part3/strategy/extract-NN.mp3` and add its extract ID to `recordedExtractIds` near the top of the content bank. Update the audio provenance file as appropriate. No component changes are needed. Confirm that the recording follows the harder manuscript before marking it ready.

## Lesson flow

Classroom and live modes follow preview, first listen, comparison, second listen, optional unmarked transcript, then answer and evidence. Teachers can skip an extract or finish early. The worksheet contains statements and response options without the keys. Teacher notes include the script, attribution focus, difficulty estimate and feedback.

Answer feedback uses short Man and Woman notes plus one key distinction. Each highlighted quote is tied to a particular dialogue turn and speaker. Green marks evidence matching the selected opinion; amber underlining marks contrast or context, including a reported view or a limited concession. Extracts with two opinions provide a selector so that the notes and transcript markings address one question at a time. The unmarked transcript has no highlighting or answer notes.

Extract 10a asks whether home visits would be the speaker's first choice for their cat. This wording follows the preferences and fallback arrangement established in the recording, without generalising to the welfare of cats as a whole. Its answer remains Man.

The live host controls playback from the shared teacher screen, stages and feedback. Students choose Man, Woman or Both and submit confidence with a separate response for the first listen, second listen and any transcript check. A submitted stage cannot be replaced through the activity's submission API. Blank submissions and missing stages remain distinct. Anonymous distributions are shown during comparison; scores are shown after the lesson, with transcript-assisted work separate from listening.

## Existing services

The new room type is `aptis-listening-part3-strategy`, using the existing Firebase Realtime Database live-room structure and rules. PIN routing recognises the new player page and preserves an existing participant record. Activity logs identify this as strategy practice; the activity does not save completion of a full exam-style task.

This implementation changes frontend code, content and audio assets. It does not change or deploy Firebase Functions, database rules or hosting. Frontend publication follows the repository's GitHub and Netlify workflow when requested.

## Verification

Run `npm run test:aptis-listening-strategy` for manuscript alignment, recording readiness, speaker and turn-specific evidence, question-specific highlighting, teaching transitions, stage totals, submission validation, write-once attempts and teacher controls. The Firebase API tests use an in-memory database double; they do not create cloud rooms or send activity notifications.

The existing OTE listening strategy checks provide a regression check for the shared styling and unchanged original activity. Build with `npm run build`. Browser QA covers classroom stages, decoded playback, transcript timing, two-opinion feedback and teacher-read fallback. A real authenticated teacher and student session remains the final integration check for the live cloud service.
