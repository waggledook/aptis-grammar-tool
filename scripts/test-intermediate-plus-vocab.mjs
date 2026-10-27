import assert from "node:assert/strict";
import test from "node:test";
import { existsSync } from "node:fs";
import { HUB_VOCAB_LEVELS, getHubVocabActivity, getHubVocabThemes, getHubVocabProgressCounts, getVisibleHubVocabThemes, canAccessHubVocabTheme, canPreviewHubVocabDrafts, canReviewHubVocabMistake } from "../src/data/hubVocabularyActivities.js";
import {
  findHubSourceContext, getHubReviewChoice, getHubReviewPrompt, getHubReviewInstruction,
  getReviewAcceptedAnswers, isAcceptedReviewAnswer,
} from "../src/components/vocabulary/utils/hubVocabMistakeReview.js";
import {
  checkWordFormationPlacement, createWordFormationSortState,
  getWordFormationSortPrompt, wordFormationSortReducer,
} from "../src/components/vocabulary/utils/wordFormationSort.js";

const themes = getHubVocabThemes("b1-b2");
const expectedTitles = [
  "Adjective suffixes", "Packing", "Shops and services", "Photography",
  "Rubbish and recycling", "Study and work", "Television", "The country",
  "At a restaurant", "DIY and repairs", "Phrasal verbs", "Looking after yourself",
];
const normalize = (value) => String(value).toLowerCase().replace(/[’]/g, "'").replace(/[-–—]/g, " ").replace(/[.,!?]/g, "").replace(/\s+/g, " ").trim();

test("only the first five Intermediate Plus banks are published to students", () => {
  const expected = ["b1-b2-adjective-suffixes", "b1-b2-packing", "b1-b2-shops-services", "b1-b2-photography", "b1-b2-rubbish-recycling"];
  for (const user of [undefined, { role: "student" }, { role: "teacher" }, { role: "admin" }]) {
    assert.deepEqual(getVisibleHubVocabThemes(user).filter((theme) => theme.level === "b1-b2").map((theme) => theme.id), expected);
    if (user?.role !== "admin") assert.deepEqual(getVisibleHubVocabThemes(user, { includeDrafts: true }).filter((theme) => theme.level === "b1-b2").map((theme) => theme.id), expected);
  }
  assert.equal(getVisibleHubVocabThemes({ role: "admin" }, { includeDrafts: true }).filter((theme) => theme.level === "b1-b2").length, 12);
  for (const level of ["a1", "a2", "a2-b1", "b1"]) assert.equal(getVisibleHubVocabThemes().filter((theme) => theme.level === level).length, getHubVocabThemes(level).length);
});

test("unpublished banks remain admin-accessible but not through student direct links or mistake review", () => {
  for (const theme of themes) {
    const published = theme.order <= 5;
    assert.equal(canAccessHubVocabTheme(theme, { role: "student" }), published);
    assert.equal(canAccessHubVocabTheme(theme, { role: "teacher" }), published);
    assert(canAccessHubVocabTheme(theme, { role: "admin" }));
    const mistake = { source: "hub-textbook", topic: theme.id };
    assert.equal(canReviewHubVocabMistake(mistake, { role: "student" }), published);
    assert(canReviewHubVocabMistake(mistake, { role: "admin" }));
  }
  assert(!canAccessHubVocabTheme(null, { role: "admin" }));
  assert(!canPreviewHubVocabDrafts({ role: "student", preview: true }));
  assert(canReviewHubVocabMistake({ source: "topic-vocab", topic: "travel" }, { role: "student" }));
  const draft = themes.find((theme) => theme.order === 5);
  assert(canAccessHubVocabTheme({ ...draft, studentVisible: true }, { role: "student" }), "Publishing a bank restores access without removing its content or progress IDs.");
});

