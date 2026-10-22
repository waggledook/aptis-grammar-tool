# English File Intermediate Plus vocabulary source map

Source reviewed: 21 October 2026.

Source PDF: `/Users/nicholasbeeson/Documents/EF4 Int Plus (SB)_Extracted vocab banks.pdf`

All 12 supplied pages were rendered and visually reviewed. The PDF is an image scan with no extractable text layer. The table records the banks supplied; completeness against the whole Student's Book has not been independently checked. Book pages run from 224 to 235; some left-hand page numbers are clipped by the scan.

## Source coverage and future visual work

The section names below describe the source. The table preserves the initial activity and visual possibilities. Text practice is available for all banks; Packing, Shops and services, and Photography now also have integrated visual practice. The remaining banks' visuals are deferred. Coursebook exercise instructions and audio references are source material, not project instructions. See the implementation summary and activity audit below for what is now built.

| PDF page | Book page | Bank | Source coverage | Proposed practice | Visual requirements |
| --- | --- | --- | --- | --- | --- |
| 1 | 224 | Adjective suffixes | Describing people; describing places and things; -ful and -less | Base-word/adjective flashcards; suffix sorting; word formation; contextual gaps; valid -ful/-less pairs | Text practice can stand alone |
| 2 | 225 | Packing | Things to take on holiday (electronics, toiletries, clothes and shoes, other items); documents you may need; packing verbs | Picture flashcards and matching; item-category sorting; document-purpose matching; packing-verb gaps; spelling | Holiday objects and packing actions |
| 3 | 226 | Shops and services | Places; phrasal verbs related to shops and shopping; shop names with apostrophe-s; additional shopping venues | Picture recognition; shop-purpose matching; contextual phrasal verbs; spelling; shop-name notes | Shop types |
| 4 | 227 | Photography | Describing a photo; taking photos; on top of versus at the top of | Spatial descriptions using original scenes; phrase matching; camera-vocabulary gaps; written recall | Original scenes with clear spatial relationships; photography concepts where useful |
| 5 | 228 | Rubbish and recycling | Rubbish nouns and phrasal verbs; packaging; the prefix re- | Definition matching; packaging pictures; contextual phrasal verbs; re- word formation; written recall | Packaging and waste containers |
| 6 | 229 | Study and work | Higher education; applying for a job or course; attend versus assist; apprenticeship versus internship | Definition flashcards; education/application contextual gaps; collocations; meaning distinctions; written recall | Text practice can stand alone |
| 7 | 230 | Television | Types of programme; series, soaps and sitcoms; TV phrasal verbs | Programme-type recognition; definition matching; distinctions between series/season/episode; TV phrasal-verb gaps; written recall | Original scenes representing programme types |
| 8 | 231 | The country | Nature; the country versus the countryside; farm animals and buildings; farming verbs and related vocabulary | Nature/farm picture flashcards and matching; category sorting; farming-verb gaps; spelling | Countryside features, farm objects and animals |
| 9 | 232 | At a restaurant | Things on the table; food/plate/dish/meal/course distinctions; waiter and customer actions | Tableware pictures; waiter/customer sorting; restaurant collocations and contextual gaps; meaning distinctions; written recall | Tableware and restaurant actions |
| 10 | 233 | DIY and repairs | Tools and repair materials; useful things around the house; verb phrases; repair/mend/fix synonyms | Object pictures; tool-purpose matching; verb collocations; contextual gaps; spelling | Tools, household objects and repair actions where useful |
| 11 | 234 | Phrasal verbs | Revision of no-object, separable and inseparable patterns; money; away and back; more verbs with take | Meaning flashcards; particle gaps; word order and pronoun placement; contextual meaning choices; written recall | Text practice can stand alone |
| 12 | 235 | Looking after yourself | Hairdresser's/barber's vocabulary; hairstyles and services; fitness equipment and exercises; beauty treatments | Picture flashcards and matching; equipment/exercise sorting; service collocations; contextual gaps; written recall | Hairstyles, hair services, exercise equipment/actions and beauty treatments |

## Integration baseline

- Existing textbook vocabulary lives in `src/data/hubVocabularyActivities.js`.
- Registered levels are A1, A2, A2-B1, B1 and the new `b1-b2` Intermediate Plus level.
- Existing B1 content has 13 banks and 69 activities. Those counts establish the implementation pattern, not a required number of activities for the new banks.
- Suggested new image location: `public/images/vocab/intermediate-plus/`, with folders per bank. Check existing images for suitability before producing new assets.
- Preserve the book's order and subtopic coverage, including vocabulary in explanatory boxes and bold words in contextual exercises.
- Use original practice sentences and visuals while retaining the target vocabulary and distinctions taught by the banks.
- The supplied PDF includes listening-track references but no recordings or separate answer key. Do not label inferred answers as checked against an official key or assume those audio files are available.

