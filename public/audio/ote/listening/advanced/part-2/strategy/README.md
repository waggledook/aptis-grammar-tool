# Listening Part 2 strategy audio

Recorded audio is available for all 8 extracts in both classroom and live modes.

Extracts 1–6 and 8 were split at the separator pauses in gapped-sentence-extracts.mp3, using MP3 stream copy without re-encoding. Extract 7 uses the revised individual recording, copied directly without re-encoding or trimming. Long separator gaps were removed while retaining 0.25 seconds before speech and 0.35 seconds after speech at internal boundaries. Split positions and file checksums are recorded in audio-scripts/ote-advanced-listening-part-2-strategy-audio-splits.json. The source recording is unchanged.

When replacing a clip, read only its script. Do not read the filename, title, note, answer or teaching label. Use a natural delivery at approximately 145–160 words per minute, without emphasising answer words.

Canonical scripts: src/products/ote/data/oteListeningPart2Strategy.js
Recording export: audio-scripts/ote-advanced-listening-part-2-strategy-recording-scripts.txt

Recording filenames in this directory:

- extract-01.mp3 — Designing public seating
- extract-02.mp3 — Organising volunteers
- extract-03.mp3 — Access to museum tours
- extract-04.mp3 — Participation in evening classes
- extract-05.mp3 — Improving a study centre
- extract-06.mp3 — A neighbourhood equipment scheme
- extract-07.mp3 — Planning sheltered seating
- extract-08.mp3 — Researching a night bus service

Keep these filenames when replacing recordings. The audioReady flags are true for the integrated clips. If a recording is removed, mark its flag false so both lesson modes offer teacher-read delivery without requesting a missing file. Run npm run test:ote-listening-strategy and npm run build before publishing through GitHub/Netlify.