test("the supplied 12 banks are reachable through the level browser and routes", () => {
  assert(HUB_VOCAB_LEVELS.some((level) => level.id === "b1-b2"));
  assert.deepEqual(themes.map((theme) => theme.title), expectedTitles);
  assert.equal(new Set(themes.map((theme) => theme.id)).size, 12);
  for (const theme of themes) {
    assert(theme.entries.length > 0);
    assert.equal(theme.itemCount, theme.entries.length);
    assert.equal(new Set(theme.activities.map((activity) => activity.id)).size, theme.activities.length);
    for (const activity of theme.activities) {
      assert.equal(getHubVocabActivity(theme.id, activity.id)?.activity, activity);
    }
  }
});

test("every activity has usable prompts and valid answer data", () => {
  const supported = new Set(["flashcards", "matching", "type-answer", "category-sort", "word-formation-sort", "sentence-gap-choice", "sentence-gap-type-answer"]);
  for (const theme of themes) for (const activity of theme.activities) {
    const label = `${theme.id}/${activity.id}`;
    assert(supported.has(activity.type), label);
    const entries = activity.dataKey ? theme[activity.dataKey] : theme.entries;
    assert(entries?.length > 1, `${label}: missing data`);
    assert.equal(new Set(entries.map((entry) => entry.id)).size, entries.length, `${label}: repeated item IDs`);
    for (const entry of entries) {
      if (activity.visualPractice) {
        if (entry.image) assert(existsSync(new URL(`../public${entry.image}`, import.meta.url)), `${label}: missing image`);
        else assert(
          (["flashcards", "type-answer"].includes(activity.type) && entry.cueText)
          || (["sentence-gap-choice", "sentence-gap-type-answer"].includes(activity.type) && entry.sentence),
          `${label}: missing visual or self-contained text prompt`
        );
      } else assert(!entry.image && !entry.sceneImage && !activity.sceneImage, `${label}: unexpected visual dependency`);
      if (activity.type === "flashcards") {
        assert(entry.flashcardPrompt && entry.flashcardAnswer, label);
        assert.notEqual(normalize(entry.flashcardPrompt), normalize(entry.flashcardAnswer), label);
      } else if (activity.type === "matching") {
        assert((entry.matchPrompt || entry.image) && entry.matchAnswer, label);
        assert.notEqual(normalize(entry.matchPrompt), normalize(entry.matchAnswer), label);
      } else if (activity.type === "type-answer") {
        assert((entry.image || entry.cueText) && entry.term, label);
      } else if (activity.type === "category-sort") {
        assert(activity.categories.some((category) => category.id === entry.category), `${label}: unknown category`);
        assert(entry[activity.promptKey], `${label}: missing sort prompt`);
      } else if (activity.type === "word-formation-sort") {
        assert(activity.categories.some((category) => category.id === entry.category), label);
        assert(entry.baseWord && entry.adjective && entry.baseWord !== entry.adjective, label);
      } else {
        assert(entry.sentence && entry.answer, label);
        assert((entry.sentence.match(/_{3,}/g) || []).length <= 1, `${label}: split gap cannot accept one answer`);
        if (activity.type === "sentence-gap-type-answer") {
          assert(entry.sentence.includes("_____"), `${label}: recall needs a self-contained sentence gap`);
        }
        if (activity.type === "sentence-gap-choice") {
          assert(entry.options?.length >= 3, `${label}: missing explicit distractors`);
          const options = entry.options.map(normalize);
          assert.equal(new Set(options).size, options.length, `${label}: duplicate options`);
          const accepted = [entry.answer, ...(entry.acceptedAnswers || [])].map(normalize);
          assert.equal(options.filter((option) => accepted.includes(option)).length, 1, `${label}: not exactly one accepted choice`);
        }
      }
    }
  }
});