## Implemented text activities

The 12 banks contain 440 lexical entries, 328 distinct structured questions and 73 activities, including 12 visual activities across Packing, Shops and services, and Photography. The entry count includes separate senses/forms and some revision vocabulary; it is not a count of distinct new words in the book. Definitions and practice sentences are original adaptations. Some contexts are deliberately revisited first with choices and then as written recall.

| Bank | Entries | Activities | Bank-specific practice |
| --- | ---: | ---: | --- |
| Adjective suffixes | 46 | 5 | Interactive base-word suffix columns with adjective reveals; contextual adjective formation choices; adjective contrasts; 64 contextual word-formation gaps with separate base words, in 20-question rounds |
| Packing | 44 | 5 | Picture flashcards; picture matching; document purposes; contextual items and verbs; written naming with small pictures |
| Shops and services | 32 | 6 | Picture/meaning study; venue picture matching; shop-purpose choices; phrasal verbs; apostrophes; combined written naming |
| Photography | 22 | 6 | Visual study; camera-picture matching; scene-based position and camera choices; picture-supported sentence writing covering all 22 terms |
| Rubbish and recycling | 33 | 6 | Written re-verb formation; packaging clues; re- and disposal verbs; written recall |
| Study and work | 38 | 6 | University contexts; applications and word distinctions; written recall for both |
| Television | 26 | 6 | Programme descriptions; series vocabulary; TV particles and pronoun placement; written recall |
| The country | 39 | 6 | Nature/farm categories; descriptive clues and plurals; farming verbs; written recall |
| At a restaurant | 38 | 6 | Waiter/customer roles; food-word distinctions; restaurant collocations; written recall |
| DIY and repairs | 37 | 6 | Vocabulary categories; tool-purpose choices; repair collocations; written recall |
| Phrasal verbs | 47 | 8 | Money; away/back; meanings of take; separability; pronoun placement; particle recall |
| Looking after yourself | 38 | 7 | Hairstyles/services; hair contexts; equipment/exercise sorting; fitness and beauty; written recall |

Implementation: `src/data/hubIntermediatePlusVocabulary.js`, registered through `src/data/hubVocabularyActivities.js`. All lexical entries appear in the flashcard pools. Adjective meaning matching has been replaced with interactive suffix columns; Packing, Shops and services, and Photography use picture matching; the remaining banks retain meaning matching. Written practice uses self-contained prompts rather than questions that require seeing multiple-choice options. Near-synonymous adjective clues include the base word. Written variants include spelling alternatives and common equivalents where they fit the sentence.

### Packing visual integration

Packing is condensed to five activities: picture flashcards, picture matching, document-purpose choices, packing/travel situation choices and written naming. The duplicate meaning-only flashcards/matching, packing-list category sort and separate ten-question writing activity have been removed. The other banks retain their existing activity menus. Completion counts ignore retired activity IDs, preserving historical records without counting them towards the condensed menu.

The separate image dataset maps all 44 words to verified images. Flashcards show all 44; picture matching and writing cover 43, excluding the guidebook whose cover prints part of its answer. Short clues disambiguate documents, generic toiletries, travel iron, pack/unpack and other actions. The same clues survive mistake review, along with accepted variants such as adapter, dressing gown and driving license. Matching uses four-pair rounds with larger images and readable clues. Writing uses images capped at 140 pixels high. Transparent images retain their alpha with no added white backdrop; action scenes retain their original photographic backgrounds.

Validation: 13 automated checks pass; production build passes; targeted lint has no errors and the same eight existing hook warnings. Isolated browser checks exercised matching completion and mistake retry, written completion and mistake review, accepted spelling variants, and image loading. A 390-pixel viewport verified no horizontal overflow and a transparent image background in both matching and writing. Browser test progress was stubbed, so these checks did not update the user's account or exercise authenticated persistence.

### Shops and services visual integration

All 26 shop/venue types now have pictures, including the final chain store, charity shop, pound shop, craft fair and outlet. Six activities replace duplicate meaning-only practice: study cards (all 32 entries, with pictures for 26 venues and try on), venue picture matching (26), Where would you go?, shopping phrases, apostrophes, and written recall (all 32). Phrases without a distinct action image use standalone meaning cues. Written venue questions use small images plus purpose clues; matching shows larger storefronts without cropping their compositions. The two corrected signs remain in use. Shops stays unpublished for admin review.

