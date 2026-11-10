**SEIF adaptive English placement: research and proposed design**

Prepared 7 November 2026. This is a research and design brief, not an implementation or deployment. It assumes prospective adult learners in Spain; younger learners would need an appropriate task set and separate validation. All durations, item counts, content proportions and project names below are proposed starting points for a pilot, not research-established requirements or accuracy guarantees.

**Recommended direction**

Create one SEIF English placement product at `test.seifenglish.online`, with an adaptive core, optional skill modules and a teacher's speaking assessment. Use the core to suggest a starting class and identify uncertainty. Keep exam preparation advice as a subsequent recommendation: general English placement and readiness to pass a particular examination are different decisions.

The immediate deliverable should be a reviewed assessment blueprint and a pilot. The item bank, scoring evidence and classroom outcomes deserve at least as much attention as the interface. Reuse selected infrastructure from the OTE implementation, while redesigning its measurement and public journey.

**What was reviewed**

The current [public placement page](https://idiomasseif.com/prueba-de-nivel/) asks visitors to choose their assumed level or an exam route. Replace this decision with one prominent start button. Ask about learning goals without requiring the learner to know their level.

Local code inspection found:

| Area | Current implementation | Consequence for a general placement tool |
| --- | --- | --- |
| Routing | `src/products/ote/OteLevelTest.jsx`, `continueFromBatch1`: ten common items, then one lower/upper choice at a first-block score of 5/6 | A legitimate, simple two-stage design; subsequent answers cannot change the chosen route |
| General item bank | `src/products/ote/data/oteLevelTestItems.js`: 30 items; common block has six B1 and four B2 labels; lower block has ten A2 labels; upper block has six B2 and four C1 labels | Add a real beginner floor and broader evidence at the top; the labels themselves do not establish measured difficulty |
| General scoring | `getOteLevelTestProfile` assigns A2 to every lower-route result below 12, including zero correct | A true beginner cannot receive a beginner result; the minimum output is A2 |
| Upper outcomes | General scoring can return C1; the separate advanced bank/scorer can return C2 | These require validation beyond success on selected difficult grammar and vocabulary items |
| Presentation | Ten items per page; each shows a level and grammar focus | Shorter pages would suit mobile use; hide assessment labels and tested rules during the attempt |
| Security and reuse | Answers are imported into the frontend; results provide item-by-item answers and a downloadable key | Suitable features for practice, but public placement needs protected keys and controlled item exposure |
| Modular V2 | `src/products/ote/OteLevelTestV2.jsx` has optional speaking/writing, optional email and remote resume; reading/listening are marked unavailable | Useful starting infrastructure; simplify the setup and make resumed sessions version-safe |
| Productive tasks | General writing is one 60–100-word admissions email; speaking uses personal response, voicemail and picture talk | Useful samples, but a single easy email gives limited evidence for advanced placement |
| Automated speaking | `functions/index.js`, `buildOteLevelProductionPrompt`, explicitly uses transcripts and acknowledges pronunciation limits | Live telephone assessment can add interaction and direct listening to the learner's speech |

This was a source audit. Existing production outcomes, assessment response data and DNS/Netlify account state were not audited. No application code was changed for this review.

**What the research supports**

The [Council of Europe/ALTE revised manual, March 2026](https://rm.coe.int/new-revised-manual-for-language-test-development-and-examining-joint-p/48802cc30d), distinguishes adaptation after individual items from adaptation after stages. It also addresses content specifications, pretesting, standard setting and reporting separate component results. These support a staged pilot with an explicit content blueprint and independent skill reporting.

[Cambridge's explanation of adaptive Linguaskill delivery](https://www.cambridgeenglish.org/vn/Images/715894-linguaskill-adaptive-testing.pdf) describes an updated ability estimate, different task types, minimum task coverage and stopping rules based on measurement uncertainty. Moving difficulty up and down is only one part of adaptive assessment.

The [British Council's Aptis guidance](https://www.britishcouncil.org/exam/aptis/practice-materials/grammar-vocabulary) separates its grammar/vocabulary core from skill results and does not award that core a standalone CEFR level. [Oxford's placement overview](https://www.oupjapan.co.jp/en/node/629?language=en) combines adaptive Use of English with listening. These are useful comparisons rather than templates to copy.

The [Council of Europe's CEFR linking guidance](https://www.coe.int/en/web/common-european-framework-reference-languages/relating-examinations-to-the-cefr) treats alignment as an evidence-building process. An author labelling an item B2 does not validate a B2 score interpretation.

[ILTA's 2024 guidelines](https://www.iltaonline.com/page/ILTAGuidelinesforPractice2024) call for suitability to the intended population and use, adequate sampling, transparent reporting and human calibration of automated methods. These inform the pilot and writing-review recommendations below.

**The proposed learner journey**

Start → short practice example → adaptive core → initial result → recommended optional checks → teacher speaking call → class recommendation.

Use one public front door and one item-bank system. Different visitors can receive different content and optional modules. Staff can also send a link requesting a particular module without making a returning learner repeat the whole core.

| Component | Initial pilot specification | Reporting and use |
| --- | --- | --- |
| Core | Normally 24 items in four blocks of six; up to two extra four-item blocks; target 10–15 minutes | Provisional placement range based on language knowledge and contextual understanding |
| Listening | Roughly 4–6 minutes; 6–8 questions across several independent short recordings | Separate brief listening estimate; recommend before confirming a class |
| Writing | Roughly 5–8 minutes for an initial sample; extra task when an advanced decision needs it | Separate provisional writing judgement and staff review where needed |
| Reading | Roughly 4–6 minutes with several texts and 6–8 questions | Optional focused check, especially useful for advanced or academic study goals |
| Speaking | Roughly 5–8 minutes live with a teacher | Structured evidence for final class placement; longer if the initial evidence is inconclusive |

Timing and completion claims must be revised after observing actual learners. The brief modules are screening samples, not equivalents of full skill examinations. Completing the core alone must remain a valid outcome, with its limited coverage clearly stated.

Offer the core immediately. After the first result, recommend listening and offer writing or reading with their expected durations. A school-requested assessment can preselect required modules. Let users save and return rather than placing a large module-selection form before the first question. Keep email optional for the initial result, with useful reasons to provide it: resume, receive the report or arrange the call.

**The adaptive core**

Use multistage adaptation for the first pilot. Present one question at a time, or a compact group where a shared text makes this appropriate, and update the route after each completed six-item block. Changing the number of questions visible on a screen does not itself improve measurement.

The opening block should include accessible beginner anchors and a spread of difficulty, rather than ten B1/B2 items. Subsequent blocks should target the likely placement boundary. Each decision should use all the accumulated evidence and permit movement in both directions. Avoid a rule in which one wrong answer moves the learner down a whole level.

The final standard block checks the likely boundary and ensures that grammar, vocabulary and contextual meaning have all been sampled. Additional short blocks resolve conflicting or borderline evidence. At the maximum length, return a wider range or a review request if needed. For the initial pilot, stopping decisions are provisional rules; do not display numerical confidence percentages. A later calibrated model can support stopping based on measured uncertainty and class-boundary decisions.

Do not compare raw percentages across routes as if everyone answered equally difficult questions. Pilot route-specific interpretations and teacher-set boundaries first. Move to an IRT/Rasch approach only after connected response data, model fit and useful item coverage support it. More sophisticated routing should earn its place by improving classification or reducing burden.

Budget an initial writing/review effort for a few hundred candidate core items, with the usable pool determined by piloting. Include beginner items, adjacent-level overlap, alternative forms and spare content for replacements. This is a content-planning estimate, not a sufficient bank size for a validated CAT.

As an initial blueprint, approximately 40% of the core could target grammatical form in context, 40% vocabulary and collocation, and 20% pragmatic meaning or brief contextual comprehension. Enforce coverage during selection. Do not report three precise subscores from these small samples.

Use short dialogues, messages, everyday situations, collocations and paraphrase/meaning choices. Include gist, intention or implication where appropriate. Reserve specialist vocabulary and unusual literary idioms for contexts that justify them. An advanced result should require more than isolated inversion or rare structures. Beginner items must avoid long prompts and distractors whose reading demands overwhelm the intended target.

Most initial items can be multiple choice, with plausible distractors and one defensible answer. Short typed answers can be piloted if they add useful evidence; avoid making spelling, keyboard familiarity or ambiguous accepted answers accidental barriers. Shared passages and their questions should be treated as related tasks, not as several independent confirmations of ability.

Keep authored, reviewed, versioned questions for scored use. AI may assist drafting or review; generating unreviewed scored questions during a live attempt would make comparability and quality control much harder.

**Optional skills and live speaking**

Prioritise listening as the first additional module. Use a sound check, several short dialogues/monologues and a mix of gist, detail and intention. Define a consistent playback allowance, pilot it and log technical failures separately. A failed download or unavailable audio is missing evidence, not a language error. A transcript changes what is being assessed; provide an appropriate alternative route for learners unable to take the audio module and record that coverage accurately.

Seed an optional skill's initial difficulty from the core if useful, but let that skill move independently. A learner's grammar result must not impose a ceiling on their listening or writing result. For listening and reading, an initial moderate task followed by easier or harder tasks is a practical pilot design.

For writing, use accessible communication: short personal messages at the lower end, a practical email with reasons for intermediate learners, and an additional supported opinion or problem-solving task when advanced placement is at issue. Offer a route to demonstrate stronger writing even when the core estimate is lower. Assess task fulfilment, organisation, language range and control with teacher benchmark examples. Do not interpret a single short sample as a comprehensive CEFR writing assessment.

Automated writing feedback should be provisional. Initially score the writing without showing the marker the grammar result or desired exam level, reducing anchoring. Compare machine judgements with independently marked teacher samples. Refer borderline outcomes, unusual discrepancies, insufficient samples and processing failures to staff. A model's own confidence label is not a measured probability of being correct. Keep the raw writing judgement separate from the eventual class recommendation.

Reading can have two roles: a little meaningful comprehension inside the core, and an optional broader reading module. A few short contextual questions in the core do not justify a separate reading CEFR claim. The dedicated module should sample multiple texts and more than one subskill, including inference and writer purpose at higher levels.

Keep live speaking as the default. Give teachers a shared script with easier/harder follow-ups: personal information, a concrete description or past experience, then reasons, comparison or an opinion where appropriate. Include real follow-up interaction. Use common descriptors for interaction, fluency, intelligibility, language range and control. Record the teacher's judgement and reason for any placement override. Agree how to handle hearing, connection or access difficulties rather than counting them as low proficiency.

**Results that staff and learners can use**

Show the estimated range, what was assessed, what remains unassessed and the next useful action. Separate the language evidence from the course suggestion. For example:

> Initial placement suggestion: B1, with some B2 evidence in the core.
> Listening: weaker than the core result; teacher confirmation recommended.
> Writing: not assessed. Speaking: awaiting teacher call.
> Suggested next step: B1 class discussion with the teacher before enrolment.

This is illustrative output, not a proposed validated score scale. A learner at the floor must be able to receive Pre-A1/A1 or an explicitly provisional beginner indication. At the ceiling, prefer “C1-range evidence; further assessment available” to claiming C2 from a short core. Missing modules should say “not assessed”, never zero.

Keep an initial result available without contact capture. Offer save/report and a clear school contact action. Ask about Aptis, OTE or Cambridge goals when useful for guidance; do not infer a pass probability or guaranteed preparation duration from general placement. Any later readiness module needs its own tasks and evidence.

Use accessible Spanish instructions, an unscored example, keyboard-operable controls, readable mobile layouts and deliberate submit/next controls. Let candidates review answers within the active block; commit it before routing. Avoid visible correctness feedback, level labels or grammar hints during scored assessment. Use stage-based progress and an approximate remaining duration rather than a falsely fixed total for a variable-length test. Prefer soft timing for the core and provide appropriate timing adjustments; [W3C's timing guidance](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html) explains the accessibility considerations.

**How to determine whether the test works**

1. Define the real class decisions and learner population. Map school bands to the intended CEFR descriptions and collect teacher benchmark performances. Confirm whether complete beginners and C1 learners are both in scope.
2. Review each item independently for the target ability, ambiguity, difficulty, distractors, natural language, accessibility and cultural demands. Small learner try-outs should check that candidates interpret tasks as intended.
3. Pretest with learners spanning the intended levels. Use planned forms with shared anchor items so routes connect to a common scale. Preserve enough overlap and pretest exposure to learn about items that adaptive routing would rarely show.
4. Track per-item response counts, difficulty, distractor choices, discrimination and unusual patterns. Review demographic or device differences where sufficient data exist. Inspect linked questions as tasks and examine repeat exposure.
5. Set provisional placement boundaries with trained teachers. Compare results with independent teacher judgements, a suitable established assessment for a subset where feasible, and later classroom performance. Existing class labels alone are an imperfect reference.
6. Evaluate on learners not used to tune the rules. Measure exact class agreement, adjacent-class agreement, serious misplacements, boundary errors and teacher overrides. Compare with the current test before claiming improvement.
7. Check the first weeks of classes: which learners moved, in which direction, and why. Review dropouts, duration and module completion alongside placement quality. Agree acceptable outcomes before launch rather than selecting a favourable accuracy metric afterward.

Count evidence per item, not merely total test completions. For example, 200 learners answering 24 items provide 4,800 responses; spread evenly over 240 items, that is only 20 responses per item. A few hundred completions therefore do not automatically yield a securely calibrated large bank. A psychometric reviewer should determine the data and model requirements before a full CAT claim. If response volume is limited, retain a carefully reviewed staged design with human confirmation.

**Project and domain recommendation**

The existing folder `/Users/nicholasbeeson/seif-english-zoom` is the Zoom portal, not an empty general website project. Its `README.md` records `seifenglish.online` as its primary frontend domain and Netlify DNS as its DNS service. Its `AGENTS.md` requires the portal to remain separate from the Aptis repository. Those records were inspected locally; the current hosting-account configuration was not verified.

Use a new, separately deployable testing repository/app, provisionally `seif-placement-test`, with its own GitHub-to-Netlify frontend at `test.seifenglish.online`. Reuse existing staff identity/roles where appropriate, with placement-specific access and data collections. Reuse selected UI and resume patterns after review, rather than making the new product depend on the entire OTE trainer or Zoom portal. This is a recommendation; no new folder or hosting project has been created.

Netlify supports a [standalone subdomain](https://docs.netlify.com/manage/domains/configure-domains/delegate-a-standalone-subdomain/). The exact configuration depends on the verified DNS setup. Keeping the domain's existing DNS service does not require placing every application in the same repository or Netlify site.

Keep the existing WordPress placement URL as an explanatory landing page with one main link to the new tool, preserving existing inbound links. Introduce the replacement after the pilot. Existing exam-specific practice can remain available through exam/course guidance.

Score and select items on the server, return only the content needed for the current task/block, and keep answer keys out of the browser bundle. Maintain immutable item versions, bank versions and scoring-rule versions. Store an attempt's presented items, answers, route decisions and final outcome so it can be explained later. Separate administrative review access from a candidate's private report/resume access. Rotate items and provide feedback through separate practice examples rather than publishing the active placement bank's answer key.

Use anonymous or pseudonymous attempt identifiers until a learner chooses to identify themselves. Keep assessment evidence distinct from marketing analytics and marketing preferences. Define a practical retention period and staff access. Operational assessment records should remain reliable even when optional analytics is off. Preserve existing private-token resume protections and expire links appropriately. Add server-side abuse controls before exposing paid AI marking publicly.

Future deployment targets would be: the new GitHub/Netlify frontend; the `test` subdomain and HTTPS configuration; and, if chosen, only the new placement backend functions and placement-specific data access rules. The backend hosting boundary should be decided separately. No Firebase Hosting frontend deployment is proposed.

**Recommended build order**

First produce the class/CEFR blueprint, item format examples, result wording, bank schema and teacher speaking rubric. Then build the staged core, protected scoring, versioned attempts, resume and staff review screen. Add the short listening module for the placement pilot. Add writing with teacher moderation next; add dedicated reading where demand and validation justify it. Refine boundaries from actual outcomes, then evaluate whether calibrated item-by-item adaptation improves on the staged approach.

The first success criterion is appropriate class placement with an honest account of the evidence. A shorter attempt and a better enquiry journey matter alongside that outcome.