test("mistake review reconstructs matching, choice and sorting prompts without losing answers", () => {
  for (const theme of themes) for (const activity of theme.activities) {
    if (!["matching", "sentence-gap-choice", "category-sort", "word-formation-sort"].includes(activity.type)) continue;
    const entries = activity.dataKey ? theme[activity.dataKey] : theme.entries;
    for (const entry of entries) {
      const correctAnswer = ["category-sort", "word-formation-sort"].includes(activity.type)
        ? activity.categories.find((category) => category.id === entry.category).label
        : entry.answer || entry.matchAnswer;
      const item = { source: "hub-textbook", topic: theme.id, setId: activity.id, itemId: entry.id, activityType: activity.type, correctAnswer };
      const context = findHubSourceContext(item);
      assert.equal(context?.entry, entry);
      const review = getHubReviewChoice(item, context);
      assert(review?.options.length > 1);
      assert.equal(review.options.filter((option) => option.correct).length, 1);
      assert.equal(review.correctLabel, correctAnswer);
      if (activity.type === "word-formation-sort") assert.equal(getHubReviewInstruction(item, context), "Choose the suffix that forms the adjective from this base word.");
      assert.equal(getHubReviewPrompt(item, context), activity.type === "word-formation-sort" ? getWordFormationSortPrompt(entry) : activity.type === "category-sort" ? entry.term : entry.sentence || entry.matchPrompt || entry.imagePrompt || "");
    }
  }
});

test("mistake review replaces a stale saved correct option with the current source answer", () => {
  const { theme, activity } = getHubVocabActivity("b1-b2-shops-services", "shop-name-apostrophes");
  const entry = theme[activity.dataKey].find((candidate) => candidate.answer === "bakers");
  const item = {
    source: "hub-textbook",
    topic: theme.id,
    setId: activity.id,
    itemId: entry.id,
    activityType: activity.type,
    correctAnswer: "bakers",
    userAnswer: "baker's",
    reviewOptions: ["baker's", "baker"],
    reviewCorrectOption: "baker's",
  };
  const review = getHubReviewChoice(item, findHubSourceContext(item));

  assert.equal(review.correctLabel, "bakers");
  assert.equal(review.options.filter((option) => option.correct).length, 1);
  assert(review.options.some((option) => option.label === "bakers" && option.correct));
  assert(review.options.some((option) => option.label === "baker's" && !option.correct));
});

test("written variants survive mistake review", () => {
  const cases = [
    ["packing", "packing-picture-recall", "adaptor", "adapter"],
    ["packing", "packing-picture-recall", "washbag", "sponge bag"],
    ["photography", "position-recall", "in the centre", "in the center"],
    ["diy-repairs", "repair-recall", "mend", "fix"],
    ["looking-after-yourself", "self-care-recall", "press-ups", "push-ups"],
  ];
  for (const [themeId, activityId, answer, variant] of cases) {
    const { theme, activity } = getHubVocabActivity(`b1-b2-${themeId}`, activityId);
    const entry = theme[activity.dataKey].find((candidate) => normalize(candidate.answer || candidate.term) === normalize(answer));
    assert(entry, `${themeId}: ${answer}`);
    const item = { source: "hub-textbook", topic: theme.id, setId: activity.id, itemId: entry.id, activityType: activity.type, correctAnswer: entry.answer || entry.term };
    assert(isAcceptedReviewAnswer(variant, getReviewAcceptedAnswers(item, findHubSourceContext(item).entry)));
  }
});