Packing's 36 new images and the 26 shop/venue pictures now load as WebP. Full image dimensions and alpha channels were checked against the PNG sources. The 62 images total 15.3 MiB versus 102.9 MiB of PNGs, about 85% smaller. PNG originals remain available; this measures image payload savings, not a reduction in the whole deployment directory. The reused try-on image also has a WebP derivative for Shops. Other reused project assets retain their existing formats. Future imports can use `python3 scripts/convert-vocab-images-to-webp.py <directory>` (requires Pillow).

Validation: 16 automated checks pass. Production build passes; targeted lint has no errors and the same eight existing hook warnings. Isolated browser checks verify matching completion/mistakes, written completion/review, correct apostrophes, the accepted look around variant, mixed picture/text prompts, WebP loading and contain sizing, and no horizontal overflow at 390 pixels. Account persistence was stubbed for browser checks.

### Photography visual integration

Six supplied pictures now load as WebP: sharp countryside, wider view, out of focus, overexposed, dog close-up and town square. Eleven SVG diagrams built in code cover the remaining camera controls, zoom/crop demonstrations, picture-position grids, and frame-surface versus upper-picture positions. The existing opposite picture is reused. All 22 words and phrases appear in visual study and sentence writing; the camera matching pool contains 11 terms. Six activities replace the two meaning-only exercises while retaining the existing position/camera choices and writing routes. Writing uses images up to 180 pixels high; recognition activities show larger scenes. No white backdrop is added to transparent visuals.

The supplied wider view is used independently because some scene details differ. Zoom/crop SVGs embed the same sharp source, illustrating framing and changes to an existing image. The corner phrases transfer from clear grid diagrams to the rucksack in the countryside scene and hanging flowers in the town square. Contexts distinguish background from distance, depth from image-plane position, and zoom from editing. Photography remains unpublished for admin review; only Adjective suffixes and Packing are student-visible.

Validation: 17 automated checks pass, covering full lexical coverage, visual files, unambiguous choice data, accepted spellings, and source reconstruction for mistake review. Production build passes; targeted lint has no errors and the same eight existing hook warnings. Isolated browser checks verify SVG/WebP loading, choice feedback, written completion and mistake retry, accepted close up / portrait mode variants, mobile matching completion, smaller written images and no horizontal overflow at 390 pixels. Progress writes are stubbed; authenticated persistence is not exercised.

## Activity audit

Reviewed the textbook menu, data schema, activity player, coverage/progress handling and mistake-review reconstruction. The previous 59 banks used 24 configured activity types; many are topic-specific variants of the same interaction.

| Existing format | Best use at B1-B2 | Decision |
| --- | --- | --- |
| Flashcards, including flag/phrase variants | Meaning-to-word retrieval; base-word-to-derived-word recall | Use the existing text prompt/answer fields; add meaning cards for every bank |
| Matching, including flag matching | Definitions and words; purposes and phrases | Use existing `matchPrompt` / `matchAnswer`; six-pair rounds with unique answers |
| Quick-choice variants: gap, nationality, opposites, categories, speaker and article | Focused recognition where the cue and answer structure are already supported | Prefer structured sentence questions for these banks to control distractors and context precisely |
| Typed answers: spelling, nationality, plurals, opposites, cue gaps and phrase gaps | Production from a clear clue | Use structured written questions for these banks; keep generic variants available for future visual work |
| Sentence choice | Meaning distinctions, collocations, phrasal particles, sentence rewriting and correct pronoun position | Reuse; every new choice question has explicit distractors |
| Sentence written recall | Word formation and vocabulary production | Reuse with accepted variants; exclude choice-dependent full-sentence prompts |
| Category sorting | Semantic groups, restaurant roles, phrasal-verb patterns and equipment versus activities | Use only where the learner must understand the word or its behaviour; do not ask learners to copy a visible ending into an identically labelled category |
| Word-formation suffix columns (new) | Place base words under the suffix needed to form their adjectives | Replaces adjective meaning matching; dragging, tap-select/tap-column and keyboard placement share the same validation; correct placements reveal the complete adjective |
| Sequence ordering | Events with a defensible fixed sequence | Available, but not used: packing, restaurant service and repair tasks often allow multiple valid orders |
| Numbered diagram study and image hotspots | Scene vocabulary and precise visual identification | Deferred with image generation |
| Clock choice and clock written answers | Time-telling practice | Available, but outside these banks' learning targets |

### Player improvements