test("published Photography covers every term visually and in sentence recall", () => {
  const { theme } = getHubVocabActivity("b1-b2-photography", "camera-recall");
  assert.equal(theme.studentVisible, true);
  assert.equal(theme.activities.length, 6);
  assert.equal(theme.photographyStudy.length, 22);
  assert.equal(theme.photographyCameraPictures.length, 11);
  assert.equal(theme.photographyPositions.length, 11);
  assert.equal(theme.photographyContexts.length, 11);
  assert.deepEqual(new Set([...theme.photographyPositions, ...theme.photographyContexts].map((entry) => entry.answer)), new Set(theme.entries.map((entry) => entry.term)));
  for (const entry of theme.photographyStudy) {
    assert(entry.image && entry.imagePrompt && !entry.matchPrompt);
    assert(/\.(svg|webp)$/.test(entry.image), entry.image);
    assert(!normalize(entry.imagePrompt).includes(normalize(entry.term)), `${entry.term}: clue reveals answer`);
  }
  for (const activity of theme.activities) {
    assert(activity.visualPractice);
    for (const entry of theme[activity.dataKey]) {
      assert(existsSync(new URL(`../public${entry.image}`, import.meta.url)));
      if (activity.type !== "sentence-gap-type-answer") continue;
      const item = { source: "hub-textbook", topic: theme.id, setId: activity.id, itemId: entry.id, activityType: activity.type, correctAnswer: entry.answer };
      const context = findHubSourceContext(item);
      assert.equal(context.entry.image, entry.image, "Review retains the photo or code diagram.");
      assert.equal(getHubReviewPrompt(item, context), entry.sentence);
      assert(isAcceptedReviewAnswer(entry.answer, getReviewAcceptedAnswers(item, context.entry)));
    }
  }
  assert(theme.photographyPositions.some((entry) => entry.image.endsWith("town-square.webp")));
  const editContext = theme.photographyContexts.find((entry) => entry.answer === "edit");
  assert(editContext?.acceptedAnswers.includes("edited"), "The editing context accepts the natural past-simple answer.");
  assert(!getHubVocabActivity(theme.id, "meaning-matching"), "Visual practice replaces the duplicate meaning exercise.");
});

test("published Recycling uses the complete picture set, reuses topic images and tests all 33 terms in six activities", () => {
  const { theme } = getHubVocabActivity("b1-b2-rubbish-recycling", "recycling-written-recall");
  assert.equal(theme.studentVisible, true);
  assert.equal(theme.activities.length, 6);
  assert.equal(theme.recyclingPictureStudy.length, 33);
  assert.equal(theme.recyclingPictureStudy.filter((entry) => entry.image).length, 24);
  assert.equal(theme.recyclingPictures.length, 23);
  assert.equal(theme.recyclingWritten.length, 33);
  assert.deepEqual(new Set(theme.recyclingWritten.map((entry) => entry.term)), new Set(theme.entries.map((entry) => entry.term)));
  const study = (term) => theme.recyclingPictureStudy.find((entry) => entry.term === term);
  for (const term of ["bottle", "pot", "take out", "throw away"]) assert(study(term).image);
  const date = study("sell-by date");
  assert(date.image && date.studyOnly, "The readable date label belongs in study.");
  assert(!theme.recyclingPictures.some((entry) => entry.term === date.term));
  assert(!theme.recyclingWritten.find((entry) => entry.term === date.term).image, "Written recall must not display its printed answer.");
  assert(!theme.recyclingPictures.some((entry) => entry.term === "waste"), "Synonymous rubbish/waste pictures need different text cues.");
  assert(theme.recyclingWritten.find((entry) => entry.term === "waste").cueText.includes("beginning with w"));
  for (const entry of theme.recyclingWritten) {
    const prompt = entry.imagePrompt || entry.cueText;
    assert.equal((prompt.match(/_____/g) || []).length, 1, entry.term);
    const item = { source: "hub-textbook", topic: theme.id, setId: "recycling-written-recall", itemId: entry.id, activityType: "type-answer", correctAnswer: entry.term };
    const context = findHubSourceContext(item);
    assert.equal(context.entry, entry);
    assert.equal(getHubReviewPrompt(item, context), prompt);
    for (const answer of [entry.term, ...entry.acceptedAnswers]) assert(isAcceptedReviewAnswer(answer, getReviewAcceptedAnswers(item, context.entry)));
  }
  assert(!getHubVocabActivity(theme.id, "meaning-matching"));
});

test("Study and work reuses icons with meaning clues and covers all 38 terms in written practice", () => {
  const { theme } = getHubVocabActivity("b1-b2-study-work", "education-recall");
  assert.equal(theme.studentVisible, false);
  assert.equal(theme.activities.length, 6);
  assert.equal(theme.studyPictureStudy.length, 38);
  assert.equal(theme.studyPictures.length, 18);
  assert.equal(theme.educationRecall.length, 20);
  assert.equal(theme.applicationRecall.length, 18);
  assert.deepEqual(new Set([...theme.educationRecall, ...theme.applicationRecall].map((entry) => entry.answer)), new Set(theme.entries.map((entry) => entry.term)));
  for (const entry of theme.studyPictures) {
    assert(entry.image.endsWith(".webp") && entry.imagePrompt && !entry.matchPrompt);
    assert(!normalize(entry.imagePrompt).includes(normalize(entry.term)), `${entry.term}: clue prints the target word`);
  }
  for (const term of ["dissertation", "thesis"]) assert(theme.studyPictures.find((entry) => entry.term === term).imagePrompt.includes(`beginning with ${term[0]}`));
  for (const term of ["skills", "experience", "attend", "assist", "apprenticeship", "internship", "faculties"]) {
    assert(!theme.studyPictureStudy.find((entry) => entry.term === term).image, `${term}: no forced or misleading picture`);
  }
  for (const activityId of ["education-recall", "application-recall"]) {
    const { activity } = getHubVocabActivity(theme.id, activityId);
    for (const entry of theme[activity.dataKey]) {
      assert.equal((entry.sentence.match(/_____/g) || []).length, 1);
      assert(!entry.sentence.includes(" / "), "Written recall does not retain multiple-choice alternatives.");
      const item = { source: "hub-textbook", topic: theme.id, setId: activityId, itemId: entry.id, activityType: activity.type, correctAnswer: entry.answer };
      const context = findHubSourceContext(item);
      assert.equal(context.entry, entry);
      assert.equal(getHubReviewPrompt(item, context), entry.sentence);
      for (const answer of [entry.answer, ...entry.acceptedAnswers]) assert(isAcceptedReviewAnswer(answer, getReviewAcceptedAnswers(item, context.entry)));
    }
  }
  for (const term of ["covering letter", "job offer", "work permit", "apply for"]) assert(theme.applicationRecall.some((entry) => entry.answer === term), `Recall the complete phrase: ${term}`);
  const previous = theme.applicationContexts.find((entry) => entry.answer === "covering");
  const previousContext = findHubSourceContext({ source: "hub-textbook", topic: theme.id, setId: "application-recall", itemId: previous.id, activityType: "sentence-gap-type-answer", correctAnswer: previous.answer });
  assert.equal(previousContext.entry, previous, "Existing written mistakes still resolve after expanding the pool.");
  assert(!getHubVocabActivity(theme.id, "meaning-matching"));
});

test("word formation requires a missing form rather than a visible ending", () => {
  const adjectiveActivity = getHubVocabActivity("b1-b2-adjective-suffixes", "adjectives-in-context");
  assert.equal(adjectiveActivity.activity.type, "sentence-gap-choice");
  const adjectiveItems = adjectiveActivity.theme[adjectiveActivity.activity.dataKey];
  for (const entry of adjectiveItems) {
    assert(entry.sentence.includes("_____"));
    assert(/\([a-z]+\)/i.test(entry.sentence), "The base word must be supplied.");
    assert(!normalize(entry.sentence).includes(normalize(entry.answer)), "The completed adjective must not be in the prompt.");
    assert(entry.explanation, "Feedback must explain the word form or distinction.");
  }
  const easy = adjectiveItems.find((entry) => entry.answer === "easy");
  assert(easy.sentence.includes("(ease)"));
  assert.deepEqual(easy.options, ["easy", "ease", "easily", "easiness"]);
  assert.equal(getHubVocabActivity("b1-b2-adjective-suffixes", "suffix-sort"), null);

  const reActivity = getHubVocabActivity("b1-b2-rubbish-recycling", "build-re-verbs");
  assert.equal(reActivity.activity.type, "sentence-gap-type-answer");
  for (const entry of reActivity.theme[reActivity.activity.dataKey]) {
    assert(entry.answer.startsWith("re"));
    assert(entry.sentence.includes("_____"));
    assert(!normalize(entry.sentence).includes(normalize(entry.answer)), "The learner must recall the re- verb.");
  }
});