After learner review, the adjective-ending sort was replaced with 20 base-word/context questions. Showing a complete adjective and asking for its visible ending did not require forming or understanding the word. The recycling group sort had the same issue for re- verbs and was replaced with six written contextual prompts. New activity IDs distinguish these tasks from progress recorded on the removed sorts.

The final adjective writing task was then expanded from 46 definition prompts in 12-question rounds to 64 sentence gaps in 20-question rounds. It covers all core adjectives, -ful/-less contrasts and context-dependent negative forms. Each item stores a separate `baseWord`, displayed in bold capitals beside a normally weighted sentence (wrapping below on narrow screens). Mistake-review prompts retain the base word. Accepted spelling variants remain supported.

The adjective meaning-matching activity was replaced with the reusable `word-formation-sort` type, implemented in `HubVocabWordFormationSort.jsx`. It presents 12 base words per round from a pool covering all 46 core adjectives. Six suffix columns accept pointer dragging or word/column selection. Correct cards move into the column and display base → complete adjective; wrong cards remain available for retry. Meaning cues distinguish the two adjectives formed from sense. The complete board stays visible until Finish round is pressed. Mistake review uses suffix choices with an appropriate instruction, and the original completion/coverage pipeline is reused.

- Structured questions and category sorting can display an item-level `explanation` after an answer. Explanations remain visible until Next is pressed; questions without explanations keep their existing automatic progression.
- Flashcards now count revealed answers rather than cards merely reached. After every answer in the round has been revealed, Finish flashcards completes the round. The last answer remains available to read.
- Existing progress coverage, activity result saving and mistake review are reused. No backend schema changes are required.

### Validation

- `npm run test:intermediate-plus-vocab`: checks the 12-bank registration, reachable routes, nonempty text prompts, item IDs, category eligibility, explicit choice answers/distractors, self-contained written questions, accepted variants, mistake-review reconstruction and preservation of earlier levels.
- Production build passed.
- Targeted lint found no errors; eight existing hook-dependency warnings remain in the player.
- Browser checks used the actual menu and player in an isolated local harness with progress functions stubbed: B1-B2 filtering; full 15-card reveal/completion; matching completion and mistake retry; sorting explanations; choice explanations; typed answers. This did not exercise authenticated Firebase persistence.
- Suffix-column checks cover correct/wrong placement, duplicate/foreign-item rejection, full-round state and reset, ambiguous bases, and source-based mistake review. Browser checks verified dragging, tap-style selection, keyboard placement, completion and mistake retry. A 390-pixel iframe verified two-column reflow and tap-style placement at mobile width.

## Status

### Student publication and admin review

Only Adjective suffixes and Packing are currently marked visible to students. The remaining ten Intermediate Plus banks are unpublished. Earlier levels keep their existing availability.

Admins can select **Show unpublished banks (admin preview)** in the textbook topic browser. Unpublished cards are labelled, and their activity pages display an admin-preview notice. Students do not see those banks in browsing/search and cannot open their activity pages through either textbook or legacy A1 direct links. Unpublished textbook mistakes are excluded from student review; profile progress totals include published banks only. Content and saved progress are retained.

Publication is controlled by `INTERMEDIATE_PLUS_PUBLISHED_BANKS` near the top of [hubIntermediatePlusVocabulary.js](../src/data/hubIntermediatePlusVocabulary.js). To activate another bank after review, add its existing bank slug to that array and publish the frontend through the normal GitHub/Netlify workflow. The preview checkbox only changes the admin's view; it does not publish content.

Validation: 15 vocabulary tests and the production build pass, including student/admin visibility, direct-access policy, mistake-review eligibility and restoring access when a bank is published. Isolated browser checks verified the two-bank student view, a blocked unpublished direct link, admin access to that same bank, all twelve banks appearing after the admin preview toggle, and drafts disappearing again when switching to the student role. This change has not itself been deployed.

- Complete: source review; vocabulary and question data; 73 activities including Packing and Shops visual integration; B1-B2 menu registration; local player and data checks.
- Complete: [bank-by-bank visual asset inventory](intermediate-plus-visual-assets.md), distinguishing existing Topic Vocab/textbook reuse, contextual reuse and proposed new assets.
- Packing assets available: 30 supplied images imported, eight existing project images selected for reuse, and six generated document icons; all 44 entries mapped in [the asset manifest](../outputs/intermediate-plus-vocabulary/packing-asset-manifest.json). Context and quality notes remain relevant when building visual exercises.
- Deferred: creation and integration of remaining banks' visual assets and exercises.
- No frontend or backend deployment has been performed. Packing assets are connected locally to the five-activity menu; Shops assets to its six-activity menu. Shops remains unpublished.