test("phrasal-verb patterns distinguish different meanings of take off", () => {
  const { theme } = getHubVocabActivity("b1-b2-phrasal-verbs", "verb-patterns");
  assert.equal(theme.phrasalPatterns.find((entry) => entry.term === "The plane took off at noon.").category, "No object");
  assert.equal(theme.phrasalPatterns.find((entry) => entry.term === "Take the coat off. / Take it off.").category, "Separable");
  assert(theme.phrasalOrder.every((entry) => entry.explanation));
});

test("the final adjective task covers the bank with standard contextual word formation", () => {
  const { theme, activity } = getHubVocabActivity("b1-b2-adjective-suffixes", "form-adjectives");
  const entries = theme[activity.dataKey];
  assert.equal(activity.type, "sentence-gap-type-answer");
  assert.equal(activity.itemLimit, 20);
  assert.equal(entries.length, 64);
  const answers = new Set(entries.map((entry) => entry.answer));
  for (const word of theme.entries) assert(answers.has(word.term), `Missing core adjective: ${word.term}`);
  for (const answer of ["helpless", "unhelpful", "restless", "unsuccessful", "irresponsible"]) assert(answers.has(answer));
  for (const entry of entries) {
    assert(entry.baseWord && /^[a-z]+$/.test(entry.baseWord));
    assert.equal((entry.sentence.match(/_____/g) || []).length, 1);
    assert(!entry.sentence.startsWith("Form an adjective"));
    assert(!normalize(entry.sentence).includes(normalize(entry.answer)), "The answer must not appear in the gap sentence.");
    const item = { source: "hub-textbook", topic: theme.id, setId: activity.id, itemId: entry.id, activityType: activity.type, correctAnswer: entry.answer };
    const context = findHubSourceContext(item);
    assert.equal(getHubReviewPrompt(item, context), `${entry.sentence} (${entry.baseWord.toUpperCase()})`);
  }
  for (const [answer, variant] of [["lovable", "loveable"], ["colourful", "colorful"], ["recognizable", "recognisable"], ["colourless", "colorless"]]) {
    const entry = entries.find((candidate) => candidate.answer === answer);
    assert(isAcceptedReviewAnswer(variant, getReviewAcceptedAnswers({ correctAnswer: answer, activityType: activity.type }, entry)));
  }
});

test("previous textbook levels remain available", () => {
  assert.deepEqual(["a1", "a2", "a2-b1", "b1"].map((level) => getHubVocabThemes(level).length), [15, 17, 14, 13]);
});

test("Packing has five focused activities and avoids testing printed answers", () => {
  const { theme } = getHubVocabActivity("b1-b2-packing", "packing-picture-flashcards");
  assert.equal(theme.activities.length, 5);
  assert(theme.entries.every((entry) => !entry.image));
  assert.deepEqual(new Set(theme.packingPictureStudy.map((entry) => entry.id)), new Set(theme.entries.map((entry) => entry.id)));
  assert.equal(theme.packingPictures.length, 43);
  assert(!theme.packingPictures.some((entry) => entry.term === "guidebook"));
  assert(theme.packingPictureStudy.find((entry) => entry.term === "guidebook").studyOnly);
  for (const entry of theme.packingPictures) {
    assert(!entry.matchPrompt, "Definitions must not replace the picture in matching.");
    assert(!normalize(entry.imagePrompt).includes(normalize(entry.term)), "Clues must not print the full answer.");
    assert(existsSync(new URL(`../public${entry.image}`, import.meta.url)));
  }
  for (const term of ["unpack", "pack", "wrap", "roll up", "fold", "shampoo", "insect repellent", "deodorant", "travel iron", ...theme.entries.filter((entry) => entry.category === "Documents").map((entry) => entry.term)]) {
    assert(theme.packingPictures.find((entry) => entry.term === term).imagePrompt, `${term} needs context`);
  }
  assert.match(theme.packingPictures.find((entry) => entry.term === "unpack").imagePrompt, /arrived.*out of/);
  for (const id of ["document-purpose", "packing-in-context"]) {
    assert(getHubVocabActivity(theme.id, id), `Preserve the existing activity ${id}`);
  }
  for (const id of ["meaning-flashcards", "meaning-matching", "packing-categories", "packing-recall"]) {
    assert.equal(getHubVocabActivity(theme.id, id), null, `Remove redundant activity ${id}`);
  }
});

test("Packing picture mistake review preserves clues and accepted written variants", () => {
  for (const activityId of ["packing-picture-matching", "packing-picture-recall"]) {
    const { theme, activity } = getHubVocabActivity("b1-b2-packing", activityId);
    for (const entry of theme[activity.dataKey]) {
      const item = { source: "hub-textbook", topic: theme.id, setId: activity.id, itemId: entry.id, activityType: activity.type, correctAnswer: entry.term };
      const context = findHubSourceContext(item);
      assert.equal(context.entry.image, entry.image);
      assert.equal(getHubReviewPrompt(item, context), entry.imagePrompt || "");
      for (const answer of [entry.term, ...entry.acceptedAnswers]) assert(isAcceptedReviewAnswer(answer, getReviewAcceptedAnswers(item, context.entry)));
      if (activity.type === "matching") {
        assert(getHubReviewChoice(item, context));
        assert.equal(getHubReviewInstruction(item, context, true), "Look at the picture and any clue. Choose the matching word or phrase.");
      }
    }
  }
});

test("removed Packing activities do not inflate completion of the condensed menu", () => {
  const progress = Object.fromEntries(["meaning-flashcards", "meaning-matching", "packing-categories", "packing-recall", "packing-picture-flashcards"].map((id) => [`b1-b2-packing:${id}`, { completed: true }]));
  assert.deepEqual(getHubVocabProgressCounts(progress)["b1-b2-packing"], { completed: 1, total: 5 });
  assert.deepEqual(getHubVocabProgressCounts()["b1-b2-packing"], { completed: 0, total: 5 });
});

test("published Shops uses all 26 venues in picture practice and all 32 words in study and writing", () => {
  const { theme } = getHubVocabActivity("b1-b2-shops-services", "shop-picture-flashcards");
  assert.equal(theme.activities.length, 6);
  assert.equal(theme.studentVisible, true, "The reviewed bank should be visible to students.");
  assert.equal(theme.shopPictures.length, 26);
  for (const key of ["shopPictureStudy", "shopWritten"]) {
    assert.deepEqual(new Set(theme[key].map((entry) => entry.id)), new Set(theme.entries.map((entry) => entry.id)));
  }
  for (const entry of theme.shopPictures) {
    assert.equal(entry.matchPrompt, "");
    assert(entry.image.endsWith(".webp"));
    assert(entry.category !== "Shopping phrases");
  }
  for (const term of ["chain store", "charity shop", "pound shop", "craft fair", "outlet", "off-licence", "stationer's"]) assert(theme.shopPictures.find((entry) => entry.term === term)?.image);
  assert(theme.shopWritten.filter((entry) => entry.category !== "Shopping phrases").every((entry) => entry.imagePrompt));
  for (const entry of theme.shopWritten) {
    assert(!normalize(entry.imagePrompt || entry.cueText).includes(normalize(entry.term)), "The clue must not contain the full answer.");
    const activity = getHubVocabActivity(theme.id, "shop-written-recall").activity;
    const item = { source: "hub-textbook", topic: theme.id, setId: activity.id, itemId: entry.id, activityType: activity.type, correctAnswer: entry.term };
    const context = findHubSourceContext(item);
    assert.equal(getHubReviewPrompt(item, context), entry.imagePrompt || entry.cueText);
    for (const answer of [entry.term, ...entry.acceptedAnswers]) assert(isAcceptedReviewAnswer(answer, getReviewAcceptedAnswers(item, context.entry)));
  }
  assert.equal(getHubVocabActivity(theme.id, "shopping-recall"), null);
  for (const id of ["where-to-go", "shopping-phrases", "shop-name-apostrophes"]) assert(getHubVocabActivity(theme.id, id));
});

test("suffix columns replace adjective matching and disambiguate repeated base words", () => {
  const { theme, activity } = getHubVocabActivity("b1-b2-adjective-suffixes", "suffix-columns");
  assert(!theme.activities.some((candidate) => candidate.id === "meaning-matching"));
  assert.equal(activity.type, "word-formation-sort");
  const entries = theme[activity.dataKey];
  assert.equal(entries.length, theme.entries.length);
  assert.deepEqual(new Set(entries.map((entry) => entry.adjective)), new Set(theme.entries.map((entry) => entry.term)));
  for (const entry of entries) {
    const prompt = getWordFormationSortPrompt(entry);
    assert(!prompt.includes(entry.adjective), "The completed adjective is revealed only after placement.");
    const sameBase = entries.filter((candidate) => candidate.baseWord === entry.baseWord);
    if (sameBase.length > 1) {
      assert(entry.cue, "Repeated base words need a meaning cue.");
      assert.equal(new Set(sameBase.map(getWordFormationSortPrompt)).size, sameBase.length);
    }
  }
});

test("suffix placements preserve wrong cards, reveal correct answers and reject duplicate or foreign drops", () => {
  const { theme, activity } = getHubVocabActivity("b1-b2-adjective-suffixes", "suffix-columns");
  const items = theme[activity.dataKey].slice(0, 12);
  const categories = activity.categories;
  const entry = items[0];
  let state = createWordFormationSortState();
  state = wordFormationSortReducer(state, { type: "select", itemId: entry.id, items });
  assert.equal(state.selectedId, entry.id);
  const wrong = categories.find((category) => category.id !== entry.category).id;
  const action = { type: "place", itemId: entry.id, categoryId: wrong, items, categories };
  assert.equal(checkWordFormationPlacement(state, action), "wrong");
  state = wordFormationSortReducer(state, action);
  assert.equal(state.placements[entry.id], undefined);
  assert.equal(state.selectedId, entry.id);
  assert.deepEqual(state.mistakeIds, [entry.id]);
  state = wordFormationSortReducer(state, action);
  assert.deepEqual(state.mistakeIds, [entry.id]);

  const correct = { ...action, categoryId: entry.category };
  state = wordFormationSortReducer(state, correct);
  assert.equal(state.placements[entry.id], entry.category);
  assert.equal(state.selectedId, null);
  assert.equal(state.feedback.status, "correct");
  assert.equal(wordFormationSortReducer(state, correct), state);
  assert.equal(wordFormationSortReducer(state, { ...correct, itemId: "foreign-card" }), state);
  assert.equal(wordFormationSortReducer(state, { ...correct, itemId: items[1].id, categoryId: "unknown-column" }), state);
  for (const item of items.slice(1)) state = wordFormationSortReducer(state, { ...correct, itemId: item.id, categoryId: item.category });
  assert.equal(Object.keys(state.placements).length, items.length);
  assert.deepEqual(state.mistakeIds, [entry.id]);
  assert.deepEqual(wordFormationSortReducer(state, { type: "reset" }), createWordFormationSortState());
});
